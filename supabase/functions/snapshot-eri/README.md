# ERI Snapshot Edge Function

This function runs nightly to persist the current `user_eri` values into the `eri_snapshots` table, giving you a time-series of ERI scores for trend analysis and alerts.

## Deploy

```bash
supabase functions deploy snapshot-eri --no-verify-jwt
```

## Schedule

In Supabase Dashboard → **Cron Jobs**:  
Add a new cron entry:

```
0 2 * * *  # 2 AM UTC daily
POST https://<project-ref>.supabase.co/functions/v1/snapshot-eri
```

## Manual test

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/snapshot-eri
```

## Result

Each successful run appends one row per active user to `eri_snapshots`, letting you graph ERI trends, trigger alerts, or feed predictive models.