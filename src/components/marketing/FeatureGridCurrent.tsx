'use client'

export default function FeatureGridCurrent() {
  const items = [
    { title: 'InterpretReflect™', desc: 'Daily reflections and emotional intelligence tracking built specifically for interpreters.' },
    { title: 'Quick Reflect', desc: 'A 2-minute post-assignment check-in that builds your performance dataset effortlessly.' },
    { title: 'Catalyst™ (Beta)', desc: 'Your AI performance partner—analyzes your patterns and provides weekly micro-coaching to protect cognitive capacity.' }
  ]
  return (
    <section className="container mx-auto px-4 py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-brand-primary font-sans text-center mb-2">What You Get Today</h2>
        <p className="text-center text-brand-gray-600 font-body mb-8">Built for daily-use performance optimization.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((i) => (
            <div key={i.title} className="bg-white/90 dark:bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl shadow-card hover:shadow-card-hover transition-all border border-brand-gray-200 dark:border-white/10 hover:border-brand-electric">
              <div className="text-xl font-bold text-brand-primary mb-2 font-sans">{i.title}</div>
              <p className="text-brand-gray-600 font-body text-sm">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
