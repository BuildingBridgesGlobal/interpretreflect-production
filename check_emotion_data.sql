-- Check the exact format of emotion data
SELECT 
    id,
    entry_kind,
    data->>'emotions_identified' as emotions_raw,
    jsonb_typeof(data->'emotions_identified') as emotions_type,
    data
FROM reflection_entries
WHERE entry_kind = 'emotion-clarity'
ORDER BY created_at DESC
LIMIT 3;
