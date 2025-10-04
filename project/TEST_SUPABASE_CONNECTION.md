# Supabase Connection Test & Fix

## The Problem

Your Supabase Edge Functions are returning 500 errors, which is preventing reflections from saving properly. The console shows:

- "Reset toolkit API not available, using fallback"
- 500 Internal Server Error from growth-insights-api

## What I Fixed

### 1. **Reflection Service Improvements**

- Now tries Supabase client first (faster)
- Falls back to REST API if client fails
- Automatically refreshes expired sessions
- Saves to localStorage as backup if all else fails
- Increased timeout from 5 to 10 seconds

### 2. **Bypassed Broken Edge Functions**

- Growth Insights API now skips Edge Functions entirely
- Uses direct database queries instead (fallback methods)
- This removes the 500 errors you were seeing

### 3. **Better Error Recovery**

- Reflections will now save locally if Supabase is down
- Data is preserved and marked for sync
- Session auto-refresh when tokens expire

## To Test Your Connection

Open your browser console (F12) and run:

```javascript
// Test 1: Check if Supabase client is connected
const testConnection = async () => {
  const { supabase } = await import('./src/lib/supabase');

  // Check session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  console.log('Session:', session ? 'Active' : 'Not found', sessionError);

  // Test database connection
  const { data, error } = await supabase.from('reflection_entries').select('id').limit(1);

  console.log('Database test:', error ? `Failed: ${error.message}` : 'Success');

  // Test auth status
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log('User:', user?.email || 'Not logged in');
};

testConnection();
```

## Next Steps

1. **Try saving a reflection now** - It should work even with Edge Functions down
2. **Check browser console** for detailed logs
3. **If still failing**, the issue might be:
   - You're not logged in (refresh and log in again)
   - Supabase project is paused (check Supabase dashboard)
   - Network/firewall blocking requests

## Manual Save Test

If reflections still won't save, open console and run:

```javascript
// Manually save a test reflection
const testSave = async () => {
  const { reflectionService } = await import('./src/services/reflectionService');
  const { supabase } = await import('./src/lib/supabase');

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error('Not logged in!');
    return;
  }

  const result = await reflectionService.saveReflection(user.id, 'test_reflection', {
    test: true,
    timestamp: new Date().toISOString(),
  });

  console.log('Save result:', result);
};

testSave();
```

## Checking Your Supabase Project

1. Go to https://supabase.com/dashboard
2. Check if your project is active (not paused)
3. Go to Settings > API
4. Verify your URL matches: `kvguxuxanpynwdffpssm.supabase.co`

The app will now work even with Edge Functions down, using direct database access!
