-- Test SQL to Add Sample Stress & Energy Data
-- This will add test data to make the graph work

-- Option 1: Add stress and energy to your most recent wellness check-in
UPDATE reflection_entries
SET data = jsonb_set(
    jsonb_set(
        data,
        '{stressLevel}',
        '7'::jsonb
    ),
    '{energyLevel}',
    '4'::jsonb
)
WHERE entry_kind = 'wellness_checkin'
  AND user_id = (SELECT user_id FROM reflection_entries LIMIT 1)
ORDER BY created_at DESC
LIMIT 1;

-- Option 2: Add multiple test wellness check-ins with varying stress/energy levels
-- (Uncomment to use this option)
/*
INSERT INTO reflection_entries (user_id, entry_kind, data, created_at)
SELECT
    (SELECT user_id FROM reflection_entries LIMIT 1),
    'wellness_checkin',
    jsonb_build_object(
        'stressLevel', (random() * 9 + 1)::int,
        'energyLevel', (random() * 9 + 1)::int,
        'overall_feeling', 'Test check-in for graph',
        'timestamp', to_char(CURRENT_DATE - (n || ' days')::interval, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    ),
    CURRENT_DATE - (n || ' days')::interval
FROM generate_series(1, 7) n;
*/

-- Option 3: Add stress/energy to your Post-Assignment Debrief
UPDATE reflection_entries
SET data = jsonb_set(
    jsonb_set(
        jsonb_set(
            data,
            '{stressLevelBefore}',
            '8'::jsonb
        ),
        '{stressLevelAfter}',
        '3'::jsonb
    ),
    '{energyLevel}',
    '6'::jsonb
)
WHERE entry_kind = 'post_assignment_debrief'
ORDER BY created_at DESC
LIMIT 1;

-- Check the results
SELECT
    id,
    entry_kind,
    created_at,
    data->>'stressLevel' as stress,
    data->>'energyLevel' as energy,
    data->>'stressLevelBefore' as stress_before,
    data->>'stressLevelAfter' as stress_after
FROM reflection_entries
WHERE
    data ? 'stressLevel' OR
    data ? 'energyLevel' OR
    data ? 'stressLevelBefore' OR
    data ? 'stressLevelAfter'
ORDER BY created_at DESC;