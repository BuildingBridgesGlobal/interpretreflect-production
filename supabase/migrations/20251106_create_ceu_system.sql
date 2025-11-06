-- ============================================
-- CEU TRACKING SYSTEM FOR RID COMPLIANCE
-- InterpretReflect - RID Sponsor #2309
-- ============================================

-- 1. CEU PROGRAMS TABLE
-- Defines available CEU-eligible programs/bundles
CREATE TABLE IF NOT EXISTS ceu_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_code TEXT UNIQUE NOT NULL, -- 'VT-RESILIENCE-1.0', 'BOUNDARIES-0.5'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'PS' CHECK (category IN ('PS', 'GS')), -- Professional or General Studies
  ps_subcategory TEXT, -- New RID categories: 'Healthy Minds & Bodies', 'Ethical Considerations', etc.
  ceu_value NUMERIC(3,2) NOT NULL CHECK (ceu_value > 0 AND ceu_value <= 8.0), -- e.g., 0.1, 1.0, 2.5
  estimated_hours NUMERIC(4,2) NOT NULL, -- Contact hours
  learning_objectives JSONB NOT NULL, -- Array of learning objectives
  required_reflections JSONB, -- Array of required reflection types
  bundle_type TEXT CHECK (bundle_type IN ('single', 'series', 'path')),
  price_cents INTEGER NOT NULL DEFAULT 0, -- Price in cents (4900 = $49.00)
  stripe_price_id TEXT, -- Stripe Price ID for checkout
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CEU ENROLLMENTS TABLE
-- Track when users enroll (must be BEFORE starting, per RID rules)
CREATE TABLE IF NOT EXISTS ceu_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES ceu_programs(id) ON DELETE CASCADE NOT NULL,
  rid_number TEXT, -- User's RID certification number
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'abandoned')),
  completion_date TIMESTAMPTZ,
  total_time_minutes INTEGER DEFAULT 0, -- Tracked time
  progress JSONB DEFAULT '{}', -- Progress tracking
  metadata JSONB DEFAULT '{}', -- Additional data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, program_id, enrolled_at::date)
);

-- 3. CEU COMPLETIONS TABLE
-- Final record of awarded CEUs (attestation)
CREATE TABLE IF NOT EXISTS ceu_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  enrollment_id UUID REFERENCES ceu_enrollments(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES ceu_programs(id) ON DELETE CASCADE NOT NULL,

  -- RID Required Fields
  rid_number TEXT NOT NULL,
  ceu_awarded NUMERIC(3,2) NOT NULL,
  category TEXT NOT NULL, -- PS or GS
  ps_subcategory TEXT, -- 'Healthy Minds & Bodies', etc.
  completion_date TIMESTAMPTZ DEFAULT NOW(),
  contact_hours NUMERIC(4,2) NOT NULL,

  -- Documentation
  learning_objectives_met JSONB NOT NULL,
  completion_evidence JSONB, -- Reflection IDs, time logs, etc.

  -- Certificate
  certificate_number TEXT UNIQUE NOT NULL, -- IR-2025-001234
  certificate_url TEXT, -- S3/storage URL for PDF
  certificate_generated_at TIMESTAMPTZ,

  -- Sponsor Attestation
  sponsor_name TEXT DEFAULT 'Building Bridges Global / InterpretReflect',
  sponsor_rid_number TEXT DEFAULT '2309',
  attested_by UUID, -- Admin user who attested (if manual)
  attested_at TIMESTAMPTZ DEFAULT NOW(),

  -- RID Reporting
  reported_to_rid BOOLEAN DEFAULT false,
  reported_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, program_id, completion_date::date)
);

-- 4. CEU ACTIVITY LOG TABLE
-- Tracks individual reflection/activity completions within a program
CREATE TABLE IF NOT EXISTS ceu_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES ceu_enrollments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  activity_type TEXT NOT NULL, -- 'reflection', 'assessment', 'practice'
  activity_name TEXT NOT NULL,
  reflection_id UUID, -- Reference to reflections table if applicable

  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER, -- Actual tracked time

  metadata JSONB DEFAULT '{}', -- Activity-specific data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ceu_programs_active ON ceu_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_ceu_programs_category ON ceu_programs(category, ps_subcategory);
