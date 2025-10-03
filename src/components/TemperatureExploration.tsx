import {
	Brain,
	ChevronRight,
	Circle,
	Contrast,
	Droplets,
	Eye,
	Hand,
	Pause,
	Play,
	RotateCcw,
	Settings,
	Shield,
	Sparkles,
	Sun,
	Thermometer,
	Vibrate,
	Wind,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface TemperatureExplorationProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

type ApproachType = "cool" | "warm" | "neutral" | "contrast" | "imaginative";
type ExplorationMethod =
	| "physical"
	| "imaginative"
	| "breath"
	| "sensory"
	| "none";
type IntensityLevel = "gentle" | "moderate" | "intense" | "none";
type DurationOption = "10s" | "30s" | "1m" | "2m" | "complete";

export const TemperatureExploration: React.FC<TemperatureExplorationProps> = ({
	onClose,
	onComplete,
}) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentPhase, setCurrentPhase] = useState<
		"exploring" | "resting" | "stopped"
	>("stopped");
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [selectedApproach, setSelectedApproach] =
		useState<ApproachType>("neutral");
	const [selectedMethod, setSelectedMethod] =
		useState<ExplorationMethod>("none");
	const [selectedDuration, setSelectedDuration] =
		useState<DurationOption>("30s");
	const [showPostPractice, setShowPostPractice] = useState(false);
	const [showSettings, setShowSettings] = useState(false);

	// Accessibility states
	const [highContrastMode, setHighContrastMode] = useState(false);
	const [vibrationEnabled, setVibrationEnabled] = useState(false);
	const [visualTimer, setVisualTimer] = useState(true);
	const [simplifiedMode, setSimplifiedMode] = useState(false);
	const [audioDescriptions, setAudioDescriptions] = useState(false);

	// Neurodivergent options
	const [neurodivergentMode, setNeurodivergentMode] = useState(false);
	const [routineMode, setRoutineMode] = useState<
		"predictable" | "experimenting" | "minimal" | "none"
	>("none");
	const [sensoryPreference, setensoryPreference] = useState<
		"seeking" | "avoiding" | "balanced"
	>("balanced");
	const [intensityPreference, setIntensityPreference] =
		useState<IntensityLevel>("moderate");

	// Post-practice states
	const [exploredToday, setExploredToday] = useState<string[]>([]);
	const [effectExperienced, setEffectExperienced] = useState("");
	const [sensoryExperience, setSensoryExperience] = useState("");
	const [helpfulAspects, setHelpfulAspects] = useState<string[]>([]);
	const [nextTimePreference, setNextTimePreference] = useState("");
	const [sensoryNeeds, setSensoryNeeds] = useState("");

	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Load saved preferences
	useEffect(() => {
		const savedPrefs = localStorage.getItem("temperaturePrefs");
		if (savedPrefs) {
			const prefs = JSON.parse(savedPrefs);
			setHighContrastMode(prefs.highContrast || false);
			setVibrationEnabled(prefs.vibration || false);
			setVisualTimer(prefs.visualTimer !== false);
			setSimplifiedMode(prefs.simplified || false);
			setAudioDescriptions(prefs.audio || false);
			setNeurodivergentMode(prefs.neurodivergent || false);
			setRoutineMode(prefs.routine || "none");
			setSensoryPreference(prefs.sensory || "balanced");
			setIntensityPreference(prefs.intensity || "moderate");
			if (prefs.approach) setSelectedApproach(prefs.approach);
			if (prefs.duration) setSelectedDuration(prefs.duration);
		}
	}, []);

	// Timer effect
	useEffect(() => {
		if (isPlaying) {
			intervalRef.current = setInterval(() => {
				setTimeElapsed((prev) => {
					const next = prev + 1;

					// Check if duration is reached
					const durationSeconds = {
						"10s": 10,
						"30s": 30,
						"1m": 60,
						"2m": 120,
						complete: -1,
					}[selectedDuration];

					if (durationSeconds > 0 && next >= durationSeconds) {
						handleComplete();
					}

					return next;
				});
			}, 1000);
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isPlaying, selectedDuration]);

	const handleStart = () => {
		setIsPlaying(true);
		setCurrentPhase("exploring");
		setTimeElapsed(0);

		if (vibrationEnabled && "vibrate" in navigator) {
			navigator.vibrate(200);
		}
	};

	const handlePause = () => {
		setIsPlaying(false);
		setCurrentPhase("resting");

		if (vibrationEnabled && "vibrate" in navigator) {
			navigator.vibrate([100, 50, 100]);
		}
	};

	const handleComplete = () => {
		setIsPlaying(false);
		setCurrentPhase("stopped");

		if (vibrationEnabled && "vibrate" in navigator) {
			navigator.vibrate([100, 50, 100, 50, 100]);
		}

		setShowPostPractice(true);
	};

	const handleReset = () => {
		setIsPlaying(false);
		setCurrentPhase("stopped");
		setTimeElapsed(0);
		setShowPostPractice(false);
	};

	const handleSavePreferences = () => {
		const prefs = {
			highContrast: highContrastMode,
			vibration: vibrationEnabled,
			visualTimer,
			simplified: simplifiedMode,
			audio: audioDescriptions,
			neurodivergent: neurodivergentMode,
			routine: routineMode,
			sensory: sensoryPreference,
			intensity: intensityPreference,
			approach: selectedApproach,
			duration: selectedDuration,
		};
		localStorage.setItem("temperaturePrefs", JSON.stringify(prefs));
		setShowSettings(false);
	};

	const handlePostPracticeSubmit = () => {
		const data = {
			approach: selectedApproach,
			method: selectedMethod,
			duration: timeElapsed,
			exploredToday,
			effectExperienced,
			sensoryExperience,
			helpfulAspects,
			nextTimePreference,
			sensoryNeeds,
			timestamp: new Date().toISOString(),
		};

		if (onComplete) onComplete(data);
		onClose();
	};

	const getPhaseColor = () => {
		if (highContrastMode) {
			return selectedApproach === "cool"
				? "#000080"
				: selectedApproach === "warm"
					? "#800000"
					: "#404040";
		}
		return selectedApproach === "cool"
			? "#3B82F6"
			: selectedApproach === "warm"
				? "#EF4444"
				: "#6B7280";
	};

	const getTemperatureGradient = () => {
		// Not used anymore - replaced with solid colors for WCAG AA compliance
		if (selectedApproach === "cool") {
			return "linear-gradient(90deg, #DBEAFE 0%, #93C5FD 50%, #3B82F6 100%)";
		} else if (selectedApproach === "warm") {
			return "linear-gradient(90deg, #FEE2E2 0%, #FCA5A5 50%, #EF4444 100%)";
		} else if (selectedApproach === "contrast") {
			return "linear-gradient(90deg, #3B82F6 0%, #6B7280 50%, #EF4444 100%)";
		} else {
			return "linear-gradient(90deg, #F3F4F6 0%, #E5E7EB 50%, #9CA3AF 100%)";
		}
	};

	if (showPostPractice) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div
					className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
						highContrastMode ? "bg-white border-4 border-black" : "bg-white"
					}`}
				>
					<div className="p-8">
						<h2
							className={`text-2xl font-bold mb-2 ${highContrastMode ? "text-black" : "text-gray-900"}`}
						>
							Your Temperature Experience
						</h2>
						<p className="text-gray-600 mb-6">
							Every response helps us understand what works
						</p>

						{/* What explored */}
						<div className="mb-6">
							<p className="font-semibold mb-3">What did you explore today?</p>
							<div className="space-y-2">
								{[
									"Cool water/object",
									"Warm water/object",
									"Temperature visualization",
									"Breath temperature",
									"Air temperature",
									"No temperature change",
								].map((option) => (
									<label key={option} className="flex items-center">
										<input
											type="checkbox"
											checked={exploredToday.includes(option)}
											onChange={(e) => {
												if (e.target.checked) {
													setExploredToday([...exploredToday, option]);
												} else {
													setExploredToday(
														exploredToday.filter((o) => o !== option),
													);
												}
											}}
											className="mr-3"
										/>
										<span>{option}</span>
									</label>
								))}
							</div>
							<input
								type="text"
								placeholder="Other..."
								className="mt-2 w-full px-3 py-2 border rounded-lg"
								onKeyPress={(e) => {
									if (e.key === "Enter" && e.currentTarget.value) {
										setExploredToday([...exploredToday, e.currentTarget.value]);
										e.currentTarget.value = "";
									}
								}}
							/>
						</div>

						{/* Effect */}
						<div className="mb-6">
							<p className="font-semibold mb-3">How did it affect you?</p>
							<div className="grid grid-cols-2 gap-2">
								{[
									"More alert and present",
									"More calm and settled",
									"Energized",
									"Grounded",
									"No noticeable change",
									"Uncomfortable (helps us adjust)",
								].map((effect) => (
									<button
										key={effect}
										onClick={() => setEffectExperienced(effect)}
										className={`px-3 py-2 rounded-lg text-sm ${
											effectExperienced === effect
												? `${highContrastMode ? "bg-black text-white" : "bg-sage-600 text-white"}`
												: "bg-gray-100 hover:bg-gray-200"
										}`}
									>
										{effect}
									</button>
								))}
							</div>
						</div>

						{/* Sensory experience */}
						<div className="mb-6">
							<p className="font-semibold mb-3">Sensory experience:</p>
							<div className="space-y-2">
								{[
									"Just right",
									"Too intense (I'll go gentler)",
									"Too mild (I need more)",
									"Avoided physical, used imagination",
									"Different than expected",
								].map((exp) => (
									<button
										key={exp}
										onClick={() => setSensoryExperience(exp)}
										className={`block w-full text-left px-3 py-2 rounded-lg ${
											sensoryExperience === exp
												? `${highContrastMode ? "bg-black text-white" : "bg-sage-600 text-white"}`
												: "bg-gray-100 hover:bg-gray-200"
										}`}
									>
										{exp}
									</button>
								))}
							</div>
						</div>

						{/* What helped */}
						<div className="mb-6">
							<p className="font-semibold mb-3">What made this work for you?</p>
							<div className="space-y-2">
								{[
									"Having control over intensity",
									"Using imagination instead",
									"The brief duration",
									"Choosing my own approach",
									"Visual/vibration cues",
									"Being able to stop anytime",
								].map((aspect) => (
									<label key={aspect} className="flex items-center">
										<input
											type="checkbox"
											checked={helpfulAspects.includes(aspect)}
											onChange={(e) => {
												if (e.target.checked) {
													setHelpfulAspects([...helpfulAspects, aspect]);
												} else {
													setHelpfulAspects(
														helpfulAspects.filter((a) => a !== aspect),
													);
												}
											}}
											className="mr-3"
										/>
										<span>{aspect}</span>
									</label>
								))}
							</div>
						</div>

						{/* Next time */}
						<div className="mb-6">
							<p className="font-semibold mb-3">For next time:</p>
							<select
								value={nextTimePreference}
								onChange={(e) => setNextTimePreference(e.target.value)}
								className="w-full px-3 py-2 border rounded-lg"
							>
								<option value="">Choose...</option>
								<option value="same">Same approach works well</option>
								<option value="cooler">Try cooler</option>
								<option value="warmer">Try warmer</option>
								<option value="different-area">Try different body area</option>
								<option value="visualization">Switch to visualization</option>
								<option value="duration">Need different duration</option>
								<option value="experiment">Want to experiment more</option>
							</select>
						</div>

						{/* Sensory needs */}
						<div className="mb-6">
							<p className="font-semibold mb-2">
								Optional: Any sensory needs we should know about?
							</p>
							<textarea
								value={sensoryNeeds}
								onChange={(e) => setSensoryNeeds(e.target.value)}
								placeholder="This is saved privately for your profile..."
								className="w-full px-3 py-2 border rounded-lg h-20"
							/>
						</div>

						<div className="flex gap-3">
							<button
								onClick={handlePostPracticeSubmit}
								className={`flex-1 px-6 py-3 rounded-lg font-semibold ${
									highContrastMode
										? "bg-black text-white"
										: "bg-sage-600 text-white"
								}`}
							>
								Save My Preferences
							</button>
							<button
								onClick={onClose}
								className="px-6 py-3 rounded-lg font-semibold border border-gray-300"
							>
								Continue Without Saving
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div
				className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
					highContrastMode ? "bg-white border-4 border-black" : "bg-white"
				}`}
			>
				<div className="p-8">
					{/* Header */}
					<div className="flex justify-between items-start mb-6">
						<div>
							<h2
								className={`text-2xl font-bold mb-2 ${highContrastMode ? "text-black" : "text-gray-900"}`}
							>
								Temperature Exploration
							</h2>
							<p className="text-gray-600">
								Work with temperature in your own way
							</p>
						</div>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					{/* Approach Selector */}
					<div className="mb-6">
						<p className="font-semibold mb-3">Choose your approach:</p>
						<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
							{[
								{
									id: "cool" as ApproachType,
									label: "Cool Options",
									icon: Droplets,
									color: "#3B82F6",
									desc: "Water • Air • Object • Imagination",
								},
								{
									id: "warm" as ApproachType,
									label: "Warm Options",
									icon: Sun,
									color: "#EF4444",
									desc: "Heat • Sunlight • Layers • Visualization",
								},
								{
									id: "neutral" as ApproachType,
									label: "Neutral Options",
									icon: Circle,
									color: "#6B7280",
									desc: "Room temp • No change • Observation",
								},
								{
									id: "contrast" as ApproachType,
									label: "Contrast",
									icon: Thermometer,
									color: "#8B5CF6",
									desc: "Alternate temperatures",
								},
								{
									id: "imaginative" as ApproachType,
									label: "Imaginative",
									icon: Brain,
									color: "#10B981",
									desc: "Visualization only",
								},
							].map((approach) => {
								const Icon = approach.icon;
								return (
									<button
										key={approach.id}
										onClick={() => setSelectedApproach(approach.id)}
										className={`p-4 rounded-lg border text-center transition-all ${
											selectedApproach === approach.id
												? highContrastMode
													? "bg-black text-white border-black"
													: "bg-sage-50 border-sage-500"
												: "border-gray-300 hover:bg-gray-50"
										}`}
									>
										<Icon
											className="w-6 h-6 mx-auto mb-2"
											style={{
												color:
													selectedApproach === approach.id
														? highContrastMode
															? "#FFFFFF"
															: approach.color
														: "#9CA3AF",
											}}
										/>
										<p className="font-medium text-sm">{approach.label}</p>
										<p className="text-xs mt-1 opacity-75">{approach.desc}</p>
									</button>
								);
							})}
						</div>
					</div>

					{/* Current Phase Display - WCAG AA Compliant */}
					<div
						className={`mb-6 p-6 rounded-xl ${
							highContrastMode
								? "bg-black border-4 border-white"
								: selectedApproach === "cool"
									? "bg-blue-700"
									: selectedApproach === "warm"
										? "bg-red-700"
										: selectedApproach === "contrast"
											? "bg-purple-700"
											: "bg-gray-700"
						}`}
					>
						<div className="text-center">
							<p className="text-sm mb-2 text-white font-medium">
								Current Phase:
							</p>
							<h3 className="text-3xl font-bold mb-2 capitalize text-white">
								{currentPhase === "stopped"
									? "Begin when comfortable"
									: currentPhase === "exploring"
										? "Exploring Temperature"
										: "Resting"}
							</h3>
							{isPlaying && (
								<p className="text-lg text-white opacity-95">
									Notice • Adjust • Breathe Your Way
								</p>
							)}
						</div>

						{/* Visual Timer - WCAG AA Compliant */}
						{visualTimer && (
							<div className="mt-4">
								<div className="h-3 bg-black bg-opacity-20 rounded-full overflow-hidden border border-white border-opacity-50">
									<div
										className="h-full transition-all duration-1000 bg-white"
										style={{
											width:
												selectedDuration === "complete"
													? "0%"
													: `${
															(timeElapsed /
																{
																	"10s": 10,
																	"30s": 30,
																	"1m": 60,
																	"2m": 120,
																	complete: 1,
																}[selectedDuration]) *
															100
														}%`,
										}}
									/>
								</div>
								<p
									className={`text-center mt-2 ${highContrastMode ? "text-white" : "text-white"}`}
								>
									{Math.floor(timeElapsed / 60)}:
									{(timeElapsed % 60).toString().padStart(2, "0")}
								</p>
							</div>
						)}
					</div>

					{/* Exploration Methods */}
					{!simplifiedMode && (
						<div className="mb-6">
							<p className="font-semibold mb-3">
								Ways to Explore (all equally valid):
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Physical Temperature */}
								<div
									className={`p-4 rounded-lg ${
										highContrastMode ? "bg-black text-white" : "bg-gray-50"
									}`}
								>
									<h4 className="font-semibold mb-2 flex items-center">
										<Droplets className="w-4 h-4 mr-2" />
										Physical Temperature
									</h4>
									<ul className="text-sm space-y-1">
										<li>• Cool: Water on wrists, cool object, breeze, AC</li>
										<li>
											• Warm: Warm compress, sunshine, heated object, layers
										</li>
										<li>• Contrast: Alternate between temperatures</li>
										<li>• Stable: Stay with current temperature</li>
									</ul>
								</div>

								{/* Imaginative Temperature */}
								<div
									className={`p-4 rounded-lg ${
										highContrastMode ? "bg-black text-white" : "bg-gray-50"
									}`}
								>
									<h4 className="font-semibold mb-2 flex items-center">
										<Brain className="w-4 h-4 mr-2" />
										Imaginative Temperature
									</h4>
									<ul className="text-sm space-y-1">
										<li>• Picture cool: Mountain stream, ice, winter scene</li>
										<li>• Picture warm: Sunlight, beach, cozy fire</li>
										<li>• Memory: Recall a comfortable temperature</li>
										<li>• Color: Cool blues or warm oranges/reds</li>
									</ul>
								</div>

								{/* Breath Temperature */}
								<div
									className={`p-4 rounded-lg ${
										highContrastMode ? "bg-black text-white" : "bg-gray-50"
									}`}
								>
									<h4 className="font-semibold mb-2 flex items-center">
										<Wind className="w-4 h-4 mr-2" />
										Breath Temperature
									</h4>
									<ul className="text-sm space-y-1">
										<li>• Notice naturally cool inhale</li>
										<li>• Notice naturally warm exhale</li>
										<li>• Breathe through nose (cooling)</li>
										<li>• Breathe through mouth (warming)</li>
									</ul>
								</div>

								{/* Sensory Alternatives */}
								<div
									className={`p-4 rounded-lg ${
										highContrastMode ? "bg-black text-white" : "bg-gray-50"
									}`}
								>
									<h4 className="font-semibold mb-2 flex items-center">
										<Hand className="w-4 h-4 mr-2" />
										Sensory Alternatives
									</h4>
									<ul className="text-sm space-y-1">
										<li>• Texture change: Smooth, rough, soft surfaces</li>
										<li>• Air movement: Fan, wind, still air</li>
										<li>• Pressure change: Light touch to firm pressure</li>
										<li>• Visual: Watch flowing water or flickering flame</li>
									</ul>
								</div>
							</div>
						</div>
					)}

					{/* Neurodivergent Options */}
					{neurodivergentMode && (
						<div
							className={`mb-6 p-4 rounded-lg ${
								highContrastMode
									? "bg-black text-white border-2 border-white"
									: "bg-purple-50 border border-purple-200"
							}`}
						>
							<h4 className="font-semibold mb-2 flex items-center">
								<Sparkles className="w-4 h-4 mr-2" />
								Neurodivergent-Friendly Options
							</h4>
							<div className="grid grid-cols-2 gap-2 text-sm">
								<label className="flex items-center">
									<input
										type="radio"
										name="routine"
										checked={routineMode === "predictable"}
										onChange={() => setRoutineMode("predictable")}
										className="mr-2"
									/>
									Predictable: Same temperature each time
								</label>
								<label className="flex items-center">
									<input
										type="radio"
										name="routine"
										checked={routineMode === "experimenting"}
										onChange={() => setRoutineMode("experimenting")}
										className="mr-2"
									/>
									Experimenting: Find your sweet spot
								</label>
								<label className="flex items-center">
									<input
										type="radio"
										name="routine"
										checked={routineMode === "minimal"}
										onChange={() => setRoutineMode("minimal")}
										className="mr-2"
									/>
									Minimal change: Tiny shifts only
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={sensoryPreference === "seeking"}
										onChange={(e) =>
											setSensoryPreference(
												e.target.checked ? "seeking" : "balanced",
											)
										}
										className="mr-2"
									/>
									Sensory seeking: More intense
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={sensoryPreference === "avoiding"}
										onChange={(e) =>
											setSensoryPreference(
												e.target.checked ? "avoiding" : "balanced",
											)
										}
										className="mr-2"
									/>
									Sensory avoiding: Gentle or imagined
								</label>
							</div>
						</div>
					)}

					{/* Duration Options */}
					<div className="mb-6">
						<p className="font-semibold mb-3">Duration Options:</p>
						<div className="flex gap-2">
							{(["10s", "30s", "1m", "2m", "complete"] as DurationOption[]).map(
								(duration) => (
									<button
										key={duration}
										onClick={() => setSelectedDuration(duration)}
										className={`px-4 py-2 rounded-lg ${
											selectedDuration === duration
												? highContrastMode
													? "bg-black text-white"
													: "bg-sage-600 text-white"
												: "bg-gray-100 hover:bg-gray-200"
										}`}
									>
										{duration === "complete"
											? "Until it feels complete"
											: duration}
									</button>
								),
							)}
						</div>
					</div>

					{/* Safety & Comfort */}
					<div
						className={`mb-6 p-4 rounded-lg ${
							highContrastMode
								? "bg-yellow-100 text-black border-2 border-black"
								: "bg-yellow-50 border border-yellow-200"
						}`}
					>
						<h4 className="font-semibold mb-2 flex items-center">
							<Shield className="w-4 h-4 mr-2" />
							Safety & Comfort First
						</h4>
						<ul className="text-sm space-y-1">
							<li>• Never use extreme temperatures</li>
							<li>• Brief contact is enough</li>
							<li>• Trust your instincts about what feels safe</li>
							<li>• Some medications affect temperature sensation</li>
							<li>• Circulation conditions need gentle approach</li>
							<li>• Sensory differences are respected here</li>
							<li>• Stop immediately if uncomfortable</li>
						</ul>
					</div>

					{/* Accessibility Controls */}
					<div className="flex justify-center gap-2 mb-6">
						<button
							onClick={() => {
								setHighContrastMode(!highContrastMode);
								localStorage.setItem(
									"temperaturePrefs",
									JSON.stringify({
										...JSON.parse(
											localStorage.getItem("temperaturePrefs") || "{}",
										),
										highContrast: !highContrastMode,
									}),
								);
							}}
							className={`p-2 rounded-lg ${highContrastMode ? "bg-black text-white" : "bg-gray-100"}`}
							title="Toggle high contrast"
						>
							<Contrast className="w-5 h-5" />
						</button>
						<button
							onClick={() => {
								setVibrationEnabled(!vibrationEnabled);
								if (!vibrationEnabled && "vibrate" in navigator) {
									navigator.vibrate(200);
								}
								localStorage.setItem(
									"temperaturePrefs",
									JSON.stringify({
										...JSON.parse(
											localStorage.getItem("temperaturePrefs") || "{}",
										),
										vibration: !vibrationEnabled,
									}),
								);
							}}
							className={`p-2 rounded-lg ${vibrationEnabled ? "bg-sage-600 text-white" : "bg-gray-100"}`}
							title="Toggle vibration feedback"
						>
							<Vibrate className="w-5 h-5" />
						</button>
						<button
							onClick={() => {
								setSimplifiedMode(!simplifiedMode);
								localStorage.setItem(
									"temperaturePrefs",
									JSON.stringify({
										...JSON.parse(
											localStorage.getItem("temperaturePrefs") || "{}",
										),
										simplified: !simplifiedMode,
									}),
								);
							}}
							className={`p-2 rounded-lg ${simplifiedMode ? "bg-sage-600 text-white" : "bg-gray-100"}`}
							title="Toggle simplified mode"
						>
							<Eye className="w-5 h-5" />
						</button>
						<button
							onClick={() => {
								setNeurodivergentMode(!neurodivergentMode);
								localStorage.setItem(
									"temperaturePrefs",
									JSON.stringify({
										...JSON.parse(
											localStorage.getItem("temperaturePrefs") || "{}",
										),
										neurodivergent: !neurodivergentMode,
									}),
								);
							}}
							className={`p-2 rounded-lg ${neurodivergentMode ? "bg-purple-600 text-white" : "bg-gray-100"}`}
							title="Toggle neurodivergent support"
						>
							<Brain className="w-5 h-5" />
						</button>
						<button
							onClick={() => setShowSettings(!showSettings)}
							className="p-2 rounded-lg bg-gray-100"
							title="Customize settings"
						>
							<Settings className="w-5 h-5" />
						</button>
					</div>

					{/* Control Buttons */}
					<div className="flex justify-center gap-4">
						{!isPlaying ? (
							<button
								onClick={handleStart}
								className={`flex items-center px-8 py-3 rounded-lg font-semibold ${
									highContrastMode
										? "bg-black text-white"
										: "bg-sage-600 text-white hover:bg-sage-700"
								}`}
							>
								<Play className="w-5 h-5 mr-2" />
								Start When Ready
							</button>
						) : (
							<button
								onClick={handlePause}
								className="flex items-center px-8 py-3 rounded-lg font-semibold bg-orange-500 text-white hover:bg-orange-600"
							>
								<Pause className="w-5 h-5 mr-2" />
								Pause
							</button>
						)}

						<button
							onClick={handleReset}
							className="flex items-center px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50"
						>
							<RotateCcw className="w-5 h-5 mr-2" />
							Reset
						</button>

						<button
							onClick={() => setShowPostPractice(true)}
							className="flex items-center px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50"
						>
							<ChevronRight className="w-5 h-5 mr-2" />
							Skip to Reflection
						</button>
					</div>

					{/* Settings Panel */}
					{showSettings && (
						<div
							className={`mt-6 p-6 rounded-lg ${
								highContrastMode
									? "bg-black text-white border-2 border-white"
									: "bg-gray-50"
							}`}
						>
							<h3 className="font-semibold mb-4">Customize My Practice</h3>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium mb-2">
										Intensity Preference
									</label>
									<select
										value={intensityPreference}
										onChange={(e) =>
											setIntensityPreference(e.target.value as IntensityLevel)
										}
										className={`w-full px-3 py-2 rounded-lg border ${
											highContrastMode
												? "bg-black text-white border-white"
												: "border-gray-300"
										}`}
									>
										<option value="gentle">Gentle</option>
										<option value="moderate">Moderate</option>
										<option value="intense">Intense (if safe)</option>
										<option value="none">No physical contact</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">
										Sensory Preference
									</label>
									<select
										value={sensoryPreference}
										onChange={(e) =>
											setSensoryPreference(e.target.value as any)
										}
										className={`w-full px-3 py-2 rounded-lg border ${
											highContrastMode
												? "bg-black text-white border-white"
												: "border-gray-300"
										}`}
									>
										<option value="seeking">
											Sensory Seeking (more input)
										</option>
										<option value="avoiding">
											Sensory Avoiding (less input)
										</option>
										<option value="balanced">Balanced</option>
									</select>
								</div>

								<div className="flex items-center">
									<input
										type="checkbox"
										id="audioDesc"
										checked={audioDescriptions}
										onChange={(e) => setAudioDescriptions(e.target.checked)}
										className="mr-2"
									/>
									<label htmlFor="audioDesc" className="text-sm">
										Enable audio descriptions (screen reader friendly)
									</label>
								</div>

								<button
									onClick={handleSavePreferences}
									className={`w-full px-4 py-2 rounded-lg font-semibold ${
										highContrastMode
											? "bg-white text-black"
											: "bg-sage-600 text-white"
									}`}
								>
									Save Settings
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
