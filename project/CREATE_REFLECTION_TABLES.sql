-- ESSENTIAL TABLES FOR REFLECTION TRACKING
-- Run this in your Supabase SQL Editor

-- 1. Create reflection_entries table
CREATE TABLE IF NOT EXISTS public.reflection_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reflection_id TEXT NOT NULL,
    entry_kind TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reflection_entries_user_id
    ON public.reflection_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_reflection_entries_user_created
    ON public.reflection_entries(user_id, created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE public.reflection_entries ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies so users can only see their own reflections
CREATE POLICY "Users can view own reflections" ON public.reflection_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON public.reflection_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON public.reflection_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON public.reflection_entries
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Create user_context_summary table (for Elya AI integration)
CREATE TABLE IF NOT EXISTS public.user_context_summary (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    recent_emotions TEXT[],
    avg_stress_level NUMERIC,
    avg_energy_level NUMERIC,
    avg_confidence_level NUMERIC,
    common_challenges TEXT[],
    effective_strategies TEXT[],
    last_reflection_date TIMESTAMPTZ,
    last_activity_date TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable RLS for user_context_summary
ALTER TABLE public.user_context_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own context" ON public.user_context_summary
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own context" ON public.user_context_summary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own context" ON public.user_context_summary
    FOR UPDATE USING (auth.uid() = user_id);

-- 7. Create stress_reset_logs table (for stress reset tracking)
CREATE TABLE IF NOT EXISTS public.stress_reset_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_type TEXT NOT NULL,
    duration_minutes INTEGER,
    stress_level_before INTEGER,
    stress_level_after INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enable RLS for stress_reset_logs
ALTER TABLE public.stress_reset_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stress logs" ON public.stress_reset_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stress logs" ON public.stress_reset_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. Create daily_activities table (for streak tracking)
CREATE TABLE IF NOT EXISTS public.daily_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    activities_completed TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, activity_date)
);

-- 10. Enable RLS for daily_activities
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" ON public.daily_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON public.daily_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON public.daily_activities
    FOR UPDATE USING (auth.uid() = user_id);

-- DONE! Your reflection tracking tables are now ready.
-- Your app should now be able to save and retrieve reflections properly.