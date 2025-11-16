'use client'

import Link from 'next/link'

export default function FinalCTA() {
  return (
    <section className="bg-gradient-to-br from-brand-primary via-brand-primary to-brand-slate dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-sans text-white">Interpreting Tests Your Limits. Let’s Help You Master Them.</h2>
          <p className="text-base text-white/80 mb-6 font-body">Turn each assignment into growth, clarity, and long-term resilience.</p>
          <Link href="/pricing" className="inline-block bg-brand-energy text-white px-7 py-3 rounded-lg font-bold text-sm hover:bg-brand-energy-hover transition-all shadow-lg font-sans">View Pricing & Sign Up</Link>
        </div>
      </div>
    </section>
  )
}
