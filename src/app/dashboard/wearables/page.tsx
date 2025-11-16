'use client'
import React, { useState } from 'react'

export default function WearablesPage() {
  const [userId, setUserId] = useState('')
  const [restingHr, setRestingHr] = useState('')
  const [hrv, setHrv] = useState('')
  const [samples, setSamples] = useState('')
  const [status, setStatus] = useState('')

  const submit = async () => {
    try {
      const body = {
        user_id: userId,
        resting_hr_bpm: restingHr ? parseFloat(restingHr) : undefined,
        samples: samples ? JSON.parse(samples) : []
      }
      const res = await fetch('/api/wearables/import', { method: 'POST', body: JSON.stringify(body) })
      const json = await res.json()
      setStatus(res.ok ? `Imported ${json.inserted} samples` : json.error)
    } catch (e: any) {
      setStatus(e?.message || 'Invalid JSON')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-brand-primary">Wearables</h1>
      <p className="text-brand-gray-600">Connect Apple Watch via the mobile app (coming soon). For now, import test data to validate readiness overlays.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <input placeholder="User ID" value={userId} onChange={(e)=>setUserId(e.target.value)} className="px-3 py-2 border-2 border-brand-gray-200 rounded-data" />
        <input placeholder="Resting HR (bpm)" value={restingHr} onChange={(e)=>setRestingHr(e.target.value)} className="px-3 py-2 border-2 border-brand-gray-200 rounded-data" />
        <input placeholder="HRV (ms optional)" value={hrv} onChange={(e)=>setHrv(e.target.value)} className="px-3 py-2 border-2 border-brand-gray-200 rounded-data" />
      </div>
      <textarea placeholder='Samples JSON [{"timestamp":"2025-11-13T09:00:00Z","heart_rate_bpm":85},{"timestamp":"2025-11-13T09:15:00Z","heart_rate_bpm":120}]' value={samples} onChange={(e)=>setSamples(e.target.value)} rows={6} className="w-full px-3 py-2 border-2 border-brand-gray-200 rounded-data" />
      <button onClick={submit} className="px-4 py-2 bg-brand-electric text-white rounded-data font-semibold">Import</button>
      {status && <div className="text-sm text-brand-primary">{status}</div>}
    </div>
  )
}

