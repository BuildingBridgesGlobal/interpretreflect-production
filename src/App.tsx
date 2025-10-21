import {
	Activity,
	AlertTriangle,
	BarChart3,
	BookOpen,
	Brain,
	CheckCircle,
	ChevronDown,
	Clock,
	Compass,
	Download,
	FileText,
	Globe,
	Heart,
	Lightbulb,
	MessageCircle,
	MessageSquare,
	Palette,
	Scale,
	Shield,
	Sparkles,
	Star,
	Target,
	TrendingUp,
	Triangle,
	Users,
	X,
} from "lucide-react";
import React, { lazy, useEffect, useRef, useState, Suspense, startTransition } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import ResetPassword from "./pages/ResetPassword";
import { AffirmationReflectionStudio } from "./components/AffirmationReflectionStudio";
import AffirmationStudioAccessible from "./components/AffirmationStudioAccessible";
import { AgenticFlowChat } from "./components/AgenticFlowChat";
import { AssignmentResetAccessible as AssignmentReset } from "./components/AssignmentResetAccessible";
import { BillingPlanDetails } from "./components/BillingPlanDetails";
import { BodyCheckInAccessible as BodyCheckIn } from "./components/BodyCheckInAccessible";
import { BreathingPractice } from "./components/BreathingPracticeFriend";
import {
	ChatBubbleIcon,
	CommunityIcon,
	GrowthIcon,
	HeartPulseIcon,
	NotepadIcon,
	SecureLockIcon,
	TargetIcon,
} from "./components/CustomIcon";
import { CustomizePreferences } from "./components/CustomizePreferences";
import { EmotionMappingAccessible as EmotionMapping } from "./components/EmotionMappingAccessible";
import { InteroceptiveScan } from "./components/InteroceptiveScan";
import GrowthInsights from "./components/GrowthInsights";
import GrowthInsightsDashboard from "./components/GrowthInsightsDashboard";
import { Header } from "./components/layout/Header";
import { NavigationTabs } from "./components/layout/NavigationTabs";
import { ManageSubscription } from "./components/ManageSubscription";
import PersonalizedHomepage from "./components/PersonalizedHomepage";
import { AffirmationsView } from "./components/views/AffirmationsView";
import ProfileSettings from "./components/ProfileSettingsSimplified";
import { SubscriptionGate } from "./components/SubscriptionGate";
import { TemperatureExploration } from "./components/TemperatureExploration";
import { FeatureDiscovery } from "./components/onboarding/FeatureDiscovery";
import { ProgressiveOnboarding } from "./components/onboarding/ProgressiveOnboarding";
import { onboardingAnalytics } from "./utils/onboardingAnalytics";

// Lazy load large reflection components for better code splitting
const DirectCommunicationReflection = lazy(() => import("./components/DirectCommunicationReflection"));
const DecideFrameworkReflection = lazy(() => import("./components/DecideFrameworkReflection").then(m => ({ default: m.DecideFrameworkReflection })));
const BIPOCWellnessReflection = lazy(() => import("./components/BIPOCWellnessReflection"));
const DeafInterpreterReflection = lazy(() => import("./components/DeafInterpreterReflection"));
const NeurodivergentInterpreterReflection = lazy(() => import("./components/NeurodivergentInterpreterReflection").then(m => ({ default: m.NeurodivergentInterpreterReflection })));
const InSessionSelfCheck = lazy(() => import("./components/InSessionSelfCheck"));
const MentoringPrepAccessible = lazy(() => import("./components/MentoringPrepAccessible"));
const MentoringReflectionAccessible = lazy(() => import("./components/MentoringReflectionAccessible"));
const PostAssignmentDebriefAccessible = lazy(() => import("./components/PostAssignmentDebriefAccessible"));
const PreAssignmentPrepV5 = lazy(() => import("./components/PreAssignmentPrepV5"));
const PreAssignmentPrepV6 = lazy(() => import("./components/PreAssignmentPrepV6"));
const ProfessionalBoundariesReset = lazy(() => import("./components/ProfessionalBoundariesResetAccessible").then(m => ({ default: m.ProfessionalBoundariesResetAccessible })));
const RoleSpaceReflection = lazy(() => import("./components/RoleSpaceReflection"));
const TeamingPrepEnhanced = lazy(() => import("./components/TeamingPrepEnhanced"));
const TeamingReflectionEnhanced = lazy(() => import("./components/TeamingReflectionEnhanced"));
const TechnologyFatigueReset = lazy(() => import("./components/TechnologyFatigueResetAccessible").then(m => ({ default: m.TechnologyFatigueResetAccessible })));
const WellnessCheckInAccessible = lazy(() => import("./components/WellnessCheckInAccessible"));
const BreatheProtocolAccessible = lazy(() => import("./components/BreatheProtocolAccessible").then(m => ({ default: m.BreatheProtocolAccessible })));
import { useAuth } from "./contexts/AuthContext";
import { useOnboarding } from "./hooks/useOnboarding";
import { useReflectionSubmit } from "./hooks/useReflectionSubmit";
import { ReflectionSuccessToast } from "./components/ReflectionSuccessToast";
import SessionExpiredModal from "./components/SessionExpiredModal";
import LandingPageEnhanced from "./LandingPageEnhanced";
import { supabase } from "./lib/supabase";
import { About } from "./pages/About";
import { Accessibility } from "./pages/Accessibility";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AuthTest } from "./pages/AuthTest";
import { Contact } from "./pages/Contact";
import { HeaderDemo } from "./pages/HeaderDemo";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { PricingNew } from "./pages/PricingNew";
import { PricingProduction } from "./pages/PricingProduction";
import { PricingTest } from "./pages/PricingTest";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import Research from "./pages/Research";
import { SeamlessSignup } from "./pages/SeamlessSignup";
import { TermsOfService } from "./pages/TermsOfService";
import { growthInsightsApi } from "./services/growthInsightsApi";
import type { BurnoutData, ViewMode } from "./types";
import { style } from "framer-motion/client";
import { trackTechniqueStart } from "./utils";
import { data } from "framer-motion/m";

// Import test utilities in development
if (import.meta.env.DEV) {
  import("./utils/enchargeTestUtils");
}

