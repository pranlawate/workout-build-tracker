# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- UI integration layer (app.js controller)
- In-workout set logging interface
- Progression feedback with color-coded badges
- Service worker for offline caching
- Integration tests

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
