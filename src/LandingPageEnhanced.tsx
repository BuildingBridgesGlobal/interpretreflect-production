import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernAuthModal } from "./components/auth/ModernAuthModal";
import { Footer } from "./components/Footer";
import Logo from "./components/Logo";
import { useAuth } from "./contexts/AuthContext";

interface LandingPageProps {
	onGetStarted: () => void;
}

const heroBullets = [
	"Science-backed assessments",
	"RID Sponsor #2309",
	"5.0+ CEUs available",
];

const stats = [
	{
		value: "16",
		label: "RESEARCH FRAMEWORKS",
		description: "The ECCI™ system keeps every insight grounded in evidence.",
	},
	{
		value: "5.0+",
		label: "CEUs AVAILABLE",
		description: "Earn credit while you build sustainable performance habits.",
	},
	{
		value: "24/7",
		label: "AI PERFORMANCE SUPPORT",
		description: "Catalyst is on-call whenever you need guidance.",
	},
];

const optimizeCards = [
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
			"Earn RID-approved CEUs across multiple categories through Building Bridges Global, LLC (Sponsor #2309), including the new 'Studies of Healthy Minds & Bodies' category—active now.",
	},
];

const builtForCards = [
	{
		title: "Sign Language Interpreters",
		description:
			"Protect your career longevity with wellness tools designed for the visual, spatial, and relational demands of sign language interpreting.",
	},
	{
		title: "Spoken Language Interpreters",
		description:
			"Stay sharp in medical, legal, and community settings with guidance attuned to language switching, high-stakes dialogue, and cultural nuance.",
	},
	{
		title: "Remote & Hybrid Teams",
		description:
			"Combat screen fatigue and isolation with science-backed routines that keep remote, VRI, and hybrid interpreters grounded between sessions.",
	},
];

const testimonials = [
	{
		quote:
			"InterpretReflect helped me pinpoint the patterns that were draining my focus between hospital assignments. The recommendations are specific, actionable, and keep me at my professional best.",
		name: "Alex Ramirez",
		role: "Freelance Medical Interpreter, RID CI and CT",
	},
	{
		quote:
			"The ECCI™ framework gives interpreters language for what we feel and a roadmap for sustainable practice. It's the evidence base I wished I had when I started mentoring.",
		name: "Sarah Wheeler",
		role: "Creator of the ECCI™ Framework & RID Certified Interpreter",
	},
];

const ecciFeatures = [
	{
		title: "Measure Cognitive Load",
		description:
			"Identify which assignments, environments, and language combinations tax working memory so you can plan rest and support.",
	},
	{
		title: "Protect Emotional Capacity",
		description:
			"Track emotional labor and vicarious trauma markers with guidance grounded in trauma-informed practice.",
	},
	{
		title: "Strengthen Cultural Agility",
		description:
			"Surface cultural processing demands and bias triggers so you can prepare intentionally for every context.",
	},
	{
		title: "Plan Sustainable Growth",
		description:
			"Translate assessment data into goals, CEU plans, and daily rituals that expand your capacity over time.",
	},
];

const protocolSteps = [
	{
		title: "Establish Your Baseline",
		description:
			"Take a 15-minute assessment. Get your personalized performance profile with specific metrics.",
	},
	{
		title: "Track What Matters Daily",
		description:
			"Log your daily performance: baseline checks, post-assignment reflections, and capacity tracking—all included in your platform access.",
	},
	{
		title: "Earn Professional Credits",
		description:
			"Purchase CEU bundles to certify your professional development while building sustainable practice habits.",
	},
];

const dataStats = [
	{ value: "24%", description: "meet clinical burnout criteria" },
	{ value: "41.5%", description: "have experienced vicarious trauma" },
	{ value: "57.5%", description: "report imposter syndrome" },
	{ value: "50%", description: "struggle with boundary management" },
];

