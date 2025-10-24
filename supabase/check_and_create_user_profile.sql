-- Check what profile tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%profile%';

-- Check if user_profiles table has any data
SELECT COUNT(*) as user_profiles_count FROM user_profiles;

-- Check if profiles table exists and has data
SELECT COUNT(*) as profiles_count FROM profiles;

-- Create a user_profiles entry for your user if it doesn't exist
-- Replace 'YOUR_EMAIL_HERE' with your actual email
INSERT INTO user_profiles (id, email, full_name, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  created_at,
  NOW() as updated_at
FROM auth.users
WHERE email = 'maddoxtwheeler@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Verify the entry was created
SELECT id, email, full_name, stripe_customer_id 
FROM user_profiles 
WHERE email = 'maddoxtwheeler@gmail.com';
