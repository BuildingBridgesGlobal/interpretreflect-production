import type React from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Award,
	Brain,
	CheckCircle2,
	Sparkles,
	Target,
} from "lucide-react";
import { ModernAuthModal } from "./components/auth/ModernAuthModal";
import { Footer } from "./components/Footer";
import Logo from "./components/Logo";
import PricingModal from "./components/PricingModal";
import WaitlistModal from "./components/WaitlistModal";
import { useAuth } from "./contexts/AuthContext";

interface LandingPageProps {
	onGetStarted: () => void;
}

const palette = {
	background: "#F7F9FB",
	foreground: "#0F172A",
	subtle: "#1E293B",
	primary: "#2D5F3F",
	primaryLight: "#4D8262",
	card: "#FFFFFF",
	divider: "rgba(15, 23, 42, 0.08)",
	highlight: "#DCFCE7",
};

const sectionPadding = "py-20 px-4";

function LandingPageEnhanced({ onGetStarted }: LandingPageProps) {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
	const [pricingModalOpen, setPricingModalOpen] = useState(false);
	const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [announceMessage, setAnnounceMessage] = useState("");

	const waitlistPlan: "professional" | "organizations" = "professional";

	const handlePrimaryCTA = () => {
		onGetStarted();
		navigate("/signup");
	};

	const handleLogin = () => {
		setAuthMode("signin");
		setAuthModalOpen(true);
	};

	const heroHighlights = useMemo(
		() => [
			{ label: "Science-backed assessments" },
			{ label: "RID Sponsor #2309" },
			{ label: "5.0+ CEUs available" },
		],
		[],
	);

	const statsBar = useMemo(
		() => [
			{ value: "16", label: "Research Frameworks" },
			{ value: "5.0+", label: "CEUs Available" },
			{ value: "24/7", label: "AI Performance Support" },
		],
		[],
	);

	const performanceCards = useMemo(
		() => [
			{
				title: "Your Performance Foundation: The ECCI™ Framework",
				description:
					"Our proprietary ECCI™ Framework (Emotional & Cultural Competencies for Interpreters) uses 16 research-backed methods to measure how your brain handles cognitive load, cultural processing, and performance growth.",
			},
			{
				title: "Catalyst: Your AI Performance Partner",
				description:
					"Get personalized recommendations 24/7. Catalyst analyzes your cognitive patterns and suggests practical strategies to optimize your capacity. Built on the ECCI™ framework. Your data is 100% private.",
			},
			{
				title: "RID-Approved Certification",
				description:
					"Earn RID-approved CEUs across multiple categories through Building Bridges Global, LLC (Sponsor #2309), including the new 'Studies of Healthy Minds & Bodies' category, now active.",
			},
		],
		[],
	);

	const professionalProfiles = useMemo(
		() => [
			{
				title: "Sign Language Interpreters",
				description:
					"Protect your career longevity with tools tuned for visual-spatial processing, team dynamics, and rapid cognitive shifts.",
			},
			{
				title: "Spoken Language Interpreters",
				description:
					"Navigate medical, legal, and community settings with data that reveals stress patterns and capacity trends across assignments.",
			},
			{
				title: "Remote & Hybrid Specialists",
				description:
					"Counter technology fatigue with neuroscience-backed recovery routines designed for VRI, conference, and hybrid environments.",
			},
		],
		[],
	);

	const testimonials = useMemo(
		() => [
			{
				quote:
					"InterpretReflect made my performance measurable. Within six weeks, I could see exactly which assignments drained me and what to adjust. My CEUs now align with my actual growth plan.",
				name: "Jordan Smith, NIC Advanced",
				role: "Freelance Medical Interpreter",
			},
			{
				quote:
					"The ECCI™ framework gave our team language for cognitive load that finally makes sense to leadership. We have data to back decisions, not just intuition.",
				name: "Sarah Wheeler, Ed.D.",
				role: "Creator of the ECCI™ Framework & Conference Interpreter",
			},
		],
		[],
	);

	const ecciPillars = useMemo(
		() => [
			{
				icon: <Brain className="w-6 h-6 text-white" />,
				title: "Cognitive Load Intelligence",
				description:
					"Measure how each assignment taxes working memory, processing speed, and recovery time so you can plan smarter rotations.",
			},
			{
				icon: <Sparkles className="w-6 h-6 text-white" />,
				title: "Emotional Regulation",
				description:
					"Track emotional labor demands and apply targeted reset tools grounded in performance psychology and interoception research.",
			},
			{
				icon: <Target className="w-6 h-6 text-white" />,
				title: "Cultural & Context Precision",
				description:
					"Surface cultural mediation patterns that influence decision-making, teaming, and long-term interpreter wellness.",
			},
			{
				icon: <Award className="w-6 h-6 text-white" />,
				title: "Capacity Growth Metrics",
				description:
					"Monitor longitudinal trends to understand how your practice evolves, and document it for CEUs and credentialing boards.",
			},
		],
		[],
	);

	const protocolSteps = useMemo(
		() => [
			{
				title: "Establish Performance Baseline",
				description:
					"Take a 15-minute assessment. Get your personalized performance profile with specific metrics.",
			},
			{
				title: "Track Performance Metrics",
				description:
					"Log your daily performance: baseline checks, post-assignment reflections, and capacity tracking, all included in your platform access.",
			},
			{
				title: "Earn Professional Credits",
				description:
					"Purchase CEU bundles to certify your professional development while building sustainable practice habits.",
			},
		],
		[],
	);

	const dataStats = useMemo(
		() => [
			{
				value: "24%",
				label: "meet clinical burnout criteria",
			},
			{
				value: "41.5%",
				label: "have experienced vicarious trauma",
			},
			{
				value: "57.5%",
				label: "report imposter syndrome",
			},
			{
				value: "50%",
				label: "struggle with boundary management",
			},
		],
		[],
	);

	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	return (
		<div className="min-h-screen flex flex-col" style={{ backgroundColor: palette.background }}>
			<div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
				{announceMessage}
			</div>

			<div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-0 focus-within:left-0 focus-within:right-0 focus-within:z-50 focus-within:bg-white focus-within:p-2 focus-within:shadow-lg">
				<a
					href="#main"
					className="inline-block px-4 py-2 mr-2 rounded-lg text-white focus:ring-4 focus:outline-none"
					style={{ backgroundColor: palette.primary }}
				>
					Skip to main content
				</a>
				<a
					href="#navigation"
					className="inline-block px-4 py-2 mr-2 rounded-lg text-white focus:ring-4 focus:outline-none"
					style={{ backgroundColor: palette.primary }}
				>
					Skip to navigation
				</a>
				<a
					href="#footer"
					className="inline-block px-4 py-2 rounded-lg text-white focus:ring-4 focus:outline-none"
					style={{ backgroundColor: palette.primary }}
				>
					Skip to footer
				</a>
			</div>

			<nav
				id="navigation"
				className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-200"
				role="navigation"
				aria-label="Main navigation"
			>
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<Logo size="md" showTagline variant="default" linkToHome={false} />
						<div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
							<button
								onClick={() => scrollToSection("hero")}
								className="hover:text-slate-900 transition-colors"
							>
								Overview
							</button>
							<button
								onClick={() => scrollToSection("ecci")}
								className="hover:text-slate-900 transition-colors"
							>
								ECCI™ Framework
							</button>
							<button
								onClick={() => scrollToSection("protocol")}
								className="hover:text-slate-900 transition-colors"
							>
								How It Works
							</button>
							<button
								onClick={() => scrollToSection("data")}
								className="hover:text-slate-900 transition-colors"
							>
								Data
							</button>
						</div>
						<div className="hidden md:flex items-center gap-3">
							{user ? (
								<button
									onClick={() => navigate("/dashboard")}
									className="px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-300 transition"
								>
									Go to Dashboard
								</button>
							) : (
								<>
									<button
										onClick={handleLogin}
										className="px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-300 transition"
									>
										Sign In
									</button>
									<button
										onClick={handlePrimaryCTA}
										className="px-5 py-2 rounded-full text-sm font-semibold text-white shadow-sm transition"
										style={{ backgroundColor: palette.primary }}
									>
										Start Your Performance Assessment
									</button>
								</>
							)}
						</div>
						<button
							onClick={() => {
								setMobileMenuOpen(prev => !prev);
								setAnnounceMessage(mobileMenuOpen ? "Menu closed" : "Menu opened");
							}}
							className="md:hidden text-sm font-medium px-3 py-2 rounded-lg border border-slate-200 text-slate-700"
							aria-expanded={mobileMenuOpen}
							aria-controls="mobile-menu"
						>
							{mobileMenuOpen ? "Close" : "Menu"}
						</button>
					</div>
				</div>
				{mobileMenuOpen && (
					<div id="mobile-menu" className="md:hidden border-t border-slate-200 bg-white">
						<div className="px-4 py-4 space-y-3 text-sm font-semibold text-slate-700">
							<button onClick={() => scrollToSection("hero")} className="block w-full text-left">
								Overview
							</button>
							<button onClick={() => scrollToSection("ecci")} className="block w-full text-left">
								ECCI™ Framework
							</button>
							<button onClick={() => scrollToSection("protocol")} className="block w-full text-left">
								How It Works
							</button>
							<button onClick={() => scrollToSection("data")} className="block w-full text-left">
								Data
							</button>
							<div className="pt-3 space-y-2 border-t border-slate-200">
								{user ? (
									<button
										onClick={() => navigate("/dashboard")}
										className="w-full px-4 py-2 rounded-full border border-slate-200"
									>
										Go to Dashboard
									</button>
								) : (
									<>
										<button
											onClick={handleLogin}
											className="w-full px-4 py-2 rounded-full border border-slate-200"
										>
											Sign In
										</button>
										<button
											onClick={handlePrimaryCTA}
											className="w-full px-4 py-2 rounded-full text-white"
											style={{ backgroundColor: palette.primary }}
										>
											Start Your Performance Assessment
										</button>
									</>
								)}
							</div>
						</div>
					</div>
				)}
			</nav>

			<main id="main" className="flex-1">
				<section
					id="hero"
					className={`${sectionPadding} border-b`}
					style={{ backgroundColor: palette.card, borderColor: palette.divider }}
					aria-labelledby="hero-heading"
				>
					<div className="max-w-6xl mx-auto text-center">
						<div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: palette.highlight, color: palette.primary }}>
							Trusted by Interpreters Nationwide
						</div>
						<h1
							id="hero-heading"
							className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
							style={{ color: palette.foreground }}
						>
							Perform at Your Peak. Every Assignment.
						</h1>
						<p className="mt-6 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed text-slate-700">
							Stop guessing about your performance. Get AI-powered insights backed by neuroscience to manage cognitive load, prevent burnout, and grow your capacity, with RID-approved CEUs included.
						</p>
						<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
							<button
								onClick={handlePrimaryCTA}
								className="px-6 sm:px-8 py-4 rounded-full text-base font-semibold text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
								style={{ backgroundColor: palette.primary }}
							>
								Start Your Performance Assessment
							</button>
							<button
								onClick={() => scrollToSection("ecci")}
								className="px-6 sm:px-8 py-4 rounded-full text-base font-semibold border border-slate-200 text-slate-700 hover:border-slate-300 transition"
							>
								Explore the ECCI™ Framework
							</button>
						</div>
						<div className="mt-10 grid gap-6 sm:grid-cols-3">
							{heroHighlights.map(highlight => (
								<div key={highlight.label} className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">
									<CheckCircle2 className="w-5 h-5 text-emerald-500" />
									<span>{highlight.label}</span>
								</div>
							))}
						</div>
					</div>
				</section>

				<section
					className="border-b"
					style={{ backgroundColor: "#F1F5F9", borderColor: palette.divider }}
					aria-label="Key platform statistics"
				>
					<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
							{statsBar.map(stat => (
								<div key={stat.label} className="p-6 rounded-2xl bg-white shadow-sm">
									<div className="text-3xl font-bold text-slate-900">{stat.value}</div>
									<div className="mt-2 text-sm font-medium uppercase tracking-wide text-slate-500">
										{stat.label}
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				<section
					className={`${sectionPadding} border-b`}
					style={{ backgroundColor: palette.card, borderColor: palette.divider }}
					aria-labelledby="everything-heading"
				>
					<div className="max-w-6xl mx-auto">
						<div className="text-center max-w-3xl mx-auto">
							<h2 id="everything-heading" className="text-3xl sm:text-4xl font-bold text-slate-900">
								Everything You Need to Optimize Performance
							</h2>
							<p className="mt-4 text-lg text-slate-600">
								A complete system that keeps your ECCI™ insights front and center while making them easy to apply in everyday practice.
							</p>
						</div>
						<div className="mt-12 grid gap-6 md:grid-cols-3">
							{performanceCards.map(card => (
								<div key={card.title} className="h-full p-6 rounded-2xl bg-slate-900 text-white shadow-lg">
									<h3 className="text-xl font-semibold">{card.title}</h3>
									<p className="mt-4 text-sm leading-relaxed text-white/80">{card.description}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section
					className={`${sectionPadding} border-b`}
					style={{ backgroundColor: "#EFFAF3", borderColor: palette.divider }}
					aria-labelledby="professionals-heading"
				>
					<div className="max-w-6xl mx-auto">
						<div className="text-center max-w-2xl mx-auto">
							<h2 id="professionals-heading" className="text-3xl sm:text-4xl font-bold text-slate-900">
								Built for Every Interpreting Professional
							</h2>
							<p className="mt-4 text-lg text-slate-600">
								Whether you’re on-site, remote, or rotating between environments, InterpretReflect adapts to your realities.
							</p>
						</div>
						<div className="mt-12 grid gap-6 md:grid-cols-3">
							{professionalProfiles.map(profile => (
								<div key={profile.title} className="p-6 rounded-2xl bg-white shadow-md border border-emerald-100">
									<h3 className="text-xl font-semibold text-slate-900">{profile.title}</h3>
									<p className="mt-3 text-sm leading-relaxed text-slate-600">{profile.description}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section
					className={`${sectionPadding} border-b`}
					style={{ backgroundColor: palette.card, borderColor: palette.divider }}
					aria-labelledby="testimonials-heading"
				>
					<div className="max-w-6xl mx-auto">
						<div className="text-center">
							<h2 id="testimonials-heading" className="text-3xl sm:text-4xl font-bold text-slate-900">
								Interpreters Trust the Results
							</h2>
							<p className="mt-4 text-lg text-slate-600">
								Real practitioners and the creator of the ECCI™ framework share how the platform translates insight into action.
							</p>
						</div>
						<div className="mt-12 grid gap-6 md:grid-cols-2">
							{testimonials.map(testimonial => (
								<blockquote key={testimonial.name} className="h-full p-6 rounded-2xl bg-white shadow-md border border-slate-200">
									<p className="text-base leading-relaxed text-slate-700">“{testimonial.quote}”</p>
									<footer className="mt-6">
										<div className="text-sm font-semibold text-slate-900">{testimonial.name}</div>
										<div className="text-xs uppercase tracking-wide text-slate-500 mt-1">
											{testimonial.role}
										</div>
									</footer>
								</blockquote>
							))}
						</div>
					</div>
				</section>

				<section
					className={`${sectionPadding} border-b`}
					style={{ backgroundColor: "#F9F5FF", borderColor: palette.divider }}
					aria-labelledby="rid-category-heading"
				>
					<div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
						<div>
							<div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-violet-100 text-violet-700">
								New RID Professional Category - Now Active
							</div>
							<h2 id="rid-category-heading" className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">
								Studies of Healthy Minds & Bodies
							</h2>
							<p className="mt-4 text-lg text-slate-600">
								InterpretReflect is approved to deliver CEUs in this new category, helping you document your professional development in cognitive wellness and capacity building.
							</p>
							<button
								onClick={handlePrimaryCTA}
								className="mt-8 px-6 py-3 rounded-full text-base font-semibold text-white shadow-sm hover:shadow-md transition"
								style={{ backgroundColor: palette.primary }}
							>
								Start Your Performance Assessment
							</button>
						</div>
						<div className="p-6 rounded-2xl bg-white shadow-md border border-violet-100">
							<h3 className="text-xl font-semibold text-slate-900">What It Means</h3>
							<ul className="mt-4 space-y-3 text-sm text-slate-600">
								<li>• CEUs that align directly with interpreter wellness and capacity-building goals.</li>
								<li>• Documentation that satisfies regulatory requirements and supports career advancement.</li>
								<li>• A measurable path from insight to credentialed growth.</li>
							</ul>
						</div>
					</div>
				</section>

				<section
					id="ecci"
					className={`${sectionPadding} border-b`}
					style={{ backgroundColor: palette.card, borderColor: palette.divider }}
					aria-labelledby="ecci-heading"
				>
					<div className="max-w-6xl mx-auto">
						<div className="text-center max-w-3xl mx-auto">
							<h2 id="ecci-heading" className="text-3xl sm:text-4xl font-bold text-slate-900">
								The ECCI™ Framework
							</h2>
							<p className="mt-2 text-lg text-slate-500">Emotional & Cultural Competencies for Interpreters</p>
							<p className="mt-6 text-lg text-slate-600">
								Our framework combines 16 neuroscience-based methods that measure how you process information, manage cultural context, regulate emotional labor, and maintain mental capacity during interpreting.
							</p>
						</div>
						<div className="mt-12 grid gap-6 md:grid-cols-2">
							{ecciPillars.map(pillar => (
								<div key={pillar.title} className="p-6 rounded-2xl bg-slate-900 text-white shadow-lg">
									<div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500">
										{pillar.icon}
									</div>
									<h3 className="mt-4 text-xl font-semibold">{pillar.title}</h3>
									<p className="mt-3 text-sm text-white/80 leading-relaxed">{pillar.description}</p>
								</div>
							))}
						</div>
						<div className="mt-10 p-6 rounded-2xl bg-slate-100 border border-slate-200">
							<h3 className="text-lg font-semibold text-slate-900">Research Foundation</h3>
							<p className="mt-3 text-sm text-slate-600 leading-relaxed">
								Based on cognitive science, interoception research, performance psychology, cultural neuroscience, and interpreter workload studies.
							</p>
						</div>
					</div>
				</section>

				<section
					id="protocol"
					className={`${sectionPadding} border-b`}
					style={{ backgroundColor: "#F8FAFC", borderColor: palette.divider }}
					aria-labelledby="protocol-heading"
				>
					<div className="max-w-6xl mx-auto">
						<h2 id="protocol-heading" className="text-3xl sm:text-4xl font-bold text-center text-slate-900">
							Performance Optimization Protocol
						</h2>
						<p className="mt-4 text-lg text-center text-slate-600">
							Three steps to transform raw data into confident, sustainable practice.
						</p>
						<div className="mt-12 grid gap-6 md:grid-cols-3">
							{protocolSteps.map((step, index) => (
								<div key={step.title} className="p-6 rounded-2xl bg-white shadow-md border border-slate-200">
									<div className="w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold" style={{ backgroundColor: palette.primary }}>
										{index + 1}
									</div>
									<h3 className="mt-4 text-xl font-semibold text-slate-900">{step.title}</h3>
									<p className="mt-3 text-sm leading-relaxed text-slate-600">{step.description}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section
					id="data"
					className={`${sectionPadding} border-b`}
					style={{ backgroundColor: palette.card, borderColor: palette.divider }}
					aria-labelledby="data-heading"
				>
					<div className="max-w-6xl mx-auto">
						<div className="text-center max-w-3xl mx-auto">
							<h2 id="data-heading" className="text-3xl sm:text-4xl font-bold text-slate-900">
								The Data-Driven Case
							</h2>
							<p className="mt-4 text-lg text-slate-600">
								National studies from 2024-2025 reveal the urgent need for performance support tailored to interpreters.
							</p>
						</div>
						<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{dataStats.map(stat => (
								<div key={stat.label} className="p-6 rounded-2xl bg-slate-900 text-white shadow-lg">
									<div className="text-3xl font-bold">{stat.value}</div>
									<p className="mt-3 text-sm text-white/80 leading-relaxed">{stat.label}</p>
								</div>
							))}
						</div>
						<p className="mt-10 text-center text-base text-slate-600">
							These numbers reflect systemic challenges, not personal inadequacy. Your work demands specialized, research-backed support.
						</p>
					</div>
				</section>

				<section
					className={`${sectionPadding}`}
					style={{ backgroundColor: palette.primary }}
					aria-labelledby="cta-heading"
				>
					<div className="max-w-4xl mx-auto text-center text-white">
						<h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold">
							Ready to Document and Elevate Your Performance?
						</h2>
						<p className="mt-4 text-lg text-white/80">
							Join interpreters nationwide who rely on the ECCI™ Framework to protect their capacity, earn CEUs, and sustain careers they love.
						</p>
						<div className="mt-8">
							<button
								onClick={handlePrimaryCTA}
								className="px-8 py-4 rounded-full text-base font-semibold text-emerald-900 bg-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
							>
								Start Your Performance Assessment
							</button>
						</div>
					</div>
				</section>
			</main>

			<Footer />

			<ModernAuthModal
				isOpen={authModalOpen}
				onClose={() => setAuthModalOpen(false)}
				defaultMode={authMode}
				onSuccess={() => {
					setAuthModalOpen(false);
					navigate("/dashboard");
				}}
			/>

			<PricingModal
				isOpen={pricingModalOpen}
				onClose={() => setPricingModalOpen(false)}
				onSelectPlan={() => {
					setPricingModalOpen(false);
					onGetStarted?.();
				}}
			/>

			<WaitlistModal
				isOpen={waitlistModalOpen}
				onClose={() => setWaitlistModalOpen(false)}
				plan={waitlistPlan}
			/>
		</div>
	);
}

export default LandingPageEnhanced;
