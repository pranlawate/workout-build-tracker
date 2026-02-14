# Phase Integration - Comprehensive Test Plan

**Test Date:** 2026-02-14
**Feature:** Build/Maintenance Phase Integration
**Tester:** Automated comprehensive test coverage

## Test Coverage

This document verifies ALL phase integration features work correctly end-to-end:

1. ✅ Phase Toggle Persistence
2. ✅ Deload Timing Calculations
3. ✅ Progression Messages (Weight vs Tempo)
4. ✅ Unlock Priority UI (Sorting and Badges)
5. ✅ Edge Cases and Error Handling

---

## 1. Phase Toggle Persistence Tests

### Test 1.1: Switch to Maintenance Phase
**Steps:**
1. Open app home screen
2. Click "⚙️ Settings"
3. Toggle "Training Phase" to Maintenance
4. Verify toggle shows "Maintenance"
5. Reload page (hard refresh)
6. Open settings again

**Expected:**
- Toggle remains on "Maintenance" after reload
- localStorage `build_training_phase` = "maintenance"

**Status:** 🔲 Not tested

---

### Test 1.2: Switch Back to Building Phase
**Steps:**
1. From Maintenance phase (Test 1.1)
2. Toggle back to "Building"
3. Verify toggle shows "Building"
4. Reload page
5. Open settings again

**Expected:**
- Toggle remains on "Building" after reload
- localStorage `build_training_phase` = "building"

**Status:** 🔲 Not tested

---

## 2. Deload Timing Tests

### Test 2.1: Building Phase Deload Timing (6 weeks)
**Steps:**
1. Set phase to "Building"
2. Open any workout (e.g., "UPPER A")
3. Look for deload recommendation in UI
4. Check console: `deloadManager.getDeloadRecommendation()`

**Expected:**
- Deload triggers at 6+ weeks since last deload
- UI shows deload badge if 6+ weeks
- Console output shows `weeksUntilDeload` calculation based on 6-week threshold

**Status:** 🔲 Not tested

---

### Test 2.2: Maintenance Phase Deload Timing (4 weeks)
**Steps:**
1. Set phase to "Maintenance"
2. Open any workout (e.g., "UPPER A")
3. Look for deload recommendation in UI
4. Check console: `deloadManager.getDeloadRecommendation()`

**Expected:**
- Deload triggers at 4+ weeks since last deload
- UI shows deload badge if 4+ weeks
- Console output shows `weeksUntilDeload` calculation based on 4-week threshold

**Status:** 🔲 Not tested

---

## 3. Progression Messages Tests

### Test 3.1: Building Phase - Weight Increase Messages
**Steps:**
1. Set phase to "Building"
2. Complete a set for any exercise (e.g., DB Flat Bench Press)
3. Look for progression message after logging the set
4. Check for "increase weight" messaging

**Expected:**
- Messages encourage weight progression
- Example: "Great work! Consider increasing weight next session."
- NO tempo-related messages shown

**Status:** 🔲 Not tested

---

### Test 3.2: Maintenance Phase - Tempo Focus Messages
**Steps:**
1. Set phase to "Maintenance"
2. Complete a set for any exercise
3. Look for progression message after logging the set
4. Check for "tempo" or "control" messaging

**Expected:**
- Messages focus on tempo and form
- Example: "Excellent! Focus on maintaining tempo and form."
- NO weight increase suggestions shown

**Status:** 🔲 Not tested

---

## 4. Unlock Priority UI Tests (CRITICAL - Recently Fixed)

### Test 4.1: Building Phase - All Exercises Equal Priority
**Steps:**
1. Set phase to "Building"
2. Open "Browse Progressions" from any slot
3. Open "Progression" tab
4. Look at exercise ordering in categories
5. Check for "★ Recommended" badges

**Expected:**
- All unlocked exercises shown in original order (no priority sorting)
- NO "★ Recommended" badges visible
- Bodyweight and equipment exercises mixed together

**Status:** 🔲 Not tested

---

### Test 4.2: Maintenance Phase - Bodyweight Exercises First
**Steps:**
1. Set phase to "Maintenance"
2. Open "Browse Progressions" for a slot with both bodyweight and equipment options
   - Example: Upper Push slot (has both Sadharan Dand and Barbell Bench Press)
3. Open "Progression" tab
4. Examine exercise ordering in each category
5. Look for "★ Recommended" badges

**Expected:**
- Bodyweight/traditional exercises (Sadharan Dand, Baithak) appear FIRST
- Equipment exercises (Barbell Bench, DB Bench) appear AFTER bodyweight
- Bodyweight exercises show "★ Recommended" badge
- Equipment exercises have NO badge

