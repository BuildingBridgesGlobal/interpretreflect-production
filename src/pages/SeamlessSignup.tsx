import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	Check,
	CheckCircle,
	Loader2,
	Lock,
	Mail,
	Shield,
	User,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ModernAuthModal } from "../components/auth/ModernAuthModal";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { analytics } from "../utils/analytics";

// Step indicator component
const StepIndicator: React.FC<{ currentStep: number; steps: string[] }> = ({
	currentStep,
	steps,
}) => {
	return (
		<div className="flex items-center justify-center mb-8">
			{steps.map((step, index) => (
				<div key={index} className="flex items-center">
					<div className="relative">
						<div
							className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
								index + 1 < currentStep
									? "bg-green-600 text-white"
									: index + 1 === currentStep
										? "bg-white text-green-600 border-2"
										: "bg-gray-200 text-gray-500"
							}`}
							style={{
								backgroundColor:
									index + 1 < currentStep ? "#2D5F3F" : undefined,
								borderColor:
									index + 1 === currentStep ? "#2D5F3F" : undefined,
								color:
									index + 1 === currentStep ? "#2D5F3F" : undefined,
							}}
						>
							{index + 1 < currentStep ? (
								<Check className="w-5 h-5" />
							) : (
								index + 1
							)}
						</div>
						<span
							className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap ${
								index + 1 === currentStep
									? "text-gray-900 font-semibold"
									: "text-gray-500"
							}`}
						>
							{step}
						</span>
					</div>
					{index < steps.length - 1 && (
						<div
							className={`w-20 h-1 mx-2 transition-all ${
								index + 1 < currentStep ? "bg-green-600" : "bg-gray-200"
							}`}
							style={{
								backgroundColor:
									index + 1 < currentStep ? "#2D5F3F" : undefined,
							}}
						/>
					)}
				</div>
			))}
		</div>
	);
};

// Payment form component - Now uses Stripe Checkout (hosted payment page)
const PaymentForm: React.FC<{
	plan: string;
	email: string;
	name: string;
	password: string;
	userId?: string;
	onSuccess: () => void;
	onBack: () => void;
}> = ({ plan, email, name, password, userId, onSuccess, onBack }) => {
	const [error, setError] = useState<string>("");
	const [processing, setProcessing] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setProcessing(true);
		setError("");

		try {
			// First, create the user account
			let finalUserId = userId;

			if (!finalUserId) {
				const { data: signupData, error: signupError } =
					await supabase.auth.signUp({
						email: email.toLowerCase().trim(),
						password: password,
						options: {
							data: {
								full_name: name,
								subscription_plan: plan,
							},
						},
					});

				if (signupError) {
					throw new Error(`Failed to create account: ${signupError.message}`);
				}

				if (!signupData?.user) {
					throw new Error("Failed to create account");
				}

				finalUserId = signupData.user.id;

				// Sign them in immediately
				const { error: signInError } = await supabase.auth.signInWithPassword({
					email: email.toLowerCase().trim(),
					password: password,
				});

				if (signInError) {
					console.error("Could not auto sign in:", signInError);
				}
			}

			// Get the Stripe Price ID for the selected plan
			const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID_ESSENTIAL || 'price_1234'; // Replace with your actual price ID

			// Call the Supabase Edge Function to create a Stripe Checkout session
			const { data, error: functionError } = await supabase.functions.invoke(
				'create-checkout-session',
				{
					body: {
						priceId: STRIPE_PRICE_ID,
						email: email,
						userId: finalUserId,
						metadata: {
							plan: plan,
							full_name: name,
						},
					},
				}
			);

			if (functionError) {
				throw new Error(`Payment setup failed: ${functionError.message}`);
			}

			if (!data?.url) {
				throw new Error("Failed to create checkout session");
			}

			// Track checkout initiation
			if (analytics.trackSubscriptionSuccess) {
				analytics.trackSubscriptionSuccess(plan, 12.99);
			}

			// Set privacy consent to prevent modal from appearing
			const consentData = {
				timestamp: Date.now(),
				version: "1.0",
				gdpr: true,
				hipaa: true,
				fromSignup: true,
			};
			localStorage.setItem("privacyConsent", JSON.stringify(consentData));

			// Redirect to Stripe Checkout
			window.location.href = data.url;

		} catch (err: any) {
			setError(err.message || "Payment failed. Please try again.");
			setProcessing(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Info Box */}
			<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
				<p className="text-sm text-blue-800">
					You'll be redirected to Stripe's secure checkout page to complete your payment.
				</p>
			</div>

			{/* Security badges */}
			<div className="flex items-center justify-center gap-4 py-4 bg-gray-50 rounded-lg">
				<div className="flex items-center gap-1 text-sm text-gray-600">
					<Shield className="w-4 h-4" style={{ color: "#2D5F3F" }} />
					<span>SSL Secured</span>
				</div>
				<div className="flex items-center gap-1 text-sm text-gray-600">
					<Lock className="w-4 h-4" style={{ color: "#2D5F3F" }} />
					<span>PCI Compliant</span>
				</div>
			</div>

			{error && (
				<div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
					<AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
					<p className="text-sm text-red-700">{error}</p>
				</div>
			)}

			<div className="flex gap-3">
				<button
					type="button"
					onClick={onBack}
					disabled={processing}
					className="px-6 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					style={{
						background: processing
							? "#ccc"
							: "linear-gradient(135deg, #2D5F3F, rgb(107, 142, 94))",
					}}
				>
					<ArrowLeft className="w-5 h-5" />
					Back
				</button>

				<button
					type="submit"
					disabled={processing}
					className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					style={{
						background:
							processing
								? "#ccc"
								: "linear-gradient(135deg, #2D5F3F, rgb(107, 142, 94))",
					}}
				>
					{processing ? (
						<>
							<Loader2 className="w-5 h-5 animate-spin" />
							Creating account...
						</>
					) : (
						<>
							Continue to Payment
							<ArrowRight className="w-5 h-5" />
						</>
					)}
				</button>
			</div>
		</form>
	);
};

