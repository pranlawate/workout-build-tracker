# Build Tracker - Master Integration Test Report

**Last Updated:** 2026-02-23
**App Version:** v1.8 (Service Worker Cache: v70)
**Latest Feature:** Exercise Rotation & Muscle Coverage System

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

## Feature 12: Kettlebell Integration (2026-02-22)

### Test 12.1: Equipment Profile - Kettlebells Added
**Steps:**
1. Open browser console
2. Run: `import('./js/modules/equipment-profiles.js').then(m => console.log(m.EQUIPMENT_REQUIREMENTS))`
3. Check for KB exercise entries

**Expected:**
- [ ] `'KB Goblet Squat': ['kettlebells']` exists in EQUIPMENT_REQUIREMENTS
- [ ] `'KB Swings': ['kettlebells']` exists in EQUIPMENT_REQUIREMENTS
- [ ] Both exercises properly filtered by equipment selection

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.2: Complexity Tiers Classification
**Steps:**
1. Open browser console
2. Run:
```javascript
import('./js/modules/complexity-tiers.js').then(m => {
  console.log('KB Goblet Squat tier:', m.EXERCISE_COMPLEXITY['KB Goblet Squat']);
  console.log('KB Swings tier:', m.EXERCISE_COMPLEXITY['KB Swings']);
});
```

**Expected:**
- [ ] KB Goblet Squat: `COMPLEXITY_TIERS.SIMPLE`
- [ ] KB Swings: `COMPLEXITY_TIERS.MODERATE`
- [ ] Classification affects default unlock behavior

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.3: Form Cues - KB Goblet Squat
**Steps:**
1. Navigate to Browse Progressions
2. Select KB Goblet Squat from LOWER_A_SLOT_1 alternates
3. View form cues/exercise details

**Expected:**
- [ ] Setup cues: "Hold KB at chest height", "Elbows pointing down", "Feet shoulder-width, toes slightly out"
- [ ] Execution cues: "Slow eccentric - 3s down to parallel", "Chest up, elbows between knees", "Explosive concentric - 2s up through heels"
- [ ] Mistakes: "Rounding back", "KB drifting away from chest", "Knees caving inward"
- [ ] All three categories (setup, execution, mistakes) display correctly

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.4: Form Cues - KB Swings with Safety Warnings
**Steps:**
1. Navigate to Browse Progressions
2. Select KB Swings from LOWER_A_SLOT_3 harder progressions (if unlocked)
3. View form cues/exercise details

**Expected:**
- [ ] Setup cues: "KB on floor ahead", "Hip-width stance", "Hinge to grip KB with both hands"
- [ ] Execution cues: "Explosive hip snap drives KB up", "Arms stay straight - hips do the work", "Controlled eccentric - let KB swing back between legs"
- [ ] Mistakes include safety warning: "Rounding lower back - STOP IMMEDIATELY if this occurs"
- [ ] Safety-focused language prominent and clear

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.5: Equipment Filtering - Kettlebells Disabled
**Steps:**
1. Navigate to Settings → Equipment Profile
2. Ensure "Kettlebells" is NOT selected/enabled
3. Navigate to Browse Progressions → LOWER_A_SLOT_1
4. Check available alternates

**Expected:**
- [ ] KB Goblet Squat does NOT appear in progression options
- [ ] Only non-kettlebell exercises visible
- [ ] Equipment filtering working correctly

**Actions:**
5. Check LOWER_A_SLOT_3 harder progressions

**Expected:**
- [ ] KB Swings does NOT appear in progression options

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.6: Equipment Filtering - Kettlebells Enabled
**Steps:**
1. Navigate to Settings → Equipment Profile
2. Enable "Kettlebells" in equipment selection
3. Navigate to Browse Progressions → LOWER_A_SLOT_1
4. Check available alternates

**Expected:**
- [ ] KB Goblet Squat APPEARS in alternates list
- [ ] Kettlebell badge/icon displayed on exercise card
- [ ] Can be selected as progression option

**Actions:**
5. Check LOWER_A_SLOT_3 harder progressions

**Expected:**
- [ ] KB Swings APPEARS in harder progressions list (if unlock criteria met)
- [ ] Kettlebell badge/icon displayed

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.7: KB Goblet Squat - Default Unlocked
**Steps:**
1. Clear localStorage or create new user profile
2. Navigate to Browse Progressions → LOWER_A_SLOT_1
3. Check if KB Goblet Squat is unlocked

