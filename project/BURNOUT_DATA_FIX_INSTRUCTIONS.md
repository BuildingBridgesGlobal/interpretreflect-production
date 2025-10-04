# Fix Daily Burnout Gauge Data Connection

## The Issue

Your `burnout_assessments` table exists in Supabase but has the wrong column structure. The table currently has columns like `burnout_score` and `symptoms`, but the application expects individual metric columns like `energy_tank`, `recovery_speed`, etc.

## The Fix

I've updated the code to work with BOTH table structures, so it should work temporarily. However, for the best experience, you should update your table structure.

### Option 1: Update Existing Table (Recommended)

Run the migration to add the missing columns to your existing table:

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `MIGRATE_BURNOUT_TABLE.sql`
4. Click "Run" to execute the migration

This will:

- Add the new metric columns (energy_tank, recovery_speed, etc.)
- Keep your existing data intact
- Create proper indexes for better performance

### Option 2: Keep Current Structure

The application will now work with your existing table structure by storing the individual metrics in the `symptoms` JSON column. This will work but is less efficient.

## What's Been Fixed in the Code

1. **DailyBurnoutGaugeAccessible.tsx**:
   - Now tries to save with new column structure first
   - Falls back to old structure (symptoms JSON) if columns don't exist
   - Provides helpful error messages

2. **App.tsx**:
   - Now loads data from both table structures
   - Automatically detects which structure your table uses
   - Converts data to the format the charts expect

## Testing the Fix

1. Complete a Daily Burnout Gauge assessment
2. Check the Daily Burnout Trend chart - you should see your new entry
3. The chart will display real data from your assessments

## Verification

After running the migration (Option 1), you can verify the columns exist:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'burnout_assessments'
ORDER BY ordinal_position;
```

You should see columns like:

- energy_tank (integer)
- recovery_speed (integer)
- emotional_leakage (integer)
- performance_signal (integer)
- tomorrow_readiness (integer)

## Need Help?

If you continue to have issues after following these steps, check:

1. The browser console for any error messages
2. The Supabase logs for database errors
3. Ensure Row Level Security (RLS) is properly configured
