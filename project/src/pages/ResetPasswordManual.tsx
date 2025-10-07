import { ArrowRight, Check, Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// Create a completely isolated Supabase client for password reset
// This prevents ANY session persistence or cross-tab issues
const resetClient = createClient(
	import.meta.env.VITE_SUPABASE_URL || "",
	import.meta.env.VITE_SUPABASE_ANON_KEY || "",
	{
		auth: {
			persistSession: false,
			autoRefreshToken: false,
			detectSessionInUrl: true,
			storage: {
				getItem: () => null,
				setItem: () => {},
				removeItem: () => {},
			},
			flowType: 'pkce',
		}
	}
);

const ResetPasswordManual: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
	const [isValidToken, setIsValidToken] = useState(false);

	useEffect(() => {
		// Check for recovery token in URL
		const hashParams = new URLSearchParams(window.location.hash.substring(1));
		const accessToken = hashParams.get('access_token');
		const type = hashParams.get('type');

		if (type === 'recovery' && accessToken) {
			setIsValidToken(true);
			// Clean URL to prevent reprocessing
			window.history.replaceState(null, '', window.location.pathname);
		} else {
			setError("Invalid or expired reset link. Please request a new one.");
		}
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
			// Update password using the isolated client
			const { error } = await resetClient.auth.updateUser({
				password: password,
			});

			if (error) throw error;

			// Immediately clear any session to prevent auto-login
			await resetClient.auth.signOut();

			// Clear all storage to ensure no persistence
			localStorage.removeItem('supabase.auth.token');
			sessionStorage.clear();

			setSuccess(true);
		} catch (err: any) {
			setError(err.message || "Failed to reset password");
		} finally {
			setLoading(false);
		}
	};

	if (!isValidToken && !success) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Invalid Reset Link
					</h2>
					<p className="text-gray-600 mb-6">
						{error}
					</p>
					<button
						onClick={() => navigate("/forgot-password-simple")}
						className="px-6 py-3 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-all"
					>
						Request New Reset Link
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
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
					<div className="text-center py-8">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
							<Check className="w-8 h-8 text-green-600" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							Password Reset Successfully!
						</h3>
						<p className="text-gray-600 mb-6">
							Your password has been updated. Please sign in with your new password.
						</p>
						<button
							onClick={() => {
								// Navigate with full page refresh to ensure clean state
								window.location.href = "/";
							}}
							className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-semibold transition-all hover:opacity-90"
							style={{ background: "#2D5F3F" }}
						>
							Go to Sign In
							<ArrowRight className="w-5 h-5" />
						</button>
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
									style={{
										"--tw-ring-color": "#2D5F3F",
									} as React.CSSProperties}
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
									style={{
										"--tw-ring-color": "#2D5F3F",
									} as React.CSSProperties}
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

export default ResetPasswordManual;