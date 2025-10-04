-- Check if burnout_assessments table exists and has data
SELECT
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users
FROM burnout_assessments;

-- Check RLS status on the table
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'burnout_assessments';

-- Check existing RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'burnout_assessments';

-- Check if your user has access to any records
-- Replace with your actual user ID from the console logs
SELECT
    id,
    user_id,
    assessment_date,
    burnout_score,
    total_score,
    risk_level,
    created_at
FROM burnout_assessments
WHERE user_id = '6be736bc-2ec2-487d-8f5f-f8eaacb053c5'
ORDER BY assessment_date DESC
LIMIT 5;

-- If RLS is blocking, temporarily check without RLS (admin only)
-- This will show if data exists but is blocked by RLS
SELECT
    'Data exists but may be blocked by RLS' as status,
    COUNT(*) as total_records_without_rls
FROM burnout_assessments;

-- Fix RLS policies if needed
-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view their own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can insert their own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can update their own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can delete their own burnout assessments" ON burnout_assessments;

-- Create new comprehensive policies
CREATE POLICY "Users can view their own burnout assessments"
ON burnout_assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own burnout assessments"
ON burnout_assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own burnout assessments"
ON burnout_assessments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own burnout assessments"
ON burnout_assessments FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS
ALTER TABLE burnout_assessments ENABLE ROW LEVEL SECURITY;

-- Verify the fix
SELECT
    'After RLS fix' as status,
    COUNT(*) as accessible_records
FROM burnout_assessments
WHERE user_id = auth.uid();