# Inbox sweep — browser session prompt

For Claude surfaces that don't have the local `/sweep-inbox` skill
installed: claude.ai/code in the browser, Cowork, fresh machines, or
any other surface that can't read `~/.claude/skills/`. Paste the prompt
below into a fresh session and Claude will run the Inbox sweep
according to the canonical step 1 — without touching the tracker,
learned-log, or making a commit.

<!-- PROMPT:BEGIN -->
Sweep my Inbox per the chad-wiki protocol. Fetch:
- https://chadwiki.chadstewartcpa.com/session-end-protocol.md — read step 1 only
- https://chadwiki.chadstewartcpa.com/inbox-source.md — for the API endpoint and required User-Agent

Then follow step 1 (batches of 3, NOTE/PROPOSE/why rendering, override syntax) against the Inbox source. Stop after step 1 — don't update the tracker, don't append to the learned-log, don't commit anything.
<!-- PROMPT:END -->

## When to use this

- Between work sessions when you just want to triage Inbox captures
  without a full session-end
- After dictating a few notes via the iOS shortcut and wanting to file
  them before they pile up
- Any time you want focused inbox triage rather than the full
  end-of-session ritual

## How copy works

The der Hain Links tab extracts the text between the
`<!-- PROMPT:BEGIN -->` and `<!-- PROMPT:END -->` markers and copies
*only* that to your clipboard. The surrounding explanation is for you
reading this file directly; it doesn't go to the model.

## What this prompt does and doesn't do

**Does:**

- Fetch the canonical step 1 body from the wiki
- Fetch the Inbox source spec for the read/write mechanism
- Run the sweep: render entries in batches of 3, propose
  project + bucket per item, wait for your confirmation, apply
  dispositions (including tracker writes for priorities/backlog/shipped
  dispositions, and PATCH-back to the Inbox source)

**Does NOT:**

- Update the project's tracker beyond what the sweep dispositions
  require
- Append to the learned-log
- Commit or push

If you want all of those, use the full session-end prompt instead.
