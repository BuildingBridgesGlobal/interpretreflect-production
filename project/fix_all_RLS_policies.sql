-- Fix RLS policies for all tables to ensure auth works properly
-- Run this in Supabase SQL Editor to fix sign-in issues

-- ============================================
-- 1. REFLECTION_ENTRIES TABLE (already done, but let's ensure it's correct)
-- ============================================
ALTER TABLE reflection_entries ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can insert their own reflections" ON reflection_entries;
DROP POLICY IF EXISTS "Users can view their own reflections" ON reflection_entries;
DROP POLICY IF EXISTS "Users can update their own reflections" ON reflection_entries;
DROP POLICY IF EXISTS "Users can delete their own reflections" ON reflection_entries;

CREATE POLICY "Users can insert their own reflections"
ON reflection_entries FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reflections"
ON reflection_entries FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections"
ON reflection_entries FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections"
ON reflection_entries FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- 2. STRESS_RESET_LOGS TABLE (if it exists)
-- ============================================
-- Check if table exists first
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stress_reset_logs') THEN
        ALTER TABLE stress_reset_logs ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can insert their own logs" ON stress_reset_logs;
        DROP POLICY IF EXISTS "Users can view their own logs" ON stress_reset_logs;

        CREATE POLICY "Users can insert their own logs"
        ON stress_reset_logs FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can view their own logs"
        ON stress_reset_logs FOR SELECT TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- 3. DAILY_ACTIVITY TABLE (if it exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_activity') THEN
        ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can manage their own activity" ON daily_activity;

        CREATE POLICY "Users can manage their own activity"
        ON daily_activity FOR ALL TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- 4. WELLNESS_METRICS TABLE (if it exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wellness_metrics') THEN
        ALTER TABLE wellness_metrics ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can manage their own metrics" ON wellness_metrics;

        CREATE POLICY "Users can manage their own metrics"
        ON wellness_metrics FOR ALL TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- 5. USER_PROFILES TABLE (if it exists) - IMPORTANT FOR AUTH
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
        DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
        DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

        -- Allow users to create their profile on sign up
        CREATE POLICY "Users can insert their own profile"
        ON user_profiles FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = user_id);

        -- Allow users to view their own profile
        CREATE POLICY "Users can view their own profile"
        ON user_profiles FOR SELECT TO authenticated
        USING (auth.uid() = user_id);

        -- Allow users to update their own profile
        CREATE POLICY "Users can update their own profile"
        ON user_profiles FOR UPDATE TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- 6. AFFIRMATIONS TABLE (if it exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'affirmations') THEN
        ALTER TABLE affirmations ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Anyone can view affirmations" ON affirmations;
        DROP POLICY IF EXISTS "Authenticated users can insert affirmations" ON affirmations;

        -- Affirmations might be shared, so allow all to view
        CREATE POLICY "Anyone can view affirmations"
        ON affirmations FOR SELECT TO anon, authenticated
        USING (true);

        -- Only authenticated users can insert
        CREATE POLICY "Authenticated users can insert affirmations"
        ON affirmations FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- 7. DISABLE RLS ON TABLES THAT DON'T NEED IT
-- ============================================
-- If you have any lookup tables or shared data tables that don't need RLS,
-- you can disable it to avoid issues:

-- Example (uncomment if needed):
-- ALTER TABLE some_shared_table DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. CHECK FOR OTHER TABLES WITH RLS ENABLED BUT NO POLICIES
-- ============================================
-- This query will show you all tables with RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- ============================================
-- IMPORTANT: After running this, check if there are any other tables
-- with RLS enabled that don't have policies. Those will block all access!
-- ============================================