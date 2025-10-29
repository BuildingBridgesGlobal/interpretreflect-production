-- Add test members to reach minimum team size (5 members)
-- Run this after setup_org_final.sql

-- First, find your organization ID
DO $$
DECLARE
  org_id UUID;
  test_user_ids UUID[] := ARRAY[
    gen_random_uuid(),
    gen_random_uuid(),
    gen_random_uuid()
  ];
  user_id UUID;
BEGIN
  -- Get the Test Organization ID
  SELECT id INTO org_id FROM organizations WHERE name = 'Test Organization';
  
  IF org_id IS NULL THEN
    RAISE EXCEPTION 'Test Organization not found. Run setup_org_final.sql first.';
  END IF;

  -- Add 3 test members (you already have 2, this brings total to 5)
  FOREACH user_id IN ARRAY test_user_ids
  LOOP
    -- Create a test user profile
    INSERT INTO profiles (id, email, full_name, is_admin, subscription_status)
    VALUES (
      user_id,
      'test_member_' || substr(user_id::text, 1, 8) || '@example.com',
      'Test Member ' || substr(user_id::text, 1, 8),
      false,
      'active'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Add them to the organization
    INSERT INTO organization_members (
      organization_id,
      user_id,
      role,
      is_active,
      consent_given,
      joined_at
    )
    VALUES (
      org_id,
      user_id,
      'member',
      true,
      true,
      NOW()
    )
    ON CONFLICT (organization_id, user_id) DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Added 3 test members to organization %', org_id;
END $$;

-- Verify the member count
SELECT 
  o.name as organization_name,
  COUNT(om.user_id) as total_members,
  COUNT(CASE WHEN om.role = 'owner' THEN 1 END) as owners,
  COUNT(CASE WHEN om.role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN om.role = 'member' THEN 1 END) as members
FROM organizations o
LEFT JOIN organization_members om ON o.id = om.organization_id
WHERE o.name = 'Test Organization'
GROUP BY o.id, o.name;
