# Enrich Tracker Shipped Items — Drop-in Prompt

Paste this into a Claude Code session **inside one of the project repos under `Driver-cyber/`** (e.g. `kasette`, `garden-app`, `wild-stewart-homeschool`, `tiny-path`, `cadence`, `ORDOBook`).

Its job: upgrade the tracker's `#tracker-data` JSON `shipped` array from bare strings to the new structured form so the **Galaxy / Victory Lap** tab on `projects.chadstewartcpa.com` can render this project's accomplishments as rich, dated, tagged "moons" instead of a flat list.

This is a one-time retrofit per repo. After this, all new shipped items should follow the new format going forward.

---

## Prompt to paste

```
Read this repo's *-tracker.html file and locate the <script id="tracker-data" type="application/json"> block. Inside its `columns[0]` object, there's (or should be) a `shipped` array.

Goal: convert every `shipped` entry into the structured object form so the project-dashboard's Galaxy tab can render rich data.

Target shape for each shipped item:
{
  "date": "YYYY-MM-DD",     // required — best-guess from commit history if unknown; the date the work landed
  "what": "What shipped — one sentence",  // required
  "tags": ["string", ...],  // 1–4 short lowercase tags (e.g. "swiftui", "css", "sync", "ios", "ux", "founding")
  "learned": "optional — one sentence on the lesson, if there's a real one"
}

Rules:
1. If `shipped` is currently an array of strings, convert each one to an object preserving the text in `what`.
2. For `date`: best-effort. Use `git log --diff-filter=A --follow --format=%cs -- <relevant-file>` or commit-message scanning to date each item. If you truly can't determine, omit the field rather than guess wildly.
3. For `tags`: pick from a stable shared vocabulary where possible. Common tags across the dashboard ecosystem: ["swift", "swiftui", "ios", "css", "ux", "animation", "sync", "github-api", "cloudflare", "python", "stdlib", "founding", "branding", "favicon", "docs", "architecture", "defensive-coding", "mobile", "tabs", "notepad", "widgetkit", "wkwebview"]. Add project-specific tags if the shared set doesn't fit.
4. Sort the final `shipped` array newest-first by `date` (entries without dates go to the end).
5. Bump the `updated` field at the top of the JSON to today's date.
6. Do NOT change anything outside the `shipped` array and the `updated` field.
7. Validate the JSON parses before writing.

Also: while you're in there, if there are recent shipped wins not yet captured in the array, add them. One sentence per item, with date and tags.

Commit with message:
"[<repo-name>] — enrich shipped items: dates + tags for Galaxy view"

Push to main. Done.
```

---

## Notes

- The Galaxy tab handles the legacy string form gracefully — moons just lack date and tag filtering. So this is incremental polish, not a breaking migration.
- Tags become **planet-level skill counts** in the Galaxy stats footer. Use a stable vocabulary so cross-project skill clouds emerge.
- `date` enables timeline-aware visuals (newer moons get visual prominence).
- Once a repo is enriched, *new* shipped items must follow the object form to keep the data clean.

## Repos to run this on (current registry)

From `projects.json` in the project-dashboard repo:

- `kasette`
- `tiny-path`
- `cadence`
- `ORDOBook`
- `wild-stewart-homeschool`
- `garden-app`

(`project-dashboard` itself is already enriched — use its `project-dashboard-tracker.html` as the canonical example.)
