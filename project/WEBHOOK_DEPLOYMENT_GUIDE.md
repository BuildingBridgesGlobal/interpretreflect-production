# 🚀 Webhook Deployment & Configuration Guide

## Project Location
`C:\Users\maddo\Desktop\boltV1IR\project\`

## Your Webhook URLs (After Deployment)

### **Stripe Webhook:**
```
https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/handle-webhook
```

### **Pabbly Webhook:**
```
https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/pabbly-webhook
```

### **Encharge Webhook:**
```
https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/encharge-webhook
```

---

## 📋 Step-by-Step Deployment Process

### Step 1: Run SQL Setup in Supabase
1. Go to: https://app.supabase.com/project/kvguxuxanpynwdffpssm/sql
2. Copy and paste the contents of `PABBLY_SUPABASE_SETUP.sql`
3. Click "Run" to create all necessary tables and functions

### Step 2: Set Environment Variables in Supabase
1. Go to: https://app.supabase.com/project/kvguxuxanpynwdffpssm/settings/vault
2. Add these secrets:
   - `STRIPE_SECRET_KEY` - Your Stripe secret key (already in .env)
   - `STRIPE_WEBHOOK_SECRET` - Get from Stripe Dashboard (see below)
   - `ENCHARGE_API_KEY` - Your Encharge API key (already in .env)
   - `PABBLY_WEBHOOK_SECRET` - Create your own secure string
   - `ENCHARGE_WEBHOOK_SECRET` - Create your own secure string

### Step 3: Get Stripe Webhook Secret
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/handle-webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add this to Supabase secrets as `STRIPE_WEBHOOK_SECRET`

### Step 4: Deploy Edge Functions
Open PowerShell in your project directory and run:
```powershell
cd C:\Users\maddo\Desktop\boltV1IR\project\
.\deploy_webhooks.ps1
```

Or manually run:
```powershell
# Login to Supabase CLI (if not already)
supabase login

# Link your project
supabase link --project-ref kvguxuxanpynwdffpssm

# Deploy each function
supabase functions deploy handle-webhook
supabase functions deploy pabbly-webhook
supabase functions deploy encharge-webhook
supabase functions deploy send-encharge-event
```

### Step 5: Configure Pabbly Connect
1. Log into Pabbly Connect
2. Create a new workflow or edit existing
3. Add webhook trigger
4. Use this webhook URL: `https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/pabbly-webhook`
5. Add custom header: `x-pabbly-signature` with your `PABBLY_WEBHOOK_SECRET` value
6. Map your Stripe events to send data to this webhook

### Step 6: Configure Encharge
1. Log into Encharge
2. Go to Settings → Webhooks
3. Add new webhook
4. URL: `https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/encharge-webhook`
5. Secret: Use your `ENCHARGE_WEBHOOK_SECRET` value
6. Select events to send:
   - Person unsubscribed
   - Email bounced
   - Tags added/removed
   - Custom field updated

### Step 7: Set Environment Variables in Vercel
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these production variables:
   ```
   VITE_SUPABASE_URL=https://kvguxuxanpynwdffpssm.supabase.co
   VITE_SUPABASE_ANON_KEY=[your anon key]
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   VITE_ENCHARGE_API_KEY=[your encharge key]
   ```

---

## 🧪 Testing Your Webhooks

### Test Stripe Webhook
```powershell
# Use Stripe CLI to test locally
stripe listen --forward-to https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/handle-webhook

# Trigger a test event
stripe trigger checkout.session.completed
```

### Test Pabbly Webhook
```javascript
// Save this as test-pabbly.js and run with: node test-pabbly.js
const fetch = require('node-fetch');

const testWebhook = async () => {
  const response = await fetch('https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/pabbly-webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-pabbly-signature': 'your_pabbly_secret'
    },
    body: JSON.stringify({
      event_type: 'subscription_created',
      email: 'test@example.com',
      stripe_data: {
        customer_id: 'cus_test123',
        subscription_id: 'sub_test456'
      }
    })
  });

  console.log(await response.json());
};

testWebhook();
```

---

## 🔍 Monitoring & Debugging

### View Webhook Logs in Supabase
```sql
-- Check Pabbly webhook logs
SELECT * FROM pabbly_webhook_logs ORDER BY created_at DESC LIMIT 10;

-- Check subscription audit log
SELECT * FROM subscription_audit_log ORDER BY created_at DESC LIMIT 10;

-- Check failed payments
SELECT * FROM failed_payments ORDER BY created_at DESC LIMIT 10;

-- Check subscription status
SELECT email, subscription_status, stripe_subscription_id 
FROM profiles 
WHERE subscription_status IS NOT NULL;
```

### View Edge Function Logs
```powershell
# View logs for specific function
supabase functions logs handle-webhook
supabase functions logs pabbly-webhook
supabase functions logs encharge-webhook
```

---

## 🔐 Security Notes

1. **Never commit secrets to Git** - Use environment variables
2. **Verify webhook signatures** - All handlers include signature verification
3. **Use HTTPS only** - All Supabase functions are HTTPS by default
4. **Rotate secrets regularly** - Update webhook secrets every 90 days
5. **Monitor for anomalies** - Check logs regularly for unusual activity

---

## 📝 Quick Reference

### Your Supabase Project
- **URL:** https://kvguxuxanpynwdffpssm.supabase.co
- **Dashboard:** https://app.supabase.com/project/kvguxuxanpynwdffpssm

### Webhook Endpoints
- **Stripe:** `/functions/v1/handle-webhook`
- **Pabbly:** `/functions/v1/pabbly-webhook`
- **Encharge:** `/functions/v1/encharge-webhook`

### Required Secrets
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ENCHARGE_API_KEY`
- `PABBLY_WEBHOOK_SECRET`
- `ENCHARGE_WEBHOOK_SECRET`

---

## 🆘 Troubleshooting

### Function not deploying?
```powershell
# Check Supabase CLI version
supabase --version

# Update if needed
npm update -g supabase

# Re-link project
supabase link --project-ref kvguxuxanpynwdffpssm
```

### Webhook not receiving events?
1. Check function logs: `supabase functions logs [function-name]`
2. Verify webhook URL is correct
3. Check signature/secret is set correctly
4. Ensure events are selected in Stripe/Pabbly/Encharge

### Database permissions issue?
Run this in SQL Editor:
```sql
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
```

---

## ✅ Deployment Checklist

- [ ] SQL setup script executed in Supabase
- [ ] Environment variables set in Supabase Vault
- [ ] Edge functions deployed successfully
- [ ] Stripe webhook configured with correct events
- [ ] Stripe webhook secret added to Supabase
- [ ] Pabbly workflows configured with webhook URL
- [ ] Encharge webhook configured
- [ ] Vercel environment variables updated
- [ ] Test webhooks working
- [ ] Monitoring queries saved

---

## 📞 Support

If you encounter issues:
1. Check function logs in Supabase
2. Review webhook logs in database
3. Verify all secrets are set correctly
4. Test with sample payloads
5. Check Stripe/Pabbly/Encharge documentation

Good luck with your deployment! 🎉
