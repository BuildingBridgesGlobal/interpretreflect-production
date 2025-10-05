/**
 * Mentoring Reflection Accessible Component
 *
 * Matches exact design pattern of Mentoring Prep with sage green color scheme
 * and consistent styling across all reflection components
 *
 * @module MentoringReflectionAccessible
 */

import {
	BookOpen,
	Check,
	ChevronLeft,
	ChevronRight,
	Compass,
	Lightbulb,
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

interface MentoringReflectionProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

/**
 * Main Component
 */
export const MentoringReflectionAccessible: React.FC<
	MentoringReflectionProps
> = ({ onClose, onComplete }) => {
	const { user } = useAuth();
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
		// Section 1: Mentorship Context
		mentorship_type: "peer",
		relationship_stage: "established",
		session_overview: "",

		// Section 2: Goals & Outcomes
		original_goals: "",
		goals_achievement: "",
		unexpected_outcomes: "",

		// Section 3: Knowledge & Learning
		key_insights: "",
		skills_developed: "",
		knowledge_gaps_addressed: "",

		// Section 4: Communication & Relationship
		communication_effectiveness: "",
		relationship_dynamics: "",
		trust_level: 5,

		// Section 5: Challenges & Growth
		challenges_encountered: "",
		how_challenges_handled: "",
		personal_growth_areas: "",

		// Section 6: Effectiveness & Impact
		helpful_approaches: "",
		less_effective_strategies: "",
		mentor_impact: "",

		// Section 7: Future & Development
		next_steps: "",
		continued_learning: "",
		relationship_evolution: "",

		// Section 8: Closing Reflection
		appreciation: "",
		session_quality: 5,
		would_continue: "yes",
		one_word_summary: "",

		// Metadata
		session_date: new Date().toISOString().split("T")[0],
		session_duration: "",
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
			case 0: // Mentorship Context
				if (!formData.session_overview.trim()) {
					newErrors.session_overview = "Please describe the session overview";
				}
				break;

			case 1: // Goals & Outcomes
				if (!formData.original_goals.trim()) {
					newErrors.original_goals = "Please describe the original goals";
				}
				if (!formData.goals_achievement.trim()) {
					newErrors.goals_achievement = "Please reflect on goal achievement";
				}
				break;

			case 2: // Knowledge & Learning
				if (!formData.key_insights.trim()) {
					newErrors.key_insights = "Please share key insights";
				}
				break;

			case 3: // Communication & Relationship
				if (!formData.communication_effectiveness.trim()) {
					newErrors.communication_effectiveness =
						"Please assess communication effectiveness";
				}
				break;

			case 4: // Challenges & Growth
				if (!formData.challenges_encountered.trim()) {
					newErrors.challenges_encountered = "Please describe any challenges";
				}
				break;

			case 5: // Effectiveness & Impact
				if (!formData.helpful_approaches.trim()) {
					newErrors.helpful_approaches = "Please identify helpful approaches";
				}
				break;

			case 6: // Future & Development
				if (!formData.next_steps.trim()) {
					newErrors.next_steps = "Please identify next steps";
				}
				break;

			case 7: // Closing Reflection
				if (!formData.appreciation.trim()) {
					newErrors.appreciation = "Please share your appreciation";
				}
				if (!formData.one_word_summary.trim()) {
					newErrors.one_word_summary = "Please provide a one-word summary";
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

		setIsSaving(true);
		try {
			const timeSpent = Math.floor((Date.now() - startTime) / 1000);

			console.log("MentoringReflectionAccessible - Starting save process...");

			// Prepare data to save
			const dataToSave = {
				...formData,
				status: "completed",
				metadata: {
					completion_time: new Date().toISOString(),
					time_spent_seconds: timeSpent,
					sections_completed: 8,
				},
				completed_at: new Date().toISOString(),
				time_spent_seconds: timeSpent,
				// Add field for getDisplayName fallback
				mentoring_insights:
					formData.key_insight ||
					formData.immediate_insight ||
					"Mentoring reflection completed",
			};

			console.log(
				"MentoringReflectionAccessible - Saving with reflectionService",
			);

			const result = await reflectionService.saveReflection(
				user.id,
				"mentoring_reflection",
				dataToSave,
			);

			if (!result.success) {
				console.error(
					"MentoringReflectionAccessible - Error saving:",
					result.error,
				);
				throw new Error(result.error || "Failed to save reflection");
			} else {
				console.log("MentoringReflectionAccessible - Saved successfully");

				// Show summary
				setShowSummary(true);
				setIsSaving(false);

				// Call onComplete if provided
				if (onComplete) {
					onComplete(dataToSave);
				}
			}

			// Skip growth insights update - it hangs due to Supabase client
			console.log(
				"MentoringReflectionAccessible - Skipping growth insights update (uses hanging Supabase client)",
			);
		} catch (error) {
			console.error("Error saving mentoring reflection:", error);
			setErrors({ save: "Failed to save reflection. Please try again." });
		} finally {
			setIsSaving(false);
		}
	};

	const generateSummary = () => {
		return `MENTORING REFLECTION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SESSION OVERVIEW:
${formData.session_overview}

KEY INSIGHTS:
${formData.key_insights}

GOALS ACHIEVEMENT:
${formData.goals_achievement}

HELPFUL APPROACHES:
${formData.helpful_approaches}

NEXT STEPS:
${formData.next_steps}

APPRECIATION:
${formData.appreciation}

SESSION QUALITY: ${formData.session_quality}/10
TRUST LEVEL: ${formData.trust_level}/10
WOULD CONTINUE: ${formData.would_continue}
SUMMARY: ${formData.one_word_summary}
    `.trim();
	};

	const sections = [
		{
			title: "Mentorship Context",
			icon: <CommunityIcon size={64} />,
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
							Reflecting on Your Mentoring Experience
						</h3>
						<p className="mb-6" style={{ color: "#5A5A5A" }}>
							Take a moment to process and capture the value of your mentoring
							interaction. Your reflections help deepen learning and improve
							future mentoring experiences.
						</p>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What type of mentoring relationship was this?
						</label>
						<div className="grid grid-cols-2 gap-3">
							{[
								{ value: "peer", label: "Peer Mentoring" },
								{ value: "senior", label: "Senior Mentor" },
								{ value: "reverse", label: "Reverse Mentoring" },
								{ value: "group", label: "Group Mentoring" },
							].map((type) => (
								<button
									key={type.value}
									onClick={() =>
										handleFieldChange("mentorship_type", type.value)
									}
									className={`p-3 rounded-lg text-left transition-all ${
										formData.mentorship_type === type.value
											? "font-semibold"
											: ""
									}`}
									style={{
										backgroundColor:
											formData.mentorship_type === type.value
												? "rgba(107, 139, 96, 0.2)"
												: "#F8FBF6",
										color:
											formData.mentorship_type === type.value
												? "#5C7F4F"
												: "#5A5A5A",
										border: `1px solid ${formData.mentorship_type === type.value ? "#5B9378" : "#E8E5E0"}`,
									}}
								>
									{type.label}
								</button>
							))}
						</div>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What stage was this mentoring relationship?
						</label>
						<div className="flex gap-3">
							{[
								{ value: "new", label: "New" },
								{ value: "developing", label: "Developing" },
								{ value: "established", label: "Established" },
							].map((stage) => (
								<button
									key={stage.value}
									onClick={() =>
										handleFieldChange("relationship_stage", stage.value)
									}
									className={`px-4 py-2 rounded-lg capitalize transition-all ${
										formData.relationship_stage === stage.value
											? "font-semibold"
											: ""
									}`}
									style={{
										backgroundColor:
											formData.relationship_stage === stage.value
												? "rgba(107, 139, 96, 0.2)"
												: "#F8FBF6",
										color:
											formData.relationship_stage === stage.value
												? "#5C7F4F"
												: "#5A5A5A",
										border: `1px solid ${formData.relationship_stage === stage.value ? "#5B9378" : "#E8E5E0"}`,
									}}
								>
									{stage.label}
								</button>
							))}
						</div>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How would you describe this mentoring session overall?
						</label>
						<textarea
							value={formData.session_overview}
							onChange={(e) =>
								handleFieldChange("session_overview", e.target.value)
							}
							placeholder="Provide a general overview of how the session went..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.session_overview ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.session_overview && (
							<p className="text-sm text-red-500 mt-1">
								{errors.session_overview}
							</p>
						)}
					</div>
				</div>
			),
		},
		{
			title: "Goals & Outcomes",
			icon: <TargetIcon size={64} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What were the original goals for this mentoring session?
						</label>
						<textarea
							value={formData.original_goals}
							onChange={(e) =>
								handleFieldChange("original_goals", e.target.value)
							}
							placeholder="Describe what you or your mentor set out to achieve..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.original_goals ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.original_goals && (
							<p className="text-sm text-red-500 mt-1">
								{errors.original_goals}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How well were these goals achieved?
						</label>
						<textarea
							value={formData.goals_achievement}
							onChange={(e) =>
								handleFieldChange("goals_achievement", e.target.value)
							}
							placeholder="Reflect on whether objectives were met and how..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.goals_achievement ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.goals_achievement && (
							<p className="text-sm text-red-500 mt-1">
								{errors.goals_achievement}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Were there any unexpected outcomes or discoveries?
						</label>
						<textarea
							value={formData.unexpected_outcomes}
							onChange={(e) =>
								handleFieldChange("unexpected_outcomes", e.target.value)
							}
							placeholder="Share any surprises or unplanned benefits..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
						/>
					</div>
				</div>
			),
		},
		{
			title: "Knowledge & Learning",
			icon: <BookOpen className="w-5 h-5" style={{ color: "#5B9378" }} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What were your key insights from this mentoring session?
						</label>
						<textarea
							value={formData.key_insights}
							onChange={(e) =>
								handleFieldChange("key_insights", e.target.value)
							}
							placeholder="Share the most important realizations or discoveries..."
							rows={3}
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
							What skills or competencies did you develop or strengthen?
						</label>
						<textarea
							value={formData.skills_developed}
							onChange={(e) =>
								handleFieldChange("skills_developed", e.target.value)
							}
							placeholder="Identify specific skills that were enhanced..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What knowledge gaps were addressed during this session?
						</label>
						<textarea
							value={formData.knowledge_gaps_addressed}
							onChange={(e) =>
								handleFieldChange("knowledge_gaps_addressed", e.target.value)
							}
							placeholder="Describe areas where your understanding improved..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
						/>
					</div>
				</div>
			),
		},
		{
			title: "Communication & Relationship",
			icon: <HeartPulseIcon size={64} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How effective was the communication during this session?
						</label>
						<textarea
							value={formData.communication_effectiveness}
							onChange={(e) =>
								handleFieldChange("communication_effectiveness", e.target.value)
							}
							placeholder="Assess clarity, understanding, and dialogue quality..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.communication_effectiveness
									? "#ef4444"
									: "#E8E5E0",
							}}
						/>
						{errors.communication_effectiveness && (
							<p className="text-sm text-red-500 mt-1">
								{errors.communication_effectiveness}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How did the relationship dynamics feel during this session?
						</label>
						<textarea
							value={formData.relationship_dynamics}
							onChange={(e) =>
								handleFieldChange("relationship_dynamics", e.target.value)
							}
							placeholder="Reflect on connection, rapport, and mutual respect..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Rate the level of trust in this relationship (1-10)
						</label>
						<div className="flex items-center space-x-4">
							<input
								type="range"
								min="1"
								max="10"
								value={formData.trust_level}
								onChange={(e) =>
									handleFieldChange("trust_level", parseInt(e.target.value))
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
								{formData.trust_level}
							</span>
						</div>
					</div>
				</div>
			),
		},
		{
			title: "Challenges & Growth",
			icon: <SecureLockIcon size={64} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What challenges or difficulties arose during the session?
						</label>
						<textarea
							value={formData.challenges_encountered}
							onChange={(e) =>
								handleFieldChange("challenges_encountered", e.target.value)
							}
							placeholder="Describe any obstacles or difficult moments..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.challenges_encountered
									? "#ef4444"
									: "#E8E5E0",
							}}
						/>
						{errors.challenges_encountered && (
							<p className="text-sm text-red-500 mt-1">
								{errors.challenges_encountered}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How were these challenges handled or addressed?
						</label>
						<textarea
							value={formData.how_challenges_handled}
							onChange={(e) =>
								handleFieldChange("how_challenges_handled", e.target.value)
							}
							placeholder="Describe problem-solving approaches that were used..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What personal growth areas were highlighted during this session?
						</label>
						<textarea
							value={formData.personal_growth_areas}
							onChange={(e) =>
								handleFieldChange("personal_growth_areas", e.target.value)
							}
							placeholder="Identify areas for continued development..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
						/>
					</div>
				</div>
			),
		},
		{
			title: "Effectiveness & Impact",
			icon: <Lightbulb className="w-5 h-5" style={{ color: "#5B9378" }} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What mentoring approaches were most helpful and effective?
						</label>
						<textarea
							value={formData.helpful_approaches}
							onChange={(e) =>
								handleFieldChange("helpful_approaches", e.target.value)
							}
							placeholder="Identify the most effective mentoring techniques or styles..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.helpful_approaches ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.helpful_approaches && (
							<p className="text-sm text-red-500 mt-1">
								{errors.helpful_approaches}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What strategies or approaches were less effective?
						</label>
						<textarea
							value={formData.less_effective_strategies}
							onChange={(e) =>
								handleFieldChange("less_effective_strategies", e.target.value)
							}
							placeholder="Reflect on what didn't work as well and why..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What impact did the mentor have on your development?
						</label>
						<textarea
							value={formData.mentor_impact}
							onChange={(e) =>
								handleFieldChange("mentor_impact", e.target.value)
							}
							placeholder="Describe the specific ways your mentor influenced your growth..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
						/>
					</div>
				</div>
			),
		},
		{
			title: "Future & Development",
			icon: <Compass className="w-5 h-5" style={{ color: "#5B9378" }} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What are your next steps based on this mentoring session?
						</label>
						<textarea
							value={formData.next_steps}
							onChange={(e) => handleFieldChange("next_steps", e.target.value)}
							placeholder="Identify specific actions you plan to take..."
							rows={3}
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
							What areas will you continue to focus on for learning?
						</label>
						<textarea
							value={formData.continued_learning}
							onChange={(e) =>
								handleFieldChange("continued_learning", e.target.value)
							}
							placeholder="List ongoing development priorities..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How do you see this mentoring relationship evolving?
						</label>
						<textarea
							value={formData.relationship_evolution}
							onChange={(e) =>
								handleFieldChange("relationship_evolution", e.target.value)
							}
							placeholder="Reflect on the future of this mentoring relationship..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
						/>
					</div>
				</div>
			),
		},
		{
			title: "Closing Reflection",
			icon: <NotepadIcon size={64} />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Express your appreciation for this mentoring experience
						</label>
						<textarea
							value={formData.appreciation}
							onChange={(e) =>
								handleFieldChange("appreciation", e.target.value)
							}
							placeholder="Share gratitude for the mentor, insights gained, or growth experienced..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.appreciation ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.appreciation && (
							<p className="text-sm text-red-500 mt-1">{errors.appreciation}</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Rate the overall quality of this session (1-10)
						</label>
						<div className="flex items-center space-x-4">
							<input
								type="range"
								min="1"
								max="10"
								value={formData.session_quality}
								onChange={(e) =>
									handleFieldChange("session_quality", parseInt(e.target.value))
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
								{formData.session_quality}
							</span>
						</div>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Would you continue this mentoring relationship?
						</label>
						<div className="flex gap-3">
							{["yes", "maybe", "no"].map((option) => (
								<button
									key={option}
									onClick={() => handleFieldChange("would_continue", option)}
									className={`px-6 py-2 rounded-lg capitalize transition-all ${
										formData.would_continue === option ? "font-semibold" : ""
									}`}
									style={{
										backgroundColor:
											formData.would_continue === option
												? "rgba(107, 139, 96, 0.2)"
												: "#F8FBF6",
										color:
											formData.would_continue === option
												? "#5C7F4F"
												: "#5A5A5A",
										border: `1px solid ${formData.would_continue === option ? "#5B9378" : "#E8E5E0"}`,
									}}
								>
									{option}
								</button>
							))}
						</div>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Summarize this mentoring experience in one word
						</label>
						<input
							type="text"
							value={formData.one_word_summary}
							onChange={(e) =>
								handleFieldChange("one_word_summary", e.target.value)
							}
							placeholder="e.g., transformative, insightful, challenging, supportive..."
							className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.one_word_summary ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.one_word_summary && (
							<p className="text-sm text-red-500 mt-1">
								{errors.one_word_summary}
							</p>
						)}
					</div>

					{showSummary && (
						<div className="mt-8">
							<p
								className="text-sm font-medium mb-4"
								style={{ color: "#5C7F4F" }}
							>
								Your reflection has been saved! Here's your summary:
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
								<CommunityIcon size={64} />
							</div>
							<div>
								<h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
									Mentoring Reflection
								</h2>
								<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
									Process insights and celebrate your mentoring growth
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

export default MentoringReflectionAccessible;
