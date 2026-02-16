# Build Tracker - Master Integration Test Report

**Last Updated:** 2026-02-16
**App Version:** v1.6 (Service Worker Cache: v67)
**Latest Feature:** Lower Workout Restructure (LOWER_A/LOWER_B exercise swap)

---

## Test Environment Setup

**Prerequisites:**
1. Open application in browser: `/home/plawate/Documents and more/workout-build-tracker/index.html`
2. Open Browser DevTools (F12) → Console tab
3. For fresh testing: `localStorage.clear()` → Reload page
4. Verify no console errors on load

**Test Browsers:**
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari/iOS (latest)

---

## Feature 1: Core Workout Functionality

### Test 1.1: Start and Complete Workout
**Steps:**
1. Click "Start Workout" on home screen
2. Select "Upper A"
3. Log all sets for all exercises
4. Click "Complete Workout"

**Expected:**
- [ ] Workout starts successfully
- [ ] Set inputs appear for each exercise
- [ ] All sets save correctly
- [ ] Completion alert shows
- [ ] Workout marked as completed in localStorage
- [ ] No console errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 1.2: Set Logging Validation
**Steps:**
1. Start any workout
2. Try logging set with missing fields
3. Try logging set with invalid values (negative weight, 0 reps)

**Expected:**
- [ ] Alert shows: "Please fill in: [field names]"
- [ ] Set is NOT saved
- [ ] Can retry with valid values

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## Feature 2: Post-Workout Pain Tracking

### Test 2.1: Pain-Free Workout
**Steps:**
1. Complete a full workout
2. Click "Complete Workout"
3. Pain modal appears: "Did you experience any pain during this workout?"
4. Click "No Pain ✓"

**Expected:**
- [ ] Post-workout pain modal appears immediately after completion
- [ ] Title shows: "Workout Complete! 💪"
- [ ] "No Pain" and "Yes, I had pain" buttons visible (60px height)
- [ ] Clicking "No Pain" closes modal
- [ ] Pain-free status saved for ALL exercises
- [ ] Proceeds to weigh-in modal (if due)
- [ ] No console errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 2.2: Single Painful Exercise
**Steps:**
1. Complete a workout
2. Click "Yes, I had pain ⚠️"
3. Exercise selection screen appears
4. Check ONE exercise (e.g., "Goblet Squat")
5. Click "Next"
6. Select severity: "Minor"
7. Select location: "Knee"

**Expected:**
- [ ] Exercise selection shows all exercises from workout
- [ ] Checkboxes are large and tappable
- [ ] Can select/deselect exercises by clicking anywhere on item
- [ ] Validation prevents clicking "Next" with no selections
- [ ] Pain details screen shows exercise name
- [ ] Progress indicator: "Exercise 1 of 1"
- [ ] Severity buttons highlight when selected
- [ ] Must select severity before location
- [ ] Data saved correctly to localStorage
- [ ] Proceeds to weigh-in after last exercise

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 2.3: Multiple Painful Exercises
**Steps:**
1. Complete a workout
2. Click "Yes, I had pain"
3. Select 3 exercises
4. Click "Next"
5. For each exercise, select severity and location

**Expected:**
- [ ] Loops through all 3 exercises
- [ ] Progress shows "Exercise 1 of 3", "2 of 3", "3 of 3"
- [ ] Each exercise shows correct name
- [ ] Severity selection resets between exercises
- [ ] All 3 pain reports saved
- [ ] Non-painful exercises marked as pain-free
- [ ] Proceeds to weigh-in after last exercise

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 2.4: Pain Modal Styling (Mobile)
**Steps:**
1. Open DevTools → Device Toolbar (iPhone 12)
2. Complete workout → trigger pain modal

**Expected:**
- [ ] Modal displays full-width on mobile
- [ ] Buttons are large (50-60px height)
- [ ] Text is readable
- [ ] Checkboxes are tappable (24x24px)
- [ ] No horizontal scrolling

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## Feature 3: Band Exercise Color Selection

### Test 3.1: Band Color Button Display
**Steps:**
1. Start workout "Upper A"
2. Navigate to "Band Pull-Aparts" exercise
3. Observe set input form

**Expected:**
- [ ] "Band Resistance" label appears (not "Weight (kg)")
- [ ] 5 color buttons displayed: 🟡 Light, 🔴 Medium, 🔵 Heavy, ⚫ X-Heavy, ⚪ Custom
- [ ] Buttons arranged in 2-column grid
- [ ] One button pre-selected (last used or Medium by default)
- [ ] Custom input hidden initially
- [ ] No weight input field visible

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 3.2: Band Color Selection
**Steps:**
1. Click 🟡 Light button
2. Log set with 15 reps, RIR 3
3. Verify saved weight

**Expected:**
- [ ] Button highlights when clicked (selected state)
- [ ] Other buttons deselect
- [ ] Set saves with weight = 5 kg
- [ ] localStorage shows correct weight value
- [ ] No console errors

