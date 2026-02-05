# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2026-02-05

### Added
- **GitHub Pages Deployment:** App now live at https://pranlawate.github.io/workout-build-tracker/
- **Browser Navigation Support:** Full browser back/forward button integration for SPA experience
- **History State Management:** Proper navigation between screens using History API
- **Service Worker Cache Versioning:** Automatic cache updates for new deployments

### Fixed
- Browser back button now navigates within app instead of leaving it
- Browser back from workout screen returns to home screen
- Browser back from settings modal closes overlay properly
- Service worker cache now updates when new version deployed

### Changed
- Moved app files from `src/` to root directory for GitHub Pages compatibility
- Updated test imports to reflect new file structure
- Bumped service worker cache to v3 for deployment

### Technical
- Implemented `popstate` event listener for browser navigation
- Added `navigateToScreen()` router function
- Updated all screen navigation methods to push history states
- Created `closeSettingsModal()` for proper modal cleanup
- Modified `proceedWithWorkout()` to push workout state
- Fixed test file paths after directory restructure

**Tests:** All 110 tests passing

---

### Added - Advanced Reset Options (2026-02-05)

**Emergency Recovery Tools:**
- Three reset options accessible from Settings modal during workouts
- Reset Rotation Only: Fixes stuck progression while preserving workout history
- Clear History Only: Removes all logs while keeping current rotation state
- Reset Everything: Complete factory reset for critical bugs

**Safety Features:**
- Clear confirmation dialogs explaining what each option does
- Double confirmation for destructive actions (history/full reset)
- Visual distinction with warning (orange) and danger (red) buttons
- Detailed descriptions under each button

**Use Cases:**
- Fix rotation bugs during workout without losing history
- Start fresh after testing or corrupted data
- Emergency recovery when app gets stuck

### Added - History & Progress Feature (2026-02-05)

**Complete Workout History Management:**
- History List screen showing all exercises with summary data
- Exercise Detail screen with visual progress chart
- Canvas-based weight progression charts (last 8 workouts)
- Edit workout entries (fix typos, correct data)
- Delete workout entries (remove bad data)
- Export all data to JSON (backup)
- Import data from JSON (restore)
- Data validation on import
- Empty states and error handling

**User Experience:**
- Grouped exercises by workout type
- "Days ago" relative dates
- Visual chart showing weight progression
- Confirmation dialogs for destructive actions
- Toast notifications for success/error
- Settings modal with data management

**Technical:**
- Zero external dependencies (vanilla JS + Canvas)
- 7 new files (3 screens, 1 modal, 1 chart component, 1 utility module)
- 3 new CSS files
- localStorage architecture maintained
- Export format: versioned JSON with metadata
- Retina display support for charts

### Fixed - History & Progress Bug Fixes (2026-02-05)

**Rotation Rollback on Deletion:**
- Fixed bug where deleting all exercises from the most recent workout didn't revert rotation state
- App now properly rolls back streak, next workout, and cycle count when all exercises from a workout session are deleted
- Prevents getting stuck on wrong workout suggestion after deletion
- Added intelligent detection to only rollback when deleting from the most recent workout
- Properly handles partial deletions (only rolls back when ALL exercises from session are deleted)

### Added - Complete UX Polish (Tasks 19-30)

**Missing Features Implementation:**
- Workout-specific warm-up protocol sections with checklist tracking ✅
- RIR dropdown with color coding (Red: 0-1, Green: 2-3, Yellow: 4+) and helper tooltip ✅
- Machine usage info badges ("ℹ️ Machine OK when fatigued") ✅
- Cycle progress tracking on home screen (current streak, deload countdown) ✅
- Recovery warning confirmation flow (orange modal, tap to confirm) ✅
- Progressive set unlocking (Set 1 → Set 2/3 unlock with pre-filled values) ✅
- Sticky input area with 60px LOG SET button (1-tap logging workflow) ✅
- Post-set feedback messages (color-coded toast: green/blue/yellow/red) ✅
- Custom number input overlay (70×70px buttons, quick adjust +2.5/-2.5) ✅
- Automated deload system:
  - Time-based trigger (6-8 weeks) ✅
  - Three deload types (standard, light, active recovery) ✅
  - Modal with type selection ✅
  - Yellow banner during active deload ✅
  - Manual override (start early, end early, postpone, dismiss) ✅

**User Experience:**
- Zero-friction set logging (1 tap when using defaults)
- Gym-ready number inputs (large touch targets)
- Smart feedback system (immediate guidance after each set)
- Complete recovery management (warnings + deload automation)
- Progressive disclosure maintained throughout

**Technical:**
- 12 new commits
- 7 new CSS files (warm-up, sticky-input, post-set-feedback, number-overlay, deload-modal, recovery-modal, workout-screen enhancements)
- 1 new JS module (deload.js)
- Updated storage schema for deload state
- All features follow zero-dependency philosophy

