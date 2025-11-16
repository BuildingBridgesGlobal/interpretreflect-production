'use client'

export default function PerformanceLoop() {
  const steps = ['Assignment', 'Readiness Check', 'Deliver', 'Quick Reflect', 'Catalyst Insight', 'Micro-Drill or Weekly Strategy']
  return (
    <section id="how-it-works" className="container mx-auto px-4 py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-brand-primary font-sans text-center mb-8">The Performance Loop That Changes Everything</h2>
        <div className="hidden md:flex items-center justify-center gap-3">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className="px-4 py-2 bg-brand-gray-50 dark:bg-slate-800/60 rounded-full border border-brand-gray-200 dark:border-white/10 text-sm font-body text-brand-charcoal dark:text-white">{s}</div>
              {i < steps.length - 1 && <div className="text-brand-gray-500">→</div>}
            </div>
          ))}
        </div>
        <div className="md:hidden space-y-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className="px-4 py-2 bg-brand-gray-50 dark:bg-slate-800/60 rounded-full border border-brand-gray-200 dark:border-white/10 text-sm font-body text-brand-charcoal dark:text-white w-full text-center">{s}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-brand-gray-600 font-body mt-6">Repeat this loop every assignment—performance compounds.</p>
      </div>
    </section>
  )
}
