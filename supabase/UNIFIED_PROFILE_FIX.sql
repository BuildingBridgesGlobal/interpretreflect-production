-- ============================================
-- UNIFIED PROFILE TABLE FIX
-- ============================================
-- This migration:
-- 1. Merges user_profiles into profiles (ONE table)
-- 2. Fixes the signup trigger
-- 3. Prevents duplicate Stripe customers
-- 4. Backfills all missing data

-- ============================================
-- STEP 1: Ensure profiles table has ALL columns
-- ============================================

-- Create profiles table with ALL fields from both tables
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary key (matches auth.users.id)
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  
  -- Basic info (from both tables)
  email TEXT,
  full_name TEXT,
  
  -- Subscription & billing (from profiles)
  is_admin BOOLEAN DEFAULT false,
  subscription_status TEXT,
  subscription_tier TEXT,
  subscription_interval TEXT,
  trial_started_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT UNIQUE, -- CRITICAL: prevents duplicate Stripe customers
  
  -- Profile settings (from user_profiles)
  pronouns TEXT,
  credentials TEXT[],
  language_preference TEXT DEFAULT 'en',
  profile_photo_url TEXT,
  avatar_url TEXT,
  
  -- Accessibility (from user_profiles)
  accessibility_settings JSONB DEFAULT '{"larger_text": false, "high_contrast": false, "reduce_motion": false}'::jsonb,
  high_contrast BOOLEAN DEFAULT false,
  larger_text BOOLEAN DEFAULT false,
  
  -- Privacy & terms
  privacy_settings JSONB DEFAULT '{}'::jsonb,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  dismissed_onboarding_tips TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add any missing columns to existing profiles table
DO $ 
BEGIN
  -- Email
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;

  -- Full name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;

  -- Pronouns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'pronouns') THEN
    ALTER TABLE public.profiles ADD COLUMN pronouns TEXT;
  END IF;

  -- Credentials
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'credentials') THEN
    ALTER TABLE public.profiles ADD COLUMN credentials TEXT[];
  END IF;

  -- Language preference
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'language_preference') THEN
    ALTER TABLE public.profiles ADD COLUMN language_preference TEXT DEFAULT 'en';
  END IF;

  -- Avatar URL
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;

  -- Profile photo URL
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_photo_url') THEN
    ALTER TABLE public.profiles ADD COLUMN profile_photo_url TEXT;
  END IF;

  -- Accessibility settings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'accessibility_settings') THEN
    ALTER TABLE public.profiles ADD COLUMN accessibility_settings JSONB DEFAULT '{"larger_text": false, "high_contrast": false, "reduce_motion": false}'::jsonb;
  END IF;

  -- High contrast
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'high_contrast') THEN
    ALTER TABLE public.profiles ADD COLUMN high_contrast BOOLEAN DEFAULT false;
  END IF;

  -- Larger text
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'larger_text') THEN
    ALTER TABLE public.profiles ADD COLUMN larger_text BOOLEAN DEFAULT false;
  END IF;

  -- Privacy settings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'privacy_settings') THEN
    ALTER TABLE public.profiles ADD COLUMN privacy_settings JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Is admin
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
    ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;

  -- Subscription status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_status TEXT;
  END IF;

  -- Subscription tier
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_tier') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_tier TEXT;
  END IF;

  -- Trial dates
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'trial_started_at') THEN
    ALTER TABLE public.profiles ADD COLUMN trial_started_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'trial_ends_at') THEN
    ALTER TABLE public.profiles ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Stripe customer ID (CRITICAL for preventing duplicates)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT UNIQUE;
  END IF;

  -- Onboarding
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'dismissed_onboarding_tips') THEN
    ALTER TABLE public.profiles ADD COLUMN dismissed_onboarding_tips TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;

  -- Terms accepted
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'terms_accepted_at') THEN
    ALTER TABLE public.profiles ADD COLUMN terms_accepted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $;

