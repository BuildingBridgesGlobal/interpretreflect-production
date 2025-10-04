import { Activity, AlertCircle, CheckCircle, Gauge, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

interface DailyBurnoutGaugeProps {
	onComplete: (results: BurnoutAssessmentResults) => void;
	onClose: () => void;
}

interface BurnoutAssessmentResults {
	energyTank: number;
	recoverySpeed: number;
	emotionalLeakage: number;
	performanceSignal: number;
	tomorrowReadiness: number;
	totalScore: number;
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

const DailyBurnoutGauge: React.FC<DailyBurnoutGaugeProps> = ({
	onComplete,
	onClose,
}) => {
	const { user } = useAuth();
	const [currentQuestion, setCurrentQuestion] = useState(1);
	const [answers, setAnswers] = useState({
		energyTank: 0,
		recoverySpeed: 0,
		emotionalLeakage: 0,
		performanceSignal: 0,
		tomorrowReadiness: 0,
	});
	const [showResults, setShowResults] = useState(false);
	const [riskLevel, setRiskLevel] = useState<
		"low" | "moderate" | "high" | "severe"
	>("low");
	const [totalScore, setTotalScore] = useState(0);
	const [showContextFactors, setShowContextFactors] = useState(false);
	const [contextFactors, setContextFactors] = useState({
		workloadIntensity: "" as "light" | "moderate" | "heavy" | "",
		emotionalDemand: "" as "low" | "medium" | "high" | "",
		hadBreaks: null as boolean | null,
		teamSupport: null as boolean | null,
		difficultSession: null as boolean | null,
	});
	const [personalizedRecommendations, setPersonalizedRecommendations] =
		useState<string[]>([]);
	const [alreadyTakenToday, setAlreadyTakenToday] = useState(false);
	const [previousAssessments, setPreviousAssessments] = useState<
		AssessmentResult[]
	>([]);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Check if assessment was already taken today and load previous assessments
	useEffect(() => {
		const loadAssessments = async () => {
			if (user) {
				try {
					// Check if already taken today
					const today = new Date().toISOString().split("T")[0];
					const { data: todayData } = await supabase
						.from("burnout_assessments")
						.select("*")
						.eq("user_id", user.id)
						.eq("assessment_date", today)
						.single();

					if (todayData) {
						setAlreadyTakenToday(true);
					}

					// Load previous assessments (last 7)
					const { data: previousData, error } = await supabase
						.from("burnout_assessments")
						.select("*")
						.eq("user_id", user.id)
						.order("assessment_date", { ascending: false })
						.limit(7);

					if (error) throw error;

					if (previousData) {
						// Convert Supabase data to match our format
						const formattedData = previousData.map((d) => ({
							...d,
							date: d.assessment_date,
							timestamp: d.created_at,
							totalScore: parseFloat(d.total_score),
							riskLevel: d.risk_level,
						}));
						setPreviousAssessments(formattedData.reverse());
					}
				} catch (error) {
					console.error("Error loading assessments from Supabase:", error);
					// Fallback to localStorage
					const stored = localStorage.getItem("burnoutAssessments");
					if (stored) {
						try {
							const assessments = JSON.parse(stored);
							setPreviousAssessments(assessments.slice(-7));
						} catch (err) {
							console.error("Error loading from localStorage:", err);
						}
					}
				}
			} else {
				// Not logged in, use localStorage
				const lastDate = localStorage.getItem("lastAssessmentDate");
				if (lastDate) {
					const today = new Date().toISOString().split("T")[0];
					const lastAssessmentDate = new Date(lastDate)
						.toISOString()
						.split("T")[0];
					if (today === lastAssessmentDate) {
						setAlreadyTakenToday(true);
					}
				}

				const stored = localStorage.getItem("burnoutAssessments");
				if (stored) {
					try {
						const assessments = JSON.parse(stored);
						setPreviousAssessments(assessments.slice(-7));
					} catch (error) {
						console.error("Error loading previous assessments:", error);
					}
				}
			}
		};

		loadAssessments();
	}, [user]);

	const questions = [
		{
			id: "energyTank",
			number: 1,
			text: "Right now, my energy feels like:",
			subtext: "Based on Conservation of Resources Theory (Hobfoll, 1989)",
			scale: [
				{
					value: 1,
					label: "Full tank",
					description: "Ready for anything",
					color: "bg-green-100 hover:bg-green-200",
				},
				{
					value: 2,
					label: "Three-quarters",
					description: "Solid and stable",
					color: "bg-blue-100 hover:bg-blue-200",
				},
				{
					value: 3,
					label: "Half tank",
					description: "Managing but watching it",
					color: "bg-yellow-100 hover:bg-yellow-200",
				},
				{
					value: 4,
					label: "Quarter tank",
					description: "Running on fumes",
					color: "bg-orange-100 hover:bg-orange-200",
				},
				{
					value: 5,
					label: "Empty",
					description: "Nothing left to give",
					color: "bg-red-100 hover:bg-red-200",
				},
			],
		},
		{
			id: "recoverySpeed",
			number: 2,
			text: "After yesterday's work, I:",
			subtext: "Based on Allostatic Load research (McEwen, 1998)",
			scale: [
				{
					value: 1,
					label: "Bounced back",
					description: "Woke up refreshed",
					color: "bg-green-100 hover:bg-green-200",
				},
				{
					value: 2,
					label: "Mostly recovered",
					description: "Needed normal rest",
					color: "bg-blue-100 hover:bg-blue-200",
				},
				{
					value: 3,
					label: "Partially recovered",
					description: "Still carrying some weight",
					color: "bg-yellow-100 hover:bg-yellow-200",
				},
				{
					value: 4,
					label: "Barely recovered",
					description: "Exhaustion carried over",
					color: "bg-orange-100 hover:bg-orange-200",
				},
				{
					value: 5,
					label: "Didn't recover",
					description: "Feel worse today",
					color: "bg-red-100 hover:bg-red-200",
				},
			],
		},
		{
			id: "emotionalLeakage",
			number: 3,
			text: "Work content is:",
			subtext: "Based on Emotional Labor Theory (Hochschild, 1983)",
			scale: [
				{
					value: 1,
					label: "Staying at work",
					description: "Clear boundaries",
					color: "bg-green-100 hover:bg-green-200",
				},
				{
					value: 2,
					label: "Occasional thoughts",
					description: "Brief intrusions",
					color: "bg-blue-100 hover:bg-blue-200",
				},
				{
					value: 3,
					label: "Following me home",
					description: "Hard to shut off",
					color: "bg-yellow-100 hover:bg-yellow-200",
				},
				{
					value: 4,
					label: "Taking over",
					description: "Constant mental replay",
					color: "bg-orange-100 hover:bg-orange-200",
				},
				{
					value: 5,
					label: "Hard to disconnect",
					description: "Persistent thoughts",
					color: "bg-red-100 hover:bg-red-200",
				},
			],
		},
		{
			id: "performanceSignal",
			number: 4,
			text: "My interpreting accuracy/focus is:",
			subtext: "Based on Cognitive Fatigue research (Hockey, 2013)",
			scale: [
				{
					value: 1,
					label: "Sharp",
					description: "At my best",
					color: "bg-green-100 hover:bg-green-200",
				},
				{
					value: 2,
					label: "Normal",
					description: "Standard performance",
					color: "bg-blue-100 hover:bg-blue-200",
				},
				{
					value: 3,
					label: "Slipping",
					description: "More effort for same result",
					color: "bg-yellow-100 hover:bg-yellow-200",
				},
				{
					value: 4,
					label: "Struggling",
					description: "Noticeable mistakes",
					color: "bg-orange-100 hover:bg-orange-200",
				},
				{
					value: 5,
					label: "Need support",
					description: "Could use extra help today",
					color: "bg-red-100 hover:bg-red-200",
				},
			],
		},
		{
			id: "tomorrowReadiness",
			number: 5,
			text: "Thinking about tomorrow's assignments:",
			subtext: "Based on Anticipatory Stress research (Gaab et al., 2005)",
			scale: [
				{
					value: 1,
					label: "Energized",
					description: "Looking forward to it",
					color: "bg-green-100 hover:bg-green-200",
				},
				{
					value: 2,
					label: "Neutral",
					description: "It's just work",
					color: "bg-blue-100 hover:bg-blue-200",
				},
				{
					value: 3,
					label: "Hesitant",
					description: "Mild reluctance",
					color: "bg-yellow-100 hover:bg-yellow-200",
				},
				{
					value: 4,
					label: "Dreading",
					description: "Significant anxiety",
					color: "bg-orange-100 hover:bg-orange-200",
				},
				{
					value: 5,
					label: "Can't face it",
					description: "Want to call out",
					color: "bg-red-100 hover:bg-red-200",
				},
			],
		},
	];

	const currentQ = questions[currentQuestion - 1];

	const handleAnswer = (value: number) => {
		setAnswers((prev) => ({
			...prev,
			[currentQ.id]: value,
		}));

		if (currentQuestion < 5) {
			setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
		} else {
			calculateResults(value);
		}
	};

	const calculateResults = (lastAnswer: number) => {
		const finalAnswers = {
			...answers,
			[currentQ.id]: lastAnswer,
		};

		const total = Object.values(finalAnswers).reduce(
			(sum, val) => sum + val,
			0,
		);
		const average = total / 5;

		let risk: "low" | "moderate" | "high" | "severe";
		if (average <= 2) risk = "low";
		else if (average <= 3) risk = "moderate";
		else if (average <= 4) risk = "high";
		else risk = "severe";

		setTotalScore(average);
		setRiskLevel(risk);
		setShowResults(true);
		generatePersonalizedRecommendations(finalAnswers, risk);
	};

	const generatePersonalizedRecommendations = (
		answers: {
			energyTank: number;
			recoverySpeed: number;
			emotionalLeakage: number;
			performanceSignal: number;
			tomorrowReadiness: number;
		},
		risk: string,
	) => {
		const recommendations: string[] = [];

		// Energy Tank-specific recommendations
		if (answers.energyTank >= 4) {
			recommendations.push(
				"Your energy tank is critically low - schedule an immediate 20-minute restoration break",
			);
			recommendations.push(
				"Consider canceling or rescheduling non-essential tasks today",
			);
		}

		// Recovery Speed-specific recommendations
		if (answers.recoverySpeed >= 4) {
			recommendations.push(
				"Your recovery system is compromised - prioritize sleep hygiene tonight (aim for 8+ hours)",
			);
			recommendations.push(
				"Try a restorative activity: gentle yoga, nature walk, or warm bath",
			);
		}

		// Emotional Leakage-specific recommendations
		if (answers.emotionalLeakage >= 4) {
			recommendations.push(
				"Create a transition ritual: change clothes, take 5 deep breaths, or listen to music after work",
			);
			recommendations.push(
				'Write down intrusive work thoughts in a "worry journal" to externalize them',
			);
		}

		// Performance Signal-specific recommendations
		if (answers.performanceSignal >= 4) {
			recommendations.push(
				"Your performance is signaling danger - take more frequent micro-breaks (2 min every 30 min)",
			);
			recommendations.push(
				"Consider requesting team support or a reduced schedule if possible",
			);
		}

		// Tomorrow Readiness-specific recommendations
		if (answers.tomorrowReadiness >= 4) {
			recommendations.push(
				'Anticipatory stress is high - practice the "tomorrow prep" technique: visualize success, not problems',
			);
			recommendations.push(
				"Prepare one thing tonight that will make tomorrow easier (outfit, lunch, materials)",
			);
		}

		// Risk level recommendations
		if (risk === "severe") {
			recommendations.unshift(
				"CRITICAL: Your burnout indicators require immediate attention - contact support today",
			);
		} else if (risk === "high") {
			recommendations.unshift(
				"WARNING: Multiple systems showing strain - prioritize self-care immediately",
			);
		}

		setPersonalizedRecommendations(recommendations);
	};

	const handleComplete = async () => {
		if (
			!showContextFactors &&
			(riskLevel === "high" || riskLevel === "severe")
		) {
			setShowContextFactors(true);
			return;
		}

		setIsLoading(true);

		const results: BurnoutAssessmentResults = {
			...answers,
			totalScore,
			riskLevel,
			date: new Date().toISOString().split("T")[0],
			timestamp: new Date(),
			contextFactors: showContextFactors
				? {
						workloadIntensity: contextFactors.workloadIntensity || undefined,
						emotionalDemand: contextFactors.emotionalDemand || undefined,
						hadBreaks: contextFactors.hadBreaks || undefined,
						teamSupport: contextFactors.teamSupport || undefined,
						difficultSession: contextFactors.difficultSession || undefined,
					}
				: undefined,
			recommendations: personalizedRecommendations,
		};

		try {
			// Save to Supabase if user is logged in
			if (user) {
				const today = new Date().toISOString().split("T")[0];

				// Check if an assessment already exists for today
				const { data: existingData } = await supabase
					.from("burnout_assessments")
					.select("id")
					.eq("user_id", user.id)
					.eq("assessment_date", today)
					.single();

				const assessmentData = {
					user_id: user.id,
					energy_tank: answers.energyTank,
					recovery_speed: answers.recoverySpeed,
					emotional_leakage: answers.emotionalLeakage,
					performance_signal: answers.performanceSignal,
					tomorrow_readiness: answers.tomorrowReadiness,
					total_score: totalScore,
					risk_level: riskLevel,
					assessment_date: today,
					workload_intensity: contextFactors.workloadIntensity || null,
					emotional_demand: contextFactors.emotionalDemand || null,
					had_breaks: contextFactors.hadBreaks,
					team_support: contextFactors.teamSupport,
					difficult_session: contextFactors.difficultSession,
				};

				if (existingData) {
					// Update existing assessment
					const { error } = await supabase
						.from("burnout_assessments")
						.update(assessmentData)
						.eq("id", existingData.id);

					if (error) throw error;
				} else {
					// Insert new assessment
					const { error } = await supabase
						.from("burnout_assessments")
						.insert(assessmentData);

					if (error) throw error;
				}

				// Assessment saved to Supabase successfully
			}

			// Also save to localStorage for offline access and backwards compatibility
			const stored = localStorage.getItem("burnoutAssessments");
			const assessments = stored ? JSON.parse(stored) : [];
			assessments.push(results);
			// Keep only last 30 days
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
			const filtered = assessments.filter(
				(a: AssessmentResult) => new Date(a.timestamp) > thirtyDaysAgo,
			);
			localStorage.setItem("burnoutAssessments", JSON.stringify(filtered));

			// Also store today's assessment separately for quick access
			localStorage.setItem("todaysBurnoutAssessment", JSON.stringify(results));
			localStorage.setItem("lastAssessmentDate", new Date().toISOString());

			// Assessment saved successfully
			setSaveSuccess(true);

			// Show success message for 2 seconds then close
			setTimeout(() => {
				onComplete(results);
			}, 2000);
		} catch (error) {
			console.error("Error saving assessment:", error);
			alert("Error saving assessment. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const getRiskColor = () => {
		switch (riskLevel) {
			case "low":
				return "from-green-500 to-emerald-500";
			case "moderate":
				return "from-yellow-500 to-amber-500";
			case "high":
				return "from-orange-500 to-red-500";
			case "severe":
				return "from-red-600 to-red-800";
			default:
				return "from-gray-500 to-gray-600";
		}
	};

	const getRiskMessage = () => {
		switch (riskLevel) {
			case "low":
				return {
					title: "Healthy Balance",
					message:
						"Your burnout indicators are low. Keep maintaining your current self-care practices.",
					icon: <CheckCircle className="w-8 h-8 text-green-500" />,
				};
			case "moderate":
				return {
					title: "Early Warning Signs",
					message:
						"Some burnout indicators are elevated. Consider increasing recovery activities.",
					icon: <AlertCircle className="w-8 h-8 text-yellow-500" />,
				};
			case "high":
				return {
					title: "Burnout Risk High",
					message:
						"Multiple burnout indicators are concerning. Prioritize self-care and consider support.",
					icon: <AlertCircle className="w-8 h-8 text-orange-500" />,
				};
			case "severe":
				return {
					title: "Critical Burnout Level",
					message:
						"Severe burnout indicators. Immediate intervention recommended. Consider professional support.",
					icon: <AlertCircle className="w-8 h-8 text-red-600" />,
				};
			default:
				return {
					title: "",
					message: "",
					icon: null,
				};
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
				{!showResults ? (
					<>
						<div className="p-6 border-b border-gray-200 bg-gradient-to-r from-sage-500 to-green-500 from-sage-50 to-green-50">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<div className="w-12 h-12 bg-gradient-to-br from-sage-500 to-green-500 rounded-xl flex items-center justify-center">
										<Gauge className="w-6 h-6 text-white" />
									</div>
									<div>
										<h2 className="text-2xl font-bold text-gray-900">
											Daily Burnout Gauge
										</h2>
										<p className="text-sm text-gray-600 mt-1">
											5-question evidence-based assessment
										</p>
									</div>
								</div>
								<button
									onClick={onClose}
									className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
									aria-label="Close modal"
								>
									<X className="w-5 h-5 text-gray-500" />
								</button>
							</div>

							<div className="mt-6">
								<div className="flex space-x-2">
									{[1, 2, 3, 4, 5].map((num) => (
										<div
											key={num}
											className={`flex-1 h-2 rounded-full transition-all ${
												num <= currentQuestion ? "bg-sage-500" : "bg-gray-200"
											}`}
										/>
									))}
								</div>
								<p className="text-center text-sm text-gray-600 mt-2">
									Question {currentQuestion} of 5
								</p>
							</div>
						</div>

						<div className="p-8">
							<div className="mb-8">
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									{currentQ.text}
								</h3>
								<p className="text-sm text-gray-500 italic">
									{currentQ.subtext}
								</p>
							</div>

							<div className="space-y-3">
								{currentQ.scale.map((option) => (
									<button
										key={option.value}
										onClick={() => handleAnswer(option.value)}
										className={`w-full text-left p-4 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${option.color} border-gray-200 hover:border-gray-300`}
									>
										<div className="flex items-start">
											<div
												className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
													option.value <= 2
														? "bg-green-500"
														: option.value === 3
															? "bg-yellow-500"
															: option.value === 4
																? "bg-orange-500"
																: "bg-red-500"
												} text-white font-bold`}
											>
												{option.value}
											</div>
											<div className="flex-1">
												<div className="font-semibold text-gray-900">
													{option.label}
												</div>
												<div className="text-sm text-gray-600 mt-1">
													{option.description}
												</div>
											</div>
										</div>
									</button>
								))}
							</div>

							<div className="mt-8 p-4 bg-blue-50 rounded-lg">
								<p className="text-sm text-blue-800">
									<strong>Why this matters:</strong> Daily burnout monitoring
									can predict and prevent severe burnout with 84% accuracy when
									tracked consistently (Bakker & Costa, 2014)
								</p>
							</div>
						</div>
					</>
				) : (
					<>
						<div
							className={`p-6 border-b border-gray-200 bg-gradient-to-r from-sage-500 to-green-500 ${getRiskColor()}`}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
										<Activity className="w-6 h-6 text-white" />
									</div>
									<div>
										<h2 className="text-2xl font-bold text-white">
											Assessment Complete
										</h2>
										<p className="text-sm text-white opacity-90 mt-1">
											Your burnout risk level today
										</p>
									</div>
								</div>
								<button
									onClick={onClose}
									className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
									aria-label="Close modal"
								>
									<X className="w-5 h-5 text-white" />
								</button>
							</div>
						</div>

						<div className="p-8">
							<div className="text-center mb-8">
								{getRiskMessage().icon}
								<h3 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
									{getRiskMessage().title}
								</h3>
								<p className="text-gray-600">{getRiskMessage().message}</p>
							</div>

							<div className="mb-8">
								<div className="flex items-center justify-center mb-4">
									<div className="text-center">
										<div className="text-5xl font-bold text-gray-900">
											{totalScore.toFixed(1)}
										</div>
										<div className="text-sm text-gray-500 mt-1">
											Average Score
										</div>
									</div>
								</div>

								<div className="relative h-12 bg-gray-200 rounded-full overflow-hidden">
									<div className="absolute inset-0 flex">
										<div className="flex-1 bg-green-400"></div>
										<div className="flex-1 bg-yellow-400"></div>
										<div className="flex-1 bg-orange-400"></div>
										<div className="flex-1 bg-red-500"></div>
										<div className="flex-1 bg-red-700"></div>
									</div>
									<div
										className="absolute top-0 w-1 h-full bg-gray-900"
										style={{ left: `${(totalScore - 1) * 25}%` }}
									>
										<div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 rounded-full"></div>
									</div>
								</div>
								<div className="flex justify-between mt-2 text-xs text-gray-500">
									<span>Low Risk</span>
									<span>Moderate</span>
									<span>High</span>
									<span>Severe</span>
								</div>
							</div>

							<div className="space-y-3 mb-8">
								<h4 className="font-semibold text-gray-900">Your Scores:</h4>
								{Object.entries(answers).map(([key, value]) => {
									const question = questions.find((q) => q.id === key);
									const displayNames: Record<string, string> = {
										energyTank: "Energy Tank",
										recoverySpeed: "Recovery Speed",
										emotionalLeakage: "Emotional Leakage",
										performanceSignal: "Performance Signal",
										tomorrowReadiness: "Tomorrow Readiness",
									};
									return (
										<div
											key={key}
											className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
										>
											<span className="text-sm text-gray-700">
												{displayNames[key] || key}
											</span>
											<div className="flex items-center">
												<div
													className={`w-2 h-2 rounded-full mr-2 ${
														value <= 2
															? "bg-green-500"
															: value === 3
																? "bg-yellow-500"
																: value === 4
																	? "bg-orange-500"
																	: "bg-red-500"
													}`}
												></div>
												<span className="font-semibold">{value}/5</span>
											</div>
										</div>
									);
								})}
							</div>

							{showContextFactors ? (
								<div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg mb-6">
									<h4 className="font-semibold text-blue-900 mb-3">
										Context Factors (Optional)
									</h4>
									<p className="text-sm text-blue-700 mb-4">
										Help us understand what contributed to today's scores:
									</p>

									<div className="space-y-3">
										<div>
											<label className="text-sm font-medium text-gray-700">
												Today's workload intensity:
											</label>
											<div className="flex gap-2 mt-1">
												{["light", "moderate", "heavy"].map((level) => (
													<button
														key={level}
														onClick={() =>
															setContextFactors((prev) => ({
																...prev,
																workloadIntensity: level as
																	| "light"
																	| "moderate"
																	| "heavy",
															}))
														}
														className={`px-3 py-1 rounded-lg text-sm ${
															contextFactors.workloadIntensity === level
																? "bg-blue-500 text-white"
																: "bg-gray-100 hover:bg-gray-200"
														}`}
													>
														{level.charAt(0).toUpperCase() + level.slice(1)}
													</button>
												))}
											</div>
										</div>

										<div>
											<label className="text-sm font-medium text-gray-700">
												Emotional demand of sessions:
											</label>
											<div className="flex gap-2 mt-1">
												{["low", "medium", "high"].map((level) => (
													<button
														key={level}
														onClick={() =>
															setContextFactors((prev) => ({
																...prev,
																emotionalDemand: level as
																	| "low"
																	| "medium"
																	| "high",
															}))
														}
														className={`px-3 py-1 rounded-lg text-sm ${
															contextFactors.emotionalDemand === level
																? "bg-blue-500 text-white"
																: "bg-gray-100 hover:bg-gray-200"
														}`}
													>
														{level.charAt(0).toUpperCase() + level.slice(1)}
													</button>
												))}
											</div>
										</div>

										<div className="space-y-2">
											{[
												{
													key: "hadBreaks",
													label: "Had adequate breaks today",
												},
												{ key: "teamSupport", label: "Had team/peer support" },
												{
													key: "difficultSession",
													label: "Had particularly difficult session(s)",
												},
											].map((item) => (
												<div
													key={item.key}
													className="flex items-center justify-between"
												>
													<span className="text-sm text-gray-700">
														{item.label}
													</span>
													<div className="flex gap-2">
														<button
															onClick={() =>
																setContextFactors((prev) => ({
																	...prev,
																	[item.key]: true,
																}))
															}
															className={`px-3 py-1 rounded-lg text-sm ${
																contextFactors[
																	item.key as keyof typeof contextFactors
																] === true
																	? "bg-green-500 text-white"
																	: "bg-gray-100 hover:bg-gray-200"
															}`}
														>
															Yes
														</button>
														<button
															onClick={() =>
																setContextFactors((prev) => ({
																	...prev,
																	[item.key]: false,
																}))
															}
															className={`px-3 py-1 rounded-lg text-sm ${
																contextFactors[
																	item.key as keyof typeof contextFactors
																] === false
																	? "bg-red-500 text-white"
																	: "bg-gray-100 hover:bg-gray-200"
															}`}
														>
															No
														</button>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							) : personalizedRecommendations.length > 0 ? (
								<div
									className={`border-2 p-4 rounded-lg mb-6 ${
										riskLevel === "severe"
											? "bg-red-50 border-red-200"
											: riskLevel === "high"
												? "bg-orange-50 border-orange-200"
												: riskLevel === "moderate"
													? "bg-yellow-50 border-yellow-200"
													: "bg-green-50 border-green-200"
									}`}
								>
									<h4
										className={`font-semibold mb-2 ${
											riskLevel === "severe"
												? "text-red-900"
												: riskLevel === "high"
													? "text-orange-900"
													: riskLevel === "moderate"
														? "text-yellow-900"
														: "text-green-900"
										}`}
									>
										Personalized Recommendations:
									</h4>
									<ul className="space-y-2">
										{personalizedRecommendations.map((rec, index) => (
											<li
												key={index}
												className={`text-sm flex items-start ${
													riskLevel === "severe"
														? "text-red-800"
														: riskLevel === "high"
															? "text-orange-800"
															: riskLevel === "moderate"
																? "text-yellow-800"
																: "text-green-800"
												}`}
											>
												<span className="mr-2">•</span>
												<span
													className={
														index === 0 &&
														(riskLevel === "severe" || riskLevel === "high")
															? "font-semibold"
															: ""
													}
												>
													{rec}
												</span>
											</li>
										))}
									</ul>
								</div>
							) : null}

							<div className="bg-gray-50 p-4 rounded-lg mb-6">
								<h4 className="font-semibold text-gray-900 mb-2">
									The Science:
								</h4>
								<p className="text-sm text-gray-700 mb-2">
									This assessment uses five evidence-based indicators of
									interpreter wellbeing:
								</p>
								<ul className="space-y-1 text-sm text-gray-600">
									<li>
										• <strong>Energy Tank:</strong> Resource conservation and
										depletion (Hobfoll, 1989)
									</li>
									<li>
										• <strong>Recovery Speed:</strong> Allostatic load and
										resilience (McEwen, 1998)
									</li>
									<li>
										• <strong>Emotional Leakage:</strong> Work-life boundary
										management (Hochschild, 1983)
									</li>
									<li>
										• <strong>Performance Signal:</strong> Cognitive fatigue
										indicators (Hockey, 2013)
									</li>
									<li>
										• <strong>Tomorrow Readiness:</strong> Anticipatory stress
										response (Gaab et al., 2005)
									</li>
								</ul>
								<p className="text-sm text-gray-700 mt-2">
									Together, these provide a comprehensive picture of your
									current burnout risk and recovery needs.
								</p>
							</div>

							{alreadyTakenToday && (
								<div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
									<p className="text-sm text-amber-800">
										<AlertCircle className="inline w-4 h-4 mr-1" />
										You've already completed today's assessment. Taking another
										will overwrite today's data.
									</p>
								</div>
							)}

							{previousAssessments.length > 0 && (
								<div className="mb-4 p-4 bg-blue-50 rounded-lg">
									<h4 className="font-semibold text-blue-900 mb-2">
										Your Recent Progress:
									</h4>
									<div className="flex items-center space-x-2 overflow-x-auto">
										{previousAssessments.map((assessment, index) => (
											<div
												key={index}
												className="flex flex-col items-center min-w-[60px]"
												title={`${new Date(assessment.date).toLocaleDateString()}: ${assessment.riskLevel}`}
											>
												<div
													className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${
														assessment.riskLevel === "low"
															? "bg-green-500"
															: assessment.riskLevel === "moderate"
																? "bg-yellow-500"
																: assessment.riskLevel === "high"
																	? "bg-orange-500"
																	: "bg-red-500"
													}`}
												>
													{assessment.totalScore.toFixed(1)}
												</div>
												<span className="text-xs text-gray-600 mt-1">
													{new Date(assessment.date).toLocaleDateString(
														"en-US",
														{
															month: "short",
															day: "numeric",
														},
													)}
												</span>
											</div>
										))}
									</div>
								</div>
							)}

							{saveSuccess ? (
								<div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center">
									<CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
									<p className="text-green-800 font-semibold">
										Assessment Saved Successfully!
									</p>
									<p className="text-green-600 text-sm mt-1">
										{user
											? "Your progress has been saved to your account."
											: "Your progress has been tracked locally."}
									</p>
								</div>
							) : (
								<button
									onClick={handleComplete}
									disabled={isLoading}
									className="w-full py-3 bg-gradient-to-r from-sage-500 to-green-500 text-white rounded-lg font-semibold hover:from-sage-600 hover:to-green-600 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isLoading ? (
										<>
											<div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
											Saving...
										</>
									) : (
										<>
											{showContextFactors
												? "Save with Context"
												: "Save Assessment & Track Progress"}
											<CheckCircle className="w-5 h-5 ml-2" />
										</>
									)}
								</button>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default DailyBurnoutGauge;
