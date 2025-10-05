import { Clock, Heart, X } from "lucide-react";
import type React from "react";
import { useState } from "react";

import {
	CommunityIcon,
	HeartPulseIcon,
	NotepadIcon,
	TargetIcon,
} from "./CustomIcon";

interface WelcomeModalProps {
	onClose: () => void;
	onComplete: (recommendations: string[]) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
	onClose,
	onComplete,
}) => {
	const [currentStep, setCurrentStep] = useState(0);
	const [answers, setAnswers] = useState({
		purpose: "",
		timeAvailable: "",
		energyLevel: "",
	});

	const questions = [
		{
			id: "purpose",
			title: "Welcome to InterpretReflect! 🌟",
			subtitle: "Let's find the right reflection for you right now",
			question: "What brings you here today?",
			options: [
				{
					value: "pre-assignment",
					label: "Preparing for an assignment",
					icon: <NotepadIcon size={32} />,
				},
				{
					value: "post-assignment",
					label: "Processing after an assignment",
					icon: <TargetIcon size={32} />,
				},
				{
					value: "team",
					label: "Team or mentoring support",
					icon: <CommunityIcon size={32} />,
				},
				{
					value: "wellness",
					label: "Personal wellness & self-care",
					icon: <HeartPulseIcon size={32} />,
				},
			],
		},
		{
			id: "timeAvailable",
			title: "Great choice!",
			subtitle: "Every moment of self-care counts",
			question: "How much time do you have?",
			options: [
				{
					value: "3min",
					label: "3 minutes",
					icon: <Clock className="w-8 h-8" />,
				},
				{
					value: "10min",
					label: "10 minutes",
					icon: <Clock className="w-8 h-8" />,
				},
				{
					value: "20min",
					label: "20+ minutes",
					icon: <Clock className="w-8 h-8" />,
				},
				{
					value: "flexible",
					label: "I'm flexible",
					icon: <Clock className="w-8 h-8" />,
				},
			],
		},
		{
			id: "energyLevel",
			title: "Almost done!",
			subtitle: "We'll match you with the right support",
			question: "What's your current energy level?",
			options: [
				{
					value: "low",
					label: "Need support & restoration",
					icon: <Heart className="w-8 h-8" />,
				},
				{
					value: "balanced",
					label: "Feeling balanced",
					icon: <Heart className="w-8 h-8" />,
				},
				{
					value: "high",
					label: "Ready to reflect deeply",
					icon: <Heart className="w-8 h-8" />,
				},
				{
					value: "stressed",
					label: "Feeling stressed or overwhelmed",
					icon: <Heart className="w-8 h-8" />,
				},
			],
		},
	];

	const getRecommendations = () => {
		const recs = [];

		// Based on purpose
		if (answers.purpose === "pre-assignment") {
			recs.push("Pre-Assignment Prep");
			if (answers.timeAvailable === "3min") {
				recs.push("3-Minute Breathing Practice");
			}
		} else if (answers.purpose === "post-assignment") {
			recs.push("Post-Assignment Debrief");
			if (answers.energyLevel === "low" || answers.energyLevel === "stressed") {
				recs.push("Stress Reset Tool");
			}
		} else if (answers.purpose === "team") {
			recs.push("Teaming Prep");
			recs.push("Mentoring Prep");
		} else if (answers.purpose === "wellness") {
			recs.push("Wellness Check-in");
			if (answers.energyLevel === "stressed") {
				recs.push("Emotion Mapping");
				recs.push("Body Check-In");
			}
		}

		// Add time-based recommendations
		if (answers.timeAvailable === "3min") {
			if (!recs.includes("3-Minute Breathing Practice")) {
				recs.push("3-Minute Breathing Practice");
			}
		} else if (
			answers.timeAvailable === "20min" ||
			answers.timeAvailable === "flexible"
		) {
			if (!recs.includes("Growth Insights")) {
				recs.push("Review Growth Insights");
			}
		}

		// Energy-based additions
		if (
			answers.energyLevel === "stressed" &&
			!recs.includes("Stress Reset Tool")
		) {
			recs.push("Quick Stress Reset");
		}

		return recs.slice(0, 3); // Return top 3 recommendations
	};

	const handleAnswer = (questionId: string, value: string) => {
		setAnswers((prev) => ({ ...prev, [questionId]: value }));

		if (currentStep < questions.length - 1) {
			setTimeout(() => setCurrentStep(currentStep + 1), 300);
		} else {
			// Final step - show recommendations
			setTimeout(() => {
				const recommendations = getRecommendations();
				onComplete(recommendations);
			}, 300);
		}
	};

	const currentQuestion = questions[currentStep];

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
		>
			<div
				className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div
					className="px-8 pt-8 pb-4 border-b"
					style={{ backgroundColor: "#FAF9F6" }}
				>
					<div className="flex items-start justify-between">
						<div>
							<h2
								className="text-2xl font-bold mb-1"
								style={{ color: "#1A1A1A" }}
							>
								{currentQuestion.title}
							</h2>
							<p className="text-sm" style={{ color: "#5A5A5A" }}>
								{currentQuestion.subtitle}
							</p>
						</div>
						<button
							onClick={onClose}
							className="p-2 rounded-lg transition-colors text-white"
							style={{
								background:
									"linear-gradient(135deg, var(--color-green-600), var(--color-green-500))",
							}}
							aria-label="Close"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Progress indicator */}
					<div className="flex gap-2 mt-6">
						{questions.map((_, index) => (
							<div
								key={index}
								className="h-1 flex-1 rounded-full transition-all"
								style={{
									backgroundColor: index <= currentStep ? "#5C7F4F" : "#E5E5E5",
								}}
							/>
						))}
					</div>
				</div>

				{/* Question Content */}
				<div className="p-8">
					<h3
						className="text-lg font-semibold mb-6"
						style={{ color: "#1A1A1A" }}
					>
						{currentQuestion.question}
					</h3>

					<div className="grid grid-cols-2 gap-4">
						{currentQuestion.options.map((option) => (
							<button
								key={option.value}
								onClick={() => handleAnswer(currentQuestion.id, option.value)}
								className="p-6 rounded-xl border-2 transition-all hover:scale-105 text-left"
								style={{
									borderColor:
										answers[currentQuestion.id] === option.value
											? "#5C7F4F"
											: "#E5E5E5",
									backgroundColor:
										answers[currentQuestion.id] === option.value
											? "#F0F7F0"
											: "#FFFFFF",
								}}
								onMouseEnter={(e) => {
									if (answers[currentQuestion.id] !== option.value) {
										e.currentTarget.style.borderColor = "#5B9378";
										e.currentTarget.style.backgroundColor = "#F8FBF8";
									}
								}}
								onMouseLeave={(e) => {
									if (answers[currentQuestion.id] !== option.value) {
										e.currentTarget.style.borderColor = "#E5E5E5";
										e.currentTarget.style.backgroundColor = "#FFFFFF";
									}
								}}
							>
								<div className="flex items-center gap-3">
									<div style={{ color: "#5C7F4F" }}>{option.icon}</div>
									<span className="font-medium" style={{ color: "#1A1A1A" }}>
										{option.label}
									</span>
								</div>
							</button>
						))}
					</div>

					{/* Skip button */}
					<div className="flex justify-between items-center mt-8">
						{currentStep > 0 && (
							<button
								onClick={() => setCurrentStep(currentStep - 1)}
								className="text-sm font-medium hover:underline"
								style={{ color: "#5A5A5A" }}
							>
								← Back
							</button>
						)}
						<button
							onClick={onClose}
							className="text-sm font-medium hover:underline ml-auto"
							style={{ color: "#5A5A5A" }}
						>
							Skip for now
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
