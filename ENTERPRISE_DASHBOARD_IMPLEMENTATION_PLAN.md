# Enterprise Dashboard - Implementation Plan

## Overview
Multi-tenant architecture for companies to track aggregate wellness metrics of their interpreter teams.

## Key Requirements Met
✅ Aggregate data only (no individual names/identities)
✅ Interpreters can belong to multiple companies
✅ Real-time alerts for at-risk teams
✅ Data export capabilities
✅ Transparent tracking (disclosed to interpreters)
✅ Scalable for future metrics

## Architecture Decision: Aggregate-Only Dashboard

**Why This is Better:**
- ✅ HIPAA/Privacy compliant by design
- ✅ Reduces company liability
- ✅ Interpreters more comfortable sharing honest data
- ✅ Focuses on team health, not individual surveillance
- ✅ Easier to implement and maintain

## Database Schema

### New Tables

```sql
-- Organizations (Companies)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'enterprise',
  custom_pricing DECIMAL,
  stripe_customer_id TEXT,
  settings JSONB DEFAULT '{
    "alert_threshold_burnout": 70,
    "alert_threshold_low_confidence": 30,
    "data_retention_days": 365,
    "export_enabled": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Memberships (Interpreters in Companies)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'member', 'admin', 'owner'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  consent_given BOOLEAN DEFAULT false, -- Explicit tracking consent
  consent_date TIMESTAMP WITH TIME ZONE,
  UNIQUE(organization_id, user_id)
);

-- Organization Invitations
CREATE TABLE organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aggregate Metrics Cache (Pre-computed for performance)
CREATE TABLE organization_metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_members INTEGER,
  active_members INTEGER, -- Members who logged activity that day
  avg_burnout_score DECIMAL,
  avg_confidence_level DECIMAL,
  high_burnout_count INTEGER, -- Members above threshold
  low_confidence_count INTEGER,
  total_reflections INTEGER,
  total_stress_resets INTEGER,
  metrics_detail JSONB, -- Flexible for future metrics
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, date)
);

-- Real-time Alerts
CREATE TABLE organization_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'high_burnout', 'low_confidence', 'declining_trend'
  severity TEXT NOT NULL, -- 'info', 'warning', 'critical'
  message TEXT NOT NULL,
  metrics JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes for Performance

```sql
CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_active ON organization_members(organization_id, is_active);
CREATE INDEX idx_org_metrics_org_date ON organization_metrics_cache(organization_id, date DESC);
CREATE INDEX idx_org_alerts_org_unread ON organization_alerts(organization_id, is_read, created_at DESC);
```

### Row Level Security (RLS) Policies

```sql
-- Organizations: Only admins can view their org
CREATE POLICY "Org admins can view their organization"
ON organizations FOR SELECT
USING (
  id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- Organization Members: Admins can view members, members can view themselves
CREATE POLICY "Org admins can view members"
ON organization_members FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- Metrics Cache: Only org admins can view
CREATE POLICY "Org admins can view metrics"
ON organization_metrics_cache FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- Alerts: Only org admins can view
CREATE POLICY "Org admins can view alerts"
ON organization_alerts FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);
```

## Frontend Components Structure

```
src/
├── pages/
│   └── EnterpriseDashboard.tsx          # Main dashboard page
├── components/
│   └── enterprise/
│       ├── DashboardOverview.tsx        # Key metrics cards
│       ├── BurnoutTrendChart.tsx        # Team burnout over time
│       ├── ConfidenceTrendChart.tsx     # Team confidence over time
│       ├── ActivityHeatmap.tsx          # Reflection/usage patterns
│       ├── AlertsPanel.tsx              # Real-time alerts
│       ├── TeamSizeCard.tsx             # Active members count
│       ├── ExportDataButton.tsx         # CSV/PDF export
│       ├── DateRangeSelector.tsx        # Filter by date range
│       └── MetricsComparison.tsx        # Week-over-week comparison
├── hooks/
│   ├── useOrganizationMetrics.ts        # Fetch aggregate data
│   ├── useOrganizationAlerts.ts         # Real-time alerts
│   └── useOrganizationMembers.ts        # Member management
└── services/
    ├── organizationService.ts           # API calls
    └── metricsAggregationService.ts     # Data processing
