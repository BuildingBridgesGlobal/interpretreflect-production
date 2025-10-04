-- Complete fix for burnout_assessments table permissions
-- Run this entire script in your Supabase SQL editor

-- Step 1: First check if the table exists and what columns it has
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'burnout_assessments';

-- Step 2: Enable RLS on the table
ALTER TABLE burnout_assessments ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can insert own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can update own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can delete own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Enable read access for users" ON burnout_assessments;
DROP POLICY IF EXISTS "Enable insert access for users" ON burnout_assessments;
DROP POLICY IF EXISTS "Enable update access for users" ON burnout_assessments;
DROP POLICY IF EXISTS "Enable delete access for users" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can read own data" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can write own data" ON burnout_assessments;

-- Step 4: Create simple, permissive policies for authenticated users
-- Policy 1: Allow authenticated users to SELECT their own records
CREATE POLICY "authenticated_users_select_own" ON burnout_assessments
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy 2: Allow authenticated users to INSERT their own records
CREATE POLICY "authenticated_users_insert_own" ON burnout_assessments
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Allow authenticated users to UPDATE their own records
CREATE POLICY "authenticated_users_update_own" ON burnout_assessments
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow authenticated users to DELETE their own records
CREATE POLICY "authenticated_users_delete_own" ON burnout_assessments
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Step 5: Grant permissions to authenticated role
GRANT ALL ON burnout_assessments TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 6: Test the policies with your actual user ID
-- Replace 'YOUR_USER_ID' with your actual user ID from the error message
-- For you, it should be: 6be736bc-2ec2-487d-8f5f-f8eaacb053c5

-- First, let's check what auth.uid() returns for your session
SELECT auth.uid() as current_user_id;

-- Test if you can query data (this simulates what your app is doing)
SELECT * FROM burnout_assessments
WHERE user_id = auth.uid()
LIMIT 1;

-- Step 7: If the above still doesn't work, let's check if there's data
-- Count all records in the table (as postgres/admin)
SELECT COUNT(*) as total_records FROM burnout_assessments;

-- Count records for your specific user
SELECT COUNT(*) as user_records
FROM burnout_assessments
WHERE user_id = '6be736bc-2ec2-487d-8f5f-f8eaacb053c5';

-- Step 8: Insert a test record to ensure write access works
INSERT INTO burnout_assessments (
    user_id,
    assessment_date,
    burnout_score,
    total_score,
    risk_level,
    energy_tank,
    recovery_speed,
    emotional_leakage,
    performance_signal,
    tomorrow_readiness,
    created_at
) VALUES (
    auth.uid(),
    NOW(),
    5.0,
    '15',
    'moderate',
    3,
    3,
    3,
    3,
    3,
    NOW()
) ON CONFLICT DO NOTHING
RETURNING *;

-- Step 9: Verify all policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'burnout_assessments';

-- Step 10: Check if RLS is actually enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'burnout_assessments';

-- If you see rowsecurity = false, run this again:
-- ALTER TABLE burnout_assessments ENABLE ROW LEVEL SECURITY;

-- Final verification: This should return TRUE
SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'burnout_assessments'
    AND policyname LIKE 'authenticated_users_%'
);