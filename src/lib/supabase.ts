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

// Pre-Assignment Prep data structure
export interface PreAssignmentPrepData {
  // Quick Insight Capture
  assignment_type: 'medical' | 'legal' | 'educational' | 'conference' | 'community' | 'other';
  assignment_type_other?: string;
  assignment_format: 'virtual' | 'in-person' | 'hybrid';
  current_feeling: string;
  most_challenging_aspect: string;
  
  // Section 1: Assignment Understanding & Preparation
  assignment_description: string;
  preparation_completed: string;
  preparation_needed: string;
  terminology_review: string;
  remaining_questions: string;
  subject_familiarity: number; // 1-10 scale
  
  // Section 2: Emotional & Physical Readiness
  current_emotions: string[];
  custom_emotions?: string;
  body_sensations: string;
  past_influence: string;
  self_care_practices: string;
  energy_level: number; // 1-10
  mental_clarity: number; // 1-10
  
  // Section 3: Strategic Planning & Approach
  key_strategies: string;
  cognitive_load_management: string;
  environmental_factors: string;
  technical_setup?: string; // For virtual/hybrid
  positioning_plan?: string; // For in-person/hybrid
  boundaries_to_maintain: string;
  
  // Section 4: Anticipated Challenges & Solutions
  anticipated_challenges: string;
  potential_triggers: string;
  coping_strategies: string;
  support_resources: string;
  unfamiliar_terminology_plan: string;
  
  // Section 5: Success Vision & Intentions
  success_vision: string;
  skills_to_demonstrate: string;
  desired_feelings: string;
  quality_goals: string;
  recovery_plan: string;
  
  // Pre-Assignment Wellness Check
  confidence_level: number; // 1-10
  stress_anxiety_level: number; // 1-10
  preparedness_rating: number; // 1-10
  current_state_word: string;
  concerns_to_address?: string;
  
  // Closing Commitment
  assignment_intention: string;
  self_care_commitment: string;
  
  // Metadata
  assignment_id?: string; // For linking to post-debrief
  timestamp: string;
  completion_time?: number;
  
  // Emotion RAG Integration
  emotion_patterns?: string[];
  rag_insights?: string;
}

// Post-Assignment Debrief data structure
export interface PostAssignmentDebriefData {
  // Link to prep data
  linked_prep_id?: string;
  prep_data_referenced?: PreAssignmentPrepData;
  
  // Quick Insight Capture
  experience_word: string;
  most_unexpected: string;
  performance_satisfaction: number; // 1-10
  
  // Section 1: Revisiting Predictions
  confidence_accuracy: string;
  challenges_reflection: string;
  preparation_effectiveness: string;
  emotional_evolution: string;
  intention_maintenance: string;
  
  // Section 2: Assignment Execution
  assignment_unfolded: string;
  strategies_used: string;
  cognitive_load_management: string;
  technical_aspects?: string; // For virtual/hybrid
  environmental_factors?: string; // For in-person/hybrid
  technical_accuracy: number; // 1-10
  communication_effectiveness: number; // 1-10
  
  // Section 3: Emotional & Physical Experience
  emotions_during: string[];
  custom_emotions?: string;
  body_experience: string;
  flow_struggle_moments: string;
  stress_management: string;
  self_regulation: string;
  current_emotional_state: string;
  
  // Section 4: Challenges & Adaptations
  unexpected_challenges: string;
  real_time_adaptations: string;
  problem_solving_moment: string;
  support_needed: string;
  unfamiliar_content_handling: string;
  would_do_differently: string;
  
  // Section 5: Growth & Learning
  skills_strengthened: string;
  new_capabilities: string;
  approach_changes: string;
  feedback_received: string;
  pattern_recognition: string;
  
  // Section 6: Recovery & Integration
  recovery_practices: string;
  completion_needs: string;
  unresolved_concerns: string;
  future_boundaries: string;
  celebration_acknowledgment: string;
  
  // Post-Assignment Wellness Check
  energy_level_post: number; // 1-10
  stress_level_post: number; // 1-10
  accomplishment_sense: number; // 1-10
  future_confidence: number; // 1-10
  current_state_word: string;
  
  // Comparative Reflection
  confidence_comparison: string;
  challenges_comparison: string;
  preparedness_comparison: string;
  emotional_comparison: string;
  
  // Closing Synthesis
  three_insights: string[];
  proudest_moment: string;
  
  // Metadata
  assignment_id?: string; // Links to prep assignment_id
  timestamp: string;
  completion_time?: number;
  
  // Analytics flags
  high_stress_success?: boolean;
  flow_state_achieved?: boolean;
  effective_strategies?: string[];
}

// Mentoring Prep data structure
export interface MentoringPrepData {
  // Quick Insight Capture
  mentoring_type: 'career_guidance' | 'skill_development' | 'problem_solving' | 'emotional_support' | 'other';
  mentoring_type_other?: string;
  meeting_format: 'virtual' | 'in-person';
  seeking_reason: string;
  
  // Section 1: Clarifying Your Ask
  specific_situation: string;
  context_needed: string;
  already_tried: string;
  whats_at_stake: string;
  urgency_level: string;
  
  // Section 2: Defining Success
  success_definition: string;
  hoped_outcomes: string;
  success_indicators: string;
  support_type_needed: string;
  what_not_wanted: string;
  
  // Section 3: Preparation & Questions
  top_questions: string[];
  materials_to_share: string;
  difficult_topics: string;
  patterns_to_explore: string;
  assumptions_to_check: string;
  
  // Section 4: Openness & Boundaries
  feedback_openness: number; // 1-10
  valuable_feedback_type: string;
  conversation_boundaries: string;
  off_limits_topics: string;
  directness_preference: string;
  
  // Section 5: Action Readiness
  ready_to_commit: string;
  implementation_resources: string;
  potential_blockers: string;
  progress_tracking_plan: string;
  followup_timeline: string;
  
  // Pre-Mentoring State Check
  needs_articulation_confidence: number; // 1-10
  openness_to_perspectives: number; // 1-10
  emotional_readiness: number; // 1-10
  current_stress_level: number; // 1-10
  current_state_word: string;
  
  // Closing Intention
  clear_request: string;
  offering_in_return: string;
  
  // Metadata
  session_id?: string;
  timestamp: string;
  completion_time?: number;
}

// Union type for all possible reflection data types
export type ReflectionData = TeamingPrepData | TeamingPrepEnhancedData | TeamingReflectionData | PreAssignmentPrepData | PostAssignmentDebriefData | MentoringPrepData | BaseReflectionData;

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
