# js/app.js Functional Audit Report

**Date:** 2026-03-05  
**Scope:** js/app.js (~6075 lines)  
**Focus:** Event handlers, data flow, timers, navigation, workout flow, modals, localStorage consistency

---

## Confirmed Bugs

### 1. Wrong method call in showUnlockModal – crash when switching exercise

**File:** `js/app.js`  
**Lines:** 5789–5791

**Description:** After user clicks "Switch to This Exercise" in the unlock modal, the code calls `this.renderExerciseList()` which:
- Does not exist as a no-arg method (the actual `renderExerciseList(workout)` expects a workout object and renders the progress dashboard exercise list)
- Should call `this.renderExercises()` to refresh the workout screen with the new exercise

**Impact:** TypeError at runtime when user unlocks an exercise and chooses to switch. Workout screen is not refreshed with the new exercise.

**Fix:**
```javascript
this.renderExercises();  // not renderExerciseList()
```

---

### 2. phaseInfo used without null check – crash in settings modal

**File:** `js/app.js`  
**Lines:** 433–457

**Description:** The training phase toggle uses `phaseInfo` (from `document.getElementById('phase-info-text')`) without checking for null. The guard only checks `buildingBtn && maintenanceBtn`.

**Impact:** If `phase-info-text` is missing from the DOM (e.g. removed from HTML or inside a modal that's not rendered), `phaseInfo.textContent = ...` throws at lines 440, 447, or 455.

**Fix:** Add guard: `if (phaseInfo) phaseInfo.textContent = ...` or include phaseInfo in the outer condition.

---

### 3. initializeNumberOverlay – crash if overlay elements are missing

**File:** `js/app.js`  
**Lines:** 2639–2729

**Description:** `overlay`, `closeBtn`, `numPad`, and `confirmBtn` are used without null checks. If any is missing from the DOM (e.g. overlay not in HTML), `addEventListener` or `overlay.classList` will throw.

**Impact:** App crash on load if any number overlay element is missing. Also, `document.getElementById('overlay-value')`, `overlay-title`, `overlay-unit` are used without guards (lines 2683, 2715, 2719, 2723).

**Fix:** Add early return if any required element is null: `if (!overlay || !closeBtn || !numPad || !confirmBtn) return;`

---

### 4. setupSummaryPainTracking – crash if pain summary elements are missing

**File:** `js/app.js`  
**Lines:** 4902–4998

**Description:** `painNoBtn`, `painYesBtn`, `initialChoice`, `exerciseSelection`, `painDetails` are used without null checks. If any is missing from the summary screen, `style.display` or `classList` access throws.

**Impact:** Crash when completing a workout and reaching the summary screen if any pain-tracking element is missing.

**Fix:** Add early return if any required element is null: `if (!painNoBtn || !painYesBtn || !initialChoice || !exerciseSelection || !painDetails) return;`

---

### 5. showSummaryPainDetails – crash if pain detail elements are missing

**File:** `js/app.js`  
**Lines:** 5012, 5024–5025

**Description:** `document.getElementById('pain-details-summary')`, `pain-current-exercise`, `pain-exercise-progress` are used without null checks.

**Impact:** Crash when completing pain details for multiple exercises if any element is missing.

**Fix:** Add null guards before accessing these elements.

---

### 6. handleSetInput – workoutSession can be null

**File:** `js/app.js`  
**Lines:** 1529–1546

**Description:** `handleSetInput` uses `this.workoutSession.exercises[exerciseIndex]` without checking if `workoutSession` exists. If the user navigates away (e.g. back button) while a change event is still pending, `workoutSession` may be null.

**Impact:** Possible TypeError in edge cases (race between navigation and input change).

**Fix:** Add guard at start: `if (!this.workoutSession || !this.currentWorkout) return;`

---

### 7. recovery metrics localStorage – bypasses StorageManager

**File:** `js/app.js`  
**Lines:** 5250, 5262, 5337, 5497, 5511, 5530, 5552, 5637

**Description:** Recovery metrics are read/written directly from/to `localStorage` (`build_recovery_metrics`) instead of going through `StorageManager`. Other app data (rotation, exercise history, etc.) uses StorageManager.

**Impact:** Inconsistent data layer; potential format drift if StorageManager changes; harder to add migration, validation, or export/import for recovery data.

**Fix:** Add `getRecoveryMetrics()` and `saveRecoveryMetrics()` to StorageManager and use them from app.js.

---

## Potential Issues

### 8. Timer not stopped when workout completes

**File:** `js/app.js`  
**Lines:** 1009, 1019–1024, 5563–5654

**Description:** The workout timer (`timerInterval`) is only cleared in `showHomeScreen()`. It keeps running during `completeWorkout` → cooldown modal → summary screen until the user clicks Done.

**Impact:** Timer continues during cooldown and summary. Likely intentional for total workout time, but could be confusing if duration is meant to end at workout completion.

**Recommendation:** Consider stopping the timer when `completeWorkout` is called or when the cooldown modal is shown, if the design intent is to exclude cooldown time.

---

### 9. showRecoveryWarning – NaN when rotation.lastDate is null

**File:** `js/app.js`  
**Lines:** 371–376

**Description:** `const lastDate = new Date(rotation.lastDate)` is used when `rotation.lastDate` can be null. If null, `lastDate` is Invalid Date and `hoursAgo` becomes NaN.

**Impact:** Recovery modal displays "Last workout: NaN hours ago" when there is no previous workout.

**Fix:** Add guard: `if (!rotation.lastDate) { /* show "First workout" or similar */ }` before computing hoursAgo.

---

### 10. document.addEventListener('change') in setupBandColorButtons – never removed

**File:** `js/app.js`  
**Lines:** 2180–2195

**Description:** A global `document` change listener is added on init and never removed. Same for `document.addEventListener('click', ...)` in the number overlay (line 2700).

**Impact:** Minor for a long-lived SPA. Could cause memory growth if the app is torn down and recreated, but that is unlikely for this app.

**Recommendation:** Consider using event delegation on a stable container instead of `document` if the app ever supports dynamic remounting.

---

### 11. showDeloadBanner – end-deload-btn without null check

**File:** `js/app.js`  
**Lines:** 1873–1874

**Description:** `document.getElementById('end-deload-btn').onclick = ...` is set without checking if the element exists.

**Impact:** If the deload banner or button is missing, assignment throws.

**Fix:** Add null check: `const endBtn = document.getElementById('end-deload-btn'); if (endBtn) endBtn.onclick = ...`

---

### 12. showUnlockModal – modal elements without null check

**File:** `js/app.js`  
**Lines:** 5732–5736, 5746, 5775, 5796

**Description:** `modal`, `exerciseNameEl`, `criteriaList`, `tryBtn`, `laterBtn` are used without null checks. If any is missing, the modal would throw when opening.

**Impact:** Crash when an unlock notification is shown and required elements are missing.

**Fix:** Add null guards before using these elements.

---

### 13. item.querySelector('input') in pain checkbox – possible null

**File:** `js/app.js`  
**Lines:** 4262, 4970

**Description:** `item.querySelector('input').checked` - if the structure is wrong and no input exists, `querySelector` returns null and `.checked` throws.

**Impact:** Unlikely given the HTML structure, but possible if the DOM structure changes.

**Fix:** Use optional chaining: `item.querySelector('input')?.checked`

---

### 14. navigateToScreen('workout') – no-op

**File:** `js/app.js`  
**Lines:** 224–226

**Description:** When `popstate` fires with `screen: 'workout'`, the handler does nothing (break). The comment says "Workout screen is already visible, modal already closed above."

**Impact:** If the user navigates back to 'workout' from a modal, the workout screen stays. This is correct behavior when the workout screen is behind modal overlays. No bug identified.

---

## Summary

| Category | Count |
|----------|-------|
| Confirmed bugs | 7 |
| Potential issues | 7 |

**Recommendation:** Fix confirmed bugs 1–7 first; they can cause crashes or data inconsistencies. Address potential issues 8–14 as part of hardening and robustness improvements.
