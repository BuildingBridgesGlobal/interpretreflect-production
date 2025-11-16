'use client'

export default function TrustSafety() {
  const blocks = [
    { title: 'Data Security', body: 'All data encrypted in transit and at rest. No selling, no sharing, no training models without consent.' },
    { title: 'Compliance', body: 'Aligned with HIPAA-aware infrastructure and strong enough for medical, legal, and educational interpreting.' },
    { title: 'Accuracy', body: 'Validated reflection models built from interpreter research and industry-backed heuristics.' },
    { title: 'Latency', body: 'Fast, responsive AI designed for real-world assignment workflows.' },
    { title: 'Explainability', body: 'Catalyst clearly shows what patterns it detected—not black box guesses.' },
    { title: 'Connectivity', body: 'Optimized for low-bandwidth environments so remote interpreters aren’t left behind.' },
    { title: 'WCAG-AA Accessibility', body: 'Built for neurodivergent, Deaf, DeafBlind, and low-vision interpreters. Readable. Navigable. No friction.' }
  ]
  return (
    <section className="bg-brand-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-primary font-sans text-center mb-8">Built for Safety, Accuracy, and Trust</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blocks.map((b) => (
              <div key={b.title} className="bg-white rounded-xl p-6 border border-brand-gray-200">
                <div className="text-lg font-bold text-brand-primary font-sans mb-2">{b.title}</div>
                <p className="text-sm text-brand-gray-600 font-body">{b.body}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-brand-gray-600 font-body mt-6">Your data. Your insights. Your practice.</p>
        </div>
      </div>
    </section>
  )
}