### Fixed - Post-Launch Polish & Bug Fixes (2026-02-05)

**Theme & Layout:**
- Replaced purple gradient theme with clean cyan (#06b6d4) solid colors
- Fixed responsive grid layout (50px 85px 65px 95px columns)
- Made inputs directly editable (removed readonly attribute)
- Increased RIR column width to accommodate dropdown text

**Progressive Unlocking Workflow:**
- LOG SET button now reads values directly from DOM inputs
- Button moves to next set after logging (Set 1 → Set 2 → Set 3)
- Pre-fills weight AND reps from previous set when unlocking
- Prevents duplicate LOG SET buttons
- Removed auto-advance on input change (requires LOG SET click)

**Session Data Persistence:**
- Preserved logged values when navigating between exercises
- Fixed re-render issues that wiped session data
- Session data now takes priority over lastWorkout defaults
- Non-destructive DOM updates (CSS classes only)

**Validation & Completion:**
- Exercise completion now validates actual logged sets (not just index)
- Checkmark only appears when all sets have weight/reps/RIR
- Incomplete workout confirmation dialog
- Partial workouts save history but don't affect rotation/recovery/streak
- Detailed error messages show which fields are missing

**Technical:**
- 17 bug fix commits
- Improved event handler architecture (delegation vs direct)
- Data-driven state management
- Proper validation before visual updates

### Added - Full MVP Complete (Tasks 7-11)

**UI Integration (Tasks 7-9):**
- UI integration layer (app.js controller) ✅
- Home screen with workout rotation display ✅
- In-workout set logging interface ✅
- Smart weight defaults from previous workouts ✅
- Exercise history persistence ✅
- Input validation and error handling ✅
- Null safety checks throughout UI ✅
- Progression feedback with color-coded badges (🔵 🟢 🟡 🔴) ✅
- Workout timer functionality (MM:SS format) ✅
- Real-time set feedback (colored borders) ✅
- HTML sanitization for XSS prevention ✅

**Service Worker & Testing (Tasks 10-11):**
- Service Worker for offline-first PWA functionality ✅
- Cache-first strategy for static assets ✅
- Automatic cache cleanup on version updates ✅
- Runtime caching for dynamic resources ✅
- Update detection with user prompts ✅
- Comprehensive manual integration test checklist ✅
- Zero-dependency testing approach ✅

### Planned
- PWA deployment to production
- Performance optimizations
- Optional features (export history, custom workouts)

## [0.1.0] - 2026-02-04

### Added - MVP Implementation Complete

**Core Modules (100% Complete):**
- Test infrastructure with localStorage mock (44 tests passing)
- Storage module with error handling and validation
- Workout definitions (4 workouts: UPPER_A, LOWER_A, UPPER_B, LOWER_B)
- 26 exercises with complete metadata (sets, reps, RIR, weights, tempo, notes)
- Progression engine with double progression logic
- Workout manager with rotation and recovery tracking

**Features:**
- Upper/Lower Split rotation (4-day program)
- Double progression algorithm (all sets hit max reps + RIR → weight increase)
- Plateau detection (3 sessions at same weight)
- Muscle-specific recovery tracking (48hr for major muscle groups)
- Exercise history with 8-workout retention
- Special rep format support (time-based, unilateral, single RIR values)
- Robust error handling for corrupt localStorage data
- Input validation with descriptive error messages

**User Interface:**
- PWA manifest for standalone installation
- Mobile-first HTML structure (optimized for 400-430px)
- Dark theme with purple gradient accents (#667eea)
- Two-screen architecture (home + workout)
- Base CSS with spacing system and mobile optimizations
- Large touch targets (60px minimum) for gym use

**Documentation:**
- BUILD training specification
- UI/UX design document
- Data model design
- Workout structure analysis
- MVP implementation plan
- Development guidelines (CONTRIBUTING.md)

**Testing:**
- 44 unit tests with comprehensive coverage
- Edge case testing for special rep formats
- Error handling validation
- Input validation tests
- Graceful degradation for corrupt data

### Fixed
- Critical parsing bugs for special rep formats ('30-60s', '10-12/side', '30s/side')
- Single RIR value parsing ('3' instead of '2-3')
- localStorage error handling for corrupt JSON
- Input validation across all modules
- Constructor compatibility with Node.js test environment

### Technical Details
- Zero external dependencies (vanilla JavaScript)
- ES6 modules throughout
- Node.js native test runner
- localStorage for persistence
- Progressive Web App architecture
- Test-driven development approach

## [0.0.1] - 2026-02-03

### Added
- Initial project setup
- Project structure and documentation
- Design documents
- BUILD training specification v2.0
