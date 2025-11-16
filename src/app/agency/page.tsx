import Link from 'next/link'

export default function AgencyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-brand-primary to-brand-slate text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4 font-sans">For Agencies and Institutions</h1>
            <p className="text-xl text-white/90 font-body">
              Interpreter performance should not be a guessing game. InterpretReflect gives agencies the tools to understand and support interpreter wellbeing, consistency, and development at scale.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold text-brand-primary font-sans mb-3">The Problem</h2>
            <div className="space-y-2 text-brand-gray-700 font-body">
              <div>High turnover</div>
              <div>Fatigue related inconsistency</div>
              <div>Burnout driven absenteeism</div>
              <div>Emotional load after critical assignments</div>
              <div>No real time insight into interpreter capacity</div>
              <div>Limited resources for proactive support</div>
            </div>
            <p className="text-brand-gray-700 font-body mt-4">
              These are not soft issues. They directly impact service quality, scheduling, compliance, and risk exposure.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-brand-primary font-sans mb-3">The Solution</h2>
            <p className="text-brand-gray-700 font-body">
              InterpretReflect provides the only interpreter specific performance tracking system built on neuroscience and daily data, not subjective impressions.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-brand-primary font-sans mb-3">What You Get</h2>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="bg-white rounded-xl p-6 border border-brand-gray-200">
              <h3 className="text-xl font-bold text-brand-primary font-sans mb-2">Performance Hub (Enterprise)</h3>
              <ul className="text-sm text-brand-gray-700 font-body space-y-2">
                <li>Capacity trends across teams</li>
                <li>Fatigue detection signals</li>
                <li>Emotional load indicators</li>
                <li>Cognitive demand patterns by context</li>
                <li>Assignment type stressors</li>
                <li>Burnout risk modeling</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 border border-brand-gray-200">
              <h3 className="text-xl font-bold text-brand-primary font-sans mb-2">Catalyst AI (Enterprise)</h3>
              <ul className="text-sm text-brand-gray-700 font-body space-y-2">
                <li>Weekly performance recommendations</li>
                <li>Strategies tailored to interpreter patterns</li>
                <li>Strengths and risk signatures</li>
                <li>Adaptive resource suggestions</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="bg-white rounded-xl p-6 border border-brand-gray-200">
              <h3 className="text-xl font-bold text-brand-primary font-sans mb-2">CEU and Professional Growth Integration</h3>
              <ul className="text-sm text-brand-gray-700 font-body space-y-2">
                <li>Reflection based CEUs</li>
                <li>Data driven competency development</li>
                <li>Team wide patterns for coaching</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 border border-brand-gray-200">
              <h3 className="text-xl font-bold text-brand-primary font-sans mb-2">Operational Benefits</h3>
              <ul className="text-sm text-brand-gray-700 font-body space-y-2">
                <li>Improved retention</li>
                <li>Better scheduling alignment</li>
                <li>Higher interpreter consistency</li>
                <li>Fewer performance related escalations</li>
                <li>Stronger relationships with institutional partners</li>
              </ul>
            </div>
          </div>

          <div className="bg-brand-electric-light border border-brand-electric rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-brand-primary font-sans mb-2">Early Access</h3>
            <p className="text-brand-primary font-body mb-4">Enterprise pilots begin soon. Get early access to the Performance Hub and Catalyst insights for agency teams.</p>
            <Link href="/contact" className="inline-block bg-brand-primary text-white px-6 py-3 rounded-data font-semibold hover:bg-brand-primary/90 transition-all font-sans">Request Agency Overview</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
