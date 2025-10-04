import {
	Anchor,
	Award,
	Calendar,
	CheckCircle,
	Eye,
	Heart,
	Pause,
	Play,
	RefreshCw,
	Shield,
	Users,
	X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface EmotionalProximityResetProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

type ResetPhase = "acknowledge" | "separate" | "ground" | "restore" | "ready";
type ContentType =
	| "trauma"
	| "medical"
	| "emotional"
	| "confrontation"
	| "bad-news"
	| "other";
type SupportNeed =
	| "none"
	| "break"
	| "colleague"
	| "supervision"
	| "end-day"
	| "extended";

interface ResetData {
	separationLevel: string;
	mostHelpfulStep: string;
	emotionalDistance: number;
	professionalIdentity: number;
	readinessLevel: number;
	supportNeed: number;
	currentNeed: string;
	contentImpact: string;
	professionalMaintenance: string;
	duration: number;
	contentType: ContentType;
	timestamp: string;
}

const resetSteps = [
	{
		id: "anchor",
		title: "Physical Anchor",
		duration: 10,
		icon: Anchor,
		instructions: [
			"Touch something near you - your desk, chair, or table",
			"Feel the texture of what you're touching right now",
			"Notice the temperature - is it cool or warm to your touch?",
			"Press your feet gently into the floor",
			"Take a moment to feel where you are in this space",
		],
	},
	{
		id: "clarity",
		title: "Role Clarity",
		duration: 20,
		icon: Shield,
		statements: [
			"I showed up today, even when it was hard - that took courage",
			"I partnered with them to carry heavy words with care - that's my professional strength",
			"Their pain, their joy, their story - I witnessed it all without making it mine",
			"I stood in the space between languages and cultures, creating a bridge - that matters",
			"Together we made sure their voice reached where it needed to go - that's powerful work",
		],
	},
	{
		id: "sensory",
		title: "Sensory Shift",
		duration: 30,
		icon: Eye,
		options: [
			{
				sense: "Look at",
				action: "Something neutral (wall, floor, your hands)",
			},
			{
				sense: "Touch",
				action: "A smooth object, your own arms, a cool surface",
			},
			{ sense: "Listen to", action: "Ambient sound, your breathing, silence" },
			{ sense: "Smell", action: "Hand lotion, coffee, fresh air" },
			{ sense: "Move", action: "Stretch, shake out hands, roll shoulders" },
		],
	},
	{
		id: "pride",
		title: "Professional Pride",
		duration: 20,
		icon: Award,
		acknowledgments: [
			"I helped critical communication happen",
			"My skills made understanding possible",
			"I served professionally in a difficult moment",
			"I maintained composure under pressure",
			"My work mattered today",
		],
	},
	{
		id: "transition",
		title: "Transition Ritual",
		duration: 10,
		icon: CheckCircle,
		rituals: [
			"Close your notepad firmly",
			"Take three deep breaths",
			"Step away from interpreting position",
			"Remove/adjust your badge",
			"Your personal completion gesture",
		],
	},
];

export const EmotionalProximityReset: React.FC<
	EmotionalProximityResetProps
> = ({ onClose, onComplete }) => {
	// Core states
	const [phase, setPhase] = useState<
		"setup" | "practice" | "checkin" | "support"
	>("setup");
	const [currentStep, setCurrentStep] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [stepTimeElapsed, setStepTimeElapsed] = useState(0);

	// Practice settings
	const [quickMode, setQuickMode] = useState(false);
	const [internalizationMode, setInternalizationMode] = useState(false);
	const [extendedMode, setExtendedMode] = useState(false);
	const [contentType, setContentType] = useState<ContentType>("emotional");
	const [settingType, setSettingType] = useState<
		"private" | "team" | "public" | "remote"
	>("private");

	// Accessibility
	const [highContrastMode, setHighContrastMode] = useState(false);
	const [vibrationEnabled, setVibrationEnabled] = useState(false);
	const [largeText, setLargeText] = useState(false);

	// Check-in states
	const [separationLevel, setSeparationLevel] = useState("");
	const [mostHelpfulStep, setMostHelpfulStep] = useState("");
	const [emotionalDistance, setEmotionalDistance] = useState(5);
	const [professionalIdentity, setProfessionalIdentity] = useState(5);
	const [readinessLevel, setReadinessLevel] = useState(5);
	const [supportNeed, setSupportNeed] = useState(5);
	const [currentNeed, setCurrentNeed] = useState("");
	const [contentImpact, setContentImpact] = useState("");
	const [professionalMaintenance, setProfessionalMaintenance] = useState("");

	// Support options
	const [logReset, setLogReset] = useState(true);
	const [requestPeerSupport, setRequestPeerSupport] = useState(false);
	const [scheduleSupervision, setScheduleSupervision] = useState(false);
	const [accessEAP, setAccessEAP] = useState(false);
	const [shareWithTeam, setShareWithTeam] = useState(false);

	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Load preferences
	useEffect(() => {
		const saved = localStorage.getItem("emotionalProximityPrefs");
		if (saved) {
			const prefs = JSON.parse(saved);
			setHighContrastMode(prefs.highContrast || false);
			setVibrationEnabled(prefs.vibration || false);
			setLargeText(prefs.largeText || false);
			setInternalizationMode(prefs.internalization || false);
		}
	}, []);

	// Timer effect
	useEffect(() => {
		if (isPlaying && phase === "practice") {
			intervalRef.current = setInterval(() => {
				setTimeElapsed((prev) => prev + 1);
				setStepTimeElapsed((prev) => {
					const next = prev + 1;
					const currentStepDuration = quickMode
						? 5
						: extendedMode
							? resetSteps[currentStep].duration * 2
							: resetSteps[currentStep].duration;

					if (next >= currentStepDuration) {
						if (currentStep < resetSteps.length - 1) {
							setCurrentStep((prev) => prev + 1);
							if (vibrationEnabled && "vibrate" in navigator) {
								navigator.vibrate(100);
							}
							return 0;
						} else {
							handleComplete();
						}
					}
					return next;
				});
			}, 1000);
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [
		isPlaying,
		phase,
		currentStep,
		quickMode,
		extendedMode,
		vibrationEnabled,
	]);

	const handleStart = () => {
		setPhase("practice");
		setIsPlaying(true);
		setTimeElapsed(0);
		setStepTimeElapsed(0);
		setCurrentStep(0);

		if (vibrationEnabled && "vibrate" in navigator) {
			navigator.vibrate(200);
		}
	};

	const handlePause = () => {
		setIsPlaying(!isPlaying);

		if (vibrationEnabled && "vibrate" in navigator) {
			navigator.vibrate([50, 50, 50]);
		}
	};

	const handleComplete = () => {
		setIsPlaying(false);
		setPhase("checkin");

		if (vibrationEnabled && "vibrate" in navigator) {
			navigator.vibrate([100, 50, 100, 50, 100]);
		}
	};

	const handleSubmit = () => {
		const data: ResetData = {
			separationLevel,
			mostHelpfulStep,
			emotionalDistance,
			professionalIdentity,
			readinessLevel,
			supportNeed,
			currentNeed,
			contentImpact,
			professionalMaintenance,
			duration: timeElapsed,
			contentType,
			timestamp: new Date().toISOString(),
		};

		// Log for occupational health tracking
		if (logReset) {
			const sessions = JSON.parse(
				localStorage.getItem("emotionalProximitySessions") || "[]",
			);
			sessions.push(data);
			localStorage.setItem(
				"emotionalProximitySessions",
				JSON.stringify(sessions),
			);

			// Check for concerning patterns
			const recentSessions = sessions.filter((s: any) => {
				const sessionDate = new Date(s.timestamp);
				const weekAgo = new Date();
				weekAgo.setDate(weekAgo.getDate() - 7);
				return sessionDate > weekAgo;
			});

			if (recentSessions.length > 10) {
				console.warn(
					"High frequency of emotional proximity resets - consider supervision",
				);
			}
		}

		// Flag concerning content impact
		if (
			contentImpact &&
			(contentImpact.length > 100 ||
				contentImpact.toLowerCase().includes("help") ||
				contentImpact.toLowerCase().includes("can't"))
		) {
			console.warn(
				"Content impact may need additional support:",
				contentImpact,
			);
		}

		// Save preferences
		localStorage.setItem(
			"emotionalProximityPrefs",
			JSON.stringify({
				highContrast: highContrastMode,
				vibration: vibrationEnabled,
				largeText: largeText,
				internalization: internalizationMode,
			}),
		);

		if (onComplete) onComplete(data);
		onClose();
	};

	const getCurrentStepInfo = () => {
		return resetSteps[currentStep] || resetSteps[0];
	};

	const getStepProgress = () => {
		const duration = quickMode
			? 5
			: extendedMode
				? getCurrentStepInfo().duration * 2
				: getCurrentStepInfo().duration;
		return (stepTimeElapsed / duration) * 100;
	};

	const getTextSize = () => {
		if (largeText) return "text-lg";
		return "text-base";
	};

	// Setup phase
	if (phase === "setup") {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div
					className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
						highContrastMode
							? "bg-white text-black border-4 border-black"
							: "bg-white"
					}`}
				>
					<div className="p-8">
						{/* Header */}
						<div className="flex justify-between items-start mb-8">
							<div>
								<h1
									className={`text-3xl font-bold mb-2 ${
										highContrastMode ? "text-black" : "text-gray-900"
									}`}
								>
									Emotional Proximity Reset
								</h1>
								<p
									className={`${getTextSize()} ${highContrastMode ? "text-black" : "text-gray-600"}`}
								>
									Return to professional center after intense content
								</p>
							</div>
							<button
								onClick={onClose}
								className="p-2 hover:bg-gray-100 rounded-lg"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						{/* Situation */}
						<div
							className={`mb-8 p-6 rounded-xl ${
								highContrastMode
									? "bg-yellow-100 border-2 border-black"
									: "bg-amber-50"
							}`}
						>
							<h2 className={`font-semibold mb-3 ${getTextSize()}`}>
								The Situation:
							</h2>
							<p
								className={`${getTextSize()} ${highContrastMode ? "text-black" : "text-amber-900"}`}
							>
								You've just interpreted trauma, medical emergency, emotional
								content, or difficult material
							</p>
						</div>

						{/* Content type selection */}
						<div className="mb-8">
							<label className={`block mb-3 font-medium ${getTextSize()}`}>
								What type of content did you interpret?
							</label>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
								{[
									{ id: "trauma" as ContentType, label: "Abuse or trauma" },
									{ id: "medical" as ContentType, label: "Medical emergency" },
									{
										id: "emotional" as ContentType,
										label: "Emotional breakdown",
									},
									{
										id: "confrontation" as ContentType,
										label: "Angry confrontation",
									},
									{
										id: "bad-news" as ContentType,
										label: "Delivering bad news",
									},
									{
										id: "other" as ContentType,
										label: "Other difficult content",
									},
								].map((type) => (
									<button
										key={type.id}
										onClick={() => setContentType(type.id)}
										className={`p-3 rounded-lg border transition-all ${
											contentType === type.id
												? highContrastMode
													? "bg-black text-white border-black"
													: "bg-blue-600 text-white border-blue-600"
												: highContrastMode
													? "border-black hover:bg-gray-100"
													: "border-gray-300 hover:bg-gray-50"
										}`}
									>
										{type.label}
									</button>
								))}
							</div>
						</div>

						{/* Setting type */}
						<div className="mb-8">
							<label className={`block mb-3 font-medium ${getTextSize()}`}>
								Your current setting:
							</label>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
								{[
									{ id: "private" as const, label: "Have privacy" },
									{ id: "team" as const, label: "Team setting" },
									{ id: "public" as const, label: "Public space" },
									{ id: "remote" as const, label: "Remote/VRI" },
								].map((setting) => (
									<button
										key={setting.id}
										onClick={() => setSettingType(setting.id)}
										className={`p-3 rounded-lg border transition-all ${
											settingType === setting.id
												? highContrastMode
													? "bg-black text-white border-black"
													: "bg-blue-600 text-white border-blue-600"
												: highContrastMode
													? "border-black hover:bg-gray-100"
													: "border-gray-300 hover:bg-gray-50"
										}`}
									>
										{setting.label}
									</button>
								))}
							</div>
						</div>

						{/* Reset path preview */}
						<div
							className={`mb-8 p-4 rounded-lg ${
								highContrastMode
									? "bg-gray-100 border-2 border-black"
									: "bg-blue-50"
							}`}
						>
							<p className={`${getTextSize()} font-medium mb-3`}>
								Your Professional Reset Path:
							</p>
							<div className="flex items-center justify-center gap-2 flex-wrap">
								{["Acknowledge", "Separate", "Ground", "Restore", "Ready"].map(
									(step, i) => (
										<React.Fragment key={step}>
											<span
												className={`px-3 py-1 rounded ${
													highContrastMode
														? "bg-white border border-black"
														: "bg-white"
												}`}
											>
												{step}
											</span>
											{i < 4 && <span className="text-gray-400">•</span>}
										</React.Fragment>
									),
								)}
							</div>
						</div>

						{/* Duration options */}
						<div className="mb-8">
							<label className={`block mb-3 font-medium ${getTextSize()}`}>
								Choose your reset duration:
							</label>
							<div className="space-y-2">
								<label className="flex items-center">
									<input
										type="radio"
										name="duration"
										checked={quickMode}
										onChange={() => {
											setQuickMode(true);
											setExtendedMode(false);
										}}
										className="mr-3"
									/>
									<span className={getTextSize()}>
										<strong>Quick (30 seconds)</strong> - Time pressure or team
										setting
									</span>
								</label>
								<label className="flex items-center">
									<input
										type="radio"
										name="duration"
										checked={!quickMode && !extendedMode}
										onChange={() => {
											setQuickMode(false);
											setExtendedMode(false);
										}}
										className="mr-3"
									/>
									<span className={getTextSize()}>
										<strong>Standard (90 seconds)</strong> - Full five-step
										process
									</span>
								</label>
								<label className="flex items-center">
									<input
										type="radio"
										name="duration"
										checked={extendedMode}
										onChange={() => {
											setQuickMode(false);
											setExtendedMode(true);
										}}
										className="mr-3"
									/>
									<span className={getTextSize()}>
										<strong>Extended (3 minutes)</strong> - Overwhelming content
									</span>
								</label>
							</div>
						</div>

						{/* Important reminders */}
						<div
							className={`mb-8 p-4 rounded-lg ${
								highContrastMode
									? "bg-gray-100 border-2 border-black"
									: "bg-green-50"
							}`}
						>
							<h3 className={`font-medium mb-2 ${getTextSize()}`}>
								Important Reminders:
							</h3>
							<ul
								className={`${getTextSize()} space-y-1 ${
									highContrastMode ? "text-black" : "text-green-900"
								}`}
							>
								<li>• Feeling affected is normal, not weakness</li>
								<li>• This protects your longevity in the profession</li>
								<li>• Professional distance keeps you effective</li>
								<li>• You can care and maintain boundaries</li>
								<li>
									• This is professional maintenance, not personal failure
								</li>
							</ul>
						</div>

						{/* Options */}
						<div className="mb-8 space-y-2">
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={internalizationMode}
									onChange={(e) => setInternalizationMode(e.target.checked)}
									className="mr-3"
								/>
								<span className={getTextSize()}>A moment to internalize</span>
							</label>
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={vibrationEnabled}
									onChange={(e) => setVibrationEnabled(e.target.checked)}
									className="mr-3"
								/>
								<span className={getTextSize()}>
									Vibration cues for transitions
								</span>
							</label>
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={highContrastMode}
									onChange={(e) => setHighContrastMode(e.target.checked)}
									className="mr-3"
								/>
								<span className={getTextSize()}>High contrast mode</span>
							</label>
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={largeText}
									onChange={(e) => setLargeText(e.target.checked)}
									className="mr-3"
								/>
								<span className={getTextSize()}>Larger text</span>
							</label>
						</div>

						{/* Start button */}
						<button
							onClick={handleStart}
							className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
								highContrastMode
									? "bg-black text-white hover:bg-gray-800"
									: "bg-blue-600 text-white hover:bg-blue-700"
							}`}
						>
							<Play className="w-5 h-5 inline mr-2" />
							Begin Reset
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Practice phase
	if (phase === "practice") {
		const currentStepInfo = getCurrentStepInfo();
		const Icon = currentStepInfo.icon;

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div
					className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
						highContrastMode
							? "bg-white text-black border-4 border-black"
							: "bg-white"
					}`}
				>
					<div className="p-8">
						{/* Header */}
						<div className="flex justify-between items-center mb-6">
							<div>
								<h2
									className={`text-2xl font-bold ${
										highContrastMode ? "text-black" : "text-gray-900"
									}`}
								>
									Step {currentStep + 1}: {currentStepInfo.title}
								</h2>
								<p
									className={`${getTextSize()} ${highContrastMode ? "text-black" : "text-gray-600"}`}
								>
									{quickMode
										? "5"
										: extendedMode
											? currentStepInfo.duration * 2
											: currentStepInfo.duration}{" "}
									seconds
								</p>
							</div>
							<button
								onClick={onClose}
								className="p-2 hover:bg-gray-100 rounded-lg"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						{/* Acknowledging impact banner */}
						{currentStep === 0 && (
							<div
								className={`mb-6 p-4 rounded-lg text-center ${
									highContrastMode
										? "bg-yellow-100 border-2 border-black"
										: "bg-amber-50"
								}`}
							>
								<p
									className={`${getTextSize()} font-medium ${
										highContrastMode ? "text-black" : "text-amber-900"
									}`}
								>
									What you interpreted matters, and you matter too
								</p>
							</div>
						)}

						{/* Main instruction area */}
						<div
							className={`mb-8 p-8 rounded-xl text-center ${
								highContrastMode
									? "bg-black text-white"
									: "bg-blue-700 text-white"
							}`}
						>
							<Icon className="w-16 h-16 mx-auto mb-4 opacity-90" />

							{/* Step-specific content */}
							{currentStepInfo.id === "anchor" && (
								<div className="space-y-3">
									{currentStepInfo.instructions.map((instruction, i) => (
										<p key={i} className={`${getTextSize()}`}>
											{quickMode && i === 0
												? instruction
												: !quickMode && instruction}
										</p>
									))}
								</div>
							)}

							{currentStepInfo.id === "clarity" && (
								<div>
									<p className={`text-xl font-medium mb-4`}>
										Say one of these{" "}
										{internalizationMode ? "internally" : "aloud"}:
									</p>
									<div className="space-y-2">
										{(quickMode
											? [currentStepInfo.statements[0]]
											: currentStepInfo.statements
										).map((statement, i) => (
											<p key={i} className={`${getTextSize()} italic`}>
												"{statement}"
											</p>
										))}
									</div>
								</div>
							)}

							{currentStepInfo.id === "sensory" && (
								<div>
									<p className={`text-xl font-medium mb-4`}>
										Choose what helps you most:
									</p>
									<div className="space-y-2">
										{currentStepInfo.options.map((option, i) => (
											<p key={i} className={`${getTextSize()}`}>
												<strong>{option.sense}:</strong> {option.action}
											</p>
										))}
									</div>
								</div>
							)}

							{currentStepInfo.id === "pride" && (
								<div>
									<p className={`text-xl font-medium mb-4`}>
										Acknowledge your service:
									</p>
									<div className="space-y-2">
										{(quickMode
											? [currentStepInfo.acknowledgments[4]]
											: currentStepInfo.acknowledgments
										).map((ack, i) => (
											<p key={i} className={`${getTextSize()} italic`}>
												"{ack}"
											</p>
										))}
									</div>
								</div>
							)}

							{currentStepInfo.id === "transition" && (
								<div>
									<p className={`text-xl font-medium mb-4`}>
										Your signal that interpretation is complete:
									</p>
									<div className="space-y-2">
										{(quickMode
											? [currentStepInfo.rituals[1]]
											: currentStepInfo.rituals
										).map((ritual, i) => (
											<p key={i} className={`${getTextSize()}`}>
												{ritual}
											</p>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Progress bar */}
						<div className="mb-6">
							<div className="flex justify-between mb-2">
								<span className={`${getTextSize()} font-medium`}>
									Step Progress:
								</span>
								<span className={getTextSize()}>
									{stepTimeElapsed}s /{" "}
									{quickMode
										? 5
										: extendedMode
											? currentStepInfo.duration * 2
											: currentStepInfo.duration}
									s
								</span>
							</div>
							<div
								className={`h-3 rounded-full overflow-hidden ${
									highContrastMode ? "bg-gray-300" : "bg-gray-200"
								}`}
							>
								<div
									className={`h-full transition-all duration-1000 ${
										highContrastMode ? "bg-black" : "bg-blue-600"
									}`}
									style={{ width: `${getStepProgress()}%` }}
								/>
							</div>
						</div>

						{/* Overall progress */}
						<div className="mb-8">
							<p className={`${getTextSize()} text-center mb-2`}>
								Overall Progress:
							</p>
							<div className="flex justify-center gap-2">
								{resetSteps.map((step, i) => (
									<div
										key={step.id}
										className={`w-12 h-2 rounded ${
											i < currentStep
												? highContrastMode
													? "bg-black"
													: "bg-green-600"
												: i === currentStep
													? highContrastMode
														? "bg-gray-600"
														: "bg-blue-600"
													: highContrastMode
														? "bg-gray-300"
														: "bg-gray-300"
										}`}
									/>
								))}
							</div>
						</div>

						{/* Controls */}
						<div className="flex justify-center gap-3">
							<button
								onClick={handlePause}
								className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
									highContrastMode
										? "bg-black text-white hover:bg-gray-800"
										: "bg-blue-600 text-white hover:bg-blue-700"
								}`}
							>
								{isPlaying ? (
									<Pause className="w-5 h-5" />
								) : (
									<Play className="w-5 h-5" />
								)}
								{isPlaying ? "Pause" : "Resume"}
							</button>
							<button
								onClick={() =>
									setCurrentStep(
										Math.min(currentStep + 1, resetSteps.length - 1),
									)
								}
								className={`px-6 py-3 rounded-lg font-medium ${
									highContrastMode
										? "bg-gray-200 border-2 border-black hover:bg-gray-300"
										: "bg-gray-100 hover:bg-gray-200"
								}`}
							>
								Skip Step
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Check-in phase
	if (phase === "checkin") {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div
					className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
						highContrastMode
							? "bg-white text-black border-4 border-black"
							: "bg-white"
					}`}
				>
					<div className="p-8">
						<h2
							className={`text-3xl font-bold mb-2 ${
								highContrastMode ? "text-black" : "text-gray-900"
							}`}
						>
							Professional Wellness Check
						</h2>
						<p
							className={`mb-8 ${getTextSize()} ${highContrastMode ? "text-black" : "text-gray-600"}`}
						>
							Your wellbeing supports your practice
						</p>

						{/* Separation level */}
						<div className="mb-6">
							<label className={`block mb-3 font-medium ${getTextSize()}`}>
								How separated do you feel from the content?
							</label>
							<div className="space-y-2">
								{[
									"Fully professional distance restored",
									"Mostly separated",
									"Somewhat clearer",
									"Still carrying the emotional weight",
									"Need additional support",
								].map((level) => (
									<button
										key={level}
										onClick={() => setSeparationLevel(level)}
										className={`block w-full text-left px-4 py-3 rounded-lg transition-all ${
											separationLevel === level
												? highContrastMode
													? "bg-black text-white"
													: "bg-blue-600 text-white"
												: highContrastMode
													? "bg-gray-100 border border-black"
													: "bg-gray-50 hover:bg-gray-100"
										}`}
									>
										{level}
									</button>
								))}
							</div>
						</div>

						{/* Most helpful step */}
						<div className="mb-6">
							<label className={`block mb-3 font-medium ${getTextSize()}`}>
								Which step helped most?
							</label>
							<div className="grid grid-cols-2 gap-2">
								{resetSteps.map((step) => (
									<button
										key={step.id}
										onClick={() => setMostHelpfulStep(step.title)}
										className={`px-3 py-2 rounded-lg ${
											mostHelpfulStep === step.title
												? highContrastMode
													? "bg-black text-white"
													: "bg-blue-600 text-white"
												: highContrastMode
													? "bg-gray-100 border border-black"
													: "bg-gray-50 hover:bg-gray-100"
										}`}
									>
										{step.title}
									</button>
								))}
								<button
									onClick={() => setMostHelpfulStep("The full sequence")}
									className={`px-3 py-2 rounded-lg ${
										mostHelpfulStep === "The full sequence"
											? highContrastMode
												? "bg-black text-white"
												: "bg-blue-600 text-white"
											: highContrastMode
												? "bg-gray-100 border border-black"
												: "bg-gray-50 hover:bg-gray-100"
									}`}
								>
									The full sequence
								</button>
							</div>
						</div>

						{/* Current state scales */}
						<div className="mb-6">
							<h3 className={`font-medium mb-4 ${getTextSize()}`}>
								Current state:
							</h3>
							<div className="space-y-4">
								{[
									{
										label: "Emotional distance",
										value: emotionalDistance,
										setter: setEmotionalDistance,
									},
									{
										label: "Professional identity",
										value: professionalIdentity,
										setter: setProfessionalIdentity,
									},
									{
										label: "Ready for next",
										value: readinessLevel,
										setter: setReadinessLevel,
									},
								].map((scale) => (
									<div key={scale.label}>
										<div className="flex justify-between mb-2">
											<span className={getTextSize()}>{scale.label}:</span>
											<span className={`${getTextSize()} font-medium`}>
												{scale.value}/10
											</span>
										</div>
										<input
											type="range"
											min="1"
											max="10"
											value={scale.value}
											onChange={(e) => scale.setter(parseInt(e.target.value))}
											className="w-full"
										/>
									</div>
								))}

								<div>
									<div className="flex justify-between mb-2">
										<span className={getTextSize()}>Need for support:</span>
										<span className={`${getTextSize()} font-medium`}>
											{supportNeed <= 3
												? "High"
												: supportNeed >= 8
													? "Low"
													: "Moderate"}
										</span>
									</div>
									<input
										type="range"
										min="1"
										max="10"
										value={11 - supportNeed}
										onChange={(e) =>
											setSupportNeed(11 - parseInt(e.target.value))
										}
										className="w-full"
									/>
									<div className="flex justify-between text-xs mt-1">
										<span>High need</span>
										<span>Low need</span>
									</div>
								</div>
							</div>
						</div>

						{/* Current need */}
						<div className="mb-6">
							<label className={`block mb-3 font-medium ${getTextSize()}`}>
								What do you need now?
							</label>
							<div className="grid grid-cols-2 gap-2">
								{[
									"Ready for next assignment",
									"Need a longer break",
									"Want to debrief with colleague",
									"Would like supervision",
									"Ready to end my day",
									"Other",
								].map((need) => (
									<button
										key={need}
										onClick={() => setCurrentNeed(need)}
										className={`px-3 py-2 rounded-lg text-sm ${
											currentNeed === need
												? highContrastMode
													? "bg-black text-white"
													: "bg-blue-600 text-white"
												: highContrastMode
													? "bg-gray-100 border border-black"
													: "bg-gray-50 hover:bg-gray-100"
										}`}
									>
										{need}
									</button>
								))}
							</div>
						</div>

						{/* Content impact check */}
						<div
							className={`mb-6 p-4 rounded-lg ${
								highContrastMode
									? "bg-yellow-100 border-2 border-black"
									: "bg-amber-50"
							}`}
						>
							<label className={`block mb-2 font-medium ${getTextSize()}`}>
								Content impact check:
							</label>
							<p
								className={`text-sm mb-2 ${highContrastMode ? "text-black" : "text-amber-800"}`}
							>
								Is there anything from this interpretation that needs additional
								attention?
							</p>
							<textarea
								value={contentImpact}
								onChange={(e) => setContentImpact(e.target.value)}
								placeholder="This will be flagged for support if concerning"
								className={`w-full px-3 py-2 rounded border ${
									highContrastMode ? "border-black" : "border-amber-300"
								}`}
								rows={3}
							/>
						</div>

						{/* Professional maintenance */}
						<div className="mb-6">
							<label className={`block mb-2 ${getTextSize()}`}>
								Optional: What helped you maintain professionalism during the
								difficult interpretation?
							</label>
							<textarea
								value={professionalMaintenance}
								onChange={(e) => setProfessionalMaintenance(e.target.value)}
								placeholder="Your strategies can help others..."
								className={`w-full px-3 py-2 rounded border ${
									highContrastMode ? "border-black" : "border-gray-300"
								}`}
								rows={2}
							/>
						</div>

						{/* Professional wellness options */}
						<div className="mb-8">
							<h3 className={`font-medium mb-3 ${getTextSize()}`}>
								Your Professional Wellness:
							</h3>
							<div className="space-y-2">
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={logReset}
										onChange={(e) => setLogReset(e.target.checked)}
										className="mr-3"
									/>
									<span className={getTextSize()}>
										Log this reset (tracks cumulative exposure)
									</span>
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={requestPeerSupport}
										onChange={(e) => setRequestPeerSupport(e.target.checked)}
										className="mr-3"
									/>
									<span className={getTextSize()}>Request peer support</span>
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={scheduleSupervision}
										onChange={(e) => setScheduleSupervision(e.target.checked)}
										className="mr-3"
									/>
									<span className={getTextSize()}>Schedule supervision</span>
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={accessEAP}
										onChange={(e) => setAccessEAP(e.target.checked)}
										className="mr-3"
									/>
									<span className={getTextSize()}>Access EAP resources</span>
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={shareWithTeam}
										onChange={(e) => setShareWithTeam(e.target.checked)}
										className="mr-3"
									/>
									<span className={getTextSize()}>
										Share strategy with team (anonymous)
									</span>
								</label>
							</div>
						</div>

						{/* Action buttons */}
						<div className="flex gap-3">
							<button
								onClick={handleSubmit}
								className={`flex-1 py-3 rounded-lg font-semibold ${
									highContrastMode
										? "bg-black text-white hover:bg-gray-800"
										: "bg-blue-600 text-white hover:bg-blue-700"
								}`}
							>
								Complete Reset
							</button>
							<button
								onClick={() => {
									if (
										supportNeed <= 3 ||
										separationLevel === "Need additional support"
									) {
										setPhase("support");
									} else {
										handleSubmit();
									}
								}}
								className={`px-6 py-3 rounded-lg font-medium ${
									highContrastMode
										? "bg-gray-200 border-2 border-black hover:bg-gray-300"
										: "bg-gray-100 hover:bg-gray-200"
								}`}
							>
								Need More Support
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Support phase
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div
				className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
					highContrastMode
						? "bg-white text-black border-4 border-black"
						: "bg-white"
				}`}
			>
				<div className="p-8">
					<h2
						className={`text-3xl font-bold mb-2 ${
							highContrastMode ? "text-black" : "text-gray-900"
						}`}
					>
						Additional Support Options
					</h2>
					<p
						className={`mb-8 ${getTextSize()} ${highContrastMode ? "text-black" : "text-gray-600"}`}
					>
						You don't have to process this alone
					</p>

					{/* Extended reset option */}
					<div
						className={`mb-6 p-6 rounded-xl ${
							highContrastMode
								? "bg-blue-100 border-2 border-black"
								: "bg-blue-50"
						}`}
					>
						<h3
							className={`font-semibold mb-3 flex items-center gap-2 ${getTextSize()}`}
						>
							<RefreshCw className="w-5 h-5" />
							Extended Reset (5 minutes)
						</h3>
						<ul className={`${getTextSize()} space-y-2 mb-4`}>
							<li>• Repeat the full sequence</li>
							<li>• Add bilateral stimulation (cross-lateral movements)</li>
							<li>• Write and destroy notes about the content</li>
							<li>• Call a colleague for brief check-in</li>
						</ul>
						<button
							onClick={() => {
								setExtendedMode(true);
								setPhase("practice");
								setCurrentStep(0);
								setIsPlaying(true);
							}}
							className={`px-4 py-2 rounded-lg ${
								highContrastMode
									? "bg-black text-white hover:bg-gray-800"
									: "bg-blue-600 text-white hover:bg-blue-700"
							}`}
						>
							Start Extended Reset
						</button>
					</div>

					{/* Resources */}
					<div
						className={`mb-6 p-6 rounded-xl ${
							highContrastMode
								? "bg-gray-100 border-2 border-black"
								: "bg-gray-50"
						}`}
					>
						<h3 className={`font-semibold mb-4 ${getTextSize()}`}>
							Resources Available:
						</h3>
						<div className="space-y-3">
							<button
								className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${
									highContrastMode
										? "bg-white border border-black hover:bg-gray-100"
										: "bg-white hover:bg-gray-50"
								}`}
							>
								<Users className="w-5 h-5" />
								<div>
									<p className="font-medium">Peer support</p>
									<p className="text-sm opacity-75">Contact a colleague</p>
								</div>
							</button>

							<button
								className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${
									highContrastMode
										? "bg-white border border-black hover:bg-gray-100"
										: "bg-white hover:bg-gray-50"
								}`}
							>
								<Calendar className="w-5 h-5" />
								<div>
									<p className="font-medium">Supervisor consultation</p>
									<p className="text-sm opacity-75">Schedule a meeting</p>
								</div>
							</button>

							<button
								className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${
									highContrastMode
										? "bg-white border border-black hover:bg-gray-100"
										: "bg-white hover:bg-gray-50"
								}`}
							>
								<Heart className="w-5 h-5" />
								<div>
									<p className="font-medium">EAP/Counseling</p>
									<p className="text-sm opacity-75">
										Access professional support
									</p>
								</div>
							</button>

							<button
								className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${
									highContrastMode
										? "bg-white border border-black hover:bg-gray-100"
										: "bg-white hover:bg-gray-50"
								}`}
							>
								<Users className="w-5 h-5" />
								<div>
									<p className="font-medium">Team debrief</p>
									<p className="text-sm opacity-75">Request group support</p>
								</div>
							</button>

							<button
								className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${
									highContrastMode
										? "bg-white border border-black hover:bg-gray-100"
										: "bg-white hover:bg-gray-50"
								}`}
							>
								<Shield className="w-5 h-5" />
								<div>
									<p className="font-medium">Day off</p>
									<p className="text-sm opacity-75">Consider if needed</p>
								</div>
							</button>
						</div>
					</div>

					{/* Important reminder */}
					<div
						className={`mb-8 p-4 rounded-lg ${
							highContrastMode
								? "bg-yellow-100 border-2 border-black"
								: "bg-green-50"
						}`}
					>
						<p
							className={`${getTextSize()} font-medium mb-2 ${
								highContrastMode ? "text-black" : "text-green-900"
							}`}
						>
							Remember:
						</p>
						<p
							className={`${getTextSize()} ${highContrastMode ? "text-black" : "text-green-800"}`}
						>
							Secondary trauma is real. Seeking support is professional, not
							personal weakness. Your wellbeing directly impacts your ability to
							serve effectively.
						</p>
					</div>

					{/* Action buttons */}
					<div className="flex gap-3">
						<button
							onClick={handleSubmit}
							className={`flex-1 py-3 rounded-lg font-semibold ${
								highContrastMode
									? "bg-black text-white hover:bg-gray-800"
									: "bg-blue-600 text-white hover:bg-blue-700"
							}`}
						>
							Complete & Close
						</button>
						<button
							onClick={() => setPhase("checkin")}
							className={`px-6 py-3 rounded-lg font-medium ${
								highContrastMode
									? "bg-gray-200 border-2 border-black hover:bg-gray-300"
									: "bg-gray-100 hover:bg-gray-200"
							}`}
						>
							Back
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
