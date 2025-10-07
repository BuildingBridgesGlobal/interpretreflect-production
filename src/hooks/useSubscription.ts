import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { performanceMonitor } from "../utils/performanceMonitor";

interface SubscriptionStatus {
	hasActiveSubscription: boolean;
	loading: boolean;
	subscription: any | null;
	error: string | null;
}

// Cache for subscription data to avoid repeated API calls
const subscriptionCache = new Map<string, { data: any; timestamp: number; expires: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useSubscription = (): SubscriptionStatus => {
	const { user } = useAuth();
	const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
	const [loading, setLoading] = useState(true);
	const [subscription, setSubscription] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	// Clear cache when user changes
	useEffect(() => {
		subscriptionCache.clear();
	}, [user?.id]);

	useEffect(() => {
		checkSubscription();
		
		// Cleanup function to abort ongoing requests
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [user]);

	const checkSubscription = useCallback(async () => {
		if (!user) {
			setHasActiveSubscription(false);
			setLoading(false);
			setError(null);
			return;
		}

		// Start performance tracking
		const endTracking = performanceMonitor.trackSubscriptionCheck(user.id);

		// Check cache first
		const cacheKey = `subscription_${user.id}`;
		const cached = subscriptionCache.get(cacheKey);
		
		if (cached && Date.now() < cached.expires) {
			console.log("Using cached subscription data");
			setHasActiveSubscription(cached.data.hasActiveSubscription);
			setSubscription(cached.data.subscription);
			setLoading(false);
			setError(null);
			endTracking(); // End tracking for cached data
			return;
		}

		// Cancel any ongoing request
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		
		// Create new abort controller
		abortControllerRef.current = new AbortController();
		const signal = abortControllerRef.current.signal;

		setLoading(true);
		setError(null);

		try {
			// Reduced timeout for better UX
			const timeoutPromise = new Promise((_, reject) =>
				setTimeout(() => reject(new Error('Subscription check timeout')), 5000)
			);

			// Single optimized query to get all needed data
			const profilePromise = supabase
				.from("profiles")
				.select("is_admin, subscription_status, trial_started_at, trial_ends_at")
				.eq("id", user.id)
				.maybeSingle();
			
			const { data: profile, error: profileError } = await Promise.race([
				profilePromise,
				timeoutPromise
			]) as any;

			// Check if request was aborted
			if (signal.aborted) {
				return;
			}

			if (profileError) {
				console.warn("Error checking profile:", profileError);
				// Continue with subscription check even if profile fails
			}

			let hasAccess = false;
			let subscriptionData = null;

			// Check admin status first (fastest check)
			if (profile?.is_admin === true) {
				console.log("User is admin - granting access");
				hasAccess = true;
				subscriptionData = { admin: true };
			}
			// Check trial status
			else if (profile?.trial_started_at && profile?.trial_ends_at) {
				const trialEndDate = new Date(profile.trial_ends_at);
				const now = new Date();
				if (trialEndDate > now) {
					console.log("User has active trial - granting access");
					hasAccess = true;
					subscriptionData = { trial: true, trial_ends_at: profile.trial_ends_at };
				}
			}

			// Only check subscriptions if not already granted access
			if (!hasAccess) {
				const subscriptionPromise = supabase
					.from("subscriptions")
					.select("*")
					.eq("user_id", user.id)
					.in("status", ["active", "past_due"])
					.order("created_at", { ascending: false })
					.limit(1)
					.maybeSingle();
				
				const { data, error } = await Promise.race([
					subscriptionPromise,
					timeoutPromise
				]) as any;

				// Check if request was aborted
				if (signal.aborted) {
					return;
				}

				if (error) {
					console.warn("Error checking subscription:", error);
					setError("Unable to verify subscription status");
				} else if (data) {
					console.log("User has active paid subscription - granting access");
					hasAccess = true;
					subscriptionData = data;
				}
			}

			// Update state
			setHasActiveSubscription(hasAccess);
			setSubscription(subscriptionData);

			// Cache the result
			subscriptionCache.set(cacheKey, {
				data: { hasActiveSubscription: hasAccess, subscription: subscriptionData },
				timestamp: Date.now(),
				expires: Date.now() + CACHE_DURATION
			});

		} catch (err: any) {
			if (signal.aborted) {
				return; // Don't update state if request was aborted
			}
			
			console.error("Failed to check subscription:", err);
			setError(err.message || "Failed to check subscription");
			setHasActiveSubscription(false);
			setSubscription(null);
		} finally {
			if (!signal.aborted) {
				setLoading(false);
				endTracking(); // End performance tracking
			}
		}
	}, [user]);

	return { hasActiveSubscription, loading, subscription, error };
};