**Actions:**
4. Log second set, click 🔴 Medium

**Expected:**
- [ ] Medium button selects, Light deselects
- [ ] Set saves with weight = 10 kg

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 3.3: Custom Band Weight
**Steps:**
1. On Band Pull-Aparts exercise
2. Click ⚪ Custom button
3. Numeric input appears
4. Enter 8 kg
5. Log set

**Expected:**
- [ ] Custom button selects
- [ ] Numeric input appears below buttons
- [ ] Input accepts decimal values
- [ ] Set saves with weight = 8 kg

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 3.4: Band Color History Display
**Steps:**
1. After logging Band Pull-Apart sets
2. Navigate to Progress Dashboard or Exercise History
3. Check how sets are displayed

**Expected:**
- [ ] Sets show: "15 reps @ 🟡 Light" (not "15 reps @ 5 kg")
- [ ] Different colors display correctly: 🔴 Medium, 🔵 Heavy, ⚫ X-Heavy
- [ ] Custom weights show: "15 reps @ 8 kg" or "15 reps @ Custom"
- [ ] Regular exercises still show: "15 reps @ 20 kg"

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 3.5: Band Button Mobile Responsive
**Steps:**
1. Open DevTools → Device Toolbar (mobile view)
2. Navigate to Band Pull-Aparts

**Expected:**
- [ ] Buttons stack in 2 columns (or 1 on very small screens)
- [ ] Buttons remain tappable (min 50px height)
- [ ] Emoji symbols visible and clear
- [ ] No layout overflow

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## Feature 4: Body Weight Tracking

### Test 4.1: First Weigh-In
**Steps:**
1. Complete workout
2. Post-workout pain modal → weigh-in modal appears
3. Enter weight: 75.5 kg
4. Click "Save"

**Expected:**
- [ ] Weigh-in modal appears after pain tracking
- [ ] Input pre-filled with smart default (last weight or 57.5 kg)
- [ ] Input auto-selected (can type immediately)
- [ ] Accepts decimal values
- [ ] Saves to localStorage: `build_body_weight`
- [ ] Modal closes
- [ ] Returns to home screen

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 4.2: Daily Weigh-In Prompt
**Steps:**
1. Complete workout on Day 1 (log weight: 75.5 kg)
2. Complete workout on Day 2 (next day)

**Expected:**
- [ ] Weigh-in modal appears again (daily frequency)
- [ ] Input pre-filled with previous weight (75.5 kg)
- [ ] Can update to new weight

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 4.3: Same-Day Weight Replacement
**Steps:**
1. Log weight: 75.0 kg
2. Immediately complete another workout same day
3. Log weight: 75.5 kg

**Expected:**
- [ ] Alert shows: "✅ Updated today's weight to 75.5 kg (Only one entry per day is kept)"
- [ ] Only ONE entry in localStorage for today
- [ ] Previous entry replaced (not duplicated)
- [ ] Progress Dashboard shows 75.5 kg

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 4.4: Weight Trend Display
**Steps:**
1. Log weights over multiple days (e.g., 57.5, 58.0, 57.7, 58.5)
2. Navigate to Progress Dashboard
3. Check weight section

**Expected:**
- [ ] Current weight displays correctly
- [ ] 8-week change calculates correctly
- [ ] Monthly rate shows realistic value (not huge number)
- [ ] Status shows appropriate indicator (🟡 Fast bulk, 🟢 Healthy bulk, etc.)
- [ ] Chart displays trend line

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## Feature 5: Performance Analyzer

### Test 5.1: Weight Regression Detection
**Steps:**
1. Complete 2 workouts with Bench Press at 20 kg
2. Start third workout
3. Log first set at 17.5 kg

**Expected:**
- [ ] 🔴 Red badge appears
- [ ] Message: "⚠️ Weight regressed from 20kg to 17.5kg - check if recovering from illness/deload"
- [ ] Badge has red background (`rgba(239, 68, 68, 0.15)`)
- [ ] Badge visible immediately after logging set

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 5.2: Rep Drop Detection
**Steps:**
1. Complete 2 workouts averaging 10 reps per set
2. Start third workout
3. Log sets averaging 7 reps (30% drop)

**Expected:**
- [ ] 🔴 Red badge appears
- [ ] Message: "⚠️ Rep performance dropped 30% - possible overtraining"
- [ ] Badge updates in real-time

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 5.3: Form Breakdown (Intra-Set Variance)
**Steps:**
1. Log Set 1: 12 reps @ RIR 2
2. Log Set 2: 12 reps @ RIR 2
3. Log Set 3: 6 reps @ RIR 1

