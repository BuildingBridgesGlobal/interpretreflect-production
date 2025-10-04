import { ArrowRight, Check } from "lucide-react";
import React, { useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { analytics } from "../utils/analytics";

import { AuthModal } from "./AuthModal";

interface TrialSignupSectionProps {
	onTrialStarted?: () => void;
}

export function TrialSignupSection({
	onTrialStarted,
}: TrialSignupSectionProps) {
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [trialStarted, setTrialStarted] = useState(false);
	const [error, setError] = useState("");

	const handleStartTrial = async () => {
		if (!user) {
			setAuthModalOpen(true);
			return;
		}

		setLoading(true);
		setError("");

		try {
			// Check if user already has a trial or subscription
			const { data: profile } = await supabase
				.from("profiles")
				.select("subscription_status, trial_started_at")
				.eq("id", user.id)
				.single();

			if (profile?.subscription_status === "active") {
				setError("You already have an active subscription");
				setLoading(false);
				return;
			}

			if (profile?.trial_started_at) {
				setError("You have already used your free trial");
				setLoading(false);
				return;
			}

			// Start the trial
			const { data, error: trialError } = await supabase.rpc(
				"start_user_trial",
				{
					user_id: user.id,
				},
			);

			if (trialError) throw trialError;

			// Track trial start
			analytics.trackTrialStart();

			// Send event to Encharge for email automation
			await supabase.functions.invoke("send-encharge-event", {
				body: {
					email: user.email,
					event: "trial_started",
					properties: {
						trial_duration_days: 3,
						trial_ends_at: data.trial_ends_at,
					},
				},
			});

			setTrialStarted(true);

			// Redirect to onboarding or dashboard after 2 seconds
			setTimeout(() => {
				if (onTrialStarted) {
					onTrialStarted();
				} else {
					window.location.href = "/dashboard";
				}
			}, 2000);
		} catch (err) {
			console.error("Error starting trial:", err);
			setError("Failed to start trial. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const trialFeatures = [
		"Full access to all wellness tools",
		"AI companion Elya available 24/7",
		"Personalized burnout assessments",
		"Guided reflection exercises",
		"Progress tracking & insights",
		"No credit card required",
	];

	if (trialStarted) {
		return (
			<div className="text-center py-12 px-6 bg-green-50 rounded-2xl">
				<div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
					<Check className="w-8 h-8 text-green-600" />
				</div>
				<h3 className="text-2xl font-bold text-gray-900 mb-2">
					Trial Started Successfully!
				</h3>
				<p className="text-gray-600 mb-4">
					Your 3-day free trial is now active. Redirecting to your dashboard...
				</p>
			</div>
		);
	}

	return (
		<>
			<div
				className="rounded-3xl p-8 md:p-12 shadow-xl"
				style={{
					background: "linear-gradient(to bottom right, #F5F9F5, #E8F5E8)",
				}}
			>
				{/* Header with urgency */}
				<div className="text-center mb-8">
					<div
						className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
						style={{ backgroundColor: "#E8F5E8", color: "rgb(92, 127, 79)" }}
					>
						LIMITED TIME OFFER
					</div>

					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						Start Your 3-Day Free Trial
					</h2>

					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Experience the full power of InterpretReflect with no commitment.
						Join 500+ interpreters who are preventing burnout and thriving.
					</p>
				</div>

				{/* Value proposition cards */}
				<div className="grid md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white rounded-xl p-6 shadow-sm">
						<h3 className="font-semibold text-gray-900 mb-2">3 Full Days</h3>
						<p className="text-sm text-gray-600">
							Complete access to explore every feature at your own pace
						</p>
					</div>

					<div className="bg-white rounded-xl p-6 shadow-sm">
						<h3 className="font-semibold text-gray-900 mb-2">
							No Card Required
						</h3>
						<p className="text-sm text-gray-600">
							Start immediately without entering payment information
						</p>
					</div>

					<div className="bg-white rounded-xl p-6 shadow-sm">
						<h3 className="font-semibold text-gray-900 mb-2">
							Premium Features
						</h3>
						<p className="text-sm text-gray-600">
							Access all tools including our AI wellness companion
						</p>
					</div>
				</div>

				{/* Features list */}
				<div className="bg-white rounded-xl p-6 mb-8">
					<h3 className="font-semibold text-gray-900 mb-4">
						What's included in your trial:
					</h3>
					<div className="grid md:grid-cols-2 gap-3">
						{trialFeatures.map((feature, index) => (
							<div key={index} className="flex items-start gap-3">
								<Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
								<span className="text-gray-700">{feature}</span>
							</div>
						))}
					</div>
				</div>

				{/* Error message */}
				{error && (
					<div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
						{error}
					</div>
				)}

				{/* CTA Button */}
				<div className="text-center">
					<button
						onClick={handleStartTrial}
						disabled={loading}
						className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ background: "rgb(92, 127, 79)" }}
					>
						{loading ? (
							<>
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
								Starting Trial...
							</>
						) : (
							<>
								Start Free Trial Now
								<ArrowRight className="w-5 h-5" />
							</>
						)}
					</button>

					<p className="text-sm text-gray-500 mt-4">
						After 3 days, continue with Essential tier at $12.99/month
					</p>
				</div>
			</div>

			{/* Auth Modal */}
			<AuthModal
				isOpen={authModalOpen}
				onClose={() => setAuthModalOpen(false)}
				mode="signup"
				onAuthSuccess={handleStartTrial}
			/>
		</>
	);
}
