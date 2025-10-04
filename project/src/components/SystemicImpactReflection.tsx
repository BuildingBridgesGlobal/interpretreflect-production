/**
 * Systemic Impact Reflection Component
 *
 * Frames burnout as STRUCTURAL, not individual. Documents institutional harm,
 * workplace exploitation, and systemic barriers while supporting collective action
 * and advocacy. Explicitly states: Your burnout is not your fault.
 *
 * @module SystemicImpactReflection
 */

import {
	Activity,
	Target,
	Shield,
	Heart,
	Users,
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

interface SystemicImpactReflectionProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

/**
 * Main Component
 */
const SystemicImpactReflection: React.FC<SystemicImpactReflectionProps> = ({
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
		// Section 1: Embodied Truth & Emotional Reality
		body_wisdom: "",
		nervous_system_state: 5,
		emotional_landscape: [] as string[],
		chronic_activation: "",
		body_knows_truth: "",

		// Section 2: Naming the Systemic Issue
		the_situation: "",
		systems_at_play: [] as string[],
		institutional_harm: "",
		pattern_recognition: "",
		collective_pattern: "",

		// Section 3: Power Dynamics & Retaliation Risk (was section 4)
		power_structure: "",
		your_vulnerability: [] as string[],
		retaliation_risk_description: "",
		speaking_up_history: "",
		collective_power: "",

		// Section 4: Neurobiological Impact of Systemic Harm (was section 5)
		chronic_stress_response: [] as string[],
		allostatic_load: "",
		burnout_stage: "",
		cognitive_impact: [] as string[],
		relational_withdrawal: "",
		window_of_tolerance: "",

		// Section 5: Relational & Community Impact (was section 6)
		relationship_with_self: "",
		professional_identity: "",
		relationships_with_others: "",
		isolation_vs_solidarity: 5,
		trust_in_systems: 5,
		community_care_needs: "",

		// Section 6: Clarity & Structural Analysis (was section 7)
		root_cause: "",
		who_benefits: "",
		not_your_fault_reflection: "",
		systemic_reframe: "",
		collective_wisdom: "",
		documentation_for_justice: "",

		// Section 7: Action, Boundaries & Collective Care (was section 8)
		immediate_boundaries: "",
		longer_term_changes: "",
		your_role_in_change: [] as string[],
		collective_action: "",
		support_you_need: "",
		rest_as_resistance: "",
		solidarity_statement: "",
		hope_possibility: "",
		self_commitment: "",
		overall_state: 5,

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
			case 0: // Embodied Truth
				if (!formData.body_wisdom.trim()) {
					newErrors.body_wisdom = "Please describe what your body is telling you";
				}
				break;

			case 1: // Naming the Systemic Issue
				if (!formData.the_situation.trim()) {
					newErrors.the_situation = "Please describe the situation";
				}
				break;

			case 5: // Clarity & Structural Analysis
				if (!formData.root_cause.trim()) {
					newErrors.root_cause = "Please identify the root cause";
				}
				break;

			case 6: // Action & Collective Care
				if (!formData.self_commitment.trim()) {
					newErrors.self_commitment = "Please make one commitment to protect your wellbeing";
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

			const reflectionData = {
				user_id: user.id,
				entry_kind: "systemic_impact_reflection",
				data: {
					...formData,
					duration_minutes: duration,
					completed_at: new Date().toISOString(),
				},
				created_at: new Date().toISOString(),
			};

			console.log("Saving Systemic Impact Reflection:", reflectionData);

			const result = await reflectionService.saveReflection(reflectionData);

			if (result.success) {
				if (onComplete) {
					onComplete(reflectionData);
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
			title: "Embodied Truth & Emotional Reality",
			subtitle: "What your body and emotions are telling you about systemic harm",
			fields: (
				<div className="space-y-6">
					<div className="p-4 rounded-lg" style={{ backgroundColor: "#FEF3C7" }}>
						<p className="text-sm font-semibold mb-2" style={{ color: "#92400E" }}>
							YOUR BURNOUT IS NOT YOUR FAULT
						</p>
						<p className="text-sm" style={{ color: "#92400E" }}>
							Your exhaustion, pain, and rage are data—they're telling you something is
							structurally wrong. Your body is responding intelligently to systemic harm.
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							What is your body telling you about this work situation?
						</label>
						<textarea
							value={formData.body_wisdom}
							onChange={(e) => handleFieldChange("body_wisdom", e.target.value)}
							rows={4}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: errors.body_wisdom ? "#DC2626" : "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="E.g., Tension in my shoulders, exhaustion, pain, numbness, rage in my chest, a knot in my stomach..."
						/>
						{errors.body_wisdom && (
							<p className="mt-1 text-sm text-red-600">{errors.body_wisdom}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#1F2937" }}>
							Where is your nervous system? {formData.nervous_system_state}/10
						</label>
						<input
							type="range"
							min="0"
							max="10"
							value={formData.nervous_system_state}
							onChange={(e) =>
								handleFieldChange("nervous_system_state", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#DC2626" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#6B7280" }}>
							<span>Shutdown/Collapsed</span>
							<span>Grounded</span>
							<span>Hypervigilant/Activated</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#1F2937" }}>
							What emotions are present? (Select all that apply)
						</label>
						<div className="space-y-2">
							{[
								"Rage",
								"Grief",
								"Exhaustion",
								"Numbness",
								"Despair",
								"Hope",
								"Determination",
								"Shame",
								"Guilt",
								"Clarity",
								"Empowerment",
								"Other",
							].map((emotion) => (
								<label
									key={emotion}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor: formData.emotional_landscape.includes(emotion)
											? "#DC2626"
											: "#D1D5DB",
										backgroundColor: formData.emotional_landscape.includes(emotion)
											? "rgba(220, 38, 38, 0.05)"
											: "#FFFFFF",
									}}
								>
									<input
										type="checkbox"
										checked={formData.emotional_landscape.includes(emotion)}
										onChange={() => handleMultiSelect("emotional_landscape", emotion)}
										className="mr-3"
										style={{
											accentColor: "#DC2626",
											width: "14px",
											height: "14px",
										}}
									/>
									<span style={{ color: "#1F2937" }}>{emotion}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							How long have you been in this stress state?
						</label>
						<div className="space-y-2">
							{[
								"Just today",
								"This week",
								"Weeks",
								"Months",
								"Years",
								"As long as I can remember in this field",
							].map((duration) => (
								<label
									key={duration}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor: formData.chronic_activation === duration ? "#DC2626" : "#D1D5DB",
										backgroundColor:
											formData.chronic_activation === duration
												? "rgba(220, 38, 38, 0.05)"
												: "#FFFFFF",
									}}
								>
									<input
										type="radio"
										checked={formData.chronic_activation === duration}
										onChange={() => handleFieldChange("chronic_activation", duration)}
										className="mr-3"
										style={{
											accentColor: "#DC2626",
											width: "14px",
											height: "14px",
										}}
									/>
									<span style={{ color: "#1F2937" }}>{duration}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							Your exhaustion, pain, and rage are data—they're telling you something is
							structurally wrong. How does this reframe land?
						</label>
						<textarea
							value={formData.body_knows_truth}
							onChange={(e) => handleFieldChange("body_knows_truth", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="What shifts when you hear that your body's response is intelligent and valid?"
						/>
					</div>
				</div>
			),
		},
		{
			icon: Target,
			title: "Naming the Systemic Issue",
			subtitle: "Clearly identifying what system is causing harm",
			fields: (
				<div className="space-y-6">
					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							Describe what happened (the facts, without self-blame)
						</label>
						<textarea
							value={formData.the_situation}
							onChange={(e) => handleFieldChange("the_situation", e.target.value)}
							rows={4}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: errors.the_situation ? "#DC2626" : "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="What happened? Just the facts—what would a witness have observed?"
						/>
						{errors.the_situation && (
							<p className="mt-1 text-sm text-red-600">{errors.the_situation}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#1F2937" }}>
							What systems of oppression/exploitation are operating here? (Select all that
							apply)
						</label>
						<div className="space-y-2">
							{[
								"Capitalism/profit over people",
								"White supremacy",
								"Patriarchy",
								"Ableism",
								"Audism",
								"Linguistic oppression",
								"Worker exploitation",
								"Professional gatekeeping",
								"Corporate greed",
								"Colonization",
								"Other",
							].map((system) => (
								<label
									key={system}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor: formData.systems_at_play.includes(system)
											? "#DC2626"
											: "#D1D5DB",
										backgroundColor: formData.systems_at_play.includes(system)
											? "rgba(220, 38, 38, 0.05)"
											: "#FFFFFF",
									}}
								>
									<input
										type="checkbox"
										checked={formData.systems_at_play.includes(system)}
										onChange={() => handleMultiSelect("systems_at_play", system)}
										className="mr-3"
										style={{
											accentColor: "#DC2626",
											width: "14px",
											height: "14px",
										}}
									/>
									<span style={{ color: "#1F2937" }}>{system}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							What institution/organization is perpetuating this harm? (Optional - can be
							anonymous or named)
						</label>
						<textarea
							value={formData.institutional_harm}
							onChange={(e) => handleFieldChange("institutional_harm", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="Name the institution or describe it anonymously..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							Have you experienced this pattern before? In this field? In other work?
							(Optional)
						</label>
						<textarea
							value={formData.pattern_recognition}
							onChange={(e) => handleFieldChange("pattern_recognition", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="Is this a pattern you've seen before? Where else?"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							Do you know other interpreters experiencing the same thing?
						</label>
						<div className="space-y-2">
							{[
								"Yes, many",
								"Yes, a few",
								"Not sure",
								"I feel alone in this",
								"This feels unique to me",
							].map((option) => (
								<label
									key={option}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor: formData.collective_pattern === option ? "#DC2626" : "#D1D5DB",
										backgroundColor:
											formData.collective_pattern === option
												? "rgba(220, 38, 38, 0.05)"
												: "#FFFFFF",
									}}
								>
									<input
										type="radio"
										checked={formData.collective_pattern === option}
										onChange={() => handleFieldChange("collective_pattern", option)}
										className="mr-3"
										style={{
											accentColor: "#DC2626",
											width: "14px",
											height: "14px",
										}}
									/>
									<span style={{ color: "#1F2937" }}>{option}</span>
								</label>
							))}
						</div>
					</div>
				</div>
			),
		},
		{
			icon: Shield,
			title: "Power Dynamics & Retaliation Risk",
			subtitle: "Who has power, who's vulnerable, what's at stake",
			fields: (
				<div className="space-y-6">
					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							Who holds power in this situation? Who benefits from the current structure?
							(Optional)
						</label>
						<textarea
							value={formData.power_structure}
							onChange={(e) => handleFieldChange("power_structure", e.target.value)}
							rows={4}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="Who has decision-making power? Who profits from the current system?"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#1F2937" }}>
							What makes you vulnerable if you speak up? (Select all that apply)
						</label>
						<div className="space-y-2">
							{[
								"Financial dependence",
								"Fear of retaliation",
								"Lack of union",
								"Immigration status",
								"Disability",
								"Racial/ethnic marginalization",
								"No alternative work options",
								"Reputation in small community",
								"Other",
							].map((vulnerability) => (
								<label
									key={vulnerability}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor: formData.your_vulnerability.includes(vulnerability)
											? "#DC2626"
											: "#D1D5DB",
										backgroundColor: formData.your_vulnerability.includes(vulnerability)
											? "rgba(220, 38, 38, 0.05)"
											: "#FFFFFF",
									}}
								>
									<input
										type="checkbox"
										checked={formData.your_vulnerability.includes(vulnerability)}
										onChange={() => handleMultiSelect("your_vulnerability", vulnerability)}
										className="mr-3"
										style={{
											accentColor: "#DC2626",
											width: "14px",
											height: "14px",
										}}
									/>
									<span style={{ color: "#1F2937" }}>{vulnerability}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							If you advocated for change, what retaliation might you face? (Optional)
						</label>
						<textarea
							value={formData.retaliation_risk_description}
							onChange={(e) => handleFieldChange("retaliation_risk_description", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="E.g., Blacklisting, reduced hours, termination, reputation damage..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							Have you or others tried to address this? What happened? (Optional)
						</label>
						<textarea
							value={formData.speaking_up_history}
							onChange={(e) => handleFieldChange("speaking_up_history", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="What happened when someone tried to speak up or make change?"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							Is there collective organizing potential (union, worker group, solidarity)?
						</label>
						<div className="space-y-2">
							{[
								"Yes, active organizing",
								"Yes, informal network",
								"Maybe, could build",
								"No, too risky",
								"Don't know",
								"Interested in exploring",
							].map((option) => (
								<label
									key={option}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor: formData.collective_power === option ? "#DC2626" : "#D1D5DB",
										backgroundColor:
											formData.collective_power === option
												? "rgba(220, 38, 38, 0.05)"
												: "#FFFFFF",
									}}
								>
									<input
										type="radio"
										checked={formData.collective_power === option}
										onChange={() => handleFieldChange("collective_power", option)}
										className="mr-3"
										style={{
											accentColor: "#DC2626",
											width: "14px",
											height: "14px",
										}}
									/>
									<span style={{ color: "#1F2937" }}>{option}</span>
								</label>
							))}
						</div>
					</div>
				</div>
			),
		},
		{
			icon: Heart,
			title: "Neurobiological Impact of Systemic Harm",
			subtitle: "How chronic oppression affects your nervous system, brain, body",
			fields: (
				<div className="space-y-6">
					<div className="p-4 rounded-lg" style={{ backgroundColor: "#DBEAFE" }}>
						<p className="text-sm" style={{ color: "#1E40AF" }}>
							<strong>Your body is carrying the cumulative burden of systemic stress.</strong>{" "}
							This is allostatic load—the wear and tear on your body from chronic oppression
							and exploitation.
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#1F2937" }}>
							What chronic stress symptoms are you experiencing? (Select all that apply)
						</label>
						<div className="space-y-2">
							{[
								"Insomnia",
								"Digestive issues",
								"Chronic pain",
								"Anxiety",
								"Depression",
								"Brain fog",
								"Memory problems",
								"Emotional numbing",
								"Panic",
								"Rage outbursts",
								"Dissociation",
								"Other",
							].map((symptom) => (
								<label
									key={symptom}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor: formData.chronic_stress_response.includes(symptom)
											? "#DC2626"
											: "#D1D5DB",
										backgroundColor: formData.chronic_stress_response.includes(symptom)
											? "rgba(220, 38, 38, 0.05)"
											: "#FFFFFF",
									}}
								>
									<input
										type="checkbox"
										checked={formData.chronic_stress_response.includes(symptom)}
										onChange={() => handleMultiSelect("chronic_stress_response", symptom)}
										className="mr-3"
										style={{
											accentColor: "#DC2626",
											width: "14px",
											height: "14px",
										}}
									/>
									<span style={{ color: "#1F2937" }}>{symptom}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							Your body is carrying the cumulative burden of systemic stress. What is this
							costing you physically? (Optional)
						</label>
						<textarea
							value={formData.allostatic_load}
							onChange={(e) => handleFieldChange("allostatic_load", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="What is the physical toll on your body from this chronic stress?"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							Where are you in burnout?
						</label>
						<div className="space-y-2">
							{[
								"Warning signs",
								"Moderate burnout",
								"Severe burnout",
								"Complete depletion",
								"Moral injury",
								"Not sure",
							].map((stage) => (
								<label
									key={stage}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor: formData.burnout_stage === stage ? "#DC2626" : "#D1D5DB",
										backgroundColor:
											formData.burnout_stage === stage
												? "rgba(220, 38, 38, 0.05)"
												: "#FFFFFF",
									}}
								>
									<input
										type="radio"
										checked={formData.burnout_stage === stage}
										onChange={() => handleFieldChange("burnout_stage", stage)}
										className="mr-3"
										style={{
											accentColor: "#DC2626",
											width: "14px",
											height: "14px",
										}}
									/>
									<span style={{ color: "#1F2937" }}>{stage}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#1F2937" }}>
							How is this affecting your thinking? (Select all that apply)
						</label>
						<div className="space-y-2">
							{[
								"Difficulty concentrating",
								"Decision fatigue",
								"Self-blame",
								"Constant rumination",
								"Loss of hope",
								"Clarity about the system",
								"Other",
							].map((impact) => (
								<label
									key={impact}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor: formData.cognitive_impact.includes(impact)
											? "#DC2626"
											: "#D1D5DB",
										backgroundColor: formData.cognitive_impact.includes(impact)
											? "rgba(220, 38, 38, 0.05)"
											: "#FFFFFF",
									}}
								>
									<input
										type="checkbox"
										checked={formData.cognitive_impact.includes(impact)}
										onChange={() => handleMultiSelect("cognitive_impact", impact)}
										className="mr-3"
										style={{
											accentColor: "#DC2626",
											width: "14px",
											height: "14px",
										}}
									/>
									<span style={{ color: "#1F2937" }}>{impact}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							How is this affecting your relationships? (Optional)
						</label>
						<textarea
							value={formData.relational_withdrawal}
							onChange={(e) => handleFieldChange("relational_withdrawal", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="E.g., Isolation, irritability, withdrawal from loved ones..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							Are you mostly in your window of tolerance or outside it?
						</label>
						<div className="space-y-2">
							{[
								"Mostly hyperaroused",
								"Mostly hypoaroused/shutdown",
								"Oscillating",
								"Rarely in my window",
							].map((state) => (
								<label
									key={state}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor: formData.window_of_tolerance === state ? "#DC2626" : "#D1D5DB",
										backgroundColor:
											formData.window_of_tolerance === state
												? "rgba(220, 38, 38, 0.05)"
												: "#FFFFFF",
									}}
								>
									<input
										type="radio"
										checked={formData.window_of_tolerance === state}
										onChange={() => handleFieldChange("window_of_tolerance", state)}
										className="mr-3"
										style={{
											accentColor: "#DC2626",
											width: "14px",
											height: "14px",
										}}
									/>
									<span style={{ color: "#1F2937" }}>{state}</span>
								</label>
							))}
						</div>
					</div>
				</div>
			),
		},
		{
			icon: Users,
			title: "Relational & Community Impact",
			subtitle: "How systemic harm affects connection with self, others, community",
			fields: (
				<div className="space-y-6">
					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							How has this situation affected how you see yourself? (Optional)
						</label>
						<textarea
							value={formData.relationship_with_self}
							onChange={(e) => handleFieldChange("relationship_with_self", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="E.g., Self-blame, shame, clarity, anger at self, loss of confidence..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							How has this impacted your professional identity/calling? (Optional)
						</label>
						<textarea
							value={formData.professional_identity}
							onChange={(e) => handleFieldChange("professional_identity", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="E.g., Disillusionment, questioning my career, clarity about my values..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							How has this affected your connections with colleagues, friends, family?
							(Optional)
						</label>
						<textarea
							value={formData.relationships_with_others}
							onChange={(e) => handleFieldChange("relationships_with_others", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="How have your relationships been affected?"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#1F2937" }}>
							How isolated or connected to others in similar situations do you feel?{" "}
							{formData.isolation_vs_solidarity}/10
						</label>
						<input
							type="range"
							min="0"
							max="10"
							value={formData.isolation_vs_solidarity}
							onChange={(e) =>
								handleFieldChange("isolation_vs_solidarity", Number(e.target.value))
							}
							className="w-full"
							style={{ accentColor: "#DC2626" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#6B7280" }}>
							<span>Deeply isolated</span>
							<span>Strong solidarity</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#1F2937" }}>
							How has this affected your trust in institutions/systems?{" "}
							{formData.trust_in_systems}/10
						</label>
						<input
							type="range"
							min="0"
							max="10"
							value={formData.trust_in_systems}
							onChange={(e) => handleFieldChange("trust_in_systems", Number(e.target.value))}
							className="w-full"
							style={{ accentColor: "#DC2626" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#6B7280" }}>
							<span>Completely broken</span>
							<span>Still intact</span>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							What support from community do you need? (Optional)
						</label>
						<textarea
							value={formData.community_care_needs}
							onChange={(e) => handleFieldChange("community_care_needs", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="What kind of community support would help?"
						/>
					</div>
				</div>
			),
		},
		{
			icon: Eye,
			title: "Clarity & Structural Analysis",
			subtitle: "Seeing clearly, rejecting self-blame, systemic reframing",
			fields: (
				<div className="space-y-6">
					<div className="p-4 rounded-lg" style={{ backgroundColor: "#FEF3C7" }}>
						<p className="text-sm font-semibold mb-2" style={{ color: "#92400E" }}>
							YOUR BURNOUT IS NOT YOUR FAULT
						</p>
						<p className="text-sm" style={{ color: "#92400E" }}>
							It's not a personal failure—it's your body's intelligent response to an
							exploitative system. You are responding normally to an abnormal situation.
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							At the root, what is actually causing this harm?
						</label>
						<textarea
							value={formData.root_cause}
							onChange={(e) => handleFieldChange("root_cause", e.target.value)}
							rows={4}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: errors.root_cause ? "#DC2626" : "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="Not you, not individual failure, but what systemic force is at the root?"
						/>
						{errors.root_cause && (
							<p className="mt-1 text-sm text-red-600">{errors.root_cause}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							Who profits or benefits from keeping things this way? (Optional)
						</label>
						<textarea
							value={formData.who_benefits}
							onChange={(e) => handleFieldChange("who_benefits", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="Who has a vested interest in maintaining the current system?"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							Your burnout is not a personal failure—it's your body's intelligent response
							to an exploitative system. What shifts when you take this in? (Optional)
						</label>
						<textarea
							value={formData.not_your_fault_reflection}
							onChange={(e) => handleFieldChange("not_your_fault_reflection", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="What changes in how you see yourself and this situation?"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							How does naming this as systemic (vs personal) change your understanding?
							(Optional)
						</label>
						<textarea
							value={formData.systemic_reframe}
							onChange={(e) => handleFieldChange("systemic_reframe", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="What's different when you see this as structural rather than personal?"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							What do our collective experiences tell us about what needs to change?
							(Optional)
						</label>
						<textarea
							value={formData.collective_wisdom}
							onChange={(e) => handleFieldChange("collective_wisdom", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="What patterns do you see across interpreters' experiences?"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							This reflection can be part of documenting systemic harm. How do you feel
							about that? (Optional)
						</label>
						<textarea
							value={formData.documentation_for_justice}
							onChange={(e) => handleFieldChange("documentation_for_justice", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="How does it feel to document this as part of a larger pattern?"
						/>
					</div>
				</div>
			),
		},
		{
			icon: Sparkles,
			title: "Action, Boundaries & Collective Care",
			subtitle: "What you need, what's possible, collective organizing",
			fields: (
				<div className="space-y-6">
					<div className="p-4 rounded-lg" style={{ backgroundColor: "#DBEAFE" }}>
						<p className="text-sm font-semibold mb-2" style={{ color: "#1E40AF" }}>
							FROM INDIVIDUAL REFLECTION TO COLLECTIVE ACTION
						</p>
						<p className="text-sm" style={{ color: "#1E40AF" }}>
							Personal wellness matters AND systemic change is necessary. You deserve both
							self-care and collective organizing. Both/and, not either/or.
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							What boundaries do you need RIGHT NOW to survive this? (Optional)
						</label>
						<textarea
							value={formData.immediate_boundaries}
							onChange={(e) => handleFieldChange("immediate_boundaries", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="What boundaries do you need to set immediately?"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							What structural changes are needed? (Optional)
						</label>
						<textarea
							value={formData.longer_term_changes}
							onChange={(e) => handleFieldChange("longer_term_changes", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="E.g., Policy changes, pay increases, working conditions, accountability..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#1F2937" }}>
							What role, if any, do you want to play in pushing for change? (Select all that
							apply)
						</label>
						<div className="space-y-2">
							{[
								"Individual advocacy",
								"Collective organizing",
								"Documentation",
								"Whistleblowing",
								"Supporting others",
								"Rest/recovery first",
								"Leaving the situation",
								"Not sure yet",
								"Other",
							].map((role) => (
								<label
									key={role}
									className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
									style={{
										borderColor: formData.your_role_in_change.includes(role)
											? "#DC2626"
											: "#D1D5DB",
										backgroundColor: formData.your_role_in_change.includes(role)
											? "rgba(220, 38, 38, 0.05)"
											: "#FFFFFF",
									}}
								>
									<input
										type="checkbox"
										checked={formData.your_role_in_change.includes(role)}
										onChange={() => handleMultiSelect("your_role_in_change", role)}
										className="mr-3"
										style={{
											accentColor: "#DC2626",
											width: "14px",
											height: "14px",
										}}
									/>
									<span style={{ color: "#1F2937" }}>{role}</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							What collective action could address this? (Optional)
						</label>
						<textarea
							value={formData.collective_action}
							onChange={(e) => handleFieldChange("collective_action", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="E.g., Union organizing, worker group, industry-wide advocacy, policy change..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							What support do you need to move forward? (Optional)
						</label>
						<textarea
							value={formData.support_you_need}
							onChange={(e) => handleFieldChange("support_you_need", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="E.g., Legal, financial, emotional, community, medical support..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							How can you practice rest as resistance to exploitation? (Optional)
						</label>
						<textarea
							value={formData.rest_as_resistance}
							onChange={(e) => handleFieldChange("rest_as_resistance", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="How can rest be an act of resistance?"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							What solidarity or connection would help right now? (Optional)
						</label>
						<textarea
							value={formData.solidarity_statement}
							onChange={(e) => handleFieldChange("solidarity_statement", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="E.g., Knowing I'm not alone, hearing others' stories, organizing together..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							Even in this, where do you find hope or possibility for change? (Optional)
						</label>
						<textarea
							value={formData.hope_possibility}
							onChange={(e) => handleFieldChange("hope_possibility", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="What gives you hope or a sense of possibility?"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
							What is one way you'll protect your wellbeing after this reflection?
						</label>
						<textarea
							value={formData.self_commitment}
							onChange={(e) => handleFieldChange("self_commitment", e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2 outline-none transition-all"
							style={{
								borderColor: errors.self_commitment ? "#DC2626" : "#D1D5DB",
								backgroundColor: "#FFFFFF",
								color: "#1F2937",
							}}
							placeholder="One concrete commitment to your wellbeing..."
						/>
						{errors.self_commitment && (
							<p className="mt-1 text-sm text-red-600">{errors.self_commitment}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-3" style={{ color: "#1F2937" }}>
							After this reflection, where are you? {formData.overall_state}/10
						</label>
						<input
							type="range"
							min="0"
							max="10"
							value={formData.overall_state}
							onChange={(e) => handleFieldChange("overall_state", Number(e.target.value))}
							className="w-full"
							style={{ accentColor: "#DC2626" }}
						/>
						<div className="flex justify-between text-xs mt-1" style={{ color: "#6B7280" }}>
							<span>More depleted</span>
							<span>More clear/empowered</span>
						</div>
					</div>
				</div>
			),
		},
	];

	const currentSectionData = sections[currentSection];

	return (
		<div
			className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
			style={{
				backgroundColor: "rgba(0, 0, 0, 0.6)",
				backdropFilter: "blur(4px)",
			}}
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div
				ref={modalRef}
				className="w-full max-w-4xl my-8 rounded-2xl shadow-2xl overflow-hidden"
				style={{
					backgroundColor: "#FFFFFF",
					border: "1px solid #E5E7EB",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div
					className="px-8 py-6 border-b relative"
					style={{
						background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
						borderColor: "#E5E7EB",
					}}
				>
					<button
						onClick={onClose}
						className="absolute top-6 right-6 p-2 rounded-full transition-all hover:bg-white/20"
						style={{ color: "#FFFFFF" }}
						aria-label="Close"
					>
						<X size={20} />
					</button>

					<div className="flex items-center gap-4 mb-4">
						<div
							className="p-3 rounded-xl"
							style={{
								backgroundColor: "rgba(255, 255, 255, 0.2)",
								backdropFilter: "blur(8px)",
							}}
						>
							<Activity size={28} style={{ color: "#FFFFFF" }} />
						</div>
						<div>
							<h2 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>
								Systemic Impact Reflection
							</h2>
							<p className="text-sm mt-1" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
								Documenting structural harm, not personal weakness
							</p>
						</div>
					</div>

					{/* Progress bar */}
					<div className="mt-4">
						<div className="flex justify-between items-center mb-2">
							<span className="text-xs font-medium" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
								Section {currentSection + 1} of {sections.length}
							</span>
							<span className="text-xs" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
								{Math.round(((currentSection + 1) / sections.length) * 100)}% Complete
							</span>
						</div>
						<div
							className="h-2 rounded-full overflow-hidden"
							style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
						>
							<div
								className="h-full transition-all duration-300 rounded-full"
								style={{
									width: `${((currentSection + 1) / sections.length) * 100}%`,
									backgroundColor: "#FFFFFF",
								}}
							/>
						</div>
					</div>
				</div>

				{/* Content */}
				{!showSummary ? (
					<div className="px-8 py-8">
						{/* Section header */}
						<div className="flex items-start gap-4 mb-8">
							<div
								className="p-3 rounded-xl"
								style={{
									backgroundColor: "rgba(220, 38, 38, 0.1)",
								}}
							>
								<currentSectionData.icon size={28} style={{ color: "#DC2626" }} />
							</div>
							<div className="flex-1">
								<h3 className="text-xl font-bold" style={{ color: "#1F2937" }}>
									{currentSectionData.title}
								</h3>
								<p className="text-sm mt-1" style={{ color: "#6B7280" }}>
									{currentSectionData.subtitle}
								</p>
							</div>
						</div>

						{/* Section fields */}
						{currentSectionData.fields}

						{/* Navigation buttons */}
						<div className="flex justify-between items-center mt-8 pt-6 border-t" style={{ borderColor: "#E5E7EB" }}>
							<button
								onClick={handlePrevious}
								disabled={currentSection === 0}
								className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
								style={{
									backgroundColor: currentSection === 0 ? "#F3F4F6" : "#FFFFFF",
									color: currentSection === 0 ? "#9CA3AF" : "#DC2626",
									border: `2px solid ${currentSection === 0 ? "#E5E7EB" : "#DC2626"}`,
								}}
							>
								<ChevronLeft size={20} />
								Previous
							</button>

							<div className="flex items-center gap-3">
								{sections.map((_, index) => (
									<div
										key={index}
										className="w-2 h-2 rounded-full transition-all"
										style={{
											backgroundColor:
												index === currentSection
													? "#DC2626"
													: index < currentSection
														? "#EF4444"
														: "#D1D5DB",
										}}
									/>
								))}
							</div>

							<button
								onClick={handleNext}
								className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg"
								style={{
									background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
									color: "#FFFFFF",
								}}
							>
								{currentSection === sections.length - 1 ? "Review" : "Next"}
								<ChevronRight size={20} />
							</button>
						</div>
					</div>
				) : (
					<div className="px-8 py-8">
						{/* Summary view */}
						<div className="text-center mb-8">
							<div
								className="inline-flex p-4 rounded-full mb-4"
								style={{ backgroundColor: "rgba(220, 38, 38, 0.1)" }}
							>
								<Check size={32} style={{ color: "#DC2626" }} />
							</div>
							<h3 className="text-2xl font-bold mb-2" style={{ color: "#1F2937" }}>
								Ready to Save Your Documentation
							</h3>
							<p className="text-base" style={{ color: "#6B7280" }}>
								Your systemic impact reflection has been completed. This documentation matters.
							</p>
						</div>

						<div
							className="p-6 rounded-xl mb-8"
							style={{
								backgroundColor: "#F9FAFB",
								border: "1px solid #E5E7EB",
							}}
						>
							<h4 className="font-semibold mb-4" style={{ color: "#1F2937" }}>
								Reflection Summary
							</h4>
							<div className="space-y-3 text-sm">
								{formData.the_situation && (
									<div>
										<span className="font-medium" style={{ color: "#6B7280" }}>
											Situation:{" "}
										</span>
										<span style={{ color: "#1F2937" }}>
											{formData.the_situation.substring(0, 100)}...
										</span>
									</div>
								)}
								<div className="grid grid-cols-2 gap-4 pt-2">
									<div>
										<span className="font-medium" style={{ color: "#6B7280" }}>
											Nervous System State:{" "}
										</span>
										<span style={{ color: "#1F2937" }}>{formData.nervous_system_state}/10</span>
									</div>
									<div>
										<span className="font-medium" style={{ color: "#6B7280" }}>
											Isolation vs Solidarity:{" "}
										</span>
										<span style={{ color: "#1F2937" }}>
											{formData.isolation_vs_solidarity}/10
										</span>
									</div>
									<div>
										<span className="font-medium" style={{ color: "#6B7280" }}>
											Trust in Systems:{" "}
										</span>
										<span style={{ color: "#1F2937" }}>
											{formData.trust_in_systems}/10
										</span>
									</div>
									<div>
										<span className="font-medium" style={{ color: "#6B7280" }}>
											Overall State:{" "}
										</span>
										<span style={{ color: "#1F2937" }}>{formData.overall_state}/10</span>
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
									backgroundColor: "#FFFFFF",
									color: "#DC2626",
									border: "2px solid #DC2626",
								}}
							>
								Review Responses
							</button>
							<button
								onClick={handleSave}
								disabled={isSaving}
								className="flex-1 px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50"
								style={{
									background: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
									color: "#FFFFFF",
								}}
							>
								{isSaving ? "Saving..." : "Save Reflection"}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SystemicImpactReflection;