**Expected:**
- [ ] 🟡 Yellow badge appears after Set 3
- [ ] Message: "⚠️ Reps inconsistent within session (12/12/6) - form may be breaking down"
- [ ] Badge has yellow/orange background

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 5.4: Low RIR Warning
**Steps:**
1. Log Set 1: RIR 0
2. Log Set 2: RIR 1
3. Log Set 3: RIR 0

**Expected:**
- [ ] 🟡 Yellow badge appears
- [ ] Message: "⚠️ Training too close to failure - leave 2-3 reps in reserve"

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 5.5: Deload Mode Skips Analysis
**Steps:**
1. Enable deload mode
2. Log sets with low weight (should trigger regression)

**Expected:**
- [ ] No badges appear during deload
- [ ] Workout completes normally

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## Feature 6: Mobility Checks

### Test 6.1: DB Shoulder Press Mobility
**Steps:**
1. Start UPPER_A workout
2. Complete all sets of DB Shoulder Press
3. Modal appears

**Expected:**
- [ ] Modal shows: "Could you press overhead without back arching today?"
- [ ] Help text visible
- [ ] Three buttons: Yes / No / Not sure
- [ ] Progress shows confirmations count
- [ ] Response saves to localStorage

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 6.2: Mobility Prompt - Once Per Day
**Steps:**
1. Complete DB Shoulder Press
2. Answer mobility check
3. Complete same workout again (same day)

**Expected:**
- [ ] Mobility check does NOT appear second time
- [ ] Only asked once per day per exercise

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## Feature 7: Progress Dashboard

### Test 7.1: Empty State
**Steps:**
1. Clear localStorage
2. Navigate to Progress Dashboard

**Expected:**
- [ ] Empty state message appears
- [ ] "Complete your first workout" guidance shown
- [ ] No charts or errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 7.2: Dashboard with Data
**Steps:**
1. Complete 4+ workouts
2. Navigate to Progress Dashboard

**Expected:**
- [ ] All sections render (Last 4 weeks, Session time, Top exercises, etc.)
- [ ] Charts display correctly
- [ ] Data accurate
- [ ] No console errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## Feature 8: Post-Workout Summary Screen

### Test 8.1: Summary Stats Display
**Steps:**
1. Complete a full workout (all exercises, all sets)
2. Click "Complete Workout"
3. Check summary screen

**Expected:**
- [ ] Summary screen appears
- [ ] Workout name displays correctly
- [ ] Duration shows (e.g., "32 minutes")
- [ ] Total volume shows (e.g., "2,450 kg")
- [ ] Volume comparison shows if >10% difference
- [ ] Stats section has proper spacing and formatting

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 8.2: New Records Detection
**Steps:**
1. Complete workout with weight increase (PR)
2. Check summary screen

**Expected:**
- [ ] "🎉 X New Records!" appears
- [ ] Weight PR shows: "Exercise: 25kg → 27.5kg"
- [ ] Reps PR shows: "Exercise @ 50kg: 11 → 12 reps"
- [ ] Max 5 records displayed
- [ ] If no records: "Keep pushing! 💪"

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 8.3: Pain Tracking in Summary
**Steps:**
1. Complete workout
2. On summary screen, click "Yes, I had pain"
3. Select exercise(s)
4. Fill in severity and location

**Expected:**
- [ ] "No pain" pre-selected by default
- [ ] Exercise list expands on "Yes"
- [ ] Checkboxes work (multi-select)
- [ ] Pain details show for each exercise
- [ ] Progress indicator shows (e.g., "Exercise 1 of 3")
- [ ] Can save pain data successfully

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 8.4: Weigh-in in Summary
**Steps:**
1. Complete workout (ensure weigh-in is due)
2. Check summary screen

**Expected:**
- [ ] Weigh-in section appears (if due)
- [ ] Input pre-filled with last weight
- [ ] Can enter new weight
- [ ] Weight saves on "Done" click
- [ ] Section hidden if weigh-in not due

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 8.5: Done Button and Navigation
**Steps:**
1. Fill in pain and weigh-in (if applicable)
2. Click "Done"

**Expected:**
- [ ] Pain data saves correctly
- [ ] Weigh-in data saves correctly
- [ ] Navigates to home screen
- [ ] No console errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## Feature 9: Enhanced Tracking Metrics

### Test 9.1: Recovery Modal Display
**Steps:**
1. Complete a full day without workouts
2. Next day, click "Start Workout"
3. Recovery modal should appear

**Expected:**
- [ ] Modal appears on first workout of day
- [ ] Title: "How are you feeling today?"
- [ ] All 4 inputs present:
  - Sleep hours (number input, default: 7)
  - Stress level (3 buttons: Low/Medium/High, default: Low)
  - Energy level (5 buttons: 1-5, default: 3)
  - Soreness (4 buttons: None/Mild/Moderate/Severe, default: None)
