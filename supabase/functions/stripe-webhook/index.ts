import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Webhook endpoints need to accept requests from Stripe servers
// We allow Stripe webhooks but restrict browser CORS
const ALLOWED_ORIGINS = [
  'https://interpretreflect.com',
  'https://www.interpretreflect.com',
  ...(Deno.env.get('ENV') === 'development' ? ['http://localhost:5173'] : [])
]

const corsHeaders = (origin: string | null) => {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin)
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Access-Control-Allow-Credentials': 'true',
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const headers = corsHeaders(origin)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return new Response('Webhook Error: Missing signature or secret', {
      status: 400,
      headers,
    });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        const customerId = session.customer as string;

        // Try to find profile by stripe_customer_id first
        let { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        // If not found, try to find by user_id in subscription metadata
        if (!profile && subscription.metadata?.user_id) {
          const result = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('id', subscription.metadata.user_id)
            .single();

          profile = result.data;

          // Update the profile with the customer ID for future lookups
          if (profile) {
            await supabaseAdmin
              .from('profiles')
              .update({ stripe_customer_id: customerId })
              .eq('id', profile.id);
          }
        }

        if (profile) {
          // Safely convert timestamps, handling null/undefined values
          const currentPeriodStart = subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000).toISOString()
            : new Date().toISOString();

          const currentPeriodEnd = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : new Date().toISOString();

          await supabaseAdmin.from('subscriptions').upsert({
            id: subscription.id,
            user_id: profile.id,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            plan_name: subscription.items.data[0].price.nickname || 'Subscription',
            plan_amount: subscription.items.data[0].price.unit_amount,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: subscription.status,
              subscription_tier: subscription.items.data[0].price.nickname || 'pro',
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log('Subscription created event:', subscription.id, 'for customer:', customerId);

        // Try to find profile by stripe_customer_id first
        let { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        // If not found, try to find by user_id in subscription metadata
        if (!profile && subscription.metadata?.user_id) {
          console.log('Looking up profile by user_id from metadata:', subscription.metadata.user_id);
          const result = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('id', subscription.metadata.user_id)
            .single();

          profile = result.data;

          // Update the profile with the customer ID for future lookups
          if (profile) {
            await supabaseAdmin
              .from('profiles')
              .update({ stripe_customer_id: customerId })
              .eq('id', profile.id);
          }
        }

        if (profile) {
          const currentPeriodStart = subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000).toISOString()
            : new Date().toISOString();

          const currentPeriodEnd = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : new Date().toISOString();

          await supabaseAdmin.from('subscriptions').upsert({
            id: subscription.id,
            user_id: profile.id,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            plan_name: subscription.items.data[0].price.nickname || 'Subscription',
            plan_amount: subscription.items.data[0].price.unit_amount,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: subscription.status,
              subscription_tier: subscription.items.data[0].price.nickname || 'pro',
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);

          console.log('✅ Profile updated for subscription.created:', profile.id);
        } else {
          console.error('❌ No profile found for customer:', customerId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          // Safely convert timestamps, handling null/undefined values
          const currentPeriodStart = subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000).toISOString()
            : new Date().toISOString();

          const currentPeriodEnd = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : new Date().toISOString();

          await supabaseAdmin.from('subscriptions').upsert({
            id: subscription.id,
            user_id: profile.id,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            plan_name: subscription.items.data[0].price.nickname || 'Subscription',
            plan_amount: subscription.items.data[0].price.unit_amount,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: subscription.status,
              subscription_tier: subscription.items.data[0].price.nickname || 'pro',
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Try to find profile by stripe_customer_id first
        let { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        // If not found, try to find by user_id in subscription metadata
        if (!profile && subscription.metadata?.user_id) {
          const result = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('id', subscription.metadata.user_id)
            .single();

          profile = result.data;

          // Update the profile with the customer ID
          if (profile) {
            await supabaseAdmin
              .from('profiles')
              .update({ stripe_customer_id: customerId })
              .eq('id', profile.id);
          }
        }

        if (profile) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: 'canceled',
              subscription_tier: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile) {
            // Safely convert timestamps, handling null/undefined values
            const currentPeriodStart = subscription.current_period_start
              ? new Date(subscription.current_period_start * 1000).toISOString()
              : new Date().toISOString();

            const currentPeriodEnd = subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : new Date().toISOString();

            // Update subscription status to active on successful payment
            await supabaseAdmin
              .from('subscriptions')
              .update({
                status: 'active',
                current_period_start: currentPeriodStart,
                current_period_end: currentPeriodEnd,
                updated_at: new Date().toISOString(),
              })
              .eq('id', subscriptionId);

            await supabaseAdmin
              .from('profiles')
              .update({
                subscription_status: 'active',
                updated_at: new Date().toISOString(),
              })
              .eq('id', profile.id);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile) {
            // Mark subscription as past_due
            await supabaseAdmin
              .from('subscriptions')
              .update({
                status: 'past_due',
                updated_at: new Date().toISOString(),
              })
              .eq('id', subscriptionId);

            await supabaseAdmin
              .from('profiles')
              .update({
                subscription_status: 'past_due',
                updated_at: new Date().toISOString(),
              })
              .eq('id', profile.id);

            console.log(
              `Payment failed for customer ${customerId}, subscription ${subscriptionId}`
            );
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const customerId = charge.customer as string;

        if (customerId) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile) {
            // If fully refunded, cancel the subscription access
            if (charge.refunded) {
              await supabaseAdmin
                .from('profiles')
                .update({
                  subscription_status: 'canceled',
                  subscription_tier: null,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', profile.id);

              console.log(`Charge refunded for customer ${customerId}, access revoked`);
            }
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, {
      status: 400,
      headers,
    });
  }
});
