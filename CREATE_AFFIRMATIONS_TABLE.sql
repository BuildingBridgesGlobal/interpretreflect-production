-- Create affirmations table to stop 404 errors
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.affirmations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    affirmation_type TEXT,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, affirmation_type, created_at)
);

-- Enable RLS
ALTER TABLE public.affirmations ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.affirmations TO authenticated;

-- Create RLS policies
CREATE POLICY "Users can view own affirmations" ON public.affirmations
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affirmations" ON public.affirmations
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affirmations" ON public.affirmations
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own affirmations" ON public.affirmations
    FOR DELETE TO authenticated USING (auth.uid() = user_id);