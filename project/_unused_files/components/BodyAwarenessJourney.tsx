import {
	Activity,
	Brain,
	Circle,
	Eye,
	Hand,
	Hash,
	Heart,
	Move,
	Pause,
	Play,
	RotateCcw,
	Settings,
	Shuffle,
	Sparkles,
	Vibrate,
	Wind,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface BodyAwarenessJourneyProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

export const BodyAwarenessJourney: React.FC<BodyAwarenessJourneyProps> = ({
	onClose,
	onComplete,
}) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentFocus, setCurrentFocus] = useState("");
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [duration, setDuration] = useState(60); // Default 1 minute
	const [customDuration, setCustomDuration] = useState("");
	const [showPostPractice, setShowPostPractice] = useState(false);
	const [selectedApproaches, setSelectedApproaches] = useState<string[]>([
		"movement",
	]);
	const [explorationMode, setExplorationMode] = useState<
		"sequential" | "random" | "single" | "free"
	>("free");
	const [sensoryMode, setSensoryMode] = useState<
		"seeking" | "avoiding" | "balanced"
	>("balanced");
	const [showCustomize, setShowCustomize] = useState(false);
	const [highContrast, setHighContrast] = useState(false);
	const [visualPulse, setVisualPulse] = useState(true);
	const [vibrationEnabled, setVibrationEnabled] = useState(false);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Post-practice states
	const [practiceMethod, setPracticeMethod] = useState<string[]>([]);
	const [sensoryExperience, setSensoryExperience] = useState("");
	const [supportFocus, setSupportFocus] = useState<string[]>([]);
	const [savePreferences, setSavePreferences] = useState(false);

	// Neurodivergent-friendly structure options
	const explorationModes = [
		{
			id: "sequential",
			label: "Predictable Sequence",
			icon: Hash,
			desc: "Same order each time",
		},
		{
			id: "random",
			label: "Random Exploration",
			icon: Shuffle,
			desc: "Jump between areas as attention moves",
		},
		{
			id: "single",
			label: "Single Focus",
			icon: Circle,
			desc: "Stay with one area the whole time",
		},
		{
			id: "free",
			label: "Free Flow",
			icon: Sparkles,
			desc: "No structure, just be with your body",
		},
	];

	const approachOptions = [
		{
			id: "movement",
			icon: Move,
			label: "Physical Movement",
			desc: "Rock, sway, adjust, or move freely",
		},
		{
			id: "visualization",
			icon: Eye,
			label: "Visualization",
			desc: "Imagine warmth, light, color, or texture",
		},
		{
			id: "breath",
			icon: Wind,
			label: "Breath Work",
			desc: "Breathe naturally or with intention",
		},
		{
			id: "touch",
			icon: Hand,
			label: "Touch",
			desc: "Touch, tap, squeeze, or apply pressure",
		},
		{
			id: "vibration",
			icon: Vibrate,
			label: "Vibration & Rhythm",
			desc: "Feel vibrations, tap rhythms, use bass",
		},
		{
			id: "stillness",
			icon: Heart,
			label: "Stillness",
			desc: "Simply notice without changing",
		},
		{
			id: "stimming",
			icon: Activity,
			label: "Stimming & Regulation",
			desc: "Use your comfortable repetitive movements",
		},
		{
			id: "pattern",
			icon: Brain,
			label: "Pattern & Structure",
			desc: "Follow a systematic order that feels right",
		},
	];

	const focusAreas = [
		"Head & Face",
		"Neck & Shoulders",
		"Arms & Hands",
		"Chest & Heart",
		"Belly & Core",
		"Back & Spine",
		"Hips & Pelvis",
		"Legs & Feet",
		"Whole Body",
	];

	useEffect(() => {
		if (isPlaying && timeElapsed < duration) {
			intervalRef.current = setTimeout(() => {
				setTimeElapsed((prev) => prev + 1);

				// Visual pulse for time passing (if enabled)
				if (visualPulse && timeElapsed % 10 === 0) {
					// Could trigger a visual animation here
				}

				// Vibration pulse (if enabled and supported)
				if (vibrationEnabled && timeElapsed % 10 === 0 && navigator.vibrate) {
					navigator.vibrate(200);
				}

				// Update focus area based on exploration mode
				if (explorationMode === "sequential") {
					const areaIndex = Math.floor(
						(timeElapsed / duration) * focusAreas.length,
					);
					setCurrentFocus(
						focusAreas[Math.min(areaIndex, focusAreas.length - 1)],
					);
				} else if (explorationMode === "random" && timeElapsed % 10 === 0) {
					const randomIndex = Math.floor(Math.random() * focusAreas.length);
					setCurrentFocus(focusAreas[randomIndex]);
				} else if (explorationMode === "single" && !currentFocus) {
					setCurrentFocus(focusAreas[0]);
				}
			}, 1000);
		} else if (timeElapsed >= duration && isPlaying) {
			setIsPlaying(false);
			setShowPostPractice(true);
			if (vibrationEnabled && navigator.vibrate) {
				navigator.vibrate([200, 100, 200]); // Completion pattern
			}
		}

		return () => {
			if (intervalRef.current) clearTimeout(intervalRef.current);
		};
	}, [
		isPlaying,
		timeElapsed,
		duration,
		explorationMode,
		visualPulse,
		vibrationEnabled,
	]);

	const handleStart = () => {
		setIsPlaying(true);
		setTimeElapsed(0);
		if (explorationMode !== "free") {
			setCurrentFocus(focusAreas[0]);
		}
	};

	const handleComplete = () => {
		const data = {
			duration: timeElapsed,
			approaches: selectedApproaches,
			explorationMode,
			sensoryMode,
			practiceMethod,
			sensoryExperience,
			supportFocus,
			savePreferences,
			timestamp: new Date().toISOString(),
		};

		if (savePreferences) {
			// Save preferences to localStorage
			localStorage.setItem(
				"bodyAwarenessPreferences",
				JSON.stringify({
					duration,
					approaches: selectedApproaches,
					explorationMode,
					sensoryMode,
					highContrast,
					visualPulse,
					vibrationEnabled,
				}),
			);
		}

		if (onComplete) onComplete(data);
		onClose();
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const bgColor = highContrast ? "#000000" : "#FFFFFF";
	const textColor = highContrast ? "#FFFFFF" : "#1A1A1A";
	const accentColor = highContrast ? "#FFFF00" : "#5C7F4F";

	if (showCustomize) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div
					className={`rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${highContrast ? "bg-black text-white" : "bg-white"}`}
				>
					<div className="p-8">
						<h2 className="text-2xl font-bold mb-6">
							Customize Your Experience
						</h2>

						{/* Sensory Mode */}
						<div className="mb-6">
							<p className="font-semibold mb-3">Sensory Preference:</p>
							<div className="space-y-2">
								{[
									{
										id: "seeking",
										label: "Sensory Seeking",
										desc: "More input (movement/pressure/texture)",
									},
									{
										id: "avoiding",
										label: "Sensory Avoiding",
										desc: "Less input (stillness/quiet/soft)",
									},
									{
										id: "balanced",
										label: "Balanced",
										desc: "Moderate sensory input",
									},
								].map((mode) => (
									<label
										key={mode.id}
										className={`flex items-start p-3 rounded-lg border cursor-pointer ${
											highContrast
												? "border-white hover:bg-gray-900"
												: "border-gray-300 hover:bg-gray-50"
										}`}
									>
										<input
											type="radio"
											name="sensoryMode"
											value={mode.id}
											checked={sensoryMode === mode.id}
											onChange={(e) => setSensoryMode(e.target.value as any)}
											className="mr-3 mt-1"
										/>
										<div>
											<p className="font-medium">{mode.label}</p>
											<p
												className={`text-sm ${highContrast ? "text-gray-300" : "text-gray-600"}`}
											>
												{mode.desc}
											</p>
										</div>
									</label>
								))}
							</div>
						</div>

						{/* Accessibility Options */}
						<div className="mb-6">
							<p className="font-semibold mb-3">Accessibility Options:</p>
							<div className="space-y-3">
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={highContrast}
										onChange={(e) => setHighContrast(e.target.checked)}
										className="mr-3"
									/>
									<span>High Contrast Mode</span>
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={visualPulse}
										onChange={(e) => setVisualPulse(e.target.checked)}
										className="mr-3"
									/>
									<span>Visual Timer Pulse</span>
								</label>
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={vibrationEnabled}
										onChange={(e) => setVibrationEnabled(e.target.checked)}
										className="mr-3"
									/>
									<span>Vibration Cues (if device supports)</span>
								</label>
							</div>
						</div>

						<div className="flex gap-3">
							<button
								onClick={() => setShowCustomize(false)}
								className={`px-6 py-3 rounded-lg font-semibold ${
									highContrast
										? "bg-white text-black"
										: "bg-green-600 text-white"
								}`}
							>
								Save Settings
							</button>
							<button
								onClick={() => setShowCustomize(false)}
								className={`px-6 py-3 rounded-lg font-semibold border ${
									highContrast ? "border-white" : "border-gray-300"
								}`}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (showPostPractice) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div
					className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${highContrast ? "bg-black text-white" : "bg-white"}`}
				>
					<div className="p-8">
						<h2 className="text-2xl font-bold mb-2">Your Experience Matters</h2>
						<p
							className={
								highContrast ? "text-gray-300 mb-6" : "text-gray-600 mb-6"
							}
						>
							Share what worked for you
						</p>

						{/* Practice Method */}
						<div className="mb-6">
							<p className="font-semibold mb-3">How did you practice today?</p>
							<div className="space-y-2">
								{[
									"Movement/rocking/swaying",
									"Pressure/touch/squeezing",
									"Visualization/imagination",
									"Structured pattern",
									"Free exploration",
									"Stimming/regulation",
								].map((method) => (
									<label
										key={method}
										className={`flex items-center p-3 rounded-lg border cursor-pointer ${
											highContrast
												? "border-white hover:bg-gray-900"
												: "border-gray-300 hover:bg-gray-50"
										}`}
									>
										<input
											type="checkbox"
											value={method}
											checked={practiceMethod.includes(method)}
											onChange={(e) => {
												if (e.target.checked) {
													setPracticeMethod([...practiceMethod, method]);
												} else {
													setPracticeMethod(
														practiceMethod.filter((m) => m !== method),
													);
												}
											}}
											className="mr-3"
										/>
										<span>{method}</span>
									</label>
								))}
							</div>
						</div>

						{/* Sensory Experience */}
						<div className="mb-6">
							<p className="font-semibold mb-3">Sensory experience:</p>
							<div className="space-y-2">
								{[
									"Just right amount of input",
									"Needed more sensory input",
									"Needed less sensory input",
									"Mixed - some parts good, others not",
								].map((exp) => (
									<label
										key={exp}
										className={`flex items-center p-3 rounded-lg border cursor-pointer ${
											highContrast
												? "border-white hover:bg-gray-900"
												: "border-gray-300 hover:bg-gray-50"
										}`}
									>
										<input
											type="radio"
											name="sensoryExp"
											value={exp}
											checked={sensoryExperience === exp}
											onChange={(e) => setSensoryExperience(e.target.value)}
											className="mr-3"
										/>
										<span>{exp}</span>
									</label>
								))}
							</div>
						</div>

						{/* What Supported Focus */}
						<div className="mb-6">
							<p className="font-semibold mb-3">What supported your focus?</p>
							<div className="space-y-2">
								{[
									"Visual cues",
									"Vibration/rhythm",
									"Counting/structure",
									"Freedom to move",
									"Predictable pattern",
									"My own stims",
								].map((support) => (
									<label
										key={support}
										className={`flex items-center p-3 rounded-lg border cursor-pointer ${
											highContrast
												? "border-white hover:bg-gray-900"
												: "border-gray-300 hover:bg-gray-50"
										}`}
									>
										<input
											type="checkbox"
											value={support}
											checked={supportFocus.includes(support)}
											onChange={(e) => {
												if (e.target.checked) {
													setSupportFocus([...supportFocus, support]);
												} else {
													setSupportFocus(
														supportFocus.filter((s) => s !== support),
													);
												}
											}}
											className="mr-3"
										/>
										<span>{support}</span>
									</label>
								))}
							</div>
						</div>

						{/* Save Preferences */}
						<div className="mb-6">
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={savePreferences}
									onChange={(e) => setSavePreferences(e.target.checked)}
									className="mr-3"
								/>
								<span>Save these preferences for next time</span>
							</label>
						</div>

						<div className="flex gap-3">
							<button
								onClick={handleComplete}
								className={`flex-1 px-6 py-3 rounded-lg font-semibold ${
									highContrast
										? "bg-white text-black"
										: "bg-green-600 text-white"
								}`}
							>
								{savePreferences ? "Create My Pattern" : "Complete"}
							</button>
							<button
								onClick={onClose}
								className={`px-6 py-3 rounded-lg font-semibold border ${
									highContrast ? "border-white" : "border-gray-300"
								}`}
							>
								No Thanks
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
				className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${highContrast ? "bg-black text-white" : "bg-white"}`}
			>
				<div className="p-8">
					{/* Header */}
					<div className="flex justify-between items-start mb-6">
						<div>
							<h2 className="text-2xl font-bold mb-2">
								Body Awareness Journey
							</h2>
							<p className={highContrast ? "text-gray-300" : "text-gray-600"}>
								Notice and connect in your own way
							</p>
						</div>
						<div className="flex gap-2">
							<button
								onClick={() => setShowCustomize(true)}
								className={`p-2 rounded-lg ${highContrast ? "text-white hover:bg-gray-900" : "text-gray-600 hover:bg-gray-100"}`}
								aria-label="Customize settings"
							>
								<Settings className="w-5 h-5" />
							</button>
							<button
								onClick={onClose}
								className={`p-2 rounded-lg ${highContrast ? "text-white hover:bg-gray-900" : "text-gray-400 hover:text-gray-600"}`}
								aria-label="Close"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
					</div>

					{/* Duration Selector */}
					<div className="mb-6">
						<p className="text-sm font-semibold mb-2">Choose your duration:</p>
						<div className="flex gap-2 flex-wrap">
							{[30, 60, 120, 180].map((seconds) => (
								<button
									key={seconds}
									onClick={() => setDuration(seconds)}
									className={`px-4 py-2 rounded-lg border ${
										duration === seconds
											? highContrast
												? "bg-white text-black border-white"
												: "bg-green-50 border-green-500"
											: highContrast
												? "border-white"
												: "border-gray-300"
									}`}
									aria-pressed={duration === seconds}
								>
									{seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
								</button>
							))}
							<input
								type="number"
								placeholder="Custom (sec)"
								value={customDuration}
								onChange={(e) => {
									setCustomDuration(e.target.value);
									if (e.target.value) setDuration(parseInt(e.target.value));
								}}
								className={`px-3 py-2 rounded-lg border w-32 ${
									highContrast
										? "bg-black border-white text-white"
										: "border-gray-300"
								}`}
								min="10"
								max="600"
							/>
						</div>
					</div>

					{/* Ways to Practice */}
					<div className="mb-6">
						<p className="text-sm font-semibold mb-3">
							Ways to Practice (choose what works for you):
						</p>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
							{approachOptions.map((approach) => {
								const Icon = approach.icon;
								const isSelected = selectedApproaches.includes(approach.id);
								return (
									<button
										key={approach.id}
										onClick={() => {
											if (isSelected) {
												setSelectedApproaches(
													selectedApproaches.filter((a) => a !== approach.id),
												);
											} else {
												setSelectedApproaches([
													...selectedApproaches,
													approach.id,
												]);
											}
										}}
										className={`p-3 rounded-lg border text-left ${
											isSelected
												? highContrast
													? "bg-white text-black border-white"
													: "bg-green-50 border-green-500"
												: highContrast
													? "border-white"
													: "border-gray-300"
										}`}
										aria-pressed={isSelected}
									>
										<Icon
											className={`w-5 h-5 mb-2 ${isSelected ? (highContrast ? "text-black" : "text-green-600") : highContrast ? "text-white" : "text-gray-500"}`}
										/>
										<p
											className={`font-medium text-sm ${highContrast && isSelected ? "text-black" : ""}`}
										>
											{approach.label}
										</p>
										<p
											className={`text-xs mt-1 ${
												highContrast
													? isSelected
														? "text-gray-700"
														: "text-gray-400"
													: "text-gray-500"
											}`}
										>
											{approach.desc}
										</p>
									</button>
								);
							})}
						</div>
					</div>

					{/* Neurodivergent-Friendly Options */}
					<div className="mb-6">
						<p className="text-sm font-semibold mb-3">Exploration Mode:</p>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
							{explorationModes.map((mode) => {
								const Icon = mode.icon;
								const isSelected = explorationMode === mode.id;
								return (
									<button
										key={mode.id}
										onClick={() => setExplorationMode(mode.id as any)}
										className={`p-3 rounded-lg border text-center ${
											isSelected
												? highContrast
													? "bg-white text-black border-white"
													: "bg-green-50 border-green-500"
												: highContrast
													? "border-white"
													: "border-gray-300"
										}`}
										aria-pressed={isSelected}
									>
										<Icon
											className={`w-5 h-5 mx-auto mb-1 ${isSelected ? (highContrast ? "text-black" : "text-green-600") : highContrast ? "text-white" : "text-gray-500"}`}
										/>
										<p
											className={`font-medium text-xs ${highContrast && isSelected ? "text-black" : ""}`}
										>
											{mode.label}
										</p>
										<p
											className={`text-xs mt-1 ${
												highContrast
													? isSelected
														? "text-gray-700"
														: "text-gray-400"
													: "text-gray-500"
											}`}
										>
											{mode.desc}
										</p>
									</button>
								);
							})}
						</div>
					</div>

					{/* Current Focus Display */}
					{currentFocus && (
						<div
							className={`mb-6 p-6 rounded-xl ${
								highContrast ? "bg-gray-900 border border-white" : "bg-green-50"
							}`}
						>
							<p
								className={`text-sm mb-2 ${highContrast ? "text-gray-300" : "text-gray-600"}`}
							>
								Current Focus:
							</p>
							<p
								className={`text-2xl font-bold ${highContrast ? "text-yellow-400" : "text-green-700"}`}
							>
								{currentFocus}
							</p>
						</div>
					)}

					{/* Timer Display with Visual Progress */}
					<div className="text-center mb-6">
						<div
							className={`text-4xl font-bold mb-4 ${highContrast ? "text-yellow-400" : "text-gray-900"}`}
						>
							{formatTime(timeElapsed)} / {formatTime(duration)}
						</div>
						<div
							className={`w-full rounded-full h-3 ${highContrast ? "bg-gray-800" : "bg-gray-200"}`}
						>
							<div
								className={`h-3 rounded-full transition-all duration-1000 ${
									visualPulse && isPlaying ? "animate-pulse" : ""
								}`}
								style={{
									width: `${(timeElapsed / duration) * 100}%`,
									backgroundColor: highContrast ? "#FFFF00" : "#5C7F4F",
								}}
							/>
						</div>
						{/* Visual color blocks for progress */}
						<div className="flex gap-1 mt-2">
							{Array.from({ length: 10 }).map((_, i) => (
								<div
									key={i}
									className={`flex-1 h-2 rounded ${
										timeElapsed >= (duration / 10) * (i + 1)
											? highContrast
												? "bg-yellow-400"
												: "bg-green-500"
											: highContrast
												? "bg-gray-800"
												: "bg-gray-300"
									}`}
								/>
							))}
						</div>
					</div>

					{/* Comfort Reminders */}
					<div
						className={`mb-6 p-4 rounded-lg ${
							highContrast
								? "bg-gray-900 border border-white"
								: "bg-blue-50 border border-blue-200"
						}`}
					>
						<p
							className={`text-sm font-semibold mb-2 ${highContrast ? "text-yellow-400" : "text-blue-900"}`}
						>
							Comfort Reminders:
						</p>
						<ul
							className={`text-sm space-y-1 ${highContrast ? "text-gray-300" : "text-blue-800"}`}
						>
							<li>• Your natural movement patterns are welcome here</li>
							<li>
								• Stimming, rocking, or fidgeting can be part of this practice
							</li>
							<li>• You don't have to be still unless that feels good</li>
							<li>• Skip any instruction that doesn't match your needs</li>
							<li>• Tension sometimes provides needed input - that's okay</li>
							<li>• Stop or change anytime without explanation</li>
						</ul>
					</div>

					{/* Controls */}
					<div className="flex justify-center gap-4">
						{!isPlaying ? (
							<button
								onClick={handleStart}
								className={`flex items-center px-8 py-3 rounded-lg font-semibold ${
									highContrast
										? "bg-white text-black"
										: "bg-green-600 text-white"
								}`}
								aria-label="Start practice"
							>
								<Play className="w-5 h-5 mr-2" />
								Start When Ready
							</button>
						) : (
							<button
								onClick={() => setIsPlaying(false)}
								className={`flex items-center px-8 py-3 rounded-lg font-semibold ${
									highContrast
										? "bg-yellow-400 text-black"
										: "bg-orange-500 text-white"
								}`}
								aria-label="Pause practice"
							>
								<Pause className="w-5 h-5 mr-2" />
								Pause
							</button>
						)}
						<button
							onClick={() => {
								setIsPlaying(false);
								setTimeElapsed(0);
								setCurrentFocus("");
							}}
							className={`flex items-center px-6 py-3 rounded-lg font-semibold border ${
								highContrast ? "border-white text-white" : "border-gray-300"
							}`}
							aria-label="Reset practice"
						>
							<RotateCcw className="w-5 h-5 mr-2" />
							Reset
						</button>
					</div>

					{/* Alternative Approaches */}
					<div
						className={`mt-6 p-4 rounded-lg ${
							highContrast ? "bg-gray-900 border border-white" : "bg-gray-50"
						}`}
					>
						<p className="text-sm font-semibold mb-2">
							Alternative Approaches:
						</p>
						<ul
							className={`text-sm space-y-1 ${highContrast ? "text-gray-300" : "text-gray-600"}`}
						>
							<li>
								• <strong>Sensory seeking:</strong> Add more input
								(movement/pressure/texture)
							</li>
							<li>
								• <strong>Sensory avoiding:</strong> Reduce input
								(stillness/quiet/soft)
							</li>
							<li>
								• <strong>Proprioceptive:</strong> Focus on joint and muscle
								awareness
							</li>
							<li>
								• <strong>Vestibular:</strong> Include balance and spatial
								awareness
							</li>
							<li>
								• <strong>Interoceptive:</strong> Notice internal sensations
							</li>
							<li>
								• <strong>Structured countdown:</strong> 10-9-8... through body
								parts
							</li>
							<li>
								• <strong>Free flow:</strong> No structure, just be with your
								body
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};
