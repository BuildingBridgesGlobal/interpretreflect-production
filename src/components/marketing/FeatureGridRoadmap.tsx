'use client'

export default function FeatureGridRoadmap() {
  const items = [
    { title: 'Performance Hub', desc: 'Longitudinal analytics with burnout-trend insights across months of data.' },
    { title: 'Skill Builders', desc: 'Micro-drills for regulation, accuracy, cognitive clarity, and interpreter competencies.' },
    { title: 'Team Hub (Coming Soon)', desc: 'Prepare with coworkers, align logistics, share terminology, and build trust before assignments.' }
  ]
  return (
    <section className="container mx-auto px-4 py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-2">
          <h2 className="text-3xl font-bold text-brand-primary font-sans">Future Releases</h2>
        </div>
        <p className="text-center text-brand-gray-600 font-body mb-8">Innovations rolling out progressively.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((i) => (
            <div key={i.title} className="bg-white/90 dark:bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-brand-gray-200 dark:border-white/10 hover:border-brand-electric transition-all">
              <div className="text-xl font-bold text-brand-primary mb-2 font-sans">{i.title}</div>
              <p className="text-brand-gray-600 font-body text-sm">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
