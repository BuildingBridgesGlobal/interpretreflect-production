import { ArrowRight, Check, Loader2, KeyRound } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// Create a separate Supabase client for password reset
const resetSupabase = createClient(
	import.meta.env.VITE_SUPABASE_URL || "",
	import.meta.env.VITE_SUPABASE_ANON_KEY || "",
	{
		auth: {
			persistSession: false,
			autoRefreshToken: false,
			detectSessionInUrl: false,
			storage: undefined,
		}
	}
);

const EnterResetCode: React.FC = () => {
	const navigate = useNavigate();
	const [code, setCode] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [email, setEmail] = useState("");
	const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		// Get email from localStorage
		const storedEmail = localStorage.getItem("resetEmail");
		if (!storedEmail) {
			navigate("/forgot-password");
			return;
		}
		setEmail(storedEmail);
	}, [navigate]);

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

		if (code.length !== 6) {
			errors.code = "Code must be 6 digits";
		}

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
			// Verify the code
			const { data: codeData, error: codeError } = await resetSupabase
				.from("password_reset_codes")
				.select("*")
				.eq("email", email.toLowerCase())
				.eq("code", code)
				.eq("used", false)
				.gt("expires_at", new Date().toISOString())
				.single();

			if (codeError || !codeData) {
				throw new Error("Invalid or expired code");
			}

			// Update the user's password using admin API
			const { error: updateError } = await resetSupabase.auth.admin.updateUserById(
				codeData.user_id,
				{ password: password }
			);

			if (updateError) {
				throw new Error("Failed to update password");
			}

			// Mark code as used
			await resetSupabase
				.from("password_reset_codes")
				.update({ used: true, used_at: new Date().toISOString() })
				.eq("id", codeData.id);

			// Clear stored email
			localStorage.removeItem("resetEmail");

			setSuccess(true);

			// Redirect to login after 3 seconds
			setTimeout(() => {
				window.location.replace("/");
			}, 3000);
		} catch (err: any) {
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
						Reset Your Password
					</h2>
					<p className="text-gray-600 mt-2">
						Enter the code sent to {email}
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
						<p className="text-gray-600 mb-4">
							Your password has been updated.
						</p>
						<div className="flex items-center justify-center gap-2">
							<Loader2 className="w-5 h-5 animate-spin text-gray-600" />
							<p className="text-gray-600">
								Redirecting to sign in...
							</p>
						</div>
					</div>
				) : (
					<form onSubmit={handleResetPassword}>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Reset Code
								</label>
								<div className="relative">
									<KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
									<input
										type="text"
										maxLength={6}
										value={code}
										onChange={(e) => {
											const value = e.target.value.replace(/\D/g, '');
											setCode(value);
											setValidationErrors({});
										}}
										placeholder="Enter 6-digit code"
										className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all text-center text-xl font-mono tracking-widest ${
											validationErrors.code
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
								</div>
								{validationErrors.code && (
									<p className="text-sm text-red-500 mt-1">
										{validationErrors.code}
									</p>
								)}
							</div>

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
								disabled={loading || !code || !password || !confirmPassword}
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

						<p className="mt-4 text-xs text-center text-gray-500">
							Didn't receive the code?{" "}
							<button
								type="button"
								onClick={() => navigate("/forgot-password")}
								className="text-green-700 hover:underline font-medium"
							>
								Request a new one
							</button>
						</p>
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

export default EnterResetCode;