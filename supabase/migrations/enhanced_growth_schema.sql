-- ============================================
-- ENHANCED GROWTH INSIGHTS DATABASE SCHEMA
-- ============================================
-- Complete schema for the redesigned Growth Insights Dashboard
-- Including Emotion RAG system, gamification, and engagement tracking

-- ============================================
-- 1. EMOTION ENTRIES TABLE (RAG System)
-- ============================================
-- Stores daily mood check-ins with Red-Amber-Green system

CREATE TABLE IF NOT EXISTS emotion_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  value TEXT CHECK (value IN ('red', 'amber', 'green')) NOT NULL,
  emoji TEXT,
  note TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure only one entry per user per day
  UNIQUE(user_id, DATE(timestamp))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_emotion_entries_user_id ON emotion_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_entries_timestamp ON emotion_entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_emotion_entries_value ON emotion_entries(value);

-- Enable RLS
ALTER TABLE emotion_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own emotions" ON emotion_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emotions" ON emotion_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emotions" ON emotion_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 2. USER ACTIONS TABLE (Engagement Tracking)
-- ============================================
-- Tracks all user interactions with CTAs and features

CREATE TABLE IF NOT EXISTS user_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, -- 'start_reflection_clicked', 'stress_reset_clicked', etc.
  metadata JSONB, -- Additional context about the action
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id UUID, -- Optional: track actions within a session
  device_info JSONB -- Optional: browser, OS, viewport size
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_action ON user_actions(action);
CREATE INDEX IF NOT EXISTS idx_user_actions_timestamp ON user_actions(timestamp DESC);

