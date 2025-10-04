-- =====================================================
-- COMPLETE SUPABASE SQL FOR BURNOUT RISK MONITOR (FINAL)
-- Uses digest() function from pgcrypto extension
-- =====================================================

-- Enable required extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PART 1: CREATE TABLES
-- =====================================================

-- 1. Create wellness_metrics table if it doesn't exist
CREATE TABLE IF NOT EXISTS wellness_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_hash TEXT NOT NULL,
  burnout_score DECIMAL(3,2) CHECK (burnout_score >= 0 AND burnout_score <= 10),
  stress_level DECIMAL(3,2) CHECK (stress_level >= 0 AND stress_level <= 10),
  energy_level DECIMAL(3,2) CHECK (energy_level >= 0 AND energy_level <= 10),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 10),
  high_stress_pattern BOOLEAN DEFAULT FALSE,
  recovery_needed BOOLEAN DEFAULT FALSE,
  growth_trajectory BOOLEAN DEFAULT FALSE,
  week_of DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_hash, week_of)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wellness_user ON wellness_metrics(user_hash);
CREATE INDEX IF NOT EXISTS idx_wellness_week ON wellness_metrics(week_of DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_created ON wellness_metrics(created_at DESC);

-- 2. Create anonymized_reflections table if it doesn't exist
CREATE TABLE IF NOT EXISTS anonymized_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_hash TEXT NOT NULL,
  session_hash TEXT NOT NULL,
  reflection_category TEXT NOT NULL CHECK (reflection_category IN (
    'wellness_check',
    'session_reflection',
    'team_sync',
    'values_alignment',
    'stress_management',
    'growth_assessment'
  )),
  metrics JSONB NOT NULL DEFAULT '{}',
  context_type TEXT CHECK (context_type IN (
    'medical',
    'legal',
    'educational',
    'mental_health',
    'community',
    'general'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_anon_user_hash ON anonymized_reflections(user_hash);
CREATE INDEX IF NOT EXISTS idx_anon_created ON anonymized_reflections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anon_category ON anonymized_reflections(reflection_category);

-- 3. Create pattern_insights table for tracking patterns
CREATE TABLE IF NOT EXISTS pattern_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_hash TEXT NOT NULL,
  pattern_code TEXT NOT NULL CHECK (pattern_code IN (
    'STRESS_RISING',
    'STRESS_STABLE',
    'STRESS_DECLINING',
    'BURNOUT_RISK',
    'RECOVERY_PROGRESS',
    'CONSISTENT_PRACTICE',
    'IRREGULAR_PRACTICE',
    'HIGH_PERFORMANCE',
    'NEEDS_SUPPORT'
  )),
  confidence_level DECIMAL(3,2) CHECK (confidence_level >= 0 AND confidence_level <= 1),
  month_of DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pattern_user ON pattern_insights(user_hash);
CREATE INDEX IF NOT EXISTS idx_pattern_month ON pattern_insights(month_of DESC);
CREATE INDEX IF NOT EXISTS idx_pattern_code ON pattern_insights(pattern_code);

-- 4. Create privacy_audit_logs for compliance tracking
CREATE TABLE IF NOT EXISTS privacy_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL CHECK (action_type IN (
    'data_accessed',
    'report_generated',
    'proof_created',
    'metrics_aggregated',
    'pattern_detected'
  )),
  compliance_check JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_action ON privacy_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_time ON privacy_audit_logs(occurred_at DESC);

-- =====================================================
-- PART 2: CREATE FUNCTIONS
-- =====================================================

-- Helper function to create user hash (using digest from pgcrypto)
CREATE OR REPLACE FUNCTION create_user_hash(user_id UUID, salt TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest((user_id::TEXT || salt), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create the burnout prediction function
CREATE OR REPLACE FUNCTION predict_burnout_risk_zkwv(p_user_hash TEXT)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_avg_stress NUMERIC;
  v_avg_energy NUMERIC;
  v_avg_burnout NUMERIC;
  v_has_high_stress BOOLEAN;
  v_needs_recovery BOOLEAN;
  v_data_points INTEGER;
  v_risk_score NUMERIC;
  v_trend TEXT;
BEGIN
  -- Get latest wellness metrics
  SELECT
    AVG(stress_level),
    AVG(energy_level),
    AVG(burnout_score),
    BOOL_OR(high_stress_pattern),
    BOOL_OR(recovery_needed),
    COUNT(*)
  INTO
    v_avg_stress,
    v_avg_energy,
    v_avg_burnout,
    v_has_high_stress,
    v_needs_recovery,
    v_data_points
  FROM wellness_metrics
  WHERE user_hash = p_user_hash
    AND week_of > CURRENT_DATE - INTERVAL '30 days';

  -- Calculate risk score
  IF v_data_points = 0 OR v_data_points IS NULL THEN
    v_risk_score := 5.0; -- No data, moderate risk
    v_trend := 'insufficient_data';
  ELSE
    v_risk_score := LEAST(10, GREATEST(0,
      ((10 - COALESCE(v_avg_energy, 5)) * 0.3) +
      (COALESCE(v_avg_stress, 5) * 0.3) +
      (COALESCE(v_avg_burnout, 0) * 0.2) +
      (CASE WHEN v_has_high_stress THEN 2 ELSE 0 END) +
      (CASE WHEN v_needs_recovery THEN 2 ELSE 0 END)
    ));

    -- Simple trend calculation
    IF v_avg_stress > 7 THEN
      v_trend := 'worsening';
    ELSIF v_avg_energy < 4 THEN
      v_trend := 'declining';
    ELSE
      v_trend := 'stable';
    END IF;
  END IF;

  -- Build result JSON
  v_result := json_build_object(
    'risk_score', ROUND(v_risk_score::numeric, 1),
    'risk_level', CASE
      WHEN v_risk_score >= 8 THEN 'critical'
      WHEN v_risk_score >= 6 THEN 'high'
      WHEN v_risk_score >= 4 THEN 'moderate'
      WHEN v_risk_score >= 2 THEN 'low'
      ELSE 'minimal'
    END,
    'trend', v_trend,
    'weeks_until_burnout', CASE
      WHEN v_risk_score >= 8 THEN 1
      WHEN v_risk_score >= 6 THEN 3
      WHEN v_risk_score >= 4 THEN 6
      ELSE NULL
    END,
    'intervention_urgency', CASE
      WHEN v_risk_score >= 8 THEN 'immediate'
      WHEN v_risk_score >= 6 THEN 'urgent'
      WHEN v_risk_score >= 4 THEN 'recommended'
      ELSE 'monitoring'
    END,
    'recommended_actions', CASE
      WHEN v_risk_score >= 6 THEN
        ARRAY['Take immediate wellness break', 'Schedule supervisor check-in', 'Access support resources']
      WHEN v_risk_score >= 4 THEN
        ARRAY['Review workload', 'Implement stress reduction', 'Connect with peers']
      ELSE
        ARRAY['Continue regular reflections', 'Maintain self-care routine']
    END,
    'factors', json_build_object(
      'energy_trend', COALESCE(v_avg_energy, 5),
      'energy_stability', 5,
      'low_energy_frequency', (SELECT COUNT(*) FROM wellness_metrics WHERE user_hash = p_user_hash AND energy_level < 4 AND week_of > CURRENT_DATE - INTERVAL '30 days'),
      'stress_level', COALESCE(v_avg_stress, 5),
      'high_stress_frequency', (SELECT COUNT(*) FROM wellness_metrics WHERE user_hash = p_user_hash AND stress_level > 7 AND week_of > CURRENT_DATE - INTERVAL '30 days'),
      'burnout_current', COALESCE(v_avg_burnout, 0),
      'burnout_peak', (SELECT COALESCE(MAX(burnout_score), 0) FROM wellness_metrics WHERE user_hash = p_user_hash AND week_of > CURRENT_DATE - INTERVAL '30 days'),
      'chronic_stress_detected', COALESCE(v_has_high_stress, false),
      'recovery_needed', COALESCE(v_needs_recovery, false),
      'confidence_level', (SELECT COALESCE(AVG(confidence_score), 5) FROM wellness_metrics WHERE user_hash = p_user_hash AND week_of > CURRENT_DATE - INTERVAL '30 days'),
      'engagement_days', (SELECT COUNT(DISTINCT DATE(created_at)) FROM anonymized_reflections WHERE user_hash = p_user_hash AND created_at > CURRENT_DATE - INTERVAL '14 days'),
      'last_check_in', (SELECT COALESCE(MAX(created_at)::TEXT, 'Never') FROM anonymized_reflections WHERE user_hash = p_user_hash),
      'trend_direction', v_trend
    ),
    'assessment_date', NOW()::TEXT
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 3: ADD TEST DATA (Using digest function)
-- =====================================================

-- Add 4 weeks of wellness metrics for testing
WITH user_data AS (
  SELECT DISTINCT user_id FROM reflection_entries LIMIT 1
)
INSERT INTO wellness_metrics (
  user_hash, stress_level, energy_level, burnout_score, confidence_score,
  high_stress_pattern, recovery_needed, week_of
)
SELECT
  encode(digest((user_id::TEXT || 'interpretreflect-zkwv-2025'), 'sha256'), 'hex') as user_hash,
  CASE week_num
    WHEN 0 THEN 5.5
    WHEN 1 THEN 6.8
    WHEN 2 THEN 7.5
    WHEN 3 THEN 8.2
  END as stress_level,
  CASE week_num
    WHEN 0 THEN 3.8
    WHEN 1 THEN 4.2
    WHEN 2 THEN 5.0
    WHEN 3 THEN 6.5
  END as energy_level,
  CASE week_num
    WHEN 0 THEN 7.2
    WHEN 1 THEN 6.5
    WHEN 2 THEN 5.8
    WHEN 3 THEN 4.5
  END as burnout_score,
  CASE week_num
    WHEN 0 THEN 4.0
    WHEN 1 THEN 4.5
    WHEN 2 THEN 5.5
    WHEN 3 THEN 6.0
  END as confidence_score,
  CASE week_num
    WHEN 0 THEN true
    WHEN 1 THEN true
    ELSE false
  END as high_stress_pattern,
  CASE week_num
    WHEN 0 THEN true
    ELSE false
  END as recovery_needed,
  DATE_TRUNC('week', CURRENT_DATE - (week_num * INTERVAL '7 days'))::DATE as week_of
FROM user_data, generate_series(0, 3) as week_num
ON CONFLICT (user_hash, week_of) DO UPDATE SET
  stress_level = EXCLUDED.stress_level,
  energy_level = EXCLUDED.energy_level,
  burnout_score = EXCLUDED.burnout_score,
  confidence_score = EXCLUDED.confidence_score,
  high_stress_pattern = EXCLUDED.high_stress_pattern,
  recovery_needed = EXCLUDED.recovery_needed;

-- Add anonymized reflections for engagement tracking
WITH user_data AS (
  SELECT DISTINCT user_id FROM reflection_entries LIMIT 1
)
INSERT INTO anonymized_reflections (
  user_hash, session_hash, reflection_category, metrics, context_type
)
SELECT
  encode(digest((user_id::TEXT || 'interpretreflect-zkwv-2025'), 'sha256'), 'hex') as user_hash,
  encode(digest((CURRENT_TIMESTAMP - (day_num * INTERVAL '1 day'))::TEXT, 'sha256'), 'hex') as session_hash,
  CASE (day_num % 3)
    WHEN 0 THEN 'wellness_check'
    WHEN 1 THEN 'session_reflection'
    ELSE 'stress_management'
  END as reflection_category,
  jsonb_build_object(
    'stress_level', 5 + (day_num % 4),
    'energy_level', 7 - (day_num % 3),
    'reflection_depth', CASE WHEN (day_num % 2) = 0 THEN 'deep' ELSE 'surface' END
  ) as metrics,
  'general' as context_type
FROM user_data, generate_series(0, 10) as day_num;

-- =====================================================
-- PART 4: VERIFY INSTALLATION
-- =====================================================

-- Check that tables were created
SELECT 'Tables Created:' as status;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('wellness_metrics', 'anonymized_reflections', 'pattern_insights', 'privacy_audit_logs');

-- Check data was inserted
SELECT 'Wellness Metrics Count:' as status, COUNT(*) as count FROM wellness_metrics;
SELECT 'Anonymized Reflections Count:' as status, COUNT(*) as count FROM anonymized_reflections;

-- Test the burnout prediction
WITH user_data AS (
  SELECT DISTINCT user_id FROM reflection_entries LIMIT 1
)
SELECT
  'Burnout Risk Assessment:' as status,
  predict_burnout_risk_zkwv(
    encode(digest((user_id::TEXT || 'interpretreflect-zkwv-2025'), 'sha256'), 'hex')
  ) as assessment
FROM user_data;

-- Success message
SELECT '✅ Burnout Risk Monitor setup complete!' as message;