-- Test if you can insert into reflection_entries directly
-- Run this in Supabase SQL Editor

-- First, check the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'reflection_entries'
ORDER BY ordinal_position;

-- Check RLS status
SELECT
  tablename,
  rowsecurity as "RLS Enabled",
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'reflection_entries') as "Policy Count"
FROM pg_tables
WHERE tablename = 'reflection_entries';

-- Try to insert a test reflection as the user
-- Replace the user_id with your actual user_id
INSERT INTO reflection_entries (user_id, entry_kind, data)
VALUES (
  '6be736bc-2ec2-487d-8f5f-f8eaacb053c5'::uuid,
  'test_insert',
  '{"test": "Testing direct insert"}'::jsonb
)
RETURNING *;

-- If the above fails, try temporarily disabling RLS (for testing only!)
-- ALTER TABLE reflection_entries DISABLE ROW LEVEL SECURITY;

-- Then try the insert again
-- After testing, re-enable RLS:
-- ALTER TABLE reflection_entries ENABLE ROW LEVEL SECURITY;