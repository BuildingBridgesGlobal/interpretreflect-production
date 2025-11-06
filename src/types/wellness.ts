// ============================================
// WELLNESS & COMMUNITY TYPE DEFINITIONS
// Auto-generated from database schema
// ============================================

export interface UserProfile {
  id: string; // UUID from auth.users
  profile_type: 'interpreter' | 'cdi' | 'student' | 'educator';
  years_experience?: number;
  specializations?: string[]; // ['healthcare', 'legal', 'educational', 'VRS']
  certification_data?: Record<string, any>; // RID NIC, NAD, state licenses
  performance_goals?: any[]; // what they want to improve
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  onboarding_completed: boolean;
  onboarding_step: number;
  profile_visibility: 'public' | 'community' | 'private';
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  user_id: string;
  cert_type: string; // 'RID NIC', 'NAD', 'CCHI', 'State'
  cert_number?: string;
  credential_level?: string; // 'NIC', 'NIC Advanced', 'NIC Master'
  issue_date?: string;
  expiration_date?: string;
  ceu_hours_required: number;
  ceu_hours_completed: number;
  renewal_reminder_sent: boolean;
  reminder_sent_at?: string;
  documents?: Array<{ url: string; filename: string; uploaded_at: string }>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WellnessCheckIn {
  id: string;
  user_id: string;
  check_in_date: string;
  stress_level?: number; // 1-10
  energy_level?: number; // 1-10
  burnout_indicators?: {
    fatigue?: number; // 1-5
    cynicism?: number; // 1-5
    efficacy?: number; // 1-5
  };
  recent_challenges?: string;
  wins?: string;
  elya_interaction_summary?: string; // AI-generated
  trend_analysis?: Record<string, any>;
  created_at: string;
}

export interface SkillAssessment {
  id: string;
  user_id: string;
  assessment_type: 'terminology' | 'cultural_competence' | 'emotional_regulation' | string;
  domain?: 'healthcare' | 'legal' | 'educational' | 'mental_health' | string;
  score: number;
  max_score: number;
  areas_for_growth?: string[];
  strengths?: string[];
  assessment_data?: Record<string, any>;
  completed_at: string;
}

export interface LearningPath {
  id: string;
  user_id: string;
  path_name: string;
  path_type?: 'certification_prep' | 'specialization' | 'skill_building';
  description?: string;
  modules?: Array<{
    module_id: string;
    status: 'not_started' | 'in_progress' | 'completed';
    completed_at?: string;
  }>;
  progress_percentage: number; // 0-100
  target_completion_date?: string;
  started_at?: string;
  completed_at?: string;
  ai_personalized_recommendations?: any[];
  created_at: string;
  updated_at: string;
}

export interface GlossaryTerm {
  id: string;
  user_id: string;
  term: string;
  definition?: string;
  context?: string; // example sentence
  domain?: string; // 'healthcare', 'legal', 'mental_health'
  category?: string; // 'anatomy', 'procedure', 'medication'
  source?: string; // where they learned it
  proficiency_level: number; // 1-5
  confidence_score: number; // 0.0-1.0
  last_reviewed?: string;
  next_review_date?: string; // spaced repetition
  review_count: number;
  correct_count: number;
  ai_generated_examples?: any[];
  related_terms?: string[];
  created_at: string;
  updated_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  post_type: 'reflection' | 'question' | 'resource_share' | 'peer_support' | 'discussion';
  title?: string;
  content: string;
  tags?: string[];
  domain?: string; // 'healthcare', 'legal', etc.
  anonymous: boolean;
  visibility: 'public' | 'community' | 'private';
  moderation_status: 'pending' | 'approved' | 'flagged' | 'removed';
  moderated_at?: string;
  moderated_by?: string;
  moderation_reason?: string;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string; // for threaded replies
  content: string;
  anonymous: boolean;
  moderation_status: 'pending' | 'approved' | 'flagged' | 'removed';
  created_at: string;
  updated_at: string;
}

export interface PeerConnection {
  id: string;
  user_id_1: string;
  user_id_2: string;
  connection_type: 'mentor' | 'mentee' | 'peer' | 'study_partner';
  match_algorithm_score?: number; // 0.0-1.0
  match_reason?: Record<string, any>; // why they were matched
  status: 'pending' | 'accepted' | 'declined' | 'active' | 'inactive';
  last_interaction_at?: string;
  interaction_count: number;
  created_at: string;
  updated_at: string;
}

// VIEW TYPES (for analytics)

export interface UserWellnessTrend {
  user_id: string;
  avg_stress_level_30d: number;
  avg_energy_level_30d: number;
  check_in_count_30d: number;
  last_check_in_date: string;
}

export interface CertificationExpiringSoon {
  id: string;
  user_id: string;
  cert_type: string;
  cert_number?: string;
  expiration_date: string;
  days_until_expiration: number;
  ceu_hours_required: number;
  ceu_hours_completed: number;
  ceu_hours_remaining: number;
}