export const SeamlessSignup: React.FC = () => {
	const navigate = useNavigate();
	const { user, signInWithGoogle, signInWithApple } = useAuth();
	const [currentStep, setCurrentStep] = useState(1);
	const [showSignInModal, setShowSignInModal] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		name: "",
		plan: "essential",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	const steps = ["Account", "Plan", "Payment"];

	// Check URL params for SSO and payment step
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const step = params.get('step');
		const sso = params.get('sso');

		const checkSubscriptionAndRedirect = async () => {
			if (user) {
				// Check if user already has a subscription
				const { data: profile } = await supabase
					.from('profiles')
					.select('subscription_status, subscription_tier')
					.eq('id', user.id)
					.single();

				if (profile?.subscription_status === 'active') {
					// User already has subscription - go to dashboard
					navigate('/dashboard');
					return;
				}

				// New Google SSO user needs to pay
				if (step === 'payment' && sso === 'google') {
					setCurrentStep(3);
					setFormData(prev => ({
						...prev,
						email: user.email || '',
						name: user.user_metadata?.full_name || user.user_metadata?.name || '',
					}));
				} else if (currentStep === 1) {
					// Regular logged in user without subscription
					setCurrentStep(2);
				}
			}
		};

		checkSubscriptionAndRedirect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, navigate]);

	const validateStep = (step: number): boolean => {
		switch (step) {
			case 1:
				return !!(formData.email && formData.password && formData.name);
			case 2:
				return !!formData.plan;
			default:
				return true;
		}
	};

	const handleNext = async () => {
		if (!validateStep(currentStep)) {
			setError("Please fill in all required fields");
			return;
		}

		if (currentStep === 1 && !user) {
			// Validate before proceeding (but DON'T create account yet)
			if (formData.password.length < 6) {
				setError("Password must be at least 6 characters long");
				return;
			}

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				setError("Please enter a valid email address");
				return;
			}

			setLoading(true);
			setError("");

			try {
				// Check if email is already registered
				const { data: existingUser } = await supabase.auth.signInWithPassword({
					email: formData.email.toLowerCase().trim(),
					password: "dummy_check_only", // This will fail but tells us if email exists
				});

				// If we somehow signed in, the user exists
				if (existingUser?.user) {
					setError("This email is already registered. Please sign in instead.");
					setLoading(false);
					return;
				}
			} catch (err: any) {
				// Expected to fail - we're just checking if email exists
				if (err.message && err.message.includes("Invalid login credentials")) {
					// Email might exist but wrong password - that's fine, we'll handle it later
				}
			}

			// Just validate and store data, DON'T create account yet
			// Account will be created AFTER successful payment
			setLoading(false);
			setCurrentStep(2);
		} else {
			setCurrentStep(currentStep + 1);
			setError("");
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
			setError("");
		}
	};

	const handleSuccess = () => {
		navigate("/payment-success");
	};

	const handleSSO = async (provider: "google" | "apple") => {
		setLoading(true);
		try {
			if (provider === "google") {
				await signInWithGoogle();
			} else {
				await signInWithApple();
			}
			setCurrentStep(2);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
			{/* Global style to remove purple focus rings */}
			<style>{`
        input[type="radio"]:focus {
          outline: none !important;
          box-shadow: none !important;
          border-color: transparent !important;
        }
        .sr-only:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        input:focus-visible {
          outline-color: #2D5F3F !important;
        }
      `}</style>
			{/* Back to Landing Button */}
			<div className="absolute top-6 left-6 z-10">
				<button
					onClick={() => navigate("/")}
					className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-md transition-all font-medium"
					style={{ backgroundColor: "#2D5F3F" }}
				>
					<ArrowLeft className="w-5 h-5" />
					<span>Back to Home</span>
				</button>
			</div>

			<div className="container mx-auto px-4 py-12">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">
						Start Your Wellness Journey
					</h1>
					<p className="text-gray-600">
						Join thousands of interpreters transforming their practice
					</p>
				</div>

				{/* Progress Steps */}
				<StepIndicator currentStep={currentStep} steps={steps} />

				{/* Form Container */}
				<div className="max-w-2xl mx-auto mt-12">
					<div className="bg-white rounded-2xl shadow-xl p-8">
						{/* Step 1: Account Creation */}
						{currentStep === 1 && !user && (
							<div className="space-y-6">
								<h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
									Create Your Account
								</h2>

								{/* Email Form */}
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											<User className="w-4 h-4 inline mr-1" />
											Full Name
										</label>
										<input
											type="text"
											value={formData.name}
											onChange={(e) =>
												setFormData({ ...formData, name: e.target.value })
											}
											onBlur={() => setTouched({ ...touched, name: true })}
											className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all"
											style={
												{
													"--tw-ring-color": "#2D5F3F",
												} as React.CSSProperties
											}
											placeholder="John Doe"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											<Mail className="w-4 h-4 inline mr-1" />
											Email Address
										</label>
										<input
											type="email"
											value={formData.email}
											onChange={(e) =>
												setFormData({ ...formData, email: e.target.value })
											}
											onBlur={() => setTouched({ ...touched, email: true })}
											className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all"
											style={
												{
													"--tw-ring-color": "#2D5F3F",
												} as React.CSSProperties
											}
											placeholder="john@example.com"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											<Lock className="w-4 h-4 inline mr-1" />
											Password
										</label>
										<input
											type="password"
											value={formData.password}
											onChange={(e) => {
												setFormData({ ...formData, password: e.target.value });
												// Clear error when user types
												if (error) setError("");
											}}
											onBlur={() => setTouched({ ...touched, password: true })}
											className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all ${
												touched.password && formData.password.length < 6
													? "border-red-500"
													: "border-gray-300"
											}`}
											style={
												{
													"--tw-ring-color": "#2D5F3F",
												} as React.CSSProperties
											}
											placeholder="••••••••"
											required
											minLength={6}
										/>
										<div className="mt-1 text-xs">
											{formData.password.length > 0 &&
											formData.password.length < 6 ? (
												<p className="text-red-600">
													Password must be at least 6 characters
												</p>
											) : (
												<p className="text-gray-500">
													Minimum 6 characters • Avoid common passwords like
													"password123"
												</p>
											)}
										</div>
									</div>
								</div>

								{error && (
									<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
										<p className="text-sm text-red-700">{error}</p>
									</div>
								)}

								<button
									onClick={handleNext}
									disabled={
										loading ||
										!formData.email ||
										!formData.password ||
										!formData.name
									}
									className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
									style={{
										background:
											loading ||
											!formData.email ||
											!formData.password ||
											!formData.name
												? "#ccc"
												: "linear-gradient(135deg, #2D5F3F, rgb(107, 142, 94))",
									}}
								>
									{loading ? (
										<>
											<Loader2 className="w-5 h-5 animate-spin" />
											Creating Account...
										</>
									) : (
										<>
											Continue
											<ArrowRight className="w-5 h-5" />
										</>
									)}
								</button>

								{/* Already have an account link */}
								<div className="text-center mt-6 pt-6 border-t border-gray-200">
									<p className="text-sm text-gray-600">
										Already have an account?{" "}
										<button
											onClick={() => setShowSignInModal(true)}
											className="ml-1 px-3 py-1 text-white rounded-md font-semibold transition-all"
											style={{ background: "#2D5F3F" }}
										>
											Sign In
										</button>
									</p>
								</div>
							</div>
						)}

						{/* Step 2: Choose Plan */}
						{currentStep === 2 && (
							<div className="space-y-6">
								<h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
									Choose Your Plan
								</h2>

								<div className="space-y-4">
									{/* Essential Plan */}
									<div
										onClick={() =>
											setFormData({ ...formData, plan: "essential" })
										}
										className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
											formData.plan === "essential"
												? "bg-green-50"
												: "hover:border-gray-300"
										}`}
										style={{
											borderColor:
												formData.plan === "essential"
													? "#2D5F3F"
													: undefined,
										}}
										role="button"
										tabIndex={0}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												setFormData({ ...formData, plan: "essential" });
											}
										}}
									>
										<div className="flex justify-between items-start mb-4">
											<div>
												<h3 className="text-lg font-bold text-gray-900">
													Essential
												</h3>
												<p className="text-gray-600 text-sm">
													Perfect for individual interpreters
												</p>
											</div>
											<div className="text-right">
												<p
													className="text-2xl font-bold"
													style={{ color: "#2D5F3F" }}
												>
													$12.99
												</p>
												<p className="text-sm text-gray-500">per month</p>
											</div>
										</div>
										<ul className="space-y-2">
											<li className="flex items-center gap-2 text-sm">
												<Check
													className="w-4 h-4"
													style={{ color: "#2D5F3F" }}
												/>
												<span className="text-black">
													All wellness exercises
												</span>
											</li>
											<li className="flex items-center gap-2 text-sm">
												<Check
													className="w-4 h-4"
													style={{ color: "#2D5F3F" }}
												/>
												<span className="text-black">
													Elya AI companion included
												</span>
											</li>
											<li className="flex items-center gap-2 text-sm">
												<Check
													className="w-4 h-4"
													style={{ color: "#2D5F3F" }}
												/>
												<span className="text-black">Progress tracking</span>
											</li>
											<li className="flex items-center gap-2 text-sm">
												<Check
													className="w-4 h-4"
													style={{ color: "#2D5F3F" }}
												/>
												<span className="text-black">
													Mobile & desktop access
												</span>
											</li>
										</ul>
									</div>

									{/* Professional Plan (Coming Soon) */}
									<div className="opacity-50">
										<div className="border-2 border-gray-200 rounded-xl p-6 relative">
											<div className="absolute top-3 right-3">
												<span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
													Coming Soon
												</span>
											</div>
											<div className="flex justify-between items-start mb-4">
												<div>
													<h3 className="text-lg font-bold text-gray-900">
														Professional
													</h3>
													<p className="text-gray-600 text-sm">
														For teams and organizations
													</p>
												</div>
												<div className="text-right">
													<p className="text-2xl font-bold text-gray-700">
														$29.99
													</p>
													<p className="text-sm text-gray-500">per month</p>
												</div>
											</div>
											<ul className="space-y-2">
												<li className="flex items-center gap-2 text-sm text-gray-600">
													<Check className="w-4 h-4 text-gray-400" />
													<span>Everything in Essential</span>
												</li>
												<li className="flex items-center gap-2 text-sm text-gray-600">
													<Check className="w-4 h-4 text-gray-400" />
													<span>Team management</span>
												</li>
												<li className="flex items-center gap-2 text-sm text-gray-600">
													<Check className="w-4 h-4 text-gray-400" />
													<span>Analytics dashboard</span>
												</li>
												<li className="flex items-center gap-2 text-sm text-gray-600">
													<Check className="w-4 h-4 text-gray-400" />
													<span>Priority support</span>
												</li>
											</ul>
										</div>
									</div>
								</div>

								<div className="flex gap-3 pt-4">
									<button
										onClick={handleBack}
										className="px-6 py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2"
										style={{
											background:
												"linear-gradient(135deg, #2D5F3F, rgb(107, 142, 94))",
										}}
									>
										<ArrowLeft className="w-5 h-5" />
										Back
									</button>

									<button
										onClick={handleNext}
										disabled={!formData.plan}
										className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
										style={{
											background: !formData.plan
												? "#ccc"
												: "linear-gradient(135deg, #2D5F3F, rgb(107, 142, 94))",
										}}
									>
										Continue to Payment
										<ArrowRight className="w-5 h-5" />
									</button>
								</div>
							</div>
						)}

						{/* Step 3: Payment */}
						{currentStep === 3 && (
							<div className="space-y-6">
								<h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
									Complete Your Purchase
								</h2>

								{/* Order Summary */}
								<div className="bg-gray-50 rounded-xl p-4 mb-6">
									<h3 className="font-semibold text-gray-900 mb-3">
										Order Summary
									</h3>
									<div className="flex justify-between items-center py-2">
										<span className="text-gray-600">Essential Plan</span>
										<span className="font-semibold">$12.99/month</span>
									</div>
									<div className="border-t pt-2 mt-2">
										<div className="flex justify-between items-center">
											<span className="font-semibold text-gray-900">Total</span>
											<span
												className="font-bold text-lg"
												style={{ color: "#2D5F3F" }}
											>
												$12.99/month
											</span>
										</div>
									</div>
								</div>

								<PaymentForm
									plan={formData.plan}
									email={formData.email || user?.email || ""}
									name={formData.name || user?.user_metadata?.full_name || ""}
									password={formData.password}
									userId={user?.id}
									onSuccess={handleSuccess}
									onBack={handleBack}
								/>
							</div>
						)}
					</div>

					{/* Trust badges */}
					<div className="mt-8 flex justify-center items-center gap-6 text-xs text-gray-500">
						<div className="flex items-center gap-1">
							<Shield
								className="w-4 h-4"
								style={{ color: "#2D5F3F" }}
							/>
							<span>SSL Secured</span>
						</div>
						<div className="flex items-center gap-1">
							<Lock className="w-4 h-4" style={{ color: "#2D5F3F" }} />
							<span>256-bit Encryption</span>
						</div>
						<div className="flex items-center gap-1">
							<CheckCircle
								className="w-4 h-4"
								style={{ color: "#2D5F3F" }}
							/>
							<span>HIPAA Compliant</span>
						</div>
					</div>
				</div>
			</div>

			{/* Sign In Modal */}
			{showSignInModal && (
				<ModernAuthModal
					isOpen={showSignInModal}
					onClose={() => setShowSignInModal(false)}
					defaultMode="signin"
					onSuccess={() => {
						setShowSignInModal(false);
						// If user signs in successfully, skip to plan selection
						setCurrentStep(2);
					}}
				/>
			)}
		</div>
	);
};
