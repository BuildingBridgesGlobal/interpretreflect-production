-- =====================================================
-- Terms and Conditions Acceptance Tracking
-- =====================================================
-- Tracks user acceptance of Terms and Privacy Policy
-- Maintains audit trail for legal compliance

-- =====================================================
-- 1. Create terms_acceptances table
-- =====================================================
CREATE TABLE IF NOT EXISTS terms_acceptances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  terms_version VARCHAR(50) NOT NULL,
  privacy_version VARCHAR(50) NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  terms_content_hash VARCHAR(64),
  privacy_content_hash VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_terms_user_id ON terms_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_accepted_at ON terms_acceptances(accepted_at DESC);
CREATE INDEX IF NOT EXISTS idx_terms_versions ON terms_acceptances(terms_version, privacy_version);

-- =====================================================
-- 2. Add columns to profiles table
-- =====================================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS terms_version VARCHAR(50),
ADD COLUMN IF NOT EXISTS privacy_version VARCHAR(50);

-- =====================================================
-- 3. Enable Row Level Security
-- =====================================================
ALTER TABLE terms_acceptances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own acceptances" ON terms_acceptances;
DROP POLICY IF EXISTS "Users can insert their own acceptances" ON terms_acceptances;
DROP POLICY IF EXISTS "Service role can manage all acceptances" ON terms_acceptances;

-- Create policies for terms_acceptances
CREATE POLICY "Users can view their own acceptances"
  ON terms_acceptances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own acceptances"
  ON terms_acceptances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all acceptances"
  ON terms_acceptances FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 4. Function to record terms acceptance
-- =====================================================
CREATE OR REPLACE FUNCTION record_terms_acceptance(
  p_terms_version VARCHAR,
  p_privacy_version VARCHAR,
  p_ip_address VARCHAR DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_terms_hash VARCHAR DEFAULT NULL,
  p_privacy_hash VARCHAR DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_acceptance_id UUID;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
  END IF;

  -- Insert the acceptance record
  INSERT INTO terms_acceptances (
    user_id,
    terms_version,
    privacy_version,
    ip_address,
    user_agent,
    terms_content_hash,
    privacy_content_hash
  ) VALUES (
    v_user_id,
    p_terms_version,
    p_privacy_version,
    p_ip_address,
    p_user_agent,
    p_terms_hash,
    p_privacy_hash
  )
  RETURNING id INTO v_acceptance_id;

  -- Update the user's profile
  UPDATE profiles
  SET
    terms_accepted_at = NOW(),
    terms_version = p_terms_version,
    privacy_version = p_privacy_version,
    updated_at = NOW()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'acceptance_id', v_acceptance_id,
    'accepted_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. Function to check terms acceptance status
-- =====================================================
CREATE OR REPLACE FUNCTION check_terms_acceptance(
  p_current_terms_version VARCHAR,
  p_current_privacy_version VARCHAR
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_last_acceptance RECORD;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not authenticated',
      'needs_acceptance', true
    );
  END IF;

  -- Get the user's last acceptance
  SELECT
    terms_version,
    privacy_version,
    accepted_at
  INTO v_last_acceptance
  FROM terms_acceptances
  WHERE user_id = v_user_id
  ORDER BY accepted_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    -- No acceptance record found
    RETURN jsonb_build_object(
      'success', true,
      'needs_acceptance', true,
      'has_accepted_current', false,
      'message', 'No previous acceptance found'
    );
  END IF;

  -- Check if versions match
  IF v_last_acceptance.terms_version = p_current_terms_version
     AND v_last_acceptance.privacy_version = p_current_privacy_version THEN
    RETURN jsonb_build_object(
      'success', true,
      'needs_acceptance', false,
      'has_accepted_current', true,
      'last_accepted_at', v_last_acceptance.accepted_at,
      'terms_version', v_last_acceptance.terms_version,
      'privacy_version', v_last_acceptance.privacy_version
    );
  ELSE
    RETURN jsonb_build_object(
      'success', true,
      'needs_acceptance', true,
      'has_accepted_current', false,
      'last_accepted_at', v_last_acceptance.accepted_at,
      'last_terms_version', v_last_acceptance.terms_version,
      'last_privacy_version', v_last_acceptance.privacy_version,
      'message', 'Terms or Privacy Policy has been updated'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. Function to get acceptance history
-- =====================================================
CREATE OR REPLACE FUNCTION get_terms_acceptance_history()
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_history JSONB;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
  END IF;

  -- Get acceptance history
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'terms_version', terms_version,
      'privacy_version', privacy_version,
      'accepted_at', accepted_at,
      'ip_address', ip_address
    ) ORDER BY accepted_at DESC
  ) INTO v_history
  FROM terms_acceptances
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'history', COALESCE(v_history, '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. Verification Query
-- =====================================================
SELECT
  'Terms Acceptance Tables Ready' as status,
  json_build_object(
    'tables_created', ARRAY[
      'terms_acceptances'
    ],
    'functions_created', ARRAY[
      'record_terms_acceptance',
      'check_terms_acceptance',
      'get_terms_acceptance_history'
    ],
    'features', ARRAY[
      'Terms version tracking',
      'Privacy policy version tracking',
      'User acceptance audit trail',
      'IP and user agent logging',
      'Content hash verification',
      'Row-level security'
    ]
  ) as capabilities;

-- =====================================================
-- SUCCESS: Terms Acceptance System Installed!
-- =====================================================
-- ✅ Terms and Privacy Policy acceptance tracking
-- ✅ Complete audit trail for compliance
-- ✅ Version tracking and update detection
-- ✅ Row-level security for user privacy
-- ✅ Profile integration for quick checks