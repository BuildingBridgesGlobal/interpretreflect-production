# Setup Instructions for Trial & Payment System

## Quick Setup Guide

### 1. Run Supabase Migration

Copy and run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/kvguxuxanpynwdffpssm/sql):

```sql
-- Copy the entire contents of:
-- project/supabase/migrations/001_trial_and_subscription_management.sql
```

This creates:
- Trial tracking tables
- Subscription management
- Email event logging
- Onboarding progress tracking

### 2. Deploy Edge Functions (Optional but Recommended)

If you have Supabase CLI installed:
```bash
cd project
supabase functions deploy create-checkout-session
supabase functions deploy handle-webhook
supabase functions deploy send-encharge-event
```

### 3. Configure Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/handle-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 4. Test the Flow

1. Visit http://localhost:5173
2. Click "Start 3-Day Free Trial"
3. You'll be redirected to `/trial-signup` page
4. Sign up with your email
5. Confirm email via Supabase Auth email
6. Access dashboard with full trial features

## What's Working Now

✅ **Trial Signup Page** (`/trial-signup`)
- Professional signup form
- Clear trial benefits
- No credit card required
- Automatic trial activation

✅ **Trial Tracking**
- Stored in Supabase `profiles` table
- 3-day duration
- Automatic expiration tracking

✅ **Stripe Integration**
- Payment link ready: https://buy.stripe.com/3cIcN5fYa7Ry2bA9i1b7y03
- $12.99/month after trial
- Direct checkout available

✅ **Email Automation Ready**
- Encharge integration prepared
- Just need API key in `.env`

## Testing Different Scenarios

### New User Trial Signup:
1. Go to `/trial-signup`
2. Create new account
3. Check Supabase Auth for new user
4. Check `profiles` table for trial dates

### Existing User:
1. Sign in normally
2. Go to `/pricing`
3. Click "Subscribe Now"
4. Complete Stripe payment

### Check Trial Status:
```sql
-- Run in Supabase SQL Editor
SELECT
  email,
  trial_started_at,
  trial_ends_at,
  subscription_status
FROM profiles
WHERE email = 'your-test-email@example.com';
```

## Environment Variables Needed

Add to `.env` if not already present:
```env
# Stripe (already configured)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RRVUe...

# Encharge (optional)
VITE_ENCHARGE_API_KEY=your_api_key_here
```

## Monitoring

### Supabase Dashboard:
- Check `profiles` table for trial users
- View `subscription_events` for activity
- Monitor `email_events` for email sends

### Stripe Dashboard:
- View new customers
- Check subscription creation
- Monitor payment success

## Common Issues

**Trial not starting:**
- Check if RPC function `start_user_trial` exists
- Verify user is authenticated

**Payment not working:**
- Ensure Stripe publishable key is correct
- Check browser console for errors

**Email not sending:**
- Encharge API key needed
- Check Edge Function logs

## Next Steps

1. **Add Encharge API Key** for email automation
2. **Deploy Edge Functions** for better integration
3. **Set up Stripe webhook** for subscription tracking
4. **Monitor first users** through trial flow