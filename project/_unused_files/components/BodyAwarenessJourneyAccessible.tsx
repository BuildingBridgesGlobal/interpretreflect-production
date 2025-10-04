import { Pause, Play, Settings, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface BodyAwarenessJourneyAccessibleProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

type MovementMode =
	| "top-to-bottom"
	| "single-area"
	| "jump-around"
	| "whole-body";
type FeelingLevel = "strong" | "light" | "figure-out";
type GuidanceLevel = "full" | "little" | "myself";
type PracticeWay = "move" | "picture" | "breathe" | "touch" | "still";

const bodyParts = [
	{
		id: "head",
		name: "Head and Face",
		instruction: "Notice your head and face - relax them if it feels good",
	},
	{
		id: "shoulders",
		name: "Shoulders",
		instruction: "Check your shoulders - move or adjust them if you want",
		note: "Many people hold stress here",
	},
	{
		id: "chest",
		name: "Chest area",
		instruction: "Feel your chest area - breathe in a comfortable way",
	},
	{
		id: "belly",
		name: "Belly",
		instruction: "Notice your belly - let it be soft if that's okay",
	},
	{
		id: "legs",
		name: "Legs and Feet",
		instruction:
			"Feel your legs and feet - relax them or keep them as they are",
	},
];

export const BodyAwarenessJourneyAccessible: React.FC<
	BodyAwarenessJourneyAccessibleProps
> = ({ onClose, onComplete }) => {
	// Core states
	const [phase, setPhase] = useState<"start" | "practice" | "finish">("start");
	const [isPlaying, setIsPlaying] = useState(false);
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [selectedTime, setSelectedTime] = useState(60);
	const [currentPartIndex, setCurrentPartIndex] = useState(0);
	const [showSettings, setShowSettings] = useState(false);

	// Settings
	const [movementMode, setMovementMode] =
		useState<MovementMode>("top-to-bottom");
	const [feelingLevel, setFeelingLevel] = useState<FeelingLevel>("figure-out");
	const [guidanceLevel, setGuidanceLevel] = useState<GuidanceLevel>("full");
	const [practiceWay, setPracticeWay] = useState<PracticeWay>("move");
	const [highContrast, setHighContrast] = useState(false);
	const [largeText, setLargeText] = useState(false);
	const [simpleMode, setSimpleMode] = useState(false);

	// After practice
	const [bodyFeeling, setBodyFeeling] = useState("");
	const [whatNoticed, setWhatNoticed] = useState<string[]>([]);
	const [energyLevel, setEnergyLevel] = useState(5);
	const [calmLevel, setCalmLevel] = useState(5);
	const [focusLevel, setFocusLevel] = useState(5);
	const [nextTimeChange, setNextTimeChange] = useState("");
	const [focusAreas, setFocusAreas] = useState("");
	const [comfortableArea, setComfortableArea] = useState("");
	const [rememberSettings, setRememberSettings] = useState(false);
	const [trackProgress, setTrackProgress] = useState(false);
	const [setReminder, setSetReminder] = useState(false);
	const [reminderTime, setReminderTime] = useState("tomorrow");

	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Load saved settings
	useEffect(() => {
		const saved = localStorage.getItem("bodyAwarenessSettings");
		if (saved) {
			const settings = JSON.parse(saved);
			setMovementMode(settings.movementMode || "top-to-bottom");
			setFeelingLevel(settings.feelingLevel || "figure-out");
			setGuidanceLevel(settings.guidanceLevel || "full");
			setHighContrast(settings.highContrast || false);
			setLargeText(settings.largeText || false);
			setSimpleMode(settings.simpleMode || false);
		}

		// Check for system preferences
		if (
			window.matchMedia &&
			window.matchMedia("(prefers-contrast: high)").matches
		) {
			setHighContrast(true);
		}
		if (
			window.matchMedia &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			setSimpleMode(true);
		}
	}, []);

	// Timer
	useEffect(() => {
		if (isPlaying && phase === "practice") {
			intervalRef.current = setInterval(() => {
				setTimeElapsed((prev) => {
					const next = prev + 1;

					// Move to next part if in sequential mode
					if (movementMode === "top-to-bottom") {
						const timePerPart = selectedTime / bodyParts.length;
						const nextIndex = Math.floor(next / timePerPart);
						if (
							nextIndex !== currentPartIndex &&
							nextIndex < bodyParts.length
						) {
							setCurrentPartIndex(nextIndex);

							// Vibrate if available
							if ("vibrate" in navigator) {
								navigator.vibrate(100);
							}
						}
					}

					// Check if done
					if (next >= selectedTime) {
						handleFinish();
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
	}, [isPlaying, phase, selectedTime, movementMode, currentPartIndex]);

	const handleStart = () => {
		setPhase("practice");
		setIsPlaying(true);
		setTimeElapsed(0);
		setCurrentPartIndex(0);

		// Announce to screen reader
		announceToScreenReader("Starting body awareness journey");

		// Vibrate if available
		if ("vibrate" in navigator) {
			navigator.vibrate(200);
		}
	};

	const handlePause = () => {
		setIsPlaying(!isPlaying);
		announceToScreenReader(isPlaying ? "Paused" : "Continuing");

		if ("vibrate" in navigator) {
			navigator.vibrate([50, 50, 50]);
		}
	};

	const handleFinish = () => {
		setIsPlaying(false);
		setPhase("finish");
		announceToScreenReader("Practice complete");

		if ("vibrate" in navigator) {
			navigator.vibrate([100, 50, 100, 50, 100]);
		}
	};

	const handleComplete = () => {
		// Save settings if requested
		if (rememberSettings) {
			localStorage.setItem(
				"bodyAwarenessSettings",
				JSON.stringify({
					movementMode,
					feelingLevel,
					guidanceLevel,
					highContrast,
					largeText,
					simpleMode,
				}),
			);
		}

		// Track progress if requested
		if (trackProgress) {
			const sessions = JSON.parse(
				localStorage.getItem("bodyAwarenessSessions") || "[]",
			);
			sessions.push({
				date: new Date().toISOString(),
				duration: timeElapsed,
				bodyFeeling,
				whatNoticed,
				energyLevel,
				calmLevel,
				focusLevel,
				focusAreas,
				comfortableArea,
			});
			localStorage.setItem("bodyAwarenessSessions", JSON.stringify(sessions));
		}

		if (onComplete) {
			onComplete({
				duration: timeElapsed,
				bodyFeeling,
				whatNoticed,
				energyLevel,
				calmLevel,
				focusLevel,
				nextTimeChange,
				focusAreas,
				comfortableArea,
			});
		}

		onClose();
	};

	const announceToScreenReader = (message: string) => {
		const announcement = document.createElement("div");
		announcement.setAttribute("role", "status");
		announcement.setAttribute("aria-live", "polite");
		announcement.className = "sr-only";
		announcement.textContent = message;
		document.body.appendChild(announcement);
		setTimeout(() => document.body.removeChild(announcement), 1000);
	};

	const getProgress = () => {
		return Math.min((timeElapsed / selectedTime) * 100, 100);
	};

	const getCurrentPart = () => {
		if (movementMode === "whole-body") return "Whole body at once";
		if (movementMode === "jump-around") return "Go wherever you want";
		if (movementMode === "single-area") return "Stay with one area";
		return bodyParts[currentPartIndex]?.name || "Getting ready";
	};

	const getCurrentInstruction = () => {
		if (guidanceLevel === "myself") return "Check in with your body";
		if (guidanceLevel === "little") return "Notice how you feel";

		if (movementMode === "whole-body") {
			return "Feel your whole body all at once";
		}
		if (movementMode === "jump-around") {
			return "Move your attention wherever it wants to go";
		}
		if (movementMode === "single-area") {
			return "Stay with the area that needs attention";
		}

		return (
			bodyParts[currentPartIndex]?.instruction ||
			"Take a moment to get comfortable"
		);
	};

	const getCurrentNote = () => {
		if (movementMode !== "top-to-bottom" || guidanceLevel === "myself")
			return null;
		return bodyParts[currentPartIndex]?.note;
	};

	const getTextSize = () => {
		if (largeText) return "text-xl";
		if (simpleMode) return "text-lg";
		return "text-base";
	};

	const getButtonClass = (isSelected = false) => {
		const base = `px-4 py-3 rounded-lg font-medium transition-all min-h-[44px] ${getTextSize()}`;
		if (highContrast) {
			return `${base} ${isSelected ? "bg-black text-white border-2 border-black" : "bg-white text-black border-2 border-black hover:bg-gray-100"}`;
		}
		return `${base} ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`;
	};

	const getContainerClass = () => {
		if (highContrast) {
			return "bg-white text-black border-4 border-black";
		}
		return "bg-white";
	};

	// Start screen
	if (phase === "start") {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div
					className={`rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${getContainerClass()}`}
				>
					<div className="p-6 md:p-8">
						{/* Header */}
						<div className="flex justify-between items-start mb-6">
							<div>
								<h1
									className={`text-2xl md:text-3xl font-bold mb-2 ${highContrast ? "text-black" : "text-gray-900"}`}
								>
									Body Awareness Journey
								</h1>
								<p
									className={`${getTextSize()} ${highContrast ? "text-black" : "text-gray-600"}`}
								>
									Check in with your body
								</p>
							</div>
							<button
								onClick={onClose}
								className="p-2 hover:bg-gray-100 rounded-lg"
								aria-label="Close"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						{/* Time selection */}
						<div className="mb-8">
							<label
								className={`block mb-3 font-medium ${getTextSize()} ${highContrast ? "text-black" : "text-gray-700"}`}
							>
								How long:
							</label>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
								{[
									{ seconds: 30, label: "30 seconds" },
									{ seconds: 60, label: "1 minute" },
									{ seconds: 120, label: "2 minutes" },
									{ seconds: 180, label: "3 minutes" },
								].map((time) => (
									<button
										key={time.seconds}
										onClick={() => setSelectedTime(time.seconds)}
										className={getButtonClass(selectedTime === time.seconds)}
										aria-pressed={selectedTime === time.seconds}
									>
										{time.label}
									</button>
								))}
							</div>
						</div>

						{/* Current setting */}
						<div
							className={`mb-8 p-4 rounded-lg ${highContrast ? "bg-gray-100 border-2 border-black" : "bg-blue-50"}`}
						>
							<p className={`font-medium mb-2 ${getTextSize()}`}>
								Starting with:
							</p>
							<p
								className={`text-lg font-bold ${highContrast ? "text-black" : "text-blue-900"}`}
							>
								{movementMode === "top-to-bottom"
									? "Head and Face"
									: movementMode === "single-area"
										? "One area you choose"
										: movementMode === "jump-around"
											? "Wherever you want"
											: "Your whole body"}
							</p>
							<p
								className={`mt-2 ${getTextSize()} ${highContrast ? "text-black" : "text-gray-700"}`}
							>
								Begin when ready
							</p>
						</div>

						{/* How to practice */}
						{!simpleMode && (
							<div className="mb-8">
								<h2 className={`font-medium mb-3 ${getTextSize()}`}>
									Check each part of your body:
								</h2>
								<ul
									className={`space-y-2 ${getTextSize()} ${highContrast ? "text-black" : "text-gray-700"}`}
								>
									{bodyParts.map((part) => (
										<li key={part.id}>• {part.instruction}</li>
									))}
								</ul>
							</div>
						)}

						{/* Practice ways */}
						{!simpleMode && (
							<div className="mb-8">
								<h2 className={`font-medium mb-3 ${getTextSize()}`}>
									Choose how to practice:
								</h2>
								<div className="space-y-2">
									{[
										{
											id: "move",
											label: "Move",
											desc: "Adjust, rock, or stretch parts of your body",
										},
										{
											id: "picture",
											label: "Picture",
											desc: "Imagine warmth or light in each area",
										},
										{
											id: "breathe",
											label: "Breathe",
											desc: "Send your breath to different areas",
										},
										{
											id: "touch",
											label: "Touch",
											desc: "Press or tap on your body if you want",
										},
										{
											id: "still",
											label: "Stay still",
											desc: "Just notice without moving",
										},
									].map((way) => (
										<div
											key={way.id}
											className={`p-3 rounded-lg ${highContrast ? "border border-black" : "bg-gray-50"}`}
										>
											<strong className={getTextSize()}>{way.label}</strong>
											<span
												className={`ml-2 ${getTextSize()} ${highContrast ? "text-black" : "text-gray-600"}`}
											>
												- {way.desc}
											</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Why this helps */}
						<div
							className={`mb-8 p-4 rounded-lg ${highContrast ? "bg-yellow-100 border-2 border-black" : "bg-green-50"}`}
						>
							<h2 className={`font-medium mb-2 ${getTextSize()}`}>
								Why this helps:
							</h2>
							<p
								className={`${getTextSize()} ${highContrast ? "text-black" : "text-green-900"}`}
							>
								Paying attention to your body helps your brain get better at
								noticing feelings and managing stress.
							</p>
						</div>

						{/* If you need to change something */}
						<div
							className={`mb-8 p-4 rounded-lg ${highContrast ? "bg-gray-100 border-2 border-black" : "bg-amber-50"}`}
						>
							<h2 className={`font-medium mb-2 ${getTextSize()}`}>
								If you need to change something:
							</h2>
							<ul
								className={`space-y-1 ${getTextSize()} ${highContrast ? "text-black" : "text-amber-900"}`}
							>
								<li>• Can't move some areas? Just think about them</li>
								<li>• Have pain? Don't try to change it - just notice</li>
								<li>• Need to move around? That's okay</li>
								<li>• Want to skip parts? Go ahead</li>
								<li>• Like to rock or fidget? That can be part of this</li>
							</ul>
						</div>

						{/* Good to know */}
						{!simpleMode && (
							<div className="mb-8">
								<h2 className={`font-medium mb-2 ${getTextSize()}`}>
									Good to know:
								</h2>
								<ul
									className={`space-y-1 ${getTextSize()} ${highContrast ? "text-black" : "text-gray-700"}`}
								>
									<li>• Keep any tension that helps you feel safe</li>
									<li>• Skip any body part you don't want to think about</li>
									<li>• Sometimes being tense is helpful - that's okay</li>
									<li>• Your body knows what it needs</li>
									<li>• Stop anytime you want</li>
								</ul>
							</div>
						)}

						{/* Action buttons */}
						<div className="flex gap-3">
							<button
								onClick={handleStart}
								className={`flex-1 ${getButtonClass(true)}`}
							>
								Start
							</button>
							<button
								onClick={() => setShowSettings(!showSettings)}
								className={getButtonClass()}
							>
								<Settings className="w-5 h-5 inline mr-2" />
								Change Settings
							</button>
						</div>

						{/* Settings panel */}
						{showSettings && (
							<div
								className={`mt-6 p-6 rounded-lg ${highContrast ? "bg-gray-100 border-2 border-black" : "bg-gray-50"}`}
							>
								<h2
									className={`text-xl font-bold mb-4 ${highContrast ? "text-black" : "text-gray-900"}`}
								>
									Settings Menu
								</h2>

								{/* Movement mode */}
								<div className="mb-6">
									<label className={`block mb-3 font-medium ${getTextSize()}`}>
										How do you want to move through your body?
									</label>
									<div className="space-y-2">
										{[
											{
												id: "top-to-bottom" as MovementMode,
												label: "Top to bottom (head to feet)",
											},
											{
												id: "single-area" as MovementMode,
												label: "Stay with one area",
											},
											{
												id: "jump-around" as MovementMode,
												label: "Jump around",
											},
											{
												id: "whole-body" as MovementMode,
												label: "Whole body at once",
											},
										].map((mode) => (
											<label key={mode.id} className="flex items-center">
												<input
													type="radio"
													name="movementMode"
													checked={movementMode === mode.id}
													onChange={() => setMovementMode(mode.id)}
													className="mr-3"
												/>
												<span className={getTextSize()}>{mode.label}</span>
											</label>
										))}
									</div>
								</div>

								{/* Feeling level */}
								<div className="mb-6">
									<label className={`block mb-3 font-medium ${getTextSize()}`}>
										How much do you want to feel?
									</label>
									<div className="space-y-2">
										{[
											{
												id: "strong" as FeelingLevel,
												label: "Strong feelings (more pressure/movement)",
											},
											{
												id: "light" as FeelingLevel,
												label: "Light feelings (gentle/calm)",
											},
											{
												id: "figure-out" as FeelingLevel,
												label: "I'll figure it out as I go",
											},
										].map((level) => (
											<label key={level.id} className="flex items-center">
												<input
													type="radio"
													name="feelingLevel"
													checked={feelingLevel === level.id}
													onChange={() => setFeelingLevel(level.id)}
													className="mr-3"
												/>
												<span className={getTextSize()}>{level.label}</span>
											</label>
										))}
									</div>
								</div>

								{/* Guidance level */}
								<div className="mb-6">
									<label className={`block mb-3 font-medium ${getTextSize()}`}>
										How much help do you want?
									</label>
									<div className="space-y-2">
										{[
											{
												id: "full" as GuidanceLevel,
												label: "Tell me what to do",
											},
											{
												id: "little" as GuidanceLevel,
												label: "Just a little guidance",
											},
											{
												id: "myself" as GuidanceLevel,
												label: "Let me do it myself",
											},
										].map((level) => (
											<label key={level.id} className="flex items-center">
												<input
													type="radio"
													name="guidanceLevel"
													checked={guidanceLevel === level.id}
													onChange={() => setGuidanceLevel(level.id)}
													className="mr-3"
												/>
												<span className={getTextSize()}>{level.label}</span>
											</label>
										))}
									</div>
								</div>

								{/* Accessibility options */}
								<div className="mb-6">
									<label className={`block mb-3 font-medium ${getTextSize()}`}>
										Display options:
									</label>
									<div className="space-y-2">
										<label className="flex items-center">
											<input
												type="checkbox"
												checked={highContrast}
												onChange={(e) => setHighContrast(e.target.checked)}
												className="mr-3"
											/>
											<span className={getTextSize()}>High contrast</span>
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
										<label className="flex items-center">
											<input
												type="checkbox"
												checked={simpleMode}
												onChange={(e) => setSimpleMode(e.target.checked)}
												className="mr-3"
											/>
											<span className={getTextSize()}>
												Simple mode (less information)
											</span>
										</label>
									</div>
								</div>

								<div className="flex gap-3">
									<button
										onClick={() => {
											setShowSettings(false);
											announceToScreenReader("Settings saved");
										}}
										className={getButtonClass(true)}
									>
										Save These Settings
									</button>
									<button
										onClick={() => setShowSettings(false)}
										className={getButtonClass()}
									>
										Go Back
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	// Practice screen
	if (phase === "practice") {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div
					className={`rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${getContainerClass()}`}
				>
					<div className="p-6 md:p-8">
						{/* Header */}
						<div className="flex justify-between items-center mb-6">
							<h2
								className={`text-xl md:text-2xl font-bold ${highContrast ? "text-black" : "text-gray-900"}`}
							>
								Now: {getCurrentPart()}
							</h2>
							<button
								onClick={onClose}
								className="p-2 hover:bg-gray-100 rounded-lg"
								aria-label="Close"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						{/* Note if available */}
						{getCurrentNote() && (
							<p
								className={`mb-4 ${getTextSize()} ${highContrast ? "text-black" : "text-gray-600"}`}
							>
								{getCurrentNote()}
							</p>
						)}

						{/* Main instruction */}
						<div
							className={`mb-8 p-8 rounded-xl text-center ${
								highContrast
									? "bg-gray-100 border-2 border-black"
									: "bg-blue-50"
							}`}
						>
							<p
								className={`text-lg md:text-xl ${highContrast ? "text-black font-bold" : "text-gray-800"}`}
							>
								{getCurrentInstruction()}
							</p>
						</div>

						{/* Simple body outline */}
						<div className="mb-8 flex justify-center" aria-hidden="true">
							<svg
								width="150"
								height="250"
								viewBox="0 0 150 250"
								className="max-w-full"
							>
								{/* Head */}
								<circle
									cx="75"
									cy="35"
									r="25"
									fill={
										currentPartIndex === 0 && movementMode === "top-to-bottom"
											? highContrast
												? "#000000"
												: "#3B82F6"
											: highContrast
												? "#FFFFFF"
												: "#E5E7EB"
									}
									stroke={highContrast ? "#000000" : "#9CA3AF"}
									strokeWidth="2"
								/>

								{/* Body */}
								<rect
									x="50"
									y="60"
									width="50"
									height="80"
									fill={
										(currentPartIndex === 2 || currentPartIndex === 3) &&
										movementMode === "top-to-bottom"
											? highContrast
												? "#000000"
												: "#3B82F6"
											: highContrast
												? "#FFFFFF"
												: "#E5E7EB"
									}
									stroke={highContrast ? "#000000" : "#9CA3AF"}
									strokeWidth="2"
								/>

								{/* Shoulders/Arms */}
								<line
									x1="50"
									y1="80"
									x2="20"
									y2="120"
									stroke={
										currentPartIndex === 1 && movementMode === "top-to-bottom"
											? highContrast
												? "#000000"
												: "#3B82F6"
											: highContrast
												? "#000000"
												: "#9CA3AF"
									}
									strokeWidth="3"
								/>
								<line
									x1="100"
									y1="80"
									x2="130"
									y2="120"
									stroke={
										currentPartIndex === 1 && movementMode === "top-to-bottom"
											? highContrast
												? "#000000"
												: "#3B82F6"
											: highContrast
												? "#000000"
												: "#9CA3AF"
									}
									strokeWidth="3"
								/>

								{/* Legs */}
								<line
									x1="65"
									y1="140"
									x2="55"
									y2="220"
									stroke={
										currentPartIndex === 4 && movementMode === "top-to-bottom"
											? highContrast
												? "#000000"
												: "#3B82F6"
											: highContrast
												? "#000000"
												: "#9CA3AF"
									}
									strokeWidth="3"
								/>
								<line
									x1="85"
									y1="140"
									x2="95"
									y2="220"
									stroke={
										currentPartIndex === 4 && movementMode === "top-to-bottom"
											? highContrast
												? "#000000"
												: "#3B82F6"
											: highContrast
												? "#000000"
												: "#9CA3AF"
									}
									strokeWidth="3"
								/>
							</svg>
						</div>

						{/* Progress */}
						<div className="mb-6">
							<div className="flex items-center justify-between mb-2">
								<span className={`${getTextSize()} font-medium`}>
									Progress:
								</span>
								<span className={`${getTextSize()}`}>
									{Math.floor(timeElapsed / 60)}:
									{(timeElapsed % 60).toString().padStart(2, "0")}
								</span>
							</div>
							<div
								className="flex gap-1"
								role="progressbar"
								aria-valuenow={getProgress()}
								aria-valuemin={0}
								aria-valuemax={100}
							>
								{[...Array(10)].map((_, i) => (
									<div
										key={i}
										className={`h-4 flex-1 rounded ${
											i < Math.floor(getProgress() / 10)
												? highContrast
													? "bg-black"
													: "bg-blue-600"
												: highContrast
													? "bg-gray-300 border border-black"
													: "bg-gray-200"
										}`}
									/>
								))}
							</div>
							<p className="sr-only">{Math.round(getProgress())}% complete</p>
						</div>

						{/* Control buttons */}
						<div className="flex gap-3">
							<button
								onClick={handlePause}
								className={`flex-1 ${getButtonClass(true)}`}
								aria-label={isPlaying ? "Pause" : "Continue"}
							>
								{isPlaying ? (
									<>
										<Pause className="w-5 h-5 inline mr-2" />
										Pause
									</>
								) : (
									<>
										<Play className="w-5 h-5 inline mr-2" />
										Continue
									</>
								)}
							</button>
							<button onClick={handleFinish} className={getButtonClass()}>
								Finish Early
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Finish screen
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div
				className={`rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${getContainerClass()}`}
			>
				<div className="p-6 md:p-8">
					<h2
						className={`text-2xl md:text-3xl font-bold mb-6 ${highContrast ? "text-black" : "text-gray-900"}`}
					>
						How did your body feel?
					</h2>

					{/* Body feeling */}
					<div className="mb-6">
						<label className={`block mb-3 font-medium ${getTextSize()}`}>
							How did your body feel?
						</label>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
							{[
								"More relaxed",
								"More aware",
								"About the same",
								"Uncomfortable",
								"Something else",
							].map((feeling) => (
								<button
									key={feeling}
									onClick={() => setBodyFeeling(feeling)}
									className={getButtonClass(bodyFeeling === feeling)}
									aria-pressed={bodyFeeling === feeling}
								>
									{feeling}
								</button>
							))}
						</div>
						{bodyFeeling === "Something else" && (
							<input
								type="text"
								placeholder="Write here..."
								className={`mt-2 w-full p-3 border rounded-lg ${getTextSize()} ${
									highContrast ? "border-black" : "border-gray-300"
								}`}
								onChange={(e) => setBodyFeeling(e.target.value)}
								aria-label="Describe how your body felt"
							/>
						)}
					</div>

					{/* What noticed */}
					<div className="mb-6">
						<label className={`block mb-3 font-medium ${getTextSize()}`}>
							What did you notice?
						</label>
						<div className="space-y-2">
							{[
								"Where I feel tense",
								"What felt good",
								"What needs attention",
								"Something surprising",
								"Something else",
							].map((notice) => (
								<label key={notice} className="flex items-center">
									<input
										type="checkbox"
										checked={whatNoticed.includes(notice)}
										onChange={(e) => {
											if (e.target.checked) {
												setWhatNoticed([...whatNoticed, notice]);
											} else {
												setWhatNoticed(whatNoticed.filter((n) => n !== notice));
											}
										}}
										className="mr-3"
									/>
									<span className={getTextSize()}>{notice}</span>
								</label>
							))}
						</div>
					</div>

					{/* How you feel now */}
					<div className="mb-6">
						<h3 className={`font-medium mb-4 ${getTextSize()}`}>
							How do you feel now?
						</h3>
						<div className="space-y-4">
							<div>
								<div className="flex justify-between mb-2">
									<span className={getTextSize()}>Energy:</span>
									<span className={`font-medium ${getTextSize()}`}>
										{energyLevel === 1
											? "Low"
											: energyLevel === 10
												? "High"
												: energyLevel}
									</span>
								</div>
								<input
									type="range"
									min="1"
									max="10"
									value={energyLevel}
									onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
									className="w-full"
									aria-label="Energy level from 1 to 10"
								/>
							</div>

							<div>
								<div className="flex justify-between mb-2">
									<span className={getTextSize()}>Calm:</span>
									<span className={`font-medium ${getTextSize()}`}>
										{calmLevel === 1
											? "Low"
											: calmLevel === 10
												? "High"
												: calmLevel}
									</span>
								</div>
								<input
									type="range"
									min="1"
									max="10"
									value={calmLevel}
									onChange={(e) => setCalmLevel(parseInt(e.target.value))}
									className="w-full"
									aria-label="Calm level from 1 to 10"
								/>
							</div>

							<div>
								<div className="flex justify-between mb-2">
									<span className={getTextSize()}>Focus:</span>
									<span className={`font-medium ${getTextSize()}`}>
										{focusLevel === 1
											? "Low"
											: focusLevel === 10
												? "High"
												: focusLevel}
									</span>
								</div>
								<input
									type="range"
									min="1"
									max="10"
									value={focusLevel}
									onChange={(e) => setFocusLevel(parseInt(e.target.value))}
									className="w-full"
									aria-label="Focus level from 1 to 10"
								/>
							</div>
						</div>
					</div>

					{/* Next time changes */}
					<div className="mb-6">
						<label className={`block mb-3 font-medium ${getTextSize()}`}>
							Want to change anything next time?
						</label>
						<div className="space-y-2">
							{[
								"Focus on certain areas",
								"Try a different way",
								"Make it longer or shorter",
								"Keep it the same",
								"Something else",
							].map((change) => (
								<button
									key={change}
									onClick={() => setNextTimeChange(change)}
									className={`block w-full text-left ${getButtonClass(nextTimeChange === change)}`}
									aria-pressed={nextTimeChange === change}
								>
									{change}
								</button>
							))}
						</div>
						{nextTimeChange === "Focus on certain areas" && (
							<input
								type="text"
								placeholder="Write here..."
								className={`mt-2 w-full p-3 border rounded-lg ${getTextSize()} ${
									highContrast ? "border-black" : "border-gray-300"
								}`}
								value={focusAreas}
								onChange={(e) => setFocusAreas(e.target.value)}
								aria-label="Which areas to focus on"
							/>
						)}
					</div>

					{/* What we noticed */}
					{timeElapsed > 30 && (
						<div
							className={`mb-6 p-4 rounded-lg ${
								highContrast
									? "bg-gray-100 border-2 border-black"
									: "bg-blue-50"
							}`}
						>
							<h3 className={`font-medium mb-2 ${getTextSize()}`}>
								What we noticed:
							</h3>
							<p
								className={`${getTextSize()} ${highContrast ? "text-black" : "text-gray-700"}`}
							>
								{movementMode === "top-to-bottom" && currentPartIndex >= 1
									? "You spent more time on your shoulders. Many people hold stress there. Checking in regularly can help."
									: "You took time to check in with your body. This helps your brain get better at noticing how you feel."}
							</p>
						</div>
					)}

					{/* Comfortable area */}
					<div className="mb-6">
						<label className={`block mb-2 ${getTextSize()}`}>
							Where feels most comfortable now? (optional)
						</label>
						<input
							type="text"
							placeholder="Write here..."
							className={`w-full p-3 border rounded-lg ${getTextSize()} ${
								highContrast ? "border-black" : "border-gray-300"
							}`}
							value={comfortableArea}
							onChange={(e) => setComfortableArea(e.target.value)}
						/>
					</div>

					{/* Save options */}
					<div className="mb-6 space-y-2">
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={rememberSettings}
								onChange={(e) => setRememberSettings(e.target.checked)}
								className="mr-3"
							/>
							<span className={getTextSize()}>Remember what worked for me</span>
						</label>
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={trackProgress}
								onChange={(e) => setTrackProgress(e.target.checked)}
								className="mr-3"
							/>
							<span className={getTextSize()}>
								Track how my body feels over time
							</span>
						</label>
						<div className="flex items-center">
							<input
								type="checkbox"
								checked={setReminder}
								onChange={(e) => setSetReminder(e.target.checked)}
								className="mr-3"
							/>
							<span className={getTextSize()}>Remind me to practice again</span>
							{setReminder && (
								<select
									value={reminderTime}
									onChange={(e) => setReminderTime(e.target.value)}
									className={`ml-3 px-3 py-1 border rounded ${getTextSize()} ${
										highContrast ? "border-black" : "border-gray-300"
									}`}
									aria-label="When to remind"
								>
									<option value="tomorrow">Tomorrow</option>
									<option value="2days">In 2 days</option>
									<option value="week">In a week</option>
								</select>
							)}
						</div>
					</div>

					{/* Action buttons */}
					<div className="flex gap-3">
						<button
							onClick={handleComplete}
							className={`flex-1 ${getButtonClass(true)}`}
						>
							Done
						</button>
						<button
							onClick={() => {
								setPhase("start");
								setTimeElapsed(0);
								setCurrentPartIndex(0);
							}}
							className={getButtonClass()}
						>
							Try Again
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
