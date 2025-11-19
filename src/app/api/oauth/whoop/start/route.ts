import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.WHOOP_CLIENT_ID
  const redirectUri = process.env.WHOOP_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/oauth/whoop/callback`
  const scopes = ['read:recovery', 'read:cycles', 'read:sleep', 'read:workout'].join(' ')
  if (!clientId) return NextResponse.json({ error: 'WHOOP_CLIENT_ID not configured' }, { status: 500 })
  const authUrl = new URL('https://api.whoop.com/oauth/authorize')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', scopes)
  return NextResponse.redirect(authUrl.toString())
}