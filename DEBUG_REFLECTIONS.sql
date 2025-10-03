-- Debug why reflections aren't persisting
-- Run each query separately in Supabase SQL Editor

-- 1. Check if ANY data exists in the table
SELECT COUNT(*) as total_count FROM public.reflection_entries;

-- 2. Try to manually insert a test reflection
INSERT INTO public.reflection_entries (
    user_id,
    reflection_id,
    entry_kind,
    data,
    created_at
) VALUES (
    '6be736bc-2ec2-487d-8f5f-f8eaacb053c5',
    'test_manual_insert_' || gen_random_uuid()::text,
    'pre_assignment_prep',
    '{"test": "manual insert from SQL"}'::jsonb,
    NOW()
) RETURNING *;

-- 3. Check if the manual insert worked
SELECT * FROM public.reflection_entries
WHERE user_id = '6be736bc-2ec2-487d-8f5f-f8eaacb053c5'
ORDER BY created_at DESC;

-- 4. Check table constraints
SELECT
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'reflection_entries'
AND nsp.nspname = 'public';

-- 5. Check if there are any triggers that might be interfering
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'reflection_entries';