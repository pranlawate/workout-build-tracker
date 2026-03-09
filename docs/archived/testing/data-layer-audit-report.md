# Core Data Layer Functional Audit Report

**Date:** March 5, 2026  
**Scope:** storage.js, body-weight.js, export-import.js, workout-manager.js, workouts.js

---

## Confirmed Bugs

### 1. js/utils/export-import.js — Lines 85–86

**Bug:** Import validation rejects valid bodyweight exercise data.

**Description:** `validateImportData()` requires `set.weight > 0` for every set. Exercises like Plank, 45° Hyperextension, Side Plank, and Dead Bug use `weight: 0`. Backups containing these exercises fail validation and cannot be imported.

**Impact:** Users cannot restore backups that include bodyweight exercises. Data loss risk if they rely on import for recovery.

**Fix:** Change validation to allow `weight >= 0`:
```javascript
if (typeof set.weight !== 'number' || set.weight < 0) {
  throw new Error(`Invalid set in ${key}: weight must be a non-negative number (set ${i + 1})`);
}
```

---

### 2. js/modules/storage.js — Lines 504, 528, 580, 613, 631

**Bug:** Several methods bypass injected storage and use `localStorage` directly.

**Description:** `getEquipmentProfile()`, `saveEquipmentProfile()`, `getExerciseSelections()`, `saveExerciseSelection()`, `getUnlocks()`, `saveUnlock()`, `getTrainingPhase()`, and `saveTrainingPhase()` call `localStorage.getItem()` / `localStorage.setItem()` instead of `this.storage.getItem()` / `this.storage.setItem()`.

**Impact:** With a mock storage for tests, these methods still hit real `localStorage`, causing test pollution and unreliable tests. Production behavior is unchanged.

**Fix:** Replace `localStorage` with `this.storage` in these methods.

---

### 3. js/modules/storage.js — Lines 390–407

**Bug:** `getWorkoutHistory()` does not guard against malformed history entries.

**Description:** For each `entry`, the code uses `entry.date` and `entry.sets` without checks. If `entry.date` is missing or invalid, `new Date(entry.date).toISOString()` can be `"Invalid Date"`. If `entry.sets` is undefined, downstream code that iterates over sets can throw.

**Impact:** Corrupt or legacy history can crash `getWorkoutHistory()` or produce invalid session objects.

**Fix:** Add guards before processing each entry:
```javascript
history.forEach(entry => {
  if (!entry || !entry.date || !Array.isArray(entry.sets)) return;
  // ... rest of logic
});
```

---

### 4. js/modules/body-weight.js — Lines 24–27, 78

**Bug:** Migration and `addEntry` can throw on malformed entries.

**Description:**
- In `getData()` migration (lines 24–27): `e.date.includes('T')` throws if `e.date` is undefined.
- In `addEntry()` (line 78): `entry.date.split('T')[0]` throws if `entry.date` is undefined.

**Impact:** Malformed or legacy body weight data can crash the module and block weigh-in flows.

**Fix:** Add null checks:
```javascript
// Migration: e?.date with fallback
date: (e?.date && typeof e.date === 'string') 
  ? (e.date.includes('T') ? e.date : new Date(e.date).toISOString()) 
  : new Date().toISOString(),

// addEntry: guard before split
if (!entry.date || typeof entry.date !== 'string') continue;
const entryDateString = entry.date.split('T')[0];
```

---

### 5. js/modules/workout-manager.js — Lines 73–79

**Bug:** `checkMuscleRecovery()` can throw when rotation data is invalid.

**Description:** If `rotation.lastWorkout` or `proposedWorkout` is not in `MUSCLE_GROUPS` (e.g. corrupted data or typo), `lastMuscles` or `proposedMuscles` is undefined. The loop `for (const muscle of proposedMuscles)` and `lastMuscles.includes(muscle)` then throw.

**Impact:** Invalid rotation state can crash recovery checks and any UI that calls this method.

