-- Check ALL burnout assessment data for your user
-- This will show us what dates are actually in the database

SELECT
    id,
    user_id,
    assessment_date,
    total_score,
    risk_level,
    energy_tank,
    recovery_speed,
    emotional_leakage,
    performance_signal,
    tomorrow_readiness,
    created_at,
    updated_at
FROM burnout_assessments
WHERE user_id = '20701f05-2dc4-4740-a8a2-4a14c8974882'
ORDER BY assessment_date DESC
LIMIT 20;

-- Also check what the current date is in the database
SELECT
    NOW() as database_current_timestamp,
    CURRENT_DATE as database_current_date,
    (CURRENT_DATE - INTERVAL '7 days')::date as seven_days_ago;
