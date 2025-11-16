import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const email = user.email || ''
  const isAdmin = email.includes('admin')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { completionId, attestedBy, reportedToRid } = body || {}
  if (!completionId || !attestedBy) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const admin = createAdmin(url, key)

  const { error } = await admin
    .from('ceu_completions')
    .update({ attested_at: new Date().toISOString(), attested_by: attestedBy, reported_to_rid: !!reportedToRid })
    .eq('id', completionId)
  if (error) return NextResponse.json({ error: 'Failed to attest completion' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
