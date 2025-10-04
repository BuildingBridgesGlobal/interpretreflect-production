# Stripe Payment Integration Setup Guide

## Overview

This application has been configured with Stripe payment integration for subscription management. Follow these steps to complete the setup.

## Prerequisites

- Stripe account (create one at https://stripe.com)
- Supabase project with Edge Functions enabled
- Node.js and npm installed

## Step 1: Configure Stripe Dashboard

1. **Create Stripe Account**
   - Go to https://dashboard.stripe.com
   - Sign up or log in to your account

2. **Get API Keys**
   - Navigate to Developers > API keys
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)

3. **Create Products and Prices**
   - Go to Products in your Stripe Dashboard
   - Create three subscription products:

   **Basic Plan ($9.99/month)**
   - Name: Basic
   - Price: $9.99
   - Billing period: Monthly
   - Note the Price ID (starts with `price_`)

   **Professional Plan ($19.99/month)**
   - Name: Professional
   - Price: $19.99
   - Billing period: Monthly
   - Note the Price ID

   **Enterprise Plan ($49.99/month)**
   - Name: Enterprise
   - Price: $49.99
   - Billing period: Monthly
   - Note the Price ID

4. **Configure Customer Portal**
   - Go to Settings > Billing > Customer portal
   - Enable the customer portal
   - Configure which features customers can access

5. **Set up Webhook Endpoint**
   - Go to Developers > Webhooks
   - Add endpoint: `https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/handle-webhook`
   - Select events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copy the Webhook signing secret

## Step 2: Configure Environment Variables

1. **Update `.env` file in your project:**

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

2. **Update Stripe configuration file** (`src/lib/stripe.ts`):
   - Replace the price IDs with your actual Stripe Price IDs:

```typescript
export const STRIPE_PRODUCTS = {
  BASIC: {
    priceId: 'price_YOUR_BASIC_PRICE_ID', // Replace with actual
    // ...
  },
  PROFESSIONAL: {
    priceId: 'price_YOUR_PROFESSIONAL_PRICE_ID', // Replace with actual
    // ...
  },
  ENTERPRISE: {
    priceId: 'price_YOUR_ENTERPRISE_PRICE_ID', // Replace with actual
    // ...
  },
};
```

## Step 3: Set up Supabase

1. **Run the SQL migrations:**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the contents of `supabase/subscriptions_table.sql`

2. **Deploy Edge Functions:**

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets for Edge Functions
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Deploy the functions
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy handle-webhook
```

3. **Configure CORS for Edge Functions:**
   - In Supabase Dashboard, go to Edge Functions
   - For each function, ensure CORS is properly configured to allow your domain

## Step 4: Testing the Integration

### Test Mode

Stripe provides test credit card numbers for development:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

Use any future date for expiration and any 3-digit CVC.

### Testing Flow

1. Start your development server: `npm run dev`
2. Navigate to `/pricing`
3. Click on any plan's "Get Started" button
4. You'll be redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`
6. Complete the checkout
7. You'll be redirected to `/payment-success`
8. Check your Supabase database for the new subscription record

## Step 5: Production Deployment

1. **Switch to Live Keys:**
   - Replace test keys with live keys in `.env`
   - Update Supabase secrets with live keys
   - Update webhook endpoint to use live endpoint

2. **Update Webhook:**
   - Create a new webhook endpoint for production
   - Use your production domain

3. **Verify Everything:**
   - Test the full payment flow
   - Verify webhooks are being received
   - Check subscription management works

## Troubleshooting

### Common Issues

1. **"Payment system is not configured" error**
   - Ensure `VITE_STRIPE_PUBLISHABLE_KEY` is set in `.env`
   - Restart your development server after updating `.env`

2. **Checkout session fails to create**
   - Verify your Supabase Edge Functions are deployed
   - Check that STRIPE_SECRET_KEY is set in Supabase secrets
   - Ensure CORS is configured for your domain

3. **Webhooks not working**
   - Verify webhook endpoint URL is correct
   - Check webhook signing secret is set correctly
   - Look at Stripe webhook logs for errors

4. **Subscription not appearing in database**
   - Check Supabase Edge Function logs
   - Verify the subscriptions table was created
   - Ensure RLS policies are set correctly

## API Endpoints (Supabase Edge Functions)

### `/functions/v1/create-checkout-session`

Creates a Stripe Checkout session for new subscriptions.

**Request:**

```json
{
  "priceId": "price_xxx",
  "userId": "user_uuid",
  "userEmail": "user@example.com",
  "successUrl": "https://yoursite.com/payment-success",
  "cancelUrl": "https://yoursite.com/pricing"
}
```

### `/functions/v1/create-portal-session`

Creates a Stripe Customer Portal session for subscription management.

**Request:**

```json
{
  "userId": "user_uuid",
  "returnUrl": "https://yoursite.com/account"
}
```

### `/functions/v1/handle-webhook`

Handles Stripe webhook events (called by Stripe, not your app).

## Security Considerations

1. **Never expose your Secret Key** - It should only be used server-side
2. **Validate webhook signatures** - Already implemented in the webhook handler
3. **Use HTTPS in production** - Required for secure payment processing
4. **Implement proper authentication** - Ensure users are authenticated before checkout
5. **Set up proper CORS** - Restrict Edge Function access to your domains

## Additional Features to Consider

- Email notifications for subscription events
- Grace period for failed payments
- Upgrade/downgrade flow between plans
- Usage-based billing
- Discount codes and promotions
- Tax calculation with Stripe Tax

## Support

- Stripe Documentation: https://stripe.com/docs
- Supabase Documentation: https://supabase.com/docs
- Stripe Support: https://support.stripe.com
