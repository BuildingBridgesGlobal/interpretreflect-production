-- Check the actual structure of reflection_entries table
-- Run this in Supabase SQL Editor to see what columns exist

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name = 'reflection_entries'
ORDER BY
    ordinal_position;