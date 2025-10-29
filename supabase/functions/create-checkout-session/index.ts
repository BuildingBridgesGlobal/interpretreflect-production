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

    const { priceId, email, metadata } = body

    if (!priceId) {
      console.error('❌ Missing priceId in request')
      throw new Error('Price ID is required')
    }

    if (!email) {
      console.error('❌ Missing email in request')
      throw new Error('Email is required')
    }

    console.log('✅ Request validated:', { priceId, email, hasMetadata: !!metadata })

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-11-20.acacia',
    })

    // Check if customer already exists in Stripe by email
    let customerId: string | undefined

    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      // Use existing customer
      customerId = existingCustomers.data[0].id
      console.log('✅ Found existing Stripe customer:', customerId)
    } else {
      // Create new customer - webhook will link to user after payment
      const customer = await stripe.customers.create({
        email: email,
        metadata: metadata || {},
      })
      customerId = customer.id
      console.log('✅ Created new Stripe customer:', customerId)
    }

    // Create checkout session
    const origin = req.headers.get('origin') || 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: email, // Prefill email
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

      // Store all signup data in subscription metadata for webhook
      subscription_data: {
        metadata: {
          ...metadata, // Contains: full_name, password, plan
        },
        trial_period_days: 3,
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
