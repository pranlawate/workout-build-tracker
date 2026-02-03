# BUILD Tracker - Development Guidelines

**Last Updated:** 2026-02-03
**Project Phase:** Design Complete → Implementation Starting

---

## Core Principles

### 1. Design-First Development
- ✅ **DO** reference design documents before coding
- ✅ **DO** validate implementations against UI/UX specs
- ❌ **DON'T** deviate from mobile-first constraints without updating design docs
- ❌ **DON'T** add features not in the design without discussion

### 2. Test-Driven Development
- ✅ **DO** write tests before implementation (use `test-driven-development` skill)
- ✅ **DO** test progression logic, deload triggers, recovery warnings
- ✅ **DO** verify calculations (RIR, form stability, weight trends)
- ❌ **DON'T** skip tests for "simple" logic (progression is never simple)

### 3. Mobile-First, Lightweight
- ✅ **DO** optimize for 6.7" smartphone displays (400-430px width)
- ✅ **DO** keep vanilla JavaScript (no frameworks)
- ✅ **DO** minimize dependencies (currently: zero)
- ❌ **DON'T** use libraries unless absolutely necessary
- ❌ **DON'T** add build steps unless PWA deployment requires it

### 4. Privacy-First
- ✅ **DO** store all data locally (localStorage)
- ✅ **DO** provide JSON export for user backups
- ❌ **DON'T** add cloud sync without explicit user consent
- ❌ **DON'T** collect analytics or telemetry

---

## Development Workflow

### Phase 1: MVP (Core Workout Tracking)
**Skills to use:**
- `frontend-design` - Implement UI components
- `test-driven-development` - Write tests first
- `systematic-debugging` - Debug issues
- `verification-before-completion` - Verify features work

**Features:**
1. Home screen with workout start button
2. In-workout screen with set logging
3. Smart defaults (auto-fill from last workout)
4. Basic progression feedback (color badges)
5. Exercise history view

**Acceptance Criteria:**
- No scrolling during active set entry
- 85% of sets logged in 1 tap (using suggested weight)
- Large tap targets (60px buttons minimum)
- Works offline (basic PWA)

### Phase 2: Intelligence Layer
**Features:**
6. Recovery warnings (48hr muscle overlap detection)
7. Deload triggers (cycle + time + frequency logic)
8. Equipment progression tracking (auto-stability calculation)
9. Body weight tracking (weekly prompts, trend analysis)

**Acceptance Criteria:**
- Recovery warnings prevent <48hr muscle overlap
- Deload triggers after 8 cycles in 6+ weeks at ≥1 cycle/week
- Equipment progression shows % progress with stability signals
- Weight trends filter out weekly fluctuations

### Phase 3: Polish & Refinement
**Features:**
10. Progress dashboard (charts, milestones)
11. Settings & customization
12. Export/import data (JSON)
13. First-time onboarding flow
14. Dark mode support

---

## Code Standards

### JavaScript (ES6+)

**Module Structure:**
```javascript
// src/js/modules/workout-manager.js
export class WorkoutManager {
  constructor(storage) {
    this.storage = storage;
  }

  getNextWorkout() {
    const { lastWorkout, lastDate } = this.storage.getRotation();
    return this.calculateNext(lastWorkout, lastDate);
  }

  calculateNext(last, date) {
    // Implementation with clear logic
  }
}
```

**Key Patterns:**
- Use ES6 modules (`import`/`export`)
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Use template literals for strings
- Destructure objects/arrays when clear
- Use optional chaining (`?.`) for safety

**Naming Conventions:**
- Classes: `PascalCase` (e.g., `WorkoutManager`)
- Functions/methods: `camelCase` (e.g., `calculateStability`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `RECOVERY_THRESHOLD`)
- Private methods: prefix with `_` (e.g., `_validateInput`)

### HTML/CSS

**HTML:**
- Semantic elements (`<main>`, `<section>`, `<button>`)
- Accessibility: ARIA labels, proper heading hierarchy
- Mobile meta tags (viewport, theme-color)

**CSS:**
- Mobile-first (base styles for 400px, then `@media` up)
- CSS custom properties for theming
- BEM naming (`.workout-card__button--primary`)
- No CSS frameworks (vanilla only)

