-- ============================================
-- STEP 6: ADD MISSING ORGANIZATION RLS POLICIES
-- ============================================
-- Now that organization_members exists, we can add the full RLS policy

CREATE POLICY "Org admins can view their organization"
ON organizations FOR SELECT
USING (
  id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
    AND is_active = true
  )
);

CREATE POLICY "Org owners can update their organization"
ON organizations FOR UPDATE
USING (
  id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() 
    AND role = 'owner'
    AND is_active = true
  )
);

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_organization_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_organizations_timestamp ON organizations;
CREATE TRIGGER update_organizations_timestamp
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_timestamp();
