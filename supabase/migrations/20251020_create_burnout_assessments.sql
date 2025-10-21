-- Create burnout_assessments table for tracking daily wellness checks
CREATE TABLE IF NOT EXISTS burnout_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL,
  burnout_score DECIMAL(3,2) CHECK (burnout_score >= 0 AND burnout_score <= 10),
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  symptoms JSONB DEFAULT '{}',
  recovery_recommendations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for burnout_assessments
CREATE INDEX IF NOT EXISTS idx_burnout_user_id ON burnout_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_burnout_date ON burnout_assessments(assessment_date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE burnout_assessments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can insert own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can update own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can delete own burnout assessments" ON burnout_assessments;

-- Create RLS policies for burnout_assessments
CREATE POLICY "Users can view own burnout assessments" ON burnout_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own burnout assessments" ON burnout_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own burnout assessments" ON burnout_assessments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own burnout assessments" ON burnout_assessments
  FOR DELETE USING (auth.uid() = user_id);

-- Add helpful comment
COMMENT ON TABLE burnout_assessments IS 'Stores burnout assessment results and risk levels';
