-- Simple query to wake up Supabase if it's sleeping
-- Run this to ensure your database is active

SELECT NOW() as current_time, 
       version() as postgres_version,
       current_database() as database_name;

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
