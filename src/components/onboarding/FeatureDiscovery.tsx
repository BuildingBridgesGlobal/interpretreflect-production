import { ArrowRight, Check, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

interface FeatureDiscoveryProps {
	isOpen: boolean;
	onClose: () => void;
	onComplete: () => void;
}

interface Feature {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	location: string;
	action: string;
	benefit: string;
}

const features: Feature[] = [
	{
		id: "reflection-studio",
		title: "Reflection Studio",
		description: "Your personal wellness workspace with 8+ specialized reflection types",
		icon: "📝",
		location: "Reflection Studio tab",
		action: "Start your first reflection",
		benefit: "Process assignments, manage stress, and track growth"
	},
	{
		id: "stress-reset",
		title: "Stress Reset Protocols",
		description: "Evidence-based techniques for quick stress relief and emotional regulation",
		icon: "🧘‍♀️",
		location: "Stress Reset tab",
		action: "Try a 3-minute breathing practice",
		benefit: "Instant stress relief between assignments"
	},
	{
		id: "ai-coach",
		title: "AI Wellness Coach - Elya",
		description: "Your personal AI companion for emotional support and guidance",
		icon: "🤖",
		location: "Available in reflections",
		action: "Chat with Elya anytime",
		benefit: "24/7 emotional support and wellness guidance"
	},
	{
		id: "growth-insights",
		title: "Growth Insights",
		description: "Track your wellness journey with personalized analytics and patterns",
		icon: "📊",
		location: "Growth Insights tab",
		action: "View your wellness trends",
		benefit: "Understand your patterns and celebrate progress"
	},
	{
		id: "affirmations",
		title: "Daily Affirmations",
		description: "12 specialized 28-day programs for interpreter wellness",
		icon: "💝",
		location: "Affirmations tab",
		action: "Start your affirmation journey",
		benefit: "Build resilience and professional confidence"
	}
];

export const FeatureDiscovery: React.FC<FeatureDiscoveryProps> = ({
	isOpen,
	onClose,
	onComplete,
}) => {
	const [currentFeature, setCurrentFeature] = useState(0);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
		}
	}, [isOpen]);

	const handleNext = () => {
		if (currentFeature < features.length - 1) {
			setCurrentFeature(currentFeature + 1);
		} else {
			handleComplete();
		}
	};

	const handlePrevious = () => {
		if (currentFeature > 0) {
			setCurrentFeature(currentFeature - 1);
		}
	};

	const handleComplete = () => {
		setIsVisible(false);
		setTimeout(() => {
			onComplete();
		}, 300);
	};

	const handleClose = () => {
		setIsVisible(false);
		setTimeout(() => {
			onClose();
		}, 300);
	};

	if (!isOpen) return null;

	const feature = features[currentFeature];
	const progress = ((currentFeature + 1) / features.length) * 100;

	return (
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
				isVisible ? "opacity-100" : "opacity-0"
			}`}
			style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
		>
			<div
				className={`mobile-modal bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all duration-300 ${
					isVisible ? "scale-100" : "scale-95"
				}`}
			>
				{/* Header */}
				<div
					className="px-6 pt-6 pb-4 border-b"
					style={{ backgroundColor: "#FAF9F6" }}
				>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<span className="text-2xl">{feature.icon}</span>
							<h2 className="text-xl font-bold text-gray-900">
								Discover Features
							</h2>
						</div>
						<button
							onClick={handleClose}
							className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
							aria-label="Close"
						>
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>

					{/* Progress Bar */}
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="h-2 rounded-full transition-all duration-500"
							style={{
								backgroundColor: "#5C7F4F",
								width: `${progress}%`,
							}}
						/>
					</div>
					<p className="text-sm text-gray-600 mt-2">
						{currentFeature + 1} of {features.length} features
					</p>
				</div>

				{/* Feature Content */}
				<div className="p-6">
					<div className="text-center mb-6">
						<div className="text-4xl mb-3">{feature.icon}</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							{feature.title}
						</h3>
						<p className="text-gray-600 mb-4">{feature.description}</p>
					</div>

					{/* Feature Details */}
					<div className="bg-gray-50 rounded-lg p-4 mb-6">
						<div className="space-y-3">
							<div className="flex items-start gap-3">
								<span className="text-sm font-medium text-gray-700 min-w-16">
									📍 Where:
								</span>
								<span className="text-sm text-gray-600">
									{feature.location}
								</span>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-sm font-medium text-gray-700 min-w-16">
									🎯 Try:
								</span>
								<span className="text-sm text-gray-600">
									{feature.action}
								</span>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-sm font-medium text-gray-700 min-w-16">
									✨ Benefit:
								</span>
								<span className="text-sm text-gray-600">
									{feature.benefit}
								</span>
							</div>
						</div>
					</div>

					{/* Navigation */}
					<div className="flex items-center justify-between">
						<button
							onClick={handlePrevious}
							disabled={currentFeature === 0}
							className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							← Previous
						</button>

						<div className="flex items-center gap-2">
							{features.map((_, index) => (
								<div
									key={index}
									className={`w-2 h-2 rounded-full transition-colors ${
										index === currentFeature
											? "bg-green-600"
											: index < currentFeature
											? "bg-green-300"
											: "bg-gray-300"
									}`}
								/>
							))}
						</div>

						<button
							onClick={handleNext}
							className="mobile-button flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
						>
							{currentFeature === features.length - 1 ? (
								<>
									<Check className="w-4 h-4" />
									Get Started
								</>
							) : (
								<>
									Next
									<ArrowRight className="w-4 h-4" />
								</>
							)}
						</button>
					</div>

					{/* Skip Option */}
					<div className="text-center mt-4">
						<button
							onClick={handleClose}
							className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
						>
							Skip tour for now
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FeatureDiscovery;
