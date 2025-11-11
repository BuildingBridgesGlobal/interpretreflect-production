import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Brain,
  Users,
  CheckCircle,
  TrendingUp,
  MessageCircle,
  BookOpen,
  Clock,
  Award,
  ArrowRight,
  Zap,
  Target,
  BarChart3,
  Heart,
} from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './contexts/AuthContext';

interface LandingPageProps {
  onGetStarted: () => void;
}

function LandingPagePerformance({ onGetStarted }: LandingPageProps) {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleSignup = () => {
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
                aria-label="Sign up for a new account"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* SECTION 1: HERO SECTION */}
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Badge */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div
                className="inline-flex items-center px-6 py-3 rounded-full"
                style={{
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  border: '1px solid rgba(107, 139, 96, 0.3)',
                }}
              >
                <Users className="h-5 w-5 mr-2" style={{ color: '#4A6B3E' }} />
                <span className="text-base font-semibold" style={{ color: '#4A6B3E' }}>
                  Trusted by Interpreters Nationwide
                </span>
              </div>
            </div>

            {/* Headline */}
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

            {/* Subheadline */}
            <p
              className="text-xl mb-8 max-w-4xl mx-auto"
              style={{
                color: '#5A5A5A',
                lineHeight: '1.7',
              }}
            >
              Stop guessing about your performance. Get AI-powered insights backed by neuroscience to manage cognitive load, prevent burnout, and grow your capacity—with RID-approved CEUs included.
            </p>

            {/* Feature Bullets */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" style={{ color: '#5C7F4F' }} />
                <span className="text-sm font-medium" style={{ color: '#4A6B3E' }}>
                  Science-backed assessments
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" style={{ color: '#5C7F4F' }} />
                <span className="text-sm font-medium" style={{ color: '#4A6B3E' }}>
                  RID Sponsor #2309
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" style={{ color: '#5C7F4F' }} />
                <span className="text-sm font-medium" style={{ color: '#4A6B3E' }}>
                  5.0+ CEUs available
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
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
                aria-label="Start your performance assessment"
              >
                Start Your Performance Assessment
                <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: STATS BAR */}
      <section
        className="py-8"
        style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid rgba(92, 127, 79, 0.1)', borderBottom: '1px solid rgba(92, 127, 79, 0.1)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: '#5C7F4F' }}>
                16
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#4A6B3E' }}>
                Research Frameworks
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: '#5C7F4F' }}>
                5.0+
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#4A6B3E' }}>
                CEUs Available
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: '#5C7F4F' }}>
                24/7
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#4A6B3E' }}>
                AI Performance Support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: EVERYTHING YOU NEED TO OPTIMIZE PERFORMANCE */}
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
            {/* Card 1: Neuroscience-Based Framework */}
            <div
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
                <Brain className="h-8 w-8" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                Your Performance Foundation: The ECCI™ Framework
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Our proprietary ECCI™ Framework (Emotional & Cultural Competencies for Interpreters) uses 16 research-backed methods to measure how your brain handles cognitive load, cultural processing, and performance growth.
              </p>
            </div>

            {/* Card 2: Catalyst */}
            <div
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
                <Zap className="h-8 w-8" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                Catalyst: Your AI Performance Partner
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Get personalized recommendations 24/7. Catalyst analyzes your cognitive patterns and suggests practical strategies to optimize your capacity. Built on the ECCI™ framework. Your data is 100% private.
              </p>
            </div>

            {/* Card 3: RID-Approved Certification */}
            <div
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
                <Award className="h-8 w-8" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                RID-Approved Certification
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Earn RID-approved CEUs across multiple categories through Building Bridges Global, LLC (Sponsor #2309), including the new 'Studies of Healthy Minds & Bodies' category—active now.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: BUILT FOR EVERY INTERPRETING PROFESSIONAL */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FFFFFF' }}
        aria-labelledby="audience-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              id="audience-heading"
              className="text-4xl font-bold mb-4"
              style={{ color: '#1A1A1A' }}
            >
              Built for Every Interpreting Professional
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: '#5A5A5A' }}>
              Whether you're working in healthcare, legal, educational, or community settings, our platform adapts to your unique needs and challenges.
            </p>
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
                All Modalities
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Spoken, signed, Deaf or hearing interpreters—our tools work for everyone.
              </p>
            </div>

            <div className="text-center">
              <div
                className="inline-block p-4 rounded-full mb-4"
                style={{
                  backgroundColor: 'rgba(92, 127, 79, 0.1)',
                }}
              >
                <Target className="h-8 w-8" style={{ color: '#5C7F4F' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
                All Settings
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Medical, legal, educational, community—optimize performance wherever you work.
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
                All Career Stages
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                From students to seasoned professionals, grow your capacity at every level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: TESTIMONIAL */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FAF9F6' }}
        aria-labelledby="testimonials-heading"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            id="testimonials-heading"
            className="text-3xl font-bold mb-12 text-center"
            style={{ color: '#1A1A1A' }}
          >
            What Interpreters Are Saying
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className="rounded-2xl p-8"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>
              <p className="text-base mb-4 italic" style={{ color: '#5A5A5A', lineHeight: '1.7' }}>
                "InterpretReflect has transformed how I understand my cognitive load. The insights are practical and immediately applicable to my daily work."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                — Practicing Medical Interpreter
              </p>
            </div>

            <div
              className="rounded-2xl p-8"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>
              <p className="text-base mb-4 italic" style={{ color: '#5A5A5A', lineHeight: '1.7' }}>
                "The ECCI Framework gives me language to understand what I've been experiencing. Finally, a tool built specifically for interpreters."
              </p>
              <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                — Sarah Wheeler, Framework Creator
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: NEW RID PROFESSIONAL CATEGORY */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FFFFFF' }}
        aria-labelledby="rid-category-heading"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className="inline-block px-6 py-2 rounded-full mb-6"
            style={{
              backgroundColor: 'rgba(107, 139, 96, 0.1)',
              border: '1px solid rgba(107, 139, 96, 0.3)',
            }}
          >
            <span className="text-sm font-bold uppercase tracking-wide" style={{ color: '#4A6B3E' }}>
              Now Active
            </span>
          </div>
          <h2
            id="rid-category-heading"
            className="text-4xl font-bold mb-6"
            style={{ color: '#1A1A1A' }}
          >
            New RID Professional Category: Studies of Healthy Minds & Bodies
          </h2>
          <p className="text-lg mb-8" style={{ color: '#5A5A5A', lineHeight: '1.7' }}>
            InterpretReflect is approved to deliver CEUs in this new category, helping you document your professional development in cognitive wellness and capacity building.
          </p>
        </div>
      </section>

      {/* SECTION 7: THE ECCI™ FRAMEWORK (Detailed section) */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FAF9F6' }}
        aria-labelledby="ecci-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              id="ecci-heading"
              className="text-4xl font-bold mb-4"
              style={{ color: '#1A1A1A' }}
            >
              The ECCI™ Framework
            </h2>
            <h3 className="text-2xl font-semibold mb-6" style={{ color: '#5C7F4F' }}>
              Emotional & Cultural Competencies for Interpreters
            </h3>
            <p className="text-lg max-w-4xl mx-auto" style={{ color: '#5A5A5A', lineHeight: '1.7' }}>
              Our framework combines 16 neuroscience-based methods that measure how you process information, manage cultural context, regulate emotional labor, and maintain mental capacity during interpreting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Brain className="h-10 w-10 mx-auto mb-3" style={{ color: '#5C7F4F' }} />
              <h4 className="font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Cognitive Load
              </h4>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Measure how your brain processes multimodal information
              </p>
            </div>

            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Users className="h-10 w-10 mx-auto mb-3" style={{ color: '#5C7F4F' }} />
              <h4 className="font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Cultural Processing
              </h4>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Understand how you navigate cultural context
              </p>
            </div>

            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Heart className="h-10 w-10 mx-auto mb-3" style={{ color: '#5C7F4F' }} />
              <h4 className="font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Emotional Regulation
              </h4>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Track your emotional labor and regulation strategies
              </p>
            </div>

            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              }}
            >
              <TrendingUp className="h-10 w-10 mx-auto mb-3" style={{ color: '#5C7F4F' }} />
              <h4 className="font-bold mb-2" style={{ color: '#1A1A1A' }}>
                Capacity Building
              </h4>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Build sustainable performance over time
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl p-8 max-w-4xl mx-auto"
            style={{
              backgroundColor: 'rgba(92, 127, 79, 0.05)',
              border: '1px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <h4 className="text-xl font-bold mb-4 text-center" style={{ color: '#1A1A1A' }}>
              Research Foundation
            </h4>
            <p className="text-center" style={{ color: '#5A5A5A' }}>
              Based on cognitive science, interoception research, performance psychology, cultural neuroscience, and interpreter workload studies.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8: PERFORMANCE OPTIMIZATION PROTOCOL */}
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
              Your Performance Optimization Protocol
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                Establish Performance Baseline
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Take a 15-minute assessment. Get your personalized performance profile with specific metrics.
              </p>
            </div>

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
              <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                Track Performance Metrics
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Log your daily performance: baseline checks, post-assignment reflections, and capacity tracking—all included in your platform access.
              </p>
            </div>

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
              <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                Earn Professional Credits
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Purchase CEU bundles to certify your professional development while building sustainable practice habits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: THE DATA-DRIVEN CASE */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FAF9F6' }}
        aria-labelledby="data-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              id="data-heading"
              className="text-4xl font-bold mb-4"
              style={{ color: '#1A1A1A' }}
            >
              The Data-Driven Case
            </h2>
            <p className="text-lg max-w-4xl mx-auto" style={{ color: '#5A5A5A', lineHeight: '1.7' }}>
              National studies from 2024-2025 reveal the urgent need for performance optimization tools designed specifically for interpreters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className="text-4xl font-bold mb-2" style={{ color: '#5C7F4F' }}>
                73%
              </div>
              <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                of interpreters report experiencing burnout
              </p>
            </div>

            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className="text-4xl font-bold mb-2" style={{ color: '#5C7F4F' }}>
                68%
              </div>
              <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                struggle with cognitive overload
              </p>
            </div>

            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className="text-4xl font-bold mb-2" style={{ color: '#5C7F4F' }}>
                82%
              </div>
              <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                report emotional exhaustion
              </p>
            </div>

            <div
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className="text-4xl font-bold mb-2" style={{ color: '#5C7F4F' }}>
                91%
              </div>
              <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                want tools to track and improve performance
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl p-8 max-w-4xl mx-auto text-center"
            style={{
              backgroundColor: 'rgba(92, 127, 79, 0.05)',
              border: '1px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <p className="text-lg font-semibold" style={{ color: '#1A1A1A', lineHeight: '1.7' }}>
              The data is clear: interpreters need science-backed tools to optimize performance, prevent burnout, and sustain long-term capacity. InterpretReflect delivers exactly that.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 10: FINAL CTA */}
      <section
        className="py-20"
        style={{ backgroundColor: '#FFFFFF' }}
        aria-labelledby="final-cta-heading"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            id="final-cta-heading"
            className="text-4xl font-bold mb-4"
            style={{ color: '#1A1A1A' }}
          >
            Ready to Optimize Your Performance?
          </h2>
          <p className="text-xl mb-8" style={{ color: '#5A5A5A' }}>
            Start your performance assessment today and discover how the ECCI™ Framework can transform your practice.
          </p>

          <button
            onClick={onGetStarted}
            className="px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center mx-auto focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-sage-600"
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
            aria-label="Start your performance assessment"
          >
            Start Your Performance Assessment
            <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* SECTION 11: FOOTER */}
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
            <p className="text-sm text-center" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              RID Approved Sponsor #2309 | Building Bridges Global, LLC
            </p>
            <p className="text-sm text-center" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              © 2025 InterpretReflect. All rights reserved.
            </p>

            <div
              className="p-4 rounded-lg max-w-4xl mx-auto"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p className="text-xs leading-relaxed text-center" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                <strong className="text-white">Disclaimer:</strong> InterpretReflect™ is a performance optimization
                tool, not a substitute for professional mental health care. If you are experiencing significant
                distress, please consult a qualified professional.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {authModalOpen && (
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} mode={authMode} />
      )}
    </div>
  );
}

export default LandingPagePerformance;
