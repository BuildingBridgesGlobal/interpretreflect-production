# 🚨 UNIFIED PROFILE & STRIPE DUPLICATE FIX

**Date:** October 26, 2025  
**Priority:** CRITICAL  
**Status:** Ready to deploy

---

## Problems Solved

### 1. ❌ New users not getting profiles
- Users sign up but don't appear in Supabase
- App can't find their profile → blocked from using features
- Subscription checks fail

### 2. ❌ Duplicate Stripe customers
- Same user gets multiple Stripe customer IDs
- Causes billing confusion
- Wastes Stripe API calls

### 3. ❌ Two confusing profile tables
- `profiles` - subscription, admin, trial
- `user_profiles` - settings, accessibility
- Code queries both tables inconsistently
- Maintenance nightmare

---

## Root Causes

### Profile Creation Issue
The `profiles` table (which your app depends on) was missing a trigger to create entries when users sign up. Only `user_profiles` had a trigger.

### Duplicate Stripe Customers
Both Edge Functions (`create-checkout-session` and `create-subscription`) were creating customers without checking if one already exists:

1. User signs up
2. Profile doesn't exist yet (bug #1)
3. `create-checkout-session` runs → creates Stripe customer A
4. `create-subscription` runs → creates Stripe customer B
5. Now user has 2 Stripe customers! 💥

---

## The Solution

### ONE unified `profiles` table with:
- ✅ All subscription fields (status, tier, trial dates, Stripe ID)
- ✅ All profile fields (name, pronouns, credentials)
- ✅ All accessibility fields (high contrast, larger text)
- ✅ Automatic creation on signup
- ✅ Prevents duplicate Stripe customers

---

## Deployment Steps

### Step 1: Run the SQL Migration

```bash
# In Supabase Dashboard → SQL Editor
supabase/UNIFIED_PROFILE_FIX.sql
```

This will:
1. ✅ Add all missing columns to `profiles` table
2. ✅ Merge data from `user_profiles` into `profiles`
3. ✅ Create ONE trigger that populates everything
4. ✅ Backfill all missing profiles
5. ✅ Add unique index on `stripe_customer_id` (prevents duplicates)

### Step 2: Deploy Updated Edge Functions

The Edge Functions have been updated to:
- ✅ Check profile for existing `stripe_customer_id` FIRST
- ✅ Search Stripe by email if not in profile
- ✅ Only create new customer if truly doesn't exist
- ✅ Always save `stripe_customer_id` back to profile

Files modified:
- `supabase/functions/create-checkout-session/index.ts`
- `supabase/functions/create-subscription/index.ts`

Deploy them:
```bash
supabase functions deploy create-checkout-session
supabase functions deploy create-subscription
```

### Step 3: Update Your Frontend Code

You need to update all references from `user_profiles` to `profiles`. The migration keeps both tables for now, but you should migrate your code to use only `profiles`.

Files that need updating (search for `.from('user_profiles')`):
- `src/services/emailNotificationService.ts`
- `src/services/analyticsService.ts`
- `src/components/ProfileSettingsSimplified.tsx`
- `src/components/ProfileSettings.tsx`
- `src/components/PrivacyConsent.tsx`
- `src/components/PersonalizedHomepage.tsx`
- `src/components/layout/Header.tsx`
- `src/components/LuxuryWellnessDashboard.tsx`
- `src/App.tsx`

Change:
```typescript
// OLD
.from('user_profiles')
.select('full_name, pronouns, credentials')
.eq('id', userId)

// NEW
.from('profiles')
.select('full_name, pronouns, credentials')
.eq('id', userId)
```

---

## Verification

### After running the SQL migration:

```sql
-- Check all users have profiles
SELECT 
  COUNT(*) as total_users,
  (SELECT COUNT(*) FROM profiles) as users_with_profiles,
  COUNT(*) - (SELECT COUNT(*) FROM profiles) as missing
FROM auth.users;
```

Should show `missing = 0`.

### Test new signup:

1. Create a new test account
2. Check profile was created:
   ```sql
   SELECT * FROM profiles WHERE email = 'test@example.com';
   ```
3. Should see:
   - ✅ `subscription_status = 'trial'`
   - ✅ `trial_ends_at` = 14 days from now
   - ✅ All fields populated

### Test Stripe customer creation:

1. Go through checkout flow
2. Check profile:
   ```sql
   SELECT id, email, stripe_customer_id FROM profiles WHERE email = 'test@example.com';
   ```
3. Should see `stripe_customer_id` populated
4. Try checkout again → should reuse same customer ID

---

## Benefits

### Before:
- ❌ Two tables to maintain
- ❌ Inconsistent queries
- ❌ Missing profiles on signup
- ❌ Duplicate Stripe customers
- ❌ Billing confusion

### After:
- ✅ ONE unified table
- ✅ Consistent data model
- ✅ Automatic profile creation
- ✅ NO duplicate Stripe customers
- ✅ Clean billing
- ✅ Easier to maintain

---

## Migration Path

### Phase 1: Deploy (NOW)
1. Run `UNIFIED_PROFILE_FIX.sql`
2. Deploy updated Edge Functions
3. Verify new signups work

### Phase 2: Update Frontend (Next)
1. Change all `user_profiles` references to `profiles`
2. Test all profile-related features
3. Deploy frontend changes

### Phase 3: Cleanup (Later)
1. Once all code uses `profiles`, drop `user_profiles` table
2. Remove old migration files
3. Update documentation

---

## Rollback Plan

If something goes wrong:

1. The migration doesn't delete `user_profiles`
2. Your old code still works (queries both tables)
3. To rollback Edge Functions:
   ```bash
   git checkout HEAD~1 supabase/functions/
   supabase functions deploy create-checkout-session
   supabase functions deploy create-subscription
   ```

---

## Testing Checklist

- [ ] Run `UNIFIED_PROFILE_FIX.sql` in Supabase
- [ ] Verify all users have profiles
- [ ] Deploy Edge Functions
- [ ] Test new user signup
- [ ] Verify profile created automatically
- [ ] Test checkout flow
- [ ] Verify NO duplicate Stripe customers
- [ ] Check `stripe_customer_id` saved to profile
- [ ] Test profile settings page
- [ ] Test accessibility settings
- [ ] Monitor for 24 hours

---

## Files Changed

### SQL Migrations:
- ✅ `supabase/UNIFIED_PROFILE_FIX.sql` (NEW - run this!)

### Edge Functions:
- ✅ `supabase/functions/create-checkout-session/index.ts`
- ✅ `supabase/functions/create-subscription/index.ts`

### Frontend (TODO):
- ⏳ Multiple files need updating (see Step 3 above)

---

## Support

If you encounter issues:

1. Check Supabase logs for errors
2. Check Stripe dashboard for duplicate customers
3. Run diagnostic query:
   ```sql
   SELECT 
     u.email,
     p.stripe_customer_id,
     COUNT(*) OVER (PARTITION BY p.stripe_customer_id) as duplicate_count
   FROM auth.users u
   JOIN profiles p ON u.id = p.id
   WHERE p.stripe_customer_id IS NOT NULL
   ORDER BY duplicate_count DESC;
   ```

---

*Deploy immediately to fix signup and prevent duplicate Stripe customers.*
