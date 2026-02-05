# Performance Analyzer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build automated performance analysis system that detects form breakdown and regression patterns using objective data, without requiring beginner self-assessment.

**Architecture:** Read-only analyzer module that examines exercise history from localStorage, returns status objects with warnings. Integrates into app.js renderExercises() to show real-time badges during workouts. Zero storage modifications.

**Tech Stack:** Vanilla JavaScript (ES6 modules), localStorage API, existing StorageManager abstraction

---

## Task 1: Create Performance Analyzer Module Structure

**Files:**
- Create: `src/js/modules/performance-analyzer.js`

**Step 1: Create module skeleton with minimum data check**

```javascript
// src/js/modules/performance-analyzer.js

/**
 * Analyzes exercise performance history to detect regression and form breakdown
 * Read-only module - never modifies localStorage
 */
export class PerformanceAnalyzer {
  constructor(storageManager) {
    this.storage = storageManager;
  }

  /**
   * Analyze exercise performance and return warnings if issues detected
   * @param {string} exerciseKey - Exercise identifier (e.g., "UPPER_A - Dumbbell Bench Press")
   * @param {Array} currentSets - Current session sets being logged (optional, for real-time analysis)
   * @returns {Object} { status: 'good'|'warning'|'alert', message: string|null, pattern: string|null }
   */
  analyzeExercisePerformance(exerciseKey, currentSets = []) {
    const history = this.storage.getExerciseHistory(exerciseKey);

    // Minimum data requirement: need at least 2 previous workouts
    if (history.length < 2) {
      return {
        status: 'good',
        message: null,
        pattern: null
      };
    }

    // TODO: Implement detection logic
    return {
      status: 'good',
      message: null,
      pattern: null
    };
  }
}
```

**Step 2: Verify module loads without errors**

Open `src/index.html` in browser, open DevTools console, run:
```javascript
import('./js/modules/performance-analyzer.js').then(m => console.log('Module loaded:', m));
```

Expected: "Module loaded: {PerformanceAnalyzer: class}"

**Step 3: Commit**

```bash
git add src/js/modules/performance-analyzer.js
git commit -m "feat: add performance analyzer module skeleton"
```

---

## Task 2: Implement Weight Regression Detection (Red Alert)

**Files:**
- Modify: `src/js/modules/performance-analyzer.js`

**Step 1: Add weight regression detection method**

Add this method inside the `PerformanceAnalyzer` class:

```javascript
/**
 * Check if weight decreased compared to 2 sessions ago
 * @param {Array} history - Exercise history array (sorted oldest to newest)
 * @returns {Object|null} Alert object if regression detected, null otherwise
 */
detectWeightRegression(history) {
  // Need at least 2 sessions to compare
  if (history.length < 2) return null;

  const twoSessionsAgo = history[history.length - 2];
  const lastSession = history[history.length - 1];

  // Get weight from first set of each session
  const oldWeight = twoSessionsAgo.sets[0]?.weight || 0;
  const newWeight = lastSession.sets[0]?.weight || 0;

  if (newWeight < oldWeight) {
    return {
      status: 'alert',
      message: `⚠️ Weight regressed from ${oldWeight}kg to ${newWeight}kg - check if recovering from illness/deload`,
      pattern: 'regression'
    };
  }

  return null;
}
```

**Step 2: Add rep drop detection method**

Add this method inside the `PerformanceAnalyzer` class:

```javascript
/**
 * Check if average reps dropped 25%+ compared to 2 sessions ago
 * @param {Array} history - Exercise history array
 * @returns {Object|null} Alert object if rep drop detected, null otherwise
 */
detectRepDrop(history) {
  if (history.length < 2) return null;

  const twoSessionsAgo = history[history.length - 2];
  const lastSession = history[history.length - 1];

  // Calculate average reps per session
  const avgRepsOld = twoSessionsAgo.sets.reduce((sum, set) => sum + (set.reps || 0), 0) / twoSessionsAgo.sets.length;
  const avgRepsNew = lastSession.sets.reduce((sum, set) => sum + (set.reps || 0), 0) / lastSession.sets.length;

  // Check if reps dropped by 25% or more
  const dropPercentage = (avgRepsOld - avgRepsNew) / avgRepsOld;

  if (dropPercentage >= 0.25) {
    return {
      status: 'alert',
      message: `⚠️ Rep performance dropped ${Math.round(dropPercentage * 100)}% - possible overtraining`,
      pattern: 'regression'
    };
  }

  return null;
}
```

