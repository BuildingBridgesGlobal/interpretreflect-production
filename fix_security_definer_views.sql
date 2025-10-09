-- =====================================================
-- Fix All SECURITY DEFINER Views - Convert to INVOKER
-- =====================================================

-- First, check which views are still SECURITY DEFINER
DO $$
DECLARE
  v RECORD;
BEGIN
  RAISE NOTICE '=== Views with SECURITY DEFINER ===';

  FOR v IN
    SELECT
      schemaname,
      viewname,
      definition
    FROM pg_views
    WHERE schemaname = 'public'
      AND definition ILIKE '%SECURITY DEFINER%'
  LOOP
    RAISE NOTICE 'Found: %.%', v.schemaname, v.viewname;
  END LOOP;
END $$;

-- =====================================================
-- Fix: Drop and recreate views with security_invoker=true
-- =====================================================

-- Fix active_subscribers (CRITICAL - exposes auth.users)
DROP VIEW IF EXISTS active_subscribers CASCADE;
CREATE VIEW active_subscribers
WITH (security_invoker = true)
AS
SELECT
  s.id,
  s.user_id,
  p.full_name,
  s.plan_name,
  s.status,
  s.created_at,
  s.next_billing_date
FROM subscriptions s
LEFT JOIN user_profiles p ON s.user_id = p.user_id
WHERE s.status IN ('active', 'trialing', 'past_due');

GRANT SELECT ON active_subscribers TO authenticated;

-- Fix subscription_analytics
DROP VIEW IF EXISTS subscription_analytics CASCADE;
CREATE VIEW subscription_analytics
WITH (security_invoker = true)
AS
SELECT
  plan_name,
  COUNT(*) as subscriber_count,
  SUM(price) as total_revenue
FROM subscriptions
WHERE status IN ('active', 'trialing')
GROUP BY plan_name;

GRANT SELECT ON subscription_analytics TO authenticated;

-- Fix subscription_status_summary
DROP VIEW IF EXISTS subscription_status_summary CASCADE;
CREATE VIEW subscription_status_summary
WITH (security_invoker = true)
AS
SELECT
  status,
  COUNT(*) as count,
  SUM(price) as revenue
FROM subscriptions
GROUP BY status;

GRANT SELECT ON subscription_status_summary TO authenticated;

-- Fix v_techniques_daily_rollup
DROP VIEW IF EXISTS v_techniques_daily_rollup CASCADE;
CREATE VIEW v_techniques_daily_rollup
WITH (security_invoker = true)
AS
SELECT
  user_id,
  DATE(created_at) as date,
  COUNT(*) as technique_count
FROM reflections
GROUP BY user_id, DATE(created_at);

GRANT SELECT ON v_techniques_daily_rollup TO authenticated;

-- Fix v_techniques_latest
DROP VIEW IF EXISTS v_techniques_latest CASCADE;
CREATE VIEW v_techniques_latest
WITH (security_invoker = true)
AS
SELECT DISTINCT ON (user_id)
  user_id,
  created_at,
  reflection_data
FROM reflections
ORDER BY user_id, created_at DESC;

GRANT SELECT ON v_techniques_latest TO authenticated;

-- Fix v_techniques_totals (if exists)
DROP VIEW IF EXISTS v_techniques_totals CASCADE;
CREATE VIEW v_techniques_totals
WITH (security_invoker = true)
AS
SELECT
  user_id,
  COUNT(*) as total_techniques
FROM reflections
GROUP BY user_id;

GRANT SELECT ON v_techniques_totals TO authenticated;

-- Fix v_feature_requests_daily_counts
DROP VIEW IF EXISTS v_feature_requests_daily_counts CASCADE;
CREATE VIEW v_feature_requests_daily_counts
WITH (security_invoker = true)
AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as count
FROM feature_requests
GROUP BY DATE(created_at);

GRANT SELECT ON v_feature_requests_daily_counts TO authenticated;

-- Fix v_feature_requests_daily_counts_12mo
DROP VIEW IF EXISTS v_feature_requests_daily_counts_12mo CASCADE;
CREATE VIEW v_feature_requests_daily_counts_12mo
WITH (security_invoker = true)
AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as count
FROM feature_requests
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE(created_at);

GRANT SELECT ON v_feature_requests_daily_counts_12mo TO authenticated;