- [ ] Radio buttons selectable
- [ ] Sleep hours adjustable (0-12)
- [ ] All inputs have visible labels

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 9.2: Fatigue Score Calculation
**Steps:**
1. On recovery modal, select:
   - Sleep: 5 hours (low sleep: +2 points)
   - Stress: High (+1 point)
   - Energy: 2 (low energy: +2 points)
   - Soreness: None
2. Click "Continue to Workout"

**Expected:**
- [ ] Fatigue score calculated: 5 points (2+1+2+0)
- [ ] Warning banner appears (score ≥4)
- [ ] Banner shows: "⚠️ High Fatigue Warning (5 points)"
- [ ] Banner explains score breakdown
- [ ] Three action buttons visible:
  - "Dismiss" (returns to home)
  - "Start Deload" (enables deload mode)
  - "Continue Anyway" (proceeds to workout)

**Actions:**
3. Click "Dismiss"

**Expected:**
- [ ] Returns to home screen
- [ ] Workout does NOT start
- [ ] Can retry with different inputs

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 9.3: Warning Button Actions
**Steps:**
1. Trigger fatigue warning (score ≥4)
2. Test "Start Deload" button

**Expected:**
- [ ] Deload mode enabled in localStorage
- [ ] Workout starts in deload mode
- [ ] "DELOAD WEEK" indicator visible on workout screen

**Actions:**
3. Repeat test, click "Continue Anyway"

**Expected:**
- [ ] Proceeds to workout screen
- [ ] Normal mode (not deload)
- [ ] Recovery entry saved with workoutCompleted: false

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 9.4: Daily Frequency
**Steps:**
1. Complete first workout of the day (modal shown)
2. Immediately complete another workout same day
3. Next day, start a workout

**Expected:**
- [ ] First workout: Modal shown
- [ ] Second workout same day: Modal skipped
- [ ] Next day: Modal shown again
- [ ] localStorage shows one entry per day

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 9.5: Workout Completion with Pain
**Steps:**
1. Complete recovery modal (low fatigue score <4)
2. Complete full workout
3. On post-workout summary, select "Yes, I had pain"
4. Select severity: "Moderate" (3 points)
5. Complete pain tracking

**Expected:**
- [ ] Recovery entry updated when workout finishes
- [ ] workoutCompleted flag set to true
- [ ] Pain points (3) added to fatigue calculation
- [ ] Final fatigue score recalculated (pre-workout + pain)
- [ ] Data saved to localStorage: `build_recovery_tracking`

**Actions:**
6. Check console: `JSON.parse(localStorage.getItem('build_recovery_tracking'))`

**Expected:**
- [ ] Today's entry shows: `{ fatiguePre: X, painPoints: 3, fatigueFinal: X+3, workoutCompleted: true, date: 'YYYY-MM-DD' }`

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## Feature 10: Build/Maintenance Phase Integration

### Test 10.1: Default Phase is Building
**Steps:**
1. Navigate to ⚙️ Settings
2. Look at "Training Phase" section

**Expected:**
- [ ] "Building" button is active/highlighted
- [ ] Phase info text: "Building: Focus on progressive overload and strength gains"
- [ ] localStorage check: `localStorage.getItem('build_training_phase')` → returns `"building"` or `null`

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10.2: Switch to Maintenance Phase
**Steps:**
1. Navigate to ⚙️ Settings
2. Click "Maintenance" button under "Training Phase"

**Expected:**
- [ ] "Maintenance" button becomes active/highlighted
- [ ] "Building" button becomes inactive
- [ ] Phase info text updates
- [ ] localStorage check: `localStorage.getItem('build_training_phase')` → returns `"maintenance"`

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10.3: Weight Progression in Building Phase
**Steps:**
1. Ensure you're in Building phase
2. Complete exercise sets with max reps @ RIR 2-3
   - Example: 3×12 reps @ RIR 2 on DB Flat Bench Press

**Expected:**
- [ ] Progression message shows: "🎯 Ready to progress! Add [X]kg next session"
- [ ] Message suggests specific weight increment
- [ ] Does NOT mention "tempo" or "Maintenance"

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10.4: Tempo Suggestions in Maintenance Phase
**Steps:**
1. Switch to Maintenance phase (Settings → Maintenance)
2. Complete exercise sets with max reps @ RIR 3+
   - Example: 3×12 reps @ RIR 3 on DB Flat Bench Press

**Expected:**
- [ ] Progression message shows: "💪 Maintenance: Try 3-1-2 tempo (pause at bottom)"
- [ ] Does NOT suggest adding weight (e.g., "Add 1.25kg")
- [ ] Message specifically mentions tempo variation

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10.5: Weight Frozen in Maintenance Phase
**Steps:**
1. Ensure you're in Maintenance phase
2. Complete multiple sets at max reps with high RIR
3. Check suggested weight for next session

