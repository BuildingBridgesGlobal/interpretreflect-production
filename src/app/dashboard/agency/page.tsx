'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, AlertTriangle, Download } from 'lucide-react'

type Member = { user_id: string; role: string }

export default function AgencyDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<Member[]>([])
  const [metrics, setMetrics] = useState<any[]>([])
  const [alert, setAlert] = useState<string | null>(null)
  const [orgRisk, setOrgRisk] = useState<'low'|'moderate'|'high'>('low')
  const [moodCounts, setMoodCounts] = useState<Record<string, number>>({ low: 0, medium: 0, high: 0, overwhelming: 0 })
  const [moodSeries, setMoodSeries] = useState<number[]>([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const supabase = createClient()
      let resolved = false
      const timeout = setTimeout(() => {
        if (!resolved) setAlert('Authentication timed out')
      }, 8000)
      const { data: { user } } = await supabase.auth.getUser()
      resolved = true
      clearTimeout(timeout)
      if (!user) return

      // Find orgs where user is admin/owner
      const { data: orgs } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .in('role', ['admin', 'owner'])
        .eq('is_active', true)

      if (!orgs || orgs.length === 0) {
        setAlert('No organization admin membership found.')
        setLoading(false)
        return
      }

      const orgId = orgs[0].organization_id

      // Load all members in org
      const { data: mems } = await supabase
        .from('organization_members')
        .select('user_id, role')
        .eq('organization_id', orgId)
        .eq('is_active', true)
      setMembers(mems || [])

      const userIds = (mems || []).map(m => m.user_id)
      if (userIds.length === 0) {
        setLoading(false)
        return
      }

      // Compute usage metrics from quick_reflect_entries for last 14 days
      const now = new Date()
      const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const d14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()

      const { data: recent } = await supabase
        .from('quick_reflect_entries')
        .select('user_id, created_at, cognitive_load_rating, ai_insights')
        .in('user_id', userIds)
        .gte('created_at', d14)

      const byUser: Record<string, { week1: number; week2: number }> = {}
      let totalLoad = 0
      let loadCount = 0
      const sorted = (recent || []).slice().sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
      const series: number[] = []
      const mCounts: Record<string, number> = { low: 0, medium: 0, high: 0, overwhelming: 0 }
      (recent || []).forEach(r => {
        const isWeek2 = r.created_at >= d7
        const row = byUser[r.user_id] || { week1: 0, week2: 0 }
        if (isWeek2) row.week2 += 1
        else row.week1 += 1
        byUser[r.user_id] = row
        if (typeof r.cognitive_load_rating === 'number') { totalLoad += r.cognitive_load_rating; loadCount += 1 }
        const mood = (r as any).ai_insights?.mood?.intensity
        const mv: any = { low: 1, medium: 2, high: 3, overwhelming: 4 }
        if (mood && mv[mood] != null) { mCounts[mood] = (mCounts[mood] || 0) + 1 }
      })
      sorted.forEach(r => {
        const mood = (r as any).ai_insights?.mood?.intensity
        const mv: any = { low: 1, medium: 2, high: 3, overwhelming: 4 }
        series.push(mood && mv[mood] != null ? mv[mood] : 0)
      })

      const rows = userIds.map(uid => {
        const row = byUser[uid] || { week1: 0, week2: 0 }
        const drop = row.week1 > 0 ? Math.max(0, Math.round(((row.week1 - row.week2) / row.week1) * 100)) : 0
        return { user_id: uid, week1: row.week1, week2: row.week2, drop_pct: drop }
      })
      setMetrics(rows)

      const orgDrop = rows.reduce((acc, r) => acc + (r.drop_pct || 0), 0) / (rows.length || 1)
      if (orgDrop >= 30) setAlert('Engagement drop ≥30% week-over-week')

      const avgLoad = loadCount > 0 ? totalLoad / loadCount : 0
      const highMoodCount = (recent || []).filter(r => {
        const mood = (r as any).ai_insights?.mood
        return mood && (mood.intensity === 'high' || mood.intensity === 'overwhelming')
      }).length
      const moodRate = (recent || []).length > 0 ? highMoodCount / (recent || []).length : 0

      let risk: 'low'|'moderate'|'high' = 'low'
      if (orgDrop >= 30 || avgLoad >= 3.8 || moodRate >= 0.4) risk = 'high'
      else if (orgDrop >= 15 || avgLoad >= 3.2 || moodRate >= 0.25) risk = 'moderate'
      setOrgRisk(risk)

      setMoodCounts(mCounts)
      setMoodSeries(series.slice(-10))
      setLoading(false)
    }
    load()
  }, [])

  const exportCsv = () => {
    const header = 'user_id,week1_reflections,week2_reflections,drop_pct\n'
    const body = metrics.map(m => `${m.user_id},${m.week1},${m.week2},${m.drop_pct}`).join('\n')
    const csv = header + body
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'agency_metrics.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-electric-light rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-brand-electric" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-brand-primary">Agency Dashboard</h1>
            <p className="text-brand-gray-600">Usage and engagement across your organization</p>
          </div>
        </div>
        <button onClick={exportCsv} className="px-4 py-2 bg-brand-electric text-white rounded-lg font-semibold flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="text-brand-gray-600">Loading metrics…</div>
      ) : (
        <>
          {alert && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> {alert}
            </div>
          )}
          <div className={`rounded-xl border-2 p-6 ${orgRisk === 'high' ? 'border-red-300 bg-red-50' : orgRisk === 'moderate' ? 'border-orange-300 bg-orange-50' : 'border-green-300 bg-green-50'}`}>
            <div className="text-sm font-bold text-brand-gray-600 uppercase tracking-wide font-body">Org Burnout Indicator</div>
            <div className="text-2xl font-bold mt-2">{orgRisk.toUpperCase()}</div>
            <div className="text-sm text-brand-gray-600 mt-1">Aggregate signal across team</div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6">
              <div className="text-sm font-bold text-brand-gray-600 uppercase tracking-wide font-body">Mood Climate (Last 10)</div>
              <div className="mt-3">
                <svg width="240" height="40">
                  {(() => {
                    const max = Math.max(4, ...moodSeries)
                    const stepX = moodSeries.length > 1 ? 240 / (moodSeries.length - 1) : 0
                    const points = moodSeries.map((v, i) => `${i*stepX},${40 - (v/max)*40}`).join(' ')
                    return <polyline points={points} fill="none" stroke="#6C63FF" strokeWidth="2" />
                  })()}
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6">
              <div className="text-sm font-bold text-brand-gray-600 uppercase tracking-wide font-body">Mood Distribution</div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {(['low','medium','high','overwhelming'] as const).map(k => (
                  <div key={k} className="p-3 rounded-lg bg-brand-gray-100">
                    <div className="text-xs font-semibold text-brand-primary">{k}</div>
                    <div className="text-lg font-bold text-brand-primary">{moodCounts[k] || 0}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white border-2 border-brand-gray-200 rounded-xl p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand-gray-600">
                  <th className="py-2">User</th>
                  <th className="py-2">Week 1 Reflections</th>
                  <th className="py-2">Week 2 Reflections</th>
                  <th className="py-2">Drop %</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(m => (
                  <tr key={m.user_id} className="border-t border-brand-gray-100">
                    <td className="py-2 font-mono text-brand-gray-800">{m.user_id.slice(0, 8)}…</td>
                    <td className="py-2">{m.week1}</td>
                    <td className="py-2">{m.week2}</td>
                    <td className={`py-2 ${m.drop_pct >= 30 ? 'text-red-600' : 'text-brand-gray-800'}`}>{m.drop_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
