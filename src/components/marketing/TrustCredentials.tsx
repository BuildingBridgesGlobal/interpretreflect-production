'use client'

export default function TrustCredentials() {
  const items = [
    'Women Owned Small Business (WOSB)',
    'Disabled Veteran Owned Small Business (DVOSB)',
    'Deaf led advisory',
    'NC based startup',
    'RID Approved Sponsor #2309',
    '20+ years domain experience',
    'Pursuing SBIR/NSF/NIH innovation funding'
  ]
  return (
    <section className="container mx-auto px-4 py-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-brand-primary font-sans text-center mb-1">Trust & Credentials</h2>
        <p className="text-center text-brand-gray-600 font-body mb-4 text-sm">Professional, enterprise grade foundations.</p>
        <div className="flex flex-wrap justify-center gap-2">
          {items.map((i) => (
            <span
              key={i}
              className="px-3 py-2 rounded-full bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm border border-brand-gray-200 dark:border-white/10 text-sm text-brand-primary font-sans"
            >
              {i}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
