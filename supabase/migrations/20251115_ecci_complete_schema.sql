-- Comprehensive ECCI Schema for InterpretReflect Platform
-- This migration creates the complete data model for ECCI-based interpreter analytics

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Core Types and Enums
CREATE TYPE assignment_setting AS ENUM (
  'medical',
  'legal', 
  'vrs',
  'vri',
  'k12',
  'post_secondary',
  'mental_health',
  'community',
  'other'
);

CREATE TYPE assignment_modality AS ENUM (
  'onsite',
  'vri',
  'vrs',
  'hybrid',
  'other'
);

CREATE TYPE assignment_stakes AS ENUM (
  'routine',
  'sensitive',
  'high_stakes',
  'crisis'
);

CREATE TYPE ai_involvement_expected AS ENUM (
  'yes',
  'no',
  'unsure'
);

CREATE TYPE eri_band AS ENUM (
  'stable',
  'watch',
  'at_risk',
  'insufficient_data'
);

-- 2. ECCI Domains Reference Table
CREATE TABLE IF NOT EXISTS ecci_domains (
  id          smallint PRIMARY KEY,
  key         text NOT NULL UNIQUE,
  name        text NOT NULL,
  description text
);

INSERT INTO ecci_domains (id, key, name, description) VALUES
  (1, 'EI', 'Emotional Intelligence', 'Emotional self-awareness and regulation under load'),
  (2, 'CQ', 'Cultural Intelligence', 'Cultural humility, perspective-taking, and equity in practice'),
  (3, 'MEANING', 'Meaning-Making Performance', 'Capturing meaning, tone, and intent accurately'),
  (4, 'ROLE_SPACE', 'Role-Space & Interaction Design', 'Maintaining role, boundaries, and equi-partiality'),
  (5, 'REFLECTIVE_PRAXIS', 'Reflective Praxis & Growth', 'Learning from experience and closing the loop'),
  (6, 'AI_COLLAB', 'AI Collaboration Readiness', 'Working safely and effectively with AI/avatars')
ON CONFLICT (id) DO NOTHING;

