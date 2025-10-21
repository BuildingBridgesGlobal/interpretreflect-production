/**
 * Pre-Assignment Prep V6 Component
 *
 * Matches exact Team Interpreting Preparation design pattern
 * with sage green color scheme and consistent styling
 *
 * @module PreAssignmentPrepV6
 */

import {
	Activity,
	BookOpen,
	Brain,
	Check,
	ChevronLeft,
	ChevronRight,
	Compass,
	Shield,
	Sparkles,
	Target,
	Users,
	X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { reflectionService } from "../services/reflectionService";

interface PreAssignmentPrepV6Props {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

/**
 * Main Component
 */
export function PreAssignmentPrepV6({
	onClose,
	onComplete,
}: PreAssignmentPrepV6Props) {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [currentSection, setCurrentSection] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
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
		// Section 1: Opening Context
		context_background: "",
		materials_review: "",

		// Section 2: Readiness Assessment
		readiness_levels: "",
		anticipated_demands: "",

		// Section 3: Control Strategies
		control_strategies: "",
		backup_plans: "",

		// Section 4: Role-Space Awareness
		role_space: "",

		// Section 5: Mental Preparation
		emotional_baseline: "",
		neuroscience_practices: "",
		triggers_vulnerabilities: "",
		emotional_responses: "",

		// Section 6: Ethics & Culture
		ethics_culture: "",

		// Section 7: Growth & Closing
		growth_goals: "",
		intention_statement: "",
		confidence_rating: 5,
		feeling_word: "",

		// Metadata
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

		switch (sectionIndex) {
			case 0: // Context & Background
				if (!formData.context_background.trim()) {
					newErrors.context_background =
						"Please describe the assignment context";
				}
				if (!formData.materials_review.trim()) {
					newErrors.materials_review = "Please list materials to review";
				}
				break;

			case 1: // Readiness Assessment
				if (!formData.readiness_levels.trim()) {
					newErrors.readiness_levels = "Please describe your readiness levels";
				}
				if (!formData.anticipated_demands.trim()) {
					newErrors.anticipated_demands = "Please describe anticipated demands";
				}
				break;

			case 2: // Control Strategies
				if (!formData.control_strategies.trim()) {
					newErrors.control_strategies =
						"Please describe your control strategies";
				}
				if (!formData.backup_plans.trim()) {
					newErrors.backup_plans = "Please describe backup plans";
				}
				break;

			case 3: // Role-Space
				if (!formData.role_space.trim()) {
					newErrors.role_space = "Please describe your role-space approach";
				}
				break;

			case 4: // Mental Preparation
				// Emotional baseline is optional but helpful
				if (!formData.neuroscience_practices.trim()) {
					newErrors.neuroscience_practices =
						"Please describe your mental preparation practices";
				}
				if (!formData.triggers_vulnerabilities.trim()) {
					newErrors.triggers_vulnerabilities =
						"Please describe triggers and management strategies";
				}
				// Emotional responses is optional but helpful
				break;

			case 5: // What to Watch For
				if (!formData.ethics_culture.trim()) {
					newErrors.ethics_culture =
						"Please describe anything requiring extra awareness";
				}
				break;

			case 6: // Growth & Closing
				if (!formData.growth_goals.trim()) {
					newErrors.growth_goals = "Please describe your growth goals";
				}
				if (!formData.intention_statement.trim()) {
					newErrors.intention_statement = "Please craft an intention statement";
				}
				if (!formData.feeling_word.trim()) {
					newErrors.feeling_word = "Please share how you feel in one word";
				}
				break;
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
		if (isSaving) {
			console.log(
				"PreAssignmentPrepV6 - Already saving, ignoring duplicate click",
			);
			return;
		}

		console.log("PreAssignmentPrepV6 - handleSubmit called");
		console.log("PreAssignmentPrepV6 - User details:", {
			id: user.id,
			email: user.email,
		});

		setIsSaving(true);
		try {
			const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const timeSpent = Math.floor((Date.now() - startTime) / 1000);
			console.log(
				"PreAssignmentPrepV6 - Starting save with sessionId:",
				sessionId,
			);

			// Prepare answers object
			const answers = {
				context_background: formData.context_background,
				materials_review: formData.materials_review,
				readiness_levels: formData.readiness_levels,
				anticipated_demands: formData.anticipated_demands,
				control_strategies: formData.control_strategies,
				role_space: formData.role_space,
				emotional_baseline: formData.emotional_baseline,
				neuroscience_practices: formData.neuroscience_practices,
				triggers_vulnerabilities: formData.triggers_vulnerabilities,
				emotional_responses: formData.emotional_responses,
				ethics_culture: formData.ethics_culture,
				backup_plans: formData.backup_plans,
				growth_goals: formData.growth_goals,
			};

			// Save to database using reflection service
			console.log(
				"PreAssignmentPrepV6 - Attempting to save using reflection service",
			);

			// Prepare data to save with all form data plus metadata
			const dataToSave = {
				...formData,
				answers, // Include structured answers
				sessionId,
				timestamp: new Date().toISOString(),
				time_spent_seconds: timeSpent,
			};

			console.log("PreAssignmentPrepV6 - Data to save:", dataToSave);

			// Use reflection service to save (without timeout to see actual error)
			const result = await reflectionService.saveReflection(
				user.id,
				"pre_assignment_prep",
				dataToSave,
			);

			if (!result || !result.success) {
				throw new Error(result?.error || "Failed to save Pre-Assignment Prep");
			}

			console.log("PreAssignmentPrepV6 - Save successful!", result);

			// Set saving to false immediately after successful save
			setIsSaving(false);

			// Skip growth insights update - it hangs due to Supabase client
			console.log(
				"PreAssignmentPrepV6 - Skipping growth insights update (uses hanging Supabase client)",
			);

			// Save confidence level to Supabase for Growth Snapshot
			try {
				const { saveConfidenceLevelDirect } = await import('../utils/confidenceLevelTracking');
				await saveConfidenceLevelDirect({
					confidence_level: formData.confidence_rating,
					reflection_type: 'pre_assignment_prep',
					notes: formData.feeling_word || ''
				});
				console.log("✅ Confidence level saved for Growth Snapshot");
			} catch (confError) {
				console.error("Error saving confidence level:", confError);
				// Don't throw - this is a non-critical error
			}

			// Call onComplete and let parent handle closing
			if (onComplete) {
				onComplete(formData);
			}
		} catch (error) {
			console.error("PreAssignmentPrepV6 - Caught error in try/catch:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Failed to save preparation";
			console.error("PreAssignmentPrepV6 - Error message:", errorMessage);
			setErrors({ save: errorMessage });
			alert(`Error saving reflection: ${errorMessage}`); // Show alert to see the error
		} finally {
			console.log(
				"PreAssignmentPrepV6 - Finally block, setting isSaving to false",
			);
			setIsSaving(false);
		}
	};

	const generateSummary = () => {
		return `YOU'RE READY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MY INTENTION:
${formData.intention_statement}

WHAT I'M WORKING ON:
${formData.growth_goals}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTEXT & PREP:
${formData.context_background}
Materials: ${formData.materials_review}

MY STARTING POINT:
Physical/Emotional: ${formData.readiness_levels}
Emotional Baseline: ${formData.emotional_baseline}

MY STRATEGY:
${formData.control_strategies}
Backup Plan: ${formData.backup_plans}

STAYING GROUNDED:
${formData.neuroscience_practices}

BOUNDARIES:
${formData.role_space}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONFIDENCE: ${formData.confidence_rating}/10
FEELING: ${formData.feeling_word}
    `.trim();
	};

	const sections = [
		{
			title: "Opening Context",
			icon: <BookOpen className="w-5 h-5" style={{ color: "#5B9378" }} />,
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
							Getting Ready
						</h3>
						<p className="mb-4" style={{ color: "#5A5A5A" }}>
							You're about to step into an assignment. Taking a few minutes now helps you leave behind whatever came before and step fully into this work. Think through the context, the people, the terminology. Notice what emotions might show up. Do any quick research you need. This is your moment to arrive mentally and emotionally ready. That's what separates good from great.
						</p>
						<p className="text-sm font-medium" style={{ color: "#5C7F4F" }}>
							Let's walk through your preparation step by step.
						</p>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							First, ground yourself in the context. What do you know about this assignment and the people involved?
						</label>
						<textarea
							value={formData.context_background}
							onChange={(e) =>
								handleFieldChange("context_background", e.target.value)
							}
							placeholder="Tell us about where you'll be, who'll be there, and any background info that's helpful..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.context_background ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.context_background && (
							<p className="text-sm text-red-500 mt-1">
								{errors.context_background}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Next, identify your prep work. What materials or terms do you want to review beforehand?
						</label>
						<textarea
							value={formData.materials_review}
							onChange={(e) =>
								handleFieldChange("materials_review", e.target.value)
							}
							placeholder="Like specific documents, glossaries, terminology lists, or anything you want to brush up on..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.materials_review ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.materials_review && (
							<p className="text-sm text-red-500 mt-1">
								{errors.materials_review}
							</p>
						)}
					</div>
				</div>
			),
		},
		{
			title: "How You're Doing",
			icon: <Activity className="w-5 h-5" style={{ color: "#5B9378" }} />,
			content: (
				<div className="space-y-6">
					<div
						className="p-6 rounded-xl mb-6"
						style={{
							background:
								"linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)",
							border: "1px solid rgba(107, 139, 96, 0.2)",
						}}
					>
						<p className="text-sm" style={{ color: "#5A5A5A" }}>
							Now check in with yourself. The best performers know their starting point before they begin. Being honest about how you're feeling and what might be challenging helps you show up ready to handle it.
						</p>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How are you feeling emotionally and physically right now?
						</label>
						<textarea
							value={formData.readiness_levels}
							onChange={(e) =>
								handleFieldChange("readiness_levels", e.target.value)
							}
							placeholder="Tell us how you're feeling - energized, tired, nervous, calm, ready..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.readiness_levels ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.readiness_levels && (
							<p className="text-sm text-red-500 mt-1">
								{errors.readiness_levels}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What challenges do you think might come up?
						</label>
						<textarea
							value={formData.anticipated_demands}
							onChange={(e) =>
								handleFieldChange("anticipated_demands", e.target.value)
							}
							placeholder="Like: noisy environment, complex relationships between people, fast-paced content, managing your own stress..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.anticipated_demands ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.anticipated_demands && (
							<p className="text-sm text-red-500 mt-1">
								{errors.anticipated_demands}
							</p>
						)}
					</div>
				</div>
			),
		},
		{
			title: "Your Game Plan",
			icon: <Shield className="w-5 h-5" style={{ color: "#5B9378" }} />,
			content: (
				<div className="space-y-6">
					<div
						className="p-6 rounded-xl mb-6"
						style={{
							background:
								"linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)",
							border: "1px solid rgba(107, 139, 96, 0.2)",
						}}
					>
						<p className="text-sm mb-3" style={{ color: "#5A5A5A" }}>
							Now let's build your strategy. Think about what you can control and what you can't. For what you can control, decide your approach. For what you can't, plan how you'll adapt.
						</p>
						<p className="text-sm" style={{ color: "#5A5A5A" }}>
							Your options might include: positioning yourself strategically, taking breaks, using breathing techniques, asking for clarification, adjusting your pace, or requesting support.
						</p>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							For each challenge you mentioned, what's your approach?
						</label>
						<textarea
							value={formData.control_strategies}
							onChange={(e) =>
								handleFieldChange("control_strategies", e.target.value)
							}
							placeholder="Match each challenge with your strategy. Example: 'Noisy environment - I'll position myself away from the noise source and use hand signals if needed...'"
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.control_strategies ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.control_strategies && (
							<p className="text-sm text-red-500 mt-1">
								{errors.control_strategies}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							If things don't go as planned, what's your backup approach?
						</label>
						<textarea
							value={formData.backup_plans}
							onChange={(e) =>
								handleFieldChange("backup_plans", e.target.value)
							}
							placeholder="Who can you call? What will you do if you need help or a break? What's your exit strategy if needed..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.backup_plans ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.backup_plans && (
							<p className="text-sm text-red-500 mt-1">{errors.backup_plans}</p>
						)}
					</div>
				</div>
			),
		},
		{
			title: "Staying in Your Role",
			icon: <Users className="w-5 h-5" style={{ color: "#5B9378" }} />,
			content: (
				<div className="space-y-6">
					<div
						className="p-6 rounded-xl mb-6"
						style={{
							background:
								"linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)",
							border: "1px solid rgba(107, 139, 96, 0.2)",
						}}
					>
						<p className="text-sm" style={{ color: "#5A5A5A" }}>
							Think about your professional boundaries before you step in. When things get complicated or someone asks you to do something outside your role, you'll already know how you'll respond. This clarity helps you stay grounded and professional.
						</p>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How will you maintain your professional role and boundaries?
						</label>
						<textarea
							value={formData.role_space}
							onChange={(e) => handleFieldChange("role_space", e.target.value)}
							placeholder="Think about: What's your role in this assignment? What's outside your role? How will you respond if someone asks you to step beyond your boundaries?"
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.role_space ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.role_space && (
							<p className="text-sm text-red-500 mt-1">{errors.role_space}</p>
						)}
					</div>
				</div>
			),
		},
		{
			title: "Taking Care of Yourself",
			icon: <Brain className="w-5 h-5" style={{ color: "#5B9378" }} />,
			content: (
				<div className="space-y-6">
					<div
						className="p-6 rounded-xl mb-6"
						style={{
							background:
								"linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)",
							border: "1px solid rgba(107, 139, 96, 0.2)",
						}}
					>
						<p className="text-sm" style={{ color: "#5A5A5A" }}>
							Before you step into the work, check in with yourself emotionally. Knowing where you're starting from helps you notice when things shift during the assignment.
						</p>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What's your emotional baseline right now?
						</label>
						<textarea
							value={formData.emotional_baseline}
							onChange={(e) =>
								handleFieldChange("emotional_baseline", e.target.value)
							}
							placeholder="How are you feeling emotionally as you prepare? Calm, anxious, energized, tired, confident, uncertain..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.emotional_baseline
									? "#ef4444"
									: "#E8E5E0",
							}}
						/>
						{errors.emotional_baseline && (
							<p className="text-sm text-red-500 mt-1">
								{errors.emotional_baseline}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What will you do to stay focused and calm?
						</label>
						<textarea
							value={formData.neuroscience_practices}
							onChange={(e) =>
								handleFieldChange("neuroscience_practices", e.target.value)
							}
							placeholder="Like: deep breathing, taking short breaks, grounding myself, staying present..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.neuroscience_practices
									? "#ef4444"
									: "#E8E5E0",
							}}
						/>
						{errors.neuroscience_practices && (
							<p className="text-sm text-red-500 mt-1">
								{errors.neuroscience_practices}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What situations or topics might be hard for you? How will you handle them?
						</label>
						<textarea
							value={formData.triggers_vulnerabilities}
							onChange={(e) =>
								handleFieldChange("triggers_vulnerabilities", e.target.value)
							}
							placeholder="It's okay to acknowledge what's tough for you. Name it and plan for how you'll cope..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.triggers_vulnerabilities
									? "#ef4444"
									: "#E8E5E0",
							}}
						/>
						{errors.triggers_vulnerabilities && (
							<p className="text-sm text-red-500 mt-1">
								{errors.triggers_vulnerabilities}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What emotions might come up with those situations?
						</label>
						<textarea
							value={formData.emotional_responses}
							onChange={(e) =>
								handleFieldChange("emotional_responses", e.target.value)
							}
							placeholder="Like: frustration, anxiety, sadness, anger, overwhelm... Naming them now helps you recognize them later."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.emotional_responses
									? "#ef4444"
									: "#E8E5E0",
							}}
						/>
						{errors.emotional_responses && (
							<p className="text-sm text-red-500 mt-1">
								{errors.emotional_responses}
							</p>
						)}
					</div>
				</div>
			),
		},
		{
			title: "What to Watch For",
			icon: <Compass className="w-5 h-5" style={{ color: "#5B9378" }} />,
			content: (
				<div className="space-y-6">
					<div
						className="p-6 rounded-xl mb-6"
						style={{
							background:
								"linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)",
							border: "1px solid rgba(107, 139, 96, 0.2)",
						}}
					>
						<p className="text-sm" style={{ color: "#5A5A5A" }}>
							Every assignment has its own context. Think about the people, the setting, and any situations that might require extra care or attention.
						</p>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Is there anything about this assignment that requires extra awareness or sensitivity?
						</label>
						<textarea
							value={formData.ethics_culture}
							onChange={(e) =>
								handleFieldChange("ethics_culture", e.target.value)
							}
							placeholder="Think about: different communication styles, sensitive topics, power dynamics, confidentiality concerns, or anything that might put you in an uncomfortable position..."
							rows={5}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.ethics_culture ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.ethics_culture && (
							<p className="text-sm text-red-500 mt-1">
								{errors.ethics_culture}
							</p>
						)}
					</div>
				</div>
			),
		},
		{
			title: "Ready to Go",
			icon: <Target className="w-5 h-5" style={{ color: "#5B9378" }} />,
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
						<p className="text-sm mb-3" style={{ color: "#5A5A5A" }}>
							You've thought through the context, checked in with yourself, built your strategy, and identified what to watch for. Now set your intention and step in ready.
						</p>
						<p className="text-sm font-medium" style={{ color: "#5C7F4F" }}>
							This is your moment. You've got this.
						</p>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What do you want to work on during this assignment?
						</label>
						<textarea
							value={formData.growth_goals}
							onChange={(e) =>
								handleFieldChange("growth_goals", e.target.value)
							}
							placeholder="Pick one thing to focus on: managing stress, improving pacing, staying present, maintaining boundaries..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.growth_goals ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.growth_goals && (
							<p className="text-sm text-red-500 mt-1">{errors.growth_goals}</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Your intention for this assignment (one sentence)
						</label>
						<input
							type="text"
							value={formData.intention_statement}
							onChange={(e) =>
								handleFieldChange("intention_statement", e.target.value)
							}
							placeholder="I will... (stay grounded and present, bring calm confidence, communicate clearly and professionally...)"
							className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.intention_statement ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.intention_statement && (
							<p className="text-sm text-red-500 mt-1">
								{errors.intention_statement}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How confident do you feel? (1-10)
						</label>
						<div className="flex items-center space-x-4">
							<input
								type="range"
								min="1"
								max="10"
								value={formData.confidence_rating}
								onChange={(e) =>
									handleFieldChange(
										"confidence_rating",
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
								{formData.confidence_rating}
							</span>
						</div>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							In one word, how are you feeling?
						</label>
						<input
							type="text"
							value={formData.feeling_word}
							onChange={(e) =>
								handleFieldChange("feeling_word", e.target.value)
							}
							placeholder="ready, nervous, excited, focused, calm..."
							className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.feeling_word ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.feeling_word && (
							<p className="text-sm text-red-500 mt-1">{errors.feeling_word}</p>
						)}
					</div>

					{showSummary && (
						<div className="mt-8">
							<p
								className="text-sm font-medium mb-4"
								style={{ color: "#5C7F4F" }}
							>
								Your preparation has been saved! Here's your summary:
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
		<>
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
									<BookOpen className="w-6 h-6 text-white" />
								</div>
								<div>
									<h2
										className="text-2xl font-bold"
										style={{ color: "#1A1A1A" }}
									>
										Pre-Assignment Preparation
									</h2>
									<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
										Prepare your mind and body before you step into the work
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
							<h3
								className="text-xl font-semibold"
								style={{ color: "#1A1A1A" }}
							>
								{currentSectionData.title}
							</h3>
						</div>

						{currentSectionData.content}
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
								disabled={isSaving}
								className="px-6 py-2 rounded-lg flex items-center transition-all"
								style={{
									background: isSaving
										? "#CCCCCC"
										: "linear-gradient(135deg, #5C7F4F, #5B9378)",
									color: "#FFFFFF",
									boxShadow: isSaving
										? "none"
										: "0 2px 8px rgba(107, 139, 96, 0.3)",
									cursor: isSaving ? "not-allowed" : "pointer",
								}}
								onMouseEnter={(e) => {
									if (!isSaving) {
										e.currentTarget.style.transform = "translateY(-1px)";
										e.currentTarget.style.boxShadow =
											"0 4px 12px rgba(107, 139, 96, 0.4)";
									}
								}}
								onMouseLeave={(e) => {
									if (!isSaving) {
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
										Complete Preparation
										<Check className="w-4 h-4 ml-1" />
									</>
								)}
							</button>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

export default PreAssignmentPrepV6;
