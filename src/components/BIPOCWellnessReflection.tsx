/**
 * BIPOC Interpreter Wellness Component
 * 
 * A supportive space for Black, Indigenous, and People of Color interpreters
 * to process their unique experiences and prioritize their well-being
 */

import { ChevronLeft, ChevronRight, Heart, Shield, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { reflectionService } from "../services/reflectionService";

interface BIPOCWellnessData {
	// Page 1: Your Experience
	how_feeling: string;
	what_happened: string;
	
	// Page 2: Your Needs & Strengths
	what_you_needed: string;
	your_strengths: string;
	
	// Page 3: Moving Forward
	self_affirmation: string;
	commitment: string;
	
	timestamp: string;
}

interface BIPOCWellnessReflectionProps {
	onClose: () => void;
	onComplete?: (data: BIPOCWellnessData) => void;
}

const BIPOCWellnessReflection: React.FC<BIPOCWellnessReflectionProps> = ({
	onClose,
	onComplete,
}) => {
	const { user } = useAuth();
	const [currentSection, setCurrentSection] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const modalRef = useRef<HTMLDivElement>(null);

	// Scroll to top on mount
	useEffect(() => {
		modalRef.current?.scrollTo(0, 0);
	}, []);

	// Form state
	const [formData, setFormData] = useState<BIPOCWellnessData>({
		how_feeling: "",
		what_happened: "",
		what_you_needed: "",
		your_strengths: "",
		self_affirmation: "",
		commitment: "",
		timestamp: new Date().toISOString(),
	});

	const validateSection = (sectionIndex: number): boolean => {
		const newErrors: Record<string, string> = {};

		switch (sectionIndex) {
			case 0: // Your Experience
				if (!formData.how_feeling.trim()) {
					newErrors.how_feeling = "Please share how you're feeling";
				}
				break;
			case 1: // Your Needs & Strengths
				if (!formData.what_you_needed.trim()) {
					newErrors.what_you_needed = "Please share what you needed";
				}
				break;
			case 2: // Moving Forward
				if (!formData.self_affirmation.trim()) {
					newErrors.self_affirmation = "Please write an affirmation for yourself";
				}
				break;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		if (!validateSection(currentSection)) {
			return;
		}

		if (currentSection < sections.length - 1) {
			setCurrentSection(currentSection + 1);
			setErrors({});
		} else {
			handleComplete();
		}
	};

	const handlePrevious = () => {
		if (currentSection > 0) {
			setCurrentSection(currentSection - 1);
			setErrors({});
		}
	};

	const handleComplete = async () => {
		if (!validateSection(currentSection)) {
			return;
		}

		if (!user) {
			setErrors({ save: "You must be logged in to save reflections" });
			return;
		}

		if (isSaving) return;

		setIsSaving(true);

		try {
			const dataToSave = {
				...formData,
				timestamp: new Date().toISOString(),
			};

			const result = await reflectionService.saveReflection(
				user.id,
				"bipoc_wellness",
				dataToSave,
			);

			if (!result.success) {
				throw new Error(result.error || "Failed to save reflection");
			}

			setIsSaving(false);

			if (onComplete) {
				onComplete(dataToSave);
			}

			setTimeout(() => {
				onClose();
			}, 100);
		} catch (error) {
			setIsSaving(false);
			setErrors({
				save:
					error instanceof Error
						? error.message
						: "Failed to save reflection. Please try again.",
			});
		}
	};

	const handleFieldChange = (field: keyof BIPOCWellnessData, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		// Clear error for this field
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	const sections = [
		{
			title: "Your Experience",
			icon: <Heart className="w-5 h-5" style={{ color: "#5B9378" }} />,
			guidance: "Name what's present for you",
			content: (
				<div className="space-y-6">
					<div
						className="p-4 rounded-lg"
						style={{ backgroundColor: "#F5F9F6" }}
					>
						<p className="text-sm" style={{ color: "#5C7F4F" }}>
							This is a space for you. You don't need to explain or justify your experience.
						</p>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How are you feeling right now?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Name what's present - physically, emotionally
						</p>
						<textarea
							value={formData.how_feeling}
							onChange={(e) => handleFieldChange("how_feeling", e.target.value)}
							placeholder="Example: Tired and carrying a lot / Frustrated but still showing up / Proud of how I handled it"
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.how_feeling ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.how_feeling && (
							<p className="text-sm text-red-600 mt-1">{errors.how_feeling}</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What happened today?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							You don't have to share everything - just what feels important
						</p>
						<textarea
							value={formData.what_happened}
							onChange={(e) => handleFieldChange("what_happened", e.target.value)}
							placeholder="Example: Had to explain my cultural perspective again / Felt invisible in the team meeting / Someone finally got it"
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: "#E8E5E0",
							}}
						/>
					</div>
				</div>
			),
		},
		{
			title: "Your Needs & Strengths",
			icon: <Shield className="w-5 h-5" style={{ color: "#5B9378" }} />,
			guidance: "Honor what you need and what you bring",
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What did you need today?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							It's okay to name what was missing
						</p>
						<textarea
							value={formData.what_you_needed}
							onChange={(e) => handleFieldChange("what_you_needed", e.target.value)}
							placeholder="Example: To be seen and valued / Someone to understand without explaining / Space to just be myself"
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.what_you_needed ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.what_you_needed && (
							<p className="text-sm text-red-600 mt-1">{errors.what_you_needed}</p>
						)}
					</div>

					<div
						className="p-4 rounded-lg"
						style={{ backgroundColor: "#F5F9F6" }}
					>
						<p className="text-sm" style={{ color: "#5C7F4F" }}>
							<strong>Your cultural identity is a strength.</strong> It brings perspective, resilience, and wisdom to your work.
						</p>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What strengths did you bring today?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Name the gifts you carry - cultural, personal, professional
						</p>
						<textarea
							value={formData.your_strengths}
							onChange={(e) => handleFieldChange("your_strengths", e.target.value)}
							placeholder="Example: My ability to bridge cultures / My resilience / My perspective that others don't see"
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: "#E8E5E0",
							}}
						/>
					</div>
				</div>
			),
		},
		{
			title: "Moving Forward",
			icon: <Heart className="w-5 h-5" style={{ color: "#5B9378" }} />,
			guidance: "You deserve care and support",
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Speak a truth to yourself
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							What do you need to hear right now?
						</p>
						<textarea
							value={formData.self_affirmation}
							onChange={(e) => handleFieldChange("self_affirmation", e.target.value)}
							placeholder="Example: I belong in this profession / My experience and perspective matter / I don't have to prove myself"
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.self_affirmation ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.self_affirmation && (
							<p className="text-sm text-red-600 mt-1">{errors.self_affirmation}</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What's one thing you'll do for yourself?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Small or big - what would support you?
						</p>
						<textarea
							value={formData.commitment}
							onChange={(e) => handleFieldChange("commitment", e.target.value)}
							placeholder="Example: I'll reach out for support / I'll take time to rest / I'll honor my boundaries"
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: "#E8E5E0",
							}}
						/>
					</div>

					<div
						className="p-4 rounded-lg"
						style={{ backgroundColor: "#F5F9F6" }}
					>
						<p className="text-sm" style={{ color: "#5C7F4F" }}>
							<strong>You are valued.</strong> Your presence and perspective make this profession better.
						</p>
					</div>
				</div>
			),
		},
	];

	const currentSectionData = sections[currentSection];
	const progress = ((currentSection + 1) / sections.length) * 100;

	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
			style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
		>
			<div
				ref={modalRef}
				className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
			>
				{/* Header */}
				<div
					className="sticky top-0 bg-white z-10 px-8 pt-6 pb-4 border-b"
					style={{ backgroundColor: "#FFFFFF" }}
				>
					<div className="flex items-start justify-between mb-4">
						<div className="flex items-start">
							<div
								className="p-3 rounded-lg mr-4"
								style={{
									background: "linear-gradient(135deg, #5B9378 0%, #7BA88D 100%)",
								}}
							>
								<Heart className="w-6 h-6 text-white" />
							</div>
							<div>
								<h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
									BIPOC Interpreter Wellness
								</h2>
								<p className="text-sm mt-1" style={{ color: "#6B7280" }}>
									A supportive space for your unique experiences
								</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
							aria-label="Close"
						>
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>

					{/* Progress Bar */}
					<div className="mt-4">
						<div className="flex justify-between text-xs mb-2">
							<span style={{ color: "#6B7280" }}>
								Page {currentSection + 1} of {sections.length}
							</span>
							<span style={{ color: "#6B7280" }}>
								{Math.round(progress)}% complete
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className="h-2 rounded-full transition-all duration-300"
								style={{
									width: `${progress}%`,
									background: "linear-gradient(90deg, #5B9378 0%, #7BA88D 100%)",
								}}
							/>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="px-8 py-6">
					<div className="flex items-start mb-6">
						<div
							className="p-2 rounded-lg mr-3"
							style={{ backgroundColor: "#F5F9F6" }}
						>
							{currentSectionData.icon}
						</div>
						<div>
							<h3 className="text-xl font-semibold" style={{ color: "#5C7F4F" }}>
								{currentSectionData.title}
							</h3>
							<p className="text-sm" style={{ color: "#6B7280" }}>
								{currentSectionData.guidance}
							</p>
						</div>
					</div>

					{currentSectionData.content}

					{errors.save && (
						<div
							className="mt-4 p-4 rounded-lg"
							style={{ backgroundColor: "#FEE2E2" }}
						>
							<p className="text-sm" style={{ color: "#DC2626" }}>
								{errors.save}
							</p>
						</div>
					)}
				</div>

				{/* Footer */}
				<div
					className="sticky bottom-0 bg-white px-8 py-4 border-t"
					style={{ backgroundColor: "#F5F9F6" }}
				>
					<div className="flex justify-between">
						<button
							onClick={handlePrevious}
							disabled={currentSection === 0}
							className={`px-6 py-2 rounded-lg font-medium transition-colors ${
								currentSection === 0
									? "bg-gray-200 text-gray-400 cursor-not-allowed"
									: "bg-white text-sage-700 hover:bg-gray-50"
							}`}
						>
							<ChevronLeft className="w-4 h-4 inline mr-2" />
							Previous
						</button>

						<button
							onClick={handleNext}
							disabled={isSaving}
							className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
							style={{
								background: isSaving
									? "#CCCCCC"
									: "linear-gradient(135deg, #5B9378 0%, #7BA88D 100%)",
							}}
						>
							{isSaving ? (
								"Saving..."
							) : currentSection === sections.length - 1 ? (
								<>
									<Heart className="w-4 h-4 inline mr-2" />
									Complete
								</>
							) : (
								<>
									Next
									<ChevronRight className="w-4 h-4 inline ml-2" />
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BIPOCWellnessReflection;
