// Habit Tracker App
class HabitTracker {
    constructor() {
        this.habits = this.loadHabits();
        this.initializeEventListeners();
        this.updateDateDisplay();
        this.renderHabits();
    }

    // Load habits from localStorage
    loadHabits() {
        const stored = localStorage.getItem('habits');
        if (stored) {
            return JSON.parse(stored);
        }
        // Return sample habits for first-time users
        return [
            { id: this.generateId(), name: 'Exercise', completedDates: [], createdDate: new Date().toISOString() },
            { id: this.generateId(), name: 'Read', completedDates: [], createdDate: new Date().toISOString() },
            { id: this.generateId(), name: 'Meditate', completedDates: [], createdDate: new Date().toISOString() }
        ];
    }

    // Save habits to localStorage
    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    // Generate unique ID
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get today's date as string (YYYY-MM-DD)
    getTodayString() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    // Format date for display
    formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Update date display
    updateDateDisplay() {
        const dateElement = document.getElementById('currentDate');
        dateElement.textContent = this.formatDate(new Date());
    }

    // Check if habit is completed today
    isCompletedToday(habit) {
        return habit.completedDates.includes(this.getTodayString());
    }

    // Toggle habit completion
    toggleHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = this.getTodayString();
        const index = habit.completedDates.indexOf(today);

        if (index > -1) {
            habit.completedDates.splice(index, 1);
        } else {
            habit.completedDates.push(today);
        }

        this.saveHabits();
        this.renderHabits();
    }

    // Calculate current streak
    calculateStreak(habit) {
        if (habit.completedDates.length === 0) return 0;

        const sortedDates = habit.completedDates
            .map(d => new Date(d))
            .sort((a, b) => b - a);

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedDates.length; i++) {
            const habitDate = new Date(sortedDates[i]);
            habitDate.setHours(0, 0, 0, 0);

            const expectedDate = new Date(currentDate);
            expectedDate.setDate(expectedDate.getDate() - streak);

            if (habitDate.getTime() === expectedDate.getTime()) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    // Add new habit
    addHabit(name) {
        const newHabit = {
            id: this.generateId(),
            name: name.trim(),
            completedDates: [],
            createdDate: new Date().toISOString()
        };

        this.habits.push(newHabit);
        this.saveHabits();
        this.renderHabits();
    }

    // Delete habit
    deleteHabit(habitId) {
        this.habits = this.habits.filter(h => h.id !== habitId);
        this.saveHabits();
        this.renderHabits();
    }

    // Render habits to DOM
    renderHabits() {
        const habitsList = document.getElementById('habitsList');
        const emptyState = document.getElementById('emptyState');

        if (this.habits.length === 0) {
            habitsList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        habitsList.style.display = 'flex';
        emptyState.style.display = 'none';

        habitsList.innerHTML = this.habits.map(habit => {
            const isCompleted = this.isCompletedToday(habit);
            const streak = this.calculateStreak(habit);

            return `
                <div class="habit-card">
                    <div class="habit-info">
                        <div class="habit-name">${this.escapeHtml(habit.name)}</div>
                        ${streak > 0 ? `<div class="habit-streak">🔥 ${streak} day streak</div>` : ''}
                    </div>
                    <div class="habit-actions">
                        <button class="checkbox-btn ${isCompleted ? 'checked' : ''}"
                                onclick="habitTracker.toggleHabit('${habit.id}')"
                                aria-label="${isCompleted ? 'Mark as incomplete' : 'Mark as complete'}">
                        </button>
                        <button class="delete-btn"
                                onclick="habitTracker.confirmDelete('${habit.id}')"
                                aria-label="Delete habit">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Confirm delete
    confirmDelete(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (habit && confirm(`Are you sure you want to delete "${habit.name}"?`)) {
            this.deleteHabit(habitId);
        }
    }

    // Initialize event listeners
    initializeEventListeners() {
        const addHabitBtn = document.getElementById('addHabitBtn');
        const modal = document.getElementById('addHabitModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const saveHabitBtn = document.getElementById('saveHabitBtn');
        const habitNameInput = document.getElementById('habitNameInput');

        // Open modal
        addHabitBtn.addEventListener('click', () => {
            modal.classList.add('active');
            habitNameInput.value = '';
            habitNameInput.focus();
        });

        // Close modal
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        // Save habit
        saveHabitBtn.addEventListener('click', () => {
            const name = habitNameInput.value.trim();
            if (name) {
                this.addHabit(name);
                modal.classList.remove('active');
            }
        });

        // Save on Enter key
        habitNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const name = habitNameInput.value.trim();
                if (name) {
                    this.addHabit(name);
                    modal.classList.remove('active');
                }
            }
        });

        // Enable/disable save button based on input
        habitNameInput.addEventListener('input', () => {
            saveHabitBtn.disabled = !habitNameInput.value.trim();
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    }
}

// Initialize the app when DOM is loaded
let habitTracker;
document.addEventListener('DOMContentLoaded', () => {
    habitTracker = new HabitTracker();
});

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(err => console.log('ServiceWorker registration failed'));
    });
}
