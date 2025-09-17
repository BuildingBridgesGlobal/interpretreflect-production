-- Comprehensive Payment Tracking Schema for InterpretReflect
-- This schema handles payments, subscriptions, invoices, and analytics

-- 1. Customers table (links Stripe customers to users)
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Subscriptions table (tracks active and past subscriptions)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL, -- active, canceled, past_due, trialing, etc.
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Payments table (tracks all successful payments)
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  amount_paid INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- succeeded, failed, processing
  description TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Invoices table (for record keeping and tax purposes)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  invoice_number TEXT,
  amount_due INTEGER NOT NULL, -- in cents
  amount_paid INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- draft, open, paid, void, uncollectible
  invoice_pdf TEXT,
  hosted_invoice_url TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Payment methods table (for managing customer payment methods)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- card, bank_account, etc.
  card_brand TEXT, -- visa, mastercard, amex, etc.
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Webhook events table (for idempotency and debugging)
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  data JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 7. Revenue analytics table (for business metrics)
CREATE TABLE IF NOT EXISTS revenue_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  new_subscriptions INTEGER DEFAULT 0,
  canceled_subscriptions INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0, -- in cents
  mrr INTEGER DEFAULT 0, -- Monthly Recurring Revenue in cents
  active_subscriptions INTEGER DEFAULT 0,
  trial_conversions INTEGER DEFAULT 0,
  churn_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- 8. Failed payments table (for recovery and analytics)
CREATE TABLE IF NOT EXISTS failed_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  failure_code TEXT,
  failure_message TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  recovered BOOLEAN DEFAULT FALSE,
  recovered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_webhook_events_type ON webhook_events(type);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_revenue_analytics_date ON revenue_analytics(date);
CREATE INDEX idx_failed_payments_customer_id ON failed_payments(customer_id);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only see their own data)
CREATE POLICY "Users can view own customer data" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own payment methods" ON payment_methods
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- Admin policies (you'll need to create an admin role)
CREATE POLICY "Admins can view all webhook events" ON webhook_events
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can view revenue analytics" ON revenue_analytics
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can view failed payments" ON failed_payments
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate daily revenue analytics
CREATE OR REPLACE FUNCTION calculate_daily_revenue_analytics(target_date DATE)
RETURNS VOID AS $$
DECLARE
  v_new_subs INTEGER;
  v_canceled_subs INTEGER;
  v_total_revenue INTEGER;
  v_mrr INTEGER;
  v_active_subs INTEGER;
  v_trial_conversions INTEGER;
  v_churn_rate DECIMAL(5,2);
BEGIN
  -- Calculate metrics for the given date
  
  -- New subscriptions
  SELECT COUNT(*) INTO v_new_subs
  FROM subscriptions
  WHERE DATE(created_at) = target_date;
  
  -- Canceled subscriptions
  SELECT COUNT(*) INTO v_canceled_subs
  FROM subscriptions
  WHERE DATE(canceled_at) = target_date;
  
  -- Total revenue for the day
  SELECT COALESCE(SUM(amount_paid), 0) INTO v_total_revenue
  FROM payments
  WHERE DATE(created_at) = target_date
  AND status = 'succeeded';
  
  -- Active subscriptions count
  SELECT COUNT(*) INTO v_active_subs
  FROM subscriptions
  WHERE status = 'active'
  AND (target_date BETWEEN current_period_start AND current_period_end);
  
  -- Calculate MRR (assuming monthly subscriptions)
  SELECT COALESCE(SUM(1299), 0) INTO v_mrr -- $12.99 per subscription in cents
  FROM subscriptions
  WHERE status = 'active'
  AND (target_date BETWEEN current_period_start AND current_period_end);
  
  -- Trial conversions
  SELECT COUNT(*) INTO v_trial_conversions
  FROM subscriptions
  WHERE DATE(trial_end) = target_date
  AND status = 'active';
  
  -- Calculate churn rate
  IF v_active_subs > 0 THEN
    v_churn_rate := (v_canceled_subs::DECIMAL / v_active_subs) * 100;
  ELSE
    v_churn_rate := 0;
  END IF;
  
  -- Insert or update the analytics record
  INSERT INTO revenue_analytics (
    date, new_subscriptions, canceled_subscriptions, 
    total_revenue, mrr, active_subscriptions, 
    trial_conversions, churn_rate
  ) VALUES (
    target_date, v_new_subs, v_canceled_subs,
    v_total_revenue, v_mrr, v_active_subs,
    v_trial_conversions, v_churn_rate
  )
  ON CONFLICT (date) DO UPDATE SET
    new_subscriptions = EXCLUDED.new_subscriptions,
    canceled_subscriptions = EXCLUDED.canceled_subscriptions,
    total_revenue = EXCLUDED.total_revenue,
    mrr = EXCLUDED.mrr,
    active_subscriptions = EXCLUDED.active_subscriptions,
    trial_conversions = EXCLUDED.trial_conversions,
    churn_rate = EXCLUDED.churn_rate;
END;
$$ LANGUAGE plpgsql;

-- Create a view for current subscription status
CREATE OR REPLACE VIEW user_subscription_status AS
SELECT 
  u.id as user_id,
  u.email,
  c.stripe_customer_id,
  s.stripe_subscription_id,
  s.status as subscription_status,
  s.current_period_end,
  s.cancel_at_period_end,
  CASE 
    WHEN s.status = 'active' AND s.current_period_end > NOW() THEN true
    ELSE false
  END as has_active_subscription
FROM auth.users u
LEFT JOIN customers c ON u.id = c.user_id
LEFT JOIN subscriptions s ON c.id = s.customer_id
WHERE s.id = (
  SELECT id FROM subscriptions 
  WHERE customer_id = c.id 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Grant access to the view
GRANT SELECT ON user_subscription_status TO authenticated;