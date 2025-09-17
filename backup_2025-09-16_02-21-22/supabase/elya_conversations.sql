-- =====================================================
-- Elya Conversations Table for InterpretReflect
-- =====================================================
-- This table stores all conversations with Elya AI assistant

-- =====================================================
-- ELYA_CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.elya_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'elya', 'system')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  provider TEXT, -- 'agenticflow', 'openai', 'openrouter', 'simulated'
  user_context_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_elya_conversations_user_id (user_id),
  INDEX idx_elya_conversations_session_id (session_id),
  INDEX idx_elya_conversations_created_at (created_at DESC),
  INDEX idx_elya_conversations_message_id (message_id)
);

-- Enable Row Level Security
ALTER TABLE public.elya_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own conversations" ON public.elya_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON public.elya_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.elya_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON public.elya_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- ELYA_INSIGHTS TABLE (AI-generated insights from conversations)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.elya_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  insight_type TEXT NOT NULL, -- 'pattern', 'recommendation', 'warning', 'progress'
  insight_content TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  related_messages TEXT[], -- Array of message_ids
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_elya_insights_user_id (user_id),
  INDEX idx_elya_insights_type (insight_type),
  INDEX idx_elya_insights_created_at (created_at DESC)
);

-- Enable RLS
ALTER TABLE public.elya_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own insights" ON public.elya_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" ON public.elya_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ELYA_USER_PREFERENCES TABLE (User preferences for Elya)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.elya_user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_tone TEXT DEFAULT 'compassionate', -- 'compassionate', 'professional', 'casual', 'direct'
  conversation_style TEXT DEFAULT 'balanced', -- 'brief', 'balanced', 'detailed'
  topics_to_avoid TEXT[],
  preferred_strategies TEXT[],
  response_length TEXT DEFAULT 'medium', -- 'short', 'medium', 'long'
  enable_contextual_responses BOOLEAN DEFAULT true,
  enable_pattern_detection BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.elya_user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences" ON public.elya_user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.elya_user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.elya_user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- CONVERSATION_SUMMARIES TABLE (AI-generated summaries)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.conversation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_topics TEXT[],
  emotions_detected TEXT[],
  action_items TEXT[],
  followup_needed BOOLEAN DEFAULT false,
  risk_indicators JSONB, -- Burnout risk, stress levels, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_conversation_summaries_user_id (user_id),
  INDEX idx_conversation_summaries_session_id (session_id),
  UNIQUE(session_id)
);

-- Enable RLS
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own summaries" ON public.conversation_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summaries" ON public.conversation_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS FOR ELYA ANALYTICS
-- =====================================================

-- Function to get user's conversation statistics
CREATE OR REPLACE FUNCTION get_elya_conversation_stats(p_user_id UUID)
RETURNS TABLE (
  total_conversations INTEGER,
  total_messages INTEGER,
  avg_messages_per_session DECIMAL,
  most_discussed_topics TEXT[],
  primary_emotions TEXT[],
  last_conversation TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT session_id)::INTEGER as total_conversations,
    COUNT(*)::INTEGER as total_messages,
    ROUND(COUNT(*)::DECIMAL / NULLIF(COUNT(DISTINCT session_id), 0), 2) as avg_messages_per_session,
    ARRAY(
      SELECT DISTINCT unnest(key_topics) 
      FROM conversation_summaries 
      WHERE user_id = p_user_id 
      LIMIT 5
    ) as most_discussed_topics,
    ARRAY(
      SELECT DISTINCT unnest(emotions_detected) 
      FROM conversation_summaries 
      WHERE user_id = p_user_id 
      LIMIT 5
    ) as primary_emotions,
    MAX(created_at) as last_conversation
  FROM elya_conversations
  WHERE user_id = p_user_id AND sender = 'user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect conversation patterns
CREATE OR REPLACE FUNCTION detect_conversation_patterns(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  pattern_type TEXT,
  pattern_description TEXT,
  frequency INTEGER,
  last_occurrence TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH message_patterns AS (
    SELECT 
      message,
      created_at,
      metadata
    FROM elya_conversations
    WHERE user_id = p_user_id 
      AND sender = 'user'
      AND created_at > NOW() - INTERVAL '1 day' * p_days
  ),
  pattern_analysis AS (
    SELECT 
      CASE 
        WHEN message ILIKE '%stress%' OR message ILIKE '%overwhelm%' THEN 'stress_related'
        WHEN message ILIKE '%tired%' OR message ILIKE '%exhausted%' THEN 'fatigue_related'
        WHEN message ILIKE '%anxious%' OR message ILIKE '%worried%' THEN 'anxiety_related'
        WHEN message ILIKE '%sad%' OR message ILIKE '%depressed%' THEN 'mood_related'
        WHEN message ILIKE '%help%' OR message ILIKE '%support%' THEN 'seeking_support'
        ELSE 'general_wellness'
      END as pattern_type,
      COUNT(*) as frequency,
      MAX(created_at) as last_occurrence
    FROM message_patterns
    GROUP BY pattern_type
  )
  SELECT 
    pattern_type,
    CASE pattern_type
      WHEN 'stress_related' THEN 'Frequently discussing stress and feeling overwhelmed'
      WHEN 'fatigue_related' THEN 'Often mentioning tiredness and exhaustion'
      WHEN 'anxiety_related' THEN 'Regularly expressing anxiety or worry'
      WHEN 'mood_related' THEN 'Discussing mood challenges and emotional difficulties'
      WHEN 'seeking_support' THEN 'Actively seeking help and support strategies'
      ELSE 'General wellness and self-care discussions'
    END as pattern_description,
    frequency::INTEGER,
    last_occurrence
  FROM pattern_analysis
  ORDER BY frequency DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_elya_user_preferences_updated_at
  BEFORE UPDATE ON public.elya_user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify tables were created successfully:
/*
-- Check all Elya-related tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'elya_%' OR table_name LIKE '%conversation%'
ORDER BY table_name;

-- Check RLS is enabled on Elya tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND (tablename LIKE 'elya_%' OR tablename LIKE '%conversation%');

-- Test conversation stats function (replace with actual user_id)
-- SELECT * FROM get_elya_conversation_stats('your-user-id-here');

-- Test pattern detection function (replace with actual user_id)
-- SELECT * FROM detect_conversation_patterns('your-user-id-here', 30);
*/

-- =====================================================
-- END OF ELYA CONVERSATIONS SETUP
-- =====================================================