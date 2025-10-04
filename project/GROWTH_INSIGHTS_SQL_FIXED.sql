-- =====================================================
-- COMPLETE GROWTH INSIGHTS DATABASE SETUP (FIXED)
-- All tables and functions for Growth Insights components
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. BODY CHECK-INS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.body_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tension_level INTEGER CHECK (tension_level >= 1 AND tension_level <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  mood_level INTEGER CHECK (mood_level >= 1 AND mood_level <= 10),
  overall_feeling INTEGER CHECK (overall_feeling >= 1 AND overall_feeling <= 10),
  notes TEXT,
  body_areas JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create standard indexes (no partial indexes with CURRENT_DATE)
CREATE INDEX IF NOT EXISTS idx_body_checkins_user ON public.body_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_body_checkins_created ON public.body_checkins(created_at DESC);

-- Enable RLS
ALTER TABLE public.body_checkins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own body checkins" ON public.body_checkins;
DROP POLICY IF EXISTS "Users can insert own body checkins" ON public.body_checkins;
DROP POLICY IF EXISTS "Users can update own body checkins" ON public.body_checkins;
DROP POLICY IF EXISTS "Users can delete own body checkins" ON public.body_checkins;

-- Create RLS policies
CREATE POLICY "Users can view own body checkins"
  ON public.body_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own body checkins"
  ON public.body_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own body checkins"
  ON public.body_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own body checkins"
  ON public.body_checkins FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 2. RECOVERY HABITS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.recovery_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_type TEXT NOT NULL CHECK (habit_type IN (
    'mindfulness', 'exercise', 'sleep', 'nutrition', 'social', 'breaks', 'boundaries', 'other'
  )),
  description TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'as_needed')),
  effectiveness INTEGER CHECK (effectiveness >= 1 AND effectiveness <= 10),
  last_practiced DATE,
  streak_days INTEGER DEFAULT 0,
  total_practices INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recovery_habits_user ON public.recovery_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_habits_type ON public.recovery_habits(habit_type);
CREATE INDEX IF NOT EXISTS idx_recovery_habits_last_practiced ON public.recovery_habits(last_practiced DESC);

-- Enable RLS
ALTER TABLE public.recovery_habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own recovery habits" ON public.recovery_habits;
CREATE POLICY "Users can manage own recovery habits"
  ON public.recovery_habits
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. TECHNIQUE USAGE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.technique_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technique_name TEXT NOT NULL,
  technique_category TEXT CHECK (technique_category IN (
    'breathing', 'grounding', 'movement', 'visualization', 'cognitive', 'somatic', 'other'
  )),
  usage_count INTEGER DEFAULT 1,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
  context TEXT,
  notes TEXT,
  last_used TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_technique_usage_user ON public.technique_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_technique_usage_name ON public.technique_usage(technique_name);
CREATE INDEX IF NOT EXISTS idx_technique_usage_last ON public.technique_usage(last_used DESC);

-- Enable RLS
ALTER TABLE public.technique_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own technique usage" ON public.technique_usage;
CREATE POLICY "Users can manage own technique usage"
  ON public.technique_usage
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. DAILY BURNOUT METRICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_burnout_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,  -- Changed from 'date' to 'metric_date' to avoid reserved word
  burnout_score DECIMAL(3,2) CHECK (burnout_score >= 0 AND burnout_score <= 10),
  stress_level DECIMAL(3,2) CHECK (stress_level >= 0 AND stress_level <= 10),
  energy_level DECIMAL(3,2) CHECK (energy_level >= 0 AND energy_level <= 10),
  workload_score DECIMAL(3,2) CHECK (workload_score >= 0 AND workload_score <= 10),
  recovery_score DECIMAL(3,2) CHECK (recovery_score >= 0 AND recovery_score <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, metric_date)
);

-- Create regular indexes (no partial indexes with non-immutable functions)
CREATE INDEX IF NOT EXISTS idx_daily_burnout_user ON public.daily_burnout_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_burnout_date ON public.daily_burnout_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_burnout_user_date ON public.daily_burnout_metrics(user_id, metric_date DESC);

