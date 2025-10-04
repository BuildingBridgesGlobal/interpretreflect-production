-- Test Data for Burnout Risk Monitor (Supabase Compatible)
-- This will add sample wellness metrics to test the burnout prediction

-- Enable crypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Seed 4 weeks of wellness_metrics for one sample user
WITH user_data AS (
  SELECT DISTINCT user_id FROM reflection_entries LIMIT 1
)
INSERT INTO wellness_metrics (
  user_hash, stress_level, energy_level, burnout_score, confidence_score,
  high_stress_pattern, recovery_needed, week_of
)
SELECT
  encode(sha256((user_id::TEXT || 'interpretreflect-zkwv-2025')::BYTEA), 'hex') as user_hash,
  CASE week_num
    WHEN 0 THEN 5.5  -- Current week: moderate stress
    WHEN 1 THEN 6.8  -- Last week: higher stress
    WHEN 2 THEN 7.5  -- 2 weeks ago: high stress
    WHEN 3 THEN 8.2  -- 3 weeks ago: very high stress
  END as stress_level,
  CASE week_num
    WHEN 0 THEN 3.8  -- Current week: low energy
    WHEN 1 THEN 4.2  -- Last week: declining energy
    WHEN 2 THEN 5.0  -- 2 weeks ago: moderate energy
    WHEN 3 THEN 6.5  -- 3 weeks ago: better energy
  END as energy_level,
  CASE week_num
    WHEN 0 THEN 7.2  -- Current week: high burnout
    WHEN 1 THEN 6.5  -- Last week: increasing burnout
    WHEN 2 THEN 5.8  -- 2 weeks ago: moderate burnout
    WHEN 3 THEN 4.5  -- 3 weeks ago: lower burnout
  END as burnout_score,
  CASE week_num
    WHEN 0 THEN 4.0  -- Current week: low confidence
    WHEN 1 THEN 4.5
    WHEN 2 THEN 5.5
    WHEN 3 THEN 6.0
  END as confidence_score,
  CASE week_num
    WHEN 0 THEN true  -- Current week: high stress pattern detected
    WHEN 1 THEN true  -- Last week: high stress pattern
    ELSE false
  END as high_stress_pattern,
  CASE week_num
    WHEN 0 THEN true  -- Current week: recovery needed
    ELSE false
  END as recovery_needed,
  -- Calculate Monday of each week
  DATE_TRUNC('week', CURRENT_DATE - (week_num * INTERVAL '7 days'))::DATE as week_of
FROM user_data, generate_series(0, 3) as week_num
ON CONFLICT (user_hash, week_of) DO UPDATE SET
  stress_level = EXCLUDED.stress_level,
  energy_level = EXCLUDED.energy_level,
  burnout_score = EXCLUDED.burnout_score,
  confidence_score = EXCLUDED.confidence_score,
  high_stress_pattern = EXCLUDED.high_stress_pattern,
  recovery_needed = EXCLUDED.recovery_needed;

-- 2) Seed anonymized_reflections for ~11 days for one sample user
WITH user_data AS (
  SELECT DISTINCT user_id FROM reflection_entries LIMIT 1
)
INSERT INTO anonymized_reflections (
  user_hash, session_hash, reflection_category, metrics, context_type
)
SELECT
  encode(sha256((user_id::TEXT || 'interpretreflect-zkwv-2025')::BYTEA), 'hex') as user_hash,
  encode(sha256((CURRENT_TIMESTAMP - (day_num * INTERVAL '1 day'))::TEXT::BYTEA), 'hex') as session_hash,
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

-- 3) Verify the data was inserted
SELECT 'Wellness Metrics Added:' as status, COUNT(*) as count
FROM wellness_metrics
WHERE week_of > CURRENT_DATE - INTERVAL '30 days';

SELECT 'Anonymized Reflections Added:' as status, COUNT(*) as count
FROM anonymized_reflections
WHERE created_at > CURRENT_DATE - INTERVAL '30 days';

-- 4) Test the burnout prediction function with the first user
WITH user_data AS (
  SELECT DISTINCT user_id FROM reflection_entries LIMIT 1
)
SELECT predict_burnout_risk_zkwv(
  encode(sha256((user_id::TEXT || 'interpretreflect-zkwv-2025')::BYTEA), 'hex')
) as burnout_risk_assessment
FROM user_data;