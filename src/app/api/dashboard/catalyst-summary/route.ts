import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const last5 = await supabase
    .from('performance_insights')
    .select('id, cognitive_load, emotional_intensity, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const avgLoad = await supabase
    .from('performance_insights')
    .select('cognitive_load', { head: false })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const loads = (avgLoad.data || []).map((r: any) => Number(r.cognitive_load)).filter((n: number) => !Number.isNaN(n))
  const avg = loads.length ? loads.reduce((a: number, b: number) => a + b, 0) / loads.length : 0
  const clarity = (last5.data || []).map((r: any) => Number(r.emotional_intensity)).filter((n: number) => !Number.isNaN(n))
  const avgClarity = clarity.length ? clarity.reduce((a: number, b: number) => a + b, 0) / clarity.length : 0

  return NextResponse.json({ ok: true, sessions: last5.data || [], avg_cognitive_load: avg, avg_clarity: avgClarity })
}
