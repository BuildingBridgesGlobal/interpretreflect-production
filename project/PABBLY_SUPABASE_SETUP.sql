-- ============================================================
-- PABBLY INTEGRATION - SUPABASE DATABASE SETUP
-- ============================================================
-- Run this in your Supabase SQL Editor
-- This adds all necessary fields for Pabbly Connect integration
-- ============================================================

-- 1. Add missing subscription fields to profiles table
-- ------------------------------------------------------------
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS payment_failed_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_payment_error TEXT,
ADD COLUMN IF NOT EXISTS subscription_interval TEXT CHECK (subscription_interval IN ('month', 'year')),
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS lifetime_value DECIMAL(10,2) DEFAULT 0;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON public.profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_end_date ON public.profiles(subscription_end_date);

-- 2. Create subscription audit log table for tracking all changes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'created', 'updated', 'cancelled', 'payment_failed', 'resumed'
    stripe_event_id TEXT, -- Original Stripe event ID for deduplication
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    old_status TEXT,
    new_status TEXT,
    metadata JSONB, -- Store full event data from Stripe
    source TEXT DEFAULT 'pabbly', -- 'pabbly', 'webhook', 'manual', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT -- Email or system identifier
);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.subscription_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_stripe_event ON public.subscription_audit_log(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.subscription_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON public.subscription_audit_log(event_type);

-- 3. Create table for Pabbly webhook logs (for debugging)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pabbly_webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_name TEXT NOT NULL,
    webhook_payload JSONB NOT NULL,
    processing_status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed', 'retry'
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for recent logs
CREATE INDEX IF NOT EXISTS idx_pabbly_logs_created_at ON public.pabbly_webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pabbly_logs_status ON public.pabbly_webhook_logs(processing_status);

-- 4. Create reconciliation table for daily checks
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_reconciliation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    check_date DATE NOT NULL DEFAULT CURRENT_DATE,
    user_id UUID REFERENCES auth.users(id),
    email TEXT,
    stripe_status TEXT,
    supabase_status TEXT,
    mismatch_type TEXT, -- 'status_mismatch', 'missing_in_stripe', 'missing_in_supabase'
    resolution_status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'ignored'
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for daily checks
CREATE INDEX IF NOT EXISTS idx_reconciliation_check_date ON public.subscription_reconciliation(check_date DESC);
CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON public.subscription_reconciliation(resolution_status);

-- 5. Create failed payments tracking table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.failed_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    stripe_customer_id TEXT,
    stripe_invoice_id TEXT,
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    failure_reason TEXT,
    attempt_count INTEGER DEFAULT 1,
    next_retry_date TIMESTAMP WITH TIME ZONE,
    recovered BOOLEAN DEFAULT FALSE,
    recovered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for failed payments
CREATE INDEX IF NOT EXISTS idx_failed_payments_user_id ON public.failed_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_failed_payments_recovered ON public.failed_payments(recovered);
CREATE INDEX IF NOT EXISTS idx_failed_payments_created_at ON public.failed_payments(created_at DESC);

-- 6. Enable RLS on new tables
-- ------------------------------------------------------------
ALTER TABLE public.subscription_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pabbly_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_reconciliation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_payments ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for audit tables (admin only)
-- ------------------------------------------------------------
-- Audit log - only service role can write, admins can read
CREATE POLICY "Service role can insert audit logs" ON public.subscription_audit_log
    FOR INSERT TO service_role
    USING (true);

CREATE POLICY "Admins can view audit logs" ON public.subscription_audit_log
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Pabbly logs - similar permissions
CREATE POLICY "Service role can manage pabbly logs" ON public.pabbly_webhook_logs
    FOR ALL TO service_role
    USING (true);

-- Failed payments - users can see their own
CREATE POLICY "Users can view own failed payments" ON public.failed_payments
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Service role can manage failed payments" ON public.failed_payments
    FOR ALL TO service_role
    USING (true);

-- 8. Create helper functions for Pabbly
-- ------------------------------------------------------------
-- Function to safely update subscription status
CREATE OR REPLACE FUNCTION update_subscription_status(
    p_email TEXT,
    p_status TEXT,
    p_stripe_customer_id TEXT DEFAULT NULL,
    p_stripe_subscription_id TEXT DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_old_status TEXT;
    v_result JSONB;
BEGIN
    -- Get user ID and old status
    SELECT p.id, p.subscription_status INTO v_user_id, v_old_status
    FROM public.profiles p
    WHERE p.email = p_email;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Update profile
    UPDATE public.profiles
    SET
        subscription_status = p_status,
        stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
        stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id),
        subscription_end_date = COALESCE(p_end_date, subscription_end_date),
        updated_at = NOW()
    WHERE id = v_user_id;

    -- Log the change
    INSERT INTO public.subscription_audit_log (
        user_id, event_type, old_status, new_status, source, created_by
    ) VALUES (
        v_user_id, 'status_change', v_old_status, p_status, 'pabbly', 'pabbly_integration'
    );

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'old_status', v_old_status,
        'new_status', p_status
    );
END;
$$;

