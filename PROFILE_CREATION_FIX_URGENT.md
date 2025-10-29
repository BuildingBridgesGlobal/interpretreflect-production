# 🚨 URGENT: Profile Creation Fix

**Date:** October 26, 2025  
**Priority:** CRITICAL  
**Status:** Fix ready to deploy

---

## Problem

New users signing up are NOT getting entries created in the `profiles` table, which causes:
- Users can't access the app (subscription check fails)
- Users appear in Stripe but not in Supabase
- Authentication works but app features are blocked

---

## Root Cause

Your app uses **TWO profile tables**:

1. **`profiles`** (PRIMARY) - Contains:
   - `subscription_status`
   - `is_admin`
   - `trial_started_at` / `trial_ends_at`
   - `stripe_customer_id`
   - Used by: ProtectedRoute, subscription checks, admin features

2. **`user_profiles`** (SECONDARY) - Contains:
   - `full_name`
   - `accessibility_settings`
   - `pronouns`, `credentials`
   - Used by: Profile settings, personalization

**The `profiles` table was missing a trigger to create entries for new users!**

The `user_profiles_schema.sql` migration only created triggers for `user_profiles` and `user_preferences`, but NOT for the main `profiles` table that your app depends on.

---

## Solution

Run this SQL script immediately:

```bash
supabase/fix_profile_creation_CRITICAL.sql
```

### What it does:

1. ✅ Ensures `profiles` table has all required columns
2. ✅ Creates a comprehensive `handle_new_user()` function that populates BOTH tables
3. ✅ Sets up proper RLS policies on `profiles` table
4. ✅ Creates trigger on `auth.users` to auto-create profiles
5. ✅ **Backfills missing profiles for existing users**
6. ✅ Verifies the fix worked

---

## How to Deploy

### Option 1: Supabase Dashboard (Recommended)
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/fix_profile_creation_CRITICAL.sql`
3. Paste and click "Run"
4. Check the output for success messages

### Option 2: Command Line
```bash
psql -h <your-supabase-host> -U postgres -d postgres -f supabase/fix_profile_creation_CRITICAL.sql
```

---

## Verification

After running the script, you should see:

```
========================================
PROFILE CREATION FIX - SUMMARY
========================================
Total users: X
Users with profiles: X
Users with user_profiles: X
Users with preferences: X

✅ ALL USERS HAVE PROFILES!

Trigger status: ACTIVE
New signups will automatically create profiles.
========================================
```

Then check recent users:
```sql
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as has_profile,
  p.subscription_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;
```

All users should have ✅ in the `has_profile` column.

---

## Test New Signup

After deploying the fix:

1. Create a new test account
2. Check that the user appears in BOTH tables:
   ```sql
   SELECT * FROM profiles WHERE email = 'test@example.com';
   SELECT * FROM user_profiles WHERE email = 'test@example.com';
   ```
3. Verify the user can access the app without errors

---

## Why This Happened

The enterprise dashboard migrations (`create_enterprise_tables.sql`, `step2_create_organization_members_table.sql`) didn't cause this issue directly.

The real problem was that:
1. Your app was refactored to use a `profiles` table (not `user_profiles`)
2. The `user_profiles_schema.sql` migration only created triggers for `user_profiles`
3. No trigger was ever created for the main `profiles` table
4. This issue may have existed before the enterprise dashboard work

---

## Files Created

1. **`supabase/fix_profile_creation_CRITICAL.sql`** - The fix (RUN THIS NOW)
2. **`supabase/diagnose_profile_issue.sql`** - Diagnostic queries
3. **`PROFILE_CREATION_FIX_URGENT.md`** - This document

---

## Next Steps

1. ✅ Run `fix_profile_creation_CRITICAL.sql` immediately
2. ✅ Verify all existing users now have profiles
3. ✅ Test new signup flow
4. ✅ Monitor for any errors in the next 24 hours
5. Consider consolidating to a single profile table in the future

---

## Impact

**Before Fix:**
- ❌ New users can't use the app
- ❌ Subscription checks fail
- ❌ Users stuck at login

**After Fix:**
- ✅ New users automatically get profiles
- ✅ Existing users backfilled
- ✅ App works normally
- ✅ 14-day trial starts automatically

---

*This is a critical production issue. Deploy immediately.*
