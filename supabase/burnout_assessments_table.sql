-- Create burnout_assessments table
CREATE TABLE IF NOT EXISTS public.burnout_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Assessment scores
  energy_tank INTEGER NOT NULL CHECK (energy_tank >= 1 AND energy_tank <= 5),
  recovery_speed INTEGER NOT NULL CHECK (recovery_speed >= 1 AND recovery_speed <= 5),
  emotional_leakage INTEGER NOT NULL CHECK (emotional_leakage >= 1 AND emotional_leakage <= 5),
  performance_signal INTEGER NOT NULL CHECK (performance_signal >= 1 AND performance_signal <= 5),
  tomorrow_readiness INTEGER NOT NULL CHECK (tomorrow_readiness >= 1 AND tomorrow_readiness <= 5),
  
  -- Calculated results
  total_score DECIMAL(3,2) NOT NULL,
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'severe')),
  
  -- Context factors (optional)
  workload_intensity VARCHAR(20) CHECK (workload_intensity IN ('light', 'moderate', 'heavy')),
  emotional_demand VARCHAR(20) CHECK (emotional_demand IN ('low', 'medium', 'high')),
  had_breaks BOOLEAN,
  team_support BOOLEAN,
  difficult_session BOOLEAN,
  
  -- Timestamps
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX idx_burnout_assessments_user_id ON public.burnout_assessments(user_id);
CREATE INDEX idx_burnout_assessments_date ON public.burnout_assessments(assessment_date DESC);
CREATE INDEX idx_burnout_assessments_user_date ON public.burnout_assessments(user_id, assessment_date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.burnout_assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own assessments
CREATE POLICY "Users can view own assessments" ON public.burnout_assessments
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own assessments
CREATE POLICY "Users can insert own assessments" ON public.burnout_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own assessments (same day only)
CREATE POLICY "Users can update own assessments" ON public.burnout_assessments
  FOR UPDATE USING (auth.uid() = user_id AND assessment_date = CURRENT_DATE);

-- Users can delete their own assessments
CREATE POLICY "Users can delete own assessments" ON public.burnout_assessments
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_burnout_assessments_updated_at
  BEFORE UPDATE ON public.burnout_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();