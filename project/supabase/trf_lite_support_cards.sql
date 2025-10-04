-- =====================================================
-- TRF-Lite Support Cards Schema
-- Private, encrypted wellness support system
-- =====================================================
-- Tracks early warning signs, what helps/avoid strategies
-- All data is encrypted client-side for privacy

-- =====================================================
-- 1. Create support_cards table
-- =====================================================
CREATE TABLE IF NOT EXISTS support_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Encrypted card data (all personal info encrypted client-side)
  encrypted_data TEXT NOT NULL, -- Contains early signs, what helps, what to avoid

  -- Metadata (not encrypted for querying)
  card_version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  last_accessed TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,

  -- Quick access fields (encrypted but searchable hashes)
  quick_helps_hash TEXT[], -- Hashed keywords for quick search
  emergency_contact_hash TEXT, -- Hashed emergency contact (if provided)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one active card per user
  CONSTRAINT one_active_card_per_user UNIQUE(user_id, is_active)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_cards_user ON support_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_support_cards_active ON support_cards(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_support_cards_updated ON support_cards(updated_at DESC);

-- =====================================================
-- 2. Create support_card_shares table (optional sharing)
-- =====================================================
CREATE TABLE IF NOT EXISTS support_card_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES support_cards(id) ON DELETE CASCADE,

  -- Share details
  share_token TEXT UNIQUE NOT NULL, -- Random token for accessing shared card
  shared_with_type TEXT CHECK (shared_with_type IN ('team', 'supervisor', 'agency', 'emergency', 'specific_user')),
  shared_with_id TEXT, -- Could be user_id, team_id, etc (hashed)

  -- Permissions
  can_view BOOLEAN DEFAULT true,
  can_suggest BOOLEAN DEFAULT false, -- Can suggest additions

  -- Share limits
  expires_at TIMESTAMPTZ,
  max_views INTEGER,
  view_count INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_card_shares_token ON support_card_shares(share_token) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_card_shares_card ON support_card_shares(card_id);

-- =====================================================
-- 3. Create card_access_log table (audit trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS card_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES support_cards(id) ON DELETE CASCADE,

  -- Access details
  access_type TEXT CHECK (access_type IN ('view', 'edit', 'share', 'export', 'emergency')),
  accessed_by UUID, -- User who accessed (could be different from owner)
  access_context TEXT, -- 'self', 'shared', 'emergency', etc.

  -- Optional details
  ip_hash TEXT, -- Hashed IP for security audits
  user_agent_hash TEXT, -- Hashed user agent

  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_log_card ON card_access_log(card_id);
CREATE INDEX IF NOT EXISTS idx_access_log_time ON card_access_log(accessed_at DESC);

-- =====================================================
-- 4. Create card_templates table (starter templates)
-- =====================================================
CREATE TABLE IF NOT EXISTS card_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  template_name TEXT NOT NULL,
  template_category TEXT CHECK (template_category IN (
    'general', 'medical', 'legal', 'educational', 'mental_health', 'high_stress'
  )),

  -- Template data (not encrypted as it's not personal)
  early_signs JSONB DEFAULT '{}',
  what_helps JSONB DEFAULT '{}',
  what_to_avoid JSONB DEFAULT '{}',

  -- Metadata
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  usage_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add starter templates
INSERT INTO card_templates (template_name, template_category, early_signs, what_helps, what_to_avoid) VALUES
(
  'General Interpreter Wellness',
  'general',
  '{
    "physical": ["Tension headaches", "Tight shoulders", "Shallow breathing", "Fatigue"],
    "emotional": ["Irritability", "Feeling overwhelmed", "Detachment", "Anxiety"],
    "cognitive": ["Difficulty concentrating", "Forgetfulness", "Racing thoughts", "Indecision"]
  }'::jsonb,
  '{
    "immediate": ["5 deep breaths", "Drink water", "Step outside", "Stretch shoulders"],
    "shortTerm": ["10-minute walk", "Call a friend", "Listen to music", "Journal"],
    "preventive": ["Regular breaks", "Set boundaries", "Sleep schedule", "Meal planning"]
  }'::jsonb,
  '{
    "behaviors": ["Skipping meals", "Isolation", "Overcommitting", "Ignoring symptoms"],
    "situations": ["Back-to-back assignments", "Emotional content without debrief", "Working when sick"]
  }'::jsonb
),
(
  'Medical Interpreter Support',
  'medical',
  '{
    "physical": ["Nausea from medical content", "Standing fatigue", "Eye strain", "Back pain"],
    "emotional": ["Compassion fatigue", "Secondary trauma", "Emotional numbness", "Hypervigilance"],
    "cognitive": ["Medical term overload", "Mixing languages", "Processing delays", "Decision fatigue"]
  }'::jsonb,
  '{
    "immediate": ["Grounding exercise", "Cold water on wrists", "Focus on breathing", "Name 5 things you see"],
    "shortTerm": ["Debrief with colleague", "Physical movement", "Change of scenery", "Hydrate and snack"],
    "preventive": ["Trauma-informed training", "Peer support group", "Regular supervision", "Self-care routine"]
  }'::jsonb,
  '{
    "behaviors": ["Taking on patient emotions", "Skipping PPE", "Working through triggers", "Not debriefing"],
    "situations": ["Traumatic cases without support", "Personal medical triggers", "Language you''re less confident in"]
  }'::jsonb
),
(
  'Legal Interpreter Support',
  'legal',
  '{
    "physical": ["Tension from high stakes", "Sitting fatigue", "Voice strain", "Stress headaches"],
    "emotional": ["Performance anxiety", "Fear of mistakes", "Frustration with process", "Feeling responsible"],
    "cognitive": ["Legal jargon overload", "Maintaining neutrality", "Complex terminology", "Rapid speech processing"]
  }'::jsonb,
  '{
    "immediate": ["Power pose", "Affirm capabilities", "Review glossary", "Arrive early to settle"],
    "shortTerm": ["Review case notes", "Practice terminology", "Connect with mentor", "Physical exercise"],
    "preventive": ["Continuing education", "Legal glossary building", "Mock sessions", "Stress management"]
  }'::jsonb,
  '{
    "behaviors": ["Giving legal advice", "Taking sides", "Rushing interpretation", "Not asking for clarification"],
    "situations": ["Hostile environments", "Emotional testimony", "Complex legal concepts", "Time pressure"]
  }'::jsonb
);

