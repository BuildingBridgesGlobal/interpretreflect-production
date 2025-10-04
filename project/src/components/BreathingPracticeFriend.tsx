import { Pause, Play, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface BreathingPracticeProps {
	mode?: string; // Optional mode prop from App.tsx
	onClose: () => void;
	onComplete?: (data: any) => void;
}

type PracticeDuration = "30s" | "1m" | "2m" | "4m";
type BreathingStyle = "physiological" | "478" | "box" | "cyclic";
type VisualMode = "guide" | "timer" | "minimal";
type ColorTheme = "green" | "sage" | "forest" | "gray";

const COLOR_THEMES: Record<
	ColorTheme,
	{ primary: string; light: string; bg: string }
> = {
	green: { primary: "#2D5F3F", light: "#7A9B6E", bg: "#F0F5ED" },
	sage: { primary: "#7A9B6E", light: "#91B082", bg: "#F5F9F3" },
	forest: { primary: "#4A6B3E", light: "#2D5F3F", bg: "#EEF3EB" },
	gray: { primary: "#718096", light: "#A0AEC0", bg: "#F7FAFC" },
};

export const BreathingPractice: React.FC<BreathingPracticeProps> = ({
	onClose,
	onComplete,
}) => {
	const [phase, setPhase] = useState<
		"setup" | "settings" | "practice" | "reflection"
	>("setup");
	const [selectedDuration, setSelectedDuration] =
		useState<PracticeDuration>("2m");
	const [selectedStyle, setSelectedStyle] =
		useState<BreathingStyle>("physiological");
	const [visualMode, setVisualMode] = useState<VisualMode>("guide");
	const [colorTheme, setColorTheme] = useState<ColorTheme>("green");
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [isActive, setIsActive] = useState(false);
	const [breathPhase, setBreathPhase] = useState<"in" | "out" | "hold">("in");
	const [showSettings, setShowSettings] = useState(false);
	const [cycleCount, setCycleCount] = useState(0);

	// Reflection states
	const [howFeeling, setHowFeeling] = useState("");
	const [shareThoughts, setShareThoughts] = useState("");

	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// Get breathing timing for research-based techniques
	const getBreathingTiming = () => {
		switch (selectedStyle) {
			case "physiological":
				return { in: 2, hold: 0, out: 6 }; // Double inhale (1+1) + long exhale
			case "478":
				return { in: 4, hold: 7, out: 8 }; // 4-7-8 pattern
			case "box":
				return { in: 4, hold: 4, out: 4, hold2: 4 }; // Box breathing 4-4-4-4
			case "cyclic":
				return { in: 10, hold: 0, out: 10 }; // Cyclic sighing (5+5 inhale, 10 exhale)
			default:
				return { in: 4, hold: 0, out: 4 };
		}
	};

	// Timer effect
	useEffect(() => {
		if (isActive && phase === "practice") {
			intervalRef.current = setInterval(() => {
				setTimeElapsed((prev) => {
					const next = prev + 1;
					const durationSeconds = {
						"30s": 30,
						"1m": 60,
						"2m": 120,
						"4m": 240,
					}[selectedDuration];

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
	}, [isActive, phase, selectedDuration]);

	const handleComplete = () => {
		setIsActive(false);
		setPhase("reflection");
	};

	// Breathing animation effect
	useEffect(() => {
		if (isActive && phase === "practice" && visualMode === "guide") {
			const timing = getBreathingTiming();
			let cycleTime = 0;
			let currentCycle = 0;

			// Calculate total cycle duration
			const totalDuration =
				timing.in + (timing.hold || 0) + timing.out + (timing.hold2 || 0);

			breathIntervalRef.current = setInterval(() => {
				const prevCycleTime = cycleTime;
				cycleTime = (cycleTime + 0.1) % totalDuration;

				// Track cycle completion
				if (cycleTime < prevCycleTime) {
					currentCycle++;
					setCycleCount(currentCycle);

					// Auto-complete for techniques with specific cycle requirements
					if (selectedStyle === "physiological" && currentCycle >= 3) {
						handleComplete();
					} else if (selectedStyle === "478" && currentCycle >= 4) {
						handleComplete();
					}
				}

				// Determine current phase based on timing
				if (cycleTime < timing.in) {
					setBreathPhase("in");
				} else if (cycleTime < timing.in + (timing.hold || 0)) {
					setBreathPhase("hold");
				} else if (cycleTime < timing.in + (timing.hold || 0) + timing.out) {
					setBreathPhase("out");
				} else {
					setBreathPhase("hold"); // Second hold for box breathing
				}
			}, 100);
		}

		return () => {
			if (breathIntervalRef.current) {
				clearInterval(breathIntervalRef.current);
			}
		};
	}, [isActive, phase, selectedStyle, visualMode]);

	const handleStart = () => {
		setPhase("practice");
		setIsActive(true);
		setTimeElapsed(0);
		setCycleCount(0);
	};

	const handlePausePlay = () => {
		setIsActive(!isActive);
	};

	const handleSubmit = () => {
		// Just close and return to stress reset page
		onClose();
	};

	const handleBreatheAgain = () => {
		setPhase("setup");
		setTimeElapsed(0);
		setHowFeeling("");
		setShareThoughts("");
		setIsActive(false);
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const getDurationSeconds = () => {
		return { "30s": 30, "1m": 60, "2m": 120, "4m": 240 }[selectedDuration];
	};

	const colors = COLOR_THEMES[colorTheme];

	// Setup phase
	if (phase === "setup") {
		return (
			<div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
				<div className="rounded-3xl max-w-lg w-full bg-white shadow-sm">
					<div className="p-8">
						<div className="flex justify-between items-start mb-6">
							<div>
								<h1 className="text-2xl font-normal text-gray-700 mb-1">
									Breathing Practice
								</h1>
								<p className="text-gray-500">Let's breathe together</p>
							</div>
							<button
								onClick={onClose}
								className="p-2 rounded-xl transition-all hover:scale-105"
								style={{
									background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
								}}
							>
								<X className="w-5 h-5 text-white" />
							</button>
						</div>

						{/* Style selection */}
						<div className="mb-8">
							<p className="text-sm text-gray-600 mb-4">
								Choose your research-based technique:
							</p>
							<div className="space-y-2">
								{[
									{
										value: "physiological",
										label: "Physiological Sigh",
										desc: "Double inhale + long exhale (1-3 breaths)",
									},
									{
										value: "478",
										label: "4-7-8 Breathing",
										desc: "Inhale 4 - Hold 7 - Exhale 8 (4 cycles)",
									},
									{
										value: "box",
										label: "Box Breathing",
										desc: "4-4-4-4 pattern (2-5 minutes)",
									},
									{
										value: "cyclic",
										label: "Cyclic Sighing",
										desc: "Inhale 5 - Inhale 5 - Exhale 10 (5 min)",
									},
								].map((style) => (
									<button
										key={style.value}
										onClick={() =>
											setSelectedStyle(style.value as BreathingStyle)
										}
										className={`w-full p-3 rounded-xl text-left transition-all border ${
											selectedStyle === style.value
												? ""
												: "bg-gray-50 border-transparent"
										}`}
										style={{
											backgroundColor:
												selectedStyle === style.value ? colors.bg : undefined,
											borderColor:
												selectedStyle === style.value
													? colors.light
													: undefined,
										}}
										onMouseEnter={(e) => {
											if (selectedStyle !== style.value) {
												e.currentTarget.style.backgroundColor =
													"rgba(34, 197, 94, 0.2)";
											}
										}}
										onMouseLeave={(e) => {
											if (selectedStyle !== style.value) {
												e.currentTarget.style.backgroundColor = "#F9FAFB";
											}
										}}
									>
										<div className="flex justify-between items-center">
											<span className="text-gray-700">{style.label}</span>
											<span className="text-sm text-gray-500">
												{style.desc}
											</span>
										</div>
									</button>
								))}
							</div>
						</div>

						{/* Technique-specific tip */}
						<div
							className="mb-6 p-3 rounded-xl"
							style={{ backgroundColor: colors.bg }}
						>
							<p className="text-sm text-gray-600">
								{selectedStyle === "physiological" &&
									"Fastest stress relief - just 1-3 breaths needed. Double inhale fills alveoli, long exhale activates calm."}
								{selectedStyle === "478" &&
									"Dr. Weil's technique - acts as natural tranquilizer. Always exhale through mouth with whoosh sound."}
								{selectedStyle === "box" &&
									"Military-grade focus tool. Creates mental clarity and emotional control in high-stress situations."}
								{selectedStyle === "cyclic" &&
									"Stanford study: 5 min daily more effective than meditation for reducing anxiety and improving mood."}
							</p>
						</div>

						{/* Start button */}
						<button
							onClick={handleStart}
							className="w-full py-3 rounded-xl transition-all text-white font-medium hover:opacity-90"
							style={{
								background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
							}}
						>
							Let's Begin
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Settings phase
	if (phase === "settings") {
		return (
			<div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
				<div className="rounded-3xl max-w-lg w-full bg-white shadow-sm">
					<div className="p-8">
						<div className="flex justify-between items-start mb-6">
							<h2 className="text-xl font-normal text-gray-700">
								What works best for you?
							</h2>
							<button
								onClick={() => setPhase("setup")}
								className="p-2 hover:bg-green-100 rounded-xl"
							>
								<X className="w-5 h-5 text-gray-400" />
							</button>
						</div>

						{/* Visual mode */}
						<div className="mb-6">
							<p className="text-sm text-gray-600 mb-3">Visual preference:</p>
							<div className="space-y-2">
								<button
									onClick={() => setVisualMode("guide")}
									className={`w-full p-3 rounded-xl text-left transition-all border ${
										visualMode === "guide"
											? "border-2"
											: "bg-gray-50 border-transparent"
									}`}
									style={{
										backgroundColor:
											visualMode === "guide" ? colors.bg : undefined,
										borderColor:
											visualMode === "guide" ? colors.primary : undefined,
									}}
								>
									Breathe with the visual guide
								</button>
								<button
									onClick={() => setVisualMode("timer")}
									className={`w-full p-3 rounded-xl text-left transition-all border ${
										visualMode === "timer"
											? "border-2"
											: "bg-gray-50 border-transparent"
									}`}
									style={{
										backgroundColor:
											visualMode === "timer" ? colors.bg : undefined,
										borderColor:
											visualMode === "timer" ? colors.primary : undefined,
									}}
								>
									Just show me a timer
								</button>
								<button
									onClick={() => setVisualMode("minimal")}
									className={`w-full p-3 rounded-xl text-left transition-all border ${
										visualMode === "minimal"
											? "border-2"
											: "bg-gray-50 border-transparent"
									}`}
									style={{
										backgroundColor:
											visualMode === "minimal" ? colors.bg : undefined,
										borderColor:
											visualMode === "minimal" ? colors.primary : undefined,
									}}
								>
									Less movement please
								</button>
							</div>
						</div>

						{/* Color theme */}
						<div className="mb-8">
							<p className="text-sm text-gray-600 mb-3">Color preference:</p>
							<div className="grid grid-cols-2 gap-2">
								{[
									{ value: "green", label: "Soft green", desc: "natural" },
									{ value: "sage", label: "Sage", desc: "calming" },
									{ value: "forest", label: "Forest", desc: "grounding" },
									{ value: "gray", label: "Gray", desc: "neutral" },
								].map((color) => (
									<button
										key={color.value}
										onClick={() => setColorTheme(color.value as ColorTheme)}
										className={`p-3 rounded-xl text-center transition-all border ${
											colorTheme === color.value
												? "border-2"
												: "border-transparent"
										}`}
										style={{
											backgroundColor:
												COLOR_THEMES[color.value as ColorTheme].bg,
											borderColor:
												colorTheme === color.value
													? COLOR_THEMES[color.value as ColorTheme].primary
													: undefined,
										}}
									>
										<p className="text-gray-700">{color.label}</p>
										<p className="text-xs text-gray-500">({color.desc})</p>
									</button>
								))}
							</div>
						</div>

						<button
							onClick={() => setPhase("setup")}
							className="w-full py-3 rounded-xl transition-all text-white font-medium hover:bg-green-600"
							style={{ backgroundColor: colors.primary }}
						>
							Save What Works For Me
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Practice phase
	if (phase === "practice") {
		const breathingScale =
			breathPhase === "in" ? 1.2 : breathPhase === "hold" ? 1.2 : 0.85;
		const timing = getBreathingTiming();

		// Calculate transition duration based on current phase
		const getTransitionDuration = () => {
			if (breathPhase === "in") return timing.in * 1000;
			if (breathPhase === "hold") return (timing.hold || 0) * 1000;
			if (breathPhase === "out") return timing.out * 1000;
			return 4000; // Default
		};

		const getGuidanceText = () => {
			// Provide technique-specific guidance
			switch (selectedStyle) {
				case "physiological":
					if (timeElapsed === 0)
						return "Double inhale through nose, long exhale through mouth";
					if (timeElapsed < 10)
						return "First inhale... second inhale... long exhale";
					if (timeElapsed < 20) return "1-3 breaths is all you need";
					return "Immediate calm achieved";

				case "478":
					if (timeElapsed === 0)
						return "Inhale for 4, hold for 7, exhale for 8";
					if (timeElapsed < 20) return "Empty lungs completely first";
					if (timeElapsed < 40) return "Tongue tip behind front teeth";
					if (timeElapsed < 60) return "4 cycles total";
					return "Natural tranquilizer for the nervous system";

				case "box":
					if (timeElapsed === 0) return "4-4-4-4 pattern: in, hold, out, hold";
					if (timeElapsed < 30) return "Equal counts for each phase";
					if (timeElapsed < 60) return "Visualize drawing a box";
					if (timeElapsed < 120) return "Used by Navy SEALs for focus";
					return "Continue for 2-5 minutes";

				case "cyclic":
					if (timeElapsed === 0) return "Double inhale (5+5), long exhale (10)";
					if (timeElapsed < 60) return "Emphasize the long exhale";
					if (timeElapsed < 120) return "Activates parasympathetic response";
					if (timeElapsed < 180) return "More effective than meditation";
					if (timeElapsed < 240) return "Stanford research proven";
					return "5 minutes for best results";

				default:
					return "Follow the breathing guide";
			}
		};

		const getTitle = () => {
			switch (selectedStyle) {
				case "physiological":
					return "Physiological Sigh";
				case "478":
					return "4-7-8 Breathing";
				case "box":
					return "Box Breathing";
				case "cyclic":
					return "Cyclic Sighing";
				default:
					return "Breathing Practice";
			}
		};

		return (
			<div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
				<div className="max-w-md w-full text-center">
					<button
						onClick={onClose}
						className="absolute top-8 right-8 p-2 hover:bg-green-100 rounded-xl transition-all"
					>
						<X className="w-5 h-5 text-gray-300" />
					</button>

					{/* Title */}
					<h2 className="text-lg text-gray-600 mb-8">{getTitle()}</h2>

					{/* Visual guide */}
					{visualMode === "guide" && (
						<div className="flex flex-col items-center mb-8">
							<div
								className="w-32 h-32 rounded-full transition-all ease-in-out relative mb-4"
								style={{
									backgroundColor: colors.light,
									transform: `scale(${breathingScale})`,
									opacity: 0.4,
									boxShadow: `0 0 40px ${colors.primary}20`,
									transitionDuration: `${getTransitionDuration()}ms`,
								}}
							>
								<div
									className="absolute inset-4 rounded-full"
									style={{
										backgroundColor: colors.primary,
										opacity: 0.3,
									}}
								/>
							</div>
							{/* Breath phase indicator */}
							<p
								className="text-lg font-medium"
								style={{ color: colors.primary }}
							>
								{breathPhase === "in"
									? "Breathe In"
									: breathPhase === "hold"
										? "Hold"
										: "Breathe Out"}
							</p>
						</div>
					)}

					{/* Timer display */}
					{(visualMode === "timer" || visualMode === "minimal") && (
						<div className="mb-8">
							<p className="text-3xl font-light text-gray-600">
								{formatTime(timeElapsed)}
							</p>
							<p className="text-sm text-gray-400 mt-2">
								of {formatTime(getDurationSeconds())}
							</p>
						</div>
					)}

					{/* Timer bar */}
					<div className="text-sm text-gray-400 mb-2">
						Timer: {formatTime(timeElapsed)} /{" "}
						{formatTime(getDurationSeconds())}
					</div>

					{/* Cycle counter for specific techniques */}
					{(selectedStyle === "physiological" || selectedStyle === "478") && (
						<div className="text-sm mb-4" style={{ color: colors.primary }}>
							{selectedStyle === "physiological" &&
								`Breath ${cycleCount + 1} of 3`}
							{selectedStyle === "478" && `Cycle ${cycleCount + 1} of 4`}
						</div>
					)}

					{/* Guidance text */}
					<div className="h-16 flex items-center justify-center mb-8">
						<p className="text-gray-600 text-lg">{getGuidanceText()}</p>
					</div>

					{/* Encouragement */}
					{timeElapsed > 10 && timeElapsed % 20 < 5 && (
						<p className="text-sm text-gray-400 italic mb-6">
							You're doing great.
						</p>
					)}

					{/* Controls */}
					<div className="flex justify-center gap-3">
						<button
							onClick={handlePausePlay}
							className="px-6 py-2 rounded-lg flex items-center gap-2 transition-all border"
							style={{
								backgroundColor: colors.bg,
								borderColor: colors.light,
								color: colors.primary,
							}}
						>
							{isActive ? (
								<Pause className="w-4 h-4" />
							) : (
								<Play className="w-4 h-4" />
							)}
							{isActive ? "Pause" : "Resume"}
						</button>
						<button
							onClick={handleComplete}
							className="px-6 py-2 rounded-lg transition-all text-white hover:opacity-90"
							style={{
								background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
							}}
						>
							I'm Done
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Reflection phase
	return (
		<div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
			<div className="rounded-3xl max-w-lg w-full bg-white shadow-sm">
				<div className="p-8">
					<h2 className="text-xl font-normal text-gray-700 mb-6">
						How are you feeling now?
					</h2>

					{/* Feeling check */}
					<div className="mb-6">
						<div className="flex gap-2">
							{["Better", "About the same", "Need a bit more"].map((option) => (
								<button
									key={option}
									onClick={() => setHowFeeling(option)}
									className={`flex-1 py-3 px-3 rounded-xl transition-all text-sm ${
										howFeeling === option ? "text-white" : "text-gray-600"
									}`}
									style={{
										background:
											howFeeling === option
												? "linear-gradient(135deg, #2D5F3F, #5B9378)"
												: undefined,
										backgroundColor:
											howFeeling === option ? undefined : "#F0F5ED",
									}}
									onMouseEnter={(e) => {
										if (howFeeling !== option) {
											e.currentTarget.style.backgroundColor =
												"rgba(34, 197, 94, 0.2)";
										}
									}}
									onMouseLeave={(e) => {
										if (howFeeling !== option) {
											e.currentTarget.style.backgroundColor = "#F0F5ED";
										}
									}}
								>
									{option}
								</button>
							))}
						</div>
					</div>

					{/* Optional share */}
					<div className="mb-8">
						<p className="text-gray-600 mb-3">
							Want to share anything?{" "}
							<span className="text-gray-400">(optional)</span>
						</p>
						<textarea
							value={shareThoughts}
							onChange={(e) => setShareThoughts(e.target.value)}
							placeholder="How was that for you?"
							className="w-full p-3 rounded-xl bg-gray-50 text-gray-600 placeholder-gray-400 resize-none"
							rows={3}
						/>
					</div>

					<div className="flex gap-3">
						<button
							onClick={handleSubmit}
							className="flex-1 py-3 rounded-xl transition-all text-white font-medium hover:opacity-90"
							style={{
								background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
							}}
						>
							Done
						</button>
						<button
							onClick={handleBreatheAgain}
							className="flex-1 py-3 bg-gray-100 rounded-xl text-gray-700 font-medium transition-all"
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor =
									"rgba(34, 197, 94, 0.2)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "#F3F4F6";
							}}
						>
							Breathe Again
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
