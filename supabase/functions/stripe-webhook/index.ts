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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    console.error('❌ Missing signature or webhook secret');
    return new Response('Webhook Error: Missing signature or secret', {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    console.log('📨 Webhook event received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('🎉 checkout.session.completed');
        console.log('📧 Session email:', session.customer_details?.email);
        console.log('💳 Customer ID:', session.customer);

        // ============================================
        // STEP 1: GET SUBSCRIPTION AND METADATA
        // ============================================
        if (!session.subscription) {
          console.error('❌ No subscription in session');
          throw new Error('No subscription found in checkout session');
        }

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const customerId = session.customer as string;
        const email = session.customer_details?.email;

        console.log('📦 Subscription metadata:', subscription.metadata);

        // Extract signup data from metadata
        const fullName = subscription.metadata?.full_name;
        const password = subscription.metadata?.password;
        const plan = subscription.metadata?.plan || 'essential';

        console.log('✅ Step 1: Retrieved subscription data:', {
          subscriptionId: subscription.id,
          status: subscription.status,
          email,
          fullName,
          hasPassword: !!password,
          plan,
        });

        if (!email) {
          console.error('❌ No email in checkout session');
          throw new Error('No email found in checkout session');
        }

        if (!password) {
          console.error('❌ No password in subscription metadata');
          throw new Error('No password found in metadata - cannot create auth user');
        }

        // ============================================
        // STEP 2: CREATE SUPABASE AUTH USER
        // ============================================
        console.log('🔐 Step 2: Creating Supabase auth user...');

        let userId: string;

        // Try to create auth user - if email exists, we'll get an error
        const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true, // Auto-confirm email since they paid
          user_metadata: {
            full_name: fullName,
          },
        });

        if (authError) {
          // Check if error is because user already exists
          if (authError.message?.includes('already') || authError.message?.includes('duplicate')) {
            console.log('⚠️ User already exists, fetching existing user...');

            // Find existing user by email - query profiles table instead of listing all users
            const { data: existingProfile } = await supabaseAdmin
              .from('profiles')
              .select('id')
              .eq('email', email)
              .maybeSingle();

            if (existingProfile) {
              userId = existingProfile.id;
              console.log('✅ Found existing user:', userId);
            } else {
              console.error('❌ User exists in auth but not in profiles');
              throw new Error('User exists but profile not found');
            }
          } else {
            console.error('❌ Failed to create auth user:', authError);
            throw new Error(`Failed to create auth user: ${authError.message}`);
          }
        } else if (newUser?.user) {
          userId = newUser.user.id;
          console.log('✅ Step 2: Auth user created:', userId);
        } else {
          throw new Error('Failed to create user - no user returned and no error');
        }

        // ============================================
        // STEP 3: CREATE OR UPDATE PROFILE
        // ============================================
        console.log('👤 Step 3: Creating/updating profile...');

        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (existingProfile) {
          // Update existing profile
          console.log('⚠️ Profile exists, updating...');
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              stripe_customer_id: customerId,
              subscription_status: subscription.status, // 'active' or 'trialing'
              subscription_tier: plan,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (updateError) {
            console.error('❌ Failed to update profile:', updateError);
            throw new Error(`Failed to update profile: ${updateError.message}`);
          }

          console.log('✅ Step 3: Profile updated');
        } else {
          // Create new profile
          const { error: insertError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: userId,
              email: email,
              full_name: fullName,
              stripe_customer_id: customerId,
              subscription_status: subscription.status, // 'active' or 'trialing'
              subscription_tier: plan,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error('❌ Failed to create profile:', insertError);
            throw new Error(`Failed to create profile: ${insertError.message}`);
          }

          console.log('✅ Step 3: Profile created');
        }

        // ============================================
        // STEP 4: CREATE SUBSCRIPTION RECORD
        // ============================================
        console.log('💰 Step 4: Creating subscription record...');

        const { error: subscriptionError } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            id: subscription.id,
            user_id: userId,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            quantity: subscription.items.data[0].quantity,
            cancel_at_period_end: subscription.cancel_at_period_end,
            created: new Date(subscription.created * 1000).toISOString(),
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          });

        if (subscriptionError) {
          console.error('❌ Failed to create subscription record:', subscriptionError);
          // Don't throw - user is already created
        } else {
          console.log('✅ Step 4: Subscription record created');
        }

        // ============================================
        // STEP 5: CLEAR PASSWORD FROM STRIPE METADATA (SECURITY)
        // ============================================
        console.log('🔒 Step 5: Clearing password from Stripe metadata...');

        try {
          // Remove password from subscription metadata for security
          await stripe.subscriptions.update(subscription.id, {
            metadata: {
              full_name: fullName,
              plan: plan,
              // password is intentionally removed
            },
          });
          console.log('✅ Step 5: Password cleared from Stripe metadata');
        } catch (cleanupError) {
          console.error('⚠️ Failed to clear password from metadata:', cleanupError);
          // Don't throw - user is already created successfully
        }

        console.log('🎊 WEBHOOK COMPLETE: User account fully created and ready!');
        console.log('   User ID:', userId);
        console.log('   Email:', email);
        console.log('   Subscription:', subscription.status);

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Subscription updated:', subscription.id);

        // Find user by stripe customer ID
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single();

        if (!profile) {
          console.log('⚠️ No profile found for customer:', subscription.customer);
          break;
        }

        // Update subscription status
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          })
          .eq('id', subscription.id);

        console.log('✅ Subscription updated');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('❌ Subscription deleted:', subscription.id);

        // Find user by stripe customer ID
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single();

        if (!profile) {
          console.log('⚠️ No profile found for customer:', subscription.customer);
          break;
        }

        // Update subscription status to canceled
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            ended_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        console.log('✅ Subscription canceled');
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('💥 Webhook error:', err.message);
    console.error(err.stack);
    return new Response(
      JSON.stringify({
        error: err.message,
        received: false,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
