// ============================================
// ASSIGNMENT TYPES
// ============================================

export type AssignmentType =
  | 'conference'
  | 'medical'
  | 'legal'
  | 'educational'
  | 'vrs'
  | 'vri'
  | 'community'
  | 'business'
  | 'religious'
  | 'other';

export type AssignmentStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

export type CognitiveLoad = 'low' | 'moderate' | 'high' | 'very_high';

export type Platform = 'zoom' | 'teams' | 'google_meet' | 'in_person' | 'other';

export type AccessLevel = 'view' | 'edit';

export interface PrepChecklistItem {
  task: string;
  completed: boolean;
  completed_at?: string;
}

export interface Assignment {
  id: string;
  creator_id: string;
  primary_interpreter_id: string;

  // Basic details
  assignment_name: string;
  assignment_type: AssignmentType;

  // Timing
  assignment_date: string; // ISO date string
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  setup_time?: string; // HH:MM format
  duration_minutes?: number;
  timezone: string;

  // Location/Platform
  is_remote: boolean;
  platform?: Platform;
  meeting_link?: string;
  meeting_id?: string;
  meeting_passcode?: string;
  physical_location?: string;

  // Client/Organization
  client_organization?: string;
  coordinator_name?: string;
  coordinator_email?: string;
  coordinator_phone?: string;
  client_background?: string;
  client_website?: string;

  // Participants
  deaf_participants?: string;
  hearing_participants?: string;
  languages?: string[];
  participant_notes?: string;

  // Team interpreting
  is_team_assignment: boolean;
  team_interpreter_name?: string;
  team_interpreter_email?: string;
  team_interpreter_phone?: string;
  turn_rotation_minutes?: number;

  // Context & Prep
  subject_topic?: string;
  expected_cognitive_load?: CognitiveLoad;
  key_considerations?: string[];
  prep_notes?: string;
  cognitive_load_factors?: string;
  support_strategies?: string;

  // Checklist
  prep_checklist: PrepChecklistItem[];

  // Sharing
  sharing_token?: string;
  shared_with_emails?: string[];

  // Status
  status: AssignmentStatus;
  completed_at?: string;

  // Post-assignment
  quick_reflect_id?: string;

  // Template
  is_template: boolean;
  template_name?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface AssignmentAttachment {
  id: string;
  assignment_id: string;
  filename: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  uploaded_by?: string;
  uploaded_at: string;
  deleted_at?: string;
}

export interface AssignmentResource {
  id: string;
  assignment_id: string;
  title: string;
  url: string;
  added_by?: string;
  added_at: string;
  deleted_at?: string;
}

export interface AssignmentShare {
  id: string;
  assignment_id: string;
  shared_by: string;
  shared_with_email: string;
  shared_with_user_id?: string;
  access_level: AccessLevel;
  share_token: string;
  personal_message?: string;
  expires_at?: string;
  viewed_at?: string;
  last_accessed_at?: string;
  access_count: number;
  is_active: boolean;
  revoked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SharedAssignmentNote {
  id: string;
  assignment_id: string;
  author_email: string;
  author_user_id?: string;
  author_name: string;
  note_text: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// ============================================
// FORM DATA TYPES
// ============================================

export interface AssignmentFormData {
  // Basic details
  assignment_name: string;
  assignment_type: AssignmentType;

  // Timing
  assignment_date: string;
  start_time: string;
  end_time: string;
  setup_time?: string;
  timezone: string;

  // Location/Platform
  is_remote: boolean;
  platform?: Platform;
  meeting_link?: string;
  meeting_id?: string;
  meeting_passcode?: string;
  physical_location?: string;

  // Client/Organization
  client_organization?: string;
  coordinator_name?: string;
  coordinator_email?: string;
  coordinator_phone?: string;
  client_background?: string;
  client_website?: string;

  // Participants
  deaf_participants?: string;
  hearing_participants?: string;
  languages: string[];
  participant_notes?: string;

  // Team interpreting
  is_team_assignment: boolean;
  team_interpreter_name?: string;
  team_interpreter_email?: string;
  team_interpreter_phone?: string;
  turn_rotation_minutes?: number;

  // Context & Prep
  subject_topic?: string;
  expected_cognitive_load?: CognitiveLoad;
  key_considerations: string[];
  prep_notes?: string;
  cognitive_load_factors?: string;
  support_strategies?: string;

  // Template
  is_template: boolean;
  template_name?: string;
}

export interface ShareAssignmentFormData {
  shared_with_email: string;
  access_level: AccessLevel;
  personal_message?: string;
  expires_at?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface AssignmentWithRelations extends Assignment {
  attachments?: AssignmentAttachment[];
  resources?: AssignmentResource[];
  shares?: AssignmentShare[];
  notes?: SharedAssignmentNote[];
}

export interface AssignmentListItem {
  id: string;
  assignment_name: string;
  assignment_date: string;
  start_time: string;
  end_time: string;
  assignment_type: AssignmentType;
  status: AssignmentStatus;
  is_team_assignment: boolean;
  team_interpreter_name?: string;
  platform?: Platform;
  client_organization?: string;
  expected_cognitive_load?: CognitiveLoad;
  prep_checklist_completion: number; // 0-100 percentage
  has_quick_reflect: boolean;
  created_at: string;
}

// ============================================
// CONSTANTS
// ============================================

export const ASSIGNMENT_TYPES: { value: AssignmentType; label: string }[] = [
  { value: 'conference', label: 'Conference' },
  { value: 'medical', label: 'Medical' },
  { value: 'legal', label: 'Legal' },
  { value: 'educational', label: 'Educational' },
  { value: 'vrs', label: 'VRS' },
  { value: 'vri', label: 'VRI' },
  { value: 'community', label: 'Community' },
  { value: 'business', label: 'Business' },
  { value: 'religious', label: 'Religious' },
  { value: 'other', label: 'Other' },
];

export const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'in_person', label: 'In-Person' },
  { value: 'other', label: 'Other' },
];

export const COGNITIVE_LOADS: { value: CognitiveLoad; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-green-600' },
  { value: 'moderate', label: 'Moderate', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'very_high', label: 'Very High', color: 'text-red-600' },
];

export const KEY_CONSIDERATIONS = [
  { value: 'technical_terminology', label: 'Technical terminology' },
  { value: 'acronym_heavy', label: 'Acronym-heavy' },
  { value: 'accent_variations', label: 'Accent/dialect variations' },
  { value: 'emotionally_challenging', label: 'Emotionally challenging' },
  { value: 'cultural_considerations', label: 'Cultural considerations' },
  { value: 'fast_paced', label: 'Fast-paced' },
];

export const DEFAULT_PREP_CHECKLIST: PrepChecklistItem[] = [
  { task: 'Reviewed all materials', completed: false },
  { task: 'Studied terminology list', completed: false },
  { task: 'Researched organization/context', completed: false },
  { task: 'Coordinated with team interpreter', completed: false },
  { task: 'Tested tech/platform', completed: false },
  { task: 'Planned cognitive reset strategy', completed: false },
  { task: 'Completed self-care prep', completed: false },
];
