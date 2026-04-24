# CLAUDE.md — Garden App Constitution
*Governing document for the `Driver-cyber/garden-app` repo*
*Drafted: 2026-04-24 — copy this file to CLAUDE.md when you initialize the repo*

---

## 🌾 North Star

Garden is Chad's personal iPhone app for presence and clarity. It has three jobs:

1. **Get ideas out of your head** — quick-capture notes organized by category, exportable to Claude Code
2. **Check off the one thing** — a single daily checkbox that, when done, earns you confetti and permission to put your phone down
3. **Return to calm** — a wheat field you can watch for ten seconds and remember why any of this matters

This is not a productivity app. It is an anti-productivity app. The goal is fewer minutes on the phone, not more. Every design decision should be tested against: *does this help Chad be more present, or does it give him another reason to stay in the app?*

**Origin:** Garden grew out of the Notepad and Calm tabs in the `project-dashboard` web app (Driver-cyber/project-dashboard). The web version proved the concept. This is the native iPhone version — same soul, native material.

---

## 🏗 What This Repo Contains

| File / Folder | Purpose |
|---|---|
| `GardenApp/` | Xcode project root — all Swift source |
| `GardenApp/Models/` | SwiftData model definitions |
| `GardenApp/Views/` | SwiftUI views, organized by screen |
| `GardenApp/Design/` | Color palette, typography helpers |
| `GardenApp.xcodeproj/` | Xcode project file — do not hand-edit |
| `garden-app-tracker.html` | Build tracker (same format as other Driver-cyber trackers) |
| `learned-log.json` | Append-only learning log (same schema as project-dashboard) |
| `CLAUDE.md` | This file |
| `DECISIONS.md` | Living decision log |

---

## 🛠 Architecture

**Platform:** iOS 17+ (SwiftUI + SwiftData + CloudKit)

**Why SwiftUI over React Native:**
The feel *is* the product. Wheat field animation, haptic feedback on the checkbox, spring animations on note cards — these need to be native. SwiftUI gives 60fps animations, native haptics, and iCloud sync via CloudKit with almost no boilerplate. React Native can approximate it but the gap in feel is real.

**Why SwiftData + CloudKit:**
Notes persist across reinstalls and devices automatically. SwiftData with the `.modelContainer(for:..., cloudKitDatabase: .automatic)` flag does the sync without any extra code. No tokens, no Gist IDs, no setup steps for the user.

**Data flow:**
```
User types note
  → SwiftData save (local, instant)
  → CloudKit sync (background, automatic)
  → Available on all signed-in devices
```

**No backend.** No server. No API keys. iCloud is the backend.

---

## 📐 Design System

The Garden palette is locked. These are the source values from the web app — translate them to Xcode Color Sets (Assets.xcassets) with matching light/dark variants.

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#F2EDE3` | `#1A1F18` | App background |
| `paper` | `#FAF7F0` | `#222820` | Card surfaces |
| `ink` | `#2C3328` | `#E8E0D0` | Primary text |
| `ink2` | `#4A5448` | `#B4BEB0` | Secondary text |
| `ink3` | `#7E887C` | `#7C867A` | Tertiary / hints |
| `line` | `#DDD5C3` | `#2A3228` | Borders |
| `sageDeep` | `#35523A` | `#B4D3AE` | Primary action color |
| `sageSoft` | `#8EAE8A` | `#6A8E66` | Secondary accent |
| `sageTint` | `#E8F0E6` | `#1E2B1E` | Tinted backgrounds |
| `blush` | `#DDB2AE` | `#D6A8A2` | Warning / destructive tint |
| `blushDeep` | `#6E3A36` | `#ECBDB6` | Warning / destructive text |
| `wheat` | `#C8A96E` | `#A88A4E` | Wheat field blades |
| `sky` | `#87CEEB` | `#1A3A5C` | Calm screen sky |

**Typography:**
- Serif headings: bundle `Instrument Serif` (download from Google Fonts, add to project). Use `.italic()` for the signature cursive feel.
- Body / UI: SF Pro (system default — never specify this, just use `.body`, `.caption`, etc.)
- Monospace (note timestamps, category tags): `.monospacedSystemFont(ofSize:weight:)` or SF Mono

