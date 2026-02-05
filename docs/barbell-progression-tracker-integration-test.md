# Barbell Progression Tracker - Integration Test Checklist

**Test Date:** _________
**Tester:** _________
**Browser:** _________

## Test Setup

- [ ] Clear localStorage (start fresh)
- [ ] Open application in browser
- [ ] Verify no errors in console

---

## Test 1: Mobility Check Prompts

### Scenario 1.1: DB Shoulder Press Mobility Check

**Steps:**
1. Start workout UPPER_A
2. Complete all sets of DB Shoulder Press
3. Log final set

**Expected:**
- [ ] Mobility check modal appears
- [ ] Question: "Could you press overhead without back arching today?"
- [ ] Help text: "Ribs should stay down, no excessive lower back arch"
- [ ] Three buttons: Yes / No / Not sure
- [ ] Progress shows "0/5 confirmations"
- [ ] Recent shows empty or previous checks

**Actions:**
4. Click "Yes"

**Expected:**
- [ ] Modal closes
- [ ] No errors in console
- [ ] Check localStorage: `barbell_mobility_checks` has entry for today

**Actions:**
5. Complete same workout again (same day)

**Expected:**
- [ ] Mobility check does NOT appear again (already checked today)

### Scenario 1.2: Goblet Squat Mobility Check

**Steps:**
1. Start workout LOWER_B
2. Complete all sets of Goblet Squat
3. Log final set

**Expected:**
- [ ] Mobility check modal appears
- [ ] Question: "Did you keep heels flat during squats today?"
- [ ] Help text: "No heel lift off ground during descent"

**Actions:**
4. Click "Not sure"

**Expected:**
- [ ] Modal closes
- [ ] Check localStorage: response saved as "not_sure"

### Scenario 1.3: DB RDL Mobility Check

**Steps:**
1. Continue LOWER_B workout (or start fresh)
2. Complete all sets of DB Romanian Deadlift
3. Log final set

**Expected:**
- [ ] Mobility check modal appears
- [ ] Question: "Could you touch your toes during warm-up today?"
- [ ] Help text: "Stand with legs straight, bend forward - can fingertips reach toes?"

**Actions:**
4. Click "No"

**Expected:**
- [ ] Modal closes
- [ ] Check localStorage: response saved as "no"

### Scenario 1.4: Progress Tracking (5 Consecutive Yes)

**Steps:**
1. Simulate 5 workouts with "Yes" responses
2. Check Progress Dashboard

**Expected:**
- [ ] After 5 "Yes" responses, mobility criterion shows ✅ (met)
- [ ] Percentage increases by 30% (mobility weight)

**Steps:**
3. Answer "No" once

**Expected:**
- [ ] Consecutive count resets
- [ ] Need 5 more "Yes" to meet criterion

---

## Test 2: Pain Tracking Prompts

### Scenario 2.1: No Pain

**Steps:**
1. Complete any exercise
2. Log final set

**Expected:**
- [ ] Pain tracking modal appears
- [ ] Exercise name shown in title
- [ ] Three buttons: No / Yes, minor / Yes, significant
- [ ] Recent history shows last 5 sessions (if any)

**Actions:**
3. Click "No"

**Expected:**
- [ ] Modal closes
- [ ] Check localStorage: `exercise_pain_history` has entry with `hadPain: false, location: null, severity: null`

### Scenario 2.2: Minor Pain with Location

**Steps:**
1. Complete DB Bench Press
2. Log final set

**Expected:**
- [ ] Pain tracking modal appears

**Actions:**
3. Click "Yes, minor"

**Expected:**
- [ ] Location buttons appear
- [ ] Buttons: Shoulder / Elbow / Wrist / Lower back / Knee / Hip / Other

**Actions:**
4. Click "Shoulder"

**Expected:**
- [ ] Modal closes
- [ ] Check localStorage: `hadPain: true, location: 'shoulder', severity: 'minor'`

### Scenario 2.3: Significant Pain

**Steps:**
1. Complete Goblet Squat
2. Log final set
3. Click "Yes, significant"
4. Click "Knee"

**Expected:**
- [ ] Modal closes
- [ ] Check localStorage: `hadPain: true, location: 'knee', severity: 'significant'`

### Scenario 2.4: Per-Exercise Attribution

**Steps:**
1. Complete DB Bench Press → Report shoulder pain
2. Complete Goblet Squat → Report knee pain
3. Check localStorage

**Expected:**
- [ ] `'UPPER_A - DB Flat Bench Press'` has shoulder pain entry
- [ ] `'LOWER_B - DB Goblet Squat'` has knee pain entry
- [ ] Entries are separate (not mixed)

### Scenario 2.5: Recurring Pain Blocks Progression

**Steps:**
1. Simulate 3 workouts with shoulder pain during DB Bench Press
2. Check Progress Dashboard → Barbell Bench card

