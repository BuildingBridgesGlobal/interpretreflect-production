# Database Migration Instructions
**Assignment Prep Feature - Database Setup**

---

## Quick Start (2 minutes)

### Option 1: Via Supabase Dashboard (Easiest)

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `kvguxuxanpynwdffpssm`
3. **Navigate to SQL Editor**: Left sidebar → SQL Editor
4. **Create New Query**: Click "+ New Query"
5. **Copy Migration SQL**:
   - Open `supabase/migrations/20250111000002_assignments_feature.sql`
   - Copy entire contents (Ctrl+A, Ctrl+C)
6. **Paste into SQL Editor**: Ctrl+V
7. **Run Query**: Click "Run" button or press Ctrl+Enter
8. **Verify Success**: Check for success message

**Expected Output**:
```
Assignment Prep feature migration completed successfully
Tables created: assignments, assignment_attachments, assignment_resources, assignment_shares, shared_assignment_notes
RLS policies applied to all tables
Ready for application development
```

### Option 2: Via Supabase CLI

```bash
# If you have Supabase CLI installed
cd c:\Users\maddo\Desktop\boltV1IR
supabase db push
```

---

## Verification Steps

After running the migration, verify tables were created:

### Check Tables Exist

Run this query in SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'assignments',
    'assignment_attachments',
    'assignment_resources',
    'assignment_shares',
    'shared_assignment_notes'
  );
```

**Expected Result**: 5 rows (one for each table)

### Check RLS is Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'assignments',
    'assignment_attachments',
    'assignment_resources',
    'assignment_shares',
    'shared_assignment_notes'
  );
```

**Expected Result**: All tables should have `rowsecurity = true`

### Test Basic Functionality

Try creating a test assignment (will fail gracefully if not logged in):

```sql
-- This should work if you're authenticated
INSERT INTO assignments (
  creator_id,
  primary_interpreter_id,
  assignment_name,
  assignment_type,
  assignment_date,
  start_time,
  end_time
) VALUES (
  auth.uid(), -- Your user ID
  auth.uid(),
  'Test Assignment',
  'conference',
  CURRENT_DATE + INTERVAL '1 day',
  '10:00:00',
  '11:00:00'
);

-- Clean up test data
DELETE FROM assignments WHERE assignment_name = 'Test Assignment';
```

---

## Troubleshooting

### Error: "relation already exists"

**Cause**: Tables were already created in a previous migration attempt

**Solution**: Tables exist! You're good to go. Skip to [Verification Steps](#verification-steps)

### Error: "permission denied"

**Cause**: User lacks permissions to create tables

**Solution**:
1. Check you're logged into the correct Supabase project
2. Ensure your user has `postgres` or admin role
3. Try via Supabase Dashboard instead of CLI

### Error: "function auth.uid() does not exist"

**Cause**: Supabase Auth extension not enabled

**Solution**:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Migration Runs But Tables Don't Appear

**Cause**: Wrong schema selected

**Solution**: Check `public` schema:
```sql
SET search_path TO public;
```

---

## Migration Details

### What Gets Created

**5 Tables**:
1. `assignments` - Core assignment data (24 columns)
2. `assignment_attachments` - File uploads (7 columns)
3. `assignment_resources` - External links (6 columns)
4. `assignment_shares` - Magic link sharing (13 columns)
5. `shared_assignment_notes` - Collaboration notes (7 columns)

**Indexes** (12 total):
- Performance optimizations for common queries
- Unique constraints on share tokens
- Soft delete filtering

**RLS Policies** (16 total):
- Users can only see their own assignments
- Public can view shared assignments via valid token
- Shared users can add notes if they have edit access

**Functions** (2 total):
- `generate_sharing_token()` - Secure token generation
- `update_updated_at_column()` - Auto-update timestamps

**Triggers** (2 total):
- Auto-update `updated_at` on assignments
- Auto-update `updated_at` on assignment_shares

---

## Rollback (If Needed)

If you need to undo the migration:

```sql
-- Drop tables (cascades to related data)
DROP TABLE IF EXISTS shared_assignment_notes CASCADE;
DROP TABLE IF EXISTS assignment_shares CASCADE;
DROP TABLE IF EXISTS assignment_resources CASCADE;
DROP TABLE IF EXISTS assignment_attachments CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS generate_sharing_token();
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

**⚠️ WARNING**: This deletes ALL assignment data. Only use in development!

---

## Next Steps

After successful migration:

1. ✅ **Verify Tables** - Run verification queries above
2. ✅ **Test in App** - Navigate to `/dashboard/assignments`
3. ✅ **Create Test Assignment** - Use the "New Assignment" button
4. ✅ **Test Sharing** - Create assignment, click "Share" button
5. ✅ **Check Dev Console** - Look for any errors

---

## Support

**Migration Issues**:
- Check Supabase logs: Dashboard → Logs → Postgres Logs
- Review error messages in SQL Editor
- Contact: sarah@interpretreflect.com

**Schema Questions**:
- See: `docs/feature-specs/ASSIGNMENT_PREP_SPEC.md`
- Database schema section has full ERD

---

**Migration File**: `supabase/migrations/20250111000002_assignments_feature.sql`
**Created**: January 11, 2025
**Status**: Production-ready (tested in development)
