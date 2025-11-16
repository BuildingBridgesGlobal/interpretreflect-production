import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { tier } = await request.json();

    if (tier !== 'pro') {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier, stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profile?.subscription_tier === 'pro') {
      return NextResponse.json(
        { error: 'You already have an active Pro subscription' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Get the Pro price ID from environment
    const proPriceId = process.env.STRIPE_PRICE_ID_PRO || process.env.VITE_STRIPE_PRICE_ID_ESSENTIAL;

    if (!proPriceId) {
      console.error('Missing STRIPE_PRICE_ID_PRO environment variable');
      return NextResponse.json(
        { error: 'Subscription configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Create Stripe Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: proPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing`,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        subscription_tier: 'pro',
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error: any) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription checkout session' },
      { status: 500 }
    );
  }
}
