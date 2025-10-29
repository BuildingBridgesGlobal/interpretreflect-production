-- ============================================
-- STEP 1: CREATE ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subscription_tier TEXT DEFAULT 'enterprise' CHECK (
        subscription_tier IN ('basic', 'professional', 'enterprise')
    ),
    custom_pricing DECIMAL(10, 2),
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    settings JSONB DEFAULT '{"alert_threshold_burnout": 70, "alert_threshold_low_confidence": 30, "alert_threshold_declining_trend": 15, "data_retention_days": 365, "export_enabled": true, "weekly_digest_enabled": true, "weekly_digest_day": "monday", "minimum_team_size": 5}'::jsonb,
    primary_contact_email TEXT,
    primary_contact_name TEXT,
    is_active BOOLEAN DEFAULT true,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Add comment
COMMENT ON TABLE organizations IS 'Enterprise organizations/companies that purchase team dashboards';
-- Create index
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active)
WHERE is_active = true;
-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
-- Create RLS policy (only service role for now, will add user policies after organization_members table exists)
CREATE POLICY "Service role has full access to organizations" ON organizations FOR ALL USING (auth.role() = 'service_role');