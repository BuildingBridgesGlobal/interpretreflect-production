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

-- Enhanced Elya integration functions
CREATE OR REPLACE FUNCTION public.get_user_context_for_elya(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
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
$function$;

-- Trigger function to update user context based on new reflection data
CREATE OR REPLACE FUNCTION public.update_user_context_from_reflection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    reflection_data JSONB := NEW.data;
    current_emotions TEXT[];
    stress_level NUMERIC;
    energy_level NUMERIC;
    confidence_level NUMERIC;
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

    -- Update or insert user context summary
    INSERT INTO public.user_context_summary (
        user_id,
        recent_emotions,
        avg_stress_level,
        avg_energy_level,
        avg_confidence_level,
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
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS update_context_on_reflection ON public.reflection_entries;
CREATE TRIGGER update_context_on_reflection
    AFTER INSERT ON public.reflection_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_context_from_reflection();

-- ===================================================================
-- PART 2: ADVANCED ELYA INTEGRATION FEATURES
-- ===================================================================

-- Function to save Elya conversation messages
CREATE OR REPLACE FUNCTION public.save_elya_conversation(
    p_user_id UUID,
    p_session_id TEXT,
    p_message_id TEXT,
    p_sender TEXT,
    p_content TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
    conversation_id UUID;
BEGIN
    INSERT INTO public.elya_conversations (
        user_id,
        session_id,
        message_id,
        sender,
        content,
        metadata,
        created_at,
        updated_at
    )
    VALUES (
        p_user_id,
        p_session_id,
        p_message_id,
        p_sender,
        p_content,
        p_metadata,
        NOW(),
        NOW()
    )
    RETURNING id INTO conversation_id;
    
    RETURN conversation_id;
END;
$function$;

-- Function to get personalized wellness insights for Elya
CREATE OR REPLACE FUNCTION public.get_wellness_insights_for_elya(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
    insights JSONB := '{}'::jsonb;
    burnout_score NUMERIC;
    wellness_trend TEXT;
    recent_challenges JSONB;
    effective_strategies JSONB;
BEGIN
    -- Calculate burnout risk score based on recent reflections
    SELECT 
        AVG(CASE 
            WHEN (data->>'stress_level')::NUMERIC > 7 THEN 1
            WHEN (data->>'stress_level')::NUMERIC > 5 THEN 0.5
            ELSE 0
        END) * 100 INTO burnout_score
    FROM public.reflection_entries
    WHERE user_id = target_user_id
        AND created_at >= NOW() - INTERVAL '14 days'
        AND data ? 'stress_level';
    
    -- Determine wellness trend
    wellness_trend := CASE
        WHEN burnout_score >= 70 THEN 'declining'
        WHEN burnout_score >= 40 THEN 'stable'
        ELSE 'improving'
    END;
    
    -- Get recent challenges from reflections
    SELECT jsonb_agg(DISTINCT challenge) INTO recent_challenges
    FROM (
        SELECT jsonb_array_elements_text(data->'challenges_faced') AS challenge
        FROM public.reflection_entries
        WHERE user_id = target_user_id
            AND created_at >= NOW() - INTERVAL '30 days'
            AND data ? 'challenges_faced'
        LIMIT 10
    ) sub;
    
    -- Get effective strategies
    SELECT jsonb_agg(DISTINCT strategy) INTO effective_strategies
    FROM (
        SELECT jsonb_array_elements_text(data->'effective_strategies') AS strategy
        FROM public.reflection_entries
        WHERE user_id = target_user_id
            AND created_at >= NOW() - INTERVAL '30 days'
            AND data ? 'effective_strategies'
        UNION
        SELECT jsonb_array_elements_text(data->'helpful_strategies') AS strategy
        FROM public.reflection_entries
        WHERE user_id = target_user_id
            AND created_at >= NOW() - INTERVAL '30 days'
            AND data ? 'helpful_strategies'
        LIMIT 10
    ) sub;
    
    -- Build insights object
    insights := jsonb_build_object(
        'burnout_risk_score', COALESCE(burnout_score, 0),
        'wellness_trend', wellness_trend,
        'recent_challenges', COALESCE(recent_challenges, '[]'::jsonb),
        'effective_strategies', COALESCE(effective_strategies, '[]'::jsonb),
        'needs_attention', burnout_score >= 60,
        'last_check_in', (
            SELECT MAX(created_at)
            FROM public.reflection_entries
            WHERE user_id = target_user_id
        )
    );
    
    RETURN insights;
END;
$function$;

-- Function to get team dynamics insights for Elya
CREATE OR REPLACE FUNCTION public.get_team_insights_for_elya(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
    team_insights JSONB := '{}'::jsonb;
    team_sessions JSONB;
    collaboration_patterns JSONB;
BEGIN
    -- Get recent team session data
    SELECT jsonb_agg(
        jsonb_build_object(
            'session_date', sub.created_at::date,
            'team_dynamics', sub.data->'team_dynamics',
            'communication_quality', sub.data->'communication_quality',
            'collaboration_rating', sub.data->'collaboration_rating',
            'team_size', sub.data->'team_size'
        )
        ORDER BY sub.created_at DESC
    ) INTO team_sessions
    FROM (
        SELECT created_at, data
        FROM public.reflection_entries
        WHERE user_id = target_user_id
            AND entry_kind IN ('teaming_prep', 'teaming_reflection')
            AND created_at >= NOW() - INTERVAL '60 days'
        ORDER BY created_at DESC
        LIMIT 10
    ) sub;
    
    -- Analyze collaboration patterns
    SELECT jsonb_build_object(
        'preferred_team_size', MODE() WITHIN GROUP (ORDER BY (data->>'team_size')::INT),
        'avg_collaboration_rating', AVG((data->>'collaboration_rating')::NUMERIC),
        'communication_challenges', jsonb_agg(DISTINCT challenge)
    ) INTO collaboration_patterns
    FROM public.reflection_entries re,
    LATERAL jsonb_array_elements_text(re.data->'communication_challenges') AS challenge
    WHERE re.user_id = target_user_id
        AND re.entry_kind IN ('teaming_prep', 'teaming_reflection')
        AND re.created_at >= NOW() - INTERVAL '90 days';
    
    -- Build team insights
    team_insights := jsonb_build_object(
        'recent_team_sessions', COALESCE(team_sessions, '[]'::jsonb),
        'collaboration_patterns', COALESCE(collaboration_patterns, '{}'::jsonb),
        'team_session_count', (
            SELECT COUNT(*)
            FROM public.reflection_entries
            WHERE user_id = target_user_id
                AND entry_kind IN ('teaming_prep', 'teaming_reflection')
                AND created_at >= NOW() - INTERVAL '30 days'
        )
    );
    
    RETURN team_insights;
END;
$function$;

-- Function to generate personalized recommendations for Elya
CREATE OR REPLACE FUNCTION public.generate_recommendations_for_elya(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
    recommendations JSONB := '[]'::jsonb;
    user_stats RECORD;
    last_activity_interval INTERVAL;
BEGIN
    -- Get user statistics
    SELECT 
        AVG((data->>'stress_level')::NUMERIC) AS avg_stress,
        AVG((data->>'energy_level')::NUMERIC) AS avg_energy,
        COUNT(*) AS reflection_count,
        MAX(created_at) AS last_reflection
    INTO user_stats
    FROM public.reflection_entries
    WHERE user_id = target_user_id
        AND created_at >= NOW() - INTERVAL '30 days';
    
    -- Calculate time since last activity
    last_activity_interval := NOW() - user_stats.last_reflection;
    
    -- Generate recommendations based on patterns
    
    -- Check if user needs stress management
    IF user_stats.avg_stress > 6 THEN
        recommendations := recommendations || jsonb_build_object(
            'type', 'stress_management',
            'priority', 'high',
            'suggestion', 'Your stress levels have been elevated. Consider trying a Stress Reset or Breathing Practice.',
            'recommended_tools', ARRAY['stress_reset', 'breathing_practice', 'body_awareness']
        );
    END IF;
    
    -- Check for low energy patterns
    IF user_stats.avg_energy < 4 THEN
        recommendations := recommendations || jsonb_build_object(
            'type', 'energy_boost',
            'priority', 'medium',
            'suggestion', 'Your energy levels have been low. The Compass Check can help identify energy drains.',
            'recommended_tools', ARRAY['compass_check', 'wellness_check_in', 'affirmation_studio']
        );
    END IF;
    
    -- Check for infrequent check-ins
    IF last_activity_interval > INTERVAL '7 days' THEN
        recommendations := recommendations || jsonb_build_object(
            'type', 'regular_check_in',
            'priority', 'low',
            'suggestion', 'It''s been a while since your last check-in. A quick Wellness Check can help maintain balance.',
            'recommended_tools', ARRAY['wellness_check_in', 'emotion_mapping']
        );
    END IF;
    
    -- Add recommendation for burnout prevention if needed
    IF user_stats.avg_stress > 7 AND user_stats.avg_energy < 3 THEN
        recommendations := recommendations || jsonb_build_object(
            'type', 'burnout_prevention',
            'priority', 'critical',
            'suggestion', 'Your wellness indicators suggest burnout risk. Please complete a Burnout Assessment.',
            'recommended_tools', ARRAY['burnout_assessment', 'professional_boundaries_reset', 'role_space_reflection']
        );
    END IF;
    
    RETURN jsonb_build_object(
        'recommendations', recommendations,
        'generated_at', NOW(),
        'based_on_days', 30,
        'reflection_count', user_stats.reflection_count
    );
END;
$function$;

-- Function to analyze emotion patterns for Elya
CREATE OR REPLACE FUNCTION public.analyze_emotion_patterns_for_elya(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
    emotion_analysis JSONB := '{}'::jsonb;
    emotion_frequency JSONB;
    emotion_trends JSONB;
    dominant_emotions TEXT[];
BEGIN
    -- Get emotion frequency from recent reflections
    WITH emotion_data AS (
        SELECT 
            emotion,
            COUNT(*) AS frequency,
            ARRAY_AGG(DISTINCT entry_kind) AS contexts
        FROM public.reflection_entries re,
        LATERAL jsonb_array_elements_text(
            COALESCE(re.data->'current_emotions', re.data->'emotions_during', '[]'::jsonb)
        ) AS emotion
        WHERE re.user_id = target_user_id
            AND re.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY emotion
        ORDER BY frequency DESC
        LIMIT 10
    )
    SELECT 
        jsonb_agg(
            jsonb_build_object(
                'emotion', emotion,
                'frequency', frequency,
                'contexts', contexts
            )
        ) INTO emotion_frequency
    FROM emotion_data;
    
    -- Get dominant emotions
    SELECT ARRAY_AGG(emotion ORDER BY frequency DESC) INTO dominant_emotions
    FROM (
        SELECT emotion, COUNT(*) AS frequency
        FROM public.reflection_entries re,
        LATERAL jsonb_array_elements_text(
            COALESCE(re.data->'current_emotions', re.data->'emotions_during', '[]'::jsonb)
        ) AS emotion
        WHERE re.user_id = target_user_id
            AND re.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY emotion
        ORDER BY frequency DESC
        LIMIT 5
    ) sub;
    
    -- Analyze emotion trends over time
    WITH weekly_emotions AS (
        SELECT 
            DATE_TRUNC('week', created_at) AS week,
            jsonb_agg(DISTINCT emotion) AS emotions
        FROM public.reflection_entries re,
        LATERAL jsonb_array_elements_text(
            COALESCE(re.data->'current_emotions', re.data->'emotions_during', '[]'::jsonb)
        ) AS emotion
        WHERE re.user_id = target_user_id
            AND re.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY week DESC
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'week', week,
            'emotions', emotions
        )
    ) INTO emotion_trends
    FROM weekly_emotions;
    
    -- Build emotion analysis
    emotion_analysis := jsonb_build_object(
        'dominant_emotions', COALESCE(dominant_emotions, ARRAY[]::text[]),
        'emotion_frequency', COALESCE(emotion_frequency, '[]'::jsonb),
        'emotion_trends', COALESCE(emotion_trends, '[]'::jsonb),
        'emotional_diversity_score', (
            SELECT COUNT(DISTINCT emotion)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0) * 100
            FROM public.reflection_entries re,
            LATERAL jsonb_array_elements_text(
                COALESCE(re.data->'current_emotions', re.data->'emotions_during', '[]'::jsonb)
            ) AS emotion
            WHERE re.user_id = target_user_id
                AND re.created_at >= NOW() - INTERVAL '30 days'
        )
    );
    
    RETURN emotion_analysis;
END;
$function$;

-- Function to get assignment preparation insights for Elya
CREATE OR REPLACE FUNCTION public.get_assignment_insights_for_elya(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
    assignment_insights JSONB := '{}'::jsonb;
    recent_assignments JSONB;
    preparation_patterns JSONB;
    performance_metrics JSONB;
BEGIN
    -- Get recent assignment data
    SELECT jsonb_agg(
        jsonb_build_object(
            'date', sub.created_at::date,
            'type', sub.entry_kind,
            'assignment_type', sub.data->'assignment_type',
            'preparation_level', sub.data->'preparation_level',
            'confidence_level', sub.data->'confidence_level',
            'concerns', sub.data->'concerns',
            'strategies_used', sub.data->'strategies_used'
        )
        ORDER BY sub.created_at DESC
    ) INTO recent_assignments
    FROM (
        SELECT created_at, entry_kind, data
        FROM public.reflection_entries
        WHERE user_id = target_user_id
            AND entry_kind IN ('pre_assignment_prep', 'post_assignment_debrief')
            AND created_at >= NOW() - INTERVAL '30 days'
        ORDER BY created_at DESC
        LIMIT 10
    ) sub;
    
    -- Analyze preparation patterns
    SELECT jsonb_build_object(
        'avg_preparation_level', AVG((data->>'preparation_level')::NUMERIC),
        'avg_confidence_pre', AVG(
            CASE WHEN entry_kind = 'pre_assignment_prep' 
            THEN (data->>'confidence_level')::NUMERIC 
            END
        ),
        'avg_confidence_post', AVG(
            CASE WHEN entry_kind = 'post_assignment_debrief' 
            THEN (data->>'confidence_level')::NUMERIC 
            END
        ),
        'common_concerns', (
            SELECT jsonb_agg(DISTINCT concern)
            FROM public.reflection_entries re,
            LATERAL jsonb_array_elements_text(re.data->'concerns') AS concern
            WHERE re.user_id = target_user_id
                AND re.entry_kind = 'pre_assignment_prep'
                AND re.created_at >= NOW() - INTERVAL '30 days'
        )
    ) INTO preparation_patterns
    FROM public.reflection_entries
    WHERE user_id = target_user_id
        AND entry_kind IN ('pre_assignment_prep', 'post_assignment_debrief')
        AND created_at >= NOW() - INTERVAL '30 days';
    
    -- Calculate performance metrics
    WITH assignment_pairs AS (
        SELECT 
            pre.data AS pre_data,
            post.data AS post_data,
            pre.created_at AS prep_date,
            post.created_at AS debrief_date
        FROM public.reflection_entries pre
        LEFT JOIN public.reflection_entries post
            ON post.user_id = pre.user_id
            AND post.entry_kind = 'post_assignment_debrief'
            AND post.created_at > pre.created_at
            AND post.created_at < pre.created_at + INTERVAL '7 days'
        WHERE pre.user_id = target_user_id
            AND pre.entry_kind = 'pre_assignment_prep'
            AND pre.created_at >= NOW() - INTERVAL '30 days'
    )
    SELECT jsonb_build_object(
        'completion_rate', (
            COUNT(post_data)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0) * 100
        ),
        'confidence_improvement', AVG(
            (post_data->>'confidence_level')::NUMERIC - 
            (pre_data->>'confidence_level')::NUMERIC
        )
    ) INTO performance_metrics
    FROM assignment_pairs;
    
    -- Build assignment insights
    assignment_insights := jsonb_build_object(
        'recent_assignments', COALESCE(recent_assignments, '[]'::jsonb),
        'preparation_patterns', COALESCE(preparation_patterns, '{}'::jsonb),
        'performance_metrics', COALESCE(performance_metrics, '{}'::jsonb),
        'total_assignments_30d', (
            SELECT COUNT(*)
            FROM public.reflection_entries
            WHERE user_id = target_user_id
                AND entry_kind IN ('pre_assignment_prep', 'post_assignment_debrief')
                AND created_at >= NOW() - INTERVAL '30 days'
        )
    );
    
    RETURN assignment_insights;
END;
$function$;

-- Indexes for Elya conversation performance
CREATE INDEX IF NOT EXISTS idx_elya_conversations_user_session 
    ON public.elya_conversations(user_id, session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_elya_conversations_user_recent 
    ON public.elya_conversations(user_id, created_at DESC)
    WHERE created_at >= NOW() - INTERVAL '30 days';

-- Indexes for user context summary
CREATE INDEX IF NOT EXISTS idx_user_context_summary_user 
    ON public.user_context_summary(user_id);

CREATE INDEX IF NOT EXISTS idx_user_context_summary_burnout 
    ON public.user_context_summary(burnout_risk_level)
    WHERE burnout_risk_level IN ('high', 'critical');

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION public.save_elya_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_wellness_insights_for_elya TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_insights_for_elya TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_recommendations_for_elya TO authenticated;
GRANT EXECUTE ON FUNCTION public.analyze_emotion_patterns_for_elya TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_assignment_insights_for_elya TO authenticated;

-- RLS Policies for elya_conversations
CREATE POLICY "elya_conversations select own" ON public.elya_conversations
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "elya_conversations insert own" ON public.elya_conversations
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- RLS Policies for user_context_summary
CREATE POLICY "user_context_summary select own" ON public.user_context_summary
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_context_summary insert own" ON public.user_context_summary
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_context_summary update own" ON public.user_context_summary
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- END OF ELYA INTEGRATION SQL PART 2