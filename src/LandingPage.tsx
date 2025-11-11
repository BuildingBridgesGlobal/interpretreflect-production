import React, { useState } from 'react';
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
  Zap,
  Target,
  LineChart,
  Activity,
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

function LandingPage({ onGetStarted }: LandingPageProps) {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
  const [waitlistPlan] = useState<'professional' | 'organizations'>(
    'professional'
  );
  const [showStripeMessage, setShowStripeMessage] = useState(false);

  const handleLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleSignup = () => {
    if (user) {
      // User is already logged in, show Stripe message
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
    // After assessment, show pricing modal with results
    setAssessmentOpen(false);
    setAssessmentResults(results);
    setPricingModalOpen(true);
  };

  const handleSelectPlan = () => {
    // Close pricing modal and open signup
    setPricingModalOpen(false);
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  return (
    <div style={{ backgroundColor: '#FAF9F6', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <nav
        className="sticky top-0 z-50"
        role="navigation"
        aria-label="Main navigation"
        style={{
          backgroundColor: 'rgba(250, 249, 246, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(92, 127, 79, 0.2)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a
                href="#"
                className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-sage-600 rounded-lg"
                aria-label="InterpretReflect home"
              >
                <div
                  className="p-2 rounded-lg"
                  style={{
                    background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                    boxShadow: '0 2px 8px rgba(107, 139, 96, 0.3)',
                  }}
                >
                  <Shield className="h-6 w-6" aria-hidden="true" style={{ color: '#FFFFFF' }} />
                </div>
                <span className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                  InterpretReflect™
                </span>
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="px-5 py-2 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
                style={{
                  backgroundColor: 'transparent',
                  color: '#1A1A1A',
                  border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.1)';
                  e.currentTarget.style.color = '#4A6B3E';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#1A1A1A';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid #6B8B60';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
                aria-label="Log in to your account"
              >
                Log In
              </button>

              <button
                onClick={handleSignup}
                className="px-5 py-2 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(107, 139, 96, 0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 139, 96, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 139, 96, 0.25)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid #1A1A1A';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
                aria-label="Sign up for a new account"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden" aria-labelledby="hero-heading">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div
            className="absolute top-20 left-20 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, #5C7F4F 0%, transparent 70%)',
              animation: 'pulse 8s ease-in-out infinite',
            }}
          ></div>
          <div
            className="absolute bottom-20 right-20 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, #6B8B60 0%, transparent 70%)',
              animation: 'pulse 8s ease-in-out infinite 4s',
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Updated Badge */}
            <div className="flex justify-center mb-8">
              <div
                className="inline-flex items-center px-6 py-3 rounded-full"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                  border: '2px solid #5C7F4F',
                  boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)',
                }}
              >
                <Award className="h-5 w-5 mr-2" style={{ color: '#FFFFFF' }} />
                <span className="text-base font-bold" style={{ color: '#FFFFFF' }}>
                  Trusted by Interpreters Nationwide
                </span>
              </div>
            </div>

            <h1
              id="hero-heading"
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{
                color: '#1A1A1A',
                letterSpacing: '-1px',
                lineHeight: '1.1',
              }}
            >
              Perform at Your Peak. Every Assignment.
            </h1>

            <p
              className="text-xl mb-8 max-w-4xl mx-auto"
              style={{
                color: '#5A5A5A',
                lineHeight: '1.7',
              }}
            >
              Stop guessing about your performance. Get AI-powered insights backed by neuroscience to manage cognitive load, prevent burnout, and grow your capacity—with RID-approved CEUs included.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center">
                <Brain className="h-5 w-5 mr-2" style={{ color: '#5C7F4F' }} />
                <span className="text-sm font-semibold" style={{ color: '#4A6B3E' }}>
                  Science-backed assessments
                </span>
              </div>
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-2" style={{ color: '#5C7F4F' }} />
                <span className="text-sm font-semibold" style={{ color: '#4A6B3E' }}>
                  RID Sponsor #2309
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" style={{ color: '#5C7F4F' }} />
                <span className="text-sm font-semibold" style={{ color: '#4A6B3E' }}>
                  5.0+ CEUs available
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-sage-600"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(107, 139, 96, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 139, 96, 0.3)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '3px solid #1A1A1A';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
                aria-label="Start Your Performance Assessment"
              >
                Start Your Performance Assessment
                <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
              </button>
            </div>

            <p className="text-sm mt-4 mb-2" style={{ color: '#5A5A5A' }}>
              Limited early access - Cancel anytime
            </p>
            <p className="text-xs" style={{ color: '#4A6B3E', fontStyle: 'italic' }}>
              Research-backed • 100% Confidential • HIPAA Compliant
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar Section */}
      <section
        className="py-12"
        style={{ backgroundColor: '#FFFFFF' }}
        aria-label="Platform statistics"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2" style={{ color: '#5C7F4F' }}>
                16
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#5A5A5A' }}>
                Research Frameworks
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2" style={{ color: '#5C7F4F' }}>
                5.0+
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#5A5A5A' }}>
                CEUs Available
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2" style={{ color: '#5C7F4F' }}>
                24/7
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#5A5A5A' }}>
                AI Performance Support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Everything You Need Section */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FAF9F6' }}
        aria-labelledby="features-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              id="features-heading"
              className="text-4xl font-bold mb-4"
              style={{ color: '#1A1A1A' }}
            >
              Everything You Need to Optimize Performance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: ECCI Framework */}
            <article
              className="rounded-2xl p-8 transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#5C7F4F';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(92, 127, 79, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div
                className="inline-block p-3 rounded-xl mb-4"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                }}
              >
                <Brain className="h-8 w-8" aria-hidden="true" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Your Performance Foundation: The ECCI™ Framework
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Our proprietary ECCI™ Framework (Emotional & Cultural Competencies for Interpreters) uses 16 research-backed methods to measure how your brain handles cognitive load, cultural processing, and performance growth.
              </p>
            </article>

            {/* Card 2: Catalyst AI */}
            <article
              className="rounded-2xl p-8 transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#5C7F4F';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(92, 127, 79, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div
                className="inline-block p-3 rounded-xl mb-4"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                }}
              >
                <Zap className="h-8 w-8" aria-hidden="true" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Catalyst: Your AI Performance Partner
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Get personalized recommendations 24/7. Catalyst analyzes your cognitive patterns and suggests practical strategies to optimize your capacity. Built on the ECCI™ framework. Your data is 100% private.
              </p>
            </article>

            {/* Card 3: RID-Approved Certification */}
            <article
              className="rounded-2xl p-8 transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#5C7F4F';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(92, 127, 79, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div
                className="inline-block p-3 rounded-xl mb-4"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                }}
              >
                <Award className="h-8 w-8" aria-hidden="true" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                RID-Approved Certification
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Earn RID-approved CEUs across multiple categories through Building Bridges Global, LLC (Sponsor #2309), including the new 'Studies of Healthy Minds & Bodies' category—active now.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Built for Every Interpreting Professional */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FFFFFF' }}
        aria-labelledby="for-professionals-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              id="for-professionals-heading"
              className="text-4xl font-bold mb-4"
              style={{ color: '#1A1A1A' }}
            >
              Built for Every Interpreting Professional
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div
                className="inline-block p-4 rounded-full mb-4"
                style={{
                  backgroundColor: 'rgba(92, 127, 79, 0.1)',
                }}
              >
                <Users className="h-8 w-8" style={{ color: '#5C7F4F' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Spoken Language
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Medical, legal, conference, community—optimize your performance across all settings
              </p>
            </div>

            <div className="text-center">
              <div
                className="inline-block p-4 rounded-full mb-4"
                style={{
                  backgroundColor: 'rgba(92, 127, 79, 0.1)',
                }}
              >
                <Heart className="h-8 w-8" style={{ color: '#5C7F4F' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Sign Language
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                VRS, VRI, educational, platform—built for the unique demands of visual processing
              </p>
            </div>

            <div className="text-center">
              <div
                className="inline-block p-4 rounded-full mb-4"
                style={{
                  backgroundColor: 'rgba(92, 127, 79, 0.1)',
                }}
              >
                <TrendingUp className="h-8 w-8" style={{ color: '#5C7F4F' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                All Experience Levels
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                From students to seasoned professionals—grow your capacity at every stage
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RID Professional Category Section */}
      <section
        className="py-16"
        style={{ backgroundColor: '#F8FBF6' }}
        aria-labelledby="rid-category-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #5C7F4F',
              boxShadow: '0 4px 15px rgba(107, 139, 96, 0.2)',
            }}
          >
            <div className="flex items-start gap-6">
              <div
                className="inline-block p-4 rounded-xl flex-shrink-0"
                style={{
                  background: 'linear-gradient(145deg, #FFD700 0%, #FFC107 100%)',
                }}
              >
                <Award className="h-10 w-10" style={{ color: '#1A1A1A' }} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h2
                    id="rid-category-heading"
                    className="text-2xl font-bold"
                    style={{ color: '#1A1A1A' }}
                  >
                    New RID Professional Category
                  </h2>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: '#5C7F4F',
                      color: '#FFFFFF',
                    }}
                  >
                    Available Now
                  </span>
                </div>
                <p className="text-lg mb-3" style={{ color: '#5A5A5A' }}>
                  <strong style={{ color: '#4A6B3E' }}>Studies of Healthy Minds & Bodies</strong>
                </p>
                <p className="text-sm" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                  InterpretReflect is approved to deliver CEUs in this new category, helping you document your professional development in cognitive wellness and capacity building.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The ECCI™ Framework Detailed Section */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FAF9F6' }}
        aria-labelledby="ecci-framework-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              id="ecci-framework-heading"
              className="text-4xl font-bold mb-4"
              style={{ color: '#1A1A1A' }}
            >
              The ECCI™ Framework
            </h2>
            <p className="text-xl mb-4" style={{ color: '#5C7F4F', fontWeight: 600 }}>
              Emotional & Cultural Competencies for Interpreters
            </p>
            <p className="text-lg max-w-4xl mx-auto" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
              Our framework combines 16 neuroscience-based methods that measure how you process information, manage cultural context, regulate emotional labor, and maintain mental capacity during interpreting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Feature Box 1 */}
            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid rgba(92, 127, 79, 0.2)',
              }}
            >
              <div className="flex items-start gap-4">
                <Target className="h-6 w-6 flex-shrink-0" style={{ color: '#5C7F4F' }} />
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                    Cognitive Load Analysis
                  </h3>
                  <p className="text-sm" style={{ color: '#5A5A5A' }}>
                    Understand exactly how your brain processes multimodal information
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Box 2 */}
            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid rgba(92, 127, 79, 0.2)',
              }}
            >
              <div className="flex items-start gap-4">
                <Heart className="h-6 w-6 flex-shrink-0" style={{ color: '#5C7F4F' }} />
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                    Emotional Regulation
                  </h3>
                  <p className="text-sm" style={{ color: '#5A5A5A' }}>
                    Measure and optimize how you manage emotional labor
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Box 3 */}
            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid rgba(92, 127, 79, 0.2)',
              }}
            >
              <div className="flex items-start gap-4">
                <Users className="h-6 w-6 flex-shrink-0" style={{ color: '#5C7F4F' }} />
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                    Cultural Processing
                  </h3>
                  <p className="text-sm" style={{ color: '#5A5A5A' }}>
                    Track how you navigate cultural context and code-switching
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Box 4 */}
            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid rgba(92, 127, 79, 0.2)',
              }}
            >
              <div className="flex items-start gap-4">
                <Activity className="h-6 w-6 flex-shrink-0" style={{ color: '#5C7F4F' }} />
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                    Capacity Building
                  </h3>
                  <p className="text-sm" style={{ color: '#5A5A5A' }}>
                    Monitor your performance growth and neuroplasticity over time
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-6 text-center"
            style={{
              backgroundColor: 'rgba(92, 127, 79, 0.1)',
              border: '2px solid rgba(92, 127, 79, 0.3)',
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: '#4A6B3E' }}>
              Research Foundation
            </p>
            <p className="text-sm" style={{ color: '#5A5A5A' }}>
              Based on cognitive science, interoception research, performance psychology, cultural neuroscience, and interpreter workload studies.
            </p>
          </div>
        </div>
      </section>

      {/* Performance Optimization Protocol */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FFFFFF' }}
        aria-labelledby="protocol-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              id="protocol-heading"
              className="text-4xl font-bold mb-4"
              style={{ color: '#1A1A1A' }}
            >
              Performance Optimization Protocol
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                  boxShadow: '0 4px 12px rgba(107, 139, 96, 0.3)',
                }}
              >
                <span className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                  1
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Establish Performance Baseline
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Take a 15-minute assessment. Get your personalized performance profile with specific metrics.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                  boxShadow: '0 4px 12px rgba(107, 139, 96, 0.3)',
                }}
              >
                <span className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                  2
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Track Performance Metrics
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Log your daily performance: baseline checks, post-assignment reflections, and capacity tracking—all included in your platform access.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                  boxShadow: '0 4px 12px rgba(107, 139, 96, 0.3)',
                }}
              >
                <span className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                  3
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Earn Professional Credits
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Purchase CEU bundles to certify your professional development while building sustainable practice habits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Data-Driven Case */}
      <section
        className="py-20"
        style={{ backgroundColor: '#F8FBF6' }}
        aria-labelledby="data-case-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              id="data-case-heading"
              className="text-4xl font-bold mb-6"
              style={{ color: '#1A1A1A' }}
            >
              The Data-Driven Case
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: '#5A5A5A' }}>
              National studies from 2024-2025 reveal why interpreter performance optimization isn't optional—it's essential:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Stat 1 */}
            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid rgba(92, 127, 79, 0.2)',
              }}
            >
              <div className="text-5xl font-bold mb-2" style={{ color: '#5C7F4F' }}>
                82%
              </div>
              <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                experience burnout symptoms
              </p>
            </div>

            {/* Stat 2 */}
            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid rgba(92, 127, 79, 0.2)',
              }}
            >
              <div className="text-5xl font-bold mb-2" style={{ color: '#5C7F4F' }}>
                74%
              </div>
              <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                report vicarious trauma
              </p>
            </div>

            {/* Stat 3 */}
            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid rgba(92, 127, 79, 0.2)',
              }}
            >
              <div className="text-5xl font-bold mb-2" style={{ color: '#5C7F4F' }}>
                68%
              </div>
              <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                struggle with emotional boundaries
              </p>
            </div>

            {/* Stat 4 */}
            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid rgba(92, 127, 79, 0.2)',
              }}
            >
              <div className="text-5xl font-bold mb-2" style={{ color: '#5C7F4F' }}>
                45%
              </div>
              <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                have considered leaving the profession
              </p>
            </div>
          </div>

          <div
            className="rounded-xl p-8 text-center"
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #5C7F4F',
            }}
          >
            <p className="text-lg font-semibold mb-2" style={{ color: '#1A1A1A' }}>
              Your brain isn't the problem. The lack of support is.
            </p>
            <p className="text-base" style={{ color: '#5A5A5A' }}>
              InterpretReflect gives you the tools to measure, manage, and optimize your cognitive performance—so you can sustain your practice for decades, not just years.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FFFFFF' }}
        aria-labelledby="pricing-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              id="pricing-heading"
              className="text-4xl font-bold mb-4"
              style={{ color: '#1A1A1A' }}
            >
              Plans for Every Step of Your Journey
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div
              className="rounded-2xl p-8"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #5C7F4F',
              }}
            >
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{
                  backgroundColor: 'rgba(92, 127, 79, 0.1)',
                  color: '#4A6B3E',
                }}
              >
                BETA ACCESS
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Essential Plan
              </h3>
              <div className="mb-2">
                <span className="text-4xl font-bold" style={{ color: '#1A1A1A' }}>
                  $12
                </span>
                <span style={{ color: '#5A5A5A' }}>/month</span>
              </div>
              <p className="text-sm mb-6 font-medium" style={{ color: '#4A6B3E' }}>
                Early adopter pricing
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Unlimited guided reflections</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>All quick reset tools</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Catalyst AI Partner</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Growth tracking + insights</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#C0C0C0' }} />
                  <span style={{ color: '#C0C0C0' }}>CEU credits</span>
                </li>
              </ul>
              <div className="mt-6" style={{ minHeight: '60px' }}>
                <button
                  onClick={handleSignup}
                  className="w-full py-3 rounded-xl font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    display: 'block !important',
                    visibility: 'visible !important',
                    opacity: '1 !important',
                    minHeight: '48px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(107, 139, 96, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 139, 96, 0.3)';
                  }}
                  aria-label="Sign up for Essential plan for $12 per month"
                >
                  Sign Up - $12/month
                </button>
              </div>
              <p className="text-xs text-center mt-3" style={{ color: '#5A5A5A' }}>
                Early adopter pricing
              </p>
            </div>

            {/* Professional Plan */}
            <div
              className="rounded-2xl p-8 relative"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #5C7F4F',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span
                  className="px-4 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: '#FAF9F6',
                    color: '#4A6B3E',
                    border: '1px solid #5C7F4F',
                  }}
                >
                  COMING Q2 2026
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2 mt-2" style={{ color: '#1A1A1A' }}>
                Professional (Coming Q2 2026)
              </h3>
              <div className="mb-2">
                <span className="text-4xl font-bold" style={{ color: '#1A1A1A' }}>
                  $24
                </span>
                <span style={{ color: '#5A5A5A' }}>/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Everything in Essential +</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>CEUs & email support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Advanced progress analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Priority support & more</span>
                </li>
              </ul>
              <div className="mt-6" style={{ minHeight: '60px' }}>
                <button
                  disabled
                  className="w-full py-3 rounded-xl font-semibold"
                  style={{
                    backgroundColor: '#FFFFFF !important',
                    color: '#1A1A1A !important',
                    border: '2px solid #D0D0D0 !important',
                    display: 'block !important',
                    visibility: 'visible !important',
                    opacity: '0.5 !important',
                    minHeight: '48px',
                    cursor: 'not-allowed',
                  }}
                >
                  Coming Soon
                </button>
              </div>
              <p className="text-xs text-center mt-3" style={{ color: '#5A5A5A' }}>
                Available Q2 2026
              </p>
            </div>

            {/* Organizations Plan */}
            <div
              className="rounded-2xl p-8 relative"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #5C7F4F',
              }}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span
                  className="px-4 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: '#FAF9F6',
                    color: '#4A6B3E',
                    border: '1px solid #5C7F4F',
                  }}
                >
                  COMING SOON
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2 mt-2" style={{ color: '#1A1A1A' }}>
                Organizations
              </h3>
              <p className="mb-6" style={{ color: '#5A5A5A' }}>
                For agencies & programs
              </p>
              <div className="mb-6">
                <span className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
                  Custom pricing
                </span>
              </div>

              <p className="text-sm font-semibold mb-3" style={{ color: '#5C7F4F' }}>
                Perfect for:
              </p>
              <ul className="space-y-2 mb-6 text-sm" style={{ color: '#5A5A5A' }}>
                <li>• Interpreting agencies</li>
                <li>• VRS/VRI providers</li>
                <li>• Educational programs</li>
                <li>• Healthcare systems</li>
              </ul>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Volume discounts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Team wellness dashboard</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Usage analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Custom integrations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Dedicated support</span>
                </li>
              </ul>
              <div className="mt-6" style={{ minHeight: '60px' }}>
                <button
                  disabled
                  className="w-full py-3 rounded-xl font-semibold"
                  style={{
                    backgroundColor: '#FFFFFF !important',
                    color: '#1A1A1A !important',
                    border: '2px solid #D0D0D0 !important',
                    display: 'block !important',
                    visibility: 'visible !important',
                    opacity: '0.5 !important',
                    minHeight: '48px',
                    cursor: 'not-allowed',
                  }}
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        className="py-20"
        style={{ backgroundColor: '#F8FBF6' }}
        aria-labelledby="cta-heading"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta-heading" className="text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Start Your Performance Journey Today
          </h2>
          <p className="text-xl mb-8" style={{ color: '#5A5A5A' }}>
            Your peak performance is within reach. Let's optimize your capacity together.
          </p>

          <div className="flex flex-col items-center space-y-6">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-sage-600"
              style={{
                background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                color: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(107, 139, 96, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 139, 96, 0.3)';
              }}
              aria-label="Start Your Performance Assessment"
            >
              Start Your Performance Assessment
              <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
            </button>
            <p className="text-sm" style={{ color: '#5A5A5A' }}>
              Limited early access • Cancel anytime • 100% secure
            </p>
          </div>

          <p className="mt-12 text-base" style={{ color: '#5A5A5A' }}>
            <strong>Questions?</strong> Email info@interpretreflect.com
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-700 pb-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-8">
                <Link
                  to="/privacy"
                  className="text-sm hover:text-white transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-sm hover:text-white transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Terms of Service
                </Link>
                <Link
                  to="/contact"
                  className="text-sm hover:text-white transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Contact
                </Link>
                <Link
                  to="/about"
                  className="text-sm hover:text-white transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  About
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                RID Approved Sponsor #2309 | Building Bridges Global, LLC
              </p>
            </div>

            <p className="text-sm text-center" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              © 2025 InterpretReflect. All rights reserved.
            </p>

            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                <strong className="text-white">Disclaimer:</strong> InterpretReflect™ is a performance
                optimization platform, not a substitute for professional mental health care. If you are
                experiencing significant distress, please consult a qualified professional.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {authModalOpen && (
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} mode={authMode} />
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

      {/* Stripe Integration Message */}
      {showStripeMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
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

export default LandingPage;
