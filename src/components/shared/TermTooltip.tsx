import { HelpCircle, Info } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface TermTooltipProps {
	term: string;
	definition: string;
	variant?: "inline" | "icon";
	position?: "top" | "bottom" | "left" | "right";
	children?: React.ReactNode;
}

/**
 * Tooltip component for explaining interpreter-specific terminology
 * Helps bridge the gap between insider language and accessible explanations
 */
export const TermTooltip: React.FC<TermTooltipProps> = ({
	term,
	definition,
	variant = "inline",
	position = "top",
	children,
}) => {
	const [isVisible, setIsVisible] = useState(false);

	const positionClasses = {
		top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
		bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
		left: "right-full top-1/2 -translate-y-1/2 mr-2",
		right: "left-full top-1/2 -translate-y-1/2 ml-2",
	};

	const arrowClasses = {
		top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent",
		bottom:
			"bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent",
		left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent",
		right:
			"right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent",
	};

	return (
		<span className="relative inline-flex items-center">
			{variant === "inline" ? (
				<span
					className="underline decoration-dotted decoration-2 cursor-help"
					style={{
						textDecorationColor: "var(--color-green-500)",
						color: "inherit",
					}}
					onMouseEnter={() => setIsVisible(true)}
					onMouseLeave={() => setIsVisible(false)}
					onFocus={() => setIsVisible(true)}
					onBlur={() => setIsVisible(false)}
					tabIndex={0}
					role="button"
					aria-label={`Definition of ${term}`}
				>
					{children || term}
				</span>
			) : (
				<button
					type="button"
					className="inline-flex items-center ml-1 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full"
					onMouseEnter={() => setIsVisible(true)}
					onMouseLeave={() => setIsVisible(false)}
					onFocus={() => setIsVisible(true)}
					onBlur={() => setIsVisible(false)}
					aria-label={`Definition of ${term}`}
				>
					<HelpCircle
						size={16}
						className="text-green-600 hover:text-green-700 transition-colors"
					/>
				</button>
			)}

			{/* Tooltip */}
			{isVisible && (
				<div
					className={`absolute z-50 ${positionClasses[position]} w-72 pointer-events-none`}
					role="tooltip"
				>
					<div
						className="rounded-lg shadow-lg p-4 text-sm"
						style={{
							backgroundColor: "#1F2937",
							color: "#F9FAFB",
						}}
					>
						<div className="font-semibold mb-1.5 text-green-400">{term}</div>
						<div className="leading-relaxed">{definition}</div>
					</div>
					{/* Arrow */}
					<div
						className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
					/>
				</div>
			)}
		</span>
	);
};

/**
 * Pre-defined tooltips for common interpreter terminology
 */
export const interpreterTerms = {
	"Pre-Assignment Prep": {
		term: "Pre-Assignment Prep",
		definition:
			"Professional preparation before an interpreting assignment. This helps you mentally, emotionally, and logistically prepare for what's ahead - a practice used by experienced interpreters to reduce stress and improve performance.",
	},
	"Post-Assignment Debrief": {
		term: "Post-Assignment Debrief",
		definition:
			"Reflection after completing an interpreting assignment. This professional practice helps you process what happened, capture lessons learned, and release stress - essential for growth and wellbeing.",
	},
	"Teaming": {
		term: "Teaming (Co-Interpreting)",
		definition:
			"Working alongside another interpreter on the same assignment. You take turns interpreting and supporting each other, which is standard practice for longer or more demanding assignments.",
	},
	"Role-Space": {
		term: "Role-Space",
		definition:
			"The professional boundaries that define your role as an interpreter. This concept helps you clarify what is (and isn't) your responsibility during assignments.",
	},
	"Direct Communication": {
		term: "Direct Communication",
		definition:
			"Supporting people to communicate directly with each other (not through you). As interpreters, we facilitate conversations but aren't participants - we help maintain the natural flow between the actual speakers.",
	},
	"DI/CDI": {
		term: "DI/CDI",
		definition:
			"Deaf Interpreter / Certified Deaf Interpreter. Deaf professionals who provide interpreting services, often working in teams with hearing interpreters for complex or culturally nuanced situations.",
	},
	"BIPOC": {
		term: "BIPOC",
		definition:
			"Black, Indigenous, and People of Color. This reflection is specifically designed to center the unique experiences and wellness needs of BIPOC interpreters.",
	},
	"Neurodivergent": {
		term: "Neurodivergent",
		definition:
			"Individuals whose neurological development and functioning differ from what is considered typical. This includes ADHD, autism, dyslexia, and other cognitive differences - all of which are strengths in our field.",
	},
	"Values Alignment": {
		term: "Values Alignment",
		definition:
			"Checking in with your personal and professional values, especially after ethically complex situations. This helps ensure your work remains aligned with what matters most to you.",
	},
	"Intrapersonal": {
		term: "Intrapersonal",
		definition:
			"What's happening inside you - your thoughts, feelings, and internal experience. This is about your relationship with yourself during the work.",
	},
	"Interpersonal": {
		term: "Interpersonal",
		definition:
			"Interactions and relationships between you and others - consumers, team interpreters, or other professionals involved in the assignment.",
	},
	"Paralinguistic": {
		term: "Paralinguistic",
		definition:
			"Non-verbal elements of communication like tone, volume, pacing, facial expressions, and body language. These carry meaning beyond the words themselves.",
	},
	"Environmental": {
		term: "Environmental",
		definition:
			"Physical surroundings and conditions - lighting, space, noise, temperature, setup. Environmental factors significantly impact interpreting work.",
	},
	"Mentoring": {
		term: "Mentoring (in Interpreting)",
		definition:
			"Receiving guidance from more experienced interpreters or providing guidance to newer colleagues. This professional relationship supports skill development and career growth.",
	},
};

/**
 * Quick wrapper component for common interpreter terms
 */
export const IT: React.FC<{
	term: keyof typeof interpreterTerms;
	children?: React.ReactNode;
	variant?: "inline" | "icon";
}> = ({ term, children, variant = "inline" }) => {
	const termData = interpreterTerms[term];
	return (
		<TermTooltip
			term={termData.term}
			definition={termData.definition}
			variant={variant}
		>
			{children || termData.term}
		</TermTooltip>
	);
};
