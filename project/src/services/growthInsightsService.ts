/**
 * Growth Insights Service
 *
 * Handles analysis and tracking of user growth patterns
 * from pre-assignment and other reflection data
 *
 * @module growthInsightsService
 */

import { supabase } from "../lib/supabase";

/**
 * Growth insight data structure
 */
export interface GrowthInsight {
	user_id: string;
	insight_type: string;
	category: string;
	value: any;
	metadata?: Record<string, any>;
	created_at: string;
	updated_at?: string;
}

/**
 * Aggregated growth metrics
 */
export interface GrowthMetrics {
	preparedness_score: number;
	self_awareness_level: number;
	role_clarity_score: number;
	ethical_awareness_score: number;
	growth_mindset_score: number;
	resilience_score: number;
	overall_progress: number;
}

/**
 * Update growth insights for a user based on their pre-assignment responses
 */
export async function updateGrowthInsightsForUser(
	userId: string,
	answers: Record<string, string>,
): Promise<{ success: boolean; error?: string; insights?: GrowthMetrics }> {
	try {
		// Analyze answers to generate insights
		const insights = analyzePreAssignmentAnswers(answers);

		// Store insights in database
		const { error: insightError } = await supabase
			.from("growth_insights")
			.upsert({
				user_id: userId,
				insight_type: "pre_assignment_analysis",
				data: insights,
				metadata: {
					question_count: Object.keys(answers).length,
					completion_time: new Date().toISOString(),
					categories_covered: extractCategories(answers),
				},
				updated_at: new Date().toISOString(),
			});

		if (insightError) throw insightError;

		// Update user's growth metrics
		const { error: metricsError } = await supabase
			.from("user_growth_metrics")
			.upsert({
				user_id: userId,
				...insights,
				last_assessment: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			});

		if (metricsError) throw metricsError;

		// Track growth trajectory
		await trackGrowthTrajectory(userId, insights);

		return {
			success: true,
			insights,
		};
	} catch (error) {
		console.error("Error updating growth insights:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to update growth insights",
		};
	}
}

/**
 * Analyze pre-assignment answers to generate growth metrics
 */
function analyzePreAssignmentAnswers(
	answers: Record<string, string>,
): GrowthMetrics {
	const metrics: GrowthMetrics = {
		preparedness_score: 0,
		self_awareness_level: 0,
		role_clarity_score: 0,
		ethical_awareness_score: 0,
		growth_mindset_score: 0,
		resilience_score: 0,
		overall_progress: 0,
	};

	// Preparedness Score (based on materials review and backup plans)
	if (answers.materials_review?.length > 50) metrics.preparedness_score += 30;
	if (answers.backup_plans?.length > 50) metrics.preparedness_score += 30;
	if (answers.control_strategies?.length > 50) metrics.preparedness_score += 40;

	// Self-Awareness Level (based on readiness and triggers)
	if (answers.readiness_levels?.length > 50) metrics.self_awareness_level += 40;
	if (answers.triggers_vulnerabilities?.length > 50)
		metrics.self_awareness_level += 40;
	if (answers.anticipated_demands?.length > 50)
		metrics.self_awareness_level += 20;

	// Role Clarity Score
	if (answers.role_space?.length > 100) {
		metrics.role_clarity_score = Math.min(
			100,
			50 + answers.role_space.length / 10,
		);
	}

	// Ethical Awareness Score
	if (answers.ethics_culture?.length > 50) {
		const hasEthicalConcerns =
			answers.ethics_culture.toLowerCase().includes("concern") ||
			answers.ethics_culture.toLowerCase().includes("dilemma");
		metrics.ethical_awareness_score = hasEthicalConcerns ? 80 : 60;
		if (answers.ethics_culture.length > 100)
			metrics.ethical_awareness_score += 20;
	}

	// Growth Mindset Score
	if (answers.growth_goals?.length > 50) {
		metrics.growth_mindset_score = 50;
		if (answers.growth_goals.toLowerCase().includes("learn"))
			metrics.growth_mindset_score += 20;
		if (answers.growth_goals.toLowerCase().includes("improve"))
			metrics.growth_mindset_score += 20;
		if (answers.growth_goals.toLowerCase().includes("develop"))
			metrics.growth_mindset_score += 10;
	}

	// Resilience Score (based on strategies and practices)
	if (answers.neuroscience_practices?.length > 50)
		metrics.resilience_score += 40;
	if (answers.control_strategies?.length > 50) metrics.resilience_score += 30;
	if (answers.backup_plans?.length > 50) metrics.resilience_score += 30;

	// Calculate overall progress (weighted average)
	metrics.overall_progress = Math.round(
		metrics.preparedness_score * 0.2 +
			metrics.self_awareness_level * 0.2 +
			metrics.role_clarity_score * 0.15 +
			metrics.ethical_awareness_score * 0.15 +
			metrics.growth_mindset_score * 0.15 +
			metrics.resilience_score * 0.15,
	);

	// Ensure all scores are between 0-100
	Object.keys(metrics).forEach((key) => {
		metrics[key as keyof GrowthMetrics] = Math.min(
			100,
			Math.max(0, metrics[key as keyof GrowthMetrics]),
		);
	});

	return metrics;
}

