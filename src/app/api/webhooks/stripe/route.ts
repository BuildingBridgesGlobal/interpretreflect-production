import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
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

        // Extract metadata
        const userId = session.metadata?.user_id;
        const programId = session.metadata?.program_id;
        const ridNumber = session.metadata?.rid_number;
        const programCode = session.metadata?.program_code;

        if (!userId || !programId || !ridNumber) {
          console.error('Missing metadata in checkout session:', session.id);
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
          break;
        }

        console.log('✅ Enrollment created:', enrollment.id);

        // TODO: Send enrollment confirmation email
        // TODO: Track in Encharge

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
