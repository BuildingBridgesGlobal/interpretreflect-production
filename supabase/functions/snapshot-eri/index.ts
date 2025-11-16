import { createClient } from '@supabase/supabase-js'

// Environment variables injected by Supabase
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

type EriBand = 'stable' | 'watch' | 'at_risk' | 'insufficient_data'

interface UserEriRow {
  user_id: string
  eri_score_rounded: number
  eri_band: EriBand
  assignment_count: number
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  // 1. Fetch current per-user ERI (last 10 assignments)
  const { data: userEris, error: fetchError } = await supabase
    .from('user_eri')
    .select('user_id, eri_score_rounded, eri_band, assignment_count')

  if (fetchError) {
    console.error('Failed to fetch user_eri:', fetchError)
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!userEris || userEris.length === 0) {
    return new Response(JSON.stringify({ message: 'No users to snapshot' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 2. Prepare bulk insert
  const snapshots = userEris.map((u: UserEriRow) => ({
    user_id: u.user_id,
    eri_score: u.eri_score_rounded,
    eri_band: u.eri_band,
    assignment_window: 10,
    assignment_count: u.assignment_count,
    computed_at: new Date().toISOString(),
  }))

  // 3. Insert into eri_snapshots
  const { error: insertError } = await supabase
    .from('eri_snapshots')
    .insert(snapshots)

  if (insertError) {
    console.error('Failed to insert snapshots:', insertError)
    return new Response(JSON.stringify({ error: insertError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({
      message: `Snapshotted ${snapshots.length} user(s)`,
      snapshotted_at: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
})