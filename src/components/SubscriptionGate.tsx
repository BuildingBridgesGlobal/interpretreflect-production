import { CreditCard, Loader2, Lock } from "lucide-react";
import type React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../hooks/useSubscription";

interface SubscriptionGateProps {
	children: React.ReactNode;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
	children,
}) => {
	const { user, loading: authLoading } = useAuth();
	const { hasActiveSubscription, loading: subLoading, error: subError } = useSubscription();
	const location = useLocation();

	// Allow access to certain public routes
	const publicRoutes = [
		"/",
		"/signup",
		"/login",
		"/pricing",
		"/about",
		"/contact",
		"/terms",
		"/privacy",
		"/payment-success",
	];
	const isPublicRoute = publicRoutes.includes(location.pathname);

	// If still loading, show improved loading state
	if (authLoading || subLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
				<div className="text-center">
					<div className="mb-4">
						<Loader2
							className="w-12 h-12 animate-spin mx-auto"
							style={{ color: "#5C7F4F" }}
						/>
					</div>
					<h2 className="text-xl font-semibold text-gray-800 mb-2">
						{authLoading ? "Checking authentication..." : "Verifying subscription..."}
					</h2>
					<p className="text-gray-600 text-sm">
						Please wait while we verify your access
					</p>
					{/* Show error if subscription check failed */}
					{subError && (
						<div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
							<p className="text-sm text-yellow-800">
								⚠️ {subError}. You may still be able to access the platform.
							</p>
						</div>
					)}
				</div>
			</div>
		);
	}

	// If not logged in, redirect to signup
	if (!user && !isPublicRoute) {
		return <Navigate to="/signup" state={{ from: location }} replace />;
	}

	// If logged in but no subscription, sign them out automatically and redirect to signup
	if (user && !hasActiveSubscription && !isPublicRoute) {
		// Auto sign out users without valid subscriptions
		const signOutUser = async () => {
			const { supabase } = await import("../lib/supabase");
			await supabase.auth.signOut();
			window.location.href = "/signup";
		};
		signOutUser();

		// Show loading while signing out
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2
					className="w-8 h-8 animate-spin"
					style={{ color: "#5C7F4F" }}
				/>
			</div>
		);
	}

	// User has active subscription or is on public route, allow access
	return <>{children}</>;
};
