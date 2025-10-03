import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
<<<<<<< HEAD
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('No user found')
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      throw new Error('No Stripe customer found')
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${req.headers.get('origin')}/dashboard`,
=======
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
  try {
    const { userId, returnUrl } = await req.json()

    // Get the user's Stripe customer ID
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (userError || !user?.stripe_customer_id) {
      throw new Error('Customer not found')
    }

    // Create a portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: returnUrl,
>>>>>>> 2ee36e6d94593e2bcdc64ff5e005491bb99e8919
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      {
<<<<<<< HEAD
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
=======
        headers: { 'Content-Type': 'application/json' },
>>>>>>> 2ee36e6d94593e2bcdc64ff5e005491bb99e8919
        status: 200,
      }
    )
  } catch (error) {
<<<<<<< HEAD
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
=======
    console.error('Error creating portal session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
>>>>>>> 2ee36e6d94593e2bcdc64ff5e005491bb99e8919
        status: 400,
      }
    )
  }
})