SELECT 
    assessment_date,
    total_score,
    created_at,
    updated_at,
    energy_tank,
    recovery_speed
FROM burnout_assessments 
WHERE user_id = '20701f05-2dc4-4740-a8a2-4a14c8974882'
ORDER BY assessment_date DESC;
