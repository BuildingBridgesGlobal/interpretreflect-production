'use client'

export default function ResearchSection() {
  return (
    <section className="bg-brand-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-brand-primary mb-4 font-sans">Built on Research. Designed by Interpreters.</h2>
          <p className="text-center text-brand-gray-600 mb-6 font-body">
            InterpretReflect™ and Catalyst™ are grounded in the Emotional Competencies for Community Interpreters (ECCI) framework, emotional intelligence science, and real interpreting experience.
            Created by a Deaf-family CODA interpreter with 20+ years of domain expertise.
          </p>
          <div className="bg-white rounded-xl p-8 border-2 border-brand-electric shadow-lg">
            <p className="text-brand-gray-700 mb-4 italic font-body">“ECCI helps interpreters understand emotional regulation, cognitive load, and reflective practice through evidence-based methods.”</p>
          </div>
        </div>
      </div>
    </section>
  )
}
