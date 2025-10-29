-- ============================================
-- ENTERPRISE DASHBOARD - DATABASE SCHEMA
-- ============================================
-- Creates tables for multi-tenant organization management
-- Supports aggregate-only analytics for company dashboards
-- Version: 1.0
-- Date: 2025-10-25

-- ============================================
-- 1. ORGANIZATIONS TABLE
-- ============================================
-- Stores company/organization information
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'enterprise' CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')),
  custom_pricing DECIMAL(10,2), -- Custom negotiated price
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  
  -- Settings for dashboard and alerts
  settings JSONB DEFAULT '{
    "alert_threshold_burnout": 70,
    "alert_threshold_low_confidence": 30,
    "alert_threshold_declining_trend": 15,
    "data_retention_days": 365,
    "export_enabled": true,
    "weekly_digest_enabled": true,
    "weekly_digest_day": "monday",
    "minimum_team_size": 5
  }'::jsonb,
  
  -- Contact information
  primary_contact_email TEXT,
  primary_contact_name TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE organizations IS 'Enterprise organizations/companies that purchase team dashboards';
COMMENT ON COLUMN organizations.settings IS 'JSON configuration for alerts, thresholds, and dashboard preferences';

-- ============================================
-- 2. ORGANIZATION MEMBERS TABLE
-- ============================================
-- Links interpreters (users) to organizations
-- Supports many-to-many: one interpreter can belong to multiple companies
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role within the organization
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'owner')),
  -- member: Regular interpreter (data is tracked)
  -- admin: Can view dashboard + manage members
  -- owner: Full control + billing
  
  -- Consent tracking (REQUIRED for privacy compliance)
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE,
  consent_version TEXT DEFAULT '1.0', -- Track which consent version they agreed to
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  
  -- Prevent duplicate memberships
  UNIQUE(organization_id, user_id)
);

-- Add comments
COMMENT ON TABLE organization_members IS 'Links interpreters to organizations with role-based access';
COMMENT ON COLUMN organization_members.consent_given IS 'Explicit consent for aggregate data tracking - REQUIRED';
COMMENT ON COLUMN organization_members.role IS 'member=tracked interpreter, admin=dashboard access, owner=full control';

-- ============================================
-- 3. ORGANIZATION INVITATIONS TABLE
-- ============================================
-- Manages interpreter invitations to join organizations
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Invitation details
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'owner')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  
  -- Who sent it
  invited_by UUID REFERENCES auth.users(id),
  
  -- Status
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate invitations
  UNIQUE(organization_id, email)
);

-- Add comments
COMMENT ON TABLE organization_invitations IS 'Pending invitations for interpreters to join organizations';
COMMENT ON COLUMN organization_invitations.token IS 'Unique token for invitation link';

-- ============================================
-- 4. ORGANIZATION METRICS CACHE TABLE
-- ============================================
-- Pre-computed aggregate metrics for performance
-- Updated daily by background job
CREATE TABLE IF NOT EXISTS organization_metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Team size metrics
  total_members INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0, -- Members who logged activity that day
  
  -- Aggregate wellness metrics (NO individual data)
  avg_burnout_score DECIMAL(5,2), -- 0-100 scale
  avg_confidence_level DECIMAL(5,2), -- 0-100 scale
  
  -- Risk distribution
  high_burnout_count INTEGER DEFAULT 0, -- Members above threshold
  low_confidence_count INTEGER DEFAULT 0, -- Members below threshold
  
  -- Activity metrics
  total_reflections INTEGER DEFAULT 0,
  total_stress_resets INTEGER DEFAULT 0,
  
  -- Flexible storage for future metrics
  metrics_detail JSONB DEFAULT '{}'::jsonb,
  
  -- Computation tracking
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate entries
  UNIQUE(organization_id, date)
);

-- Add comments
COMMENT ON TABLE organization_metrics_cache IS 'Pre-computed aggregate metrics - NO individual data stored';
COMMENT ON COLUMN organization_metrics_cache.metrics_detail IS 'Flexible JSON for future metrics without schema changes';

-- ============================================
-- 5. ORGANIZATION ALERTS TABLE
-- ============================================
-- Stores alerts for weekly digests and real-time notifications
CREATE TABLE IF NOT EXISTS organization_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Alert classification
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'high_burnout',
    'low_confidence', 
    'declining_trend',
    'low_engagement',
    'positive_trend',
    'milestone'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  
  -- Alert content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_items TEXT[], -- Suggested actions for the company
  
  -- Supporting data
  metrics JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_included_in_digest BOOLEAN DEFAULT false,
  digest_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE organization_alerts IS 'Alerts for weekly digests and dashboard notifications';
