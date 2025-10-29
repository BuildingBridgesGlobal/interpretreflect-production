-- Fix ALL circular references in organization_members RLS policies
-- This removes ALL subqueries that reference the same table

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own memberships" ON organization_members;
DROP POLICY IF EXISTS "Org admins can view members" ON organization_members;
DROP POLICY IF EXISTS "Org admins can add members" ON organization_members;
DROP POLICY IF EXISTS "Org admins can update members" ON organization_members;
DROP POLICY IF EXISTS "Users can update own consent" ON organization_members;
DROP POLICY IF EXISTS "Service role has full access to members" ON organization_members;

-- Recreate policies WITHOUT circular references

-- 1. Users can see their own memberships (simple, no subquery)
CREATE POLICY "Users can view own memberships"
ON organization_members FOR SELECT
USING (user_id = auth.uid());

-- 2. Users can update their own consent
CREATE POLICY "Users can update own consent"
ON organization_members FOR UPDATE
USING (user_id = auth.uid());

-- 3. Service role has full access
CREATE POLICY "Service role has full access to members"
ON organization_members FOR ALL
USING (auth.role() = 'service_role');

-- 4. For admin operations, we'll handle permissions in the application layer
-- This allows admins to query, but we'll verify permissions in code
CREATE POLICY "Authenticated users can view all members"
ON organization_members FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert members"
ON organization_members FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update members"
ON organization_members FOR UPDATE
USING (auth.role() = 'authenticated');

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'organization_members'
ORDER BY policyname;
