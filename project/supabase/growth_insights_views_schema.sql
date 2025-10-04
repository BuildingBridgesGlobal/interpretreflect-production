-- Growth Insights Database Views Schema
-- These views power the Growth Insights dashboard in the application

-- ============================================
-- 1. TEAMWORK VIEW (gi_teamwork)
-- ============================================
-- Tracks team collaboration metrics and drift areas

CREATE OR REPLACE VIEW public.gi_teamwork AS
SELECT
    re.user_id,
    re.created_at,
    re.entry_kind,

    -- Agreements Fidelity Score (0-100)
    COALESCE(
        (re.data->>'agreements_fidelity')::integer,
        CASE
            WHEN re.data->>'team_alignment' = 'excellent' THEN 95
            WHEN re.data->>'team_alignment' = 'good' THEN 85
            WHEN re.data->>'team_alignment' = 'fair' THEN 70
            WHEN re.data->>'sync_status' = 'aligned' THEN 90
            WHEN re.data->>'sync_status' = 'partial' THEN 75
            ELSE 80
        END
    ) AS agreements_fidelity,

    -- Top Drift Area (text)
    COALESCE(
        re.data->>'drift_area',
        re.data->>'top_drift_area',
        CASE
            WHEN re.data->>'communication_gaps' IS NOT NULL THEN 'Communication gaps'
            WHEN re.data->>'role_clarity' = 'unclear' THEN 'Role clarity'
            WHEN re.data->>'turn_taking_issues' = 'true' THEN 'Turn-taking balance'
            ELSE 'Turn-taking balance'
        END
    ) AS top_drift_area,

    -- Team Effectiveness Score (0-100)
    COALESCE(
        (re.data->>'team_effectiveness')::integer,
        (re.data->>'collaboration_success')::integer,
        80
    ) AS team_effectiveness,

    -- Row number for getting latest entry
    ROW_NUMBER() OVER (PARTITION BY re.user_id ORDER BY re.created_at DESC) AS rn

FROM public.reflection_entries re
WHERE
    re.entry_kind IN ('team_sync', 'insession_team_sync', 'teaming_reflection', 'teaming_prep')
    AND re.deleted_at IS NULL;

-- ============================================
-- 2. VALUES VIEW (gi_values)
-- ============================================
-- Tracks values alignment and ethical considerations

CREATE OR REPLACE VIEW public.gi_values AS
SELECT
    re.user_id,
    re.created_at,
    re.entry_kind,

    -- Top Active Value (text)
    COALESCE(
        re.data->>'primary_value',
        re.data->>'top_value',
        re.data->>'active_value',
        CASE
            WHEN re.data->>'advocacy_focus' = 'high' THEN 'Advocacy for client'
            WHEN re.data->>'integrity_focus' = 'high' THEN 'Professional integrity'
            WHEN re.data->>'empathy_focus' = 'high' THEN 'Empathetic understanding'
            ELSE 'Advocacy for client'
        END
    ) AS top_active_value,

    -- Gray Zone Focus (text)
    COALESCE(
        re.data->>'gray_zone',
        re.data->>'gray_zone_focus',
        re.data->>'ethical_challenge',
        CASE
            WHEN re.data->>'boundary_concerns' IS NOT NULL THEN 'Professional boundaries'
            WHEN re.data->>'family_dynamics' = 'complex' THEN 'Role boundaries with family'
            WHEN re.data->>'confidentiality_issues' = 'true' THEN 'Confidentiality concerns'
            ELSE 'Role boundaries with family'
        END
    ) AS gray_zone_focus,

    -- Values Alignment Score (0-100)
    COALESCE(
        (re.data->>'values_alignment_score')::integer,
        CASE
            WHEN re.data->>'values_conflict' = 'none' THEN 95
            WHEN re.data->>'values_conflict' = 'minor' THEN 80
            WHEN re.data->>'values_conflict' = 'moderate' THEN 65
            ELSE 75
        END
    ) AS values_alignment_score,

    -- Row number for getting latest entry
    ROW_NUMBER() OVER (PARTITION BY re.user_id ORDER BY re.created_at DESC) AS rn

FROM public.reflection_entries re
WHERE
    re.entry_kind IN ('values_alignment', 'values_alignment_checkin', 'ethics_culture')
    AND re.deleted_at IS NULL;

-- ============================================
-- 3. STRESS & ENERGY VIEW (gi_stress_energy)
-- ============================================
-- Tracks stress and energy levels from wellness check-ins

CREATE OR REPLACE VIEW public.gi_stress_energy AS
SELECT
    re.user_id,
    re.created_at,

    -- Stress Level (1-10)
    COALESCE(
        (re.data->>'stress_level')::integer,
        (re.data->>'stressLevel')::integer,
        (re.data->>'current_stress')::integer,
        5
    ) AS stress_level,

    -- Energy Level (1-10)
    COALESCE(
        (re.data->>'energy_level')::integer,
        (re.data->>'energyLevel')::integer,
        (re.data->>'physical_energy')::integer,
        (re.data->>'current_energy')::integer,
        5
    ) AS energy_level,

    -- Overall Wellbeing (1-10)
    COALESCE(
        (re.data->>'overall_wellbeing')::integer,
        (re.data->>'wellness_score')::integer,
        5
    ) AS overall_wellbeing,

    -- Date for charting
    DATE(re.created_at) AS date

