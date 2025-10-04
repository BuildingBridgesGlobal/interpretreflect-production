import {
	AlertCircle,
	Battery,
	Brain,
	Calendar,
	ChevronRight,
	Cloud,
	CloudRain,
	Heart,
	Moon,
	Sparkles,
	Sun,
	Users,
	Wind,
	Zap,
} from "lucide-react";
import React, { useMemo, useState } from "react";

interface EmotionData {
	date: string;
	emotion: string;
	intensity: number;
	assignmentType?: string;
	toolsUsed?: string[];
}

interface StressEnergyData {
	date: string;
	stressLevel: number;
	energyLevel: number;
	burnoutScore: number;
	assignmentType?: string;
}

interface PatternInsight {
	type: "warning" | "success" | "info";
	title: string;
	message: string;
	action?: string;
	priority: "high" | "medium" | "low";
}

interface CommunityAverage {
	stressLevel: number;
	energyLevel: number;
	burnoutScore: number;
	topEmotions: string[];
	toolUsageRate: number;
}

// Emotion to color mapping for the emotion rag background
const emotionColors = {
	calm: {
		primary: "#E8F5E9",
		secondary: "#C8E6C9",
		gradient: "linear-gradient(135deg, #E8F5E9, #A5D6A7)",
	},
	anxious: {
		primary: "#FFF3E0",
		secondary: "#FFE0B2",
		gradient: "linear-gradient(135deg, #FFF3E0, #FFCC80)",
	},
	stressed: {
		primary: "#FFEBEE",
		secondary: "#FFCDD2",
		gradient: "linear-gradient(135deg, #FFEBEE, #EF9A9A)",
	},
	energized: {
		primary: "#E3F2FD",
		secondary: "#BBDEFB",
		gradient: "linear-gradient(135deg, #E3F2FD, #90CAF9)",
	},
	exhausted: {
		primary: "#F3E5F5",
		secondary: "#E1BEE7",
		gradient: "linear-gradient(135deg, #F3E5F5, #CE93D8)",
	},
	focused: {
		primary: "#E0F2F1",
		secondary: "#B2DFDB",
		gradient: "linear-gradient(135deg, #E0F2F1, #80CBC4)",
	},
	overwhelmed: {
		primary: "#FBE9E7",
		secondary: "#FFCCBC",
		gradient: "linear-gradient(135deg, #FBE9E7, #FFAB91)",
	},
	accomplished: {
		primary: "#F1F8E9",
		secondary: "#DCEDC8",
		gradient: "linear-gradient(135deg, #F1F8E9, #AED581)",
	},
};

