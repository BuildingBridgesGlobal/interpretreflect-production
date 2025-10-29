-- Test the exact query that useOrganizationRole is running
-- Replace with your user ID: 20701f05-2dc4-4740-a8a2-4a14c8974882
-- This is the query that's timing out
SELECT role,
    is_active,
    organization_id
FROM organization_members
WHERE user_id = '20701f05-2dc4-4740-a8a2-4a14c8974882'::uuid
    AND is_active = true
    AND role IN ('admin', 'owner');
-- Check if there are indexes
SELECT tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'organization_members';
-- Check table stats
SELECT schemaname,
    relname as tablename,
    n_live_tup as row_count,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE relname = 'organization_members';