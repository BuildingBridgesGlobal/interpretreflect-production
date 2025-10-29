-- ============================================
-- STEP 3: CREATE ORGANIZATION INVITATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'owner')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, email)
);
-- Add comments
COMMENT ON TABLE organization_invitations IS 'Pending invitations for interpreters to join organizations';
COMMENT ON COLUMN organization_invitations.token IS 'Unique token for invitation link';
-- Create indexes
CREATE INDEX IF NOT EXISTS idx_org_invitations_org_id ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_org_invitations_pending ON organization_invitations(organization_id, expires_at)
WHERE accepted_at IS NULL;
-- Enable RLS
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
-- Create RLS policies
CREATE POLICY "Org admins can view invitations" ON organization_invitations FOR
SELECT USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'owner')
        AND is_active = true
    )
  );
CREATE POLICY "Org admins can create invitations" ON organization_invitations FOR
INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'owner')
        AND is_active = true
    )
  );
CREATE POLICY "Org admins can delete invitations" ON organization_invitations FOR DELETE USING (
  organization_id IN (
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner')
      AND is_active = true
  )
);
CREATE POLICY "Service role has full access to invitations" ON organization_invitations FOR ALL USING (auth.role() = 'service_role');