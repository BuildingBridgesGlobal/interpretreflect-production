import { Pause, Play, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface BreathingPracticeProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

type PracticeDuration = "30s" | "1m" | "2m" | "4m";
type BreathingRhythm = "steady" | "calming" | "natural" | "gentle";

export const BreathingPractice: React.FC<BreathingPracticeProps> = ({
	onClose,
	onComplete,
}) => {
	const [phase, setPhase] = useState<"setup" | "practice" | "reflection">(
		"setup",
	);
	const [selectedDuration, setSelectedDuration] =
		useState<PracticeDuration>("2m");
	const [selectedRhythm, setSelectedRhythm] =
		useState<BreathingRhythm>("steady");
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [isActive, setIsActive] = useState(false);
	const [ultraMinimal, setUltraMinimal] = useState(false);
	const [hideText, setHideText] = useState(false);
	const [breathPhase, setBreathPhase] = useState<"in" | "out">("in");

	// Reflection states
	const [howAreYou, setHowAreYou] = useState("");
	const [thePace, setThePace] = useState("");

	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// Get rhythm timing
	const getRhythmTiming = () => {
		switch (selectedRhythm) {
			case "steady":
				return { in: 4, out: 4 };
			case "calming":
				return { in: 4, out: 6 };
			case "natural":
				return { in: 0, out: 0 }; // No guided timing
			case "gentle":
				return { in: 3, out: 3 };
			default:
				return { in: 4, out: 4 };
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

	// Breathing cycle effect
	useEffect(() => {
		if (isActive && phase === "practice" && selectedRhythm !== "natural") {
			const timing = getRhythmTiming();
			const totalCycle = timing.in + timing.out;
			let cycleTime = 0;

			breathIntervalRef.current = setInterval(() => {
				cycleTime = (cycleTime + 0.1) % totalCycle;
				setBreathPhase(cycleTime < timing.in ? "in" : "out");
			}, 100);
		}

		return () => {
			if (breathIntervalRef.current) {
				clearInterval(breathIntervalRef.current);
			}
		};
	}, [isActive, phase, selectedRhythm]);

	const handleStart = () => {
		setPhase("practice");
		setIsActive(true);
		setTimeElapsed(0);
	};

	const handlePausePlay = () => {
		setIsActive(!isActive);
	};

	const handleComplete = () => {
		setIsActive(false);
		setPhase("reflection");
	};

	const handleSubmit = () => {
		const data = {
			duration: selectedDuration,
			rhythm: selectedRhythm,
			ultraMinimal,
			howAreYou,
			thePace,
			completedDuration: timeElapsed,
			timestamp: new Date().toISOString(),
		};
		if (onComplete) onComplete(data);
		onClose();
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const getDurationSeconds = () => {
		return { "30s": 30, "1m": 60, "2m": 120, "4m": 240 }[selectedDuration];
	};

	// Setup phase
	if (phase === "setup") {
		return (
			<div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 p-4">
				<div className="rounded-3xl max-w-lg w-full bg-white shadow-sm">
					<div className="p-8">
						<div className="flex justify-between items-start mb-8">
							<div>
								<h1 className="text-2xl font-light mb-1 text-gray-700">
									Breathing Practice
								</h1>
								<p className="text-gray-500 text-sm">Find your calm</p>
							</div>
							<button
								onClick={onClose}
								className="p-2 hover:bg-gray-50 rounded-xl transition-all"
							>
								<X className="w-5 h-5 text-gray-400" />
							</button>
						</div>

						{/* Duration selection */}
						<div className="mb-8">
							<p className="text-sm text-gray-500 mb-4">How long?</p>
							<div className="flex gap-2">
								{["30s", "1m", "2m", "4m"].map((duration) => (
									<button
										key={duration}
										onClick={() =>
											setSelectedDuration(duration as PracticeDuration)
										}
										className={`flex-1 py-2 rounded-lg transition-all ${
											selectedDuration === duration
												? "bg-gray-100 text-gray-700"
												: "bg-white hover:bg-gray-50 text-gray-500"
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

						{/* Rhythm selection */}
						<div className="mb-8">
							<p className="text-sm text-gray-500 mb-4">Choose your rhythm:</p>
							<div className="space-y-2">
								{[
									{ value: "steady", label: "Steady", desc: "Even in and out" },
									{
										value: "calming",
										label: "Calming",
										desc: "Longer exhales",
									},
									{ value: "natural", label: "Natural", desc: "Your own pace" },
									{ value: "gentle", label: "Gentle", desc: "Soft and easy" },
								].map((rhythm) => (
									<button
										key={rhythm.value}
										onClick={() =>
											setSelectedRhythm(rhythm.value as BreathingRhythm)
										}
										className={`w-full p-3 rounded-xl text-left transition-all ${
											selectedRhythm === rhythm.value
												? "bg-gray-50"
												: "bg-white hover:bg-gray-50"
										}`}
									>
										<div className="flex justify-between items-center">
											<span className="text-gray-700">{rhythm.label}</span>
											<span className="text-sm text-gray-400">
												{rhythm.desc}
											</span>
										</div>
									</button>
								))}
							</div>
						</div>

						{/* Gentle tip */}
						<p className="text-sm text-gray-400 mb-8 text-center">
							Simply breathing steadily for 30 seconds begins to calm your
							nervous system.
						</p>

						{/* Ultra minimal option */}
						<div className="mb-8 flex justify-center">
							<label className="flex items-center cursor-pointer text-sm text-gray-400">
								<input
									type="checkbox"
									checked={ultraMinimal}
									onChange={(e) => setUltraMinimal(e.target.checked)}
									className="mr-2 opacity-50"
								/>
								Ultra-minimal (almost no text)
							</label>
						</div>

						{/* Start button */}
						<button
							onClick={handleStart}
							className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
						>
							Begin
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Practice phase
	if (phase === "practice") {
		const timing = getRhythmTiming();
		const breathingScale =
			selectedRhythm === "natural" ? 1 : breathPhase === "in" ? 1.15 : 0.85;

		// Ultra minimal mode
		if (ultraMinimal) {
			return (
				<div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4">
					<div className="text-center">
						<button
							onClick={onClose}
							className="absolute top-8 right-8 p-2 hover:bg-gray-50 rounded-xl transition-all"
						>
							<X className="w-5 h-5 text-gray-300" />
						</button>

						{/* Minimal breathing circle */}
						<div className="flex justify-center mb-8">
							<div
								className="w-32 h-32 bg-gray-50 rounded-full transition-transform duration-[3000ms] ease-in-out"
								style={{
									transform: `scale(${breathingScale})`,
									opacity: 0.3,
								}}
							/>
						</div>

						{/* Timer only */}
						<p className="text-gray-400 text-sm mb-8">
							{formatTime(timeElapsed)} / {formatTime(getDurationSeconds())}
						</p>

						<p className="text-gray-300 text-xs mb-8">
							Breathe with the circle or find your own way
						</p>

						<button
							onClick={handleComplete}
							className="px-6 py-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-all text-sm"
						>
							End
						</button>
					</div>
				</div>
			);
		}

		// Standard practice mode
		const getGuidanceText = () => {
			if (hideText) return "";

			switch (selectedDuration) {
				case "30s":
					if (timeElapsed < 10) return "Three slow breaths.";
					if (timeElapsed < 25) return "";
					return "That's all.";
				case "1m":
					if (timeElapsed < 15) return "Find your rhythm.";
					if (timeElapsed < 30) return "No rush.";
					if (timeElapsed < 50) return "";
					return "Halfway there.";
				case "2m":
					if (timeElapsed < 20) return "Breathe in...";
					if (timeElapsed < 40) return "Breathe out...";
					if (timeElapsed < 80) return "";
					return "Just like that.";
				case "4m":
					if (timeElapsed < 30) return "Settle in.";
					if (timeElapsed < 120) return "Just breathing.";
					return "Take all the time you need.";
				default:
					return "";
			}
		};

		const getDurationText = () => {
			switch (selectedDuration) {
				case "30s":
					return "";
				case "1m":
					return "";
				case "2m":
					return "2 minutes of calm";
				case "4m":
					return "";
				default:
					return "";
			}
		};

		return (
			<div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4">
				<div className="max-w-md w-full text-center">
					<button
						onClick={onClose}
						className="absolute top-8 right-8 p-2 hover:bg-gray-50 rounded-xl transition-all"
					>
						<X className="w-5 h-5 text-gray-300" />
					</button>

					{/* Soft breathing circle */}
					<div className="flex justify-center mb-12">
						<div
							className="w-24 h-24 rounded-full transition-all duration-[4000ms] ease-in-out"
							style={{
								backgroundColor: "#EBF4FF",
								transform: `scale(${breathingScale})`,
								opacity: 0.4,
							}}
						/>
					</div>

					{/* Timer */}
					<p className="text-gray-400 text-sm mb-4">
						{formatTime(timeElapsed)} / {formatTime(getDurationSeconds())}
					</p>

					{/* Duration text */}
					{getDurationText() && (
						<p className="text-gray-500 mb-8">{getDurationText()}</p>
					)}

					{/* Minimal guidance */}
					<div className="h-12 flex items-center justify-center mb-12">
						<p className="text-gray-500">{getGuidanceText()}</p>
					</div>

					{/* Controls */}
					<div className="flex justify-center gap-3">
						<button
							onClick={handlePausePlay}
							className="px-6 py-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2"
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
							className="px-6 py-2 text-gray-400 hover:text-gray-600 transition-all"
						>
							End Early
						</button>
					</div>

					{/* Text toggle */}
					<button
						onClick={() => setHideText(!hideText)}
						className="mt-8 text-xs text-gray-300 hover:text-gray-400 transition-all"
					>
						{hideText ? "Show text" : "Hide text"}
					</button>
				</div>
			</div>
		);
	}

	// Reflection phase - minimal
	if (ultraMinimal) {
		return (
			<div className="fixed inset-0 bg-white flex items-center justify-center z-50 p-4">
				<div className="text-center">
					<p className="text-gray-500 mb-6">Better?</p>
					<div className="flex gap-3 justify-center mb-8">
						{["Yes", "No"].map((option) => (
							<button
								key={option}
								onClick={() => setHowAreYou(option)}
								className={`px-6 py-2 rounded-lg transition-all ${
									howAreYou === option
										? "bg-gray-100 text-gray-600"
										: "bg-white text-gray-400 hover:bg-gray-50"
								}`}
							>
								{option}
							</button>
						))}
					</div>
					<button
						onClick={handleSubmit}
						className="px-8 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
					>
						Done
					</button>
				</div>
			</div>
		);
	}

	// Standard reflection
	return (
		<div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 p-4">
			<div className="rounded-3xl max-w-md w-full bg-white shadow-sm">
				<div className="p-8">
					<button
						onClick={onClose}
						className="float-right p-2 hover:bg-gray-50 rounded-xl transition-all"
					>
						<X className="w-5 h-5 text-gray-300" />
					</button>

					<div className="mb-8">
						<p className="text-gray-600 mb-4">How are you?</p>
						<div className="flex gap-2">
							{["Calmer", "Same", "Need more"].map((option) => (
								<button
									key={option}
									onClick={() => setHowAreYou(option)}
									className={`flex-1 py-2 rounded-lg transition-all text-sm ${
										howAreYou === option
											? "bg-gray-100 text-gray-700"
											: "bg-white text-gray-500 hover:bg-gray-50"
									}`}
								>
									{option}
								</button>
							))}
						</div>
					</div>

					<div className="mb-8">
						<p className="text-gray-600 mb-4">The pace?</p>
						<div className="flex gap-2">
							{["Good", "Adjust next time"].map((option) => (
								<button
									key={option}
									onClick={() => setThePace(option)}
									className={`flex-1 py-2 rounded-lg transition-all text-sm ${
										thePace === option
											? "bg-gray-100 text-gray-700"
											: "bg-white text-gray-500 hover:bg-gray-50"
									}`}
								>
									{option}
								</button>
							))}
						</div>
					</div>

					<button
						onClick={handleSubmit}
						className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
					>
						Done
					</button>
				</div>
			</div>
		</div>
	);
};
