# Build/Maintenance Phase Integration - Testing Guide

**Feature Status:** Implemented (2026-02-14)
**Version:** 1.0
**Cache Version:** v64

## Overview

The Build/Maintenance Phase Integration makes the existing phase toggles functional by implementing phase-aware behavior across progression, deload, and unlock systems. This testing guide walks you through verifying all implemented features.

**What's New:**
- **Phase-aware progression messages** - Building shows weight increases, Maintenance shows tempo suggestions
- **Dynamic deload timing** - 6 weeks (Building), 4 weeks (Maintenance)
- **Unlock prioritization** - Maintenance prioritizes bodyweight/traditional exercises
- **PhaseManager module** - Centralized coordinator for all phase-specific behavior

## Test Environment Setup

### Prerequisites

1. **Clear browser cache** to ensure service worker updates:
   - Chrome: DevTools → Application → Storage → Clear site data
   - Firefox: Settings → Privacy → Clear Data
   - Safari: Develop → Empty Caches

2. **Hard refresh** the app:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. **Verify cache version**:
   - Open DevTools → Console
   - Run: `caches.keys()`
   - Should show: `["build-tracker-v64"]`

4. **Check for errors**:
   - Open DevTools → Console
   - Should show NO red errors on load
   - Look for service worker registration message

---

## Test Suite 1: Building Phase Behavior (Default)

**Goal:** Verify Building phase works identically to previous version (no breaking changes)

### Test 1.1: Default Phase is Building

**Steps:**
1. Navigate to **⚙️ Settings**
2. Look at the "Training Phase" section

**Expected:**
- ✅ "Building" button is active/highlighted
- ✅ Phase info text shows: *"Building: Focus on progressive overload and strength gains"*
- ✅ localStorage check: Run `localStorage.getItem('build_training_phase')` in console → should return `"building"` or `null` (defaults to building)

**Result:** ⬜ Pass ⬜ Fail

---

### Test 1.2: Weight Progression Suggestions (Building Phase)

**Steps:**
1. Ensure you're in **Building** phase (Settings → Training Phase → Building)
2. Navigate to a workout (e.g., UPPER_A)
3. Find an exercise you can progress on (e.g., DB Flat Bench Press)
4. Complete sets with **max reps @ RIR 2-3**
   - Example: If rep range is 8-12, log all sets with 12 reps @ RIR 2-3

**Expected:**
- ✅ Progression message shows: **"🎯 Ready to progress! Add [X]kg next session"**
- ✅ Message suggests specific weight increment (e.g., "Add 1.25kg")
- ❌ Should NOT mention "tempo" or "Maintenance"

**Result:** ⬜ Pass ⬜ Fail

**Notes:** _________________________________

---

### Test 1.3: Deload Timing (Building Phase - 6 Weeks)

**Steps:**
1. Ensure you're in **Building** phase
2. Open DevTools → Console
3. Run this code to check deload sensitivity:
```javascript
const storage = new (await import('./js/modules/storage.js')).StorageManager();
const phaseManager = new (await import('./js/modules/phase-manager.js')).PhaseManager(storage);
const deload = new (await import('./js/modules/deload.js')).DeloadManager(storage, phaseManager);
console.log('Phase:', phaseManager.getPhase());
console.log('Deload Sensitivity:', phaseManager.getDeloadSensitivity());
console.log('Should trigger?:', deload.shouldTriggerDeload());
```

**Expected:**
- ✅ Phase: `"building"`
- ✅ Deload Sensitivity: `"normal"`
- ✅ Base threshold: 6 weeks (check in code or behavior)

**Result:** ⬜ Pass ⬜ Fail

---

### Test 1.4: Unlock Priority (Building Phase - All Equal)

**Steps:**
1. Navigate to **Settings → Browse Progressions**
2. Look at exercise progressions

**Expected:**
- ✅ All exercise types shown without prioritization
- ✅ Equipment progressions (Barbell Bench, Barbell Squat) are visible
- ✅ Bodyweight progressions (Sadharan Dand, Sadharan Baithak) are visible
- ✅ No specific ordering based on exercise type

**Result:** ⬜ Pass ⬜ Fail

---

## Test Suite 2: Maintenance Phase Behavior (New)

**Goal:** Verify Maintenance phase shows tempo suggestions and prioritizes bodyweight exercises

