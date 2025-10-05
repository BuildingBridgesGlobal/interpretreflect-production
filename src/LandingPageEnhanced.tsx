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
	console.log("LandingPageEnhanced: Rendering component");
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
	console.log("LandingPageEnhanced: State initialized");
	const [announceMessage, setAnnounceMessage] = useState("");

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
							backgroundColor: colors.primary.teal,
							"--tw-ring-color": "rgba(20, 184, 166, 0.4)",
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
							backgroundColor: colors.primary.teal,
							"--tw-ring-color": "rgba(20, 184, 166, 0.4)",
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
							backgroundColor: colors.primary.teal,
							"--tw-ring-color": "rgba(20, 184, 166, 0.4)",
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
								onClick={() => scrollToSection("how-it-works")}
								className="px-4 py-1.5 text-xs font-semibold text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
								style={{ background: colors.gradients.green }}
								aria-label="Learn how interpreterRx works"
							>
								How It Works
							</button>
							<button
								onClick={() => scrollToSection("pricing")}
								className="px-4 py-1.5 text-xs font-semibold text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
								style={{ background: colors.gradients.green }}
								aria-label="View pricing plans"
							>
								Pricing
							</button>

							{/* Auth buttons */}
							{!user ? (
								<>
									<button
										onClick={handleSignup}
										className="px-4 py-1.5 text-xs font-semibold text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
										style={{ background: colors.gradients.green }}
										aria-label="Sign up for account"
									>
										Get Started
									</button>
									<button
										onClick={handleLogin}
										className="px-4 py-1.5 text-xs font-semibold text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
										style={{ background: colors.gradients.green }}
										aria-label="Sign in to your account"
									>
										Sign In
									</button>
								</>
							) : (
								<button
									onClick={handleSignup}
									className="px-4 py-1.5 text-xs font-semibold text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
									style={{ background: colors.gradients.green }}
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
									scrollToSection("how-it-works");
									setMobileMenuOpen(false);
								}}
								className="block w-full py-2 text-center text-xs font-semibold text-white rounded-full"
								style={{ background: colors.gradients.green }}
							>
								How It Works
							</button>
							<button
								onClick={() => {
									scrollToSection("pricing");
									setMobileMenuOpen(false);
								}}
								className="block w-full py-2 text-center text-xs font-semibold text-white rounded-full"
								style={{ background: colors.gradients.green }}
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
										className="block w-full py-2 text-center text-xs font-semibold text-white rounded-full"
										style={{ background: colors.gradients.green }}
									>
										Get Started
									</button>
									<button
										onClick={handleLogin}
										className="block w-full py-2 text-center text-xs font-semibold text-white rounded-full"
										style={{ background: colors.gradients.green }}
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
				{/* Enhanced Hero Section with better visual hierarchy */}
				<section className="relative py-20 px-4" aria-labelledby="hero-heading" style={{ backgroundColor: "#F5F0E8", borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}>
					<div className="container mx-auto max-w-6xl">
						{/* Main headline with emphasis on wellness */}
						<div className="text-center mb-12">
							<h1
							id="hero-heading"
							className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 leading-tight"
							style={{ color: colors.neutral[900] }}
							>
							Interpreter Burnout is at{" "}
							<span style={{ color: "#DC2626" }}>24%</span>
							</h1>
							<h2
							className="text-2xl sm:text-3xl font-semibold mb-6 max-w-3xl mx-auto"
							style={{ color: colors.neutral[800] }}
							>
							You don't have to be part of that statistic.
							</h2>
							<p
							className="text-lg sm:text-xl max-w-3xl mx-auto mb-8 leading-relaxed"
							style={{ color: colors.neutral[600] }}
							>
							The only wellness platform built specifically for interpreters. Evidence-based tools to process trauma, strengthen boundaries, and build confidence for sustainable careers.
							</p>
						</div>

						{/* Primary CTA - Get Started */}
						<div className="flex flex-col items-center gap-4 mb-16">
							<button
								onClick={() => {
									console.log("Get Started clicked");
									navigate("/signup");
								}}
								className="group px-10 py-5 text-white font-bold rounded-xl transition-all transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-offset-2 relative overflow-hidden"
								style={{
									background: colors.gradients.green,
									fontSize: "1.25rem",
									color: "white",
								}}
								aria-label="Get started with InterpretReflect"
							>
								<span className="relative z-10">Get Started</span>
							</button>
						</div>

						{/* Diverse interpreter illustrations/representation */}
						<div
							className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
							role="region"
							aria-label="Professional specialization options"
						>
							{/* Sign Language Interpreter */}
							<article
								className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all focus-within:ring-4"
								tabIndex={0}
								aria-label="Sign language interpreter resources"
								style={
									{
										"--tw-ring-color": "rgba(45, 95, 63, 0.4)",
									} as React.CSSProperties
								}
							>
								<div className="mb-4">
									<h3
										className="font-semibold text-lg"
										style={{ color: colors.neutral[800] }}
									>
										Sign Language
									</h3>
								</div>
								<p
									className="text-base"
									style={{ color: colors.neutral[600], lineHeight: "1.6" }}
								>
									Protect your career longevity with wellness tools designed specifically for the unique demands of sign language interpreting
								</p>
							</article>

							{/* Spoken Language Interpreter */}
							<article
								className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all focus-within:ring-4"
								tabIndex={0}
								aria-label="Spoken language interpreter resources"
								style={
									{
										"--tw-ring-color": "rgba(45, 95, 63, 0.4)",
									} as React.CSSProperties
								}
							>
								<div className="mb-4">
									<h3
										className="font-semibold text-lg"
										style={{ color: colors.neutral[800] }}
									>
										Spoken Language
									</h3>
								</div>
								<p
									className="text-base"
									style={{ color: colors.neutral[600], lineHeight: "1.6" }}
								>
									Stay sharp and resilient across all settings, from high-stakes medical and legal work to community interpreting, no matter your language pair
								</p>
							</article>

							{/* Conference/Remote Interpreter */}
							<article
								className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all focus-within:ring-4"
								tabIndex={0}
								aria-label="Remote and hybrid interpreter resources"
								style={
									{
										"--tw-ring-color": "rgba(45, 95, 63, 0.4)",
									} as React.CSSProperties
								}
							>
								<div className="mb-4">
									<h3
										className="font-semibold text-lg"
										style={{ color: colors.neutral[800] }}
									>
										Remote & Hybrid
									</h3>
								</div>
								<p
									className="text-base"
									style={{ color: colors.neutral[600], lineHeight: "1.6" }}
								>
									Combat screen fatigue and isolation with proven strategies that keep remote and VRI interpreters thriving, not just surviving
								</p>
							</article>

							{/* High-Stress Professions */}
							<article
								className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all focus-within:ring-4"
								tabIndex={0}
								aria-label="High-stress professions resources"
								style={
									{
										"--tw-ring-color": "rgba(45, 95, 63, 0.4)",
									} as React.CSSProperties
								}
							>
								<div className="mb-4">
									<h3
										className="font-semibold text-lg"
										style={{ color: colors.neutral[800] }}
									>
										High-Stress Situations
									</h3>
								</div>
								<p
									className="text-base"
									style={{ color: colors.neutral[600], lineHeight: "1.6" }}
								>
									Wellness tools for interpreters navigating medical emergencies, legal proceedings, crisis interventions, and high-stakes negotiations
								</p>
							</article>
						</div>

						{/* Trust badges with microinteractions */}
						<div
							className="flex flex-wrap justify-center items-center gap-8 py-8"
							role="list"
							aria-label="Trust and security features"
						>
							<div
								className="opacity-80 hover:opacity-100 transition-opacity"
								role="listitem"
							>
								<span
									className="text-base font-medium"
									style={{ color: colors.neutral[700] }}
								>
									HIPAA Compliant
								</span>
							</div>
							<div
								className="opacity-80 hover:opacity-100 transition-opacity"
								role="listitem"
							>
								<span
									className="text-base font-medium"
									style={{ color: colors.neutral[700] }}
								>
									Evidence-Based
								</span>
							</div>
							<div
								className="opacity-80 hover:opacity-100 transition-opacity"
								role="listitem"
							>
								<span
									className="text-base font-medium"
									style={{ color: colors.neutral[700] }}
								>
									Built with Love
								</span>
							</div>
						</div>
					</div>
				</section>

				{/* Modern Problems Section - NEW */}
				<section
					id="how-it-works"
					className="py-20 px-4"
					style={{ backgroundColor: "#E8F3E5", borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}
				>
					<div className="container mx-auto max-w-6xl">
						<div className="text-center mb-12">
							<span
								className="text-sm font-bold px-4 py-2 rounded-full inline-block mb-4"
								style={{
									backgroundColor: colors.status.warning + "40",
									color: colors.neutral[900],
								}}
							>
								MODERN PROBLEMS, EVIDENCE-BASED SOLUTIONS
							</span>
							<h2
								className="text-3xl sm:text-4xl font-bold mb-4"
								style={{ color: colors.neutral[900] }}
							>
								The Challenges Only You Understand
							</h2>
							<p
								className="text-lg max-w-3xl mx-auto"
								style={{ color: colors.neutral[600] }}
							>
								These aren't personal failings. They're documented, measurable responses to the cognitive and emotional demands of your work.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{/* Vicarious Trauma */}
							<div className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:shadow-xl transition-all">
								<h3
									className="text-xl font-bold mb-2"
									style={{ color: colors.neutral[800] }}
								>
									Vicarious Trauma
								</h3>
								<p className="text-xs font-semibold mb-2" style={{ color: colors.primary.sage }}>
									41.5% of interpreters report experiencing vicarious trauma over their careers.
								</p>
								<p
									className="text-sm mb-4"
									style={{ color: colors.neutral[600] }}
								>
									When you facilitate communication during a medical diagnosis, legal interrogation, or family crisis, your nervous system processes that content as if it's happening to you. This isn't weakness. It's neurobiology.
								</p>
							</div>

							{/* Imposter Syndrome */}
							<div className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:shadow-xl transition-all">
								<h3
									className="text-xl font-bold mb-2"
									style={{ color: colors.neutral[800] }}
								>
									Imposter Syndrome
								</h3>
								<p className="text-xs font-semibold mb-2" style={{ color: colors.primary.sage }}>
									57.5% of interpreters experience imposter syndrome.
								</p>
								<p
									className="text-sm mb-4"
									style={{ color: colors.neutral[600] }}
								>
									High-performing professionals in cognitively demanding fields experience imposter syndrome at elevated rates. You're certified. You're competent. Your brain is simply overweighting mistakes and underweighting successes.
								</p>
							</div>

							{/* Professional Boundaries */}
							<div className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:shadow-xl transition-all">
								<h3
									className="text-xl font-bold mb-2"
									style={{ color: colors.neutral[800] }}
								>
									Boundary Management
								</h3>
								<p className="text-xs font-semibold mb-2" style={{ color: colors.primary.sage }}>
									50% of interpreters report difficulty maintaining professional boundaries.
								</p>
								<p
									className="text-sm mb-4"
									style={{ color: colors.neutral[600] }}
								>
									One moment: neutral conduit. Next moment: someone's in crisis and every instinct says to help beyond your role. This constant code-switching creates documented stress on executive function.
								</p>
							</div>

							{/* Technology Stress */}
							<div className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:shadow-xl transition-all">
								<h3
									className="text-xl font-bold mb-2"
									style={{ color: colors.neutral[800] }}
								>
									Technology-Mediated Fatigue
								</h3>
								<p className="text-xs font-semibold mb-2" style={{ color: colors.primary.sage }}>
									Screen-based interpretation creates unique physiological and psychological stressors.
								</p>
								<p
									className="text-sm mb-4"
									style={{ color: colors.neutral[600] }}
								>
									Remote platforms introduce: reduced visual field, delayed feedback loops, tech-induced cognitive load, professional isolation, and ergonomic challenges that compound over multiple sessions.
								</p>
							</div>
						</div>

						{/* Statistics Bar */}
						<div
							className="mt-12 p-8 rounded-2xl"
							style={{ background: "#5C7F4F" }}
						>
							<div className="text-center mb-6">
								<h3 className="text-2xl font-bold text-white mb-2">THE RESEARCH IS CLEAR</h3>
								<p className="text-sm text-white/90 italic">Recent national studies (2025) of interpreters show:</p>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white mb-6">
								<div>
									<div className="text-4xl font-bold">24%</div>
									<div className="text-sm opacity-90">meet clinical burnout criteria</div>
								</div>
								<div>
									<div className="text-4xl font-bold">41.5%</div>
									<div className="text-sm opacity-90">
										have experienced vicarious trauma
									</div>
								</div>
								<div>
									<div className="text-4xl font-bold">57.5%</div>
									<div className="text-sm opacity-90">
										report imposter syndrome
									</div>
								</div>
								<div>
									<div className="text-4xl font-bold">50%</div>
									<div className="text-sm opacity-90">
										struggle with boundary management
									</div>
								</div>
							</div>
							<div className="text-center">
								<p className="text-sm text-white/90 italic">These numbers reflect systemic challenges, not personal inadequacy. Your work demands specialized support.</p>
							</div>
						</div>
					</div>
				</section>

				{/* Features Section with better visual organization */}
				<section
					className="py-20 px-4"
					aria-labelledby="features-heading"
					style={{ backgroundColor: "#F5F0E8", borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}
				>
					<div className="container mx-auto max-w-6xl">
						<div className="text-center mb-12">
						<h2
						id="features-heading"
						className="text-3xl sm:text-4xl font-bold mb-4"
						style={{ color: colors.neutral[900] }}
						>
						Your Optimization Toolkit
						</h2>
						<p
						className="text-lg max-w-2xl mx-auto"
						style={{ color: colors.neutral[700], lineHeight: "1.6" }}
						>
						Protocols Built on Peer-Reviewed Research
						</p>
						</div>

						<div
							className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
							role="list"
						>
							{/* Feature cards with hover effects */}
							{[
								{
									title: "Stress Reset Protocols",
									description:
										"Immediate nervous system regulation techniques for between assignments. Based on polyvagal theory and performance psychology research.",
									color: "#5C7F4F",
								},
								{
									title: "AI Wellness Coach",
									description:
										"Personalized support trained on interpreter-specific challenges and evidence-based interventions. Not generic advice.",
									color: "#5C7F4F",
								},
								{
									title: "Reflection Studio",
									description:
										"Structured processing protocols for vicarious trauma and challenging assignments. Create psychological closure at the end of difficult work.",
									color: "#5C7F4F",
								},
								{
									title: "Pattern Recognition",
									description:
										"Track your data over time. Identify what supports your performance and what depletes you. Make informed decisions about your practice.",
									color: "#5C7F4F",
								},
							].map((feature, index) => (
								<article
									key={index}
									className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1 focus-within:ring-4"
									style={
										{
											"--tw-ring-color": "rgba(45, 95, 63, 0.4)",
										} as React.CSSProperties
									}
									tabIndex={0}
									role="listitem"
									aria-label={`Feature: ${feature.title}`}
								>
									<h3
										className="text-xl font-semibold mb-3"
										style={{ color: colors.neutral[800] }}
									>
										{feature.title}
									</h3>
									<p
										className="text-base leading-relaxed"
										style={{ color: colors.neutral[700], lineHeight: "1.6" }}
									>
										{feature.description}
									</p>
								</article>
							))}
						</div>
					</div>
				</section>

				{/* Pricing Section */}
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
										className="w-full py-3 rounded-lg font-semibold text-white transition-all focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50"
										style={{ background: colors.gradients.green }}
										aria-label="Get started with Core plan"
									>
										Get Started
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
					className="py-20 px-4"
					style={{ background: "#5C7F4F" }}
					aria-labelledby="cta-heading"
				>
					<div className="container mx-auto max-w-4xl text-center">
						<h2
							id="cta-heading"
							className="text-3xl sm:text-4xl font-bold text-white mb-6"
						>
							Start Your Wellness Journey Today
						</h2>
						<p className="text-xl text-white/90 mb-8">
							Evidence-based tools • Built by interpreters, for interpreters
						</p>
						<button
							onClick={handleSignup}
							className="px-8 py-4 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
							style={{
								background: "white",
								color: "#5C7F4F",
								fontSize: "1.125rem",
							}}
							aria-label="Start your wellness journey today"
						>
							Get Started Today
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