-- Function to log payment failure
CREATE OR REPLACE FUNCTION log_payment_failure(
    p_stripe_customer_id TEXT,
    p_invoice_id TEXT,
    p_amount DECIMAL,
    p_reason TEXT,
    p_attempt_count INTEGER,
    p_next_retry TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_payment_id UUID;
BEGIN
    -- Get user ID from stripe customer ID
    SELECT id INTO v_user_id
    FROM public.profiles
    WHERE stripe_customer_id = p_stripe_customer_id;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Insert or update failed payment record
    INSERT INTO public.failed_payments (
        user_id, stripe_customer_id, stripe_invoice_id,
        amount, failure_reason, attempt_count, next_retry_date
    ) VALUES (
        v_user_id, p_stripe_customer_id, p_invoice_id,
        p_amount, p_reason, p_attempt_count, p_next_retry
    )
    ON CONFLICT (stripe_invoice_id) DO UPDATE
    SET
        attempt_count = p_attempt_count,
        failure_reason = p_reason,
        next_retry_date = p_next_retry
    RETURNING id INTO v_payment_id;

    -- Update profile
    UPDATE public.profiles
    SET
        payment_failed_date = NOW(),
        payment_retry_count = p_attempt_count,
        last_payment_error = p_reason
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'payment_id', v_payment_id
    );
END;
$$;

-- 9. Create views for easy monitoring
-- ------------------------------------------------------------
-- View for current subscription statuses
CREATE OR REPLACE VIEW subscription_status_summary AS
SELECT
    subscription_status,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE subscription_end_date > NOW()) as active_until_end,
    COUNT(*) FILTER (WHERE payment_retry_count > 0) as with_failed_payments
FROM public.profiles
WHERE subscription_status IS NOT NULL
GROUP BY subscription_status;

-- View for recent cancellations
CREATE OR REPLACE VIEW recent_cancellations AS
SELECT
    email,
    subscription_status,
    cancellation_date,
    subscription_end_date,
    cancellation_reason,
    lifetime_value
FROM public.profiles
WHERE cancellation_date IS NOT NULL
    AND cancellation_date > NOW() - INTERVAL '30 days'
ORDER BY cancellation_date DESC;

-- View for payment issues
CREATE OR REPLACE VIEW payment_issues AS
SELECT
    p.email,
    p.subscription_status,
    p.payment_retry_count,
    p.last_payment_error,
    f.amount,
    f.next_retry_date
FROM public.profiles p
LEFT JOIN public.failed_payments f ON f.user_id = p.id
WHERE p.payment_retry_count > 0
    OR f.recovered = false
ORDER BY p.payment_failed_date DESC;

-- 10. Grant necessary permissions
-- ------------------------------------------------------------
-- Grant permissions to service_role for functions
GRANT EXECUTE ON FUNCTION update_subscription_status TO service_role, anon;
GRANT EXECUTE ON FUNCTION log_payment_failure TO service_role, anon;

-- Grant view permissions
GRANT SELECT ON subscription_status_summary TO authenticated;
GRANT SELECT ON recent_cancellations TO authenticated;
GRANT SELECT ON payment_issues TO authenticated;

-- ============================================================
-- VERIFICATION QUERIES - Run these to check setup
-- ============================================================
/*
-- Check profiles table has all columns:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN (
    'stripe_subscription_id',
    'subscription_end_date',
    'cancellation_date',
    'payment_retry_count'
);

-- Check new tables exist:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'subscription_audit_log',
    'pabbly_webhook_logs',
    'failed_payments',
    'subscription_reconciliation'
);

-- Test the update function:
SELECT update_subscription_status(
    'test@example.com',
    'active',
    'cus_test123',
    'sub_test456',
    NOW() + INTERVAL '30 days'
);
*/

-- ============================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================
/*
-- To remove all changes:
DROP TABLE IF EXISTS public.subscription_audit_log CASCADE;
DROP TABLE IF EXISTS public.pabbly_webhook_logs CASCADE;
DROP TABLE IF EXISTS public.failed_payments CASCADE;
DROP TABLE IF EXISTS public.subscription_reconciliation CASCADE;
DROP FUNCTION IF EXISTS update_subscription_status CASCADE;
DROP FUNCTION IF EXISTS log_payment_failure CASCADE;
DROP VIEW IF EXISTS subscription_status_summary;
DROP VIEW IF EXISTS recent_cancellations;
DROP VIEW IF EXISTS payment_issues;

ALTER TABLE public.profiles
DROP COLUMN IF EXISTS stripe_subscription_id,
DROP COLUMN IF EXISTS subscription_end_date,
DROP COLUMN IF EXISTS cancellation_date,
DROP COLUMN IF EXISTS cancellation_reason,
DROP COLUMN IF EXISTS payment_failed_date,
DROP COLUMN IF EXISTS payment_retry_count,
DROP COLUMN IF EXISTS last_payment_error,
DROP COLUMN IF EXISTS subscription_interval,
DROP COLUMN IF EXISTS trial_end_date,
DROP COLUMN IF EXISTS lifetime_value;
*/