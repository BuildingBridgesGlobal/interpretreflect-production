import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function refreshGoogleToken(refreshToken: string, clientId: string, clientSecret: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || 'google_refresh_failed')
  return json.access_token as string
}

serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: settings } = await supabase
    .from('user_settings')
    .select('user_id, wearable_devices')
    .limit(1000)

  if (!settings) return new Response(JSON.stringify({ ok: true, usersProcessed: 0 }), { headers: { 'Content-Type': 'application/json' } })

  const results: Array<{ user_id: string; providers: string[]; samplesIngested: number; eventsInserted: number }> = []

  for (const row of settings) {
    const devices = Array.isArray(row.wearable_devices) ? row.wearable_devices : []
    const providers = devices.filter((d: any) => d.connected && d.access_token).map((d: any) => d.device_type)
    if (providers.length === 0) continue

    let samplesIngested = 0
    let eventsInserted = 0

    for (const d of devices) {
      if (!d.connected || !d.access_token) continue
      if (d.device_type === 'oura') {
        const end = new Date()
        const start = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const headers = { Authorization: `Bearer ${d.access_token}` }
        const hrRes = await fetch(`https://api.ouraring.com/v2/usercollection/heartrate?start_datetime=${start.toISOString()}&end_datetime=${end.toISOString()}`, { headers })
        const hrJson = await hrRes.json()
        const samples = Array.isArray(hrJson?.data) ? hrJson.data : []
        if (samples.length) {
          const rows = samples.map((s: any) => ({ user_id: row.user_id, timestamp: s.timestamp, heart_rate_bpm: s.heart_rate, source: 'oura' }))
          await supabase.from('wearable_data').insert(rows)
          samplesIngested += rows.length
        }
      }
      if (d.device_type === 'whoop') {
        const end = new Date().toISOString()
        const start = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const headers = { Authorization: `Bearer ${d.access_token}` }
        const hrRes = await fetch(`https://api.whoop.com/developer/v1/physiological/heart_rate?start=${start}&end=${end}`, { headers })
        const hrJson = await hrRes.json()
        const samples = Array.isArray(hrJson) ? hrJson : []
        if (samples.length) {
          const rows = samples.map((s: any) => ({ user_id: row.user_id, timestamp: s.timestamp || s.time, heart_rate_bpm: s.value || s.heart_rate, source: 'whoop' }))
          await supabase.from('wearable_data').insert(rows)
          samplesIngested += rows.length
        }
        const recRes = await fetch(`https://api.whoop.com/developer/v1/recovery?start=${start}&end=${end}`, { headers })
        const recJson = await recRes.json()
        const recoveryData = Array.isArray(recJson) ? recJson : recJson?.records || []
        const latestRecovery = recoveryData.length ? recoveryData[recoveryData.length - 1] : null
        if (latestRecovery?.recovery_score !== undefined) {
          const score = latestRecovery.recovery_score
          if (score <= 40) {
            const { data: ev } = await supabase
              .from('wearable_events')
              .insert({ user_id: row.user_id, device_type: 'whoop', event_type: 'recovery_alert', event_time: new Date().toISOString(), threshold_crossed: score, baseline_value: 100, current_value: score, suggested_action: `Recovery score ${score}. Prioritize rest and consider Quick Reflect.`, reflection_triggered: true, dismissed: false })
              .select()
              .single()
            if (ev?.id) eventsInserted += 1
          }
        }
      }
      if (d.device_type === 'google_fit') {
        let accessToken = d.access_token as string
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
        if (!accessToken && d.refresh_token && clientId && clientSecret) {
          accessToken = await refreshGoogleToken(d.refresh_token, clientId, clientSecret)
        }
        if (!accessToken) continue
        const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        const endMs = Date.now()
        const startMs = endMs - 24 * 60 * 60 * 1000
        const body = { aggregateBy: [{ dataTypeName: 'com.google.heart_rate.bpm' }], bucketByTime: { durationMillis: 3600000 }, startTimeMillis: startMs, endTimeMillis: endMs }
        const aggRes = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', { method: 'POST', headers, body: JSON.stringify(body) })
        const aggJson = await aggRes.json()
        const buckets = Array.isArray(aggJson?.bucket) ? aggJson.bucket : []
        const rows: any[] = []
        for (const b of buckets) {
          const start = Number(b.startTimeMillis)
          const hrSet = (b.dataset || []).find((x: any) => x.point && x.point.length)
          if (hrSet) {
            for (const p of hrSet.point) {
              const ts = Number(p.startTimeNanos ? Math.floor(Number(p.startTimeNanos) / 1e6) : start)
              const val = p.value && p.value[0] && (p.value[0].fpVal || p.value[0].intVal)
              if (val) rows.push({ user_id: row.user_id, timestamp: new Date(ts).toISOString(), heart_rate_bpm: Number(val), source: 'google_fit' })
            }
          }
        }
        if (rows.length) {
          await supabase.from('wearable_data').insert(rows)
          samplesIngested += rows.length
        }
      }
    }

    results.push({ user_id: row.user_id, providers, samplesIngested, eventsInserted })
    await supabase
      .from('user_settings')
      .upsert({ user_id: row.user_id, wearable_devices: (row.wearable_devices || []).map((x: any) => ({ ...x, last_sync: new Date().toISOString() })) })
  }

  return new Response(JSON.stringify({ ok: true, results }), { headers: { 'Content-Type': 'application/json' } })
})