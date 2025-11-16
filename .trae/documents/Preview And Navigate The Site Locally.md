# Objectives

## Scope

* Build the Assignment Collaboration Hub MVP (guest invites, shared prep, vocab, comments).

* Deliver Agency Dashboard v1 (usage metrics, engagement alerts, team heatmap, CSV export).

# Data Model & Security

## Tables

* `assignment_hubs` (id, agency\_id nullable, owner\_id, name, date, notes, created\_at)

* `hub_participants` (hub\_id, user\_id, role: 'owner'|'member'|'guest')

* `hub_materials` (hub\_id, file\_url, filename, size, uploaded\_by, created\_at)

* `hub_vocab` (hub\_id, term, context, added\_by, created\_at)

* `hub_threads` (id, hub\_id, title, created\_by, created\_at)

* `hub_comments` (thread\_id, user\_id, body, created\_at)

* `invite_tokens` (hub\_id, token, expires\_at, max\_uses, used\_count)

## Storage

* Supabase Storage bucket `materials` for uploads; size and type limits enforced client-side.

## RLS

* `assignment_hubs`: owner and participants can select; only owner can delete; insert by owner.

* `hub_participants`: insert by owner; select by hub participants.

* `hub_materials`, `hub_vocab`, `hub_threads`, `hub_comments`: select/insert restricted to hub participants; guests read/write within hub scope.

* `invite_tokens`: select/insert owner; token redeem endpoint validates and inserts `guest` participant.

# Collaboration Hub MVP

## Features

* Create Hub: name, date, notes; auto add owner as participant.

* Guest Invites: generate tokenized link; redeem without signup in guest mode; consent banner and scoped access.

* Shared Prep:

  * Upload materials to `materials` bucket; list/download within hub.

  * Vocabulary builder: add terms, context; list/search.

* Communication:

  * Threads and comments; simple notifications in-page.

* Auto-Journal Prompts: after hub activity, pre-fill Quick Reflect with context tags.

## Pages/Routes

* `/dashboard/hubs`: list hubs

* `/dashboard/hubs/new`: create hub

* `/dashboard/hubs/[id]`: hub detail (materials, vocab, threads)

* `/shared/hubs/[token]`: guest view with consent and scoped features

* `/api/hubs/invite`: POST to create token; `/api/hubs/redeem`: POST to redeem

## Acceptance Criteria

* Owner can create hub and invite; guest can access via token and interact.

* Uploads succeed; vocab and comments persist; all views respect RLS.

* Auto-journal prompt pre-fills Quick Reflect with hub context.

# Agency Dashboard v1

## Features

* Manager view scoped by agency: interpreter seats, usage frequency, engagement drop alerts, high-stress assignment types, team heatmap.

* CSV export for period-selected metrics.

## Pages/Routes

* `/dashboard/agency`: summary cards, charts, heatmap

* `/api/agency/metrics`: aggregated metrics endpoints (week/month ranges)

* `/api/agency/export`: CSV download

## Metrics & Alerts

* Usage: QR completions per interpreter per week

* Engagement Drop: ≥30% WoW drop tile

* High-Stress Types: top assignment types with high load

* Heatmap: interpreters × weeks coloration by activity

## Acceptance Criteria

* Manager login shows scoped data; alerts compute correctly; CSV exports contain expected fields.

# Verification

* Use `/status` and `/api/health` before/after.

* Seed a few hubs and participants; validate guest token flow.

* Confirm RLS policies with authenticated and guest users.

* Manually test CSV exports and dashboard filters.

# Deliverables

* Collaboration Hub MVP pages and APIs.

* Agency Dashboard v1 with metrics, alerts, heatmap, export.

# Timeline

* Implement Collaboration Hub MVP first, then Agency Dashboard v1; both ready within this build window.

