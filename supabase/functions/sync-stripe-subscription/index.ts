import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  // Add CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { customerId, userId } = await req.json()

    if (!customerId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing customerId or userId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Syncing subscription for customer ${customerId}, user ${userId}`)

    // Get all subscriptions for this customer from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 100,
    })

    console.log(`Found ${subscriptions.data.length} subscriptions in Stripe`)

    // Find active or past_due subscription
    const activeSubscription = subscriptions.data.find(
      sub => sub.status === 'active' || sub.status === 'past_due'
    )

    if (activeSubscription) {
      console.log(`Active subscription found: ${activeSubscription.id} (${activeSubscription.status})`)

      // Update subscription in database
      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          id: activeSubscription.id,
          user_id: userId,
          status: activeSubscription.status,
          price_id: activeSubscription.items.data[0].price.id,
          plan_name: activeSubscription.items.data[0].price.nickname || 'Subscription',
          plan_amount: activeSubscription.items.data[0].price.unit_amount,
          current_period_start: new Date(activeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: activeSubscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })

      // Update profile
      await supabaseAdmin
        .from('profiles')
        .update({
          subscription_status: activeSubscription.status,
          subscription_tier: activeSubscription.items.data[0].price.nickname || 'pro',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      return new Response(
        JSON.stringify({
          success: true,
          message: `Subscription ${activeSubscription.id} is ${activeSubscription.status}`,
          subscription: {
            id: activeSubscription.id,
            status: activeSubscription.status,
            current_period_end: activeSubscription.current_period_end,
          }
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    } else {
      console.log('No active subscription found in Stripe')

      // Mark all subscriptions as canceled in database
      const { data: dbSubscriptions } = await supabaseAdmin
        .from('subscriptions')
        .select('id, status')
        .eq('user_id', userId)
        .neq('status', 'canceled')

      if (dbSubscriptions && dbSubscriptions.length > 0) {
        console.log(`Canceling ${dbSubscriptions.length} subscriptions in database`)

        for (const sub of dbSubscriptions) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('id', sub.id)
        }
      }

      // Clear subscription status in profile
      await supabaseAdmin
        .from('profiles')
        .update({
          subscription_status: 'canceled',
          subscription_tier: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active subscription found - cleared subscription status',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error syncing subscription:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})