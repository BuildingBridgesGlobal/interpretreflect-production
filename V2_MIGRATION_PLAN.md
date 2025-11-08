# InterpretReflect V2 Migration Plan
## From Old Site to Performance-Optimized V2

**Date:** November 8, 2025  
**Purpose:** Ensure all backend Supabase data and features from the old site are properly integrated into V2

---

## 📋 Executive Summary

This document identifies all components, services, database tables, and features from the old site (`backup_2025-09-16_02-21-22`) that need to be verified or migrated to the current V2 site to ensure no data or functionality is lost.

---

## 🔍 Component Migration Status

### ✅ Components Already in V2
Most components have been migrated. The current v2 site has **175+ components** vs **133 components** in the old site, indicating significant expansion.

### ⚠️ Missing Components (Need Migration)

#### 1. **EthicsMeaningCheckAccessible.tsx**
- **Status:** Missing from V2
- **Location:** `backup_2025-09-16_02-21-22/src/components/EthicsMeaningCheckAccessible.tsx`
- **Purpose:** Values alignment check-in (formerly Compass Check)
- **Dependencies:** 
  - Uses `supabase`, `useAuth`, `updateGrowthInsightsForUser`
  - Custom icons: `TargetIcon`, `HeartPulseIcon`, `NotepadIcon`, `CommunityIcon`, `SecureLockIcon`
- **Action Required:** Copy to `src/components/` and integrate into App.tsx routes

#### 2. **OnboardingFlow.tsx**
- **Status:** Missing from V2
- **Location:** `backup_2025-09-16_02-21-22/src/components/OnboardingFlow.tsx`
- **Purpose:** Multi-step onboarding for new users
- **Dependencies:**
  - Uses `supabase`, `useAuth`, `analytics`
  - Custom icons: `HeartPulseIcon`, `NotepadIcon`, `GrowthIcon`, `HourglassPersonIcon`, `CommunityIcon`, `TargetIcon`
- **Action Required:** Copy to `src/components/` and integrate into App.tsx

#### 3. **WelcomeModal.tsx**
- **Status:** Missing from V2
- **Purpose:** Welcome flow for new users with personalized recommendations
- **Dependencies:** Custom icons
- **Action Required:** Copy to `src/components/` and integrate

---

## 🗄️ Database Schema Verification

### Core Tables (Must Exist in Supabase)

#### ✅ User Management Tables
1. **user_profiles**
   - Fields: `id`, `user_id`, `full_name`, `pronouns`, `credentials[]`, `language_preference`, `high_contrast`, `larger_text`, `avatar_url`, `created_at`, `updated_at`
   - RLS: ✅ Required
   - Triggers: `initialize_user_profile()`, `update_profile_timestamp()`

2. **user_preferences**
   - Fields: `id`, `user_id`, `preferences` (JSONB), `created_at`, `updated_at`
   - RLS: ✅ Required
   - Triggers: `initialize_user_preferences()`, `update_preferences_timestamp()`

#### ✅ Reflection & Activity Tables
3. **reflection_entries**
   - Fields: `id`, `user_id`, `reflection_id`, `entry_kind`, `team_id`, `session_id`, `data` (JSONB), `created_at`, `updated_at`
   - Indexes: `user_id`, `entry_kind`, `created_at DESC`, `team_id`
   - RLS: ✅ Required

4. **stress_reset_logs**
   - Fields: `id`, `user_id`, `tool_type`, `duration_minutes`, `stress_level_before`, `stress_level_after`, `notes`, `created_at`
   - RLS: ✅ Required

5. **daily_activities**
   - Fields: `id`, `user_id`, `activity_date`, `activities_completed[]`, `created_at`
   - Unique constraint: `(user_id, activity_date)`
   - RLS: ✅ Required

6. **burnout_assessments**
   - Fields: `id`, `user_id`, `assessment_date`, `scores` (JSONB), `risk_level`, `created_at`
   - RLS: ✅ Required

#### ✅ Subscription & Payment Tables
7. **subscriptions**
   - Fields: `id`, `user_id`, `stripe_customer_id`, `stripe_subscription_id`, `status`, `plan_type`, `current_period_start`, `current_period_end`, `cancel_at_period_end`, `created_at`, `updated_at`
   - RLS: ✅ Required

8. **payment_transactions** (if exists)
   - Check for payment history tracking

