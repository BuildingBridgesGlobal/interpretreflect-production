import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const email = user.email || ''
  const isAdmin = email.includes('admin')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: programs } = await supabase.from('ceu_programs').select('id').limit(1)
  const { data: enrollments } = await supabase.from('ceu_enrollments').select('id').limit(1)
  const { data: completions } = await supabase.from('ceu_completions').select('id').limit(1)

  return NextResponse.json({
    ok: true,
    counts: {
      programs: programs ? programs.length : 0,
      enrollments: enrollments ? enrollments.length : 0,
      completions: completions ? completions.length : 0,
    }
  })
}