```

## Dashboard Features

### 1. Overview Cards (Top of Dashboard)
- **Total Team Members** (active/total)
- **Average Burnout Risk** (0-100% with color coding)
- **Average Confidence Level** (0-100%)
- **Weekly Activity** (reflections + stress resets)
- **Trend Indicators** (↑↓ compared to last week)

### 2. Main Charts
- **Burnout Trend** (Line chart, last 30/90 days)
- **Confidence Trend** (Line chart, last 30/90 days)
- **Activity Heatmap** (Calendar view of team engagement)
- **Risk Distribution** (Pie chart: Low/Moderate/High/Critical)

### 3. Alerts Panel (Sidebar)
- Real-time notifications
- "15% of team showing high burnout"
- "Team confidence declined 10% this week"
- "Low engagement - only 40% active this week"

### 4. Export Options
- CSV: Raw metrics data
- PDF: Executive summary report
- Date range selection
- Scheduled reports (future)

## Implementation Phases

### Phase 1: Database & Backend (Week 1)
**Tasks:**
1. Create all database tables and RLS policies
2. Build metrics aggregation function (runs daily)
3. Create API endpoints for dashboard data
4. Set up real-time alerts logic

**Deliverables:**
- SQL migration files
- Supabase Edge Functions for aggregation
- API documentation

### Phase 2: Dashboard UI (Week 2)
**Tasks:**
1. Create EnterpriseDashboard page
2. Build overview cards component
3. Implement burnout & confidence charts
4. Add date range filtering

**Deliverables:**
- Functional dashboard with basic metrics
- Responsive design (desktop + tablet)

### Phase 3: Alerts & Real-time (Week 3)
**Tasks:**
1. Build alerts panel component
2. Implement real-time updates (Supabase subscriptions)
3. Add alert threshold configuration
4. Email notifications for critical alerts

**Deliverables:**
- Working alerts system
- Admin notification preferences

### Phase 4: Export & Advanced Features (Week 4)
**Tasks:**
1. CSV export functionality
2. PDF report generation
3. Activity heatmap
4. Week-over-week comparisons

**Deliverables:**
- Full export capabilities
- Polished dashboard ready for beta

### Phase 5: Onboarding & Admin Tools (Week 5)
**Tasks:**
1. Organization setup wizard
2. Interpreter invitation system
3. Member management interface
4. Consent tracking UI

**Deliverables:**
- Complete onboarding flow
- Admin management tools

## Metrics Aggregation Logic

### Daily Aggregation (Runs at midnight)
```typescript
// Pseudo-code for daily aggregation
async function aggregateDailyMetrics(organizationId: string, date: Date) {
  // Get all active members
  const members = await getActiveMembers(organizationId);
  
  // Calculate aggregate metrics (NO individual data stored)
  const metrics = {
    total_members: members.length,
    active_members: members.filter(m => m.hadActivityToday).length,
    avg_burnout_score: average(members.map(m => m.latestBurnoutScore)),
    avg_confidence_level: average(members.map(m => m.latestConfidence)),
    high_burnout_count: members.filter(m => m.burnoutScore > 70).length,
    low_confidence_count: members.filter(m => m.confidence < 30).length,
    total_reflections: sum(members.map(m => m.reflectionsToday)),
    total_stress_resets: sum(members.map(m => m.stressResetsToday))
  };
  
  // Store in cache
  await saveMetricsCache(organizationId, date, metrics);
  
  // Check for alerts
  await checkAndCreateAlerts(organizationId, metrics);
}
```

### Alert Triggers
- **High Burnout Alert:** >30% of team above 70% burnout
- **Low Confidence Alert:** >30% of team below 30% confidence
- **Declining Trend Alert:** 15%+ decrease week-over-week
- **Low Engagement Alert:** <50% team active in past week

## Privacy & Compliance

### Data Protection
✅ **Aggregate Only:** No individual names/data in dashboard
✅ **Consent Required:** Interpreters must opt-in to org tracking
✅ **Transparent:** Clear disclosure of what's tracked
✅ **Anonymized:** Minimum 5 members required to show data (prevent identification)
✅ **Retention:** Configurable data retention per org

### Interpreter Consent Flow
1. Interpreter receives invitation email
2. Accepts invitation → Shown consent screen
3. Consent screen explains:
   - What data is tracked (aggregate only)
   - Who can see it (company admins)
   - How it's used (team wellness monitoring)
   - Right to withdraw consent
4. Must click "I Consent" to join organization

## Pricing Considerations

### Enterprise Tier Features
- Unlimited interpreters per organization
- Full dashboard access
- Real-time alerts
- Data export
- Priority support
- Custom onboarding

### Pricing Model Options
1. **Per-Seat:** $X per interpreter per month
2. **Flat Rate:** $X per organization (up to Y interpreters)
3. **Custom:** Negotiated based on org size

## Next Steps

1. **Review & Approve** this plan
2. **Start Phase 1** - Database schema
3. **Design mockups** for dashboard UI (optional)
4. **Set up staging environment** for testing

## Questions for You

1. **Minimum team size?** (I recommend 5+ to ensure anonymity)
2. **Alert frequency?** (Real-time, daily digest, weekly summary?)
3. **Who sets up organizations?** (Self-service or you manually?)
4. **Beta testers?** (Any companies ready to test?)

Ready to start building when you are! 🚀
