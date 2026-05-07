# Gist sync — ultrareview findings (PR #8)

Multi-agent review of the Notepad GitHub Gist sync feature, run 2026-05-06.
Findings below are ordered severity-then-impact. All line numbers reference
`index.html` at the time of PR #8.

## Normal severity (fix before shipping the feature)

### 1. Sync UI is unstyled — CSS uses class selectors, markup uses IDs
`index.html:986, 991` declares `<div id="np-sync-bar">` and
`<div id="np-sync-form">`. CSS at `index.html:423-446` targets
`.np-sync-bar` / `.np-sync-form` (class selectors). Class selectors don't
match `id` attributes, so the rules silently skip — the sync bar loses its
flex layout and right-aligned "Set up sync" link, and the form has no card
chrome (background, border, padding, margin).

**Fix:** add `class="np-sync-bar"` / `class="np-sync-form"` to the two divs
(keep IDs for the existing `getElementById` lookups). Children are styled by
class already and render correctly — that's why this slipped through.

---

### 2. `gistPush` has no in-flight guard — duplicate gists + lost writes
`index.html:1365-1391`. Two distinct races:

- **First-connect race:** if user types a note (Cmd+Enter) or double-clicks
  Connect while initial `POST /gists` is in flight, both calls observe
  `id===''`, both POST a new gist, and the second response's `id` overwrites
  the first. Result: orphaned private gist in the user's GitHub account
  with their notes; no in-app way to discover or clean up.
- **PATCH-ordering race:** `syncSave` fires `gistPush` without awaiting and
  without queueing. Multiple PATCHes race; an older snapshot can land last
  and clobber newer notes on the gist (local stays correct, but other
  devices pulling miss data until the next push).

**Fix:** serialize `gistPush` behind a single chained promise so the second
caller waits for the first to resolve before re-reading `gistAuth().id`:

```js
let pushChain = Promise.resolve();
async function gistPush(notes) {
  const run = async () => {
    const { token, id } = gistAuth(); // re-read AFTER previous push
    if (!token) return;
    // ... existing body
  };
  pushChain = pushChain.then(run, run);
  return pushChain;
}
```

Disabling the Connect button during `syncState === 'busy'` is a
complementary nice-to-have for the double-click case.

---

### 3. Reconnecting with local notes leaves the gist stale
`index.html:1411-1430`. When connecting to an existing gist while the
device has local-only notes, `initSync()` pulls the gist, merges with local,
writes the merged set to localStorage — but **never calls `gistPush(merged)`**.
The gist therefore retains only its prior contents until some unrelated
future edit triggers a push. Other devices pulling the same Gist ID won't
see the local-only notes until then.

This contradicts the form's own copy: *"paste to reconnect on a new device"*
— that's exactly the path that breaks.

**Fix:** add `await gistPush(merged)` after `saveNotes(merged)` in
`initSync()` (or in the connect handler when a Gist ID was provided).

---

### 4. Pull/push race in `initSync` can permanently delete remote-only notes
`index.html:1411-1428` + `1315`. `setTab('notepad')` calls `initSync()`
**without awaiting it**, so the UI is interactive while `gistPull` is still
in flight. If the user adds/archives/deletes a note in that window,
`syncSave` fires `gistPush` with only the local pre-merge notes — and since
GitHub's gist PATCH replaces the file wholesale, any remote-only notes are
permanently wiped from the gist.

**Fix:** memoize `initSync` as a promise and have `syncSave` await it before
pushing:

```js
let initSyncPromise = null;
async function initSync() {
  if (initSyncPromise) return initSyncPromise;
  initSyncPromise = (async () => { /* existing body */ })();
  return initSyncPromise;
}

async function syncSave(notes) {
  saveNotes(notes);
  if (!gistAuth().token) return;
  if (initSyncPromise) { try { await initSyncPromise; } catch {} }
  gistPush(notes).catch(() => {});
}
```

---

### 5. Merge in `initSync` silently loses archives, edits, deletes
`index.html:1420-1428`. The merge is a Map union by id with no per-note
timestamps and no tombstones. Two failure modes:

- **Gist-wins on collision (silent overwrite of local edits):** any field
  divergence (archive made offline; or after a fire-and-forget `gistPush`
  failure swallowed by `.catch(() => {})` in `syncSave`) gets reverted on
  next `initSync`, because gist is iterated last and `Map.set` replaces.
- **Deletes never propagate (resurrection + re-push):** Device A deletes
  note X and pushes the shorter array. Device B (offline, still has X
  locally) pulls later — the merge has no way to know X was deleted vs
  never-existed, so it's resurrected locally and re-pushed to the gist on
  Device B's next mutation. Deletion undone cross-device.

