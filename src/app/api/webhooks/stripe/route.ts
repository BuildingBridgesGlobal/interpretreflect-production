import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

// Initialize Supabase with service role for webhook
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Check if this is a subscription or one-time payment
        if (session.mode === 'subscription') {
          // Handle subscription checkout
          const userId = session.metadata?.user_id;
          const subscriptionTier = session.metadata?.subscription_tier;

          if (!userId) {
            console.error('Missing user_id in subscription checkout session:', session.id);
            break;
          }

          // Update user profile with subscription info
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              subscription_tier: subscriptionTier || 'pro',
              subscription_status: 'active',
              stripe_subscription_id: session.subscription,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (updateError) {
            console.error('Error updating user subscription:', updateError);
          } else {
            console.log('✅ User upgraded to Pro:', userId);
          }

          // TODO: Send welcome to Pro email
          // TODO: Track in Encharge

        } else {
          // Handle CEU one-time payment
          const userId = session.metadata?.user_id;
          const programId = session.metadata?.program_id;
          const ridNumber = session.metadata?.rid_number;
          const programCode = session.metadata?.program_code;

          if (!userId || !programId || !ridNumber) {
            console.error('Missing metadata in CEU checkout session:', session.id);
            break;
          }

          // Create enrollment record
          const { data: enrollment, error: enrollmentError } = await supabase
            .from('ceu_enrollments')
            .insert({
              user_id: userId,
              program_id: programId,
              rid_number: ridNumber,
              status: 'enrolled',
              enrolled_at: new Date().toISOString(),
              metadata: {
                stripe_session_id: session.id,
                stripe_payment_intent: session.payment_intent,
                amount_paid: session.amount_total,
                program_code: programCode,
              }
            })
            .select()
            .single();

          if (enrollmentError) {
            console.error('Error creating enrollment:', enrollmentError);
          } else {
            console.log('✅ CEU Enrollment created:', enrollment.id);
          }

          // TODO: Send enrollment confirmation email
          // TODO: Track in Encharge
        }

        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) {
          console.error('Missing user_id in subscription.created:', subscription.id);
          break;
        }

        console.log('✅ Subscription created:', subscription.id, 'for user:', userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) {
          console.error('Missing user_id in subscription.updated:', subscription.id);
          break;
        }

        // Update subscription status
        const status = subscription.status === 'active' ? 'active' :
                      subscription.status === 'canceled' ? 'cancelled' :
                      subscription.status;

        await supabase
          .from('user_profiles')
          .update({
            subscription_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        console.log('✅ Subscription updated:', subscription.id, 'status:', status);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) {
          console.error('Missing user_id in subscription.deleted:', subscription.id);
          break;
        }

        // Downgrade user to free tier
        await supabase
          .from('user_profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'cancelled',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        console.log('✅ Subscription cancelled, user downgraded to free:', userId);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          console.log('✅ Invoice paid for subscription:', subscriptionId);
          // Subscription stays active, no action needed unless first payment
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          console.error('❌ Invoice payment failed for subscription:', subscriptionId);
          // TODO: Send payment failed notification to user
          // Stripe will retry automatically
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session expired:', session.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed:', paymentIntent.id);
        // TODO: Send payment failure notification
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
