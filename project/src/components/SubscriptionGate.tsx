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
	const { hasActiveSubscription, loading: subLoading } = useSubscription();
	const location = useLocation();

	// Allow access to certain public routes
	const publicRoutes = [
		"/",
		"/signup",
		"/login",
		"/reset-password", // Add password reset as public route
		"/forgot-password", // New forgot password page
		"/enter-reset-code", // New code entry page
		"/pricing",
		"/about",
		"/contact",
		"/terms",
		"/privacy",
		"/payment-success",
	];
	const isPublicRoute = publicRoutes.includes(location.pathname);

	// If it's a public route, render immediately without any auth checks
	if (isPublicRoute) {
		return <>{children}</>;
	}

	// If still loading (only check for protected routes)
	if (authLoading || subLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2
					className="w-8 h-8 animate-spin"
					style={{ color: "#2D5F3F" }}
				/>
			</div>
		);
	}

	// If not logged in, redirect to signup
	if (!user) {
		return <Navigate to="/signup" state={{ from: location }} replace />;
	}

	// If logged in but no subscription, show subscription required message
	if (user && !hasActiveSubscription) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4">
				<div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
					<div className="mb-6">
						<div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Lock className="w-12 h-12 text-red-600" />
						</div>
						<h1 className="text-2xl font-bold text-gray-900 mb-2">
							No Active Subscription
						</h1>
						<p className="text-gray-600">
							Your subscription has expired or been cancelled.
						</p>
					</div>

					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
						<p className="text-sm text-yellow-800">
							To continue using InterpretReflect, please subscribe or reactivate your subscription.
							You'll regain access to all premium features immediately.
						</p>
					</div>

					<button
						onClick={() => (window.location.href = "/signup")}
						className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2"
						style={{
							background:
								"linear-gradient(135deg, #2D5F3F, rgb(107, 142, 94))",
						}}
					>
						<CreditCard className="w-5 h-5" />
						Subscribe Now
					</button>

					<button
						onClick={async () => {
							const { supabase } = await import("../lib/supabase");
							await supabase.auth.signOut();
							window.location.href = "/";
						}}
						className="mt-3 text-sm text-gray-600 hover:text-gray-800 underline"
					>
						Sign out and return to homepage
					</button>

					<p className="mt-4 text-xs text-gray-500">
						Need help? Contact us at{" "}
						<a
							href="mailto:hello@huviatechnologies.com"
							className="hover:underline"
							style={{ color: "#2D5F3F" }}
						>
							hello@huviatechnologies.com
						</a>
					</p>
				</div>
			</div>
		);
	}

	// User has active subscription or is on public route, allow access
	return <>{children}</>;
};
