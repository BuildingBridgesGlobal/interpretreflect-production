# Objectives

## Day 1
- Implement Quick Reflect trend preview (last 5 entries: cognitive load + performance).
- Build Performance Intelligence Hub v1 (3 charts + manual alerts).

## Day 2
- Ship Collaboration Hub MVP (assignment hubs, guest invites, shared prep).
- Deliver Agency Dashboard v1 (usage, engagement drop alerts, heatmaps, CSV export).

# Implementation Details

## Quick Reflect Trend Preview
- Query `quick_reflect_entries` for current user.
- Render micro-sparkline and mini-stats (avg load, avg performance, last entry delta).
- Persist draft state (already enabled) and ensure seamless auth redirect.

## Performance Intelligence Hub v1
- Data layer: server components or `/api/metrics/*` endpoints:
  - `load_over_time`: daily/weekly averages for cognitive load.
  - `stress_frequency`: counts of triggers over last N entries.
  - `assignment_correlations`: averages by assignment type (load vs performance).
- Charts: lightweight line/bar visuals; avoid new deps unless present.
- Alerts (manual v1):
  - Engagement drop ≥30% week-over-week in QR completions.
  - High-stress trigger appears in ≥40% recent entries.
  - Average cognitive load ≥4 across last 3 entries.

## Collaboration Hub MVP (Day 2)
- Model: assignment hub (name, date, participants, materials, vocab, threads).
- Guest invites: tokenized links, consent banner, scoped access.
- Shared vocab/file uploads (size-limited; use Supabase Storage if enabled).
- Threaded comments and auto-journal prompts for both participants.

## Agency Dashboard v1 (Day 2)
- Multi-tenancy scoping (agency -> seats).
- Metrics: usage frequency, engagement drop alerts, high-stress types, team heatmap.
- Reports: CSV export.

# Acceptance Criteria
- Trend preview renders after 5+ entries and updates in real time.
- Performance Hub shows 3 charts with ≤200ms load for cached queries.
- Alerts compute correct states against sample data.
- Collaboration Hub supports invite → guest access and shared prep basics.
- Agency Dashboard lists team metrics with exports working.

# Verification
- Use `/status` and `/api/health` before/after changes.
- Add minimal integration checks for Supabase queries.
- Validate auth/tenancy and ensure no service role keys leak client-side.

# Deliverables
- Quick Reflect trend preview.
- Performance Hub v1 with charts and alerts.
- Collaboration Hub MVP.
- Agency Dashboard v1.

# Timeline
- Day 1: Trend preview + Performance Hub v1.
- Day 2: Collaboration Hub MVP + Agency Dashboard v1.