import {
	Award,
	Briefcase,
	CheckCircle,
	Download,
	FileText,
	Globe,
	Heart,
	Medal,
	Share2,
	Shield,
	Sparkles,
	Star,
	Users,
	Zap,
} from "lucide-react";
import React, { useMemo, useRef, useState } from "react";

// Types for skills and profile data
export interface InterpreterSkill {
	category: "wellness" | "soft" | "technical" | "specialty";
	name: string;
	level: "developing" | "proficient" | "expert";
	evidence: string[];
	score: number; // 0-100
	trending: "up" | "stable" | "down";
}

export interface StrengthProfile {
	userId: string;
	displayName: string;
	title?: string;
	topStrengths: string[];
	preferredTools: {
		name: string;
		effectiveness: number;
		frequency: number;
	}[];
	wellnessHabits: {
		habit: string;
		consistency: number;
		impact: "high" | "medium" | "low";
	}[];
	softSkills: {
		skill: string;
		rating: number;
		examples: string[];
	}[];
	specialties: string[];
	stressTriggers: string[];
	copingStrategies: string[];
	personalityTraits: string[];
	matchingData?: {
		preferredAssignmentTypes: string[];
		avoidAssignmentTypes: string[];
		idealTeamSize: string;
		workStyle: string;
		communicationStyle: string;
	};
}

interface Props {
	userId?: string;
	onShare?: (profile: StrengthProfile) => void;
	onDownload?: (format: "pdf" | "png" | "json") => void;
}

