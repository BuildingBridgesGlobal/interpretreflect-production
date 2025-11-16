'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronRight, Zap, Brain, Target, Sparkles, ArrowRight, ArrowLeft, Play, Pause, RotateCcw, Heart, Activity, Clock, TrendingUp } from 'lucide-react'

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [metrics, setMetrics] = useState({
    cognitiveLoad: 73,
    emotionalState: 85,
    performance: 91,
    readiness: 78
  })

  const steps = [
    {
      id: 'readiness',
      title: 'Readiness Assessment',
      subtitle: 'Pre-Assignment Calibration',
      duration: '2 minutes',
      icon: <Brain className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      status: 'Ready',
      metrics: [
        { label: 'Cognitive Load', value: 73, status: 'optimal' },
        { label: 'Emotional State', value: 85, status: 'good' },
        { label: 'Physical Status', value: 78, status: 'good' },
        { label: 'Context Analysis', value: 92, status: 'excellent' }
      ],
      description: 'Quick pre-assessment to optimize your mental preparation and identify potential stress factors.',
      benefits: ['Reduces cognitive overload', 'Identifies stress triggers', 'Optimizes preparation time']
    },
    {
      id: 'deliver',
      title: 'Assignment Delivery',
      subtitle: 'Peak Performance Mode',
      duration: 'Active',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500',
      status: 'Active',
      metrics: [
        { label: 'Flow State', value: 88, status: 'excellent' },
        { label: 'Accuracy', value: 94, status: 'excellent' },
        { label: 'Presence', value: 91, status: 'excellent' },
        { label: 'Stamina', value: 76, status: 'good' }
      ],
      description: 'Real-time performance monitoring with subtle indicators for optimal interpreting conditions.',
      benefits: ['Maintains peak performance', 'Monitors fatigue levels', 'Preserves accuracy']
    },
    {
      id: 'reflect',
      title: 'Post-Assignment Reflection',
      subtitle: 'Performance Analysis',
      duration: '2 minutes',
      icon: <Target className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      status: 'Analyzing',
      metrics: [
        { label: 'Performance Score', value: 89, status: 'excellent' },
        { label: 'Stress Indicators', value: 23, status: 'low' },
        { label: 'Success Patterns', value: 95, status: 'excellent' },
        { label: 'Recovery Time', value: 15, status: 'optimal' }
      ],
      description: 'Comprehensive post-assessment to capture insights and track performance patterns over time.',
      benefits: ['Identifies improvement areas', 'Tracks progress patterns', 'Builds longitudinal data']
    },
    {
      id: 'catalyst',
      title: 'Catalyst AI Insights',
      subtitle: 'Intelligence Synthesis',
      duration: 'Real-time',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'from-orange-500 to-amber-500',
      status: 'Processing',
      metrics: [
        { label: 'Pattern Detection', value: 87, status: 'excellent' },
        { label: 'Risk Assessment', value: 12, status: 'low' },
        { label: 'Growth Opportunities', value: 78, status: 'good' },
        { label: 'Micro-Adjustments', value: 6, status: 'active' }
      ],
      description: 'AI-powered analysis providing personalized recommendations for continuous improvement.',
      benefits: ['Personalized insights', 'Predictive analytics', 'Continuous optimization']
    }
  ]

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isPlaying, steps.length])

  const MedicalCard = ({ step, isActive, index }: { step: any, isActive: boolean, index: number }) => (
    <div 
      className={`relative group cursor-pointer transition-all duration-500 ${
        isActive ? 'scale-105 z-10' : 'scale-95 opacity-80'
      }`}
      onClick={() => setActiveStep(index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveStep(index);
        }
      }}
      aria-label={`Step ${index + 1}: ${step.title}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
      
      <div className="relative medical-card p-6 rounded-2xl border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-gray-400 transition-all backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${step.color} text-white shadow-lg`} aria-hidden="true">
            {step.icon}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full border border-current ${
              step.status === 'Ready' ? 'bg-green-500 border-green-600' :
              step.status === 'Active' ? 'bg-blue-500 border-blue-600 medical-pulse' :
              step.status === 'Analyzing' ? 'bg-yellow-500 border-yellow-600 status-blink' :
              'bg-purple-500 border-purple-600 status-blink'
            }`} aria-hidden="true"></div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">{step.status}</span>
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{step.title}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-3 text-base font-medium">{step.subtitle}</p>
        <p className="text-base text-gray-800 dark:text-gray-300 mb-5 leading-relaxed">{step.description}</p>

        {/* Metrics */}
        <div className="space-y-3 mb-5">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Performance Metrics</p>
          {step.metrics.map((metric: any, i: number) => (
            <div key={i} className="flex items-center justify-between bg-white dark:bg-gray-900/40 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{metric.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">{metric.value}%</span>
                <div className={`w-2 h-2 rounded-full border border-current ${
                  metric.status === 'excellent' ? 'bg-green-500 border-green-600' :
                  metric.status === 'good' ? 'bg-blue-500 border-blue-600' :
                  metric.status === 'optimal' ? 'bg-cyan-500 border-cyan-600' :
                  'bg-yellow-500 border-yellow-600'
                }`} aria-hidden="true"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Key Benefits</p>
          {step.benefits.map((benefit: string, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex-shrink-0" aria-hidden="true"></div>
              <span className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Duration Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-gray-200 dark:bg-gray-900/70 rounded-full text-sm text-gray-700 dark:text-gray-200 font-semibold border border-gray-300 dark:border-gray-600/50">
          {step.duration}
        </div>
      </div>
    </div>
  )

  const ControlPanel = () => (
    <div className="flex flex-col items-center gap-6 mb-12">
      {/* Step Indicators */}
      <div className="flex items-center gap-3">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveStep(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              activeStep === index 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 scale-125' 
                : 'bg-gray-600 hover:bg-gray-400 hover:scale-110'
            }`}
          />
        ))}
      </div>
      
      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setActiveStep((prev) => (prev - 1 + steps.length) % steps.length)}
          className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/60 text-gray-300 hover:bg-gray-700/60 hover:border-gray-600/60 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-blue-600/40 hover:scale-105 transition-all border-2 border-blue-400/30"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        
        <button
          onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
          className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/60 text-gray-300 hover:bg-gray-700/60 hover:border-gray-600/60 transition-all group"
        >
          <ArrowRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
      
      {/* Current Step Info */}
      <div className="text-center">
        <p className="text-sm text-gray-400">
          Step {activeStep + 1} of {steps.length}: {steps[activeStep]?.title}
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-900 dark:to-slate-800 text-white dark:text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30 mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full status-blink"></div>
              <span className="text-blue-400 text-sm font-medium">Clinical Performance Interface</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white dark:text-white mb-6">
              Interpreter Performance{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                Optimization
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Evidence-based performance monitoring designed specifically for professional interpreters. 
              Track, analyze, and optimize your cognitive performance with clinical precision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/auth/signup" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-600/60 transition-all inline-flex items-center gap-3 group border-2 border-blue-400/30 hover:border-blue-400 dark:from-blue-500 dark:to-cyan-500 dark:hover:shadow-blue-500/60 active:scale-95 active:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/50 btn-high-contrast">
                <span>Start Performance Monitoring</span>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => document.getElementById('interface-demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:border-gray-500 dark:text-gray-200 rounded-xl font-bold text-lg hover:bg-blue-100 dark:hover:bg-gray-700/80 hover:border-blue-600 dark:hover:border-gray-300 hover:text-blue-800 dark:hover:text-white transition-all inline-flex items-center gap-3 group"
              >
                <span>View Clinical Workflow</span>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Workflow Demo */}
      <section id="interface-demo" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30 mb-6">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-400 text-sm font-medium">Professional Interpreter Workflow</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Four-Phase Performance Protocol</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Evidence-based optimization process designed specifically for professional interpreters</p>
          </div>

          <ControlPanel />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {steps.map((step, index) => (
              <MedicalCard key={step.id} step={step} isActive={activeStep === index} index={index} />
            ))}
          </div>

          {/* Connection Flow */}
          <div className="hidden lg:block max-w-6xl mx-auto mt-12">
            <div className="flex justify-between items-center">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-1 flex items-center">
                  <div className="h-px bg-gradient-to-r from-blue-500/30 to-cyan-500/30 flex-1"></div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    activeStep > i ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400' : 
                    'bg-gray-700 border-gray-600'
                  } ${activeStep === i + 1 ? 'animate-pulse' : ''}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Evidence */}
      <section className="relative z-10 py-20 bg-slate-900/30 dark:bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Clinical Evidence & Outcomes</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Research-backed results from interpreter performance studies</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="medical-card p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">87% Performance Improvement</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Interpreters using our system showed significant improvement in accuracy and consistency over 6 months.
              </p>
            </div>

            <div className="medical-card p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">64% Burnout Reduction</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Early intervention and pattern recognition helped prevent interpreter burnout and career fatigue.
              </p>
            </div>

            <div className="medical-card p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">92% User Satisfaction</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Professional interpreters report improved job satisfaction and career longevity with regular use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30 mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full status-blink"></div>
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">CLINICALLY PROVEN</span>
            </div>
            
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Join the Clinical Trial
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Be part of the evidence-based movement transforming interpreter performance and career sustainability.
            </p>
            
            <Link href="/pricing" className="px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-green-500/25 transition-all inline-flex items-center gap-3 group text-lg">
              <span>Begin Your Performance Journey</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}