**Spacing:** Use multiples of 4pt. Cards have 16pt padding. Compose areas have 14pt padding.

**Animations:** Use `.spring(response: 0.35, dampingFraction: 0.72)` as the default spring. Match the web app's smooth feel.

---

## 🗃 Data Model

```swift
// Models/Note.swift
@Model
final class Note {
    var id: UUID = UUID()
    var categoryID: UUID          // FK to Category
    var text: String
    var createdAt: Date = Date()
    var status: NoteStatus = .active

    init(categoryID: UUID, text: String) {
        self.categoryID = categoryID
        self.text = text
    }
}

enum NoteStatus: String, Codable {
    case active, archived
}

// Models/Category.swift
@Model
final class Category {
    var id: UUID = UUID()
    var name: String
    var createdAt: Date = Date()
    var sortOrder: Int = 0        // user can reorder

    init(name: String) {
        self.name = name
    }
}

// "Ideas / TBD" is a seeded Category, not a sentinel value.
// Create it in the app's first-launch seed:
//   Category(name: "Ideas / TBD")
// Its ID is stored in UserDefaults as "garden.tbd.categoryID"
// so it can be found without special-casing.
```

**One Thing state** (resets daily, doesn't need CloudKit):
```swift
// Stored in UserDefaults — key: "garden.oneThingCheckedDate"
// If the stored date is today, the checkbox is checked.
// Reset = just don't write today's date.
```

**ModelContainer setup** (GardenApp.swift):
```swift
@main
struct GardenApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [Note.self, Category.self], cloudKitDatabase: .automatic)
    }
}
```

---

## 🖼 View Hierarchy

```
ContentView (TabView)
├── NotesView                      — tab 1
│   ├── NoteComposerView           — top: category picker + textarea + Add button
│   ├── CategoryChipsView          — filter chips (All, Ideas/TBD, [user categories])
│   ├── NoteListView               — scrollable list of active notes
│   │   └── NoteRowView            — individual card: project tag, timestamp, text, Archive/Delete
│   ├── ArchivedNotesView          — collapsible section at bottom
│   └── ExportView (sheet)         — markdown preview, Copy / Copy as Prompt / Share
│       └── ArchivePickerView      — "archive exported notes?" step
└── CalmView                       — tab 2
    ├── WheatFieldView             — 80 animated blade divs → SwiftUI Canvas or GeometryReader
    ├── OneThing card              — "I did the one thing today" checkbox + confetti
    └── ConfettiView               — burst animation overlay on checkbox tap
```

**Tab bar:** Two tabs only. Notes (pencil icon) and Calm (leaf or wheat icon). No nav bar on CalmView — it should feel like stepping outside.

---

## 🌾 Calm Screen Engineering Notes

**Wheat field:** Recreate the web animation in SwiftUI using `TimelineView` + `Canvas` for performance, or as individual `Rectangle` views with `.rotationEffect` and `withAnimation(.linear(duration:).repeatForever())`. The Canvas approach handles 80 blades at 60fps without dropping frames.

```swift
// Blade animation pattern (pseudocode)
// Each blade: height 60–100% of field height, random width 2–4pt
// Sway: rotationEffect from -6° to +6°, transform origin at bottom
// Animation: linear, duration 3.0–3.6s, staggered delay = -(i/N) * waves * period
// This creates a traveling wave left-to-right
```

**Confetti:** Fixed-position colored rectangles (4–8pt wide, 12–16pt tall) launched from the checkbox position. Use `.offset` + `.opacity` + `.rotationEffect` animated with `.spring()`. Scatter 20–30 pieces using random `dx`/`dy` offsets, fading out over 0.8s.

**Haptic feedback:** On checkbox check → `.impact(.medium)`. On confetti burst → `.notification(.success)`. These are the moments that make the native app feel alive vs. the web version.

---

## 📤 Export Flow

Same two-step flow as the web app:

**Step 1 — Preview:**
- Select category → shows markdown preview
- Three buttons: **Copy markdown** | **Copy as prompt** | **Share** (iOS Share Sheet)
- "Copy as prompt" wraps in: `"Here are my notes for [category]. Please implement these:\n\n[markdown]"`

**Step 2 — Archive picker:**
- "Archive exported notes?" checkbox list
- **Archive checked** | **Keep all active**

The Share button uses `ShareLink` (SwiftUI native) — simpler than the web's download approach and more powerful (AirDrop, Notes, iMessage, etc.).

---

## ⚙️ Session-End Protocol

Same as project-dashboard:

1. **Update `garden-app-tracker.html`** — move completed priorities to backlog, pull up next items, bump the `updated` date.
2. **Append to `learned-log.json`** — one entry per meaningful completion.
3. **Optionally ask Chad** one question: "Anything specific to note from today?"
4. **Commit:** `"[garden-app] — [what changed] | log updated"`

---

## 🚀 Session Startup Protocol

1. **Read `DECISIONS.md`** — understand current phase and open questions.
2. **Read `garden-app-tracker.html`** — check current build priorities.
3. **Never read the Xcode project file** (`*.xcodeproj`) — it's XML, not useful.
4. **Ask before refactoring** — SwiftUI views can be refactored in many ways; pick one and stick to it rather than restructuring each session.

---

## 🔧 Xcode Project Setup Checklist

*For the Claude Code session that initializes the repo:*

- [ ] Create new Xcode project: `File → New → App`, name `Garden`, bundle ID `com.drivercyber.garden`
- [ ] Target: iOS 17+, SwiftUI interface, SwiftData storage
- [ ] Enable CloudKit capability: `Signing & Capabilities → + Capability → iCloud → CloudKit`
- [ ] Create CloudKit container: `iCloud.com.drivercyber.garden`
- [ ] Add `Instrument Serif` font files to project, register in `Info.plist` under `UIAppFonts`
- [ ] Create `Assets.xcassets` Color Sets for all 14 design tokens above (light + dark each)
- [ ] Create `Design/GardenColors.swift` — `extension Color` with static vars using those asset names
- [ ] Seed "Ideas / TBD" category on first launch (check `UserDefaults.standard.bool(forKey: "garden.seeded")`)

---

## 🚫 Out of Scope (v1)

| What | Why parked |
|---|---|
| Android | SwiftUI is iOS-only; cross-platform requires a rewrite |
| Widgets | Good idea for "one thing" on home screen — revisit after v1 ships |
| Notifications / reminders | Scope creep; the app should earn opens, not demand them |
| Collaboration / sharing | This is Chad's personal tool |
| Backend / API | iCloud is the backend |
| Dark mode toggle | Follows system automatically — no manual toggle |

---

## 🔑 Key Decisions Already Made

| Decision | Rationale |
|---|---|
| SwiftUI + SwiftData over React Native | Native feel is the product; CloudKit sync for free |
| Categories not repos | App is standalone; no GitHub dependency |
| Two tabs only (Notes + Calm) | Dashboard view not needed; notes list *is* the dashboard |
| "Ideas / TBD" is a seeded Category | No sentinel values; consistent data model |
| Daily reset for One Thing | Resets at midnight via date comparison, not a timer |
| No account/auth beyond iCloud | User is always Chad; iCloud is already authenticated |

---

## 💡 Future Ideas (Parking Lot)

- **"One Thing" widget** — home screen widget showing today's one thing with a tap-to-check interaction
- **Project Dashboard integration** — the web dashboard could show a "Garden Notes" card pulling from the public-facing export (a shared Gist or JSON endpoint)
- **Annual review** — Claude generates a reflection from `learned-log.json` + note export, same pattern as project-dashboard
- **Shortcut / Siri integration** — "Hey Siri, add to Garden" → quick-capture sheet
- **Calm screen variations** — rain, snow, night sky — seasonal alternates driven by the device calendar

---

*This constitution was drafted by Claude Sonnet 4.6 on 2026-04-24 based on the working web implementation in `Driver-cyber/project-dashboard`. The Notepad and Calm tabs in that repo are the reference implementation — read `index.html` there for the exact animation math and export flow before building the native equivalents.*
