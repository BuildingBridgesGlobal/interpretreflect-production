import type React from "react";
import { 
	Brain,
	FileText,
	CheckCircle2,
	Users,
	MessageSquare,
	Lightbulb,
	Heart,
	Sparkles,
	Clock,
	Shield,
	MessageCircle,
	Palette,
	UserCheck
} from "lucide-react";

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
			icon: FileText,
			iconColor: "#8B7355",
			iconBg: "rgba(139, 115, 85, 0.08)",
			title: "Pre-Assignment Prep",
			description: "Set yourself up for success before your next assignment. Prepare your mind, body, and spirit.",
			status: [
				{ label: "5 min", color: "text-gray-400" },
			],
			trackingInfo: "View confidence trends in Growth Insights → Confidence Levels",
		},
		{
			icon: CheckCircle2,
			iconColor: "#7B8F8A",
			iconBg: "rgba(123, 143, 138, 0.08)",
			title: "Post-Assignment Debrief",
			description: "Process what happened, capture what you learned, and release the stress. Growth happens here.",
			status: [
				{ label: "10 min", color: "text-gray-400" },
			],
		},
		{
			icon: Users,
			iconColor: "#9B8B7E",
			iconBg: "rgba(155, 139, 126, 0.08)",
			title: "Team Prep",
			description: "Get ready to work with your interpreting partner. Set yourself up for smooth collaboration.",
			status: [
				{ label: "5 min", color: "text-gray-400" },
			],
		},
		{
			icon: MessageSquare,
			iconColor: "#8A9A8E",
			iconBg: "rgba(138, 154, 142, 0.08)",
			title: "Team Reflection",
			description: "Capture what you learned from working with your partner. Simple, focused, growth-oriented.",
			status: [
				{ label: "7 min", color: "text-gray-400" },
			],
		},
		{
			icon: Lightbulb,
			iconColor: "#A89968",
			iconBg: "rgba(168, 153, 104, 0.08)",
			title: "Mentoring Prep",
			description: "Prepare to get the most from your mentoring session. Clarify what you need and what success looks like.",
			status: [
				{ label: "5 min", color: "text-gray-400" },
			],
		},
		{
			icon: Sparkles,
			iconColor: "#B8A890",
			iconBg: "rgba(184, 168, 144, 0.08)",
			title: "Mentoring Reflection",
			description: "Capture insights from your mentoring session and plan your next steps forward.",
			status: [
				{ label: "5 min", color: "text-gray-400" },
			],
		},
		{
			icon: Heart,
			iconColor: "#C9A690",
			iconBg: "rgba(201, 166, 144, 0.08)",
			title: "Wellness Check-in",
			description: "Check in with your emotional and physical wellbeing. How are you really doing today?",
			status: [
				{ label: "3 min", color: "text-gray-400" },
			],
			trackingInfo: "View stress & energy trends in Growth Insights",
		},

		{
			icon: Clock,
			iconColor: "#9A8F7E",
			iconBg: "rgba(154, 143, 126, 0.08)",
			title: "Mid-Assignment Check-In",
			description: "Quick 2-minute check during a break. Stay aware of your energy, focus, and boundaries in real-time.",
			status: [
				{ label: "1 min", color: "text-gray-400" },
			],
		},
		{
			icon: Shield,
			iconColor: "#7B8E85",
			iconBg: "rgba(123, 142, 133, 0.08)",
			title: "Role-Space Reflection",
			description:
				"Clarify and honor your professional boundaries. What is (and isn't) your responsibility?",
			status: [
				{ label: "5 min", color: "text-gray-400" },
			],
		},
		{
			icon: MessageCircle,
			iconColor: "#9B9482",
			iconBg: "rgba(155, 148, 130, 0.08)",
			title: "Supporting Direct Communication",
			description:
				"Reflect on how you facilitated direct communication between consumers. Keep the focus where it belongs.",
			status: [
				{ label: "5 min", color: "text-gray-400" },
			],
		},
		{
			icon: Heart,
			iconColor: "#B89B88",
			iconBg: "rgba(184, 155, 136, 0.08)",
			title: "BIPOC Interpreter Wellness",
			description:
				"A space to center your experience as a Black, Indigenous, or Person of Color interpreter. Your story matters.",
			status: [
				{ label: "7 min", color: "text-gray-400" },
			],
		},
		{
			icon: UserCheck,
			iconColor: "#8A9488",
			iconBg: "rgba(138, 148, 136, 0.08)",
			title: "Deaf Interpreter Professional Identity",
			description:
				"For Deaf Interpreters: Navigate teaming dynamics, audism, and professional recognition.",
			status: [
				{ label: "7 min", color: "text-gray-400" },
			],
		},
		{
			icon: Brain,
			iconColor: "#9B8E82",
			iconBg: "rgba(155, 142, 130, 0.08)",
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
			"Team Prep": "teaming-prep",
			"Team Reflection": "teaming-reflection",
			"Mentoring Prep": "mentoring-prep",
			"Mentoring Reflection": "mentoring-reflection",
			"Wellness Check-in": "wellness",
			"Emotion Clarity Practice": "emotion-clarity",
			"Mid-Assignment Check-In": "in-session-self",
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
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
			{reflectionCards.map((card, index) => (
				<div
					key={index}
					className="rounded-xl p-5 cursor-pointer transition-all hover:shadow-clean-md hover:-translate-y-0.5 shadow-clean"
					style={{
						backgroundColor: "#FAF8F5",
						border: "1px solid var(--color-slate-200)",
					}}
					onClick={() => handleToolClick(card.title)}
				>
					<div className="flex items-start justify-between mb-3">
						<div 
							className="p-2.5 rounded-lg"
							style={{
								backgroundColor: card.iconBg,
							}}
						>
							<card.icon size={28} color={card.iconColor} strokeWidth={1.5} />
						</div>
						<span className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{
							backgroundColor: "rgba(107, 130, 104, 0.05)",
							color: "#6B8268",
							border: "1px solid rgba(107, 130, 104, 0.3)"
						}}>
							Ready
						</span>
					</div>

					<h3 className="font-bold text-base mb-2" style={{
						color: "var(--color-slate-700)"
					}}>
						{card.title}
					</h3>

					<p className="text-sm mb-3 leading-relaxed" style={{
						color: "var(--color-slate-600)"
					}}>
						{card.description}
					</p>

					{/* Tracking Info */}
					{card.trackingInfo && (
						<div
							className="mb-3 px-2.5 py-1.5 rounded-lg text-xs leading-relaxed"
							style={{
								backgroundColor: "rgba(92, 127, 79, 0.08)",
								border: "1px solid rgba(92, 127, 79, 0.2)",
								color: "#3A3A3A"
							}}
						>
							📊 {card.trackingInfo}
						</div>
					)}


				</div>
			))}
		</div>
	);
};

