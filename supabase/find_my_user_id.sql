-- Find your actual user ID from auth.users
-- Run this while logged into your app in another tab

-- Option 1: Find by email (replace with your email)
SELECT id, email, created_at 
FROM auth.users 
WHERE email ILIKE '%YOUR_EMAIL%'
ORDER BY created_at DESC;

-- Option 2: See all users (if you have few users)
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- Option 3: Check if you have a user_profiles entry
SELECT id, email, full_name 
FROM user_profiles 
ORDER BY created_at DESC
LIMIT 10;
