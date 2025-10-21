import {
	BookOpen,
	CheckCircle,
	ChevronRight,
	Clock,
	Cloud,
	Eye,
	Gauge,
	Heart,
	Moon,
	Sun,
	Target,
	Trash2,
	Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { getDisplayName } from "../config/reflectionTypes";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { getSessionToken } from "../services/directSupabaseApi";

import { AllReflectionsView } from "./AllReflectionsView";
import { ConfettiCelebration } from "./animations/ConfettiCelebration";
import { ConfirmationModal } from "./ConfirmationModal";
import DailyBurnoutGaugeAccessible from "./DailyBurnoutGaugeAccessible";
import { EmptyReflectionIllustration } from "./illustrations/EmptyReflectionIllustration";
import { ReflectionDetailView } from "./ReflectionDetailView";
import { SuccessToast } from "./feedback/SuccessToast";
import { TrustBadge } from "./TrustBadge";

interface RecentReflection {
	id: string;
	date: Date;
	title: string;
	preview: string;
	mood: "excellent" | "good" | "neutral" | "challenging" | "difficult";
	tags: string[];
}

interface WellnessStats {
	mood: number; // 1-5 scale
	energy: number; // 1-5 scale
	streakDays: number;
	weeklyProgress: number; // percentage
}

interface PersonalizedHomepageProps {
	onNavigate?: (tab: string) => void;
	reflections?: Array<{
		id: string;
		type: string;
		data: any;
		timestamp: string;
	}>;
	onReflectionDeleted?: (reflectionId: string) => void;
}

const PersonalizedHomepage: React.FC<PersonalizedHomepageProps> = ({
	onNavigate,
	reflections = [],
	onReflectionDeleted,
}) => {
	const { user } = useAuth();
	const [userFullName, setUserFullName] = useState<string>("User");
	const [greeting, setGreeting] = useState("");
	const [dateString, setDateString] = useState("");
	const [showBurnoutGauge, setShowBurnoutGauge] = useState(false);
	const [showAllReflections, setShowAllReflections] = useState(false);
	const [burnoutScore, setBurnoutScore] = useState<number | null>(null);
	const [burnoutLevel, setBurnoutLevel] = useState<
		"low" | "moderate" | "high" | "severe" | null
	>(null);
	const [lastAssessmentDate, setLastAssessmentDate] = useState<string | null>(
		null,
	);
	const [lastAssessmentTime, setLastAssessmentTime] = useState<Date | null>(null);
	const [timeUntilNext, setTimeUntilNext] = useState<string>("");
	const [canTakeAssessment, setCanTakeAssessment] = useState(true);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [selectedReflection, setSelectedReflection] = useState<any>(null);
	const [confirmDelete, setConfirmDelete] = useState<{
		isOpen: boolean;
		reflectionId: string | null;
	}>({
		isOpen: false,
		reflectionId: null,
	});
	const [localReflections, setLocalReflections] = useState(reflections);
	const [supabaseStreak, setSupabaseStreak] = useState<number | null>(null);
	const [supabaseWeeklyProgress, setSupabaseWeeklyProgress] = useState<number | null>(null);
	const [showConfetti, setShowConfetti] = useState(false);
	const [showSuccessToast, setShowSuccessToast] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [successSubMessage, setSuccessSubMessage] = useState<string | undefined>();

	const [wellnessStats] = useState<WellnessStats>(() => {
		// Calculate real wellness stats from reflections and check-ins
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Get the MOST RECENT wellness check-in OR burnout assessment for mood and energy
		// Look for wellness_checkin or burnout_assessment types
		// Sort by timestamp descending to get the most recent one
		const wellnessCheckIns = reflections
			.filter(r => r.type === "wellness_checkin" || r.type === "Wellness Check-in" || r.type === "burnout_assessment")
			.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

		// Use the most recent wellness check-in or burnout assessment (index 0 after sorting)
		const todayCheckIn = wellnessCheckIns.length > 0 ? wellnessCheckIns[0] : null;

		// Extract mood and energy from today's check-in or use 0 for new users
		let mood = 0; // Default 0 for new users - no check-ins yet
		let energy = 0; // Default 0 for new users - no check-ins yet

		if (todayCheckIn?.data) {
			// Check if this is a burnout assessment
			if (todayCheckIn.type === "burnout_assessment") {
				// Burnout assessment data structure:
				// - total_score: 0-10 (higher = more burnout, lower = better wellbeing)
				// - energy_tank: 1-5 (higher = more energy)
				// - emotional_leakage: 1-5 (higher = better boundaries/mood)

				if (todayCheckIn.data.total_score !== undefined) {
					// Convert burnout score (0-10, lower is better) to mood (1-10, higher is better)
					// Invert: mood = 10 - burnout_score, then scale to 1-10 range
					mood = Math.min(10, Math.max(1, Math.round(10 - todayCheckIn.data.total_score)));
				}

				if (todayCheckIn.data.energy_tank !== undefined) {
					// Convert energy_tank (1-5) to energy (1-10) by doubling
					energy = Math.min(10, Math.max(1, todayCheckIn.data.energy_tank * 2));
				}
			} else {
				// Regular wellness check-in
				// Extract mood from data (scale 1-10)
				// Wellness check-in uses stressLevel, so we invert it for mood (10 - stress = mood)
				if (todayCheckIn.data.stressLevel !== undefined) {
					// Convert stress (1-10 where 10 is worst) to mood (1-10 where 10 is best)
					mood = Math.min(10, Math.max(1, 11 - todayCheckIn.data.stressLevel));
				} else if (todayCheckIn.data.mood) {
					mood = Math.min(10, Math.max(1, todayCheckIn.data.mood));
				} else if (todayCheckIn.data.emotionalState) {
					// Map emotional states to mood scores (1-10 scale)
					const moodMap: Record<string, number> = {
						'excellent': 10, 'great': 9, 'good': 8,
						'okay': 6, 'neutral': 5, 'fair': 5,
						'challenging': 4, 'difficult': 3, 'stressed': 3,
						'overwhelmed': 2, 'exhausted': 1
					};
					const state = todayCheckIn.data.emotionalState.toLowerCase();
					mood = moodMap[state] || 6;
				}

				// Extract energy from data (scale 1-10)
				// Wellness check-in uses energyLevel directly (1-10 scale)
				if (todayCheckIn.data.energyLevel !== undefined) {
					energy = Math.min(10, Math.max(1, todayCheckIn.data.energyLevel));
				} else if (todayCheckIn.data.energy) {
					energy = Math.min(10, Math.max(1, todayCheckIn.data.energy));
				} else if (todayCheckIn.data.energy_level) {
					// Map energy levels to scores (1-10 scale)
					const energyMap: Record<string, number> = {
						'high': 10, 'energized': 9,
						'good': 8, 'stable': 7,
						'moderate': 6, 'okay': 5,
						'low': 4, 'tired': 3,
						'depleted': 2, 'exhausted': 1
					};
					const level = todayCheckIn.data.energyLevel.toLowerCase();
					energy = energyMap[level] || 6;
				}
			}
		}

		// Calculate reflection streak
		let streakDays = 0;
		const sortedReflections = [...reflections].sort((a, b) =>
			new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
		);

		let checkDate = new Date();
		checkDate.setHours(0, 0, 0, 0);

		while (streakDays < 365) { // Max streak check of 1 year
			const hasReflection = sortedReflections.some(r => {
				const refDate = new Date(r.timestamp);
				refDate.setHours(0, 0, 0, 0);
				return refDate.getTime() === checkDate.getTime();
			});

			if (hasReflection) {
				streakDays++;
				checkDate.setDate(checkDate.getDate() - 1);
			} else {
				break;
			}
		}

		// Calculate weekly progress
		const weekStart = new Date();
		weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
		weekStart.setHours(0, 0, 0, 0);

		const weeklyReflections = reflections.filter(r => {
			const refDate = new Date(r.timestamp);
			return refDate >= weekStart;
		});

		// Goal: At least 1 reflection per day (7 for the week)
		const weeklyGoal = 7;
		const weeklyProgress = Math.min(100, Math.round((weeklyReflections.length / weeklyGoal) * 100));

		return {
			mood,
			energy,
			streakDays,
			weeklyProgress
		};
	});

	// Update local reflections when props change
	useEffect(() => {
		setLocalReflections(reflections);
	}, [reflections]);

	// Fetch real-time data from Supabase
	useEffect(() => {
		const fetchSupabaseData = async () => {
			if (!user) return;

			try {
				// Import the functions we need
				const { fetchReflectionStreakDirect } = await import('../utils/confidenceLevelTracking');

				// Fetch reflection streak from Supabase
				const streak = await fetchReflectionStreakDirect();
				setSupabaseStreak(streak);

				// Fetch weekly progress
				const weeklyProgress = await fetchWeeklyProgressDirect();
				setSupabaseWeeklyProgress(weeklyProgress);
			} catch (error) {
				console.error('Error fetching Supabase data:', error);
			}
		};

		// Helper function to calculate weekly progress from Supabase
		const fetchWeeklyProgressDirect = async () => {
			const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
			const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

			// Get session token
			let sessionStr = localStorage.getItem('sb-kvguxuxanpynwdffpssm-auth-token');
			if (!sessionStr) {
				const keys = Object.keys(localStorage);
				const authKey = keys.find(k => k.includes('supabase.auth.token') || (k.startsWith('sb-') && k.includes('-auth-token')));
				if (authKey) {
					sessionStr = localStorage.getItem(authKey);
				}
			}

			if (!sessionStr) return 0;

			const session = JSON.parse(sessionStr);
			const userId = session.user?.id;

			if (!userId) return 0;

			try {
				// Get start of current week
				const weekStart = new Date();
				weekStart.setDate(weekStart.getDate() - weekStart.getDay());
				weekStart.setHours(0, 0, 0, 0);

				// Fetch reflections from this week
				const params = new URLSearchParams({
					user_id: `eq.${userId}`,
					created_at: `gte.${weekStart.toISOString()}`,
					select: "id"
				});

				const response = await fetch(
					`${supabaseUrl}/rest/v1/reflection_entries?${params}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							"apikey": supabaseKey,
							"Authorization": `Bearer ${session.access_token}`
						}
					}
				);

				if (response.ok) {
					const weeklyReflections = await response.json();
					// Goal is 7 reflections per week (1 per day)
					const progress = Math.min(100, Math.round((weeklyReflections.length / 7) * 100));
					console.log(`✅ Weekly progress: ${weeklyReflections.length}/7 reflections (${progress}%)`);
					return progress;
				}
			} catch (error) {
				console.error('Error calculating weekly progress:', error);
			}

			return 0;
		};

		fetchSupabaseData();
	}, [user, localReflections]); // Refetch when user or reflections change

	// Check for streak milestones and celebrate
	useEffect(() => {
		if (supabaseStreak !== null) {
			const milestones = [7, 14, 30, 60, 90, 180, 365];
			if (milestones.includes(supabaseStreak)) {
				setShowConfetti(true);
				setSuccessMessage(`🎉 ${supabaseStreak} Day Streak!`);
				setSuccessSubMessage("You're building amazing consistency!");
				setShowSuccessToast(true);
			}
		}
	}, [supabaseStreak]);

	// Delete reflection function
	const handleDeleteReflection = async () => {
		if (!confirmDelete.reflectionId) return;

		const reflectionId = confirmDelete.reflectionId;
		console.log("=== DELETE REFLECTION START ===");
		console.log("Attempting to delete reflection with ID:", reflectionId);
		console.log("Type of ID:", typeof reflectionId);
		console.log("Current user:", user?.id);
		setDeletingId(reflectionId);
		setConfirmDelete({ isOpen: false, reflectionId: null });

		try {
			// Use existing supabase instance and get session token directly
			console.log("Using existing auth context...");

			// Import the direct API helper which handles auth better
			const { getSessionToken } = await import("../services/directSupabaseApi");

			console.log("Getting session token...");
			const token = await getSessionToken();

			if (!token) {
				console.error("No token available");
				throw new Error("Authentication required. Please refresh the page.");
			}

			console.log("Token obtained successfully");

			const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
			const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

			// The ID might be a string that looks like a number, try to parse it
			let queryId = reflectionId;

			// Check if it's a numeric string and convert to number if needed
			if (!isNaN(reflectionId) && !isNaN(parseFloat(reflectionId))) {
				queryId = parseInt(reflectionId, 10).toString();
				console.log("Converted ID to:", queryId);
			}

			// First check if the reflection exists using REST API
			console.log("Checking if reflection exists with id:", queryId);

			const checkResponse = await fetch(
				`${SUPABASE_URL}/rest/v1/reflection_entries?id=eq.${queryId}&user_id=eq.${user?.id}`,
				{
					headers: {
						'apikey': SUPABASE_ANON_KEY,
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					}
				}
			);

			if (!checkResponse.ok) {
				console.error("Error checking reflection:", checkResponse.status);
				throw new Error(`Error checking reflection: ${checkResponse.statusText}`);
			}

			const checkData = await checkResponse.json();
			console.log("Check reflection result:", checkData);

			if (!checkData || checkData.length === 0) {
				console.error("No reflection found with ID:", queryId);
				throw new Error("Reflection not found. It may have already been deleted.");
			}

			// Now attempt the delete using REST API
			console.log("Attempting delete with ID:", queryId, "User ID:", user?.id);

			const deleteResponse = await fetch(
				`${SUPABASE_URL}/rest/v1/reflection_entries?id=eq.${queryId}&user_id=eq.${user?.id}`,
				{
					method: 'DELETE',
					headers: {
						'apikey': SUPABASE_ANON_KEY,
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
						'Prefer': 'return=representation'
					}
				}
			);

			console.log("Delete response status:", deleteResponse.status);

			if (!deleteResponse.ok) {
				const errorText = await deleteResponse.text();
				console.error("Delete error response:", errorText);
				throw new Error(`Failed to delete reflection: ${deleteResponse.statusText}`);
			}

			const deleteData = await deleteResponse.json();

			console.log("Delete response data:", deleteData);

			// Check if nothing was deleted (empty array means no rows matched)
			if (!deleteData || deleteData.length === 0) {
				console.error("No rows were deleted - reflection might not exist or user doesn't have permission");
				throw new Error("Unable to delete reflection. It may not exist or you may not have permission.");
			}

			// Remove from local state without reloading
			setLocalReflections((prev) => prev.filter((r) => r.id !== reflectionId));

			// Also update parent state
			if (onReflectionDeleted) {
				onReflectionDeleted(reflectionId);
			}

			console.log("=== DELETE REFLECTION SUCCESS ===");
			console.log("Reflection deleted successfully:", reflectionId, "Deleted data:", deleteData);
		} catch (error) {
			console.error("=== DELETE REFLECTION ERROR ===");
			console.error("Error deleting reflection:", error);
			console.error("Error details:", {
				message: error instanceof Error ? error.message : "Unknown error",
				stack: error instanceof Error ? error.stack : "No stack",
				reflectionId,
				user: user?.id
			});
			alert(error instanceof Error ? error.message : "Failed to delete reflection. Please check the console for details.");
		} finally {
			console.log("=== DELETE REFLECTION CLEANUP ===");
			setDeletingId(null);
		}
	};

	// Convert passed reflections to the format needed for display
	const recentReflections = React.useMemo<RecentReflection[]>(() => {
		console.log(
			"PersonalizedHomepage - Raw reflections received:",
			localReflections,
		);

		if (!localReflections || localReflections.length === 0) {
			console.log("PersonalizedHomepage - No reflections to display");
			return [];
		}

		const filtered = localReflections
			.filter((r) => r.type && r.type !== "burnout_assessment") // Filter out burnout assessments
			.slice(0, 5) // Show only the 5 most recent
			.map((reflection) => ({
				id: reflection.id,
				date: new Date(reflection.timestamp),
				title: getReflectionTitle(reflection.type, reflection.data),
				preview: getReflectionPreview(reflection.data),
				mood: getReflectionMood(reflection.data),
				tags: getReflectionTags(reflection.type),
			}));

		console.log(
			"PersonalizedHomepage - Processed reflections for display:",
			filtered,
		);
		return filtered;
	}, [localReflections]);

	// Load saved burnout assessment on mount and check if it's from today
	useEffect(() => {
		const loadSavedAssessment = () => {
			const saved = localStorage.getItem("dailyBurnoutAssessment");
			if (saved) {
				const data = JSON.parse(saved);
				const savedDate = new Date(data.date);
				const today = new Date();

				// Check if assessment is from today
				if (savedDate.toDateString() === today.toDateString()) {
					setBurnoutScore(data.score);
					setBurnoutLevel(data.level);
					setLastAssessmentDate(data.date);
				} else {
					// DON'T delete old assessment - we need it for 12-hour timer check!
					// Just clear the display state
					setBurnoutScore(null);
					setBurnoutLevel(null);
					setLastAssessmentDate(null);
				}
			}
		};

		loadSavedAssessment();

		// Check every minute if we need to reset (in case user keeps page open overnight)
		const resetInterval = setInterval(loadSavedAssessment, 60000);
		return () => clearInterval(resetInterval);
	}, []);

	// Fetch user's full name from profile
	useEffect(() => {
		const fetchUserName = async () => {
			if (!user) {
				setUserFullName("User");
				return;
			}

			// First check user_metadata for full_name (same as UserDropdown)
			if (user?.user_metadata?.full_name && user.user_metadata.full_name.trim()) {
				// Use the full name from metadata (matching UserDropdown display)
				setUserFullName(user.user_metadata.full_name);
				return;
			}

			// If no metadata, try to fetch from user_profiles table
			if (user?.id) {
				try {
					const { data, error } = await supabase
						.from('user_profiles')
						.select('full_name')
						.eq('id', user.id)
						.single();

					if (data?.full_name && data.full_name.trim()) {
						setUserFullName(data.full_name);
						return;
					}
				} catch (error) {
					console.log('Could not fetch user profile');
				}
			}

			// Last fallback: use first part of email
			const emailName = user?.email?.split("@")[0] || "User";
			// Capitalize first letter
			const capitalizedName = emailName.charAt(0).toUpperCase() + emailName.slice(1).toLowerCase();
			setUserFullName(capitalizedName);
		};

		fetchUserName();
	}, [user]);

	useEffect(() => {
		const updateGreeting = () => {
			const hour = new Date().getHours();
			const name = userFullName;

			if (hour < 12) {
				setGreeting(`Good morning, ${name}`);
			} else if (hour < 17) {
				setGreeting(`Good afternoon, ${name}`);
			} else {
				setGreeting(`Good evening, ${name}`);
			}

			const today = new Date();
			const options: Intl.DateTimeFormatOptions = {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			};
			setDateString(today.toLocaleDateString("en-US", options));
		};

		updateGreeting();
		const interval = setInterval(updateGreeting, 60000);
		return () => clearInterval(interval);
	}, [userFullName]);

	// Check and update 24-hour timer for burnout assessment
	useEffect(() => {
		const checkTimer = () => {
			const saved = localStorage.getItem("dailyBurnoutAssessment");
			console.log("🕐 Checking burnout timer, localStorage data:", saved);

			if (!saved) {
				console.log("✅ No saved assessment, allowing new assessment");
				setCanTakeAssessment(true);
				setTimeUntilNext("");
				return;
			}

			const data = JSON.parse(saved);
			if (!data.timestamp) {
				// Old format without timestamp, allow assessment
				console.log("⚠️ Old format without timestamp, allowing assessment");
				setCanTakeAssessment(true);
				setTimeUntilNext("");
				return;
			}

			const lastTime = new Date(data.timestamp);
			const now = new Date();
			const hoursSince = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);
			console.log(`⏱️ Hours since last assessment: ${hoursSince.toFixed(2)}`);

			if (hoursSince >= 24) {
				console.log("✅ 24+ hours passed, allowing new assessment");
				setCanTakeAssessment(true);
				setTimeUntilNext("");
			} else {
				const hoursRemaining = 24 - hoursSince;
				const hours = Math.floor(hoursRemaining);
				const minutes = Math.round((hoursRemaining - hours) * 60);

				// Fix the 60 minutes issue
				let displayHours = hours;
				let displayMinutes = minutes;
				if (displayMinutes >= 60) {
					displayHours += 1;
					displayMinutes = 0;
				}

				let timeText = "";
				if (displayHours > 0 && displayMinutes > 0) {
					timeText = `${displayHours}h ${displayMinutes}m`;
				} else if (displayHours > 0) {
					timeText = `${displayHours}h`;
				} else {
					timeText = `${displayMinutes}m`;
				}

				console.log(`🔒 Assessment locked for ${timeText}`);
				setCanTakeAssessment(false);
				setTimeUntilNext(timeText);
			}
		};

		checkTimer();
		const interval = setInterval(checkTimer, 60000); // Update every minute
		return () => clearInterval(interval);
	}, []); // Run only on mount - always check localStorage

	const getMoodIcon = (mood: number) => {
		if (mood >= 4) return <Sun className="w-4 h-4 text-yellow-500" />;
		if (mood >= 3) return <Cloud className="w-4 h-4 text-blue-400" />;
		return <Moon className="w-4 h-4 text-indigo-400" />;
	};

	const getMoodColor = (mood: string) => {
		const colors = {
			excellent: "#10B981",
			good: "#6EE7B7",
			neutral: "#FCD34D",
			challenging: "#FB923C",
			difficult: "#F87171",
		};
		return colors[mood as keyof typeof colors] || colors.neutral;
	};

	const formatRelativeTime = (date: Date) => {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) {
			const hours = Math.floor(diff / (1000 * 60 * 60));
			if (hours === 0) {
				const minutes = Math.floor(diff / (1000 * 60));
				if (minutes < 5) return "Just now";
				return `${minutes} minutes ago`;
			}
			if (hours === 1) return "1 hour ago";
			return `${hours} hours ago`;
		}
		if (days === 1) return "Yesterday";
		if (days < 7) return `${days} days ago`;

		// Format as readable date for older reflections
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	return (
		<div
			className="min-h-screen"
			style={{
				backgroundColor: "#F8FAFB",
			}}
		>
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header Section */}
				<div className="rounded-xl p-8 mb-8" style={{
					backgroundColor: "white",
					border: "1px solid #E5E9EB",
					boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
				}}>
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
						<div className="flex-1">
							<h1 className="text-3xl font-semibold mb-2" style={{
								color: "#1A2B3C",
								letterSpacing: "-0.02em"
							}}>
								{greeting}
							</h1>
							<p className="text-base" style={{
								color: "#64748B"
							}}>{dateString}</p>
						</div>

						{/* Trust Badges */}
						<div className="flex flex-wrap gap-2">
							<TrustBadge variant="research" size="sm" />
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Wellness Stats */}
					<div className="lg:col-span-1 space-y-6">
						{/* Wellness Stats Card - Wellness Zone */}
						<div className="rounded-xl p-7 transition-all" style={{
							backgroundColor: "white",
							border: "2px solid #D1D5DB",
							boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
						}}>
							<h2 className="text-xl font-semibold mb-6 flex items-center gap-2.5" style={{
								color: "#111827",
								letterSpacing: "-0.01em"
							}}>
								<Heart className="w-5 h-5" style={{ color: "#4B5563" }} />
								Your Wellness
							</h2>

							<div className="space-y-5">
								{/* Mood */}
								<div>
									<div className="flex items-center justify-between mb-3">
										<span className="text-sm font-medium" style={{ color: "#374151" }}>Today's Mood</span>
										{wellnessStats.mood > 0 && getMoodIcon(wellnessStats.mood)}
									</div>
									<div className="flex items-center gap-3">
										<div className="flex-1 bg-white rounded-full h-2.5 overflow-hidden" style={{
											boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05)"
										}}>
											<div
												className="h-2.5 rounded-full transition-all duration-1000 ease-out"
												style={{
													backgroundColor: "#B8C9B6",
													width: `${(wellnessStats.mood / 10) * 100}%`,
												}}
											/>
										</div>
										<span className="text-sm font-semibold min-w-[2.5rem] text-right" style={{ color: "#111827" }}>
											{wellnessStats.mood > 0 ? `${wellnessStats.mood}/10` : '—'}
										</span>
									</div>
								</div>

								{/* Energy */}
								<div>
									<div className="flex items-center justify-between mb-3">
										<span className="text-sm font-medium" style={{ color: "#374151" }}>Energy Level</span>
										{wellnessStats.energy > 0 && <Zap className="w-4 h-4" style={{ color: '#6B8268' }} />}
									</div>
									<div className="flex items-center gap-3">
										<div className="flex-1 bg-white rounded-full h-2.5 overflow-hidden" style={{
											boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05)"
										}}>
											<div
												className="h-2.5 rounded-full transition-all duration-1000 ease-out"
												style={{
													backgroundColor: "#6B8268",
													width: `${(wellnessStats.energy / 10) * 100}%`,
												}}
											/>
										</div>
										<span className="text-sm font-semibold min-w-[2.5rem] text-right" style={{ color: "#111827" }}>
											{wellnessStats.energy > 0 ? `${wellnessStats.energy}/10` : '—'}
										</span>
									</div>
								</div>

								{/* Streak */}
								<div className="pt-5 mt-5" style={{
									borderTop: "1px solid #D1D5DB"
								}}>
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium mb-1" style={{ color: "#374151" }}>Reflection Streak</p>
											<p className="text-3xl font-bold" style={{ color: "#111827", letterSpacing: "-0.02em" }}>
												{supabaseStreak !== null ? supabaseStreak : wellnessStats.streakDays} <span className="text-lg font-semibold" style={{ color: "#4B5563" }}>days</span>
											</p>
										</div>
										<div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
											backgroundColor: "#F3F4F6"
										}}>
											<Target className="w-6 h-6" style={{ color: "#6B8268" }} />
										</div>
									</div>
								</div>

								{/* Weekly Progress */}
								<div className="pt-5" style={{
									borderTop: "1px solid #D1D5DB"
								}}>
									<div className="flex items-center justify-between mb-3">
										<span className="text-sm font-medium" style={{ color: "#374151" }}>Weekly Goal</span>
										<span className="text-sm font-semibold" style={{ color: "#111827" }}>
											{supabaseWeeklyProgress !== null ? supabaseWeeklyProgress : wellnessStats.weeklyProgress}%
										</span>
									</div>
									<div className="bg-white rounded-full h-2.5 overflow-hidden" style={{
										boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05)"
									}}>
										<div
											className="h-2.5 rounded-full transition-all duration-1000 ease-out"
											style={{
												backgroundColor: "#6B8268",
												width: `${supabaseWeeklyProgress !== null ? supabaseWeeklyProgress : wellnessStats.weeklyProgress}%`,
											}}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Daily Burnout Check - Serious Zone */}
						<div className="rounded-xl p-7 transition-all" style={{
							backgroundColor: "white",
							border: "2px solid #D1D5DB",
							boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
						}}>
							<h2 className="text-xl font-semibold mb-2 flex items-center gap-2.5" style={{
								color: "#111827",
								letterSpacing: "-0.01em"
							}}>
								<Gauge className="w-5 h-5" style={{ color: "#4B5563" }} />
								Daily Burnout Check
							</h2>
							<p className="text-xs mb-5" style={{
								color: "#4B5563"
							}}>
								📊 Tracks to: Growth Insights → Daily Burnout Tracker
							</p>

							{burnoutScore !== null ? (
								<div className="space-y-3">
									<div className="text-center py-2">
										<div className="flex items-center justify-center gap-2 mb-2">
											<CheckCircle className="w-6 h-6 text-green-500" />
											<div className="text-lg font-medium text-gray-700">
												Assessment Complete
											</div>
										</div>
										<div className="text-sm text-gray-500">
											View your results in Growth Insights
										</div>
									</div>
									<button
										onClick={() => canTakeAssessment && setShowBurnoutGauge(true)}
										disabled={!canTakeAssessment}
										className="w-full px-3 py-2 text-sm rounded-lg font-medium transition-all flex items-center justify-center gap-2"
										style={{
											background: canTakeAssessment
												? "linear-gradient(135deg, rgb(45, 95, 63), rgb(91, 147, 120))"
												: "#9CA3AF",
											boxShadow: canTakeAssessment
												? "rgba(107, 139, 96, 0.3) 0px 2px 8px"
												: "none",
											color: "white",
											cursor: canTakeAssessment ? "pointer" : "not-allowed",
											opacity: canTakeAssessment ? 1 : 0.7,
										}}
									>
										{canTakeAssessment ? (
											<>
												<Gauge className="w-4 h-4" />
												Retake Assessment
											</>
										) : (
											<>
												<Clock className="w-4 h-4" />
												Available in {timeUntilNext}
											</>
										)}
									</button>
									<p className="text-xs text-gray-500 mt-3 leading-relaxed">
										We ask for one check-in per day to get your full day's average state. This gives us a more accurate baseline and helps prevent anxiety from temporary dips. Best time: after work when you can reflect on your whole day.
									</p>
								</div>
							) : (
								<div>
									<p className="text-sm text-gray-500 mb-4">
										Quick 5-question check-in to monitor your burnout risk
									</p>
									<button
										onClick={() => canTakeAssessment && setShowBurnoutGauge(true)}
										disabled={!canTakeAssessment}
										className="w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
										style={{
											background: canTakeAssessment
												? "linear-gradient(135deg, rgb(45, 95, 63), rgb(91, 147, 120))"
												: "#9CA3AF",
											boxShadow: canTakeAssessment
												? "rgba(107, 139, 96, 0.3) 0px 2px 8px"
												: "none",
											color: "white",
											cursor: canTakeAssessment ? "pointer" : "not-allowed",
											opacity: canTakeAssessment ? 1 : 0.7,
										}}
									>
										{canTakeAssessment ? (
											<>
												<Gauge className="w-4 h-4" />
												Take Assessment
											</>
										) : (
											<>
												<Clock className="w-4 h-4" />
												Available in {timeUntilNext}
											</>
										)}
									</button>
									<p className="text-xs text-gray-500 mt-3 leading-relaxed">
										We ask for one check-in per day to get your full day's average state. This gives us a more accurate baseline and helps prevent anxiety from temporary dips. Best time: after work when you can reflect on your whole day.
									</p>
								</div>
							)}
						</div>

						{/* Start Reflection CTA - Action Zone */}
						<div className="rounded-xl p-7 transition-all" style={{
							backgroundColor: "#F9FAFB",
							border: "2px solid #D1D5DB",
							boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
						}}>
							<h3 className="font-semibold mb-2 text-lg" style={{
								color: "#111827",
								letterSpacing: "-0.01em"
							}}>
								Ready to reflect?
							</h3>
							<p className="text-sm mb-5" style={{
								color: "#4B5563"
							}}>
								Take 5 minutes to check in with yourself
							</p>
							<button
								onClick={() => onNavigate?.("reflection")}
								className="w-full px-5 py-3.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:opacity-90"
								style={{
									backgroundColor: "#6B8268",
									color: "white",
									boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
								}}
								title="Go to Reflection Studio to create a new reflection"
							>
								<BookOpen className="w-4 h-4" />
								Start New Reflection
							</button>
						</div>
					</div>

					{/* Right Column - Recent Reflections */}
					<div className="lg:col-span-2">
						<div className="rounded-xl transition-all" style={{
							backgroundColor: "white",
							border: "2px solid #D1D5DB",
							boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
						}}>
							<div className="px-8 py-6" style={{
								borderBottom: "2px solid #E5E7EB"
							}}>
								<div className="flex items-center justify-between">
									<h2 className="text-xl font-semibold" style={{
										color: "#111827",
										letterSpacing: "-0.01em"
									}}>
										Recent Reflections
									</h2>
									<button
										onClick={() => {
											if (
												recentReflections.length > 0 ||
												localReflections.length > 0
											) {
												setShowAllReflections(true);
											}
										}}
										disabled={recentReflections.length === 0}
										className={`px-4 py-2 text-sm font-semibold flex items-center gap-1.5 rounded-lg transition-all ${
											recentReflections.length > 0
												? "cursor-pointer hover:opacity-90"
												: "cursor-not-allowed opacity-40"
										}`}
										style={{
											backgroundColor:
												recentReflections.length > 0
													? "#6B8268"
													: "#E5E7EB",
											color: recentReflections.length > 0 ? "white" : "#6B7280",
											boxShadow:
												recentReflections.length > 0
													? "0 1px 3px rgba(0, 0, 0, 0.08)"
													: "none"
										}}
										title={
											recentReflections.length === 0
												? "No reflections to view yet"
												: "View all reflections"
										}
									>
										View all
										<ChevronRight className="w-4 h-4" />
									</button>
								</div>
							</div>

							<div className="p-6 space-y-4">
								{recentReflections.length > 0 ? (
									recentReflections.map((reflection, index) => (
										<div
											key={reflection.id}
											className="p-5 rounded-lg hover:bg-gray-50/30 transition-all"
											style={{
												border: "2px solid #D1D5DB",
												backgroundColor: "white"
											}}
										>
											<div className="flex items-start justify-between mb-3">
												<div className="flex items-start gap-4 flex-1">
													<div
														className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
														style={{
															backgroundColor: getMoodColor(reflection.mood),
															boxShadow: `0 0 0 3px ${getMoodColor(reflection.mood)}20`
														}}
													/>
													<div className="flex-1 min-w-0">
														<h3 className="font-semibold text-base mb-2" style={{
															color: "#111827",
															letterSpacing: "-0.01em"
														}}>
															{reflection.title}
														</h3>
														<p className="text-sm mb-3" style={{
															color: "#4B5563",
															lineHeight: "1.6"
														}}>
															{reflection.preview}
														</p>
														<div className="flex flex-wrap gap-2 mb-3">
															{reflection.tags
																.filter((tag) => {
																	const isTimestamp = /^\d{4}-\d{2}-\d{2}T/.test(tag);
																	if (isTimestamp) {
																		console.warn("Found timestamp in tags:", tag);
																		return false;
																	}
																	return true;
																})
																.map((tag) => (
																	<span
																		key={tag}
																		className="px-2.5 py-1 text-xs font-medium rounded-lg"
																		style={{
																			backgroundColor: "#F3F4F6",
																			color: "#374151",
																			border: "1px solid #D1D5DB"
																		}}
																	>
																		{tag}
																	</span>
																))}
														</div>
														<p className="text-xs flex items-center gap-1.5" style={{
															color: "#6B7280"
														}}>
															<Clock className="w-3.5 h-3.5" />
															{formatRelativeTime(reflection.date)}
														</p>
													</div>
												</div>
												<div className="flex gap-1.5 ml-4">
													<button
														onClick={() => {
															const fullReflection = localReflections.find(
																(r) => r.id === reflection.id,
															);
															if (fullReflection) {
																setSelectedReflection(fullReflection);
															}
														}}
														className="p-1.5 rounded-md transition-all hover:opacity-80"
														style={{
															backgroundColor: "#6B8268",
															color: "white",
															boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
														}}
														title="View reflection"
													>
														<Eye className="w-3.5 h-3.5" />
													</button>
													<button
														onClick={() =>
															setConfirmDelete({
																isOpen: true,
																reflectionId: reflection.id,
															})
														}
														disabled={deletingId === reflection.id}
														className={`p-1.5 rounded-md transition-all ${
															deletingId === reflection.id
																? "opacity-50 cursor-not-allowed"
																: "hover:opacity-80"
														}`}
														style={{
															backgroundColor: "#DC2626",
															color: "white",
															boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
														}}
														title="Delete reflection"
													>
														<Trash2 className="w-3.5 h-3.5" />
													</button>
												</div>
											</div>
										</div>
									))
								) : (
									<div className="p-12 text-center">
										<div className="mb-8 flex justify-center">
											<EmptyReflectionIllustration size={160} />
										</div>
										<h3 className="font-semibold mb-3 text-xl" style={{
											color: "#111827",
											letterSpacing: "-0.01em"
										}}>
											Your reflection journey starts here
										</h3>
										<p className="text-base mb-8 max-w-md mx-auto" style={{
											color: "#4B5563",
											lineHeight: "1.6"
										}}>
											Take a moment to check in with yourself. Every reflection is a step toward greater self-awareness and well-being.
										</p>
										<button
											onClick={() => onNavigate?.("reflection")}
											className="px-8 py-4 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
											style={{
												backgroundColor: "#6B8268",
												color: "white",
												boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
											}}
										>
											Create Your First Reflection
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* Burnout Gauge Modal */}
			{showBurnoutGauge && (
				<DailyBurnoutGaugeAccessible
					onComplete={(results) => {
						const scorePercentage = Math.round((results.totalScore / 25) * 100);
						const today = new Date().toISOString();
						const now = new Date();

						// Save to localStorage with today's date AND timestamp
						localStorage.setItem(
							"dailyBurnoutAssessment",
							JSON.stringify({
								score: scorePercentage,
								level: results.riskLevel,
								date: today,
								totalScore: results.totalScore,
								timestamp: now.toISOString(), // Add timestamp for 12-hour check
							}),
						);

						setBurnoutScore(scorePercentage);
						setBurnoutLevel(results.riskLevel);
						setLastAssessmentDate(today);
						setLastAssessmentTime(now); // Set the time assessment was taken
						setCanTakeAssessment(false); // Disable button
						setShowBurnoutGauge(false);
					}}
					onClose={() => setShowBurnoutGauge(false)}
				/>
			)}

			{/* All Reflections View Modal */}
			{showAllReflections && user && (
				<AllReflectionsView
					userId={user.id}
					onClose={() => {
						setShowAllReflections(false);
						// No need to reload - state updates automatically
					}}
					initialReflections={localReflections as any}
					onReflectionDeleted={(reflectionId) => {
						// Update local state in PersonalizedHomepage
						setLocalReflections((prev) => prev.filter((r) => r.id !== reflectionId));

						// Also update parent state
						if (onReflectionDeleted) {
							onReflectionDeleted(reflectionId);
						}

						console.log("Reflection deleted from AllReflectionsView, updated PersonalizedHomepage");
					}}
				/>
			)}

			{/* Reflection Detail View Modal */}
			{selectedReflection && (
				<ReflectionDetailView
					reflection={selectedReflection}
					onClose={() => setSelectedReflection(null)}
				/>
			)}

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				isOpen={confirmDelete.isOpen}
				title="Delete Reflection"
				message="Are you sure you want to delete this reflection? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				onConfirm={handleDeleteReflection}
				onCancel={() => setConfirmDelete({ isOpen: false, reflectionId: null })}
				isDanger={true}
			/>

			{/* Confetti Celebration */}
			<ConfettiCelebration
				trigger={showConfetti}
				onComplete={() => setShowConfetti(false)}
			/>

			{/* Success Toast */}
			<SuccessToast
				message={successMessage}
				subMessage={successSubMessage}
				show={showSuccessToast}
				onClose={() => setShowSuccessToast(false)}
			/>
		</div>
	);
};

// Helper functions for converting reflection data
function getReflectionTitle(type: string, data?: any): string {
	// Use centralized function for consistent naming - pass data to infer type if needed
	return getDisplayName(type, data);
}

function getReflectionPreview(data: any): string {
	// Generate a preview based on the data
	if (data?.notes && typeof data.notes === "string") {
		return (
			data.notes.substring(0, 100) + (data.notes.length > 100 ? "..." : "")
		);
	}
	if (data?.reflection && typeof data.reflection === "string") {
		return (
			data.reflection.substring(0, 100) +
			(data.reflection.length > 100 ? "..." : "")
		);
	}
	if (data?.thoughts && typeof data.thoughts === "string") {
		return (
			data.thoughts.substring(0, 100) +
			(data.thoughts.length > 100 ? "..." : "")
		);
	}
	if (data?.summary && typeof data.summary === "string") {
		return (
			data.summary.substring(0, 100) + (data.summary.length > 100 ? "..." : "")
		);
	}
	// Try to extract any text field from the data
	if (data && typeof data === "object") {
		const textFields = Object.values(data).find((v) => {
			// Check if it's a string and not a timestamp
			if (typeof v === "string" && v.length > 0) {
				// Skip if it looks like an ISO timestamp
				const isTimestamp = /^\d{4}-\d{2}-\d{2}T/.test(v);
				return !isTimestamp;
			}
			return false;
		});
		if (textFields && typeof textFields === "string") {
			return (
				textFields.substring(0, 100) + (textFields.length > 100 ? "..." : "")
			);
		}
	}
	return "Reflection completed";
}

function getReflectionMood(
	data: any,
): "excellent" | "good" | "neutral" | "challenging" | "difficult" {
	// Extract mood from data
	if (data.mood) {
		const moodValue =
			typeof data.mood === "number" ? data.mood : parseInt(data.mood);
		if (moodValue >= 8) return "excellent";
		if (moodValue >= 6) return "good";
		if (moodValue >= 4) return "neutral";
		if (moodValue >= 2) return "challenging";
		return "difficult";
	}
	if (data.energyLevel) {
		const energy =
			typeof data.energyLevel === "number"
				? data.energyLevel
				: parseInt(data.energyLevel);
		if (energy >= 8) return "excellent";
		if (energy >= 6) return "good";
		if (energy >= 4) return "neutral";
		if (energy >= 2) return "challenging";
		return "difficult";
	}
	return "neutral";
}

function getReflectionTags(type: string): string[] {
	const tagMap: Record<string, string[]> = {
		wellness_checkin: ["wellness", "check-in"],
		wellness_check_in: ["wellness", "check-in"],
		post_assignment: ["assignment", "debrief"],
		post_assignment_debrief: ["assignment", "debrief"],
		pre_assignment: ["assignment", "preparation"],
		pre_assignment_prep: ["assignment", "preparation"],
		teaming_prep: ["team", "preparation"],
		teaming_prep_enhanced: ["team", "interpreting"],
		teaming_reflection: ["team", "reflection"],
		teaming_reflection_enhanced: ["team", "reflection"],
		mentoring_prep: ["mentoring", "preparation"],
		mentoring_reflection: ["mentoring", "reflection"],
		ethics_meaning: ["ethics", "meaning"],
		in_session_self: ["in-session", "self-check"],
		in_session_team: ["in-session", "team"],
		role_space: ["role", "space"],
		direct_communication: ["communication", "reflection"],
		direct_communication_reflection: ["communication", "reflection"],
		burnout_assessment: ["wellness", "assessment"],
		compass_check: ["values", "alignment"],
		breathing_practice: ["breathing", "mindfulness"],
		body_awareness: ["body", "awareness"],
	};
	return tagMap[type] || ["reflection"];
}

export default PersonalizedHomepage;
