// Professional Pre-Assignment Prep with warm, accessible UX
import {
	Check,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Circle,
	FileText,
	Heart,
	Lightbulb,
	Shield,
	Target,
	Brain,
	Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { directInsertReflection } from "../services/directSupabaseApi";

import {
	CommunityIcon,
	HeartPulseIcon,
	NotepadIcon,
	SecureLockIcon,
} from "./CustomIcon";
import { ModalNavigationHeader } from "./ModalNavigationHeader";
import { ReflectionSuccessToast } from "./ReflectionSuccessToast";
import { ReflectionIntro } from "./shared/ReflectionIntro";
import { IT } from "./shared/TermTooltip";

interface PreAssignmentPrepProps {
	onClose: () => void;
	onComplete?: (data: PrepData) => void;
}

interface PrepData {
	assignmentType: string;
	duration: string;
	emotionalState: string;
	physicalReadiness: string;
	knowledgeGaps: string[];
	supportContacts: string[];
	selfCarePost: string[];
	positiveAffirmations: string[];
	notes: string;
	timestamp: string;
}

const ASSIGNMENT_TYPES = [
	{ value: "medical", label: "Medical", icon: HeartPulseIcon },
	{ value: "legal", label: "Legal", icon: SecureLockIcon },
	{ value: "educational", label: "Educational", icon: NotepadIcon },
	{ value: "conference", label: "Conference", icon: CommunityIcon },
	{ value: "community", label: "Community", icon: CommunityIcon },
	{ value: "mental-health", label: "Mental Health", icon: HeartPulseIcon },
	{ value: "other", label: "Other", icon: NotepadIcon },
];

const EMOTIONAL_STATES = [
	{ value: "confident", label: "Confident & Ready", emoji: "😊" },
	{ value: "prepared", label: "Prepared but Nervous", emoji: "😌" },
	{ value: "anxious", label: "Somewhat Anxious", emoji: "😟" },
	{ value: "stressed", label: "Stressed", emoji: "😰" },
	{ value: "centered", label: "Centered & Calm", emoji: "🧘" },
];

const PHYSICAL_STATES = [
	{ value: "energized", label: "Energized & Rested", emoji: "💪" },
	{ value: "adequate", label: "Adequate Energy", emoji: "👍" },
	{ value: "tired", label: "Somewhat Tired", emoji: "😴" },
	{ value: "exhausted", label: "Exhausted", emoji: "😫" },
	{ value: "recovering", label: "Recovering", emoji: "🤒" },
];

const steps = [
	{ id: 1, title: "The Assignment", icon: FileText },
	{ id: 2, title: "How You Feel", icon: Heart },
	{ id: 3, title: "Your Energy", icon: Target },
	{ id: 4, title: "Quick Review", icon: Brain },
	{ id: 5, title: "Your Backup", icon: Users },
	{ id: 6, title: "Self-Care Plan", icon: Shield },
	{ id: 7, title: "Affirmations", icon: Lightbulb },
	{ id: 8, title: "Review", icon: CheckCircle },
];

const PreAssignmentPrepAccessible: React.FC<PreAssignmentPrepProps> = ({
	onClose,
	onComplete,
}) => {
	const { user } = useAuth();
	const [currentStep, setCurrentStep] = useState(1);
	const [isReviewing, setIsReviewing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [showSuccessToast, setShowSuccessToast] = useState(false);
	const [newInput, setNewInput] = useState("");

	const [formData, setFormData] = useState<PrepData>({
		assignmentType: "",
		duration: "",
		emotionalState: "",
		physicalReadiness: "",
		knowledgeGaps: [],
		supportContacts: [],
		selfCarePost: [],
		positiveAffirmations: [],
		notes: "",
		timestamp: new Date().toISOString(),
	});

	const progressRef = useRef<HTMLDivElement>(null);

	// Load draft if exists
	useEffect(() => {
		const draft = localStorage.getItem("preAssignmentPrepDraft");
		if (draft) {
			const parsed = JSON.parse(draft);
			setFormData(parsed);
			const lastStep = localStorage.getItem("preAssignmentPrepStep");
			if (lastStep) {
				setCurrentStep(parseInt(lastStep));
			}
		}
	}, []);

	// Auto-save draft
	useEffect(() => {
		const saveTimer = setTimeout(() => {
			localStorage.setItem("preAssignmentPrepDraft", JSON.stringify(formData));
			localStorage.setItem("preAssignmentPrepStep", currentStep.toString());
		}, 1000);

		return () => clearTimeout(saveTimer);
	}, [formData, currentStep]);

	const handleNext = () => {
		if (currentStep < steps.length) {
			setCurrentStep((prev) => prev + 1);
			progressRef.current?.focus();
		}
	};

	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep((prev) => prev - 1);
			progressRef.current?.focus();
		}
	};

	const handleStepJump = (step: number) => {
		setCurrentStep(step);
		setIsReviewing(false);
	};

	const handleComplete = async () => {
		if (!user) {
			console.error("No user logged in");
			return;
		}

		setIsSaving(true);

		const completedData = {
			...formData,
			timestamp: new Date().toISOString(),
		};

		try {
			const accessToken = JSON.parse(
				localStorage.getItem("session") || "{}",
			).access_token;

			const reflectionData = {
				user_id: user.id,
				entry_kind: "pre_assignment_prep", // CRITICAL: Growth Insights tracks this!
				data: completedData,
				reflection_id: crypto.randomUUID(),
			};

			console.log(
				"PreAssignmentPrepAccessible - Calling directInsertReflection with:",
				reflectionData,
			);
			const { data, error } = await directInsertReflection(
				reflectionData,
				accessToken,
			);
			console.log(
				"PreAssignmentPrepAccessible - directInsertReflection response:",
				{
					data,
					error,
				},
			);

			if (error) {
				console.error("PreAssignmentPrepAccessible - Error saving:", error);
				throw error;
			}

			console.log("PreAssignmentPrepAccessible - Saved successfully:", data);

			localStorage.setItem(
				"lastPreAssignmentPrep",
				JSON.stringify(completedData),
			);
			localStorage.removeItem("preAssignmentPrepDraft");
			localStorage.removeItem("preAssignmentPrepStep");

			setShowSuccessToast(true);

			setTimeout(() => {
				if (onComplete) {
					onComplete(completedData);
				}
				onClose();
			}, 1500);
		} catch (error) {
			console.error("Error saving pre-assignment prep:", error);
			alert("Failed to save reflection. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const addToList = (field: keyof PrepData, value: string) => {
		if (value.trim()) {
			setFormData((prev) => ({
				...prev,
				[field]: [...(prev[field] as string[]), value.trim()],
			}));
			setNewInput("");
		}
	};

	const removeFromList = (field: keyof PrepData, index: number) => {
		setFormData((prev) => ({
			...prev,
			[field]: (prev[field] as string[]).filter((_, i) => i !== index),
		}));
	};

	const renderProgressBar = () => (
		<nav aria-label="Progress" className="mb-8">
			<ol className="flex justify-between items-center">
				{steps.map((step, index) => {
					const isCompleted = index + 1 < currentStep;
					const isCurrent = index + 1 === currentStep;
					const Icon = step.icon;

					return (
						<li key={step.id} className="flex-1 relative">
							{index < steps.length - 1 && (
								<div
									className="absolute top-5 left-1/2 w-full h-0.5"
									style={{
										backgroundColor: isCompleted
											? "#5C7F4F"
											: "rgba(203, 213, 224, 0.5)",
									}}
									aria-hidden="true"
								/>
							)}
							<button
								type="button"
								onClick={() => handleStepJump(step.id)}
								className={`relative w-full flex flex-col items-center p-2 rounded-lg transition-all ${
									isCompleted || isCurrent
										? "text-white"
										: "text-gray-400 hover:text-gray-600"
								} ${isCurrent ? "ring-2 ring-offset-2 ring-green-500" : ""}`}
								style={{
									background:
										isCompleted || isCurrent
											? "linear-gradient(135deg, #5C7F4F, #5B9378)"
											: "transparent",
								}}
								aria-label={`${step.title} - ${isCompleted ? "Completed" : isCurrent ? "Current step" : "Not yet reached"}`}
								aria-current={isCurrent ? "step" : undefined}
							>
								<div
									className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
										isCompleted || isCurrent ? "bg-white/20" : "bg-gray-200"
									}`}
								>
									{isCompleted ? (
										<Check className="h-5 w-5" />
									) : (
										<Icon className="h-5 w-5" />
									)}
								</div>
								<span className="text-xs font-medium">{step.title}</span>
							</button>
						</li>
					);
				})}
			</ol>
			<div
				ref={progressRef}
				role="status"
				aria-live="polite"
				aria-atomic="true"
				className="mt-4 text-center text-sm"
				style={{ color: "#4A5568" }}
				tabIndex={-1}
			>
				Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
			</div>
		</nav>
	);

	const renderStepContent = () => {
		if (currentStep === 8 || isReviewing) {
			return renderReviewStep();
		}

		switch (currentStep) {
			case 1:
				return renderAssignmentDetails();
			case 2:
				return renderEmotionalCheck();
			case 3:
				return renderPhysicalReadiness();
			case 4:
				return renderKnowledgePrep();
			case 5:
				return renderSupportNetwork();
			case 6:
				return renderSelfCarePlan();
			case 7:
				return renderPositiveMindset();
			default:
				return null;
		}
	};

	const renderAssignmentDetails = () => (
		<section aria-labelledby="assignment-heading">
			<h3
				id="assignment-heading"
				className="text-xl font-bold mb-4"
				style={{ color: "#2D3748" }}
			>
				What's the assignment?
			</h3>
			<p className="text-sm mb-6" style={{ color: "#4A5568" }}>
				Let's start with the basics. What kind of interpreting are you doing?
			</p>

			<fieldset className="mb-6">
				<legend className="text-sm font-medium mb-3" style={{ color: "#2D3748" }}>
					Assignment type
				</legend>
				<div className="grid grid-cols-2 gap-3">
					{ASSIGNMENT_TYPES.map((type) => {
						const Icon = type.icon;
						return (
							<label
								key={type.value}
								className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 ${
									formData.assignmentType === type.value
										? "border-[#6B8268] bg-[rgba(107,130,104,0.05)]"
										: "border-gray-200 hover:border-gray-300"
								}`}
							>
								<input
									type="radio"
									name="assignmentType"
									value={type.value}
									checked={formData.assignmentType === type.value}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											assignmentType: e.target.value,
										}))
									}
									className="sr-only"
								/>
								<Icon size={24} />
								<span className="font-medium">{type.label}</span>
							</label>
						);
					})}
				</div>
			</fieldset>

			<div>
				<label
					htmlFor="duration"
					className="block text-sm font-medium mb-2"
					style={{ color: "#2D3748" }}
				>
					How long will it last? (optional)
				</label>
				<input
					id="duration"
					type="text"
					value={formData.duration}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, duration: e.target.value }))
					}
					placeholder="e.g., 2 hours, all day, 30 minutes"
					className="w-full p-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
				/>
			</div>
		</section>
	);

	const renderEmotionalCheck = () => (
		<section aria-labelledby="emotional-heading">
			<h3
				id="emotional-heading"
				className="text-xl font-bold mb-4"
				style={{ color: "#2D3748" }}
			>
				How are you feeling?
			</h3>
			<p className="text-sm mb-6" style={{ color: "#4A5568" }}>
				Be honest with yourself - there's no right or wrong answer. Just noticing how you feel helps.
			</p>

			<fieldset>
				<legend className="sr-only">Select your emotional state</legend>
				<div className="space-y-3">
					{EMOTIONAL_STATES.map((state) => (
						<label
							key={state.value}
							className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 ${
								formData.emotionalState === state.value
									? "border-[#6B8268] bg-[rgba(107,130,104,0.05)]"
									: "border-gray-200 hover:border-gray-300"
							}`}
						>
							<input
								type="radio"
								name="emotionalState"
								value={state.value}
								checked={formData.emotionalState === state.value}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										emotionalState: e.target.value,
									}))
								}
								className="sr-only"
							/>
							<span className="flex items-center gap-3">
								<span className="text-2xl" aria-hidden="true">
									{state.emoji}
								</span>
								<span style={{ color: "#2D3748" }}>{state.label}</span>
							</span>
							<Circle
								className={`h-5 w-5 ${
									formData.emotionalState === state.value ? "fill-current" : ""
								}`}
								style={{
									color:
										formData.emotionalState === state.value
											? "#5C7F4F"
											: "#CBD5E0",
								}}
							/>
						</label>
					))}
				</div>
			</fieldset>
		</section>
	);

	const renderPhysicalReadiness = () => (
		<section aria-labelledby="physical-heading">
			<h3
				id="physical-heading"
				className="text-xl font-bold mb-4"
				style={{ color: "#2D3748" }}
			>
				What's your energy level?
			</h3>
			<p className="text-sm mb-6" style={{ color: "#4A5568" }}>
				Knowing your physical state helps you plan for breaks and self-care.
			</p>

			<fieldset>
				<legend className="sr-only">Select your physical state</legend>
				<div className="space-y-3">
					{PHYSICAL_STATES.map((state) => (
						<label
							key={state.value}
							className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 ${
								formData.physicalReadiness === state.value
									? "border-[#6B8268] bg-[rgba(107,130,104,0.05)]"
									: "border-gray-200 hover:border-gray-300"
							}`}
						>
							<input
								type="radio"
								name="physicalReadiness"
								value={state.value}
								checked={formData.physicalReadiness === state.value}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										physicalReadiness: e.target.value,
									}))
								}
								className="sr-only"
							/>
							<span className="flex items-center gap-3">
								<span className="text-2xl" aria-hidden="true">
									{state.emoji}
								</span>
								<span style={{ color: "#2D3748" }}>{state.label}</span>
							</span>
							<Circle
								className={`h-5 w-5 ${
									formData.physicalReadiness === state.value
										? "fill-current"
										: ""
								}`}
								style={{
									color:
										formData.physicalReadiness === state.value
											? "#5C7F4F"
											: "#CBD5E0",
								}}
							/>
						</label>
					))}
				</div>
			</fieldset>
		</section>
	);

	const renderKnowledgePrep = () => (
		<section aria-labelledby="knowledge-heading">
			<h3
				id="knowledge-heading"
				className="text-xl font-bold mb-4"
				style={{ color: "#2D3748" }}
			>
				Anything you want to brush up on?
			</h3>
			<p className="text-sm mb-6" style={{ color: "#4A5568" }}>
				Are there any topics, terms, or concepts you'd like to review quickly? (This is optional!)
			</p>

			<div>
				<div className="flex gap-2 mb-4">
					<input
						type="text"
						value={newInput}
						onChange={(e) => setNewInput(e.target.value)}
						onKeyPress={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addToList("knowledgeGaps", newInput);
							}
						}}
						placeholder="e.g., medical terminology, legal terms..."
						className="flex-1 p-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
					/>
					<button
						type="button"
						onClick={() => addToList("knowledgeGaps", newInput)}
						className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
					>
						Add
					</button>
				</div>

				{formData.knowledgeGaps.length > 0 && (
					<div className="space-y-2">
						{formData.knowledgeGaps.map((item, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
							>
								<span className="text-sm">{item}</span>
								<button
									type="button"
									onClick={() => removeFromList("knowledgeGaps", index)}
									className="text-red-600 hover:text-red-800 text-sm font-medium"
								>
									Remove
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);

	const renderSupportNetwork = () => (
		<section aria-labelledby="support-heading">
			<h3
				id="support-heading"
				className="text-xl font-bold mb-4"
				style={{ color: "#2D3748" }}
			>
				Who's got your back?
			</h3>
			<p className="text-sm mb-6" style={{ color: "#4A5568" }}>
				Know who you can reach out to if you need support - before, during, or after the assignment.
			</p>

			<div>
				<div className="flex gap-2 mb-4">
					<input
						type="text"
						value={newInput}
						onChange={(e) => setNewInput(e.target.value)}
						onKeyPress={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addToList("supportContacts", newInput);
							}
						}}
						placeholder="e.g., mentor's name, colleague, supervisor..."
						className="flex-1 p-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
					/>
					<button
						type="button"
						onClick={() => addToList("supportContacts", newInput)}
						className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
					>
						Add
					</button>
				</div>

				{formData.supportContacts.length > 0 && (
					<div className="space-y-2">
						{formData.supportContacts.map((contact, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
							>
								<span className="text-sm">{contact}</span>
								<button
									type="button"
									onClick={() => removeFromList("supportContacts", index)}
									className="text-red-600 hover:text-red-800 text-sm font-medium"
								>
									Remove
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);

	const renderSelfCarePlan = () => (
		<section aria-labelledby="selfcare-heading">
			<h3
				id="selfcare-heading"
				className="text-xl font-bold mb-4"
				style={{ color: "#2D3748" }}
			>
				How will you recharge after?
			</h3>
			<p className="text-sm mb-6" style={{ color: "#4A5568" }}>
				Planning self-care in advance makes it more likely to happen. What will help you decompress?
			</p>

			<div>
				<div className="flex gap-2 mb-4">
					<input
						type="text"
						value={newInput}
						onChange={(e) => setNewInput(e.target.value)}
						onKeyPress={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addToList("selfCarePost", newInput);
							}
						}}
						placeholder="e.g., take a walk, call a friend, rest..."
						className="flex-1 p-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
					/>
					<button
						type="button"
						onClick={() => addToList("selfCarePost", newInput)}
						className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
					>
						Add
					</button>
				</div>

				{formData.selfCarePost.length > 0 && (
					<div className="space-y-2">
						{formData.selfCarePost.map((item, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
							>
								<span className="text-sm">{item}</span>
								<button
									type="button"
									onClick={() => removeFromList("selfCarePost", index)}
									className="text-red-600 hover:text-red-800 text-sm font-medium"
								>
									Remove
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);

	const renderPositiveMindset = () => (
		<section aria-labelledby="affirmations-heading">
			<h3
				id="affirmations-heading"
				className="text-xl font-bold mb-4"
				style={{ color: "#2D3748" }}
			>
				What are your strengths today?
			</h3>
			<p className="text-sm mb-6" style={{ color: "#4A5568" }}>
				Remind yourself of what you bring to this work. What skills or qualities will help you today?
			</p>

			<div>
				<div className="flex gap-2 mb-4">
					<input
						type="text"
						value={newInput}
						onChange={(e) => setNewInput(e.target.value)}
						onKeyPress={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addToList("positiveAffirmations", newInput);
							}
						}}
						placeholder="e.g., I'm prepared, I adapt well, I care about this work..."
						className="flex-1 p-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
					/>
					<button
						type="button"
						onClick={() => addToList("positiveAffirmations", newInput)}
						className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
					>
						Add
					</button>
				</div>

				{formData.positiveAffirmations.length > 0 && (
					<div className="space-y-2">
						{formData.positiveAffirmations.map((affirmation, index) => (
							<div
								key={index}
								className="flex items-center justify-between p-3 bg-[rgba(107,130,104,0.05)] rounded-lg"
							>
								<span className="text-sm">{affirmation}</span>
								<button
									type="button"
									onClick={() => removeFromList("positiveAffirmations", index)}
									className="text-red-600 hover:text-red-800 text-sm font-medium"
								>
									Remove
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);

	const renderReviewStep = () => (
		<section aria-labelledby="review-heading">
			<h3
				id="review-heading"
				className="text-2xl font-bold mb-6"
				style={{ color: "#2D3748" }}
			>
				You're all set! 🎉
			</h3>

			<div className="space-y-6">
				{/* Assignment Overview */}
				{formData.assignmentType && (
					<div className="p-4 bg-gray-50 rounded-lg">
						<h4 className="font-semibold mb-2" style={{ color: "#2D3748" }}>
							Assignment
						</h4>
						<p className="text-sm capitalize" style={{ color: "#4A5568" }}>
							{formData.assignmentType.replace("-", " ")}
							{formData.duration && ` • ${formData.duration}`}
						</p>
					</div>
				)}

				{/* Emotional & Physical State */}
				{(formData.emotionalState || formData.physicalReadiness) && (
					<div className="p-4 bg-gray-50 rounded-lg">
						<h4 className="font-semibold mb-2" style={{ color: "#2D3748" }}>
							How You're Doing
						</h4>
						{formData.emotionalState && (
							<p className="text-sm capitalize" style={{ color: "#4A5568" }}>
								Emotionally: {formData.emotionalState}
							</p>
						)}
						{formData.physicalReadiness && (
							<p className="text-sm capitalize" style={{ color: "#4A5568" }}>
								Energy: {formData.physicalReadiness}
							</p>
						)}
					</div>
				)}

				{/* Knowledge Review */}
				{formData.knowledgeGaps.length > 0 && (
					<div className="p-4 bg-gray-50 rounded-lg">
						<h4 className="font-semibold mb-2" style={{ color: "#2D3748" }}>
							To Review
						</h4>
						<ul className="space-y-1">
							{formData.knowledgeGaps.map((item, index) => (
								<li key={index} className="text-sm" style={{ color: "#4A5568" }}>
									• {item}
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Support Network */}
				{formData.supportContacts.length > 0 && (
					<div className="p-4 bg-gray-50 rounded-lg">
						<h4 className="font-semibold mb-2" style={{ color: "#2D3748" }}>
							Your Support Team
						</h4>
						<ul className="space-y-1">
							{formData.supportContacts.map((contact, index) => (
								<li key={index} className="text-sm" style={{ color: "#4A5568" }}>
									• {contact}
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Self-Care Plan */}
				{formData.selfCarePost.length > 0 && (
					<div className="p-4 bg-[rgba(107,130,104,0.05)] rounded-lg">
						<h4 className="font-semibold mb-2" style={{ color: "#2D3748" }}>
							Post-Assignment Self-Care
						</h4>
						<ul className="space-y-1">
							{formData.selfCarePost.map((item, index) => (
								<li key={index} className="text-sm" style={{ color: "#4A5568" }}>
									• {item}
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Affirmations */}
				{formData.positiveAffirmations.length > 0 && (
					<div className="p-4 bg-[rgba(107,130,104,0.05)] rounded-lg">
						<h4 className="font-semibold mb-2" style={{ color: "#2D3748" }}>
							Your Strengths
						</h4>
						<ul className="space-y-1">
							{formData.positiveAffirmations.map((affirmation, index) => (
								<li key={index} className="text-sm" style={{ color: "#4A5568" }}>
									• {affirmation}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			<div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
				<p className="text-sm" style={{ color: "#2563eb" }}>
					💡 You've got this! Take a deep breath and trust your preparation.
				</p>
			</div>
		</section>
	);

	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
			onClick={onClose}
		>
			<div
				className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<ModalNavigationHeader
					title="Pre-Assignment Prep"
					subtitle="Set yourself up for success"
					onClose={onClose}
				/>

				{/* Intro (only show on first step) */}
				{currentStep === 1 && (
					<div className="px-8 pt-6">
						<ReflectionIntro
							title="Pre-Assignment Prep"
							subtitle="Set yourself up for success before your next assignment"
							description="Take a few minutes to mentally and emotionally prepare. This professional practice helps reduce stress and improve your performance."
							estimatedTime="5 minutes"
							professionalContext="Professional interpreters use pre-assignment preparation to get ready for the demands ahead. It's a proven way to center yourself and set intentions."
							tips={[
								"Be honest - this is just for you",
								"Skip anything that doesn't apply",
								"Even 2 minutes of prep makes a difference",
							]}
						/>
					</div>
				)}

				{/* Content */}
				<div className="flex-1 overflow-y-auto px-8 py-6">
					{renderProgressBar()}
					{renderStepContent()}
				</div>

				{/* Footer Navigation */}
				<div
					className="border-t p-6 flex items-center justify-between"
					style={{ borderColor: "#E5E7EB" }}
				>
					<button
						onClick={handlePrevious}
						disabled={currentStep === 1}
						className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
						style={{ color: "#4B5563" }}
					>
						<ChevronLeft size={20} />
						Previous
					</button>

					<div className="text-sm" style={{ color: "#6B7280" }}>
						{currentStep} of {steps.length}
					</div>

					{currentStep === steps.length ? (
						<button
							onClick={handleComplete}
							disabled={isSaving}
							className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
						>
							{isSaving ? "Saving..." : "Complete"}
						</button>
					) : (
						<button
							onClick={handleNext}
							className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
						>
							Next
							<ChevronRight size={20} />
						</button>
					)}
				</div>
			</div>

			{/* Success Toast */}
			{showSuccessToast && (
				<ReflectionSuccessToast
					onClose={() => setShowSuccessToast(false)}
					reflectionType="Pre-Assignment Prep"
				/>
			)}
		</div>
	);
};

export default PreAssignmentPrepAccessible;
