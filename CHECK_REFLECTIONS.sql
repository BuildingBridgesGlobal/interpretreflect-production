-- Check if reflections exist in the database
-- Run this in Supabase SQL Editor

-- 1. Count all reflections in the table
SELECT COUNT(*) as total_reflections FROM public.reflection_entries;

-- 2. Show all reflections (first 10)
SELECT
    id,
    user_id,
    reflection_id,
    entry_kind,
    created_at
FROM public.reflection_entries
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check for your specific user
SELECT
    id,
    user_id,
    reflection_id,
    entry_kind,
    created_at
FROM public.reflection_entries
WHERE user_id = '6be736bc-2ec2-487d-8f5f-f8eaacb053c5'
ORDER BY created_at DESC;

-- 4. Check if RLS is blocking reads
-- First, check current user
SELECT auth.uid();

-- 5. Test RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'reflection_entries';