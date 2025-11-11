import type { FC } from "react";
import { useState } from "react";
import { ArrowRight, Award, Brain, Check, Clock, GraduationCap, Layers, LineChart, Quote, Shield, Sparkles } from "lucide-react";
import { ModernAuthModal } from "./components/auth/ModernAuthModal";
import Logo from "./components/Logo";

interface LandingPageProps {
	onGetStarted: () => void;
}

const heroBullets = [
	{ label: "Science-backed assessments" },
	{ label: "RID Sponsor #2309" },
	{ label: "5.0+ CEUs available" },
];

const statHighlights = [
	{ value: "16", label: "Research Frameworks" },
	{ value: "5.0+", label: "CEUs Available" },
	{ value: "24/7", label: "AI Performance Support" },
];

const performanceCards = [
	{
		title: "Your Performance Foundation: The ECCI™ Framework",
		description:
			"Our proprietary ECCI™ Framework (Emotional & Cultural Competencies for Interpreters) uses 16 research-backed methods to measure how your brain handles cognitive load, cultural processing, and performance growth.",
		icon: Layers,
	},
	{
		title: "Catalyst: Your AI Performance Partner",
		description:
			"Get personalized recommendations 24/7. Catalyst analyzes your cognitive patterns and suggests practical strategies to optimize your capacity. Built on the ECCI™ framework. Your data is 100% private.",
		icon: Brain,
	},
	{
		title: "RID-Approved Certification",
		description:
			"Earn RID-approved CEUs across multiple categories through Building Bridges Global, LLC (Sponsor #2309), including the new “Studies of Healthy Minds & Bodies” category—active now.",
		icon: Award,
	},
];

const audienceCards = [
	{
		title: "Conference & VRS Interpreters",
		description:
			"Stabilize performance through rapid reset plans, post-shift recovery protocols, and environmental fatigue safeguards built for high-frequency switch tasks.",
		icon: Clock,
	},
	{
		title: "Healthcare & Legal Specialists",
		description:
			"Translate high-stakes accuracy into confident decisions with reflection scaffolds, stress dosing, and boundary scripts that honor neutral roles.",
		icon: Shield,
	},
	{
		title: "Emerging & Mentoring Professionals",
		description:
			"Strengthen decision-making with growth dashboards, CEU pathways, and skill reinforcement that connect practice to measurable outcomes.",
		icon: LineChart,
	},
];

const ecciPillars = [
	{
		title: "Cognitive Load Calibration",
		description:
			"Spot overload risks early and rebalance attention using micro-adjustments that keep you sharp throughout the assignment.",
	},
	{
		title: "Emotional Regulation & Recovery",
		description:
			"Transform emotional labor into structured recovery rituals so you can reset faster after difficult sessions.",
	},
	{
		title: "Cultural Agility in Real Time",
		description:
			"Stay responsive to cultural nuance while maintaining the accuracy and neutrality your role demands.",
	},
	{
		title: "Capacity Growth Tracking",
		description:
			"Track how your performance capacity expands over time so you can take on complex work without burning out.",
	},
];

const protocolSteps = [
	{
		title: "Step 1: Establish Performance Baseline",
		description: "Take a 15-minute assessment. Get your personalized performance profile with specific metrics.",
	},
	{
		title: "Step 2: Track Performance Metrics",
		description: "Log your daily performance: baseline checks, post-assignment reflections, and capacity tracking—all included in your platform access.",
	},
	{
		title: "Step 3: Earn Professional Credits",
		description: "Purchase CEU bundles to certify your professional development while building sustainable practice habits.",
	},
];

const dataDrivenStats = [
	{
		value: "24%",
		label: "of interpreters meet clinical burnout criteria, even with existing wellness efforts.",
	},
	{
		value: "41.5%",
		label: "report vicarious trauma symptoms without structured post-assignment recovery.",
	},
	{
		value: "57.5%",
		label: "experience imposter syndrome that undermines confident decision-making.",
	},
	{
		value: "3 in 5",
		label: "cite unclear performance metrics as a barrier to sustainable growth.",
	},
];

