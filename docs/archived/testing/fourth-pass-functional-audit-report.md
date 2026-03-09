# Fourth-Pass Functional Audit Report

**Date:** 2026-03-05  
**Scope:** js/modules/, js/screens/, js/modals/, js/components/, js/utils/  
**Focus:** NEW bugs only (excluding 30 previously fixed issues)

---

## Confirmed Bugs

### 1. Analytics Calculator — RIR trend date format mismatch

**File:** `js/modules/analytics-calculator.js`  
**Lines:** 288, 455  

**Description:** `getCompletedWorkoutDates()` returns date strings in `YYYY-MM-DD` format (from `entry.date.split('T')[0]`), but exercise history entries store `entry.date` as full ISO strings (e.g. `2025-03-05T14:30:00.000Z`). Two places compare these directly:

- **Line 288** (`calculateRIRTrend`): `history.find(e => e && e.date === date)` — `date` is YYYY-MM-DD, `e.date` is full ISO, so the match always fails.
- **Line 455** (`didProgressOnDate`): `history.findIndex(e => e.date === date)` — same mismatch.

**Impact:** RIR trend always shows 0 for all dates; sleep–progression pattern detection never finds progressed workouts, so pattern detection is incorrect.

**Fix:** Normalize dates before comparison, e.g.:
```javascript
// Line 288
const entry = history.find(e => e && e.date && e.date.split('T')[0] === date);

// Line 455
const entryIndex = history.findIndex(e => e.date && e.date.split('T')[0] === date);
```

---

### 2. Exercise Detail — formatSets crash on missing sets

**File:** `js/screens/exercise-detail.js`  
**Lines:** 93, 116–118  

**Description:** `formatSets(entry.sets)` is called without checking `entry.sets`. If an entry has no `sets` or it is undefined (e.g. malformed localStorage), `sets.every()` and `sets.map()` throw.

**Impact:** Exercise detail screen crashes when rendering history entries with missing or malformed `sets`.

**Fix:** Add a guard at the start of `formatSets`:
```javascript
formatSets(sets) {
  if (!sets || !Array.isArray(sets) || sets.length === 0) return '—';
  // ... rest
}
```

---

### 3. Exercise Detail — getSessionBadges crash when entry.sets is undefined

**File:** `js/screens/exercise-detail.js`  
**Line:** 272  

**Description:** `this.performanceAnalyzer.analyzeExercisePerformance(exerciseKey, entry.sets)` passes `entry.sets` directly. If `entry.sets` is undefined, `PerformanceAnalyzer.detectIntraSetVariance` does `currentSets.length`, which throws.

**Impact:** Badge calculation crashes for entries without `sets`, taking down the exercise detail screen.

**Fix:** Pass a safe default:
```javascript
const perf = this.performanceAnalyzer.analyzeExercisePerformance(exerciseKey, entry.sets || []);
```

---

### 4. Edit Entry Modal — crash on missing sets

**File:** `js/modals/edit-entry-modal.js`  
**Lines:** 46, 129  

**Description:** `renderModal` uses `entry.sets.map()` and `save` uses `entry.sets.length` without checking that `entry.sets` exists.

**Impact:** Edit modal crashes when opening or saving an entry with missing `sets`.

**Fix:** Add guards:
- In `show()` before `renderModal`: `if (!entry.sets || !Array.isArray(entry.sets)) { console.error('Entry has no sets'); return; }`
- In `save()`: `if (!entry.sets || !Array.isArray(entry.sets)) { alert('Cannot save: entry has no sets'); return; }`

---

### 5. Achievements — getBestSet can return set with undefined weight

**File:** `js/modules/achievements.js`  
**Lines:** 178–190  

**Description:** `getBestSet` does not validate `set.weight`. If the first set has `weight: undefined`, `!best` is true and that set is returned. Later, `latestBest.weight > previousBest.weight` yields false when either weight is undefined, so PR detection can be wrong or miss valid PRs.

**Impact:** PR detection can be incorrect when sets have undefined or invalid weight.

**Fix:** Skip sets with invalid weight in the reduce:
```javascript
if (!set) return best;
if (typeof set.weight !== 'number' || !Number.isFinite(set.weight)) return best;
if (!best) return set;
// ... comparison
```

---

### 6. History List — malformed exercise key yields undefined exercise name

**File:** `js/screens/history-list.js`  
**Lines:** 33–34  

**Description:** `const [workoutName, exerciseName] = exerciseKey.split(' - ')` assumes the key contains ` - `. If it does not (e.g. legacy or malformed key), `exerciseName` is undefined and the card shows "undefined".

**Impact:** History list shows "undefined" for exercises whose keys lack the expected format.

**Fix:** Provide a fallback:
```javascript
const parts = exerciseKey.split(' - ');
const workoutName = parts[0] || '';
const exerciseName = parts.slice(1).join(' - ') || exerciseKey;
```

---

## Summary

| # | File | Lines | Severity | Issue |
|---|------|-------|----------|-------|
| 1 | analytics-calculator.js | 288, 455 | High | Date format mismatch breaks RIR trend and progression detection |
| 2 | exercise-detail.js | 93, 116–118 | High | formatSets crashes on missing sets |
| 3 | exercise-detail.js | 272 | High | getSessionBadges crashes when entry.sets is undefined |
| 4 | edit-entry-modal.js | 46, 129 | High | Edit modal crashes on missing sets |
| 5 | achievements.js | 178–190 | Medium | getBestSet can return set with undefined weight |
| 6 | history-list.js | 33–34 | Low | Malformed key shows "undefined" as exercise name |

**Total:** 6 confirmed bugs (4 high, 1 medium, 1 low)
