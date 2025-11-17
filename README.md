# Daily Habit Tracker Web App

A simple and elegant web app for tracking daily habits with checkboxes and streak counters. Deployable to Netlify and works on all devices!

## Features

- ✅ Daily checkbox for each habit
- 🔥 Streak counter to track consecutive days
- ➕ Add custom habits
- 🗑️ Delete habits with confirmation
- 💾 Automatic data persistence (localStorage)
- 📱 Mobile-friendly responsive design
- 🚀 Progressive Web App (PWA) - installable on mobile
- 🌐 Works offline after first visit
- ⚡ Fast and lightweight

## Live Demo

Deploy this to Netlify in seconds!

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/checked)

## Project Structure

```
checked/
├── index.html              # Main HTML structure
├── styles.css              # Styling and responsive design
├── app.js                  # Habit tracking logic
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline support
├── netlify.toml            # Netlify configuration
├── _redirects              # Netlify redirects
├── icon-192.png            # App icon (192x192)
└── icon-512.png            # App icon (512x512)
```

## How to Deploy to Netlify

### Option 1: Deploy via Git (Recommended)

1. Push this repository to GitHub
2. Go to [Netlify](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub account
5. Select this repository
6. Click "Deploy site"

That's it! Your habit tracker will be live in seconds.

### Option 2: Drag and Drop Deploy

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag the entire `checked` folder onto the page
3. Your site will be deployed instantly

### Option 3: Netlify CLI

```bash
npm install -g netlify-cli
cd checked
netlify deploy --prod
```

## Running Locally

Simply open `index.html` in any modern web browser, or use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## How to Use

1. **Check off a habit**: Click the circle next to any habit to mark it complete for today
2. **Add a new habit**: Click the "+" button in the top right
3. **Delete a habit**: Click the trash icon and confirm deletion
4. **View streak**: Complete a habit multiple days in a row to see your streak count (🔥)
5. **Install as app**: On mobile, use "Add to Home Screen" for app-like experience

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Data Persistence

All habits and completion data are automatically saved to your browser's localStorage, so your progress persists between sessions. Data is stored locally on your device only.

## Progressive Web App (PWA)

This app can be installed on your phone like a native app:

- **iOS**: Open in Safari → Tap Share → "Add to Home Screen"
- **Android**: Open in Chrome → Tap menu → "Install app"

Once installed, the app works offline and provides a native app experience!

## Customization Ideas

Extend this app with these features:

- Add habit categories (health, productivity, social, etc.)
- Include time-of-day tracking (morning/evening habits)
- Add weekly/monthly statistics and graphs
- Implement browser notifications/reminders
- Add habit notes or journal entries
- Create different themes or color schemes
- Add goals (e.g., complete 30 days in a row)
- Export habit data to JSON/CSV
- Cloud sync with Firebase or Supabase
- Dark mode toggle

## Custom Domain

After deploying to Netlify, you can easily add a custom domain:

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure DNS

## Environment Variables

No environment variables needed! This is a pure frontend app with no backend dependencies.

## Security

- All data is stored locally in the browser
- No server-side processing
- No data collection or tracking
- HTTPS enforced by Netlify
- Security headers configured in `netlify.toml`

## License

This project is open source and available for personal and educational use.
