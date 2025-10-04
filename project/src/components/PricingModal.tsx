import {
	AlertCircle,
	ArrowRight,
	CheckCircle,
	Heart,
	Lock,
	Shield,
	Sparkles,
	Users,
	X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

import { useAuth } from "../contexts/AuthContext";

import { AuthModal } from "./AuthModal";

interface PricingModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectPlan: (plan: "essential" | "professional") => void;
	burnoutScore?: number;
	riskLevel?: "low" | "moderate" | "high" | "severe";
}

const PricingModal: React.FC<PricingModalProps> = ({
	isOpen,
	onClose,
	onSelectPlan,
	burnoutScore,
	riskLevel,
}) => {
	const { user } = useAuth();
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);

	if (!isOpen) return null;

	const handleSubscribe = (plan: "essential" | "professional") => {
		if (!user) {
			// User is not logged in, show auth modal
			setAuthMode("signup");
			setShowAuthModal(true);
		} else {
			// User is logged in, show success message for now
			setShowSuccessMessage(true);
			setTimeout(() => {
				setShowSuccessMessage(false);
				onSelectPlan(plan);
			}, 2000);
		}
	};

	const getRiskColor = (level?: string) => {
		switch (level) {
			case "low":
				return "text-green-600";
			case "moderate":
				return "text-yellow-600";
			case "high":
				return "text-orange-600";
			case "severe":
				return "text-red-600";
			default:
				return "text-gray-600";
		}
	};

	const getRiskMessage = (level?: string) => {
		switch (level) {
			case "low":
				return "Great news! Your burnout risk is low. Keep maintaining your wellness practices.";
			case "moderate":
				return "You're showing early warning signs. Let's prevent burnout before it happens.";
			case "high":
				return "Your burnout indicators are concerning. You need support now.";
			case "severe":
				return "Critical burnout level detected. Immediate intervention recommended.";
			default:
				return "Take control of your wellness journey today.";
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
				{/* Header with Beta Badge */}
				<div className="relative p-6 border-b border-gray-200 bg-gradient-to-r from-sage-50 to-green-50">
					<button
						onClick={onClose}
						className="absolute top-6 right-6 p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
						aria-label="Close modal"
					>
						<X className="w-5 h-5 text-gray-500" />
					</button>

					<div className="flex items-center space-x-3 mb-4">
						<span className="px-3 py-1 bg-gradient-to-r from-sage-500 to-green-500 text-white text-xs font-bold rounded-full">
							LIMITED BETA ACCESS
						</span>
						<span className="text-sm text-gray-600">
							Early adopter pricing available
						</span>
					</div>

					<h2 className="text-3xl font-bold text-gray-900 mb-2">
						Choose Your Wellness Journey
					</h2>

					{burnoutScore && (
						<div className="mt-4 p-4 bg-white bg-opacity-70 rounded-lg">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600">
										Your Burnout Assessment Score
									</p>
									<p
										className={`text-2xl font-bold ${getRiskColor(riskLevel)}`}
									>
										{burnoutScore.toFixed(1)}/5.0 -{" "}
										{riskLevel?.charAt(0).toUpperCase() + riskLevel?.slice(1)}{" "}
										Risk
									</p>
								</div>
								<AlertCircle className={`h-8 w-8 ${getRiskColor(riskLevel)}`} />
							</div>
							<p className="text-sm mt-2 text-gray-700">
								{getRiskMessage(riskLevel)}
							</p>
						</div>
					)}
				</div>

				{/* Pricing Plans */}
				<div className="p-6">
					<div className="grid md:grid-cols-2 gap-6">
						{/* Essential Plan - Available Now */}
						<div className="rounded-xl border-2 border-sage-500 relative overflow-hidden">
							<div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-sage-500 to-green-500 text-white text-center py-1 text-sm font-bold">
								AVAILABLE NOW
							</div>

							<div className="p-6 mt-8">
								<h3 className="text-2xl font-bold text-gray-900 mb-2">
									Essential
								</h3>
								<p className="text-gray-600 mb-4">
									Your daily wellness companion
								</p>

								<div className="mb-6">
									<span className="text-4xl font-bold text-gray-900">$12</span>
									<span className="text-gray-600">/month</span>
									<p className="text-sm text-green-600 mt-1">
										Beta pricing - Lock it in forever!
									</p>
								</div>

								<ul className="space-y-3 mb-6">
									<li className="flex items-start">
										<CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
										<span className="text-sm text-gray-700">
											Daily Burnout Gauge with personalized recommendations
										</span>
									</li>
									<li className="flex items-start">
										<CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
										<span className="text-sm text-gray-700">
											Complete Reflection Studio (8+ evidence-based tools)
										</span>
									</li>
									<li className="flex items-start">
										<CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
										<span className="text-sm text-gray-700">
											Stress Reset techniques & grounding exercises
										</span>
									</li>
									<li className="flex items-start">
										<CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
										<span className="text-sm text-gray-700">
											Growth Insights dashboard with trend tracking
										</span>
									</li>
									<li className="flex items-start">
										<CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
										<span className="text-sm text-gray-700">
											Data export for personal tracking
										</span>
									</li>
									<li className="flex items-start">
										<CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
										<span className="text-sm text-gray-700">
											Mobile-responsive design for on-the-go access
										</span>
									</li>
								</ul>

								<button
									onClick={() => handleSubscribe("essential")}
									className="w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center group"
									style={{
										background: "linear-gradient(to right, #5B9378, #5F7F55)",
										color: "#FFFFFF",
										padding: "12px 24px",
										borderRadius: "8px",
										border: "none",
										cursor: "pointer",
										fontSize: "16px",
										fontWeight: "600",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										width: "100%",
										transition: "all 0.3s ease",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.background =
											"linear-gradient(to right, #5A7A4F, #4E6E44)";
										e.currentTarget.style.transform = "translateY(-2px)";
										e.currentTarget.style.boxShadow =
											"0 4px 12px rgba(107, 139, 96, 0.3)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background =
											"linear-gradient(to right, #5B9378, #5F7F55)";
										e.currentTarget.style.transform = "translateY(0)";
										e.currentTarget.style.boxShadow = "none";
									}}
								>
									Start Essential Plan - $12/month
									<ArrowRight
										className="w-5 h-5 ml-2"
										style={{ display: "inline-block" }}
									/>
								</button>

								{riskLevel &&
									(riskLevel === "high" || riskLevel === "severe") && (
										<p className="text-xs text-center mt-3 text-orange-600 font-semibold">
											⚠️ Based on your score, we recommend starting immediately
										</p>
									)}
							</div>
						</div>

						{/* Professional Plan - Coming Soon */}
						<div className="rounded-xl border-2 border-gray-300 relative opacity-75">
							<div className="absolute top-0 left-0 right-0 bg-gray-400 text-white text-center py-1 text-sm font-bold">
								COMING Q2 2026
							</div>

							<div className="p-6 mt-8">
								<h3 className="text-2xl font-bold text-gray-900 mb-2">
									Professional
								</h3>
								<p className="text-gray-600 mb-4">Advanced practice support</p>

								<div className="mb-6">
									<span className="text-4xl font-bold text-gray-900">$24</span>
									<span className="text-gray-600">/month</span>
									<p className="text-sm text-gray-500 mt-1">
										Early bird pricing when launched
									</p>
								</div>

								<ul className="space-y-3 mb-6">
									<li className="flex items-start">
										<Sparkles className="h-5 w-5 mr-2 mt-0.5 text-purple-500 flex-shrink-0" />
										<span className="text-sm text-gray-700">
											Everything in Essential
										</span>
									</li>
									<li className="flex items-start">
										<Sparkles className="h-5 w-5 mr-2 mt-0.5 text-purple-500 flex-shrink-0" />
										<span className="text-sm text-gray-700">
											Elya AI Companion for personalized support
										</span>
									</li>
									<li className="flex items-start">
										<Sparkles className="h-5 w-5 mr-2 mt-0.5 text-purple-500 flex-shrink-0" />
										<span className="text-sm text-gray-700">
											Advanced analytics & predictive insights
										</span>
									</li>
									<li className="flex items-start">
										<Sparkles className="h-5 w-5 mr-2 mt-0.5 text-purple-500 flex-shrink-0" />
										<span className="text-sm text-gray-700">
											CEU credits for wellness activities
										</span>
									</li>
									<li className="flex items-start">
										<Sparkles className="h-5 w-5 mr-2 mt-0.5 text-purple-500 flex-shrink-0" />
										<span className="text-sm text-gray-700">
											Priority support & monthly group sessions
										</span>
									</li>
									<li className="flex items-start">
										<Sparkles className="h-5 w-5 mr-2 mt-0.5 text-purple-500 flex-shrink-0" />
										<span className="text-sm text-gray-700">
											Custom wellness plans & goal tracking
										</span>
									</li>
								</ul>

								<button
									disabled
									className="w-full py-3 rounded-lg font-semibold"
									style={{
										backgroundColor: "#E5E7EB",
										color: "#6B7280",
										padding: "12px 24px",
										borderRadius: "8px",
										border: "none",
										cursor: "not-allowed",
										fontSize: "16px",
										fontWeight: "600",
										opacity: "0.5",
										width: "100%",
									}}
								>
									Coming Soon
								</button>
							</div>
						</div>
					</div>

					{/* Trust Badges */}
					<div className="mt-8 pt-6 border-t border-gray-200">
						<div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
							<div className="flex items-center">
								<Shield className="h-5 w-5 mr-2 text-sage-600" />
								<span>HIPAA Compliant</span>
							</div>
							<div className="flex items-center">
								<Lock className="h-5 w-5 mr-2 text-sage-600" />
								<span>Bank-level Security</span>
							</div>
							<div className="flex items-center">
								<Users className="h-5 w-5 mr-2 text-sage-600" />
								<span>Built for Interpreters</span>
							</div>
							<div className="flex items-center">
								<Heart className="h-5 w-5 mr-2 text-sage-600" />
								<span>Cancel Anytime</span>
							</div>
						</div>

						<p className="text-center text-xs text-gray-500 mt-4">
							Join hundreds of interpreters taking control of their wellness
							journey
						</p>
					</div>
				</div>
			</div>

			{/* Auth Modal */}
			{showAuthModal && (
				<AuthModal
					isOpen={showAuthModal}
					onClose={() => setShowAuthModal(false)}
					mode={authMode}
				/>
			)}

			{/* Success Message */}
			{showSuccessMessage && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
					<div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<CheckCircle className="w-8 h-8 text-green-500" />
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-2">
							Authenticated Successfully!
						</h3>
						<p className="text-gray-600 mb-4">Ready for Stripe integration!</p>
						<p className="text-sm text-gray-500">Redirecting to checkout...</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default PricingModal;
