# Workout Reference Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add workout preview to Progress screen so users can view all workout definitions without completing workouts.

**Architecture:** Extend Progress screen Overview tab with accordion-style workout reference. Reads live from workouts.js, no data caching. Session storage for expanded state.

**Tech Stack:** Vanilla JavaScript ES6+, CSS3, sessionStorage API

---

## Task 1: Add CSS Styling

**Files:**
- Create: `css/workout-reference.css`
- Modify: `index.html` (add stylesheet link)

**Step 1: Create workout reference stylesheet**

Create `css/workout-reference.css` with:

```css
/* Workout Reference Section */
.workout-reference {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--card-bg);
  border-radius: var(--radius-md);
}

.workout-reference h3 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
}

/* Workout Card */
.workout-ref-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-sm);
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.workout-ref-card:last-child {
  margin-bottom: 0;
}

/* Workout Header (clickable) */
.workout-ref-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-secondary);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;
}

.workout-ref-header:hover {
  background: var(--bg-tertiary);
}

.workout-ref-header:active {
  background: var(--bg-quaternary);
}

.workout-ref-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.expand-icon {
  font-size: 14px;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.workout-ref-card.expanded .expand-icon {
  transform: rotate(90deg);
}

/* Exercise List */
.exercise-list {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.exercise-item {
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-subtle);
}

.exercise-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.exercise-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.exercise-meta {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 4px;
}

.exercise-note {
  color: var(--text-muted);
  font-size: 13px;
  font-style: italic;
  line-height: 1.4;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .workout-reference {
    padding: var(--spacing-sm);
  }

  .workout-ref-header {
    padding: 10px 12px;
  }

  .exercise-list {
    padding: var(--spacing-sm);
  }
}
```

**Step 2: Add stylesheet to HTML**

In `index.html`, add after line 33 (after achievements.css):

```html
  <link rel="stylesheet" href="css/workout-reference.css">
```

**Step 3: Verify CSS loads**

1. Open browser DevTools → Network tab
2. Reload page
3. Check `workout-reference.css` loads with 200 status

**Step 4: Commit**

```bash
git add css/workout-reference.css index.html
git commit -m "feat: add workout reference CSS styling

Add stylesheet for workout preview accordion on Progress screen.
Includes responsive mobile optimizations and smooth transitions."
```

---

## Task 2: Add Import Statement

**Files:**
- Modify: `js/app.js:1-20` (imports section)

**Step 1: Add getAllWorkouts import**

In `js/app.js`, find the imports section (around line 17):

```javascript
import { exportWorkoutData, importWorkoutData, getDataSummary } from './utils/export-import.js';
```

Add after that line:

```javascript
import { getAllWorkouts } from './modules/workouts.js';
```

**Step 2: Verify import**

Check that `getAllWorkouts` is exported from `js/modules/workouts.js` (line 360):

```bash
grep "export function getAllWorkouts" js/modules/workouts.js
```

Expected output: `export function getAllWorkouts() {`

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: import getAllWorkouts for workout reference"
```

---

## Task 3: Add renderWorkoutReference Method

**Files:**
- Modify: `js/app.js` (add method after renderStrengthGains, around line 2900)

**Step 1: Initialize state property**

In `js/app.js` constructor (around line 30), add:

```javascript
// Workout reference expanded state (0-3 = workout index, null = none)
this.expandedWorkout = sessionStorage.getItem('expandedWorkout')
  ? parseInt(sessionStorage.getItem('expandedWorkout'))
  : null;
```

**Step 2: Add renderWorkoutReference method**

After `renderStrengthGains()` method (around line 2900), add:

```javascript
  /**
   * Render workout reference section with all workouts
   * @returns {string} HTML string
   */
  renderWorkoutReference() {
    try {
      const workouts = getAllWorkouts();

      if (!workouts || workouts.length === 0) {
        return `
          <section class="workout-reference">
            <h3>📋 Workout Reference</h3>
            <p style="color: var(--text-muted); text-align: center; padding: 20px;">
              No workouts defined.
            </p>
          </section>
        `;
      }

      return `
        <section class="workout-reference">
          <h3>📋 Workout Reference</h3>
          ${workouts.map((workout, index) =>
            this.renderWorkoutCard(workout, index)
          ).join('')}
        </section>
      `;
    } catch (error) {
      console.error('[renderWorkoutReference] Error:', error);
      return `
        <section class="workout-reference">
          <h3>📋 Workout Reference</h3>
          <p style="color: var(--color-danger); text-align: center; padding: 20px;">
            Error loading workouts. Check console for details.
          </p>
        </section>
      `;
    }
  }
```

**Step 3: Verify method exists**

```bash
grep -A 5 "renderWorkoutReference()" js/app.js | head -6
```

Expected: Should show the method signature

**Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat: add renderWorkoutReference method

Main section renderer for workout preview.
Includes error handling and empty state."
```

---

## Task 4: Add renderWorkoutCard Method

**Files:**
- Modify: `js/app.js` (add method after renderWorkoutReference)

**Step 1: Add renderWorkoutCard method**

