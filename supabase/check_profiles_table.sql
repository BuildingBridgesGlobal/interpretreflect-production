-- ============================================
-- CHECK PROFILES TABLE STATUS
-- ============================================

-- 1. Count total users vs profiles
SELECT 
  'User vs Profile Count' as check_type,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM profiles) as missing_profiles;

-- 2. Show all profiles with key fields
SELECT 
  id,
  email,
  full_name,
  subscription_status,
  trial_ends_at,
  stripe_customer_id,
  is_admin,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 3. Check for users WITHOUT profiles (should be 0)
SELECT 
  'Users WITHOUT profiles' as issue,
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 4. Check if trigger exists
SELECT 
  'Trigger Status' as check_type,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'
  AND event_object_schema = 'auth'
  AND event_object_table = 'users';

-- 5. Check profile columns
SELECT 
  'Profile Columns' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Check for duplicate stripe_customer_ids (should be 0)
SELECT 
  'Duplicate Stripe Customers' as issue,
  stripe_customer_id,
  COUNT(*) as count,
  array_agg(email) as emails
FROM profiles
WHERE stripe_customer_id IS NOT NULL
GROUP BY stripe_customer_id
HAVING COUNT(*) > 1;

-- 7. Summary
SELECT 
  '✅ SUMMARY' as status,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM profiles) 
    THEN '✅ All users have profiles'
    ELSE '❌ Some users missing profiles'
  END as profile_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    )
    THEN '✅ Trigger exists'
    ELSE '❌ Trigger missing'
  END as trigger_status;
