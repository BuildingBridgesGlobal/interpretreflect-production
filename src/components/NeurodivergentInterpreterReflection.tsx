import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { reflectionService } from "../services/reflectionService";
import { GrowthIcon } from "./CustomIcon";

interface NeurodivergentInterpreterReflectionProps {
	onComplete?: (data: any) => void;
	onClose: () => void;
}

export const NeurodivergentInterpreterReflection: React.FC<
	NeurodivergentInterpreterReflectionProps
> = ({ onComplete, onClose }) => {
	const { user } = useAuth();
	const [currentSection, setCurrentSection] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
	const [formData, setFormData] = useState({
		// Section 1: Embodied Presence & Sensory Landscape
		sensory_state: [] as string[],
		body_sensations: "",
		sensory_processing: [] as string[],
		nervous_system_state: 5,
		meltdown_risk: 5,

		// Section 2: Assignment Context & Cognitive Load
		assignment_description: "",
		environmental_factors: [] as string[],
		cognitive_load: 5,
		executive_function_challenges: [] as string[],
		accommodations_received: "",
		accommodations_needed: "",

		// Section 3: Masking, Camouflaging & Ableism
		masking_level: 5,
		masking_cost: "",
		internalized_ableism: 5,
		self_advocacy: 5,

		// Section 4: Attention, Focus & Processing Differences
		attention_state: [] as string[],
		processing_speed: [] as string[],
		working_memory: [] as string[],
		cognitive_fatigue: 5,

		// Section 5: Emotional Regulation & Sensory Strategies
		emotions_present: [] as string[],
		regulation_strategies: [] as string[],
		stimming_regulation: "",
		sensory_accommodations: "",

		// Section 6: Neurodivergent Strengths & Contributions
		neurodivergent_strengths: [] as string[],
		unique_perspective: "",
		neurodivergent_traits: "",
		neurodivergent_enhancement: "",
		flow_moments: "",

		// Section 7: Self-Awareness & Relational Impact
		triggers_identified: "",
		patterns_noticed: "",
		unmet_needs: [] as string[],
		impact_on_self: "",
		impact_on_others: "",
		self_compassion: 5,

		// Section 8: Integration, Advocacy & Neurodivergent Joy
		key_insights: "",
		boundary_needs: "",
		accommodations_to_request: "",
		community_connection: 5,
		self_affirmation: "",
		celebration: "",
		recovery_time: "",
		energy_level: 5,
		commitment: "",
		overall_wellbeing: 5,
	});
	const modalRef = useRef<HTMLDivElement>(null);

	// Scroll to top on mount
	useEffect(() => {
		modalRef.current?.scrollTo({ top: 0, behavior: "instant" });
	}, []);

	const sections = [
		{
			title: "Embodied Presence & Sensory Landscape",
			subtitle: "Body awareness, sensory processing, nervous system state",
		},
		{
			title: "Assignment Context & Cognitive Load",
			subtitle: "Work environment, cognitive demands, executive function",
		},
		{
			title: "Masking, Camouflaging & Ableism",
			subtitle: "Passing as neurotypical, disclosure, ableism experiences",
		},
		{
			title: "Attention, Focus & Processing Differences",
			subtitle: "Attention regulation, hyperfocus, processing speed, working memory",
		},
		{
			title: "Emotional Regulation & Sensory Strategies",
			subtitle: "Regulation strategies, stimming, sensory support",
		},
		{
			title: "Neurodivergent Strengths & Contributions",
			subtitle:
				"Pattern recognition, creativity, empathy, hyperfocus, unique perspectives",
		},
		{
			title: "Self-Awareness & Relational Impact",
			subtitle: "Patterns, triggers, needs, impact on self and others",
		},
		{
			title: "Integration, Advocacy & Neurodivergent Joy",
			subtitle: "Insights, boundaries, accommodations, community, celebration",
		},
	];

	const handleNext = () => {
		if (currentSection < sections.length - 1) {
			setCurrentSection(currentSection + 1);
		} else {
			handleComplete();
		}
	};

	const handleBack = () => {
		if (currentSection > 0) {
			setCurrentSection(currentSection - 1);
		}
	};

	const handleComplete = async () => {
		if (!user) {
			console.error("No user found - cannot save reflection");
			return;
		}

		setIsSaving(true);

		try {
			const dataToSave = {
				...formData,
				completed_at: new Date().toISOString(),
			};

			console.log("Saving Neurodivergent Interpreter Reflection for user:", user.id);

			const result = await reflectionService.saveReflection(
				user.id,
				"neurodivergent_interpreter_reflection",
				dataToSave,
			);

			if (result.success) {
				console.log("Neurodivergent Interpreter Reflection saved successfully");
				if (onComplete) {
					onComplete({
						user_id: user.id,
						entry_kind: "neurodivergent_interpreter_reflection",
						data: dataToSave,
					});
				}
				onClose();
			} else {
				console.error("Failed to save reflection:", result.error);
				alert("Failed to save reflection. Please try again.");
			}
		} catch (error) {
			console.error("Error saving Neurodivergent Interpreter Reflection:", error);
			alert("An error occurred while saving. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleFieldChange = (field: string, value: any) => {
		setFormData({ ...formData, [field]: value });
	};

	const handleCheckboxChange = (field: string, value: string) => {
		const currentValues = (formData[field as keyof typeof formData] as string[]) || [];
		const newValues = currentValues.includes(value)
			? currentValues.filter((v: string) => v !== value)
			: [...currentValues, value];
		setFormData({ ...formData, [field]: newValues });
	};

	const renderSection = () => {
		switch (currentSection) {
			case 0:
				return (
					<div className="space-y-6">
						{/* Body sensations */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Where do you feel sensation in your body right now?
							</label>
							<textarea
								rows={4}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Describe physical sensations, tension, comfort, discomfort..."
								value={formData.body_sensations || ""}
								onChange={(e) => handleFieldChange("body_sensations", e.target.value)}
							/>
						</div>

						{/* Nervous system state */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Nervous system state (1-10)
							</label>
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Freeze/Shutdown</span>
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Grounded/Regulated</span>
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Hyperaroused/Overwhelmed</span>
							</div>
							<input
								type="range"
								min="1"
								max="10"
								value={formData.nervous_system_state || 5}
								onChange={(e) =>
									handleFieldChange("nervous_system_state", Number(e.target.value))
								}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
								style={{
									accentColor: "#5B9378",
								}}
							/>
							<div
								className="text-center mt-2 text-2xl font-semibold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.nervous_system_state || 5}/10
							</div>
						</div>

						{/* Sensory state */}
						<div>
							<label
								className="block text-sm font-medium mb-3"
								style={{ color: "#5C7F4F" }}
							>
								Sensory state (Select all that apply)
							</label>
							<div className="space-y-2">
								{[
									"Calm/Comfortable",
									"Overstimulated (too much input)",
									"Understimulated (need more input)",
									"Sensory seeking (need movement/stimulation)",
									"Sensory avoiding (need quiet/stillness)",
									"Dysregulated (can't find balance)",
									"Other",
								].map((option) => (
									<label
										key={option}
										className="flex items-center space-x-3 cursor-pointer"
									>
										<input
											type="checkbox"
											checked={formData.sensory_state?.includes(option)}
											onChange={() => handleCheckboxChange("sensory_state", option)}
											className="w-3 h-3 rounded border-gray-300 text-[#5B9378] focus:ring-[#5B9378]"
										/>
										<span className="text-sm" style={{ color: "#5A5A5A" }}>{option}</span>
									</label>
								))}
							</div>
						</div>

						{/* Specific sensory challenges */}
						<div>
							<label
								className="block text-sm font-medium mb-3"
								style={{ color: "#5C7F4F" }}
							>
								Specific sensory challenges (Select all that apply)
							</label>
							<div className="space-y-2">
								{[
									"Visual (lighting, visual clutter, screens)",
									"Auditory (noise, multiple speakers, background sound)",
									"Tactile (clothing, temperature, textures)",
									"Proprioceptive (body awareness, movement)",
									"Interoceptive (hunger, thirst, fatigue, pain)",
									"Vestibular (balance, spatial awareness)",
									"None today",
									"Other",
								].map((option) => (
									<label
										key={option}
										className="flex items-center space-x-3 cursor-pointer"
									>
										<input
											type="checkbox"
											checked={formData.sensory_processing?.includes(option)}
											onChange={() =>
												handleCheckboxChange("sensory_processing", option)
											}
											className="w-3 h-3 rounded border-gray-300 text-[#5B9378] focus:ring-[#5B9378]"
										/>
										<span className="text-sm" style={{ color: "#5A5A5A" }}>{option}</span>
									</label>
								))}
							</div>
						</div>

						{/* Sensory accommodations needed */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								What sensory supports would have helped?
							</label>
							<textarea
								rows={3}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Dimmer lighting, noise-canceling headphones, movement breaks, fidget tools..."
								value={formData.sensory_accommodations || ""}
								onChange={(e) =>
									handleFieldChange("sensory_accommodations", e.target.value)
								}
							/>
						</div>

						{/* Energy level */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Energy level (1-10)
							</label>
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Completely depleted</span>
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Fully energized</span>
							</div>
							<input
								type="range"
								min="1"
								max="10"
								value={formData.energy_level || 5}
								onChange={(e) =>
									handleFieldChange("energy_level", Number(e.target.value))
								}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
								style={{
									accentColor: "#5B9378",
								}}
							/>
							<div
								className="text-center mt-2 text-2xl font-semibold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.energy_level || 5}/10
							</div>
						</div>
					</div>
				);

			case 1:
				return (
					<div className="space-y-6">
						{/* Assignment description - REQUIRED */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Describe the interpreting assignment{" "}
								<span className="text-red-500">*</span>
							</label>
							<textarea
								rows={4}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Setting, duration, participants, content..."
								value={formData.assignment_description || ""}
								onChange={(e) =>
									handleFieldChange("assignment_description", e.target.value)
								}
								required
							/>
						</div>

						{/* Environmental factors */}
						<div>
							<label
								className="block text-sm font-medium mb-3"
								style={{ color: "#5C7F4F" }}
							>
								Environmental factors (Select all that apply)
							</label>
							<div className="space-y-2">
								{[
									"Familiar setting",
									"Unfamiliar setting",
									"Predictable schedule",
									"Last-minute changes",
									"Clear instructions",
									"Ambiguous instructions",
									"Quiet environment",
									"Noisy/chaotic environment",
									"Good lighting",
									"Poor lighting",
									"Adequate breaks",
									"No breaks/rushed",
									"Other",
								].map((option) => (
									<label
										key={option}
										className="flex items-center space-x-3 cursor-pointer"
									>
										<input
											type="checkbox"
											checked={formData.environmental_factors?.includes(option)}
											onChange={() =>
												handleCheckboxChange("environmental_factors", option)
											}
											className="w-3 h-3 rounded border-gray-300 text-[#5B9378] focus:ring-[#5B9378]"
										/>
										<span className="text-sm" style={{ color: "#5A5A5A" }}>{option}</span>
									</label>
								))}
							</div>
						</div>

						{/* Cognitive load rating */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Cognitive load rating (1-10)
							</label>
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Manageable</span>
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Overwhelming</span>
							</div>
							<input
								type="range"
								min="1"
								max="10"
								value={formData.cognitive_load || 5}
								onChange={(e) =>
									handleFieldChange("cognitive_load", Number(e.target.value))
								}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
								style={{
									accentColor: "#5B9378",
								}}
							/>
							<div
								className="text-center mt-2 text-2xl font-semibold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.cognitive_load || 5}/10
							</div>
						</div>

						{/* Executive function challenges */}
						<div>
							<label
								className="block text-sm font-medium mb-3"
								style={{ color: "#5C7F4F" }}
							>
								Executive function challenges (Select all that apply)
							</label>
							<div className="space-y-2">
								{[
									"Time management (arriving, pacing, finishing)",
									"Task initiation (getting started)",
									"Task switching (shifting between tasks)",
									"Working memory (holding information)",
									"Attention regulation (staying focused)",
									"Organization (materials, notes, prep)",
									"Planning/sequencing (breaking down tasks)",
									"Emotional regulation (managing frustration)",
									"None today",
									"Other",
								].map((option) => (
									<label
										key={option}
										className="flex items-center space-x-3 cursor-pointer"
									>
										<input
											type="checkbox"
											checked={formData.executive_function_challenges?.includes(
												option,
											)}
											onChange={() =>
												handleCheckboxChange("executive_function_challenges", option)
											}
											className="w-3 h-3 rounded border-gray-300 text-[#5B9378] focus:ring-[#5B9378]"
										/>
										<span className="text-sm" style={{ color: "#5A5A5A" }}>{option}</span>
									</label>
								))}
							</div>
						</div>

						{/* Accommodations received */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								What accommodations or supports did you have?
							</label>
							<textarea
								rows={3}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Extra prep time, materials in advance, quiet space, breaks..."
								value={formData.accommodations_received || ""}
								onChange={(e) =>
									handleFieldChange("accommodations_received", e.target.value)
								}
							/>
						</div>

						{/* Accommodations needed but not received */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								What would have helped but wasn't available?
							</label>
							<textarea
								rows={3}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="What accommodations would have made a difference?"
								value={formData.accommodations_needed || ""}
								onChange={(e) =>
									handleFieldChange("accommodations_needed", e.target.value)
								}
							/>
						</div>
					</div>
				);

			case 2:
				return (
					<div className="space-y-6">
						{/* Masking/Camouflaging level */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Masking/Camouflaging level (1-10)
							</label>
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs" style={{ color: "#5A5A5A" }}>None/Authentic self</span>
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Constant masking</span>
							</div>
							<input
								type="range"
								min="1"
								max="10"
								value={formData.masking_level || 5}
								onChange={(e) =>
									handleFieldChange("masking_level", Number(e.target.value))
								}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
								style={{
									accentColor: "#5B9378",
								}}
							/>
							<div
								className="text-center mt-2 text-2xl font-semibold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.masking_level || 5}/10
							</div>
						</div>

						{/* What did masking cost you? */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								What did masking cost you?
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								Energetically, emotionally, physically?
							</p>
							<textarea
								rows={4}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Describe the exhaustion, depletion, or strain of masking..."
								value={formData.masking_cost || ""}
								onChange={(e) => handleFieldChange("masking_cost", e.target.value)}
							/>
						</div>

						{/* Internalized ableism */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Internalized ableism (1-10)
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								How much did you judge yourself for needing support?
							</p>
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs" style={{ color: "#5A5A5A" }}>No self-judgment</span>
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Severe self-judgment</span>
							</div>
							<input
								type="range"
								min="1"
								max="10"
								value={formData.internalized_ableism || 5}
								onChange={(e) =>
									handleFieldChange("internalized_ableism", Number(e.target.value))
								}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
								style={{
									accentColor: "#5B9378",
								}}
							/>
							<div
								className="text-center mt-2 text-2xl font-semibold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.internalized_ableism || 5}/10
							</div>
						</div>

						{/* Self-advocacy */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Self-advocacy (1-10)
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								How able were you to ask for what you needed?
							</p>
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Couldn't advocate</span>
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Fully advocated</span>
							</div>
							<input
								type="range"
								min="1"
								max="10"
								value={formData.self_advocacy || 5}
								onChange={(e) =>
									handleFieldChange("self_advocacy", Number(e.target.value))
								}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
								style={{
									accentColor: "#5B9378",
								}}
							/>
							<div
								className="text-center mt-2 text-2xl font-semibold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.self_advocacy || 5}/10
							</div>
						</div>
					</div>
				);

			case 3:
				return (
					<div className="space-y-6">
						{/* Attention state */}
						<div>
							<label
								className="block text-sm font-medium mb-3"
								style={{ color: "#5C7F4F" }}
							>
								Attention state (Select all that apply)
							</label>
							<div className="space-y-2">
								{[
									"Hyperfocus (deep concentration)",
									"Scattered/fragmented",
									"Task-switching difficulty",
									"Distractibility",
									"Time blindness",
									"Sustained focus",
									"Other",
								].map((option) => (
									<label
										key={option}
										className="flex items-center space-x-3 cursor-pointer"
									>
										<input
											type="checkbox"
											checked={formData.attention_state?.includes(option)}
											onChange={() => handleCheckboxChange("attention_state", option)}
											className="w-3 h-3 rounded border-gray-300 text-[#5B9378] focus:ring-[#5B9378]"
										/>
										<span className="text-sm" style={{ color: "#5A5A5A" }}>{option}</span>
									</label>
								))}
							</div>
						</div>

						{/* Processing speed challenges */}
						<div>
							<label
								className="block text-sm font-medium mb-3"
								style={{ color: "#5C7F4F" }}
							>
								Processing speed challenges (Select all that apply)
							</label>
							<div className="space-y-2">
								{[
									"Needed more time to process",
									"Felt rushed",
									"Couldn't keep up with pace",
									"Processing speed was fine",
									"Other",
								].map((option) => (
									<label
										key={option}
										className="flex items-center space-x-3 cursor-pointer"
									>
										<input
											type="checkbox"
											checked={formData.processing_speed?.includes(option)}
											onChange={() =>
												handleCheckboxChange("processing_speed", option)
											}
											className="w-3 h-3 rounded border-gray-300 text-[#5B9378] focus:ring-[#5B9378]"
										/>
										<span className="text-sm" style={{ color: "#5A5A5A" }}>{option}</span>
									</label>
								))}
							</div>
						</div>

						{/* Working memory challenges */}
						<div>
							<label
								className="block text-sm font-medium mb-3"
								style={{ color: "#5C7F4F" }}
							>
								Working memory challenges (Select all that apply)
							</label>
							<div className="space-y-2">
								{[
									"Difficulty holding information",
									"Lost train of thought",
									"Forgot instructions",
									"Working memory was fine",
									"Other",
								].map((option) => (
									<label
										key={option}
										className="flex items-center space-x-3 cursor-pointer"
									>
										<input
											type="checkbox"
											checked={formData.working_memory?.includes(option)}
											onChange={() => handleCheckboxChange("working_memory", option)}
											className="w-3 h-3 rounded border-gray-300 text-[#5B9378] focus:ring-[#5B9378]"
										/>
										<span className="text-sm" style={{ color: "#5A5A5A" }}>{option}</span>
									</label>
								))}
							</div>
						</div>

						{/* How did neurodivergent traits show up in your work? */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								How did neurodivergent traits show up in your work?
							</label>
							<textarea
								rows={4}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Describe how ADHD, autism, or other neurodivergent traits impacted your interpreting today..."
								value={formData.neurodivergent_traits || ""}
								onChange={(e) =>
									handleFieldChange("neurodivergent_traits", e.target.value)
								}
							/>
						</div>

						{/* Cognitive fatigue */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Cognitive fatigue (1-10)
							</label>
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Mentally fresh</span>
								<span className="text-xs" style={{ color: "#5A5A5A" }}>
									Completely cognitively exhausted
								</span>
							</div>
							<input
								type="range"
								min="1"
								max="10"
								value={formData.cognitive_fatigue || 5}
								onChange={(e) =>
									handleFieldChange("cognitive_fatigue", Number(e.target.value))
								}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
								style={{
									accentColor: "#5B9378",
								}}
							/>
							<div
								className="text-center mt-2 text-2xl font-semibold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.cognitive_fatigue || 5}/10
							</div>
						</div>
					</div>
				);

			case 4:
				return (
					<div className="space-y-6">
						{/* Emotions present */}
						<div>
							<label
								className="block text-sm font-medium mb-3"
								style={{ color: "#5C7F4F" }}
							>
								Emotions present (Select all that apply)
							</label>
							<div className="space-y-2">
								{[
									"Joy",
									"Pride",
									"Frustration",
									"Overwhelm",
									"Anxiety",
									"Shame",
									"Excitement",
									"Calm",
									"Anger",
									"Exhaustion",
									"Confusion",
									"Other",
								].map((option) => (
									<label
										key={option}
										className="flex items-center space-x-3 cursor-pointer"
									>
										<input
											type="checkbox"
											checked={formData.emotions_present?.includes(option)}
											onChange={() =>
												handleCheckboxChange("emotions_present", option)
											}
											className="w-3 h-3 rounded border-gray-300 text-[#5B9378] focus:ring-[#5B9378]"
										/>
										<span className="text-sm" style={{ color: "#5A5A5A" }}>{option}</span>
									</label>
								))}
							</div>
						</div>

						{/* Regulation strategies used */}
						<div>
							<label
								className="block text-sm font-medium mb-3"
								style={{ color: "#5C7F4F" }}
							>
								Regulation strategies used (Select all that apply)
							</label>
							<div className="space-y-2">
								{[
									"Deep breathing",
									"Grounding techniques",
									"Stimming (movement, fidgeting)",
									"Sensory tools (weighted items, fidgets)",
									"Movement/exercise",
									"Quiet/alone time",
									"Called a friend",
									"Journaling",
									"Music",
									"Spiritual practice",
									"None/couldn't regulate",
									"Other",
								].map((option) => (
									<label
										key={option}
										className="flex items-center space-x-3 cursor-pointer"
									>
										<input
											type="checkbox"
											checked={formData.regulation_strategies?.includes(option)}
											onChange={() =>
												handleCheckboxChange("regulation_strategies", option)
											}
											className="w-3 h-3 rounded border-gray-300 text-[#5B9378] focus:ring-[#5B9378]"
										/>
										<span className="text-sm" style={{ color: "#5A5A5A" }}>{option}</span>
									</label>
								))}
							</div>
						</div>

						{/* Stimming/Self-regulation */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Stimming/Self-regulation
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								What movements or sensory inputs helped you regulate?
							</p>
							<textarea
								rows={3}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Rocking, fidgeting, pacing, hand movements, pressure, textures..."
								value={formData.stimming_regulation || ""}
								onChange={(e) =>
									handleFieldChange("stimming_regulation", e.target.value)
								}
							/>
						</div>

						{/* Meltdown/Shutdown risk */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Meltdown/Shutdown risk (1-10)
							</label>
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs" style={{ color: "#5A5A5A" }}>No risk</span>
								<span className="text-xs" style={{ color: "#5A5A5A" }}>High risk/occurred</span>
							</div>
							<input
								type="range"
								min="1"
								max="10"
								value={formData.meltdown_risk || 5}
								onChange={(e) =>
									handleFieldChange("meltdown_risk", Number(e.target.value))
								}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
								style={{
									accentColor: "#5B9378",
								}}
							/>
							<div
								className="text-center mt-2 text-2xl font-semibold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.meltdown_risk || 5}/10
							</div>
						</div>

						{/* Recovery time needed */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Recovery time needed
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								How much rest/downtime do you need to recover?
							</p>
							<textarea
								rows={3}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Hours, days, specific recovery activities..."
								value={formData.recovery_time || ""}
								onChange={(e) => handleFieldChange("recovery_time", e.target.value)}
							/>
						</div>
					</div>
				);

			case 5:
				return (
					<div className="space-y-6">
						{/* Neurodivergent strengths you used */}
						<div>
							<label
								className="block text-sm font-medium mb-3"
								style={{ color: "#5C7F4F" }}
							>
								Neurodivergent strengths you used (Select all that apply)
							</label>
							<div className="space-y-2">
								{[
									"Hyperfocus/deep concentration",
									"Pattern recognition",
									"Creative problem-solving",
									"Detail-oriented precision",
									"Empathy/emotional attunement",
									"Nonlinear thinking",
									"Special interest knowledge",
									"Authenticity/directness",
									"Sensory awareness",
									"Memory for details",
									"Other",
								].map((option) => (
									<label
										key={option}
										className="flex items-center space-x-3 cursor-pointer"
									>
										<input
											type="checkbox"
											checked={formData.neurodivergent_strengths?.includes(option)}
											onChange={() =>
												handleCheckboxChange("neurodivergent_strengths", option)
											}
											className="w-3 h-3 rounded border-gray-300 text-[#5B9378] focus:ring-[#5B9378]"
										/>
										<span className="text-sm" style={{ color: "#5A5A5A" }}>{option}</span>
									</label>
								))}
							</div>
						</div>

						{/* How did your neurodivergent brain enhance your work? */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								How did your neurodivergent brain enhance your work?
							</label>
							<textarea
								rows={4}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Describe the unique contributions your neurodivergent traits brought to your interpreting..."
								value={formData.neurodivergent_enhancement || ""}
								onChange={(e) =>
									handleFieldChange("neurodivergent_enhancement", e.target.value)
								}
							/>
						</div>

						{/* What unique perspective did you bring? */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								What unique perspective did you bring?
							</label>
							<textarea
								rows={3}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Different way of seeing, understanding, or approaching the work..."
								value={formData.unique_perspective || ""}
								onChange={(e) =>
									handleFieldChange("unique_perspective", e.target.value)
								}
							/>
						</div>

						{/* Moments of flow or ease */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Moments of flow or ease
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								When did work feel easiest or most natural?
							</p>
							<textarea
								rows={3}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Times when your neurodivergent brain felt perfectly suited to the task..."
								value={formData.flow_moments || ""}
								onChange={(e) => handleFieldChange("flow_moments", e.target.value)}
							/>
						</div>
					</div>
				);

			case 6:
				return (
					<div className="space-y-6">
						{/* Patterns you noticed */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Patterns you noticed
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								What patterns showed up today?
							</p>
							<textarea
								rows={4}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Recurring challenges, strengths, triggers, or responses..."
								value={formData.patterns_noticed || ""}
								onChange={(e) => handleFieldChange("patterns_noticed", e.target.value)}
							/>
						</div>

						{/* Triggers identified */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Triggers identified
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								What situations triggered overwhelm, shutdown, or dysregulation?
							</p>
							<textarea
								rows={4}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Specific sensory, cognitive, or social triggers..."
								value={formData.triggers_identified || ""}
								onChange={(e) =>
									handleFieldChange("triggers_identified", e.target.value)
								}
							/>
						</div>

						{/* Unmet needs */}
						<div>
							<label
								className="block text-sm font-medium mb-3"
								style={{ color: "#5C7F4F" }}
							>
								Unmet needs (Select all that apply)
							</label>
							<div className="space-y-2">
								{[
									"Predictability/routine",
									"Clear instructions",
									"Adequate breaks",
									"Quiet environment",
									"Movement breaks",
									"Sensory tools",
									"Processing time",
									"Accommodations",
									"Understanding",
									"Validation",
									"Autonomy",
									"Rest",
									"Other",
								].map((option) => (
									<label
										key={option}
										className="flex items-center space-x-3 cursor-pointer"
									>
										<input
											type="checkbox"
											checked={formData.unmet_needs?.includes(option)}
											onChange={() => handleCheckboxChange("unmet_needs", option)}
											className="w-3 h-3 rounded border-gray-300 text-[#5B9378] focus:ring-[#5B9378]"
										/>
										<span className="text-sm" style={{ color: "#5A5A5A" }}>{option}</span>
									</label>
								))}
							</div>
						</div>

						{/* Impact on relationship with yourself */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Impact on relationship with yourself
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								How did today affect how you feel about yourself?
							</p>
							<textarea
								rows={4}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Self-perception, self-compassion, self-judgment..."
								value={formData.impact_on_self || ""}
								onChange={(e) => handleFieldChange("impact_on_self", e.target.value)}
							/>
						</div>

						{/* Impact on relationships with others */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Impact on relationships with others
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								How did today affect your connections with colleagues, clients, or
								team?
							</p>
							<textarea
								rows={4}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Connection, disconnection, support, isolation..."
								value={formData.impact_on_others || ""}
								onChange={(e) => handleFieldChange("impact_on_others", e.target.value)}
							/>
						</div>

						{/* Self-compassion access */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Self-compassion access (1-10)
							</label>
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Self-critical</span>
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Self-compassionate</span>
							</div>
							<input
								type="range"
								min="1"
								max="10"
								value={formData.self_compassion || 5}
								onChange={(e) =>
									handleFieldChange("self_compassion", Number(e.target.value))
								}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
								style={{
									accentColor: "#5B9378",
								}}
							/>
							<div
								className="text-center mt-2 text-2xl font-semibold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.self_compassion || 5}/10
							</div>
						</div>
					</div>
				);

			case 7:
				return (
					<div className="space-y-6">
						{/* Key insights */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Key insights
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								What did you learn about yourself or your needs?
							</p>
							<textarea
								rows={4}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="New awareness, understanding, or realizations..."
								value={formData.key_insights || ""}
								onChange={(e) => handleFieldChange("key_insights", e.target.value)}
							/>
						</div>

						{/* Boundary needs going forward */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Boundary needs going forward
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								What boundaries do you need to set?
							</p>
							<textarea
								rows={4}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Around work hours, assignments, accommodations, communication..."
								value={formData.boundary_needs || ""}
								onChange={(e) => handleFieldChange("boundary_needs", e.target.value)}
							/>
						</div>

						{/* Accommodations to request */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Accommodations to request
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								What accommodations will you advocate for?
							</p>
							<textarea
								rows={4}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Specific accommodations you need and will request..."
								value={formData.accommodations_to_request || ""}
								onChange={(e) =>
									handleFieldChange("accommodations_to_request", e.target.value)
								}
							/>
						</div>

						{/* Neurodivergent community connection */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Neurodivergent community connection (1-10)
							</label>
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Isolated</span>
								<span className="text-xs" style={{ color: "#5A5A5A" }}>
									Connected to ND community
								</span>
							</div>
							<input
								type="range"
								min="1"
								max="10"
								value={formData.community_connection || 5}
								onChange={(e) =>
									handleFieldChange("community_connection", Number(e.target.value))
								}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
								style={{
									accentColor: "#5B9378",
								}}
							/>
							<div
								className="text-center mt-2 text-2xl font-semibold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.community_connection || 5}/10
							</div>
						</div>

						{/* Celebration of neurodivergent identity */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Celebration of neurodivergent identity
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								How can you celebrate your neurodivergent brain this week?
							</p>
							<textarea
								rows={3}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="Ways to honor, celebrate, or affirm your neurodivergent identity..."
								value={formData.celebration || ""}
								onChange={(e) => handleFieldChange("celebration", e.target.value)}
							/>
						</div>

						{/* Self-affirmation */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Self-affirmation
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								Write one affirmation about your neurodivergent identity
							</p>
							<textarea
								rows={2}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="I am... My neurodivergent brain is... I honor..."
								value={formData.self_affirmation || ""}
								onChange={(e) => handleFieldChange("self_affirmation", e.target.value)}
							/>
						</div>

						{/* Commitment to yourself - REQUIRED */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Commitment to yourself <span className="text-red-500">*</span>
							</label>
							<p className="text-sm mb-2" style={{ color: "#5A5A5A" }}>
								What's one thing you'll do to honor your neurodivergent needs?
							</p>
							<textarea
								rows={3}
								className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-[#5B9378] focus:outline-none"
								style={{
									borderColor: "#E8E5E0",
									backgroundColor: "rgba(107, 139, 96, 0.02)",
								}}
								placeholder="One concrete action to honor your needs this week..."
								value={formData.commitment || ""}
								onChange={(e) => handleFieldChange("commitment", e.target.value)}
								required
							/>
						</div>

						{/* Overall wellbeing */}
						<div>
							<label
								className="block text-sm font-medium mb-2"
								style={{ color: "#5C7F4F" }}
							>
								Overall wellbeing (1-10)
							</label>
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Struggling</span>
								<span className="text-xs" style={{ color: "#5A5A5A" }}>Thriving</span>
							</div>
							<input
								type="range"
								min="1"
								max="10"
								value={formData.overall_wellbeing || 5}
								onChange={(e) =>
									handleFieldChange("overall_wellbeing", Number(e.target.value))
								}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
								style={{
									accentColor: "#5B9378",
								}}
							/>
							<div
								className="text-center mt-2 text-2xl font-semibold px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "rgba(107, 139, 96, 0.1)",
									color: "#5C7F4F",
								}}
							>
								{formData.overall_wellbeing || 5}/10
							</div>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-labelledby="neurodivergent-reflection-title"
		>
			<div
				ref={modalRef}
				className="rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
				style={{
					backgroundColor: "#FAF9F6",
					boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<header
					className="px-8 py-6 border-b flex items-center justify-between sticky top-0 z-10"
					style={{
						borderColor: "#E8E5E0",
						background:
							"linear-gradient(135deg, rgba(107, 139, 96, 0.05) 0%, rgba(92, 127, 79, 0.02) 100%)",
					}}
				>
					<div className="flex items-center space-x-3">
						<div
							className="w-12 h-12 rounded-xl flex items-center justify-center"
							style={{
								background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
								boxShadow: "0 2px 8px rgba(107, 139, 96, 0.3)",
							}}
						>
							<GrowthIcon size={24} color="#FFFFFF" />
						</div>
						<div>
							<h2
								id="neurodivergent-reflection-title"
								className="text-2xl font-bold"
								style={{ color: "#1A1A1A" }}
							>
								Neurodivergent Interpreter Wellness
							</h2>
							<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
								For ADHD, autism, dyslexia, and all cognitive differences
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-lg transition-all hover:opacity-90"
						style={{
							background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
						}}
						aria-label="Close dialog"
					>
						<X className="w-5 h-5 text-white" />
					</button>
				</header>

				{/* Progress Bar */}
				<div className="px-8 py-4">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium" style={{ color: "#5A5A5A" }}>
							Section {currentSection + 1} of {sections.length}
						</span>
						<span className="text-sm" style={{ color: "#5A5A5A" }}>
							{Math.round(((currentSection + 1) / sections.length) * 100)}% Complete
						</span>
					</div>
					<div className="bg-gray-100/30 rounded-full h-2.5">
						<div
							className="h-2.5 rounded-full transition-all duration-300"
							style={{
								width: `${((currentSection + 1) / sections.length) * 100}%`,
								backgroundColor: "#5B9378",
							}}
						/>
					</div>
				</div>

				{/* Section Title */}
				<div
					className="px-8 py-6"
					style={{ background: "rgba(107, 139, 96, 0.05)" }}
				>
					<h3 className="text-xl font-bold" style={{ color: "#5C7F4F" }}>
						{sections[currentSection].title}
					</h3>
					<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
						{sections[currentSection].subtitle}
					</p>
				</div>

				{/* Section Content */}
				<main className="px-8 py-6">{renderSection()}</main>

				{/* Validation Message */}
				<div
					className="px-8 py-4"
					style={{
						backgroundColor: "#F8FBF6",
						border: "1px solid rgba(107, 139, 96, 0.2)",
					}}
				>
					<p className="text-sm" style={{ color: "#5C7F4F" }}>
						<strong>Remember:</strong> Your sensory needs are valid. Executive
						function challenges are real, not character flaws. Masking is exhausting
						- you deserve to unmask. Your neurodivergent brain brings unique
						strengths.
					</p>
				</div>

				{/* Navigation Buttons */}
				<footer
					className="px-8 py-6 border-t flex justify-between"
					style={{ borderColor: "#E8E5E0", backgroundColor: "#FFFFFF" }}
				>
					<button
						onClick={handleBack}
						disabled={currentSection === 0}
						className="px-6 py-3 rounded-lg font-medium transition-colors"
						style={{
							backgroundColor: currentSection === 0 ? "#F5F5F5" : "#F8FBF6",
							color: currentSection === 0 ? "#CCCCCC" : "#5B9378",
							border: currentSection === 0 ? "1px solid #E0E0E0" : "1px solid #5B9378",
							cursor: currentSection === 0 ? "not-allowed" : "pointer",
							opacity: currentSection === 0 ? 0.5 : 1,
						}}
						onMouseEnter={(e) => {
							if (currentSection !== 0) {
								e.currentTarget.style.backgroundColor = "#F0F7F0";
							}
						}}
						onMouseLeave={(e) => {
							if (currentSection !== 0) {
								e.currentTarget.style.backgroundColor = "#F8FBF6";
							}
						}}
					>
						Previous Section
					</button>

					<button
						onClick={handleNext}
						disabled={isSaving}
						className="px-6 py-3 rounded-lg font-medium text-white transition-all disabled:cursor-not-allowed"
						style={{
							background: isSaving
								? "#CCCCCC"
								: "linear-gradient(135deg, #5C7F4F, #5B9378)",
							boxShadow: isSaving
								? "none"
								: "0 4px 12px rgba(45, 95, 63, 0.25)",
							opacity: isSaving ? 0.5 : 1,
						}}
						onMouseEnter={(e) => {
							if (!isSaving) {
								e.currentTarget.style.transform = "translateY(-1px)";
								e.currentTarget.style.boxShadow =
									"0 6px 16px rgba(45, 95, 63, 0.35)";
							}
						}}
						onMouseLeave={(e) => {
							if (!isSaving) {
								e.currentTarget.style.transform = "translateY(0)";
								e.currentTarget.style.boxShadow =
									"0 4px 12px rgba(45, 95, 63, 0.25)";
							}
						}}
					>
						{isSaving
							? "Saving..."
							: currentSection === sections.length - 1
								? "Complete Reflection"
								: "Next Section"}
					</button>
				</footer>
			</div>
		</div>
	);
};
