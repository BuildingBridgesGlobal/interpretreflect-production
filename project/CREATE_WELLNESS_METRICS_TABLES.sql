-- =====================================================
-- Create Wellness Metrics Tables for Burnout Risk Monitor
-- =====================================================
-- These tables store anonymized wellness data for burnout prediction

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

-- 5. Helper function to create user hash (if not exists)
CREATE OR REPLACE FUNCTION create_user_hash(user_id UUID, salt TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(sha256((user_id::TEXT || salt)::BYTEA), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. Create the burnout prediction function (simplified version)
CREATE OR REPLACE FUNCTION predict_burnout_risk_zkwv(p_user_hash TEXT)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Get latest wellness metrics
  WITH latest_metrics AS (
    SELECT
      AVG(stress_level) as avg_stress,
      AVG(energy_level) as avg_energy,
      AVG(burnout_score) as avg_burnout,
      MAX(high_stress_pattern::int) as has_high_stress,
      MAX(recovery_needed::int) as needs_recovery,
      COUNT(*) as data_points
    FROM wellness_metrics
    WHERE user_hash = p_user_hash
      AND week_of > CURRENT_DATE - INTERVAL '30 days'
  ),
  -- Calculate risk score
  risk_calculation AS (
    SELECT
      CASE
        WHEN data_points = 0 THEN 5.0 -- No data, moderate risk
        ELSE LEAST(10, GREATEST(0,
          ((10 - COALESCE(avg_energy, 5)) * 0.3) +
          (COALESCE(avg_stress, 5) * 0.3) +
          (COALESCE(avg_burnout, 0) * 0.2) +
          (COALESCE(has_high_stress, 0) * 2) +
          (COALESCE(needs_recovery, 0) * 2)
        ))
      END as risk_score,
      CASE
        WHEN data_points = 0 THEN 'insufficient_data'
        WHEN COALESCE(avg_stress, 0) >
             LAG(avg_stress, 1) OVER (ORDER BY week_of) THEN 'worsening'
        WHEN COALESCE(avg_energy, 10) <
             LAG(avg_energy, 1) OVER (ORDER BY week_of) THEN 'declining'
        ELSE 'stable'
      END as trend,
      data_points
    FROM latest_metrics
    LEFT JOIN (SELECT DISTINCT week_of FROM wellness_metrics WHERE user_hash = p_user_hash ORDER BY week_of DESC LIMIT 2) w ON true
  )
  -- Build result JSON
  SELECT json_build_object(
    'risk_score', ROUND(risk_score::numeric, 1),
    'risk_level', CASE
      WHEN risk_score >= 8 THEN 'critical'
      WHEN risk_score >= 6 THEN 'high'
      WHEN risk_score >= 4 THEN 'moderate'
      WHEN risk_score >= 2 THEN 'low'
      ELSE 'minimal'
    END,
    'trend', trend,
    'weeks_until_burnout', CASE
      WHEN risk_score >= 8 THEN 1
      WHEN risk_score >= 6 THEN 3
      WHEN risk_score >= 4 THEN 6
      ELSE NULL
    END,
    'intervention_urgency', CASE
      WHEN risk_score >= 8 THEN 'immediate'
      WHEN risk_score >= 6 THEN 'urgent'
      WHEN risk_score >= 4 THEN 'recommended'
      ELSE 'monitoring'
    END,
    'recommended_actions', CASE
      WHEN risk_score >= 6 THEN
        ARRAY['Take immediate wellness break', 'Schedule supervisor check-in', 'Access support resources']
      WHEN risk_score >= 4 THEN
        ARRAY['Review workload', 'Implement stress reduction', 'Connect with peers']
      ELSE
        ARRAY['Continue regular reflections', 'Maintain self-care routine']
    END,
    'factors', json_build_object(
      'energy_trend', COALESCE((SELECT avg_energy FROM latest_metrics), 5),
      'energy_stability', 5,
      'low_energy_frequency', COALESCE((SELECT COUNT(*) FROM wellness_metrics WHERE user_hash = p_user_hash AND energy_level < 4 AND week_of > CURRENT_DATE - INTERVAL '30 days'), 0),
      'stress_level', COALESCE((SELECT avg_stress FROM latest_metrics), 5),
      'high_stress_frequency', COALESCE((SELECT COUNT(*) FROM wellness_metrics WHERE user_hash = p_user_hash AND stress_level > 7 AND week_of > CURRENT_DATE - INTERVAL '30 days'), 0),
      'burnout_current', COALESCE((SELECT avg_burnout FROM latest_metrics), 0),
      'burnout_peak', COALESCE((SELECT MAX(burnout_score) FROM wellness_metrics WHERE user_hash = p_user_hash AND week_of > CURRENT_DATE - INTERVAL '30 days'), 0),
      'chronic_stress_detected', COALESCE((SELECT has_high_stress::boolean FROM latest_metrics), false),
      'recovery_needed', COALESCE((SELECT needs_recovery::boolean FROM latest_metrics), false),
      'confidence_level', COALESCE((SELECT AVG(confidence_score) FROM wellness_metrics WHERE user_hash = p_user_hash AND week_of > CURRENT_DATE - INTERVAL '30 days'), 5),
      'engagement_days', COALESCE((SELECT COUNT(DISTINCT DATE(created_at)) FROM anonymized_reflections WHERE user_hash = p_user_hash AND created_at > CURRENT_DATE - INTERVAL '14 days'), 0),
      'last_check_in', COALESCE((SELECT MAX(created_at)::text FROM anonymized_reflections WHERE user_hash = p_user_hash), NOW()::text),
      'trend_direction', trend
    ),
    'assessment_date', NOW()::text
  ) INTO v_result
  FROM risk_calculation
  LIMIT 1;

  RETURN COALESCE(v_result, json_build_object(
    'risk_score', 5,
    'risk_level', 'moderate',
    'trend', 'unknown',
    'intervention_urgency', 'monitoring',
    'recommended_actions', ARRAY['Start regular reflections'],
    'factors', json_build_object(
      'energy_trend', 5,
      'stress_level', 5,
      'engagement_days', 0,
      'last_check_in', 'Never'
    ),
    'assessment_date', NOW()::text
  ));
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions (adjust based on your user setup)
-- GRANT SELECT, INSERT, UPDATE ON wellness_metrics TO authenticated;
-- GRANT SELECT, INSERT ON anonymized_reflections TO authenticated;
-- GRANT SELECT, INSERT ON pattern_insights TO authenticated;
-- GRANT INSERT ON privacy_audit_logs TO authenticated;
-- GRANT EXECUTE ON FUNCTION predict_burnout_risk_zkwv TO authenticated;
-- GRANT EXECUTE ON FUNCTION create_user_hash TO authenticated;

-- Success message
SELECT 'Wellness metrics tables created successfully!' as message;