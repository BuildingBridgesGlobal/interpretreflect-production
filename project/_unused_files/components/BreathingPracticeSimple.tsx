import { Pause, Play, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface BreathingPracticeProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

type PracticeDuration = "30s" | "1m" | "2m" | "4m";
type BreathingPace = "3" | "4" | "natural" | "no-count";

export const BreathingPractice: React.FC<BreathingPracticeProps> = ({
	onClose,
	onComplete,
}) => {
	const [phase, setPhase] = useState<
		"setup" | "practice" | "pace-change" | "reflection"
	>("setup");
	const [isPlaying, setIsPlaying] = useState(false);
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [selectedDuration, setSelectedDuration] =
		useState<PracticeDuration>("2m");
	const [selectedPace, setSelectedPace] = useState<BreathingPace>("4");
	const [breathPhase, setBreathPhase] = useState<
		"in" | "hold" | "out" | "rest"
	>("in");

	// Reflection states
	const [feelingCalmer, setFeelingCalmer] = useState("");
	const [paceFeeling, setPaceFeeling] = useState("");
	const [nextTime, setNextTime] = useState("");

	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// Get pace timing
	const getPaceTiming = () => {
		switch (selectedPace) {
			case "3":
				return { in: 3, hold: 3, out: 3, rest: 3 };
			case "4":
				return { in: 4, hold: 4, out: 4, rest: 4 };
			case "natural":
				return { in: 4, hold: 0, out: 6, rest: 0 };
			case "no-count":
				return { in: 3, hold: 0, out: 3, rest: 0 };
			default:
				return { in: 4, hold: 4, out: 4, rest: 4 };
		}
	};

	// Timer effect
	useEffect(() => {
		if (isPlaying && phase === "practice") {
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
	}, [isPlaying, phase, selectedDuration]);

	// Breath animation cycle
	useEffect(() => {
		if (isPlaying && phase === "practice") {
			const timing = getPaceTiming();
			let currentPhaseIndex = 0;
			const phases: Array<{
				phase: "in" | "hold" | "out" | "rest";
				duration: number;
			}> = [
				{ phase: "in", duration: timing.in },
				...(timing.hold > 0
					? [{ phase: "hold" as const, duration: timing.hold }]
					: []),
				{ phase: "out", duration: timing.out },
				...(timing.rest > 0
					? [{ phase: "rest" as const, duration: timing.rest }]
					: []),
			];

			const cycleBreath = () => {
				const currentPhase = phases[currentPhaseIndex];
				setBreathPhase(currentPhase.phase);

				breathIntervalRef.current = setTimeout(() => {
					currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
					cycleBreath();
				}, currentPhase.duration * 1000);
			};

			cycleBreath();
		}

		return () => {
			if (breathIntervalRef.current) {
				clearTimeout(breathIntervalRef.current);
			}
		};
	}, [isPlaying, phase, selectedPace]);

	const handleStart = () => {
		setPhase("practice");
		setIsPlaying(true);
		setTimeElapsed(0);
	};

	const handlePaceChange = () => {
		setIsPlaying(false);
		setPhase("pace-change");
	};

	const handleContinue = () => {
		setPhase("practice");
		setIsPlaying(true);
	};

	const handleComplete = () => {
		setIsPlaying(false);
		setPhase("reflection");
	};

	const handleSubmit = () => {
		const data = {
			feelingCalmer,
			paceFeeling,
			nextTime,
			duration: timeElapsed,
			pace: selectedPace,
			timestamp: new Date().toISOString(),
		};
		if (onComplete) onComplete(data);
		onClose();
	};

	const handleBreatheAgain = () => {
		setPhase("setup");
		setTimeElapsed(0);
		setFeelingCalmer("");
		setPaceFeeling("");
		setNextTime("");
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const getDurationSeconds = () => {
		return { "30s": 30, "1m": 60, "2m": 120, "4m": 240 }[selectedDuration];
	};

	const getBreathMessage = () => {
		switch (breathPhase) {
			case "in":
				return "Breathe in...";
			case "hold":
				return "Hold gently...";
			case "out":
				return "Breathe out slowly...";
			case "rest":
				return "Rest...";
			default:
				return "Breathe...";
		}
	};

	// Setup phase
	if (phase === "setup") {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div className="rounded-3xl max-w-2xl w-full bg-white">
					<div className="p-8">
						<div className="flex justify-between items-start mb-6">
							<div>
								<h1 className="text-2xl font-bold mb-1 text-gray-900">
									Breathing Practice
								</h1>
								<p className="text-gray-600">Find your calming pattern</p>
							</div>
							<button
								onClick={onClose}
								className="p-2 hover:bg-gray-100 rounded-xl"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						{/* Duration selection */}
						<div className="mb-6">
							<p className="text-sm font-medium mb-3 text-gray-700">
								How long?
							</p>
							<div className="flex gap-2">
								{["30s", "1m", "2m", "4m"].map((duration) => (
									<button
										key={duration}
										onClick={() =>
											setSelectedDuration(duration as PracticeDuration)
										}
										className={`px-4 py-2 rounded-lg font-medium transition-all ${
											selectedDuration === duration
												? "bg-indigo-600 text-white"
												: "bg-gray-100 hover:bg-gray-200 text-gray-700"
										}`}
									>
										{duration === "30s"
											? "30 sec"
											: duration === "1m"
												? "1 min"
												: duration === "2m"
													? "2 min"
													: "4 min"}
									</button>
								))}
							</div>
						</div>

						{/* Pace selection */}
						<div className="mb-6">
							<p className="text-sm font-medium mb-3 text-gray-700">
								Choose your pace:
							</p>
							<div className="space-y-3">
								<button
									onClick={() => setSelectedPace("4")}
									className={`w-full p-3 text-left rounded-xl transition-all ${
										selectedPace === "4"
											? "bg-indigo-50 border-2 border-indigo-500"
											: "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
									}`}
								>
									<h3 className="font-medium text-gray-800">Count of 4</h3>
									<p className="text-sm text-gray-600">
										Steady, even breathing
									</p>
								</button>

								<button
									onClick={() => setSelectedPace("3")}
									className={`w-full p-3 text-left rounded-xl transition-all ${
										selectedPace === "3"
											? "bg-indigo-50 border-2 border-indigo-500"
											: "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
									}`}
								>
									<h3 className="font-medium text-gray-800">Count of 3</h3>
									<p className="text-sm text-gray-600">Shorter, easier pace</p>
								</button>

								<button
									onClick={() => setSelectedPace("natural")}
									className={`w-full p-3 text-left rounded-xl transition-all ${
										selectedPace === "natural"
											? "bg-indigo-50 border-2 border-indigo-500"
											: "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
									}`}
								>
									<h3 className="font-medium text-gray-800">Natural Flow</h3>
									<p className="text-sm text-gray-600">
										Your own comfortable speed
									</p>
								</button>

								<button
									onClick={() => setSelectedPace("no-count")}
									className={`w-full p-3 text-left rounded-xl transition-all ${
										selectedPace === "no-count"
											? "bg-indigo-50 border-2 border-indigo-500"
											: "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
									}`}
								>
									<h3 className="font-medium text-gray-800">Just Breathe</h3>
									<p className="text-sm text-gray-600">No counting at all</p>
								</button>
							</div>
						</div>

						{/* Tip */}
						<div className="mb-6 p-4 bg-gray-50 rounded-xl">
							<p className="text-sm text-gray-700">
								<strong>Tip:</strong> Longer exhales calm your nervous system.
								But any steady breathing helps.
							</p>
						</div>

						{/* Start button */}
						<button
							onClick={handleStart}
							className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
						>
							Begin Breathing
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Pace change phase
	if (phase === "pace-change") {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div className="rounded-3xl max-w-lg w-full bg-white">
					<div className="p-8">
						<h2 className="text-xl font-bold mb-6 text-gray-900">
							Pick what feels better:
						</h2>

						<div className="space-y-3 mb-8">
							{[
								{ value: "3" as BreathingPace, label: "Count of 3" },
								{ value: "4" as BreathingPace, label: "Count of 4" },
								{ value: "no-count" as BreathingPace, label: "No counting" },
								{
									value: "natural" as BreathingPace,
									label: "Just in and out (no pauses)",
								},
							].map((option) => (
								<label key={option.value} className="flex items-center">
									<input
										type="radio"
										name="pace"
										value={option.value}
										checked={selectedPace === option.value}
										onChange={(e) =>
											setSelectedPace(e.target.value as BreathingPace)
										}
										className="mr-3"
									/>
									<span className="text-gray-700">{option.label}</span>
								</label>
							))}
						</div>

						<button
							onClick={handleContinue}
							className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
						>
							Continue
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Practice phase
	if (phase === "practice") {
		const progress = (timeElapsed / getDurationSeconds()) * 100;
		const durationDisplay =
			getDurationSeconds() === 30
				? "30 seconds"
				: getDurationSeconds() === 60
					? "1 minute"
					: getDurationSeconds() === 120
						? "2 minutes"
						: "4 minutes";

		// Calculate circle scale based on breath phase
		const getCircleScale = () => {
			switch (breathPhase) {
				case "in":
					return 1.2;
				case "hold":
					return 1.2;
				case "out":
					return 0.8;
				case "rest":
					return 0.8;
				default:
					return 1;
			}
		};

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div className="rounded-3xl max-w-lg w-full bg-white">
					<div className="p-8">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-xl font-bold text-gray-900">
								Let's Breathe Together
							</h2>
							<button
								onClick={onClose}
								className="p-2 hover:bg-gray-100 rounded-xl"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						<p className="text-gray-600 mb-8 text-center">
							{durationDisplay} of calm
						</p>

						{/* Breathing circle */}
						<div className="flex justify-center mb-8">
							<div
								className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-30 transition-transform duration-[4000ms] ease-in-out"
								style={{ transform: `scale(${getCircleScale()})` }}
							/>
						</div>

						{/* Timer display */}
						<div className="text-center mb-6">
							<p className="text-sm text-gray-600">
								Timer: {formatTime(timeElapsed)} /{" "}
								{formatTime(getDurationSeconds())}
							</p>
						</div>

						{/* Progress bar */}
						<div className="mb-6">
							<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
								<div
									className="h-full bg-indigo-600 transition-all duration-1000"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>

						{/* Breathing guidance */}
						<div className="text-center mb-6">
							<p className="text-lg text-gray-700 mb-2">{getBreathMessage()}</p>
							<p className="text-indigo-600 font-medium">
								You're doing beautifully.
							</p>
						</div>

						{/* Controls */}
						<div className="flex gap-3">
							<button
								onClick={handlePaceChange}
								className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-all"
							>
								Different Pace
							</button>
							<button
								onClick={() => setIsPlaying(!isPlaying)}
								className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
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
								className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-all"
							>
								Skip
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Reflection phase
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="rounded-3xl max-w-lg w-full bg-white">
				<div className="p-8">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-xl font-bold text-gray-900">
							How do you feel?
						</h2>
						<button
							onClick={onClose}
							className="p-2 hover:bg-gray-100 rounded-xl"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					{/* Calmer question */}
					<div className="mb-6">
						<p className="text-gray-700 mb-3">Calmer?</p>
						<div className="flex gap-3">
							{["Yes", "Somewhat", "About the same"].map((option) => (
								<label key={option} className="flex items-center">
									<input
										type="radio"
										name="calmer"
										value={option}
										checked={feelingCalmer === option}
										onChange={(e) => setFeelingCalmer(e.target.value)}
										className="mr-2"
									/>
									<span className="text-gray-700">{option}</span>
								</label>
							))}
						</div>
					</div>

					{/* Pace feeling */}
					<div className="mb-6">
						<p className="text-gray-700 mb-3">The pace?</p>
						<div className="space-y-2">
							{["Just right", "Too slow", "Too fast", "Prefer no counting"].map(
								(option) => (
									<label key={option} className="flex items-center">
										<input
											type="radio"
											name="pace"
											value={option}
											checked={paceFeeling === option}
											onChange={(e) => setPaceFeeling(e.target.value)}
											className="mr-2"
										/>
										<span className="text-gray-700">{option}</span>
									</label>
								),
							)}
						</div>
					</div>

					{/* Next time */}
					<div className="mb-8">
						<p className="text-gray-700 mb-3">Next time?</p>
						<div className="space-y-2">
							{["Same is perfect", "Try shorter", "Try longer"].map(
								(option) => (
									<label key={option} className="flex items-center">
										<input
											type="radio"
											name="next"
											value={option}
											checked={nextTime === option}
											onChange={(e) => setNextTime(e.target.value)}
											className="mr-2"
										/>
										<span className="text-gray-700">{option}</span>
									</label>
								),
							)}
						</div>
					</div>

					<div className="flex gap-3">
						<button
							onClick={handleSubmit}
							className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
						>
							Done
						</button>
						<button
							onClick={handleBreatheAgain}
							className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-all"
						>
							Breathe Again
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
