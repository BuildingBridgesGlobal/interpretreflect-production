-- ============================================
-- GROWTH INSIGHTS DATABASE SCHEMA
-- ============================================
-- This file documents the required Supabase tables and functions
-- for the Growth Insights dashboard to work properly.
-- Run these migrations in your Supabase SQL editor.

-- ============================================
-- 1. REFLECTION ENTRIES TABLE
-- ============================================
-- Stores all reflection activities (prep, debrief, wellness checks, etc.)

CREATE TABLE IF NOT EXISTS reflection_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reflection_id TEXT NOT NULL,
  entry_kind TEXT NOT NULL, -- 'wellness_checkin', 'pre_assignment_prep', 'teaming_prep', etc.
  team_id UUID, -- Optional: for team session tracking
  session_id UUID, -- Optional: for shared team sessions
  data JSONB NOT NULL, -- Stores all the reflection data as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reflection_entries_user_id ON reflection_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_reflection_entries_entry_kind ON reflection_entries(entry_kind);
CREATE INDEX IF NOT EXISTS idx_reflection_entries_created_at ON reflection_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reflection_entries_team_id ON reflection_entries(team_id) WHERE team_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE reflection_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own reflections
CREATE POLICY "Users can view own reflections" ON reflection_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON reflection_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON reflection_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 2. STRESS RESET LOGS TABLE
-- ============================================
-- Tracks usage of stress reset tools and activities

CREATE TABLE IF NOT EXISTS stress_reset_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_type TEXT NOT NULL, -- 'breathing', 'body_awareness', 'tech_reset', etc.
  duration_seconds INTEGER,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stress_reset_logs_user_id ON stress_reset_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_stress_reset_logs_tool_type ON stress_reset_logs(tool_type);
CREATE INDEX IF NOT EXISTS idx_stress_reset_logs_created_at ON stress_reset_logs(created_at DESC);

-- Enable RLS
ALTER TABLE stress_reset_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own stress reset logs" ON stress_reset_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stress reset logs" ON stress_reset_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. DAILY ACTIVITY TABLE
-- ============================================
-- Tracks daily activity for streak calculations

CREATE TABLE IF NOT EXISTS daily_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_date DATE NOT NULL,
  activities_count INTEGER DEFAULT 0,
  reflection_count INTEGER DEFAULT 0,
  stress_reset_count INTEGER DEFAULT 0,
  wellness_check_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_id ON daily_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activity_date ON daily_activity(activity_date DESC);

-- Enable RLS
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own daily activity" ON daily_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily activity" ON daily_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily activity" ON daily_activity
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 4. FUNCTION: UPDATE DAILY ACTIVITY
-- ============================================
-- Automatically updates daily activity when new entries are created

CREATE OR REPLACE FUNCTION update_daily_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert daily activity record
  INSERT INTO daily_activity (
    user_id,
    activity_date,
    activities_count,
    reflection_count,
    stress_reset_count,
    wellness_check_count
  )
  VALUES (
    NEW.user_id,
    DATE(NEW.created_at),
    1,
    CASE WHEN NEW.entry_kind IN ('pre_assignment_prep', 'post_assignment_debrief', 'teaming_prep', 'teaming_reflection', 'compass_check', 'mentoring_prep', 'mentoring_reflection') THEN 1 ELSE 0 END,
    CASE WHEN NEW.entry_kind IN ('breathing_practice', 'body_awareness', 'tech_reset') THEN 1 ELSE 0 END,
    CASE WHEN NEW.entry_kind = 'wellness_checkin' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET
    activities_count = daily_activity.activities_count + 1,
    reflection_count = daily_activity.reflection_count + CASE WHEN NEW.entry_kind IN ('pre_assignment_prep', 'post_assignment_debrief', 'teaming_prep', 'teaming_reflection', 'compass_check', 'mentoring_prep', 'mentoring_reflection') THEN 1 ELSE 0 END,
    stress_reset_count = daily_activity.stress_reset_count + CASE WHEN NEW.entry_kind IN ('breathing_practice', 'body_awareness', 'tech_reset') THEN 1 ELSE 0 END,
    wellness_check_count = daily_activity.wellness_check_count + CASE WHEN NEW.entry_kind = 'wellness_checkin' THEN 1 ELSE 0 END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reflection entries
CREATE TRIGGER update_daily_activity_on_reflection
  AFTER INSERT ON reflection_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_activity();

-- ============================================
-- 5. FUNCTION: CALCULATE STREAK
-- ============================================
-- Calculates current and longest streak for a user

CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER) AS $$
DECLARE
  v_current_streak INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_temp_streak INTEGER := 0;
  v_prev_date DATE;
  v_activity_record RECORD;
