export async function getSessionToken(): Promise<string | null> {
  const { createClient } = await import('../lib/supabase/client')
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}
