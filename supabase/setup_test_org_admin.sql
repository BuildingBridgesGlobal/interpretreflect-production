-- Setup test organization and make current user an admin
-- Run this in Supabase SQL Editor while logged in
-- Step 1: Create a test organization
INSERT INTO organizations (name, subscription_tier, is_active)
VALUES ('Test Organization', 'enterprise', true) ON CONFLICT DO NOTHING
RETURNING id;
-- Step 2: Add yourself as owner/admin
-- Replace the organization_id with the ID from step 1 if needed
INSERT INTO organization_members (
        organization_id,
        user_id,
        role,
        is_active,
        consent_given,
        consent_date
    )
SELECT (
        SELECT id
        FROM organizations
        WHERE name = 'Test Organization'
        LIMIT 1
    ), auth.uid(), 'owner', true,
    true,
    NOW()
WHERE NOT EXISTS (
        SELECT 1
        FROM organization_members
        WHERE user_id = auth.uid()
            AND organization_id = (
                SELECT id
                FROM organizations
                WHERE name = 'Test Organization'
                LIMIT 1
            )
    );
-- Step 3: Verify it worked
SELECT om.role,
    om.is_active,
    o.name as org_name,
    o.subscription_tier
FROM organization_members om
    JOIN organizations o ON o.id = om.organization_id
WHERE om.user_id = auth.uid();