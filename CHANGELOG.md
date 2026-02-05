# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
