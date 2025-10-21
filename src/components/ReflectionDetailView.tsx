import { Calendar, X, Lightbulb, Heart, Brain, Sparkles } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { getDisplayName } from "../config/reflectionTypes";

interface ReflectionDetailViewProps {
	reflection: {
		id: string;
		type: string;
		data: any;
		timestamp: string;
	};
	onClose: () => void;
}

export const ReflectionDetailView: React.FC<ReflectionDetailViewProps> = ({
	reflection,
	onClose,
}) => {
	const [activeTab, setActiveTab] = useState<"entry" | "analysis">("entry");

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			if (isNaN(date.getTime())) {
				return "Date not available";
			}
			const options: Intl.DateTimeFormatOptions = {
				weekday: "long",
				month: "long",
				day: "numeric",
				year: "numeric",
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			};
			return date.toLocaleDateString("en-US", options);
		} catch (error) {
			return "Date not available";
		}
	};

	const getReflectionTitle = (type: string, data?: any): string => {
		return getDisplayName(type, data);
	};

	// Extract main content fields (the user's actual reflections)
	const getMainContent = () => {
		const data = reflection.data || {};
		const contentFields: { label: string; value: string }[] = [];

		// Common content field patterns - comprehensive list
		const contentPatterns = [
			// General
			'notes', 'reflection', 'thoughts', 'summary', 'description',
			// Pre-Assignment
			'context_background', 'materials_review', 'readiness_levels', 'anticipated_demands',
			'control_strategies', 'backup_plans', 'role_space', 'neuroscience_practices',
			'triggers_vulnerabilities', 'ethics_culture', 'growth_goals', 'intention_statement',
			// Post-Assignment
			'session_overview', 'original_goals', 'key_insights', 'challenges_encountered',
			'helpful_approaches', 'next_steps', 'appreciation',
			'most_unexpected', 'assignment_unfolded', 'strategies_used',
			'body_experience', 'unexpected_challenges', 'real_time_adaptations',
			'skills_strengthened', 'recovery_practices', 'celebration_acknowledgment',
			'cognitive_load_management', 'technical_aspects', 'environmental_factors',
			'flow_struggle_moments', 'stress_management', 'problem_solving_moment',
			'support_needed', 'new_capabilities', 'approach_changes', 'feedback_received',
			'pattern_recognition', 'completion_needs', 'unresolved_concerns', 'future_boundaries',
			// Mentoring
			'mentoring_goals', 'mentorship_type', 'relationship_stage', 'goals_achievement',
			'unexpected_outcomes', 'skills_developed', 'knowledge_gaps_addressed',
			'communication_effectiveness', 'relationship_dynamics', 'how_challenges_handled',
			'personal_growth_areas', 'less_effective_strategies', 'mentor_impact',
			'continued_learning', 'relationship_evolution',
			// Teaming
			'team_context', 'team_dynamics', 'expectations_accuracy', 'handoff_signal_practice',
			'stress_handling_actual', 'physical_aspects', 'team_function_actual',
			'role_evolution', 'communication_patterns', 'exceptional_moment',
			'transition_management', 'significant_challenge', 'issue_resolution',
			'collaboration_solutions', 'environmental_solutions', 'do_differently',
			'learned_about_self', 'collaboration_insights', 'approach_changed',
			'handoff_techniques', 'advice_for_others', 'then_thought_now_know',
			'then_worried_now_understand', 'then_planned_actually_worked',
			'confidence_change', 'rating_explanation', 'three_strategies'
		];

		contentPatterns.forEach(pattern => {
			if (data[pattern] && typeof data[pattern] === 'string' && data[pattern].trim()) {
				contentFields.push({
					label: formatFieldName(pattern),
					value: data[pattern]
				});
			}
		});

		// If no content found in predefined patterns, look for ANY string fields
		if (contentFields.length === 0) {
			Object.entries(data).forEach(([key, value]) => {
				// Skip system fields, ratings, and session IDs
				const skipFields = ['id', 'user_id', 'created_at', 'updated_at', 'timestamp', 'reflection_id', 'metadata', 'status', 'completed_at', 'time_spent_seconds'];
				const isSystemField = skipFields.includes(key) || key.startsWith('_');
				const isRating = key.includes('rating') || key.includes('level') && typeof value === 'number';
				const isSessionId = typeof value === 'string' && /^session_\d+_\w+$/.test(value);

				if (!isSystemField && !isRating && !isSessionId && typeof value === 'string' && value.trim()) {
					contentFields.push({
						label: formatFieldName(key),
						value: value
					});
				}
			});
		}

		return contentFields;
	};

	// Extract feelings/emotions
	const getFeelings = () => {
		const data = reflection.data || {};
		const feelings: string[] = [];

		if (data.emotions_during && Array.isArray(data.emotions_during)) {
			return data.emotions_during;
		}
		if (data.current_feeling) feelings.push(data.current_feeling);
		if (data.feeling_word) feelings.push(data.feeling_word);
		if (data.emotional_state) feelings.push(data.emotional_state);

		return feelings;
	};

	// Extract key insight
	const getKeyInsight = () => {
		const data = reflection.data || {};

		// Look for insight-related fields
		if (data.key_insights) return data.key_insights;
		if (data.key_insight) return data.key_insight;
		if (data.immediate_insight) return data.immediate_insight;
		if (data.pattern_recognition) return data.pattern_recognition;
		if (data.learned_about_self) return data.learned_about_self;

		return null;
	};

	const formatFieldName = (fieldName: string): string => {
		return fieldName
			.replace(/_/g, " ")
			.replace(/([A-Z])/g, " $1")
			.trim()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(" ");
	};

	const mainContent = getMainContent();
	const feelings = getFeelings();
	const keyInsight = getKeyInsight();

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div
				className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
				style={{ backgroundColor: "#FFFFFF" }}
			>
				{/* Header */}
				<div className="p-6 border-b border-gray-200">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<h2 className="text-2xl font-bold text-gray-900 mb-2">
								{getReflectionTitle(reflection.type, reflection.data)}
							</h2>
							<div className="flex items-center gap-2 text-sm text-gray-600">
								<Calendar className="w-4 h-4" />
								<span>{formatDate(reflection.timestamp)}</span>
							</div>
						</div>
						<button
							onClick={onClose}
							className="p-2 rounded-lg transition-all hover:opacity-90"
							style={{
								backgroundColor: "#5C7F4F",
								color: "#FFFFFF",
							}}
							title="Close"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Tabs */}
					<div className="flex gap-2 mt-6 border-b border-gray-200">
						<button
							onClick={() => setActiveTab("entry")}
							className="pb-3 px-4 font-semibold transition-all relative rounded-t-lg"
							style={{
								color: activeTab === "entry" ? "#1A1A1A" : "#6B7280",
								backgroundColor: activeTab === "entry" ? "#F0F5ED" : "transparent"
							}}
						>
							Entry
							{activeTab === "entry" && (
								<div
									className="absolute bottom-0 left-0 right-0 h-1"
									style={{ backgroundColor: "#5B9378" }}
								/>
							)}
						</button>
						<button
							onClick={() => setActiveTab("analysis")}
							className="pb-3 px-4 font-semibold transition-all relative rounded-t-lg"
							style={{
								color: activeTab === "analysis" ? "#1A1A1A" : "#6B7280",
								backgroundColor: activeTab === "analysis" ? "#F0F5ED" : "transparent"
							}}
						>
							Analysis
							{activeTab === "analysis" && (
								<div
									className="absolute bottom-0 left-0 right-0 h-1"
									style={{ backgroundColor: "#5B9378" }}
								/>
							)}
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					{activeTab === "entry" && (
						<div className="space-y-6">
							{mainContent.length === 0 ? (
								<div className="text-center py-12">
									<Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
									<p className="text-gray-500">No reflection content to display</p>
								</div>
							) : (
								mainContent.map((field, index) => (
									<div key={index}>
										<h3 className="text-base font-bold text-gray-900 mb-3">
											{field.label}
										</h3>
										<p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
											{field.value}
										</p>
									</div>
								))
							)}
						</div>
					)}

					{activeTab === "analysis" && (
						<div className="space-y-6">
							{/* Key Insight */}
							{keyInsight && (
								<div
									className="rounded-lg p-5 border"
									style={{
										backgroundColor: "#FFF9F0",
										borderColor: "#F0E5D8",
									}}
								>
									<div className="flex items-start gap-3">
										<div
											className="p-2 rounded-lg"
											style={{ backgroundColor: "#FFF3E0" }}
										>
											<Lightbulb className="w-5 h-5" style={{ color: "#F59E0B" }} />
										</div>
										<div className="flex-1">
											<h3 className="text-sm font-semibold text-gray-700 mb-2">
												💡 Key Insight
											</h3>
											<p className="text-gray-900 leading-relaxed">
												{keyInsight}
											</p>
										</div>
									</div>
								</div>
							)}

							{/* Feelings */}
							{feelings.length > 0 && (
								<div>
									<h3 className="text-sm font-semibold text-gray-700 mb-3">
										Feelings
									</h3>
									<div className="flex flex-wrap gap-3">
										{feelings.map((feeling, index) => (
											<div
												key={index}
												className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
												style={{
													backgroundColor: "#F0F5ED",
													color: "#5C7F4F",
												}}
											>
												<Heart className="w-4 h-4" />
												{feeling}
											</div>
										))}
									</div>
								</div>
							)}

							{/* Reflection Summary */}
							<div>
								<h3 className="text-sm font-semibold text-gray-700 mb-3">
									Reflection Summary
								</h3>
								<div
									className="rounded-lg p-5 border"
									style={{
										backgroundColor: "#F8FBF6",
										borderColor: "#E5E7E0",
									}}
								>
									<div className="flex items-start gap-3">
										<Brain className="w-5 h-5 mt-0.5" style={{ color: "#5B9378" }} />
										<div className="flex-1 space-y-3">
											{mainContent.length > 0 ? (
												<p className="text-gray-700 leading-relaxed">
													This {getReflectionTitle(reflection.type, reflection.data).toLowerCase()} captures important insights about your professional development and emotional wellbeing.
													{feelings.length > 0 && (
														<> You experienced {feelings.length === 1 ? 'a sense of' : 'feelings of'} {feelings.slice(0, 2).join(' and ')} during this reflection.</>
													)}
												</p>
											) : (
												<p className="text-gray-500">
													No detailed analysis available for this reflection.
												</p>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Growth Note */}
							{mainContent.length > 0 && (
								<div
									className="rounded-lg p-4 text-sm"
									style={{
										backgroundColor: "#E8F5E9",
										color: "#2E7D32",
									}}
								>
									<p className="flex items-center gap-2">
										<Sparkles className="w-4 h-4" />
										<span className="font-medium">
											Taking time to reflect helps you recognize patterns and grow professionally.
										</span>
									</p>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