BEGIN
  -- Get all activity dates for the user
  FOR v_activity_record IN 
    SELECT activity_date 
    FROM daily_activity 
    WHERE user_id = p_user_id 
    ORDER BY activity_date DESC
  LOOP
    IF v_prev_date IS NULL THEN
      -- First record
      v_temp_streak := 1;
      -- Check if this is today or yesterday for current streak
      IF v_activity_record.activity_date >= CURRENT_DATE - INTERVAL '1 day' THEN
        v_current_streak := 1;
      END IF;
    ELSIF v_prev_date - v_activity_record.activity_date = 1 THEN
      -- Consecutive day
      v_temp_streak := v_temp_streak + 1;
      -- Update current streak if still consecutive from today/yesterday
      IF v_current_streak > 0 THEN
        v_current_streak := v_temp_streak;
      END IF;
    ELSE
      -- Streak broken
      v_longest_streak := GREATEST(v_longest_streak, v_temp_streak);
      v_temp_streak := 1;
      -- Current streak ends if not starting from today/yesterday
      IF v_current_streak > 0 AND v_activity_record.activity_date < CURRENT_DATE - INTERVAL '1 day' THEN
        v_current_streak := 0;
      END IF;
    END IF;
    
    v_prev_date := v_activity_record.activity_date;
  END LOOP;
  
  -- Final check for longest streak
  v_longest_streak := GREATEST(v_longest_streak, v_temp_streak);
  
  RETURN QUERY SELECT v_current_streak, v_longest_streak;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. VIEW: USER GROWTH METRICS
-- ============================================
-- Aggregated view for quick access to user metrics

CREATE OR REPLACE VIEW user_growth_metrics AS
SELECT 
  u.id as user_id,
  COUNT(DISTINCT r.id) as total_reflections,
  COUNT(DISTINCT CASE WHEN r.created_at >= NOW() - INTERVAL '7 days' THEN r.id END) as week_reflections,
  COUNT(DISTINCT CASE WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN r.id END) as month_reflections,
  AVG(CASE WHEN r.entry_kind = 'wellness_checkin' THEN (r.data->>'overall_wellbeing')::NUMERIC END) as avg_wellbeing_score,
  COUNT(DISTINCT s.id) FILTER (WHERE s.created_at >= NOW() - INTERVAL '30 days') as month_stress_resets,
  (SELECT current_streak FROM calculate_user_streak(u.id)) as current_streak,
  (SELECT longest_streak FROM calculate_user_streak(u.id)) as longest_streak
FROM 
  auth.users u
  LEFT JOIN reflection_entries r ON u.id = r.user_id
  LEFT JOIN stress_reset_logs s ON u.id = s.user_id
GROUP BY u.id;

-- ============================================
-- 7. SAMPLE DATA INSERTION (FOR TESTING)
-- ============================================
-- Uncomment and modify these to add test data

/*
-- Sample reflection entry
INSERT INTO reflection_entries (user_id, reflection_id, entry_kind, data) VALUES (
  auth.uid(),
  'test-reflection-1',
  'wellness_checkin',
  jsonb_build_object(
    'overall_wellbeing', 7,
    'check_in_reason', 'Regular weekly check',
    'current_emotions', ARRAY['focused', 'calm'],
    'energy_level', 'moderate',
    'timestamp', NOW()
  )
);

-- Sample stress reset log
INSERT INTO stress_reset_logs (user_id, tool_type, duration_seconds, effectiveness_rating) VALUES (
  auth.uid(),
  'breathing',
  300,
  8
);

-- Sample daily activity (will be auto-created by trigger in production)
INSERT INTO daily_activity (user_id, activity_date, activities_count, reflection_count) VALUES (
  auth.uid(),
  CURRENT_DATE,
  3,
  2
);
*/

-- ============================================
-- 8. USEFUL QUERIES FOR THE DASHBOARD
-- ============================================

-- Get user's reflection count by type (last 30 days)
/*
SELECT 
  entry_kind,
  COUNT(*) as count
FROM reflection_entries
WHERE user_id = auth.uid()
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY entry_kind
ORDER BY count DESC;
*/

-- Get burnout trend (last 7 days)
/*
SELECT 
  DATE(created_at) as date,
  AVG((data->>'overall_wellbeing')::NUMERIC) as avg_score
FROM reflection_entries
WHERE user_id = auth.uid()
  AND entry_kind = 'wellness_checkin'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date;
*/

-- Get stress reset tool usage
/*
SELECT 
  tool_type,
  COUNT(*) as usage_count,
  AVG(effectiveness_rating) as avg_effectiveness
FROM stress_reset_logs
WHERE user_id = auth.uid()
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY tool_type
ORDER BY usage_count DESC;
*/

-- ============================================
-- 9. CLEANUP QUERIES (IF NEEDED)
-- ============================================
/*
-- To remove all tables and start fresh:
DROP TABLE IF EXISTS daily_activity CASCADE;
DROP TABLE IF EXISTS stress_reset_logs CASCADE;
DROP TABLE IF EXISTS reflection_entries CASCADE;
DROP FUNCTION IF EXISTS update_daily_activity CASCADE;
DROP FUNCTION IF EXISTS calculate_user_streak CASCADE;
DROP VIEW IF EXISTS user_growth_metrics CASCADE;
*/