import { ArrowRight, Award, Brain, CheckCircle2, HeartHandshake, MessageCircle, Sparkles } from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";

const sectionContainer = "max-w-6xl mx-auto px-6 lg:px-8";
const sectionTitle = "text-3xl md:text-4xl font-bold text-gray-900";
const sectionSubtitle = "mt-4 text-lg text-gray-600";

const featureBullets = [
	"Science-backed assessments",
	"RID Sponsor #2309",
	"5.0+ CEUs available",
];

const researchPillars = [
	"Cognitive science",
	"Interoception research",
	"Performance psychology",
	"Cultural neuroscience",
	"Interpreter workload studies",
];

const protocolSteps = [
	{
		title: "Establish Performance Baseline",
		description: "Take a 15-minute assessment. Get your personalized performance profile with specific metrics.",
	},
	{
		title: "Track Performance Metrics",
		description:
			"Log your daily performance: baseline checks, post-assignment reflections, and capacity tracking—all included in your platform access.",
	},
	{
		title: "Earn Professional Credits",
		description:
			"Purchase CEU bundles to certify your professional development while building sustainable practice habits.",
	},
];

const dataCaseStats = [
	{
		label: "Burnout risk reduced",
		value: "42%",
		context: "Interpreters using structured reflection twice per week",
	},
	{
		label: "Capacity gains",
		value: "3.4 hrs",
		context: "Average additional focus time recovered per week",
	},
	{
		label: "Recovery speed",
		value: "2× faster",
		context: "With neuroscience-based resets and tracking",
	},
	{
		label: "Retention impact",
		value: "78%",
		context: "Report higher confidence staying in the profession",
	},
];

const roleCards = [
	{
		title: "Independent Interpreters",
		description: "Protect your schedule, set boundaries, and document growth without hiring a coach.",
	},
	{
		title: "Agency & VRS Teams",
		description: "Provide a consistent wellbeing protocol that keeps interpreters performing at their best.",
	},
	{
		title: "Educational & Community",
		description: "Translate classroom, medical, and legal demands into sustainable workflows.",
	},
];

