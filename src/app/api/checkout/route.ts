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

    const { programId, ridNumber } = await request.json();

    if (!programId || !ridNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: programId, ridNumber' },
        { status: 400 }
      );
    }

    // Fetch the program details
    const { data: program, error: programError } = await supabase
      .from('ceu_programs')
      .select('*')
      .eq('id', programId)
      .eq('is_active', true)
      .single();

    if (programError || !program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    // Check if user is already enrolled
    const { data: existingEnrollment } = await supabase
      .from('ceu_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('program_id', programId)
      .eq('status', 'enrolled')
      .single();

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'You are already enrolled in this program' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: program.title,
              description: `${program.ceu_value} CEU - ${program.description}`,
              images: [], // Add program images later
            },
            unit_amount: program.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/ceu-bundles/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/ceu-bundles`,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        program_id: programId,
        rid_number: ridNumber,
        program_code: program.program_code,
        ceu_value: program.ceu_value.toString(),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
