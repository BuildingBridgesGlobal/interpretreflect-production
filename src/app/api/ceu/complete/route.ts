import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const enrollmentId = body?.enrollmentId
    const completedAt = body?.completedAt || new Date().toISOString()
    if (!enrollmentId) {
      return NextResponse.json({ error: 'Missing enrollmentId' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createSupabaseAdmin(url, key)

    const { data: enrollment, error: enrollError } = await supabase
      .from('ceu_enrollments')
      .select('id, user_id, program_id, status')
      .eq('id', enrollmentId)
      .single()
    if (enrollError || !enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    const { data: program, error: programError } = await supabase
      .from('ceu_programs')
      .select('id, title, ceu_value')
      .eq('id', enrollment.program_id)
      .single()
    if (programError || !program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    const { data: completion, error: completionError } = await supabase
      .from('ceu_completions')
      .insert({
        user_id: enrollment.user_id,
        program_id: enrollment.program_id,
        ceu_awarded: program.ceu_value,
        completed_at: completedAt,
      })
      .select()
      .single()
    if (completionError || !completion) {
      return NextResponse.json({ error: 'Failed to issue completion' }, { status: 500 })
    }

    // Attach certificate URL to completion record
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (baseUrl) {
      const certificateUrl = `${baseUrl}/api/ceu/certificate/${completion.id}`
      await supabase
        .from('ceu_completions')
        .update({ certificate_url: certificateUrl })
        .eq('id', completion.id)
    }

    await supabase
      .from('ceu_enrollments')
      .update({ status: 'completed' })
      .eq('id', enrollment.id)

    return NextResponse.json({ ok: true, completionId: completion.id })
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
