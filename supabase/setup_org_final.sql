-- Setup test organization and make you an admin
-- Using your actual user ID: 20701f05-2dc4-4740-a8a2-4a14c8974882

-- Create organization
INSERT INTO organizations (name, subscription_tier, is_active)
VALUES ('Test Organization', 'enterprise', true)
ON CONFLICT DO NOTHING;

-- Add yourself as owner
INSERT INTO organization_members (
  organization_id,
  user_id,
  role,
  is_active,
  consent_given,
  consent_date
)
VALUES (
  (SELECT id FROM organizations WHERE name = 'Test Organization' LIMIT 1),
  '20701f05-2dc4-4740-a8a2-4a14c8974882'::uuid,
  'owner',
  true,
  true,
  NOW()
)
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Verify it worked
SELECT 
  om.role,
  om.is_active,
  o.name as org_name,
  o.subscription_tier,
  u.email
FROM organization_members om
JOIN organizations o ON o.id = om.organization_id
JOIN auth.users u ON u.id = om.user_id
WHERE om.user_id = '20701f05-2dc4-4740-a8a2-4a14c8974882'::uuid;