-- Fix v_feature_requests_monthly_counts_12mo
DROP VIEW IF EXISTS v_feature_requests_monthly_counts_12mo CASCADE;
CREATE VIEW v_feature_requests_monthly_counts_12mo
WITH (security_invoker = true)
AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as count
FROM feature_requests
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at);

GRANT SELECT ON v_feature_requests_monthly_counts_12mo TO authenticated;

-- Fix v_feature_requests_by_source_30d
DROP VIEW IF EXISTS v_feature_requests_by_source_30d CASCADE;
CREATE VIEW v_feature_requests_by_source_30d
WITH (security_invoker = true)
AS
SELECT
  source,
  COUNT(*) as count
FROM feature_requests
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY source;

GRANT SELECT ON v_feature_requests_by_source_30d TO authenticated;

-- Fix v_feature_requests_by_source_90d
DROP VIEW IF EXISTS v_feature_requests_by_source_90d CASCADE;
CREATE VIEW v_feature_requests_by_source_90d
WITH (security_invoker = true)
AS
SELECT
  source,
  COUNT(*) as count
FROM feature_requests
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY source;

GRANT SELECT ON v_feature_requests_by_source_90d TO authenticated;

-- Fix v_feature_requests_sentiment_30d
DROP VIEW IF EXISTS v_feature_requests_sentiment_30d CASCADE;
CREATE VIEW v_feature_requests_sentiment_30d
WITH (security_invoker = true)
AS
SELECT
  sentiment,
  COUNT(*) as count
FROM feature_requests
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY sentiment;

GRANT SELECT ON v_feature_requests_sentiment_30d TO authenticated;

-- Fix v_feature_requests_sentiment_90d
DROP VIEW IF EXISTS v_feature_requests_sentiment_90d CASCADE;
CREATE VIEW v_feature_requests_sentiment_90d
WITH (security_invoker = true)
AS
SELECT
  sentiment,
  COUNT(*) as count
FROM feature_requests
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY sentiment;

GRANT SELECT ON v_feature_requests_sentiment_90d TO authenticated;

-- Fix v_feature_requests_top_tags_30d
DROP VIEW IF EXISTS v_feature_requests_top_tags_30d CASCADE;
CREATE VIEW v_feature_requests_top_tags_30d
WITH (security_invoker = true)
AS
SELECT
  tag,
  COUNT(*) as count
FROM (
  SELECT unnest(tags) as tag
  FROM feature_requests
  WHERE created_at >= NOW() - INTERVAL '30 days'
) subq
GROUP BY tag
ORDER BY count DESC
LIMIT 10;

GRANT SELECT ON v_feature_requests_top_tags_30d TO authenticated;

-- Fix v_feature_requests_top_tags_90d
DROP VIEW IF EXISTS v_feature_requests_top_tags_90d CASCADE;
CREATE VIEW v_feature_requests_top_tags_90d
WITH (security_invoker = true)
AS
SELECT
  tag,
  COUNT(*) as count
FROM (
  SELECT unnest(tags) as tag
  FROM feature_requests
  WHERE created_at >= NOW() - INTERVAL '90 days'
) subq
GROUP BY tag
ORDER BY count DESC
LIMIT 10;

GRANT SELECT ON v_feature_requests_top_tags_90d TO authenticated;

-- =====================================================
-- Verification
-- =====================================================

DO $$
DECLARE
  definer_count INT;
  invoker_count INT;
BEGIN
  -- Count SECURITY DEFINER views
  SELECT COUNT(*) INTO definer_count
  FROM pg_views
  WHERE schemaname = 'public'
    AND definition ILIKE '%SECURITY DEFINER%';

  -- Count views with security_invoker option
  SELECT COUNT(*) INTO invoker_count
  FROM pg_views v
  JOIN pg_class c ON v.viewname = c.relname
  WHERE v.schemaname = 'public'
    AND c.relkind = 'v'
    AND EXISTS (
      SELECT 1 FROM pg_options_to_table(c.reloptions)
      WHERE option_name = 'security_invoker'
        AND option_value = 'true'
    );

  RAISE NOTICE '';
  RAISE NOTICE '=== SECURITY VIEW AUDIT ===';
  RAISE NOTICE 'Views with SECURITY DEFINER: %', definer_count;
  RAISE NOTICE 'Views with security_invoker=true: %', invoker_count;

  IF definer_count = 0 THEN
    RAISE NOTICE '✅ ALL VIEWS PROPERLY SECURED!';
  ELSE
    RAISE NOTICE '⚠️  % views still need fixing', definer_count;
  END IF;
END $$;
