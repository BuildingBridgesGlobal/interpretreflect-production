import { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

interface OnboardingState {
	isRequired: boolean;
	isVisible: boolean;
	loading: boolean;
}

export function useOnboarding() {
	const { user } = useAuth();
	const [state, setState] = useState<OnboardingState>({
		isRequired: false,
		isVisible: false,
		loading: true,
	});

	useEffect(() => {
		checkOnboardingStatus();
	}, [user]);

	const checkOnboardingStatus = async () => {
		if (!user) {
			setState({ isRequired: false, isVisible: false, loading: false });
			return;
		}

		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("onboarding_completed, subscription_status")
				.eq("id", user.id)
				.maybeSingle();

			// Handle null defensively during first load
			if (error) {
				console.log("Error fetching profile:", error);
				// Don't throw - just set defaults
				setState({ isRequired: false, isVisible: false, loading: false });
				return;
			}

			const needsOnboarding = data ? !data.onboarding_completed : false;
			const hasActiveSubscription = data?.subscription_status === "active";

			// Show onboarding for new users with active subscriptions
			const shouldShowOnboarding = needsOnboarding && hasActiveSubscription;

			setState({
				isRequired: needsOnboarding,
				isVisible: shouldShowOnboarding,
				loading: false,
			});
		} catch (error) {
			console.error("Error checking onboarding status:", error);
			setState({ isRequired: false, isVisible: false, loading: false });
		}
	};

	const startOnboarding = () => {
		setState((prev) => ({ ...prev, isVisible: true }));
	};

	const completeOnboarding = () => {
		setState((prev) => ({
			...prev,
			isRequired: false,
			isVisible: false,
		}));
	};

	const hideOnboarding = () => {
		setState((prev) => ({ ...prev, isVisible: false }));
	};

	return {
		isRequired: state.isRequired,
		isVisible: state.isVisible,
		loading: state.loading,
		startOnboarding,
		completeOnboarding,
		hideOnboarding,
		checkOnboardingStatus,
	};
}
