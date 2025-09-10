-- =====================================================
-- Supabase Tables Creation Script for InterpretReflect
-- =====================================================
-- Run this script in your Supabase SQL editor to create all necessary tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. REFLECTIONS TABLE (Main reflection storage)
-- =====================================================
CREATE TABLE IF NOT EXISTS reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reflection_type TEXT NOT NULL,
  type TEXT, -- For categorization (e.g., 'context_medical', 'context_legal')
  answers JSONB NOT NULL, -- Stores all reflection answers
  content JSONB, -- Legacy field for backward compatibility
  status TEXT DEFAULT 'completed',
  metadata JSONB, -- Stores additional data like insights, context_type, etc.
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_reflections_user_id (user_id),
  INDEX idx_reflections_type (type),
  INDEX idx_reflections_created_at (created_at DESC)
);

-- Enable Row Level Security
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to manage their own reflections
CREATE POLICY "Users can view own reflections" ON reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON reflections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON reflections
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 2. REFLECTION_EVENTS TABLE (Track reflection events)
-- =====================================================
CREATE TABLE IF NOT EXISTS reflection_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  reflection_id UUID REFERENCES reflections(id) ON DELETE CASCADE,
  reflection_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_reflection_events_user_id (user_id),
  INDEX idx_reflection_events_created_at (created_at DESC)
);

-- Enable RLS
ALTER TABLE reflection_events ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own events" ON reflection_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON reflection_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 3. GROWTH_INSIGHTS TABLE (Store analyzed insights)
-- =====================================================
CREATE TABLE IF NOT EXISTS growth_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT,
  data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_growth_insights_user_id (user_id),
  INDEX idx_growth_insights_type (insight_type)
);

-- Enable RLS
ALTER TABLE growth_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own insights" ON growth_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" ON growth_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" ON growth_insights
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 4. USER_GROWTH_METRICS TABLE (Track user progress)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_growth_metrics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preparedness_score DECIMAL(5,2),
  self_awareness_level DECIMAL(5,2),
  role_clarity_score DECIMAL(5,2),
  ethical_awareness_score DECIMAL(5,2),
  growth_mindset_score DECIMAL(5,2),
  resilience_score DECIMAL(5,2),
  overall_progress DECIMAL(5,2),
  last_assessment TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_growth_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own metrics" ON user_growth_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics" ON user_growth_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics" ON user_growth_metrics
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 5. CONTEXT_METRICS TABLE (Context-specific metrics)
-- =====================================================
CREATE TABLE IF NOT EXISTS context_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL, -- medical, legal, educational, mental_health, community
  metrics JSONB NOT NULL, -- Stores context-specific scores
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint to ensure one metric per context per user
  UNIQUE(user_id, context_type),
  
  -- Indexes
  INDEX idx_context_metrics_user_id (user_id),
  INDEX idx_context_metrics_type (context_type)
);

-- Enable RLS
ALTER TABLE context_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own context metrics" ON context_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own context metrics" ON context_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own context metrics" ON context_metrics
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 6. REFLECTION_ENTRIES TABLE (Legacy support)
-- =====================================================
CREATE TABLE IF NOT EXISTS reflection_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reflection_id TEXT,
  entry_kind TEXT,
  team_id TEXT,
  session_id TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_reflection_entries_user_id (user_id),
  INDEX idx_reflection_entries_created_at (created_at DESC)
);

-- Enable RLS
ALTER TABLE reflection_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own entries" ON reflection_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON reflection_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON reflection_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON reflection_entries
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 7. WELLNESS_SCORES TABLE (Track wellness over time)
-- =====================================================
CREATE TABLE IF NOT EXISTS wellness_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  physical_energy INTEGER CHECK (physical_energy >= 1 AND physical_energy <= 10),
  emotional_balance INTEGER CHECK (emotional_balance >= 1 AND emotional_balance <= 10),
  mental_clarity INTEGER CHECK (mental_clarity >= 1 AND mental_clarity <= 10),
  social_connection INTEGER CHECK (social_connection >= 1 AND social_connection <= 10),
  professional_satisfaction INTEGER CHECK (professional_satisfaction >= 1 AND professional_satisfaction <= 10),
  overall_wellbeing INTEGER CHECK (overall_wellbeing >= 1 AND overall_wellbeing <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_wellness_scores_user_id (user_id),
  INDEX idx_wellness_scores_created_at (created_at DESC)
);

-- Enable RLS
ALTER TABLE wellness_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own wellness scores" ON wellness_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness scores" ON wellness_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 8. STRESS_RESETS TABLE (Track stress management)
-- =====================================================
CREATE TABLE IF NOT EXISTS stress_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reset_type TEXT NOT NULL,
  duration_seconds INTEGER,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_stress_resets_user_id (user_id),
  INDEX idx_stress_resets_created_at (created_at DESC)
);

-- Enable RLS
ALTER TABLE stress_resets ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own stress resets" ON stress_resets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stress resets" ON stress_resets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 9. TEAMING_SESSIONS TABLE (Track team collaborations)
-- =====================================================
CREATE TABLE IF NOT EXISTS teaming_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  team_members UUID[] NOT NULL,
  assignment_type TEXT,
  session_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_teaming_sessions_date (session_date DESC)
);

-- Enable RLS
ALTER TABLE teaming_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Team members can view sessions" ON teaming_sessions
  FOR SELECT USING (auth.uid() = ANY(team_members));

CREATE POLICY "Team members can insert sessions" ON teaming_sessions
  FOR INSERT WITH CHECK (auth.uid() = ANY(team_members));

-- =====================================================
-- 10. USER_PREFERENCES TABLE (Store user settings)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_preferences JSONB DEFAULT '{"email": true, "push": false, "reminders": true}'::jsonb,
  privacy_settings JSONB DEFAULT '{"share_insights": false, "anonymous_analytics": true}'::jsonb,
  display_preferences JSONB DEFAULT '{"theme": "light", "language": "en", "timezone": "UTC"}'::jsonb,
  feature_flags JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 11. FUNCTIONS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_reflections_updated_at BEFORE UPDATE ON reflections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_growth_insights_updated_at BEFORE UPDATE ON growth_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_growth_metrics_updated_at BEFORE UPDATE ON user_growth_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reflection_entries_updated_at BEFORE UPDATE ON reflection_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teaming_sessions_updated_at BEFORE UPDATE ON teaming_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 12. INDEXES FOR PERFORMANCE
-- =====================================================

-- Composite indexes for common queries
CREATE INDEX idx_reflections_user_type_created ON reflections(user_id, type, created_at DESC);
CREATE INDEX idx_reflection_events_user_type ON reflection_events(user_id, event_type, created_at DESC);
CREATE INDEX idx_wellness_scores_user_date ON wellness_scores(user_id, created_at DESC);
CREATE INDEX idx_stress_resets_user_type ON stress_resets(user_id, reset_type, created_at DESC);

-- =====================================================
-- 13. GRANT PERMISSIONS (if needed for specific roles)
-- =====================================================
-- These are automatically handled by RLS policies, but you can add specific grants if needed

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify tables were created successfully:
/*
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled:
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
*/

-- =====================================================
-- END OF SCRIPT
-- =====================================================
-- After running this script:
-- 1. Verify all tables were created
-- 2. Test RLS policies by attempting to insert/select data
-- 3. Create any additional indexes based on your query patterns
-- 4. Consider adding database functions for complex operations