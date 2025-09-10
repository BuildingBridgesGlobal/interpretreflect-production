-- Add Missing Tables and Policies for InterpretReflect
-- Run this to complete your Supabase setup

-- =====================================================
-- 1. Create REFLECTIONS table if it doesn't exist
-- =====================================================
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

-- Enable RLS
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- Policies for reflections (including DELETE as requested)
CREATE POLICY "Users can view own reflections" 
ON reflections FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" 
ON reflections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" 
ON reflections FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow DELETE for reflections
CREATE POLICY "Users can delete own reflections" 
ON reflections FOR DELETE 
USING (auth.uid() = user_id);

-- =====================================================
-- 2. Create REFLECTION_EVENTS table if it doesn't exist
-- =====================================================
CREATE TABLE IF NOT EXISTS reflection_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  reflection_id UUID REFERENCES reflections(id) ON DELETE CASCADE,
  reflection_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reflection_events ENABLE ROW LEVEL SECURITY;

-- Policies for reflection_events (NO DELETE as requested)
CREATE POLICY "Users can view own events" 
ON reflection_events FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" 
ON reflection_events FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- NO DELETE policy for reflection_events (keeping event history)

-- =====================================================
-- 3. Create GROWTH_INSIGHTS table if it doesn't exist
-- =====================================================
CREATE TABLE IF NOT EXISTS growth_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT,
  data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE growth_insights ENABLE ROW LEVEL SECURITY;

-- Policies for growth_insights
CREATE POLICY "Users can view own insights" 
ON growth_insights FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" 
ON growth_insights FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" 
ON growth_insights FOR UPDATE 
USING (auth.uid() = user_id);

-- Optional DELETE for growth_insights (you can add later if needed)
-- CREATE POLICY "Users can delete own insights" 
-- ON growth_insights FOR DELETE 
-- USING (auth.uid() = user_id);

-- =====================================================
-- 4. Verify USER_GROWTH_METRICS policies
-- =====================================================
-- Table should already exist, just ensure policies are correct

-- NO DELETE policy for user_growth_metrics (preserving metrics history)
-- Only SELECT, INSERT, UPDATE allowed

-- =====================================================
-- 5. Verify CONTEXT_METRICS policies  
-- =====================================================
-- Table should already exist, just ensure policies are correct

-- NO DELETE policy for context_metrics (UPDATE-only as requested)
-- Only SELECT, INSERT, UPDATE allowed

-- =====================================================
-- 6. Create indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_type ON reflections(type);
CREATE INDEX IF NOT EXISTS idx_reflections_created_at ON reflections(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reflection_events_user_id ON reflection_events(user_id);
CREATE INDEX IF NOT EXISTS idx_reflection_events_created_at ON reflection_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_growth_insights_user_id ON growth_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_insights_type ON growth_insights(insight_type);

-- =====================================================
-- 7. Verify all tables exist
-- =====================================================
-- After running this, check your tables with:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('reflections', 'reflection_events', 'growth_insights', 'user_growth_metrics', 'context_metrics')
ORDER BY table_name;

-- You should see all 5 tables listed