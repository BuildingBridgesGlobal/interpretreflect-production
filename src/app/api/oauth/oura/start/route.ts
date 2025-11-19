import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.OURA_CLIENT_ID
  const redirectUri = process.env.OURA_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/oauth/oura/callback`
  const scopes = [
    'email',
    'personal',
    'daily',
    'heartrate',
    'readiness',
    'sleep',
  ].join(' ')

  if (!clientId) {
    return NextResponse.json({ error: 'OURA_CLIENT_ID not configured' }, { status: 500 })
  }

  const authUrl = new URL('https://cloud.ouraring.com/oauth/authorize')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', scopes)

  return NextResponse.redirect(authUrl.toString())
}