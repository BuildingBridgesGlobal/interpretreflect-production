# 📧 Encharge Email & Marketing Automation Setup Guide

## 🎯 Why Encharge?

Encharge provides powerful marketing automation, behavior-based emails, and customer journey mapping - perfect for your wellness platform to nurture users and drive engagement.

## ✅ What's Been Implemented

1. **Encharge Event Integration** (`supabase/functions/send-encharge-event`)
   - Sends user events and properties to Encharge
   - Automatic tagging based on user actions
   - Custom field updates for segmentation
   - Full event tracking

2. **Stripe Webhook Integration**
   - Subscription events → Encharge automation triggers
   - Payment events → Customer journey updates
   - Automatic user tagging (premium, cancelled, payment-issue)

3. **Supported Events**
   - `subscription_created` - New premium subscriber
   - `payment_success` - Successful payment
   - `subscription_cancelled` - User cancelled
   - `payment_failed` - Payment issue
   - `trial_ending` - Trial expiring soon
   - `user_signup` - New user registration
   - `check_in_completed` - User engagement
   - `reflection_submitted` - Active usage

## 🚀 Setup Steps

### 1. Create Your Encharge Account

1. Go to [Encharge.io](https://encharge.io)
2. Sign up for an account (14-day free trial available)
3. Complete the onboarding wizard

### 2. Get Your API Key

1. In Encharge, go to **Settings** → **API & Webhooks**
2. Copy your API Token
3. Keep this safe - you'll need it for Supabase

### 3. Set API Key in Supabase

```bash
supabase secrets set ENCHARGE_API_KEY=your_api_key_here
```

### 4. Deploy the Encharge Function

```bash
# Deploy the Encharge event sender
supabase functions deploy send-encharge-event

# Re-deploy webhook handler with Encharge integration
supabase functions deploy handle-webhook
```

### 5. Create Email Flows in Encharge

#### Welcome Series Flow

1. **Trigger**: Tag added "new-user"
2. **Emails**:
   - Immediate: Welcome to InterpretReflect
   - Day 1: Getting Started Guide
   - Day 3: Tips for Daily Check-ins
   - Day 7: Unlock Premium Features

#### Premium Onboarding Flow

1. **Trigger**: Event "Subscription Started"
2. **Emails**:
   - Immediate: Welcome to Premium + Receipt
   - Day 1: Premium Feature Tutorial
   - Day 3: Set Your Wellness Goals
   - Week 2: Check Progress & Tips

#### Payment Failed Recovery Flow

1. **Trigger**: Tag added "payment-issue"
2. **Emails**:
   - Immediate: Payment Failed Notice
   - Day 1: Update Payment Method Reminder
   - Day 3: Final Notice Before Downgrade
   - Day 5: Subscription Paused

#### Win-Back Campaign

1. **Trigger**: Event "Subscription Cancelled"
2. **Emails**:
   - Immediate: Sorry to See You Go
   - Day 7: What We've Improved
   - Day 30: Special Offer to Return
   - Day 60: Final Discount Offer

## 📊 User Properties in Encharge

These properties are automatically synced:

| Property              | Description            | Use Case            |
| --------------------- | ---------------------- | ------------------- |
| `subscription_status` | active/cancelled/trial | Segmentation        |
| `plan_name`           | Premium/Trial          | Personalization     |
| `last_payment_amount` | Amount paid            | Analytics           |
| `last_check_in`       | Date of last check-in  | Engagement tracking |
| `reflection_count`    | Total reflections      | User activity       |
| `signup_date`         | Registration date      | Cohort analysis     |
| `cancellation_date`   | When cancelled         | Win-back timing     |

## 🏷️ Automatic Tags

Users are automatically tagged based on actions:

- `new-user` - Just signed up
- `trial` - In trial period
- `premium-subscriber` - Active paid subscription
- `active` - Currently active subscription
- `paying-customer` - Has made a payment
- `cancelled` - Cancelled subscription
- `payment-issue` - Failed payment
- `trial-ending` - Trial ending soon
- `engaged-user` - Regular check-ins
- `active-user` - Submits reflections

## 🔗 Connecting Your App Events

### Send Custom Events from Your App

```javascript
// Example: Send event when user completes check-in
const sendEnchargeEvent = async (eventType, eventData) => {
  const { data, error } = await supabase.functions.invoke('send-encharge-event', {
    body: {
      userId: user.id,
      eventType: 'check_in_completed',
      eventData: {
        checkInCount: 5,
        moodScore: 8,
        energyLevel: 7,
      },
    },
  });
};
```

## 📈 Recommended Segments in Encharge

Create these segments for targeted campaigns:

1. **High-Value Users**
   - Has tag "premium-subscriber"
   - Last activity within 7 days

2. **At Risk**
   - Has tag "premium-subscriber"
   - Last activity > 14 days ago

3. **Trial Users Active**
   - Has tag "trial"
   - Check-in count > 3

4. **Payment Issues**
   - Has tag "payment-issue"
   - Subscription status != "cancelled"

5. **Win-Back Targets**
   - Has tag "cancelled"
   - Cancellation date > 30 days ago

## 🧪 Testing Your Integration

### Test Event Sending

```bash
curl -i --location --request POST \
  'https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/send-encharge-event' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "userId": "test-user-123",
    "eventType": "user_signup",
    "eventData": {
      "source": "test"
    },
    "userEmail": "test@example.com"
  }'
```

### Verify in Encharge

1. Go to **People** in Encharge
2. Search for the test email
3. Check the user has correct tags and properties
4. View **Activity** tab for events

## 📧 Email Templates to Create in Encharge

### 1. Welcome Email

Subject: Welcome to InterpretReflect - Your Wellness Journey Starts Here 🌱

### 2. Payment Success

Subject: Payment Confirmed - Thank You!

### 3. Check-In Reminder

Subject: How are you feeling today? Time for your daily check-in

### 4. Reflection Prompt

Subject: Take 5 minutes to reflect on your week

### 5. Premium Upgrade

Subject: Unlock Advanced Analytics & Personalized Insights

## 🔍 Monitoring & Analytics

### In Encharge Dashboard

- **People**: View all users and their properties
- **Flows**: Monitor email flow performance
- **Broadcasts**: One-time campaign results
- **Analytics**: Open rates, click rates, conversions

### Key Metrics to Track

- Email open rate (target: >25%)
- Click rate (target: >3%)
- Conversion rate from trial to paid
- Churn prevention success rate
- Win-back campaign ROI

## 🚨 Troubleshooting

### Events Not Appearing in Encharge

1. Check API key is correct
2. Verify function logs: `supabase functions logs send-encharge-event`
3. Check Encharge API logs in dashboard

### Users Not Receiving Emails

1. Check user exists in Encharge People
2. Verify email flows are active
3. Check user hasn't unsubscribed
4. Review spam/bounce status

### Properties Not Updating

1. Ensure property names match exactly
2. Check data types (number vs string)
3. Review API response for errors

## 🎯 Advanced Automations

### Behavioral Triggers

- No check-in for 3 days → Send gentle reminder
- 5 reflections completed → Celebrate milestone
- Mood trending down → Offer support resources
- High engagement → Upsell to premium

### Score-Based Campaigns

Create lead scores based on:

- Check-in frequency
- Reflection quality
- Feature usage
- Support interactions

## 📅 Recommended Email Calendar

**Daily**: Check-in reminders (if missed)
**Weekly**: Reflection prompts, progress summary
**Bi-weekly**: Feature highlights, tips
**Monthly**: Wellness report, community highlights
**Quarterly**: Platform updates, new features

## 🚀 Next Steps

1. ✅ Set up Encharge account
2. ✅ Configure API integration
3. ✅ Create email flows
4. ✅ Test with real payments
5. ⬜ Monitor first week metrics
6. ⬜ Optimize based on data
7. ⬜ A/B test subject lines
8. ⬜ Expand automation flows

## 💡 Pro Tips

1. **Personalization**: Use merge tags like {{user.name}} and {{user.plan_name}}
2. **Timing**: Send emails based on user timezone
3. **Segmentation**: Create micro-segments for better targeting
4. **Testing**: Always test flows with test users first
5. **Compliance**: Include unsubscribe links (Encharge handles this)

---

**Support**: hello@huviatechnologies.com
**Encharge Support**: support@encharge.io
