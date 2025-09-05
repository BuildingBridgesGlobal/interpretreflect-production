-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
-- Stores user subscription information

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_name TEXT CHECK (plan_name IN ('free', 'essential', 'professional', 'organization')) NOT NULL DEFAULT 'free',
  price DECIMAL(10,2) DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'inactive', 'trial', 'cancelled')) NOT NULL DEFAULT 'inactive',
  next_billing_date TIMESTAMP WITH TIME ZONE,
  payment_method JSONB,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  trial_starts_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancel_reason TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- INVOICES TABLE
-- ============================================
-- Stores invoice history

CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT UNIQUE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('paid', 'pending', 'failed', 'cancelled')) NOT NULL DEFAULT 'pending',
  description TEXT,
  invoice_pdf TEXT,
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice ON invoices(stripe_invoice_id);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage invoices" ON invoices
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- FUNCTION: Update subscription timestamp
-- ============================================
-- Automatically updates the updated_at timestamp

CREATE OR REPLACE FUNCTION update_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
DROP TRIGGER IF EXISTS update_subscriptions_timestamp ON subscriptions;
CREATE TRIGGER update_subscriptions_timestamp
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_timestamp();

-- ============================================
-- FUNCTION: Cancel subscription
-- ============================================
-- Handles subscription cancellation

CREATE OR REPLACE FUNCTION cancel_subscription(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE subscriptions
  SET 
    status = 'cancelled',
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Initialize user subscription
-- ============================================
-- Creates a free subscription entry when a new user signs up

CREATE OR REPLACE FUNCTION initialize_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan_name, price, status)
  VALUES (NEW.id, 'free', 0, 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_subscription();

-- ============================================
-- FUNCTION: Check subscription status
-- ============================================
-- Returns the current subscription status and details

CREATE OR REPLACE FUNCTION get_subscription_status(p_user_id UUID)
RETURNS TABLE(
  plan_name TEXT,
  status TEXT,
  is_premium BOOLEAN,
  trial_active BOOLEAN,
  days_until_billing INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.plan_name,
    s.status,
    s.plan_name != 'free' AS is_premium,
    s.status = 'trial' AND s.trial_ends_at > NOW() AS trial_active,
    CASE 
      WHEN s.next_billing_date IS NOT NULL THEN 
        EXTRACT(DAY FROM s.next_billing_date - NOW())::INTEGER
      ELSE NULL
    END AS days_until_billing
  FROM subscriptions s
  WHERE s.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEW: Subscription Overview
-- ============================================
-- Comprehensive view for subscription management

CREATE OR REPLACE VIEW subscription_overview AS
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

-- Grant access to authenticated users
GRANT SELECT ON subscription_overview TO authenticated;

-- ============================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ============================================

/*
-- Insert sample subscription
INSERT INTO subscriptions (user_id, plan_name, price, status, next_billing_date, payment_method)
VALUES (
  auth.uid(),
  'professional',
  24.00,
  'active',
  NOW() + INTERVAL '30 days',
  '{
    "type": "card",
    "brand": "Visa",
    "last4": "4242"
  }'::jsonb
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  price = EXCLUDED.price,
  status = EXCLUDED.status,
  next_billing_date = EXCLUDED.next_billing_date,
  payment_method = EXCLUDED.payment_method;

-- Insert sample invoices
INSERT INTO invoices (user_id, amount, status, description, invoice_pdf)
VALUES 
  (auth.uid(), 24.00, 'paid', 'Professional Plan - Monthly', '/invoices/2024-01.pdf'),
  (auth.uid(), 24.00, 'paid', 'Professional Plan - Monthly', '/invoices/2024-02.pdf');
*/