#### ✅ Enterprise/Organization Tables (if applicable)
9. **organizations**
10. **organization_members**
11. **organization_invitations**
12. **organization_metrics_cache**
13. **organization_alerts**

#### ✅ Additional Tables
14. **user_context_summary** (for Elya AI integration)
15. **email_logs** (for email tracking)
16. **email_preferences** (for notification settings)
17. **terms_acceptances** (for legal compliance)
18. **privacy_consents** (for GDPR compliance)

### Database Functions (Must Exist)

1. **initialize_user_profile()** - Creates profile on user signup
2. **update_profile_timestamp()** - Auto-updates `updated_at`
3. **initialize_user_preferences()** - Creates preferences on signup
4. **update_preferences_timestamp()** - Auto-updates preferences timestamp
5. **get_user_preferences(UUID)** - Returns user preferences
6. **get_user_streak(UUID)** - Calculates activity streak
7. **update_updated_at_column()** - Generic timestamp updater

### Database Views (If Applicable)

1. **user_growth_stats** - Aggregated growth metrics view

---

## 🔧 Service Layer Comparison

### Services That Differ (Need Review)

1. **aiService.ts** - Differences detected, review for compatibility
2. **burnoutPredictionService.ts** - Differences detected
3. **contextReflectionService.ts** - Differences detected
4. **dataSync.ts** - Differences detected
5. **emotionalContagionService.ts** - Differences detected
6. **growthInsightsService.ts** - Differences detected
7. **preAssignmentService.ts** - Differences detected
8. **reflectionService.ts** - Differences detected
9. **stripe.ts** - Differences detected

### New Services in V2 (Verify Integration)

1. **analyticsService.ts** - ✅ New in V2
2. **attestationReceiptService.ts** - ✅ New in V2
3. **burnoutMetricsService.ts** - ✅ New in V2
4. **cognitiveLoadBalancingService.ts** - ✅ New in V2
5. **directSupabaseApi.ts** - ✅ New in V2
6. **emailNotificationService.ts** - ✅ New in V2
7. **emotionalLaborQuantificationService.ts** - ✅ New in V2
8. **enchargeService.ts** - ✅ New in V2
9. **growthInsightsApi.ts** - ✅ New in V2
10. **organizationService.ts** - ✅ New in V2
11. **supportCardService.ts** - ✅ New in V2
12. **termsService.ts** - ✅ New in V2
13. **wellnessMetricsService.ts** - ✅ New in V2

**Action Required:** Review differences in shared services to ensure v2 has all functionality from old site.

---

## 🚀 Supabase Edge Functions

### Functions in Old Site (`backup_2025-09-16_02-21-22/supabase/functions/`)

