-- ============================================
-- CEU SYSTEM HELPER FUNCTIONS
-- Simplify common operations from API/UI
-- ============================================

-- ============================================
-- 1. ENROLL USER IN PROGRAM BY CODE
-- ============================================
-- Usage: SELECT enroll_user_in_program('IR-HMB-FOUNDATIONS-0.5', 'CI1234');
CREATE OR REPLACE FUNCTION enroll_user_in_program(
  p_program_code TEXT,
  p_rid_number TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS UUID AS $$
DECLARE
  v_program_id UUID;
  v_enrollment_id UUID;
BEGIN
  -- Get program ID from code
  SELECT id INTO v_program_id
  FROM ceu_programs
  WHERE program_code = p_program_code
    AND is_active = true;

  IF v_program_id IS NULL THEN
    RAISE EXCEPTION 'Program not found or inactive: %', p_program_code;
  END IF;

  -- Check if already enrolled
  SELECT id INTO v_enrollment_id
  FROM ceu_enrollments
  WHERE user_id = p_user_id
    AND program_id = v_program_id
    AND status != 'abandoned';

  IF v_enrollment_id IS NOT NULL THEN
    RAISE EXCEPTION 'User already enrolled in this program';
  END IF;

  -- Create enrollment
  INSERT INTO ceu_enrollments (
    user_id,
    program_id,
    rid_number,
    status
  ) VALUES (
    p_user_id,
    v_program_id,
    p_rid_number,
    'enrolled'
  )
  RETURNING id INTO v_enrollment_id;

  RETURN v_enrollment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. LOG CEU ACTIVITY
-- ============================================
-- Usage: SELECT log_ceu_activity(enrollment_id, 'reflection', 'BREATHE Protocol', reflection_id, 15);
CREATE OR REPLACE FUNCTION log_ceu_activity(
  p_enrollment_id UUID,
  p_activity_type TEXT,
  p_activity_name TEXT,
  p_reflection_id UUID DEFAULT NULL,
  p_time_spent_minutes INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
  v_user_id UUID;
BEGIN
  -- Verify enrollment belongs to current user
  SELECT user_id INTO v_user_id
  FROM ceu_enrollments
  WHERE id = p_enrollment_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Enrollment not found: %', p_enrollment_id;
  END IF;

  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to log activity for this enrollment';
  END IF;

  -- Create activity log entry
  INSERT INTO ceu_activity_log (
    enrollment_id,
    user_id,
    activity_type,
    activity_name,
    reflection_id,
    started_at,
    completed_at,
    time_spent_minutes,
    metadata
  ) VALUES (
    p_enrollment_id,
    v_user_id,
    p_activity_type,
    p_activity_name,
    p_reflection_id,
    NOW(),
    NOW(), -- Mark as completed immediately
    p_time_spent_minutes,
    p_metadata
  )
  RETURNING id INTO v_activity_id;

  -- Update enrollment total time
  UPDATE ceu_enrollments
  SET
    total_time_minutes = total_time_minutes + COALESCE(p_time_spent_minutes, 0),
    status = CASE
      WHEN status = 'enrolled' THEN 'in_progress'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_enrollment_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. COMPLETE ENROLLMENT & ISSUE CEU
-- ============================================
-- Usage: SELECT complete_enrollment_and_issue_ceu(enrollment_id);
CREATE OR REPLACE FUNCTION complete_enrollment_and_issue_ceu(
  p_enrollment_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_completion_id UUID;
  v_enrollment RECORD;
  v_program RECORD;
  v_learning_objectives JSONB;
BEGIN
  -- Get enrollment details
  SELECT
    e.user_id,
    e.program_id,
    e.rid_number,
    e.total_time_minutes,
    e.status
  INTO v_enrollment
  FROM ceu_enrollments e
  WHERE e.id = p_enrollment_id;

  IF v_enrollment IS NULL THEN
    RAISE EXCEPTION 'Enrollment not found: %', p_enrollment_id;
  END IF;

  -- Verify user owns this enrollment
  IF v_enrollment.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to complete this enrollment';
  END IF;

  -- Verify enrollment is in progress (not already completed)
  IF v_enrollment.status = 'completed' THEN
    RAISE EXCEPTION 'Enrollment already completed';
  END IF;

  -- Get program details
  SELECT
    p.ceu_value,
    p.category,
    p.ps_subcategory,
    p.estimated_hours,
    p.learning_objectives
  INTO v_program
  FROM ceu_programs p
  WHERE p.id = v_enrollment.program_id;

  -- Build learning objectives met (copy from program)
  v_learning_objectives := v_program.learning_objectives;

  -- Create completion record
  INSERT INTO ceu_completions (
    user_id,
    enrollment_id,
    program_id,
    rid_number,
    ceu_awarded,
    category,
    ps_subcategory,
    completion_date,
    contact_hours,
    learning_objectives_met,
    completion_evidence
  ) VALUES (
    v_enrollment.user_id,
    p_enrollment_id,
    v_enrollment.program_id,
    v_enrollment.rid_number,
    v_program.ceu_value,
    v_program.category,
    v_program.ps_subcategory,
    NOW(),
    v_program.estimated_hours,
    v_learning_objectives,
    jsonb_build_object(
      'total_time_minutes', v_enrollment.total_time_minutes,
      'completion_method', 'self_paced'
    )
  )
  RETURNING id INTO v_completion_id;

  -- Update enrollment status
  UPDATE ceu_enrollments
  SET
    status = 'completed',
    completion_date = NOW(),
    updated_at = NOW()
  WHERE id = p_enrollment_id;

  RETURN v_completion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. GET USER CEU PROGRESS
-- ============================================
-- Usage: SELECT * FROM get_user_ceu_progress();
CREATE OR REPLACE FUNCTION get_user_ceu_progress(
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS TABLE (
  total_ceus_earned NUMERIC,
  total_ceus_in_progress NUMERIC,
  enrollments_count INTEGER,
  completions_count INTEGER,
  total_time_hours NUMERIC,
  recent_activity JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(c.ceu_awarded), 0) as total_ceus_earned,
    COALESCE(SUM(
      CASE WHEN e.status IN ('enrolled', 'in_progress')
      THEN p.ceu_value
      ELSE 0
      END
    ), 0) as total_ceus_in_progress,
    COUNT(DISTINCT e.id)::INTEGER as enrollments_count,
    COUNT(DISTINCT c.id)::INTEGER as completions_count,
    ROUND(COALESCE(SUM(e.total_time_minutes), 0) / 60.0, 2) as total_time_hours,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'activity_type', al.activity_type,
          'activity_name', al.activity_name,
          'completed_at', al.completed_at,
          'time_spent_minutes', al.time_spent_minutes
        ) ORDER BY al.completed_at DESC
      )
      FROM ceu_activity_log al
      WHERE al.user_id = p_user_id
      LIMIT 5
    ) as recent_activity
  FROM ceu_enrollments e
  LEFT JOIN ceu_completions c ON c.enrollment_id = e.id
  LEFT JOIN ceu_programs p ON p.id = e.program_id
  WHERE e.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. GET ENROLLMENT PROGRESS
-- ============================================
-- Usage: SELECT * FROM get_enrollment_progress(enrollment_id);
CREATE OR REPLACE FUNCTION get_enrollment_progress(
  p_enrollment_id UUID
)
RETURNS TABLE (
  enrollment_id UUID,
  program_code TEXT,
  program_title TEXT,
  ceu_value NUMERIC,
  status TEXT,
  enrolled_at TIMESTAMPTZ,
  total_time_minutes INTEGER,
  required_activities JSONB,
  completed_activities JSONB,
  progress_percentage INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id as enrollment_id,
    p.program_code,
    p.title as program_title,
    p.ceu_value,
    e.status,
    e.enrolled_at,
    e.total_time_minutes,
    p.required_reflections as required_activities,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'activity_name', al.activity_name,
          'activity_type', al.activity_type,
          'completed_at', al.completed_at,
          'time_spent_minutes', al.time_spent_minutes
        ) ORDER BY al.completed_at
      )
      FROM ceu_activity_log al
      WHERE al.enrollment_id = e.id
    ) as completed_activities,
    CASE
      WHEN e.status = 'completed' THEN 100
      WHEN p.required_reflections IS NULL THEN 0
      ELSE LEAST(100, ROUND(
        (
          (SELECT COUNT(*)::NUMERIC FROM ceu_activity_log WHERE enrollment_id = e.id)
          / GREATEST(1, jsonb_array_length(p.required_reflections))
        ) * 100
      )::INTEGER)
    END as progress_percentage
  FROM ceu_enrollments e
  JOIN ceu_programs p ON p.id = e.program_id
  WHERE e.id = p_enrollment_id
    AND e.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION enroll_user_in_program(TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_ceu_activity(UUID, TEXT, TEXT, UUID, INTEGER, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_enrollment_and_issue_ceu(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_ceu_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_enrollment_progress(UUID) TO authenticated;

-- ============================================
-- COMPLETED
-- ============================================
