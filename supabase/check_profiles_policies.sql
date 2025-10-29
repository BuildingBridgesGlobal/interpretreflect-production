-- Check profiles table RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Test the actual query
SELECT is_admin, subscription_status, trial_started_at, trial_ends_at
FROM profiles
WHERE id = '20701f05-2dc4-4740-a8a2-4a14c8974882'::uuid;
