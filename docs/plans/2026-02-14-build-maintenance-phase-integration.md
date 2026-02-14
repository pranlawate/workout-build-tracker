# Build/Maintenance Phase Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make existing phase toggles functional by implementing PhaseManager module and integrating phase-aware behavior into progression, deload, and unlock systems.

**Architecture:** Create centralized PhaseManager coordinator module (read-only pattern like PerformanceAnalyzer). Inject PhaseManager into DeloadManager and UnlockEvaluator via constructors. Pass as parameter to progression.js functions. App.js orchestrates instantiation and wiring.

**Tech Stack:** Vanilla JavaScript ES6, localStorage, no dependencies

---

## Task 1: Create PhaseManager Module

**Files:**
- Create: `js/modules/phase-manager.js`

**Step 1: Create PhaseManager class skeleton**

Create `js/modules/phase-manager.js` with the following content:

```javascript
/**
 * PhaseManager - Centralized coordinator for training phase behavior
 * Read-only module that provides phase-aware recommendations
 *
 * Phases:
 * - building: Progressive overload, all unlocks, 6-8 week deloads
 * - maintenance: Tempo focus, bodyweight priority, 4-6 week deloads
 * - recovery: (Future) Safety-first, frequent deloads
 */
export class PhaseManager {
  constructor(storageManager) {
    this.storage = storageManager;
  }

  /**
   * Get current training phase
   * @returns {string} 'building' | 'maintenance' | 'recovery'
   */
  getPhase() {
    return this.storage.getTrainingPhase();
  }

  /**
   * Get progression behavior for current phase
   * @returns {Object} { allowWeightIncrease, allowWeightDecrease, tempoFocus }
   */
  getProgressionBehavior() {
    const phase = this.getPhase();

    switch (phase) {
      case 'building':
        return {
          allowWeightIncrease: true,
          allowWeightDecrease: false,
          tempoFocus: false
        };

      case 'maintenance':
        return {
          allowWeightIncrease: false,
          allowWeightDecrease: false,
          tempoFocus: true
        };

      case 'recovery':
        // Future implementation
        return {
          allowWeightIncrease: false,
          allowWeightDecrease: true,
          tempoFocus: false
        };

      default:
        // Fallback to building if phase unknown
        return {
          allowWeightIncrease: true,
          allowWeightDecrease: false,
          tempoFocus: false
        };
    }
  }

  /**
   * Get deload sensitivity for current phase
   * @returns {string} 'normal' | 'high' | 'very_high'
   */
  getDeloadSensitivity() {
    const phase = this.getPhase();

    switch (phase) {
      case 'building':
        return 'normal';      // 6-8 weeks
      case 'maintenance':
        return 'high';        // 4-6 weeks
      case 'recovery':
        return 'very_high';   // 2-3 weeks (future)
      default:
        return 'normal';
    }
  }

  /**
   * Get unlock priority for current phase
   * @returns {string} 'all' | 'bodyweight_priority' | 'safety_first'
   */
  getUnlockPriority() {
    const phase = this.getPhase();

    switch (phase) {
      case 'building':
        return 'all';                 // All exercise types equal priority
      case 'maintenance':
        return 'bodyweight_priority';  // Prioritize bodyweight/traditional
      case 'recovery':
        return 'safety_first';        // Only bodyweight (future)
      default:
        return 'all';
    }
  }
}
```

**Step 2: Verify file created**

Run: `ls -la js/modules/phase-manager.js`
Expected: File exists with ~100 lines

**Step 3: Commit PhaseManager module**

```bash
git add js/modules/phase-manager.js
git commit -m "feat: add PhaseManager coordinator module

- Read-only module for phase-aware behavior
- Provides progression, deload, and unlock recommendations
- Supports building/maintenance phases (recovery designed but not implemented)
- Follows PerformanceAnalyzer read-only pattern"
```

---

## Task 2: Update DeloadManager Constructor

