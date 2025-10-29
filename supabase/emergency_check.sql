-- EMERGENCY CHECK: Do ANY profiles exist?
SELECT COUNT(*) as total_profiles FROM profiles;

-- Do ANY users exist?
SELECT COUNT(*) as total_users FROM auth.users;

-- Show ALL profiles (if any)
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 10;

-- Show ALL users (if any)
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- Check if trigger exists
SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';

-- Check if profiles table exists
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles';