**Touch Targets:**
```css
/* Minimum 44×44px for accessibility */
.button-primary {
  min-height: 60px;
  min-width: 60px;
  font-size: 18px;
}

.number-pad-button {
  width: 70px;
  height: 70px;
  font-size: 24px;
}
```

### PWA Patterns

**Service Worker (src/sw.js):**
- Cache HTML, CSS, JS for offline use
- Cache-first strategy for app shell
- Network-first for data (localStorage handles persistence)

**Manifest (src/manifest.json):**
- App name, icons, theme colors
- Standalone display mode
- Portrait orientation lock

---

## Testing Strategy

### Unit Tests (tests/unit/)

**Test all progression logic:**
```javascript
// tests/unit/progression.test.js
import { ProgressionEngine } from '../../src/js/modules/progression.js';

describe('ProgressionEngine', () => {
  test('suggests weight increase when 3×12 @ RIR 2-3 achieved', () => {
    const sets = [
      { weight: 20, reps: 12, rir: 2 },
      { weight: 20, reps: 12, rir: 2 },
      { weight: 20, reps: 12, rir: 3 }
    ];
    const suggestion = ProgressionEngine.analyze(sets, { target: '8-12', rir: '2-3' });
    expect(suggestion.action).toBe('increase_weight');
    expect(suggestion.increment).toBe(2.5);
  });
});
```

**Critical test coverage:**
- Progression logic (when to increase weight)
- Deload triggers (cycle + time + frequency)
- Recovery warnings (muscle overlap detection)
- Form stability calculation
- Body weight trend smoothing

### Integration Tests (tests/integration/)

**Test user flows:**
- Complete workout (start → log sets → finish)
- Recovery warning → override → continue
- Deload week → reduced volume
- Equipment progression unlock

### Manual Testing Checklist

**Before each commit:**
- [ ] Works on mobile (test in Chrome DevTools mobile view)
- [ ] No console errors
- [ ] Fits viewport (no horizontal scroll)
- [ ] Touch targets are finger-sized (≥44px)
- [ ] Offline capability works (disable network in DevTools)

---

## Git Workflow

### Commit Message Format

```
<type>: <subject>

<body>

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring (no behavior change)
- `test:` Add/update tests
- `docs:` Documentation only
- `style:` CSS/formatting changes
- `chore:` Build, tooling, dependencies

**Examples:**
```
feat: Add recovery warning before workouts

Implements 48hr muscle overlap detection. Warns user if starting
workout with insufficient recovery time. Allows override for
experienced users.

Closes #12

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

