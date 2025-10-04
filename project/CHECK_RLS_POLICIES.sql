-- Check RLS policies for reflection_entries
-- Run in Supabase SQL Editor

-- 1. Check current user ID
SELECT auth.uid() as current_user_id;

-- 2. Try to select as the authenticated user
SELECT
    id,
    user_id,
    reflection_id,
    entry_kind,
    created_at
FROM public.reflection_entries;

-- 3. Check if bypassing RLS shows data
-- NOTE: Only works if you're running as a privileged user
SELECT
    id,
    user_id,
    reflection_id,
    entry_kind,
    created_at
FROM public.reflection_entries;

-- 4. Check the exact RLS policies
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
WHERE tablename = 'reflection_entries'
ORDER BY policyname;

-- 5. Test if the RLS policy matches your user
SELECT
    id,
    user_id,
    (auth.uid() = user_id) as "RLS should allow",
    auth.uid() as "Your auth ID",
    reflection_id
FROM public.reflection_entries;