1. **create-checkout-session/** - Stripe checkout
2. **create-portal-session/** - Stripe customer portal
3. **handle-webhook/** - Stripe webhook handler
4. **send-email/** - Email sending service
5. **send-encharge-event/** - Encharge integration

**Action Required:** Verify these functions exist in current Supabase project and are properly configured.

---

## 📊 Migration Checklist

### Phase 1: Component Migration
- [ ] Copy `EthicsMeaningCheckAccessible.tsx` to v2
- [ ] Copy `OnboardingFlow.tsx` to v2
- [ ] Copy `WelcomeModal.tsx` to v2
- [ ] Integrate components into `App.tsx` routes
- [ ] Test component functionality
- [ ] Verify Supabase integration works

### Phase 2: Database Verification
- [ ] Verify `user_profiles` table exists with all fields
- [ ] Verify `user_preferences` table exists
- [ ] Verify `reflection_entries` table exists with proper indexes
- [ ] Verify `stress_reset_logs` table exists
- [ ] Verify `daily_activities` table exists
- [ ] Verify `burnout_assessments` table exists
- [ ] Verify `subscriptions` table exists
- [ ] Verify all RLS policies are active
- [ ] Verify all triggers are active
- [ ] Verify all functions exist
- [ ] Test data insertion/retrieval

### Phase 3: Service Layer Review
- [ ] Compare `aiService.ts` old vs new
- [ ] Compare `burnoutPredictionService.ts` old vs new
- [ ] Compare `contextReflectionService.ts` old vs new
- [ ] Compare `dataSync.ts` old vs new
- [ ] Compare `emotionalContagionService.ts` old vs new
- [ ] Compare `growthInsightsService.ts` old vs new
- [ ] Compare `preAssignmentService.ts` old vs new
- [ ] Compare `reflectionService.ts` old vs new
- [ ] Compare `stripe.ts` old vs new
- [ ] Ensure no functionality lost in migration

### Phase 4: Edge Functions Verification
- [ ] Verify `create-checkout-session` function exists
- [ ] Verify `create-portal-session` function exists
- [ ] Verify `handle-webhook` function exists
- [ ] Verify `send-email` function exists
- [ ] Verify `send-encharge-event` function exists
- [ ] Test each function with sample data

### Phase 5: Integration Testing
- [ ] Test user registration flow
- [ ] Test reflection saving to Supabase
- [ ] Test stress reset logging
- [ ] Test daily activity tracking
- [ ] Test burnout assessment saving
- [ ] Test subscription creation/management
- [ ] Test Growth Insights data retrieval
- [ ] Test onboarding flow
- [ ] Test welcome modal flow
- [ ] Test ethics/meaning check-in

---

## 🔐 Security & RLS Verification

### Required RLS Policies

For each table, verify these policies exist:

1. **SELECT Policy:** Users can view own data
2. **INSERT Policy:** Users can insert own data
3. **UPDATE Policy:** Users can update own data
4. **DELETE Policy:** Users can delete own data (if applicable)

### Tables Requiring RLS
- ✅ `user_profiles`
- ✅ `user_preferences`
- ✅ `reflection_entries`
- ✅ `stress_reset_logs`
- ✅ `daily_activities`
- ✅ `burnout_assessments`
- ✅ `subscriptions`
- ✅ `user_context_summary`
- ✅ `email_logs`
- ✅ `email_preferences`
- ✅ `terms_acceptances`
- ✅ `privacy_consents`
- ✅ `organizations` (if exists)
- ✅ `organization_members` (if exists)

---

## 📝 SQL Migration Scripts Location

### Old Site SQL Files
- `backup_2025-09-16_02-21-22/supabase/complete_database_setup.sql` - **COMPREHENSIVE SETUP**
- `backup_2025-09-16_02-21-22/supabase/migrations/` - Individual migration files

### Current Site SQL Files
- `CREATE_REFLECTION_TABLES.sql`
- `CREATE_REMAINING_TABLES.sql`
- `supabase/migrations/` - Current migration files

**Action Required:** Compare old `complete_database_setup.sql` with current migrations to ensure nothing is missing.

---

## 🎯 Priority Actions

### High Priority (Do First)
1. ✅ Verify all core tables exist in Supabase
2. ✅ Copy missing components (`EthicsMeaningCheckAccessible`, `OnboardingFlow`, `WelcomeModal`)
3. ✅ Verify RLS policies are active
4. ✅ Test data saving/retrieval

### Medium Priority
1. Review service differences
2. Verify Edge Functions exist
3. Test integration end-to-end

### Low Priority
1. Optimize queries
2. Add missing indexes
3. Performance tuning

---

## 🧪 Testing Strategy

### Unit Tests
- Test each component independently
- Test each service function
- Test database functions

### Integration Tests
- Test component → service → database flow
- Test authentication flow
- Test subscription flow

### End-to-End Tests
- Test complete user journey
- Test reflection saving and retrieval
- Test Growth Insights dashboard
- Test onboarding flow

---

## 📚 Documentation References

- `INTERPRETREFLECT_METHOD.md` - Core methodology
- `InterpretReflect_Setup_Guide.txt` - Setup instructions
- `FEATURE_SUMMARY.md` - Feature list
- `backup_2025-09-16_02-21-22/supabase/RUN_MIGRATIONS.md` - Migration guide

---

## ✅ Success Criteria

Migration is complete when:

1. ✅ All components from old site are in v2
2. ✅ All database tables exist and have proper RLS
3. ✅ All services work correctly with Supabase
4. ✅ All Edge Functions are deployed and working
5. ✅ Data can be saved and retrieved successfully
6. ✅ No functionality is lost from old site
7. ✅ All tests pass

---

## 📞 Next Steps

1. **Review this document** with the team
2. **Execute Phase 1** (Component Migration)
3. **Execute Phase 2** (Database Verification)
4. **Execute Phase 3** (Service Layer Review)
5. **Execute Phase 4** (Edge Functions Verification)
6. **Execute Phase 5** (Integration Testing)
7. **Document any issues** found during migration
8. **Update this document** as migration progresses

---

**Last Updated:** November 8, 2025  
**Status:** In Progress  
**Owner:** Development Team
