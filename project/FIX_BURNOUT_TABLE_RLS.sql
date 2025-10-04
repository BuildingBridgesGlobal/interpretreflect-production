-- Fix Row Level Security for existing burnout_assessments table
-- Run this if your table exists but users can't see their data

-- Enable Row Level Security (if not already enabled)
ALTER TABLE burnout_assessments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them fresh)
DROP POLICY IF EXISTS "Users can view own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can insert own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can update own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can delete own burnout assessments" ON burnout_assessments;

-- Create RLS policies that allow users to access ONLY their own data
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

-- Grant permissions to authenticated users
GRANT ALL ON burnout_assessments TO authenticated;
GRANT ALL ON burnout_assessments TO service_role;

-- Verify RLS is enabled and policies are created
SELECT
    schemaname,
    tablename,
    rowsecurity,
    policies
FROM pg_tables t
LEFT JOIN LATERAL (
    SELECT array_agg(policyname) as policies
    FROM pg_policies p
    WHERE p.schemaname = t.schemaname
    AND p.tablename = t.tablename
) p ON true
WHERE tablename = 'burnout_assessments';

-- Test query to see if you can access your own data
-- This should return your assessments if RLS is working correctly
SELECT
    id,
    assessment_date,
    total_score,
    risk_level,
    created_at
FROM burnout_assessments
WHERE user_id = auth.uid()
ORDER BY assessment_date DESC
LIMIT 10;