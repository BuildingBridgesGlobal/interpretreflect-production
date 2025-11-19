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
    const whoop = (settings?.wearable_devices || []).find((d: any) => d.device_type === 'whoop' && d.connected)
    if (!whoop?.access_token) return NextResponse.json({ error: 'WHOOP not connected' }, { status: 400 })
    const headers = { Authorization: `Bearer ${whoop.access_token}` }
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const end = new Date().toISOString()
    const recoveryRes = await fetch(`https://api.whoop.com/developer/v1/recovery?start=${start}&end=${end}`, { headers })
    const sleepRes = await fetch(`https://api.whoop.com/developer/v1/sleep?start=${start}&end=${end}`, { headers })
    const hrRes = await fetch(`https://api.whoop.com/developer/v1/physiological/heart_rate?start=${start}&end=${end}`, { headers })
    const recoveryJson = await recoveryRes.json()
    const sleepJson = await sleepRes.json()
    const hrJson = await hrRes.json()
    const samples = Array.isArray(hrJson) ? hrJson : []
    if (samples.length) {
      const rows = samples.map((s: any) => ({ user_id: user.id, timestamp: s.timestamp || s.time, heart_rate_bpm: s.value || s.heart_rate, source: 'whoop' }))
      await supabase.from('wearable_data').insert(rows)
    }
    const recoveryData = Array.isArray(recoveryJson) ? recoveryJson : recoveryJson?.records || []
    const latestRecovery = recoveryData.length ? recoveryData[recoveryData.length - 1] : null
    const eventsInserted: string[] = []
    if (latestRecovery?.recovery_score !== undefined) {
      const score = latestRecovery.recovery_score
      if (score <= 40) {
        const { data: ev } = await supabase
          .from('wearable_events')
          .insert({ user_id: user.id, device_type: 'whoop', event_type: 'recovery_alert', event_time: new Date().toISOString(), threshold_crossed: score, baseline_value: 100, current_value: score, suggested_action: `Recovery score ${score}. Prioritize rest and consider Quick Reflect.`, reflection_triggered: true, dismissed: false })
          .select()
          .single()
        if (ev?.id) eventsInserted.push(ev.id)
      }
    }
    await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, wearable_devices: updateLastSync(settings?.wearable_devices || [], 'whoop') })
    return NextResponse.json({ ok: true, eventsInserted, samplesIngested: samples.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 })
  }
}

function updateLastSync(devices: any[], deviceType: string) {
  return devices.map((d: any) => d.device_type === deviceType ? { ...d, last_sync: new Date().toISOString() } : d)
}