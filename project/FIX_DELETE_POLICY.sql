-- Fix delete policy for reflection_entries
-- This ensures users can delete their own reflections

-- First, check if RLS is enabled
ALTER TABLE public.reflection_entries ENABLE ROW LEVEL SECURITY;

-- Drop any existing delete policies to avoid conflicts
DO $$
BEGIN
    -- Drop all delete policies on reflection_entries
    FOR r IN (
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'reflection_entries'
        AND cmd = 'DELETE'
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.reflection_entries', r.policyname);
    END LOOP;
END $$;

-- Create the delete policy
CREATE POLICY "Users can delete own reflections"
ON public.reflection_entries
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Verify the policy was created
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'reflection_entries'
    AND cmd = 'DELETE';

-- Test that user can see their own reflections (for verification)
SELECT COUNT(*) as reflection_count
FROM public.reflection_entries
WHERE user_id = auth.uid();