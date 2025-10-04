-- =====================================================
-- Supabase Functions for Elya AI Integration
-- =====================================================
-- These functions support the userContextService for Elya

-- =====================================================
-- Function: save_elya_conversation
-- Saves conversation messages to the database
-- =====================================================
CREATE OR REPLACE FUNCTION save_elya_conversation(
  p_user_id UUID,
  p_session_id TEXT,
  p_message_id TEXT,
  p_sender TEXT,
  p_content TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  INSERT INTO elya_conversations (
    user_id,
    session_id,
    message_id,
    sender,
    message,
    metadata,
    provider,
    user_context_used
  ) VALUES (
    p_user_id,
    p_session_id,
    p_message_id,
    p_sender,
    p_content,
    p_metadata,
    p_metadata->>'provider',
    COALESCE((p_metadata->>'user_context_used')::boolean, false)
  )
  RETURNING id INTO v_conversation_id;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function: get_user_context_for_elya
-- Retrieves comprehensive user context for AI personalization
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_context_for_elya(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_context JSONB;
  v_user_summary JSONB;
  v_recent_reflections JSONB;
  v_recent_conversations JSONB;
  v_avg_stress DECIMAL;
  v_avg_energy DECIMAL;
  v_avg_confidence DECIMAL;
  v_burnout_risk TEXT;
BEGIN
  -- Calculate average metrics from recent reflections
  SELECT 
    COALESCE(AVG((metadata->>'stress_level')::decimal), 5),
    COALESCE(AVG((metadata->>'energy_level')::decimal), 5),
    COALESCE(AVG((metadata->>'confidence_level')::decimal), 5)
  INTO v_avg_stress, v_avg_energy, v_avg_confidence
  FROM reflections
  WHERE user_id = target_user_id
    AND created_at > NOW() - INTERVAL '30 days';

  -- Determine burnout risk level
  v_burnout_risk := CASE
    WHEN v_avg_stress >= 8 AND v_avg_energy <= 3 THEN 'critical'
    WHEN v_avg_stress >= 7 AND v_avg_energy <= 4 THEN 'high'
    WHEN v_avg_stress >= 6 OR v_avg_energy <= 5 THEN 'moderate'
    ELSE 'low'
  END;

  -- Build user summary
  SELECT jsonb_build_object(
    'recent_stress_patterns', COALESCE(
      (SELECT array_agg(DISTINCT pattern)
       FROM (
         SELECT answers->>'stress_source' as pattern
         FROM reflections
         WHERE user_id = target_user_id
           AND created_at > NOW() - INTERVAL '30 days'
           AND answers->>'stress_source' IS NOT NULL
         LIMIT 5
       ) t), ARRAY[]::text[]
    ),
    'recent_emotions', COALESCE(
      (SELECT array_agg(DISTINCT emotion)
       FROM (
         SELECT answers->>'primary_emotion' as emotion
         FROM reflections
         WHERE user_id = target_user_id
           AND created_at > NOW() - INTERVAL '14 days'
           AND answers->>'primary_emotion' IS NOT NULL
         LIMIT 10
       ) t), ARRAY[]::text[]
    ),
    'common_challenges', COALESCE(
      (SELECT array_agg(DISTINCT challenge)
       FROM (
         SELECT answers->>'main_challenge' as challenge
         FROM reflections
         WHERE user_id = target_user_id
           AND created_at > NOW() - INTERVAL '30 days'
           AND answers->>'main_challenge' IS NOT NULL
         LIMIT 5
       ) t), ARRAY[]::text[]
    ),
    'effective_strategies', COALESCE(
      (SELECT array_agg(DISTINCT strategy)
       FROM (
         SELECT answers->>'helpful_strategy' as strategy
         FROM reflections
         WHERE user_id = target_user_id
           AND created_at > NOW() - INTERVAL '30 days'
           AND answers->>'helpful_strategy' IS NOT NULL
         LIMIT 5
       ) t), ARRAY[]::text[]
    ),
    'avg_energy_level', ROUND(v_avg_energy, 1),
    'avg_stress_level', ROUND(v_avg_stress, 1),
    'avg_confidence_level', ROUND(v_avg_confidence, 1),
    'burnout_risk_level', v_burnout_risk,
    'interpreter_experience_level', COALESCE(
      (SELECT answers->>'experience_level'
       FROM reflections
       WHERE user_id = target_user_id
         AND answers->>'experience_level' IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 1), 'intermediate'
    ),
    'common_assignment_types', COALESCE(
      (SELECT array_agg(DISTINCT assignment_type)
       FROM (
         SELECT answers->>'assignment_type' as assignment_type
         FROM reflections
         WHERE user_id = target_user_id
           AND answers->>'assignment_type' IS NOT NULL
         LIMIT 5
       ) t), ARRAY[]::text[]
    ),
    'preferred_support_types', COALESCE(
      (SELECT array_agg(DISTINCT support_type)
       FROM (
         SELECT answers->>'preferred_support' as support_type
         FROM reflections
         WHERE user_id = target_user_id
           AND answers->>'preferred_support' IS NOT NULL
         LIMIT 3
       ) t), ARRAY[]::text[]
    ),
    'last_reflection_date', COALESCE(
      (SELECT created_at::text
       FROM reflections
       WHERE user_id = target_user_id
       ORDER BY created_at DESC
       LIMIT 1), 'never'
    ),
    'last_activity_date', COALESCE(
      (SELECT created_at::text
       FROM elya_conversations
       WHERE user_id = target_user_id
       ORDER BY created_at DESC
       LIMIT 1), NOW()::text
    )
  ) INTO v_user_summary;

  -- Get recent reflections
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'type', reflection_type,
        'date', created_at::text,
        'key_insights', answers,
        'stress_level', COALESCE((metadata->>'stress_level')::int, 5),
        'energy_level', COALESCE((metadata->>'energy_level')::int, 5)
      )
      ORDER BY created_at DESC
    ),
    '[]'::jsonb
  ) INTO v_recent_reflections
  FROM (
    SELECT reflection_type, created_at, answers, metadata
    FROM reflections
    WHERE user_id = target_user_id
    ORDER BY created_at DESC
    LIMIT 5
  ) recent;

  -- Get recent conversations
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'sender', sender,
        'content', message,
        'date', created_at::text
      )
      ORDER BY created_at DESC
    ),
    '[]'::jsonb
  ) INTO v_recent_conversations
  FROM (
    SELECT sender, message, created_at
    FROM elya_conversations
    WHERE user_id = target_user_id
    ORDER BY created_at DESC
    LIMIT 10
  ) conversations;

  -- Build final context object
  v_context := jsonb_build_object(
    'user_summary', v_user_summary,
    'recent_reflections', v_recent_reflections,
    'recent_conversations', v_recent_conversations,
    'context_generated_at', NOW()::text
  );

  RETURN v_context;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function: update_user_activity
