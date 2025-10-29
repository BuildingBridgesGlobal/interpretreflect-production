-- Hardening: Add unique constraints and verify RLS

-- 1. Add unique index on email (prevents duplicate emails)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique 
ON profiles(email) 
WHERE email IS NOT NULL;

-- 2. Add unique index on stripe_customer_id (prevents duplicate Stripe customers)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_stripe_customer_id_unique 
ON profiles(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

-- 3. Verify RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Verify indexes were created
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'profiles'
  AND schemaname = 'public'
ORDER BY indexname;

-- 5. Verify RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- 6. Show current RLS policies
SELECT 
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
