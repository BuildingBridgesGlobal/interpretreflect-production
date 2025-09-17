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
            {/* HIPAA Compliance Badge */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div
                className="inline-flex items-center px-6 py-3 rounded-full"
                style={{
                  background: 'linear-gradient(145deg, #FFD700 0%, #FFC107 100%)',
                  border: '2px solid #FFB000',
                  boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)',
                }}
              >
                <Shield className="h-5 w-5 mr-2" style={{ color: '#1A1A1A' }} />
                <span className="text-base font-bold" style={{ color: '#1A1A1A' }}>
                  The ONLY HIPAA-Compliant Interpreter Wellness Platform
                </span>
              </div>
              
              <div
                className="inline-flex items-center px-4 py-2 rounded-full"
                style={{
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  border: '1px solid rgba(107, 139, 96, 0.3)',
                }}
              >
                <Brain className="h-4 w-4 mr-2" style={{ color: '#4A6B3E' }} />
                <span className="text-sm font-semibold" style={{ color: '#4A6B3E' }}>
                  Built for interpreters, backed by neuroscience, grounded in community
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
              Unwind Your Mind. Recharge Your Practice.
            </h1>

            <p
              className="text-xl mb-8 max-w-4xl mx-auto"
              style={{
                color: '#5A5A5A',
                lineHeight: '1.7',
              }}
            >
              Every session shapes your mind and your career. But the weight you carry isn't yours alone.{' '}
              <span className="font-semibold" style={{ color: '#2D5F3F' }}>
                InterpretReflect™ gives you instant support, science-based tools, and a sense of belonging, so you can reset, recover, and thrive for the long run.
              </span>
            </p>

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#2D5F3F' }}>
                Start Today. Join the Beta.
              </h3>
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
                  e.currentTarget.style.borderColor = '#4A6B3E';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '3px solid #1A1A1A';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
                aria-label="Take the 2-minute wellness check-in"
              >
                <Clock className="h-5 w-5 mr-2" />
                Take the 2-Minute Wellness Check-In
              </button>
            </div>

            <p className="text-sm mt-4 mb-2" style={{ color: '#5A5A5A' }}>
              Limited early access - $12/month - Cancel anytime
            </p>
            <p className="text-xs" style={{ color: '#4A6B3E', fontStyle: 'italic' }}>
              Research-backed • 100% Confidential
            </p>

            {/* Inclusive Language Cue */}
            <div className="mt-12 text-center">
              <h2
                className="text-2xl font-bold mb-3"
                style={{
                  color: '#4A6B3E',
                  letterSpacing: '0.5px',
                }}
              >
                For every interpreter, everywhere.
              </h2>
              <p
                className="text-lg font-medium"
                style={{
                  color: '#5A5A5A',
                }}
              >
                Spoken, signed, Deaf or hearing, medical to legal, our tools are built for your story.
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
              Your Path to Lasting Wellbeing
            </h2>
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
                See your stress - clearly
              </p>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Take our 2-minute wellness check-in, inspired by the latest brain science, and discover your unique patterns and hidden strengths. Immediate, personalized insights show you exactly where you stand.
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
                Reset
              </h3>
              <p className="font-semibold mb-2" style={{ color: '#2D5F3F' }}>
                Reset your nervous system, fast
              </p>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Use rapid, on-the-go techniques, grounded in neuroscience, that calm your body and clear your mind, anytime you need it. No hour-long meditations needed.
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
                Grow your resilience, session by session
              </p>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Track your emotional progress, unlock your best self, and build sustainable practices proven to rewire your brain for resilience.
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
              Designed for How (and Where) Interpreters Really Work
            </h2>
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
                e.currentTarget.style.borderColor = '#5C7F4F';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(92, 127, 79, 0.25)';
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
                Take a breath, process it all, and set boundaries
              </p>
              <p className="mb-4" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Research-driven prompts, anytime you need a reset.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                    style={{ color: '#2D5F3F' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Process challenging experiences
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Boundary setting exercises
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    See your professional growth in real time
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
                Down-regulate stress instantly
              </p>
              <p className="mb-4" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                2-minute breathing, body tension, and sensory grounding - built for waiting rooms, hallways, and in-between moments.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    2-minute breathing exercises
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Body tension release
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
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
                Your private, always-on wellness buddy
              </p>
              <p className="mb-4" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Debrief tough sessions with an AI who 'gets it' - get actionable, science-powered tips made for interpreters.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Debrief tough sessions with an AI who 'gets it'
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Get actionable, science-powered tips made for interpreters
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Emotional check-ins, tailored just for you
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
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
                <TrendingUp className="h-8 w-8" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Growth Tracking
              </h3>
              <p className="font-semibold mb-3" style={{ color: '#2D5F3F' }}>
                See your wins and your progress, not just your setbacks
              </p>
              <p className="mb-4" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Visualize how your brain and resilience adapt. Celebrate every step, no matter how small.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Visualize how your brain and resilience adapt
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    style={{ color: '#5C7F4F' }}
                  />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>
                    Celebrate every step, no matter how small
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
                      style={{ color: '#5C7F4F' }}
                    />
                    <span className="text-sm" style={{ color: '#3A3A3A' }}>
                      Self-awareness exercises
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: '#5C7F4F' }}
                    />
                    <span className="text-sm" style={{ color: '#3A3A3A' }}>
                      Empathy regulation tools
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: '#5C7F4F' }}
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
                      style={{ color: '#5C7F4F' }}
                    />
                    <span className="text-sm" style={{ color: '#3A3A3A' }}>
                      Anonymous peer forums
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: '#5C7F4F' }}
                    />
                    <span className="text-sm" style={{ color: '#3A3A3A' }}>
                      Monthly wellness circles
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      style={{ color: '#5C7F4F' }}
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

      {/* Enterprise Trust & Compliance Section */}
      <section
        className="py-16"
        style={{ backgroundColor: '#F8FBF6' }}
        aria-labelledby="trust-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="trust-heading" className="text-3xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              Enterprise-Ready Security & Compliance
            </h2>
            <p className="text-lg" style={{ color: '#5A5A5A' }}>
              Trusted by healthcare systems, government agencies, and Fortune 500 companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* HIPAA Compliance */}
            <div className="text-center">
              <div
                className="inline-block p-4 rounded-xl mb-4"
                style={{
                  background: 'linear-gradient(145deg, #FFD700 0%, #FFC107 100%)',
                  boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)',
                }}
              >
                <Shield className="h-10 w-10" style={{ color: '#1A1A1A' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                HIPAA Compliant
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Zero-Knowledge Wellness Verification ensures no PHI is ever stored or exposed
              </p>
            </div>

            {/* SOC 2 Ready */}
            <div className="text-center">
              <div
                className="inline-block p-4 rounded-xl mb-4"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                  boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)',
                }}
              >
                <Award className="h-10 w-10" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                SOC 2 Type II Ready
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Enterprise-grade security controls and audit-ready compliance documentation
              </p>
            </div>

            {/* GDPR Compliant */}
            <div className="text-center">
              <div
                className="inline-block p-4 rounded-xl mb-4"
                style={{
                  background: 'linear-gradient(145deg, #4B79A1 0%, #283E51 100%)',
                  boxShadow: '0 4px 15px rgba(75, 121, 161, 0.3)',
                }}
              >
                <Users className="h-10 w-10" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                GDPR Compliant
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Full data privacy rights for EU clients with complete transparency
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl p-8 text-center"
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              border: '2px solid rgba(255, 193, 7, 0.3)',
            }}
          >
            <p className="text-lg font-semibold mb-2" style={{ color: '#1A1A1A' }}>
              🏆 The ONLY HIPAA-Compliant Interpreter Wellness Platform
            </p>
            <p className="text-sm" style={{ color: '#5A5A5A' }}>
              Unmatched data protection for healthcare systems and enterprise organizations
            </p>
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
              Why Interpreters Choose InterpretReflect™
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div
                className="inline-block p-4 rounded-full mb-4"
                style={{
                  backgroundColor: 'rgba(92, 127, 79, 0.1)',
                }}
              >
                <Brain className="h-8 w-8" style={{ color: '#2D5F3F' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Built on Science
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Tools and insights rooted in cutting-edge neuroscience, emotional intelligence, and trauma research, customized for your unique role.
              </p>
            </div>

            <div className="text-center">
              <div
                className="inline-block p-4 rounded-full mb-4"
                style={{
                  backgroundColor: 'rgba(92, 127, 79, 0.1)',
                }}
              >
                <Clock className="h-8 w-8" style={{ color: '#2D5F3F' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Made for Busy Schedules
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                All interventions fit into 2-minute breaks, no hidden time commitments, no fluff, maximum impact.
              </p>
            </div>

            <div className="text-center">
              <div
                className="inline-block p-4 rounded-full mb-4"
                style={{
                  backgroundColor: 'rgba(92, 127, 79, 0.1)',
                }}
              >
                <Shield className="h-8 w-8" style={{ color: '#2D5F3F' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Radically Confidential
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Your journey stays private, always. Data is safe, secure, and never shared.
              </p>
            </div>

            <div className="text-center">
              <div
                className="inline-block p-4 rounded-full mb-4"
                style={{
                  backgroundColor: 'rgba(92, 127, 79, 0.1)',
                }}
              >
                <Award className="h-8 w-8" style={{ color: '#2D5F3F' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Real Professional Growth
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Invest in wellness and your future. Professional Plan unlocks CEU credits for continuous learning.
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
                  <span style={{ color: '#5A5A5A' }}>Elya AI Companion</span>
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


      {/* CTA Section */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FFFFFF' }}
        aria-labelledby="cta-heading"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta-heading" className="text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Start Your Journey Today
          </h2>
          <p className="text-xl mb-8" style={{ color: '#5A5A5A' }}>
            Your wellbeing is non-negotiable, and you don't have to do it alone.
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
              Get Started
            </button>
            <p className="text-sm" style={{ color: '#5A5A5A' }}>
              Beta access available • Cancel anytime • 100% secure
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
              aria-label="Take the wellness check-in"
            >
              Or: Take the 2-Minute Wellness Check-In →
            </button>
            <p className="text-sm mt-2" style={{ color: '#5A5A5A' }}>
              See your stress patterns instantly
            </p>
            <p className="text-xs mt-1" style={{ color: '#4A6B3E', fontStyle: 'italic' }}>
              Research-backed • Completely confidential
            </p>
          </div>

          <p className="mt-12 text-base" style={{ color: '#5A5A5A' }}>
            <strong>Questions?</strong> Email info@buildingbridgeslearning.com
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