const LandingPageEnhanced: FC<LandingPageProps> = ({ onGetStarted }) => {
	const [authModalOpen, setAuthModalOpen] = useState(false);

	const handlePrimaryCta = () => {
		onGetStarted();
	};

	return (
		<div className="flex min-h-screen flex-col bg-[#F8F4EC] text-slate-900">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
			>
				Skip to main content
			</a>

			<header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur">
				<div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<Logo size="md" showTagline />
					<nav aria-label="Primary navigation" className="hidden gap-8 text-sm font-semibold text-slate-600 md:flex">
						<a href="#performance" className="hover:text-slate-900">
							Platform
						</a>
						<a href="#ecci-framework" className="hover:text-slate-900">
							ECCI™
						</a>
						<a href="#protocol" className="hover:text-slate-900">
							How it Works
						</a>
						<a href="#data" className="hover:text-slate-900">
							Results
						</a>
					</nav>
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => setAuthModalOpen(true)}
							className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900 md:inline-flex"
						>
							Sign In
						</button>
						<button
							type="button"
							onClick={handlePrimaryCta}
							className="inline-flex items-center rounded-full bg-[#5C7F4F] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A6B3E]"
						>
							Start Your Performance Assessment
							<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
						</button>
					</div>
				</div>
			</header>

			<main id="main-content" className="flex-1">
				<section className="bg-gradient-to-b from-white via-[#FDF8F0] to-[#F6F1E7] py-20">
					<div className="mx-auto grid w-full max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
						<div className="flex flex-col justify-center space-y-8">
							<div className="inline-flex items-center gap-2 self-start rounded-full border border-[#C6B89E] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#5C7F4F]">
								<Sparkles className="h-4 w-4" aria-hidden="true" />
								Trusted by Interpreters Nationwide
							</div>
							<div>
								<h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
									Perform at Your Peak. Every Assignment.
								</h1>
								<p className="mt-6 text-lg leading-relaxed text-slate-700 sm:text-xl">
									Stop guessing about your performance. Get AI-powered insights backed by neuroscience to manage cognitive load, prevent burnout, and grow your capacity—with RID-approved CEUs included.
								</p>
							</div>
							<ul className="grid gap-3 sm:grid-cols-3 sm:gap-4" aria-label="Platform credibility highlights">
								{heroBullets.map((item) => (
									<li key={item.label} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
										<Check className="h-4 w-4 text-[#5C7F4F]" aria-hidden="true" />
										{item.label}
									</li>
								))}
							</ul>
							<div className="flex flex-wrap items-center gap-4">
								<button
									type="button"
									onClick={handlePrimaryCta}
									className="inline-flex items-center rounded-full bg-[#5C7F4F] px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-[#4A6B3E]"
								>
									Start Your Performance Assessment
									<ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
								</button>
								<button
									type="button"
									onClick={() => setAuthModalOpen(true)}
									className="inline-flex items-center rounded-full border border-[#5C7F4F] px-6 py-3 text-base font-semibold text-[#5C7F4F] transition hover:bg-[#EFF3EC]"
								>
									Preview the Platform
								</button>
							</div>
							<p className="text-sm text-slate-600">
								Includes 15-minute baseline assessment • Private by design • RID Sponsor #2309
							</p>
						</div>
						<div className="relative isolate overflow-hidden rounded-3xl border border-[#E3D7C4] bg-white p-8 shadow-xl">
							<div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-b from-[#DDE7D3] via-[#CFE1C6] to-[#F9F5EC]" aria-hidden="true" />
							<div className="relative space-y-6">
								<div className="flex items-center gap-3 text-sm font-semibold text-[#5C7F4F]">
									<Brain className="h-5 w-5" aria-hidden="true" />
									ECCI™ Insight Snapshot
								</div>
								<div className="space-y-4 rounded-2xl border border-[#E7DEC9] bg-[#FCFAF6] p-6">
									<p className="text-sm font-semibold text-slate-700">Cognitive Load Index</p>
									<div className="flex items-end justify-between">
										<span className="text-4xl font-bold text-[#5C7F4F]">82%</span>
										<span className="text-sm text-slate-600">Balanced with micro-adjustments</span>
									</div>
									<div className="h-2 rounded-full bg-[#E6E2D9]">
										<div className="h-2 w-[82%] rounded-full bg-[#5C7F4F]" />
									</div>
								</div>
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="rounded-2xl border border-[#E7DEC9] bg-white p-4">
										<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Strength Spotlight</p>
										<p className="mt-3 text-sm font-semibold text-slate-900">Emotional Regulation</p>
										<p className="mt-2 text-sm text-slate-600">Recovery window averages 11 minutes. Maintain with quick reset rituals.</p>
									</div>
									<div className="rounded-2xl border border-[#E7DEC9] bg-white p-4">
										<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next Move</p>
										<p className="mt-3 text-sm font-semibold text-slate-900">Boundary Reinforcement</p>
										<p className="mt-2 text-sm text-slate-600">Activate Catalyst script before highly charged sessions to protect focus.</p>
									</div>
								</div>
								<p className="text-xs text-slate-500">
									Every insight is generated from the ECCI™ research engine—grounded in neuroscience, interpreter workload studies, and cultural competence research.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section aria-label="Platform stats" className="border-y border-[#E4D8C6] bg-white py-8">
					<div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-10 px-4 text-center sm:gap-16">
						{statHighlights.map((stat) => (
							<div key={stat.label} className="space-y-1">
								<p className="text-3xl font-bold text-[#5C7F4F]">{stat.value}</p>
								<p className="text-xs uppercase tracking-wide text-slate-600">{stat.label}</p>
							</div>
						))}
					</div>
				</section>

				<section id="performance" className="bg-[#FBF7F1] py-20">
					<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-3xl text-center">
							<h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything You Need to Optimize Performance</h2>
							<p className="mt-4 text-lg text-slate-600">
								Build clarity, confidence, and measurable momentum with the only interpreter performance system built on the ECCI™ Framework.
							</p>
						</div>
						<div className="mt-12 grid gap-8 md:grid-cols-3">
							{performanceCards.map(({ title, description, icon: Icon }) => (
								<article key={title} className="flex h-full flex-col rounded-3xl border border-[#E6D9C4] bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF4EA] text-[#5C7F4F]">
										<Icon className="h-6 w-6" aria-hidden="true" />
									</div>
									<h3 className="mt-6 text-xl font-semibold text-slate-900">{title}</h3>
									<p className="mt-4 text-sm leading-relaxed text-slate-600">{description}</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section className="bg-white py-20">
					<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-3xl text-center">
							<h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Built for Every Interpreting Professional</h2>
							<p className="mt-4 text-lg text-slate-600">
								Whether you are signing, voicing, remote, or on-site—InterpretReflect adapts to your context so you can stay present, precise, and well.
							</p>
						</div>
						<div className="mt-12 grid gap-8 md:grid-cols-3">
							{audienceCards.map(({ title, description, icon: Icon }) => (
								<article key={title} className="flex h-full flex-col rounded-3xl border border-[#E6D9C4] bg-[#FDFBF6] p-8 transition hover:-translate-y-1 hover:border-[#5C7F4F] hover:bg-white">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5C7F4F]/10 text-[#5C7F4F]">
										<Icon className="h-5 w-5" aria-hidden="true" />
									</div>
									<h3 className="mt-6 text-lg font-semibold text-slate-900">{title}</h3>
									<p className="mt-4 text-sm text-slate-600">{description}</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section className="bg-[#FBF7F1] py-20">
					<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
						<div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
							<div>
								<h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Interpreter Voices, Unfiltered</h2>
								<p className="mt-4 text-lg text-slate-600">
									Community trust matters more than any framework. Hear from interpreters managing heavy workloads while staying grounded in their craft.
								</p>
							</div>
							<div className="grid gap-6">
								<figure className="rounded-3xl border border-[#E6D9C4] bg-white p-8 shadow-sm">
									<div className="flex items-center gap-3 text-[#5C7F4F]">
										<Quote className="h-5 w-5" aria-hidden="true" />
										<span className="text-xs font-semibold uppercase tracking-wide">Practicing Interpreter</span>
									</div>
									<blockquote className="mt-4 text-lg font-medium text-slate-900">
										“Catalyst tells me exactly which part of the assignment stretched me, then shows how to reset before my next call. I’m finally logging CEUs without sacrificing recovery.”
									</blockquote>
									<figcaption className="mt-4 text-sm text-slate-600">
										Maria Lopez, Freelance Medical Interpreter
									</figcaption>
								</figure>
								<figure className="rounded-3xl border border-[#E6D9C4] bg-white p-8 shadow-sm">
									<div className="flex items-center gap-3 text-[#5C7F4F]">
										<Quote className="h-5 w-5" aria-hidden="true" />
										<span className="text-xs font-semibold uppercase tracking-wide">Research & Development</span>
									</div>
									<blockquote className="mt-4 text-lg font-medium text-slate-900">
										“The ECCI™ Framework finally gives interpreters academic legitimacy. It connects cognitive science, cultural fluency, and emotional resilience into one measurable system.”
									</blockquote>
									<figcaption className="mt-4 text-sm text-slate-600">
										Sarah Wheeler, Creator of the ECCI™ Framework
									</figcaption>
								</figure>
							</div>
						</div>
					</div>
				</section>

				<section className="bg-white py-20">
					<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
						<div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
							<div className="space-y-6">
								<h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">New RID Professional Category</h2>
								<p className="inline-flex items-center rounded-full bg-[#EEF4EA] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#5C7F4F]">
									Available Now
								</p>
								<p className="text-lg text-slate-600">
									InterpretReflect is approved to deliver CEUs in this new category, helping you document your professional development in cognitive wellness and capacity building.
								</p>
								<div className="flex items-center gap-3 rounded-2xl border border-[#E6D9C4] bg-[#FCFAF6] p-4 text-sm font-semibold text-slate-700">
									<GraduationCap className="h-5 w-5 text-[#5C7F4F]" aria-hidden="true" />
									Includes “Studies of Healthy Minds & Bodies” CEUs through Building Bridges Global, LLC (RID Sponsor #2309)
								</div>
							</div>
							<div className="rounded-3xl border border-[#E6D9C4] bg-[#FDFBF6] p-8 shadow-sm">
								<h3 className="text-xl font-semibold text-slate-900">CEU Pathways Inside the Platform</h3>
								<ul className="mt-6 space-y-4 text-sm text-slate-600">
									<li className="flex items-start gap-3">
										<Check className="mt-1 h-4 w-4 text-[#5C7F4F]" aria-hidden="true" />
										<span>Baseline and follow-up assessments automatically document completion evidence.</span>
									</li>
									<li className="flex items-start gap-3">
										<Check className="mt-1 h-4 w-4 text-[#5C7F4F]" aria-hidden="true" />
										<span>Post-assignment reflections align to RID’s “Studies of Healthy Minds & Bodies.”</span>
									</li>
									<li className="flex items-start gap-3">
										<Check className="mt-1 h-4 w-4 text-[#5C7F4F]" aria-hidden="true" />
										<span>Downloadable certificates and growth summaries ready for audits.</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</section>

				<section id="ecci-framework" className="bg-[#FBF7F1] py-20">
					<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-3xl text-center">
							<h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">The ECCI™ Framework</h2>
							<p className="mt-2 text-lg font-semibold text-[#5C7F4F]">Emotional & Cultural Competencies for Interpreters</p>
							<p className="mt-4 text-lg text-slate-600">
								Our framework combines 16 neuroscience-based methods that measure how you process information, manage cultural context, regulate emotional labor, and maintain mental capacity during interpreting.
							</p>
						</div>
						<div className="mt-12 grid gap-6 md:grid-cols-2">
							{ecciPillars.map((pillar) => (
								<div key={pillar.title} className="rounded-3xl border border-[#E6D9C4] bg-white p-6 shadow-sm">
									<h3 className="text-lg font-semibold text-slate-900">{pillar.title}</h3>
									<p className="mt-3 text-sm text-slate-600">{pillar.description}</p>
								</div>
							))}
						</div>
						<div className="mt-12 rounded-3xl border border-[#E6D9C4] bg-[#FDFBF6] p-8">
							<h3 className="text-lg font-semibold text-slate-900">Research Foundation</h3>
							<p className="mt-4 text-sm text-slate-600">
								Based on cognitive science, interoception research, performance psychology, cultural neuroscience, and interpreter workload studies.
							</p>
						</div>
					</div>
				</section>

				<section id="protocol" className="bg-white py-20">
					<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-3xl text-center">
							<h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Performance Optimization Protocol</h2>
							<p className="mt-4 text-lg text-slate-600">
								A step-by-step path that turns insights into action while earning CEUs.
							</p>
						</div>
						<div className="mt-12 grid gap-8 md:grid-cols-3">
							{protocolSteps.map(({ title, description }) => (
								<article key={title} className="flex h-full flex-col rounded-3xl border border-[#E6D9C4] bg-[#FCFAF6] p-8 text-left shadow-sm">
									<p className="text-xs font-semibold uppercase tracking-wide text-[#5C7F4F]">{title}</p>
									<p className="mt-4 text-sm text-slate-600">{description}</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section id="data" className="bg-[#FBF7F1] py-20">
					<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-3xl text-center">
							<h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">The Data-Driven Case</h2>
							<p className="mt-4 text-lg text-slate-600">
								National studies from 2024-2025 reveal a performance and wellness gap interpreters cannot solve alone.
							</p>
						</div>
						<div className="mt-12 grid gap-6 md:grid-cols-2">
							{dataDrivenStats.map((stat) => (
								<div key={stat.label} className="rounded-3xl border border-[#E6D9C4] bg-white p-8 shadow-sm">
									<p className="text-4xl font-bold text-[#5C7F4F]">{stat.value}</p>
									<p className="mt-4 text-sm text-slate-600">{stat.label}</p>
								</div>
							))}
						</div>
						<p className="mt-10 text-center text-base font-semibold text-slate-700">
							InterpretReflect transforms this research into daily decisions that protect your capacity and prove your impact.
						</p>
					</div>
				</section>

				<section className="bg-[#1F2A24] py-20 text-white">
					<div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
						<h2 className="text-3xl font-bold sm:text-4xl">Ready to See Your Performance Clearly?</h2>
						<p className="mt-4 text-lg text-white/80">
							Turn every assignment into a measurable win with the only interpreter platform built on the ECCI™ Framework.
						</p>
						<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
							<button
								type="button"
								onClick={handlePrimaryCta}
								className="inline-flex items-center rounded-full bg-white px-6 py-3 text-base font-semibold text-[#1F2A24] shadow-lg transition hover:bg-slate-100"
							>
								Start Your Performance Assessment
								<ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
							</button>
							<button
								type="button"
								onClick={() => setAuthModalOpen(true)}
								className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-base font-semibold text-white transition hover:border-white hover:bg-white/10"
							>
								Watch a Guided Walkthrough
							</button>
						</div>
						<p className="mt-6 text-xs uppercase tracking-wider text-white/60">
							Includes private onboarding • Cancel anytime • Built-in CEU documentation
						</p>
					</div>
				</section>
			</main>

			<footer id="footer" className="border-t border-white bg-[#F6F1E7]">
				<div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
					<div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
						<div className="space-y-4">
							<p className="text-sm font-semibold uppercase tracking-wide text-[#5C7F4F]">
								RID Approved Sponsor #2309 | Building Bridges Global, LLC
							</p>
							<h3 className="text-2xl font-bold text-slate-900">InterpretReflect™</h3>
							<p className="text-sm text-slate-600">Turn every assignment into measurable, sustainable performance growth.</p>
						</div>
						<div className="grid gap-6 sm:grid-cols-2">
							<div>
								<p className="text-sm font-semibold text-slate-900">Explore</p>
								<ul className="mt-3 space-y-2 text-sm text-slate-600">
									<li>
										<a className="hover:text-slate-900" href="/about">
											About
										</a>
									</li>
									<li>
										<a className="hover:text-slate-900" href="/research">
											Research
										</a>
									</li>
									<li>
										<a className="hover:text-slate-900" href="/pricing">
											Pricing
										</a>
									</li>
								</ul>
							</div>
							<div>
								<p className="text-sm font-semibold text-slate-900">Support</p>
								<ul className="mt-3 space-y-2 text-sm text-slate-600">
									<li>
										<a className="hover:text-slate-900" href="/privacy">
											Privacy Policy
										</a>
									</li>
									<li>
										<a className="hover:text-slate-900" href="/terms">
											Terms of Service
										</a>
									</li>
									<li>
										<a className="hover:text-slate-900" href="/accessibility">
											Accessibility
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="mt-10 rounded-3xl border border-[#E6D9C4] bg-white p-6 text-sm text-slate-600">
						<strong className="font-semibold text-slate-900">Disclaimer:</strong> InterpretReflect™ is a performance and wellness support platform. It does not replace licensed mental
						health care. If you are experiencing significant distress, please seek support from a qualified professional.
					</div>
					<p className="mt-6 text-xs text-slate-500">© {new Date().getFullYear()} InterpretReflect. All rights reserved.</p>
				</div>
			</footer>

			<ModernAuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode="signin" />
		</div>
	);
};

export default LandingPageEnhanced;
