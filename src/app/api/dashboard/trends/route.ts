import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function computeDelta(current: number, previous: number) {
  const delta = current - previous
  const pct = previous > 0 ? (delta / previous) * 100 : current > 0 ? 100 : 0
  return { current, previous, delta, delta_pct: Math.round(pct * 10) / 10 }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const currentStart = isoDaysAgo(7)
    const prevStart = isoDaysAgo(14)

    const baselineCurrent = await supabase
      .from('baseline_checks')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
      .gte('created_at', currentStart)
    const baselinePrev = await supabase
      .from('baseline_checks')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
      .gte('created_at', prevStart)
      .lt('created_at', currentStart)

    const reflectCurrent = await supabase
      .from('quick_reflect_entries')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
      .gte('created_at', currentStart)
    const reflectPrev = await supabase
      .from('quick_reflect_entries')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
      .gte('created_at', prevStart)
      .lt('created_at', currentStart)

    const enrollCurrent = await supabase
      .from('ceu_enrollments')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
      .gte('enrolled_at', currentStart)
    const enrollPrev = await supabase
      .from('ceu_enrollments')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
      .gte('enrolled_at', prevStart)
      .lt('enrolled_at', currentStart)

    const completeCurrent = await supabase
      .from('ceu_completions')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
      .gte('completed_at', currentStart)
    const completePrev = await supabase
      .from('ceu_completions')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
      .gte('completed_at', prevStart)
      .lt('completed_at', currentStart)

    return NextResponse.json({
      ok: true,
      baseline: computeDelta(baselineCurrent.count || 0, baselinePrev.count || 0),
      reflections: computeDelta(reflectCurrent.count || 0, reflectPrev.count || 0),
      enrollments: computeDelta(enrollCurrent.count || 0, enrollPrev.count || 0),
      completions: computeDelta(completeCurrent.count || 0, completePrev.count || 0)
    })
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
