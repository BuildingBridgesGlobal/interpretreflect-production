import React from 'react';
import { 
  Shield, 
  Brain, 
  Heart, 
  Target, 
  Users, 
  Sparkles, 
  CheckCircle,
  TrendingUp,
  RefreshCw,
  MessageCircle,
  BookOpen,
  Clock,
  Award,
  Zap,
  ArrowRight,
  Star
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

function LandingPage({ onGetStarted }: LandingPageProps) {
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
          borderBottom: '1px solid rgba(168, 192, 154, 0.2)'
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a 
                href="#" 
                className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-sage-600 rounded-lg"
                aria-label="InterpretReflect home"
              >
                <div className="p-2 rounded-lg" style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                  boxShadow: '0 2px 8px rgba(107, 139, 96, 0.3)'
                }}>
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
                onClick={onGetStarted}
                className="px-5 py-2 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
                style={{
                  backgroundColor: 'transparent',
                  color: '#1A1A1A',
                  border: '2px solid transparent'
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
                onClick={onGetStarted}
                className="px-5 py-2 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(107, 139, 96, 0.25)'
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
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full" style={{
            background: 'radial-gradient(circle, #A8C09A 0%, transparent 70%)',
            animation: 'pulse 8s ease-in-out infinite'
          }}></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full" style={{
            background: 'radial-gradient(circle, #6B8B60 0%, transparent 70%)',
            animation: 'pulse 8s ease-in-out infinite 4s'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-8" style={{
              backgroundColor: 'rgba(107, 139, 96, 0.1)',
              border: '1px solid rgba(107, 139, 96, 0.3)'
            }}>
              <Sparkles className="h-4 w-4 mr-2" style={{ color: '#6B8B60' }} />
              <span className="text-sm font-semibold" style={{ color: '#6B8B60' }}>
                Built by Interpreters, for Interpreters
              </span>
            </div>
            
            <h1 id="hero-heading" className="text-5xl md:text-6xl font-bold mb-6" style={{
              color: '#1A1A1A',
              letterSpacing: '-1px',
              lineHeight: '1.1'
            }}>
              End Interpreter Burnout.<br />
              <span style={{ color: '#2D5F3F' }}>Build Emotional Resilience.</span>
            </h1>
            
            <p className="text-xl mb-10 max-w-3xl mx-auto" style={{
              color: '#5A5A5A',
              lineHeight: '1.7'
            }}>
              InterpretReflect is the first wellness platform designed specifically for interpreters. 
              Master emotional intelligence, prevent burnout, and thrive in your essential work.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-sage-600"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)'
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
                aria-label="Start your wellness journey today"
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
              </button>
              
              <button className="px-8 py-4 rounded-xl font-semibold text-lg transition-all focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-sage-600"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A1A',
                  border: '2px solid #6B8B60'
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
                aria-label="Watch product demo video"
              >
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20" style={{ backgroundColor: '#FFFFFF' }} aria-labelledby="problem-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="problem-heading" className="text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              The Silent Crisis in Interpreting
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: '#5A5A5A' }}>
              Interpreters face unique emotional challenges that traditional wellness apps don't address
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-block p-4 rounded-full mb-4" style={{
                backgroundColor: 'rgba(168, 192, 154, 0.1)'
              }}>
                <Brain className="h-10 w-10" aria-hidden="true" style={{ color: '#2D5F3F' }} />
              </div>
              <h3 className="text-6xl font-bold mb-2" style={{ color: '#2D5F3F' }}>73%</h3>
              <p className="text-lg font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                Experience Vicarious Trauma
              </p>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                From interpreting traumatic content daily
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-block p-4 rounded-full mb-4" style={{
                backgroundColor: 'rgba(168, 192, 154, 0.1)'
              }}>
                <Heart className="h-10 w-10" aria-hidden="true" style={{ color: '#2D5F3F' }} />
              </div>
              <h3 className="text-6xl font-bold mb-2" style={{ color: '#2D5F3F' }}>68%</h3>
              <p className="text-lg font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                Report Emotional Exhaustion
              </p>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Leading to decreased performance
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-block p-4 rounded-full mb-4" style={{
                backgroundColor: 'rgba(168, 192, 154, 0.1)'
              }}>
                <Users className="h-10 w-10" aria-hidden="true" style={{ color: '#2D5F3F' }} />
              </div>
              <h3 className="text-6xl font-bold mb-2" style={{ color: '#2D5F3F' }}>82%</h3>
              <p className="text-lg font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                Feel Professionally Isolated
              </p>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Without adequate support systems
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Features */}
      <section className="py-20" style={{ backgroundColor: '#FAF9F6' }} aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              Your Complete Wellness Toolkit
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: '#5A5A5A' }}>
              Evidence-based tools designed for the unique needs of interpreters
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Reflection Studio */}
            <article className="rounded-2xl p-8 transition-all cursor-pointer group" 
              tabIndex={0}
              role="article"
              aria-labelledby="reflection-studio-heading"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '2px solid transparent'
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
              }}>
              <div className="inline-block p-3 rounded-xl mb-4" style={{
                background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)'
              }}>
                <BookOpen className="h-8 w-8" aria-hidden="true" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 id="reflection-studio-heading" className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                Reflection Studio
              </h3>
              <p className="mb-4" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Process challenging assignments with guided prompts tailored to interpreter experiences
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" style={{ color: '#2D5F3F' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Vicarious trauma processing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Boundary setting exercises</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Professional growth tracking</span>
                </li>
              </ul>
            </article>

            {/* Stress Reset */}
            <article className="rounded-2xl p-8 transition-all cursor-pointer group" 
              tabIndex={0}
              role="article"
              aria-labelledby="stress-reset-heading"
              style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              border: '2px solid transparent'
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
            }}>
              <div className="inline-block p-3 rounded-xl mb-4" style={{
                background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)'
              }}>
                <RefreshCw className="h-8 w-8" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 id="stress-reset-heading" className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                Stress Reset Techniques
              </h3>
              <p className="mb-4" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Quick, effective resets you can do between assignments or during breaks
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>2-minute breathing exercises</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Body tension release</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Sensory grounding tools</span>
                </li>
              </ul>
            </article>

            {/* Elya AI */}
            <article className="rounded-2xl p-8 transition-all cursor-pointer group" 
              tabIndex={0}
              role="article"
              aria-labelledby="elya-ai-heading"
              style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              border: '2px solid transparent'
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
            }}>
              <div className="inline-block p-3 rounded-xl mb-4" style={{
                background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)'
              }}>
                <MessageCircle className="h-8 w-8" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 id="elya-ai-heading" className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                Elya AI Companion
              </h3>
              <p className="mb-4" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Your 24/7 wellness companion who understands interpreter challenges
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Debrief difficult sessions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Emotional processing support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Personalized wellness tips</span>
                </li>
              </ul>
            </article>

            {/* Growth Insights */}
            <article className="rounded-2xl p-8 transition-all cursor-pointer group" style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              border: '2px solid transparent'
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
            }}>
              <div className="inline-block p-3 rounded-xl mb-4" style={{
                background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)'
              }}>
                <TrendingUp className="h-8 w-8" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                Growth Insights
              </h3>
              <p className="mb-4" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Track your emotional intelligence development and wellness patterns
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Stress pattern analysis</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Resilience metrics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Progress celebrations</span>
                </li>
              </ul>
            </article>

            {/* Emotional Intelligence */}
            <article className="rounded-2xl p-8 transition-all cursor-pointer group" style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              border: '2px solid transparent'
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
            }}>
              <div className="inline-block p-3 rounded-xl mb-4" style={{
                background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)'
              }}>
                <Heart className="h-8 w-8" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                EQ Development
              </h3>
              <p className="mb-4" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                Build the emotional skills that make great interpreters exceptional
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Self-awareness exercises</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Empathy regulation tools</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Cultural sensitivity training</span>
                </li>
              </ul>
            </article>

            {/* Community */}
            <article className="rounded-2xl p-8 transition-all cursor-pointer group" style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              border: '2px solid transparent'
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
            }}>
              <div className="inline-block p-3 rounded-xl mb-4" style={{
                background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)'
              }}>
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
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Anonymous peer forums</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Monthly wellness circles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span className="text-sm" style={{ color: '#3A3A3A' }}>Mentor matching program</span>
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              Trusted by Interpreters Worldwide
            </h2>
            <p className="text-lg" style={{ color: '#5A5A5A' }}>
              Join thousands of interpreters who've transformed their practice
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl p-8" style={{
              backgroundColor: '#FAF9F6',
              border: '1px solid rgba(168, 192, 154, 0.2)'
            }}>
              <div className="flex mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-current" style={{ color: '#6B8B60' }} />
                ))}
              </div>
              <p className="mb-4 italic" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                "InterpretReflect gave me the tools to process difficult medical interpretations without carrying that weight home. Game-changing."
              </p>
              <div>
                <p className="font-semibold" style={{ color: '#1A1A1A' }}>Sarah M.</p>
                <p className="text-sm" style={{ color: '#6B7C6B' }}>Medical Interpreter, 8 years</p>
              </div>
            </div>
            
            <div className="rounded-2xl p-8" style={{
              backgroundColor: '#FAF9F6',
              border: '1px solid rgba(168, 192, 154, 0.2)'
            }}>
              <div className="flex mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-current" style={{ color: '#6B8B60' }} />
                ))}
              </div>
              <p className="mb-4 italic" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                "The stress reset techniques work perfectly between court sessions. I'm more focused and less drained at the end of the day."
              </p>
              <div>
                <p className="font-semibold" style={{ color: '#1A1A1A' }}>Marcus T.</p>
                <p className="text-sm" style={{ color: '#6B7C6B' }}>Court Interpreter, 12 years</p>
              </div>
            </div>
            
            <div className="rounded-2xl p-8" style={{
              backgroundColor: '#FAF9F6',
              border: '1px solid rgba(168, 192, 154, 0.2)'
            }}>
              <div className="flex mb-4">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-current" style={{ color: '#6B8B60' }} />
                ))}
              </div>
              <p className="mb-4 italic" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                "Finally, a wellness app that understands interpreters! The EQ training has made me a better interpreter and person."
              </p>
              <div>
                <p className="font-semibold" style={{ color: '#1A1A1A' }}>Ana R.</p>
                <p className="text-sm" style={{ color: '#6B7C6B' }}>Conference Interpreter, 5 years</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20" style={{ backgroundColor: '#FAF9F6' }} aria-labelledby="pricing-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="pricing-heading" className="text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              Choose Your Wellness Journey
            </h2>
            <p className="text-lg" style={{ color: '#5A5A5A' }}>
              Invest in your wellbeing with plans designed for every interpreter
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="rounded-2xl p-8" style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #A8C09A'
            }}>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{
                backgroundColor: 'rgba(168, 192, 154, 0.1)',
                color: '#6B8B60'
              }}>
                BETA ACCESS
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Essential</h3>
              <p className="mb-6" style={{ color: '#5A5A5A' }}>Perfect for getting started</p>
              <div className="mb-6">
                <span className="text-4xl font-bold" style={{ color: '#1A1A1A' }}>$12</span>
                <span style={{ color: '#5A5A5A' }}>/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span style={{ color: '#5A5A5A' }}>5 reflections per month</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span style={{ color: '#5A5A5A' }}>All stress reset techniques</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span style={{ color: '#5A5A5A' }}>Basic growth insights</span>
                </li>
              </ul>
              <button 
                onClick={onGetStarted}
                className="w-full py-3 rounded-xl font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-sage-600"
                style={{
                  backgroundColor: '#2D5F3F',
                  color: '#FFFFFF',
                  border: '2px solid #2D5F3F'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1A4A2A';
                  e.currentTarget.style.borderColor = '#1A4A2A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2D5F3F';
                  e.currentTarget.style.borderColor = '#2D5F3F';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '3px solid #1A1A1A';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
                aria-label="Get started with Essential plan for $12 per month"
              >
                Get Started
              </button>
            </div>
            
            {/* Professional Plan */}
            <div className="rounded-2xl p-8 relative transform scale-105" style={{
              background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
              boxShadow: '0 10px 30px rgba(107, 139, 96, 0.3)'
            }}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-1 rounded-full text-sm font-semibold" style={{
                  backgroundColor: '#FAF9F6',
                  color: '#6B8B60'
                }}>
                  MOST POPULAR
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Professional</h3>
              <p className="mb-6" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>For dedicated interpreters</p>
              <div className="mb-6">
                <span className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>Coming Soon</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#FFFFFF' }} />
                  <span style={{ color: '#FFFFFF' }}>Unlimited reflections</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#FFFFFF' }} />
                  <span style={{ color: '#FFFFFF' }}>Elya AI companion</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#FFFFFF' }} />
                  <span style={{ color: '#FFFFFF' }}>Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#FFFFFF' }} />
                  <span style={{ color: '#FFFFFF' }}>EQ development courses</span>
                </li>
              </ul>
              <button 
                onClick={onGetStarted}
                className="w-full py-3 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#6B8B60'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Join Waitlist
              </button>
            </div>
            
            {/* Team Plan */}
            <div className="rounded-2xl p-8" style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #E8E5E0'
            }}>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Team</h3>
              <p className="mb-6" style={{ color: '#5A5A5A' }}>For agencies & organizations</p>
              <div className="mb-6">
                <span className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>Coming Soon</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span style={{ color: '#5A5A5A' }}>Everything in Professional</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span style={{ color: '#5A5A5A' }}>Team wellness dashboard</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span style={{ color: '#5A5A5A' }}>Custom wellness programs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                  <span style={{ color: '#5A5A5A' }}>Priority support</span>
                </li>
              </ul>
              <button className="w-full py-3 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A1A',
                  border: '2px solid #A8C09A'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FBF6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{
        background: 'linear-gradient(135deg, #2D5F3F 0%, #3A704D 100%)'
      }} aria-labelledby="cta-heading">
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
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
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

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              © 2024 InterpretReflect. Built with ❤️ by interpreters, for interpreters.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;