-- Elya AI Integration Schema
-- This creates the necessary tables and functions for Elya to access user context and save conversation history

-- Elya Conversations Table
CREATE TABLE IF NOT EXISTS elya_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'elya')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Context Summary Table (for Elya to understand user patterns)
CREATE TABLE IF NOT EXISTS user_context_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Recent activity patterns
    recent_stress_patterns TEXT[],
    recent_emotions TEXT[],
    common_challenges TEXT[],
    effective_strategies TEXT[],
    
    -- Wellness tracking
    avg_energy_level NUMERIC(3,2),
    avg_stress_level NUMERIC(3,2),
    avg_confidence_level NUMERIC(3,2),
    burnout_risk_level TEXT CHECK (burnout_risk_level IN ('low', 'moderate', 'high', 'critical')),
    
    -- Professional context
    interpreter_experience_level TEXT,
    common_assignment_types TEXT[],
    preferred_teaming_style TEXT,
    known_triggers TEXT[],
    
    -- Support preferences
    preferred_support_types TEXT[],
    effective_interventions TEXT[],
    communication_style TEXT,
    
    -- Last updated
    last_reflection_date DATE,
    last_activity_date DATE,
    context_score NUMERIC(3,2) DEFAULT 0, -- How complete their context is
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to get user context for Elya
CREATE OR REPLACE FUNCTION get_user_context_for_elya(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    context_data JSONB := '{}';
    recent_reflections JSONB;
    conversation_history JSONB;
    user_summary JSONB;
BEGIN
    -- Get user context summary
    SELECT to_jsonb(ucs.*) INTO user_summary
    FROM user_context_summary ucs
    WHERE user_id = target_user_id;
    
    -- Get recent reflection entries (last 5)
    SELECT jsonb_agg(
        jsonb_build_object(
            'type', entry_kind,
            'date', created_at::date,
            'key_insights', CASE 
                WHEN data ? 'current_emotions' THEN data->'current_emotions'
                WHEN data ? 'feeling_word' THEN data->'feeling_word'
                WHEN data ? 'overall_feeling' THEN data->'overall_feeling'
                ELSE NULL
            END,
            'stress_level', CASE 
                WHEN data ? 'stress_level' THEN data->'stress_level'
                WHEN data ? 'stress_anxiety_level' THEN data->'stress_anxiety_level'
                ELSE NULL
            END,
            'energy_level', CASE 
                WHEN data ? 'energy_level' THEN data->'energy_level'
                WHEN data ? 'energy_level_post' THEN data->'energy_level_post'
                ELSE NULL
            END
        )
    ) INTO recent_reflections
    FROM reflection_entries
    WHERE user_id = target_user_id
    AND created_at >= NOW() - INTERVAL '30 days'
    ORDER BY created_at DESC
    LIMIT 5;
    
    -- Get recent conversation context (last 10 exchanges)
    SELECT jsonb_agg(
        jsonb_build_object(
            'sender', sender,
            'content', CASE 
                WHEN LENGTH(content) > 200 THEN LEFT(content, 200) || '...'
                ELSE content
            END,
            'date', created_at::date
        )
        ORDER BY created_at DESC
    ) INTO conversation_history
    FROM elya_conversations
    WHERE user_id = target_user_id
    AND created_at >= NOW() - INTERVAL '7 days'
    LIMIT 10;
    
    -- Build comprehensive context
    context_data := jsonb_build_object(
        'user_summary', COALESCE(user_summary, '{}'),
        'recent_reflections', COALESCE(recent_reflections, '[]'),
        'recent_conversations', COALESCE(conversation_history, '[]'),
        'context_generated_at', NOW()
    );
    
    RETURN context_data;
END;
$$;

-- Function to update user context based on new reflection data
CREATE OR REPLACE FUNCTION update_user_context_from_reflection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    reflection_data JSONB := NEW.data;
    current_emotions TEXT[];
    stress_level NUMERIC;
    energy_level NUMERIC;
    confidence_level NUMERIC;
BEGIN
    -- Extract key insights from the reflection
    IF reflection_data ? 'current_emotions' THEN
        current_emotions := ARRAY(SELECT jsonb_array_elements_text(reflection_data->'current_emotions'));
    END IF;
    
    -- Extract numeric indicators
    stress_level := COALESCE((reflection_data->>'stress_level')::NUMERIC, 
                            (reflection_data->>'stress_anxiety_level')::NUMERIC);
    energy_level := COALESCE((reflection_data->>'energy_level')::NUMERIC,
                            (reflection_data->>'energy_level_post')::NUMERIC);
    confidence_level := COALESCE((reflection_data->>'confidence_level')::NUMERIC,
                                (reflection_data->>'confidence_rating')::NUMERIC);
    
    -- Update or insert user context summary
    INSERT INTO user_context_summary (
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
        CURRENT_DATE,
        CURRENT_DATE,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        recent_emotions = CASE 
            WHEN current_emotions IS NOT NULL THEN 
                (SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(user_context_summary.recent_emotions, '{}') || current_emotions)))[1:10]
            ELSE user_context_summary.recent_emotions
        END,
        avg_stress_level = CASE 
            WHEN stress_level IS NOT NULL THEN 
                COALESCE((COALESCE(user_context_summary.avg_stress_level, 0) * 0.8 + stress_level * 0.2), stress_level)
            ELSE user_context_summary.avg_stress_level
        END,
        avg_energy_level = CASE 
            WHEN energy_level IS NOT NULL THEN 
                COALESCE((COALESCE(user_context_summary.avg_energy_level, 0) * 0.8 + energy_level * 0.2), energy_level)
            ELSE user_context_summary.avg_energy_level
        END,
        avg_confidence_level = CASE 
            WHEN confidence_level IS NOT NULL THEN 
                COALESCE((COALESCE(user_context_summary.avg_confidence_level, 0) * 0.8 + confidence_level * 0.2), confidence_level)
            ELSE user_context_summary.avg_confidence_level
        END,
        last_reflection_date = CURRENT_DATE,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$;