**Expected:**
- [ ] Weight remains SAME (not increased)
- [ ] Tempo suggestion shown instead
- [ ] No weight increase prompts appear

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10.6: Phase Switching Persistence
**Steps:**
1. Switch to Maintenance phase
2. Hard refresh page (Ctrl+Shift+R)
3. Navigate to Settings

**Expected:**
- [ ] "Maintenance" button still active after refresh
- [ ] Phase persists across page reloads
- [ ] Behavior remains Maintenance-focused

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10.7: Deload Timing - Building Phase (6 Weeks)
**Steps:**
1. Ensure you're in Building phase
2. Open DevTools → Console
3. Run:
```javascript
const storage = new (await import('./js/modules/storage.js')).StorageManager();
const phaseManager = new (await import('./js/modules/phase-manager.js')).PhaseManager(storage);
console.log('Phase:', phaseManager.getPhase());
console.log('Deload Sensitivity:', phaseManager.getDeloadSensitivity());
```

**Expected:**
- [ ] Phase: "building"
- [ ] Deload Sensitivity: "normal"
- [ ] Base threshold: 6 weeks

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10.8: Deload Timing - Maintenance Phase (4 Weeks)
**Steps:**
1. Switch to Maintenance phase
2. Open DevTools → Console
3. Run same code as Test 10.7

**Expected:**
- [ ] Phase: "maintenance"
- [ ] Deload Sensitivity: "high"
- [ ] Base threshold: 4 weeks (earlier than Building)

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10.9: Deload Timing Integration Test
**Steps:**
1. Open DevTools → Console
2. Simulate 5 weeks since last deload:
```javascript
const state = JSON.parse(localStorage.getItem('build_deload_state'));
const fiveWeeksAgo = new Date();
fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);
state.lastDeloadDate = fiveWeeksAgo.toISOString();
localStorage.setItem('build_deload_state', JSON.stringify(state));
```
3. Switch to Building phase, check if deload suggested
4. Switch to Maintenance phase, check if deload suggested

**Expected:**
- [ ] Building (5 weeks): No deload suggested (< 6 week threshold)
- [ ] Maintenance (5 weeks): Deload IS suggested (> 4 week threshold)
- [ ] Deload timing adapts correctly to phase

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10.10: Unlock Priority - Building Phase
**Steps:**
1. Ensure you're in Building phase
2. Navigate to Settings → Browse Progressions

**Expected:**
- [ ] All exercise types shown without prioritization
- [ ] Equipment progressions (Barbell Bench, Barbell Squat) visible
- [ ] Bodyweight progressions (Sadharan Dand, Sadharan Baithak) visible
- [ ] No specific ordering based on exercise type

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10.11: Unlock Priority - Maintenance Phase
**Steps:**
1. Switch to Maintenance phase
2. Navigate to Settings → Browse Progressions

**Expected:**
- [ ] Bodyweight exercises (Sadharan Dand, Sadharan Baithak) shown FIRST
- [ ] Equipment progressions (Barbell Bench, Barbell Squat) shown SECOND
- [ ] Both types still available (not hidden)
- [ ] Clear visual prioritization of bodyweight/traditional exercises

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10.12: Phase-Aware Error Handling
**Steps:**
1. Open DevTools → Console
2. Set invalid phase:
```javascript
localStorage.setItem('build_training_phase', 'invalid');
```
3. Hard refresh page
4. Complete a workout and check progression messages

**Expected:**
- [ ] App does NOT crash
- [ ] Defaults to Building phase behavior (safe fallback)
- [ ] No JavaScript errors in console

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10.13: Service Worker Cache v67
**Steps:**
1. Open DevTools → Application → Service Workers
2. Check cache version
3. Look at cached files (Application → Cache Storage)

**Expected:**
- [ ] Service worker status: "activated and running"
- [ ] Cache version: `build-tracker-v67`
- [ ] PhaseManager cached: `./js/modules/phase-manager.js` in cache

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10.14: Building → Maintenance Workflow
**Steps:**
1. Start in Building phase
2. Complete 2-3 workouts with weight progression
3. Switch to Maintenance phase
4. Complete same workouts

**Expected:**
- [ ] Building: Weights increase session-to-session
- [ ] Maintenance: Weights stay frozen, tempo suggestions appear
- [ ] Progress tracked correctly in both phases
- [ ] No data loss when switching phases

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 10.15: PhaseManager Null Safety
**Steps:**
1. Open DevTools → Console
2. Test PhaseManager methods:
```javascript
const storage = new (await import('./js/modules/storage.js')).StorageManager();
const phaseManager = new (await import('./js/modules/phase-manager.js')).PhaseManager(storage);
console.log(phaseManager.getProgressionBehavior());
console.log(phaseManager.getDeloadSensitivity());
console.log(phaseManager.getUnlockPriority());
```

**Expected:**
- [ ] All three calls return valid objects
- [ ] No errors thrown
- [ ] Safe defaults returned if any issues

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## Feature 11: Lower Workout Restructure (2026-02-16)

