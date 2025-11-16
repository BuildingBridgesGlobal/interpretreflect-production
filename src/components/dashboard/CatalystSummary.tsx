'use client'

import { useEffect, useState } from 'react'
import { Brain, Zap } from 'lucide-react'

export default function CatalystSummary() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/dashboard/catalyst-summary')
        if (res.ok) setData(await res.json())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold text-brand-primary font-sans">Catalyst Summary</h2>
        <div className="flex items-center gap-2 text-brand-electric font-body">
          <Zap className="w-4 h-4" />
          Catalyst
        </div>
      </div>
      {loading ? (
        <div className="text-brand-gray-600 font-body">Loading…</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-brand-gray-50 rounded-data">
            <div className="text-sm text-brand-gray-600">Avg Cognitive Load</div>
            <div className="text-2xl font-mono">{Number(data?.avg_cognitive_load || 0).toFixed(2)}</div>
          </div>
          <div className="p-4 bg-brand-gray-50 rounded-data">
            <div className="text-sm text-brand-gray-600">Avg Clarity</div>
            <div className="text-2xl font-mono">{Number(data?.avg_clarity || 0).toFixed(2)}</div>
          </div>
          <div className="p-4 bg-brand-gray-50 rounded-data">
            <div className="text-sm text-brand-gray-600">Recent Sessions</div>
            <div className="text-2xl font-mono">{(data?.sessions || []).length}</div>
          </div>
        </div>
      )}
      {!loading && (data?.sessions || []).length > 0 && (
        <div className="mt-4 space-y-2">
          {(data.sessions || []).map((s: any) => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-brand-primary" />
                <span>Load {Number(s.cognitive_load || 0).toFixed(2)}</span>
              </div>
              <span className="text-brand-gray-600">{new Date(s.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
