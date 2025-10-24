# Cancel Subscription Button Setup Guide

## What Was Added

A "Cancel Subscription" button has been added to Profile Settings > Privacy tab that redirects users to the Stripe Customer Portal where they can manage their subscription.

## Why It's Not Working Yet

The button requires:
1. The Stripe edge function to be deployed
2. The database to have the `stripe_customer_id` column in the `user_profiles` table
3. Users to have a `stripe_customer_id` stored in their profile

## Setup Steps

### Step 1: Run the Database Migration

Run this SQL migration in your Supabase SQL Editor:

```bash
# Navigate to Supabase Dashboard > SQL Editor
# Run the file: supabase/migrations/add_stripe_customer_id_to_user_profiles.sql
```

Or if you have Supabase CLI installed:

```bash
supabase db push
```

### Step 2: Deploy the Edge Function

The edge function at `supabase/functions/create-portal-session/index.ts` has been updated to use the `user_profiles` table.

Deploy it using:

```bash
supabase functions deploy create-portal-session
```

### Step 3: Set Environment Variables

Make sure these environment variables are set in your Supabase project:

- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

Set them in Supabase Dashboard > Project Settings > Edge Functions > Manage Secrets

### Step 4: Configure Stripe Customer Portal

1. Go to Stripe Dashboard > Settings > Customer Portal
2. Enable the Customer Portal
3. Configure what customers can do:
   - ✅ Cancel subscription
   - ✅ Update payment method
   - ✅ View invoice history
4. Set up your branding and messaging

### Step 5: Link Users to Stripe Customers

When users subscribe, make sure to save their `stripe_customer_id` to the `user_profiles` table:

```typescript
// In your subscription creation flow
await supabase
  .from('user_profiles')
  .update({ stripe_customer_id: stripeCustomerId })
  .eq('id', userId);
```

## Testing

1. Make sure you have a test user with a `stripe_customer_id` in their profile
2. Log in as that user
3. Go to Profile Settings > Privacy tab
4. Click "Cancel Subscription"
5. You should be redirected to the Stripe Customer Portal

## Error Handling

The button now includes detailed error logging:
- Check browser console for detailed error messages
- If no Stripe customer ID is found, users get a helpful message
- All errors are logged for debugging

## Troubleshooting

### "No Stripe customer ID found"
- User doesn't have a `stripe_customer_id` in their `user_profiles` record
- Check if the subscription creation flow is saving the customer ID

### "Edge function error"
- Edge function might not be deployed
- Check environment variables are set correctly
- Verify the function is deployed: `supabase functions list`

### "No portal URL returned"
- Stripe API might be failing
- Check Stripe API keys are correct
- Verify Customer Portal is enabled in Stripe Dashboard

## Files Modified

- `src/components/ProfileSettingsSimplified.tsx` - Added Cancel Subscription button
- `supabase/functions/create-portal-session/index.ts` - Updated to use `user_profiles` table
- `supabase/migrations/add_stripe_customer_id_to_user_profiles.sql` - Database migration

## Next Steps

After setup is complete:
1. Test with a real Stripe customer
2. Verify the portal allows cancellation
3. Test the return URL redirects back to Profile Settings
4. Monitor for any errors in production
