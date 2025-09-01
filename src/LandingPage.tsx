import React, { useState } from 'react';
import {
  Shield,
  Brain,
  Heart,
  Target,
  Users,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  MessageCircle,
  BookOpen,
  Clock,
  Award,
  Zap,
  ArrowRight,
  Star,
  X,
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
  const [waitlistPlan, setWaitlistPlan] = useState<'professional' | 'organizations'>(
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

  const handleSelectPlan = (plan: 'essential' | 'professional') => {
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
          borderBottom: '1px solid rgba(168, 192, 154, 0.2)',
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
                  e.currentTarget.style.backgroundColor = 'rgba(168, 192, 154, 0.1)';
                  e.currentTarget.style.color = '#6B8B60';
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
              background: 'radial-gradient(circle, #A8C09A 0%, transparent 70%)',
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
            <div
              className="inline-flex items-center px-4 py-2 rounded-full mb-8"
              style={{
                backgroundColor: 'rgba(107, 139, 96, 0.1)',
                border: '1px solid rgba(107, 139, 96, 0.3)',
              }}
            >
              <Brain className="h-4 w-4 mr-2" style={{ color: '#6B8B60' }} />
              <span className="text-sm font-semibold" style={{ color: '#6B8B60' }}>
                Based on neuroscience research from leading burnout studies
              </span>
            </div>

            <h1
              id="hero-heading"
              className="text-5xl md:text-6xl font-bold mb-2"
              style={{
                color: '#1A1A1A',
                letterSpacing: '-1px',
                lineHeight: '1.1',
              }}
            >
              Recovery Tools for Interpreters
            </h1>
            <h2
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{
                color: '#2D5F3F',
                letterSpacing: '-0.5px',
                lineHeight: '1.2',
              }}
            >
              Process trauma. Prevent burnout. Rewire resilience.
            </h2>

            <p
              className="text-xl mb-6 max-w-3xl mx-auto"
              style={{
                color: '#5A5A5A',
                lineHeight: '1.7',
              }}
            >
              Every assignment leaves its mark on your mind and body. Without the right tools, those
              marks stack into burnout.
              <span className="font-semibold" style={{ color: '#2D5F3F' }}>
                {' '}
                InterpretReflect helps you reset, recover, and grow stronger with every session.
              </span>
            </p>

            <p className="text-sm mb-8 font-medium" style={{ color: '#8B4444' }}>
              Now accepting limited beta access
            </p>

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
                aria-label="Get started with InterpretReflect"
              >
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
              </button>

              <button
                onClick={handleAssessment}
                className="px-8 py-4 rounded-xl font-semibold text-lg transition-all focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-sage-600"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A1A',
                  border: '2px solid #6B8B60',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#5F7F55';
                  e.currentTarget.style.backgroundColor = '#F8FBF6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#6B8B60';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '3px solid #1A1A1A';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
                aria-label="Take the 2-minute burnout risk test"
              >
                <Clock className="h-5 w-5 mr-2" />
                Take the 2-Minute Burnout Risk Test
              </button>
            </div>

            <p className="text-sm mt-4 mb-2" style={{ color: '#5A5A5A' }}>
              $12/month • Cancel anytime
            </p>
            <p className="text-xs" style={{ color: '#6B8B60', fontStyle: 'italic' }}>
              Scientifically-grounded assessment • Completely confidential
            </p>

            {/* Inclusive Language Cue */}
            <div className="mt-12 text-center">
              <p
                className="text-base font-medium mb-2"
                style={{
                  color: '#6B8B60',
                  letterSpacing: '0.5px',
                }}
              >
                For interpreters of all backgrounds, modalities, and lived experiences.
              </p>
              <p
                className="text-sm font-medium"
                style={{
                  color: '#5A5A5A',
                }}
              >
                Accessible to Deaf and hearing interpreters, across all settings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FFFFFF' }}
        aria-labelledby="journey-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              id="journey-heading"
              className="text-4xl font-bold mb-4"
              style={{ color: '#1A1A1A' }}
            >
              Your Journey to Sustainable Practice
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: '#5A5A5A' }}>
              Simple steps, grounded in neuroscience, to transform how you carry the weight of your
              work.
            </p>
          </div>

          {/* Journey Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Recognize */}
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
                Recognize
              </h3>
              <p className="font-semibold mb-2" style={{ color: '#2D5F3F' }}>
                Understand your stress patterns
              </p>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Take our 2-minute assessment to identify burnout risk factors and triggers specific
                to interpretation work.
              </p>
            </div>

            {/* Step 2: Recover */}
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
                Recover
              </h3>
              <p className="font-semibold mb-2" style={{ color: '#2D5F3F' }}>
                Reset your nervous system daily
              </p>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Quick resets between assignments and guided reflections that reduce cortisol, calm
                your stress response, and release what you've absorbed.
              </p>
            </div>

            {/* Step 3: Thrive */}
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
                Thrive
              </h3>
              <p className="font-semibold mb-2" style={{ color: '#2D5F3F' }}>
                Build resilience for the long term
              </p>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Track your growth, strengthen emotional intelligence, and develop sustainable
                practices that last.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FAF9F6' }}
        aria-labelledby="tools-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="tools-heading" className="text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              Tools Designed for Your Reality
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: '#5A5A5A' }}>
              Evidence-based solutions that fit between assignments, in hallways, and during breaks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Reflection Studio */}
            <article
              className="rounded-2xl p-8 transition-all cursor-pointer group"
              tabIndex={0}
              role="article"
              aria-labelledby="reflection-studio-heading"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#A8C09A';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(168, 192, 154, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = '3px solid #2D5F3F';
                e.currentTarget.style.outlineOffset = '2px';
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
            >
              <div
                className="inline-block p-3 rounded-xl mb-4"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                }}
              >
                <BookOpen className="h-8 w-8" aria-hidden="true" style={{ color: '#FFFFFF' }} />
              </div>
              <h3
                id="reflection-studio-heading"
                className="text-xl font-bold mb-2"
                style={{ color: '#1A1A1A' }}
              >
                Reflection Studio
              </h3>
              <p className="font-semibold mb-3" style={{ color: '#2D5F3F' }}>
                Process assignments safely
              </p>
              <p className="mb-4" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Guided prompts specifically for interpreters to process vicarious trauma, set
                boundaries, and track professional growth.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                    style={{ color: '#2D5F3F' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Vicarious trauma processing
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Boundary setting exercises
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Professional growth tracking
                  </span>
                </li>
              </ul>
            </article>

            {/* Stress Reset */}
            <article
              className="rounded-2xl p-8 transition-all cursor-pointer group"
              tabIndex={0}
              role="article"
              aria-labelledby="stress-reset-heading"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#A8C09A';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(168, 192, 154, 0.25)';
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
                <RefreshCw className="h-8 w-8" style={{ color: '#FFFFFF' }} />
              </div>
              <h3
                id="stress-reset-heading"
                className="text-xl font-bold mb-2"
                style={{ color: '#1A1A1A' }}
              >
                Quick Resets
              </h3>
              <p className="font-semibold mb-3" style={{ color: '#2D5F3F' }}>
                2-minute nervous system regulation
              </p>
              <p className="mb-4" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Breathing exercises, tension release, and grounding tools scientifically shown to
                lower stress markers—perfect for courthouse hallways or hospital breaks.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    2-minute breathing exercises
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Body tension release
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Sensory grounding tools
                  </span>
                </li>
              </ul>
            </article>

            {/* Elya AI */}
            <article
              className="rounded-2xl p-8 transition-all cursor-pointer group"
              tabIndex={0}
              role="article"
              aria-labelledby="elya-ai-heading"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#A8C09A';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(168, 192, 154, 0.25)';
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
                <MessageCircle className="h-8 w-8" style={{ color: '#FFFFFF' }} />
              </div>
              <h3
                id="elya-ai-heading"
                className="text-xl font-bold mb-2"
                style={{ color: '#1A1A1A' }}
              >
                Elya AI Companion
              </h3>
              <p className="font-semibold mb-3" style={{ color: '#2D5F3F' }}>
                24/7 support that gets it
              </p>
              <p className="mb-4" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Debrief difficult sessions, process emotions, and receive personalized wellness
                strategies from an AI trained on interpreter challenges.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Debrief difficult sessions
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Emotional processing support
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Personalized wellness tips
                  </span>
                </li>
              </ul>
            </article>

            {/* Growth Insights */}
            <article
              className="rounded-2xl p-8 transition-all cursor-pointer group"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#A8C09A';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(168, 192, 154, 0.25)';
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
                <TrendingUp className="h-8 w-8" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Growth Tracking
              </h3>
              <p className="font-semibold mb-3" style={{ color: '#2D5F3F' }}>
                See your resilience build
              </p>
              <p className="mb-4" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Monitor stress patterns, celebrate wins, and visualize your development over time.
                Watch how consistent practice reshapes your brain's resilience pathways.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Stress pattern analysis
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Resilience metrics
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Progress celebrations
                  </span>
                </li>
              </ul>
            </article>

            {/* REMOVED EXTRA TOOLS */}
            <div style={{ display: 'none' }}>
              <article
                className="rounded-2xl p-8 transition-all cursor-pointer group"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                  border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#A8C09A';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(168, 192, 154, 0.25)';
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
                  <Heart className="h-8 w-8" style={{ color: '#FFFFFF' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                  REMOVED
                </h3>
                <p className="mb-4" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                  REMOVED
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: '#A8C09A' }}
                    />
                    <span className="text-sm" style={{ color: '#3A3A3A' }}>
                      Self-awareness exercises
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: '#A8C09A' }}
                    />
                    <span className="text-sm" style={{ color: '#3A3A3A' }}>
                      Empathy regulation tools
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: '#A8C09A' }}
                    />
                    <span className="text-sm" style={{ color: '#3A3A3A' }}>
                      Cultural sensitivity training
                    </span>
                  </li>
                </ul>
              </article>

              {/* Community */}
              <article
                className="rounded-2xl p-8 transition-all cursor-pointer group"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                  border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#A8C09A';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(168, 192, 154, 0.25)';
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
                  <Users className="h-8 w-8" style={{ color: '#FFFFFF' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                  Peer Support Network
                </h3>
                <p className="mb-4" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                  Connect with interpreters who understand your unique challenges
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: '#A8C09A' }}
                    />
                    <span className="text-sm" style={{ color: '#3A3A3A' }}>
                      Anonymous peer forums
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: '#A8C09A' }}
                    />
                    <span className="text-sm" style={{ color: '#3A3A3A' }}>
                      Monthly wellness circles
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: '#A8C09A' }}
                    />
                    <span className="text-sm" style={{ color: '#3A3A3A' }}>
                      Mentor matching program
                    </span>
                  </li>
                </ul>
              </article>
            </div>
            {/* END REMOVED EXTRA TOOLS */}
          </div>
        </div>
      </section>

      {/* Why InterpretReflect Section */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FFFFFF' }}
        aria-labelledby="why-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="why-heading" className="text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              Why InterpretReflect?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div
                className="inline-block p-4 rounded-full mb-4"
                style={{
                  backgroundColor: 'rgba(168, 192, 154, 0.1)',
                }}
              >
                <Brain className="h-8 w-8" style={{ color: '#2D5F3F' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Built on Science
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Grounded in neuroscience research and trauma-informed practices, adapted
                specifically for language professionals.
              </p>
            </div>

            <div className="text-center">
              <div
                className="inline-block p-4 rounded-full mb-4"
                style={{
                  backgroundColor: 'rgba(168, 192, 154, 0.1)',
                }}
              >
                <Clock className="h-8 w-8" style={{ color: '#2D5F3F' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Made for Your Schedule
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                No hour-long commitments. Tools that fit into 2-minute breaks between assignments.
              </p>
            </div>

            <div className="text-center">
              <div
                className="inline-block p-4 rounded-full mb-4"
                style={{
                  backgroundColor: 'rgba(168, 192, 154, 0.1)',
                }}
              >
                <Shield className="h-8 w-8" style={{ color: '#2D5F3F' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Completely Confidential
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Your reflections are private and secure. Process freely without professional
                concerns.
              </p>
            </div>

            <div className="text-center">
              <div
                className="inline-block p-4 rounded-full mb-4"
                style={{
                  backgroundColor: 'rgba(168, 192, 154, 0.1)',
                }}
              >
                <Award className="h-8 w-8" style={{ color: '#2D5F3F' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Professional Development
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Earn continuing education credits while investing in your wellness (Professional
                Plan).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FAF9F6' }}
        aria-labelledby="pricing-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              id="pricing-heading"
              className="text-4xl font-bold mb-4"
              style={{ color: '#1A1A1A' }}
            >
              Choose Your Wellness Journey
            </h2>
            <p className="text-lg" style={{ color: '#5A5A5A' }}>
              Invest in your wellbeing with plans designed for every interpreter
            </p>
            <p className="text-base mt-2 font-medium" style={{ color: '#8B4444' }}>
              Limited beta access — join before spots fill up
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div
              className="rounded-2xl p-8"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #A8C09A',
              }}
            >
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{
                  backgroundColor: 'rgba(168, 192, 154, 0.1)',
                  color: '#6B8B60',
                }}
              >
                BETA ACCESS
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Essential
              </h3>
              <p className="mb-6" style={{ color: '#5A5A5A' }}>
                Build your foundation
              </p>
              <div className="mb-2">
                <span className="text-4xl font-bold" style={{ color: '#1A1A1A' }}>
                  $12
                </span>
                <span style={{ color: '#5A5A5A' }}>/month</span>
              </div>
              <p className="text-sm mb-6 font-medium" style={{ color: '#6B8B60' }}>
                Early adopter pricing
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Unlimited reflections</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>All quick reset techniques</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Growth tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Email support</span>
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
                    backgroundColor: '#2D5F3F !important',
                    color: '#FFFFFF !important',
                    border: '2px solid #2D5F3F !important',
                    display: 'block !important',
                    visibility: 'visible !important',
                    opacity: '1 !important',
                    minHeight: '48px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1A4A2A';
                    e.currentTarget.style.borderColor = '#1A4A2A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2D5F3F';
                    e.currentTarget.style.borderColor = '#2D5F3F';
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
              className="rounded-2xl p-8 relative transform scale-105"
              style={{
                background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                boxShadow: '0 10px 30px rgba(107, 139, 96, 0.3)',
              }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span
                  className="px-4 py-1 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: '#FAF9F6',
                    color: '#6B8B60',
                  }}
                >
                  LAUNCHING Q2 2025
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
                Professional
              </h3>
              <p className="mb-6" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Advance your practice
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold" style={{ color: '#FFFFFF' }}>
                  $24
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#FFFFFF' }}
                  />
                  <span style={{ color: '#FFFFFF' }}>Everything in Essential</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#FFFFFF' }}
                  />
                  <span style={{ color: '#FFFFFF' }}>Elya AI Companion</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#FFFFFF' }}
                  />
                  <span style={{ color: '#FFFFFF' }}>Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#FFFFFF' }}
                  />
                  <span style={{ color: '#FFFFFF' }}>CEU credits included</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#FFFFFF' }}
                  />
                  <span style={{ color: '#FFFFFF' }}>Priority support</span>
                </li>
              </ul>
              <div className="mt-6" style={{ minHeight: '60px' }}>
                <button
                  disabled
                  className="w-full py-3 rounded-xl font-semibold"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.5) !important',
                    color: '#6B8B60 !important',
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
              <p className="text-xs text-center mt-3" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Available Q2 2025
              </p>
            </div>

            {/* Organizations Plan */}
            <div
              className="rounded-2xl p-8 relative"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #E8E5E0',
              }}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span
                  className="px-4 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: '#FAF9F6',
                    color: '#6B8B60',
                    border: '1px solid #E8E5E0',
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

              <p className="text-sm font-semibold mb-3" style={{ color: '#2D5F3F' }}>
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
                    style={{ color: '#A8C09A' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Volume discounts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Team wellness dashboard</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Usage analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
                  />
                  <span style={{ color: '#5A5A5A' }}>Custom integrations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#A8C09A' }}
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

      {/* CTA Section */}
      <section
        className="py-20"
        style={{
          background: 'linear-gradient(135deg, #2D5F3F 0%, #3A704D 100%)',
        }}
        aria-labelledby="cta-heading"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta-heading" className="text-4xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Your Wellness Journey Starts Today
          </h2>
          <p className="text-xl mb-8" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
            Join thousands of interpreters who've discovered a sustainable way to thrive
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-white"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#1A1A1A',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '3px solid #1A1A1A';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
            aria-label="Get started with InterpretReflect today"
          >
            Get Started Today
            <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
          </button>
          <p className="mt-4 text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Beta access available now • Cancel anytime
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
          <h2 id="cta-heading" className="text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl mb-8" style={{ color: '#5A5A5A' }}>
            You don't have to carry the weight alone anymore.
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
              aria-label="Get started with InterpretReflect"
            >
              Get Started Today →
            </button>
            <p className="text-sm" style={{ color: '#5A5A5A' }}>
              Cancel anytime • 100% secure
            </p>

            <button
              onClick={handleAssessment}
              className="inline-flex items-center px-6 py-3 rounded-full font-medium text-base transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
              style={{
                backgroundColor: 'transparent',
                color: '#2D5F3F',
                border: '1px solid #6B8B60',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(107, 139, 96, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Take the burnout risk test"
            >
              Or: Take the 2-Minute Burnout Risk Test →
            </button>
            <p className="text-sm mt-2" style={{ color: '#5A5A5A' }}>
              See your stress patterns instantly
            </p>
            <p className="text-xs mt-1" style={{ color: '#6B8B60', fontStyle: 'italic' }}>
              Scientifically-grounded assessment • Completely confidential
            </p>
          </div>

          <p className="mt-12 text-base" style={{ color: '#5A5A5A' }}>
            <strong>Questions?</strong> Read our FAQ or email support@interpretreflect.com
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-700 pb-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-8">
                <a
                  href="#"
                  className="text-sm hover:text-white transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-sm hover:text-white transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-sm hover:text-white transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Contact
                </a>
                <a
                  href="#"
                  className="text-sm hover:text-white transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  About
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
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
                <strong className="text-white">Disclaimer:</strong> InterpretReflect™ is a wellness
                support tool, not a substitute for professional mental health care. If you are
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
