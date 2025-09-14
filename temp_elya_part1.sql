-- ELYA INTEGRATION SQL PART 1
-- Copy this entire content and paste it into Supabase SQL Editor

-- Elya AI Integration Schema
-- This creates the necessary tables and functions for Elya to access user context and save conversation history

-- Elya Conversations Table
CREATE TABLE IF NOT EXISTS elya_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'elya')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Context Summary Table (for Elya to understand user patterns)
CREATE TABLE IF NOT EXISTS user_context_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Recent activity patterns
    recent_stress_patterns TEXT[],
    recent_emotions TEXT[],
    common_challenges TEXT[],
    effective_strategies TEXT[],
    
    -- Wellness tracking
    avg_energy_level NUMERIC(3,2),
    avg_stress_level NUMERIC(3,2),
    avg_confidence_level NUMERIC(3,2),
    burnout_risk_level TEXT CHECK (burnout_risk_level IN ('low', 'moderate', 'high', 'critical')),
    
    -- Professional context
    interpreter_experience_level TEXT,
    common_assignment_types TEXT[],
    preferred_teaming_style TEXT,
    known_triggers TEXT[],
    
    -- Support preferences
    preferred_support_types TEXT[],
    effective_interventions TEXT[],
    communication_style TEXT,
    
    -- Last updated
    last_reflection_date DATE,
    last_activity_date DATE,
    context_score NUMERIC(3,2) DEFAULT 0, -- How complete their context is
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
