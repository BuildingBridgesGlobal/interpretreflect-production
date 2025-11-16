'use client'

export default function WhySection() {
  const items = [
    { title: 'Daily-Use Optimization', desc: 'Simple workflows that fit into real interpreter schedules—no added noise.' },
    { title: 'Interpreter-Specific Neuroscience', desc: 'Built on ECCI and emotional intelligence science to target the right cognitive skills.' },
    { title: 'Actionable AI Insights', desc: 'Catalyst monitors your reflection patterns and suggests weekly strategies for improvement.' },
    { title: 'Foundations for Longitudinal Tracking', desc: 'Every check-in builds the dataset you’ll use to protect capacity long-term.' }
  ]
  return (
    <section className="container mx-auto px-4 py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-brand-primary font-sans text-center mb-8">Why InterpretReflect?</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {items.map((i) => (
            <div key={i.title} className="bg-white dark:bg-slate-800/60 rounded-xl p-8 shadow-card border border-brand-gray-200 dark:border-white/10">
              <div className="text-xl font-bold text-brand-primary mb-2 font-sans">{i.title}</div>
              <p className="text-brand-gray-600 font-body">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
