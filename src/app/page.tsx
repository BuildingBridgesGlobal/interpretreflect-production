import Link from 'next/link';
import { ArrowRight, Brain, BarChart3, Activity, Check, Users, Globe, Heart, Star, Zap, Award, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* DARK HERO SECTION - Premium BetterUp/MasterClass Style */}
      <section className="bg-gradient-to-br from-brand-primary-dark via-brand-primary to-brand-slate text-white py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-brand-electric rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-brand-energy rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 bg-brand-energy/20 backdrop-blur-sm border border-brand-energy/30 rounded-full px-6 py-2 mb-6">
              <span className="w-2 h-2 bg-brand-energy rounded-full animate-pulse"></span>
              <span className="text-sm font-mono uppercase tracking-wider text-brand-energy-light font-semibold">
                For All Interpreting Professionals
              </span>
            </div>

            {/* Main headline - Transformation focused */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight font-sans">
              <span className="text-white">Perform at Your Peak.</span>
              <span className="block text-brand-energy mt-2">Every Assignment.</span>
            </h1>

            {/* Subhead - Outcome driven */}
            <p className="text-xl text-white/90 mb-6 leading-relaxed font-body">
              The first neuroscience-backed performance platform built specifically for interpreters.
              AI-powered recommendations, RID-approved professional development, proven to optimize
              cognitive load and elevate your capacity.
            </p>

            {/* Social proof inline */}
            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-brand-success" />
                <span>16 neuroscience frameworks</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-brand-success" />
                <span>RID Sponsor #2309</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-brand-success" />
                <span>5.0+ CEUs available</span>
              </div>
            </div>

            {/* CTA Stack */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="bg-brand-energy text-white font-bold text-base px-10 py-5 rounded-lg hover:bg-brand-energy-hover transition-all shadow-2xl hover:shadow-brand-energy/50 group font-sans inline-flex items-center justify-center gap-2"
              >
                Start Your Performance Assessment
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#how-it-works"
                className="border-2 border-white/30 text-white font-semibold text-base px-10 py-5 rounded-lg hover:bg-white/10 backdrop-blur-sm transition-all font-sans inline-flex items-center justify-center"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 0L60 8.33C120 16.7 240 33.3 360 41.7C480 50 600 50 720 45C840 40 960 30 1080 28.3C1200 26.7 1320 33.3 1380 36.7L1440 40V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V0Z" fill="#F8F9FA"/>
          </svg>
        </div>
      </section>

      {/* SOCIAL PROOF STATS - Like BetterUp */}
      <section className="bg-brand-gray-50 py-16 border-b border-brand-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-brand-primary mb-2 font-mono">16</div>
                <div className="text-sm text-brand-gray-600 uppercase tracking-wide font-body">Research Frameworks</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-brand-success mb-2 font-mono">5.0+</div>
                <div className="text-sm text-brand-gray-600 uppercase tracking-wide font-body">CEUs Available</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-brand-energy mb-2 font-mono">24/7</div>
                <div className="text-sm text-brand-gray-600 uppercase tracking-wide font-body">AI Performance Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-brand-primary mb-4 font-sans">
              Everything You Need to Optimize Performance
            </h2>
            <p className="text-lg text-brand-gray-600 max-w-2xl mx-auto font-body">
              Built on neuroscience, designed for interpreters, powered by AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-12 h-12 text-brand-electric" />}
              title="Neuroscience-Based Framework"
              description="The ECCI™ Model (Emotional & Cultural Competencies for Interpreters): 16 integrated frameworks analyzing cognitive load, cultural processing, and performance neuroplasticity."
            />
            <FeatureCard
              icon={<Activity className="w-12 h-12 text-brand-electric" />}
              title="Catalyst: Your AI Performance Partner"
              description="24/7 access to personalized insights and recommendations. Catalyst accelerates your professional growth by analyzing cognitive load patterns and optimizing capacity, all based on the ECCI™ framework. Your data stays private."
            />
            <FeatureCard
              icon={<Award className="w-12 h-12 text-brand-electric" />}
              title="RID-Approved Certification"
              description="Earn professional studies credits across multiple categories through Building Bridges Global, LLC (RID Approved Sponsor #2309), including the new 'Studies of Healthy Minds & Bodies' category launching December 1, 2025."
            />
          </div>
        </div>
      </section>

      {/* Inclusivity Section */}
      <section className="bg-brand-gray-50 py-20 border-y border-brand-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-brand-primary mb-4 font-sans">
                Built for Every Interpreting Professional
              </h2>
              <p className="text-lg text-brand-gray-600 max-w-2xl mx-auto font-body">
                The ECCI framework adapts to your unique interpreting practice, regardless of language, modality, or professional setting.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-data p-8 border-l-4 border-brand-electric hover:shadow-card transition-shadow">
                <Users className="w-12 h-12 text-brand-electric mb-4" />
                <h3 className="text-xl font-bold text-brand-charcoal mb-3 font-sans">All Modalities</h3>
                <p className="text-brand-gray-600 font-body leading-relaxed">
                  Signed language interpreting and spoken language interpreting
                </p>
              </div>

              <div className="bg-white rounded-data p-8 border-l-4 border-brand-energy hover:shadow-card transition-shadow">
                <Globe className="w-12 h-12 text-brand-energy mb-4" />
                <h3 className="text-xl font-bold text-brand-charcoal mb-3 font-sans">All Settings</h3>
                <p className="text-brand-gray-600 font-body leading-relaxed">
                  Medical, legal, educational, conference, and community interpreting
                </p>
              </div>

              <div className="bg-white rounded-data p-8 border-l-4 border-brand-warmth hover:shadow-card transition-shadow">
                <TrendingUp className="w-12 h-12 text-brand-warmth mb-4" />
                <h3 className="text-xl font-bold text-brand-charcoal mb-3 font-sans">All Experience Levels</h3>
                <p className="text-brand-gray-600 font-body leading-relaxed">
                  From new interpreters building capacity to seasoned professionals optimizing performance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION - Founder Quote */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-brand-primary mb-4 font-sans">
              Built on Research & Real-World Experience
            </h2>
            <p className="text-center text-brand-gray-600 mb-12 font-body">
              From the creator of the ECCI framework
            </p>

            <div className="bg-brand-gray-50 rounded-xl p-10 border-2 border-brand-electric shadow-lg">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-brand-energy text-brand-energy" />
                ))}
              </div>
              <p className="text-xl text-brand-gray-700 mb-8 italic font-body leading-relaxed">
                "As the creator of the ECCI framework, I've seen firsthand how quantifying cognitive load helps interpreters maintain peak performance and optimize their practice. InterpretReflect makes this research accessible to every interpreting professional, giving you the tools to understand your unique performance patterns and build sustainable capacity."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-brand-primary-light rounded-full flex items-center justify-center">
                  <span className="font-sans font-bold text-brand-primary text-xl">SW</span>
                </div>
                <div>
                  <div className="font-sans font-semibold text-brand-primary text-lg">Sarah Wheeler, M.Ed., M.S.</div>
                  <div className="text-sm text-brand-gray-600 font-body">Creator, ECCI Framework | Building Bridges Global</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RID Announcement - High visibility */}
      <section className="bg-brand-primary text-white py-16 border-y-4 border-brand-energy">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-energy rounded-full px-6 py-3 mb-6">
            <span className="text-2xl">🎉</span>
            <span className="font-sans text-sm uppercase tracking-wider font-bold text-white">
              NEW RID PROFESSIONAL CATEGORY
            </span>
          </div>

          <h2 className="text-4xl font-bold mb-4 font-sans">
            Studies of Healthy Minds & Bodies
          </h2>

          <p className="text-xl mb-8 max-w-3xl mx-auto font-body text-white/90">
            Active December 1, 2025. InterpretReflect delivers measurable performance optimization within this category.
          </p>

          <Link
            href="/ceu-bundles"
            className="inline-block bg-brand-energy text-white px-8 py-4 rounded-lg font-bold hover:bg-brand-energy-hover transition-all shadow-lg font-sans"
          >
            Explore CEU Programs
          </Link>
        </div>
      </section>

      {/* ECCI Framework Explanation */}
      <section id="research" className="container mx-auto px-4 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-brand-gray-50 rounded-xl shadow-lg p-10 border border-brand-gray-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-brand-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-8 h-8 text-brand-primary" />
              </div>
              <div>
                <div className="text-sm font-mono uppercase tracking-wider text-brand-electric mb-2">
                  Research Foundation
                </div>
                <h3 className="text-3xl font-bold text-brand-primary mb-2 font-sans">
                  The ECCI™ Framework
                </h3>
                <p className="text-brand-gray-600 font-body">
                  <strong>Emotional & Cultural Competencies for Interpreters</strong>
                </p>
              </div>
            </div>

            <p className="text-lg text-brand-charcoal mb-6 leading-relaxed font-body">
              16 integrated neuroscience frameworks that analyze how your brain processes multimodal information, manages cultural context, regulates emotional labor, and maintains cognitive capacity during interpretation.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-brand-success flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-brand-charcoal mb-1 font-sans">Cognitive Load Analysis</h4>
                  <p className="text-sm text-brand-gray-600 font-body">Track processing capacity in real-time</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-brand-success flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-brand-charcoal mb-1 font-sans">Cultural Competency Tracking</h4>
                  <p className="text-sm text-brand-gray-600 font-body">Monitor cross-cultural processing patterns</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-brand-success flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-brand-charcoal mb-1 font-sans">Emotional Regulation Insights</h4>
                  <p className="text-sm text-brand-gray-600 font-body">Understand emotional labor patterns</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-brand-success flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-brand-charcoal mb-1 font-sans">Performance Neuroplasticity</h4>
                  <p className="text-sm text-brand-gray-600 font-body">Optimize brain adaptation for growth</p>
                </div>
              </div>
            </div>

            <div className="bg-brand-electric-light border border-brand-electric/30 rounded-lg p-6">
              <p className="text-brand-primary font-semibold mb-2 font-sans">
                Built on research from:
              </p>
              <p className="text-sm text-brand-gray-700 font-body">
                Cognitive science, interoception studies, performance psychology, cultural neuroscience, and interpreter-specific workload research.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20 bg-brand-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-brand-primary mb-12 font-sans">
            Performance Optimization Protocol
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step
              number="1"
              title="Establish Performance Baseline"
              description="Complete 15-minute ECCI assessment. Generate your personalized interpreter performance profile with quantified metrics."
            />
            <Step
              number="2"
              title="Track Performance Metrics"
              description="Daily performance logging: baseline checks, post-assignment analysis, capacity monitoring, all included in platform access."
            />
            <Step
              number="3"
              title="Earn Professional Credits"
              description="Purchase CEU bundles to certify your data-driven professional development and optimization practices."
            />
          </div>
        </div>
      </section>

      {/* Performance Metrics Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-brand-primary mb-4 font-sans">
                The Data-Driven Case for Capacity Building
              </h2>
              <p className="text-lg text-brand-gray-600 max-w-3xl mx-auto font-body">
                Recent national studies (2025) reveal measurable performance challenges across the interpreting profession. These aren't personal failings—they're systemic patterns requiring evidence-based solutions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-brand-gray-50 p-8 rounded-xl border-l-4 border-brand-error">
                <div className="flex items-start gap-4">
                  <div className="text-5xl font-bold text-brand-error font-mono">24%</div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-charcoal mb-2 font-sans">Clinical Burnout Threshold</h3>
                    <p className="text-brand-gray-600 font-body">Meet diagnostic criteria for occupational burnout. High-performing professionals in cognitively demanding fields face documented neurological impacts from sustained cognitive load.</p>
                  </div>
                </div>
              </div>

              <div className="bg-brand-gray-50 p-8 rounded-xl border-l-4 border-brand-warning">
                <div className="flex items-start gap-4">
                  <div className="text-5xl font-bold text-brand-warning font-mono">41.5%</div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-charcoal mb-2 font-sans">Vicarious Trauma Exposure</h3>
                    <p className="text-brand-gray-600 font-body">Have experienced vicarious trauma over their careers. When you facilitate communication during crisis, your nervous system processes that content as if it's happening to you.</p>
                  </div>
                </div>
              </div>

              <div className="bg-brand-gray-50 p-8 rounded-xl border-l-4 border-brand-electric">
                <div className="flex items-start gap-4">
                  <div className="text-5xl font-bold text-brand-electric font-mono">57.5%</div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-charcoal mb-2 font-sans">Imposter Phenomenon</h3>
                    <p className="text-brand-gray-600 font-body">Report imposter syndrome. Certified, competent professionals whose brains overweight mistakes and underweight successes—a documented pattern in high-stakes cognitive work.</p>
                  </div>
                </div>
              </div>

              <div className="bg-brand-gray-50 p-8 rounded-xl border-l-4 border-brand-info">
                <div className="flex items-start gap-4">
                  <div className="text-5xl font-bold text-brand-info font-mono">50%</div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-charcoal mb-2 font-sans">Boundary Management Challenges</h3>
                    <p className="text-brand-gray-600 font-body">Struggle with professional boundaries. Constant role-switching between neutral conduit and crisis responder creates documented stress on executive function.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center bg-brand-electric-light border-2 border-brand-electric rounded-xl p-6">
              <p className="text-lg text-brand-primary font-semibold font-body">
                These metrics reflect systemic challenges requiring specialized support—not personal inadequacy. Evidence-based capacity building works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-gradient-to-br from-brand-primary via-brand-primary to-brand-slate text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Zap className="w-16 h-16 text-brand-energy mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-sans text-white">
              Ready to Optimize Your Performance?
            </h2>
            <p className="text-xl text-white/90 mb-8 font-body">
              Join interpreters worldwide who are elevating their professional capacity with AI-powered insights.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-brand-energy text-white px-12 py-5 rounded-lg font-bold text-lg hover:bg-brand-energy-hover transition-all shadow-2xl font-sans"
            >
              Begin Performance Analysis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-primary text-white py-12 border-t-4 border-brand-electric">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
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
                  <Link href="/ceu-bundles" className="text-white/80 hover:text-white transition-colors">
                    CEU Bundles
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
              <p className="text-sm text-white/60 font-body mt-6">
                RID Approved Sponsor #2309<br />
                Building Bridges Global, LLC
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-card hover:shadow-card-hover transition-all border border-brand-gray-200 hover:border-brand-electric">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-brand-charcoal mb-3 font-sans">{title}</h3>
      <p className="text-brand-gray-600 font-body">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center bg-white rounded-xl p-8 shadow-card hover:shadow-card-hover transition-all">
      <div className="w-16 h-16 bg-gradient-to-br from-brand-energy to-brand-warning text-white rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg font-mono">
        {number}
      </div>
      <h3 className="text-xl font-bold text-brand-primary mb-3 font-sans">{title}</h3>
      <p className="text-brand-gray-600 font-body">{description}</p>
    </div>
  );
}
