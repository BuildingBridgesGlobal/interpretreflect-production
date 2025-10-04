-- SQL script to fix reflections with missing entry_kind values
-- Based on the console output, your Post-Assignment Debrief has data fields like:
-- duration, gratitude, nextSteps, boundaries, etc.

-- First, let's see what reflections have NULL or empty entry_kind
SELECT id, user_id, entry_kind, created_at,
       data->>'duration' as duration,
       data->>'gratitude' as gratitude,
       data->>'nextSteps' as next_steps,
       data->>'boundaries' as boundaries,
       data->>'commitment' as commitment,
       data->>'affirmation' as affirmation
FROM reflection_entries
WHERE entry_kind IS NULL OR entry_kind = ''
ORDER BY created_at DESC;

-- Update Post-Assignment Debrief reflections (has duration, nextSteps, boundaries fields)
UPDATE reflection_entries
SET entry_kind = 'post_assignment_debrief'
WHERE (entry_kind IS NULL OR entry_kind = '')
  AND data ? 'duration'
  AND data ? 'nextSteps'
  AND data ? 'boundaries';

-- Update Pre-Assignment Prep reflections
UPDATE reflection_entries
SET entry_kind = 'pre_assignment_prep'
WHERE (entry_kind IS NULL OR entry_kind = '')
  AND (data ? 'context_background' OR data ? 'materials_review' OR data ? 'anticipated_demands');

-- Update Wellness Check-in reflections
UPDATE reflection_entries
SET entry_kind = 'wellness_checkin'
WHERE (entry_kind IS NULL OR entry_kind = '')
  AND (data ? 'current_feeling' OR data ? 'wellness_score' OR data ? 'stress_level');

-- Update Teaming Prep reflections
UPDATE reflection_entries
SET entry_kind = 'teaming_prep'
WHERE (entry_kind IS NULL OR entry_kind = '')
  AND (data ? 'team_context' OR data ? 'team_dynamics' OR data ? 'collaboration_approach');

-- Update Teaming Reflection
UPDATE reflection_entries
SET entry_kind = 'teaming_reflection'
WHERE (entry_kind IS NULL OR entry_kind = '')
  AND (data ? 'team_effectiveness' OR data ? 'collaboration_success');

-- Update Mentoring Prep reflections
UPDATE reflection_entries
SET entry_kind = 'mentoring_prep'
WHERE (entry_kind IS NULL OR entry_kind = '')
  AND (data ? 'mentoring_goals' OR data ? 'mentoring_approach');

-- Update Mentoring Reflection
UPDATE reflection_entries
SET entry_kind = 'mentoring_reflection'
WHERE (entry_kind IS NULL OR entry_kind = '')
  AND (data ? 'mentoring_outcomes' OR data ? 'mentoring_insights');

-- Update Role-Space Reflection
UPDATE reflection_entries
SET entry_kind = 'role_space_reflection'
WHERE (entry_kind IS NULL OR entry_kind = '')
  AND data ? 'role_space';

-- Update Direct Communication reflections
UPDATE reflection_entries
SET entry_kind = 'direct_communication_reflection'
WHERE (entry_kind IS NULL OR entry_kind = '')
  AND (data ? 'communication_approach' OR data ? 'facilitating_direct');

-- Update Values Alignment Check-ins
UPDATE reflection_entries
SET entry_kind = 'values_alignment'
WHERE (entry_kind IS NULL OR entry_kind = '')
  AND (data ? 'values_reflection' OR data ? 'ethical_considerations');

-- Update In-Session Self-Check
UPDATE reflection_entries
SET entry_kind = 'insession_selfcheck'
WHERE (entry_kind IS NULL OR entry_kind = '')
  AND (data ? 'session_status' OR data ? 'in_session');

-- Update In-Session Team Sync
UPDATE reflection_entries
SET entry_kind = 'insession_team_sync'
WHERE (entry_kind IS NULL OR entry_kind = '')
  AND (data ? 'team_sync' OR data ? 'team_coordination');

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

-- Set any remaining NULL entry_kinds to 'personal_reflection'
UPDATE reflection_entries
SET entry_kind = 'personal_reflection'
WHERE entry_kind IS NULL OR entry_kind = '';

-- Show the results after the update
SELECT entry_kind, COUNT(*) as count
FROM reflection_entries
GROUP BY entry_kind
ORDER BY count DESC;

-- Show a few examples of the updated records
SELECT id, user_id, entry_kind, created_at,
       jsonb_pretty(data) as data_preview
FROM reflection_entries
WHERE entry_kind = 'post_assignment_debrief'
ORDER BY created_at DESC
LIMIT 3;