import { Bell, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

interface ProgressiveOnboardingProps {
	user: any;
	onDismiss: (tipId: string) => void;
}

interface OnboardingTip {
	id: string;
	title: string;
	message: string;
	action?: string;
	actionUrl?: string;
	trigger: {
		daysAfterSignup: number;
		feature?: string;
		condition?: string;
	};
	priority: "high" | "medium" | "low";
}

const onboardingTips: OnboardingTip[] = [
	{
		id: "first-reflection",
		title: "🎉 Welcome! Start with your first reflection",
		message: "Take 5 minutes to try a Wellness Check-in. It's the perfect way to begin your wellness journey.",
		action: "Try Wellness Check-in",
		actionUrl: "/reflection-studio",
		trigger: { daysAfterSignup: 0 },
		priority: "high"
	},
	{
		id: "stress-reset",
		title: "🧘‍♀️ Quick stress relief between assignments",
		message: "Try our 3-minute breathing practice. Perfect for interpreters on-the-go!",
		action: "Try Breathing Practice",
		actionUrl: "/stress-reset",
		trigger: { daysAfterSignup: 1 },
		priority: "high"
	},
	{
		id: "ai-coach",
		title: "🤖 Meet Elya, your AI wellness companion",
		message: "Chat with Elya anytime for emotional support and guidance. Available 24/7!",
		action: "Chat with Elya",
		actionUrl: "/reflection-studio",
		trigger: { daysAfterSignup: 2 },
		priority: "medium"
	},
	{
		id: "growth-insights",
		title: "📊 Track your wellness progress",
		message: "See how your reflections are helping you grow. Check your Growth Insights!",
		action: "View Insights",
		actionUrl: "/growth-insights",
		trigger: { daysAfterSignup: 3 },
		priority: "medium"
	},
	{
		id: "affirmations",
		title: "💝 Build daily resilience",
		message: "Start a 28-day affirmation program designed specifically for interpreters.",
		action: "Start Affirmations",
		actionUrl: "/affirmations",
		trigger: { daysAfterSignup: 5 },
		priority: "low"
	},
	{
		id: "mobile-optimization",
		title: "📱 Perfect for interpreters on-the-go",
		message: "InterpretReflect works great on your phone! Access wellness tools anywhere.",
		trigger: { daysAfterSignup: 7 },
		priority: "low"
	}
];

export const ProgressiveOnboarding: React.FC<ProgressiveOnboardingProps> = ({
	user,
	onDismiss,
}) => {
	const [currentTip, setCurrentTip] = useState<OnboardingTip | null>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		checkForTips();
	}, [user]);

	const checkForTips = async () => {
		if (!user) return;

		try {
			// Get user's signup date and dismissed tips
			const { supabase } = await import("../../lib/supabase");
			const { data: profile } = await supabase
				.from("profiles")
				.select("created_at, dismissed_onboarding_tips")
				.eq("id", user.id)
				.single();

			if (!profile) return;

			const signupDate = new Date(profile.created_at);
			const daysSinceSignup = Math.floor((Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24));
			const dismissedTips = profile.dismissed_onboarding_tips || [];

			// Find the next tip to show
			const nextTip = onboardingTips.find(tip => {
				// Check if tip should be shown based on days since signup
				if (daysSinceSignup < tip.trigger.daysAfterSignup) return false;
				
				// Check if tip was already dismissed
				if (dismissedTips.includes(tip.id)) return false;
				
				// Check additional conditions
				if (tip.trigger.condition) {
					// Add logic for specific conditions if needed
				}
				
				return true;
			});

			if (nextTip) {
				setCurrentTip(nextTip);
				setIsVisible(true);
			}
		} catch (error) {
			console.error("Error checking onboarding tips:", error);
		}
	};

	const handleDismiss = async () => {
		if (!currentTip || !user) return;

		try {
			// Mark tip as dismissed
			const { supabase } = await import("../../lib/supabase");
			const { data: profile } = await supabase
				.from("profiles")
				.select("dismissed_onboarding_tips")
				.eq("id", user.id)
				.single();

			const dismissedTips = profile?.dismissed_onboarding_tips || [];
			const updatedTips = [...dismissedTips, currentTip.id];

			await supabase
				.from("profiles")
				.update({ dismissed_onboarding_tips: updatedTips })
				.eq("id", user.id);

			setIsVisible(false);
			onDismiss(currentTip.id);
		} catch (error) {
			console.error("Error dismissing tip:", error);
		}
	};

	const handleAction = () => {
		if (currentTip?.actionUrl) {
			window.location.href = currentTip.actionUrl;
		}
		handleDismiss();
	};

	if (!currentTip || !isVisible) return null;

	return (
		<div className="fixed bottom-4 right-4 z-40 max-w-sm">
			<div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-slide-up">
				{/* Header */}
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center gap-2">
						<Bell className="w-5 h-5 text-green-600" />
						<h3 className="font-semibold text-gray-900 text-sm">
							{currentTip.title}
						</h3>
					</div>
					<button
						onClick={handleDismiss}
						className="p-1 rounded hover:bg-gray-100 transition-colors"
						aria-label="Dismiss"
					>
						<X className="w-4 h-4 text-gray-500" />
					</button>
				</div>

				{/* Message */}
				<p className="text-sm text-gray-600 mb-4">
					{currentTip.message}
				</p>

				{/* Actions */}
				<div className="flex items-center gap-2">
					{currentTip.action && (
						<button
							onClick={handleAction}
							className="mobile-button flex-1 bg-green-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
						>
							{currentTip.action}
						</button>
					)}
					<button
						onClick={handleDismiss}
						className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
					>
						Maybe later
					</button>
				</div>

				{/* Priority indicator */}
				<div className="mt-2 flex items-center gap-1">
					<div className={`w-2 h-2 rounded-full ${
						currentTip.priority === "high" ? "bg-red-500" :
						currentTip.priority === "medium" ? "bg-yellow-500" : "bg-gray-400"
					}`} />
					<span className="text-xs text-gray-500">
						{currentTip.priority === "high" ? "Important" :
						 currentTip.priority === "medium" ? "Helpful" : "Optional"}
					</span>
				</div>
			</div>
		</div>
	);
};

export default ProgressiveOnboarding;