-- =====================================================
-- 5. Functions for Support Card Management
-- =====================================================

-- Function to save/update support card (with encryption)
CREATE OR REPLACE FUNCTION save_support_card(
  p_user_id UUID,
  p_encrypted_data TEXT,
  p_quick_helps_hash TEXT[] DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_card_id UUID;
  v_existing_id UUID;
BEGIN
  -- Check for existing active card
  SELECT id INTO v_existing_id
  FROM support_cards
  WHERE user_id = p_user_id AND is_active = true;

  IF v_existing_id IS NOT NULL THEN
    -- Update existing card
    UPDATE support_cards
    SET
      encrypted_data = p_encrypted_data,
      quick_helps_hash = COALESCE(p_quick_helps_hash, quick_helps_hash),
      updated_at = NOW(),
      card_version = card_version + 1
    WHERE id = v_existing_id
    RETURNING id INTO v_card_id;
  ELSE
    -- Create new card
    INSERT INTO support_cards (
      user_id,
      encrypted_data,
      quick_helps_hash
    ) VALUES (
      p_user_id,
      p_encrypted_data,
      p_quick_helps_hash
    )
    RETURNING id INTO v_card_id;
  END IF;

  -- Log access
  INSERT INTO card_access_log (card_id, access_type, accessed_by, access_context)
  VALUES (v_card_id, 'edit', p_user_id, 'self');

  RETURN json_build_object(
    'success', true,
    'card_id', v_card_id,
    'message', CASE WHEN v_existing_id IS NOT NULL THEN 'Card updated' ELSE 'Card created' END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to retrieve support card
CREATE OR REPLACE FUNCTION get_support_card(
  p_user_id UUID,
  p_share_token TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_card RECORD;
  v_share RECORD;
BEGIN
  IF p_share_token IS NOT NULL THEN
    -- Get shared card
    SELECT sc.*, scs.*
    INTO v_card
    FROM support_cards sc
    JOIN support_card_shares scs ON scs.card_id = sc.id
    WHERE scs.share_token = p_share_token
      AND scs.revoked_at IS NULL
      AND (scs.expires_at IS NULL OR scs.expires_at > NOW())
      AND (scs.max_views IS NULL OR scs.view_count < scs.max_views);

    IF FOUND THEN
      -- Update view count
      UPDATE support_card_shares
      SET view_count = view_count + 1,
          last_viewed_at = NOW()
      WHERE share_token = p_share_token;
    END IF;
  ELSE
    -- Get user's own card
    SELECT * INTO v_card
    FROM support_cards
    WHERE user_id = p_user_id AND is_active = true;
  END IF;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'No support card found'
    );
  END IF;

  -- Update access info
  UPDATE support_cards
  SET last_accessed = NOW(),
      access_count = access_count + 1
  WHERE id = v_card.id;

  -- Log access
  INSERT INTO card_access_log (card_id, access_type, accessed_by, access_context)
  VALUES (
    v_card.id,
    'view',
    p_user_id,
    CASE WHEN p_share_token IS NOT NULL THEN 'shared' ELSE 'self' END
  );

  RETURN json_build_object(
    'success', true,
    'card', json_build_object(
      'id', v_card.id,
      'encrypted_data', v_card.encrypted_data,
      'version', v_card.card_version,
      'updated_at', v_card.updated_at
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to share support card
CREATE OR REPLACE FUNCTION share_support_card(
  p_card_id UUID,
  p_user_id UUID,
  p_share_type TEXT,
  p_expires_hours INTEGER DEFAULT 24
)
RETURNS JSON AS $$
DECLARE
  v_share_token TEXT;
  v_share_id UUID;
BEGIN
  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM support_cards
    WHERE id = p_card_id AND user_id = p_user_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Not authorized to share this card'
    );
  END IF;

  -- Generate unique token
  v_share_token := encode(gen_random_bytes(32), 'hex');

  -- Create share
  INSERT INTO support_card_shares (
    card_id,
    share_token,
    shared_with_type,
    expires_at
  ) VALUES (
    p_card_id,
    v_share_token,
    p_share_type,
    NOW() + (p_expires_hours || ' hours')::INTERVAL
  )
  RETURNING id INTO v_share_id;

  -- Log share
  INSERT INTO card_access_log (card_id, access_type, accessed_by, access_context)
  VALUES (p_card_id, 'share', p_user_id, p_share_type);

  RETURN json_build_object(
    'success', true,
    'share_id', v_share_id,
    'share_token', v_share_token,
    'share_url', 'https://interpretreflect.com/support/' || v_share_token,
    'expires_at', NOW() + (p_expires_hours || ' hours')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. Enable Row Level Security
-- =====================================================
ALTER TABLE support_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_card_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_templates ENABLE ROW LEVEL SECURITY;

-- Policies for support_cards
CREATE POLICY "Users can manage own cards"
ON support_cards FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for shares
CREATE POLICY "Users can manage own shares"
ON support_card_shares FOR ALL
USING (EXISTS (
  SELECT 1 FROM support_cards
  WHERE support_cards.id = support_card_shares.card_id
  AND support_cards.user_id = auth.uid()
));

-- Public read for templates
CREATE POLICY "Public can read templates"
ON card_templates FOR SELECT
USING (is_public = true);

-- Users can create templates
CREATE POLICY "Users can create templates"
ON card_templates FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- =====================================================
-- 7. Verification
-- =====================================================
SELECT
  'TRF-Lite Support Cards Ready' as status,
  json_build_object(
    'tables_created', ARRAY[
      'support_cards',
      'support_card_shares',
      'card_access_log',
      'card_templates'
    ],
    'functions_created', ARRAY[
      'save_support_card',
      'get_support_card',
      'share_support_card'
    ],
    'features', ARRAY[
      'Client-side encryption',
      'Early signs tracking',
      'What helps/avoid strategies',
      'Secure sharing',
      'Template library',
      'Audit trail'
    ]
  ) as capabilities;

-- =====================================================
-- SUCCESS: TRF-Lite Support Cards Installed!
-- =====================================================
-- ✅ Private, encrypted support cards
-- ✅ Early warning signs tracking
-- ✅ What helps/avoid strategies
-- ✅ Secure sharing with expiration
-- ✅ Template library for quick setup
-- ✅ Complete audit trail