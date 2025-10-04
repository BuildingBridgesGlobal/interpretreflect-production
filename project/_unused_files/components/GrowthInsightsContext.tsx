/**
 * Growth Insights with Context-Specific Data
 * Displays context-specific reflection insights and metrics
 */

import {
	AlertCircle,
	ArrowDown,
	ArrowUp,
	Award,
	BarChart3,
	BookOpen,
	Brain,
	GraduationCap,
	PieChart,
	Scale,
	Sparkles,
	Stethoscope,
	Target,
	TrendingUp,
	Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import {
	type ContextStatistics,
	getContextStatistics,
	prepareContextDataForElya,
} from "../services/contextReflectionService";

interface ElyaContextData {
	contextDistribution: Record<string, number>;
	topChallenges: Array<{ challenge: string; frequency: number }>;
	skillProfile: Array<{ skill: string; frequency: number }>;
	contextMetrics: Record<string, any>;
	recommendations: string[];
	learningPathSuggestions: string[];
}

export const GrowthInsightsContext: React.FC = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [timePeriod, setTimePeriod] = useState<"week" | "month" | "90days">(
		"month",
	);
	const [statistics, setStatistics] = useState<ContextStatistics | null>(null);
	const [elyaData, setElyaData] = useState<ElyaContextData | null>(null);
	const [selectedContext, setSelectedContext] = useState<string>("all");

	// Context icons mapping
	const contextIcons: Record<string, React.ReactNode> = {
		medical: <Stethoscope className="w-5 h-5" />,
		legal: <Scale className="w-5 h-5" />,
		educational: <GraduationCap className="w-5 h-5" />,
		mental_health: <Brain className="w-5 h-5" />,
		community: <Users className="w-5 h-5" />,
	};

	// Context colors
	const contextColors: Record<string, string> = {
		medical: "#10B981", // green
		legal: "#3B82F6", // blue
		educational: "#F59E0B", // amber
		mental_health: "#8B5CF6", // purple
		community: "#EC4899", // pink
	};

	// Fetch data
	const fetchData = async () => {
		if (!user) return;

		setLoading(true);
		try {
			// Fetch context statistics
			const statsResult = await getContextStatistics(user.id, timePeriod);
			if (statsResult.success && statsResult.statistics) {
				setStatistics(statsResult.statistics);
			}

			// Prepare data for Elya
			const elyaResult = await prepareContextDataForElya(user.id, timePeriod);
			if (elyaResult.success && elyaResult.elyaContextData) {
				setElyaData(elyaResult.elyaContextData);
			}
		} catch (error) {
			console.error("Error fetching context insights:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [user, timePeriod]);

	// Connect with Elya for context-specific guidance
	const connectWithElyaForContext = () => {
		if (!elyaData) return;

		const message = `Elya Context Analysis Ready!
    
Context Distribution:
${Object.entries(elyaData.contextDistribution)
	.map(([context, count]) => `- ${context}: ${count} reflections`)
	.join("\n")}

Top Skills Demonstrated:
${elyaData.skillProfile
	.slice(0, 3)
	.map((skill) => `- ${skill.skill} (used ${skill.frequency} times)`)
	.join("\n")}

Top Challenges:
${elyaData.topChallenges
	.slice(0, 3)
	.map((challenge) => `- ${challenge.challenge}`)
	.join("\n")}

Recommended Learning Paths:
${elyaData.learningPathSuggestions
	.slice(0, 3)
	.map((path) => `- ${path}`)
	.join("\n")}

Elya can now provide specialized guidance for your interpreting contexts.`;

		alert(message);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading context-specific insights...</p>
				</div>
			</div>
		);
	}

	if (!statistics) {
		return (
			<div className="text-center py-8">
				<AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
				<p className="text-gray-600">No context-specific reflections found</p>
				<p className="text-sm text-gray-500 mt-2">
					Complete context-specific reflections to see insights here
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2 className="text-3xl font-bold text-gray-900">
						Context-Specific Insights
					</h2>
					<p className="text-gray-600 mt-1">
						Analyzing {statistics.totalReflections} context reflections
					</p>
				</div>

				<button
					onClick={connectWithElyaForContext}
					className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors flex items-center gap-2"
				>
					<Sparkles className="w-4 h-4" />
					Analyze with Elya
				</button>
			</div>

			{/* Time Period Selector */}
			<div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
				{(["week", "month", "90days"] as const).map((period) => (
					<button
						key={period}
						onClick={() => setTimePeriod(period)}
						className={`px-4 py-2 rounded-lg font-medium transition-all ${
							timePeriod === period
								? "bg-white text-sage-700 shadow-sm"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						{period === "week"
							? "Week"
							: period === "month"
								? "Month"
								: "90 Days"}
					</button>
				))}
			</div>

			{/* Context Distribution */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
					<PieChart className="w-5 h-5 text-sage-600" />
					Context Distribution
				</h3>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
					{Object.entries(statistics.byContext).map(([context, count]) => (
						<div
							key={context}
							className="text-center p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md"
							style={{
								borderColor:
									selectedContext === context
										? contextColors[context]
										: "#E5E7EB",
								backgroundColor:
									selectedContext === context
										? `${contextColors[context]}10`
										: "white",
							}}
							onClick={() =>
								setSelectedContext(
									context === selectedContext ? "all" : context,
								)
							}
						>
							<div
								className="flex justify-center mb-2"
								style={{ color: contextColors[context] }}
							>
								{contextIcons[context] || <Target className="w-5 h-5" />}
							</div>
							<div className="text-2xl font-bold text-gray-900">{count}</div>
							<div className="text-sm text-gray-600 capitalize">
								{context.replace("_", " ")}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Context-Specific Metrics */}
			{selectedContext !== "all" &&
				statistics.contextSpecificMetrics[selectedContext] && (
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<BarChart3
								className="w-5 h-5"
								style={{ color: contextColors[selectedContext] }}
							/>
							{selectedContext.replace("_", " ")} Performance Metrics
						</h3>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{Object.entries(
								statistics.contextSpecificMetrics[selectedContext],
							).map(([metric, score]) => (
								<MetricCard
									key={metric}
									label={formatMetricLabel(metric)}
									value={score as number}
									color={contextColors[selectedContext]}
								/>
							))}
						</div>
					</div>
				)}

			{/* Top Challenges & Skills */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Top Challenges */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<AlertCircle className="w-5 h-5 text-orange-500" />
						Top Challenges
					</h3>
					{statistics.topChallenges.length > 0 ? (
						<div className="space-y-3">
							{statistics.topChallenges.map((challenge, index) => (
								<div key={index} className="flex items-start gap-3">
									<span className="text-orange-500 font-semibold">
										#{index + 1}
									</span>
									<div className="flex-1">
										<p className="text-gray-700 text-sm">
											{challenge.challenge}
										</p>
										<p className="text-xs text-gray-500 mt-1">
											Mentioned {challenge.frequency} times
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-gray-500">No challenges identified yet</p>
					)}
				</div>

				{/* Top Skills */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<Award className="w-5 h-5 text-green-600" />
						Skills Demonstrated
					</h3>
					{statistics.topSkills.length > 0 ? (
						<div className="space-y-3">
							{statistics.topSkills.map((skill, index) => (
								<div key={index} className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="text-green-600">✓</span>
										<span className="text-gray-700 capitalize">
											{skill.skill}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-24 bg-gray-200 rounded-full h-2">
											<div
												className="bg-green-600 h-2 rounded-full"
												style={{
													width: `${Math.min(100, (skill.frequency / statistics.totalReflections) * 100)}%`,
												}}
											/>
										</div>
										<span className="text-sm text-gray-500">
											{skill.frequency}x
										</span>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-gray-500">
							Skills will appear as you complete more reflections
						</p>
					)}
				</div>
			</div>

			{/* Elya Recommendations */}
			{elyaData && (
				<div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-purple-200">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<Brain className="w-5 h-5 text-purple-600" />
						Elya's Personalized Recommendations
					</h3>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Action Items */}
						<div>
							<h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
								<Target className="w-4 h-4 text-purple-600" />
								Action Items
							</h4>
							<ul className="space-y-2">
								{elyaData.recommendations.slice(0, 4).map((rec, index) => (
									<li key={index} className="flex items-start gap-2">
										<span className="text-purple-600 mt-0.5">•</span>
										<span className="text-sm text-gray-700">{rec}</span>
									</li>
								))}
							</ul>
						</div>

						{/* Learning Paths */}
						<div>
							<h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
								<BookOpen className="w-4 h-4 text-purple-600" />
								Suggested Learning Paths
							</h4>
							<ul className="space-y-2">
								{elyaData.learningPathSuggestions
									.slice(0, 4)
									.map((path, index) => (
										<li key={index} className="flex items-start gap-2">
											<span className="text-purple-600 mt-0.5">→</span>
											<span className="text-sm text-gray-700">{path}</span>
										</li>
									))}
							</ul>
						</div>
					</div>

					<div className="mt-4 pt-4 border-t border-purple-200">
						<p className="text-sm text-gray-600">
							Based on analysis of {statistics.totalReflections}{" "}
							context-specific reflections
						</p>
					</div>
				</div>
			)}

			{/* Growth Trajectory (if available) */}
			{statistics.growthTrajectory &&
				statistics.growthTrajectory.length > 0 && (
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
							<TrendingUp className="w-5 h-5 text-sage-600" />
							Growth Trajectory
						</h3>
						<div className="h-64 flex items-center justify-center text-gray-500">
							<p>Growth chart visualization would go here</p>
						</div>
					</div>
				)}
		</div>
	);
};

// Metric Card Component
const MetricCard: React.FC<{
	label: string;
	value: number;
	color: string;
}> = ({ label, value, color }) => {
	const percentage = Math.round(value);
	const isHigh = percentage >= 80;
	const isMedium = percentage >= 60;

	return (
		<div className="bg-gray-50 rounded-lg p-4">
			<div className="text-sm text-gray-600 mb-2">{label}</div>
			<div className="flex items-center gap-2">
				<div className="text-2xl font-bold" style={{ color }}>
					{percentage}%
				</div>
				{isHigh ? (
					<ArrowUp className="w-4 h-4 text-green-600" />
				) : isMedium ? (
					<span className="w-4 h-4 text-yellow-600">→</span>
				) : (
					<ArrowDown className="w-4 h-4 text-red-600" />
				)}
			</div>
			<div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
				<div
					className="h-1.5 rounded-full transition-all"
					style={{
						width: `${percentage}%`,
						backgroundColor: color,
					}}
				/>
			</div>
		</div>
	);
};

// Format metric labels
function formatMetricLabel(metric: string): string {
	return metric
		.split(/(?=[A-Z])/)
		.join(" ")
		.replace(/_/g, " ")
		.replace(/\b\w/g, (l) => l.toUpperCase());
}

export default GrowthInsightsContext;