-- Create index on stripe_customer_id for fast lookups (prevents duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON public.profiles(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON public.profiles(email);

-- ============================================
-- STEP 2: Merge data from user_profiles into profiles
-- ============================================

DO $
DECLARE
  has_user_profiles BOOLEAN;
  user_profiles_uses_user_id BOOLEAN := false;
  merged_count INTEGER := 0;
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

    -- Merge data based on structure
    IF user_profiles_uses_user_id THEN
      -- user_profiles with user_id column
      UPDATE public.profiles p
      SET
        full_name = COALESCE(p.full_name, up.full_name),
        pronouns = COALESCE(p.pronouns, up.pronouns),
        credentials = COALESCE(p.credentials, up.credentials),
        language_preference = COALESCE(p.language_preference, up.language_preference),
        avatar_url = COALESCE(p.avatar_url, up.avatar_url),
        profile_photo_url = COALESCE(p.profile_photo_url, up.profile_photo_url),
        accessibility_settings = COALESCE(p.accessibility_settings, up.accessibility_settings),
        high_contrast = COALESCE(p.high_contrast, up.high_contrast),
        larger_text = COALESCE(p.larger_text, up.larger_text),
        privacy_settings = COALESCE(p.privacy_settings, up.privacy_settings),
        updated_at = NOW()
      FROM public.user_profiles up
      WHERE p.id = up.user_id
        AND (
          p.full_name IS NULL OR
          p.pronouns IS NULL OR
          p.credentials IS NULL OR
          p.language_preference IS NULL OR
          p.avatar_url IS NULL OR
          p.accessibility_settings IS NULL
        );
      
      GET DIAGNOSTICS merged_count = ROW_COUNT;
    ELSE
      -- user_profiles with id as primary key
      UPDATE public.profiles p
      SET
        full_name = COALESCE(p.full_name, up.full_name),
        pronouns = COALESCE(p.pronouns, up.pronouns),
        credentials = COALESCE(p.credentials, up.credentials),
        language_preference = COALESCE(p.language_preference, up.language_preference),
        avatar_url = COALESCE(p.avatar_url, up.avatar_url),
        profile_photo_url = COALESCE(p.profile_photo_url, up.profile_photo_url),
        accessibility_settings = COALESCE(p.accessibility_settings, up.accessibility_settings),
        high_contrast = COALESCE(p.high_contrast, up.high_contrast),
        larger_text = COALESCE(p.larger_text, up.larger_text),
        privacy_settings = COALESCE(p.privacy_settings, up.privacy_settings),
        stripe_customer_id = COALESCE(p.stripe_customer_id, up.stripe_customer_id),
        updated_at = NOW()
      FROM public.user_profiles up
      WHERE p.id = up.id
        AND (
          p.full_name IS NULL OR
          p.pronouns IS NULL OR
          p.credentials IS NULL OR
          p.language_preference IS NULL OR
          p.avatar_url IS NULL OR
          p.accessibility_settings IS NULL OR
          p.stripe_customer_id IS NULL
        );
      
      GET DIAGNOSTICS merged_count = ROW_COUNT;
    END IF;

    RAISE NOTICE 'Merged % records from user_profiles into profiles', merged_count;
  END IF;
END $;

-- ============================================
-- STEP 3: Enable RLS and create policies
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role has full access" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create comprehensive policies
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
-- STEP 4: Drop ALL existing triggers
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profiles ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- ============================================
-- STEP 5: Create ONE unified trigger function
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $
BEGIN
  -- Create profile entry (ONE table, all data)
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    is_admin,
    subscription_status,
    trial_started_at,
    trial_ends_at,
    language_preference,
    accessibility_settings,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    false,
    'trial',
    NOW(),
    NOW() + INTERVAL '14 days',
    'en',
    '{"larger_text": false, "high_contrast": false, "reduce_motion": false}'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    updated_at = NOW();

  -- Also create user_preferences if that table exists
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
    -- Log error but don't fail user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- ============================================
-- STEP 6: Create trigger
-- ============================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 7: Backfill missing profiles
-- ============================================

INSERT INTO public.profiles (
  id,
  email,
  full_name,
  is_admin,
  subscription_status,
  trial_started_at,
  trial_ends_at,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  false,
  'trial',
  u.created_at,
  u.created_at + INTERVAL '14 days',
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 8: Create updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- ============================================
-- STEP 9: Verification
-- ============================================

DO $
DECLARE
  total_users INTEGER;
  users_with_profiles INTEGER;
  missing_profiles INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM auth.users;
  SELECT COUNT(*) INTO users_with_profiles FROM public.profiles;
  missing_profiles := total_users - users_with_profiles;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'UNIFIED PROFILE TABLE - COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total users: %', total_users;
  RAISE NOTICE 'Users with profiles: %', users_with_profiles;
  RAISE NOTICE 'Missing profiles: %', missing_profiles;
  RAISE NOTICE '';
  
  IF missing_profiles = 0 THEN
    RAISE NOTICE '✅ ALL USERS HAVE PROFILES!';
  ELSE
    RAISE WARNING '❌ % users still missing profiles!', missing_profiles;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Benefits:';
  RAISE NOTICE '  ✅ ONE unified profiles table';
  RAISE NOTICE '  ✅ Prevents duplicate Stripe customers';
  RAISE NOTICE '  ✅ Automatic profile creation on signup';
  RAISE NOTICE '  ✅ 14-day trial starts automatically';
  RAISE NOTICE '========================================';
END $;

-- Show recent users
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.subscription_status,
  p.stripe_customer_id,
  CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as has_profile
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;
