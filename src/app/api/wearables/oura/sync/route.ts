import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const OURA_API_BASE = 'https://api.ouraring.com'

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

    const oura = (settings?.wearable_devices || []).find((d: any) => d.device_type === 'oura' && d.connected)
    if (!oura?.access_token) return NextResponse.json({ error: 'Oura not connected' }, { status: 400 })

    const headers = { Authorization: `Bearer ${oura.access_token}` }

    const end = new Date()
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const startStr = start.toISOString().slice(0, 10)
    const endStr = end.toISOString().slice(0, 10)

    const readinessUrl = `${OURA_API_BASE}/v2/usercollection/readiness?start_date=${startStr}&end_date=${endStr}`
    const sleepUrl = `${OURA_API_BASE}/v2/usercollection/sleep?start_date=${startStr}&end_date=${endStr}`
    const hrUrl = `${OURA_API_BASE}/v2/usercollection/heartrate?start_datetime=${start.toISOString()}&end_datetime=${end.toISOString()}`

    const [readinessRes, sleepRes, hrRes] = await Promise.all([
      fetch(readinessUrl, { headers }),
      fetch(sleepUrl, { headers }),
      fetch(hrUrl, { headers }),
    ])

    const readinessJson = await readinessRes.json()
    const sleepJson = await sleepRes.json()
    const hrJson = await hrRes.json()

    // Ingest heartrate samples
    const samples = Array.isArray(hrJson?.data) ? hrJson.data : []
    if (samples.length > 0) {
      const rows = samples.map((s: any) => ({
        user_id: user.id,
        timestamp: s.timestamp,
        heart_rate_bpm: s.heart_rate,
        source: 'oura',
      }))
      await supabase.from('wearable_data').insert(rows)
    }

    // Compute HRV baseline from readiness (if available) or fallback to average HR
    const readiness = Array.isArray(readinessJson?.data) ? readinessJson.data : []
    const hrvValues = readiness.map((r: any) => r.hrv_balance || r.hrv || null).filter((v: any) => typeof v === 'number')
    const baseline = hrvValues.length ? avg(hrvValues) : null

    // Trigger events based on thresholds
    const eventsInserted: string[] = []
    if (baseline && hrvValues.length) {
      const latest = hrvValues[hrvValues.length - 1]
      const dropPercent = ((baseline - latest) / baseline) * 100
      if (dropPercent >= 20) {
        const { data: ev } = await supabase
          .from('wearable_events')
          .insert({
            user_id: user.id,
            device_type: 'oura',
            event_type: 'hrv_drop',
            event_time: new Date().toISOString(),
            threshold_crossed: dropPercent,
            baseline_value: baseline,
            current_value: latest,
            suggested_action: `Your HRV dropped ${dropPercent.toFixed(0)}% from baseline. Consider a short recovery break and a Quick Reflect.`,
            reflection_triggered: true,
            dismissed: false,
          })
          .select()
          .single()
        if (ev?.id) eventsInserted.push(ev.id)
      }
    }

    await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, wearable_devices: updateLastSync(settings?.wearable_devices || [], 'oura') })

    return NextResponse.json({ ok: true, eventsInserted, samplesIngested: samples.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 })
  }
}

function avg(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function updateLastSync(devices: any[], deviceType: string) {
  return devices.map((d) => d.device_type === deviceType ? { ...d, last_sync: new Date().toISOString() } : d)
}