/**
 * Pattern Detection System for Growth Insights
 * Analyzes user behavior patterns and generates supportive nudges
 */

export interface UserPattern {
	type: "emotion" | "assignment" | "timing" | "reset" | "wellness";
	pattern: string;
	confidence: number; // 0-1 scale
	occurrences: number;
	timeframe: "daily" | "weekly" | "monthly";
	lastDetected: Date;
	metadata?: Record<string, any>;
}

export interface PatternNudge {
	id: string;
	priority: "high" | "medium" | "low";
	type: "insight" | "suggestion" | "encouragement" | "warning";
	title: string;
	message: string;
	action?: {
		label: string;
		target: string; // route or action
	};
	icon?: string;
	color?: string;
	dismissible: boolean;
	expiresIn?: number; // hours
}

export interface DetectionRule {
	id: string;
	name: string;
	condition: (data: UserData) => boolean;
	threshold: number;
	generateNudge: (pattern: UserPattern) => PatternNudge;
}

export interface UserData {
	emotions: EmotionLog[];
	assignments: AssignmentLog[];
	resets: ResetLog[];
	wellnessActions: WellnessLog[];
	currentStreak: number;
	lastResetTime?: Date;
}

export interface EmotionLog {
	emotion: string;
	intensity: number; // 1-5
	timestamp: Date;
	context?: {
		assignmentType?: string;
		dayOfWeek?: string;
		timeOfDay?: "morning" | "afternoon" | "evening" | "night";
		postAssignment?: boolean;
	};
}

export interface AssignmentLog {
	type: string;
	duration: number; // minutes
	difficulty: "easy" | "moderate" | "challenging" | "overwhelming";
	emotionAfter?: string;
	timestamp: Date;
	completed: boolean;
}

export interface ResetLog {
	type: string;
	timestamp: Date;
	effectiveness?: number; // 1-5
	skipped: boolean;
	reason?: string;
}

export interface WellnessLog {
	action: string;
	category:
		| "breathwork"
		| "movement"
		| "mindfulness"
		| "boundaries"
		| "nutrition"
		| "sleep";
	timestamp: Date;
	duration?: number;
	effectiveness?: number;
}

/**
 * Pattern Detection Rules
 */
