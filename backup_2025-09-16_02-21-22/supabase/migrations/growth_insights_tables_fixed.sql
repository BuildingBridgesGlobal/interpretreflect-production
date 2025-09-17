-- Growth Insights Database Tables
-- These tables track all user wellness activities for the Growth Insights dashboard
-- Each table includes user_id to ensure proper data isolation between users

-- Create reflection_entries table for all types of reflections
CREATE TABLE IF NOT EXISTS reflection_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_kind VARCHAR(100) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for reflection_entries
CREATE INDEX IF NOT EXISTS idx_reflection_user_id ON reflection_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_reflection_entry_kind ON reflection_entries(entry_kind);
CREATE INDEX IF NOT EXISTS idx_reflection_created_at ON reflection_entries(created_at DESC);

-- Create stress_reset_logs table for tracking stress reset activities
CREATE TABLE IF NOT EXISTS stress_reset_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_type VARCHAR(100) NOT NULL,
  duration_minutes INTEGER,
  stress_level_before INTEGER CHECK (stress_level_before >= 1 AND stress_level_before <= 10),
  stress_level_after INTEGER CHECK (stress_level_after >= 1 AND stress_level_after <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for stress_reset_logs
CREATE INDEX IF NOT EXISTS idx_stress_user_id ON stress_reset_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_stress_tool_type ON stress_reset_logs(tool_type);
CREATE INDEX IF NOT EXISTS idx_stress_created_at ON stress_reset_logs(created_at DESC);

-- Create daily_activity table for streak tracking
CREATE TABLE IF NOT EXISTS daily_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  activities_completed TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user per day
  UNIQUE(user_id, activity_date)
);

-- Create indexes for daily_activity
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON daily_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_date ON daily_activity(activity_date DESC);

-- Create burnout_assessments table (if not exists)
CREATE TABLE IF NOT EXISTS burnout_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL,
  burnout_score DECIMAL(3,2) CHECK (burnout_score >= 0 AND burnout_score <= 10),
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  symptoms JSONB DEFAULT '{}',
  recovery_recommendations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for burnout_assessments
CREATE INDEX IF NOT EXISTS idx_burnout_user_id ON burnout_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_burnout_date ON burnout_assessments(assessment_date DESC);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE reflection_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE stress_reset_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE burnout_assessments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own reflections" ON reflection_entries;
DROP POLICY IF EXISTS "Users can insert own reflections" ON reflection_entries;
DROP POLICY IF EXISTS "Users can update own reflections" ON reflection_entries;
DROP POLICY IF EXISTS "Users can delete own reflections" ON reflection_entries;

-- Create RLS policies for reflection_entries
CREATE POLICY "Users can view own reflections" ON reflection_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON reflection_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON reflection_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON reflection_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Drop existing policies for stress_reset_logs if they exist
DROP POLICY IF EXISTS "Users can view own stress logs" ON stress_reset_logs;
DROP POLICY IF EXISTS "Users can insert own stress logs" ON stress_reset_logs;
DROP POLICY IF EXISTS "Users can update own stress logs" ON stress_reset_logs;
DROP POLICY IF EXISTS "Users can delete own stress logs" ON stress_reset_logs;

-- Create RLS policies for stress_reset_logs
CREATE POLICY "Users can view own stress logs" ON stress_reset_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stress logs" ON stress_reset_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stress logs" ON stress_reset_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stress logs" ON stress_reset_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Drop existing policies for daily_activity if they exist
DROP POLICY IF EXISTS "Users can view own daily activity" ON daily_activity;
DROP POLICY IF EXISTS "Users can insert own daily activity" ON daily_activity;
DROP POLICY IF EXISTS "Users can update own daily activity" ON daily_activity;
DROP POLICY IF EXISTS "Users can delete own daily activity" ON daily_activity;

-- Create RLS policies for daily_activity
CREATE POLICY "Users can view own daily activity" ON daily_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily activity" ON daily_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily activity" ON daily_activity
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily activity" ON daily_activity
  FOR DELETE USING (auth.uid() = user_id);

-- Drop existing policies for burnout_assessments if they exist
DROP POLICY IF EXISTS "Users can view own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can insert own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can update own burnout assessments" ON burnout_assessments;
DROP POLICY IF EXISTS "Users can delete own burnout assessments" ON burnout_assessments;

-- Create RLS policies for burnout_assessments
CREATE POLICY "Users can view own burnout assessments" ON burnout_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own burnout assessments" ON burnout_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own burnout assessments" ON burnout_assessments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own burnout assessments" ON burnout_assessments
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_reflection_entries_updated_at ON reflection_entries;
CREATE TRIGGER update_reflection_entries_updated_at
  BEFORE UPDATE ON reflection_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_activity_updated_at ON daily_activity;
CREATE TRIGGER update_daily_activity_updated_at
  BEFORE UPDATE ON daily_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for user statistics (optional but useful for dashboard)
DROP VIEW IF EXISTS user_growth_stats;
CREATE VIEW user_growth_stats AS
SELECT 
  user_id,
  COUNT(DISTINCT DATE(created_at)) as days_active,
  COUNT(*) as total_reflections,
  COUNT(DISTINCT entry_kind) as reflection_types_used,
  MAX(created_at) as last_activity,
  EXTRACT(DAY FROM NOW() - MIN(created_at)) as days_since_joined
FROM reflection_entries
GROUP BY user_id;

-- Grant permissions to authenticated users on the view
GRANT SELECT ON user_growth_stats TO authenticated;

-- Create function to get user streak
CREATE OR REPLACE FUNCTION get_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_check_date DATE;
BEGIN
  -- Check if user was active today or yesterday
  SELECT activity_date INTO v_check_date
  FROM daily_activity
  WHERE user_id = p_user_id
    AND activity_date >= CURRENT_DATE - INTERVAL '1 day'
  ORDER BY activity_date DESC
  LIMIT 1;
  
  IF v_check_date IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Count consecutive days
  WITH consecutive_days AS (
    SELECT 
      activity_date,
      activity_date - ROW_NUMBER() OVER (ORDER BY activity_date DESC)::INTEGER AS grp
    FROM daily_activity
    WHERE user_id = p_user_id
      AND activity_date <= CURRENT_DATE
    ORDER BY activity_date DESC
  )
  SELECT COUNT(*) INTO v_streak
  FROM consecutive_days
  WHERE grp = (
    SELECT grp 
    FROM consecutive_days 
    WHERE activity_date >= CURRENT_DATE - INTERVAL '1 day'
    LIMIT 1
  );
  
  RETURN COALESCE(v_streak, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_streak(UUID) TO authenticated;

-- Add helpful comments
COMMENT ON TABLE reflection_entries IS 'Stores all user reflection entries from various tools and exercises';
COMMENT ON TABLE stress_reset_logs IS 'Tracks stress reset technique usage and effectiveness';
COMMENT ON TABLE daily_activity IS 'Records daily activity for streak calculation and engagement tracking';
COMMENT ON TABLE burnout_assessments IS 'Stores burnout assessment results and risk levels';
COMMENT ON COLUMN reflection_entries.entry_kind IS 'Type of reflection: wellness_checkin, post_assignment, teaming_prep, etc.';
COMMENT ON COLUMN stress_reset_logs.tool_type IS 'Type of stress reset tool: breathing, cold-water, sensory-reset, etc.';