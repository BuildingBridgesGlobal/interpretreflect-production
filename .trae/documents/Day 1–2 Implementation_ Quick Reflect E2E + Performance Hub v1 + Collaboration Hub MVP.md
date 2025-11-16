# Objectives

## Scope (Next 2 Days)
- Day 1: Validate Quick Reflect end-to-end, add trend preview, and ship Performance Intelligence Hub v1 (core charts + manual alert rules).
- Day 2: Build Collaboration Hub MVP (assignment hubs, guest invites, shared prep) and Agency Dashboard v1 (usage metrics, engagement drop alerts, heatmaps).

# Environment & Connectivity

## Checks
- Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` match Supabase project.
- Verify Row Level Security for `public.quick_reflect_entries` permits inserts for authenticated users.
- Ensure client uses `@supabase/ssr` browser/server clients (already present) and no service role key is exposed to the browser.

# Day 1 Implementation

## Quick Reflect E2E
- Validate auth redirect and persisted offline draft behavior.
- Ensure `insert` to `quick_reflect_entries` succeeds and shows confirmation.
- Add a minimal trend preview card: shows last 5 entries (cognitive load + performance) with simple sparkline.

## Performance Intelligence Hub v1
- Data fetch layer: create server route(s) under `src/app/api/metrics/*` or server component loaders to aggregate:
  - Cognitive load over time (daily/weekly/monthly)
  - Stress trigger frequency
  - Assignment-type correlations (average load/performance by type)
- Charts: check for an existing chart library; if none, use lightweight components (SVG/Canvas) for line/bar visuals to avoid adding new deps.
- Manual alert rules v1:
  - Engagement drop: ≥30% reduction in weekly Quick Reflect completions
  - High-stress trend: specific trigger appearing in ≥40% of recent entries
  - Spike alert: average cognitive load ≥4 in last 3 entries
- UI: `src/app/dashboard/performance/page.tsx` renders 3 core graphs, alert tiles, and filters.

## Acceptance Criteria (Day 1)
- Quick Reflect inserts succeed for authenticated users and trend preview renders.
- Performance Hub loads within ≤200ms for cached queries; three core charts present.
- Alert rules compute correctly against the user’s data set and visually indicate status.

# Day 2 Implementation

## Collaboration Hub MVP
- Create Assignment Hub entity (name, date, participants, materials).
- Guest invite links: tokenized link for teammate access (guest mode), consent banner.
- Shared vocabulary builder and file uploads (size-limited, using Supabase Storage if enabled).
- Threaded comments and auto-journal prompts for both users.

## Agency Dashboard v1
- Manager login and scoping (multi-tenancy: agency -> interpreter seats).
- Metrics: usage frequency, engagement drop alerts, high-stress assignment types, team heatmap.
- CSV export for reports.

## Acceptance Criteria (Day 2)
- Collaboration Hub: invite flow converts guests, core shared prep features working.
- Agency Dashboard: renders team metrics for an agency, basic alert tiles, export operational.

# Verification & Safety

## Tests & Validation
- Add integration checks for Supabase calls in server routes and components.
- Use `/status` and `/api/health` to confirm environment keys and DB accessibility before/after changes.
- No secrets exposed; only `NEXT_PUBLIC_*` keys used client-side.

# Deliverables
- Performance Hub v1 with three charts and alert rules.
- Quick Reflect trend preview card.
- Collaboration Hub MVP with invites and shared prep features.
- Agency Dashboard v1 with usage metrics and CSV export.

# Timeline
- Day 1: Performance Hub v1 + Quick Reflect E2E + alerts
- Day 2: Collaboration Hub MVP + Agency Dashboard v1

Confirm to proceed and I’ll implement, verify locally, and keep the server available for live review.