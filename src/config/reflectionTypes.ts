/**
 * Centralized configuration for all reflection types
 * This ensures consistency across the entire application
 */

export interface ReflectionType {
	entryKind: string; // The value saved in database
	displayName: string; // The name shown to users
	shortName?: string; // Optional shorter name for cards
}

// Standard reflection types mapping
export const REFLECTION_TYPES: Record<string, ReflectionType> = {
	// Main 12 reflection types
	PRE_ASSIGNMENT: {
		entryKind: "pre_assignment_prep",
		displayName: "Pre-Assignment Prep",
		shortName: "Pre-Assignment",
	},
	POST_ASSIGNMENT: {
		entryKind: "post_assignment_debrief",
		displayName: "Post-Assignment Debrief",
		shortName: "Post-Assignment",
	},
	TEAMING_PREP: {
		entryKind: "teaming_prep",
		displayName: "Teaming Prep",
		shortName: "Team Prep",
	},
	TEAMING_REFLECTION: {
		entryKind: "teaming_reflection",
		displayName: "Teaming Reflection",
		shortName: "Team Reflection",
	},
	MENTORING_PREP: {
		entryKind: "mentoring_prep",
		displayName: "Mentoring Prep",
		shortName: "Mentoring Prep",
	},
	MENTORING_REFLECTION: {
		entryKind: "mentoring_reflection",
		displayName: "Mentoring Reflection",
		shortName: "Mentoring Review",
	},
	WELLNESS_CHECKIN: {
		entryKind: "wellness_checkin",
		displayName: "Wellness Check-in",
		shortName: "Wellness",
	},
	VALUES_ALIGNMENT: {
		entryKind: "values_alignment",
		displayName: "Values Alignment Check-In",
		shortName: "Values Check",
	},
	IN_SESSION_SELF: {
		entryKind: "insession_selfcheck",
		displayName: "In-Session Self-Check",
		shortName: "Self-Check",
	},
	IN_SESSION_TEAM: {
		entryKind: "team_sync",
		displayName: "In-Session Team Sync",
		shortName: "Team Sync",
	},
	ROLE_SPACE: {
		entryKind: "role_space_reflection",
		displayName: "Role-Space Reflection",
		shortName: "Role-Space",
	},
	DIRECT_COMMUNICATION: {
		entryKind: "direct_communication_reflection",
		displayName: "Supporting Direct Communication",
		shortName: "Direct Communication",
	},

	// Additional reflection types
	DECIDE_FRAMEWORK: {
		entryKind: "decide_framework",
		displayName: "Decide Framework",
		shortName: "DECIDE",
	},
	BURNOUT_ASSESSMENT: {
		entryKind: "burnout_assessment",
		displayName: "Burnout Assessment",
	},
	COMPASS_CHECK: {
		entryKind: "compass_check",
		displayName: "Values Compass Check",
	},
	COMMITMENT: {
		entryKind: "commitment",
		displayName: "Commitment Reflection",
	},
	GRATITUDE: {
		entryKind: "gratitude",
		displayName: "Gratitude Practice",
	},
	AFFIRMATION: {
		entryKind: "affirmation",
		displayName: "Daily Affirmation",
	},
	PERSONAL: {
		entryKind: "personal_reflection",
		displayName: "Personal Reflection",
	},
	EMOTION_CLARITY: {
		entryKind: "emotion-clarity",
		displayName: "Emotion Clarity Practice",
		shortName: "Emotion Clarity",
	},

	// Specialized Identity & Systemic Reflections
	BIPOC_WELLNESS: {
		entryKind: "bipoc_wellness_reflection",
		displayName: "BIPOC Interpreter Wellness",
		shortName: "BIPOC Wellness",
	},
	DEAF_INTERPRETER: {
		entryKind: "deaf_interpreter_reflection",
		displayName: "Deaf Interpreter Professional Identity",
		shortName: "DI/CDI Identity",
	},
	NEURODIVERGENT_INTERPRETER: {
		entryKind: "neurodivergent_interpreter_reflection",
		displayName: "Neurodivergent Interpreter Wellness",
		shortName: "ND Wellness",
	},
};

// Helper function to get all entry kinds for database queries
export function getAllEntryKinds(): string[] {
	return Object.values(REFLECTION_TYPES).map((type) => type.entryKind);
}

