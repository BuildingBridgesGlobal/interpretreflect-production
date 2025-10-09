-- =====================================================
-- Comprehensive Security Fixes for Supabase Security Advisor
-- =====================================================
-- Fixes 19 security issues reported by Supabase Security Advisor

-- =====================================================
-- 1. Fix CASCADE DELETE for email_events and comm_events
-- =====================================================

ALTER TABLE public.email_events
  DROP CONSTRAINT IF EXISTS email_events_user_id_fkey,
  ADD CONSTRAINT email_events_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

ALTER TABLE public.comm_events
  DROP CONSTRAINT IF EXISTS comm_events_user_id_fkey,
  ADD CONSTRAINT comm_events_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

RAISE NOTICE '✅ Fixed CASCADE DELETE on email_events and comm_events';

-- =====================================================
-- 2. Enable RLS on password_reset_codes (CRITICAL)
-- =====================================================

ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Only service role can access password reset codes
-- Regular users and anon should NEVER see these
CREATE POLICY "Service role only access" ON public.password_reset_codes
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

RAISE NOTICE '✅ Enabled RLS on password_reset_codes with service role only policy';

-- =====================================================
-- 3. Pin search_path on SECURITY DEFINER functions
-- =====================================================
-- Prevents search path hijacking attacks

-- Update all flagged SECURITY DEFINER functions
DO $$
DECLARE
  func RECORD;
BEGIN
  FOR func IN
    SELECT
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.prosecdef = true  -- SECURITY DEFINER functions
      AND n.nspname = 'public'
  LOOP
    BEGIN
      EXECUTE format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = pg_catalog, public, auth, extensions',
        func.schema_name,
        func.function_name,
        func.args
      );
      RAISE NOTICE 'Secured function: %.%', func.schema_name, func.function_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Could not secure function %.%: %', func.schema_name, func.function_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- =====================================================
-- 4. Convert views to SECURITY INVOKER
-- =====================================================
-- Only convert views that should be client-accessible

-- List of views that should remain accessible (adjust as needed):
-- - subscription_overview (users can see their own subscription)
-- - Any growth/insights views (users see their own data via RLS)

-- For subscription_overview, ensure it respects RLS
DROP VIEW IF EXISTS subscription_overview CASCADE;
CREATE VIEW subscription_overview
WITH (security_invoker = true)
AS
SELECT
  s.id,
  s.user_id,
  s.plan_name,
  s.price,
  s.status,
  s.next_billing_date,
  s.payment_method,
  s.trial_ends_at,
  s.cancelled_at,
  u.email as user_email,
  COUNT(DISTINCT i.id) as total_invoices,
  SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) as total_paid,
  MAX(i.date) as last_invoice_date
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
LEFT JOIN invoices i ON s.id = i.subscription_id
GROUP BY s.id, u.email;

-- Grant access only to authenticated users (they see their own via RLS)
GRANT SELECT ON subscription_overview TO authenticated;
REVOKE SELECT ON subscription_overview FROM anon;

RAISE NOTICE '✅ Converted subscription_overview to SECURITY INVOKER';

-- =====================================================
-- 5. Final Security Audit
-- =====================================================

DO $$
DECLARE
  rls_missing_count INT;
  func_count INT;
BEGIN
  -- Check for tables without RLS
  SELECT COUNT(*) INTO rls_missing_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT IN ('spatial_ref_sys')  -- PostGIS exception
    AND NOT EXISTS (
      SELECT 1 FROM pg_class c
      WHERE c.relname = pg_tables.tablename
        AND c.relrowsecurity = true
    );

  -- Count SECURITY DEFINER functions without search_path
  SELECT COUNT(*) INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE p.prosecdef = true
    AND n.nspname = 'public'
    AND NOT EXISTS (
      SELECT 1 FROM pg_proc_proconfig(p.oid)
      WHERE pg_proc_proconfig ~ 'search_path'
    );

  RAISE NOTICE '';
  RAISE NOTICE '=== SECURITY AUDIT SUMMARY ===';
  RAISE NOTICE 'Tables without RLS: %', rls_missing_count;
  RAISE NOTICE 'SECURITY DEFINER functions without search_path: %', func_count;

  IF rls_missing_count = 0 AND func_count = 0 THEN
    RAISE NOTICE '✅ ALL SECURITY ISSUES RESOLVED!';
  ELSE
    RAISE NOTICE '⚠️  Some issues may remain - check Supabase Security Advisor';
  END IF;
END $$;
