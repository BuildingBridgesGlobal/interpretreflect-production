-- SQL Query to Check for Stress & Energy Data in Reflections
-- Run this in your Supabase SQL Editor

-- 1. Check if ANY reflections have stress or energy data
SELECT
    COUNT(*) as total_reflections,
    COUNT(CASE WHEN data ? 'stressLevel' THEN 1 END) as has_stress_level,
    COUNT(CASE WHEN data ? 'energyLevel' THEN 1 END) as has_energy_level,
    COUNT(CASE WHEN data ? 'stressLevelBefore' THEN 1 END) as has_stress_before,
    COUNT(CASE WHEN data ? 'stressLevelAfter' THEN 1 END) as has_stress_after
FROM reflection_entries;

-- 2. Show reflections that have stress/energy data
SELECT
    id,
    user_id,
    entry_kind,
    created_at,
    data->>'stressLevel' as stress_level,
    data->>'energyLevel' as energy_level,
    data->>'stressLevelBefore' as stress_before,
    data->>'stressLevelAfter' as stress_after
FROM reflection_entries
WHERE
    data ? 'stressLevel' OR
    data ? 'energyLevel' OR
    data ? 'stressLevelBefore' OR
    data ? 'stressLevelAfter'
ORDER BY created_at DESC;

-- 3. Check which reflection types might contain stress/energy data
SELECT
    entry_kind,
    COUNT(*) as count,
    COUNT(CASE WHEN data ? 'stressLevel' THEN 1 END) as with_stress,
    COUNT(CASE WHEN data ? 'energyLevel' THEN 1 END) as with_energy
FROM reflection_entries
GROUP BY entry_kind
ORDER BY count DESC;

-- 4. Sample the data structure of different reflection types
SELECT
    entry_kind,
    jsonb_object_keys(data) as data_fields
FROM reflection_entries
WHERE entry_kind IN ('wellness_checkin', 'post_assignment_debrief', 'insession_selfcheck')
GROUP BY entry_kind, jsonb_object_keys(data)
ORDER BY entry_kind, data_fields;

-- 5. If you want to ADD stress/energy data to existing Wellness Check-ins for testing
-- UNCOMMENT AND RUN THIS ONLY IF YOU WANT TO ADD TEST DATA
/*
UPDATE reflection_entries
SET data = jsonb_set(
    jsonb_set(
        data,
        '{stressLevel}',
        to_jsonb(floor(random() * 10 + 1)::int)
    ),
    '{energyLevel}',
    to_jsonb(floor(random() * 10 + 1)::int)
)
WHERE entry_kind = 'wellness_checkin'
AND NOT (data ? 'stressLevel' AND data ? 'energyLevel');
*/

-- 6. Check if the data types are correct (should be numbers, not strings)
SELECT
    id,
    entry_kind,
    jsonb_typeof(data->'stressLevel') as stress_type,
    jsonb_typeof(data->'energyLevel') as energy_type,
    data->>'stressLevel' as stress_value,
    data->>'energyLevel' as energy_value
FROM reflection_entries
WHERE data ? 'stressLevel' OR data ? 'energyLevel'
LIMIT 10;