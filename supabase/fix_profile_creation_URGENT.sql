-- ============================================
-- URGENT FIX: PROFILE CREATION FOR NEW USERS
-- ============================================
-- This fixes the issue where new users don't get profiles created
-- Run this immediately to restore user registration

-- ============================================
-- STEP 1: Determine which table structure we have
-- ============================================

DO $
DECLARE
  has_user_profiles BOOLEAN;
  has_profiles BOOLEAN;
  user_profiles_uses_user_id BOOLEAN := false;
  profiles_uses_id BOOLEAN := false;
BEGIN
  -- Check if user_profiles table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
  ) INTO has_user_profiles;

  -- Check if profiles table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) INTO has_profiles;

  -- Check user_profiles structure
  IF has_user_profiles THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'user_id'
    ) INTO user_profiles_uses_user_id;
  END IF;

  -- Check profiles structure
  IF has_profiles THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'id'
      AND is_nullable = 'NO'
    ) INTO profiles_uses_id;
  END IF;

  RAISE NOTICE 'Table status:';
  RAISE NOTICE '  user_profiles exists: %', has_user_profiles;
  RAISE NOTICE '  user_profiles uses user_id: %', user_profiles_uses_user_id;
  RAISE NOTICE '  profiles exists: %', has_profiles;
  RAISE NOTICE '  profiles uses id: %', profiles_uses_id;
END $;

-- ============================================
-- STEP 2: Drop conflicting triggers
-- ============================================

-- Drop all existing profile creation triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;

-- ============================================
-- STEP 3: Create unified profile creation function
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
DECLARE
  has_user_profiles BOOLEAN;
  has_profiles BOOLEAN;
  user_profiles_uses_user_id BOOLEAN := false;
BEGIN
  -- Check which tables exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) INTO has_user_profiles;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) INTO has_profiles;

  -- Check user_profiles structure
  IF has_user_profiles THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'user_id'
    ) INTO user_profiles_uses_user_id;
  END IF;

  -- Insert into user_profiles if it exists
  IF has_user_profiles THEN
    IF user_profiles_uses_user_id THEN
      -- user_profiles with user_id column
      INSERT INTO public.user_profiles (user_id, full_name, email)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email
      )
      ON CONFLICT (user_id) DO NOTHING;
    ELSE
      -- user_profiles with id as primary key
      INSERT INTO public.user_profiles (id, full_name, email)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;

  -- Insert into profiles if it exists (and is different from user_profiles)
  IF has_profiles AND NOT (has_user_profiles AND NOT user_profiles_uses_user_id) THEN
    INSERT INTO public.profiles (id, email, full_name, is_admin, subscription_status)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      false,
      'trial'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Insert into user_preferences if table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_preferences'
  ) THEN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 4: Create new trigger
-- ============================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 5: Backfill missing profiles
-- ============================================

-- Backfill user_profiles for users who don't have one
DO $
DECLARE
  has_user_profiles BOOLEAN;
  user_profiles_uses_user_id BOOLEAN := false;
  missing_count INTEGER := 0;
BEGIN
  -- Check if user_profiles exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) INTO has_user_profiles;

  IF has_user_profiles THEN
    -- Check structure
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'user_id'
    ) INTO user_profiles_uses_user_id;

    IF user_profiles_uses_user_id THEN
      -- Backfill with user_id structure
      INSERT INTO public.user_profiles (user_id, full_name, email)
      SELECT 
        u.id,
        COALESCE(u.raw_user_meta_data->>'full_name', u.email),
        u.email
      FROM auth.users u
      LEFT JOIN public.user_profiles up ON u.id = up.user_id
      WHERE up.user_id IS NULL
      ON CONFLICT (user_id) DO NOTHING;
      
      GET DIAGNOSTICS missing_count = ROW_COUNT;
    ELSE
      -- Backfill with id structure
      INSERT INTO public.user_profiles (id, full_name, email)
      SELECT 
        u.id,
        COALESCE(u.raw_user_meta_data->>'full_name', u.email),
        u.email
      FROM auth.users u
      LEFT JOIN public.user_profiles up ON u.id = up.id
      WHERE up.id IS NULL
      ON CONFLICT (id) DO NOTHING;
      
      GET DIAGNOSTICS missing_count = ROW_COUNT;
    END IF;

    RAISE NOTICE 'Backfilled % missing user_profiles', missing_count;
  END IF;
END $;

-- Backfill profiles table if it exists
DO $
DECLARE
  has_profiles BOOLEAN;
  missing_count INTEGER := 0;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) INTO has_profiles;

  IF has_profiles THEN
    INSERT INTO public.profiles (id, email, full_name, is_admin, subscription_status)
    SELECT 
      u.id,
      u.email,
      COALESCE(u.raw_user_meta_data->>'full_name', u.email),
      false,
      'trial'
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL
    ON CONFLICT (id) DO NOTHING;
    
    GET DIAGNOSTICS missing_count = ROW_COUNT;
    RAISE NOTICE 'Backfilled % missing profiles', missing_count;
  END IF;
END $;

-- Backfill user_preferences
DO $
DECLARE
  missing_count INTEGER := 0;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_preferences'
  ) THEN
    INSERT INTO public.user_preferences (user_id)
    SELECT u.id
    FROM auth.users u
    LEFT JOIN public.user_preferences up ON u.id = up.user_id
    WHERE up.user_id IS NULL
    ON CONFLICT (user_id) DO NOTHING;
    
    GET DIAGNOSTICS missing_count = ROW_COUNT;
    RAISE NOTICE 'Backfilled % missing user_preferences', missing_count;
  END IF;
END $;

-- ============================================
-- STEP 6: Verify the fix
-- ============================================

-- Show summary of users and their profiles
SELECT 
  'Summary' as report,
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT up.user_id) as users_with_user_profiles,
  COUNT(DISTINCT p.id) as users_with_profiles,
  COUNT(DISTINCT pref.user_id) as users_with_preferences
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id OR u.id = up.id
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_preferences pref ON u.id = pref.user_id;

-- Show recent users and their profile status
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE 
    WHEN up.user_id IS NOT NULL OR up.id IS NOT NULL THEN '✅'
    ELSE '❌'
  END as has_user_profile,
  CASE 
    WHEN p.id IS NOT NULL THEN '✅'
    ELSE '❌'
  END as has_profile,
  CASE 
    WHEN pref.user_id IS NOT NULL THEN '✅'
    ELSE '❌'
  END as has_preferences
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id OR u.id = up.id
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_preferences pref ON u.id = pref.user_id
ORDER BY u.created_at DESC
LIMIT 10;

-- ============================================
-- COMPLETE
-- ============================================

SELECT '✅ Profile creation fix applied successfully!' as status;
SELECT 'New users will now automatically get profiles created.' as next_step;
SELECT 'Existing users without profiles have been backfilled.' as backfill_status;
