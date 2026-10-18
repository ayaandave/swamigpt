// The home screen and lock screen widget: today's verse, the same one the Today page shows.
// It asks swamigpt.com for the reader's local date once a day (just after midnight).
import SwiftUI
import WidgetKit

struct VerseEntry: TimelineEntry {
    let date: Date
    let who: String
    let verse: String
}

private struct Today: Decodable {
    let who: String
    let verse: String
}

struct Provider: TimelineProvider {
    static let sample = VerseEntry(
        date: .now,
        who: "Krishna says",
        verse: "Thy business is with the action only, never with its fruits."
    )

    func placeholder(in context: Context) -> VerseEntry { Self.sample }

    func getSnapshot(in context: Context, completion: @escaping (VerseEntry) -> Void) {
        completion(Self.sample)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VerseEntry>) -> Void) {
        let calendar = Calendar.current
        let now = Date()
        let parts = calendar.dateComponents([.year, .month, .day], from: now)
        let day = String(format: "%04d-%02d-%02d", parts.year ?? 2026, parts.month ?? 1, parts.day ?? 1)
        let midnight = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: now) ?? now)
        var request = URLRequest(url: URL(string: "https://www.swamigpt.com/api/today?date=\(day)")!)
        request.timeoutInterval = 15
        URLSession.shared.dataTask(with: request) { data, _, _ in
            if let data, let today = try? JSONDecoder().decode(Today.self, from: data) {
                let entry = VerseEntry(date: now, who: today.who, verse: today.verse)
                completion(Timeline(entries: [entry], policy: .after(midnight)))
            } else {
                // No connection: show a verse anyway, and try again in an hour
                completion(Timeline(entries: [Self.sample], policy: .after(now.addingTimeInterval(3600))))
            }
        }.resume()
    }
}

private let sandal = Color(red: 0.949, green: 0.890, blue: 0.776)
private let kajal = Color(red: 0.169, green: 0.106, blue: 0.063)
private let kesarDeep = Color(red: 0.604, green: 0.290, blue: 0.043)

struct SwamiGPTWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: VerseEntry

    var body: some View {
        switch family {
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.who).font(.caption2).bold()
                Text(entry.verse).font(.caption).lineLimit(3)
            }
            .containerBackground(.clear, for: .widget)
        default:
            VStack(alignment: .leading, spacing: family == .systemSmall ? 4 : 6) {
                HStack(spacing: 4) {
                    Text("🪔")
                    Text("TODAY'S VERSE").font(.system(size: 10, weight: .bold)).tracking(1).foregroundStyle(kesarDeep)
                }
                Text(entry.who).font(.system(size: 13, weight: .semibold)).foregroundStyle(kajal.opacity(0.75))
                Text(entry.verse)
                    .font(.system(size: family == .systemSmall ? 14 : 16, design: .serif))
                    .foregroundStyle(kajal)
                    .lineLimit(family == .systemSmall ? 5 : 4)
                    .minimumScaleFactor(0.85)
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .containerBackground(sandal, for: .widget)
        }
    }
}

@main
struct SwamiGPTWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "SwamiGPTTodayVerse", provider: Provider()) { entry in
            SwamiGPTWidgetView(entry: entry)
        }
        .configurationDisplayName("Today's verse")
        .description("A verse from the scriptures each day, from SwamiGPT.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
    }
}
