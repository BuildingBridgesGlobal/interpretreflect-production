import {
	Circle,
	Contrast,
	Eye,
	EyeOff,
	Gauge,
	Pause,
	Play,
	RotateCcw,
	Settings,
	Square,
	Triangle,
	Vibrate,
	Volume2,
	VolumeX,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { type BreathingPracticeData, supabase } from "../lib/supabase";

interface BreathingPracticeProps {
	onClose: () => void;
	onComplete?: (data: BreathingPracticeData) => void;
}

type BreathingPhase = "inhale" | "pause" | "exhale" | "rest" | "stopped";
type PracticeType = "rhythm" | "counting" | "color" | "sound" | "touch";

export const BreathingPractice: React.FC<BreathingPracticeProps> = ({
	onClose,
	onComplete,
}) => {
	const { user } = useAuth();
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentPhase, setCurrentPhase] = useState<BreathingPhase>("stopped");
	const [currentCount, setCurrentCount] = useState(0);
	const [cycleCount, setCycleCount] = useState(0);
	const [showSettings, setShowSettings] = useState(false);
	const [showPostPractice, setShowPostPractice] = useState(false);
	const [showVisualGuide, setShowVisualGuide] = useState(true);
	const [audioEnabled, setAudioEnabled] = useState(false);
	const [sessionStartTime, setSessionStartTime] = useState<number>(0);
	const [sessionDuration, setSessionDuration] = useState(0);
	const [modifications, setModifications] = useState<string[]>([]);

	// Accessibility states
	const [highContrastMode, setHighContrastMode] = useState(false);
	const [vibrationEnabled, setVibrationEnabled] = useState(false);
	const [visualMode, setVisualMode] = useState<
		"circle" | "bar" | "colors" | "shapes"
	>("circle");
	const [speedPreference, setSpeedPreference] = useState<
		"slower" | "normal" | "faster"
	>("normal");
	const [simplifiedMode, setSimplifiedMode] = useState(false);
	const [neurodivergentMode, setNeurodivergentMode] = useState(false);
	const [stimPattern, setStimPattern] = useState<
		"none" | "tapping" | "rocking" | "fidget"
	>("none");
	const [predictableMode, setPredictableMode] = useState(false);

	// Practice settings
	const [practiceType, setPracticeType] = useState<PracticeType>("rhythm");
	const [inhaleCount, setInhaleCount] = useState(4);
	const [pauseCount, setPauseCount] = useState(4);
	const [exhaleCount, setExhaleCount] = useState(4);
	const [restCount, setRestCount] = useState(4);
	const [skipHolds, setSkipHolds] = useState(false);
	const [breathingPath, setBreathingPath] = useState<
		"nose" | "mouth" | "combination"
	>("nose");

	// Post-practice feedback
	const [feelingResponse, setFeelingResponse] = useState<string>("");
	const [feelingOther, setFeelingOther] = useState("");
	const [adjustmentPreference, setAdjustmentPreference] = useState<string>("");
	const [adjustmentOther, setAdjustmentOther] = useState("");
	const [oneWordDescription, setOneWordDescription] = useState("");
	const [saveAdjustments, setSaveAdjustments] = useState(false);
	const [reminderSchedule, setReminderSchedule] = useState<string>("");
	const [tryDifferentNext, setTryDifferentNext] = useState(false);

	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Handle Escape key to close modal
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [onClose]);

	// Load saved preferences
	useEffect(() => {
		if (user) {
			loadUserPreferences();
		}

		// Load accessibility preferences from localStorage
		const savedPrefs = localStorage.getItem("breathingAccessibilityPrefs");
		if (savedPrefs) {
			const prefs = JSON.parse(savedPrefs);
			setHighContrastMode(prefs.highContrast || false);
			setVibrationEnabled(prefs.vibration || false);
			setVisualMode(prefs.visualMode || "circle");
			setSpeedPreference(prefs.speed || "normal");
			setSimplifiedMode(prefs.simplified || false);
			setNeurodivergentMode(prefs.neurodivergent || false);
			setStimPattern(prefs.stimPattern || "none");
			setPredictableMode(prefs.predictable || false);
		}
	}, [user]);

	const loadUserPreferences = async () => {
		if (!user) return;

		try {
			const { data, error } = await supabase
				.from("user_preferences")
				.select("breathing_settings")
				.eq("user_id", user.id)
				.single();

			if (data?.breathing_settings) {
				const settings = data.breathing_settings;
				setInhaleCount(settings.inhale_count || 4);
				setPauseCount(settings.pause_count || 4);
				setExhaleCount(settings.exhale_count || 4);
				setRestCount(settings.rest_count || 4);
				setSkipHolds(settings.skip_holds || false);
				setBreathingPath(settings.breathing_path || "nose");
				setAudioEnabled(settings.audio_enabled || false);
				setShowVisualGuide(settings.visual_guide || true);
			}
		} catch (error) {
			console.error("Error loading preferences:", error);
		}
	};

	const getPhaseInstruction = () => {
		if (simplifiedMode) {
			switch (currentPhase) {
				case "inhale":
					return "In";
				case "pause":
					return "Hold";
				case "exhale":
					return "Out";
				case "rest":
					return "Rest";
				default:
					return "Ready";
			}
		}

		if (neurodivergentMode && stimPattern !== "none") {
			const stimAction = {
				tapping: "tap along",
				rocking: "rock gently",
				fidget: "use your fidget",
			}[stimPattern];

			switch (currentPhase) {
				case "inhale":
					return `Breathe in (${stimAction})`;
				case "pause":
					return `Hold (keep ${stimAction === "tap along" ? "tapping" : stimAction === "rock gently" ? "rocking" : "fidgeting"})`;
				case "exhale":
					return `Breathe out (${stimAction})`;
				case "rest":
					return `Rest (${stimAction})`;
				default:
					return "Press play when ready";
			}
		}

		switch (currentPhase) {
			case "inhale":
				return `Breathe in ${breathingPath === "nose" ? "through your nose" : breathingPath === "mouth" ? "through your mouth" : "your way"}`;
			case "pause":
				return "Gently hold";
			case "exhale":
				return `Breathe out ${breathingPath === "nose" ? "through your nose" : breathingPath === "mouth" ? "through your mouth" : "your way"}`;
			case "rest":
				return "Rest empty";
			default:
				return "Press play when ready";
		}
	};

	const startPractice = () => {
		setIsPlaying(true);
		setCurrentPhase("inhale");

		// Adjust counts based on speed preference
		const speedMultiplier =
			speedPreference === "slower"
				? 1.5
				: speedPreference === "faster"
					? 0.75
					: 1;
		const adjustedInhale = Math.round(inhaleCount * speedMultiplier);

		setCurrentCount(adjustedInhale);
		setCycleCount(0);
		setSessionStartTime(Date.now());
		setModifications([]);

		// Trigger vibration if enabled
		if (vibrationEnabled && "vibrate" in navigator) {
			navigator.vibrate(200);
		}

		runBreathingCycle();
	};

	const stopPractice = () => {
		setIsPlaying(false);
		setCurrentPhase("stopped");
		setCurrentCount(0);
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		const duration = Math.round((Date.now() - sessionStartTime) / 1000);
		setSessionDuration(duration);

		if (duration > 30) {
			// Only show post-practice if practiced for more than 30 seconds
			setShowPostPractice(true);
		}
	};

	const runBreathingCycle = () => {
		let phase: BreathingPhase = "inhale";
		const speedMultiplier =
			speedPreference === "slower"
				? 1.5
				: speedPreference === "faster"
					? 0.75
					: 1;
		let count = Math.round(inhaleCount * speedMultiplier);

		intervalRef.current = setInterval(() => {
			count--;
			setCurrentCount(count);

			if (count <= 0) {
				// Move to next phase
				switch (phase) {
					case "inhale":
						// Vibrate on phase change if enabled
						if (vibrationEnabled && "vibrate" in navigator) {
							navigator.vibrate(100);
						}
						if (skipHolds) {
							phase = "exhale";
							count = Math.round(exhaleCount * speedMultiplier);
						} else {
							phase = "pause";
							count = Math.round(pauseCount * speedMultiplier);
						}
						break;
					case "pause":
						if (vibrationEnabled && "vibrate" in navigator) {
							navigator.vibrate(100);
						}
						phase = "exhale";
						count = Math.round(exhaleCount * speedMultiplier);
						break;
					case "exhale":
						if (vibrationEnabled && "vibrate" in navigator) {
							navigator.vibrate(100);
						}
						if (skipHolds) {
							phase = "inhale";
							count = Math.round(inhaleCount * speedMultiplier);
							setCycleCount((prev) => prev + 1);
						} else {
							phase = "rest";
							count = Math.round(restCount * speedMultiplier);
						}
						break;
					case "rest":
						if (vibrationEnabled && "vibrate" in navigator) {
							navigator.vibrate(100);
						}
						phase = "inhale";
						count = Math.round(inhaleCount * speedMultiplier);
						setCycleCount((prev) => prev + 1);
						break;
				}

				setCurrentPhase(phase);
				setCurrentCount(count);
			}
		}, 1000);
	};

	const resetPractice = () => {
		stopPractice();
		setCycleCount(0);
		setCurrentCount(0);
		setShowPostPractice(false);
	};

	const handleModification = (mod: string) => {
		setModifications((prev) => [...prev, mod]);

		switch (mod) {
			case "shorter_counts":
				setInhaleCount(3);
				setPauseCount(3);
				setExhaleCount(3);
				setRestCount(3);
				break;
			case "longer_counts":
				setInhaleCount(5);
				setPauseCount(5);
				setExhaleCount(5);
				setRestCount(5);
				break;
			case "skip_pauses":
				setSkipHolds(true);
				break;
			case "toggle_audio":
				setAudioEnabled(!audioEnabled);
				break;
			case "toggle_visual":
				setShowVisualGuide(!showVisualGuide);
				break;
		}
	};

	const submitPostPractice = async () => {
		const practiceData: BreathingPracticeData = {
			practice_type: practiceType,
			inhale_count: inhaleCount,
			pause_count: pauseCount,
			exhale_count: exhaleCount,
			rest_count: restCount,
			skip_holds: skipHolds,
			breathing_path: breathingPath,
			feeling_response: feelingResponse as any,
			feeling_other: feelingOther,
			adjustment_preference: adjustmentPreference as any,
			adjustment_other: adjustmentOther,
			one_word_description: oneWordDescription,
			save_adjustments: saveAdjustments,
			reminder_schedule: reminderSchedule as any,
			try_different_next: tryDifferentNext,
			session_id: `breathing-${Date.now()}`,
			timestamp: new Date().toISOString(),
			duration: sessionDuration,
			completion_status: cycleCount >= 3 ? "completed" : "partial",
			modifications_made: modifications,
			time_of_day:
				new Date().getHours() < 12
					? "morning"
					: new Date().getHours() < 17
						? "afternoon"
						: "evening",
			visual_timer_used: showVisualGuide,
			audio_cues_used: audioEnabled,
			haptic_feedback_used: vibrationEnabled,
			high_contrast_mode: highContrastMode,
		};

		// Save to database
		if (user) {
			try {
				await supabase.from("breathing_sessions").insert({
					user_id: user.id,
					data: practiceData,
					created_at: new Date().toISOString(),
				});

				// Save preferences if requested
				if (saveAdjustments) {
					await supabase.from("user_preferences").upsert({
						user_id: user.id,
						breathing_settings: {
							inhale_count: inhaleCount,
							pause_count: pauseCount,
							exhale_count: exhaleCount,
							rest_count: restCount,
							skip_holds: skipHolds,
							breathing_path: breathingPath,
							audio_enabled: audioEnabled,
							visual_guide: showVisualGuide,
						},
					});
				}
			} catch (error) {
				console.error("Error saving practice data:", error);
			}
		}

		if (onComplete) {
			onComplete(practiceData);
		}

		onClose();
	};

	const renderPracticeScreen = () => (
		<div className="flex flex-col h-full">
			<div className="flex-1 flex flex-col items-center justify-center p-8">
				{/* Phase indicator */}
				<div className="text-center mb-8">
					<p className="text-sm text-gray-500 mb-2">Current Phase:</p>
					<h2 className="text-4xl font-bold text-sage-700 capitalize mb-2">
						{currentPhase === "stopped" ? "Ready" : currentPhase}
					</h2>
					{isPlaying && (
						<div className="text-6xl font-bold text-sage-600 mb-4">
							{currentCount}
						</div>
					)}
					<p className="text-lg text-gray-600">{getPhaseInstruction()}</p>
				</div>

				{/* Visual guide with multiple modes */}
				{showVisualGuide && (
					<div className="mb-8">
						{visualMode === "circle" && (
							<div className="relative w-48 h-48 mx-auto">
								<div
									className={`absolute inset-0 rounded-full transition-all duration-1000 ${
										highContrastMode
											? currentPhase === "inhale"
												? "scale-110 bg-black"
												: currentPhase === "pause"
													? "scale-110 bg-gray-800"
													: currentPhase === "exhale"
														? "scale-75 bg-gray-600"
														: currentPhase === "rest"
															? "scale-75 bg-gray-400"
															: "scale-100 bg-white border-4 border-black"
											: currentPhase === "inhale"
												? "scale-110 bg-sage-200"
												: currentPhase === "pause"
													? "scale-110 bg-sage-300"
													: currentPhase === "exhale"
														? "scale-75 bg-sage-100"
														: currentPhase === "rest"
															? "scale-75 bg-gray-100"
															: "scale-100 bg-gray-50"
									}`}
								/>
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="text-center">
										<p
											className={`text-sm ${highContrastMode ? "text-white" : "text-gray-600"}`}
										>
											Cycle
										</p>
										<p
											className={`text-2xl font-bold ${highContrastMode ? "text-white" : "text-sage-700"}`}
										>
											{cycleCount}
										</p>
									</div>
								</div>
							</div>
						)}

						{visualMode === "bar" && (
							<div className="w-full max-w-md mx-auto">
								<div className="h-20 bg-gray-200 rounded-lg overflow-hidden relative">
									<div
										className={`h-full transition-all duration-1000 ${
											highContrastMode ? "bg-black" : "bg-sage-600"
										}`}
										style={{
											width: `${
												(currentCount /
													(currentPhase === "inhale"
														? inhaleCount
														: currentPhase === "pause"
															? pauseCount
															: currentPhase === "exhale"
																? exhaleCount
																: restCount)) *
												100
											}%`,
										}}
									/>
									<div className="absolute inset-0 flex items-center justify-center">
										<p
											className={`font-bold text-lg ${highContrastMode ? "text-white mix-blend-difference" : "text-white"}`}
										>
											{currentCount}
										</p>
									</div>
								</div>
							</div>
						)}

						{visualMode === "shapes" && (
							<div className="flex justify-center gap-4">
								{currentPhase === "inhale" && (
									<Circle
										className={`w-24 h-24 ${highContrastMode ? "text-black fill-black" : "text-sage-600 fill-sage-200"}`}
									/>
								)}
								{currentPhase === "pause" && (
									<Square
										className={`w-24 h-24 ${highContrastMode ? "text-black fill-gray-800" : "text-sage-600 fill-sage-300"}`}
									/>
								)}
								{currentPhase === "exhale" && (
									<Triangle
										className={`w-24 h-24 ${highContrastMode ? "text-black fill-gray-600" : "text-sage-600 fill-sage-100"}`}
									/>
								)}
								{currentPhase === "rest" && (
									<Circle
										className={`w-24 h-24 ${highContrastMode ? "text-black" : "text-gray-400 fill-gray-100"}`}
									/>
								)}
							</div>
						)}

						{visualMode === "colors" && (
							<div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
								{Array.from({ length: 20 }).map((_, i) => (
									<div
										key={i}
										className={`h-8 rounded transition-all duration-300 ${
											i <
											20 -
												Math.round(
													(currentCount /
														(currentPhase === "inhale"
															? inhaleCount
															: currentPhase === "pause"
																? pauseCount
																: currentPhase === "exhale"
																	? exhaleCount
																	: restCount)) *
														20,
												)
												? highContrastMode
													? "bg-black"
													: currentPhase === "inhale"
														? "bg-blue-500"
														: currentPhase === "pause"
															? "bg-yellow-500"
															: currentPhase === "exhale"
																? "bg-green-500"
																: "bg-gray-400"
												: highContrastMode
													? "bg-white border-2 border-black"
													: "bg-gray-200"
										}`}
									/>
								))}
							</div>
						)}
					</div>
				)}

				{/* Breathing cycle indicator */}
				<div className="flex space-x-4 mb-8">
					<div
						className={`px-3 py-1 rounded-lg ${currentPhase === "inhale" ? "bg-sage-600 text-white" : "bg-gray-200 text-gray-600"}`}
					>
						Inhale
					</div>
					{!skipHolds && (
						<div
							className={`px-3 py-1 rounded-lg ${currentPhase === "pause" ? "bg-sage-600 text-white" : "bg-gray-200 text-gray-600"}`}
						>
							Pause
						</div>
					)}
					<div
						className={`px-3 py-1 rounded-lg ${currentPhase === "exhale" ? "bg-sage-600 text-white" : "bg-gray-200 text-gray-600"}`}
					>
						Exhale
					</div>
					{!skipHolds && (
						<div
							className={`px-3 py-1 rounded-lg ${currentPhase === "rest" ? "bg-sage-600 text-white" : "bg-gray-200 text-gray-600"}`}
						>
							Rest
						</div>
					)}
				</div>

				{/* Adaptation options */}
				<div
					className={`rounded-lg p-4 mb-8 max-w-md ${
						highContrastMode
							? "bg-black text-white border-2 border-white"
							: "bg-gray-50"
					}`}
				>
					<h3
						className={`font-semibold mb-2 ${highContrastMode ? "text-white" : "text-gray-700"}`}
					>
						Quick Adjustments:
					</h3>
					<div className="flex flex-wrap gap-2">
						<button
							onClick={() => handleModification("shorter_counts")}
							className={`px-3 py-1 rounded-lg text-sm ${
								highContrastMode
									? "bg-white text-black hover:bg-gray-200"
									: "bg-white hover:bg-gray-100"
							}`}
						>
							Shorter counts
						</button>
						<button
							onClick={() => handleModification("longer_counts")}
							className={`px-3 py-1 rounded-lg text-sm ${
								highContrastMode
									? "bg-white text-black hover:bg-gray-200"
									: "bg-white hover:bg-gray-100"
							}`}
						>
							Longer counts
						</button>
						<button
							onClick={() => handleModification("skip_pauses")}
							className={`px-3 py-1 rounded-lg text-sm ${
								highContrastMode
									? "bg-white text-black hover:bg-gray-200"
									: "bg-white hover:bg-gray-100"
							}`}
						>
							{skipHolds ? "Add pauses" : "Skip pauses"}
						</button>
						<button
							onClick={() => handleModification("toggle_visual")}
							className={`px-3 py-1 rounded-lg text-sm ${
								highContrastMode
									? "bg-white text-black hover:bg-gray-200"
									: "bg-white hover:bg-gray-100"
							}`}
						>
							{showVisualGuide ? (
								<EyeOff className="w-4 h-4" />
							) : (
								<Eye className="w-4 h-4" />
							)}
						</button>
						<button
							onClick={() => handleModification("toggle_audio")}
							className={`px-3 py-1 rounded-lg text-sm ${
								highContrastMode
									? "bg-white text-black hover:bg-gray-200"
									: "bg-white hover:bg-gray-100"
							}`}
						>
							{audioEnabled ? (
								<VolumeX className="w-4 h-4" />
							) : (
								<Volume2 className="w-4 h-4" />
							)}
						</button>
					</div>
				</div>

				{/* Accessibility Quick Controls */}
				<div className="flex justify-center gap-2 mb-4">
					<button
						onClick={() => {
							setHighContrastMode(!highContrastMode);
							localStorage.setItem(
								"breathingAccessibilityPrefs",
								JSON.stringify({
									...JSON.parse(
										localStorage.getItem("breathingAccessibilityPrefs") || "{}",
									),
									highContrast: !highContrastMode,
								}),
							);
						}}
						className={`p-2 rounded-lg ${highContrastMode ? "bg-black text-white border-2 border-white" : "bg-gray-100"}`}
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
								"breathingAccessibilityPrefs",
								JSON.stringify({
									...JSON.parse(
										localStorage.getItem("breathingAccessibilityPrefs") || "{}",
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
							const modes: Array<"circle" | "bar" | "colors" | "shapes"> = [
								"circle",
								"bar",
								"colors",
								"shapes",
							];
							const currentIndex = modes.indexOf(visualMode);
							const nextMode = modes[(currentIndex + 1) % modes.length];
							setVisualMode(nextMode);
							localStorage.setItem(
								"breathingAccessibilityPrefs",
								JSON.stringify({
									...JSON.parse(
										localStorage.getItem("breathingAccessibilityPrefs") || "{}",
									),
									visualMode: nextMode,
								}),
							);
						}}
						className="p-2 rounded-lg bg-gray-100"
						title="Change visual mode"
					>
						<Eye className="w-5 h-5" />
					</button>
					<button
						onClick={() => {
							const speeds: Array<"slower" | "normal" | "faster"> = [
								"slower",
								"normal",
								"faster",
							];
							const currentIndex = speeds.indexOf(speedPreference);
							const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
							setSpeedPreference(nextSpeed);
							localStorage.setItem(
								"breathingAccessibilityPrefs",
								JSON.stringify({
									...JSON.parse(
										localStorage.getItem("breathingAccessibilityPrefs") || "{}",
									),
									speed: nextSpeed,
								}),
							);
						}}
						className="p-2 rounded-lg bg-gray-100"
						title={`Speed: ${speedPreference}`}
					>
						<Gauge className="w-5 h-5" />
					</button>
					<button
						onClick={() => {
							setSimplifiedMode(!simplifiedMode);
							localStorage.setItem(
								"breathingAccessibilityPrefs",
								JSON.stringify({
									...JSON.parse(
										localStorage.getItem("breathingAccessibilityPrefs") || "{}",
									),
									simplified: !simplifiedMode,
								}),
							);
						}}
						className={`p-2 rounded-lg ${simplifiedMode ? "bg-sage-600 text-white" : "bg-gray-100"}`}
						title="Toggle simplified mode"
					>
						<Circle className="w-5 h-5" />
					</button>
				</div>

				{/* Comfort reminder */}
				<div className="text-center text-sm text-gray-500 max-w-md">
					<p>
						If you feel dizzy or uncomfortable, return to your natural
						breathing. This is your practice - modify freely.
					</p>
				</div>
			</div>

			{/* Control buttons */}
			<div className="p-6 border-t border-gray-200">
				<div className="flex justify-center space-x-4">
					{!isPlaying ? (
						<button
							onClick={startPractice}
							className="flex items-center px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
						>
							<Play className="w-5 h-5 mr-2" />
							Start Practice
						</button>
					) : (
						<button
							onClick={stopPractice}
							className="flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
						>
							<Pause className="w-5 h-5 mr-2" />
							End Practice
						</button>
					)}

					<button
						onClick={resetPractice}
						className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
					>
						<RotateCcw className="w-5 h-5 mr-2" />
						Reset
					</button>

					<button
						onClick={() => setShowSettings(!showSettings)}
						className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
					>
						<Settings className="w-5 h-5 mr-2" />
						Settings
					</button>
				</div>
			</div>

			{/* Settings panel */}
			{showSettings && (
				<div
					className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 rounded-lg shadow-lg p-6 w-96 max-h-[60vh] overflow-y-auto ${
						highContrastMode
							? "bg-black text-white border-2 border-white"
							: "bg-white"
					}`}
				>
					<h3 className="font-semibold mb-4">Customize Your Practice</h3>

					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Practice Type
							</label>
							<select
								value={practiceType}
								onChange={(e) =>
									setPracticeType(e.target.value as PracticeType)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg"
							>
								<option value="rhythm">Simple Breathing</option>
								<option value="counting">Counting Breaths</option>
								<option value="color">Color Breathing</option>
								<option value="sound">Sound Focus</option>
								<option value="touch">Touch Breathing</option>
							</select>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Inhale Count
								</label>
								<input
									type="range"
									min="2"
									max="8"
									value={inhaleCount}
									onChange={(e) => setInhaleCount(parseInt(e.target.value))}
									className="w-full"
								/>
								<span className="text-sm text-gray-500">
									{inhaleCount} seconds
								</span>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Exhale Count
								</label>
								<input
									type="range"
									min="2"
									max="8"
									value={exhaleCount}
									onChange={(e) => setExhaleCount(parseInt(e.target.value))}
									className="w-full"
								/>
								<span className="text-sm text-gray-500">
									{exhaleCount} seconds
								</span>
							</div>
						</div>

						{!skipHolds && (
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Pause Count
									</label>
									<input
										type="range"
										min="2"
										max="8"
										value={pauseCount}
										onChange={(e) => setPauseCount(parseInt(e.target.value))}
										className="w-full"
									/>
									<span className="text-sm text-gray-500">
										{pauseCount} seconds
									</span>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Rest Count
									</label>
									<input
										type="range"
										min="2"
										max="8"
										value={restCount}
										onChange={(e) => setRestCount(parseInt(e.target.value))}
										className="w-full"
									/>
									<span className="text-sm text-gray-500">
										{restCount} seconds
									</span>
								</div>
							</div>
						)}

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Breathing Path
							</label>
							<select
								value={breathingPath}
								onChange={(e) => setBreathingPath(e.target.value as any)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg"
							>
								<option value="nose">Through nose</option>
								<option value="mouth">Through mouth</option>
								<option value="combination">Combination (your choice)</option>
							</select>
						</div>

						<div className="flex items-center">
							<input
								type="checkbox"
								id="skipHolds"
								checked={skipHolds}
								onChange={(e) => setSkipHolds(e.target.checked)}
								className="mr-2"
							/>
							<label htmlFor="skipHolds" className="text-sm text-gray-700">
								Skip pauses (just breathe in and out)
							</label>
						</div>
					</div>

					{/* Neurodivergent Options */}
					<div className="border-t pt-4 mt-4">
						<h4 className="font-semibold mb-3">Neurodivergent Support:</h4>

						<label className="flex items-center mb-3">
							<input
								type="checkbox"
								checked={neurodivergentMode}
								onChange={(e) => {
									setNeurodivergentMode(e.target.checked);
									localStorage.setItem(
										"breathingAccessibilityPrefs",
										JSON.stringify({
											...JSON.parse(
												localStorage.getItem("breathingAccessibilityPrefs") ||
													"{}",
											),
											neurodivergent: e.target.checked,
										}),
									);
								}}
								className="mr-2"
							/>
							<span className="text-sm">
								Enable neurodivergent-friendly mode
							</span>
						</label>

						{neurodivergentMode && (
							<div className="ml-4 space-y-2">
								<label className="block text-sm">
									Stim while breathing:
									<select
										value={stimPattern}
										onChange={(e) => {
											setStimPattern(e.target.value as any);
											localStorage.setItem(
												"breathingAccessibilityPrefs",
												JSON.stringify({
													...JSON.parse(
														localStorage.getItem(
															"breathingAccessibilityPrefs",
														) || "{}",
													),
													stimPattern: e.target.value,
												}),
											);
										}}
										className={`w-full px-2 py-1 rounded border ${
											highContrastMode
												? "bg-black text-white border-white"
												: "border-gray-300"
										}`}
									>
										<option value="none">No stimming</option>
										<option value="tapping">Tapping/drumming</option>
										<option value="rocking">Gentle rocking</option>
										<option value="fidget">Use fidget tool</option>
									</select>
								</label>

								<label className="flex items-center">
									<input
										type="checkbox"
										checked={predictableMode}
										onChange={(e) => {
											setPredictableMode(e.target.checked);
											localStorage.setItem(
												"breathingAccessibilityPrefs",
												JSON.stringify({
													...JSON.parse(
														localStorage.getItem(
															"breathingAccessibilityPrefs",
														) || "{}",
													),
													predictable: e.target.checked,
												}),
											);
										}}
										className="mr-2"
									/>
									<span className="text-sm">
										Predictable pattern (no variations)
									</span>
								</label>
							</div>
						)}
					</div>

					<button
						onClick={() => setShowSettings(false)}
						className={`mt-4 w-full px-4 py-2 rounded-lg ${
							highContrastMode
								? "bg-white text-black hover:bg-gray-200"
								: "bg-sage-600 text-white hover:bg-sage-700"
						}`}
					>
						Save Settings
					</button>
				</div>
			)}
		</div>
	);

	const renderPostPractice = () => (
		<div className="p-8 max-w-2xl mx-auto">
			<h2 className="text-2xl font-bold text-gray-900 mb-4">
				Gentle Reflection
			</h2>
			<p className="text-gray-600 mb-6">Your experience matters to us</p>

			<div className="space-y-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-3">
						How did that feel for you today?
					</label>
					<div className="grid grid-cols-2 gap-3">
						{["calming", "energizing", "neutral", "uncomfortable"].map(
							(feeling) => (
								<button
									key={feeling}
									onClick={() => setFeelingResponse(feeling)}
									className={`px-4 py-2 rounded-lg capitalize ${
										feelingResponse === feeling
											? "bg-sage-600 text-white"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									{feeling === "neutral"
										? "Neutral/no change"
										: feeling === "uncomfortable"
											? "Slightly uncomfortable"
											: `${feeling.charAt(0).toUpperCase() + feeling.slice(1)} and ${feeling === "calming" ? "centered" : "focused"}`}
								</button>
							),
						)}
					</div>
					<button
						onClick={() => setFeelingResponse("other")}
						className={`mt-3 w-full px-4 py-2 rounded-lg ${
							feelingResponse === "other"
								? "bg-sage-600 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						Other
					</button>
					{feelingResponse === "other" && (
						<input
							type="text"
							value={feelingOther}
							onChange={(e) => setFeelingOther(e.target.value)}
							className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
							placeholder="Describe your feeling..."
						/>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-3">
						Would you like to adjust anything for next time?
					</label>
					<div className="grid grid-cols-2 gap-3">
						{[
							{ value: "shorter", label: "Try shorter counts" },
							{ value: "longer", label: "Try longer counts" },
							{ value: "skip_pauses", label: "Skip the pauses/holds" },
							{ value: "change_pace", label: "Change the pace" },
							{ value: "add_sound", label: "Add background sound" },
							{ value: "just_right", label: "It was just right" },
						].map((option) => (
							<button
								key={option.value}
								onClick={() => setAdjustmentPreference(option.value)}
								className={`px-4 py-2 rounded-lg text-sm ${
									adjustmentPreference === option.value
										? "bg-sage-600 text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								{option.label}
							</button>
						))}
					</div>
					<button
						onClick={() => setAdjustmentPreference("other")}
						className={`mt-3 w-full px-4 py-2 rounded-lg ${
							adjustmentPreference === "other"
								? "bg-sage-600 text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						Other
					</button>
					{adjustmentPreference === "other" && (
						<input
							type="text"
							value={adjustmentOther}
							onChange={(e) => setAdjustmentOther(e.target.value)}
							className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
							placeholder="What would you like to adjust?"
						/>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Optional: One word to describe how you feel now:
					</label>
					<input
						type="text"
						value={oneWordDescription}
						onChange={(e) => setOneWordDescription(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg"
						placeholder="Enter one word..."
					/>
				</div>

				<div className="border-t pt-6">
					<h3 className="font-semibold text-gray-700 mb-4">
						Your Preferences:
					</h3>

					<div className="space-y-3">
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={saveAdjustments}
								onChange={(e) => setSaveAdjustments(e.target.checked)}
								className="mr-3"
							/>
							<span className="text-sm text-gray-700">
								Save these adjustments for next time
							</span>
						</label>

						<div className="flex items-center">
							<input
								type="checkbox"
								checked={!!reminderSchedule}
								onChange={(e) =>
									setReminderSchedule(e.target.checked ? "4_hours" : "")
								}
								className="mr-3"
							/>
							<span className="text-sm text-gray-700 mr-2">
								Remind me to try this again in
							</span>
							{reminderSchedule && (
								<select
									value={reminderSchedule}
									onChange={(e) => setReminderSchedule(e.target.value)}
									className="px-2 py-1 border border-gray-300 rounded text-sm"
								>
									<option value="2_hours">2 hours</option>
									<option value="4_hours">4 hours</option>
									<option value="tomorrow">tomorrow</option>
									<option value="2_days">in 2 days</option>
								</select>
							)}
						</div>

						<label className="flex items-center">
							<input
								type="checkbox"
								checked={tryDifferentNext}
								onChange={(e) => setTryDifferentNext(e.target.checked)}
								className="mr-3"
							/>
							<span className="text-sm text-gray-700">
								Show me a different practice next time
							</span>
						</label>
					</div>
				</div>

				<div className="flex space-x-4">
					<button
						onClick={submitPostPractice}
						className="flex-1 px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
					>
						Save & Close
					</button>
					<button
						onClick={onClose}
						className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
					>
						Continue Without Saving
					</button>
				</div>
			</div>
		</div>
	);

	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
			onClick={(e) => {
				// Close modal if clicking on backdrop
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
		>
			<div
				className="bg-white rounded-xl shadow-xl max-w-4xl w-full h-[90vh] overflow-hidden flex flex-col"
				onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
			>
				<div className="p-6 border-b border-gray-200 flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">
							Breathing Practice
						</h2>
						<p className="text-gray-600">
							4 minutes • Find your comfortable pattern
						</p>
					</div>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition-colors"
						aria-label="Close"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto">
					{showPostPractice ? renderPostPractice() : renderPracticeScreen()}
				</div>

				{!showPostPractice && (
					<div className="p-4 bg-sage-50 border-t border-sage-200">
						<h3 className="font-semibold text-sage-800 mb-2">
							How This Supports You:
						</h3>
						<p className="text-sm text-sage-700">
							This rhythmic breathing can help your nervous system find balance.
							Many people find it settling, though everyone's experience is
							unique. Some use this for focus, others for calm - discover what
							it offers you.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
