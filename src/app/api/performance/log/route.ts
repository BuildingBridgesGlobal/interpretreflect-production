import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { assignmentId, preScore, postScore, cognitiveLoad, emotionalIntensity, recommendations } = body || {}
  const { error } = await supabase
    .from('performance_insights')
    .insert({ user_id: user.id, assignment_id: assignmentId || null, pre_score: preScore || null, post_score: postScore || null, cognitive_load: cognitiveLoad || null, emotional_intensity: emotionalIntensity || null, recommendations: recommendations || null })
  if (error) return NextResponse.json({ error: 'Failed to log performance' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
