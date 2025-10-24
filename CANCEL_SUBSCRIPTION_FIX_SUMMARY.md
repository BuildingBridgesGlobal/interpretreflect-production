# Cancel Subscription Button - Fix Summary

## Problem
The Cancel Subscription button was timing out because:
1. The Stripe webhook was saving `stripe_customer_id` to the `profiles` table
2. The edge function was looking for it in the `user_profiles` table
3. They didn't match, so the customer ID was never found

## Solution
Updated all Stripe-related functions to use `user_profiles` table consistently:

### Files Modified
1. **supabase/functions/create-portal-session/index.ts** - Changed from `profiles` to `user_profiles`
2. **supabase/functions/stripe-webhook/index.ts** - Changed all references from `profiles` to `user_profiles`
3. **src/components/ProfileSettingsSimplified.tsx** - Added timeout handling and better error messages
4. **supabase/migrations/add_stripe_customer_id_to_user_profiles.sql** - Created migration to ensure column exists

## Next Steps to Make It Work

### 1. Run the Database Migration
Go to Supabase Dashboard > SQL Editor and run:
```sql
-- Copy and paste the contents of:
-- supabase/migrations/add_stripe_customer_id_to_user_profiles.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

### 2. Redeploy Both Edge Functions
```bash
supabase functions deploy stripe-webhook
supabase functions deploy create-portal-session
```

### 3. Verify Environment Variables
In Supabase Dashboard > Project Settings > Edge Functions > Manage Secrets, ensure these are set:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Test the Button
1. Log in as a user with an active subscription
2. Go to Profile Settings > Privacy tab
3. Click "Cancel Subscription"
4. You should be redirected to Stripe Customer Portal

## How It Works Now

1. **When a user subscribes** (via Stripe Checkout):
   - Stripe webhook receives `checkout.session.completed` event
   - Webhook saves `stripe_customer_id` to `user_profiles` table

2. **When user clicks Cancel Subscription**:
   - Button calls `create-portal-session` edge function
   - Function looks up `stripe_customer_id` from `user_profiles` table
   - Creates Stripe Customer Portal session
   - Redirects user to portal

3. **When user cancels in Stripe Portal**:
   - Stripe webhook receives `customer.subscription.deleted` event
   - Webhook updates `user_profiles` subscription_status to 'canceled'

## Troubleshooting

### Button still times out
- Check edge function logs in Supabase Dashboard
- Verify functions are deployed: `supabase functions list`
- Check environment variables are set

### "No Stripe customer ID found" error
- User doesn't have a subscription yet
- Or webhook hasn't run yet after subscription creation
- Check `user_profiles` table to see if `stripe_customer_id` exists for that user

### Webhook not saving customer ID
- Check webhook is configured in Stripe Dashboard
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe
- Check webhook logs in Stripe Dashboard > Developers > Webhooks

## Testing Checklist
- [ ] Database migration run successfully
- [ ] Both edge functions deployed
- [ ] Environment variables set
- [ ] Test user has `stripe_customer_id` in `user_profiles`
- [ ] Cancel button redirects to Stripe Portal
- [ ] Can cancel subscription in portal
- [ ] Webhook updates subscription status after cancellation
