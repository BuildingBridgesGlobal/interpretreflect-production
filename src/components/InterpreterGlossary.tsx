import { Book, BookOpen, Search, X } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface GlossaryTerm {
	term: string;
	definition: string;
	example?: string;
	category: "practice" | "identity" | "wellness" | "technical";
}

const glossaryTerms: GlossaryTerm[] = [
	// Practice Terms
	{
		term: "Pre-Assignment Prep",
		definition:
			"Professional preparation before an interpreting assignment. This helps you mentally, emotionally, and logistically prepare for what's ahead.",
		example:
			"Reviewing materials, checking your energy levels, and planning self-care for after the assignment.",
		category: "practice",
	},
	{
		term: "Post-Assignment Debrief",
		definition:
			"Reflection after completing an assignment to process what happened, capture lessons learned, and release stress.",
		example:
			"Taking 10 minutes after a medical appointment to journal about what went well and what you'd do differently next time.",
		category: "practice",
	},
	{
		term: "Teaming / Co-Interpreting",
		definition:
			"Working alongside another interpreter on the same assignment, taking turns and supporting each other.",
		example:
			"In a 2-hour legal proceeding, you and your partner switch every 20-30 minutes to maintain quality.",
		category: "practice",
	},
	{
		term: "Role-Space",
		definition:
			"The professional boundaries that define your role as an interpreter - what is and isn't your responsibility.",
		example:
			"Recognizing that you're facilitating communication, not providing legal advice or making decisions for consumers.",
		category: "practice",
	},
	{
		term: "Direct Communication",
		definition:
			"Supporting people to communicate directly with each other (not through you), maintaining natural conversation flow.",
		example:
			"Positioning yourself so the doctor and patient can make eye contact with each other, not with you.",
		category: "practice",
	},
	{
		term: "Mentoring",
		definition:
			"Receiving guidance from experienced interpreters or supporting newer colleagues in their professional development.",
		example:
			"Meeting monthly with a seasoned interpreter to discuss challenging scenarios and get feedback on your work.",
		category: "practice",
	},

	// Identity Terms
	{
		term: "DI/CDI",
		definition:
			"Deaf Interpreter / Certified Deaf Interpreter. Deaf professionals who provide interpreting services, often teaming with hearing interpreters.",
		example:
			"A Deaf Interpreter working with a hearing interpreter for a DeafBlind consumer or complex legal matter.",
		category: "identity",
	},
	{
		term: "BIPOC Interpreter",
		definition:
			"Black, Indigenous, and People of Color interpreters who navigate unique cultural and systemic experiences in the field.",
		example:
			"Addressing the specific wellness needs and experiences of interpreters from marginalized racial/ethnic backgrounds.",
		category: "identity",
	},
	{
		term: "Neurodivergent Interpreter",
		definition:
			"Interpreters with ADHD, autism, dyslexia, or other neurological differences - bringing unique strengths to the work.",
		example:
			"An interpreter with ADHD using specific organizational systems to manage assignment details and energy.",
		category: "identity",
	},

	// Wellness Terms
	{
		term: "Burnout",
		definition:
			"Physical, emotional, and mental exhaustion from prolonged stress, common in helping professions like interpreting.",
		example:
			"Feeling emotionally drained after every assignment, dreading work, or losing passion for interpreting.",
		category: "wellness",
	},
	{
		term: "Values Alignment",
		definition:
			"Checking that your work remains consistent with your personal and professional values, especially after ethically complex situations.",
		example:
			"Reflecting on whether a particularly challenging assignment felt aligned with your commitment to ethical practice.",
		category: "wellness",
	},
	{
		term: "Compassion Fatigue",
		definition:
			"Reduced capacity for empathy after prolonged exposure to others' trauma or suffering.",
		example:
			"Noticing you're becoming numb to emotional content in assignments that used to affect you deeply.",
		category: "wellness",
	},
	{
		term: "Vicarious Trauma",
		definition:
			"Absorbing and being affected by the traumatic experiences you facilitate interpreting for.",
		example:
			"Experiencing intrusive thoughts or emotional distress after interpreting for trauma survivors.",
		category: "wellness",
	},

	// Technical/Linguistic Terms
	{
		term: "Paralinguistic",
		definition:
			"Non-verbal elements of communication like tone, volume, pacing, facial expressions, and body language.",
		example:
			"Matching the speaker's urgent tone and quick pacing while interpreting an emergency situation.",
		category: "technical",
	},
	{
		term: "Intrapersonal",
		definition:
			"What's happening inside you - your thoughts, feelings, and internal experience during the work.",
		example:
			"Noticing your own anxiety rising during a high-stress medical emergency.",
		category: "technical",
	},
	{
		term: "Interpersonal",
		definition:
			"Interactions and relationships between you and others - consumers, team interpreters, or professionals.",
		example:
			"Managing dynamics when a provider directs questions to you instead of the Deaf consumer.",
		category: "technical",
	},
	{
		term: "Environmental",
		definition:
			"Physical surroundings and conditions - lighting, space, noise, temperature, setup.",
		example:
			"Asking to adjust lighting so the Deaf consumer can see you clearly, or requesting a quieter location.",
		category: "technical",
	},
];

