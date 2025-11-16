'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext.next';

interface PricingCardProps {
  title: string;
  price: string;
  subtitle?: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  popular?: boolean;
  disabled?: boolean;
}

function PricingCard({
  title,
  price,
  subtitle = 'per month',
  features,
  ctaText,
  ctaHref,
  popular = false,
  disabled = false,
}: PricingCardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-data shadow-card border-2 p-8 flex flex-col ${
        popular ? 'border-brand-energy dark:border-orange-500 scale-105' : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      {popular && (
        <div className="inline-flex items-center gap-2 bg-brand-energy-light dark:bg-orange-400/20 border border-brand-energy/20 dark:border-orange-500/30 rounded-full px-3 py-1 mb-4 self-start">
          <span className="w-2 h-2 bg-brand-energy dark:bg-orange-400 rounded-full animate-pulse"></span>
          <span className="text-xs font-mono uppercase tracking-wider text-brand-energy-dark dark:text-orange-300 font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 font-sans">{title}</h3>
        <div className="text-5xl font-bold text-blue-600 dark:text-blue-300 font-mono">{price}</div>
        <div className="text-slate-600 dark:text-slate-400 font-body">{subtitle}</div>
      </div>
      <ul className="space-y-3 mb-8 text-sm text-slate-700 dark:text-slate-300 font-body flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="text-brand-energy dark:text-orange-400 mt-0.5">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`block w-full py-3 text-center rounded-data font-semibold transition-all font-body ${
          disabled
            ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed'
            : popular
            ? 'bg-gradient-to-r from-brand-energy to-brand-energy-hover dark:from-orange-500 dark:to-orange-600 text-white hover:shadow-lg hover:shadow-brand-energy/20 dark:hover:shadow-orange-500/20'
            : 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800'
        }`}
      >
        {ctaText}
      </Link>
    </div>
  );
}

export default function PricingPage() {
  const { user } = useAuth();

  const interpreterFeatures = [
    'Daily Readiness Checks',
    'Quick Reflect (2-min post-assignment check-in)',
    'Streak & weekly goals',
    'Baseline monitoring',
    'Starter pattern recognition',
    'Access to Reflection Studio',
    'Secure data storage',
    'WCAG-AA accessibility',
    'Mobile & desktop',
  ];

  const agencyFeatures = [
    'Everything in Essential',
    'Team performance dashboards',
    'Burnout-risk indicators',
    'Usage & engagement analytics',
    'CSV exports',
    'Priority support',
    'Custom onboarding',
    'Enterprise-grade security',
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-900 dark:to-slate-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4 font-sans">Simple, Transparent Pricing</h1>
            <p className="text-xl text-white/90 font-body">
              No hidden fees. Choose the plan that fits your role.
            </p>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="container mx-auto px-4 -mt-12 pb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <PricingCard
            title="Interpreter Essential"
            price="$12.99"
            features={interpreterFeatures}
            ctaText={user ? 'Current Plan' : 'Start Free Trial'}
            ctaHref={user ? '/dashboard' : '/auth/signup?type=interpreter'}
            popular={true}
          />
          <PricingCard
            title="Agency Teams"
            price="Custom"
            subtitle="Contact Sales"
            features={agencyFeatures}
            ctaText="Contact Sales"
            ctaHref="/auth/agency-contact"
          />
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16 text-center">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-4 font-sans">Questions?</h2>
          <p className="text-slate-600 dark:text-slate-400 font-body">
            Contact us anytime at{' '}
            <a href="mailto:info@interpretreflect.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              info@interpretreflect.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
