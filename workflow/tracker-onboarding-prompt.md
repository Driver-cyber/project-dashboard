# Tracker Onboarding Prompt
## Wire a project into the cross-project dashboard

Paste the block below into a fresh Claude Code session for any Driver-cyber project
you want linked into the dashboard at **project-dashboard-6a7.pages.dev**.

Replace `[PROJECT-NAME]` (display name on the dashboard card) and `[REPO-NAME]`
(exact GitHub repo name, e.g. `kasette`, `tiny-path`) before pasting.

---

```
I'm wiring this project into my cross-project build tracker. There's a central
dashboard at project-dashboard-6a7.pages.dev that reads live tracker data from each
project repo via the GitHub Contents API. I need you to add the tracker system to
this project as a founding doc.

**Step 1 — Read the project's current state first**

Before writing anything, read:
- CLAUDE.md (or the equivalent project instructions file)
- DECISIONS.md (or equivalent status/decision doc)
- Any other planning or status docs you find

Understand: what this project is, current phase, active priorities, what's been
shipped, and what's blocked. The tracker must reflect the real current state —
not generic placeholders.

**Step 2 — Create [REPO-NAME]-tracker.html**

The tracker is a standalone HTML file with two parts:
1. A visual priority board (rendered in browser, walnut/amber/wheat design system)
2. A machine-readable JSON block that feeds the cross-project dashboard

The file MUST include this block near the bottom, with accurate data:

<script id="tracker-data" type="application/json">
{
  "project": "[PROJECT-NAME]",
  "description": "One-line description of what this project is",
  "updated": "YYYY-MM-DD",
  "columns": [
    {
      "name": "Column header (repo name or workstream)",
      "sub": "Short subtitle — tech stack, platform, etc.",
      "priorities": [
        { "title": "Priority title", "note": "Brief context" },
        { "title": "Priority title", "note": "Brief context" },
        { "title": "Priority title", "note": "Brief context" }
      ],
      "backlog": [
        "Backlog item",
        "Another item"
      ]
    }
  ]
}
</script>

Schema rules:
- "project" is the card title on the dashboard — keep it short and clean
- Use 1 column for single-track projects, 2 for multi-repo or multi-workstream
- Priorities are the actual top 3 — read the docs before writing them
- "updated" date must match today's date

Visual style for the HTML:
- Background: #2C1A0E (walnut), accents: #F2A24A (amber), text: #F5DEB3 (wheat)
- Fonts: Plus Jakarta Sans (UI), Fraunces italic (headers)
- Match the visual structure of project-dashboard-tracker.html in the
  Driver-cyber/project-dashboard repo if you want a reference

**Step 3 — Update CLAUDE.md (or equivalent project instructions)**

Add to the Memory & Strategy / Session Startup section:
  "Check the tracker: Read [REPO-NAME]-tracker.html for current priorities and
  what's actively being built."

Add to the Maintenance Rules section (create it if it doesn't exist):
  "Build tracker: Update [REPO-NAME]-tracker.html at the end of any session that
  changes priorities or completes planned work. Bump the 'updated' date in both
  the visual header and the JSON block."

Add to Session-End Protocol (or create it):
  "Update the tracker — move completed items to backlog, pull up next priorities,
  bump the updated date."

**Step 4 — Update DECISIONS.md (or equivalent)**

Add a brief dated entry noting:
- Tracker system added
- What the initial top-3 priorities are
- That it feeds the cross-project dashboard at project-dashboard-6a7.pages.dev

**Step 5 — Commit**

Stage and commit all changes with the message:
"Add build tracker as founding doc — [REPO-NAME]-tracker.html"

Do NOT push unless I explicitly ask.
```

---

## Notes

**Private repos:** The dashboard fetches via the unauthenticated GitHub API, so private
repos will show a fetch error card on the dashboard. The tracker file is still worth
adding — it drives the session-end update discipline and will auto-populate the dashboard
if the repo is ever made public.

**Updating the tracker after this session:** At the end of any future Claude Code session
that changes priorities, Claude should update [REPO-NAME]-tracker.html — move completed
items to backlog, pull next items up, bump the date. CLAUDE.md will remind it to do this
once Step 3 above is complete.

**Adding a new project to the dashboard:** After the tracker file is on `main`, add a
line to `projects.json` in Driver-cyber/project-dashboard:
```json
{ "repo": "your-repo-name", "tracker": "your-repo-name-tracker" }
```
