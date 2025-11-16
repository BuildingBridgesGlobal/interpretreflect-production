# Database Setup Instructions

## Apply Database Migrations to Supabase

To get your InterpretReflect V2 platform fully operational, you need to apply the database schema to your Supabase project.

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase SQL Editor**
   - Visit https://supabase.com/dashboard
   - Select your project: `kvguxuxanpynwdffpssm`
   - Click on "SQL Editor" in the left sidebar

2. **Run the Migration**
   - Click "New Query"
   - Copy the entire contents of `supabase/migrations/20250111000001_initial_schema.sql`
   - Paste into the SQL editor
   - Click "Run" (or press Ctrl+Enter)

3. **Verify Success**
   - You should see a success message
   - Go to "Table Editor" in the sidebar
   - Verify these tables were created:
     - `profiles`
     - `baseline_checks`
     - `quick_reflect_entries`
     - `skill_builder_progress`
     - `catalyst_conversations`
     - `performance_analytics`

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Initialize Supabase (if not already done)
npx supabase init

# Link to your remote project
npx supabase link --project-ref kvguxuxanpynwdffpssm

# Push migrations
npx supabase db push
```

## What This Migration Creates

The migration sets up your complete V2 database schema with:

### Core Tables
- **profiles** - User data, subscriptions, preferences
- **baseline_checks** - Daily performance check-ins
  - Cognitive Load (reframed from "stress")
  - Capacity Reserve (reframed from "energy")
  - Performance Readiness (reframed from "mood")
  - Recovery Quality (reframed from "sleep")

- **quick_reflect_entries** - Post-assignment reflections
  - Assignment details, duration, type
  - Performance & cognitive load ratings
  - Challenges, successes, vocabulary
  - AI-generated insights

- **skill_builder_progress** - CEU module tracking
- **catalyst_conversations** - AI chat history
- **performance_analytics** - Aggregated metrics cache

### Security Features
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Auto-profile creation on signup
- Proper foreign key relationships

### Performance Optimizations
- Indexes on frequently queried columns
- Materialized views for analytics
- Efficient date-based lookups

## After Migration

Once the migration is complete, you can:

1. **Create a test account** at http://localhost:3000/auth/signup
2. **Complete verification** via the email link
3. **Access the dashboard** and start using:
   - Quick Reflect (post-assignment check-ins)
   - Baseline Check (daily performance tracking)
   - Performance Hub (analytics & insights)
   - Catalyst AI (performance coaching)
   - Skill Builders (CEU modules)

## Troubleshooting

**Error: "relation already exists"**
- Some tables may already exist from previous setup
- Either drop the existing tables first, or comment out the problematic CREATE TABLE statements

**Error: "permission denied"**
- Make sure you're using the correct Supabase project
- Verify your API keys in `.env.local` are correct

**Error: "function does not exist"**
- Make sure you run the entire migration file, including the functions at the end

## Need Help?

If you encounter issues:
1. Check the Supabase dashboard logs
2. Verify your environment variables are correct
3. Ensure the migration file ran completely without errors