-- Updates user's last activity timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_activity(p_user_id UUID DEFAULT auth.uid())
RETURNS VOID AS $$
BEGIN
  -- Update user_growth_metrics last_assessment
  UPDATE user_growth_metrics
  SET last_assessment = NOW()
  WHERE user_id = p_user_id;
  
  -- Update user_preferences updated_at
  UPDATE user_preferences
  SET updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function: generate_conversation_summary
-- Creates AI-style summary of a conversation session
-- =====================================================
CREATE OR REPLACE FUNCTION generate_conversation_summary(
  p_session_id TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS UUID AS $$
DECLARE
  v_summary_id UUID;
  v_key_topics TEXT[];
  v_emotions TEXT[];
  v_summary_text TEXT;
BEGIN
  -- Extract key topics from messages
  WITH message_analysis AS (
    SELECT 
      message,
      CASE 
        WHEN message ILIKE '%stress%' THEN 'stress'
        WHEN message ILIKE '%anxiety%' THEN 'anxiety'
        WHEN message ILIKE '%burnout%' THEN 'burnout'
        WHEN message ILIKE '%work%' THEN 'work'
        WHEN message ILIKE '%sleep%' THEN 'sleep'
        WHEN message ILIKE '%relationship%' THEN 'relationships'
        ELSE NULL
      END as topic,
      CASE
        WHEN message ILIKE '%overwhelm%' OR message ILIKE '%stress%' THEN 'stressed'
        WHEN message ILIKE '%sad%' OR message ILIKE '%depress%' THEN 'sad'
        WHEN message ILIKE '%anxious%' OR message ILIKE '%worry%' THEN 'anxious'
        WHEN message ILIKE '%angry%' OR message ILIKE '%frustrat%' THEN 'frustrated'
        WHEN message ILIKE '%happy%' OR message ILIKE '%good%' THEN 'positive'
        ELSE NULL
      END as emotion
    FROM elya_conversations
    WHERE session_id = p_session_id 
      AND user_id = p_user_id
      AND sender = 'user'
  )
  SELECT 
    array_agg(DISTINCT topic) FILTER (WHERE topic IS NOT NULL),
    array_agg(DISTINCT emotion) FILTER (WHERE emotion IS NOT NULL)
  INTO v_key_topics, v_emotions
  FROM message_analysis;

  -- Generate summary text
  v_summary_text := format(
    'Conversation focused on %s. User expressed feelings of %s. Session contained %s messages.',
    COALESCE(array_to_string(v_key_topics, ', '), 'general wellness'),
    COALESCE(array_to_string(v_emotions, ', '), 'various emotions'),
    (SELECT COUNT(*) FROM elya_conversations WHERE session_id = p_session_id AND user_id = p_user_id)
  );

  -- Insert summary
  INSERT INTO conversation_summaries (
    user_id,
    session_id,
    summary,
    key_topics,
    emotions_detected,
    followup_needed
  ) VALUES (
    p_user_id,
    p_session_id,
    v_summary_text,
    COALESCE(v_key_topics, ARRAY[]::text[]),
    COALESCE(v_emotions, ARRAY[]::text[]),
    array_length(v_emotions, 1) > 0 AND 'stressed' = ANY(v_emotions)
  )
  ON CONFLICT (session_id) DO UPDATE
  SET 
    summary = EXCLUDED.summary,
    key_topics = EXCLUDED.key_topics,
    emotions_detected = EXCLUDED.emotions_detected
  RETURNING id INTO v_summary_id;

  RETURN v_summary_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function: get_elya_recommendations
-- Get personalized recommendations based on user patterns
-- =====================================================
CREATE OR REPLACE FUNCTION get_elya_recommendations(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  recommendation_type TEXT,
  recommendation TEXT,
  priority TEXT,
  based_on TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_metrics AS (
    SELECT 
      avg_stress_level,
      avg_energy_level,
      burnout_risk_level
    FROM (
      SELECT 
        (get_user_context_for_elya(p_user_id)->>'user_summary')::jsonb->>'avg_stress_level' as avg_stress_level,
        (get_user_context_for_elya(p_user_id)->>'user_summary')::jsonb->>'avg_energy_level' as avg_energy_level,
        (get_user_context_for_elya(p_user_id)->>'user_summary')::jsonb->>'burnout_risk_level' as burnout_risk_level
    ) t
  )
  SELECT 
    'stress_management' as recommendation_type,
    'Consider daily 5-minute breathing exercises' as recommendation,
    CASE 
      WHEN avg_stress_level::decimal > 7 THEN 'high'
      WHEN avg_stress_level::decimal > 5 THEN 'medium'
      ELSE 'low'
    END as priority,
    format('Based on average stress level of %s', avg_stress_level) as based_on
  FROM user_metrics
  WHERE avg_stress_level::decimal > 5
  
  UNION ALL
  
  SELECT 
    'energy_restoration' as recommendation_type,
    'Focus on sleep quality and regular breaks' as recommendation,
    CASE 
      WHEN avg_energy_level::decimal < 3 THEN 'high'
      WHEN avg_energy_level::decimal < 5 THEN 'medium'
      ELSE 'low'
    END as priority,
    format('Based on average energy level of %s', avg_energy_level) as based_on
  FROM user_metrics
  WHERE avg_energy_level::decimal < 5
  
  UNION ALL
  
  SELECT 
    'burnout_prevention' as recommendation_type,
    'Schedule regular check-ins with Elya for support' as recommendation,
    CASE burnout_risk_level
      WHEN 'critical' THEN 'critical'
      WHEN 'high' THEN 'high'
      ELSE 'medium'
    END as priority,
    format('Based on %s burnout risk', burnout_risk_level) as based_on
  FROM user_metrics
  WHERE burnout_risk_level IN ('high', 'critical');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant necessary permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION save_elya_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_context_for_elya TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION generate_conversation_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_elya_recommendations TO authenticated;

-- =====================================================
-- END OF ELYA FUNCTIONS
-- =====================================================