**Step 3: Integrate regression checks into main analyze method**

Update the `analyzeExercisePerformance` method:

```javascript
analyzeExercisePerformance(exerciseKey, currentSets = []) {
  const history = this.storage.getExerciseHistory(exerciseKey);

  // Minimum data requirement: need at least 2 previous workouts
  if (history.length < 2) {
    return {
      status: 'good',
      message: null,
      pattern: null
    };
  }

  // Check for regression patterns (red alerts)
  const weightRegression = this.detectWeightRegression(history);
  if (weightRegression) return weightRegression;

  const repDrop = this.detectRepDrop(history);
  if (repDrop) return repDrop;

  // No issues detected
  return {
    status: 'good',
    message: null,
    pattern: null
  };
}
```

**Step 4: Test manually in browser console**

Open browser DevTools, run:
```javascript
// Mock storage manager
const mockStorage = {
  getExerciseHistory: (key) => [
    { date: '2026-02-01', sets: [{ weight: 20, reps: 10, rir: 2 }, { weight: 20, reps: 10, rir: 2 }] },
    { date: '2026-02-03', sets: [{ weight: 17.5, reps: 8, rir: 2 }, { weight: 17.5, reps: 7, rir: 2 }] }
  ]
};

import('./js/modules/performance-analyzer.js').then(({ PerformanceAnalyzer }) => {
  const analyzer = new PerformanceAnalyzer(mockStorage);
  const result = analyzer.analyzeExercisePerformance('TEST - Exercise');
  console.log('Regression test:', result);
  // Expected: status: 'alert', pattern: 'regression', message about weight drop
});
```

**Step 5: Commit**

```bash
git add src/js/modules/performance-analyzer.js
git commit -m "feat: add weight and rep regression detection"
```

---

## Task 3: Implement Form Breakdown Detection (Yellow Warning)

**Files:**
- Modify: `src/js/modules/performance-analyzer.js`

**Step 1: Add intra-set variance detection**

Add this method inside the `PerformanceAnalyzer` class:

```javascript
/**
 * Check if reps vary 50%+ within same session (form breakdown indicator)
 * @param {Array} history - Exercise history array
 * @param {Array} currentSets - Current session sets (optional)
 * @returns {Object|null} Warning object if variance detected, null otherwise
 */
detectIntraSetVariance(history, currentSets = []) {
  // Use current session if logging in progress, otherwise use last completed session
  const setsToAnalyze = currentSets.length > 0 ? currentSets : history[history.length - 1]?.sets || [];

  if (setsToAnalyze.length < 2) return null;

  const reps = setsToAnalyze.map(set => set.reps || 0).filter(r => r > 0);
  if (reps.length < 2) return null;

  const maxReps = Math.max(...reps);
  const minReps = Math.min(...reps);

  // Check if difference is 50% or more of max
  const variance = (maxReps - minReps) / maxReps;

  if (variance >= 0.5) {
    return {
      status: 'warning',
      message: `⚠️ Reps inconsistent within session (${reps.join('/')}) - form may be breaking down`,
      pattern: 'form_breakdown'
    };
  }

  return null;
}
```

**Step 2: Add low RIR detection**

Add this method inside the `PerformanceAnalyzer` class:

```javascript
/**
 * Check if RIR is consistently 0-1 (training too close to failure)
 * @param {Array} history - Exercise history array
 * @param {Array} currentSets - Current session sets (optional)
 * @returns {Object|null} Warning object if low RIR detected, null otherwise
 */
detectLowRIR(history, currentSets = []) {
  // Use current session if logging in progress, otherwise use last completed session
  const setsToAnalyze = currentSets.length > 0 ? currentSets : history[history.length - 1]?.sets || [];

  if (setsToAnalyze.length === 0) return null;

  // Check if ALL sets have RIR 0 or 1
  const allLowRIR = setsToAnalyze.every(set => {
    const rir = set.rir !== undefined ? set.rir : 999; // Default high if missing
    return rir <= 1;
  });

  if (allLowRIR && setsToAnalyze.length > 0) {
    return {
      status: 'warning',
      message: '⚠️ Training too close to failure - leave 2-3 reps in reserve',
      pattern: 'form_breakdown'
    };
  }

  return null;
}
```

