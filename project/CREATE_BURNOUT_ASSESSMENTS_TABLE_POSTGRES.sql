-- Create burnout_assessments table for PostgreSQL/Supabase with Row Level Security
-- Run this in your Supabase SQL Editor

-- Drop table if exists (be careful with this in production!)
-- DROP TABLE IF EXISTS burnout_assessments;

-- Create the burnout_assessments table
CREATE TABLE IF NOT EXISTS burnout_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL,

    -- Individual metric scores (1-5 scale)
    energy_tank INTEGER CHECK (energy_tank >= 1 AND energy_tank <= 5),
    recovery_speed INTEGER CHECK (recovery_speed >= 1 AND recovery_speed <= 5),
    emotional_leakage INTEGER CHECK (emotional_leakage >= 1 AND emotional_leakage <= 5),
    performance_signal INTEGER CHECK (performance_signal >= 1 AND performance_signal <= 5),
    tomorrow_readiness INTEGER CHECK (tomorrow_readiness >= 1 AND tomorrow_readiness <= 5),

    -- Aggregate scores
    total_score VARCHAR(10) NOT NULL, -- Stored as text but represents 5-25
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'moderate', 'high', 'severe')),

    -- Context factors (optional)
    workload_intensity VARCHAR(50),
    emotional_demand VARCHAR(50),
    had_breaks BOOLEAN,
    team_support BOOLEAN,
    difficult_session BOOLEAN,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Ensure one assessment per day per user
    CONSTRAINT unique_daily_assessment UNIQUE (user_id, assessment_date)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_burnout_assessments_user_date
    ON burnout_assessments (user_id, assessment_date DESC);

CREATE INDEX IF NOT EXISTS idx_burnout_assessments_created
    ON burnout_assessments (user_id, created_at DESC);

-- Enable Row Level Security (CRITICAL for Supabase!)
ALTER TABLE burnout_assessments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can insert own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can update own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can delete own burnout assessments" ON burnout_assessments;

-- Create RLS policies (CRITICAL - without these, users can't access their data!)
CREATE POLICY "Users can view own burnout assessments"
    ON burnout_assessments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own burnout assessments"
    ON burnout_assessments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own burnout assessments"
    ON burnout_assessments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own burnout assessments"
    ON burnout_assessments FOR DELETE
    USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON burnout_assessments TO authenticated;
GRANT ALL ON burnout_assessments TO service_role;

-- Add comments for documentation
COMMENT ON TABLE burnout_assessments IS 'Stores daily burnout assessment results from the Daily Burnout Gauge';
COMMENT ON COLUMN burnout_assessments.total_score IS 'Total score (5-25) stored as text for compatibility';
COMMENT ON COLUMN burnout_assessments.risk_level IS 'Risk level: low (20-25), moderate (15-19), high (10-14), severe (5-9)';

-- Create or replace function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_burnout_assessments_updated_at ON burnout_assessments;
CREATE TRIGGER update_burnout_assessments_updated_at
    BEFORE UPDATE ON burnout_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created successfully
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'burnout_assessments'
ORDER BY ordinal_position;