### Test 2.1: Switch to Maintenance Phase

**Steps:**
1. Navigate to **⚙️ Settings**
2. Click **"Maintenance"** button under "Training Phase"
3. Observe the phase info text

**Expected:**
- ✅ "Maintenance" button becomes active/highlighted
- ✅ "Building" button becomes inactive
- ✅ Phase info text updates to: *"Maintenance: Sustain strength with varied accessories"* (or similar)
- ✅ localStorage check: Run `localStorage.getItem('build_training_phase')` → should return `"maintenance"`

**Result:** ⬜ Pass ⬜ Fail

---

### Test 2.2: Tempo Suggestions Instead of Weight Increases

**Steps:**
1. Ensure you're in **Maintenance** phase (Settings → Maintenance)
2. Navigate to a workout (e.g., UPPER_A)
3. Find an exercise where you're ready to progress
4. Complete sets with **max reps @ RIR 3+**
   - Example: 3×12 reps @ RIR 3 on DB Flat Bench Press

**Expected:**
- ✅ Progression message shows: **"💪 Maintenance: Try 3-1-2 tempo (pause at bottom)"**
- ❌ Should NOT suggest adding weight (e.g., "Add 1.25kg")
- ✅ Message specifically mentions tempo variation (3-1-2, pauses, eccentric)

**Result:** ⬜ Pass ⬜ Fail

**Notes:** _________________________________

---

### Test 2.3: Weight Frozen in Maintenance Phase

**Steps:**
1. Ensure you're in **Maintenance** phase
2. Complete multiple sets at max reps with high RIR (sets feel easy)
3. Check suggested weight for next session
4. Navigate through exercise history

**Expected:**
- ✅ Weight remains the SAME (not increased)
- ✅ Tempo suggestion shown instead
- ❌ No weight increase prompts appear

**Result:** ⬜ Pass ⬜ Fail

---

### Test 2.4: Deload Timing (Maintenance Phase - 4 Weeks)

**Steps:**
1. Ensure you're in **Maintenance** phase
2. Open DevTools → Console
3. Run the deload check code (same as Test 1.3):
```javascript
const storage = new (await import('./js/modules/storage.js')).StorageManager();
const phaseManager = new (await import('./js/modules/phase-manager.js')).PhaseManager(storage);
const deload = new (await import('./js/modules/deload.js')).DeloadManager(storage, phaseManager);
console.log('Phase:', phaseManager.getPhase());
console.log('Deload Sensitivity:', phaseManager.getDeloadSensitivity());
```

