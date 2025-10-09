-- Simple diagnostic: Find ALL tables blocking user deletion

DO $$
DECLARE
  r RECORD;
  constraint_count INT := 0;
BEGIN
  RAISE NOTICE '=== Foreign Keys to auth.users WITHOUT CASCADE ===';

  FOR r IN
    SELECT
      tc.table_schema,
      tc.table_name,
      tc.constraint_name,
      kcu.column_name,
      rc.delete_rule
    FROM information_schema.table_constraints tc
    JOIN information_schema.referential_constraints rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name = 'users'
      AND ccu.table_schema = 'auth'
      AND rc.delete_rule != 'CASCADE'
    ORDER BY tc.table_schema, tc.table_name
  LOOP
    constraint_count := constraint_count + 1;
    RAISE NOTICE '❌ %.% (column: %) - Constraint: % - Delete Rule: %',
      r.table_schema, r.table_name, r.column_name, r.constraint_name, r.delete_rule;
  END LOOP;

  IF constraint_count = 0 THEN
    RAISE NOTICE '✅ All foreign keys have CASCADE DELETE';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE 'Found % constraints blocking user deletion', constraint_count;
  END IF;
END $$;
