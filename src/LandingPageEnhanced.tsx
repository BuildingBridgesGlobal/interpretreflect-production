import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernAuthModal } from "./components/auth/ModernAuthModal";
import { Footer } from "./components/Footer";
import Logo from "./components/Logo";
import PricingModal from "./components/PricingModal";
import WaitlistModal from "./components/WaitlistModal";
import { useAuth } from "./contexts/AuthContext";

interface LandingPageProps {
	onGetStarted: () => void;
}

// Professional Dark Forest Green Color Palette
const colors = {
	// Primary palette - professional and trustworthy
	primary: {
		slate: "#475569", // Clean slate - professional, trustworthy
		green: "#5C7F4F", // Dark forest green - professional, wellness
		indigo: "#4F46E5", // Soft indigo - thoughtful, modern
	},
	// Background gradients - professional and clean
	gradients: {
		hero: "linear-gradient(135deg, #FAFBFC 0%, #F8FAFC 50%, #F1F5F9 100%)",
		card: "linear-gradient(145deg, #FFFFFF 0%, #FAFBFC 100%)",
		slate: "linear-gradient(135deg, #475569 0%, #64748B 100%)",
		green: "linear-gradient(135deg, #5C7F4F 0%, #5B9378 100%)",
		indigo: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
	},
	// Neutral colors - clean grays
	neutral: {
		900: "#0F172A",
		800: "#1E293B",
		700: "#334155",
		600: "#475569",
		500: "#64748B",
		400: "#94A3B8",
		300: "#CBD5E1",
		200: "#E2E8F0",
		100: "#F1F5F9",
		50: "#F8FAFC",
	},
	// Semantic colors - modern and clean
	status: {
		success: "#10B981",
		warning: "#F59E0B",
		error: "#EF4444",
		info: "#3B82F6",
	},
};

