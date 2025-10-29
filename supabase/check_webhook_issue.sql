-- Check if profiles exist for the customers that webhook couldn't find
-- Customer IDs from the error logs:
-- cus_TJr3b78dc7Huy0
-- cus_TJqr0S9TIMp6sO

SELECT 
  'Profiles with these stripe_customer_ids:' as check_type;

SELECT 
  id,
  email,
  stripe_customer_id,
  subscription_status,
  created_at
FROM profiles
WHERE stripe_customer_id IN ('cus_TJr3b78dc7Huy0', 'cus_TJqr0S9TIMp6sO');

-- Check all profiles to see which ones have stripe_customer_id set
SELECT 
  'All profiles and their stripe_customer_id status:' as check_type;

SELECT 
  id,
  email,
  stripe_customer_id,
  subscription_status,
  CASE 
    WHEN stripe_customer_id IS NULL THEN '❌ NO STRIPE ID'
    ELSE '✅ HAS STRIPE ID'
  END as status
FROM profiles
ORDER BY created_at DESC;

-- Check auth.users to see if these users exist
SELECT 
  'Recent auth.users:' as check_type;

SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
