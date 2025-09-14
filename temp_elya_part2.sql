-- ELYA INTEGRATION SQL PART 2 (REFLECTION ENTRIES TABLE)
-- Copy this entire content and paste it into Supabase SQL Editor

-- Reflection Entries Table for Elya Integration
-- This table stores all wellness reflection data from various reflection types

-- Main reflection entries table
CREATE TABLE IF NOT EXISTS public.reflection_entries (
    id UUID DEFAULT extensions.gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reflection_id TEXT NOT NULL, -- Unique identifier for this reflection session
    entry_kind TEXT NOT NULL, -- Type of reflection (pre_assignment, post_assignment, wellness_check, etc.)
    team_id UUID, -- Optional: for team session tracking
    session_id TEXT, -- Optional: for shared team sessions
    data JSONB NOT NULL, -- The actual reflection data in JSON format
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Add constraint to ensure valid entry_kind values
    CONSTRAINT valid_entry_kind CHECK (entry_kind IN (
        ''pre_assignment_prep'',
        ''post_assignment_debrief'', 
        ''teaming_prep'',
        ''teaming_reflection'',
        ''mentoring_prep'',
        ''mentoring_reflection'',
        ''wellness_check_in'',
        ''compass_check'',
        ''breathing_practice'',
        ''body_awareness'',
        ''stress_reset'',
        ''burnout_assessment'',
        ''affirmation_studio'',
        ''emotion_mapping'',
        ''role_space_reflection'',
        ''direct_communication_reflection'',
        ''professional_boundaries_reset'',
        ''code_switch_reset'',
        ''technology_fatigue_reset'',
        ''between_languages_reset''
    ))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reflection_entries_user_id 
    ON public.reflection_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_reflection_entries_user_created 
    ON public.reflection_entries(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reflection_entries_kind 
    ON public.reflection_entries(entry_kind);

CREATE INDEX IF NOT EXISTS idx_reflection_entries_user_kind 
    ON public.reflection_entries(user_id, entry_kind, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reflection_entries_team 
    ON public.reflection_entries(team_id) WHERE team_id IS NOT NULL;

-- GIN index for JSONB data queries (for efficient searching within reflection data)
CREATE INDEX IF NOT EXISTS idx_reflection_entries_data_gin 
    ON public.reflection_entries USING gin(data);

-- Row Level Security
ALTER TABLE public.reflection_entries ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.reflection_entries TO authenticated;

-- RLS Policies
CREATE POLICY "reflection_entries select own" ON public.reflection_entries
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "reflection_entries insert own" ON public.reflection_entries
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "reflection_entries update own" ON public.reflection_entries
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "reflection_entries delete own" ON public.reflection_entries
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = user_id);
