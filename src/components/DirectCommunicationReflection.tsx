/**
 * Supporting Direct Communication Reflection Component
 *
 * Helps interpreters reflect on how they support direct and respectful communication
 * Follows the exact design pattern of structured reflections with sage green color scheme
 *
 * @module DirectCommunicationReflection
 */

import {
	ArrowRightLeft,
	Check,
	ChevronLeft,
	ChevronRight,
	Eye,
	Sparkles,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { reflectionService } from "../services/reflectionService";

import {
	ChatBubbleIcon,
	CommunityIcon,
	HeartPulseIcon,
	TargetIcon,
} from "./CustomIcon";

interface DirectCommunicationReflectionProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

export const DirectCommunicationReflection: React.FC<
	DirectCommunicationReflectionProps
> = ({ onClose, onComplete }) => {
	const { user } = useAuth();
	const [currentSection, setCurrentSection] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [hasSaved, setHasSaved] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [showSummary, setShowSummary] = useState(false);
	const startTime = Date.now();
	const modalRef = useRef<HTMLDivElement>(null);

	// Scroll to top on mount
	useEffect(() => {
		modalRef.current?.scrollTo({ top: 0, behavior: "instant" });
	}, []);

	// Handle Escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [onClose]);

	// Form state for all fields
	const [formData, setFormData] = useState({
		// Prompt 1: Creating Opportunities
		opportunities_created: "",
		role_expansion: "",

		// Prompt 2: Difficult Communication
		difficult_intervention: "",
		intervention_transparency: "",

		// Prompt 3: Direct Address
		direct_address: "",
		flow_maintenance: "",

		// Prompt 4: Supporting Independence
		support_choices: "",
		independence_impact: "",

		// Prompt 5: Balance and Representation
		accuracy_balance: "",
		perspective_representation: "",

		// Growth Prompt
		growth_action: "",
		future_intention: "",
	});

	// Section definitions with prompts organized into logical groups
	const sections = [
		{
			title: "Creating Space for Expression",
			icon: <ChatBubbleIcon size={64} />,
			fields: [
				{
					id: "opportunities_created",
					label:
						"Did I create opportunities for participants to express themselves directly?",
					type: "textarea",
					placeholder: "Reflect on how you facilitated direct expression...",
					required: true,
				},
				{
					id: "role_expansion",
					label:
						"Did I unintentionally take on more than a facilitative role? If so, describe.",
					type: "textarea",
					placeholder:
						"Consider moments where your role may have expanded beyond facilitation...",
					required: true,
				},
			],
		},
		{
			title: "Managing Difficult Communication",
			icon: <ArrowRightLeft className="w-5 h-5" style={{ color: "#5B9378" }} />,
			fields: [
				{
					id: "difficult_intervention",
					label: "When communication became difficult, how did I step in?",
					type: "textarea",
					placeholder:
						"Describe your approach to challenging communication moments...",
					required: true,
				},
				{
					id: "intervention_transparency",
					label:
						"Was my involvement transparent, professional, and respectful of each person's ability to communicate for themselves?",
					type: "textarea",
					placeholder:
						"Assess the transparency and respect in your interventions...",
					required: true,
				},
			],
		},
		{
			title: "Facilitating Direct Connection",
			icon: <CommunityIcon size={64} />,
			fields: [
				{
					id: "direct_address",
					label:
						"Were there moments where I needed to encourage participants to address one another (rather than me)?",
					type: "textarea",
					placeholder: "Identify instances where redirection was needed...",
					required: true,
				},
				{
					id: "flow_maintenance",
					label: "How did this help maintain the flow of direct communication?",
					type: "textarea",
					placeholder: "Reflect on the impact of encouraging direct address...",
					required: true,
				},
			],
		},
		{
			title: "Supporting Independence",
			icon: <Eye className="w-5 h-5" style={{ color: "#5B9378" }} />,
			fields: [
				{
					id: "support_choices",
					label:
						"How did my choices support participants' ability to guide their own communication?",
					type: "textarea",
					placeholder: "Describe choices that promoted independence...",
					required: true,
				},
				{
					id: "independence_impact",
					label:
						"Were there ways I unintentionally limited their independence? If so, how?",
					type: "textarea",
					placeholder:
						"Consider any limitations you may have inadvertently created...",
					required: true,
				},
			],
		},
		{
			title: "Balance & Representation",
			icon: <HeartPulseIcon size={64} />,
			fields: [
				{
					id: "accuracy_balance",
					label:
						"Did I balance accuracy with adaptability, considering register, cultural nuances, and tone?",
					type: "textarea",
					placeholder:
						"Assess your balance between precision and cultural sensitivity...",
					required: true,
				},
				{
					id: "perspective_representation",
					label:
						"How did this ensure each person's perspective was fully represented?",
					type: "textarea",
					placeholder:
						"Reflect on the completeness of perspective representation...",
					required: true,
				},
			],
		},
		{
			title: "Growth & Future Practice",
			icon: <TargetIcon size={64} />,
			fields: [
				{
					id: "growth_action",
					label:
						"What is one action I can carry forward to better support participants' independence?",
					type: "textarea",
					placeholder: "Identify a specific action for improvement...",
					required: true,
				},
				{
					id: "future_intention",
					label:
						"What intention will guide my approach to supporting self-expression in my next assignment?",
					type: "textarea",
					placeholder: "Set a clear intention for future practice...",
					required: true,
				},
			],
		},
	];

	const currentSectionData = sections[currentSection];
	const isLastSection = currentSection === sections.length - 1;

	// Handle input changes
	const handleInputChange = (field: string, value: any) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
		// Clear error for this field
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	// Validate current section
	const validateSection = (sectionIndex: number): boolean => {
		const newErrors: Record<string, string> = {};
		const section = sections[sectionIndex];

		section.fields.forEach((field) => {
			if (field.required && !formData[field.id as keyof typeof formData]) {
				newErrors[field.id] = `Please complete this field`;
			}
		});

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return false;
		}
		return true;
	};

	// Handle navigation
	const handleNext = () => {
		if (validateSection(currentSection)) {
			if (currentSection < sections.length - 1) {
				setCurrentSection(currentSection + 1);
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
		}
	};

	const handlePrev = () => {
		if (currentSection > 0) {
			setCurrentSection(currentSection - 1);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	// Handle form submission
	const handleSubmit = async () => {
		console.log("DirectCommunication - handleSubmit called");
		if (!validateSection(currentSection)) {
			console.log("DirectCommunication - Validation failed");
			return;
		}
		if (!user) {
			console.error("No user logged in");
			return;
		}

		// Prevent double-submission
		if (isSubmitting || hasSaved) {
			console.log(
				"DirectCommunication - Already saving or saved, ignoring duplicate click",
			);
			return;
		}
		console.log("DirectCommunication - Starting save for user:", user.id);

		setIsSubmitting(true);
		setErrors({});

		try {
			// Calculate time spent
			const timeSpent = Math.round((Date.now() - startTime) / 1000);
			console.log("DirectCommunication - Saving with reflectionService...");

			// Prepare data to save
			const dataToSave = {
				...formData,
				completed_at: new Date().toISOString(),
				time_spent_seconds: timeSpent,
				// Add fields for getDisplayName fallback
				communication_scenario:
					formData.scenario_description ||
					formData.situation ||
					"Communication reflection completed",
				direct_communication:
					formData.conversation_type ||
					formData.communication_style ||
					"Direct communication",
				communication_approach:
					formData.approach || formData.strategy || "Supporting communication",
			};

			const result = await reflectionService.saveReflection(
				user.id,
				"direct_communication_reflection",
				dataToSave,
			);

			if (!result.success) {
				console.error("DirectCommunication - Error saving:", result.error);
				throw new Error(result.error || "Failed to save reflection");
			}

			console.log("DirectCommunication - Save successful");

			// Mark as saved to prevent double-submission
			setHasSaved(true);

			// Skip growth insights update - it hangs due to Supabase client
			// Just log for now
			console.log(
				"DirectCommunication - Skipping growth insights update (uses hanging Supabase client)",
			);

			// Show summary
			setShowSummary(true);

			// Complete after delay
			setTimeout(() => {
				if (onComplete) {
					onComplete(dataToSave);
				}
				onClose();
			}, 2000);
		} catch (error) {
			console.error("Error saving reflection:", error);
			setErrors({ save: "Failed to save reflection. Please try again." });
		} finally {
			setIsSubmitting(false);
		}
	};

	// Render field based on type
	const renderField = (field: any) => {
		switch (field.type) {
			case "textarea":
				return (
					<div key={field.id} className="mb-6">
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#2D5F3F" }}
						>
							{field.label}
						</label>
						<textarea
							value={formData[field.id as keyof typeof formData] || ""}
							onChange={(e) => handleInputChange(field.id, e.target.value)}
							placeholder={field.placeholder}
							rows={4}
							className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all resize-none"
							style={{
								borderColor: errors[field.id] ? "#EF4444" : "#E8E5E0",
								backgroundColor: "#FFFFFF",
								color: "#1A1A1A",
							}}
							onFocus={(e) => {
								e.currentTarget.style.borderColor = "#5B9378";
								e.currentTarget.style.boxShadow =
									"0 0 0 3px rgba(107, 139, 96, 0.1)";
							}}
							onBlur={(e) => {
								e.currentTarget.style.borderColor = errors[field.id]
									? "#EF4444"
									: "#E8E5E0";
								e.currentTarget.style.boxShadow = "none";
							}}
						/>
						{errors[field.id] && (
							<p className="text-sm text-red-500 mt-1">{errors[field.id]}</p>
						)}
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
			onClick={onClose}
		>
			<div
				ref={modalRef}
				className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
				style={{ backgroundColor: "#FAF9F6" }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div
					className="p-6 border-b"
					style={{
						borderColor: "#E8E5E0",
						background:
							"linear-gradient(135deg, rgba(107, 139, 96, 0.05) 0%, rgba(92, 127, 79, 0.02) 100%)",
					}}
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div
								className="w-12 h-12 rounded-xl flex items-center justify-center"
								style={{
									background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
									boxShadow: "0 2px 8px rgba(107, 139, 96, 0.3)",
								}}
							>
								<ChatBubbleIcon size={64} />
							</div>
							<div>
								<h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
									Supporting Direct Communication
								</h2>
								<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
									Reflect on facilitating respectful, independent communication
								</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="p-2 rounded-lg transition-all hover:opacity-90"
							style={{
								background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
							}}
							aria-label="Close"
						>
							<X className="w-5 h-5 text-white" />
						</button>
					</div>

					{/* Progress indicator */}
					<div className="flex items-center justify-between mt-6">
						<div className="flex space-x-2">
							{sections.map((_, index) => (
								<div
									key={index}
									className={`h-2 flex-1 rounded-full transition-all ${
										index <= currentSection ? "opacity-100" : "opacity-30"
									}`}
									style={{
										backgroundColor:
											index <= currentSection ? "#5B9378" : "#E8E5E0",
										minWidth: "40px",
									}}
								/>
							))}
						</div>
						<span className="text-sm ml-4" style={{ color: "#5A5A5A" }}>
							{currentSection + 1} of {sections.length}
						</span>
					</div>
				</div>

				{/* Content */}
				<div className="p-6 flex-1 overflow-y-auto">
					<div className="mb-4 flex items-center space-x-2">
						{currentSectionData.icon}
						<h3 className="text-xl font-semibold" style={{ color: "#1A1A1A" }}>
							{currentSectionData.title}
						</h3>
					</div>

					{/* Render fields for current section */}
					{currentSectionData.fields.map((field) => renderField(field))}
				</div>

				{/* Footer */}
				<div
					className="p-6 border-t flex justify-between items-center"
					style={{ borderColor: "#E8E5E0", backgroundColor: "#FFFFFF" }}
				>
					{currentSection > 0 && (
						<button
							onClick={handlePrev}
							className="px-6 py-2 rounded-lg flex items-center transition-colors"
							style={{
								backgroundColor: "#F8FBF6",
								color: "#5B9378",
								border: "1px solid #5B9378",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = "#F0F7F0";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "#F8FBF6";
							}}
						>
							<ChevronLeft className="w-4 h-4 mr-1" />
							Previous
						</button>
					)}

					<div className="flex-1" />

					{errors.save && (
						<p className="text-sm text-red-500 mr-4">{errors.save}</p>
					)}

					{!isLastSection ? (
						<button
							onClick={handleNext}
							className="px-6 py-2 rounded-lg flex items-center transition-all"
							style={{
								background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
								color: "#FFFFFF",
								boxShadow: "0 2px 8px rgba(107, 139, 96, 0.3)",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = "translateY(-1px)";
								e.currentTarget.style.boxShadow =
									"0 4px 12px rgba(107, 139, 96, 0.4)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = "translateY(0)";
								e.currentTarget.style.boxShadow =
									"0 2px 8px rgba(107, 139, 96, 0.3)";
							}}
						>
							Next
							<ChevronRight className="w-4 h-4 ml-1" />
						</button>
					) : (
						<button
							onClick={(e) => {
								e.preventDefault();
								console.log("BUTTON CLICKED - Direct Communication");
								handleSubmit();
							}}
							disabled={isSubmitting || hasSaved || showSummary}
							className="px-6 py-2 rounded-lg flex items-center transition-all"
							style={{
								background:
									isSubmitting || hasSaved || showSummary
										? "#CCCCCC"
										: "linear-gradient(135deg, #2D5F3F, #5B9378)",
								color: "#FFFFFF",
								boxShadow:
									isSubmitting || hasSaved || showSummary
										? "none"
										: "0 2px 8px rgba(107, 139, 96, 0.3)",
								cursor:
									isSubmitting || hasSaved || showSummary
										? "not-allowed"
										: "pointer",
							}}
							onMouseEnter={(e) => {
								if (!isSubmitting && !hasSaved && !showSummary) {
									e.currentTarget.style.transform = "translateY(-1px)";
									e.currentTarget.style.boxShadow =
										"0 4px 12px rgba(107, 139, 96, 0.4)";
								}
							}}
							onMouseLeave={(e) => {
								if (!isSubmitting && !hasSaved && !showSummary) {
									e.currentTarget.style.transform = "translateY(0)";
									e.currentTarget.style.boxShadow =
										"0 2px 8px rgba(107, 139, 96, 0.3)";
								}
							}}
						>
							{isSubmitting ? (
								<>
									<Sparkles className="w-4 h-4 mr-1 animate-spin" />
									Saving...
								</>
							) : showSummary ? (
								<>
									<Check className="w-4 h-4 mr-1" />
									Complete!
								</>
							) : (
								<>
									Complete Reflection
									<Check className="w-4 h-4 ml-1" />
								</>
							)}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default DirectCommunicationReflection;
