-- ============================================
-- STEP 5: CREATE ORGANIZATION ALERTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS organization_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('high_burnout', 'low_confidence', 'declining_trend', 'low_engagement', 'positive_trend', 'milestone')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_items TEXT[],
  metrics JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  is_included_in_digest BOOLEAN DEFAULT false,
  digest_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE organization_alerts IS 'Alerts for weekly digests and dashboard notifications';
COMMENT ON COLUMN organization_alerts.action_items IS 'Suggested actions for company to take';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_org_alerts_org_unread ON organization_alerts(organization_id, is_read, created_at DESC) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_org_alerts_digest ON organization_alerts(organization_id, is_included_in_digest) WHERE is_included_in_digest = false;

-- Enable RLS
ALTER TABLE organization_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

CREATE POLICY "Service role has full access to alerts"
ON organization_alerts FOR ALL
USING (auth.role() = 'service_role');
