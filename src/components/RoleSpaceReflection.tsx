/**
 * Role-Space Reflection Component
 *
 * Helps interpreters clarify and honor professional boundaries after each assignment
 * Follows the exact design pattern of In-Session Team Sync with sage green color scheme
 *
 * @module RoleSpaceReflection
 */

import {
	AlertTriangle,
	Check,
	ChevronLeft,
	ChevronRight,
	Compass,
	Sparkles,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { reflectionService } from "../services/reflectionService";

import {
	CommunityIcon,
	HeartPulseIcon,
	NotepadIcon,
	SecureLockIcon,
	TargetIcon,
} from "./CustomIcon";

interface RoleSpaceReflectionProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

const RoleSpaceReflection: React.FC<RoleSpaceReflectionProps> = ({
	onClose,
	onComplete,
}) => {
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
		// Prompt 1: Role Intention
		role_intention: "",
		role_shift: "",

		// Prompt 2: Boundary Pressure
		boundary_pressure: "",
		pressure_response: "",

		// Prompt 3: Emotional Awareness
		emotional_awareness: "",
		emotional_influence: "",

		// Prompt 4: Values Tension
		values_tension: "",
		tension_navigation: "",

		// Prompt 5: Role Communication
		role_communication: "",
		misunderstandings: "",

		// Prompt 6: Emotional Intelligence
		strategies_used: "",
		boundary_maintenance: "",

		// Prompt 7: Experience Reflection
		experience_feeling: "",
		energy_impact: "",

		// Prompt 8: Future Insight
		future_insight: "",
		adjustment_practice: "",
	});

	// Section definitions with 8 prompts
	const sections = [
		{
			title: "Your Role & How It Shifted",
			icon: <Compass className="w-5 h-5" style={{ color: "#5B9378" }} />,
			fields: [
				{
					id: "role_intention",
					label:
						"What role were you planning to play? (For example: a neutral conduit passing information, a facilitator helping communication flow, or an advocate supporting someone's needs)",
					type: "textarea",
					placeholder: "Describe what you intended to do in this assignment...",
					required: true,
				},
				{
					id: "role_shift",
					label:
						"Did that role change at any point? If so, when did it shift and why?",
					type: "textarea",
					placeholder: "Tell us if your role changed during the assignment and what prompted that...",
					required: true,
				},
			],
		},
		{
			title: "Staying in Your Lane",
			icon: <SecureLockIcon size={64} />,
			fields: [
				{
					id: "boundary_pressure",
					label:
						"Were there moments when you felt pushed to step outside your professional role? (Like being asked to give advice instead of interpreting, or feeling like you should help in a way that wasn't your job)",
					type: "textarea",
					placeholder: "Tell us about any times you felt pressure to go beyond your role...",
					required: true,
				},
				{
					id: "pressure_response",
					label: "How did you handle that pressure? What feelings came up for you?",
					type: "textarea",
					placeholder: "Describe what you did and how you felt...",
					required: true,
				},
			],
		},
		{
			title: "Your Emotions & Choices",
			icon: <HeartPulseIcon size={64} />,
			fields: [
				{
					id: "emotional_awareness",
					label:
						"How did being aware of your own emotions affect the choices you made while interpreting?",
					type: "textarea",
					placeholder:
						"Tell us how your feelings influenced your decisions...",
					required: true,
				},
				{
					id: "emotional_influence",
					label: "Did your emotions affect how you handled ethical situations? In what ways?",
					type: "textarea",
					placeholder: "Describe how your feelings impacted your ethical choices...",
					required: true,
				},
			],
		},
		{
			title: "When Values Clash",
			icon: <NotepadIcon size={64} />,
			fields: [
				{
					id: "values_tension",
					label:
						"Did you feel any tension between what you believe is right, what the professional guidelines say, and what the participants wanted from you?",
					type: "textarea",
					placeholder: "Describe any moments where these things didn't align...",
					required: true,
				},
				{
					id: "tension_navigation",
					label: "How did you work through that tension?",
					type: "textarea",
					placeholder: "Tell us how you handled the situation...",
					required: true,
				},
			],
		},
		{
			title: "Setting Expectations",
			icon: <CommunityIcon size={64} />,
			fields: [
				{
					id: "role_communication",
					label:
						"How did you explain or clarify your role to the people you were working with?",
					type: "textarea",
					placeholder: "Describe how you communicated what you could and couldn't do...",
					required: true,
				},
				{
					id: "misunderstandings",
					label: "Were there any mix-ups about your role? How did you clear them up?",
					type: "textarea",
					placeholder: "Tell us about any confusion and how you resolved it...",
					required: true,
				},
			],
		},
		{
			title: "What Helped You Cope",
			icon: <TargetIcon size={64} />,
			fields: [
				{
					id: "strategies_used",
					label:
						"What did you do to handle the stressful or tough moments? What skills or strategies did you lean on?",
					type: "textarea",
					placeholder: "List the ways you managed stress or challenges...",
					required: true,
				},
				{
					id: "boundary_maintenance",
					label:
						"How did these strategies help you stay in your professional role or adjust when needed?",
					type: "textarea",
					placeholder: "Connect your coping strategies to maintaining your boundaries...",
					required: true,
				},
			],
		},
		{
			title: "How It Felt Overall",
			icon: <AlertTriangle className="w-5 h-5" style={{ color: "#5B9378" }} />,
			fields: [
				{
					id: "experience_feeling",
					label:
						"How did you feel about being there and doing this work?",
					type: "textarea",
					placeholder: "Share your overall feelings about the experience...",
					required: true,
				},
				{
					id: "energy_impact",
					label:
						"Did this leave you feeling energized, drained, uneasy, or something else?",
					type: "textarea",
					placeholder: "Describe how this affected your energy and well-being...",
					required: true,
				},
			],
		},
		{
			title: "Taking It Forward",
			icon: <Sparkles className="w-5 h-5" style={{ color: "#5B9378" }} />,
			fields: [
				{
					id: "future_insight",
					label: "What's one thing you learned from this that you'll carry forward?",
					type: "textarea",
					placeholder: "Share your biggest takeaway...",
					required: true,
				},
				{
					id: "adjustment_practice",
					label:
						"What's one small thing you want to do differently next time to protect your role and your well-being?",
					type: "textarea",
					placeholder: "Name one specific change you want to practice...",
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
		if (!validateSection(currentSection)) return;
		if (!user) {
			console.error("No user logged in");
			return;
		}

		// Prevent double-submission
		if (isSubmitting || hasSaved) {
			console.log(
				"RoleSpaceReflection - Already saving or saved, ignoring duplicate click",
			);
			return;
		}

		console.log("RoleSpaceReflection - handleSubmit called");
		console.log("RoleSpaceReflection - User:", {
			id: user.id,
			email: user.email,
		});

		setIsSubmitting(true);
		setErrors({});

		try {
			// Calculate time spent
			const timeSpent = Math.round((Date.now() - startTime) / 1000);

			console.log("RoleSpaceReflection - Starting save...");

			// Prepare data to save
			const dataToSave = {
				...formData,
				completed_at: new Date().toISOString(),
				time_spent_seconds: timeSpent,
				// Add field for getDisplayName fallback (matches what's checked in reflectionTypes.ts)
				role_space:
					formData.role_intention ||
					formData.role_shift ||
					"Role-space reflection completed",
			};

			console.log("RoleSpaceReflection - Saving with reflectionService");

			const result = await reflectionService.saveReflection(
				user.id,
				"role_space_reflection",
				dataToSave,
			);

			if (!result.success) {
				console.error("RoleSpaceReflection - Error saving:", result.error);
				throw new Error(result.error || "Failed to save reflection");
			} else {
				console.log("RoleSpaceReflection - Saved successfully");

				// Mark as saved to prevent double-submission
				setHasSaved(true);

				// Show summary
				setShowSummary(true);
				console.log("Role-Space Reflection Results:", dataToSave);

				// Complete after delay
				setTimeout(() => {
					if (onComplete) {
						onComplete(dataToSave);
					}
					onClose();
				}, 2000);
			}

			// Set submitting to false immediately after successful save
			setIsSubmitting(false);

			// Skip growth insights update - it hangs due to Supabase client
			console.log(
				"RoleSpaceReflection - Skipping growth insights update (uses hanging Supabase client)",
			);
		} catch (error) {
			console.error("RoleSpaceReflection - Error in handleSubmit:", error);
			setIsSubmitting(false);
			setErrors({
				save:
					error instanceof Error
						? error.message
						: "Failed to save reflection. Please try again.",
			});
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
							style={{ color: "#5C7F4F" }}
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
							<input
								type="range"
								min={field.min}
								max={field.max}
								step={field.step}
								value={formData[field.id as keyof typeof formData] || field.min}
								onChange={(e) =>
									handleInputChange(field.id, parseInt(e.target.value))
								}
								className="flex-1"
								style={{
									accentColor: "#5B9378",
								}}
							/>
							<span
								className="text-lg font-semibold px-3 py-1 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5B9378",
									minWidth: "3rem",
									textAlign: "center" as const,
								}}
							>
								{formData[field.id as keyof typeof formData] || field.min}
							</span>
						</div>
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
									background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
									boxShadow: "0 2px 8px rgba(107, 139, 96, 0.3)",
								}}
							>
								<SecureLockIcon size={64} />
							</div>
							<div>
								<h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
									Role-Space Reflection
								</h2>
								<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
									Understanding Your Professional Role & Boundaries
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
										minWidth: "30px",
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

					{/* Affirmation at the end */}
					{isLastSection && (
						<div
							className="mt-8 p-6 rounded-xl border-2"
							style={{
								backgroundColor: "rgba(107, 139, 96, 0.05)",
								borderColor: "rgba(107, 139, 96, 0.2)",
							}}
						>
							<div className="flex items-start space-x-3">
								<HeartPulseIcon size={20} />
								<div>
									<h4
										className="font-semibold mb-2"
										style={{ color: "#5C7F4F" }}
									>
										Affirmation
									</h4>
									<p
										className="text-sm leading-relaxed"
										style={{ color: "#5A5A5A" }}
									>
										Understanding my role, emotions, and boundaries helps me do this work with integrity while also protecting my energy and well-being.
									</p>
								</div>
							</div>
						</div>
					)}
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
								background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
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
							onClick={handleSubmit}
							disabled={isSubmitting || hasSaved || showSummary}
							className="px-6 py-2 rounded-lg flex items-center transition-all"
							style={{
								background:
									isSubmitting || hasSaved || showSummary
										? "#CCCCCC"
										: "linear-gradient(135deg, #5C7F4F, #5B9378)",
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

export default RoleSpaceReflection;
