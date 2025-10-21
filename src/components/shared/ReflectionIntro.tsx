import { HelpCircle, Info } from "lucide-react";
import type React from "react";

interface ReflectionIntroProps {
	title: string;
	subtitle: string;
	description?: string;
	estimatedTime?: string;
	tips?: string[];
	professionalContext?: string;
	icon?: React.ReactNode;
}

/**
 * Warm, mentorly introduction for reflection tools
 * Provides context, encouragement, and clarity for users
 */
export const ReflectionIntro: React.FC<ReflectionIntroProps> = ({
	title,
	subtitle,
	description,
	estimatedTime = "5-10 minutes",
	tips,
	professionalContext,
	icon,
}) => {
	return (
		<div className="mb-8">
			{/* Header */}
			<div className="flex items-start gap-4 mb-4">
				{icon && <div className="text-green-600 mt-1">{icon}</div>}
				<div className="flex-1">
					<h2
						className="text-3xl font-bold mb-2"
						style={{ color: "var(--color-slate-800)" }}
					>
						{title}
					</h2>
					<p
						className="text-xl mb-3"
						style={{ color: "var(--color-green-700)", fontWeight: "500" }}
					>
						{subtitle}
					</p>
					{description && (
						<p
							className="text-base leading-relaxed"
							style={{ color: "var(--color-slate-600)" }}
						>
							{description}
						</p>
					)}
				</div>
				{estimatedTime && (
					<div
						className="px-4 py-2 rounded-lg"
						style={{
							backgroundColor: "var(--color-green-50)",
							border: "1px solid var(--color-green-200)",
						}}
					>
						<p
							className="text-sm font-medium"
							style={{ color: "var(--color-green-800)" }}
						>
							⏱️ {estimatedTime}
						</p>
					</div>
				)}
			</div>

			{/* Professional Context (if provided) */}
			{professionalContext && (
				<div
					className="p-4 rounded-lg mb-4 border-l-4"
					style={{
						backgroundColor: "var(--color-blue-50)",
						borderColor: "var(--color-blue-500)",
					}}
				>
					<div className="flex items-start gap-2">
						<Info
							size={20}
							className="mt-0.5 flex-shrink-0"
							style={{ color: "var(--color-blue-600)" }}
						/>
						<div>
							<p
								className="text-sm font-semibold mb-1"
								style={{ color: "var(--color-blue-900)" }}
							>
								What is this?
							</p>
							<p
								className="text-sm leading-relaxed"
								style={{ color: "var(--color-blue-800)" }}
							>
								{professionalContext}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Tips (if provided) */}
			{tips && tips.length > 0 && (
				<div
					className="p-4 rounded-lg"
					style={{
						backgroundColor: "var(--color-amber-50)",
						border: "1px solid var(--color-amber-200)",
					}}
				>
					<div className="flex items-start gap-2 mb-2">
						<HelpCircle
							size={20}
							className="mt-0.5 flex-shrink-0"
							style={{ color: "var(--color-amber-700)" }}
						/>
						<p
							className="text-sm font-semibold"
							style={{ color: "var(--color-amber-900)" }}
						>
							Tips for this reflection:
						</p>
					</div>
					<ul className="space-y-1.5 ml-7">
						{tips.map((tip, index) => (
							<li
								key={index}
								className="text-sm leading-relaxed"
								style={{ color: "var(--color-amber-800)" }}
							>
								• {tip}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};
