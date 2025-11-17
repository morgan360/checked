import Foundation

struct Habit: Identifiable, Codable {
    var id = UUID()
    var name: String
    var completedDates: Set<String> = [] // Store dates as "yyyy-MM-dd" strings
    var createdDate: Date = Date()

    func isCompletedToday() -> Bool {
        let today = Date.todayString()
        return completedDates.contains(today)
    }

    mutating func toggleToday() {
        let today = Date.todayString()
        if completedDates.contains(today) {
            completedDates.remove(today)
        } else {
            completedDates.insert(today)
        }
    }

    func currentStreak() -> Int {
        var streak = 0
        var currentDate = Date()
        let calendar = Calendar.current

        while completedDates.contains(currentDate.toString()) {
            streak += 1
            guard let yesterday = calendar.date(byAdding: .day, value: -1, to: currentDate) else {
                break
            }
            currentDate = yesterday
        }

        return streak
    }
}

extension Date {
    static func todayString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: Date())
    }

    func toString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: self)
    }
}
