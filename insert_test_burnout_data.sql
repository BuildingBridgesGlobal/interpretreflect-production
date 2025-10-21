-- Insert test burnout assessment data for yesterday to test the graph
-- This will give you a second data point to see on the graph

INSERT INTO burnout_assessments (
    user_id,
    assessment_date,
    energy_tank,
    recovery_speed,
    emotional_leakage,
    performance_signal,
    tomorrow_readiness,
    total_score,
    risk_level
) VALUES (
    '20701f05-2dc4-4740-a8a2-4a14c8974882',  -- Your user ID
    '2025-10-19',  -- Yesterday
    3,  -- Energy tank: 3/5 (moderate)
    3,  -- Recovery speed: 3/5 (moderate)
    3,  -- Emotional leakage: 3/5 (moderate)
    3,  -- Performance signal: 3/5 (moderate)
    3,  -- Tomorrow readiness: 3/5 (moderate)
    6.0,  -- Total score: 15/25 = 6.0/10 (moderate burnout)
    'moderate'  -- Risk level
);

-- Verify the data was inserted
SELECT
    assessment_date,
    total_score,
    risk_level,
    created_at
FROM burnout_assessments
WHERE user_id = '20701f05-2dc4-4740-a8a2-4a14c8974882'
ORDER BY assessment_date DESC;
