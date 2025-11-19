import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: settings } = await supabase
      .from('user_settings')
      .select('wearable_devices')
      .eq('user_id', user.id)
      .single()
    const gf = (settings?.wearable_devices || []).find((d: any) => d.device_type === 'google_fit' && d.connected)
    if (!gf?.access_token) return NextResponse.json({ error: 'Google Fit not connected' }, { status: 400 })
    const accessToken = gf.access_token as string
    const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
    const endMs = Date.now()
    const startMs = endMs - 3 * 24 * 60 * 60 * 1000
    const aggregateBody = {
      aggregateBy: [
        { dataTypeName: 'com.google.heart_rate.bpm' },
      ],
      bucketByTime: { durationMillis: 3600000 },
      startTimeMillis: startMs,
      endTimeMillis: endMs,
    }
    const aggRes = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', { method: 'POST', headers, body: JSON.stringify(aggregateBody) })
    const aggJson = await aggRes.json()
    const buckets = Array.isArray(aggJson?.bucket) ? aggJson.bucket : []
    const rows: any[] = []
    for (const b of buckets) {
      const start = Number(b.startTimeMillis)
      const hrSet = (b.dataset || []).find((d: any) => d.point && d.point.length)
      if (hrSet) {
        for (const p of hrSet.point) {
          const ts = Number(p.startTimeNanos ? Math.floor(Number(p.startTimeNanos) / 1e6) : start)
          const val = p.value && p.value[0] && (p.value[0].fpVal || p.value[0].intVal)
          if (val) rows.push({ user_id: user.id, timestamp: new Date(ts).toISOString(), heart_rate_bpm: Number(val), source: 'google_fit' })
        }
      }
    }
    if (rows.length) await supabase.from('wearable_data').insert(rows)
    await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, wearable_devices: updateLastSync(settings?.wearable_devices || [], 'google_fit') })
    return NextResponse.json({ ok: true, samplesIngested: rows.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 })
  }
}

function updateLastSync(devices: any[], deviceType: string) {
  return devices.map((d: any) => d.device_type === deviceType ? { ...d, last_sync: new Date().toISOString() } : d)
}