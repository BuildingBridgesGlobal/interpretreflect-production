-- =====================================================
-- Create Body Check-Ins Table and Related Functions
-- =====================================================

-- Create body_checkins table to store body scan data
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_body_checkins_user ON public.body_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_body_checkins_created ON public.body_checkins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_body_checkins_tension ON public.body_checkins(tension_level);
CREATE INDEX IF NOT EXISTS idx_body_checkins_energy ON public.body_checkins(energy_level);

-- Enable Row Level Security
ALTER TABLE public.body_checkins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own body check-ins
CREATE POLICY "Users can view own body checkins"
  ON public.body_checkins
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own body check-ins
CREATE POLICY "Users can insert own body checkins"
  ON public.body_checkins
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own body check-ins
CREATE POLICY "Users can update own body checkins"
  ON public.body_checkins
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own body check-ins
CREATE POLICY "Users can delete own body checkins"
  ON public.body_checkins
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_body_checkins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_body_checkins_updated_at ON public.body_checkins;
CREATE TRIGGER update_body_checkins_updated_at
  BEFORE UPDATE ON public.body_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_body_checkins_updated_at();

-- Function to get body check-in statistics
CREATE OR REPLACE FUNCTION public.get_body_checkin_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  WITH stats AS (
    SELECT
      COUNT(*) as total_checkins,
      AVG(tension_level) as avg_tension,
      AVG(energy_level) as avg_energy,
      AVG(mood_level) as avg_mood,
      AVG(overall_feeling) as avg_overall,
      MIN(tension_level) as min_tension,
      MAX(tension_level) as max_tension,
      MIN(energy_level) as min_energy,
      MAX(energy_level) as max_energy,
      MIN(created_at) as first_checkin,
      MAX(created_at) as last_checkin
    FROM public.body_checkins
    WHERE user_id = p_user_id
      AND created_at > CURRENT_DATE - (p_days || ' days')::INTERVAL
  ),
  tension_distribution AS (
    SELECT
      tension_level,
      COUNT(*) as count
    FROM public.body_checkins
    WHERE user_id = p_user_id
      AND created_at > CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY tension_level
  ),
  energy_distribution AS (
    SELECT
      energy_level,
      COUNT(*) as count
    FROM public.body_checkins
    WHERE user_id = p_user_id
      AND created_at > CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY energy_level
  )
  SELECT json_build_object(
    'total_checkins', COALESCE((SELECT total_checkins FROM stats), 0),
    'averages', json_build_object(
      'tension', ROUND(COALESCE((SELECT avg_tension FROM stats), 5)::NUMERIC, 1),
      'energy', ROUND(COALESCE((SELECT avg_energy FROM stats), 5)::NUMERIC, 1),
      'mood', ROUND(COALESCE((SELECT avg_mood FROM stats), 5)::NUMERIC, 1),
      'overall', ROUND(COALESCE((SELECT avg_overall FROM stats), 5)::NUMERIC, 1)
    ),
    'ranges', json_build_object(
      'tension', json_build_object(
        'min', COALESCE((SELECT min_tension FROM stats), 0),
        'max', COALESCE((SELECT max_tension FROM stats), 0)
      ),
      'energy', json_build_object(
        'min', COALESCE((SELECT min_energy FROM stats), 0),
        'max', COALESCE((SELECT max_energy FROM stats), 0)
      )
    ),
    'tension_distribution', COALESCE((
      SELECT json_agg(json_build_object('level', tension_level, 'count', count))
      FROM tension_distribution
    ), '[]'::JSON),
    'energy_distribution', COALESCE((
      SELECT json_agg(json_build_object('level', energy_level, 'count', count))
      FROM energy_distribution
    ), '[]'::JSON),
    'last_checkin', COALESCE((SELECT last_checkin FROM stats)::TEXT, 'Never'),
    'days_tracked', p_days
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Insert some test data (optional - comment out if not needed)
/*
INSERT INTO public.body_checkins (
  user_id, tension_level, energy_level, mood_level, overall_feeling, notes, body_areas
)
SELECT
  (SELECT id FROM auth.users LIMIT 1) as user_id,
  3 + (random() * 5)::INTEGER as tension_level,
  4 + (random() * 4)::INTEGER as energy_level,
  3 + (random() * 5)::INTEGER as mood_level,
  5 + (random() * 3)::INTEGER as overall_feeling,
  'Test body check-in entry' as notes,
  jsonb_build_object(
    'head', CASE WHEN random() > 0.5 THEN 'relaxed' ELSE 'tense' END,
    'shoulders', CASE WHEN random() > 0.5 THEN 'relaxed' ELSE 'tense' END,
    'chest', CASE WHEN random() > 0.5 THEN 'open' ELSE 'tight' END
  ) as body_areas
FROM generate_series(1, 10);
*/

-- Verify table creation
SELECT 'Body Check-Ins table created successfully!' as message,
       COUNT(*) as existing_records
FROM public.body_checkins;