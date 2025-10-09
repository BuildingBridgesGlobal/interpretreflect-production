-- =====================================================
-- Fix missing CASCADE DELETE constraints
-- =====================================================
-- This allows users to be deleted from Supabase dashboard

-- Fix email_logs table
ALTER TABLE email_logs
  DROP CONSTRAINT IF EXISTS email_logs_user_id_fkey,
  ADD CONSTRAINT email_logs_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- Fix encharge_webhook_events table
ALTER TABLE encharge_webhook_events
  DROP CONSTRAINT IF EXISTS encharge_webhook_events_user_id_fkey,
  ADD CONSTRAINT encharge_webhook_events_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'CASCADE DELETE constraints added successfully';
  RAISE NOTICE 'Users can now be deleted from Supabase dashboard';
END $$;
