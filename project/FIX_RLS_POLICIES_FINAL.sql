-- CRITICAL FIX: Fix RLS policies for burnout_assessments table
-- Run this entire script in Supabase SQL Editor

-- 1. First, temporarily disable RLS to clean up
ALTER TABLE burnout_assessments DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can insert own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can update own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can delete own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON burnout_assessments;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON burnout_assessments;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON burnout_assessments;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON burnout_assessments;

-- 3. Re-enable RLS
ALTER TABLE burnout_assessments ENABLE ROW LEVEL SECURITY;

-- 4. Create simple, permissive policies that WILL work
-- These policies use auth.uid() which returns the current user's ID

-- Allow users to SELECT their own records
CREATE POLICY "Users can select own records"
ON burnout_assessments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to INSERT their own records
CREATE POLICY "Users can insert own records"
ON burnout_assessments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE their own records
CREATE POLICY "Users can update own records"
ON burnout_assessments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE their own records
CREATE POLICY "Users can delete own records"
ON burnout_assessments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Grant necessary permissions
GRANT ALL ON burnout_assessments TO authenticated;
GRANT ALL ON burnout_assessments TO anon;
GRANT ALL ON burnout_assessments TO service_role;

-- 6. Verify the policies are created
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

-- 7. Test if you can now see your own data
SELECT
    id,
    user_id,
    assessment_date,
    total_score,
    risk_level,
    energy_tank,
    auth.uid() as current_user_id
FROM burnout_assessments
WHERE user_id = auth.uid()
ORDER BY assessment_date DESC
LIMIT 5;

-- 8. Final check - count accessible records
SELECT
    COUNT(*) as your_records,
    auth.uid() as your_user_id
FROM burnout_assessments
WHERE user_id = auth.uid();

-- If the last query returns 0 records but you know data exists,
-- check if the user_id format matches
SELECT DISTINCT
    user_id,
    LENGTH(user_id::text) as id_length,
    auth.uid() as auth_user_id,
    LENGTH(auth.uid()::text) as auth_id_length,
    user_id = auth.uid() as ids_match
FROM burnout_assessments
LIMIT 5;