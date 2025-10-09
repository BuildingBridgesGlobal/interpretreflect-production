-- =====================================================
-- Diagnostic and Fix for User Deletion Issue
-- =====================================================

-- First, check which tables exist and their CASCADE status
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== Foreign Key Constraints to auth.users ===';

  FOR r IN
    SELECT
      tc.table_name,
      tc.constraint_name,
      rc.delete_rule
    FROM information_schema.table_constraints tc
    JOIN information_schema.referential_constraints rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'user_id'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name
  LOOP
    IF r.delete_rule != 'CASCADE' THEN
      RAISE NOTICE '❌ % - Constraint: % - Delete Rule: %',
        r.table_name, r.constraint_name, r.delete_rule;
    ELSE
      RAISE NOTICE '✅ % - Has CASCADE', r.table_name;
    END IF;
  END LOOP;
END $$;

-- Fix encharge_webhook_events (if exists and needs fixing)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'encharge_webhook_events'
  ) THEN
    ALTER TABLE encharge_webhook_events
      DROP CONSTRAINT IF EXISTS encharge_webhook_events_user_id_fkey,
      ADD CONSTRAINT encharge_webhook_events_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed: encharge_webhook_events';
  END IF;
END $$;

-- Fix email_logs (if exists and needs fixing)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'email_logs'
  ) THEN
    ALTER TABLE email_logs
      DROP CONSTRAINT IF EXISTS email_logs_user_id_fkey,
      ADD CONSTRAINT email_logs_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed: email_logs';
  END IF;
END $$;

-- Final verification
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
    RAISE NOTICE '';
    RAISE NOTICE '✅ SUCCESS: All tables now have CASCADE DELETE';
    RAISE NOTICE 'You can now delete users from the Supabase dashboard';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  WARNING: % tables still missing CASCADE DELETE', missing_count;
  END IF;
END $$;
