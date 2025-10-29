-- 1. Check if trigger exists
SELECT 
  'TRIGGER STATUS:' as check_type,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if function exists
SELECT 
  'FUNCTION STATUS:' as check_type,
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- 3. Check recent auth.users vs profiles (last 24 hours)
SELECT 
  'RECENT SIGNUPS (last 24h):' as check_type,
  au.id,
  au.email,
  au.created_at as user_created,
  p.id as has_profile,
  CASE 
    WHEN p.id IS NULL THEN '❌ MISSING PROFILE'
    ELSE '✅ HAS PROFILE'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.created_at > NOW() - INTERVAL '24 hours'
ORDER BY au.created_at DESC;

-- 4. Check total counts
SELECT 
  'TOTALS:' as check_type,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN profiles p ON au.id = p.id WHERE p.id IS NULL) as missing_profiles;

-- 5. Check if there are any users created in last hour
SELECT 
  'VERY RECENT (last hour):' as check_type,
  au.id,
  au.email,
  au.created_at,
  p.id as profile_exists
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.created_at > NOW() - INTERVAL '1 hour'
ORDER BY au.created_at DESC;

-- 6. Test if trigger function can be executed manually
SELECT 'TRIGGER FUNCTION TEST:' as check_type;
-- Try to see if function has proper permissions
SELECT has_function_privilege('public.handle_new_user()', 'execute') as can_execute_trigger;
