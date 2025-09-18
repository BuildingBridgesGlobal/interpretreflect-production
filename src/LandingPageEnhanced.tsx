import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './components/Logo';
import { ModernAuthModal } from './components/auth/ModernAuthModal';
import { PricingModal } from './components/PricingModal';
import { WaitlistModal } from './components/WaitlistModal';
import { Footer } from './components/Footer';
import { useAuth } from './contexts/AuthContext';
import { CheckCircle, Sparkles, Award, Users, Heart, Shield, Clock } from 'lucide-react';
import { HeartPulseIcon, SecureLockIcon, CommunityIcon, TargetIcon, GrowthIcon, HourglassPersonIcon, NotepadIcon, ChatBubbleIcon } from './components/CustomIcon';

interface LandingPageProps {
  onGetStarted: () => void;
}

// Enhanced color palette - calming, accessible, and modern
const colors = {
  // Primary palette - earth tones and calming colors
  primary: {
    sage: 'rgb(92, 127, 79)',      // Main brand color
    mint: 'rgb(92, 127, 79)',      // Secondary green
    earth: '#8B7355',     // Warm earth tone
    ocean: '#5B8C94',     // Calming blue-green
    lavender: '#9B8AA3',  // Soft purple
  },
  // Background gradients
  gradients: {
    hero: 'linear-gradient(135deg, #F7F5F2 0%, #E8EDE5 50%, #DDE5D9 100%)',
    card: 'linear-gradient(145deg, #FFFFFF 0%, #F9F8F6 100%)',
    accent: 'linear-gradient(135deg, rgb(92, 127, 79) 0%, rgb(92, 127, 79) 100%)',
    ocean: 'linear-gradient(135deg, #5B8C94 0%, #7FA5AD 100%)',
  },
  // Neutral colors
  neutral: {
    900: '#1A1F1C',
    800: '#2D3A31',
    700: '#445248',
    600: '#5C6A60',
    500: '#748278',
    400: '#8C9A90',
    300: '#A4B2A8',
    200: '#C2CFC5',
    100: '#E0E7E2',
    50: '#F5F7F5',
  },
  // Semantic colors
  status: {
    success: '#4A8B50',
    warning: '#D4A574',
    error: '#C67B6B',
    info: '#6B94C6',
  }
};