export function InterpreterStrengthsProfile({
	userId,
	onShare,
	onDownload,
}: Props) {
	const profileRef = useRef<HTMLDivElement>(null);
	const [viewMode, setViewMode] = useState<"overview" | "detailed" | "card">(
		"overview",
	);
	const [selectedCategory, setSelectedCategory] = useState<
		"all" | "wellness" | "soft" | "technical"
	>("all");

	// Mock data - in production, this would be aggregated from user's tracked data
	const profile: StrengthProfile = useMemo(
		() => ({
			userId: userId || "user-123",
			displayName: "Sarah Chen",
			title: "Certified Medical Interpreter",
			topStrengths: [
				"Calm Under Pressure",
				"Team Collaboration",
				"Cultural Sensitivity",
				"Quick Adaptation",
			],
			preferredTools: [
				{ name: "Breathing Exercises", effectiveness: 92, frequency: 85 },
				{ name: "Body Check-In", effectiveness: 88, frequency: 72 },
				{ name: "Reset Sessions", effectiveness: 95, frequency: 68 },
				{ name: "Reflection Studio", effectiveness: 86, frequency: 90 },
			],
			wellnessHabits: [
				{
					habit: "Morning mindfulness routine",
					consistency: 85,
					impact: "high",
				},
				{
					habit: "Pre-assignment preparation",
					consistency: 92,
					impact: "high",
				},
				{
					habit: "Weekly reflection practice",
					consistency: 78,
					impact: "medium",
				},
				{
					habit: "Regular breaks between sessions",
					consistency: 88,
					impact: "high",
				},
			],
			softSkills: [
				{
					skill: "Emotional Regulation",
					rating: 90,
					examples: [
						"Maintains composure in high-stress medical interpretations",
						"Successfully de-escalates tense situations",
					],
				},
				{
					skill: "Active Listening",
					rating: 95,
					examples: [
						"Zero communication errors in last 50 sessions",
						"Consistently catches nuanced cultural context",
					],
				},
				{
					skill: "Adaptability",
					rating: 88,
					examples: [
						"Smoothly transitions between assignment types",
						"Quickly adjusts to new terminology",
					],
				},
				{
					skill: "Team Collaboration",
					rating: 92,
					examples: [
						"Excellent feedback from team assignments",
						"Mentors new interpreters regularly",
					],
				},
			],
			specialties: ["Medical", "Mental Health", "Legal", "Educational"],
			stressTriggers: [
				"End-of-week assignments",
				"Complex medical terminology",
				"Emotional content",
			],
			copingStrategies: [
				"Breathing exercises",
				"Quick body scans",
				"Peer debriefing",
			],
			personalityTraits: [
				"Empathetic",
				"Detail-oriented",
				"Resilient",
				"Professional",
			],
			matchingData: {
				preferredAssignmentTypes: ["Medical", "Mental Health"],
				avoidAssignmentTypes: ["Child welfare"],
				idealTeamSize: "2-3 interpreters",
				workStyle: "Structured with flexibility",
				communicationStyle: "Direct and supportive",
			},
		}),
		[userId],
	);

	// Calculate overall wellness score
	const wellnessScore = useMemo(() => {
		const toolScore =
			profile.preferredTools.reduce(
				(acc, tool) => acc + tool.effectiveness,
				0,
			) / profile.preferredTools.length;
		const habitScore =
			profile.wellnessHabits.reduce(
				(acc, habit) => acc + habit.consistency,
				0,
			) / profile.wellnessHabits.length;
		return Math.round((toolScore + habitScore) / 2);
	}, [profile]);

	// Generate encouraging microcopy based on strengths
	const getEncouragingMessage = (strength: string): string => {
		const messages: Record<string, string> = {
			"Calm Under Pressure":
				"You excel in high-pressure scenarios, maintaining clarity when it matters most.",
			"Team Collaboration":
				"You thrive with team assignments, elevating everyone's performance.",
			"Cultural Sensitivity":
				"Your cultural awareness creates bridges of understanding in every session.",
			"Quick Adaptation":
				"You seamlessly adapt to new challenges, making the complex feel manageable.",
			"Emotional Regulation":
				"Your emotional intelligence transforms difficult moments into opportunities for connection.",
			"Active Listening":
				"Your exceptional listening skills ensure nothing is lost in translation.",
			Adaptability:
				"You navigate change with grace, turning uncertainty into opportunity.",
			Resilient:
				"You bounce back stronger from challenges, inspiring confidence in others.",
		};
		return (
			messages[strength] ||
			`Your ${strength.toLowerCase()} skills are exceptional.`
		);
	};

	// Handle download functionality
	const handleDownload = (format: "pdf" | "png" | "json") => {
		if (format === "json") {
			const dataStr = JSON.stringify(profile, null, 2);
			const dataUri =
				"data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
			const exportFileDefaultName = `interpreter-profile-${profile.userId}.json`;

			const linkElement = document.createElement("a");
			linkElement.setAttribute("href", dataUri);
			linkElement.setAttribute("download", exportFileDefaultName);
			linkElement.click();
		}

		if (onDownload) {
			onDownload(format);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header with view controls */}
			<header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h2
						className="text-3xl font-bold"
						style={{ color: "var(--primary-900)" }}
					>
						Your Interpreter Strengths & Skills
					</h2>
					<p
						className="text-lg mt-2"
						style={{ color: "var(--text-secondary)" }}
					>
						A comprehensive view of your professional growth and capabilities
					</p>
				</div>

				<div className="flex gap-2">
					<button
						onClick={() => setViewMode("overview")}
						className="px-4 py-2 rounded-lg font-medium transition-all"
						style={{
							backgroundColor:
								viewMode === "overview"
									? "var(--primary-700)"
									: "var(--bg-card)",
							color:
								viewMode === "overview"
									? "var(--text-inverse)"
									: "var(--text-primary)",
							border: `2px solid ${viewMode === "overview" ? "var(--primary-700)" : "var(--border-default)"}`,
						}}
						aria-pressed={viewMode === "overview"}
					>
						Overview
					</button>
					<button
						onClick={() => setViewMode("detailed")}
						className="px-4 py-2 rounded-lg font-medium transition-all"
						style={{
							backgroundColor:
								viewMode === "detailed"
									? "var(--primary-700)"
									: "var(--bg-card)",
							color:
								viewMode === "detailed"
									? "var(--text-inverse)"
									: "var(--text-primary)",
							border: `2px solid ${viewMode === "detailed" ? "var(--primary-700)" : "var(--border-default)"}`,
						}}
						aria-pressed={viewMode === "detailed"}
					>
						Detailed
					</button>
					<button
						onClick={() => setViewMode("card")}
						className="px-4 py-2 rounded-lg font-medium transition-all"
						style={{
							backgroundColor:
								viewMode === "card" ? "var(--primary-700)" : "var(--bg-card)",
							color:
								viewMode === "card"
									? "var(--text-inverse)"
									: "var(--text-primary)",
							border: `2px solid ${viewMode === "card" ? "var(--primary-700)" : "var(--border-default)"}`,
						}}
						aria-pressed={viewMode === "card"}
					>
						Profile Card
					</button>
				</div>
			</header>

			{/* Overview Mode */}
			{viewMode === "overview" && (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{/* Wellness Score Card */}
					<article
						className="p-6 rounded-2xl"
						style={{
							background:
								"linear-gradient(135deg, var(--primary-50), var(--primary-100))",
							boxShadow: "var(--shadow-lg)",
						}}
					>
						<div className="flex items-center justify-between mb-4">
							<h3
								className="text-lg font-semibold"
								style={{ color: "var(--primary-900)" }}
							>
								Wellness Score
							</h3>
							<Heart
								className="h-6 w-6"
								style={{ color: "var(--primary-600)" }}
							/>
						</div>
						<div
							className="text-4xl font-bold mb-2"
							style={{ color: "var(--primary-800)" }}
						>
							{wellnessScore}%
						</div>
						<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
							Excellent self-care practices
						</p>
						<div
							className="mt-4 h-2 rounded-full overflow-hidden"
							style={{ backgroundColor: "var(--primary-200)" }}
						>
							<div
								className="h-full rounded-full transition-all"
								style={{
									width: `${wellnessScore}%`,
									backgroundColor: "var(--primary-600)",
								}}
								role="progressbar"
								aria-valuenow={wellnessScore}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-label={`Wellness score: ${wellnessScore}%`}
							/>
						</div>
					</article>

					{/* Top Strengths */}
					<article
						className="p-6 rounded-2xl lg:col-span-2"
						style={{
							backgroundColor: "var(--bg-card)",
							boxShadow: "var(--shadow-lg)",
						}}
					>
						<div className="flex items-center justify-between mb-4">
							<h3
								className="text-lg font-semibold"
								style={{ color: "var(--primary-900)" }}
							>
								Core Strengths
							</h3>
							<Award
								className="h-6 w-6"
								style={{ color: "var(--accent-700)" }}
							/>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							{profile.topStrengths.map((strength, index) => (
								<div
									key={index}
									className="p-3 rounded-lg"
									style={{ backgroundColor: "var(--bg-secondary)" }}
								>
									<div className="flex items-start gap-3">
										<Star
											className="h-5 w-5 mt-0.5 flex-shrink-0"
											style={{ color: "var(--accent-700)" }}
											fill="currentColor"
										/>
										<div>
											<h4
												className="font-semibold mb-1"
												style={{ color: "var(--text-primary)" }}
											>
												{strength}
											</h4>
											<p
												className="text-sm"
												style={{ color: "var(--text-secondary)" }}
											>
												{getEncouragingMessage(strength)}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</article>

					{/* Preferred Tools */}
					<article
						className="p-6 rounded-2xl"
						style={{
							backgroundColor: "var(--bg-card)",
							boxShadow: "var(--shadow-lg)",
						}}
					>
						<div className="flex items-center justify-between mb-4">
							<h3
								className="text-lg font-semibold"
								style={{ color: "var(--primary-900)" }}
							>
								Go-To Wellness Tools
							</h3>
							<Zap
								className="h-6 w-6"
								style={{ color: "var(--warning-600)" }}
							/>
						</div>
						<div className="space-y-3">
							{profile.preferredTools.slice(0, 3).map((tool, index) => (
								<div key={index}>
									<div className="flex justify-between items-center mb-1">
										<span
											className="text-sm font-medium"
											style={{ color: "var(--text-primary)" }}
										>
											{tool.name}
										</span>
										<span
											className="text-sm font-semibold"
											style={{ color: "var(--success-600)" }}
										>
											{tool.effectiveness}% effective
										</span>
									</div>
									<div
										className="h-2 rounded-full overflow-hidden"
										style={{ backgroundColor: "var(--neutral-200)" }}
									>
										<div
											className="h-full rounded-full"
											style={{
												width: `${tool.effectiveness}%`,
												backgroundColor: "var(--success-600)",
											}}
										/>
									</div>
								</div>
							))}
						</div>
					</article>

					{/* Soft Skills Radar */}
					<article
						className="p-6 rounded-2xl"
						style={{
							backgroundColor: "var(--bg-card)",
							boxShadow: "var(--shadow-lg)",
						}}
					>
						<div className="flex items-center justify-between mb-4">
							<h3
								className="text-lg font-semibold"
								style={{ color: "var(--primary-900)" }}
							>
								Soft Skills Excellence
							</h3>
							<Users className="h-6 w-6" style={{ color: "var(--info-600)" }} />
						</div>
						<div className="space-y-3">
							{profile.softSkills.slice(0, 4).map((skill, index) => (
								<div key={index} className="flex items-center justify-between">
									<span
										className="text-sm"
										style={{ color: "var(--text-primary)" }}
									>
										{skill.skill}
									</span>
									<div className="flex items-center gap-2">
										<div className="flex gap-0.5">
											{[1, 2, 3, 4, 5].map((star) => (
												<div
													key={star}
													className="w-4 h-4"
													style={{
														color:
															star <= Math.round(skill.rating / 20)
																? "var(--accent-700)"
																: "var(--neutral-300)",
													}}
												>
													★
												</div>
											))}
										</div>
									</div>
								</div>
							))}
						</div>
					</article>

					{/* Specialties */}
					<article
						className="p-6 rounded-2xl"
						style={{
							backgroundColor: "var(--bg-card)",
							boxShadow: "var(--shadow-lg)",
						}}
					>
						<div className="flex items-center justify-between mb-4">
							<h3
								className="text-lg font-semibold"
								style={{ color: "var(--primary-900)" }}
							>
								Specialization Areas
							</h3>
							<Briefcase
								className="h-6 w-6"
								style={{ color: "var(--primary-600)" }}
							/>
						</div>
						<div className="flex flex-wrap gap-2">
							{profile.specialties.map((specialty, index) => (
								<span
									key={index}
									className="px-3 py-1.5 rounded-full text-sm font-medium"
									style={{
										backgroundColor: "var(--primary-100)",
										color: "var(--primary-800)",
										border: "1px solid var(--primary-300)",
									}}
								>
									{specialty}
								</span>
							))}
						</div>
						<p
							className="text-sm mt-4"
							style={{ color: "var(--text-secondary)" }}
						>
							Certified in {profile.specialties.length} interpretation domains
						</p>
					</article>
				</div>
			)}

			{/* Detailed Mode */}
			{viewMode === "detailed" && (
				<div className="space-y-6">
					{/* Category Filter */}
					<nav
						className="flex gap-2 p-2 rounded-xl"
						style={{ backgroundColor: "var(--bg-secondary)" }}
					>
						{(["all", "wellness", "soft", "technical"] as const).map(
							(category) => (
								<button
									key={category}
									onClick={() => setSelectedCategory(category)}
									className="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize"
									style={{
										backgroundColor:
											selectedCategory === category
												? "var(--primary-700)"
												: "transparent",
										color:
											selectedCategory === category
												? "var(--text-inverse)"
												: "var(--text-primary)",
									}}
									aria-pressed={selectedCategory === category}
								>
									{category === "all" ? "All Skills" : `${category} Skills`}
								</button>
							),
						)}
					</nav>

					{/* Detailed Skills Grid */}
					<div className="grid gap-6 md:grid-cols-2">
						{/* Wellness Habits Detail */}
						{(selectedCategory === "all" ||
							selectedCategory === "wellness") && (
							<section
								className="p-6 rounded-2xl"
								style={{
									backgroundColor: "var(--bg-card)",
									boxShadow: "var(--shadow-lg)",
								}}
							>
								<h3
									className="text-xl font-bold mb-4"
									style={{ color: "var(--primary-900)" }}
								>
									Wellness Habits Analysis
								</h3>
								<div className="space-y-4">
									{profile.wellnessHabits.map((habit, index) => (
										<div
											key={index}
											className="p-4 rounded-lg"
											style={{ backgroundColor: "var(--bg-secondary)" }}
										>
											<div className="flex justify-between items-start mb-2">
												<h4
													className="font-semibold"
													style={{ color: "var(--text-primary)" }}
												>
													{habit.habit}
												</h4>
												<span
													className="px-2 py-1 rounded text-xs font-medium"
													style={{
														backgroundColor:
															habit.impact === "high"
																? "var(--success-100)"
																: "var(--warning-100)",
														color:
															habit.impact === "high"
																? "var(--success-600)"
																: "var(--warning-600)",
													}}
												>
													{habit.impact} impact
												</span>
											</div>
											<div className="flex items-center gap-3">
												<span
													className="text-sm"
													style={{ color: "var(--text-secondary)" }}
												>
													Consistency:
												</span>
												<div
													className="flex-1 h-2 rounded-full overflow-hidden"
													style={{ backgroundColor: "var(--neutral-200)" }}
												>
													<div
														className="h-full rounded-full"
														style={{
															width: `${habit.consistency}%`,
															backgroundColor:
																habit.consistency > 80
																	? "var(--success-600)"
																	: "var(--warning-600)",
														}}
													/>
												</div>
												<span
													className="text-sm font-semibold"
													style={{ color: "var(--text-primary)" }}
												>
													{habit.consistency}%
												</span>
											</div>
										</div>
									))}
								</div>
							</section>
						)}

						{/* Soft Skills Detail */}
						{(selectedCategory === "all" || selectedCategory === "soft") && (
							<section
								className="p-6 rounded-2xl"
								style={{
									backgroundColor: "var(--bg-card)",
									boxShadow: "var(--shadow-lg)",
								}}
							>
								<h3
									className="text-xl font-bold mb-4"
									style={{ color: "var(--primary-900)" }}
								>
									Soft Skills Breakdown
								</h3>
								<div className="space-y-4">
									{profile.softSkills.map((skill, index) => (
										<div
											key={index}
											className="p-4 rounded-lg"
											style={{ backgroundColor: "var(--bg-secondary)" }}
										>
											<div className="flex justify-between items-center mb-2">
												<h4
													className="font-semibold"
													style={{ color: "var(--text-primary)" }}
												>
													{skill.skill}
												</h4>
												<div className="flex items-center gap-2">
													<span
														className="text-sm font-semibold"
														style={{ color: "var(--primary-700)" }}
													>
														{skill.rating}/100
													</span>
													{skill.rating >= 90 && (
														<Medal
															className="h-5 w-5"
															style={{ color: "var(--accent-700)" }}
														/>
													)}
												</div>
											</div>
											<ul className="space-y-1">
												{skill.examples.map((example, i) => (
													<li key={i} className="flex items-start gap-2">
														<CheckCircle
															className="h-4 w-4 mt-0.5 flex-shrink-0"
															style={{ color: "var(--success-600)" }}
														/>
														<span
															className="text-sm"
															style={{ color: "var(--text-secondary)" }}
														>
															{example}
														</span>
													</li>
												))}
											</ul>
										</div>
									))}
								</div>
							</section>
						)}

						{/* Matching Profile Data */}
						{profile.matchingData &&
							(selectedCategory === "all" ||
								selectedCategory === "technical") && (
								<section
									className="p-6 rounded-2xl md:col-span-2"
									style={{
										backgroundColor: "var(--bg-card)",
										boxShadow: "var(--shadow-lg)",
									}}
								>
									<h3
										className="text-xl font-bold mb-4"
										style={{ color: "var(--primary-900)" }}
									>
										Assignment Matching Profile
									</h3>
									<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
										<div
											className="p-4 rounded-lg"
											style={{ backgroundColor: "var(--success-100)" }}
										>
											<h4
												className="font-semibold mb-2"
												style={{ color: "var(--text-primary)" }}
											>
												Preferred Assignments
											</h4>
											<div className="flex flex-wrap gap-2">
												{profile.matchingData.preferredAssignmentTypes.map(
													(type, i) => (
														<span
															key={i}
															className="px-2 py-1 rounded text-sm"
															style={{
																backgroundColor: "var(--success-600)",
																color: "var(--text-inverse)",
															}}
														>
															{type}
														</span>
													),
												)}
											</div>
										</div>

										<div
											className="p-4 rounded-lg"
											style={{ backgroundColor: "var(--warning-100)" }}
										>
											<h4
												className="font-semibold mb-2"
												style={{ color: "var(--text-primary)" }}
											>
												Areas to Avoid
											</h4>
											<div className="flex flex-wrap gap-2">
												{profile.matchingData.avoidAssignmentTypes.map(
													(type, i) => (
														<span
															key={i}
															className="px-2 py-1 rounded text-sm"
															style={{
																backgroundColor: "var(--warning-600)",
																color: "var(--text-inverse)",
															}}
														>
															{type}
														</span>
													),
												)}
											</div>
										</div>

										<div
											className="p-4 rounded-lg"
											style={{ backgroundColor: "var(--info-100)" }}
										>
											<h4
												className="font-semibold mb-2"
												style={{ color: "var(--text-primary)" }}
											>
												Work Preferences
											</h4>
											<ul
												className="space-y-1 text-sm"
												style={{ color: "var(--text-secondary)" }}
											>
												<li>
													• Team Size: {profile.matchingData.idealTeamSize}
												</li>
												<li>• Style: {profile.matchingData.workStyle}</li>
												<li>
													• Communication:{" "}
													{profile.matchingData.communicationStyle}
												</li>
											</ul>
										</div>
									</div>
								</section>
							)}
					</div>
				</div>
			)}

			{/* Profile Card Mode */}
			{viewMode === "card" && (
				<div className="max-w-2xl mx-auto">
					<div
						ref={profileRef}
						className="relative p-8 rounded-3xl"
						style={{
							background:
								"linear-gradient(135deg, var(--primary-50), var(--accent-100))",
							boxShadow: "var(--shadow-xl)",
							border: "2px solid var(--primary-300)",
						}}
					>
						{/* Decorative Badge */}
						<div
							className="absolute -top-4 -right-4 w-24 h-24 rounded-full flex items-center justify-center"
							style={{
								background:
									"linear-gradient(135deg, var(--accent-700), var(--accent-500))",
								boxShadow: "var(--shadow-lg)",
							}}
						>
							<Award className="h-12 w-12 text-white" />
						</div>

						{/* Profile Header */}
						<div className="mb-6">
							<h2
								className="text-3xl font-bold mb-2"
								style={{ color: "var(--primary-900)" }}
							>
								{profile.displayName}
							</h2>
							{profile.title && (
								<p
									className="text-lg"
									style={{ color: "var(--text-secondary)" }}
								>
									{profile.title}
								</p>
							)}
							<div className="flex items-center gap-3 mt-3">
								<div className="flex items-center gap-1">
									<Heart
										className="h-5 w-5"
										style={{ color: "var(--error-600)" }}
									/>
									<span
										className="font-semibold"
										style={{ color: "var(--text-primary)" }}
									>
										{wellnessScore}% Wellness Score
									</span>
								</div>
								<span style={{ color: "var(--text-tertiary)" }}>•</span>
								<span style={{ color: "var(--text-secondary)" }}>
									{profile.specialties.length} Specializations
								</span>
							</div>
						</div>

						{/* Core Strengths Highlight */}
						<div
							className="mb-6 p-4 rounded-2xl"
							style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
						>
							<h3
								className="font-semibold mb-3"
								style={{ color: "var(--primary-900)" }}
							>
								Core Strengths
							</h3>
							<div className="flex flex-wrap gap-2">
								{profile.topStrengths.map((strength, index) => (
									<div
										key={index}
										className="px-3 py-2 rounded-lg flex items-center gap-2"
										style={{
											backgroundColor: "var(--primary-100)",
											border: "1px solid var(--primary-300)",
										}}
									>
										<Star
											className="h-4 w-4"
											style={{ color: "var(--accent-700)" }}
											fill="currentColor"
										/>
										<span
											className="font-medium"
											style={{ color: "var(--primary-800)" }}
										>
											{strength}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* Key Metrics */}
						<div className="grid grid-cols-3 gap-4 mb-6">
							<div className="text-center">
								<div
									className="text-2xl font-bold"
									style={{ color: "var(--primary-800)" }}
								>
									95%
								</div>
								<div
									className="text-sm"
									style={{ color: "var(--text-secondary)" }}
								>
									Active Listening
								</div>
							</div>
							<div className="text-center">
								<div
									className="text-2xl font-bold"
									style={{ color: "var(--primary-800)" }}
								>
									92%
								</div>
								<div
									className="text-sm"
									style={{ color: "var(--text-secondary)" }}
								>
									Team Collaboration
								</div>
							</div>
							<div className="text-center">
								<div
									className="text-2xl font-bold"
									style={{ color: "var(--primary-800)" }}
								>
									88%
								</div>
								<div
									className="text-sm"
									style={{ color: "var(--text-secondary)" }}
								>
									Adaptability
								</div>
							</div>
						</div>

						{/* Encouraging Message */}
						<div
							className="p-4 rounded-2xl text-center"
							style={{
								backgroundColor: "var(--primary-50)",
								border: "1px solid var(--primary-200)",
							}}
						>
							<Sparkles
								className="h-6 w-6 mx-auto mb-2"
								style={{ color: "var(--accent-700)" }}
							/>
							<p
								className="font-medium"
								style={{ color: "var(--primary-900)" }}
							>
								"You excel in high-pressure scenarios and thrive with team
								assignments. Your cultural sensitivity and emotional
								intelligence make you an invaluable interpreter."
							</p>
						</div>

						{/* QR Code Placeholder */}
						<div className="mt-6 flex justify-center">
							<div
								className="w-24 h-24 rounded-lg flex items-center justify-center"
								style={{
									backgroundColor: "var(--neutral-200)",
									border: "2px solid var(--neutral-300)",
								}}
							>
								<Globe
									className="h-8 w-8"
									style={{ color: "var(--neutral-500)" }}
								/>
							</div>
						</div>

						<p
							className="text-center text-xs mt-2"
							style={{ color: "var(--text-tertiary)" }}
						>
							Scan to view full profile
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-center gap-3 mt-6">
						<button
							onClick={() => handleDownload("png")}
							className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105"
							style={{
								backgroundColor: "var(--primary-700)",
								color: "var(--text-inverse)",
							}}
							aria-label="Download profile card as image"
						>
							<Download className="h-5 w-5" />
							Download Card
						</button>
						<button
							onClick={() => handleDownload("json")}
							className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105"
							style={{
								backgroundColor: "var(--bg-card)",
								color: "var(--primary-700)",
								border: "2px solid var(--primary-700)",
							}}
							aria-label="Export profile data"
						>
							<FileText className="h-5 w-5" />
							Export Data
						</button>
						{onShare && (
							<button
								onClick={() => onShare(profile)}
								className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105"
								style={{
									backgroundColor: "var(--accent-700)",
									color: "var(--text-inverse)",
								}}
								aria-label="Share profile"
							>
								<Share2 className="h-5 w-5" />
								Share Profile
							</button>
						)}
					</div>
				</div>
			)}

			{/* Accessibility Note */}
			<div
				className="p-4 rounded-lg mt-6"
				style={{
					backgroundColor: "var(--info-100)",
					border: "1px solid var(--info-600)",
				}}
				role="region"
				aria-label="Accessibility information"
			>
				<div className="flex items-start gap-3">
					<Shield
						className="h-5 w-5 mt-0.5"
						style={{ color: "var(--info-600)" }}
					/>
					<div>
						<h4
							className="font-semibold mb-1"
							style={{ color: "var(--text-primary)" }}
						>
							Your Profile Data is Secure
						</h4>
						<p className="text-sm" style={{ color: "var(--text-secondary)" }}>
							All profile information is encrypted and stored securely. You
							control who sees your strengths profile. Data is anonymized for
							community comparisons and never shared without your explicit
							consent.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