**Expected:**
- ✅ Phase: `"maintenance"`
- ✅ Deload Sensitivity: `"high"`
- ✅ Base threshold: 4 weeks (earlier than Building's 6 weeks)

**Result:** ⬜ Pass ⬜ Fail

---

### Test 2.5: Unlock Priority (Maintenance Phase - Bodyweight First)

**Steps:**
1. Ensure you're in **Maintenance** phase
2. Navigate to **Settings → Browse Progressions**
3. Look at the ordering of exercise progressions

**Expected:**
- ✅ Bodyweight exercises (Sadharan Dand, Sadharan Baithak) shown FIRST
- ✅ Equipment progressions (Barbell Bench, Barbell Squat) shown SECOND
- ✅ Both types are still available (not hidden)
- ✅ Clear visual prioritization of bodyweight/traditional exercises

**Result:** ⬜ Pass ⬜ Fail

**Notes:** _________________________________

---

## Test Suite 3: Phase Switching & Persistence

**Goal:** Verify phase selection persists and behavior changes immediately

### Test 3.1: Phase Switching Flow

**Steps:**
1. Start in **Building** phase
2. Complete a workout, note progression message (should suggest weight increase)
3. Switch to **Maintenance** phase in Settings
4. Complete the same workout type again

**Expected:**
- ✅ Building phase shows: "Ready to progress! Add Xkg"
- ✅ After switching, Maintenance shows: "Try 3-1-2 tempo"
- ✅ Behavior changes IMMEDIATELY after phase switch (no app reload needed)

**Result:** ⬜ Pass ⬜ Fail

---

### Test 3.2: localStorage Persistence

**Steps:**
1. Switch to **Maintenance** phase
2. Verify it shows Maintenance button as active
3. **Hard refresh** the page (Ctrl+Shift+R / Cmd+Shift+R)
4. Navigate to Settings

**Expected:**
- ✅ After refresh, **Maintenance** button is still active
- ✅ Phase persists across page reloads
- ✅ Behavior remains Maintenance-focused (tempo suggestions)

**Result:** ⬜ Pass ⬜ Fail

---

### Test 3.3: Clear Storage Resets to Building

**Steps:**
1. Open DevTools → Console
2. Run: `localStorage.removeItem('build_training_phase')`
3. Hard refresh the page
4. Navigate to Settings

**Expected:**
- ✅ "Building" button is active (default)
- ✅ App defaults to Building phase when no phase is stored

**Result:** ⬜ Pass ⬜ Fail

---

## Test Suite 4: Error Handling & Edge Cases

**Goal:** Verify app handles errors gracefully without crashes

### Test 4.1: Invalid Phase Handling

**Steps:**
1. Open DevTools → Console
2. Run: `localStorage.setItem('build_training_phase', 'invalid')`
3. Hard refresh the page
4. Complete a workout and check progression messages

**Expected:**
- ✅ App does NOT crash
- ✅ Defaults to Building phase behavior (safe fallback)
- ❌ No JavaScript errors in console

**Result:** ⬜ Pass ⬜ Fail

---

### Test 4.2: Console Error Check

**Steps:**
1. Open DevTools → Console (leave it open)
2. Switch between Building and Maintenance phases multiple times
3. Complete a workout in each phase
4. Check the console for errors

**Expected:**
- ❌ NO red errors related to PhaseManager, progression, deload, or unlocks
- ✅ May see normal service worker messages (these are OK)
- ✅ App functions smoothly without crashes

**Result:** ⬜ Pass ⬜ Fail

**Errors Found:** _________________________________

---

### Test 4.3: Null Safety Check

**Steps:**
1. Open DevTools → Console
2. Test PhaseManager with null values:
```javascript
const storage = new (await import('./js/modules/storage.js')).StorageManager();
const phaseManager = new (await import('./js/modules/phase-manager.js')).PhaseManager(storage);

// These should NOT crash
console.log(phaseManager.getProgressionBehavior());
console.log(phaseManager.getDeloadSensitivity());
console.log(phaseManager.getUnlockPriority());
```

**Expected:**
- ✅ All three calls return valid objects
- ✅ No errors thrown
- ✅ Safe defaults returned if any issues

**Result:** ⬜ Pass ⬜ Fail

---

## Test Suite 5: Integration Testing (End-to-End)

**Goal:** Verify complete workflows across multiple sessions

### Test 5.1: Building → Maintenance Workflow

**Steps:**
1. Start in **Building** phase
2. Complete 2-3 workouts with weight progression
3. Switch to **Maintenance** phase
4. Complete the same workouts

**Expected:**
- ✅ Building: Weights increase session-to-session
- ✅ Maintenance: Weights stay frozen, tempo suggestions appear
- ✅ Progress tracked correctly in both phases
- ✅ No data loss when switching phases

**Result:** ⬜ Pass ⬜ Fail

**Notes:** _________________________________

---

### Test 5.2: Deload Timing Integration

**Steps:**
1. Manually set deload date to simulate timing:
```javascript
const state = JSON.parse(localStorage.getItem('build_deload_state'));
const fiveWeeksAgo = new Date();
fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);
state.lastDeloadDate = fiveWeeksAgo.toISOString();
localStorage.setItem('build_deload_state', JSON.stringify(state));
```
2. Switch to **Building** phase, check deload suggestion
3. Switch to **Maintenance** phase, check deload suggestion

**Expected:**
- ✅ Building (5 weeks): No deload suggested (< 6 week threshold)
- ✅ Maintenance (5 weeks): Deload IS suggested (> 4 week threshold)
- ✅ Deload timing adapts correctly to phase

**Result:** ⬜ Pass ⬜ Fail

---

### Test 5.3: Service Worker Cache Update

**Steps:**
1. Open DevTools → Application tab → Service Workers
2. Check registration status
3. Look at cached files (Application → Cache Storage)

**Expected:**
- ✅ Service worker status: "activated and running"
- ✅ Cache version: `build-tracker-v64`
- ✅ PhaseManager cached: `./js/modules/phase-manager.js` in cache

**Result:** ⬜ Pass ⬜ Fail

---

## Test Suite 6: User Experience Validation

**Goal:** Ensure messaging is clear and behavior makes sense

### Test 6.1: Tempo Instructions Clarity

**Steps:**
1. Switch to **Maintenance** phase
2. Get ready to progress on an exercise
3. Read the tempo suggestion message

**Expected:**
- ✅ Message clearly explains what "3-1-2 tempo" means
- ✅ Instructions are actionable (e.g., "pause at bottom")
- ✅ User understands HOW to apply tempo variations

**User Feedback:** _________________________________

**Result:** ⬜ Pass ⬜ Fail

---

### Test 6.2: Phase Switching is Discoverable

**Steps:**
1. As a new user, navigate to **Settings**
2. Look for the "Training Phase" section

**Expected:**
- ✅ Phase toggle is easy to find
- ✅ Button labels are clear ("Building" vs "Maintenance")
- ✅ Phase info text explains the difference

**Result:** ⬜ Pass ⬜ Fail

---

### Test 6.3: No Confusion About Frozen Weights

**Steps:**
1. Switch to **Maintenance** phase
2. Complete multiple workouts where you're ready to progress

**Expected:**
- ✅ User understands why weights aren't increasing (tempo message makes it clear)
- ❌ User does NOT feel frustrated or confused by lack of weight progression
- ✅ Tempo suggestions provide clear progression path

**User Feedback:** _________________________________

**Result:** ⬜ Pass ⬜ Fail

---

## Post-Testing Checklist

After completing all tests, verify:

- [ ] All "PASS" tests have checkmarks ✅
- [ ] Any "FAIL" tests have notes explaining the issue
- [ ] Console shows no JavaScript errors during normal use
- [ ] Service worker cache updated to v64
- [ ] Phase switching works smoothly without app reload
- [ ] Building phase behavior is unchanged (no breaking changes)
- [ ] Maintenance phase shows tempo suggestions correctly
- [ ] Deload timing adapts to phase (6 weeks Building, 4 weeks Maintenance)
- [ ] Unlock priority favors bodyweight in Maintenance

---

## Common Issues & Troubleshooting

### Issue: "Tempo suggestions not showing in Maintenance"

**Check:**
1. Verify phase is actually "maintenance": `localStorage.getItem('build_training_phase')`
2. Hard refresh to clear old JavaScript: `Ctrl+Shift+R`
3. Check console for errors related to PhaseManager
4. Verify you're actually ready to progress (max reps @ good RIR)

### Issue: "Service worker won't update to v64"

**Fix:**
1. Unregister old service worker: DevTools → Application → Service Workers → Unregister
2. Clear all caches: Application → Storage → Clear site data
3. Hard refresh: `Ctrl+Shift+R`
4. Check registration: `caches.keys()` should show v64

### Issue: "Phase toggle doesn't persist after reload"

**Check:**
1. Verify localStorage is working: `localStorage.setItem('test', '1')`, then `localStorage.getItem('test')`
2. Check browser privacy mode (localStorage disabled in incognito)
3. Verify StorageManager is saving: Check console for errors

---

## Test Results Summary

**Test Date:** __________
**Tester:** __________
**Browser:** __________ (Chrome/Firefox/Safari)
**Device:** __________ (Desktop/Mobile)

**Total Tests:** 23
**Passed:** ___ / 23
**Failed:** ___ / 23

**Critical Issues:**
_________________________________
_________________________________

**Minor Issues:**
_________________________________
_________________________________

**Overall Status:** ⬜ Production Ready ⬜ Needs Fixes

---

## Next Steps After Testing

1. **If all tests pass:**
   - Mark feature as production-ready
   - Update IMPLEMENTATION-STATUS.md status to "✅ Completed"
   - Consider user documentation for tempo variations

2. **If tests fail:**
   - Document specific failures in GitHub issues
   - Tag issues with "bug" and "phase-integration"
   - Prioritize critical failures (app crashes, data loss)

3. **Future enhancements:**
   - Recovery phase implementation (designed but not implemented)
   - Maintenance phase exercise rotation
   - Tempo tracking per set (optional field)
   - Tempo progression history

---

**Testing Guide Version:** 1.0
**Last Updated:** 2026-02-14
**Related Documents:**
- Design: `docs/plans/2026-02-14-build-maintenance-phase-integration-design.md`
- Implementation: `docs/plans/2026-02-14-build-maintenance-phase-integration.md`
