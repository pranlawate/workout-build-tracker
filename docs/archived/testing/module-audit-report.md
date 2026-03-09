# Module Functional Audit Report

**Date:** 2026-03-05  
**Scope:** All module files in `js/modules/`  
**Exclusions:** Issues already fixed (see user-provided list)

---

## Confirmed Bugs

### 1. **storage.js** – `getAllExerciseKeys()` returns empty in browser (CRITICAL)

**Location:** Lines 146–156  
**Issue:** Uses `Object.keys(storage)` which returns `[]` for the browser `localStorage` object. Storage keys are not enumerable; `Object.keys(localStorage)` does not return the stored keys.  
**Impact:** Exercise history is never found. Features that depend on `getAllExerciseKeys()` (volume, analytics, progression, rotation, etc.) will see no data.  
**Fix:** Iterate with `for (let i = 0; i < this.storage.length; i++) { const key = this.storage.key(i); ... }` instead of `Object.keys()`.

---

### 2. **smart-progression.js** – Wrong history index in `handlePainBasedSuggestion`

**Location:** Lines 648–651  
**Issue:** Uses `workoutHistory[0]` for the latest workout. History is oldest-first, so index 0 is the oldest workout.  
**Impact:** Pain-based suggestions use the oldest workout’s weight instead of the latest. Weight reduction and alternative suggestions can be wrong.  
**Fix:** Use `workoutHistory[workoutHistory.length - 1]` for the latest workout.

---

### 3. **smart-progression.js** – Wrong history index in `suggestTempoProgression`

**Location:** Line 576  
**Issue:** Uses `history[1]` for the “previous” workout. With oldest-first history, index 1 is the second-oldest workout ever, not the one immediately before the failed attempt.  
**Impact:** Tempo suggestions use the wrong weight. With 3+ workouts, the suggested weight can be from an old session instead of the last successful one.  
**Fix:** Use `history[history.length - 2]` for the workout before the failed attempt.

---

### 4. **unlock-evaluator.js** – Wrong mobility storage key

**Location:** Line 331 (`_getMobilityCheckHistory`)  
**Issue:** Uses `localStorage.getItem(\`build_mobility_checks_${criteriaKey}\`)`. Storage uses a single key `barbell_mobility_checks` and `storage.getMobilityChecks(criteriaKey)` to read nested data.  
**Impact:** Mobility checks are never found. Unlock evaluations that depend on mobility (e.g. Barbell Bench, Barbell Squat) will always fail the mobility requirement.  
**Fix:** Use `this.storage.getMobilityChecks(criteriaKey)` instead of direct `localStorage` access.

---

### 5. **barbell-progression-tracker.js** – Possible null/undefined access in `_calculateStrengthProgress`

**Location:** Lines 461–470  
**Issue:** No guard for `recent.sets`. If `recent.sets` is undefined or empty: `recent.sets[0]` throws, `recent.sets.every()` throws, and `recent.sets.reduce(...) / recent.sets.length` can divide by zero.  
**Impact:** Crash when an exercise has a session with no sets.  
**Fix:** Add `if (!recent?.sets || recent.sets.length === 0) return 0;` at the start of the method.

---

### 6. **body-weight.js** – Possible null access in `addEntry`

**Location:** Line 79  
**Issue:** `entry.date.split('T')[0]` – if `entry.date` is undefined, `.split` throws.  
**Impact:** Crash when adding a weight entry if any existing entry has a missing `date`.  
**Fix:** Use `entry.date?.split('T')[0]` or validate `entry.date` before use.

---

### 7. **progress-analyzer.js** – Possible NaN in `countProgressedExercises` / `getTopProgressingExercises`

**Location:** Lines 193–194, 293–294  
**Issue:** `set.weight` can be undefined. `sum + set.weight` becomes NaN, and the average becomes NaN.  
**Impact:** Progression counts and top progressors can be wrong or NaN.  
**Fix:** Use `(set.weight ?? 0)` or `(set.weight || 0)` in the reduce.

---

### 8. **rotation-manager.js** – Division by zero in `getMilestoneProgress`

**Location:** Line 185  
**Issue:** `bestSet.weight / milestone.weight` – if `milestone.weight === 0`, division by zero.  
**Impact:** `Infinity` or `NaN` when a milestone has zero weight.  
**Fix:** Add `if (!milestone.weight) return 0;` before the division.

