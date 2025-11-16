'use client'

export default function CatalystSection() {
  const items = [
    { title: 'Capture', desc: 'Each reflection builds your personal performance dataset.' },
    { title: 'Analyze', desc: 'Catalyst detects patterns across cognition, emotion, and assignment types.' },
    { title: 'Optimize', desc: 'Receive weekly micro-experiments to improve capacity and performance.' }
  ]
  return (
    <section className="container mx-auto px-4 py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-brand-primary font-sans text-center mb-2">Catalyst: Your Interpreter Optimization Engine</h2>
        <p className="text-center text-brand-gray-600 font-body mb-8">Analyze your patterns. Surface insights. Strengthen your performance loop.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((i) => (
            <div key={i.title} className="bg-white/90 dark:bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-brand-gray-200 dark:border-white/10">
              <div className="text-xl font-bold text-brand-primary mb-2 font-sans">{i.title}</div>
              <p className="text-brand-gray-600 font-body text-sm">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
