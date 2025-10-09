import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Create admin client to test database connection
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Test database connection by querying a simple table
    const { error: dbError } = await supabase
      .from('subscriptions')
      .select('id')
      .limit(1)

    // Determine health status
    const isHealthy = !dbError
    const status = isHealthy ? 'healthy' : 'degraded'
    const httpStatus = isHealthy ? 200 : 503

    // Build response
    const healthData = {
      status: status,
      timestamp: new Date().toISOString(),
      version: 'v2.2',
      services: {
        database: isHealthy ? 'up' : 'down',
        api: 'up', // If we got here, the API is up
      },
      uptime: Deno.osUptime ? Math.floor(Deno.osUptime()) : null,
    }

    // Add error details if degraded (for debugging, not exposed to public)
    if (!isHealthy && dbError) {
      console.error('Health check database error:', dbError)
    }

    return new Response(
      JSON.stringify(healthData),
      {
        status: httpStatus,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    )

  } catch (error) {
    console.error('Health check error:', error)

    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: 'v2.2',
        services: {
          database: 'unknown',
          api: 'degraded',
        },
        error: 'Internal health check failed',
      }),
      {
        status: 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    )
  }
})
