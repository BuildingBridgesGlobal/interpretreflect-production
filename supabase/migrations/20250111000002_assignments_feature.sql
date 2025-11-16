-- ============================================
-- ASSIGNMENT PREP FEATURE - DATABASE MIGRATION
-- ============================================
-- Version: 20250111000002
-- Feature: Assignment Prep & Team Collaboration
-- Status: MVP - Individual Interpreter Focus
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ASSIGNMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Ownership
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_interpreter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic details
  assignment_name TEXT NOT NULL,
  assignment_type TEXT NOT NULL CHECK (
    assignment_type IN (
      'conference', 'medical', 'legal', 'educational',
      'vrs', 'vri', 'community', 'business', 'religious', 'other'
    )
  ),

  -- Timing
  assignment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  setup_time TIME, -- When to arrive/join early
  duration_minutes INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time)) / 60
  ) STORED,
  timezone TEXT DEFAULT 'America/New_York',

  -- Location/Platform
  is_remote BOOLEAN DEFAULT TRUE,
  platform TEXT, -- 'zoom', 'teams', 'google_meet', 'in_person', etc.
  meeting_link TEXT,
  meeting_id TEXT,
  meeting_passcode TEXT,
  physical_location TEXT, -- For in-person assignments

  -- Client/Organization
  client_organization TEXT,
  coordinator_name TEXT,
  coordinator_email TEXT,
  coordinator_phone TEXT,
  client_background TEXT,
  client_website TEXT,

  -- Participants
  deaf_participants TEXT,
  hearing_participants TEXT,
  languages TEXT[], -- ['ASL', 'English']
  participant_notes TEXT,

  -- Team interpreting
  is_team_assignment BOOLEAN DEFAULT FALSE,
  team_interpreter_name TEXT,
  team_interpreter_email TEXT,
  team_interpreter_phone TEXT,
  turn_rotation_minutes INTEGER,

  -- Context & Prep
  subject_topic TEXT,
  expected_cognitive_load TEXT CHECK (
    expected_cognitive_load IN ('low', 'moderate', 'high', 'very_high')
  ),
  key_considerations TEXT[], -- ['technical_terminology', 'acronym_heavy', etc.]
  prep_notes TEXT,
  cognitive_load_factors TEXT,
  support_strategies TEXT,

  -- Checklist (stored as JSONB for flexibility)
  prep_checklist JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"task": "Review materials", "completed": true, "completed_at": "2025-01-11T10:00:00Z"}]

  -- Sharing
  sharing_token TEXT UNIQUE,
  shared_with_emails TEXT[],

  -- Assignment status
  status TEXT DEFAULT 'upcoming' CHECK (
    status IN ('upcoming', 'in_progress', 'completed', 'cancelled')
  ),
  completed_at TIMESTAMPTZ,

  -- Post-assignment
  quick_reflect_id UUID REFERENCES quick_reflect_entries(id) ON DELETE SET NULL,

  -- Template
  is_template BOOLEAN DEFAULT FALSE,
  template_name TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_assignments_creator ON assignments(creator_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_primary_interpreter ON assignments(primary_interpreter_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_date ON assignments(assignment_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_status ON assignments(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_type ON assignments(assignment_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_sharing_token ON assignments(sharing_token) WHERE sharing_token IS NOT NULL;

-- ============================================
-- ASSIGNMENT ATTACHMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS assignment_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,

  -- File details
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_type TEXT, -- 'pdf', 'doc', 'image', etc.
  file_size INTEGER, -- bytes

  -- Metadata
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_assignment_attachments_assignment ON assignment_attachments(assignment_id);

-- ============================================
-- ASSIGNMENT RESOURCE LINKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS assignment_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,

  -- Link details
  title TEXT NOT NULL,
  url TEXT NOT NULL,

  -- Metadata
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_assignment_resources_assignment ON assignment_resources(assignment_id);

-- ============================================
-- ASSIGNMENT SHARES TABLE (Magic Links)
-- ============================================

CREATE TABLE IF NOT EXISTS assignment_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,

  -- Share details
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id), -- If they sign up, link here

  -- Access control
  access_level TEXT DEFAULT 'view' CHECK (
    access_level IN ('view', 'edit')
  ),
  share_token TEXT UNIQUE NOT NULL,
  personal_message TEXT,

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Tracking
  viewed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assignment_shares_assignment ON assignment_shares(assignment_id);
CREATE INDEX idx_assignment_shares_token ON assignment_shares(share_token) WHERE is_active = TRUE;
CREATE INDEX idx_assignment_shares_email ON assignment_shares(shared_with_email);

-- ============================================
-- SHARED ASSIGNMENT NOTES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS shared_assignment_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,

  -- Author (could be sharing recipient)
  author_email TEXT NOT NULL,
  author_user_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL,

  -- Content
  note_text TEXT NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_shared_notes_assignment ON shared_assignment_notes(assignment_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_shared_notes_created ON shared_assignment_notes(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_assignment_notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: ASSIGNMENTS
-- ============================================

-- Users can view their own assignments
CREATE POLICY "Users can view own assignments"
  ON assignments FOR SELECT
  USING (
    auth.uid() = creator_id
    OR auth.uid() = primary_interpreter_id
  );

-- Users can create assignments (must be creator and primary interpreter)
CREATE POLICY "Users can create own assignments"
  ON assignments FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id
    AND auth.uid() = primary_interpreter_id
  );

-- Users can update their own assignments
CREATE POLICY "Users can update own assignments"
  ON assignments FOR UPDATE
  USING (
    auth.uid() = creator_id
    OR auth.uid() = primary_interpreter_id
  );

-- Users can delete their own assignments (soft delete)
CREATE POLICY "Users can delete own assignments"
  ON assignments FOR DELETE
  USING (
    auth.uid() = creator_id
    OR auth.uid() = primary_interpreter_id
  );

-- Anyone with valid share token can view assignment (for magic links)
CREATE POLICY "Public can view shared assignments via token"
  ON assignments FOR SELECT
  USING (
    id IN (
      SELECT assignment_id
      FROM assignment_shares
      WHERE is_active = TRUE
        AND revoked_at IS NULL
        AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- ============================================
-- RLS POLICIES: ASSIGNMENT ATTACHMENTS
-- ============================================

CREATE POLICY "Users can view attachments for their assignments"
  ON assignment_attachments FOR SELECT
  USING (
    assignment_id IN (
      SELECT id FROM assignments
      WHERE auth.uid() = creator_id
         OR auth.uid() = primary_interpreter_id
    )
  );

CREATE POLICY "Users can add attachments to their assignments"
  ON assignment_attachments FOR INSERT
  WITH CHECK (
    assignment_id IN (
      SELECT id FROM assignments
      WHERE auth.uid() = creator_id
         OR auth.uid() = primary_interpreter_id
    )
  );

CREATE POLICY "Users can delete attachments from their assignments"
  ON assignment_attachments FOR DELETE
  USING (
    assignment_id IN (
      SELECT id FROM assignments
      WHERE auth.uid() = creator_id
         OR auth.uid() = primary_interpreter_id
    )
  );

-- Public can view attachments for shared assignments
CREATE POLICY "Public can view attachments for shared assignments"
  ON assignment_attachments FOR SELECT
  USING (
    assignment_id IN (
      SELECT assignment_id
      FROM assignment_shares
      WHERE is_active = TRUE
        AND revoked_at IS NULL
        AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- ============================================
-- RLS POLICIES: ASSIGNMENT RESOURCES
-- ============================================

CREATE POLICY "Users can view resources for their assignments"
  ON assignment_resources FOR SELECT
  USING (
    assignment_id IN (
      SELECT id FROM assignments
      WHERE auth.uid() = creator_id
         OR auth.uid() = primary_interpreter_id
    )
  );

CREATE POLICY "Users can add resources to their assignments"
  ON assignment_resources FOR INSERT
  WITH CHECK (
    assignment_id IN (
      SELECT id FROM assignments
      WHERE auth.uid() = creator_id
         OR auth.uid() = primary_interpreter_id
    )
  );

CREATE POLICY "Users can delete resources from their assignments"
  ON assignment_resources FOR DELETE
  USING (
    assignment_id IN (
      SELECT id FROM assignments
      WHERE auth.uid() = creator_id
         OR auth.uid() = primary_interpreter_id
    )
  );

-- Public can view resources for shared assignments
CREATE POLICY "Public can view resources for shared assignments"
  ON assignment_resources FOR SELECT
  USING (
    assignment_id IN (
      SELECT assignment_id
      FROM assignment_shares
      WHERE is_active = TRUE
        AND revoked_at IS NULL
        AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- ============================================
-- RLS POLICIES: ASSIGNMENT SHARES
-- ============================================

CREATE POLICY "Users can view shares for their assignments"
  ON assignment_shares FOR SELECT
  USING (
    shared_by = auth.uid()
    OR shared_with_user_id = auth.uid()
    OR assignment_id IN (
      SELECT id FROM assignments
      WHERE auth.uid() = creator_id
         OR auth.uid() = primary_interpreter_id
    )
  );

CREATE POLICY "Users can create shares for their assignments"
  ON assignment_shares FOR INSERT
  WITH CHECK (
    assignment_id IN (
      SELECT id FROM assignments
      WHERE auth.uid() = creator_id
         OR auth.uid() = primary_interpreter_id
    )
  );

CREATE POLICY "Users can update shares for their assignments"
  ON assignment_shares FOR UPDATE
  USING (
    shared_by = auth.uid()
    OR assignment_id IN (
      SELECT id FROM assignments
      WHERE auth.uid() = creator_id
         OR auth.uid() = primary_interpreter_id
    )
  );

-- ============================================
-- RLS POLICIES: SHARED ASSIGNMENT NOTES
-- ============================================

CREATE POLICY "Users can view notes for their assignments"
  ON shared_assignment_notes FOR SELECT
  USING (
    author_user_id = auth.uid()
    OR assignment_id IN (
      SELECT id FROM assignments
      WHERE auth.uid() = creator_id
         OR auth.uid() = primary_interpreter_id
    )
  );

CREATE POLICY "Users can add notes to their assignments"
  ON shared_assignment_notes FOR INSERT
  WITH CHECK (
    assignment_id IN (
      SELECT id FROM assignments
      WHERE auth.uid() = creator_id
         OR auth.uid() = primary_interpreter_id
    )
  );

CREATE POLICY "Users can update their own notes"
  ON shared_assignment_notes FOR UPDATE
  USING (author_user_id = auth.uid());

CREATE POLICY "Users can delete their own notes"
  ON shared_assignment_notes FOR DELETE
  USING (author_user_id = auth.uid());

-- Public can view notes for shared assignments
CREATE POLICY "Public can view notes for shared assignments"
  ON shared_assignment_notes FOR SELECT
  USING (
    assignment_id IN (
      SELECT assignment_id
      FROM assignment_shares
      WHERE is_active = TRUE
        AND revoked_at IS NULL
        AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- Public with edit access can add notes to shared assignments
CREATE POLICY "Public can add notes to shared assignments with edit access"
  ON shared_assignment_notes FOR INSERT
  WITH CHECK (
    assignment_id IN (
      SELECT assignment_id
      FROM assignment_shares
      WHERE is_active = TRUE
        AND revoked_at IS NULL
        AND access_level = 'edit'
        AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate sharing token
CREATE OR REPLACE FUNCTION generate_sharing_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on assignments
CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at on assignment_shares
CREATE TRIGGER update_assignment_shares_updated_at
  BEFORE UPDATE ON assignment_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Optional - Remove in Production)
-- ============================================

-- Example assignment types for reference
COMMENT ON COLUMN assignments.assignment_type IS
  'Assignment type: conference, medical, legal, educational, vrs, vri, community, business, religious, other';

COMMENT ON COLUMN assignments.expected_cognitive_load IS
  'Expected cognitive load: low, moderate, high, very_high';

COMMENT ON COLUMN assignments.key_considerations IS
  'Array of considerations: technical_terminology, acronym_heavy, accent_variations, emotionally_challenging, cultural_considerations, fast_paced';

COMMENT ON COLUMN assignments.prep_checklist IS
  'JSONB array of checklist items with structure: [{"task": "string", "completed": boolean, "completed_at": "timestamp"}]';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify tables created
DO $$
BEGIN
  RAISE NOTICE 'Assignment Prep feature migration completed successfully';
  RAISE NOTICE 'Tables created: assignments, assignment_attachments, assignment_resources, assignment_shares, shared_assignment_notes';
  RAISE NOTICE 'RLS policies applied to all tables';
  RAISE NOTICE 'Ready for application development';
END $$;
