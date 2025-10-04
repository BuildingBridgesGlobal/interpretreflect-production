# Growth Insights Database Setup Guide

## ✅ Complete Supabase Integration for Growth Insights

This guide will help you set up the database tables needed for the fully functional Growth Insights dashboard with proper user data isolation.

## What This Setup Provides

- **User Data Isolation**: Each user only sees their own data
- **Complete Tracking**: All reflections, stress resets, and activities are saved
- **Streak Calculation**: Automatic daily streak tracking
- **Growth Metrics**: Comprehensive analytics for each user
- **Security**: Row Level Security (RLS) ensures data privacy

## Step 1: Run the Migration

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy the entire contents of `migrations/growth_insights_tables.sql`
4. Paste and run the SQL

## Step 2: Verify Tables Were Created

After running the migration, you should see these tables in your Supabase dashboard:

- `reflection_entries` - Stores all reflection data
- `stress_reset_logs` - Tracks stress reset activities
- `daily_activity` - Records daily usage for streaks
- `burnout_assessments` - Stores burnout risk data

## Step 3: Test the Integration

1. Log into your app with a user account
2. Complete any reflection or stress reset activity
3. Check the Supabase dashboard - you should see the data appear in the tables
4. Go to Growth Insights - it should now show your real data!

## How Data Flows

```
User completes activity → App saves to Supabase → Growth Insights reads data → Dashboard updates
```

## Features Now Working

### ✅ Reflection Tracking

- All reflection tools save to `reflection_entries`
- Each entry is tagged with `entry_kind` for filtering
- Full JSON data is preserved in the `data` column

### ✅ Stress Reset Tracking

- Every stress reset technique is logged
- Duration and effectiveness are tracked
- Before/after stress levels are recorded

### ✅ Streak Tracking

- Daily activity is automatically recorded
- Streaks are calculated in real-time
- Current and longest streaks are tracked

### ✅ User Isolation

- Row Level Security ensures users only see their own data
- No data leakage between accounts
- Secure multi-tenant architecture

## Troubleshooting

### If tables aren't created:

- Make sure you're using the correct Supabase project
- Check that you have admin permissions
- Look for any error messages in the SQL editor

### If data isn't saving:

- Verify user authentication is working
- Check browser console for errors
- Ensure Supabase URL and anon key are correct in `.env`

### If Growth Insights is empty:

- Complete at least one reflection or activity
- Refresh the page after saving data
- Check that the user is properly authenticated

## Migration Rollback (if needed)

To remove all tables and start over:

```sql
DROP TABLE IF EXISTS reflection_entries CASCADE;
DROP TABLE IF EXISTS stress_reset_logs CASCADE;
DROP TABLE IF EXISTS daily_activity CASCADE;
DROP TABLE IF EXISTS burnout_assessments CASCADE;
DROP VIEW IF EXISTS user_growth_stats CASCADE;
DROP FUNCTION IF EXISTS get_user_streak(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

## Success Indicators

You'll know everything is working when:

1. ✅ Tables appear in Supabase dashboard
2. ✅ Data saves when you complete activities
3. ✅ Growth Insights shows real metrics
4. ✅ Different users see only their own data
5. ✅ Streaks update daily
6. ✅ All charts and graphs populate with data

## Next Steps

After setup is complete:

1. Test with multiple user accounts to verify isolation
2. Complete various activities to populate the dashboard
3. Monitor the Supabase dashboard for data flow
4. Enjoy your fully functional Growth Insights!

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure Supabase project is active
4. Review RLS policies in Supabase dashboard

Your Growth Insights dashboard is now fully integrated with Supabase! 🎉
