-- Setup test organization and make you an admin
-- STEP 1: First, get your user ID by running this query:
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL_HERE';

-- STEP 2: Copy your user ID from above, then run this (replace YOUR_USER_ID):

-- Create organization
INSERT INTO organizations (name, subscription_tier, is_active)
VALUES ('Test Organization', 'enterprise', true)
ON CONFLICT DO NOTHING;

-- Add yourself as owner (REPLACE 'YOUR_USER_ID' with actual UUID from step 1)
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
  'YOUR_USER_ID'::uuid,  -- REPLACE THIS with your actual user ID
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
WHERE om.user_id = 'YOUR_USER_ID'::uuid;  -- REPLACE THIS too