**Expected:**
- [ ] KB Goblet Squat is unlocked immediately (SIMPLE tier, no prerequisites)
- [ ] Can be selected without meeting any criteria
- [ ] Available as regression option from Hack Squat

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.8: KB Goblet Squat - Regression from Hack Squat
**Steps:**
1. Ensure KB Goblet Squat is unlocked
2. In Browse Progressions, view Hack Squat slot
3. Check regression/"easier" options

**Expected:**
- [ ] KB Goblet Squat appears as alternate/regression option
- [ ] Smart detection may suggest KB Goblet Squat as regression
- [ ] Can switch to KB Goblet Squat from Hack Squat

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.9: KB Swings - Unlock Criteria Check
**Steps:**
1. Open browser console
2. Run:
```javascript
import('./js/modules/unlock-criteria.js').then(m => {
  console.log('KB Swings criteria:', m.EXERCISE_UNLOCK_CRITERIA['KB Swings']);
});
```

**Expected:**
- [ ] Displays unlock criteria object:
  - `strengthMilestone`: Hip Thrust @ 40kg × 12 reps × 3 sets
  - `mobilityCheck`: "Hip hinge pattern proficiency"
  - `painFreeWeeks`: 4
  - `trainingWeeks`: 8
- [ ] No console errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.10: KB Swings - Locked Without Criteria
**Steps:**
1. Create new user profile (clear localStorage)
2. Complete 2-3 workouts with Hip Thrust at 30kg (below milestone)
3. Navigate to Browse Progressions → LOWER_A_SLOT_3
4. Check if KB Swings appears

**Expected:**
- [ ] KB Swings is LOCKED (does not appear or shows lock icon)
- [ ] Does not appear in available progressions
- [ ] Unlock message explains missing criteria

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.11: KB Swings - Unlocked When Criteria Met
**Steps:**
1. Simulate meeting unlock criteria via console:
```javascript
// Set Hip Thrust strength milestone
const hipThrustHistory = {
  sets: [
    { weight: 40, reps: 12, rir: 2 },
    { weight: 40, reps: 12, rir: 2 },
    { weight: 40, reps: 12, rir: 2 }
  ]
};
localStorage.setItem('build_exercise_Hip Thrust', JSON.stringify([hipThrustHistory, hipThrustHistory]));

// Set training weeks >= 8 (simulate 60 days of workouts)
const oldDate = new Date();
oldDate.setDate(oldDate.getDate() - 60);
// ... set up training history with 8+ weeks
```
2. Navigate to Browse Progressions → LOWER_A_SLOT_3
3. Check if KB Swings unlocked

**Expected:**
- [ ] KB Swings IS UNLOCKED and appears in harder progressions
- [ ] Can be selected for LOWER_A_SLOT_3
- [ ] No lock icon displayed

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.12: KB Swings - Hip Thrust Milestone Evaluator Integration
**Steps:**
1. Open browser console
2. Run:
```javascript
import('./js/modules/unlock-evaluator.js').then(m => {
  const evaluator = new m.UnlockEvaluator(window.app.storage);
  console.log('Hip Thrust milestone:', evaluator.MILESTONES['Hip Thrust']);
});
```

**Expected:**
- [ ] Hip Thrust milestone exists: `{ weight: 40, reps: 12, sets: 3 }`
- [ ] Milestone matches unlock-criteria.js specification
- [ ] No console errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.13: Exercise Definitions - KB Goblet Squat
**Steps:**
1. Open browser console
2. Run:
```javascript
import('./js/modules/workouts.js').then(m => {
  console.log('KB Goblet Squat definition:', m.EXERCISE_DEFINITIONS['KB Goblet Squat']);
});
```

**Expected:**
- [ ] Returns definition object:
  - `sets`: 3
  - `repRange`: '8-12'
  - `rirTarget`: '2-3'
  - `startingWeight`: 12 (12kg KB)
  - `weightIncrement`: 4 (KB increments)
  - `notes`: 'Compound | Quads, Glutes'
  - `machineOk`: false

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.14: Exercise Definitions - KB Swings
**Steps:**
1. Open browser console
2. Run:
```javascript
import('./js/modules/workouts.js').then(m => {
  console.log('KB Swings definition:', m.EXERCISE_DEFINITIONS['KB Swings']);
});
```

