-- =====================================================
-- Remaining Security Fixes (after CASCADE is fixed)
-- =====================================================

-- =====================================================
-- 1. Enable RLS on password_reset_codes (CRITICAL)
-- =====================================================

ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Only service role can access password reset codes
-- Regular users and anon should NEVER see these
CREATE POLICY "Service role only access" ON public.password_reset_codes
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- 2. Pin search_path on SECURITY DEFINER functions
-- =====================================================
-- Prevents search path hijacking attacks

DO $$
DECLARE
  func RECORD;
  fixed_count INT := 0;
BEGIN
  RAISE NOTICE '=== Securing SECURITY DEFINER Functions ===';

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
      fixed_count := fixed_count + 1;
      RAISE NOTICE '✅ Secured: %.%', func.schema_name, func.function_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '❌ Could not secure %.%: %', func.schema_name, func.function_name, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE 'Fixed % SECURITY DEFINER functions', fixed_count;
END $$;

-- =====================================================
-- 3. Convert views to SECURITY INVOKER
-- =====================================================

-- Fix subscription_overview view
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

GRANT SELECT ON subscription_overview TO authenticated;
REVOKE SELECT ON subscription_overview FROM anon;

-- =====================================================
-- 4. Final Security Check
-- =====================================================

DO $$
DECLARE
  issues_count INT := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== FINAL SECURITY AUDIT ===';

  -- Check for tables without RLS
  SELECT COUNT(*) INTO issues_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT IN ('spatial_ref_sys')
    AND NOT EXISTS (
      SELECT 1 FROM pg_class c
      WHERE c.relname = pg_tables.tablename
        AND c.relrowsecurity = true
    );

  RAISE NOTICE 'Tables without RLS: %', issues_count;

  IF issues_count = 0 THEN
    RAISE NOTICE '✅ ALL SECURITY ISSUES RESOLVED!';
    RAISE NOTICE 'Check Supabase Security Advisor to confirm';
  ELSE
    RAISE NOTICE '⚠️  Some issues remain - check Security Advisor';
  END IF;
END $$;
