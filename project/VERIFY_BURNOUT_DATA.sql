-- Run this in Supabase SQL Editor to verify your burnout data
-- This will show you exactly what's in your database

-- 1. Check if you have any data at all (bypasses RLS as admin)
SELECT
    COUNT(*) as total_assessments,
    COUNT(DISTINCT user_id) as unique_users,
    MIN(assessment_date) as earliest_assessment,
    MAX(assessment_date) as latest_assessment
FROM burnout_assessments;

-- 2. Show the most recent 10 assessments (admin view)
SELECT
    id,
    user_id,
    assessment_date,
    total_score,
    burnout_score,
    risk_level,
    created_at
FROM burnout_assessments
ORDER BY assessment_date DESC
LIMIT 10;

-- 3. Check what the authenticated user can see (with RLS)
SELECT
    COUNT(*) as visible_assessments,
    auth.uid() as your_user_id
FROM burnout_assessments
WHERE user_id = auth.uid();

-- 4. Show your assessments if any (with RLS)
SELECT
    id,
    assessment_date,
    total_score,
    burnout_score,
    risk_level
FROM burnout_assessments
WHERE user_id = auth.uid()
ORDER BY assessment_date DESC
LIMIT 10;

-- 5. Check RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'burnout_assessments'
ORDER BY policyname;

-- 6. Debug: Show your user ID vs what's in the table
SELECT DISTINCT
    user_id as stored_user_id,
    auth.uid() as current_auth_id,
    user_id = auth.uid() as ids_match
FROM burnout_assessments
LIMIT 5;