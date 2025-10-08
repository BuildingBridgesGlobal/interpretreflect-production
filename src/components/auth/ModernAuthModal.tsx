import { ArrowRight, Loader2, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

interface ModernAuthModalProps {
	isOpen: boolean;
	onClose: () => void;
	defaultMode?: "signin" | "signup";
	onSuccess?: () => void;
}

export const ModernAuthModal: React.FC<ModernAuthModalProps> = ({
	isOpen,
	onClose,
	defaultMode = "signin",
	onSuccess,
}) => {
	const navigate = useNavigate();
	const { signIn } = useAuth();
	const [mode, setMode] = useState<"signin" | "signup">(
		defaultMode,
	);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

	useEffect(() => {
		if (!isOpen) {
			// Reset form when modal closes
			setEmail("");
			setPassword("");
			setName("");
			setError("");
			setValidationErrors({});
			setMode(defaultMode);
		}
	}, [isOpen, defaultMode]);

	const validateEmail = (email: string) => {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	};

	const handleSignIn = async () => {
		setError("");
		setValidationErrors({});

		// Validate fields
		const errors: Record<string, string> = {};
		if (!email) errors.email = "Email is required";
		else if (!validateEmail(email)) errors.email = "Please enter a valid email";
		if (!password) errors.password = "Password is required";

		if (Object.keys(errors).length > 0) {
			setValidationErrors(errors);
			return;
		}

		setLoading(true);
		try {
			const result = await signIn(email, password);

			if (result.error) {
				throw result.error;
			}

			// Success - close modal and navigate
			onClose();
			if (onSuccess) onSuccess();
			navigate("/");
		} catch (err: any) {
			setError(err.message || "Invalid email or password");
		} finally {
			setLoading(false);
		}
	};


	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
					{/* Close button */}
					<button
						onClick={onClose}
						className="absolute top-4 right-4 p-2 rounded-lg transition-all"
						style={{
							background: "#5C7F4F",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "#6B8E5E";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "#5C7F4F";
						}}
						aria-label="Close modal"
					>
						<X className="w-6 h-6 text-white" />
					</button>

					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-2xl text-gray-800 font-bold tracking-tight leading-none mb-4">
							Interpret<span className="text-gray-600">Reflect</span>
						</h1>
						<h2 className="text-2xl font-bold text-gray-900">
							Welcome back
						</h2>
						<p className="text-gray-600 mt-2">
							Sign in to continue your wellness journey
						</p>
					</div>

					<>
							{/* Sign In Form */}
							<form
								onSubmit={(e) => {
									e.preventDefault();
									handleSignIn();
								}}
							>
								<div className="space-y-4">
									<div>
										<input
											type="email"
											value={email}
											onChange={(e) => {
												setEmail(e.target.value);
												setValidationErrors({});
											}}
											placeholder="Email address"
											className={`mobile-input w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
												validationErrors.email
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
										{validationErrors.email && (
											<p className="text-sm text-red-500 mt-1">
												{validationErrors.email}
											</p>
										)}
									</div>

									<div>
										<input
											type="password"
											value={password}
											onChange={(e) => {
												setPassword(e.target.value);
												setValidationErrors({});
											}}
											placeholder="Password"
											className={`mobile-input w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
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

									<button
										type="submit"
										disabled={loading}
										className="mobile-button w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
										style={{
											background: loading ? "#9CA3AF" : "#5C7F4F",
										}}
									>
										{loading ? (
											<>
												<Loader2 className="w-5 h-5 animate-spin" />
												Signing in...
											</>
										) : (
											<>
												Sign In
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

							{/* Switch to Sign Up */}
							<div className="mt-6 text-center">
								<p className="text-sm text-gray-600">
									Don't have an account?
									<button
										onClick={() => navigate("/signup")}
										className="ml-2 px-3 py-1 bg-white border rounded-md font-semibold transition-all"
										style={{
											borderColor: "#5C7F4F",
											color: "#5C7F4F",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = "#F5F5DC";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = "white";
										}}
									>
										Sign up
									</button>
								</p>
							</div>

							{/* Terms notice */}
							<p className="mt-4 text-xs text-center text-gray-500">
								By continuing, you agree to our{" "}
								<a
									href="/terms"
									className="underline hover:text-gray-700"
									target="_blank"
								>
									Terms of Service
								</a>{" "}
								and{" "}
								<a
									href="/privacy"
									className="underline hover:text-gray-700"
									target="_blank"
								>
									Privacy Policy
								</a>
							</p>
						</>
				</div>
			</div>
		</div>
	);
};