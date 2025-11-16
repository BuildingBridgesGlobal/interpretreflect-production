import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: baseline, error: baselineError } = await supabase
      .from('baseline_checks')
      .select('cognitive_load, capacity_reserve, performance_readiness, recovery_quality, created_at')
      .eq('user_id', user.id)

    const { data: reflects, error: reflectError } = await supabase
      .from('quick_reflect_entries')
      .select('performance_rating, cognitive_load_rating, assignment_date, created_at')
      .eq('user_id', user.id)

    if (baselineError || reflectError) {
      return NextResponse.json({ error: 'Failed to load data' }, { status: 500 })
    }

    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

    const baselineMetrics = {
      count: baseline?.length || 0,
      avg_cognitive_load: avg((baseline || []).map(b => b.cognitive_load || 0)),
      avg_capacity_reserve: avg((baseline || []).map(b => b.capacity_reserve || 0)),
      avg_performance_readiness: avg((baseline || []).map(b => b.performance_readiness || 0)),
      avg_recovery_quality: avg((baseline || []).map(b => b.recovery_quality || 0)),
      last_check_at: baseline && baseline.length ? baseline[0].created_at : null
    }

    const reflectionMetrics = {
      count: reflects?.length || 0,
      avg_performance_rating: avg((reflects || []).map(r => r.performance_rating || 0)),
      avg_cognitive_load_rating: avg((reflects || []).map(r => r.cognitive_load_rating || 0)),
      last_reflection_at: reflects && reflects.length ? reflects[0].created_at : null
    }

    return NextResponse.json({ ok: true, baseline: baselineMetrics, reflections: reflectionMetrics })
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
