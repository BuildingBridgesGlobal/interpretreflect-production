# Fix for Stripe Webhook 401 Error

## Problem
The Stripe webhook is returning a 401 "Missing authorization header" error because Supabase Edge Functions require authentication by default.

Stripe webhooks authenticate using the `stripe-signature` header, NOT the standard `authorization` header that Supabase expects.

## Solution: Enable Anonymous Access for the Webhook Function

You need to configure the `stripe-webhook` function to accept anonymous requests in your Supabase Dashboard.

### Steps to Fix:

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/kvguxuxanpynwdffpssm

2. **Navigate to Edge Functions**
   - Click on "Edge Functions" in the left sidebar
   - Find the `stripe-webhook` function

3. **Enable Anonymous Access**
   - Click on the `stripe-webhook` function
   - Look for settings or configuration options
   - Find the "JWT Verification" or "Authentication" setting
   - **Disable JWT verification** or **Enable anonymous access** for this function

### Alternative: Use Supabase CLI to Set verify_jwt to false

If the dashboard doesn't have the option, you can try deploying with the `--no-verify-jwt` flag:

```bash
npx supabase functions deploy stripe-webhook --no-verify-jwt --project-ref kvguxuxanpynwdffpssm
```

### Verify the Fix

After making this change, test the webhook endpoint:

```bash
curl -I https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/stripe-webhook
```

You should see a `400` response (not 401) with "Webhook Error: Missing signature or secret" - this means the function is now accessible but properly rejecting requests without a Stripe signature.

### Then Retry Failed Webhooks in Stripe

1. Go to your Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. Click on your webhook endpoint
3. Click "Resend" on the failed events
4. They should now succeed with 200 OK responses

---

## Why This Happens

Supabase Edge Functions are designed for internal use and by default require a valid JWT token in the `Authorization` header. However, external webhooks like Stripe use their own authentication methods (signature verification).

The webhook function already has proper Stripe signature verification built in (line 25-32 of the function), so it's secure even without Supabase's JWT verification.
