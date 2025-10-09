import {
	Activity,
	AlertCircle,
	Battery,
	CheckCircle,
	Heart,
	Info,
	RefreshCw,
	Sunrise,
	Target,
	X,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { saveBurnoutAssessmentDirect, updateBurnoutAssessmentDirect } from "../utils/saveBurnoutAssessment";

interface DailyBurnoutGaugeProps {
	onComplete: (results: BurnoutAssessmentResults) => void;
	onClose: () => void;
}

interface AssessmentResult extends BurnoutAssessmentResults {
	id?: string;
	created_at?: string;
}

interface BurnoutAssessmentResults {
	energyTank: number;
	recoverySpeed: number;
	emotionalLeakage: number;
	performanceSignal: number;
	tomorrowReadiness: number;
	totalScore: number; // Normalized 0-10 score
	rawScore?: number; // Raw 5-25 score for reference
	riskLevel: "low" | "moderate" | "high" | "severe";
	date: string;
	timestamp: Date;
	contextFactors?: {
		workloadIntensity?: "light" | "moderate" | "heavy";
		emotionalDemand?: "low" | "medium" | "high";
		hadBreaks?: boolean;
		teamSupport?: boolean;
		difficultSession?: boolean;
	};
	recommendations?: string[];
}

const questions = [
	{
		id: "energyTank",
		icon: Battery,
		question: "Right now, my energy feels like:",
		theory: "Conservation of Resources Theory",
		whyItMatters: "Energy depletion is an early burnout indicator",
		options: [
			{
				value: 5,
				label: "Full tank - energized and ready",
				description: "Feeling recharged",
			},
			{
				value: 4,
				label: "Three quarters - good to go",
				description: "Solid energy",
			},
			{
				value: 3,
				label: "Half tank - managing okay",
				description: "Moderate energy",
			},
			{
				value: 2,
				label: "Running low - pushing through",
				description: "Energy depleting",
			},
			{ value: 1, label: "Empty - exhausted", description: "Critically low" },
		],
	},
	{
		id: "recoverySpeed",
		icon: RefreshCw,
		question: "After a break, I bounce back:",
		theory: "Allostatic Load Model",
		whyItMatters: "Recovery speed predicts resilience capacity",
		options: [
			{
				value: 5,
				label: "Quickly - refreshed after short breaks",
				description: "Fast recovery",
			},
			{
				value: 4,
				label: "Well - decent recharge from rest",
				description: "Good recovery",
			},
			{
				value: 3,
				label: "Slowly - need longer to feel better",
				description: "Slow recovery",
			},
			{
				value: 2,
				label: "Barely - breaks don't help much",
				description: "Poor recovery",
			},
			{
				value: 1,
				label: "Not at all - still tired after rest",
				description: "No recovery",
			},
		],
	},
	{
		id: "emotionalLeakage",
		icon: Heart,
		question: "Work thoughts/feelings after hours:",
		theory: "Emotional Labor & Spillover Theory",
		whyItMatters: "Boundary erosion accelerates burnout",
		options: [
			{
				value: 5,
				label: "Leave them at work - clear separation",
				description: "Strong boundaries",
			},
			{
				value: 4,
				label: "Mostly contained - rare intrusions",
				description: "Good boundaries",
			},
			{
				value: 3,
				label: "Some spillover - occasional rumination",
				description: "Some spillover",
			},
			{
				value: 2,
				label: "Often intrude - hard to disconnect",
				description: "Frequent spillover",
			},
			{
				value: 1,
				label: "Constant - can't stop thinking about work",
				description: "No boundaries",
			},
		],
	},
	{
		id: "performanceSignal",
		icon: Target,
		question: "My performance quality feels:",
		theory: "Job Demands-Resources Model",
		whyItMatters: "Performance decline signals resource depletion",
		options: [
			{
				value: 5,
				label: "Sharp - at my best",
				description: "Peak performance",
			},
			{
				value: 4,
				label: "Strong - doing well",
				description: "Good performance",
			},
			{
				value: 3,
				label: "Adequate - getting by",
				description: "Acceptable level",
			},
			{
				value: 2,
				label: "Slipping - making mistakes",
				description: "Declining quality",
			},
			{
				value: 1,
				label: "Struggling - can't focus",
				description: "Poor performance",
			},
		],
	},
	{
		id: "tomorrowReadiness",
		icon: Sunrise,
		question: "Thinking about tomorrow, I feel:",
		theory: "Anticipatory Stress & Future Time Perspective",
		whyItMatters: "Dread of tomorrow indicates burnout progression",
		options: [
			{
				value: 5,
				label: "Excited - looking forward to it",
				description: "Positive anticipation",
			},
			{
				value: 4,
				label: "Ready - prepared to tackle it",
				description: "Feeling prepared",
			},
			{
				value: 3,
				label: "Neutral - just another day",
				description: "Neither positive nor negative",
			},
			{
				value: 2,
				label: "Reluctant - not looking forward",
				description: "Some dread",
			},
			{
				value: 1,
				label: "Dreading - wish I could skip it",
				description: "Strong avoidance",
			},
		],
	},
];

// Original function for backward compatibility
const getRiskLevel = (
	score: number,
): "low" | "moderate" | "high" | "severe" => {
	const average = score / 5;
	if (average >= 4) return "low";
	if (average >= 3) return "moderate";
	if (average >= 2) return "high";
	return "severe";
};

// New function for normalized 0-10 scale
const getRiskLevelFromNormalized = (
	normalizedScore: number,
): "low" | "moderate" | "high" | "severe" => {
	// 0-10 scale: lower is better (less burnout)
	if (normalizedScore <= 2.5) return "low"; // 0-2.5: Low burnout
	if (normalizedScore <= 5) return "moderate"; // 2.5-5: Moderate burnout
	if (normalizedScore <= 7.5) return "high"; // 5-7.5: High burnout
	return "severe"; // 7.5-10: Severe burnout
};

const getRiskLevelDetails = (level: "low" | "moderate" | "high" | "severe") => {
	switch (level) {
		case "low":
			return {
				title: "Healthy Balance",
				description: "You're managing well with good energy reserves",
				icon: CheckCircle,
				color: "#5C7F4F",
				bgColor: "#F0F5ED",
				borderColor: "#7A9B6E",
			};
		case "moderate":
			return {
				title: "Early Warning Signs",
				description:
					"Some burnout indicators are elevated. Consider increasing recovery activities",
				icon: Activity,
				color: "#8B7355",
				bgColor: "#FFF9F0",
				borderColor: "#C4A57B",
			};
		case "high":
			return {
				title: "Action Needed",
				description:
					"Multiple burnout indicators are concerning. Priority recovery required",
				icon: AlertCircle,
				color: "#C87137",
				bgColor: "#FFF5EE",
				borderColor: "#E09456",
			};
		case "severe":
			return {
				title: "Critical Alert",
				description:
					"Burnout risk is severe. Immediate intervention recommended",
				icon: AlertCircle,
				color: "#B85450",
				bgColor: "#FFF0F0",
				borderColor: "#D67572",
			};
	}
};

const DailyBurnoutGaugeAccessible: React.FC<DailyBurnoutGaugeProps> = ({
	onComplete,
	onClose,
}) => {
	const { user } = useAuth();
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [answers, setAnswers] = useState({
		energyTank: 0,
		recoverySpeed: 0,
		emotionalLeakage: 0,
		performanceSignal: 0,
		tomorrowReadiness: 0,
	});
	const [showResults, setShowResults] = useState(false);
	const [showContextFactors, setShowContextFactors] = useState(false);
	const [contextFactors, setContextFactors] = useState({
		workloadIntensity: "" as "light" | "moderate" | "heavy" | "",
		emotionalDemand: "" as "low" | "medium" | "high" | "",
		hadBreaks: null as boolean | null,
		teamSupport: null as boolean | null,
		difficultSession: null as boolean | null,
	});

	const formRef = useRef<HTMLFormElement>(null);
	const progressRef = useRef<HTMLDivElement>(null);

	const handleAnswer = (value: number) => {
		const questionId = questions[currentQuestion].id as keyof typeof answers;
		setAnswers((prev) => ({ ...prev, [questionId]: value }));
	};

	const handleNext = () => {
		const questionId = questions[currentQuestion].id as keyof typeof answers;

		// Only proceed if an answer has been selected
		if (answers[questionId] === 0) {
			return;
		}

		if (currentQuestion < questions.length - 1) {
			setCurrentQuestion((prev) => prev + 1);
			// Announce progress to screen readers
			if (progressRef.current) {
				progressRef.current.focus();
			}
		} else {
			calculateResults();
		}
	};

	const handlePrevious = () => {
		if (currentQuestion > 0) {
			setCurrentQuestion((prev) => prev - 1);
			if (progressRef.current) {
				progressRef.current.focus();
			}
		}
	};

	const calculateResults = () => {
		// Calculate raw total (5-25 range)
		const rawTotal = Object.values(answers).reduce((sum, val) => sum + val, 0);

		// Normalize to 0-10 scale for display and database
		// (rawTotal - 5) / 20 * 10 = maps 5-25 to 0-10
		const normalizedScore = Math.round(((rawTotal - 5) / 20) * 10 * 10) / 10; // Round to 1 decimal

		// Get risk level based on normalized score
		const level = getRiskLevelFromNormalized(normalizedScore);

		// Only log essential info
		console.log(`✅ Daily Burnout Check: Score ${normalizedScore}/10, Wellness ${Math.round((10 - normalizedScore) * 10)}%`);

		setShowResults(true);

		const results: BurnoutAssessmentResults = {
			...answers,
			totalScore: normalizedScore, // Use normalized score (0-10)
			rawScore: rawTotal, // Keep raw score for reference
			riskLevel: level,
			date: new Date().toISOString().split("T")[0],
			timestamp: new Date(),
			recommendations: getRecommendations(answers, level),
		};

		// Save to database if user is logged in
		if (user) {
			saveAssessment(results);
		}

		onComplete(results);
	};

	const getRecommendations = (
		answersObj: typeof answers,
		level: string,
	): string[] => {
		const recs = [];

		if (answersObj.energyTank <= 2) {
			recs.push("Take a 5-minute breathing break every hour today");
			recs.push("Consider a brief walk or stretch session");
		}

		if (answersObj.recoverySpeed <= 2) {
			recs.push("Try the Professional Boundaries Reset tool");
			recs.push("Schedule protected recovery time between sessions");
		}

		if (answersObj.emotionalLeakage <= 2) {
			recs.push("Practice the Assignment Reset technique after work");
			recs.push("Create a transition ritual between work and personal time");
		}

		if (answersObj.performanceSignal <= 2) {
			recs.push("Use the Body Check-In to identify tension points");
			recs.push("Take micro-breaks to maintain focus");
		}

		if (answersObj.tomorrowReadiness <= 2) {
			recs.push("End today with the Evening Reflection practice");
			recs.push("Set one small, achievable goal for tomorrow");
		}

		return recs;
	};

	const saveAssessment = async (results: BurnoutAssessmentResults) => {
		if (!user) {
			console.error("No user found, cannot save assessment");
			alert("Please log in to save your assessment");
			return;
		}

		// Single consolidated log
		console.log(`💾 Saving assessment: ${results.date}, Score: ${results.totalScore}/10`);
		console.log("📊 User ID:", user.id);

		try {
			// Get just the date string (YYYY-MM-DD) for the DATE column
			const assessmentDate = new Date().toISOString().split('T')[0];

			// Prepare data matching exact table structure
			const saveData = {
				user_id: user.id,
				assessment_date: assessmentDate,
				burnout_score: results.totalScore, // numeric 0-10
				risk_level: results.riskLevel, // text: low/moderate/high/severe
				symptoms: {
					energy_tank: results.energyTank,
					recovery_speed: results.recoverySpeed,
					emotional_leakage: results.emotionalLeakage,
					performance_signal: results.performanceSignal,
					tomorrow_readiness: results.tomorrowReadiness,
				}, // jsonb
				energy_tank: results.energyTank, // integer 1-5
				recovery_speed: results.recoverySpeed, // integer 1-5
				emotional_leakage: results.emotionalLeakage, // integer 1-5
				performance_signal: results.performanceSignal, // integer 1-5
				tomorrow_readiness: results.tomorrowReadiness, // integer 1-5
				total_score: results.rawScore ? results.rawScore.toString() : `${results.totalScore}`, // text
				recovery_recommendations: results.recommendations || [], // text array
			};

			console.log("📊 Full save data:", saveData);
			console.log("🔄 Attempting to save to Supabase via direct API...");

			// Use direct REST API to avoid hanging
			const { data: savedData, error: burnoutError } = await saveBurnoutAssessmentDirect(saveData);

			console.log("📊 Supabase response:", { savedData, burnoutError });

			if (burnoutError) {
				console.error("❌ Insert failed:", burnoutError.message);
				console.error("❌ Full error:", burnoutError);

				// Handle duplicate entry for today - silently update
				if (burnoutError.code === "23505" || burnoutError.needsUpdate) {
					console.log("📝 Assessment already exists for today, updating instead...");

					// Update existing record for today using direct API
					const { data: updateData, error: updateError } = await updateBurnoutAssessmentDirect(
						user.id,
						results.date,
						saveData
					);

					if (updateError) {
						console.error("Error updating assessment:", updateError);
						alert("Error updating today's assessment. Please try again.");
					} else {
						console.log("✅ Assessment updated successfully:", updateData);
						// No alert - just log success
						window.dispatchEvent(new Event("burnout-assessment-saved"));
					}
				} else {
					alert(`Error saving assessment: ${burnoutError.message}`);
					throw burnoutError;
				}
			} else {
				console.log("✅ Assessment saved successfully:", savedData);
				// No alert - just log success

				// Skip verification query to avoid hanging
				console.log("✅ Save completed successfully (skipping verification to avoid hang)");

				// Force reload burnout data in parent component
				window.dispatchEvent(new Event("burnout-assessment-saved"));
			}

			// Save to localStorage for offline access and chart display
			const assessmentData = {
				energyTank: results.energyTank,
				recoverySpeed: results.recoverySpeed,
				emotionalLeakage: results.emotionalLeakage,
				performanceSignal: results.performanceSignal,
				tomorrowReadiness: results.tomorrowReadiness,
				totalScore: results.totalScore,
				level: results.riskLevel,
				date: results.date,
				timestamp: new Date().toISOString(),
			};

			// Save current assessment
			localStorage.setItem(
				"dailyBurnoutAssessment",
				JSON.stringify(assessmentData),
			);

			// Also save to history for trend tracking
			const existingHistory = localStorage.getItem("burnoutAssessmentHistory");
			const history = existingHistory ? JSON.parse(existingHistory) : [];

			// Check if we already have an assessment for today
			const todayIndex = history.findIndex((h: any) => h.date === results.date);
			if (todayIndex >= 0) {
				// Update existing assessment for today
				history[todayIndex] = assessmentData;
			} else {
				// Add new assessment
				history.push(assessmentData);
			}

			// Keep only last 30 days of history
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
			const recentHistory = history.filter(
				(h: any) => new Date(h.timestamp) > thirtyDaysAgo,
			);

			localStorage.setItem(
				"burnoutAssessmentHistory",
				JSON.stringify(recentHistory),
			);
			console.log(
				"✅ Saved burnout assessment to localStorage:",
				assessmentData,
			);
			console.log(
				"📊 Assessment wellness percentage:",
				Math.round(((assessmentData.totalScore - 5) / 20) * 100) + "%",
			);
			console.log("📅 Assessment date:", assessmentData.date);
			console.log("🕐 Assessment timestamp:", assessmentData.timestamp);

			// Also save to reflection_entries for Elya AI integration
			const { error: reflectionError } = await supabase
				.from("reflection_entries")
				.insert({
					user_id: user.id,
					reflection_id: `burnout_${Date.now()}`,
					entry_kind: "burnout_assessment",
					data: {
						energy_tank: results.energyTank,
						recovery_speed: results.recoverySpeed,
						emotional_leakage: results.emotionalLeakage,
						performance_signal: results.performanceSignal,
						tomorrow_readiness: results.tomorrowReadiness,
						total_score: results.totalScore,
						risk_level: results.riskLevel,
						context_factors: results.contextFactors,
						recommendations: results.recommendations,
						date: results.date,
					},
				});

			if (reflectionError)
				console.error("Error saving to reflection_entries:", reflectionError);
		} catch (error) {
			console.error("❌ Exception in saveAssessment:", error);
			console.error("❌ Error stack:", (error as Error).stack);
		}
	};

	const currentQ = questions[currentQuestion];
	const progress = ((currentQuestion + 1) / questions.length) * 100;

	if (showResults) {
		const total = Object.values(answers).reduce((sum, val) => sum + val, 0);
		const level = getRiskLevel(total);
		const levelDetails = getRiskLevelDetails(level);
		const LevelIcon = levelDetails.icon;

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
				<section
					aria-labelledby="results-heading"
					className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
				>
					<div className="p-6">
						<div className="flex justify-between items-start mb-6">
							<h2
								id="results-heading"
								className="text-2xl font-bold"
								style={{ color: "#2D3748" }}
							>
								Your Burnout Assessment Results
							</h2>
							<button
								onClick={onClose}
								className="p-2 rounded-lg transition-all text-white hover:opacity-90"
								style={{
									background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
								}}
								aria-label="Close assessment results"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Risk Level Card */}
						<div
							className="rounded-xl p-6 mb-6"
							style={{
								backgroundColor: levelDetails.bgColor,
								border: `2px solid ${levelDetails.borderColor}`,
							}}
							role="region"
							aria-labelledby="risk-level-heading"
						>
							<div className="flex items-start gap-4">
								<div
									className="p-3 rounded-lg"
									style={{ backgroundColor: levelDetails.color + "20" }}
								>
									<LevelIcon
										className="h-8 w-8"
										style={{ color: levelDetails.color }}
									/>
								</div>
								<div className="flex-1">
									<h3
										id="risk-level-heading"
										className="text-xl font-bold mb-2"
										style={{ color: levelDetails.color }}
									>
										{levelDetails.title}
									</h3>
									<p className="text-sm" style={{ color: "#4A5568" }}>
										{levelDetails.description}
									</p>
								</div>
							</div>
						</div>

						{/* Detailed Scores */}
						<div className="mb-6">
							<h3
								className="text-lg font-semibold mb-4"
								style={{ color: "#2D3748" }}
							>
								Your Detailed Scores
							</h3>
							<ul className="space-y-3" role="list">
								{Object.entries(answers).map(([key, value]) => {
									const question = questions.find((q) => q.id === key);
									if (!question) return null;
									const Icon = question.icon;

									return (
										<li
											key={key}
											className="flex items-center justify-between p-3 rounded-lg"
											style={{ backgroundColor: "#F7FAFC" }}
										>
											<div className="flex items-center gap-3">
												<Icon
													className="h-5 w-5"
													style={{ color: "#5C7F4F" }}
												/>
												<span
													className="font-medium"
													style={{ color: "#2D3748" }}
												>
													{key.replace(/([A-Z])/g, " $1").trim()}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<span
													className="font-bold"
													style={{ color: value >= 3 ? "#5C7F4F" : "#C87137" }}
												>
													{value}/5
												</span>
												<span className="text-sm" style={{ color: "#718096" }}>
													(
													{value >= 4
														? "Good"
														: value >= 3
															? "Fair"
															: value >= 2
																? "Low"
																: "Critical"}
													)
												</span>
											</div>
										</li>
									);
								})}
							</ul>
						</div>

						{/* Personalized Recommendations */}
						<div className="mb-6">
							<h3
								className="text-lg font-semibold mb-4"
								style={{ color: "#2D3748" }}
							>
								Your Personalized Recommendations
							</h3>
							<ul className="space-y-2" role="list">
								{getRecommendations(answers, level).map((rec, index) => (
									<li key={index} className="flex items-start gap-2">
										<CheckCircle
											className="h-5 w-5 mt-0.5 flex-shrink-0"
											style={{ color: "#5C7F4F" }}
										/>
										<span className="text-sm" style={{ color: "#4A5568" }}>
											{rec}
										</span>
									</li>
								))}
							</ul>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3">
							<button
								onClick={() => {
									setShowContextFactors(true);
									setShowResults(false);
								}}
								className="flex-1 py-3 px-4 rounded-xl font-medium transition-all"
								style={{
									backgroundColor: "#F0F5ED",
									color: "#5C7F4F",
									border: "2px solid #7A9B6E",
								}}
								aria-label="Add context about today"
							>
								Add Context
							</button>
							<button
								onClick={onClose}
								className="flex-1 py-3 px-4 rounded-xl font-medium text-white transition-all"
								style={{ backgroundColor: "#5C7F4F" }}
								aria-label="Try a resilience reset"
							>
								Try a Reset Tool
							</button>
						</div>
					</div>
				</section>
			</div>
		);
	}

	if (showContextFactors) {
		// Context factors form (similar structure with semantic HTML)
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
				<section
					aria-labelledby="context-heading"
					className="bg-white rounded-2xl max-w-xl w-full"
				>
					<form className="p-6">
						<h2
							id="context-heading"
							className="text-xl font-bold mb-4"
							style={{ color: "#2D3748" }}
						>
							Add Today's Context (Optional)
						</h2>
						{/* Context form fields here... */}
						<button
							type="submit"
							className="w-full py-3 rounded-xl font-medium text-white transition-all"
							style={{ backgroundColor: "#5C7F4F" }}
						>
							Save & Close
						</button>
					</form>
				</section>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<section
				aria-labelledby="burnout-gauge-heading"
				className="bg-white rounded-2xl max-w-2xl w-full"
			>
				<form
					ref={formRef}
					className="p-6"
					onSubmit={(e) => e.preventDefault()}
				>
					<div className="flex justify-between items-center mb-6">
						<h2
							id="burnout-gauge-heading"
							className="text-2xl font-bold"
							style={{ color: "#2D3748" }}
						>
							Daily Burnout Gauge
						</h2>
						<button
							type="button"
							onClick={onClose}
							className="p-2 rounded-lg transition-all text-white hover:opacity-90"
							style={{
								background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
							}}
							aria-label="Close daily burnout gauge"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					<p
						id="burnout-description"
						className="text-sm mb-6"
						style={{ color: "#4A5568" }}
					>
						Complete your daily wellness check for personalized recommendations.
					</p>

					{/* Progress indicator */}
					<div
						ref={progressRef}
						role="status"
						aria-live="polite"
						aria-atomic="true"
						className="mb-6"
						tabIndex={-1}
					>
						<div className="flex justify-between items-center mb-2">
							<span
								className="text-sm font-medium"
								style={{ color: "#2D3748" }}
							>
								Question {currentQuestion + 1} of {questions.length}
							</span>
							<span className="text-sm" style={{ color: "#718096" }}>
								{Math.round(progress)}% complete
							</span>
						</div>
						<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
							<div
								className="h-full transition-all duration-300"
								style={{
									width: `${progress}%`,
									backgroundColor: "#5C7F4F",
								}}
								role="progressbar"
								aria-valuenow={progress}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-label="Assessment progress"
							/>
						</div>
					</div>

					{/* Current Question */}
					<fieldset className="mb-6">
						<legend
							className="flex items-center gap-3 text-lg font-semibold mb-3"
							style={{ color: "#2D3748" }}
						>
							<currentQ.icon className="h-6 w-6" style={{ color: "#5C7F4F" }} />
							{currentQ.question}
						</legend>

						<div className="flex items-center gap-2 mb-4">
							<Info className="h-4 w-4" style={{ color: "#718096" }} />
							<small className="text-xs" style={{ color: "#718096" }}>
								Based on {currentQ.theory} • {currentQ.whyItMatters}
							</small>
						</div>

						<div className="space-y-2" role="radiogroup" aria-required="true">
							{currentQ.options.map((option) => (
								<label
									key={option.value}
									className="relative flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all hover:bg-gray-50"
									style={{
										backgroundColor:
											answers[currentQ.id as keyof typeof answers] ===
											option.value
												? "#F0F5ED"
												: "#FFFFFF",
										border: `2px solid ${answers[currentQ.id as keyof typeof answers] === option.value ? "#5C7F4F" : "#E2E8F0"}`,
									}}
								>
									<input
										type="radio"
										name={currentQ.id}
										value={option.value}
										onChange={() => handleAnswer(option.value)}
										className="absolute opacity-0 pointer-events-none"
										aria-describedby={`${currentQ.id}-${option.value}-desc`}
										tabIndex={-1}
									/>
									<div
										className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
										style={{
											borderColor:
												answers[currentQ.id as keyof typeof answers] ===
												option.value
													? "#5C7F4F"
													: "#CBD5E0",
										}}
									>
										{answers[currentQ.id as keyof typeof answers] ===
											option.value && (
											<div
												className="w-3 h-3 rounded-full"
												style={{ backgroundColor: "#5C7F4F" }}
											/>
										)}
									</div>
									<div className="flex-1">
										<div className="font-medium" style={{ color: "#2D3748" }}>
											{option.label}
										</div>
										<div
											id={`${currentQ.id}-${option.value}-desc`}
											className="text-sm mt-1"
											style={{ color: "#718096" }}
										>
											{option.description}
										</div>
									</div>
									<span
										className="px-2 py-1 rounded text-xs font-medium"
										style={{
											backgroundColor:
												option.value >= 4
													? "#F0F5ED"
													: option.value >= 3
														? "#FFF9F0"
														: "#FFF5EE",
											color:
												option.value >= 4
													? "#5C7F4F"
													: option.value >= 3
														? "#8B7355"
														: "#C87137",
										}}
									>
										{option.value}/5
									</span>
								</label>
							))}
						</div>
					</fieldset>

					{/* Navigation */}
					<div className="flex gap-3">
						{currentQuestion > 0 && (
							<button
								type="button"
								onClick={handlePrevious}
								className="px-6 py-3 rounded-xl font-medium transition-all"
								style={{
									backgroundColor: "#F0F5ED",
									color: "#5C7F4F",
									border: "2px solid #7A9B6E",
								}}
								aria-label="Go to previous question"
							>
								Previous
							</button>
						)}
						<button
							type="button"
							onClick={handleNext}
							className="flex-1 py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							style={{
								background:
									answers[currentQ.id as keyof typeof answers] === 0
										? "#A0AEC0"
										: "linear-gradient(135deg, #5C7F4F, #5B9378)",
							}}
							disabled={answers[currentQ.id as keyof typeof answers] === 0}
							aria-label={
								currentQuestion === questions.length - 1
									? "Complete assessment"
									: "Go to next question"
							}
						>
							{currentQuestion === questions.length - 1 ? "Complete" : "Next"}
						</button>
					</div>
				</form>
			</section>
		</div>
	);
};

export default DailyBurnoutGaugeAccessible;
