-- =====================================================
-- Assignment Impact Scoring (AIS) Schema
-- Post-session emotional impact and cognitive load tracking
-- =====================================================
-- Fuels routing & recovery recommendations
-- Simple but powerful: two sliders + optional note

-- =====================================================
-- 1. Create assignment_impact_scores table
-- =====================================================
CREATE TABLE IF NOT EXISTS assignment_impact_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core Impact Metrics (1-10 scale)
  emotional_impact INTEGER NOT NULL CHECK (emotional_impact BETWEEN 1 AND 10),
  cognitive_load INTEGER NOT NULL CHECK (cognitive_load BETWEEN 1 AND 10),

  -- Assignment Context
  assignment_id TEXT,
  assignment_type TEXT CHECK (assignment_type IN (
    'medical', 'legal', 'educational', 'mental_health',
    'community', 'business', 'emergency', 'general'
  )),

  -- Optional Feedback
  notes TEXT,

  -- Derived Metrics
  total_impact INTEGER GENERATED ALWAYS AS ((emotional_impact + cognitive_load)) STORED,
  recovery_needed BOOLEAN GENERATED ALWAYS AS (
    (emotional_impact > 7 OR cognitive_load > 7)
  ) STORED,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ais_user ON assignment_impact_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_ais_created ON assignment_impact_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ais_impact ON assignment_impact_scores(total_impact DESC);
CREATE INDEX IF NOT EXISTS idx_ais_recovery ON assignment_impact_scores(recovery_needed) WHERE recovery_needed = true;