**Files:**
- Modify: `js/modules/deload.js:1-10`

**Step 1: Update DeloadManager constructor**

In `js/modules/deload.js`, modify the constructor (lines 4-7):

```javascript
/**
 * Manages deload system state and triggers
 */
export class DeloadManager {
  constructor(storage, phaseManager) {
    this.storage = storage;
    this.phaseManager = phaseManager;
  }
```

**Step 2: Update shouldTriggerDeload method**

In `js/modules/deload.js`, replace the `shouldTriggerDeload()` method (lines 9-38) with:

```javascript
  /**
   * Checks if deload should be triggered based on time, performance, or fatigue
   * Uses phase-aware sensitivity for time-based triggers
   * @returns {Object} Object with trigger status and reason
   */
  shouldTriggerDeload() {
    const deloadState = this.storage.getDeloadState();

    // Don't trigger if already in deload
    if (deloadState.active) return { trigger: false };

    // Get phase-aware base threshold
    const sensitivity = this.phaseManager.getDeloadSensitivity();
    const baseWeeks = {
      normal: 6,      // Building: 6-8 weeks
      high: 4,        // Maintenance: 4-6 weeks
      very_high: 2    // Recovery: 2-3 weeks (future)
    }[sensitivity];

    // Check time-based trigger (dynamic threshold)
    const weeksSinceDeload = this.calculateWeeksSinceDeload(deloadState.lastDeloadDate);
    if (weeksSinceDeload >= baseWeeks) {
      return { trigger: true, reason: 'time', weeks: weeksSinceDeload };
    }

    // Check performance-based trigger (regression on 2+ exercises)
    const regressionCount = this.detectRegressions();
    if (regressionCount >= 2) {
      return { trigger: true, reason: 'performance', regressions: regressionCount };
    }

    // Check fatigue-based trigger (score ≥8 for 2 consecutive workouts)
    const fatigueAlert = this.checkFatigueScore();
    if (fatigueAlert) {
      return { trigger: true, reason: 'fatigue', score: fatigueAlert.score };
    }

    return { trigger: false };
  }
```

**Step 3: Verify changes**

Run: `grep -n "phaseManager" js/modules/deload.js`
Expected: Shows phaseManager in constructor and shouldTriggerDeload method

**Step 4: Commit DeloadManager changes**

```bash
git add js/modules/deload.js
git commit -m "feat: add phase-aware deload timing to DeloadManager

- Accept phaseManager in constructor
- Use getDeloadSensitivity() for dynamic week thresholds
- Building: 6 weeks, Maintenance: 4 weeks, Recovery: 2 weeks (future)
- Performance/fatigue triggers unchanged"
```

---

## Task 3: Update UnlockEvaluator Constructor

**Files:**
- Modify: `js/modules/unlock-evaluator.js:1-20`

**Step 1: Update UnlockEvaluator constructor**

In `js/modules/unlock-evaluator.js`, modify the constructor (lines 14-19):

```javascript
export class UnlockEvaluator {
  /**
   * @param {Object} storageManager - Storage manager instance
   * @param {Object} phaseManager - Phase manager instance
   */
  constructor(storageManager, phaseManager) {
    this.storage = storageManager;
    this.phaseManager = phaseManager;
  }
```

**Step 2: Add phase-aware unlock evaluation method**

In `js/modules/unlock-evaluator.js`, add after the existing `evaluateUnlock` method (around line 105):

