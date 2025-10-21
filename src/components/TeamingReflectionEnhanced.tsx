import {
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Lightbulb,
	Users,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { reflectionService } from "../services/reflectionService";

import { CommunityIcon, HeartPulseIcon, TargetIcon } from "./CustomIcon";

interface TeamingReflectionData {
	// What Happened
	assignment_type: "virtual" | "in-person" | "hybrid";
	what_surprised: string;
	
	// Team Dynamics
	what_worked_well: string;
	what_was_challenging: string;
	
	// Communication & Handoffs
	handoff_effectiveness: string;
	communication_insights: string;
	
	// Personal Growth
	learned_about_self: string;
	learned_about_teaming: string;
	
	// Moving Forward
	keep_doing: string;
	do_differently: string;
	advice_for_future: string;
	
	timestamp: string;
}

interface TeamingReflectionEnhancedProps {
	onComplete?: (data: TeamingReflectionData) => void;
	onClose: () => void;
}

export const TeamingReflectionEnhanced: React.FC<
	TeamingReflectionEnhancedProps
> = ({ onComplete, onClose }) => {
	const { user } = useAuth();
	const [currentSection, setCurrentSection] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const startTime = Date.now();
	const modalRef = useRef<HTMLDivElement>(null);

	// Scroll to top on mount
	useEffect(() => {
		modalRef.current?.scrollTo({ top: 0, behavior: "instant" });
	}, []);

	// Form state
	const [formData, setFormData] = useState<TeamingReflectionData>({
		assignment_type: "in-person",
		what_surprised: "",
		what_worked_well: "",
		what_was_challenging: "",
		handoff_effectiveness: "",
		communication_insights: "",
		learned_about_self: "",
		learned_about_teaming: "",
		keep_doing: "",
		do_differently: "",
		advice_for_future: "",
		timestamp: new Date().toISOString(),
	});

	const validateSection = (sectionIndex: number): boolean => {
		const newErrors: Record<string, string> = {};

		switch (sectionIndex) {
			case 0: // What Happened
				if (!formData.what_surprised?.trim()) {
					newErrors.what_surprised = "Please share what surprised you";
				}
				break;
			case 1: // Team Dynamics
				if (!formData.what_worked_well?.trim()) {
					newErrors.what_worked_well = "Please describe what worked well";
				}
				break;
			case 2: // Communication
				if (!formData.handoff_effectiveness?.trim()) {
					newErrors.handoff_effectiveness = "Please reflect on handoffs";
				}
				break;
			case 3: // Personal Growth
				if (!formData.learned_about_self?.trim()) {
					newErrors.learned_about_self = "Please share what you learned";
				}
				break;
			case 4: // Moving Forward
				if (!formData.keep_doing?.trim()) {
					newErrors.keep_doing = "Please identify what to keep doing";
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
				setErrors({});
			} else {
				handleComplete();
			}
		}
	};

	const handlePrevious = () => {
		if (currentSection > 0) {
			setCurrentSection(currentSection - 1);
			setErrors({});
		}
	};

	const handleComplete = async () => {
		if (!validateSection(currentSection)) {
			console.log("TeamingReflection - Validation failed");
			return;
		}

		if (!user) {
			setErrors({ save: "You must be logged in to save" });
			return;
		}

		if (isSaving) {
			console.log("TeamingReflection - Already saving, ignoring duplicate click");
			return;
		}

		console.log("TeamingReflection - handleComplete called");
		setIsSaving(true);

		try {
			const timeSpent = Math.floor((Date.now() - startTime) / 1000);
			console.log("TeamingReflection - Starting save...");

			const finalData = {
				...formData,
				timestamp: new Date().toISOString(),
				time_spent_seconds: timeSpent,
			};

			console.log("TeamingReflection - Saving with reflectionService");

			const result = await reflectionService.saveReflection(
				user.id,
				"teaming_reflection",
				finalData,
			);

			if (!result.success) {
				console.error("TeamingReflection - Error saving:", result.error);
				throw new Error(result.error || "Failed to save reflection");
			}

			console.log("TeamingReflection - Save successful");
			setIsSaving(false);

			console.log("Teaming Reflection Results:", finalData);

			if (onComplete) {
				onComplete(finalData);
			}

			setTimeout(() => {
				onClose();
			}, 100);
		} catch (error) {
			console.error("TeamingReflection - Error in handleComplete:", error);
			setIsSaving(false);
			setErrors({
				save:
					error instanceof Error
						? error.message
						: "Failed to save reflection. Please try again.",
			});
		}
	};

	const handleFieldChange = (field: keyof TeamingReflectionData, value: any) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		// Clear error for this field
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	const sections = [
		{
			title: "What Happened",
			icon: <Lightbulb className="w-5 h-5" style={{ color: "#5B9378" }} />,
			guidance: "Start by capturing your initial impressions of the team assignment",
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							Was this virtual, in-person, or hybrid?
						</label>
						<div className="flex gap-3">
							{(["virtual", "in-person", "hybrid"] as const).map((type) => (
								<button
									key={type}
									onClick={() => handleFieldChange("assignment_type", type)}
									className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
										formData.assignment_type === type
											? "border-sage-600 bg-sage-50"
											: "border-gray-300 hover:border-sage-400"
									}`}
									style={{
										backgroundColor:
											formData.assignment_type === type
												? "rgba(107, 139, 96, 0.05)"
												: "#FFFFFF",
										borderColor:
											formData.assignment_type === type ? "#5B9378" : "#E8E5E0",
									}}
								>
									<span className="capitalize">{type}</span>
								</button>
							))}
						</div>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What surprised you most about this team assignment?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Think about what was different than you expected - good or challenging
						</p>
						<textarea
							value={formData.what_surprised}
							onChange={(e) => handleFieldChange("what_surprised", e.target.value)}
							placeholder="Example: How naturally we fell into rhythm / How challenging the handoffs were / How much easier it was with support / The way we handled a difficult moment..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.what_surprised ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.what_surprised && (
							<p className="text-sm text-red-500 mt-1">{errors.what_surprised}</p>
						)}
					</div>
				</div>
			),
		},
		{
			title: "Team Dynamics",
			icon: <Users className="w-5 h-5" style={{ color: "#5B9378" }} />,
			guidance: "Reflect on how you and your partner worked together",
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What worked well between you and your partner?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Celebrate what went right - this is what you want to repeat
						</p>
						<textarea
							value={formData.what_worked_well}
							onChange={(e) =>
								handleFieldChange("what_worked_well", e.target.value)
							}
							placeholder="Example: We communicated clearly about when to switch / We supported each other during tough moments / Our styles complemented each other / We stayed flexible..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.what_worked_well ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.what_worked_well && (
							<p className="text-sm text-red-500 mt-1">
								{errors.what_worked_well}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What was challenging about working as a team?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Naming challenges helps you learn and prepare better next time
						</p>
						<textarea
							value={formData.what_was_challenging}
							onChange={(e) =>
								handleFieldChange("what_was_challenging", e.target.value)
							}
							placeholder="Example: Timing our handoffs / Different interpreting styles / Managing the physical space / Coordinating without disrupting the flow..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: "#E8E5E0",
							}}
						/>
					</div>
				</div>
			),
		},
		{
			title: "Communication & Handoffs",
			icon: <CommunityIcon size={20} />,
			guidance: "How did you and your partner communicate and coordinate?",
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							How effective were your handoffs and transitions?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Think about what made handoffs smooth or what made them tricky
						</p>
						<textarea
							value={formData.handoff_effectiveness}
							onChange={(e) =>
								handleFieldChange("handoff_effectiveness", e.target.value)
							}
							placeholder="Example: Our signals were clear and we transitioned smoothly / We struggled at first but got better / We need to work on timing / The handoffs felt natural..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.handoff_effectiveness ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.handoff_effectiveness && (
							<p className="text-sm text-red-500 mt-1">
								{errors.handoff_effectiveness}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What did you learn about team communication?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							What insights will help you communicate better with future partners?
						</p>
						<textarea
							value={formData.communication_insights}
							onChange={(e) =>
								handleFieldChange("communication_insights", e.target.value)
							}
							placeholder="Example: Non-verbal cues are crucial / Clear pre-planning makes everything easier / Being flexible matters more than perfect plans / Trust develops quickly when you support each other..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: "#E8E5E0",
							}}
						/>
					</div>
				</div>
			),
		},
		{
			title: "Personal Growth",
			icon: <HeartPulseIcon size={20} />,
			guidance: "What did this experience teach you?",
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What did you learn about yourself?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							How did this team experience reveal your strengths or growth areas?
						</p>
						<textarea
							value={formData.learned_about_self}
							onChange={(e) =>
								handleFieldChange("learned_about_self", e.target.value)
							}
							placeholder="Example: I'm better at adapting than I thought / I need to speak up more about my needs / I thrive with support / I can trust my instincts more..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.learned_about_self ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.learned_about_self && (
							<p className="text-sm text-red-500 mt-1">
								{errors.learned_about_self}
							</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What did you learn about team interpreting?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							What insights about teaming will you carry forward?
						</p>
						<textarea
							value={formData.learned_about_teaming}
							onChange={(e) =>
								handleFieldChange("learned_about_teaming", e.target.value)
							}
							placeholder="Example: The power of having a partner who gets it / How much preparation matters / The importance of checking in with each other / How teaming reduces stress..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: "#E8E5E0",
							}}
						/>
					</div>
				</div>
			),
		},
		{
			title: "Moving Forward",
			icon: <TargetIcon size={20} />,
			guidance: "Take these insights into your next team assignment",
			content: (
				<div className="space-y-6">
					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What will you keep doing in future team assignments?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Identify the practices that worked - these are your strengths
						</p>
						<textarea
							value={formData.keep_doing}
							onChange={(e) => handleFieldChange("keep_doing", e.target.value)}
							placeholder="Example: Pre-planning handoff signals / Checking in with my partner during breaks / Being flexible and supportive / Communicating clearly about my needs..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: errors.keep_doing ? "#ef4444" : "#E8E5E0",
							}}
						/>
						{errors.keep_doing && (
							<p className="text-sm text-red-500 mt-1">{errors.keep_doing}</p>
						)}
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What would you do differently next time?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Every experience teaches us something - what will you adjust?
						</p>
						<textarea
							value={formData.do_differently}
							onChange={(e) =>
								handleFieldChange("do_differently", e.target.value)
							}
							placeholder="Example: Discuss expectations more upfront / Practice handoff signals before starting / Be more proactive about communication / Take more breaks to check in..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: "#E8E5E0",
							}}
						/>
					</div>

					<div>
						<label
							className="block text-sm font-medium mb-2"
							style={{ color: "#5C7F4F" }}
						>
							What advice would you give yourself for the next team assignment?
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Capture your wisdom while it's fresh
						</p>
						<textarea
							value={formData.advice_for_future}
							onChange={(e) =>
								handleFieldChange("advice_for_future", e.target.value)
							}
							placeholder="Example: Trust the process / Communicate early and often / Remember that teaming gets easier with practice / Don't be afraid to speak up..."
							rows={4}
							className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
							style={{
								borderColor: "#E8E5E0",
							}}
						/>
					</div>
				</div>
			),
		},
	];

	const currentSectionData = sections[currentSection];
	const progress = ((currentSection + 1) / sections.length) * 100;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
		>
			<div
				ref={modalRef}
				className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
			>
				{/* Header */}
				<div
					className="sticky top-0 bg-white z-10 px-8 pt-6 pb-4 border-b"
					style={{ backgroundColor: "#FAF9F6" }}
				>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div
								className="w-12 h-12 rounded-lg flex items-center justify-center"
								style={{
									background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
								}}
							>
								<CommunityIcon size={48} />
							</div>
							<div>
								<h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
									Team Reflection
								</h2>
								<p className="text-sm mt-1" style={{ color: "#5F7F55" }}>
									Capture what you learned from working with your partner
								</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="p-2 rounded-lg transition-all hover:bg-gray-100"
							aria-label="Close"
						>
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>

					{/* Progress Bar */}
					<div className="mt-4">
						<div className="flex justify-between text-sm mb-2">
							<span style={{ color: "#5F7F55" }}>
								Page {currentSection + 1} of {sections.length}
							</span>
							<span style={{ color: "#5F7F55" }}>
								{Math.round(progress)}% Complete
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className="h-full rounded-full transition-all duration-300"
								style={{
									width: `${progress}%`,
									background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
								}}
							/>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="px-8 py-6">
					<div className="flex items-center mb-4">
						<div
							className="p-2 rounded-lg mr-3"
							style={{ backgroundColor: "#E8F0E8" }}
						>
							{currentSectionData.icon}
						</div>
						<div>
							<h3 className="text-xl font-semibold" style={{ color: "#5C7F4F" }}>
								{currentSectionData.title}
							</h3>
							<p className="text-sm" style={{ color: "#6B7280" }}>
								{currentSectionData.guidance}
							</p>
						</div>
					</div>

					{currentSectionData.content}

					{errors.save && (
						<div
							className="mt-4 p-4 rounded-lg"
							style={{ backgroundColor: "#FEE2E2" }}
						>
							<p className="text-sm" style={{ color: "#DC2626" }}>
								{errors.save}
							</p>
						</div>
					)}
				</div>

				{/* Footer */}
				<div
					className="sticky bottom-0 px-8 py-4 border-t"
					style={{ backgroundColor: "#FAF9F6" }}
				>
					<div className="flex justify-between">
						<button
							onClick={handlePrevious}
							disabled={currentSection === 0}
							className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center ${
								currentSection === 0
									? "bg-gray-100 text-gray-400 cursor-not-allowed"
									: "bg-white border border-sage-600 text-sage-700 hover:bg-sage-50"
							}`}
						>
							<ChevronLeft className="w-4 h-4 mr-2" />
							Previous
						</button>

						<button
							onClick={handleNext}
							disabled={isSaving}
							className="px-6 py-2 rounded-lg font-medium text-white transition-all flex items-center hover:opacity-90 disabled:opacity-50"
							style={{
								background: isSaving
									? "#CCCCCC"
									: "linear-gradient(135deg, #5C7F4F, #5B9378)",
								cursor: isSaving ? "not-allowed" : "pointer",
							}}
						>
							{isSaving ? (
								"Saving..."
							) : currentSection === sections.length - 1 ? (
								<>
									<CheckCircle className="w-4 h-4 mr-2" />
									Complete Reflection
								</>
							) : (
								<>
									Next
									<ChevronRight className="w-4 h-4 ml-2" />
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TeamingReflectionEnhanced;
