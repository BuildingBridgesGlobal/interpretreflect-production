import { createClient } from "@supabase/supabase-js";

// Supabase project credentials from environment variables
const supabaseUrl =
	import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
	import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

if (
	!import.meta.env.VITE_SUPABASE_URL ||
	!import.meta.env.VITE_SUPABASE_ANON_KEY
) {
	console.warn("Missing Supabase credentials. Running in demo mode.");
}

// Create Supabase client without session persistence
// Sessions use sessionStorage, so users must log in each browser session
// This prevents cross-tab issues and auto-login behavior
// detectSessionInUrl is disabled globally to prevent cross-tab session leakage
// Individual pages (like reset-password) will handle URL tokens manually
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
		storage: window.sessionStorage,
		storageKey: "supabase.auth.token",
		flowType: "pkce",
	},
});

// Helper function to refresh session if needed
export async function refreshSessionIfNeeded() {
	try {
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();

		if (error) {
			console.error("Session error:", error);
			return null;
		}

		if (!session) {
			console.log("No active session");
			return null;
		}

		// Check if token is about to expire (within 5 minutes)
		const expiresAt = session.expires_at;
		if (expiresAt) {
			const expiresIn = expiresAt * 1000 - Date.now();
			if (expiresIn < 5 * 60 * 1000) {
				// Less than 5 minutes
				console.log("Session expiring soon, refreshing...");
				const {
					data: { session: newSession },
					error: refreshError,
				} = await supabase.auth.refreshSession();
				if (refreshError) {
					console.error("Failed to refresh session:", refreshError);
					return null;
				}
				return newSession;
			}
		}

		return session;
	} catch (error) {
		console.error("Error checking session:", error);
		return null;
	}
}

// Types for our database (you can expand these as needed)
export interface User {
	id: string;
	email: string;
	created_at: string;
	subscription_status?: "active" | "inactive" | "trial" | "cancelled";
	subscription_plan?: "essential" | "professional" | "organization";
	stripe_customer_id?: string;
}

// Base reflection data structure
export interface BaseReflectionData {
	[key: string]: unknown;
}

// Pre-Assignment Prep data structure
export interface PreAssignmentPrepData {
	// Quick Insight Capture
	assignment_type:
		| "medical"
		| "legal"
		| "educational"
		| "conference"
		| "community"
		| "other";
	assignment_type_other?: string;
	assignment_format: "virtual" | "in-person" | "hybrid";
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
	mentoring_type:
		| "career_guidance"
		| "skill_development"
		| "problem_solving"
		| "emotional_support"
		| "other";
	mentoring_type_other?: string;
	meeting_format: "virtual" | "in-person";
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

// Mentoring Reflection data structure
export interface MentoringReflectionData {
	// Link to prep data
	linked_prep_id?: string;
	prep_data_referenced?: MentoringPrepData;

	// Quick Insight Capture
	session_word: string;
	most_surprising: string;
	satisfaction_rating: number; // 1-10

	// Section 1: Revisiting Intentions
	ask_addressed: string;
	success_criteria_met: string;
	questions_answered: string;
	boundaries_respected: string;

	// Section 2: Key Insights & Feedback
	three_important_things: string[];
	hard_but_valuable: string;
	new_perspectives: string;
	patterns_spotted: string;
	validation_received: string;

	// Section 3: Emotional Processing
	emotional_journey: string;
	current_emotions: string;
	strongest_reaction: string;
	needs_processing: string;
	confidence_change: string;

	// Section 4: Action Planning
	specific_next_steps: string;
	next_48_hours: string;
	next_week: string;
	longer_term: string;
	support_needed: string;

	// Section 5: Application Strategy
	application_plan: string;
	potential_obstacles: string;
	accountability_plan: string;
	mentor_checkin: string;
	progress_measurement: string;

	// Post-Mentoring State Check
	clarity_level: number; // 1-10
	confidence_forward: number; // 1-10
	motivation_level: number; // 1-10
	gratitude_level: number; // 1-10
	current_state_word: string;

	// Comparative Reflection
	confidence_comparison: string;
	stress_comparison: string;
	feedback_reception: string;

	// Closing Commitment
	action_commitment: string;
	mindset_commitment: string;
	payforward_commitment: string;

	// Metadata
	session_id?: string;
	timestamp: string;
	completion_time?: number;
}

// Union type for all possible reflection data types
export type ReflectionData =
	| TeamingPrepData
	| TeamingPrepEnhancedData
	| TeamingReflectionData
	| PreAssignmentPrepData
	| PostAssignmentDebriefData
	| MentoringPrepData
	| MentoringReflectionData
	| WellnessCheckInData
	| CompassCheckData
	| BaseReflectionData;

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
	assignment_type: "virtual" | "in-person" | "hybrid";

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
	assignment_type: "virtual" | "in-person" | "hybrid";

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

// Wellness Check-In data structure
export interface WellnessCheckInData {
	// Quick Insight Capture
	check_in_reason: string;
	overall_feeling: number; // 1-10
	last_break_taken: string;

	// Section 1: Emotional Landscape
	current_emotions: string[];
	custom_emotions?: string;
	strongest_emotion: string;
	emotion_message: string;
	emotional_patterns: string;
	avoided_feelings: string;
	emotional_needs: string;

	// Section 2: Physical Awareness
	body_scan: string;
	tension_areas: string;
	relaxation_areas: string;
	energy_level: string;
	physical_symptoms: string;

	// Section 3: Professional Wellbeing
	workload_sustainability: number; // 1-10
	energizing_aspects: string;
	draining_aspects: string;
	purpose_connection: string;
	boundaries_needing_attention: string;

