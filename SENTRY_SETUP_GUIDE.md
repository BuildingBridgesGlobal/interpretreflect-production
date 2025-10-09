# Sentry Error Tracking Setup Guide

**Status**: Configured (awaiting DSN)
**Documentation**: https://docs.sentry.io/platforms/javascript/guides/react/

---

## What is Sentry?

Sentry provides:
- **Error Tracking**: Automatic capture of JavaScript errors
- **Performance Monitoring**: Track slow pages and API calls
- **Session Replay**: See what users did before an error occurred
- **User Context**: Know which user experienced an error
- **Breadcrumbs**: Track user actions leading to errors

---

## Setup Steps

### Step 1: Create Sentry Account

1. Go to https://sentry.io/signup/
2. Sign up with GitHub or email
3. Choose the free plan (up to 5,000 errors/month)

### Step 2: Create a New Project

1. In Sentry dashboard, click "Projects" → "Create Project"
2. Select platform: **React**
3. Set alert frequency: **On every new issue**
4. Project name: `interpretreflect` or `interpretreflect-production`
5. Team: Default or create new
6. Click "Create Project"

### Step 3: Get Your DSN

After creating the project, you'll see:
```
https://[KEY]@[ORG].ingest.sentry.io/[PROJECT_ID]
```

This is your **DSN (Data Source Name)**

### Step 4: Add DSN to Environment Variables

**For Local Development** (optional):
```bash
# .env.local
VITE_SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID
VITE_SENTRY_DEBUG=true  # Enable in dev for testing
```

**For Production (Vercel)**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - Key: `VITE_SENTRY_DSN`
   - Value: `https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID`
   - Environment: Production (or all)
3. Redeploy to apply changes

---

## Features Enabled

### 1. Error Tracking ✅
Automatically captures:
- JavaScript errors
- Unhandled promise rejections
- React component errors (via ErrorBoundary)
- Network errors

### 2. User Context ✅
When a user logs in, Sentry tracks:
- User ID
- User email
- Which user experienced each error

### 3. Performance Monitoring ✅
Tracks:
- Page load times
- API request duration
- Slow database queries
- Navigation performance

Settings:
- **Production**: 10% of transactions sampled
- **Development**: 100% of transactions sampled

### 4. Session Replay ✅
Records user sessions (with privacy):
- **All text masked** (PII protection)
- **All media blocked** (no images/videos)
- **Production**: 10% of sessions recorded
- **Errors**: 100% of error sessions recorded

---

## How It Works

### Automatic Error Capture
```typescript
// Errors are automatically captured
function riskyOperation() {
  throw new Error("Something went wrong");
  // Sentry will capture this automatically
}
```

### Manual Error Capture
```typescript
import { captureError, captureMessage } from './lib/sentry';

try {
  await riskyOperation();
} catch (error) {
  // Capture with additional context
  captureError(error as Error, {
    operation: 'burnout-assessment',
    userId: user.id
  });
}

// Or capture a message
captureMessage('User completed onboarding', 'info');
```

### Add Breadcrumbs
```typescript
import { addBreadcrumb } from './lib/sentry';

// Track user actions
addBreadcrumb('User clicked burnout assessment', {
  score: 7,
  riskLevel: 'moderate'
});
```

---

## What Gets Sent to Sentry

### Error Events
- Error message and stack trace
- User ID and email (if logged in)
- Browser and OS info
- URL where error occurred
- User actions before error (breadcrumbs)
- Network requests made

### Performance Events
- Page load time
- API request duration
- Database query time
- Component render time

### Privacy Protections
- All form text is masked
- Passwords never captured
- Images/videos blocked
- Personal data filtered

---

## Viewing Errors in Sentry

### Dashboard
1. Go to https://sentry.io
2. Select your project
3. View **Issues** tab for errors
4. View **Performance** tab for slow operations

### Error Details
Each error shows:
- Error message and stack trace
- User who experienced it
- Browser/OS details
- Steps to reproduce (breadcrumbs)
- Session replay (if available)

---

## Alert Configuration

### Recommended Alerts

**1. New Issue Alert** (Already configured)
- Trigger: First time an error occurs
- Action: Email notification

