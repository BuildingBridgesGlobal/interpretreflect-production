-- Create technique_usage table for tracking stress reset tool usage
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS technique_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    technique VARCHAR(100) NOT NULL,

    -- Tracking data
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    completed BOOLEAN DEFAULT false,

    -- Effectiveness metrics
    stress_before INTEGER CHECK (stress_before >= 1 AND stress_before <= 10),
    stress_after INTEGER CHECK (stress_after >= 1 AND stress_after <= 10),
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),

    -- Additional context
    notes TEXT,
    session_context JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX idx_technique_usage_user_id ON technique_usage(user_id);
CREATE INDEX idx_technique_usage_user_technique ON technique_usage(user_id, technique);
CREATE INDEX idx_technique_usage_user_created ON technique_usage(user_id, created_at DESC);
CREATE INDEX idx_technique_usage_completed ON technique_usage(user_id, completed);

-- Enable Row Level Security
ALTER TABLE technique_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own technique usage"
    ON technique_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own technique usage"
    ON technique_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own technique usage"
    ON technique_usage FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own technique usage"
    ON technique_usage FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON technique_usage TO authenticated;
GRANT ALL ON technique_usage TO service_role;

-- Add comment for documentation
COMMENT ON TABLE technique_usage IS 'Tracks usage and effectiveness of stress reset techniques';
COMMENT ON COLUMN technique_usage.technique IS 'Name of the technique (e.g., Box Breathing, Body Check-In, Temperature Shift)';
COMMENT ON COLUMN technique_usage.effectiveness_rating IS 'User rating of how effective the technique was (1-5 scale)';
COMMENT ON COLUMN technique_usage.session_context IS 'Additional JSON data about the session (e.g., breath counts, body parts focused on)';