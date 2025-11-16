'use client'

export default function StatsSection() {
  const stats = [
    { n: '24%', label: 'meet clinical burnout criteria' },
    { n: '41.5%', label: 'have experienced vicarious trauma' },
    { n: '57.5%', label: 'report imposter syndrome' },
    { n: '50%', label: 'struggle with boundary management' }
  ]
  return (
    <section className="bg-brand-gray-50 dark:bg-slate-900 py-20 border-y border-brand-gray-200 dark:border-white/10">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-primary font-sans text-center mb-8">Interpreting Has a Capacity Problem. Here’s the Data.</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {stats.map((s) => (
              <div key={s.n} className="bg-brand-gray-50 dark:bg-slate-800/60 p-8 rounded-xl border-l-4 border-brand-electric dark:border-white/20">
                <div className="flex items-start gap-4">
                  <div className="text-5xl font-bold text-brand-electric font-mono">{s.n}</div>
                  <div className="text-brand-gray-600 font-body">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-brand-gray-600 font-body max-w-3xl mx-auto">
            These aren’t personal inadequacy—they’re cognitive and emotional overload in a profession that demands constant excellence. InterpretReflect™ helps you stabilize the load, understand your patterns, and build sustainable performance capacity.
          </p>
        </div>
      </div>
    </section>
  )
}
