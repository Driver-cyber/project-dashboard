import WidgetKit
import SwiftUI

// MARK: - Model

struct ProjectEntry: TimelineEntry {
    let date: Date
    let projectName: String
    let topPriority: String
    let updatedLabel: String
}

// MARK: - Fetch

private let org = "Driver-cyber"

private func fetchTopProject() async -> ProjectEntry {
    let fallback = ProjectEntry(
        date: .now, projectName: "der Hain",
        topPriority: "Tap to open", updatedLabel: ""
    )

    // 1. Load projects.json
    guard
        let configURL = URL(string: "https://raw.githubusercontent.com/\(org)/project-dashboard/main/projects.json"),
        let (configData, _) = try? await URLSession.shared.data(from: configURL),
        let projects = try? JSONDecoder().decode([[String: String]].self, from: configData),
        !projects.isEmpty
    else { return fallback }

    // 2. Fetch each tracker and pick the most recently updated
    var best: (entry: ProjectEntry, updated: String)? = nil

    for project in projects {
        guard let repo = project["repo"], let tracker = project["tracker"] else { continue }
        guard let entry = try? await fetchTracker(repo: repo, tracker: tracker) else { continue }
        if best == nil || entry.updatedLabel > (best?.updated ?? "") {
            best = (entry, entry.updatedLabel)
        }
        // Stop after finding a good one to avoid too many API calls
        if best != nil { break }
    }

    return best?.entry ?? fallback
}

private func fetchTracker(repo: String, tracker: String) async throws -> ProjectEntry? {
    let url = URL(string: "https://api.github.com/repos/\(org)/\(repo)/contents/\(tracker).html")!
    var req = URLRequest(url: url)
    req.setValue("application/vnd.github.v3+json", forHTTPHeaderField: "Accept")

    let (data, _) = try await URLSession.shared.data(for: req)

    guard
        let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
        let encoded = json["content"] as? String,
        let decoded = Data(base64Encoded: encoded.replacingOccurrences(of: "\n", with: "")),
        let html = String(data: decoded, encoding: .utf8)
    else { return nil }

    // Extract the #tracker-data JSON block
    guard
        let start = html.range(of: "application/json\">"),
        let end   = html.range(of: "</script>", range: start.upperBound..<html.endIndex)
    else { return nil }

    let jsonStr = String(html[start.upperBound..<end.lowerBound])
    guard
        let trackerData = jsonStr.data(using: .utf8),
        let td = try? JSONSerialization.jsonObject(with: trackerData) as? [String: Any]
    else { return nil }

    let projectName = td["project"] as? String ?? repo
    let updatedStr  = td["updated"] as? String ?? ""
    let columns     = td["columns"] as? [[String: Any]] ?? []
    let priorities  = columns.first?["priorities"] as? [[String: Any]] ?? []
    let topPriority = priorities.first?["title"] as? String ?? "No priorities set"

    return ProjectEntry(
        date: .now,
        projectName: projectName,
        topPriority: topPriority,
        updatedLabel: staleness(from: updatedStr)
    )
}

private func staleness(from dateStr: String) -> String {
    let fmt = DateFormatter()
    fmt.dateFormat = "yyyy-MM-dd"
    guard let d = fmt.date(from: dateStr) else { return "" }
    let days = Calendar.current.dateComponents([.day], from: d, to: .now).day ?? 0
    switch days {
    case 0:       return "today"
    case 1:       return "yesterday"
    case 2..<7:   return "\(days)d ago"
    default:      return "\(days / 7)w ago"
    }
}

// MARK: - Timeline Provider

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> ProjectEntry {
        ProjectEntry(date: .now, projectName: "kasette", topPriority: "Fix audio export on iOS 17", updatedLabel: "today")
    }

    func getSnapshot(in context: Context, completion: @escaping (ProjectEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ProjectEntry>) -> Void) {
        Task {
            let entry  = await fetchTopProject()
            let nextAt = Calendar.current.date(byAdding: .minute, value: 45, to: .now)!
            completion(Timeline(entries: [entry], policy: .after(nextAt)))
        }
    }
}

// MARK: - Widget Views

private let bgColor   = Color(red: 53/255,  green: 82/255,  blue: 58/255)
private let inkColor  = Color(red: 232/255, green: 238/255, blue: 226/255)
private let sageColor = Color(red: 180/255, green: 201/255, blue: 176/255)
private let dimColor  = Color(red: 126/255, green: 138/255, blue: 124/255)

struct WidgetView: View {
    let entry: ProjectEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack(alignment: .topLeading) {
            bgColor
            VStack(alignment: .leading, spacing: 5) {
                HStack(alignment: .firstTextBaseline) {
                    Text("der Hain")
                        .font(.system(size: 11, weight: .regular, design: .serif).italic())
                        .foregroundColor(sageColor)
                    Spacer()
                    if !entry.updatedLabel.isEmpty {
                        Text(entry.updatedLabel)
                            .font(.system(size: 9, design: .monospaced))
                            .foregroundColor(dimColor)
                    }
                }

                Text(entry.projectName)
                    .font(.system(size: family == .systemSmall ? 16 : 20, weight: .semibold))
                    .foregroundColor(inkColor)
                    .lineLimit(1)

                Text(entry.topPriority)
                    .font(.system(size: family == .systemSmall ? 11 : 13))
                    .foregroundColor(sageColor)
                    .lineLimit(family == .systemSmall ? 2 : 3)
                    .fixedSize(horizontal: false, vertical: true)

                Spacer(minLength: 0)
            }
            .padding(family == .systemSmall ? 13 : 16)
        }
    }
}

// MARK: - Widget Declaration

struct DerHainWidget: Widget {
    let kind = "DerHainWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            WidgetView(entry: entry)
        }
        .configurationDisplayName("der Hain")
        .description("Top priority from your most active project.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