**Expected:**
- [ ] Returns definition object:
  - `sets`: 3
  - `repRange`: '15-20' (higher reps for ballistic work)
  - `rirTarget`: '2-3'
  - `startingWeight`: 12
  - `weightIncrement`: 4
  - `notes`: 'Compound | Glutes, Hamstrings | Ballistic hip power'
  - `machineOk`: false

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.15: Workout Display Integration - KB Goblet Squat
**Steps:**
1. Navigate to Browse Progressions → LOWER_A_SLOT_1
2. Select KB Goblet Squat as exercise for slot
3. Return to home, start LOWER_A workout
4. Check that KB Goblet Squat appears with correct parameters

**Expected:**
- [ ] KB Goblet Squat displays in workout
- [ ] Shows: 3 sets × 8-12 reps @ RIR 2-3
- [ ] Starting weight: 12kg
- [ ] Weight increment: 4kg (KB sizes)
- [ ] Notes visible: "Compound | Quads, Glutes"

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.16: Workout Display Integration - KB Swings
**Steps:**
1. Ensure KB Swings is unlocked
2. Navigate to Browse Progressions → LOWER_A_SLOT_3
3. Select KB Swings as exercise for slot
4. Return to home, start LOWER_A workout
5. Check that KB Swings appears with correct parameters

**Expected:**
- [ ] KB Swings displays in workout
- [ ] Shows: 3 sets × 15-20 reps @ RIR 2-3
- [ ] Starting weight: 12kg
- [ ] Notes visible: "Compound | Glutes, Hamstrings | Ballistic hip power"

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.17: getWorkoutWithSelections() Integration
**Steps:**
1. Select KB Goblet Squat for LOWER_A_SLOT_1
2. Open browser console
3. Run:
```javascript
import('./js/modules/workouts.js').then(m => {
  const workout = m.getWorkoutWithSelections('LOWER_A', window.app.storage);
  console.log('First exercise:', workout.exercises[0]);
});
```

**Expected:**
- [ ] First exercise shows KB Goblet Squat (not Hack Squat)
- [ ] Exercise has all properties from EXERCISE_DEFINITIONS
- [ ] Function correctly merges user selections with workout definitions

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.18: Progression Pathways - LOWER_A_SLOT_1 Updated
**Steps:**
1. Navigate to Browse Progressions → LOWER_A_SLOT_1 (Hack Squat)
2. Check alternates list

**Expected:**
- [ ] Current: Hack Squat
- [ ] Alternates: Bulgarian Split Squat, KB Goblet Squat
- [ ] KB Goblet Squat appears as second alternate

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.19: Progression Pathways - LOWER_A_SLOT_3 Updated
**Steps:**
1. Navigate to Browse Progressions → LOWER_A_SLOT_3 (Hip Thrust)
2. Check harder progressions list

**Expected:**
- [ ] Current: Hip Thrust
- [ ] Harder: Weighted Hip Thrust, Single-leg Hip Thrust, KB Swings
- [ ] KB Swings appears as third harder progression

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.20: Service Worker Cache Update to v70
**Steps:**
1. Hard refresh page (Ctrl+Shift+R)
2. Open DevTools → Application → Service Workers
3. Check cache version

**Expected:**
- [ ] Service worker cache: `build-tracker-v70`
- [ ] Old caches (v67, v68, v69) deleted
- [ ] New modules cached: unlock-criteria.js
- [ ] Updated modules cached: workouts.js, unlock-evaluator.js, progression-pathways.js

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.21: Complete Workout Flow - KB Goblet Squat
**Steps:**
1. Select KB Goblet Squat for LOWER_A_SLOT_1
2. Start LOWER_A workout
3. Log all 3 sets for KB Goblet Squat:
   - Set 1: 12kg × 10 reps @ RIR 3
   - Set 2: 12kg × 10 reps @ RIR 3
   - Set 3: 12kg × 9 reps @ RIR 3
4. Complete workout

**Expected:**
- [ ] All sets log correctly
- [ ] Weight input accepts 12kg starting weight
- [ ] Progress tracked in localStorage
- [ ] Form cues accessible during workout
- [ ] No console errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.22: Complete Workout Flow - KB Swings
**Steps:**
1. Ensure KB Swings unlocked
2. Select KB Swings for LOWER_A_SLOT_3
3. Start LOWER_A workout
4. Log all 3 sets for KB Swings:
   - Set 1: 12kg × 18 reps @ RIR 2
   - Set 2: 12kg × 17 reps @ RIR 2
   - Set 3: 12kg × 16 reps @ RIR 3
5. Complete workout

