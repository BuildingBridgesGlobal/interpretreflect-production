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
			description: "Prime attention, steady the nervous system, and set...",
			status: [
				{ label: "Prepare Well", color: "text-gray-400" },
				{ label: "Ready to start", color: "text-gray-400" },
			],
		},
		{
			icon: TargetIcon,
			iconColor: "#5C7F4F",
			iconBg: "rgba(45, 95, 63, 0.2)",
			title: "Post-Assignment Debrief",
			description: "Consolidate learning, de-load stress, and turn...",
			status: [
				{ label: "Reflect & Grow", color: "text-gray-400" },
				{ label: "Ready to start", color: "text-gray-400" },
			],
		},
		{
			icon: CommunityIcon,
			iconColor: "text-purple-400",
			iconBg: "bg-purple-500/20",
			title: "Teaming Prep",
			description: "Align minds and mechanics so handoffs are smooth...",
			status: [
				{ label: "Team Ready", color: "text-gray-400" },
				{ label: "Ready to start", color: "text-gray-400" },
			],
		},
		{
			icon: CommunityIcon,
			iconColor: "text-purple-400",
			iconBg: "bg-purple-500/20",
			title: "Teaming Reflection",
			description: "Consolidate what worked between partners, surface...",
			status: [
				{ label: "Team Review", color: "text-gray-400" },
				{ label: "Ready to start", color: "text-gray-400" },
			],
		},
		{
			icon: GrowthIcon,
			iconColor: "text-purple-400",
			iconBg: "bg-purple-500/20",
			title: "Mentoring Prep",
			description: "Clarify the ask, define success, and set up a...",
			status: [
				{ label: "Get the Right", color: "text-gray-400" },
				{ label: "Ready to start", color: "text-gray-400" },
			],
		},
		{
			icon: GrowthIcon,
			iconColor: "text-purple-400",
			iconBg: "bg-purple-500/20",
			title: "Mentoring Reflection",
			description: "Consolidate insights and capture next steps",
			status: [
				{ label: "Apply", color: "text-gray-400" },
				{ label: "Ready to start", color: "text-gray-400" },
			],
		},
		{
			icon: HeartPulseIcon,
			iconColor: "text-purple-400",
			iconBg: "bg-purple-500/20",
			title: "Wellness Check-in",
			description: "Focus on emotional and physical wellbeing",
			status: [
				{ label: "Stay", color: "text-gray-400" },
				{ label: "Ready to start", color: "text-gray-400" },
			],
		},
		{
			icon: TargetIcon,
			iconColor: "text-red-400",
			iconBg: "bg-red-500/20",
			title: "Values Alignment Check-In",
			description: "Realign with your values after challenging decisions",
			status: [
				{ label: "Values", color: "text-gray-400" },
				{ label: "Ready to start", color: "text-gray-400" },
			],
		},
		{
			icon: HourglassPersonIcon,
			iconColor: "text-orange-400",
			iconBg: "bg-orange-500/20",
			title: "In-Session Self-Check",
			description: "Quick monitoring for active interpreting sessions",
			status: [
				{ label: "Real-time", color: "text-gray-400" },
				{ label: "Ready to start", color: "text-gray-400" },
			],
		},
		{
			icon: CommunityIcon,
			iconColor: "text-purple-400",
			iconBg: "bg-purple-500/20",
			title: "In-Session Team Sync",
			description: "Team coordination check during assignments",
			status: [
				{ label: "Team sync", color: "text-gray-400" },
				{ label: "Ready to start", color: "text-gray-400" },
			],
		},
		{
			icon: SecureLockIcon,
			iconColor: "#5B9378",
			iconBg: "rgba(45, 95, 63, 0.2)",
			title: "Role-Space Reflection",
			description:
				"Clarify and honor your professional boundaries after each assignment",
			status: [
				{ label: "Boundaries", color: "text-gray-400" },
				{ label: "Ready to start", color: "text-gray-400" },
			],
		},
		{
			icon: ChatBubbleIcon,
			iconColor: "#5C7F4F",
			iconBg: "rgba(45, 95, 63, 0.2)",
			title: "Supporting Direct Communication",
			description:
				"Reflect on facilitating respectful, independent communication",
			status: [
				{ label: "Direct Flow", color: "text-gray-400" },
				{ label: "Ready to start", color: "text-gray-400" },
			],
		},
		{
			icon: HeartPulseIcon,
			iconColor: "text-orange-600",
			iconBg: "bg-orange-500/20",
			title: "BIPOC Interpreter Wellness",
			description:
				"Center your experience as a Black, Indigenous, or Person of Color interpreter",
			status: [
				{ label: "Cultural Affirmation", color: "text-gray-400" },
				{ label: "Ready to start", color: "text-gray-400" },
			],
		},
		{
			icon: CommunityIcon,
			iconColor: "text-purple-400",
			iconBg: "bg-purple-500/20",
			title: "Deaf Interpreter Professional Identity",
			description:
				"For DI/CDI: Teaming dynamics, audism, and professional recognition",
			status: [
				{ label: "DI/CDI Identity", color: "text-gray-400" },
				{ label: "Ready to start", color: "text-gray-400" },
			],
		},
		{
			icon: Brain,
			iconColor: "#5C7F4F",
			iconBg: "rgba(45, 95, 63, 0.2)",
			title: "Neurodivergent Interpreter Wellness",
			description:
				"For ADHD, autism, dyslexia, and all cognitive differences",
			status: [
				{ label: "ND Affirmation", color: "text-gray-400" },
				{ label: "Ready to start", color: "text-gray-400" },
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

					<p className="text-sm mb-4" style={{
						color: "var(--color-slate-600)"
					}}>
						{card.description}
					</p>

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
