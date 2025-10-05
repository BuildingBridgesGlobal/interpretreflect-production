import { Activity, Clock, Monitor, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface TechnologyFatigueResetProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

type ResetDuration = "20s" | "1m" | "2m" | "3m";
type ResetStep = "posture" | "distance";

interface StepInfo {
	title: string;
	subtitle: string;
	icon: React.ReactNode;
	instructions: string[];
	tip: string;
}

const RESET_STEPS: Record<ResetStep, StepInfo> = {
	posture: {
		title: "Posture",
		subtitle: "Adjust your body position",
		icon: <Activity className="w-8 h-8" />,
		instructions: [
			"Stand up if you've been sitting",
			"Roll your shoulders back",
			"Stretch your arms overhead",
			"Adjust your chair height if needed",
		],
		tip: "Movement prevents strain and stiffness",
	},
	distance: {
		title: "Distance",
		subtitle: "Reset your viewing distance",
		icon: <Monitor className="w-8 h-8" />,
		instructions: [
			"Push your screen back a bit",
			"Increase viewing distance",
			"Look at something 20 feet away",
			"Blink several times to refresh",
		],
		tip: "Proper distance reduces eye strain",
	},
};

export const TechnologyFatigueResetAccessible: React.FC<
	TechnologyFatigueResetProps
> = ({ onClose, onComplete }) => {
	const [phase, setPhase] = useState<"setup" | "practice" | "complete">(
		"setup",
	);
	const [selectedDuration, setSelectedDuration] = useState<ResetDuration>("1m");
	const [currentStep, setCurrentStep] = useState<ResetStep>("posture");
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
						"20s": 20,
						"1m": 60,
						"2m": 120,
						"3m": 180,
					}[selectedDuration];

					// Auto-advance steps
					const stepDuration = Math.floor(durationSeconds / 2); // 2 steps
					if (next === stepDuration && currentStep === "posture") {
						setCurrentStep("distance");
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
	}, [isActive, phase, selectedDuration, currentStep]);

	const handleStart = () => {
		setPhase("practice");
		setIsActive(true);
		setTimeElapsed(0);
		setCurrentStep("posture");
	};

	const handleContinue = () => {
		if (currentStep === "posture") {
			setCurrentStep("distance");
		} else {
			handleComplete();
		}
	};

	const handleComplete = () => {
		setIsActive(false);
		setPhase("complete");

		const data = {
			duration: selectedDuration,
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

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return mins > 0
			? `${mins}:${secs.toString().padStart(2, "0")}`
			: `${secs}s`;
	};

	const getDurationSeconds = () => {
		return { "20s": 20, "1m": 60, "2m": 120, "3m": 180 }[selectedDuration];
	};

	// Setup phase
	if (phase === "setup") {
		return (
			<div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
				<section
					aria-labelledby="tech-fatigue-title"
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
									<Monitor className="w-6 h-6" style={{ color: "#5C7F4F" }} />
								</div>
								<div>
									<h2
										id="tech-fatigue-title"
										className="text-xl font-normal"
										style={{ color: "#2D3748" }}
									>
										Technology Fatigue Reset
									</h2>
									<p className="text-sm" style={{ color: "#4A5568" }}>
										Relief from screens and headphones
									</p>
								</div>
							</div>
							<button
								onClick={onClose}
								className="p-2 rounded-xl transition-all hover:scale-105"
								style={{
									background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
								}}
								aria-label="Close technology fatigue reset"
							>
								<X className="w-5 h-5 text-white" />
							</button>
						</div>

						{/* Reset steps preview */}
						<div className="mb-6">
							<h3
								className="text-sm font-medium mb-3"
								style={{ color: "#2D3748" }}
							>
								We'll work through:
							</h3>
							<ol className="space-y-3" role="list">
								<li
									className="p-3 rounded-xl flex items-start gap-3"
									style={{ backgroundColor: "#F0F5ED" }}
								>
									<span
										className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
										style={{ backgroundColor: "#7A9B6E" }}
										aria-hidden="true"
									>
										1
									</span>
									<div className="flex-1">
										<h4 className="font-medium" style={{ color: "#2D3748" }}>
											Posture
										</h4>
										<p className="text-sm mt-1" style={{ color: "#4A5568" }}>
											Stand, stretch, or adjust your position for comfort
										</p>
									</div>
								</li>
								<li
									className="p-3 rounded-xl flex items-start gap-3"
									style={{ backgroundColor: "#F0F5ED" }}
								>
									<span
										className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
										style={{ backgroundColor: "#7A9B6E" }}
										aria-hidden="true"
									>
										2
									</span>
									<div className="flex-1">
										<h4 className="font-medium" style={{ color: "#2D3748" }}>
											Distance
										</h4>
										<p className="text-sm mt-1" style={{ color: "#4A5568" }}>
											Push your screen back or increase viewing distance
										</p>
									</div>
								</li>
							</ol>
						</div>

						{/* 20-20-20 Rule */}
						<div
							className="mb-6 p-4 rounded-xl"
							style={{ backgroundColor: "#F5F9F3" }}
						>
							<div className="flex items-start gap-3">
								<Clock
									className="w-5 h-5 mt-0.5 flex-shrink-0"
									style={{ color: "#5C7F4F" }}
								/>
								<div>
									<p
										className="text-sm font-medium mb-1"
										style={{ color: "#2D3748" }}
									>
										20-20-20 Rule
									</p>
									<p className="text-sm" style={{ color: "#4A5568" }}>
										Every 20 minutes, look at something 20 feet away for 20
										seconds
									</p>
								</div>
							</div>
						</div>

						{/* Start button */}
						<button
							onClick={handleStart}
							className="w-full py-3 text-white rounded-xl font-medium transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
							style={{
								background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
								focusRingColor: "#5C7F4F",
							}}
							aria-label="Start Technology Fatigue Reset"
						>
							Begin Reset
						</button>
					</div>
				</section>
			</div>
		);
	}

	// Practice phase
	if (phase === "practice") {
		const progress = (timeElapsed / getDurationSeconds()) * 100;
		const stepInfo = RESET_STEPS[currentStep];
		const currentStepIndex = currentStep === "posture" ? 0 : 1;

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
								Step {currentStepIndex + 1}: {stepInfo.title}
							</h2>
							<button
								onClick={onClose}
								className="p-2 rounded-xl transition-all hover:scale-105"
								style={{
									background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
								}}
								aria-label="Close practice"
							>
								<X className="w-5 h-5 text-white" />
							</button>
						</div>

						{/* Timer */}
						<div
							ref={timerRef}
							className="text-center mb-4"
							role="timer"
							aria-live="polite"
							aria-atomic="true"
							aria-label={`Timer: ${formatTime(timeElapsed)} of ${formatTime(getDurationSeconds())}`}
						>
							<p className="text-sm" style={{ color: "#4A5568" }}>
								{formatTime(timeElapsed)} / {formatTime(getDurationSeconds())}
							</p>
						</div>

						{/* Progress bar */}
						<div
							className="mb-6"
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

						{/* Step indicators */}
						<div
							className="flex justify-center gap-2 mb-8"
							role="group"
							aria-label="Progress steps"
						>
							{["posture", "distance"].map((step, index) => (
								<div
									key={step}
									className={`h-2 w-16 rounded-full transition-all`}
									style={{
										backgroundColor:
											index <= currentStepIndex ? "#7A9B6E" : "#E2E8F0",
									}}
									aria-label={`Step ${index + 1}: ${index <= currentStepIndex ? "active" : "pending"}`}
								/>
							))}
						</div>

						{/* Current step content */}
						<div className="text-center">
							<div className="flex justify-center mb-4">
								<div
									className="p-3 rounded-xl"
									style={{ backgroundColor: "#F0F5ED" }}
								>
									{React.cloneElement(stepInfo.icon as React.ReactElement, {
										style: { color: "#5C7F4F" },
									})}
								</div>
							</div>

							<h3
								className="text-lg font-medium mb-2"
								style={{ color: "#2D3748" }}
							>
								{stepInfo.subtitle}
							</h3>

							<ul className="space-y-2 mb-6 text-left" role="list">
								{stepInfo.instructions.map((instruction, index) => (
									<li
										key={index}
										className="flex items-start gap-2 p-2 rounded-lg"
										style={{ backgroundColor: "#F5F9F3" }}
									>
										<span
											className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
											style={{ backgroundColor: "#7A9B6E" }}
										>
											{index + 1}
										</span>
										<span className="text-sm" style={{ color: "#4A5568" }}>
											{instruction}
										</span>
									</li>
								))}
							</ul>

							<p className="text-xs italic" style={{ color: "#5C7F4F" }}>
								{stepInfo.tip}
							</p>
						</div>

						<button
							onClick={handleContinue}
							className="w-full mt-6 py-3 text-white rounded-xl font-medium transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
							style={{
								background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
								focusRingColor: "#5C7F4F",
							}}
							aria-label={
								currentStep === "distance"
									? "Complete reset"
									: "Continue to next step"
							}
						>
							{currentStep === "distance" ? "Complete" : "Continue"}
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
							<Monitor className="w-8 h-8" style={{ color: "#5C7F4F" }} />
						</div>
					</div>

					<h2
						id="complete-title"
						className="text-xl font-normal mb-2"
						style={{ color: "#2D3748" }}
					>
						Tech Fatigue Reset Complete
					</h2>

					<p className="text-sm mb-4" style={{ color: "#4A5568" }}>
						Your eyes and body thank you
					</p>

					<div
						className="p-3 rounded-xl"
						style={{ backgroundColor: "#F5F9F3" }}
					>
						<p className="text-xs" style={{ color: "#5C7F4F" }}>
							Remember: Regular breaks prevent fatigue buildup
						</p>
					</div>
				</div>
			</section>
		</div>
	);
};
// Export alias
export const TechnologyFatigueReset = TechnologyFatigueResetAccessible;
