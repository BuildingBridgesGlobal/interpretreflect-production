-- ============================================
-- DIAGNOSE PROFILE CREATION ISSUE
-- ============================================
-- Run this to understand what's happening with profile creation

-- 1. Check which profile table structure exists
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('profiles', 'user_profiles')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 2. Check for triggers on auth.users
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth'
ORDER BY trigger_name;

-- 3. Check if the trigger functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%user%profile%'
  OR routine_name LIKE '%user%preference%'
  OR routine_name LIKE '%user%subscription%'
ORDER BY routine_name;

-- 4. Test if a profile gets created for a test user
-- (Don't run this part - just for reference)
-- SELECT * FROM user_profiles WHERE user_id = 'YOUR_USER_ID';
-- SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';

-- 5. Check recent auth.users entries
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 6. Check if profiles exist for recent users
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as user_created,
  up.id as profile_id,
  up.created_at as profile_created,
  CASE 
    WHEN up.id IS NULL THEN '❌ NO PROFILE'
    ELSE '✅ HAS PROFILE'
  END as status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
ORDER BY u.created_at DESC
LIMIT 10;

-- 7. Check for profiles table (alternative name)
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as user_created,
  p.id as profile_id,
  p.created_at as profile_created,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE'
    ELSE '✅ HAS PROFILE'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;
