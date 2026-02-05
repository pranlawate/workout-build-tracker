# BUILD Workout Tracker

![Tests](https://img.shields.io/badge/tests-44%20passing-brightgreen)
![MVP](https://img.shields.io/badge/MVP-complete-blue)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

A Progressive Web App for tracking strength training workouts, designed for beginners following an Upper/Lower Split program.

## Overview

BUILD Tracker is a mobile-first PWA optimized for in-gym usage. It features:

- **Smart defaults**: 85% of sets logged in 1 tap
- **Auto-progression tracking**: Intelligent weight/rep suggestions
- **Recovery monitoring**: Prevents overtraining with muscle-specific rest periods
- **Equipment progression**: Guides transition from dumbbells to barbells
- **Deload automation**: Smart fatigue detection and recovery weeks
- **Offline-first**: Works without internet connection

## Design Philosophy

- **Zero friction**: Minimal taps during workouts
- **Mobile-optimized**: Designed for 6.7" smartphones
- **Data-driven**: Auto-tracks form stability and progression
- **Beginner-focused**: Clear guidance and realistic starting weights

## Project Status

**Current Phase**: Production-Ready MVP - All Core Features Complete

✅ UI/UX design finalized
✅ Training structure defined (Upper/Lower Split 4x/week)
✅ Data model designed

✅ **Backend modules complete** (6 of 6 tasks)
- ✅ Test infrastructure (44 tests passing)
- ✅ Storage module (localStorage wrapper)
- ✅ Workout definitions (4 workouts, 26 exercises)
- ✅ Progression engine (double progression logic)
- ✅ Workout manager (rotation + recovery tracking)
- ✅ HTML/CSS structure (PWA-ready)

✅ **UI Integration Complete** (3 of 3 tasks)
- ✅ Home screen with workout rotation
- ✅ In-workout UI with set logging
- ✅ Progression UI with visual feedback

✅ **PWA & Testing Complete** (2 of 2 tasks)
- ✅ Service Worker for offline functionality
- ✅ Comprehensive integration test checklist

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
git clone <repo-url>
cd workout-build-tracker

# Install dependencies (test runner only)
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Open in browser (no build step needed)
# Simply open src/index.html in your browser
# Or use a local server:
python -m http.server 8000
# Navigate to http://localhost:8000/src/
```

## Features

### Core Tracking (✅ Implemented)
- Upper/Lower Split rotation (UPPER_A → LOWER_A → UPPER_B → LOWER_B)
- 26 exercises with starting weights and progression rules
- Double progression algorithm (reps → weight)
- Exercise history tracking (8 workouts retained)
- Muscle-specific recovery tracking (48hr major muscle groups)

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

### Ready for Production
The app is fully functional with all core features complete. Next steps:
- Deploy to production (GitHub Pages or custom domain)
- Performance monitoring and optimization
- Optional features (export history, custom workouts)

## License

MIT - See [LICENSE](LICENSE) file for details

## Author

Built for personal use, open-sourced for the fitness community.

---

**Note**: This is a beginner-focused tracker. If you're an intermediate/advanced lifter, you may need different programming.
