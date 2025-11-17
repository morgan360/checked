// Habit Tracker App - Multiple Views
class HabitTracker {
    constructor() {
        this.habits = this.loadHabits();
        this.currentHabitId = null;
        this.currentMonth = new Date();
        this.editingHabitId = null;
        this.currentView = 'calendar'; // calendar, weekly, yearly, graph
        this.currentYear = new Date().getFullYear();

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

    // Render the appropriate view for current habit
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

        // Dispatch to appropriate view renderer
        switch (this.currentView) {
            case 'weekly':
                this.renderWeeklyView(habit);
                break;
            case 'yearly':
                this.renderYearlyView(habit);
                break;
            case 'graph':
                this.renderGraphView(habit);
                break;
            default:
                this.renderCalendarView(habit);
        }

        this.renderHabitTabs();
    }

    // Render the calendar view for current habit
    renderCalendarView(habit) {
        const habitView = document.getElementById('habitView');

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
    }

    // Render weekly view
    renderWeeklyView(habit) {
        const habitView = document.getElementById('habitView');
        const streak = this.calculateStreak(habit);
        const totalDays = habit.completedDates.length;

        // Generate header
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
            <div class="weekly-view">
        `;

        // Generate weeks from start date to now
        const startDate = this.parseDate(habit.startDate);
        const today = new Date();
        const weeks = this.generateWeeksData(startDate, today, habit);

        weeks.reverse().forEach((week, index) => {
            const completedDays = week.days.filter(d => d && d.completed).length;
            const totalAvailableDays = week.days.filter(d => d && !d.future).length;
            const completionRate = totalAvailableDays > 0 ? Math.round((completedDays / totalAvailableDays) * 100) : 0;

            html += `
                <div class="weekly-summary-card">
                    <div class="week-header">
                        <div class="week-title">${week.label}</div>
                        <div class="week-completion">${completedDays}/${totalAvailableDays} days (${completionRate}%)</div>
                    </div>
                    <div class="week-days">
            `;

            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((dayName, dayIndex) => {
                const dayData = week.days[dayIndex];
                if (dayData) {
                    const statusClass = dayData.future ? 'future' : (dayData.completed ? 'completed' : '');
                    const icon = dayData.completed ? '✓' : '';
                    html += `
                        <div class="week-day-item">
                            <div class="week-day-label">${dayName}</div>
                            <div class="week-day-status ${statusClass}">${icon}</div>
                        </div>
                    `;
                } else {
                    html += `<div class="week-day-item"></div>`;
                }
            });

            html += `
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        habitView.innerHTML = html;
    }

    // Generate weeks data
    generateWeeksData(startDate, endDate, habit) {
        const weeks = [];
        let currentWeekStart = new Date(startDate);

        // Adjust to Monday
        const day = currentWeekStart.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        currentWeekStart.setDate(currentWeekStart.getDate() + diff);

        while (currentWeekStart <= endDate) {
            const weekDays = [];
            const weekStartDate = new Date(currentWeekStart);
            const weekEndDate = new Date(currentWeekStart);
            weekEndDate.setDate(weekEndDate.getDate() + 6);

            for (let i = 0; i < 7; i++) {
                const date = new Date(currentWeekStart);
                date.setDate(date.getDate() + i);
                const dateStr = this.formatDate(date);

                if (date < startDate || date > endDate) {
                    weekDays.push(null);
                } else {
                    weekDays.push({
                        date: dateStr,
                        completed: habit.completedDates.includes(dateStr),
                        future: this.isFutureDate(dateStr)
                    });
                }
            }

            const monthName = weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const endMonthName = weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            weeks.push({
                label: `${monthName} - ${endMonthName}`,
                days: weekDays
            });

            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }

        return weeks;
    }

