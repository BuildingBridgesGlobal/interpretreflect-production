# Payment System Setup Guide

## Current Status: TEST MODE ✅

The payment system is fully configured and ready for testing. Here's everything you need to know:

## 🔑 Test Credentials (Currently Configured)

- **Stripe Publishable Key:** `pk_test_51RRVUeIouyG60O9h...` (in `.env.local`)
- **Stripe Secret Key:** `sk_test_51RRVUeIouyG60O9h...` (for edge functions only)
- **Product ID:** `prod_T4YIgayVYtSFcq`
- **Price ID:** `price_1S8PBVIouyG60O9hnLvPqyDv` ($12.99/month)

## 🧪 Test Credit Cards

### Successful Payment
- Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

### Card Declined
- Number: `4000 0000 0000 0002`

### Requires Authentication (3D Secure)
- Number: `4000 0025 0000 3155`

## 📁 Project Structure

```
project/
├── src/
│   ├── pages/
│   │   └── SeamlessSignup.tsx     # Multi-step signup flow
│   └── lib/
│       └── stripe.ts               # Stripe configuration
├── supabase/
│   ├── functions/
│   │   └── create-subscription/   # Edge function for subscriptions
│   │       └── index.ts
│   ├── migrations/
│   │   └── 20250117_create_subscriptions.sql  # Database schema
│   └── config.toml                 # Supabase configuration
└── .env.local                      # Environment variables (DO NOT COMMIT)
```

## 🚀 Deployment Steps

### 1. Deploy Database Migration

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref kvguxuxanpynwdffpssm

# Run migrations
npx supabase db push
```

### 2. Deploy Edge Function

```bash
# Set environment variables for the edge function
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_51RRVUeIouyG60O9h...

# Deploy the function
npx supabase functions deploy create-subscription
```

### 3. Test the Flow

1. Navigate to http://localhost:5174/signup
2. Create an account
3. Select Essential plan
4. Enter test card: `4242 4242 4242 4242`
5. Complete purchase

## 🔄 Switching to Production

When ready to go live, make these changes:

### 1. Update Stripe Keys

In `.env.local`:
```env
# Change from test keys to live keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
```

In Supabase:
```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
```

### 2. Create Live Product

Run the script with live keys:
```bash
node scripts/create-stripe-product.js
```

Update `src/lib/stripe.ts` with the new price ID.

### 3. Set Up Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 4. Create Webhook Handler

Create `supabase/functions/stripe-webhook/index.ts` to handle subscription updates.

## 📊 Database Schema

The `subscriptions` table tracks all customer subscriptions:

```sql
subscriptions
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → auth.users)
├── stripe_customer_id (Text, Unique)
├── stripe_subscription_id (Text, Unique)
├── stripe_price_id (Text)
├── status (Text) - active, canceled, past_due, etc.
├── current_period_start (Timestamp)
├── current_period_end (Timestamp)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

## 🔍 Monitoring & Debugging

### Check Stripe Logs
- Test mode: https://dashboard.stripe.com/test/logs
- Live mode: https://dashboard.stripe.com/logs

### Check Supabase Logs
```bash
npx supabase functions logs create-subscription
```

### Common Issues

1. **422 Error on Signup**
   - Password too weak (min 6 chars)
   - Email already registered

2. **Edge Function Not Found**
   - Deploy with: `npx supabase functions deploy create-subscription`

3. **Payment Fails**
   - Check Stripe logs for detailed error
   - Verify price ID matches

## 📝 Next Steps for Production

1. [ ] Set up Stripe webhook endpoint
2. [ ] Add subscription status checks to app
3. [ ] Create customer portal for subscription management
4. [ ] Add retry logic for failed payments
5. [ ] Set up email notifications
6. [ ] Add usage-based billing (if needed)
7. [ ] Create admin dashboard for subscription monitoring

## 🛠️ Maintenance

### Update Prices
1. Create new price in Stripe Dashboard
2. Update `src/lib/stripe.ts` with new price ID
3. Optionally migrate existing subscriptions

### Monitor Health
- Check Stripe Dashboard for failed payments
- Review Supabase logs for edge function errors
- Monitor conversion rates in analytics

## 📧 Support

For payment issues, check:
1. Stripe Dashboard logs
2. Supabase edge function logs
3. Browser console for client-side errors

---

**Last Updated:** January 2025
**Status:** Test Mode Active ✅