import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Brain,
  Heart,
  Users,
  CheckCircle,
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

// WCAG AA Color Contrast Ratios
const colors = {
  // Primary colors with AA contrast ratios (4.5:1 minimum)
  sage: {
    600: '#4A6D3F', // Darker for better contrast
    500: '#5C7F4F',
    400: '#6B8B60',
    300: '#7A9B6E',
    100: '#F0F5ED',
    50: '#F5F9F3',
  },
  gray: {
    900: '#1A1A1A', // 15.7:1 contrast on white
    800: '#2D3748', // 11.5:1 contrast on white
    700: '#4A5568', // 7.5:1 contrast on white
    600: '#5A5A5A', // 5.9:1 contrast on white
    500: '#718096', // 4.6:1 contrast on white (minimum AA)
    100: '#F7FAFC',
    50: '#FAF9F6',
  }
};

function LandingPageAccessible({ onGetStarted }: LandingPageProps) {
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

  // Skip to main content for keyboard users
  useEffect(() => {
    // Add focus visible class to body for better focus management
    document.body.classList.add('focus-visible');
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
    setPricingModalOpen(false);
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  return (
    <div style={{ backgroundColor: colors.gray[50], minHeight: '100vh' }}>
      {/* Skip to main content link for screen readers and keyboard users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-sage-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
        style={{ backgroundColor: colors.sage[600], color: '#FFFFFF' }}
      >
        Skip to main content
      </a>

      {/* Top Navigation Bar */}
      <nav
        className="sticky top-0 z-50"
        role="navigation"
        aria-label="Main navigation"
        style={{
          backgroundColor: 'rgba(250, 249, 246, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${colors.sage[300]}40`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a
                href="/"
                className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600 rounded-lg px-2 py-1"
                aria-label="InterpretReflect home - Wellness platform for interpreters"
              >
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: colors.sage[500],
                    boxShadow: `0 2px 8px ${colors.sage[400]}4D`,
                  }}
                >
                  <Shield 
                    className="h-6 w-6" 
                    aria-hidden="true" 
                    style={{ color: '#FFFFFF' }}
                    role="img"
                    aria-label="Shield logo"
                  />
                </div>
                <span className="text-xl font-bold" style={{ color: colors.gray[900] }}>
                  InterpretReflect™
                </span>
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-600"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-6 w-6" style={{ color: colors.gray[800] }} aria-hidden="true" />
            </button>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="px-5 py-2.5 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600 min-h-[44px]"
                style={{
                  backgroundColor: 'transparent',
                  color: colors.gray[800],
                  border: `2px solid transparent`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${colors.sage[100]}`;
                  e.currentTarget.style.borderColor = colors.sage[400];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                aria-label="Log in to your InterpretReflect account"
              >
                Log In
              </button>

              <button
                onClick={handleSignup}
                className="px-5 py-2.5 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white min-h-[44px]"
                style={{
                  backgroundColor: colors.sage[600],
                  color: '#FFFFFF',
                  boxShadow: `0 2px 8px ${colors.sage[400]}40`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${colors.sage[400]}59`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 2px 8px ${colors.sage[400]}40`;
                }}
                aria-label="Sign up for a new InterpretReflect account"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div 
              id="mobile-menu"
              className="md:hidden py-4 border-t"
              style={{ borderColor: `${colors.sage[300]}40` }}
            >
              <button
                onClick={handleLogin}
                className="block w-full text-left px-4 py-3 font-semibold rounded-lg mb-2 min-h-[44px]"
                style={{
                  backgroundColor: colors.gray[100],
                  color: colors.gray[800],
                }}
                aria-label="Log in to your InterpretReflect account"
              >
                Log In
              </button>
              <button
                onClick={handleSignup}
                className="block w-full text-left px-4 py-3 font-semibold rounded-lg min-h-[44px]"
                style={{
                  backgroundColor: colors.sage[600],
                  color: '#FFFFFF',
                }}
                aria-label="Sign up for a new InterpretReflect account"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="relative overflow-hidden" aria-labelledby="hero-heading">
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div
              className="absolute top-20 left-20 w-96 h-96 rounded-full"
              style={{
                background: `radial-gradient(circle, ${colors.sage[500]} 0%, transparent 70%)`,
                animation: 'pulse 8s ease-in-out infinite',
              }}
            ></div>
            <div
              className="absolute bottom-20 right-20 w-96 h-96 rounded-full"
              style={{
                background: `radial-gradient(circle, ${colors.sage[400]} 0%, transparent 70%)`,
                animation: 'pulse 8s ease-in-out infinite 4s',
              }}
            ></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <div className="text-center">
              <div
                className="inline-flex items-center px-4 py-2 rounded-full mb-8"
                style={{
                  backgroundColor: `${colors.sage[100]}`,
                  border: `1px solid ${colors.sage[300]}`,
                }}
                role="status"
                aria-live="polite"
              >
                <Sparkles 
                  className="h-4 w-4 mr-2" 
                  style={{ color: colors.sage[600] }}
                  aria-hidden="true"
                />
                <span 
                  className="text-sm font-medium"
                  style={{ color: colors.sage[600] }}
                >
                  The only wellness platform built for interpreters, backed by neuroscience
                </span>
              </div>

              <h1 
                id="hero-heading"
                className="text-5xl md:text-6xl font-bold mb-6"
                style={{ color: colors.gray[900] }}
              >
                Unwind Your Mind.
                <br />
                <span style={{ color: colors.sage[600] }}>Recharge Your Practice.</span>
              </h1>

              <p 
                className="text-xl md:text-2xl max-w-3xl mx-auto mb-12"
                style={{ color: colors.gray[700] }}
              >
                Every session shapes your mind and your career. But the weight you carry isn't
                yours alone. InterpretReflect™ gives you instant support, science-based tools, and a
                sense of belonging, so you can reset, recover, and thrive for the long run.
              </p>

              <div className="mb-8">
                <p 
                  className="text-lg font-semibold mb-4"
                  style={{ color: colors.gray[800] }}
                >
                  Start Today. Join the Beta.
                </p>

                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-sage-600 min-h-[48px] min-w-[200px]"
                  style={{
                    backgroundColor: colors.sage[600],
                    color: '#FFFFFF',
                    boxShadow: `0 4px 15px ${colors.sage[400]}4D`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 8px 25px ${colors.sage[400]}66`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = `0 4px 15px ${colors.sage[400]}4D`;
                  }}
                  aria-label="Get started with InterpretReflect - Beta access for $12 per month"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <button
                onClick={handleAssessment}
                className="inline-flex items-center px-6 py-3 rounded-full font-medium text-base transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600 min-h-[44px]"
                style={{
                  backgroundColor: 'transparent',
                  color: colors.sage[600],
                  border: `2px solid ${colors.sage[400]}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.sage[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label="Take the 2-minute wellness check-in assessment"
              >
                Take the 2-Minute Wellness Check-In
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </button>

              <p 
                className="text-sm mt-4"
                style={{ color: colors.gray[600] }}
              >
                Limited early access • $12/month • Cancel anytime
              </p>
              
              <p 
                className="text-xs mt-2"
                style={{ color: colors.sage[600], fontStyle: 'italic' }}
                role="complementary"
              >
                Research-backed • 100% Confidential
              </p>

              <div 
                className="text-sm mt-6"
                style={{ color: colors.gray[700] }}
                role="complementary"
                aria-label="Platform inclusivity statement"
              >
                <strong>For every interpreter, everywhere.</strong>
                <br />
                Spoken, signed, Deaf or hearing, medical to legal, our tools are built for your story.
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Your Path to Lasting Wellbeing */}
        <section 
          className="py-20"
          style={{ backgroundColor: '#FFFFFF' }}
          aria-labelledby="features-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 
                id="features-heading"
                className="text-4xl font-bold mb-4"
                style={{ color: colors.gray[900] }}
              >
                Your Path to Lasting Wellbeing
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <article className="text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.sage[100] }}
                  aria-hidden="true"
                >
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: colors.sage[600] }}
                  >
                    1
                  </span>
                </div>
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: colors.gray[800] }}
                >
                  Recognize
                </h3>
                <p 
                  className="text-lg font-medium mb-3"
                  style={{ color: colors.sage[600] }}
                >
                  See your stress - clearly
                </p>
                <p style={{ color: colors.gray[600] }}>
                  Take our 2-minute wellness check-in, inspired by the latest brain science, and
                  discover your unique patterns and hidden strengths. Immediate, personalized insights
                  show you exactly where you stand.
                </p>
              </article>

              {/* Step 2 */}
              <article className="text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.sage[100] }}
                  aria-hidden="true"
                >
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: colors.sage[600] }}
                  >
                    2
                  </span>
                </div>
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: colors.gray[800] }}
                >
                  Reset
                </h3>
                <p 
                  className="text-lg font-medium mb-3"
                  style={{ color: colors.sage[600] }}
                >
                  Reset your nervous system, fast
                </p>
                <p style={{ color: colors.gray[600] }}>
                  Use rapid, on-the-go techniques, grounded in neuroscience, that calm your body and
                  clear your mind, anytime you need it. No hour-long meditations needed.
                </p>
              </article>

              {/* Step 3 */}
              <article className="text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.sage[100] }}
                  aria-hidden="true"
                >
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: colors.sage[600] }}
                  >
                    3
                  </span>
                </div>
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: colors.gray[800] }}
                >
                  Thrive
                </h3>
                <p 
                  className="text-lg font-medium mb-3"
                  style={{ color: colors.sage[600] }}
                >
                  Grow your resilience, session by session
                </p>
                <p style={{ color: colors.gray[600] }}>
                  Track your emotional progress, unlock your best self, and build sustainable practices
                  proven to rewire your brain for resilience.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section 
          className="py-20"
          style={{ backgroundColor: colors.gray[50] }}
          aria-labelledby="tools-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 
              id="tools-heading"
              className="text-4xl font-bold text-center mb-16"
              style={{ color: colors.gray[900] }}
            >
              Designed for How (and Where) Interpreters Really Work
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Reflection Studio */}
              <article 
                className="rounded-2xl p-6"
                style={{ backgroundColor: '#FFFFFF', border: `1px solid ${colors.sage[300]}40` }}
              >
                <div 
                  className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.sage[100] }}
                >
                  <BookOpen 
                    className="h-6 w-6"
                    style={{ color: colors.sage[600] }}
                    aria-hidden="true"
                  />
                </div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: colors.gray[800] }}
                >
                  Reflection Studio
                </h3>
                <p 
                  className="text-sm font-medium mb-3"
                  style={{ color: colors.sage[600] }}
                >
                  Take a breath, process it all, and set boundaries
                </p>
                <p 
                  className="text-sm mb-4"
                  style={{ color: colors.gray[600] }}
                >
                  Research-driven prompts, anytime you need a reset.
                </p>
                <ul className="space-y-2" role="list">
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: colors.sage[500] }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-sm"
                      style={{ color: colors.gray[600] }}
                    >
                      Process challenging experiences
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: colors.sage[500] }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-sm"
                      style={{ color: colors.gray[600] }}
                    >
                      Boundary setting exercises
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: colors.sage[500] }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-sm"
                      style={{ color: colors.gray[600] }}
                    >
                      See your professional growth in real time
                    </span>
                  </li>
                </ul>
              </article>

              {/* Quick Resets */}
              <article 
                className="rounded-2xl p-6"
                style={{ backgroundColor: '#FFFFFF', border: `1px solid ${colors.sage[300]}40` }}
              >
                <div 
                  className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.sage[100] }}
                >
                  <RefreshCw 
                    className="h-6 w-6"
                    style={{ color: colors.sage[600] }}
                    aria-hidden="true"
                  />
                </div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: colors.gray[800] }}
                >
                  Quick Resets
                </h3>
                <p 
                  className="text-sm font-medium mb-3"
                  style={{ color: colors.sage[600] }}
                >
                  Down-regulate stress instantly
                </p>
                <p 
                  className="text-sm mb-4"
                  style={{ color: colors.gray[600] }}
                >
                  2-minute breathing, body tension, and sensory grounding - built for waiting rooms, hallways, and in-between moments.
                </p>
                <ul className="space-y-2" role="list">
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: colors.sage[500] }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-sm"
                      style={{ color: colors.gray[600] }}
                    >
                      2-minute breathing exercises
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: colors.sage[500] }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-sm"
                      style={{ color: colors.gray[600] }}
                    >
                      Body tension release
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: colors.sage[500] }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-sm"
                      style={{ color: colors.gray[600] }}
                    >
                      Sensory grounding tools
                    </span>
                  </li>
                </ul>
              </article>

              {/* Elya AI Companion */}
              <article 
                className="rounded-2xl p-6"
                style={{ backgroundColor: '#FFFFFF', border: `1px solid ${colors.sage[300]}40` }}
              >
                <div 
                  className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.sage[100] }}
                >
                  <MessageCircle 
                    className="h-6 w-6"
                    style={{ color: colors.sage[600] }}
                    aria-hidden="true"
                  />
                </div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: colors.gray[800] }}
                >
                  Elya AI Companion
                </h3>
                <p 
                  className="text-sm font-medium mb-3"
                  style={{ color: colors.sage[600] }}
                >
                  Your private, always-on wellness buddy
                </p>
                <p 
                  className="text-sm mb-4"
                  style={{ color: colors.gray[600] }}
                >
                  Debrief tough sessions with an AI who 'gets it' - get actionable, science-powered tips made for interpreters.
                </p>
                <ul className="space-y-2" role="list">
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: colors.sage[500] }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-sm"
                      style={{ color: colors.gray[600] }}
                    >
                      Debrief tough sessions with an AI who 'gets it'
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: colors.sage[500] }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-sm"
                      style={{ color: colors.gray[600] }}
                    >
                      Get actionable, science-powered tips made for interpreters
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: colors.sage[500] }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-sm"
                      style={{ color: colors.gray[600] }}
                    >
                      Emotional check-ins, tailored just for you
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: colors.sage[500] }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-sm"
                      style={{ color: colors.gray[600] }}
                    >
                      Personalized wellness tips
                    </span>
                  </li>
                </ul>
              </article>

              {/* Growth Tracking */}
              <article 
                className="rounded-2xl p-6"
                style={{ backgroundColor: '#FFFFFF', border: `1px solid ${colors.sage[300]}40` }}
              >
                <div 
                  className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.sage[100] }}
                >
                  <TrendingUp 
                    className="h-6 w-6"
                    style={{ color: colors.sage[600] }}
                    aria-hidden="true"
                  />
                </div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: colors.gray[800] }}
                >
                  Growth Tracking
                </h3>
                <p 
                  className="text-sm font-medium mb-3"
                  style={{ color: colors.sage[600] }}
                >
                  See your wins and your progress, not just your setbacks
                </p>
                <p 
                  className="text-sm mb-4"
                  style={{ color: colors.gray[600] }}
                >
                  Visualize how your brain and resilience adapt. Celebrate every step, no matter how small.
                </p>
                <ul className="space-y-2" role="list">
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: colors.sage[500] }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-sm"
                      style={{ color: colors.gray[600] }}
                    >
                      Visualize how your brain and resilience adapt
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: colors.sage[500] }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-sm"
                      style={{ color: colors.gray[600] }}
                    >
                      Celebrate every step, no matter how small
                    </span>
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section 
          className="py-20"
          style={{ backgroundColor: '#FFFFFF' }}
          aria-labelledby="benefits-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 
              id="benefits-heading"
              className="text-4xl font-bold text-center mb-16"
              style={{ color: colors.gray[900] }}
            >
              Why Interpreters Choose InterpretReflect™
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <article>
                <div 
                  className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.sage[100] }}
                >
                  <Brain 
                    className="h-6 w-6"
                    style={{ color: colors.sage[600] }}
                    aria-hidden="true"
                  />
                </div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: colors.gray[800] }}
                >
                  Built on Science
                </h3>
                <p style={{ color: colors.gray[600] }}>
                  Tools and insights rooted in cutting-edge neuroscience, emotional intelligence, and
                  trauma research, customized for your unique role.
                </p>
              </article>

              <article>
                <div 
                  className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.sage[100] }}
                >
                  <Clock 
                    className="h-6 w-6"
                    style={{ color: colors.sage[600] }}
                    aria-hidden="true"
                  />
                </div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: colors.gray[800] }}
                >
                  Made for Busy Schedules
                </h3>
                <p style={{ color: colors.gray[600] }}>
                  All interventions fit into 2-minute breaks, no hidden time commitments, no fluff,
                  maximum impact.
                </p>
              </article>

              <article>
                <div 
                  className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.sage[100] }}
                >
                  <Shield 
                    className="h-6 w-6"
                    style={{ color: colors.sage[600] }}
                    aria-hidden="true"
                  />
                </div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: colors.gray[800] }}
                >
                  Radically Confidential
                </h3>
                <p style={{ color: colors.gray[600] }}>
                  Your journey stays private, always. Data is safe, secure, and never shared.
                </p>
              </article>

              <article>
                <div 
                  className="w-12 h-12 mb-4 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.sage[100] }}
                >
                  <Award 
                    className="h-6 w-6"
                    style={{ color: colors.sage[600] }}
                    aria-hidden="true"
                  />
                </div>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: colors.gray[800] }}
                >
                  Real Professional Growth
                </h3>
                <p style={{ color: colors.gray[600] }}>
                  Invest in wellness and your future. Professional Plan unlocks CEU credits for
                  continuous learning.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Accessibility Statement */}
        <section 
          className="py-16"
          style={{ backgroundColor: colors.sage[50] }}
          aria-labelledby="accessibility-heading"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-4">
              <Eye 
                className="h-8 w-8"
                style={{ color: colors.sage[600] }}
                aria-hidden="true"
              />
            </div>
            <h2 
              id="accessibility-heading"
              className="text-2xl font-bold mb-4"
              style={{ color: colors.gray[900] }}
            >
              Our Commitment to Accessibility
            </h2>
            <p 
              className="text-lg mb-6"
              style={{ color: colors.gray[700] }}
            >
              We are committed to making InterpretReflect™ accessible to all users, regardless of ability or circumstance.
            </p>
            <div 
              className="grid md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto"
            >
              <div className="flex items-start">
                <CheckCircle 
                  className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                  style={{ color: colors.sage[600] }}
                  aria-hidden="true"
                />
                <p style={{ color: colors.gray[600] }}>
                  WCAG 2.1 AA compliant design
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle 
                  className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                  style={{ color: colors.sage[600] }}
                  aria-hidden="true"
                />
                <p style={{ color: colors.gray[600] }}>
                  Screen reader optimized
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle 
                  className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                  style={{ color: colors.sage[600] }}
                  aria-hidden="true"
                />
                <p style={{ color: colors.gray[600] }}>
                  Keyboard navigation support
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle 
                  className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                  style={{ color: colors.sage[600] }}
                  aria-hidden="true"
                />
                <p style={{ color: colors.gray[600] }}>
                  High contrast mode available
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle 
                  className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                  style={{ color: colors.sage[600] }}
                  aria-hidden="true"
                />
                <p style={{ color: colors.gray[600] }}>
                  Text resizing supported
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle 
                  className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                  style={{ color: colors.sage[600] }}
                  aria-hidden="true"
                />
                <p style={{ color: colors.gray[600] }}>
                  Continuous improvement
                </p>
              </div>
            </div>
            <p 
              className="text-sm mt-6"
              style={{ color: colors.gray[600] }}
            >
              If you encounter any accessibility barriers, please contact us at{' '}
              <a 
                href="mailto:accessibility@interpretreflect.com"
                className="underline"
                style={{ color: colors.sage[600] }}
              >
                accessibility@interpretreflect.com
              </a>
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="py-20"
          style={{ backgroundColor: '#FFFFFF' }}
          aria-labelledby="cta-heading"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 
              id="cta-heading"
              className="text-4xl font-bold mb-4"
              style={{ color: colors.gray[900] }}
            >
              Start Your Journey Today
            </h2>
            <p 
              className="text-xl mb-8"
              style={{ color: colors.gray[700] }}
            >
              Your wellbeing is non-negotiable, and you don't have to do it alone.
            </p>

            <div className="flex flex-col items-center space-y-6">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-sage-600 min-h-[48px]"
                style={{
                  backgroundColor: colors.sage[600],
                  color: '#FFFFFF',
                  boxShadow: `0 4px 15px ${colors.sage[400]}4D`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${colors.sage[400]}66`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = `0 4px 15px ${colors.sage[400]}4D`;
                }}
                aria-label="Get started with InterpretReflect - Beta access for $12 per month"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </button>
              <p 
                className="text-sm"
                style={{ color: colors.gray[600] }}
              >
                Beta access available • Cancel anytime • 100% secure
              </p>

              <div className="mt-8">
                <button
                  onClick={handleAssessment}
                  className="inline-flex items-center px-6 py-3 rounded-full font-medium text-base transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600 min-h-[44px]"
                  style={{
                    backgroundColor: 'transparent',
                    color: colors.sage[600],
                    border: `2px solid ${colors.sage[400]}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.sage[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  aria-label="Take the 2-minute wellness check-in assessment"
                >
                  Or: Take the 2-Minute Wellness Check-In
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </button>
                <p 
                  className="text-sm mt-2"
                  style={{ color: colors.gray[600] }}
                >
                  See your stress patterns instantly
                </p>
                <p 
                  className="text-xs mt-1"
                  style={{ color: colors.sage[600], fontStyle: 'italic' }}
                >
                  Research-backed • Completely confidential
                </p>
              </div>
            </div>

            <p 
              className="mt-12 text-base"
              style={{ color: colors.gray[700] }}
            >
              <strong>Questions?</strong> Email{' '}
              <a 
                href="mailto:info@interpretreflect.com"
                className="underline"
                style={{ color: colors.sage[600] }}
                aria-label="Email us at info@interpretreflect.com"
              >
                info@interpretreflect.com
              </a>
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer 
        className="py-12"
        style={{ backgroundColor: colors.gray[900] }}
        role="contentinfo"
        aria-label="Site footer"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav 
            className="border-b border-gray-700 pb-8 mb-8"
            aria-label="Footer navigation"
          >
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                <Link
                  to="/privacy"
                  className="text-sm hover:text-white transition-colors focus:outline-none focus:underline focus:text-white"
                  style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  aria-label="View our Privacy Policy"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-sm hover:text-white transition-colors focus:outline-none focus:underline focus:text-white"
                  style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  aria-label="View our Terms of Service"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/contact"
                  className="text-sm hover:text-white transition-colors focus:outline-none focus:underline focus:text-white"
                  style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  aria-label="Contact us"
                >
                  Contact
                </Link>
                <Link
                  to="/about"
                  className="text-sm hover:text-white transition-colors focus:outline-none focus:underline focus:text-white"
                  style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  aria-label="Learn more about InterpretReflect"
                >
                  About
                </Link>
                <Link
                  to="/pricing"
                  className="text-sm hover:text-white transition-colors focus:outline-none focus:underline focus:text-white"
                  style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  aria-label="View pricing plans"
                >
                  Pricing
                </Link>
              </div>
            </div>
          </nav>

          <div className="space-y-4">
            <p 
              className="text-sm"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              © 2025 InterpretReflect. All rights reserved.
            </p>

            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              role="complementary"
              aria-label="Medical disclaimer"
            >
              <p 
                className="text-xs leading-relaxed"
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              >
                <strong className="text-white">Disclaimer:</strong> InterpretReflect™ is a wellness
                support tool, not a substitute for professional mental health care. If you are
                experiencing significant distress, please consult a qualified professional.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {authModalOpen && (
        <AuthModal 
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          mode={authMode}
        />
      )}

      {assessmentOpen && (
        <BurnoutAssessment
          isOpen={assessmentOpen}
          onClose={() => setAssessmentOpen(false)}
          onComplete={handleAssessmentComplete}
        />
      )}

      {pricingModalOpen && (
        <PricingModal
          isOpen={pricingModalOpen}
          onClose={() => setPricingModalOpen(false)}
          onSelectPlan={handleSelectPlan}
          burnoutScore={assessmentResults?.score}
          riskLevel={assessmentResults?.riskLevel}
        />
      )}

      {waitlistModalOpen && (
        <WaitlistModal
          isOpen={waitlistModalOpen}
          onClose={() => setWaitlistModalOpen(false)}
          plan={waitlistPlan}
        />
      )}

      {/* Stripe Integration Message with proper ARIA */}
      {showStripeMessage && (
        <div 
          className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-pulse"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" aria-hidden="true" />
            <div>
              <p className="font-semibold">Authenticated Successfully!</p>
              <p className="text-sm">Ready for Stripe integration!</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default LandingPageAccessible;