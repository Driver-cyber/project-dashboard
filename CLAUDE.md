# CLAUDE.md — Project Dashboard Constitution
*Governing document for the `Driver-cyber/project-dashboard` repo*
*Last updated: 2026-05-01*

---

## 🧭 North Star

This repo is Chad's personal command center — a live, bookmarkable dashboard that surfaces the current state and history of every active project in one place. It is not a product. It is infrastructure for the builder.

**Deeper mission:** Make progress visible and learning legible. Chad is acquiring new skills rapidly across many projects simultaneously. This dashboard exists so that work doesn't disappear into the noise — priorities are always visible, completions are recorded, and looking back six months from now produces genuine satisfaction rather than a blur.

**Ordo ab chao in practice:** Many projects, one clear view.

---

## 🏗 What This Repo Contains

| File / Folder | Purpose |
|---|---|
| `index.html` | The dashboard UI (Dashboard / Notepad / Calm / Links / Galaxy tabs) — deployed via Cloudflare Pages, served at site root |
| `projects.json` | The registry. Single source of truth for both dashboard cards AND notepad category dropdown. One-line-per-project: `{repo, tracker}`. |
| `learned-log.json` | Append-only record of completed priorities and learning milestones |
| `functions/api/gist.js` | Cloudflare Pages Function — server-side proxy for the notepad's GitHub Gist sync (hides the token from the client) |
| `favicon.svg` / `apple-touch-icon.png` | Sage-deep green plant-mark icons |
| `workflow/` | Prompt templates for other projects: tracker setup, retrofit, garden-app SwiftUI constitution, etc. |
| `CLAUDE.md` | This file — the project constitution |
| `DECISIONS.md` | Living decision log — the current source of truth for "what we decided" |

---

## 🛠 Architecture

**Hosting:** Cloudflare Pages — auto-deploys on push to `main`. Custom domains: `projects.chadstewartcpa.com`, `hain.chadstewartcpa.com`, `derhain.chadstewartcpa.com`.

**Data flow — dashboard cards:**
- Fetches tracker data live from public repos under `Driver-cyber` via the unauthenticated GitHub Contents API
- No client token needed — all repos are public
- `projects.json` drives which repos are fetched; it also populates the notepad's category dropdown so "category" and "project" stay the same concept

**Data flow — notepad sync:**
- Notes save to `localStorage` first (bulletproof on-device)
- Then push to a GitHub Gist via `/api/gist` — a Cloudflare Pages Function that holds the `GITHUB_TOKEN` + `GIST_ID` env vars server-side (no client-side credentials, no setup UI)
- On app open, `initSync` pulls the Gist and merges with local. Local-only notes are auto-pushed on successful pull (rescues offline creates).
- GitHub Gist's version history is a free safety net — every prior state is recoverable.

**GitHub API pattern for reading tracker files:**
```
https://api.github.com/repos/Driver-cyber/{repo-name}/contents/{tracker-filename}.html
```
Content is base64-encoded in the response — decode before parsing the `#tracker-data` JSON block.

**`learned-log.json` schema (enriched 2026-04-28 — Galaxy/Victory Lap data source):**
```json
[
  {
    "date": "YYYY-MM-DD",            // required
    "project": "Project name",       // required — display name
    "repo": "repo-name",             // required — matches projects.json `repo`
    "completed": "What was finished — one sentence",  // required
    "learned": "Skill/concept acquired — one sentence or null",
    "session_note": "Brief context Claude or Chad adds",

    // Optional enrichment fields — drive the Galaxy tab visuals + filters.
    // Add what's true for the session, leave the rest off. Don't pad.
    "tags": ["string", ...],         // queryable themes (e.g. swift, css, sync)
    "struggle": "What was hard — one sentence",
    "artifact": "path/or/url",       // primary file or URL touched
    "intensity": "quick|session|deep_dive|marathon",  // affects moon size in Galaxy

    "mood": "🔥",                    // single emoji capturing session vibe
    "aha": "What clicked — one sentence",   // marks moon with ✦ glyph
    "frustration_peak": "Moment of near-rage-quit — one sentence",
    "curiosity_trail": "Question this opened up — one sentence",
    "first_ever": "Label of a first-time event",  // marks moon with ★ glyph
    "real_world_use": true,          // bool — was the work used same-session/day
    "energy_in": "low|medium|high",  // self-rated energy walking in
    "wonder": "One sentence on something that delighted you about how it works"
  }
]
```

**Per-project tracker `shipped` items (inside each `*-tracker.html` `#tracker-data` JSON):**
```json
"shipped": [
  { "date": "YYYY-MM-DD", "what": "What shipped", "tags": ["string"], "learned": "optional" }
]
```
The Galaxy tab fetches each tracker (already done for cards) and merges its `shipped` array with `learned-log.json` keyed by `repo`. Strings in the legacy format still render — they just lack the rich fields.

---

## 🧠 Memory & Strategy — Session Startup

1. **Read `DECISIONS.md` first.** Understand the current phase and any open questions before touching anything.
2. **Check the tracker:** Read `project-dashboard-tracker.html` for current build priorities.
3. **Ask before acting.** This repo governs other repos — changes here ripple. Propose a plan for anything beyond single-file edits.
4. **Don't read the whole repo speculatively.** Ask for specific files if context is needed.

