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
        'pre_assignment_prep',
        'post_assignment_debrief', 
        'teaming_prep',
        'teaming_reflection',
        'mentoring_prep',
        'mentoring_reflection',
        'wellness_check_in',
        'compass_check',
        'breathing_practice',
        'body_awareness',
        'stress_reset',
        'burnout_assessment',
        'affirmation_studio',
        'emotion_mapping',
        'role_space_reflection',
        'direct_communication_reflection',
        'professional_boundaries_reset',
        'code_switch_reset',
        'technology_fatigue_reset',
        'between_languages_reset'
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

-- Team access policies (for shared team sessions)
CREATE POLICY "reflection_entries select team" ON public.reflection_entries
    FOR SELECT TO authenticated
    USING (
        team_id IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM public.team_members tm 
            WHERE tm.team_id = reflection_entries.team_id 
            AND tm.user_id = (SELECT auth.uid())
        )
    );

-- Comments for documentation
COMMENT ON TABLE public.reflection_entries IS 'Stores all wellness reflection data from various reflection types for user context and Elya AI integration';
COMMENT ON COLUMN public.reflection_entries.entry_kind IS 'Type of reflection: pre_assignment_prep, wellness_check_in, etc.';
COMMENT ON COLUMN public.reflection_entries.data IS 'JSON data containing the reflection responses and metrics';
COMMENT ON COLUMN public.reflection_entries.reflection_id IS 'Unique identifier for this reflection session, can link prep to debrief';
COMMENT ON COLUMN public.reflection_entries.team_id IS 'Optional team ID for team-based reflections';
COMMENT ON COLUMN public.reflection_entries.session_id IS 'Optional session ID for shared team reflection sessions';

