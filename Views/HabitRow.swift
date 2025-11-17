import SwiftUI

struct HabitRow: View {
    @EnvironmentObject var habitStore: HabitStore
    let habit: Habit

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(habit.name)
                    .font(.headline)

                if habit.currentStreak() > 0 {
                    Text("🔥 \(habit.currentStreak()) day streak")
                        .font(.caption)
                        .foregroundColor(.orange)
                }
            }

            Spacer()

            Button(action: {
                habitStore.toggleHabit(habit)
            }) {
                Image(systemName: habit.isCompletedToday() ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundColor(habit.isCompletedToday() ? .green : .gray)
            }
            .buttonStyle(PlainButtonStyle())
        }
        .padding(.vertical, 4)
    }
}

struct HabitRow_Previews: PreviewProvider {
    static var previews: some View {
        HabitRow(habit: Habit(name: "Exercise"))
            .environmentObject(HabitStore())
            .previewLayout(.sizeThatFits)
            .padding()
    }
}
