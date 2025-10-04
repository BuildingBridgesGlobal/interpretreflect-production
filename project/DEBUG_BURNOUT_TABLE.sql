-- Debug script to check burnout_assessments table and RLS
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if table exists and its structure
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'burnout_assessments'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if RLS is enabled
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'burnout_assessments'
AND schemaname = 'public';

-- 3. Check existing RLS policies
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'burnout_assessments'
AND schemaname = 'public';

-- 4. Count total records in table (as service role, bypasses RLS)
SELECT COUNT(*) as total_records
FROM burnout_assessments;

-- 5. Get sample data (as service role, bypasses RLS)
-- This will show if data exists at all
SELECT
    id,
    user_id,
    assessment_date,
    total_score,
    risk_level,
    created_at
FROM burnout_assessments
ORDER BY created_at DESC
LIMIT 5;

-- 6. Test what current user can see (respects RLS)
-- This simulates what your app sees
SELECT
    COUNT(*) as visible_records,
    auth.uid() as current_user_id
FROM burnout_assessments
WHERE user_id = auth.uid();

-- 7. Check if your user_id matches what's in the table
SELECT DISTINCT
    user_id,
    COUNT(*) as record_count
FROM burnout_assessments
GROUP BY user_id
ORDER BY record_count DESC;

-- 8. Test if RLS policy is working
-- This should return your records if RLS is configured correctly
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