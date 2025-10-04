-- ============================================
-- RLS POLICY CONSOLIDATION MIGRATION
-- ============================================
-- Goal: One policy per action (SELECT, INSERT, UPDATE, DELETE) per table
-- This improves performance by reducing policy evaluation overhead

-- ============================================
-- 1. REFLECTION_ENTRIES TABLE
-- ============================================

-- Drop existing redundant policies
DROP POLICY IF EXISTS "Users can view own reflections" ON public.reflection_entries;
DROP POLICY IF EXISTS "Users can create own reflections" ON public.reflection_entries;
DROP POLICY IF EXISTS "Users can update own reflections" ON public.reflection_entries;
DROP POLICY IF EXISTS "Users can delete own reflections" ON public.reflection_entries;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reflection_entries;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.reflection_entries;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.reflection_entries;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.reflection_entries;

-- Create consolidated policies (one per action)
CREATE POLICY "reflection_entries_select_own"
ON public.reflection_entries
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "reflection_entries_insert_own"
ON public.reflection_entries
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reflection_entries_update_own"
ON public.reflection_entries
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reflection_entries_delete_own"
ON public.reflection_entries
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- 2. USER_PROFILES TABLE
-- ============================================

-- Drop existing redundant policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;

-- Create consolidated policies
CREATE POLICY "user_profiles_select_own"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "user_profiles_insert_own"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update_own"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. TECHNIQUE_USAGE TABLE (if exists)
-- ============================================

-- Check if table exists before applying policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'technique_usage') THEN
        -- Drop existing policies
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own technique usage" ON public.technique_usage';
        EXECUTE 'DROP POLICY IF EXISTS "Users can create own technique usage" ON public.technique_usage';
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own technique usage" ON public.technique_usage';
        EXECUTE 'DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.technique_usage';
        EXECUTE 'DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.technique_usage';
        EXECUTE 'DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.technique_usage';

        -- Create consolidated policies
        EXECUTE 'CREATE POLICY "technique_usage_select_own" ON public.technique_usage FOR SELECT TO authenticated USING (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "technique_usage_insert_own" ON public.technique_usage FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "technique_usage_update_own" ON public.technique_usage FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    END IF;
END $$;

-- ============================================
-- 4. AFFIRMATIONS TABLE (if exists)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affirmations') THEN
        -- Drop existing policies
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own affirmations" ON public.affirmations';
        EXECUTE 'DROP POLICY IF EXISTS "Users can create own affirmations" ON public.affirmations';
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own affirmations" ON public.affirmations';
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete own affirmations" ON public.affirmations';
        EXECUTE 'DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.affirmations';
        EXECUTE 'DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.affirmations';
        EXECUTE 'DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.affirmations';
        EXECUTE 'DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.affirmations';

        -- Create consolidated policies
        EXECUTE 'CREATE POLICY "affirmations_select_own" ON public.affirmations FOR SELECT TO authenticated USING (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "affirmations_insert_own" ON public.affirmations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "affirmations_update_own" ON public.affirmations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "affirmations_delete_own" ON public.affirmations FOR DELETE TO authenticated USING (auth.uid() = user_id)';
    END IF;
END $$;

-- ============================================
-- 5. SUBSCRIPTIONS TABLE (if exists)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
        -- Drop existing policies
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions';
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions';
        EXECUTE 'DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.subscriptions';
        EXECUTE 'DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.subscriptions';

        -- Create consolidated policies
        EXECUTE 'CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "subscriptions_update_own" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    END IF;
END $$;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- After running this migration, verify the consolidated policies:
/*
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
AND tablename IN ('reflection_entries', 'user_profiles', 'technique_usage', 'affirmations', 'subscriptions')
ORDER BY tablename, cmd;

-- Expected: One policy per action (SELECT, INSERT, UPDATE, DELETE) per table
*/