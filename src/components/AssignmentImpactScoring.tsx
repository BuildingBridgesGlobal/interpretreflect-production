import {
	AlertTriangle,
	Brain,
	Check,
	ChevronLeft,
	ChevronRight,
	Heart,
	MessageSquare,
	RefreshCw,
	Save,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

interface AssignmentImpactScoringProps {
	assignmentId?: string;
	assignmentType?: string;
	onComplete?: (scores: ImpactScores) => void;
	onClose?: () => void;
	embedded?: boolean; // If true, renders inline without modal wrapper
}

interface ImpactScores {
	emotionalImpact: number;
	cognitiveLoad: number;
	optionalNote?: string;
	assignmentId?: string;
	timestamp: string;
}

interface HistoricalData {
	avgEmotionalImpact: number;
	avgCognitiveLoad: number;
	totalSessions: number;
	lastSession?: ImpactScores;
}

export const AssignmentImpactScoring: React.FC<AssignmentImpactScoringProps> = ({
	assignmentId,
	assignmentType = "general",
	onComplete,
	onClose,
	embedded = false,
}) => {
	const { user } = useAuth();
	const [emotionalImpact, setEmotionalImpact] = useState(5);
	const [cognitiveLoad, setCognitiveLoad] = useState(5);
	const [optionalNote, setOptionalNote] = useState("");
	const [saving, setSaving] = useState(false);
	const [historical, setHistorical] = useState<HistoricalData | null>(null);
	const [showTips, setShowTips] = useState(false);
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (user) {
			loadHistoricalData();
		}
	}, [user]);

	const loadHistoricalData = async () => {
		if (!user) return;

		try {
			// Get user's historical AIS data
			const { data, error } = await supabase
				.from("assignment_impact_scores")
				.select("emotional_impact, cognitive_load, created_at")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false })
				.limit(10);

			if (!error && data && data.length > 0) {
				const avgEmotional = data.reduce((sum, d) => sum + d.emotional_impact, 0) / data.length;
				const avgCognitive = data.reduce((sum, d) => sum + d.cognitive_load, 0) / data.length;

				setHistorical({
					avgEmotionalImpact: Math.round(avgEmotional * 10) / 10,
					avgCognitiveLoad: Math.round(avgCognitive * 10) / 10,
					totalSessions: data.length,
					lastSession: data[0] ? {
						emotionalImpact: data[0].emotional_impact,
						cognitiveLoad: data[0].cognitive_load,
						timestamp: data[0].created_at
					} : undefined
				});
			}
		} catch (error) {
			console.error("Error loading historical data:", error);
		}
	};

	const handleSave = async () => {
		if (!user) {
			setMessage("Please sign in to save impact scores");
			return;
		}

		setSaving(true);
		setMessage("");

		const scores: ImpactScores = {
			emotionalImpact,
			cognitiveLoad,
			optionalNote: optionalNote.trim() || undefined,
			assignmentId,
			timestamp: new Date().toISOString(),
		};

		try {
			// Save to database
			const { error } = await supabase.from("assignment_impact_scores").insert({
				user_id: user.id,
				assignment_id: assignmentId,
				assignment_type: assignmentType,
				emotional_impact: emotionalImpact,
				cognitive_load: cognitiveLoad,
				notes: optionalNote.trim() || null,
				created_at: scores.timestamp,
			});

			if (error) throw error;

			// Trigger recovery recommendations if high impact
			if (emotionalImpact > 7 || cognitiveLoad > 7) {
				await triggerRecoveryRecommendations(emotionalImpact, cognitiveLoad);
			}

			setMessage("Impact scores saved successfully!");
			onComplete?.(scores);

			// Reset after short delay
			setTimeout(() => {
				setEmotionalImpact(5);
				setCognitiveLoad(5);
				setOptionalNote("");
			}, 1500);

		} catch (error) {
			console.error("Error saving impact scores:", error);
			setMessage("Failed to save scores. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	const triggerRecoveryRecommendations = async (emotional: number, cognitive: number) => {
		// This could trigger notifications or add recovery tasks
		const recommendations = [];

		if (emotional > 8) {
			recommendations.push("emotional_debrief");
		}
		if (cognitive > 8) {
			recommendations.push("cognitive_rest");
		}
		if (emotional > 7 && cognitive > 7) {
			recommendations.push("extended_break");
		}

		// Store recommendations for later display
		if (recommendations.length > 0) {
			await supabase.from("recovery_recommendations").insert({
				user_id: user?.id,
				recommendations,
				triggered_by: "high_impact_scores",
				created_at: new Date().toISOString(),
			});
		}
	};

	const getImpactColor = (value: number) => {
		if (value <= 3) return "#10B981"; // Green
		if (value <= 6) return "#F59E0B"; // Yellow
		if (value <= 8) return "#EF4444"; // Red
		return "#991B1B"; // Dark Red
	};

	const getImpactLabel = (value: number, type: "emotional" | "cognitive") => {
		const labels = {
			emotional: [
				"Minimal Impact",
				"Low Impact",
				"Moderate Impact",
				"High Impact",
				"Severe Impact"
			],
			cognitive: [
				"Very Easy",
				"Easy",
				"Moderate",
				"Challenging",
				"Overwhelming"
			]
		};

		const index = value <= 2 ? 0 : value <= 4 ? 1 : value <= 6 ? 2 : value <= 8 ? 3 : 4;
		return labels[type][index];
	};

	const getRecoveryTime = (emotional: number, cognitive: number) => {
		const totalImpact = (emotional + cognitive) / 2;
		if (totalImpact <= 3) return "5-10 minutes";
		if (totalImpact <= 5) return "15-30 minutes";
		if (totalImpact <= 7) return "30-60 minutes";
		if (totalImpact <= 9) return "2-4 hours";
		return "Rest of day";
	};

	const content = (
		<div className={embedded ? "" : "bg-white rounded-xl shadow-lg p-6"}>
			{/* Header */}
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
					<Brain className="w-6 h-6 text-purple-600" />
					Assignment Impact Scoring
				</h2>
				<p className="text-sm text-gray-600 mt-1">
					Rate the impact of your recent assignment
				</p>
			</div>

			{/* Historical Context */}
			{historical && historical.totalSessions > 0 && (
				<div className="mb-6 p-4 bg-blue-50 rounded-lg">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-blue-900">Your Averages</p>
							<p className="text-xs text-blue-700 mt-1">
								Based on {historical.totalSessions} previous sessions
							</p>
						</div>
						<div className="flex gap-4 text-sm">
							<div>
								<span className="text-blue-600">Emotional:</span>
								<span className="font-semibold ml-1">{historical.avgEmotionalImpact}</span>
							</div>
							<div>
								<span className="text-blue-600">Cognitive:</span>
								<span className="font-semibold ml-1">{historical.avgCognitiveLoad}</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Emotional Impact Slider */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-3">
					<label className="font-semibold text-gray-900 flex items-center gap-2">
						<Heart className="w-5 h-5 text-red-500" />
						Emotional Impact
					</label>
					<div className="flex items-center gap-2">
						<span
							className="text-2xl font-bold"
							style={{ color: getImpactColor(emotionalImpact) }}
						>
							{emotionalImpact}
						</span>
						<span className="text-sm text-gray-600">/10</span>
					</div>
				</div>

				<input
					type="range"
					min="1"
					max="10"
					step="1"
					value={emotionalImpact}
					onChange={(e) => setEmotionalImpact(Number(e.target.value))}
					className="w-full h-3 rounded-lg appearance-none cursor-pointer"
					style={{
						background: `linear-gradient(to right,
							#10B981 0%,
							#F59E0B 40%,
							#EF4444 70%,
							#991B1B 100%)`,
					}}
				/>

				<div className="flex justify-between mt-2">
					<span className="text-xs text-gray-500">Low</span>
					<span className="text-sm font-medium text-gray-700">
						{getImpactLabel(emotionalImpact, "emotional")}
					</span>
					<span className="text-xs text-gray-500">High</span>
				</div>
			</div>

			{/* Cognitive Load Slider */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-3">
					<label className="font-semibold text-gray-900 flex items-center gap-2">
						<Brain className="w-5 h-5 text-purple-500" />
						Cognitive Load
					</label>
					<div className="flex items-center gap-2">
						<span
							className="text-2xl font-bold"
							style={{ color: getImpactColor(cognitiveLoad) }}
						>
							{cognitiveLoad}
						</span>
						<span className="text-sm text-gray-600">/10</span>
					</div>
				</div>

				<input
					type="range"
					min="1"
					max="10"
					step="1"
					value={cognitiveLoad}
					onChange={(e) => setCognitiveLoad(Number(e.target.value))}
					className="w-full h-3 rounded-lg appearance-none cursor-pointer"
					style={{
						background: `linear-gradient(to right,
							#10B981 0%,
							#F59E0B 40%,
							#EF4444 70%,
							#991B1B 100%)`,
					}}
				/>

				<div className="flex justify-between mt-2">
					<span className="text-xs text-gray-500">Easy</span>
					<span className="text-sm font-medium text-gray-700">
						{getImpactLabel(cognitiveLoad, "cognitive")}
					</span>
					<span className="text-xs text-gray-500">Complex</span>
				</div>
			</div>

			{/* Recovery Estimate */}
			<div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-gray-900">
							Recommended Recovery Time
						</p>
						<p className="text-xs text-gray-600 mt-1">
							Based on your impact scores
						</p>
					</div>
					<div className="text-right">
						<p className="text-lg font-bold text-gray-900">
							{getRecoveryTime(emotionalImpact, cognitiveLoad)}
						</p>
						{(emotionalImpact > 7 || cognitiveLoad > 7) && (
							<p className="text-xs text-orange-600 mt-1 flex items-center justify-end gap-1">
								<AlertTriangle className="w-3 h-3" />
								High impact detected
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Optional Note */}
			<div className="mb-6">
				<label className="block text-sm font-medium text-gray-700 mb-2">
					<MessageSquare className="w-4 h-4 inline mr-1" />
					Optional Note
				</label>
				<textarea
					value={optionalNote}
					onChange={(e) => setOptionalNote(e.target.value)}
					placeholder="Any specific challenges or observations..."
					className="w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					rows={3}
					maxLength={500}
				/>
				<p className="text-xs text-gray-500 mt-1">
					{optionalNote.length}/500 characters
				</p>
			</div>

			{/* Tips Toggle */}
			<button
				onClick={() => setShowTips(!showTips)}
				className="mb-4 text-sm text-blue-600 hover:text-blue-700"
			>
				{showTips ? "Hide" : "Show"} scoring tips
			</button>

			{showTips && (
				<div className="mb-6 p-4 bg-yellow-50 rounded-lg text-sm">
					<p className="font-medium text-yellow-900 mb-2">Scoring Guide:</p>
					<ul className="space-y-1 text-yellow-800">
						<li>• <strong>1-3:</strong> Routine, minimal effort/emotion</li>
						<li>• <strong>4-6:</strong> Moderate challenge, manageable</li>
						<li>• <strong>7-8:</strong> Significant impact, need recovery</li>
						<li>• <strong>9-10:</strong> Extreme impact, immediate support needed</li>
					</ul>
				</div>
			)}

			{/* Status Message */}
			{message && (
				<div className={`mb-4 p-3 rounded-lg text-sm ${
					message.includes("success")
						? "bg-green-100 text-green-800"
						: "bg-red-100 text-red-800"
				}`}>
					{message}
				</div>
			)}

			{/* Action Buttons */}
			<div className="flex justify-between">
				{onClose && !embedded && (
					<button
						onClick={onClose}
						className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
					>
						Skip
					</button>
				)}
				<button
					onClick={handleSave}
					disabled={saving}
					className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
				>
					<Save className="w-4 h-4" />
					{saving ? "Saving..." : "Save Impact Scores"}
				</button>
			</div>

			{/* Quick Actions for High Impact */}
			{(emotionalImpact > 7 || cognitiveLoad > 7) && (
				<div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
					<p className="text-sm font-medium text-orange-900 mb-3">
						Quick Recovery Actions:
					</p>
					<div className="grid grid-cols-2 gap-2">
						{emotionalImpact > 7 && (
							<button className="p-2 text-xs bg-white border border-orange-300 rounded-lg hover:bg-orange-100">
								<Heart className="w-4 h-4 inline mr-1" />
								Emotional Debrief
							</button>
						)}
						{cognitiveLoad > 7 && (
							<button className="p-2 text-xs bg-white border border-orange-300 rounded-lg hover:bg-orange-100">
								<Brain className="w-4 h-4 inline mr-1" />
								Cognitive Rest
							</button>
						)}
						<button className="p-2 text-xs bg-white border border-orange-300 rounded-lg hover:bg-orange-100">
							<RefreshCw className="w-4 h-4 inline mr-1" />
							Breathing Exercise
						</button>
						<button className="p-2 text-xs bg-white border border-orange-300 rounded-lg hover:bg-orange-100">
							<Check className="w-4 h-4 inline mr-1" />
							Mark Break Taken
						</button>
					</div>
				</div>
			)}
		</div>
	);

	// Return content directly if embedded, otherwise wrap in modal
	if (embedded) {
		return content;
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				{content}
			</div>
		</div>
	);
};