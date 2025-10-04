-- Complete Database Schema Setup for InterpretReflect
-- This creates ALL missing tables and fixes naming issues
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- 1. FIX EXISTING TABLE ISSUES
-- ============================================

-- Fix body_checkins table (code expects body_check_ins with underscore)
-- First check if body_checkins exists and rename it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'body_checkins') THEN
    -- Rename table to match what code expects
    ALTER TABLE body_checkins RENAME TO body_check_ins;
  END IF;
END $$;

-- Create body_check_ins if it doesn't exist
CREATE TABLE IF NOT EXISTS body_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and add policies
ALTER TABLE body_check_ins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own checkins" ON body_check_ins;
CREATE POLICY "Users can manage own checkins" ON body_check_ins
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. USER PREFERENCES TABLE (rename or create)
-- ============================================

-- Check if ui_preferences exists and rename it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ui_preferences') THEN
    ALTER TABLE ui_preferences RENAME TO user_preferences;
  END IF;
END $$;

-- Create user_preferences if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_type TEXT,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. REFLECTIONS TABLE (separate from reflection_entries)
-- ============================================

CREATE TABLE IF NOT EXISTS reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT,
  content TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own reflections" ON reflections;
CREATE POLICY "Users can manage own reflections" ON reflections
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. TECHNIQUE USAGE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS technique_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  technique_name TEXT,
  duration_minutes INTEGER,
  effectiveness_rating INTEGER,
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE technique_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own technique usage" ON technique_usage;
CREATE POLICY "Users can manage own technique usage" ON technique_usage
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. BURNOUT ASSESSMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS burnout_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date DATE,
  scores JSONB,
  risk_level TEXT,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE burnout_assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own assessments" ON burnout_assessments;
CREATE POLICY "Users can manage own assessments" ON burnout_assessments
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. AFFIRMATIONS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS affirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  affirmation_type TEXT, -- 'daily', 'recent', 'custom'
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE affirmations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own affirmations" ON affirmations;
CREATE POLICY "Users can manage own affirmations" ON affirmations
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Affirmation favorites table
CREATE TABLE IF NOT EXISTS affirmation_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  favorites JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE affirmation_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own favorites" ON affirmation_favorites;
CREATE POLICY "Users can manage own favorites" ON affirmation_favorites
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. SESSION TABLES (Body Awareness, Boundaries, etc.)
-- ============================================

-- Body Awareness Sessions
CREATE TABLE IF NOT EXISTS body_awareness_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  version TEXT DEFAULT 'v1',
  session_data JSONB,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE body_awareness_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own sessions" ON body_awareness_sessions;
CREATE POLICY "Users can manage own sessions" ON body_awareness_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Boundaries Sessions
CREATE TABLE IF NOT EXISTS boundaries_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_data JSONB,
  boundary_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE boundaries_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own sessions" ON boundaries_sessions;
CREATE POLICY "Users can manage own sessions" ON boundaries_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Emotional Proximity Sessions
CREATE TABLE IF NOT EXISTS emotional_proximity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_data JSONB,
  proximity_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE emotional_proximity_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own sessions" ON emotional_proximity_sessions;
CREATE POLICY "Users can manage own sessions" ON emotional_proximity_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Code Switch Sessions
CREATE TABLE IF NOT EXISTS code_switch_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_data JSONB,
  language_pair TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE code_switch_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own sessions" ON code_switch_sessions;
CREATE POLICY "Users can manage own sessions" ON code_switch_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 8. ASSIGNMENT RELATED TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS assignment_prep (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_type TEXT,
  preparation_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE assignment_prep ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own prep" ON assignment_prep;
CREATE POLICY "Users can manage own prep" ON assignment_prep
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS assignment_debriefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignment_prep(id) ON DELETE SET NULL,
  debrief_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE assignment_debriefs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own debriefs" ON assignment_debriefs;
CREATE POLICY "Users can manage own debriefs" ON assignment_debriefs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 9. WELLNESS CHECK-INS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS wellness_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_data JSONB,
  wellness_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE wellness_check_ins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own check-ins" ON wellness_check_ins;
CREATE POLICY "Users can manage own check-ins" ON wellness_check_ins
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_body_check_ins_user_id ON body_check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_technique_usage_user_id ON technique_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_burnout_assessments_user_id ON burnout_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_affirmations_user_id ON affirmations(user_id);
CREATE INDEX IF NOT EXISTS idx_affirmation_favorites_user_id ON affirmation_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_body_awareness_sessions_user_id ON body_awareness_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_boundaries_sessions_user_id ON boundaries_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_proximity_sessions_user_id ON emotional_proximity_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_code_switch_sessions_user_id ON code_switch_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_prep_user_id ON assignment_prep(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_debriefs_user_id ON assignment_debriefs(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_check_ins_user_id ON wellness_check_ins(user_id);

-- ============================================
-- 11. VERIFY ALL TABLES ARE CREATED
-- ============================================

SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✓ RLS Enabled' ELSE '✗ RLS Disabled' END as security_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'body_check_ins',
  'user_preferences',
  'reflections',
  'technique_usage',
  'burnout_assessments',
  'affirmations',
  'affirmation_favorites',
  'body_awareness_sessions',
  'boundaries_sessions',
  'emotional_proximity_sessions',
  'code_switch_sessions',
  'assignment_prep',
  'assignment_debriefs',
  'wellness_check_ins',
  'reflection_entries',
  'profiles',
  'subscriptions',
  'daily_activity',
  'stress_reset_logs',
  'wellness_metrics'
)
ORDER BY tablename;