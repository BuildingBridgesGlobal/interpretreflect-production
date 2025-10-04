-- Migration to add required columns to existing burnout_assessments table
-- This adds the columns our Daily Burnout Gauge needs while preserving existing data

-- Add new metric columns if they don't exist
ALTER TABLE public.burnout_assessments
  ADD COLUMN IF NOT EXISTS energy_tank INTEGER CHECK (energy_tank BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS recovery_speed INTEGER CHECK (recovery_speed BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS emotional_leakage INTEGER CHECK (emotional_leakage BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS performance_signal INTEGER CHECK (performance_signal BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS tomorrow_readiness INTEGER CHECK (tomorrow_readiness BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS total_score INTEGER,
  ADD COLUMN IF NOT EXISTS risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high', 'severe')),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

-- Create unique index for one assessment per day per user (if not exists)
-- This uses the UTC date to ensure one assessment per calendar day
CREATE UNIQUE INDEX IF NOT EXISTS uq_burnout_assessments_user_day
  ON public.burnout_assessments (user_id, ((assessment_date AT TIME ZONE 'UTC')::date));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_burnout_assessments_user_date
  ON public.burnout_assessments (user_id, assessment_date DESC);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'burnout_assessments'
ORDER BY ordinal_position;