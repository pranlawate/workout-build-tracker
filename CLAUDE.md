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

## Real-Time UI Update Patterns

- Badge container pattern: Wrap dynamic content in dedicated container div with stable class name
- Example: `<div class="performance-badge-container">${badgeHtml}</div>`
- Update pattern: Find container by querySelector, update innerHTML without re-rendering parent
- Use `data-exercise-index` attributes for targeted DOM queries
- Call update methods after state changes (e.g., `updatePerformanceBadge()` after `handleLogSet()`)

## Error Handling Patterns

- Two-layer defense: Null guards in methods + try-catch in public API
- Safe fallback: Always return valid data structure on error (e.g., `{ status: 'good', message: null, pattern: null }`)
- Error logging: Use `console.error('[ModuleName] Description:', error)` for debugging
- Never crash the app: Wrap public methods in try-catch, log errors, return safe defaults
- Guard early: Check for null/undefined at method entry, return early if invalid

## CSS Badge Styling

- Semi-transparent backgrounds: Use `rgba()` with 0.15 alpha for subtlety
- Color coding: Danger (red #ef4444), Warning (orange #f59e0b)
- Mobile responsive: Use `@media (max-width: 768px)` for full-width badges
- CSS variables: Reference existing theme variables (--spacing-xs, --font-sm, --color-danger, etc.)

## Testing Approach

- Integration tests: Create test report with manual test scenarios (docs/performance-analyzer-integration-test-report.md)
- Edge case testing: Test with null data, empty arrays, malformed localStorage
- Browser console testing: Use dynamic imports to test modules in isolation
- Test data injection: Manually set localStorage values to create specific scenarios
- Real-world scenarios: Document step-by-step user workflows for each feature
