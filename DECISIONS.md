# DECISIONS.md — Project Dashboard Decision Log
*Living document. Most recent entries at the top.*
*Stable architecture lives in CLAUDE.md. This file tracks the "why we got here."*

---

## 🎯 Current Phase
**Phase 4 — Galaxy + iOS native** (in progress)
Phase 3 wrapped 2026-04-28: rebrand → der Hain, iOS WKWebView + widget skeleton, notepad polish. Phase 4 kicked off same day: Galaxy / Victory Lap tab shipped, learned-log schema enriched, all 6 other tracked repos retrofitted with structured shipped items. Next: iOS app built in Xcode and deployed to Chad's phone, auto-discovery of tracker files, staleness alerts.

---

## 📝 Decision Log

### [2026-05-01] — Inbox capture pipeline · single-source tracker hydration

**Inbox capture pipeline (iOS Shortcut → Pages Function → Gist → session-end sweep)**
- Goal: lower the friction of "I just thought of a tracker entry, but I'm on my phone." Voice-first, sub-second round-trip, no app to open.
- Architecture: iOS Shortcut (Action Button or Siri) → Dictate Text → POST `https://derhain.chadstewartcpa.com/api/inbox` with `{text}` → Pages Function fetches the notepad Gist, prepends a note `{project: "Inbox", text, source: "inbox-api"}`, PATCHes back. Returns 200 + new note id.
- Endpoint: `functions/api/inbox.js`. Reuses the same `GITHUB_TOKEN`/`GIST_ID` env vars that the existing `/api/gist` proxy uses — no additional secrets.
- Notepad UI auto-renders an "Inbox" chip when any note has `project: "Inbox"`, since chip rendering uses `Set(notes.map(n => n.project))`. No UI code change needed for the new category.
- Sweep: at session-end (or via "sweep inbox" trigger), Claude pulls Inbox notes, decides whether each is a shipped item / new priority / backlog idea / discardable, and routes accordingly.
- Cleanup gap (acknowledged): Claude can currently *read* the gist via `/api/gist` GET, but doesn't have a clean delete-by-id endpoint — would need to PATCH the full notes array back. Acceptable for now; if Inbox grows noisy, add `/api/inbox?action=clear&ids=...` or have Chad swipe-delete in the Notepad UI.

**Single-source tracker — visual hydrates from JSON**
- Bug discovered: `project-dashboard-tracker.html` had a static `<ol>` list of priorities AND a `#tracker-data` JSON block. Both were maintained by hand. After the iOS-shipping commit, the JSON had updated priorities but the visual list still showed shipped items as priorities — that's why the page felt "stale."
- Decision: JSON is the single source of truth. The visual lists hydrate from `#tracker-data` on page load via a small inline script (~30 LOC). Static HTML in the file remains as a no-JS fallback / first paint, but JS overwrites on load.
- Bug-within-bug: the hydration script initially lived in the same `<script>` block as the theme toggle, ABOVE the `<script id="tracker-data">` block. `getElementById('tracker-data')` returned null because the parser hadn't reached the JSON yet; the function silently bailed. Fix: move hydration into its own `<script>` block AFTER the JSON. Lesson encoded in a comment in the file.
- CLAUDE.md updated: "edit the `#tracker-data` JSON block only" — visual auto-syncs. Removed the old "bump in both places" rule.
- Galaxy tab and dashboard cards already read the JSON directly via the GitHub Contents API — they were never affected by the dual-source bug. Only the visual tracker page itself was lying.

**Session-end protocol upgraded with trigger phrases**
- Codified in CLAUDE.md: "shipped X, next Y" (mid-session), "session-end" / "wrap up" / "close out" (end of session), "add to backlog: Z" (capture without re-prioritizing), "sweep inbox" (process Inbox-tagged notepad entries).
- New step 1: sweep the Inbox before editing the tracker. New step 5: push to main (was implicit before; now explicit because the iOS widget depends on it).

