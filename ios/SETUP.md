# der Hain — iOS App Setup

WKWebView wrapper + home screen widget. ~15 minutes in Xcode.
Wire to your phone, no App Store needed.

---

## 1 — Create the Xcode project

1. Open Xcode → **File → New → Project**
2. Choose **iOS → App** → Next
3. Fill in:
   - Product Name: `DerHain`
   - Bundle Identifier: `com.chadstewart.derhain`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Uncheck "Include Tests"
4. Save it inside this `ios/` folder (so the repo stays tidy)

---

## 2 — Wire in the app source files

1. In the Xcode project navigator, **delete** the generated `ContentView.swift`
   (move to trash)
2. Right-click the `DerHain` group → **Add Files to "DerHain"**
3. Select all three files from `ios/DerHain/`:
   - `DerHainApp.swift`
   - `ContentView.swift`
   - `WebView.swift`
4. Make sure "Copy items if needed" is **unchecked** (they're already in the right place)

---

## 3 — Add the Widget Extension target

1. **File → New → Target**
2. Choose **Widget Extension** → Next
3. Fill in:
   - Product Name: `DerHainWidget`
   - Bundle Identifier: `com.chadstewart.derhain.widget`
   - Uncheck "Include Configuration App Intent" (keep it simple)
4. Click Finish — Xcode will ask to activate the scheme, click **Activate**

---

## 4 — Wire in the widget source files

1. In the project navigator, open the `DerHainWidget` group
2. **Delete** the auto-generated widget files Xcode created (move to trash)
3. Right-click the `DerHainWidget` group → **Add Files**
4. Select both files from `ios/DerHainWidget/`:
   - `DerHainWidget.swift`
   - `DerHainWidgetBundle.swift`
5. When prompted, make sure only the **DerHainWidget** target is checked

---

## 5 — App Transport Security (should be automatic)

The app loads `https://` URLs only, so ATS is satisfied by default.
If Xcode warns about network access, add this to `Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
</dict>
```

---

## 6 — Build and run on your phone

1. Plug in your iPhone via USB
2. Select your iPhone in the device picker (top toolbar)
3. **Product → Run** (⌘R)
4. First run: Xcode will ask to trust the developer certificate on your phone —
   go to **Settings → General → VPN & Device Management → [your Apple ID] → Trust**
5. Run again — der Hain opens full-screen

---

## 7 — Add the widget to your home screen

1. Long-press any home screen → tap **+** (top left)
2. Search "der Hain"
3. Choose Small or Medium size → Add Widget
4. Widget refreshes every ~45 minutes from the GitHub API

---

## What each file does

| File | Purpose |
|---|---|
| `DerHain/DerHainApp.swift` | `@main` entry point |
| `DerHain/ContentView.swift` | Root SwiftUI view — just a full-screen WebView |
| `DerHain/WebView.swift` | `UIViewRepresentable` WKWebView wrapper with pull-to-refresh and external-link handling |
| `DerHainWidget/DerHainWidget.swift` | Timeline provider + widget views (small + medium). Fetches `projects.json` then the top tracker's first priority. Refreshes every 45 min. |
| `DerHainWidget/DerHainWidgetBundle.swift` | `@main` entry for the widget extension |

---

## Gotchas (Xcode 26+)

If you're re-doing this setup on a fresh Mac, here are the traps that bit us on the first run:

1. **Folder collision on project save.** Xcode creates a folder named after Product Name. If `ios/DerHain/` already holds the prepared `.swift` files, rename them out of the way first (`DerHain` → `DerHain-src`, `DerHainWidget` → `DerHainWidget-src`), create the project, then add files from the `-src` folders with "Copy items if needed" **checked**.
2. **Bundle ID case follows Product Name.** With Product Name `DerHain`, the bundle ID auto-derives as `com.chadstewart.DerHain` (capital D, capital H), not lowercase. The widget bundle ID will be `com.chadstewart.DerHain.DerHainWidget`. This is fine — just use matching case throughout.
3. **Target membership trap.** When adding widget files, the Add Files dialog defaults to "Add to targets: ✅ DerHain ✅ DerHainWidget" — uncheck `DerHain`. Otherwise both `DerHainApp` (@main) and `DerHainWidgetBundle` (@main) compile into the app module → "'main' attribute can only apply to one type in a module" error.
4. **Widget deployment target defaults to latest SDK.** New widget extension targets get `IPHONEOS_DEPLOYMENT_TARGET = <whatever Xcode shipped with>` (e.g. 26.4) regardless of the parent app's target (17.6). The widget will silently filter out of the home-screen gallery on any device below that SDK. **Fix:** project icon → DerHainWidgetExtension target → General → Minimum Deployments → match the app's iOS version.
5. **Bridging header prompt on widget file add.** Xcode pops a "Would you like to configure an Objective-C bridging header?" dialog when adding the prepared Swift files. Click **Don't Create** — the widget is pure Swift.
6. **Three optional checkboxes in the Widget Extension wizard.** Modern Xcode adds "Include Live Activity", "Include Control", and "Include Configuration App Intent" as default-checked options. Uncheck **all three** — they scaffold types that collide with the prepared `DerHainWidget.swift` / `DerHainWidgetBundle.swift`.
7. **AppIcon needs an actual image.** The auto-generated `AppIcon.appiconset/Contents.json` declares slots but ships no PNG, so the home-screen icon shows the default white grid. Drop a 1024×1024 PNG into the appiconset and reference it from the `filename` field in `Contents.json`. The repo's `favicon.svg` rasterizes nicely via `qlmanage -t -s 1024 -o /tmp favicon.svg`.
8. **iOS 17+ widget background API.** Widgets must use `.containerBackground(_:for:)` modifier on their root view. The pre-iOS-17 pattern of putting a color view inside a ZStack throws "Please adopt containerBackground API" on the home screen.
9. **Widget gallery cache.** After fixing any widget config, iOS sometimes caches the old (failed) extension list. To force a re-scan: delete the app from the phone, restart the phone, ⌘R fresh-install. Without the phone restart, the widget often won't appear even if the build is correct.
10. **Free Apple ID `.appex` embedding.** For widget extensions, the only valid embed mode is **Embed Without Signing** — there is no "Embed & Sign" option for `.appex`. The widget gets re-signed implicitly when the parent app is signed.

## Future ideas

- Lock screen widget (`.accessoryRectangular` family) — same data, tiny layout
- Action Button shortcut — set to open `com.chadstewart.derhain://` URL scheme
- Siri shortcut: "Open der Hain"
