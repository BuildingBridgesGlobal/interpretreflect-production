-- Fix the reflection_entries table by adding missing column
-- Run this in Supabase SQL Editor

-- First, check if the column already exists
DO $$
BEGIN
    -- Add reflection_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'reflection_entries'
        AND column_name = 'reflection_id'
    ) THEN
        ALTER TABLE public.reflection_entries
        ADD COLUMN reflection_id TEXT NOT NULL DEFAULT 'legacy_' || gen_random_uuid()::text;

        RAISE NOTICE 'Added reflection_id column to reflection_entries table';
    ELSE
        RAISE NOTICE 'reflection_id column already exists';
    END IF;
END $$;

-- Remove the default after adding the column
ALTER TABLE public.reflection_entries
ALTER COLUMN reflection_id DROP DEFAULT;

-- Add comment for documentation
COMMENT ON COLUMN public.reflection_entries.reflection_id IS 'Unique identifier for this reflection session, can link prep to debrief';

-- Verify the table structure
SELECT
    column_name,
    data_type,
    is_nullable
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name = 'reflection_entries'
ORDER BY
    ordinal_position;