**Expected:**
- [ ] All sets log correctly
- [ ] Rep range 15-20 validated properly
- [ ] Higher rep counts accepted
- [ ] Ballistic exercise tracked correctly
- [ ] No console errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.23: Weight Progression - KB Increments
**Steps:**
1. Complete 2 workouts with KB Goblet Squat at 12kg hitting max reps
2. Check suggested weight for next session

**Expected:**
- [ ] Progression suggests 16kg (4kg increment, next KB size)
- [ ] NOT 13.25kg or 14.5kg (standard DB increments)
- [ ] Weight increment matches KB availability (4kg jumps)

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.24: Edge Case - KB Exercise Without Kettlebells
**Steps:**
1. Select KB Goblet Squat for LOWER_A_SLOT_1
2. Navigate to Settings → Equipment Profile
3. Disable "Kettlebells"
4. Start LOWER_A workout

**Expected:**
- [ ] KB Goblet Squat either:
  - Reverts to default Hack Squat, OR
  - Shows warning about missing equipment, OR
  - Still displays but with equipment warning
- [ ] No crash or undefined behavior
- [ ] User can still complete workout

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.25: Integration Test Documentation
**Steps:**
1. Open `docs/testing/kettlebell-integration-test-report.md`
2. Verify test scenarios documented

**Expected:**
- [ ] File exists
- [ ] Contains test scenarios for equipment filtering, unlock flow, form cues, progression UI
- [ ] Template includes sections for results, edge cases, issues found
- [ ] Date: 2026-02-20, Version: v70

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.26: FUTURE-IMPROVEMENTS.md Updated
**Steps:**
1. Open `docs/FUTURE-IMPROVEMENTS.md`
2. Check for Kettlebell Integration section

**Expected:**
- [ ] Kettlebell Integration moved to "Archived Ideas" or "Completed Features"
- [ ] Implementation date: 2026-02-20
- [ ] Lists files modified
- [ ] Marks feature as completed

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.27: No Regression - Existing Exercises
**Steps:**
1. Start UPPER_A workout
2. Verify DB Flat Bench Press still works
3. Start LOWER_B workout
4. Verify Leg Press still works

**Expected:**
- [ ] Existing exercises unchanged
- [ ] No impact on non-kettlebell exercises
- [ ] All previous functionality intact
- [ ] No console errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 12.28: Null Safety - Missing Unlock Criteria
**Steps:**
1. Open browser console
2. Run:
```javascript
import('./js/modules/unlock-evaluator.js').then(m => {
  const evaluator = new m.UnlockEvaluator(window.app.storage);
  const result = evaluator.evaluateUnlock('NonExistentExercise');
  console.log('Result:', result);
});
```

**Expected:**
- [ ] No errors thrown
- [ ] Returns safe default (unlocked or locked based on tier defaults)
- [ ] Graceful handling of missing exercise

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

## Feature 13: Exercise Rotation & Muscle Coverage System (2026-02-23)

**Purpose:** Ensure complete muscle head coverage through systematic 8-12 week exercise rotations.

**Key Features:**
- Tenure tracking (weeks on current exercise)
- Automatic rotation suggestions at 8 weeks
- Unlock proximity suppression (80%+ progress)
- Rotation-based unlocks (milestone twice on EACH variant)
- Priority 3 integration in smart progression

**Rotation Pools:**
- DB Hammer Curls ↔ Standard DB Curls
- Tricep Pushdowns ↔ Overhead Tricep Extension
- Barbell variations (post-unlock): Bench, Squat, Deadlift

---

### Test 13.1: Tenure Tracking - New Exercise
**Steps:**
1. Clear localStorage
2. Start UPPER_A workout
3. Log sets for DB Hammer Curls (first time)
4. Complete workout
5. In console: `import('./js/modules/rotation-manager.js').then(m => { const rm = new m.RotationManager(app.storage, app.unlockEvaluator); console.log(rm.getTenure('UPPER_A - DB Hammer Curls')); })`

**Expected:**
- [ ] Tenure returns 0 weeks (new exercise)
- [ ] startDate is set to today's date
- [ ] exerciseName: "DB Hammer Curls"
- [ ] No console errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 13.2: Tenure Tracking - Multiple Weeks
**Steps:**
1. Inject exercise history from 6 weeks ago:
   ```javascript
   const sixWeeksAgo = new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString();
   localStorage.setItem('build_exercise_UPPER_A - Tricep Pushdowns', JSON.stringify([
     { date: sixWeeksAgo, sets: [{ weight: 10, reps: 12, rir: 2 }] }
   ]));
   ```
