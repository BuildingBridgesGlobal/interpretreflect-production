import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { sessionId, postScore, cognitiveLoad, emotionalIntensity, recommendations } = body || {}
  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  const { error } = await supabase
    .from('performance_insights')
    .update({ post_score: postScore || null, cognitive_load: cognitiveLoad || null, emotional_intensity: emotionalIntensity || null, recommendations: recommendations || null })
    .eq('id', sessionId)
    .eq('user_id', user.id)
  if (error) return NextResponse.json({ error: 'Failed to save post data' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
