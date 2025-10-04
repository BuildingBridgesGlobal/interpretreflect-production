# 📧 Automated Email Receipt System Setup Guide

## ✅ What's Been Implemented

1. **Email Service Function** (`supabase/functions/send-email`)
   - Professional HTML email templates
   - 5 email types: welcome, payment_success, cancellation, payment_failed, trial_ending
   - Resend API integration ready
   - Email logging to database

2. **Webhook Integration**
   - Updated `handle-webhook` function to trigger emails on:
     - New subscription (welcome + payment success emails)
     - Subscription cancellation
     - Failed payments
   - Automatic email sending on payment events

3. **Database Schema** (`create_email_logs_table.sql`)
   - Email tracking and analytics
   - Full audit trail of all sent emails
   - RLS policies for security

## 🚀 Deployment Steps

### 1. Sign up for Resend

1. Go to [Resend.com](https://resend.com)
2. Create an account
3. Verify your domain (hello@huviatechnologies.com)
4. Get your API key from the dashboard

### 2. Set Resend API Key in Supabase

```bash
supabase secrets set RESEND_API_KEY=re_YOUR_API_KEY_HERE
```

### 3. Deploy Database Migration

```bash
cd project
supabase db push
# Or manually run: supabase/migrations/create_email_logs_table.sql
```

### 4. Deploy Edge Functions

```bash
# Deploy the email service
supabase functions deploy send-email

# Re-deploy the webhook handler with email integration
supabase functions deploy handle-webhook
```

### 5. Test Email Sending

You can test the email function directly:

```bash
curl -i --location --request POST \
  'https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/send-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "userId": "test-user-id",
    "emailType": "welcome",
    "data": {
      "customerName": "Test User",
      "planName": "Premium",
      "amount": 12.99
    }
  }'
```

## 📊 Email Types & Triggers

| Email Type        | Trigger Event                                          | Description                        |
| ----------------- | ------------------------------------------------------ | ---------------------------------- |
| `welcome`         | checkout.session.completed                             | Sent when user first subscribes    |
| `payment_success` | checkout.session.completed / invoice.payment_succeeded | Confirms successful payment        |
| `cancellation`    | customer.subscription.deleted                          | Confirms subscription cancellation |
| `payment_failed`  | invoice.payment_failed                                 | Notifies of failed payment         |
| `trial_ending`    | (Manual or scheduled)                                  | Reminder before trial ends         |

## 🔍 Monitoring Emails

### View Email Logs

```sql
-- In Supabase SQL editor
SELECT * FROM email_logs
ORDER BY sent_at DESC
LIMIT 50;
```

### Check Failed Emails

```sql
SELECT * FROM email_logs
WHERE status != 'sent'
ORDER BY sent_at DESC;
```

## 🎨 Customizing Email Templates

Email templates are in `supabase/functions/send-email/index.ts`.

To customize:

1. Edit the HTML templates in the `getEmailTemplate` function
2. Keep the brand colors: #6B8B60 (green) and #FAF9F6 (cream)
3. Test locally before deploying
4. Re-deploy: `supabase functions deploy send-email`

## ⚠️ Important Configuration

### Required Environment Variables

- `RESEND_API_KEY` - Your Resend API key
- `STRIPE_SECRET_KEY` - Already set
- `STRIPE_WEBHOOK_SECRET` - Already set
- `SUPABASE_URL` - Automatically set
- `SUPABASE_SERVICE_ROLE_KEY` - Automatically set

### Domain Verification (Resend)

1. Add DNS records provided by Resend
2. Wait for verification (usually 5-30 minutes)
3. Test with a real email address

## 🧪 Testing Checklist

- [ ] Resend API key is set
- [ ] Domain is verified in Resend
- [ ] Database migration is applied
- [ ] Functions are deployed
- [ ] Test purchase triggers welcome email
- [ ] Test purchase triggers payment success email
- [ ] Cancellation triggers cancellation email
- [ ] Failed payment triggers failure email
- [ ] Emails are logged in database
- [ ] Admin can view email logs

## 🚨 Troubleshooting

### Emails Not Sending

1. Check Resend API key is correct
2. Verify domain in Resend dashboard
3. Check Supabase function logs:
   ```
   supabase functions logs send-email
   ```

### Webhook Not Triggering Emails

1. Check webhook is receiving events in Stripe dashboard
2. Review webhook handler logs:
   ```
   supabase functions logs handle-webhook
   ```

### Email Going to Spam

1. Verify SPF/DKIM records are set correctly
2. Use verified sender domain
3. Avoid spam trigger words
4. Include unsubscribe link (already in templates)

## 📈 Success Metrics

Track these KPIs:

- Email delivery rate (should be >95%)
- Open rate (typical: 20-30%)
- Click rate (typical: 2-5%)
- Spam complaint rate (should be <0.1%)
- Unsubscribe rate (should be <2%)

## 🎉 Next Steps

After email system is live:

- Step 3: Create referral program system
- Step 4: Build usage dashboard for customers
- Consider adding:
  - Monthly billing summary emails
  - Product update newsletters
  - Re-engagement campaigns

---

**Support**: hello@huviatechnologies.com
