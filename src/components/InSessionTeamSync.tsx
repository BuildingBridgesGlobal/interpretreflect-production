import {
	ChevronLeft,
	ChevronRight,
	HandHeart,
	MessageSquare,
	X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { reflectionService } from "../services/reflectionService";

import {
	HeartPulseIcon,
	TargetIcon,
} from "./CustomIcon";

interface InSessionTeamSyncProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

export const InSessionTeamSync: React.FC<InSessionTeamSyncProps> = ({
	onClose,
	onComplete,
}) => {
	const { user } = useAuth();
	const [currentSection, setCurrentSection] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [hasSaved, setHasSaved] = useState(false);
	const [showSummary, setShowSummary] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const startTime = Date.now();

	// Form state for all fields
	const [formData, setFormData] = useState({
		// Quick check-in fields
		my_feeling: "",
		team_support_check: "",
		what_needs_adjusting: "",
		commitment_action: "",
	});

	// Section definitions - streamlined for quick check-in
	const sections = [
		{
			title: "How Am I Doing?",
			icon: <HeartPulseIcon size={20} />,
			guidance: "Take a moment to check in with yourself. How are you feeling physically and mentally right now?",
			fields: [
				{
					id: "my_feeling",
					label: "How am I feeling right now?",
					type: "textarea",
					placeholder: "Example: Energized and focused / Starting to feel fatigued / Handling the content well / Finding this challenging...",
					required: true,
					rows: 3,
				},
			],
		},
		{
			title: "Team Support Check",
			icon: <HandHeart className="w-5 h-5" style={{ color: "#5B9378" }} />,
			guidance: "Strong teams communicate openly about what's working and what needs attention.",
			fields: [
				{
					id: "team_support_check",
					label: "How is our team support working?",
					type: "textarea",
					placeholder: "Example: Handoffs are smooth / Communication is clear / We're supporting each other well / I need more support with... / My partner might need...",
					required: true,
					rows: 3,
				},
			],
		},
		{
			title: "Quick Adjustments",
			icon: <TargetIcon size={20} />,
			guidance: "Small adjustments during an assignment can make a big difference for you, your team, and the people you're serving.",
			fields: [
				{
					id: "what_needs_adjusting",
					label: "What (if anything) needs adjusting?",
					type: "textarea",
					placeholder: "Example: Switch roles more frequently / Adjust positioning / Share specific terminology / Take a quick break / Everything is working well...",
					required: true,
					rows: 3,
				},
			],
		},
		{
			title: "Moving Forward",
			icon: <MessageSquare className="w-5 h-5" style={{ color: "#5B9378" }} />,
			guidance: "What's one thing you'll focus on to keep your team working effectively?",
			fields: [
				{
					id: "commitment_action",
					label: "My commitment for the rest of this assignment",
					type: "textarea",
					placeholder: "Example: Stay aware of my fatigue levels / Communicate more clearly about handoffs / Support my partner when content gets heavy / Maintain our current rhythm...",
					required: true,
					rows: 3,
				},
			],
		},
	];

	// Validation
	const validateSection = (sectionIndex: number): boolean => {
		const section = sections[sectionIndex];
		const newErrors: Record<string, string> = {};

		section.fields.forEach((field) => {
			if (field.required && !formData[field.id as keyof typeof formData]) {
				newErrors[field.id] = `${field.label} is required`;
			}
		});

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Navigation
	const handleNext = () => {
		if (validateSection(currentSection)) {
			if (currentSection < sections.length - 1) {
				setCurrentSection(currentSection + 1);
			} else {
				handleSubmit();
			}
		}
	};

	const handlePrevious = () => {
		if (currentSection > 0) {
			setCurrentSection(currentSection - 1);
			setErrors({});
		}
	};

	// Form submission
	const handleSubmit = async () => {
		if (!validateSection(currentSection)) return;

		if (!user) {
			setErrors({ save: "You must be logged in to save" });
			return;
		}

		// Prevent double-submission
		if (isSubmitting || hasSaved) {
			console.log(
				"InSessionTeamSync - Already saving or saved, ignoring duplicate click",
			);
			return;
		}

		console.log("InSessionTeamSync - handleSubmit called");
		console.log("InSessionTeamSync - User:", {
			id: user.id,
			email: user.email,
		});

		setIsSubmitting(true);

		try {
			const timeSpent = Math.floor((Date.now() - startTime) / 1000);
			console.log("InSessionTeamSync - Starting save...");

			// Prepare data to save
			const dataToSave = {
				...formData,
				timestamp: new Date().toISOString(),
				time_spent_seconds: timeSpent,
				module_type: "team_check_in",
				// Add fields for getDisplayName fallback
				team_sync: formData.my_feeling || "Team check-in completed",
				sync_status: formData.team_support_check,
				team_alignment: formData.commitment_action,
			};

			console.log("InSessionTeamSync - Saving with reflectionService");

			const result = await reflectionService.saveReflection(
				user.id,
				"team_sync",
				dataToSave,
			);

			if (!result.success) {
				console.error("InSessionTeamSync - Error saving:", result.error);
				throw new Error(result.error || "Failed to save reflection");
			} else {
				console.log("InSessionTeamSync - Saved successfully");
			}

			// Mark as saved to prevent double-submission
			setHasSaved(true);

			// Set submitting to false immediately after successful save
			setIsSubmitting(false);

			// Show summary
			setShowSummary(true);

			// Save to localStorage as well
			localStorage.setItem("lastTeamSync", JSON.stringify(dataToSave));

			// Log successful save
			console.log("Team Sync Results:", dataToSave);

			if (onComplete) {
				onComplete(dataToSave);
			}

			onClose();
		} catch (error) {
			console.error("InSessionTeamSync - Error in handleSubmit:", error);
			setIsSubmitting(false);
			setErrors({
				save:
					error instanceof Error
						? error.message
						: "Failed to save team sync. Please try again.",
			});
		}
	};

	// Input change handler
	const handleInputChange = (fieldId: string, value: any) => {
		setFormData((prev) => ({
			...prev,
			[fieldId]: value,
		}));

		// Clear error for this field
		if (errors[fieldId]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[fieldId];
				return newErrors;
			});
		}
	};

	// Render field based on type
	const renderField = (field: any) => {
		const value = formData[field.id as keyof typeof formData];
		const error = errors[field.id];

		switch (field.type) {
			case "textarea":
				return (
					<div key={field.id} className="mb-6">
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							{field.label}
						</label>
						<textarea
							value={value || ""}
							onChange={(e) => handleInputChange(field.id, e.target.value)}
							placeholder={field.placeholder}
							className={`w-full px-4 py-3 rounded-lg border ${
								error ? "border-red-500" : "border-gray-200"
							} focus:outline-none focus:ring-2 focus:ring-sage-500`}
							rows={field.rows || 4}
							style={{ backgroundColor: "#FFFFFF" }}
						/>
						{error && <p className="mt-1 text-sm text-red-500">{error}</p>}
					</div>
				);

			case "text":
				return (
					<div key={field.id} className="mb-6">
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							{field.label}
						</label>
						<input
							type="text"
							value={value || ""}
							onChange={(e) => handleInputChange(field.id, e.target.value)}
							placeholder={field.placeholder}
							className={`w-full px-4 py-3 rounded-lg border ${
								error ? "border-red-500" : "border-gray-200"
							} focus:outline-none focus:ring-2 focus:ring-sage-500`}
							style={{ backgroundColor: "#FFFFFF" }}
						/>
						{error && <p className="mt-1 text-sm text-red-500">{error}</p>}
					</div>
				);

			case "select":
				return (
					<div key={field.id} className="mb-6">
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							{field.label}
						</label>
						<select
							value={value || ""}
							onChange={(e) => handleInputChange(field.id, e.target.value)}
							className={`w-full px-4 py-3 rounded-lg border ${
								error ? "border-red-500" : "border-gray-200"
							} focus:outline-none focus:ring-2 focus:ring-sage-500`}
							style={{ backgroundColor: "#FFFFFF" }}
						>
							{field.options.map((option: any) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						{error && <p className="mt-1 text-sm text-red-500">{error}</p>}
					</div>
				);

			case "slider":
				return (
					<div key={field.id} className="mb-6">
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							{field.label}
						</label>
						<div className="flex items-center space-x-4">
							<span className="text-sm" style={{ color: "#5F7F55" }}>
								{field.min}
							</span>
							<input
								type="range"
								min={field.min}
								max={field.max}
								step={field.step}
								value={value || field.min}
								onChange={(e) =>
									handleInputChange(field.id, parseInt(e.target.value))
								}
								className="flex-1"
								style={{
									accentColor: "#5B9378",
								}}
							/>
							<span className="text-sm" style={{ color: "#5F7F55" }}>
								{field.max}
							</span>
							<span
								className="ml-4 px-3 py-1 rounded-full text-sm font-medium"
								style={{ backgroundColor: "#E8F0E8", color: "#5C7F4F" }}
							>
								{value}
							</span>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	const currentSectionData = sections[currentSection];
	const progress = ((currentSection + 1) / sections.length) * 100;

	// Debug logging
	console.log("Current section:", currentSection);
	console.log("Total sections:", sections.length);
	console.log("Is last section?", currentSection === sections.length - 1);
	console.log(
		"Button should show:",
		currentSection === sections.length - 1 ? "Complete Sync" : "Next",
	);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
		>
			<div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
				{/* Header */}
				<div
					className="px-8 py-6 border-b flex-shrink-0"
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
								<HandHeart className="w-6 h-6 text-white" />
							</div>
							<div>
								<h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
									Team Check-In
								</h2>
								<p className="text-sm mt-1" style={{ color: "#5F7F55" }}>
									A quick mid-assignment check to keep your team working smoothly
								</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="p-2 rounded-lg transition-all hover:opacity-90"
							style={{
								background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
							}}
							aria-label="Close"
						>
							<X className="w-5 h-5 text-white" />
						</button>
					</div>

					{/* Mentoring Guidance */}
					<div
						className="mt-4 p-3 rounded-lg"
						style={{ backgroundColor: "#E8F0E8" }}
					>
						<p className="text-sm" style={{ color: "#5C7F4F" }}>
							<strong>Quick Tip:</strong> Taking a few minutes during a break to check in with yourself and your team can prevent small issues from becoming bigger ones. This helps ensure the people you're interpreting for get the best possible experience.
						</p>
					</div>

					{/* Progress Bar */}
					<div className="mt-4">
						<div className="flex justify-between text-sm mb-2">
							<span style={{ color: "#5F7F55" }}>
								Section {currentSection + 1} of {sections.length}
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
				<div className="px-8 py-6 overflow-y-auto flex-grow">
					<div className="flex items-center mb-4">
						<div
							className="p-2 rounded-lg mr-3"
							style={{ backgroundColor: "#E8F0E8" }}
						>
							{currentSectionData.icon}
						</div>
						<h3 className="text-xl font-semibold" style={{ color: "#5C7F4F" }}>
							{currentSectionData.title}
						</h3>
					</div>

					{/* Mentoring guidance for this section */}
					<p className="text-sm mb-6" style={{ color: "#6B7280" }}>
						{currentSectionData.guidance}
					</p>

					{currentSectionData.fields.map(renderField)}
				</div>

				{/* Footer */}
				<div
					className="px-8 py-4 border-t flex-shrink-0"
					style={{ backgroundColor: "#FAF9F6" }}
				>
					<div className="flex justify-between">
						<button
							onClick={handlePrevious}
							disabled={currentSection === 0}
							className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center
                ${
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
							disabled={isSubmitting || hasSaved || showSummary}
							className="px-6 py-2 rounded-lg font-medium text-white transition-all flex items-center hover:opacity-90"
							style={{
								background:
									isSubmitting || hasSaved || showSummary
										? "#CCCCCC"
										: "linear-gradient(135deg, #5C7F4F, #5B9378)",
								opacity: isSubmitting || hasSaved || showSummary ? 0.5 : 1,
								cursor:
									isSubmitting || hasSaved || showSummary
										? "not-allowed"
										: "pointer",
							}}
						>
							{isSubmitting ? (
								"Saving..."
							) : currentSection === sections.length - 1 ? (
								"Complete Sync"
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