function LandingPageEnhanced({ onGetStarted }: LandingPageProps) {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [authMode, setAuthMode] = useState<"login" | "signup">("login");
	const [pricingModalOpen, setPricingModalOpen] = useState(false);
	const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
	const [waitlistPlan] = useState<"professional" | "organizations">(
		"professional",
	);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [announceMessage, setAnnounceMessage] = useState("");

	const heroHighlights = [
		"Science-backed assessments",
		"RID Sponsor #2309",
		"5.0+ CEUs available",
	];

	const statsBarItems = [
		{ label: "16 RESEARCH FRAMEWORKS" },
		{ label: "5.0+ CEUS AVAILABLE" },
		{ label: "24/7 AI PERFORMANCE SUPPORT" },
	];

	const performanceCards = [
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

	const audienceSegments = [
		{
			title: "Sign Language Interpreters",
			description:
				"Trusted support for community, VRS/VRI, and educational interpreters who need actionable insights between high-stakes assignments.",
		},
		{
			title: "Spoken Language Interpreters",
			description:
				"From medical and legal to diplomatic settings, get guidance tailored to multilingual, multicultural environments without losing neutrality.",
		},
		{
			title: "Remote & Hybrid Teams",
			description:
				"Proactive strategies for video, remote, and hybrid work that protect focus, manage screen fatigue, and keep distributed teams aligned.",
		},
	];

	const testimonials = [
		{
			quote:
				"InterpretReflect turned the ECCI insights into daily decisions I actually use. I can see when my cognitive load spikes and Catalyst nudges me before burnout sets in.",
			name: "Jordan Lee, NIC Advanced",
			role: "Staff Medical Interpreter",
		},
		{
			quote:
				"We built ECCI so interpreters can anchor their practice in neuroscience and cultural research—not guesswork. Seeing agencies adopt it as their standard proves interpreters deserve this level of support.",
			name: "Sarah Wheeler, M.A.",
			role: "Founder, InterpretReflect & Creator of the ECCI™ Framework",
		},
	];

	const frameworkHighlights = [
		{
			title: "Cognitive Load Intelligence",
			description:
				"Maps working memory strain, mental stamina, and decision velocity so you can schedule recovery before performance dips.",
		},
		{
			title: "Cultural & Context Readiness",
			description:
				"Flags cultural pattern recognition strengths and gaps, guiding preparation for nuanced assignments and communities.",
		},
		{
			title: "Emotional Regulation Insights",
			description:
				"Surfaces emotional labor indicators and recommends neuroscience-backed resets that keep you composed in critical moments.",
		},
		{
			title: "Capacity Growth Roadmaps",
			description:
				"Transforms ECCI metrics into personalized development plans so you can expand workload sustainably and document growth.",
		},
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
			description: "Purchase CEU bundles to certify your professional development while building sustainable practice habits.",
		},
	];

	const dataStats = [
		{ figure: "24%", label: "meet clinical burnout criteria" },
		{ figure: "41.5%", label: "have experienced vicarious trauma" },
		{ figure: "57.5%", label: "report imposter syndrome" },
		{ figure: "50%", label: "struggle with boundary management" },
	];

	const handleLogin = () => {
		setAuthMode("signin");
		setAuthModalOpen(true);
	};

	const handleSignup = () => {
		// Redirect to seamless signup page
		navigate("/signup");
	};

	const handleSelectPlan = () => {
		setWaitlistModalOpen(false);
		onGetStarted();
	};

	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	return (
		<div className="min-h-screen" style={{ background: colors.gradients.hero }}>
			{/* Live region for screen reader announcements */}
			<div
				className="sr-only"
				role="status"
				aria-live="polite"
				aria-atomic="true"
			>
				{announceMessage}
			</div>

			{/* Skip navigation links for accessibility */}
			<div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-0 focus-within:left-0 focus-within:right-0 focus-within:z-50 focus-within:bg-white focus-within:p-2 focus-within:shadow-lg">
				<a
					href="#main"
					className="inline-block px-4 py-2 mr-2 text-white rounded-lg focus:ring-4 focus:outline-none"
					style={
						{
							backgroundColor: colors.primary.green,
							"--tw-ring-color": "rgba(92, 127, 79, 0.35)",
						} as React.CSSProperties
					}
				>
					Skip to main content
				</a>
				<a
					href="#navigation"
					className="inline-block px-4 py-2 mr-2 text-white rounded-lg focus:ring-4 focus:outline-none"
					style={
						{
							backgroundColor: colors.primary.green,
							"--tw-ring-color": "rgba(92, 127, 79, 0.35)",
						} as React.CSSProperties
					}
				>
					Skip to navigation
				</a>
				<a
					href="#footer"
					className="inline-block px-4 py-2 text-white rounded-lg focus:ring-4 focus:outline-none"
					style={
						{
							backgroundColor: colors.primary.green,
							"--tw-ring-color": "rgba(92, 127, 79, 0.35)",
						} as React.CSSProperties
					}
				>
					Skip to footer
				</a>
			</div>

			{/* Enhanced Navigation with personalization options */}
			<nav
				id="navigation"
				className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 border-b"
				style={{ borderColor: colors.neutral[100] }}
				role="navigation"
				aria-label="Main navigation"
			>
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo with better visual hierarchy */}
						<Logo
							size="md"
							showTagline={true}
							variant="default"
							linkToHome={false}
						/>

						{/* Desktop Navigation - Clean Modern Pills */}
						<div className="hidden md:flex items-center gap-4">
							<button
								onClick={() => scrollToSection("protocol")}
								className="px-5 py-2.5 text-sm font-semibold rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
								style={{ borderColor: "#5C7F4F", color: "#5C7F4F", backgroundColor: "transparent" }}
								aria-label="Learn how interpreterRx works"
							>
								How It Works
							</button>
							<button
								onClick={() => scrollToSection("pricing")}
								className="px-5 py-2.5 text-sm font-semibold rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
								style={{ borderColor: "#5C7F4F", color: "#5C7F4F", backgroundColor: "transparent" }}
								aria-label="View pricing plans"
							>
								Pricing
							</button>

							{/* Auth buttons */}
							{!user ? (
								<>
									<button
										onClick={handleSignup}
										className="px-6 py-3 text-sm font-bold text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
										style={{ backgroundColor: "#5C7F4F" }}
										aria-label="Sign up for account"
									>
										Start Assessment →
									</button>
									<button
										onClick={handleLogin}
										className="px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
										style={{ color: "#4A6A3F", backgroundColor: "transparent" }}
										aria-label="Sign in to your account"
									>
										Sign In
									</button>
								</>
							) : (
								<button
									onClick={handleSignup}
									className="px-6 py-3 text-sm font-bold text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
									style={{ backgroundColor: "#5C7F4F" }}
									aria-label="Go to your dashboard"
								>
									Go to Dashboard
								</button>
							)}
						</div>

						{/* Mobile menu button */}
						<button
							onClick={() => {
								setMobileMenuOpen(!mobileMenuOpen);
								setAnnounceMessage(
									mobileMenuOpen ? "Menu closed" : "Menu opened",
								);
							}}
							className="md:hidden px-3 py-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-4 text-sm font-medium"
							style={
								{
									"--tw-ring-color": "rgba(45, 95, 63, 0.4)",
									color: colors.neutral[600],
								} as React.CSSProperties
							}
							aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
							aria-expanded={mobileMenuOpen}
							aria-controls="mobile-menu"
						>
							{mobileMenuOpen ? "Close" : "Menu"}
						</button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{mobileMenuOpen && (
					<div
						id="mobile-menu"
						className="md:hidden bg-white border-t"
						style={{ borderColor: colors.neutral[100] }}
						role="navigation"
						aria-label="Mobile navigation"
					>
						<div className="px-4 py-4 space-y-2">
							<button
								onClick={() => {
									scrollToSection("protocol");
									setMobileMenuOpen(false);
								}}
								className="block w-full py-3 text-center text-sm font-semibold text-white rounded-full"
								style={{ backgroundColor: "#5C7F4F" }}
							>
								How It Works
							</button>
							<button
								onClick={() => {
									scrollToSection("pricing");
									setMobileMenuOpen(false);
								}}
								className="block w-full py-3 text-center text-sm font-semibold text-white rounded-full"
								style={{ backgroundColor: "#5C7F4F" }}
							>
								Pricing
							</button>
							{!user ? (
								<div
									className="space-y-2 pt-4 border-t"
									style={{ borderColor: colors.neutral[100] }}
								>
									<button
										onClick={handleSignup}
										className="block w-full py-3 text-center text-sm font-semibold text-white rounded-full"
										style={{ backgroundColor: "#5C7F4F" }}
									>
										Start Assessment
									</button>
									<button
										onClick={handleLogin}
										className="block w-full py-3 text-center text-sm font-semibold text-white rounded-full"
										style={{ backgroundColor: "#5C7F4F" }}
									>
										Sign In
									</button>
								</div>
							) : (
								<button
									onClick={handleSignup}
									className="block w-full py-2 text-center text-sm font-medium text-white rounded-lg"
									style={{ background: colors.gradients.accent }}
								>
									Go to Dashboard
								</button>
							)}
						</div>
					</div>
				)}
			</nav>

			<main id="main" role="main" aria-label="Main content">
				<section
					id="hero-section"
					className="relative py-20 px-4"
					aria-labelledby="hero-heading"
					style={{ backgroundColor: "#F5F0E8", borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}
				>
					<div className="container mx-auto max-w-5xl text-center">
						<span
							className="inline-flex items-center justify-center px-5 py-2 mb-6 rounded-full text-sm font-semibold tracking-wide"
							style={{
								backgroundColor: "rgba(92, 127, 79, 0.12)",
								color: colors.primary.green,
								border: "1px solid rgba(92, 127, 79, 0.35)",
							}}
						>
							Trusted by Interpreters Nationwide
						</span>
						<h1
							id="hero-heading"
							className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
							style={{ color: colors.neutral[900] }}
						>
							Perform at Your Peak. Every Assignment.
						</h1>
						<p
							className="text-lg sm:text-xl max-w-3xl mx-auto mb-8 leading-relaxed"
							style={{ color: colors.neutral[700] }}
						>
							Stop guessing about your performance. Get AI-powered insights backed by neuroscience to manage cognitive load, prevent burnout, and grow your capacity—with RID-approved CEUs included.
						</p>
						<ul className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
							{heroHighlights.map((item) => (
								<li
									key={item}
									className="px-4 py-2 rounded-full text-sm font-semibold"
									style={{
										backgroundColor: "rgba(92, 127, 79, 0.1)",
										color: colors.primary.green,
									}}
								>
									{item}
								</li>
							))}
						</ul>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<button
								onClick={() => {
									onGetStarted();
									navigate("/signup");
								}}
								className="px-10 py-4 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2"
								style={{ background: colors.gradients.green }}
								aria-label="Start your performance assessment"
							>
								Start Your Performance Assessment
							</button>
							<button
								onClick={() => scrollToSection("ecci-framework")}
								className="px-8 py-4 font-semibold rounded-xl transition-all focus:outline-none focus:ring-4 focus:ring-offset-2"
								style={{
									backgroundColor: "white",
									color: colors.primary.green,
									border: `2px solid ${colors.primary.green}`,
								}}
								aria-label="Learn more about the ECCI Framework"
							>
								Explore the ECCI™ Framework
							</button>
						</div>
					</div>
				</section>

				<section
					id="stats-bar"
					className="py-10 px-4"
					style={{ background: colors.primary.green }}
					aria-label="Platform impact metrics"
				>
					<div className="container mx-auto max-w-5xl">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
							{statsBarItems.map((item) => (
								<div
									key={item.label}
									className="py-4 px-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur text-white font-semibold tracking-widest text-sm uppercase"
								>
									{item.label}
								</div>
							))}
						</div>
					</div>
				</section>

				<section
					id="performance-suite"
					className="py-20 px-4"
					style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}
				>
					<div className="container mx-auto max-w-6xl">
						<div className="text-center mb-12">
							<h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.neutral[900] }}>
								Everything You Need to Optimize Performance
							</h2>
							<p className="text-lg max-w-3xl mx-auto" style={{ color: colors.neutral[600] }}>
								A complete, neuroscience-backed system that turns the proprietary ECCI™ Framework into daily decisions for interpreters and the organizations who rely on them.
							</p>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{performanceCards.map((card) => (
								<article
									key={card.title}
									className="h-full p-8 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all border border-gray-100 text-left"
									style={{ borderColor: "rgba(92, 127, 79, 0.1)" }}
								>
									<h3 className="text-xl font-semibold mb-4" style={{ color: colors.neutral[900] }}>
										{card.title}
									</h3>
									<p className="text-base leading-relaxed" style={{ color: colors.neutral[600] }}>
										{card.description}
									</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section
					id="built-for"
					className="py-20 px-4"
					style={{ backgroundColor: "#F5F0E8", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}
				>
					<div className="container mx-auto max-w-6xl">
						<div className="text-center mb-12">
							<h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.neutral[900] }}>
								Built for Every Interpreting Professional
							</h2>
							<p className="text-lg max-w-3xl mx-auto" style={{ color: colors.neutral[600] }}>
								Whether you interpret on-site, remotely, or across specialized domains, the ECCI™ Framework keeps your practice equitable, ethical, and sustainable.
							</p>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{audienceSegments.map((segment) => (
								<article
									key={segment.title}
									className="p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all border border-gray-100"
									style={{ borderColor: "rgba(92, 127, 79, 0.1)" }}
									aria-label={segment.title}
								>
									<h3 className="text-xl font-semibold mb-3" style={{ color: colors.neutral[900] }}>
										{segment.title}
									</h3>
									<p className="text-base leading-relaxed" style={{ color: colors.neutral[600] }}>
										{segment.description}
									</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section
					id="testimonials"
					className="py-20 px-4"
					style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}
				>
					<div className="container mx-auto max-w-5xl">
						<div className="text-center mb-12">
							<h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.neutral[900] }}>
								What Interpreters Are Saying
							</h2>
							<p className="text-lg max-w-3xl mx-auto" style={{ color: colors.neutral[600] }}>
								Social proof from practicing professionals and the creator behind the ECCI™ Framework.
							</p>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{testimonials.map((testimonial) => (
								<figure
									key={testimonial.name}
									className="h-full p-8 rounded-2xl bg-white shadow-md border border-gray-100"
									style={{ borderColor: "rgba(92, 127, 79, 0.12)" }}
								>
									<blockquote className="text-base leading-relaxed mb-6" style={{ color: colors.neutral[700] }}>
										"{testimonial.quote}"
									</blockquote>
									<figcaption className="text-sm font-semibold" style={{ color: colors.neutral[900] }}>
										{testimonial.name}
										<span className="block font-normal mt-1" style={{ color: colors.neutral[500] }}>
											{testimonial.role}
										</span>
									</figcaption>
								</figure>
							))}
						</div>
					</div>
				</section>

				<section
					id="rid-category"
					className="py-20 px-4"
					style={{ backgroundColor: "#F5F0E8", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}
				>
					<div className="container mx-auto max-w-4xl text-center">
						<span
							className="inline-flex items-center justify-center px-4 py-2 mb-4 rounded-full text-sm font-semibold uppercase tracking-wider"
							style={{
								backgroundColor: "rgba(92, 127, 79, 0.12)",
								color: colors.primary.green,
							}}
						>
							New RID Professional Category · Now Active
						</span>
						<h2 className="text-3xl font-bold mb-4" style={{ color: colors.neutral[900] }}>
							CEUs in "Studies of Healthy Minds & Bodies"
						</h2>
						<p className="text-lg mb-6" style={{ color: colors.neutral[600] }}>
							InterpretReflect is approved to deliver CEUs in this new category, helping you document your professional development in cognitive wellness and capacity building.
						</p>
						<p className="text-sm font-semibold uppercase tracking-wide" style={{ color: colors.neutral[500] }}>
							Delivered in partnership with Building Bridges Global, LLC · RID Approved Sponsor #2309
						</p>
					</div>
				</section>

				<section
					id="ecci-framework"
					className="py-20 px-4"
					style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}
					aria-labelledby="ecci-heading"
				>
					<div className="container mx-auto max-w-6xl">
						<div className="text-center mb-12">
							<h2 id="ecci-heading" className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: colors.neutral[900] }}>
								The ECCI™ Framework
							</h2>
							<p className="text-lg font-semibold mb-4" style={{ color: colors.neutral[600] }}>
								Emotional & Cultural Competencies for Interpreters
							</p>
							<p className="text-lg max-w-3xl mx-auto" style={{ color: colors.neutral[600] }}>
								Our framework combines 16 neuroscience-based methods that measure how you process information, manage cultural context, regulate emotional labor, and maintain mental capacity during interpreting.
							</p>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
							{frameworkHighlights.map((highlight) => (
								<article
									key={highlight.title}
									className="h-full p-6 rounded-2xl bg-white shadow-md border border-gray-100"
									style={{ borderColor: "rgba(92, 127, 79, 0.12)" }}
									aria-label={highlight.title}
								>
									<h3 className="text-xl font-semibold mb-3" style={{ color: colors.neutral[900] }}>
										{highlight.title}
									</h3>
									<p className="text-base leading-relaxed" style={{ color: colors.neutral[600] }}>
										{highlight.description}
									</p>
								</article>
							))}
						</div>
						<div
							className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center"
							style={{ borderColor: "rgba(92, 127, 79, 0.12)" }}
						>
							<p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: colors.neutral[500] }}>
								Research Foundation
							</p>
							<p className="text-base max-w-3xl mx-auto" style={{ color: colors.neutral[600] }}>
								Based on cognitive science, interoception research, performance psychology, cultural neuroscience, and interpreter workload studies.
							</p>
						</div>
					</div>
				</section>

				<section
					id="protocol"
					className="py-20 px-4"
					style={{ backgroundColor: "#F5F0E8", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}
				>
					<div className="container mx-auto max-w-5xl">
						<div className="text-center mb-12">
							<h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.neutral[900] }}>
								Performance Optimization Protocol
							</h2>
							<p className="text-lg max-w-3xl mx-auto" style={{ color: colors.neutral[600] }}>
								A practical, repeatable process that transforms ECCI™ insights into daily practice improvements and credentialed growth.
							</p>
						</div>
						<ol className="space-y-6">
							{protocolSteps.map((step, index) => (
								<li
									key={step.title}
									className="flex flex-col sm:flex-row sm:items-start gap-4 p-6 bg-white rounded-2xl shadow-md border border-gray-100"
									style={{ borderColor: "rgba(92, 127, 79, 0.12)" }}
								>
									<span
										className="inline-flex h-10 w-10 items-center justify-center rounded-full font-semibold"
										style={{
											backgroundColor: "rgba(92, 127, 79, 0.15)",
											color: colors.primary.green,
										}}
									>
										{index + 1}
									</span>
									<div className="text-left">
										<h3 className="text-xl font-semibold mb-2" style={{ color: colors.neutral[900] }}>
											{step.title}
										</h3>
										<p className="text-base leading-relaxed" style={{ color: colors.neutral[600] }}>
											{step.description}
										</p>
									</div>
								</li>
							))}
						</ol>
					</div>
				</section>

				<section
					id="data-case"
					className="py-20 px-4"
					style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}
				>
					<div className="container mx-auto max-w-6xl">
						<div className="text-center mb-12">
							<h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.neutral[900] }}>
								The Data-Driven Case
							</h2>
							<p className="text-lg max-w-3xl mx-auto" style={{ color: colors.neutral[600] }}>
								National studies from 2024-2025 reveal what interpreters are facing—and why a systematic solution matters now.
							</p>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
							{dataStats.map((stat) => (
								<div
									key={stat.figure}
									className="p-6 text-center rounded-2xl bg-white shadow-md border border-gray-100"
									style={{ borderColor: "rgba(92, 127, 79, 0.12)" }}
								>
									<div className="text-4xl font-bold mb-2" style={{ color: colors.primary.green }}>
										{stat.figure}
									</div>
									<p className="text-sm leading-relaxed" style={{ color: colors.neutral[600] }}>
										{stat.label}
									</p>
								</div>
							))}
						</div>
						<div className="text-center">
							<p className="text-sm text-gray-600 italic">
								These numbers reflect systemic challenges, not personal inadequacy. Your work demands specialized support.
							</p>
						</div>
					</div>
				</section>

				<section
					id="pricing"
					className="py-20 px-4"
					style={{ backgroundColor: "#E8F3E5", borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}
					aria-labelledby="pricing-heading"
				>
					<div className="container mx-auto max-w-6xl">
						<div className="text-center mb-12">
							<h2
								id="pricing-heading"
								className="text-3xl sm:text-4xl font-bold mb-4"
								style={{ color: colors.neutral[900] }}
							>
								Simple, Transparent Pricing
							</h2>
							<p
								className="text-xl mb-2"
								style={{ color: colors.neutral[600] }}
							>
								Choose the plan that fits your wellness journey
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{/* Essential Plan */}
							<div
								className="rounded-xl border-2 relative overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow"
								style={{ borderColor: "#5C7F4F" }}
							>
								<div
									className="absolute top-0 left-0 right-0 text-white text-center py-2 text-sm font-bold"
									style={{ background: "#5C7F4F" }}
								>
									AVAILABLE NOW
								</div>

								<div className="p-6 mt-10">
									<h3
										className="text-2xl font-bold mb-2"
										style={{ color: colors.neutral[900] }}
									>
										Essential
									</h3>
									<p className="text-gray-600 mb-4">
										Your daily wellness companion
									</p>

									<div className="mb-6">
										<span
											className="text-4xl font-bold"
											style={{ color: colors.neutral[900] }}
										>
											$12.99
										</span>
										<span className="text-gray-600">/month</span>
									</div>

									<ul className="space-y-3 mb-8">
										<li className="text-sm text-gray-700">
											Daily reflection prompts
										</li>
										<li className="text-sm text-gray-700">
											Stress reset tools
										</li>
										<li className="text-sm text-gray-700">Progress tracking</li>
										<li className="text-sm text-gray-700">Mobile responsive</li>
										<li className="text-sm text-gray-700">Private & secure</li>
									</ul>

									<button
										onClick={handleSignup}
										className="w-full py-3 rounded-lg font-semibold text-white transition-all focus:outline-none focus:ring-4 focus:ring-green-600 focus:ring-opacity-50"
										style={{ background: colors.gradients.green }}
										aria-label="Start your performance assessment with the Essential plan"
									>
										Start Your Performance Assessment
									</button>
								</div>
							</div>

							{/* Professional Plan */}
							<div className="rounded-xl border-2 border-gray-300 relative overflow-hidden bg-white shadow-lg opacity-75">
								<div className="absolute top-0 left-0 right-0 bg-gray-400 text-white text-center py-2 text-sm font-bold">
									COMING SOON
								</div>

								<div className="p-6 mt-10">
									<h3
										className="text-2xl font-bold mb-2"
										style={{ color: colors.neutral[900] }}
									>
										Professional
									</h3>
									<p className="text-gray-600 mb-4">
										Advanced practice support
									</p>

									<div className="mb-6">
										<span className="text-4xl font-bold text-gray-400">
											$24.99
										</span>
										<span className="text-gray-400">/month</span>
									</div>

									<ul className="space-y-3 mb-8">
										<li className="text-sm text-gray-500">
											Everything in Essential
										</li>
										<li className="text-sm text-gray-500">
											Advanced analytics
										</li>
										<li className="text-sm text-gray-500">CEU Tracking & Processing</li>
										<li className="text-sm text-gray-500">
											Wellness workshops
										</li>
										<li className="text-sm text-gray-500">Priority support</li>
									</ul>

									<button
										disabled
										className="w-full py-3 rounded-lg font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
									>
										Coming Soon
									</button>
								</div>
							</div>

							{/* Enterprise Plan */}
							<div className="rounded-xl border-2 border-gray-300 relative overflow-hidden bg-white shadow-lg opacity-75">
								<div className="absolute top-0 left-0 right-0 bg-gray-400 text-white text-center py-2 text-sm font-bold">
									COMING SOON
								</div>

								<div className="p-6 mt-10">
									<h3
										className="text-2xl font-bold mb-2"
										style={{ color: colors.neutral[900] }}
									>
										Enterprise
									</h3>
									<p className="text-gray-600 mb-4">
										For agencies, VRS/VRI, and educational programs
									</p>

									<div className="mb-6">
										<span className="text-3xl font-bold text-gray-400">
											Customized
										</span>
										<span className="text-gray-400"> Pricing</span>
									</div>

									<ul className="space-y-3 mb-8">
										<li className="text-sm text-gray-500">Everything in Pro</li>
										<li className="text-sm text-gray-500">
											Executive dashboard
										</li>
										<li className="text-sm text-gray-500">
											Group access for staff, interpreters, and learners
										</li>
										<li className="text-sm text-gray-500">
											Administrative controls
										</li>
										<li className="text-sm text-gray-500">
											Organization-wide empowerment tools
										</li>
									</ul>

									<button
										disabled
										className="w-full py-3 rounded-lg font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
									>
										Coming Soon
									</button>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Final CTA */}
				<section
					id="final-cta"
					className="py-20 px-4"
					style={{ background: "#5C7F4F" }}
					aria-labelledby="cta-heading"
				>
					<div className="container mx-auto max-w-4xl text-center">
						<h2
							id="cta-heading"
							className="text-3xl sm:text-4xl font-bold text-white mb-6"
						>
							Start Your Performance Assessment
						</h2>
						<p className="text-xl text-white/90 mb-8">
							Join the only interpreter platform that blends the ECCI™ Framework, Catalyst insights, and RID-approved CEUs into one seamless workflow.
						</p>
						<button
							onClick={handleSignup}
							className="px-8 py-4 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
							style={{
								background: "white",
								color: "#5C7F4F",
								fontSize: "1.125rem",
							}}
							aria-label="Start your performance assessment now"
						>
							Start Your Performance Assessment
						</button>
					</div>
				</section>
			</main>

			{/* Footer */}
			<Footer />

			{/* Modals */}
			<ModernAuthModal
				isOpen={authModalOpen}
				onClose={() => setAuthModalOpen(false)}
				defaultMode={authMode === "signin" ? "signin" : "signup"}
				onSuccess={() => {
					setAuthModalOpen(false);
					navigate("/dashboard");
				}}
			/>
			<PricingModal
				isOpen={pricingModalOpen}
				onClose={() => setPricingModalOpen(false)}
				onSelectPlan={handleSelectPlan}
			/>
			<WaitlistModal
				isOpen={waitlistModalOpen}
				onClose={() => setWaitlistModalOpen(false)}
				plan={waitlistPlan}
			/>

			{/* Add CSS animations */}
			<style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .group:hover .group-hover\\:animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .7; }
        }
      `}</style>
		</div>
	);
}

export default LandingPageEnhanced;