interface InterpreterGlossaryProps {
	onClose?: () => void;
	embedded?: boolean;
}

export const InterpreterGlossary: React.FC<InterpreterGlossaryProps> = ({
	onClose,
	embedded = false,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	const categories = [
		{ id: "practice", label: "Practice & Tools", color: "bg-[rgba(107,130,104,0.05)]0" },
		{ id: "identity", label: "Identity & Role", color: "bg-purple-500" },
		{ id: "wellness", label: "Wellness & Self-Care", color: "bg-blue-500" },
		{ id: "technical", label: "Technical Terms", color: "bg-orange-500" },
	];

	const filteredTerms = glossaryTerms.filter((term) => {
		const matchesSearch =
			term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
			term.definition.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = !selectedCategory || term.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const getCategoryColor = (category: string) => {
		return categories.find((c) => c.id === category)?.color || "bg-gray-500";
	};

	return (
		<div
			className={`${embedded ? "" : "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"}`}
		>
			<div
				className={`${embedded ? "w-full" : "max-w-4xl w-full max-h-[90vh]"} rounded-2xl shadow-2xl overflow-hidden`}
				style={{ backgroundColor: "var(--color-card)" }}
			>
				{/* Header */}
				<div
					className="p-6 border-b"
					style={{ borderColor: "var(--color-slate-200)" }}
				>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<BookOpen className="text-green-600" size={32} />
							<div>
								<h2
									className="text-2xl font-bold"
									style={{ color: "var(--color-slate-800)" }}
								>
									Interpreter Glossary
								</h2>
								<p
									className="text-sm mt-1"
									style={{ color: "var(--color-slate-600)" }}
								>
									Quick reference for professional terminology
								</p>
							</div>
						</div>
						{!embedded && onClose && (
							<button
								onClick={onClose}
								className="p-2 rounded-full hover:bg-gray-100 transition-colors"
								aria-label="Close glossary"
							>
								<X size={24} style={{ color: "var(--color-slate-600)" }} />
							</button>
						)}
					</div>

					{/* Search */}
					<div className="relative">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2"
							size={20}
							style={{ color: "var(--color-slate-400)" }}
						/>
						<input
							type="text"
							placeholder="Search terms..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500"
							style={{
								backgroundColor: "var(--color-background)",
								borderColor: "var(--color-slate-300)",
								color: "var(--color-slate-800)",
							}}
						/>
					</div>

					{/* Category filters */}
					<div className="flex flex-wrap gap-2 mt-4">
						<button
							onClick={() => setSelectedCategory(null)}
							className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
								selectedCategory === null
									? "bg-green-600 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							All Terms
						</button>
						{categories.map((category) => (
							<button
								key={category.id}
								onClick={() => setSelectedCategory(category.id)}
								className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
									selectedCategory === category.id
										? `${category.color} text-white`
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								{category.label}
							</button>
						))}
					</div>
				</div>

				{/* Terms list */}
				<div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
					<div className="p-6 space-y-4">
						{filteredTerms.length === 0 ? (
							<div className="text-center py-12">
								<Book
									size={48}
									className="mx-auto mb-4"
									style={{ color: "var(--color-slate-300)" }}
								/>
								<p
									className="text-lg"
									style={{ color: "var(--color-slate-600)" }}
								>
									No terms found matching "{searchTerm}"
								</p>
							</div>
						) : (
							filteredTerms.map((term, index) => (
								<div
									key={index}
									className="p-4 rounded-xl border"
									style={{
										backgroundColor: "var(--color-background)",
										borderColor: "var(--color-slate-200)",
									}}
								>
									<div className="flex items-start justify-between mb-2">
										<h3
											className="text-lg font-bold"
											style={{ color: "var(--color-slate-800)" }}
										>
											{term.term}
										</h3>
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(term.category)}`}
										>
											{categories.find((c) => c.id === term.category)?.label}
										</span>
									</div>
									<p
										className="mb-3 leading-relaxed"
										style={{ color: "var(--color-slate-700)" }}
									>
										{term.definition}
									</p>
									{term.example && (
										<div
											className="p-3 rounded-lg border-l-4"
											style={{
												backgroundColor: "rgba(107, 130, 104, 0.05)",
												borderColor: "#5B9378",
											}}
										>
											<p
												className="text-sm font-medium mb-1"
												style={{ color: "#4A6640" }}
											>
												Example:
											</p>
											<p
												className="text-sm italic"
												style={{ color: "#5C7F4F" }}
											>
												{term.example}
											</p>
										</div>
									)}
								</div>
							))
						)}
					</div>
				</div>

				{/* Footer */}
				{!embedded && (
					<div
						className="p-4 border-t text-center"
						style={{ borderColor: "var(--color-slate-200)" }}
					>
						<p className="text-sm" style={{ color: "var(--color-slate-600)" }}>
							Don't see a term? We're always expanding this glossary based on
							your feedback.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
