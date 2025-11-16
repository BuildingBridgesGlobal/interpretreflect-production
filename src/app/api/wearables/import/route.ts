import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    const userId = body.user_id
    if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    const samples = Array.isArray(body.samples) ? body.samples : []
    const rows = samples.map((s: any) => ({
      user_id: userId,
      timestamp: s.timestamp,
      heart_rate_bpm: s.heart_rate_bpm ?? null,
      hrv_ms: s.hrv_ms ?? null,
      resting_hr_bpm: body.resting_hr_bpm ?? null,
      source: body.source || 'apple_watch',
    }))
    if (rows.length === 0) return NextResponse.json({ ok: true, inserted: 0 })
    const { error } = await supabase.from('wearable_data').insert(rows)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, inserted: rows.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 })
  }
}

