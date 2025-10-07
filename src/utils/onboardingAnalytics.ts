/**
 * Onboarding analytics utilities for tracking user engagement and success
 */

interface OnboardingEvent {
	event: string;
	userId: string;
	timestamp: string;
	data?: Record<string, any>;
}

interface OnboardingMetrics {
	totalUsers: number;
	onboardingStarted: number;
	onboardingCompleted: number;
	featureDiscoveryCompleted: number;
	firstReflectionCompleted: number;
	timeToFirstReflection: number; // in minutes
	dropOffPoints: Record<string, number>;
	featureEngagement: Record<string, number>;
}

class OnboardingAnalytics {
	private events: OnboardingEvent[] = [];

	/**
	 * Track onboarding event
	 */
	trackEvent(event: string, userId: string, data?: Record<string, any>): void {
		const eventData: OnboardingEvent = {
			event,
			userId,
			timestamp: new Date().toISOString(),
			data
		};

		this.events.push(eventData);
		console.log('Onboarding Analytics:', eventData);

		// In production, you'd send this to your analytics service
		// this.sendToAnalytics(eventData);
	}

	/**
	 * Track onboarding start
	 */
	trackOnboardingStart(userId: string, source: string = 'welcome_modal'): void {
		this.trackEvent('onboarding_started', userId, { source });
	}

	/**
	 * Track onboarding completion
	 */
	trackOnboardingComplete(userId: string, profileData: any): void {
		this.trackEvent('onboarding_completed', userId, {
			interpreter_type: profileData.interpreter_type,
			experience_level: profileData.experience_level,
			primary_challenges: profileData.primary_challenges,
			wellness_goals: profileData.wellness_goals
		});
	}

	/**
	 * Track feature discovery
	 */
	trackFeatureDiscovery(userId: string, featureId: string, action: 'viewed' | 'clicked' | 'completed'): void {
		this.trackEvent('feature_discovery', userId, { featureId, action });
	}

	/**
	 * Track first reflection
	 */
	trackFirstReflection(userId: string, reflectionType: string, timeSpent: number): void {
		this.trackEvent('first_reflection', userId, {
			reflection_type: reflectionType,
			time_spent_minutes: timeSpent
		});
	}

	/**
	 * Track progressive onboarding tip
	 */
	trackProgressiveTip(userId: string, tipId: string, action: 'shown' | 'dismissed' | 'clicked'): void {
		this.trackEvent('progressive_tip', userId, { tipId, action });
	}

	/**
	 * Track welcome modal interaction
	 */
	trackWelcomeModal(userId: string, step: number, answers: any, action: 'completed' | 'skipped'): void {
		this.trackEvent('welcome_modal', userId, {
			step,
			answers,
			action
		});
	}

	/**
	 * Track onboarding drop-off
	 */
	trackDropOff(userId: string, step: string, reason?: string): void {
		this.trackEvent('onboarding_dropoff', userId, { step, reason });
	}

	/**
	 * Get onboarding metrics
	 */
	getMetrics(): OnboardingMetrics {
		const totalUsers = new Set(this.events.map(e => e.userId)).size;
		const onboardingStarted = this.events.filter(e => e.event === 'onboarding_started').length;
		const onboardingCompleted = this.events.filter(e => e.event === 'onboarding_completed').length;
		const featureDiscoveryCompleted = this.events.filter(e => 
			e.event === 'feature_discovery' && e.data?.action === 'completed'
		).length;
		const firstReflectionCompleted = this.events.filter(e => e.event === 'first_reflection').length;

		// Calculate average time to first reflection
		const firstReflectionEvents = this.events.filter(e => e.event === 'first_reflection');
		const timeToFirstReflection = firstReflectionEvents.length > 0 
			? firstReflectionEvents.reduce((sum, e) => sum + (e.data?.time_spent_minutes || 0), 0) / firstReflectionEvents.length
			: 0;

		// Calculate drop-off points
		const dropOffPoints: Record<string, number> = {};
		this.events
			.filter(e => e.event === 'onboarding_dropoff')
			.forEach(e => {
				const step = e.data?.step || 'unknown';
				dropOffPoints[step] = (dropOffPoints[step] || 0) + 1;
			});

		// Calculate feature engagement
		const featureEngagement: Record<string, number> = {};
		this.events
			.filter(e => e.event === 'feature_discovery')
			.forEach(e => {
				const featureId = e.data?.featureId || 'unknown';
				featureEngagement[featureId] = (featureEngagement[featureId] || 0) + 1;
			});

		return {
			totalUsers,
			onboardingStarted,
			onboardingCompleted,
			featureDiscoveryCompleted,
			firstReflectionCompleted,
			timeToFirstReflection,
			dropOffPoints,
			featureEngagement
		};
	}

	/**
	 * Get onboarding success rate
	 */
	getSuccessRate(): number {
		const metrics = this.getMetrics();
		if (metrics.onboardingStarted === 0) return 0;
		return (metrics.onboardingCompleted / metrics.onboardingStarted) * 100;
	}

	/**
	 * Get feature discovery completion rate
	 */
	getFeatureDiscoveryRate(): number {
		const metrics = this.getMetrics();
		if (metrics.onboardingCompleted === 0) return 0;
		return (metrics.featureDiscoveryCompleted / metrics.onboardingCompleted) * 100;
	}

	/**
	 * Get first reflection completion rate
	 */
	getFirstReflectionRate(): number {
		const metrics = this.getMetrics();
		if (metrics.onboardingCompleted === 0) return 0;
		return (metrics.firstReflectionCompleted / metrics.onboardingCompleted) * 100;
	}

	/**
	 * Export metrics for dashboard
	 */
	exportMetrics(): string {
		const metrics = this.getMetrics();
		return JSON.stringify({
			...metrics,
			successRate: this.getSuccessRate(),
			featureDiscoveryRate: this.getFeatureDiscoveryRate(),
			firstReflectionRate: this.getFirstReflectionRate(),
			generatedAt: new Date().toISOString()
		}, null, 2);
	}

	/**
	 * Clear all events (for testing)
	 */
	clearEvents(): void {
		this.events = [];
	}
}

// Create singleton instance
export const onboardingAnalytics = new OnboardingAnalytics();

// Export types
export type { OnboardingEvent, OnboardingMetrics };
