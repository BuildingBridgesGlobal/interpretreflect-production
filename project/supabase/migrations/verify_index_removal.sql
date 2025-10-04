-- Verification Query
-- Run this after applying migrations to confirm indexes were removed

SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
    'idx_body_checkins_user',
    'idx_daily_activity_user_id',
    'idx_reflection_user_id',
    'idx_stress_user_id',
    'ux_wellness_metrics_user_week'
);

-- Expected result: 0 rows (all indexes should be removed)