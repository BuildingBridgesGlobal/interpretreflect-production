import {
	Activity,
	ArrowLeft,
	ArrowRight,
	CheckCircle,
	FileText,
	Lightbulb,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import {
	directInsertReflection,
	getSessionToken,
} from "../services/directSupabaseApi";

import {
	HeartPulseIcon,
	SecureLockIcon,
	TargetIcon,
} from "./CustomIcon";

// Removed ModalNavigationHeader - using inline header instead

interface PostAssignmentDebriefData {
	// Assignment Review
	assignmentContext: string;
	challenges: string;

	// Performance Assessment
	overallSatisfaction: number;
	technicalAccuracy: number;
	proudestMoment: string;
	challengesHandled: {
		environmental: string;
		interpersonal: string;
		paralinguistic: string;
		intrapersonal: string;
	};

	// Adaptations & Growth
	adaptationsMade: {
		environmental: string;
		interpersonal: string;
		paralinguistic: string;
		intrapersonal: string;
	};
	skillsStrengthened: string;

	// Learning Capture
	lessonsLearned: string;
	knowledgeGained: string;
	futureApplications: string;

	// Emotional Processing
	emotionalJourney: string;
	emotionalHighs: string;
	emotionalChallenges: string;
	emotionalSupport: string;

	// Physical & Self-Care
	physicalImpact: string;
	selfCareActions: string[];
	recoveryPlan: string;
	boundaries: string;

	// Integration & Celebration
	growthAchieved: string;
	celebrationPlan: string;
	gratitude: string;
	nextSteps: string;
	confidenceLevel: number;
	currentFeeling: string;

	timestamp: string;
}

interface PostAssignmentDebriefProps {
	onComplete?: (data: PostAssignmentDebriefData) => void;
	onClose?: () => void;
}

const steps = [
	{ id: 0, title: "Opening Context", icon: Lightbulb },
	{ id: 1, title: "Assignment Review", icon: FileText },
	{ id: 2, title: "Performance & Adaptations", icon: TargetIcon },
	{ id: 3, title: "Learning Capture", icon: Lightbulb },
	{ id: 4, title: "Emotional Processing", icon: HeartPulseIcon },
	{ id: 5, title: "Physical & Self-Care", icon: SecureLockIcon },
	{ id: 6, title: "Integration & Celebration", icon: CheckCircle },
];

export const PostAssignmentDebriefAccessible: React.FC<
	PostAssignmentDebriefProps
> = ({ onComplete, onClose }) => {
	const { user } = useAuth();
	const [currentStep, setCurrentStep] = useState(0);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [isSaving, setIsSaving] = useState(false);
	const [formData, setFormData] = useState<PostAssignmentDebriefData>({
		assignmentContext: "",
		challenges: "",
		overallSatisfaction: 5,
		technicalAccuracy: 5,
		proudestMoment: "",
		challengesHandled: {
			environmental: "",
			interpersonal: "",
			paralinguistic: "",
			intrapersonal: "",
		},
		adaptationsMade: {
			environmental: "",
			interpersonal: "",
			paralinguistic: "",
			intrapersonal: "",
		},
		skillsStrengthened: "",
		lessonsLearned: "",
		knowledgeGained: "",
		futureApplications: "",
		emotionalJourney: "",
		emotionalHighs: "",
		emotionalChallenges: "",
		emotionalSupport: "",
		physicalImpact: "",
		selfCareActions: [],
		recoveryPlan: "",
		boundaries: "",
		growthAchieved: "",
		celebrationPlan: "",
		gratitude: "",
		nextSteps: "",
		confidenceLevel: 5,
		currentFeeling: "",
		timestamp: new Date().toISOString(),
	});

	// Auto-save draft
	useEffect(() => {
		const draftKey = "postAssignmentDebriefDraft";
		localStorage.setItem(draftKey, JSON.stringify(formData));
		localStorage.setItem("postAssignmentDebriefStep", currentStep.toString());
	}, [formData, currentStep]);

	// Load draft on mount
	useEffect(() => {
		console.log("PostAssignmentDebriefAccessible - Component mounted");
		const draftKey = "postAssignmentDebriefDraft";
		const saved = localStorage.getItem(draftKey);
		if (saved) {
			try {
				const parsedData = JSON.parse(saved);
				// Clean up any errant single characters in all text fields
				const textFields = [
					"proudestMoment",
					"emotionalSupport",
					"assignmentContext",
					"challenges",
					"skillsStrengthened",
					"lessonsLearned",
					"knowledgeGained",
					"futureApplications",
					"emotionalJourney",
					"emotionalHighs",
					"emotionalChallenges",
					"physicalImpact",
					"recoveryPlan",
					"boundaries",
					"growthAchieved",
					"celebrationPlan",
					"gratitude",
					"nextSteps",
					"currentFeeling",
				];

				textFields.forEach((field) => {
					if (parsedData[field] && parsedData[field].length === 1) {
						parsedData[field] = ""; // Clear single character entries
					}
				});

				// Also clear single characters in nested challenge/adaptation objects
				["challengesHandled", "adaptationsMade"].forEach((obj) => {
					if (parsedData[obj]) {
						Object.keys(parsedData[obj]).forEach((key) => {
							if (parsedData[obj][key] && parsedData[obj][key].length === 1) {
								parsedData[obj][key] = "";
							}
						});
					}
				});

				setFormData(parsedData);
				console.log(
					"PostAssignmentDebriefAccessible - Loaded draft from localStorage",
				);
			} catch (e) {
				console.warn("Could not load post-assignment debrief draft");
			}
		}

		const savedStep = localStorage.getItem("postAssignmentDebriefStep");
		if (savedStep) {
			setCurrentStep(parseInt(savedStep));
			console.log(
				"PostAssignmentDebriefAccessible - Restored to step:",
				savedStep,
			);
		}
	}, []);

	const handleInputChange = (field: string, value: any) => {
		// Clear error for this field when user starts typing
		if (errors[field]) {
			const newErrors = { ...errors };
			delete newErrors[field];
			setErrors(newErrors);
		}

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

	const validateStep = (step: number): boolean => {
		const newErrors: { [key: string]: string } = {};
		console.log(`PostAssignmentDebriefAccessible - Validating step ${step}`);

		switch (step) {
			case 0: // Opening Context
				if (!formData.currentFeeling?.trim()) {
					newErrors.currentFeeling = "Please describe how you are feeling";
				}
				if (!formData.proudestMoment?.trim()) {
					newErrors.proudestMoment = "Please describe what stands out most";
				}
				if (!formData.emotionalSupport?.trim()) {
					newErrors.emotionalSupport =
						"Please describe what you need for well-being";
				}
				break;

			case 1: // Assignment Review
				if (!formData.assignmentContext?.trim()) {
					newErrors.assignmentContext =
						"Please describe the assignment context";
				}
				break;

			case 2: // Performance & Adaptations (Combined)
				if (!formData.proudestMoment?.trim()) {
					newErrors.proudestMoment = "Please describe your proudest moment";
				}
				if (!formData.skillsStrengthened?.trim()) {
					newErrors.skillsStrengthened = "Please describe skills strengthened";
				}
				break;

			case 3: // Learning Capture
				if (!formData.lessonsLearned?.trim()) {
					newErrors.lessonsLearned = "Please describe lessons learned";
				}
				break;

			case 4: // Emotional Processing
				if (!formData.emotionalJourney?.trim()) {
					newErrors.emotionalJourney = "Please describe your emotional journey";
				}
				break;

			case 5: // Physical & Self-Care
				// Make physicalImpact optional - only validate if other critical fields are missing
				// Physical impact may not always be significant enough to describe
				break;

			case 6: // Integration & Celebration
				if (!formData.growthAchieved?.trim()) {
					newErrors.growthAchieved = "Please describe growth achieved";
				}
				break;
		}

		if (Object.keys(newErrors).length > 0) {
			console.log(
				"PostAssignmentDebriefAccessible - Validation errors:",
				newErrors,
			);
			setErrors(newErrors);
			return false;
		}

		console.log("PostAssignmentDebriefAccessible - Validation passed");
		return true;
	};

	const handleNext = () => {
		console.log(
			`PostAssignmentDebriefAccessible - handleNext called, current step: ${currentStep}`,
		);
		if (validateStep(currentStep)) {
			if (currentStep < steps.length - 1) {
				setCurrentStep(currentStep + 1);
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleComplete = async () => {
		console.log("PostAssignmentDebriefAccessible - handleComplete called");

		// Validate final step
		if (!validateStep(currentStep)) {
			console.log("PostAssignmentDebriefAccessible - Final validation failed");
			return;
		}

		// Prevent double submission
		if (isSaving) {
			console.log(
				"PostAssignmentDebriefAccessible - Already saving, ignoring duplicate click",
			);
			return;
		}

		const completedData = {
			...formData,
			timestamp: new Date().toISOString(),
		};

		console.log(
			"PostAssignmentDebriefAccessible - Data to save:",
			completedData,
		);
		setIsSaving(true);

		// Save to database
		try {
			if (!user?.id) {
				console.error("PostAssignmentDebriefAccessible - No user found");
				setErrors({ save: "You must be logged in to save" });
				setIsSaving(false);
				return;
			}

			const accessToken = await getSessionToken();
			
			if (!accessToken) {
				console.error("PostAssignmentDebriefAccessible - No access token");
				setErrors({ save: "Authentication error. Please try logging in again." });
				setIsSaving(false);
				return;
			}

			console.log("PostAssignmentDebriefAccessible - User details:", {
				id: user?.id,
				email: user?.email,
			});

			const reflectionData = {
				user_id: user.id,
				entry_kind: "post_assignment_debrief",
				data: completedData,
				reflection_id: crypto.randomUUID(),
			};

			console.log(
				"PostAssignmentDebriefAccessible - Saving to database with data:",
				reflectionData,
			);
			const { data, error } = await directInsertReflection(
				reflectionData,
				accessToken,
			);

			if (error) {
				console.error("PostAssignmentDebriefAccessible - Error saving:", error);
				setErrors({ save: "Failed to save reflection. Please try again." });
				setIsSaving(false);
				return;
			} else {
				console.log(
					"PostAssignmentDebriefAccessible - Saved successfully:",
					data,
				);
			}
		} catch (error) {
			console.error(
				"PostAssignmentDebriefAccessible - Error saving to database:",
				error,
			);
			setErrors({ save: "An error occurred while saving. Please try again." });
			setIsSaving(false);
			return;
		}

		if (onComplete) {
			onComplete(completedData);
		}

		// Clear draft
		localStorage.removeItem("postAssignmentDebriefDraft");
		localStorage.removeItem("postAssignmentDebriefStep");

		console.log(
			"PostAssignmentDebriefAccessible - Save complete, closing modal",
		);

		// Close after a short delay to ensure save completes
		setTimeout(() => {
			if (onClose) {
				onClose();
			}
		}, 100);
	};

	const handleDownloadSummary = () => {
		const summary = generateSummaryText();
		const blob = new Blob([summary], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `post-assignment-debrief-${new Date().toISOString().split("T")[0]}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleEmailSummary = () => {
		const summary = generateSummaryText();
		const subject = "Post-Assignment Debrief Summary";
		const body = encodeURIComponent(summary);
		window.open(`mailto:?subject=${subject}&body=${body}`);
	};

	const generateSummaryText = () => {
		return `POST-ASSIGNMENT DEBRIEF SUMMARY
Generated: ${new Date().toLocaleDateString()}

ASSIGNMENT REVIEW
Context: ${formData.assignmentContext || "Not provided"}
Challenges: ${formData.challenges || "Not provided"}

PERFORMANCE ASSESSMENT
Overall Satisfaction: ${formData.overallSatisfaction}/10
Technical Accuracy: ${formData.technicalAccuracy}/10
Proudest Moment: ${formData.proudestMoment || "Not provided"}

Challenges Handled:
- Environmental: ${formData.challengesHandled.environmental || "Not provided"}
- Interpersonal: ${formData.challengesHandled.interpersonal || "Not provided"}
- Paralinguistic: ${formData.challengesHandled.paralinguistic || "Not provided"}
- Intrapersonal: ${formData.challengesHandled.intrapersonal || "Not provided"}

ADAPTATIONS & GROWTH
Adaptations Made:
- Environmental: ${formData.adaptationsMade.environmental || "Not provided"}
- Interpersonal: ${formData.adaptationsMade.interpersonal || "Not provided"}
- Paralinguistic: ${formData.adaptationsMade.paralinguistic || "Not provided"}
- Intrapersonal: ${formData.adaptationsMade.intrapersonal || "Not provided"}

Skills Strengthened: ${formData.skillsStrengthened || "Not provided"}

LEARNING CAPTURE
Lessons Learned: ${formData.lessonsLearned || "Not provided"}
Knowledge Gained: ${formData.knowledgeGained || "Not provided"}
Future Applications: ${formData.futureApplications || "Not provided"}

EMOTIONAL PROCESSING
Emotional Journey: ${formData.emotionalJourney || "Not provided"}
Emotional Highs: ${formData.emotionalHighs || "Not provided"}
Emotional Challenges: ${formData.emotionalChallenges || "Not provided"}
Emotional Support: ${formData.emotionalSupport || "Not provided"}

PHYSICAL & SELF-CARE
Physical Impact: ${formData.physicalImpact || "Not provided"}
Self-Care Actions: ${formData.selfCareActions.join(", ") || "Not provided"}
Recovery Plan: ${formData.recoveryPlan || "Not provided"}
Boundaries: ${formData.boundaries || "Not provided"}

INTEGRATION & CELEBRATION
Growth Achieved: ${formData.growthAchieved || "Not provided"}
Celebration Plan: ${formData.celebrationPlan || "Not provided"}
Gratitude: ${formData.gratitude || "Not provided"}
Next Steps: ${formData.nextSteps || "Not provided"}
Confidence Level: ${formData.confidenceLevel}/10
Current Feeling: ${formData.currentFeeling || "Not provided"}
`;
	};

	const renderProgressIndicator = () => (
		<div className="mb-8">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<Activity className="h-6 w-6" style={{ color: "#5C7F4F" }} />
					<h2 className="text-2xl font-bold text-gray-800">
						Post-Assignment Debrief
					</h2>
				</div>
				{onClose && (
					<button
						onClick={onClose}
						className="p-2 rounded-lg transition-colors text-white"
						style={{ background: "linear-gradient(135deg, #5C7F4F, #5B9378)" }}
						aria-label="Close"
					>
						<X className="w-5 h-5" />
					</button>
				)}
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
										? "linear-gradient(135deg, #5C7F4F, #5B9378)"
										: undefined,
							}}
						/>
					);
				})}
			</div>

			<div className="text-right">
				<span className="text-sm text-gray-500">
					{currentStep + 1} of {steps.length}
				</span>
			</div>
		</div>
	);

	const renderOpeningContext = () => (
		<div className="space-y-6">
			<div
				className="p-6 rounded-xl"
				style={{
					background:
						"linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)",
					border: "1px solid rgba(107, 139, 96, 0.2)",
				}}
			>
				<h3 className="text-lg font-semibold mb-4" style={{ color: "#5C7F4F" }}>
					Processing Your Experience
				</h3>
				<p className="mb-6" style={{ color: "#5A5A5A" }}>
					You've just completed an interpreting assignment. This debrief helps
					you process, reflect, and integrate your experience while it's still
					fresh. Taking time now supports your professional growth and maintains
					your well-being.
				</p>
			</div>

			<div>
				<label
					className="block text-sm font-medium mb-2"
					style={{ color: "#5C7F4F" }}
				>
					How are you feeling right now after completing this assignment?
				</label>
				<textarea
					placeholder="Take a moment to check in with yourself. What emotions are present?..."
					rows={4}
					className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
					style={{
						borderColor: errors.currentFeeling ? "#ef4444" : "#E8E5E0",
					}}
					value={formData.currentFeeling}
					onChange={(e) => handleInputChange("currentFeeling", e.target.value)}
				/>
				{errors.currentFeeling && (
					<p className="text-sm text-red-500 mt-1">{errors.currentFeeling}</p>
				)}
			</div>

			<div>
				<label
					className="block text-sm font-medium mb-2"
					style={{ color: "#5C7F4F" }}
				>
					What stands out most from this assignment? (First impression)
				</label>
				<textarea
					placeholder="What moment, interaction, or aspect is most vivid in your mind right now?..."
					rows={4}
					className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
					style={{
						borderColor: errors.proudestMoment ? "#ef4444" : "#E8E5E0",
					}}
					value={formData.proudestMoment}
					onChange={(e) => handleInputChange("proudestMoment", e.target.value)}
				/>
				{errors.proudestMoment && (
					<p className="text-sm text-red-500 mt-1">{errors.proudestMoment}</p>
				)}
			</div>

			<div>
				<label
					className="block text-sm font-medium mb-2"
					style={{ color: "#5C7F4F" }}
				>
					What do you need most right now for your well-being?
				</label>
				<textarea
					placeholder="Consider physical, emotional, mental, or spiritual needs..."
					rows={3}
					className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
					style={{
						borderColor: errors.emotionalSupport ? "#ef4444" : "#E8E5E0",
					}}
					value={formData.emotionalSupport}
					onChange={(e) =>
						handleInputChange("emotionalSupport", e.target.value)
					}
				/>
				{errors.emotionalSupport && (
					<p className="text-sm text-red-500 mt-1">{errors.emotionalSupport}</p>
				)}
			</div>
		</div>
	);

	const renderAssignmentReview = () => (
		<div className="space-y-6">
			<div>
				<label
					className="block text-sm font-medium mb-2"
					style={{ color: "#5C7F4F" }}
				>
					Describe the assignment context
				</label>
				<textarea
					className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
					rows={4}
					placeholder="What was the nature and purpose of this assignment?"
					style={{
						borderColor: errors.assignmentContext ? "#ef4444" : "#E8E5E0",
					}}
					value={formData.assignmentContext}
					onChange={(e) =>
						handleInputChange("assignmentContext", e.target.value)
					}
				/>
				{errors.assignmentContext && (
					<p className="text-sm text-red-500 mt-1">
						{errors.assignmentContext}
					</p>
				)}
			</div>

			<div>
				<label
					className="block text-sm font-medium mb-2"
					style={{ color: "#5C7F4F" }}
				>
					Initial challenges encountered
				</label>
				<textarea
					className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
					rows={4}
					placeholder="What challenges did you face during this assignment?"
					style={{
						borderColor: "#E8E5E0",
					}}
					value={formData.challenges}
					onChange={(e) => handleInputChange("challenges", e.target.value)}
				/>
			</div>
		</div>
	);

	const renderPerformanceAdaptations = () => (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-gray-800 mb-4">
				Performance & Adaptations
			</h3>

			<div>
				<label className="block text-sm font-medium mb-4">
					Overall Satisfaction (1-10)
				</label>
				<div className="flex items-center gap-4">
					<span className="text-sm text-gray-500">Low</span>
					<input
						type="range"
						min="1"
						max="10"
						value={formData.overallSatisfaction}
						onChange={(e) =>
							handleInputChange("overallSatisfaction", parseInt(e.target.value))
						}
						className="flex-1"
						style={{
							accentColor: "#5B9378",
							height: "2px",
							cursor: "pointer",
						}}
					/>
					<span className="text-sm text-gray-500">High</span>
					<span className="ml-4 font-bold text-green-700">
						{formData.overallSatisfaction}
					</span>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium mb-4">
					Technical Accuracy (1-10)
				</label>
				<div className="flex items-center gap-4">
					<span className="text-sm text-gray-500">Low</span>
					<input
						type="range"
						min="1"
						max="10"
						value={formData.technicalAccuracy}
						onChange={(e) =>
							handleInputChange("technicalAccuracy", parseInt(e.target.value))
						}
						className="flex-1"
						style={{
							accentColor: "#5B9378",
							height: "2px",
							cursor: "pointer",
						}}
					/>
					<span className="text-sm text-gray-500">High</span>
					<span className="ml-4 font-bold text-green-700">
						{formData.technicalAccuracy}
					</span>
				</div>
			</div>

			<div>
				<label
					className="block text-sm font-medium mb-2"
					style={{ color: "#5C7F4F" }}
				>
					What was your proudest moment?
				</label>
				<textarea
					className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none"
					style={{
						borderColor: errors.proudestMoment ? "#ef4444" : "#E8E5E0",
					}}
					rows={4}
					placeholder="Describe a moment when you felt particularly proud of your work"
					value={formData.proudestMoment}
					onChange={(e) => handleInputChange("proudestMoment", e.target.value)}
				/>
				{errors.proudestMoment && (
					<p className="text-sm text-red-500 mt-1">{errors.proudestMoment}</p>
				)}
			</div>

			<div>
				<h4 className="text-sm font-medium mb-3" style={{ color: "#5C7F4F" }}>
					What challenges did you face and how did you adapt?
				</h4>
				<p className="text-xs mb-4" style={{ color: "#6B7280" }}>
					For each area, describe the challenge and how you handled it:
				</p>

				<div className="space-y-4">
					<div>
						<label className="block font-medium text-gray-700 mb-1">
							Surroundings & Setup
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Physical space, noise, technology, lighting, positioning
						</p>
						<textarea
							className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none"
							style={{
								borderColor: "#E8E5E0",
							}}
							rows={2}
							placeholder="Example: Background noise was distracting, so I moved closer to the speaker and adjusted my position..."
							value={formData.challengesHandled.environmental}
							onChange={(e) =>
								handleInputChange(
									"challengesHandled.environmental",
									e.target.value,
								)
							}
						/>
					</div>

					<div>
						<label className="block font-medium text-gray-700 mb-1">
							Interactions & Relationships
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Difficult dynamics, power imbalances, managing multiple speakers
						</p>
						<textarea
							className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none"
							rows={2}
							placeholder="Example: Speakers were talking over each other, so I used hand signals and positioned myself to manage turn-taking..."
							value={formData.challengesHandled.interpersonal}
							onChange={(e) =>
								handleInputChange(
									"challengesHandled.interpersonal",
									e.target.value,
								)
							}
						/>
					</div>

					<div>
						<label className="block font-medium text-gray-700 mb-1">
							Delivery & Expression
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Fast pace, accents, tone matching, register shifts
						</p>
						<textarea
							className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none"
							rows={2}
							placeholder="Example: The speaker was very fast, so I slowed my pace and used pauses to maintain clarity..."
							value={formData.challengesHandled.paralinguistic}
							onChange={(e) =>
								handleInputChange(
									"challengesHandled.paralinguistic",
									e.target.value,
								)
							}
						/>
					</div>

					<div>
						<label className="block font-medium text-gray-700 mb-1">
							Internal & Emotional
						</label>
						<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
							Stress, self-doubt, staying focused, managing your reactions
						</p>
						<textarea
							className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none"
							rows={2}
							placeholder="Example: I felt overwhelmed at one point, so I took deep breaths and reminded myself to focus on one sentence at a time..."
							value={formData.challengesHandled.intrapersonal}
							onChange={(e) =>
								handleInputChange(
									"challengesHandled.intrapersonal",
									e.target.value,
								)
							}
						/>
					</div>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">
					What skills were strengthened?
				</label>
				<textarea
					className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none ${errors.skillsStrengthened ? "border-red-500" : "border"}`}
					rows={4}
					placeholder="Example: Active listening, managing complex terminology, staying neutral in emotional situations, quick thinking..."
					value={formData.skillsStrengthened}
					onChange={(e) =>
						handleInputChange("skillsStrengthened", e.target.value)
					}
				/>
				{errors.skillsStrengthened && (
					<p className="mt-1 text-sm text-red-500">
						{errors.skillsStrengthened}
					</p>
				)}
			</div>
		</div>
	);

	const renderLearningCapture = () => (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-gray-800 mb-4">Learning Capture</h3>

			<div>
				<label className="block text-sm font-medium mb-2">
					Key lessons learned
				</label>
				<textarea
					className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none ${errors.lessonsLearned ? "border-red-500" : "border"}`}
					rows={4}
					placeholder="What are the most important lessons from this assignment?"
					value={formData.lessonsLearned}
					onChange={(e) => handleInputChange("lessonsLearned", e.target.value)}
				/>
				{errors.lessonsLearned && (
					<p className="mt-1 text-sm text-red-500">{errors.lessonsLearned}</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">
					New knowledge gained
				</label>
				<textarea
					className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none"
					rows={4}
					placeholder="What new knowledge or insights did you gain?"
					value={formData.knowledgeGained}
					onChange={(e) => handleInputChange("knowledgeGained", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">
					Future applications
				</label>
				<textarea
					className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none"
					rows={4}
					placeholder="How will you apply these learnings in future assignments?"
					value={formData.futureApplications}
					onChange={(e) =>
						handleInputChange("futureApplications", e.target.value)
					}
				/>
			</div>
		</div>
	);

	const renderEmotionalProcessing = () => (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-gray-800 mb-4">
				Emotional Processing
			</h3>

			<div className="p-4 rounded-lg mb-4" style={{ backgroundColor: "rgba(107, 139, 96, 0.1)", border: "1px solid rgba(107, 139, 96, 0.2)" }}>
				<p className="text-sm" style={{ color: "#5C7F4F" }}>
					<strong>Why this matters:</strong> Interpreting work can be emotionally demanding. Naming and processing your emotions helps prevent burnout, builds resilience, and keeps you connected to yourself.
				</p>
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">
					When did you feel most energized or positive?
				</label>
				<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
					Think about moments when you felt confident, connected, or proud
				</p>
				<textarea
					className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none"
					rows={3}
					placeholder="Example: When I successfully navigated a complex term, when the participants understood each other clearly, when I felt in flow..."
					value={formData.emotionalHighs}
					onChange={(e) => handleInputChange("emotionalHighs", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">
					What were the most challenging moments?
				</label>
				<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
					Elite performers learn from challenges - what tested your skills?
				</p>
				<textarea
					className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none"
					rows={3}
					placeholder="Example: Complex terminology I hadn't encountered, fast-paced dialogue, emotionally heavy content, managing my own reactions..."
					value={formData.emotionalChallenges}
					onChange={(e) =>
						handleInputChange("emotionalChallenges", e.target.value)
					}
				/>
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">
					What emotions are you carrying from this assignment?
				</label>
				<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
					Name the feelings still with you - there's no right or wrong answer
				</p>
				<textarea
					className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none ${errors.emotionalJourney ? "border-red-500" : "border"}`}
					rows={4}
					placeholder="Example: I feel proud but also drained. There's some lingering worry about whether I got everything right. I'm relieved it's over but also energized by what I learned..."
					value={formData.emotionalJourney}
					onChange={(e) =>
						handleInputChange("emotionalJourney", e.target.value)
					}
				/>
				{errors.emotionalJourney && (
					<p className="mt-1 text-sm text-red-500">{errors.emotionalJourney}</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">
					What would help you process or release these emotions?
				</label>
				<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
					Consider: talking to someone, movement, rest, creative expression, time in nature, or simply acknowledging what you're feeling
				</p>
				<textarea
					className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none"
					rows={3}
					placeholder="Example: I need to talk this through with a colleague, go for a walk to clear my head, or just give myself permission to rest..."
					value={formData.emotionalSupport}
					onChange={(e) =>
						handleInputChange("emotionalSupport", e.target.value)
					}
				/>
			</div>
		</div>
	);

	const renderPhysicalSelfCare = () => (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-gray-800 mb-4">
				Physical Recovery & Boundaries
			</h3>

			<div>
				<label className="block text-sm font-medium mb-2">
					What's happening in your body right now?
				</label>
				<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
					Notice: tension, fatigue, energy, pain, restlessness, or calm
				</p>
				<textarea
					className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none ${errors.physicalImpact ? "border-red-500" : "border"}`}
					rows={3}
					placeholder="Example: My shoulders are tight, I have a headache, I feel exhausted, my jaw is clenched..."
					value={formData.physicalImpact}
					onChange={(e) => handleInputChange("physicalImpact", e.target.value)}
				/>
				{errors.physicalImpact && (
					<p className="mt-1 text-sm text-red-500">{errors.physicalImpact}</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">
					What does your body need right now?
				</label>
				<p className="text-xs mb-3" style={{ color: "#6B7280" }}>
					Select what would help you recover (choose all that apply)
				</p>
				<div className="space-y-2">
					{[
						"Rest and sleep",
						"Physical exercise",
						"Healthy nutrition",
						"Relaxation activities",
						"Social connection",
						"Time in nature",
						"Creative expression",
					].map((action) => (
						<label
							key={action}
							className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
						>
							<input
								type="checkbox"
								checked={formData.selfCareActions.includes(action)}
								onChange={(e) => {
									if (e.target.checked) {
										handleInputChange("selfCareActions", [
											...formData.selfCareActions,
											action,
										]);
									} else {
										handleInputChange(
											"selfCareActions",
											formData.selfCareActions.filter((a) => a !== action),
										);
									}
								}}
								className="rounded border-gray-300 focus:ring-green-600 focus:ring-1"
								style={{
									width: "12px",
									height: "12px",
									accentColor: "#5B9378",
									transform: "scale(0.65)",
									transformOrigin: "center",
								}}
							/>
							<span className="text-gray-700">{action}</span>
						</label>
					))}
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">
					Your recovery plan for today
				</label>
				<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
					What specific actions will you take to recharge?
				</p>
				<textarea
					className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none"
					rows={3}
					placeholder="Example: Take a 20-minute walk, eat a proper meal, call a friend, take a nap before my next assignment..."
					value={formData.recoveryPlan}
					onChange={(e) => handleInputChange("recoveryPlan", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">
					How well did you maintain your professional boundaries?
				</label>
				<p className="text-xs mb-2" style={{ color: "#6B7280" }}>
					Elite performers protect their role clarity and professional limits
				</p>
				<textarea
					className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none"
					rows={3}
					placeholder="Example: I maintained my role well / I need to work on speaking up when sessions run over / Next time I'll clarify my scope at the start / I successfully advocated for a break when needed..."
					value={formData.boundaries}
					onChange={(e) => handleInputChange("boundaries", e.target.value)}
				/>
			</div>
		</div>
	);

	const renderIntegrationCelebration = () => (
		<div className="space-y-6">
			<h3 className="text-xl font-bold text-gray-800 mb-4">
				Integration & Celebration
			</h3>

			<div>
				<label className="block text-sm font-medium mb-2">
					What growth did you achieve?
				</label>
				<textarea
					className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none ${errors.growthAchieved ? "border-red-500" : "border"}`}
					rows={4}
					placeholder="Describe the personal and professional growth from this assignment"
					value={formData.growthAchieved}
					onChange={(e) => handleInputChange("growthAchieved", e.target.value)}
				/>
				{errors.growthAchieved && (
					<p className="mt-1 text-sm text-red-500">{errors.growthAchieved}</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">
					How will you celebrate this accomplishment?
				</label>
				<textarea
					className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none"
					rows={3}
					placeholder="Describe how you'll acknowledge and celebrate your work"
					value={formData.celebrationPlan}
					onChange={(e) => handleInputChange("celebrationPlan", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">
					Express gratitude
				</label>
				<textarea
					className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none"
					rows={3}
					placeholder="What are you grateful for from this experience?"
					value={formData.gratitude}
					onChange={(e) => handleInputChange("gratitude", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">Next steps</label>
				<textarea
					className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 resize-none"
					rows={3}
					placeholder="What are your immediate next steps?"
					value={formData.nextSteps}
					onChange={(e) => handleInputChange("nextSteps", e.target.value)}
				/>
			</div>

			<div>
				<label className="block text-sm font-medium mb-4">
					Confidence for future assignments (1-10)
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
							height: "2px",
							cursor: "pointer",
						}}
					/>
					<span className="text-sm text-gray-500">High</span>
					<span className="ml-4 font-bold text-green-700">
						{formData.confidenceLevel}
					</span>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">
					Describe your current feeling in one word
				</label>
				<input
					type="text"
					className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500"
					placeholder="e.g., accomplished, grateful, tired, energized..."
					value={formData.currentFeeling}
					onChange={(e) => handleInputChange("currentFeeling", e.target.value)}
				/>
			</div>
		</div>
	);

	const renderCurrentStep = () => {
		switch (currentStep) {
			case 0:
				return renderOpeningContext();
			case 1:
				return renderAssignmentReview();
			case 2:
				return renderPerformanceAdaptations();
			case 3:
				return renderLearningCapture();
			case 4:
				return renderEmotionalProcessing();
			case 5:
				return renderPhysicalSelfCare();
			case 6:
				return renderIntegrationCelebration();
			default:
				return renderAssignmentReview();
		}
	};

	const renderNavigationButtons = () => (
		<div className="flex justify-between gap-4 mt-8">
			<button
				onClick={handlePrevious}
				disabled={currentStep === 0}
				className="flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				style={{
					backgroundColor: currentStep === 1 ? "#e5e7eb" : "#ffffff",
					color: currentStep === 1 ? "#9ca3af" : "#5C7F4F",
					border: `2px solid ${currentStep === 1 ? "#e5e7eb" : "#5C7F4F"}`,
				}}
			>
				<ArrowLeft className="h-4 w-4" />
				Back
			</button>

			{currentStep < steps.length - 1 ? (
				<button
					onClick={handleNext}
					className="flex items-center gap-2 px-6 py-3 font-semibold rounded-lg text-white transition-all hover:opacity-90"
					style={{
						background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
					}}
				>
					Next
					<ArrowRight className="h-4 w-4" />
				</button>
			) : (
				<button
					onClick={handleComplete}
					disabled={isSaving}
					className="flex items-center gap-2 px-6 py-4 font-semibold rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50"
					style={{
						background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
					}}
				>
					{isSaving ? (
						<>
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
							Saving...
						</>
					) : (
						<>
							<CheckCircle className="h-5 w-5" />
							Complete Debrief
						</>
					)}
				</button>
			)}
		</div>
	);

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
			<div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
				<div className="sticky top-0 bg-white px-8 py-6 z-10">
					{renderProgressIndicator()}
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

export default PostAssignmentDebriefAccessible;
