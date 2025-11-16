import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { sessionId, preScore } = body || {}
  if (!sessionId || !preScore) return NextResponse.json({ error: 'Missing sessionId or preScore' }, { status: 400 })
  const { error } = await supabase
    .from('performance_insights')
    .update({ pre_score: preScore })
    .eq('id', sessionId)
    .eq('user_id', user.id)
  if (error) return NextResponse.json({ error: 'Failed to save pre score' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
