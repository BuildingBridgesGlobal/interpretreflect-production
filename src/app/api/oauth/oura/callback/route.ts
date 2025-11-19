import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const clientId = process.env.OURA_CLIENT_ID
  const clientSecret = process.env.OURA_CLIENT_SECRET
  const redirectUri = process.env.OURA_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/oauth/oura/callback`

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Oura OAuth not configured' }, { status: 500 })
  }

  try {
    const tokenRes = await fetch('https://api.ouraring.com/oauth/token', {
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
    if (!tokenRes.ok) {
      return NextResponse.json({ error: tokenJson?.error || 'Token exchange failed' }, { status: 400 })
    }

    const accessToken = tokenJson.access_token as string

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect('/auth/signin')

    // Load settings and update wearable_devices
    const { data: settings } = await supabase
      .from('user_settings')
      .select('wearable_devices')
      .eq('user_id', user.id)
      .single()

    const devices = Array.isArray(settings?.wearable_devices) ? settings!.wearable_devices : []
    const updated = updateDevices(devices, {
      device_type: 'oura',
      connected: true,
      last_sync: new Date().toISOString(),
      access_token: accessToken,
    })

    await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        wearable_devices: updated,
        updated_at: new Date().toISOString(),
      })

    return NextResponse.redirect('/dashboard/settings?tab=wearables')
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 })
  }
}

function updateDevices(devices: any[], device: any) {
  const idx = devices.findIndex((d) => d.device_type === 'oura')
  if (idx >= 0) {
    devices[idx] = device
    return devices
  }
  return [...devices, device]
}