**Step 3: Integrate form breakdown checks into main method**

Update the `analyzeExercisePerformance` method to add form breakdown checks AFTER regression checks:

```javascript
analyzeExercisePerformance(exerciseKey, currentSets = []) {
  const history = this.storage.getExerciseHistory(exerciseKey);

  // Minimum data requirement: need at least 2 previous workouts for regression
  // But can still check form breakdown on current session with just 1 workout in history
  if (history.length < 1) {
    return {
      status: 'good',
      message: null,
      pattern: null
    };
  }

  // Check for regression patterns first (red alerts) - requires 2+ sessions
  if (history.length >= 2) {
    const weightRegression = this.detectWeightRegression(history);
    if (weightRegression) return weightRegression;

    const repDrop = this.detectRepDrop(history);
    if (repDrop) return repDrop;
  }

  // Check for form breakdown (yellow warnings) - works with current session
  const variance = this.detectIntraSetVariance(history, currentSets);
  if (variance) return variance;

  const lowRIR = this.detectLowRIR(history, currentSets);
  if (lowRIR) return lowRIR;

  // No issues detected
  return {
    status: 'good',
    message: null,
    pattern: null
  };
}
```

**Step 4: Test form breakdown detection manually**

Open browser DevTools, run:
```javascript
// Test intra-set variance
const mockStorage = {
  getExerciseHistory: (key) => [
    { date: '2026-02-01', sets: [{ weight: 20, reps: 10, rir: 2 }, { weight: 20, reps: 10, rir: 2 }] }
  ]
};

const currentSets = [
  { weight: 20, reps: 12, rir: 2 },
  { weight: 20, reps: 12, rir: 2 },
  { weight: 20, reps: 6, rir: 1 }  // 50% drop
];

import('./js/modules/performance-analyzer.js').then(({ PerformanceAnalyzer }) => {
  const analyzer = new PerformanceAnalyzer(mockStorage);
  const result = analyzer.analyzeExercisePerformance('TEST - Exercise', currentSets);
  console.log('Variance test:', result);
  // Expected: status: 'warning', pattern: 'form_breakdown'
});
```

**Step 5: Commit**

```bash
git add src/js/modules/performance-analyzer.js
git commit -m "feat: add form breakdown detection (variance and low RIR)"
```

---

## Task 4: Add Conservative Detection Safeguards

**Files:**
- Modify: `src/js/modules/performance-analyzer.js`

**Step 1: Add deload detection helper**

Add this method at the beginning of the class (before other detection methods):

```javascript
/**
 * Check if user is currently in deload mode
 * Prevents false positives during intentional performance reduction
 * @returns {boolean} True if in deload mode
 */
isInDeload() {
  // Check deload state from storage
  const deloadState = this.storage.getDeloadState?.() || { active: false };
  return deloadState.active === true;
}
```

**Step 2: Update main method to skip analysis during deload**

Update the `analyzeExercisePerformance` method at the very beginning:

```javascript
analyzeExercisePerformance(exerciseKey, currentSets = []) {
  const history = this.storage.getExerciseHistory(exerciseKey);

  // Skip analysis if in deload mode (intentional performance reduction)
  if (this.isInDeload()) {
    return {
      status: 'good',
      message: null,
      pattern: null
    };
  }

  // Minimum data requirement: need at least 1 workout
  if (history.length < 1) {
    return {
      status: 'good',
      message: null,
      pattern: null
    };
  }

  // ... rest of method unchanged
}
```

**Step 3: Add comment documentation about conservative approach**

Add this comment block at the top of the class, after the constructor:

```javascript
constructor(storageManager) {
  this.storage = storageManager;
}

/**
 * CONSERVATIVE DETECTION PHILOSOPHY
 *
 * This analyzer uses high thresholds to avoid false positives:
 * - Requires 2+ previous workouts before flagging regression
 * - Weight regression: Must decrease vs 2 sessions ago (not just 1)
 * - Rep drop: Must be 25%+ decline (not minor fluctuation)
 * - Intra-set variance: Must be 50%+ difference (allows normal fatigue)
 * - Low RIR: Must be ALL sets at 0-1 (not just one hard set)
 * - Skips analysis during deload (prevents false alarms)
 *
 * Design goal: Warn only on clear patterns, not normal variation.
 */
```