export const DETECTION_RULES: DetectionRule[] = [
	// Medical Assignment Fatigue Pattern
	{
		id: "medical-fatigue",
		name: "Medical Assignment Fatigue",
		condition: (data: UserData) => {
			const medicalAssignments = data.assignments.filter(
				(a) =>
					a.type === "medical" &&
					new Date().getTime() - a.timestamp.getTime() <
						7 * 24 * 60 * 60 * 1000,
			);

			const fatigueAfterMedical = medicalAssignments.filter((a) => {
				const emotionsAfter = data.emotions.filter(
					(e) =>
						e.timestamp.getTime() > a.timestamp.getTime() &&
						e.timestamp.getTime() <
							a.timestamp.getTime() + 4 * 60 * 60 * 1000 && // within 4 hours
						(e.emotion === "exhausted" ||
							e.emotion === "stressed" ||
							e.emotion === "overwhelmed"),
				);
				return emotionsAfter.length > 0;
			});

			return (
				fatigueAfterMedical.length / Math.max(medicalAssignments.length, 1) >
				0.6
			);
		},
		threshold: 3,
		generateNudge: (pattern) => ({
			id: `nudge-${pattern.type}-${Date.now()}`,
			priority: "high",
			type: "insight",
			title: "Pattern Noticed",
			message:
				"You often feel drained after medical assignments. Try the Professional Boundaries Reset after your next one.",
			action: {
				label: "Set Boundary Reminder",
				target: "/resets/professional-boundaries",
			},
			icon: "🩺",
			color: "#FF6B6B",
			dismissible: true,
			expiresIn: 72,
		}),
	},

	// Monday Blues Pattern
	{
		id: "monday-stress",
		name: "Monday Stress Pattern",
		condition: (data: UserData) => {
			const mondayEmotions = data.emotions.filter((e) => {
				const day = e.timestamp.getDay();
				return (
					day === 1 && // Monday
					(e.emotion === "anxious" || e.emotion === "stressed") &&
					e.intensity >= 3
				);
			});

			const totalMondays = new Set(
				data.emotions
					.filter((e) => e.timestamp.getDay() === 1)
					.map((e) => e.timestamp.toDateString()),
			).size;

			return mondayEmotions.length / Math.max(totalMondays, 1) > 0.5;
		},
		threshold: 3,
		generateNudge: (pattern) => ({
			id: `nudge-${pattern.type}-${Date.now()}`,
			priority: "medium",
			type: "suggestion",
			title: "Monday Mindfulness",
			message:
				"Mondays tend to be stressful for you. Start with 5 minutes of morning breathwork to set a calmer tone.",
			action: {
				label: "Try Breathwork",
				target: "/wellness/breathwork",
			},
			icon: "🌅",
			color: "#4ECDC4",
			dismissible: true,
			expiresIn: 168, // 1 week
		}),
	},

	// Missed Reset Consequence Pattern
	{
		id: "missed-reset-stress",
		name: "Missed Reset Stress Buildup",
		condition: (data: UserData) => {
			const missedResets = data.resets.filter((r) => r.skipped);
			const recentMissed = missedResets.filter(
				(r) =>
					new Date().getTime() - r.timestamp.getTime() <
					3 * 24 * 60 * 60 * 1000,
			);

			if (recentMissed.length === 0) return false;

			const stressAfterMissed = data.emotions.filter((e) => {
				const afterMissedReset = recentMissed.some(
					(r) =>
						e.timestamp.getTime() > r.timestamp.getTime() &&
						e.timestamp.getTime() < r.timestamp.getTime() + 24 * 60 * 60 * 1000,
				);
				return afterMissedReset && e.emotion === "stressed" && e.intensity >= 4;
			});

			return stressAfterMissed.length > 2;
		},
		threshold: 2,
		generateNudge: (pattern) => ({
			id: `nudge-${pattern.type}-${Date.now()}`,
			priority: "high",
			type: "insight",
			title: "Reset Reminder",
			message:
				"Skipping resets seems to increase your stress levels. Even a 2-minute micro-reset can help maintain balance.",
			action: {
				label: "Quick Reset Now",
				target: "/resets/quick",
			},
			icon: "⚡",
			color: "#FFD93D",
			dismissible: true,
			expiresIn: 48,
		}),
	},

	// Legal Assignment Anxiety Pattern
	{
		id: "legal-anxiety",
		name: "Legal Assignment Anxiety",
		condition: (data: UserData) => {
			const legalAssignments = data.assignments.filter(
				(a) => a.type === "legal" || a.type === "court",
			);

			const anxietyBeforeLegal = legalAssignments.filter((a) => {
				const emotionsBefore = data.emotions.filter(
					(e) =>
						e.timestamp.getTime() < a.timestamp.getTime() &&
						e.timestamp.getTime() >
							a.timestamp.getTime() - 24 * 60 * 60 * 1000 &&
						e.emotion === "anxious" &&
						e.intensity >= 3,
				);
				return emotionsBefore.length > 0;
			});

			return (
				anxietyBeforeLegal.length / Math.max(legalAssignments.length, 1) > 0.7
			);
		},
		threshold: 2,
		generateNudge: (pattern) => ({
			id: `nudge-${pattern.type}-${Date.now()}`,
			priority: "medium",
			type: "suggestion",
			title: "Pre-Court Preparation",
			message:
				"Legal assignments tend to make you anxious. Try the Confidence Boost meditation 30 minutes before your next one.",
			action: {
				label: "Bookmark Meditation",
				target: "/wellness/confidence-boost",
			},
			icon: "⚖️",
			color: "#6C5CE7",
			dismissible: true,
			expiresIn: 120,
		}),
	},

	// Afternoon Energy Dip Pattern
	{
		id: "afternoon-exhaustion",
		name: "Afternoon Energy Dip",
		condition: (data: UserData) => {
			const afternoonExhaustion = data.emotions.filter((e) => {
				const hour = e.timestamp.getHours();
				return (
					hour >= 14 &&
					hour <= 16 && // 2-4 PM
					e.emotion === "exhausted" &&
					e.intensity >= 3
				);
			});

			const totalAfternoons = new Set(
				data.emotions
					.filter(
						(e) => e.timestamp.getHours() >= 14 && e.timestamp.getHours() <= 16,
					)
					.map((e) => e.timestamp.toDateString()),
			).size;

			return afternoonExhaustion.length / Math.max(totalAfternoons, 1) > 0.4;
		},
		threshold: 5,
		generateNudge: (pattern) => ({
			id: `nudge-${pattern.type}-${Date.now()}`,
			priority: "low",
			type: "suggestion",
			title: "Afternoon Energy Boost",
			message:
				"Your energy often dips around 3 PM. A 5-minute walk or stretching session could help you power through.",
			action: {
				label: "Set Daily Reminder",
				target: "/settings/reminders",
			},
			icon: "🚶",
			color: "#00D084",
			dismissible: true,
			expiresIn: 336, // 2 weeks
		}),
	},

	// Positive Streak Recognition
	{
		id: "wellness-streak",
		name: "Wellness Streak Achievement",
		condition: (data: UserData) => {
			return data.currentStreak >= 7 && data.currentStreak % 7 === 0;
		},
		threshold: 1,
		generateNudge: (pattern) => ({
			id: `nudge-${pattern.type}-${Date.now()}`,
			priority: "low",
			type: "encouragement",
			title: `${pattern.metadata?.streak || 7} Day Streak! 🎉`,
			message:
				"Your consistency is paying off. You're building sustainable wellness habits that will serve you well.",
			icon: "🔥",
			color: "#00C896",
			dismissible: true,
			expiresIn: 24,
		}),
	},

	// Weekend Recovery Pattern
	{
		id: "weekend-recovery",
		name: "Weekend Recovery Needed",
		condition: (data: UserData) => {
			const fridayStress = data.emotions.filter((e) => {
				const day = e.timestamp.getDay();
				return (
					day === 5 && // Friday
					(e.emotion === "exhausted" || e.emotion === "overwhelmed") &&
					e.intensity >= 4
				);
			});

			const totalFridays = new Set(
				data.emotions
					.filter((e) => e.timestamp.getDay() === 5)
					.map((e) => e.timestamp.toDateString()),
			).size;

			return fridayStress.length / Math.max(totalFridays, 1) > 0.6;
		},
		threshold: 3,
		generateNudge: (pattern) => ({
			id: `nudge-${pattern.type}-${Date.now()}`,
			priority: "medium",
			type: "suggestion",
			title: "Weekend Restoration",
			message:
				"You often end the week exhausted. Schedule a longer reset session this weekend to fully recharge.",
			action: {
				label: "Plan Weekend Reset",
				target: "/resets/deep-restoration",
			},
			icon: "🌿",
			color: "#A8E6CF",
			dismissible: true,
			expiresIn: 72,
		}),
	},

	// Effectiveness Pattern
	{
		id: "effective-wellness",
		name: "Most Effective Wellness Action",
		condition: (data: UserData) => {
			const effectiveActions = data.wellnessActions.filter(
				(w) => w.effectiveness && w.effectiveness >= 4,
			);

			if (effectiveActions.length < 5) return false;

			const actionCounts = effectiveActions.reduce(
				(acc, action) => {
					acc[action.category] = (acc[action.category] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>,
			);

			const topCategory = Object.entries(actionCounts).sort(
				([, a], [, b]) => b - a,
			)[0];

			return topCategory && topCategory[1] >= 3;
		},
		threshold: 1,
		generateNudge: (pattern) => ({
			id: `nudge-${pattern.type}-${Date.now()}`,
			priority: "low",
			type: "insight",
			title: "Your Wellness Sweet Spot",
			message: `${pattern.metadata?.topCategory || "Breathwork"} consistently works best for you. Consider making it your go-to stress relief tool.`,
			action: {
				label: "View Your Stats",
				target: "/insights/wellness-effectiveness",
			},
			icon: "📊",
			color: "#667EEA",
			dismissible: true,
			expiresIn: 168,
		}),
	},
];

/**
 * Pattern Detection Engine
 */
export class PatternDetectionEngine {
	private userPatterns: Map<string, UserPattern> = new Map();
	private activeNudges: PatternNudge[] = [];
	private userData: UserData;

	constructor(userData: UserData) {
		this.userData = userData;
	}

	/**
	 * Analyze user data and detect patterns
	 */
	analyzePatterns(): PatternNudge[] {
		const newNudges: PatternNudge[] = [];

		for (const rule of DETECTION_RULES) {
			try {
				if (rule.condition(this.userData)) {
					const existingPattern = this.userPatterns.get(rule.id);

					if (existingPattern) {
						existingPattern.occurrences++;
						existingPattern.lastDetected = new Date();

						if (existingPattern.occurrences >= rule.threshold) {
							const nudge = rule.generateNudge(existingPattern);
							if (!this.isNudgeActive(nudge)) {
								newNudges.push(nudge);
								this.activeNudges.push(nudge);
							}
						}
					} else {
						const newPattern: UserPattern = {
							type: "emotion",
							pattern: rule.name,
							confidence: 0.7,
							occurrences: 1,
							timeframe: "weekly",
							lastDetected: new Date(),
						};
						this.userPatterns.set(rule.id, newPattern);
					}
				}
			} catch (error) {
				console.error(`Error in pattern detection rule ${rule.id}:`, error);
			}
		}

		return newNudges;
	}

	/**
	 * Check if a similar nudge is already active
	 */
	private isNudgeActive(nudge: PatternNudge): boolean {
		return this.activeNudges.some(
			(active) =>
				active.title === nudge.title && active.message === nudge.message,
		);
	}

	/**
	 * Get personalized wellness recommendations
	 */
	getPersonalizedRecommendations(): string[] {
		const recommendations: string[] = [];
		const patterns = Array.from(this.userPatterns.values());

		// Sort by confidence and occurrences
		patterns.sort(
			(a, b) => b.confidence * b.occurrences - a.confidence * a.occurrences,
		);

		// Generate recommendations based on top patterns
		for (const pattern of patterns.slice(0, 3)) {
			if (pattern.pattern.includes("medical")) {
				recommendations.push(
					"Schedule boundary-setting time after medical assignments",
				);
			} else if (pattern.pattern.includes("monday")) {
				recommendations.push("Start Mondays with mindfulness practice");
			} else if (pattern.pattern.includes("afternoon")) {
				recommendations.push("Take energizing breaks between 2-4 PM");
			} else if (pattern.pattern.includes("legal")) {
				recommendations.push(
					"Practice confidence exercises before court assignments",
				);
			}
		}

		return recommendations;
	}

	/**
	 * Clear expired nudges
	 */
	cleanupExpiredNudges(): void {
		const now = Date.now();
		this.activeNudges = this.activeNudges.filter((nudge) => {
			if (nudge.expiresIn) {
				const expirationTime =
					new Date(nudge.id.split("-").pop() || "").getTime() +
					nudge.expiresIn * 60 * 60 * 1000;
				return now < expirationTime;
			}
			return true;
		});
	}

	/**
	 * Dismiss a nudge
	 */
	dismissNudge(nudgeId: string): void {
		this.activeNudges = this.activeNudges.filter((n) => n.id !== nudgeId);
	}

	/**
	 * Get active nudges sorted by priority
	 */
	getActiveNudges(): PatternNudge[] {
		this.cleanupExpiredNudges();

		const priorityOrder = { high: 0, medium: 1, low: 2 };
		return this.activeNudges.sort(
			(a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
		);
	}
}
