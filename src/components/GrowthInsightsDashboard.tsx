import {
	AlertTriangle,
	ArrowDown,
	ArrowUp,
	BookOpen,
	CheckCircle,
	ChevronRight,
	Download,
	Flame,
	Frown,
	Heart,
	Info,
	Meh,
	MessageCircle,
	Minus,
	RefreshCw,
	Share2,
	Shield,
	Smile,
	Sparkles,
	Trophy,
	Users,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

// ========== TYPES & INTERFACES ==========
interface EmotionEntry {
	id?: string;
	user_id: string;
	value: "red" | "amber" | "green";
	emoji?: string;
	note?: string;
	timestamp: string;
}

interface Badge {
	id: string;
	name: string;
	description: string;
	icon: React.ReactNode;
	earned: boolean;
	earnedDate?: string;
	progress?: number;
}

interface Metric {
	label: string;
	value: number | string;
	trend?: "up" | "down" | "stable";
	trendValue?: string;
	icon: React.ReactNode;
	color: string;
	bgColor: string;
	description: string;
	cta?: {
		label: string;
		action: () => void;
	};
}

interface ActivityFeedItem {
	id: string;
	type: string;
	title: string;
	timestamp: string;
	icon: React.ReactNode;
	color: string;
	impact?: string;
}

// ========== CONSTANTS ==========
const EMOTION_CONFIG = {
	red: {
		label: "Struggling",
		emoji: "😟",
		color: "#DC2626",
		bgColor: "#FEE2E2",
		icon: <Frown className="w-5 h-5" />,
	},
	amber: {
		label: "Managing",
		emoji: "😐",
		color: "#F59E0B",
		bgColor: "#FEF3C7",
		icon: <Meh className="w-5 h-5" />,
	},
	green: {
		label: "Thriving",
		emoji: "😊",
		color: "#10B981",
		bgColor: "#D1FAE5",
		icon: <Smile className="w-5 h-5" />,
	},
};

const BADGES_CONFIG: Badge[] = [
	{
		id: "streak_warrior",
		name: "Streak Warrior",
		description: "7 day reflection streak",
		icon: <Flame className="w-6 h-6" />,
		earned: false,
		progress: 0,
	},
	{
		id: "wellness_champion",
		name: "Wellness Champion",
		description: "Complete 10 wellness check-ins",
		icon: <Trophy className="w-6 h-6" />,
		earned: false,
		progress: 0,
	},
	{
		id: "boundary_setter",
		name: "Boundary Setter",
		description: "Log 5 boundary reflections",
		icon: <Shield className="w-6 h-6" />,
		earned: false,
		progress: 0,
	},
	{
		id: "team_player",
		name: "Team Player",
		description: "Complete 3 team reflections",
		icon: <Users className="w-6 h-6" />,
		earned: false,
		progress: 0,
	},
];

// ========== MAIN COMPONENT ==========
const GrowthInsightsDashboard: React.FC = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// State Management
	const [todayEmotion, setTodayEmotion] = useState<EmotionEntry | null>(null);
	const [weekEmotions, setWeekEmotions] = useState<EmotionEntry[]>([]);
	const [metrics, setMetrics] = useState<Metric[]>([]);
	const [badges, setBadges] = useState<Badge[]>(BADGES_CONFIG);
	const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
	const [showToast, setShowToast] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const [communityAverage, setCommunityAverage] = useState<
		Record<string, number>
	>({});

	// Refs for accessibility
	const emotionSectionRef = useRef<HTMLDivElement>(null);
	const announcementRef = useRef<HTMLDivElement>(null);

	// ========== DATA FETCHING ==========
	useEffect(() => {
		if (!user) return;
		fetchDashboardData();
	}, [user]);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			setError(null);

			// Fetch all data in parallel for performance
			const [
				emotionsData,
				reflectionsData,
				wellnessData,
				stressResetsData,
				teamingData,
				streakData,
				communityData,
			] = await Promise.all([
				fetchEmotions(),
				fetchReflections(),
				fetchWellnessScores(),
				fetchStressResets(),
				fetchTeamingData(),
				fetchStreaks(),
				fetchCommunityAverages(),
			]);

			// Process and set metrics
			processMetrics({
				emotions: emotionsData,
				reflections: reflectionsData,
				wellness: wellnessData,
				stressResets: stressResetsData,
				teaming: teamingData,
				streaks: streakData,
			});

			// Update badges based on actual data
			updateBadges(reflectionsData, wellnessData, teamingData, streakData);

			// Generate activity feed
			generateActivityFeed(reflectionsData, stressResetsData);

			setCommunityAverage(communityData);
		} catch (err) {
			console.error("Dashboard fetch error:", err);
			setError("Failed to load dashboard data. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// ========== EMOTION RAG SYSTEM ==========
	const fetchEmotions = async () => {
		const { data, error } = await supabase
			.from("emotion_entries")
			.select("*")
			.eq("user_id", user?.id)
			.gte(
				"timestamp",
				new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
			)
			.order("timestamp", { ascending: false });

		if (error) throw error;

		const emotions = data || [];
		setWeekEmotions(emotions);

		// Check if today's emotion is set
		const today = new Date().toDateString();
		const todayEntry = emotions.find(
			(e) => new Date(e.timestamp).toDateString() === today,
		);
		setTodayEmotion(todayEntry || null);

		return emotions;
	};

	const saveEmotion = async (
		value: "red" | "amber" | "green",
		emoji?: string,
	) => {
		try {
			const entry: EmotionEntry = {
				user_id: user!.id,
				value,
				emoji,
				timestamp: new Date().toISOString(),
			};

			const { data, error } = await supabase
				.from("emotion_entries")
				.upsert(entry)
				.select()
				.single();

			if (error) throw error;

			setTodayEmotion(data);

			// Show success toast
			showSuccessToast(
				`Mood logged: ${EMOTION_CONFIG[value].label} ${emoji || ""}`,
			);

			// Announce to screen readers
			announceToScreenReader(
				`Your mood has been logged as ${EMOTION_CONFIG[value].label}`,
			);

			// Log action
			await logUserAction("emotion_logged", { value, emoji });

			// Refresh emotions list
			fetchEmotions();
		} catch (err) {
			console.error("Error saving emotion:", err);
			showErrorToast("Failed to save mood. Please try again.");
		}
	};

	// ========== METRICS PROCESSING ==========
	const fetchReflections = async () => {
		const { data, error } = await supabase
			.from("reflection_entries")
			.select("*")
			.eq("user_id", user?.id)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data || [];
	};

	const fetchWellnessScores = async () => {
		const { data, error } = await supabase
			.from("reflection_entries")
			.select("data, created_at")
			.eq("user_id", user?.id)
			.eq("entry_kind", "wellness_checkin")
			.gte(
				"created_at",
				new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
			)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data || [];
	};

	const fetchStressResets = async () => {
		const { data, error } = await supabase
			.from("stress_reset_logs")
			.select("*")
			.eq("user_id", user?.id)
			.gte(
				"created_at",
				new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
			)
			.order("created_at", { ascending: false });

		if (error) console.error("Stress resets fetch error:", error);
		return data || [];
	};

	const fetchTeamingData = async () => {
		const { data, error } = await supabase
			.from("reflection_entries")
			.select("*")
			.eq("user_id", user?.id)
			.in("entry_kind", ["teaming_prep", "teaming_reflection", "compass_check"])
			.gte(
				"created_at",
				new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
			);

		if (error) console.error("Teaming data fetch error:", error);
		return data || [];
	};

	const fetchStreaks = async () => {
		const { data, error } = await supabase
			.from("daily_activity")
			.select("*")
			.eq("user_id", user?.id)
			.order("activity_date", { ascending: false })
			.limit(365);

		if (error) console.error("Streak fetch error:", error);

		// Calculate current streak
		let currentStreak = 0;
		if (data && data.length > 0) {
			const today = new Date().toDateString();
			const yesterday = new Date(Date.now() - 86400000).toDateString();

			for (let i = 0; i < data.length; i++) {
				const activityDate = new Date(data[i].activity_date).toDateString();
				if (i === 0 && (activityDate === today || activityDate === yesterday)) {
					currentStreak++;
				} else if (currentStreak > 0) {
					const prevDate = new Date(data[i - 1].activity_date);
					const currDate = new Date(data[i].activity_date);
					const dayDiff = (prevDate.getTime() - currDate.getTime()) / 86400000;
					if (dayDiff === 1) {
						currentStreak++;
					} else {
						break;
					}
				}
			}
		}

		return { current: currentStreak, data };
	};

	const fetchCommunityAverages = async () => {
		// TODO: Implement actual community averages query
		// For now, return mock data
		return {
			avgReflectionsPerWeek: 4.2,
			avgWellnessScore: 7.1,
			avgStreak: 3.5,
			avgStressResetsPerWeek: 6.8,
		};
	};

	const processMetrics = (data: any) => {
		const { reflections, wellness, stressResets, teaming, streaks } = data;

		const now = new Date();
		const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		// Calculate reflection metrics
		const totalReflections = reflections.length;
		const weekReflections = reflections.filter(
			(r: any) => new Date(r.created_at) >= oneWeekAgo,
		).length;
		const monthReflections = reflections.filter(
			(r: any) => new Date(r.created_at) >= oneMonthAgo,
		).length;

		// Calculate wellness average
		const wellnessScores = wellness.map(
			(w: any) => (w.data as any)?.overall_wellbeing || 5,
		);
		const avgWellness =
			wellnessScores.length > 0
				? wellnessScores.reduce((a: number, b: number) => a + b, 0) /
					wellnessScores.length
				: 5;

		// Last reflection check
		const lastReflection = reflections[0];
		const daysSinceLastReflection = lastReflection
			? Math.floor(
					(now.getTime() - new Date(lastReflection.created_at).getTime()) /
						86400000,
				)
			: null;

		const metricsData: Metric[] = [
			{
				label: "Total Reflections",
				value: totalReflections,
				trend: weekReflections > 0 ? "up" : "stable",
				trendValue: `${weekReflections} this week`,
				icon: <BookOpen className="w-6 h-6" />,
				color: "#3B82F6",
				bgColor: "#DBEAFE",
				description: "Regular reflection reduces burnout by 30%",
				cta:
					daysSinceLastReflection && daysSinceLastReflection > 2
						? {
								label: "Add Reflection",
								action: handleStartReflection,
							}
						: undefined,
			},
			{
				label: "Wellness Score",
				value: avgWellness.toFixed(1) + "/10",
				trend: avgWellness > 6 ? "up" : avgWellness < 5 ? "down" : "stable",
				icon: <Heart className="w-6 h-6" />,
				color: "#EF4444",
				bgColor: "#FEE2E2",
				description: "Track your overall wellbeing",
				cta: {
					label: "Check Wellness",
					action: handleWellnessCheck,
				},
			},
			{
				label: "Current Streak",
				value: `${streaks.current} days`,
				trend: streaks.current > 0 ? "up" : "down",
				icon: <Flame className="w-6 h-6" />,
				color: "#F59E0B",
				bgColor: "#FEF3C7",
				description: "Consistency builds resilience",
				cta:
					streaks.current === 0
						? {
								label: "Start Streak",
								action: handleStartReflection,
							}
						: undefined,
			},
			{
				label: "Stress Resets",
				value: stressResets.length,
				trendValue: "Last 30 days",
				icon: <RefreshCw className="w-6 h-6" />,
				color: "#10B981",
				bgColor: "#D1FAE5",
				description: "Regular resets prevent accumulation",
				cta: {
					label: "Try Reset",
					action: handleStressReset,
				},
			},
			{
				label: "Team Sessions",
				value: teaming.filter((t: any) => t.entry_kind.includes("teaming"))
					.length,
				icon: <Users className="w-6 h-6" />,
				color: "#8B5CF6",
				bgColor: "#EDE9FE",
				description: "Collaboration insights",
				cta: {
					label: "Team Reflection",
					action: handleTeamReflection,
				},
			},
			{
				label: "Values Checks",
				value: teaming.filter((t: any) => t.entry_kind === "compass_check")
					.length,
				icon: <Shield className="w-6 h-6" />,
				color: "#14B8A6",
				bgColor: "#CCFBF1",
				description: "Navigate ethical dilemmas",
				cta: {
					label: "Check Values",
					action: handleValuesCheck,
				},
			},
		];

		setMetrics(metricsData);
	};

	// ========== GAMIFICATION ==========
	const updateBadges = (
		reflections: any[],
		wellness: any[],
		teaming: any[],
		streaks: any,
	) => {
		const updatedBadges = [...BADGES_CONFIG];

		// Streak Warrior
		if (streaks.current >= 7) {
			updatedBadges[0].earned = true;
			updatedBadges[0].earnedDate = new Date().toISOString();
		} else {
			updatedBadges[0].progress = (streaks.current / 7) * 100;
		}

		// Wellness Champion
		const wellnessCount = wellness.length;
		if (wellnessCount >= 10) {
			updatedBadges[1].earned = true;
			updatedBadges[1].earnedDate = new Date().toISOString();
		} else {
			updatedBadges[1].progress = (wellnessCount / 10) * 100;
		}

		// Boundary Setter
		const boundaryCount = reflections.filter(
			(r: any) => r.entry_kind === "compass_check",
		).length;
		if (boundaryCount >= 5) {
			updatedBadges[2].earned = true;
			updatedBadges[2].earnedDate = new Date().toISOString();
		} else {
			updatedBadges[2].progress = (boundaryCount / 5) * 100;
		}

		// Team Player
		const teamCount = teaming.filter((t: any) =>
			t.entry_kind.includes("teaming"),
		).length;
		if (teamCount >= 3) {
			updatedBadges[3].earned = true;
			updatedBadges[3].earnedDate = new Date().toISOString();
		} else {
			updatedBadges[3].progress = (teamCount / 3) * 100;
		}

		setBadges(updatedBadges);
	};

	const generateActivityFeed = (reflections: any[], stressResets: any[]) => {
		const feedItems: ActivityFeedItem[] = [];

		// Add recent reflections
		reflections.slice(0, 3).forEach((reflection: any) => {
			feedItems.push({
				id: reflection.id,
				type: "reflection",
				title: formatActivityTitle(reflection.entry_kind),
				timestamp: reflection.created_at,
				icon: <BookOpen className="w-4 h-4" />,
				color: "#3B82F6",
				impact: "Improved clarity",
			});
		});

		// Add stress resets
		stressResets.slice(0, 2).forEach((reset: any) => {
			feedItems.push({
				id: reset.id,
				type: "stress_reset",
				title: `${reset.tool_type} Reset`,
				timestamp: reset.created_at,
				icon: <RefreshCw className="w-4 h-4" />,
				color: "#10B981",
				impact: "Reduced stress",
			});
		});

		// Sort by timestamp
		feedItems.sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);

		setActivities(feedItems.slice(0, 5));
	};

	// ========== ACTION HANDLERS ==========
	const handleStartReflection = async () => {
		await logUserAction("start_reflection_clicked");
		showSuccessToast("Opening Reflection Studio...");
		// TODO: Navigate to reflection studio
		console.log("[CTA] Start Reflection clicked");
	};

	const handleWellnessCheck = async () => {
		await logUserAction("wellness_check_clicked");
		showSuccessToast("Opening Wellness Check-in...");
		// TODO: Open wellness check-in modal
		console.log("[CTA] Wellness Check clicked");
	};

	const handleStressReset = async () => {
		await logUserAction("stress_reset_clicked");
		showSuccessToast("Opening Stress Reset Tools...");
		// TODO: Open stress reset modal
		console.log("[CTA] Stress Reset clicked");
	};

	const handleTeamReflection = async () => {
		await logUserAction("team_reflection_clicked");
		showSuccessToast("Opening Team Reflection...");
		// TODO: Navigate to team reflection
		console.log("[CTA] Team Reflection clicked");
	};

	const handleValuesCheck = async () => {
		await logUserAction("values_check_clicked");
		showSuccessToast("Opening Values Check...");
		// TODO: Open values check modal
		console.log("[CTA] Values Check clicked");
	};

	const handleChatWithElya = async () => {
		await logUserAction("chat_elya_clicked");
		showSuccessToast("Connecting with Elya...");
		// TODO: Open Elya chat
		console.log("[CTA] Chat with Elya clicked");
	};

	const handleExportData = async () => {
		await logUserAction("export_data_clicked");
		showSuccessToast("Preparing data export...");
		// TODO: Implement data export
		console.log("[CTA] Export Data clicked");
	};

	const handleShareProgress = async () => {
		await logUserAction("share_progress_clicked");
		showSuccessToast("Opening share options...");
		// TODO: Implement share functionality
		console.log("[CTA] Share Progress clicked");
	};

	// ========== UTILITY FUNCTIONS ==========
	const logUserAction = async (action: string, metadata?: any) => {
		try {
			await supabase.from("user_actions").insert({
				user_id: user?.id,
				action,
				metadata,
				timestamp: new Date().toISOString(),
			});
		} catch (err) {
			console.error("Failed to log action:", err);
		}
	};

	const formatActivityTitle = (entryKind: string): string => {
		const titles: Record<string, string> = {
			wellness_checkin: "Wellness Check-In",
			pre_assignment_prep: "Pre-Assignment Prep",
			post_assignment_debrief: "Post-Assignment Debrief",
			teaming_prep: "Teaming Preparation",
			teaming_reflection: "Teaming Reflection",
			compass_check: "Values & Ethics Check",
			breathing_practice: "Breathing Practice",
			body_awareness: "Body Awareness",
		};
		return titles[entryKind] || "Reflection";
	};

	const showSuccessToast = (message: string) => {
		setToastMessage(message);
		setShowToast(true);
		setTimeout(() => setShowToast(false), 3000);
	};

	const showErrorToast = (message: string) => {
		setToastMessage(message);
		setShowToast(true);
		setTimeout(() => setShowToast(false), 3000);
	};

	const announceToScreenReader = (message: string) => {
		if (announcementRef.current) {
			announcementRef.current.textContent = message;
		}
	};

	const formatTimeAgo = (timestamp: string): string => {
		const now = new Date().getTime();
		const then = new Date(timestamp).getTime();
		const diff = now - then;

		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		return `${days}d ago`;
	};

	// ========== RENDER HELPERS ==========
	const renderEmotionRAG = () => (
		<section
			ref={emotionSectionRef}
			className="rounded-2xl shadow-clean p-6 transition-all hover:shadow-clean-md hover:-translate-y-0.5 mb-6"
			style={{
				backgroundColor: "var(--color-card)",
				border: "1px solid var(--color-slate-200)"
			}}
			role="region"
			aria-labelledby="emotion-rag-heading"
		>
			<div className="flex items-start justify-between mb-4">
				<div>
					<h2
						id="emotion-rag-heading"
						className="text-xl font-bold"
						style={{ color: "var(--color-slate-700)" }}
					>
						Daily Mood Check-in
					</h2>
					<p className="text-sm text-gray-600 mt-1">
						{todayEmotion
							? "Today's mood logged"
							: "How are you feeling today?"}
					</p>
				</div>
				<div className="relative group">
					<button
						aria-label="Information about mood tracking"
						className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
					>
						<Info className="w-5 h-5 text-gray-400" />
					</button>
					<div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
						Regular mood tracking helps identify patterns and triggers in your
						wellness journey
					</div>
				</div>
			</div>

			{/* Emotion Selector */}
			<div className="grid grid-cols-3 gap-3 mb-6">
				{Object.entries(EMOTION_CONFIG).map(([key, config]) => (
					<button
						key={key}
						onClick={() =>
							saveEmotion(key as "red" | "amber" | "green", config.emoji)
						}
						className={`p-4 rounded-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
							todayEmotion?.value === key
								? "ring-2 ring-offset-2"
								: "hover:shadow-md"
						}`}
						style={{
							backgroundColor: config.bgColor,
							borderColor: config.color,
							focusRingColor: config.color,
						}}
						aria-label={`Select ${config.label} mood`}
						aria-pressed={todayEmotion?.value === key}
					>
						<div className="flex flex-col items-center">
							<span
								className="text-2xl mb-2"
								role="img"
								aria-label={config.label}
							>
								{config.emoji}
							</span>
							{React.cloneElement(config.icon as React.ReactElement, {
								style: { color: config.color },
							})}
							<span
								className="text-sm font-medium mt-2"
								style={{ color: config.color }}
							>
								{config.label}
							</span>
						</div>
					</button>
				))}
			</div>

			{/* Week Mood Trend */}
			<div>
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-sm font-medium text-gray-700">
						This Week's Mood Trend
					</h3>
					<div className="text-xs text-gray-400 flex items-center gap-1">
						<Info className="w-3 h-3" aria-hidden="true" />
						<span>Daily mood check-in logs</span>
					</div>
				</div>
				<div
					className="flex gap-1"
					role="list"
					aria-label="Weekly mood history"
				>
					{[...Array(7)].map((_, index) => {
						const date = new Date();
						date.setDate(date.getDate() - (6 - index));
						const dateStr = date.toDateString();
						const emotion = weekEmotions.find(
							(e) => new Date(e.timestamp).toDateString() === dateStr,
						);

						return (
							<div
								key={index}
								className="flex-1 h-8 rounded"
								style={{
									backgroundColor: emotion
										? EMOTION_CONFIG[emotion.value].bgColor
										: "#F3F4F6",
								}}
								role="listitem"
								aria-label={`${date.toLocaleDateString("en-US", { weekday: "short" })}: ${
									emotion ? EMOTION_CONFIG[emotion.value].label : "Not logged"
								}`}
								title={date.toLocaleDateString("en-US", { weekday: "short" })}
							/>
						);
					})}
				</div>
				<p className="sr-only">
					Weekly mood summary: {weekEmotions.length} moods logged this week
				</p>
			</div>
		</section>
	);

	const renderMetricsGrid = () => (
		<section
			className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
			role="region"
			aria-label="Key metrics"
		>
			{metrics.map((metric, index) => (
				<article
					key={index}
					className="rounded-2xl shadow-clean p-6 transition-all hover:shadow-clean-md hover:-translate-y-0.5"
					style={{
						backgroundColor: "var(--color-card)",
						border: "1px solid var(--color-slate-200)"
					}}
					role="article"
					aria-labelledby={`metric-${index}-heading`}
				>
					<div className="flex items-start justify-between mb-4">
						<div
							className="p-3 rounded-lg"
							style={{ backgroundColor: metric.bgColor }}
						>
							{React.cloneElement(metric.icon as React.ReactElement, {
								style: { color: metric.color },
								"aria-hidden": true,
							})}
						</div>
						{metric.trend && (
							<div className="flex items-center gap-1 text-sm">
								{metric.trend === "up" && (
									<ArrowUp className="w-4 h-4 text-green-600" />
								)}
								{metric.trend === "down" && (
									<ArrowDown className="w-4 h-4 text-red-600" />
								)}
								{metric.trend === "stable" && (
									<Minus className="w-4 h-4 text-gray-600" />
								)}
								{metric.trendValue && (
									<span className="text-gray-600">{metric.trendValue}</span>
								)}
							</div>
						)}
					</div>

					<h3
						id={`metric-${index}-heading`}
						className="text-2xl font-bold text-gray-900"
					>
						{metric.value}
					</h3>
					<p className="text-sm text-gray-600 mt-1">{metric.label}</p>

					{/* Comparison with community */}
					{communityAverage && metric.label === "Total Reflections" && (
						<p className="text-xs text-gray-500 mt-2">
							Community avg: {communityAverage.avgReflectionsPerWeek}/week
						</p>
					)}

					{/* Info tooltip */}
					<div className="mt-3 text-xs text-gray-500 italic">
						{metric.description}
					</div>

					{/* Data Source Note */}
					<div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
						<Info className="w-3 h-3" aria-hidden="true" />
						<span>
							{metric.label === "Total Reflections" && "Data from: All reflection entries"}
							{metric.label === "Wellness Score" && "Data from: Wellness check-in reflections"}
							{metric.label === "Current Streak" && "Data from: Daily activity tracking"}
							{metric.label === "Stress Resets" && "Data from: Stress reset tool logs"}
							{metric.label === "Team Sessions" && "Data from: Team prep & reflection entries"}
							{metric.label === "Values Checks" && "Data from: Compass check reflections"}
						</span>
					</div>

					{/* CTA Button */}
					{metric.cta && (
						<button
							onClick={metric.cta.action}
							className="mt-4 w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
							style={{
								backgroundColor: metric.bgColor,
								color: metric.color,
								focusRingColor: metric.color,
							}}
							aria-label={metric.cta.label}
						>
							{metric.cta.label}
							<ChevronRight
								className="w-4 h-4 inline ml-1"
								aria-hidden="true"
							/>
						</button>
					)}
				</article>
			))}
		</section>
	);

	const renderBadges = () => (
		<section
			className="rounded-2xl shadow-clean p-6 transition-all hover:shadow-clean-md hover:-translate-y-0.5 mb-6"
			style={{
				backgroundColor: "var(--color-card)",
				border: "1px solid var(--color-slate-200)"
			}}
			role="region"
			aria-labelledby="badges-heading"
		>
			<div className="flex items-center justify-between mb-4">
				<h2
					id="badges-heading"
					className="text-xl font-bold"
					style={{ color: "var(--color-slate-700)" }}
				>
					Achievements & Progress
				</h2>
				<div className="text-xs text-gray-400 flex items-center gap-1">
					<Info className="w-3 h-3" aria-hidden="true" />
					<span>Based on reflection activity & streaks</span>
				</div>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{badges.map((badge) => (
					<div
						key={badge.id}
						className={`text-center p-4 rounded-xl transition-all ${
							badge.earned
								? "bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-amber-300"
								: "bg-gray-50"
						}`}
						role="article"
						aria-label={`${badge.name} badge: ${badge.earned ? "Earned" : `${badge.progress}% complete`}`}
					>
						<div
							className={`inline-flex p-3 rounded-full mb-2 ${
								badge.earned ? "bg-amber-200" : "bg-gray-200"
							}`}
						>
							{React.cloneElement(badge.icon as React.ReactElement, {
								style: { color: badge.earned ? "#F59E0B" : "#9CA3AF" },
							})}
						</div>
						<h3 className="text-sm font-medium text-gray-900">{badge.name}</h3>
						<p className="text-xs text-gray-600 mt-1">{badge.description}</p>
						{!badge.earned && badge.progress !== undefined && (
							<div className="mt-2">
								<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
									<div
										className="h-full bg-amber-500 transition-all"
										style={{ width: `${badge.progress}%` }}
										role="progressbar"
										aria-valuenow={badge.progress}
										aria-valuemin={0}
										aria-valuemax={100}
									/>
								</div>
								<span className="text-xs text-gray-500 mt-1">
									{badge.progress}% complete
								</span>
							</div>
						)}
						{badge.earned && badge.earnedDate && (
							<p className="text-xs text-amber-600 mt-2">
								Earned {new Date(badge.earnedDate).toLocaleDateString()}
							</p>
						)}
					</div>
				))}
			</div>
		</section>
	);

	const renderActivityFeed = () => (
		<section
			className="rounded-2xl shadow-clean p-6 transition-all hover:shadow-clean-md hover:-translate-y-0.5 mb-6"
			style={{
				backgroundColor: "var(--color-card)",
				border: "1px solid var(--color-slate-200)"
			}}
			role="region"
			aria-labelledby="activity-heading"
		>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<h2
						id="activity-heading"
						className="text-xl font-bold"
						style={{ color: "var(--color-slate-700)" }}
					>
						Recent Activity & Impact
					</h2>
					<div className="text-xs text-gray-400 flex items-center gap-1">
						<Info className="w-3 h-3" aria-hidden="true" />
						<span>Latest 5 reflections & stress resets</span>
					</div>
				</div>
				<button
					onClick={fetchDashboardData}
					className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
					aria-label="Refresh activity feed"
				>
					<RefreshCw className="w-5 h-5 text-gray-600" />
				</button>
			</div>

			{activities.length > 0 ? (
				<div className="space-y-3" role="list">
					{activities.map((activity) => (
						<div
							key={activity.id}
							className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
							role="listitem"
						>
							<div
								className="p-2 rounded-lg flex-shrink-0"
								style={{ backgroundColor: `${activity.color}20` }}
							>
								{React.cloneElement(activity.icon as React.ReactElement, {
									style: { color: activity.color },
								})}
							</div>
							<div className="flex-1">
								<h3 className="text-sm font-medium text-gray-900">
									{activity.title}
								</h3>
								{activity.impact && (
									<p className="text-xs text-green-600 mt-1">
										✓ {activity.impact}
									</p>
								)}
								<time
									className="text-xs text-gray-500 mt-1"
									dateTime={activity.timestamp}
								>
									{formatTimeAgo(activity.timestamp)}
								</time>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="text-center py-8">
					<p className="text-gray-500">No recent activities</p>
					<button
						onClick={handleStartReflection}
						className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Start Your First Reflection
					</button>
				</div>
			)}
		</section>
	);

	const renderCTASection = () => (
		<section
			className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
			role="region"
			aria-label="Quick actions"
		>
			<button
				onClick={handleChatWithElya}
				className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
				aria-label="Chat with Elya support assistant"
			>
				<div className="flex items-center gap-3">
					<MessageCircle className="w-5 h-5" aria-hidden="true" />
					<span className="font-medium">Chat with Elya</span>
				</div>
				<ChevronRight className="w-5 h-5" aria-hidden="true" />
			</button>

			<button
				onClick={handleExportData}
				className="flex items-center justify-between p-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
				aria-label="Export your wellness data"
			>
				<div className="flex items-center gap-3">
					<Download className="w-5 h-5" aria-hidden="true" />
					<span className="font-medium">Export Data</span>
				</div>
				<ChevronRight className="w-5 h-5" aria-hidden="true" />
			</button>

			<button
				onClick={handleShareProgress}
				className="flex items-center justify-between p-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
				aria-label="Share your progress"
			>
				<div className="flex items-center gap-3">
					<Share2 className="w-5 h-5" aria-hidden="true" />
					<span className="font-medium">Share Progress</span>
				</div>
				<ChevronRight className="w-5 h-5" aria-hidden="true" />
			</button>
		</section>
	);

	// ========== MAIN RENDER ==========
	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center" role="status" aria-live="polite">
					<RefreshCw
						className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600"
						aria-hidden="true"
					/>
					<p className="text-gray-600">Loading your growth insights...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div
					className="text-center p-6 bg-red-50 rounded-lg max-w-md"
					role="alert"
				>
					<AlertTriangle
						className="w-8 h-8 text-red-600 mx-auto mb-4"
						aria-hidden="true"
					/>
					<p className="text-red-800 mb-4">{error}</p>
					<button
						onClick={fetchDashboardData}
						className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
			{/* Skip to main content link */}
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
			>
				Skip to main content
			</a>

			{/* Screen reader announcements */}
			<div
				ref={announcementRef}
				className="sr-only"
				role="status"
				aria-live="polite"
				aria-atomic="true"
			/>

			{/* Header */}
			<header className="shadow-clean" style={{ backgroundColor: "var(--color-card)", borderBottom: "1px solid var(--color-slate-200)" }}>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold" style={{ color: "var(--color-slate-700)" }}>
								Growth Insights Dashboard
							</h1>
							<p className="mt-1" style={{ color: "var(--color-slate-600)" }}>
								Your wellness journey at a glance
							</p>
						</div>
						<nav
							className="flex items-center gap-2"
							aria-label="Dashboard actions"
						>
							<button
								onClick={fetchDashboardData}
								className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
								aria-label="Refresh dashboard"
							>
								<RefreshCw className="w-5 h-5 text-gray-600" />
							</button>
						</nav>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main
				id="main-content"
				className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
			>
				{/* Emotion RAG Section */}
				{renderEmotionRAG()}

				{/* Nudge Alert */}
				{metrics.some((m) => m.cta && m.label === "Total Reflections") && (
					<div
						className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6"
						role="alert"
					>
						<div className="flex">
							<AlertTriangle
								className="w-5 h-5 text-amber-400 flex-shrink-0"
								aria-hidden="true"
							/>
							<div className="ml-3">
								<p className="text-sm text-amber-700">
									<strong>Gentle reminder:</strong> No reflection in 3+ days.
									Taking just 5 minutes can make a difference!
								</p>
								<button
									onClick={handleStartReflection}
									className="text-sm text-amber-700 underline hover:text-amber-800 mt-1"
								>
									Start a quick reflection →
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Metrics Grid */}
				{renderMetricsGrid()}

				{/* Badges Section */}
				{renderBadges()}

				{/* Activity Feed */}
				{renderActivityFeed()}

				{/* CTA Buttons */}
				{renderCTASection()}

				{/* Micro-habit Prompt */}
				<section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
					<Sparkles
						className="w-8 h-8 text-purple-600 mx-auto mb-3"
						aria-hidden="true"
					/>
					<h2 className="text-lg font-semibold text-gray-900 mb-2">
						Today's Micro-habit
					</h2>
					<p className="text-gray-700 mb-4">
						Take 5 minutes for a quick reflection. Small steps lead to big
						changes.
					</p>
					<button
						onClick={handleStartReflection}
						className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
					>
						Start Now
					</button>
				</section>
			</main>

			{/* Footer */}
			<footer className="bg-white mt-12 py-6 border-t">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<nav
						className="flex flex-wrap justify-center gap-4 text-sm"
						aria-label="Footer navigation"
					>
						<a
							href="/accessibility"
							className="text-gray-600 hover:text-gray-900"
						>
							Accessibility Statement
						</a>
						<a href="/privacy" className="text-gray-600 hover:text-gray-900">
							Privacy
						</a>
						<a href="/support" className="text-gray-600 hover:text-gray-900">
							Support
						</a>
					</nav>
				</div>
			</footer>

			{/* Toast Notification */}
			{showToast && (
				<div
					className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg z-50"
					role="alert"
					aria-live="assertive"
				>
					<div className="flex items-center gap-2">
						<CheckCircle
							className="w-5 h-5 text-green-400"
							aria-hidden="true"
						/>
						<span>{toastMessage}</span>
					</div>
				</div>
			)}
		</div>
	);
};

// ========== TEST DOCUMENTATION ==========
/**
 * UNIT TESTS TO IMPLEMENT:
 *
 * describe('GrowthInsightsDashboard', () => {
 *   test('renders without crashing', () => {});
 *   test('loads user data on mount', () => {});
 *   test('emotion selector saves to database', () => {});
 *   test('week emotions display correctly', () => {});
 *   test('metrics calculate correctly', () => {});
 *   test('badges update based on progress', () => {});
 *   test('activity feed shows recent items', () => {});
 *   test('CTAs trigger correct actions', () => {});
 *   test('keyboard navigation works', () => {});
 *   test('screen reader announcements work', () => {});
 *   test('responsive layout adapts', () => {});
 * });
 *
 * MANUAL QA CHECKLIST:
 *
 * 1. ACCESSIBILITY:
 *    [ ] Tab through all interactive elements
 *    [ ] Test with NVDA/JAWS screen reader
 *    [ ] Verify color contrast (use Chrome DevTools)
 *    [ ] Check all aria-labels are present
 *    [ ] Test keyboard shortcuts
 *    [ ] Verify focus indicators visible
 *
 * 2. EMOTION RAG:
 *    [ ] Select each emotion (red/amber/green)
 *    [ ] Verify saves to database
 *    [ ] Check week trend updates
 *    [ ] Test tooltip appears on hover
 *
 * 3. METRICS:
 *    [ ] Verify all counts are accurate
 *    [ ] Check trends display correctly
 *    [ ] Test CTA buttons appear when needed
 *    [ ] Verify community comparisons show
 *
 * 4. GAMIFICATION:
 *    [ ] Check badge progress bars
 *    [ ] Verify earned badges display
 *    [ ] Test achievement notifications
 *    [ ] Check streak calculations
 *
 * 5. ACTIVITY FEED:
 *    [ ] Verify recent activities show
 *    [ ] Check timestamps format correctly
 *    [ ] Test refresh button works
 *    [ ] Verify impact messages display
 *
 * 6. CTAs:
 *    [ ] Test each CTA button
 *    [ ] Verify actions log to database
 *    [ ] Check toast notifications appear
 *    [ ] Test modal placeholders open
 *
 * 7. RESPONSIVE:
 *    [ ] Test on mobile (375px)
 *    [ ] Test on tablet (768px)
 *    [ ] Test on desktop (1440px)
 *    [ ] Verify cards stack properly
 *
 * 8. PERFORMANCE:
 *    [ ] Page loads < 3 seconds
 *    [ ] No memory leaks
 *    [ ] Smooth animations
 *    [ ] Efficient re-renders
 *
 * 9. ERROR STATES:
 *    [ ] Test with no data
 *    [ ] Test with network error
 *    [ ] Verify error messages helpful
 *    [ ] Test retry functionality
 *
 * 10. DATA EXPORT:
 *     [ ] Export button clickable
 *     [ ] Share button works
 *     [ ] Data format correct
 */

export default GrowthInsightsDashboard;