-- 3. Assignments Table (Core Spine)
CREATE TABLE IF NOT EXISTS assignments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  
  -- Context
  setting           assignment_setting NOT NULL,
  modality          assignment_modality NOT NULL,
  stakes            assignment_stakes NOT NULL,
  
  participants      text[] DEFAULT '{}',
  duration_minutes  integer,
  started_at        timestamptz DEFAULT now(),
  ended_at          timestamptz,
  
  -- AI/Tech usage
  ai_used           boolean DEFAULT false,
  ai_modalities     text[] DEFAULT '{}',
  
  -- Status
  status            text DEFAULT 'completed',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON assignments (user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_started_at ON assignments (started_at);

-- 4. Readiness Checks Table (Pre-Assignment)
CREATE TABLE IF NOT EXISTS readiness_checks (
  id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id                   uuid NOT NULL UNIQUE REFERENCES assignments (id) ON DELETE CASCADE,
  user_id                         uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  
  -- Pre: emotional state
  pre_emotional_state_score       smallint NOT NULL CHECK (pre_emotional_state_score BETWEEN 1 AND 5),
  pre_emotional_state_label       text,
  
  -- Pre: cognitive readiness
  pre_cognitive_readiness_score   smallint NOT NULL CHECK (pre_cognitive_readiness_score BETWEEN 1 AND 5),
  
  -- Pre: context familiarity
  pre_context_familiarity_score   smallint NOT NULL CHECK (pre_context_familiarity_score BETWEEN 1 AND 5),
  
  -- Pre: role clarity
  pre_role_clarity_score          smallint NOT NULL CHECK (pre_role_clarity_score BETWEEN 1 AND 5),
  
  -- Pre: focus/intention
  pre_focus_ecci_domains          smallint[] DEFAULT '{}',
  pre_focus_free_text             text,
  
  -- Pre: AI/avatars
  pre_ai_involvement_expected     ai_involvement_expected NOT NULL DEFAULT 'no',
  pre_ai_confidence_score         smallint CHECK (pre_ai_confidence_score BETWEEN 1 AND 5),
  
  created_at                      timestamptz DEFAULT now(),
  updated_at                      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_readiness_assignment_id ON readiness_checks (assignment_id);
CREATE INDEX IF NOT EXISTS idx_readiness_user_id ON readiness_checks (user_id);

-- 5. Quick Reflections Table (Post-Assignment)
CREATE TABLE IF NOT EXISTS quick_reflections (
  id                                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id                       uuid NOT NULL UNIQUE REFERENCES assignments (id) ON DELETE CASCADE,
  user_id                             uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  
  -- Load
  post_emotional_load_score           smallint NOT NULL CHECK (post_emotional_load_score BETWEEN 1 AND 5),
  post_cognitive_load_score           smallint NOT NULL CHECK (post_cognitive_load_score BETWEEN 1 AND 5),
  
  -- Meaning-making
  post_meaning_challenge_score          smallint NOT NULL CHECK (post_meaning_challenge_score BETWEEN 1 AND 5),
  post_meaning_challenge_tags         text[] DEFAULT '{}',
  
  -- Role-space/equi-partiality
  post_rolespace_challenge_score      smallint NOT NULL CHECK (post_rolespace_challenge_score BETWEEN 1 AND 5),
  post_rolespace_challenge_tags       text[] DEFAULT '{}',
  
  -- Cultural friction
  post_cultural_friction_score        smallint NOT NULL CHECK (post_cultural_friction_score BETWEEN 1 AND 5),
  post_cultural_friction_tags         text[] DEFAULT '{}',
  
  -- AI/Tech/Avatars impact
  post_ai_impact_score                smallint CHECK (post_ai_impact_score BETWEEN 1 AND 5),
  post_ai_issue_tags                  text[] DEFAULT '{}',
  
  -- Recovery & reflection
  post_recovery_actions               text[] DEFAULT '{}',
  post_recovery_other                 text,
  
  post_key_learning_text              text,
  post_key_learning_tags              text[] DEFAULT '{}',
  
  post_performance_confidence_score   smallint NOT NULL CHECK (post_performance_confidence_score BETWEEN 1 AND 5),
  post_reflection_depth_self_score    smallint NOT NULL CHECK (post_reflection_depth_self_score BETWEEN 1 AND 4),
  
  -- Optional: store per-assignment ERI once computed
  eri_assign_score                    smallint,
  eri_assign_raw                      numeric(5,4),
  
  created_at                          timestamptz DEFAULT now(),
  updated_at                          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quick_reflections_assignment_id ON quick_reflections (assignment_id);
CREATE INDEX IF NOT EXISTS idx_quick_reflections_user_id ON quick_reflections (user_id);

-- 6. Journaling Entries Table
CREATE TABLE IF NOT EXISTS journaling_entries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  assignment_id     uuid REFERENCES assignments (id) ON DELETE SET NULL,
  
  title             text,
  body              text NOT NULL,
  ecci_domain_ids   smallint[] DEFAULT '{}',
  tags              text[] DEFAULT '{}',
  
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journaling_user_id ON journaling_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_journaling_assignment_id ON journaling_entries (assignment_id);

-- 7. ERI Snapshots Table (User-Level)
CREATE TABLE IF NOT EXISTS eri_snapshots (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  
  eri_score         smallint,
  eri_band          eri_band NOT NULL DEFAULT 'insufficient_data',
  
  assignment_window integer NOT NULL DEFAULT 10,
  assignment_count  integer NOT NULL DEFAULT 0,
  
  computed_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eri_snapshots_user_id ON eri_snapshots (user_id);
CREATE INDEX IF NOT EXISTS idx_eri_snapshots_computed_at ON eri_snapshots (computed_at DESC);

-- 8. ERI Helper Functions and Views

-- Normalize function: 1-5 Likert to 0-1
CREATE OR REPLACE FUNCTION norm_1_5(score smallint)
RETURNS numeric AS $$
  SELECT CASE
    WHEN score IS NULL THEN NULL
    ELSE (score::numeric - 1.0) / 4.0
  END;
$$ LANGUAGE sql IMMUTABLE;

-- Per-Assignment ERI View
CREATE OR REPLACE VIEW assignment_eri AS
SELECT
  a.id                AS assignment_id,
  a.user_id,
  a.started_at,
  a.ended_at,

  rc.pre_emotional_state_score,
  rc.pre_cognitive_readiness_score,
  rc.pre_context_familiarity_score,
  rc.pre_role_clarity_score,
  rc.pre_ai_involvement_expected,
  rc.pre_ai_confidence_score,

  qr.post_emotional_load_score,
  qr.post_cognitive_load_score,
  qr.post_meaning_challenge_score,
  qr.post_rolespace_challenge_score,
  qr.post_cultural_friction_score,
  qr.post_ai_impact_score,
  qr.post_recovery_actions,
  qr.post_reflection_depth_self_score,

  -- PreR calculation
  CASE
    WHEN rc.pre_ai_involvement_expected IN ('yes','unsure') THEN
      0.20 * norm_1_5(rc.pre_emotional_state_score) +
      0.20 * norm_1_5(rc.pre_cognitive_readiness_score) +
      0.20 * norm_1_5(rc.pre_context_familiarity_score) +
      0.20 * norm_1_5(rc.pre_role_clarity_score) +
      0.20 * norm_1_5(rc.pre_ai_confidence_score)
    ELSE
      0.25 * norm_1_5(rc.pre_emotional_state_score) +
      0.25 * norm_1_5(rc.pre_cognitive_readiness_score) +
      0.25 * norm_1_5(rc.pre_context_familiarity_score) +
      0.25 * norm_1_5(rc.pre_role_clarity_score)
  END AS pre_readiness_score,

  -- Base strain calculation
  (
    0.18 * norm_1_5(qr.post_emotional_load_score) +
    0.18 * norm_1_5(qr.post_cognitive_load_score) +
    0.18 * norm_1_5(qr.post_meaning_challenge_score) +
    0.18 * norm_1_5(qr.post_rolespace_challenge_score) +
    0.18 * norm_1_5(qr.post_cultural_friction_score)
  ) AS base_strain_score,

  -- AI strain term
  CASE
    WHEN a.ai_used = true AND qr.post_ai_impact_score IS NOT NULL THEN
      0.10 * (1.0 - norm_1_5(qr.post_ai_impact_score))
    ELSE
      0.0
  END AS ai_strain_score,

  -- PostS = BaseS + AI_S (capped at 1)
  LEAST(
    (
      0.18 * norm_1_5(qr.post_emotional_load_score) +
      0.18 * norm_1_5(qr.post_cognitive_load_score) +
      0.18 * norm_1_5(qr.post_meaning_challenge_score) +
      0.18 * norm_1_5(qr.post_rolespace_challenge_score) +
      0.18 * norm_1_5(qr.post_cultural_friction_score)
    ) +
    CASE
      WHEN a.ai_used = true AND qr.post_ai_impact_score IS NOT NULL THEN
        0.10 * (1.0 - norm_1_5(qr.post_ai_impact_score))
      ELSE
        0.0
    END,
    1.0
  ) AS post_strain_score,

  -- Recovery & reflection factor RR
  (
    0.5 * CASE
      WHEN qr.post_recovery_actions && array['grounding','movement','debrief_peer','debrief_supervisor','journaling','rest']::text[]
        THEN 1.0 ELSE 0.0 END
    +
    0.5 * (
      (qr.post_reflection_depth_self_score::numeric - 1.0) / 3.0
    )
  ) AS recovery_reflection_score,

  -- ERI_assign_raw
  (
    0.4 *
      CASE
        WHEN rc.pre_ai_involvement_expected IN ('yes','unsure') THEN
          0.20 * norm_1_5(rc.pre_emotional_state_score) +
          0.20 * norm_1_5(rc.pre_cognitive_readiness_score) +
          0.20 * norm_1_5(rc.pre_context_familiarity_score) +
          0.20 * norm_1_5(rc.pre_role_clarity_score) +
          0.20 * norm_1_5(rc.pre_ai_confidence_score)
        ELSE
          0.25 * norm_1_5(rc.pre_emotional_state_score) +
          0.25 * norm_1_5(rc.pre_cognitive_readiness_score) +
          0.25 * norm_1_5(rc.pre_context_familiarity_score) +
          0.25 * norm_1_5(rc.pre_role_clarity_score)
      END
    +
    0.4 * (1.0 - LEAST(
      (
        0.18 * norm_1_5(qr.post_emotional_load_score) +
        0.18 * norm_1_5(qr.post_cognitive_load_score) +
        0.18 * norm_1_5(qr.post_meaning_challenge_score) +
        0.18 * norm_1_5(qr.post_rolespace_challenge_score) +
        0.18 * norm_1_5(qr.post_cultural_friction_score)
      ) +
      CASE
        WHEN a.ai_used = true AND qr.post_ai_impact_score IS NOT NULL THEN
          0.10 * (1.0 - norm_1_5(qr.post_ai_impact_score))
        ELSE
          0.0
      END,
      1.0
    ))
    +
    0.2 * (
      0.5 * CASE
        WHEN qr.post_recovery_actions && array['grounding','movement','debrief_peer','debrief_supervisor','journaling','rest']::text[]
          THEN 1.0 ELSE 0.0 END
      +
      0.5 * ((qr.post_reflection_depth_self_score::numeric - 1.0) / 3.0)
    )
  ) AS eri_assign_raw,

  ROUND(
    (
      0.4 *
        CASE
          WHEN rc.pre_ai_involvement_expected IN ('yes','unsure') THEN
            0.20 * norm_1_5(rc.pre_emotional_state_score) +
            0.20 * norm_1_5(rc.pre_cognitive_readiness_score) +
            0.20 * norm_1_5(rc.pre_context_familiarity_score) +
            0.20 * norm_1_5(rc.pre_role_clarity_score) +
            0.20 * norm_1_5(rc.pre_ai_confidence_score)
          ELSE
            0.25 * norm_1_5(rc.pre_emotional_state_score) +
            0.25 * norm_1_5(rc.pre_cognitive_readiness_score) +
            0.25 * norm_1_5(rc.pre_context_familiarity_score) +
            0.25 * norm_1_5(rc.pre_role_clarity_score)
        END
      +
      0.4 * (1.0 - LEAST(
        (
          0.18 * norm_1_5(qr.post_emotional_load_score) +
          0.18 * norm_1_5(qr.post_cognitive_load_score) +
          0.18 * norm_1_5(qr.post_meaning_challenge_score) +
          0.18 * norm_1_5(qr.post_rolespace_challenge_score) +
          0.18 * norm_1_5(qr.post_cultural_friction_score)
        ) +
        CASE
          WHEN a.ai_used = true AND qr.post_ai_impact_score IS NOT NULL THEN
            0.10 * (1.0 - norm_1_5(qr.post_ai_impact_score))
          ELSE
            0.0
        END,
        1.0
      ))
      +
      0.2 * (
        0.5 * CASE
          WHEN qr.post_recovery_actions && array['grounding','movement','debrief_peer','debrief_supervisor','journaling','rest']::text[]
            THEN 1.0 ELSE 0.0 END
        +
        0.5 * ((qr.post_reflection_depth_self_score::numeric - 1.0) / 3.0)
      )
    ) * 100.0
  )::smallint AS eri_assign_score
FROM
  assignments a
  JOIN readiness_checks rc ON rc.assignment_id = a.id
  JOIN quick_reflections qr ON qr.assignment_id = a.id;

-- User-Level ERI View (Last 10 Assignments)
CREATE OR REPLACE VIEW user_eri AS
WITH numbered AS (
  SELECT
    ae.*,
    row_number() OVER (
      PARTITION BY ae.user_id
      ORDER BY ae.ended_at DESC NULLS LAST, ae.started_at DESC
    ) AS rn
  FROM assignment_eri ae
),
recent AS (
  SELECT *
  FROM numbered
  WHERE rn <= 10
)
SELECT
  user_id,
  COUNT(*) AS assignment_count,
  AVG(eri_assign_score)::numeric(5,2) AS eri_score_avg,
  ROUND(AVG(eri_assign_score))::smallint AS eri_score_rounded,
  CASE
    WHEN COUNT(*) < 3 THEN 'insufficient_data'::eri_band
    WHEN ROUND(AVG(eri_assign_score)) >= 80 THEN 'stable'::eri_band
    WHEN ROUND(AVG(eri_assign_score)) >= 60 THEN 'watch'::eri_band
    ELSE 'at_risk'::eri_band
  END AS eri_band
FROM recent
GROUP BY user_id;

-- Row Level Security Policies
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE journaling_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE eri_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies for assignments
CREATE POLICY "Users can view own assignments" ON assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assignments" ON assignments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assignments" ON assignments
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for readiness_checks
CREATE POLICY "Users can view own readiness checks" ON readiness_checks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own readiness checks" ON readiness_checks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own readiness checks" ON readiness_checks
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for quick_reflections
CREATE POLICY "Users can view own quick reflections" ON quick_reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quick reflections" ON quick_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quick reflections" ON quick_reflections
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for journaling_entries
CREATE POLICY "Users can view own journal entries" ON journaling_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON journaling_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON journaling_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON journaling_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for eri_snapshots
CREATE POLICY "Users can view own ERI snapshots" ON eri_snapshots
  FOR SELECT USING (auth.uid() = user_id);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON assignments TO anon, authenticated;
GRANT INSERT ON assignments TO authenticated;
GRANT UPDATE ON assignments TO authenticated;

GRANT SELECT ON readiness_checks TO anon, authenticated;
GRANT INSERT ON readiness_checks TO authenticated;
GRANT UPDATE ON readiness_checks TO authenticated;

GRANT SELECT ON quick_reflections TO anon, authenticated;
GRANT INSERT ON quick_reflections TO authenticated;
GRANT UPDATE ON quick_reflections TO authenticated;

GRANT SELECT ON journaling_entries TO anon, authenticated;
GRANT INSERT ON journaling_entries TO authenticated;
GRANT UPDATE ON journaling_entries TO authenticated;
GRANT DELETE ON journaling_entries TO authenticated;

GRANT SELECT ON eri_snapshots TO anon, authenticated;
GRANT INSERT ON eri_snapshots TO authenticated;

GRANT SELECT ON assignment_eri TO anon, authenticated;
GRANT SELECT ON user_eri TO anon, authenticated;
GRANT SELECT ON ecci_domains TO anon, authenticated;