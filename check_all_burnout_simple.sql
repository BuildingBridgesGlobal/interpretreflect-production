-- Check ALL burnout assessments (no user filter)
SELECT * FROM burnout_assessments ORDER BY created_at DESC LIMIT 10;

-- Count total rows
SELECT COUNT(*) as total_rows FROM burnout_assessments;

-- Check if the table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'burnout_assessments'
ORDER BY ordinal_position;