### Test 11.1: LOWER_A Workout Definition
**Steps:**
1. Hard refresh to load service worker v67 (Ctrl+Shift+R)
2. Open browser console
3. Run: `window.app.workoutManager.getWorkout('LOWER_A').exercises.map(e => e.name)`

**Expected:**
- [ ] Returns: `['Hack Squat', '45° Hyperextension', 'Hip Thrust', 'Leg Extension', 'Standing Calf Raise', 'Plank']`
- [ ] All 6 exercises in correct order
- [ ] No console errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.2: LOWER_B Workout Definition
**Steps:**
1. Open browser console
2. Run: `window.app.workoutManager.getWorkout('LOWER_B').exercises.map(e => e.name)`

**Expected:**
- [ ] Returns: `['Leg Press', 'DB Romanian Deadlift', 'Leg Abduction', 'Leg Curl', 'Seated Calf Raise', 'Side Plank']`
- [ ] All 6 exercises in correct order
- [ ] No console errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.3: Default Exercise Selections
**Steps:**
1. Open browser console
2. Run:
```javascript
const defaults = window.app.storage.getExerciseSelections();
console.log('LOWER_A slots:', [
  defaults['LOWER_A_SLOT_1'],
  defaults['LOWER_A_SLOT_2'],
  defaults['LOWER_A_SLOT_3'],
  defaults['LOWER_A_SLOT_4']
]);
console.log('LOWER_B slots:', [
  defaults['LOWER_B_SLOT_1'],
  defaults['LOWER_B_SLOT_2'],
  defaults['LOWER_B_SLOT_3'],
  defaults['LOWER_B_SLOT_4']
]);
```

**Expected:**
- [ ] LOWER_A slots: `['Hack Squat', '45° Hyperextension', 'Hip Thrust', 'Leg Extension']`
- [ ] LOWER_B slots: `['Leg Press', 'DB Romanian Deadlift', 'Leg Abduction', 'Leg Curl']`
- [ ] No undefined or null values

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.4: LOWER_A UI Rendering
**Steps:**
1. Click "LOWER A" workout from home screen
2. Verify exercises display in order with correct details

**Expected:**
- [ ] Hack Squat (3 sets × 8-12 reps @ RIR 2-3)
- [ ] 45° Hyperextension (3 sets × 10-12 reps @ RIR 2-3)
- [ ] Hip Thrust (3 sets × 10-12 reps @ RIR 2-3)
- [ ] Leg Extension (3 sets × 10-12 reps @ RIR 2-3)
- [ ] Standing Calf Raise (3 sets × 15-20 reps @ RIR 2-3)
- [ ] Plank (3 sets × 30-60s)
- [ ] All exercise details match specification
- [ ] No missing or duplicate exercises

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.5: LOWER_B UI Rendering
**Steps:**
1. Go back to home, click "LOWER B" workout
2. Verify exercises display in order with correct details

**Expected:**
- [ ] Leg Press (3 sets × 8-12 reps @ RIR 2-3)
- [ ] DB Romanian Deadlift (3 sets × 10-12 reps @ RIR 2-3)
- [ ] Leg Abduction (3 sets × 12-15 reps @ RIR 2-3)
- [ ] Leg Curl (3 sets × 10-12 reps @ RIR 2-3)
- [ ] Seated Calf Raise (3 sets × 15-20 reps @ RIR 2-3)
- [ ] Side Plank (3 sets × 30s/side)
- [ ] All exercise details match specification
- [ ] No missing or duplicate exercises

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.6: Progression Pathways - LOWER_A_SLOT_1
**Steps:**
1. From any workout, click "Browse Progressions"
2. Select LOWER_A_SLOT_1 (Hack Squat)
3. Check progression options

**Expected:**
- [ ] Current: Hack Squat
- [ ] Easier: Leg Press
- [ ] Harder: Barbell Back Squat, Front Squat
- [ ] Alternate: Bulgarian Split Squat

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.7: Progression Pathways - LOWER_A_SLOT_2
**Steps:**
1. Select LOWER_A_SLOT_2 (45° Hyperextension)

**Expected:**
- [ ] Current: 45° Hyperextension
- [ ] Easier: Glute Bridges
- [ ] Harder: DB Romanian Deadlift, Barbell RDL
- [ ] Alternate: Good Mornings

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.8: Progression Pathways - LOWER_A_SLOT_3
**Steps:**
1. Select LOWER_A_SLOT_3 (Hip Thrust)

**Expected:**
- [ ] Current: Hip Thrust
- [ ] Easier: Bodyweight Hip Thrust, Glute Bridges
- [ ] Harder: Weighted Hip Thrust, Single-leg Hip Thrust
- [ ] Alternate: Cable Pull-Through

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.9: Progression Pathways - LOWER_A_SLOT_4
**Steps:**
1. Select LOWER_A_SLOT_4 (Leg Extension)