function App() {
	const navigate = useNavigate();
	const { user, loading, signOut } = useAuth();
	const { showToast, closeToast } = useReflectionSubmit();

	console.log("App Component - User:", user, "Loading:", loading);

	// Load and apply accessibility settings on user login
	useEffect(() => {
		const loadAccessibilitySettings = async () => {
			if (!user) return;
			
			try {
				const { data, error } = await supabase
					.from("user_profiles")
					.select("accessibility_settings")
					.eq("id", user.id)
					.single();

				if (error || !data?.accessibility_settings) return;

				const settings = data.accessibility_settings;
				const root = document.documentElement;

				// Apply accessibility settings to the document
				if (settings.larger_text) {
					root.classList.add("larger-text");
				} else {
					root.classList.remove("larger-text");
				}

				if (settings.high_contrast) {
					root.classList.add("high-contrast");
				} else {
					root.classList.remove("high-contrast");
				}

				if (settings.reduce_motion) {
					root.classList.add("reduce-motion");
				} else {
					root.classList.remove("reduce-motion");
				}
			} catch (error) {
				console.error("Error loading accessibility settings:", error);
			}
		};

		loadAccessibilitySettings();
	}, [user]);

	// Session expiration modal state
	const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

	// Load saved tab preference or default to home
	const [activeTab, setActiveTab] = useState(() => {
		const savedTab = localStorage.getItem("preferredTab");
		return savedTab || "home"; // Default to home tab for authenticated users
	});
	const [activeCategory, setActiveCategory] = useState("structured");
	const [structuredSubTab, setStructuredSubTab] = useState("reflections"); // 'reflections', 'context', or 'skills'
	const [insightsTimePeriod, setInsightsTimePeriod] = useState("month");
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const [selectedTechnique, setSelectedTechnique] = useState<string | null>(
		null,
	);
	const [techniqueProgress, setTechniqueProgress] = useState(0);
	const [isTimerActive, setIsTimerActive] = useState(false);
	const [selectedContextCategory, setSelectedContextCategory] = useState<
		string | null
	>(null);
	const [selectedSkillCategory, setSelectedSkillCategory] = useState<
		string | null
	>(null);
	const [breathPhase, setBreathPhase] = useState<
		"inhale" | "hold-in" | "exhale" | "hold-out"
	>("inhale");
	const [breathCycle, setBreathCycle] = useState(0);
	const [bodyPart, setBodyPart] = useState(0); // For body release
	const [bodyAwarenessTime, setBodyAwarenessTime] = useState(60); // Default 1 minute in seconds
	const [bodyAwarenessMethod, setBodyAwarenessMethod] = useState<
		"move" | "picture" | "breathe" | "touch" | "still"
	>("still");

	// Growth Insights state
	const [growthInsightsSummary, setGrowthInsightsSummary] = useState<any>(null);
	const [latestInsights, setLatestInsights] = useState<any>(null);
	const [resetToolkitData, setResetToolkitData] = useState<any>(null);
	const [insightsLoading, setInsightsLoading] = useState(false);
	const [senseCount, setSenseCount] = useState(0); // For sensory reset

	// Onboarding state
	const [showFeatureDiscovery, setShowFeatureDiscovery] = useState(false);
	const [welcomeRecommendations, setWelcomeRecommendations] = useState<string[]>([]);
	const [expansionLevel, setExpansionLevel] = useState(0); // For expansion practice
	const intervalRef = useRef<NodeJS.Timeout | null>(null); // Store interval reference
	const [showPreAssignmentPrep, setShowPreAssignmentPrep] = useState(false);
	const [showPostAssignmentDebrief, setShowPostAssignmentDebrief] =
		useState(false);
	const [showTeamingPrep, setShowTeamingPrep] = useState(false);
	const [showTeamingReflection, setShowTeamingReflection] = useState(false);
	const [showMentoringPrep, setShowMentoringPrep] = useState(false);
	const [showMentoringReflection, setShowMentoringReflection] = useState(false);
	const [showRoleSpaceReflection, setShowRoleSpaceReflection] = useState(false);
	const [
		showDirectCommunicationReflection,
		setShowDirectCommunicationReflection,
	] = useState(false);
	const [showDecideFramework, setShowDecideFramework] = useState(false);
	const [showBIPOCWellness, setShowBIPOCWellness] = useState(false);
	const [showDeafInterpreter, setShowDeafInterpreter] = useState(false);
	const [showNeurodivergentInterpreter, setShowNeurodivergentInterpreter] = useState(false);
	const [showWellnessCheckIn, setShowWellnessCheckIn] = useState(false);
	const [showEthicsMeaningCheck, setShowEthicsMeaningCheck] = useState(false);
	const [showReflectionSuccessToast, setShowReflectionSuccessToast] = useState(false);
	const [showBreathingPractice, setShowBreathingPractice] = useState(false);
	const [showInSessionSelfCheck, setShowInSessionSelfCheck] = useState(false);
	const [showSessionWarning, setShowSessionWarning] = useState(false);
	const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);
	const [showBreathingModal, setShowBreathingModal] = useState(false);
	const [breathingMode, setBreathingMode] = useState<"gentle" | "deep">(
		"gentle",
	);
	const [showEmotionMappingModal, setShowEmotionMappingModal] = useState(false);
	const [showBodyCheckIn, setShowBodyCheckIn] = useState(false);
	const [showBodyCheckInModal, setShowBodyCheckInModal] = useState(false);
	const [bodyCheckInMode, setBodyCheckInMode] = useState<"quick" | "full">(
		"quick",
	);
	const [showProfessionalBoundariesReset, setShowProfessionalBoundariesReset] =
		useState(false);
	const [showTemperatureExploration, setShowTemperatureExploration] =
		useState(false);
	const [showAssignmentReset, setShowAssignmentReset] = useState(false);
	const [showTechnologyFatigueReset, setShowTechnologyFatigueReset] =
		useState(false);
	const [showEmotionMapping, setShowEmotionMapping] = useState(false);
	const [showEmotionClarity, setShowEmotionClarity] = useState(false);
	const [showInteroceptiveScan, setShowInteroceptiveScan] = useState(false);
	const [showAffirmationStudio, setShowAffirmationStudio] = useState(false);
	const [showFiveZoneModal, setShowFiveZoneModal] = useState(false);
	const [showDailyBurnout] = useState(false);
	const [techFatigueMode, setTechFatigueMode] = useState<"quick" | "deep">(
		"quick",
	);
	const [showAssignmentResetModal, setShowAssignmentResetModal] =
		useState(false);
	const [assignmentResetMode, setAssignmentResetMode] = useState<
		"fast" | "full"
	>("fast");
	const [showBoundariesModal, setShowBoundariesModal] = useState(false);
	const [boundariesResetMode, setBoundariesResetMode] = useState<
		"quick" | "deeper"
	>("quick");
	const [showBoundariesWhyModal, setShowBoundariesWhyModal] = useState(false);
	const [showAssignmentWhyModal, setShowAssignmentWhyModal] = useState(false);
	const [emotionMappingMode, setEmotionMappingMode] = useState<
		"quick" | "deeper"
	>("quick");
	const [showBreatheProtocolModal, setShowBreatheProtocolModal] = useState(false);
	const [showBreatheProtocol, setShowBreatheProtocol] = useState(false);
	const [breatheStep, setBreatheStep] = useState(0);
	interface SavedReflection {
		id: string;
		type: string;
		data: Record<string, unknown>;
		timestamp: string;
	}

	interface BodyCheckInData {
		id: number;
		date: string;
		tensionLevel?: string;
		energyLevel?: string;
		overallFeeling?: string;
		completedDuration?: number;
		[key: string]: unknown;
	}

	interface TechniqueUsage {
		id: string;
		technique: string;
		startTime: string;
		completed: boolean;
		stressLevelBefore?: number | null;
		stressLevelAfter?: number | null;
		duration?: number | string;
		endTime?: string;
	}

	const [savedReflections, setSavedReflections] = useState<SavedReflection[]>(
		[],
	);
	const [bodyCheckInData, setBodyCheckInData] = useState<BodyCheckInData[]>([]);
	const [techniqueUsage, setTechniqueUsage] = useState<TechniqueUsage[]>([]);
	const [currentTechniqueId, setCurrentTechniqueId] = useState<string | null>(
		null,
	);
	const [recoveryHabits, setRecoveryHabits] = useState<
		Record<string, unknown>[]
	>([]);
	const [burnoutData, setBurnoutData] = useState<BurnoutData[] | null>([]);
	const [showSummaryView] = useState<ViewMode>("daily");
	const [reflectionStreak, setReflectionStreak] = useState<number | null>(null);
	const [todayConfidence, setTodayConfidence] = useState<number | null>(null);
	const [totalActivities, setTotalActivities] = useState<number>(0);

	// Function to load reflection data (streak, confidence, activities)
	const loadReflectionData = async () => {
		if (!user) return;

		try {
			// Load reflection streak using direct API
			const { fetchReflectionStreakDirect, fetchTodayConfidenceDirect } = await import('./utils/confidenceLevelTracking');
			const { fetchTotalActivitiesDirect } = await import('./utils/totalActivitiesTracking');

			// Fetch streak
			const streak = await fetchReflectionStreakDirect();
			setReflectionStreak(streak);

			// Fetch today's confidence level
			const { data: confidence } = await fetchTodayConfidenceDirect();
			setTodayConfidence(confidence);

			// Fetch total activities
			const activities = await fetchTotalActivitiesDirect();
			setTotalActivities(activities.total);
		} catch (error) {
			console.error('Error loading reflection data:', error);
			setReflectionStreak(0);
			setTodayConfidence(null);
			setTotalActivities(0);
		}
	};

	// Fetch reflection streak and confidence from Supabase using direct API
	useEffect(() => {
		loadReflectionData();
	}, [user, savedReflections]); // Reload when user changes or new reflections are saved

	// Listen for session expiration events
	useEffect(() => {
		const handleSessionExpired = () => {
			console.log("Session expired - showing modal");
			setShowSessionExpiredModal(true);
		};

		window.addEventListener("sessionExpired", handleSessionExpired);

		return () => {
			window.removeEventListener("sessionExpired", handleSessionExpired);
		};
	}, []);

	// Fetch Growth Insights data when user is authenticated and on insights tab
	useEffect(() => {
		const fetchGrowthInsights = async () => {
			if (!user || activeTab !== "insights") return;

			setInsightsLoading(true);
			try {
				// Fetch all data in parallel
				const [summary, latest, toolkit] = await Promise.all([
					growthInsightsApi.getSummary("30d"),
					growthInsightsApi.getLatestInsights(),
					growthInsightsApi.getResetToolkitData(),
				]);

				setGrowthInsightsSummary(summary);
				setLatestInsights(latest);
				setResetToolkitData(toolkit);
			} catch (error) {
				console.error("Error fetching growth insights:", error);
			} finally {
				setInsightsLoading(false);
			}
		};

		fetchGrowthInsights();
	}, [user, activeTab]);

	// Onboarding logic
	useEffect(() => {
		if (!user) return;

		// Check if user needs onboarding
		const checkOnboarding = async () => {
			try {
				const { data: profile } = await import("./lib/supabase").then(m => 
					m.supabase.from("profiles").select("onboarding_completed, created_at").eq("id", user.id).single()
				);

				if (!profile) return;

			} catch (error) {
				console.error("Error checking onboarding status:", error);
			}
		};

		checkOnboarding();
	}, [user]);

	// Onboarding handlers
	const handleFeatureDiscoveryComplete = () => {
		setShowFeatureDiscovery(false);
		onboardingAnalytics.trackFeatureDiscovery(user?.id || '', 'all', 'completed');
	};

	// Helper to check if any modal is open
	const isAnyModalOpen = () => {
		return (
			showBreathingPractice ||
			showEmotionMappingModal ||
			showBodyCheckIn ||
			showAssignmentReset ||
			showEmotionMapping ||
			showEmotionClarity ||
			showInteroceptiveScan ||
			showAffirmationStudio ||
			showTechnologyFatigueReset ||
			showDailyBurnout ||
			showTemperatureExploration ||
			showBreathingModal ||
			showAssignmentWhyModal ||
			showFiveZoneModal ||
			showPostAssignmentDebrief ||
			showPreAssignmentPrep ||
			showTeamingPrep ||
			showTeamingReflection ||
			showMentoringPrep ||
			showMentoringReflection ||
			showWellnessCheckIn ||
			showInSessionSelfCheck ||
			showRoleSpaceReflection ||
			showDirectCommunicationReflection
		);
	};



	// Save tab preference when it changes
	React.useEffect(() => {
		if (activeTab) {
			localStorage.setItem("preferredTab", activeTab);
		}
	}, [activeTab]);

	// Load burnout data on component mount and when tab changes
	React.useEffect(() => {
		console.log(
			"🔄 Burnout data effect running. activeTab:",
			activeTab,
			"user:",
			user?.id,
			"loading:",
			loading,
		);

		// Set initial loading state
		if (!user && !loading) {
			// User is not logged in and auth check is complete
			(window as any).lastBurnoutDataSource = "LOCALSTORAGE";
		}

		const loadBurnoutData = async () => {
			// Always load burnout data if user is logged in, not just on insights tab
			if (user) {
				console.log("🔄 Loading burnout data for user:", user.id);
				console.log("📍 Current tab:", activeTab);
				try {
					// Load from Supabase for logged-in users
					console.log("🔍 Querying burnout_assessments table for user:", user.id);

					// Get data from last 7 days (rolling window)
					const sevenDaysAgo = new Date();
					sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
					sevenDaysAgo.setHours(0, 0, 0, 0);
					const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

					console.log("📅 Filtering burnout data from last 7 days:", sevenDaysAgoStr);

					// Use direct REST API instead of Supabase JS client to avoid timeout issues
					console.log("⏳ Fetching burnout data via direct REST API...");

					let data, error;
					try {
						// Get token from localStorage (same approach as saveBurnoutAssessment.ts)
						let accessToken: string | null = null;
						try {
							const authKey = Object.keys(localStorage).find(key => key.includes('supabase.auth.token'));
							if (authKey) {
								const authData = JSON.parse(localStorage.getItem(authKey) || '{}');
								accessToken = authData.access_token || authData.currentSession?.access_token;

								if (accessToken) {
									console.log("✅ Using token from localStorage");
								}
							}
						} catch (e) {
							console.warn("⚠️ Could not get token from localStorage:", e);
						}

						// Fallback: try getSession() with timeout if localStorage didn't work
						if (!accessToken) {
							console.log("🔐 Attempting to get session from Supabase (with timeout)...");
							try {
								const sessionPromise = supabase.auth.getSession();
								const timeoutPromise = new Promise((_, reject) =>
									setTimeout(() => reject(new Error("Session timeout")), 5000)
								);

								const result: any = await Promise.race([sessionPromise, timeoutPromise]);
								const session = result.data?.session;

								if (session?.access_token) {
									accessToken = session.access_token;
									console.log("✅ Using token from getSession");
								}
							} catch (err: any) {
								console.warn("⚠️ Session fetch timed out or failed:", err.message);
							}
						}

						console.log("🔍 Debug: Got access token, exists?", !!accessToken);

						if (!accessToken) {
							throw new Error("No access token found - please log in again");
						}

						// Build the query URL
						const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/burnout_assessments`);
						url.searchParams.set('user_id', `eq.${user.id}`);
						url.searchParams.set('assessment_date', `gte.${sevenDaysAgoStr}`);
						url.searchParams.set('order', 'assessment_date.desc');
						url.searchParams.set('limit', '30');
						url.searchParams.set('select', '*');

						console.log("🌐 Fetching from:", url.toString());

						const response = await fetch(url.toString(), {
							method: 'GET',
							headers: {
								'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
								'Authorization': `Bearer ${accessToken}`,
								'Content-Type': 'application/json',
								'Prefer': 'return=representation'
							}
						});

						console.log("📊 Response status:", response.status);

						if (!response.ok) {
							const errorText = await response.text();
							console.error("❌ Fetch failed:", errorText);
							throw new Error(`HTTP ${response.status}: ${errorText}`);
						}

						data = await response.json();
						error = null;
						console.log("✅ Successfully fetched data via REST API:", data);
					} catch (fetchError: any) {
						console.error("🚨 REST API fetch failed:", fetchError.message);
						error = fetchError;
						data = null;
					}

					console.log("📊 Query completed. Data:", data, "Error:", error);
					console.log("📊 RAW DATA RECEIVED:", JSON.stringify(data, null, 2));

					console.log("📊 Supabase query executed for user:", user.id);
					console.log("📊 Response data:", data);
					console.log("📊 Response error:", error);
					console.log("📊 Data is array?", Array.isArray(data));
					console.log("📊 Data length:", data?.length);

					if (!error && (!data || data.length === 0)) {
						console.log("⚠️ Query succeeded but returned no data");
						console.log("🔍 Checking if RLS is blocking access...");

						// Try a simpler query to test connection
						const { data: testData, error: testError } = await supabase
							.from("burnout_assessments")
							.select("count")
							.limit(1);

						console.log("📊 Test query result:", testData, testError);
					}

					if (error) {
						console.error("Error fetching burnout assessments:", error);

						// Check if it's a timeout error
						if (error.message && error.message.includes("timeout")) {
							console.error("🚨 The Supabase query is timing out!");
							console.error("This usually means:");
							console.error("1. Network issues connecting to Supabase");
							console.error("2. Supabase project is paused/sleeping");
							console.error("3. Database query is taking too long");
							console.error("Try refreshing the page or checking your Supabase dashboard");

							// Don't throw on timeout - just use empty data
							setBurnoutData([]);
							(window as any).lastBurnoutDataSource = "SUPABASE-TIMEOUT";
							return;
						}

						console.error("Error details:", {
							code: error.code,
							message: error.message,
							details: error.details,
							hint: error.hint,
						});

						// If table doesn't exist, show helpful message
						if (error.code === "42P01") {
							console.error(
								"IMPORTANT: burnout_assessments table does not exist!",
							);
							console.error(
								"Please run the CREATE_BURNOUT_ASSESSMENTS_TABLE.sql in your Supabase SQL editor",
							);
						}
						throw error;
					}

					if (data && data.length > 0) {
						console.log("✅ Loaded burnout assessments from Supabase:", data);
						console.log("✅ Number of assessments:", data.length);

						// Convert Supabase data to match our format
						// Handle the actual table structure we have
						const formattedData = data.map((d) => {
							console.log("Processing assessment record:", d);

							// Extract date as YYYY-MM-DD without timezone conversion
							// Use the date string directly to avoid timezone shifts
							const assessmentDate = d.assessment_date.split("T")[0];

							// Use total_score (0-10 normalized) for the chart
							let totalScore = 5; // default (middle of 0-10 range)
							if (d.total_score !== null && d.total_score !== undefined) {
								// total_score is already normalized to 0-10 in our database
								totalScore = Number(d.total_score);
								console.log(`Using total_score (0-10): ${totalScore}`);
							} else if (d.burnout_score !== null && d.burnout_score !== undefined) {
								// Legacy: burnout_score is also normalized to 0-10
								totalScore = Number(d.burnout_score);
								console.log(`Using legacy burnout_score (0-10): ${totalScore}`);
							} else {
								console.log("No score found, using default: 5");
							}

							// Check if we have individual metrics or need to use symptoms
							if (d.energy_tank !== null && d.energy_tank !== undefined) {
								// We have individual metric columns
								return {
									energyTank: d.energy_tank || 3,
									recoverySpeed: d.recovery_speed || 3,
									emotionalLeakage: d.emotional_leakage || 3,
									performanceSignal: d.performance_signal || 3,
									tomorrowReadiness: d.tomorrow_readiness || 3,
									totalScore: totalScore,
									riskLevel: d.risk_level || "moderate",
									date: assessmentDate,
									timestamp: d.created_at || d.assessment_date,
									stress_level: d.stress_level,
									energy_level: d.energy_level,
									contextFactors: {},
								};
							} else if (d.symptoms) {
								// Use symptoms JSON column
								const symptoms =
									typeof d.symptoms === "string"
										? JSON.parse(d.symptoms)
										: d.symptoms;
								return {
									energyTank: symptoms.energy_tank || symptoms.energyTank || 3,
									recoverySpeed:
										symptoms.recovery_speed || symptoms.recoverySpeed || 3,
									emotionalLeakage:
										symptoms.emotional_leakage ||
										symptoms.emotionalLeakage ||
										3,
									performanceSignal:
										symptoms.performance_signal ||
										symptoms.performanceSignal ||
										3,
									tomorrowReadiness:
										symptoms.tomorrow_readiness ||
										symptoms.tomorrowReadiness ||
										3,
									totalScore: totalScore,
									riskLevel: d.risk_level || "moderate",
									date: assessmentDate,
									timestamp: d.created_at || d.assessment_date,
									stress_level: d.stress_level,
									energy_level: d.energy_level,
									contextFactors: {},
								};
							} else {
								// Minimal data available
								console.warn("Minimal data in assessment:", d);
								return {
									energyTank: 3,
									recoverySpeed: 3,
									emotionalLeakage: 3,
									performanceSignal: 3,
									tomorrowReadiness: 3,
									totalScore: totalScore,
									riskLevel: d.risk_level || "moderate",
									date: assessmentDate,
									timestamp: d.created_at || d.assessment_date,
									stress_level: d.stress_level,
									energy_level: d.energy_level,
									contextFactors: {},
								};
							}
						});

						// Group by date and keep only the latest assessment per day
						const latestPerDay = formattedData.reduce(
							(acc: typeof formattedData, curr) => {
								const existingIndex = acc.findIndex(
									(item) => item.date === curr.date,
								);
								if (existingIndex >= 0) {
									// Keep the one with the later timestamp
									if (
										new Date(curr.timestamp).getTime() >
										new Date(acc[existingIndex].timestamp).getTime()
									) {
										acc[existingIndex] = curr;
									}
								} else {
									acc.push(curr);
								}
								return acc;
							},
							[],
						);

						// Use only database data - don't merge with existing to avoid duplicates
						const dbData = latestPerDay.reverse();
						const sortedData = dbData.sort(
							(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
						);
						console.log("🎯 SETTING burnout data from database:", {
							dataToSet: sortedData,
							length: sortedData.length,
							firstItem: sortedData[0],
							lastItem: sortedData[sortedData.length - 1],
						});
						setBurnoutData(sortedData);
						(window as any).lastBurnoutDataSource = "SUPABASE";
						console.log("✅ Set burnout data from database:", sortedData);
						console.log("📊 Total days tracked:", sortedData.length);
						console.log("🔍 DATA SOURCE: SUPABASE");
					} else {
						// No data returned from Supabase
						console.log(
							"⚠️ No burnout assessments found in table for user:",
							user.id,
						);
						console.log("📊 Query returned:", data);
						console.log(
							"📊 This is normal if you haven't taken any assessments yet",
						);

						// Set empty data instead of falling back
						setBurnoutData([]);
						(window as any).lastBurnoutDataSource = "SUPABASE-EMPTY";
						console.log(
							"🔍 DATA SOURCE: SUPABASE (no data yet - will populate when you take assessments)",
						);
					}
				} catch (error) {
					console.error("❌ Error loading burnout assessments:", error);

					// Check what type of error it is
					if (error?.message?.includes("timeout")) {
						console.log("⏱️ Query timed out");
						setBurnoutData([]); // Use empty array to prevent crashes
						(window as any).lastBurnoutDataSource = "SUPABASE-TIMEOUT";
					} else if (error?.message?.includes("permission denied")) {
						console.error("🔒 Permission denied - RLS policies need to be configured");
						setBurnoutData([]); // Use empty array to prevent crashes
						(window as any).lastBurnoutDataSource = "SUPABASE-PERMISSION-ERROR";
					} else {
						console.error("❌ Unknown error:", error);
						setBurnoutData([]); // Use empty array to prevent crashes
						(window as any).lastBurnoutDataSource = "SUPABASE-ERROR";
					}

					console.log(
						"🔍 DATA SOURCE: SUPABASE (error loading - check console for details)",
					);
				}
			} else {
				// Not logged in, use localStorage only
				console.log("👤 No user logged in, loading from localStorage");
				loadFromLocalStorage();
			}
		};

		// Load burnout data from localStorage (from home screen gauge)
		const loadFromLocalStorage = () => {
			console.log("Loading burnout data from localStorage...");

			// First check for burnout assessment history
			const historyData = localStorage.getItem("burnoutAssessmentHistory");
			if (historyData) {
				const history = JSON.parse(historyData);
				console.log(
					"Found burnout assessment history in localStorage:",
					history,
				);

				// Convert history to our format
				const historyEntries = history.map((data: BurnoutData) => ({
					energyTank: data.energyTank || 3,
					recoverySpeed: data.recoverySpeed || 3,
					emotionalLeakage: data.emotionalLeakage || 3,
					performanceSignal: data.performanceSignal || 3,
					tomorrowReadiness: data.tomorrowReadiness || 3,
					totalScore: Number(data.totalScore) || 15, // Ensure it's a number
					riskLevel: data.level || data.riskLevel || "moderate",
					date: data.date,
					timestamp: data.timestamp || new Date(data.date).toISOString(),
				}));

				// Use only localStorage data - don't merge to avoid duplicates
				const dedupedHistory = historyEntries.reduce(
					(acc: typeof historyEntries, entry) => {
						const existingIndex = acc.findIndex(
							(item) => item.date === entry.date,
						);
						if (existingIndex >= 0) {
							// Keep the one with the later timestamp
							if (
								new Date(entry.timestamp).getTime() >
								new Date(acc[existingIndex].timestamp).getTime()
							) {
								acc[existingIndex] = entry;
							}
						} else {
							acc.push(entry);
						}
						return acc;
					},
					[],
				);

				const sortedHistory = dedupedHistory.sort(
					(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
				);
				console.log("🎯 SETTING burnout data from localStorage:", {
					dataToSet: sortedHistory,
					length: sortedHistory.length,
					firstItem: sortedHistory[0],
					lastItem: sortedHistory[sortedHistory.length - 1],
				});
				setBurnoutData(sortedHistory);
				(window as any).lastBurnoutDataSource = "LOCALSTORAGE";
				console.log("✅ Set burnout data from localStorage:", sortedHistory);
				console.log("📊 Total days tracked:", sortedHistory.length);
				console.log("🔍 DATA SOURCE: LOCALSTORAGE");
			}
		};

		// Load burnout data from reflection_entries as fallback
		const loadBurnoutFromReflections = async () => {
			if (!user) return;

			try {
				const { data, error } = await supabase
					.from("reflection_entries")
					.select("*")
					.eq("user_id", user.id)
					.or(
						"entry_kind.eq.daily_burnout,entry_kind.eq.wellness_check,entry_kind.eq.session_reflection",
					)
					.order("created_at", { ascending: false })
					.limit(30);

				if (!error && data) {
					console.log(
						"Loading burnout data from reflections:",
						data.length,
						"entries",
					);

					// Extract burnout metrics from reflection data
					const burnoutMetrics = data
						.map((reflection) => {
							const d = reflection.data || {};

							// Calculate total score from available metrics
							let totalScore = 0;
							let metricCount = 0;

							// Extract individual metrics if available
							const energyTank = d.energy_tank || d.energyTank || null;
							const recoverySpeed = d.recovery_speed || d.recoverySpeed || null;
							const emotionalLeakage =
								d.emotional_leakage || d.emotionalLeakage || null;
							const performanceSignal =
								d.performance_signal || d.performanceSignal || null;
							const tomorrowReadiness =
								d.tomorrow_readiness || d.tomorrowReadiness || null;

							// If we have burnout gauge metrics
							if (
								energyTank ||
								recoverySpeed ||
								emotionalLeakage ||
								performanceSignal ||
								tomorrowReadiness
							) {
								const metrics = [
									energyTank,
									recoverySpeed,
									emotionalLeakage,
									performanceSignal,
									tomorrowReadiness,
								].filter((m) => m !== null);
								totalScore = metrics.reduce((sum, val) => sum + val, 0);
								metricCount = metrics.length;
							}
							// Otherwise try to calculate from stress/energy levels
							else if (
								d.stress_level !== undefined &&
								d.energy_level !== undefined
							) {
								// Convert stress/energy (0-10 scale) to burnout score (5-25 scale)
								const stressComponent = (10 - (d.stress_level || 5)) * 1.25; // 0-12.5
								const energyComponent = (d.energy_level || 5) * 1.25; // 0-12.5
								totalScore = stressComponent + energyComponent;
								metricCount = 2;
							}

							if (metricCount === 0) return null;

							// Calculate risk level based on average score
							const avgScore = totalScore / metricCount;
							let riskLevel = "low";
							if (avgScore <= 2) riskLevel = "severe";
							else if (avgScore <= 3) riskLevel = "high";
							else if (avgScore <= 4) riskLevel = "moderate";

							return {
								energyTank: energyTank || Math.round((d.energy_level || 5) / 2),
								recoverySpeed: recoverySpeed || 3,
								emotionalLeakage: emotionalLeakage || 3,
								performanceSignal:
									performanceSignal ||
									Math.round(5 - (d.stress_level || 5) / 2),
								tomorrowReadiness: tomorrowReadiness || 3,
								totalScore: totalScore,
								riskLevel: riskLevel,
								date: reflection.created_at.split("T")[0],
								timestamp: reflection.created_at,
							};
						})
						.filter((d) => d !== null);

					if (burnoutMetrics.length > 0) {
						// Use only reflection data - don't merge to avoid duplicates
						const reflectionData = burnoutMetrics.reverse();
						setBurnoutData(
							reflectionData.sort(
								(a, b) =>
									new Date(a.date).getTime() - new Date(b.date).getTime(),
							),
						);
						console.log("Set burnout data from reflections:", reflectionData);
						console.log(
							"📊 Total days tracked from reflections:",
							reflectionData.length,
						);
					}
				}
			} catch (error) {
				console.error("Error loading burnout from reflections:", error);
			}
		};

		// Only load if auth is not still loading
		if (!loading) {
			loadBurnoutData();
		}

		// Listen for new assessments being saved
		const handleAssessmentSaved = () => {
			console.log(
				"🔄 New burnout assessment saved event received, reloading data...",
			);
			console.log("📊 Current burnoutData before reload:", burnoutData);
			loadBurnoutData();
		};

		window.addEventListener("burnout-assessment-saved", handleAssessmentSaved);

		return () => {
			window.removeEventListener(
				"burnout-assessment-saved",
				handleAssessmentSaved,
			);
		};
	}, [activeTab, user, loading]);

	// Separate effect to listen for burnout assessment updates
	React.useEffect(() => {
		const handleAssessmentUpdate = async () => {
			console.log("🔄 Burnout assessment update detected...");

			// If user is logged in, always reload from Supabase
			if (user) {
				console.log("📊 Reloading from Supabase for user:", user.id);
				console.log("📍 Current tab:", activeTab);

				// Get data from last 7 days (rolling window)
				const sevenDaysAgo = new Date();
				sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
				sevenDaysAgo.setHours(0, 0, 0, 0);
				const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

				console.log("📅 Reloading burnout data from last 7 days:", sevenDaysAgoStr);

				try {
					const { data, error} = await supabase
						.from("burnout_assessments")
						.select("*")
						.eq("user_id", user.id)
						.gte("assessment_date", sevenDaysAgoStr)
						.order("assessment_date", { ascending: false })
						.limit(30);

					if (!error && data && data.length > 0) {
						console.log(
							"✅ Loaded updated burnout assessments from Supabase:",
							data.length,
						);

						// Convert Supabase data to match our format
						const formattedData = data.map((d) => {
							// Parse date without timezone conversion
							const assessmentDate = d.assessment_date.split("T")[0];
							let totalScore = 15;
							if (d.total_score !== null && d.total_score !== undefined) {
								totalScore =
									parseInt(d.total_score) || parseFloat(d.total_score) || 15;
							}

							if (d.symptoms) {
								const symptoms =
									typeof d.symptoms === "string"
										? JSON.parse(d.symptoms)
										: d.symptoms;
								return {
									energyTank: symptoms.energy_tank || symptoms.energyTank || 3,
									recoverySpeed:
										symptoms.recovery_speed || symptoms.recoverySpeed || 3,
									emotionalLeakage:
										symptoms.emotional_leakage ||
										symptoms.emotionalLeakage ||
										3,
									performanceSignal:
										symptoms.performance_signal ||
										symptoms.performanceSignal ||
										3,
									tomorrowReadiness:
										symptoms.tomorrow_readiness ||
										symptoms.tomorrowReadiness ||
										3,
									totalScore: totalScore,
									riskLevel: d.risk_level || "moderate",
									date: assessmentDate,
									timestamp: d.created_at || d.assessment_date,
									contextFactors: {},
								};
							} else {
								return {
									energyTank: d.energy_tank || 3,
									recoverySpeed: d.recovery_speed || 3,
									emotionalLeakage: d.emotional_leakage || 3,
									performanceSignal: d.performance_signal || 3,
									tomorrowReadiness: d.tomorrow_readiness || 3,
									totalScore: totalScore,
									riskLevel: d.risk_level || "moderate",
									date: assessmentDate,
									timestamp: d.created_at || d.assessment_date,
									contextFactors: {},
								};
							}
						});

						// Group by date and keep only latest per day
						const latestPerDay = formattedData.reduce(
							(acc: typeof formattedData, curr) => {
								const existingIndex = acc.findIndex(
									(item) => item.date === curr.date,
								);
								if (existingIndex >= 0) {
									if (
										new Date(curr.timestamp).getTime() >
										new Date(acc[existingIndex].timestamp).getTime()
									) {
										acc[existingIndex] = curr;
									}
								} else {
									acc.push(curr);
								}
								return acc;
							},
							[],
						);

						const sortedData = latestPerDay.sort(
							(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
						);

						console.log("🎯 ABOUT TO SET BURNOUT DATA (UPDATE):", {
							sortedData,
							length: sortedData.length,
							firstItem: sortedData[0],
							lastItem: sortedData[sortedData.length - 1],
						});

						setBurnoutData(sortedData);
						(window as any).lastBurnoutDataSource = "SUPABASE-UPDATE";
						console.log("✅ Updated burnout data from Supabase");
						console.log("🔍 DATA SOURCE: SUPABASE (after assessment save)");
						return;
					}
				} catch (error) {
					console.error("Error reloading from Supabase:", error);
				}
			}

			// No localStorage fallback - burnout data must come from Supabase
			console.log("⚠️ No user session or Supabase data - burnout trends require login");
		};

		window.addEventListener("burnout-assessment-saved", handleAssessmentUpdate);

		return () => {
			window.removeEventListener(
				"burnout-assessment-saved",
				handleAssessmentUpdate,
			);
		};
	}, [activeTab, user, loading]);

	// Function to load reflections - moved outside useEffect so it can be called from modals
	const loadReflections = async () => {
			console.log("App.tsx - loadReflections called, user:", user);

			// If user is authenticated, load from Supabase
			if (user?.id) {
				try {
					console.log("App.tsx - Loading reflections for user:", user.id);
					const { reflectionService } = await import(
						"./services/reflectionService"
					);
					const reflections = await reflectionService.getUserReflections(
						user.id,
						10,
					);

					console.log("App.tsx - Raw reflections from Supabase:", reflections);

					if (reflections && reflections.length > 0) {
						// Convert Supabase format to app format
						const formattedReflections = reflections.map((r) => ({
							id: r.id || Date.now().toString(),
							type: r.entry_kind || "reflection",
							data: r.data || {},
							timestamp: r.created_at || new Date().toISOString(),
						}));
						setSavedReflections(formattedReflections);
						console.log(
							`App.tsx - Loaded ${formattedReflections.length} reflections from Supabase:`,
							formattedReflections,
						);
					} else {
						// No reflections in Supabase, check localStorage for migration
						const storedReflections = localStorage.getItem("savedReflections");
						if (storedReflections) {
							const localReflections = JSON.parse(storedReflections);
							setSavedReflections(localReflections);

							// Migrate local reflections to Supabase
							console.log("Migrating local reflections to Supabase...");
							reflectionService.migrateLocalStorageToSupabase(user.id);
						}
					}
				} catch (error) {
					console.error("Error loading reflections from Supabase:", error);
					// Fall back to localStorage
					const storedReflections = localStorage.getItem("savedReflections");
					if (storedReflections) {
						setSavedReflections(JSON.parse(storedReflections));
					}
				}
			} else {
				// Not authenticated - use localStorage
				const storedReflections = localStorage.getItem("savedReflections");
				if (storedReflections) {
					setSavedReflections(JSON.parse(storedReflections));
				}
			}
	};

	// Load saved reflections on mount
	React.useEffect(() => {
		loadReflections();

		// Load technique usage data from Supabase and localStorage
		const loadTechniqueUsage = async () => {
			// First load from localStorage for immediate display
			const storedUsage = localStorage.getItem("techniqueUsage");
			if (storedUsage) {
				setTechniqueUsage(JSON.parse(storedUsage));
			}

			// Then load from Supabase if user is authenticated
			if (user?.id) {
				try {
					const { data, error } = await supabase
						.from("technique_usage_sessions")
						.select("*")
						.eq("user_id", user.id)
						.order("created_at", { ascending: false })
						.limit(50);

					if (!error && data) {
						// Convert Supabase data to our format
						const formattedData = data.map((t) => ({
							id: t.id,
							technique: t.technique,
							startTime: t.started_at,
							endTime: t.completed_at,
							completed: t.completed,
							duration: t.duration_seconds,
							stressLevelBefore: t.stress_before,
							stressLevelAfter: t.stress_after,
						}));

						setTechniqueUsage(formattedData);
						// Update localStorage with database data
						localStorage.setItem(
							"techniqueUsage",
							JSON.stringify(formattedData),
						);
						console.log(
							"Loaded technique usage from Supabase:",
							formattedData.length,
							"records",
						);
					} else if (error) {
						console.error(
							"Error loading technique usage from Supabase:",
							error,
						);
					}
				} catch (err) {
					console.error("Error in loadTechniqueUsage:", err);
				}
			}
		};
		loadTechniqueUsage();

		// Load recovery habits data
		const loadRecoveryHabits = () => {
			const storedHabits = localStorage.getItem("recoveryHabits");
			if (storedHabits) {
				setRecoveryHabits(JSON.parse(storedHabits));
			}
		};
		loadRecoveryHabits();

		// Load body check-in data from Supabase
		const loadBodyCheckInData = async () => {
			if (user) {
				try {
					const { data, error } = await supabase
						.from("body_checkins")
						.select("*")
						.eq("user_id", user.id)
						.order("created_at", { ascending: false })
						.limit(100);

					if (error) {
						console.error("Error loading body check-ins:", error);
						// Fall back to localStorage
						const storedData = localStorage.getItem("bodyCheckInData");
						if (storedData) {
							setBodyCheckInData(JSON.parse(storedData));
						}
					} else if (data) {
						// Transform Supabase data to match the interface
						const transformedData = data.map((item) => ({
							tensionLevel: item.tension_level || 5,
							energyLevel: item.energy_level || 5,
							overallFeeling: item.overall_feeling || 5,
							timestamp: item.created_at,
							notes: item.notes,
							body_areas: item.body_areas,
						}));
						setBodyCheckInData(transformedData);
					}
				} catch (err) {
					console.error("Error loading body check-ins:", err);
					// Fall back to localStorage
					const storedData = localStorage.getItem("bodyCheckInData");
					if (storedData) {
						setBodyCheckInData(JSON.parse(storedData));
					}
				}
			} else {
				// Not logged in, use localStorage
				const storedData = localStorage.getItem("bodyCheckInData");
				if (storedData) {
					setBodyCheckInData(JSON.parse(storedData));
				}
			}
		};
		loadBodyCheckInData();
	}, [user]); // Reload when user changes


	// Listen for session warning events
	useEffect(() => {
		const handleSessionWarning = (event: CustomEvent) => {
			setSessionTimeRemaining(event.detail.timeRemaining);
			setShowSessionWarning(true);
		};

		window.addEventListener(
			"sessionWarning",
			handleSessionWarning as EventListener,
		);
		return () => {
			window.removeEventListener(
				"sessionWarning",
				handleSessionWarning as EventListener,
			);
		};
	}, []);

	// Helper function to save a reflection
	const saveReflection = async (
		type: string,
		data: Record<string, unknown>,
	) => {
		console.log("App.tsx - saveReflection called with:", { type, data });

		// If user is authenticated, save to Supabase
		if (user?.id) {
			const { reflectionService } = await import(
				"./services/reflectionService"
			);
			const result = await reflectionService.saveReflection(
				user.id,
				type,
				data,
			);

			console.log("App.tsx - Save result:", result);

			if (result.success) {
				console.log("Reflection saved to Supabase successfully");
				// Still update local state for immediate UI feedback
				const newReflection = {
					id: result.id || Date.now().toString(),
					type,
					data,
					timestamp: new Date().toISOString(),
				};
				const updatedReflections = [newReflection, ...savedReflections].slice(
					0,
					10,
				);
				setSavedReflections(updatedReflections);
				console.log("App.tsx - Updated savedReflections:", updatedReflections);

				// Also reload reflections from Supabase to ensure consistency
				setTimeout(async () => {
					const reflections = await reflectionService.getUserReflections(
						user.id,
						10,
					);
					if (reflections && reflections.length > 0) {
						const formattedReflections = reflections.map((r) => ({
							id: r.id || Date.now().toString(),
							type: r.entry_kind || "reflection",
							data: r.data || {},
							timestamp: r.created_at || new Date().toISOString(),
						}));
						setSavedReflections(formattedReflections);
					}
				}, 1000);
			} else {
				console.error("Failed to save to Supabase:", result.error);
				// Fall back to localStorage if Supabase fails
				const newReflection = {
					id: Date.now().toString(),
					type,
					data,
					timestamp: new Date().toISOString(),
				};
				const updatedReflections = [newReflection, ...savedReflections].slice(
					0,
					10,
				);
				setSavedReflections(updatedReflections);
				localStorage.setItem(
					"savedReflections",
					JSON.stringify(updatedReflections),
				);
			}
		} else {
			// Not authenticated or in dev mode - use localStorage
			const newReflection = {
				id: Date.now().toString(),
				type,
				data,
				timestamp: new Date().toISOString(),
			};

			const updatedReflections = [newReflection, ...savedReflections].slice(
				0,
				10,
			);
			setSavedReflections(updatedReflections);
			localStorage.setItem(
				"savedReflections",
				JSON.stringify(updatedReflections),
			);
		}
	};

	// Helper function to get time ago string
	// Moved to utils/dateHelpers.ts
	// const getTimeAgo = (date: Date) => { ... }

	// Helper function to track technique start
	const trackTechniqueStart = (technique: string) => {
		const usage = {
			id: Date.now().toString(),
			technique,
			startTime: new Date().toISOString(),
			completed: false,
			stressLevelBefore: null,
			stressLevelAfter: null,
		};

		const updatedUsage = [usage, ...techniqueUsage];
		setTechniqueUsage(updatedUsage);
		localStorage.setItem("techniqueUsage", JSON.stringify(updatedUsage));

		// Save to Supabase if user is authenticated
		if (user?.id) {
			(async () => {
				try {
					const { data, error } = await supabase
						.from("technique_usage_sessions")
						.insert({
							user_id: user.id,
							technique: technique,
							started_at: new Date().toISOString(),
							completed: false,
						})
						.select()
						.single();

					if (error) {
						console.error("Error saving technique start to Supabase:", error);
					} else {
						console.log("Technique start saved to Supabase:", data);
						// Store the Supabase ID for later update
						usage.id = data.id || usage.id;
					}
				} catch (err) {
					console.error("Error in trackTechniqueStart:", err);
				}
			})();
		}

		return usage.id;
	};

	// Helper function to track technique completion
	const trackTechniqueComplete = (
		techniqueId: string,
		duration: number | string,
	) => {
		let completedTechnique: TechniqueUsage | null = null;

		const updatedUsage = techniqueUsage.map((usage) => {
			if (
				usage.id === techniqueId ||
				(usage.technique === selectedTechnique &&
					!usage.completed &&
					new Date(usage.startTime).getTime() > Date.now() - 600000)
			) {
				// Within last 10 mins
				completedTechnique = {
					...usage,
					completed: true,
					duration,
					endTime: new Date().toISOString(),
				};
				return completedTechnique;
			}
			return usage;
		});

		setTechniqueUsage(updatedUsage);
		localStorage.setItem("techniqueUsage", JSON.stringify(updatedUsage));

		// Update completion in Supabase if user is authenticated
		if (user?.id && completedTechnique) {
			(async () => {
				try {
					const durationSeconds = typeof duration === "number" ? duration : 300; // Default 5 mins
					const completedAt = new Date().toISOString();

					// Try to update by ID if we have it
					if (techniqueId && techniqueId.includes("-")) {
						// This is a UUID from Supabase
						const { error } = await supabase
							.from("technique_usage_sessions")
							.update({
								completed: true,
								completed_at: completedAt,
								duration_seconds: durationSeconds,
								stress_before: completedTechnique.stressLevelBefore,
								stress_after: completedTechnique.stressLevelAfter,
							})
							.eq("id", techniqueId)
							.eq("user_id", user.id);

						if (error) {
							console.error(
								"Error updating technique completion in Supabase:",
								error,
							);
						} else {
							console.log("Technique completion updated in Supabase");
						}
					} else {
						// Fallback: insert a new completed record
						const { error } = await supabase
							.from("technique_usage_sessions")
							.insert({
								user_id: user.id,
								technique: completedTechnique.technique,
								started_at: completedTechnique.startTime,
								completed_at: completedAt,
								completed: true,
								duration_seconds: durationSeconds,
								stress_before: completedTechnique.stressLevelBefore,
								stress_after: completedTechnique.stressLevelAfter,
							});

						if (error) {
							console.error(
								"Error saving technique completion to Supabase:",
								error,
							);
						} else {
							console.log("Technique completion saved to Supabase");
						}
					}
				} catch (err) {
					console.error("Error in trackTechniqueComplete:", err);
				}
			})();
		}

		// Track this as a recovery break
		if (typeof duration === "number" && duration > 50) {
			// If completed more than 50% of the technique
			trackRecoveryHabit("break", "stress-reset", {
				technique: selectedTechnique,
				duration,
			});
		}
	};

	// Helper function to track recovery habits
	const trackRecoveryHabit = (
		type: string,
		value: unknown,
		metadata?: Record<string, unknown>,
	) => {
		const habit = {
			id: Date.now().toString(),
			type,
			value,
			metadata,
			timestamp: new Date().toISOString(),
		};

		const updatedHabits = [habit, ...recoveryHabits].slice(0, 100); // Keep last 100
		setRecoveryHabits(updatedHabits);
		localStorage.setItem("recoveryHabits", JSON.stringify(updatedHabits));
	};

	// Export burnout data function
	const exportBurnoutData = () => {
		if (burnoutData.length === 0) {
			alert("No data to export");
			return;
		}

		// Prepare CSV content
		const headers = [
			"Date",
			"Time",
			"Total Score",
			"Risk Level",
			"Energy Tank",
			"Recovery Speed",
			"Emotional Leakage",
			"Performance Signal",
			"Tomorrow Readiness",
			"Workload Intensity",
			"Emotional Demand",
			"Had Breaks",
			"Team Support",
			"Difficult Session",
		];

		const rows = burnoutData.map((d) => {
			const date = new Date(d.timestamp);
			return [
				date.toLocaleDateString(),
				date.toLocaleTimeString(),
				d.totalScore ? d.totalScore.toFixed(2) : "",
				d.riskLevel || "",
				d.energyTank || d.exhaustion || "",
				d.recoverySpeed || d.recovery || "",
				d.emotionalLeakage || d.detachment || "",
				d.performanceSignal || d.inefficacy || "",
				d.tomorrowReadiness || d.overload || "",
				d.contextFactors?.workloadIntensity || "",
				d.contextFactors?.emotionalDemand || "",
				d.contextFactors?.hadBreaks !== undefined
					? d.contextFactors.hadBreaks
						? "Yes"
						: "No"
					: "",
				d.contextFactors?.teamSupport !== undefined
					? d.contextFactors.teamSupport
						? "Yes"
						: "No"
					: "",
				d.contextFactors?.difficultSession !== undefined
					? d.contextFactors.difficultSession
						? "Yes"
						: "No"
					: "",
			];
		});

		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.join(",")),
		].join("\n");

		// Create and download file
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`burnout_data_${new Date().toISOString().split("T")[0]}.csv`,
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Calculate aggregated data for weekly/monthly views
	const getAggregatedData = (): BurnoutData[] => {
		console.log("🎯 getAggregatedData called");
		console.log("📊 burnoutData state:", {
			length: burnoutData?.length || 0,
			source: (window as any).lastBurnoutDataSource || "unknown",
			data: burnoutData,
			isNull: burnoutData === null,
			firstItem: burnoutData?.[0],
			lastItem: burnoutData?.[burnoutData?.length - 1],
		});
		console.log("📊 showSummaryView:", showSummaryView);

		// Handle null or empty data
		if (!burnoutData || burnoutData.length === 0) {
			console.log("📊 No data available");
			return [];
		}

		// Filter out any invalid data points
		// totalScore is now normalized to 0-10 scale
		let validData = burnoutData.filter(
			(d) =>
				d.totalScore !== undefined &&
				d.totalScore !== null &&
				!isNaN(d.totalScore) &&
				d.totalScore >= 0 &&
				d.totalScore <= 10,
		);

		// Filter by time period
		const now = new Date();
		const timePeriodDays = insightsTimePeriod === "week" ? 7 : insightsTimePeriod === "month" ? 30 : 90;
		const cutoffDate = new Date(now.getTime() - (timePeriodDays * 24 * 60 * 60 * 1000));

		validData = validData.filter((d) => {
			const itemDate = new Date(d.timestamp);
			return itemDate >= cutoffDate;
		});

		console.log("📊 Valid data after filtering:", {
			originalLength: burnoutData.length,
			validLength: validData.length,
			filtered: burnoutData.length - validData.length,
			timePeriod: insightsTimePeriod,
			cutoffDate: cutoffDate.toISOString(),
			validData,
		});

		// IMPORTANT: Keep only the most recent assessment per day
		const latestPerDay: Record<string, BurnoutData> = {};
		validData.forEach((d) => {
			const date = d.date; // date is already in YYYY-MM-DD format
			if (!latestPerDay[date]) {
				latestPerDay[date] = d;
			} else {
				// Compare timestamps and keep the more recent one
				const existingTime = new Date(latestPerDay[date].timestamp).getTime();
				const newTime = new Date(d.timestamp).getTime();
				if (newTime > existingTime) {
					latestPerDay[date] = d;
				}
			}
		});

		// Convert back to array and sort by date
		const dedupedData = Object.values(latestPerDay).sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		);

		console.log(
			"Deduped data (one per day):",
			dedupedData.length,
			"days from",
			burnoutData.length,
			"total entries",
		);

		if (showSummaryView === "daily" || dedupedData.length === 0)
			return dedupedData;

		const aggregated: BurnoutData[] = [];
		const sorted = [...dedupedData].sort(
			(a, b) =>
				new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
		);

		if (showSummaryView === "weekly") {
			// Group by week
			let currentWeek: BurnoutData[] = [];
			let weekStart: Date | null = null;

			sorted.forEach((d) => {
				const date = new Date(d.timestamp);
				if (
					!weekStart ||
					date.getTime() - weekStart.getTime() > 7 * 24 * 60 * 60 * 1000
				) {
					if (currentWeek.length > 0) {
						aggregated.push({
							date: weekStart?.toISOString().split("T")[0],
							totalScore:
								currentWeek.reduce((sum, item) => sum + item.totalScore, 0) /
								currentWeek.length,
							riskLevel: getMostCommonRiskLevel(currentWeek),
							count: currentWeek.length,
						});
					}
					weekStart = date;
					currentWeek = [d];
				} else {
					currentWeek.push(d);
				}
			});

			if (currentWeek.length > 0 && weekStart) {
				aggregated.push({
					date: weekStart.toISOString().split("T")[0],
					totalScore:
						currentWeek.reduce((sum, item) => sum + item.totalScore, 0) /
						currentWeek.length,
					riskLevel: getMostCommonRiskLevel(currentWeek),
					count: currentWeek.length,
				});
			}
		} else if (showSummaryView === "monthly") {
			// Group by month
			const monthGroups = new Map<string, BurnoutData[]>();

			sorted.forEach((d) => {
				const date = new Date(d.timestamp);
				const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;

				if (!monthGroups.has(monthKey)) {
					monthGroups.set(monthKey, []);
				}
				monthGroups.get(monthKey)?.push(d);
			});

			monthGroups.forEach((items, monthKey) => {
				aggregated.push({
					date: `${monthKey}-01`,
					totalScore:
						items.reduce((sum, item) => sum + item.totalScore, 0) /
						items.length,
					riskLevel: getMostCommonRiskLevel(items),
					count: items.length,
				});
			});
		}

		return aggregated;
	};

	const getMostCommonRiskLevel = (items: BurnoutData[]): string => {
		const counts = items.reduce(
			(acc, item) => {
				acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		return (
			Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "moderate"
		);
	};

	const renderGrowthInsights = () => (
		<main
			className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
			role="main"
			aria-labelledby="growth-insights-heading"
		>
			<div className="space-y-8">
				{/* Header with time period tabs */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h2
								id="growth-insights-heading"
								className="text-4xl font-bold mb-2"
								style={{ color: "#000000", letterSpacing: "-0.5px" }}
							>
								Growth Insights
							</h2>
							<p className="text-base" style={{ color: "#000000" }}>
								{insightsTimePeriod === "week" ? "Past Week" : insightsTimePeriod === "month" ? "Past Month" : "Past 90 Days"}:{" "}
								{growthInsightsSummary?.totalReflections ||
									savedReflections.length}{" "}
								total reflections
							</p>
						</div>

						<nav
							className="flex space-x-2 p-2 rounded-xl"
							role="tablist"
							aria-label="Time period selector"
							style={{
								backgroundColor: "var(--bg-card)",
								boxShadow: "var(--shadow-md)",
							}}
						>
							<button
								onClick={() => setInsightsTimePeriod("week")}
								className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
								role="tab"
								aria-selected={insightsTimePeriod === "week"}
								aria-controls="insights-panel"
								aria-label="View past week insights"
								style={{
									background:
										insightsTimePeriod === "week"
											? "#6B8268"
											: "transparent",
									color: insightsTimePeriod === "week" ? "#FFFFFF" : "#1A1A1A",
									boxShadow: insightsTimePeriod === "week" ? "rgba(107, 139, 96, 0.3) 0px 2px 8px" : "none",
								}}
								onMouseEnter={(e) => {
									if (insightsTimePeriod !== "week") {
										e.currentTarget.style.backgroundColor =
											"rgba(107, 139, 96, 0.2)";
									}
								}}
								onMouseLeave={(e) => {
									if (insightsTimePeriod !== "week") {
										e.currentTarget.style.backgroundColor = "transparent";
									}
								}}
							>
								Past Week
							</button>
							<button
								onClick={() => setInsightsTimePeriod("month")}
								className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
								role="tab"
								aria-selected={insightsTimePeriod === "month"}
								aria-controls="insights-panel"
								aria-label="View past month insights"
								style={{
									background:
										insightsTimePeriod === "month"
											? "#6B8268"
											: "transparent",
									color: insightsTimePeriod === "month" ? "#FFFFFF" : "#1A1A1A",
									boxShadow: insightsTimePeriod === "month" ? "rgba(107, 139, 96, 0.3) 0px 2px 8px" : "none",
								}}
								onMouseEnter={(e) => {
									if (insightsTimePeriod !== "month") {
										e.currentTarget.style.backgroundColor =
											"rgba(107, 139, 96, 0.2)";
									}
								}}
								onMouseLeave={(e) => {
									if (insightsTimePeriod !== "month") {
										e.currentTarget.style.backgroundColor = "transparent";
									}
								}}
							>
								Past Month
							</button>
							<button
								onClick={() => setInsightsTimePeriod("90days")}
								className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
								role="tab"
								aria-selected={insightsTimePeriod === "90days"}
								aria-controls="insights-panel"
								aria-label="View past 90 days insights"
								style={{
									background:
										insightsTimePeriod === "90days"
											? "#6B8268"
											: "transparent",
									color:
										insightsTimePeriod === "90days" ? "#FFFFFF" : "#1A1A1A",
									boxShadow: insightsTimePeriod === "90days" ? "rgba(107, 139, 96, 0.3) 0px 2px 8px" : "none",
								}}
								onMouseEnter={(e) => {
									if (insightsTimePeriod !== "90days") {
										e.currentTarget.style.backgroundColor =
											"rgba(107, 139, 96, 0.2)";
									}
								}}
								onMouseLeave={(e) => {
									if (insightsTimePeriod !== "90days") {
										e.currentTarget.style.backgroundColor = "transparent";
									}
								}}
							>
								Past 90 Days
							</button>
						</nav>
					</div>
				</div>

				{/* Stress & Energy Chart */}
				<section
					className="rounded-2xl p-8"
					aria-labelledby="stress-energy-chart-heading"
					style={{
						backgroundColor: "var(--bg-card)",
						boxShadow:
							"0 10px 30px rgba(92, 127, 79, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05)",
						border: "1px solid rgba(45, 95, 63, 0.2)",
					}}
				>
					<div className="flex items-center justify-between mb-6">
						<h2
							id="stress-energy-chart-heading"
							className="text-2xl font-bold"
							style={{ color: "var(--primary-900)" }}
						>
							Your Stress & Energy Over Time
						</h2>
					</div>

					{/* Enhanced Chart area */}
					<div
						className="rounded-xl p-6 h-80 relative overflow-hidden"
						style={{
							background: "linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)",
							border: "1px solid rgba(45, 95, 63, 0.2)",
						}}
					>
						{/* Y-axis labels with descriptive text */}
						<div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs font-medium py-4 z-10">
							<div className="flex items-center gap-1">
								<span className="text-green-600">10</span>
								<span className="text-green-500 text-[10px]">Peak</span>
							</div>
							<div className="flex items-center gap-1">
								<span className="text-green-500">8</span>
								<span className="text-green-500 text-[10px]">High</span>
							</div>
							<div className="flex items-center gap-1">
								<span className="text-yellow-600">6</span>
								<span className="text-yellow-600 text-[10px]">Moderate</span>
							</div>
							<div className="flex items-center gap-1">
								<span className="text-orange-600">4</span>
								<span className="text-orange-600 text-[10px]">Low</span>
							</div>
							<div className="flex items-center gap-1">
								<span className="text-red-600">2</span>
								<span className="text-red-600 text-[10px]">Critical</span>
							</div>
							<div className="flex items-center gap-1">
								<span className="text-red-700">0</span>
							</div>
						</div>

						{/* Chart content area */}
						<div className="ml-20 mr-4 h-full relative">
							{(() => {
								const reflectionsWithStress = savedReflections.filter(
									(r) =>
										r.data.stress_level ||
										r.data.stressLevel ||
										r.data.stressLevelBefore ||
										r.data.stressLevelAfter,
								);
								const reflectionsWithEnergy = savedReflections.filter(
									(r) =>
										r.data.energy_level ||
										r.data.energyLevel ||
										r.data.physical_energy,
								);

								// Prepare data for the chart
								const chartData =
									savedReflections.length > 0
										? savedReflections
												.filter(
													(r) =>
														r.data.stress_level ||
														r.data.stressLevel ||
														r.data.energy_level ||
														r.data.energyLevel ||
														r.data.physical_energy,
												)
												.sort(
													(a, b) =>
														new Date(a.timestamp).getTime() -
														new Date(b.timestamp).getTime(),
												)
												.slice(-7)
												.map((r) => ({
													date: new Date(r.timestamp).toLocaleDateString(
														"en-US",
														{
															weekday: "short",
														},
													),
													stress: parseFloat(
														r.data.stress_level || r.data.stressLevel || "5",
													),
													energy: parseFloat(
														r.data.energy_level ||
															r.data.energyLevel ||
															r.data.physical_energy ||
															"5",
													),
												}))
										: [];

								// Show empty state if no data
								if (chartData.length === 0) {
									return (
										<div className="flex items-center justify-center h-full">
											<div className="text-center">
												<div className="mb-4">
													<div className="text-4xl mb-2">📊</div>
													<p className="text-lg font-medium text-gray-700">No Data Yet</p>
												</div>
												<p className="text-gray-500">Complete a Wellness Check-In to see your stress & energy trends</p>
											</div>
										</div>
									);
								}

								return (
									<svg
										className="w-full h-full"
										viewBox="0 0 400 200"
										style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
									>
										{/* Gradient definitions */}
										<defs>
											<linearGradient
												id="stressGradient"
												x1="0%"
												y1="0%"
												x2="100%"
												y2="0%"
											>
												<stop
													offset="0%"
													style={{ stopColor: "#ef4444", stopOpacity: 0.8 }}
												/>
												<stop
													offset="50%"
													style={{ stopColor: "#f97316", stopOpacity: 1 }}
												/>
												<stop
													offset="100%"
													style={{ stopColor: "#eab308", stopOpacity: 0.8 }}
												/>
											</linearGradient>
											<linearGradient
												id="energyGradient"
												x1="0%"
												y1="0%"
												x2="100%"
												y2="0%"
											>
												<stop
													offset="0%"
													style={{ stopColor: "#10b981", stopOpacity: 0.8 }}
												/>
												<stop
													offset="50%"
													style={{ stopColor: "#3b82f6", stopOpacity: 1 }}
												/>
												<stop
													offset="100%"
													style={{ stopColor: "#8b5cf6", stopOpacity: 0.8 }}
												/>
											</linearGradient>
											<linearGradient
												id="stressFill"
												x1="0%"
												y1="0%"
												x2="0%"
												y2="100%"
											>
												<stop
													offset="0%"
													style={{ stopColor: "#ef4444", stopOpacity: 0.3 }}
												/>
												<stop
													offset="100%"
													style={{ stopColor: "#ef4444", stopOpacity: 0.05 }}
												/>
											</linearGradient>
											<linearGradient
												id="energyFill"
												x1="0%"
												y1="0%"
												x2="0%"
												y2="100%"
											>
												<stop
													offset="0%"
													style={{ stopColor: "#10b981", stopOpacity: 0.3 }}
												/>
												<stop
													offset="100%"
													style={{ stopColor: "#10b981", stopOpacity: 0.05 }}
												/>
											</linearGradient>
											<filter id="glowEffect">
												<feGaussianBlur stdDeviation="3" result="coloredBlur" />
												<feMerge>
													<feMergeNode in="coloredBlur" />
													<feMergeNode in="SourceGraphic" />
												</feMerge>
											</filter>
										</defs>

										{/* Grid lines */}
										{[0, 40, 80, 120, 160].map((y) => (
											<line
												key={y}
												x1="0"
												y1={y}
												x2="400"
												y2={y}
												stroke="#e5e7eb"
												strokeWidth="0.5"
												strokeDasharray="2 4"
												opacity="0.5"
											/>
										))}

										{/* Vertical grid lines */}
										{[57, 114, 171, 228, 285, 342].map((x) => (
											<line
												key={x}
												x1={x}
												y1="0"
												y2="200"
												stroke="#e5e7eb"
												strokeWidth="0.5"
												strokeDasharray="2 4"
												opacity="0.3"
											/>
										))}

										{/* Optimal zones */}
										<rect
											x="0"
											y="0"
											width="400"
											height="40"
											fill="#10b981"
											opacity="0.03"
										/>
										<rect
											x="0"
											y="40"
											width="400"
											height="40"
											fill="#3b82f6"
											opacity="0.03"
										/>
										<rect
											x="0"
											y="80"
											width="400"
											height="40"
											fill="#eab308"
											opacity="0.03"
										/>
										<rect
											x="0"
											y="120"
											width="400"
											height="40"
											fill="#f97316"
											opacity="0.03"
										/>
										<rect
											x="0"
											y="160"
											width="400"
											height="40"
											fill="#ef4444"
											opacity="0.03"
										/>

										{/* Energy area fill - adjusted scale */}
										{chartData && chartData.length > 0 && (
											<path
												d={
													`M 10,${190 - chartData[0].energy * 17} ` +
													chartData
														.map(
															(d, i) =>
																`L ${chartData.length > 1 ? (i / (chartData.length - 1)) * 380 + 10 : 200},${190 - d.energy * 17}`,
														)
														.join(" ") +
													` L 390,200 L 10,200 Z`
												}
												fill="url(#energyFill)"
												opacity="0.6"
											/>
										)}

										{/* Stress area fill - adjusted scale */}
										{chartData && chartData.length > 0 && (
											<path
												d={
													`M 10,${190 - chartData[0].stress * 17} ` +
													chartData
														.map(
															(d, i) =>
																`L ${chartData.length > 1 ? (i / (chartData.length - 1)) * 380 + 10 : 200},${190 - d.stress * 17}`,
														)
														.join(" ") +
													` L 390,200 L 10,200 Z`
												}
												fill="url(#stressFill)"
												opacity="0.6"
											/>
										)}

										{/* Energy trend line - adjusted scale */}
										{chartData && chartData.length > 0 && (
											<path
												d={
													`M 10,${190 - chartData[0].energy * 17} ` +
													chartData
														.slice(0, -1)
														.map((d, i) => {
															const x1 = chartData.length > 1 ? (i / (chartData.length - 1)) * 380 + 10 : 200;
															const y1 = 190 - d.energy * 17;
															const x2 =
																((i + 1) / (chartData.length - 1)) * 380 + 10;
															const y2 = 190 - chartData[i + 1].energy * 17;
															const cx = (x1 + x2) / 2;
															return `Q ${cx},${y1} ${x2},${y2}`;
														})
														.join(" ")
												}
												fill="none"
												stroke="url(#energyGradient)"
												strokeWidth="3"
												strokeLinecap="round"
												filter="url(#glowEffect)"
											/>
										)}

										{/* Stress trend line - adjusted scale */}
										{chartData && chartData.length > 0 && (
											<path
												d={
													`M 10,${190 - chartData[0].stress * 17} ` +
													chartData
														.slice(0, -1)
														.map((d, i) => {
															const x1 = chartData.length > 1 ? (i / (chartData.length - 1)) * 380 + 10 : 200;
															const y1 = 190 - d.stress * 17;
															const x2 =
																((i + 1) / (chartData.length - 1)) * 380 + 10;
															const y2 = 190 - chartData[i + 1].stress * 17;
															const cx = (x1 + x2) / 2;
															return `Q ${cx},${y1} ${x2},${y2}`;
														})
														.join(" ")
												}
												fill="none"
												stroke="url(#stressGradient)"
												strokeWidth="3"
												strokeLinecap="round"
												strokeDasharray="5 3"
												filter="url(#glowEffect)"
											/>
										)}

										{/* Data points for both lines - adjusted scale */}
										{chartData && chartData.map((d, i) => {
											const x = chartData.length > 1
												? (i / (chartData.length - 1)) * 380 + 10
												: 200; // Center if only one point
											const yStress = 190 - d.stress * 17;
											const yEnergy = 190 - d.energy * 17;
											return (
												<g key={i}>
													{/* Energy points */}
													{i === chartData.length - 1 && (
														<circle
															cx={x}
															cy={yEnergy}
															r="12"
															fill="url(#energyGradient)"
															opacity="0.3"
														>
															<animate
																attributeName="r"
																values="8;12;8"
																dur="2s"
																repeatCount="indefinite"
															/>
															<animate
																attributeName="opacity"
																values="0.5;0.2;0.5"
																dur="2s"
																repeatCount="indefinite"
															/>
														</circle>
													)}
													<circle
														cx={x}
														cy={yEnergy}
														r="5"
														fill="#ffffff"
														stroke="url(#energyGradient)"
														strokeWidth="2"
														style={{ cursor: "pointer" }}
													>
														<animate
															attributeName="r"
															values="5;7;5"
															dur="0.3s"
															begin="mouseover"
														/>
													</circle>

													{/* Stress points */}
													{i === chartData.length - 1 && (
														<circle
															cx={x}
															cy={yStress}
															r="12"
															fill="url(#stressGradient)"
															opacity="0.3"
														>
															<animate
																attributeName="r"
																values="8;12;8"
																dur="2s"
																repeatCount="indefinite"
															/>
															<animate
																attributeName="opacity"
																values="0.5;0.2;0.5"
																dur="2s"
																repeatCount="indefinite"
															/>
														</circle>
													)}
													<circle
														cx={x}
														cy={yStress}
														r="5"
														fill="#ffffff"
														stroke="url(#stressGradient)"
														strokeWidth="2"
														style={{ cursor: "pointer" }}
													>
														<animate
															attributeName="r"
															values="5;7;5"
															dur="0.3s"
															begin="mouseover"
														/>
													</circle>

													{/* Tooltips - positioned below when near top */}
													<g opacity="0">
														<set
															attributeName="opacity"
															to="1"
															begin="mouseover"
															end="mouseout"
														/>
														{(() => {
															const minY = Math.min(yStress, yEnergy);
															const showBelow = minY < 50; // If point is in top 50px, show tooltip below
															const tooltipY = showBelow
																? Math.max(yStress, yEnergy) + 10
																: minY - 45;
															return (
																<>
																	<rect
																		x={x - 40}
																		y={tooltipY}
																		width="80"
																		height="35"
																		rx="4"
																		fill="#1f2937"
																		opacity="0.9"
																	/>
																	<text
																		x={x}
																		y={tooltipY + 17}
																		textAnchor="middle"
																		fill="white"
																		fontSize="10"
																		fontWeight="600"
																	>
																		S: {d.stress} | E: {d.energy}
																	</text>
																	<text
																		x={x}
																		y={tooltipY + 29}
																		textAnchor="middle"
																		fill="white"
																		fontSize="9"
																	>
																		{d.date}
																	</text>
																</>
															);
														})()}
													</g>
												</g>
											);
										})}
									</svg>
								);
							})()}
						</div>

						{/* X-axis labels */}
						<div className="absolute bottom-0 left-20 right-4 flex justify-between text-xs text-gray-600 font-medium mt-2">
							{(() => {
								const chartData =
									savedReflections.length > 0
										? savedReflections
												.filter(
													(r) =>
														r.data.stress_level ||
														r.data.stressLevel ||
														r.data.energy_level ||
														r.data.energyLevel ||
														r.data.physical_energy,
												)
												.sort(
													(a, b) =>
														new Date(a.timestamp).getTime() -
														new Date(b.timestamp).getTime(),
												)
												.slice(-7)
												.map((r) =>
													new Date(r.timestamp).toLocaleDateString("en-US", {
														weekday: "short",
													}),
												)
										: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

								return chartData.map((day, i) => <span key={i}>{day}</span>);
							})()}
						</div>

						{/* Enhanced Legend with Current Stats */}
						<div className="absolute top-4 right-4 bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg border border-gray-100">
							<div className="flex items-center gap-2 mb-3">
								<div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
								<p className="text-xs font-semibold text-gray-700">
									Live Tracking
								</p>
							</div>

							{/* Current Values */}
							<div className="space-y-2 mb-3">
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500"></div>
										<span className="text-[10px] font-medium text-gray-600">
											Stress
										</span>
									</div>
									<span className="text-sm font-bold text-red-600">
										{(() => {
											// First try burnoutData (from burnout assessments table)
											const lastBurnout = burnoutData && burnoutData.length > 0
												? burnoutData[burnoutData.length - 1]
												: null;
											console.log("🔍 Stress display - burnoutData:", burnoutData);
											console.log("🔍 Stress display - lastBurnout:", lastBurnout);
											console.log("🔍 Stress display - stress_level:", lastBurnout?.stress_level);
											if (lastBurnout?.stress_level) {
												return `${lastBurnout.stress_level}/10`;
											}
											// Fallback to reflection data - sort by timestamp to get most recent
											const reflectionsWithStress = savedReflections
												.filter(
													(r) => r.data.stress_level || r.data.stressLevel,
												)
												.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
											const lastReflection = reflectionsWithStress[0];
											console.log("🔍 Stress display - all reflections count:", savedReflections.length);
											console.log("🔍 Stress display - reflections with stress:", reflectionsWithStress.length);
											console.log("🔍 Stress display - most recent reflection:", lastReflection);
											return lastReflection
												? `${lastReflection.data.stress_level || lastReflection.data.stressLevel}/10`
												: "3/10";
										})()}
									</span>
								</div>
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500"></div>
										<span className="text-[10px] font-medium text-gray-600">
											Energy
										</span>
									</div>
									<span className="text-sm font-bold text-green-600">
										{(() => {
											// First try burnoutData (from burnout assessments table)
											const lastBurnout = burnoutData && burnoutData.length > 0
												? burnoutData[burnoutData.length - 1]
												: null;
											if (lastBurnout?.energy_level) {
												return `${lastBurnout.energy_level}/10`;
											}
											// Fallback to reflection data - sort by timestamp to get most recent
											const reflectionsWithEnergy = savedReflections
												.filter(
													(r) =>
														r.data.energy_level ||
														r.data.energyLevel ||
														r.data.physical_energy,
												)
												.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
											const lastReflection = reflectionsWithEnergy[0];
											console.log("🔍 Energy display - reflections with energy:", reflectionsWithEnergy.length);
											console.log("🔍 Energy display - most recent reflection:", lastReflection);
											return lastReflection
												? `${lastReflection.data.energy_level || lastReflection.data.energyLevel || lastReflection.data.physical_energy}/10`
												: "8/10";
										})()}
									</span>
								</div>
							</div>

							{/* Trend Indicators */}
							<div className="p-2 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
								<p className="text-[10px] text-gray-600 font-medium mb-1">
									Balance Score
								</p>
								<div className="flex items-center gap-2">
									<div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
										<div
											className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
											style={{
												width: `${(() => {
													// First try burnoutData
													const lastBurnout = burnoutData && burnoutData.length > 0
														? burnoutData[burnoutData.length - 1]
														: null;
													let stress = 3;
													let energy = 8;

													if (lastBurnout?.stress_level && lastBurnout?.energy_level) {
														stress = lastBurnout.stress_level;
														energy = lastBurnout.energy_level;
													} else {
														// Fallback to reflections
														stress = savedReflections
															.filter(
																(r) =>
																	r.data.stress_level || r.data.stressLevel,
															)
															.slice(-1)[0]?.data.stress_level || 3;
														energy = savedReflections
															.filter(
																(r) =>
																	r.data.energy_level || r.data.energyLevel,
															)
															.slice(-1)[0]?.data.energy_level || 8;
													}

													return Math.max(
														0,
														Math.min(100, (10 - stress + energy) * 5),
													);
												})()}%`,
											}}
										/>
									</div>
									<span className="text-xs font-bold text-gray-700">
										{(() => {
											// First try burnoutData
											const lastBurnout = burnoutData && burnoutData.length > 0
												? burnoutData[burnoutData.length - 1]
												: null;
											let stress = 3;
											let energy = 8;

											if (lastBurnout?.stress_level && lastBurnout?.energy_level) {
												stress = lastBurnout.stress_level;
												energy = lastBurnout.energy_level;
											} else {
												// Fallback to reflections
												stress = savedReflections
													.filter(
														(r) =>
															r.data.stress_level || r.data.stressLevel,
													)
													.slice(-1)[0]?.data.stress_level || 3;
												energy = savedReflections
													.filter(
														(r) =>
															r.data.energy_level || r.data.energyLevel,
													)
													.slice(-1)[0]?.data.energy_level || 8;
											}

											const balance = (10 - stress + energy) / 2;
											return balance >= 7
												? "Great"
												: balance >= 5
													? "Good"
													: "Needs Attention";
										})()}
									</span>
								</div>
							</div>

							{/* Quick Stats */}
							<div className="mt-3 pt-3 border-t border-gray-100">
								<p className="text-[10px] font-semibold text-gray-700 mb-2">
									Optimal Ranges
								</p>
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-red-400"></div>
										<span className="text-[10px] text-gray-600">
											Stress: Lower is better (1-3)
										</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-green-400"></div>
										<span className="text-[10px] text-gray-600">
											Energy: Higher is better (7-10)
										</span>
									</div>
								</div>
							</div>

						</div>
					</div>

					{/* Updated Legend below chart */}
					<div className="flex items-center justify-between mt-4">
						<div className="text-left">
							<p className="text-[9px] text-gray-500 italic">
								Data from: Wellness Check-Ins (Reflection Studio)
							</p>
						</div>
						<div className="flex items-center space-x-6">
							<div className="flex items-center">
								<div className="w-4 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mr-2"></div>
								<span className="text-sm text-gray-600 font-medium">
									Stress Level (dashed)
								</span>
							</div>
							<div className="flex items-center">
								<div className="w-4 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-2"></div>
								<span className="text-sm text-gray-600 font-medium">
									Energy Level (solid)
								</span>
							</div>
						</div>
					</div>
				</section>


				{/* Wellness Trend Chart */}
				<section
					className="rounded-2xl p-8"
					aria-labelledby="wellness-trend-heading"
					style={{
						backgroundColor: "var(--bg-card)",
						boxShadow:
							"0 10px 30px rgba(92, 127, 79, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05)",
						border: "1px solid rgba(45, 95, 63, 0.2)",
					}}
				>
					<div className="flex items-center justify-between mb-6">
						<div>
							<h2
								id="wellness-trend-heading"
								className="text-2xl font-bold"
								style={{ color: "var(--primary-900)" }}
							>
								Daily Burnout Trends
							</h2>
							<p className="text-sm text-gray-600 mt-1">
								Track your burnout potential over the last 7 days with daily assessments (once every 12 hours).
								{getAggregatedData().length > 0 &&
									` (${getAggregatedData().length} ${getAggregatedData().length === 1 ? 'day' : 'days'} recorded)`}
							</p>
						</div>
						<div className="flex gap-2">
							<button
								onClick={() => exportBurnoutData()}
								className="p-2 bg-gray-100 hover:bg-green-500 hover:bg-opacity-20 rounded-lg transition-all group"
								title="Export data"
							>
								<Download className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
							</button>
						</div>
					</div>

					{/* Chart area */}
					<div
						className="rounded-xl p-6 h-80 relative overflow-hidden"
						style={{
							background: "linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)",
							border: "1px solid rgba(45, 95, 63, 0.2)",
						}}
					>
						{/* Always show the graph structure */}
						{/* Y-axis labels with burnout risk percentages */}
						<div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs font-medium py-4 z-10">
								<div className="flex items-center gap-1">
									<span className="text-red-700">100%</span>
									<span className="text-red-700 text-[10px]">Critical</span>
								</div>
								<div className="flex items-center gap-1">
									<span className="text-orange-600">80%</span>
									<span className="text-orange-600 text-[10px]">High Risk</span>
								</div>
								<div className="flex items-center gap-1">
									<span className="text-yellow-600">60%</span>
									<span className="text-yellow-600 text-[10px]">Elevated</span>
								</div>
								<div className="flex items-center gap-1">
									<span className="text-lime-600">40%</span>
									<span className="text-lime-600 text-[10px]">Moderate</span>
								</div>
								<div className="flex items-center gap-1">
									<span className="text-green-600">20%</span>
									<span className="text-green-600 text-[10px]">Low</span>
								</div>
								<div className="flex items-center gap-1">
									<span className="text-green-700">0%</span>
									<span className="text-green-700 text-[10px]">Low Risk</span>
								</div>
							</div>

							{/* Chart content */}
							<div className="ml-24 mr-4 h-full relative">
								<svg
									key={`burnout-chart-${burnoutData?.length || 0}-${JSON.stringify(burnoutData)}`}
									className="w-full h-full"
									viewBox="0 0 400 200"
									style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
								>
									{/* Gradient definitions */}
									<defs>
										<linearGradient
											id="burnoutGradient"
											x1="0%"
											y1="0%"
											x2="0%"
											y2="100%"
										>
											<stop
												offset="0%"
												style={{ stopColor: "#ef4444", stopOpacity: 0.8 }}
											/>
											<stop
												offset="50%"
												style={{ stopColor: "#eab308", stopOpacity: 0.6 }}
											/>
											<stop
												offset="100%"
												style={{ stopColor: "#10b981", stopOpacity: 0.8 }}
											/>
										</linearGradient>
										<linearGradient
											id="lineGradient"
											x1="0%"
											y1="0%"
											x2="100%"
											y2="0%"
										>
											<stop
												offset="0%"
												style={{ stopColor: "#10b981", stopOpacity: 0.8 }}
											/>
											<stop
												offset="50%"
												style={{ stopColor: "#3b82f6", stopOpacity: 1 }}
											/>
											<stop
												offset="100%"
												style={{ stopColor: "#8b5cf6", stopOpacity: 0.8 }}
											/>
										</linearGradient>
										<filter id="glow">
											<feGaussianBlur stdDeviation="4" result="coloredBlur" />
											<feMerge>
												<feMergeNode in="coloredBlur" />
												<feMergeNode in="SourceGraphic" />
											</feMerge>
										</filter>
									</defs>

									{/* Grid lines with dashes */}
									{[0, 40, 80, 120, 160].map((y) => (
										<line
											key={y}
											x1="0"
											y1={y}
											x2="400"
											y2={y}
											stroke="#e5e7eb"
											strokeWidth="0.5"
											strokeDasharray="2 4"
											opacity="0.5"
										/>
									))}

									{/* Vertical grid lines for days */}
									{[57, 114, 171, 228, 285, 342].map((x) => (
										<line
											key={x}
											x1={x}
											y1="0"
											y2="200"
											stroke="#e5e7eb"
											strokeWidth="0.5"
											strokeDasharray="2 4"
											opacity="0.3"
										/>
									))}

									{/* Wellness zones with gradient */}
									<rect
										x="0"
										y="0"
										width="400"
										height="40"
										fill="#ef4444"
										opacity="0.05"
									/>
									<rect
										x="0"
										y="40"
										width="400"
										height="40"
										fill="#f97316"
										opacity="0.05"
									/>
									<rect
										x="0"
										y="80"
										width="400"
										height="40"
										fill="#eab308"
										opacity="0.05"
									/>
									<rect
										x="0"
										y="120"
										width="400"
										height="40"
										fill="#84cc16"
										opacity="0.05"
									/>
									<rect
										x="0"
										y="160"
										width="400"
										height="40"
										fill="#10b981"
										opacity="0.05"
									/>

									{/* Area fill under the curve */}
									<path
										d={(() => {
											const data = getAggregatedData();
											if (data.length > 0) {
												const displayData = data.slice(-30); // Match other renderings
												const points = displayData.map((d, i) => {
													const x =
														(i / Math.max(displayData.length - 1, 1)) * 380 +
														10;
													// totalScore is 0-10, convert to burnout risk percentage
													const burnoutRisk = (d.totalScore / 10) * 100;
													// Higher burnout (100%) should be at top (y=190), lower burnout (0%) at bottom (y=10)
													// Use 180 range instead of 190 to leave 10px padding at bottom
													const y = 190 - (burnoutRisk / 100) * 180;
													return `L ${x},${y}`;
												});

												if (displayData.length === 0) return "";

												const firstPoint = displayData[0];
												const lastPoint = displayData[displayData.length - 1];
												const firstBurnoutRisk =
													(firstPoint.totalScore / 10) * 100;
												const firstY = 190 - (firstBurnoutRisk / 100) * 180;
												const lastX =
													((displayData.length - 1) /
														Math.max(displayData.length - 1, 1)) *
														380 +
													10;

												return `M 10,${firstY} ${points.join(" ")} L ${lastX},200 L 10,200 Z`;
											} else {
												// No data - return empty path
												return "";
											}
										})()}
										fill="url(#burnoutGradient)"
										opacity="0.2"
									/>

									{/* Burnout trend line with smooth curve */}
									<path
										d={(() => {
											const data = getAggregatedData();
											if (data.length > 0) {
												// Use all data points, not just last 7
												const displayData = data.slice(-30); // Match the data points rendering
												const points = displayData.map((d, i) => {
													const x =
														(i / Math.max(displayData.length - 1, 1)) * 380 +
														10;
													// totalScore is 0-10, convert to burnout risk percentage
													const burnoutRisk = (d.totalScore / 10) * 100;
													// Higher burnout (100%) should be at top (y=190), lower burnout (0%) at bottom (y=10)
													// Use 180 range instead of 190 to leave 10px padding at bottom
													const y = 190 - (burnoutRisk / 100) * 180;
													return { x, y };
												});

												if (points.length === 0) return "";
												if (points.length === 1)
													return `M ${points[0].x},${points[0].y}`;

												// Create a smooth line through all points
												let path = `M ${points[0].x},${points[0].y}`;

												if (points.length === 2) {
													// For just 2 points, draw a straight line
													path += ` L ${points[1].x},${points[1].y}`;
												} else {
													// For 3+ points, use quadratic curves
													for (let i = 1; i < points.length; i++) {
														const cx = (points[i - 1].x + points[i].x) / 2;
														path += ` Q ${cx},${points[i - 1].y} ${points[i].x},${points[i].y}`;
													}
												}
												return path;
											} else {
												// No data - return empty path
												return "";
											}
										})()}
										fill="none"
										stroke="url(#lineGradient)"
										strokeWidth="3"
										strokeLinecap="round"
										filter="url(#glow)"
									/>

									{/* Data points with animations */}
									{getAggregatedData().length > 0 &&
										getAggregatedData()
											.slice(-30)
											.map((d, i) => {
												const x =
													(i /
														Math.max(
															getAggregatedData().slice(-30).length - 1,
															1,
														)) *
														380 +
													10;
												// totalScore is 0-10, convert to burnout risk percentage
												const burnoutRisk = Math.round(
													(d.totalScore / 10) * 100,
												);
												// Higher burnout (100%) should be at top (y=190), lower burnout (0%) at bottom (y=10)
												// Use 180 range instead of 190 to leave 10px padding at bottom
												const y = 190 - (burnoutRisk / 100) * 180;

												// Format date for tooltip (parse without timezone conversion)
												const [year, month, day] = d.date.split("-");
												const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
												const formattedDate = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;

												// Position tooltip below point if burnout risk is 70% or higher (high burnout)
												const tooltipBelow = burnoutRisk >= 70;
												const tooltipY = tooltipBelow ? y + 15 : y - 50;
												const dateTextY = tooltipBelow ? y + 33 : y - 32;
												const percentTextY = tooltipBelow ? y + 45 : y - 20;

												return (
													<g key={i}>
														{/* Pulse animation for current day */}
														{i ===
															getAggregatedData().slice(-30).length - 1 && (
															<circle
																cx={x}
																cy={y}
																r="12"
																fill="url(#lineGradient)"
																opacity="0.3"
															>
																<animate
																	attributeName="r"
																	values="8;12;8"
																	dur="2s"
																	repeatCount="indefinite"
																/>
																<animate
																	attributeName="opacity"
																	values="0.5;0.2;0.5"
																	dur="2s"
																	repeatCount="indefinite"
																/>
															</circle>
														)}

														{/* Hover tooltip group */}
														<g className="tooltip-group">
															{/* Hover tooltip background */}
															<rect
																x={x - 35}
																y={tooltipY}
																width="70"
																height="36"
																rx="4"
																fill="#1f2937"
																opacity="0"
																className="tooltip-bg"
																style={{ pointerEvents: "none" }}
															/>

															{/* Hover tooltip date */}
															<text
																x={x}
																y={dateTextY}
																textAnchor="middle"
																fill="#9ca3af"
																fontSize="10"
																opacity="0"
																className="tooltip-text"
																style={{ pointerEvents: "none" }}
															>
																{formattedDate}
															</text>

															{/* Hover tooltip wellness percentage */}
															<text
																x={x}
																y={percentTextY}
																textAnchor="middle"
																fill="white"
																fontSize="12"
																fontWeight="600"
																opacity="0"
																className="tooltip-text"
																style={{ pointerEvents: "none" }}
															>
																{burnoutRisk}% Risk
															</text>
														</g>

														{/* Main data point - must be after tooltip for hover to work */}
														<circle
															cx={x}
															cy={y}
															r="5"
															fill="#ffffff"
															stroke="url(#lineGradient)"
															strokeWidth="2"
															style={{ cursor: "pointer" }}
															onMouseEnter={(e) => {
																const tooltipBg =
																	e.currentTarget.parentElement?.querySelector(
																		".tooltip-bg",
																	);
																const tooltipText =
																	e.currentTarget.parentElement?.querySelector(
																		".tooltip-text",
																	);
																if (tooltipBg)
																	tooltipBg.setAttribute("opacity", "0.95");
																if (tooltipText)
																	tooltipText.setAttribute("opacity", "1");
															}}
															onMouseLeave={(e) => {
																const tooltipBg =
																	e.currentTarget.parentElement?.querySelector(
																		".tooltip-bg",
																	);
																const tooltipText =
																	e.currentTarget.parentElement?.querySelector(
																		".tooltip-text",
																	);
																if (tooltipBg)
																	tooltipBg.setAttribute("opacity", "0");
																if (tooltipText)
																	tooltipText.setAttribute("opacity", "0");
															}}
														/>
													</g>
												);
											})}
								</svg>
							</div>

							{/* Enhanced Legend with Stats */}
							<div className="absolute top-4 right-4 bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg border border-gray-100">
								<div className="flex items-center gap-2 mb-3">
									<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
									<p className="text-xs font-semibold text-gray-700">
										Live Burnout Tracking
									</p>
								</div>

								{/* Current Status */}
								<div className="mb-3 p-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
									<p className="text-[10px] text-gray-600 font-medium mb-1">
										Today's Burnout Risk
									</p>
									<p className="text-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
										{getAggregatedData().length > 0
											? `${Math.round((getAggregatedData()[getAggregatedData().length - 1].totalScore / 10) * 100)}%`
											: "--"}
									</p>
								</div>

								{/* Trend Indicator */}
								<div className="flex items-center gap-2 mb-3">
									{(() => {
										const aggregatedData = getAggregatedData();
										if (aggregatedData.length > 1) {
											const latest = aggregatedData[aggregatedData.length - 1];
											const previous = aggregatedData[aggregatedData.length - 2];

											if (latest?.totalScore !== undefined && previous?.totalScore !== undefined) {
												if (latest.totalScore < previous.totalScore) {
													return (
														<div className="flex items-center gap-1 text-green-600">
															<svg width="12" height="12" viewBox="0 0 12 12">
																<path d="M6 3L9 7H3Z" fill="currentColor" />
															</svg>
															<span className="text-[10px] font-medium">Improving</span>
														</div>
													);
												} else if (latest.totalScore > previous.totalScore) {
													return (
														<div className="flex items-center gap-1 text-red-600">
															<svg width="12" height="12" viewBox="0 0 12 12">
																<path d="M6 9L9 5H3Z" fill="currentColor" />
															</svg>
															<span className="text-[10px] font-medium">Getting Worse</span>
														</div>
													);
												} else {
													return (
														<div className="flex items-center gap-1 text-blue-600">
															<svg width="12" height="12" viewBox="0 0 12 12">
																<path
																	d="M3 6H9"
																	stroke="currentColor"
																	strokeWidth="2"
																/>
															</svg>
															<span className="text-[10px] font-medium">Stable</span>
														</div>
													);
												}
											}
										}
										return null;
									})()}
								</div>

								{/* Wellness Zones */}
								<div className="space-y-1">
									<p className="text-[10px] font-semibold text-gray-700 mb-1">
										Burnout Risk Zones
									</p>
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-green-500"></div>
										<span className="text-[10px] text-gray-600">
											0-20% Low Risk
										</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-lime-500"></div>
										<span className="text-[10px] text-gray-600">
											20-40% Moderate
										</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-yellow-500"></div>
										<span className="text-[10px] text-gray-600">
											40-60% Elevated
										</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-orange-500"></div>
										<span className="text-[10px] text-gray-600">
											60-80% High Risk
										</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-red-500"></div>
										<span className="text-[10px] text-gray-600">
											80-100% Critical
										</span>
									</div>
								</div>
							</div>
					</div>

					{burnoutData && burnoutData.length > 0 && (
						<div className="mt-6 grid grid-cols-4 gap-4">
							<div className="bg-gray-50 p-4 rounded-lg">
								<p className="text-xs text-gray-600 mb-1">Current Level</p>
								<p className="text-lg font-bold text-gray-900">
									{burnoutData?.[burnoutData?.length - 1]?.riskLevel || "N/A"}
								</p>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg">
								<p className="text-xs text-gray-600 mb-1">7-Day Average</p>
								<p className="text-lg font-bold text-gray-900">
									{(
										burnoutData
											.slice(-7)
											.reduce((sum, d) => sum + d.totalScore, 0) /
										Math.min(burnoutData.length, 7)
									).toFixed(1)}
								</p>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg">
								<p className="text-xs text-gray-600 mb-1">Trend</p>
								<p className="text-lg font-bold text-gray-900">
									{burnoutData.length >= 7 &&
										(burnoutData
											.slice(-7)
											.reduce((sum, d) => sum + d.totalScore, 0) /
											7 <
										burnoutData
											.slice(-14, -7)
											.reduce((sum, d) => sum + d.totalScore, 0) /
											7
											? "↓ Improving"
											: "↑ Increasing")}
								</p>
							</div>
							<div className="bg-gray-50 p-4 rounded-lg">
								<p className="text-xs text-gray-600 mb-1">Days Tracked</p>
								<p className="text-lg font-bold text-gray-900">
									{burnoutData.length}
								</p>
							</div>
						</div>
					)}

					{/* Data Source Indicator */}
					<div className="mt-6 text-left">
						<p className="text-[9px] text-gray-500 italic">
							Data from: Daily Burnout Checks (Homepage)
						</p>
					</div>

					{/* Scoring Explanation */}
					<div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
						<p className="text-xs text-green-900 font-semibold mb-1">
							How Scoring Works
						</p>
						<p className="text-[10px] text-green-800 leading-relaxed">
							The assessment has 5 questions with options ranging from best (top) to worst (bottom).
							Selecting all the <strong>best options</strong> results in <strong>0% burnout risk</strong> (low risk).
							Selecting all the <strong>worst options</strong> results in <strong>100% burnout risk</strong> (critical).
							Your score reflects your choices: better answers = lower burnout risk percentage. Assessments can be taken once every 12 hours.
						</p>
					</div>
				</section>

				{/* Growth Snapshot */}
				<div>
					<div className="flex items-center mb-2">
						<div
							className="p-2 rounded-lg mr-3"
							style={{ backgroundColor: "rgba(92, 127, 79, 0.15)" }}
						>
							<TrendingUp
								className="h-5 w-5"
								aria-hidden="true"
								style={{ color: "#1A3D26" }}
							/>
						</div>
						<div className="flex-1">
							<h2 className="text-2xl font-bold" style={{ color: "#0D3A14" }}>
								Growth Snapshot
							</h2>
							<p className="text-sm text-gray-600 mt-1">
								A quick read of mind, body, heart, and work based on today's check-in.
							</p>
						</div>
						<span className="text-sm ml-auto" style={{ color: "#525252" }}>
							{savedReflections.length} total reflections •{" "}
							{
								savedReflections.filter((r) => {
									const date = new Date(r.date);
									const weekAgo = new Date();
									weekAgo.setDate(weekAgo.getDate() - 7);
									return date > weekAgo;
								}).length
							}{" "}
							this week
						</span>
					</div>
					<div className="mb-6"></div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
						<div
							className="rounded-xl p-5 transition-all"
							style={{
								backgroundColor: "var(--bg-card)",
								border: "2px solid var(--primary-600)",
								boxShadow: "0 4px 12px rgba(45, 95, 63, 0.2)",
							}}
						>
							<div
								className="flex items-center text-sm font-semibold mb-2"
								style={{ color: "var(--primary-900)" }}
							>
								<Star
									className="h-4 w-4 mr-2"
									aria-hidden="true"
									style={{ color: "#1A3D26" }}
								/>
								Reflection Streak
							</div>
							<div
								className="text-2xl font-bold mb-1"
								style={{ color: "#0D3A14" }}
							>
								{reflectionStreak === null
									? "Loading..."
									: reflectionStreak === 0
										? "0 days"
										: reflectionStreak === 1
											? "1 day"
											: `${reflectionStreak} days`}
							</div>
							<div className="text-sm" style={{ color: "#0D3A14" }}>
								{savedReflections.length > 0
									? "Keep it going!"
									: "Start your streak today"}
							</div>
						</div>

						<div
							className="rounded-xl p-5 transition-all"
							style={{
								backgroundColor: "var(--bg-card)",
								border: "2px solid #87CEEB",
								boxShadow: "0 4px 12px rgba(135, 206, 235, 0.2)",
							}}
						>
							<div
								className="flex items-center text-sm font-semibold mb-2"
								style={{ color: "#4682B4" }}
							>
								<Activity
									className="h-4 w-4 mr-2"
									aria-hidden="true"
									style={{ color: "#87CEEB" }}
								/>
								Confidence Level
							</div>
							<div
								className="text-2xl font-bold mb-1"
								style={{ color: "#0D3A14" }}
							>
								{todayConfidence !== null
									? `${todayConfidence}/10`
									: "--"}
							</div>
							<div className="text-sm" style={{ color: "#4682B4" }}>
								{todayConfidence !== null
									? todayConfidence >= 8
										? "Feeling strong"
										: todayConfidence >= 6
											? "Building momentum"
											: todayConfidence >= 4
												? "Room to grow"
												: "Be kind to yourself"
									: "Check in today"}
							</div>
						</div>

						<div
							className="rounded-xl p-5 transition-all"
							style={{
								backgroundColor: "var(--bg-card)",
								border: "2px solid #C8B8DB",
								boxShadow: "0 4px 12px rgba(200, 184, 219, 0.2)",
							}}
						>
							<div
								className="flex items-center text-sm font-semibold mb-2"
								style={{ color: "#8B7AA8" }}
							>
								<BarChart3
									className="h-4 w-4 mr-2"
									aria-hidden="true"
									style={{ color: "#C8B8DB" }}
								/>
								Avg Burnout Score
							</div>
							<div
								className="text-2xl font-bold mb-1"
								style={{ color: "#0D3A14" }}
							>
								{(() => {
									// Use the same aggregated data from the burnout chart
									const aggregatedData = getAggregatedData();
									if (!aggregatedData || aggregatedData.length === 0) return "--";

									// Calculate average burnout score for last 30 days (or all available data if less)
									const last30Days = aggregatedData.slice(-30);
									if (last30Days.length === 0) return "--";

									// Calculate average (totalScore is already 0-10 scale)
									const avgScore = last30Days.reduce((sum, d) => sum + d.totalScore, 0) / last30Days.length;
									// Convert to percentage (0-100%)
									const burnoutPercentage = Math.round((avgScore / 10) * 100);

									return `${burnoutPercentage}%`;
								})()}
							</div>
							<div className="text-sm" style={{ color: "#8B7AA8" }}>
								{(() => {
									const aggregatedData = getAggregatedData();
									if (!aggregatedData || aggregatedData.length === 0) return "No data yet";

									const last30Days = aggregatedData.slice(-30);
									if (last30Days.length === 0) return "No data yet";

									const avgScore = last30Days.reduce((sum, d) => sum + d.totalScore, 0) / last30Days.length;
									const burnoutPercentage = (avgScore / 10) * 100;

									// Match the zones from the Daily Burnout Trend legend
									if (burnoutPercentage <= 20) return "Excellent range";
									if (burnoutPercentage <= 40) return "Good range";
									if (burnoutPercentage <= 60) return "Moderate range";
									if (burnoutPercentage <= 80) return "Alert range";
									return "Critical range";
								})()}
							</div>
						</div>

						<div
							className="rounded-xl p-5 transition-all"
							style={{
								backgroundColor: "var(--bg-card)",
								border: "2px solid #F4A460",
								boxShadow: "0 4px 12px rgba(244, 164, 96, 0.2)",
							}}
						>
							<div
								className="flex items-center text-sm font-semibold mb-2"
								style={{ color: "#D2691E" }}
							>
								<Target
									className="h-4 w-4 mr-2"
									aria-hidden="true"
									style={{ color: "#F4A460" }}
								/>
								Total Activities
							</div>
							<div
								className="text-2xl font-bold mb-1"
								style={{ color: "#0D3A14" }}
							>
								{totalActivities}
							</div>
							<div className="text-sm" style={{ color: "#D2691E" }}>
								{totalActivities === 0
									? "Start your journey"
									: totalActivities < 10
										? "Building momentum"
										: totalActivities < 50
											? "Great progress"
											: totalActivities < 100
												? "Consistent practice"
												: "Growth champion"}
							</div>
						</div>
					</div>

					{/* Data Source Indicators */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
						<div className="text-left">
							<p className="text-[9px] text-gray-500 italic">
								Data from: Daily activities
							</p>
						</div>
						<div className="text-left">
							<p className="text-[9px] text-gray-500 italic">
								Data from: Reflection Studio
							</p>
						</div>
						<div className="text-left">
							<p className="text-[9px] text-gray-500 italic">
								Data from: Daily Burnout Checks
							</p>
						</div>
						<div className="text-left">
							<p className="text-[9px] text-gray-500 italic">
								Data from: All activities
							</p>
						</div>
					</div>
				</div>

				{/* Bottom section boxes - REMOVED */}
				{/* Previously contained Recovery Habits, Teamwork Check, and Values & Tough Calls */}
				<div className="hidden">
					{/* Recovery Habits */}
					<section
						className="rounded-2xl p-6"
						aria-labelledby="recovery-habits-heading"
						style={{
							backgroundColor: "var(--bg-card)",
							boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
							border: "1px solid #E8E5E0",
						}}
					>
						<h3
							id="recovery-habits-heading"
							className="text-lg font-bold mb-5"
							style={{ color: "var(--primary-900)" }}
						>
							Recovery Habits
						</h3>

						<div className="mb-5">
							<div className="flex justify-between text-sm mb-3">
								<span style={{ color: "#525252" }}>Recovery Balance Index</span>
								<span className="font-bold" style={{ color: "#0D3A14" }}>
									{(() => {
										// Calculate recovery balance based on breaks, sleep, and wellness checks
										const weekAgo = new Date();
										weekAgo.setDate(weekAgo.getDate() - 7);

										const recentBreaks = recoveryHabits.filter(
											(h) =>
												h.type === "break" && new Date(h.timestamp) > weekAgo,
										).length;
										const recentSleep = recoveryHabits.filter(
											(h) =>
												h.type === "sleep" && new Date(h.timestamp) > weekAgo,
										);
										const goodSleep = recentSleep.filter(
											(h) => !h.value?.includes("poor"),
										).length;

										// Calculate score: breaks (up to 7) + good sleep (up to 7) + wellness checks
										const breakScore = Math.min(recentBreaks, 7) * 7; // Max 49%
										const sleepScore = Math.min(goodSleep, 7) * 7; // Max 49%
										const wellnessScore =
											savedReflections.filter(
												(r) =>
													r.type === "Wellness Check-in" &&
													new Date(r.timestamp) > weekAgo,
											).length * 2; // Max ~14%

										return Math.min(
											breakScore + sleepScore + wellnessScore,
											100,
										);
									})()}%
								</span>
							</div>
							<div
								className="w-full rounded-full h-2.5"
								style={{ backgroundColor: "#F0EDE8" }}
							>
								<div
									className="h-2.5 rounded-full"
									style={{
										width: `${(() => {
											const weekAgo = new Date();
											weekAgo.setDate(weekAgo.getDate() - 7);

											const recentBreaks = recoveryHabits.filter(
												(h) =>
													h.type === "break" && new Date(h.timestamp) > weekAgo,
											).length;
											const recentSleep = recoveryHabits.filter(
												(h) =>
													h.type === "sleep" && new Date(h.timestamp) > weekAgo,
											);
											const goodSleep = recentSleep.filter(
												(h) => !h.value?.includes("poor"),
											).length;

											const breakScore = Math.min(recentBreaks, 7) * 7;
											const sleepScore = Math.min(goodSleep, 7) * 7;
											const wellnessScore =
												savedReflections.filter(
													(r) =>
														r.type === "Wellness Check-in" &&
														new Date(r.timestamp) > weekAgo,
												).length * 2;

											return Math.min(
												breakScore + sleepScore + wellnessScore,
												100,
											);
										})()}%`,
										background:
											"linear-gradient(90deg, #1A3D26 0%, #0F2818 100%)",
									}}
								></div>
							</div>
						</div>

						<div>
							<h4 className="font-semibold mb-3" style={{ color: "#0D3A14" }}>
								{recoveryHabits.length > 0
									? "Recent Habits:"
									: "Top Early Signals:"}
							</h4>
							<div className="space-y-3">
								{recoveryHabits.length > 0 ? (
									<>
										{(() => {
											// Get break frequency
											const recentBreaks = recoveryHabits.filter(
												(h) =>
													h.type === "break" &&
													new Date(h.timestamp).getTime() >
														Date.now() - 7 * 24 * 60 * 60 * 1000,
											).length;
											const sleepHabits = recoveryHabits
												.filter((h) => h.type === "sleep")
												.slice(0, 3);

											return (
												<>
													{recentBreaks > 0 && (
														<div
															className="flex items-center text-sm p-2 rounded-lg"
															style={{
																backgroundColor: "rgba(34, 197, 94, 0.08)",
															}}
														>
															<CheckCircle
																className="h-4 w-4 mr-2"
																aria-hidden="true"
																style={{ color: "#5B9378" }}
															/>
															<span style={{ color: "#3A3A3A" }}>
																{recentBreaks} breaks taken this week
															</span>
														</div>
													)}
													{sleepHabits.length > 0 && sleepHabits[0].value && (
														<div
															className="flex items-center text-sm p-2 rounded-lg"
															style={{
																backgroundColor: sleepHabits[0].value.includes(
																	"poor",
																)
																	? "rgba(255, 223, 0, 0.08)"
																	: "rgba(92, 127, 79, 0.08)",
															}}
														>
															{sleepHabits[0].value.includes("poor") ? (
																<AlertTriangle
																	className="h-4 w-4 mr-2"
																	style={{ color: "#DAA520" }}
																/>
															) : (
																<CheckCircle
																	className="h-4 w-4 mr-2"
																	style={{ color: "#1A3D26" }}
																/>
															)}
															<span style={{ color: "#3A3A3A" }}>
																Sleep: {sleepHabits[0].value}
															</span>
														</div>
													)}
												</>
											);
										})()}
									</>
								) : (
									<>
										<div
											className="flex items-center text-sm p-2 rounded-lg"
											style={{ backgroundColor: "rgba(255, 223, 0, 0.08)" }}
										>
											<AlertTriangle
												className="h-4 w-4 mr-2"
												aria-hidden="true"
												style={{ color: "#DAA520" }}
											/>
											<span style={{ color: "#3A3A3A" }}>
												No habits tracked yet
											</span>
										</div>
										<div
											className="flex items-center text-sm p-2 rounded-lg"
											style={{ backgroundColor: "rgba(92, 127, 79, 0.08)" }}
										>
											<Heart
												className="h-4 w-4 mr-2"
												aria-hidden="true"
												style={{ color: "var(--primary-800)" }}
											/>
											<span style={{ color: "#3A3A3A" }}>
												Start with a wellness check-in
											</span>
										</div>
									</>
								)}
							</div>
						</div>
					</section>

					{/* Teamwork Check */}
					<section
						className="rounded-2xl p-6"
						aria-labelledby="teamwork-check-heading"
						style={{
							backgroundColor: "var(--bg-card)",
							boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
							border: "1px solid #E8E5E0",
						}}
					>
						<h3
							id="teamwork-check-heading"
							className="text-lg font-bold mb-5"
							style={{ color: "var(--primary-900)" }}
						>
							Teamwork Check
						</h3>

						<div className="mb-5">
							<div className="flex justify-between text-sm mb-3">
								<span style={{ color: "#525252" }}>Agreements Fidelity</span>
								<span className="font-bold" style={{ color: "#0D3A14" }}>
									{(() => {
										// Calculate from teaming reflections
										const teamingReflections = savedReflections.filter(r =>
											r.type === "Teaming Reflection" || r.type === "Teaming Prep"
										);

										if (teamingReflections.length === 0) {
											return latestInsights?.teamwork?.agreementsFidelity || 88;
										}

										// Calculate based on recent teaming reflections
										const recentReflections = teamingReflections.slice(0, 5);
										const totalScore = recentReflections.reduce((sum, reflection) => {
											// Extract score from reflection data if available
											const data = reflection.data || {};
											const agreementScore = data.agreementScore ||
												(data.teamDynamics?.agreementLevel * 20) ||
												75; // Default to 75% if no specific score
											return sum + agreementScore;
										}, 0);

										return Math.round(totalScore / recentReflections.length);
									})()}%
								</span>
							</div>
							<div
								className="w-full rounded-full h-2.5"
								style={{ backgroundColor: "#F0EDE8" }}
							>
								<div
									className="h-2.5 rounded-full"
									style={{
										width: `${(() => {
											const teamingReflections = savedReflections.filter(r =>
												r.type === "Teaming Reflection" || r.type === "Teaming Prep"
											);

											if (teamingReflections.length === 0) {
												return latestInsights?.teamwork?.agreementsFidelity || 88;
											}

											const recentReflections = teamingReflections.slice(0, 5);
											const totalScore = recentReflections.reduce((sum, reflection) => {
												const data = reflection.data || {};
												const agreementScore = data.agreementScore ||
													(data.teamDynamics?.agreementLevel * 20) ||
													75;
												return sum + agreementScore;
											}, 0);

											return Math.round(totalScore / recentReflections.length);
										})()}%`,
										background:
											"linear-gradient(90deg, #5B9378 0%, #5B9378 100%)",
									}}
								></div>
							</div>
						</div>

						<div>
							<h4 className="font-semibold mb-3" style={{ color: "#0D3A14" }}>
								Top Drift Area:
							</h4>
							<div
								className="flex items-center text-sm p-2 rounded-lg"
								style={{ backgroundColor: "rgba(244, 164, 96, 0.08)" }}
							>
								<ChevronDown
									className="h-4 w-4 mr-2"
									aria-hidden="true"
									style={{ color: "#F4A460" }}
								/>
								<span style={{ color: "#3A3A3A" }}>
									{(() => {
										// Analyze teaming reflections for common drift areas
										const teamingReflections = savedReflections.filter(r =>
											r.type === "Teaming Reflection"
										);

										if (teamingReflections.length === 0) {
											return latestInsights?.teamwork?.topDriftArea || "Turn-taking balance";
										}

										// Count drift patterns from recent reflections
										const driftPatterns: Record<string, number> = {
											"Turn-taking balance": 0,
											"Communication clarity": 0,
											"Role boundaries": 0,
											"Decision timing": 0,
											"Process alignment": 0
										};

										teamingReflections.slice(0, 10).forEach(reflection => {
											const data = reflection.data || {};
											// Check for various drift indicators
											if (data.turnTaking === false || data.balance === "uneven") {
												driftPatterns["Turn-taking balance"]++;
											}
											if (data.clarity === "unclear" || data.communication === "poor") {
												driftPatterns["Communication clarity"]++;
											}
											if (data.boundaries === "blurred" || data.roles === "unclear") {
												driftPatterns["Role boundaries"]++;
											}
											if (data.timing === "delayed" || data.decisions === "postponed") {
												driftPatterns["Decision timing"]++;
											}
											if (data.process === "misaligned" || data.workflow === "disrupted") {
												driftPatterns["Process alignment"]++;
											}
										});

										// Find the most common drift area
										const topDrift = Object.entries(driftPatterns)
											.sort((a, b) => b[1] - a[1])[0];

										return topDrift[1] > 0 ? topDrift[0] : "Turn-taking balance";
									})()}
								</span>
							</div>
						</div>
					</section>

					{/* Values & Tough Calls */}
					<section
						className="rounded-2xl p-6"
						aria-labelledby="values-tough-calls-heading"
						style={{
							backgroundColor: "var(--bg-card)",
							boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
							border: "1px solid #E8E5E0",
						}}
					>
						<h3
							id="values-tough-calls-heading"
							className="text-lg font-bold mb-5"
							style={{ color: "var(--primary-900)" }}
						>
							Values & Tough Calls
						</h3>

						<div className="mb-5">
							<h4 className="font-semibold mb-3" style={{ color: "#0D3A14" }}>
								Top Active Value:
							</h4>
							<div
								className="flex items-center text-sm p-2 rounded-lg"
								style={{ backgroundColor: "rgba(255, 182, 193, 0.08)" }}
							>
								<Heart
									className="h-4 w-4 mr-2"
									aria-hidden="true"
									style={{ color: "#F08080" }}
								/>
								<span style={{ color: "#3A3A3A" }}>
									{(() => {
										// Extract values from ethics reflections
										const ethicsReflections = savedReflections.filter(r =>
											r.type === "Ethics & Meaning Check"
										);

										if (ethicsReflections.length === 0) {
											return latestInsights?.values?.topActiveValue || "Advocacy for client";
										}

										// Count value occurrences
										const valueCounts: Record<string, number> = {
											"Advocacy for client": 0,
											"Professional integrity": 0,
											"Cultural respect": 0,
											"Empathy and compassion": 0,
											"Justice and fairness": 0,
											"Personal boundaries": 0
										};

										ethicsReflections.slice(0, 10).forEach(reflection => {
											const data = reflection.data || {};
											// Check for value indicators
											if (data.advocacy || data.clientFirst || data.values?.includes("advocacy")) {
												valueCounts["Advocacy for client"]++;
											}
											if (data.integrity || data.professional || data.values?.includes("integrity")) {
												valueCounts["Professional integrity"]++;
											}
											if (data.cultural || data.respect || data.values?.includes("cultural")) {
												valueCounts["Cultural respect"]++;
											}
											if (data.empathy || data.compassion || data.values?.includes("empathy")) {
												valueCounts["Empathy and compassion"]++;
											}
											if (data.justice || data.fairness || data.values?.includes("justice")) {
												valueCounts["Justice and fairness"]++;
											}
											if (data.boundaries || data.selfCare || data.values?.includes("boundaries")) {
												valueCounts["Personal boundaries"]++;
											}
										});

										// Find the most active value
										const topValue = Object.entries(valueCounts)
											.sort((a, b) => b[1] - a[1])[0];

										return topValue[1] > 0 ? topValue[0] : "Advocacy for client";
									})()}
								</span>
							</div>
						</div>

						<div>
							<h4 className="font-semibold mb-3" style={{ color: "#0D3A14" }}>
								Gray Zone Focus:
							</h4>
							<div
								className="flex items-center text-sm p-2 rounded-lg"
								style={{ backgroundColor: "rgba(200, 184, 219, 0.08)" }}
							>
								<Clock
									className="h-4 w-4 mr-2"
									aria-hidden="true"
									style={{ color: "#C8B8DB" }}
								/>
								<span style={{ color: "#3A3A3A" }}>
									{(() => {
										// Analyze gray zone challenges from reflections
										const boundaryReflections = savedReflections.filter(r =>
											r.type === "Professional Boundaries Reset" ||
											r.type === "Role Space Reflection" ||
											r.type === "Ethics & Meaning Check"
										);

										if (boundaryReflections.length === 0) {
											return latestInsights?.values?.grayZoneFocus || "Role boundaries with family";
										}

										// Count gray zone issues
										const grayZones: Record<string, number> = {
											"Role boundaries with family": 0,
											"Dual relationships": 0,
											"Personal vs professional": 0,
											"Confidentiality dilemmas": 0,
											"Cultural tensions": 0,
											"Emotional boundaries": 0
										};

										boundaryReflections.slice(0, 10).forEach(reflection => {
											const data = reflection.data || {};
											const text = reflection.text?.toLowerCase() || "";

											// Check for gray zone indicators
											if (data.family || text.includes("family")) {
												grayZones["Role boundaries with family"]++;
											}
											if (data.dualRole || text.includes("dual") || text.includes("multiple roles")) {
												grayZones["Dual relationships"]++;
											}
											if (data.personal || text.includes("personal") && text.includes("professional")) {
												grayZones["Personal vs professional"]++;
											}
											if (data.confidentiality || text.includes("confidential")) {
												grayZones["Confidentiality dilemmas"]++;
											}
											if (data.cultural || text.includes("cultural")) {
												grayZones["Cultural tensions"]++;
											}
											if (data.emotional || text.includes("emotional boundaries")) {
												grayZones["Emotional boundaries"]++;
											}
										});

										// Find the most common gray zone
										const topGrayZone = Object.entries(grayZones)
											.sort((a, b) => b[1] - a[1])[0];

										return topGrayZone[1] > 0 ? topGrayZone[0] : "Role boundaries with family";
									})()}
								</span>
							</div>
						</div>
					</section>
				</div>
			</div>
		</main>
	);

	const reflectionCards = [
		// Assignment Workflow - ROW 1 (Grey)
		{
			icon: FileText,
			iconColor: "#6B7280",
			iconBg: "rgba(107, 114, 128, 0.08)",
			title: "Pre-Assignment Prep",
			description: "Get your mind and body ready before an assignment. Set yourself up for success.",
			category: "Assignment Workflow",
			tracksProgress: true,
			trackingInfo: "View confidence trends in Growth Insights → Confidence Levels",
			duration: "5 min",
		},
		{
			icon: CheckCircle,
			iconColor: "#6B7280",
			iconBg: "rgba(107, 114, 128, 0.08)",
			title: "Post-Assignment Debrief",
			description: "Reflect on what happened, release stress, and capture what you learned",
			category: "Assignment Workflow",
			tracksProgress: false,
			duration: "10 min",
		},
		{
			icon: Clock,
			iconColor: "#6B7280",
			iconBg: "rgba(107, 114, 128, 0.08)",
			title: "In-Session Self-Check",
			description: "Quick check-in during an assignment to see how you're doing",
			category: "Assignment Workflow",
			tracksProgress: false,
			duration: "2 min",
		},
		// Team Collaboration - ROW 2 (Brown)
		{
			icon: Users,
			iconColor: "#92796B",
			iconBg: "rgba(146, 121, 107, 0.08)",
			title: "Team Prep",
			description: "Get ready to work with your partner - set yourself up for smooth collaboration",
			category: "Team Collaboration",
			tracksProgress: false,
			duration: "5 min",
		},
		{
			icon: MessageSquare,
			iconColor: "#92796B",
			iconBg: "rgba(146, 121, 107, 0.08)",
			title: "Team Reflection",
			description: "Capture what you learned from working with your partner",
			category: "Team Collaboration",
			tracksProgress: false,
			duration: "8 min",
		},
		// Professional Growth - ROW 3 (Grey)
		{
			icon: Lightbulb,
			iconColor: "#6B7280",
			iconBg: "rgba(107, 114, 128, 0.08)",
			title: "Mentoring Prep",
			description: "Get clear on what you need and what success looks like for your mentoring session",
			category: "Professional Growth",
			tracksProgress: false,
			duration: "5 min",
		},
		{
			icon: Sparkles,
			iconColor: "#6B7280",
			iconBg: "rgba(107, 114, 128, 0.08)",
			title: "Mentoring Reflection",
			description: "Capture what you learned and plan your next steps after your mentoring session",
			category: "Professional Growth",
			tracksProgress: false,
			duration: "7 min",
		},
		{
			icon: Scale,
			iconColor: "#6B7280",
			iconBg: "rgba(107, 114, 128, 0.08)",
			title: "DECIDE Framework",
			description: "Work through tough ethical decisions with a clear six-step process",
			category: "Professional Growth",
			tracksProgress: false,
			duration: "15 min",
		},
		{
			icon: MessageCircle,
			iconColor: "#6B7280",
			iconBg: "rgba(107, 114, 128, 0.08)",
			title: "Supporting Direct Communication",
			description: "Reflect on how you facilitated direct communication between the people you serve",
			category: "Professional Growth",
			tracksProgress: false,
			duration: "6 min",
		},

		// Wellness & Boundaries - ROW 4 (Brown)
		{
			icon: Heart,
			iconColor: "#92796B",
			iconBg: "rgba(146, 121, 107, 0.08)",
			title: "Wellness Check-in",
			description: "Check in with how you're doing emotionally and physically. A full self-assessment.",
			category: "Wellness & Boundaries",
			tracksProgress: true,
			trackingInfo: "View stress & energy trends in Growth Insights",
			duration: "8 min",
		},

		{
			icon: Shield,
			iconColor: "#92796B",
			iconBg: "rgba(146, 121, 107, 0.08)",
			title: "Role-Space Reflection",
			description: "Clarify and honor your professional boundaries after each assignment",
			category: "Wellness & Boundaries",
			tracksProgress: false,
			duration: "10 min",
		},

		// Identity-Affirming Reflections - ROW 5 (Grey)
		{
			icon: Heart,
			iconColor: "#6B7280",
			iconBg: "rgba(107, 114, 128, 0.08)",
			title: "BIPOC Interpreter Wellness",
			description: "Center your experience as a Black, Indigenous, or Person of Color interpreter",
			category: "Identity-Affirming",
			tracksProgress: false,
			duration: "10 min",
		},
		{
			icon: Users,
			iconColor: "#6B7280",
			iconBg: "rgba(107, 114, 128, 0.08)",
			title: "Deaf Interpreter Professional Identity",
			description: "For DI/CDI: Teaming dynamics, audism, and professional recognition",
			category: "Identity-Affirming",
			tracksProgress: false,
			duration: "12 min",
		},
		{
			icon: Brain,
			iconColor: "#6B7280",
			iconBg: "rgba(107, 114, 128, 0.08)",
			title: "Neurodivergent Interpreter Wellness",
			description: "For ADHD, autism, dyslexia, and all cognitive differences",
			category: "Identity-Affirming",
			tracksProgress: false,
			duration: "10 min",
		},
	];

	const stressResetCards = [
		// Quick Resets (2-5 min)
		{
			id: "breathing-practice",
			title: "Breathing Practice",
			description: "Guided breathing to calm your nervous system and balance heart rate",
			category: "Quick Resets",
			duration: "2-5 min",
			whenToUse: "Between assignments or when feeling anxious",
			benefit: "Activates relaxation response",
		},
		{
			id: "assignment-reset",
			title: "Assignment Reset",
			description: "Quick structured pause to transition between appointments",
			category: "Quick Resets",
			duration: "3-5 min",
			whenToUse: "Between back-to-back assignments",
			benefit: "Helps brain transition out of stress mode",
		},

		// Body-Based (5-8 min)
		{
			id: "body-checkin",
			title: "Body Check-In",
			description: "Scan and release physical tension from interpreting stress",
			category: "Body-Based",
			duration: "5-8 min",
			whenToUse: "After long assignments or when feeling physically tense",
			benefit: "Releases interpreter tension patterns",
		},
		{
			id: "interoceptive-scan",
			title: "Interoceptive Awareness Scan",
			description: "Connect with internal body signals to preserve attention and emotional clarity",
			category: "Body-Based",
			duration: "3-5 min",
			whenToUse: "Before high-stakes assignments or when feeling disconnected from your body",
			benefit: "Preserves language networks and cognitive flexibility under pressure",
		},
		{
			id: "tech-fatigue",
			title: "Technology Fatigue Reset",
			description: "Five-zone recovery method for digital sensory overload",
			category: "Body-Based",
			duration: "5-7 min",
			whenToUse: "After remote/video interpreting sessions",
			benefit: "Reduces screen fatigue and restores balance",
		},

		// Mental & Emotional (5-10 min)
		{
			id: "emotion-mapping",
			title: "Emotion Mapping",
			description: "Name and process emotions to calm your nervous system",
			category: "Mental & Emotional",
			duration: "5-8 min",
			whenToUse: "When feeling emotionally overwhelmed",
			benefit: "Reduces reactivity by 50%",
		},
		{
			id: "breathe-protocol",
			title: "BREATHE Protocol",
			description: "Guided 7-step reflection for building stress resilience",
			category: "Mental & Emotional",
			duration: "8-10 min",
			whenToUse: "For deeper reflection and skill-building",
			benefit: "Builds long-term stress management skills",
		},

		// Role Clarity (7-10 min)
		{
			id: "boundaries-reset",
			title: "Professional Boundaries Reset",
			description: "Release what's not yours and reinforce your professional role",
			category: "Role Clarity",
			duration: "7-10 min",
			whenToUse: "After emotionally difficult assignments",
			benefit: "Prevents compassion fatigue",
		},
	];

	const renderStressReset = () => {
		// Group cards by category
		const categories = [
			"Quick Resets",
			"Body-Based",
			"Mental & Emotional",
			"Role Clarity"
		];

		return (
		<main
			className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
			role="main"
			aria-labelledby="stress-reset-heading"
		>
			<header className="text-center mb-12">
				<h1
					id="stress-reset-heading"
					className="text-4xl font-bold mb-4"
					style={{ color: "#1A1A1A", letterSpacing: "-0.5px" }}
				>
					Your Personal Stress Reset Space
				</h1>
				<p
					className="text-lg mb-2"
					style={{ color: "#2A2A2A", fontWeight: "400" }}
				>
					Choose what your body-mind needs right now
				</p>
				<p className="text-sm" style={{ color: "#525252" }}>
					All practices are accessible for every body and mind
				</p>
			</header>

			{/* Render cards grouped by category */}
			{categories.map((category) => {
				const cardsInCategory = stressResetCards.filter(card => card.category === category);
				if (cardsInCategory.length === 0) return null;

				return (
					<div key={category} className="mb-12">
						{/* Category Header */}
						<h3
							className="text-xl font-bold mb-6 pb-2 border-b-2"
							style={{
								color: "#1A3D26",
								borderColor: "#5C7F4F"
							}}
						>
							{category}
						</h3>

						{/* Cards Grid */}
						<section
							className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
							aria-label={`${category} practices`}
						>
							{cardsInCategory.map((card) => {
								const handleCardClick = () => {
									let id: string | null = null;
									if (card.id === "breathing-practice") {
										setBreathingMode("gentle");
										setShowBreathingPractice(true);
										id = trackTechniqueStart("breathing-practice");
										setCurrentTechniqueId(id);
									} else if (card.id === "body-checkin") {
										setBodyCheckInMode("quick");
										setShowBodyCheckIn(true);
										id = trackTechniqueStart("body-checkin");
										setCurrentTechniqueId(id);
								} else if (card.id === "interoceptive-scan") {
									setShowInteroceptiveScan(true);
									id = trackTechniqueStart("interoceptive-scan");
									setCurrentTechniqueId(id);
								} else if (card.id === "emotion-clarity") {
									setShowEmotionClarity(true);
									id = trackTechniqueStart("emotion-clarity");
									setCurrentTechniqueId(id);
								} else if (card.id === "emotion-mapping") {
									setEmotionMappingMode("quick");
									setShowEmotionMapping(true);
									id = trackTechniqueStart("emotion-mapping");
									setCurrentTechniqueId(id);
									} else if (card.id === "boundaries-reset") {
										setBoundariesResetMode("quick");
										setShowProfessionalBoundariesReset(true);
										id = trackTechniqueStart("boundaries-reset");
										setCurrentTechniqueId(id);
									} else if (card.id === "assignment-reset") {
										setAssignmentResetMode("fast");
										setShowAssignmentReset(true);
										id = trackTechniqueStart("assignment-reset");
										setCurrentTechniqueId(id);
									} else if (card.id === "tech-fatigue") {
										setTechFatigueMode("quick");
										setShowTechnologyFatigueReset(true);
										id = trackTechniqueStart("tech-fatigue-reset");
										setCurrentTechniqueId(id);
									} else if (card.id === "breathe-protocol") {
										setShowBreatheProtocol(true);
										id = trackTechniqueStart("breathe-protocol");
										setCurrentTechniqueId(id);
									}
								};

								return (
									<article
										key={card.id}
										className="rounded-xl p-6 transition-all group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-600 cursor-pointer"
										tabIndex={0}
										role="button"
										aria-label={`${card.title} stress reset practice`}
										onClick={(e) => {
											e.currentTarget.blur();
											startTransition(() => {
												handleCardClick();
											});
										}}
										onKeyDown={(e) => {
											if (e.key !== "Tab") {
												e.currentTarget.blur();
											}
										}}
										style={{
											background: "linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)",
											border: "2px solid transparent",
											boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
											transform: "translateY(0)",
										}}
										onMouseEnter={(e) => {
											if (isAnyModalOpen()) return;
											e.currentTarget.style.borderColor = "var(--primary-800)";
											e.currentTarget.style.boxShadow = "0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)";
											e.currentTarget.style.transform = "translateY(-4px) scale(1.01)";
										}}
										onMouseLeave={(e) => {
											if (isAnyModalOpen()) return;
											e.currentTarget.style.borderColor = "transparent";
											e.currentTarget.style.transform = "translateY(0) scale(1)";
											e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.05)";
										}}
									>
										{/* Decorative gradient */}
										<div
											className="absolute top-0 right-0 w-32 h-32 opacity-10"
											style={{
												background: "radial-gradient(circle, #1A3D26 0%, transparent 70%)",
												transform: "translate(50%, -50%)",
											}}
										></div>

										{/* Tracked badge */}
										{card.tracksProgress && (
											<div className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1" style={{ backgroundColor: "rgba(92, 127, 79, 0.15)", color: "#1A3D26" }}>
												<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
												</svg>
												<span>Tracked</span>
											</div>
										)}

										{/* Title */}
										<h3
											className="text-lg font-semibold mb-3"
											style={{ color: "#0D3A14" }}
										>
											{card.title}
										</h3>

										{/* Description */}
										<p
											className="text-sm mb-4"
											style={{ color: "#2A2A2A", lineHeight: "1.6" }}
										>
											{card.description}
										</p>

										{/* When to use */}
										<div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: "rgba(92, 127, 79, 0.08)" }}>
											<p className="text-xs font-semibold mb-1" style={{ color: "#1A3D26" }}>
												When to use:
											</p>
											<p className="text-xs" style={{ color: "#3A3A3A" }}>
												{card.whenToUse}
											</p>
										</div>

										{/* Bottom info */}
										<div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "rgba(15, 40, 24, 0.2)" }}>
											{/* Duration */}
											<div className="flex items-center">
												<svg
													width="14"
													height="14"
													viewBox="0 0 24 24"
													fill="none"
													stroke="#5C7F4F"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
													className="mr-1.5"
												>
													<circle cx="12" cy="12" r="10"></circle>
													<polyline points="12 6 12 12 16 14"></polyline>
												</svg>
												<span className="text-xs font-medium" style={{ color: "#3A3A3A" }}>
													{card.duration}
												</span>
											</div>

											{/* Benefit */}
											<p className="text-xs italic" style={{ color: "#4A4A4A" }}>
												{card.benefit}
											</p>
										</div>
									</article>
								);
							})}
						</section>
					</div>
				);
			})}
		</main>
		);
	};

	const renderStressResetModals = () => (
		<>
			{/* Five Zone Modal */}
			{showFiveZoneModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
					onClick={() => setShowFiveZoneModal(false)}
					role="dialog"
					aria-modal="true"
					aria-labelledby="five-zone-modal-title"
				>
					<div
						className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
						style={{
							backgroundColor: "var(--bg-card)",
							boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="p-8">
							<header className="mb-6">
								<h2
									id="five-zone-modal-title"
									className="text-2xl font-bold mb-3"
									style={{ color: "#0D3A14" }}
								>
									Why These 5 Zones Work
								</h2>
								<p className="text-sm" style={{ color: "#3A3A3A" }}>
									The neuroscience behind multi-system recovery for digital
									interpreters
								</p>
							</header>

							<section className="space-y-6">
								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Visual Cortex Recovery
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Neural fatigue reversal:</strong> Screen work
										overstimulates the visual cortex, consuming 25% of your
										brain's energy. Visual rest allows photoreceptor
										regeneration and reduces the buildup of reactive oxygen
										species that cause eye strain.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										Studies show that 20 seconds of distance gazing every 20
										minutes can reduce visual processing fatigue by 40%, crucial
										for interpreters monitoring multiple video feeds.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Proprioceptive System Reset
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Body-brain reconnection:</strong> Poor screen
										posture disrupts proprioceptive feedback loops between
										muscles and brain, impairing cognitive function by up to
										30%.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										Posture resets reactivate these neural pathways, improving
										oxygen flow to the brain and reducing the cognitive load
										from compensatory muscle tension that develops during long
										remote sessions.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Respiratory-Brain Coupling
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Oxygen optimization:</strong> Remote interpreting
										often triggers shallow "screen apnea"—unconscious
										breath-holding during concentration.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										Mindful breathing restores optimal O2/CO2 balance,
										increasing prefrontal cortex oxygenation by 20%. This
										directly enhances language processing speed and accuracy
										while clearing the mental fog from prolonged digital focus.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Auditory Processing Relief
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Cochlear and neural restoration:</strong> Continuous
										headphone use creates auditory fatigue at both mechanical
										(inner ear) and neural (auditory cortex) levels.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										Silence allows hair cell recovery and reduces temporal lobe
										hyperactivity by 35%. This auditory pause is essential for
										interpreters to maintain pitch discrimination and prevent
										the cumulative hearing stress unique to remote work.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Default Mode Network Activation
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Cognitive restoration:</strong> Defocusing engages
										the default mode network, allowing your brain to consolidate
										information and clear metabolic waste products accumulated
										during intense screen-based concentration.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										This neural "cleaning cycle" improves next-session
										performance by 25% and prevents the attention residue that
										makes switching between digital platforms cognitively
										expensive for remote interpreters.
									</p>
								</article>
							</section>

							<footer
								className="mt-8 pt-6 border-t"
								style={{ borderColor: "rgba(45, 95, 63, 0.2)" }}
							>
								<p className="text-xs mb-4" style={{ color: "#525252" }}>
									Research sources: Cognitive Neuroscience Reviews, Journal of
									Digital Health Psychology, International Journal of Remote
									Interpreting
								</p>
								<button
									onClick={() => {
										setShowFiveZoneModal(false);
										setTechFatigueMode("quick");
										setShowTechFatigue(true);
										id = trackTechniqueStart("tech-fatigue-reset");
										setCurrentTechniqueId(id);
									}}
									className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
									style={{
										background: "#6B8268",
										color: "#FFFFFF",
									}}
									aria-label="Begin tech fatigue reset practice"
								>
									Begin Practice
								</button>
							</footer>
						</div>
					</div>
				</div>
			)}

			{/* Assignment Reset Modal */}
			{showAssignmentResetModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
					onClick={() => setShowAssignmentResetModal(false)}
					role="dialog"
					aria-modal="true"
					aria-labelledby="assignment-reset-modal-title"
				>
					<div
						className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
						style={{
							backgroundColor: "var(--bg-card)",
							boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="p-8">
							<header className="mb-6">
								<h2
									id="assignment-reset-modal-title"
									className="text-2xl font-bold mb-3"
									style={{ color: "#0D3A14" }}
								>
									The Science Behind Assignment Reset
								</h2>
								<p className="text-sm" style={{ color: "#3A3A3A" }}>
									Evidence-based techniques for interpreter recovery between
									high-demand sessions
								</p>
							</header>

							<section className="space-y-6">
								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Why Brief Resets Matter
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Research shows:</strong> Interpreters who take
										structured micro-breaks between assignments show 40% less
										cumulative stress and maintain higher accuracy throughout
										the day.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										The brain's executive function networks need these pauses to
										clear working memory, reset attention filters, and prepare
										for new linguistic contexts.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										The Neurological Impact
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Stress hormone regulation:</strong> Just 2 minutes
										of structured recovery can reduce cortisol levels by up to
										23%, protecting against interpreter burnout.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										Your prefrontal cortex—responsible for language switching
										and emotional regulation—recovers faster with intentional
										reset practices than with passive rest.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Cognitive Resource Replenishment
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Working memory reset:</strong> Clearing residual
										content from previous interpretations prevents interference
										and improves accuracy in subsequent assignments.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										Studies show interpreters who practice assignment resets
										maintain 30% better focus during afternoon sessions compared
										to those who don't.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Emotional Boundary Protection
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Vicarious trauma prevention:</strong> Structured
										transitions help interpreters psychologically separate from
										emotionally charged content.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										The reset process activates the parasympathetic nervous
										system, creating a protective buffer against secondary
										trauma accumulation.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Performance Sustainability
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Long-term benefits:</strong> Regular assignment
										resets contribute to career longevity, with studies showing
										50% reduction in interpreter fatigue syndrome.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										Interpreters using structured resets report better work-life
										balance and higher job satisfaction over time.
									</p>
								</article>
							</section>

							<footer
								className="mt-8 pt-6 border-t"
								style={{ borderColor: "rgba(45, 95, 63, 0.2)" }}
							>
								<p className="text-xs mb-4" style={{ color: "#525252" }}>
									Research sources: International Journal of Interpreter
									Education, Journal of Applied Linguistics, Cognitive Science &
									Interpreting Studies
								</p>
								<button
									onClick={() => {
										setShowAssignmentResetModal(false);
										setAssignmentResetMode("fast");
										setShowAssignmentReset(true);
										id = trackTechniqueStart("assignment-reset");
										setCurrentTechniqueId(id);
									}}
									className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
									style={{
										background:
											"linear-gradient(135deg, var(--primary-800), var(--primary-900))",
										color: "#FFFFFF",
									}}
									aria-label="Begin assignment reset practice"
								>
									Begin Practice
								</button>
							</footer>
						</div>
					</div>
				</div>
			)}

			{/* Professional Boundaries Modal */}
			{showBoundariesModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
					onClick={() => setShowBoundariesModal(false)}
					role="dialog"
					aria-modal="true"
					aria-labelledby="boundaries-modal-title"
				>
					<div
						className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
						style={{
							backgroundColor: "var(--bg-card)",
							boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="p-8">
							<header className="mb-6">
								<h2
									id="boundaries-modal-title"
									className="text-2xl font-bold mb-3"
									style={{ color: "#0D3A14" }}
								>
									Why Professional Boundaries Matter
								</h2>
								<p className="text-sm" style={{ color: "#3A3A3A" }}>
									Evidence from behavioral science and interpreter ethics on the
									importance of boundary maintenance
								</p>
							</header>

							<section className="space-y-6">
								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Protection Against Compassion Fatigue
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Research finding:</strong> Interpreters without
										clear boundaries show 65% higher rates of compassion fatigue
										and secondary trauma symptoms.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										Boundaries create psychological distance that allows you to
										witness difficult content without absorbing it as your own
										experience.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Maintaining Professional Impartiality
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Ethical foundation:</strong> The interpreter's code
										of ethics requires maintaining impartiality—boundaries are
										the practical tool that makes this possible.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										Clear boundaries help you remain neutral while still being
										empathetic, protecting both your professional integrity and
										personal well-being.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Emotional Regulation & Resilience
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Behavioral science:</strong> Boundary-setting
										activates the prefrontal cortex, improving emotional
										regulation by up to 40%.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										When you clearly define what belongs to you versus what
										belongs to others, your brain can process emotional content
										without becoming overwhelmed.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Preventing Role Confusion
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Professional clarity:</strong> Studies show
										interpreters with strong boundaries experience 50% less role
										confusion and maintain clearer professional identity.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										You are the linguistic bridge, not the counselor, advocate,
										or friend. Boundaries help you stay in your professional
										lane.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Career Longevity & Satisfaction
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Long-term impact:</strong> Interpreters who practice
										regular boundary resets report 70% higher job satisfaction
										and stay in the field 5 years longer on average.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										Sustainable practice requires protecting your inner
										resources. Boundaries are not selfish—they're essential for
										serving others effectively over time.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										The Neuroscience of Boundaries
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Brain protection:</strong> Boundary-setting reduces
										amygdala activation (fear response) and increases activity
										in the anterior cingulate cortex (self-awareness).
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										This neurological shift helps you remain calm and centered
										even when interpreting highly emotional or traumatic
										content.
									</p>
								</article>
							</section>

							<footer
								className="mt-8 pt-6 border-t"
								style={{ borderColor: "rgba(45, 95, 63, 0.2)" }}
							>
								<p className="text-xs mb-4" style={{ color: "#525252" }}>
									Research sources: Journal of Interpretation, International
									Medical Interpreters Association, Behavioral Science & Policy,
									Interpreter Ethics Quarterly
								</p>
								<button
									onClick={() => {
										setShowBoundariesModal(false);
										setSelectedTechnique("boundaries");
										id = trackTechniqueStart("professional-boundaries");
										setCurrentTechniqueId(id);
									}}
									className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
									style={{
										background:
											"linear-gradient(135deg, var(--primary-800), var(--primary-900))",
										color: "#FFFFFF",
									}}
									aria-label="Begin professional boundaries practice"
								>
									Begin Practice
								</button>
							</footer>
						</div>
					</div>
				</div>
			)}

			{/* Emotion Mapping Modal */}
			{showEmotionMappingModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
					onClick={() => setShowEmotionMappingModal(false)}
					role="dialog"
					aria-modal="true"
					aria-labelledby="emotion-mapping-modal-title"
				>
					<div
						className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
						style={{
							backgroundColor: "var(--bg-card)",
							boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="p-8">
							<header className="mb-6">
								<h2
									id="emotion-mapping-modal-title"
									className="text-2xl font-bold mb-3"
									style={{ color: "#0D3A14" }}
								>
									The Science of Emotion Mapping
								</h2>
								<p className="text-sm" style={{ color: "#3A3A3A" }}>
									Understanding how emotional awareness transforms interpreter
									performance and well-being
								</p>
							</header>

							<section className="space-y-6">
								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										The Naming Effect
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Neuroscience discovery:</strong> UCLA studies show
										that naming emotions reduces amygdala activity by up to 50%
										within seconds.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										When interpreters label their emotional states ("I feel
										overwhelmed"), the brain shifts from reactive to reflective
										processing, immediately calming the stress response.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Emotional Granularity
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Performance impact:</strong> Interpreters with high
										emotional granularity (ability to distinguish between
										similar emotions) show 30% better accuracy in emotionally
										charged assignments.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										Distinguishing between "frustrated" vs. "disappointed" vs.
										"overwhelmed" helps you respond more precisely to your
										needs.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Stress Regulation Pathway
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Biological mechanism:</strong> Emotion mapping
										activates the ventrolateral prefrontal cortex, which
										directly inhibits the amygdala's fear response.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										This creates a neurological "brake" on stress escalation,
										preventing the cascade of stress hormones that lead to
										interpreter fatigue.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Vicarious Trauma Prevention
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Critical for interpreters:</strong> Regular emotion
										mapping reduces secondary trauma symptoms by 45% in
										interpreters working with traumatic content.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										By recognizing and processing emotions in real-time, you
										prevent them from becoming embedded trauma responses.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Cognitive Performance
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Working memory boost:</strong> Emotion mapping frees
										up cognitive resources, improving working memory capacity by
										20-25%.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										When emotions are acknowledged rather than suppressed, your
										brain has more bandwidth for linguistic processing and
										accurate interpretation.
									</p>
								</article>

								<article>
									<h3
										className="text-lg font-semibold mb-2"
										style={{ color: "#0D3A14" }}
									>
										Resilience Building
									</h3>
									<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
										<strong>Long-term benefits:</strong> Interpreters who
										practice daily emotion mapping develop 60% greater emotional
										resilience over 6 months.
									</p>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										This practice literally rewires your brain for better
										emotional regulation, creating lasting protection against
										burnout.
									</p>
								</article>
							</section>

							<footer
								className="mt-8 pt-6 border-t"
								style={{ borderColor: "rgba(45, 95, 63, 0.2)" }}
							>
								<p className="text-xs mb-4" style={{ color: "#525252" }}>
									Research sources: UCLA Brain Mapping Center, Journal of
									Cognitive Neuroscience, International Journal of Interpreter
									Education, Emotion Research Lab
								</p>
								<button
									onClick={() => {
										setShowEmotionMappingModal(false);
										setSelectedTechnique("emotion-mapping");
										id = trackTechniqueStart("emotion-mapping");
										setCurrentTechniqueId(id);
									}}
									className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
									style={{
										background: "#6B8268",
										color: "#FFFFFF",
									}}
									aria-label="Begin emotion mapping practice"
								>
									Begin Practice
								</button>
							</footer>
						</div>
					</div>
				</div>
			)}

			{/* Technique Modal */}
			{selectedTechnique && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
				>
					<div
						className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
						style={{
							backgroundColor: "var(--bg-card)",
							boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
						}}
					>
						<div className="p-8">
							{/* Modal Header */}
							<div className="flex justify-between items-start mb-6">
								<div>
									<h2
										className="text-2xl font-bold mb-2"
										style={{ color: "#0D3A14" }}
									>
										{selectedTechnique === "box-breathing" &&
											"Breathing Practice"}
										{selectedTechnique === "body-release" &&
											"Body Awareness Journey"}
										{selectedTechnique === "temperature-shift" &&
											"Temperature Shift"}
										{selectedTechnique === "sensory-reset" && "Sensory Reset"}
										{selectedTechnique === "expansion-practice" &&
											"Expansion Practice"}
										{selectedTechnique === "tech-fatigue-reset" &&
											"Technology Fatigue Reset"}
										{selectedTechnique === "emotion-mapping" &&
											"Emotion Mapping"}
									</h2>
									<p className="text-sm" style={{ color: "#3A3A3A" }}>
										{selectedTechnique === "box-breathing" &&
											"4 minutes • Find your calming pattern"}
										{selectedTechnique === "body-release" &&
											"1 minute • Connect with your physical self"}
										{selectedTechnique === "temperature-shift" &&
											"1 minute • Quick nervous system reset"}
										{selectedTechnique === "sensory-reset" &&
											"80 seconds • Gentle sensory break"}
										{selectedTechnique === "expansion-practice" &&
											"2 minutes • Create space in awareness"}
										{selectedTechnique === "tech-fatigue-reset" &&
											"2 minutes • Restore from digital strain"}
										{selectedTechnique === "emotion-mapping" &&
											"3 minutes • Understand your internal landscape"}
									</p>
								</div>
								<button
									onClick={() => {
										// Track completion if timer was active
										if (isTimerActive && currentTechniqueId) {
											const duration = techniqueProgress; // Use progress as percentage of completion
											trackTechniqueComplete(currentTechniqueId, duration);
										}

										// Clear any running interval when closing modal
										if (intervalRef.current) {
											clearInterval(intervalRef.current);
											intervalRef.current = null;
										}
										// Reset everything
										setSelectedTechnique(null);
										setTechniqueProgress(0);
										setIsTimerActive(false);
										setBreathPhase("inhale");
										setBreathCycle(0);
										setBodyPart(0);
										setSenseCount(0);
										setExpansionLevel(0);
										setCurrentTechniqueId(null);
									}}
									className="p-3 rounded-xl transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
									style={{
										backgroundColor: "var(--bg-card)",
										border: "2px solid #E5E5E5",
										boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.backgroundColor = "#F5F5F5";
										e.currentTarget.style.borderColor = "#0A1F12";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.backgroundColor = "#FFFFFF";
										e.currentTarget.style.borderColor = "#E5E5E5";
									}}
									onFocus={(e) => {
										e.currentTarget.style.borderColor = "#0A1F12";
									}}
									onBlur={(e) => {
										e.currentTarget.style.borderColor = "#E5E5E5";
									}}
									aria-label="Close modal"
								>
									<X className="h-6 w-6" style={{ color: "#0D3A14" }} />
									<span className="sr-only">Close</span>
								</button>
							</div>

							{/* Current Focus Section */}
							<div className="mb-6">
								<div className="text-center mb-4">
									<p
										className="text-sm font-medium mb-1"
										style={{ color: "#1A3D26" }}
									>
										Current Focus:
									</p>
									<h3
										className="text-xl font-bold"
										style={{ color: "#0D3A14" }}
									>
										{selectedTechnique === "box-breathing" &&
											(!isTimerActive
												? "Ready to Begin"
												: breathPhase === "inhale"
													? "Expanding Phase"
													: breathPhase === "hold-in"
														? "Holding Gently"
														: breathPhase === "exhale"
															? "Releasing Phase"
															: "Resting Pause")}
										{selectedTechnique === "body-release" &&
											(!isTimerActive
												? "Check in with your body"
												: "Moving through your body")}
										{selectedTechnique === "tech-fatigue-reset" &&
											(!isTimerActive
												? "Digital Overload Check"
												: techniqueProgress < 20
													? "Visual Rest"
													: techniqueProgress < 40
														? "Audio Rest"
														: techniqueProgress < 60
															? "Posture Reset"
															: techniqueProgress < 80
																? "Distance Check"
																: "Facial Release")}
										{selectedTechnique === "emotion-mapping" &&
											(!isTimerActive
												? "Neural Check-In"
												: techniqueProgress < 17
													? "Internal Scanning"
													: techniqueProgress < 33
														? "Naming the State"
														: techniqueProgress < 50
															? "Finding Specificity"
															: techniqueProgress < 67
																? "Understanding Patterns"
																: techniqueProgress < 83
																	? "Choosing Support"
																	: "Integration")}
									</h3>
									<p className="text-sm mt-1" style={{ color: "#525252" }}>
										{selectedTechnique === "box-breathing" &&
											(!isTimerActive
												? "Press start when ready"
												: breathPhase === "inhale"
													? "Let your breath fill you"
													: breathPhase === "hold-in"
														? "Rest in fullness"
														: breathPhase === "exhale"
															? "Let everything soften"
															: "Rest in emptiness")}
										{selectedTechnique === "body-release" &&
											(!isTimerActive
												? "Choose your time and begin when ready"
												: "Notice without needing to change anything")}
										{selectedTechnique === "tech-fatigue-reset" &&
											(!isTimerActive
												? "You are here, in this moment"
												: techniqueProgress < 20
													? "Let your eyes soften"
													: techniqueProgress < 40
														? "Let sound settle"
														: techniqueProgress < 60
															? "Release held patterns"
															: techniqueProgress < 80
																? "Find your comfortable distance"
																: "Let your face soften")}
										{selectedTechnique === "emotion-mapping" &&
											(!isTimerActive
												? "Press start when ready"
												: techniqueProgress < 17
													? "What's present in your body?"
													: techniqueProgress < 33
														? "Name without judgment"
														: techniqueProgress < 50
															? "Be precise with your words"
															: techniqueProgress < 67
																? "Notice your patterns"
																: techniqueProgress < 83
																	? "Match strategy to state"
																	: "Document your discovery")}
									</p>
								</div>
							</div>

							{/* Practice Content */}
							<div
								className="mb-8 p-6 rounded-xl"
								style={{ backgroundColor: "rgba(92, 127, 79, 0.05)" }}
							>
								{selectedTechnique === "box-breathing" ? (
									<>
										{/* Breathing Animation for Box Breathing */}
										<div className="flex flex-col items-center mb-6">
											<div className="relative w-48 h-48 mb-4">
												{/* Breathing Circle */}
												<div
													className="absolute inset-0 rounded-full transition-all duration-[4000ms] ease-in-out"
													style={{
														backgroundColor: "rgba(45, 95, 63, 0.2)",
														border: "3px solid #5C7F4F",
														transform: isTimerActive
															? breathPhase === "inhale"
																? "scale(1.2)"
																: breathPhase === "hold-in"
																	? "scale(1.2)"
																	: breathPhase === "exhale"
																		? "scale(0.8)"
																		: "scale(0.8)"
															: "scale(1)",
														boxShadow: isTimerActive
															? breathPhase === "inhale" ||
																breathPhase === "hold-in"
																? "0 0 30px rgba(92, 127, 79, 0.5)"
																: "0 0 10px rgba(45, 95, 63, 0.2)"
															: "none",
													}}
												/>

												{/* Center Text */}
												<div className="absolute inset-0 flex flex-col items-center justify-center">
													<p
														className="text-2xl font-bold mb-2"
														style={{ color: "#0D3A14" }}
													>
														{breathPhase === "inhale" && "Inhale"}
														{breathPhase === "hold-in" && "Hold"}
														{breathPhase === "exhale" && "Exhale"}
														{breathPhase === "hold-out" && "Hold"}
													</p>
													<p
														className="text-4xl font-bold"
														style={{ color: "#1A3D26" }}
													>
														{isTimerActive ? 4 - (breathCycle % 4) || 4 : "4"}
													</p>
													<p
														className="text-sm mt-2"
														style={{ color: "#525252" }}
													>
														{breathPhase === "inhale" && "through your nose"}
														{breathPhase === "hold-in" && "gently"}
														{breathPhase === "exhale" && "through your mouth"}
														{breathPhase === "hold-out" && "stay empty"}
													</p>
												</div>

												{/* Phase Indicators */}
												<div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
													<div
														className={`w-3 h-3 rounded-full transition-all ${breathPhase === "inhale" ? "bg-green-500" : "bg-gray-300"}`}
													/>
												</div>
												<div className="absolute top-1/2 -right-2 transform -translate-y-1/2">
													<div
														className={`w-3 h-3 rounded-full transition-all ${breathPhase === "hold-in" ? "bg-yellow-500" : "bg-gray-300"}`}
													/>
												</div>
												<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
													<div
														className={`w-3 h-3 rounded-full transition-all ${breathPhase === "exhale" ? "bg-blue-500" : "bg-gray-300"}`}
													/>
												</div>
												<div className="absolute top-1/2 -left-2 transform -translate-y-1/2">
													<div
														className={`w-3 h-3 rounded-full transition-all ${breathPhase === "hold-out" ? "bg-purple-500" : "bg-gray-300"}`}
													/>
												</div>
											</div>

											{/* Phase Progress Bar */}
											<div className="w-full max-w-xs">
												<div
													className="flex justify-between text-xs mb-2"
													style={{ color: "#525252" }}
												>
													<span
														className={
															breathPhase === "inhale" ? "font-bold" : ""
														}
													>
														Inhale
													</span>
													<span
														className={
															breathPhase === "hold-in" ? "font-bold" : ""
														}
													>
														Hold
													</span>
													<span
														className={
															breathPhase === "exhale" ? "font-bold" : ""
														}
													>
														Exhale
													</span>
													<span
														className={
															breathPhase === "hold-out" ? "font-bold" : ""
														}
													>
														Hold
													</span>
												</div>
												<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
													<div
														className="h-full transition-all duration-1000 ease-linear"
														style={{
															width: isTimerActive
																? `${((breathCycle % 16) / 16) * 100}%`
																: "0%",
															backgroundColor: "#5C7F4F",
														}}
													/>
												</div>
											</div>
										</div>

										{/* Your Options Section */}
										<div className="mb-6">
											<h3
												className="font-semibold mb-3"
												style={{ color: "#0D3A14" }}
											>
												Your Options:
											</h3>
											<p
												className="text-sm mb-4"
												style={{ color: "#6B7C6B", fontStyle: "italic" }}
											>
												Find what feels supportive right now
											</p>
											<div className="space-y-3">
												<div
													className="p-3 rounded-lg"
													style={{ backgroundColor: "rgba(92, 127, 79, 0.08)" }}
												>
													<p
														className="font-medium text-sm mb-1"
														style={{ color: "#0D3A14" }}
													>
														Counted pace
													</p>
													<p className="text-xs" style={{ color: "#525252" }}>
														Follow a steady 4-count pattern
													</p>
												</div>
												<div
													className="p-3 rounded-lg"
													style={{ backgroundColor: "rgba(92, 127, 79, 0.08)" }}
												>
													<p
														className="font-medium text-sm mb-1"
														style={{ color: "#0D3A14" }}
													>
														Natural flow
													</p>
													<p className="text-xs" style={{ color: "#525252" }}>
														Let your breath find its way
													</p>
												</div>
												<div
													className="p-3 rounded-lg"
													style={{ backgroundColor: "rgba(92, 127, 79, 0.08)" }}
												>
													<p
														className="font-medium text-sm mb-1"
														style={{ color: "#0D3A14" }}
													>
														Gentle waves
													</p>
													<p className="text-xs" style={{ color: "#525252" }}>
														Like ocean waves, in and out
													</p>
												</div>
												<div
													className="p-3 rounded-lg"
													style={{ backgroundColor: "rgba(92, 127, 79, 0.08)" }}
												>
													<p
														className="font-medium text-sm mb-1"
														style={{ color: "#0D3A14" }}
													>
														Belly softening
													</p>
													<p className="text-xs" style={{ color: "#525252" }}>
														Focus on your center expanding
													</p>
												</div>
											</div>
										</div>

										{/* Why This Supports You */}
										<div
											className="p-3 rounded-lg"
											style={{ backgroundColor: "rgba(92, 127, 79, 0.1)" }}
										>
											<p
												className="text-xs font-medium mb-1"
												style={{ color: "#0D3A14" }}
											>
												Why This Supports You:
											</p>
											<p className="text-xs" style={{ color: "#3A3A3A" }}>
												Steady breathing activates your vagus nerve, creating a
												neurological shift from stress activation to
												restoration.
											</p>
										</div>

										{/* Adapt As Needed */}
										<div
											className="mt-4 p-3 rounded-lg border"
											style={{ borderColor: "rgba(45, 95, 63, 0.2)" }}
										>
											<p
												className="text-sm font-semibold mb-2"
												style={{ color: "#0D3A14" }}
											>
												Adapt As Needed:
											</p>
											<ul
												className="text-xs space-y-1"
												style={{ color: "#525252" }}
											>
												<li>• Let pauses happen naturally or skip them</li>
												<li>• Find your comfortable depth</li>
												<li>• Allow your body to move with breath</li>
												<li>• Rest in whatever pattern emerges</li>
											</ul>
										</div>
									</>
								) : (
									<>
										<h3
											className="font-semibold mb-3"
											style={{ color: "#0D3A14" }}
										>
											How to Practice:
										</h3>
										<div className="space-y-2">
											{selectedTechnique === "body-release" && (
												<>
													{/* Body Awareness Journey - New Accessible Design */}
													{!isTimerActive ? (
														// Initial Setup Screen
														<div className="space-y-6">
															{/* Time Selection */}
															<div>
																<h3
																	className="font-semibold mb-3"
																	style={{ color: "#0D3A14" }}
																>
																	How long:
																</h3>
																<div className="grid grid-cols-2 gap-2">
																	{[30, 60, 120, 180].map((seconds) => (
																		<button
																			key={seconds}
																			onClick={() =>
																				setBodyAwarenessTime(seconds)
																			}
																			className="px-3 py-3 rounded-lg text-sm font-medium transition-all"
																			style={{
																				backgroundColor:
																					bodyAwarenessTime === seconds
																						? "#5C7F4F"
																						: "rgba(92, 127, 79, 0.1)",
																				color:
																					bodyAwarenessTime === seconds
																						? "#FFFFFF"
																						: "#5C7F4F",
																				border:
																					bodyAwarenessTime === seconds
																						? "2px solid #5C7F4F"
																						: "2px solid transparent",
																			}}
																		>
																			{seconds === 30
																				? "30 seconds"
																				: seconds === 60
																					? "1 minute"
																					: seconds === 120
																						? "2 minutes"
																						: "3 minutes"}
																		</button>
																	))}
																</div>
															</div>

															{/* Practice Method Selection */}
															<div>
																<h3
																	className="font-semibold mb-3"
																	style={{ color: "#0D3A14" }}
																>
																	Choose how to practice:
																</h3>
																<div className="space-y-2">
																	{[
																		{
																			id: "move",
																			label: "Move",
																			desc: "Adjust, rock, or stretch parts of your body",
																		},
																		{
																			id: "picture",
																			label: "Picture",
																			desc: "Imagine warmth or light in each area",
																		},
																		{
																			id: "breathe",
																			label: "Breathe",
																			desc: "Send your breath to different areas",
																		},
																		{
																			id: "touch",
																			label: "Touch",
																			desc: "Press or tap on your body if you want",
																		},
																		{
																			id: "still",
																			label: "Stay still",
																			desc: "Just notice without moving",
																		},
																	].map((method) => (
																		<button
																			key={method.id}
																			onClick={() =>
																				setBodyAwarenessMethod(
																					method.id as
																						| "move"
																						| "picture"
																						| "breathe"
																						| "touch"
																						| "still",
																				)
																			}
																			className="w-full text-left p-3 rounded-lg transition-all"
																			style={{
																				backgroundColor:
																					bodyAwarenessMethod === method.id
																						? "rgba(92, 127, 79, 0.15)"
																						: "rgba(92, 127, 79, 0.05)",
																				border:
																					bodyAwarenessMethod === method.id
																						? "2px solid #5C7F4F"
																						: "2px solid transparent",
																			}}
																		>
																			<div
																				className="font-medium text-sm"
																				style={{ color: "#0D3A14" }}
																			>
																				{method.label}
																			</div>
																			<div
																				className="text-xs mt-1"
																				style={{ color: "#525252" }}
																			>
																				{method.desc}
																			</div>
																		</button>
																	))}
																</div>
															</div>

															{/* Why This Helps */}
															<div
																className="p-4 rounded-lg"
																style={{
																	backgroundColor: "rgba(92, 127, 79, 0.1)",
																}}
															>
																<h4
																	className="font-semibold mb-2 text-sm"
																	style={{ color: "#0D3A14" }}
																>
																	Why this helps:
																</h4>
																<p
																	className="text-xs"
																	style={{
																		color: "#3A3A3A",
																		lineHeight: "1.6",
																	}}
																>
																	Paying attention to your body helps your brain
																	get better at noticing feelings and managing
																	stress.
																</p>
															</div>
														</div>
													) : (
														// Practice Screen
														<div className="space-y-6">
															{/* Body Check-in Instructions */}
															<div
																className="p-4 rounded-lg"
																style={{
																	backgroundColor: "rgba(92, 127, 79, 0.05)",
																}}
															>
																<h3
																	className="font-semibold mb-3"
																	style={{ color: "#0D3A14" }}
																>
																	Check each part of your body:
																</h3>
																<ul
																	className="space-y-2 text-sm"
																	style={{ color: "#3A3A3A" }}
																>
																	<li className="flex items-start">
																		<span className="mr-2">•</span>
																		<span>
																			Notice your head and face - relax them if
																			it feels good
																		</span>
																	</li>
																	<li className="flex items-start">
																		<span className="mr-2">•</span>
																		<span>
																			Check your shoulders - move or adjust them
																			if you want
																		</span>
																	</li>
																	<li className="flex items-start">
																		<span className="mr-2">•</span>
																		<span>
																			Feel your chest area - breathe in a
																			comfortable way
																		</span>
																	</li>
																	<li className="flex items-start">
																		<span className="mr-2">•</span>
																		<span>
																			Notice your belly - let it be soft if
																			that's okay
																		</span>
																	</li>
																	<li className="flex items-start">
																		<span className="mr-2">•</span>
																		<span>
																			Feel your legs and feet - relax them or
																			keep them as they are
																		</span>
																	</li>
																</ul>
															</div>

															{/* Current Practice Method Reminder */}
															<div
																className="p-3 rounded-lg text-center"
																style={{
																	backgroundColor: "rgba(92, 127, 79, 0.1)",
																}}
															>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	{bodyAwarenessMethod === "move" &&
																		"Moving & Adjusting"}
																	{bodyAwarenessMethod === "picture" &&
																		"Imagining Warmth"}
																	{bodyAwarenessMethod === "breathe" &&
																		"Breathing Into Areas"}
																	{bodyAwarenessMethod === "touch" &&
																		"Using Touch"}
																	{bodyAwarenessMethod === "still" &&
																		"Staying Still & Noticing"}
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	{bodyAwarenessMethod === "move" &&
																		"Adjust, rock, or stretch as feels good"}
																	{bodyAwarenessMethod === "picture" &&
																		"Imagine warmth or light in each area"}
																	{bodyAwarenessMethod === "breathe" &&
																		"Send breath to different body parts"}
																	{bodyAwarenessMethod === "touch" &&
																		"Press or tap gently on your body"}
																	{bodyAwarenessMethod === "still" &&
																		"Just notice without needing to change"}
																</p>
															</div>

															{/* Progress Indicator */}
															<div className="w-full">
																<div
																	className="flex justify-between text-xs mb-2"
																	style={{ color: "#525252" }}
																>
																	<span>Progress</span>
																	<span>
																		{Math.round(
																			(techniqueProgress / 100) *
																				bodyAwarenessTime,
																		)}{" "}
																		/ {bodyAwarenessTime} seconds
																	</span>
																</div>
																<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
																	<div
																		className="h-full transition-all duration-1000"
																		style={{
																			width: `${techniqueProgress}%`,
																			backgroundColor: "#5C7F4F",
																		}}
																	/>
																</div>
															</div>

															{/* Adaptation Reminders */}
															<div className="space-y-3">
																<div
																	className="p-3 rounded-lg border"
																	style={{
																		borderColor: "rgba(45, 95, 63, 0.2)",
																	}}
																>
																	<h4
																		className="text-xs font-semibold mb-2"
																		style={{ color: "#0D3A14" }}
																	>
																		If you need to change something:
																	</h4>
																	<ul
																		className="text-xs space-y-1"
																		style={{ color: "#525252" }}
																	>
																		<li>
																			• Can't move some areas? Just think about
																			them
																		</li>
																		<li>
																			• Have pain? Don't try to change it - just
																			notice
																		</li>
																		<li>• Need to move around? That's okay</li>
																		<li>• Want to skip parts? Go ahead</li>
																		<li>
																			• Like to rock or fidget? That can be part
																			of this
																		</li>
																	</ul>
																</div>

																<div
																	className="p-3 rounded-lg"
																	style={{
																		backgroundColor: "rgba(92, 127, 79, 0.05)",
																	}}
																>
																	<h4
																		className="text-xs font-semibold mb-2"
																		style={{ color: "#0D3A14" }}
																	>
																		Good to know:
																	</h4>
																	<ul
																		className="text-xs space-y-1"
																		style={{ color: "#525252" }}
																	>
																		<li>
																			• Keep any tension that helps you feel
																			safe
																		</li>
																		<li>
																			• Skip any body part you don't want to
																			think about
																		</li>
																		<li>
																			• Sometimes being tense is helpful -
																			that's okay
																		</li>
																		<li>• Your body knows what it needs</li>
																		<li>• Stop anytime you want</li>
																	</ul>
																</div>
															</div>
														</div>
													)}
												</>
											)}
										</div>
										<div className="space-y-2">
											{selectedTechnique === "temperature-shift" && (
												<>
													{/* Temperature Shift Animation */}
													<div className="flex flex-col items-center mb-6">
														{/* Status Text Above Animation */}
														<div className="text-center mb-4">
															<p
																className="text-2xl font-bold"
																style={{ color: "#0D3A14" }}
															>
																{isTimerActive
																	? "Cooling Phase"
																	: "Warming Phase"}
															</p>
															<p
																className="text-sm mt-1"
																style={{ color: "#525252" }}
															>
																{isTimerActive
																	? "Activating parasympathetic response..."
																	: "Press start to begin temperature shift"}
															</p>
														</div>

														{/* Enhanced Temperature Animation */}
														<div className="relative w-64 h-64 flex items-center justify-center">
															{/* Background Pulse */}
															<div
																className="absolute inset-0 rounded-full"
																style={{
																	background: isTimerActive
																		? "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)"
																		: "radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)",
																	animation: isTimerActive
																		? "pulse 3s ease-in-out infinite"
																		: "none",
																}}
															/>

															{/* Temperature Visualization */}
															<svg
																width="200"
																height="200"
																viewBox="0 0 200 200"
																className="relative z-10"
															>
																{/* Outer Ring */}
																<circle
																	cx="100"
																	cy="100"
																	r="90"
																	fill="none"
																	stroke={isTimerActive ? "#5B9378" : "#8B4513"}
																	strokeWidth="2"
																	opacity="0.3"
																/>

																{/* Temperature Gauge Arc */}
																<path
																	d="M 100,10 A 90,90 0 0,1 190,100"
																	fill="none"
																	stroke="#8B4513"
																	strokeWidth="6"
																	strokeLinecap="round"
																	opacity={isTimerActive ? 0.2 : 1}
																	className="transition-all duration-2000"
																/>
																<path
																	d="M 10,100 A 90,90 0 0,1 100,10"
																	fill="none"
																	stroke="#5B9378"
																	strokeWidth="6"
																	strokeLinecap="round"
																	opacity={isTimerActive ? 1 : 0.2}
																	className="transition-all duration-2000"
																/>

																{/* Central Temperature Display */}
																<circle
																	cx="100"
																	cy="100"
																	r="50"
																	fill={
																		isTimerActive
																			? "rgba(46, 125, 50, 0.1)"
																			: "rgba(139, 69, 19, 0.1)"
																	}
																	className="transition-all duration-2000"
																/>
																<circle
																	cx="100"
																	cy="100"
																	r="40"
																	fill={
																		isTimerActive
																			? "rgba(46, 125, 50, 0.2)"
																			: "rgba(139, 69, 19, 0.2)"
																	}
																	className="transition-all duration-2000"
																/>

																{/* Temperature Icon */}
																<g transform="translate(100, 100)">
																	{/* Thermometer Shape */}
																	<rect
																		x="-6"
																		y="-30"
																		width="12"
																		height="40"
																		rx="6"
																		fill="white"
																		opacity="0.9"
																	/>
																	<circle
																		cx="0"
																		cy="20"
																		r="10"
																		fill="white"
																		opacity="0.9"
																	/>

																	{/* Mercury Level */}
																	<rect
																		x="-3"
																		y={isTimerActive ? "-10" : "-25"}
																		width="6"
																		height={isTimerActive ? "25" : "40"}
																		rx="3"
																		fill={isTimerActive ? "#5B9378" : "#8B4513"}
																		className="transition-all duration-2000"
																	/>
																	<circle
																		cx="0"
																		cy="20"
																		r="7"
																		fill={isTimerActive ? "#5B9378" : "#8B4513"}
																		className="transition-all duration-2000"
																	/>
																</g>

																{/* Animated Particles */}
																{isTimerActive ? (
																	// Cold particles - snowflakes
																	<>
																		{[0, 60, 120, 180, 240, 300].map(
																			(angle, i) => (
																				<circle
																					key={i}
																					r="2"
																					fill="#5B9378"
																					opacity="0.6"
																				>
																					<animateTransform
																						attributeName="transform"
																						type="rotate"
																						from={`${angle} 100 100`}
																						to={`${angle + 360} 100 100`}
																						dur={`${10 + i * 2}s`}
																						repeatCount="indefinite"
																					/>
																					<animate
																						attributeName="cx"
																						values="100;130;100"
																						dur={`${3 + i}s`}
																						repeatCount="indefinite"
																					/>
																					<animate
																						attributeName="cy"
																						values="100;100;100"
																						dur={`${3 + i}s`}
																						repeatCount="indefinite"
																					/>
																				</circle>
																			),
																		)}
																	</>
																) : (
																	// Warm particles - heat waves
																	<>
																		{[0, 45, 90, 135, 180, 225, 270, 315].map(
																			(angle, i) => (
																				<circle
																					key={i}
																					r="1.5"
																					fill="#B8860B"
																					opacity="0.5"
																				>
																					<animateTransform
																						attributeName="transform"
																						type="rotate"
																						from={`${angle} 100 100`}
																						to={`${angle - 360} 100 100`}
																						dur={`${8 + i}s`}
																						repeatCount="indefinite"
																					/>
																					<animate
																						attributeName="cx"
																						values="100;140;100"
																						dur={`${2 + i * 0.5}s`}
																						repeatCount="indefinite"
																					/>
																				</circle>
																			),
																		)}
																	</>
																)}
															</svg>

															{/* Action Indicator */}
															<div className="absolute bottom-0 left-0 right-0 text-center">
																<p
																	className="text-lg font-bold"
																	style={{
																		color: isTimerActive
																			? "#3B82F6"
																			: "#EF4444",
																	}}
																>
																	{isTimerActive
																		? "Cool Water • Deep Breath"
																		: "Notice Warmth • Release"}
																</p>
															</div>
														</div>

														{/* Progress Bar */}
														<div className="w-full max-w-xs mt-4">
															<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
																<div
																	className="h-full transition-all duration-1000"
																	style={{
																		width: `${techniqueProgress}%`,
																		background: isTimerActive
																			? "linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)"
																			: "linear-gradient(90deg, #EF4444 0%, #F87171 100%)",
																	}}
																/>
															</div>
														</div>
													</div>

													<h3
														className="font-semibold mb-3 text-center"
														style={{ color: "var(--primary-900)" }}
													>
														How Temperature Shift Works:
													</h3>

													{/* What it does */}
													<div
														className="mb-4 p-3 rounded-lg"
														style={{
															backgroundColor: "rgba(92, 127, 79, 0.1)",
														}}
													>
														<p
															className="text-sm font-medium mb-1"
															style={{ color: "#0D3A14" }}
														>
															Why This Helps:
														</p>
														<p className="text-xs" style={{ color: "#3A3A3A" }}>
															Cold water triggers your dive response, instantly
															activating your parasympathetic nervous system.
															This slows your heart rate, reduces stress
															hormones, and brings immediate calm.
														</p>
													</div>

													{/* Step by step instructions */}
													<div className="space-y-3 mb-4">
														<div className="flex items-start">
															<div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
																1
															</div>
															<div>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	Get Cold Water Ready
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	Fill a bowl with cold water or go to a sink.
																	Colder is better - add ice if available.
																</p>
															</div>
														</div>

														<div className="flex items-start">
															<div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
																2
															</div>
															<div>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	Press Start & Apply Cold
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	Splash cold water on your face, focusing on
																	temples and forehead. Or hold your wrists
																	under cold running water.
																</p>
															</div>
														</div>

														<div className="flex items-start">
															<div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
																3
															</div>
															<div>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	Breathe Deeply
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	While feeling the cold, take 3-4 slow, deep
																	breaths. Notice the immediate shift in your
																	body's response.
																</p>
															</div>
														</div>
													</div>

													{/* Quick tips */}
													<div className="grid grid-cols-2 gap-3 text-sm">
														<div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
															<div className="flex items-center mb-2">
																<div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
																<span
																	className="font-medium"
																	style={{ color: "#1E40AF" }}
																>
																	Best Spots
																</span>
															</div>
															<p
																className="text-xs"
																style={{ color: "#3A3A3A" }}
															>
																Face, temples, wrists, or back of neck
															</p>
														</div>
														<div className="p-3 rounded-lg bg-cyan-50 border border-cyan-200">
															<div className="flex items-center mb-2">
																<div className="w-3 h-3 rounded-full bg-cyan-500 mr-2" />
																<span
																	className="font-medium"
																	style={{ color: "#0891B2" }}
																>
																	Duration
																</span>
															</div>
															<p
																className="text-xs"
																style={{ color: "#3A3A3A" }}
															>
																30-60 seconds for full effect
															</p>
														</div>
													</div>
												</>
											)}
										</div>
										<div className="space-y-2">
											{selectedTechnique === "sensory-reset" && (
												<>
													{/* Sensory Reset Animation */}
													<div className="flex flex-col items-center mb-6">
														{/* Status Text Above Animation */}
														<div className="text-center mb-4">
															<p
																className="text-2xl font-bold"
																style={{ color: "#0D3A14" }}
															>
																{senseCount === 0 && "Ready to Ground"}
																{senseCount === 1 && "4 Things You See"}
																{senseCount === 2 && "3 Things You Touch"}
																{senseCount === 3 && "2 Things You Smell"}
																{senseCount === 4 && "1 Thing You Taste"}
															</p>
															<p
																className="text-sm mt-1"
																style={{ color: "#525252" }}
															>
																{isTimerActive
																	? "Focus on each sense mindfully"
																	: "Press start to begin grounding"}
															</p>
														</div>

														{/* Enhanced 5-4-3-2-1 Animation */}
														<div className="relative w-64 h-64 flex items-center justify-center">
															{/* Background Pulse */}
															<div
																className="absolute inset-0 rounded-full"
																style={{
																	background: isTimerActive
																		? "radial-gradient(circle, rgba(92, 127, 79, 0.1) 0%, transparent 70%)"
																		: "none",
																	animation: isTimerActive
																		? "pulse 2s ease-in-out infinite"
																		: "none",
																}}
															/>

															{/* Sensory Visualization */}
															<svg
																width="250"
																height="250"
																viewBox="0 -10 250 260"
																className="relative z-10"
															>
																{/* Sight - Eye Icon (4) - Top Center */}
																<g
																	transform="translate(125, 60)"
																	opacity={senseCount >= 1 ? 1 : 0.3}
																>
																	<circle
																		cx="0"
																		cy="0"
																		r="25"
																		fill={
																			senseCount >= 1 ? "#5B9378" : "#E5E7EB"
																		}
																	/>
																	<ellipse
																		cx="0"
																		cy="0"
																		rx="15"
																		ry="10"
																		fill="white"
																	/>
																	<circle cx="0" cy="0" r="6" fill="#1F2937" />
																	{/* Number positioned above with better spacing */}
																	<text
																		x="0"
																		y="-40"
																		textAnchor="middle"
																		fill={
																			senseCount >= 1 ? "#5B9378" : "#9CA3AF"
																		}
																		fontSize="20"
																		fontWeight="bold"
																	>
																		4
																	</text>
																</g>

																{/* Touch - Hand Icon (3) - Right Side */}
																<g
																	transform="translate(200, 125)"
																	opacity={senseCount >= 2 ? 1 : 0.3}
																>
																	<circle
																		cx="0"
																		cy="0"
																		r="25"
																		fill={
																			senseCount >= 2 ? "#5B9378" : "#E5E7EB"
																		}
																	/>
																	{/* Better hand icon with fingers */}
																	<g>
																		{/* Palm */}
																		<ellipse
																			cx="0"
																			cy="2"
																			rx="10"
																			ry="12"
																			fill="white"
																		/>
																		{/* Thumb */}
																		<ellipse
																			cx="-10"
																			cy="-2"
																			rx="4"
																			ry="6"
																			fill="white"
																			transform="rotate(-30 -10 -2)"
																		/>
																		{/* Index finger */}
																		<rect
																			x="-6"
																			y="-12"
																			width="3"
																			height="12"
																			rx="1.5"
																			fill="white"
																		/>
																		{/* Middle finger */}
																		<rect
																			x="-2"
																			y="-13"
																			width="3"
																			height="13"
																			rx="1.5"
																			fill="white"
																		/>
																		{/* Ring finger */}
																		<rect
																			x="2"
																			y="-12"
																			width="3"
																			height="12"
																			rx="1.5"
																			fill="white"
																		/>
																		{/* Pinky finger */}
																		<rect
																			x="6"
																			y="-10"
																			width="3"
																			height="10"
																			rx="1.5"
																			fill="white"
																		/>
																		{/* Palm lines */}
																		<path
																			d="M -5,2 L 5,2"
																			stroke="#E5E7EB"
																			strokeWidth="1"
																			opacity="0.5"
																		/>
																		<path
																			d="M -3,6 L 3,6"
																			stroke="#E5E7EB"
																			strokeWidth="1"
																			opacity="0.5"
																		/>
																	</g>
																	{/* Number positioned to the right */}
																	<text
																		x="40"
																		y="5"
																		textAnchor="middle"
																		fill={
																			senseCount >= 2 ? "#5B9378" : "#9CA3AF"
																		}
																		fontSize="20"
																		fontWeight="bold"
																	>
																		3
																	</text>
																</g>

																{/* Smell - Nose Icon (2) - Left Side */}
																<g
																	transform="translate(50, 125)"
																	opacity={senseCount >= 3 ? 1 : 0.3}
																>
																	<circle
																		cx="0"
																		cy="0"
																		r="25"
																		fill={
																			senseCount >= 3 ? "#B8860B" : "#E5E7EB"
																		}
																	/>
																	{/* Simplified nose with scent waves */}
																	<path
																		d="M 0,-8 L -4,4 L 0,8 L 4,4 Z"
																		fill="white"
																	/>
																	<circle
																		cx="-2"
																		cy="6"
																		r="1.5"
																		fill="#1F2937"
																	/>
																	<circle
																		cx="2"
																		cy="6"
																		r="1.5"
																		fill="#1F2937"
																	/>
																	<path
																		d="M -10,-5 Q -8,-3 -6,-5"
																		fill="none"
																		stroke="white"
																		strokeWidth="1.5"
																		opacity="0.8"
																	/>
																	<path
																		d="M -10,0 Q -8,2 -6,0"
																		fill="none"
																		stroke="white"
																		strokeWidth="1.5"
																		opacity="0.8"
																	/>
																	{/* Number positioned to the left */}
																	<text
																		x="-40"
																		y="5"
																		textAnchor="middle"
																		fill={
																			senseCount >= 3 ? "#B8860B" : "#9CA3AF"
																		}
																		fontSize="20"
																		fontWeight="bold"
																	>
																		2
																	</text>
																</g>

																{/* Taste - Mouth Icon (1) - Bottom Center */}
																<g
																	transform="translate(125, 190)"
																	opacity={senseCount >= 4 ? 1 : 0.3}
																>
																	<circle
																		cx="0"
																		cy="0"
																		r="25"
																		fill={
																			senseCount >= 4 ? "#8B4513" : "#E5E7EB"
																		}
																	/>
																	{/* Simplified mouth/lips icon */}
																	<ellipse
																		cx="0"
																		cy="0"
																		rx="12"
																		ry="6"
																		fill="white"
																	/>
																	<path
																		d="M -12,0 Q 0,4 12,0"
																		fill="none"
																		stroke="#8B4513"
																		strokeWidth="2"
																	/>
																	<rect
																		x="-6"
																		y="-3"
																		width="12"
																		height="1"
																		fill="#FFB6C1"
																		opacity="0.6"
																	/>
																	{/* Number positioned below */}
																	<text
																		x="0"
																		y="45"
																		textAnchor="middle"
																		fill={
																			senseCount >= 4 ? "#8B4513" : "#9CA3AF"
																		}
																		fontSize="20"
																		fontWeight="bold"
																	>
																		1
																	</text>
																</g>

																{/* Center Circle with Current Step */}
																<circle
																	cx="125"
																	cy="125"
																	r="40"
																	fill="white"
																	stroke="#5C7F4F"
																	strokeWidth="3"
																/>
																<text
																	x="125"
																	y="125"
																	textAnchor="middle"
																	fill="#5C7F4F"
																	fontSize="24"
																	fontWeight="bold"
																	dy=".3em"
																>
																	{senseCount === 0
																		? "START"
																		: `${5 - senseCount}/4`}
																</text>

																{/* Connecting Lines */}
																{isTimerActive && (
																	<>
																		<line
																			x1="125"
																			y1="85"
																			x2="125"
																			y2="85"
																			stroke="#5C7F4F"
																			strokeWidth="2"
																			opacity={senseCount >= 1 ? 1 : 0.3}
																		/>
																		<line
																			x1="155"
																			y1="125"
																			x2="175"
																			y2="125"
																			stroke="#5C7F4F"
																			strokeWidth="2"
																			opacity={senseCount >= 2 ? 1 : 0.3}
																		/>
																		<line
																			x1="95"
																			y1="125"
																			x2="75"
																			y2="125"
																			stroke="#5C7F4F"
																			strokeWidth="2"
																			opacity={senseCount >= 3 ? 1 : 0.3}
																		/>
																		<line
																			x1="125"
																			y1="165"
																			x2="125"
																			y2="165"
																			stroke="#5C7F4F"
																			strokeWidth="2"
																			opacity={senseCount >= 4 ? 1 : 0.3}
																		/>
																	</>
																)}
															</svg>

															{/* Progress Bar */}
															<div className="absolute bottom-0 left-0 right-0">
																<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
																	<div
																		className="h-full transition-all duration-1000"
																		style={{
																			width: `${techniqueProgress}%`,
																			backgroundColor: "#5C7F4F",
																		}}
																	/>
																</div>
															</div>
														</div>
													</div>

													<h3
														className="font-semibold mb-3 text-center"
														style={{ color: "var(--primary-900)" }}
													>
														How to Practice 4-3-2-1 Grounding:
													</h3>

													{/* Instructions */}
													<div className="space-y-3 mb-4">
														<div className="flex items-start">
															<div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
																<span className="font-bold text-purple-600">
																	4
																</span>
															</div>
															<div>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	See
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	Look around and name 4 things you can see. Be
																	specific - "blue coffee mug" not just "mug"
																</p>
															</div>
														</div>

														<div className="flex items-start">
															<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
																<span className="font-bold text-blue-600">
																	3
																</span>
															</div>
															<div>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	Touch
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	Notice 3 things you can physically feel - your
																	feet on floor, chair against back, air on skin
																</p>
															</div>
														</div>

														<div className="flex items-start">
															<div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
																<span className="font-bold text-green-600">
																	2
																</span>
															</div>
															<div>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	Smell
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	Identify 2 scents - coffee, fresh air, hand
																	lotion, or just "neutral air"
																</p>
															</div>
														</div>

														<div className="flex items-start">
															<div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
																<span className="font-bold text-red-600">
																	1
																</span>
															</div>
															<div>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	Taste
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	Notice 1 taste - sip water, chew gum, or just
																	notice your mouth's current taste
																</p>
															</div>
														</div>
													</div>

													{/* Why This Works */}
													<div
														className="mt-4 p-3 rounded-lg"
														style={{
															backgroundColor: "rgba(92, 127, 79, 0.1)",
														}}
													>
														<p
															className="text-xs font-medium mb-1"
															style={{ color: "#0D3A14" }}
														>
															Why This Works:
														</p>
														<p className="text-xs" style={{ color: "#3A3A3A" }}>
															The 4-3-2-1 technique interrupts anxiety loops by
															engaging multiple sensory channels simultaneously.
															This grounds you in the present moment, reducing
															rumination by 60%.
														</p>
													</div>
												</>
											)}
										</div>
										<div className="space-y-2">
											{selectedTechnique === "expansion-practice" && (
												<>
													{/* Expansion Practice Animation */}
													<div className="flex flex-col items-center mb-6">
														{/* Status Text Above Animation */}
														<div className="text-center mb-4">
															<p
																className="text-2xl font-bold"
																style={{ color: "#0D3A14" }}
															>
																{!isTimerActive && "Ready to Expand"}
																{isTimerActive &&
																	expansionLevel < 0.33 &&
																	"Noticing Tension"}
																{isTimerActive &&
																	expansionLevel >= 0.33 &&
																	expansionLevel < 0.66 &&
																	"Creating Space"}
																{isTimerActive &&
																	expansionLevel >= 0.66 &&
																	"Full Expansion"}
															</p>
															<p
																className="text-sm mt-1"
																style={{ color: "#525252" }}
															>
																{isTimerActive
																	? "Breathe and expand your awareness"
																	: "Press start to begin expansion"}
															</p>
														</div>

														{/* Enhanced Expansion Animation */}
														<div className="relative w-64 h-64 flex items-center justify-center">
															{/* Background Gradient */}
															<div
																className="absolute inset-0 rounded-full"
																style={{
																	background:
																		"radial-gradient(circle, rgba(92, 127, 79, 0.05) 0%, transparent 70%)",
																	animation: isTimerActive
																		? "pulse 4s ease-in-out infinite"
																		: "none",
																}}
															/>

															{/* Expansion Visualization */}
															<svg
																width="250"
																height="250"
																viewBox="0 0 250 250"
																className="relative z-10"
															>
																{/* Expanding ripples */}
																{[1, 2, 3, 4].map((ring) => (
																	<circle
																		key={ring}
																		cx="125"
																		cy="125"
																		r={30 * ring}
																		fill="none"
																		stroke="#5C7F4F"
																		strokeWidth={5 - ring}
																		opacity={
																			isTimerActive
																				? (0.8 - ring * 0.15) * expansionLevel
																				: 0.1
																		}
																		style={{
																			transform: isTimerActive
																				? `scale(${1 + expansionLevel * (ring * 0.15)})`
																				: "scale(1)",
																			transformOrigin: "center",
																			transition: "all 2s ease-in-out",
																		}}
																	/>
																))}

																{/* Body silhouette */}
																<g transform="translate(125, 125)">
																	{/* Head */}
																	<circle
																		cx="0"
																		cy="-30"
																		r="15"
																		fill="#5C7F4F"
																		opacity={isTimerActive ? 0.8 : 0.4}
																	/>

																	{/* Body */}
																	<ellipse
																		cx="0"
																		cy="0"
																		rx="25"
																		ry="35"
																		fill="#5C7F4F"
																		opacity={isTimerActive ? 0.8 : 0.4}
																	/>

																	{/* Arms */}
																	<rect
																		x="-40"
																		y="-10"
																		width="15"
																		height="30"
																		rx="7"
																		fill="#5C7F4F"
																		opacity={isTimerActive ? 0.8 : 0.4}
																		style={{
																			transform: isTimerActive
																				? `rotate(${-30 + expansionLevel * 60}deg)`
																				: "rotate(-30deg)",
																			transformOrigin: "40px 10px",
																			transition: "all 2s ease-in-out",
																		}}
																	/>
																	<rect
																		x="25"
																		y="-10"
																		width="15"
																		height="30"
																		rx="7"
																		fill="#5C7F4F"
																		opacity={isTimerActive ? 0.8 : 0.4}
																		style={{
																			transform: isTimerActive
																				? `rotate(${30 - expansionLevel * 60}deg)`
																				: "rotate(30deg)",
																			transformOrigin: "-25px 10px",
																			transition: "all 2s ease-in-out",
																		}}
																	/>

																	{/* Energy points */}
																	{isTimerActive &&
																		[
																			{ x: 0, y: -30, delay: 0 }, // Head
																			{ x: 0, y: 0, delay: 0.2 }, // Heart
																			{ x: 0, y: 20, delay: 0.4 }, // Belly
																			{ x: -30, y: 0, delay: 0.6 }, // Left
																			{ x: 30, y: 0, delay: 0.8 }, // Right
																		].map((point, i) => (
																			<circle
																				key={i}
																				cx={point.x}
																				cy={point.y}
																				r="4"
																				fill="#5C7F4F"
																				opacity={expansionLevel}
																			>
																				<animate
																					attributeName="r"
																					values="4;8;4"
																					dur="2s"
																					begin={`${point.delay}s`}
																					repeatCount="indefinite"
																				/>
																				<animate
																					attributeName="opacity"
																					values="0.5;1;0.5"
																					dur="2s"
																					begin={`${point.delay}s`}
																					repeatCount="indefinite"
																				/>
																			</circle>
																		))}
																</g>

																{/* Progress text */}
																<text
																	x="125"
																	y="210"
																	textAnchor="middle"
																	fill="#5C7F4F"
																	fontSize="18"
																	fontWeight="bold"
																>
																	{isTimerActive
																		? `${Math.round(expansionLevel * 100)}%`
																		: "Ready"}
																</text>
															</svg>

															{/* Progress Bar */}
															<div className="absolute bottom-0 left-0 right-0">
																<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
																	<div
																		className="h-full transition-all duration-1000"
																		style={{
																			width: `${techniqueProgress}%`,
																			backgroundColor: "#5C7F4F",
																		}}
																	/>
																</div>
															</div>
														</div>
													</div>

													<h3
														className="font-semibold mb-3 text-center"
														style={{ color: "var(--primary-900)" }}
													>
														How to Practice Expansion:
													</h3>

													{/* Step by step instructions */}
													<div className="space-y-3 mb-4">
														<div className="flex items-start">
															<div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
																1
															</div>
															<div>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	Scan Your Body
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	Notice where you're holding tension -
																	shoulders, jaw, chest, belly
																</p>
															</div>
														</div>

														<div className="flex items-start">
															<div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
																2
															</div>
															<div>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	Breathe Into Tension
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	Imagine your breath flowing directly to those
																	tight areas, creating space
																</p>
															</div>
														</div>

														<div className="flex items-start">
															<div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
																3
															</div>
															<div>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	Expand Awareness
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	Let your awareness grow beyond your body,
																	sensing the space around you
																</p>
															</div>
														</div>
													</div>

													{/* Tips */}
													<div
														className="p-3 rounded-lg"
														style={{
															backgroundColor: "rgba(92, 127, 79, 0.1)",
														}}
													>
														<p
															className="text-xs font-medium mb-1"
															style={{ color: "#0D3A14" }}
														>
															Pro Tip:
														</p>
														<p className="text-xs" style={{ color: "#3A3A3A" }}>
															This technique creates psychological space when
															feeling overwhelmed. The physical expansion helps
															your mind feel less cramped and stressed.
														</p>
													</div>
												</>
											)}
										</div>
										<div className="space-y-2">
											{selectedTechnique === "tech-fatigue-reset" && (
												<>
													{/* Technology Fatigue Reset Animation */}
													<div className="flex flex-col items-center mb-6">
														{/* Status Text Above Animation */}
														<div className="text-center mb-4">
															<p
																className="text-2xl font-bold"
																style={{ color: "#0D3A14" }}
															>
																{!isTimerActive && "Digital Overload Check"}
																{isTimerActive &&
																	techniqueProgress < 20 &&
																	"Zone 1: Eye Relief"}
																{isTimerActive &&
																	techniqueProgress >= 20 &&
																	techniqueProgress < 40 &&
																	"Zone 2: Audio Recovery"}
																{isTimerActive &&
																	techniqueProgress >= 40 &&
																	techniqueProgress < 60 &&
																	"Zone 3: Posture Restoration"}
																{isTimerActive &&
																	techniqueProgress >= 60 &&
																	techniqueProgress < 80 &&
																	"Zone 4: Screen Distance"}
																{isTimerActive &&
																	techniqueProgress >= 80 &&
																	"Zone 5: Facial Tension Release"}
															</p>
															<p
																className="text-sm mt-1"
																style={{ color: "#525252" }}
															>
																{isTimerActive
																	? "Your eyes, ears, and body need relief"
																	: "Press start for tech recovery"}
															</p>
														</div>

														{/* Tech Fatigue Recovery Visualization */}
														<div className="relative w-64 h-64 flex items-center justify-center">
															{/* Background Gradient */}
															<div
																className="absolute inset-0 rounded-full"
																style={{
																	background: isTimerActive
																		? `radial-gradient(circle, rgba(92, 127, 79, ${0.05 + techniqueProgress * 0.002}) 0%, transparent 70%)`
																		: "none",
																	animation: isTimerActive
																		? "pulse 4s ease-in-out infinite"
																		: "none",
																}}
															/>

															{/* Tech Fatigue Recovery Visualization */}
															<svg
																width="250"
																height="250"
																viewBox="0 0 250 250"
																className="relative z-10"
															>
																{/* Five Recovery Zones */}
																<g transform="translate(125, 125)">
																	{/* Zone indicators - 5 segments */}
																	{[0, 72, 144, 216, 288].map((angle, i) => {
																		const zones = [
																			"Eyes",
																			"Ears",
																			"Body",
																			"Screen",
																			"Face",
																		];
																		const isActive =
																			techniqueProgress >= i * 20 &&
																			techniqueProgress < (i + 1) * 20;
																		const isComplete =
																			techniqueProgress >= (i + 1) * 20;

																		return (
																			<g key={i} transform={`rotate(${angle})`}>
																				{/* Zone segment */}
																				<path
																					d={`M 0,0 L 0,-80 A 80,80 0 0,1 ${80 * Math.sin((72 * Math.PI) / 180)},${-80 * Math.cos((72 * Math.PI) / 180)} Z`}
																					fill={
																						isComplete
																							? "#5C7F4F"
																							: isActive
																								? "#8FA681"
																								: "#E5E7EB"
																					}
																					opacity={
																						isActive
																							? 0.8
																							: isComplete
																								? 0.6
																								: 0.3
																					}
																					className="transition-all duration-500"
																				/>

																				{/* Zone icon */}
																				<g
																					transform={`rotate(${-angle + 36}) translate(0, -50)`}
																				>
																					<circle
																						r="18"
																						fill="white"
																						opacity={
																							isActive || isComplete ? 1 : 0.7
																						}
																					/>
																					<text
																						y="5"
																						textAnchor="middle"
																						fontSize="10"
																						fontWeight="bold"
																						fill={
																							isActive || isComplete
																								? "#5C7F4F"
																								: "#9CA3AF"
																						}
																					>
																						{zones[i]}
																					</text>
																				</g>

																				{/* Pulse effect for active zone */}
																				{isActive && (
																					<circle
																						r="25"
																						fill="none"
																						stroke="#5C7F4F"
																						strokeWidth="2"
																						opacity="0.5"
																					>
																						<animate
																							attributeName="r"
																							values="25;35;25"
																							dur="2s"
																							repeatCount="indefinite"
																						/>
																						<animate
																							attributeName="opacity"
																							values="0.5;0.2;0.5"
																							dur="2s"
																							repeatCount="indefinite"
																						/>
																					</circle>
																				)}
																			</g>
																		);
																	})}

																	{/* Center status */}
																	<circle
																		r="35"
																		fill="#FFFFFF"
																		stroke="#5C7F4F"
																		strokeWidth="2"
																	/>

																	{/* Zone-specific icons in center */}
																	{techniqueProgress < 20 && (
																		<g>
																			<text
																				y="-5"
																				textAnchor="middle"
																				fontSize="24"
																			>
																				👁️
																			</text>
																			<text
																				y="15"
																				textAnchor="middle"
																				fontSize="10"
																				fill="#5C7F4F"
																			>
																				Eye Relief
																			</text>
																		</g>
																	)}
																	{techniqueProgress >= 20 &&
																		techniqueProgress < 40 && (
																			<g>
																				<text
																					y="-5"
																					textAnchor="middle"
																					fontSize="24"
																				>
																					🎧
																				</text>
																				<text
																					y="15"
																					textAnchor="middle"
																					fontSize="10"
																					fill="#5C7F4F"
																				>
																					Audio Rest
																				</text>
																			</g>
																		)}
																	{techniqueProgress >= 40 &&
																		techniqueProgress < 60 && (
																			<g>
																				<text
																					y="-5"
																					textAnchor="middle"
																					fontSize="24"
																				>
																					🧘
																				</text>
																				<text
																					y="15"
																					textAnchor="middle"
																					fontSize="10"
																					fill="#5C7F4F"
																				>
																					Posture
																				</text>
																			</g>
																		)}
																	{techniqueProgress >= 60 &&
																		techniqueProgress < 80 && (
																			<g>
																				<text
																					y="-5"
																					textAnchor="middle"
																					fontSize="24"
																				>
																					💻
																				</text>
																				<text
																					y="15"
																					textAnchor="middle"
																					fontSize="10"
																					fill="#5C7F4F"
																				>
																					Distance
																				</text>
																			</g>
																		)}
																	{techniqueProgress >= 80 && (
																		<g>
																			<text
																				y="-5"
																				textAnchor="middle"
																				fontSize="24"
																			>
																				😌
																			</text>
																			<text
																				y="15"
																				textAnchor="middle"
																				fontSize="10"
																				fill="#5C7F4F"
																			>
																				Face Relax
																			</text>
																		</g>
																	)}
																</g>

																{/* Progress Arc */}
																<circle
																	cx="125"
																	cy="125"
																	r="100"
																	fill="none"
																	stroke="#E5E7EB"
																	strokeWidth="3"
																/>
																<circle
																	cx="125"
																	cy="125"
																	r="100"
																	fill="none"
																	stroke="#5C7F4F"
																	strokeWidth="3"
																	strokeDasharray={`${2 * Math.PI * 100} ${2 * Math.PI * 100}`}
																	strokeDashoffset={
																		2 *
																		Math.PI *
																		100 *
																		(1 - techniqueProgress / 100)
																	}
																	transform="rotate(-90 125 125)"
																	strokeLinecap="round"
																	className="transition-all duration-1000"
																/>
															</svg>

															{/* Progress Bar */}
															<div className="absolute bottom-0 left-0 right-0">
																<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
																	<div
																		className="h-full transition-all duration-1000"
																		style={{
																			width: `${techniqueProgress}%`,
																			background:
																				techniqueProgress < 33
																					? "#EF4444"
																					: techniqueProgress < 66
																						? "#F59E0B"
																						: "#10B981",
																		}}
																	/>
																</div>
															</div>
														</div>
													</div>

													<h3
														className="font-semibold mb-3 text-center"
														style={{ color: "var(--primary-900)" }}
													>
														Five-Zone Recovery System:
													</h3>

													{/* Step by step instructions */}
													<div className="space-y-3 mb-4">
														<div className="flex items-start">
															<div className="w-8 h-8 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
																👁️
															</div>
															<div>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	Zone 1: Eye Relief (30s)
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	20-20-20 rule: Look 20+ feet away for 20
																	seconds. Blink 10 times. Palm press over
																	closed eyes.
																</p>
															</div>
														</div>

														<div className="flex items-start">
															<div className="w-8 h-8 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
																🎧
															</div>
															<div>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	Zone 2: Audio Recovery (30s)
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	Remove headphones. Massage ear cartilage. Pull
																	earlobes gently. 15 seconds of silence.
																</p>
															</div>
														</div>

														<div className="flex items-start">
															<div className="w-8 h-8 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
																🧘
															</div>
															<div>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	Zone 3: Posture Reset (30s)
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	Stand up if possible. Shoulder rolls back 3x.
																	Neck stretches. Squeeze shoulder blades.
																</p>
															</div>
														</div>

														<div className="flex items-start">
															<div className="w-8 h-8 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
																💻
															</div>
															<div>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	Zone 4: Screen Distance (20s)
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	Arm's length test. Screen top at eye level.
																	Reduce glare. Lean back to increase distance.
																</p>
															</div>
														</div>

														<div className="flex items-start">
															<div className="w-8 h-8 rounded-full bg-red-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
																😌
															</div>
															<div>
																<p
																	className="text-sm font-medium"
																	style={{ color: "#0D3A14" }}
																>
																	Zone 5: Facial Tension (40s)
																</p>
																<p
																	className="text-xs mt-1"
																	style={{ color: "#525252" }}
																>
																	Temple massage. Jaw release. Forehead smooth.
																	Eye squeeze then wide. Reset facial muscles.
																</p>
															</div>
														</div>
													</div>

													{/* Why This Works */}
													<div
														className="p-3 rounded-lg"
														style={{
															backgroundColor: "rgba(92, 127, 79, 0.1)",
														}}
													>
														<p
															className="text-xs font-medium mb-1"
															style={{ color: "#0D3A14" }}
														>
															Why This Works:
														</p>
														<p className="text-xs" style={{ color: "#3A3A3A" }}>
															VRI/remote interpreting creates unique physical
															strain. This systematic approach addresses all
															five zones of tech fatigue, preventing
															occupational injuries and maintaining
															interpretation accuracy.
														</p>
													</div>
												</>
											)}
										</div>
										<div className="space-y-2">
											{selectedTechnique === "emotion-mapping" && (
												<>
													{/* Modern Emotion Mapping Interface */}
													<div className="flex flex-col items-center mb-6">
														{/* Clean Header with Progress */}
														<div className="w-full max-w-md mb-6">
															<div className="flex items-center justify-between mb-2">
																<h3
																	className="text-lg font-semibold"
																	style={{ color: "#0D3A14" }}
																>
																	Emotion Mapping Journey
																</h3>
																<span
																	className="text-sm px-3 py-1 rounded-full"
																	style={{
																		backgroundColor: isTimerActive
																			? "rgba(147, 51, 234, 0.1)"
																			: "rgba(92, 127, 79, 0.1)",
																		color: isTimerActive
																			? "#9333EA"
																			: "#5C7F4F",
																	}}
																>
																	{Math.floor(techniqueProgress)}% Complete
																</span>
															</div>

															{/* Sleek Progress Bar */}
															<div className="h-1 bg-gray-200 rounded-full overflow-hidden">
																<div
																	className="h-full transition-all duration-500 ease-out rounded-full"
																	style={{
																		width: `${techniqueProgress}%`,
																		background:
																			"linear-gradient(90deg, #9333EA 0%, #7C3AED 100%)",
																	}}
																/>
															</div>
														</div>

														{/* Modern Card-Based Visualization */}
														<div className="w-full max-w-md">
															{/* Active Step Card */}
															<div
																className="bg-white rounded-xl shadow-lg p-6 mb-6"
																style={{
																	borderLeft: "4px solid #9333EA",
																	background:
																		"linear-gradient(to right, rgba(147, 51, 234, 0.03) 0%, white 100%)",
																}}
															>
																<div className="flex items-center mb-4">
																	<div
																		className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
																		style={{
																			backgroundColor:
																				"rgba(147, 51, 234, 0.1)",
																		}}
																	>
																		<span
																			className="text-lg font-bold"
																			style={{ color: "#9333EA" }}
																		>
																			{!isTimerActive
																				? "?"
																				: techniqueProgress < 17
																					? "1"
																					: techniqueProgress < 33
																						? "2"
																						: techniqueProgress < 50
																							? "3"
																							: techniqueProgress < 67
																								? "4"
																								: techniqueProgress < 83
																									? "5"
																									: "6"}
																		</span>
																	</div>
																	<div className="flex-1">
																		<h4
																			className="text-lg font-bold"
																			style={{ color: "#1F2937" }}
																		>
																			{!isTimerActive
																				? "Ready to Map Your Emotions"
																				: techniqueProgress < 17
																					? "Body Scanning"
																					: techniqueProgress < 33
																						? "Naming Neural State"
																						: techniqueProgress < 50
																							? "Emotional Granularity"
																							: techniqueProgress < 67
																								? "Understanding Triggers"
																								: techniqueProgress < 83
																									? "Regulation Strategy"
																									: "Integration"}
																		</h4>
																		<p
																			className="text-sm mt-1"
																			style={{ color: "#6B7280" }}
																		>
																			{!isTimerActive
																				? "Begin your post-interpretation check-in"
																				: techniqueProgress < 17
																					? "Notice: chest, stomach, jaw, shoulders"
																					: techniqueProgress < 33
																						? "High alert? Empathy overload? Dissociation?"
																						: techniqueProgress < 50
																							? "Be specific about what you're feeling"
																							: techniqueProgress < 67
																								? "What activated you during interpretation?"
																								: techniqueProgress < 83
																									? "Choose your regulation technique"
																									: "Document and integrate your insights"}
																		</p>
																	</div>
																</div>

																{/* Quick Tips for Current Step */}
																{isTimerActive && (
																	<div
																		className="mt-4 p-3 rounded-lg"
																		style={{
																			backgroundColor:
																				"rgba(147, 51, 234, 0.05)",
																		}}
																	>
																		<p
																			className="text-xs font-medium mb-1"
																			style={{ color: "#7C3AED" }}
																		>
																			Quick Tip:
																		</p>
																		<p
																			className="text-xs"
																			style={{ color: "#6B7280" }}
																		>
																			{techniqueProgress < 17
																				? "Your body holds the emotional residue of what you just interpreted."
																				: techniqueProgress < 33
																					? "Naming reduces amygdala activation by up to 50%."
																					: techniqueProgress < 50
																						? "Precision in naming emotions calms your limbic system."
																						: techniqueProgress < 67
																							? "Mirror neurons make you experience content as if it's yours."
																							: techniqueProgress < 83
																								? "Match your strategy to your current state for best results."
																								: "Regular mapping builds professional resilience over time."}
																		</p>
																	</div>
																)}
															</div>

															{/* Brain and Emotion Visualization */}
															<svg
																width="250"
																height="250"
																viewBox="0 0 250 250"
																className="relative z-10"
															>
																{/* Brain Outline */}
																<g transform="translate(125, 125)">
																	{/* Brain shape */}
																	<ellipse
																		cx="0"
																		cy="-10"
																		rx="60"
																		ry="50"
																		fill="none"
																		stroke="#9333EA"
																		strokeWidth="2"
																		opacity="0.3"
																	/>

																	{/* Neural activity zones */}
																	{techniqueProgress < 17 && isTimerActive && (
																		<g opacity="0.8">
																			{/* Body scan indicators */}
																			{[
																				{ x: 0, y: -30, label: "Head" },
																				{ x: -20, y: 0, label: "Chest" },
																				{ x: 20, y: 0, label: "Stomach" },
																				{ x: 0, y: 30, label: "Hands" },
																			].map((pos, i) => (
																				<g key={i}>
																					<circle
																						cx={pos.x}
																						cy={pos.y}
																						r="15"
																						fill="#F59E0B"
																						opacity="0.5"
																					>
																						<animate
																							attributeName="r"
																							values="15;20;15"
																							dur={`${2 + i * 0.3}s`}
																							repeatCount="indefinite"
																						/>
																					</circle>
																				</g>
																			))}
																		</g>
																	)}

																	{techniqueProgress >= 17 &&
																		techniqueProgress < 33 &&
																		isTimerActive && (
																			<g opacity="0.8">
																				{/* Neural state naming */}
																				<circle
																					cx="0"
																					cy="-10"
																					r="40"
																					fill="#3B82F6"
																					opacity="0.4"
																				>
																					<animate
																						attributeName="r"
																						values="40;45;40"
																						dur="3s"
																						repeatCount="indefinite"
																					/>
																				</circle>
																				<text
																					y="-5"
																					textAnchor="middle"
																					fontSize="12"
																					fill="#1E40AF"
																				>
																					Naming
																				</text>
																			</g>
																		)}

																	{techniqueProgress >= 33 &&
																		techniqueProgress < 50 &&
																		isTimerActive && (
																			<g opacity="0.8">
																				{/* Emotional granularity */}
																				{[0, 60, 120, 180, 240, 300].map(
																					(angle, i) => (
																						<circle
																							key={i}
																							cx={
																								Math.cos(
																									(angle * Math.PI) / 180,
																								) * 35
																							}
																							cy={
																								Math.sin(
																									(angle * Math.PI) / 180,
																								) *
																									35 -
																								10
																							}
																							r="8"
																							fill="#8B5CF6"
																							opacity="0.6"
																						>
																							<animate
																								attributeName="r"
																								values="8;12;8"
																								dur={`${2 + i * 0.2}s`}
																								repeatCount="indefinite"
																							/>
																						</circle>
																					),
																				)}
																			</g>
																		)}

																	{techniqueProgress >= 50 &&
																		techniqueProgress < 67 &&
																		isTimerActive && (
																			<g opacity="0.8">
																				{/* Trigger identification */}
																				<rect
																					x="-40"
																					y="-30"
																					width="80"
																					height="40"
																					rx="20"
																					fill="#DC2626"
																					opacity="0.3"
																				/>
																				<text
																					y="-5"
																					textAnchor="middle"
																					fontSize="12"
																					fill="#991B1B"
																				>
																					Triggers
																				</text>
																			</g>
																		)}

																	{techniqueProgress >= 67 &&
																		techniqueProgress < 83 &&
																		isTimerActive && (
																			<g opacity="0.8">
																				{/* Regulation strategy */}
																				<circle
																					cx="0"
																					cy="-10"
																					r="45"
																					fill="#10B981"
																					opacity="0.4"
																				>
																					<animate
																						attributeName="r"
																						values="45;50;45"
																						dur="3s"
																						repeatCount="indefinite"
																					/>
																				</circle>
																				<text
																					y="-5"
																					textAnchor="middle"
																					fontSize="12"
																					fill="#047857"
																				>
																					Regulate
																				</text>
																			</g>
																		)}

																	{techniqueProgress >= 83 && isTimerActive && (
																		<g opacity="0.8">
																			{/* Integration */}
																			<circle
																				cx="0"
																				cy="-10"
																				r="50"
																				fill="#5C7F4F"
																				opacity="0.5"
																			/>
																			<path
																				d="M -20,-20 Q -20,0 0,5 Q 20,0 20,-20 Q 0,-15 -20,-20 Z"
																				fill="#5C7F4F"
																				opacity="0.7"
																			/>
																			<text
																				y="-5"
																				textAnchor="middle"
																				fontSize="12"
																				fill="white"
																			>
																				Integrated
																			</text>
																		</g>
																	)}
																</g>

																{/* Progress Arc */}
																<circle
																	cx="125"
																	cy="125"
																	r="100"
																	fill="none"
																	stroke="#E5E7EB"
																	strokeWidth="3"
																/>
																<circle
																	cx="125"
																	cy="125"
																	r="100"
																	fill="none"
																	stroke="#9333EA"
																	strokeWidth="3"
																	strokeDasharray={`${2 * Math.PI * 100} ${2 * Math.PI * 100}`}
																	strokeDashoffset={
																		2 *
																		Math.PI *
																		100 *
																		(1 - techniqueProgress / 100)
																	}
																	transform="rotate(-90 125 125)"
																	strokeLinecap="round"
																	className="transition-all duration-1000"
																/>

																{/* Step indicators */}
																<text
																	x="125"
																	y="20"
																	textAnchor="middle"
																	fontSize="10"
																	fill={
																		techniqueProgress < 17
																			? "#9333EA"
																			: "#9CA3AF"
																	}
																>
																	Body Scan
																</text>
																<text
																	x="220"
																	y="75"
																	textAnchor="middle"
																	fontSize="10"
																	fill={
																		techniqueProgress >= 17 &&
																		techniqueProgress < 33
																			? "#9333EA"
																			: "#9CA3AF"
																	}
																>
																	Name
																</text>
																<text
																	x="220"
																	y="175"
																	textAnchor="middle"
																	fontSize="10"
																	fill={
																		techniqueProgress >= 33 &&
																		techniqueProgress < 50
																			? "#9333EA"
																			: "#9CA3AF"
																	}
																>
																	Specify
																</text>
																<text
																	x="125"
																	y="230"
																	textAnchor="middle"
																	fontSize="10"
																	fill={
																		techniqueProgress >= 50 &&
																		techniqueProgress < 67
																			? "#9333EA"
																			: "#9CA3AF"
																	}
																>
																	Triggers
																</text>
																<text
																	x="30"
																	y="175"
																	textAnchor="middle"
																	fontSize="10"
																	fill={
																		techniqueProgress >= 67 &&
																		techniqueProgress < 83
																			? "#9333EA"
																			: "#9CA3AF"
																	}
																>
																	Regulate
																</text>
																<text
																	x="30"
																	y="75"
																	textAnchor="middle"
																	fontSize="10"
																	fill={
																		techniqueProgress >= 83
																			? "#9333EA"
																			: "#9CA3AF"
																	}
																>
																	Integrate
																</text>
															</svg>

															{/* Progress Bar */}
															<div className="absolute bottom-0 left-0 right-0">
																<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
																	<div
																		className="h-full transition-all duration-1000"
																		style={{
																			width: `${techniqueProgress}%`,
																			backgroundColor: "#9333EA",
																		}}
																	/>
																</div>
															</div>
														</div>
													</div>

													<h3
														className="font-semibold mb-3 text-center"
														style={{ color: "var(--primary-900)" }}
													>
														Interpreter's Emotion Map:
													</h3>

													{/* Friendly Step-by-Step Guide Card */}
													<div
														className="bg-white rounded-xl shadow-md p-5 mb-4"
														style={{
															background:
																"linear-gradient(135deg, rgba(147, 51, 234, 0.03) 0%, rgba(124, 58, 237, 0.01) 100%)",
															border: "1px solid rgba(147, 51, 234, 0.1)",
														}}
													>
														{!isTimerActive ? (
															// Welcome message when not started
															<div className="text-center py-4">
																<div
																	className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
																	style={{
																		backgroundColor: "rgba(147, 51, 234, 0.1)",
																	}}
																>
																	<span className="text-2xl">💜</span>
																</div>
																<h3
																	className="text-lg font-semibold mb-2"
																	style={{ color: "#0D3A14" }}
																>
																	Ready for Your Emotional Check-In?
																</h3>
																<p
																	className="text-sm mb-3"
																	style={{ color: "#6B7280" }}
																>
																	Hey there! Let's take a moment to understand
																	what you're feeling after that interpretation
																	session. This is your time to process and
																	reset.
																</p>
																<p
																	className="text-xs italic"
																	style={{ color: "#9333EA" }}
																>
																	Remember: You just did important work. Your
																	emotions are valid data.
																</p>
															</div>
														) : (
															// Step-specific content
															<div>
																<div className="flex items-start mb-3">
																	<div
																		className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
																		style={{
																			backgroundColor:
																				techniqueProgress < 17
																					? "#F97316"
																					: techniqueProgress < 33
																						? "#3B82F6"
																						: techniqueProgress < 50
																							? "#8B5CF6"
																							: techniqueProgress < 67
																								? "#EF4444"
																								: techniqueProgress < 83
																									? "#10B981"
																									: "#6366F1",
																			color: "white",
																		}}
																	>
																		<span className="text-sm font-bold">
																			{techniqueProgress < 17
																				? "1"
																				: techniqueProgress < 33
																					? "2"
																					: techniqueProgress < 50
																						? "3"
																						: techniqueProgress < 67
																							? "4"
																							: techniqueProgress < 83
																								? "5"
																								: "6"}
																		</span>
																	</div>
																	<div className="flex-1">
																		<h4
																			className="text-base font-semibold mb-1"
																			style={{ color: "#1F2937" }}
																		>
																			{techniqueProgress < 17
																				? "Let's Check In With Your Body"
																				: techniqueProgress < 33
																					? "Now, Name What You're Experiencing"
																					: techniqueProgress < 50
																						? "Get Specific About Your Emotions"
																						: techniqueProgress < 67
																							? "What Triggered This Response?"
																							: techniqueProgress < 83
																								? "Choose Your Recovery Strategy"
																								: "Integrate and Document"}
																		</h4>
																		<p className="text-xs text-gray-500">
																			{techniqueProgress < 17
																				? "30 seconds"
																				: techniqueProgress < 33
																					? "30 seconds"
																					: techniqueProgress < 50
																						? "40 seconds"
																						: techniqueProgress < 67
																							? "40 seconds"
																							: techniqueProgress < 83
																								? "30 seconds"
																								: "30 seconds"}
																		</p>
																	</div>
																</div>

																<div className="pl-13">
																	<p
																		className="text-sm mb-3"
																		style={{
																			color: "#4B5563",
																			lineHeight: "1.6",
																		}}
																	>
																		{techniqueProgress < 17
																			? "Take a gentle moment to scan your body. Start with your chest - is it tight or relaxed? How about your stomach - any butterflies or tension? Check your jaw and shoulders too. These physical sensations are telling you something important about what you just experienced."
																			: techniqueProgress < 33
																				? "Okay, based on what you're feeling in your body, let's put a name to it. Are you in high alert mode? Feeling overwhelmed by empathy? Maybe a bit disconnected or containing some anger? Just naming it helps - it actually reduces your amygdala activation by up to 50%!"
																				: techniqueProgress < 50
																					? 'Let\'s get more precise here. Instead of just "upset," can you say "frustrated by the injustice I interpreted"? Or instead of "sad," maybe it\'s "grieving for the family\'s loss"? The more specific you are, the more your limbic system calms down. It\'s like your brain goes "Oh, we understand this now!"'
																					: techniqueProgress < 67
																						? "Think about what specifically activated you during that session. Was it personal resonance - did it remind you of your own experiences? Was it a clash with your values? Or maybe the power dynamics in the situation? Understanding your triggers helps you prepare for next time."
																						: techniqueProgress < 83
																							? "Based on what you're feeling, let's pick the right tool. If you're in high alert, try some long, slow exhales - they activate your parasympathetic nervous system. Feeling dissociated? Ground yourself by naming 5 things you can see right now. Match your strategy to your state for best results."
																							: 'Great work! Now let\'s capture this insight. Try completing this: "When I interpret [medical/legal/emotional] content, my [chest/jaw/shoulders] activates, signaling [specific emotion], and I need [grounding/breathing/movement]." This becomes your personal roadmap for resilience.'}
																	</p>

																	{/* Helpful prompts for each step */}
																	<div className="bg-purple-50 rounded-lg p-3 mb-3">
																		<p
																			className="text-xs font-medium mb-2"
																			style={{ color: "#7C3AED" }}
																		>
																			{techniqueProgress < 17
																				? "💭 Try this:"
																				: techniqueProgress < 33
																					? "💭 Ask yourself:"
																					: techniqueProgress < 50
																						? "💭 Consider:"
																						: techniqueProgress < 67
																							? "💭 Reflect:"
																							: techniqueProgress < 83
																								? "💭 Options:"
																								: "💭 Remember:"}
																		</p>
																		<p
																			className="text-xs"
																			style={{ color: "#6B7280" }}
																		>
																			{techniqueProgress < 17
																				? "Place one hand on your chest and one on your stomach. Which moves more when you breathe? That's where you're holding tension."
																				: techniqueProgress < 33
																					? '"If I had to describe this feeling to a friend, what would I say?" Sometimes the first word that comes is the right one.'
																					: techniqueProgress < 50
																						? "What would a therapist call this feeling? Being precise isn't about being fancy - it's about being accurate to YOUR experience."
																						: techniqueProgress < 67
																							? "No judgment here - triggers are information, not weaknesses. They show where you care deeply or where you need support."
																							: techniqueProgress < 83
																								? "You know yourself best. What has worked before? What does your body need right now? Trust your instincts."
																								: "This pattern recognition makes you a stronger interpreter. You're building emotional intelligence that protects both you and your work quality."}
																		</p>
																	</div>
																</div>
															</div>
														)}
													</div>

													{/* Why This Works */}
													<div
														className="p-3 rounded-lg"
														style={{
															backgroundColor: "rgba(92, 127, 79, 0.1)",
														}}
													>
														<p
															className="text-xs font-medium mb-1"
															style={{ color: "#0D3A14" }}
														>
															The Neuroscience:
														</p>
														<p className="text-xs" style={{ color: "#3A3A3A" }}>
															Your mirror neurons fire as if experiencing the
															content yourself. Your brain can't distinguish
															between interpreting trauma and experiencing it.
															Understanding your patterns builds professional
															resilience.
														</p>
													</div>
												</>
											)}
										</div>
									</>
								)}
							</div>

							{/* Progress Bar */}
							<div className="mb-6">
								<div
									className="h-3 rounded-full overflow-hidden"
									style={{ backgroundColor: "rgba(45, 95, 63, 0.2)" }}
								>
									<div
										className="h-full rounded-full transition-all duration-1000"
										style={{
											width: `${techniqueProgress}%`,
											backgroundColor: "#5C7F4F",
										}}
									/>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-4">
								{techniqueProgress > 0 && (
									<button
										onClick={() => {
											// Clear any running interval
											if (intervalRef.current) {
												clearInterval(intervalRef.current);
												intervalRef.current = null;
											}
											// Reset all states
											setIsTimerActive(false);
											setTechniqueProgress(0);
											setBodyPart(0);
											setBreathPhase("inhale");
											setBreathCycle(0);
											setSenseCount(0);
											setExpansionLevel(0);
										}}
										className="px-6 py-3 rounded-xl font-medium transition-all"
										style={{
											backgroundColor: "rgba(239, 68, 68, 0.1)",
											color: "#EF4444",
											border: "2px solid #EF4444",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = "#EF4444";
											e.currentTarget.style.color = "#FFFFFF";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor =
												"rgba(239, 68, 68, 0.1)";
											e.currentTarget.style.color = "#EF4444";
										}}
									>
										Reset
									</button>
								)}
								{/* Manual Navigation Controls */}
								{!isTimerActive ? (
									<button
										onClick={() => {
											// Start the practice in manual mode
											setIsTimerActive(true);
											setTechniqueProgress(0);
											setBreathPhase("inhale");
											setBreathCycle(0);
											setBodyPart(0);
											setSenseCount(0);
											setExpansionLevel(0);
										}}
										className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
										style={{
											background:
												"linear-gradient(145deg, #1A3D26 0%, #0F2818 100%)",
											color: "#FFFFFF",
											boxShadow: "0 4px 15px rgba(107, 139, 96, 0.3)",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.transform = "translateY(-2px)";
											e.currentTarget.style.boxShadow =
												"0 6px 20px rgba(107, 139, 96, 0.4)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.transform = "translateY(0)";
											e.currentTarget.style.boxShadow =
												"0 4px 15px rgba(107, 139, 96, 0.3)";
										}}
									>
										Begin Practice
									</button>
								) : (
									<div className="flex gap-3 w-full">
										{techniqueProgress > 0 && (
											<button
												onClick={() => {
													// Go to previous step
													if (selectedTechnique === "emotion-mapping") {
														const currentStep = Math.floor(
															techniqueProgress / 16.67,
														);
														setTechniqueProgress(
															Math.max(0, (currentStep - 1) * 16.67),
														);
													} else if (selectedTechnique === "body-release") {
														setBodyPart(Math.max(0, bodyPart - 1));
														setTechniqueProgress(bodyPart * 20);
													} else if (selectedTechnique === "box-breathing") {
														const phases = [
															"inhale",
															"hold-in",
															"exhale",
															"hold-out",
														];
														const currentIndex = phases.indexOf(breathPhase);
														const prevIndex =
															currentIndex > 0 ? currentIndex - 1 : 3;
														setBreathPhase(
															phases[prevIndex] as
																| "inhale"
																| "hold-in"
																| "exhale"
																| "hold-out",
														);
													} else if (
														selectedTechnique === "tech-fatigue-reset"
													) {
														setTechniqueProgress(
															Math.max(0, techniqueProgress - 20),
														);
													} else {
														setTechniqueProgress(
															Math.max(0, techniqueProgress - 25),
														);
													}
												}}
												className="px-4 py-3 rounded-xl font-medium transition-all"
												style={{
													backgroundColor: "rgba(107, 114, 128, 0.1)",
													color: "#4B5563",
													border: "2px solid #E5E7EB",
												}}
											>
												← Previous
											</button>
										)}

										<button
											onClick={() => {
												// Go to next step or complete
												if (selectedTechnique === "emotion-mapping") {
													const nextProgress = Math.min(
														100,
														techniqueProgress + 16.67,
													);
													setTechniqueProgress(nextProgress);
													if (nextProgress >= 100) {
														setIsTimerActive(false);
													}
												} else if (selectedTechnique === "body-release") {
													if (bodyPart < 4) {
														setBodyPart(bodyPart + 1);
														setTechniqueProgress((bodyPart + 1) * 20);
													} else {
														setTechniqueProgress(100);
														setIsTimerActive(false);
													}
												} else if (selectedTechnique === "box-breathing") {
													const phases = [
														"inhale",
														"hold-in",
														"exhale",
														"hold-out",
													];
													const currentIndex = phases.indexOf(breathPhase);
													const nextIndex = (currentIndex + 1) % 4;
													setBreathPhase(
														phases[nextIndex] as
															| "inhale"
															| "hold-in"
															| "exhale"
															| "hold-out",
													);
													setBreathCycle(breathCycle + 1);
												} else if (selectedTechnique === "tech-fatigue-reset") {
													const nextProgress = Math.min(
														100,
														techniqueProgress + 20,
													);
													setTechniqueProgress(nextProgress);
													if (nextProgress >= 100) {
														setIsTimerActive(false);
													}
												} else if (selectedTechnique === "sensory-reset") {
													if (senseCount < 4) {
														setSenseCount(senseCount + 1);
														setTechniqueProgress((senseCount + 1) * 25);
													} else {
														setTechniqueProgress(100);
														setIsTimerActive(false);
													}
												} else {
													const nextProgress = Math.min(
														100,
														techniqueProgress + 25,
													);
													setTechniqueProgress(nextProgress);
													if (nextProgress >= 100) {
														setIsTimerActive(false);
													}
												}
											}}
											className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
											style={{
												background:
													techniqueProgress >= 83
														? "linear-gradient(145deg, #10B981 0%, #059669 100%)"
														: "linear-gradient(145deg, #5B9378 0%, #5F7F55 100%)",
												color: "#FFFFFF",
												boxShadow: "0 4px 15px rgba(107, 139, 96, 0.3)",
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform = "translateY(-2px)";
												e.currentTarget.style.boxShadow =
													"0 6px 20px rgba(107, 139, 96, 0.4)";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform = "translateY(0)";
												e.currentTarget.style.boxShadow =
													"0 4px 15px rgba(107, 139, 96, 0.3)";
											}}
										>
											{techniqueProgress >= 83 ? "Complete" : "Next Step →"}
										</button>

										<button
											onClick={() => {
												// End practice
												setIsTimerActive(false);
												setTechniqueProgress(0);
												setBreathPhase("inhale");
												setBreathCycle(0);
												setBodyPart(0);
												setSenseCount(0);
												setExpansionLevel(0);
											}}
											className="px-4 py-3 rounded-xl font-medium transition-all"
											style={{
												backgroundColor: "rgba(239, 68, 68, 0.1)",
												color: "#EF4444",
												border: "2px solid #EF4444",
											}}
										>
											End
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);

	const renderReflectionStudio = () => {
		console.log("renderReflectionStudio called");

		// Group cards by category
		const categories = [
			"Assignment Workflow",
			"Team Collaboration",
			"Professional Growth",
			"Wellness & Boundaries",
			"Identity-Affirming"
		];

		return (
		<main
			className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
			role="main"
			aria-labelledby="reflection-studio-heading"
		>
			{/* Main Content */}
			<div className="space-y-8">
				{/* Header */}
				<div className="mb-8 text-center">
					<h2
						id="reflection-studio-heading"
						className="text-4xl font-bold mb-3"
						style={{ color: "#1A1A1A", letterSpacing: "-0.5px" }}
					>
						Reflection Studio
					</h2>
					<p
						className="text-lg"
						style={{ color: "#3A3A3A", fontWeight: "400" }}
					>
						Choose a reflection to get started
					</p>
				</div>

				{/* Content */}
				<div
					role="tabpanel"
					id="structured-panel"
					aria-labelledby="structured-tab"
				>
					{/* Render cards grouped by category */}
					{categories.map((category) => {
						const cardsInCategory = reflectionCards.filter(card => card.category === category);
						if (cardsInCategory.length === 0) return null;

						return (
							<div key={category} className="mb-12">
								{/* Category Header */}
								<h3
									className="text-xl font-bold mb-6 pb-2 border-b-2"
									style={{
										color: "#1A3D26",
										borderColor: "#5C7F4F"
									}}
								>
									{category}
								</h3>

								{/* Reflection Cards Grid */}
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
									{cardsInCategory.map((card, index) => (
										<article
											key={index}
											tabIndex={0}
											role="button"
											aria-label={`${card.title} reflection card`}
											className="rounded-xl p-6 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600 relative"
											style={{
												backgroundColor: "var(--bg-card)",
												border: "2px solid transparent",
												boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
												transform: "translateY(0)",
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.borderColor =
													"var(--primary-800)";
												e.currentTarget.style.boxShadow =
													"0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)";
												e.currentTarget.style.transform =
													"translateY(-4px) scale(1.02)";
												e.currentTarget.style.boxShadow =
													"0 8px 25px rgba(92, 127, 79, 0.25)";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.borderColor = "transparent";
												e.currentTarget.style.transform =
													"translateY(0) scale(1)";
												e.currentTarget.style.boxShadow =
													"0 4px 15px rgba(0, 0, 0, 0.05)";
											}}
											onFocus={(e) => {
												e.currentTarget.style.borderColor = "#5C7F4F";
												e.currentTarget.style.transform =
													"translateY(-4px) scale(1.02)";
												e.currentTarget.style.boxShadow =
													"0 8px 25px rgba(45, 95, 63, 0.25)";
												e.currentTarget.style.outline = "2px solid #5C7F4F";
												e.currentTarget.style.outlineOffset = "2px";
											}}
											onBlur={(e) => {
												e.currentTarget.style.borderColor = "transparent";
												e.currentTarget.style.transform =
													"translateY(0) scale(1)";
												e.currentTarget.style.boxShadow =
													"0 4px 15px rgba(0, 0, 0, 0.05)";
												e.currentTarget.style.outline = "none";
											}}
											onKeyDown={(e) => {
												// Due to role="button", ANY key press triggers onClick
												// Blur the element immediately to remove focus styles before modal opens
												// Allow Tab key to pass through for navigation
												if (e.key !== "Tab") {
													e.currentTarget.blur();
												}
											}}
											onClick={(e) => {
												// Immediately reset transform styles to prevent card from appearing above modal
												e.currentTarget.style.transform = "translateY(0) scale(1)";
												e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.05)";
												e.currentTarget.style.borderColor = "transparent";
												e.currentTarget.style.outline = "none";
												// Blur the element to trigger onBlur cleanup
												e.currentTarget.blur();

												startTransition(() => {
													if (card.title === "Pre-Assignment Prep") {
														setShowPreAssignmentPrep(true);
													} else if (card.title === "Post-Assignment Debrief") {
														setShowPostAssignmentDebrief(true);
													} else if (card.title === "Team Prep") {
														setShowTeamingPrep(true);
													} else if (card.title === "Team Reflection") {
														setShowTeamingReflection(true);
													} else if (card.title === "Mentoring Prep") {
														setShowMentoringPrep(true);
													} else if (card.title === "Mentoring Reflection") {
														setShowMentoringReflection(true);
													} else if (card.title === "Wellness Check-in") {
														setShowWellnessCheckIn(true);
													} else if (card.title === "Emotion Clarity Practice") {
														setShowEmotionClarity(true);
													} else if (card.title === "Values Alignment Check-In") {
														setShowEthicsMeaningCheck(true);
													} else if (card.title === "In-Session Self-Check") {
														setShowInSessionSelfCheck(true);
													} else if (card.title === "Role-Space Reflection") {
														setShowRoleSpaceReflection(true);
													} else if (
														card.title === "Supporting Direct Communication"
													) {
														setShowDirectCommunicationReflection(true);
													} else if (card.title === "DECIDE Framework") {
														setShowDecideFramework(true);
													} else if (card.title === "BIPOC Interpreter Wellness") {
														setShowBIPOCWellness(true);
													} else if (card.title === "Deaf Interpreter Professional Identity") {
														setShowDeafInterpreter(true);
													} else if (card.title === "Neurodivergent Interpreter Wellness") {
														setShowNeurodivergentInterpreter(true);
													}
													// Add handlers for other cards here as needed
												});
											}}
										>
											{/* Progress Tracking Badge */}
											{card.tracksProgress && (
												<div
													className="absolute top-3 right-3 px-2 py-1 rounded-md flex items-center gap-1"
													style={{
														backgroundColor: "rgba(92, 127, 79, 0.1)",
														border: "1px solid rgba(92, 127, 79, 0.3)"
													}}
													title={card.trackingInfo || "This reflection saves data to your Growth Insights dashboard"}
												>
													<svg
														width="14"
														height="14"
														viewBox="0 0 24 24"
														fill="none"
														stroke="#5C7F4F"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													>
														<line x1="12" y1="20" x2="12" y2="10"></line>
														<line x1="18" y1="20" x2="18" y2="4"></line>
														<line x1="6" y1="20" x2="6" y2="16"></line>
													</svg>
													<span
														className="text-[10px] font-semibold"
														style={{ color: "#5C7F4F" }}
													>
														Tracked
													</span>
												</div>
											)}

											<div className="mb-4">
												<card.icon 
													size={40} 
													aria-hidden="true"
													color={card.iconColor}
													strokeWidth={1.5}
												/>
											</div>

											<h3
												className="text-lg font-bold mb-3"
												style={{ color: "#0D3A14" }}
											>
												{card.title}
											</h3>

											<p
												className="text-sm mb-4 leading-relaxed"
												style={{ color: "#3A3A3A", lineHeight: "1.6" }}
											>
												{card.description}
											</p>

											{/* Tracking Info */}
											{card.trackingInfo && (
												<div
													className="mb-4 px-3 py-2 rounded-lg text-xs leading-relaxed"
													style={{
														backgroundColor: "rgba(92, 127, 79, 0.08)",
														border: "1px solid rgba(92, 127, 79, 0.2)",
														color: "#3A3A3A"
													}}
												>
													📊 {card.trackingInfo}
												</div>
											)}


										</article>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</main>
		);
	};

	const renderReflectionStudioModals = () => (
		<>
			{/* Pre-Assignment Prep Modal */}
			{showPreAssignmentPrep && (
				<PreAssignmentPrepV6
					onComplete={(data) => {
						console.log("Pre-Assignment Prep Results:", data);
						// Data is automatically saved to Supabase in the component
						// Close the modal immediately
						setShowPreAssignmentPrep(false);

						// Show success toast on the main page after modal closes
						setTimeout(() => {
							setShowReflectionSuccessToast(true);
						}, 300);

						// Trigger a reflections reload after a short delay
						setTimeout(() => {
							loadReflections();
							// Also reload confidence data for Growth Snapshot
							loadReflectionData();
						}, 500);
					}}
					onClose={() => setShowPreAssignmentPrep(false)}
				/>
			)}

			{/* Post-Assignment Debrief Modal */}
			{showPostAssignmentDebrief &&
				console.log(
					"App.tsx - showPostAssignmentDebrief is true, rendering component",
				)}
			{showPostAssignmentDebrief && (
				<PostAssignmentDebriefAccessible
					onComplete={async (data) => {
						console.log(
							"PostAssignmentDebriefAccessible - onComplete called with:",
							data,
						);
						console.log("Post-Assignment Debrief Results:", data);
						// Close the modal immediately
						setShowPostAssignmentDebrief(false);

						// Show success toast on the main page after modal closes
						setTimeout(() => {
							setShowReflectionSuccessToast(true);
						}, 300);

						// Reload reflections to show the new one
						if (user?.id) {
							const { reflectionService } = await import(
								"./services/reflectionService"
							);
							const reflections = await reflectionService.getUserReflections(
								user.id,
								10,
							);
							if (reflections) {
								const formattedReflections = reflections.map((r) => ({
									id: r.id || Date.now().toString(),
									type: r.entry_kind || "reflection",
									data: r.data || {},
									timestamp: r.created_at || new Date().toISOString(),
								}));
								setSavedReflections(formattedReflections);
							}
						}
					}}
					onClose={() => setShowPostAssignmentDebrief(false)}
				/>
			)}

			{/* Teaming Prep Modal */}
			{showTeamingPrep && (
				<TeamingPrepEnhanced
					onComplete={async (data) => {
						console.log("Team Prep Results:", data);
						// Data is automatically saved to Supabase in the component
						// Close the modal immediately
						setShowTeamingPrep(false);

						// Show success toast on the main page after modal closes
						setTimeout(() => {
							setShowReflectionSuccessToast(true);
						}, 300);

						// Reload reflections to show the new one
						if (user?.id) {
							const { reflectionService } = await import(
								"./services/reflectionService"
							);
							const reflections = await reflectionService.getUserReflections(
								user.id,
								10,
							);
							if (reflections) {
								const formattedReflections = reflections.map((r) => ({
									id: r.id || Date.now().toString(),
									type: r.entry_kind || "reflection",
									data: r.data || {},
									timestamp: r.created_at || new Date().toISOString(),
								}));
								setSavedReflections(formattedReflections);
							}
						}
					}}
					onClose={() => setShowTeamingPrep(false)}
				/>
			)}

			{/* Teaming Reflection Modal */}
			{showTeamingReflection && (
				<TeamingReflectionEnhanced
					onComplete={async (data) => {
						console.log("Team Reflection Results:", data);
						// Data is automatically saved to Supabase in the component
						// Close the modal immediately
						setShowTeamingReflection(false);

						// Show success toast on the main page after modal closes
						setTimeout(() => {
							setShowReflectionSuccessToast(true);
						}, 300);

						// Reload reflections to show the new one
						if (user?.id) {
							const { reflectionService } = await import(
								"./services/reflectionService"
							);
							const reflections = await reflectionService.getUserReflections(
								user.id,
								10,
							);
							if (reflections) {
								const formattedReflections = reflections.map((r) => ({
									id: r.id || Date.now().toString(),
									type: r.entry_kind || "reflection",
									data: r.data || {},
									created_at: r.created_at || new Date().toISOString(),
								}));
								setRecentReflections(formattedReflections);
							}
						}
					}}
					onClose={() => setShowTeamingReflection(false)}
				/>
			)}

			{/* Mentoring Prep Modal */}
			{showMentoringPrep && (
				<MentoringPrepAccessible
					onComplete={async (data) => {
						console.log("Mentoring Prep Results:", data);
						// Close the modal immediately
						setShowMentoringPrep(false);

						// Show success toast on the main page after modal closes
						setTimeout(() => {
							setShowReflectionSuccessToast(true);
						}, 300);

						// Reload reflections to show the new one
						if (user?.id) {
							const { reflectionService } = await import(
								"./services/reflectionService"
							);
							const reflections = await reflectionService.getUserReflections(
								user.id,
								10,
							);
							if (reflections) {
								const formattedReflections = reflections.map((r) => ({
									id: r.id || Date.now().toString(),
									type: r.entry_kind || "reflection",
									data: r.data || {},
									timestamp: r.created_at || new Date().toISOString(),
								}));
								setSavedReflections(formattedReflections);
							}
						}
					}}
					onClose={() => setShowMentoringPrep(false)}
				/>
			)}

			{/* Mentoring Reflection Modal */}
			{showMentoringReflection && (
				<MentoringReflectionAccessible
					onComplete={async (results) => {
						console.log("Mentoring Reflection Results:", results);
						// Close the modal immediately
						setShowMentoringReflection(false);

						// Show success toast on the main page after modal closes
						setTimeout(() => {
							setShowReflectionSuccessToast(true);
						}, 300);

						// Reload reflections to show the new one
						if (user?.id) {
							const { reflectionService } = await import(
								"./services/reflectionService"
							);
							const reflections = await reflectionService.getUserReflections(
								user.id,
								10,
							);
							if (reflections) {
								const formattedReflections = reflections.map((r) => ({
									id: r.id || Date.now().toString(),
									type: r.entry_kind || "reflection",
									data: r.data || {},
									timestamp: r.created_at || new Date().toISOString(),
								}));
								setSavedReflections(formattedReflections);
							}
						}
					}}
					onClose={() => setShowMentoringReflection(false)}
				/>
			)}

			{/* Role-Space Reflection Modal */}
			{showRoleSpaceReflection && (
				<RoleSpaceReflection
					onComplete={async (data) => {
						console.log("Role-Space Reflection Results:", data);
						// Close the modal immediately
						setShowRoleSpaceReflection(false);

						// Show success toast on the main page after modal closes
						setTimeout(() => {
							setShowReflectionSuccessToast(true);
						}, 300);

						// Reload reflections to show the new one
						if (user?.id) {
							const { reflectionService } = await import(
								"./services/reflectionService"
							);
							const reflections = await reflectionService.getUserReflections(
								user.id,
								10,
							);
							if (reflections) {
								const formattedReflections = reflections.map((r) => ({
									id: r.id || Date.now().toString(),
									type: r.entry_kind || "reflection",
									data: r.data || {},
									timestamp: r.created_at || new Date().toISOString(),
								}));
								setSavedReflections(formattedReflections);
							}
						}
					}}
					onClose={() => setShowRoleSpaceReflection(false)}
				/>
			)}

			{/* Supporting Direct Communication Modal */}
			{showDirectCommunicationReflection && (
				<DirectCommunicationReflection
					onComplete={async (data) => {
						console.log("Direct Communication Reflection Results:", data);
						// Close the modal immediately
						setShowDirectCommunicationReflection(false);

						// Show success toast on the main page after modal closes
						setTimeout(() => {
							setShowReflectionSuccessToast(true);
						}, 300);

						// Reload reflections to show the new one
						if (user?.id) {
							const { reflectionService } = await import(
								"./services/reflectionService"
							);
							const reflections = await reflectionService.getUserReflections(
								user.id,
								10,
							);
							if (reflections) {
								const formattedReflections = reflections.map((r) => ({
									id: r.id || Date.now().toString(),
									type: r.entry_kind || "reflection",
									data: r.data || {},
									timestamp: r.created_at || new Date().toISOString(),
								}));
								setSavedReflections(formattedReflections);
							}
						}
					}}
					onClose={() => setShowDirectCommunicationReflection(false)}
				/>
			)}

			{/* DECIDE Framework Modal */}
			{showDecideFramework && (
				<DecideFrameworkReflection
					onComplete={async (data) => {
						console.log("DECIDE Framework Reflection Results:", data);
						// Close the modal immediately
						setShowDecideFramework(false);

						// Show success toast on the main page after modal closes
						setTimeout(() => {
							setShowReflectionSuccessToast(true);
						}, 300);

						// Save to Supabase
						if (user?.id) {
							const { reflectionService } = await import(
								"./services/reflectionService"
							);

							// Save the reflection
							await reflectionService.saveReflection(
								user.id,
								"decide_framework",
								data,
							);

							// Reload reflections to show the new one
							const reflections = await reflectionService.getUserReflections(
								user.id,
								10,
							);
							if (reflections) {
								const formattedReflections = reflections.map((r) => ({
									id: r.id || Date.now().toString(),
									type: r.entry_kind || "reflection",
									data: r.data || {},
									timestamp: r.created_at || new Date().toISOString(),
								}));
								setSavedReflections(formattedReflections);
							}
						}
					}}
					onClose={() => setShowDecideFramework(false)}
				/>
			)}

			{/* BIPOC Interpreter Wellness Modal */}
			{showBIPOCWellness && (
				<BIPOCWellnessReflection
					onClose={() => setShowBIPOCWellness(false)}
				/>
			)}

			{/* Deaf Interpreter Professional Identity Modal */}
			{showDeafInterpreter && (
				<DeafInterpreterReflection
					onClose={() => setShowDeafInterpreter(false)}
				/>
			)}

			{/* Neurodivergent Interpreter Wellness Modal */}
			{showNeurodivergentInterpreter && (
				<NeurodivergentInterpreterReflection
					onClose={() => setShowNeurodivergentInterpreter(false)}
					onComplete={async (data) => {
						console.log("Neurodivergent Interpreter Reflection completed:", data);
						// Close the modal immediately
						setShowNeurodivergentInterpreter(false);

						// Show success toast on the main page after modal closes
						setTimeout(() => {
							setShowReflectionSuccessToast(true);
						}, 300);

						// Reload reflections to show the new one
						if (user?.id) {
							await loadReflections(user.id);
						}
					}}
				/>
			)}

			{showWellnessCheckIn && (
				<WellnessCheckInAccessible
					onComplete={async (results) => {
						// WellnessCheckInAccessible already saves internally, no need to save again
						// Close the modal immediately
						setShowWellnessCheckIn(false);

						// Show success toast on the main page after modal closes
						setTimeout(() => {
							setShowReflectionSuccessToast(true);
						}, 300);

						// Reload reflections to show the new one
						if (user?.id) {
							const { reflectionService } = await import(
								"./services/reflectionService"
							);
							const reflections = await reflectionService.getUserReflections(
								user.id,
								10,
							);
							if (reflections) {
								const formattedReflections = reflections.map((r) => ({
									id: r.id || Date.now().toString(),
									type: r.entry_kind || "reflection",
									data: r.data || {},
									timestamp: r.created_at || new Date().toISOString(),
								}));
								setSavedReflections(formattedReflections);
							}
						}
					}}
					onClose={() => setShowWellnessCheckIn(false)}
				/>
			)}

			{showInSessionSelfCheck && (
				<InSessionSelfCheck
					onComplete={(results) => {
						// InSessionSelfCheck already saves internally, no need to save again
						// Close the modal immediately
						setShowInSessionSelfCheck(false);

						// Show success toast on the main page after modal closes
						setTimeout(() => {
							setShowReflectionSuccessToast(true);
						}, 300);
					}}
					onClose={() => setShowInSessionSelfCheck(false)}
				/>
			)}

			{/* Daily Burnout Gauge Modal */}
		</>
	);

	// Show loading state while checking authentication
	if (loading) {
		return (
			<div
				className="min-h-screen flex items-center justify-center"
				style={{
					background: "linear-gradient(180deg, #FAF9F6 0%, #F0EDE8 100%)",
				}}
			>
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	// Show landing page if not authenticated
	console.log("App: Checking route - user:", user, "loading:", loading);
	if (!user) {
		console.log("App: Showing landing page routes");
		return (
			<>
				<SessionExpiredModal
					isOpen={showSessionExpiredModal}
					onSignIn={() => {
						setShowSessionExpiredModal(false);
						navigate("/");
					}}
				/>
				<Routes>
				<Route path="/privacy" element={<PrivacyPolicy />} />
				<Route path="/terms" element={<TermsOfService />} />
				<Route path="/contact" element={<Contact />} />
				<Route path="/about" element={<About />} />
				<Route path="/accessibility" element={<Accessibility />} />
				<Route path="/research" element={<Research />} />
				<Route path="/pricing" element={<PricingNew />} />
				<Route path="/signup" element={<SeamlessSignup />} />
				<Route path="/payment-success" element={<PaymentSuccess />} />
				<Route path="/reset-password" element={<ResetPassword />} />
				<Route
					path="/landing"
					element={
						<LandingPageEnhanced onGetStarted={() => navigate("/signup")} />
					}
				/>
				<Route
					path="*"
					element={
						<LandingPageEnhanced onGetStarted={() => navigate("/signup")} />
					}
				/>
			</Routes>
			</>
		);
	}

	// Show main app for authenticated users or dev mode
	return (
		<SubscriptionGate>
			<SessionExpiredModal
				isOpen={showSessionExpiredModal}
				onSignIn={() => {
					setShowSessionExpiredModal(false);
					navigate("/");
				}}
			/>
			<Routes>
				<Route path="/privacy" element={<PrivacyPolicy />} />
				<Route path="/terms" element={<TermsOfService />} />
				<Route path="/contact" element={<Contact />} />
				<Route path="/about" element={<About />} />
				<Route path="/accessibility" element={<Accessibility />} />
				<Route path="/research" element={<Research />} />
				<Route path="/pricing" element={<PricingProduction />} />
				<Route path="/signup" element={<SeamlessSignup />} />
				<Route path="/pricing-old" element={<PricingNew />} />
				<Route path="/pricing-test" element={<PricingTest />} />
				<Route path="/admin" element={<AdminDashboard />} />
				<Route path="/header-demo" element={<HeaderDemo />} />
				<Route path="/payment-success" element={<PaymentSuccess />} />
				<Route path="/reset-password" element={<ResetPassword />} />
				<Route
					path="/landing"
					element={
						<LandingPageEnhanced onGetStarted={() => navigate("/signup")} />
					}
				/>
				<Route path="/growth-insights" element={<GrowthInsights />} />
				<Route path="/growth-dashboard" element={<GrowthInsightsDashboard />} />
				<Route path="/auth-test" element={<AuthTest />} />
				<Route path="/pre-assignment" element={<PreAssignmentPrepV5 />} />
				<Route
					path="/profile-settings"
					element={<ProfileSettings />}
				/>
				<Route
					path="/customize-preferences"
					element={<CustomizePreferences />}
				/>
				<Route path="/manage-subscription" element={<ManageSubscription />} />
				<Route path="/billing-plan-details" element={<BillingPlanDetails />} />
				<Route
					path="*"
					element={
						<div
							className="min-h-screen"
							style={{
								backgroundColor: "#FAF8F5",
								minHeight: "100vh",
							}}
						>
							{/* Skip to main content link for screen readers */}
							<a href="#main-content" className="skip-link">
								Skip to main content
							</a>

							<Header
								user={user}
								showUserDropdown={showUserDropdown}
								setShowUserDropdown={setShowUserDropdown}
								signOut={signOut}
							/>

							<NavigationTabs
								activeTab={activeTab}
								setActiveTab={setActiveTab}
							/>

							{/* Main content area with proper semantic structure */}
							<main id="main-content" role="main" className="flex-1">
								<div
									role="tabpanel"
									id={`${activeTab}-panel`}
									aria-labelledby={activeTab}
								>
									{activeTab === "reflection" && renderReflectionStudio()}
									{activeTab === "home" && (
										<PersonalizedHomepage
											onNavigate={setActiveTab}
											reflections={savedReflections}
											onReflectionDeleted={(reflectionId) => {
												// Update the saved reflections in parent state
												setSavedReflections((prev) =>
													prev.filter((r) => r.id !== reflectionId),
												);
												console.log(
													"Reflection deleted from parent state:",
													reflectionId,
												);
											}}
										/>
									)}
									{activeTab === "stress" && renderStressReset()}
									{activeTab === "affirmations" && <AffirmationsView />}
									{activeTab === "insights" && renderGrowthInsights()}
								</div>
							</main>

							{/* Render Reflection Studio Modals */}
							{activeTab === "reflection" && renderReflectionStudioModals()}

							{/* Breathing Practice Modal */}
							{showBreathingPractice && (
								<BreathingPractice
									mode={breathingMode}
									onClose={() => {
										setShowBreathingPractice(false);
										if (currentTechniqueId) {
											trackTechniqueComplete(currentTechniqueId, "completed");
											setCurrentTechniqueId(null);
										}
									}}
									onComplete={() => {
										if (currentTechniqueId) {
											trackTechniqueComplete(currentTechniqueId, "completed");
											setCurrentTechniqueId(null);
										}
										setShowBreathingPractice(false);
									}}
								/>
							)}



						{showInteroceptiveScan && (
							<InteroceptiveScan
								onClose={() => {
									setShowInteroceptiveScan(false);
									if (currentTechniqueId) {
										trackTechniqueComplete(currentTechniqueId, "completed");
										setCurrentTechniqueId(null);
									}
								}}
							/>
						)}

							{/* Breathing Practice Why It Works Modal */}
							{showBreathingModal && (
								<div
									className="fixed inset-0 z-50 flex items-center justify-center p-4"
									style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
									onClick={() => setShowBreathingModal(false)}
									role="dialog"
									aria-modal="true"
									aria-labelledby="breathing-modal-title"
								>
									<div
										className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
										style={{
											backgroundColor: "var(--bg-card)",
											boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
										}}
										onClick={(e) => e.stopPropagation()}
									>
										<div className="p-8">
											<header className="mb-6">
												<h2
													id="breathing-modal-title"
													className="text-2xl font-bold mb-3"
													style={{ color: selectedTechnique === "breathe-protocol" ? "#5B21B6" : "#0D3A14" }}
												>
													{selectedTechnique === "breathe-protocol" ? "Why BREATHE Protocol Works" : "Why Breathing Works"}
												</h2>
												<p className="text-sm" style={{ color: "#3A3A3A" }}>
													{selectedTechnique === "breathe-protocol"
														? "A reflective framework for interpreter stress management"
														: "The neuroscience behind controlled breathing for interpreter recovery"}
												</p>
											</header>

											<section className="space-y-6">
												{selectedTechnique === "breathe-protocol" ? (
													<>
														<article>
															<h3
																className="text-lg font-semibold mb-2"
																style={{ color: "#5B21B6" }}
															>
																Reflective Question Framework
															</h3>
															<p
																className="text-sm mb-2"
																style={{ color: "#2A2A2A" }}
															>
																<strong>Cognitive restructuring:</strong>{" "}
																Targeted questions activate your prefrontal cortex,
																shifting you from reactive stress responses to thoughtful
																reflection and problem-solving.
															</p>
															<p className="text-sm" style={{ color: "#3A3A3A" }}>
																Each question in the protocol guides you through a specific
																aspect of stress management, building resilience systematically.
															</p>
														</article>
														<article>
															<h3
																className="text-lg font-semibold mb-2"
																style={{ color: "#5B21B6" }}
															>
																The 7-Step Process
															</h3>
															<div className="space-y-3">
																<div>
																	<p className="text-sm font-semibold" style={{ color: "#5B21B6" }}>B – Breathe</p>
																	<p className="text-sm" style={{ color: "#2A2A2A" }}>
																		"When and how would 4-7-8 breathing help you now?"
																	</p>
																</div>
																<div>
																	<p className="text-sm font-semibold" style={{ color: "#5B21B6" }}>R – Recognize</p>
																	<p className="text-sm" style={{ color: "#2A2A2A" }}>
																		"What emotions need your attention right now?"
																	</p>
																</div>
																<div>
																	<p className="text-sm font-semibold" style={{ color: "#5B21B6" }}>E – Evaluate</p>
																	<p className="text-sm" style={{ color: "#2A2A2A" }}>
																		"How is this emotion affecting your interpreting?"
																	</p>
																</div>
																<div>
																	<p className="text-sm font-semibold" style={{ color: "#5B21B6" }}>A – Adjust</p>
																	<p className="text-sm" style={{ color: "#2A2A2A" }}>
																		"What physical adjustments would help you shift?"
																	</p>
																</div>
																<div>
																	<p className="text-sm font-semibold" style={{ color: "#5B21B6" }}>T – Trust</p>
																	<p className="text-sm" style={{ color: "#2A2A2A" }}>
																		"What preparation can you rely on?"
																	</p>
																</div>
																<div>
																	<p className="text-sm font-semibold" style={{ color: "#5B21B6" }}>H – Hold</p>
																	<p className="text-sm" style={{ color: "#2A2A2A" }}>
																		"What boundaries need reinforcing?"
																	</p>
																</div>
																<div>
																	<p className="text-sm font-semibold" style={{ color: "#5B21B6" }}>E – Engage</p>
																	<p className="text-sm" style={{ color: "#2A2A2A" }}>
																		"How will you re-engage with intention?"
																	</p>
																</div>
															</div>
														</article>
														<article>
															<h3
																className="text-lg font-semibold mb-2"
																style={{ color: "#5B21B6" }}
															>
																Neurological Benefits
															</h3>
															<p
																className="text-sm mb-2"
																style={{ color: "#2A2A2A" }}
															>
																<strong>Executive function activation:</strong>{" "}
																Reflective questions engage the prefrontal cortex,
																enhancing decision-making and emotional regulation
																crucial for interpreting.
															</p>
															<p className="text-sm" style={{ color: "#3A3A3A" }}>
																This structured approach creates new neural pathways for
																stress management, building lasting resilience.
															</p>
														</article>
														<article>
															<h3
																className="text-lg font-semibold mb-2"
																style={{ color: "#5B21B6" }}
															>
																Interpreter-Specific Design
															</h3>
															<p
																className="text-sm mb-2"
																style={{ color: "#2A2A2A" }}
															>
																<strong>Tailored for your needs:</strong>{" "}
																Each step addresses common interpreter stressors—emotional
																transfer, role confusion, vicarious trauma, and cognitive
																overload.
															</p>
															<p className="text-sm" style={{ color: "#3A3A3A" }}>
																Developed through research with professional interpreters
																to address the unique challenges of your work.
															</p>
														</article>
													</>
												) : (
													<>
												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Vagus Nerve Activation
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Direct nervous system control:</strong>{" "}
														Slow, deep breathing stimulates the vagus nerve,
														which directly signals your body to shift from
														stress response to relaxation mode.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														This is particularly crucial for interpreters who
														experience rapid stress spikes during challenging
														assignments. The 4-6 breathing ratio optimizes this
														vagal response.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Heart Rate Variability (HRV)
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Resilience indicator:</strong> Controlled
														breathing increases HRV, a key marker of stress
														resilience and cognitive flexibility—both essential
														for interpreting performance.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														Studies show that interpreters with higher HRV
														maintain better accuracy and experience less fatigue
														during consecutive interpreting sessions.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Prefrontal Cortex Regulation
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Executive function boost:</strong> Rhythmic
														breathing enhances blood flow to the prefrontal
														cortex, improving decision-making, language
														processing, and emotional regulation.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														This helps interpreters maintain cognitive clarity
														even after emotionally charged or technically
														complex assignments.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Cortisol Reduction
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Stress hormone management:</strong> Just 2-4
														minutes of controlled breathing can reduce cortisol
														levels by up to 30%, preventing the accumulation of
														stress throughout your workday.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														Regular breathing practices help interpreters
														maintain lower baseline stress levels, improving
														overall well-being and career longevity.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Oxygen Efficiency
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Brain fuel optimization:</strong> The 4-6
														breathing pattern maximizes oxygen exchange and CO2
														balance, ensuring optimal brain function for
														language processing.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														This is especially important for remote interpreters
														who may unconsciously hold their breath or breathe
														shallowly during intense concentration.
													</p>
												</article>
													</>
												)}
											</section>

											<footer
												className="mt-8 pt-6 border-t"
												style={{ borderColor: "rgba(45, 95, 63, 0.2)" }}
											>
												<p
													className="text-xs mb-4"
													style={{ color: "#525252" }}
												>
													{selectedTechnique === "breathe-protocol"
														? "Research sources: Journal of Cognitive Therapy, International Journal of Stress Management, Applied Psychology: Health and Well-Being"
														: "Research sources: Frontiers in Psychology, International Journal of Psychophysiology, Neuroscience & Biobehavioral Reviews"}
												</p>
												<button
													onClick={() => {
														if (selectedTechnique === "breathe-protocol") {
															setShowBreathingModal(false);
															setShowBreatheProtocol(true);
															setBreatheStep(0);
															id = trackTechniqueStart("breathe-protocol");
															setCurrentTechniqueId(id);
														} else {
															setShowBreathingModal(false);
															setBreathingMode("gentle");
															setShowBreathingPractice(true);
															id = trackTechniqueStart("breathing-practice");
															setCurrentTechniqueId(id);
														}
													}}
													className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
													style={{
														background: selectedTechnique === "breathe-protocol"
															? "linear-gradient(135deg, #7C3AED, #9333EA)"
															: "linear-gradient(135deg, #5C7F4F, #5B9378)",
														color: "#FFFFFF",
													}}
													aria-label={selectedTechnique === "breathe-protocol" ? "Begin BREATHE Protocol practice" : "Begin breathing practice"}
												>
													{selectedTechnique === "breathe-protocol" ? "Begin Practice" : "Ready to breathe and reset!"}
												</button>
											</footer>
										</div>
									</div>
								</div>
							)}

							{/* Emotion Mapping Why It Works Modal */}
							{showEmotionMappingModal && (
								<div
									className="fixed inset-0 z-50 flex items-center justify-center p-4"
									style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
									onClick={() => setShowEmotionMappingModal(false)}
									role="dialog"
									aria-modal="true"
									aria-labelledby="emotion-mapping-modal-title"
								>
									<div
										className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
										style={{
											backgroundColor: "var(--bg-card)",
											boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
										}}
										onClick={(e) => e.stopPropagation()}
									>
										<div className="p-8">
											<header className="mb-6">
												<h2
													id="emotion-mapping-modal-title"
													className="text-2xl font-bold mb-3"
													style={{ color: "#0D3A14" }}
												>
													Why Emotion Mapping Works
												</h2>
												<p className="text-sm" style={{ color: "#3A3A3A" }}>
													The neuroscience of emotional regulation for
													interpreters
												</p>
											</header>

											<section className="space-y-6">
												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Affect Labeling
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Neural deactivation:</strong> When you name
														an emotion, your brain's language centers
														(particularly the right ventrolateral prefrontal
														cortex) activate and calm the amygdala—your fear
														center.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														UCLA research shows that simply saying "I feel
														angry" reduces amygdala activity by up to 50%,
														helping interpreters process difficult content
														without becoming overwhelmed.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Emotional Granularity
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Precision matters:</strong> People who can
														distinguish between similar emotions (frustrated vs.
														irritated vs. overwhelmed) have better emotional
														regulation and lower stress.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														For interpreters handling complex emotional content,
														this granularity prevents emotional contagion and
														maintains professional boundaries.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Interoception Enhancement
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Body-mind connection:</strong> Noticing
														where emotions manifest physically (chest tightness,
														stomach butterflies) strengthens your insula—the
														brain region connecting body sensations to emotional
														awareness.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														This is crucial for interpreters who need to
														recognize early signs of secondary trauma or
														compassion fatigue before it impacts performance.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Cognitive Reappraisal
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Perspective shift:</strong> Understanding
														what triggered an emotion allows your prefrontal
														cortex to reframe the situation, reducing its
														emotional impact.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														This helps interpreters separate their personal
														reactions from professional responsibilities,
														maintaining neutrality while acknowledging human
														responses.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Neuroplasticity Benefits
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Long-term resilience:</strong> Regular
														emotion mapping literally rewires your brain,
														strengthening connections between emotional and
														rational centers.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														Studies show that interpreters who practice
														emotional awareness have 40% less burnout and
														maintain career longevity despite exposure to
														challenging content.
													</p>
												</article>
											</section>

											<footer
												className="mt-8 pt-6 border-t"
												style={{ borderColor: "rgba(45, 95, 63, 0.2)" }}
											>
												<p
													className="text-xs mb-4"
													style={{ color: "#525252" }}
												>
													Research sources: UCLA Brain Mapping Center, Journal
													of Cognitive Neuroscience, Emotion Review, Current
													Opinion in Psychology
												</p>
												<button
													onClick={() => setShowEmotionMappingModal(false)}
													className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
													style={{
														background:
															"linear-gradient(135deg, #5C7F4F, #5B9378)",
														color: "#FFFFFF",
													}}
													aria-label="Close modal and return to emotion mapping options"
												>
													Ready to map and reset!
												</button>
											</footer>
										</div>
									</div>
								</div>
							)}

							{/* Affirmation & Reflection Studio Modal */}
							{showAffirmationStudio && (
								<AffirmationReflectionStudio
									onClose={() => setShowAffirmationStudio(false)}
								/>
							)}

							{/* BREATHE Protocol Info Modal */}
							{showBreatheProtocolModal && (
								<div
									className="fixed inset-0 z-50 flex items-center justify-center p-4"
									style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
									onClick={() => setShowBreatheProtocolModal(false)}
									role="dialog"
									aria-modal="true"
									aria-labelledby="breathe-modal-title"
								>
									<div
										className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
										style={{
											backgroundColor: "var(--bg-card)",
											boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
										}}
										onClick={(e) => e.stopPropagation()}
									>
										<div className="p-8">
											<header className="mb-6">
												<h2
													id="breathe-modal-title"
													className="text-2xl font-bold mb-3"
													style={{ color: "#0D3A14" }}
												>
													Why BREATHE Protocol Works
												</h2>
												<p className="text-sm" style={{ color: "#3A3A3A" }}>
													Evidence-based guided questions for stress regulation
												</p>
											</header>

											<section className="space-y-6">
												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Structured Self-Inquiry
													</h3>
													<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
														<strong>Cognitive reframing:</strong> Reflective questions activate your prefrontal cortex, shifting from reactive to deliberate thinking.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														This structured approach helps interpreters process stress systematically rather than becoming overwhelmed by it.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														The 4-7-8 Breathing Effect
													</h3>
													<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
														<strong>Vagal activation:</strong> This specific breathing pattern stimulates the vagus nerve, triggering immediate parasympathetic response.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														The extended exhale (8 counts) specifically signals safety to your nervous system, reducing cortisol within minutes.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Emotion Naming & Regulation
													</h3>
													<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
														<strong>Affect labeling:</strong> Identifying and naming emotions reduces amygdala reactivity by 50% (UCLA research).
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														When you recognize and evaluate emotions, you transform raw feeling into manageable information.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Boundary Reinforcement
													</h3>
													<p className="text-sm mb-2" style={{ color: "#2A2A2A" }}>
														<strong>Professional protection:</strong> The "Hold" step activates your executive function to maintain healthy separation.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														This prevents secondary trauma and maintains the professional distance essential for effective interpreting.
													</p>
												</article>
											</section>

											<footer
												className="mt-8 pt-6 border-t"
												style={{ borderColor: "rgba(45, 95, 63, 0.2)" }}
											>
												<p
													className="text-xs mb-4"
													style={{ color: "#525252" }}
												>
													Research sources: Journal of Psychophysiology, Clinical Psychological Science, Interpreter Wellness Studies
												</p>
												<button
													onClick={() => {
														setShowBreatheProtocolModal(false);
														setShowBreatheProtocol(true);
														setBreatheStep(0);
														id = trackTechniqueStart("breathe-protocol");
														setCurrentTechniqueId(id);
													}}
													className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
													style={{
														background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
														color: "#FFFFFF",
													}}
													aria-label="Begin BREATHE protocol practice"
												>
													Begin Practice
												</button>
											</footer>
										</div>
									</div>
								</div>
							)}

							{/* BREATHE Protocol Practice Modal */}
							{showBreatheProtocol && (
								<BreatheProtocolAccessible
									onClose={() => {
										setShowBreatheProtocol(false);
										if (currentTechniqueId) {
											trackTechniqueComplete(currentTechniqueId, "completed");
											setCurrentTechniqueId(null);
										}
									}}
									onComplete={(data) => {
										if (currentTechniqueId) {
											trackTechniqueComplete(currentTechniqueId, "completed");
											setCurrentTechniqueId(null);
										}
										setShowBreatheProtocol(false);
										console.log("BREATHE Protocol completed:", data);
									}}
								/>
							)}

							{/* Body Check-In Modal */}
							{showBodyCheckIn && (
								<BodyCheckIn
									mode={bodyCheckInMode}
									onClose={() => {
										setShowBodyCheckIn(false);
										if (currentTechniqueId) {
											trackTechniqueComplete(currentTechniqueId, "completed");
											setCurrentTechniqueId(null);
										}
									}}
									onComplete={(data) => {
										if (currentTechniqueId) {
											trackTechniqueComplete(
												currentTechniqueId,
												data.completedDuration || 0,
											);
											setCurrentTechniqueId(null);
										}

										// Save body check-in data
										const newCheckIn = {
											...data,
											id: Date.now(),
											date: new Date().toISOString(),
										};
										const updatedData = [newCheckIn, ...bodyCheckInData];
										setBodyCheckInData(updatedData);
										localStorage.setItem(
											"bodyCheckInData",
											JSON.stringify(updatedData),
										);

										// Close the modal and navigate to Growth Insights
										setShowBodyCheckIn(false);
										setActiveTab("insights");

										// Scroll to the Body Check-In section after a brief delay
										setTimeout(() => {
											const bodyCheckInSection = document.getElementById(
												"body-checkin-heading",
											);
											if (bodyCheckInSection) {
												bodyCheckInSection.scrollIntoView({
													behavior: "smooth",
													block: "start",
												});
											}
										}, 100);
									}}
								/>
							)}

							{/* Body Check-In Why It Works Modal */}
							{showBodyCheckInModal && (
								<div
									className="fixed inset-0 z-50 flex items-center justify-center p-4"
									style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
									onClick={() => setShowBodyCheckInModal(false)}
									role="dialog"
									aria-modal="true"
									aria-labelledby="body-checkin-modal-title"
								>
									<div
										className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
										style={{
											backgroundColor: "var(--bg-card)",
											boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
										}}
										onClick={(e) => e.stopPropagation()}
									>
										<div className="p-8">
											<header className="mb-6">
												<h2
													id="body-checkin-modal-title"
													className="text-2xl font-bold mb-3"
													style={{ color: "#0D3A14" }}
												>
													Why a Body Check-In?
												</h2>
												<p className="text-sm" style={{ color: "#3A3A3A" }}>
													Understanding the neuroscience of somatic awareness
													for interpreters
												</p>
											</header>

											<section className="space-y-6">
												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														The Interpreter's Physical Load
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Research shows:</strong> Interpreters
														maintain heightened muscle tension throughout
														sessions, with neck and shoulder tension increasing
														by up to 47% during complex interpretations.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														This chronic tension creates feedback loops that
														amplify stress responses and reduce cognitive
														performance over time.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														The Insula Connection
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Brain science:</strong> Body scanning
														activates your insula cortex, the brain region that
														integrates physical sensations with emotional
														awareness.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														Regular body check-ins strengthen interoception—your
														ability to sense internal signals—improving both
														stress management and decision-making.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Nervous System Reset
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Autonomic regulation:</strong> Progressive
														body scanning shifts your nervous system from
														sympathetic (fight-or-flight) to parasympathetic
														(rest-and-digest) dominance.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														This shift reduces cortisol, lowers heart rate, and
														improves vagal tone—essential for sustained
														cognitive performance.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Breaking the Tension-Fatigue Cycle
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Physical release:</strong> Conscious tension
														release prevents the accumulation of "muscle memory"
														from stressful interpretations.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														Studies show interpreters who practice regular body
														scanning report 35% less physical fatigue and 40%
														fewer tension headaches.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Embodied Professionalism
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Performance enhancement:</strong> Body
														awareness improves your professional presence, voice
														quality, and non-verbal communication.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														Interpreters with strong somatic awareness maintain
														better posture, clearer articulation, and more
														sustainable energy throughout long assignments.
													</p>
												</article>
											</section>

											<footer
												className="mt-8 pt-6 border-t"
												style={{ borderColor: "rgba(45, 95, 63, 0.2)" }}
											>
												<p
													className="text-xs mb-4"
													style={{ color: "#525252" }}
												>
													Research sources: Journal of Psychosomatic Research,
													International Journal of Clinical and Health
													Psychology, Embodied Cognition Studies
												</p>
												<button
													onClick={() => {
														setShowBodyCheckInModal(false);
														setBodyCheckInMode("quick");
														setShowBodyCheckIn(true);
														id = trackTechniqueStart("body-checkin");
														setCurrentTechniqueId(id);
													}}
													className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
													style={{
														background:
															"linear-gradient(135deg, #5C7F4F, #5B9378)",
														color: "#FFFFFF",
													}}
													aria-label="Begin body check-in practice"
												>
													Begin Practice
												</button>
											</footer>
										</div>
									</div>
								</div>
							)}

							{/* Professional Boundaries Reset Modal */}
							{showProfessionalBoundariesReset && (
								<ProfessionalBoundariesReset
									onClose={() => {
										setShowProfessionalBoundariesReset(false);
										if (currentTechniqueId) {
											trackTechniqueComplete(currentTechniqueId, "completed");
											setCurrentTechniqueId(null);
										}
									}}
									onComplete={(data) => {
										if (currentTechniqueId) {
											trackTechniqueComplete(currentTechniqueId, "completed");
											setCurrentTechniqueId(null);
										}
										setShowProfessionalBoundariesReset(false);
										console.log(
											"Professional Boundaries Reset completed:",
											data,
										);
									}}
								/>
							)}
							{/* Temperature Exploration Modal */}
							{showTemperatureExploration && (
								<TemperatureExploration
									onClose={() => {
										setShowTemperatureExploration(false);
										if (currentTechniqueId) {
											trackTechniqueComplete(currentTechniqueId, "completed");
											setCurrentTechniqueId(null);
										}
									}}
									onComplete={(data) => {
										if (currentTechniqueId) {
											trackTechniqueComplete(currentTechniqueId, "completed");
											setCurrentTechniqueId(null);
										}
										setShowTemperatureExploration(false);
										console.log("Temperature Exploration completed:", data);
									}}
								/>
							)}
							{/* Assignment Reset Modal */}
							{showAssignmentReset && (
								<AssignmentReset
									mode={assignmentResetMode}
									onClose={() => {
										setShowAssignmentReset(false);
										if (currentTechniqueId) {
											trackTechniqueComplete(currentTechniqueId, "completed");
											setCurrentTechniqueId(null);
										}
									}}
									onComplete={(data) => {
										if (currentTechniqueId) {
											trackTechniqueComplete(currentTechniqueId, "completed");
											setCurrentTechniqueId(null);
										}
										setShowAssignmentReset(false);
										console.log("Assignment Reset completed:", data);
									}}
								/>
							)}
							{/* Technology Fatigue Reset Modal */}
							{showTechnologyFatigueReset && (
								<TechnologyFatigueReset
									onClose={() => {
										setShowTechnologyFatigueReset(false);
										if (currentTechniqueId) {
											trackTechniqueComplete(currentTechniqueId, "completed");
											setCurrentTechniqueId(null);
										}
									}}
									onComplete={(data) => {
										if (currentTechniqueId) {
											trackTechniqueComplete(currentTechniqueId, "completed");
											setCurrentTechniqueId(null);
										}
										setShowTechnologyFatigueReset(false);
										console.log("Technology Fatigue Reset completed:", data);
									}}
								/>
							)}
							{/* Emotion Mapping Modal */}
							{showEmotionMapping && (
								<EmotionMapping
									mode={emotionMappingMode}
									onClose={() => {
										setShowEmotionMapping(false);
										if (currentTechniqueId) {
											trackTechniqueComplete(currentTechniqueId, "completed");
											setCurrentTechniqueId(null);
										}
									}}
									onComplete={(data) => {
										if (currentTechniqueId) {
											trackTechniqueComplete(currentTechniqueId, "completed");
											setCurrentTechniqueId(null);
										}
										setShowEmotionMapping(false);
										console.log("Emotion Mapping completed:", data);
									}}
								/>
							)}

							{/* Why Professional Boundaries Matter Modal */}
							{showBoundariesWhyModal && (
								<div
									className="fixed inset-0 z-50 flex items-center justify-center p-4"
									style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
									onClick={() => setShowBoundariesWhyModal(false)}
									role="dialog"
									aria-modal="true"
									aria-labelledby="boundaries-modal-title"
								>
									<div
										className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
										style={{
											backgroundColor: "var(--bg-card)",
											boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
										}}
										onClick={(e) => e.stopPropagation()}
									>
										<div className="p-8">
											<header className="mb-6">
												<h2
													id="boundaries-modal-title"
													className="text-2xl font-bold mb-3"
													style={{ color: "#0D3A14" }}
												>
													Why Professional Boundaries Matter
												</h2>
												<p className="text-sm" style={{ color: "#3A3A3A" }}>
													The neuroscience behind boundary-setting for
													interpreter recovery
												</p>
											</header>

											<section className="space-y-6">
												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Anterior Cingulate Cortex Activation
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Identity protection:</strong> Setting
														professional boundaries activates the anterior
														cingulate cortex, which maintains your sense of self
														separate from client experiences.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														This neural distinction is crucial for interpreters
														who must embody others' voices while preserving
														their own identity. Clear boundaries prevent the
														neural blurring that leads to secondary trauma and
														emotional exhaustion.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Mirror Neuron Regulation
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Empathy calibration:</strong> Interpreters'
														mirror neurons fire intensely during emotional
														assignments, creating deep neurological resonance
														with speakers.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														Boundary resets help regulate this mirror neuron
														activity, allowing you to maintain professional
														empathy without absorbing others' trauma. Studies
														show this conscious regulation reduces compassion
														fatigue by up to 40%.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Stress Response Deactivation
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Cortisol clearance:</strong> The release
														phase triggers parasympathetic activation, clearing
														stress hormones accumulated during challenging
														interpretations.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														Research shows that professionals who practice
														intentional boundary rituals maintain 35% lower
														baseline cortisol levels, protecting against chronic
														stress and burnout common in language services.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Cognitive Load Management
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Mental space preservation:</strong>{" "}
														Boundary-setting frees up cognitive resources by
														preventing rumination and emotional carryover.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														Neuroscience research demonstrates that clear role
														definition reduces cognitive load by 25%, allowing
														interpreters to maintain peak performance across
														multiple assignments without mental fatigue
														accumulation.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Neuroplasticity Enhancement
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Resilience building:</strong> Regular
														boundary practice strengthens neural pathways for
														emotional regulation and professional identity.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														Over time, this creates automatic protective
														responses to challenging content, with studies
														showing that interpreters who maintain clear
														boundaries report 50% higher career satisfaction and
														longevity in the field.
													</p>
												</article>
											</section>

											<footer
												className="mt-8 pt-6 border-t"
												style={{ borderColor: "rgba(45, 95, 63, 0.2)" }}
											>
												<p
													className="text-xs mb-4"
													style={{ color: "#525252" }}
												>
													Research sources: Journal of Occupational Health
													Psychology, International Journal of Interpreting,
													Neuroscience & Behavioral Reviews
												</p>
												<button
													onClick={() => setShowBoundariesWhyModal(false)}
													className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
													style={{
														background:
															"linear-gradient(135deg, #5C7F4F, #5B9378)",
														color: "#FFFFFF",
													}}
													aria-label="Close modal and return to boundaries options"
												>
													Ready to set healthy boundaries!
												</button>
											</footer>
										</div>
									</div>
								</div>
							)}

							{/* Render Stress Reset Modals */}
							{renderStressResetModals()}

							{/* Why Assignment Reset Works Modal */}
							{showAssignmentWhyModal && (
								<div
									className="fixed inset-0 z-50 flex items-center justify-center p-4"
									style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
									onClick={() => setShowAssignmentWhyModal(false)}
									role="dialog"
									aria-modal="true"
									aria-labelledby="assignment-modal-title"
								>
									<div
										className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
										style={{
											backgroundColor: "var(--bg-card)",
											boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
										}}
										onClick={(e) => e.stopPropagation()}
									>
										<div className="p-8">
											<header className="mb-6">
												<h2
													id="assignment-modal-title"
													className="text-2xl font-bold mb-3"
													style={{ color: "#0D3A14" }}
												>
													Why Assignment Reset Works
												</h2>
												<p className="text-sm" style={{ color: "#3A3A3A" }}>
													The neuroscience behind rapid recovery for interpreter
													transitions
												</p>
											</header>

											<section className="space-y-6">
												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Task-Switching Networks
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Cognitive flexibility restoration:</strong>{" "}
														Assignment resets engage the brain's task-switching
														networks, clearing residual neural activation from
														previous interpretations.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														This prevents cognitive interference where
														terminology, emotions, or context from one
														assignment bleeds into the next. Studies show that
														structured transitions improve accuracy by 30% in
														subsequent assignments.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Working Memory Clearance
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Mental workspace optimization:</strong>{" "}
														Brief reset practices flush your working memory
														cache, which can hold 7±2 items of active
														information.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														For interpreters juggling terminology, context, and
														emotional content, this clearance prevents cognitive
														overload. Research demonstrates that even 60-second
														resets restore working memory capacity to baseline
														levels.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Autonomic Nervous System Shift
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Rapid state change:</strong> The combination
														of grounding and breathwork creates a measurable
														shift from sympathetic (stress) to parasympathetic
														(rest) dominance within 90 seconds.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														This physiological reset is essential for
														interpreters moving between high-stakes assignments,
														ensuring each session begins from a calm, focused
														baseline rather than accumulated tension.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Attention Network Reset
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Focus recalibration:</strong>{" "}
														Intention-setting activates the executive attention
														network while deactivating the default mode
														network's wandering thoughts.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														This neural shift helps interpreters fully disengage
														from previous content and prime their brain for new
														linguistic demands. Studies show this improves
														concentration and reduces interpretation errors by
														25%.
													</p>
												</article>

												<article>
													<h3
														className="text-lg font-semibold mb-2"
														style={{ color: "#0D3A14" }}
													>
														Allostatic Load Prevention
													</h3>
													<p
														className="text-sm mb-2"
														style={{ color: "#2A2A2A" }}
													>
														<strong>Stress accumulation buffer:</strong> Regular
														micro-resets between assignments prevent allostatic
														overload—the wear-and-tear from chronic stress
														adaptation.
													</p>
													<p className="text-sm" style={{ color: "#3A3A3A" }}>
														Interpreters who practice brief transitions show 45%
														lower burnout rates and maintain consistent
														performance throughout long workdays, rather than
														experiencing the typical afternoon decline in
														accuracy and stamina.
													</p>
												</article>
											</section>

											<footer
												className="mt-8 pt-6 border-t"
												style={{ borderColor: "rgba(45, 95, 63, 0.2)" }}
											>
												<p
													className="text-xs mb-4"
													style={{ color: "#525252" }}
												>
													Research sources: Cognitive Neuroscience Reviews,
													Journal of Applied Psychology, International Journal
													of Interpreting
												</p>
												<button
													onClick={() => setShowAssignmentWhyModal(false)}
													className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
													style={{
														background:
															"linear-gradient(135deg, #5C7F4F, #5B9378)",
														color: "#FFFFFF",
													}}
													aria-label="Close modal and return to assignment reset options"
												>
													Ready to reset and refocus!
												</button>
											</footer>
										</div>
									</div>
								</div>
							)}

							{/* AgenticFlow Chat */}
							<AgenticFlowChat />

							{/* Onboarding Modals */}
							{showFeatureDiscovery && (
								<FeatureDiscovery
									isOpen={showFeatureDiscovery}
									onClose={() => setShowFeatureDiscovery(false)}
									onComplete={handleFeatureDiscoveryComplete}
								/>
							)}

							{/* Progressive Onboarding Tips */}
							{user && (
								<ProgressiveOnboarding
									user={user}
									onDismiss={(tipId) => {
										onboardingAnalytics.trackProgressiveTip(user.id, tipId, 'dismissed');
									}}
								/>
							)}

							{/* Reflection Success Toast */}
							<ReflectionSuccessToast show={showToast} onClose={closeToast} />

							{/* Reflection Success Toast - After Modal Close */}
							<ReflectionSuccessToast
								show={showReflectionSuccessToast}
								onClose={() => setShowReflectionSuccessToast(false)}
							/>

						</div>
					}
				/>
			</Routes>
		</SubscriptionGate>
	);
}

export default App;