**Fix:** Add guards:
```javascript
const lastMuscles = MUSCLE_GROUPS[rotation.lastWorkout];
const proposedMuscles = MUSCLE_GROUPS[proposedWorkout];
if (!lastMuscles || !proposedMuscles) {
  return { warn: false, muscles: [] };
}
```

---

### 6. js/utils/export-import.js — Lines 21–22

**Bug:** Export uses `Object.keys(localStorage)` instead of `storage.getAllExerciseKeys()`.

**Description:** `exportWorkoutData()` uses `Object.keys(localStorage)` to find exercise history keys instead of `storage.getAllExerciseKeys()`.

**Impact:** With a mock storage, export still reads from real `localStorage`, so tests may export unexpected data. Production behavior is usually correct.

**Fix:** Use `storage.getAllExerciseKeys()` and build full keys with the prefix, or add a `getAllExerciseKeys()`-style method and use it for export.

---

## Potential Issues

### 7. js/modules/storage.js — Lines 254–255, 327–328

**Potential issue:** `saveMobilityCheck()` and `savePainReport()` swallow storage errors.

**Description:** On `QuotaExceededError` or other storage errors, these methods only log to console and do not rethrow. Callers cannot detect failure.

**Impact:** User actions may appear to succeed while data is not saved. Low risk if storage quota is rarely exceeded.

---

### 8. js/modules/storage.js — Line 349

**Potential issue:** `setExerciseAlternate()` overwrites `dateChanged` from `alternateInfo`.

**Description:** The code always sets `dateChanged: new Date().toISOString()`, ignoring any value in `alternateInfo`. This is likely intentional (always use current time), but import/restore flows might expect to preserve dates.

**Impact:** Low; only relevant if alternate info is imported with specific dates.

---

### 9. js/modules/body-weight.js — Line 79

**Potential issue:** Date format assumption for “today” check.

**Description:** `entry.date.split('T')[0]` assumes `entry.date` is ISO-like (contains `T` or at least a date part). Legacy formats (e.g. `"2025-03-05"`) still work; `split('T')[0]` returns the full string. Only undefined/null would cause a crash (covered in Bug #4).

**Impact:** Low; mainly a format assumption to document.

---

## Cross-Cutting Data Integrity Issue (Outside Audit Scope)

### js/screens/exercise-detail.js + js/modals/edit-entry-modal.js

**Bug:** Edit and delete operate on the wrong history entry due to index confusion.

**Description:** The history list shows entries in reverse order (newest first). Each entry’s `data-index` is set to `originalIndex` (the real array index). When edit/delete is clicked, this `originalIndex` is passed to the modal and `handleDelete`. Both then compute `reversedIndex = history.length - 1 - index`, which assumes a display index. Passing `originalIndex` causes a double-reverse: for the most recent entry, the code ends up modifying the oldest entry instead.

**Impact:** Users can edit or delete the wrong workout entry, leading to data loss or incorrect history.

**Fix:** Either pass display index and keep the `reversedIndex` logic, or pass `originalIndex` and use `entry = history[index]` directly (no reversal).

---

## Files With No Issues Found

### js/modules/workouts.js

- Static workout definitions; no runtime data handling.
- `getWorkoutWithSelections()` safely handles missing `baseWorkout` or `storage`.
- No data corruption or crash risks identified.

---

## Summary

| Severity | Count |
|----------|-------|
| Confirmed bugs | 6 |
| Potential issues | 3 |

**Priority fixes:**
1. **High:** Export-import bodyweight validation (Bug #1) — blocks valid backups.
2. **High:** `getWorkoutHistory` malformed entry handling (Bug #3) — crash risk.
3. **High:** `checkMuscleRecovery` undefined muscles (Bug #5) — crash risk.
4. **Medium:** Body weight malformed data handling (Bug #4) — crash risk.
5. **Medium:** Storage bypass in StorageManager (Bug #2) — test reliability.
6. **Low:** Export using `Object.keys(localStorage)` (Bug #6) — test consistency.
