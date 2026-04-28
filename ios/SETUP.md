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

## Future ideas

- Lock screen widget (`.accessoryRectangular` family) — same data, tiny layout
- Action Button shortcut — set to open `com.chadstewart.derhain://` URL scheme
- Siri shortcut: "Open der Hain"
