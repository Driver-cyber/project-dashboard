# DECISIONS.md — Project Dashboard Decision Log
*Living document. Most recent entries at the top.*
*Stable architecture lives in CLAUDE.md. This file tracks the "why we got here."*

---

## 🎯 Current Phase
**Phase 2 — Quality of life**
Phase 1 complete as of 2026-04-23. Next: card GitHub links, R-to-refresh keyboard shortcut, auto-discovery of tracker files across Driver-cyber repos.

---

## 📝 Decision Log

### [2026-04-23] — Phase 1 complete · expandable cards shipped

**Phase 1 declared done.** All founding priorities delivered:
- Live GitHub API fetch replacing localStorage
- Cloudflare Pages auto-deploy at project-dashboard-6a7.pages.dev
- 5 project cards live (kasette, tiny-path, cadence, ORDOBook, project-dashboard)
- Garden Party restyle (Instrument Serif, Geist, sage/paper/ink tokens, light/dark)
- Expandable cards — click any card to reveal its full backlog inline

**Expandable cards decision:**
- In-place expand (no modal, no routing) — keeps focus, no context switch
- CSS `grid-template-rows: 0fr → 1fr` for smooth animation on unknown-height content
- Two-column cards expand their backlog in matching two-column layout
- Cards with empty backlogs show no expand affordance — no clutter
- Keyboard accessible (Enter/Space)

**Phase 2 — Quality of life** (next session)
Card GitHub links, R-to-refresh shortcut, auto-discovery of tracker files.

---

### [2026-04-22] — GitHub API fetch integration shipped

**Context:** Phase 1 core feature. Replaced the localStorage/drag-drop model with live fetches from GitHub.

**Decisions:**

**projects.json as project registry**
- Rationale: Keeps the HTML focused on rendering. Adding a new project = one JSON line, no HTML edit. Simpler than auto-discovery, more maintainable than hardcoding in the script.
- Fetched as a relative URL (`./projects.json`) from Cloudflare Pages — no extra GitHub API call needed.

**Promise.allSettled for parallel fetches**
- All tracker fetches fire simultaneously. Page shows pulsing skeleton cards while loading, then replaces them all at once.
- Failed fetches show an error card with the repo name and status code visible — makes misconfigured entries easy to diagnose.

**Removed: localStorage, drag-drop, + Add Tracker button**
- Rationale: Those were scaffolding for a manual workflow. The GitHub fetch model supersedes them entirely. Less code, cleaner UI.

**Initial projects.json** — five repos registered at launch:
`project-dashboard`, `kasette`, `tiny-path`, `cadence`, `ordobook`

---

### [2026-04-22] — Project initialized

**Context:** Chad has tried project organization systems before. The two failure modes: (1) hard to access — not bookmarkable, lives on one machine; (2) manual to update — drag-and-drop gets skipped, system falls out of date and becomes useless.

**Decisions made in founding session:**

**Hosting: Cloudflare Pages auto-deploy from GitHub**
- Rationale: One bookmarkable URL, always current, zero manual deploy step. Cloudflare Pages is already in Chad's stack.

**Data source: GitHub Contents API (unauthenticated)**
- Rationale: All project repos are public under `Driver-cyber`. No token needed, no backend needed, no Cloudflare Worker layer. Simple fetch → decode base64 → parse `#tracker-data` JSON block.
- Implication: All project repos must remain public, OR any private repo simply won't appear in the dashboard (acceptable).

**Secrets discipline: environment variables, not private repos**
- Rationale: Ordo Field and other projects with API credentials should use `.gitignore` + environment variables properly. Making repos public is fine as long as secrets are never committed.

**Progress log: `learned-log.json` in this repo**
- Rationale: One place, append-only, simple schema. Claude Code writes entries at session end based on what shipped. Chad gets one optional question: "anything specific to note?" Everything else is inferred from session history.
- Philosophy: The log is a record of growth, not a status report. Skill acquisition matters as much as feature completion.

**Automation: Claude Code session-end protocol**
- Rationale: Automation without CI complexity. Claude Code already updates tracker files at session end — extending that to also append `learned-log.json` costs almost nothing in tokens and eliminates all manual upkeep.

**Scope: personal tool only, v1**
- Explicitly not a product. No auth, no multi-user, no CI automation beyond what Claude Code already does.

**Existing files preserved:**
- `index.html` — the dashboard UI (renamed from `project-dashboard.html` so Cloudflare Pages serves it at the site root)
- `workflow/` — kept as-is, contains the prompt templates for other projects

---

## 💡 Parking Lot

- Staleness alerts (e.g. badge turns red if a tracker hasn't been updated in 14+ days) — good idea, low priority
- Auto-discovery of tracker files across all repos (scan all `Driver-cyber` repos for `*-tracker.html`) — would be elegant, adds API call complexity, revisit later
- Automated CI sync (GitHub Action that triggers dashboard refresh on push to any project repo) — parked until September 2026 checkpoint
- "Year in review" generated summary from `learned-log.json` — fun future thing, Claude could draft it from the JSON

---

## 🔑 Key File Locations

| File | Location | Notes |
|---|---|---|
| Dashboard UI | `index.html` (root) | Cloudflare Pages serves this as the site root |
| Learning log | `learned-log.json` (root) | Append-only, Claude Code writes at session end |
| Workflow templates | `workflow/` | For use in other project repos |
| Build tracker | `project-dashboard-tracker.html` (root) | Tracks this repo's own priorities |