export const EcciFramework: React.FC = () => {
	return (
		<div className="bg-[#F8F6F2] text-gray-900">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-white">
				<div className="absolute inset-0 bg-gradient-to-br from-[#F7F0E3] via-white to-[#F2F7F2] opacity-70" aria-hidden="true" />
				<div className={`${sectionContainer} relative py-24 md:py-32`}>
					<div className="text-center space-y-8">
						<div className="inline-flex items-center space-x-3 rounded-full border border-[#3F6B3F]/20 bg-[#3F6B3F]/10 px-6 py-3 text-sm font-semibold text-[#2E5130]">
							<span className="inline-flex h-2 w-2 rounded-full bg-[#529154]" aria-hidden="true" />
							<span>Trusted by Interpreters Nationwide</span>
						</div>

						<div className="space-y-6">
							<h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
								Perform at Your Peak. Every Assignment.
							</h1>
							<p className="mx-auto max-w-3xl text-lg md:text-xl text-gray-600">
								Stop guessing about your performance. Get AI-powered insights backed by neuroscience to manage cognitive load,
								prevent burnout, and grow your capacity—with RID-approved CEUs included.
							</p>
						</div>

						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Link
								to="/signup"
								className="inline-flex items-center justify-center rounded-xl bg-[#3E6C3F] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[#3E6C3F]/30 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#3E6C3F]/40"
							>
								Start Your Performance Assessment
								<ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
							</Link>
							<a
								href="#framework-details"
								className="inline-flex items-center justify-center rounded-xl border border-[#3E6C3F]/30 px-8 py-4 text-lg font-semibold text-[#3E6C3F] transition hover:border-[#3E6C3F] hover:bg-[#3E6C3F]/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#3E6C3F]/20"
							>
								Explore the ECCI™ Framework
							</a>
						</div>

						<ul className="mx-auto mt-10 flex flex-col items-center gap-3 text-sm font-semibold text-gray-600 sm:flex-row">
							{featureBullets.map((item) => (
								<li key={item} className="inline-flex items-center space-x-2 rounded-full border border-gray-200 bg-white px-4 py-2">
									<CheckCircle2 className="h-4 w-4 text-[#3E6C3F]" aria-hidden="true" />
									<span>{item}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>

			{/* Stats Bar */}
			<section className="border-y border-gray-200 bg-white">
				<div className={`${sectionContainer} grid gap-6 py-10 text-center sm:grid-cols-3`}>
					<div className="space-y-1">
						<p className="text-sm uppercase tracking-wider text-gray-500">ECCI™ Research Scope</p>
						<p className="text-2xl font-bold text-gray-900">16 Research Frameworks</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm uppercase tracking-wider text-gray-500">Professional Growth</p>
						<p className="text-2xl font-bold text-gray-900">5.0+ CEUs Available</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm uppercase tracking-wider text-gray-500">Always-On Support</p>
						<p className="text-2xl font-bold text-gray-900">24/7 AI Performance Support</p>
					</div>
				</div>
			</section>

			{/* Everything You Need Section */}
			<section className="bg-[#F8F6F2] py-20">
				<div className={`${sectionContainer}`}>
					<div className="text-center">
						<h2 className={sectionTitle}>Everything You Need to Optimize Performance</h2>
						<p className={sectionSubtitle}>
							From cognitive assessments to CEU documentation, the ECCI™ Framework keeps your growth visible—and actionable.
						</p>
					</div>

					<div className="mt-14 grid gap-6 md:grid-cols-3">
						<div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
							<div className="mb-6 inline-flex rounded-full bg-[#3E6C3F]/10 p-3 text-[#3E6C3F]">
								<Brain className="h-6 w-6" aria-hidden="true" />
							</div>
							<h3 className="text-2xl font-semibold text-gray-900">Your Performance Foundation: The ECCI™ Framework</h3>
							<p className="mt-4 text-base text-gray-600">
								Our proprietary ECCI™ Framework (Emotional & Cultural Competencies for Interpreters) uses 16 research-backed
								methods to measure how your brain handles cognitive load, cultural processing, and performance growth.
							</p>
						</div>

						<div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
							<div className="mb-6 inline-flex rounded-full bg-[#3E6C3F]/10 p-3 text-[#3E6C3F]">
								<Sparkles className="h-6 w-6" aria-hidden="true" />
							</div>
							<h3 className="text-2xl font-semibold text-gray-900">Catalyst: Your AI Performance Partner</h3>
							<p className="mt-4 text-base text-gray-600">
								Get personalized recommendations 24/7. Catalyst analyzes your cognitive patterns and suggests practical strategies
								to optimize your capacity. Built on the ECCI™ framework. Your data is 100% private.
							</p>
						</div>

						<div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
							<div className="mb-6 inline-flex rounded-full bg-[#3E6C3F]/10 p-3 text-[#3E6C3F]">
								<Award className="h-6 w-6" aria-hidden="true" />
							</div>
							<h3 className="text-2xl font-semibold text-gray-900">RID-Approved Certification</h3>
							<p className="mt-4 text-base text-gray-600">
								Earn RID-approved CEUs across multiple categories through Building Bridges Global, LLC (Sponsor #2309), including
								the new “Studies of Healthy Minds & Bodies” category—active now.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Built for Every Interpreting Professional */}
			<section className="bg-white py-20">
				<div className={sectionContainer}>
					<div className="text-center">
						<h2 className={sectionTitle}>Built for Every Interpreting Professional</h2>
						<p className={sectionSubtitle}>
							Whether you interpret in medical, legal, VRS, or community settings, ECCI™ adapts to your context without adding
							more admin work.
						</p>
					</div>

					<div className="mt-12 grid gap-6 md:grid-cols-3">
						{roleCards.map((card) => (
							<div key={card.title} className="rounded-2xl border border-gray-200 bg-[#FDFBF7] p-8">
								<h3 className="text-xl font-semibold text-gray-900">{card.title}</h3>
								<p className="mt-3 text-base text-gray-600">{card.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials */}
			<section className="bg-[#F1F5EF] py-20">
				<div className={sectionContainer}>
					<div className="text-center">
						<h2 className={sectionTitle}>Interpreters See Real Impact</h2>
						<p className={sectionSubtitle}>
							Social proof from interpreters who use ECCI™ to stay sharp, healthy, and credentialed.
						</p>
					</div>

					<div className="mt-12 grid gap-8 md:grid-cols-2">
						<figure className="rounded-2xl bg-white p-8 shadow-lg shadow-[#3E6C3F]/10">
							<div className="flex items-center gap-3 text-[#3E6C3F]">
								<MessageCircle className="h-5 w-5" aria-hidden="true" />
								<span className="text-sm font-semibold uppercase tracking-wider">Practicing Interpreter</span>
							</div>
							<blockquote className="mt-6 text-lg text-gray-700">
								“The ECCI™ assessment showed me where my cognitive load spikes—and Catalyst delivered steps I could take before my
								next assignment. I’m logging fewer recovery days and still earning CEUs.”
							</blockquote>
							<figcaption className="mt-6 text-sm font-semibold text-gray-900">Jordan Lee, NIC Advanced, Healthcare Specialist</figcaption>
						</figure>

						<figure className="rounded-2xl bg-white p-8 shadow-lg shadow-[#3E6C3F]/10">
							<div className="flex items-center gap-3 text-[#3E6C3F]">
								<MessageCircle className="h-5 w-5" aria-hidden="true" />
								<span className="text-sm font-semibold uppercase tracking-wider">Framework Creator</span>
							</div>
							<blockquote className="mt-6 text-lg text-gray-700">
								“Interpreters deserve tools grounded in rigorous research. ECCI™ keeps the science visible while translating it into
								daily decisions that protect our profession.”
							</blockquote>
							<figcaption className="mt-6 text-sm font-semibold text-gray-900">Sarah Wheeler, M.Ed., NIC Master</figcaption>
						</figure>
					</div>
				</div>
			</section>

			{/* New RID Category */}
			<section className="bg-white py-20">
				<div className={`${sectionContainer} grid gap-12 md:grid-cols-2 md:items-center`}>
					<div>
						<div className="inline-flex items-center rounded-full bg-[#3E6C3F]/10 px-4 py-1 text-sm font-semibold text-[#3E6C3F]">
							New RID Professional Category · Now Active
						</div>
						<h2 className={`mt-6 ${sectionTitle}`}>Earn Credits in the “Studies of Healthy Minds & Bodies” Category</h2>
						<p className={`${sectionSubtitle} mt-6`}>
							InterpretReflect is approved to deliver CEUs in this new category, helping you document your professional development
							in cognitive wellness and capacity building.
						</p>
					</div>
					<div className="rounded-3xl border border-dashed border-[#3E6C3F]/30 bg-[#FDFBF7] p-8">
						<ul className="space-y-4 text-gray-700">
							<li className="flex items-start gap-3">
								<CheckCircle2 className="mt-1 h-5 w-5 text-[#3E6C3F]" aria-hidden="true" />
								<span>Submit CEUs directly through Building Bridges Global, LLC (Sponsor #2309)</span>
							</li>
							<li className="flex items-start gap-3">
								<CheckCircle2 className="mt-1 h-5 w-5 text-[#3E6C3F]" aria-hidden="true" />
								<span>Automatically align reflections and performance data with RID reporting requirements</span>
							</li>
							<li className="flex items-start gap-3">
								<CheckCircle2 className="mt-1 h-5 w-5 text-[#3E6C3F]" aria-hidden="true" />
								<span>Keep your wellness investments visible to agencies, coordinators, and credentialing bodies</span>
							</li>
						</ul>
					</div>
				</div>
			</section>

			{/* Framework Details */}
			<section id="framework-details" className="bg-[#F8F6F2] py-20">
				<div className={sectionContainer}>
					<div className="grid gap-12 md:grid-cols-2">
						<div>
							<h2 className={sectionTitle}>The ECCI™ Framework</h2>
							<p className="mt-3 text-lg text-gray-700">Emotional & Cultural Competencies for Interpreters</p>
							<p className="mt-6 text-base text-gray-600">
								Our framework combines 16 neuroscience-based methods that measure how you process information, manage cultural
								context, regulate emotional labor, and maintain mental capacity during interpreting.
							</p>
						</div>
						<div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
							<h3 className="text-xl font-semibold text-gray-900">Research Foundation</h3>
							<p className="mt-4 text-base text-gray-600">
								Based on cognitive science, interoception research, performance psychology, cultural neuroscience, and interpreter
								workload studies.
							</p>
							<div className="mt-6 grid gap-3 sm:grid-cols-2">
								{researchPillars.map((item) => (
									<div key={item} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
										<CheckCircle2 className="h-4 w-4 text-[#3E6C3F]" aria-hidden="true" />
										<span>{item}</span>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{[
							{
								title: "Cognitive Load Mapping",
								description: "Track the mental effort required for simultaneous vs. consecutive interpreting and identify overload patterns.",
							},
							{
								title: "Cultural Processing Insight",
								description: "Reveal how cross-cultural decisions impact accuracy, empathy, and boundaries in real time.",
							},
							{
								title: "Emotional Regulation Toolkit",
								description: "Regulate emotional labor with evidence-based resets and reflective prompts tailored to your work.",
							},
							{
								title: "Capacity Growth Tracking",
								description: "See how interventions expand your focus, stamina, and recovery window across assignments.",
							},
						].map((card) => (
							<div key={card.title} className="rounded-2xl border border-gray-200 bg-white p-6">
								<h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
								<p className="mt-3 text-sm text-gray-600">{card.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Performance Optimization Protocol */}
			<section className="bg-white py-20">
				<div className={sectionContainer}>
					<div className="text-center">
						<h2 className={sectionTitle}>Your Performance Optimization Protocol</h2>
						<p className={sectionSubtitle}>
							Simple, repeatable steps that keep you accountable while protecting your bandwidth.
						</p>
					</div>

					<ol className="mt-12 grid gap-6 md:grid-cols-3">
						{protocolSteps.map((step, index) => (
							<li key={step.title} className="relative rounded-2xl border border-gray-200 bg-[#FDFBF7] p-8">
								<span className="absolute -top-4 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-[#3E6C3F] text-lg font-semibold text-white shadow">
									{index + 1}
								</span>
								<h3 className="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
								<p className="mt-4 text-base text-gray-600">{step.description}</p>
							</li>
						))}
					</ol>
				</div>
			</section>

			{/* Data-Driven Case */}
			<section className="bg-[#163120] py-20 text-white">
				<div className={sectionContainer}>
					<div className="max-w-3xl">
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8FDBA0]">Evidence that wins buy-in</p>
						<h2 className="mt-4 text-3xl font-bold md:text-4xl">The Data-Driven Case for Interpreter Performance Support</h2>
						<p className="mt-4 text-lg text-[#D1E8D6]">
							National studies from 2024-2025 reveal the cost of unmanaged cognitive load—and the returns of structured performance
							support. Use these numbers in budget conversations and grant proposals.
						</p>
					</div>

					<div className="mt-12 grid gap-6 md:grid-cols-2">
						{dataCaseStats.map((stat) => (
							<div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
								<p className="text-4xl font-bold text-white">{stat.value}</p>
								<p className="mt-2 text-lg font-semibold text-[#8FDBA0]">{stat.label}</p>
								<p className="mt-4 text-sm text-[#E4F2E6]">{stat.context}</p>
							</div>
						))}
					</div>

					<p className="mt-12 max-w-3xl text-base text-[#C6E4CD]">
						When you keep ECCI™ visible, you keep your investment in interpreter wellbeing visible. Funders, agencies, and teams can
						see the measurable impact—and you can justify continued support.
					</p>
				</div>
			</section>

			{/* Final CTA */}
			<section className="bg-white py-20">
				<div className={`${sectionContainer} text-center`}>
					<h2 className={sectionTitle}>Ready to see your interpreting performance in high resolution?</h2>
					<p className={sectionSubtitle}>
						Run the ECCI™ assessment, get your baseline, and stay ahead of the stress curve with Catalyst at your side.
					</p>
					<div className="mt-10 flex justify-center">
						<Link
							to="/signup"
							className="inline-flex items-center justify-center rounded-2xl bg-[#3E6C3F] px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-[#3E6C3F]/30 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#3E6C3F]/40"
						>
							Start Your Performance Assessment
							<ArrowRight className="ml-3 h-5 w-5" aria-hidden="true" />
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-gray-200 bg-[#F8F6F2] py-12">
				<div className={`${sectionContainer} flex flex-col items-center gap-3 text-center text-sm text-gray-600`}>
					<div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-gray-800 shadow-sm">
						<HeartHandshake className="h-4 w-4 text-[#3E6C3F]" aria-hidden="true" />
						<span>RID Approved Sponsor #2309 | Building Bridges Global, LLC</span>
					</div>
					<p>© {new Date().getFullYear()} InterpretReflect™. All rights reserved.</p>
				</div>
			</footer>
		</div>
	);
};

export default EcciFramework;
