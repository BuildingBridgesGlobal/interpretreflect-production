-- Add emotion-clarity to the valid_entry_kind constraint
-- This allows the Emotion Clarity Practice to save properly

-- First, drop the existing constraint
ALTER TABLE public.reflection_entries
DROP CONSTRAINT IF EXISTS valid_entry_kind;

-- Then recreate it with emotion-clarity included
ALTER TABLE public.reflection_entries
ADD CONSTRAINT valid_entry_kind CHECK (entry_kind IN (
    'pre_assignment_prep',
    'post_assignment_debrief',
    'teaming_prep',
    'teaming_reflection',
    'mentoring_prep',
    'mentoring_reflection',
    'wellness_check_in',
    'compass_check',
    'breathing_practice',
    'body_awareness',
    'stress_reset',
    'burnout_assessment',
    'affirmation_studio',
    'emotion_mapping',
    'role_space_reflection',
    'direct_communication_reflection',
    'professional_boundaries_reset',
    'code_switch_reset',
    'technology_fatigue_reset',
    'between_languages_reset',
    'emotion-clarity'  -- ✨ NEW: Added for Emotion Clarity Practice
));

-- Add comment for documentation
COMMENT ON CONSTRAINT valid_entry_kind ON public.reflection_entries
IS 'Valid reflection entry types including emotion-clarity for Emotion Clarity Practice';