**Step 4: Verify conservative behavior manually**

Test edge cases in browser console:
```javascript
// Test 1: Single session (should return 'good')
const mockStorage1 = {
  getExerciseHistory: () => [
    { date: '2026-02-01', sets: [{ weight: 20, reps: 10, rir: 2 }] }
  ],
  getDeloadState: () => ({ active: false })
};

// Test 2: During deload (should return 'good' even with regression)
const mockStorage2 = {
  getExerciseHistory: () => [
    { date: '2026-02-01', sets: [{ weight: 20, reps: 10, rir: 2 }] },
    { date: '2026-02-03', sets: [{ weight: 15, reps: 8, rir: 2 }] }
  ],
  getDeloadState: () => ({ active: true })
};

import('./js/modules/performance-analyzer.js').then(({ PerformanceAnalyzer }) => {
  const analyzer1 = new PerformanceAnalyzer(mockStorage1);
  console.log('Single session test:', analyzer1.analyzeExercisePerformance('TEST'));
  // Expected: status: 'good' (not enough data)

  const analyzer2 = new PerformanceAnalyzer(mockStorage2);
  console.log('Deload test:', analyzer2.analyzeExercisePerformance('TEST'));
  // Expected: status: 'good' (deload mode, skip analysis)
});
```

**Step 5: Commit**

```bash
git add src/js/modules/performance-analyzer.js
git commit -m "feat: add conservative safeguards (deload detection, high thresholds)"
```

---

## Task 5: Integrate Analyzer into App.js

**Files:**
- Modify: `src/js/app.js`

**Step 1: Import PerformanceAnalyzer at top of file**

Add to the import section at the top of `src/js/app.js`:

```javascript
import { PerformanceAnalyzer } from './modules/performance-analyzer.js';
```

**Step 2: Initialize analyzer in App constructor**

In the `App` class constructor, add this after the other manager initializations:

```javascript
constructor() {
  this.storage = new StorageManager();
  this.workoutManager = new WorkoutManager(this.storage);
  this.deloadManager = new DeloadManager(this.storage);
  this.performanceAnalyzer = new PerformanceAnalyzer(this.storage);  // NEW
  this.currentWorkout = null;
  this.currentExerciseIndex = 0;

  // ... rest of constructor
}
```

**Step 3: Add performance badge rendering helper method**

Add this method to the `App` class (find a good spot near other UI helpers):

```javascript
/**
 * Get performance badge HTML for an exercise during workout
 * @param {string} exerciseKey - Exercise identifier
 * @param {Array} currentSets - Current logged sets for this exercise
 * @returns {string} HTML string for badge, or empty string if no issues
 */
getPerformanceBadge(exerciseKey, currentSets = []) {
  const analysis = this.performanceAnalyzer.analyzeExercisePerformance(exerciseKey, currentSets);

  if (analysis.status === 'good' || !analysis.message) {
    return '';
  }

  const badgeClass = analysis.status === 'alert' ? 'badge-alert' : 'badge-warning';
  const icon = analysis.status === 'alert' ? '🔴' : '🟡';

  return `
    <div class="performance-badge ${badgeClass}">
      ${icon} ${this.escapeHtml(analysis.message)}
    </div>
  `;
}
```

**Step 4: Find the renderExercises method and add badge rendering**

Locate the `renderExercises` method in `app.js`. Look for where exercise headers are rendered. Add the performance badge after the exercise title.

Find the section that renders exercise HTML (search for "exercise-header" or similar), and modify it to include:

```javascript
// Inside renderExercises method, when building exercise header HTML
const exerciseKey = `${this.currentWorkout.name} - ${exercise.name}`;
const exerciseSession = this.workoutSession.exercises[index];

// NEW: Get performance badge for this exercise
const performanceBadge = this.getPerformanceBadge(exerciseKey, exerciseSession.sets);

// Build exercise HTML with badge
exerciseHtml += `
  <div class="exercise-header">
    <h3>${this.escapeHtml(exercise.name)}</h3>
    <div class="exercise-meta">${exercise.sets} sets × ${exercise.reps} reps @ RIR ${exercise.rir}</div>
    ${performanceBadge}
  </div>
`;
```

**Step 5: Test integration manually**

