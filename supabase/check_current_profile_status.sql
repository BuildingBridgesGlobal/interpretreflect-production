-- ============================================
-- CHECK CURRENT PROFILE STATUS
-- ============================================
-- Run this BEFORE applying the fix to see the current state

-- 1. Check which tables exist
SELECT 
  'Tables that exist:' as info,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'user_profiles', 'user_preferences')
ORDER BY table_name;

-- 2. Check profiles table structure
SELECT 
  'profiles table columns:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Check user_profiles table structure
SELECT 
  'user_profiles table columns:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 4. Check triggers on auth.users
SELECT 
  'Triggers on auth.users:' as info,
  trigger_name,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- 5. Count users vs profiles
SELECT 
  'User counts:' as info,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM public.profiles) as missing_profiles;

-- 6. Show users WITHOUT profiles (THE PROBLEM)
SELECT 
  '❌ Users WITHOUT profiles:' as info,
  u.id,
  u.email,
  u.created_at,
  'NO PROFILE' as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC
LIMIT 20;

-- 7. Show users WITH profiles (working correctly)
SELECT 
  '✅ Users WITH profiles:' as info,
  u.id,
  u.email,
  u.created_at,
  p.subscription_status,
  p.trial_ends_at
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 8. Check most recent signups
SELECT 
  'Recent signups (last 7 days):' as info,
  u.id,
  u.email,
  u.created_at,
  CASE WHEN p.id IS NOT NULL THEN '✅ Has profile' ELSE '❌ Missing profile' END as profile_status,
  CASE WHEN up.user_id IS NOT NULL OR up.id IS NOT NULL THEN '✅ Has user_profile' ELSE '❌ Missing user_profile' END as user_profile_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_profiles up ON u.id = up.user_id OR u.id = up.id
WHERE u.created_at > NOW() - INTERVAL '7 days'
ORDER BY u.created_at DESC;

-- 9. Summary
DO $
DECLARE
  total_users INTEGER;
  users_with_profiles INTEGER;
  missing_profiles INTEGER;
  percent_missing NUMERIC;
BEGIN
  SELECT COUNT(*) INTO total_users FROM auth.users;
  SELECT COUNT(*) INTO users_with_profiles FROM public.profiles;
  missing_profiles := total_users - users_with_profiles;
  
  IF total_users > 0 THEN
    percent_missing := (missing_profiles::NUMERIC / total_users::NUMERIC) * 100;
  ELSE
    percent_missing := 0;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CURRENT PROFILE STATUS';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total users in auth.users: %', total_users;
  RAISE NOTICE 'Users with profiles: %', users_with_profiles;
  RAISE NOTICE 'Users missing profiles: % (%.1f%%)', missing_profiles, percent_missing;
  RAISE NOTICE '';
  
  IF missing_profiles = 0 THEN
    RAISE NOTICE '✅ All users have profiles - no fix needed!';
  ELSIF missing_profiles < 5 THEN
    RAISE NOTICE '⚠️  A few users missing profiles - minor issue';
  ELSIF percent_missing < 10 THEN
    RAISE NOTICE '⚠️  Some users missing profiles - needs attention';
  ELSE
    RAISE NOTICE '🚨 CRITICAL: Many users missing profiles!';
    RAISE NOTICE '   Run fix_profile_creation_CRITICAL.sql immediately!';
  END IF;
  
  RAISE NOTICE '========================================';
END $;
