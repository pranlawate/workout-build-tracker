# BUILD Workout Tracker

![Tests](https://img.shields.io/badge/tests-137%20passing-brightgreen)
![Status](https://img.shields.io/badge/status-production-blue)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

A Progressive Web App for tracking strength training workouts, designed for beginners following an Upper/Lower Split program.

**🚀 Live App:** [https://pranlawate.github.io/workout-build-tracker/](https://pranlawate.github.io/workout-build-tracker/)

## Overview

BUILD Tracker is a mobile-first PWA optimized for in-gym usage. It features:

- **Smart defaults**: 85% of sets logged in 1 tap
- **Auto-progression tracking**: Intelligent weight/rep suggestions
- **Recovery monitoring**: Prevents overtraining with muscle-specific rest periods
- **Equipment progression**: Tracks readiness for barbell exercises with strength, mobility, and pain criteria
- **Deload automation**: Smart fatigue detection and recovery weeks
- **Performance analysis**: Real-time alerts for weight regression and form breakdown
- **Pain tracking**: Post-workout pain logging with consolidated modal interface
- **Band exercise tracking**: Visual resistance tracking with color-coded band selection
- **Enhanced Tracking Metrics**: Pre-workout recovery assessment (sleep, stress, energy, soreness) with fatigue scoring and intelligent warnings to prevent overtraining
- **Offline-first**: Works without internet connection, installable as PWA
- **Browser navigation**: Full support for browser back button (SPA experience)

## Design Philosophy

- **Zero friction**: Minimal taps during workouts
- **Mobile-optimized**: Designed for 6.7" smartphones
- **Data-driven**: Auto-tracks form stability and progression
- **Beginner-focused**: Clear guidance and realistic starting weights

## Project Status

**Current Phase**: Production Deployment - 76% Complete (58/76 features)

🚀 **Deployed:** [https://pranlawate.github.io/workout-build-tracker/](https://pranlawate.github.io/workout-build-tracker/)

✅ **Core Features (100% Complete)**
- ✅ Backend modules (StorageManager, WorkoutManager, Progression Engine, DeloadManager)
- ✅ Test infrastructure (137 tests passing - unit + integration)
- ✅ Workout definitions (4 workouts, 26 exercises)
- ✅ Progressive disclosure UI (collapse completed, hide upcoming, expand current)
- ✅ PWA support (Service Worker, offline-first, installable)
- ✅ Data portability (JSON export/import with validation)
- ✅ Performance analysis (weight regression, form breakdown, rep drop detection)
- ✅ Barbell progression tracker (readiness criteria for Bench Press, Back Squat, Deadlift)
- ✅ Progress dashboard (statistics, body weight tracking, milestone progress)
- ✅ Browser navigation (full back button support, SPA experience)

🚧 **Designed But Not Implemented** (17 features remaining)
- Enhanced tracking metrics (sleep, stress, energy, fatigue scoring)
- Exercise history charts (Canvas-based)
- Weekly summary analytics

See [IMPLEMENTATION-STATUS.md](docs/IMPLEMENTATION-STATUS.md) for detailed progress tracking.

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Storage**: localStorage with JSON export
- **Deployment**: Progressive Web App (PWA)
- **No dependencies**: Lightweight, fast, privacy-first

## Documentation

- [BUILD Training Specification](BUILD-SPECIFICATION.md) - Complete training program definition
- [UI/UX Design](docs/design/2026-02-03-ui-ux-design.md)
- [Training Structure](docs/design/2026-02-03-workout-structure.md)
- [Data Model Design](docs/design/2026-02-02-data-model-design.md)
- [MVP Implementation Plan](docs/plans/2026-02-03-mvp-implementation-plan.md) - ✅ Complete
- [Development Guidelines](CONTRIBUTING.md)

## Development

```bash
# Clone repository
git clone https://github.com/pranlawate/workout-build-tracker.git
cd workout-build-tracker

# Install dependencies (test runner only)
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Open in browser (no build step needed)
# Simply open index.html in your browser
# Or use a local server:
python -m http.server 8000
# Navigate to http://localhost:8000/
```

### Project Structure

```
workout-build-tracker/
├── index.html          # Entry point
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── css/               # Stylesheets
├── js/                # Application code
│   ├── app.js         # Main controller
│   ├── modules/       # Core modules
│   ├── screens/       # Screen components
│   └── utils/         # Utilities
├── tests/             # Test suite (137 tests)
└── docs/              # Documentation
```

## Features

### Core Tracking (✅ Implemented)
- Upper/Lower Split rotation (UPPER_A → LOWER_A → UPPER_B → LOWER_B)
- 26 exercises with starting weights and progression rules
- Double progression algorithm (reps → weight)
- Exercise history tracking (8 workouts retained)
- Muscle-specific recovery tracking (48hr major muscle groups)
- **Progress Badges**: Visual indicators on exercise history showing:
  - 🔴 Performance alerts (weight/rep regression)
  - 🟡 Form breakdown warnings
  - ⚡ Deload sessions
  - 🩹 Pain reported
  - 🟢 Ready to progress
  - 🔨 Building reps
- **Per-Exercise Export**: Download complete exercise history as JSON

### Data Layer (✅ Implemented)
- localStorage persistence with error handling
- Workout rotation state management
- Exercise-specific history with 8-workout limit
- Robust parsing for special rep formats (time-based, unilateral)
- Input validation and graceful error recovery

### User Interface (✅ Structure Complete)
- Mobile-first design (optimized for 400-430px width)
- Dark theme with purple gradient accents
- Large touch targets (60px minimum)
- PWA manifest for standalone installation
- Two-screen architecture (home + workout)

### Core Features Complete
- ✅ UI controller (wire JavaScript to HTML)
- ✅ In-workout set logging interface
- ✅ Smart weight defaults from previous workouts
- ✅ Workout rotation tracking
- ✅ Exercise history persistence
- ✅ Progression feedback (color-coded badges)
- ✅ Workout timer (MM:SS format)
- ✅ Real-time set feedback (colored borders)
- ✅ HTML sanitization (XSS prevention)
- ✅ Null safety guards
- ✅ Service Worker for offline functionality
- ✅ Cache-first strategy with automatic updates
- ✅ Comprehensive integration test checklist
- ✅ Post-workout pain tracking (consolidated modal)
- ✅ Band exercise color selection (visual resistance tracking)
- ✅ Post-workout summary screen (stats, PRs, pain tracking, weigh-in)
- ✅ Progress badges on exercise history (performance alerts, form warnings, deload markers, pain indicators, progression status)
- ✅ Per-exercise JSON export (complete exercise history download)

### Deployment

**Production:** Deployed on GitHub Pages at [https://pranlawate.github.io/workout-build-tracker/](https://pranlawate.github.io/workout-build-tracker/)

**PWA Installation:**
1. Visit the live app on your mobile device
2. Chrome: Tap "Add to Home Screen" from the browser menu
3. iOS Safari: Tap Share → Add to Home Screen
4. The app works offline after first visit

**Cache Management:**
- Service Worker caches all assets for offline use
- Version: `build-tracker-v8` (auto-updates on new deployments)
- Clear cache: Browser settings → Site storage → Clear & reset

### 📊 Analytics Dashboard

**Always-Available Insights:**
- **Training Volume** - 7-day total with trend comparison
- **Performance Quality** - RIR trends, compliance, progression tracking
- **Recovery Trends** - Sleep/fatigue analysis with weekly charts
- **Pattern Detection** - Automatic correlation discovery (sleep vs progression, volume vs pain)

Access via Progress screen > Analytics tab

### Next Features (Planned)
- Enhanced tracking metrics (sleep, stress, energy)
- Exercise history charts (Canvas-based)

## License

MIT - See [LICENSE](LICENSE) file for details

## Author

Built for personal use, open-sourced for the fitness community.

---

**Note**: This is a beginner-focused tracker. If you're an intermediate/advanced lifter, you may need different programming.
