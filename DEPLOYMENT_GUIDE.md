# InterpretReflect Deployment Guide - Trial & Subscription Setup

## Overview
This guide will help you deploy the complete trial signup, Stripe integration, and Encharge email automation for InterpretReflect.

## Prerequisites
- Supabase project with admin access
- Stripe account (live keys configured)
- Encharge account (optional but recommended)
- Supabase CLI installed

## Step 1: Deploy Supabase Database Changes

1. Run the migration script in Supabase SQL Editor:
   ```sql
   -- Copy contents of: supabase/migrations/001_trial_and_subscription_management.sql
   ```

2. Verify tables were created:
   - `profiles` (with new columns)
   - `email_events`
   - `subscription_events`
   - `trial_conversions`
   - `onboarding_progress`

## Step 2: Configure Environment Variables

1. Update your `.env` file with:
   ```env
   # Already configured
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RRVUe...

   # Add if using Encharge
   VITE_ENCHARGE_API_KEY=your_encharge_api_key_here
   ```

2. Set Supabase Edge Function secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_51RRVUe...
   supabase secrets set ENCHARGE_API_KEY=your_encharge_api_key_here
   ```

## Step 3: Deploy Edge Functions

1. Deploy the Stripe checkout function:
   ```bash
   supabase functions deploy create-checkout-session
   ```

2. Deploy the Stripe webhook handler:
   ```bash
   supabase functions deploy handle-webhook
   ```

3. Deploy the Encharge integration:
   ```bash
   supabase functions deploy send-encharge-event
   ```

## Step 4: Configure Stripe Webhook

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/handle-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. Copy the webhook signing secret
5. Set in Supabase:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Step 5: Configure Encharge (Optional)

1. In Encharge Dashboard:
   - Create a new API key
   - Set up these automations:

### Trial Welcome Sequence
- Trigger: Tag "trial_user" added
- Day 0: Welcome email
- Day 1: Feature highlight
- Day 2: Success story
- Day 3: Trial ending reminder

### Conversion Sequence
- Trigger: Tag "paying_customer" added
- Immediate: Thank you email
- Day 3: Onboarding tips
- Day 7: Check-in

### Trial Expired Sequence
- Trigger: Event "trial_expired"
- Immediate: Special offer (20% off)
- Day 3: Last chance reminder
- Day 7: Final offer

## Step 6: Test the Flow

### Test Trial Signup:
1. Visit landing page
2. Click "Start 3-Day Free Trial"
3. Sign up with test email
4. Verify:
   - User created in Supabase Auth
   - Profile updated with trial dates
   - Trial event logged
   - Welcome email sent (if Encharge configured)

### Test Payment Flow:
1. After trial signup, go to pricing
2. Click "Subscribe Now"
3. Use test card: `4242 4242 4242 4242`
4. Verify:
   - Stripe subscription created
   - Profile updated with subscription status
   - Conversion tracked

## Step 7: Monitor & Analytics

### Supabase Dashboard:
- Check `subscription_events` table for activity
- Monitor `trial_conversions` for conversion rates
- Review `email_events` for email delivery

### Stripe Dashboard:
- Monitor subscription creation
- Check payment success rate
- Review trial to paid conversion

### Key Metrics to Track:
- Trial signup rate
- Trial to paid conversion rate
- Feature usage during trial
- Email engagement rates

## Troubleshooting

### Trial not starting:
- Check if RPC function `start_user_trial` exists
- Verify user is authenticated
- Check browser console for errors

### Stripe payment not working:
- Verify publishable key is correct
- Check Edge Function logs in Supabase
- Ensure CORS is configured

### Emails not sending:
- Verify Encharge API key
- Check Edge Function logs
- Test Encharge webhook manually

## Production Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Edge Functions deployed
- [ ] Stripe webhook configured
- [ ] Encharge automations active
- [ ] Test with real payment
- [ ] Monitor first 24 hours
- [ ] Set up alerting for failures

## Support

For issues or questions:
- Stripe: https://support.stripe.com
- Supabase: https://supabase.com/support
- Encharge: https://help.encharge.io

## Next Steps

1. Monitor trial conversion rates
2. A/B test different trial durations
3. Implement win-back campaigns for expired trials
4. Add referral program for existing users