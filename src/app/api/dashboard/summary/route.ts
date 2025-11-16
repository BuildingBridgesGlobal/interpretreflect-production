import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const baseline = await supabase
      .from('baseline_checks')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
    const reflect = await supabase
      .from('quick_reflect_entries')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
    const enrollments = await supabase
      .from('ceu_enrollments')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)
    const completions = await supabase
      .from('ceu_completions')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id)

    return NextResponse.json({
      ok: true,
      counts: {
        baseline: baseline.count || 0,
        reflections: reflect.count || 0,
        enrollments: enrollments.count || 0,
        completions: completions.count || 0,
      }
    })
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
