import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit, getIdentifier, createRateLimitResponse, getRateLimitHeaders } from '../_shared/rateLimit.ts'

const ALLOWED_ORIGINS = [
  'https://interpretreflect.com',
  'https://www.interpretreflect.com',
  ...(Deno.env.get('ENV') === 'development' ? ['http://localhost:5173'] : [])
]

const corsHeaders = (origin: string | null) => {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin)
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
    'Access-Control-Allow-Credentials': 'true',
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const headers = corsHeaders(origin)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  // SECURITY: Rate limiting - 5 requests per hour per IP
  const identifier = getIdentifier(req)
  const rateLimit = checkRateLimit(identifier, { windowMs: 60 * 60 * 1000, maxRequests: 5 })

  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit.resetTime, headers)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // SECURITY: Verify authentication token
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ code: 401, message: 'Missing authorization header' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // SECURITY: Verify the user is authenticated and get their ID
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ code: 401, message: 'Invalid or expired token' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ code: 400, message: 'user_id is required' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    // SECURITY: Users can only delete their own account
    if (authUser.id !== user_id) {
      return new Response(
        JSON.stringify({ code: 403, message: 'You can only delete your own account' }),
        { status: 403, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    // Delete the user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id)

    if (error) {
      console.error('Error deleting user:', error)
      return new Response(
        JSON.stringify({ code: 500, message: error.message }),
        { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ code: 500, message: error.message }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    )
  }
})
