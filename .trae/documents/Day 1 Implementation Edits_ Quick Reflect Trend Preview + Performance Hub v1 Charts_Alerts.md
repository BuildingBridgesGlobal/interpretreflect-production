# Files To Update
- `src/app/dashboard/quick-reflect/page.tsx`: add a TrendPreview section below the form header showing last 5 entries and mini-stats.
- `src/app/dashboard/performance/page.tsx`: add three lightweight charts and manual alerts computed from existing reflections data.

# Quick Reflect Trend Preview
- Fetch last 5 entries for the authenticated user via existing Supabase client.
- Render a sparkline (SVG path) for `cognitive_load_rating` and `performance_rating` over time.
- Show mini-stats: avg cognitive load (5), avg performance (5), last-entry deltas.
- Guard for no data (informational state encouraging first Quick Reflect).

# Performance Intelligence Hub v1 (Charts)
- Chart 1: Load Over Time
  - Aggregate reflections by day; render line chart (SVG) for average `cognitive_load_rating`.
- Chart 2: Stress Frequency
  - Flatten `challenge_areas`; render horizontal bar chart of top 5 triggers.
- Chart 3: Assignment-Type Correlations
  - Compute averages per `assignment_type`; render a dual bar chart (load vs performance) or small multiples.
- Keep charts dependency-free (SVG/Canvas) to avoid new packages.

# Manual Alerts (v1)
- Engagement Drop: compare QR count last 7 days vs previous 7; show alert if drop ≥30%.
- High-Stress Trend: if a single challenge appears in ≥40% of last 10 entries.
- Load Spike: if average `cognitive_load_rating` ≥4 across last 3 entries.
- Display alert tiles with color coding and brief guidance.

# Acceptance Criteria
- Trend preview renders when ≥5 entries exist; sparkline and mini-stats visible.
- Performance Hub shows 3 charts; loads quickly and updates with the time range control.
- Alert tiles compute from user data and update when time range changes.

# Verification
- Use existing `/status` and `/api/health` to confirm environment and DB reachability.
- Validate Supabase queries return expected shapes; verify auth gating redirects appropriately.
- Review on `http://localhost:3000/dashboard/quick-reflect` and `http://localhost:3000/dashboard/performance`.

# Timeline
- Implement Quick Reflect trend preview first, then Performance Hub charts and alerts in the same session.

Confirm and I’ll implement these edits and verify live.