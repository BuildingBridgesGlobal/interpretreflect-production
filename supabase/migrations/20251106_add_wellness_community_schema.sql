-- ============================================
-- WELLNESS, COMMUNITY & AI ARCHITECTURE
-- InterpretReflect - Foundation for 3-Year Vision
-- ============================================
-- This migration adds tables that support:
-- - Interpreter wellness tracking & professional development
-- - Peer community & mentorship
-- - AI-powered glossary & terminology management
-- - Certification tracking & renewal reminders
-- ============================================

-- 1. USER PROFILES (Extended from basic auth)
-- Supports performance-first approach with wellness context
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,

  -- Professional Identity
  profile_type TEXT CHECK (profile_type IN ('interpreter', 'cdi', 'student', 'educator')) DEFAULT 'interpreter',
  years_experience INTEGER,
  specializations TEXT[], -- healthcare, legal, educational, VRS, etc.
  certification_data JSONB DEFAULT '{}', -- RID NIC, NAD, CCHI, state licenses

  -- Performance & Growth
  performance_goals JSONB DEFAULT '[]', -- what they want to improve
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),

  -- Onboarding State
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0, -- track progress through onboarding flow

  -- Privacy Settings
  profile_visibility TEXT CHECK (profile_visibility IN ('public', 'community', 'private')) DEFAULT 'community',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CERTIFICATIONS & CREDENTIALS
-- Track renewals, CEU requirements, send reminders
CREATE TABLE IF NOT EXISTS certifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Certification Details
  cert_type TEXT NOT NULL, -- 'RID NIC', 'NAD', 'CCHI', 'State', etc.
  cert_number TEXT,
  credential_level TEXT, -- 'NIC', 'NIC Advanced', 'NIC Master', etc.

  -- Dates
  issue_date DATE,
  expiration_date DATE,

  -- CEU Tracking
  ceu_hours_required NUMERIC(4,1) DEFAULT 0,
  ceu_hours_completed NUMERIC(4,1) DEFAULT 0,

  -- Reminders
  renewal_reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,

  -- Documents
  documents JSONB DEFAULT '[]', -- array of {url, filename, uploaded_at}

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WELLNESS CHECK-INS
-- Track stress, burnout, emotional state over time
CREATE TABLE IF NOT EXISTS wellness_check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  check_in_date DATE DEFAULT CURRENT_DATE,

  -- Core Metrics (1-10 scales)
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),

  -- Burnout Indicators (Maslach Burnout Inventory inspired)
  burnout_indicators JSONB DEFAULT '{}', -- {fatigue: 1-5, cynicism: 1-5, efficacy: 1-5}

  -- Qualitative Data
  recent_challenges TEXT,
  wins TEXT,

  -- AI Analysis
  elya_interaction_summary TEXT, -- AI-generated summary
  trend_analysis JSONB DEFAULT '{}', -- calculated patterns

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SKILL ASSESSMENTS
-- Track measurable improvement over time
CREATE TABLE IF NOT EXISTS skill_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Assessment Type
  assessment_type TEXT NOT NULL, -- 'terminology', 'cultural_competence', 'emotional_regulation'
  domain TEXT, -- 'healthcare', 'legal', 'educational', 'mental_health'

  -- Results
  score NUMERIC(5,2), -- percentage or raw score
  max_score NUMERIC(5,2) DEFAULT 100,

  -- Analysis
  areas_for_growth JSONB DEFAULT '[]', -- AI-identified gaps
  strengths JSONB DEFAULT '[]',

  -- Context
  assessment_data JSONB DEFAULT '{}', -- full response data

  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LEARNING PATHS
-- Personalized professional development journeys
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Path Definition
  path_name TEXT NOT NULL,
  path_type TEXT, -- 'certification_prep', 'specialization', 'skill_building'
  description TEXT,

  -- Progress
  modules JSONB DEFAULT '[]', -- array of {module_id, status, completed_at}
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),

  -- Timeline
  target_completion_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- AI Personalization
  ai_personalized_recommendations JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GLOSSARY TERMS (For AI Assistant)
-- User-specific terminology database with spaced repetition
CREATE TABLE IF NOT EXISTS glossary_terms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Term Details
  term TEXT NOT NULL,
  definition TEXT,
  context TEXT, -- example sentence or usage

  -- Categorization
  domain TEXT, -- 'healthcare', 'legal', 'mental_health', etc.
  category TEXT, -- 'anatomy', 'procedure', 'medication', etc.
  source TEXT, -- where they learned it

  -- Learning Progress
  proficiency_level INTEGER DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
  confidence_score NUMERIC(3,2) DEFAULT 0.5, -- 0.0 to 1.0

  -- Spaced Repetition
  last_reviewed TIMESTAMPTZ,
  next_review_date DATE, -- calculated by spaced repetition algorithm
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,

  -- AI Enhancement
  ai_generated_examples JSONB DEFAULT '[]',
  related_terms TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COMMUNITY POSTS
