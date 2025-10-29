-- Fix the circular reference in organization_members RLS policies
-- This removes the problematic subquery from the "Users can view own memberships" policy

DROP POLICY IF EXISTS "Users can view own memberships" ON organization_members;

-- Create a simple policy without circular reference
-- Users can only see their own membership records
CREATE POLICY "Users can view own memberships"
ON organization_members FOR SELECT
USING (user_id = auth.uid());
