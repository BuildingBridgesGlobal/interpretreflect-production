import { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

interface SubscriptionStatus {
	hasActiveSubscription: boolean;
	loading: boolean;
	subscription: any | null;
}

export const useSubscription = (): SubscriptionStatus => {
	const { user } = useAuth();
	const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
	const [loading, setLoading] = useState(true);
	const [subscription, setSubscription] = useState<any>(null);

	useEffect(() => {
		checkSubscription();
	}, [user]);

	const checkSubscription = async () => {
		if (!user) {
			setHasActiveSubscription(false);
			setLoading(false);
			return;
		}

		try {
			// First check profile for admin status and trial
			const { data: profile, error: profileError } = await supabase
				.from("profiles")
				.select("is_admin, subscription_status, trial_started_at, trial_ends_at")
				.eq("id", user.id)
				.maybeSingle();

			if (profileError) {
				console.log("Error checking profile:", profileError);
			}

			// Allow access if user is admin
			if (profile?.is_admin === true) {
				console.log("User is admin - granting access");
				setHasActiveSubscription(true);
				setSubscription({ admin: true });
				setLoading(false);
				return;
			}

			// Check if user has an active trial
			if (profile?.trial_started_at && profile?.trial_ends_at) {
				const trialEndDate = new Date(profile.trial_ends_at);
				const now = new Date();
				if (trialEndDate > now) {
					console.log("User has active trial - granting access");
					setHasActiveSubscription(true);
					setSubscription({ trial: true, trial_ends_at: profile.trial_ends_at });
					setLoading(false);
					return;
				}
			}

			// Check for active or past_due subscription (grace period)
			const { data, error } = await supabase
				.from("subscriptions")
				.select("*")
				.eq("user_id", user.id)
				.in("status", ["active", "past_due"])
				.order("created_at", { ascending: false })
				.limit(1)
				.maybeSingle();

			if (error) {
				console.log("Error checking subscription:", error);
				// Don't throw - just set defaults
				setHasActiveSubscription(false);
				setSubscription(null);
				return;
			}

			if (data) {
				console.log("User has active paid subscription - granting access");
				setHasActiveSubscription(true);
				setSubscription(data);
			} else {
				console.log("User has no active subscription, trial, or admin access - blocking access");
				setHasActiveSubscription(false);
				setSubscription(null);
			}
		} catch (err) {
			console.error("Failed to check subscription:", err);
			setHasActiveSubscription(false);
		} finally {
			setLoading(false);
		}
	};

	return { hasActiveSubscription, loading, subscription };
};
