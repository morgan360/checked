import SwiftUI

struct ContentView: View {
    @EnvironmentObject var habitStore: HabitStore
    @State private var showingAddHabit = false

    var body: some View {
        NavigationView {
            List {
                ForEach(habitStore.habits) { habit in
                    HabitRow(habit: habit)
                }
                .onDelete(perform: habitStore.deleteHabit)
            }
            .navigationTitle("Daily Habits")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        showingAddHabit = true
                    }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddHabit) {
                AddHabitView()
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(HabitStore())
    }
}
