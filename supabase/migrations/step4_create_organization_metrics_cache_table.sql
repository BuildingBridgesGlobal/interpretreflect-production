-- ============================================
-- STEP 4: CREATE ORGANIZATION METRICS CACHE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS organization_metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_members INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  avg_burnout_score DECIMAL(5,2),
  avg_confidence_level DECIMAL(5,2),
  high_burnout_count INTEGER DEFAULT 0,
  low_confidence_count INTEGER DEFAULT 0,
  total_reflections INTEGER DEFAULT 0,
  total_stress_resets INTEGER DEFAULT 0,
  metrics_detail JSONB DEFAULT '{}'::jsonb,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, date)
);

-- Add comments
COMMENT ON TABLE organization_metrics_cache IS 'Pre-computed aggregate metrics - NO individual data stored';
COMMENT ON COLUMN organization_metrics_cache.metrics_detail IS 'Flexible JSON for future metrics without schema changes';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_org_metrics_org_date ON organization_metrics_cache(organization_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_org_metrics_date ON organization_metrics_cache(date DESC);

-- Enable RLS
ALTER TABLE organization_metrics_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

CREATE POLICY "Service role has full access to metrics"
ON organization_metrics_cache FOR ALL
USING (auth.role() = 'service_role');