**Expected:**
- [ ] Current: Leg Extension
- [ ] Easier: Bodyweight Squats
- [ ] Harder: Weighted Leg Extension
- [ ] Alternate: Sissy Squats

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.10: Progression Pathways - LOWER_B_SLOT_1
**Steps:**
1. Select LOWER_B_SLOT_1 (Leg Press)

**Expected:**
- [ ] Current: Leg Press
- [ ] Easier: Bodyweight Squats, Goblet Squat
- [ ] Harder: Hack Squat, Barbell Back Squat
- [ ] Alternate: Bulgarian Split Squat

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.11: Progression Pathways - LOWER_B_SLOT_2
**Steps:**
1. Select LOWER_B_SLOT_2 (DB Romanian Deadlift)

**Expected:**
- [ ] Current: DB Romanian Deadlift
- [ ] Easier: 45° Hyperextension, Glute Bridges
- [ ] Harder: Barbell RDL, Conventional Deadlift
- [ ] Alternate: Single-leg RDL

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.12: Progression Pathways - LOWER_B_SLOT_3
**Steps:**
1. Select LOWER_B_SLOT_3 (Leg Abduction)

**Expected:**
- [ ] Current: Leg Abduction
- [ ] Easier: Bodyweight Side-lying Abduction
- [ ] Harder: Weighted Cable Abduction, Single-leg Press
- [ ] Alternate: Clamshells, Fire Hydrants

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.13: Progression Pathways - LOWER_B_SLOT_4
**Steps:**
1. Select LOWER_B_SLOT_4 (Leg Curl)

**Expected:**
- [ ] Current: Leg Curl
- [ ] Easier: Nordic Curls (assisted)
- [ ] Harder: Nordic Curls, Single-leg Curl
- [ ] Alternate: Sliding Leg Curl

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.14: Service Worker Update to v67
**Steps:**
1. Hard refresh page (Ctrl+Shift+R)
2. Open DevTools → Application → Service Workers
3. Check cache version

**Expected:**
- [ ] Service worker cache: `build-tracker-v67`
- [ ] Old cache (v66) deleted
- [ ] All assets cached correctly

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.15: Complete LOWER_A Workout Flow
**Steps:**
1. Start LOWER_A workout
2. Log all 6 exercises (all sets)
3. Mark workout complete

**Expected:**
- [ ] All exercises log correctly
- [ ] Workout saves without errors
- [ ] Progress tracked for each exercise
- [ ] No console errors during flow

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.16: Complete LOWER_B Workout Flow
**Steps:**
1. Start LOWER_B workout
2. Log all 6 exercises (all sets)
3. Mark workout complete

**Expected:**
- [ ] All exercises log correctly
- [ ] Workout saves without errors
- [ ] Progress tracked for each exercise
- [ ] No console errors during flow

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.17: Muscle Balance Verification
**Steps:**
1. Complete one LOWER_A and one LOWER_B workout
2. Check muscle coverage per week

**Expected:**
- [ ] Quads: 3 exercises total (2 compounds + 1 isolation)
- [ ] Hamstrings: 3 exercises total (2 compounds + 1 isolation)
- [ ] Glutes: 5 exercises total (both max and medius)
- [ ] Balanced distribution across both days

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.18: No Regression - UPPER Workouts
**Steps:**
1. Click UPPER_A workout
2. Click UPPER_B workout
3. Verify exercises unchanged

**Expected:**
- [ ] UPPER_A exercises: DB Flat Bench Press, Chest-Supported Row, DB Shoulder Press, Cable Fly, Face Pull, Plank
- [ ] UPPER_B exercises: Lat Pulldown, DB Shoulder Press, Chest-Supported Row, Incline DB Press, Reverse Fly, Band Pull-Aparts, Dead Bug
- [ ] No changes to UPPER workouts

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.19: BUILD-SPECIFICATION Documentation
**Steps:**
1. Open BUILD-SPECIFICATION.md
2. Verify LOWER_A and LOWER_B sections updated

**Expected:**
- [ ] LOWER_A lists all 6 exercises correctly
- [ ] LOWER_B lists all 6 exercises correctly
- [ ] Rationale section explains restructure
- [ ] Muscle coverage documented

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 11.20: No JavaScript Errors
**Steps:**
1. Open console (F12)
2. Navigate through:
   - Click LOWER_A workout
   - Log a set for any exercise
   - Browse Progressions
   - Click LOWER_B workout
   - Complete workout flow

**Expected:**
- [ ] No red errors in console
- [ ] No warnings related to workout data
- [ ] All navigation smooth and error-free

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## Edge Cases & Error Handling

### Test E1: Corrupted localStorage
**Steps:**
```javascript
localStorage.setItem('build_body_weight', '[{"date":"invalid","weight":"abc"}]');
```
2. Navigate to Progress Dashboard

