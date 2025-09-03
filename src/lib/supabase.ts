import { createClient } from '@supabase/supabase-js';

// Supabase project credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase credentials. Running in demo mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Types for our database (you can expand these as needed)
export interface User {
  id: string;
  email: string;
  created_at: string;
  subscription_status?: 'active' | 'inactive' | 'trial' | 'cancelled';
  subscription_plan?: 'essential' | 'professional' | 'organization';
  stripe_customer_id?: string;
}

// Base reflection data structure
export interface BaseReflectionData {
  [key: string]: unknown;
}

// Union type for all possible reflection data types
export type ReflectionData = TeamingPrepData | TeamingPrepEnhancedData | TeamingReflectionData | BaseReflectionData;

// Reflection entry types with team analytics support
export interface ReflectionEntry {
  id?: string;
  user_id: string;
  reflection_id: string;
  entry_kind: string;
  team_id?: string; // Optional: for team session tracking
  session_id?: string; // Optional: for shared team sessions
  data: ReflectionData; // Can be teaming prep or other reflection types
  created_at?: string;
  updated_at?: string;
}

// Enhanced Teaming Prep data structure for interpreting assignments
export interface TeamingPrepEnhancedData {
  // Quick Insight Capture
  excites_most: string;
  concerns_most: string;
  assignment_type: 'virtual' | 'in-person' | 'hybrid';
  
  // Section 1: Team Expectations & Mindset
  ideal_team_dynamic: string;
  natural_role: string;
  past_experience_influence: string;
  hoped_outcomes: string;
  
  // Section 2: Communication & Collaboration Strategy
  handoff_signal: string;
  virtual_handoff_strategy?: string; // Only for virtual/hybrid
  physical_cues?: string; // Only for in-person/hybrid
  communication_style: string;
  feedback_preferences: string;
  boundaries_preferences: string;
  
  // Section 3: Anticipated Challenges & Preparation
  typical_stressor: string;
  stress_management_plan: string;
  virtual_challenges?: string; // Only for virtual/hybrid
  environmental_challenges?: string; // Only for in-person/hybrid
  anticipated_obstacles: string;
  skills_to_develop: string;
  success_indicators: string;
  
  // Section 4: Personal Contribution Planning
  unique_strengths: string;
  support_needs: string;
  transition_strategy: string;
  dynamic_not_working_plan: string;
  corrections_approach: string;
  
  // Section 5: Success Vision
  success_description: string;
  ten_out_of_ten: string;
  specific_commitments: string;
  desired_reputation: string;
  fatigue_support_plan: string;
  
  // Closing
  intention_statement: string;
  
  // Pre-Assignment Metrics
  confidence_rating: number;
  feeling_word: string;
  
  // Metadata
  timestamp: string;
  completion_time?: number;
}

// Legacy Teaming Prep data structure (keeping for backward compatibility)
export interface TeamingPrepData {
  self_focus: number;
  partner_focus: number;
  one_word_feeling: string;
  signal_type: string;
  signal_custom?: string;
  stressors: string[];
  plan_if_sideways: string;
  viz_done: "Done!";
  micro_intention: string;
}

// Teaming Reflection specific data structure
export interface TeamingReflectionData {
  // Link to prep data
  linked_prep_id?: string;
  
  // Quick Insight
  most_surprised: string;
  assignment_type: 'virtual' | 'in-person' | 'hybrid';
  
  // Section 1: Revisiting Predictions
  expectations_accuracy: string;
  handoff_signal_practice: string;
  stress_handling_actual: string;
  technical_aspects?: string; // For virtual/hybrid
  physical_aspects?: string; // For in-person/hybrid
  
  // Section 2: Team Dynamics
  team_function_actual: string;
  role_evolution: string;
  communication_patterns: string;
  exceptional_moment: string;
  transition_management: string;
  
  // Section 3: Challenges & Growth
  significant_challenge: string;
  unexpected_skills: string;
  issue_resolution: string;
  collaboration_solutions?: string; // For virtual/hybrid
  environmental_solutions?: string; // For in-person/hybrid
  do_differently: string;
  
  // Section 4: Key Learnings
  learned_about_self: string;
  collaboration_insights: string;
  approach_changed: string;
  handoff_techniques: string;
  advice_for_others: string;
  
  // Section 5: Then vs Now
  then_thought_now_know: string;
  then_worried_now_understand: string;
  then_planned_actually_worked: string;
  confidence_change: string;
  experience_rating: number;
  rating_explanation: string;
  
  // Closing Synthesis
  three_strategies: string[];
  
  // Post-Reflection Metrics
  confidence_rating: number;
  feeling_word: string;
  
  // Sharing preferences
  share_enabled?: boolean;
  shared_highlights?: string[];
  
  // Analytics
  completion_time?: number;
  prep_data_referenced?: TeamingPrepData | TeamingPrepEnhancedData;
  
  // AI Insights placeholders
  ai_insights?: string;
  ai_summary?: string;
}
