-- ============================================
-- FIX WEBHOOK RLS ISSUE
-- ============================================
-- The webhook needs to be able to create profiles
-- using the service role (admin)

-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create a new policy that allows both users AND service role
CREATE POLICY "Users and service role can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = id OR auth.role() = 'service_role'
);

-- Verify the policy
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
  AND policyname = 'Users and service role can insert profiles';