-- =====================================================
-- 2. Create recovery_recommendations table
-- =====================================================
CREATE TABLE IF NOT EXISTS recovery_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Recommended Actions
  recommendations TEXT[] NOT NULL,
  triggered_by TEXT, -- 'high_impact_scores', 'pattern_detection', 'manual'

  -- Status
  acknowledged BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,

  -- Related Score
  impact_score_id UUID REFERENCES assignment_impact_scores(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_recovery_user ON recovery_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_pending ON recovery_recommendations(acknowledged) WHERE acknowledged = false;

-- =====================================================
-- 3. Create aggregated impact metrics view
-- =====================================================
CREATE OR REPLACE VIEW user_impact_metrics AS
SELECT
  user_id,
  DATE(created_at) as date,
  COUNT(*) as sessions_count,
  ROUND(AVG(emotional_impact), 1) as avg_emotional_impact,
  ROUND(AVG(cognitive_load), 1) as avg_cognitive_load,
  MAX(emotional_impact) as peak_emotional_impact,
  MAX(cognitive_load) as peak_cognitive_load,
  COUNT(*) FILTER (WHERE recovery_needed = true) as high_impact_sessions,
  ROUND(
    COUNT(*) FILTER (WHERE recovery_needed = true)::DECIMAL /
    NULLIF(COUNT(*), 0) * 100,
    1
  ) as high_impact_percentage
FROM assignment_impact_scores
GROUP BY user_id, DATE(created_at);

-- =====================================================
-- 4. Functions for AIS Management
-- =====================================================

-- Function to get user's impact trend
CREATE OR REPLACE FUNCTION get_impact_trend(
  p_user_id UUID,
  p_days INTEGER DEFAULT 7
)
RETURNS JSON AS $$
BEGIN
  RETURN (
    WITH daily_scores AS (
      SELECT
        DATE(created_at) as date,
        ROUND(AVG(emotional_impact), 1) as avg_emotional,
        ROUND(AVG(cognitive_load), 1) as avg_cognitive,
        COUNT(*) as sessions
      FROM assignment_impact_scores
      WHERE user_id = p_user_id
        AND created_at > NOW() - (p_days || ' days')::INTERVAL
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    ),
    trend_analysis AS (
      SELECT
        CASE
          WHEN COUNT(*) < 2 THEN 'insufficient_data'
          WHEN AVG(avg_emotional) > 7 THEN 'high_emotional_impact'
          WHEN AVG(avg_cognitive) > 7 THEN 'high_cognitive_load'
          WHEN AVG(avg_emotional) < 4 AND AVG(avg_cognitive) < 4 THEN 'low_impact'
          ELSE 'moderate_impact'
        END as trend_status,
        ROUND(AVG(avg_emotional), 1) as overall_emotional,
        ROUND(AVG(avg_cognitive), 1) as overall_cognitive
      FROM daily_scores
    )
    SELECT json_build_object(
      'daily_scores', json_agg(row_to_json(daily_scores)),
      'trend', row_to_json(trend_analysis),
      'recommendation', CASE
        WHEN (SELECT trend_status FROM trend_analysis) = 'high_emotional_impact'
          THEN 'Consider emotional support resources'
        WHEN (SELECT trend_status FROM trend_analysis) = 'high_cognitive_load'
          THEN 'Schedule cognitive rest periods'
        WHEN (SELECT trend_status FROM trend_analysis) = 'low_impact'
          THEN 'Capacity for more complex assignments'
        ELSE 'Maintain current balance'
      END
    )
    FROM daily_scores, trend_analysis
    GROUP BY trend_analysis.*
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to generate recovery recommendations
CREATE OR REPLACE FUNCTION generate_recovery_recommendations(
  p_user_id UUID,
  p_emotional_impact INTEGER,
  p_cognitive_load INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_recommendations TEXT[];
  v_recommendation_id UUID;
BEGIN
  -- Build recommendations array based on scores
  v_recommendations := ARRAY[]::TEXT[];

  -- Emotional impact recommendations
  IF p_emotional_impact >= 9 THEN
    v_recommendations := array_append(v_recommendations, 'immediate_emotional_debrief');
    v_recommendations := array_append(v_recommendations, 'contact_support_person');
  ELSIF p_emotional_impact >= 7 THEN
    v_recommendations := array_append(v_recommendations, 'emotional_regulation_exercise');
    v_recommendations := array_append(v_recommendations, 'peer_support_check_in');
  ELSIF p_emotional_impact >= 5 THEN
    v_recommendations := array_append(v_recommendations, 'brief_emotional_reset');
  END IF;

  -- Cognitive load recommendations
  IF p_cognitive_load >= 9 THEN
    v_recommendations := array_append(v_recommendations, 'extended_cognitive_rest');
    v_recommendations := array_append(v_recommendations, 'postpone_complex_tasks');
  ELSIF p_cognitive_load >= 7 THEN
    v_recommendations := array_append(v_recommendations, 'cognitive_break_30min');
    v_recommendations := array_append(v_recommendations, 'simple_tasks_only');
  ELSIF p_cognitive_load >= 5 THEN
    v_recommendations := array_append(v_recommendations, 'brief_mental_reset');
  END IF;

  -- Combined high impact
  IF p_emotional_impact >= 7 AND p_cognitive_load >= 7 THEN
    v_recommendations := array_append(v_recommendations, 'full_recovery_protocol');
    v_recommendations := array_append(v_recommendations, 'supervisor_notification');
  END IF;

  -- Only create record if recommendations exist
  IF array_length(v_recommendations, 1) > 0 THEN
    INSERT INTO recovery_recommendations (
      user_id,
      recommendations,
      triggered_by
    ) VALUES (
      p_user_id,
      v_recommendations,
      'high_impact_scores'
    )
    RETURNING id INTO v_recommendation_id;
  END IF;

  RETURN v_recommendation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get assignment routing recommendation
CREATE OR REPLACE FUNCTION get_routing_recommendation(
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_recent_avg_emotional DECIMAL;
  v_recent_avg_cognitive DECIMAL;
  v_recovery_pending BOOLEAN;
BEGIN
  -- Get recent averages (last 5 assignments)
  SELECT
    AVG(emotional_impact),
    AVG(cognitive_load)
  INTO v_recent_avg_emotional, v_recent_avg_cognitive
  FROM (
    SELECT emotional_impact, cognitive_load
    FROM assignment_impact_scores
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 5
  ) recent_scores;

  -- Check for pending recovery
  SELECT EXISTS(
    SELECT 1
    FROM recovery_recommendations
    WHERE user_id = p_user_id
      AND acknowledged = false
      AND created_at > NOW() - INTERVAL '24 hours'
  ) INTO v_recovery_pending;

  RETURN json_build_object(
    'capacity_status', CASE
      WHEN v_recovery_pending THEN 'recovery_needed'
      WHEN v_recent_avg_emotional > 7 OR v_recent_avg_cognitive > 7 THEN 'limited_capacity'
      WHEN v_recent_avg_emotional < 4 AND v_recent_avg_cognitive < 4 THEN 'high_capacity'
      ELSE 'normal_capacity'
    END,
    'recommended_assignment_types', CASE
      WHEN v_recovery_pending THEN ARRAY['light', 'routine']
      WHEN v_recent_avg_emotional > 7 THEN ARRAY['low_emotional', 'technical']
      WHEN v_recent_avg_cognitive > 7 THEN ARRAY['simple', 'familiar']
      ELSE ARRAY['any']
    END,
    'max_complexity', CASE
      WHEN v_recovery_pending THEN 3
      WHEN v_recent_avg_emotional > 7 OR v_recent_avg_cognitive > 7 THEN 5
      ELSE 10
    END,
    'recent_emotional_avg', ROUND(v_recent_avg_emotional, 1),
    'recent_cognitive_avg', ROUND(v_recent_avg_cognitive, 1)
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 5. Enable Row Level Security
-- =====================================================
ALTER TABLE assignment_impact_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_recommendations ENABLE ROW LEVEL SECURITY;

-- Policies for assignment_impact_scores
CREATE POLICY "Users can manage own scores"
ON assignment_impact_scores FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for recovery_recommendations
CREATE POLICY "Users can view own recommendations"
ON recovery_recommendations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations"
ON recovery_recommendations FOR INSERT
WITH CHECK (true);

-- =====================================================
-- 6. Sample Queries
-- =====================================================

-- Get user's average impact over last week
/*
SELECT
  ROUND(AVG(emotional_impact), 1) as avg_emotional,
  ROUND(AVG(cognitive_load), 1) as avg_cognitive,
  COUNT(*) as total_sessions
FROM assignment_impact_scores
WHERE user_id = [USER_ID]
  AND created_at > NOW() - INTERVAL '7 days';
*/

-- Get high-impact sessions requiring recovery
/*
SELECT *
FROM assignment_impact_scores
WHERE user_id = [USER_ID]
  AND recovery_needed = true
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
*/

-- =====================================================
-- 7. Verification
-- =====================================================
SELECT
  'Assignment Impact Scoring Ready' as status,
  json_build_object(
    'tables_created', ARRAY[
      'assignment_impact_scores',
      'recovery_recommendations'
    ],
    'functions_created', ARRAY[
      'get_impact_trend',
      'generate_recovery_recommendations',
      'get_routing_recommendation'
    ],
    'features', ARRAY[
      'Two-slider impact tracking',
      'Optional notes',
      'Automatic recovery recommendations',
      'Assignment routing guidance',
      'Trend analysis',
      'Impact metrics view'
    ]
  ) as capabilities;

-- =====================================================
-- SUCCESS: AIS System Installed!
-- =====================================================
-- ✅ Simple two-slider interface
-- ✅ Tracks emotional impact & cognitive load
-- ✅ Generates recovery recommendations
-- ✅ Provides routing guidance
-- ✅ Historical trend analysis