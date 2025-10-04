-- ============================================
-- WEBHOOK MONITORING QUERIES
-- ============================================

-- 1. DASHBOARD: Today's Activity
-- --------------------------------------------
SELECT 
  COUNT(*) as total_webhooks,
  COUNT(*) FILTER (WHERE processing_status = 'success') as successful,
  COUNT(*) FILTER (WHERE processing_status = 'failed') as failed,
  COUNT(*) FILTER (WHERE processing_status = 'pending') as pending
FROM pabbly_webhook_logs
WHERE created_at >= CURRENT_DATE;

-- 2. Recent Webhook Activity (Last 24 Hours)
-- --------------------------------------------
SELECT 
  created_at,
  workflow_name,
  webhook_payload->>'event_type' as event_type,
  webhook_payload->>'email' as email,
  processing_status,
  error_message
FROM pabbly_webhook_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 3. Subscription Status Overview
-- --------------------------------------------
SELECT 
  subscription_status,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE updated_at >= NOW() - INTERVAL '24 hours') as updated_today
FROM profiles
WHERE subscription_status IS NOT NULL
GROUP BY subscription_status;

-- 4. Recent Subscription Changes
-- --------------------------------------------
SELECT 
  email,
  subscription_status,
  stripe_subscription_id,
  subscription_end_date,
  updated_at
FROM profiles
WHERE updated_at >= NOW() - INTERVAL '7 days'
  AND subscription_status IS NOT NULL
ORDER BY updated_at DESC;

-- 5. Failed Payments Needing Attention
-- --------------------------------------------
SELECT 
  p.email,
  f.amount,
  f.failure_reason,
  f.attempt_count,
  f.next_retry_date,
  f.created_at
FROM failed_payments f
JOIN profiles p ON f.user_id = p.id
WHERE f.recovered = false
ORDER BY f.created_at DESC;

-- 6. Audit Trail - Recent Events
-- --------------------------------------------
SELECT 
  created_at,
  event_type,
  old_status,
  new_status,
  source,
  created_by,
  metadata->>'email' as email
FROM subscription_audit_log
ORDER BY created_at DESC
LIMIT 50;

-- 7. Check for Data Mismatches
-- --------------------------------------------
SELECT 
  p.email,
  p.subscription_status as profile_status,
  s.status as subscription_table_status,
  p.stripe_subscription_id,
  CASE 
    WHEN p.subscription_status != s.status THEN 'MISMATCH'
    WHEN p.subscription_status IS NULL THEN 'MISSING_PROFILE_STATUS'
    WHEN s.status IS NULL THEN 'MISSING_SUBSCRIPTION'
    ELSE 'OK'
  END as sync_status
FROM profiles p
LEFT JOIN subscriptions s ON p.stripe_subscription_id = s.id
WHERE p.stripe_subscription_id IS NOT NULL
   OR s.id IS NOT NULL;

-- 8. Webhook Processing Stats (Last 7 Days)
-- --------------------------------------------
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_webhooks,
  COUNT(*) FILTER (WHERE processing_status = 'success') as successful,
  COUNT(*) FILTER (WHERE processing_status = 'failed') as failed,
  COUNT(DISTINCT webhook_payload->>'email') as unique_users
FROM pabbly_webhook_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 9. Find Specific User's Events
-- --------------------------------------------
-- Replace 'user@example.com' with actual email
SELECT 
  created_at,
  webhook_payload->>'event_type' as event,
  processing_status,
  webhook_payload
FROM pabbly_webhook_logs
WHERE webhook_payload->>'email' = 'user@example.com'
   OR webhook_payload->>'customer_email' = 'user@example.com'
ORDER BY created_at DESC;

-- 10. Health Check - Last Webhook Received
-- --------------------------------------------
SELECT 
  MAX(created_at) as last_webhook_received,
  NOW() - MAX(created_at) as time_since_last,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as webhooks_last_hour
FROM pabbly_webhook_logs;
