import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, X } from "lucide-react";
import type React from "react";
import { useEffect, useState, useRef } from "react";

import { useAuth } from "../contexts/AuthContext";
import { reflectionService } from "../services/reflectionService";

import {
	CommunityIcon,
	HeartPulseIcon,
	NotepadIcon,
	SecureLockIcon,
	TargetIcon,
} from "./CustomIcon";

interface MentoringPrepData {
	// Opening Context
	mentoringContext: string;
	participants: string;
	background: string;
	materials: string;

	// Readiness Assessment
	emotionalReadiness: number;
	physicalReadiness: number;
	anticipatedDemands: {
		environmental: string;
		interpersonal: string;
		paralinguistic: string;
		intrapersonal: string;
	};

	// Control & Contingency Planning
	controlStrategies: {
		environmental: string;
		interpersonal: string;
		paralinguistic: string;
		intrapersonal: string;
	};
	backupPlans: string;

	// Role-Space Awareness
	professionalRole: string;
	boundaries: string;
	roleManagement: string;

	// Mental Preparation & Self-Care
	focusTechniques: string[];
	groundingPractices: string;
	triggers: string;
	triggerManagement: string;

	// Ethics & Cultural Awareness
	ethicalConsiderations: string;
	culturalContext: string;
	ethicalBoundaries: string;

	// Closing Commitment
	growthGoals: string;
	intentionStatement: string;
	confidenceLevel: number;
	currentFeeling: string;

	timestamp: string;
}

interface MentoringPrepProps {
	onComplete?: (data: MentoringPrepData) => void;
	onClose?: () => void;
}

const steps = [
	{ id: 1, title: "Opening Context", icon: BookOpen },
	{ id: 2, title: "Readiness Assessment", icon: HeartPulseIcon },
	{ id: 3, title: "Control & Planning", icon: SecureLockIcon },
	{ id: 4, title: "Role-Space Awareness", icon: CommunityIcon },
	{ id: 5, title: "Mental Preparation", icon: NotepadIcon },
	{ id: 6, title: "Ethics & Culture", icon: TargetIcon },
	{ id: 7, title: "Closing Commitment", icon: CheckCircle },
];

