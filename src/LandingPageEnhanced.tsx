import React, { useState, useEffect } from 'react';
import { Logo } from './components/Logo';
import {
  Shield,
  Brain,
  Heart,
  Users,
  TrendingUp,
  RefreshCw,
  MessageCircle,
  BookOpen,
  Clock,
  Award,
  ArrowRight,
  X,
  Menu,
  Eye,
  Sparkles,
  AlertCircle,
  Globe,
  Headphones,
  Languages,
  Palette,
  Sun,
  Moon,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { BurnoutAssessment } from './components/BurnoutAssessment';
import { PricingModal } from './components/PricingModal';
import { WaitlistModal } from './components/WaitlistModal';
import { useAuth } from './contexts/AuthContext';
import type { AssessmentResults } from './types';

interface LandingPageProps {
  onGetStarted: () => void;
}

// Enhanced color palette - calming, accessible, and modern
const colors = {
  // Primary palette - earth tones and calming colors
  primary: {
    sage: '#5C7F4F',      // Main brand color
    mint: '#8FA881',      // Secondary green
    earth: '#8B7355',     // Warm earth tone
    ocean: '#5B8C94',     // Calming blue-green
    lavender: '#9B8AA3',  // Soft purple
  },
  // Background gradients
  gradients: {
    hero: 'linear-gradient(135deg, #F7F5F2 0%, #E8EDE5 50%, #DDE5D9 100%)',
    card: 'linear-gradient(145deg, #FFFFFF 0%, #F9F8F6 100%)',
    accent: 'linear-gradient(135deg, #5C7F4F 0%, #8FA881 100%)',
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
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
  const [waitlistPlan] = useState<'professional' | 'organizations'>('professional');
  const [showStripeMessage, setShowStripeMessage] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [greeting, setGreeting] = useState('');
  const [announceMessage, setAnnounceMessage] = useState('');

  // Personalized greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const handleLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleSignup = () => {
    if (user) {
      setShowStripeMessage(true);
      setTimeout(() => {
        setShowStripeMessage(false);
      }, 3000);
    } else {
      setAuthMode('signup');
      setAuthModalOpen(true);
    }
  };

  const handleAssessment = () => {
    setAssessmentOpen(true);
  };

  const handleAssessmentComplete = (results: AssessmentResults) => {
    setAssessmentOpen(false);
    setAssessmentResults(results);
    setPricingModalOpen(true);
  };

  const handleSelectPlan = () => {
    setWaitlistModalOpen(false);
    onGetStarted();
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
          className="inline-block px-4 py-2 mr-2 bg-sage-600 text-white rounded-lg focus:ring-4 focus:ring-sage-400 focus:outline-none"
          style={{ backgroundColor: colors.primary.sage }}
        >
          Skip to main content
        </a>
        <a 
          href="#navigation" 
          className="inline-block px-4 py-2 mr-2 bg-sage-600 text-white rounded-lg focus:ring-4 focus:ring-sage-400 focus:outline-none"
          style={{ backgroundColor: colors.primary.sage }}
        >
          Skip to navigation
        </a>
        <a 
          href="#footer" 
          className="inline-block px-4 py-2 bg-sage-600 text-white rounded-lg focus:ring-4 focus:ring-sage-400 focus:outline-none"
          style={{ backgroundColor: colors.primary.sage }}
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
            />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={handleAssessment}
                className="text-base font-medium hover:opacity-80 transition-all px-3 py-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-sage-400"
                style={{ color: colors.neutral[700] }}
                aria-label="Take burnout assessment"
              >
                Take Assessment
              </button>
              <button 
                className="text-base font-medium hover:opacity-80 transition-all px-3 py-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-sage-400"
                style={{ color: colors.neutral[700] }}
                aria-label="Learn how interpreterRx works"
              >
                How It Works
              </button>
              <button 
                className="text-base font-medium hover:opacity-80 transition-all px-3 py-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-sage-400"
                style={{ color: colors.neutral[700] }}
                aria-label="View pricing plans"
              >
                Pricing
              </button>
              
              {/* Theme toggle */}
              <button 
                onClick={() => {
                  const newTheme = theme === 'light' ? 'dark' : 'light';
                  setTheme(newTheme);
                  setAnnounceMessage(`Theme changed to ${newTheme} mode`);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all focus:outline-none focus:ring-4 focus:ring-sage-400"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                aria-pressed={theme === 'dark'}
              >
                {theme === 'light' ? 
                  <Moon className="h-5 w-5" style={{ color: colors.neutral[600] }} /> :
                  <Sun className="h-5 w-5" style={{ color: colors.neutral[600] }} />
                }
              </button>

              {/* Auth buttons with better visual hierarchy */}
              {!user ? (
                <>
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 text-base font-medium rounded-lg transition-all hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-sage-400"
                    style={{ color: colors.neutral[700] }}
                    aria-label="Sign in to your account"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleSignup}
                    className="px-4 py-2 text-base font-medium text-white rounded-lg transition-all hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-white"
                    style={{ background: colors.gradients.accent }}
                    aria-label="Sign up for free account"
                  >
                    Get Started Free
                  </button>
                </>
              ) : (
                <button
                  onClick={onGetStarted}
                  className="px-4 py-2 text-base font-medium text-white rounded-lg transition-all hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-white"
                  style={{ background: colors.gradients.accent }}
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
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-sage-400"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
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
            <div className="px-4 py-4 space-y-3">
              <button onClick={handleAssessment} className="block w-full text-left py-2 text-sm font-medium"
                style={{ color: colors.neutral[700] }}
              >
                Take Assessment
              </button>
              <button className="block w-full text-left py-2 text-sm font-medium"
                style={{ color: colors.neutral[700] }}
              >
                How It Works
              </button>
              <button className="block w-full text-left py-2 text-sm font-medium"
                style={{ color: colors.neutral[700] }}
              >
                Pricing
              </button>
              {!user ? (
                <div className="space-y-2 pt-4 border-t" style={{ borderColor: colors.neutral[100] }}>
                  <button onClick={handleLogin} className="block w-full py-2 text-center text-sm font-medium rounded-lg border"
                    style={{ borderColor: colors.neutral[200], color: colors.neutral[700] }}
                  >
                    Sign In
                  </button>
                  <button onClick={handleSignup} className="block w-full py-2 text-center text-sm font-medium text-white rounded-lg"
                    style={{ background: colors.gradients.accent }}
                  >
                    Get Started Free
                  </button>
                </div>
              ) : (
                <button onClick={onGetStarted} className="block w-full py-2 text-center text-sm font-medium text-white rounded-lg"
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
            {/* Personalized greeting */}
            <div className="text-center mb-6 animate-fade-in">
              <span className="text-sm font-medium px-4 py-2 rounded-full inline-flex items-center space-x-2"
                style={{ backgroundColor: colors.neutral[50], color: colors.primary.sage }}
              >
                <Sparkles className="h-4 w-4" />
                <span>{greeting}, interpreter</span>
              </span>
            </div>

            {/* Main headline with emphasis on wellness */}
            <div className="text-center mb-12">
              <h1 
                id="hero-heading"
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                style={{ color: colors.neutral[900] }}
              >
                Prevent Burnout{' '}
                <span className="relative">
                  <span className="relative z-10" style={{ color: colors.primary.sage }}>
                    Before
                  </span>
                  <span className="absolute -bottom-1 left-0 w-full h-3 opacity-20 rounded"
                    style={{ background: colors.primary.mint }}
                  />
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

            {/* Primary CTA with microinteraction */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => {
                  handleAssessment();
                  setAnnounceMessage('Opening wellness assessment');
                }}
                className="group px-8 py-4 text-white font-semibold rounded-xl transition-all transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-sage-400"
                style={{ background: colors.gradients.accent, fontSize: '1.125rem' }}
                aria-label="Start your wellness check - takes 2 minutes"
              >
                <Heart className="h-5 w-5 group-hover:animate-pulse" aria-hidden="true" />
                <span>Start Your Wellness Check</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
              <button
                onClick={handleSignup}
                className="px-8 py-4 font-semibold rounded-xl border-2 transition-all hover:shadow-lg flex items-center justify-center space-x-2 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-sage-400"
                style={{ 
                  borderColor: colors.primary.sage, 
                  color: colors.primary.sage,
                  backgroundColor: 'white',
                  fontSize: '1.125rem'
                }}
                aria-label="Browse free wellness resources"
              >
                <span>Browse Free Resources</span>
              </button>
            </div>

            {/* Diverse interpreter illustrations/representation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" role="region" aria-label="Interpreter specialization options">
              {/* Sign Language Interpreter */}
              <article className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all focus-within:ring-4 focus-within:ring-sage-400" tabIndex={0} aria-label="Sign language interpreter resources">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ background: colors.gradients.ocean }}>
                    <Globe className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold" style={{ color: colors.neutral[800] }}>
                    Sign Language
                  </h3>
                </div>
                <p className="text-base" style={{ color: colors.neutral[600], lineHeight: '1.6' }}>
                  Supporting ASL, BSL, and international sign language interpreters with 
                  specialized wellness resources
                </p>
              </article>

              {/* Spoken Language Interpreter */}
              <article className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all focus-within:ring-4 focus-within:ring-sage-400" tabIndex={0} aria-label="Spoken language interpreter resources">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #9B8AA3 0%, #B4A3BC 100%)' }}>
                    <Languages className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold" style={{ color: colors.neutral[800] }}>
                    Spoken Language
                  </h3>
                </div>
                <p className="text-base" style={{ color: colors.neutral[600], lineHeight: '1.6' }}>
                  Tools for conference, medical, legal, and community interpreters across 
                  all language pairs
                </p>
              </article>

              {/* Conference/Remote Interpreter */}
              <article className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all focus-within:ring-4 focus-within:ring-sage-400" tabIndex={0} aria-label="Remote and hybrid interpreter resources">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #8B7355 0%, #A58A6B 100%)' }}>
                    <Headphones className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold" style={{ color: colors.neutral[800] }}>
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
              <div className="flex items-center space-x-2 opacity-80 hover:opacity-100 transition-opacity" role="listitem">
                <Shield className="h-5 w-5" style={{ color: colors.primary.sage }} aria-hidden="true" />
                <span className="text-base font-medium" style={{ color: colors.neutral[700] }}>
                  HIPAA Compliant
                </span>
              </div>
              <div className="flex items-center space-x-2 opacity-80 hover:opacity-100 transition-opacity" role="listitem">
                <Award className="h-5 w-5" style={{ color: colors.primary.sage }} aria-hidden="true" />
                <span className="text-base font-medium" style={{ color: colors.neutral[700] }}>
                  Evidence-Based
                </span>
              </div>
              <div className="flex items-center space-x-2 opacity-80 hover:opacity-100 transition-opacity" role="listitem">
                <Users className="h-5 w-5" style={{ color: colors.primary.sage }} aria-hidden="true" />
                <span className="text-base font-medium" style={{ color: colors.neutral[700] }}>
                  2,000+ Interpreters
                </span>
              </div>
              <div className="flex items-center space-x-2 opacity-80 hover:opacity-100 transition-opacity" role="listitem">
                <Heart className="h-5 w-5" style={{ color: colors.primary.sage }} aria-hidden="true" />
                <span className="text-base font-medium" style={{ color: colors.neutral[700] }}>
                  Built with Love
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Modern Problems Section - NEW */}
        <section className="py-20 px-4" style={{ backgroundColor: 'white' }}>
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
              <div className="p-6 rounded-2xl border-2 border-orange-200 bg-orange-50 hover:shadow-xl transition-all">
                <div className="mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-orange-100">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
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
              <div className="p-6 rounded-2xl border-2 border-purple-200 bg-purple-50 hover:shadow-xl transition-all">
                <div className="mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-purple-100">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
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
              <div className="p-6 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:shadow-xl transition-all">
                <div className="mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-blue-100">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
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
              <div className="p-6 rounded-2xl border-2 border-green-200 bg-green-50 hover:shadow-xl transition-all">
                <div className="mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-green-100">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                </div>
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
            <div className="mt-12 p-6 rounded-2xl" style={{ background: colors.gradients.accent }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
                <div>
                  <div className="text-3xl font-bold">82%</div>
                  <div className="text-sm opacity-90">Experience Burnout</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">67%</div>
                  <div className="text-sm opacity-90">Report Vicarious Trauma</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">71%</div>
                  <div className="text-sm opacity-90">Feel Imposter Syndrome</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">89%</div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
              {/* Feature cards with hover effects */}
              {[
                {
                  icon: Brain,
                  title: 'Daily Burnout Check',
                  description: 'Quick 2-minute assessment to track your wellness trends over time',
                  color: colors.primary.sage,
                },
                {
                  icon: RefreshCw,
                  title: 'Stress Reset Tools',
                  description: 'Immediate techniques for between assignments or difficult sessions',
                  color: colors.primary.ocean,
                },
                {
                  icon: MessageCircle,
                  title: 'AI Wellness Coach',
                  description: 'Personalized support that understands interpreter challenges',
                  color: colors.primary.lavender,
                },
                {
                  icon: BookOpen,
                  title: 'Reflection Studio',
                  description: 'Process vicarious trauma and challenging assignments safely',
                  color: colors.primary.earth,
                },
                {
                  icon: TrendingUp,
                  title: 'Growth Insights',
                  description: 'Track patterns and celebrate your wellness progress',
                  color: colors.primary.mint,
                },
                {
                  icon: Users,
                  title: 'Community Support',
                  description: 'Connect with peers who understand your unique challenges',
                  color: colors.primary.sage,
                },
              ].map((feature, index) => (
                <article
                  key={index}
                  className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1 focus-within:ring-4 focus-within:ring-sage-400"
                  tabIndex={0}
                  role="listitem"
                  aria-label={`Feature: ${feature.title}`}
                >
                  <div className="mb-4">
                    <div 
                      className="inline-flex p-3 rounded-xl group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <feature.icon className="h-6 w-6" style={{ color: feature.color }} aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: colors.neutral[800] }}>
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

        {/* Personalization options preview */}
        <section className="py-20 px-4" aria-labelledby="personalization-heading">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 id="personalization-heading" className="text-3xl font-bold mb-4" style={{ color: colors.neutral[900] }}>
                  Personalize Your Experience
                </h2>
                <p className="text-lg" style={{ color: colors.neutral[700], lineHeight: '1.6' }}>
                  Customize your wellness journey to match your needs
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
                <div className="flex items-start space-x-4" role="listitem">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: colors.neutral[50] }} aria-hidden="true">
                    <Palette className="h-5 w-5" style={{ color: colors.primary.sage }} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-lg" style={{ color: colors.neutral[800] }}>
                      Custom Themes
                    </h3>
                    <p className="text-base" style={{ color: colors.neutral[700], lineHeight: '1.5' }}>
                      Choose calming colors and fonts that work for you
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4" role="listitem">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: colors.neutral[50] }} aria-hidden="true">
                    <Eye className="h-5 w-5" style={{ color: colors.primary.sage }} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-lg" style={{ color: colors.neutral[800] }}>
                      Accessibility First
                    </h3>
                    <p className="text-base" style={{ color: colors.neutral[700], lineHeight: '1.5' }}>
                      Large text, high contrast, and screen reader support
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4" role="listitem">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: colors.neutral[50] }} aria-hidden="true">
                    <Clock className="h-5 w-5" style={{ color: colors.primary.sage }} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-lg" style={{ color: colors.neutral[800] }}>
                      Your Schedule
                    </h3>
                    <p className="text-base" style={{ color: colors.neutral[700], lineHeight: '1.5' }}>
                      Set reminders that work with your assignments
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4" role="listitem">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: colors.neutral[50] }} aria-hidden="true">
                    <AlertCircle className="h-5 w-5" style={{ color: colors.primary.sage }} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-lg" style={{ color: colors.neutral[800] }}>
                      Privacy Controls
                    </h3>
                    <p className="text-base" style={{ color: colors.neutral[700], lineHeight: '1.5' }}>
                      You decide what to track and share
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4" style={{ background: colors.gradients.accent }} aria-labelledby="cta-heading">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Start Your Wellness Journey Today
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Free assessment • Evidence-based tools • Built by interpreters, for interpreters
            </p>
            <button
              onClick={() => {
                handleAssessment();
                setAnnounceMessage('Opening wellness assessment');
              }}
              className="px-8 py-4 bg-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center space-x-2 focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-sage-600"
              style={{ color: colors.primary.sage, fontSize: '1.125rem' }}
              aria-label="Take your free wellness assessment - takes 2 minutes"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              <span>Take Your Free Assessment</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer for accessibility */}
      <footer id="footer" role="contentinfo" className="sr-only">
        <p>interpreterRx - Wellness Platform for Interpreters</p>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} mode={authMode} />
      <BurnoutAssessment isOpen={assessmentOpen} onClose={() => setAssessmentOpen(false)} onComplete={handleAssessmentComplete} />
      <PricingModal 
        isOpen={pricingModalOpen} 
        onClose={() => setPricingModalOpen(false)} 
        onSelectPlan={handleSelectPlan}
        burnoutScore={assessmentResults?.score}
        riskLevel={assessmentResults?.riskLevel}
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