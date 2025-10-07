import { ArrowRight, Loader2, Mail } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ForgotPasswordSimple: React.FC = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleSendReset = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			// Use Supabase's built-in password reset
			// BUT we'll modify the redirect URL to prevent auto-login
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password-manual`,
			});

			if (error) throw error;

			setSuccess(true);
		} catch (err: any) {
			setError(err.message || "Failed to send reset email");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
				<div className="text-center mb-8">
					<h1 className="text-2xl text-gray-800 font-bold tracking-tight leading-none mb-4">
						Interpret<span className="text-gray-600">Reflect</span>
					</h1>
					<h2 className="text-2xl font-bold text-gray-900">
						Reset Password
					</h2>
					<p className="text-gray-600 mt-2">
						Enter your email to receive reset instructions
					</p>
				</div>

				{success ? (
					<div className="text-center py-8">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
							<Mail className="w-8 h-8 text-green-600" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							Check Your Email!
						</h3>
						<p className="text-gray-600 mb-4">
							We've sent password reset instructions to {email}
						</p>
						<p className="text-sm text-gray-500">
							Click the link in the email to reset your password.
							Make sure to check your spam folder.
						</p>
						<button
							onClick={() => navigate("/")}
							className="mt-6 text-green-700 hover:underline font-medium"
						>
							Back to Sign In
						</button>
					</div>
				) : (
					<form onSubmit={handleSendReset}>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email Address
								</label>
								<input
									type="email"
									autoComplete="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Enter your email"
									className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
									style={{
										"--tw-ring-color": "#2D5F3F",
									} as React.CSSProperties}
									required
								/>
							</div>

							<button
								type="submit"
								disabled={loading || !email}
								className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
								style={{
									background: loading ? "#9CA3AF" : "#2D5F3F",
								}}
							>
								{loading ? (
									<>
										<Loader2 className="w-5 h-5 animate-spin" />
										Sending...
									</>
								) : (
									<>
										Send Reset Email
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

				<p className="mt-6 text-center text-sm text-gray-600">
					Remember your password?{" "}
					<button
						onClick={() => navigate("/")}
						className="text-green-700 hover:underline font-medium"
					>
						Back to Sign In
					</button>
				</p>
			</div>
		</div>
	);
};

export default ForgotPasswordSimple;