import {
	Check,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Circle,
	Download,
	Edit2,
	FileText,
	Lightbulb,
	Mail,
	TrendingUp,
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
	{ id: 1, title: "Assignment Details", icon: FileText },
	{ id: 2, title: "Emotional Check", icon: Heart },
	{ id: 3, title: "Physical Readiness", icon: Target },
	{ id: 4, title: "Knowledge Prep", icon: Brain },
	{ id: 5, title: "Support Network", icon: Users },
	{ id: 6, title: "Self-Care Plan", icon: Shield },
	{ id: 7, title: "Positive Mindset", icon: Lightbulb },
	{ id: 8, title: "Review & Complete", icon: CheckCircle },
];

const PreAssignmentPrepAccessible: React.FC<PreAssignmentPrepProps> = ({
	onClose,
	onComplete,
}) => {
	const { user } = useAuth();
	const [currentStep, setCurrentStep] = useState(1);
	const [isReviewing, setIsReviewing] = useState(false);
	const [showComparison, setShowComparison] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

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

	const [previousPrep, setPreviousPrep] = useState<PrepData | null>(null);
	const progressRef = useRef<HTMLDivElement>(null);

	// Load previous prep data for comparison
	useEffect(() => {
		const saved = localStorage.getItem("lastPreAssignmentPrep");
		if (saved) {
			setPreviousPrep(JSON.parse(saved));
		}

		// Load draft if exists
		const draft = localStorage.getItem("preAssignmentPrepDraft");
		if (draft) {
			const parsed = JSON.parse(draft);
			setFormData(parsed);
			// Resume from where they left off
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
			setIsSaving(true);
			setTimeout(() => setIsSaving(false), 1000);
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
			// Save to database using direct API
			const accessToken = JSON.parse(
				localStorage.getItem("session") || "{}",
			).access_token;

			const reflectionData = {
				user_id: user.id,
				entry_kind: "pre_assignment_prep",
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

			// Also save to localStorage for offline access
			localStorage.setItem(
				"lastPreAssignmentPrep",
				JSON.stringify(completedData),
			);
			localStorage.removeItem("preAssignmentPrepDraft");
			localStorage.removeItem("preAssignmentPrepStep");

			if (onComplete) {
				onComplete(completedData);
			}

			onClose();
		} catch (error) {
			console.error("Error saving pre-assignment prep:", error);
			alert("Failed to save reflection. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDownloadChecklist = () => {
		const checklist = generateChecklist();
		const blob = new Blob([checklist], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `pre-assignment-checklist-${new Date().toISOString().split("T")[0]}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleEmailChecklist = () => {
		const checklist = generateChecklist();
		const subject = `Pre-Assignment Checklist - ${new Date().toLocaleDateString()}`;
		const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(checklist)}`;
		window.open(mailtoUrl);
	};

	const generateChecklist = () => {
		return `PRE-ASSIGNMENT PREPARATION CHECKLIST
Date: ${new Date().toLocaleString()}

ASSIGNMENT DETAILS
✓ Type: ${formData.assignmentType}
✓ Duration: ${formData.duration}

READINESS CHECK
✓ Emotional State: ${formData.emotionalState}
✓ Physical State: ${formData.physicalReadiness}

PREPARATION
✓ Knowledge Gaps Identified: ${formData.knowledgeGaps.join(", ") || "None identified"}
✓ Support Contacts: ${formData.supportContacts.join(", ") || "None listed"}

SELF-CARE PLAN
${formData.selfCarePost.map((item) => `✓ ${item}`).join("\n")}

POSITIVE AFFIRMATIONS
${formData.positiveAffirmations.map((item) => `✓ ${item}`).join("\n")}

NOTES
${formData.notes || "No additional notes"}

---
Generated by InterpretReflect™`;
	};

	const renderProgressIndicator = () => (
		<nav aria-label="Progress through preparation steps" className="mb-6">
			<ol className="flex items-center justify-between" role="list">
				{steps.map((step) => {
					const isCompleted = step.id < currentStep;
					const isCurrent = step.id === currentStep;
					const Icon = step.icon;

					return (
						<li key={step.id} className="flex-1">
							<button
								onClick={() => isCompleted && handleStepJump(step.id)}
								disabled={!isCompleted && !isCurrent}
								className={`w-full flex flex-col items-center p-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
									isCompleted || isCurrent
										? "text-white shadow-md hover:shadow-lg"
										: "bg-gray-50"
								}`}
								style={{
									background:
										isCompleted || isCurrent
											? "linear-gradient(135deg, #2D5F3F, #5B9378)"
											: "transparent",
									focusRingColor: "#2D5F3F",
								}}
								aria-label={`${step.title} - ${isCompleted ? "Completed" : isCurrent ? "Current step" : "Not yet reached"}`}
								aria-current={isCurrent ? "step" : undefined}
							>
								<div
									className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
										isCompleted || isCurrent ? "bg-white/20" : "bg-gray-200"
									}`}
									style={{
										color: isCompleted || isCurrent ? "#FFFFFF" : "#718096",
									}}
								>
									{isCompleted ? (
										<Check className="h-5 w-5" />
									) : (
										<Icon className="h-5 w-5" />
									)}
								</div>
								<span
									className={`text-xs ${
										isCompleted
											? "font-semibold"
											: isCurrent
												? "font-medium"
												: ""
									}`}
									style={{
										color: isCompleted || isCurrent ? "#FFFFFF" : "#A0AEC0",
									}}
								>
									{step.title}
								</span>
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
				Assignment Details
			</h3>
			<p className="text-sm mb-6" style={{ color: "#4A5568" }}>
				Let's start by understanding what you're preparing for.
			</p>

			<fieldset className="mb-6">
				<legend
					className="text-sm font-medium mb-3"
					style={{ color: "#2D3748" }}
				>
					What type of assignment is this?
				</legend>
				<div className="grid grid-cols-2 gap-3">
					{ASSIGNMENT_TYPES.map((type) => {
						const Icon = type.icon;
						return (
							<label
								key={type.value}
								className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 focus-within:ring-2 focus-within:ring-offset-2 ${
									formData.assignmentType === type.value
										? "border-green-500"
										: "border-gray-200 hover:border-gray-300"
								}`}
								style={{
									backgroundColor:
										formData.assignmentType === type.value
											? "#F0F5ED"
											: "#FFFFFF",
									borderColor:
										formData.assignmentType === type.value
											? "#2D5F3F"
											: undefined,
									focusRingColor: "#2D5F3F",
								}}
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
									className="absolute opacity-0 pointer-events-none"
								/>
								<Icon size={64} />
								<span style={{ color: "#2D3748" }}>{type.label}</span>
							</label>
						);
					})}
				</div>
			</fieldset>

			<fieldset>
				<legend
					className="text-sm font-medium mb-3"
					style={{ color: "#2D3748" }}
				>
					Expected duration
				</legend>
				<div className="grid grid-cols-3 gap-3">
					{[
						"30 min",
						"1 hour",
						"2 hours",
						"3 hours",
						"4+ hours",
						"All day",
					].map((duration) => (
						<label
							key={duration}
							className={`p-3 rounded-lg text-center cursor-pointer transition-all border-2 focus-within:ring-2 focus-within:ring-offset-2 ${
								formData.duration === duration
									? "border-green-500"
									: "border-gray-200 hover:border-gray-300"
							}`}
							style={{
								backgroundColor:
									formData.duration === duration ? "#F0F5ED" : "#FFFFFF",
								borderColor:
									formData.duration === duration ? "#2D5F3F" : undefined,
								focusRingColor: "#2D5F3F",
							}}
						>
							<input
								type="radio"
								name="duration"
								value={duration}
								checked={formData.duration === duration}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, duration: e.target.value }))
								}
								className="absolute opacity-0 pointer-events-none"
							/>
							<span className="text-sm" style={{ color: "#2D3748" }}>
								{duration}
							</span>
						</label>
					))}
				</div>
			</fieldset>
		</section>
	);

	const renderEmotionalCheck = () => (
		<section aria-labelledby="emotional-heading">
			<h3
				id="emotional-heading"
				className="text-xl font-bold mb-4"
				style={{ color: "#2D3748" }}
			>
				Emotional Check-In
			</h3>
			<p className="text-sm mb-6" style={{ color: "#4A5568" }}>
				How are you feeling emotionally as you prepare for this assignment?
			</p>

			<fieldset>
				<legend className="sr-only">Select your emotional state</legend>
				<div className="space-y-3">
					{EMOTIONAL_STATES.map((state) => (
						<label
							key={state.value}
							className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 focus-within:ring-2 focus-within:ring-offset-2 ${
								formData.emotionalState === state.value
									? "border-green-500"
									: "border-gray-200 hover:border-gray-300"
							}`}
							style={{
								backgroundColor:
									formData.emotionalState === state.value
										? "#F0F5ED"
										: "#FFFFFF",
								borderColor:
									formData.emotionalState === state.value
										? "#2D5F3F"
										: undefined,
								focusRingColor: "#2D5F3F",
							}}
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
								className="absolute opacity-0 pointer-events-none"
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
											? "#2D5F3F"
											: "#CBD5E0",
								}}
							/>
						</label>
					))}
				</div>
			</fieldset>

			{previousPrep && (
				<button
					onClick={() => setShowComparison(!showComparison)}
					className="mt-4 text-sm flex items-center gap-2"
					style={{ color: "#2D5F3F" }}
				>
					<TrendingUp className="h-4 w-4" />
					Compare with last prep
				</button>
			)}

			{showComparison && previousPrep && (
				<aside
					aria-labelledby="comparison-heading"
					className="mt-4 p-4 rounded-lg"
					style={{ backgroundColor: "#F7FAFC" }}
				>
					<h4
						id="comparison-heading"
						className="text-sm font-medium mb-2"
						style={{ color: "#2D3748" }}
					>
						Previous Assignment Comparison
					</h4>
					<ul className="space-y-1 text-sm" style={{ color: "#4A5568" }}>
						<li>Last time: {previousPrep.emotionalState || "Not recorded"}</li>
						<li>Type: {previousPrep.assignmentType || "Not recorded"}</li>
					</ul>
				</aside>
			)}
		</section>
	);

	const renderPhysicalReadiness = () => (
		<section aria-labelledby="physical-heading">
			<h3
				id="physical-heading"
				className="text-xl font-bold mb-4"
				style={{ color: "#2D3748" }}
			>
				Physical Readiness
			</h3>
			<p className="text-sm mb-6" style={{ color: "#4A5568" }}>
				How is your body feeling today?
			</p>

			<fieldset>
				<legend className="sr-only">Select your physical state</legend>
				<div className="space-y-3">
					{PHYSICAL_STATES.map((state) => (
						<label
							key={state.value}
							className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 focus-within:ring-2 focus-within:ring-offset-2 ${
								formData.physicalReadiness === state.value
									? "border-green-500"
									: "border-gray-200 hover:border-gray-300"
							}`}
							style={{
								backgroundColor:
									formData.physicalReadiness === state.value
										? "#F0F5ED"
										: "#FFFFFF",
								borderColor:
									formData.physicalReadiness === state.value
										? "#2D5F3F"
										: undefined,
								focusRingColor: "#2D5F3F",
							}}
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
								className="absolute opacity-0 pointer-events-none"
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
											? "#2D5F3F"
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
				Knowledge Preparation
			</h3>
			<p className="text-sm mb-6" style={{ color: "#4A5568" }}>
				Are there any topics or terms you'd like to review before starting?
			</p>

			<fieldset>
				<legend
					className="text-sm font-medium mb-3"
					style={{ color: "#2D3748" }}
				>
					Knowledge gaps or areas to review (optional)
				</legend>
				<textarea
					className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
					style={{
						borderColor: "#E2E8F0",
						focusRingColor: "#2D5F3F",
					}}
					rows={4}
					placeholder="E.g., Medical terminology, legal procedures, technical concepts..."
					value={formData.knowledgeGaps.join("\n")}
					onChange={(e) =>
						setFormData((prev) => ({
							...prev,
							knowledgeGaps: e.target.value.split("\n").filter(Boolean),
						}))
					}
					aria-label="List knowledge gaps or areas to review"
				/>
			</fieldset>
		</section>
	);

	const renderSupportNetwork = () => (
		<section aria-labelledby="support-heading">
			<h3
				id="support-heading"
				className="text-xl font-bold mb-4"
				style={{ color: "#2D3748" }}
			>
				Support Network
			</h3>
			<p className="text-sm mb-6" style={{ color: "#4A5568" }}>
				Who can you reach out to if you need support?
			</p>

			<fieldset>
				<legend
					className="text-sm font-medium mb-3"
					style={{ color: "#2D3748" }}
				>
					Support contacts (optional)
				</legend>
				<textarea
					className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
					style={{
						borderColor: "#E2E8F0",
						focusRingColor: "#2D5F3F",
					}}
					rows={3}
					placeholder="E.g., Team lead, mentor, colleague..."
					value={formData.supportContacts.join("\n")}
					onChange={(e) =>
						setFormData((prev) => ({
							...prev,
							supportContacts: e.target.value.split("\n").filter(Boolean),
						}))
					}
					aria-label="List your support contacts"
				/>
			</fieldset>
		</section>
	);

	const renderSelfCarePlan = () => (
		<section aria-labelledby="selfcare-heading">
			<h3
				id="selfcare-heading"
				className="text-xl font-bold mb-4"
				style={{ color: "#2D3748" }}
			>
				Post-Assignment Self-Care
			</h3>
			<p className="text-sm mb-6" style={{ color: "#4A5568" }}>
				How will you take care of yourself after this assignment?
			</p>

			<fieldset>
				<legend
					className="text-sm font-medium mb-3"
					style={{ color: "#2D3748" }}
				>
					Select or add self-care activities
				</legend>

				{[
					"Take a walk",
					"Practice breathing exercises",
					"Call a friend",
					"Rest",
					"Stretch",
					"Hydrate",
				].map((activity) => (
					<label
						key={activity}
						className="flex items-center gap-3 p-3 mb-2 rounded-lg hover:bg-gray-50 cursor-pointer"
					>
						<input
							type="checkbox"
							checked={formData.selfCarePost.includes(activity)}
							onChange={(e) => {
								if (e.target.checked) {
									setFormData((prev) => ({
										...prev,
										selfCarePost: [...prev.selfCarePost, activity],
									}));
								} else {
									setFormData((prev) => ({
										...prev,
										selfCarePost: prev.selfCarePost.filter(
											(a) => a !== activity,
										),
									}));
								}
							}}
							className="w-4 h-4 rounded"
							style={{ accentColor: "#2D5F3F" }}
						/>
						<span style={{ color: "#2D3748" }}>{activity}</span>
					</label>
				))}

				<input
					type="text"
					className="w-full mt-3 p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
					style={{
						borderColor: "#E2E8F0",
						focusRingColor: "#2D5F3F",
					}}
					placeholder="Add your own..."
					onKeyPress={(e) => {
						if (e.key === "Enter") {
							const value = (e.target as HTMLInputElement).value;
							if (value) {
								setFormData((prev) => ({
									...prev,
									selfCarePost: [...prev.selfCarePost, value],
								}));
								(e.target as HTMLInputElement).value = "";
							}
						}
					}}
					aria-label="Add custom self-care activity"
				/>
			</fieldset>
		</section>
	);

	const renderPositiveMindset = () => (
		<section aria-labelledby="mindset-heading">
			<h3
				id="mindset-heading"
				className="text-xl font-bold mb-4"
				style={{ color: "#2D3748" }}
			>
				Positive Mindset
			</h3>
			<p className="text-sm mb-6" style={{ color: "#4A5568" }}>
				What are 3 things you've done well in preparing for this assignment?
			</p>

			<fieldset>
				<legend
					className="text-sm font-medium mb-3"
					style={{ color: "#2D3748" }}
				>
					Celebrate your preparation wins
				</legend>

				{[1, 2, 3].map((num) => (
					<div key={num} className="mb-3">
						<label htmlFor={`affirmation-${num}`} className="sr-only">
							Positive affirmation {num}
						</label>
						<input
							id={`affirmation-${num}`}
							type="text"
							className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
							style={{
								borderColor: "#E2E8F0",
								focusRingColor: "#2D5F3F",
							}}
							placeholder={`Win #${num}...`}
							value={formData.positiveAffirmations[num - 1] || ""}
							onChange={(e) => {
								const newAffirmations = [...formData.positiveAffirmations];
								newAffirmations[num - 1] = e.target.value;
								setFormData((prev) => ({
									...prev,
									positiveAffirmations: newAffirmations,
								}));
							}}
						/>
					</div>
				))}
			</fieldset>

			<fieldset className="mt-6">
				<legend
					className="text-sm font-medium mb-3"
					style={{ color: "#2D3748" }}
				>
					Any notes or reminders for yourself? (optional)
				</legend>
				<textarea
					className="w-full p-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
					style={{
						borderColor: "#E2E8F0",
						focusRingColor: "#2D5F3F",
					}}
					rows={3}
					placeholder="Add any notes or reminders..."
					value={formData.notes}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, notes: e.target.value }))
					}
					aria-label="Additional notes or reminders"
				/>
			</fieldset>
		</section>
	);

	const renderReviewStep = () => (
		<section aria-labelledby="review-heading">
			<h3
				id="review-heading"
				className="text-xl font-bold mb-6"
				style={{ color: "#2D3748" }}
			>
				Review Your Pre-Assignment Prep
			</h3>

			<div className="space-y-4">
				{/* Assignment Details */}
				<div className="p-4 rounded-lg" style={{ backgroundColor: "#F7FAFC" }}>
					<div className="flex justify-between items-start mb-2">
						<h4 className="font-medium" style={{ color: "#2D3748" }}>
							Assignment Details
						</h4>
						<button
							onClick={() => handleStepJump(1)}
							className="p-1 hover:bg-gray-200 rounded transition-all"
							aria-label="Edit assignment details"
						>
							<Edit2 className="h-4 w-4" style={{ color: "#2D5F3F" }} />
						</button>
					</div>
					<ul className="space-y-1 text-sm" style={{ color: "#4A5568" }}>
						<li>
							Type:{" "}
							<strong>{formData.assignmentType || "Not specified"}</strong>
						</li>
						<li>
							Duration: <strong>{formData.duration || "Not specified"}</strong>
						</li>
					</ul>
				</div>

				{/* Emotional State */}
				<div className="p-4 rounded-lg" style={{ backgroundColor: "#F7FAFC" }}>
					<div className="flex justify-between items-start mb-2">
						<h4 className="font-medium" style={{ color: "#2D3748" }}>
							Emotional Check
						</h4>
						<button
							onClick={() => handleStepJump(2)}
							className="p-1 hover:bg-gray-200 rounded transition-all"
							aria-label="Edit emotional state"
						>
							<Edit2 className="h-4 w-4" style={{ color: "#2D5F3F" }} />
						</button>
					</div>
					<p className="text-sm" style={{ color: "#4A5568" }}>
						Feeling:{" "}
						<strong>{formData.emotionalState || "Not specified"}</strong>
					</p>
				</div>

				{/* Physical Readiness */}
				<div className="p-4 rounded-lg" style={{ backgroundColor: "#F7FAFC" }}>
					<div className="flex justify-between items-start mb-2">
						<h4 className="font-medium" style={{ color: "#2D3748" }}>
							Physical Readiness
						</h4>
						<button
							onClick={() => handleStepJump(3)}
							className="p-1 hover:bg-gray-200 rounded transition-all"
							aria-label="Edit physical readiness"
						>
							<Edit2 className="h-4 w-4" style={{ color: "#2D5F3F" }} />
						</button>
					</div>
					<p className="text-sm" style={{ color: "#4A5568" }}>
						State:{" "}
						<strong>{formData.physicalReadiness || "Not specified"}</strong>
					</p>
				</div>

				{/* Knowledge Gaps */}
				{formData.knowledgeGaps.length > 0 && (
					<div
						className="p-4 rounded-lg"
						style={{ backgroundColor: "#F7FAFC" }}
					>
						<div className="flex justify-between items-start mb-2">
							<h4 className="font-medium" style={{ color: "#2D3748" }}>
								Knowledge Areas to Review
							</h4>
							<button
								onClick={() => handleStepJump(4)}
								className="p-1 hover:bg-gray-200 rounded transition-all"
								aria-label="Edit knowledge gaps"
							>
								<Edit2 className="h-4 w-4" style={{ color: "#2D5F3F" }} />
							</button>
						</div>
						<ul
							className="list-disc list-inside text-sm"
							style={{ color: "#4A5568" }}
						>
							{formData.knowledgeGaps.map((gap, index) => (
								<li key={index}>{gap}</li>
							))}
						</ul>
					</div>
				)}

				{/* Self-Care Plan */}
				{formData.selfCarePost.length > 0 && (
					<div
						className="p-4 rounded-lg"
						style={{ backgroundColor: "#F7FAFC" }}
					>
						<div className="flex justify-between items-start mb-2">
							<h4 className="font-medium" style={{ color: "#2D3748" }}>
								Post-Assignment Self-Care
							</h4>
							<button
								onClick={() => handleStepJump(6)}
								className="p-1 hover:bg-gray-200 rounded transition-all"
								aria-label="Edit self-care plan"
							>
								<Edit2 className="h-4 w-4" style={{ color: "#2D5F3F" }} />
							</button>
						</div>
						<ul
							className="list-disc list-inside text-sm"
							style={{ color: "#4A5568" }}
						>
							{formData.selfCarePost.map((item, index) => (
								<li key={index}>{item}</li>
							))}
						</ul>
					</div>
				)}
			</div>

			{/* Personalized Checklist */}
			<div
				className="mt-6 p-6 rounded-xl"
				style={{
					backgroundColor: "#F0F5ED",
					border: "2px solid #7A9B6E",
				}}
			>
				<h4
					className="text-lg font-bold mb-4 flex items-center gap-2"
					style={{ color: "#2D5F3F" }}
				>
					<CheckCircle className="h-5 w-5" />
					Your Personalized Checklist
				</h4>

				<ul className="space-y-2 mb-4">
					{formData.assignmentType && (
						<li className="flex items-start gap-2">
							<Check className="h-4 w-4 mt-0.5" style={{ color: "#2D5F3F" }} />
							<span className="text-sm" style={{ color: "#2D3748" }}>
								Prepared for {formData.assignmentType} assignment
							</span>
						</li>
					)}
					{formData.emotionalState && (
						<li className="flex items-start gap-2">
							<Check className="h-4 w-4 mt-0.5" style={{ color: "#2D5F3F" }} />
							<span className="text-sm" style={{ color: "#2D3748" }}>
								Emotional state acknowledged
							</span>
						</li>
					)}
					{formData.selfCarePost.length > 0 && (
						<li className="flex items-start gap-2">
							<Check className="h-4 w-4 mt-0.5" style={{ color: "#2D5F3F" }} />
							<span className="text-sm" style={{ color: "#2D3748" }}>
								Self-care plan in place
							</span>
						</li>
					)}
					{formData.supportContacts.length > 0 && (
						<li className="flex items-start gap-2">
							<Check className="h-4 w-4 mt-0.5" style={{ color: "#2D5F3F" }} />
							<span className="text-sm" style={{ color: "#2D3748" }}>
								Support contacts identified
							</span>
						</li>
					)}
				</ul>

				<div className="flex gap-3">
					<button
						onClick={handleDownloadChecklist}
						className="flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
						style={{
							backgroundColor: "#FFFFFF",
							color: "#2D5F3F",
							border: "1px solid #7A9B6E",
						}}
						aria-label="Download checklist"
					>
						<Download className="h-4 w-4" />
						Download
					</button>
					<button
						onClick={handleEmailChecklist}
						className="flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
						style={{
							backgroundColor: "#FFFFFF",
							color: "#2D5F3F",
							border: "1px solid #7A9B6E",
						}}
						aria-label="Email checklist to myself"
					>
						<Mail className="h-4 w-4" />
						Email
					</button>
				</div>
			</div>
		</section>
	);

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
				<form
					aria-labelledby="prep-form-heading"
					className="p-6"
					onSubmit={(e) => {
						e.preventDefault();
						handleComplete();
					}}
				>
					{/* Header */}
					<ModalNavigationHeader
						title="Pre-Assignment Preparation"
						subtitle="Prepare mentally and emotionally for your upcoming assignment"
						onClose={onClose}
						showAutoSave={isSaving}
					/>

					{/* Progress Indicator */}
					{renderProgressIndicator()}

					{/* Step Content */}
					<div className="mb-6">{renderStepContent()}</div>

					{/* Navigation Buttons */}
					<div className="flex justify-between items-center">
						<button
							type="button"
							onClick={handlePrevious}
							disabled={currentStep === 1}
							className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50"
							style={{
								backgroundColor: "#F7FAFC",
								color: "#4A5568",
							}}
							aria-label="Go to previous step"
						>
							<ChevronLeft className="h-5 w-5" />
							Previous
						</button>

						{currentStep < steps.length ? (
							<button
								type="button"
								onClick={handleNext}
								className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 text-white transition-all"
								style={{ backgroundColor: "#2D5F3F" }}
								aria-label="Go to next step"
							>
								Next
								<ChevronRight className="h-5 w-5" />
							</button>
						) : (
							<button
								type="submit"
								className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 text-white transition-all"
								style={{ backgroundColor: "#2D5F3F" }}
								aria-label="Complete preparation"
							>
								<CheckCircle className="h-5 w-5" />
								Complete Prep
							</button>
						)}
					</div>
				</form>
			</div>
		</div>
	);
};

export default PreAssignmentPrepAccessible;
