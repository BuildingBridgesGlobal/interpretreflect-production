import type React from "react";
import { Brain } from "lucide-react";

import {
	ChatBubbleIcon,
	CommunityIcon,
	GrowthIcon,
	HeartPulseIcon,
	HourglassPersonIcon,
	NotepadIcon,
	SecureLockIcon,
	TargetIcon,
} from "../CustomIcon";

interface ReflectionTool {
	icon: React.ElementType;
	iconColor: string;
	iconBg: string;
	title: string;
	description: string;
	status: Array<{ label: string; color: string }>;
	trackingInfo?: string;
	onClick?: () => void;
}

interface ReflectionToolsProps {
	onToolSelect: (tool: string) => void;
}

export const ReflectionTools: React.FC<ReflectionToolsProps> = ({
	onToolSelect,
}) => {
	const reflectionCards: ReflectionTool[] = [
		{
			icon: NotepadIcon,
			iconColor: "#5C7F4F",
			iconBg: "rgba(45, 95, 63, 0.2)",
			title: "Pre-Assignment Prep",
			description: "Set yourself up for success before your next assignment. Prepare your mind, body, and spirit.",
			status: [
				{ label: "5 min", color: "text-gray-400" },
			],
			trackingInfo: "View confidence trends in Growth Insights → Confidence Levels",
		},
		{
			icon: TargetIcon,
			iconColor: "#5C7F4F",
			iconBg: "rgba(45, 95, 63, 0.2)",
			title: "Post-Assignment Debrief",
			description: "Process what happened, capture what you learned, and release the stress. Growth happens here.",
			status: [
				{ label: "10 min", color: "text-gray-400" },
			],
		},
		{
			icon: CommunityIcon,
			iconColor: "text-purple-400",
			iconBg: "bg-purple-500/20",
			title: "Teaming Prep",
			description: "Get ready to work with your interpreting partner. Align on logistics, roles, and communication.",
			status: [
				{ label: "5 min", color: "text-gray-400" },
			],
		},
		{
			icon: CommunityIcon,
			iconColor: "text-purple-400",
			iconBg: "bg-purple-500/20",
			title: "Teaming Reflection",
			description: "Reflect on how your team collaboration went. What worked? What would you do differently?",
			status: [
				{ label: "7 min", color: "text-gray-400" },
			],
		},
		{
			icon: GrowthIcon,
			iconColor: "text-purple-400",
			iconBg: "bg-purple-500/20",
			title: "Mentoring Prep",
			description: "Prepare to get the most from your mentoring session. Clarify what you need and what success looks like.",
			status: [
				{ label: "5 min", color: "text-gray-400" },
			],
		},
		{
			icon: GrowthIcon,
			iconColor: "text-purple-400",
			iconBg: "bg-purple-500/20",
			title: "Mentoring Reflection",
			description: "Capture insights from your mentoring session and plan your next steps forward.",
			status: [
				{ label: "5 min", color: "text-gray-400" },
			],
		},
		{
			icon: HeartPulseIcon,
			iconColor: "text-purple-400",
			iconBg: "bg-purple-500/20",
			title: "Wellness Check-in",
			description: "Check in with your emotional and physical wellbeing. How are you really doing today?",
			status: [
				{ label: "3 min", color: "text-gray-400" },
			],
			trackingInfo: "View stress & energy trends in Growth Insights",
		},
		{
			icon: HeartPulseIcon,
			iconColor: "text-pink-400",
			iconBg: "bg-pink-500/20",
			title: "Emotion Clarity Practice",
			description: "Build your emotional vocabulary to identify and regulate feelings with precision",
			status: [
				{ label: "3-5 min", color: "text-gray-400" },
			],
		},
		{
			icon: TargetIcon,
			iconColor: "text-red-400",
			iconBg: "bg-red-500/20",
			title: "Values Alignment Check-In",
			description: "After an ethically complex situation, reconnect with what matters most to you.",
			status: [
				{ label: "5 min", color: "text-gray-400" },
			],
		},
		{
			icon: HourglassPersonIcon,
			iconColor: "text-orange-400",
			iconBg: "bg-orange-500/20",
			title: "In-Session Self-Check",
			description: "Quick check-in during an active assignment. Monitor your energy and wellbeing in real-time.",
			status: [
				{ label: "1 min", color: "text-gray-400" },
			],
		},
		{
			icon: CommunityIcon,
			iconColor: "text-purple-400",
			iconBg: "bg-purple-500/20",
			title: "In-Session Team Sync",
			description: "Quick team coordination during an assignment. Stay aligned with your interpreting partner.",
			status: [
				{ label: "1 min", color: "text-gray-400" },
			],
		},
		{
			icon: SecureLockIcon,
			iconColor: "#5B9378",
			iconBg: "rgba(45, 95, 63, 0.2)",
			title: "Role-Space Reflection",
			description:
				"Clarify and honor your professional boundaries. What is (and isn't) your responsibility?",
			status: [
				{ label: "5 min", color: "text-gray-400" },
			],
		},
		{
			icon: ChatBubbleIcon,
			iconColor: "#5C7F4F",
			iconBg: "rgba(45, 95, 63, 0.2)",
			title: "Supporting Direct Communication",
			description:
				"Reflect on how you facilitated direct communication between consumers. Keep the focus where it belongs.",
			status: [
				{ label: "5 min", color: "text-gray-400" },
			],
		},
		{
			icon: HeartPulseIcon,
			iconColor: "text-orange-600",
			iconBg: "bg-orange-500/20",
			title: "BIPOC Interpreter Wellness",
			description:
				"A space to center your experience as a Black, Indigenous, or Person of Color interpreter. Your story matters.",
			status: [
				{ label: "7 min", color: "text-gray-400" },
			],
		},
		{
			icon: CommunityIcon,
			iconColor: "text-purple-400",
			iconBg: "bg-purple-500/20",
			title: "Deaf Interpreter Professional Identity",
			description:
				"For Deaf Interpreters: Navigate teaming dynamics, audism, and professional recognition.",
			status: [
				{ label: "7 min", color: "text-gray-400" },
			],
		},
		{
			icon: Brain,
			iconColor: "#5C7F4F",
			iconBg: "rgba(45, 95, 63, 0.2)",
			title: "Neurodivergent Interpreter Wellness",
			description:
				"For neurodivergent interpreters: Honor your unique strengths and navigate challenges with self-compassion.",
			status: [
				{ label: "7 min", color: "text-gray-400" },
			],
		},
	];

	const handleToolClick = (toolTitle: string) => {
		// Map tool titles to view names
		const toolMap: Record<string, string> = {
			"Pre-Assignment Prep": "pre-assignment",
			"Post-Assignment Debrief": "post-assignment",
			"Teaming Prep": "teaming-prep",
			"Teaming Reflection": "teaming-reflection",
			"Mentoring Prep": "mentoring-prep",
			"Mentoring Reflection": "mentoring-reflection",
			"Wellness Check-in": "wellness",
			"Emotion Clarity Practice": "emotion-clarity",
			"Values Alignment Check-In": "ethics-meaning",
			"In-Session Self-Check": "in-session-self",
			"In-Session Team Sync": "in-session-team",
			"Role-Space Reflection": "role-space",
			"Supporting Direct Communication": "direct-communication",
			"BIPOC Interpreter Wellness": "bipoc-wellness",
			"Deaf Interpreter Professional Identity": "deaf-interpreter",
			"Neurodivergent Interpreter Wellness": "neurodivergent-interpreter",
		};

		const viewName = toolMap[toolTitle];
		if (viewName) {
			onToolSelect(viewName);
		}
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{reflectionCards.map((card, index) => (
				<div
					key={index}
					className="rounded-2xl p-6 cursor-pointer transition-all hover:shadow-clean-md hover:-translate-y-0.5 shadow-clean"
					style={{
						backgroundColor: "var(--color-card)",
						border: "1px solid var(--color-slate-200)",
					}}
					onClick={() => handleToolClick(card.title)}
				>
					<div className="flex items-start justify-between mb-4">
						<div>
							<card.icon size={56} />
						</div>
						<span className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{
							backgroundColor: "var(--color-green-50)",
							color: "var(--color-green-600)",
							border: "1px solid var(--color-green-300)"
						}}>
							Ready
						</span>
					</div>

					<h3 className="font-bold text-lg mb-2" style={{
						color: "var(--color-slate-700)"
					}}>
						{card.title}
					</h3>

					<p className="text-sm mb-3" style={{
						color: "var(--color-slate-600)"
					}}>
						{card.description}
					</p>

					{/* Tracking Info */}
					{card.trackingInfo && (
						<div
							className="mb-4 px-3 py-2 rounded-lg text-xs leading-relaxed"
							style={{
								backgroundColor: "rgba(92, 127, 79, 0.08)",
								border: "1px solid rgba(92, 127, 79, 0.2)",
								color: "#3A3A3A"
							}}
						>
							📊 {card.trackingInfo}
						</div>
					)}

					<div className="flex flex-wrap gap-2">
						{card.status.map((statusItem, statusIndex) => (
							<span
								key={statusIndex}
								className="text-xs px-2 py-1 rounded-full"
								style={{
									backgroundColor: "rgba(45, 95, 63, 0.15)",
									color: "#5C7F4F"
								}}
							>
								{statusItem.label}
							</span>
						))}
					</div>
				</div>
			))}
		</div>
	);
};

