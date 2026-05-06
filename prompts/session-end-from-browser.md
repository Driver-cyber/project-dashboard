# Session-end protocol — browser session prompt

For Claude surfaces that don't have the local `/session-end-protocol`
skill installed: claude.ai/code in the browser, Cowork, fresh machines
before the skill is reinstalled, or any other surface that can't read
`~/.claude/skills/`. Paste the prompt below into a fresh session inside
the project you want to wrap up — Claude will fetch the canonical
protocol body and execute it.

<!-- PROMPT:BEGIN -->
Run the chad-wiki session-end protocol on this project. Fetch these two docs:
- https://chadwiki.chadstewartcpa.com/session-end-protocol.md — the protocol body
- https://chadwiki.chadstewartcpa.com/inbox-source.md — the Inbox read/write spec (needed for step 1)

Then read this project's CLAUDE.md for the per-project hooks (tracker filename, learned-log path, Inbox source, commit-message tag) and execute steps 1–5 against them.
<!-- PROMPT:END -->

## When to use this

- A Claude Code session running in the browser (claude.ai/code) — it
  can't see the local Mac mini's `~/.claude/skills/` folder
- A Cowork session
- A new machine where the skills haven't been reinstalled yet
- Any time you want to follow the canonical protocol explicitly,
  without slash-command sugar

## How copy works

The der Hain Links tab extracts the text between the
`<!-- PROMPT:BEGIN -->` and `<!-- PROMPT:END -->` markers and copies
*only* that to your clipboard. The surrounding explanation is for you
reading this file directly; it doesn't go to the model.

## Fallback if the wiki is unreachable

If the model reports a fetch failure for either URL, follow the
fallback ladder from `map.md`:

1. Don't silently proceed.
2. Surface the failure to Chad: "I can't reach Chad-wiki. Want to
   (a) fix the access issue, (b) paste the relevant section yourself,
   or (c) proceed without it because this particular task doesn't
   need it?"
3. Wait for Chad's response.

The wiki is the stable canonical source. If it's down, that's a
decision point, not a default-to-proceeding moment.
