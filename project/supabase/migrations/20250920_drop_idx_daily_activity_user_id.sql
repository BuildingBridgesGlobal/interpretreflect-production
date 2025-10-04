-- migrate:transaction: disable
DROP INDEX CONCURRENTLY IF EXISTS public.idx_daily_activity_user_id;