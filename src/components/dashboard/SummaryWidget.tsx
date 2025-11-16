'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, TrendingUp, Award, CheckCircle, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

type Summary = {
  ok: boolean
  counts: {
    baseline: number
    reflections: number
    enrollments: number
    completions: number
  }
}

export function SummaryWidget() {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [trends, setTrends] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/dashboard/summary')
        if (res.ok) setData(await res.json())
        const t = await fetch('/api/dashboard/trends')
        if (t.ok) setTrends(await t.json())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const Trend = ({ delta, pct }: { delta: number; pct: number }) => {
    const up = delta > 0
    const down = delta < 0
    const Icon = up ? ArrowUpRight : down ? ArrowDownRight : Minus
    const cls = up ? 'text-brand-success' : down ? 'text-brand-error' : 'text-brand-gray-600'
    return (
      <div className={`flex items-center gap-1 text-xs ${cls}`}>
        <Icon className="w-3 h-3" />
        <span>{delta > 0 ? '+' : ''}{delta} ({pct.toFixed(1)}%)</span>
      </div>
    )
  }

  const Card = ({ icon, label, value, href, color, delta }: { icon: React.ReactNode; label: string; value: number | string; href: string; color: string; delta?: { d: number; p: number } }) => (
    <Link href={href} className="block">
      <div className="bg-white rounded-data border border-brand-gray-200 p-4 hover:border-brand-electric transition-all">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
          <div className="text-sm text-brand-gray-600">{label}</div>
        </div>
        {loading ? (
          <div className="h-7 bg-brand-gray-100 rounded animate-pulse" />
        ) : (
          <div className="text-2xl font-mono">{value}</div>
        )}
        {!loading && delta && <div className="mt-1"><Trend delta={delta.d} pct={delta.p} /></div>}
      </div>
    </Link>
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card
        icon={<Activity className="w-5 h-5 text-brand-primary" />}
        label="Baseline Checks"
        value={data?.counts.baseline ?? 0}
        href="/dashboard/baseline"
        color="bg-brand-primary-light"
        delta={trends ? { d: trends.baseline.delta, p: trends.baseline.delta_pct } : undefined}
      />
      <Card
        icon={<TrendingUp className="w-5 h-5 text-brand-electric" />}
        label="Reflections"
        value={data?.counts.reflections ?? 0}
        href="/reflections"
        color="bg-brand-electric-light"
        delta={trends ? { d: trends.reflections.delta, p: trends.reflections.delta_pct } : undefined}
      />
      <Card
        icon={<Award className="w-5 h-5 text-brand-energy" />}
        label="CEU Enrollments"
        value={data?.counts.enrollments ?? 0}
        href="/my-ceus"
        color="bg-brand-energy-light"
        delta={trends ? { d: trends.enrollments.delta, p: trends.enrollments.delta_pct } : undefined}
      />
      <Card
        icon={<CheckCircle className="w-5 h-5 text-brand-success" />}
        label="Completions"
        value={data?.counts.completions ?? 0}
        href="/my-ceus"
        color="bg-brand-success-light"
        delta={trends ? { d: trends.completions.delta, p: trends.completions.delta_pct } : undefined}
      />
    </div>
  )
}
