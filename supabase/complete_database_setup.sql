-- ============================================
-- USER PROFILES TABLE
-- ============================================
-- Stores extended user profile information for the Profile Settings page

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  pronouns TEXT,
  credentials TEXT[], -- Array of professional credentials
  language_preference TEXT DEFAULT 'en',
  high_contrast BOOLEAN DEFAULT false,
  larger_text BOOLEAN DEFAULT false,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Update profile timestamp
-- ============================================
-- Automatically updates the updated_at timestamp

CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_user_profiles_timestamp
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_timestamp();

-- ============================================
-- FUNCTION: Initialize user profile
-- ============================================
-- Creates a profile entry when a new user signs up

CREATE OR REPLACE FUNCTION initialize_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.email
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_profile();

-- ============================================
-- STORAGE BUCKET FOR AVATARS
-- ============================================

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public bucket for avatar images
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
-- Stores user customization preferences for notifications, interface, and accessibility

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  preferences JSONB NOT NULL DEFAULT '{
    "reminder_frequency": "daily",
    "reminder_time": "09:00",
    "custom_reminder_days": [],
    "theme": "light",
    "font_size": "standard",
    "language": "en",
    "keyboard_shortcuts": false,
    "screen_reader_mode": false
  }'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_updated ON user_preferences(updated_at DESC);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Update preferences timestamp
-- ============================================
-- Automatically updates the updated_at timestamp

CREATE OR REPLACE FUNCTION update_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
DROP TRIGGER IF EXISTS update_user_preferences_timestamp ON user_preferences;
CREATE TRIGGER update_user_preferences_timestamp
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_preferences_timestamp();

-- ============================================
-- FUNCTION: Initialize user preferences
-- ============================================
-- Creates a preferences entry when a new user signs up

CREATE OR REPLACE FUNCTION initialize_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON auth.users;
CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_preferences();

-- ============================================
-- FUNCTION: Get user preferences
-- ============================================
-- Returns current user preferences for application

CREATE OR REPLACE FUNCTION get_user_preferences(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_preferences JSONB;
BEGIN
  SELECT preferences INTO v_preferences
  FROM user_preferences
  WHERE user_id = p_user_id;
  
  IF v_preferences IS NULL THEN
    -- Return default preferences if none exist
    RETURN '{
      "reminder_frequency": "daily",
      "reminder_time": "09:00",
      "custom_reminder_days": [],
      "theme": "light",
      "font_size": "standard",
      "language": "en",
      "keyboard_shortcuts": false,
      "screen_reader_mode": false
    }'::jsonb;
  END IF;
  
  RETURN v_preferences;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ============================================

/*
-- Insert sample profile
INSERT INTO user_profiles (user_id, full_name, pronouns, credentials, language_preference)
VALUES (
  auth.uid(),
  'Jane Smith',
  'she/her',
  ARRAY['MD', 'LCSW', 'NBCC'],
  'en'
);
*/-- ============================================
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
*/-- ============================================
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
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
-- Stores user subscription information

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_name TEXT CHECK (plan_name IN ('free', 'essential', 'professional', 'organization')) NOT NULL DEFAULT 'free',
  price DECIMAL(10,2) DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'inactive', 'trial', 'cancelled')) NOT NULL DEFAULT 'inactive',
  next_billing_date TIMESTAMP WITH TIME ZONE,
  payment_method JSONB,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  trial_starts_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancel_reason TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- INVOICES TABLE
-- ============================================
-- Stores invoice history

CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT UNIQUE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('paid', 'pending', 'failed', 'cancelled')) NOT NULL DEFAULT 'pending',
  description TEXT,
  invoice_pdf TEXT,
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice ON invoices(stripe_invoice_id);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage invoices" ON invoices
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- FUNCTION: Update subscription timestamp
-- ============================================
-- Automatically updates the updated_at timestamp

CREATE OR REPLACE FUNCTION update_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
DROP TRIGGER IF EXISTS update_subscriptions_timestamp ON subscriptions;
CREATE TRIGGER update_subscriptions_timestamp
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_timestamp();

-- ============================================
-- FUNCTION: Cancel subscription
-- ============================================
-- Handles subscription cancellation

CREATE OR REPLACE FUNCTION cancel_subscription(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE subscriptions
  SET 
    status = 'cancelled',
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Initialize user subscription
-- ============================================
-- Creates a free subscription entry when a new user signs up

CREATE OR REPLACE FUNCTION initialize_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan_name, price, status)
  VALUES (NEW.id, 'free', 0, 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_subscription();

-- ============================================
-- FUNCTION: Check subscription status
-- ============================================
-- Returns the current subscription status and details

CREATE OR REPLACE FUNCTION get_subscription_status(p_user_id UUID)
RETURNS TABLE(
  plan_name TEXT,
  status TEXT,
  is_premium BOOLEAN,
  trial_active BOOLEAN,
  days_until_billing INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.plan_name,
    s.status,
    s.plan_name != 'free' AS is_premium,
    s.status = 'trial' AND s.trial_ends_at > NOW() AS trial_active,
    CASE 
      WHEN s.next_billing_date IS NOT NULL THEN 
        EXTRACT(DAY FROM s.next_billing_date - NOW())::INTEGER
      ELSE NULL
    END AS days_until_billing
  FROM subscriptions s
  WHERE s.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEW: Subscription Overview
-- ============================================
-- Comprehensive view for subscription management

CREATE OR REPLACE VIEW subscription_overview AS
SELECT 
  s.id,
  s.user_id,
  s.plan_name,
  s.price,
  s.status,
  s.next_billing_date,
  s.payment_method,
  s.trial_ends_at,
  s.cancelled_at,
  u.email as user_email,
  COUNT(DISTINCT i.id) as total_invoices,
  SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) as total_paid,
  MAX(i.date) as last_invoice_date
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
LEFT JOIN invoices i ON s.id = i.subscription_id
GROUP BY s.id, u.email;

-- Grant access to authenticated users
GRANT SELECT ON subscription_overview TO authenticated;

-- ============================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ============================================

/*
-- Insert sample subscription
INSERT INTO subscriptions (user_id, plan_name, price, status, next_billing_date, payment_method)
VALUES (
  auth.uid(),
  'professional',
  24.00,
  'active',
  NOW() + INTERVAL '30 days',
  '{
    "type": "card",
    "brand": "Visa",
    "last4": "4242"
  }'::jsonb
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  plan_name = EXCLUDED.plan_name,
  price = EXCLUDED.price,
  status = EXCLUDED.status,
  next_billing_date = EXCLUDED.next_billing_date,
  payment_method = EXCLUDED.payment_method;

-- Insert sample invoices
INSERT INTO invoices (user_id, amount, status, description, invoice_pdf)
VALUES 
  (auth.uid(), 24.00, 'paid', 'Professional Plan - Monthly', '/invoices/2024-01.pdf'),
  (auth.uid(), 24.00, 'paid', 'Professional Plan - Monthly', '/invoices/2024-02.pdf');
*/