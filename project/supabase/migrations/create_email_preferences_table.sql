-- =====================================================
-- Email Preferences & Encharge Integration Tables
-- =====================================================
-- Manages user email preferences and Encharge sync

-- =====================================================
-- 1. Create email_preferences table
-- =====================================================
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Email preference flags
  email_notifications BOOLEAN DEFAULT true,
  wellness_reminders BOOLEAN DEFAULT true,
  weekly_insights BOOLEAN DEFAULT true,
  product_updates BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,

  -- Encharge sync status
  synced_to_encharge BOOLEAN DEFAULT false,
  encharge_person_id VARCHAR(255),
  encharge_sync_date TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_email_preferences_user_id ON email_preferences(user_id);
CREATE INDEX idx_email_preferences_notifications ON email_preferences(email_notifications) WHERE email_notifications = true;

-- =====================================================
-- 2. Create email_preference_logs table (for tracking changes)
-- =====================================================
CREATE TABLE IF NOT EXISTS email_preference_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  change_source VARCHAR(50) -- 'user', 'admin', 'system'
);

CREATE INDEX idx_email_preference_logs_user_id ON email_preference_logs(user_id);
CREATE INDEX idx_email_preference_logs_changed_at ON email_preference_logs(changed_at DESC);

-- =====================================================
-- 3. Create encharge_webhook_events table
-- =====================================================
CREATE TABLE IF NOT EXISTS encharge_webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'subscribed', 'unsubscribed', 'updated', 'bounced'
  email VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_encharge_events_email ON encharge_webhook_events(email);
CREATE INDEX idx_encharge_events_processed ON encharge_webhook_events(processed);
CREATE INDEX idx_encharge_events_received ON encharge_webhook_events(received_at DESC);

-- =====================================================
-- 4. Enable Row Level Security
-- =====================================================
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preference_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE encharge_webhook_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. RLS Policies for email_preferences
-- =====================================================
-- Users can view and update their own preferences
CREATE POLICY "Users can manage own email preferences"
  ON email_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage all preferences
CREATE POLICY "Service role can manage all preferences"
  ON email_preferences FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 6. RLS Policies for email_preference_logs
-- =====================================================
-- Users can view their own logs
CREATE POLICY "Users can view own preference logs"
  ON email_preference_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all logs
CREATE POLICY "Service role can manage all logs"
  ON email_preference_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 7. RLS Policies for encharge_webhook_events
-- =====================================================
-- Only service role can access webhook events
CREATE POLICY "Service role can manage webhook events"
  ON encharge_webhook_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 8. Function to update preferences
-- =====================================================
CREATE OR REPLACE FUNCTION update_email_preferences(
  p_user_id UUID,
  p_email_notifications BOOLEAN DEFAULT NULL,
  p_wellness_reminders BOOLEAN DEFAULT NULL,
  p_weekly_insights BOOLEAN DEFAULT NULL,
  p_product_updates BOOLEAN DEFAULT NULL,
  p_marketing_emails BOOLEAN DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Insert or update preferences
  INSERT INTO email_preferences (
    user_id,
    email_notifications,
    wellness_reminders,
    weekly_insights,
    product_updates,
    marketing_emails
  ) VALUES (
    p_user_id,
    COALESCE(p_email_notifications, true),
    COALESCE(p_wellness_reminders, true),
    COALESCE(p_weekly_insights, true),
    COALESCE(p_product_updates, false),
    COALESCE(p_marketing_emails, false)
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    email_notifications = COALESCE(p_email_notifications, email_preferences.email_notifications),
    wellness_reminders = COALESCE(p_wellness_reminders, email_preferences.wellness_reminders),
    weekly_insights = COALESCE(p_weekly_insights, email_preferences.weekly_insights),
    product_updates = COALESCE(p_product_updates, email_preferences.product_updates),
    marketing_emails = COALESCE(p_marketing_emails, email_preferences.marketing_emails),
    updated_at = CURRENT_TIMESTAMP
  RETURNING jsonb_build_object(
    'success', true,
    'email_notifications', email_notifications,
    'wellness_reminders', wellness_reminders,
    'weekly_insights', weekly_insights,
    'product_updates', product_updates,
    'marketing_emails', marketing_emails
  ) INTO v_result;

  -- Log the change
  INSERT INTO email_preference_logs (user_id, preferences, change_source)
  VALUES (p_user_id, v_result - 'success', 'user');

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. Function to handle Encharge webhook
-- =====================================================
CREATE OR REPLACE FUNCTION handle_encharge_webhook(
  p_event_type VARCHAR,
  p_email VARCHAR,
  p_payload JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;

  -- Record webhook event
  INSERT INTO encharge_webhook_events (
    event_type,
    email,
    user_id,
    payload,
    processed
  ) VALUES (
    p_event_type,
    p_email,
    v_user_id,
    p_payload,
    false
  );

  -- Handle different event types
  IF p_event_type = 'unsubscribed' AND v_user_id IS NOT NULL THEN
    -- User unsubscribed in Encharge, update our preferences
    UPDATE email_preferences
    SET
      email_notifications = false,
      wellness_reminders = false,
      weekly_insights = false,
      marketing_emails = false,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = v_user_id;

    -- Mark as processed
    UPDATE encharge_webhook_events
    SET processed = true, processed_at = CURRENT_TIMESTAMP
    WHERE email = p_email AND event_type = p_event_type AND processed = false;

    v_result := jsonb_build_object('success', true, 'message', 'User unsubscribed');

  ELSIF p_event_type = 'bounced' AND v_user_id IS NOT NULL THEN
    -- Email bounced, disable notifications
    UPDATE email_preferences
    SET
      email_notifications = false,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = v_user_id;

    -- Mark as processed
    UPDATE encharge_webhook_events
    SET processed = true, processed_at = CURRENT_TIMESTAMP
    WHERE email = p_email AND event_type = p_event_type AND processed = false;

    v_result := jsonb_build_object('success', true, 'message', 'Email bounced, notifications disabled');

  ELSE
    v_result := jsonb_build_object('success', true, 'message', 'Event recorded');
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. Function to get users for wellness reminders
-- =====================================================
CREATE OR REPLACE FUNCTION get_users_for_wellness_reminders()
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  full_name VARCHAR,
  last_reflection_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id as user_id,
    u.email,
    up.full_name,
    MAX(r.created_at::DATE) as last_reflection_date
  FROM auth.users u
  INNER JOIN email_preferences ep ON u.id = ep.user_id
  LEFT JOIN user_profiles up ON u.id = up.id
  LEFT JOIN reflections r ON u.id = r.user_id
  WHERE
    ep.email_notifications = true
    AND ep.wellness_reminders = true
    AND u.email IS NOT NULL
  GROUP BY u.id, u.email, up.full_name
  HAVING
    -- Users who haven't reflected in 7 days
    MAX(r.created_at) < CURRENT_DATE - INTERVAL '7 days'
    OR MAX(r.created_at) IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SUCCESS: Email Preferences System Created!
-- =====================================================
-- ✅ Email preferences table for user settings
-- ✅ Logging table for tracking changes
-- ✅ Encharge webhook integration table
-- ✅ Functions for updating preferences
-- ✅ Function for handling Encharge webhooks
-- ✅ Function to get users for wellness reminders
-- ✅ Row-level security for data protection