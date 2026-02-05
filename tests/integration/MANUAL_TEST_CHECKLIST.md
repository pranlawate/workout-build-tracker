# Manual Integration Test Checklist

## Test Environment Setup
- [ ] Clear browser cache (Cmd+Shift+Delete or Ctrl+Shift+Delete)
- [ ] Clear localStorage: Open DevTools → Console → Run `localStorage.clear()`
- [ ] Open `src/index.html` in Chrome browser
- [ ] Open DevTools console (F12) and check for errors
- [ ] Verify no console errors on page load

## Test 1: Home Screen Display
- [ ] Page loads without errors
- [ ] "BUILD Tracker" header displays
- [ ] Next workout name shows (e.g., "Upper A - Horizontal")
- [ ] "Last trained: Never" shows on first load
- [ ] "START WORKOUT" button is visible and properly styled
- [ ] Recovery status shows "✓ All muscles recovered"
- [ ] Settings button (⚙️) is visible

## Test 2: Start Workout Flow
- [ ] Click "START WORKOUT" button
- [ ] Home screen hides (class "active" removed)
- [ ] Workout screen appears (class "active" added)
- [ ] Workout title displays correctly in header
- [ ] Back button (←) is visible
- [ ] Exercise list renders with all expected exercises
- [ ] Each exercise card shows:
  - [ ] Exercise name (escaped HTML)
  - [ ] Sets × Reps × RIR metadata
  - [ ] Input fields for weight, reps, RIR (all visible and accessible)
  - [ ] "🔵 First Time" badge (on first workout)
  - [ ] Progression hint text below metadata
- [ ] Timer displays in MM:SS format (starts at 00:00)
- [ ] Timer increments every second

## Test 3: Set Logging with Real-Time Feedback
- [ ] Click on first exercise's first set weight input
- [ ] Enter weight value (e.g., 10)
- [ ] Click on reps input
- [ ] Enter reps value (e.g., 12)
- [ ] Click on RIR input
- [ ] Enter RIR value (e.g., 2)
- [ ] After entering all three values, set row shows colored border:
  - [ ] Green border if reps ≥ max reps AND RIR ≥ target RIR
  - [ ] Red border if reps < min reps
  - [ ] Blue border if reps in range but not at max
- [ ] Repeat for 2-3 more sets on different exercises
- [ ] All inputs accept numeric values correctly
- [ ] Negative values are rejected (validation working)
- [ ] RIR values > 10 are rejected

## Test 4: Complete Workout Flow
- [ ] Scroll to bottom of workout screen
- [ ] "COMPLETE WORKOUT" button is visible
- [ ] Click "COMPLETE WORKOUT" button
- [ ] Alert dialog appears with message: "✅ [Workout Name] completed!"
- [ ] Click OK on alert
- [ ] Page returns to home screen (workout screen hides, home screen shows)
- [ ] "Last trained: Today" now displays (updated from "Never")
- [ ] Next workout name has changed (rotation working)
- [ ] Example: Upper A → Lower A, or Lower A → Upper B, etc.
- [ ] Timer is stopped (no longer incrementing)

## Test 5: Data Persistence After Browser Refresh
- [ ] Note the current "Next workout" name
- [ ] Note the "Last trained" date
- [ ] Press F5 to refresh browser page
- [ ] Page reloads successfully
- [ ] "Last trained: Today" still shows (persisted)
- [ ] Next workout name is the same as before refresh (persisted)
- [ ] Click "START WORKOUT"
- [ ] Previous workout's weight values pre-fill in inputs (data persisted)
- [ ] Reps and RIR inputs are empty (new workout session)

## Test 6: Progression Badge System
### Test 6.1: First Time Badge
- [ ] Clear localStorage: `localStorage.clear()`
- [ ] Refresh page
- [ ] Start workout
- [ ] First exercise shows "🔵 First Time" badge
- [ ] Hint shows: "Start with [X]kg and focus on form"

### Test 6.2: Ready to Progress Badge
- [ ] Complete a workout logging ALL sets with:
  - [ ] Reps at maximum of rep range (e.g., 12 reps for 8-12 range)
  - [ ] RIR ≥ target RIR (e.g., RIR 2-3)
- [ ] Complete workout and return to home
- [ ] Rotate through workouts until back to the same workout
- [ ] Start that workout again
- [ ] Exercise should show "🟢 Ready to Progress" badge
- [ ] Hint shows: "✨ Increase to [new weight]kg this session!"
- [ ] Weight input pre-filled with INCREASED weight (old + increment)

### Test 6.3: Plateau Badge
- [ ] Complete same exercise with same weight 3 times (across different workout sessions)
- [ ] Don't increase reps to max (stay below progression threshold)
- [ ] On 4th time, exercise should show "🟡 Plateau" badge
- [ ] Hint shows: "⚠️ Same weight for 3+ sessions. Consider deload or form check."

## Test 7: Service Worker and Offline Mode
### Test 7.1: Service Worker Registration
- [ ] Open DevTools → Application tab → Service Workers
- [ ] Verify Service Worker shows as "activated and is running"
- [ ] Status shows scope as "/" or the correct path
- [ ] Console shows "Service Worker registered: [scope]"

