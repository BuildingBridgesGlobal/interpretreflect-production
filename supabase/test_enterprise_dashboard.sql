-- ============================================
-- TEST DATA FOR ENTERPRISE DASHBOARD
-- ============================================
-- Run this in Supabase SQL Editor to test the dashboard

-- STEP 1: Create a test organization
INSERT INTO organizations (
  id,
  name, 
  primary_contact_email, 
  primary_contact_name,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001',  -- Fixed ID for easy reference
  'Test Company',
  'admin@testcompany.com',
  'Test Admin',
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  primary_contact_email = EXCLUDED.primary_contact_email;

-- STEP 2: Add YOUR user as an admin
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- To find your user ID, run: SELECT id, email FROM auth.users WHERE email = 'your@email.com';

INSERT INTO organization_members (
  organization_id,
  user_id,
  role,
  consent_given,
  consent_date,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '20701f05-2dc4-4740-a8a2-4a14c8974882',  -- YOUR USER ID (maddoxtwheeler@gmail.com)
  'admin',
  true,
  NOW(),
  true
) ON CONFLICT (organization_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- STEP 3: Add test metrics (simulating 10 team members)
INSERT INTO organization_metrics_cache (
  organization_id,
  date,
  total_members,
  active_members,
  avg_burnout_score,
  avg_confidence_level,
  high_burnout_count,
  low_confidence_count,
  total_reflections,
  total_stress_resets
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  CURRENT_DATE,
  10,    -- 10 total members
  8,     -- 8 active this week
  45.5,  -- Average burnout: 45.5% (moderate)
  72.3,  -- Average confidence: 72.3% (good)
  2,     -- 2 members with high burnout (>70%)
  1,     -- 1 member with low confidence (<30%)
  25,    -- 25 reflections this week
  15     -- 15 stress resets this week
) ON CONFLICT (organization_id, date) DO UPDATE SET
  total_members = EXCLUDED.total_members,
  active_members = EXCLUDED.active_members,
  avg_burnout_score = EXCLUDED.avg_burnout_score,
  avg_confidence_level = EXCLUDED.avg_confidence_level,
  high_burnout_count = EXCLUDED.high_burnout_count,
  low_confidence_count = EXCLUDED.low_confidence_count,
  total_reflections = EXCLUDED.total_reflections,
  total_stress_resets = EXCLUDED.total_stress_resets;

-- STEP 4: Add test alerts
INSERT INTO organization_alerts (
  organization_id,
  alert_type,
  severity,
  title,
  message,
  action_items,
  is_read
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'high_burnout',
  'warning',
  'Elevated Burnout Levels Detected',
  '20% of your team is showing burnout risk above 70%. This is higher than the recommended threshold.',
  ARRAY[
    'Schedule team wellness check-in meeting',
    'Review current workload distribution',
    'Offer additional mental health resources',
    'Consider temporary workload adjustments'
  ],
  false
),
(
  '00000000-0000-0000-0000-000000000001',
  'positive_trend',
  'info',
  'Team Confidence Improving',
  'Your team''s average confidence level has increased by 8% over the past week. Great progress!',
  ARRAY[
    'Continue current support practices',
    'Share positive feedback with team',
    'Document what''s working well'
  ],
  false
),
(
  '00000000-0000-0000-0000-000000000001',
  'low_engagement',
  'warning',
  'Activity Levels Below Average',
  'Only 80% of your team has logged activity this week. Consider checking in with inactive members.',
  ARRAY[
    'Send friendly reminder about wellness tools',
    'Check if team members need support',
    'Review if tools are meeting team needs'
  ],
  false
);

-- VERIFICATION: Check that everything was created
SELECT 
  'Organization Created' as status,
  id,
  name,
  primary_contact_email
FROM organizations 
WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 
  'Admin Added' as status,
  om.role,
  om.is_active,
  u.email
FROM organization_members om
JOIN auth.users u ON u.id = om.user_id
WHERE om.organization_id = '00000000-0000-0000-0000-000000000001';

SELECT 
  'Metrics Added' as status,
  date,
  total_members,
  avg_burnout_score,
  avg_confidence_level
FROM organization_metrics_cache
WHERE organization_id = '00000000-0000-0000-0000-000000000001';

SELECT 
  'Alerts Added' as status,
  COUNT(*) as alert_count
FROM organization_alerts
WHERE organization_id = '00000000-0000-0000-0000-000000000001';

-- SUCCESS MESSAGE
SELECT '✅ Test data created successfully! Log in to see your Team Dashboard tab.' as message;
