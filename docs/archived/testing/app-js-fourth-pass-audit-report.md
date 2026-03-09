# Fourth-Pass Functional Audit Report: js/app.js

**Date:** 2026-03-05  
**Scope:** New bugs only (excluding 30 previously fixed issues)  
**Focus areas:** Set logging, recovery, warm-up, summary, progress dashboard, settings, fifth day, video modal, achievements, fatigue

---

## Confirmed Bugs

### 1. Analytics tab never unlocks — wrong workout count

**Location:** `js/app.js` line 3940

**Code:**
```javascript
const workoutCount = rotation?.sequence?.filter(w => w.completed).length || 0;
```

**Problem:** `rotation.sequence` stores workout name strings (e.g. `'UPPER_A'`, `'LOWER_B'`), not objects. `w.completed` is always `undefined` for a string, so the filter always returns `[]` and `workoutCount` is always `0`.

**Impact:** User sees "Complete 4+ workouts to unlock analytics" forever. Analytics tab content never renders.

**Fix:** Use `rotation.sequence.length` (or `rotation?.sequence?.length ?? 0`) since all entries in `sequence` are completed workouts.

---

### 2. Pain summary: incomplete flow saves “no pain” for all exercises

**Location:** `js/app.js` lines 4945–4956 in `saveSummaryPainData`

**Problem:** If the user selects "Yes, I had pain", selects exercises, but doesn’t click "Next" (doesn’t set severity/location), then clicks "Done", `summaryPainfulExercises` stays empty. The code only returns `false` when `checkboxes.length === 0`. If the user selects exercises but skips "Next", the flow falls through and saves "no pain" for every exercise.

**Impact:** Pain data is lost for users who select exercises but don’t finish the pain details flow.

**Fix:** Add a check when `summaryPainfulExercises` is empty but `checkboxes.length > 0`:

```javascript
if (!this.summaryPainfulExercises || this.summaryPainfulExercises.length === 0) {
  const checkboxes = document.querySelectorAll('#pain-exercise-list-summary input[type="checkbox"]:checked');
  if (checkboxes.length === 0) {
    alert('Please select exercises with pain, or click "No Pain"');
    return false;
  }
  // User selected exercises but didn't complete pain details
  alert('Please complete pain details for all selected exercises (click Next and fill severity/location).');
  return false;
}
```

---

### 3. Fifth day fatigue warning never shows warning level

**Location:** `js/modules/optional-fifth-day.js` lines 105–121 in `getFatigueWarning`

**Code:**
```javascript
const hoursUntilNext = 48; // Simplified - would calculate from last workout date
if (hoursUntilNext < 48) {
  return { level: 'warning', ... };
}
return { level: 'info', ... };
```

**Problem:** `hoursUntilNext` is hardcoded to `48`, so `hoursUntilNext < 48` is always false. The warning branch is never taken.

**Impact:** Fifth day fatigue warning always shows "info" instead of "warning" when it should be more cautionary.

**Fix:** Compute `hoursUntilNext` from the last workout date. If that’s not feasible, use a different threshold (e.g. `<= 48`) or a different flag.

---

## Summary

| # | Bug | Location | Severity |
|---|-----|----------|----------|
| 1 | Analytics tab never unlocks | app.js:3940 | High |
| 2 | Pain summary incomplete flow saves wrong data | app.js:4945–4956 | High |
| 3 | Fifth day fatigue warning never shows warning | optional-fifth-day.js:105–121 | Medium |

---

## Areas checked (no new bugs found)

- **handleLogSet / handleSetInput:** Weight, reps, RIR flow for band/bodyweight/time-based exercises correct.
- **Recovery:** `showRecoveryWarning` only called when `checkMuscleRecovery` returns `warn`; `lastDate` is always set in that case.
- **Warm-up modal:** `showWarmupModal` checkoff logic correct; listeners are on new DOM elements.
- **Workout summary:** Stats, volume comparison, records, achievements render correctly.
- **Progress dashboard:** `setupProgressTabs` and overview tab structure correct.
- **Settings export/import:** Flow correct; `history.back()` + `showHomeScreen()` behaves as intended.
- **Fifth day:** Block rendering and completion logic correct.
- **Video modal:** `initializeVideoModal`, `openVideoModal`, `closeVideoModal` behave correctly.
- **Achievement detection:** `detectAchievements` used correctly in summary.
- **Fatigue:** `calculateFatigueScore` and banner flow correct.
