'use client'

import { Users, Globe, TrendingUp } from 'lucide-react'

export default function BuiltForAll() {
  return (
    <section className="bg-brand-gray-50 py-20 border-y border-brand-gray-200">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-primary font-sans text-center mb-8">Built for Every Interpreting Professional</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800/60 rounded-data p-8 border border-brand-gray-200 dark:border-white/10">
              <Users className="w-12 h-12 text-brand-electric mb-4" />
              <h3 className="text-xl font-bold text-brand-charcoal mb-3 font-sans">All Modalities</h3>
              <p className="text-brand-gray-600 font-body">Signed and spoken language interpreting</p>
            </div>
            <div className="bg-white dark:bg-slate-800/60 rounded-data p-8 border border-brand-gray-200 dark:border-white/10">
              <Globe className="w-12 h-12 text-brand-energy mb-4" />
              <h3 className="text-xl font-bold text-brand-charcoal mb-3 font-sans">All Settings</h3>
              <p className="text-brand-gray-600 font-body">Medical, legal, educational, conference, community</p>
            </div>
            <div className="bg-white dark:bg-slate-800/60 rounded-data p-8 border border-brand-gray-200 dark:border-white/10">
              <TrendingUp className="w-12 h-12 text-brand-warmth mb-4" />
              <h3 className="text-xl font-bold text-brand-charcoal mb-3 font-sans">All Experience Levels</h3>
              <p className="text-brand-gray-600 font-body">From new interpreters to seasoned professionals</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