COMMENT ON COLUMN organization_alerts.action_items IS 'Suggested actions for company to take';

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Organizations
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_organizations_stripe ON organizations(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Organization Members
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_active ON organization_members(organization_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(organization_id, role);
CREATE INDEX IF NOT EXISTS idx_org_members_consent ON organization_members(organization_id, consent_given) WHERE consent_given = true;

-- Organization Invitations
CREATE INDEX IF NOT EXISTS idx_org_invitations_org_id ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_org_invitations_pending ON organization_invitations(organization_id, expires_at) WHERE accepted_at IS NULL;

-- Organization Metrics Cache
CREATE INDEX IF NOT EXISTS idx_org_metrics_org_date ON organization_metrics_cache(organization_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_org_metrics_date ON organization_metrics_cache(date DESC);

-- Organization Alerts
CREATE INDEX IF NOT EXISTS idx_org_alerts_org_unread ON organization_alerts(organization_id, is_read, created_at DESC) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_org_alerts_digest ON organization_alerts(organization_id, is_included_in_digest) WHERE is_included_in_digest = false;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_alerts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORGANIZATIONS POLICIES
-- ============================================

-- Org admins and owners can view their organization
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

-- Org owners can update their organization
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

-- Service role has full access (for admin panel)
CREATE POLICY "Service role has full access to organizations"
ON organizations FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- ORGANIZATION MEMBERS POLICIES
-- ============================================

-- Org admins can view all members in their org
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

-- Users can view their own memberships
CREATE POLICY "Users can view own memberships"
ON organization_members FOR SELECT
USING (user_id = auth.uid());

-- Org admins can insert new members (via invitations)
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

-- Org admins can update members (change roles, deactivate)
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

-- Users can update their own consent
CREATE POLICY "Users can update own consent"
ON organization_members FOR UPDATE
USING (user_id = auth.uid());

-- Service role has full access
CREATE POLICY "Service role has full access to members"
ON organization_members FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- ORGANIZATION INVITATIONS POLICIES
-- ============================================

-- Org admins can view invitations for their org
CREATE POLICY "Org admins can view invitations"
ON organization_invitations FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
    AND is_active = true
  )
);

-- Org admins can create invitations
CREATE POLICY "Org admins can create invitations"
ON organization_invitations FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
    AND is_active = true
  )
);

-- Org admins can delete invitations
CREATE POLICY "Org admins can delete invitations"
ON organization_invitations FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
    AND is_active = true
  )
);

-- Service role has full access
CREATE POLICY "Service role has full access to invitations"
ON organization_invitations FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- ORGANIZATION METRICS CACHE POLICIES
-- ============================================

-- Org admins can view metrics for their org
CREATE POLICY "Org admins can view metrics"
ON organization_metrics_cache FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
    AND is_active = true
  )
);

-- Service role has full access (for daily aggregation job)
CREATE POLICY "Service role has full access to metrics"
ON organization_metrics_cache FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- ORGANIZATION ALERTS POLICIES
-- ============================================

-- Org admins can view alerts for their org
CREATE POLICY "Org admins can view alerts"
ON organization_alerts FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
    AND is_active = true
  )
);

-- Org admins can mark alerts as read
CREATE POLICY "Org admins can update alerts"
ON organization_alerts FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
    AND is_active = true
  )
);

-- Service role has full access (for alert generation)
CREATE POLICY "Service role has full access to alerts"
ON organization_alerts FOR ALL
USING (auth.role() = 'service_role');

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_organization_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for organizations table
DROP TRIGGER IF EXISTS update_organizations_timestamp ON organizations;
CREATE TRIGGER update_organizations_timestamp
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_timestamp();

-- ============================================
-- INITIAL DATA / SEED (Optional)
-- ============================================

-- You can add test organizations here for development
-- Example:
-- INSERT INTO organizations (name, primary_contact_email, primary_contact_name)
-- VALUES ('Test Company', 'admin@testcompany.com', 'Test Admin');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these after migration to verify everything worked:

-- Check tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name LIKE 'organization%';

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename LIKE 'organization%';

-- Check policies were created
-- SELECT tablename, policyname FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename LIKE 'organization%';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify tables created successfully
-- 3. Test RLS policies with test users
-- 4. Build metrics aggregation function (Phase 2)
-- 5. Build enterprise dashboard UI (Phase 3)
