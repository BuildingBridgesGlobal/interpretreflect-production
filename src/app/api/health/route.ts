import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const urlSet = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonSet = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('quick_reflect_entries')
      .select('id', { head: true, count: 'exact' })
    if (error) {
      return NextResponse.json(
        { ok: false, env: { urlSet, anonSet }, supabase: { ok: false, error: error.message } },
        { status: 503 }
      )
    }
    return NextResponse.json({ ok: true, env: { urlSet, anonSet }, supabase: { ok: true } })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, env: { urlSet, anonSet }, supabase: { ok: false, error: e?.message || 'unknown' } },
      { status: 503 }
    )
  }
}