Start a workout in the browser:
1. Click "Start Workout"
2. Log a few sets
3. Check browser console for errors
4. Verify no badges appear on first workout (no history)

Expected: No errors, no badges (not enough data yet)

**Step 6: Commit**

```bash
git add src/js/app.js
git commit -m "feat: integrate performance analyzer into workout UI"
```

---

## Task 6: Add Performance Badge CSS Styling

**Files:**
- Modify: `src/css/styles.css` (or create `src/css/performance-badges.css` if modular)

**Step 1: Add badge styles**

Add this CSS to your main stylesheet:

```css
/* Performance Analysis Badges */
.performance-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 6px;
  font-size: var(--font-sm);
  font-weight: 500;
  margin-top: var(--spacing-xs);
  line-height: 1.4;
}

.badge-alert {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid var(--color-warning);
  color: var(--color-warning);
}

/* Make badges more prominent on small screens */
@media (max-width: 768px) {
  .performance-badge {
    display: block;
    width: 100%;
    text-align: center;
    margin-top: var(--spacing-sm);
  }
}
```

**Step 2: Verify CSS variables exist**

Check that these CSS variables are defined in your `:root` or `html` selector:
- `--spacing-xs`
- `--spacing-sm`
- `--font-sm`
- `--color-danger`
- `--color-warning`

If not defined, add them:

```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --font-sm: 14px;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
}
```

**Step 3: Test badge appearance**

To test without real data, temporarily add a static badge in HTML:

```html
<!-- Temporary test badge in index.html -->
<div class="performance-badge badge-alert">
  🔴 ⚠️ Weight regressed - test badge
</div>
<div class="performance-badge badge-warning">
  🟡 ⚠️ Form breaking down - test badge
</div>
```

Load page, verify:
- Red badge has red border/text
- Yellow badge has orange/yellow border/text
- Badges are readable and prominent
- Mobile view shows full-width badges

Remove test badges after verification.

**Step 4: Commit**

```bash
git add src/css/styles.css
git commit -m "style: add performance badge CSS styling"
```

---

## Task 7: Add Real-Time Badge Updates During Workout

**Files:**
- Modify: `src/js/app.js`

**Step 1: Find the set logging handler**

Locate the method that handles logging a set (search for "logSet" or similar). This is where sets are added to `workoutSession.exercises[index].sets`.

**Step 2: Add badge re-render after set logged**

After a set is successfully logged, trigger a badge update. Add this code:

```javascript
// Inside the set logging handler, after set is saved
logSet(exerciseIndex, setIndex, weight, reps, rir) {
  // ... existing set logging code ...

  // Update the set
  this.workoutSession.exercises[exerciseIndex].sets[setIndex] = {
    weight,
    reps,
    rir
  };

  // NEW: Update performance badge in real-time
  this.updatePerformanceBadge(exerciseIndex);

  // ... rest of method ...
}
```

**Step 3: Implement updatePerformanceBadge method**

Add this new method to the `App` class:

```javascript
/**
 * Update the performance badge for a specific exercise during workout
 * @param {number} exerciseIndex - Index of exercise in current workout
 */
updatePerformanceBadge(exerciseIndex) {
  const exercise = this.currentWorkout.exercises[exerciseIndex];
  const exerciseKey = `${this.currentWorkout.name} - ${exercise.name}`;
  const exerciseSession = this.workoutSession.exercises[exerciseIndex];

  // Get fresh analysis
  const badgeHtml = this.getPerformanceBadge(exerciseKey, exerciseSession.sets);

  // Find badge container in DOM
  const exerciseCard = document.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
  if (!exerciseCard) return;

  // Find existing badge or header where badge should appear
  let badgeContainer = exerciseCard.querySelector('.performance-badge-container');

  if (!badgeContainer) {
    // Create container if doesn't exist
    const header = exerciseCard.querySelector('.exercise-header');
    if (header) {
      badgeContainer = document.createElement('div');
      badgeContainer.className = 'performance-badge-container';
      header.appendChild(badgeContainer);
    }
  }

  if (badgeContainer) {
    badgeContainer.innerHTML = badgeHtml;
  }
}
```

**Step 4: Update renderExercises to include badge container**

Modify the exercise header HTML in `renderExercises` to include a dedicated badge container:

```javascript
exerciseHtml += `
  <div class="exercise-header">
    <h3>${this.escapeHtml(exercise.name)}</h3>
    <div class="exercise-meta">${exercise.sets} sets × ${exercise.reps} reps @ RIR ${exercise.rir}</div>
    <div class="performance-badge-container">
      ${performanceBadge}
    </div>
  </div>
`;
```

**Step 5: Test real-time updates**

Start a workout, log sets that should trigger a warning:
1. Log Set 1: 12 reps @ RIR 2
2. Log Set 2: 12 reps @ RIR 2
3. Log Set 3: 6 reps @ RIR 1

Expected: Yellow warning badge appears after Set 3 is logged, showing "Reps inconsistent within session"

**Step 6: Commit**

```bash
git add src/js/app.js
git commit -m "feat: add real-time performance badge updates during workout"
```

---

## Task 8: Add Error Handling and Edge Cases

**Files:**
- Modify: `src/js/modules/performance-analyzer.js`

**Step 1: Add try-catch wrapper in main method**

Update `analyzeExercisePerformance` to handle errors gracefully:

```javascript
analyzeExercisePerformance(exerciseKey, currentSets = []) {
  try {
    const history = this.storage.getExerciseHistory(exerciseKey);

    // Skip analysis if in deload mode
    if (this.isInDeload()) {
      return {
        status: 'good',
        message: null,
        pattern: null
      };
    }

    // ... rest of existing logic ...

  } catch (error) {
    // Log error but don't crash the app
    console.error('[PerformanceAnalyzer] Analysis failed:', error);
    return {
      status: 'good',
      message: null,
      pattern: null
    };
  }
}
```

**Step 2: Add null/undefined guards in detection methods**

Update `detectWeightRegression` to handle missing data:

```javascript
detectWeightRegression(history) {
  if (!history || history.length < 2) return null;

  const twoSessionsAgo = history[history.length - 2];
  const lastSession = history[history.length - 1];

  // Guard against missing sets
  if (!twoSessionsAgo?.sets?.length || !lastSession?.sets?.length) {
    return null;
  }

  const oldWeight = twoSessionsAgo.sets[0]?.weight;
  const newWeight = lastSession.sets[0]?.weight;

  // Only flag if we have valid weight data
  if (oldWeight === undefined || newWeight === undefined) {
    return null;
  }

  if (newWeight < oldWeight) {
    return {
      status: 'alert',
      message: `⚠️ Weight regressed from ${oldWeight}kg to ${newWeight}kg - check if recovering from illness/deload`,
      pattern: 'regression'
    };
  }

  return null;
}
```

**Step 3: Add similar guards to other detection methods**

Update `detectRepDrop`, `detectIntraSetVariance`, and `detectLowRIR` with null checks:

```javascript
detectRepDrop(history) {
  if (!history || history.length < 2) return null;

  const twoSessionsAgo = history[history.length - 2];
  const lastSession = history[history.length - 1];

  if (!twoSessionsAgo?.sets?.length || !lastSession?.sets?.length) {
    return null;
  }

  // ... rest of method with existing logic
}

detectIntraSetVariance(history, currentSets = []) {
  const setsToAnalyze = currentSets.length > 0 ? currentSets : history[history.length - 1]?.sets || [];

  if (!Array.isArray(setsToAnalyze) || setsToAnalyze.length < 2) {
    return null;
  }

  // ... rest of method
}

detectLowRIR(history, currentSets = []) {
  const setsToAnalyze = currentSets.length > 0 ? currentSets : history[history.length - 1]?.sets || [];

  if (!Array.isArray(setsToAnalyze) || setsToAnalyze.length === 0) {
    return null;
  }

  // ... rest of method
}
```

**Step 4: Test with malformed data**

In browser console, test edge cases:

```javascript
const edgeCaseStorage = {
  getExerciseHistory: () => [
    { date: '2026-02-01', sets: null },  // Null sets
    { date: '2026-02-03', sets: [] }      // Empty sets
  ],
  getDeloadState: () => ({ active: false })
};

import('./js/modules/performance-analyzer.js').then(({ PerformanceAnalyzer }) => {
  const analyzer = new PerformanceAnalyzer(edgeCaseStorage);
  const result = analyzer.analyzeExercisePerformance('TEST');
  console.log('Edge case test:', result);
  // Expected: status: 'good', no crash
});
```

