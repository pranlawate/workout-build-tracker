# BUILD Workout Tracker

![Tests](https://img.shields.io/badge/tests-943%20passing-brightgreen)
![Status](https://img.shields.io/badge/status-production-blue)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

A Progressive Web App for tracking strength training workouts, designed for beginners following an Upper/Lower Split program.

**🚀 Live App:** [https://pranlawate.github.io/workout-build-tracker/](https://pranlawate.github.io/workout-build-tracker/)

## Overview

BUILD Tracker is a mobile-first PWA optimized for in-gym usage. It features:

- **Smart defaults**: 85% of sets logged in 1 tap
- **Adaptive auto-progression**: Intelligent weight/rep suggestions that adapt to gym equipment
- **Smart progression strategies**: Automatic tempo/pause recommendations when weight gaps exist
- **Achievement system**: Automatic detection of PRs, tempo mastery, streaks, and smart recovery
- **Form guidance**: Exercise-specific cues for setup, execution, and common mistakes
- **Recovery monitoring**: Prevents overtraining with muscle-specific rest periods
- **Equipment progression**: Tracks readiness for barbell exercises with strength, mobility, and pain criteria
- **Exercise progressions**: 19 traditional Indian exercises (Dand/Baithak variations) with biomechanically-sound progression pathways
- **Deload automation**: Smart fatigue detection and recovery weeks
- **Performance analysis**: Real-time alerts for weight regression and form breakdown
- **Pain tracking**: Post-workout pain logging with consolidated modal interface
- **Band exercise tracking**: Visual resistance tracking with color-coded band selection
- **Analytics dashboard**: 7-day volume trends, performance quality, recovery patterns, correlation detection
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
- ✅ Test infrastructure (943 tests passing - 10 comprehensive test suites covering all features)
- ✅ Workout definitions (4 workouts, 26 exercises)
- ✅ Progressive disclosure UI (collapse completed, hide upcoming, expand current)
- ✅ PWA support (Service Worker, offline-first, installable)
- ✅ Data portability (JSON export/import with validation)
- ✅ Performance analysis (weight regression, form breakdown, rep drop detection)
- ✅ Barbell progression tracker (readiness criteria for Bench Press, Back Squat, Deadlift)
- ✅ Progress dashboard (statistics, body weight tracking, milestone progress)
- ✅ Browser navigation (full back button support, SPA experience)

✅ **Smart Auto-Progression System** (COMPLETE)
- ✅ Adaptive weight suggestions based on actual gym equipment
- ✅ Automatic tempo progression for weight gaps (2.5kg→5kg)
- ✅ Exercise-specific tempo guidance (eccentric/concentric/paused)
- ✅ Pattern-based exercise alternatives for pain/plateau
- ✅ Achievement detection (PRs, tempo mastery, streaks, recovery)
- ✅ Form cues with setup/execution/mistakes guidance
- ✅ Zero extra user input required

See [IMPLEMENTATION-STATUS.md](docs/IMPLEMENTATION-STATUS.md) for detailed progress tracking.

## Recent Bug Fixes (v1.4.0)

**Normal Usage Bug Fixes:**
- ✅ Fixed weight validation alert for bodyweight exercises (Plank, Hyperextension)
  - Changed weightIncrement from 2.5 to 0 for pure bodyweight exercises
  - Resolves validation error when logging weight=0
- ✅ Fixed confusing "Reps" label for time-based exercises
  - Now displays "Duration (s)" for exercises like Plank (30-60s)
  - Automatically detects time-based repRange formats
- ✅ Improved band resistance UI from cluttered tiles to dropdown
  - Replaced 5 color button tiles with clean dropdown selector
  - Band Pull-Aparts now use dropdown: 🟡 Light / 🔴 Medium / 🔵 Heavy / ⚫ X-Heavy
- ✅ Fixed NaN appearing in Plank confirmation popup
  - Root cause: Time format '30-60s' parsed incorrectly
  - Now strips non-numeric characters before parsing repRange
- ✅ Fixed empty Progress dashboard tabs
  - Body Weight and Barbell tabs now properly render content
  - Added dedicated render functions for each tab

**Cache Version:** v100 (updated for exercise video library)

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Storage**: localStorage with JSON export
- **Deployment**: Progressive Web App (PWA)
- **No dependencies**: Lightweight, fast, privacy-first

## Documentation

- [BUILD Training Specification](BUILD-SPECIFICATION.md) - Complete training program definition
- [Implementation Status](docs/IMPLEMENTATION-STATUS.md) - Feature completion tracking
- [Development Guidelines](CONTRIBUTING.md)
- [Archived Plans](docs/archived/plans/) - Historical design and implementation documents
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

### Testing

**Automated Browser Console Tests:**

The project includes comprehensive automated test suites that run directly in the browser console. **No build step or test framework required** - just load and run.

**Quick Start:**
```javascript
// Open browser console (F12), then run:
fetch('./tests/test-runner.js').then(r => r.text()).then(eval);
```

This executes the master test runner which validates:
- ✅ All exercises (28 exercises)
- ✅ All progression pathways (26 exercise slots)
- ✅ All feature modules (23 modules)
- ✅ Phase integration (50+ tests)
- ✅ Workout rotation logic
- ✅ Deload system
- ✅ Unlock criteria
- ✅ Smart progression engine
- ✅ Exercise rotation system

**Run Specific Test Suites:**
```javascript
// After loading test-runner.js:
testRunner.runExercises()        // Exercise definitions
testRunner.runProgressions()     // Progression pathways
testRunner.runFeatures()         // Feature modules
testRunner.runPhaseIntegration() // Phase system
testRunner.runWorkoutRotation()  // Rotation logic
testRunner.runDeloadLogic()      // Deload triggers
testRunner.runUnlockSystem()     // Unlock criteria
testRunner.runSmartProgression() // Smart suggestions
testRunner.runRotationSystem()   // Exercise rotation
testRunner.generateReport()      // HTML test report
```

**Individual Test Files:**
```javascript
// Load specific test suite:
fetch('./tests/test-exercises.js').then(r => r.text()).then(eval);
fetch('./tests/test-progressions.js').then(r => r.text()).then(eval);
fetch('./tests/test-smart-progression.js').then(r => r.text()).then(eval);
// ... see tests/README.md for full list
```

**Test Documentation:**
- [Automated Test Suite README](tests/README.md) - Complete test suite documentation
- [Integration Test Master](docs/testing/integration-test-master.md) - Manual testing checklist for all features

**Test Coverage:** 12 automated test suites covering core functionality, progression logic, and feature integration.

### Project Structure

```
workout-build-tracker/
├── index.html          # Entry point
├── manifest.json       # PWA manifest
├── sw.js              # Service worker (must be in root for PWA)
├── css/               # Stylesheets
├── js/                # Application code
│   ├── app.js         # Main controller
│   ├── modules/       # Core modules
│   ├── screens/       # Screen components
│   └── utils/         # Utilities
├── tests/             # Test suite (12 automated test files)
├── scripts/           # Diagnostic & utility scripts (browser console)
└── docs/              # Documentation
```

## Features

### Core Tracking (✅ Implemented)
- Upper/Lower Split rotation (UPPER_A → LOWER_A → UPPER_B → LOWER_B)
- 26 exercises with starting weights and progression rules
- **Exercise video library** - 48 videos with searchable UI and offline caching
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
- ✅ Smart progression suggestions (weight increase, tempo progression, alternatives, recovery checks)
- ✅ Achievement system (automatic PR detection, tempo mastery, progression streaks, smart recovery)
- ✅ Form guidance (exercise-specific cues for setup, execution, common mistakes)

### Deployment

**Production:** Deployed on GitHub Pages at [https://pranlawate.github.io/workout-build-tracker/](https://pranlawate.github.io/workout-build-tracker/)

**PWA Installation:**
1. Visit the live app on your mobile device
2. Chrome: Tap "Add to Home Screen" from the browser menu
3. iOS Safari: Tap Share → Add to Home Screen
4. The app works offline after first visit

**Cache Management:**
- Service Worker caches all assets for offline use
- Version: `build-tracker-v100` (auto-updates on new deployments)
- Video cache: Videos cached on-demand (~100-150MB typical usage)
- Clear cache: Browser settings → Site storage → Clear & reset

### 📊 Progress Dashboard

**Multi-Tab Organization:**
Access comprehensive progress tracking via the Progress button on home screen. Four dedicated tabs:

1. **Overview Tab**
   - Achievement gallery with unlocked badges
   - Summary statistics (workouts, session time, streak, exercises progressed)
   - Top progressing exercises with weight gains

2. **Body Weight Tab**
   - Current weight with 8-week trend analysis
   - Monthly rate of change (kg/month)
   - Status indicator (Healthy lean bulk, Fast gain, Maintenance, Rapid cut)
   - Interactive trend chart with smoothed line
   - Empty state with quick "Log Weigh-In" button

3. **Barbell Tab**
   - Equipment progression milestones for barbell exercises
   - Bench Press readiness (strength, weeks, mobility, pain-free)
   - Back Squat readiness with progress percentages
   - Deadlift readiness with next step guidance
   - Visual progress bars and criteria checklist

4. **Analytics Tab**
   - Training volume (7-day total with trend comparison)
   - Performance quality (RIR trends, compliance rate)
   - Recovery trends (sleep/fatigue averages, high fatigue days)
   - Pattern detection (sleep-progression, volume-pain correlations)

Access: Home screen → Progress button → Select tab

### 📊 Analytics Dashboard (Tab 4)

**Always-Available Insights:**
- **Training Volume** - 7-day total with trend comparison
- **Performance Quality** - RIR trends, compliance, progression tracking
- **Recovery Trends** - Sleep/fatigue analysis with weekly charts
- **Pattern Detection** - Automatic correlation discovery (sleep vs progression, volume vs pain)

Access via Progress screen > Analytics tab

### 🎯 Smart Auto-Progression System (✅ COMPLETE)

**The Goal:** THE BEST auto-progression app that requires zero extra user input.

**What makes it smart:**
1. **Adaptive Weight Suggestions** ✅
   - Detects actual gym equipment (works with 20→25kg jumps, not just 2.5kg increments)
   - Adjusts expectations based on your actual performance
   - Learns when you're stronger/weaker than theoretical progression

2. **Automatic Tempo Progression** ✅
   - Solves beginner weight gap problem (2.5kg→5kg = 100% increase)
   - Suggests tempo strategies when stuck (eccentric/paused/normal)
   - Exercise-specific guidance (press movements = slow lowering, rows = slow pull + pause)
   - No tempo tracking required - just suggestions

3. **Smart Pattern Detection** ✅
   - Auto-detects plateaus (same weight 3+ workouts)
   - Auto-detects regression (weight/rep drops)
   - Auto-suggests alternatives when pain detected
   - Works with existing data only (weight/reps/RIR)

4. **Achievement System** ✅
   - Automatic PR detection (weight/rep improvements)
   - Tempo mastery tracking (3+ weeks of tempo work)
   - Progression streaks (consistent weight increases)
   - Smart recovery achievements (reducing weight intelligently)

5. **Form Guidance** ✅
   - Exercise-specific setup cues
   - Execution guidance with tempo recommendations
   - Common mistakes to avoid
   - Collapsible UI - no clutter during workouts

6. **Zero Extra Input** ✅
   - No dropdown menus for tempo selection
   - No manual alternative switching
   - System adapts to what you actually log
   - Suggestions based on patterns, not rules

**Example Flow:**
```
Week 1: Log 10kg × 12 reps → System: "Try 12.5kg next time"
Week 2: Log 12.5kg × 6 reps (failed) → System: "Build reps at 10kg, try slow tempo"
Week 3-4: Log 10kg × 12 reps → System: "Continue slow tempo to build strength"
Week 5: System: "Ready for 12.5kg now - you've built the strength!"
Post-workout: "Achievement Unlocked: Tempo Mastery - Incline Press"
```

**Status:** COMPLETE - All features implemented and integrated
**Impact:** Solves the #1 beginner progression problem automatically

See design document: [Smart Auto-Progression System](docs/plans/2026-02-10-smart-auto-progression-design.md)

### Exercise Video Library (✅ v1.7.0)
- **48 exercise videos** (38 main exercises + 10 warmups)
- **Three access points:** Standalone library, in-workout demo, pre-workout warmup
- **Searchable & filterable** by muscle group, equipment, category
- **Modal overlay player** - No page navigation, instant close
- **Offline support** - Service Worker caches videos on first view (~400MB total)
- **Form guide integration** - Text cues embedded in video modal

**Cache Version:** v100 (updated for video caching)

## License

MIT - See [LICENSE](LICENSE) file for details

## Author

Built for personal use, open-sourced for the fitness community.

---

**Note**: This is a beginner-focused tracker. If you're an intermediate/advanced lifter, you may need different programming.
