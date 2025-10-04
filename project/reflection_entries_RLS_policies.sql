-- RLS Policies for reflection_entries table
-- These policies ensure users can only access their own reflections

-- Enable RLS on the table (if not already enabled)
ALTER TABLE reflection_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to start fresh)
DROP POLICY IF EXISTS "Users can insert their own reflections" ON reflection_entries;
DROP POLICY IF EXISTS "Users can view their own reflections" ON reflection_entries;
DROP POLICY IF EXISTS "Users can update their own reflections" ON reflection_entries;
DROP POLICY IF EXISTS "Users can delete their own reflections" ON reflection_entries;

-- Policy 1: Users can INSERT their own reflections
CREATE POLICY "Users can insert their own reflections"
ON reflection_entries
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can SELECT/VIEW their own reflections
CREATE POLICY "Users can view their own reflections"
ON reflection_entries
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: Users can UPDATE their own reflections
CREATE POLICY "Users can update their own reflections"
ON reflection_entries
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can DELETE their own reflections
CREATE POLICY "Users can delete their own reflections"
ON reflection_entries
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Optional: If you want to allow anonymous users to insert (for testing)
-- Uncomment the following if needed:
/*
CREATE POLICY "Anonymous can insert reflections"
ON reflection_entries
FOR INSERT
TO anon
WITH CHECK (true);
*/