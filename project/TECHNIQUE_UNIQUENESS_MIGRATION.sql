-- =====================================================
-- Migration: Add Uniqueness Constraint to Technique Usage
-- Ensures each user has unique technique names (case-insensitive)
-- =====================================================

-- Target table: technique_usage
-- Requirement: Each user should have unique technique names (case-insensitive)
-- Solution: Using functional unique index (no extensions needed)

-- Step 1: Check current state of the table
SELECT 'Current technique_usage structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'technique_usage'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check for duplicate techniques (case-insensitive) before adding constraint
SELECT 'Checking for duplicate techniques per user:' as info;
WITH duplicate_check AS (
  SELECT
    user_id,
    LOWER(technique_name) as technique_lower,
    COUNT(*) as count,
    STRING_AGG(technique_name, ', ') as variations
  FROM public.technique_usage
  GROUP BY user_id, LOWER(technique_name)
  HAVING COUNT(*) > 1
)
SELECT
  user_id,
  technique_lower,
  count as duplicate_count,
  variations
FROM duplicate_check;

-- Step 3: Merge duplicates if they exist (keeping the one with highest usage count)
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Check if there are duplicates
  SELECT COUNT(*) INTO v_count
  FROM (
    SELECT user_id, LOWER(technique_name)
    FROM public.technique_usage
    GROUP BY user_id, LOWER(technique_name)
    HAVING COUNT(*) > 1
  ) dupes;

  IF v_count > 0 THEN
    RAISE NOTICE 'Found % duplicate technique entries. Merging...', v_count;

    -- For each duplicate, keep the one with highest usage_count and delete others
    WITH duplicates AS (
      SELECT
        id,
        user_id,
        technique_name,
        LOWER(technique_name) as technique_lower,
        usage_count,
        ROW_NUMBER() OVER (
          PARTITION BY user_id, LOWER(technique_name)
          ORDER BY usage_count DESC, created_at DESC
        ) as rn
      FROM public.technique_usage
    ),
    to_keep AS (
      SELECT id, user_id, technique_lower, usage_count
      FROM duplicates
      WHERE rn = 1
    ),
    to_delete AS (
      SELECT d.id, d.user_id, d.technique_lower
      FROM duplicates d
      WHERE d.rn > 1
    ),
    aggregated AS (
      -- Sum up usage counts from duplicates
      SELECT
        k.id as keep_id,
        SUM(d.usage_count) as total_usage
      FROM to_keep k
      JOIN duplicates d ON k.user_id = d.user_id
        AND k.technique_lower = d.technique_lower
      GROUP BY k.id
      HAVING COUNT(*) > 1  -- Only where there were actual duplicates
    )
    -- Update the kept record with total usage count
    UPDATE public.technique_usage t
    SET usage_count = a.total_usage,
        notes = COALESCE(t.notes || ' ', '') || '[Merged duplicate entries]'
    FROM aggregated a
    WHERE t.id = a.keep_id;

    -- Delete the duplicate entries
    DELETE FROM public.technique_usage
    WHERE id IN (
      SELECT id
      FROM (
        SELECT
          id,
          ROW_NUMBER() OVER (
            PARTITION BY user_id, LOWER(technique_name)
            ORDER BY usage_count DESC, created_at DESC
          ) as rn
        FROM public.technique_usage
      ) ranked
      WHERE rn > 1
    );

    RAISE NOTICE 'Duplicates merged successfully';
  ELSE
    RAISE NOTICE 'No duplicate techniques found';
  END IF;
END $$;

-- Step 4: Create the unique index for case-insensitive technique names per user
DROP INDEX IF EXISTS idx_technique_usage_unique_name;
CREATE UNIQUE INDEX idx_technique_usage_unique_name
  ON public.technique_usage (user_id, LOWER(technique_name));

-- Step 5: Add a comment to document the constraint
COMMENT ON INDEX idx_technique_usage_unique_name IS
  'Ensures each user has unique technique names (case-insensitive)';

-- Step 6: Create a function to handle upserts (insert or update)
CREATE OR REPLACE FUNCTION public.upsert_technique_usage(
  p_user_id UUID,
  p_technique_name TEXT,
  p_technique_category TEXT DEFAULT NULL,
  p_effectiveness_rating INTEGER DEFAULT NULL,
  p_increment_usage BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Try to find existing technique (case-insensitive)
  SELECT id INTO v_id
  FROM public.technique_usage
  WHERE user_id = p_user_id
    AND LOWER(technique_name) = LOWER(p_technique_name);

  IF v_id IS NULL THEN
    -- Insert new technique
    INSERT INTO public.technique_usage (
      user_id,
      technique_name,
      technique_category,
      usage_count,
      effectiveness_rating,
      last_used
    )
    VALUES (
      p_user_id,
      p_technique_name,
      p_technique_category,
      1,
      p_effectiveness_rating,
      NOW()
    )
    RETURNING id INTO v_id;
  ELSE
    -- Update existing technique
    UPDATE public.technique_usage
    SET
      usage_count = CASE
        WHEN p_increment_usage THEN usage_count + 1
        ELSE usage_count
      END,
      effectiveness_rating = COALESCE(p_effectiveness_rating, effectiveness_rating),
      technique_category = COALESCE(p_technique_category, technique_category),
      last_used = NOW()
    WHERE id = v_id;
  END IF;

  RETURN v_id;
END;
$$;

-- Step 7: Verify the migration
SELECT 'Verification:' as info;

-- Check that no duplicates remain
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ No duplicate techniques found'
    ELSE '❌ Duplicates still exist: ' || COUNT(*) || ' cases'
  END as duplicate_check
FROM (
  SELECT user_id, LOWER(technique_name)
  FROM public.technique_usage
  GROUP BY user_id, LOWER(technique_name)
  HAVING COUNT(*) > 1
) dupes;

-- Show index status
SELECT
  indexname,
  CASE
    WHEN indexdef LIKE '%LOWER(technique_name)%' THEN '✅ Case-insensitive unique index created'
    ELSE '❌ Index not found'
  END as status
FROM pg_indexes
WHERE tablename = 'technique_usage'
  AND indexname = 'idx_technique_usage_unique_name';

-- Show sample techniques per user (top 5)
SELECT 'Sample technique entries:' as info;
SELECT
  user_id,
  COUNT(DISTINCT LOWER(technique_name)) as unique_techniques,
  COUNT(*) as total_entries,
  STRING_AGG(technique_name || ' (' || usage_count || 'x)', ', ' ORDER BY usage_count DESC) as techniques
FROM public.technique_usage
GROUP BY user_id
LIMIT 5;

-- Final message
SELECT '✅ Technique uniqueness migration complete!' as message,
       'Each user now has case-insensitive unique technique names' as details;