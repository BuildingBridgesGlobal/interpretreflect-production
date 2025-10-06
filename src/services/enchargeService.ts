// Encharge API configuration
// Using the JWT API Key for authentication with Encharge API
const ENCHARGE_API_KEY = import.meta.env.VITE_ENCHARGE_API_KEY;
// Write Key is also available if needed for specific endpoints
const ENCHARGE_WRITE_KEY = import.meta.env.VITE_ENCHARGE_WRITE_KEY;
const ENCHARGE_API_URL = "https://api.encharge.io/v1";

export interface EnchargeUser {
	email: string;
	firstName?: string;
	lastName?: string;
	userId?: string;
	tags?: string[];
	fields?: Record<string, any>;
}

export interface EnchargeEvent {
	email: string;
	name: string;
	properties?: Record<string, any>;
	timestamp?: string;
}

class EnchargeService {
	private apiKey: string;

	constructor() {
		this.apiKey = ENCHARGE_API_KEY || "";
		if (!this.apiKey) {
			console.warn("Encharge API key not configured");
		}
	}

	/**
	 * Make a request to the Encharge API with timeout
	 */
	private async makeRequest(endpoint: string, method: string, data?: any): Promise<any> {
		if (!this.apiKey) {
			console.log("Encharge not configured, skipping API call");
			return;
		}

		try {
			// Add 5-second timeout to prevent blocking
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000);

			const response = await fetch(`${ENCHARGE_API_URL}${endpoint}`, {
				method,
				headers: {
					"X-Encharge-Token": this.apiKey,
					"Content-Type": "application/json",
				},
				body: data ? JSON.stringify(data) : undefined,
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				console.error(`Encharge API error: ${response.status} - ${errorText}`);
				throw new Error(`Encharge API error: ${response.status}`);
			}

			const contentType = response.headers.get("content-type");
			if (contentType && contentType.includes("application/json")) {
				return await response.json();
			}
			return response.text();
		} catch (error: any) {
			if (error.name === 'AbortError') {
				console.warn("Encharge API request timed out (5s limit)");
			} else {
				console.error("Encharge API request failed:", error);
			}
			throw error;
		}
	}

	/**
	 * Add or update a user in Encharge
	 */
	async addOrUpdateUser(user: EnchargeUser): Promise<void> {
		if (!this.apiKey) {
			console.log("Encharge not configured, skipping user sync");
			return;
		}

		try {
			const userData = {
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				userId: user.userId,
				tags: user.tags || [],
				...user.fields,
			};

			await this.makeRequest("/people", "POST", userData);
			console.log("User synced to Encharge:", user.email);
		} catch (error) {
			console.error("Failed to sync user to Encharge:", error);
		}
	}

	/**
	 * Track an event in Encharge
	 */
	async trackEvent(event: EnchargeEvent): Promise<void> {
		if (!this.apiKey) {
			console.log("Encharge not configured, skipping event tracking");
			return;
		}

		try {
			const eventData = {
				user: {
					email: event.email,
				},
				event: {
					name: event.name,
					properties: event.properties || {},
					time: event.timestamp || new Date().toISOString(),
				},
			};

			await this.makeRequest("/events", "POST", eventData);
			console.log("Event tracked in Encharge:", event.name);
		} catch (error) {
			console.error("Failed to track event in Encharge:", error);
		}
	}

	/**
	 * Handle user signup - add user and trigger welcome automation
	 */
	async handleUserSignup(
		email: string,
		userId: string,
		name?: string,
		signupType: "trial" | "free" | "paid" = "free"
	): Promise<void> {
		// Parse name if provided
		const firstName = name?.split(" ")[0];
		const lastName = name?.split(" ").slice(1).join(" ");

		// Add/update user with appropriate tags
		const tags = ["new_user"];
		if (signupType === "trial") {
			tags.push("trial_user");
		} else if (signupType === "paid") {
			tags.push("paying_customer");
		} else {
			tags.push("free_user");
		}

		await this.addOrUpdateUser({
			email,
			userId,
			firstName,
			lastName,
			tags,
			fields: {
				signupDate: new Date().toISOString(),
				signupSource: "website",
				platform: "InterpretReflect",
			},
		});

		// Track signup event
		await this.trackEvent({
			email,
			name: "user_signup",
			properties: {
				signupType,
				source: window.location.pathname,
				referrer: document.referrer,
			},
		});
	}

