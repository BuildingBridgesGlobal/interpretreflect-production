-- SQL script to analyze and fix missing entry_kind values in reflection_entries table
-- Run this in your Supabase SQL Editor

-- First, let's see what entry_kind values we currently have
SELECT
    entry_kind,
    COUNT(*) as count
FROM reflection_entries
GROUP BY entry_kind
ORDER BY count DESC;

-- Check reflections with null or empty entry_kind
SELECT
    id,
    user_id,
    created_at,
    entry_kind,
    jsonb_pretty(data) as data_preview
FROM reflection_entries
WHERE entry_kind IS NULL OR entry_kind = ''
ORDER BY created_at DESC
LIMIT 10;

-- Update reflections based on data content patterns
-- This tries to infer the reflection type from the data content

-- Update commitment reflections
UPDATE reflection_entries
SET entry_kind = 'commitment'
WHERE (entry_kind IS NULL OR entry_kind = '')
AND data ? 'commitment';

-- Update gratitude reflections
UPDATE reflection_entries
SET entry_kind = 'gratitude'
WHERE (entry_kind IS NULL OR entry_kind = '')
AND data ? 'gratitude';

-- Update affirmation reflections
UPDATE reflection_entries
SET entry_kind = 'affirmation'
WHERE (entry_kind IS NULL OR entry_kind = '')
AND data ? 'affirmation';

-- Update wellness check-ins
UPDATE reflection_entries
SET entry_kind = 'wellness_checkin'
WHERE (entry_kind IS NULL OR entry_kind = '')
AND (data ? 'current_feeling' OR data ? 'wellness_score' OR data ? 'stress_level');

-- Update pre-assignment prep
UPDATE reflection_entries
SET entry_kind = 'pre_assignment_prep'
WHERE (entry_kind IS NULL OR entry_kind = '')
AND (data ? 'context_background' OR data ? 'materials_review' OR data ? 'anticipated_demands');

-- Update post-assignment debrief
UPDATE reflection_entries
SET entry_kind = 'post_assignment_debrief'
WHERE (entry_kind IS NULL OR entry_kind = '')
AND (data ? 'assignment_summary' OR data ? 'challenges_faced' OR data ? 'lessons_learned');

-- Update teaming prep
UPDATE reflection_entries
SET entry_kind = 'teaming_prep'
WHERE (entry_kind IS NULL OR entry_kind = '')
AND (data ? 'team_context' OR data ? 'team_dynamics' OR data ? 'collaboration_approach');

-- Update teaming reflection
UPDATE reflection_entries
SET entry_kind = 'teaming_reflection'
WHERE (entry_kind IS NULL OR entry_kind = '')
AND (data ? 'team_effectiveness' OR data ? 'collaboration_success' OR data ? 'team_challenges');

-- Update mentoring prep
UPDATE reflection_entries
SET entry_kind = 'mentoring_prep'
WHERE (entry_kind IS NULL OR entry_kind = '')
AND (data ? 'mentoring_goals' OR data ? 'mentoring_approach' OR data ? 'mentee_needs');

-- Update mentoring reflection
UPDATE reflection_entries
SET entry_kind = 'mentoring_reflection'
WHERE (entry_kind IS NULL OR entry_kind = '')
AND (data ? 'mentoring_outcomes' OR data ? 'mentoring_insights' OR data ? 'mentoring_feedback');

-- Update role-space reflection
UPDATE reflection_entries
SET entry_kind = 'role_space_reflection'
WHERE (entry_kind IS NULL OR entry_kind = '')
AND (data ? 'role_space' OR data ? 'boundaries' OR data ? 'professional_identity');

-- Update direct communication reflection
UPDATE reflection_entries
SET entry_kind = 'direct_communication_reflection'
WHERE (entry_kind IS NULL OR entry_kind = '')
AND (data ? 'communication_approach' OR data ? 'facilitating_direct' OR data ? 'communication_challenges');

-- Update values alignment check-in
UPDATE reflection_entries
SET entry_kind = 'values_alignment'
WHERE (entry_kind IS NULL OR entry_kind = '')
AND (data ? 'values_reflection' OR data ? 'ethical_considerations' OR data ? 'values_alignment');

-- Update in-session self-check
UPDATE reflection_entries
SET entry_kind = 'insession_selfcheck'
WHERE (entry_kind IS NULL OR entry_kind = '')
AND (data ? 'session_status' OR data ? 'in_session' OR data ? 'current_challenge');

-- Update in-session team sync
UPDATE reflection_entries
SET entry_kind = 'insession_team_sync'
WHERE (entry_kind IS NULL OR entry_kind = '')
AND (data ? 'team_sync' OR data ? 'team_coordination' OR data ? 'sync_status');

-- For any remaining null/empty entry_kind, set to 'personal_reflection'
UPDATE reflection_entries
SET entry_kind = 'personal_reflection'
WHERE entry_kind IS NULL OR entry_kind = '';

-- Final check - show the updated distribution
SELECT
    entry_kind,
    COUNT(*) as count
FROM reflection_entries
GROUP BY entry_kind
ORDER BY count DESC;