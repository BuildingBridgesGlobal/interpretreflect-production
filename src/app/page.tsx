import Link from 'next/link';
import { Brain, Activity, Clock, Lightbulb, Users, Globe, TrendingUp, Check, Star, BarChart3, Zap } from 'lucide-react';
import HeroSection from '@/components/marketing/HeroSection';
import WhyThisMatters from '@/components/marketing/WhyThisMatters';
import TrustCredentials from '@/components/marketing/TrustCredentials';
import BuiltForAll from '@/components/marketing/BuiltForAll';
import FeatureGridCurrent from '@/components/marketing/FeatureGridCurrent';
import WhySection from '@/components/marketing/WhySection';
import StatsSection from '@/components/marketing/StatsSection';
import CatalystSection from '@/components/marketing/CatalystSection';
import PerformanceLoop from '@/components/marketing/PerformanceLoop';
import ResearchSection from '@/components/marketing/ResearchSection';
import AgencySection from '@/components/marketing/AgencySection';
import FinalCTA from '@/components/marketing/FinalCTA';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section with Wave */}
      <HeroSection />
      
      {/* Subtle Wave Transition */}
      <div className="relative">
        <svg className="absolute top-0 left-0 w-full h-16 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z" fill="currentColor" className="opacity-80"></path>
        </svg>
      </div>

      {/* Premium Value Proposition with Phamily Pharma Inspiration */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900 relative z-10 overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-24">
            <div className="inline-flex items-center px-6 py-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium mb-8 shadow-soft hover:shadow-soft-lg transition-all duration-500">
              <span className="w-2 h-2 bg-blue-500 dark:bg-blue-300 rounded-full mr-3 animate-pulse"></span>
              Built for Interpreters, by Interpreters
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-blue-300 mb-8 font-sans leading-tight font-display">
              Perform Your Best <span className="text-orange-500 dark:text-orange-400 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Every Assignment</span>
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-body mb-16 max-w-2xl mx-auto">
              Understand your patterns, prevent burnout, and optimize performance with personalized insights.
            </p>
          </div>
            
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-500 shadow-soft-lg hover:shadow-soft-dark-lg">
                  <Brain className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-4 font-sans font-heading">Understand</h3>
              <p className="text-gray-600 dark:text-gray-300 font-body text-base leading-relaxed max-w-xs mx-auto">Track your patterns and emotional intelligence with our comprehensive ECCI framework.</p>
            </div>
            
            <div className="text-center group">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-800 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-500 shadow-soft-lg hover:shadow-soft-dark-lg">
                  <TrendingUp className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-4 font-sans font-heading">Optimize</h3>
              <p className="text-gray-600 dark:text-gray-300 font-body text-base leading-relaxed max-w-xs mx-auto">Get personalized recommendations to improve your performance and prevent burnout.</p>
            </div>
            
            <div className="text-center group">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-500 shadow-soft-lg hover:shadow-soft-dark-lg">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-4 font-sans font-heading">Thrive</h3>
              <p className="text-gray-600 dark:text-gray-300 font-body text-base leading-relaxed max-w-xs mx-auto">Build lasting capacity and maintain peak performance throughout your career.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters - Simplified */}
      <section className="py-20 bg-slate-100 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-primary dark:text-blue-300 mb-4 font-sans">
                Why Interpreters Burn Out
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-200 font-body max-w-2xl mx-auto font-medium">
                Managing language, emotion, and ethics simultaneously takes a toll. 
                Without support, performance suffers.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-primary dark:text-blue-300 mb-1 font-sans">Emotional Exhaustion</h3>
                    <p className="text-brand-gray-600 dark:text-gray-300 font-body text-sm">Non-stop emotional work without recovery</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-primary dark:text-blue-300 mb-1 font-sans">Mental Fatigue</h3>
                    <p className="text-gray-700 dark:text-gray-200 font-body text-sm font-medium">Too many decisions, too little recovery time</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-primary dark:text-blue-300 mb-1 font-sans">Performance Decline</h3>
                    <p className="text-gray-700 dark:text-gray-200 font-body text-sm font-medium">Accuracy drops as stress builds up</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-700 rounded-2xl p-8 shadow-lg dark:shadow-xl border border-gray-200 dark:border-slate-600">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-primary dark:text-blue-300 mb-2 font-sans">The Solution</h3>
                  <p className="text-gray-800 dark:text-gray-100 font-body text-sm mb-4 font-medium">
                    Get real-time insights and coaching to maintain peak performance and build lasting capacity.
                  </p>
                  <Link href="/how-it-works" className="inline-flex items-center text-brand-energy font-medium text-sm hover:underline">
                    Learn how it works
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview - Simplified */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-primary dark:text-blue-300 mb-4 font-sans">
                Everything You Need to <span className="text-brand-energy dark:text-orange-400">Optimize Performance</span>
              </h2>
              <p className="text-lg text-brand-gray-600 dark:text-gray-300 font-body max-w-2xl mx-auto">
                Built specifically for interpreters, with features that understand your unique challenges and support your professional growth.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Brain className="w-8 h-8 text-white" />}
                title="ECCI Framework Integration"
                description="Built on the proven Emotional, Cultural, and Cognitive Intelligence framework specifically designed for interpreters."
                color="from-brand-electric to-brand-primary"
              />
              
              <FeatureCard
                icon={<Activity className="w-8 h-8 text-white" />}
                title="AI-Powered Catalyst"
                description="Get personalized recommendations based on your unique performance patterns and stress indicators."
                color="from-brand-energy to-brand-warmth"
              />
              
              <FeatureCard
                icon={<Clock className="w-8 h-8 text-white" />}
                title="Quick Reflection Tools"
                description="2-minute post-assignment check-ins that build longitudinal data without disrupting your workflow."
                color="from-brand-electric to-brand-slate"
              />
              
              <FeatureCard
                icon={<TrendingUp className="w-8 h-8 text-white" />}
                title="Performance Analytics"
                description="Track your cognitive load trends, emotional intelligence growth, and assignment performance over time."
                color="from-green-400 to-green-600"
              />
              
              <FeatureCard
                icon={<Users className="w-8 h-8 text-white" />}
                title="Team Insights (Agencies)"
                description="For agencies: monitor team performance, identify burnout risks, and optimize interpreter deployment."
                color="from-blue-400 to-blue-600"
              />
              
              <FeatureCard
                icon={<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>}
                title="Mobile-First Design"
                description="Access your performance data anywhere with our PWA-optimized mobile interface designed for busy interpreters."
                color="from-purple-400 to-purple-600"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose InterpretReflect */}
      <section className="py-20 bg-slate-100 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-primary dark:text-blue-300 mb-12 font-sans">
              Built for Professional Interpreters
            </h2>
            
            <div className="bg-white dark:bg-slate-700 rounded-2xl p-8 shadow-lg dark:shadow-xl border border-gray-200 dark:border-slate-600 mb-8">
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-brand-energy text-brand-energy" />
                ))}
              </div>
              <p className="text-lg text-gray-800 dark:text-gray-100 mb-6 italic font-body leading-relaxed font-medium">
                "Finally, a tool that understands the unique challenges interpreters face every day. 
                The ECCI framework provides insights I never knew I needed."
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-brand-primary-light rounded-full flex items-center justify-center">
                  <span className="font-sans font-bold text-brand-primary">SW</span>
                </div>
                <div className="text-left">
                  <div className="font-sans font-semibold text-brand-primary dark:text-blue-300">Sarah Wheeler, M.Ed., M.S.</div>
                  <div className="text-sm text-gray-700 dark:text-gray-200 font-body font-medium">Creator, ECCI Framework • 20+ years experience</div>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-brand-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-energy to-brand-electric rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-brand-primary dark:text-blue-300 mb-2 font-sans">ECCI Framework</div>
                <div className="text-sm text-brand-gray-600 dark:text-gray-300 font-body">Science-backed methodology</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-brand-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-electric to-brand-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-lg font-bold text-brand-primary dark:text-blue-300 mb-2 font-sans">AI-Powered</div>
                <div className="text-sm text-brand-gray-600 dark:text-gray-300 font-body">Personalized insights</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-brand-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-brand-primary dark:text-blue-300 mb-2 font-sans">Proven Results</div>
                <div className="text-sm text-brand-gray-600 dark:text-gray-300 font-body">Performance optimization</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <footer className="bg-brand-primary dark:bg-gray-900 text-white py-12 border-t-4 border-brand-electric">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Brand */}
              <div>
                <h3 className="text-2xl font-bold mb-3 font-sans text-white">InterpretReflect</h3>
                <p className="text-white/80 font-body mb-4">
                  Turn every assignment into measurable growth.
                </p>
                <p className="text-sm text-white/60 font-body">
                  © 2025 InterpretReflect. All rights reserved.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-bold mb-4 font-sans text-white">Quick Links</h4>
                <ul className="space-y-2 font-body">
                  <li>
                    <Link href="/about" className="text-white/80 hover:text-white transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-white/80 hover:text-white transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-white/80 hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-white/80 hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-lg font-bold mb-4 font-sans text-white">Contact Us</h4>
                <p className="text-white/80 font-body mb-2">
                  <a href="mailto:info@interpretreflect.com" className="hover:text-white transition-colors">
                    info@interpretreflect.com
                  </a>
                </p>
                <p className="text-white/80 font-body mb-2">
                  <span>Text: 424-333-0373 (text only)</span>
                </p>
                <p className="text-sm text-white/60 font-body mt-6">
                  Built by interpreters, for interpreters
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-brand-gray-200 dark:border-gray-700 hover:border-brand-electric/30 group">
      <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-brand-primary dark:text-blue-300 mb-3 font-sans">{title}</h3>
      <p className="text-brand-gray-600 dark:text-gray-300 font-body text-sm leading-relaxed">{description}</p>
    </div>
  );
}
