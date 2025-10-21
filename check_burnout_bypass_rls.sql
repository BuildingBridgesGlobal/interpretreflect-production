-- Run this in Supabase SQL Editor
-- This bypasses RLS by using a function with SECURITY DEFINER

-- First, let's check RLS status on the table
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'burnout_assessments';

-- Check what RLS policies exist
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
WHERE tablename = 'burnout_assessments';

-- Now get the actual data (this should work in SQL editor as it uses service role)
SELECT
    id,
    user_id,
    assessment_date,
    total_score,
    risk_level,
    created_at
FROM burnout_assessments
ORDER BY created_at DESC
LIMIT 10;