**Expected:**
- [ ] App doesn't crash
- [ ] Console logs error
- [ ] Shows empty state or skips invalid data
- [ ] Can still log new valid data

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test E2: Missing Required Fields
**Steps:**
1. Start workout
2. Try logging set without weight

**Expected:**
- [ ] Alert shows specific missing fields
- [ ] Set is not saved
- [ ] Can retry with valid data

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test E3: Rapid Consecutive Actions
**Steps:**
1. Click "Log Set" button multiple times rapidly
2. Log multiple sets very quickly

**Expected:**
- [ ] No duplicate sets created
- [ ] No race conditions
- [ ] Data consistency maintained

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## Regression Tests

### Test R1: Regular Exercise Weight Input
**Steps:**
1. Start workout
2. Navigate to Goblet Squat (regular weighted exercise)

**Expected:**
- [ ] Standard weight input appears (not band buttons)
- [ ] Label: "Weight (kg)"
- [ ] Accepts numeric input
- [ ] Validation works (weight > 0)

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test R2: Existing Pain Data Compatibility
**Steps:**
1. Check old pain tracking data in localStorage
2. Navigate to Progress Dashboard

**Expected:**
- [ ] Old data loads correctly
- [ ] No migration errors
- [ ] Pain-free status accurate

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test R3: Mobility Prompts Still Work
**Steps:**
1. Complete exercise with mobility check

**Expected:**
- [ ] Mobility prompts still appear
- [ ] Not affected by pain tracking changes

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## Performance & Responsiveness

### Test P1: Mobile UI (iPhone 12)
**Steps:**
1. Open DevTools → Device Toolbar
2. Test all major features on mobile

**Expected:**
- [ ] All modals display correctly
- [ ] Buttons are tappable (min 44px)
- [ ] No horizontal scrolling
- [ ] Font sizes readable
- [ ] Touch interactions work

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test P2: Large Dataset Performance
**Steps:**
1. Inject 50+ workout entries
2. Navigate through app

**Expected:**
- [ ] Dashboard loads in < 2 seconds
- [ ] No browser freezing
- [ ] Charts render smoothly
- [ ] No memory leaks

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test P3: Service Worker Cache (v67)
**Steps:**
1. Load app
2. Check DevTools → Application → Service Workers

**Expected:**
- [ ] Service worker registered
- [ ] Cache name: `build-tracker-v67`
- [ ] Old caches deleted (v66 and earlier)
- [ ] All assets cached correctly (including phase-manager.js, updated workouts.js)

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

## Browser Compatibility

### Chrome/Edge (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Performance acceptable

### Firefox (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Performance acceptable

### Safari/iOS (Latest)
- [ ] All features work
- [ ] Modal displays correctly
- [ ] Touch interactions work
- [ ] localStorage persists

---

## Summary Checklist

**Pre-Deployment:**
- [ ] All critical tests passing
- [ ] No blocking bugs found
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility confirmed
- [ ] Performance acceptable (< 2s load time)
- [ ] Service worker cache updated (v67)
- [ ] localStorage migrations successful
- [ ] Error handling robust
- [ ] Build/Maintenance phase integration tested
- [ ] Lower workout restructure tested (Feature 11)

**Documentation:**
- [ ] README.md updated
- [ ] CHANGELOG.md updated
- [ ] Test report completed

**Code Quality:**
- [ ] All commits follow conventional format
- [ ] No commented-out code left in production
- [ ] Console.log debugging statements removed
- [ ] Code reviewed and approved

---

## Issues Found

Document any bugs discovered during testing:

```
Issue #1:
Description:
Steps to reproduce:
Expected vs Actual:
Severity: Critical / High / Medium / Low
Status: Fixed / In Progress / Deferred
Fix applied:

Issue #2:
...
```

---

## Sign-Off

**Tested By:** _________________________

**Date:** _________________________

**Test Environment:**
- OS: _________________________
- Browser(s): _________________________
- Screen Size: _________________________

**Result:**
- [ ] ✅ Pass - Ready for production
- [ ] ⚠️ Pass with minor issues (documented above)
- [ ] ❌ Fail - Blocking issues found

**Comments:**
```



```

---

## Appendix: Test Data Commands

**Clear all data:**
```javascript
localStorage.clear();
location.reload();
```

**View body weight data:**
```javascript
JSON.parse(localStorage.getItem('build_body_weight'));
```

**View pain tracking data:**
```javascript
Object.keys(localStorage).filter(k => k.includes('pain')).forEach(k => {
  console.log(k, JSON.parse(localStorage.getItem(k)));
});
```

**Inject test workout:**
```javascript
// Add sample workout for testing
const workout = {
  name: 'Upper A',
  date: new Date().toISOString(),
  exercises: [/* ... */]
};
localStorage.setItem('build_workout_Upper_A_' + Date.now(), JSON.stringify(workout));
```
