-- Data Sync Schema
-- Tables for syncing user data from localStorage to Supabase

-- Reflections table
CREATE TABLE IF NOT EXISTS reflections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reflection_type TEXT,
    content JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, timestamp)
);

-- Body check-ins table
CREATE TABLE IF NOT EXISTS body_check_ins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    areas JSONB,
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, timestamp)
);

-- Technique usage table
CREATE TABLE IF NOT EXISTS technique_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    technique_id TEXT NOT NULL,
    technique_name TEXT,
    duration INTEGER,
    completed BOOLEAN DEFAULT false,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, technique_id, timestamp)
);

-- Recovery habits table
CREATE TABLE IF NOT EXISTS recovery_habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_type TEXT,
    habit_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, timestamp)
);

-- Burnout assessments table
CREATE TABLE IF NOT EXISTS burnout_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL,
    emotional_exhaustion INTEGER,
    depersonalization INTEGER,
    personal_accomplishment INTEGER,
    overall_score INTEGER,
    risk_level TEXT,
    responses JSONB,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, assessment_date)
);

-- Affirmations table
CREATE TABLE IF NOT EXISTS affirmations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    affirmation_type TEXT NOT NULL,
    content JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, affirmation_type, content)
);

-- Affirmation favorites table
CREATE TABLE IF NOT EXISTS affirmation_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    favorites JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Body awareness sessions table
CREATE TABLE IF NOT EXISTS body_awareness_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    version TEXT DEFAULT 'v1',
    session_data JSONB,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, session_id)
);

-- Boundaries sessions table
CREATE TABLE IF NOT EXISTS boundaries_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    session_data JSONB,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, session_id)
);

-- Assignment prep table
CREATE TABLE IF NOT EXISTS assignment_prep (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assignment_id TEXT,
    prep_data JSONB,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, assignment_id)
);

-- Assignment debriefs table
CREATE TABLE IF NOT EXISTS assignment_debriefs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assignment_id TEXT,
    debrief_data JSONB,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, assignment_id)
);

-- Wellness check-ins table
CREATE TABLE IF NOT EXISTS wellness_check_ins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    check_in_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, timestamp)
);

-- Emotional proximity sessions table
CREATE TABLE IF NOT EXISTS emotional_proximity_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    session_data JSONB,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, session_id)
);

-- Code switch sessions table
CREATE TABLE IF NOT EXISTS code_switch_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    session_data JSONB,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, session_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_body_check_ins_user_id ON body_check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_technique_usage_user_id ON technique_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_habits_user_id ON recovery_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_burnout_assessments_user_id ON burnout_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_affirmations_user_id ON affirmations(user_id);
CREATE INDEX IF NOT EXISTS idx_body_awareness_sessions_user_id ON body_awareness_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_boundaries_sessions_user_id ON boundaries_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_prep_user_id ON assignment_prep(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_debriefs_user_id ON assignment_debriefs(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_check_ins_user_id ON wellness_check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_proximity_sessions_user_id ON emotional_proximity_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_code_switch_sessions_user_id ON code_switch_sessions(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE technique_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE burnout_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE affirmation_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_awareness_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE boundaries_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_prep ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_debriefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_proximity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_switch_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for each table (users can only access their own data)
CREATE POLICY "Users can view own reflections" ON reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reflections" ON reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reflections" ON reflections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reflections" ON reflections FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own body_check_ins" ON body_check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own body_check_ins" ON body_check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own body_check_ins" ON body_check_ins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own body_check_ins" ON body_check_ins FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own technique_usage" ON technique_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own technique_usage" ON technique_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own technique_usage" ON technique_usage FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own technique_usage" ON technique_usage FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recovery_habits" ON recovery_habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recovery_habits" ON recovery_habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recovery_habits" ON recovery_habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recovery_habits" ON recovery_habits FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own burnout_assessments" ON burnout_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own burnout_assessments" ON burnout_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own burnout_assessments" ON burnout_assessments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own burnout_assessments" ON burnout_assessments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own affirmations" ON affirmations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own affirmations" ON affirmations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own affirmations" ON affirmations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own affirmations" ON affirmations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own affirmation_favorites" ON affirmation_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own affirmation_favorites" ON affirmation_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own affirmation_favorites" ON affirmation_favorites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own affirmation_favorites" ON affirmation_favorites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own body_awareness_sessions" ON body_awareness_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own body_awareness_sessions" ON body_awareness_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own body_awareness_sessions" ON body_awareness_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own body_awareness_sessions" ON body_awareness_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own boundaries_sessions" ON boundaries_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own boundaries_sessions" ON boundaries_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own boundaries_sessions" ON boundaries_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own boundaries_sessions" ON boundaries_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assignment_prep" ON assignment_prep FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assignment_prep" ON assignment_prep FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assignment_prep" ON assignment_prep FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assignment_prep" ON assignment_prep FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assignment_debriefs" ON assignment_debriefs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assignment_debriefs" ON assignment_debriefs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assignment_debriefs" ON assignment_debriefs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assignment_debriefs" ON assignment_debriefs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wellness_check_ins" ON wellness_check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wellness_check_ins" ON wellness_check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wellness_check_ins" ON wellness_check_ins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wellness_check_ins" ON wellness_check_ins FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own emotional_proximity_sessions" ON emotional_proximity_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emotional_proximity_sessions" ON emotional_proximity_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own emotional_proximity_sessions" ON emotional_proximity_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own emotional_proximity_sessions" ON emotional_proximity_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own code_switch_sessions" ON code_switch_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own code_switch_sessions" ON code_switch_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own code_switch_sessions" ON code_switch_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own code_switch_sessions" ON code_switch_sessions FOR DELETE USING (auth.uid() = user_id);