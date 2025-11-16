import { createClient } from '@supabase/supabase-js'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const testUserId = process.env.TEST_USER_ID || 'test-user'

  if (!url || !serviceRoleKey) {
    console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, serviceRoleKey)

  console.log('Inserting test reflection...')
  const insertRes = await supabase
    .from('reflection_entries')
    .insert({
      user_id: testUserId,
      entry_kind: 'test_reflection',
      data: { test: true, message: 'CRUD test' },
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (insertRes.error) {
    console.error('Insert failed:', insertRes.error)
    process.exit(1)
  }

  console.log('Inserted:', insertRes.data?.id)

  console.log('Deleting test reflection...')
  const delRes = await supabase
    .from('reflection_entries')
    .delete()
    .eq('id', insertRes.data.id)
    .select()
    .single()

  if (delRes.error) {
    console.error('Delete failed:', delRes.error)
    process.exit(1)
  }

  console.log('Deleted:', delRes.data?.id)
  console.log('CRUD test succeeded')
}

main().catch((e) => {
  console.error('Unexpected error:', e)
  process.exit(1)
})