-- Enable RLS
ALTER TABLE public.daily_burnout_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own burnout metrics" ON public.daily_burnout_metrics;
CREATE POLICY "Users can manage own burnout metrics"
  ON public.daily_burnout_metrics
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to get recovery habits summary
CREATE OR REPLACE FUNCTION public.get_recovery_habits_summary(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_habits', (SELECT COUNT(*) FROM public.recovery_habits WHERE user_id = p_user_id),
    'active_habits', (SELECT COUNT(*) FROM public.recovery_habits
                      WHERE user_id = p_user_id
                      AND last_practiced > CURRENT_DATE - INTERVAL '7 days'),
    'most_effective', (SELECT json_build_object(
                        'habit_type', habit_type,
                        'description', description,
                        'effectiveness', effectiveness
                      ) FROM public.recovery_habits
                      WHERE user_id = p_user_id
                      ORDER BY effectiveness DESC
                      LIMIT 1),
    'habits_by_type', (SELECT json_object_agg(habit_type, count)
                       FROM (SELECT habit_type, COUNT(*) as count
                             FROM public.recovery_habits
                             WHERE user_id = p_user_id
                             GROUP BY habit_type) t)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Function to get technique effectiveness
CREATE OR REPLACE FUNCTION public.get_technique_effectiveness(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'most_used', (SELECT json_agg(json_build_object(
                    'name', technique_name,
                    'count', usage_count,
                    'effectiveness', effectiveness_rating
                  ) ORDER BY usage_count DESC)
                  FROM (SELECT technique_name, SUM(usage_count) as usage_count,
                               AVG(effectiveness_rating) as effectiveness_rating
                        FROM public.technique_usage
                        WHERE user_id = p_user_id
                        AND last_used > CURRENT_DATE - (p_days || ' days')::INTERVAL
                        GROUP BY technique_name
                        LIMIT 5) t),
    'by_category', (SELECT json_object_agg(technique_category, avg_effectiveness)
                    FROM (SELECT technique_category,
                                 AVG(effectiveness_rating) as avg_effectiveness
                          FROM public.technique_usage
                          WHERE user_id = p_user_id
                          AND last_used > CURRENT_DATE - (p_days || ' days')::INTERVAL
                          GROUP BY technique_category) t),
    'total_techniques', (SELECT COUNT(DISTINCT technique_name)
                         FROM public.technique_usage
                         WHERE user_id = p_user_id)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Function to calculate daily burnout trend
CREATE OR REPLACE FUNCTION public.calculate_daily_burnout_trend(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Calculate today's burnout metrics based on recent data
  INSERT INTO public.daily_burnout_metrics (
    user_id, metric_date, burnout_score, stress_level, energy_level, workload_score, recovery_score
  )
  SELECT
    p_user_id,
    CURRENT_DATE,
    -- Calculate burnout score from various factors
    LEAST(10, GREATEST(0,
      (COALESCE(AVG(r.stress_level), 5) * 0.3) +
      ((10 - COALESCE(AVG(r.energy_level), 5)) * 0.3) +
      (CASE WHEN COUNT(h.id) > 0 THEN 0 ELSE 2 END) + -- Penalty for no recovery habits
      (CASE WHEN COUNT(t.id) = 0 THEN 2 ELSE 0 END)   -- Penalty for no techniques used
    )),
    COALESCE(AVG(r.stress_level), 5),
    COALESCE(AVG(r.energy_level), 5),
    -- Workload approximation (would need assignment data)
    5.0,
    -- Recovery score based on habits and techniques
    CASE
      WHEN COUNT(h.id) > 3 AND COUNT(t.id) > 2 THEN 8
      WHEN COUNT(h.id) > 1 OR COUNT(t.id) > 1 THEN 6
      ELSE 3
    END
  FROM (SELECT 1) dummy
  LEFT JOIN (
    SELECT stress_level, energy_level
    FROM public.wellness_metrics
    WHERE user_hash = encode(digest((p_user_id::text || 'interpretreflect-zkwv-2025'), 'sha256'), 'hex')
    AND week_of > CURRENT_DATE - INTERVAL '7 days'
  ) r ON true
  LEFT JOIN public.recovery_habits h ON h.user_id = p_user_id
    AND h.last_practiced > CURRENT_DATE - INTERVAL '7 days'
  LEFT JOIN public.technique_usage t ON t.user_id = p_user_id
    AND t.last_used > CURRENT_DATE - INTERVAL '7 days'
  GROUP BY dummy
  ON CONFLICT (user_id, metric_date) DO UPDATE SET
    burnout_score = EXCLUDED.burnout_score,
    stress_level = EXCLUDED.stress_level,
    energy_level = EXCLUDED.energy_level,
    workload_score = EXCLUDED.workload_score,
    recovery_score = EXCLUDED.recovery_score;
END;
$$;

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS update_body_checkins_updated_at ON public.body_checkins;
CREATE TRIGGER update_body_checkins_updated_at
  BEFORE UPDATE ON public.body_checkins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_recovery_habits_updated_at ON public.recovery_habits;
CREATE TRIGGER update_recovery_habits_updated_at
  BEFORE UPDATE ON public.recovery_habits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- 7. INSERT TEST DATA (Optional)
-- =====================================================

-- Test body check-ins
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
    INSERT INTO public.body_checkins (user_id, tension_level, energy_level, mood_level, overall_feeling, notes)
    SELECT
      (SELECT id FROM auth.users LIMIT 1),
      3 + (random() * 5)::INTEGER,
      4 + (random() * 4)::INTEGER,
      3 + (random() * 5)::INTEGER,
      5 + (random() * 3)::INTEGER,
      'Test check-in ' || n
    FROM generate_series(1, 5) n
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Test recovery habits
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
    INSERT INTO public.recovery_habits (user_id, habit_type, description, frequency, effectiveness, last_practiced)
    VALUES
      ((SELECT id FROM auth.users LIMIT 1), 'mindfulness', 'Daily meditation', 'daily', 8, CURRENT_DATE),
      ((SELECT id FROM auth.users LIMIT 1), 'exercise', 'Morning walk', 'daily', 7, CURRENT_DATE - 1),
      ((SELECT id FROM auth.users LIMIT 1), 'breaks', 'Hourly stretch breaks', 'daily', 6, CURRENT_DATE)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Test technique usage
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
    INSERT INTO public.technique_usage (user_id, technique_name, technique_category, usage_count, effectiveness_rating)
    VALUES
      ((SELECT id FROM auth.users LIMIT 1), '4-7-8 Breathing', 'breathing', 15, 9),
      ((SELECT id FROM auth.users LIMIT 1), '5-4-3-2-1 Grounding', 'grounding', 8, 8),
      ((SELECT id FROM auth.users LIMIT 1), 'Progressive Muscle Relaxation', 'somatic', 5, 7)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- 8. VERIFICATION
-- =====================================================

-- Check tables exist
SELECT 'Growth Insights Tables Status:' as check_type;
SELECT table_name,
       CASE WHEN table_name IS NOT NULL THEN '✅ Created' ELSE '❌ Missing' END as status
FROM (VALUES
  ('body_checkins'),
  ('recovery_habits'),
  ('technique_usage'),
  ('daily_burnout_metrics')
) AS required(table_name)
LEFT JOIN information_schema.tables t
  ON t.table_name = required.table_name
  AND t.table_schema = 'public';

-- Count records in each table
SELECT 'Record Counts:' as check_type;
SELECT 'body_checkins' as table_name, COUNT(*) as record_count FROM public.body_checkins
UNION ALL
SELECT 'recovery_habits', COUNT(*) FROM public.recovery_habits
UNION ALL
SELECT 'technique_usage', COUNT(*) FROM public.technique_usage
UNION ALL
SELECT 'daily_burnout_metrics', COUNT(*) FROM public.daily_burnout_metrics;

-- Final message
SELECT '✅ Growth Insights database setup complete!' as message,
       'All tables created and ready for use' as details;