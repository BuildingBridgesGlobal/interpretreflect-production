# Quick Stripe Payment Test (Without Backend)

Since Stripe Checkout requires a backend to create sessions, here's how to test payments immediately:

## Option 1: Create a Payment Link (Recommended for Testing)

1. **Go to your Stripe Dashboard**
   https://dashboard.stripe.com/test/payment-links

2. **Click "New Link"**

3. **Select your product:**
   - Choose "Basic Plan" ($12.99)
   - Make sure it's set to "Subscription"

4. **Configure the link:**
   - After payment: Redirect to `http://localhost:3000/payment-success`
   - Click "Create link"

5. **Copy the payment link**
   - It will look like: `https://buy.stripe.com/test_xxxxx`

6. **Test it:**
   - Open the link in your browser
   - Use test card: `4242 4242 4242 4242`
   - Complete the checkout

## Option 2: Deploy Supabase Edge Functions

This is the proper solution for production:

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login and Link
```bash
supabase login
supabase link --project-ref kvguxuxanpynwdffpssm
```

### Step 3: Get Your Secret Key
- Go to https://dashboard.stripe.com/test/apikeys
- Copy your **Secret Key** (sk_test_...)

### Step 4: Set Secrets
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### Step 5: Deploy Functions
```bash
cd project
supabase functions deploy create-checkout-session --no-verify-jwt
```

### Step 6: Test
- Go to http://localhost:3000/pricing
- Click "Start Your Free Trial"
- Complete checkout with test card

## Why the Test Page Didn't Work

Stripe's `redirectToCheckout` method requires either:
1. A **checkout session ID** (created by backend)
2. OR a **Payment Link** (created in Stripe Dashboard)

You can't directly use a price ID from the frontend - this is a security feature to prevent price manipulation.

## Current Status

✅ Stripe keys configured  
✅ Price ID set ($12.99/month)  
✅ Frontend ready  
⏳ Backend deployment needed for full checkout flow  

The easiest way to test right now is Option 1 - create a Payment Link in your Stripe Dashboard!