// Helper function to get display name from entry kind or data
export function getDisplayName(
	entryKind: string | null | undefined,
	data?: any,
): string {
	console.log("getDisplayName called with entryKind:", entryKind);
	console.log(
		"getDisplayName data keys:",
		data ? Object.keys(data).slice(0, 10) : "no data",
	);

	// Clean up entryKind by removing any session IDs (pattern: session_timestamp_randomid)
	if (entryKind) {
		entryKind = entryKind.replace(/session_\d+_\w+/g, '').trim();
		console.log("getDisplayName after cleaning session IDs:", entryKind);
	}

	// If no entry_kind, try to infer from data
	if (!entryKind && data) {
		console.log("No entryKind, checking data fields for type inference...");
		// Check for Post-Assignment Debrief (has duration, nextSteps, boundaries)
		if (data.duration && data.nextSteps && data.boundaries) {
			return "Post-Assignment Debrief";
		}

		// Check for Pre-Assignment Prep
		if (
			data.context_background ||
			data.materials_review ||
			data.anticipated_demands
		) {
			return "Pre-Assignment Prep";
		}

		// Check for Wellness Check-in
		if (data.current_feeling || data.wellness_score || data.stress_level) {
			return "Wellness Check-in";
		}

		// Check for Team reflections
		if (data.team_context || data.team_dynamics) {
			return "Teaming Prep";
		}
		if (data.team_effectiveness || data.collaboration_success) {
			return "Teaming Reflection";
		}

		// Check for Mentoring reflections
		if (data.mentoring_goals || data.mentoring_approach) {
			return "Mentoring Prep";
		}
		if (data.mentoring_outcomes || data.mentoring_insights) {
			return "Mentoring Reflection";
		}

		// Check for Role-Space
		if (data.role_space) {
			return "Role-Space Reflection";
		}

		// Check for Values Alignment
		if (data.values_reflection || data.ethical_considerations) {
			return "Values Alignment Check-In";
		}

		// Check for In-Session checks
		if (data.self_check || data.energy_check || data.focus_check) {
			return "In-Session Self-Check";
		}
		if (data.team_sync || data.sync_status || data.team_alignment) {
			return "In-Session Team Sync";
		}

		// Check for Direct Communication
		if (
			data.communication_scenario ||
			data.direct_communication ||
			data.communication_approach
		) {
			return "Supporting Direct Communication";
		}

		// Check for simple reflections
		if (data.commitment) return "Commitment Reflection";
		if (data.gratitude) return "Gratitude Practice";
		if (data.affirmation) return "Daily Affirmation";
	}

	if (!entryKind) {
		console.log("No entryKind at all, returning Personal Reflection");
		return "Personal Reflection";
	}

	// Find the reflection type with matching entryKind
	const reflectionType = Object.values(REFLECTION_TYPES).find(
		(type) => type.entryKind === entryKind,
	);

	if (reflectionType) {
		console.log("Found matching reflectionType:", reflectionType.displayName);
		return reflectionType.displayName;
	}

	console.log("No matching reflectionType found for entryKind:", entryKind);

	// Handle legacy or alternate formats
	const legacyMappings: Record<string, string> = {
		// Legacy snake_case to proper names
		wellness_check_in: "Wellness Check-in",
		role_space: "Role-Space Reflection",
		in_session_self: "In-Session Self-Check",
		in_session_team: "In-Session Team Sync",
		team_sync: "In-Session Team Sync",
		insession_selfcheck: "In-Session Self-Check",
		insession_team_sync: "In-Session Team Sync",
		direct_communication: "Supporting Direct Communication",
		values_compass: "Values Compass Check",
		values_alignment_checkin: "Values Alignment Check-In",
		teaming_prep_enhanced: "Teaming Prep",
		teaming_reflection_enhanced: "Teaming Reflection",
		mentoring_prep_enhanced: "Mentoring Prep",
		mentoring_reflection_enhanced: "Mentoring Reflection",

		// Handle variations with different cases
		"In-Session Self-Check": "In-Session Self-Check",
		"In-Session Team Sync": "In-Session Team Sync",
		"Values Alignment Check-In": "Values Alignment Check-In",
		"Wellness Check-in": "Wellness Check-in",
		"Pre-Assignment Prep": "Pre-Assignment Prep",
		"Post-Assignment Debrief": "Post-Assignment Debrief",
		"Teaming Prep": "Teaming Prep",
		"Teaming Reflection": "Teaming Reflection",
		"Mentoring Prep": "Mentoring Prep",
		"Mentoring Reflection": "Mentoring Reflection",
		"Role-Space Reflection": "Role-Space Reflection",
		"Supporting Direct Communication": "Supporting Direct Communication",

		// Specialized reflections
		bipoc_wellness_reflection: "BIPOC Interpreter Wellness",
		deaf_interpreter_reflection: "Deaf Interpreter Professional Identity",
		neurodivergent_interpreter_reflection: "Neurodivergent Interpreter Wellness",
		"BIPOC Interpreter Wellness": "BIPOC Interpreter Wellness",
		"Deaf Interpreter Professional Identity": "Deaf Interpreter Professional Identity",
		"Neurodivergent Interpreter Wellness": "Neurodivergent Interpreter Wellness",

		// Emotion Clarity
		"emotion-clarity": "Emotion Clarity Practice",
		"Emotion Clarity Practice": "Emotion Clarity Practice",
	};

	if (legacyMappings[entryKind]) {
		return legacyMappings[entryKind];
	}

	// Default formatting: replace underscores and capitalize
	return entryKind.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Helper function to get the correct entry kind for saving
export function getEntryKind(
	reflectionType: keyof typeof REFLECTION_TYPES,
): string {
	return REFLECTION_TYPES[reflectionType]?.entryKind || "personal_reflection";
}