	// Section 4: Support & Resources
	available_support_systems: string;
	people_to_reach_out: string;
	recent_self_care: string;
	needed_resources: string;
	help_comfort_level: number; // 1-10

	// Section 5: Needs & Intentions
	immediate_needs: string;
	balance_helpers: string;
	today_wellness_step: string;
	longer_term_changes: string;
	week_wellness_priority: string;

	// Wellness Metrics
	physical_energy: number; // 1-10
	emotional_balance: number; // 1-10
	mental_clarity: number; // 1-10
	social_connection: number; // 1-10
	professional_satisfaction: number; // 1-10
	overall_wellbeing: number; // 1-10

	// Closing
	self_care_commitment: string;
	gratitude_reflection: string;

	// Metadata
	timestamp: string;
	completion_time?: number;

	// Emotion RAG Integration
	emotion_patterns_rag?: string[];
	rag_insights?: string;

	// Flags
	concerning_patterns?: boolean;
	needs_followup?: boolean;
}

// Compass Check data structure
export interface CompassCheckData {
	// Quick Insight Capture
	situation_prompt: string;
	values_alignment: number; // 1-10
	uneasy_feeling: string;

	// Section 1: The Situation
	situation_description: string;
	difficulty_factors: string;
	competing_demands: string;
	people_impacted: string;
	personal_stakes: string;

	// Section 2: Values Exploration
	challenged_values: string;
	honored_values: string;
	values_conflict: string;
	others_values: string;
	systemic_factors: string;

	// Section 3: Decision Process
	navigation_approach: string;
	guiding_factors: string;
	compromises_made: string;
	hindsight_changes: string;
	peace_and_troubles: string;

	// Section 4: Impact & Consequences
	decision_impact: string;
	integrity_effect: string;
	relationships_affected: string;
	boundaries_learned: string;
	role_understanding_change: string;

	// Section 5: Realignment & Integration
	alignment_helpers: string;
	boundaries_to_set: string;
	future_handling: string;
	support_needed: string;
	growth_insights: string;

	// Values Assessment
	integrity_alignment: number; // 1-10
	authenticity_in_role: number; // 1-10
	ethical_clarity: number; // 1-10
	professional_boundaries: number; // 1-10
	personal_peace: number; // 1-10

	// Closing
	wisdom_gained: string;
	self_compassion_note: string;
	priority_value: string;

	// Metadata
	timestamp: string;
	completion_time?: number;
	linked_assignment_id?: string;

	// Analytics flags
	ethical_challenge?: boolean;
	values_conflict_present?: boolean;
	resolution_achieved?: boolean;
}

// Breathing Practice data structure
export interface BreathingPracticeData {
	// Session settings
	practice_type: "rhythm" | "counting" | "color" | "sound" | "touch";
	inhale_count: number;
	pause_count: number;
	exhale_count: number;
	rest_count: number;
	skip_holds: boolean;
	breathing_path: "nose" | "mouth" | "combination";

	// Post-practice feedback
	feeling_response:
		| "calming"
		| "energizing"
		| "neutral"
		| "uncomfortable"
		| "other";
	feeling_other?: string;
	adjustment_preference?:
		| "shorter"
		| "longer"
		| "skip_pauses"
		| "change_pace"
		| "add_sound"
		| "just_right"
		| "other";
	adjustment_other?: string;
	one_word_description?: string;

	// User preferences
	save_adjustments: boolean;
	reminder_schedule?: "2_hours" | "4_hours" | "tomorrow" | "2_days";
	try_different_next: boolean;

	// Session metadata
	session_id: string;
	timestamp: string;
	duration: number; // in seconds
	completion_status: "completed" | "partial" | "stopped";
	modifications_made: string[];

	// Analytics
	pre_practice_state?: string;
	post_practice_state?: string;
	effectiveness_rating?: number; // 1-10
	time_of_day: string;

	// Accessibility
	visual_timer_used: boolean;
	audio_cues_used: boolean;
	haptic_feedback_used: boolean;
	high_contrast_mode: boolean;
}

// Body Awareness Journey data structure
export interface BodyAwarenessData {
	// Session settings
	journey_type:
		| "physical"
		| "visualization"
		| "breath"
		| "touch"
		| "sound"
		| "stillness"
		| "whole_body";
	duration: number; // in seconds
	focus_areas: string[];
	approach_used: string;

	// Post-practice feedback
	body_feeling: "relaxed" | "aware" | "same" | "discomfort" | "other";
	feeling_other?: string;

	// What noticed
	noticed_items: string[];
	noticed_other?: string;
	specific_discoveries?: string;

	// Areas tracking
	tension_areas: string[];
	ease_areas: string[];
	needs_attention_areas: string[];
	skipped_areas: string[];

	// Adjustments
	adjustment_preference?: string;
	focus_areas_next?: string;
	preferred_approach?: string;
	duration_preference?: "shorter" | "longer" | "same";
	add_music?: boolean;

	// Current state
	ease_location?: string;

	// User preferences
	save_insights: boolean;
	track_patterns: boolean;
	reminder_schedule?: "later_today" | "tomorrow" | "2_days";

	// Session metadata
	session_id: string;
	timestamp: string;
	completion_status: "completed" | "partial" | "stopped";
	modifications_made: string[];

	// Analytics
	pre_practice_state?: string;
	post_practice_state?: string;
	effectiveness_rating?: number; // 1-10
	time_of_day: string;
	linked_assignment?: string;

	// Accessibility
	visual_guide_used: boolean;
	audio_guide_used: boolean;
	haptic_cues_used: boolean;
	text_only_mode: boolean;

	// Body-emotion correlations
	emotional_state_before?: string;
	emotional_state_after?: string;
	body_emotion_connections?: Record<string, string>;
}