export function GrowthInsightsEnhanced() {
	const [timeRange, setTimeRange] = useState<"week" | "month" | "90days">(
		"week",
	);
	const [selectedMetric, setSelectedMetric] = useState<
		"stress" | "energy" | "burnout" | "emotions"
	>("stress");
	const [showCommunityComparison, setShowCommunityComparison] = useState(false);

	// Mock data - in production, this would come from your data store
	const [emotionData] = useState<EmotionData[]>([
		{
			date: "2024-01-15",
			emotion: "anxious",
			intensity: 7,
			assignmentType: "medical",
			toolsUsed: ["breathing", "body-check"],
		},
		{
			date: "2024-01-16",
			emotion: "calm",
			intensity: 4,
			assignmentType: "educational",
			toolsUsed: ["affirmation"],
		},
		{
			date: "2024-01-17",
			emotion: "stressed",
			intensity: 8,
			assignmentType: "legal",
			toolsUsed: ["reset", "breathing"],
		},
		{
			date: "2024-01-18",
			emotion: "energized",
			intensity: 3,
			assignmentType: "community",
			toolsUsed: ["reflection"],
		},
		{
			date: "2024-01-19",
			emotion: "anxious",
			intensity: 9,
			assignmentType: "medical",
			toolsUsed: ["breathing", "reset", "body-check"],
		},
	]);

	const [stressEnergyData] = useState<StressEnergyData[]>([
		{
			date: "2024-01-15",
			stressLevel: 7,
			energyLevel: 4,
			burnoutScore: 65,
			assignmentType: "medical",
		},
		{
			date: "2024-01-16",
			stressLevel: 4,
			energyLevel: 7,
			burnoutScore: 45,
			assignmentType: "educational",
		},
		{
			date: "2024-01-17",
			stressLevel: 8,
			energyLevel: 3,
			burnoutScore: 72,
			assignmentType: "legal",
		},
		{
			date: "2024-01-18",
			stressLevel: 3,
			energyLevel: 8,
			burnoutScore: 38,
			assignmentType: "community",
		},
		{
			date: "2024-01-19",
			stressLevel: 9,
			energyLevel: 2,
			burnoutScore: 78,
			assignmentType: "medical",
		},
	]);

	const [communityAverage] = useState<CommunityAverage>({
		stressLevel: 5.5,
		energyLevel: 6.2,
		burnoutScore: 52,
		topEmotions: ["anxious", "focused", "accomplished"],
		toolUsageRate: 68,
	});

	// Calculate dominant emotion for background
	const dominantEmotion = useMemo(() => {
		const emotionCounts = emotionData.reduce(
			(acc, item) => {
				acc[item.emotion] = (acc[item.emotion] || 0) + item.intensity;
				return acc;
			},
			{} as Record<string, number>,
		);

		return (
			Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
			"calm"
		);
	}, [emotionData]);

	// Pattern detection
	const patterns = useMemo((): PatternInsight[] => {
		const insights: PatternInsight[] = [];

		// Friday stress pattern
		const fridayData = stressEnergyData.filter(
			(d) => new Date(d.date).getDay() === 5,
		);
		if (fridayData.length > 0 && fridayData.every((d) => d.stressLevel > 6)) {
			insights.push({
				type: "warning",
				title: "Friday Pattern Detected",
				message:
					"You report high stress on Fridays. Consider more body check-ins before end-of-week assignments.",
				action: "Schedule Friday prep routine",
				priority: "high",
			});
		}

		// Medical assignment stress
		const medicalAssignments = stressEnergyData.filter(
			(d) => d.assignmentType === "medical",
		);
		const avgMedicalStress =
			medicalAssignments.reduce((sum, d) => sum + d.stressLevel, 0) /
			medicalAssignments.length;
		if (avgMedicalStress > 7) {
			insights.push({
				type: "warning",
				title: "Medical Assignment Stress",
				message:
					"Medical interpretations consistently trigger higher stress. Try the pre-assignment prep tool.",
				action: "Access medical prep toolkit",
				priority: "high",
			});
		}

		// Positive pattern: successful resets
		const resetDays = emotionData.filter((d) => d.toolsUsed?.includes("reset"));
		if (resetDays.length > 3) {
			insights.push({
				type: "success",
				title: "Reset Success Pattern",
				message:
					"You're effectively using reset tools. Your stress drops 40% after reset sessions.",
				priority: "low",
			});
		}

		// Energy dip pattern
		const lowEnergyDays = stressEnergyData.filter((d) => d.energyLevel < 4);
		if (lowEnergyDays.length >= 3) {
			insights.push({
				type: "info",
				title: "Energy Management",
				message:
					"Your energy dips below optimal 3+ times this week. Consider scheduling breaks between assignments.",
				action: "Review schedule",
				priority: "medium",
			});
		}

		return insights;
	}, [stressEnergyData, emotionData]);

	// Get emotion background style
	const emotionBackground =
		emotionColors[dominantEmotion as keyof typeof emotionColors] ||
		emotionColors.calm;

	return (
		<div
			className="min-h-screen relative"
			style={{
				background: emotionBackground.gradient,
				transition: "background 1s ease-in-out",
			}}
		>
			{/* Emotion Rag Overlay */}
			<div
				className="absolute inset-0 pointer-events-none opacity-30"
				style={{
					background: `radial-gradient(circle at 30% 50%, ${emotionBackground.primary} 0%, transparent 50%),
                       radial-gradient(circle at 70% 80%, ${emotionBackground.secondary} 0%, transparent 50%)`,
					mixBlendMode: "multiply",
				}}
				aria-hidden="true"
			/>

			<div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
				{/* Header */}
				<header className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1
								className="text-4xl font-bold mb-2"
								style={{ color: "var(--primary-900)" }}
							>
								Growth Insights Dashboard
							</h1>
							<p className="text-lg" style={{ color: "var(--text-secondary)" }}>
								Your wellness journey, visualized and understood
							</p>
						</div>

						{/* Dominant Emotion Indicator */}
						<div
							className="px-6 py-4 rounded-2xl"
							style={{
								backgroundColor: "var(--bg-card)",
								boxShadow: "var(--shadow-lg)",
							}}
						>
							<div className="flex items-center gap-3">
								<Heart
									className="h-6 w-6"
									style={{ color: "var(--primary-600)" }}
								/>
								<div>
									<p
										className="text-sm font-medium"
										style={{ color: "var(--text-tertiary)" }}
									>
										Current Emotional Climate
									</p>
									<p
										className="text-lg font-bold capitalize"
										style={{ color: "var(--primary-800)" }}
									>
										{dominantEmotion}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Time Range Selector */}
					<nav
						className="flex gap-2"
						role="tablist"
						aria-label="Time range selector"
					>
						{(["week", "month", "90days"] as const).map((range) => (
							<button
								key={range}
								onClick={() => setTimeRange(range)}
								role="tab"
								aria-selected={timeRange === range}
								aria-controls="insights-panel"
								className="px-4 py-2 rounded-lg font-medium transition-all"
								style={{
									backgroundColor:
										timeRange === range
											? "var(--primary-700)"
											: "var(--bg-card)",
									color:
										timeRange === range
											? "var(--text-inverse)"
											: "var(--text-primary)",
									border: `2px solid ${timeRange === range ? "var(--primary-700)" : "var(--border-default)"}`,
								}}
							>
								{range === "week"
									? "Past Week"
									: range === "month"
										? "Past Month"
										: "Past 90 Days"}
							</button>
						))}
					</nav>
				</header>

				{/* Pattern Insights Cards */}
				{patterns.length > 0 && (
					<section className="mb-8" aria-labelledby="insights-heading">
						<h2
							id="insights-heading"
							className="text-2xl font-bold mb-4"
							style={{ color: "var(--primary-900)" }}
						>
							Personalized Insights
						</h2>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{patterns.map((insight, index) => (
								<article
									key={index}
									className="p-5 rounded-xl"
									style={{
										backgroundColor: "var(--bg-card)",
										boxShadow: "var(--shadow-md)",
										borderLeft: `4px solid ${
											insight.type === "warning"
												? "var(--warning-600)"
												: insight.type === "success"
													? "var(--success-600)"
													: "var(--info-600)"
										}`,
									}}
								>
									<div className="flex items-start gap-3">
										<div
											className="p-2 rounded-lg"
											style={{
												backgroundColor:
													insight.type === "warning"
														? "var(--warning-100)"
														: insight.type === "success"
															? "var(--success-100)"
															: "var(--info-100)",
											}}
										>
											<AlertCircle
												className="h-5 w-5"
												style={{
													color:
														insight.type === "warning"
															? "var(--warning-600)"
															: insight.type === "success"
																? "var(--success-600)"
																: "var(--info-600)",
												}}
												aria-hidden="true"
											/>
										</div>
										<div className="flex-1">
											<h3
												className="font-semibold mb-1"
												style={{ color: "var(--text-primary)" }}
											>
												{insight.title}
											</h3>
											<p
												className="text-sm mb-3"
												style={{ color: "var(--text-secondary)" }}
											>
												{insight.message}
											</p>
											{insight.action && (
												<button
													className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
													style={{ color: "var(--primary-700)" }}
													aria-label={insight.action}
												>
													{insight.action}
													<ChevronRight
														className="h-4 w-4"
														aria-hidden="true"
													/>
												</button>
											)}
										</div>
									</div>
								</article>
							))}
						</div>
					</section>
				)}

				{/* Main Metrics Grid */}
				<div className="grid gap-6 lg:grid-cols-3">
					{/* Stress & Energy Chart */}
					<section
						className="lg:col-span-2 p-6 rounded-2xl"
						style={{
							backgroundColor: "var(--bg-card)",
							boxShadow: "var(--shadow-lg)",
						}}
						aria-labelledby="metrics-chart-heading"
					>
						<header className="flex items-center justify-between mb-6">
							<h2
								id="metrics-chart-heading"
								className="text-xl font-bold"
								style={{ color: "var(--primary-900)" }}
							>
								Stress & Energy Trends
							</h2>
							<div className="flex gap-2">
								{(["stress", "energy", "burnout"] as const).map((metric) => (
									<button
										key={metric}
										onClick={() => setSelectedMetric(metric)}
										className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
										style={{
											backgroundColor:
												selectedMetric === metric
													? "var(--primary-100)"
													: "transparent",
											color:
												selectedMetric === metric
													? "var(--primary-800)"
													: "var(--text-tertiary)",
											border: `1px solid ${selectedMetric === metric ? "var(--primary-300)" : "var(--border-default)"}`,
										}}
										aria-pressed={selectedMetric === metric}
									>
										{metric.charAt(0).toUpperCase() + metric.slice(1)}
									</button>
								))}
							</div>
						</header>

						{/* Chart Visualization */}
						<div
							className="h-64 relative rounded-lg p-4"
							style={{ backgroundColor: "var(--bg-secondary)" }}
							role="img"
							aria-label={`${selectedMetric} levels over ${timeRange}`}
						>
							{/* Simple bar chart visualization */}
							<div className="flex items-end justify-around h-full">
								{stressEnergyData.slice(0, 7).map((data, index) => {
									const value =
										selectedMetric === "stress"
											? data.stressLevel
											: selectedMetric === "energy"
												? data.energyLevel
												: data.burnoutScore / 10;

									return (
										<div
											key={index}
											className="flex-1 mx-1 rounded-t-lg transition-all hover:opacity-80"
											style={{
												height: `${value * 10}%`,
												backgroundColor:
													selectedMetric === "stress"
														? "var(--error-600)"
														: selectedMetric === "energy"
															? "var(--success-600)"
															: "var(--warning-600)",
											}}
											role="presentation"
											aria-hidden="true"
										>
											<span className="sr-only">
												{new Date(data.date).toLocaleDateString()}: {value}
											</span>
										</div>
									);
								})}
							</div>

							{/* X-axis labels */}
							<div className="flex justify-around mt-2">
								{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
									(day) => (
										<span
											key={day}
											className="text-xs"
											style={{ color: "var(--text-tertiary)" }}
										>
											{day}
										</span>
									),
								)}
							</div>
						</div>

						{/* Community Comparison Toggle */}
						<div
							className="mt-4 flex items-center justify-between p-3 rounded-lg"
							style={{ backgroundColor: "var(--primary-50)" }}
						>
							<label
								htmlFor="community-comparison"
								className="flex items-center gap-2 cursor-pointer"
							>
								<Users
									className="h-5 w-5"
									style={{ color: "var(--primary-700)" }}
								/>
								<span
									className="text-sm font-medium"
									style={{ color: "var(--text-primary)" }}
								>
									Compare with community average
								</span>
							</label>
							<button
								id="community-comparison"
								role="switch"
								aria-checked={showCommunityComparison}
								onClick={() =>
									setShowCommunityComparison(!showCommunityComparison)
								}
								className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
								style={{
									backgroundColor: showCommunityComparison
										? "var(--primary-600)"
										: "var(--neutral-300)",
								}}
							>
								<span
									className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
									style={{
										transform: showCommunityComparison
											? "translateX(26px)"
											: "translateX(2px)",
									}}
								/>
							</button>
						</div>

						{showCommunityComparison && (
							<div
								className="mt-4 p-4 rounded-lg"
								style={{ backgroundColor: "var(--bg-secondary)" }}
							>
								<h3
									className="text-sm font-semibold mb-3"
									style={{ color: "var(--text-primary)" }}
								>
									Community Comparison
								</h3>
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span
											className="text-sm"
											style={{ color: "var(--text-secondary)" }}
										>
											Your avg stress
										</span>
										<span
											className="font-semibold"
											style={{ color: "var(--text-primary)" }}
										>
											6.2
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span
											className="text-sm"
											style={{ color: "var(--text-secondary)" }}
										>
											Community avg
										</span>
										<span
											className="font-semibold"
											style={{ color: "var(--primary-600)" }}
										>
											{communityAverage.stressLevel}
										</span>
									</div>
									<div
										className="text-xs mt-2"
										style={{ color: "var(--text-tertiary)" }}
									>
										You're managing stress 13% better than average
									</div>
								</div>
							</div>
						)}
					</section>

					{/* Emotion Patterns */}
					<section
						className="p-6 rounded-2xl"
						style={{
							backgroundColor: "var(--bg-card)",
							boxShadow: "var(--shadow-lg)",
						}}
						aria-labelledby="emotion-patterns-heading"
					>
						<h2
							id="emotion-patterns-heading"
							className="text-xl font-bold mb-4"
							style={{ color: "var(--primary-900)" }}
						>
							Emotion Patterns
						</h2>

						{/* Emotion frequency list */}
						<div className="space-y-3">
							{Object.entries(
								emotionData.reduce(
									(acc, item) => {
										acc[item.emotion] = (acc[item.emotion] || 0) + 1;
										return acc;
									},
									{} as Record<string, number>,
								),
							)
								.sort((a, b) => b[1] - a[1])
								.slice(0, 5)
								.map(([emotion, count]) => (
									<div
										key={emotion}
										className="flex items-center justify-between p-3 rounded-lg"
										style={{ backgroundColor: "var(--bg-secondary)" }}
									>
										<div className="flex items-center gap-3">
											<div
												className="w-3 h-3 rounded-full"
												style={{
													backgroundColor:
														emotionColors[emotion as keyof typeof emotionColors]
															?.secondary || "var(--neutral-400)",
												}}
												aria-hidden="true"
											/>
											<span
												className="capitalize font-medium"
												style={{ color: "var(--text-primary)" }}
											>
												{emotion}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<span
												className="text-sm"
												style={{ color: "var(--text-tertiary)" }}
											>
												{count} times
											</span>
											<div
												className="w-16 h-2 rounded-full overflow-hidden"
												style={{ backgroundColor: "var(--neutral-200)" }}
												role="progressbar"
												aria-valuenow={count}
												aria-valuemin={0}
												aria-valuemax={emotionData.length}
											>
												<div
													className="h-full rounded-full"
													style={{
														width: `${(count / emotionData.length) * 100}%`,
														backgroundColor: "var(--primary-600)",
													}}
												/>
											</div>
										</div>
									</div>
								))}
						</div>

						{/* Emotion weather metaphor */}
						<div
							className="mt-6 p-4 rounded-lg text-center"
							style={{ backgroundColor: "var(--primary-50)" }}
						>
							<p
								className="text-sm font-medium mb-2"
								style={{ color: "var(--text-primary)" }}
							>
								Your Emotional Weather
							</p>
							<div className="flex justify-center gap-3">
								{dominantEmotion === "calm" && (
									<Sun
										className="h-8 w-8"
										style={{ color: "var(--warning-500)" }}
									/>
								)}
								{dominantEmotion === "anxious" && (
									<Cloud
										className="h-8 w-8"
										style={{ color: "var(--neutral-500)" }}
									/>
								)}
								{dominantEmotion === "stressed" && (
									<CloudRain
										className="h-8 w-8"
										style={{ color: "var(--info-600)" }}
									/>
								)}
								{dominantEmotion === "energized" && (
									<Zap
										className="h-8 w-8"
										style={{ color: "var(--accent-700)" }}
									/>
								)}
								{dominantEmotion === "exhausted" && (
									<Moon
										className="h-8 w-8"
										style={{ color: "var(--primary-700)" }}
									/>
								)}
								{dominantEmotion === "focused" && (
									<Wind
										className="h-8 w-8"
										style={{ color: "var(--primary-600)" }}
									/>
								)}
							</div>
							<p
								className="text-xs mt-2"
								style={{ color: "var(--text-tertiary)" }}
							>
								Mostly {dominantEmotion} with occasional changes
							</p>
						</div>
					</section>
				</div>

				{/* Toolkit Usage Analytics */}
				<section
					className="mt-6 p-6 rounded-2xl"
					style={{
						backgroundColor: "var(--bg-card)",
						boxShadow: "var(--shadow-lg)",
					}}
					aria-labelledby="toolkit-heading"
				>
					<h2
						id="toolkit-heading"
						className="text-xl font-bold mb-4"
						style={{ color: "var(--primary-900)" }}
					>
						Toolkit Effectiveness
					</h2>

					<div className="grid gap-4 md:grid-cols-3">
						{/* Most Used Tools */}
						<div
							className="p-4 rounded-lg"
							style={{ backgroundColor: "var(--bg-secondary)" }}
						>
							<h3
								className="font-semibold mb-3"
								style={{ color: "var(--text-primary)" }}
							>
								Your Go-To Tools
							</h3>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span
										className="text-sm"
										style={{ color: "var(--text-secondary)" }}
									>
										Breathing Exercises
									</span>
									<span
										className="text-sm font-semibold"
										style={{ color: "var(--success-600)" }}
									>
										85% effective
									</span>
								</div>
								<div className="flex justify-between">
									<span
										className="text-sm"
										style={{ color: "var(--text-secondary)" }}
									>
										Body Check-In
									</span>
									<span
										className="text-sm font-semibold"
										style={{ color: "var(--success-600)" }}
									>
										78% effective
									</span>
								</div>
								<div className="flex justify-between">
									<span
										className="text-sm"
										style={{ color: "var(--text-secondary)" }}
									>
										Reset Sessions
									</span>
									<span
										className="text-sm font-semibold"
										style={{ color: "var(--success-600)" }}
									>
										92% effective
									</span>
								</div>
							</div>
						</div>

						{/* Success Patterns */}
						<div
							className="p-4 rounded-lg"
							style={{ backgroundColor: "var(--success-100)" }}
						>
							<h3
								className="font-semibold mb-3"
								style={{ color: "var(--text-primary)" }}
							>
								What Works Best
							</h3>
							<ul
								className="space-y-2 text-sm"
								style={{ color: "var(--text-secondary)" }}
							>
								<li>• Morning breathing → 40% less stress</li>
								<li>• Pre-assignment prep → Better focus</li>
								<li>• Weekly reflection → Clearer patterns</li>
							</ul>
						</div>

						{/* Recommendations */}
						<div
							className="p-4 rounded-lg"
							style={{ backgroundColor: "var(--primary-50)" }}
						>
							<h3
								className="font-semibold mb-3"
								style={{ color: "var(--text-primary)" }}
							>
								Try This Week
							</h3>
							<ul
								className="space-y-2 text-sm"
								style={{ color: "var(--text-secondary)" }}
							>
								<li>• Temperature exploration for variety</li>
								<li>• Team reflection after group assignments</li>
								<li>• Affirmation studio for confidence</li>
							</ul>
						</div>
					</div>
				</section>

				{/* Action Nudges */}
				<section
					className="mt-6 p-6 rounded-2xl"
					style={{
						background:
							"linear-gradient(135deg, var(--primary-50), var(--accent-100))",
						boxShadow: "var(--shadow-lg)",
					}}
					aria-labelledby="nudges-heading"
				>
					<div className="flex items-center gap-3 mb-4">
						<Sparkles
							className="h-6 w-6"
							style={{ color: "var(--accent-700)" }}
						/>
						<h2
							id="nudges-heading"
							className="text-xl font-bold"
							style={{ color: "var(--primary-900)" }}
						>
							Personalized Nudges for This Week
						</h2>
					</div>

					<div className="grid gap-3 md:grid-cols-2">
						<div
							className="p-4 rounded-lg flex items-start gap-3"
							style={{ backgroundColor: "var(--bg-card)" }}
						>
							<Battery
								className="h-5 w-5 mt-0.5"
								style={{ color: "var(--warning-600)" }}
							/>
							<div>
								<p
									className="font-medium mb-1"
									style={{ color: "var(--text-primary)" }}
								>
									Energy Boost Needed
								</p>
								<p
									className="text-sm"
									style={{ color: "var(--text-secondary)" }}
								>
									Your energy dips around 2 PM. Try a 5-minute movement break.
								</p>
							</div>
						</div>

						<div
							className="p-4 rounded-lg flex items-start gap-3"
							style={{ backgroundColor: "var(--bg-card)" }}
						>
							<Brain
								className="h-5 w-5 mt-0.5"
								style={{ color: "var(--info-600)" }}
							/>
							<div>
								<p
									className="font-medium mb-1"
									style={{ color: "var(--text-primary)" }}
								>
									Friday Prep Reminder
								</p>
								<p
									className="text-sm"
									style={{ color: "var(--text-secondary)" }}
								>
									Set a Friday morning ritual. Your stress peaks on Fridays.
								</p>
							</div>
						</div>

						<div
							className="p-4 rounded-lg flex items-start gap-3"
							style={{ backgroundColor: "var(--bg-card)" }}
						>
							<Heart
								className="h-5 w-5 mt-0.5"
								style={{ color: "var(--error-600)" }}
							/>
							<div>
								<p
									className="font-medium mb-1"
									style={{ color: "var(--text-primary)" }}
								>
									Medical Assignment Support
								</p>
								<p
									className="text-sm"
									style={{ color: "var(--text-secondary)" }}
								>
									Use the emotion mapping tool before medical assignments.
								</p>
							</div>
						</div>

						<div
							className="p-4 rounded-lg flex items-start gap-3"
							style={{ backgroundColor: "var(--bg-card)" }}
						>
							<Calendar
								className="h-5 w-5 mt-0.5"
								style={{ color: "var(--success-600)" }}
							/>
							<div>
								<p
									className="font-medium mb-1"
									style={{ color: "var(--text-primary)" }}
								>
									Success Pattern
								</p>
								<p
									className="text-sm"
									style={{ color: "var(--text-secondary)" }}
								>
									Keep using reset tools - they're working great for you!
								</p>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
