# Supabase Setup Guide for InterpretReflect

## Prerequisites
1. A Supabase account (free tier is fine)
2. A Supabase project created

## Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with: `eyJ...`)

## Step 2: Configure Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`):

```bash
cp .env.example .env
```

2. Add your Supabase credentials to `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Create Database Tables

### Option A: Using SQL Editor (Recommended)

1. In your Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/create_tables.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned" for each CREATE statement

### Option B: Manual Table Creation

If you prefer to create tables manually through the UI:

1. Go to **Table Editor** in Supabase
2. Create each table with the following structures:

#### reflections table
- `id` (uuid, primary key, default: uuid_generate_v4())
- `user_id` (uuid, foreign key to auth.users)
- `reflection_type` (text, not null)
- `type` (text, nullable)
- `answers` (jsonb, not null)
- `content` (jsonb, nullable)
- `status` (text, default: 'completed')
- `metadata` (jsonb, nullable)
- `session_id` (text, nullable)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

#### reflection_events table
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `event_type` (text, not null)
- `reflection_id` (uuid, foreign key to reflections)
- `reflection_type` (text, nullable)
- `created_at` (timestamptz, default: now())

#### growth_insights table
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `insight_type` (text, nullable)
- `data` (jsonb, nullable)
- `metadata` (jsonb, nullable)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

#### user_growth_metrics table
- `user_id` (uuid, primary key, foreign key to auth.users)
- `preparedness_score` (decimal)
- `self_awareness_level` (decimal)
- `role_clarity_score` (decimal)
- `ethical_awareness_score` (decimal)
- `growth_mindset_score` (decimal)
- `resilience_score` (decimal)
- `overall_progress` (decimal)
- `last_assessment` (timestamptz)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

#### context_metrics table
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `context_type` (text, not null)
- `metrics` (jsonb, not null)
- `last_updated` (timestamptz, default: now())

## Step 4: Enable Row Level Security (RLS)

**IMPORTANT**: RLS must be enabled for security!

1. Go to **Authentication** → **Policies**
2. For each table, enable RLS:
   - Click on the table name
   - Toggle **Enable RLS** to ON
   - Add policies (the SQL script does this automatically)

Or run this SQL:
```sql
-- Enable RLS on all tables
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflection_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_growth_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_metrics ENABLE ROW LEVEL SECURITY;
```

## Step 5: Verify Setup

### Check Tables Were Created

Run this query in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- reflections
- reflection_events
- growth_insights
- user_growth_metrics
- context_metrics
- (and other tables)

### Check RLS is Enabled

Run this query:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('reflections', 'reflection_events', 'growth_insights', 'user_growth_metrics', 'context_metrics');
```

All `rowsecurity` values should be `true`.

## Step 6: Test the Connection

1. Start your development server:
```bash
npm run dev
```

2. Open browser console (F12)
3. Look for any Supabase errors
4. Try creating a user account
5. Complete a reflection
6. Check Supabase dashboard to see if data appears

## Step 7: Verify Data is Being Saved

1. In Supabase Dashboard, go to **Table Editor**
2. Click on `reflections` table
3. Complete a reflection in your app
4. Refresh the table view - you should see the new reflection

## Troubleshooting

### "Missing Supabase credentials" warning
- Make sure `.env` file exists and has correct values
- Restart the dev server after changing `.env`

### "Failed to save reflection" error
- Check that all tables are created
- Verify RLS policies are set up
- Check browser console for specific error messages

### No data appearing in Supabase
- Ensure user is authenticated
- Check RLS policies allow insert
- Verify `.env` variables are loaded (check `console.log(import.meta.env.VITE_SUPABASE_URL)`)

### Authentication issues
1. Go to **Authentication** → **Settings**
2. Enable **Email** provider
3. Disable email confirmation for testing (optional)

### RLS Policy errors
If you get "new row violates row-level security policy" errors:

1. Make sure you're authenticated
2. Check the policies are correct:
```sql
-- Example: Users can insert their own reflections
CREATE POLICY "Users can insert own reflections" ON reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Step 8: Production Considerations

Before going to production:

1. **Enable email confirmation** in Authentication settings
2. **Review and tighten RLS policies** as needed
3. **Set up database backups** (Supabase does daily backups on Pro plan)
4. **Monitor usage** to stay within plan limits
5. **Add indexes** for frequently queried columns
6. **Set up monitoring** for errors and performance

## Common SQL Queries for Monitoring

### Check reflection counts by user
```sql
SELECT 
  user_id, 
  COUNT(*) as reflection_count,
  MAX(created_at) as last_reflection
FROM reflections
GROUP BY user_id
ORDER BY reflection_count DESC;
```

### View recent reflections
```sql
SELECT 
  id,
  user_id,
  reflection_type,
  created_at
FROM reflections
ORDER BY created_at DESC
LIMIT 10;
```

### Check context distribution
```sql
SELECT 
  metadata->>'context_type' as context,
  COUNT(*) as count
FROM reflections
WHERE metadata->>'context_type' IS NOT NULL
GROUP BY metadata->>'context_type';
```

## Next Steps

1. ✅ Tables created and RLS enabled
2. ✅ Environment variables configured
3. ✅ Test data saving and retrieval
4. 📝 Monitor usage and performance
5. 🚀 Deploy to production when ready

## Support

If you encounter issues:
1. Check Supabase logs: **Logs** → **API Logs**
2. Review browser console for errors
3. Verify all steps above were completed
4. Check that your Supabase project is not paused (free tier pauses after 1 week of inactivity)