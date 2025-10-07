import { ArrowRight, Check, Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// Supabase credentials
const supabaseUrl =
	import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
	import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

// Create isolated Supabase client for reset password page ONLY
// Uses sessionStorage to prevent cross-tab session leakage
// Enables detectSessionInUrl to automatically handle password reset tokens
const resetPasswordClient = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: true,
		detectSessionInUrl: true, // Enable to auto-detect recovery tokens in URL
		storage: window.sessionStorage, // CRITICAL: sessionStorage isolates to this tab only
		storageKey: "supabase.reset.token",
		flowType: "pkce",
	},
});

const ResetPassword: React.FC = () => {
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
		// Wait for Supabase client to automatically process URL tokens
		// detectSessionInUrl is enabled, so it will handle code exchange automatically
		const checkSession = async () => {
			console.log('Reset password page - Full URL:', window.location.href);

			// Give Supabase a moment to process the URL
			await new Promise(resolve => setTimeout(resolve, 500));

			// Check if we have a valid session after auto-processing
			const { data: { session }, error } = await resetPasswordClient.auth.getSession();

			console.log('Reset password page - Session check:', {
				hasSession: !!session,
				error: error?.message
			});

			// Only show error if we're missing both URL params AND session
			const hasUrlParams = window.location.search.includes('code') ||
								window.location.hash.includes('access_token');

			if (!session && !hasUrlParams) {
				setError("Invalid or expired reset link. Please request a new one.");
			} else if (!session && hasUrlParams) {
				// Has params but no session - token exchange might have failed
				setError("Invalid or expired reset link. Please request a new one.");
			}
		};

		checkSession();
	}, []);

	const validatePassword = (pass: string) => {
		if (pass.length < 8) {
			return "Password must be at least 8 characters long";
		}
		return "";
	};

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
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
			return;
		}

		setLoading(true);
		try {
			// Double-check we have a valid session before updating
			const { data: { session } } = await resetPasswordClient.auth.getSession();
			if (!session) {
				throw new Error("No active session. Please click the reset link from your email again.");
			}

			const { error } = await resetPasswordClient.auth.updateUser({
				password: password,
			});

			if (error) throw error;

			setSuccess(true);
			// Clear the sessionStorage token after successful reset
			sessionStorage.removeItem("supabase.reset.token");
			// Redirect to login page after success
			setTimeout(() => {
				navigate("/");
			}, 2000);
		} catch (err: any) {
			console.error("Password reset error:", err);
			setError(err.message || "Failed to reset password");
		} finally {
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
						<p className="text-gray-600">
							Redirecting you to the app...
						</p>
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
											"--tw-ring-color": "#5C7F4F",
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
											"--tw-ring-color": "#5C7F4F",
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
									background: loading ? "#9CA3AF" : "#5C7F4F",
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