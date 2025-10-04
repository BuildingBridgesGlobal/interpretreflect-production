-- Test SQL to Add Sample Stress & Energy Data
-- Fixed version with explicit JSONB casting for Supabase

-- First, let's check the column type
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'reflection_entries' AND column_name = 'data';

-- Option 1: Add stress and energy to your most recent wellness check-in
UPDATE reflection_entries
SET data = jsonb_set(
    jsonb_set(
        data::jsonb,
        '{stressLevel}',
        '7'::jsonb
    ),
    '{energyLevel}',
    '4'::jsonb
)::json
WHERE entry_kind = 'wellness_checkin'
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
        'stressLevel', floor(random() * 9 + 1)::int,
        'energyLevel', floor(random() * 9 + 1)::int,
        'overall_feeling', 'Test check-in for graph',
        'timestamp', to_char(CURRENT_DATE - (n || ' days')::interval, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    )::json,
    CURRENT_DATE - (n || ' days')::interval
FROM generate_series(1, 7) n;
*/

-- Option 3: Simpler approach - just add the fields to any existing reflection
UPDATE reflection_entries
SET data = (
    SELECT jsonb_set(
        jsonb_set(
            data::jsonb,
            '{stressLevel}',
            to_jsonb(floor(random() * 9 + 1)::int)
        ),
        '{energyLevel}',
        to_jsonb(floor(random() * 9 + 1)::int)
    )::json
)
WHERE entry_kind IN ('wellness_checkin', 'post_assignment_debrief')
  AND NOT (data::jsonb ? 'stressLevel')
ORDER BY created_at DESC
LIMIT 5;

-- Check the results
SELECT
    id,
    entry_kind,
    created_at,
    data::jsonb->>'stressLevel' as stress,
    data::jsonb->>'energyLevel' as energy
FROM reflection_entries
WHERE
    data::jsonb ? 'stressLevel' OR
    data::jsonb ? 'energyLevel'
ORDER BY created_at DESC;