/**
 * Extract categories from answers
 */
function extractCategories(answers: Record<string, string>): string[] {
	const categories = new Set<string>();

	Object.keys(answers).forEach((key) => {
		if (key.includes("role")) categories.add("Role-Space");
		if (key.includes("neuroscience")) categories.add("Mental Readiness");
		if (key.includes("ethics")) categories.add("Ethics");
		if (key.includes("growth")) categories.add("Growth");
		if (key.includes("readiness")) categories.add("Wellness");
	});

	return Array.from(categories);
}

/**
 * Track growth trajectory over time
 */
async function trackGrowthTrajectory(
	userId: string,
	currentMetrics: GrowthMetrics,
): Promise<void> {
	try {
		// Get previous metrics
		const { data: previousData } = await supabase
			.from("user_growth_metrics")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.limit(2);

		if (previousData && previousData.length > 1) {
			const previous = previousData[1];
			const trajectory = {
				user_id: userId,
				preparedness_change:
					currentMetrics.preparedness_score -
					(previous.preparedness_score || 0),
				self_awareness_change:
					currentMetrics.self_awareness_level -
					(previous.self_awareness_level || 0),
				role_clarity_change:
					currentMetrics.role_clarity_score -
					(previous.role_clarity_score || 0),
				ethical_awareness_change:
					currentMetrics.ethical_awareness_score -
					(previous.ethical_awareness_score || 0),
				growth_mindset_change:
					currentMetrics.growth_mindset_score -
					(previous.growth_mindset_score || 0),
				resilience_change:
					currentMetrics.resilience_score - (previous.resilience_score || 0),
				overall_change:
					currentMetrics.overall_progress - (previous.overall_progress || 0),
				period_start: previous.created_at,
				period_end: new Date().toISOString(),
			};

			await supabase.from("growth_trajectory").insert(trajectory);
		}
	} catch (error) {
		console.error("Error tracking growth trajectory:", error);
	}
}

/**
 * Get user's growth insights
 */
export async function getUserGrowthInsights(userId: string): Promise<{
	metrics?: GrowthMetrics;
	trajectory?: any[];
	error?: string;
}> {
	try {
		// Get current metrics
		const { data: metricsData, error: metricsError } = await supabase
			.from("user_growth_metrics")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.limit(1)
			.single();

		if (metricsError && metricsError.code !== "PGRST116") {
			throw metricsError;
		}

		// Get trajectory data
		const { data: trajectoryData, error: trajectoryError } = await supabase
			.from("growth_trajectory")
			.select("*")
			.eq("user_id", userId)
			.order("period_end", { ascending: false })
			.limit(10);

		if (trajectoryError) {
			throw trajectoryError;
		}

		return {
			metrics: metricsData || undefined,
			trajectory: trajectoryData || [],
		};
	} catch (error) {
		console.error("Error getting growth insights:", error);
		return {
			error:
				error instanceof Error
					? error.message
					: "Failed to retrieve growth insights",
		};
	}
}

/**
 * Generate personalized recommendations based on metrics
 */
export function generateRecommendations(metrics: GrowthMetrics): string[] {
	const recommendations: string[] = [];

	if (metrics.preparedness_score < 70) {
		recommendations.push(
			"Consider spending more time reviewing materials before assignments",
		);
	}

	if (metrics.self_awareness_level < 70) {
		recommendations.push(
			"Practice daily self-check-ins to improve emotional awareness",
		);
	}

	if (metrics.role_clarity_score < 70) {
		recommendations.push(
			"Review professional boundaries and role-space guidelines",
		);
	}

	if (metrics.ethical_awareness_score < 70) {
		recommendations.push(
			"Engage with ethics case studies and reflection exercises",
		);
	}

	if (metrics.growth_mindset_score < 70) {
		recommendations.push("Set specific learning goals for each assignment");
	}

	if (metrics.resilience_score < 70) {
		recommendations.push(
			"Develop a toolkit of coping strategies and self-care practices",
		);
	}

	if (metrics.overall_progress > 80) {
		recommendations.push(
			"You're doing great! Consider mentoring others or taking on more challenging assignments",
		);
	}

	return recommendations;
}
