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

	// Log subscription gate check details
	console.log("🔐 SubscriptionGate Check:", {
		path: location.pathname,
		user: user?.email,
		userId: user?.id,
		hasActiveSubscription,
		authLoading,
		subLoading,
		subError
	});

	// Allow access to certain public routes
	const publicRoutes = [
		"/",
		"/signup",
		"/login",
		"/reset-password",
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
		console.log("✅ Public route - allowing access:", location.pathname);
		return <>{children}</>;
	}

	// If still loading, show improved loading state (only for protected routes)
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
	if (!user) {
		console.log("❌ No user - redirecting to signup");
		return <Navigate to="/signup" state={{ from: location }} replace />;
	}

	// If logged in but no subscription, show reactivation page
	if (user && !hasActiveSubscription) {
		console.log("⚠️ User has no active subscription - showing reactivation page", {
			userId: user.id,
			email: user.email,
			path: location.pathname
		});
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4">
				<div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
					<div className="mb-6">
						<div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Lock className="w-12 h-12 text-yellow-600" />
						</div>
						<h1 className="text-2xl font-bold text-gray-900 mb-2">
							Subscription Required
						</h1>
						<p className="text-gray-600">
							Your subscription has expired or been cancelled.
						</p>
					</div>

					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
						<p className="text-sm text-blue-800">
							Reactivate your subscription to continue accessing InterpretReflect's wellness tools and resources.
						</p>
					</div>

					<button
						onClick={() => (window.location.href = "/signup")}
						className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 mb-3"
						style={{
							background: "#5C7F4F",
						}}
					>
						<CreditCard className="w-5 h-5" />
						Reactivate Subscription
					</button>

					<button
						onClick={async () => {
							const { supabase } = await import("../lib/supabase");
							await supabase.auth.signOut();
							window.location.href = "/";
						}}
						className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all"
					>
						Sign out
					</button>
				</div>
			</div>
		);
	}

	// User has active subscription or is on public route, allow access
	console.log("✅ User has active subscription - allowing access", {
		userId: user.id,
		email: user.email,
		path: location.pathname
	});
	return <>{children}</>;
};
