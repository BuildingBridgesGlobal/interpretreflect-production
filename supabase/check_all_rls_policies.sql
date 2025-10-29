-- Check all RLS policies for potential circular references
-- Look for policies that query the same table they're protecting

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    -- Look for subqueries that might reference the same table
    qual LIKE '%FROM ' || tablename || '%'
    OR qual LIKE '%JOIN ' || tablename || '%'
  )
ORDER BY tablename, policyname;
