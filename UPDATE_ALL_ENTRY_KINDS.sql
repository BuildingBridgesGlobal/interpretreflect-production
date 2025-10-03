-- SQL script to standardize all entry_kind values in the database
-- This ensures consistency with the application's reflection type configuration

-- First, let's see what we currently have
SELECT entry_kind, COUNT(*) as count
FROM reflection_entries
GROUP BY entry_kind
ORDER BY count DESC;

-- Standardize all entry_kind values to match our configuration

-- Fix wellness check-ins
UPDATE reflection_entries
SET entry_kind = 'wellness_checkin'
WHERE entry_kind IN ('wellness_check_in', 'Wellness Check-in', 'wellness check-in', 'wellness-check-in');

-- Fix pre-assignment prep
UPDATE reflection_entries
SET entry_kind = 'pre_assignment_prep'
WHERE entry_kind IN ('Pre-Assignment Prep', 'pre-assignment-prep', 'pre assignment prep', 'pre_assignment');

-- Fix post-assignment debrief
UPDATE reflection_entries
SET entry_kind = 'post_assignment_debrief'
WHERE entry_kind IN ('Post-Assignment Debrief', 'post-assignment-debrief', 'post assignment debrief', 'post_assignment');

-- Fix teaming prep
UPDATE reflection_entries
SET entry_kind = 'teaming_prep'
WHERE entry_kind IN ('Teaming Prep', 'teaming-prep', 'team prep', 'team_prep', 'Team Preparation');

-- Fix teaming reflection
UPDATE reflection_entries
SET entry_kind = 'teaming_reflection'
WHERE entry_kind IN ('Teaming Reflection', 'teaming-reflection', 'team reflection', 'team_reflection', 'Team Reflection');

-- Fix mentoring prep
UPDATE reflection_entries
SET entry_kind = 'mentoring_prep'
WHERE entry_kind IN ('Mentoring Prep', 'mentoring-prep', 'mentor prep');

-- Fix mentoring reflection
UPDATE reflection_entries
SET entry_kind = 'mentoring_reflection'
WHERE entry_kind IN ('Mentoring Reflection', 'mentoring-reflection', 'mentor reflection');

-- Fix in-session self-check
UPDATE reflection_entries
SET entry_kind = 'insession_selfcheck'
WHERE entry_kind IN ('In-Session Self-Check', 'in-session-self-check', 'in_session_self_check', 'in_session_self', 'insession_self_check');

-- Fix in-session team sync
UPDATE reflection_entries
SET entry_kind = 'insession_team_sync'
WHERE entry_kind IN ('In-Session Team Sync', 'in-session-team-sync', 'in_session_team_sync', 'in_session_team', 'team_sync');

-- Fix role-space reflection
UPDATE reflection_entries
SET entry_kind = 'role_space_reflection'
WHERE entry_kind IN ('Role-Space Reflection', 'role-space-reflection', 'role_space', 'Role Space Reflection');

-- Fix direct communication
UPDATE reflection_entries
SET entry_kind = 'direct_communication_reflection'
WHERE entry_kind IN ('Supporting Direct Communication', 'direct_communication', 'direct-communication', 'Direct Communication');

-- Fix values alignment
UPDATE reflection_entries
SET entry_kind = 'values_alignment'
WHERE entry_kind IN ('Values Alignment Check-In', 'values-alignment', 'values_alignment_checkin', 'ethics_meaning');

-- Fix any null or empty entry_kinds based on data content patterns
UPDATE reflection_entries
SET entry_kind = CASE
    WHEN data ? 'commitment' THEN 'commitment'
    WHEN data ? 'gratitude' THEN 'gratitude'
    WHEN data ? 'affirmation' THEN 'affirmation'
    WHEN data ? 'context_background' THEN 'pre_assignment_prep'
    WHEN data ? 'assignment_summary' THEN 'post_assignment_debrief'
    WHEN data ? 'team_context' THEN 'teaming_prep'
    WHEN data ? 'team_effectiveness' THEN 'teaming_reflection'
    WHEN data ? 'mentoring_goals' THEN 'mentoring_prep'
    WHEN data ? 'mentoring_outcomes' THEN 'mentoring_reflection'
    WHEN data ? 'role_space' THEN 'role_space_reflection'
    WHEN data ? 'current_feeling' THEN 'wellness_checkin'
    ELSE 'personal_reflection'
END
WHERE entry_kind IS NULL OR entry_kind = '';

-- Show the final distribution
SELECT entry_kind, COUNT(*) as count
FROM reflection_entries
GROUP BY entry_kind
ORDER BY count DESC;

-- Show a sample of each type to verify
SELECT DISTINCT ON (entry_kind)
    entry_kind,
    created_at,
    jsonb_pretty(data) as sample_data
FROM reflection_entries
ORDER BY entry_kind, created_at DESC;