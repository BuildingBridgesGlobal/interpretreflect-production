/**
 * BIPOC Interpreter Wellness Reflection Component
 *
 * Centers the unique experiences of Black, Indigenous, and People of Color interpreters.
 * Integrates neuroscience, emotional intelligence, and systemic awareness frameworks
 * to support BIPOC interpreters in understanding their stress responses, emotional patterns,
 * and collective healing needs.
 *
 * @module BIPOCWellnessReflection
 */

import {
	Heart,
	Shield,
	Users,
	Sparkles,
	Brain,
	Target,
	Check,
	X,
	ChevronLeft,
	ChevronRight,
	Activity,
	Eye,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { reflectionService } from "../services/reflectionService";

interface BIPOCWellnessReflectionProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

/**
 * Main Component
 */
const BIPOCWellnessReflection: React.FC<BIPOCWellnessReflectionProps> = ({
	onClose,
	onComplete,
}) => {
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

	// Form state for all fields - COMPLETELY UPDATED
	const [formData, setFormData] = useState({
		// Section 1: Somatic & Emotional Awareness
		body_sensations: "",
		nervous_system_state: 5,
		primary_emotions: [] as string[],
		emotional_clarity: 5,
		emotional_safety: 5,

		// Section 2: Racialized Experience & Neurobiological Impact
		work_context: "",
		racialized_dynamics: "",
		nervous_system_activation: [] as string[],
		stress_hormone_response: 5,
		window_of_tolerance: "",
		cognitive_impact: [] as string[],

		// Section 3: Microaggressions & Relational Wounds
		harm_experienced: "",
		types_of_harm: [] as string[],
		relational_impact_self: "",
		relational_impact_others: "",
		attachment_wound: 5,
		self_compassion_access: 5,

		// Section 4: Cultural Identity & Authenticity
		cultural_code_switching: 5,
		code_switching_cost: "",
		cultural_identity_affirmation: "",
		authenticity_level: 5,
		cultural_strengths_used: "",
		identity_integration: 5,

		// Immigration/Refugee Interpreter Experience
		immigration_trauma_present: "",
		own_community_dynamics: "",
		language_loyalty_tension: "",
		documentation_anxiety: 5,

		// Section 5: Emotional Regulation & Coping
		regulation_strategies: [] as string[],
		regulation_effectiveness: 5,
		co_regulation_access: "",
		emotional_discharge: 5,
		rumination_level: 5,

		// Section 6: Self-Awareness & Insight
		pattern_recognition: "",
		trigger_awareness: "",
		unmet_needs: [] as string[],
		core_beliefs_activated: "",
		growth_edge: "",
		compassionate_reframe: "",

		// Section 7: Systemic Awareness & Collective Impact
		systemic_analysis: [] as string[],
		institutional_accountability: 5,
		burnout_reframe: "",
		collective_care: "",
		community_connection: 5,

		// Section 8: Integration & Restoration
		boundary_needs: "",
		restoration_practice: "",
		cultural_healing: "",
		joy_and_resistance: "",
		self_affirmation: "",
		commitment_to_self: "",
		overall_wellbeing: 5,

		// Metadata
		reflection_date: new Date().toISOString().split("T")[0],
		timestamp: new Date().toISOString(),
	});

	const handleFieldChange = (field: string, value: string | number | string[]) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
		// Clear error for this field
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const handleMultiSelect = (field: string, value: string) => {
		const currentValues = formData[field as keyof typeof formData] as string[];
		const newValues = currentValues.includes(value)
			? currentValues.filter((v) => v !== value)
			: [...currentValues, value];
		handleFieldChange(field, newValues);
	};

	const validateSection = (sectionIndex: number): boolean => {
		const newErrors: Record<string, string> = {};

		switch (sectionIndex) {
			case 0: // Somatic & Emotional Awareness
				if (!formData.body_sensations.trim()) {
					newErrors.body_sensations = "Please share what you notice in your body";
				}
				break;

			case 1: // Racialized Experience
				if (!formData.work_context.trim()) {
					newErrors.work_context = "Please describe your work context";
				}
				break;

			case 5: // Self-Awareness
				if (!formData.compassionate_reframe.trim()) {
					newErrors.compassionate_reframe = "Please offer yourself compassionate words";
				}
				break;

			case 7: // Integration & Restoration
				if (!formData.self_affirmation.trim()) {
					newErrors.self_affirmation = "Please speak a truth to yourself";
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
				modalRef.current?.scrollTo({ top: 0, behavior: "smooth" });
			} else {
				setShowSummary(true);
				modalRef.current?.scrollTo({ top: 0, behavior: "smooth" });
			}
		}
	};

	const handlePrevious = () => {
		if (currentSection > 0) {
			setCurrentSection(currentSection - 1);
			modalRef.current?.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const handleSave = async () => {
		if (!user?.id) {
			alert("Please sign in to save your reflection");
			return;
		}

		setIsSaving(true);

		try {
			const duration = Math.round((Date.now() - startTime) / 1000 / 60);

			const dataToSave = {
				...formData,
				duration_minutes: duration,
				completed_at: new Date().toISOString(),
			};

			console.log("Saving BIPOC Wellness Reflection for user:", user.id);

			const result = await reflectionService.saveReflection(
				user.id,
				"bipoc_wellness_reflection",
				dataToSave,
			);

			if (result.success) {
				if (onComplete) {
					onComplete({
						user_id: user.id,
						entry_kind: "bipoc_wellness_reflection",
						data: dataToSave,
					});
				}
				onClose();
			} else {
				throw new Error(result.error || "Failed to save reflection");
			}
		} catch (error) {
			console.error("Error saving reflection:", error);
			alert(
				error instanceof Error
					? error.message
					: "Failed to save reflection. Please try again.",
			);
		} finally {
			setIsSaving(false);
		}
	};

	// Section definitions - COMPLETELY REDESIGNED
	const sections = [
		{
			icon: Activity,
			title: "Somatic & Emotional Awareness",
			subtitle: "Body sensations, nervous system state, emotional landscape",
			fields: (
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
							style={{ color: "#2D5F3F" }}
						>
							Grounding
						</h3>
						<p className="mb-6" style={{ color: "#5A5A5A" }}>
							Take a moment to pause and notice what's present
							for you right now. There's no right or wrong way to feel.
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							As you begin this reflection, what sensations do you notice in your body right
							now?
						</label>
						<textarea
							value={formData.body_sensations}
							onChange={(e) => handleFieldChange("body_sensations", e.target.value)}
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: errors.body_sensations ? "#ef4444" : "#E8E5E0" }}
							placeholder="E.g., Tension in shoulders, tight chest, butterflies in stomach, heaviness, numbness..."
						/>
						{errors.body_sensations && (
							<p className="text-sm text-red-500 mt-1">{errors.body_sensations}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							Where is your nervous system right now? (1-10)
						</label>
						<div className="flex items-center space-x-4">
							<input
								type="range"
								min="1"
								max="10"
								value={formData.nervous_system_state}
								onChange={(e) =>
									handleFieldChange("nervous_system_state", parseInt(e.target.value))
								}
								className="flex-1"
								style={{ accentColor: "#5B9378" }}
							/>
							<span
								className="text-2xl font-bold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#2D5F3F",
								}}
							>
								{formData.nervous_system_state}
							</span>
						</div>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Shutdown/Freeze</span>
							<span>Grounded/Present</span>
							<span>Hypervigilant/Activated</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							What emotions are present for you right now? (Select all that apply)
						</label>
						<div className="space-y-2">
							{[
								"Joy",
								"Anger",
								"Sadness",
								"Fear",
								"Disgust",
								"Shame",
								"Pride",
								"Hope",
								"Grief",
								"Numbness",
								"Other",
							].map((emotion) => (
								<label
									key={emotion}
									className="flex items-center p-3 rounded-lg border cursor-pointer transition-colors"
									style={{
										borderColor: formData.primary_emotions.includes(emotion)
											? "#5B9378"
											: "rgba(107, 139, 96, 0.2)",
										backgroundColor: formData.primary_emotions.includes(emotion)
											? "rgba(107, 139, 96, 0.1)"
											: "#FFFFFF",
									}}
								>
									<input
										type="checkbox"
										checked={formData.primary_emotions.includes(emotion)}
										onChange={() => handleMultiSelect("primary_emotions", emotion)}
										className="mr-3"
										style={{
											accentColor: "#5B9378",
											width: "16px",
											height: "16px",
										}}
									/>
									<span style={{ color: "#1A1A1A" }}>{emotion}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							How clear or foggy do these emotions feel? (1-10)
						</label>
						<div className="flex items-center space-x-4">
							<input
								type="range"
								min="1"
								max="10"
								value={formData.emotional_clarity}
								onChange={(e) =>
									handleFieldChange("emotional_clarity", parseInt(e.target.value))
								}
								className="flex-1"
								style={{ accentColor: "#5B9378" }}
							/>
							<span
								className="text-2xl font-bold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#2D5F3F",
								}}
							>
								{formData.emotional_clarity}
							</span>
						</div>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Very Foggy</span>
							<span>Crystal Clear</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							How emotionally safe do you feel in this moment to reflect honestly? (1-10)
						</label>
						<div className="flex items-center space-x-4">
							<input
								type="range"
								min="1"
								max="10"
								value={formData.emotional_safety}
								onChange={(e) =>
									handleFieldChange("emotional_safety", parseInt(e.target.value))
								}
								className="flex-1"
								style={{ accentColor: "#5B9378" }}
							/>
							<span
								className="text-2xl font-bold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#2D5F3F",
								}}
							>
								{formData.emotional_safety}
							</span>
						</div>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Not safe</span>
							<span>Very safe</span>
						</div>
					</div>
				</div>
			),
		},
		{
			icon: Heart,
			title: "Racialized Experience & Neurobiological Impact",
			subtitle: "How racism/racialization activates stress responses",
			fields: (
				<div className="space-y-6">
					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							Describe the work situation you're reflecting on
						</label>
						<textarea
							value={formData.work_context}
							onChange={(e) => handleFieldChange("work_context", e.target.value)}
							rows={4}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: errors.work_context ? "#EF4444" : "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="Describe the setting, participants, and context..."
						/>
						{errors.work_context && (
							<p className="mt-1 text-sm text-red-600">{errors.work_context}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							What racial/cultural dynamics were present? (Optional)
						</label>
						<textarea
							value={formData.racialized_dynamics}
							onChange={(e) => handleFieldChange("racialized_dynamics", e.target.value)}
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="E.g., I was the only BIPOC person present; racial assumptions were made; cultural differences were apparent..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							How did your body respond to racialized stress? (Select all that apply)
						</label>
						<div className="space-y-2">
							{[
								"Racing heart",
								"Shallow breathing",
								"Muscle tension",
								"Stomach discomfort",
								"Headache",
								"Fatigue",
								"Hypervigilance",
								"Dissociation",
								"Numbing",
								"Other",
							].map((response) => (
								<label
									key={response}
									className="flex items-center p-3 rounded-lg border cursor-pointer transition-colors"
									style={{
										borderColor: formData.nervous_system_activation.includes(response)
											? "#5B9378"
											: "rgba(107, 139, 96, 0.2)",
										backgroundColor: formData.nervous_system_activation.includes(response)
											? "rgba(107, 139, 96, 0.1)"
											: "#FFFFFF",
									}}
								>
									<input
										type="checkbox"
										checked={formData.nervous_system_activation.includes(response)}
										onChange={() => handleMultiSelect("nervous_system_activation", response)}
										className="mr-3"
										style={{
											accentColor: "#5B9378",
											width: "16px",
											height: "16px",
										}}
									/>
									<span style={{ color: "#1A1A1A" }}>{response}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							On a body level, how intense was your stress response?{" "}
							{formData.stress_hormone_response}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.stress_hormone_response}
							onChange={(e) =>
								handleFieldChange("stress_hormone_response", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Minimal</span>
							<span>Overwhelming</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							Did you feel within your window of tolerance (able to cope) or outside it
							(overwhelmed/shutdown)?
						</label>
						<div className="space-y-2">
							{[
								"Within tolerance",
								"Overwhelmed (hyperarousal)",
								"Shutdown (hypoarousal)",
								"Oscillating between both",
							].map((option) => (
								<label
									key={option}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor:
											formData.window_of_tolerance === option ? "#2D5F3F" : "#D1D5DB",
										backgroundColor:
											formData.window_of_tolerance === option
												? "rgba(45, 95, 63, 0.05)"
												: "#FFFFFF",
									}}
								>
									<input
										type="radio"
										name="window_of_tolerance"
										checked={formData.window_of_tolerance === option}
										onChange={() => handleFieldChange("window_of_tolerance", option)}
										className="mr-3"
										style={{
											accentColor: "#5B9378",
											width: "16px",
											height: "16px",
										}}
									/>
									<span style={{ color: "#1A1A1A" }}>{option}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							How did the racialized stress affect your thinking? (Select all that apply)
						</label>
						<div className="space-y-2">
							{[
								"Racing thoughts",
								"Brain fog",
								"Difficulty concentrating",
								"Rumination",
								"Intrusive thoughts",
								"Clear thinking maintained",
								"Other",
							].map((impact) => (
								<label
									key={impact}
									className="flex items-center p-3 rounded-lg border cursor-pointer transition-colors"
									style={{
										borderColor: formData.cognitive_impact.includes(impact)
											? "#5B9378"
											: "rgba(107, 139, 96, 0.2)",
										backgroundColor: formData.cognitive_impact.includes(impact)
											? "rgba(107, 139, 96, 0.1)"
											: "#FFFFFF",
									}}
								>
									<input
										type="checkbox"
										checked={formData.cognitive_impact.includes(impact)}
										onChange={() => handleMultiSelect("cognitive_impact", impact)}
										className="mr-3"
										style={{
											accentColor: "#5B9378",
											width: "16px",
											height: "16px",
										}}
									/>
									<span style={{ color: "#1A1A1A" }}>{impact}</span>
								</label>
							))}
						</div>
					</div>
				</div>
			),
		},
		{
			icon: Shield,
			title: "Microaggressions & Relational Wounds",
			subtitle: "Specific harm and its impact on sense of self and relationships",
			fields: (
				<div className="space-y-6">
					<div
						className="p-6 rounded-xl"
						style={{
							background:
								"linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)",
							border: "1px solid rgba(107, 139, 96, 0.2)",
						}}
					>
						<p className="text-sm" style={{ color: "#2D5F3F" }}>
							<strong>Note:</strong> This is a private space to document racialized harm.
							You deserve to name what happened without minimizing it.
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							What specific harm or microaggressions occurred? (Optional)
						</label>
						<textarea
							value={formData.harm_experienced}
							onChange={(e) => handleFieldChange("harm_experienced", e.target.value)}
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="E.g., Comments about appearance, assumptions about background, being asked to speak for entire race..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							Types of harm (Select all that apply)
						</label>
						<div className="space-y-2">
							{[
								"Racial microaggression",
								"Tokenization",
								"Cultural dismissal",
								"Stereotyping",
								"Exclusion",
								"Gaslighting about racism",
								"Professional questioning",
								"Invisibility",
								"Hypervisibility",
								"Othering",
								"None experienced",
								"Other",
							].map((harmType) => (
								<label
									key={harmType}
									className="flex items-center p-3 rounded-lg border cursor-pointer transition-colors"
									style={{
										borderColor: formData.types_of_harm.includes(harmType)
											? "#5B9378"
											: "rgba(107, 139, 96, 0.2)",
										backgroundColor: formData.types_of_harm.includes(harmType)
											? "rgba(107, 139, 96, 0.1)"
											: "#FFFFFF",
									}}
								>
									<input
										type="checkbox"
										checked={formData.types_of_harm.includes(harmType)}
										onChange={() => handleMultiSelect("types_of_harm", harmType)}
										className="mr-3"
										style={{
											accentColor: "#5B9378",
											width: "16px",
											height: "16px",
										}}
									/>
									<span style={{ color: "#1A1A1A" }}>{harmType}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							How did this impact your relationship with yourself? (Optional)
						</label>
						<textarea
							value={formData.relational_impact_self}
							onChange={(e) => handleFieldChange("relational_impact_self", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="E.g., Self-doubt, self-protection, shame, anger at self..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							How did this impact your ability to connect with others? (Optional)
						</label>
						<textarea
							value={formData.relational_impact_others}
							onChange={(e) => handleFieldChange("relational_impact_others", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="E.g., Withdrawal, mistrust, increased guardedness..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							Did this trigger feelings of rejection, abandonment, or not belonging?{" "}
							{formData.attachment_wound}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.attachment_wound}
							onChange={(e) => handleFieldChange("attachment_wound", Number(e.target.value))}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Not at all</span>
							<span>Deeply</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							In this experience, how accessible was self-compassion?{" "}
							{formData.self_compassion_access}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.self_compassion_access}
							onChange={(e) =>
								handleFieldChange("self_compassion_access", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Completely blocked</span>
							<span>Fully accessible</span>
						</div>
					</div>
				</div>
			),
		},
		{
			icon: Users,
			title: "Cultural Identity & Authenticity",
			subtitle: "Connection to cultural self, code-switching costs",
			fields: (
				<div className="space-y-6">
					<div
						className="p-6 rounded-xl"
						style={{
							background:
								"linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)",
							border: "1px solid rgba(107, 139, 96, 0.2)",
						}}
					>
						<p className="text-sm" style={{ color: "#2D5F3F" }}>
							<strong>Affirmation:</strong> Your cultural identity is a strength, not
							something to be hidden or minimized. You belong in this profession exactly as
							you are.
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							How much cultural code-switching did you do? {formData.cultural_code_switching}
							/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.cultural_code_switching}
							onChange={(e) =>
								handleFieldChange("cultural_code_switching", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>None/Authentic self</span>
							<span>Constant masking</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							What did code-switching cost you emotionally/energetically? (Optional)
						</label>
						<textarea
							value={formData.code_switching_cost}
							onChange={(e) => handleFieldChange("code_switching_cost", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="E.g., Exhaustion, loss of self, feeling inauthentic, disconnection..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							How much of your authentic self could you bring? {formData.authenticity_level}
							/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.authenticity_level}
							onChange={(e) =>
								handleFieldChange("authenticity_level", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Completely hidden</span>
							<span>Fully expressed</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							What cultural strengths, wisdom, or values did you draw on? (Optional)
						</label>
						<textarea
							value={formData.cultural_strengths_used}
							onChange={(e) => handleFieldChange("cultural_strengths_used", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="E.g., Resilience, community values, multilingual perspective, ancestral wisdom..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							How integrated or fragmented did you feel (culturally, professionally,
							personally)? {formData.identity_integration}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.identity_integration}
							onChange={(e) =>
								handleFieldChange("identity_integration", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Deeply fragmented</span>
							<span>Fully integrated</span>
						</div>
					</div>

					{/* Immigration/Refugee Interpreter Experience Section */}
					<div className="mt-8 pt-6 border-t" style={{ borderColor: "#E5E7EB" }}>
						<h4 className="text-base font-semibold mb-4" style={{ color: "#1F2937" }}>
							Immigration/Refugee Experience (Optional)
						</h4>
						<p className="text-sm mb-6" style={{ color: "#6B7280" }}>
							For interpreters navigating immigration, refugee backgrounds, or working with your own communities
						</p>

						<div className="space-y-6">
							<div>
								<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
									Did immigration trauma or refugee experiences surface during this work?
								</label>
								<textarea
									value={formData.immigration_trauma_present}
									onChange={(e) => handleFieldChange("immigration_trauma_present", e.target.value)}
									rows={3}
									className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
									style={{
										borderColor: "#D1D5DB",
										backgroundColor: "#FFFFFF",
										color: "#1F2937",
									}}
									placeholder="E.g., Memories of my own migration journey, family separation stories, documentation fears..."
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
									How did working with your own community (if applicable) affect your boundaries or emotions?
								</label>
								<textarea
									value={formData.own_community_dynamics}
									onChange={(e) => handleFieldChange("own_community_dynamics", e.target.value)}
									rows={3}
									className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
									style={{
										borderColor: "#D1D5DB",
										backgroundColor: "#FFFFFF",
										color: "#1F2937",
									}}
									placeholder="E.g., Felt responsible beyond my role, struggled with boundaries, shared cultural understanding helped, felt pressure to advocate..."
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
									Did you experience language loyalty or cultural broker tension?
								</label>
								<textarea
									value={formData.language_loyalty_tension}
									onChange={(e) => handleFieldChange("language_loyalty_tension", e.target.value)}
									rows={3}
									className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
									style={{
										borderColor: "#D1D5DB",
										backgroundColor: "#FFFFFF",
										color: "#1F2937",
									}}
									placeholder="E.g., Felt torn between communities, pressure to advocate for my language community, tension between neutrality and solidarity..."
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
									If applicable, how much anxiety about documentation status (your own or others') was present?{" "}
									{formData.documentation_anxiety}/10
								</label>
								<input
									type="range"
									min="0"
									max="10"
									value={formData.documentation_anxiety}
									onChange={(e) =>
										handleFieldChange("documentation_anxiety", Number(e.target.value))
									}
									className="w-full"
									style={{ accentColor: "#5B9378" }}
								/>
								<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
									<span>Not applicable/None</span>
									<span>Extreme anxiety</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			),
		},
		{
			icon: Brain,
			title: "Emotional Regulation & Coping",
			subtitle: "How you managed emotions, regulation strategies",
			fields: (
				<div className="space-y-6">
					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							What did you do to regulate your emotions during/after? (Select all that apply)
						</label>
						<div className="space-y-2">
							{[
								"Deep breathing",
								"Grounding techniques",
								"Called a friend",
								"Journaling",
								"Movement/exercise",
								"Crying",
								"Anger expression",
								"Spiritual practice",
								"None/couldn't regulate",
								"Other",
							].map((strategy) => (
								<label
									key={strategy}
									className="flex items-center p-3 rounded-lg border cursor-pointer transition-colors"
									style={{
										borderColor: formData.regulation_strategies.includes(strategy)
											? "#5B9378"
											: "rgba(107, 139, 96, 0.2)",
										backgroundColor: formData.regulation_strategies.includes(strategy)
											? "rgba(107, 139, 96, 0.1)"
											: "#FFFFFF",
									}}
								>
									<input
										type="checkbox"
										checked={formData.regulation_strategies.includes(strategy)}
										onChange={() => handleMultiSelect("regulation_strategies", strategy)}
										className="mr-3"
										style={{
											accentColor: "#5B9378",
											width: "16px",
											height: "16px",
										}}
									/>
									<span style={{ color: "#1A1A1A" }}>{strategy}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							How effective were your coping strategies? {formData.regulation_effectiveness}
							/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.regulation_effectiveness}
							onChange={(e) =>
								handleFieldChange("regulation_effectiveness", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Not helpful</span>
							<span>Very helpful</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							Did you have access to supportive relationships for co-regulation?
						</label>
						<div className="space-y-2">
							{[
								"Yes, accessed support",
								"Yes but didn't access",
								"No, not available",
								"Didn't feel safe to access",
							].map((option) => (
								<label
									key={option}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor:
											formData.co_regulation_access === option ? "#2D5F3F" : "#D1D5DB",
										backgroundColor:
											formData.co_regulation_access === option
												? "rgba(45, 95, 63, 0.05)"
												: "#FFFFFF",
									}}
								>
									<input
										type="radio"
										name="co_regulation_access"
										checked={formData.co_regulation_access === option}
										onChange={() => handleFieldChange("co_regulation_access", option)}
										className="mr-3"
										style={{
											accentColor: "#5B9378",
											width: "16px",
											height: "16px",
										}}
									/>
									<span style={{ color: "#1A1A1A" }}>{option}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							Were you able to process and release the emotional charge?{" "}
							{formData.emotional_discharge}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.emotional_discharge}
							onChange={(e) =>
								handleFieldChange("emotional_discharge", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Completely stuck</span>
							<span>Fully released</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							How much are you ruminating or replaying this experience?{" "}
							{formData.rumination_level}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.rumination_level}
							onChange={(e) => handleFieldChange("rumination_level", Number(e.target.value))}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Not at all</span>
							<span>Constantly</span>
						</div>
					</div>
				</div>
			),
		},
		{
			icon: Eye,
			title: "Self-Awareness & Insight",
			subtitle: "Understanding patterns, triggers, needs",
			fields: (
				<div className="space-y-6">
					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							Does this experience connect to patterns in your life? (Optional)
						</label>
						<textarea
							value={formData.pattern_recognition}
							onChange={(e) => handleFieldChange("pattern_recognition", e.target.value)}
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="E.g., Past experiences, family patterns, systemic patterns..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							What specifically triggered the strongest reaction in you? (Optional)
						</label>
						<textarea
							value={formData.trigger_awareness}
							onChange={(e) => handleFieldChange("trigger_awareness", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="E.g., Tone of voice, dismissive gesture, being ignored..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							What needs went unmet in this experience? (Select all that apply)
						</label>
						<div className="space-y-2">
							{[
								"Safety",
								"Belonging",
								"Respect",
								"Recognition",
								"Autonomy",
								"Dignity",
								"Justice",
								"Understanding",
								"Support",
								"Rest",
								"Other",
							].map((need) => (
								<label
									key={need}
									className="flex items-center p-3 rounded-lg border cursor-pointer transition-colors"
									style={{
										borderColor: formData.unmet_needs.includes(need) ? "#2D5F3F" : "#D1D5DB",
										backgroundColor: formData.unmet_needs.includes(need)
											? "rgba(107, 139, 96, 0.1)"
											: "#FFFFFF",
									}}
								>
									<input
										type="checkbox"
										checked={formData.unmet_needs.includes(need)}
										onChange={() => handleMultiSelect("unmet_needs", need)}
										className="mr-3"
										style={{
											accentColor: "#5B9378",
											width: "16px",
											height: "16px",
										}}
									/>
									<span style={{ color: "#1A1A1A" }}>{need}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							What beliefs about yourself or the world got activated? (Optional)
						</label>
						<textarea
							value={formData.core_beliefs_activated}
							onChange={(e) => handleFieldChange("core_beliefs_activated", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="E.g., &quot;I'm not safe,&quot; &quot;I have to work twice as hard,&quot; &quot;I don't belong&quot;..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							What is this experience teaching you about yourself? (Optional)
						</label>
						<textarea
							value={formData.growth_edge}
							onChange={(e) => handleFieldChange("growth_edge", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="E.g., My boundaries, my resilience, what I need..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							What would you say to a beloved friend going through this?
						</label>
						<textarea
							value={formData.compassionate_reframe}
							onChange={(e) => handleFieldChange("compassionate_reframe", e.target.value)}
							rows={4}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: errors.compassionate_reframe ? "#EF4444" : "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="Offer yourself the compassion you'd offer a friend..."
						/>
						{errors.compassionate_reframe && (
							<p className="mt-1 text-sm text-red-600">{errors.compassionate_reframe}</p>
						)}
					</div>
				</div>
			),
		},
		{
			icon: Target,
			title: "Systemic Awareness & Collective Impact",
			subtitle: "Seeing beyond individual, naming systems, collective care",
			fields: (
				<div className="space-y-6">
					<div
						className="p-6 rounded-xl"
						style={{
							background:
								"linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)",
							border: "1px solid rgba(107, 139, 96, 0.2)",
						}}
					>
						<p className="text-sm" style={{ color: "#2D5F3F" }}>
							<strong>Note:</strong> BIPOC interpreter burnout is not a personal failing—it's
							the result of systemic racism, inequitable working conditions, and institutional
							barriers. Naming these systems is part of resistance.
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							Reminder: Your exhaustion, pain, and burnout are not personal failures. They are
							physiological responses to systemic harm. How does this reframe land for you?
							(Optional)
						</label>
						<textarea
							value={formData.burnout_reframe}
							onChange={(e) => handleFieldChange("burnout_reframe", e.target.value)}
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="How does it feel to name this as systemic, not personal?"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							What collective support or solidarity do you need right now? (Optional)
						</label>
						<textarea
							value={formData.collective_care}
							onChange={(e) => handleFieldChange("collective_care", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="E.g., BIPOC interpreter network, organized advocacy, mutual aid..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							How connected or isolated do you feel from BIPOC community?{" "}
							{formData.community_connection}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.community_connection}
							onChange={(e) =>
								handleFieldChange("community_connection", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Deeply isolated</span>
							<span>Deeply connected</span>
						</div>
					</div>
				</div>
			),
		},
		{
			icon: Sparkles,
			title: "Integration & Restoration",
			subtitle: "Moving forward with wisdom, boundaries, care",
			fields: (
				<div className="space-y-6">
					<div
						className="p-6 rounded-xl"
						style={{
							background:
								"linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)",
							border: "1px solid rgba(107, 139, 96, 0.2)",
						}}
					>
						<p className="text-sm" style={{ color: "#2D5F3F" }}>
							<strong>Affirmation:</strong> Your resilience is evidence of your strength, not
							proof that the harm is acceptable. You deserve better working conditions AND you
							are doing remarkable work.
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							What boundaries do you need to protect your wellbeing? (Optional)
						</label>
						<textarea
							value={formData.boundary_needs}
							onChange={(e) => handleFieldChange("boundary_needs", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="E.g., Saying no, limiting contact, ending assignments early..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							What would help you restore your nervous system and sense of self? (Optional)
						</label>
						<textarea
							value={formData.restoration_practice}
							onChange={(e) => handleFieldChange("restoration_practice", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="E.g., Rest, movement, nature, creativity, connection..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							What cultural healing practices support you? (Optional)
						</label>
						<textarea
							value={formData.cultural_healing}
							onChange={(e) => handleFieldChange("cultural_healing", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="E.g., Ancestors, spirituality, community, art, nature, ritual..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							Where can you find moments of joy or resistance? (Optional)
						</label>
						<textarea
							value={formData.joy_and_resistance}
							onChange={(e) => handleFieldChange("joy_and_resistance", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Resistance includes joy. What brings you alive?"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							What truth do you need to speak to yourself right now?
						</label>
						<textarea
							value={formData.self_affirmation}
							onChange={(e) => handleFieldChange("self_affirmation", e.target.value)}
							rows={4}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: errors.self_affirmation ? "#EF4444" : "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="E.g., I belong. My experience is valid. I am not broken. I deserve care..."
						/>
						{errors.self_affirmation && (
							<p className="mt-1 text-sm text-red-600">{errors.self_affirmation}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#2D5F3F" }}>
							What is one small way you can care for yourself after this reflection?
							(Optional)
						</label>
						<textarea
							value={formData.commitment_to_self}
							onChange={(e) => handleFieldChange("commitment_to_self", e.target.value)}
							rows={2}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="One small, doable act of care..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#2D5F3F" }}>
							After this reflection, where is your overall wellbeing?{" "}
							{formData.overall_wellbeing}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.overall_wellbeing}
							onChange={(e) => handleFieldChange("overall_wellbeing", Number(e.target.value))}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Depleted</span>
							<span>Restored</span>
						</div>
					</div>
				</div>
			),
		},
	];

	const currentSectionData = sections[currentSection];

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
									background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
									boxShadow: "0 2px 8px rgba(107, 139, 96, 0.3)",
								}}
							>
								<Heart className="w-5 h-5 text-white" />
							</div>
							<div>
								<h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
									BIPOC Interpreter Wellness Reflection
								</h2>
								<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
									Centering your experience as a Black, Indigenous, or Person of Color interpreter
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
				{!showSummary ? (
					<div
						className="p-6 overflow-y-auto"
						style={{ maxHeight: "calc(90vh - 240px)" }}
					>
						<div className="mb-4 flex items-center space-x-2">
							<currentSectionData.icon size={28} style={{ color: "#5B9378" }} />
							<h3 className="text-xl font-semibold" style={{ color: "#1A1A1A" }}>
								{currentSectionData.title}
							</h3>
						</div>

						{currentSectionData.fields}
					</div>
				) : (
					<div className="p-6">
						{/* Summary view */}
						<div className="text-center mb-8">
							<div
								className="inline-flex p-4 rounded-full mb-4"
								style={{
									background:
										"linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)",
								}}
							>
								<Check size={32} style={{ color: "#2D5F3F" }} />
							</div>
							<h3 className="text-2xl font-bold mb-2" style={{ color: "#1A1A1A" }}>
								Ready to Save Your Reflection
							</h3>
							<p className="text-base" style={{ color: "#5A5A5A" }}>
								Your BIPOC wellness reflection has been completed. This reflection honors your
								experience and documents your journey.
							</p>
						</div>

						<div
							className="p-6 rounded-xl mb-8"
							style={{
								background:
									"linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)",
								border: "1px solid rgba(107, 139, 96, 0.2)",
							}}
						>
							<h4 className="font-semibold mb-4" style={{ color: "#2D5F3F" }}>
								Reflection Summary
							</h4>
							<div className="space-y-3 text-sm">
								{formData.work_context && (
									<div>
										<span className="font-medium" style={{ color: "#2D5F3F" }}>
											Work Context:{" "}
										</span>
										<span style={{ color: "#5A5A5A" }}>
											{formData.work_context.substring(0, 100)}...
										</span>
									</div>
								)}
								<div className="grid grid-cols-2 gap-4 pt-2">
									<div>
										<span className="font-medium" style={{ color: "#2D5F3F" }}>
											Nervous System State:{" "}
										</span>
										<span style={{ color: "#5A5A5A" }}>
											{formData.nervous_system_state}/10
										</span>
									</div>
									<div>
										<span className="font-medium" style={{ color: "#2D5F3F" }}>
											Stress Response:{" "}
										</span>
										<span style={{ color: "#5A5A5A" }}>{formData.stress_hormone_response}/10</span>
									</div>
									<div>
										<span className="font-medium" style={{ color: "#2D5F3F" }}>
											Code-Switching:{" "}
										</span>
										<span style={{ color: "#5A5A5A" }}>
											{formData.cultural_code_switching}/10
										</span>
									</div>
									<div>
										<span className="font-medium" style={{ color: "#2D5F3F" }}>
											Overall Wellbeing:{" "}
										</span>
										<span style={{ color: "#5A5A5A" }}>{formData.overall_wellbeing}/10</span>
									</div>
								</div>
							</div>
						</div>

						{/* Action buttons */}
						<div className="flex gap-4">
							<button
								onClick={() => setShowSummary(false)}
								className="flex-1 px-6 py-3 rounded-lg font-medium transition-all"
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
								Review Responses
							</button>
							<button
								onClick={handleSave}
								disabled={isSaving}
								className="flex-1 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
								style={{
									background: isSaving
										? "#CCCCCC"
										: "linear-gradient(135deg, #2D5F3F, #5B9378)",
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
								{isSaving ? "Saving..." : "Save Reflection"}
							</button>
						</div>
					</div>
				)}

				{/* Footer */}
				<div
					className="p-6 border-t flex justify-between items-center mb-4"
					style={{ borderColor: "#E8E5E0", backgroundColor: "#FFFFFF" }}
				>
					{currentSection > 0 && !showSummary && (
						<button
							onClick={handlePrevious}
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

					{!showSummary && (
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
							{currentSection === sections.length - 1 ? "Review" : "Next"}
							<ChevronRight className="w-4 h-4 ml-1" />
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default BIPOCWellnessReflection;
