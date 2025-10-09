-- Add unique constraint on burnout_assessments to ensure one assessment per user per day
-- This constraint is named uq_ba_user_day to match the error message

-- First, remove any duplicate records (keep the most recent one)
DELETE FROM burnout_assessments a
USING burnout_assessments b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND DATE(a.assessment_date) = DATE(b.assessment_date);

-- Add the unique constraint
ALTER TABLE burnout_assessments
DROP CONSTRAINT IF EXISTS uq_ba_user_day;

ALTER TABLE burnout_assessments
ADD CONSTRAINT uq_ba_user_day UNIQUE (user_id, assessment_date);
