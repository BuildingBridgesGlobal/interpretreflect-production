# Supabase Client Debug & Fix Guide

## Current Issue

The Supabase JavaScript client is hanging on all operations:

- `supabase.auth.getSession()` - hangs indefinitely
- `supabase.from('table').insert()` - hangs indefinitely
- Even with `returning: 'minimal'` - still hangs

## Possible Causes & Solutions

### 1. Check for Multiple Supabase Projects

You might have TWO different Supabase projects configured:

- URL in code: `https://kvguxuxanpynwdffpssm.supabase.co` (one project)
- URL in errors: `https://pyfysatkmchtlqxpibkk.supabase.co` (different project!)

**FIX**: Check your `.env` file:

```bash
VITE_SUPABASE_URL=https://kvguxuxanpynwdffpssm.supabase.co  # Make sure this is correct
VITE_SUPABASE_ANON_KEY=your_correct_anon_key  # And matches the same project
```

### 2. Clear All Storage & Restart

The client might have corrupted state:

```javascript
// Run in browser console:
localStorage.clear();
sessionStorage.clear();
// Then hard refresh: Ctrl+Shift+R
```

### 3. Check Supabase Dashboard

1. Go to your Supabase project dashboard
2. Check if the project is paused/suspended
3. Check API Settings > ensure "Enable Row Level Security" isn't blocking everything
4. Check Logs > see if requests are reaching Supabase at all

### 4. Recreate Supabase Client

The client initialization might be wrong. Check `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Make sure URL doesn't have trailing slash
const cleanUrl = supabaseUrl?.replace(/\/$/, '');

export const supabase = createClient(cleanUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce',
  },
});
```

### 5. Network/CORS Issues

Check browser DevTools Network tab:

- Are requests to Supabase being made at all?
- Are they pending forever?
- Any CORS errors?
- Any SSL/certificate errors?

### 6. Test with a Fresh Client

Create a test file to isolate the issue:

```javascript
// test-supabase.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://kvguxuxanpynwdffpssm.supabase.co', 'your-anon-key-here');

// Test basic operations
async function test() {
  console.log('Testing getSession...');
  const { data, error } = await supabase.auth.getSession();
  console.log('Session result:', data, error);
}

test();
```

### 7. Check for Infinite Loops

Look for code that might be causing infinite re-renders or loops:

- Multiple `useEffect` hooks calling Supabase
- Recursive function calls
- Event listeners creating more event listeners

## Temporary Workaround (Currently Implemented)

Use direct REST API calls instead of Supabase client:

```javascript
// Instead of: supabase.from('table').insert(data)
// Use: fetch() with Supabase REST API

const response = await fetch(`${SUPABASE_URL}/rest/v1/table`, {
  method: 'POST',
  headers: {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

## Next Steps

1. Check for multiple Supabase projects (different URLs)
2. Clear browser storage and restart
3. Check Supabase dashboard status
4. Verify network requests in DevTools
5. If all else fails, continue with direct API approach