const MentoringPrepAccessible: React.FC<MentoringPrepProps> = ({
	onComplete,
	onClose,
}) => {
	const { user } = useAuth();
	const [currentStep, setCurrentStep] = useState(1);
	const [isSaving, setIsSaving] = useState(false);
	const startTime = Date.now();
	const modalRef = useRef<HTMLDivElement>(null);

	// Scroll to top on mount
	useEffect(() => {
		modalRef.current?.scrollTo({ top: 0, behavior: "instant" });
	}, []);

	const [formData, setFormData] = useState<MentoringPrepData>({
		mentoringContext: "",
		participants: "",
		background: "",
		materials: "",
		emotionalReadiness: 5,
		physicalReadiness: 5,
		anticipatedDemands: {
			environmental: "",
			interpersonal: "",
			paralinguistic: "",
			intrapersonal: "",
		},
		controlStrategies: {
			environmental: "",
			interpersonal: "",
			paralinguistic: "",
			intrapersonal: "",
		},
		backupPlans: "",
		professionalRole: "",
		boundaries: "",
		roleManagement: "",
		focusTechniques: [],
		groundingPractices: "",
		triggers: "",
		triggerManagement: "",
		ethicalConsiderations: "",
		culturalContext: "",
		ethicalBoundaries: "",
		growthGoals: "",
		intentionStatement: "",
		confidenceLevel: 5,
		currentFeeling: "",
		timestamp: new Date().toISOString(),
	});

	// Auto-save draft
	useEffect(() => {
		const draftKey = "mentoringPrepDraft";
		localStorage.setItem(draftKey, JSON.stringify(formData));
		localStorage.setItem("mentoringPrepStep", currentStep.toString());
	}, [formData, currentStep]);

	// Load draft on mount
	useEffect(() => {
		const draftKey = "mentoringPrepDraft";
		const saved = localStorage.getItem(draftKey);
		if (saved) {
			try {
				setFormData(JSON.parse(saved));
			} catch (e) {
				console.warn("Could not load mentoring prep draft");
			}
		}

		const savedStep = localStorage.getItem("mentoringPrepStep");
		if (savedStep) {
			setCurrentStep(parseInt(savedStep));
		}
	}, []);

	const handleInputChange = (field: string, value: any) => {
		if (field.includes(".")) {
			const [parent, child] = field.split(".");
			setFormData((prev) => ({
				...prev,
				[parent]: {
					...(prev as any)[parent],
					[child]: value,
				},
			}));
		} else {
			setFormData((prev) => ({ ...prev, [field]: value }));
		}
	};

	const handleNext = () => {
		if (currentStep < steps.length) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleComplete = async () => {
		if (!user) {
			alert("You must be logged in to save your preparation");
			return;
		}

		if (isSaving) {
			console.log(
				"MentoringPrepAccessible - Already saving, ignoring duplicate click",
			);
			return;
		}

		console.log("MentoringPrepAccessible - handleComplete called");
		console.log("MentoringPrepAccessible - User:", {
			id: user.id,
			email: user.email,
		});

		setIsSaving(true);
		try {
			const timeSpent = Math.floor((Date.now() - startTime) / 1000);
			console.log("MentoringPrepAccessible - Starting save...");

			// Prepare data to save
			const dataToSave = {
				...formData,
				timestamp: new Date().toISOString(),
				time_spent_seconds: timeSpent,
				// Add field for getDisplayName fallback
				mentoring_goals:
					formData.goals ||
					formData.specific_ask ||
					"Mentoring preparation completed",
			};

			console.log("MentoringPrepAccessible - Saving with reflectionService");

			const result = await reflectionService.saveReflection(
				user.id,
				"mentoring_prep",
				dataToSave,
			);

			if (!result.success) {
				console.error("MentoringPrepAccessible - Error saving:", result.error);
				throw new Error(result.error || "Failed to save reflection");
			} else {
				console.log("MentoringPrepAccessible - Saved successfully");
			}

			// Clear draft
			localStorage.removeItem("mentoringPrepDraft");
			localStorage.removeItem("mentoringPrepStep");

			// Set saving to false immediately after successful save
			setIsSaving(false);

			// Log successful save for parent component
			console.log("Mentoring Prep Results:", dataToSave);

			// Close after successful save
			if (onComplete) {
				onComplete(dataToSave);
			}
			setTimeout(() => {
				onClose();
			}, 100);
		} catch (error) {
			console.error(
				"MentoringPrepAccessible - Error in handleComplete:",
				error,
			);
			setIsSaving(false);
			alert(
				error instanceof Error ? error.message : "Failed to save preparation",
			);
		}
	};

	const handleDownloadSummary = () => {
		const summary = generateSummaryText();
		const blob = new Blob([summary], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `mentoring-prep-${new Date().toISOString().split("T")[0]}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleEmailSummary = () => {
		const summary = generateSummaryText();
		const subject = "Mentoring Preparation Summary";
		const body = encodeURIComponent(summary);
		window.open(`mailto:?subject=${subject}&body=${body}`);
	};

	const generateSummaryText = () => {
		return `MENTORING PREPARATION SUMMARY
Generated: ${new Date().toLocaleDateString()}

OPENING CONTEXT
Mentoring Context: ${formData.mentoringContext || "Not provided"}
Participants: ${formData.participants || "Not provided"}
Background: ${formData.background || "Not provided"}
Materials: ${formData.materials || "Not provided"}

READINESS ASSESSMENT
Emotional Readiness: ${formData.emotionalReadiness}/10
Physical Readiness: ${formData.physicalReadiness}/10

Anticipated Demands:
- Environmental: ${formData.anticipatedDemands.environmental || "Not provided"}
- Interpersonal: ${formData.anticipatedDemands.interpersonal || "Not provided"}
- Paralinguistic: ${formData.anticipatedDemands.paralinguistic || "Not provided"}
- Intrapersonal: ${formData.anticipatedDemands.intrapersonal || "Not provided"}

CONTROL & CONTINGENCY PLANNING
Control Strategies:
- Environmental: ${formData.controlStrategies.environmental || "Not provided"}
- Interpersonal: ${formData.controlStrategies.interpersonal || "Not provided"}
- Paralinguistic: ${formData.controlStrategies.paralinguistic || "Not provided"}
- Intrapersonal: ${formData.controlStrategies.intrapersonal || "Not provided"}

Backup Plans: ${formData.backupPlans || "Not provided"}

ROLE-SPACE AWARENESS
Professional Role: ${formData.professionalRole || "Not provided"}
Boundaries: ${formData.boundaries || "Not provided"}
Role Management: ${formData.roleManagement || "Not provided"}

MENTAL PREPARATION & SELF-CARE
Focus Techniques: ${formData.focusTechniques.join(", ") || "Not provided"}
Grounding Practices: ${formData.groundingPractices || "Not provided"}
Triggers: ${formData.triggers || "Not provided"}
Trigger Management: ${formData.triggerManagement || "Not provided"}

ETHICS & CULTURAL AWARENESS
Ethical Considerations: ${formData.ethicalConsiderations || "Not provided"}
Cultural Context: ${formData.culturalContext || "Not provided"}
Ethical Boundaries: ${formData.ethicalBoundaries || "Not provided"}

CLOSING COMMITMENT
Growth Goals: ${formData.growthGoals || "Not provided"}
Intention Statement: ${formData.intentionStatement || "Not provided"}
Confidence Level: ${formData.confidenceLevel}/10
Current Feeling: ${formData.currentFeeling || "Not provided"}
`;
	};

	const renderProgressIndicator = () => (
		<div className="mb-8">
			<div className="flex items-center gap-3 mb-4">
				<CommunityIcon size={64} />
				<div>
					<h2 className="text-2xl font-bold text-gray-800">
						Mentoring Preparation
					</h2>
					<p className="text-sm text-gray-600">
						Thoughtful preparation for mentoring success
					</p>
				</div>
			</div>

			<div className="flex items-center justify-between mb-2">
				{steps.map((step) => {
					const isCompleted = step.id < currentStep;
					const isCurrent = step.id === currentStep;

					return (
						<div
							key={step.id}
							className={`flex-1 h-2 mx-1 rounded-full transition-all ${
								isCompleted || isCurrent ? "" : "bg-gray-200"
							}`}
							style={{
								background:
									isCompleted || isCurrent
										? "linear-gradient(135deg, #2D5F3F, #5B9378)"
										: undefined,
							}}
						/>
					);
				})}
			</div>

			<div className="text-right">
				<span className="text-sm text-gray-500">
					{currentStep} of {steps.length}
				</span>
			</div>
		</div>
	);

	const renderOpeningContext = () => (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-gray-800 mb-4">Opening Context</h3>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					Describe the mentoring context
				</label>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={4}
					placeholder="What is the purpose and context of this mentoring session?"
					value={formData.mentoringContext}
					onChange={(e) =>
						handleInputChange("mentoringContext", e.target.value)
					}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					Who are the participants?
				</label>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={3}
					placeholder="Describe who will be involved in this mentoring session"
					value={formData.participants}
					onChange={(e) => handleInputChange("participants", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					Relevant background information
				</label>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={4}
					placeholder="Any background information that would be helpful for this session"
					value={formData.background}
					onChange={(e) => handleInputChange("background", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					Materials to review
				</label>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={3}
					placeholder="List any materials or resources to review before the session"
					value={formData.materials}
					onChange={(e) => handleInputChange("materials", e.target.value)}
				/>
			</div>
		</div>
	);

	const renderReadinessAssessment = () => (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-gray-800 mb-4">
				Readiness Assessment
			</h3>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-4">
					Emotional Readiness (1-10)
				</label>
				<div className="flex items-center gap-4">
					<span className="text-sm text-gray-500">Not Ready</span>
					<input
						type="range"
						min="1"
						max="10"
						value={formData.emotionalReadiness}
						onChange={(e) =>
							handleInputChange("emotionalReadiness", parseInt(e.target.value))
						}
						className="flex-1"
						style={{
							accentColor: "#5B9378",
						}}
					/>
					<span className="text-sm text-gray-500">Fully Ready</span>
					<span className="ml-4 font-bold text-green-700">
						{formData.emotionalReadiness}
					</span>
				</div>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-4">
					Physical Readiness (1-10)
				</label>
				<div className="flex items-center gap-4">
					<span className="text-sm text-gray-500">Not Ready</span>
					<input
						type="range"
						min="1"
						max="10"
						value={formData.physicalReadiness}
						onChange={(e) =>
							handleInputChange("physicalReadiness", parseInt(e.target.value))
						}
						className="flex-1"
						style={{
							accentColor: "#5B9378",
						}}
					/>
					<span className="text-sm text-gray-500">Fully Ready</span>
					<span className="ml-4 font-bold text-green-700">
						{formData.physicalReadiness}
					</span>
				</div>
			</div>

			<div>
				<h4 className="text-lg font-semibold text-gray-700 mb-3">
					Anticipated Demands
				</h4>

				<div className="space-y-4">
					<div>
						<label className="block font-medium text-gray-600 mb-2">
							Environmental Demands
						</label>
						<textarea
							className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
							rows={2}
							placeholder="Physical setting, technology, logistics..."
							value={formData.anticipatedDemands.environmental}
							onChange={(e) =>
								handleInputChange(
									"anticipatedDemands.environmental",
									e.target.value,
								)
							}
						/>
					</div>

					<div>
						<label className="block font-medium text-gray-600 mb-2">
							Interpersonal Demands
						</label>
						<textarea
							className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
							rows={2}
							placeholder="Relationship dynamics, communication styles..."
							value={formData.anticipatedDemands.interpersonal}
							onChange={(e) =>
								handleInputChange(
									"anticipatedDemands.interpersonal",
									e.target.value,
								)
							}
						/>
					</div>

					<div>
						<label className="block font-medium text-gray-600 mb-2">
							Paralinguistic Demands
						</label>
						<textarea
							className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
							rows={2}
							placeholder="Tone, pace, non-verbal communication..."
							value={formData.anticipatedDemands.paralinguistic}
							onChange={(e) =>
								handleInputChange(
									"anticipatedDemands.paralinguistic",
									e.target.value,
								)
							}
						/>
					</div>

					<div>
						<label className="block font-medium text-gray-600 mb-2">
							Intrapersonal Demands
						</label>
						<textarea
							className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
							rows={2}
							placeholder="Personal challenges, emotional regulation..."
							value={formData.anticipatedDemands.intrapersonal}
							onChange={(e) =>
								handleInputChange(
									"anticipatedDemands.intrapersonal",
									e.target.value,
								)
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);

	const renderControlPlanning = () => (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-gray-800 mb-4">
				Control & Contingency Planning
			</h3>

			<div>
				<h4 className="text-lg font-semibold text-gray-700 mb-3">
					Control Strategies for Each Demand Type
				</h4>

				<div className="space-y-4">
					<div>
						<label className="block font-medium text-gray-600 mb-2">
							Environmental Control Strategies
						</label>
						<textarea
							className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
							rows={2}
							placeholder="How will you manage environmental challenges?"
							value={formData.controlStrategies.environmental}
							onChange={(e) =>
								handleInputChange(
									"controlStrategies.environmental",
									e.target.value,
								)
							}
						/>
					</div>

					<div>
						<label className="block font-medium text-gray-600 mb-2">
							Interpersonal Control Strategies
						</label>
						<textarea
							className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
							rows={2}
							placeholder="How will you manage interpersonal dynamics?"
							value={formData.controlStrategies.interpersonal}
							onChange={(e) =>
								handleInputChange(
									"controlStrategies.interpersonal",
									e.target.value,
								)
							}
						/>
					</div>

					<div>
						<label className="block font-medium text-gray-600 mb-2">
							Paralinguistic Control Strategies
						</label>
						<textarea
							className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
							rows={2}
							placeholder="How will you manage communication challenges?"
							value={formData.controlStrategies.paralinguistic}
							onChange={(e) =>
								handleInputChange(
									"controlStrategies.paralinguistic",
									e.target.value,
								)
							}
						/>
					</div>

					<div>
						<label className="block font-medium text-gray-600 mb-2">
							Intrapersonal Control Strategies
						</label>
						<textarea
							className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
							rows={2}
							placeholder="How will you manage personal challenges?"
							value={formData.controlStrategies.intrapersonal}
							onChange={(e) =>
								handleInputChange(
									"controlStrategies.intrapersonal",
									e.target.value,
								)
							}
						/>
					</div>
				</div>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					Backup/Contingency Plans
				</label>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={4}
					placeholder="What are your backup plans if things don't go as expected?"
					value={formData.backupPlans}
					onChange={(e) => handleInputChange("backupPlans", e.target.value)}
				/>
			</div>
		</div>
	);

	const renderRoleAwareness = () => (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-gray-800 mb-4">
				Role-Space Awareness
			</h3>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					How will you manage your professional role?
				</label>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={4}
					placeholder="Describe your professional role in this mentoring context"
					value={formData.professionalRole}
					onChange={(e) =>
						handleInputChange("professionalRole", e.target.value)
					}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					What boundaries will you maintain?
				</label>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={4}
					placeholder="Describe the professional boundaries you'll maintain"
					value={formData.boundaries}
					onChange={(e) => handleInputChange("boundaries", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					Role management strategies
				</label>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={4}
					placeholder="How will you navigate role challenges or conflicts?"
					value={formData.roleManagement}
					onChange={(e) => handleInputChange("roleManagement", e.target.value)}
				/>
			</div>
		</div>
	);

	const renderMentalPreparation = () => (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-gray-800 mb-4">
				Mental Preparation & Self-Care
			</h3>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-3">
					Select focus/grounding techniques
				</label>
				<div className="space-y-2">
					{[
						"Mindfulness",
						"Breathing exercises",
						"Visualization",
						"Progressive relaxation",
						"Affirmations",
						"Physical movement",
					].map((technique) => (
						<label
							key={technique}
							className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
						>
							<input
								type="checkbox"
								checked={formData.focusTechniques.includes(technique)}
								onChange={(e) => {
									if (e.target.checked) {
										handleInputChange("focusTechniques", [
											...formData.focusTechniques,
											technique,
										]);
									} else {
										handleInputChange(
											"focusTechniques",
											formData.focusTechniques.filter((t) => t !== technique),
										);
									}
								}}
								className="rounded border-gray-300 focus:ring-green-600 focus:ring-1"
								style={{
									width: "14px",
									height: "14px",
									accentColor: "#5B9378",
									transform: "scale(0.8)",
									transformOrigin: "center",
								}}
							/>
							<span className="text-gray-700">{technique}</span>
						</label>
					))}
				</div>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					Grounding practices
				</label>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={3}
					placeholder="Describe your grounding practices for this session"
					value={formData.groundingPractices}
					onChange={(e) =>
						handleInputChange("groundingPractices", e.target.value)
					}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					Potential triggers or vulnerabilities
				</label>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={3}
					placeholder="What might be challenging for you in this session?"
					value={formData.triggers}
					onChange={(e) => handleInputChange("triggers", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					Management plan for triggers
				</label>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={3}
					placeholder="How will you manage these triggers if they arise?"
					value={formData.triggerManagement}
					onChange={(e) =>
						handleInputChange("triggerManagement", e.target.value)
					}
				/>
			</div>
		</div>
	);

	const renderEthicsCultural = () => (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-gray-800 mb-4">
				Ethics & Cultural Awareness
			</h3>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					Anticipated ethical considerations
				</label>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={4}
					placeholder="What ethical considerations might arise in this session?"
					value={formData.ethicalConsiderations}
					onChange={(e) =>
						handleInputChange("ethicalConsiderations", e.target.value)
					}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					Cultural context and sensitivity
				</label>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={4}
					placeholder="What cultural factors should you be aware of?"
					value={formData.culturalContext}
					onChange={(e) => handleInputChange("culturalContext", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					Ethical boundaries
				</label>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={4}
					placeholder="What ethical boundaries will you maintain?"
					value={formData.ethicalBoundaries}
					onChange={(e) =>
						handleInputChange("ethicalBoundaries", e.target.value)
					}
				/>
			</div>
		</div>
	);

	const renderClosingCommitment = () => (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-gray-800 mb-4">
				Closing Commitment
			</h3>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					What goals do you have for this mentoring session?
				</label>
				<textarea
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none resize-none"
					rows={4}
					placeholder="List your growth goals and objectives"
					value={formData.growthGoals}
					onChange={(e) => handleInputChange("growthGoals", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					Craft a one-sentence intention for this session
				</label>
				<input
					type="text"
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
					placeholder="I intend to..."
					value={formData.intentionStatement}
					onChange={(e) =>
						handleInputChange("intentionStatement", e.target.value)
					}
				/>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-4">
					Rate your confidence level (1-10)
				</label>
				<div className="flex items-center gap-4">
					<span className="text-sm text-gray-500">Low</span>
					<input
						type="range"
						min="1"
						max="10"
						value={formData.confidenceLevel}
						onChange={(e) =>
							handleInputChange("confidenceLevel", parseInt(e.target.value))
						}
						className="flex-1"
						style={{
							accentColor: "#5B9378",
						}}
					/>
					<span className="text-sm text-gray-500">High</span>
					<span className="ml-4 font-bold text-green-700">
						{formData.confidenceLevel}
					</span>
				</div>
			</div>

			<div>
				<label className="block text-lg font-semibold text-gray-700 mb-2">
					Describe your current feeling in one word
				</label>
				<input
					type="text"
					className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
					placeholder="e.g., excited, nervous, curious, prepared..."
					value={formData.currentFeeling}
					onChange={(e) => handleInputChange("currentFeeling", e.target.value)}
				/>
			</div>
		</div>
	);

	const renderCurrentStep = () => {
		switch (currentStep) {
			case 1:
				return renderOpeningContext();
			case 2:
				return renderReadinessAssessment();
			case 3:
				return renderControlPlanning();
			case 4:
				return renderRoleAwareness();
			case 5:
				return renderMentalPreparation();
			case 6:
				return renderEthicsCultural();
			case 7:
				return renderClosingCommitment();
			default:
				return renderOpeningContext();
		}
	};

	const renderNavigationButtons = () => (
		<div className="flex justify-between gap-4 mt-8">
			<button
				onClick={handlePrevious}
				disabled={currentStep === 1}
				className="flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				style={{
					backgroundColor: currentStep === 1 ? "#e5e7eb" : "#ffffff",
					color: currentStep === 1 ? "#9ca3af" : "#2D5F3F",
					border: `2px solid ${currentStep === 1 ? "#e5e7eb" : "#2D5F3F"}`,
				}}
			>
				<ArrowLeft className="h-4 w-4" />
				Back
			</button>

			{currentStep < steps.length ? (
				<button
					onClick={handleNext}
					className="flex items-center gap-2 px-6 py-3 font-semibold rounded-lg text-white transition-all hover:opacity-90"
					style={{
						background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
					}}
				>
					Next
					<ArrowRight className="h-4 w-4" />
				</button>
			) : (
				<button
					onClick={handleComplete}
					disabled={isSaving}
					className="flex items-center gap-2 px-6 py-4 font-semibold rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
					style={{
						background: isSaving
							? "linear-gradient(135deg, #9ca3af, #6b7280)"
							: "linear-gradient(135deg, #2D5F3F, #5B9378)",
					}}
				>
					<CheckCircle className="h-5 w-5" />
					{isSaving ? "Saving..." : "Complete Preparation"}
				</button>
			)}
		</div>
	);

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
			<div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
				<div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 z-10">
					{renderProgressIndicator()}

					{onClose && (
						<button
							onClick={onClose}
							className="absolute top-4 right-4 p-2 rounded-lg text-white transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
							style={{
								background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
								focusRingColor: "#2D5F3F",
							}}
							aria-label="Close mentoring preparation"
						>
							<X className="h-5 w-5" />
						</button>
					)}
				</div>

				<main className="px-8 py-6">
					<form onSubmit={(e) => e.preventDefault()}>
						{renderCurrentStep()}
						{renderNavigationButtons()}
					</form>
				</main>
			</div>
		</div>
	);
};

export default MentoringPrepAccessible;
