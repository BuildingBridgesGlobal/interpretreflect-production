-- Add privacy consent field to user_profiles table
-- This allows tracking consent acceptance across all devices

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS privacy_consent_accepted_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_privacy_consent
ON user_profiles(privacy_consent_accepted_at);

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.privacy_consent_accepted_at IS 'Timestamp when user accepted privacy policy. NULL means not yet accepted.';
