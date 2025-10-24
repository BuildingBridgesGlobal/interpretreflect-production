-- Add stripe_customer_id to user_profiles table if it doesn't exist
-- This ensures the Cancel Subscription feature works properly

-- First, check if user_profiles table exists, if not create it
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  profile_photo_url TEXT,
  accessibility_settings JSONB DEFAULT '{"larger_text": false, "high_contrast": false, "reduce_motion": false}'::jsonb,
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT,
  subscription_tier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add stripe_customer_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN stripe_customer_id TEXT UNIQUE;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id 
ON public.user_profiles(stripe_customer_id);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Allow users to read their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" 
    ON public.user_profiles 
    FOR SELECT 
    USING (auth.uid() = id);
  END IF;

  -- Allow users to update their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" 
    ON public.user_profiles 
    FOR UPDATE 
    USING (auth.uid() = id);
  END IF;

  -- Allow users to insert their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" 
    ON public.user_profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);
  END IF;

  -- Allow service role full access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Service role has full access'
  ) THEN
    CREATE POLICY "Service role has full access" 
    ON public.user_profiles 
    FOR ALL 
    USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN public.user_profiles.stripe_customer_id IS 'Stripe customer ID for subscription management';