**2. Spike Alert** (Optional)
1. Go to Alerts → Create Alert
2. Type: Issues
3. Condition: Number of events > 100 in 1 hour
4. Action: Email or Slack notification

**3. Performance Alert** (Optional)
1. Go to Alerts → Create Alert
2. Type: Metric Alert
3. Condition: P95 response time > 3 seconds
4. Action: Email notification

---

## Integrations

### Slack Integration (Recommended)
1. In Sentry: Settings → Integrations → Slack
2. Click "Add Workspace"
3. Choose channel for notifications
4. Get instant alerts for critical errors

### GitHub Integration (Optional)
1. In Sentry: Settings → Integrations → GitHub
2. Connect repository
3. Create GitHub issues from Sentry errors
4. Link commits to error resolution

---

## Testing Sentry

### Test Error Capture (Local)
```typescript
// Add to your app temporarily
import { captureMessage, captureError } from './lib/sentry';

// Test message
captureMessage('Test Sentry integration', 'info');

// Test error
captureError(new Error('Test error from InterpretReflect'));
```

### Test in Production
1. Deploy with VITE_SENTRY_DSN configured
2. Visit your site
3. Trigger an error (e.g., click a broken button)
4. Check Sentry dashboard within 1 minute

---

## Troubleshooting

### Sentry not capturing errors?

**Check 1**: DSN configured?
```bash
echo $VITE_SENTRY_DSN
# Should output your DSN
```

**Check 2**: In development mode?
- Sentry is disabled in dev by default
- Set `VITE_SENTRY_DEBUG=true` to enable in dev

**Check 3**: Check browser console
```javascript
// Should see: "Sentry initialized in production mode"
```

**Check 4**: Verify in Sentry dashboard
- Go to Settings → Client Keys (DSN)
- Check if events are being received

### Too many errors?

**Filter noise**:
```typescript
// In src/lib/sentry.ts, update beforeSend:
beforeSend(event, hint) {
  // Ignore specific errors
  if (event.message?.includes('Non-Error promise rejection')) {
    return null;
  }
  return event;
}
```

---

## Cost & Limits

### Free Plan (Sufficient for Beta)
- 5,000 errors per month
- 10,000 performance transactions per month
- 30 days data retention
- Unlimited team members

### Paid Plans (If needed later)
- **Team**: $26/month - 50K errors
- **Business**: $80/month - 150K errors + advanced features

---

## Sample Rates (Current Configuration)

**Production**:
- Errors: 100% captured (all errors sent)
- Performance: 10% sampled (1 in 10 transactions)
- Session Replay: 10% of sessions, 100% of errors

**Development**:
- Errors: Disabled by default (set VITE_SENTRY_DEBUG=true to enable)
- Performance: 100% sampled
- Session Replay: 100% of sessions

To adjust, edit `src/lib/sentry.ts`:
```typescript
tracesSampleRate: environment === "production" ? 0.1 : 1.0,
replaysSessionSampleRate: environment === "production" ? 0.1 : 1.0,
```

---

## Security Considerations

### PII Protection ✅
- All text masked by default
- Passwords never captured
- Form inputs redacted
- Images/videos blocked

### Data Residency
- Sentry stores data in US by default
- EU data residency available (contact Sentry)

### Data Retention
- Free plan: 30 days
- Paid plans: Up to 90 days
- Can request data deletion anytime

---

## Next Steps

1. [ ] Create Sentry account
2. [ ] Create React project in Sentry
3. [ ] Copy DSN to Vercel environment variables
4. [ ] Redeploy to production
5. [ ] Test error capture
6. [ ] Set up Slack notifications (optional)
7. [ ] Configure custom alerts (optional)

---

## Quick Reference

**Sentry Dashboard**: https://sentry.io
**Documentation**: https://docs.sentry.io/platforms/javascript/guides/react/
**Configuration**: `src/lib/sentry.ts`
**Integration**: `src/main.tsx` and `src/contexts/AuthContext.tsx`

---

**Status**: ✅ Code integrated, awaiting DSN configuration
**Estimated Setup Time**: 10-15 minutes
**Monthly Cost**: $0 (Free plan sufficient for beta)