-- Enable RLS
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own actions" ON user_actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own actions" ON user_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. USER BADGES TABLE (Gamification)
-- ============================================
-- Tracks earned badges and achievements

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL, -- 'streak_warrior', 'wellness_champion', etc.
  earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress NUMERIC DEFAULT 0, -- Progress percentage if not yet earned
  metadata JSONB, -- Additional badge-specific data
  UNIQUE(user_id, badge_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own badges" ON user_badges
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 4. COMMUNITY METRICS TABLE
-- ============================================
-- Stores aggregated community averages for comparison

CREATE TABLE IF NOT EXISTS community_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL UNIQUE, -- 'avg_reflections_per_week', etc.
  metric_value NUMERIC NOT NULL,
  sample_size INTEGER, -- Number of users in calculation
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_period TEXT -- 'weekly', 'monthly', 'all_time'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_community_metrics_name ON community_metrics(metric_name);

-- This table is read-only for users
ALTER TABLE community_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view community metrics" ON community_metrics
  FOR SELECT USING (true);

-- ============================================
-- 5. FUNCTION: Calculate Emotion Trends
-- ============================================
-- Analyzes emotion patterns over time

CREATE OR REPLACE FUNCTION calculate_emotion_trends(p_user_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE(
  emotion_date DATE,
  emotion_value TEXT,
  emotion_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(timestamp) as emotion_date,
    value as emotion_value,
    CASE 
      WHEN value = 'green' THEN 3
      WHEN value = 'amber' THEN 2
      WHEN value = 'red' THEN 1
      ELSE 0
    END as emotion_score
  FROM emotion_entries
  WHERE user_id = p_user_id
    AND timestamp >= CURRENT_DATE - INTERVAL '1 day' * p_days
  ORDER BY timestamp DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. FUNCTION: Update Badge Progress
-- ============================================
-- Updates user badge progress based on activities

CREATE OR REPLACE FUNCTION update_badge_progress(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_reflection_count INTEGER;
  v_wellness_count INTEGER;
  v_streak_count INTEGER;
  v_team_count INTEGER;
  v_boundary_count INTEGER;
BEGIN
  -- Count reflections for Streak Warrior
  SELECT current_streak INTO v_streak_count
  FROM calculate_user_streak(p_user_id);
  
  -- Update or insert Streak Warrior badge
  INSERT INTO user_badges (user_id, badge_id, progress, earned_date)
  VALUES (
    p_user_id,
    'streak_warrior',
    LEAST(100, (v_streak_count::NUMERIC / 7) * 100),
    CASE WHEN v_streak_count >= 7 THEN NOW() ELSE NULL END
  )
  ON CONFLICT (user_id, badge_id)
  DO UPDATE SET
    progress = LEAST(100, (v_streak_count::NUMERIC / 7) * 100),
    earned_date = CASE WHEN v_streak_count >= 7 AND user_badges.earned_date IS NULL THEN NOW() ELSE user_badges.earned_date END;
  
  -- Count wellness check-ins
  SELECT COUNT(*) INTO v_wellness_count
  FROM reflection_entries
  WHERE user_id = p_user_id
    AND entry_kind = 'wellness_checkin';
  
  -- Update Wellness Champion badge
  INSERT INTO user_badges (user_id, badge_id, progress, earned_date)
  VALUES (
    p_user_id,
    'wellness_champion',
    LEAST(100, (v_wellness_count::NUMERIC / 10) * 100),
    CASE WHEN v_wellness_count >= 10 THEN NOW() ELSE NULL END
  )
  ON CONFLICT (user_id, badge_id)
  DO UPDATE SET
    progress = LEAST(100, (v_wellness_count::NUMERIC / 10) * 100),
    earned_date = CASE WHEN v_wellness_count >= 10 AND user_badges.earned_date IS NULL THEN NOW() ELSE user_badges.earned_date END;
  
  -- Count boundary/values reflections
  SELECT COUNT(*) INTO v_boundary_count
  FROM reflection_entries
  WHERE user_id = p_user_id
    AND entry_kind = 'compass_check';
  
  -- Update Boundary Setter badge
  INSERT INTO user_badges (user_id, badge_id, progress, earned_date)
  VALUES (
    p_user_id,
    'boundary_setter',
    LEAST(100, (v_boundary_count::NUMERIC / 5) * 100),
    CASE WHEN v_boundary_count >= 5 THEN NOW() ELSE NULL END
  )
  ON CONFLICT (user_id, badge_id)
  DO UPDATE SET
    progress = LEAST(100, (v_boundary_count::NUMERIC / 5) * 100),
    earned_date = CASE WHEN v_boundary_count >= 5 AND user_badges.earned_date IS NULL THEN NOW() ELSE user_badges.earned_date END;
  
  -- Count team reflections
  SELECT COUNT(*) INTO v_team_count
  FROM reflection_entries
  WHERE user_id = p_user_id
    AND entry_kind IN ('teaming_prep', 'teaming_reflection');
  
  -- Update Team Player badge
  INSERT INTO user_badges (user_id, badge_id, progress, earned_date)
  VALUES (
    p_user_id,
    'team_player',
    LEAST(100, (v_team_count::NUMERIC / 3) * 100),
    CASE WHEN v_team_count >= 3 THEN NOW() ELSE NULL END
  )
  ON CONFLICT (user_id, badge_id)
  DO UPDATE SET
    progress = LEAST(100, (v_team_count::NUMERIC / 3) * 100),
    earned_date = CASE WHEN v_team_count >= 3 AND user_badges.earned_date IS NULL THEN NOW() ELSE user_badges.earned_date END;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. FUNCTION: Calculate Community Averages
-- ============================================
-- Updates community metrics for comparison

CREATE OR REPLACE FUNCTION update_community_metrics()
RETURNS VOID AS $$
BEGIN
  -- Average reflections per week
  INSERT INTO community_metrics (metric_name, metric_value, sample_size, time_period)
  SELECT 
    'avg_reflections_per_week',
    AVG(weekly_count),
    COUNT(DISTINCT user_id),
    'weekly'
  FROM (
    SELECT 
      user_id,
      COUNT(*) as weekly_count
    FROM reflection_entries
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY user_id
  ) weekly_stats
  ON CONFLICT (metric_name)
  DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    sample_size = EXCLUDED.sample_size,
    calculated_at = NOW();
  
  -- Average wellness score
  INSERT INTO community_metrics (metric_name, metric_value, sample_size, time_period)
  SELECT 
    'avg_wellness_score',
    AVG((data->>'overall_wellbeing')::NUMERIC),
    COUNT(DISTINCT user_id),
    'monthly'
  FROM reflection_entries
  WHERE entry_kind = 'wellness_checkin'
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND data->>'overall_wellbeing' IS NOT NULL
  ON CONFLICT (metric_name)
  DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    sample_size = EXCLUDED.sample_size,
    calculated_at = NOW();
  
  -- Average streak length
  INSERT INTO community_metrics (metric_name, metric_value, sample_size, time_period)
  SELECT 
    'avg_current_streak',
    AVG(current_streak),
    COUNT(*),
    'all_time'
  FROM (
    SELECT 
      user_id,
      (calculate_user_streak(user_id)).current_streak
    FROM auth.users
  ) streak_stats
  WHERE current_streak > 0
  ON CONFLICT (metric_name)
  DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    sample_size = EXCLUDED.sample_size,
    calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. TRIGGER: Auto-update badges on activity
-- ============================================

CREATE OR REPLACE FUNCTION trigger_update_badges()
RETURNS TRIGGER AS $$
BEGIN
  -- Update badges for the user who just added an entry
  PERFORM update_badge_progress(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reflection entries
CREATE TRIGGER update_badges_on_reflection
  AFTER INSERT OR UPDATE ON reflection_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_badges();

-- Create trigger for daily activity
CREATE TRIGGER update_badges_on_activity
  AFTER INSERT OR UPDATE ON daily_activity
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_badges();

-- ============================================
-- 9. VIEW: User Dashboard Summary
-- ============================================
-- Comprehensive view for quick dashboard loading

CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT 
  u.id as user_id,
  -- Reflection metrics
  COUNT(DISTINCT r.id) as total_reflections,
  COUNT(DISTINCT CASE WHEN r.created_at >= NOW() - INTERVAL '7 days' THEN r.id END) as week_reflections,
  COUNT(DISTINCT CASE WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN r.id END) as month_reflections,
  
  -- Wellness metrics
  AVG(CASE WHEN r.entry_kind = 'wellness_checkin' THEN (r.data->>'overall_wellbeing')::NUMERIC END) as avg_wellness,
  
  -- Emotion metrics
  COUNT(DISTINCT e.id) as emotion_entries_count,
  
  -- Streak from function
  (SELECT current_streak FROM calculate_user_streak(u.id)) as current_streak,
  (SELECT longest_streak FROM calculate_user_streak(u.id)) as longest_streak,
  
  -- Badge count
  COUNT(DISTINCT b.id) FILTER (WHERE b.earned_date IS NOT NULL) as earned_badges_count,
  COUNT(DISTINCT b.id) as total_badges_tracked
  
FROM auth.users u
LEFT JOIN reflection_entries r ON u.id = r.user_id
LEFT JOIN emotion_entries e ON u.id = e.user_id
LEFT JOIN user_badges b ON u.id = b.user_id
GROUP BY u.id;

-- ============================================
-- 10. SCHEDULED JOBS (Optional - for Supabase Edge Functions)
-- ============================================
-- These would be implemented as Edge Functions that run periodically

-- Daily: Update community metrics
-- SELECT update_community_metrics();

-- Daily: Clean up old action logs (keep 90 days)
-- DELETE FROM user_actions WHERE timestamp < NOW() - INTERVAL '90 days';

-- ============================================
-- 11. SAMPLE DATA FOR TESTING
-- ============================================

/*
-- Insert sample emotion entries
INSERT INTO emotion_entries (user_id, value, emoji, note) VALUES
  (auth.uid(), 'green', '😊', 'Feeling great today!'),
  (auth.uid(), 'amber', '😐', 'Managing workload'),
  (auth.uid(), 'red', '😟', 'Challenging day');

-- Insert sample user actions
INSERT INTO user_actions (user_id, action, metadata) VALUES
  (auth.uid(), 'start_reflection_clicked', '{"source": "dashboard"}'),
  (auth.uid(), 'emotion_logged', '{"value": "green"}'),
  (auth.uid(), 'stress_reset_clicked', '{"tool": "breathing"}');

-- Insert sample community metrics
INSERT INTO community_metrics (metric_name, metric_value, sample_size) VALUES
  ('avg_reflections_per_week', 4.2, 150),
  ('avg_wellness_score', 7.1, 150),
  ('avg_current_streak', 3.5, 150);
*/

-- ============================================
-- 12. PERMISSIONS GRANTS (if needed)
-- ============================================

-- Grant usage on all tables to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;