# Auth Session Issues - Fix Recommendations

## Current Problems
1. **15-second timeout** on auth initialization is too aggressive
2. **Session expires after ~1 hour** and users need to log out/in
3. **"Auth initialization timeout" errors** appearing in console

## Root Causes
1. Supabase JWT tokens expire after 1 hour by default
2. Auto-refresh might be failing silently
3. The 15-second timeout catches slow network responses as errors

## Recommended Fixes

### Fix 1: Increase Auth Initialization Timeout
**File:** `src/contexts/AuthContext.tsx` (line 103)

Change from:
```typescript
setTimeout(() => reject(new Error('Auth initialization timeout')), 15000)
```

To:
```typescript
setTimeout(() => reject(new Error('Auth initialization timeout')), 30000) // 30 seconds
```

### Fix 2: Add Proactive Session Refresh
**File:** `src/contexts/AuthContext.tsx`

Add this after the auth listener setup (around line 245):

```typescript
// Proactively refresh session every 50 minutes (before 1-hour expiration)
const refreshInterval = setInterval(async () => {
  if (user) {
    console.log('Proactively refreshing session...');
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Failed to refresh session:', error);
    } else {
      console.log('Session refreshed successfully');
    }
  }
}, 50 * 60 * 1000); // 50 minutes

return () => {
  clearInterval(refreshInterval);
  authListener.subscription.unsubscribe();
};
```

### Fix 3: Update Supabase JWT Settings (Optional)
In your Supabase Dashboard > Authentication > Settings:
- Increase JWT expiry from 3600 seconds (1 hour) to 7200 seconds (2 hours)
- This gives more buffer time for auto-refresh to work

### Fix 4: Add Session Validation on Route Changes
**File:** `src/App.tsx`

Add a session check when navigating:

```typescript
useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && user) {
      // Session expired but user state still set
      console.log('Session expired, signing out...');
      await signOut();
    }
  };
  
  checkSession();
}, [location.pathname]); // Check on every route change
```

## Testing the Fixes
1. Log in to the app
2. Leave it open for 1+ hours
3. Try to interact with the app (save a reflection, etc.)
4. Should NOT require logout/login

## Quick Fix (Immediate)
If you want a quick fix right now, just increase the timeout to 30 seconds:

**Line 103 in `src/contexts/AuthContext.tsx`:**
```typescript
setTimeout(() => reject(new Error('Auth initialization timeout')), 30000)
```

This will at least stop the timeout errors from appearing so frequently.
