import {
	Activity,
	AlertTriangle,
	Award,
	BookOpen,
	ChevronRight,
	Clock,
	Heart,
	Info,
	MessageCircle,
	RefreshCw,
	Sparkles,
	Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useState, useCallback } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { BurnoutMetricsService } from "../services/burnoutMetricsService";
import { testBurnoutDataAccess } from "../utils/testBurnoutData";
import { ensureFreshSession } from "../utils/supabaseAuth";

// ========== DATA TYPES ==========
interface GrowthMetrics {
	totalReflections: number;
	lastWeekReflections: number;
	lastMonthReflections: number;
	reflectionTrend: "up" | "down" | "stable";

	averageBurnoutScore: number;
	burnoutTrend: Array<{ date: string; score: number }>;
	currentStressLevel: number;
	currentEnergyLevel: number;

	stressResetCounts: Record<string, number>;
	currentStreak: number;
	longestStreak: number;

	teamworkEvents: number;
	valuesConflicts: number;
	boundariesSet: number;

	lastActivity: string;
	lastActivityTime: string;

}

interface ActivityEvent {
	id: string;
	type: "reflection" | "stress_reset" | "wellness_check" | "elya_chat";
	title: string;
	timestamp: string;
	summary?: string;
	metrics?: Record<string, any>;
}

