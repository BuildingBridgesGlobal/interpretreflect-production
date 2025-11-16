-- Add subscription tier tracking to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  ADD COLUMN subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
  ADD COLUMN stripe_customer_id TEXT UNIQUE,
  ADD COLUMN stripe_subscription_id TEXT UNIQUE,
  ADD COLUMN assignments_used_this_month INTEGER DEFAULT 0,
  ADD COLUMN assignments_reset_date DATE DEFAULT CURRENT_DATE;

-- Create index for faster subscription lookups
CREATE INDEX idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);
CREATE INDEX idx_user_profiles_stripe_customer ON user_profiles(stripe_customer_id);

-- Function to reset monthly assignment counter
CREATE OR REPLACE FUNCTION reset_monthly_assignment_counter()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE user_profiles
  SET
    assignments_used_this_month = 0,
    assignments_reset_date = CURRENT_DATE
  WHERE
    assignments_reset_date < CURRENT_DATE - INTERVAL '1 month';
END;
$$;

-- Create a cron job to reset counters monthly (requires pg_cron extension)
-- You'll need to run this manually in Supabase SQL Editor if pg_cron is available:
-- SELECT cron.schedule('reset-assignment-counters', '0 0 1 * *', 'SELECT reset_monthly_assignment_counter();');

COMMENT ON COLUMN user_profiles.subscription_tier IS 'User subscription level: free or pro';
COMMENT ON COLUMN user_profiles.subscription_status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN user_profiles.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN user_profiles.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN user_profiles.assignments_used_this_month IS 'Number of assignments created this billing period (Free tier: 5 limit)';
COMMENT ON COLUMN user_profiles.assignments_reset_date IS 'Date when assignment counter will reset';
