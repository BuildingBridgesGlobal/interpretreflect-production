-- Simple version - Run this in Supabase SQL Editor
-- This creates just the essential tables to get started

-- 1. Create reflections table (main table)
CREATE TABLE IF NOT EXISTS reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reflection_type TEXT NOT NULL,
  type TEXT,
  answers JSONB NOT NULL,
  content JSONB,
  status TEXT DEFAULT 'completed',
  metadata JSONB,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- 3. Create policies so users can manage their own reflections
CREATE POLICY "Users can view own reflections" 
ON reflections FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" 
ON reflections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" 
ON reflections FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" 
ON reflections FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create reflection_events table
CREATE TABLE IF NOT EXISTS reflection_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  reflection_id UUID REFERENCES reflections(id) ON DELETE CASCADE,
  reflection_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS for reflection_events
ALTER TABLE reflection_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events" 
ON reflection_events FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" 
ON reflection_events FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 6. Create growth_insights table
CREATE TABLE IF NOT EXISTS growth_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT,
  data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enable RLS for growth_insights
ALTER TABLE growth_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights" 
ON growth_insights FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" 
ON growth_insights FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" 
ON growth_insights FOR UPDATE 
USING (auth.uid() = user_id);

-- 8. Create user_growth_metrics table
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

-- 9. Enable RLS for user_growth_metrics
ALTER TABLE user_growth_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metrics" 
ON user_growth_metrics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics" 
ON user_growth_metrics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics" 
ON user_growth_metrics FOR UPDATE 
USING (auth.uid() = user_id);

-- 10. Create context_metrics table
CREATE TABLE IF NOT EXISTS context_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL,
  metrics JSONB NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, context_type)
);

-- 11. Enable RLS for context_metrics
ALTER TABLE context_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own context metrics" 
ON context_metrics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own context metrics" 
ON context_metrics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own context metrics" 
ON context_metrics FOR UPDATE 
USING (auth.uid() = user_id);

-- Done! Your essential tables are created.
-- To verify, run: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';