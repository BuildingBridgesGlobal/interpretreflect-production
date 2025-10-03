-- REMAINING TABLES FOR REFLECTION TRACKING
-- Run this AFTER the reflection_entries table updates

-- 1. Create user_context_summary table (for AI integration and Growth Insights)
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

-- Enable RLS for user_context_summary
ALTER TABLE public.user_context_summary ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_context_summary TO authenticated;

CREATE POLICY "Users can view own context" ON public.user_context_summary
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own context" ON public.user_context_summary
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own context" ON public.user_context_summary
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 2. Create stress_reset_logs table (for stress reset tracking)
CREATE TABLE IF NOT EXISTS public.stress_reset_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_type TEXT NOT NULL,
    duration_minutes INTEGER,
    stress_level_before INTEGER,
    stress_level_after INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for stress_reset_logs
ALTER TABLE public.stress_reset_logs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stress_reset_logs TO authenticated;

CREATE POLICY "Users can view own stress logs" ON public.stress_reset_logs
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stress logs" ON public.stress_reset_logs
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 3. Create daily_activities table (for streak tracking)
CREATE TABLE IF NOT EXISTS public.daily_activities (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    activities_completed TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, activity_date)
);

-- Enable RLS for daily_activities
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_activities TO authenticated;

CREATE POLICY "Users can view own activities" ON public.daily_activities
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON public.daily_activities
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON public.daily_activities
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 4. Create team_members table (optional - for team reflections)
CREATE TABLE IF NOT EXISTS public.team_members (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    team_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Enable RLS for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;

CREATE POLICY "Users can view own team memberships" ON public.team_members
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- DONE! All supporting tables are now created.