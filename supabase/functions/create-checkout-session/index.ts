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

    const { priceId } = await req.json()

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_uid: user.id,
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
    const { priceId, userId, userEmail, successUrl, cancelUrl } = await req.json()

    // Verify the user exists
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      throw new Error('User not found')
    }

    // Check if customer exists in Stripe
    let customerId = user?.stripe_customer_id

    if (!customerId) {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId,
>>>>>>> 2ee36e6d94593e2bcdc64ff5e005491bb99e8919
        },
      })
      customerId = customer.id

<<<<<<< HEAD
      await supabaseClient
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          stripe_customer_id: customerId,
        })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
=======
      // Save the Stripe customer ID to the user's profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
>>>>>>> 2ee36e6d94593e2bcdc64ff5e005491bb99e8919
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
<<<<<<< HEAD
      success_url: `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/pricing?canceled=true`,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
=======
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
      },
      subscription_data: {
        trial_period_days: 7, // 7-day free trial
        metadata: {
          user_id: userId,
        },
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
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
    console.error('Error creating checkout session:', error)
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