    // Render yearly view
    renderYearlyView(habit) {
        const habitView = document.getElementById('habitView');
        const streak = this.calculateStreak(habit);
        const totalDays = habit.completedDates.length;

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
            <div class="yearly-view">
                <div class="year-selector">
                    <button class="year-nav-btn" onclick="habitTracker.changeYear(-1)">← Previous</button>
                    <div class="current-year">${this.currentYear}</div>
                    <button class="year-nav-btn" onclick="habitTracker.changeYear(1)">Next →</button>
                </div>
                <div class="months-grid">
        `;

        // Generate 12 months
        for (let month = 0; month < 12; month++) {
            const monthDate = new Date(this.currentYear, month, 1);
            const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' });
            const daysInMonth = new Date(this.currentYear, month + 1, 0).getDate();

            html += `
                <div class="month-card">
                    <div class="month-card-title">${monthName}</div>
                    <div class="month-days-grid">
            `;

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(this.currentYear, month, day);
                const dateStr = this.formatDate(date);
                const startDate = this.parseDate(habit.startDate);

                let cellClass = 'month-day-cell';
                if (habit.completedDates.includes(dateStr)) {
                    cellClass += ' completed';
                } else if (this.isFutureDate(dateStr) || date < startDate) {
                    cellClass += ' future';
                }

                html += `<div class="${cellClass}"></div>`;
            }

            html += `
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        habitView.innerHTML = html;
    }

    // Change year in yearly view
    changeYear(delta) {
        this.currentYear += delta;
        this.renderHabitView();
    }

    // Render graph view
    renderGraphView(habit) {
        const habitView = document.getElementById('habitView');
        const streak = this.calculateStreak(habit);
        const totalDays = habit.completedDates.length;

        // Calculate statistics
        const startDate = this.parseDate(habit.startDate);
        const today = new Date();
        const totalPossibleDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const completionRate = Math.round((totalDays / totalPossibleDays) * 100);
        const bestStreak = this.calculateBestStreak(habit);

        // Calculate last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = this.formatDate(date);
            last7Days.push({
                date: dateStr,
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                completed: habit.completedDates.includes(dateStr)
            });
        }

        let html = `
            <div class="habit-header">
                <div class="habit-title">
                    ${this.escapeHtml(habit.name)}
                    <button class="edit-habit-btn" onclick="habitTracker.openEditModal('${habit.id}')">✏️ Edit</button>
                </div>
                ${habit.goal ? `<div class="habit-goal">Goal: ${this.escapeHtml(habit.goal)}</div>` : ''}
                <div class="habit-start-date">Start Date: ${this.formatDateDisplay(habit.startDate)}</div>
            </div>
            <div class="graph-view">
                <div class="stats-overview">
                    <div class="stat-card">
                        <div class="stat-card-value">${totalDays}</div>
                        <div class="stat-card-label">Total Days Completed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${completionRate}%</div>
                        <div class="stat-card-label">Completion Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${streak}</div>
                        <div class="stat-card-label">Current Streak</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${bestStreak}</div>
                        <div class="stat-card-label">Best Streak</div>
                    </div>
                </div>

                <div class="completion-chart">
                    <div class="chart-title">Last 7 Days</div>
                    <div class="chart-bars">
        `;

        last7Days.forEach(day => {
            const height = day.completed ? 100 : 20;
            html += `
                <div class="chart-bar" style="height: ${height}%;">
                    <div class="chart-bar-value">${day.completed ? '✓' : ''}</div>
                    <div class="chart-bar-label">${day.dayName}</div>
                </div>
            `;
        });

        html += `
                    </div>
                </div>

                <div class="streak-chart">
                    <div class="best-streak">
                        <div class="best-streak-value">🔥 ${bestStreak}</div>
                        <div class="best-streak-label">Best Streak Ever</div>
                    </div>
                </div>
            </div>
        `;

        habitView.innerHTML = html;
    }

    // Calculate best streak ever
    calculateBestStreak(habit) {
        if (habit.completedDates.length === 0) return 0;

        const sortedDates = habit.completedDates
            .map(d => this.parseDate(d))
            .sort((a, b) => a - b);

        let bestStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = sortedDates[i - 1];
            const currDate = sortedDates[i];
            const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

            if (dayDiff === 1) {
                currentStreak++;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return bestStreak;
    }

    // Switch view
    switchView(view) {
        this.currentView = view;

        // Update view tabs
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.view === view) {
                tab.classList.add('active');
            }
        });

        this.renderHabitView();
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

        // View tab listeners
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchView(tab.dataset.view);
            });
        });

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
