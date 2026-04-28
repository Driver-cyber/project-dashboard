# CLAUDE.md — Project Dashboard Constitution
*Governing document for the `Driver-cyber/project-dashboard` repo*
*Last updated: 2026-04-22*

---

## 🧭 North Star

This repo is Chad's personal command center — a live, bookmarkable dashboard that surfaces the current state and history of every active project in one place. It is not a product. It is infrastructure for the builder.

**Deeper mission:** Make progress visible and learning legible. Chad is acquiring new skills rapidly across many projects simultaneously. This dashboard exists so that work doesn't disappear into the noise — priorities are always visible, completions are recorded, and looking back six months from now produces genuine satisfaction rather than a blur.

**Ordo ab chao in practice:** Many projects, one clear view.

---

## 🏗 What This Repo Contains

| File / Folder | Purpose |
|---|---|
| `index.html` | The dashboard UI (Dashboard / Notepad / Calm tabs) — deployed via Cloudflare Pages, served at site root |
| `projects.json` | The registry. Single source of truth for both dashboard cards AND notepad category dropdown. One-line-per-project: `{repo, tracker}`. |
| `learned-log.json` | Append-only record of completed priorities and learning milestones |
| `functions/api/gist.js` | Cloudflare Pages Function — server-side proxy for the notepad's GitHub Gist sync (hides the token from the client) |
| `favicon.svg` / `apple-touch-icon.png` | Sage-deep green plant-mark icons |
| `workflow/` | Prompt templates for other projects: tracker setup, retrofit, garden-app SwiftUI constitution, etc. |
| `CLAUDE.md` | This file — the project constitution |
| `DECISIONS.md` | Living decision log — the current source of truth for "what we decided" |

---

## 🛠 Architecture

**Hosting:** Cloudflare Pages — auto-deploys on push to `main`. Custom domains: `projects.chadstewartcpa.com`, `hain.chadstewartcpa.com`.

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

**`learned-log.json` schema:**
```json
[
  {
    "date": "YYYY-MM-DD",
    "project": "Project name",
    "completed": "What was finished — one sentence",
    "learned": "Skill or concept acquired, if any — one sentence or null",
    "session_note": "Optional brief context Claude or Chad adds"
  }
]
```

---

## 🧠 Memory & Strategy — Session Startup

1. **Read `DECISIONS.md` first.** Understand the current phase and any open questions before touching anything.
2. **Check the tracker:** Read `project-dashboard-tracker.html` for current build priorities.
3. **Ask before acting.** This repo governs other repos — changes here ripple. Propose a plan for anything beyond single-file edits.
4. **Don't read the whole repo speculatively.** Ask for specific files if context is needed.

---

## ⚙️ Session-End Protocol (Claude Code)

At the end of any working session, Claude Code should:

1. **Update `project-dashboard-tracker.html`** — move completed priorities to backlog, pull up next items, bump the `updated` date in both the visual header and the JSON block.
2. **Append to `learned-log.json`** — one entry per meaningful completion or skill acquired this session. If nothing meaningful shipped, skip it — don't pad the log.
3. **Optionally ask Chad:** "Anything specific you want noted in the learning log from today?" — one question, not a form.
4. **Commit with a descriptive message.** Pattern: `"[project] — [what changed] | log updated"`

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
| Mobile app / native client | Browser is fine | Never, probably |
| Notifications / alerts for stale trackers | Nice-to-have | Future session |

---

## 🔧 Maintenance Rules

- **After any session that changes build priorities:** Update `project-dashboard-tracker.html`.
- **After any session that ships something meaningful:** Append to `learned-log.json`.
- **After any architectural decision:** Add an entry to `DECISIONS.md` with date and rationale.
- **Workflow templates in `workflow/`:** Update only when the underlying pattern changes — these are consumed by other projects, so treat them like a published API. Don't make breaking changes silently.

---

## 🔴 Red Team Triggers

A skeptical review of recent decisions should happen at:
- Any phase transition (new major feature added to dashboard)
- A session restart after 2+ weeks away
- Before adding a new data source or changing the `learned-log.json` schema

Red team format: both parties argue *against* recent decisions. Outcomes must be one of: **Confirmed / Revised / Scheduled**.