function LandingPageEnhanced({ onGetStarted }: LandingPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
  const [waitlistPlan] = useState<'professional' | 'organizations'>('professional');
  const [showStripeMessage, setShowStripeMessage] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announceMessage, setAnnounceMessage] = useState('');

  const handleLogin = () => {
    setAuthMode('signin');
    setAuthModalOpen(true);
  };

  const handleSignup = () => {
    // Redirect to seamless signup page
    navigate('/signup');
  };



  const handleSelectPlan = () => {
    setWaitlistModalOpen(false);
    onGetStarted();
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.hero }}>
      {/* Live region for screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announceMessage}
      </div>

      {/* Skip navigation links for accessibility */}
      <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-0 focus-within:left-0 focus-within:right-0 focus-within:z-50 focus-within:bg-white focus-within:p-2 focus-within:shadow-lg">
        <a 
          href="#main" 
          className="inline-block px-4 py-2 mr-2 text-white rounded-lg focus:ring-4 focus:outline-none"
          style={{ backgroundColor: 'rgb(92, 127, 79)', '--tw-ring-color': 'rgba(92, 127, 79, 0.4)' } as React.CSSProperties}
        >
          Skip to main content
        </a>
        <a 
          href="#navigation" 
          className="inline-block px-4 py-2 mr-2 text-white rounded-lg focus:ring-4 focus:outline-none"
          style={{ backgroundColor: 'rgb(92, 127, 79)', '--tw-ring-color': 'rgba(92, 127, 79, 0.4)' } as React.CSSProperties}
        >
          Skip to navigation
        </a>
        <a 
          href="#footer" 
          className="inline-block px-4 py-2 text-white rounded-lg focus:ring-4 focus:outline-none"
          style={{ backgroundColor: 'rgb(92, 127, 79)', '--tw-ring-color': 'rgba(92, 127, 79, 0.4)' } as React.CSSProperties}
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

            {/* Desktop Navigation - Compact Green Pills */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="px-4 py-1.5 text-xs font-semibold text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: 'rgb(92, 127, 79)' }}
                aria-label="Learn how interpreterRx works"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="px-4 py-1.5 text-xs font-semibold text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: 'rgb(92, 127, 79)' }}
                aria-label="View pricing plans"
              >
                Pricing
              </button>

              {/* Auth buttons */}
              {!user ? (
                <>
                  <button
                    onClick={handleSignup}
                    className="px-4 py-1.5 text-xs font-semibold text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ backgroundColor: 'rgb(92, 127, 79)' }}
                    aria-label="Sign up for account"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={handleLogin}
                    className="px-4 py-1.5 text-xs font-semibold text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ backgroundColor: 'rgb(92, 127, 79)' }}
                    aria-label="Sign in to your account"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignup}
                  className="px-4 py-1.5 text-xs font-semibold text-white rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ backgroundColor: 'rgb(92, 127, 79)' }}
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
                setAnnounceMessage(mobileMenuOpen ? 'Menu closed' : 'Menu opened');
              }}
              className="md:hidden px-3 py-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-4 text-sm font-medium"
              style={{ '--tw-ring-color': 'rgba(92, 127, 79, 0.4)' } as React.CSSProperties}
              style={{ color: colors.neutral[600] }}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? 'Close' : 'Menu'}
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
                  scrollToSection('how-it-works');
                  setMobileMenuOpen(false);
                }}
                className="block w-full py-2 text-center text-xs font-semibold text-white rounded-full"
                style={{ backgroundColor: 'rgb(92, 127, 79)' }}
              >
                How It Works
              </button>
              <button
                onClick={() => {
                  scrollToSection('pricing');
                  setMobileMenuOpen(false);
                }}
                className="block w-full py-2 text-center text-xs font-semibold text-white rounded-full"
                style={{ backgroundColor: 'rgb(92, 127, 79)' }}
              >
                Pricing
              </button>
              {!user ? (
                <div className="space-y-2 pt-4 border-t" style={{ borderColor: colors.neutral[100] }}>
                  <button onClick={handleSignup} className="block w-full py-2 text-center text-xs font-semibold text-white rounded-full"
                    style={{ backgroundColor: 'rgb(92, 127, 79)' }}
                  >
                    Get Started
                  </button>
                  <button onClick={handleLogin} className="block w-full py-2 text-center text-xs font-semibold text-white rounded-full"
                    style={{ backgroundColor: 'rgb(92, 127, 79)' }}
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <button onClick={handleSignup} className="block w-full py-2 text-center text-sm font-medium text-white rounded-lg"
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
        <section className="relative py-20 px-4" aria-labelledby="hero-heading">
          <div className="container mx-auto max-w-6xl">

            {/* Main headline with emphasis on wellness */}
            <div className="text-center mb-12">
              <h1 
                id="hero-heading"
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                style={{ color: colors.neutral[900] }}
              >
                Prevent Burnout{' '}
                <span style={{ color: colors.primary.sage }}>
                  Before
                </span>{' '}
                It Starts
              </h1>
              <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed"
                style={{ color: colors.neutral[600] }}
              >
                The only wellness platform built specifically for interpreters. Stop vicarious trauma, 
                overcome imposter syndrome, and maintain healthy boundaries with evidence-based tools.
              </p>
              <p className="text-base max-w-2xl mx-auto mt-2"
                style={{ color: colors.neutral[500] }}
              >
                82% of interpreters experience burnout. You don't have to be one of them.
              </p>
            </div>

            {/* Primary CTA - Get Started */}
            <div className="flex flex-col items-center gap-4 mb-16">
              <button
                onClick={() => {
                  console.log('Get Started clicked');
                  navigate('/signup');
                }}
                className="group px-10 py-5 text-white font-bold rounded-xl transition-all transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-offset-2 relative overflow-hidden"
                style={{
                  background: 'rgb(92, 127, 79)',
                  fontSize: '1.25rem',
                  color: 'white'
                }}
                aria-label="Get started with InterpretReflect"
              >
                <span className="relative z-10">Get Started</span>
              </button>
              <p className="text-sm text-gray-600">
                No credit card required • Cancel anytime
              </p>
            </div>

            {/* Diverse interpreter illustrations/representation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" role="region" aria-label="Interpreter specialization options">
              {/* Sign Language Interpreter */}
              <article className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all focus-within:ring-4" tabIndex={0} aria-label="Sign language interpreter resources" style={{ '--tw-ring-color': 'rgba(92, 127, 79, 0.4)' } as React.CSSProperties}>
                <div className="mb-4">
                  <h3 className="font-semibold text-lg" style={{ color: colors.neutral[800] }}>
                    Sign Language
                  </h3>
                </div>
                <p className="text-base" style={{ color: colors.neutral[600], lineHeight: '1.6' }}>
                  Supporting all sign language interpreters with 
                  specialized wellness resources
                </p>
              </article>

              {/* Spoken Language Interpreter */}
              <article className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all focus-within:ring-4" tabIndex={0} aria-label="Spoken language interpreter resources" style={{ '--tw-ring-color': 'rgba(92, 127, 79, 0.4)' } as React.CSSProperties}>
                <div className="mb-4">
                  <h3 className="font-semibold text-lg" style={{ color: colors.neutral[800] }}>
                    Spoken Language
                  </h3>
                </div>
                <p className="text-base" style={{ color: colors.neutral[600], lineHeight: '1.6' }}>
                  Tools for conference, medical, legal, and community interpreters across 
                  all language pairs
                </p>
              </article>

              {/* Conference/Remote Interpreter */}
              <article className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all focus-within:ring-4" tabIndex={0} aria-label="Remote and hybrid interpreter resources" style={{ '--tw-ring-color': 'rgba(92, 127, 79, 0.4)' } as React.CSSProperties}>
                <div className="mb-4">
                  <h3 className="font-semibold text-lg" style={{ color: colors.neutral[800] }}>
                    Remote & Hybrid
                  </h3>
                </div>
                <p className="text-base" style={{ color: colors.neutral[600], lineHeight: '1.6' }}>
                  Addressing screen fatigue, isolation, and tech stress for VRI and 
                  remote platform interpreters
                </p>
              </article>
            </div>

            {/* Trust badges with microinteractions */}
            <div className="flex flex-wrap justify-center items-center gap-8 py-8" role="list" aria-label="Trust and security features">
              <div className="opacity-80 hover:opacity-100 transition-opacity" role="listitem">
                <span className="text-base font-medium" style={{ color: colors.neutral[700] }}>
                  HIPAA Compliant
                </span>
              </div>
              <div className="opacity-80 hover:opacity-100 transition-opacity" role="listitem">
                <span className="text-base font-medium" style={{ color: colors.neutral[700] }}>
                  Evidence-Based
                </span>
              </div>
              <div className="opacity-80 hover:opacity-100 transition-opacity" role="listitem">
                <span className="text-base font-medium" style={{ color: colors.neutral[700] }}>
                  Built with Love
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Modern Problems Section - NEW */}
        <section id="how-it-works" className="py-8 px-4" style={{ backgroundColor: 'white' }}>
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <span className="text-sm font-bold px-4 py-2 rounded-full inline-block mb-4"
                style={{ backgroundColor: colors.status.warning + '20', color: colors.status.warning }}
              >
                MODERN PROBLEMS, MODERN SOLUTIONS
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.neutral[900] }}>
                The Challenges Only Interpreters Understand
              </h2>
              <p className="text-lg max-w-3xl mx-auto" style={{ color: colors.neutral[600] }}>
                We've built specific tools for the unique stressors you face every day
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Vicarious Trauma */}
              <div className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.neutral[800] }}>
                  Vicarious Trauma
                </h3>
                <p className="text-sm mb-4" style={{ color: colors.neutral[600] }}>
                  Processing difficult content daily takes a toll. Our trauma-informed tools help you 
                  decompress and protect your emotional wellbeing.
                </p>
                <ul className="text-xs space-y-1" style={{ color: colors.neutral[500] }}>
                  <li>• Post-assignment debrief protocols</li>
                  <li>• Emotional reset techniques</li>
                  <li>• Trauma exposure tracking</li>
                </ul>
              </div>

              {/* Imposter Syndrome */}
              <div className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.neutral[800] }}>
                  Imposter Syndrome
                </h3>
                <p className="text-sm mb-4" style={{ color: colors.neutral[600] }}>
                  Feeling like you're not qualified enough? You're not alone. Build confidence with 
                  affirmations and skill validation.
                </p>
                <ul className="text-xs space-y-1" style={{ color: colors.neutral[500] }}>
                  <li>• Daily confidence builders</li>
                  <li>• Skill recognition exercises</li>
                  <li>• Peer comparison reality checks</li>
                </ul>
              </div>

              {/* Professional Boundaries */}
              <div className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.neutral[800] }}>
                  Boundary Fatigue
                </h3>
                <p className="text-sm mb-4" style={{ color: colors.neutral[600] }}>
                  Constantly switching between professional neutrality and personal empathy? 
                  Learn to maintain healthy boundaries.
                </p>
                <ul className="text-xs space-y-1" style={{ color: colors.neutral[500] }}>
                  <li>• Role clarity exercises</li>
                  <li>• Boundary reset protocols</li>
                  <li>• Emotional distance tools</li>
                </ul>
              </div>

              {/* Technology Stress */}
              <div className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.neutral[800] }}>
                  Platform Fatigue
                </h3>
                <p className="text-sm mb-4" style={{ color: colors.neutral[600] }}>
                  Zoom fatigue? Tech issues? Screen strain? Combat modern interpreting challenges 
                  with targeted relief.
                </p>
                <ul className="text-xs space-y-1" style={{ color: colors.neutral[500] }}>
                  <li>• Screen fatigue exercises</li>
                  <li>• Tech stress management</li>
                  <li>• Remote work wellness</li>
                </ul>
              </div>
            </div>

            {/* Statistics Bar */}
            <div className="mt-12 p-6 rounded-2xl" style={{ background: 'rgb(92, 127, 79)' }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
                <div>
                  <div className="text-3xl font-bold">24%</div>
                  <div className="text-sm opacity-90">Experience Burnout</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">41.5%</div>
                  <div className="text-sm opacity-90">Report Vicarious Trauma</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">57.5%</div>
                  <div className="text-sm opacity-90">Feel Imposter Syndrome</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50%</div>
                  <div className="text-sm opacity-90">Struggle with Boundaries</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with better visual organization */}
        <section className="py-20 px-4" style={{ backgroundColor: colors.neutral[50] }} aria-labelledby="features-heading">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.neutral[900] }}>
                Your Wellness Toolkit
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.neutral[700], lineHeight: '1.6' }}>
                Evidence-based tools designed specifically for the unique challenges interpreters face
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto" role="list">
              {/* Feature cards with hover effects */}
              {[
                {
                  title: 'Stress Reset Tools',
                  description: 'Immediate techniques for between assignments or difficult sessions',
                  color: 'rgb(92, 127, 79)',
                },
                {
                  title: 'AI Wellness Coach',
                  description: 'Personalized support that understands interpreter challenges',
                  color: 'rgb(92, 127, 79)',
                },
                {
                  title: 'Reflection Studio',
                  description: 'Process vicarious trauma and challenging assignments safely',
                  color: 'rgb(92, 127, 79)',
                },
                {
                  title: 'Growth Insights',
                  description: 'Track patterns and celebrate your wellness progress',
                  color: 'rgb(92, 127, 79)',
                },
              ].map((feature, index) => (
                <article
                  key={index}
                  className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1 focus-within:ring-4"
                  style={{ '--tw-ring-color': 'rgba(92, 127, 79, 0.4)' } as React.CSSProperties}
                  tabIndex={0}
                  role="listitem"
                  aria-label={`Feature: ${feature.title}`}
                >
                  <h3 className="text-xl font-semibold mb-3" style={{ color: colors.neutral[800] }}>
                    {feature.title}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: colors.neutral[700], lineHeight: '1.6' }}>
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>


        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4" style={{ backgroundColor: 'white' }} aria-labelledby="pricing-heading">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 id="pricing-heading" className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.neutral[900] }}>
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl mb-2" style={{ color: colors.neutral[600] }}>
                Choose the plan that fits your wellness journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Essential Plan */}
              <div className="rounded-xl border-2 relative overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow" style={{ borderColor: 'rgb(92, 127, 79)' }}>
                <div className="absolute top-0 left-0 right-0 text-white text-center py-2 text-sm font-bold" style={{ background: 'rgb(92, 127, 79)' }}>
                  AVAILABLE NOW
                </div>
                
                <div className="p-6 mt-10">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: colors.neutral[900] }}>
                    Essential
                  </h3>
                  <p className="text-gray-600 mb-4">Your daily wellness companion</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold" style={{ color: colors.neutral[900] }}>$12.99</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="text-sm text-gray-700">Daily reflection prompts</li>
                    <li className="text-sm text-gray-700">Stress reset tools</li>
                    <li className="text-sm text-gray-700">Progress tracking</li>
                    <li className="text-sm text-gray-700">Mobile responsive</li>
                    <li className="text-sm text-gray-700">Private & secure</li>
                  </ul>
                  
                  <button
                    onClick={handleSignup}
                    className="w-full py-3 rounded-lg font-semibold text-white transition-all focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50"
                    style={{ background: 'rgb(92, 127, 79)' }}
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
                  <h3 className="text-2xl font-bold mb-2" style={{ color: colors.neutral[900] }}>
                    Professional
                  </h3>
                  <p className="text-gray-600 mb-4">Advanced practice support</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-400">$24.99</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="text-sm text-gray-500">Everything in Essential</li>
                    <li className="text-sm text-gray-500">Advanced analytics</li>
                    <li className="text-sm text-gray-500">Peer mentoring</li>
                    <li className="text-sm text-gray-500">Wellness workshops</li>
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
                  <h3 className="text-2xl font-bold mb-2" style={{ color: colors.neutral[900] }}>
                    Enterprise
                  </h3>
                  <p className="text-gray-600 mb-4">For agencies, VRS/VRI, and educational programs</p>

                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-400">Customized</span>
                    <span className="text-gray-400"> Pricing</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="text-sm text-gray-500">Everything in Pro</li>
                    <li className="text-sm text-gray-500">Executive dashboard</li>
                    <li className="text-sm text-gray-500">Group access for staff, interpreters, and learners</li>
                    <li className="text-sm text-gray-500">Administrative controls</li>
                    <li className="text-sm text-gray-500">Organization-wide empowerment tools</li>
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
        <section className="py-20 px-4" style={{ background: 'rgb(92, 127, 79)' }} aria-labelledby="cta-heading">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Start Your Wellness Journey Today
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Evidence-based tools • Built by interpreters, for interpreters
            </p>
            <button
              onClick={handleSignup}
              className="px-8 py-4 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
              style={{ background: 'white', color: 'rgb(92, 127, 79)', fontSize: '1.125rem' }}
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
        defaultMode={authMode === 'signin' ? 'signin' : 'signup'}
        onSuccess={() => {
          setAuthModalOpen(false);
          window.location.href = '/dashboard';
        }}
      />
      <PricingModal 
        isOpen={pricingModalOpen} 
        onClose={() => setPricingModalOpen(false)} 
        onSelectPlan={handleSelectPlan}
      />
      <WaitlistModal isOpen={waitlistModalOpen} onClose={() => setWaitlistModalOpen(false)} plan={waitlistPlan} />

      {/* Success message */}
      {showStripeMessage && (
        <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-xl z-50 animate-slide-in">
          <p className="text-sm font-medium" style={{ color: colors.primary.sage }}>
            ✨ Stripe checkout coming soon! You're logged in and ready.
          </p>
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
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