import { ArrowRight, Check, Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// Create a separate Supabase client for password reset to avoid auth conflicts
// IMPORTANT: Disable session persistence to prevent multi-tab conflicts
const resetSupabase = createClient(
	import.meta.env.VITE_SUPABASE_URL || "",
	import.meta.env.VITE_SUPABASE_ANON_KEY || "",
	{
		auth: {
			persistSession: false, // Don't persist session across tabs
			autoRefreshToken: false, // Don't auto-refresh
			detectSessionInUrl: true, // Still detect the recovery token
			storage: undefined, // No storage = no persistence
		}
	}
);

const ResetPassword: React.FC = () => {
	console.log("🚀🚀🚀 ResetPassword Component v2.2 LOADED - CRITICAL DEBUG BUILD 🚀🚀🚀");
	window.RESET_PAGE_VERSION = "v2.2";
	console.error("RESET PASSWORD PAGE LOADED - VERSION 2.2");
	const navigate = useNavigate();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

	useEffect(() => {
		// Check if user has access to this page (came from email link)
		const checkAccess = async () => {
			console.log("🔍 Password reset: Checking access on page load");
			try {
				// Get URL parameters
				const urlParams = new URLSearchParams(window.location.search);
				const code = urlParams.get('code');
				console.log("🔗 Password reset: URL code parameter:", code ? "Present" : "Not present");

				// Also check hash params (Supabase sometimes uses hash)
				const hashParams = new URLSearchParams(window.location.hash.substring(1));
				const accessToken = hashParams.get('access_token');
				const type = hashParams.get('type');
				console.log("🔗 Password reset: Hash parameters:", {
					hasAccessToken: !!accessToken,
					type: type
				});

				// If we have a code parameter or recovery token, this is valid
				if (code || (type === 'recovery' && accessToken)) {
					console.log('✅ Password reset: Valid reset link detected');

					// Exchange the code for a session if we have one
					if (code) {
						try {
							console.log("🔄 Password reset: Exchanging code for session...");
							const { data, error } = await resetSupabase.auth.exchangeCodeForSession(code);
							console.log("📊 Password reset: Exchange result:", { data, error });
							if (error) {
								console.error('❌ Error exchanging code:', error);
								setError("Invalid or expired reset link. Please request a new one.");
								return;
							}
							console.log("✅ Password reset: Code exchanged successfully");
						} catch (err) {
							console.error('💥 Failed to exchange code:', err);
						}
					}

					// Clear the URL to prevent re-processing and avoid multi-tab issues
					console.log("🧹 Password reset: Clearing URL parameters");
					window.history.replaceState(null, '', window.location.pathname);

					// Final session check
					const { data: { session } } = await resetSupabase.auth.getSession();
					console.log("✨ Password reset: Final session check:", session ? "Session established" : "No session");
					return; // Allow password reset
				}

				// Otherwise check for existing recovery session
				console.log("🔍 Password reset: Checking for existing session...");
				const { data: { session } } = await resetSupabase.auth.getSession();
				console.log("📊 Password reset: Existing session check:", session ? "Session found" : "No session");
				if (!session) {
					setError("Invalid or expired reset link. Please request a new one.");
				}
			} catch (err) {
				console.error('💥 Error checking reset access:', err);
				setError("An error occurred. Please request a new reset link.");
			}
		};
		checkAccess();
	}, []);

	const validatePassword = (pass: string) => {
		if (pass.length < 8) {
			return "Password must be at least 8 characters long";
		}
		return "";
	};

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log("🔄 Password reset: Starting password reset process");
		setError("");
		setValidationErrors({});

		// Validate fields
		const errors: Record<string, string> = {};

		const passwordError = validatePassword(password);
		if (passwordError) {
			errors.password = passwordError;
		}

		if (password !== confirmPassword) {
			errors.confirmPassword = "Passwords don't match";
		}

		if (Object.keys(errors).length > 0) {
			setValidationErrors(errors);
			console.log("❌ Password reset: Validation errors:", errors);
			return;
		}

		setLoading(true);
		console.log("✅ Password reset: Validation passed, updating password...");

		try {
			// First, check if we have a session
			const { data: { session }, error: sessionError } = await resetSupabase.auth.getSession();
			console.log("📊 Password reset: Current session status:", session ? "Session exists" : "No session", sessionError);

			console.log("🔐 Password reset: Calling updateUser with new password");
			const { data, error } = await resetSupabase.auth.updateUser({
				password: password,
			});

			console.log("📝 Password reset: Update response:", { data, error });

			if (error) {
				console.error("❌ Password reset: Update failed:", error);
				throw error;
			}

			console.log("✅ Password reset: Password updated successfully");

			// Immediately sign out to clear the recovery session
			// This prevents auth conflicts with other open tabs
			console.log("🚪 Password reset: Signing out to clear recovery session");
			const { error: signOutError } = await resetSupabase.auth.signOut();
			if (signOutError) {
				console.warn("⚠️ Password reset: Sign out warning:", signOutError);
			}

			console.log("🎉 Password reset: Process completed successfully");
			setSuccess(true);

			// User will manually navigate to sign in
			// This ensures clean auth state
		} catch (err: any) {
			console.error("💥 Password reset: Fatal error:", err);
			setError(err.message || "Failed to reset password");
		} finally {
			console.log("🏁 Password reset: Setting loading to false");
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
				{/* Logo */}
				<div className="text-center mb-8">
					<h1 className="text-2xl text-gray-800 font-bold tracking-tight leading-none mb-4">
						Interpret<span className="text-gray-600">Reflect</span>
					</h1>
					<h2 className="text-2xl font-bold text-gray-900">
						Create New Password
					</h2>
					<p className="text-gray-600 mt-2">
						Enter your new password below
					</p>
					<p className="text-xs text-red-500 font-bold mt-1">v2.2 - CRITICAL DEBUG BUILD</p>
				</div>

				{success ? (
					// Success state
					<div className="text-center py-8">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
							<Check className="w-8 h-8 text-green-600" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							Password Reset Successfully!
						</h3>
						<p className="text-gray-600 mb-6">
							Your password has been updated successfully. Please sign in with your new password.
						</p>
						<div className="space-y-3">
							<button
								onClick={() => {
									// Navigate to sign in page
									// Use replace to prevent back button issues
									window.location.replace("/");
								}}
								className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-semibold transition-all hover:opacity-90"
								style={{ background: "#2D5F3F" }}
							>
								Go to Sign In
								<ArrowRight className="w-5 h-5" />
							</button>
							<p className="text-xs text-center text-gray-500">
								Click the button above to sign in with your new password
							</p>
						</div>
					</div>
				) : (
					<form onSubmit={handleResetPassword}>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									New Password
								</label>
								<input
									type="password"
									autoComplete="new-password"
									value={password}
									onChange={(e) => {
										setPassword(e.target.value);
										setValidationErrors({});
									}}
									placeholder="Enter new password"
									className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
										validationErrors.password
											? "border-red-500"
											: "border-gray-300"
									}`}
									style={
										{
											"--tw-ring-color": "#2D5F3F",
										} as React.CSSProperties
									}
									required
								/>
								{validationErrors.password && (
									<p className="text-sm text-red-500 mt-1">
										{validationErrors.password}
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Confirm Password
								</label>
								<input
									type="password"
									autoComplete="new-password"
									value={confirmPassword}
									onChange={(e) => {
										setConfirmPassword(e.target.value);
										setValidationErrors({});
									}}
									placeholder="Confirm new password"
									className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
										validationErrors.confirmPassword
											? "border-red-500"
											: "border-gray-300"
									}`}
									style={
										{
											"--tw-ring-color": "#2D5F3F",
										} as React.CSSProperties
									}
									required
								/>
								{validationErrors.confirmPassword && (
									<p className="text-sm text-red-500 mt-1">
										{validationErrors.confirmPassword}
									</p>
								)}
							</div>

							<button
								type="submit"
								disabled={loading || !password || !confirmPassword}
								className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
								style={{
									background: loading ? "#9CA3AF" : "#2D5F3F",
								}}
							>
								{loading ? (
									<>
										<Loader2 className="w-5 h-5 animate-spin" />
										Resetting Password...
									</>
								) : (
									<>
										Reset Password
										<ArrowRight className="w-5 h-5" />
									</>
								)}
							</button>
						</div>

						{error && (
							<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-sm text-red-600">{error}</p>
							</div>
						)}
					</form>
				)}

				{/* Help text */}
				<p className="mt-6 text-xs text-center text-gray-500">
					Having trouble? Contact{" "}
					<a
						href="mailto:hello@huviatechnologies.com"
						className="underline hover:text-gray-700"
					>
						hello@huviatechnologies.com
					</a>
				</p>
			</div>
		</div>
	);
};

export default ResetPassword;