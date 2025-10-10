import { Loader2, Mail, ArrowRight } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

const ForgotPassword: React.FC = () => {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage("");
		setError("");
		setLoading(true);
		try {
			const redirectTo = `${window.location.origin}/reset-password`;
			const { error: resetError } = await supabase.auth.resetPasswordForEmail(
				email.trim(),
				{ redirectTo }
			);
			if (resetError) throw resetError;
			setMessage(
				"If an account exists for that email, you'll receive a reset link shortly."
			);
		} catch (err: any) {
			setMessage(
				"If an account exists for that email, you'll receive a reset link shortly."
			);
			// Intentionally generic to prevent account enumeration
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
					<h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
					<p className="text-gray-600 mt-2">
						Enter your email to receive a password reset link.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<div className="relative">
							<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#5C7F4F" }} />
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
								style={{ borderColor: "#E8E5E0", backgroundColor: "#FFFFFF" }}
								placeholder="you@example.com"
								required
								aria-label="Email address"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading || !email}
						className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ background: loading ? "#9CA3AF" : "#5C7F4F" }}
					>
						{loading ? (
							<>
								<Loader2 className="w-5 h-5 animate-spin" />
								Sending reset link...
							</>
						) : (
							<>
								Send Reset Link
								<ArrowRight className="w-5 h-5" />
							</>
						)}
					</button>
				</form>

				{message && (
					<div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm" role="status" aria-live="polite">
						{message}
					</div>
				)}
				{error && (
					<div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
						{error}
					</div>
				)}

				<p className="mt-6 text-xs text-center text-gray-500">
					Remembered your password? {" "}
					<a href="/" className="underline hover:text-gray-700">Return to Sign In</a>
				</p>
			</div>
		</div>
	);
};

export default ForgotPassword;