---

### [2026-05-01] — Flatten `der.hain.` → `derhain.` for free SSL coverage

- Cloudflare Universal SSL only covers the apex + one subdomain level (`*.chadstewartcpa.com`). `der.hain.chadstewartcpa.com` is two levels deep and would require Advanced Certificate Manager (paid) or a custom cert — not worth it for the German-clarity nicety.
- Cutover: `derhain.chadstewartcpa.com` is now the canonical iOS-app/PWA URL. Old `der.hain.…` can be kept as a 301 redirect for muscle-memory grace, then retired.
- Touchpoints updated: `ios/DerHain/ContentView.swift` (loaded URL), `ios/DerHain/WebView.swift` (external-link host check), `CLAUDE.md` (domain list). Widget unaffected — it queries the GitHub API directly.
- iOS app must be rebuilt + reinstalled on Chad's phone for the change to take effect — bundle ID stays `com.chadstewart.derhain`, so it's a same-app update, not a fresh install.

---

### [2026-04-28] — Galaxy tab · Victory Lap visualization · enriched tracking schema

**Galaxy tab: spatial planet visualization chosen over timeline**
- Two options explored: scrolling timeline (standard, expected) vs spatial galaxy (planets per project, moons per accomplishment).
- Chose spatial. Rationale: a timeline encourages sequential reading; a galaxy encourages exploration and *seeing differently* — noticing which project is biggest, which is darkest, which has the most firsts. It's also just more fun.
- 7 planets (one per `projects.json` entry), elliptical dual-orbit layout, sized by accomplishment count. Dim/unlit planets for projects with no entries — not hidden, just unlit. Reminds you there's more story to write.
- Hyperspace warp on planet click: CSS `transform-origin` set dynamically to the clicked planet's position as a percentage of the container, then `scale(8)` applied via class. Stars get `scaleY(40)` simultaneously. Total CSS, no JS animation loop. ~950ms to planet detail.
- Moon glyphs: ✦ for aha-moment entries, ★ for first-ever entries — visible without clicking, reward exploration.

**8/10 tracking metrics approved and added to schema**
- Voted yes: mood emoji, aha moment, frustration peak, curiosity trail, first-ever flag, real-world use, energy level going in, wonder sentence.
- Voted no: teach-back score (Chad), inspired-by (Chad).
- All 8 added as optional fields to `learned-log.json` schema. Backfilled all 8 existing entries with the fields that were genuinely true. Padded fields are worse than absent ones — this is a principle.

