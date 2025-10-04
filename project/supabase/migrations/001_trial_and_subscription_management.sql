-- Trial and Subscription Management Tables
-- This migration creates all necessary tables for managing trials, subscriptions, and email automation

-- 1. Update profiles table to include trial and subscription info
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_started_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'trial', 'active', 'cancelled', 'past_due'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan text CHECK (subscription_plan IN ('trial', 'basic', 'professional', 'enterprise'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS encharge_subscriber_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;

-- 2. Create email_events table for tracking email automation
CREATE TABLE IF NOT EXISTS email_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'trial_started',
    'trial_ending_soon',
    'trial_ended',
    'subscription_started',
    'subscription_cancelled',
    'payment_failed',
    'onboarding_welcome',
    'onboarding_day_2',
    'onboarding_day_3'
  )),
  sent_at timestamptz DEFAULT now(),
  encharge_event_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3. Create subscription_events table for tracking all subscription changes
CREATE TABLE IF NOT EXISTS subscription_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'trial_started',
    'trial_converted',
    'subscription_created',
    'subscription_updated',
    'subscription_cancelled',
    'subscription_renewed',
    'payment_succeeded',
    'payment_failed'
  )),
  stripe_event_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 4. Create trial_conversions table for analytics
CREATE TABLE IF NOT EXISTS trial_conversions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  trial_started_at timestamptz NOT NULL,
  trial_ended_at timestamptz,
  converted_at timestamptz,
  conversion_plan text,
  conversion_revenue numeric(10,2),
  trial_engagement_score integer DEFAULT 0,
  features_used text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Create onboarding_progress table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_step integer DEFAULT 0,
  completed_steps jsonb DEFAULT '[]'::jsonb,
  profile_completed boolean DEFAULT false,
  first_tool_used boolean DEFAULT false,
  elya_introduced boolean DEFAULT false,
  notification_preferences_set boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON profiles(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_email_events_user_id ON email_events(user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_conversions_user_id ON trial_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON onboarding_progress(user_id);

-- 7. Create functions for trial management

-- Function to start a trial for a user
CREATE OR REPLACE FUNCTION start_user_trial(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Update profile with trial info
  UPDATE profiles
  SET
    trial_started_at = now(),
    trial_ends_at = now() + interval '3 days',
    subscription_status = 'trial',
    subscription_plan = 'trial',
    updated_at = now()
  WHERE id = user_id
  AND (subscription_status IS NULL OR subscription_status = 'inactive');

  -- Insert trial event
  INSERT INTO subscription_events (user_id, event_type, metadata)
  VALUES (user_id, 'trial_started', jsonb_build_object('trial_duration_days', 3));

  -- Insert trial conversion tracking record
  INSERT INTO trial_conversions (user_id, trial_started_at)
  VALUES (user_id, now())
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert onboarding progress record
  INSERT INTO onboarding_progress (user_id)
  VALUES (user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Return success result
  SELECT jsonb_build_object(
    'success', true,
    'trial_ends_at', trial_ends_at,
    'message', 'Trial started successfully'
  ) INTO result
  FROM profiles
  WHERE id = user_id;

  RETURN result;
END;
$$;

-- Function to check trial status
CREATE OR REPLACE FUNCTION check_trial_status(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  profile_record RECORD;
  result jsonb;
BEGIN
  SELECT
    subscription_status,
    trial_started_at,
    trial_ends_at,
    CASE
      WHEN trial_ends_at IS NOT NULL AND trial_ends_at > now() THEN
        EXTRACT(EPOCH FROM (trial_ends_at - now()))::integer
      ELSE 0
    END as seconds_remaining
  INTO profile_record
  FROM profiles
  WHERE id = user_id;

  result := jsonb_build_object(
    'is_trial', profile_record.subscription_status = 'trial',
    'trial_active', profile_record.trial_ends_at IS NOT NULL AND profile_record.trial_ends_at > now(),
    'trial_started_at', profile_record.trial_started_at,
    'trial_ends_at', profile_record.trial_ends_at,
    'seconds_remaining', profile_record.seconds_remaining,
    'subscription_status', profile_record.subscription_status
  );

  RETURN result;
END;
$$;

-- 8. Create RLS policies
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see their own email events
CREATE POLICY "Users can view own email events" ON email_events
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their own subscription events
CREATE POLICY "Users can view own subscription events" ON subscription_events
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their own trial conversion data
CREATE POLICY "Users can view own trial conversions" ON trial_conversions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view and update their own onboarding progress
CREATE POLICY "Users can view own onboarding progress" ON onboarding_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress" ON onboarding_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- 9. Create a function to handle Encharge webhook events
CREATE OR REPLACE FUNCTION handle_encharge_event(
  user_email text,
  event_type text,
  encharge_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  result jsonb;
BEGIN
  -- Find user by email
  SELECT id INTO user_record
  FROM auth.users
  WHERE email = user_email;

  IF user_record.id IS NOT NULL THEN
    -- Update encharge subscriber ID if provided
    IF encharge_id IS NOT NULL THEN
      UPDATE profiles
      SET encharge_subscriber_id = encharge_id
      WHERE id = user_record.id;
    END IF;

    -- Log the email event
    INSERT INTO email_events (user_id, event_type, encharge_event_id)
    VALUES (user_record.id, event_type, encharge_id);

    result := jsonb_build_object('success', true, 'user_id', user_record.id);
  ELSE
    result := jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  RETURN result;
END;
$$;

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;