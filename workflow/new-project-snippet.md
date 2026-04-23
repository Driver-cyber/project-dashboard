# New Project Constitution Snippet
## Add this to your "project constitution" Claude project instructions

Paste the block below into your Claude project's custom instructions (System Prompt /
Project Instructions). It will instruct Claude to include a tracker as a standard
founding doc whenever it creates a new project constitution.

---

```
## Build Tracker — Required Founding Doc

Every new project constitution must include a build tracker as a founding document.

**File:** `[project-name]-tracker.html`

The tracker serves two purposes:
1. Visual priority board — rendered in browser, readable at a glance
2. Machine-readable data — feeds a cross-project dashboard via JSON block

**Required structure:**

The file must contain:
- A visual two-column (or one-column) HTML board with the top 3 priorities per
  column and a backlog section below
- A `<script id="tracker-data" type="application/json">` block at the bottom
  with this exact schema:

{
  "project": "Short project name — this is the unique dashboard ID, keep it stable",
  "description": "One-sentence description of what this project does",
  "updated": "YYYY-MM-DD",
  "columns": [
    {
      "name": "Column name (repo, workstream, or platform)",
      "sub": "Short subtitle — tech stack or deployment context",
      "priorities": [
        { "title": "First priority", "note": "Why / what to know" },
        { "title": "Second priority", "note": "Why / what to know" },
        { "title": "Third priority", "note": "Why / what to know" }
      ],
      "backlog": [
        "Future feature or idea",
        "Known bug",
        "Parked decision"
      ]
    }
  ]
}

Use 1 column for single-repo / single-track projects.
Use 2 columns for multi-repo, multi-platform, or clearly separated workstreams.

**Visual style — "Garden Party" (non-negotiable for consistency):**

Light mode tokens:
- Background: `#F6F2E8` (warm paper), Cards: `#FDFAF2`, Borders: `#D9D2BF`
- Ink: `#1E2A20`, Ink-2: `#4A5448`, Ink-3 (muted): `#7E887C`
- Sage-deep (primary accent): `#35523A`, Sage: `#6E8B6A`, Sage-soft: `#B4C9B0`
- Sage tint for number badges: `rgba(110,139,106,0.14)`

Dark mode tokens (toggle via `[data-theme="dark"]` on `<html>`):
- Background: `#0F1511`, Cards: `#18211B`, Borders: `#25302A`
- Ink: `#E8EEE2`, Ink-2: `#B4BEB0`, Ink-3: `#7C867A`
- Sage-deep: `#B4D3AE`, Sage: `#8CAF87`, Sage-soft: `#4D6B4F`

Type + motifs:
- Fonts: **Instrument Serif** (headers, project titles, wordmark) + **Geist** (UI) + **Geist Mono** (numbers, tags) — all from Google Fonts
- Wordmark pattern: serif with italic period, e.g. `Project Name<em>.</em>` — italic in `--sage-deep`
- Numbered priorities: small sage-tinted circle badges with mono numerals
- Backlog: dash-prefixed items, not bullets (`::before` hairline in sage)
- Rounded cards (16–20px radius), subtle botanical leaf watermark optional
- Include light/dark toggle in top-right, persist to `localStorage` key `gp.theme`

**CLAUDE.md / project instructions must include:**

In the Memory & Strategy / session startup section:
  - "Check the tracker: Read [project-name]-tracker.html for current priorities
    before starting work. Update it at the end of any session that changes priorities."

In the Maintenance Rules section:
  - "Build tracker: Update [project-name]-tracker.html at the end of sessions that
    complete or change priorities. Update the 'updated' date in both the visual
    header and the JSON data block."

**DECISIONS.md must include:**

A section called "Build Tracker" or a note in the initial entry confirming the tracker
was created and what the initial priorities represent.

**Commit message pattern:**
"Initialize project — CLAUDE.md, DECISIONS.md, [project-name]-tracker.html"

The tracker should reflect the actual first real priorities for the project — not
placeholders. If the project is brand new, the first priorities are typically:
1. Scaffold / initial setup
2. First working feature / proof of concept
3. First user-facing milestone
```

---

## How this fits your workflow

When you open your "project constitution" Claude project and ask it to set up a new
project, it will automatically:

1. Create CLAUDE.md with tracker reading in the Memory section
2. Create DECISIONS.md with initial decision log
3. Create `[project-name]-tracker.html` with visual board + JSON data block
4. Commit all three as a single "Initialize project" commit

After each working session on the project, Claude updates the tracker with:
- Completed priorities moved to backlog or removed
- Next items pulled up
- New bugs or ideas added to backlog
- `updated` date bumped

To add the project to your cross-project dashboard:
- Download / export `[project-name]-tracker.html` from the repo
- Drag it into `project-dashboard.html`
- Done — it appears as a card with live staleness tracking

The dashboard stores projects in localStorage. Re-upload the tracker file after any
session where priorities change to keep the dashboard current.
```
