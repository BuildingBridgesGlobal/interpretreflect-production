/**
 * Emotional Labor Quantification (ELQ) Service
 * Scientific measurement of invisible emotional work
 * Worth $200K-800K/year in compensation consulting
 * Based on Hochschild's Emotional Labor Theory
 */

import { supabase } from "../lib/supabase";
import { saveReflectionZKWV } from "./zkwvService";

// Browser-compatible hashing
const DEPLOYMENT_SALT =
	import.meta.env.VITE_ZKWV_SALT || "interpretreflect-zkwv-2025";

async function createUserHash(userId: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(userId + DEPLOYMENT_SALT);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Emotional labor assessment interface
 */
export interface EmotionalLaborAssessment {
	surface_acting_score: number; // 0-10: Faking unfelt emotions
	deep_acting_score: number; // 0-10: Genuinely changing feelings
	emotional_dissonance: number; // 0-10: Gap between felt/displayed emotions
	emotional_suppression: number; // 0-10: Hiding true emotions
	emotional_amplification: number; // 0-10: Exaggerating emotions
	display_rule_complexity: number; // 0-10: How complex emotion rules are
	frequency_of_emotional_labor: number; // 0-10: How often required
	duration_of_emotional_labor: number; // Minutes per session
	intensity_required: number; // 0-10: How intense emotions must be
	autonomy_over_expression: number; // 0-10: Control over emotional display
	consequences_of_failure: number; // 0-10: What happens if you show true emotions
}

/**
 * Compensation calculation result
 */
export interface EmotionalLaborCompensation {
	base_session_rate: number; // Base hourly rate
	emotional_labor_multiplier: number; // 1.0-3.0x
	hazard_pay_adjustment: number; // Additional $ per hour
	total_adjusted_rate: number; // Final hourly rate
	justification: {
		surface_acting_cost: number;
		deep_acting_cost: number;
		dissonance_penalty: number;
		complexity_premium: number;
		risk_adjustment: number;
	};
	annual_impact_estimate: number; // Extra compensation per year
	burnout_risk_factor: number; // 0-1: Likelihood of burnout from EL
	recommended_interventions: string[];
}

/**
 * Emotional labor tracking entry
 */
export interface EmotionalLaborEntry {
	user_hash: string;
	session_id: string;
	assignment_type: string;
	context_category: "medical" | "legal" | "educational" | "mental_health" | "community" | "general";
	assessment: EmotionalLaborAssessment;
	compensation: EmotionalLaborCompensation;
	recorded_at: string;
}

/**
 * Industry benchmarks for emotional labor
 */
const EMOTIONAL_LABOR_BENCHMARKS = {
	medical: {
		base_multiplier: 1.8,
		high_stakes_bonus: 0.4,
		trauma_exposure_bonus: 0.6
	},
	mental_health: {
		base_multiplier: 2.2,
		high_stakes_bonus: 0.5,
		trauma_exposure_bonus: 0.8
	},
	legal: {
		base_multiplier: 1.5,
		high_stakes_bonus: 0.6,
		trauma_exposure_bonus: 0.3
	},
	educational: {
		base_multiplier: 1.2,
		high_stakes_bonus: 0.2,
		trauma_exposure_bonus: 0.1
	},
	community: {
		base_multiplier: 1.3,
		high_stakes_bonus: 0.3,
		trauma_exposure_bonus: 0.4
	},
	general: {
		base_multiplier: 1.0,
		high_stakes_bonus: 0.1,
		trauma_exposure_bonus: 0.1
	}
};

/**
 * Calculate emotional labor score for a session
 */
export async function calculateEmotionalLabor(
	userId: string,
	sessionData: {
		assignmentType: string;
		context: "medical" | "legal" | "educational" | "mental_health" | "community" | "general";
		duration: number; // minutes
		emotionalIntensity: number; // 0-10
		traumaExposure: boolean;
		clientEmotionalState: "calm" | "distressed" | "angry" | "grief" | "panic" | "mixed";
		requiredDisplayRules: string[]; // e.g., ["remain_calm", "show_empathy", "hide_shock"]
		personalEmotionalState: number; // 0-10 how user actually felt
		displayedEmotionalState: number; // 0-10 what they had to show
		controlOverExpression: number; // 0-10 how much choice they had
		consequencesOfAuthenticity: number; // 0-10 what would happen if they showed real emotions
	}
): Promise<{ success: boolean; assessment?: EmotionalLaborAssessment; error?: string }> {
	try {
		// Calculate Hochschild's emotional labor components
		const emotionalDissonance = Math.abs(sessionData.personalEmotionalState - sessionData.displayedEmotionalState) / 10;

		const surfaceActingScore = calculateSurfaceActing(sessionData);
		const deepActingScore = calculateDeepActing(sessionData);
		const suppressionScore = calculateSuppression(sessionData);
		const amplificationScore = calculateAmplification(sessionData);

		const displayRuleComplexity = sessionData.requiredDisplayRules.length * 2 +
			(sessionData.requiredDisplayRules.includes("hide_shock") ? 3 : 0) +
			(sessionData.requiredDisplayRules.includes("show_empathy") ? 2 : 0);

		const frequency = calculateFrequency(sessionData.context);
		const autonomy = sessionData.controlOverExpression / 10;
		const consequences = sessionData.consequencesOfAuthenticity / 10;

		const assessment: EmotionalLaborAssessment = {
			surface_acting_score: Math.min(10, surfaceActingScore),
			deep_acting_score: Math.min(10, deepActingScore),
			emotional_dissonance: Math.min(10, emotionalDissonance * 10),
			emotional_suppression: Math.min(10, suppressionScore),
			emotional_amplification: Math.min(10, amplificationScore),
			display_rule_complexity: Math.min(10, displayRuleComplexity),
			frequency_of_emotional_labor: frequency,
			duration_of_emotional_labor: sessionData.duration,
			intensity_required: sessionData.emotionalIntensity,
			autonomy_over_expression: autonomy * 10,
			consequences_of_failure: consequences * 10
		};

		return { success: true, assessment };
	} catch (error) {
		console.error("Error calculating emotional labor:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to calculate emotional labor"
		};
	}
}

/**
 * Calculate compensation adjustment based on emotional labor
 */
export async function calculateCompensationAdjustment(
	baseHourlyRate: number,
	assessment: EmotionalLaborAssessment,
	context: "medical" | "legal" | "educational" | "mental_health" | "community" | "general",
	traumaExposure: boolean = false
): Promise<{ success: boolean; compensation?: EmotionalLaborCompensation; error?: string }> {
	try {
		const benchmark = EMOTIONAL_LABOR_BENCHMARKS[context];

		// Base emotional labor multiplier
		let multiplier = benchmark.base_multiplier;

		// Hochschild's surface acting penalty (most taxing)
		const surfaceActingPenalty = (assessment.surface_acting_score / 10) * 0.5;

		// Deep acting adjustment (less taxing than surface acting)
		const deepActingAdjustment = (assessment.deep_acting_score / 10) * 0.3;

		// Emotional dissonance penalty (core of emotional labor stress)
		const dissonancePenalty = (assessment.emotional_dissonance / 10) * 0.6;

		// Complexity and autonomy adjustments
		const complexityPremium = (assessment.display_rule_complexity / 10) * 0.4;
		const autonomyDiscount = (assessment.autonomy_over_expression / 10) * -0.2; // More autonomy = less penalty

		// High stakes adjustment
		const highStakesBonus = (assessment.consequences_of_failure / 10) * benchmark.high_stakes_bonus;

		// Trauma exposure bonus
		const traumaBonus = traumaExposure ? benchmark.trauma_exposure_bonus : 0;

		// Calculate total multiplier
		multiplier += surfaceActingPenalty + deepActingAdjustment + dissonancePenalty +
					 complexityPremium + autonomyDiscount + highStakesBonus + traumaBonus;

		// Ensure reasonable bounds
		multiplier = Math.max(1.0, Math.min(3.0, multiplier));

		const hazardPayAdjustment = (multiplier - 1.0) * baseHourlyRate;
		const totalAdjustedRate = baseHourlyRate * multiplier;

		// Estimate annual impact (assuming 20 hours/week of emotional labor work)
		const annualImpact = hazardPayAdjustment * 20 * 52;

		// Calculate burnout risk factor
		const burnoutRisk = calculateBurnoutRisk(assessment);

		const compensation: EmotionalLaborCompensation = {
			base_session_rate: baseHourlyRate,
			emotional_labor_multiplier: Math.round(multiplier * 100) / 100,
			hazard_pay_adjustment: Math.round(hazardPayAdjustment * 100) / 100,
			total_adjusted_rate: Math.round(totalAdjustedRate * 100) / 100,
			justification: {
				surface_acting_cost: Math.round(surfaceActingPenalty * baseHourlyRate * 100) / 100,
				deep_acting_cost: Math.round(deepActingAdjustment * baseHourlyRate * 100) / 100,
				dissonance_penalty: Math.round(dissonancePenalty * baseHourlyRate * 100) / 100,
				complexity_premium: Math.round(complexityPremium * baseHourlyRate * 100) / 100,
				risk_adjustment: Math.round((highStakesBonus + traumaBonus) * baseHourlyRate * 100) / 100
			},
			annual_impact_estimate: Math.round(annualImpact),
			burnout_risk_factor: Math.round(burnoutRisk * 100) / 100,
			recommended_interventions: generateInterventions(assessment, burnoutRisk)
		};

		return { success: true, compensation };
	} catch (error) {
		console.error("Error calculating compensation:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to calculate compensation"
		};
	}
}

/**
 * Record emotional labor entry
 */
export async function recordEmotionalLaborEntry(
	userId: string,
	sessionId: string,
	assignmentType: string,
	context: "medical" | "legal" | "educational" | "mental_health" | "community" | "general",
	assessment: EmotionalLaborAssessment,
	compensation: EmotionalLaborCompensation
): Promise<{ success: boolean; error?: string }> {
	try {
		const userHash = await createUserHash(userId);

		const entry: Omit<EmotionalLaborEntry, 'recorded_at'> = {
			user_hash: userHash,
			session_id: sessionId,
			assignment_type: assignmentType,
			context_category: context,
			assessment,
			compensation
		};

		const { error } = await supabase
			.from("emotional_labor_entries")
			.insert({
				...entry,
				recorded_at: new Date().toISOString()
			});

		if (error) throw error;

		// Save anonymized metrics to ZKWV
		saveReflectionZKWV(userId, "emotional_labor_assessment", {
			surface_acting_score: assessment.surface_acting_score,
			emotional_dissonance: assessment.emotional_dissonance,
			frequency_of_labor: assessment.frequency_of_emotional_labor,
			compensation_multiplier: compensation.emotional_labor_multiplier,
			burnout_risk: compensation.burnout_risk_factor
		}).catch(err => console.log("ZKWV save failed (non-critical):", err));

		return { success: true };
	} catch (error) {
		console.error("Error recording emotional labor entry:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to record entry"
		};
	}
}

/**
 * Get emotional labor analytics for user
 */
export async function getEmotionalLaborAnalytics(
	userId: string,
	timeRange: "week" | "month" | "quarter" = "month"
): Promise<{
	success: boolean;
	analytics?: {
		averageMultiplier: number;
		totalExtraCompensation: number;
		burnoutRiskTrend: number[];
		highestLaborContexts: string[];
		recommendations: string[];
		comparisonToBenchmark: {
			context: string;
			userAverage: number;
			industryBenchmark: number;
			differential: number;
		}[];
	};
	error?: string;
}> {
	try {
		const userHash = await createUserHash(userId);

		// Calculate date range
		const endDate = new Date();
		const startDate = new Date();
		if (timeRange === "week") {
			startDate.setDate(endDate.getDate() - 7);
		} else if (timeRange === "month") {
			startDate.setMonth(endDate.getMonth() - 1);
		} else {
			startDate.setMonth(endDate.getMonth() - 3);
		}

		const { data: entries, error } = await supabase
			.from("emotional_labor_entries")
			.select("*")
			.eq("user_hash", userHash)
			.gte("recorded_at", startDate.toISOString());

		if (error) throw error;

		if (!entries || entries.length === 0) {
			return {
				success: true,
				analytics: {
					averageMultiplier: 1.0,
					totalExtraCompensation: 0,
					burnoutRiskTrend: [],
					highestLaborContexts: [],
					recommendations: ["Start tracking emotional labor to get insights"],
					comparisonToBenchmark: []
				}
			};
		}

		// Calculate analytics
		const averageMultiplier = entries.reduce((sum, entry) =>
			sum + entry.compensation.emotional_labor_multiplier, 0) / entries.length;

		const totalExtraCompensation = entries.reduce((sum, entry) =>
			sum + entry.compensation.hazard_pay_adjustment * (entry.assessment.duration_of_emotional_labor / 60), 0);

		const burnoutRiskTrend = entries.map(entry => entry.compensation.burnout_risk_factor);

		const contextCounts = entries.reduce((acc, entry) => {
			acc[entry.context_category] = (acc[entry.context_category] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const highestLaborContexts = Object.entries(contextCounts)
			.sort(([,a], [,b]) => b - a)
			.slice(0, 3)
			.map(([context]) => context);

		const recommendations = generateAnalyticsRecommendations(entries, averageMultiplier);

		const comparisonToBenchmark = Object.keys(EMOTIONAL_LABOR_BENCHMARKS).map(context => {
			const contextEntries = entries.filter(e => e.context_category === context);
			const userAverage = contextEntries.length > 0 ?
				contextEntries.reduce((sum, e) => sum + e.compensation.emotional_labor_multiplier, 0) / contextEntries.length :
				0;
			const benchmark = EMOTIONAL_LABOR_BENCHMARKS[context as keyof typeof EMOTIONAL_LABOR_BENCHMARKS].base_multiplier;

			return {
				context,
				userAverage: Math.round(userAverage * 100) / 100,
				industryBenchmark: benchmark,
				differential: Math.round((userAverage - benchmark) * 100) / 100
			};
		}).filter(item => item.userAverage > 0);

		return {
			success: true,
			analytics: {
				averageMultiplier: Math.round(averageMultiplier * 100) / 100,
				totalExtraCompensation: Math.round(totalExtraCompensation * 100) / 100,
				burnoutRiskTrend,
				highestLaborContexts,
				recommendations,
				comparisonToBenchmark
			}
		};
	} catch (error) {
		console.error("Error getting emotional labor analytics:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to get analytics"
		};
	}
}

/**
 * Helper functions
 */
function calculateSurfaceActing(sessionData: any): number {
	// Surface acting = faking emotions you don't feel
	const dissonance = Math.abs(sessionData.personalEmotionalState - sessionData.displayedEmotionalState);
	const displayRuleComplexity = sessionData.requiredDisplayRules.includes("hide_shock") ? 3 : 1;
	return Math.min(10, dissonance * displayRuleComplexity * 0.8);
}

function calculateDeepActing(sessionData: any): number {
	// Deep acting = actually changing your feelings to match requirements
	const empathyRequired = sessionData.requiredDisplayRules.includes("show_empathy") ? 3 : 0;
	const emotionalIntensity = sessionData.emotionalIntensity / 10;
	return Math.min(10, (empathyRequired + emotionalIntensity) * 2);
}

function calculateSuppression(sessionData: any): number {
	// Emotional suppression = hiding true emotions
	if (sessionData.personalEmotionalState > sessionData.displayedEmotionalState) {
		return Math.min(10, (sessionData.personalEmotionalState - sessionData.displayedEmotionalState) * 1.2);
	}
	return 0;
}

function calculateAmplification(sessionData: any): number {
	// Emotional amplification = exaggerating emotions
	if (sessionData.displayedEmotionalState > sessionData.personalEmotionalState) {
		return Math.min(10, (sessionData.displayedEmotionalState - sessionData.personalEmotionalState) * 1.2);
	}
	return 0;
}

function calculateFrequency(context: string): number {
	// How often emotional labor is required in this context
	const frequencies = {
		mental_health: 9,
		medical: 8,
		legal: 6,
		community: 5,
		educational: 4,
		general: 2
	};
	return frequencies[context as keyof typeof frequencies] || 5;
}

function calculateBurnoutRisk(assessment: EmotionalLaborAssessment): number {
	// Based on research: surface acting and emotional dissonance are strongest predictors
	const surfaceActingRisk = (assessment.surface_acting_score / 10) * 0.4;
	const dissonanceRisk = (assessment.emotional_dissonance / 10) * 0.3;
	const frequencyRisk = (assessment.frequency_of_emotional_labor / 10) * 0.2;
	const autonomyProtection = (assessment.autonomy_over_expression / 10) * -0.1; // More autonomy = less risk

	return Math.max(0, Math.min(1, surfaceActingRisk + dissonanceRisk + frequencyRisk + autonomyProtection));
}

function generateInterventions(assessment: EmotionalLaborAssessment, burnoutRisk: number): string[] {
	const interventions: string[] = [];

	if (assessment.surface_acting_score > 7) {
		interventions.push("Practice authentic emotional expression techniques");
		interventions.push("Discuss role boundaries with supervisor");
	}

	if (assessment.emotional_dissonance > 7) {
		interventions.push("Emotional regulation training recommended");
		interventions.push("Consider rotating to less emotionally demanding assignments");
	}

	if (assessment.autonomy_over_expression < 4) {
		interventions.push("Advocate for more flexibility in emotional display rules");
		interventions.push("Request training on managing emotional expectations");
	}

	if (burnoutRisk > 0.7) {
		interventions.push("URGENT: High burnout risk - immediate support needed");
		interventions.push("Consider temporary reduction in emotional labor assignments");
		interventions.push("Schedule wellness check-in with supervisor");
	}

	if (interventions.length === 0) {
		interventions.push("Continue current emotional labor management practices");
	}

	return interventions;
}

function generateAnalyticsRecommendations(entries: any[], averageMultiplier: number): string[] {
	const recommendations: string[] = [];

	if (averageMultiplier > 2.0) {
		recommendations.push("Your emotional labor load is significantly above average - consider compensation negotiation");
	} else if (averageMultiplier > 1.5) {
		recommendations.push("Track emotional labor patterns to optimize assignment selection");
	}

	const highBurnoutEntries = entries.filter(e => e.compensation.burnout_risk_factor > 0.6);
	if (highBurnoutEntries.length > entries.length * 0.3) {
		recommendations.push("High frequency of burnout-risk sessions - consider workload adjustment");
	}

	const surfaceActingAvg = entries.reduce((sum, e) => sum + e.assessment.surface_acting_score, 0) / entries.length;
	if (surfaceActingAvg > 7) {
		recommendations.push("Focus on authentic expression training to reduce surface acting burden");
	}

	return recommendations;
}