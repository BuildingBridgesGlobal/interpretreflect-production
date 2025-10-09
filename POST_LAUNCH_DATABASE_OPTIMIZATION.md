# Post-Launch Database Optimization Plan

**Timeline**: 7-30 days AFTER beta launch
**Status**: SCHEDULED (Do NOT run before launch)

---

## ⏰ When to Start

**Week 1-2 Post-Launch**: Monitor & Collect Data
- Let beta users create real traffic patterns
- Gather query performance metrics
- Identify slow queries

**Week 3-4 Post-Launch**: Analysis & Optimization
- Review pg_stat_statements data
- Identify unused indexes
- Consolidate RLS policies
- Optimize based on evidence

---

## Phase 1: Enable Monitoring (Day 1 Post-Launch)

### Step 1: Enable pg_stat_statements in Supabase

```sql
-- Run this in Supabase SQL Editor
-- Enables query statistics tracking
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Verify it's enabled
SELECT * FROM pg_available_extensions WHERE name = 'pg_stat_statements';
```

### Step 2: Baseline Current Performance

```sql
-- Get current table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) as bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Get current index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

---

## Phase 2: Monitor for 7 Days (Week 1-2)

### Metrics to Track

**Query Performance:**
```sql
-- Find slow queries (run after 7 days of traffic)
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time,
    rows
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- queries taking >100ms on average
ORDER BY mean_exec_time DESC
LIMIT 20;
```

**Index Usage:**
```sql
-- Find unused indexes (run after 7 days)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0  -- Never used
  AND indexrelid NOT IN (
    SELECT indexrelid FROM pg_index WHERE indisprimary  -- Exclude primary keys
  )
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Table Access Patterns:**
```sql
-- See which tables are accessed most
SELECT
    schemaname,
    relname as table_name,
    seq_scan as sequential_scans,
    idx_scan as index_scans,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows
FROM pg_stat_user_tables
ORDER BY seq_scan + idx_scan DESC
LIMIT 20;
```

---

## Phase 3: Analysis (Week 3)

### Current Indexes to Review

Based on your schema, review these indexes:

```sql
-- Burnout Assessments Indexes
idx_burnout_user_id          -- ON burnout_assessments(user_id)
idx_burnout_date             -- ON burnout_assessments(assessment_date DESC)
idx_burnout_user_date        -- ON burnout_assessments(user_id, assessment_date DESC)

-- Reflection Entries Indexes
idx_reflection_user_id       -- ON reflection_entries(user_id)
idx_reflection_entry_kind    -- ON reflection_entries(entry_kind)
idx_reflection_created_at    -- ON reflection_entries(created_at DESC)

-- Stress Reset Logs Indexes
idx_stress_user_id          -- ON stress_reset_logs(user_id)
idx_stress_tool_type        -- ON stress_reset_logs(tool_type)
idx_stress_created_at       -- ON stress_reset_logs(created_at DESC)

-- Daily Activity Indexes
idx_activity_user_id        -- ON daily_activity(user_id)
idx_activity_date           -- ON daily_activity(activity_date DESC)
```

### Questions to Answer:

1. **Duplicate Indexes?**
   - Is `idx_burnout_user_id` redundant with `idx_burnout_user_date`? (composite index covers single column)

2. **Unused Indexes?**
   - Check if `idx_reflection_entry_kind` is ever used in queries
   - Check if `idx_stress_tool_type` is needed

3. **Missing Indexes?**
   - Are there frequent queries not using indexes?

---

## Phase 4: Optimization Actions (Week 4)

### A. Remove Unused Indexes (ONLY if confirmed unused)

```sql
-- Example: Drop unused indexes (DO NOT run blindly - check usage first!)
-- DROP INDEX IF EXISTS idx_stress_tool_type;  -- Only if idx_scan = 0 for 2 weeks
-- DROP INDEX IF EXISTS idx_reflection_entry_kind;  -- Only if never used
```

### B. Remove Duplicate Indexes

```sql
-- Check for duplicate coverage
-- If idx_burnout_user_date covers all uses of idx_burnout_user_id, consider:
-- DROP INDEX IF EXISTS idx_burnout_user_id;  -- Composite index covers this
```

### C. Add Missing Indexes (if needed)

```sql
-- Example: If you find slow queries on subscriptions status + user_id
-- CREATE INDEX idx_subscriptions_user_status
--   ON subscriptions(user_id, status)
--   WHERE status IN ('active', 'trialing', 'past_due');
```

### D. Consolidate RLS Policies

Check for duplicate or overlapping policies:

```sql
-- View all RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- Look for:
-- 1. Duplicate policies with same logic
-- 2. Policies that could be combined
-- 3. Unused policies
```

---

## Phase 5: Vacuum & Analyze

After making changes:

```sql
-- Full vacuum and analyze
VACUUM FULL ANALYZE;

-- Or per table
VACUUM FULL ANALYZE burnout_assessments;
VACUUM FULL ANALYZE reflection_entries;
-- etc.
```

---

## Safety Checklist

Before dropping ANY index:

- [ ] Verify index has idx_scan = 0 for at least 14 days
- [ ] Confirm no critical queries use it (check pg_stat_statements)
- [ ] Test in staging environment first
- [ ] Have backup ready
- [ ] Drop during low-traffic hours
- [ ] Monitor performance after

Before dropping ANY RLS policy:

- [ ] Confirm policy is redundant or superseded
- [ ] Test in staging
- [ ] Verify no security implications
- [ ] Document reason for removal

---

## Expected Outcomes

### Performance Improvements:
- 10-30% reduction in index storage
- Faster INSERT/UPDATE operations (fewer indexes to update)
- Improved cache hit ratio (less to cache)
- Cleaner query plans

### Maintenance Benefits:
- Simpler RLS policy set
- Easier debugging
- Reduced backup size
- Lower costs (Supabase usage)

---

## Monitoring After Optimization

```sql
-- Compare before/after
-- Table sizes
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size('public.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size('public.'||tablename) - pg_relation_size('public.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- Query performance trends
SELECT
    left(query, 50) as query_start,
    calls,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;
```

---

## Timeline Summary

| Week | Action | Status |
|------|--------|--------|
| Week 1-2 | Monitor & collect metrics | After beta launch |
| Week 3 | Analyze data, identify optimizations | After data collection |
| Week 4 | Execute optimizations (carefully) | After analysis |
| Week 5+ | Monitor results, adjust as needed | Ongoing |

---

## Decision Tree

```
Has beta been running for 7+ days?
├─ No → WAIT, keep monitoring
└─ Yes → Has pg_stat_statements data?
    ├─ No → Enable it, wait another 7 days
    └─ Yes → Found unused indexes (idx_scan = 0)?
        ├─ No → No action needed, database is optimized
        └─ Yes → Found duplicates or issues?
            ├─ No → Keep monitoring
            └─ Yes → Test in staging → Execute cleanup
```

---

## ⚠️ CRITICAL WARNINGS

1. **DO NOT run this optimization before beta launch**
2. **DO NOT drop indexes without 14 days of production data**
3. **DO NOT skip testing in staging first**
4. **DO NOT optimize during high-traffic periods**
5. **ALWAYS have backups before making changes**

---

## Document Updates

- **Created**: October 9, 2025
- **Review Date**: [7 days after beta launch]
- **Execute Date**: [3-4 weeks after beta launch]
- **Status**: SCHEDULED (awaiting beta launch + traffic data)

---

**Remember**: Your database is already well-structured and performant for beta launch. This optimization is about fine-tuning based on REAL usage patterns, not fixing problems. Don't optimize prematurely!
