-- ============================================
-- TOTAL ACTIVITIES TRACKING SYSTEM
-- ============================================

-- This builds on existing tables: reflections and burnout_assessments
-- We'll create a view to count all activities

-- 1. Create techniques table if you want to track reset techniques
CREATE TABLE IF NOT EXISTS techniques_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    technique_name TEXT,
    completed BOOLEAN DEFAULT false,
    duration INTEGER, -- in seconds
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_techniques_user_date
ON techniques_usage(user_id, created_at DESC);

-- 3. Enable RLS on techniques table
ALTER TABLE techniques_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own techniques" ON techniques_usage;
DROP POLICY IF EXISTS "Users can insert own techniques" ON techniques_usage;

-- Create policies for techniques
CREATE POLICY "Users can view own techniques" ON techniques_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own techniques" ON techniques_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Create a comprehensive view for all user activities
CREATE OR REPLACE VIEW user_total_activities AS
SELECT
    user_id,
    -- Count reflections
    (SELECT COUNT(*) FROM reflections WHERE reflections.user_id = u.id) as reflection_count,
    -- Count burnout assessments
    (SELECT COUNT(*) FROM burnout_assessments WHERE burnout_assessments.user_id = u.id) as assessment_count,
    -- Count techniques (if table exists)
    (SELECT COUNT(*) FROM techniques_usage WHERE techniques_usage.user_id = u.id AND completed = true) as technique_count,
    -- Total of all activities
    (
        (SELECT COUNT(*) FROM reflections WHERE reflections.user_id = u.id) +
        (SELECT COUNT(*) FROM burnout_assessments WHERE burnout_assessments.user_id = u.id) +
        (SELECT COUNT(*) FROM techniques_usage WHERE techniques_usage.user_id = u.id AND completed = true)
    ) as total_activities,
    -- Last activity date
    GREATEST(
        (SELECT MAX(created_at) FROM reflections WHERE reflections.user_id = u.id),
        (SELECT MAX(assessment_date) FROM burnout_assessments WHERE burnout_assessments.user_id = u.id),
        (SELECT MAX(created_at) FROM techniques_usage WHERE techniques_usage.user_id = u.id)
    ) as last_activity
FROM auth.users u;

-- 5. Grant access to the view
GRANT SELECT ON user_total_activities TO authenticated;

-- 6. Create a function to get total activities for a user
CREATE OR REPLACE FUNCTION get_total_activities(p_user_id UUID)
RETURNS TABLE(
    reflection_count INTEGER,
    assessment_count INTEGER,
    technique_count INTEGER,
    total_activities INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CAST(COUNT(DISTINCT r.id) AS INTEGER) as reflection_count,
        CAST(COUNT(DISTINCT b.id) AS INTEGER) as assessment_count,
        CAST(COUNT(DISTINCT t.id) AS INTEGER) as technique_count,
        CAST(
            COUNT(DISTINCT r.id) +
            COUNT(DISTINCT b.id) +
            COUNT(DISTINCT t.id)
        AS INTEGER) as total_activities
    FROM auth.users u
    LEFT JOIN reflections r ON r.user_id = u.id
    LEFT JOIN burnout_assessments b ON b.user_id = u.id
    LEFT JOIN techniques_usage t ON t.user_id = u.id AND t.completed = true
    WHERE u.id = p_user_id
    GROUP BY u.id;
END;
$$ LANGUAGE plpgsql;

-- 7. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_total_activities(UUID) TO authenticated;

-- 8. Create a simpler function if techniques table doesn't exist
CREATE OR REPLACE FUNCTION get_activities_simple(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_total INTEGER := 0;
    v_reflections INTEGER := 0;
    v_assessments INTEGER := 0;
BEGIN
    -- Count reflections
    SELECT COUNT(*) INTO v_reflections
    FROM reflections
    WHERE user_id = p_user_id;

    -- Count burnout assessments
    SELECT COUNT(*) INTO v_assessments
    FROM burnout_assessments
    WHERE user_id = p_user_id;

    v_total := v_reflections + v_assessments;

    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- 9. Grant execute permission
GRANT EXECUTE ON FUNCTION get_activities_simple(UUID) TO authenticated;