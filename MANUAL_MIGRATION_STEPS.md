# Manual Migration Steps for Supabase

Since the database password has special characters, we'll run migrations through the Supabase Dashboard SQL Editor.

## Step 1: Run CEU System Migration

1. Go to: https://supabase.com/dashboard/project/kvguxuxanpynwdffpssm/sql
2. Click "New query"
3. Copy the contents of: `supabase/migrations/20251106_create_ceu_system.sql`
4. Paste into SQL Editor
5. Click "Run" (or press Ctrl+Enter)
6. Verify success (should show "Success. No rows returned")

## Step 2: Run Wellness & Community Migration

1. In the same SQL Editor
2. Copy the contents of: `supabase/migrations/20251106_add_wellness_community_schema.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify success

## Step 3: Verify Tables Were Created

Run this query to confirm all tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see these new tables:
- ceu_programs
- ceu_enrollments
- ceu_completions
- ceu_activity_log
- user_profiles
- certifications
- wellness_check_ins
- skill_assessments
- learning_paths
- glossary_terms
- community_posts
- community_comments
- peer_connections

## Alternative: Use Supabase CLI with Escaped Password

If you want to use CLI instead, URL-encode the password:

```bash
# Your password: ISAKandCJBailyAREtheGOAT/!@
# URL-encoded: ISAKandCJBailyAREtheGOAT%2F%21%40

npx supabase db push --db-url "postgresql://postgres:ISAKandCJBailyAREtheGOAT%2F%21%40@db.kvguxuxanpynwdffpssm.supabase.co:5432/postgres"
```

## After Migrations Complete

Come back to me and I'll help you:
1. Build the onboarding flow
2. Create wellness check-in system
3. Build community forum
4. Set up certification tracking

Let me know when you're ready for Step 2! 🚀