-- Create trigger to automatically update user context when reflections are added
DROP TRIGGER IF EXISTS update_context_on_reflection ON reflection_entries;
CREATE TRIGGER update_context_on_reflection
    AFTER INSERT ON reflection_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_user_context_from_reflection();

-- Function to save Elya conversation
CREATE OR REPLACE FUNCTION save_elya_conversation(
    target_user_id UUID,
    target_session_id TEXT,
    target_message_id TEXT,
    message_sender TEXT,
    message_content TEXT,
    message_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    conversation_id UUID;
BEGIN
    INSERT INTO elya_conversations (
        user_id,
        session_id,
        message_id,
        sender,
        content,
        metadata
    )
    VALUES (
        target_user_id,
        target_session_id,
        target_message_id,
        message_sender,
        message_content,
        message_metadata
    )
    RETURNING id INTO conversation_id;
    
    -- Update user's last activity date
    UPDATE user_context_summary 
    SET last_activity_date = CURRENT_DATE, updated_at = NOW()
    WHERE user_id = target_user_id;
    
    RETURN conversation_id;
END;
$$;

-- RLS Policies
ALTER TABLE elya_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_context_summary ENABLE ROW LEVEL SECURITY;

-- Users can only access their own conversations
CREATE POLICY "Users can access own conversations" ON elya_conversations
    FOR ALL USING (auth.uid() = user_id);

-- Users can access their own context summary
CREATE POLICY "Users can access own context summary" ON user_context_summary
    FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_elya_conversations_user_session 
    ON elya_conversations(user_id, session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_elya_conversations_created_at 
    ON elya_conversations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_context_summary_user_id 
    ON user_context_summary(user_id);

-- Comments for documentation
COMMENT ON TABLE elya_conversations IS 'Stores conversation history between users and Elya AI for context and continuity';
COMMENT ON TABLE user_context_summary IS 'Maintains aggregated user context for Elya to provide personalized support';
COMMENT ON FUNCTION get_user_context_for_elya(UUID) IS 'Returns comprehensive user context for Elya AI including recent reflections and conversation history';
COMMENT ON FUNCTION save_elya_conversation(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) IS 'Saves conversation messages between user and Elya with metadata';