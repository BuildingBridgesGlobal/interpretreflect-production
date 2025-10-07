-- Add database-level subscription validation for auth sign-ins
-- This provides an additional layer of security beyond application-level checks

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.check_subscription_on_signin()
RETURNS TRIGGER AS $$
DECLARE
  active_sub_count INTEGER;
BEGIN
  -- Skip check for password reset and other auth operations
  IF NEW.aud = 'authenticated' THEN
    -- Check if user has an active subscription
    SELECT COUNT(*) INTO active_sub_count
    FROM public.subscriptions
    WHERE user_id = NEW.id
    AND status = 'active'
    LIMIT 1;

    -- If no active subscription, prevent sign-in
    IF active_sub_count = 0 THEN
      RAISE EXCEPTION 'No active subscription found. Please subscribe to continue.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Supabase auth.users table is managed by Supabase Auth
-- We cannot add triggers to it directly
-- This function is here for reference if needed in custom auth flows

-- Instead, create a view for easy subscription status checking
CREATE OR REPLACE VIEW public.active_subscribers AS
SELECT
  u.id,
  u.email,
  s.status as subscription_status,
  s.current_period_end,
  p.subscription_status as profile_status
FROM auth.users u
INNER JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.subscriptions s ON s.user_id = u.id AND s.status = 'active'
WHERE s.status = 'active';

-- Grant access to authenticated users
GRANT SELECT ON public.active_subscribers TO authenticated;

COMMENT ON VIEW public.active_subscribers IS 'View of users with active subscriptions - used for quick validation';