**Expected:**
- [ ] Pain-free criterion shows ❌ or blocked status
- [ ] Blocker message: "Resolve recurring shoulder pain in DB Bench"

---

## Test 3: Progress Dashboard

### Scenario 3.1: Navigate to Dashboard

**Steps:**
1. From home screen, click "📈 Progress" button

**Expected:**
- [ ] Dashboard screen appears
- [ ] Title: "Progress Dashboard"
- [ ] Subtitle: "🎯 Equipment Progression Milestones"
- [ ] Three cards: Barbell Bench / Squat / Deadlift
- [ ] Back button works

### Scenario 3.2: Bench Press Card (No Progress)

**Steps:**
1. Clear all data (fresh start)
2. View Progress Dashboard

**Expected Bench Card:**
- [ ] Progress: 0%
- [ ] Progress bar empty
- [ ] ❌ Strength: Not started
- [ ] ❌ Training: 0 weeks
- [ ] ❌ Mobility: 0/5 confirmations
- [ ] ✅ or ❌ Pain-free (not enough data)
- [ ] Blocker: "DB Flat Bench: Need 20kg × 3×12 @ RIR 2-3"

### Scenario 3.3: Partial Progress

**Steps:**
1. Log 5 DB Bench workouts at 15kg × 3×12 @ RIR 2-3
2. Simulate 8 weeks passing
3. Answer "Yes" to mobility check 3 times
4. No pain reported
5. View Progress Dashboard

**Expected Bench Card:**
- [ ] Progress: ~50-65% (weighted calculation)
- [ ] ⏳ Strength: 15kg (partial progress toward 20kg)
- [ ] ⏳ Training: 8 weeks (need 12)
- [ ] ⏳ Mobility: 3/5 confirmations
- [ ] ✅ Pain-free: No issues
- [ ] Blocker: "Need 4 more weeks" or "Mobility: 3/5 confirmations"

### Scenario 3.4: Ready for Barbell

**Steps:**
1. Meet all criteria:
   - Strength: 20kg × 3×12 @ RIR 2-3
   - Weeks: 12+
   - Mobility: 5 consecutive "Yes"
   - Pain-free: No recurring pain
2. View Progress Dashboard

**Expected Bench Card:**
- [ ] Progress: 100%
- [ ] Progress bar full (green)
- [ ] ✅ All criteria met
- [ ] Next step: "🎉 Ready for barbell transition!"

### Scenario 3.5: Squat and Deadlift Cards

**Repeat above tests for:**
- Goblet Squat → Barbell Back Squat (20kg, 16 weeks, heel flat mobility)
- DB RDL → Barbell Deadlift (25kg, 20 weeks, toe touch mobility)

**Expected:**
- [ ] Each progression tracks independently
- [ ] Different strength targets (20kg vs 25kg)
- [ ] Different week requirements (12 vs 16 vs 20)
- [ ] Different mobility keys

---

## Test 4: Data Persistence

### Scenario 4.1: Refresh Persistence

**Steps:**
1. Log mobility check response
2. Refresh browser
3. View Progress Dashboard

**Expected:**
- [ ] Mobility progress persists
- [ ] localStorage data intact
- [ ] Progress percentage unchanged

### Scenario 4.2: Multiple Sessions

**Steps:**
1. Complete 3 workouts over 3 days
2. Answer mobility checks each day
3. Report pain on day 2
4. View Progress Dashboard

**Expected:**
- [ ] All 3 mobility checks stored
- [ ] Pain report on day 2 visible in recent history
- [ ] Progress reflects accumulated data

---

## Test 5: Edge Cases

### Scenario 5.1: Last Exercise in Workout

**Steps:**
1. Start workout
2. Complete all exercises except last one
3. Complete final exercise

**Expected:**
- [ ] Mobility check appears (if applicable)
- [ ] Pain tracking appears
- [ ] Workout completion flow not broken

### Scenario 5.2: Corrupted localStorage

**Steps:**
1. Set `localStorage.barbell_mobility_checks = "invalid{json}"`
2. View Progress Dashboard

**Expected:**
- [ ] No crash
- [ ] Gracefully handles corrupt data
- [ ] Shows 0% or defaults

### Scenario 5.3: No Exercise History

**Steps:**
1. Clear all workout data
2. Only have mobility/pain data
3. View Progress Dashboard

**Expected:**
- [ ] Strength shows 0%
- [ ] Weeks shows 0%
- [ ] Mobility shows progress if data exists
- [ ] No errors

---

## Test 6: Cross-Browser

**Repeat core tests in:**
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (iOS)
- [ ] Mobile browser

---

## Pass/Fail Summary

**Total Tests:** 30+
**Passed:** ___
**Failed:** ___
**Blocked:** ___

**Critical Issues:**

**Notes:**

---

**Tested By:** _________
**Date:** _________
**Result:** PASS / FAIL