FROM public.reflection_entries re
WHERE
    re.entry_kind IN ('wellness_checkin', 'wellness_check_in', 'wellness-checkin')
    AND re.deleted_at IS NULL
ORDER BY re.created_at DESC;

-- ============================================
-- 4. REFLECTIONS SUMMARY VIEW (gi_reflections_summary)
-- ============================================
-- Provides summary statistics of all reflections

CREATE OR REPLACE VIEW public.gi_reflections_summary AS
SELECT
    user_id,
    COUNT(*) AS total_reflections,
    COUNT(DISTINCT entry_kind) AS unique_types,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) AS past_month,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) AS past_week,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '14 days'
               AND created_at < CURRENT_DATE - INTERVAL '7 days' THEN 1 END) AS previous_week,
    MAX(created_at) AS last_reflection_date,

    -- Reflections by type
    COUNT(CASE WHEN entry_kind = 'pre_assignment_prep' THEN 1 END) AS pre_assignment_count,
    COUNT(CASE WHEN entry_kind = 'post_assignment_debrief' THEN 1 END) AS post_assignment_count,
    COUNT(CASE WHEN entry_kind = 'wellness_checkin' THEN 1 END) AS wellness_count,
    COUNT(CASE WHEN entry_kind = 'values_alignment' THEN 1 END) AS values_count,
    COUNT(CASE WHEN entry_kind IN ('team_sync', 'teaming_reflection') THEN 1 END) AS team_count,
    COUNT(CASE WHEN entry_kind IN ('mentoring_prep', 'mentoring_reflection') THEN 1 END) AS mentoring_count

FROM public.reflection_entries
WHERE deleted_at IS NULL
GROUP BY user_id;

-- ============================================
-- 5. RECOVERY HABITS VIEW (gi_recovery_habits)
-- ============================================
-- Tracks recovery and self-care habits

CREATE OR REPLACE VIEW public.gi_recovery_habits AS
SELECT
    re.user_id,
    re.created_at,

    -- Recovery Score calculation
    CASE
        WHEN (re.data->>'stress_level')::integer <= 3
         AND (re.data->>'energy_level')::integer >= 7 THEN 'excellent'
        WHEN (re.data->>'stress_level')::integer <= 5
         AND (re.data->>'energy_level')::integer >= 5 THEN 'good'
        WHEN (re.data->>'stress_level')::integer <= 7 THEN 'fair'
        ELSE 'needs attention'
    END AS recovery_status,

    -- Weekly Recovery Score (0-100)
    CASE
        WHEN AVG((re.data->>'overall_wellbeing')::integer) OVER (
            PARTITION BY re.user_id
            ORDER BY re.created_at
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) IS NOT NULL THEN
        ROUND(AVG((re.data->>'overall_wellbeing')::integer) OVER (
            PARTITION BY re.user_id
            ORDER BY re.created_at
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) * 10)
        ELSE 50
    END AS weekly_recovery_score,

    -- Recent habits
    re.data->>'self_care_commitment' AS self_care_commitment,
    re.data->>'recent_self_care' AS recent_self_care,

    ROW_NUMBER() OVER (PARTITION BY re.user_id ORDER BY re.created_at DESC) AS rn

FROM public.reflection_entries re
WHERE
    re.entry_kind IN ('wellness_checkin', 'wellness_check_in')
    AND re.deleted_at IS NULL;

-- ============================================
-- 6. RESET TOOLKIT VIEW (gi_reset_toolkit)
-- ============================================
-- Tracks stress reset technique usage

CREATE OR REPLACE VIEW public.gi_reset_toolkit AS
SELECT
    user_id,
    technique,
    COUNT(*) AS usage_count,
    AVG(CASE WHEN completed THEN 1 ELSE 0 END) * 100 AS completion_rate,
    AVG(stress_relief) AS avg_stress_relief,
    MAX(created_at) AS last_used,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) AS weekly_usage

FROM public.technique_usage
WHERE deleted_at IS NULL
GROUP BY user_id, technique;

-- ============================================
-- PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT SELECT ON public.gi_teamwork TO authenticated;
GRANT SELECT ON public.gi_values TO authenticated;
GRANT SELECT ON public.gi_stress_energy TO authenticated;
GRANT SELECT ON public.gi_reflections_summary TO authenticated;
GRANT SELECT ON public.gi_recovery_habits TO authenticated;
GRANT SELECT ON public.gi_reset_toolkit TO authenticated;

-- Grant permissions to service role
GRANT SELECT ON public.gi_teamwork TO service_role;
GRANT SELECT ON public.gi_values TO service_role;
GRANT SELECT ON public.gi_stress_energy TO service_role;
GRANT SELECT ON public.gi_reflections_summary TO service_role;
GRANT SELECT ON public.gi_recovery_habits TO service_role;
GRANT SELECT ON public.gi_reset_toolkit TO service_role;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on views (if using security_invoker)
ALTER VIEW public.gi_teamwork SET (security_invoker = true);
ALTER VIEW public.gi_values SET (security_invoker = true);
ALTER VIEW public.gi_stress_energy SET (security_invoker = true);
ALTER VIEW public.gi_reflections_summary SET (security_invoker = true);
ALTER VIEW public.gi_recovery_habits SET (security_invoker = true);
ALTER VIEW public.gi_reset_toolkit SET (security_invoker = true);