'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heart, Brain, Activity, Zap, ChevronRight, Play, Pause } from 'lucide-react'

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [metrics, setMetrics] = useState({
    cognitiveLoad: 73,
    emotionalState: 85,
    performance: 91,
    readiness: 78
  })

  useEffect(() => {
    setIsVisible(true)
    
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cognitiveLoad: Math.max(60, Math.min(95, prev.cognitiveLoad + (Math.random() - 0.5) * 4)),
        emotionalState: Math.max(70, Math.min(98, prev.emotionalState + (Math.random() - 0.5) * 3)),
        performance: Math.max(80, Math.min(99, prev.performance + (Math.random() - 0.5) * 2)),
        readiness: Math.max(65, Math.min(92, prev.readiness + (Math.random() - 0.5) * 5))
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const MetricCard = ({ title, value, unit, color, icon }: any) => (
    <div className={`medical-card p-4 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-400">{title}</span>
        <div className={`status-indicator status-${color}`}></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-white">{value}{unit}</div>
        <div className={`text-${color}-400`}>{icon}</div>
      </div>
      <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 rounded-full transition-all duration-1000`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  )

  const WaveformDisplay = () => (
    <div className="data-visualization p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-400">Neural Activity</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full status-blink"></div>
          <span className="text-xs text-green-400">Active</span>
        </div>
      </div>
      <div className="waveform">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className="waveform-bar" 
            style={{ height: `${20 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>
    </div>
  )

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white relative overflow-hidden">
      {/* Medical Interface Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent data-flow"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent data-flow" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full neural-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          {/* Left Column - Main Content */}
          <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {/* Status Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full status-blink"></div>
              <span className="text-sm font-medium text-blue-300">Interpreter Performance Optimization</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-gray-900 dark:text-white">Optimize Your</span>{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                  Interpreting Performance
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                Real-time cognitive monitoring and personalized insights to prevent burnout 
                and maintain peak performance throughout your career.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-gray-300">Cognitive Load Monitoring</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-gray-300">Burnout Prevention</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-gray-300">Performance Analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-gray-300">Real-time Insights</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/pricing" 
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all inline-flex items-center gap-2 group"
              >
                <span>Start Monitoring</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/how-it-works" 
                className="px-8 py-4 border border-gray-600 text-gray-300 rounded-xl font-semibold hover:bg-gray-800/50 hover:border-gray-500 transition-all inline-flex items-center gap-2"
              >
                <span>View Demo</span>
                <Play className="w-5 h-5" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="status-indicator status-active"></div>
                <span>RID Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="status-indicator status-active"></div>
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="status-indicator status-active"></div>
                <span>WCAG 2.1 AA</span>
              </div>
            </div>
          </div>

          {/* Right Column - Interface Preview */}
          <div className={`space-y-6 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{animationDelay: '0.2s'}}>
            <div className="medical-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Performance Dashboard</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full status-blink"></div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <MetricCard 
                  title="Cognitive Load" 
                  value={Math.round(metrics.cognitiveLoad)} 
                  unit="%" 
                  color="blue" 
                  icon={<Brain className="w-5 h-5" />}
                />
                <MetricCard 
                  title="Emotional State" 
                  value={Math.round(metrics.emotionalState)} 
                  unit="%" 
                  color="green" 
                  icon={<Heart className="w-5 h-5" />}
                />
                <MetricCard 
                  title="Performance" 
                  value={Math.round(metrics.performance)} 
                  unit="%" 
                  color="purple" 
                  icon={<Activity className="w-5 h-5" />}
                />
                <MetricCard 
                  title="Readiness" 
                  value={Math.round(metrics.readiness)} 
                  unit="%" 
                  color="orange" 
                  icon={<Zap className="w-5 h-5" />}
                />
              </div>
            </div>

            <WaveformDisplay />

            <div className="tech-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Last Analysis</span>
                <span className="text-sm text-green-400">2 minutes ago</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Neural patterns optimal • Recommend 15-min break in 45 minutes
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}