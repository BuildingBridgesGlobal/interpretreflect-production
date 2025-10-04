import { Pause, Play, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface ProfessionalBoundariesResetProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

type ResetDuration = "30s" | "90s" | "3m" | "5m";

export const ProfessionalBoundariesReset: React.FC<
	ProfessionalBoundariesResetProps
> = ({ onClose, onComplete }) => {
	const [phase, setPhase] = useState<"setup" | "practice" | "reflection">(
		"setup",
	);
	const [isPlaying, setIsPlaying] = useState(false);
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [selectedDuration, setSelectedDuration] =
		useState<ResetDuration>("90s");

	// Reflection states
	const [feelingBetter, setFeelingBetter] = useState("");
	const [whatHelped, setWhatHelped] = useState("");
	const [needSupport, setNeedSupport] = useState("");

	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Timer effect
	useEffect(() => {
		if (isPlaying && phase === "practice") {
			intervalRef.current = setInterval(() => {
				setTimeElapsed((prev) => {
					const next = prev + 1;
					const durationSeconds = {
						"30s": 30,
						"90s": 90,
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
			feelingBetter,
			whatHelped,
			needSupport,
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
		return { "30s": 30, "90s": 90, "3m": 180, "5m": 300 }[selectedDuration];
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
									Professional Boundaries Reset
								</h1>
								<p className="text-gray-600">
									Step back after difficult content
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
								{["30s", "90s", "3m", "5m"].map((duration) => (
									<button
										key={duration}
										onClick={() =>
											setSelectedDuration(duration as ResetDuration)
										}
										className={`px-4 py-2 rounded-lg font-medium transition-all ${
											selectedDuration === duration
												? "bg-rose-600 text-white"
												: "bg-gray-100 hover:bg-gray-200 text-gray-700"
										}`}
									>
										{duration === "30s"
											? "30 sec"
											: duration === "90s"
												? "90 sec"
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
								What helps you return to center?
							</p>
							<div className="space-y-3">
								<div className="p-3 bg-rose-50 rounded-xl">
									<h3 className="font-medium text-gray-800">Ground Yourself</h3>
									<p className="text-sm text-gray-600">
										Touch your desk, feel your feet
									</p>
								</div>
								<div className="p-3 bg-orange-50 rounded-xl">
									<h3 className="font-medium text-gray-800">
										Remember Your Role
									</h3>
									<p className="text-sm text-gray-600">
										"I interpreted professionally"
									</p>
								</div>
								<div className="p-3 bg-amber-50 rounded-xl">
									<h3 className="font-medium text-gray-800">
										Come Back to Now
									</h3>
									<p className="text-sm text-gray-600">Notice where you are</p>
								</div>
								<div className="p-3 bg-green-50 rounded-xl">
									<h3 className="font-medium text-gray-800">Take Pride</h3>
									<p className="text-sm text-gray-600">
										You helped communication happen
									</p>
								</div>
							</div>
						</div>

						{/* Remember */}
						<div className="mb-6 p-4 bg-gray-50 rounded-xl">
							<p className="text-sm text-gray-700">
								<strong>Remember:</strong> Feeling affected is human. This helps
								you continue serving well.
							</p>
						</div>

						{/* Start button */}
						<button
							onClick={handleStart}
							className="w-full py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-all"
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
							<h2 className="text-xl font-bold text-gray-900">
								Let's Step Back
							</h2>
							<button
								onClick={onClose}
								className="p-2 hover:bg-gray-100 rounded-xl"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						<p className="text-gray-600 mb-8 text-center">
							{getDurationSeconds() === 30
								? "30 seconds"
								: getDurationSeconds() === 90
									? "90 seconds"
									: getDurationSeconds() === 180
										? "3 minutes"
										: "5 minutes"}{" "}
							to reset
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
									className="h-full bg-rose-600 transition-all duration-1000"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>

						{/* Guidance */}
						<div className="text-center space-y-3 mb-8">
							<p className="text-gray-700">Touch something solid.</p>
							<p className="text-gray-700">You interpreted professionally.</p>
							<p className="text-gray-700">Notice where you are now.</p>
						</div>

						<p className="text-center text-rose-600 font-medium mb-8">
							You're safe here.
						</p>

						{/* Controls */}
						<div className="flex gap-3">
							<button
								onClick={() => setIsPlaying(!isPlaying)}
								className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
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
						<h2 className="text-xl font-bold text-gray-900">How are you?</h2>
						<button
							onClick={onClose}
							className="p-2 hover:bg-gray-100 rounded-xl"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					{/* Feeling better */}
					<div className="mb-6">
						<p className="text-gray-700 mb-3">
							Feeling more separated from it?
						</p>
						<div className="flex gap-3">
							{["Yes", "A bit", "Not yet"].map((option) => (
								<label key={option} className="flex items-center">
									<input
										type="radio"
										name="better"
										value={option}
										checked={feelingBetter === option}
										onChange={(e) => setFeelingBetter(e.target.value)}
										className="mr-2"
									/>
									<span className="text-gray-700">{option}</span>
								</label>
							))}
						</div>
					</div>

					{/* What helped */}
					<div className="mb-6">
						<p className="text-gray-700 mb-3">What helped most?</p>
						<div className="space-y-2">
							{["Grounding", "Role reminder", "Taking time"].map((option) => (
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

					{/* Support need */}
					<div className="mb-8">
						<p className="text-gray-700 mb-3">Need more support?</p>
						<div className="space-y-2">
							{["I'm good", "Maybe later", "Yes, please"].map((option) => (
								<label key={option} className="flex items-center">
									<input
										type="radio"
										name="support"
										value={option}
										checked={needSupport === option}
										onChange={(e) => setNeedSupport(e.target.value)}
										className="mr-2"
									/>
									<span className="text-gray-700">{option}</span>
								</label>
							))}
						</div>
					</div>

					{needSupport === "Yes, please" && (
						<div className="mb-6 p-4 bg-rose-50 rounded-xl">
							<p className="text-sm text-gray-700 mb-2">
								<strong>Support options:</strong>
							</p>
							<ul className="text-sm text-gray-600 space-y-1">
								<li>• Talk to a colleague</li>
								<li>• Contact your supervisor</li>
								<li>• Take a longer break</li>
								<li>• Access EAP resources</li>
							</ul>
						</div>
					)}

					<button
						onClick={handleSubmit}
						className="w-full py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-all"
					>
						Done
					</button>
				</div>
			</div>
		</div>
	);
};
