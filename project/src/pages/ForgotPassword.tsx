import { ArrowRight, Loader2, Mail } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword: React.FC = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleSendCode = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			// Call the edge function to send reset code
			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reset-code`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
					},
					body: JSON.stringify({ email }),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to send reset code");
			}

			setSuccess(true);
			// Store email for the next step
			localStorage.setItem("resetEmail", email);

			// Redirect to code entry page after 2 seconds
			setTimeout(() => {
				navigate("/enter-reset-code");
			}, 2000);
		} catch (err: any) {
			setError(err.message || "Failed to send reset code");
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
						Forgot Password?
					</h2>
					<p className="text-gray-600 mt-2">
						Enter your email to receive a reset code
					</p>
				</div>

				{success ? (
					// Success state
					<div className="text-center py-8">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
							<Mail className="w-8 h-8 text-green-600" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							Code Sent!
						</h3>
						<p className="text-gray-600">
							Check your email for the reset code.
						</p>
						<p className="text-sm text-gray-500 mt-2">
							Redirecting to code entry...
						</p>
					</div>
				) : (
					<form onSubmit={handleSendCode}>
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
									style={
										{
											"--tw-ring-color": "#2D5F3F",
										} as React.CSSProperties
									}
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
										Sending Code...
									</>
								) : (
									<>
										Send Reset Code
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

				{/* Back to login link */}
				<p className="mt-6 text-center text-sm text-gray-600">
					Remember your password?{" "}
					<button
						onClick={() => navigate("/")}
						className="text-green-700 hover:underline font-medium"
					>
						Back to Sign In
					</button>
				</p>

				{/* Help text */}
				<p className="mt-4 text-xs text-center text-gray-500">
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

export default ForgotPassword;