**Step 5: Commit**

```bash
git add src/js/modules/performance-analyzer.js
git commit -m "feat: add error handling and null guards to analyzer"
```

---

## Task 9: Documentation and Testing

**Files:**
- Modify: `src/js/modules/performance-analyzer.js` (add JSDoc)
- Create: `docs/performance-analyzer-usage.md`

**Step 1: Add comprehensive JSDoc to all methods**

Add detailed JSDoc comments:

```javascript
/**
 * PerformanceAnalyzer - Automated form quality and regression detection
 *
 * DESIGN PHILOSOPHY:
 * - Read-only: Never modifies localStorage
 * - Conservative: High thresholds to avoid false positives
 * - Context-aware: Skips analysis during deload
 * - Real-time: Works with incomplete session data
 *
 * DETECTION RULES:
 * - Red Alert (regression): Weight dropped OR reps dropped 25%+
 * - Yellow Warning (form breakdown): Reps vary 50%+ OR all sets RIR 0-1
 * - Requires 2+ previous workouts for regression detection
 * - Can detect form breakdown with just current session data
 *
 * @example
 * const analyzer = new PerformanceAnalyzer(storageManager);
 * const result = analyzer.analyzeExercisePerformance('UPPER_A - Bench Press', currentSets);
 * if (result.status === 'alert') {
 *   console.log(result.message); // Show warning to user
 * }
 */
export class PerformanceAnalyzer {
  // ... existing code
}
```

**Step 2: Create usage documentation**

Create `docs/performance-analyzer-usage.md`:

```markdown
# Performance Analyzer Usage Guide

## Overview

The Performance Analyzer automatically detects form breakdown and overtraining patterns using objective performance data. It runs during workouts and displays real-time badges when issues are detected.

## How It Works

**Conservative Detection:**
- Requires 2+ previous workouts before flagging regression
- Uses high thresholds (25% rep drops, 50% intra-set variance)
- Skips analysis during deload weeks
- Never modifies localStorage (read-only)

**Red Alerts (Regression):**
- Weight decreased compared to 2 sessions ago
- Average reps dropped 25%+ compared to 2 sessions ago
- Message: "Weight regressed - check recovery" or "Rep performance dropped"

**Yellow Warnings (Form Breakdown):**
- Reps vary 50%+ within same session (e.g., 12/12/6)
- All sets logged at RIR 0-1 (training too close to failure)
- Message: "Reps inconsistent" or "Training too close to failure"

## Integration Example

```javascript
import { PerformanceAnalyzer } from './modules/performance-analyzer.js';

// Initialize in App constructor
this.performanceAnalyzer = new PerformanceAnalyzer(this.storage);

// During workout rendering
const analysis = this.performanceAnalyzer.analyzeExercisePerformance(
  exerciseKey,
  currentSets
);

if (analysis.status !== 'good') {
  // Display badge with analysis.message
}
```

## Testing Checklist

- [ ] No badges appear on first workout (insufficient data)
- [ ] Red badge appears when weight decreases
- [ ] Red badge appears when reps drop 25%+
- [ ] Yellow badge appears when reps vary 50%+ (e.g., 12/12/6)
- [ ] Yellow badge appears when all sets RIR 0-1
- [ ] No badges during deload week
- [ ] Badges update in real-time as sets are logged
- [ ] No crashes with malformed data (null sets, empty arrays)
```

**Step 3: Create manual test plan**

Add this section to the documentation:

```markdown
## Manual Testing Scenarios

### Scenario 1: Weight Regression
1. Complete a workout with 20kg bench press (3 sets)
2. Complete another workout with 20kg (3 sets)
3. Start third workout, log 17.5kg
4. Expected: 🔴 Red badge "Weight regressed from 20kg to 17.5kg"

### Scenario 2: Rep Drop
1. Complete a workout with average 10 reps per set
2. Complete another workout with average 10 reps per set
3. Start third workout, log average 7 reps per set
4. Expected: 🔴 Red badge "Rep performance dropped 30%"

### Scenario 3: Intra-Set Variance
1. Start workout, log Set 1: 12 reps
2. Log Set 2: 12 reps
3. Log Set 3: 6 reps
4. Expected: 🟡 Yellow badge "Reps inconsistent (12/12/6)"

### Scenario 4: Low RIR
1. Start workout, log Set 1: RIR 0
2. Log Set 2: RIR 1
3. Log Set 3: RIR 0
4. Expected: 🟡 Yellow badge "Training too close to failure"

### Scenario 5: Deload Mode
1. Activate deload in settings
2. Complete workout with reduced weights
3. Expected: No badges (analysis skipped during deload)
```

