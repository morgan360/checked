# Daily Habit Tracker iOS App

A simple and elegant iOS app for tracking daily habits with checkboxes and streak counters.

## Features

- ✅ Daily checkbox for each habit
- 🔥 Streak counter to track consecutive days
- ➕ Add custom habits
- 🗑️ Swipe to delete habits
- 💾 Automatic data persistence
- 📱 Native iOS design with SwiftUI

## Project Structure

```
checked/
├── HabitTrackerApp.swift      # Main app entry point
├── Models/
│   ├── Habit.swift             # Habit data model
│   └── HabitStore.swift        # Data persistence and management
└── Views/
    ├── ContentView.swift       # Main habit list view
    ├── HabitRow.swift          # Individual habit row component
    └── AddHabitView.swift      # Add new habit screen
```

## How to Set Up in Xcode

Since this repository contains Swift source files without the Xcode project files, follow these steps to create the project:

### Option 1: Create New Xcode Project (Recommended)

1. Open Xcode
2. Select "Create a new Xcode project"
3. Choose "iOS" → "App" → Click "Next"
4. Fill in the project details:
   - Product Name: `HabitTracker` (or any name you prefer)
   - Team: Your team (or leave as None for personal use)
   - Organization Identifier: `com.yourname` (or your identifier)
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Storage: None (we're using UserDefaults)
5. Choose this `checked` folder as the location
6. Delete the default `ContentView.swift` and `HabitTrackerApp.swift` files that Xcode creates
7. In Xcode, right-click on the project navigator and select "Add Files to HabitTracker"
8. Add all the Swift files from this repository:
   - `HabitTrackerApp.swift`
   - `Models/` folder with both files
   - `Views/` folder with all view files

### Option 2: Manual Xcode Project Setup

1. Open Xcode
2. Select File → New → Project
3. Choose iOS → App
4. Set the project name and ensure SwiftUI is selected
5. Save in a different location first
6. Copy all `.swift` files from this repository into the Xcode project
7. Organize them into groups matching the folder structure

## Running the App

1. Open the project in Xcode
2. Select a simulator or your iPhone as the target device
3. Press `Cmd + R` or click the Play button to build and run
4. The app will launch with three sample habits (Exercise, Read, Meditate)

## How to Use

1. **Check off a habit**: Tap the circle next to any habit to mark it complete for today
2. **Add a new habit**: Tap the "+" button in the top right
3. **Delete a habit**: Swipe left on any habit and tap "Delete"
4. **View streak**: Complete a habit multiple days in a row to see your streak count

## Requirements

- iOS 15.0 or later
- Xcode 13.0 or later
- Swift 5.5 or later

## Data Persistence

All habits and completion data are automatically saved to UserDefaults, so your progress persists between app launches.

## Customization Ideas

Here are some ways you can extend this app:

- Add different habit categories (health, productivity, social, etc.)
- Include time-of-day tracking (morning/evening habits)
- Add weekly/monthly statistics and graphs
- Implement notifications/reminders
- Add habit notes or journal entries
- Create different themes or color schemes
- Add goals (e.g., complete 30 days in a row)
- Export habit data to CSV

## License

This project is open source and available for personal and educational use.
