import {
	Activity,
	AlertTriangle,
	BarChart3,
	Brain,
	CheckCircle,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	Copy,
	FileCheck,
	Heart,
	RefreshCw,
	Save,
	Sparkles,
	TrendingUp,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import {
	type PostAssignmentDebriefData,
	type PreAssignmentPrepData,
	supabase,
} from "../lib/supabase";
import { directInsertReflection } from "../services/directSupabaseApi";

interface PostAssignmentDebriefEnhancedProps {
	onComplete?: (data: PostAssignmentDebriefData) => void;
	onClose: () => void;
	prepDataId?: string; // Optional ID to link with pre-assignment prep
}

// Common emotion options for Emotion RAG integration
const EMOTION_OPTIONS = [
	"Relieved",
	"Proud",
	"Exhausted",
	"Satisfied",
	"Frustrated",
	"Accomplished",
	"Anxious",
	"Energized",
	"Disappointed",
	"Calm",
	"Confident",
	"Overwhelmed",
	"Grateful",
	"Uncertain",
	"Empowered",
];

export const PostAssignmentDebriefEnhanced: React.FC<
	PostAssignmentDebriefEnhancedProps
> = ({ onComplete, onClose, prepDataId }) => {
	console.log("PostAssignmentDebriefEnhanced - Component rendering");
	const { user } = useAuth();
	const [currentSection, setCurrentSection] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [showSummary, setShowSummary] = useState(false);
	const [summaryText, setSummaryText] = useState("");
	const [copiedSummary, setCopiedSummary] = useState(false);
	const [prepData, setPrepData] = useState<PreAssignmentPrepData | null>(null);
	const [showPrepData, setShowPrepData] = useState(false);
	const startTime = Date.now();

	// Form state for all fields
	console.log("PostAssignmentDebriefEnhanced - Initializing state");
	const [formData, setFormData] = useState<PostAssignmentDebriefData>({
		linked_prep_id: prepDataId,

		// Quick Insight
		experience_word: "",
		most_unexpected: "",
		performance_satisfaction: 5,

		// Section 1: Revisiting Predictions
		confidence_accuracy: "",
		challenges_reflection: "",
		preparation_effectiveness: "",
		emotional_evolution: "",
		intention_maintenance: "",

		// Section 2: Assignment Execution
		assignment_unfolded: "",
		strategies_used: "",
		cognitive_load_management: "",
		technical_aspects: "",
		environmental_factors: "",
		technical_accuracy: 7,
		communication_effectiveness: 7,

		// Section 3: Emotional Experience
		emotions_during: [],
		body_experience: "",
		flow_struggle_moments: "",
		stress_management: "",
		self_regulation: "",
		current_emotional_state: "",

		// Section 4: Challenges & Adaptations
		unexpected_challenges: "",
		real_time_adaptations: "",
		problem_solving_moment: "",
		support_needed: "",
		unfamiliar_content_handling: "",
		would_do_differently: "",

		// Section 5: Growth & Learning
		skills_strengthened: "",
		new_capabilities: "",
		approach_changes: "",
		feedback_received: "",
		pattern_recognition: "",

		// Section 6: Recovery & Integration
		recovery_practices: "",
		completion_needs: "",
		unresolved_concerns: "",
		future_boundaries: "",
		celebration_acknowledgment: "",

		// Wellness Check
		energy_level_post: 5,
		stress_level_post: 5,
		accomplishment_sense: 7,
		future_confidence: 7,
		current_state_word: "",

		// Comparative Reflection
		confidence_comparison: "",
		challenges_comparison: "",
		preparedness_comparison: "",
		emotional_comparison: "",

		// Closing Synthesis
		three_insights: [],
		proudest_moment: "",

		// Metadata
		timestamp: new Date().toISOString(),
	});

	// Load prep data if available
	useEffect(() => {
		console.log("PostAssignmentDebriefEnhanced - Component mounted");
		const loadPrepData = async () => {
			if (!user || !prepDataId) return;

			try {
				const { data, error } = await supabase
					.from("reflection_entries")
					.select("*")
					.eq("user_id", user.id)
					.eq("entry_kind", "pre_assignment_prep")
					.order("created_at", { ascending: false })
					.limit(1)
					.single();

				if (data && !error) {
					const prepContent = data.data as PreAssignmentPrepData;
					setPrepData(prepContent);
					setFormData((prev) => ({
						...prev,
						linked_prep_id: data.id,
						prep_data_referenced: prepContent,
						assignment_id: prepContent.assignment_id,
					}));
				}
			} catch (err) {
				console.error("Error loading prep data:", err);
			}
		};

		loadPrepData();
	}, [user, prepDataId]);

	const handleFieldChange = (
		field: keyof PostAssignmentDebriefData,
		value: any,
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
		// Clear error for this field
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const handleEmotionToggle = (emotion: string) => {
		const currentEmotions = formData.emotions_during || [];
		if (currentEmotions.includes(emotion)) {
			handleFieldChange(
				"emotions_during",
				currentEmotions.filter((e) => e !== emotion),
			);
		} else {
			handleFieldChange("emotions_during", [...currentEmotions, emotion]);
		}
	};

	const validateSection = (sectionIndex: number): boolean => {
		const newErrors: Record<string, string> = {};

		switch (sectionIndex) {
			case 0: // Quick Insight
				if (!formData.experience_word.trim()) {
					newErrors.experience_word = "Please provide one word";
				}
				if (!formData.most_unexpected.trim()) {
					newErrors.most_unexpected = "Please describe the unexpected aspect";
				}
				break;
			case 1: // Revisiting Predictions
				if (!formData.confidence_accuracy.trim()) {
					newErrors.confidence_accuracy =
						"Please reflect on your confidence assessment";
				}
				break;
			case 2: // Assignment Execution
				if (!formData.assignment_unfolded.trim()) {
					newErrors.assignment_unfolded =
						"Please describe how the assignment unfolded";
				}
				if (!formData.strategies_used.trim()) {
					newErrors.strategies_used = "Please describe the strategies you used";
				}
				break;
			case 3: // Emotional Experience
				if (formData.emotions_during.length === 0) {
					newErrors.emotions_during = "Please select at least one emotion";
				}
				if (!formData.body_experience.trim()) {
					newErrors.body_experience =
						"Please describe your physical experience";
				}
				break;
			case 4: // Challenges & Adaptations
				if (!formData.unexpected_challenges.trim()) {
					newErrors.unexpected_challenges = "Please describe any challenges";
				}
				break;
			case 5: // Growth & Learning
				if (!formData.skills_strengthened.trim()) {
					newErrors.skills_strengthened = "Please identify skills strengthened";
				}
				break;
			case 6: // Recovery & Integration
				if (!formData.recovery_practices.trim()) {
					newErrors.recovery_practices = "Please describe recovery practices";
				}
				break;
			case 7: // Wellness Check
				if (!formData.current_state_word.trim()) {
					newErrors.current_state_word = "Please provide one word";
				}
				break;
			case 8: // Comparative Reflection
				// Optional section, no required fields
				break;
			case 9: // Closing Synthesis
				if (formData.three_insights.filter((i) => i.trim()).length < 3) {
					newErrors.three_insights = "Please provide three insights";
				}
				if (!formData.proudest_moment.trim()) {
					newErrors.proudest_moment = "Please share what you're proud of";
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
			}
		}
	};

	const handlePrev = () => {
		if (currentSection > 0) {
			setCurrentSection(currentSection - 1);
		}
	};

	const generateComparativeAnalysis = () => {
		if (!prepData) return "";

		return `COMPARATIVE ANALYSIS
    
Pre-Assignment → Post-Assignment:
• Confidence: ${prepData.confidence_level}/10 → ${formData.future_confidence}/10
• Stress: ${prepData.stress_anxiety_level}/10 → ${formData.stress_level_post}/10
• Energy: ${prepData.energy_level}/10 → ${formData.energy_level_post}/10
• Preparedness: ${prepData.preparedness_rating}/10 → Accomplishment: ${formData.accomplishment_sense}/10

Emotional Journey:
• Pre: ${prepData.current_emotions.join(", ")}
• Post: ${formData.emotions_during.join(", ")}
• Current: ${formData.current_emotional_state}

Challenges Anticipated vs. Actual:
• Expected: ${prepData.anticipated_challenges}
• Actual: ${formData.unexpected_challenges}

Growth Indicators:
• Skills Strengthened: ${formData.skills_strengthened}
• New Capabilities: ${formData.new_capabilities}
• Future Confidence: ${formData.future_confidence}/10`;
	};

	const generateSummary = () => {
		const comparative = prepData ? generateComparativeAnalysis() : "";

		const summary = `POST-ASSIGNMENT DEBRIEF SUMMARY
    
Experience: ${formData.experience_word}
Performance Satisfaction: ${formData.performance_satisfaction}/10
Technical Accuracy: ${formData.technical_accuracy}/10
Communication Effectiveness: ${formData.communication_effectiveness}/10

KEY INSIGHTS:
${formData.three_insights.map((insight, i) => `${i + 1}. ${insight}`).join("\n")}

PROUDEST MOMENT:
${formData.proudest_moment}

SKILLS STRENGTHENED:
${formData.skills_strengthened}

RECOVERY PLAN:
${formData.recovery_practices}

${comparative}

Generated: ${new Date().toLocaleString()}`;

		setSummaryText(summary);
		setShowSummary(true);
	};

	const handleSave = async () => {
		console.log("PostAssignmentDebriefEnhanced - handleSave called");
		if (!validateSection(currentSection)) return;

		setIsSaving(true);
		const endTime = Date.now();
		const duration = Math.round((endTime - startTime) / 1000);

		try {
			if (!user) {
				throw new Error("User not authenticated");
			}

			console.log(
				"PostAssignmentDebriefEnhanced - User authenticated, preparing to save",
			);

			// Determine analytics flags
			const highStressSuccess =
				prepData &&
				prepData.stress_anxiety_level >= 7 &&
				formData.performance_satisfaction >= 7;

			const flowStateAchieved = formData.flow_struggle_moments
				.toLowerCase()
				.includes("flow");

			const finalData = {
				...formData,
				completion_time: duration,
				high_stress_success: highStressSuccess,
				flow_state_achieved: flowStateAchieved,
				// Connect to Emotion RAG
				emotion_patterns: formData.emotions_during,
			};

			// Save to database using direct API
			const accessToken = JSON.parse(
				localStorage.getItem("session") || "{}",
			).access_token;

			const reflectionData = {
				user_id: user.id,
				entry_kind: "post_assignment_debrief",
				data: finalData,
				reflection_id: crypto.randomUUID(),
			};

			console.log(
				"PostAssignmentDebriefEnhanced - Calling directInsertReflection with:",
				reflectionData,
			);
			const { data, error } = await directInsertReflection(
				reflectionData,
				accessToken,
			);
			console.log(
				"PostAssignmentDebriefEnhanced - directInsertReflection response:",
				{
					data,
					error,
				},
			);

			if (error) {
				console.error("PostAssignmentDebriefEnhanced - Error saving:", error);
				throw error;
			}

			console.log("PostAssignmentDebriefEnhanced - Saved successfully:", data);

			// Generate summary
			generateSummary();

			// Feed to Growth Insights
			console.log("Feeding to Growth Insights:", {
				skills: formData.skills_strengthened,
				confidence: formData.future_confidence,
				patterns: formData.pattern_recognition,
			});

			setIsSaving(false);

			// Close immediately after successful save
			if (onComplete) {
				onComplete(finalData);
			}
			setTimeout(() => {
				onClose();
			}, 100); // Small delay to ensure state updates
		} catch (error) {
			console.error("Error saving debrief:", error);
			setErrors({ save: "Failed to save debrief. Please try again." });
		} finally {
			setIsSaving(false);
		}
	};

	const sections = [
		{
			title: "Quick Insight Capture",
			icon: <Brain className="w-5 h-5" />,
			content: (
				<div className="space-y-6">
					<div
						className="p-6 rounded-xl"
						style={{
							background:
								"linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)",
							border: "1px solid rgba(16, 185, 129, 0.2)",
						}}
					>
						<h3
							className="text-lg font-semibold mb-4"
							style={{ color: "#047857" }}
						>
							Opening Context
						</h3>
						<p className="mb-6" style={{ color: "#5A5A5A" }}>
							Now that you've completed your interpreting assignment, let's
							debrief your experience, process any emotions, and capture
							learnings for future growth. This reflection directly connects to
							your pre-assignment preparation.
						</p>

						<div className="space-y-6">
							<div>
								<label
									className="block text-sm font-medium mb-2"
									style={{ color: "#047857" }}
								>
									In one word, how would you describe this assignment
									experience?
								</label>
								<input
									type="text"
									value={formData.experience_word}
									onChange={(e) =>
										handleFieldChange("experience_word", e.target.value)
									}
									placeholder="Enter one word..."
									className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
									style={{
										borderColor: errors.experience_word ? "#ef4444" : "#E5E7EB",
									}}
								/>
								{errors.experience_word && (
									<p className="text-sm text-red-500 mt-1">
										{errors.experience_word}
									</p>
								)}
							</div>

							<div>
								<label
									className="block text-sm font-medium mb-2"
									style={{ color: "#047857" }}
								>
									What was the most unexpected aspect of this assignment?
								</label>
								<textarea
									value={formData.most_unexpected}
									onChange={(e) =>
										handleFieldChange("most_unexpected", e.target.value)
									}
									placeholder="Describe what surprised you..."
									rows={3}
									className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
									style={{
										borderColor: errors.most_unexpected ? "#ef4444" : "#E5E7EB",
									}}
								/>
								{errors.most_unexpected && (
									<p className="text-sm text-red-500 mt-1">
										{errors.most_unexpected}
									</p>
								)}
							</div>

							<div>
								<label
									className="block text-sm font-medium mb-2"
									style={{ color: "#047857" }}
								>
									Overall, how satisfied are you with your performance? (1-10)
								</label>
								<div className="flex items-center space-x-4">
									<input
										type="range"
										min="1"
										max="10"
										value={formData.performance_satisfaction}
										onChange={(e) =>
											handleFieldChange(
												"performance_satisfaction",
												Number(e.target.value),
											)
										}
										className="flex-1"
										style={{ accentColor: "#2e7d32" }}
									/>
									<span
										className="w-12 text-center font-semibold text-lg"
										style={{ color: "#1A1A1A" }}
									>
										{formData.performance_satisfaction}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			),
		},
		{
			title: "Revisiting Your Predictions",
			icon: <TrendingUp className="w-5 h-5" />,
			content: (
				<div className="space-y-6">
					{/* Show prep data if available */}
					{prepData && (
						<div className="mb-6">
							<button
								onClick={() => setShowPrepData(!showPrepData)}
								className="flex items-center space-x-2 text-sm font-medium"
								style={{ color: "#047857" }}
							>
								{showPrepData ? <ChevronUp /> : <ChevronDown />}
								<span>View Your Pre-Assignment Responses</span>
							</button>

							{showPrepData && (
								<div
									className="mt-4 p-4 rounded-lg text-sm"
									style={{
										backgroundColor: "rgba(16, 185, 129, 0.05)",
										border: "1px solid rgba(16, 185, 129, 0.2)",
									}}
								>
									<div className="space-y-3">
										<div>
											<span className="font-medium">Assignment Type:</span>{" "}
											{prepData.assignment_type} ({prepData.assignment_format})
										</div>
										<div>
											<span className="font-medium">Pre-Confidence:</span>{" "}
											{prepData.confidence_level}/10
										</div>
										<div>
											<span className="font-medium">
												Anticipated Challenges:
											</span>{" "}
											{prepData.anticipated_challenges}
										</div>
										<div>
											<span className="font-medium">Key Strategies:</span>{" "}
											{prepData.key_strategies}
										</div>
										<div>
											<span className="font-medium">Initial Emotions:</span>{" "}
											{prepData.current_emotions.join(", ")}
										</div>
										<div>
											<span className="font-medium">Your Intention:</span>{" "}
											{prepData.assignment_intention}
										</div>
										<div>
											<span className="font-medium">Preparedness Rating:</span>{" "}
											{prepData.preparedness_rating}/10
										</div>
									</div>
								</div>
							)}
						</div>
					)}

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							{prepData ? (
								<>
									You rated your confidence as{" "}
									<strong>{prepData.confidence_level}/10</strong>. How accurate
									was that self-assessment?
								</>
							) : (
								"How accurate was your pre-assignment confidence assessment?"
							)}
						</label>
						<textarea
							value={formData.confidence_accuracy}
							onChange={(e) =>
								handleFieldChange("confidence_accuracy", e.target.value)
							}
							placeholder="Reflect on your confidence prediction..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
							style={{
								borderColor: errors.confidence_accuracy ? "#ef4444" : "#E5E7EB",
							}}
						/>
						{errors.confidence_accuracy && (
							<p className="text-sm text-red-500 mt-1">
								{errors.confidence_accuracy}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							{prepData ? (
								<>
									You anticipated:{" "}
									<strong>{prepData.anticipated_challenges}</strong>. Which
									actually occurred? Which didn't?
								</>
							) : (
								"Reflect on your anticipated challenges vs. actual challenges"
							)}
						</label>
						<textarea
							value={formData.challenges_reflection}
							onChange={(e) =>
								handleFieldChange("challenges_reflection", e.target.value)
							}
							placeholder="Compare anticipated vs. actual challenges..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							{prepData ? (
								<>
									Your preparation included:{" "}
									<strong>{prepData.preparation_completed}</strong>. What was
									most/least helpful?
								</>
							) : (
								"What aspects of your preparation were most and least helpful?"
							)}
						</label>
						<textarea
							value={formData.preparation_effectiveness}
							onChange={(e) =>
								handleFieldChange("preparation_effectiveness", e.target.value)
							}
							placeholder="Evaluate your preparation effectiveness..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							{prepData ? (
								<>
									You felt{" "}
									<strong>{prepData.current_emotions.join(", ")}</strong> before
									starting. How did your emotional state evolve?
								</>
							) : (
								"How did your emotional state evolve throughout the assignment?"
							)}
						</label>
						<textarea
							value={formData.emotional_evolution}
							onChange={(e) =>
								handleFieldChange("emotional_evolution", e.target.value)
							}
							placeholder="Describe your emotional journey..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							{prepData ? (
								<>
									Looking at your intention: "
									<strong>{prepData.assignment_intention}</strong>". How well
									did you maintain this?
								</>
							) : (
								"How well did you maintain your pre-assignment intention?"
							)}
						</label>
						<textarea
							value={formData.intention_maintenance}
							onChange={(e) =>
								handleFieldChange("intention_maintenance", e.target.value)
							}
							placeholder="Reflect on maintaining your intention..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>
				</div>
			),
		},
		{
			title: "Assignment Execution & Performance",
			icon: <Activity className="w-5 h-5" />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							Describe how the assignment actually unfolded vs. your
							expectations
						</label>
						<textarea
							value={formData.assignment_unfolded}
							onChange={(e) =>
								handleFieldChange("assignment_unfolded", e.target.value)
							}
							placeholder="Compare reality with expectations..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
							style={{
								borderColor: errors.assignment_unfolded ? "#ef4444" : "#E5E7EB",
							}}
						/>
						{errors.assignment_unfolded && (
							<p className="text-sm text-red-500 mt-1">
								{errors.assignment_unfolded}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							What interpreting strategies did you actually use? Which were most
							effective?
						</label>
						<textarea
							value={formData.strategies_used}
							onChange={(e) =>
								handleFieldChange("strategies_used", e.target.value)
							}
							placeholder="Describe strategies and their effectiveness..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
							style={{
								borderColor: errors.strategies_used ? "#ef4444" : "#E5E7EB",
							}}
						/>
						{errors.strategies_used && (
							<p className="text-sm text-red-500 mt-1">
								{errors.strategies_used}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							How did you manage cognitive load throughout the assignment?
						</label>
						<textarea
							value={formData.cognitive_load_management}
							onChange={(e) =>
								handleFieldChange("cognitive_load_management", e.target.value)
							}
							placeholder="Describe your cognitive load management..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					{/* Conditional fields based on assignment format */}
					{prepData &&
						(prepData.assignment_format === "virtual" ||
							prepData.assignment_format === "hybrid") && (
							<div>
								<label
									className="block text-sm font-medium mb-2"
									style={{ color: "#047857" }}
								>
									How did technical aspects impact your performance?
								</label>
								<textarea
									value={formData.technical_aspects || ""}
									onChange={(e) =>
										handleFieldChange("technical_aspects", e.target.value)
									}
									placeholder="Describe technical challenges or successes..."
									rows={3}
									className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
								/>
							</div>
						)}

					{prepData &&
						(prepData.assignment_format === "in-person" ||
							prepData.assignment_format === "hybrid") && (
							<div>
								<label
									className="block text-sm font-medium mb-2"
									style={{ color: "#047857" }}
								>
									How did environmental factors affect your work?
								</label>
								<textarea
									value={formData.environmental_factors || ""}
									onChange={(e) =>
										handleFieldChange("environmental_factors", e.target.value)
									}
									placeholder="Describe environmental impacts..."
									rows={3}
									className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
								/>
							</div>
						)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#047857" }}
							>
								Rate your technical accuracy (1-10)
							</label>
							<div className="flex items-center space-x-4">
								<input
									type="range"
									min="1"
									max="10"
									value={formData.technical_accuracy}
									onChange={(e) =>
										handleFieldChange(
											"technical_accuracy",
											Number(e.target.value),
										)
									}
									className="flex-1"
									style={{ accentColor: "#10B981" }}
								/>
								<span
									className="w-12 text-center font-semibold"
									style={{ color: "#1A1A1A" }}
								>
									{formData.technical_accuracy}
								</span>
							</div>
						</div>

						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#047857" }}
							>
								Rate your communication effectiveness (1-10)
							</label>
							<div className="flex items-center space-x-4">
								<input
									type="range"
									min="1"
									max="10"
									value={formData.communication_effectiveness}
									onChange={(e) =>
										handleFieldChange(
											"communication_effectiveness",
											Number(e.target.value),
										)
									}
									className="flex-1"
									style={{ accentColor: "#10B981" }}
								/>
								<span
									className="w-12 text-center font-semibold"
									style={{ color: "#1A1A1A" }}
								>
									{formData.communication_effectiveness}
								</span>
							</div>
						</div>
					</div>
				</div>
			),
		},
		{
			title: "Emotional & Physical Experience",
			icon: <Heart className="w-5 h-5" />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							What emotions arose during the assignment? (select all that apply)
						</label>
						<div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
							{EMOTION_OPTIONS.map((emotion) => (
								<button
									key={emotion}
									onClick={() => handleEmotionToggle(emotion)}
									className={`px-3 py-2 rounded-lg text-sm transition-all ${
										formData.emotions_during.includes(emotion)
											? "bg-emerald-500 text-white"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									{emotion}
								</button>
							))}
						</div>
						{formData.emotions_during.length > 0 && (
							<div className="p-3 rounded-lg bg-emerald-50">
								<p className="text-sm text-emerald-700">
									Selected: {formData.emotions_during.join(", ")}
								</p>
							</div>
						)}
						{errors.emotions_during && (
							<p className="text-sm text-red-500 mt-1">
								{errors.emotions_during}
							</p>
						)}
						<input
							type="text"
							value={formData.custom_emotions || ""}
							onChange={(e) =>
								handleFieldChange("custom_emotions", e.target.value)
							}
							placeholder="Other emotions (comma-separated)..."
							className="w-full mt-2 px-4 py-2 border rounded-lg"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							Where did you notice tension or ease in your body during the work?
						</label>
						<textarea
							value={formData.body_experience}
							onChange={(e) =>
								handleFieldChange("body_experience", e.target.value)
							}
							placeholder="Describe physical sensations and their locations..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
							style={{
								borderColor: errors.body_experience ? "#ef4444" : "#E5E7EB",
							}}
						/>
						{errors.body_experience && (
							<p className="text-sm text-red-500 mt-1">
								{errors.body_experience}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							Describe any moments of flow or struggle you experienced
						</label>
						<textarea
							value={formData.flow_struggle_moments}
							onChange={(e) =>
								handleFieldChange("flow_struggle_moments", e.target.value)
							}
							placeholder="Identify when you felt in flow vs. struggling..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							How did you manage stress or overwhelm if/when it arose?
						</label>
						<textarea
							value={formData.stress_management}
							onChange={(e) =>
								handleFieldChange("stress_management", e.target.value)
							}
							placeholder="Describe your stress management in action..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							What self-regulation strategies did you use? How effective were
							they?
						</label>
						<textarea
							value={formData.self_regulation}
							onChange={(e) =>
								handleFieldChange("self_regulation", e.target.value)
							}
							placeholder="Evaluate your self-regulation strategies..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							Current emotional state:
						</label>
						<input
							type="text"
							value={formData.current_emotional_state}
							onChange={(e) =>
								handleFieldChange("current_emotional_state", e.target.value)
							}
							placeholder="Describe how you're feeling right now..."
							className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
						/>
					</div>
				</div>
			),
		},
		{
			title: "Challenges & Adaptations",
			icon: <AlertTriangle className="w-5 h-5" />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							What unexpected challenges arose during the assignment?
						</label>
						<textarea
							value={formData.unexpected_challenges}
							onChange={(e) =>
								handleFieldChange("unexpected_challenges", e.target.value)
							}
							placeholder="Describe challenges you didn't anticipate..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
							style={{
								borderColor: errors.unexpected_challenges
									? "#ef4444"
									: "#E5E7EB",
							}}
						/>
						{errors.unexpected_challenges && (
							<p className="text-sm text-red-500 mt-1">
								{errors.unexpected_challenges}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							How did you adapt your approach in real-time?
						</label>
						<textarea
							value={formData.real_time_adaptations}
							onChange={(e) =>
								handleFieldChange("real_time_adaptations", e.target.value)
							}
							placeholder="Describe your adaptations and pivots..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							Describe a specific moment where you had to problem-solve quickly
						</label>
						<textarea
							value={formData.problem_solving_moment}
							onChange={(e) =>
								handleFieldChange("problem_solving_moment", e.target.value)
							}
							placeholder="Share a specific problem-solving example..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							What support did you need but didn't have?
						</label>
						<textarea
							value={formData.support_needed}
							onChange={(e) =>
								handleFieldChange("support_needed", e.target.value)
							}
							placeholder="Identify missing support or resources..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							If you encountered unfamiliar content, how did you handle it?
						</label>
						<textarea
							value={formData.unfamiliar_content_handling}
							onChange={(e) =>
								handleFieldChange("unfamiliar_content_handling", e.target.value)
							}
							placeholder="Describe your approach to unfamiliar material..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							What would you do differently if you could repeat this assignment?
						</label>
						<textarea
							value={formData.would_do_differently}
							onChange={(e) =>
								handleFieldChange("would_do_differently", e.target.value)
							}
							placeholder="Identify specific changes you'd make..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>
				</div>
			),
		},
		{
			title: "Growth & Learning",
			icon: <TrendingUp className="w-5 h-5" />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							What skills did you strengthen through this assignment?
						</label>
						<textarea
							value={formData.skills_strengthened}
							onChange={(e) =>
								handleFieldChange("skills_strengthened", e.target.value)
							}
							placeholder="Identify specific skills that improved..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
							style={{
								borderColor: errors.skills_strengthened ? "#ef4444" : "#E5E7EB",
							}}
						/>
						{errors.skills_strengthened && (
							<p className="text-sm text-red-500 mt-1">
								{errors.skills_strengthened}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							What new capabilities or confidence did you discover?
						</label>
						<textarea
							value={formData.new_capabilities}
							onChange={(e) =>
								handleFieldChange("new_capabilities", e.target.value)
							}
							placeholder="Describe newfound abilities or confidence..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							How has this assignment changed your approach to interpretation?
						</label>
						<textarea
							value={formData.approach_changes}
							onChange={(e) =>
								handleFieldChange("approach_changes", e.target.value)
							}
							placeholder="Describe shifts in your approach or mindset..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							What specific feedback did you receive (if any)? How will you
							integrate it?
						</label>
						<textarea
							value={formData.feedback_received}
							onChange={(e) =>
								handleFieldChange("feedback_received", e.target.value)
							}
							placeholder="Share feedback and integration plans..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							What patterns are you noticing across recent assignments?
						</label>
						<textarea
							value={formData.pattern_recognition}
							onChange={(e) =>
								handleFieldChange("pattern_recognition", e.target.value)
							}
							placeholder="Identify recurring themes or patterns..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>
				</div>
			),
		},
		{
			title: "Recovery & Integration",
			icon: <RefreshCw className="w-5 h-5" />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							What self-care or recovery practices have you done/will you do?
						</label>
						<textarea
							value={formData.recovery_practices}
							onChange={(e) =>
								handleFieldChange("recovery_practices", e.target.value)
							}
							placeholder="List recovery activities completed or planned..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
							style={{
								borderColor: errors.recovery_practices ? "#ef4444" : "#E5E7EB",
							}}
						/>
						{errors.recovery_practices && (
							<p className="text-sm text-red-500 mt-1">
								{errors.recovery_practices}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							What do you need to feel fully complete with this assignment?
						</label>
						<textarea
							value={formData.completion_needs}
							onChange={(e) =>
								handleFieldChange("completion_needs", e.target.value)
							}
							placeholder="Identify what you need for closure..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							Are there any unresolved feelings or concerns to address?
						</label>
						<textarea
							value={formData.unresolved_concerns}
							onChange={(e) =>
								handleFieldChange("unresolved_concerns", e.target.value)
							}
							placeholder="Share any lingering concerns..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							What boundary or practice will you maintain for next time?
						</label>
						<textarea
							value={formData.future_boundaries}
							onChange={(e) =>
								handleFieldChange("future_boundaries", e.target.value)
							}
							placeholder="Identify boundaries or practices to maintain..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							How will you celebrate or acknowledge your effort?
						</label>
						<textarea
							value={formData.celebration_acknowledgment}
							onChange={(e) =>
								handleFieldChange("celebration_acknowledgment", e.target.value)
							}
							placeholder="Describe your celebration or acknowledgment..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>
				</div>
			),
		},
		{
			title: "Post-Assignment Wellness Check",
			icon: <Activity className="w-5 h-5" />,
			content: (
				<div className="space-y-6">
					<div
						className="p-6 rounded-xl"
						style={{
							background:
								"linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)",
							border: "1px solid rgba(16, 185, 129, 0.2)",
						}}
					>
						<h3
							className="text-lg font-semibold mb-4"
							style={{ color: "#047857" }}
						>
							Wellness Metrics
						</h3>

						<div className="space-y-6">
							<div>
								<label
									className="block text-sm font-medium mb-2"
									style={{ color: "#047857" }}
								>
									Current energy level (1-10)
								</label>
								<div className="flex items-center space-x-4">
									<input
										type="range"
										min="1"
										max="10"
										value={formData.energy_level_post}
										onChange={(e) =>
											handleFieldChange(
												"energy_level_post",
												Number(e.target.value),
											)
										}
										className="flex-1"
										style={{ accentColor: "#2e7d32" }}
									/>
									<span
										className="w-12 text-center font-semibold text-lg"
										style={{ color: "#1A1A1A" }}
									>
										{formData.energy_level_post}
									</span>
								</div>
								{prepData && (
									<p className="text-sm text-gray-600 mt-1">
										Pre-assignment: {prepData.energy_level}/10 → Post:{" "}
										{formData.energy_level_post}
										/10
									</p>
								)}
							</div>

							<div>
								<label
									className="block text-sm font-medium mb-2"
									style={{ color: "#047857" }}
								>
									Stress/tension level (1-10)
								</label>
								<div className="flex items-center space-x-4">
									<input
										type="range"
										min="1"
										max="10"
										value={formData.stress_level_post}
										onChange={(e) =>
											handleFieldChange(
												"stress_level_post",
												Number(e.target.value),
											)
										}
										className="flex-1"
										style={{
											accentColor:
												formData.stress_level_post >= 7 ? "#EF4444" : "#2e7d32",
										}}
									/>
									<span
										className="w-12 text-center font-semibold text-lg"
										style={{
											color:
												formData.stress_level_post >= 7 ? "#EF4444" : "#1A1A1A",
										}}
									>
										{formData.stress_level_post}
									</span>
								</div>
								{prepData && (
									<p className="text-sm text-gray-600 mt-1">
										Pre-assignment: {prepData.stress_anxiety_level}/10 → Post:{" "}
										{formData.stress_level_post}/10
									</p>
								)}
							</div>

							<div>
								<label
									className="block text-sm font-medium mb-2"
									style={{ color: "#047857" }}
								>
									Sense of accomplishment (1-10)
								</label>
								<div className="flex items-center space-x-4">
									<input
										type="range"
										min="1"
										max="10"
										value={formData.accomplishment_sense}
										onChange={(e) =>
											handleFieldChange(
												"accomplishment_sense",
												Number(e.target.value),
											)
										}
										className="flex-1"
										style={{ accentColor: "#2e7d32" }}
									/>
									<span
										className="w-12 text-center font-semibold text-lg"
										style={{ color: "#1A1A1A" }}
									>
										{formData.accomplishment_sense}
									</span>
								</div>
							</div>

							<div>
								<label
									className="block text-sm font-medium mb-2"
									style={{ color: "#047857" }}
								>
									Confidence for similar future assignments (1-10)
								</label>
								<div className="flex items-center space-x-4">
									<input
										type="range"
										min="1"
										max="10"
										value={formData.future_confidence}
										onChange={(e) =>
											handleFieldChange(
												"future_confidence",
												Number(e.target.value),
											)
										}
										className="flex-1"
										style={{ accentColor: "#2e7d32" }}
									/>
									<span
										className="w-12 text-center font-semibold text-lg"
										style={{ color: "#1A1A1A" }}
									>
										{formData.future_confidence}
									</span>
								</div>
								{prepData && (
									<p className="text-sm text-gray-600 mt-1">
										Pre-assignment confidence: {prepData.confidence_level}/10 →
										Future confidence: {formData.future_confidence}/10
									</p>
								)}
							</div>

							<div>
								<label
									className="block text-sm font-medium mb-2"
									style={{ color: "#047857" }}
								>
									One word describing how you feel now
								</label>
								<input
									type="text"
									value={formData.current_state_word}
									onChange={(e) =>
										handleFieldChange("current_state_word", e.target.value)
									}
									placeholder="Enter one word..."
									className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
									style={{
										borderColor: errors.current_state_word
											? "#ef4444"
											: "#E5E7EB",
									}}
								/>
								{errors.current_state_word && (
									<p className="text-sm text-red-500 mt-1">
										{errors.current_state_word}
									</p>
								)}
								{prepData && prepData.current_state_word && (
									<p className="text-sm text-gray-600 mt-1">
										Pre-assignment word: "{prepData.current_state_word}"
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			),
		},
		{
			title: "Comparative Reflection",
			icon: <BarChart3 className="w-5 h-5" />,
			content: (
				<div className="space-y-6">
					{prepData && (
						<div
							className="p-4 rounded-lg mb-6"
							style={{
								backgroundColor: "rgba(16, 185, 129, 0.05)",
								border: "1px solid rgba(16, 185, 129, 0.2)",
							}}
						>
							<h4 className="font-medium mb-3" style={{ color: "#047857" }}>
								Pre vs. Post Comparison
							</h4>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="font-medium">Confidence:</span>{" "}
									{prepData.confidence_level}/10 → {formData.future_confidence}
									/10
								</div>
								<div>
									<span className="font-medium">Stress:</span>{" "}
									{prepData.stress_anxiety_level}/10 →{" "}
									{formData.stress_level_post}/10
								</div>
								<div>
									<span className="font-medium">Energy:</span>{" "}
									{prepData.energy_level}/10 → {formData.energy_level_post}/10
								</div>
								<div>
									<span className="font-medium">
										Preparedness → Accomplishment:
									</span>{" "}
									{prepData.preparedness_rating}/10 →{" "}
									{formData.accomplishment_sense}/10
								</div>
							</div>
						</div>
					)}

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							Reflect on your confidence journey from pre to post-assignment
						</label>
						<textarea
							value={formData.confidence_comparison}
							onChange={(e) =>
								handleFieldChange("confidence_comparison", e.target.value)
							}
							placeholder="Compare your confidence levels..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							Compare expected challenges vs. actual challenges
						</label>
						<textarea
							value={formData.challenges_comparison}
							onChange={(e) =>
								handleFieldChange("challenges_comparison", e.target.value)
							}
							placeholder="Analyze challenge predictions..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							Evaluate your preparedness rating vs. actual readiness
						</label>
						<textarea
							value={formData.preparedness_comparison}
							onChange={(e) =>
								handleFieldChange("preparedness_comparison", e.target.value)
							}
							placeholder="Assess preparedness accuracy..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							Compare your initial emotional state to your current state
						</label>
						<textarea
							value={formData.emotional_comparison}
							onChange={(e) =>
								handleFieldChange("emotional_comparison", e.target.value)
							}
							placeholder="Describe your emotional journey..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
						/>
					</div>
				</div>
			),
		},
		{
			title: "Closing Synthesis",
			icon: <Sparkles className="w-5 h-5" />,
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							Based on this experience, what are three specific insights you'll
							apply to future assignments?
						</label>
						<div className="space-y-3">
							{[0, 1, 2].map((index) => (
								<input
									key={index}
									type="text"
									value={formData.three_insights[index] || ""}
									onChange={(e) => {
										const insights = [...formData.three_insights];
										insights[index] = e.target.value;
										handleFieldChange("three_insights", insights);
									}}
									placeholder={`Insight ${index + 1}...`}
									className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
									style={{
										borderColor:
											errors.three_insights &&
											!formData.three_insights[index]?.trim()
												? "#ef4444"
												: "#E5E7EB",
									}}
								/>
							))}
							{errors.three_insights && (
								<p className="text-sm text-red-500">{errors.three_insights}</p>
							)}
						</div>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#047857" }}
						>
							What one thing are you most proud of from this assignment?
						</label>
						<textarea
							value={formData.proudest_moment}
							onChange={(e) =>
								handleFieldChange("proudest_moment", e.target.value)
							}
							placeholder="Share your proudest achievement or moment..."
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500"
							style={{
								borderColor: errors.proudest_moment ? "#ef4444" : "#E5E7EB",
							}}
						/>
						{errors.proudest_moment && (
							<p className="text-sm text-red-500 mt-1">
								{errors.proudest_moment}
							</p>
						)}
					</div>

					<div
						className="p-6 rounded-xl"
						style={{
							background:
								"linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)",
							border: "1px solid rgba(16, 185, 129, 0.2)",
						}}
					>
						<h3
							className="text-lg font-semibold mb-4"
							style={{ color: "#047857" }}
						>
							Growth Summary
						</h3>
						<div className="space-y-2 text-sm">
							<p>
								<strong>Performance Satisfaction:</strong>{" "}
								{formData.performance_satisfaction}/10
							</p>
							<p>
								<strong>Technical Accuracy:</strong>{" "}
								{formData.technical_accuracy}/10
							</p>
							<p>
								<strong>Communication Effectiveness:</strong>{" "}
								{formData.communication_effectiveness}
								/10
							</p>
							<p>
								<strong>Future Confidence:</strong> {formData.future_confidence}
								/10
							</p>
							<p>
								<strong>Key Growth Area:</strong> {formData.skills_strengthened}
							</p>
						</div>
					</div>
				</div>
			),
		},
	];

	const currentSectionData = sections[currentSection];
	const isLastSection = currentSection === sections.length - 1;

	return (
		<>
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div
					className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
					style={{ backgroundColor: "#FAFAFA" }}
				>
					{/* Header */}
					<div
						className="p-6 border-b"
						style={{
							borderColor: "#E5E7EB",
							background:
								"linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.02) 100%)",
						}}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<div
									className="w-12 h-12 rounded-xl flex items-center justify-center"
									style={{
										background: "linear-gradient(135deg, #1b5e20, #2e7d32)",
										boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
									}}
								>
									<FileCheck className="w-6 h-6 text-white" />
								</div>
								<div>
									<h2
										className="text-2xl font-bold"
										style={{ color: "#1A1A1A" }}
									>
										Post-Assignment Debrief
									</h2>
									<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
										Processing your interpreting experience
									</p>
								</div>
							</div>
							<button
								onClick={onClose}
								className="p-2 rounded-lg transition-all hover:opacity-90"
								style={{
									background: "linear-gradient(135deg, #1b5e20, #2e7d32)",
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
												index <= currentSection ? "#2e7d32" : "#E5E7EB",
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
					<div className="flex-1 p-6 overflow-y-auto">
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
						style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}
					>
						{currentSection > 0 && (
							<button
								onClick={handlePrev}
								className="px-6 py-2 rounded-lg flex items-center transition-colors"
								style={{
									backgroundColor: "#F3F4F6",
									color: "#1b5e20",
									border: "1px solid #1b5e20",
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
									background: "linear-gradient(135deg, #1b5e20, #2e7d32)",
									color: "#FFFFFF",
									boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
								}}
							>
								Next
								<ChevronRight className="w-4 h-4 ml-1" />
							</button>
						) : (
							<button
								onClick={handleSave}
								disabled={isSaving}
								className="px-6 py-2 rounded-lg flex items-center transition-all"
								style={{
									background: isSaving
										? "linear-gradient(145deg, #9CA3AF 0%, #6B7280 100%)"
										: "linear-gradient(135deg, #1b5e20, #2e7d32)",
									color: "#FFFFFF",
									boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
									cursor: isSaving ? "not-allowed" : "pointer",
								}}
							>
								<Save className="w-4 h-4 mr-2" />
								{isSaving ? "Saving..." : "Complete Debrief"}
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Summary Modal */}
			{showSummary && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
					<div
						className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
						style={{ backgroundColor: "#FAFAFA" }}
					>
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
								Debrief Summary
							</h3>
							<button
								onClick={() => {
									navigator.clipboard.writeText(summaryText);
									setCopiedSummary(true);
									setTimeout(() => setCopiedSummary(false), 2000);
								}}
								className="px-4 py-2 rounded-lg flex items-center transition-all"
								style={{
									backgroundColor: copiedSummary ? "#2e7d32" : "#1b5e20",
									color: "#FFFFFF",
								}}
							>
								{copiedSummary ? (
									<>
										<CheckCircle className="w-4 h-4 mr-2" />
										Copied!
									</>
								) : (
									<>
										<Copy className="w-4 h-4 mr-2" />
										Copy Summary
									</>
								)}
							</button>
						</div>

						<pre className="whitespace-pre-wrap font-mono text-sm p-4 rounded-lg bg-gray-50">
							{summaryText}
						</pre>

						<div className="mt-6 space-y-3">
							<button
								onClick={() => {
									setShowSummary(false);
									onClose();
								}}
								className="w-full px-6 py-3 rounded-lg transition-all"
								style={{
									background: "linear-gradient(135deg, #1b5e20, #2e7d32)",
									color: "#FFFFFF",
									boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
								}}
							>
								Complete & View Growth Insights
							</button>

							<p className="text-center text-sm text-gray-600">
								Your debrief has been saved and linked to your Growth Insights
								tracker
							</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default PostAssignmentDebriefEnhanced;
