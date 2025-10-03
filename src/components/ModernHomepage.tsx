import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Heart,
  Users,
  Shield,
  Sparkles,
  ChevronRight,
  Star,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Clock,
  Award,
  MessageCircle,
  Zap,
  BarChart3,
  Globe,
  Smartphone,
  Calendar,
  Play,
} from 'lucide-react';

interface ModernHomepageProps {
  userName?: string;
  isLoggedIn?: boolean;
}

export const ModernHomepage: React.FC<ModernHomepageProps> = ({ userName, isLoggedIn = false }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      quote: "InterpretReflect helped me recognize burnout patterns I didn't even know I had. The daily check-ins are a game-changer.",
      author: "Sarah M.",
      role: "Medical Interpreter, 8 years",
      rating: 5,
    },
    {
      quote: "Finally, a wellness platform that understands the unique challenges interpreters face. It's like having a mentor in my pocket.",
      author: "James L.",
      role: "Conference Interpreter",
      rating: 5,
    },
    {
      quote: "The reflection tools and AI coach have transformed how I process difficult assignments. I feel more resilient than ever.",
      author: "Maria G.",
      role: "Community Interpreter",
      rating: 5,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      {/* Hero Section - Emotional Connection */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-teal-50 opacity-60"></div>
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-6">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Trusted by 10,000+ Interpreters Worldwide</span>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Wellness,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600"> Interpreted</span>
              </h1>
              
              {/* Value Proposition */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The first wellness platform designed specifically for interpreters. 
                Prevent burnout, process emotions, and thrive in your profession.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {isLoggedIn ? (
                  <Link
                    to="/burnout-gauge"
                    className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transform hover:scale-105 transition-all shadow-lg"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <button className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transform hover:scale-105 transition-all shadow-lg">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                    <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 font-semibold rounded-xl border-2 border-green-600 hover:bg-green-50 transition-all">
                      <Play className="mr-2 w-5 h-5" />
                      Watch Demo
                    </button>
                  </>
                )}
              </div>
              
              {/* Social Proof */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-400 border-2 border-white"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">4.9/5 from 2,000+ reviews</p>
                </div>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Your Daily Wellness Score</h3>
                    <span className="text-3xl font-bold text-green-600">85%</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-red-500" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-purple-500" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors">
                    View Detailed Insights
                  </button>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-yellow-100 rounded-lg p-3 shadow-lg animate-bounce">
                <Sparkles className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-purple-100 rounded-lg p-3 shadow-lg animate-pulse">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simple 3-Step Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Journey to Wellness in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start your personalized wellness journey in minutes
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Take Your Assessment",
                description: "Quick 2-minute daily check-in to understand your wellness patterns",
                icon: BarChart3,
                color: "bg-purple-100 text-purple-600",
              },
              {
                step: "2",
                title: "Get Personalized Insights",
                description: "AI-powered recommendations based on your unique interpreter challenges",
                icon: Brain,
                color: "bg-green-100 text-green-600",
              },
              {
                step: "3",
                title: "Practice & Improve",
                description: "Access targeted exercises, reflections, and connect with peers",
                icon: Heart,
                color: "bg-red-100 text-red-600",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/4 -right-4 z-10">
                    <ChevronRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${item.color} mb-6`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div className="text-sm font-bold text-gray-400 mb-2">STEP {item.step}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Benefits Focused */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Thrive
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive wellness tools designed for your unique professional challenges
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Daily Burnout Gauge",
                description: "Track your wellness in under 2 minutes daily",
                benefit: "Prevent burnout before it happens",
              },
              {
                icon: MessageCircle,
                title: "AI Wellness Coach",
                description: "24/7 support from Elya, your AI companion",
                benefit: "Never feel alone in your journey",
              },
              {
                icon: Users,
                title: "Peer Support Groups",
                description: "Connect with interpreters who understand",
                benefit: "Build your support network",
              },
              {
                icon: Brain,
                title: "Reflection Studio",
                description: "Process difficult assignments effectively",
                benefit: "Transform stress into growth",
              },
              {
                icon: Shield,
                title: "Boundary Setting Tools",
                description: "Learn to protect your emotional energy",
                benefit: "Maintain professional resilience",
              },
              {
                icon: TrendingUp,
                title: "Progress Analytics",
                description: "Visualize your wellness journey",
                benefit: "Celebrate your improvements",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-3">{feature.description}</p>
                    <p className="text-sm font-medium text-green-600 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {feature.benefit}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Social Proof */}
      <section className="py-20 bg-green-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Join Thousands of Thriving Interpreters
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from professionals just like you
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex justify-center mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            
            <blockquote className="text-2xl text-gray-700 text-center mb-8 leading-relaxed">
              "{testimonials[currentTestimonial].quote}"
            </blockquote>
            
            <div className="text-center">
              <p className="font-semibold text-gray-900">{testimonials[currentTestimonial].author}</p>
              <p className="text-gray-600">{testimonials[currentTestimonial].role}</p>
            </div>
            
            {/* Testimonial Navigation Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-green-600 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Build Trust */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10,000+", label: "Active Users", icon: Users },
              { number: "92%", label: "Report Less Burnout", icon: Heart },
              { number: "4.9/5", label: "App Store Rating", icon: Star },
              { number: "24/7", label: "AI Support Available", icon: Zap },
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Start Free, Upgrade Anytime
            </h2>
            <p className="text-xl text-gray-600">
              No credit card required. Full access for 14 days.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "$0",
                features: ["Daily Check-ins", "Basic Insights", "Community Access"],
                cta: "Start Free",
                popular: false,
              },
              {
                name: "Professional",
                price: "$19",
                features: ["Everything in Free", "AI Coach Access", "Advanced Analytics", "Priority Support"],
                cta: "Start Trial",
                popular: true,
              },
              {
                name: "Team",
                price: "Custom",
                features: ["Everything in Pro", "Team Dashboard", "Admin Controls", "Training Sessions"],
                cta: "Contact Sales",
                popular: false,
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl p-8 ${
                  plan.popular ? 'shadow-2xl scale-105 border-2 border-green-600' : 'shadow-lg border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.price}
                    {plan.price !== "Custom" && <span className="text-lg text-gray-600">/month</span>}
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Interpreter Wellness?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of interpreters who've taken control of their well-being
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 font-semibold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg">
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white hover:text-green-600 transition-all">
              <Calendar className="mr-2 w-5 h-5" />
              Book a Demo
            </button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 mt-12">
            <div className="flex items-center gap-2 text-white/90">
              <Shield className="w-5 h-5" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Globe className="w-5 h-5" />
              <span>Available in 12 Languages</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Smartphone className="w-5 h-5" />
              <span>iOS & Android</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};