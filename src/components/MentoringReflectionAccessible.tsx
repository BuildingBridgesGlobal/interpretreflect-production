/**
 * Mentoring Reflection Component
 *
 * Matches the simple, focused design of Mentoring Prep
 * Captures learning and next steps after a mentoring session
 *
 * @module MentoringReflectionAccessible
 */

import {
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Lightbulb,
	TrendingUp,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { reflectionService } from "../services/reflectionService";

import { HeartPulseIcon, TargetIcon } from "./CustomIcon";

interface MentoringReflectionData {
	// What Happened
	how_it_went: string;
	what_stood_out: string;
	
	// What You Learned
	key_insights: string;
	what_to_apply: string;
	
	// Moving Forward
	next_steps: string;
	commitment: string;
	
	timestamp: string;
}

interface MentoringReflectionProps {
	onClose: () => void;
	onComplete?: (data: MentoringReflectionData) => void;
}

export const MentoringReflectionAccessible: React.FC<
	MentoringReflectionProps
> = ({ onClose, onComplete }) => {
	const { user } = useAuth();
	const [currentSection, setCurrentSection] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const startTime = Date.now();
	const modalRef = useRef<HTMLDivElement>(null);

	// Scroll to top on mount
	useEffect(() => {
		modalRef.current?.scrollTo({ top: 0, behavior: "instant" });
	}, []);

	// Form state
	const [formData, setFormData] = useState<MentoringReflectionData>({
		how_it_went: "",
		what_stood_out: "",
		key_insights: "",
		what_to_apply: "",
		next_steps: "",
		commitment: "",
		timestamp: new Date().toISOString(),
	});

	const validateSection = (sectionIndex: number): boolean => {
		const newErrors: Record<string, string> = {};

		switch (sectionIndex) {
			case 0: // What Happened
				if (!formData.how_it_went?.trim()) {
					newErrors.how_it_went = "Please reflect on how it went";
				}
				break;
			case 1: // What You Learned
				if (!formData.key_insights?.trim()) {
					newErrors.key_insights = "Please share your key insights";
				}
				break;
			case 2: // Moving Forward
				if (!formData.next_steps?.trim()) {
					newErrors.next_steps = "Please identify your next steps";
				}
				break;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		if (validateSection(currentSection)) {
			if (currentSection < sections.length - 1) {
				setCurrentSection(currentSection + 1);
				setErrors({});
			} else {
				handleComplete();
			}
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
			console.log("MentoringReflection - Validation failed");
			return;
		}

		if (!user) {
			setErrors({ save: "You must be logged in to save" });
			return;
		}

		if (isSaving) {
			console.log("MentoringReflection - Already saving, ignoring duplicate click");
			return;
		}

		console.log("MentoringReflection - handleComplete called");
		setIsSaving(true);

		try {
			const timeSpent = Math.floor((Date.now() - startTime) / 1000);
			console.log("MentoringReflection - Starting save...");

			const dataToSave = {
				...formData,
				timestamp: new Date().toISOString(),
				time_spent_seconds: timeSpent,
				// Add field for getDisplayName fallback
				mentoring_goals: formData.key_insights || "Mentoring reflection completed",
			};

			console.log("MentoringReflection - Saving with reflectionService");

			const result = await reflectionService.saveReflection(
				user.id,
				"mentoring_reflection",
				dataToSave,
			);

			if (!result.success) {
				console.error("MentoringReflection - Error saving:", result.error);
				throw new Error(result.error || "Failed to save reflection");
			}

			console.log("MentoringReflection - Save successful");
			setIsSaving(false);

			console.log("Mentoring Reflection Results:", dataToSave);

			if (onComplete) {
				onComplete(dataToSave);
			}

			setTimeout(() => {
				onClose();
			}, 100);
		} catch (error) {
			console.error("MentoringReflection - Error in handleComplete:", error);
			setIsSaving(false);
			setErrors({
				save:
					error instanceof Error
						? error.message
						: "Failed to save reflection. Please try again.",
			});
		}
	};

	const handleFieldChange = (field: keyof MentoringReflectionData, value: string) => {
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
			title: "What Happened",
			icon: <Lightbulb className="w-5 h-5" style={{ color: "#5B9378" }} />,
			guidance: "Capture your initial impressions while they're fresh",
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How did the mentoring session go?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Think about the overall experience - the tone, the flow, how you felt
						</p>
						<textarea
							value={formData.how_it_went}
							onChange={(e) => handleFieldChange("how_it_went", e.target.value)}
							placeholder="Example: It was really helpful and I felt heard / It was challenging but productive / I got exactly what I needed / I left feeling more confused..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.how_it_went ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.how_it_went && (
							<p className="text-sm text-red-500 mt-1">{errors.how_it_went}</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What stood out most from this session?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							What moment, insight, or exchange will you remember?
						</p>
						<textarea
							value={formData.what_stood_out}
							onChange={(e) => handleFieldChange("what_stood_out", e.target.value)}
							placeholder="Example: When my mentor shared their own experience / A specific piece of advice that clicked / Realizing I'm not alone in this / A new way of thinking about the situation..."
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
			title: "What You Learned",
			icon: <HeartPulseIcon size={20} />,
			guidance: "Capture the insights and learning while they're clear",
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What were your key insights or takeaways?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							What did you learn that you didn't know before?
						</p>
						<textarea
							value={formData.key_insights}
							onChange={(e) => handleFieldChange("key_insights", e.target.value)}
							placeholder="Example: I need to trust my instincts more / There's a technique I can try / My approach is actually working / I need to set better boundaries / It's okay to ask for help..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.key_insights ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.key_insights && (
							<p className="text-sm text-red-500 mt-1">{errors.key_insights}</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What will you apply or try differently?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Turn insights into action - what will you actually do?
						</p>
						<textarea
							value={formData.what_to_apply}
							onChange={(e) => handleFieldChange("what_to_apply", e.target.value)}
							placeholder="Example: Try the technique my mentor suggested / Start preparing differently / Speak up more in team situations / Practice the skill we discussed / Change my approach to..."
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
			icon: <TargetIcon size={20} />,
			guidance: "Set yourself up for continued growth",
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What are your next steps?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							What specific actions will you take based on this session?
						</p>
						<textarea
							value={formData.next_steps}
							onChange={(e) => handleFieldChange("next_steps", e.target.value)}
							placeholder="Example: Practice the new technique in my next assignment / Schedule a follow-up session / Read the resource my mentor recommended / Reach out to my mentor if I have questions..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.next_steps ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.next_steps && (
							<p className="text-sm text-red-500 mt-1">{errors.next_steps}</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What's your commitment to yourself?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							What's one thing you commit to doing as a result of this mentoring?
						</p>
						<textarea
							value={formData.commitment}
							onChange={(e) => handleFieldChange("commitment", e.target.value)}
							placeholder="Example: I'll try the new approach at least three times / I'll be more patient with myself / I'll reach out when I need support / I'll practice this skill daily..."
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
	];

	const currentSectionData = sections[currentSection];
	const progress = ((currentSection + 1) / sections.length) * 100;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
		>
			<div
				ref={modalRef}
				className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
			>
				{/* Header */}
				<div
					className="sticky top-0 bg-white z-10 px-8 pt-6 pb-4 border-b"
					style={{ backgroundColor: "#FAF9F6" }}
				>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div
								className="w-12 h-12 rounded-lg flex items-center justify-center"
								style={{
									background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
								}}
							>
								<TrendingUp className="w-6 h-6 text-white" />
							</div>
							<div>
								<h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
									Mentoring Reflection
								</h2>
								<p className="text-sm mt-1" style={{ color: "#5F7F55" }}>
									Capture what you learned and plan your next steps
								</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="p-2 rounded-lg transition-all hover:bg-gray-100"
							aria-label="Close"
						>
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>

					{/* Progress Bar */}
					<div className="mt-4">
						<div className="flex justify-between text-sm mb-2">
							<span style={{ color: "#5F7F55" }}>
								Page {currentSection + 1} of {sections.length}
							</span>
							<span style={{ color: "#5F7F55" }}>
								{Math.round(progress)}% Complete
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className="h-full rounded-full transition-all duration-300"
								style={{
									width: `${progress}%`,
									background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
								}}
							/>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="px-8 py-6">
					<div className="flex items-center mb-4">
						<div
							className="p-2 rounded-lg mr-3"
							style={{ backgroundColor: "#E8F0E8" }}
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
					className="sticky bottom-0 px-8 py-4 border-t"
					style={{ backgroundColor: "#FAF9F6" }}
				>
					<div className="flex justify-between">
						<button
							onClick={handlePrevious}
							disabled={currentSection === 0}
							className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center ${
								currentSection === 0
									? "bg-gray-100 text-gray-400 cursor-not-allowed"
									: "bg-white border border-sage-600 text-sage-700 hover:bg-sage-50"
							}`}
						>
							<ChevronLeft className="w-4 h-4 mr-2" />
							Previous
						</button>

						<button
							onClick={handleNext}
							disabled={isSaving}
							className="px-6 py-2 rounded-lg font-medium text-white transition-all flex items-center hover:opacity-90 disabled:opacity-50"
							style={{
								background: isSaving
									? "#CCCCCC"
									: "linear-gradient(135deg, #5C7F4F, #5B9378)",
								cursor: isSaving ? "not-allowed" : "pointer",
							}}
						>
							{isSaving ? (
								"Saving..."
							) : currentSection === sections.length - 1 ? (
								<>
									<CheckCircle className="w-4 h-4 mr-2" />
									Complete Reflection
								</>
							) : (
								<>
									Next
									<ChevronRight className="w-4 h-4 ml-2" />
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MentoringReflectionAccessible;
