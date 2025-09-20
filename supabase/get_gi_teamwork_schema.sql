-- Query to get the exact schema information for gi_teamwork view
-- Run this in Supabase SQL Editor to get the column definitions

-- Option 1: Get column information from information_schema
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name = 'gi_teamwork'
ORDER BY
    ordinal_position;

-- Option 2: If the view doesn't exist yet, here's the suggested CREATE VIEW statement
-- based on the data structure we're using in the frontend:

/*
CREATE OR REPLACE VIEW public.gi_teamwork AS
SELECT
    re.user_id,
    re.created_at,
    re.entry_kind,

    -- Teamwork metrics from team sync reflections
    COALESCE(
        (re.data->>'agreements_fidelity')::integer,
        CASE
            WHEN re.data->>'team_alignment' IS NOT NULL THEN 85
            WHEN re.data->>'sync_status' = 'aligned' THEN 90
            WHEN re.data->>'sync_status' = 'partial' THEN 75
            ELSE 80
        END
    ) AS agreements_fidelity,

    -- Top drift area
    COALESCE(
        re.data->>'drift_area',
        re.data->>'top_drift_area',
        CASE
            WHEN re.data->>'communication_gaps' IS NOT NULL THEN 'Communication gaps'
            WHEN re.data->>'role_clarity' = 'unclear' THEN 'Role clarity'
            WHEN re.data->>'turn_taking' IS NOT NULL THEN 'Turn-taking balance'
            ELSE 'Turn-taking balance'
        END
    ) AS top_drift_area,

    -- Team effectiveness score
    COALESCE(
        (re.data->>'team_effectiveness')::integer,
        (re.data->>'collaboration_success')::integer,
        CASE
            WHEN re.data->>'team_sync' = 'excellent' THEN 95
            WHEN re.data->>'team_sync' = 'good' THEN 85
            WHEN re.data->>'team_sync' = 'fair' THEN 70
            ELSE 75
        END
    ) AS team_effectiveness,

    -- Additional teamwork insights
    re.data->>'team_challenges' AS team_challenges,
    re.data->>'collaboration_wins' AS collaboration_wins,
    re.data->>'improvement_areas' AS improvement_areas,

    -- Metadata
    re.data AS full_data,
    ROW_NUMBER() OVER (PARTITION BY re.user_id ORDER BY re.created_at DESC) AS rn

FROM
    public.reflection_entries re
WHERE
    re.entry_kind IN ('team_sync', 'insession_team_sync', 'teaming_reflection', 'teaming_prep')
    AND re.deleted_at IS NULL;

-- Grant appropriate permissions
GRANT SELECT ON public.gi_teamwork TO authenticated;
GRANT SELECT ON public.gi_teamwork TO service_role;

-- Add RLS policy if needed
ALTER VIEW public.gi_teamwork SET (security_invoker = true);
*/

-- Option 3: Get the most recent teamwork-related reflection data structure
-- to understand what fields are available
SELECT
    entry_kind,
    jsonb_object_keys(data) as data_keys,
    COUNT(*) as occurrences
FROM
    reflection_entries
WHERE
    entry_kind IN ('team_sync', 'insession_team_sync', 'teaming_reflection', 'teaming_prep')
GROUP BY
    entry_kind, jsonb_object_keys(data)
ORDER BY
    entry_kind, occurrences DESC;