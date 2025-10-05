/**
 * Deaf Interpreter Professional Identity Reflection Component
 *
 * Centers the unique professional experiences of Deaf Interpreters (DI) and
 * Certified Deaf Interpreters (CDI) through a neuroscience and emotional intelligence lens.
 * Addresses embodied presence, teaming dynamics, audism, professional identity, and Deaf cultural connection.
 *
 * @module DeafInterpreterReflection
 */

import {
	Activity,
	MessageSquare,
	Users,
	Shield,
	Brain,
	Heart,
	Eye,
	Sparkles,
	Check,
	X,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { reflectionService } from "../services/reflectionService";

interface DeafInterpreterReflectionProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

/**
 * Main Component
 */
const DeafInterpreterReflection: React.FC<DeafInterpreterReflectionProps> = ({
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

	// Form state for all fields
	const [formData, setFormData] = useState({
		// Section 1: Embodied Presence & Emotional Landscape
		body_awareness: "",
		nervous_system_state: 5,
		present_emotions: [] as string[],
		emotional_clarity: 5,
		visual_linguistic_energy: 5,

		// Section 2: Assignment Context & Linguistic Environment
		assignment_description: "",
		communication_modalities: [] as string[],
		linguistic_complexity: 5,
		visual_environment: 5,
		sensory_load: 5,
		cognitive_load: 5,

		// Section 3: Teaming Dynamics & Relational Attunement
		team_interpreter: "",
		pre_assignment_preparation: 5,
		relational_attunement: 5,
		co_regulation_experience: "",
		communication_clarity: 5,
		handoff_quality: 5,
		team_challenges: "",
		team_strengths: "",

		// Section 4: Professional Recognition & Audism
		professional_respect: 5,
		di_cdi_expertise_valued: "",
		audism_experienced: "",
		audism_impact_on_body: [] as string[],
		identity_threat: 5,
		self_doubt_triggered: 5,
		expertise_validation_reflection: "",

		// Section 5: Linguistic Navigation & Cultural Mediation
		linguistic_nuance_work: "",
		cultural_mediation: "",
		deaf_cultural_knowledge_used: "",
		communication_breakdown: "",
		emotional_labor: 5,
		language_access_quality: 5,

		// Section 6: Emotional Regulation & Professional Boundaries
		regulation_strategies: [] as string[],
		boundary_maintenance: 5,
		emotional_spillover: 5,
		vicarious_trauma: "",
		recovery_time_needed: "",

		// Section 7: Self-Awareness & Relational Impact
		pattern_recognition: "",
		trigger_awareness: "",
		unmet_needs: [] as string[],
		impact_on_self_relationship: "",
		impact_on_relationships_others: "",
		identity_integration: 5,

		// Section 8: Integration, Growth & Community Connection
		key_insights: "",
		growth_edge: "",
		boundary_needs_forward: "",
		deaf_community_connection: 5,
		restoration_practice: "",
		cultural_spiritual_grounding: "",
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
			case 1: // Assignment Context
				if (!formData.assignment_description.trim()) {
					newErrors.assignment_description = "Please describe the assignment";
				}
				break;

			case 7: // Integration & Community
				if (!formData.commitment_to_self.trim()) {
					newErrors.commitment_to_self = "Please write a commitment to yourself";
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

			console.log("Saving Deaf Interpreter Reflection for user:", user.id);

			const result = await reflectionService.saveReflection(
				user.id,
				"deaf_interpreter_reflection",
				dataToSave,
			);

			if (result.success) {
				if (onComplete) {
					onComplete({
						user_id: user.id,
						entry_kind: "deaf_interpreter_reflection",
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

	// Section definitions
	const sections = [
		{
			icon: Activity,
			title: "Embodied Presence & Emotional Landscape",
			subtitle: "Somatic awareness, nervous system state, emotional check-in",
			fields: (
				<div className="space-y-6">
					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							As you begin, what sensations do you notice in your body?
						</label>
						<textarea
							value={formData.body_awareness}
							onChange={(e) => handleFieldChange("body_awareness", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="E.g., Tension in shoulders, tightness in chest, feeling grounded, energized..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							Where is your nervous system right now? {formData.nervous_system_state}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.nervous_system_state}
							onChange={(e) =>
								handleFieldChange("nervous_system_state", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Shutdown/Freeze</span>
							<span>Grounded/Present</span>
							<span>Hypervigilant/Activated</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							What emotions are present for you right now? (Select all that apply)
						</label>
						<div className="grid grid-cols-2 gap-2">
							{[
								"Joy",
								"Pride",
								"Anger",
								"Frustration",
								"Sadness",
								"Anxiety",
								"Shame",
								"Excitement",
								"Doubt",
								"Confidence",
								"Exhaustion",
								"Other",
							].map((emotion) => (
								<label
									key={emotion}
									className="flex items-center p-3 rounded-lg border cursor-pointer transition-colors"
									style={{
										borderColor: formData.present_emotions.includes(emotion)
											? "#5B9378"
											: "rgba(107, 139, 96, 0.2)",
										backgroundColor: formData.present_emotions.includes(emotion)
											? "rgba(107, 139, 96, 0.1)"
											: "#FFFFFF",
									}}
								>
									<input
										type="checkbox"
										checked={formData.present_emotions.includes(emotion)}
										onChange={() => handleMultiSelect("present_emotions", emotion)}
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
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How clear or foggy do these emotions feel? {formData.emotional_clarity}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.emotional_clarity}
							onChange={(e) => handleFieldChange("emotional_clarity", Number(e.target.value))}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Very Foggy</span>
							<span>Crystal Clear</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How is your visual-linguistic processing energy? {formData.visual_linguistic_energy}
							/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.visual_linguistic_energy}
							onChange={(e) =>
								handleFieldChange("visual_linguistic_energy", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Completely depleted</span>
							<span>Fully energized</span>
						</div>
					</div>
				</div>
			),
		},
		{
			icon: MessageSquare,
			title: "Assignment Context & Linguistic Environment",
			subtitle: "Work context, communication ecology, sensory environment",
			fields: (
				<div className="space-y-6">
					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							Describe the interpreting assignment
						</label>
						<textarea
							value={formData.assignment_description}
							onChange={(e) => handleFieldChange("assignment_description", e.target.value)}
							rows={4}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: errors.assignment_description ? "#EF4444" : "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="What was the assignment about? Setting? Your role?"
						/>
						{errors.assignment_description && (
							<p className="mt-1 text-sm text-red-600">{errors.assignment_description}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							What language modalities were used? (Select all that apply)
						</label>
						<div className="space-y-2">
							{[
								"ASL",
								"Tactile ASL",
								"Pro-Tactile",
								"Signed English",
								"International Sign",
								"Home signs",
								"Gesture",
								"Visual-gestural",
								"Oral/Aural",
								"Written",
								"Other",
							].map((modality) => (
								<label
									key={modality}
									className="flex items-center p-3 rounded-lg border cursor-pointer transition-colors"
									style={{
										borderColor: formData.communication_modalities.includes(modality)
											? "#5B9378"
											: "rgba(107, 139, 96, 0.2)",
										backgroundColor: formData.communication_modalities.includes(modality)
											? "rgba(107, 139, 96, 0.1)"
											: "#FFFFFF",
									}}
								>
									<input
										type="checkbox"
										checked={formData.communication_modalities.includes(modality)}
										onChange={() => handleMultiSelect("communication_modalities", modality)}
										className="mr-3"
										style={{
											accentColor: "#5B9378",
											width: "16px",
											height: "16px",
										}}
									/>
									<span style={{ color: "#1A1A1A" }}>{modality}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How linguistically complex was this assignment? {formData.linguistic_complexity}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.linguistic_complexity}
							onChange={(e) =>
								handleFieldChange("linguistic_complexity", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Simple/Direct</span>
							<span>Highly complex</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How was the visual environment (lighting, sightlines, visual noise)?{" "}
							{formData.visual_environment}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.visual_environment}
							onChange={(e) => handleFieldChange("visual_environment", Number(e.target.value))}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Poor/Exhausting</span>
							<span>Optimal/Supportive</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							What was your overall sensory processing load? {formData.sensory_load}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.sensory_load}
							onChange={(e) => handleFieldChange("sensory_load", Number(e.target.value))}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Comfortable</span>
							<span>Overwhelming</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How demanding was the cognitive processing? {formData.cognitive_load}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.cognitive_load}
							onChange={(e) => handleFieldChange("cognitive_load", Number(e.target.value))}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Minimal</span>
							<span>Intense</span>
						</div>
					</div>
				</div>
			),
		},
		{
			icon: Users,
			title: "Teaming Dynamics & Relational Attunement",
			subtitle: "Team relationship quality, communication, nervous system co-regulation",
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
						<p className="text-sm" style={{ color: "#5C7F4F" }}>
							<strong>Note:</strong> DI/CDI work is inherently collaborative. Co-regulation and
							team attunement are essential for wellbeing.
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							Who did you team with? (Optional name/description)
						</label>
						<input
							type="text"
							value={formData.team_interpreter}
							onChange={(e) => handleFieldChange("team_interpreter", e.target.value)}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="First name or description"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How well did you and your team prepare together? {formData.pre_assignment_preparation}
							/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.pre_assignment_preparation}
							onChange={(e) =>
								handleFieldChange("pre_assignment_preparation", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>No prep</span>
							<span>Excellent prep</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How attuned did you feel to your team interpreter(s)? {formData.relational_attunement}
							/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.relational_attunement}
							onChange={(e) =>
								handleFieldChange("relational_attunement", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Disconnected</span>
							<span>Deeply attuned</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							Could you co-regulate with your team (read each other's stress, support each other)?
						</label>
						<div className="space-y-2">
							{[
								"Yes, strong co-regulation",
								"Somewhat",
								"Not really",
								"No co-regulation available",
								"Felt dysregulating",
							].map((option) => (
								<label
									key={option}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor:
											formData.co_regulation_experience === option ? "#5C7F4F" : "#D1D5DB",
										backgroundColor:
											formData.co_regulation_experience === option
												? "rgba(45, 95, 63, 0.05)"
												: "#FFFFFF",
									}}
								>
									<input
										type="radio"
										checked={formData.co_regulation_experience === option}
										onChange={() => handleFieldChange("co_regulation_experience", option)}
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
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How clear and effective was team communication? {formData.communication_clarity}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.communication_clarity}
							onChange={(e) =>
								handleFieldChange("communication_clarity", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Very unclear</span>
							<span>Very clear</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How smooth and supportive were the handoffs/transitions? {formData.handoff_quality}
							/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.handoff_quality}
							onChange={(e) => handleFieldChange("handoff_quality", Number(e.target.value))}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Jarring/Stressful</span>
							<span>Seamless/Supportive</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							What challenges arose in teaming? (Optional)
						</label>
						<textarea
							value={formData.team_challenges}
							onChange={(e) => handleFieldChange("team_challenges", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Communication breakdowns, missed cues, stress contagion..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							What worked well in the team dynamic? (Optional)
						</label>
						<textarea
							value={formData.team_strengths}
							onChange={(e) => handleFieldChange("team_strengths", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Strong attunement, respectful collaboration, mutual support..."
						/>
					</div>
				</div>
			),
		},
		{
			icon: Shield,
			title: "Professional Recognition & Audism",
			subtitle: "How professional identity was honored or harmed, audist dynamics",
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
						<p className="text-sm" style={{ color: "#5C7F4F" }}>
							<strong>Note:</strong> Deaf Interpreters bring specialized expertise. You deserve
							full professional recognition. Audism is about systems, not your competence.
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How respected did you feel as a professional? {formData.professional_respect}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.professional_respect}
							onChange={(e) =>
								handleFieldChange("professional_respect", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Disrespected</span>
							<span>Deeply respected</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							Was your specific DI/CDI expertise recognized and valued?
						</label>
						<div className="space-y-2">
							{[
								"Fully valued",
								"Somewhat valued",
								"Overlooked",
								"Questioned",
								"Dismissed",
							].map((option) => (
								<label
									key={option}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor:
											formData.di_cdi_expertise_valued === option ? "#5C7F4F" : "#D1D5DB",
										backgroundColor:
											formData.di_cdi_expertise_valued === option
												? "rgba(45, 95, 63, 0.05)"
												: "#FFFFFF",
									}}
								>
									<input
										type="radio"
										checked={formData.di_cdi_expertise_valued === option}
										onChange={() => handleFieldChange("di_cdi_expertise_valued", option)}
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
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							What audism or audist assumptions did you encounter? (Optional)
						</label>
						<textarea
							value={formData.audism_experienced}
							onChange={(e) => handleFieldChange("audism_experienced", e.target.value)}
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="From team, client, agency, or environment..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How did audism affect you physically? (Select all that apply)
						</label>
						<div className="grid grid-cols-2 gap-2">
							{[
								"Muscle tension",
								"Fatigue",
								"Headache",
								"Chest tightness",
								"Stomach discomfort",
								"Shutdown",
								"Hypervigilance",
								"Anger activation",
								"None",
								"Other",
							].map((impact) => (
								<label
									key={impact}
									className="flex items-center p-3 rounded-lg border cursor-pointer transition-colors"
									style={{
										borderColor: formData.audism_impact_on_body.includes(impact)
											? "#5B9378"
											: "rgba(107, 139, 96, 0.2)",
										backgroundColor: formData.audism_impact_on_body.includes(impact)
											? "rgba(107, 139, 96, 0.1)"
											: "#FFFFFF",
									}}
								>
									<input
										type="checkbox"
										checked={formData.audism_impact_on_body.includes(impact)}
										onChange={() => handleMultiSelect("audism_impact_on_body", impact)}
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

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							Did you experience threat to your professional or Deaf identity? {formData.identity_threat}
							/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.identity_threat}
							onChange={(e) => handleFieldChange("identity_threat", Number(e.target.value))}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Not at all</span>
							<span>Deeply threatened</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							Did this experience trigger professional self-doubt? {formData.self_doubt_triggered}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.self_doubt_triggered}
							onChange={(e) =>
								handleFieldChange("self_doubt_triggered", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Not at all</span>
							<span>Significantly</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							Reminder: Your DI/CDI expertise is invaluable. Audism is about systems, not your
							competence. How does this land for you? (Optional)
						</label>
						<textarea
							value={formData.expertise_validation_reflection}
							onChange={(e) =>
								handleFieldChange("expertise_validation_reflection", e.target.value)
							}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Your reflection on this affirmation..."
						/>
					</div>
				</div>
			),
		},
		{
			icon: Brain,
			title: "Linguistic Navigation & Cultural Mediation",
			subtitle: "Language work complexity, cultural bridging, Deaf cultural knowledge",
			fields: (
				<div className="space-y-6">
					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							What linguistic nuances did you navigate? (Optional)
						</label>
						<textarea
							value={formData.linguistic_nuance_work}
							onChange={(e) => handleFieldChange("linguistic_nuance_work", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Idioms, register, cultural concepts, visual-spatial complexity..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							What cultural mediation or bridging was needed? (Optional)
						</label>
						<textarea
							value={formData.cultural_mediation}
							onChange={(e) => handleFieldChange("cultural_mediation", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Cultural context, navigating hearing assumptions, Deaf norms..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							How did you draw on Deaf cultural knowledge? (Optional)
						</label>
						<textarea
							value={formData.deaf_cultural_knowledge_used}
							onChange={(e) => handleFieldChange("deaf_cultural_knowledge_used", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Visual-spatial strategies, Deaf community norms, linguistic expertise..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							Were there communication breakdowns? What happened? (Optional)
						</label>
						<textarea
							value={formData.communication_breakdown}
							onChange={(e) => handleFieldChange("communication_breakdown", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="What happened? How was it resolved?"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							What emotional labor did you carry in the linguistic/cultural work?{" "}
							{formData.emotional_labor}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.emotional_labor}
							onChange={(e) => handleFieldChange("emotional_labor", Number(e.target.value))}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Minimal</span>
							<span>Extensive</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How would you rate the overall language access provided?{" "}
							{formData.language_access_quality}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.language_access_quality}
							onChange={(e) =>
								handleFieldChange("language_access_quality", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Inadequate</span>
							<span>Excellent</span>
						</div>
					</div>
				</div>
			),
		},
		{
			icon: Heart,
			title: "Emotional Regulation & Professional Boundaries",
			subtitle: "How you managed emotions, maintained boundaries, coped with stress",
			fields: (
				<div className="space-y-6">
					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
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
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How well could you maintain professional boundaries? {formData.boundary_maintenance}
							/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.boundary_maintenance}
							onChange={(e) =>
								handleFieldChange("boundary_maintenance", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Boundaries violated</span>
							<span>Boundaries solid</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							Did work emotions spill into personal life? {formData.emotional_spillover}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.emotional_spillover}
							onChange={(e) =>
								handleFieldChange("emotional_spillover", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Completely contained</span>
							<span>Significant spillover</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							Were you exposed to traumatic content? How did it affect you? (Optional)
						</label>
						<textarea
							value={formData.vicarious_trauma}
							onChange={(e) => handleFieldChange("vicarious_trauma", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Impact of difficult content, vicarious trauma, emotional residue..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How much time do you need to recover from this work?
						</label>
						<div className="space-y-2">
							{[
								"Already recovered",
								"Few hours",
								"Rest of day",
								"Multiple days",
								"Still recovering",
								"Unsure",
							].map((option) => (
								<label
									key={option}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor:
											formData.recovery_time_needed === option ? "#5C7F4F" : "#D1D5DB",
										backgroundColor:
											formData.recovery_time_needed === option
												? "rgba(45, 95, 63, 0.05)"
												: "#FFFFFF",
									}}
								>
									<input
										type="radio"
										checked={formData.recovery_time_needed === option}
										onChange={() => handleFieldChange("recovery_time_needed", option)}
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
				</div>
			),
		},
		{
			icon: Eye,
			title: "Self-Awareness & Relational Impact",
			subtitle: "Understanding yourself, how work affects relationships",
			fields: (
				<div className="space-y-6">
					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							Does this experience connect to patterns in your DI/CDI work? (Optional)
						</label>
						<textarea
							value={formData.pattern_recognition}
							onChange={(e) => handleFieldChange("pattern_recognition", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Recurring dynamics, familiar challenges, repeated experiences..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							What specifically triggered the strongest reaction? (Optional)
						</label>
						<textarea
							value={formData.trigger_awareness}
							onChange={(e) => handleFieldChange("trigger_awareness", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Moments, interactions, or situations that activated strong emotions..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							What needs went unmet? (Select all that apply)
						</label>
						<div className="grid grid-cols-2 gap-2">
							{[
								"Professional respect",
								"Adequate prep time",
								"Clear communication",
								"Team attunement",
								"Accessibility",
								"Rest",
								"Recognition",
								"Support",
								"Deaf community connection",
								"Other",
							].map((need) => (
								<label
									key={need}
									className="flex items-center p-3 rounded-lg border cursor-pointer transition-colors"
									style={{
										borderColor: formData.unmet_needs.includes(need) ? "#5C7F4F" : "#D1D5DB",
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
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							How did this affect your relationship with yourself? (Optional)
						</label>
						<textarea
							value={formData.impact_on_self_relationship}
							onChange={(e) => handleFieldChange("impact_on_self_relationship", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Self-trust, self-worth, confidence, self-compassion..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							How did this impact your relationships with others? (Optional)
						</label>
						<textarea
							value={formData.impact_on_relationships_others}
							onChange={(e) =>
								handleFieldChange("impact_on_relationships_others", e.target.value)
							}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="With team, Deaf community, family, friends..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How integrated or fragmented do your Deaf and professional identities feel?{" "}
							{formData.identity_integration}/10
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
				</div>
			),
		},
		{
			icon: Sparkles,
			title: "Integration, Growth & Community Connection",
			subtitle: "Insights, restoration, connection to Deaf community and self",
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
						<p className="text-sm" style={{ color: "#5C7F4F" }}>
							<strong>Reflection:</strong> This space honors your journey as a DI/CDI. Your
							insights and restoration matter.
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							What did you learn about yourself as a DI/CDI? (Optional)
						</label>
						<textarea
							value={formData.key_insights}
							onChange={(e) => handleFieldChange("key_insights", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Key insights about your practice, identity, strengths..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							What growth opportunity is this experience showing you? (Optional)
						</label>
						<textarea
							value={formData.growth_edge}
							onChange={(e) => handleFieldChange("growth_edge", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Areas for development, learning edges, new possibilities..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							What boundaries do you need for future work? (Optional)
						</label>
						<textarea
							value={formData.boundary_needs_forward}
							onChange={(e) => handleFieldChange("boundary_needs_forward", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Prep time, team expectations, access needs, workload limits..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							How connected do you feel to Deaf community right now?{" "}
							{formData.deaf_community_connection}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.deaf_community_connection}
							onChange={(e) =>
								handleFieldChange("deaf_community_connection", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#5B9378" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#5A5A5A" }}>
							<span>Isolated</span>
							<span>Deeply connected</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							What would help restore your nervous system and spirit? (Optional)
						</label>
						<textarea
							value={formData.restoration_practice}
							onChange={(e) => handleFieldChange("restoration_practice", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Rest, movement, Deaf community time, nature, creative expression..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							What cultural or spiritual practices support you? (Optional)
						</label>
						<textarea
							value={formData.cultural_spiritual_grounding}
							onChange={(e) => handleFieldChange("cultural_spiritual_grounding", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="Cultural practices, spiritual connections, community rituals..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							What truth about your DI/CDI identity do you need to affirm? (Optional)
						</label>
						<textarea
							value={formData.self_affirmation}
							onChange={(e) => handleFieldChange("self_affirmation", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{ borderColor: "#E8E5E0" }}
							placeholder="My Deaf identity is my strength. My expertise is invaluable..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#5C7F4F" }}>
							What is one way you'll care for yourself after this reflection?
						</label>
						<textarea
							value={formData.commitment_to_self}
							onChange={(e) => handleFieldChange("commitment_to_self", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: errors.commitment_to_self ? "#EF4444" : "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="A specific action or commitment to your wellbeing..."
						/>
						{errors.commitment_to_self && (
							<p className="mt-1 text-sm text-red-600">{errors.commitment_to_self}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
							After this reflection, where is your wellbeing? {formData.overall_wellbeing}/10
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={formData.overall_wellbeing}
							onChange={(e) =>
								handleFieldChange("overall_wellbeing", Number(e.target.value))
							}
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
									background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
									boxShadow: "0 2px 8px rgba(107, 139, 96, 0.3)",
								}}
							>
								<Users className="w-5 h-5 text-white" />
							</div>
							<div>
								<h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
									Deaf Interpreter Professional Identity Reflection
								</h2>
								<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
									For Deaf Interpreters (DI) and Certified Deaf Interpreters (CDI)
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
								<Check size={32} style={{ color: "#5C7F4F" }} />
							</div>
							<h3 className="text-2xl font-bold mb-2" style={{ color: "#1A1A1A" }}>
								Ready to Save Your Reflection
							</h3>
							<p className="text-base" style={{ color: "#5A5A5A" }}>
								Your professional identity reflection has been completed.
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
							<h4 className="font-semibold mb-4" style={{ color: "#5C7F4F" }}>
								Reflection Summary
							</h4>
							<div className="space-y-3 text-sm">
								{formData.assignment_description && (
									<div>
										<span className="font-medium" style={{ color: "#5C7F4F" }}>
											Assignment:{" "}
										</span>
										<span style={{ color: "#5A5A5A" }}>
											{formData.assignment_description.substring(0, 100)}...
										</span>
									</div>
								)}
								<div className="grid grid-cols-2 gap-4 pt-2">
									<div>
										<span className="font-medium" style={{ color: "#5C7F4F" }}>
											Nervous System:{" "}
										</span>
										<span style={{ color: "#5A5A5A" }}>
											{formData.nervous_system_state}/10
										</span>
									</div>
									<div>
										<span className="font-medium" style={{ color: "#5C7F4F" }}>
											Professional Respect:{" "}
										</span>
										<span style={{ color: "#5A5A5A" }}>
											{formData.professional_respect}/10
										</span>
									</div>
									<div>
										<span className="font-medium" style={{ color: "#5C7F4F" }}>
											Identity Integration:{" "}
										</span>
										<span style={{ color: "#5A5A5A" }}>
											{formData.identity_integration}/10
										</span>
									</div>
									<div>
										<span className="font-medium" style={{ color: "#5C7F4F" }}>
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
							{currentSection === sections.length - 1 ? "Review" : "Next"}
							<ChevronRight className="w-4 h-4 ml-1" />
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default DeafInterpreterReflection;