-- Now create the complete Elya integration with reflection support
-- Function to get user context for Elya (with reflection data)
CREATE OR REPLACE FUNCTION public.get_user_context_for_elya(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    context_data JSONB := '{}'::jsonb;
    recent_reflections JSONB;
    conversation_history JSONB;
    user_summary JSONB;
BEGIN
    -- Get user context summary
    SELECT to_jsonb(ucs.*) INTO user_summary
    FROM public.user_context_summary ucs
    WHERE ucs.user_id = target_user_id;

    -- Get recent reflection entries (last 5 within 30 days)
    SELECT jsonb_agg(
        jsonb_build_object(
            'type', sub.entry_kind,
            'date', sub.created_at::date,
            'key_insights', CASE
                WHEN sub.data ? 'current_emotions' THEN sub.data->'current_emotions'
                WHEN sub.data ? 'feeling_word' THEN sub.data->'feeling_word'
                WHEN sub.data ? 'overall_feeling' THEN sub.data->'overall_feeling'
                WHEN sub.data ? 'experience_word' THEN sub.data->'experience_word'
                WHEN sub.data ? 'session_word' THEN sub.data->'session_word'
                ELSE NULL
            END,
            'stress_level', CASE
                WHEN sub.data ? 'stress_level' THEN sub.data->'stress_level'
                WHEN sub.data ? 'stress_anxiety_level' THEN sub.data->'stress_anxiety_level'
                WHEN sub.data ? 'current_stress_level' THEN sub.data->'current_stress_level'
                WHEN sub.data ? 'stress_level_post' THEN sub.data->'stress_level_post'
                ELSE NULL
            END,
            'energy_level', CASE
                WHEN sub.data ? 'energy_level' THEN sub.data->'energy_level'
                WHEN sub.data ? 'energy_level_post' THEN sub.data->'energy_level_post'
                WHEN sub.data ? 'physical_energy' THEN sub.data->'physical_energy'
                ELSE NULL
            END,
            'confidence_level', CASE
                WHEN sub.data ? 'confidence_level' THEN sub.data->'confidence_level'
                WHEN sub.data ? 'confidence_rating' THEN sub.data->'confidence_rating'
                WHEN sub.data ? 'future_confidence' THEN sub.data->'future_confidence'
                ELSE NULL
            END,
            'themes', CASE
                WHEN sub.data ? 'anticipated_challenges' THEN sub.data->'anticipated_challenges'
                WHEN sub.data ? 'significant_challenge' THEN sub.data->'significant_challenge'
                WHEN sub.data ? 'most_challenging_aspect' THEN sub.data->'most_challenging_aspect'
                ELSE NULL
            END
        )
        ORDER BY sub.created_at DESC
    ) INTO recent_reflections
    FROM (
        SELECT entry_kind, created_at, data
        FROM public.reflection_entries
        WHERE user_id = target_user_id
        AND created_at >= NOW() - INTERVAL '30 days'
        ORDER BY created_at DESC
        LIMIT 5
    ) sub;

    -- Get recent conversation context (last 10 within 7 days)
    SELECT jsonb_agg(
        jsonb_build_object(
            'sender', sub.sender,
            'content', CASE WHEN LENGTH(sub.content) > 200 THEN LEFT(sub.content, 200) || '...' ELSE sub.content END,
            'date', sub.created_at::date
        )
        ORDER BY sub.created_at DESC
    ) INTO conversation_history
    FROM (
        SELECT sender, content, created_at
        FROM public.elya_conversations
        WHERE user_id = target_user_id
        AND created_at >= NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 10
    ) sub;

    -- Build comprehensive context
    context_data := jsonb_build_object(
        'user_summary', COALESCE(user_summary, '{}'::jsonb),
        'recent_reflections', COALESCE(recent_reflections, '[]'::jsonb),
        'recent_conversations', COALESCE(conversation_history, '[]'::jsonb),
        'context_generated_at', NOW()
    );

    RETURN context_data;
END;
$$;

-- Trigger function to update user context based on new reflection data
CREATE OR REPLACE FUNCTION public.update_user_context_from_reflection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    reflection_data JSONB := NEW.data;
    current_emotions TEXT[];
    stress_level NUMERIC;
    energy_level NUMERIC;
    confidence_level NUMERIC;
    challenge_text TEXT;
    strategy_text TEXT;
BEGIN
    -- Extract emotions from various reflection types
    IF reflection_data ? 'current_emotions' THEN
        current_emotions := ARRAY(SELECT jsonb_array_elements_text(reflection_data->'current_emotions'));
    ELSIF reflection_data ? 'emotions_during' THEN
        current_emotions := ARRAY(SELECT jsonb_array_elements_text(reflection_data->'emotions_during'));
    END IF;

    -- Extract numeric indicators from various reflection types
    stress_level := COALESCE(
        (reflection_data->>'stress_level')::NUMERIC,
        (reflection_data->>'stress_anxiety_level')::NUMERIC,
        (reflection_data->>'current_stress_level')::NUMERIC,
        (reflection_data->>'stress_level_post')::NUMERIC
    );
    
    energy_level := COALESCE(
        (reflection_data->>'energy_level')::NUMERIC,
        (reflection_data->>'energy_level_post')::NUMERIC,
        (reflection_data->>'physical_energy')::NUMERIC
    );
    
    confidence_level := COALESCE(
        (reflection_data->>'confidence_level')::NUMERIC,
        (reflection_data->>'confidence_rating')::NUMERIC,
        (reflection_data->>'future_confidence')::NUMERIC
    );

    -- Extract challenge and strategy text
    challenge_text := COALESCE(
        reflection_data->>'anticipated_challenges',
        reflection_data->>'significant_challenge',
        reflection_data->>'most_challenging_aspect'
    );
    
    strategy_text := COALESCE(
        reflection_data->>'key_strategies',
        reflection_data->>'coping_strategies',
        reflection_data->>'strategies_used'
    );

    -- Update or insert user context summary
    INSERT INTO public.user_context_summary (
        user_id,
        recent_emotions,
        avg_stress_level,
        avg_energy_level,
        avg_confidence_level,
        common_challenges,
        effective_strategies,
        last_reflection_date,
        last_activity_date,
        updated_at
    )
    VALUES (
        NEW.user_id,
        current_emotions,
        stress_level,
        energy_level,
        confidence_level,
        CASE WHEN challenge_text IS NOT NULL THEN ARRAY[challenge_text] ELSE NULL END,
        CASE WHEN strategy_text IS NOT NULL THEN ARRAY[strategy_text] ELSE NULL END,
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        recent_emotions = CASE
            WHEN current_emotions IS NOT NULL THEN
                (SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(public.user_context_summary.recent_emotions, '{}'::text[]) || current_emotions)))[1:10]
            ELSE public.user_context_summary.recent_emotions
        END,
        common_challenges = CASE
            WHEN challenge_text IS NOT NULL THEN
                (SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(public.user_context_summary.common_challenges, '{}'::text[]) || ARRAY[challenge_text])))[1:10]
            ELSE public.user_context_summary.common_challenges
        END,
        effective_strategies = CASE
            WHEN strategy_text IS NOT NULL THEN
                (SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(public.user_context_summary.effective_strategies, '{}'::text[]) || ARRAY[strategy_text])))[1:10]
            ELSE public.user_context_summary.effective_strategies
        END,
        avg_stress_level = CASE
            WHEN stress_level IS NOT NULL THEN
                COALESCE((COALESCE(public.user_context_summary.avg_stress_level, 0) * 0.8 + stress_level * 0.2), stress_level)
            ELSE public.user_context_summary.avg_stress_level
        END,
        avg_energy_level = CASE
            WHEN energy_level IS NOT NULL THEN
                COALESCE((COALESCE(public.user_context_summary.avg_energy_level, 0) * 0.8 + energy_level * 0.2), energy_level)
            ELSE public.user_context_summary.avg_energy_level
        END,
        avg_confidence_level = CASE
            WHEN confidence_level IS NOT NULL THEN
                COALESCE((COALESCE(public.user_context_summary.avg_confidence_level, 0) * 0.8 + confidence_level * 0.2), confidence_level)
            ELSE public.user_context_summary.avg_confidence_level
        END,
        last_reflection_date = NOW(),
        last_activity_date = NOW(),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS update_context_on_reflection ON public.reflection_entries;
CREATE TRIGGER update_context_on_reflection
    AFTER INSERT ON public.reflection_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_context_from_reflection();