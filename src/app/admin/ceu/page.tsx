'use client'

import { useAuth } from '@/contexts/AuthContext.next'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const PS_CATEGORIES = [
  'Language and Cultural Development',
  'Settings-Based Studies',
  'Cognitive Processes of Interpreting',
  'Professional Interpersonal Interactions',
  'Ethical Considerations',
  'Supporting Knowledge and Skills',
  'Studies of Healthy Minds and Bodies',
  'Power, Privilege, and Oppression',
]

const ACTIVITY_TYPES = ['Sponsor Initiated', 'PINRA', 'Academic Coursework', 'Independent Study']

export default function AdminCEUPage() {
  const { user, userRole } = useAuth()
  const supabase = createClient()
  const [counts, setCounts] = useState<{ programs: number; enrollments: number; completions: number } | null>(null)
  const [userId, setUserId] = useState('')
  const [programId, setProgramId] = useState('')
  const [hours, setHours] = useState('')
  const [category, setCategory] = useState(PS_CATEGORIES[0])
  const [activityType, setActivityType] = useState(ACTIVITY_TYPES[0])
  const [notes, setNotes] = useState('')
  const [ceus, setCeus] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/admin/ceu/overview')
      if (res.ok) {
        const data = await res.json()
        setCounts(data.counts)
      }
    }
    load()
  }, [])

  if (!user || userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray-50">
        <div className="text-center">
          <p className="text-brand-gray-600">Forbidden</p>
          <Link href="/" className="text-brand-electric">Go Home</Link>
        </div>
      </div>
    )
  }

  const handleRecord = async () => {
    if (!userId || !programId || !hours) return
    const res = await fetch('/api/admin/ceu/record-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, programId, hours, category, activityType, notes })
    })
    if (res.ok) {
      const data = await res.json()
      setCeus(data.ceus)
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-primary">RID Sponsor Admin</h1>
          <div className="flex gap-3">
            <Link href="/dashboard" className="text-brand-electric">Dashboard</Link>
            <Link href="/my-ceus" className="text-brand-electric">My CEUs</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-data border border-brand-gray-200 p-6">
            <h2 className="text-xl font-bold text-brand-primary mb-4">Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-brand-gray-50 rounded-data">
                <div className="text-sm text-brand-gray-600">Programs</div>
                <div className="text-2xl font-mono">{counts?.programs ?? 0}</div>
              </div>
              <div className="p-4 bg-brand-gray-50 rounded-data">
                <div className="text-sm text-brand-gray-600">Enrollments</div>
                <div className="text-2xl font-mono">{counts?.enrollments ?? 0}</div>
              </div>
              <div className="p-4 bg-brand-gray-50 rounded-data">
                <div className="text-sm text-brand-gray-600">Completions</div>
                <div className="text-2xl font-mono">{counts?.completions ?? 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-data border border-brand-gray-200 p-6">
            <h2 className="text-xl font-bold text-brand-primary mb-4">Record CEU Activity</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID" className="border border-brand-gray-300 rounded-data px-3 py-2" />
              <input value={programId} onChange={e => setProgramId(e.target.value)} placeholder="Program ID" className="border border-brand-gray-300 rounded-data px-3 py-2" />
              <input value={hours} onChange={e => setHours(e.target.value)} placeholder="Hours" className="border border-brand-gray-300 rounded-data px-3 py-2" />
              <select value={category} onChange={e => setCategory(e.target.value)} className="border border-brand-gray-300 rounded-data px-3 py-2">
                {PS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={activityType} onChange={e => setActivityType(e.target.value)} className="border border-brand-gray-300 rounded-data px-3 py-2">
                {ACTIVITY_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes" className="border border-brand-gray-300 rounded-data px-3 py-2" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={handleRecord} className="px-4 py-2 bg-brand-electric text-white rounded-data">Record</button>
              {ceus !== null && <span className="text-sm text-brand-gray-600">CEUs: {ceus.toFixed(1)}</span>}
            </div>
            <div className="mt-3 text-xs text-brand-gray-500">
              1.0 CEU equals 10 hours; CEUs rounded to nearest 0.1
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-data border border-brand-gray-200 p-6">
            <h3 className="font-bold text-brand-primary mb-3">Professional Studies Categories</h3>
            <ul className="space-y-1 text-sm text-brand-gray-700">
              {PS_CATEGORIES.map(c => <li key={c}>{c}</li>)}
            </ul>
            <div className="mt-3 text-xs text-brand-gray-500">Effective 12/1/2025.</div>
          </div>
          <div className="bg-white rounded-data border border-brand-gray-200 p-6">
            <h3 className="font-bold text-brand-primary mb-3">Sponsor Resources</h3>
            <div className="space-y-2 text-sm">
              <a href="https://docs.google.com/document/d/1qR1ia9bGryDLJKCgWzta31vQsnwJvXvEzXC08DBIREU/edit?tab=t.0" target="_blank" rel="noreferrer" className="text-brand-electric">Standards and Criteria</a>
              <a href="https://drive.google.com/open?id=0B_NUO3AhS85kWVRFTG4zX1dKSUU" target="_blank" rel="noreferrer" className="text-brand-electric">CMP Sponsor Folder</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
