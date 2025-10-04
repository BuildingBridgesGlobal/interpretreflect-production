import { Pause, Play, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface BetweenLanguagesResetProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

type ResetDuration = "10s" | "30s" | "3m" | "5m";

export const BetweenLanguagesReset: React.FC<BetweenLanguagesResetProps> = ({
	onClose,
	onComplete,
}) => {
	const [phase, setPhase] = useState<"setup" | "practice" | "reflection">(
		"setup",
	);
	const [isPlaying, setIsPlaying] = useState(false);
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [selectedDuration, setSelectedDuration] =
		useState<ResetDuration>("30s");

	// Reflection states
	const [feelingClearer, setFeelingClearer] = useState("");
	const [whatHelped, setWhatHelped] = useState("");
	const [nextAdjustment, setNextAdjustment] = useState("");

	const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

	const handleStart = () => {
		setPhase("practice");
		setIsPlaying(true);
		setTimeElapsed(0);
	};

	const handleComplete = () => {
		setIsPlaying(false);
		setPhase("reflection");
	};

	const handleSubmit = () => {
		const data = {
			feelingClearer,
			whatHelped,
			nextAdjustment,
			duration: timeElapsed,
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
		return { "10s": 10, "30s": 30, "3m": 180, "5m": 300 }[selectedDuration];
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
									Between Languages Reset
								</h1>
								<p className="text-gray-600">
									Clear your mind between interpretations
								</p>
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
								{["10s", "30s", "3m", "5m"].map((duration) => (
									<button
										key={duration}
										onClick={() =>
											setSelectedDuration(duration as ResetDuration)
										}
										className={`px-4 py-2 rounded-lg font-medium transition-all ${
											selectedDuration === duration
												? "bg-purple-600 text-white"
												: "bg-gray-100 hover:bg-gray-200 text-gray-700"
										}`}
									>
										{duration === "10s"
											? "10 sec"
											: duration === "30s"
												? "30 sec"
												: duration === "3m"
													? "3 min"
													: "5 min"}
									</button>
								))}
							</div>
						</div>

						{/* Reset Options */}
						<div className="mb-6">
							<p className="text-sm font-medium mb-3 text-gray-700">
								Pick what helps:
							</p>
							<div className="space-y-3">
								<div className="p-3 bg-purple-50 rounded-xl">
									<h3 className="font-medium text-gray-800">Language Pause</h3>
									<p className="text-sm text-gray-600">Let words fade away</p>
								</div>
								<div className="p-3 bg-blue-50 rounded-xl">
									<h3 className="font-medium text-gray-800">Home Language</h3>
									<p className="text-sm text-gray-600">
										Return to your first language
									</p>
								</div>
								<div className="p-3 bg-green-50 rounded-xl">
									<h3 className="font-medium text-gray-800">
										Physical Release
									</h3>
									<p className="text-sm text-gray-600">
										Shake it out or stretch
									</p>
								</div>
								<div className="p-3 bg-amber-50 rounded-xl">
									<h3 className="font-medium text-gray-800">Mental Filing</h3>
									<p className="text-sm text-gray-600">
										Put that assignment away
									</p>
								</div>
							</div>
						</div>

						{/* Quick tip */}
						<div className="mb-6 p-4 bg-gray-50 rounded-xl">
							<p className="text-sm text-gray-700">
								<strong>Quick tip:</strong> Your brain holds onto the last
								language you interpreted. Taking even 10 seconds to reset helps
								your accuracy.
							</p>
						</div>

						{/* Modality tips */}
						<div className="mb-6 text-sm text-gray-600">
							<p>
								<strong>For signing?</strong> Rest your hands and shoulders
							</p>
							<p>
								<strong>For speaking?</strong> Rest your voice and jaw
							</p>
						</div>

						{/* Start button */}
						<button
							onClick={handleStart}
							className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all"
						>
							Begin Reset
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Practice phase
	if (phase === "practice") {
		const progress = (timeElapsed / getDurationSeconds()) * 100;

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div className="rounded-3xl max-w-lg w-full bg-white">
					<div className="p-8">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-xl font-bold text-gray-900">Let's Reset</h2>
							<button
								onClick={onClose}
								className="p-2 hover:bg-gray-100 rounded-xl"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						<p className="text-gray-600 mb-8 text-center">
							{getDurationSeconds() === 10
								? "10 seconds"
								: getDurationSeconds() === 30
									? "30 seconds"
									: getDurationSeconds() === 180
										? "3 minutes"
										: "5 minutes"}{" "}
							to clear
						</p>

						{/* Timer display */}
						<div className="text-center mb-8">
							<p className="text-3xl font-light text-gray-800">
								Timer: {formatTime(timeElapsed)} /{" "}
								{formatTime(getDurationSeconds())}
							</p>
						</div>

						{/* Progress bar */}
						<div className="mb-8">
							<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
								<div
									className="h-full bg-purple-600 transition-all duration-1000"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>

						{/* Guidance */}
						<div className="text-center space-y-3 mb-8">
							<p className="text-gray-700">Take three breaths.</p>
							<p className="text-gray-700">Roll your shoulders.</p>
							<p className="text-gray-700">Let the last interpretation go.</p>
						</div>

						<p className="text-center text-purple-600 font-medium mb-8">
							You're doing great.
						</p>

						{/* Controls */}
						<div className="flex gap-3">
							<button
								onClick={() => setIsPlaying(!isPlaying)}
								className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
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
								className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-all"
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

					{/* Clearer question */}
					<div className="mb-6">
						<p className="text-gray-700 mb-3">Clearer?</p>
						<div className="flex gap-3">
							{["Yes", "Somewhat", "Not yet"].map((option) => (
								<label key={option} className="flex items-center">
									<input
										type="radio"
										name="clearer"
										value={option}
										checked={feelingClearer === option}
										onChange={(e) => setFeelingClearer(e.target.value)}
										className="mr-2"
									/>
									<span className="text-gray-700">{option}</span>
								</label>
							))}
						</div>
					</div>

					{/* What helped */}
					<div className="mb-6">
						<p className="text-gray-700 mb-3">What helped?</p>
						<div className="space-y-2">
							{["The pause", "Movement", "Just taking time"].map((option) => (
								<label key={option} className="flex items-center">
									<input
										type="radio"
										name="helped"
										value={option}
										checked={whatHelped === option}
										onChange={(e) => setWhatHelped(e.target.value)}
										className="mr-2"
									/>
									<span className="text-gray-700">{option}</span>
								</label>
							))}
						</div>
					</div>

					{/* Next time */}
					<div className="mb-8">
						<p className="text-gray-700 mb-3">Want to adjust next time?</p>
						<div className="space-y-2">
							{[
								"Perfect as is",
								"Need more time",
								"Try different approach",
							].map((option) => (
								<label key={option} className="flex items-center">
									<input
										type="radio"
										name="adjust"
										value={option}
										checked={nextAdjustment === option}
										onChange={(e) => setNextAdjustment(e.target.value)}
										className="mr-2"
									/>
									<span className="text-gray-700">{option}</span>
								</label>
							))}
						</div>
					</div>

					<button
						onClick={handleSubmit}
						className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all"
					>
						Done
					</button>
				</div>
			</div>
		</div>
	);
};
