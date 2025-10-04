# Add Environment Variables to Vercel Production

## Problem
Your production site shows errors because Vercel doesn't have your environment variables configured.

**Issues you might see:**
- "failed to fetch" on login (missing Supabase keys)
- "Setting up your account..." stuck on payment page (missing Stripe key)
- Payment form not loading

## Solution: Add Environment Variables

### Option 1: Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project

2. **Navigate to Settings**
   - Click **Settings** tab
   - Click **Environment Variables** in sidebar

3. **Add These Variables**
   Copy these EXACT values (click "Create new" for each):

   **For Supabase (Login/Auth):**
   ```
   Variable Name: VITE_SUPABASE_URL
   Value: https://kvguxuxanpynwdffpssm.supabase.co
   Environment: Production, Preview, Development (check all three)
   ```

   ```
   Variable Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z3V4dXhhbnB5bndkZmZwc3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDE2OTIsImV4cCI6MjA3MjE3NzY5Mn0.h06fvdvhtI5oRDMi97izpw8BKsTFKXMZziu3POvYxeU
   Environment: Production, Preview, Development (check all three)
   ```

   **For Stripe (Payments):**
   ```
   Variable Name: VITE_STRIPE_PUBLISHABLE_KEY
   Value: pk_test_51RRVUeIouyG60O9h5ZlcYrTUnWBxE1s45yQlUbOHRUFcd4ptx10YILWMlu99haGm5A4lvKYG2xkskRc9rczjsSYF000lD2yMkM
   Environment: Production, Preview, Development (check all three)
   ```

4. **Redeploy**
   - Go to **Deployments** tab
   - Find the latest deployment
   - Click **⋯** menu → **Redeploy**
   - Wait for deployment to complete

### Option 2: Vercel CLI

Run these commands from your project directory:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add VITE_SUPABASE_URL
# When prompted, paste: https://kvguxuxanpynwdffpssm.supabase.co
# Select: Production, Preview, Development

vercel env add VITE_SUPABASE_ANON_KEY
# When prompted, paste your anon key
# Select: Production, Preview, Development

# Redeploy
vercel --prod
```

## Verify It Works

1. Go to your production URL
2. Try to login
3. Should work without "failed to fetch" error

## Additional Environment Variables (Optional)

If you're using Stripe, AI services, or other integrations, add these too:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
VITE_AGENTICFLOW_AGENT_ID=a1cab40c-bcc2-49d8-ab97-f233f9b83fb2
VITE_AI_PROVIDER=agenticflow
```

## Why This Happens

- Your `.env` file is **gitignored** (correct for security)
- Git doesn't upload `.env` to GitHub
- Vercel deploys from GitHub, so it doesn't have the env vars
- You must add them manually in Vercel

## Troubleshooting

**Still getting errors after adding env vars?**

1. Check variable names are EXACT (case-sensitive)
2. Make sure you redeployed after adding vars
3. Clear browser cache and try again
4. Check browser console for specific error messages

**Need to update env vars?**

1. Go to Vercel Settings → Environment Variables
2. Click **⋯** next to the variable → **Edit**
3. Update value → **Save**
4. Redeploy
