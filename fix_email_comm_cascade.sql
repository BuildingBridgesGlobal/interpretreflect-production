-- =====================================================
-- Fix CASCADE DELETE for email_events and comm_events
-- =====================================================
-- This will allow users to be deleted from Supabase dashboard

-- Fix email_events table
ALTER TABLE public.email_events
  DROP CONSTRAINT IF EXISTS email_events_user_id_fkey,
  ADD CONSTRAINT email_events_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- Fix comm_events table
ALTER TABLE public.comm_events
  DROP CONSTRAINT IF EXISTS comm_events_user_id_fkey,
  ADD CONSTRAINT comm_events_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- Verify the fix
DO $$
DECLARE
  missing_count INT;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM information_schema.table_constraints tc
  JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id'
    AND tc.table_schema = 'public'
    AND rc.delete_rule != 'CASCADE';

  IF missing_count = 0 THEN
    RAISE NOTICE '✅ SUCCESS: All tables now have CASCADE DELETE';
    RAISE NOTICE 'You can now delete users from the Supabase dashboard';
  ELSE
    RAISE NOTICE '⚠️  WARNING: % tables still missing CASCADE DELETE', missing_count;
  END IF;
END $$;
