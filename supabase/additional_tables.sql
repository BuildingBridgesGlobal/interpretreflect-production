-- Additional tables for complete InterpretReflect functionality
-- Run this after create_tables.sql

-- =====================================================
-- USER_PROFILES TABLE (Extended profile information)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  pronouns TEXT,
  credentials TEXT[],
  profile_photo_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  accessibility_settings JSONB DEFAULT '{"larger_text": false, "high_contrast": false, "reduce_motion": false, "screen_reader": false}'::jsonb,
  bio TEXT,
  years_experience INTEGER DEFAULT 0,
  specializations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- BODY_CHECKINS TABLE (Body Check-In Trends data)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.body_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tension_level INTEGER CHECK (tension_level >= 1 AND tension_level <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  mood_level INTEGER CHECK (mood_level >= 1 AND mood_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  overall_feeling INTEGER CHECK (overall_feeling >= 1 AND overall_feeling <= 10),
  notes TEXT,
  body_areas JSONB, -- Store specific body area tensions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.body_checkins ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own checkins" ON public.body_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own checkins" ON public.body_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins" ON public.body_checkins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkins" ON public.body_checkins
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- PRIVACY_SETTINGS TABLE (User privacy preferences)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analytics BOOLEAN DEFAULT true,
  notifications BOOLEAN DEFAULT true,
  team_visibility BOOLEAN DEFAULT false,
  research_participation BOOLEAN DEFAULT false,
  data_sharing_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own privacy settings" ON public.privacy_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own privacy settings" ON public.privacy_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own privacy settings" ON public.privacy_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- BREATHING_PRACTICES TABLE (Track breathing exercises)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.breathing_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_type TEXT NOT NULL,
  inhale_count INTEGER,
  pause_count INTEGER,
  exhale_count INTEGER,
  rest_count INTEGER,
  duration INTEGER,
  feeling_response TEXT,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
  session_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.breathing_practices ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own breathing practices" ON public.breathing_practices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own breathing practices" ON public.breathing_practices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- BODY_AWARENESS_SESSIONS TABLE (Body awareness exercises)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.body_awareness_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_type TEXT NOT NULL,
  duration INTEGER,
  focus_areas TEXT[],
  tension_areas TEXT[],
  ease_areas TEXT[],
  body_feeling TEXT,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
  emotional_state_before TEXT,
  emotional_state_after TEXT,
  session_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.body_awareness_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own body awareness sessions" ON public.body_awareness_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own body awareness sessions" ON public.body_awareness_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- QUICK_RESETS TABLE (Track quick stress reset activities)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.quick_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reset_type TEXT NOT NULL, -- 'breathing', 'movement', 'grounding', 'visualization'
  duration_seconds INTEGER,
  pre_stress_level INTEGER CHECK (pre_stress_level >= 1 AND pre_stress_level <= 10),
  post_stress_level INTEGER CHECK (post_stress_level >= 1 AND post_stress_level <= 10),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.quick_resets ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own quick resets" ON public.quick_resets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quick resets" ON public.quick_resets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- NOTIFICATIONS TABLE (Store user notifications)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'reminder', 'insight', 'achievement', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_body_checkins_user_id ON public.body_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_body_checkins_created_at ON public.body_checkins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON public.privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_breathing_practices_user_id ON public.breathing_practices(user_id);
CREATE INDEX IF NOT EXISTS idx_body_awareness_sessions_user_id ON public.body_awareness_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_resets_user_id ON public.quick_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, is_read);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON public.privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();