```
test: Add deload trigger edge cases

Tests for:
- 8 cycles in 12 weeks (too slow, no deload)
- 4 cycles in 3 weeks (not enough time)
- 8 cycles in 6 weeks at 1.33/week (triggers)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Branch Strategy

**Main branch:** `main` (always deployable)

**Feature branches:** `feature/<name>`
- `feature/home-screen`
- `feature/set-logging`
- `feature/recovery-warnings`

**Workflow:**
1. Create feature branch from `main`
2. Implement with TDD (tests first)
3. Verify with `verification-before-completion` skill
4. Commit with proper message
5. Merge to `main` when complete

**For complex features:** Use `using-git-worktrees` skill for isolation

---

## Skills Reference

### Available Skills for BUILD Tracker

**Planning & Design:**
- `brainstorming` - Design new features or flows
- `writing-plans` - Create implementation plans

**Development:**
- `frontend-design` - Implement UI components ⭐ PRIMARY
- `test-driven-development` - Write tests before code ⭐ REQUIRED
- `systematic-debugging` - Debug issues methodically
- `code-review` - Review code quality

**Workflow:**
- `using-git-worktrees` - Isolate feature work
- `verification-before-completion` - Verify before claiming done ⭐ REQUIRED
- `finishing-a-development-branch` - Merge/PR/cleanup guidance

**Documentation:**
- `elements-of-style:writing-clearly-and-concisely` - Write clear docs

### When to Use Each Skill

**Starting a new feature:**
1. `brainstorming` (if design unclear)
2. `writing-plans` (create implementation plan)
3. `using-git-worktrees` (isolate work)
4. `test-driven-development` (write tests first)
5. `frontend-design` (implement UI)

**Debugging issues:**
1. `systematic-debugging` (methodical investigation)
2. Tests to reproduce bug
3. Fix with verification

**Before merging:**
1. `verification-before-completion` (run all tests, verify works)
2. `code-review` (if major feature)
3. `finishing-a-development-branch` (merge guidance)

---

## Design Document Reference

**Primary References:**
- [UI/UX Design](docs/design/2026-02-03-ui-ux-design.md) - All screen layouts, interactions
- [Workout Structure](docs/design/2026-02-03-workout-structure.md) - Full Body program design
- [Session Summary](docs/design/2026-02-03-session-summary-v2.1.md) - Design decisions rationale

**Key Constraints from Design:**
- Mobile-first (Moto Edge 60 Pro, 6.7" display)
- No scrolling during active set entry (~480px viewport)
- Smart defaults (85% of sets = 1 tap)
- Color-coded badges (🔵🟢🟡🔴⭐)
- Beginner starting weights (1-2.5kg DBs)

**Before implementing any screen:**
1. Read relevant section in UI/UX design doc
2. Note viewport constraints
3. Identify tap targets and sizes
4. Implement exactly as designed
5. Test on mobile viewport

---

## File Structure

```
workout-build-tracker/
├── src/
│   ├── index.html              # PWA entry point
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   ├── js/
│   │   ├── app.js              # Main application entry
│   │   ├── modules/
│   │   │   ├── workout-manager.js
│   │   │   ├── progression-engine.js
│   │   │   ├── recovery-tracker.js
│   │   │   ├── storage-manager.js
│   │   │   └── ui-controller.js
│   │   └── utils/
│   │       ├── date-helpers.js
│   │       └── validators.js
│   ├── css/
│   │   ├── main.css            # Base styles
│   │   ├── components.css      # Reusable components
│   │   └── screens.css         # Screen-specific styles
│   └── assets/
│       ├── icons/              # PWA icons (192×192, 512×512)
│       └── fonts/              # If needed
├── tests/
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── test-helpers.js         # Shared test utilities
├── docs/
│   ├── design/                 # Design documents
│   └── implementation/         # Implementation notes
├── .gitignore
├── README.md
└── CONTRIBUTING.md             # This file
```

---

## Common Tasks

### Add a new screen
1. Read UI/UX design doc section for that screen
2. Create HTML structure in `index.html` (or new file)
3. Add CSS in `css/screens.css`
4. Create controller in `js/modules/`
5. Write tests for interactions
6. Verify on mobile viewport

### Add new progression logic
1. Write tests in `tests/unit/progression.test.js` FIRST
2. Implement in `js/modules/progression-engine.js`
3. Run tests until all pass
4. Integrate with UI controller
5. Manual test with real workout data

### Update design documents
1. Make changes in `docs/design/`
2. Commit with `docs:` prefix
3. Update implementation to match
4. Note breaking changes in commit message

### Debug an issue
1. Use `systematic-debugging` skill
2. Create failing test that reproduces bug
3. Fix code
4. Verify test passes
5. Commit with `fix:` prefix

---

## Critical Reminders

1. **Design documents are source of truth** - Implement what's designed
2. **Test-driven development is required** - Tests before implementation
3. **Mobile-first, always** - Test on 400px viewport
4. **Verify before claiming done** - Use verification skill
5. **Privacy-first, no tracking** - All data stays local
6. **Zero dependencies** - Vanilla JS only
7. **Offline-capable** - PWA must work without network

---

## Next Session Setup

**When starting a new session:**
1. Read this CONTRIBUTING.md file
2. Check README.md for project status
3. Review recent commits (`git log -5`)
4. Check design docs if implementing new features
5. Use available skills (frontend-design, TDD, etc.)

**Skills available next session:**
- ✅ frontend-design (newly installed)
- ✅ test-driven-development
- ✅ systematic-debugging
- ✅ verification-before-completion
- ✅ writing-plans

---

**Remember:** This is a personal project built for in-gym usage. Prioritize usability over features. Every tap matters when you're holding dumbbells.
