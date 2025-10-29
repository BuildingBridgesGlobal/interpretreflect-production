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
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";
import { validatePassword, validateEmail, validateName } from "../utils/validation";

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
									index + 1 < currentStep ? "#5C7F4F" : undefined,
								borderColor:
									index + 1 === currentStep ? "#5C7F4F" : undefined,
								color:
									index + 1 === currentStep ? "#5C7F4F" : undefined,
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
									index + 1 < currentStep ? "#5C7F4F" : undefined,
							}}
						/>
					)}
				</div>
			))}
		</div>
	);
};

export const SeamlessSignup: React.FC = () => {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		name: "",
		plan: "essential",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	const steps = ["Account", "Plan", "Payment"];

	// Validate current step
	const validateStep = (step: number): boolean => {
		switch (step) {
			case 1:
				return !!(
					formData.email &&
					formData.password &&
					formData.confirmPassword &&
					formData.name &&
					formData.password === formData.confirmPassword
				);
			case 2:
				return !!formData.plan;
			default:
				return true;
		}
	};

	// Handle next step
	const handleNext = () => {
		if (!validateStep(currentStep)) {
			setError("Please fill in all required fields correctly");
			return;
		}

		// Step 1 validation
		if (currentStep === 1) {
			const nameValidation = validateName(formData.name);
			if (!nameValidation.valid) {
				setError(nameValidation.error || "Invalid name");
				return;
			}

			const emailValidation = validateEmail(formData.email);
			if (!emailValidation.valid) {
				setError(emailValidation.error || "Invalid email");
				return;
			}

			const passwordValidation = validatePassword(formData.password);
			if (!passwordValidation.valid) {
				setError(passwordValidation.error || "Invalid password");
				return;
			}

			if (formData.password !== formData.confirmPassword) {
				setError("Passwords do not match");
				return;
			}
		}

		setError("");
		setCurrentStep(currentStep + 1);
	};

	// Handle back
	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
			setError("");
		}
	};

	// Handle payment submission - ONLY creates Stripe checkout, NO user creation
	const handlePayment = async () => {
		console.log("🚀 PAYMENT FLOW STARTED");
		console.log("📋 Form Data:", {
			email: formData.email,
			name: formData.name,
			plan: formData.plan,
		});

		setLoading(true);
		setError("");

		try {
			// Get Stripe price ID
			const STRIPE_PRICE_ID =
				import.meta.env.VITE_STRIPE_PRICE_ID_ESSENTIAL ||
				"price_1S37dPIouyG60O9hzikj2c9h";

			console.log("💳 Creating Stripe checkout session...");
			console.log("📦 Sending to create-checkout-session:", {
				priceId: STRIPE_PRICE_ID,
				email: formData.email,
				metadata: {
					full_name: formData.name,
					password: formData.password, // Webhook will use this to create auth user
					plan: formData.plan,
				},
			});

			// Call Supabase Edge Function to create checkout session
			const { data, error: functionError } = await supabase.functions.invoke(
				"create-checkout-session",
				{
					body: {
						priceId: STRIPE_PRICE_ID,
						email: formData.email.toLowerCase().trim(),
						metadata: {
							full_name: formData.name,
							password: formData.password, // Pass password to webhook
							plan: formData.plan,
						},
					},
				}
			);

			console.log("📥 Response from create-checkout-session:", data);

			if (functionError) {
				console.error("❌ Function error:", functionError);
				throw new Error(`Failed to create checkout: ${functionError.message}`);
			}

			if (data?.error) {
				console.error("❌ Stripe error:", data.error);
				throw new Error(`Stripe error: ${data.error}`);
			}

			const checkoutUrl = data?.url || data?.data?.url;

			if (!checkoutUrl) {
				console.error("❌ No checkout URL in response:", data);
				throw new Error("Failed to create checkout session - no URL returned");
			}

			console.log("✅ Checkout URL received:", checkoutUrl);
			console.log("🔄 Redirecting to Stripe...");

			// Store email for login after payment
			localStorage.setItem("signup_email", formData.email);
			localStorage.setItem("signup_plan", formData.plan);

			// Redirect to Stripe checkout
			window.location.href = checkoutUrl;
		} catch (err: any) {
			console.error("❌ Payment flow error:", err);
			setError(err.message || "Failed to start payment. Please try again.");
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
			{/* Back to Landing Button */}
			<div className="absolute top-6 left-6 z-10">
				<button
					type="button"
					onClick={() => navigate("/")}
					className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-md transition-all font-medium"
					style={{ backgroundColor: "#5C7F4F" }}
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
						{/* Step 1: Account Info */}
						{currentStep === 1 && (
							<div className="space-y-6">
								<h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
									Create Your Account
								</h2>

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
												"--tw-ring-color": "#5C7F4F",
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
												"--tw-ring-color": "#5C7F4F",
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
												"--tw-ring-color": "#5C7F4F",
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
											<p className="text-gray-500">Minimum 6 characters</p>
										)}
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Confirm Password
									</label>
									<input
										type="password"
										value={formData.confirmPassword || ""}
										onChange={(e) => {
											setFormData({
												...formData,
												confirmPassword: e.target.value,
											});
											if (error) setError("");
										}}
										onBlur={() =>
											setTouched({ ...touched, confirmPassword: true })
										}
										className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all ${
											touched.confirmPassword &&
											formData.password !== formData.confirmPassword
												? "border-red-500"
												: "border-gray-300"
										}`}
										style={
											{
												"--tw-ring-color": "#5C7F4F",
											} as React.CSSProperties
										}
										placeholder="••••••••"
										required
									/>
									{touched.confirmPassword &&
										formData.confirmPassword &&
										formData.password !== formData.confirmPassword && (
											<p className="mt-1 text-xs text-red-600">
												Passwords do not match
											</p>
										)}
									{touched.confirmPassword &&
										formData.password === formData.confirmPassword &&
										formData.confirmPassword && (
											<p className="mt-1 text-xs text-green-600 flex items-center gap-1">
												<Check className="w-4 h-4" />
												Passwords match
											</p>
										)}
								</div>

								{error && (
									<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
										<p className="text-sm text-red-700">{error}</p>
									</div>
								)}

								<button
									onClick={handleNext}
									disabled={!validateStep(1)}
									className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
									style={{
										background: !validateStep(1)
											? "#ccc"
											: "linear-gradient(135deg, #5C7F4F, rgb(107, 142, 94))",
									}}
								>
									Continue
									<ArrowRight className="w-5 h-5" />
								</button>
							</div>
						)}

						{/* Step 2: Plan Selection */}
						{currentStep === 2 && (
							<div className="space-y-6">
								<h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
									Choose Your Plan
								</h2>

								<div className="space-y-4">
									{/* Essential Plan */}
									<div
										onClick={() => setFormData({ ...formData, plan: "essential" })}
										className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
											formData.plan === "essential"
												? "bg-green-50"
												: "hover:border-gray-300"
										}`}
										style={{
											borderColor:
												formData.plan === "essential" ? "#5C7F4F" : undefined,
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
													style={{ color: "#5C7F4F" }}
												>
													$12.99
												</p>
												<p className="text-sm text-gray-500">per month</p>
											</div>
										</div>
										<ul className="space-y-2">
											<li className="flex items-center gap-2 text-sm">
												<Check className="w-4 h-4" style={{ color: "#5C7F4F" }} />
												<span className="text-black">All wellness exercises</span>
											</li>
											<li className="flex items-center gap-2 text-sm">
												<Check className="w-4 h-4" style={{ color: "#5C7F4F" }} />
												<span className="text-black">Elya AI companion included</span>
											</li>
											<li className="flex items-center gap-2 text-sm">
												<Check className="w-4 h-4" style={{ color: "#5C7F4F" }} />
												<span className="text-black">Progress tracking</span>
											</li>
											<li className="flex items-center gap-2 text-sm">
												<Check className="w-4 h-4" style={{ color: "#5C7F4F" }} />
												<span className="text-black">Mobile & desktop access</span>
											</li>
										</ul>
									</div>
								</div>

								{error && (
									<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
										<p className="text-sm text-red-700">{error}</p>
									</div>
								)}

								<div className="flex gap-3 pt-4">
									<button
										onClick={handleBack}
										className="px-6 py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2"
										style={{
											background:
												"linear-gradient(135deg, #5C7F4F, rgb(107, 142, 94))",
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
												: "linear-gradient(135deg, #5C7F4F, rgb(107, 142, 94))",
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
												style={{ color: "#5C7F4F" }}
											>
												$12.99/month
											</span>
										</div>
									</div>
								</div>

								{/* Info Box */}
								<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
									<p className="text-sm text-blue-800">
										You'll be redirected to Stripe's secure checkout page to complete
										your payment. After payment, you can log in with the email and
										password you created.
									</p>
								</div>

								{/* Security badges */}
								<div className="flex items-center justify-center gap-4 py-4 bg-gray-50 rounded-lg">
									<div className="flex items-center gap-1 text-sm text-gray-600">
										<Shield className="w-4 h-4" style={{ color: "#5C7F4F" }} />
										<span>SSL Secured</span>
									</div>
									<div className="flex items-center gap-1 text-sm text-gray-600">
										<Lock className="w-4 h-4" style={{ color: "#5C7F4F" }} />
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
										onClick={handleBack}
										disabled={loading}
										className="px-6 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
										style={{
											background: loading
												? "#ccc"
												: "linear-gradient(135deg, #5C7F4F, rgb(107, 142, 94))",
										}}
									>
										<ArrowLeft className="w-5 h-5" />
										Back
									</button>

									<button
										type="button"
										onClick={handlePayment}
										disabled={loading}
										className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
										style={{
											background: loading
												? "#ccc"
												: "linear-gradient(135deg, #5C7F4F, rgb(107, 142, 94))",
										}}
									>
										{loading ? (
											<>
												<Loader2 className="w-5 h-5 animate-spin" />
												Creating checkout...
											</>
										) : (
											<>
												Continue to Payment
												<ArrowRight className="w-5 h-5" />
											</>
										)}
									</button>
								</div>
							</div>
						)}
					</div>

					{/* Trust badges */}
					<div className="mt-8 flex justify-center items-center gap-6 text-xs text-gray-500">
						<div className="flex items-center gap-1">
							<Lock className="w-4 h-4" style={{ color: "#5C7F4F" }} />
							<span>256-bit Encryption</span>
						</div>
						<div className="flex items-center gap-1">
							<CheckCircle className="w-4 h-4" style={{ color: "#5C7F4F" }} />
							<span>Cancel Anytime</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
