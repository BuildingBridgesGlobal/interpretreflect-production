# 🚀 Encharge Email Marketing Integration Guide

## Overview
This guide explains how to integrate InterpretReflect with Encharge for email marketing automation and wellness reminders.

## ✅ What's Been Implemented

### 1. **Email Notification Service** (`src/services/emailNotificationService.ts`)
- Manages user email preferences
- Syncs with Encharge API
- Handles opt-in/opt-out
- Tags users based on preferences
- Supports wellness reminders

### 2. **Database Schema** (`supabase/migrations/create_email_preferences_table.sql`)
- `email_preferences` table for user settings
- `email_preference_logs` for tracking changes
- `encharge_webhook_events` for webhook processing
- Functions for preference management

### 3. **Webhook Handler** (`supabase/functions/encharge-webhook`)
- Processes Encharge webhooks
- Handles unsubscribes
- Manages bounced emails
- Syncs preferences

### 4. **UI Integration** (`ProfileSettings.tsx`)
- Email Notifications toggle in Privacy & Data settings
- Real-time sync with Encharge when toggled
- User-friendly feedback messages

## 🔧 Setup Instructions

### Step 1: Create Encharge Account

1. Go to [Encharge.io](https://encharge.io)
2. Sign up for an account (they have a free tier)
3. Complete the onboarding process

### Step 2: Configure Encharge

1. **Create a List**
   - Go to People → Lists
   - Create a new list called "InterpretReflect Users"
   - Note the List ID (you'll need this)

2. **Set up Custom Fields**
   - Go to Settings → Custom Fields
   - Add these fields:
     - `userId` (Text)
     - `wellness_reminders` (Boolean)
     - `weekly_insights` (Boolean)
     - `product_updates` (Boolean)
     - `marketing_emails` (Boolean)
     - `source` (Text)

3. **Create Tags**
   - Go to Settings → Tags
   - Create these tags:
     - `interpretreflect-user`
     - `wellness-reminders`
     - `weekly-insights`
     - `product-updates`
     - `marketing-emails`
     - `notifications-disabled`

### Step 3: Get API Credentials

1. Go to Settings → API & Webhooks
2. Copy your API Key
3. Note your Account ID

### Step 4: Set Environment Variables

Add to your `.env` file:

```bash
# Encharge Configuration
VITE_ENCHARGE_API_KEY=your_api_key_here
VITE_ENCHARGE_LIST_ID=your_list_id_here
ENCHARGE_WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 5: Deploy Database Migration

```bash
# Apply the email preferences migration
cd project
supabase db push
# Or manually run: supabase/migrations/create_email_preferences_table.sql
```

### Step 6: Deploy Webhook Function

```bash
# Deploy the Encharge webhook handler
supabase functions deploy encharge-webhook

# Set the webhook secret
supabase secrets set ENCHARGE_WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 7: Configure Webhook in Encharge

1. Go to Settings → API & Webhooks
2. Add a new webhook
3. Set the URL to: `https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/functions/v1/encharge-webhook`
4. Select these events:
   - Person Unsubscribed
   - Person Bounced
   - Person Tagged
   - Person Field Updated
5. Save and test the webhook

## 📧 Email Automation Flows

### Wellness Reminder Flow

1. **Trigger**: 7 days without reflection
2. **Condition**: User has wellness_reminders = true
3. **Action**: Send wellness reminder email
4. **Template**: Gentle reminder to check in

Example Encharge Flow:
```
Trigger: Tag Added "needs-wellness-reminder"
↓
Wait: 1 hour
↓
Condition: Has tag "wellness-reminders"
↓
Send Email: Wellness Reminder Template
↓
Remove Tag: "needs-wellness-reminder"
```

### Welcome Series

1. **Day 0**: Welcome email (immediate)
2. **Day 1**: Platform tour
3. **Day 3**: First reflection prompt
4. **Day 7**: Tips for building habits
5. **Day 14**: Success stories

### Re-engagement Campaign

For users who haven't logged in for 30 days:
1. **Day 30**: "We miss you" email
2. **Day 37**: Benefits reminder
3. **Day 45**: Special offer or incentive

## 🏷️ Tag-Based Segmentation

Use tags to segment users:

- **Active Users**: Last login < 7 days
- **At Risk**: Last login 7-30 days
- **Churned**: Last login > 30 days
- **Power Users**: > 10 reflections
- **New Users**: Account age < 14 days

## 📊 Tracking & Analytics

### Key Metrics to Track

1. **Opt-in Rate**: % of users with notifications enabled
2. **Open Rate**: Target > 25%
3. **Click Rate**: Target > 3%
4. **Unsubscribe Rate**: Keep < 1%
5. **Wellness Reminder Response**: % who reflect after reminder

### View Analytics in Supabase

```sql
-- Get email preference statistics
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN email_notifications = true THEN 1 END) as opted_in,
  COUNT(CASE WHEN wellness_reminders = true THEN 1 END) as wellness_enabled,
  COUNT(CASE WHEN weekly_insights = true THEN 1 END) as insights_enabled
FROM email_preferences;

-- Check recent webhook events
SELECT * FROM encharge_webhook_events
ORDER BY received_at DESC
LIMIT 20;

-- Get users needing wellness reminders
SELECT * FROM get_users_for_wellness_reminders();
```

## 🚀 Testing Checklist

- [ ] Environment variables are set
- [ ] Database migration applied
- [ ] Webhook function deployed
- [ ] Webhook configured in Encharge
- [ ] Test webhook delivery (use Encharge test feature)
- [ ] Toggle email notifications in app
- [ ] Verify user appears in Encharge
- [ ] Verify tags are applied correctly
- [ ] Test unsubscribe flow
- [ ] Check webhook logs

## 🎯 Email Templates to Create in Encharge

### 1. Wellness Reminder
```
Subject: 🌱 Time for your wellness check-in

Hi {{firstName}},

It's been a while since your last reflection. Taking a few minutes to check in with yourself can make a big difference in your well-being.

[Check In Now] → Link to app

Your wellness matters.
The InterpretReflect Team
```

### 2. Weekly Insights
```
Subject: 📊 Your weekly wellness insights

Hi {{firstName}},

Here's your wellness summary for the week:
- Reflections completed: X
- Most common emotion: Y
- Wellness trend: ↑

[View Full Report] → Link to dashboard

Keep up the great work!
```

### 3. Welcome Email
```
Subject: Welcome to InterpretReflect! 🎉

Hi {{firstName}},

Welcome to your wellness journey! We're here to support you every step of the way.

Here's how to get started:
1. Complete your first reflection
2. Set up your profile
3. Explore wellness resources

[Get Started] → Link to app

Questions? Reply to this email.
```

## 🔍 Troubleshooting

### Users Not Appearing in Encharge

1. Check API key is correct
2. Verify list ID is set
3. Check browser console for errors
4. Review Supabase function logs

### Webhooks Not Working

1. Verify webhook URL is correct
2. Check webhook secret matches
3. Test webhook from Encharge dashboard
4. Review webhook logs in Supabase

### Emails Going to Spam

1. Verify sender domain in Encharge
2. Set up SPF/DKIM records
3. Use proper unsubscribe links
4. Avoid spam trigger words

## 📈 Advanced Features

### Behavioral Triggers

Set up flows based on user behavior:
- First reflection completed
- Streak milestones (7, 30, 100 days)
- Inactivity warnings
- Achievement unlocked

### Dynamic Content

Use Encharge merge tags:
- `{{firstName}}` - User's name
- `{{lastReflectionDate}}` - Last activity
- `{{reflectionCount}}` - Total reflections
- `{{currentStreak}}` - Current streak

### A/B Testing

Test different:
- Subject lines
- Send times
- Email templates
- Call-to-action buttons

## 🎉 Success Metrics

After 30 days, you should see:
- 60%+ opt-in rate for wellness reminders
- 30%+ open rate on reminder emails
- 15%+ of reminded users complete a reflection
- <1% unsubscribe rate
- 40%+ of new users complete welcome series

## 📞 Support

- **Technical Issues**: Check Supabase logs
- **Encharge Support**: support@encharge.io
- **Integration Help**: hello@huviatechnologies.com

---

**Note**: Always respect user preferences and privacy. Never send emails to users who have opted out, and always include clear unsubscribe options in every email.