**Fix needs both:**
1. Add `updatedAt` to notes (bumped on every `addNote` / `noteAction`),
   and have the merge pick the side with the later `updatedAt`.
2. Tombstones for deletes — either keep deleted notes with `status:
   'deleted'` + `deletedAt`, filtered from UI but kept in merge; or a
   parallel deleted-ids set with timestamps.

A band-aid for failure 1 alone is swapping the two `forEach` calls so
local wins on collision — preserves recent local edits, doesn't fix
failure 2.

---

## Nits (polish / future-hardening)

### 6. `gistPull` doesn't honor `truncated` flag for >1MB gists
`index.html:1393-1405`. GitHub returns the file content clipped to 1MB plus
`truncated:true` and `raw_url` for the full payload. `gistPull` reads
`content` directly. In practice this triggers fail-loud (`JSON.parse`
throws → null → 'err' state, local data preserved); silent partial-parse
is theoretically possible but extremely improbable. Reachable only at
thousands of notes.

**Fix:**
```js
const file = data.files?.[GIST_FILE];
if (!file) return null;
let content = file.content;
if (file.truncated && file.raw_url) {
  const r2 = await fetch(file.raw_url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r2.ok) return null;
  content = await r2.text();
}
return content ? JSON.parse(content) : null;
```

---

### 7. Token persisted before validation
`index.html:1646-1655`. Connect handler writes
`localStorage.setItem(GIST_TOKEN_KEY, token)` *before* any HTTP call
validates it. Bad PAT survives the failed connect; on next session
`initSync` sees a non-empty token, fires `gistPull`, gets 401, parks the
user at "Sync failed — check token" until they manually reopen the form.

**Fix:** validate first (a `GET /user` probe, or move the `setItem` calls
into the success branches of `gistPush` / `initSync`) — only persist on a
2xx.

---

### 8. Generic "check token" error misleads on 404, empty gist, network errors
`index.html:1346-1356`. Error message is hardcoded but `gistPull` returns
`null` for: 401 (token wrong), 403 (rate-limit), 404 (wrong/deleted gist
id), 5xx, network/parse errors, **and** the case where the gist exists but
doesn't contain `garden-notes.json` (line 1402). The form's own placeholder
("paste to reconnect on a new device") invites the most common false
positive: a typo'd gist id surfaces a 404 and tells the user to recreate
the only thing that's actually correct.

**Fix:**
1. Have `gistPull` return `{ ok, status, notes }` instead of `null` and
   thread distinct messages: 401 → "Token rejected", 404 → "Gist not
   found — check the Gist ID", 5xx → "GitHub error — try again", etc.
2. Treat missing `garden-notes.json` as `[]` instead of failure, so
   `initSync` can merge + seed the file on next push.

---

### 9. UI says "private gist" but the API creates a "secret" gist
`index.html:991-993`. Form copy says *"Save notes to a private GitHub Gist"*
but `public: false` creates what GitHub calls a *secret* gist — anyone with
the gist ID can fetch contents anonymously, no auth required. Since the
form encourages cross-device gist-ID sharing, "private" wording could
mislead users into treating the ID as low-sensitivity (SMS, email,
screenshots) when it's effectively a bearer token.

**Fix (one-line copy change):**

> Save notes to a secret GitHub Gist — survives reinstalls, syncs across
> devices. The Gist ID acts as a shared access token; treat it like a
> password.

---

### 10. `syncInitialized = true` set before async pull → no retry on transient failure
`index.html:1411-1418`. Guard flips to `true` *before* `await gistPull()`.
If pull fails (offline, GitHub 5xx, rate-limit), function exits with
`syncState='err'` but guard stays `true` — subsequent `setTab('notepad')`
calls hit the early return and never retry. User stuck on "Sync failed"
until reload or Manage sync → Connect.

**Fix:** only set `syncInitialized = true` on the success path (after
`saveNotes(merged)`), so a fresh tab visit naturally retries.

---

## Summary

5 normal-severity issues form a coherent picture: the sync layer was
written assuming serial, single-device operation. The fixes cluster:

- **Concurrency** (#2, #4): one push-chain promise + one init-sync promise
- **Visibility** (#1): one class-attribute fix
- **Conflict resolution** (#5): per-note `updatedAt` + tombstones
- **Reconnect path** (#3): one extra `gistPush` after merge

The 5 nits are polish — better error messages, copy fixes, validation
ordering, the >1MB edge case.
