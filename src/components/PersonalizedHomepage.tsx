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

		// Get the MOST RECENT wellness check-in for mood and energy
		// Look for wellness_checkin (the actual type saved by WellnessCheckInAccessible)
		// Sort by timestamp descending to get the most recent one
		const wellnessCheckIns = reflections
			.filter(r => r.type === "wellness_checkin" || r.type === "Wellness Check-in")
			.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

		// Use the most recent wellness check-in (index 0 after sorting)
		const todayCheckIn = wellnessCheckIns.length > 0 ? wellnessCheckIns[0] : null;

		// Extract mood and energy from today's check-in or use 0 for new users
		let mood = 0; // Default 0 for new users - no check-ins yet
		let energy = 0; // Default 0 for new users - no check-ins yet

		if (todayCheckIn?.data) {
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
		}

		// Extract energy from data (scale 1-10)
		if (todayCheckIn?.data) {
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
					// Clear old assessment if it's from a previous day
					localStorage.removeItem("dailyBurnoutAssessment");
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
				backgroundColor: "var(--color-surface)",
			}}
		>
			<main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				{/* Header Section */}
				<div className="rounded-2xl shadow-clean p-6 mb-6" style={{
					backgroundColor: "var(--color-card)",
					border: "1px solid var(--color-slate-200)"
				}}>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h1 className="text-2xl font-medium text-gray-800 mb-1">
								{greeting}
							</h1>
							<p className="text-gray-500">{dateString}</p>
						</div>

						{/* Tip of the Day */}
					</div>

					{/* Trust Badges */}
					<div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-end">
						<TrustBadge variant="research" size="sm" />
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Wellness Stats */}
					<div className="lg:col-span-1 space-y-6">
						{/* Wellness Stats Card - Wellness Zone */}
						<div className="rounded-2xl shadow-clean p-6 transition-all hover:shadow-clean-md hover:-translate-y-0.5" style={{
							backgroundColor: "var(--color-wellness-bg)",
							border: "1px solid var(--color-wellness-border)"
						}}>
							<h2 className="text-lg font-semibold mb-4 flex items-center gap-2 pb-3" style={{
								color: "var(--color-green-700)",
								borderBottom: "1px solid var(--color-green-200)"
							}}>
								<Heart className="w-5 h-5" style={{ color: "var(--color-green-600)" }} />
								Your Wellness
							</h2>

							<div className="space-y-4">
								{/* Mood */}
								<div>
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm text-gray-500">Today's Mood</span>
										{wellnessStats.mood > 0 && getMoodIcon(wellnessStats.mood)}
									</div>
									<div className="flex items-center gap-2">
										<div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
											<div
												className="h-2 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-400 transition-all duration-1000 ease-out animate-[slideIn_0.8s_ease-out]"
												style={{
													width: `${(wellnessStats.mood / 10) * 100}%`,
													animation: 'slideIn 0.8s ease-out'
												}}
											/>
										</div>
										<span className="text-sm font-medium text-gray-600">
											{wellnessStats.mood > 0 ? `${wellnessStats.mood}/10` : '—'}
										</span>
									</div>
								</div>

								{/* Energy */}
								<div>
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm text-gray-500">Energy Level</span>
										{wellnessStats.energy > 0 && <Zap className="w-4 h-4" style={{ color: 'var(--color-green-500)' }} />}
									</div>
									<div className="flex items-center gap-2">
										<div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
											<div
												className="h-2 rounded-full transition-all duration-1000 ease-out"
												style={{
													background: 'linear-gradient(to right, var(--color-green-500), var(--color-green-400))',
													width: `${(wellnessStats.energy / 10) * 100}%`,
													animation: 'slideIn 1s ease-out'
												}}
											/>
										</div>
										<span className="text-sm font-medium text-gray-600">
											{wellnessStats.energy > 0 ? `${wellnessStats.energy}/10` : '—'}
										</span>
									</div>
								</div>

								{/* Streak */}
								<div className="pt-3 border-t border-sage-50">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-gray-500">Reflection Streak</p>
											<p className="text-2xl font-bold text-gray-800">
												{supabaseStreak !== null ? supabaseStreak : wellnessStats.streakDays} days
											</p>
										</div>
										<Target className="w-8 h-8 text-amber-400" />
									</div>
								</div>

								{/* Weekly Progress */}
								<div className="pt-3 border-t border-sage-50">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm text-gray-500">Weekly Goal</span>
										<span className="text-sm font-medium text-gray-700">
											{supabaseWeeklyProgress !== null ? supabaseWeeklyProgress : wellnessStats.weeklyProgress}%
										</span>
									</div>
									<div className="bg-gray-100 rounded-full h-2 overflow-hidden">
										<div
											className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 transition-all duration-1000 ease-out"
											style={{
												width: `${supabaseWeeklyProgress !== null ? supabaseWeeklyProgress : wellnessStats.weeklyProgress}%`,
												animation: 'slideIn 1.2s ease-out'
											}}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Daily Burnout Check - Serious Zone */}
						<div className="rounded-2xl shadow-clean p-6 transition-all hover:shadow-clean-md hover:-translate-y-0.5" style={{
							backgroundColor: "var(--color-serious-bg)",
							border: "1px solid var(--color-serious-border)"
						}}>
							<h2 className="text-lg font-semibold mb-4 flex items-center gap-2 pb-3" style={{
								color: "var(--color-slate-700)",
								borderBottom: "1px solid var(--color-slate-200)"
							}}>
								<Gauge className="w-5 h-5" style={{ color: "var(--color-slate-600)" }} />
								Daily Burnout Check
							</h2>

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
										onClick={() => setShowBurnoutGauge(true)}
										className="w-full px-3 py-2 text-sm text-white rounded-lg font-medium transition-all hover:opacity-80"
										style={{
											background: "linear-gradient(135deg, rgb(45, 95, 63), rgb(91, 147, 120))",
											boxShadow: "rgba(107, 139, 96, 0.3) 0px 2px 8px",
										}}
									>
										Retake Assessment
									</button>
								</div>
							) : (
								<div>
									<p className="text-sm text-gray-500 mb-4">
										Quick 5-question check-in to monitor your burnout risk
									</p>
									<button
										onClick={() => setShowBurnoutGauge(true)}
										className="w-full px-4 py-2.5 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 hover:opacity-80"
										style={{
											background: "linear-gradient(135deg, rgb(45, 95, 63), rgb(91, 147, 120))",
											boxShadow: "rgba(107, 139, 96, 0.3) 0px 2px 8px",
										}}
									>
										<Gauge className="w-4 h-4" />
										Take Assessment
									</button>
								</div>
							)}
						</div>

						{/* Start Reflection CTA - Action Zone */}
						<div className="rounded-2xl p-6 shadow-clean transition-all hover:shadow-clean-md hover:-translate-y-0.5" style={{
							backgroundColor: "var(--color-action-bg)",
							border: "1px solid var(--color-action-border)"
						}}>
							<h3 className="font-semibold mb-2" style={{
								color: "var(--color-green-700)"
							}}>
								Ready to reflect?
							</h3>
							<p className="text-sm mb-4" style={{
								color: "var(--color-slate-600)"
							}}>
								Take 5 minutes to check in with yourself
							</p>
							<button
								onClick={() => onNavigate?.("reflection")}
								className="w-full px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.01]"
								style={{
									background: "linear-gradient(135deg, rgb(45, 95, 63), rgb(91, 147, 120))",
									boxShadow: "rgba(107, 139, 96, 0.3) 0px 2px 8px"
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
						<div className="rounded-2xl shadow-clean transition-all hover:shadow-clean-md hover:-translate-y-0.5" style={{
							backgroundColor: "var(--color-card)",
							border: "1px solid var(--color-slate-200)"
						}}>
							<div className="px-6 py-4" style={{
								borderBottom: "1px solid var(--color-slate-200)"
							}}>
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-semibold" style={{
										color: "var(--color-slate-700)"
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
										className={`px-3 py-1.5 text-sm font-semibold flex items-center gap-1 rounded-lg transition-all hover:opacity-90 ${
											recentReflections.length > 0
												? "text-white cursor-pointer"
												: "text-gray-400 cursor-not-allowed opacity-50"
										}`}
										style={{
											background:
												recentReflections.length > 0
													? "linear-gradient(135deg, rgb(45, 95, 63), rgb(91, 147, 120))"
													: "#e5e7eb",
											boxShadow:
												recentReflections.length > 0
													? "rgba(107, 139, 96, 0.3) 0px 2px 8px"
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

							<div className="divide-y divide-gray-100">
								{recentReflections.length > 0 ? (
									recentReflections.map((reflection) => (
										<div
											key={reflection.id}
											className="p-5 hover:bg-gray-50 transition-colors"
										>
											<div className="flex items-start justify-between mb-2">
												<div className="flex items-start gap-3">
													<div
														className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
														style={{
															backgroundColor: getMoodColor(reflection.mood),
														}}
													/>
													<div className="flex-1">
														<h3 className="font-medium text-gray-800 mb-1">
															{reflection.title}
														</h3>
														<p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
															<Clock className="w-3 h-3" />
															{formatRelativeTime(reflection.date)}
														</p>
													</div>
												</div>
												<div className="flex gap-2">
													<button
														onClick={() => {
															// Find the full reflection data from localReflections
															const fullReflection = localReflections.find(
																(r) => r.id === reflection.id,
															);
															if (fullReflection) {
																setSelectedReflection(fullReflection);
															}
														}}
														className="p-1.5 text-white rounded-lg transition-all hover:opacity-80"
														style={{
															background: "linear-gradient(135deg, rgb(45, 95, 63), rgb(91, 147, 120))",
															boxShadow: "rgba(107, 139, 96, 0.3) 0px 2px 8px",
														}}
														title="View reflection"
													>
														<Eye className="w-4 h-4" />
													</button>
													<button
														onClick={() =>
															setConfirmDelete({
																isOpen: true,
																reflectionId: reflection.id,
															})
														}
														disabled={deletingId === reflection.id}
														className={`p-1.5 text-white rounded-lg transition-all hover:opacity-80 ${
															deletingId === reflection.id
																? "opacity-50 cursor-not-allowed"
																: ""
														}`}
														style={{
															background:
																"linear-gradient(135deg, #ef5350, #f44336)",
														}}
														title="Delete reflection"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</div>

											<p className="text-sm text-gray-500 mb-3 ml-5">
												{reflection.preview}
											</p>

											<div className="flex flex-wrap gap-1.5 ml-5">
												{reflection.tags
													.filter((tag) => {
														// Filter out any timestamps that might have snuck in
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
															className="px-2 py-1 text-xs rounded-full text-white"
															style={{
																background:
																	"linear-gradient(135deg, #43a047, #66bb6a)",
															}}
														>
															{tag}
														</span>
													))}
											</div>
										</div>
									))
								) : (
									<div className="p-10 text-center">
										<div className="mb-6 flex justify-center">
											<EmptyReflectionIllustration size={140} />
										</div>
										<h3 className="font-semibold mb-2 text-lg" style={{
											color: "var(--color-slate-700)"
										}}>
											Your reflection journey starts here
										</h3>
										<p className="text-sm mb-6 max-w-md mx-auto" style={{
											color: "var(--color-slate-600)"
										}}>
											Take a moment to check in with yourself. Every reflection is a step toward greater self-awareness and well-being.
										</p>
										<button
											onClick={() => onNavigate?.("reflection")}
											className="px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 hover:scale-[1.01]"
											style={{
												background: "linear-gradient(135deg, rgb(45, 95, 63), rgb(91, 147, 120))",
												boxShadow: "rgba(107, 139, 96, 0.3) 0px 2px 8px"
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

						// Save to localStorage with today's date
						localStorage.setItem(
							"dailyBurnoutAssessment",
							JSON.stringify({
								score: scorePercentage,
								level: results.riskLevel,
								date: today,
								totalScore: results.totalScore,
							}),
						);

						setBurnoutScore(scorePercentage);
						setBurnoutLevel(results.riskLevel);
						setLastAssessmentDate(today);
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