**Step 4: Commit**

```bash
git add src/js/modules/performance-analyzer.js docs/performance-analyzer-usage.md
git commit -m "docs: add comprehensive performance analyzer documentation"
```

---

## Task 10: Final Integration Testing and Polish

**Files:**
- Test all integration points
- Verify no console errors
- Check mobile responsiveness

**Step 1: Full workflow test**

Perform complete workout flow:
1. Open app in browser
2. Start "Upper A" workout
3. Log first exercise completely (3 sets)
4. Verify no badges appear (first workout, no history)
5. Complete workout and save
6. Start "Lower A" workout
7. Log first exercise completely
8. Verify no badges (only 1 previous workout)
9. Complete and save
10. Start "Upper A" again (third workout)
11. Intentionally log lower weight or varied reps
12. Verify appropriate badge appears

**Step 2: Test mobile responsiveness**

Open DevTools → Device Toolbar → iPhone/Android view:
- Verify badges display full-width on mobile
- Check text is readable
- Ensure badges don't break layout
- Test landscape orientation

**Step 3: Check browser console for errors**

Throughout testing:
- No JavaScript errors
- No undefined variable warnings
- Performance analyzer logs appear with `[PerformanceAnalyzer]` prefix

**Step 4: Verify backwards compatibility**

Test with existing workout data:
- Load app with pre-existing localStorage data
- Verify analyzer doesn't crash on old data format
- Confirm badges only appear when sufficient history exists

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete performance analyzer integration with testing"
```

---

## Success Criteria

**Functional Requirements:**
- [x] Analyzer module created with all detection methods
- [x] Red alerts trigger on weight/rep regression (25%+ threshold)
- [x] Yellow warnings trigger on form breakdown (50%+ variance, low RIR)
- [x] Conservative approach (2+ sessions required for regression)
- [x] Deload mode skips analysis
- [x] Real-time badge updates during workout
- [x] Error handling prevents crashes
- [x] CSS styling matches app theme
- [x] Mobile responsive design
- [x] Documentation complete

**User Experience:**
- Badges are non-intrusive (don't block workflow)
- Messages are clear and actionable
- No false positives on normal fatigue
- Real-time feedback as sets are logged
- Works seamlessly with existing UI

**Code Quality:**
- Read-only module (no localStorage writes)
- Comprehensive JSDoc comments
- Null/undefined guards on all methods
- Try-catch error handling
- No duplicate code
- Modular integration into App.js

---

## Notes for Implementer

**Key Design Decisions:**

1. **Conservative Thresholds:** We deliberately use high thresholds (25% rep drops, 50% variance) to avoid annoying false positives. Beginners have normal performance variation.

2. **2+ Sessions Required:** Regression detection needs 2 previous workouts to compare against. This prevents flagging normal week-to-week fluctuation.

3. **Deload Awareness:** The analyzer checks deload state and skips analysis during deload weeks, preventing false alarms when weight/reps are intentionally reduced.

4. **Real-Time Updates:** Badges update after each set is logged, giving immediate feedback during the workout.

5. **Read-Only Module:** The analyzer NEVER modifies localStorage. It only reads history and returns analysis objects. This makes it safe to call repeatedly.

**Common Pitfalls to Avoid:**

- Don't make thresholds too sensitive (creates alert fatigue)
- Don't forget null checks (history can have missing/malformed data)
- Don't block the UI (badges should be informational, not modal popups)
- Don't analyze during deload (false positives guaranteed)
- Don't store analysis results (recalculate fresh each time)

**Testing Tips:**

Use browser localStorage manipulation to create test scenarios:
```javascript
// Manually inject history for testing
localStorage.setItem('build_exercise_UPPER_A - Bench Press', JSON.stringify([
  { date: '2026-02-01', sets: [{weight: 20, reps: 10, rir: 2}] },
  { date: '2026-02-03', sets: [{weight: 15, reps: 8, rir: 2}] }
]));
```

Then start a workout and verify the red regression badge appears.
