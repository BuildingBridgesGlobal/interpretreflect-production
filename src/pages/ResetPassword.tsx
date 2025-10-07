import { ArrowRight, Check, Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

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
		let mounted = true;

		// Listen for auth state changes (this catches the session from URL)
		const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
			if (!mounted) return;

			console.log('Reset password - Auth event:', event, {
				hasSession: !!session,
				userId: session?.user?.id
			});

			// When password recovery session is established, we're ready
			if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
				console.log('Reset password - Session ready for password update');
			}
		});

		// Also check current session immediately
		const checkSession = async () => {
			console.log('Reset password - Initial URL:', window.location.href);

			const { data: { session }, error } = await supabase.auth.getSession();

			console.log('Reset password - Initial session check:', {
				hasSession: !!session,
				error: error?.message
			});
		};

		checkSession();

		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
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
			const { data: { session } } = await supabase.auth.getSession();

			console.log('Reset password - Form submit session check:', {
				hasSession: !!session,
				userId: session?.user?.id,
				userEmail: session?.user?.email
			});

			if (!session) {
				throw new Error("No active session. Please click the reset link from your email again.");
			}

			console.log('Reset password - Attempting to update password...');
			const { error } = await supabase.auth.updateUser({
				password: password,
			});

			if (error) {
				console.error('Reset password - Update error:', error);
				throw error;
			}

			console.log('Reset password - Password updated successfully');

			setSuccess(true);
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