```javascript
  /**
   * Evaluate unlock with phase-aware priority
   *
   * @param {string} targetExercise - Exercise to unlock
   * @param {string} prerequisiteExercise - Current exercise (progression source)
   * @returns {Object} { unlocked, criteria, missing, priority, phaseRecommended }
   */
  evaluateUnlockWithPhasePriority(targetExercise, prerequisiteExercise) {
    // Get base unlock evaluation (criteria met?)
    const baseEvaluation = this.evaluateUnlock(targetExercise, prerequisiteExercise);

    if (!baseEvaluation.unlocked) {
      return { ...baseEvaluation, priority: 999, phaseRecommended: false };
    }

    // Add phase-aware priority
    const unlockPriority = this.phaseManager.getUnlockPriority();
    const exerciseType = this._getExerciseType(targetExercise);

    return {
      ...baseEvaluation,
      priority: this._calculatePriority(exerciseType, unlockPriority),
      phaseRecommended: this._isPhaseRecommended(exerciseType, unlockPriority)
    };
  }

  /**
   * Determine exercise type for prioritization
   * @private
   */
  _getExerciseType(exerciseName) {
    if (exerciseName.includes('Barbell')) return 'barbell';
    if (exerciseName.includes('Sadharan') || exerciseName.includes('Baithak')) return 'bodyweight';
    if (exerciseName.includes('Mudgal')) return 'traditional';
    if (exerciseName.includes('Pull-up')) return 'bodyweight';
    return 'equipment';
  }

  /**
   * Calculate priority based on phase and exercise type
   * Lower number = higher priority (shown first)
   * @private
   */
  _calculatePriority(exerciseType, unlockPriority) {
    if (unlockPriority === 'all') {
      return 1; // Building: all exercises equal priority
    }

    if (unlockPriority === 'bodyweight_priority') {
      // Maintenance: bodyweight/traditional first, equipment second
      return (exerciseType === 'bodyweight' || exerciseType === 'traditional') ? 1 : 2;
    }

    if (unlockPriority === 'safety_first') {
      // Recovery: only bodyweight allowed (future)
      return exerciseType === 'bodyweight' ? 1 : 999;
    }

    return 1;
  }

  /**
   * Check if exercise is recommended for current phase
   * @private
   */
  _isPhaseRecommended(exerciseType, unlockPriority) {
    if (unlockPriority === 'all') return true;
    if (unlockPriority === 'bodyweight_priority') {
      return exerciseType === 'bodyweight' || exerciseType === 'traditional';
    }
    if (unlockPriority === 'safety_first') {
      return exerciseType === 'bodyweight';
    }
    return true;
  }
```

**Step 3: Verify changes**

Run: `grep -n "phaseManager" js/modules/unlock-evaluator.js`
Expected: Shows phaseManager in constructor and new methods

**Step 4: Commit UnlockEvaluator changes**

```bash
git add js/modules/unlock-evaluator.js
git commit -m "feat: add phase-aware unlock prioritization to UnlockEvaluator

- Accept phaseManager in constructor
- Add evaluateUnlockWithPhasePriority() method
- Building: all exercises equal priority
- Maintenance: bodyweight/traditional exercises shown first
- Recovery: only bodyweight (future)"
```

---

## Task 4: Update Progression Functions

**Files:**
- Modify: `js/modules/progression.js:73-106`

**Step 1: Update shouldIncreaseWeight function signature**

In `js/modules/progression.js`, update the `shouldIncreaseWeight` function (line 73):

```javascript
export function shouldIncreaseWeight(sets, exercise, phaseManager) {
  // Input validation
  if (!sets || !Array.isArray(sets) || sets.length === 0) {
    return false;
  }

  if (!exercise || typeof exercise !== 'object') {
    throw new Error('Invalid exercise: must be an object');
  }

  if (!exercise.repRange) {
    throw new Error('Exercise must have repRange property');
  }

  // Check phase-aware progression behavior
  if (phaseManager) {
    const progressionBehavior = phaseManager.getProgressionBehavior();

    // Maintenance/Recovery blocks weight increases
    if (!progressionBehavior.allowWeightIncrease) {
      return false;
    }
  }

  // Building phase - existing logic
  const { max } = parseRepRange(exercise.repRange);

  // Time-based exercises (no rirTarget): just check if all sets hit max duration
  const isTimeBased = /\d+s\b/.test(exercise.repRange);
  if (isTimeBased || !exercise.rirTarget) {
    return sets.every(set => set.reps >= max);
  }

  // Rep-based exercises: check reps AND RIR
  const { min: rirMin } = parseRIRTarget(exercise.rirTarget);

  // All sets must hit max reps
  const allSetsMaxReps = sets.every(set => set.reps >= max);

  // All sets must have RIR >= minimum target
  const allSetsGoodRIR = sets.every(set => set.rir >= rirMin);

  return allSetsMaxReps && allSetsGoodRIR;
}
```

