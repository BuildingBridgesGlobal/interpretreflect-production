-- ============================================
-- STEP 2: CREATE ORGANIZATION MEMBERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'owner')),
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE,
  consent_version TEXT DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(organization_id, user_id)
);

-- Add comments
COMMENT ON TABLE organization_members IS 'Links interpreters to organizations with role-based access';
COMMENT ON COLUMN organization_members.consent_given IS 'Explicit consent for aggregate data tracking - REQUIRED';
COMMENT ON COLUMN organization_members.role IS 'member=tracked interpreter, admin=dashboard access, owner=full control';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_active ON organization_members(organization_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(organization_id, role);
CREATE INDEX IF NOT EXISTS idx_org_members_consent ON organization_members(organization_id, consent_given) WHERE consent_given = true;

-- Enable RLS
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Org admins can view members"
ON organization_members FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
    AND is_active = true
  )
);

CREATE POLICY "Users can view own memberships"
ON organization_members FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Org admins can add members"
ON organization_members FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
    AND is_active = true
  )
);

CREATE POLICY "Org admins can update members"
ON organization_members FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
    AND is_active = true
  )
);

CREATE POLICY "Users can update own consent"
ON organization_members FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Service role has full access to members"
ON organization_members FOR ALL
USING (auth.role() = 'service_role');
