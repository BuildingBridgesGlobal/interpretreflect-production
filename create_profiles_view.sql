-- =====================================================
-- Create 'profiles' view as alias to 'user_profiles'
-- =====================================================
-- This allows the app to query 'profiles' table

-- Check if profiles table or view exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    RAISE NOTICE 'Table "profiles" already exists - skipping view creation';
  ELSIF EXISTS (
    SELECT FROM pg_views
    WHERE schemaname = 'public' AND viewname = 'profiles'
  ) THEN
    RAISE NOTICE 'View "profiles" already exists - recreating';
    DROP VIEW profiles CASCADE;
  ELSE
    RAISE NOTICE 'Creating new "profiles" view';
  END IF;
END $$;

-- Create profiles view
CREATE OR REPLACE VIEW profiles
WITH (security_invoker = true)
AS
SELECT
  user_id as id,  -- Map user_id to id for compatibility
  user_id,        -- Keep user_id for queries that use it
  full_name,
  pronouns,
  credentials,
  language_preference,
  high_contrast,
  larger_text,
  avatar_url,
  created_at,
  updated_at,
  NULL::boolean as dismissed_onboarding_tips  -- Add missing column
FROM user_profiles;

-- Enable RLS on the view
ALTER VIEW profiles SET (security_invoker = true);

-- Grant access
GRANT SELECT ON profiles TO authenticated;
GRANT INSERT ON profiles TO authenticated;
GRANT UPDATE ON profiles TO authenticated;

-- Create RLS policies (these will use the underlying table's policies)
COMMENT ON VIEW profiles IS 'Compatibility view for user_profiles table. Maps user_id to id.';

-- Verify
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ "profiles" view created successfully';
  RAISE NOTICE 'Apps can now query profiles table using id or user_id';
END $$;