**Step 2: Verify changes**

Run: `grep -A 5 "export function shouldIncreaseWeight" js/modules/progression.js`
Expected: Shows phaseManager parameter in function signature

**Step 3: Commit progression changes**

```bash
git add js/modules/progression.js
git commit -m "feat: add phase-aware weight progression to shouldIncreaseWeight

- Add phaseManager parameter (optional for backwards compatibility)
- Check allowWeightIncrease from getProgressionBehavior()
- Maintenance/Recovery blocks weight increases
- Building phase logic unchanged"
```

---

## Task 5: Integrate PhaseManager in App.js

**Files:**
- Modify: `js/app.js:1-50` (imports and constructor)
- Modify: `js/app.js:~various locations` (instantiation and usage)

**Step 1: Add PhaseManager import**

In `js/app.js`, add import after existing imports (around line 10):

```javascript
import { PhaseManager } from './modules/phase-manager.js';
```

**Step 2: Instantiate PhaseManager in constructor**

In `js/app.js`, in the `constructor()` method (around line 25), add after `this.storage = new StorageManager();`:

```javascript
  constructor() {
    this.storage = new StorageManager();
    this.phaseManager = new PhaseManager(this.storage);
    this.workoutManager = new WorkoutManager(this.storage);
    // ... rest of constructor
```

**Step 3: Update DeloadManager instantiation**

In `js/app.js`, find the DeloadManager instantiation (search for `new DeloadManager`) and update it:

```javascript
    this.deloadManager = new DeloadManager(this.storage, this.phaseManager);
```

**Step 4: Update UnlockEvaluator instantiation**

In `js/app.js`, find the UnlockEvaluator instantiation (search for `new UnlockEvaluator`) and update it:

```javascript
    this.unlockEvaluator = new UnlockEvaluator(this.storage, this.phaseManager);
```

**Step 5: Verify imports and instantiation**

Run: `grep -n "PhaseManager" js/app.js`
Expected: Shows import and instantiation

**Step 6: Commit app.js integration**

```bash
git add js/app.js
git commit -m "feat: integrate PhaseManager into app initialization

- Import PhaseManager module
- Instantiate in constructor after storage
- Inject into DeloadManager constructor
- Inject into UnlockEvaluator constructor"
```

---

## Task 6: Add Tempo Suggestion Logic

**Files:**
- Modify: `js/app.js:~workout screen progression logic`

**Step 1: Find progression suggestion code**

Search for where progression suggestions are displayed in the workout screen. Look for text like "Add weight" or progression messages. This is likely in a method that renders exercise cards or handles set completion.

Run: `grep -n "Add.*weight\|progression" js/app.js | head -20`

**Step 2: Add phase-aware progression messages**

In the location where progression suggestions are shown (likely in `handleLogSet` or a render method), add phase-aware logic:

```javascript
// Get progression status
const readyToProgress = shouldIncreaseWeight(
  recentSets,
  exercise,
  this.phaseManager
);

if (readyToProgress) {
  const phase = this.phaseManager.getPhase();
  const progressionBehavior = this.phaseManager.getProgressionBehavior();

  if (progressionBehavior.tempoFocus) {
    // Maintenance phase: Suggest tempo variation
    progressionMessage = '💪 Maintenance: Try 3-1-2 tempo (pause at bottom)';
  } else {
    // Building phase: Suggest weight increase
    const increment = exercise.weightIncrement || 1.25;
    progressionMessage = `🎯 Ready to progress! Add ${increment}kg next session`;
  }
} else {
  progressionMessage = 'Keep going! 💪';
}
```

