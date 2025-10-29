-- Check all users and their profiles
SELECT 
  au.id,
  au.email,
  au.created_at as user_created,
  au.email_confirmed_at,
  p.id as profile_id,
  p.email as profile_email,
  p.full_name,
  p.subscription_status,
  p.created_at as profile_created,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE'
    ELSE '✅ HAS PROFILE'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- Count totals
SELECT 
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profiles,
  COUNT(*) - COUNT(p.id) as users_without_profiles
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id;
