import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function norm(x: number, min = 1, max = 5) {
  return (x - min) / (max - min)
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: reflections, error: rErr } = await supabase
    .from('quick_reflections')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(50)

  if (rErr) return NextResponse.json({ error: 'Failed to load reflections' }, { status: 500 })

  const assignments: { eri_assign: number }[] = []
  for (const ref of reflections || []) {
    const { data: preList } = await supabase
      .from('readiness_checks')
      .select('*')
      .eq('user_id', user.id)
      .lte('created_at', ref.created_at)
      .order('created_at', { ascending: false })
      .limit(1)

    const pre = preList && preList[0]
    if (!pre) continue

    const aiInvolved = pre.pre_ai_involvement_expected !== 'no'
    const PreR = aiInvolved
      ? 0.20*norm(pre.pre_emotional_state_score) + 0.20*norm(pre.pre_cognitive_readiness_score) + 0.20*norm(pre.pre_context_familiarity_score) + 0.20*norm(pre.pre_role_clarity_score) + 0.20*norm(pre.pre_ai_confidence_score || 1)
      : 0.25*norm(pre.pre_emotional_state_score) + 0.25*norm(pre.pre_cognitive_readiness_score) + 0.25*norm(pre.pre_context_familiarity_score) + 0.25*norm(pre.pre_role_clarity_score)

    const BaseS = 0.18*norm(ref.post_emotional_load_score) + 0.18*norm(ref.post_cognitive_load_score) + 0.18*norm(ref.post_meaning_challenge_score) + 0.18*norm(ref.post_rolespace_challenge_score) + 0.18*norm(ref.post_cultural_friction_score)
    const AI_S = aiInvolved && typeof ref.post_ai_impact_score === 'number' ? 0.10 * (1 - norm(ref.post_ai_impact_score)) : 0
    const PostS = Math.min(1, BaseS + AI_S)

    const RA = Array.isArray(ref.post_recovery_actions) && ref.post_recovery_actions.some((a: string) => ['Grounding / breathing','Movement / walk / stretch','Debrief with Deaf consumer / colleague','Debrief with supervisor / mentor','Journaling / reflection','Scheduling rest / buffer time'].includes(a)) ? 1 : 0
    const RD_norm = ((ref.post_reflection_depth_self_score || 1) - 1) / 3
    const RR = 0.5*RA + 0.5*RD_norm

    const eri_assign_raw = 0.4*PreR + 0.4*(1 - PostS) + 0.2*RR
    const eri_assign = Math.round(eri_assign_raw * 100)
    assignments.push({ eri_assign })
    if (assignments.length >= 10) break
  }

  if (assignments.length < 3) return NextResponse.json({ ok: true, eri_user: null, band: 'insufficient', count: assignments.length })

  const avg = Math.round(assignments.reduce((acc, a) => acc + a.eri_assign, 0) / assignments.length)
  const band = avg >= 80 ? 'stable' : avg >= 60 ? 'watch' : 'at_risk'
  return NextResponse.json({ ok: true, eri_user: avg, band, count: assignments.length })
}

