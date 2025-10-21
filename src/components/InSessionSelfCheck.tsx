/**
 * In-Session Self-Check Component
 *
 * Real-time monitoring tool for active work sessions
 * Helps professionals stay aware and make micro-adjustments during assignments
 *
 * Matches exact design pattern of other reflections with sage green color scheme
 * and consistent styling across all reflection components
 *
 * @module InSessionSelfCheck
 */

import {
	Activity,
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

interface InSessionSelfCheckProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

/**
 * Main Component for quick in-session self-monitoring
 * Optimized for fast, in-the-moment use during active interpreting
 */
const InSessionSelfCheck: React.FC<InSessionSelfCheckProps> = ({
	onClose,
	onComplete,
}) => {
	const { user } = useAuth();
	const [currentSection, setCurrentSection] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
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

	// Form state for all quick-check fields
	const [formData, setFormData] = useState({
		// Section 1: Current State Assessment
		demand_management: 5,
		demand_management_notes: "",

		// Section 2: Control & Strategy
		control_effectiveness: 5,
		strategy_adjustments: "",

		// Section 3: Energy & Focus
		energy_level: 5,
		focus_maintenance: "",

		// Section 4: Professional Boundaries
		boundary_maintenance: 10,
		boundary_concerns: "",
		boundary_values: "",

		// Section 5: Communication Flow
		interpretive_choices: "",
		flow_impact: 5,

		// Section 6: Cultural Navigation
		cultural_factors: "",
		cultural_success: 5,

		// Section 7: Role Integrity
		role_adherence: 10,
		role_challenges: "",
		role_decision: "",

		// Section 8: Team Support
		team_support_needed: "",
		support_urgency: 5,

		// Section 9: Emotional Management
		emotional_response: 5,
		emotional_strategies: "",

		// Section 10: Commitment & Action
		immediate_action: "",
		next_steps: "",
		overall_status: 5,

		// Metadata
		session_time: new Date().toISOString(),
		assignment_phase: "active", // pre, active, post
		timestamp: new Date().toISOString(),
	});

	const handleFieldChange = (field: string, value: string | number) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
		// Clear error for this field
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const validateSection = (sectionIndex: number): boolean => {
		const newErrors: Record<string, string> = {};

		// Most sections are optional for quick checks, but validate key commitments
		if (sectionIndex === 9) {
			// Commitment section
			if (!formData.immediate_action.trim()) {
				newErrors.immediate_action = "Please identify an immediate action";
			}
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return false;
		}
		return true;
	};

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

	const handleSubmit = async () => {
		if (!validateSection(currentSection)) return;
		if (!user) {
			setErrors({ save: "You must be logged in to save" });
			return;
		}

		// Prevent double-submission
		if (isSaving || hasSaved) {
			console.log(
				"InSessionSelfCheck - Already saving or saved, ignoring duplicate click",
			);
			return;
		}

		console.log("InSessionSelfCheck - handleSubmit called");
		console.log("InSessionSelfCheck - User:", {
			id: user.id,
			email: user.email,
		});

		setIsSaving(true);
		try {
			const timeSpent = Math.floor((Date.now() - startTime) / 1000);
			console.log("InSessionSelfCheck - Starting save...");

			// Prepare data to save
			const dataToSave = {
				...formData,
				timestamp: new Date().toISOString(),
				time_spent_seconds: timeSpent,
				sections_completed: 10,
				// Add fields for getDisplayName fallback
				self_check: formData.demand_management_notes || "Mid-assignment check-in completed",
				energy_check: formData.energy_level,
				focus_check: formData.focus_maintenance,
			};

			console.log("InSessionSelfCheck - Saving with reflectionService");

			const result = await reflectionService.saveReflection(
				user.id,
				"in_session_self_check",
				dataToSave,
			);

			if (!result.success) {
				console.error("InSessionSelfCheck - Error saving:", result.error);
				throw new Error(result.error || "Failed to save reflection");
			} else {
				console.log("InSessionSelfCheck - Saved successfully");
			}

			// Mark as saved to prevent double-submission
			setHasSaved(true);

			// Set saving to false immediately after successful save
			setIsSaving(false);

			// Skip growth insights update - it hangs due to Supabase client
			console.log(
				"InSessionSelfCheck - Skipping growth insights update (uses hanging Supabase client)",
			);

			// Show summary
			setShowSummary(true);

			// Log successful save
			console.log("In-Session Self-Check Results:", dataToSave);

			// Call onComplete if provided
			if (onComplete) {
				onComplete(dataToSave);
			}
		} catch (error) {
			console.error("InSessionSelfCheck - Error in handleSubmit:", error);
			setIsSaving(false);
			setErrors({
				save:
					error instanceof Error
						? error.message
						: "Failed to save check-in. Please try again.",
			});
		}
	};

	const generateSummary = () => {
		return `MID-ASSIGNMENT CHECK-IN SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEMAND MANAGEMENT: ${formData.demand_management}/10
CONTROL EFFECTIVENESS: ${formData.control_effectiveness}/10
ENERGY LEVEL: ${formData.energy_level}/10
BOUNDARIES: ${formData.boundary_maintenance}/10
ROLE ADHERENCE: ${formData.role_adherence}/10

IMMEDIATE ACTION:
${formData.immediate_action}

NEXT STEPS:
${formData.next_steps}

OVERALL STATUS: ${formData.overall_status}/10
    `.trim();
	};

	const sections = [
		{
			title: "Demand Management",
			icon: <Activity className="w-5 h-5" style={{ color: "#5B9378" }} />,
			content: (
				<div className="space-y-6">
					<div
						className="p-6 rounded-xl"
						style={{
							background:
								"linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)",
							border: "1px solid rgba(107, 139, 96, 0.2)",
						}}
					>
						<h3
							className="text-lg font-semibold mb-4"
							style={{ color: "#5C7F4F" }}
						>
							Quick In-Session Check
						</h3>
						<p className="mb-6" style={{ color: "#5A5A5A" }}>
							Quick check-ins during your work help you catch small issues before they become big ones. The best performers stay aware of how they're doing and make tiny adjustments in the moment. That's what separates good from great.
						</p>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How challenging or intense is this assignment right now? (1 = easy, 10 = very challenging)
						</label>
						<div className="flex items-center space-x-4">
							<input
								type="range"
								min="1"
								max="10"
								value={formData.demand_management}
								onChange={(e) =>
									handleFieldChange(
										"demand_management",
										parseInt(e.target.value),
									)
								}
								className="flex-1"
								style={{ accentColor: "#5B9378" }}
							/>
							<span
								className="text-2xl font-bold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.demand_management}
							</span>
						</div>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How are you handling these challenges? (optional)
						</label>
						<textarea
							value={formData.demand_management_notes}
							onChange={(e) =>
								handleFieldChange("demand_management_notes", e.target.value)
							}
							placeholder="Like: taking deep breaths, staying focused, asking for breaks, managing my pace..."
							rows={2}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
						/>
					</div>
				</div>
			),
		},
		{
			title: "How You're Managing",
			icon: <NotepadIcon size={64} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Is what you're doing to manage this assignment working well right now? (1-10)
						</label>
						<div className="flex items-center space-x-4">
							<input
								type="range"
								min="1"
								max="10"
								value={formData.control_effectiveness}
								onChange={(e) =>
									handleFieldChange(
										"control_effectiveness",
										parseInt(e.target.value),
									)
								}
								className="flex-1"
								style={{ accentColor: "#5B9378" }}
							/>
							<span
								className="text-2xl font-bold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.control_effectiveness}
							</span>
						</div>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What do you need to change or adjust right now?
						</label>
						<textarea
							value={formData.strategy_adjustments}
							onChange={(e) =>
								handleFieldChange("strategy_adjustments", e.target.value)
							}
							placeholder="Like: take a breath, slow down, ask for clarification, adjust my position..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
						/>
					</div>
				</div>
			),
		},
		{
			title: "Energy & Focus",
			icon: <TargetIcon size={64} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What's your energy level right now? (1 = exhausted, 10 = energized)
						</label>
						<div className="flex items-center space-x-4">
							<input
								type="range"
								min="1"
								max="10"
								value={formData.energy_level}
								onChange={(e) =>
									handleFieldChange("energy_level", parseInt(e.target.value))
								}
								className="flex-1"
								style={{ accentColor: "#5B9378" }}
							/>
							<span
								className="text-2xl font-bold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.energy_level}
							</span>
						</div>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What would help boost or maintain your energy?
						</label>
						<textarea
							value={formData.focus_maintenance}
							onChange={(e) =>
								handleFieldChange("focus_maintenance", e.target.value)
							}
							placeholder="Like: water, quick stretch, brief pause, deep breath, snack..."
							rows={2}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
						/>
					</div>
				</div>
			),
		},
		{
			title: "Professional Boundaries",
			icon: <SecureLockIcon size={64} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Are you noticing any boundary concerns right now?
						</label>
						<div className="grid grid-cols-3 gap-3">
							{[
								{ value: "10", label: "No concerns", color: "#6B8268" },
								{ value: "5", label: "Minor concern", color: "#D97706" },
								{ value: "1", label: "Significant concern", color: "#DC2626" },
							].map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() =>
										handleFieldChange(
											"boundary_maintenance",
											parseInt(option.value),
										)
									}
									className="px-4 py-3 rounded-lg font-medium transition-all text-sm"
									style={{
										backgroundColor:
											formData.boundary_maintenance === parseInt(option.value)
												? option.color
												: "#F3F4F6",
										color:
											formData.boundary_maintenance === parseInt(option.value)
												? "white"
												: "#374151",
										border: `2px solid ${
											formData.boundary_maintenance === parseInt(option.value)
												? option.color
												: "#E5E7EB"
										}`,
									}}
								>
									{option.label}
								</button>
							))}
						</div>
					</div>

					{formData.boundary_maintenance < 10 && (
						<>
							<div>
								<label
									className="block text-sm font-medium mb-2"
									style={{ color: "#5C7F4F" }}
								>
									What's happening that's making you aware you need a boundary?
								</label>
								<textarea
									value={formData.boundary_concerns}
									onChange={(e) =>
										handleFieldChange("boundary_concerns", e.target.value)
									}
									placeholder="Like: being asked to do something outside my role, feeling uncomfortable with a request, someone crossing a line..."
									rows={3}
									className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
									style={{ borderColor: "#E8E5E0" }}
								/>
							</div>

							<div>
								<label
									className="block text-sm font-medium mb-2"
									style={{ color: "#5C7F4F" }}
								>
									What personal value or limit is being challenged? (optional)
								</label>
								<textarea
									value={formData.boundary_values || ""}
									onChange={(e) =>
										handleFieldChange("boundary_values", e.target.value)
									}
									placeholder="Like: my professional role, my comfort level, my ethics, my capacity, my safety..."
									rows={2}
									className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
									style={{ borderColor: "#E8E5E0" }}
								/>
							</div>
						</>
					)}
				</div>
			),
		},
		{
			title: "How Things Are Going",
			icon: <CommunityIcon size={64} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How is the communication going between everyone? (1 = struggling, 10 = flowing smoothly)
						</label>
						<div className="flex items-center space-x-4">
							<input
								type="range"
								min="1"
								max="10"
								value={formData.flow_impact}
								onChange={(e) =>
									handleFieldChange("flow_impact", parseInt(e.target.value))
								}
								className="flex-1"
								style={{ accentColor: "#5B9378" }}
							/>
							<span
								className="text-2xl font-bold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.flow_impact}
							</span>
						</div>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What are you noticing about how things are going? (optional)
						</label>
						<textarea
							value={formData.interpretive_choices}
							onChange={(e) =>
								handleFieldChange("interpretive_choices", e.target.value)
							}
							placeholder="Like: people seem to understand each other, there's some confusion, the pace is working, someone seems frustrated..."
							rows={2}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
						/>
					</div>
				</div>
			),
		},
		{
			title: "Cultural & Communication Differences",
			icon: <Compass className="w-5 h-5" style={{ color: "#5B9378" }} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Are you noticing any cultural or communication style differences?
						</label>
						<div className="grid grid-cols-2 gap-3">
							{[
								{ value: "10", label: "Nothing notable" },
								{ value: "5", label: "Yes, noticing some" },
							].map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() =>
										handleFieldChange("cultural_success", parseInt(option.value))
									}
									className="px-4 py-3 rounded-lg font-medium transition-all text-sm"
									style={{
										backgroundColor:
											formData.cultural_success === parseInt(option.value)
												? "#6B8268"
												: "#F3F4F6",
										color:
											formData.cultural_success === parseInt(option.value)
												? "white"
												: "#374151",
										border: `2px solid ${
											formData.cultural_success === parseInt(option.value)
												? "#6B8268"
												: "#E5E7EB"
										}`,
									}}
								>
									{option.label}
								</button>
							))}
						</div>
					</div>

					{formData.cultural_success === 5 && (
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								What are you noticing or adjusting for?
							</label>
							<textarea
								value={formData.cultural_factors}
								onChange={(e) =>
									handleFieldChange("cultural_factors", e.target.value)
								}
								placeholder="Like: different directness levels, comfort with silence, formality differences, language preferences, communication pace..."
								rows={3}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
								style={{ borderColor: "#E8E5E0" }}
							/>
						</div>
					)}
				</div>
			),
		},
		{
			title: "Staying in Your Role",
			icon: <AlertTriangle className="w-5 h-5" style={{ color: "#5B9378" }} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Are you being asked or pressured to do something outside your role?
						</label>
						<div className="grid grid-cols-2 gap-3">
							{[
								{ value: "10", label: "No, all good" },
								{ value: "5", label: "Yes, something's coming up" },
							].map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() =>
										handleFieldChange("role_adherence", parseInt(option.value))
									}
									className="px-4 py-3 rounded-lg font-medium transition-all text-sm"
									style={{
										backgroundColor:
											formData.role_adherence === parseInt(option.value)
												? "#6B8268"
												: "#F3F4F6",
										color:
											formData.role_adherence === parseInt(option.value)
												? "white"
												: "#374151",
										border: `2px solid ${
											formData.role_adherence === parseInt(option.value)
												? "#6B8268"
												: "#E5E7EB"
										}`,
									}}
								>
									{option.label}
								</button>
							))}
						</div>
					</div>

					{formData.role_adherence === 5 && (
						<>
							<div>
								<label
									className="block text-sm font-medium mb-2"
									style={{ color: "#5C7F4F" }}
								>
									What's the situation?
								</label>
								<textarea
									value={formData.role_challenges}
									onChange={(e) =>
										handleFieldChange("role_challenges", e.target.value)
									}
									placeholder="Like: being asked to give advice, make decisions for someone, do something beyond interpreting..."
									rows={3}
									className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
									style={{ borderColor: "#E8E5E0" }}
								/>
							</div>

							<div>
								<label
									className="block text-sm font-medium mb-2"
									style={{ color: "#5C7F4F" }}
								>
									What did you decide to do or what are you considering? (optional)
								</label>
								<textarea
									value={formData.role_decision || ""}
									onChange={(e) =>
										handleFieldChange("role_decision", e.target.value)
									}
									placeholder="Your response or what you're thinking about doing..."
									rows={2}
									className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
									style={{ borderColor: "#E8E5E0" }}
								/>
							</div>
						</>
					)}
				</div>
			),
		},
		{
			title: "Team Support",
			icon: <CommunityIcon size={64} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What support do I need from my team member right now?
						</label>
						<textarea
							value={formData.team_support_needed}
							onChange={(e) =>
								handleFieldChange("team_support_needed", e.target.value)
							}
							placeholder="Specific support needs..."
							rows={2}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Support urgency (1=low, 10=high)
						</label>
						<div className="flex items-center space-x-4">
							<input
								type="range"
								min="1"
								max="10"
								value={formData.support_urgency}
								onChange={(e) =>
									handleFieldChange("support_urgency", parseInt(e.target.value))
								}
								className="flex-1"
								style={{ accentColor: "#5B9378" }}
							/>
							<span
								className="text-2xl font-bold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.support_urgency}
							</span>
						</div>
					</div>
				</div>
			),
		},
		{
			title: "Emotional Management",
			icon: <HeartPulseIcon size={64} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How am I managing my emotional responses to the content? (1-10)
						</label>
						<div className="flex items-center space-x-4">
							<input
								type="range"
								min="1"
								max="10"
								value={formData.emotional_response}
								onChange={(e) =>
									handleFieldChange(
										"emotional_response",
										parseInt(e.target.value),
									)
								}
								className="flex-1"
								style={{ accentColor: "#5B9378" }}
							/>
							<span
								className="text-2xl font-bold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.emotional_response}
							</span>
						</div>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Emotional regulation strategies (optional)
						</label>
						<textarea
							value={formData.emotional_strategies}
							onChange={(e) =>
								handleFieldChange("emotional_strategies", e.target.value)
							}
							placeholder="What's helping or what's needed..."
							rows={2}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
						/>
					</div>
				</div>
			),
		},
		{
			title: "Commitment & Action",
			icon: <Sparkles className="w-5 h-5" style={{ color: "#5B9378" }} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What immediate action will I take?
						</label>
						<textarea
							value={formData.immediate_action}
							onChange={(e) =>
								handleFieldChange("immediate_action", e.target.value)
							}
							placeholder="One specific action for right now..."
							rows={2}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.immediate_action ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.immediate_action && (
							<p className="text-sm text-red-500 mt-1">
								{errors.immediate_action}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Next steps for this session
						</label>
						<textarea
							value={formData.next_steps}
							onChange={(e) => handleFieldChange("next_steps", e.target.value)}
							placeholder="What to focus on moving forward..."
							rows={2}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Overall status (1-10)
						</label>
						<div className="flex items-center space-x-4">
							<input
								type="range"
								min="1"
								max="10"
								value={formData.overall_status}
								onChange={(e) =>
									handleFieldChange("overall_status", parseInt(e.target.value))
								}
								className="flex-1"
								style={{ accentColor: "#5B9378" }}
							/>
							<span
								className="text-2xl font-bold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.overall_status}
							</span>
						</div>
					</div>

					{showSummary && (
						<div className="mt-8">
							<p
								className="text-sm font-medium mb-4"
								style={{ color: "#5C7F4F" }}
							>
								Your self-check has been saved! Here's your summary:
							</p>

							<div
								className="p-4 rounded-lg font-mono text-xs"
								style={{
									backgroundColor: "#F8FBF6",
									border: "1px solid rgba(107, 139, 96, 0.2)",
									whiteSpace: "pre-wrap",
								}}
							>
								{generateSummary()}
							</div>
						</div>
					)}
				</div>
			),
		},
	];

	const currentSectionData = sections[currentSection];
	const isLastSection = currentSection === sections.length - 1;

	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
			onClick={onClose}
		>
			<div
				className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden pb-8"
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
								<HeartPulseIcon size={64} />
							</div>
							<div>
								<h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
									Mid-Assignment Check-In
								</h2>
								<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
									A quick 2-minute check to stay aware and make adjustments
								</p>
								<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
									Quick real-time monitoring for active interpreting
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
										minWidth: "20px",
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
				<div
					className="p-6 overflow-y-auto"
					style={{ maxHeight: "calc(90vh - 240px)" }}
				>
					<div className="mb-4 flex items-center space-x-2">
						{currentSectionData.icon}
						<h3 className="text-xl font-semibold" style={{ color: "#1A1A1A" }}>
							{currentSectionData.title}
						</h3>
					</div>

					{currentSectionData.content}
				</div>

				{/* Footer */}
				<div
					className="p-6 border-t flex justify-between items-center mb-4"
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
							disabled={isSaving || hasSaved || showSummary}
							className="px-6 py-2 rounded-lg flex items-center transition-all"
							style={{
								background:
									isSaving || hasSaved || showSummary
										? "#CCCCCC"
										: "linear-gradient(135deg, #5C7F4F, #5B9378)",
								color: "#FFFFFF",
								boxShadow:
									isSaving || hasSaved || showSummary
										? "none"
										: "0 2px 8px rgba(107, 139, 96, 0.3)",
								cursor:
									isSaving || hasSaved || showSummary
										? "not-allowed"
										: "pointer",
							}}
							onMouseEnter={(e) => {
								if (!isSaving && !hasSaved && !showSummary) {
									e.currentTarget.style.transform = "translateY(-1px)";
									e.currentTarget.style.boxShadow =
										"0 4px 12px rgba(107, 139, 96, 0.4)";
								}
							}}
							onMouseLeave={(e) => {
								if (!isSaving && !hasSaved && !showSummary) {
									e.currentTarget.style.transform = "translateY(0)";
									e.currentTarget.style.boxShadow =
										"0 2px 8px rgba(107, 139, 96, 0.3)";
								}
							}}
						>
							{isSaving ? (
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
									Complete Check
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

export default InSessionSelfCheck;