**Note:** The exact location and variable names will depend on the current code structure. Update the progression message rendering to use phase-aware logic.

**Step 3: Pass phaseManager to shouldIncreaseWeight calls**

Search for all calls to `shouldIncreaseWeight` in app.js:

Run: `grep -n "shouldIncreaseWeight" js/app.js`

Update each call to include `this.phaseManager` as the third parameter:

```javascript
// Before
const shouldProgress = shouldIncreaseWeight(sets, exercise);

// After
const shouldProgress = shouldIncreaseWeight(sets, exercise, this.phaseManager);
```

**Step 4: Verify phase-aware messages**

Run: `grep -n "tempoFocus\|Maintenance:" js/app.js`
Expected: Shows tempo suggestion logic

**Step 5: Commit tempo suggestion logic**

```bash
git add js/app.js
git commit -m "feat: add phase-aware progression messages

- Maintenance phase: suggest tempo variations instead of weight increases
- Building phase: suggest weight increases (current behavior)
- Pass phaseManager to shouldIncreaseWeight calls
- Display clear instructions for tempo variations (3-1-2 tempo)"
```

---

## Task 7: Update Service Worker Cache

**Files:**
- Modify: `sw.js:1`

**Step 1: Increment cache version**

In `sw.js`, update the `CACHE_NAME` constant (line 1):

```javascript
const CACHE_NAME = 'build-tracker-v64';
```

**Step 2: Add new PhaseManager module to cache URLs**

In `sw.js`, add the new module to `CACHE_URLS` array (after line 27):

```javascript
  './js/modules/phase-manager.js',
```

**Step 3: Verify cache updates**

Run: `grep -n "phase-manager" sw.js`
Expected: Shows phase-manager.js in CACHE_URLS

Run: `grep -n "build-tracker-v" sw.js`
Expected: Shows v64

**Step 4: Commit cache updates**

```bash
git add sw.js
git commit -m "chore: update service worker cache to v64

- Add phase-manager.js to cached files
- Increment cache version for phase integration feature"
```

---

## Task 8: Manual Testing - Building Phase

**Files:**
- Test: Manual browser testing

**Step 1: Clear browser cache and reload**

1. Open browser DevTools (F12)
2. Application tab → Storage → Clear site data
3. Reload page (Ctrl+Shift+R for hard reload)
4. Verify app loads without errors

**Step 2: Verify default phase is Building**

1. Navigate to Settings
2. Check that "Building" button is active/highlighted
3. Phase info text should read: "Building: Focus on progressive overload and strength gains"

**Step 3: Test weight progression in Building phase**

1. Navigate to a workout (e.g., UPPER_A)
2. Find an exercise you can progress (e.g., DB Flat Bench Press)
3. Complete sets with max reps @ RIR 2-3
4. Verify progression message shows: "🎯 Ready to progress! Add [X]kg next session"
5. Message should NOT mention tempo

**Step 4: Verify deload timing**

1. Check deload state in localStorage
2. Run in browser console:
   ```javascript
   const storage = new StorageManager();
   const deloadManager = new DeloadManager(storage, new PhaseManager(storage));
   console.log(deloadManager.shouldTriggerDeload());
   ```
3. Verify base threshold is 6 weeks for Building phase

Expected: Building phase behavior identical to current (no breaking changes)

**Step 5: Document Building phase test results**

Create notes:
- ✅ Default phase is Building
- ✅ Weight progression suggestions work
- ✅ No tempo messages in Building phase
- ✅ Deload threshold is 6 weeks

---

## Task 9: Manual Testing - Maintenance Phase

**Files:**
- Test: Manual browser testing

**Step 1: Switch to Maintenance phase**

