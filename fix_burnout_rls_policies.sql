-- ====================================================================
-- COMPREHENSIVE FIX FOR BURNOUT ASSESSMENTS RLS POLICIES
-- ====================================================================
-- This script fixes the query timeout issue caused by problematic RLS policies
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/kvguxuxanpynwdffpssm/sql/new
-- ====================================================================

-- Step 1: Drop ALL existing policies on burnout_assessments
-- This ensures we start with a clean slate
DROP POLICY IF EXISTS "admin_read_all_burnout" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can view own assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can insert own assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can update own assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can delete own assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can view own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can insert own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can update own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can delete own burnout assessments" ON burnout_assessments;

-- Step 2: Verify RLS is enabled (should already be enabled)
ALTER TABLE burnout_assessments ENABLE ROW LEVEL SECURITY;

-- Step 3: Create SIMPLE, EFFICIENT policies without subqueries
-- These policies are optimized to avoid query hangs

-- SELECT policy: Users can only view their own assessments
CREATE POLICY "burnout_select_own" ON burnout_assessments
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT policy: Users can only insert their own assessments
CREATE POLICY "burnout_insert_own" ON burnout_assessments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: Users can only update their own assessments
CREATE POLICY "burnout_update_own" ON burnout_assessments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy: Users can only delete their own assessments
CREATE POLICY "burnout_delete_own" ON burnout_assessments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 4: Verify the policies were created successfully
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'burnout_assessments'
ORDER BY policyname;

-- Step 5: Test query (should return results immediately)
SELECT
    id,
    user_id,
    assessment_date,
    total_score,
    risk_level,
    created_at
FROM burnout_assessments
WHERE user_id = auth.uid()
ORDER BY assessment_date DESC
LIMIT 10;

-- ====================================================================
-- EXPLANATION OF THE FIX:
-- ====================================================================
-- The original "admin_read_all_burnout" policy had a subquery like:
--   EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND ...)
--
-- This subquery was causing PostgreSQL to hang because:
-- 1. It creates a correlated subquery that's evaluated for every row
-- 2. The profiles table lookup adds significant overhead
-- 3. If there are any indexes or query plan issues, it can timeout
--
-- The new policies are MUCH simpler:
-- - They only use auth.uid() = user_id (direct comparison)
-- - No subqueries to other tables
-- - PostgreSQL can optimize these with simple index lookups
--
-- Result: Queries should now return in milliseconds instead of timing out
-- ====================================================================