2. Check tenure: `import('./js/modules/rotation-manager.js').then(m => { const rm = new m.RotationManager(app.storage, app.unlockEvaluator); console.log(rm.getTenure('UPPER_A - Tricep Pushdowns')); })`

**Expected:**
- [ ] Tenure returns 6 weeks
- [ ] startDate matches sixWeeksAgo
- [ ] exerciseName: "Tricep Pushdowns"

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 13.3: No Rotation Before 8 Weeks
**Steps:**
1. Use exercise history from Test 13.2 (6 weeks ago)
2. Check rotation suggestion: `import('./js/modules/rotation-manager.js').then(m => { const rm = new m.RotationManager(app.storage, app.unlockEvaluator); console.log(rm.checkRotationDue('UPPER_A - Tricep Pushdowns', 'Tricep Pushdowns')); })`

**Expected:**
- [ ] Returns null (no rotation suggestion)
- [ ] Console log: "[RotationManager] Rotation check: 6 weeks < 8 week threshold"

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 13.4: Rotation Suggestion at 8 Weeks
**Steps:**
1. Inject exercise history from 8 weeks ago:
   ```javascript
   const eightWeeksAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString();
   localStorage.setItem('build_exercise_UPPER_A - Tricep Pushdowns', JSON.stringify([
     { date: eightWeeksAgo, sets: [{ weight: 10, reps: 12, rir: 2 }] }
   ]));
   ```
2. Start UPPER_A workout
3. Navigate to Tricep Pushdowns exercise

**Expected:**
- [ ] Rotation badge appears: "⟳ Try Overhead Tricep Extension for complete muscle coverage (8 weeks on current variation)"
- [ ] Button shows: "Switch Exercise"
- [ ] Badge has orange/amber color scheme
- [ ] No console errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 13.5: Accept Rotation Suggestion
**Steps:**
1. Continue from Test 13.4
2. Click "Switch Exercise" button

**Expected:**
- [ ] Exercise changes to "Overhead Tricep Extension"
- [ ] Weight input appears for new exercise
- [ ] Tenure resets to 0 weeks
- [ ] Rotation suggestion disappears
- [ ] Console log: "[App] ✓ Rotated Tricep Pushdowns → Overhead Tricep Extension"
- [ ] UI refreshes via showHomeScreen()

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 13.6: Unlock Proximity Suppression
**Steps:**
1. Inject exercise history at 85% toward milestone (12.5kg, milestone: 15kg):
   ```javascript
   const eightWeeksAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString();
   localStorage.setItem('build_exercise_UPPER_B - DB Hammer Curls', JSON.stringify([
     { date: eightWeeksAgo, sets: [{ weight: 12.5, reps: 12, rir: 2 }] }
   ]));
   ```
2. Start UPPER_B workout
3. Navigate to DB Hammer Curls

**Expected:**
- [ ] NO rotation suggestion appears
- [ ] Console log: "[RotationManager] Suppressing rotation - user at 83% toward unlock"
- [ ] User can focus on hitting milestone
- [ ] No console errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 13.7: Rotation After Unlock
**Steps:**
1. Inject history showing milestone reached (15kg × 12 reps):
   ```javascript
   const eightWeeksAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString();
   localStorage.setItem('build_exercise_UPPER_B - DB Hammer Curls', JSON.stringify([
     { date: eightWeeksAgo, sets: [{ weight: 15, reps: 12, rir: 2 }] }
   ]));
   ```
2. Start UPPER_B workout
3. Navigate to DB Hammer Curls

**Expected:**
- [ ] Rotation suggestion appears (milestone reached, suppression lifted)
- [ ] Suggests: "Try Standard DB Curls for complete muscle coverage"
- [ ] User can choose to rotate or continue pushing weight

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 13.8: Manual Rotation Anytime
**Steps:**
1. Start UPPER_A workout (any tenure)
2. Click exercise name "DB Hammer Curls"
3. Select "Standard DB Curls" from dropdown

**Expected:**
- [ ] Exercise changes to Standard DB Curls
- [ ] Tenure resets for that slot
- [ ] Exercise selection saved to localStorage
- [ ] Manual rotation works regardless of 8-week threshold
- [ ] No rotation suggestion needed

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 13.9: No Rotation for Non-Pool Exercises
**Steps:**
1. Inject 10 weeks of history for DB Flat Bench Press (no rotation pool)
2. Start UPPER_A workout
3. Navigate to DB Flat Bench Press

