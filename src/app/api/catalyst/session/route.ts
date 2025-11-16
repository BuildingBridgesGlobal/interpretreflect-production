import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const { assignmentId } = body || {}
  const { data, error } = await supabase
    .from('performance_insights')
    .insert({ user_id: user.id, assignment_id: assignmentId || null })
    .select('id')
    .single()
  if (error) return NextResponse.json({ error: 'Failed to start session' }, { status: 500 })
  return NextResponse.json({ ok: true, sessionId: data.id })
}