### Test 7.2: Cache Verification
- [ ] Go to DevTools → Application → Cache Storage
- [ ] Verify cache "build-tracker-v1" exists
- [ ] Expand cache and verify it contains:
  - [ ] index.html
  - [ ] All CSS files (main.css, components.css, screens.css, workout-screen.css)
  - [ ] All JS files (app.js, storage.js, workouts.js, progression.js, workout-manager.js)
  - [ ] manifest.json
  - [ ] Icons (icon-192.png, icon-512.png)

### Test 7.3: Offline Functionality
- [ ] Go to DevTools → Network tab
- [ ] Check "Offline" checkbox (simulate no internet)
- [ ] Press F5 to refresh page
- [ ] App loads completely from cache (no network errors)
- [ ] Home screen displays correctly
- [ ] Click "START WORKOUT" - works offline
- [ ] Log sets - works offline
- [ ] Complete workout - works offline
- [ ] All features functional without network
- [ ] Uncheck "Offline" to go back online

### Test 7.4: Service Worker Update Flow
- [ ] With app loaded, open `src/sw.js` in editor
- [ ] Change line 1: `CACHE_NAME = 'build-tracker-v1'` to `'build-tracker-v2'`
- [ ] Save file
- [ ] Refresh browser page
- [ ] Update prompt appears: "New version available! Reload to update?"
- [ ] Click "OK"
- [ ] Page reloads automatically
- [ ] Go to DevTools → Application → Cache Storage
- [ ] Old cache "build-tracker-v1" is deleted
- [ ] New cache "build-tracker-v2" exists

## Test 8: Mobile Responsiveness
- [ ] Open DevTools → Toggle device toolbar (Cmd+Shift+M or Ctrl+Shift+M)
- [ ] Select "iPhone 11 Pro" (414×896) or similar mobile device
- [ ] Verify layout:
  - [ ] All text is readable (no text cutoff)
  - [ ] Buttons are large enough to tap easily (≥ 60px touch targets)
  - [ ] No horizontal scrolling required
  - [ ] Inputs are properly sized for mobile
  - [ ] Exercise cards stack vertically
- [ ] Test interactions:
  - [ ] Tap "START WORKOUT" button - responds correctly
  - [ ] Tap input fields - keyboard appears, field focused
  - [ ] Tap set inputs - no accidental double-taps or missed taps
  - [ ] Scroll workout list - smooth scrolling

## Test 9: Input Validation and Error Handling
- [ ] Start a workout
- [ ] Try entering negative weight (-10) - should be rejected or set to 0
- [ ] Try entering negative reps (-5) - should be rejected
- [ ] Try entering RIR > 10 (e.g., 15) - should be rejected
- [ ] Try entering non-numeric values (letters) - should be rejected
- [ ] Leave all inputs empty and click "COMPLETE WORKOUT"
  - [ ] Workout completes without errors
  - [ ] Only sets with data (reps > 0) are saved
- [ ] Verify no console errors during validation

## Test 10: XSS Prevention (HTML Sanitization)
- [ ] Open DevTools → Console
- [ ] Run: `localStorage.setItem('storage_workouts', JSON.stringify([{name: 'UPPER_A', displayName: '<img src=x onerror=alert("XSS")>', exercises: []}]))`
- [ ] Refresh page
- [ ] Start workout
- [ ] Verify: Alert does NOT pop up (HTML is escaped)
- [ ] Verify: Exercise name shows as escaped text: `<img src=x onerror=alert("XSS")>`
- [ ] Clear localStorage and refresh to reset: `localStorage.clear()`

## Test 11: Recovery Status Display
- [ ] Complete "Upper A" workout
- [ ] Check home screen recovery status
- [ ] If next workout also uses upper body muscles:
  - [ ] Should show warning: "⚠️ [Muscle] needs [X]h more recovery"
- [ ] If next workout uses different muscles:
  - [ ] Should show: "✓ All muscles recovered"

## Test 12: Workout Rotation Logic
- [ ] Start with Upper A as next workout
- [ ] Complete Upper A
- [ ] Verify next workout is Lower A
- [ ] Complete Lower A
- [ ] Verify next workout is Upper B
- [ ] Complete Upper B
- [ ] Verify next workout is Lower B
- [ ] Complete Lower B
- [ ] Verify next workout returns to Upper A (rotation complete)

## Pass Criteria

**All tests must pass with these criteria:**
- ✅ All checkboxes checked
- ✅ No console errors during any test
- ✅ Smooth user experience throughout
- ✅ Data persists correctly across reloads
- ✅ Offline mode works completely
- ✅ Service Worker updates successfully
- ✅ No XSS vulnerabilities
- ✅ Mobile experience is usable

## Failed Test Handling

If any test fails:
1. Document the failure in Notes section below
2. Note the browser and version
3. Note any console errors
4. Create a bug report with steps to reproduce

## Notes

**Test Date:** ___________
**Browser:** ___________
**Browser Version:** ___________
**Screen Size:** ___________
**Test Result:** ⬜ PASS / ⬜ FAIL

**Issues Found:**
```

[Add any observations or bugs found during testing]
```

**Additional Comments:**
```

[Add any additional notes about the testing process or app behavior]
```

---

**Tested by:** ___________
**Signature:** ___________