1. Navigate to Settings
2. Click "Maintenance" button
3. Verify button becomes active/highlighted
4. Verify phase info text updates to: "Maintenance: Sustain strength with varied accessories"
5. Verify `localStorage.getItem('build_training_phase')` returns `'maintenance'`

**Step 2: Test tempo suggestions in Maintenance phase**

1. Navigate to a workout (e.g., UPPER_A)
2. Find an exercise ready to progress (max reps @ RIR 2-3)
3. Verify progression message shows: "💪 Maintenance: Try 3-1-2 tempo (pause at bottom)"
4. Message should NOT suggest adding weight

**Step 3: Verify weight frozen in Maintenance**

1. Complete sets with max reps @ RIR 3+
2. Check suggested weight for next session
3. Verify weight remains same (not increased)
4. Verify tempo suggestion is shown instead

**Step 4: Verify deload timing in Maintenance**

1. Run in browser console:
   ```javascript
   const storage = new StorageManager();
   const phase = new PhaseManager(storage);
   const deload = new DeloadManager(storage, phase);
   console.log(phase.getDeloadSensitivity()); // Should show 'high'
   console.log(deload.shouldTriggerDeload());
   ```
2. Verify sensitivity is 'high' (4-week base threshold)

**Step 5: Document Maintenance phase test results**

Create notes:
- ✅ Phase switch persists to localStorage
- ✅ Tempo suggestions shown instead of weight increases
- ✅ Weights frozen (no increases suggested)
- ✅ Deload sensitivity is 'high' (4 weeks)

---

## Task 10: Manual Testing - Unlock Priority

**Files:**
- Test: Manual browser testing

**Step 1: Test unlock priority in Building phase**

1. Navigate to Settings → Browse Progressions
2. Find an exercise with multiple unlock options (e.g., DB Flat Bench Press slot)
3. If Barbell Bench AND Sadharan Dand are both unlocked:
   - Verify both shown
   - Note which is listed first (should be equal priority)

**Step 2: Switch to Maintenance and test unlock priority**

1. Switch to Maintenance phase in Settings
2. Navigate to Browse Progressions
3. Find same exercise slot
4. Verify Sadharan Dand (bodyweight) is listed before Barbell Bench Press
5. Verify both are still available, just reordered

**Step 3: Test unlock notification priority**

If you meet criteria for a new unlock:
1. Building phase: Note which exercise is shown in notification
2. Maintenance phase: Verify bodyweight/traditional exercises shown first

**Step 4: Verify unlockEvaluator phase integration**

Run in browser console:
```javascript
const storage = new StorageManager();
const phase = new PhaseManager(storage);
const unlock = new UnlockEvaluator(storage, phase);

// Test priority
console.log(phase.getUnlockPriority()); // 'bodyweight_priority' in Maintenance

// Test specific unlock
const result = unlock.evaluateUnlockWithPhasePriority('Sadharan Dand', 'UPPER_A - DB Flat Bench Press');
console.log(result);
```

**Step 5: Document unlock priority test results**

Create notes:
- ✅ Building phase: all exercises equal priority
- ✅ Maintenance phase: bodyweight/traditional shown first
- ✅ Equipment progressions still available in Maintenance
- ✅ evaluateUnlockWithPhasePriority() returns priority values

---

## Task 11: Final Integration Testing

**Files:**
- Test: End-to-end manual testing

**Step 1: Test phase switching flow**

1. Start in Building phase
2. Complete a workout, progress normally
3. Switch to Maintenance phase
4. Complete same workout type
5. Verify tempo suggestions appear
6. Switch back to Building
7. Verify weight suggestions return

**Step 2: Test localStorage persistence**

1. Switch to Maintenance phase
2. Reload page (hard refresh)
3. Verify phase persists (still in Maintenance)
4. Verify progression behavior remains tempo-focused
5. Clear browser storage
6. Reload page
7. Verify defaults to Building phase

**Step 3: Test deload integration**

