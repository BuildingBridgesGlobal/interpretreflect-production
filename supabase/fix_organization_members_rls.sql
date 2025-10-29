-- ============================================
-- FIX: Organization Members RLS Policy
-- ============================================
-- The "Users can view own memberships" policy might be conflicting
-- Let's make it more explicit

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view own memberships" ON organization_members;

-- Recreate with better logic
CREATE POLICY "Users can view own memberships"
ON organization_members FOR SELECT
USING (
  user_id = auth.uid()
  OR
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
    AND is_active = true
  )
);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'organization_members';
