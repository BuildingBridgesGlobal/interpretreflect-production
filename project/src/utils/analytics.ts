// Analytics utility for tracking user interactions and conversions

interface AnalyticsEvent {
	event: string;
	category: string;
	label?: string;
	value?: number;
	custom_parameters?: Record<string, any>;
}

class Analytics {
	private isEnabled: boolean = false;

	constructor() {
		this.isEnabled = typeof window !== "undefined" && !!(window as any).gtag;
	}

	// Track generic events
	track(event: AnalyticsEvent) {
		if (!this.isEnabled) return;

		try {
			(window as any).gtag("event", event.event, {
				event_category: event.category,
				event_label: event.label,
				value: event.value,
				...event.custom_parameters,
			});
		} catch (error) {
			console.warn("Analytics tracking failed:", error);
		}
	}

	// Conversion tracking
	trackConversion(trigger: string, step?: string) {
		this.track({
			event: "conversion_flow",
			category: "conversion",
			label: trigger,
			custom_parameters: {
				trigger_type: trigger,
				step: step || "initial",
			},
		});
	}

	trackConversionComplete(trigger: string, email?: string) {
		this.track({
			event: "conversion_complete",
			category: "conversion",
			label: trigger,
			value: 1,
			custom_parameters: {
				trigger_type: trigger,
				has_email: !!email,
			},
		});
	}

	// Trial tracking - removed duplicate, using the more flexible version below

	trackTrialConversion(plan: string, amount: number) {
		this.track({
			event: "trial_converted",
			category: "trial",
			label: plan,
			value: amount,
			custom_parameters: {
				plan,
				conversion_value: amount,
			},
		});
	}

	trackTrialExpired() {
		this.track({
			event: "trial_expired",
			category: "trial",
			label: "no_conversion",
		});
	}

	// User journey tracking
	trackPageView(page: string, title?: string) {
		if (!this.isEnabled) return;

		try {
			(window as any).gtag("config", "GA_MEASUREMENT_ID", {
				page_title: title || page,
				page_location: window.location.href,
			});
		} catch (error) {
			console.warn("Page view tracking failed:", error);
		}
	}

	trackUserAction(
		action: string,
		section: string,
		details?: Record<string, any>,
	) {
		this.track({
			event: "user_action",
			category: "engagement",
			label: `${section}_${action}`,
			custom_parameters: {
				action,
				section,
				...details,
			},
		});
	}

	// Onboarding tracking
	trackOnboardingStart() {
		this.track({
			event: "onboarding_start",
			category: "onboarding",
			label: "begin_flow",
		});
	}

	trackOnboardingStep(step: number, stepName: string) {
		this.track({
			event: "onboarding_step",
			category: "onboarding",
			label: stepName,
			value: step,
			custom_parameters: {
				step_number: step,
				step_name: stepName,
			},
		});
	}

	trackOnboardingComplete(profile: Record<string, any>) {
		this.track({
			event: "onboarding_complete",
			category: "onboarding",
			label: "completed",
			value: 1,
			custom_parameters: {
				interpreter_type: profile.interpreter_type,
				experience_level: profile.experience_level,
				challenges_count: profile.primary_challenges?.length || 0,
				goals_count: profile.wellness_goals?.length || 0,
			},
		});
	}

	// Subscription tracking
	trackSubscriptionIntent() {
		this.track({
			event: "subscription_intent",
			category: "subscription",
			label: "pricing_page_cta",
		});
	}

	trackTrialStart(plan: string = "premium") {
		this.track({
			event: "trial_start",
			category: "subscription",
			label: plan,
			value: 1,
			custom_parameters: {
				plan_type: plan,
				trial_length: 3,
			},
		});
	}

	trackSubscriptionSuccess(plan: string, amount?: number) {
		this.track({
			event: "purchase",
			category: "ecommerce",
			label: plan,
			value: amount || 12.99,
			custom_parameters: {
				currency: "USD",
				plan_type: plan,
				payment_method: "stripe",
			},
		});
	}

	// Feature usage tracking
	trackFeatureUsage(feature: string, action: string, context?: string) {
		this.track({
			event: "feature_usage",
			category: "engagement",
			label: `${feature}_${action}`,
			custom_parameters: {
				feature_name: feature,
				action_type: action,
				context: context,
			},
		});
	}

	trackToolUsage(toolName: string, duration?: number, completed?: boolean) {
		this.track({
			event: "tool_usage",
			category: "wellness_tools",
			label: toolName,
			value: duration,
			custom_parameters: {
				tool_name: toolName,
				session_duration: duration,
				completed: completed,
			},
		});
	}

	// Engagement tracking
	trackTimeOnPage(page: string, seconds: number) {
		this.track({
			event: "time_on_page",
			category: "engagement",
			label: page,
			value: seconds,
			custom_parameters: {
				page_name: page,
				time_seconds: seconds,
			},
		});
	}

	trackScrollDepth(page: string, percentage: number) {
		this.track({
			event: "scroll_depth",
			category: "engagement",
			label: page,
			value: percentage,
			custom_parameters: {
				page_name: page,
				scroll_percentage: percentage,
			},
		});
	}

	// Error tracking
	trackError(error: string, context: string, details?: Record<string, any>) {
		this.track({
			event: "error",
			category: "errors",
			label: context,
			custom_parameters: {
				error_message: error,
				error_context: context,
				...details,
			},
		});
	}

	// Support tracking
	trackSupportInteraction(type: string, topic?: string) {
		this.track({
			event: "support_interaction",
			category: "support",
			label: type,
			custom_parameters: {
				interaction_type: type,
				topic: topic,
			},
		});
	}
}

// Export singleton instance
export const analytics = new Analytics();

// Convenience functions for common tracking scenarios
export const trackConversionFlow = (trigger: string, step?: string) => {
	analytics.trackConversion(trigger, step);
};

export const trackUserFlow = (
	action: string,
	location: string,
	details?: Record<string, any>,
) => {
	analytics.trackUserAction(action, location, details);
};

export const trackWellnessTool = (
	toolName: string,
	duration?: number,
	completed?: boolean,
) => {
	analytics.trackToolUsage(toolName, duration, completed);
};

export const trackSubscriptionFlow = (
	step: string,
	details?: Record<string, any>,
) => {
	analytics.trackUserAction(step, "subscription", details);
};

// Hook for React components
export const useAnalytics = () => {
	return {
		track: analytics.track.bind(analytics),
		trackConversion: analytics.trackConversion.bind(analytics),
		trackUserAction: analytics.trackUserAction.bind(analytics),
		trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
		trackOnboardingStep: analytics.trackOnboardingStep.bind(analytics),
		trackError: analytics.trackError.bind(analytics),
	};
};
