import { Pause, Play, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface BetweenLanguagesResetProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

type ResetDuration = "10s" | "30s" | "3m" | "5m";

interface ResetData {
	mentalClarity: number;
	languageSeparation: number;
	readiness: number;
	helpfulMethod: string;
	nextAdjustment: string;
	professionalInsight: string;
	duration: number;
	timestamp: string;
}

export const BetweenLanguagesReset: React.FC<BetweenLanguagesResetProps> = ({
	onClose,
	onComplete,
}) => {
	// Core states
	const [phase, setPhase] = useState<"setup" | "practice" | "reflection">(
		"setup",
	);
	const [isPlaying, setIsPlaying] = useState(false);
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [selectedDuration, setSelectedDuration] = useState<ResetDuration>("3m");
	const [currentFocus, setCurrentFocus] = useState("Mental Spaciousness");

	// Practice states
	const [signedLanguageMode, setSignedLanguageMode] = useState(false);

	// Reflection states
	const [mentalClarity, setMentalClarity] = useState(5);
	const [languageSeparation, setLanguageSeparation] = useState(5);
	const [readiness, setReadiness] = useState(5);
	const [helpfulMethod, setHelpfulMethod] = useState("");
	const [nextAdjustment, setNextAdjustment] = useState("");
	const [professionalInsight, setProfessionalInsight] = useState("");
	const [savePreferences, setSavePreferences] = useState(false);
	const [trackPatterns, setTrackPatterns] = useState(false);
	const [setReminder, setSetReminder] = useState(false);

	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Load preferences
	useEffect(() => {
		const saved = localStorage.getItem("betweenLanguagesResetPrefs");
		if (saved) {
			const prefs = JSON.parse(saved);
			setSelectedDuration(prefs.duration || "3m");
			setSignedLanguageMode(prefs.signedLanguage || false);
		}
	}, []);

	// Timer effect
	useEffect(() => {
		if (isPlaying && phase === "practice") {
			intervalRef.current = setInterval(() => {
				setTimeElapsed((prev) => {
					const next = prev + 1;

					const durationSeconds = {
						"10s": 10,
						"30s": 30,
						"3m": 180,
						"5m": 300,
					}[selectedDuration];

					// Update focus message based on progress
					const progress = next / durationSeconds;
					if (progress < 0.33) {
						setCurrentFocus("Let the last interpretation fade");
					} else if (progress < 0.66) {
						setCurrentFocus("Clear space between languages");
					} else {
						setCurrentFocus("Return to your center");
					}

					if (next >= durationSeconds) {
						handleComplete();
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
	}, [isPlaying, phase, selectedDuration]);

	const resetOptions = [
		{
			title: "Language Pause",
			description: "Let all words rest for a moment",
		},
		{
			title: "Home Language",
			description: "Return to your first language briefly",
		},
		{
			title: "Physical Release",
			description: "Gentle movement to mark the transition",
		},
		{
			title: "Mental Filing",
			description: "Visualize putting work away",
		},
	];

	const handleStart = () => {
		setPhase("practice");
		setIsPlaying(true);
		setTimeElapsed(0);
	};

	const handlePause = () => {
		setIsPlaying(!isPlaying);
	};

	const handleComplete = () => {
		setIsPlaying(false);
		setPhase("reflection");
	};

	const handleSubmit = () => {
		const data: ResetData = {
			mentalClarity,
			languageSeparation,
			readiness,
			helpfulMethod,
			nextAdjustment,
			professionalInsight,
			duration: timeElapsed,
			timestamp: new Date().toISOString(),
		};

		if (savePreferences) {
			localStorage.setItem(
				"betweenLanguagesResetPrefs",
				JSON.stringify({
					duration: selectedDuration,
					signedLanguage: signedLanguageMode,
				}),
			);
		}

		if (trackPatterns) {
			const sessions = JSON.parse(
				localStorage.getItem("betweenLanguagesSessions") || "[]",
			);
			sessions.push(data);
			localStorage.setItem(
				"betweenLanguagesSessions",
				JSON.stringify(sessions),
			);
		}

		if (onComplete) onComplete(data);
		onClose();
	};

	const getDurationSeconds = () => {
		return {
			"10s": 10,
			"30s": 30,
			"3m": 180,
			"5m": 300,
		}[selectedDuration];
	};

	const getProgress = () => {
		return Math.min((timeElapsed / getDurationSeconds()) * 100, 100);
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const formatDuration = (duration: ResetDuration) => {
		return {
			"10s": "0:10",
			"30s": "0:30",
			"3m": "3:00",
			"5m": "5:00",
		}[duration];
	};

	// Setup phase
	if (phase === "setup") {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div className="rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50">
					<div className="p-8">
						{/* Header */}
						<div className="flex justify-between items-start mb-8">
							<div>
								<h1 className="text-3xl font-bold mb-2 text-gray-900">
									Between Languages Reset
								</h1>
								<p className="text-lg text-gray-600">
									Clear your mind between interpretations
								</p>
							</div>
							<button
								onClick={onClose}
								className="p-2 hover:bg-white/50 rounded-xl transition-all"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						{/* Duration selection */}
						<div className="mb-8">
							<h2 className="text-lg font-medium mb-4 text-gray-700">
								How long do you need?
							</h2>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
								{[
									{
										id: "10s" as ResetDuration,
										label: "10 seconds",
										desc: "Quick switch",
									},
									{
										id: "30s" as ResetDuration,
										label: "30 seconds",
										desc: "Standard reset",
									},
									{
										id: "3m" as ResetDuration,
										label: "3 minutes",
										desc: "Complete clear",
									},
									{
										id: "5m" as ResetDuration,
										label: "5 minutes",
										desc: "Deep restoration",
									},
								].map((duration) => (
									<button
										key={duration.id}
										onClick={() => setSelectedDuration(duration.id)}
										className={`p-4 rounded-2xl border-2 text-center transition-all ${
											selectedDuration === duration.id
												? "bg-white border-purple-400 shadow-lg"
												: "bg-white/50 border-transparent hover:bg-white/70"
										}`}
									>
										<div className="font-semibold text-gray-800">
											{duration.label}
										</div>
										<div className="text-sm mt-1 text-gray-600">
											• {duration.desc}
										</div>
									</button>
								))}
							</div>
						</div>

						{/* Reset Options */}
						<div className="mb-8">
							<h2 className="text-lg font-medium mb-2 text-gray-700">
								Your Reset Options:
							</h2>
							<p className="text-gray-600 mb-4">
								Find what helps you transition
							</p>

							<div className="grid md:grid-cols-2 gap-4 mb-6">
								{resetOptions.map((option, index) => (
									<div key={index} className="bg-white/70 rounded-2xl p-4">
										<h3 className="font-semibold text-gray-800 mb-1">
											{option.title}
										</h3>
										<p className="text-sm text-gray-600">
											{option.description}
										</p>
									</div>
								))}
							</div>

							{/* Modality-specific guidance */}
							<div className="grid md:grid-cols-2 gap-4">
								<div className="bg-purple-50 rounded-2xl p-5">
									<h3 className="font-semibold mb-3 text-purple-900">
										For Signed Language Interpreters:
									</h3>
									<ul className="space-y-2 text-sm text-purple-800">
										<li>• Let your hands rest or gently shake them out</li>
										<li>• Shift your visual focus to something restful</li>
										<li>• Roll shoulders to release signing posture</li>
										<li>• Soften your facial muscles</li>
									</ul>
								</div>

								<div className="bg-blue-50 rounded-2xl p-5">
									<h3 className="font-semibold mb-3 text-blue-900">
										For Spoken Language Interpreters:
									</h3>
									<ul className="space-y-2 text-sm text-blue-800">
										<li>• Let your voice rest completely</li>
										<li>• Breathe without forming words</li>
										<li>• Release jaw and throat tension</li>
										<li>• Return to your natural speaking rhythm</li>
									</ul>
								</div>
							</div>
						</div>

						{/* Why this supports you */}
						<div className="mb-8 p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl">
							<h3 className="font-semibold mb-2 text-gray-900">
								Why This Supports You:
							</h3>
							<p className="text-gray-700">
								Your brain's language centers (Broca's and Wernicke's areas)
								stay activated after interpreting. This reset reduces
								cross-language interference, helping you start fresh.
							</p>
						</div>

						{/* Duration guides */}
						<div className="mb-8 space-y-4">
							<div className="bg-white/70 rounded-2xl p-5">
								<h3 className="font-semibold text-gray-800 mb-3">
									Quick 10-Second Version:
								</h3>
								<ul className="space-y-1 text-gray-600">
									<li>• Three gentle breaths</li>
									<li>• Soft shoulder roll</li>
									<li>• Return to center</li>
								</ul>
							</div>

							<div className="bg-white/70 rounded-2xl p-5">
								<h3 className="font-semibold text-gray-800 mb-3">
									30-Second Version:
								</h3>
								<ul className="space-y-1 text-gray-600">
									<li>• Release physical tension</li>
									<li>• Let language fade</li>
									<li>• Brief grounding moment</li>
									<li>• Ready stance</li>
								</ul>
							</div>

							<div className="bg-white/70 rounded-2xl p-5">
								<h3 className="font-semibold text-gray-800 mb-3">
									3-Minute Full Reset:
								</h3>
								<ul className="space-y-1 text-gray-600">
									<li>• Physical release (30 seconds)</li>
									<li>• Language clearing (1 minute)</li>
									<li>• Mental transition (1 minute)</li>
									<li>• Professional grounding (30 seconds)</li>
								</ul>
							</div>
						</div>

						{/* Adapt as needed */}
						<div className="mb-8 p-5 bg-amber-50 rounded-2xl">
							<h3 className="font-semibold mb-3 text-amber-900">
								Adapt As Needed:
							</h3>
							<ul className="space-y-2 text-sm text-amber-800">
								<li>• Between every assignment or just difficult ones</li>
								<li>• Add movement if it helps you transition</li>
								<li>• Use visualization if that works better</li>
								<li>• Make it shorter or longer based on your needs</li>
							</ul>
						</div>

						{/* Remember */}
						<div className="mb-8 p-5 bg-green-50 rounded-2xl">
							<h3 className="font-semibold mb-3 text-green-900">Remember:</h3>
							<ul className="space-y-2 text-sm text-green-800">
								<li>• This is professional maintenance, not a luxury</li>
								<li>• Your accuracy improves with clear transitions</li>
								<li>• Every interpreter needs transition time</li>
								<li>• Small resets prevent bigger fatigue</li>
							</ul>
						</div>

						{/* Progress indicator */}
						<div className="mb-8">
							<p className="text-sm text-gray-600 mb-2">Progress:</p>
							<div className="flex gap-1">
								{[...Array(10)].map((_, i) => (
									<div
										key={i}
										className={`h-2 w-full rounded-full ${
											i === 3 ? "bg-purple-500" : "bg-gray-300"
										}`}
									/>
								))}
							</div>
						</div>

						{/* Start button */}
						<div className="flex gap-3">
							<button
								onClick={handleStart}
								className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold text-lg hover:opacity-90 transition-all"
							>
								Begin Reset
							</button>
							<button
								onClick={onClose}
								className="px-6 py-4 bg-white/70 hover:bg-white rounded-2xl font-medium text-gray-700 transition-all"
							>
								Skip to End
							</button>
							<button className="px-6 py-4 bg-white/70 hover:bg-white rounded-2xl font-medium text-gray-700 transition-all">
								Save Preferences
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Practice phase
	if (phase === "practice") {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div className="rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50">
					<div className="p-8">
						{/* Header */}
						<div className="flex justify-between items-center mb-8">
							<h2 className="text-2xl font-bold text-gray-900">
								Current Focus:
							</h2>
							<button
								onClick={onClose}
								className="p-2 hover:bg-white/50 rounded-xl transition-all"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						{/* Main focus area */}
						<div className="mb-8 p-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl text-center text-white">
							<h3 className="text-3xl font-light mb-4">Mental Spaciousness</h3>
							<p className="text-xl opacity-90">{currentFocus}</p>
						</div>

						{/* Circular progress indicator */}
						<div className="mb-8 flex justify-center">
							<div className="relative w-32 h-32">
								<svg className="w-32 h-32 transform -rotate-90">
									<circle
										cx="64"
										cy="64"
										r="60"
										stroke="rgba(209, 213, 219, 0.5)"
										strokeWidth="8"
										fill="none"
									/>
									<circle
										cx="64"
										cy="64"
										r="60"
										stroke="url(#gradient)"
										strokeWidth="8"
										fill="none"
										strokeDasharray={`${2 * Math.PI * 60}`}
										strokeDashoffset={`${2 * Math.PI * 60 * (1 - getProgress() / 100)}`}
										strokeLinecap="round"
										className="transition-all duration-1000"
									/>
									<defs>
										<linearGradient
											id="gradient"
											x1="0%"
											y1="0%"
											x2="100%"
											y2="0%"
										>
											<stop offset="0%" stopColor="#9333ea" />
											<stop offset="100%" stopColor="#3b82f6" />
										</linearGradient>
									</defs>
								</svg>
								<div className="absolute inset-0 flex items-center justify-center">
									<span className="text-2xl font-semibold text-gray-800">
										{Math.round(getProgress())}%
									</span>
								</div>
							</div>
						</div>

						{/* Timer display */}
						<div className="mb-8 text-center">
							<p className="text-lg text-gray-600">
								Timer: {formatTime(timeElapsed)} /{" "}
								{formatDuration(selectedDuration)}
							</p>
						</div>

						{/* Your Reset Options reminder */}
						<div className="mb-8 p-6 bg-white/70 rounded-2xl">
							<h3 className="font-semibold mb-3 text-gray-800">
								Your Reset Options:
							</h3>
							<p className="text-gray-600 mb-4">
								Find what helps you transition
							</p>
							<div className="grid grid-cols-2 gap-3">
								{resetOptions.map((option, index) => (
									<div
										key={index}
										className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl"
									>
										<p className="font-medium text-sm text-gray-700">
											{option.title}
										</p>
										<p className="text-xs text-gray-600 mt-1">
											{option.description}
										</p>
									</div>
								))}
							</div>
						</div>

						{/* Controls */}
						<div className="flex justify-center gap-3">
							<button
								onClick={handlePause}
								className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center gap-2"
							>
								{isPlaying ? (
									<Pause className="w-5 h-5" />
								) : (
									<Play className="w-5 h-5" />
								)}
								{isPlaying ? "Pause" : "Resume"}
							</button>
							<button
								onClick={handleComplete}
								className="px-8 py-3 bg-white/70 hover:bg-white rounded-xl font-medium text-gray-700 transition-all"
							>
								Complete Early
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Reflection phase - Post-Practice Check-In
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50">
				<div className="p-8">
					<h2 className="text-3xl font-bold mb-2 text-gray-900">
						POST-PRACTICE CHECK-IN
					</h2>
					<p className="mb-8 text-gray-600">How clear do you feel?</p>
					<p className="mb-6 text-sm text-gray-500">
						Quick check on your readiness
					</p>

					{/* Readiness scales */}
					<div className="mb-8 space-y-6">
						<div>
							<div className="flex justify-between mb-2">
								<span className="text-gray-700">Mental clarity:</span>
								<div className="flex items-center gap-3">
									<span className="text-sm text-gray-500">Foggy</span>
									<div className="relative w-48">
										<input
											type="range"
											min="1"
											max="10"
											value={mentalClarity}
											onChange={(e) =>
												setMentalClarity(parseInt(e.target.value))
											}
											className="w-full"
										/>
										<div
											className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-600 rounded-full pointer-events-none"
											style={{ left: `${(mentalClarity - 1) * 11.11}%` }}
										/>
									</div>
									<span className="text-sm text-gray-500">Sharp</span>
								</div>
							</div>
						</div>

						<div>
							<div className="flex justify-between mb-2">
								<span className="text-gray-700">Language separation:</span>
								<div className="flex items-center gap-3">
									<span className="text-sm text-gray-500">Mixed</span>
									<div className="relative w-48">
										<input
											type="range"
											min="1"
											max="10"
											value={languageSeparation}
											onChange={(e) =>
												setLanguageSeparation(parseInt(e.target.value))
											}
											className="w-full"
										/>
										<div
											className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-600 rounded-full pointer-events-none"
											style={{ left: `${(languageSeparation - 1) * 11.11}%` }}
										/>
									</div>
									<span className="text-sm text-gray-500">Distinct</span>
								</div>
							</div>
						</div>

						<div>
							<div className="flex justify-between mb-2">
								<span className="text-gray-700">Ready for next:</span>
								<div className="flex items-center gap-3">
									<span className="text-sm text-gray-500">Not yet</span>
									<div className="relative w-48">
										<input
											type="range"
											min="1"
											max="10"
											value={readiness}
											onChange={(e) => setReadiness(parseInt(e.target.value))}
											className="w-full"
										/>
										<div
											className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-600 rounded-full pointer-events-none"
											style={{ left: `${(readiness - 1) * 11.11}%` }}
										/>
									</div>
									<span className="text-sm text-gray-500">Prepared</span>
								</div>
							</div>
						</div>
					</div>

					{/* What helped most */}
					<div className="mb-6">
						<label className="block mb-3 font-medium text-gray-700">
							What helped most?
						</label>
						<div className="space-y-2">
							{[
								"The language pause",
								"Physical movement",
								"Mental transition",
								"Just taking time",
								"Other",
							].map((method) => (
								<label key={method} className="flex items-center">
									<input
										type="radio"
										name="helpfulMethod"
										value={method}
										checked={helpfulMethod === method}
										onChange={(e) => setHelpfulMethod(e.target.value)}
										className="mr-3"
									/>
									<span className="text-gray-700">{method}</span>
								</label>
							))}
						</div>
						{helpfulMethod === "Other" && (
							<input
								type="text"
								placeholder="Please specify..."
								className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
							/>
						)}
					</div>

					{/* For your next reset */}
					<div className="mb-6">
						<label className="block mb-3 font-medium text-gray-700">
							For your next reset?
						</label>
						<div className="space-y-2">
							{[
								"This worked well",
								"Need more time",
								"Need less time",
								"Try different method",
								"Other",
							].map((adjustment) => (
								<label key={adjustment} className="flex items-center">
									<input
										type="radio"
										name="nextAdjustment"
										value={adjustment}
										checked={nextAdjustment === adjustment}
										onChange={(e) => setNextAdjustment(e.target.value)}
										className="mr-3"
									/>
									<span className="text-gray-700">{adjustment}</span>
								</label>
							))}
						</div>
						{nextAdjustment === "Other" && (
							<input
								type="text"
								placeholder="Please specify..."
								className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
							/>
						)}
					</div>

					{/* Professional insight */}
					<div className="mb-8">
						<label className="block mb-2 font-medium text-gray-700">
							Professional insight: (optional)
						</label>
						<p className="text-sm text-gray-600 mb-2">
							What pattern are you noticing about your transitions?
						</p>
						<textarea
							value={professionalInsight}
							onChange={(e) => setProfessionalInsight(e.target.value)}
							placeholder="Your observations..."
							className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
							rows={3}
						/>
					</div>

					{/* Preferences */}
					<div className="mb-8 space-y-3">
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={savePreferences}
								onChange={(e) => setSavePreferences(e.target.checked)}
								className="mr-3"
							/>
							<span className="text-gray-700">Save my reset preferences</span>
						</label>
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={trackPatterns}
								onChange={(e) => setTrackPatterns(e.target.checked)}
								className="mr-3"
							/>
							<span className="text-gray-700">Track transition patterns</span>
						</label>
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={setReminder}
								onChange={(e) => setSetReminder(e.target.checked)}
								className="mr-3"
							/>
							<span className="text-gray-700">
								Set reminder between assignments
							</span>
						</label>
					</div>

					{/* Action buttons */}
					<div className="flex gap-3">
						<button
							onClick={handleSubmit}
							className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
						>
							Complete
						</button>
						<button
							onClick={() => {
								const data: ResetData = {
									mentalClarity,
									languageSeparation,
									readiness,
									helpfulMethod,
									nextAdjustment,
									professionalInsight,
									duration: timeElapsed,
									timestamp: new Date().toISOString(),
								};

								if (trackPatterns) {
									const sessions = JSON.parse(
										localStorage.getItem("betweenLanguagesSessions") || "[]",
									);
									sessions.push(data);
									localStorage.setItem(
										"betweenLanguagesSessions",
										JSON.stringify(sessions),
									);
								}

								onClose();
							}}
							className="px-6 py-3 bg-white/70 hover:bg-white rounded-xl font-medium text-gray-700 transition-all"
						>
							View My Patterns
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