---

## ⚙️ Session-End Protocol (Claude Code)

**Trigger phrases — Chad can say any of these to invoke this protocol:**
- *"shipped X, next Y"* — finished one priority, starting another
- *"session-end"* / *"wrap up"* / *"close out"* — end-of-session sweep
- *"add to backlog: Z"* — capture an idea without re-prioritizing
- *"sweep inbox"* — process Inbox-tagged notepad entries (see step 1)

At the end of any working session, Claude Code should:

1. **Sweep the Inbox first — interactively, item-by-item.** Read each Inbox-tagged note from the notepad Gist (`curl https://derhain.chadstewartcpa.com/api/gist`, parse `garden-notes.json`, filter `project === "Inbox"` and `status === "active"`). For EACH note, surface it to Chad and ask what it should become — *priority? backlog? shipped? re-route to a different project's notepad category? delete?* Do not unilaterally decide and re-route in bulk. Chad explicitly wants to be the editorial hand on Inbox sweep — Claude is the typing layer, not the curator. Once Chad answers per-item, apply the change (PATCH the gist via `/api/gist` with a `User-Agent` header — Cloudflare's WAF blocks default `Python-urllib`, so curl `-A "..."` or set the header explicitly).
2. **Update `project-dashboard-tracker.html`** — edit the `#tracker-data` JSON block only (priorities, backlog, shipped, `updated` date, `phase`). The visual header + lists hydrate from the JSON automatically — no need to edit both.
3. **Append to `learned-log.json`** — one entry per meaningful completion or skill acquired this session. Always include `repo` and `tags`. Add the optional enrichment fields (`mood`, `aha`, `struggle`, `frustration_peak`, `wonder`, `first_ever`, `intensity`, `energy_in`, `real_world_use`, `curiosity_trail`, `artifact`) for any that are genuinely true — these feed the Galaxy/Victory Lap tab. Don't pad — empty fields are better than fabricated ones.
4. **Optionally ask Chad** *one* question, not a form. Pick the one most likely to capture something we'd otherwise lose. Examples:
   - "Anything specific you want noted in the learning log from today?"
   - "What's the one mood emoji for this session?"
   - "Was there an aha moment I should record?"
   - "Did anything almost make you rage-quit today?"
5. **Commit + push.** Pattern: `"[project] — [what changed] | log updated"`. Push to `main` so Cloudflare deploys and the iOS widget picks up new data.

---

## 📐 Design Principles

**Token economy:** Don't read files speculatively. Don't auto-scan directories. Ask for what you need. Prefer targeted reads over recursive exploration.

**Measure twice, cut once:** For any change that touches the dashboard HTML or the workflow templates, propose the change and wait for a 'go' before writing. Single-file log appends don't need confirmation.

**Focused elegance:** The dashboard should be a pleasure to look at. The existing walnut/amber/wheat design system is locked — don't drift from it. Utility first, beauty as a constraint not an afterthought.

**Ordo ab chao:** The dashboard's job is to impose a readable order on the chaos of many simultaneous projects. When in doubt, simplify the view rather than add complexity.

---

## 🚫 Out of Scope (v1)

| What | Why parked | Revisit |
|---|---|---|
| Authentication / private repo access | Public repos eliminate the need | If a project must stay private |
| Multi-user access | This is Chad's personal tool | Never, probably |
| Automated sync without Claude Code | Adds CI complexity for marginal gain | September 2026 checkpoint |
| Mobile app / native client | WKWebView wrapper + widget built in `ios/` — web app is still the source of truth | Expand widget or add native features as needed |
| Notifications / alerts for stale trackers | Nice-to-have | Future session |

---

## 🔧 Maintenance Rules

- **After any session that changes build priorities:** Update the `#tracker-data` JSON block in `project-dashboard-tracker.html`. The visual page hydrates from JSON on load — do NOT also hand-edit the static `<ol>`/`<ul>` lists.
- **After any session that ships something meaningful:** Append to `learned-log.json`.
- **After any architectural decision:** Add an entry to `DECISIONS.md` with date and rationale.
- **Workflow templates in `workflow/`:** Update only when the underlying pattern changes — these are consumed by other projects, so treat them like a published API. Don't make breaking changes silently.
- **If the tracker JSON schema changes** (fields in `columns`, `priorities`, etc.): also update the parser in `ios/DerHainWidget/DerHainWidget.swift` — the widget reads the same HTML directly and won't auto-update with web deploys.
- **Per-project `shipped` items** in each tracker should use the object form `{ date, what, tags?, learned? }` (not bare strings) so the Galaxy tab can show rich moons. Strings still render but lose date sorting and tag filtering. New shipped items in any tracked repo: use the object form. See `workflow/enrich-tracker-shipped.md` for the drop-in retrofit prompt.

---

## 🔴 Red Team Triggers

A skeptical review of recent decisions should happen at:
- Any phase transition (new major feature added to dashboard)
- A session restart after 2+ weeks away
- Before adding a new data source or changing the `learned-log.json` schema

Red team format: both parties argue *against* recent decisions. Outcomes must be one of: **Confirmed / Revised / Scheduled**.