---

## Direct localStorage Bypass (Architecture Violations)

These modules use `localStorage` directly instead of `StorageManager`, which breaks testability and consistency.

| File | Lines | Method/Usage |
|------|-------|--------------|
| **storage.js** | 502–503, 524, 538–539, 551–552, 579–580, 606–607, 619–620, 633–634 | `getEquipmentProfile`, `saveEquipmentProfile`, `getExerciseSelections`, `saveExerciseSelection`, `getUnlocks`, `saveUnlock`, `getTrainingPhase`, `saveTrainingPhase` – use `localStorage` instead of `this.storage` |
| **rotation-manager.js** | 96, 141, 150 | `getTenure`, `recordRotation` – use `localStorage.getItem/setItem` directly |
| **unlock-evaluator.js** | 331 | `_getMobilityCheckHistory` – uses `localStorage.getItem` (also wrong key) |
| **progress-analyzer.js** | 39–41, 69–71, 158–160, 218–220, 255–257 | `getWorkoutDates`, `calculateAvgSessionTime`, `countProgressedExercises`, `countUniqueExercises`, `getTopProgressingExercises` – use `localStorage.length` and `localStorage.key(i)` |
| **analytics-calculator.js** | 375 | `calculateRecoveryTrends` – uses `localStorage.getItem('build_recovery_metrics')` |
| **body-weight.js** | 16, 30, 108 | `getData`, `addEntry` – use `localStorage` directly |

**Impact:** Storage cannot be mocked in tests; tests may affect real storage. Storage abstraction is inconsistent.

---

## Potential Issues

### 1. **storage.js** – `getEquipmentProfile` return type

**Location:** Line 509  
**Issue:** `return JSON.parse(stored)` – if `stored` is malformed, `JSON.parse` throws. The try block catches it, but the default return may not include `bands` if the stored object is partial.  
**Impact:** Low; error handling exists.  
**Status:** Potential issue (defensive check for `bands` in default).

---

### 2. **unlock-evaluator.js** – `_calculateTrainingWeeks` date handling

**Location:** Line 381  
**Issue:** `new Date(history[0].date)` – if `history[0].date` is undefined, `Invalid Date` is created and `weeksTrained` can be NaN.  
**Impact:** `_calculateTrainingWeeks` could return NaN for invalid data.  
**Status:** Potential issue (add validation for `history[0].date`).

---

### 3. **progression.js** – `shouldIncreaseWeight` time-based exercises

**Location:** Line 109  
**Issue:** `sets.every(set => set.reps >= max)` – for time-based exercises, `set.reps` may hold seconds. `parseRepRange` handles `30-60s` correctly.  
**Impact:** None; logic appears correct.  
**Status:** Not a bug.

---

### 4. **progress-analyzer.js** – `getWorkoutDates` / `calculateAvgSessionTime` iteration

**Issue:** Uses `localStorage.key(i)` directly. If `StorageManager` is used elsewhere, this bypasses it.  
**Impact:** Inconsistent with `StorageManager` usage.  
**Status:** Architecture issue; not a functional bug.

---

## Files Audited Without New Issues

- **workout-manager.js** – No issues found
- **phase-manager.js** – No issues found
- **phase-manager.js** – No issues found
- **progression-pathways.js** – Static data only
- **exercise-metadata.js** – Static data only
- **form-cues.js** – Static data only
- **tempo-guidance.js** – Static data only
- **complexity-tiers.js** – Static data only
- **equipment-profiles.js** – Static data only
- **stretching-protocols.js** – Static data only
- **warm-up-protocols.js** – No issues found
- **optional-fifth-day.js** – Static data only
- **exercise-videos.js** – Static data only

---

## Summary

| Severity | Count |
|----------|-------|
| Confirmed bugs (critical) | 1 |
| Confirmed bugs (high) | 5 |
| Confirmed bugs (medium) | 2 |
| Architecture violations | 6+ |
| Potential issues | 2 |

**Priority fixes:**  
1. `storage.js` `getAllExerciseKeys` – critical  
2. `smart-progression.js` history indices  
3. `unlock-evaluator.js` mobility storage  
4. `barbell-progression-tracker.js` null checks  
5. `progress-analyzer.js` NaN handling  
6. `rotation-manager.js` division by zero  
