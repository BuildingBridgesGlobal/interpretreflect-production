'use client';

import Link from 'next/link';
import { Heart, Users, Award, Target, Sparkles, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-900 dark:to-slate-800 text-white py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-6xl font-bold mb-8 font-sans leading-tight">
              Built for Interpreters, <span className="text-blue-200">By Interpreters</span>
            </h1>
            <p className="text-2xl text-white/90 font-body leading-relaxed max-w-2xl mx-auto">
              We understand the cognitive load of interpreting because we've lived it.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium mb-8">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Our Story
                </div>
                <h2 className="text-4xl font-bold text-brand-primary dark:text-blue-300 mb-8 font-sans leading-tight">
                  Created by an Interpreter<br/>Perfected by Experience
                </h2>
                <div className="space-y-6 text-brand-gray-700 dark:text-gray-300 font-body">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                    <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Child of Deaf Adults (CODA)</p>
                    <p className="text-sm">Born and raised in the Deaf community. I understand interpretation from both sides of the conversation.</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
                    <p className="font-semibold text-orange-800 dark:text-orange-300 mb-2">20+ Years Experience</p>
                    <p className="text-sm">Medical, legal, mental health, and community interpreting across diverse settings.</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                    <p className="font-semibold text-green-800 dark:text-green-300 mb-2">Built from Necessity</p>
                    <p className="text-sm">Created after watching too many talented interpreters burn out from cognitive overload.</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-10">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-primary dark:text-blue-300 mb-4 font-sans">
                    From the Community<br/>For the Community
                  </h3>
                  <p className="text-brand-gray-600 dark:text-gray-400 font-body leading-relaxed">
                    Every feature is designed with real interpreter challenges in mind.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-24 bg-brand-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm font-medium mb-8">
              <Target className="w-4 h-4 mr-2" />
              Our Mission
            </div>
            <h2 className="text-5xl font-bold text-brand-primary dark:text-blue-300 mb-6 font-sans leading-tight">
              Performance Without Burnout
            </h2>
            <p className="text-xl text-brand-gray-600 dark:text-gray-300 font-body max-w-2xl mx-auto leading-relaxed mb-16">
              You weren't meant to just survive each assignment. You were meant to thrive.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-brand-primary dark:text-blue-300 mb-3 font-sans">
                  Human-First Design
                </h3>
                <p className="text-brand-gray-600 dark:text-gray-400 font-body text-sm leading-relaxed">
                  Built by interpreters who understand your daily reality.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-brand-primary dark:text-blue-300 mb-3 font-sans">
                  Evidence-Based Tools
                </h3>
                <p className="text-brand-gray-600 dark:text-gray-400 font-body text-sm leading-relaxed">
                  Grounded in neuroscience and interpreter-specific research.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-brand-primary dark:text-blue-300 mb-3 font-sans">
                  Sustainable Growth
                </h3>
                <p className="text-brand-gray-600 dark:text-gray-400 font-body text-sm leading-relaxed">
                  Optimize performance while protecting your long-term capacity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium mb-8">
                <Award className="w-4 h-4 mr-2" />
                What Sets Us Apart
              </div>
              <h2 className="text-5xl font-bold text-brand-primary dark:text-blue-300 mb-6 font-sans leading-tight">
                Interpreter-Specific Intelligence
              </h2>
              <p className="text-xl text-brand-gray-600 dark:text-gray-400 font-body max-w-2xl mx-auto">
                Built differently because we understand your world
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-primary dark:text-blue-300 mb-2 font-sans">No Generic Wellness</h3>
                    <p className="text-brand-gray-600 dark:text-gray-400 font-body text-sm leading-relaxed">Every tool addresses interpreter-specific cognitive challenges.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-primary dark:text-blue-300 mb-2 font-sans">Real Performance Data</h3>
                    <p className="text-brand-gray-600 dark:text-gray-400 font-body text-sm leading-relaxed">Track patterns that actually matter for interpreting quality.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-primary dark:text-blue-300 mb-2 font-sans">Frictionless Integration</h3>
                    <p className="text-brand-gray-600 dark:text-gray-400 font-body text-sm leading-relaxed">Works seamlessly within your existing workflow.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-10">
                <h3 className="text-2xl font-bold text-brand-primary dark:text-blue-300 mb-6 font-sans">
                  Trusted Foundations
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-brand-gray-700 dark:text-gray-300 font-body">Women Owned Small Business (WOSB)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-brand-gray-700 dark:text-gray-300 font-body">Disabled Veteran Owned</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-brand-gray-700 dark:text-gray-300 font-body">Deaf-led Advisory Support</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-brand-gray-700 dark:text-gray-300 font-body">RID Approved Sponsor #2309</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-32 bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-900 dark:to-slate-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold mb-8 font-sans leading-tight text-white drop-shadow-2xl">
              Your Success Is Our Mission
            </h2>
            <p className="text-2xl text-white/95 font-body leading-relaxed mb-12 max-w-2xl mx-auto drop-shadow-lg">
              Every interpreter deserves tools that understand their craft. We're committed to helping you deliver exceptional service while protecting what matters most—your capacity to thrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/pricing" className="bg-white text-blue-800 font-bold px-10 py-5 rounded-2xl hover:bg-gray-100 transition-all inline-flex items-center justify-center gap-3 font-sans text-lg">
                Start Your Journey
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link href="/contact" className="border-2 border-white/30 text-white font-semibold px-10 py-5 rounded-2xl hover:bg-white/10 hover:text-white active:bg-white/20 active:text-white backdrop-blur-sm transition-all font-sans inline-flex items-center justify-center text-lg focus:outline-none focus:ring-2 focus:ring-white/50">
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
