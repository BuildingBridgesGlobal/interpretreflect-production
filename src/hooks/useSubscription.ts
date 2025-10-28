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
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours - only check once per day

// Export a function to force clear the cache (useful for debugging)
export const clearSubscriptionCache = () => {
	console.log("🔄 Clearing subscription cache");
	subscriptionCache.clear();
};

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

	// Listen for manual subscription refresh events (e.g., after payment)
	useEffect(() => {
		const handleSubscriptionRefresh = () => {
			console.log("Manual subscription refresh triggered");
			clearSubscriptionCache();
			checkSubscription();
		};

		window.addEventListener('refreshSubscription', handleSubscriptionRefresh);
		return () => window.removeEventListener('refreshSubscription', handleSubscriptionRefresh);
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
			// Use direct REST API to bypass RLS issues
			let accessToken: string | null = null;
			
			// Get token from localStorage
			try {
				const authKey = Object.keys(localStorage).find(key => key.includes('supabase.auth.token'));
				if (authKey) {
					const authData = JSON.parse(localStorage.getItem(authKey) || '{}');
					accessToken = authData.access_token || authData.currentSession?.access_token;
				}
			} catch (e) {
				console.warn('Could not get token from localStorage:', e);
			}
			
			// Fallback to getSession if needed
			if (!accessToken) {
				const { data: { session } } = await supabase.auth.getSession();
				accessToken = session?.access_token || null;
			}
			
			if (!accessToken) {
				console.error('No access token available for subscription check');
				setHasActiveSubscription(true); // Fail open
				setLoading(false);
				endTracking();
				return;
			}
			
			// Build REST API URL
			const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles`);
			url.searchParams.set('id', `eq.${user.id}`);
			url.searchParams.set('select', 'is_admin,subscription_status,trial_started_at,trial_ends_at');
			
			const response = await fetch(url.toString(), {
				method: 'GET',
				headers: {
					'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
					'Authorization': `Bearer ${accessToken}`,
					'Content-Type': 'application/json'
				}
			});
			
			if (!response.ok) {
				const errorText = await response.text();
				console.error('Profile fetch error:', response.status, errorText);
				throw new Error(`HTTP ${response.status}: ${errorText}`);
			}
			
			const profiles = await response.json();
			const profile = profiles && profiles.length > 0 ? profiles[0] : null;
			const profileError = null;

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
			// Check trial status - either by subscription_status or trial dates
			else if (profile?.subscription_status === 'trialing' || profile?.subscription_status === 'trial') {
				console.log("User has trialing/trial status - granting access");
				hasAccess = true;
				subscriptionData = { trial: true, status: profile.subscription_status };
			}
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
				// First, get ALL subscriptions to see what's in the database
				const { data: allSubs, error: allSubsError } = await supabase
					.from("subscriptions")
					.select("*")
					.eq("user_id", user.id)
					.order("created_at", { ascending: false });

				if (allSubs && allSubs.length > 0) {
					console.log("All user subscriptions found:", allSubs.map((s: any) => ({
						id: s.id,
						status: s.status,
						created_at: s.created_at,
						current_period_end: s.current_period_end
					})));
				}

				// Now check for active subscriptions only
				const { data, error } = await supabase
					.from("subscriptions")
					.select("*")
					.eq("user_id", user.id)
					.in("status", ["active", "past_due"])
					.order("created_at", { ascending: false })
					.limit(1)
					.maybeSingle();

				// Check if request was aborted
				if (signal.aborted) {
					return;
				}

				if (error) {
					console.warn("Error checking subscription:", error);
					setError("Unable to verify subscription status");
				} else if (data) {
					console.log("User has active paid subscription - granting access", {
						subscriptionId: data.id,
						status: data.status,
						periodEnd: data.current_period_end
					});
					hasAccess = true;
					subscriptionData = data;
				} else {
					console.log("No active subscription found for user", user.id);
					// Check if profile has subscription_status set incorrectly
					if (profile?.subscription_status === 'active') {
						console.error("⚠️ MISMATCH: Profile shows active subscription but no active subscription found in database!");
					}
				}
			}

			// Final verification: if profile shows 'canceled' but we found no active subscription
			// and no trial, ensure hasAccess is false
			if (profile?.subscription_status === 'canceled' && !hasAccess) {
				console.log("✅ Correctly blocking access for canceled subscription");
				hasAccess = false;
			}

			// Final verification: if profile incorrectly shows 'active' but no subscription found
			if (profile?.subscription_status === 'active' && !subscriptionData && !hasAccess) {
				console.error("⚠️ Profile shows active but no subscription found - blocking access");
				hasAccess = false;
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

			// IMPORTANT: On error, assume user has access (fail open, not closed)
			// If their subscription is truly invalid, they wouldn't be able to log in
			console.warn("⚠️ Subscription check failed - allowing access (fail-open policy)");
			setHasActiveSubscription(true);
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