1. Manually set deload state to simulate 5 weeks since last deload:
   ```javascript
   const state = JSON.parse(localStorage.getItem('build_deload_state'));
   const fiveWeeksAgo = new Date();
   fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);
   state.lastDeloadDate = fiveWeeksAgo.toISOString();
   localStorage.setItem('build_deload_state', JSON.stringify(state));
   ```
2. Building phase: Verify no deload suggested (< 6 weeks)
3. Maintenance phase: Verify deload suggested (> 4 weeks)

**Step 4: Test error handling**

1. Set invalid phase in localStorage:
   ```javascript
   localStorage.setItem('build_training_phase', 'invalid');
   ```
2. Reload page
3. Verify app doesn't crash
4. Verify falls back to Building phase behavior

**Step 5: Browser console error check**

1. Open DevTools console
2. Complete full workflow (switch phases, complete workout, check unlocks)
3. Verify no JavaScript errors logged
4. Verify no 404s for phase-manager.js

**Step 6: Document final test results**

Create notes:
- ✅ Phase switching works end-to-end
- ✅ localStorage persistence verified
- ✅ Deload timing adapts to phase
- ✅ Error handling graceful (fallback to Building)
- ✅ No console errors

---

## Task 12: Final Commit and Cleanup

**Files:**
- Commit: All remaining changes

**Step 1: Review all changes**

Run: `git status`
Expected: Shows all modified files (app.js, deload.js, unlock-evaluator.js, progression.js, phase-manager.js, sw.js)

Run: `git diff --cached`
Review all staged changes

**Step 2: Create final feature commit (if any uncommitted changes)**

```bash
git add -A
git commit -m "feat: complete Build/Maintenance phase integration

- All modules integrated with PhaseManager
- Manual testing completed successfully
- Cache updated to v64
- No breaking changes to Building phase behavior"
```

**Step 3: Verify commit history**

Run: `git log --oneline -10`

Expected commits:
- Complete Build/Maintenance phase integration (if final commit needed)
- chore: update service worker cache to v64
- feat: add phase-aware progression messages
- feat: integrate PhaseManager into app initialization
- feat: add phase-aware weight progression to shouldIncreaseWeight
- feat: add phase-aware unlock prioritization to UnlockEvaluator
- feat: add phase-aware deload timing to DeloadManager
- feat: add PhaseManager coordinator module

**Step 4: Clean up browser testing state**

1. Clear any test data from localStorage
2. Reset to Building phase (default)
3. Verify app in clean state for production use

**Step 5: Mark tasks complete**

All implementation tasks complete:
- ✅ PhaseManager module created
- ✅ DeloadManager integrated
- ✅ UnlockEvaluator integrated
- ✅ Progression functions updated
- ✅ App.js wiring complete
- ✅ Tempo suggestions working
- ✅ Service worker cache updated
- ✅ Manual testing passed
- ✅ Final cleanup complete

---

## Post-Implementation Notes

### What Was Implemented:
- PhaseManager coordinator module (read-only pattern)
- Phase-aware progression (tempo vs weight suggestions)
- Phase-aware deload timing (6 weeks Building, 4 weeks Maintenance)
- Phase-aware unlock prioritization (bodyweight first in Maintenance)
- Full Building/Maintenance phase functionality

### What Was NOT Implemented:
- Recovery phase behavior (API designed, implementation deferred)
- Maintenance phase exercise rotation (separate feature)
- Goal Quiz integration (separate feature)
- Equipment filtering logic (separate feature)

### Testing Notes:
- No automated test framework (manual testing only)
- Test in both Chrome and Firefox if possible
- Test on mobile device (PWA installation)
- Verify service worker updates correctly (check Application tab)

### Known Limitations:
- Recovery phase methods exist but return placeholder values
- Tempo progression not tracked in history (suggestion only)
- Unlock priority shown in UI order, not enforced programmatically

### Future Enhancements:
- Add tempo tracking per set (optional field)
- Implement Recovery phase behavior
- Add tempo mastery achievements
- Track tempo progression history
