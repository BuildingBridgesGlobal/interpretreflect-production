'use client'

import Link from 'next/link'

export default function AgencySection() {
  const bullets = [
    'Burnout trend indicators',
    'Capacity insights',
    'Longitudinal performance data',
    'Team prep and collaboration tools',
    'CEU pathways to support professional growth'
  ]
  return (
    <section className="container mx-auto px-4 py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-brand-primary font-sans text-center mb-2">Stronger Interpreters. Stronger Outcomes.</h2>
        <p className="text-center text-brand-gray-600 font-body mb-6">InterpretReflect™ helps agencies and institutions reduce burnout, improve consistency, and identify risk early.</p>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {bullets.map((b) => (
            <div key={b} className="bg-brand-gray-50 rounded-xl p-4 border border-brand-gray-200 text-sm text-brand-gray-700 font-body">{b}</div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/contact" className="inline-block bg-brand-electric text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-brand-electric/90 transition-all font-sans">Request Agency Overview</Link>
        </div>
      </div>
    </section>
  )
}
