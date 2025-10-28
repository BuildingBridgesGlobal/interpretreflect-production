import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import Stripe from 'https://esm.sh/stripe@13.5.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const { paymentMethodId, priceId, email, name, userId } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    // Check if customer ID is already saved in profile (prevents duplicates)
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    let customer

    if (profile?.stripe_customer_id) {
      // Use existing customer from profile
      customer = await stripe.customers.retrieve(profile.stripe_customer_id)
      console.log('Using existing customer from profile:', customer.id)
    } else {
      // Check if customer exists in Stripe by email
      const customers = await stripe.customers.list({ email, limit: 1 })

      if (customers.data.length > 0) {
        customer = customers.data[0]
        console.log('Found existing customer in Stripe:', customer.id)
        
        // Save to profile to prevent future lookups
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customer.id })
          .eq('id', userId)
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email,
          name,
          payment_method: paymentMethodId,
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
          metadata: {
            supabase_user_id: userId
          }
        })
        console.log('Created new customer:', customer.id)
        
        // Save to profile
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customer.id })
          .eq('id', userId)
      }
    }

    // Attach payment method to customer if not already attached
    try {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      })
    } catch (error) {
      // Payment method might already be attached, continue
    }

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    })

    // Save subscription to database
    const { error: dbError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // Continue even if database save fails - webhook will update it
    }

    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

    // Return client secret if payment requires confirmation
    if (paymentIntent?.status === 'requires_payment_method' ||
        paymentIntent?.status === 'requires_confirmation') {
      return new Response(
        JSON.stringify({
          subscriptionId: subscription.id,
          clientSecret: paymentIntent.client_secret,
        }),
        {
          headers: { ...headers, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({
        subscriptionId: subscription.id,
        status: subscription.status,
      }),
      {
        headers: { ...headers, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...headers, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})