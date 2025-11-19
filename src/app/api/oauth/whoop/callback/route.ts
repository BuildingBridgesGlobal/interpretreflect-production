import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  const clientId = process.env.WHOOP_CLIENT_ID
  const clientSecret = process.env.WHOOP_CLIENT_SECRET
  const redirectUri = process.env.WHOOP_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/oauth/whoop/callback`
  if (!clientId || !clientSecret) return NextResponse.json({ error: 'WHOOP OAuth not configured' }, { status: 500 })
  const tokenRes = await fetch('https://api.whoop.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }).toString(),
  })
  const tokenJson = await tokenRes.json()
  if (!tokenRes.ok) return NextResponse.json({ error: tokenJson?.error || 'Token exchange failed' }, { status: 400 })
  const accessToken = tokenJson.access_token as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect('/auth/signin')
  const { data: settings } = await supabase
    .from('user_settings')
    .select('wearable_devices')
    .eq('user_id', user.id)
    .single()
  const devices = Array.isArray(settings?.wearable_devices) ? settings!.wearable_devices : []
  const updated = upsertDevice(devices, {
    device_type: 'whoop',
    connected: true,
    last_sync: new Date().toISOString(),
    access_token: accessToken,
  })
  await supabase
    .from('user_settings')
    .upsert({ user_id: user.id, wearable_devices: updated, updated_at: new Date().toISOString() })
  return NextResponse.redirect('/dashboard/settings?tab=wearables')
}

function upsertDevice(devices: any[], device: any) {
  const idx = devices.findIndex((d) => d.device_type === device.device_type)
  if (idx >= 0) { devices[idx] = device; return devices }
  return [...devices, device]
}