**Visual Example:**
```
Bodyweight Category:
  ✓ Sadharan Dand ★ Recommended
  ✓ Rammurti Dand ★ Recommended

Equipment Category:
  ✓ DB Flat Bench Press
  ✓ Barbell Bench Press
```

**Status:** 🔲 Not tested

---

### Test 4.3: Locked Exercises Appear After Unlocked
**Steps:**
1. Set phase to "Maintenance"
2. Open "Browse Progressions" for a slot with locked progressions
3. Verify sorting respects unlock status first, priority second

**Expected:**
- All unlocked exercises appear first (sorted by priority: bodyweight → equipment)
- All locked exercises appear after (regardless of type)
- Locked exercises show lock icon and no "Select" button

**Status:** 🔲 Not tested

---

## 5. Edge Cases and Error Handling Tests

### Test 5.1: Invalid Phase Value
**Steps:**
1. Open browser console
2. Run: `localStorage.setItem('build_training_phase', 'invalid_phase')`
3. Reload page
4. Open settings

**Expected:**
- Phase defaults to "Building"
- No JavaScript errors in console
- Settings toggle shows "Building"

**Status:** 🔲 Not tested

---

### Test 5.2: Null/Undefined Phase
**Steps:**
1. Open browser console
2. Run: `localStorage.removeItem('build_training_phase')`
3. Reload page
4. Open settings

**Expected:**
- Phase defaults to "Building"
- No JavaScript errors
- Settings toggle shows "Building"

**Status:** 🔲 Not tested

---

### Test 5.3: Phase Switch During Browse Progressions
**Steps:**
1. Set phase to "Building"
2. Open "Browse Progressions" modal
3. Keep modal open
4. In console: `localStorage.setItem('build_training_phase', 'maintenance')`
5. Close modal, reopen "Browse Progressions"

**Expected:**
- Exercise sorting updates to reflect new phase
- "★ Recommended" badges appear (if Maintenance)
- No UI glitches or duplicate elements

**Status:** 🔲 Not tested

---

### Test 5.4: Empty Exercise List
**Steps:**
1. Open "Browse Progressions" for a slot with no progressions
2. Verify no JavaScript errors

**Expected:**
- Empty state message shown
- No console errors
- PhaseManager methods handle empty arrays gracefully

**Status:** 🔲 Not tested

---

### Test 5.5: No Current Exercise Selected
**Steps:**
1. Reset exercise selections: `localStorage.setItem('build_exercise_selections', '{}')`
2. Reload page
3. Open "Browse Progressions" from any slot
4. Verify unlock evaluation still works

**Expected:**
- Browse Progressions modal opens without errors
- Phase priority logic uses fallback for prerequisite exercise
- No console errors

**Status:** 🔲 Not tested

---

## Test Execution Commands

### Phase Manager Console Tests
```javascript
// Test phase retrieval
window.app.phaseManager.getPhase();

// Test progression behavior
window.app.phaseManager.getProgressionBehavior();

// Test deload sensitivity
window.app.phaseManager.getDeloadSensitivity();

// Test unlock priority
window.app.phaseManager.getUnlockPriority();
```

### Unlock Evaluator Console Tests
```javascript
// Test phase-aware unlock evaluation
const result = window.app.unlockEvaluator.evaluateUnlockWithPhasePriority(
  'Sadharan Dand',  // target exercise
  'DB Flat Bench Press'  // current exercise
);
console.log('Priority:', result.priority);
console.log('Phase Recommended:', result.phaseRecommended);
```

### Storage Manager Console Tests
```javascript
// Get current phase
localStorage.getItem('build_training_phase');

// Get exercise selections
JSON.parse(localStorage.getItem('build_exercise_selections'));

// Get unlocked exercises
JSON.parse(localStorage.getItem('build_unlocked_exercises'));
```

---

## Test Results Summary

**Total Tests:** 15
**Passed:** 0
**Failed:** 0
**Not Tested:** 15

## Critical Areas (Must Pass)

1. **Unlock Priority UI** (Tests 4.1, 4.2, 4.3) - Recently fixed, must verify sorting and badges work correctly
2. **Deload Timing** (Tests 2.1, 2.2) - Core phase integration feature
3. **Phase Persistence** (Tests 1.1, 1.2) - Foundation for all other features

---

## Next Steps After Testing

1. Document all failures with screenshots and console output
2. Create fix commits for any failing tests
3. Re-run failed tests to verify fixes
4. Update service worker version if code changes made
5. Push all fixes to remote
