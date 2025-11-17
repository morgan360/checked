import Foundation
import SwiftUI

class HabitStore: ObservableObject {
    @Published var habits: [Habit] = [] {
        didSet {
            saveHabits()
        }
    }

    private let habitsKey = "SavedHabits"

    init() {
        loadHabits()
    }

    func addHabit(name: String) {
        let newHabit = Habit(name: name)
        habits.append(newHabit)
    }

    func deleteHabit(at offsets: IndexSet) {
        habits.remove(atOffsets: offsets)
    }

    func toggleHabit(_ habit: Habit) {
        if let index = habits.firstIndex(where: { $0.id == habit.id }) {
            habits[index].toggleToday()
        }
    }

    private func saveHabits() {
        if let encoded = try? JSONEncoder().encode(habits) {
            UserDefaults.standard.set(encoded, forKey: habitsKey)
        }
    }

    private func loadHabits() {
        if let savedHabits = UserDefaults.standard.data(forKey: habitsKey),
           let decodedHabits = try? JSONDecoder().decode([Habit].self, from: savedHabits) {
            habits = decodedHabits
        } else {
            // Add some sample habits for first-time users
            habits = [
                Habit(name: "Exercise"),
                Habit(name: "Read"),
                Habit(name: "Meditate")
            ]
        }
    }
}
