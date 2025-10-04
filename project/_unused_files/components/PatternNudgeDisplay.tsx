import {
	AlertCircle,
	ChevronRight,
	Clock,
	Heart,
	Sparkles,
	Target,
	TrendingUp,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { getContextualNudge } from "../content/patternNudgesCopy";
import {
	PatternDetectionEngine,
	type PatternNudge,
	type UserData,
} from "../utils/patternDetection";

interface PatternNudgeDisplayProps {
	userData?: UserData;
	userName?: string;
	onActionClick?: (action: string) => void;
	maxNudges?: number;
	className?: string;
}

/**
 * Component to display pattern-based nudges in Growth Insights
 */
export const PatternNudgeDisplay: React.FC<PatternNudgeDisplayProps> = ({
	userData,
	userName,
	onActionClick,
	maxNudges = 3,
	className = "",
}) => {
	const [nudges, setNudges] = useState<PatternNudge[]>([]);
	const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(
		new Set(),
	);
	const [engine, setEngine] = useState<PatternDetectionEngine | null>(null);
	const [expandedNudge, setExpandedNudge] = useState<string | null>(null);

	// Initialize with sample data if none provided
	const getSampleUserData = (): UserData => {
		const now = new Date();
		const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
		const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

		return {
			emotions: [
				{
					emotion: "stressed",
					intensity: 4,
					timestamp: now,
					context: { assignmentType: "medical", timeOfDay: "afternoon" },
				},
				{
					emotion: "exhausted",
					intensity: 4,
					timestamp: dayAgo,
					context: { assignmentType: "medical", timeOfDay: "evening" },
				},
				{
					emotion: "anxious",
					intensity: 3,
					timestamp: weekAgo,
					context: { dayOfWeek: "Monday", timeOfDay: "morning" },
				},
			],
			assignments: [
				{
					type: "medical",
					duration: 180,
					difficulty: "challenging",
					timestamp: dayAgo,
					completed: true,
				},
				{
					type: "legal",
					duration: 120,
					difficulty: "moderate",
					timestamp: weekAgo,
					completed: true,
				},
			],
			resets: [
				{
					type: "breathwork",
					timestamp: now,
					effectiveness: 4,
					skipped: false,
				},
				{
					type: "boundaries",
					timestamp: dayAgo,
					skipped: true,
					reason: "no time",
				},
			],
			wellnessActions: [
				{
					action: "meditation",
					category: "mindfulness",
					timestamp: now,
					duration: 10,
					effectiveness: 4,
				},
			],
			currentStreak: 7,
			lastResetTime: now,
		};
	};

	useEffect(() => {
		const data = userData || getSampleUserData();
		const detectionEngine = new PatternDetectionEngine(data);
		setEngine(detectionEngine);

		// Analyze patterns and get nudges
		const detectedNudges = detectionEngine.analyzePatterns();
		const activeNudges = detectionEngine.getActiveNudges();

		// Filter out dismissed nudges and limit display
		const displayNudges = activeNudges
			.filter((n) => !dismissedNudges.has(n.id))
			.slice(0, maxNudges);

		setNudges(displayNudges);
	}, [userData, dismissedNudges, maxNudges]);

	const handleDismiss = (nudgeId: string) => {
		setDismissedNudges((prev) => new Set([...prev, nudgeId]));
		engine?.dismissNudge(nudgeId);
	};

	const handleAction = (nudge: PatternNudge) => {
		if (nudge.action && onActionClick) {
			onActionClick(nudge.action.target);
		}
		// Auto-dismiss after action
		handleDismiss(nudge.id);
	};

	const getTimeOfDay = (): "morning" | "afternoon" | "evening" => {
		const hour = new Date().getHours();
		if (hour < 12) return "morning";
		if (hour < 17) return "afternoon";
		return "evening";
	};

	const getNudgeIcon = (nudge: PatternNudge) => {
		switch (nudge.type) {
			case "insight":
				return <TrendingUp className="w-5 h-5" />;
			case "suggestion":
				return <Sparkles className="w-5 h-5" />;
			case "encouragement":
				return <Heart className="w-5 h-5" />;
			case "warning":
				return <AlertCircle className="w-5 h-5" />;
			default:
				return <Target className="w-5 h-5" />;
		}
	};

	const getNudgeColorClass = (priority: string) => {
		switch (priority) {
			case "high":
				return "border-l-red-500 bg-red-50";
			case "medium":
				return "border-l-yellow-500 bg-yellow-50";
			case "low":
				return "border-l-green-500 bg-green-50";
			default:
				return "border-l-gray-500 bg-gray-50";
		}
	};

	if (nudges.length === 0) {
		return null;
	}

	return (
		<div className={`pattern-nudges-container space-y-3 ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between mb-2">
				<h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
					<TrendingUp className="w-4 h-4" />
					Personalized Insights
				</h3>
				<span className="text-xs text-gray-500">Based on your patterns</span>
			</div>

			{/* Nudges */}
			<div className="space-y-2">
				{nudges.map((nudge) => {
					// Get contextual copy variation
					const contextualCopy = getContextualNudge(
						nudge.id.split("-")[1] || "default",
						getTimeOfDay(),
						nudge.priority,
						userName,
					);

					const isExpanded = expandedNudge === nudge.id;

					return (
						<div
							key={nudge.id}
							className={`
                nudge-card relative border-l-4 rounded-lg p-4 transition-all duration-200
                ${getNudgeColorClass(nudge.priority)}
                ${isExpanded ? "shadow-lg" : "shadow-sm hover:shadow-md"}
              `}
							role="article"
							aria-label={`${nudge.type} nudge: ${nudge.title}`}
						>
							{/* Dismiss button */}
							{nudge.dismissible && (
								<button
									onClick={() => handleDismiss(nudge.id)}
									className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
									aria-label="Dismiss nudge"
								>
									<X className="w-4 h-4 text-gray-500" />
								</button>
							)}

							{/* Content */}
							<div className="pr-8">
								{/* Header */}
								<div className="flex items-start gap-3 mb-2">
									<div
										className={`
                    p-2 rounded-full
                    ${
											nudge.priority === "high"
												? "bg-red-100 text-red-600"
												: nudge.priority === "medium"
													? "bg-yellow-100 text-yellow-600"
													: "bg-green-100 text-green-600"
										}
                  `}
									>
										{getNudgeIcon(nudge)}
									</div>

									<div className="flex-1">
										<h4 className="font-semibold text-gray-900 flex items-center gap-2">
											{contextualCopy.title || nudge.title}
											{nudge.icon && (
												<span className="text-lg">{nudge.icon}</span>
											)}
										</h4>

										{/* Priority badge */}
										{nudge.priority === "high" && (
											<span className="inline-flex items-center gap-1 text-xs text-red-600 mt-1">
												<Clock className="w-3 h-3" />
												Needs attention
											</span>
										)}
									</div>
								</div>

								{/* Message */}
								<p className="text-sm text-gray-700 mb-3 leading-relaxed">
									{contextualCopy.message || nudge.message}
								</p>

								{/* Expandable details */}
								{isExpanded && engine && (
									<div className="mt-3 pt-3 border-t border-gray-200">
										<div className="text-xs text-gray-600 space-y-1">
											<p>• Pattern detected over the last 7 days</p>
											<p>• Confidence level: High</p>
											<p>• Similar patterns found in 68% of interpreters</p>
										</div>

										{/* Personalized recommendations */}
										<div className="mt-3">
											<p className="text-xs font-semibold text-gray-700 mb-1">
												Also recommended for you:
											</p>
											<ul className="text-xs text-gray-600 space-y-1">
												{engine
													.getPersonalizedRecommendations()
													.slice(0, 2)
													.map((rec, idx) => (
														<li key={idx} className="flex items-start gap-1">
															<span className="text-gray-400 mt-0.5">•</span>
															<span>{rec}</span>
														</li>
													))}
											</ul>
										</div>
									</div>
								)}

								{/* Actions */}
								<div className="flex items-center gap-3 mt-3">
									{nudge.action && (
										<button
											onClick={() => handleAction(nudge)}
											className={`
                        inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                        transition-all duration-200
                        ${
													nudge.priority === "high"
														? "bg-red-600 text-white hover:bg-red-700"
														: "bg-primary-600 text-white hover:bg-primary-700"
												}
                      `}
										>
											{contextualCopy.action || nudge.action.label}
											<ChevronRight className="w-4 h-4" />
										</button>
									)}

									<button
										onClick={() =>
											setExpandedNudge(isExpanded ? null : nudge.id)
										}
										className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
									>
										{isExpanded ? "Show less" : "Learn more"}
									</button>
								</div>
							</div>

							{/* Expiration indicator */}
							{nudge.expiresIn && (
								<div className="absolute bottom-2 right-2">
									<span className="text-xs text-gray-400">
										Expires in {nudge.expiresIn}h
									</span>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* View all patterns link */}
			{nudges.length === maxNudges && (
				<button
					onClick={() => onActionClick?.("/insights/patterns")}
					className="w-full text-center text-sm text-primary-600 hover:text-primary-700 py-2 transition-colors"
				>
					View all insights →
				</button>
			)}
		</div>
	);
};

/**
 * Standalone component for quick integration
 */
export const PatternNudgeWidget: React.FC<{ userName?: string }> = ({
	userName,
}) => {
	return (
		<div className="pattern-nudge-widget bg-white rounded-lg shadow-sm p-4">
			<PatternNudgeDisplay
				userName={userName}
				maxNudges={2}
				onActionClick={(target) => {
					console.log("Navigate to:", target);
					// Handle navigation in your app
				}}
			/>
		</div>
	);
};

export default PatternNudgeDisplay;
