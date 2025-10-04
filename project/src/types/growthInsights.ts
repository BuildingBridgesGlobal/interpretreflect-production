/**
 * Type definitions for Growth Insights views in Supabase
 * These interfaces match the expected column types from the database views
 */

// ============================================
// gi_teamwork view
// ============================================
export interface GITeamwork {
	user_id: string; // UUID
	created_at: string; // timestamp with time zone
	entry_kind: string; // text
	agreements_fidelity: number; // integer (0-100)
	top_drift_area: string; // text
	team_effectiveness: number; // integer (0-100)
	rn: number; // bigint (row number)
}

// ============================================
// gi_values view
// ============================================
export interface GIValues {
	user_id: string; // UUID
	created_at: string; // timestamp with time zone
	entry_kind: string; // text
	top_active_value: string; // text
	gray_zone_focus: string; // text
	values_alignment_score: number; // integer (0-100)
	rn: number; // bigint (row number)
}

// ============================================
// gi_stress_energy view
// ============================================
export interface GIStressEnergy {
	user_id: string; // UUID
	created_at: string; // timestamp with time zone
	stress_level: number; // integer (1-10)
	energy_level: number; // integer (1-10)
	overall_wellbeing: number; // integer (1-10)
	date: string; // date
}

// ============================================
// gi_reflections_summary view
// ============================================
export interface GIReflectionsSummary {
	user_id: string; // UUID
	total_reflections: number; // bigint
	unique_types: number; // bigint
	past_month: number; // bigint
	past_week: number; // bigint
	previous_week: number; // bigint
	last_reflection_date: string; // timestamp with time zone
	pre_assignment_count: number; // bigint
	post_assignment_count: number; // bigint
	wellness_count: number; // bigint
	values_count: number; // bigint
	team_count: number; // bigint
	mentoring_count: number; // bigint
}

// ============================================
// gi_recovery_habits view
// ============================================
export interface GIRecoveryHabits {
	user_id: string; // UUID
	created_at: string; // timestamp with time zone
	recovery_status: "excellent" | "good" | "fair" | "needs attention"; // text
	weekly_recovery_score: number; // numeric (0-100)
	self_care_commitment: string | null; // text (nullable)
	recent_self_care: string | null; // text (nullable)
	rn: number; // bigint (row number)
}

// ============================================
// gi_reset_toolkit view
// ============================================
export interface GIResetToolkit {
	user_id: string; // UUID
	technique: string; // text
	usage_count: number; // bigint
	completion_rate: number; // numeric (0-100)
	avg_stress_relief: number | null; // numeric (nullable)
	last_used: string; // timestamp with time zone
	weekly_usage: number; // bigint
}

// ============================================
// API Response Types (for edge functions)
// ============================================

export interface GrowthInsightsSummaryResponse {
	totalReflections: number;
	reflectionsByType: Record<string, number>;
	weekOverWeek: {
		current: number;
		previous: number;
		percentChange: number;
	};
}

export interface LatestInsightsResponse {
	teamwork: {
		agreementsFidelity: number;
		topDriftArea: string;
		lastUpdated: string;
	};
	values: {
		topActiveValue: string;
		grayZoneFocus: string;
		lastUpdated: string;
	};
	recovery: {
		weeklyScore: number;
		recentHabits: Array<{
			type: string;
			value: string;
			timestamp: string;
		}>;
	};
}

export interface ResetToolkitResponse {
	mostEffective: string;
	completionRate: number;
	avgStressRelief: number;
	tryNext: string;
	weeklyUsage: number;
}

// ============================================
// Database column types for information_schema
// ============================================

export const COLUMN_TYPES = {
	gi_teamwork: {
		user_id: "uuid",
		created_at: "timestamp with time zone",
		entry_kind: "text",
		agreements_fidelity: "integer",
		top_drift_area: "text",
		team_effectiveness: "integer",
		rn: "bigint",
	},
	gi_values: {
		user_id: "uuid",
		created_at: "timestamp with time zone",
		entry_kind: "text",
		top_active_value: "text",
		gray_zone_focus: "text",
		values_alignment_score: "integer",
		rn: "bigint",
	},
	gi_stress_energy: {
		user_id: "uuid",
		created_at: "timestamp with time zone",
		stress_level: "integer",
		energy_level: "integer",
		overall_wellbeing: "integer",
		date: "date",
	},
	gi_reflections_summary: {
		user_id: "uuid",
		total_reflections: "bigint",
		unique_types: "bigint",
		past_month: "bigint",
		past_week: "bigint",
		previous_week: "bigint",
		last_reflection_date: "timestamp with time zone",
		pre_assignment_count: "bigint",
		post_assignment_count: "bigint",
		wellness_count: "bigint",
		values_count: "bigint",
		team_count: "bigint",
		mentoring_count: "bigint",
	},
	gi_recovery_habits: {
		user_id: "uuid",
		created_at: "timestamp with time zone",
		recovery_status: "text", // enum: excellent, good, fair, needs attention
		weekly_recovery_score: "numeric",
		self_care_commitment: "text", // nullable
		recent_self_care: "text", // nullable
		rn: "bigint",
	},
	gi_reset_toolkit: {
		user_id: "uuid",
		technique: "text",
		usage_count: "bigint",
		completion_rate: "numeric",
		avg_stress_relief: "numeric", // nullable
		last_used: "timestamp with time zone",
		weekly_usage: "bigint",
	},
};
