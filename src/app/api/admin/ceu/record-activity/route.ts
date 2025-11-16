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
  const { userId, programId, hours, category, activityType, notes } = body || {}
  if (!userId || !programId || !hours || !category || !activityType) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const admin = createAdmin(url, key)

  const ceus = Math.round((Number(hours) / 10) * 10) / 10

  const { error } = await admin.rpc('log_ceu_activity', {
    p_user_id: userId,
    p_program_id: programId,
    p_hours: Number(hours),
    p_ceus: ceus,
    p_category: category,
    p_activity_type: activityType,
    p_notes: notes || null,
  })
  if (error) return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 })

  return NextResponse.json({ ok: true, ceus })
}
