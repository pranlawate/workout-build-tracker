# Project Context for Claude Code

## Git Commit Guidelines

- Never include "Claude" or AI attribution in commit messages
- Focus commit messages on the change itself, not the authorship tool
- Follow conventional commit format: `type: description` (e.g., `feat: add user authentication`)

## localStorage Architecture

- Two-store pattern: `build_exercise_*` (per-exercise history) + `build_workout_rotation` (global state)
- Rotation state fields: `nextSuggested`, `currentStreak`, `lastDate`, `sequence[]`, `cycleCount`
- Date comparison uses `toDateString()` for same-day workout detection
- Changes to localStorage require explicit UI refresh via `showHomeScreen()`

## Common Gotchas

- UI refresh: Use `showHomeScreen()` (not `updateHomeScreen()` which doesn't exist)
- Rotation rollback: Must check all exercises from same workout/date before rolling back
- Console debugging: Use `localStorage.getItem('build_workout_rotation')` to inspect state

## Debugging Patterns

- Add `[ROLLBACK DEBUG]` or `[DEBUG]` prefix to console logs for easier filtering
- For state bugs: Create diagnostic scripts in `/tmp/` to inspect localStorage
- Manual reset: Provide console commands when automatic fixes fail
- Always use systematic debugging (root cause first, then fix)

## Performance Analyzer Module

- Read-only module pattern: Never modifies localStorage, only reads via `StorageManager`
- Conservative thresholds: 2+ sessions required, 25% rep drops, 50% variance
- Null safety critical: Always guard `history?.sets?.length` before accessing
- Detection methods return `{ status: 'good'|'warning'|'alert', message, pattern }` or `null`
- Division by zero protection: Check `avgReps === 0` before dividing

## Module Architecture Patterns

- Dependency injection: Pass `StorageManager` to constructors (e.g., `new PerformanceAnalyzer(this.storage)`)
- ES6 modules: Use `export class` and `import { ClassName }` syntax
- Initialize in App constructor: Add managers after storage/workoutManager/deloadManager
- Method naming: camelCase for methods, PascalCase for classes