function LandingPageEnhanced({ onGetStarted }: LandingPageProps) {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
			setMobileMenuOpen(false);
		}
	};

	const handlePrimaryAction = () => {
		onGetStarted();
		navigate("/signup");
	};

	const handleSignIn = () => {
		setAuthMode("signin");
		setAuthModalOpen(true);
	};

	const handleOpenSignupModal = () => {
		setAuthMode("signup");
		setAuthModalOpen(true);
	};

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<a
				href="#main"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
			>
				Skip to main content
			</a>

			<nav
				id="navigation"
				className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-lg"
				aria-label="Main navigation"
			>
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<Logo size="md" showTagline variant="default" linkToHome={false} />

					<div className="hidden items-center gap-6 md:flex">
						<button
							onClick={() => scrollToSection("ecci-framework")}
							className="text-sm font-semibold text-slate-700 transition hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
						>
							ECCI™ Framework
						</button>
						<button
							onClick={() => scrollToSection("performance-protocol")}
							className="text-sm font-semibold text-slate-700 transition hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
						>
							How It Works
						</button>
						<button
							onClick={() => scrollToSection("testimonials")}
							className="text-sm font-semibold text-slate-700 transition hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
						>
							Testimonials
						</button>
						<button
							onClick={() => scrollToSection("data-case")}
							className="text-sm font-semibold text-slate-700 transition hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
						>
							Research
						</button>
					</div>

					<div className="hidden items-center gap-3 md:flex">
						{user ? (
							<button
								onClick={() => navigate("/dashboard")}
								className="rounded-full border border-emerald-600 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
							>
								Go to Dashboard
							</button>
						) : (
							<>
								<button
									onClick={handleSignIn}
									className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
								>
									Sign In
								</button>
								<button
									onClick={handlePrimaryAction}
									className="rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
								>
									Start Your Performance Assessment
								</button>
							</>
						)}
					</div>

					<button
						onClick={() => setMobileMenuOpen((prev) => !prev)}
						className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 md:hidden"
						aria-expanded={mobileMenuOpen}
						aria-controls="mobile-menu"
					>
						{mobileMenuOpen ? "Close" : "Menu"}
					</button>
				</div>

				{mobileMenuOpen && (
					<div
						id="mobile-menu"
						className="border-t border-slate-200 bg-white md:hidden"
					>
						<div className="flex flex-col gap-2 px-4 py-4">
							<button
								onClick={() => scrollToSection("ecci-framework")}
								className="rounded-lg px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-emerald-50"
							>
								ECCI™ Framework
							</button>
							<button
								onClick={() => scrollToSection("performance-protocol")}
								className="rounded-lg px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-emerald-50"
							>
								How It Works
							</button>
							<button
								onClick={() => scrollToSection("testimonials")}
								className="rounded-lg px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-emerald-50"
							>
								Testimonials
							</button>
							<button
								onClick={() => scrollToSection("data-case")}
								className="rounded-lg px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-emerald-50"
							>
								Research
							</button>
							<div className="mt-2 flex flex-col gap-2">
								{user ? (
									<button
										onClick={() => navigate("/dashboard")}
										className="rounded-full border border-emerald-600 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
									>
										Go to Dashboard
									</button>
								) : (
									<>
										<button
											onClick={handleSignIn}
											className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700"
										>
											Sign In
										</button>
										<button
											onClick={handlePrimaryAction}
											className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
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

			<main id="main" role="main" aria-label="Main content">
				<section
					className="bg-slate-900 text-white"
					aria-labelledby="hero-heading"
				>
					<div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:px-8">
						<div className="space-y-8">
							<div>
								<span className="inline-flex items-center rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
									Trusted by Interpreters Nationwide
								</span>
							</div>
							<div>
								<h1
									id="hero-heading"
									className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
								>
									Perform at Your Peak. Every Assignment.
								</h1>
								<p className="mt-6 text-lg leading-relaxed text-slate-200">
									Stop guessing about your performance. Get AI-powered insights
									backed by neuroscience to manage cognitive load, prevent
									burnout, and grow your capacity—with RID-approved CEUs included.
								</p>
							</div>
							<ul className="flex flex-wrap gap-3 text-sm font-semibold text-emerald-200">
								{heroBullets.map((bullet) => (
									<li
										key={bullet}
										className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 px-4 py-2"
									>
										<span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
										{bullet}
									</li>
								))}
							</ul>
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
								<button
									onClick={handlePrimaryAction}
									className="flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-base font-semibold text-slate-900 transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
								>
									Start Your Performance Assessment
								</button>
								<button
									onClick={() => scrollToSection("ecci-framework")}
									className="flex items-center justify-center rounded-full border border-emerald-400 px-8 py-3 text-base font-semibold text-white transition hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
								>
									Explore the ECCI™ Framework
								</button>
							</div>
						</div>

						<div className="space-y-6 rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
							<h2 className="text-lg font-semibold text-white/90">
								16 research frameworks. One integrated performance system.
							</h2>
							<p className="text-sm text-white/70">
								The ECCI™ Framework remains the backbone of InterpretReflect. We
								keep it visible because it's your proprietary differentiator, the
								research foundation your practice deserves, and the moat
								competitors can't replicate.
							</p>
							<div className="space-y-4 text-sm text-white/70">
								<p>
									Rebranded for clarity, the ECCI™ Framework turns academic rigor
									into plain-language insights. It's how you prove outcomes, earn
									CEUs, and protect your capacity.
								</p>
								<p>
									Use Catalyst to bring the framework to life—apply the science in
									real time, assignment after assignment.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section
					className="border-y border-slate-200 bg-white"
					aria-label="Performance proof points"
				>
					<div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
						{stats.map((item) => (
							<div key={item.label} className="text-center lg:text-left">
								<p className="text-4xl font-bold text-slate-900">{item.value}</p>
								<p className="mt-1 text-xs font-semibold tracking-[0.2em] text-emerald-700">
									{item.label}
								</p>
								<p className="mt-3 text-sm text-slate-600">{item.description}</p>
							</div>
						))}
					</div>
				</section>

				<section
					id="optimize"
					className="bg-slate-100 py-20"
					aria-labelledby="optimize-heading"
				>
					<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-3xl text-center">
							<h2
								id="optimize-heading"
								className="text-3xl font-bold text-slate-900 sm:text-4xl"
							>
								Everything You Need to Optimize Performance
							</h2>
							<p className="mt-4 text-lg text-slate-600">
								Three pillars work together to keep you clear, confident, and
								credentialed.
							</p>
						</div>

						<div className="mt-12 grid gap-8 md:grid-cols-3">
							{optimizeCards.map((card) => (
								<article
									key={card.title}
									className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-lg"
								>
									<h3 className="text-xl font-semibold text-slate-900">
										{card.title}
									</h3>
									<p className="mt-4 text-sm text-slate-600">{card.description}</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section
					id="built-for"
					className="bg-white py-20"
					aria-labelledby="built-for-heading"
				>
					<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-3xl text-center">
							<h2
								id="built-for-heading"
								className="text-3xl font-bold text-slate-900 sm:text-4xl"
							>
								Built for Every Interpreting Professional
							</h2>
							<p className="mt-4 text-lg text-slate-600">
								Your role, modality, and context are unique. Your support system
								should be too.
							</p>
						</div>

						<div className="mt-12 grid gap-6 md:grid-cols-3">
							{builtForCards.map((card) => (
								<article
									key={card.title}
									className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-emerald-300 hover:bg-white"
								>
									<h3 className="text-lg font-semibold text-slate-900">
										{card.title}
									</h3>
									<p className="mt-3 text-sm text-slate-600">{card.description}</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section
					id="testimonials"
					className="bg-slate-900 py-20"
					aria-labelledby="testimonials-heading"
				>
					<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
						<div className="mb-12 text-center">
							<h2
								id="testimonials-heading"
								className="text-3xl font-bold text-white sm:text-4xl"
							>
								Proof from Practitioners
							</h2>
							<p className="mt-4 text-base text-slate-300">
								Social proof from interpreters who use the platform every week.
							</p>
						</div>

						<div className="grid gap-8 md:grid-cols-2">
							{testimonials.map((testimonial) => (
								<figure
									key={testimonial.name}
									className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-8 text-left shadow-lg backdrop-blur"
								>
									<blockquote className="text-lg text-white">
										“{testimonial.quote}”
									</blockquote>
									<figcaption className="mt-6 text-sm text-emerald-200">
										<p className="font-semibold text-white">
											{testimonial.name}
										</p>
										<p>{testimonial.role}</p>
									</figcaption>
								</figure>
							))}
						</div>
					</div>
				</section>

				<section
					id="rid-category"
					className="bg-emerald-50 py-20"
					aria-labelledby="rid-category-heading"
				>
					<div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
						<span className="inline-flex items-center rounded-full border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-emerald-700">
							New RID Professional Category · Now Active
						</span>
						<h2
							id="rid-category-heading"
							className="mt-6 text-3xl font-bold text-slate-900 sm:text-4xl"
						>
							Studies of Healthy Minds & Bodies — Available Now
						</h2>
						<p className="mt-4 text-base text-slate-700">
							InterpretReflect is approved to deliver CEUs in this new category,
							helping you document your professional development in cognitive
							wellness and capacity building.
						</p>
					</div>
				</section>

				<section
					id="ecci-framework"
					className="bg-white py-20"
					aria-labelledby="ecci-heading"
				>
					<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-3xl text-center">
							<h2
								id="ecci-heading"
								className="text-3xl font-bold text-slate-900 sm:text-4xl"
							>
								The ECCI™ Framework
							</h2>
							<p className="mt-2 text-lg font-medium text-emerald-700">
								Emotional & Cultural Competencies for Interpreters
							</p>
							<p className="mt-4 text-base text-slate-600">
								Our framework combines 16 neuroscience-based methods that measure
								how you process information, manage cultural context, regulate
								emotional labor, and maintain mental capacity during interpreting.
							</p>
						</div>

						<div className="mt-12 grid gap-6 md:grid-cols-2">
							{ecciFeatures.map((feature) => (
								<article
									key={feature.title}
									className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-emerald-300 hover:bg-white"
								>
									<h3 className="text-lg font-semibold text-slate-900">
										{feature.title}
									</h3>
									<p className="mt-3 text-sm text-slate-600">{feature.description}</p>
								</article>
							))}
						</div>

						<div className="mt-10 rounded-2xl bg-emerald-600/10 p-6 text-sm text-emerald-900">
							<p>
								Based on cognitive science, interoception research, performance
								psychology, cultural neuroscience, and interpreter workload
								studies.
							</p>
						</div>
					</div>
				</section>

				<section
					id="performance-protocol"
					className="bg-slate-900 py-20"
					aria-labelledby="protocol-heading"
				>
					<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-3xl text-center text-white">
							<h2
								id="protocol-heading"
								className="text-3xl font-bold sm:text-4xl"
							>
								Performance Optimization Protocol
							</h2>
							<p className="mt-4 text-base text-slate-200">
								Follow the same protocol elite interpreters use to stay in peak
								form across assignments, teams, and modalities.
							</p>
						</div>

						<div className="mt-12 grid gap-6 md:grid-cols-3">
							{protocolSteps.map((step, index) => (
								<article
									key={step.title}
									className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/5 p-6 text-white"
								>
									<span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-base font-semibold text-slate-900">
										{index + 1}
									</span>
									<h3 className="text-lg font-semibold">{step.title}</h3>
									<p className="text-sm text-slate-200">{step.description}</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section
					id="data-case"
					className="bg-white py-20"
					aria-labelledby="data-heading"
				>
					<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-3xl text-center">
							<h2
								id="data-heading"
								className="text-3xl font-bold text-slate-900 sm:text-4xl"
							>
								The Data-Driven Case
							</h2>
							<p className="mt-4 text-base text-slate-600">
								National studies from 2024-2025 reveal what interpreters are
								facing—and why proactive support matters.
							</p>
						</div>

						<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{dataStats.map((item) => (
								<div
									key={item.value}
									className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center"
								>
									<p className="text-4xl font-bold text-slate-900">{item.value}</p>
									<p className="mt-3 text-sm text-slate-600">{item.description}</p>
								</div>
							))}
						</div>

						<p className="mt-10 text-center text-sm text-slate-600">
							These numbers reflect systemic challenges, not personal inadequacy.
							Your work demands specialized support and proof-backed solutions.
						</p>
					</div>
				</section>

				<section
					id="final-cta"
					className="bg-emerald-700 py-20"
					aria-labelledby="cta-heading"
				>
					<div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
						<h2
							id="cta-heading"
							className="text-3xl font-bold text-white sm:text-4xl"
						>
							Ready to Protect Your Performance?
						</h2>
						<p className="mt-4 text-base text-emerald-100">
							Start with the ECCI™ assessment, see your data instantly, and follow
							the plan built for interpreters like you.
						</p>
						<div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
							<button
								onClick={handlePrimaryAction}
								className="rounded-full bg-white px-8 py-3 text-base font-semibold text-emerald-800 transition hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-emerald-700"
							>
								Start Your Performance Assessment
							</button>
							<button
								onClick={handleOpenSignupModal}
								className="rounded-full border border-white/70 px-8 py-3 text-base font-semibold text-white transition hover:bg-emerald-600/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-emerald-700"
							>
								Talk to Our Team
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
		</div>
	);
}

export default LandingPageEnhanced;
