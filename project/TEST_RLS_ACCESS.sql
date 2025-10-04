-- Test if RLS is blocking access to your data
-- Run each query separately in Supabase SQL Editor

-- 1. Check your current auth user ID
SELECT auth.uid() as your_user_id;

-- 2. Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'burnout_assessments';

-- 3. List all RLS policies on the table
SELECT policyname, permissive, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'burnout_assessments';

-- 4. Test raw query (what your app is trying to do)
SELECT *
FROM burnout_assessments
WHERE user_id = auth.uid();

-- 5. Count what you can see vs what exists
SELECT
  (SELECT COUNT(*) FROM burnout_assessments) as total_in_table,
  (SELECT COUNT(*) FROM burnout_assessments WHERE user_id = auth.uid()) as visible_to_you,
  auth.uid() as your_user_id;

-- 6. Check if user_id in table matches auth.uid() format
SELECT DISTINCT
  user_id,
  auth.uid() as current_user,
  user_id = auth.uid() as ids_match
FROM burnout_assessments
LIMIT 5;