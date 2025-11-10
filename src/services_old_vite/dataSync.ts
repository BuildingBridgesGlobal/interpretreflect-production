import { createClient } from "../lib/supabase/client";

const supabase = createClient();

interface SyncStatus {
	success: boolean;
	error?: string;
	synced?: number;
	failed?: number;
}

export class DataSyncService {
	private static instance: DataSyncService;
	private syncInProgress = false;
	private lastSyncTime: Date | null = null;

	private constructor() {
		// Initialize auth listener
		this.setupAuthListener();
	}

	static getInstance(): DataSyncService {
		if (!DataSyncService.instance) {
			DataSyncService.instance = new DataSyncService();
		}
		return DataSyncService.instance;
	}

	private setupAuthListener() {
		// Listen for auth state changes
		supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === "SIGNED_IN" && session?.user) {
				// User just signed in - start sync
				await this.initializeSync();
			} else if (event === "SIGNED_OUT") {
				// User signed out - stop sync
				this.stopSync();
			}
		});

		// Also check initial state
		this.checkInitialAuth();
	}

	private async checkInitialAuth() {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (session?.user) {
			await this.initializeSync();
		}
	}

	private syncInterval: NodeJS.Timeout | null = null;

	private async initializeSync() {
		// Sync immediately on sign in
		await this.syncAllData();

		// Clear any existing interval
		if (this.syncInterval) {
			clearInterval(this.syncInterval);
		}

		// Set up periodic sync every 5 minutes
		this.syncInterval = setInterval(() => this.syncAllData(), 5 * 60 * 1000);

		// Sync before page unload
		window.addEventListener("beforeunload", () => {
			this.syncAllData();
		});
	}

	private stopSync() {
		// Clear sync interval when user signs out
		if (this.syncInterval) {
			clearInterval(this.syncInterval);
			this.syncInterval = null;
		}
		this.syncInProgress = false;
		this.lastSyncTime = null;
	}

	async syncAllData(): Promise<SyncStatus> {
		if (this.syncInProgress) {
			return { success: false, error: "Sync already in progress" };
		}

		this.syncInProgress = true;
		const results: SyncStatus = { success: true, synced: 0, failed: 0 };

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				return { success: false, error: "User not authenticated" };
			}

			// Sync all localStorage data types
			const syncTasks = [
				this.syncReflections(user.id),
				this.syncBodyCheckInData(user.id),
				this.syncTechniqueUsage(user.id),
				this.syncRecoveryHabits(user.id),
				this.syncBurnoutData(user.id),
				this.syncBreathingPreferences(user.id),
				this.syncAffirmations(user.id),
				this.syncBodyAwarenessSessions(user.id),
				this.syncBoundariesSessions(user.id),
				this.syncAssignmentData(user.id),
				this.syncWellnessCheckIns(user.id),
				this.syncEmotionalProximityData(user.id),
				this.syncCodeSwitchData(user.id),
				this.syncTemperaturePreferences(user.id),
			];

			const syncResults = await Promise.allSettled(syncTasks);

			syncResults.forEach((result) => {
				if (result.status === "fulfilled" && result.value.success) {
					results.synced! += result.value.synced || 0;
				} else {
					results.failed! += 1;
				}
			});

			this.lastSyncTime = new Date();
			console.log(
				`Data sync completed: ${results.synced} items synced, ${results.failed} failed`,
			);
		} catch (error) {
			console.error("Data sync error:", error);
			results.success = false;
			results.error = error instanceof Error ? error.message : "Unknown error";
		} finally {
			this.syncInProgress = false;
		}

		return results;
	}

	private async syncReflections(userId: string): Promise<SyncStatus> {
		try {
			const savedReflections = localStorage.getItem("savedReflections");
			if (!savedReflections) return { success: true, synced: 0 };

			const reflections = JSON.parse(savedReflections);

			const { error } = await supabase.from("reflections").upsert(
				reflections.map((reflection: any) => ({
					...reflection,
					user_id: userId,
					synced_at: new Date().toISOString(),
				})),
				{ onConflict: "user_id,timestamp" },
			);

			if (error) throw error;
			return { success: true, synced: reflections.length };
		} catch (error) {
			console.error("Failed to sync reflections:", error);
			return { success: false, error: "Failed to sync reflections" };
		}
	}

	private async syncBodyCheckInData(userId: string): Promise<SyncStatus> {
		try {
			const bodyCheckInData = localStorage.getItem("bodyCheckInData");
			if (!bodyCheckInData) return { success: true, synced: 0 };

			const data = JSON.parse(bodyCheckInData);

			const { error } = await supabase.from("body_check_ins").upsert(
				data.map((item: any) => ({
					...item,
					user_id: userId,
					synced_at: new Date().toISOString(),
				})),
				{ onConflict: "user_id,timestamp" },
			);

			if (error) throw error;
			return { success: true, synced: data.length };
		} catch (error) {
			console.error("Failed to sync body check-in data:", error);
			return { success: false, error: "Failed to sync body check-in data" };
		}
	}

	private async syncTechniqueUsage(userId: string): Promise<SyncStatus> {
		try {
			const techniqueUsage = localStorage.getItem("techniqueUsage");
			if (!techniqueUsage) return { success: true, synced: 0 };

			const usage = JSON.parse(techniqueUsage);

			const { error } = await supabase.from("technique_usage").upsert(
				usage.map((item: any) => ({
					...item,
					user_id: userId,
					synced_at: new Date().toISOString(),
				})),
				{ onConflict: "user_id,technique_id,timestamp" },
			);

			if (error) throw error;
			return { success: true, synced: usage.length };
		} catch (error) {
			console.error("Failed to sync technique usage:", error);
			return { success: false, error: "Failed to sync technique usage" };
		}
	}

	private async syncRecoveryHabits(userId: string): Promise<SyncStatus> {
		try {
			const recoveryHabits = localStorage.getItem("recoveryHabits");
			if (!recoveryHabits) return { success: true, synced: 0 };

			const habits = JSON.parse(recoveryHabits);

			const { error } = await supabase.from("recovery_habits").upsert(
				habits.map((habit: any) => ({
					...habit,
					user_id: userId,
					synced_at: new Date().toISOString(),
				})),
				{ onConflict: "user_id,timestamp" },
			);

			if (error) throw error;
			return { success: true, synced: habits.length };
		} catch (error) {
			console.error("Failed to sync recovery habits:", error);
			return { success: false, error: "Failed to sync recovery habits" };
		}
	}

	private async syncBurnoutData(userId: string): Promise<SyncStatus> {
		try {
			const burnoutAssessments = localStorage.getItem("burnoutAssessments");
			const todaysAssessment = localStorage.getItem("todaysBurnoutAssessment");

			let totalSynced = 0;

			if (burnoutAssessments) {
				const assessments = JSON.parse(burnoutAssessments);
				const { error } = await supabase.from("burnout_assessments").upsert(
					assessments.map((assessment: any) => ({
						...assessment,
						user_id: userId,
						synced_at: new Date().toISOString(),
					})),
					{ onConflict: "user_id,assessment_date" },
				);

				if (!error) totalSynced += assessments.length;
			}

			if (todaysAssessment) {
				const assessment = JSON.parse(todaysAssessment);
				const { error } = await supabase.from("burnout_assessments").upsert(
					{
						...assessment,
						user_id: userId,
						assessment_date: new Date().toISOString().split("T")[0],
						synced_at: new Date().toISOString(),
					},
					{ onConflict: "user_id,assessment_date" },
				);

				if (!error) totalSynced += 1;
			}

			return { success: true, synced: totalSynced };
		} catch (error) {
			console.error("Failed to sync burnout data:", error);
			return { success: false, error: "Failed to sync burnout data" };
		}
	}

	private async syncBreathingPreferences(userId: string): Promise<SyncStatus> {
		try {
			const breathingPrefs = localStorage.getItem(
				"breathingAccessibilityPrefs",
			);
			if (!breathingPrefs) return { success: true, synced: 0 };

			const prefs = JSON.parse(breathingPrefs);

			const { error } = await supabase.from("user_preferences").upsert(
				{
					user_id: userId,
					preference_type: "breathing_accessibility",
					preferences: prefs,
					updated_at: new Date().toISOString(),
				},
				{ onConflict: "user_id,preference_type" },
			);

			if (error) throw error;
			return { success: true, synced: 1 };
		} catch (error) {
			console.error("Failed to sync breathing preferences:", error);
			return { success: false, error: "Failed to sync breathing preferences" };
		}
	}

	private async syncAffirmations(userId: string): Promise<SyncStatus> {
		try {
			const dailyAffirmation = localStorage.getItem("dailyAffirmation");
			const recentAffirmations = localStorage.getItem("recentAffirmations");
			const favorites = localStorage.getItem("affirmationFavorites");

			let totalSynced = 0;

			if (dailyAffirmation) {
				const affirmation = JSON.parse(dailyAffirmation);
				const { error } = await supabase.from("affirmations").upsert(
					{
						user_id: userId,
						affirmation_type: "daily",
						content: affirmation,
						created_at: new Date().toISOString(),
					},
					{ onConflict: "user_id,affirmation_type,created_at" },
				);

				if (!error) totalSynced += 1;
			}

			if (recentAffirmations) {
				const recent = JSON.parse(recentAffirmations);
				const { error } = await supabase.from("affirmations").upsert(
					recent.map((aff: any) => ({
						user_id: userId,
						affirmation_type: "recent",
						content: aff,
						created_at: new Date().toISOString(),
					})),
					{ onConflict: "user_id,affirmation_type,content" },
				);

				if (!error) totalSynced += recent.length;
			}

			if (favorites) {
				const favs = JSON.parse(favorites);
				const { error } = await supabase.from("affirmation_favorites").upsert(
					{
						user_id: userId,
						favorites: favs,
						updated_at: new Date().toISOString(),
					},
					{ onConflict: "user_id" },
				);

				if (!error) totalSynced += 1;
			}

			return { success: true, synced: totalSynced };
		} catch (error) {
			console.error("Failed to sync affirmations:", error);
			return { success: false, error: "Failed to sync affirmations" };
		}
	}

	private async syncBodyAwarenessSessions(userId: string): Promise<SyncStatus> {
		try {
			const sessions = localStorage.getItem("bodyAwarenessSessions");
			const v2Sessions = localStorage.getItem("bodyAwarenessV2Sessions");

			let totalSynced = 0;

			if (sessions) {
				const sessionData = JSON.parse(sessions);
				const { error } = await supabase.from("body_awareness_sessions").upsert(
					sessionData.map((session: any) => ({
						...session,
						user_id: userId,
						version: "v1",
						synced_at: new Date().toISOString(),
					})),
					{ onConflict: "user_id,session_id" },
				);

				if (!error) totalSynced += sessionData.length;
			}

			if (v2Sessions) {
				const sessionData = JSON.parse(v2Sessions);
				const { error } = await supabase.from("body_awareness_sessions").upsert(
					sessionData.map((session: any) => ({
						...session,
						user_id: userId,
						version: "v2",
						synced_at: new Date().toISOString(),
					})),
					{ onConflict: "user_id,session_id" },
				);

				if (!error) totalSynced += sessionData.length;
			}

			return { success: true, synced: totalSynced };
		} catch (error) {
			console.error("Failed to sync body awareness sessions:", error);
			return {
				success: false,
				error: "Failed to sync body awareness sessions",
			};
		}
	}

	private async syncBoundariesSessions(userId: string): Promise<SyncStatus> {
		try {
			const sessions = localStorage.getItem("boundariesSessions");
			if (!sessions) return { success: true, synced: 0 };

			const sessionData = JSON.parse(sessions);

			const { error } = await supabase.from("boundaries_sessions").upsert(
				sessionData.map((session: any) => ({
					...session,
					user_id: userId,
					synced_at: new Date().toISOString(),
				})),
				{ onConflict: "user_id,session_id" },
			);

			if (error) throw error;
			return { success: true, synced: sessionData.length };
		} catch (error) {
			console.error("Failed to sync boundaries sessions:", error);
			return { success: false, error: "Failed to sync boundaries sessions" };
		}
	}

	private async syncAssignmentData(userId: string): Promise<SyncStatus> {
		try {
			const preAssignmentPrep = localStorage.getItem("lastPreAssignmentPrep");
			const postAssignmentDebriefs = localStorage.getItem(
				"postAssignmentDebriefs",
			);

			let totalSynced = 0;

			if (preAssignmentPrep) {
				const prep = JSON.parse(preAssignmentPrep);
				const { error } = await supabase.from("assignment_prep").upsert(
					{
						...prep,
						user_id: userId,
						synced_at: new Date().toISOString(),
					},
					{ onConflict: "user_id,assignment_id" },
				);

				if (!error) totalSynced += 1;
			}

			if (postAssignmentDebriefs) {
				const debriefs = JSON.parse(postAssignmentDebriefs);
				const { error } = await supabase.from("assignment_debriefs").upsert(
					debriefs.map((debrief: any) => ({
						...debrief,
						user_id: userId,
						synced_at: new Date().toISOString(),
					})),
					{ onConflict: "user_id,assignment_id" },
				);

				if (!error) totalSynced += debriefs.length;
			}

			return { success: true, synced: totalSynced };
		} catch (error) {
			console.error("Failed to sync assignment data:", error);
			return { success: false, error: "Failed to sync assignment data" };
		}
	}

	private async syncWellnessCheckIns(userId: string): Promise<SyncStatus> {
		try {
			const checkInDraft = localStorage.getItem("wellnessCheckInDraft");
			if (!checkInDraft) return { success: true, synced: 0 };

			const checkIn = JSON.parse(checkInDraft);

			const { error } = await supabase.from("wellness_check_ins").upsert(
				{
					...checkIn,
					user_id: userId,
					synced_at: new Date().toISOString(),
				},
				{ onConflict: "user_id,timestamp" },
			);

			if (error) throw error;
			return { success: true, synced: 1 };
		} catch (error) {
			console.error("Failed to sync wellness check-ins:", error);
			return { success: false, error: "Failed to sync wellness check-ins" };
		}
	}

	private async syncEmotionalProximityData(
		userId: string,
	): Promise<SyncStatus> {
		try {
			const sessions = localStorage.getItem("emotionalProximitySessions");
			const prefs = localStorage.getItem("emotionalProximityPrefs");

			let totalSynced = 0;

			if (sessions) {
				const sessionData = JSON.parse(sessions);
				const { error } = await supabase
					.from("emotional_proximity_sessions")
					.upsert(
						sessionData.map((session: any) => ({
							...session,
							user_id: userId,
							synced_at: new Date().toISOString(),
						})),
						{ onConflict: "user_id,session_id" },
					);

				if (!error) totalSynced += sessionData.length;
			}

			if (prefs) {
				const preferences = JSON.parse(prefs);
				const { error } = await supabase.from("user_preferences").upsert(
					{
						user_id: userId,
						preference_type: "emotional_proximity",
						preferences: preferences,
						updated_at: new Date().toISOString(),
					},
					{ onConflict: "user_id,preference_type" },
				);

				if (!error) totalSynced += 1;
			}

			return { success: true, synced: totalSynced };
		} catch (error) {
			console.error("Failed to sync emotional proximity data:", error);
			return {
				success: false,
				error: "Failed to sync emotional proximity data",
			};
		}
	}

	private async syncCodeSwitchData(userId: string): Promise<SyncStatus> {
		try {
			const sessions = localStorage.getItem("codeSwitchSessions");
			const prefs = localStorage.getItem("codeSwitchResetPrefs");

			let totalSynced = 0;

			if (sessions) {
				const sessionData = JSON.parse(sessions);
				const { error } = await supabase.from("code_switch_sessions").upsert(
					sessionData.map((session: any) => ({
						...session,
						user_id: userId,
						synced_at: new Date().toISOString(),
					})),
					{ onConflict: "user_id,session_id" },
				);

				if (!error) totalSynced += sessionData.length;
			}

			if (prefs) {
				const preferences = JSON.parse(prefs);
				const { error } = await supabase.from("user_preferences").upsert(
					{
						user_id: userId,
						preference_type: "code_switch",
						preferences: preferences,
						updated_at: new Date().toISOString(),
					},
					{ onConflict: "user_id,preference_type" },
				);

				if (!error) totalSynced += 1;
			}

			return { success: true, synced: totalSynced };
		} catch (error) {
			console.error("Failed to sync code switch data:", error);
			return { success: false, error: "Failed to sync code switch data" };
		}
	}

	private async syncTemperaturePreferences(
		userId: string,
	): Promise<SyncStatus> {
		try {
			const prefs = localStorage.getItem("temperaturePrefs");
			if (!prefs) return { success: true, synced: 0 };

			const preferences = JSON.parse(prefs);

			const { error } = await supabase.from("user_preferences").upsert(
				{
					user_id: userId,
					preference_type: "temperature_exploration",
					preferences: preferences,
					updated_at: new Date().toISOString(),
				},
				{ onConflict: "user_id,preference_type" },
			);

			if (error) throw error;
			return { success: true, synced: 1 };
		} catch (error) {
			console.error("Failed to sync temperature preferences:", error);
			return {
				success: false,
				error: "Failed to sync temperature preferences",
			};
		}
	}

	// Manual sync trigger
	async triggerManualSync(): Promise<SyncStatus> {
		console.log("Manual sync triggered");
		return await this.syncAllData();
	}

	// Get sync status
	getSyncStatus(): { inProgress: boolean; lastSync: Date | null } {
		return {
			inProgress: this.syncInProgress,
			lastSync: this.lastSyncTime,
		};
	}
}

// Export singleton instance
export const dataSyncService = DataSyncService.getInstance();
