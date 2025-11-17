// Habit Tracker App - Calendar View
class HabitTracker {
    constructor() {
        this.habits = this.loadHabits();
        this.currentHabitId = null;
        this.currentMonth = new Date();
        this.editingHabitId = null;

        this.initializeEventListeners();
        this.render();
    }

    // Load habits from localStorage
    loadHabits() {
        const stored = localStorage.getItem('habits_v2');
        if (stored) {
            return JSON.parse(stored);
        }
        // Return sample habit for first-time users
        const sampleHabit = {
            id: this.generateId(),
            name: 'Daily Meditation',
            goal: '2 minutes of meditation every day',
            startDate: this.formatDate(new Date()),
            completedDates: []
        };
        return [sampleHabit];
    }

    // Save habits to localStorage
    saveHabits() {
        localStorage.setItem('habits_v2', JSON.stringify(this.habits));
    }

    // Generate unique ID
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    // Format date as YYYY-MM-DD
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Parse date string to Date object
    parseDate(dateStr) {
        return new Date(dateStr + 'T00:00:00');
    }

    // Format date for display
    formatDateDisplay(dateStr) {
        const date = this.parseDate(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Check if a date is in the future
    isFutureDate(dateStr) {
        const date = this.parseDate(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date > today;
    }

    // Toggle habit completion for a specific date
    toggleDate(habitId, dateStr) {
        if (this.isFutureDate(dateStr)) return;

        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const index = habit.completedDates.indexOf(dateStr);
        if (index > -1) {
            habit.completedDates.splice(index, 1);
        } else {
            habit.completedDates.push(dateStr);
        }

        this.saveHabits();
        this.renderHabitView();
    }

    // Calculate current streak
    calculateStreak(habit) {
        if (habit.completedDates.length === 0) return 0;

        const sortedDates = habit.completedDates
            .map(d => this.parseDate(d))
            .sort((a, b) => b - a);

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (let date of sortedDates) {
            date.setHours(0, 0, 0, 0);
            const expectedDate = new Date(currentDate);
            expectedDate.setDate(expectedDate.getDate() - streak);

            if (date.getTime() === expectedDate.getTime()) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    // Add new habit
    addHabit(name, goal, startDate) {
        const newHabit = {
            id: this.generateId(),
            name: name.trim(),
            goal: goal.trim(),
            startDate: startDate,
            completedDates: []
        };

        this.habits.push(newHabit);
        this.currentHabitId = newHabit.id;
        this.saveHabits();
        this.render();
    }

    // Update existing habit
    updateHabit(habitId, name, goal, startDate) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        habit.name = name.trim();
        habit.goal = goal.trim();
        habit.startDate = startDate;

        this.saveHabits();
        this.render();
    }

    // Delete habit
    deleteHabit(habitId) {
        this.habits = this.habits.filter(h => h.id !== habitId);

        if (this.currentHabitId === habitId) {
            this.currentHabitId = this.habits.length > 0 ? this.habits[0].id : null;
        }

        this.saveHabits();
        this.render();
    }

    // Generate calendar for a specific month
    generateCalendar(year, month, habit) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const habitStartDate = this.parseDate(habit.startDate);

        const weeks = [];
        let currentWeek = [];
        let weekNumber = 1;

        // Start from the habit start date or first day of month, whichever is later
        let startDate = new Date(Math.max(firstDay, habitStartDate));
        startDate.setDate(1); // Always start from first of month for display

        if (habitStartDate > lastDay) {
            return weeks; // Habit hasn't started in this month
        }

        // Adjust to start of week (Monday)
        const currentDay = new Date(year, month, 1);
        let dayOfWeek = currentDay.getDay();
        dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Sunday=6

        // Fill in days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const dateStr = this.formatDate(date);
            const dow = date.getDay();
            const dowMonday = dow === 0 ? 6 : dow - 1;

            // Start new week on Monday
            if (dowMonday === 0 && currentWeek.length > 0) {
                weeks.push({ weekNumber: weekNumber++, days: currentWeek });
                currentWeek = [];
            }

            // Add empty slots for first week
            if (day === 1 && dowMonday > 0) {
                for (let i = 0; i < dowMonday; i++) {
                    currentWeek.push(null);
                }
            }

            const isBeforeStart = date < habitStartDate;
            currentWeek.push({
                day: day,
                date: dateStr,
                disabled: isBeforeStart || this.isFutureDate(dateStr),
                checked: habit.completedDates.includes(dateStr)
            });
        }

        // Add last week
        if (currentWeek.length > 0) {
            // Fill remaining days of week
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push({ weekNumber: weekNumber, days: currentWeek });
        }

        return weeks;
    }

    // Render habit tabs
    renderHabitTabs() {
        const habitSelector = document.getElementById('habitSelector');

        if (this.habits.length === 0) {
            habitSelector.style.display = 'none';
            return;
        }

        habitSelector.style.display = 'flex';

        if (!this.currentHabitId && this.habits.length > 0) {
            this.currentHabitId = this.habits[0].id;
        }

        habitSelector.innerHTML = this.habits.map(habit => `
            <div class="habit-tab ${habit.id === this.currentHabitId ? 'active' : ''}"
                 onclick="habitTracker.selectHabit('${habit.id}')">
                ${this.escapeHtml(habit.name)}
            </div>
        `).join('');
    }

    // Select a habit to view
    selectHabit(habitId) {
        this.currentHabitId = habitId;
        this.currentMonth = new Date();
        this.renderHabitView();
    }

    // Render the calendar view for current habit
    renderHabitView() {
        const habitView = document.getElementById('habitView');
        const emptyState = document.getElementById('emptyState');

        if (this.habits.length === 0 || !this.currentHabitId) {
            habitView.style.display = 'none';
            emptyState.style.display = 'block';
            this.renderHabitTabs();
            return;
        }

        habitView.style.display = 'block';
        emptyState.style.display = 'none';

        const habit = this.habits.find(h => h.id === this.currentHabitId);
        if (!habit) return;

        const streak = this.calculateStreak(habit);
        const totalDays = habit.completedDates.length;

        // Render header
        let html = `
            <div class="habit-header">
                <div class="habit-title">
                    ${this.escapeHtml(habit.name)}
                    <button class="edit-habit-btn" onclick="habitTracker.openEditModal('${habit.id}')">✏️ Edit</button>
                </div>
                ${habit.goal ? `<div class="habit-goal">Goal: ${this.escapeHtml(habit.goal)}</div>` : ''}
                <div class="habit-start-date">Start Date: ${this.formatDateDisplay(habit.startDate)}</div>
                <div class="habit-stats">
                    <div class="stat-item">
                        🔥 Current Streak: <span class="stat-value">${streak}</span> days
                    </div>
                    <div class="stat-item">
                        ✓ Total Completed: <span class="stat-value">${totalDays}</span> days
                    </div>
                </div>
            </div>
        `;

        // Generate calendars for current month and next month
        const startDate = this.parseDate(habit.startDate);
        const currentDate = new Date();

        // Show from start month to current month + 1
        let displayMonths = [];
        let iterDate = new Date(startDate);
        const endDate = new Date(currentDate);
        endDate.setMonth(endDate.getMonth() + 2); // Show 2 months ahead

        while (iterDate <= endDate) {
            displayMonths.push(new Date(iterDate));
            iterDate.setMonth(iterDate.getMonth() + 1);
        }

        // Render each month
        for (let monthDate of displayMonths) {
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth();
            const monthName = monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

            const weeks = this.generateCalendar(year, month, habit);

            if (weeks.length === 0) continue;

            html += `
                <div class="calendar-month">
                    <div class="calendar-nav">
                        <div class="month-title">${monthName}</div>
                    </div>
                    <div class="calendar-grid">
                        <div class="calendar-header">
                            <div class="calendar-header-cell" style="width: 100px;"></div>
                            <div class="calendar-header-cell">Mon</div>
                            <div class="calendar-header-cell">Tue</div>
                            <div class="calendar-header-cell">Wed</div>
                            <div class="calendar-header-cell">Thu</div>
                            <div class="calendar-header-cell">Fri</div>
                            <div class="calendar-header-cell">Sat</div>
                            <div class="calendar-header-cell">Sun</div>
                        </div>
            `;

            weeks.forEach(week => {
                html += `<div class="week-row">`;
                html += `<div class="week-label">Week ${week.weekNumber}</div>`;

                week.days.forEach(day => {
                    if (day === null) {
                        html += `<div class="day-cell"></div>`;
                    } else {
                        const futureClass = day.disabled ? 'future' : '';
                        const disabledAttr = day.disabled ? 'disabled' : '';
                        const checkedAttr = day.checked ? 'checked' : '';

                        html += `
                            <div class="day-cell">
                                <div class="day-checkbox-wrapper">
                                    <div class="day-label">${day.day}</div>
                                    <input type="checkbox"
                                           class="day-checkbox ${futureClass}"
                                           ${disabledAttr}
                                           ${checkedAttr}
                                           onchange="habitTracker.toggleDate('${habit.id}', '${day.date}')"
                                           aria-label="${monthName} ${day.day}">
                                </div>
                            </div>
                        `;
                    }
                });

                html += `</div>`;
            });

            html += `</div></div>`;
        }

        habitView.innerHTML = html;
        this.renderHabitTabs();
    }

    // Open modal for adding new habit
    openAddModal() {
        this.editingHabitId = null;
        document.getElementById('modalTitle').textContent = 'New Habit';
        document.getElementById('habitNameInput').value = '';
        document.getElementById('habitGoalInput').value = '';
        document.getElementById('habitStartDate').value = this.formatDate(new Date());
        document.getElementById('deleteHabitBtn').style.display = 'none';
        document.getElementById('habitModal').classList.add('active');
        document.getElementById('habitNameInput').focus();
    }

    // Open modal for editing habit
    openEditModal(habitId) {
        this.editingHabitId = habitId;
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        document.getElementById('modalTitle').textContent = 'Edit Habit';
        document.getElementById('habitNameInput').value = habit.name;
        document.getElementById('habitGoalInput').value = habit.goal;
        document.getElementById('habitStartDate').value = habit.startDate;
        document.getElementById('deleteHabitBtn').style.display = 'block';
        document.getElementById('habitModal').classList.add('active');
        document.getElementById('habitNameInput').focus();
    }

    // Close modal
    closeModal() {
        document.getElementById('habitModal').classList.remove('active');
        this.editingHabitId = null;
    }

    // Save habit from modal
    saveHabitFromModal() {
        const name = document.getElementById('habitNameInput').value.trim();
        const goal = document.getElementById('habitGoalInput').value.trim();
        const startDate = document.getElementById('habitStartDate').value;

        if (!name || !startDate) {
            alert('Please enter a habit name and start date');
            return;
        }

        if (this.editingHabitId) {
            this.updateHabit(this.editingHabitId, name, goal, startDate);
        } else {
            this.addHabit(name, goal, startDate);
        }

        this.closeModal();
    }

    // Confirm and delete habit
    confirmDeleteHabit() {
        if (!this.editingHabitId) return;

        const habit = this.habits.find(h => h.id === this.editingHabitId);
        if (habit && confirm(`Are you sure you want to delete "${habit.name}"?`)) {
            this.deleteHabit(this.editingHabitId);
            this.closeModal();
        }
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Full render
    render() {
        this.renderHabitView();
    }

    // Initialize event listeners
    initializeEventListeners() {
        const addHabitBtn = document.getElementById('addHabitBtn');
        const modal = document.getElementById('habitModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const saveHabitBtn = document.getElementById('saveHabitBtn');
        const deleteHabitBtn = document.getElementById('deleteHabitBtn');
        const habitNameInput = document.getElementById('habitNameInput');

        addHabitBtn.addEventListener('click', () => this.openAddModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        saveHabitBtn.addEventListener('click', () => this.saveHabitFromModal());
        deleteHabitBtn.addEventListener('click', () => this.confirmDeleteHabit());

        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Save on Enter key in name input
        habitNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveHabitFromModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeModal();
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
