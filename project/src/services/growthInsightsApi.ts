import { supabase } from "../lib/supabase";

interface GrowthInsightsSummary {
	totalReflections: number;
	reflectionsByType: Record<string, number>;
	weekOverWeek: {
		current: number;
		previous: number;
		percentChange: number;
	};
}

interface LatestInsights {
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

interface ResetToolkitData {
	mostEffective: string;
	completionRate: number;
	avgStressRelief: number;
	tryNext: string;
	weeklyUsage: number;
}

class GrowthInsightsApiService {
	async getSession() {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session) {
			throw new Error("No active session");
		}
		return session;
	}

	async getSummary(range: string = "30d"): Promise<GrowthInsightsSummary> {
		try {
			const session = await this.getSession();

			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/growth-insights-api/summary?range=${range}`,
				{
					headers: {
						Authorization: `Bearer ${session.access_token}`,
						"Content-Type": "application/json",
					},
				},
			);

			if (!response.ok) {
				console.warn(
					"Growth insights summary API not available, using fallback",
				);
				return this.getSummaryFallback();
			}

			return await response.json();
		} catch (error) {
			console.error("Error fetching growth insights summary:", error);
			return this.getSummaryFallback();
		}
	}

	async getSummaryFallback(): Promise<GrowthInsightsSummary> {
		try {
			const session = await this.getSession();

			// Calculate date ranges
			const now = new Date();
			const thirtyDaysAgo = new Date(now);
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			const sevenDaysAgo = new Date(now);
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

			const fourteenDaysAgo = new Date(now);
			fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

			// Fetch reflections from the last 30 days
			const { data: reflections, error } = await supabase
				.from("reflection_entries")
				.select("entry_kind, created_at")
				.eq("user_id", session.user.id)
				.gte("created_at", thirtyDaysAgo.toISOString())
				.order("created_at", { ascending: false });

			if (error) throw error;

			// Calculate metrics
			const totalReflections = reflections?.length || 0;

			const reflectionsByType =
				reflections?.reduce(
					(acc, r) => {
						const type = r.entry_kind || "personal_reflection";
						acc[type] = (acc[type] || 0) + 1;
						return acc;
					},
					{} as Record<string, number>,
				) || {};

			const currentWeek =
				reflections?.filter((r) => new Date(r.created_at) >= sevenDaysAgo)
					.length || 0;

			const previousWeek =
				reflections?.filter(
					(r) =>
						new Date(r.created_at) >= fourteenDaysAgo &&
						new Date(r.created_at) < sevenDaysAgo,
				).length || 0;

			const percentChange =
				previousWeek === 0
					? currentWeek > 0
						? 100
						: 0
					: Math.round(((currentWeek - previousWeek) / previousWeek) * 100);

			return {
				totalReflections,
				reflectionsByType,
				weekOverWeek: {
					current: currentWeek,
					previous: previousWeek,
					percentChange,
				},
			};
		} catch (error) {
			console.error("Error in getSummaryFallback:", error);
			return {
				totalReflections: 0,
				reflectionsByType: {},
				weekOverWeek: {
					current: 0,
					previous: 0,
					percentChange: 0,
				},
			};
		}
	}

	async getLatestInsights(): Promise<LatestInsights> {
		try {
			const session = await this.getSession();

			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/growth-insights-api/latest`,
				{
					headers: {
						Authorization: `Bearer ${session.access_token}`,
						"Content-Type": "application/json",
					},
				},
			);

			if (!response.ok) {
				console.warn("Latest insights API not available, using fallback");
				return this.getLatestInsightsFallback();
			}

			return await response.json();
		} catch (error) {
			console.error("Error fetching latest insights:", error);
			return this.getLatestInsightsFallback();
		}
	}

	async getLatestInsightsFallback(): Promise<LatestInsights> {
		try {
			const session = await this.getSession();

			// Fetch recent reflections with data
			const { data: reflections, error } = await supabase
				.from("reflection_entries")
				.select("entry_kind, data, created_at")
				.eq("user_id", session.user.id)
				.order("created_at", { ascending: false })
				.limit(20);

			if (error) throw error;

			// Extract teamwork data from team sync reflections
			const teamSyncReflections =
				reflections?.filter(
					(r) =>
						r.entry_kind === "team_sync" ||
						r.entry_kind === "teaming_reflection",
				) || [];

			// Extract values data from values alignment reflections
			const valuesReflections =
				reflections?.filter((r) => r.entry_kind === "values_alignment") || [];

			// Extract wellness data
			const wellnessReflections =
				reflections?.filter((r) => r.entry_kind === "wellness_checkin") || [];

			// Calculate recovery score based on wellness check-ins
			const recentWellness = wellnessReflections.slice(0, 7);
			const avgWellness =
				recentWellness.length > 0
					? recentWellness.reduce(
							(sum, r) => sum + (r.data?.overall_wellbeing || 5),
							0,
						) / recentWellness.length
					: 5;
			const weeklyScore = Math.round(avgWellness * 10);

			// Extract habits from wellness data
			const recentHabits = wellnessReflections.slice(0, 3).map((r) => ({
				type: r.data?.stress_level > 6 ? "high-stress" : "balanced",
				value: `Stress: ${r.data?.stress_level || 5}/10, Energy: ${r.data?.energy_level || 5}/10`,
				timestamp: r.created_at,
			}));

			return {
				teamwork: {
					agreementsFidelity: 88, // Default value, would need specific calculation
					topDriftArea:
						teamSyncReflections[0]?.data?.drift_area || "Turn-taking balance",
					lastUpdated:
						teamSyncReflections[0]?.created_at || new Date().toISOString(),
				},
				values: {
					topActiveValue:
						valuesReflections[0]?.data?.primary_value || "Advocacy for client",
					grayZoneFocus:
						valuesReflections[0]?.data?.gray_zone ||
						"Role boundaries with family",
					lastUpdated:
						valuesReflections[0]?.created_at || new Date().toISOString(),
				},
				recovery: {
					weeklyScore,
					recentHabits,
				},
			};
		} catch (error) {
			console.error("Error in getLatestInsightsFallback:", error);
			return {
				teamwork: {
					agreementsFidelity: 88,
					topDriftArea: "Turn-taking balance",
					lastUpdated: new Date().toISOString(),
				},
				values: {
					topActiveValue: "Advocacy for client",
					grayZoneFocus: "Role boundaries with family",
					lastUpdated: new Date().toISOString(),
				},
				recovery: {
					weeklyScore: 0,
					recentHabits: [],
				},
			};
		}
	}

	async getResetToolkitData(): Promise<ResetToolkitData> {
		// Skip Edge Functions - they're broken (500 errors)
		// Use fallback directly
		return this.getResetToolkitFallback();
	}

	async getResetToolkitFallback(): Promise<ResetToolkitData> {
		try {
			const session = await this.getSession();

			// Get last 30 days of technique usage
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			const { data: techniqueData, error } = await supabase
				.from("technique_usage_sessions")
				.select("*")
				.eq("user_id", session.user.id)
				.gte("created_at", thirtyDaysAgo.toISOString())
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching technique usage:", error);
				throw error;
			}

			if (!techniqueData || techniqueData.length === 0) {
				// No data yet, return defaults
				return {
					mostEffective: "Try a technique to see your stats",
					completionRate: 0,
					avgStressRelief: 0,
					tryNext: "Box Breathing",
					weeklyUsage: 0,
				};
			}

			// Calculate most effective technique based on stress relief
			const techniqueStats: Record<
				string,
				{ count: number; totalRelief: number; completed: number }
			> = {};

			techniqueData.forEach((usage) => {
				const technique = usage.technique;
				if (!techniqueStats[technique]) {
					techniqueStats[technique] = {
						count: 0,
						totalRelief: 0,
						completed: 0,
					};
				}
				techniqueStats[technique].count++;

				if (usage.completed) {
					techniqueStats[technique].completed++;

					// Calculate stress relief if we have before/after data
					if (usage.stress_before && usage.stress_after) {
						const relief = usage.stress_before - usage.stress_after;
						techniqueStats[technique].totalRelief += relief;
					}
				}
			});

			// Find most effective technique (highest average stress relief)
			let mostEffective = "";
			let highestRelief = 0;

			Object.entries(techniqueStats).forEach(([technique, stats]) => {
				if (stats.completed > 0) {
					const avgRelief = stats.totalRelief / stats.completed;
					if (avgRelief > highestRelief) {
						highestRelief = avgRelief;
						mostEffective = technique;
					}
				} else if (!mostEffective && stats.count > 0) {
					// If no completed techniques with stress data, use most used
					mostEffective = technique;
				}
			});

			// Format technique name for display
			const formatTechniqueName = (name: string) => {
				const nameMap: Record<string, string> = {
					"breathing-practice": "Breathing Practice",
					"body-checkin": "Body Check-In",
					"emotion-mapping": "Emotion Mapping",
					"boundaries-reset": "Boundaries Reset",
					"assignment-reset": "Assignment Reset",
					"tech-fatigue-reset": "Tech Fatigue Reset",
				};
				return nameMap[name] || name;
			};

			// Calculate overall completion rate
			const totalStarted = techniqueData.length;
			const totalCompleted = techniqueData.filter((t) => t.completed).length;
			const completionRate =
				totalStarted > 0
					? Math.round((totalCompleted / totalStarted) * 100)
					: 0;

			// Calculate average stress relief across all techniques
			let totalRelief = 0;
			let reliefCount = 0;

			techniqueData.forEach((usage) => {
				if (usage.completed && usage.stress_before && usage.stress_after) {
					totalRelief += usage.stress_before - usage.stress_after;
					reliefCount++;
				}
			});

			const avgStressRelief = reliefCount > 0 ? totalRelief / reliefCount : 0;

			// Calculate weekly usage (last 7 days)
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
			const weeklyUsage = techniqueData.filter(
				(t) => new Date(t.created_at) >= sevenDaysAgo,
			).length;

			// Suggest technique to try next (least used or never used)
			const allTechniques = [
				"breathing-practice",
				"body-checkin",
				"emotion-mapping",
				"boundaries-reset",
				"assignment-reset",
				"tech-fatigue-reset",
			];

			const usageCounts = Object.fromEntries(
				Object.entries(techniqueStats).map(([k, v]) => [k, v.count]),
			);

			const leastUsed = allTechniques.reduce((min, technique) => {
				const count = usageCounts[technique] || 0;
				const minCount = usageCounts[min] || 0;
				return count < minCount ? technique : min;
			}, allTechniques[0]);

			return {
				mostEffective:
					formatTechniqueName(mostEffective) ||
					"Try a technique to see your stats",
				completionRate,
				avgStressRelief: Math.round(avgStressRelief * 10) / 10, // Round to 1 decimal
				tryNext: formatTechniqueName(leastUsed),
				weeklyUsage,
			};
		} catch (error) {
			console.error("Error in getResetToolkitFallback:", error);
			// Return defaults on error
			return {
				mostEffective: "Box Breathing",
				completionRate: 0,
				avgStressRelief: 0,
				tryNext: "Body Check-In",
				weeklyUsage: 0,
			};
		}
	}

	async getStressEnergyData() {
		try {
			const session = await this.getSession();

			// Fetch wellness check-ins with stress and energy data
			const { data: reflections, error } = await supabase
				.from("reflection_entries")
				.select("data, created_at")
				.eq("user_id", session.user.id)
				.eq("entry_kind", "wellness_checkin")
				.order("created_at", { ascending: true })
				.limit(30);

			if (error) throw error;

			// Transform data for chart
			return (
				reflections?.map((r) => ({
					date: new Date(r.created_at).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					}),
					stress: r.data?.stress_level || null,
					energy: r.data?.energy_level || r.data?.physical_energy || null,
					timestamp: r.created_at,
				})) || []
			);
		} catch (error) {
			console.error("Error fetching stress/energy data:", error);
			return [];
		}
	}
}

export const growthInsightsApi = new GrowthInsightsApiService();