	/**
	 * Handle trial signup - add user and trigger trial automation
	 */
	async handleTrialSignup(
		email: string,
		userId: string,
		name?: string,
	): Promise<void> {
		const trialDays = 3;
		const trialEndDate = new Date();
		trialEndDate.setDate(trialEndDate.getDate() + trialDays);

		// Add user with trial information
		await this.addOrUpdateUser({
			email,
			userId,
			firstName: name?.split(" ")[0],
			lastName: name?.split(" ").slice(1).join(" "),
			tags: ["trial_user", "new_signup"],
			fields: {
				trialStartDate: new Date().toISOString(),
				trialEndDate: trialEndDate.toISOString(),
				trialDuration: trialDays,
				signupSource: "website",
			},
		});

		// Track trial started event
		await this.trackEvent({
			email,
			name: "trial_started",
			properties: {
				trialDuration: trialDays,
				plan: "premium",
				source: window.location.pathname,
			},
		});
	}

	/**
	 * Handle subscription conversion
	 */
	async handleSubscriptionConversion(
		email: string,
		plan: string,
		amount: number,
	): Promise<void> {
		// Update user tags and subscription info
		await this.addOrUpdateUser({
			email,
			tags: ["paying_customer", `plan_${plan.toLowerCase()}`],
			fields: {
				subscriptionPlan: plan,
				subscriptionAmount: amount,
				conversionDate: new Date().toISOString(),
				subscriptionStatus: "active",
			},
		});

		// Track conversion event
		await this.trackEvent({
			email,
			name: "subscription_started",
			properties: {
				plan,
				amount,
				currency: "USD",
				previousStatus: "trial",
			},
		});
	}

	/**
	 * Handle trial expiration
	 */
	async handleTrialExpired(email: string): Promise<void> {
		// Update user tags
		await this.addOrUpdateUser({
			email,
			tags: ["trial_expired"],
			fields: {
				trialStatus: "expired",
				trialExpiredAt: new Date().toISOString(),
			},
		});

		// Track trial expired event
		await this.trackEvent({
			email,
			name: "trial_expired",
			properties: {
				expiredAt: new Date().toISOString(),
			},
		});
	}

	/**
	 * Handle user login
	 */
	async trackUserLogin(email: string): Promise<void> {
		await this.trackEvent({
			email,
			name: "user_login",
			properties: {
				loginTime: new Date().toISOString(),
				source: window.location.pathname,
			},
		});
	}

	/**
	 * Handle onboarding progress
	 */
	async trackOnboardingStep(
		email: string,
		step: string,
		completed: boolean,
	): Promise<void> {
		await this.trackEvent({
			email,
			name: "onboarding_progress",
			properties: {
				step,
				completed,
				timestamp: new Date().toISOString(),
			},
		});
	}

	/**
	 * Handle feature usage tracking
	 */
	async trackFeatureUsage(email: string, feature: string, details?: Record<string, any>): Promise<void> {
		await this.trackEvent({
			email,
			name: "feature_used",
			properties: {
				feature,
				timestamp: new Date().toISOString(),
				...details,
			},
		});
	}

	/**
	 * Track reflection completion
	 */
	async trackReflectionCompleted(email: string, reflectionType: string): Promise<void> {
		await this.trackEvent({
			email,
			name: "reflection_completed",
			properties: {
				type: reflectionType,
				completedAt: new Date().toISOString(),
			},
		});
	}

	/**
	 * Track affirmation program started
	 */
	async trackAffirmationProgramStarted(email: string, programName: string): Promise<void> {
		await this.trackEvent({
			email,
			name: "affirmation_program_started",
			properties: {
				program: programName,
				startedAt: new Date().toISOString(),
			},
		});
	}

	/**
	 * Track wellness check-in completion
	 */
	async trackWellnessCheckIn(email: string, score: number): Promise<void> {
		await this.trackEvent({
			email,
			name: "wellness_checkin_completed",
			properties: {
				score,
				completedAt: new Date().toISOString(),
			},
		});
	}

	/**
	 * Track subscription cancellation
	 */
	async handleSubscriptionCancelled(email: string, reason?: string): Promise<void> {
		// Update user tags
		await this.addOrUpdateUser({
			email,
			tags: ["cancelled_subscription"],
			fields: {
				subscriptionStatus: "cancelled",
				cancellationDate: new Date().toISOString(),
				cancellationReason: reason,
			},
		});

		// Track cancellation event
		await this.trackEvent({
			email,
			name: "subscription_cancelled",
			properties: {
				reason,
				cancelledAt: new Date().toISOString(),
			},
		});
	}

	/**
	 * Add user to waitlist
	 */
	async addToWaitlist(email: string, name?: string, interest?: string): Promise<void> {
		await this.addOrUpdateUser({
			email,
			firstName: name?.split(" ")[0],
			lastName: name?.split(" ").slice(1).join(" "),
			tags: ["waitlist"],
			fields: {
				waitlistDate: new Date().toISOString(),
				interest,
			},
		});

		await this.trackEvent({
			email,
			name: "joined_waitlist",
			properties: {
				interest,
				source: window.location.pathname,
			},
		});
	}
}

// Export singleton instance
export const enchargeService = new EnchargeService();

// Export types for use in other components
export type { EnchargeUser, EnchargeEvent };