import { ArrowLeft, ArrowRight, Brain, RefreshCw, X } from "lucide-react";
import React, { useState } from "react";

interface BreatheProtocolProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

const BREATHE_STEPS = [
	{
		letter: "B",
		title: "Breathe",
		question: "When and how would you use 4-7-8 breathing?",
		guidance: "Let's practice together:",
		practice: "Inhale for 4... Hold for 7... Exhale for 8...",
	},
	{
		letter: "R",
		title: "Recognize",
		question: "What emotions do you need to notice and name right now?",
		guidance: "Take a moment to scan your emotional state. Name what you're feeling without judgment.",
	},
	{
		letter: "E",
		title: "Evaluate",
		question: "How is this emotion impacting your interpreting?",
		guidance: "Consider: Is it affecting your focus? Your energy? Your neutrality?",
	},
	{
		letter: "A",
		title: "Adjust",
		question: "What physical adjustments would help you shift your state?",
		guidance: "Think about: posture, tension release, grounding, or movement.",
	},
	{
		letter: "T",
		title: "Take Space",
		question: "What do you need to let go of right now?",
		guidance: "Identify what's not yours to carry. Release what belongs to the assignment, not to you.",
	},
	{
		letter: "H",
		title: "Hold Boundaries",
		question: "What professional boundaries protect you here?",
		guidance: "Remind yourself: What is your role? What is not your responsibility?",
	},
	{
		letter: "E",
		title: "Express & Release",
		question: "What affirming statement supports you now?",
		guidance: "Create or recall an affirmation that reinforces your resilience and professional identity.",
	},
];

export const BreatheProtocolAccessible: React.FC<BreatheProtocolProps> = ({
	onClose,
	onComplete,
}) => {
	const [currentStep, setCurrentStep] = useState(0);
	const [responses, setResponses] = useState<Record<number, string>>({});

	const handleNext = () => {
		if (currentStep < BREATHE_STEPS.length - 1) {
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

	const handleComplete = () => {
		const data = {
			responses,
			completedSteps: currentStep + 1,
			timestamp: new Date().toISOString(),
		};

		if (onComplete) {
			onComplete(data);
		}
		onClose();
	};

	const step = BREATHE_STEPS[currentStep];
	const progress = ((currentStep + 1) / BREATHE_STEPS.length) * 100;

	return (
		<div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
			<section
				aria-labelledby="breathe-protocol-title"
				className="rounded-3xl max-w-2xl w-full bg-white shadow-sm"
				lang="en"
			>
				<div className="p-8">
					<div className="flex justify-between items-start mb-6">
						<div className="flex items-center gap-3">
							<div
								className="p-2 rounded-xl"
								style={{ backgroundColor: "#F0F5ED" }}
							>
								<Brain className="w-6 h-6" style={{ color: "#2D5F3F" }} />
							</div>
							<div>
								<h2
									id="breathe-protocol-title"
									className="text-xl font-normal"
									style={{ color: "#2D3748" }}
								>
									BREATHE Protocol
								</h2>
								<p className="text-sm" style={{ color: "#4A5568" }}>
									Guided stress reset through reflective questions
								</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="p-2 rounded-xl transition-all hover:scale-105"
							style={{
								background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
							}}
							aria-label="Close BREATHE Protocol"
						>
							<X className="w-5 h-5 text-white" />
						</button>
					</div>

					{/* Progress bar */}
					<div className="mb-6">
						<div className="flex justify-between items-center mb-2">
							<span className="text-sm font-medium" style={{ color: "#2D3748" }}>
								Step {currentStep + 1} of {BREATHE_STEPS.length}
							</span>
							<span className="text-sm" style={{ color: "#4A5568" }}>
								{Math.round(progress)}% Complete
							</span>
						</div>
						<div
							className="w-full h-2 rounded-full overflow-hidden"
							style={{ backgroundColor: "rgba(107, 139, 96, 0.2)" }}
						>
							<div
								className="h-full rounded-full transition-all duration-300"
								style={{
									width: `${progress}%`,
									background: "linear-gradient(90deg, #2D5F3F, #5B9378)",
								}}
							/>
						</div>
					</div>

					{/* Step content */}
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-4">
							<div
								className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold"
								style={{
									backgroundColor: "#F0F5ED",
									color: "#2D5F3F",
								}}
							>
								{step.letter}
							</div>
							<h3 className="text-2xl font-semibold" style={{ color: "#2D3748" }}>
								{step.title}
							</h3>
						</div>

						<div
							className="p-4 rounded-xl mb-4"
							style={{ backgroundColor: "#F0F5ED" }}
						>
							<p className="text-lg font-medium mb-2" style={{ color: "#2D3748" }}>
								{step.question}
							</p>
							<p className="text-sm" style={{ color: "#4A5568" }}>
								{step.guidance}
							</p>
							{step.practice && (
								<p className="text-base font-semibold mt-3" style={{ color: "#2D5F3F" }}>
									{step.practice}
								</p>
							)}
						</div>

						<textarea
							value={responses[currentStep] || ""}
							onChange={(e) =>
								setResponses({ ...responses, [currentStep]: e.target.value })
							}
							placeholder="Reflect on this step... (optional)"
							rows={4}
							className="w-full p-4 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
							style={{
								borderColor: "#E2E8F0",
								backgroundColor: "#FAFAFA",
							}}
						/>
					</div>

					{/* Navigation buttons */}
					<div className="flex justify-between gap-3">
						<button
							onClick={handleBack}
							disabled={currentStep === 0}
							className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
								currentStep === 0
									? "opacity-50 cursor-not-allowed"
									: "hover:opacity-90"
							}`}
							style={{
								backgroundColor: currentStep === 0 ? "#E2E8F0" : "#F0F5ED",
								color: currentStep === 0 ? "#94A3B8" : "#2D5F3F",
							}}
							aria-label="Go to previous step"
						>
							<ArrowLeft className="w-4 h-4" />
							Previous
						</button>

						<button
							onClick={handleNext}
							className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
							style={{
								background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
							}}
							aria-label={
								currentStep === BREATHE_STEPS.length - 1
									? "Complete BREATHE Protocol"
									: "Go to next step"
							}
						>
							{currentStep === BREATHE_STEPS.length - 1 ? "Complete" : "Next"}
							<ArrowRight className="w-4 h-4" />
						</button>
					</div>
				</div>
			</section>
		</div>
	);
};
