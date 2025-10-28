import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const ALLOWED_ORIGINS = [
  'https://interpretreflect.com',
  'https://www.interpretreflect.com',
  ...(Deno.env.get('ENV') === 'development' ? ['http://localhost:5173'] : [])
]

const corsHeaders = (origin: string | null) => {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin)
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const headers = corsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const body = await req.json()
    console.log('📦 Received request body:', JSON.stringify(body))

    const { priceId, email, userId, metadata } = body

    if (!priceId) {
      console.error('❌ Missing priceId in request')
      throw new Error('Price ID is required')
    }

    console.log('✅ Request validated:', { priceId, email, userId, hasMetadata: !!metadata })

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-11-20.acacia',
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if customer already exists in Stripe
    let customerId: string | undefined

    if (userId) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single()

      customerId = profile?.stripe_customer_id
    }

    // Create customer if doesn't exist
    if (!customerId && email) {
      // IMPORTANT: Check if customer already exists in Stripe by email
      // This prevents duplicate customers if profile wasn't updated yet
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1
      })

      if (existingCustomers.data.length > 0) {
        // Use existing customer
        customerId = existingCustomers.data[0].id
        console.log('Found existing Stripe customer:', customerId)
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: email,
          metadata: {
            supabase_uid: userId || '',
            ...metadata,
          },
        })
        customerId = customer.id
        console.log('Created new Stripe customer:', customerId)
      }

      // Save customer ID to profile if user exists
      if (userId && customerId) {
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId)

        if (updateError) {
          console.error('Failed to save stripe_customer_id:', updateError)
        } else {
          console.log('Saved stripe_customer_id to profile')
        }
      }
    }

    // Create checkout session
    const origin = req.headers.get('origin') || 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      
      // FRICTION REDUCERS - Make checkout smoother
      billing_address_collection: 'auto', // Only collect when required by payment method
      customer_creation: 'if_required', // Don't create duplicate customers
      phone_number_collection: {
        enabled: false // Don't ask for phone numbers
      },
      
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/signup?canceled=true`,
      metadata: {
        user_id: userId || '',
        ...metadata,
      },
      subscription_data: {
        metadata: {
          user_id: userId || '',
          supabase_user_id: userId || '', // Backup field name
          ...metadata, // Pass all metadata to subscription for webhook access
        },
        trial_period_days: 3,
      },
      // ALSO add to session metadata for redundancy
      metadata: {
        user_id: userId || '',
        supabase_user_id: userId || '',
        ...metadata,
      },
    })

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...headers, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...headers, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
