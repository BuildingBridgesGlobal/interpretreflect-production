'use client'

export default function TrustStrip() {
  const pills = [
    'Women-Owned Small Business (WOSB)',
    'Disabled Veteran–Owned Small Business (DVOSB)',
    'Deaf-Led Advisory',
    'RID Approved Sponsor #2309',
    'NC-Based Startup'
  ]
  return (
    <section className="bg-brand-electric-light border-y-2 border-brand-electric py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center gap-3 justify-center">
          {pills.map((p) => (
            <span key={p} className="px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-brand-electric/20 text-sm text-brand-primary font-sans">
              {p}
            </span>
          ))}
        </div>
        <p className="text-center text-brand-primary mt-3 font-body">Trusted foundations for interpreters, agencies, and institutions.</p>
      </div>
    </section>
  )
}