After `renderWorkoutReference()`, add:

```javascript
  /**
   * Render individual workout card (accordion item)
   * @param {Object} workout - Workout definition
   * @param {number} index - Workout index (0-3)
   * @returns {string} HTML string
   */
  renderWorkoutCard(workout, index) {
    const isExpanded = this.expandedWorkout === index;

    return `
      <div class="workout-ref-card ${isExpanded ? 'expanded' : ''}" data-workout-index="${index}">
        <div class="workout-ref-header" onclick="app.toggleWorkout(${index})">
          <h4>${this.escapeHtml(workout.displayName)}</h4>
          <span class="expand-icon">▶</span>
        </div>
        ${isExpanded ? this.renderExerciseList(workout) : ''}
      </div>
    `;
  }
```

**Step 2: Verify method exists**

```bash
grep -A 3 "renderWorkoutCard(" js/app.js | head -4
```

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: add renderWorkoutCard accordion item

Renders individual workout with expand/collapse header.
Uses data-workout-index for click handling."
```

---

## Task 5: Add renderExerciseList Method

**Files:**
- Modify: `js/app.js` (add method after renderWorkoutCard)

**Step 1: Add renderExerciseList method**

After `renderWorkoutCard()`, add:

```javascript
  /**
   * Render exercise list for expanded workout
   * @param {Object} workout - Workout definition
   * @returns {string} HTML string
   */
  renderExerciseList(workout) {
    if (!workout.exercises || workout.exercises.length === 0) {
      return `
        <div class="exercise-list">
          <p style="color: var(--text-muted); text-align: center;">
            No exercises defined.
          </p>
        </div>
      `;
    }

    return `
      <div class="exercise-list">
        ${workout.exercises.map((exercise, index) => {
          const isTimeBased = this.isTimeBasedExercise(exercise);
          const repsUnit = isTimeBased ? '' : ' reps';

          return `
            <div class="exercise-item">
              <div class="exercise-name">${index + 1}. ${this.escapeHtml(exercise.name)}</div>
              <div class="exercise-meta">${exercise.sets} sets × ${exercise.repRange}${repsUnit}</div>
              ${exercise.notes ? `<div class="exercise-note">${this.escapeHtml(exercise.notes)}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
```

**Step 2: Verify method exists**

```bash
grep -A 3 "renderExerciseList(" js/app.js | head -4
```

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: add renderExerciseList for workout details

Renders numbered exercise list with sets, reps, and notes.
Handles time-based exercises correctly (no 'reps' suffix)."
```

---

## Task 6: Add toggleWorkout Method

**Files:**
- Modify: `js/app.js` (add method after renderExerciseList)

**Step 1: Add toggleWorkout method**

After `renderExerciseList()`, add:

```javascript
  /**
   * Toggle workout accordion expand/collapse
   * @param {number} index - Workout index (0-3)
   */
  toggleWorkout(index) {
    // Toggle: if already expanded, collapse; otherwise expand
    this.expandedWorkout = this.expandedWorkout === index ? null : index;

    // Persist to session storage
    if (this.expandedWorkout !== null) {
      sessionStorage.setItem('expandedWorkout', this.expandedWorkout.toString());
    } else {
      sessionStorage.removeItem('expandedWorkout');
    }

    // Re-render Overview tab
    const progressContent = document.getElementById('progress-content');
    if (!progressContent) return;

    // Re-fetch data (lightweight, no API calls)
    const progressAnalyzer = new ProgressAnalyzer(this.storage);
    const stats = progressAnalyzer.getLast4WeeksStats();
    const strengthGains = progressAnalyzer.getTopProgressingExercises(3);

    progressContent.innerHTML = `
      ${this.renderAchievementsGallery()}
      ${this.renderSummaryStats(stats)}
      ${this.renderStrengthGains(strengthGains)}
      ${this.renderWorkoutReference()}
    `;
  }
```

**Step 2: Verify method exists**

```bash
grep -A 3 "toggleWorkout(" js/app.js | head -4
```

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: add toggleWorkout accordion toggle

Handles expand/collapse state with session persistence.
Re-renders Overview tab to show/hide exercise list."
```

---

## Task 7: Integrate into showProgressDashboard

**Files:**
- Modify: `js/app.js:2760-2768` (showProgressDashboard method)

**Step 1: Add renderWorkoutReference to Overview tab**

In `showProgressDashboard()` method, find the `progressContent.innerHTML` assignment (around line 2763):

Replace:

```javascript
    progressContent.innerHTML = `
      ${this.renderAchievementsGallery()}
      ${this.renderSummaryStats(stats)}
      ${this.renderStrengthGains(strengthGains)}
    `;
```

With:

```javascript
    progressContent.innerHTML = `
      ${this.renderAchievementsGallery()}
      ${this.renderSummaryStats(stats)}
      ${this.renderStrengthGains(strengthGains)}
      ${this.renderWorkoutReference()}
    `;
```

**Step 2: Verify integration**

```bash
grep -A 5 "renderWorkoutReference()" js/app.js | grep "progressContent.innerHTML" -A 5 | head -6
```

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: integrate workout reference into Progress Overview tab

Adds workout preview section below strength gains.
Completes workout reference feature implementation."
```

---

## Task 8: Update Cache Version

**Files:**
- Modify: `sw.js:1` (cache version)

**Step 1: Increment cache version**

In `sw.js` line 1, change:

```javascript
const CACHE_NAME = 'build-tracker-v31';
```

To:

```javascript
const CACHE_NAME = 'build-tracker-v32';
```

**Step 2: Commit**

```bash
git add sw.js
git commit -m "chore: update cache to v32 for workout reference feature"
```

---

## Task 9: Manual Testing

**Files:**
- None (testing only)

**Step 1: Test on desktop browser**

1. Open app in browser (Ctrl+Shift+R to force refresh)
2. Click "📈 Progress" button
3. Verify "📋 Workout Reference" section appears
4. Click "Upper A - Horizontal" header
5. Verify exercise list expands
6. Verify correct format: "1. DB Flat Bench Press" / "3 sets × 8-12 reps"
7. Click "Lower A - Bilateral" header
8. Verify Upper A collapses and Lower A expands (only one open)
9. Refresh page
10. Verify last expanded workout remains expanded

**Step 2: Test time-based exercises**

1. Expand "Lower A - Bilateral"
2. Find "Plank" exercise
3. Verify shows: "3 sets × 30-60s" (no "reps" suffix)
4. Verify notes display correctly

**Step 3: Test on mobile (or mobile emulator)**

1. Open DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Set to iPhone/Android viewport
3. Navigate to Progress → Overview
4. Verify workout cards are full-width
5. Verify tap targets are easy to hit (header has 12px padding)
6. Verify text is readable at mobile size

**Step 4: Test error handling**

1. Open console (F12)
2. Verify no errors when expanding/collapsing
3. Verify no warnings about missing data

**Step 5: Document test results**

Create `docs/testing/workout-reference-test-report.md`:

```markdown
# Workout Reference Test Report

**Date:** 2026-02-11
**Tester:** [Your name]
**Build:** v32

## Desktop Tests
- [x] Section appears in Overview tab
- [x] All 4 workouts display
- [x] Accordion expand/collapse works
- [x] Only one workout open at a time
- [x] Session persistence works
- [x] Exercise details show correctly
- [x] Time-based exercises format correctly (no "reps")
- [x] Notes display properly

## Mobile Tests
- [x] Responsive layout
- [x] Touch targets work
- [x] Text readable
- [x] No horizontal scroll

## Error Handling
- [x] No console errors
- [x] Graceful empty states

## Issues Found
[List any bugs or issues]

## Status
✅ PASS - Ready for production
```

**Step 6: Commit test report**

```bash
git add docs/testing/workout-reference-test-report.md
git commit -m "docs: add workout reference test report"
```

---

## Task 10: Push to Production

**Files:**
- None (deployment only)

**Step 1: Verify clean git state**

```bash
git status
```

Expected: "nothing to commit, working tree clean"

**Step 2: Review commit history**

```bash
git log --oneline -10
```

Expected: Should see 9 commits for this feature

**Step 3: Push to production**

```bash
git push origin main
```

**Step 4: Verify deployment**

1. Open https://pranlawate.github.io/workout-build-tracker/
2. Wait 30-60 seconds for GitHub Pages deployment
3. Hard refresh (Ctrl+Shift+R)
4. Navigate to Progress screen
5. Verify workout reference section appears and works

**Step 5: Final verification**

Check that:
- [ ] CSS loads correctly
- [ ] All 4 workouts display
- [ ] Accordion works
- [ ] Mobile responsive
- [ ] No console errors

---

## Testing Checklist

After implementation, verify:

- [ ] All 4 workouts display in Overview tab
- [ ] Accordion expand/collapse works correctly
- [ ] Only one workout expanded at a time
- [ ] Session storage persists expanded state
- [ ] Time-based exercises show correct format (no "reps")
- [ ] Exercise notes display properly
- [ ] Mobile responsive (no overflow, readable text)
- [ ] Touch targets work on mobile
- [ ] No console errors
- [ ] Graceful error handling for missing data
- [ ] Cache version updated
- [ ] Production deployment successful

## Success Criteria

✅ Users can view all 4 workout definitions without logging fake data
✅ Exercise details match actual workout screen format
✅ Smooth accordion interaction with session memory
✅ Works on mobile devices (primary use case)
✅ Zero console errors
✅ ~80 lines total (50 JS, 30 CSS) - lightweight implementation

## Rollback Plan

If issues arise:

1. Revert all commits: `git revert HEAD~9..HEAD`
2. Or revert to specific commit: `git reset --hard <commit-sha>`
3. Force push: `git push origin main --force`
4. Clear browser cache: Ctrl+Shift+Delete

## Notes

- Feature is purely additive - no breaking changes to existing functionality
- Reads live from `workouts.js` - no data migration needed
- Session storage used (not localStorage) - state doesn't persist across browser restarts (intentional)
- No API calls or heavy computation - lightweight and fast
