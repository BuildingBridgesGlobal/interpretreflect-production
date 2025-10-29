-- ============================================
-- CHECK AUTH.USERS TABLE
-- ============================================

-- 1. Check if info@interpretreflect.com exists in auth.users
SELECT 
  'Check for info@interpretreflect.com' as check_type,
  id,
  email,
  email_confirmed_at,
  created_at,
  confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'info@interpretreflect.com';

-- 2. Show all recent users in auth.users
SELECT 
  'Recent auth.users' as check_type,
  id,
  email,
  email_confirmed_at,
  created_at,
  confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check for unconfirmed users
SELECT 
  'Unconfirmed users' as check_type,
  id,
  email,
  created_at,
  email_confirmed_at,
  confirmed_at
FROM auth.users
WHERE email_confirmed_at IS NULL
  OR confirmed_at IS NULL
ORDER BY created_at DESC;

-- 4. Check trigger status
SELECT 
  'Trigger on auth.users' as check_type,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;
