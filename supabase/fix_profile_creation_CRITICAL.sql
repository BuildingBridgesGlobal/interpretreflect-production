-- ============================================
-- CRITICAL FIX: PROFILE CREATION FOR NEW USERS
-- ============================================
-- Your app uses TWO profile tables:
-- 1. profiles - subscription status, admin, trial (PRIMARY)
-- 2. user_profiles - settings, accessibility, name (SECONDARY)
--
-- New users weren't getting entries in the 'profiles' table!
-- This fix ensures BOTH tables get populated on signup.

-- ============================================
-- STEP 1: Ensure profiles table exists with correct structure
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  subscription_status TEXT,
  subscription_tier TEXT,
  subscription_interval TEXT,
  trial_started_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT UNIQUE,
  onboarding_completed BOOLEAN DEFAULT false,
  dismissed_onboarding_tips TEXT[] DEFAULT ARRAY[]::TEXT[],
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add any missing columns to existing profiles table
DO $ 
BEGIN
  -- Add email if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;

  -- Add full_name if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;

  -- Add is_admin if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;

  -- Add subscription_status if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_status TEXT;
  END IF;

  -- Add trial_started_at if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trial_started_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN trial_started_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add trial_ends_at if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $;

-- ============================================
-- STEP 2: Enable RLS on profiles
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role has full access" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create policies
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role has full access" 
ON public.profiles 
FOR ALL 
USING (auth.role() = 'service_role');

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- ============================================
-- STEP 3: Drop ALL existing user creation triggers
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profiles ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- ============================================
-- STEP 4: Create comprehensive user creation function
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $
BEGIN
  -- 1. Create entry in profiles table (PRIMARY - REQUIRED)
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    is_admin,
    subscription_status,
    trial_started_at,
    trial_ends_at,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    false,
    'trial',
    NOW(),
    NOW() + INTERVAL '14 days',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  -- 2. Create entry in user_profiles table (SECONDARY - if exists)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) THEN
    -- Check if user_profiles uses user_id or id
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'user_id'
    ) THEN
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

  -- 3. Create entry in user_preferences table (if exists)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_preferences'
  ) THEN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- ============================================
-- STEP 5: Create trigger
-- ============================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 6: Backfill missing profiles for existing users
-- ============================================

-- Backfill profiles table (PRIMARY)
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  is_admin,
  subscription_status,
  trial_started_at,
  trial_ends_at,
  created_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  false,
  'trial',
  u.created_at,
  u.created_at + INTERVAL '14 days',
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Backfill user_profiles table (SECONDARY)
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
-- STEP 7: Verify the fix
-- ============================================

-- Show summary
DO $
DECLARE
  total_users INTEGER;
  users_with_profiles INTEGER;
  users_with_user_profiles INTEGER;
  users_with_preferences INTEGER;
  missing_profiles INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM auth.users;
  SELECT COUNT(*) INTO users_with_profiles FROM public.profiles;
  
  SELECT COUNT(DISTINCT COALESCE(up.user_id, up.id)) INTO users_with_user_profiles 
  FROM public.user_profiles up;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
    SELECT COUNT(*) INTO users_with_preferences FROM public.user_preferences;
  ELSE
    users_with_preferences := 0;
  END IF;
  
  missing_profiles := total_users - users_with_profiles;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PROFILE CREATION FIX - SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total users: %', total_users;
  RAISE NOTICE 'Users with profiles: %', users_with_profiles;
  RAISE NOTICE 'Users with user_profiles: %', users_with_user_profiles;
  RAISE NOTICE 'Users with preferences: %', users_with_preferences;
  RAISE NOTICE '';
  
  IF missing_profiles = 0 THEN
    RAISE NOTICE '✅ ALL USERS HAVE PROFILES!';
  ELSE
    RAISE WARNING '❌ % users still missing profiles!', missing_profiles;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Trigger status: ACTIVE';
  RAISE NOTICE 'New signups will automatically create profiles.';
  RAISE NOTICE '========================================';
END $;

-- Show recent users and their profile status
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as has_profile,
  p.subscription_status,
  p.trial_ends_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;
