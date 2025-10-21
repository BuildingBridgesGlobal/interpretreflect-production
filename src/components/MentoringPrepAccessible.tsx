import { ArrowLeft, ArrowRight, CheckCircle, X } from "lucide-react";
import type React from "react";
import { useEffect, useState, useRef } from "react";

import { useAuth } from "../contexts/AuthContext";
import { reflectionService } from "../services/reflectionService";

import {
	HeartPulseIcon,
	TargetIcon,
} from "./CustomIcon";

interface MentoringPrepData {
	// Mental Preparation
	my_mindset: string;
	my_objectives: string;
	openness_level: number;
	
	// What I Bring
	what_i_bring: string;
	what_mentor_needs: string;
	
	// Session Vision
	ideal_outcome: string;
	commitment: string;
	readiness_level: number;

	timestamp: string;
}

interface MentoringPrepProps {
	onComplete?: (data: MentoringPrepData) => void;
	onClose?: () => void;
}

const steps = [
	{ id: 1, title: "Mental Preparation", icon: HeartPulseIcon },
	{ id: 2, title: "What I Bring", icon: TargetIcon },
	{ id: 3, title: "Session Vision", icon: CheckCircle },
];

const MentoringPrepAccessible: React.FC<MentoringPrepProps> = ({
	onComplete,
	onClose,
}) => {
	const { user } = useAuth();
	const [currentStep, setCurrentStep] = useState(1);
	const [isSaving, setIsSaving] = useState(false);
	const startTime = Date.now();
	const modalRef = useRef<HTMLDivElement>(null);

	// Scroll to top on mount
	useEffect(() => {
		modalRef.current?.scrollTo({ top: 0, behavior: "instant" });
	}, []);

	const [formData, setFormData] = useState<MentoringPrepData>({
		my_mindset: "",
		my_objectives: "",
		openness_level: 5,
		what_i_bring: "",
		what_mentor_needs: "",
		ideal_outcome: "",
		commitment: "",
		readiness_level: 5,
		timestamp: new Date().toISOString(),
	});

	// Auto-save draft
	useEffect(() => {
		const draftKey = "mentoringPrepDraft";
		localStorage.setItem(draftKey, JSON.stringify(formData));
		localStorage.setItem("mentoringPrepStep", currentStep.toString());
	}, [formData, currentStep]);

	// Load draft on mount
	useEffect(() => {
		const draftKey = "mentoringPrepDraft";
		const saved = localStorage.getItem(draftKey);
		if (saved) {
			try {
				setFormData(JSON.parse(saved));
			} catch (e) {
				console.warn("Could not load mentoring prep draft");
			}
		}

		const savedStep = localStorage.getItem("mentoringPrepStep");
		if (savedStep) {
			setCurrentStep(parseInt(savedStep));
		}
	}, []);

	const handleInputChange = (field: string, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleNext = () => {
		if (currentStep < steps.length) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleComplete = async () => {
		if (!user) {
			alert("You must be logged in to save your preparation");
			return;
		}

		if (isSaving) {
			console.log(
				"MentoringPrepAccessible - Already saving, ignoring duplicate click",
			);
			return;
		}

		console.log("MentoringPrepAccessible - handleComplete called");
		console.log("MentoringPrepAccessible - User:", {
			id: user.id,
			email: user.email,
		});

		setIsSaving(true);
		try {
			const timeSpent = Math.floor((Date.now() - startTime) / 1000);
			console.log("MentoringPrepAccessible - Starting save...");

			// Prepare data to save
			const dataToSave = {
				...formData,
				timestamp: new Date().toISOString(),
				time_spent_seconds: timeSpent,
				// Add field for getDisplayName fallback
				mentoring_goals: formData.my_objectives || "Mentoring preparation completed",
			};

			console.log("MentoringPrepAccessible - Saving with reflectionService");

			const result = await reflectionService.saveReflection(
				user.id,
				"mentoring_prep",
				dataToSave,
			);

			if (!result.success) {
				console.error("MentoringPrepAccessible - Error saving:", result.error);
				throw new Error(result.error || "Failed to save reflection");
			} else {
				console.log("MentoringPrepAccessible - Saved successfully");
			}

			// Clear draft
			localStorage.removeItem("mentoringPrepDraft");
			localStorage.removeItem("mentoringPrepStep");

			// Set saving to false immediately after successful save
			setIsSaving(false);

			// Log successful save for parent component
			console.log("Mentoring Prep Results:", dataToSave);

			// Close after successful save
			if (onComplete) {
				onComplete(dataToSave);
			}
			setTimeout(() => {
				onClose?.();
			}, 100);
		} catch (error) {
			console.error(
				"MentoringPrepAccessible - Error in handleComplete:",
				error,
			);
			setIsSaving(false);
			alert(
				error instanceof Error ? error.message : "Failed to save preparation",
			);
		}
	};

	const renderProgressIndicator = () => (
		<div className="mb-8">
			<div className="flex items-center gap-3 mb-4">
				<div
					className="w-12 h-12 rounded-lg flex items-center justify-center"
					style={{
						background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
					}}
				>
					<TargetIcon size={48} />
				</div>
				<div>
					<h2 className="text-2xl font-bold text-gray-800">
						Mentoring Session Prep
					</h2>
					<p className="text-sm text-gray-600">
						Prepare like a pro - get clear, get focused, get ready
					</p>
				</div>
			</div>

			<div className="flex items-center justify-between mb-2">
				{steps.map((step) => {
					const isCompleted = step.id < currentStep;
					const isCurrent = step.id === currentStep;

					return (
						<div
							key={step.id}
							className={`flex-1 h-2 mx-1 rounded-full transition-all ${
								isCompleted || isCurrent ? "" : "bg-gray-200"
							}`}
							style={{
								background:
									isCompleted || isCurrent
										? "linear-gradient(135deg, #5C7F4F, #5B9378)"
										: undefined,
							}}
						/>
					);
				})}
			</div>

			<div className="text-right">
				<span className="text-sm text-gray-500">
					{currentStep} of {steps.length}
				</span>
			</div>
		</div>
	);

	const renderMentalPreparation = () => (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-gray-800 mb-2">Mental Preparation</h3>
			<p className="text-sm text-gray-600 mb-6">
				Elite performers prepare mentally before working with their coaches. What mindset are you bringing to this session?
			</p>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					What mindset am I bringing to this session?
				</label>
				<p className="text-sm text-gray-600 mb-2">
					Think about your mental state - are you open? Defensive? Curious? Ready to learn?
				</p>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={3}
					placeholder="Example: I'm coming in open and ready to learn / I'm feeling a bit defensive about feedback / I'm curious and excited to grow..."
					value={formData.my_mindset}
					onChange={(e) => handleInputChange("my_mindset", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					What are my clear objectives for this session?
				</label>
				<p className="text-sm text-gray-600 mb-2">
					What specific things do you want to get out of this time with your mentor?
				</p>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={4}
					placeholder="Example: Get feedback on my interpreting style / Discuss a challenging situation / Learn strategies for managing fatigue / Ask about career development..."
					value={formData.my_objectives}
					onChange={(e) => handleInputChange("my_objectives", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-4">
					How open am I to feedback and new perspectives? (1-10)
				</label>
				<div className="flex items-center gap-4">
					<span className="text-sm text-gray-500">Closed</span>
					<input
						type="range"
						min="1"
						max="10"
						value={formData.openness_level}
						onChange={(e) =>
							handleInputChange("openness_level", parseInt(e.target.value))
						}
						className="flex-1"
						style={{
							accentColor: "#5B9378",
						}}
					/>
					<span className="text-sm text-gray-500">Fully Open</span>
					<span className="ml-4 font-bold text-green-700 min-w-[2rem] text-center">
						{formData.openness_level}
					</span>
				</div>
			</div>
		</div>
	);

	const renderWhatIBring = () => (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-gray-800 mb-2">What I Bring</h3>
			<p className="text-sm text-gray-600 mb-6">
				Great mentoring relationships are two-way. What are you bringing to this session, and what might your mentor need from you?
			</p>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					What am I bringing to this session?
				</label>
				<p className="text-sm text-gray-600 mb-2">
					Your experiences, questions, challenges, wins - what are you showing up with?
				</p>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={4}
					placeholder="Example: Recent challenging assignment I want to discuss / Questions about a specific technique / Excitement about progress I've made / Concerns about a pattern I'm noticing..."
					value={formData.what_i_bring}
					onChange={(e) => handleInputChange("what_i_bring", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					What might my mentor need from me?
				</label>
				<p className="text-sm text-gray-600 mb-2">
					Think about what would help your mentor help you - context, honesty, specific examples?
				</p>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={4}
					placeholder="Example: Specific examples of what I'm struggling with / Honest feedback about what's working / Context about my current assignments / Clear questions rather than vague concerns..."
					value={formData.what_mentor_needs}
					onChange={(e) => handleInputChange("what_mentor_needs", e.target.value)}
				/>
			</div>
		</div>
	);

	const renderSessionVision = () => (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-gray-800 mb-2">Session Vision</h3>
			<p className="text-sm text-gray-600 mb-6">
				Visualize how you want this session to go. What would make this time valuable?
			</p>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					What would an ideal outcome look like?
				</label>
				<p className="text-sm text-gray-600 mb-2">
					If this session goes well, what will you walk away with?
				</p>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={4}
					placeholder="Example: I'll have 2-3 concrete strategies to try / I'll feel more confident about my approach / I'll understand why that situation was challenging / I'll have a clearer development plan..."
					value={formData.ideal_outcome}
					onChange={(e) => handleInputChange("ideal_outcome", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					My commitment for this session
				</label>
				<p className="text-sm text-gray-600 mb-2">
					What's one thing you commit to doing during this mentoring session?
				</p>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={3}
					placeholder="Example: I'll be honest about what's not working / I'll ask for specific examples / I'll take notes on key insights / I'll stay open even if feedback is hard to hear..."
					value={formData.commitment}
					onChange={(e) => handleInputChange("commitment", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-4">
					How ready do I feel for this session? (1-10)
				</label>
				<div className="flex items-center gap-4">
					<span className="text-sm text-gray-500">Not Ready</span>
					<input
						type="range"
						min="1"
						max="10"
						value={formData.readiness_level}
						onChange={(e) =>
							handleInputChange("readiness_level", parseInt(e.target.value))
						}
						className="flex-1"
						style={{
							accentColor: "#5B9378",
						}}
					/>
					<span className="text-sm text-gray-500">Fully Ready</span>
					<span className="ml-4 font-bold text-green-700 min-w-[2rem] text-center">
						{formData.readiness_level}
					</span>
				</div>
			</div>
		</div>
	);

	const renderCurrentStep = () => {
		switch (currentStep) {
			case 1:
				return renderMentalPreparation();
			case 2:
				return renderWhatIBring();
			case 3:
				return renderSessionVision();
			default:
				return renderMentalPreparation();
		}
	};

	const renderNavigationButtons = () => (
		<div className="flex justify-between gap-4 mt-8">
			<button
				onClick={handlePrevious}
				disabled={currentStep === 1}
				className="flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				style={{
					backgroundColor: currentStep === 1 ? "#e5e7eb" : "#ffffff",
					color: currentStep === 1 ? "#9ca3af" : "#5C7F4F",
					border: `2px solid ${currentStep === 1 ? "#e5e7eb" : "#5C7F4F"}`,
				}}
			>
				<ArrowLeft className="h-4 w-4" />
				Back
			</button>

			{currentStep < steps.length ? (
				<button
					onClick={handleNext}
					className="flex items-center gap-2 px-6 py-3 font-semibold rounded-lg text-white transition-all hover:opacity-90"
					style={{
						background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
					}}
				>
					Next
					<ArrowRight className="h-4 w-4" />
				</button>
			) : (
				<button
					onClick={handleComplete}
					disabled={isSaving}
					className="flex items-center gap-2 px-6 py-4 font-semibold rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
					style={{
						background: isSaving
							? "linear-gradient(135deg, #9ca3af, #6b7280)"
							: "linear-gradient(135deg, #5C7F4F, #5B9378)",
					}}
				>
					<CheckCircle className="h-5 w-5" />
					{isSaving ? "Saving..." : "Complete Preparation"}
				</button>
			)}
		</div>
	);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
		>
			<div
				ref={modalRef}
				className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
			>
				<div className="sticky top-0 bg-white z-10 px-8 pt-6 pb-4 border-b">
					<div className="flex justify-between items-start mb-4">
						<div className="flex-1">
							{renderProgressIndicator()}
						</div>
						<button
							onClick={onClose}
							className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
							aria-label="Close"
						>
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>
				</div>

				<div className="px-8 py-6">
					{renderCurrentStep()}
					{renderNavigationButtons()}
				</div>
			</div>
		</div>
	);
};

export default MentoringPrepAccessible;
