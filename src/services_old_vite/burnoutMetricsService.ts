import { supabase } from "../lib/supabase";

interface BurnoutMetrics {
	date: string;
	score: number;
	source: string;
	components?: {
		stress?: number;
		energy?: number;
		confidence?: number;
		emotional?: number;
	};
}

export class BurnoutMetricsService {
	/**
	 * Extract burnout-related metrics from any reflection data
	 */
	static extractBurnoutScore(data: any, entryKind: string): number | null {
		// Different reflection types have different metric fields
		const metricsMap: Record<string, (data: any) => number | null> = {
			burnout_assessment: (d) => {
				// Direct burnout assessment - use total score (5-25 range)
				return d.total_score ? parseFloat(d.total_score) : null;
			},
			wellness_check_in: (d) => {
				// Wellness check-in - calculate from multiple factors
				const stress = d.stress_level || d.current_stress_level || 5;
				const energy = d.energy_level || d.physical_energy || 5;
				const emotional = d.emotional_state || 5;
				// Invert stress (lower is better) and combine with energy and emotional
				const combined = (10 - stress + energy + emotional) / 3;
				return Math.round(combined * 5); // Scale to 5-25 range
			},
			pre_assignment_prep: (d) => {
				// Pre-assignment - use confidence and stress
				const confidence = d.confidence_level || d.confidence_rating || 5;
				const stress = d.stress_level || d.anticipated_stress || 5;
				return Math.round(((confidence + (10 - stress)) / 2) * 2.5); // Scale to 5-25
			},
			post_assignment_debrief: (d) => {
				// Post-assignment - use energy and stress post-levels
				const energy = d.energy_level_post || d.energy_level || 5;
				const stress = d.stress_level_post || d.stress_level || 5;
				const satisfaction = d.satisfaction_level || 5;
				return Math.round(((10 - stress + energy + satisfaction) / 3) * 2.5);
			},
			teaming_reflection: (d) => {
				// Team reflection - use collaboration and stress metrics
				const teamDynamics = d.team_dynamics_rating || 5;
				const stress = d.session_stress || 5;
				const energy = d.energy_after || 5;
				return Math.round(((10 - stress + energy + teamDynamics) / 3) * 2.5);
			},
			mentoring_reflection: (d) => {
				// Mentoring - use growth and energy metrics
				const growth = d.growth_rating || 5;
				const energy = d.energy_level || 5;
				const value = d.session_value || 5;
				return Math.round(((growth + energy + value) / 3) * 2.5);
			},
		};

		const extractor = metricsMap[entryKind];
		if (extractor) {
			return extractor(data);
		}

		// Default extraction for unknown types - look for common fields
		if (data.overall_wellbeing) {
			return data.overall_wellbeing * 2.5; // Scale 1-10 to 5-25
		}
		if (data.stress_level && data.energy_level) {
			const stress = data.stress_level;
			const energy = data.energy_level;
			return Math.round(((10 - stress + energy) / 2) * 2.5);
		}

		return null;
	}

	/**
	 * Save or update daily burnout score
	 */
	static async saveDailyBurnoutScore(
		userId: string,
		date: string,
		score: number,
		source: string,
	): Promise<void> {
		try {
			// Check if we already have an entry for this date
			const { data: existing } = await supabase
				.from("burnout_assessments")
				.select("*")
				.eq("user_id", userId)
				.eq("assessment_date", date)
				.single();

			if (existing) {
				// Update with average of existing and new score
				const avgScore = (parseFloat(existing.total_score) + score) / 2;

				await supabase
					.from("burnout_assessments")
					.update({
						total_score: avgScore.toString(),
						updated_at: new Date().toISOString(),
						// Update risk level based on new average
						risk_level: BurnoutMetricsService.getRiskLevel(avgScore),
					})
					.eq("id", existing.id);
			} else {
				// Create new entry
				await supabase.from("burnout_assessments").insert({
					user_id: userId,
					assessment_date: date,
					total_score: score.toString(),
					risk_level: BurnoutMetricsService.getRiskLevel(score),
					// Set individual components to neutral if not from direct assessment
					energy_tank: source === "burnout_assessment" ? null : 3,
					recovery_speed: source === "burnout_assessment" ? null : 3,
					emotional_leakage: source === "burnout_assessment" ? null : 3,
					performance_signal: source === "burnout_assessment" ? null : 3,
					tomorrow_readiness: source === "burnout_assessment" ? null : 3,
				});
			}
		} catch (error) {
			console.error("Error saving daily burnout score:", error);
		}
	}

	/**
	 * Calculate risk level based on score
	 */
	static getRiskLevel(score: number): "low" | "moderate" | "high" | "severe" {
		if (score >= 20) return "low";
		if (score >= 15) return "moderate";
		if (score >= 10) return "high";
		return "severe";
	}

	/**
	 * Process any reflection entry to extract and save burnout metrics
	 */
	static async processReflectionForBurnout(
		userId: string,
		entryKind: string,
		data: any,
	): Promise<void> {
		// Extract burnout score from the reflection data
		const score = BurnoutMetricsService.extractBurnoutScore(data, entryKind);

		if (score !== null) {
			// Use today's date or the date from the reflection
			const date = data.date || new Date().toISOString().split("T")[0];

			// Save the daily burnout score
			await BurnoutMetricsService.saveDailyBurnoutScore(
				userId,
				date,
				score,
				entryKind,
			);
		}
	}

	/**
	 * Get burnout trend data for display
	 */
	static async getBurnoutTrend(
		userId: string,
		days: number = 30,
	): Promise<BurnoutMetrics[]> {
		try {
			const { data, error } = await supabase
				.from("burnout_assessments")
				.select("*")
				.eq("user_id", userId)
				.order("assessment_date", { ascending: false })
				.limit(days);

			if (error) throw error;

			return (
				data?.map((b) => ({
					date: new Date(b.assessment_date).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					}),
					score: Math.round((parseFloat(b.total_score) / 25) * 10), // Normalize to 1-10
					source: "assessment",
					components: {
						energy: b.energy_tank,
						emotional: b.emotional_leakage,
						performance: b.performance_signal,
					},
				})) || []
			);
		} catch (error) {
			console.error("Error fetching burnout trend:", error);
			return [];
		}
	}

	/**
	 * Calculate today's burnout prediction based on recent patterns
	 */
	static async predictTodaysBurnout(userId: string): Promise<number | null> {
		try {
			const trend = await BurnoutMetricsService.getBurnoutTrend(userId, 7);

			if (trend.length < 3) return null; // Not enough data

			// Simple moving average prediction
			const recentScores = trend.slice(0, 3).map((t) => t.score);
			const average =
				recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

			// Add slight trend adjustment
			if (trend.length > 1) {
				const trendDirection = trend[0].score - trend[1].score;
				return Math.round(average + trendDirection * 0.2); // 20% trend influence
			}

			return Math.round(average);
		} catch (error) {
			console.error("Error predicting burnout:", error);
			return null;
		}
	}
}
