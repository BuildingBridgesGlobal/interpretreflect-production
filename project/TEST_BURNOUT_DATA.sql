-- Check what burnout data exists
SELECT 
  'burnout_assessments' as source,
  user_id,
  assessment_date::date,
  burnout_score,
  total_score,
  risk_level,
  created_at
FROM burnout_assessments
WHERE user_id IS NOT NULL
ORDER BY assessment_date DESC
LIMIT 10;

-- Check if there's any daily burnout metrics
SELECT 
  'daily_burnout_metrics' as source,
  user_id,
  metric_date,
  burnout_score,
  created_at
FROM daily_burnout_metrics
WHERE user_id IS NOT NULL
ORDER BY metric_date DESC
LIMIT 10;