// ========== MAIN COMPONENT ==========
const GrowthInsights: React.FC = () => {
	console.log("🚀 GrowthInsights component is rendering!");
	const { user } = useAuth();
	console.log("👤 User from useAuth:", user ? `Found user ${user.id}` : "No user");
	const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
	const [activities, setActivities] = useState<ActivityEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedTimeRange, setSelectedTimeRange] = useState<
		"7d" | "30d" | "90d"
	>("30d");

	// ========== DATA FETCHING ==========

	/**
	 * Fetch all user metrics from Supabase
	 * This aggregates data from multiple tables to build comprehensive insights
	 */
	// Function to fetch metrics - memoized to prevent recreation
	const fetchMetrics = useCallback(async () => {
		console.log("📈 fetchMetrics called, user:", user?.id);
		if (!user) {
			console.log("⚠️ No user, returning early from fetchMetrics");
			setLoading(false);
			return;
		}

		try {
			// Don't set loading to true if we already have metrics (refresh scenario)
			if (!metrics) {
				setLoading(true);
			}
			setError(null);

			console.log("🔄 Starting data fetch...");

			// Try to ensure fresh session, but don't let it block (timeout after 3 seconds)
			try {
				await Promise.race([
					ensureFreshSession(),
					new Promise((_, reject) => setTimeout(() => reject(new Error('Session check timeout')), 3000))
				]);
			} catch (sessionError) {
				console.log("⚠️ Session check timed out, continuing anyway:", sessionError);
			}

			// === FETCH REFLECTIONS DATA ===
			// Query: Get all reflection entries for the logged-in user
			console.log("📝 Fetching reflections for user:", user.id);
			const { data: reflections, error: reflectionError } = await supabase
					.from("reflection_entries")
					.select("*")
					.eq("user_id", user.id)
					.order("created_at", { ascending: false });

			console.log("📝 Reflections result:", { reflections, reflectionError });
			if (reflectionError) throw reflectionError;

			// === CALCULATE REFLECTION METRICS ===
			const now = new Date();
			const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

			const totalReflections = reflections?.length || 0;
			const lastWeekReflections =
				reflections?.filter((r) => new Date(r.created_at) >= oneWeekAgo)
					.length || 0;
			const lastMonthReflections =
				reflections?.filter((r) => new Date(r.created_at) >= oneMonthAgo)
					.length || 0;

			// Determine trend
			const previousWeekReflections =
				reflections?.filter((r) => {
					const date = new Date(r.created_at);
					return (
						date < oneWeekAgo &&
						date >= new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000)
					);
				}).length || 0;

			const reflectionTrend =
				lastWeekReflections > previousWeekReflections
					? "up"
					: lastWeekReflections < previousWeekReflections
						? "down"
						: "stable";

			// === FETCH BURNOUT/STRESS DATA ===
			// Get the date range for fetching (last 30 days)
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			// First try to get data from the burnout_assessments table directly
			console.log("🔍 Fetching burnout data for user:", user.id);
			console.log("🔍 Date range: from", thirtyDaysAgo.toISOString(), "to now");

			// Ensure we have authenticated session before querying
			console.log("🔐 Checking and refreshing authentication...");
			const session = await ensureFreshSession();
			console.log("🔐 Session check:", {
				hasSession: !!session,
				userId: session?.user?.id,
				expiresAt: session?.expires_at
			});

			if (!session) {
				console.error("❌ No active session found. User might not be authenticated.");
				setError("Please log in to view your growth insights.");
				setLoading(false);
				return;
			}

			// Verify the session user matches the auth context user
			if (session.user.id !== user.id) {
				console.error("❌ Session user mismatch!", {
					sessionUser: session.user.id,
					contextUser: user.id
				});
			}

			// Run diagnostic test
			console.log("🧪 Running burnout data access test...");
			const testResults = await testBurnoutDataAccess();
			console.log("🧪 Test results:", testResults);

			// Get ALL burnout assessments first to see what's in the table
			const { data: allBurnout, error: allError } = await supabase
					.from("burnout_assessments")
					.select("*")
					.eq("user_id", user.id)
					.order("assessment_date", { ascending: false });

			console.log("📊 ALL burnout assessments query error:", allError);
			console.log("📊 ALL burnout assessments found:", allBurnout?.length || 0);
			if (allBurnout && allBurnout.length > 0) {
				console.log("📊 All burnout data:", allBurnout);
			} else {
				console.log("📊 No burnout data found. User ID:", user.id);
				console.log("📊 Checking if table is accessible...");

				// Check if we can query the table at all
				const { count, error: countError } = await supabase
					.from("burnout_assessments")
					.select("*", { count: "exact", head: true });

				console.log("📊 Table row count:", count, "Error:", countError);
			}

			const { data: burnoutAssessments, error: burnoutError } = await supabase
					.from("burnout_assessments")
					.select("*")
					.eq("user_id", user.id)
					.gte("assessment_date", thirtyDaysAgo.toISOString())
					.order("assessment_date", { ascending: false })
					.limit(30);

			if (burnoutError) {
				console.error("❌ Error fetching burnout assessments:", burnoutError);
			}

			console.log(`📊 Query result: ${burnoutAssessments?.length || 0} assessments found`);
			if (burnoutAssessments && burnoutAssessments.length > 0) {
				console.log("📊 Sample data:", burnoutAssessments[0]);
				console.log("📊 All dates:", burnoutAssessments.map(b => b.assessment_date));
			}

			// Use ALL burnout data if the 30-day window has no data
			const dataToUse = (burnoutAssessments && burnoutAssessments.length > 0)
				? burnoutAssessments
				: allBurnout;

			console.log("📊 Using data source:", dataToUse?.length || 0, "assessments");

			// Format the burnout data for the chart
			let burnoutScores: Array<{ date: string; score: number; rawScore: number; riskLevel: string | null }> = [];

			if (dataToUse && dataToUse.length > 0) {
				console.log(`📈 Processing ${dataToUse.length} burnout assessments for chart`);

				burnoutScores = dataToUse.map((b) => {
					console.log("Processing assessment:", {
						id: b.id,
						date: b.assessment_date,
						total_score: b.total_score,
						risk_level: b.risk_level
					});

					// The total_score is already normalized to 0-10 scale
					// (saved as DECIMAL(3,2) capped at 9.99)
					const normalizedScore = b.total_score ? parseFloat(String(b.total_score)) : 5;
					console.log(`Using total_score: ${b.total_score} -> normalized: ${normalizedScore}`);

					return {
						date: new Date(b.assessment_date).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
						}),
						score: Math.round(normalizedScore * 10) / 10, // Round to 1 decimal
						rawScore: normalizedScore,
						riskLevel: b.risk_level,
					};
				});

				console.log("📊 Formatted burnout scores for chart:", burnoutScores);
			} else {
				console.log("⚠️ No burnout assessment data available");
			}

			// Log if no burnout assessments found
			if (burnoutScores.length === 0) {
				console.log("📊 No burnout assessments found in database");
			}

			// Try the service method if needed
			if (burnoutScores.length === 0) {
				burnoutScores = await BurnoutMetricsService.getBurnoutTrend(
					user.id,
					30,
				);

					// If still no data, process reflections
					if (burnoutScores.length === 0) {
						const wellnessReflections =
							reflections?.filter((r) =>
								[
									"wellness_check_in",
									"pre_assignment_prep",
									"post_assignment_debrief",
								].includes(r.entry_kind),
							) || [];

						for (const reflection of wellnessReflections.slice(0, 7)) {
							await BurnoutMetricsService.processReflectionForBurnout(
								user.id,
								reflection.entry_kind,
								reflection.data,
							);
						}

						burnoutScores = await BurnoutMetricsService.getBurnoutTrend(
							user.id,
							30,
						);
					}
				}

				// Calculate average burnout score (0-10 scale where 0 is best)
				const averageBurnoutScore =
					burnoutScores.length > 0
						? burnoutScores.reduce((acc, curr) => acc + curr.score, 0) /
							burnoutScores.length
						: 5;

				// Calculate current stress and energy levels from most recent reflection
				// This matches how the graph in App.tsx gets its data
				const reflectionsWithStressOrEnergy = reflections?.filter(
					(r) =>
						r.data?.stress_level ||
						r.data?.stressLevel ||
						r.data?.energy_level ||
						r.data?.energyLevel ||
						r.data?.physical_energy
				) || [];

				const mostRecentReflection = reflectionsWithStressOrEnergy.length > 0
					? reflectionsWithStressOrEnergy[0]
					: null;

				console.log("🎯 mostRecentReflection:", mostRecentReflection);
				console.log("🎯 reflectionsWithStressOrEnergy count:", reflectionsWithStressOrEnergy.length);

				const currentStressLevel = mostRecentReflection
					? parseFloat(String(
						mostRecentReflection.data.stress_level ||
						mostRecentReflection.data.stressLevel ||
						"3"
					))
					: 3;

				const currentEnergyLevel = mostRecentReflection
					? parseFloat(String(
						mostRecentReflection.data.energy_level ||
						mostRecentReflection.data.energyLevel ||
						mostRecentReflection.data.physical_energy ||
						"7"
					))
					: 7;

				console.log("🎯 Calculated currentStressLevel:", currentStressLevel);
				console.log("🎯 Calculated currentEnergyLevel:", currentEnergyLevel);

				// === FETCH STRESS RESET ACTIVITIES ===
				// Query: Get all stress reset tool usage
				const { data: stressResets, error: stressError } = await supabase
					.from("stress_reset_logs")
					.select("tool_type, created_at")
					.eq("user_id", user.id)
					.gte("created_at", oneMonthAgo.toISOString());

				if (stressError)
					console.error("Stress reset fetch error:", stressError);

				// Count by tool type
				const stressResetCounts: Record<string, number> = {};
				stressResets?.forEach((reset) => {
					const toolType = reset.tool_type || "unknown";
					stressResetCounts[toolType] = (stressResetCounts[toolType] || 0) + 1;
				});

				// === CALCULATE STREAKS ===
				// Query: Get daily activity to calculate streaks
				const { data: dailyActivity, error: streakError } = await supabase
					.from("daily_activity")
					.select("activity_date")
					.eq("user_id", user.id)
					.order("activity_date", { ascending: false })
					.limit(365);

				if (streakError) console.error("Streak fetch error:", streakError);

				// Calculate current and longest streak
				let currentStreak = 0;
				let longestStreak = 0;
				let tempStreak = 0;

				if (dailyActivity && dailyActivity.length > 0) {
					const today = new Date().toDateString();
					const yesterday = new Date(Date.now() - 86400000).toDateString();

					for (let i = 0; i < dailyActivity.length; i++) {
						const activityDate = new Date(
							dailyActivity[i].activity_date,
						).toDateString();

						if (
							i === 0 &&
							(activityDate === today || activityDate === yesterday)
						) {
							currentStreak = 1;
							tempStreak = 1;
						} else if (tempStreak > 0) {
							const prevDate = new Date(dailyActivity[i - 1].activity_date);
							const currDate = new Date(dailyActivity[i].activity_date);
							const dayDiff =
								(prevDate.getTime() - currDate.getTime()) / 86400000;

							if (dayDiff === 1) {
								tempStreak++;
								if (i === 0 || (i === 1 && activityDate === yesterday)) {
									currentStreak = tempStreak;
								}
							} else {
								longestStreak = Math.max(longestStreak, tempStreak);
								tempStreak = 0;
							}
						}
					}
					longestStreak = Math.max(longestStreak, tempStreak);
				}

				// === FETCH TEAMWORK & VALUES DATA ===
				// Query: Get teaming sessions and ethics checks
				const { data: teamingSessions } = await supabase
					.from("reflection_entries")
					.select("id")
					.eq("user_id", user.id)
					.in("entry_kind", ["teaming_prep", "teaming_reflection"])
					.gte("created_at", oneMonthAgo.toISOString());

				const { data: ethicsChecks } = await supabase
					.from("reflection_entries")
					.select("data")
					.eq("user_id", user.id)
					.eq("entry_kind", "compass_check")
					.gte("created_at", oneMonthAgo.toISOString());

				const teamworkEvents = teamingSessions?.length || 0;
				const valuesConflicts =
					ethicsChecks?.filter(
						(e: any) => e.data?.values_conflict_present === true,
					).length || 0;
				const boundariesSet =
					ethicsChecks?.filter(
						(e: any) => e.data?.boundaries_to_set?.length > 0,
					).length || 0;

				// === GET LAST ACTIVITY ===
				const lastReflection = reflections?.[0];
				const lastActivity = lastReflection?.entry_kind || "None";
				const lastActivityTime = lastReflection?.created_at || "";

				// Set all metrics
				const metricsToSet: GrowthMetrics = {
					totalReflections,
					lastWeekReflections,
					lastMonthReflections,
					reflectionTrend: reflectionTrend as "up" | "down" | "stable",
					averageBurnoutScore,
					burnoutTrend: burnoutScores.slice(0, 14).reverse(), // Show last 14 data points
					currentStressLevel,
					currentEnergyLevel,
					stressResetCounts,
					currentStreak,
					longestStreak,
					teamworkEvents,
					valuesConflicts,
					boundariesSet,
					lastActivity,
					lastActivityTime,
				};

				console.log("📊 Setting burnoutTrend in metrics:", metricsToSet.burnoutTrend);
				console.log("📊 BurnoutTrend length:", metricsToSet.burnoutTrend?.length);
				setMetrics(metricsToSet);

				// === FETCH RECENT ACTIVITIES FOR TIMELINE ===
				const { data: recentActivities } = await supabase
					.from("reflection_entries")
					.select("id, entry_kind, created_at, data")
					.eq("user_id", user.id)
					.order("created_at", { ascending: false })
					.limit(10);

				const formattedActivities: ActivityEvent[] =
					recentActivities?.map((activity) => ({
						id: activity.id,
						type: mapEntryKindToType(activity.entry_kind),
						title: formatActivityTitle(activity.entry_kind),
						timestamp: activity.created_at,
						summary: extractActivitySummary(activity.data),
						metrics: extractActivityMetrics(activity.data),
					})) || [];

			setActivities(formattedActivities);
			console.log("✅ fetchMetrics completed successfully!");
		} catch (err) {
			console.error("❌ Error fetching growth metrics:", err);
			setError("Failed to load growth insights. Please try again.");
		} finally {
			console.log("🏁 fetchMetrics finally block, setting loading to false");
			setLoading(false);
		}
	}, [user, selectedTimeRange, metrics]);

	// Load data on mount and when dependencies change
	useEffect(() => {
		console.log("🚀 GrowthInsights useEffect triggered, user:", user?.id);
		console.log("📊 User object details:", user);
		if (user) {
			console.log("✅ User found, calling fetchMetrics...");
			fetchMetrics();
		} else {
			console.log("❌ No user found, skipping fetchMetrics");
			setLoading(false);
		}
	}, [user, selectedTimeRange, fetchMetrics]);

	// Listen for burnout assessment updates
	useEffect(() => {
		const handleBurnoutUpdate = () => {
			console.log("📊 Burnout assessment saved, refreshing Growth Insights data...");
			if (user) {
				fetchMetrics();
			}
		};

		window.addEventListener("burnout-assessment-saved", handleBurnoutUpdate);

		return () => {
			window.removeEventListener("burnout-assessment-saved", handleBurnoutUpdate);
		};
	}, [user, fetchMetrics]);



	// ========== HELPER FUNCTIONS ==========

	const mapEntryKindToType = (entryKind: string): ActivityEvent["type"] => {
		if (entryKind.includes("wellness")) return "wellness_check";
		if (entryKind.includes("stress") || entryKind.includes("reset"))
			return "stress_reset";
		if (entryKind === "elya_chat") return "elya_chat";
		return "reflection";
	};

	const formatActivityTitle = (entryKind: string): string => {
		const titles: Record<string, string> = {
			wellness_checkin: "Wellness Check-In",
			pre_assignment_prep: "Pre-Assignment Prep",
			post_assignment_debrief: "Post-Assignment Debrief",
			teaming_prep: "Teaming Preparation",
			teaming_reflection: "Teaming Reflection",
			compass_check: "Ethics & Values Check",
			breathing_practice: "Breathing Practice",
			body_awareness: "Body Awareness Journey",
		};
		return titles[entryKind] || "Reflection Activity";
	};

	const extractActivitySummary = (data: any): string => {
		if (data?.one_word_feeling) return `Feeling: ${data.one_word_feeling}`;
		if (data?.overall_feeling) return `Overall: ${data.overall_feeling}/10`;
		if (data?.current_state_word) return data.current_state_word;
		return "";
	};

	const extractActivityMetrics = (data: any): Record<string, any> => {
		return {
			confidence: data?.confidence_rating,
			stress: data?.stress_level_post,
			wellbeing: data?.overall_wellbeing,
		};
	};

	// ========== ACTION HANDLERS ==========

	/**
	 * Handle CTA button clicks
	 * TODO: Replace alerts with actual navigation/modal triggers
	 */
	const handleStartReflection = () => {
		// TODO: Navigate to Reflection Studio or open modal
		console.log("[ACTION] Start Guided Reflection clicked");
		alert("Opening Reflection Studio...");
		// Example: navigate('/reflection-studio');
		// Or: setShowReflectionModal(true);
	};

	const handleQuickStressReset = () => {
		// TODO: Open Stress Reset activities modal
		console.log("[ACTION] Quick Stress Reset clicked");
		alert("Opening Stress Reset Activities...");
		// Example: setShowStressResetModal(true);
	};

	const handleChatWithElya = () => {
		// TODO: Trigger Elya support chat
		console.log("[ACTION] Chat with Elya clicked");
		alert("Connecting with Elya...");
		// Example: openElyaChat();
	};

	// ========== RENDER FUNCTIONS ==========

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center" role="status" aria-live="polite">
					<RefreshCw
						className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600"
						aria-hidden="true"
					/>
					<p className="text-gray-600">Fetching your growth insights from cloud...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center p-6 bg-red-50 rounded-lg" role="alert">
					<AlertTriangle
						className="w-8 h-8 text-red-600 mx-auto mb-4"
						aria-hidden="true"
					/>
					<p className="text-red-800">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
						aria-label="Reload page"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-4 md:p-8">
			<div className="max-w-7xl mx-auto">
				{/* ========== HEADER ========== */}
				<header className="mb-8">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								Growth Insights
							</h1>
							<p className="text-gray-600 mt-2">
								Track your burnout potential over time with daily assessments and professional development
							</p>
						</div>

						{/* Time Range Selector */}
						<div
							className="flex gap-2"
							role="group"
							aria-label="Time range selector"
						>
							{(["7d", "30d", "90d"] as const).map((range) => (
								<button
									key={range}
									onClick={() => setSelectedTimeRange(range)}
									className={`px-4 py-2 rounded-lg font-medium transition-all ${
										selectedTimeRange === range
											? "bg-blue-600 text-white"
											: "bg-white text-gray-600 hover:bg-gray-100"
									}`}
									aria-pressed={selectedTimeRange === range}
								>
									{range === "7d"
										? "Week"
										: range === "30d"
											? "Month"
											: "Quarter"}
								</button>
							))}
						</div>
					</div>
				</header>

				{/* ========== LIVE TRACKING SECTION ========== */}
				<div className="bg-white rounded-xl p-6 shadow-sm mb-8" role="region" aria-labelledby="live-tracking-heading">
					<h2 id="live-tracking-heading" className="text-xl font-semibold text-gray-900 mb-4">
						Live Burnout Tracking
					</h2>
					<p className="text-sm text-gray-600 mb-4">
						<strong>Data Source:</strong> These metrics are pulled from your most recent Daily Burnout Check (found on your homepage).
					</p>

					<div className="grid grid-cols-2 gap-6 mb-4">
						{/* Stress Level */}
						<div className="text-center">
							<div className="text-3xl font-bold text-red-600 mb-1">
								{metrics?.currentStressLevel?.toFixed(1) || "5.0"}/10
							</div>
							<div className="text-sm font-medium text-gray-700">Stress</div>
						</div>

						{/* Energy Level */}
						<div className="text-center">
							<div className="text-3xl font-bold text-green-600 mb-1">
								{metrics?.currentEnergyLevel?.toFixed(1) || "5.0"}/10
							</div>
							<div className="text-sm font-medium text-gray-700">Energy</div>
						</div>
					</div>

					{/* Balance Score */}
					<div className="text-center mb-4">
						<div className="text-lg font-semibold text-gray-900 mb-1">Balance Score</div>
						<div className={`text-xl font-bold ${
							(metrics?.currentStressLevel || 5) <= 3 && (metrics?.currentEnergyLevel || 5) >= 7
								? "text-green-600"
								: (metrics?.currentStressLevel || 5) <= 5 && (metrics?.currentEnergyLevel || 5) >= 5
									? "text-amber-600"
									: "text-red-600"
						}`}>
							{(metrics?.currentStressLevel || 5) <= 3 && (metrics?.currentEnergyLevel || 5) >= 7
								? "Great"
								: (metrics?.currentStressLevel || 5) <= 5 && (metrics?.currentEnergyLevel || 5) >= 5
									? "Good"
									: "Needs Attention"}
						</div>
					</div>

					{/* Optimal Ranges */}
					<div className="bg-gray-50 rounded-lg p-4">
						<h3 className="text-sm font-medium text-gray-700 mb-2">Optimal Ranges</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="font-medium text-red-600">Stress:</span> Lower is better (1-3)
							</div>
							<div>
								<span className="font-medium text-green-600">Energy:</span> Higher is better (7-10)
							</div>
						</div>
					</div>
				</div>

				{/* ========== TOP METRICS CARDS ========== */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{/* Total Reflections Card */}
					<div
						className="bg-white rounded-xl p-6 shadow-sm"
						role="region"
						aria-labelledby="reflections-heading"
						title="Data from all your journal entries in the Reflection Studio"
					>
						<div className="flex items-start justify-between mb-4">
							<div className="p-2 bg-blue-100 rounded-lg">
								<BookOpen
									className="w-6 h-6 text-blue-600"
									aria-hidden="true"
								/>
							</div>
							<span
								className={`text-sm font-medium px-2 py-1 rounded-full ${
									metrics?.reflectionTrend === "up"
										? "bg-green-100 text-green-700"
										: metrics?.reflectionTrend === "down"
											? "bg-red-100 text-red-700"
											: "bg-gray-100 text-gray-700"
								}`}
							>
								{metrics?.reflectionTrend === "up"
									? "↑"
									: metrics?.reflectionTrend === "down"
										? "↓"
										: "→"}{" "}
								{metrics?.lastWeekReflections} this week
							</span>
						</div>
						<h2
							id="reflections-heading"
							className="text-2xl font-bold text-gray-900"
						>
							{metrics?.totalReflections || 0}
						</h2>
						<p className="text-gray-600 text-sm mt-1">Total Reflections</p>
						<p className="text-xs text-gray-500 mt-2">
							{metrics?.lastMonthReflections || 0} in last 30 days
						</p>
						<p className="text-xs text-blue-600 mt-1 font-medium">
							From: Reflection Studio entries
						</p>
					</div>

					{/* Burnout Trend Card */}
					<div
						className="bg-white rounded-xl p-6 shadow-sm"
						role="region"
						aria-labelledby="burnout-heading"
						title="Data from your Daily Burnout Checks on the homepage"
					>
						<div className="flex items-start justify-between mb-4">
							<div className="p-2 bg-amber-100 rounded-lg">
								<Activity
									className="w-6 h-6 text-amber-600"
									aria-hidden="true"
								/>
							</div>
							<span className="text-sm font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
								Burnout Risk: {metrics?.averageBurnoutScore
									? Math.round(metrics.averageBurnoutScore * 10)
									: 50}%
							</span>
						</div>
						<h2
							id="burnout-heading"
							className="text-lg font-semibold text-gray-900 mb-1"
						>
							Daily Burnout Tracker
						</h2>
						<p className="text-sm text-gray-600 mb-1">
							Track your burnout potential over time with daily assessments
						</p>
						<p className="text-xs text-amber-600 mb-3 font-medium">
							📊 Data from: Homepage → Daily Burnout Check
						</p>
						{/* Mini Chart */}
						{metrics?.burnoutTrend && metrics.burnoutTrend.length > 0 ? (
							<ResponsiveContainer width="100%" height={80}>
								<AreaChart
									data={metrics.burnoutTrend.slice(-7).map((item) => ({
										date: item.date,
										// Convert 0-10 burnout score to 0-100 burnout risk percentage
										percentage: Math.round(item.score * 10),
									}))
								}
								>
								<Area
									type="monotone"
									dataKey="percentage"
									stroke={
										metrics?.burnoutTrend && metrics.burnoutTrend.length > 0
											? "#f59e0b"
											: "#e5e7eb"
									}
									fill={
										metrics?.burnoutTrend && metrics.burnoutTrend.length > 0
											? "#fef3c7"
											: "#f3f4f6"
									}
									strokeWidth={2}
									strokeDasharray={
										metrics?.burnoutTrend && metrics.burnoutTrend.length > 0
											? "0"
											: "5 5"
									}
								/>
								<XAxis
									dataKey="date"
									tick={{ fontSize: 10, fill: "#9ca3af" }}
									axisLine={{ stroke: "#e5e7eb" }}
								/>
								<YAxis domain={[0, 100]} hide={true} />
								<Tooltip
									content={({ active, payload }) => {
										if (active && payload && payload[0]) {
											return (
												<div className="bg-white p-2 shadow-lg rounded border">
													<p className="text-xs font-medium">
														{payload[0].payload.date}
													</p>
													<p className="text-xs text-amber-600">
														Burnout Risk: {payload[0].value}%
													</p>
												</div>
											);
										}
										return null;
									}}
								/>
							</AreaChart>
						</ResponsiveContainer>
					) : (
						<div className="h-20 flex items-center justify-center">
							<div className="text-center">
								<p className="text-xs font-medium text-gray-600 mb-1">
									☁️ Cloud
								</p>
								<p className="text-xs text-gray-500">
									Data synced from Supabase
								</p>
							</div>
						</div>
					)}
					</div>

					{/* Current Streak Card */}
					<div
						className="bg-white rounded-xl p-6 shadow-sm"
						role="region"
						aria-labelledby="streak-heading"
						title="Tracks consecutive days you've used any tool (Reflection Studio, Stress Resets, Burnout Checks)"
					>
						<div className="flex items-start justify-between mb-4">
							<div className="p-2 bg-purple-100 rounded-lg">
								<Award className="w-6 h-6 text-purple-600" aria-hidden="true" />
							</div>
							<span className="text-sm font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
								Best: {metrics?.longestStreak || 0} days
							</span>
						</div>
						<h2
							id="streak-heading"
							className="text-2xl font-bold text-gray-900"
						>
							{metrics?.currentStreak || 0} days
						</h2>
						<p className="text-gray-600 text-sm mt-1">Current Streak</p>
						<p className="text-xs text-purple-600 mt-1 font-medium">
							From: Any daily activity
						</p>
						<div className="mt-2 flex gap-1">
							{[...Array(7)].map((_, i) => (
								<div
									key={i}
									className={`h-2 flex-1 rounded-full ${
										i < (metrics?.currentStreak || 0)
											? "bg-purple-500"
											: "bg-gray-200"
									}`}
									aria-hidden="true"
								/>
							))}
						</div>
					</div>

					{/* Team & Values Card */}
					<div
						className="bg-white rounded-xl p-6 shadow-sm"
						role="region"
						aria-labelledby="team-values-heading"
						title="Data from Teaming Prep/Reflection and Compass Check entries in Reflection Studio"
					>
						<div className="flex items-start justify-between mb-4">
							<div className="p-2 bg-green-100 rounded-lg">
								<Users className="w-6 h-6 text-green-600" aria-hidden="true" />
							</div>
						</div>
						<h2
							id="team-values-heading"
							className="text-lg font-semibold text-gray-900 mb-1"
						>
							Professional Growth
						</h2>
						<p className="text-xs text-green-600 mb-3 font-medium">
							From: Reflection Studio journals
						</p>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-gray-600">Team Sessions</span>
								<span className="font-medium">
									{metrics?.teamworkEvents || 0}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Values Aligned</span>
								<span className="font-medium">
									{metrics?.valuesConflicts || 0}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Boundaries Set</span>
								<span className="font-medium">
									{metrics?.boundariesSet || 0}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* ========== ACTION BUTTONS ========== */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
					<button
						onClick={handleStartReflection}
						className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						aria-label="Start a guided reflection session"
					>
						<div className="flex items-center gap-3">
							<Sparkles className="w-5 h-5" aria-hidden="true" />
							<span className="font-medium">Start Guided Reflection</span>
						</div>
						<ChevronRight className="w-5 h-5" aria-hidden="true" />
					</button>

					<button
						onClick={handleQuickStressReset}
						className="flex items-center justify-between p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
						aria-label="Do a quick stress reset activity"
					>
						<div className="flex items-center gap-3">
							<RefreshCw className="w-5 h-5" aria-hidden="true" />
							<span className="font-medium">Quick Stress Reset</span>
						</div>
						<ChevronRight className="w-5 h-5" aria-hidden="true" />
					</button>

					<button
						onClick={handleChatWithElya}
						className="flex items-center justify-between p-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
						aria-label="Start a chat with Elya support"
					>
						<div className="flex items-center gap-3">
							<MessageCircle className="w-5 h-5" aria-hidden="true" />
							<span className="font-medium">Chat with Elya</span>
						</div>
						<ChevronRight className="w-5 h-5" aria-hidden="true" />
					</button>
				</div>

				{/* ========== DETAILED BURNOUT TREND CHART ========== */}
				<div
					className="bg-white rounded-xl p-6 shadow-sm mb-8"
					role="region"
					aria-labelledby="burnout-trend-heading"
				>
					<div className="flex items-center justify-between mb-4">
					<div>
					<h2
					id="burnout-trend-heading"
					className="text-xl font-semibold text-gray-900"
					>
					Daily Burnout Tracker
					</h2>
					<p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
					<Info className="w-4 h-4 text-blue-500" aria-hidden="true" />
					 <strong>Data Source:</strong> Daily Burnout Check from your homepage
					 </p>
					</div>
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2 text-sm text-gray-600">
								<Activity className="w-4 h-4" aria-hidden="true" />
								<span>Track your burnout potential over time</span>
							</div>
						</div>
					</div>

					{/* Chart area */}
					<div className="rounded-xl p-6 h-80 relative bg-gray-50 border border-gray-200">
						{metrics?.burnoutTrend && metrics.burnoutTrend.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<LineChart
									data={metrics.burnoutTrend.map((item) => ({
										date: item.date,
										// Convert 0-10 burnout score to 0-100 burnout risk percentage
										// 0 burnout = 0% risk, 10 burnout = 100% risk
										percentage: Math.round(item.score * 10),
									}))}
									margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
								>
								<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
								<XAxis
									dataKey="date"
									tick={{ fontSize: 11, fill: "#6b7280" }}
									stroke="#e5e7eb"
								/>
								<YAxis
									domain={[0, 100]}
									ticks={[0, 20, 40, 60, 80, 100]}
									tick={{ fontSize: 11, fill: "#6b7280" }}
									stroke="#e5e7eb"
									tickFormatter={(value) => `${value}%`}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: "#fff",
										border: "1px solid #e5e7eb",
										borderRadius: "8px",
									}}
									formatter={(value: any) => [`${value}%`, "Burnout Risk"]}
								/>
								<Line
									type="monotone"
									dataKey="percentage"
									stroke="#ef4444"
									strokeWidth={2}
									dot={{ fill: "#ef4444", r: 4 }}
									activeDot={{ r: 6 }}
									name="Burnout Risk %"
								/>
							</LineChart>
						</ResponsiveContainer>
					) : (
						<div className="flex items-center justify-center h-full">
							<div className="text-center">
								<div className="mb-4">
									<div className="text-4xl mb-2">☁️</div>
									<p className="text-lg font-medium text-gray-700">Cloud</p>
								</div>
								<p className="text-gray-500">Data synced from Supabase</p>
								<p className="text-sm text-gray-400 mt-2">
									Complete daily assessments to populate your burnout trend
								</p>
							</div>
						</div>
					)}
					</div>
					<div className="mt-4 p-3 bg-amber-50 rounded-lg">
						<p className="text-sm text-amber-800">
							<strong>How it works:</strong> Your burnout trend updates
							automatically with each Daily Burnout Check you complete on the homepage (once every 12 hours).
							The graph shows your burnout risk percentage (0% = low risk, 100% = high risk).
							Risk below 30% indicates good balance, while above 70% suggests you may need additional support.
						</p>
						<p className="text-sm text-amber-800 mt-2">
							<strong>Tip:</strong> Complete your Daily Burnout Check on the homepage every 12 hours to see your burnout trend populate here!
						</p>
					</div>
				</div>

				{/* ========== STRESS RESET TOOLS USAGE ========== */}
				{metrics?.stressResetCounts &&
					Object.keys(metrics.stressResetCounts).length > 0 && (
						<div
							className="bg-white rounded-xl p-6 shadow-sm mb-8"
							role="region"
							aria-labelledby="stress-tools-heading"
						>
							<h2
								id="stress-tools-heading"
								className="text-xl font-semibold text-gray-900 mb-2"
							>
								Stress Reset Tools Usage
							</h2>
							<p className="text-sm text-gray-600 mb-4">
								<strong>Data Source:</strong> These counts reflect your use of Stress Reset tools from the Stress Reset section.
							</p>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								{Object.entries(metrics.stressResetCounts).map(
									([tool, count]) => (
										<div
											key={tool}
											className="text-center p-4 bg-gray-50 rounded-lg"
										>
											<div className="text-2xl font-bold text-gray-900">
												{count}
											</div>
											<div className="text-sm text-gray-600 capitalize">
												{tool.replace("_", " ")}
											</div>
										</div>
									),
								)}
							</div>
						</div>
					)}

				{/* ========== ACTIVITY TIMELINE ========== */}
				<div
					className="bg-white rounded-xl p-6 shadow-sm"
					role="region"
					aria-labelledby="timeline-heading"
				>
					<h2
						id="timeline-heading"
						className="text-xl font-semibold text-gray-900 mb-2"
					>
						Recent Activity Timeline
					</h2>
					<p className="text-sm text-gray-600 mb-4">
						<strong>Data Source:</strong> Shows your most recent activities from all sections (Reflection Studio, Stress Resets, Wellness Checks, and Elya conversations).
					</p>

					{activities.length > 0 ? (
						<div className="space-y-4" role="list">
							{activities.map((activity, index) => (
								<div
									key={activity.id}
									className="flex gap-4 pb-4 border-b last:border-b-0"
									role="listitem"
								>
									{/* Activity Icon */}
									<div
										className={`p-2 rounded-lg flex-shrink-0 ${
											activity.type === "reflection"
												? "bg-blue-100"
												: activity.type === "stress_reset"
													? "bg-green-100"
													: activity.type === "wellness_check"
														? "bg-amber-100"
														: "bg-purple-100"
										}`}
									>
										{activity.type === "reflection" && (
											<BookOpen
												className="w-5 h-5 text-blue-600"
												aria-hidden="true"
											/>
										)}
										{activity.type === "stress_reset" && (
											<RefreshCw
												className="w-5 h-5 text-green-600"
												aria-hidden="true"
											/>
										)}
										{activity.type === "wellness_check" && (
											<Heart
												className="w-5 h-5 text-amber-600"
												aria-hidden="true"
											/>
										)}
										{activity.type === "elya_chat" && (
											<MessageCircle
												className="w-5 h-5 text-purple-600"
												aria-hidden="true"
											/>
										)}
									</div>

									{/* Activity Details */}
									<div className="flex-1">
										<h3 className="font-medium text-gray-900">
											{activity.title}
										</h3>
										{activity.summary && (
											<p className="text-sm text-gray-600 mt-1">
												{activity.summary}
											</p>
										)}
										<div className="flex items-center gap-4 mt-2">
											<span className="text-xs text-gray-500">
												<Clock
													className="w-3 h-3 inline mr-1"
													aria-hidden="true"
												/>
												{new Date(activity.timestamp).toLocaleString()}
											</span>
											{activity.metrics?.confidence && (
												<span className="text-xs text-gray-500">
													Confidence: {activity.metrics.confidence}/10
												</span>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-gray-500 text-center py-8">
							No recent activities. Start a reflection to begin tracking your
							growth!
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

// ========== QA TEST PLAN ==========
/**
 * MANUAL TEST PLAN FOR GROWTH INSIGHTS DASHBOARD
 *
 * 1. AUTHENTICATION TESTS:
 *    - [ ] Verify dashboard only loads when user is logged in
 *    - [ ] Check that data is specific to logged-in user
 *    - [ ] Test logout/login flow preserves correct data
 *
 * 2. METRICS DISPLAY TESTS:
 *    - [ ] Verify total reflections count matches database
 *    - [ ] Check week/month trends calculate correctly
 *    - [ ] Confirm burnout score average is accurate
 *    - [ ] Test streak calculations (current and longest)
 *    - [ ] Verify team/values metrics display
 *
 * 3. TIME RANGE TESTS:
 *    - [ ] Switch between Week/Month/Quarter views
 *    - [ ] Verify data updates accordingly
 *    - [ ] Check loading states during switches
 *
 * 4. CTA BUTTON TESTS:
 *    - [ ] Click "Start Guided Reflection" - verify action logs
 *    - [ ] Click "Quick Stress Reset" - verify action logs
 *    - [ ] Click "Chat with Elya" - verify action logs
 *    - [ ] Test keyboard navigation for all buttons
 *
 * 5. ACTIVITY TIMELINE TESTS:
 *    - [ ] Verify recent activities display in correct order
 *    - [ ] Check activity icons match activity types
 *    - [ ] Confirm timestamps are formatted correctly
 *    - [ ] Test empty state when no activities exist
 *
 * 6. ACCESSIBILITY TESTS:
 *    - [ ] Navigate entire dashboard with keyboard only
 *    - [ ] Test with screen reader (NVDA/JAWS)
 *    - [ ] Verify all images have alt text
 *    - [ ] Check color contrast meets WCAG AA
 *    - [ ] Test focus indicators are visible
 *    - [ ] Verify aria-labels and roles are present
 *
 * 7. ERROR HANDLING TESTS:
 *    - [ ] Test with network offline
 *    - [ ] Verify error messages are helpful
 *    - [ ] Check retry functionality works
 *
 * 8. PERFORMANCE TESTS:
 *    - [ ] Dashboard loads within 3 seconds
 *    - [ ] Charts render smoothly
 *    - [ ] No memory leaks on repeated navigation
 *
 * 9. RESPONSIVE DESIGN TESTS:
 *    - [ ] Test on mobile (375px width)
 *    - [ ] Test on tablet (768px width)
 *    - [ ] Test on desktop (1440px width)
 *    - [ ] Verify layout adapts properly
 *
 * 10. DATA ACCURACY TESTS:
 *     - [ ] Create new reflection, verify metrics update
 *     - [ ] Complete wellness check, confirm score changes
 *     - [ ] Use stress reset tool, check count increases
 *     - [ ] Verify streak updates daily
 */

export default GrowthInsights;