CREATE INDEX IF NOT EXISTS idx_ceu_enrollments_user ON ceu_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_ceu_enrollments_status ON ceu_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_ceu_enrollments_program ON ceu_enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_ceu_completions_user ON ceu_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_ceu_completions_rid ON ceu_completions(rid_number);
CREATE INDEX IF NOT EXISTS idx_ceu_completions_date ON ceu_completions(completion_date);
CREATE INDEX IF NOT EXISTS idx_ceu_activity_enrollment ON ceu_activity_log(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_ceu_activity_user ON ceu_activity_log(user_id);

-- Enable RLS
ALTER TABLE ceu_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceu_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceu_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceu_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view active programs
CREATE POLICY "Anyone can view active ceu programs" ON ceu_programs
  FOR SELECT USING (is_active = true);

-- Users can view own enrollments
CREATE POLICY "Users can view own ceu enrollments" ON ceu_enrollments
  FOR SELECT USING (auth.uid() = user_id);

-- Users can enroll in programs
CREATE POLICY "Users can enroll in ceu programs" ON ceu_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own enrollments
CREATE POLICY "Users can update own ceu enrollments" ON ceu_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view own completions
CREATE POLICY "Users can view own ceu completions" ON ceu_completions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view own activity log
CREATE POLICY "Users can view own ceu activity log" ON ceu_activity_log
  FOR SELECT USING (auth.uid() = user_id);

-- Users can log own activities
CREATE POLICY "Users can log own ceu activities" ON ceu_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SEED DATA: Initial CEU Programs
-- ============================================

INSERT INTO ceu_programs (
  program_code, title, description, category, ps_subcategory,
  ceu_value, estimated_hours, learning_objectives, required_reflections,
  bundle_type, price_cents, stripe_price_id
) VALUES
-- Starter Bundle
(
  'IR-HMB-FOUNDATIONS-0.5',
  'Foundations of Interpreter Wellness & Reflective Practice',
  'Introduce yourself to evidence-based wellness practices designed specifically for ASL interpreters. Learn the BREATHE protocol, complete structured wellness assessments, and develop a personalized self-care action plan.',
  'PS',
  'Studies of Healthy Minds and Bodies',
  0.5,
  5.0,
  jsonb_build_array(
    'Identify signs and symptoms of interpreter burnout',
    'Apply the BREATHE protocol for immediate stress regulation',
    'Complete structured wellness self-assessments',
    'Develop personalized self-care action plan'
  ),
  jsonb_build_array(
    'Burnout Assessment',
    'BREATHE Protocol x3',
    'Weekly Wellness Check-in x4'
  ),
  'series',
  4900, -- $49.00
  NULL -- Add your Stripe Price ID here
),

-- Vicarious Trauma Bundle
(
  'IR-HMB-TRAUMA-1.0',
  'Vicarious Trauma Processing & Resilience Building',
  'Build sustainable resilience against vicarious trauma exposure. Learn to recognize trauma symptoms, implement pre-assignment preparation protocols, and process post-assignment emotional residue using the ECCI model.',
  'PS',
  'Studies of Healthy Minds and Bodies',
  1.0,
  10.0,
  jsonb_build_array(
    'Recognize vicarious trauma symptoms and triggers',
    'Implement pre-assignment emotional preparation protocols',
    'Process post-assignment emotional residue using ECCI model',
    'Track patterns in trauma exposure over time',
    'Build sustainable resilience practices'
  ),
  jsonb_build_array(
    'Pre-Assignment Prep x5',
    'Post-Assignment Debrief x5',
    'Body Awareness Journey x4',
    'Monthly Integration Reflection'
  ),
  'series',
  14900, -- $149.00
  NULL
),

-- Professional Boundaries Bundle
(
  'IR-PII-BOUNDARIES-0.5',
  'Professional Boundaries & Role Clarity',
  'Establish and maintain healthy professional boundaries in interpreting contexts. Learn to recognize boundary violations, navigate boundary dilemmas, and maintain emotional safety in close-proximity work.',
  'PS',
  'Professional Interpersonal Interactions',
  0.5,
  5.0,
  jsonb_build_array(
    'Define personal professional boundaries in interpreting',
    'Recognize boundary violations and challenges',
    'Navigate boundary dilemmas using reflective practice',
    'Maintain emotional safety in close-proximity work'
  ),
  jsonb_build_array(
    'Boundaries Self-Assessment',
    'Role/Space Reflection x3',
    'Professional Boundaries Reset x2',
    'Integration & Action Planning'
  ),
  'series',
  4900, -- $49.00
  NULL
),

-- Complete Wellness Bundle (Best Value)
(
  'IR-COMPLETE-3.0',
  'Complete Interpreter Wellness Bundle',
  'The ultimate wellness and professional development package. Includes all foundational programs plus specialized tracks for comprehensive skill building. Best value for meeting your entire 4-year CEU requirement.',
  'PS',
  'Studies of Healthy Minds and Bodies',
  3.0,
  30.0,
  jsonb_build_array(
    'Master all ECCI Model frameworks',
    'Build comprehensive wellness practices',
    'Develop advanced professional boundaries',
    'Process vicarious trauma systematically',
    'Cultivate sustainable excellence'
  ),
  jsonb_build_array(
    'All Foundations activities',
    'All Vicarious Trauma activities',
    'All Professional Boundaries activities',
    'Advanced Integration Protocols'
  ),
  'path',
  39900, -- $399.00
  NULL
)
ON CONFLICT (program_code) DO NOTHING;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  sequence_num TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');

  -- Get next sequence number for this year
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0') INTO sequence_num
  FROM ceu_completions
  WHERE EXTRACT(YEAR FROM completion_date) = EXTRACT(YEAR FROM NOW());

  RETURN 'IR-' || year || '-' || sequence_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate certificate numbers
CREATE OR REPLACE FUNCTION set_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_number IS NULL THEN
    NEW.certificate_number := generate_certificate_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_certificate_number
  BEFORE INSERT ON ceu_completions
  FOR EACH ROW
  EXECUTE FUNCTION set_certificate_number();

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View for user CEU summary
CREATE OR REPLACE VIEW user_ceu_summary AS
SELECT
  user_id,
  COUNT(*) as total_completions,
  SUM(ceu_awarded) as total_ceus_earned,
  MAX(completion_date) as last_completion_date,
  jsonb_agg(
    jsonb_build_object(
      'program_code', p.program_code,
      'title', p.title,
      'ceu_value', c.ceu_awarded,
      'completion_date', c.completion_date,
      'certificate_number', c.certificate_number
    ) ORDER BY c.completion_date DESC
  ) as completions
FROM ceu_completions c
JOIN ceu_programs p ON c.program_id = p.id
GROUP BY user_id;

-- ============================================
-- COMPLETED
-- ============================================