-- Peer support, questions, resource sharing
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Post Details
  post_type TEXT CHECK (post_type IN ('reflection', 'question', 'resource_share', 'peer_support', 'discussion')) NOT NULL,
  title TEXT,
  content TEXT NOT NULL,

  -- Organization
  tags TEXT[] DEFAULT '{}',
  domain TEXT, -- 'healthcare', 'legal', etc.

  -- Privacy
  anonymous BOOLEAN DEFAULT false,
  visibility TEXT CHECK (visibility IN ('public', 'community', 'private')) DEFAULT 'community',

  -- Moderation
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'removed')),
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES auth.users(id),
  moderation_reason TEXT,

  -- Engagement
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMMUNITY POST COMMENTS
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE, -- for threaded replies

  content TEXT NOT NULL,
  anonymous BOOLEAN DEFAULT false,

  moderation_status TEXT DEFAULT 'approved',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PEER CONNECTIONS
-- Mentor matching, study partners, peer support
CREATE TABLE IF NOT EXISTS peer_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id_1 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_id_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Connection Type
  connection_type TEXT CHECK (connection_type IN ('mentor', 'mentee', 'peer', 'study_partner')) NOT NULL,

  -- Matching
  match_algorithm_score NUMERIC(3,2), -- 0.0 to 1.0, how good the match is
  match_reason JSONB DEFAULT '{}', -- why they were matched

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'active', 'inactive')),

  -- Interaction Tracking
  last_interaction_at TIMESTAMPTZ,
  interaction_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id_1, user_id_2)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_type ON user_profiles(profile_type);
CREATE INDEX IF NOT EXISTS idx_certifications_user ON certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_expiration ON certifications(expiration_date);
CREATE INDEX IF NOT EXISTS idx_wellness_checkins_user_date ON wellness_check_ins(user_id, check_in_date DESC);
CREATE INDEX IF NOT EXISTS idx_skill_assessments_user ON skill_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user ON learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_user ON glossary_terms(user_id);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_next_review ON glossary_terms(next_review_date);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON community_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_peer_connections_users ON peer_connections(user_id_1, user_id_2);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_connections ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- User Profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view community profiles" ON user_profiles FOR SELECT USING (profile_visibility IN ('public', 'community'));

-- Certifications
CREATE POLICY "Users can view own certifications" ON certifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own certifications" ON certifications FOR ALL USING (auth.uid() = user_id);

-- Wellness Check-Ins
CREATE POLICY "Users can view own check-ins" ON wellness_check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own check-ins" ON wellness_check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own check-ins" ON wellness_check_ins FOR UPDATE USING (auth.uid() = user_id);

-- Skill Assessments
CREATE POLICY "Users can view own assessments" ON skill_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own assessments" ON skill_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Learning Paths
CREATE POLICY "Users can view own learning paths" ON learning_paths FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own learning paths" ON learning_paths FOR ALL USING (auth.uid() = user_id);

-- Glossary Terms
CREATE POLICY "Users can view own glossary" ON glossary_terms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own glossary" ON glossary_terms FOR ALL USING (auth.uid() = user_id);

-- Community Posts
CREATE POLICY "Users can view community posts" ON community_posts FOR SELECT USING (
  moderation_status = 'approved' OR user_id = auth.uid()
);
CREATE POLICY "Users can create community posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- Community Comments
CREATE POLICY "Users can view approved comments" ON community_comments FOR SELECT USING (
  moderation_status = 'approved' OR user_id = auth.uid()
);
CREATE POLICY "Users can create comments" ON community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON community_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON community_comments FOR DELETE USING (auth.uid() = user_id);

-- Peer Connections
CREATE POLICY "Users can view own connections" ON peer_connections FOR SELECT USING (
  auth.uid() = user_id_1 OR auth.uid() = user_id_2
);
CREATE POLICY "Users can create connections" ON peer_connections FOR INSERT WITH CHECK (
  auth.uid() = user_id_1 OR auth.uid() = user_id_2
);
CREATE POLICY "Users can update own connections" ON peer_connections FOR UPDATE USING (
  auth.uid() = user_id_1 OR auth.uid() = user_id_2
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_glossary_terms_updated_at BEFORE UPDATE ON glossary_terms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at BEFORE UPDATE ON community_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peer_connections_updated_at BEFORE UPDATE ON peer_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR REPORTING & ANALYTICS
-- ============================================

-- User wellness trends (30-day rolling average)
CREATE OR REPLACE VIEW user_wellness_trends AS
SELECT
  user_id,
  AVG(stress_level) as avg_stress_level_30d,
  AVG(energy_level) as avg_energy_level_30d,
  COUNT(*) as check_in_count_30d,
  MAX(check_in_date) as last_check_in_date
FROM wellness_check_ins
WHERE check_in_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id;

-- Certification renewal reminders
CREATE OR REPLACE VIEW certifications_expiring_soon AS
SELECT
  c.id,
  c.user_id,
  c.cert_type,
  c.cert_number,
  c.expiration_date,
  c.expiration_date - CURRENT_DATE as days_until_expiration,
  c.ceu_hours_required,
  c.ceu_hours_completed,
  c.ceu_hours_required - c.ceu_hours_completed as ceu_hours_remaining
FROM certifications c
WHERE c.expiration_date IS NOT NULL
  AND c.expiration_date > CURRENT_DATE
  AND c.expiration_date <= CURRENT_DATE + INTERVAL '90 days'
ORDER BY c.expiration_date;

-- ============================================
-- COMPLETED
-- ============================================
