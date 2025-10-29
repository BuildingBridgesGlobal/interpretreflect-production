-- CLEAN UP: Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Profiles insert own" ON profiles;
DROP POLICY IF EXISTS "Profiles update own" ON profiles;
DROP POLICY IF EXISTS "Service role full access" ON profiles;
DROP POLICY IF EXISTS "Service role has full access" ON profiles;
DROP POLICY IF EXISTS "Users and service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select_combined" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Allow service role full access" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Verify all policies are gone
SELECT 'Existing policies (should be empty):' as status;
SELECT policyname FROM pg_policies WHERE tablename = 'profiles';

-- Keep RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create ONLY 4 simple, non-conflicting policies

-- 1. Service role has full access (for webhooks and admin operations)
CREATE POLICY "service_role_all_access"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Users can SELECT their own profile
CREATE POLICY "users_select_own"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 3. Users can UPDATE their own profile
CREATE POLICY "users_update_own"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Allow INSERT during signup (trigger needs this)
CREATE POLICY "allow_insert_on_signup"
ON profiles
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Show final policies
SELECT 
  '✅ New policies created:' as status;

SELECT 
  policyname,
  cmd as operation,
  roles,
  CASE 
    WHEN cmd = 'ALL' THEN '🔓 Full access'
    WHEN cmd = 'SELECT' THEN '👁️ Read only'
    WHEN cmd = 'UPDATE' THEN '✏️ Update only'
    WHEN cmd = 'INSERT' THEN '➕ Insert only'
  END as description
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