**Learning platform (Idea 2) parked to backlog**
- Chad's second idea: a learning platform for first-principles understanding of what we've built, with Python specifically as a learning goal.
- Decision: not a tab in der Hain. Better served as a separate Claude project with custom instructions for deep-dive walkthroughs of specific concepts. The data (code we've built) already exists; the value is in the conversation, not the UI.
- Added to tracker backlog with clear description so it doesn't get lost.

**workflow/enrich-tracker-shipped.md created**
- Drop-in prompt for each of the 6 other tracked repos to convert their `shipped` string arrays to the structured `{date, what, tags, learned?}` object form.
- Chad ran it across all 6 repos the same session — all planets now have data to render moons from.

---

### [2026-04-28] — Rebrand to der Hain · iOS companion shell · notepad polish

**Rebrand: Garden → der Hain**
- Old name conflicted with the garden-app iOS project (separate SwiftUI app being built, registered in this dashboard as a card). Two things named "Garden" in Chad's stack was confusing.
- "Hain" is German for *grove* — keeps the plant/growth metaphor but distinct from a single garden, implies a collection of growing things tended together.
- Lowercase German article kept (`der Hain`) so the name reads as a proper noun phrase — article serves as prefix, capitalized noun stands as the name. Also signals German-ness clearly to readers.
- Touchpoints updated: PWA `apple-mobile-web-app-title`, browser `<title>`, header `.logo`, empty-state copy. The `garden-notes.json` Gist filename intentionally NOT renamed — that's the live sync key, renaming it would orphan all existing notes.
- Domains: `projects.chadstewartcpa.com`, `hain.chadstewartcpa.com`, `derhain.chadstewartcpa.com`. Old `garden.chadstewartcpa.com` deleted. *(Originally registered as `der.hain.chadstewartcpa.com` for German-clarity reasons; flattened to `derhain.` on 2026-05-01 — see entry below.)*

**Favicon redesign: single plant → grove of three trees**
- v1 (three crowns, one color, no trunks) read as a shrub at favicon size — Chad caught it immediately.
- v2 fix is both structural and tonal: 1-unit gaps between crowns, thin trunks beneath each, three distinct sage tones (left muted #9EBA9A, centre brightest #C4D8C0, right mid #A8C0A4). One without the other wasn't enough.
- apple-touch-icon.png regenerated from the same pure-stdlib Python pattern (struct + zlib) — quadratic Bezier curves rasterized via sample-into-polygon-points + ray-casting. No PIL dependency, full version-controllable PNG generator.

**Notepad: edit existing notes**
- Previously: archive or delete only. No way to fix a typo without recreating the note.
- Chose in-place edit (vs modal): pre-fill the composer with the note's content, show "Editing note" banner, change "Add note" → "Update note", add "Cancel edit" button. createdAt preserved, project + text mutable.
- Edit reuses the composer instead of duplicating UI — keeps the surface area small.

**Notepad: category chips → composer category sync**
- "One element, two affordances": tapping a category chip both filters the visible notes AND sets the composer's project dropdown to match. Filter + compose in one tap.
- One-directional only (chip → composer, not the reverse). Avoids surprising the user when they're typing a note and the chip filter shifts under them.

**Quick Links tab — preset URL launcher**
- New 4th tab. Three preset links (Project Dashboard / WSH Prep / WSH Learn), each tap shows an iOS-style action sheet with "Open in browser" or "Copy URL" — purpose-built for the iMessage share workflow Chad uses.
- Links are a JS array constant; adding more is a one-line edit. Simpler than building a CRUD UI for what's effectively a personal bookmarks file.

**iOS companion: thin WKWebView wrapper, not a rewrite**
- Chad uses der Hain almost exclusively on iPhone. Considered: full SwiftUI rewrite vs WKWebView wrapper vs status quo PWA.
- Decision: WKWebView wrapper + home screen widget. Web app stays the source of truth (95% of features auto-update on Cloudflare deploy, single codebase). iOS-only surfaces — widgets, Action Button, Keychain, native haptics — added as native code incrementally only when they pay off.
- Avoids the trap of maintaining two parallel feature implementations. Garden-app already exists as a separate Swift project; this dashboard would have been the second SwiftUI codebase — too much surface area.
- Code structure: `ios/` subfolder in this repo (vs separate repo) — the iOS app is tightly coupled to `projects.json` and the Gist data layer, co-location wins.
- `.xcodeproj` intentionally NOT committed: contains user-specific UUIDs and signing config. SETUP.md guide reproduces it in 5 minutes at a Mac.

**Widget data path is a separate sync point (flagged in CLAUDE.md)**
- The widget extension can't share code with the WKWebView app — it has to parse `projects.json` and tracker HTML itself.
- Implication: if the tracker JSON schema ever changes (new fields, renames in `columns`/`priorities`), `ios/DerHainWidget/DerHainWidget.swift` parser must be updated to match. Web app changes are auto; widget is manual.
- Added explicit maintenance rule to CLAUDE.md so any future Claude Code session sees the dependency.

---

### [2026-04-28] — Defensive fixes · cross-repo tracker format documented

**Defensive NaN guard in staleInfo**
- Added `Number.isNaN(days)` check after date arithmetic in `staleInfo()` — shows "Bad date format" badge instead of "NaN weeks ago · stale" when a tracker's `updated` field can't be parsed by `new Date()`
- Caught in the wild: wild-stewart-homeschool tracker had an unrecognized date format
- Rationale: silent NaN propagation through render logic is confusing; explicit label makes the problem visible and actionable without crashing

**Cross-repo tracker schema documented**
- garden-app tracker was created with a flat `priorities: string[]` — dashboard requires `columns: [{name, sub, priorities: [{title, note}], backlog: string[]}]`
- Both wild-stewart and garden-app corrected via targeted Claude Code sessions in their respective repos
- Schema is now documented in CLAUDE.md and in the cross-repo onboarding prompt pattern (see session context)

**GitHub MCP scope — discussed, no action taken**
- Chad asked about granting broader repo access to Claude Code sessions
- Recommendation: expand GitHub App installation to full Driver-cyber org for read access; keep session scoping conservative for writes
- No change made this session — Chad to configure via github.com → Driver-cyber → Settings → Integrations → GitHub Apps → Claude → Configure

---

### [2026-04-24] — Phase 2 push · backburner, notes resilience, garden-app, icons

**Dashboard redesign — backburner pattern**
- Cards auto-sort by `updated` date, most recent first
- Top 4 featured and always expanded; remainder collapsed under a single "Backburner" disclosure row with open/closed state persisted to `gp.backburner` in localStorage
- Rationale: Chad typically touches 1–3 projects/day. Equal-weight rendering of 6+ cards buried the day's active work. Featured-top-4 aligns the default view with actual work; backburner preserves "remember what's parked" without clutter.
- "Pin/unpin a project to force it into the featured top 4" — parked as future enhancement

**Notepad sync — resilience improvements**
- `initSync` now compares local note IDs against the Gist and auto-pushes any local-only notes on successful pull — closes the orphan-write data-loss window
- Sync indicator shows live note count: `5 notes · synced 2:39pm` for at-a-glance reassurance
- Context: Chad reported losing 2 notes after a PWA reinstall. Root cause was local-only notes that never made it upstream before localStorage was wiped. This fix closes that window.

**Decision: keep GitHub Gist as the notepad backend**
- Evaluated migrating `functions/api/gist.js` to Cloudflare KV. Decision: defer.
- Rationale: GitHub Gist with a no-expiration token is working reliably, and it gives free version history (every prior state of the gist is recoverable via the GitHub API). KV would eliminate one external dependency but costs a schema rewrite and loses the free version-history safety net. Revisit only if Gist misbehaves.

**Decision: `projects.json` is the sole source of truth for notepad categories**
- Considered adding a "+ New category…" affordance inside the notepad dropdown for ad-hoc categories. Rejected.
- Rationale: the friction of adding an entry to `projects.json` (and, by extension, having a real tracker in a real repo) is the feature. Every note has a home, no orphan categories accumulate, and the dashboard and notepad stay conceptually aligned. `Ideas / TBD` remains the escape hatch for captures not yet tied to a project.

**garden-app — registered as 7th project**
- Added to `projects.json`; automatically appears as a dashboard card and a notepad category
- Founding docs including a SwiftUI constitution (`workflow/garden-app-constitution.md`) live in the garden-app repo — first project registered that will not have a Cloudflare deployment (standalone SwiftUI iOS app, Chad's Swift/Xcode learning vector)

**Visual identity**
- `favicon.svg` (browser tab) + `apple-touch-icon.png` 180×180 (iOS home screen) — both sage-deep green `#35523A` with a two-leaf plant mark
- PNG generated from pure-stdlib Python (struct + zlib) — no image library dependency

**Learning meta-note:** Offline-first sync has two distinct failure modes worth distinguishing — silent failed pushes (visible red dot, user can retry) and orphan writes (note exists locally but never made it upstream — looks synced because there's nothing to retry). The orphan case is the dangerous one; detecting it requires comparing local IDs against remote IDs on every init, not just tracking push failures.

---

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
