-- Check and fix permissions for reflection_entries table
-- Run this in Supabase SQL Editor

-- 1. Check if authenticated role has proper permissions
SELECT
    grantee,
    privilege_type
FROM
    information_schema.role_table_grants
WHERE
    table_name = 'reflection_entries'
    AND grantee = 'authenticated';

-- 2. If permissions are missing, grant them
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reflection_entries TO authenticated;

-- 3. Grant usage on the sequence for ID generation
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. Check RLS policies
SELECT
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'reflection_entries';

-- 5. Make sure RLS is enabled
ALTER TABLE public.reflection_entries ENABLE ROW LEVEL SECURITY;

-- 6. Recreate policies with explicit authenticated role
DROP POLICY IF EXISTS "Users can view own reflections" ON public.reflection_entries;
DROP POLICY IF EXISTS "Users can insert own reflections" ON public.reflection_entries;
DROP POLICY IF EXISTS "Users can update own reflections" ON public.reflection_entries;
DROP POLICY IF EXISTS "Users can delete own reflections" ON public.reflection_entries;

CREATE POLICY "Users can view own reflections" ON public.reflection_entries
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON public.reflection_entries
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON public.reflection_entries
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON public.reflection_entries
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- 7. Test insert permission
-- Replace 'your-user-id-here' with the actual user ID from console logs
/*
INSERT INTO public.reflection_entries (user_id, reflection_id, entry_kind, data)
VALUES (
    'your-user-id-here',
    'test_reflection_123',
    'test',
    '{"test": "data"}'::jsonb
);
*/

-- If successful, delete the test record:
-- DELETE FROM public.reflection_entries WHERE reflection_id = 'test_reflection_123';