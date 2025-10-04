-- Check if your burnout data is being saved
-- Run this in Supabase SQL Editor after taking an assessment

-- 1. Show ALL records in the table (bypasses RLS as admin)
SELECT
    id,
    user_id,
    assessment_date,
    total_score,
    burnout_score,
    risk_level,
    symptoms,
    energy_tank,
    created_at
FROM burnout_assessments
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check what the current authenticated user can see
SELECT
    id,
    assessment_date,
    total_score,
    risk_level,
    auth.uid() as my_user_id
FROM burnout_assessments
WHERE user_id = auth.uid()
ORDER BY assessment_date DESC;

-- 3. Find records for today
SELECT
    id,
    user_id,
    assessment_date,
    total_score,
    risk_level,
    created_at
FROM burnout_assessments
WHERE DATE(assessment_date) = CURRENT_DATE
ORDER BY created_at DESC;