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
