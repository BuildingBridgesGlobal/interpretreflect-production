import { Compass, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { reflectionService } from "../services/reflectionService";

interface DecideFrameworkReflectionProps {
	onComplete: (data: any) => void;
	onClose: () => void;
}

export const DecideFrameworkReflection: React.FC<
	DecideFrameworkReflectionProps
> = ({ onComplete, onClose }) => {
	const { user } = useAuth();
	const [currentStep, setCurrentStep] = useState(0);
	const [responses, setResponses] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [hasSaved, setHasSaved] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);

	// Scroll to top on mount
	useEffect(() => {
		modalRef.current?.scrollTo({ top: 0, behavior: "instant" });
	}, []);

	const steps = [
		{
			letter: "D",
			title: "Detect",
			subtitle: "Notice emotional and contextual dynamics",
			question:
				"What emotions, tensions, or unspoken dynamics are present in this interaction? Consider all participants' perspectives, including those who may be experiencing stress, vulnerability, or power imbalances.",
			prompt:
				"Describe what you're noticing in terms of emotional content, non-verbal communication, and the overall atmosphere of the interaction...",
		},
		{
			letter: "E",
			title: "Evaluate",
			subtitle: "Weigh cultural and contextual factors",
			question:
				"What cultural, linguistic, or contextual factors are influencing this situation? Consider different communication styles, cultural norms, accessibility needs, and how these might affect understanding between all participants.",
			prompt:
				"Reflect on the cultural contexts, communication preferences, and any unique factors that might impact how information is shared and understood...",
		},
		{
			letter: "C",
			title: "Consider",
			subtitle: "Assess ethical implications",
			question:
				"What ethical considerations are present? Think about autonomy, confidentiality, accuracy, impartiality, and your professional boundaries. How can you honor everyone's right to full participation while maintaining your role?",
			prompt:
				"Explore the ethical dimensions of this situation, including any tensions between different ethical principles...",
		},
		{
			letter: "I",
			title: "Identify",
			subtitle: "Check your internal state",
			question:
				"What is happening within you right now? Notice your emotional state, physical sensations, personal triggers, or biases that might be activated. How is your internal experience affecting your ability to facilitate communication?",
			prompt:
				"Take a moment to check in with yourself - your feelings, physical state, and any personal reactions you're experiencing...",
		},
		{
			letter: "D",
			title: "Determine",
			subtitle: "Choose your approach",
			question:
				"Based on your assessment, what approach will best serve effective communication for all participants? Consider different strategies for conveying meaning, managing flow, and ensuring everyone has equal access to the interaction.",
			prompt:
				"Describe your chosen approach and why you believe it will best facilitate understanding and participation for everyone involved...",
		},
		{
			letter: "E",
			title: "Execute",
			subtitle: "Act with intention and awareness",
			question:
				"How will you implement your chosen approach while remaining flexible and responsive? What will you monitor as you proceed, and how will you know if adjustments are needed?",
			prompt:
				"Outline your action plan, including what you'll pay attention to and how you'll adapt if the situation changes...",
		},
	];

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			handleComplete();
		}
	};

	const handleBack = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleComplete = async () => {
		if (!user || hasSaved || isSubmitting) return;

		setIsSubmitting(true);

		try {
			const dataToSave = {
				...responses,
				completed_at: new Date().toISOString(),
			};

			const result = await reflectionService.saveReflection(
				user.id,
				"decide_framework",
				dataToSave,
			);

			if (!result.success) {
				console.error("DecideFramework - Error saving:", result.error);
				throw new Error(result.error || "Failed to save reflection");
			}

			console.log("DecideFramework - Save successful");
			setHasSaved(true);

			const data = {
				type: "decide_framework",
				responses,
				completedAt: new Date().toISOString(),
			};
			onComplete(data);
		} catch (error) {
			console.error("DecideFramework - Save error:", error);
			setIsSubmitting(false);
		}
	};

	const currentStepData = steps[currentStep];

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-labelledby="decide-framework-title"
		>
			<div
				ref={modalRef}
				className="rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
				style={{
					backgroundColor: "#FAF9F6",
					boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<header
					className="px-8 py-6 border-b flex items-center justify-between"
					style={{
						borderColor: "#E8E5E0",
						background:
							"linear-gradient(135deg, rgba(107, 139, 96, 0.05) 0%, rgba(92, 127, 79, 0.02) 100%)",
					}}
				>
					<div className="flex items-center space-x-3">
						<div
							className="w-12 h-12 rounded-xl flex items-center justify-center"
							style={{
								background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
								boxShadow: "0 2px 8px rgba(107, 139, 96, 0.3)",
							}}
						>
							<Compass className="w-6 h-6 text-white" />
						</div>
						<div>
							<h2
								id="decide-framework-title"
								className="text-2xl font-bold mb-1"
								style={{ color: "#1A1A1A" }}
							>
								DECIDE Framework
							</h2>
							<p className="text-sm" style={{ color: "#5A5A5A" }}>
								Ethical Decision Navigation for Interpreters
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-lg transition-all hover:opacity-90"
						style={{
							background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
						}}
						aria-label="Close dialog"
					>
						<X className="w-5 h-5 text-white" />
					</button>
				</header>

				{/* Progress Bar */}
				<div className="px-8 py-4">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium" style={{ color: "#5A5A5A" }}>
							Step {currentStep + 1} of {steps.length}
						</span>
						<span className="text-sm" style={{ color: "#5A5A5A" }}>
							{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
						</span>
					</div>
					<div
						className="w-full rounded-full h-2.5"
						style={{ backgroundColor: "rgba(232, 229, 224, 0.3)" }}
					>
						<div
							className="h-2.5 rounded-full transition-all duration-300"
							style={{
								width: `${((currentStep + 1) / steps.length) * 100}%`,
								backgroundColor: "#5B9378",
							}}
						/>
					</div>
				</div>

				{/* Step Content */}
				<main className="px-8 py-6">
					<div className="mb-6">
						<div className="flex items-center mb-4">
							<div
								className="w-16 h-16 rounded-full flex items-center justify-center mr-4"
								style={{
									background:
										"linear-gradient(135deg, rgba(107, 139, 96, 0.1), rgba(92, 127, 79, 0.05))",
									border: "2px solid #5B9378",
								}}
							>
								<span
									className="text-2xl font-bold"
									style={{ color: "#2D5F3F" }}
								>
									{currentStepData.letter}
								</span>
							</div>
							<div>
								<h3
									className="text-xl font-bold"
									style={{ color: "#1A1A1A" }}
								>
									{currentStepData.title}
								</h3>
								<p className="text-sm" style={{ color: "#5A5A5A" }}>
									{currentStepData.subtitle}
								</p>
							</div>
						</div>

						<div
							className="p-4 rounded-lg mb-6"
							style={{
								backgroundColor: "#F8FBF6",
								border: "1px solid rgba(107, 139, 96, 0.2)",
							}}
						>
							<p
								className="text-sm leading-relaxed"
								style={{ color: "#2D5F3F", lineHeight: "1.7" }}
							>
								{currentStepData.question}
							</p>
						</div>

						<div>
							<label
								htmlFor={`response-${currentStep}`}
								className="block text-sm font-medium mb-2"
								style={{ color: "#2D5F3F" }}
							>
								Your Reflection
							</label>
							<textarea
								id={`response-${currentStep}`}
								rows={6}
								className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
								style={{
									borderColor: "#E8E5E0",
									resize: "vertical",
								}}
								placeholder={currentStepData.prompt}
								value={responses[currentStepData.title] || ""}
								onChange={(e) =>
									setResponses({
										...responses,
										[currentStepData.title]: e.target.value,
									})
								}
								onFocus={(e) => {
									e.currentTarget.style.borderColor = "#5B9378";
									e.currentTarget.style.backgroundColor =
										"rgba(107, 139, 96, 0.02)";
								}}
								onBlur={(e) => {
									e.currentTarget.style.borderColor = "#E8E5E0";
									e.currentTarget.style.backgroundColor = "";
								}}
							/>
						</div>
					</div>

					{/* Why This Step Matters */}
					<div
						className="p-4 rounded-lg mb-6"
						style={{
							backgroundColor: "#F8FBF6",
							border: "1px solid rgba(107, 139, 96, 0.2)",
						}}
					>
						<p className="text-sm" style={{ color: "#2D5F3F" }}>
							<strong>Why this matters:</strong>{" "}
							{currentStep === 0 &&
								"Detecting emotional content helps you prepare for and respond to the human elements that influence communication."}
							{currentStep === 1 &&
								"Evaluating cultural factors ensures your facilitation respects and bridges different worldviews and communication styles."}
							{currentStep === 2 &&
								"Considering ethics keeps you aligned with professional standards while navigating complex situations."}
							{currentStep === 3 &&
								"Identifying your internal state helps you maintain professional boundaries and self-care."}
							{currentStep === 4 &&
								"Determining your approach beforehand allows for intentional, thoughtful facilitation rather than reactive responses."}
							{currentStep === 5 &&
								"Executing with awareness ensures you remain responsive to changing dynamics while maintaining your professional role."}
						</p>
					</div>

					{/* Navigation Buttons */}
					<div className="flex justify-between">
						<button
							onClick={handleBack}
							disabled={currentStep === 0}
							className="px-6 py-3 rounded-lg font-medium transition-all"
							style={{
								backgroundColor:
									currentStep === 0 ? "rgba(107, 139, 96, 0.1)" : "#F8FBF6",
								color: currentStep === 0 ? "#9CA3AF" : "#5B9378",
								border: currentStep === 0 ? "none" : "2px solid #5B9378",
								cursor: currentStep === 0 ? "not-allowed" : "pointer",
								opacity: currentStep === 0 ? "0.5" : "1",
							}}
							onMouseEnter={(e) => {
								if (currentStep !== 0) {
									e.currentTarget.style.backgroundColor = "#F0F7F0";
								}
							}}
							onMouseLeave={(e) => {
								if (currentStep !== 0) {
									e.currentTarget.style.backgroundColor = "#F8FBF6";
								}
							}}
						>
							Previous Step
						</button>

						<button
							onClick={handleNext}
							disabled={isSubmitting || hasSaved}
							className="px-6 py-3 rounded-lg font-medium text-white transition-all"
							style={{
								background:
									isSubmitting || hasSaved
										? "#CCCCCC"
										: "linear-gradient(135deg, #2D5F3F, #5B9378)",
								boxShadow:
									isSubmitting || hasSaved
										? "none"
										: "0 4px 12px rgba(45, 95, 63, 0.25)",
								cursor: isSubmitting || hasSaved ? "not-allowed" : "pointer",
							}}
							onMouseEnter={(e) => {
								if (!isSubmitting && !hasSaved) {
									e.currentTarget.style.transform = "translateY(-1px)";
									e.currentTarget.style.boxShadow =
										"0 4px 12px rgba(45, 95, 63, 0.4)";
								}
							}}
							onMouseLeave={(e) => {
								if (!isSubmitting && !hasSaved) {
									e.currentTarget.style.transform = "translateY(0)";
									e.currentTarget.style.boxShadow =
										"0 4px 12px rgba(45, 95, 63, 0.25)";
								}
							}}
						>
							{currentStep === steps.length - 1
								? isSubmitting
									? "Saving..."
									: hasSaved
										? "Completed!"
										: "Complete Reflection"
								: "Next Step"}
						</button>
					</div>
				</main>
			</div>
		</div>
	);
};