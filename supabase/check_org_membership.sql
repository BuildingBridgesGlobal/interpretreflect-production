-- Check if current user has any organization memberships
-- Run this in Supabase SQL Editor to see if you're set up as an org admin

SELECT 
  om.id,
  om.user_id,
  om.organization_id,
  om.role,
  om.is_active,
  o.name as organization_name,
  o.subscription_tier
FROM organization_members om
LEFT JOIN organizations o ON o.id = om.organization_id
WHERE om.user_id = auth.uid()
ORDER BY om.created_at DESC;
