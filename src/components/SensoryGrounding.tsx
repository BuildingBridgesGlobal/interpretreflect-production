import { Brain, Heart, Mountain, Pause, Play, Wind, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface SensoryGroundingProps {
	onClose: () => void;
	onComplete?: (data: any) => void;
}

export const SensoryGrounding: React.FC<SensoryGroundingProps> = ({
	onClose,
	onComplete,
}) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [selectedApproach, setSelectedApproach] = useState("adaptive");
	const [showPostPractice, setShowPostPractice] = useState(false);
	const [completedSteps, setCompletedSteps] = useState<string[]>([]);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	// Post-practice states
	const [groundingEffect, setGroundingEffect] = useState("");
	const [mostHelpful, setMostHelpful] = useState("");
	const [adjustmentNeeds, setAdjustmentNeeds] = useState("");
	const [continueUsing, setContinueUsing] = useState(false);
	const [notes, setNotes] = useState("");

	const approaches = [
		{
			id: "adaptive",
			title: "Adaptive Grounding",
			icon: Heart,
			description: "Choose what works for you",
			steps: [
				{
					title: "Notice Your Environment",
					options: [
						"Look around and notice shapes or colors",
						"Feel the surface you're on",
						"Listen to any sounds present",
						"Imagine a calming place",
						"Count your breaths",
					],
				},
				{
					title: "Connect With Something",
					options: [
						"Touch something with texture",
						"Focus on your breathing",
						"Think of 3 things you're grateful for",
						"Stretch or move gently",
						"Recall a positive memory",
					],
				},
				{
					title: "Engage Your Mind",
					options: [
						"Name items in your space",
						"Count backwards from 20",
						'Think of words starting with "A"',
						"Recall your favorite song",
						"Plan something pleasant",
					],
				},
				{
					title: "Find Your Anchor",
					options: [
						"Feel your feet on the ground",
						"Notice your breath rhythm",
						"Hold something comforting",
						"Think of someone you care about",
						"Focus on the present moment",
					],
				},
			],
		},
		{
			id: "movement",
			title: "Movement-Based",
			icon: Mountain,
			description: "Ground through gentle movement",
			steps: [
				{
					title: "Gentle Movement",
					options: [
						"Roll your shoulders",
						"Stretch your fingers",
						"Wiggle your toes",
						"Turn your head slowly",
						"Adjust your position",
					],
				},
			],
		},
		{
			id: "mental",
			title: "Mind-Focused",
			icon: Brain,
			description: "Use thoughts and memories",
			steps: [
				{
					title: "Mental Grounding",
					options: [
						"List favorite places",
						"Recall happy memories",
						"Plan a future activity",
						"Think of loved ones",
						"Imagine peaceful scenes",
					],
				},
			],
		},
		{
			id: "breathing",
			title: "Breath-Centered",
			icon: Wind,
			description: "Focus on your breathing",
			steps: [
				{
					title: "Breath Awareness",
					options: [
						"Count breaths to 10",
						"Notice air temperature",
						"Feel chest or belly movement",
						"Breathe with a rhythm",
						"Just observe breathing",
					],
				},
			],
		},
	];

	useEffect(() => {
		if (isPlaying) {
			intervalRef.current = setTimeout(() => {
				setTimeElapsed((prev) => prev + 1);
			}, 1000);
		}

		return () => {
			if (intervalRef.current) clearTimeout(intervalRef.current);
		};
	}, [isPlaying, timeElapsed]);

	const currentApproach =
		approaches.find((a) => a.id === selectedApproach) || approaches[0];
	const currentStepData =
		currentApproach.steps[
			Math.min(currentStep, currentApproach.steps.length - 1)
		];

	const handleNextStep = () => {
		if (currentStep < currentApproach.steps.length - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			setIsPlaying(false);
			setShowPostPractice(true);
		}
	};

	const handleComplete = () => {
		const data = {
			approach: selectedApproach,
			duration: timeElapsed,
			completedSteps,
			groundingEffect,
			mostHelpful,
			adjustmentNeeds,
			continueUsing,
			notes,
			timestamp: new Date().toISOString(),
		};

		if (onComplete) onComplete(data);
		onClose();
	};

	if (showPostPractice) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
					<div className="p-8">
						<h2
							className="text-2xl font-bold mb-2"
							style={{ color: "#1A1A1A" }}
						>
							How Was Your Grounding Experience?
						</h2>
						<p className="text-gray-600 mb-6">
							Your feedback helps us personalize your experience
						</p>

						{/* Grounding Effect */}
						<div className="mb-6">
							<p className="font-semibold mb-3">
								How grounded do you feel now?
							</p>
							<div className="space-y-2">
								{[
									"Much more present and grounded",
									"Somewhat more grounded",
									"About the same",
									"Less grounded",
									"Not sure",
								].map((option) => (
									<label
										key={option}
										className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
									>
										<input
											type="radio"
											name="groundingEffect"
											value={option}
											checked={groundingEffect === option}
											onChange={(e) => setGroundingEffect(e.target.value)}
											className="mr-3"
										/>
										<span>{option}</span>
									</label>
								))}
							</div>
						</div>

						{/* Most Helpful */}
						<div className="mb-6">
							<p className="font-semibold mb-3">What was most helpful?</p>
							<select
								value={mostHelpful}
								onChange={(e) => setMostHelpful(e.target.value)}
								className="w-full p-3 border rounded-lg"
							>
								<option value="">Choose an option...</option>
								<option value="having-choices">
									Having multiple options to choose from
								</option>
								<option value="no-pressure">
									No pressure to use specific senses
								</option>
								<option value="flexible-timing">
									Being able to go at my own pace
								</option>
								<option value="mental-options">
									Mental/imagination options
								</option>
								<option value="movement-options">Movement options</option>
								<option value="breathing-focus">Breathing focus</option>
							</select>
						</div>

						{/* Adjustments */}
						<div className="mb-6">
							<p className="font-semibold mb-3">
								Any adjustments for next time?
							</p>
							<textarea
								value={adjustmentNeeds}
								onChange={(e) => setAdjustmentNeeds(e.target.value)}
								placeholder="Optional: What would make this work better for you?"
								className="w-full p-3 border rounded-lg h-20"
							/>
						</div>

						{/* Continue Using */}
						<div className="mb-6">
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={continueUsing}
									onChange={(e) => setContinueUsing(e.target.checked)}
									className="mr-3"
								/>
								<span>I'd like to use this grounding practice regularly</span>
							</label>
						</div>

						<div className="flex gap-3">
							<button
								onClick={handleComplete}
								className="flex-1 px-6 py-3 rounded-lg font-semibold text-white"
								style={{ backgroundColor: "#5C7F4F" }}
							>
								Complete
							</button>
							<button
								onClick={onClose}
								className="px-6 py-3 rounded-lg font-semibold border border-gray-300"
							>
								Skip Reflection
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
				<div className="p-8">
					{/* Header */}
					<div className="flex justify-between items-start mb-6">
						<div>
							<h2
								className="text-2xl font-bold mb-2"
								style={{ color: "#1A1A1A" }}
							>
								Sensory Grounding
							</h2>
							<p className="text-gray-600">
								Ground yourself in ways that work for you
							</p>
						</div>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					{/* Approach Selector */}
					<div className="mb-6">
						<p className="text-sm font-semibold mb-3">
							Choose your grounding approach:
						</p>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
							{approaches.map((approach) => {
								const Icon = approach.icon;
								return (
									<button
										key={approach.id}
										onClick={() => {
											setSelectedApproach(approach.id);
											setCurrentStep(0);
										}}
										className={`p-4 rounded-lg border text-center ${
											selectedApproach === approach.id
												? "bg-[rgba(107,130,104,0.05)] border-[#6B8268]"
												: "border-gray-300"
										}`}
									>
										<Icon
											className="w-6 h-6 mx-auto mb-2"
											style={{
												color:
													selectedApproach === approach.id
														? "#5C7F4F"
														: "#9CA3AF",
											}}
										/>
										<p className="font-medium text-sm">{approach.title}</p>
										<p className="text-xs text-gray-500 mt-1">
											{approach.description}
										</p>
									</button>
								);
							})}
						</div>
					</div>

					{/* Current Step */}
					{currentStepData && (
						<div className="mb-6">
							<div
								className="mb-4 p-6 rounded-xl"
								style={{ backgroundColor: "#F8FBF6" }}
							>
								<p
									className="text-lg font-semibold mb-4"
									style={{ color: "#5C7F4F" }}
								>
									Step {currentStep + 1}: {currentStepData.title}
								</p>
								<div className="space-y-2">
									<p className="text-sm text-gray-600 mb-3">
										Choose any that work for you (or create your own):
									</p>
									{currentStepData.options.map((option, idx) => (
										<label
											key={idx}
											className="flex items-start p-3 rounded-lg bg-white border border-gray-200 cursor-pointer hover:bg-gray-50"
										>
											<input
												type="checkbox"
												className="mr-3 mt-0.5"
												onChange={(e) => {
													if (e.target.checked) {
														setCompletedSteps([...completedSteps, option]);
													}
												}}
											/>
											<span className="text-sm">{option}</span>
										</label>
									))}
								</div>
							</div>

							{/* Alternative text input */}
							<div className="mb-4">
								<p className="text-sm text-gray-600 mb-2">
									Or do something else that helps you:
								</p>
								<input
									type="text"
									placeholder="Describe what you're doing..."
									className="w-full p-3 border rounded-lg"
									onKeyPress={(e) => {
										if (e.key === "Enter" && e.currentTarget.value) {
											setCompletedSteps([
												...completedSteps,
												e.currentTarget.value,
											]);
											e.currentTarget.value = "";
										}
									}}
								/>
							</div>
						</div>
					)}

					{/* Important Notes */}
					<div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
						<p className="text-sm font-semibold text-blue-900 mb-2">
							Remember:
						</p>
						<ul className="text-sm text-blue-800 space-y-1">
							<li>• There's no "right" way to ground yourself</li>
							<li>• Skip anything that doesn't feel helpful</li>
							<li>• You can adapt any suggestion to your needs</li>
							<li>• Going slowly is perfectly fine</li>
							<li>• Your comfort and safety come first</li>
						</ul>
					</div>

					{/* Timer */}
					<div className="text-center mb-6">
						<p className="text-sm text-gray-600">Time elapsed:</p>
						<p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
							{Math.floor(timeElapsed / 60)}:
							{(timeElapsed % 60).toString().padStart(2, "0")}
						</p>
					</div>

					{/* Controls */}
					<div className="flex justify-center gap-4">
						{!isPlaying ? (
							<button
								onClick={() => setIsPlaying(true)}
								className="flex items-center px-8 py-3 rounded-lg font-semibold text-white"
								style={{ backgroundColor: "#5C7F4F" }}
							>
								<Play className="w-5 h-5 mr-2" />
								Start Timer
							</button>
						) : (
							<button
								onClick={() => setIsPlaying(false)}
								className="flex items-center px-8 py-3 rounded-lg font-semibold text-white"
								style={{ backgroundColor: "#FB923C" }}
							>
								<Pause className="w-5 h-5 mr-2" />
								Pause
							</button>
						)}

						<button
							onClick={handleNextStep}
							className="flex items-center px-6 py-3 rounded-lg font-semibold border border-gray-300"
						>
							{currentStep < currentApproach.steps.length - 1
								? "Next Step"
								: "Finish"}
						</button>
					</div>

					{/* Quick Exit Option */}
					<div className="mt-6 text-center">
						<button
							onClick={() => setShowPostPractice(true)}
							className="text-sm text-gray-500 underline"
						>
							I'm grounded enough - skip to end
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