**Expected:**
- [ ] NO rotation suggestion appears
- [ ] Exercise doesn't have rotation pool
- [ ] Only standard progression suggestions shown
- [ ] No console errors

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 13.10: Priority 3 Integration
**Steps:**
1. Inject exercise at 8 weeks + top reps (eligible for both progression AND rotation):
   ```javascript
   const eightWeeksAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString();
   localStorage.setItem('build_exercise_UPPER_A - Tricep Pushdowns', JSON.stringify([
     { date: eightWeeksAgo, sets: [{ weight: 15, reps: 12, rir: 2 }] }
   ]));
   ```
2. Start UPPER_A workout
3. Navigate to Tricep Pushdowns

**Expected:**
- [ ] Weight increase suggestion appears (Priority 2)
- [ ] Rotation suggestion appears AFTER weight increase
- [ ] Priority order respected: pain → progression → rotation → plateau → regression → continue
- [ ] Both suggestions visible in UI
- [ ] User can choose which to follow

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 13.11: Rotation Badge Styling
**Steps:**
1. Create rotation suggestion (Test 13.4)
2. Inspect badge element in DevTools

**Expected:**
- [ ] CSS class: `.performance-badge.rotation`
- [ ] Background: `rgba(245, 158, 11, 0.15)` (semi-transparent orange)
- [ ] Border-left: `4px solid #f59e0b` (warning color)
- [ ] Icon: `⟳` (rotation symbol)
- [ ] Button: orange background with hover state
- [ ] Mobile responsive: full-width button on mobile

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 13.12: Rotation-Based Unlocks
**Steps:**
1. Hit milestone twice on DB Hammer Curls
2. Rotate to Standard DB Curls
3. Hit milestone twice on Standard DB Curls
4. Check unlock criteria for Barbell Curls

**Expected:**
- [ ] Must hit milestone on BOTH variations
- [ ] Proves movement mastery, not single exercise proficiency
- [ ] Unlock requires: 15kg × 12 twice on DB Hammer Curls AND 15kg × 12 twice on Standard DB Curls
- [ ] Barbell Curls unlock after both criteria met

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 13.13: Rotation Tenure Persistence
**Steps:**
1. Start UPPER_A workout
2. Log sets for Tricep Pushdowns
3. Complete workout
4. Reload page
5. Check tenure in console

**Expected:**
- [ ] Tenure persists across page reloads
- [ ] localStorage key: `build_exercise_tenure`
- [ ] Tenure data includes: exerciseName, startDate, lastRotationDate
- [ ] Data survives browser restart

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 13.14: Multiple Rotation Pools
**Steps:**
1. Create 8-week history for both Tricep Pushdowns AND DB Hammer Curls
2. Start UPPER_A or UPPER_B workout

**Expected:**
- [ ] Both exercises show rotation suggestions
- [ ] Suggestions are independent (one doesn't affect the other)
- [ ] Can rotate one and keep the other
- [ ] Tenure tracked separately per exercise

**Status:** ⬜ Not Tested | ✅ Pass | ❌ Fail

---

### Test 13.15: Automated Test Suite
**Steps:**
1. Open browser console
2. Run: `fetch('./tests/test-rotation-system.js').then(r => r.text()).then(eval);`

**Expected:**
- [ ] Test suite loads without errors
- [ ] 9 tests run (3 tenure + 4 eligibility + 2 proximity)
- [ ] All tests pass: "🎯 OVERALL: 9/9 tests passed (100%)"
- [ ] Results available: `window._rotationSystemTestResults`
- [ ] Test runner integration: `testRunner.runRotationSystem()`

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

### Test P3: Service Worker Cache (v70)
**Steps:**
1. Load app
2. Check DevTools → Application → Service Workers

**Expected:**
- [ ] Service worker registered
- [ ] Cache name: `build-tracker-v70`
- [ ] Old caches deleted (v69 and earlier)
- [ ] All assets cached correctly (including unlock-criteria.js, updated workouts.js, unlock-evaluator.js)

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
- [ ] Service worker cache updated (v70)
- [ ] localStorage migrations successful
- [ ] Error handling robust
- [ ] Build/Maintenance phase integration tested (Feature 10)
- [ ] Lower workout restructure tested (Feature 11)
- [ ] Kettlebell integration tested (Feature 12)
- [ ] Exercise rotation & muscle coverage tested (Feature 13)

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
