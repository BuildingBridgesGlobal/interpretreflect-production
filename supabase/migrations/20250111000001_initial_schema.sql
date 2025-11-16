-- InterpretReflect V2 Initial Database Schema
-- Phase 1: Core Tables for MVP Launch

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  professional_title TEXT, -- e.g., "Certified Sign Language Interpreter"
  certifications TEXT[], -- e.g., ["RID CI/CT", "NAD Level V"]
  years_experience INTEGER,
  specializations TEXT[], -- e.g., ["Medical", "Legal", "Educational"]
  timezone TEXT DEFAULT 'America/New_York',

  -- Subscription & Access
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro', 'agency')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'expired', 'trial')),
  trial_ends_at TIMESTAMPTZ,
  subscription_starts_at TIMESTAMPTZ,

  -- Preferences
  notification_preferences JSONB DEFAULT '{"email": true, "push": false, "weekly_summary": true}'::jsonb,
  performance_goals JSONB DEFAULT '{"weekly_reflections": 3, "monthly_skill_builders": 2}'::jsonb,

  -- Metadata
  onboarding_completed BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Performance Baseline Check-ins (Daily Check-in)
CREATE TABLE public.baseline_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Performance Metrics (reframed from wellness)
  cognitive_load INTEGER NOT NULL CHECK (cognitive_load BETWEEN 1 AND 10), -- was "stress_level"
  capacity_reserve INTEGER NOT NULL CHECK (capacity_reserve BETWEEN 1 AND 10), -- was "energy_level"
  performance_readiness INTEGER NOT NULL CHECK (performance_readiness BETWEEN 1 AND 10), -- was "overall_mood"
  recovery_quality INTEGER NOT NULL CHECK (recovery_quality BETWEEN 1 AND 10), -- was "sleep_quality"

  -- Optional Context
  notes TEXT,
  tags TEXT[], -- e.g., ["high_stress_day", "back_to_back_assignments"]

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  check_in_date DATE DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE public.baseline_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own baseline checks"
  ON public.baseline_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own baseline checks"
  ON public.baseline_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_baseline_checks_user_date ON public.baseline_checks(user_id, check_in_date DESC);

-- Quick Reflect Entries (Post-Assignment 2-min Check-in)
CREATE TABLE public.quick_reflect_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Assignment Context
  assignment_type TEXT NOT NULL, -- e.g., "Medical", "Legal", "Educational", "VRI", "Community"
  duration_minutes INTEGER NOT NULL,
  setting_type TEXT, -- e.g., "In-Person", "VRI", "Video Remote"

  -- Performance Reflection
  performance_rating INTEGER NOT NULL CHECK (performance_rating BETWEEN 1 AND 5),
  cognitive_load_rating INTEGER NOT NULL CHECK (cognitive_load_rating BETWEEN 1 AND 5),
  challenge_areas TEXT[], -- e.g., ["Technical terminology", "Fast pace", "Accent comprehension"]
  success_moments TEXT[], -- e.g., ["Clear turn-taking", "Effective team coordination"]

  -- Learning & Growth
  new_vocabulary TEXT[], -- Terms learned/encountered
  skills_practiced TEXT[], -- e.g., ["Consecutive interpreting", "Note-taking"]
  reflection_notes TEXT,

  -- AI Analysis (populated by Catalyst AI)
  ai_insights JSONB, -- AI-generated patterns, suggestions, trends
  ai_processed BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  assignment_date DATE DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE public.quick_reflect_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quick reflect entries"
  ON public.quick_reflect_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quick reflect entries"
  ON public.quick_reflect_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quick reflect entries"
  ON public.quick_reflect_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_quick_reflect_user_date ON public.quick_reflect_entries(user_id, assignment_date DESC);

-- Skill Builders Progress (Micro-learning modules)
CREATE TABLE public.skill_builder_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Module Info
  module_id TEXT NOT NULL, -- e.g., "consecutive-notetaking-101"
  module_title TEXT NOT NULL,
  module_category TEXT NOT NULL, -- e.g., "Technical Skills", "Self-Care", "Business Development"

  -- Progress Tracking
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER NOT NULL,

  -- Completion & CEUs
  completed_at TIMESTAMPTZ,
  ceu_credits DECIMAL(3,2) DEFAULT 0.0, -- e.g., 0.5 CEUs
  ceu_category TEXT, -- e.g., "Professional Studies", "Studies of Healthy Minds & Bodies"
  certificate_url TEXT,

  -- Metadata
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.skill_builder_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skill builder progress"
  ON public.skill_builder_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill builder progress"
  ON public.skill_builder_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skill builder progress"
  ON public.skill_builder_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Catalyst AI Conversations (Chat history)
CREATE TABLE public.catalyst_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Conversation Metadata
  title TEXT DEFAULT 'New Conversation',
  conversation_type TEXT DEFAULT 'general' CHECK (conversation_type IN ('general', 'reflection_analysis', 'skill_coaching', 'performance_insights')),

  -- Message History (stored as JSONB array)
  messages JSONB DEFAULT '[]'::jsonb, -- [{role: 'user'|'assistant', content: '...', timestamp: '...'}]

  -- Context & Analysis
  related_reflect_ids UUID[], -- Links to quick_reflect_entries
  topics_discussed TEXT[], -- e.g., ["burnout", "VRI challenges", "medical terminology"]
  ai_model_used TEXT DEFAULT 'gpt-4-turbo', -- Track which AI model version

  -- Metadata
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.catalyst_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON public.catalyst_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.catalyst_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.catalyst_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_catalyst_conversations_user ON public.catalyst_conversations(user_id, last_message_at DESC);

-- Performance Analytics Cache (Materialized view for Performance Hub)
CREATE TABLE public.performance_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Time Period
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Aggregated Metrics
  total_assignments INTEGER DEFAULT 0,
  total_minutes_interpreted INTEGER DEFAULT 0,
  avg_performance_rating DECIMAL(3,2),
  avg_cognitive_load DECIMAL(3,2),
  avg_capacity_reserve DECIMAL(3,2),
  avg_performance_readiness DECIMAL(3,2),

  -- Top Patterns
  most_common_assignment_types JSONB, -- {"Medical": 12, "Legal": 8, "Educational": 5}
  top_challenge_areas TEXT[],
  top_success_moments TEXT[],
  most_practiced_skills TEXT[],

  -- Trends & Insights
  performance_trend TEXT CHECK (performance_trend IN ('improving', 'stable', 'declining', 'insufficient_data')),
  burnout_risk_score INTEGER CHECK (burnout_risk_score BETWEEN 0 AND 100),
  ai_insights JSONB, -- Catalyst AI analysis of trends

  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.performance_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON public.performance_analytics FOR SELECT
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_performance_analytics_user_period ON public.performance_analytics(user_id, period_start DESC, period_type);
CREATE UNIQUE INDEX idx_performance_analytics_unique_period ON public.performance_analytics(user_id, period_type, period_start);

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
