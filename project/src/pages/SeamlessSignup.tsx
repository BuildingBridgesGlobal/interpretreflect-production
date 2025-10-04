import {
	CardElement,
	Elements,
	useElements,
	useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
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

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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

// Payment form component
const PaymentForm: React.FC<{
	plan: string;
	email: string;
	name: string;
	password: string;
	userId?: string;
	isGoogleSSO?: boolean;
	onSuccess: () => void;
	onBack: () => void;
}> = ({ plan, email, name, password, userId, isGoogleSSO, onSuccess, onBack }) => {
	const stripe = useStripe();
	const elements = useElements();
	const [error, setError] = useState<string>("");
	const [processing, setProcessing] = useState(false);
	const [cardComplete, setCardComplete] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!stripe || !elements) return;

		setProcessing(true);
		setError("");

		try {
			// Create payment method first
			const cardElement = elements.getElement(CardElement);
			if (!cardElement) {
				throw new Error("Card element not found");
			}

			const { error: pmError, paymentMethod } =
				await stripe.createPaymentMethod({
					type: "card",
					card: cardElement,
					billing_details: {
						email,
						name,
					},
				});

			if (pmError) {
				throw pmError;
			}

			// For now, simulate successful payment (in production, you'd verify with Stripe)
			console.log("Payment method created:", paymentMethod.id);

			// If user already exists (Google SSO), just update their subscription status
			if (isGoogleSSO && userId) {
				// Update user metadata with payment info
				const { error: updateError } = await supabase.auth.updateUser({
					data: {
						stripe_payment_method_id: paymentMethod.id,
						subscription_plan: plan,
						subscription_status: 'active',
					},
				});

				if (updateError) {
					throw new Error(`Failed to update subscription: ${updateError.message}`);
				}

				// Create subscription record in database
				const { error: subError } = await supabase
					.from('subscriptions')
					.insert({
						user_id: userId,
						status: 'active',
						plan: plan,
						stripe_payment_method_id: paymentMethod.id,
					});

				if (subError) {
					console.error('Failed to create subscription record:', subError);
				}
			} else {
				// Email signup - create the account after successful payment
				const { data: signupData, error: signupError } =
					await supabase.auth.signUp({
						email: email.toLowerCase().trim(),
						password: password, // Use the password passed from step 1
						options: {
							data: {
								full_name: name,
								stripe_payment_method_id: paymentMethod.id,
								subscription_plan: plan,
								subscription_status: 'active',
							},
						},
					});

				if (signupError) {
					throw new Error(`Failed to create account: ${signupError.message}`);
				}

				// Sign them in immediately
				if (signupData?.user) {
					const { error: signInError } = await supabase.auth.signInWithPassword({
						email: email.toLowerCase().trim(),
						password: password,
					});

					if (signInError) {
						console.error("Could not auto sign in:", signInError);
					}

					// Create subscription record
					const { error: subError } = await supabase
						.from('subscriptions')
						.insert({
							user_id: signupData.user.id,
							status: 'active',
							plan: plan,
							stripe_payment_method_id: paymentMethod.id,
						});

					if (subError) {
						console.error('Failed to create subscription record:', subError);
					}
				}
			}

			// Track successful conversion
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

			onSuccess();
		} catch (err: any) {
			setError(err.message || "Payment failed. Please try again.");
			setProcessing(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Card Information
				</label>
				<div
					className="p-4 border rounded-lg focus-within:ring-2 focus-within:border-transparent transition-all"
					style={
						{ "--tw-ring-color": "#2D5F3F" } as React.CSSProperties
					}
				>
					<CardElement
						options={{
							style: {
								base: {
									fontSize: "16px",
									color: "#424770",
									"::placeholder": {
										color: "#aab7c4",
									},
								},
								invalid: {
									color: "#9e2146",
								},
							},
						}}
						onChange={(e) => setCardComplete(e.complete)}
					/>
				</div>
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
					disabled={!stripe || processing || !cardComplete}
					className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					style={{
						background:
							processing || !cardComplete
								? "#ccc"
								: "linear-gradient(135deg, #2D5F3F, rgb(107, 142, 94))",
					}}
				>
					{processing ? (
						<>
							<Loader2 className="w-5 h-5 animate-spin" />
							Processing...
						</>
					) : (
						<>
							Complete Sign Up
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
				console.log('User detected:', user.email, 'Step param:', step, 'SSO param:', sso);

				// Check if user already has a subscription
				try {
					const { data: subscriptions } = await supabase
						.from('subscriptions')
						.select('status')
						.eq('user_id', user.id)
						.eq('status', 'active')
						.limit(1);

					if (subscriptions && subscriptions.length > 0) {
						console.log('Active subscription found, redirecting to dashboard');
						navigate('/dashboard');
						return;
					}
				} catch (error) {
					console.error('Error checking subscription:', error);
					// Continue to payment if check fails
				}

				// New Google SSO user needs to pay
				if (step === 'payment' && sso === 'google') {
					console.log('Setting current step to 3 for Google SSO payment');
					setCurrentStep(3);
					setFormData(prev => ({
						...prev,
						email: user.email || '',
						name: user.user_metadata?.full_name || user.user_metadata?.name || '',
					}));
				} else if (currentStep === 1 && user) {
					// Regular logged in user without subscription - skip to plan selection
					console.log('Logged in user, skipping to step 2');
					setCurrentStep(2);
				}
			}
		};

		checkSubscriptionAndRedirect();
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
						{/* Debug info - ALWAYS SHOW */}
						<div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-sm">
							<p><strong>Debug Info:</strong></p>
							<p>Current Step: {currentStep}</p>
							<p>User: {user ? user.email : 'Not logged in'}</p>
							<p>URL: {window.location.search}</p>
							<p>Form Data Email: {formData.email}</p>
							<p>Form Data Name: {formData.name}</p>
						</div>

						{/* Step 1: Account Creation */}
						{currentStep === 1 && !user && (
							<div className="space-y-6">
								<h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
									Create Your Account
								</h2>

								{/* SSO Buttons */}
								<div className="space-y-3">
									<button
										onClick={() => handleSSO("google")}
										disabled={loading}
										className="w-full flex items-center justify-center gap-3 px-4 py-3 text-white border-2 rounded-xl transition-all font-medium disabled:opacity-50"
										style={{
											backgroundColor: "#2D5F3F",
											borderColor: "#2D5F3F",
										}}
									>
										<svg className="w-5 h-5" viewBox="0 0 24 24">
											<path
												fill="#4285F4"
												d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
											/>
											<path
												fill="#34A853"
												d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
											/>
											<path
												fill="#FBBC05"
												d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
											/>
											<path
												fill="#EA4335"
												d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
											/>
										</svg>
										Continue with Google
									</button>
								</div>

								<div className="relative my-6">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-t border-gray-200" />
									</div>
									<div className="relative flex justify-center text-sm">
										<span className="px-4 bg-white text-gray-500">
											or continue with email
										</span>
									</div>
								</div>

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

								<Elements stripe={stripePromise}>
									<PaymentForm
										plan={formData.plan}
										email={formData.email || user?.email || ""}
										name={formData.name || user?.user_metadata?.full_name || ""}
										password={formData.password}
										userId={user?.id}
										isGoogleSSO={!!user && !formData.password}
										onSuccess={handleSuccess}
										onBack={handleBack}
									/>
								</Elements>
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
