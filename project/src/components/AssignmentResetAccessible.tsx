import { FastForward, Move, Pause, RefreshCw, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface AssignmentResetProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

type ResetDuration = "10s" | "30s" | "1m" | "3m";
type ResetMethod = "let-go" | "shake-out" | "pause" | "move-on";

interface MethodInfo {
	title: string;
	description: string;
	icon: React.ReactNode;
	steps: string[];
	color: string;
}

const RESET_METHODS: Record<ResetMethod, MethodInfo> = {
	"let-go": {
		title: "Let Go",
		description: "Clear your mind",
		icon: <RefreshCw className="w-5 h-5" />,
		steps: [
			"Take a deep breath",
			"Release the last assignment",
			"Clear your mental space",
			"Open to what's next",
		],
		color: "#7A9B6E",
	},
	"shake-out": {
		title: "Shake Out",
		description: "Release excess energy",
		icon: <Move className="w-5 h-5" />,
		steps: [
			"Shake your hands",
			"Roll your shoulders",
			"Wiggle your fingers",
			"Release physical tension",
		],
		color: "#7A9B6E",
	},
	pause: {
		title: "Pause",
		description: "Take a breath and notice",
		icon: <Pause className="w-5 h-5" />,
		steps: [
			"Stop for a moment",
			"Take three deep breaths",
			"Notice your body",
			"Ground yourself",
		],
		color: "#7A9B6E",
	},
	"move-on": {
		title: "Move On",
		description: "Refocus and transition",
		icon: <FastForward className="w-5 h-5" />,
		steps: [
			"Acknowledge completion",
			"Set intention for next",
			"Refocus your energy",
			"Step forward",
		],
		color: "#7A9B6E",
	},
};

export const AssignmentResetAccessible: React.FC<AssignmentResetProps> = ({
	onClose,
	onComplete,
}) => {
	const [phase, setPhase] = useState<"setup" | "practice" | "complete">(
		"setup",
	);
	const [selectedDuration, setSelectedDuration] =
		useState<ResetDuration>("30s");
	const [selectedMethod, setSelectedMethod] = useState<ResetMethod>("let-go");
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [isActive, setIsActive] = useState(false);

	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const timerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isActive && phase === "practice") {
			intervalRef.current = setInterval(() => {
				setTimeElapsed((prev) => {
					const next = prev + 1;
					const durationSeconds = {
						"10s": 10,
						"30s": 30,
						"1m": 60,
						"3m": 180,
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

	const handleStart = () => {
		setPhase("practice");
		setIsActive(true);
		setTimeElapsed(0);
	};

	const handleComplete = () => {
		setIsActive(false);
		setPhase("complete");

		const data = {
			duration: selectedDuration,
			method: selectedMethod,
			completedDuration: timeElapsed,
			timestamp: new Date().toISOString(),
		};

		if (onComplete) {
			setTimeout(() => {
				onComplete(data);
				onClose();
			}, 2000);
		}
	};

	const handleSkip = () => {
		handleComplete();
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return mins > 0
			? `${mins}:${secs.toString().padStart(2, "0")}`
			: `${secs}s`;
	};

	const getDurationSeconds = () => {
		return { "10s": 10, "30s": 30, "1m": 60, "3m": 180 }[selectedDuration];
	};

	// Setup phase
	if (phase === "setup") {
		return (
			<div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
				<section
					aria-labelledby="assignment-reset-title"
					className="rounded-3xl max-w-2xl w-full bg-white shadow-sm"
					lang="en"
				>
					<div className="p-8">
						<div className="flex justify-between items-start mb-6">
							<div className="flex items-center gap-3">
								<div
									className="p-2 rounded-xl"
									style={{ backgroundColor: "#F0F5ED" }}
								>
									<RefreshCw className="w-6 h-6" style={{ color: "#2D5F3F" }} />
								</div>
								<div>
									<h2
										id="assignment-reset-title"
										className="text-xl font-normal"
										style={{ color: "#2D3748" }}
									>
										Assignment Reset
									</h2>
									<p className="text-sm" style={{ color: "#4A5568" }}>
										Clear your mind and body between interpretations
									</p>
								</div>
							</div>
							<button
								onClick={onClose}
								className="p-2 rounded-xl transition-all hover:scale-105"
								style={{
									background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
								}}
								aria-label="Close assignment reset"
							>
								<X className="w-5 h-5 text-white" />
							</button>
						</div>

						{/* Method selection */}
						<fieldset className="mb-6">
							<legend
								className="text-sm font-medium mb-3"
								style={{ color: "#2D3748" }}
							>
								Pick a Reset Method
							</legend>
							<ol className="grid grid-cols-2 gap-2" role="list">
								{Object.entries(RESET_METHODS).map(([key, method]) => (
									<li key={key}>
										<button
											onClick={() => setSelectedMethod(key as ResetMethod)}
											className={`w-full p-3 rounded-xl text-left transition-all border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
												selectedMethod === key
													? "border-green-400"
													: "border-transparent hover:bg-gray-50"
											}`}
											style={{
												backgroundColor:
													selectedMethod === key ? "#F0F5ED" : "#F9FAFB",
												borderColor:
													selectedMethod === key ? "#7A9B6E" : undefined,
												focusRingColor: "#2D5F3F",
											}}
											aria-label={`${method.title}: ${method.description}`}
											aria-pressed={selectedMethod === key}
										>
											<div className="flex items-start gap-2">
												<span style={{ color: "#2D5F3F" }}>{method.icon}</span>
												<div>
													<p
														className="font-medium text-sm"
														style={{ color: "#2D3748" }}
													>
														{method.title}
													</p>
													<p className="text-xs" style={{ color: "#4A5568" }}>
														{method.description}
													</p>
												</div>
											</div>
										</button>
									</li>
								))}
							</ol>
						</fieldset>

						{/* Quick tip */}
						<div
							className="mb-6 p-4 rounded-xl"
							style={{ backgroundColor: "#F0F5ED" }}
						>
							<p className="text-sm" style={{ color: "#2D3748" }}>
								<strong>Quick tip:</strong> Even 10 seconds helps! Regular
								resets prevent accumulation.
							</p>
						</div>

						{/* Start button */}
						<button
							onClick={handleStart}
							className="w-full py-3 text-white rounded-xl font-medium transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
							style={{
								background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
								focusRingColor: "#2D5F3F",
							}}
							aria-label="Start Assignment Reset"
						>
							Start Reset
						</button>
					</div>
				</section>
			</div>
		);
	}

	// Practice phase
	if (phase === "practice") {
		const progress = (timeElapsed / getDurationSeconds()) * 100;
		const method = RESET_METHODS[selectedMethod];

		return (
			<div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
				<section
					aria-labelledby="practice-title"
					className="rounded-3xl max-w-lg w-full bg-white shadow-sm"
					lang="en"
				>
					<div className="p-8">
						<div className="flex justify-between items-center mb-6">
							<h2
								id="practice-title"
								className="text-xl font-normal"
								style={{ color: "#2D3748" }}
							>
								{method.title}
							</h2>
							<button
								onClick={onClose}
								className="p-2 rounded-xl transition-all hover:scale-105"
								style={{
									background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
								}}
								aria-label="Close practice"
							>
								<X className="w-5 h-5 text-white" />
							</button>
						</div>

						{/* Timer */}
						<div
							ref={timerRef}
							className="text-center mb-6"
							role="timer"
							aria-live="polite"
							aria-atomic="true"
							aria-label={`Timer: ${formatTime(timeElapsed)} of ${formatTime(getDurationSeconds())}`}
						>
							<p className="text-3xl font-light" style={{ color: "#2D3748" }}>
								{formatTime(timeElapsed)}
							</p>
							<p className="text-sm mt-1" style={{ color: "#4A5568" }}>
								of {formatTime(getDurationSeconds())}
							</p>
						</div>

						{/* Progress bar */}
						<div
							className="mb-8"
							role="progressbar"
							aria-valuenow={Math.round(progress)}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-label="Reset progress"
						>
							<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
								<div
									className="h-full transition-all duration-1000"
									style={{
										width: `${progress}%`,
										backgroundColor: "#7A9B6E",
									}}
								/>
							</div>
						</div>

						{/* Method steps */}
						<div className="mb-8">
							<div className="flex justify-center mb-4">
								<div
									className="p-3 rounded-xl"
									style={{ backgroundColor: "#F0F5ED" }}
								>
									{React.cloneElement(method.icon as React.ReactElement, {
										className: "w-8 h-8",
										style: { color: "#2D5F3F" },
									})}
								</div>
							</div>
							<ol className="space-y-2" role="list" aria-label="Reset steps">
								{method.steps.map((step, index) => (
									<li
										key={index}
										className="flex items-center gap-3 p-2 rounded-lg"
										style={{ backgroundColor: "#F5F9F3" }}
									>
										<span
											className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
											style={{ backgroundColor: "#7A9B6E" }}
										>
											{index + 1}
										</span>
										<span className="text-sm" style={{ color: "#4A5568" }}>
											{step}
										</span>
									</li>
								))}
							</ol>
						</div>

						{/* Skip button */}
						<button
							onClick={handleSkip}
							className="w-full py-2 text-center rounded-xl transition-all hover:shadow-md"
							style={{
								color: "#4A5568",
								backgroundColor: "transparent",
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.backgroundColor =
									"rgba(34, 197, 94, 0.2)")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.backgroundColor = "transparent")
							}
							aria-label="Skip to complete"
						>
							Skip
						</button>
					</div>
				</section>
			</div>
		);
	}

	// Complete phase
	return (
		<div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
			<section
				aria-labelledby="complete-title"
				className="rounded-3xl max-w-sm w-full bg-white shadow-sm"
				lang="en"
			>
				<div className="p-8 text-center">
					<div className="mb-4">
						<div
							className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
							style={{ backgroundColor: "#F0F5ED" }}
						>
							<RefreshCw className="w-8 h-8" style={{ color: "#2D5F3F" }} />
						</div>
					</div>

					<h2
						id="complete-title"
						className="text-xl font-normal mb-2"
						style={{ color: "#2D3748" }}
					>
						Reset Complete
					</h2>

					<p className="text-sm" style={{ color: "#4A5568" }}>
						You're ready for what's next
					</p>
				</div>
			</section>
		</div>
	);
};
// Export alias for compatibility
export const AssignmentReset = AssignmentResetAccessible;
