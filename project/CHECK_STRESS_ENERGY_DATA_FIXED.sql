-- SQL Query to Check for Stress & Energy Data in Reflections
-- Fixed version with explicit JSONB casting for Supabase

-- 1. Check if ANY reflections have stress or energy data
SELECT
    COUNT(*) as total_reflections,
    COUNT(CASE WHEN data::jsonb ? 'stressLevel' THEN 1 END) as has_stress_level,
    COUNT(CASE WHEN data::jsonb ? 'energyLevel' THEN 1 END) as has_energy_level,
    COUNT(CASE WHEN data::jsonb ? 'stressLevelBefore' THEN 1 END) as has_stress_before,
    COUNT(CASE WHEN data::jsonb ? 'stressLevelAfter' THEN 1 END) as has_stress_after
FROM reflection_entries;

-- 2. Show reflections that have stress/energy data
SELECT
    id,
    user_id,
    entry_kind,
    created_at,
    data::jsonb->>'stressLevel' as stress_level,
    data::jsonb->>'energyLevel' as energy_level,
    data::jsonb->>'stressLevelBefore' as stress_before,
    data::jsonb->>'stressLevelAfter' as stress_after
FROM reflection_entries
WHERE
    data::jsonb ? 'stressLevel' OR
    data::jsonb ? 'energyLevel' OR
    data::jsonb ? 'stressLevelBefore' OR
    data::jsonb ? 'stressLevelAfter'
ORDER BY created_at DESC;

-- 3. Check which reflection types might contain stress/energy data
SELECT
    entry_kind,
    COUNT(*) as count,
    COUNT(CASE WHEN data::jsonb ? 'stressLevel' THEN 1 END) as with_stress,
    COUNT(CASE WHEN data::jsonb ? 'energyLevel' THEN 1 END) as with_energy
FROM reflection_entries
WHERE entry_kind IS NOT NULL
GROUP BY entry_kind
ORDER BY count DESC;

-- 4. Simple check - just see what's in the data column for wellness check-ins
SELECT
    id,
    entry_kind,
    created_at,
    data::jsonb as full_data
FROM reflection_entries
WHERE entry_kind = 'wellness_checkin'
ORDER BY created_at DESC
LIMIT 5;

-- 5. Alternative way to check for fields using jsonb_exists
SELECT
    id,
    entry_kind,
    created_at,
    jsonb_exists(data::jsonb, 'stressLevel') as has_stress,
    jsonb_exists(data::jsonb, 'energyLevel') as has_energy
FROM reflection_entries
WHERE entry_kind IN ('wellness_checkin', 'post_assignment_debrief')
ORDER BY created_at DESC
LIMIT 10;