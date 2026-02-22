# Kettlebell Exercise Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add KB Goblet Squat and KB Swings to progression pathways with equipment-aware filtering and safety-focused unlock criteria.

**Architecture:** Extend existing slot-based progression system by adding kettlebell exercises to LOWER_A slots. KB Goblet Squat serves as default-unlocked regression option for Hack Squat. KB Swings requires DB RDL prerequisite completion plus strength milestones for lower back safety.

**Tech Stack:** Vanilla JavaScript ES6, localStorage for state persistence, CSS3 for styling

---

## Task 1: Add Equipment Profiles

**Files:**
- Modify: `js/modules/equipment-profiles.js`

**Step 1: Add kettlebell equipment requirements**

Open `js/modules/equipment-profiles.js` and locate the `EQUIPMENT_REQUIREMENTS` object. Add the kettlebell exercises after the existing entries:

```javascript
// Add after existing equipment requirements
'KB Goblet Squat': ['kettlebells'],
'KB Swings': ['kettlebells']
```

**Step 2: Verify syntax**

Check that the previous entry has a comma, and the new entries follow the same format as existing exercises.

**Step 3: Commit**

```bash
git add js/modules/equipment-profiles.js
git commit -m "feat: add kettlebell equipment profiles for KB Goblet Squat and KB Swings"
```

---

## Task 2: Add Complexity Tiers

**Files:**
- Modify: `js/modules/complexity-tiers.js`

**Step 1: Add complexity tier classifications**

Open `js/modules/complexity-tiers.js` and add the kettlebell exercises to the appropriate tier objects:

For KB Goblet Squat (SIMPLE tier):
```javascript
// Add to COMPLEXITY_TIERS.SIMPLE array
'KB Goblet Squat',
```

For KB Swings (MODERATE tier):
```javascript
// Add to COMPLEXITY_TIERS.MODERATE array
'KB Swings',
```

**Step 2: Verify alphabetical ordering**

Ensure exercises within each tier maintain alphabetical ordering if that's the existing pattern.

**Step 3: Commit**

```bash
git add js/modules/complexity-tiers.js
git commit -m "feat: classify KB Goblet Squat as SIMPLE and KB Swings as MODERATE complexity"
```

---

## Task 3: Add Form Cues

**Files:**
- Modify: `js/modules/form-cues.js`

**Step 1: Add KB Goblet Squat form cues**

Locate the `FORM_CUES` object and add:

```javascript
'KB Goblet Squat': {
  setup: [
    'Hold KB at chest height',
    'Elbows pointing down',
    'Feet shoulder-width, toes slightly out'
  ],
  execution: [
    'Slow eccentric - 3s down to parallel',
    'Chest up, elbows between knees',
    'Explosive concentric - 2s up through heels'
  ],
  mistakes: [
    'Rounding back',
    'KB drifting away from chest',
    'Knees caving inward'
  ]
},
```

**Step 2: Add KB Swings form cues with safety emphasis**

```javascript
'KB Swings': {
  setup: [
    'KB on floor ahead',
    'Hip-width stance',
    'Hinge to grip KB with both hands'
  ],
  execution: [
    'Explosive hip snap drives KB up',
    'Arms stay straight - hips do the work',
    'Controlled eccentric - let KB swing back between legs'
  ],
  mistakes: [
    'Squatting instead of hinging',
    'Pulling with arms instead of hip snap',
    'Rounding lower back - STOP IMMEDIATELY if this occurs'
  ]
}
```

**Step 3: Commit**

```bash
git add js/modules/form-cues.js
git commit -m "feat: add safety-focused form cues for KB Goblet Squat and KB Swings"
```

---

## Task 4: Add Unlock Criteria for KB Swings

**Files:**
- Modify: `js/modules/unlock-criteria.js`

**Step 1: Add KB Swings unlock requirements**

Locate the unlock criteria object structure and add:

```javascript
'KB Swings': {
  strengthMilestone: {
    exercise: 'Hip Thrust',
    threshold: { weight: 40, reps: 12, sets: 3 }
  },
  mobilityCheck: 'Hip hinge pattern proficiency',
  painFree: true,  // No lower back pain in last 4 weeks
  trainingWeeks: 8,
  prerequisiteExercise: 'DB Romanian Deadlift'
}
```

**Step 2: Verify unlock evaluator compatibility**

Check that the unlock-evaluator.js module can handle all these criteria types (strengthMilestone, mobilityCheck, painFree, trainingWeeks, prerequisiteExercise).

**Step 3: Commit**

```bash
git add js/modules/unlock-criteria.js
git commit -m "feat: add unlock criteria for KB Swings with DB RDL prerequisite and safety checks"
```

---

## Task 5: Add Progression Pathway Entries

**Files:**
- Modify: `js/modules/progression-pathways.js`

**Step 1: Add KB Goblet Squat to LOWER_A_SLOT_1**

Find the `LOWER_A_SLOT_1` object (Squat Compound slot) and update the `alternate` array:

```javascript
alternate: ['Bulgarian Split Squat', 'KB Goblet Squat']  // Added KB Goblet Squat
```

**Step 2: Add KB Swings to LOWER_A_SLOT_3**

Find the `LOWER_A_SLOT_3` object (Glute Isolation slot) and update the `harder` array:

```javascript
harder: ['Weighted Hip Thrust', 'Single-leg Hip Thrust', 'KB Swings']  // Added KB Swings
```

**Step 3: Commit**

```bash
git add js/modules/progression-pathways.js
git commit -m "feat: add KB Goblet Squat as Hack Squat alternate and KB Swings to Hip Thrust progression"
```

---

## Task 6: Add Exercise Definitions to Workouts

**Files:**
- Modify: `js/modules/workouts.js`

**Step 1: Add KB Goblet Squat exercise definition**

Add the exercise definition object (location depends on how exercises are structured in workouts.js):

```javascript
'KB Goblet Squat': {
  sets: 3,
  repRange: '8-12',
  rirTarget: '2-3',
  startingWeight: 12,  // 12kg KB
  weightIncrement: 4,   // KB increments (8, 12, 16, 20, 24, 28, 32kg)
  notes: 'Compound | Quads, Glutes',
  machineOk: false
}
```

**Step 2: Add KB Swings exercise definition**

```javascript
'KB Swings': {
  sets: 3,
  repRange: '15-20',  // Higher reps for ballistic work
  rirTarget: '2-3',
  startingWeight: 12,  // Start conservative
  weightIncrement: 4,
  notes: 'Compound | Glutes, Hamstrings | Ballistic hip power',
  machineOk: false
}
```

**Step 3: Commit**

```bash
git add js/modules/workouts.js
git commit -m "feat: add exercise definitions for KB Goblet Squat and KB Swings"
```

---

## Task 7: Manual Testing - Equipment Filtering

**Files:**
- Test: Browse Progressions UI in browser

**Step 1: Test without kettlebells in equipment profile**

1. Open the app in browser
2. Navigate to Progress → Browse Progressions
3. Ensure kettlebells are NOT selected in equipment filter
4. Verify KB Goblet Squat and KB Swings do NOT appear in progression options

**Step 2: Test with kettlebells enabled**

1. Enable kettlebells in equipment profile/filter
2. Navigate to LOWER_A progressions
3. Verify KB Goblet Squat appears in Hack Squat slot under alternates
4. Verify KB Swings appears in Hip Thrust slot under harder progressions

**Step 3: Verify equipment badge display**

1. Confirm both exercises show kettlebell equipment badge icon
2. Check that badge styling matches existing equipment badges

**Step 4: Document test results**

Create test report at `docs/testing/kettlebell-integration-test-report.md` with results.

---

## Task 8: Manual Testing - Unlock Flow

**Files:**
- Test: Unlock logic via browser console and UI

**Step 1: Test KB Goblet Squat default unlock**

1. Check Browse Progressions for a new user profile
2. Verify KB Goblet Squat appears immediately (SIMPLE tier, no prerequisites)
3. Test that it can be selected as regression from Hack Squat

**Step 2: Test KB Swings unlock requirements**

Simulate localStorage data to test unlock criteria:
```javascript
// In browser console
// Set up Hip Thrust strength milestone completion
// Set up DB RDL prerequisite completion
// Set training weeks >= 8
// Set painFree status = true
// Then check if KB Swings unlocks
```

**Step 3: Test unlock edge cases**

1. User has Hip Thrust strength but not DB RDL completion → KB Swings locked
2. User has DB RDL but not enough training weeks → KB Swings locked
3. User has lower back pain flag → KB Swings locked
4. User meets all criteria → KB Swings unlocked

**Step 4: Document edge case results**

Add findings to test report.

---

## Task 9: Manual Testing - Form Cues Display

**Files:**
- Test: Form cues UI rendering

**Step 1: Test KB Goblet Squat form cues**

1. Select KB Goblet Squat in a workout
2. Navigate to form cues view/modal
3. Verify all setup, execution, and mistakes cues display correctly
4. Check formatting and readability

**Step 2: Test KB Swings form cues**

1. Select KB Swings in a workout (if unlocked)
2. Verify safety-focused cues appear correctly
3. Confirm critical lower back warning is prominent

**Step 3: Test mobile responsiveness**

1. View form cues on mobile viewport
2. Verify text wrapping and readability

---

## Task 10: Update Service Worker Cache Version

**Files:**
- Modify: `sw.js`

**Step 1: Increment cache version**

Find the cache version constant in `sw.js` and increment:

```javascript
// Example: if current is 'workout-build-v67'
const CACHE_NAME = 'workout-build-v68';
```

**Step 2: Commit with deployment note**

```bash
git add sw.js
git commit -m "chore: bump service worker cache to v68 for kettlebell integration deployment"
```

---

## Task 11: Create Integration Test Documentation

**Files:**
- Create: `docs/testing/kettlebell-integration-test-report.md`

**Step 1: Document comprehensive test scenarios**

Create test report with the following structure:

```markdown
# Kettlebell Integration - Integration Test Report

**Date:** 2026-02-20
**Version:** v68
**Tester:** [Name]

## Test Scenarios

### 1. Equipment Filtering
- [ ] KB exercises hidden when kettlebells not selected
- [ ] KB exercises visible when kettlebells enabled
- [ ] Equipment badges display correctly

### 2. Unlock Flow
- [ ] KB Goblet Squat unlocked by default
- [ ] KB Swings locked without DB RDL completion
- [ ] KB Swings locked without Hip Thrust strength milestone
- [ ] KB Swings locked with lower back pain flag
- [ ] KB Swings unlocked when all criteria met

### 3. Form Cues
- [ ] KB Goblet Squat cues display correctly
- [ ] KB Swings safety warnings prominent
- [ ] Mobile responsiveness verified

### 4. Progression UI
- [ ] KB Goblet Squat in Hack Squat alternates
- [ ] KB Swings in Hip Thrust harder progressions
- [ ] Smart detection suggests KB Goblet Squat as regression

## Test Results
[Results to be filled during testing]

## Edge Cases Verified
[Edge cases to be documented]

## Issues Found
[Any bugs or unexpected behavior]
```

**Step 2: Commit test documentation**

```bash
git add docs/testing/kettlebell-integration-test-report.md
git commit -m "docs: add kettlebell integration test scenarios and report template"
```

---

## Task 12: Update FUTURE-IMPROVEMENTS.md

**Files:**
- Modify: `docs/FUTURE-IMPROVEMENTS.md`

**Step 1: Move kettlebell integration to Archived Ideas**

Find the "Kettlebell Exercise Integration" section and move it to the "Archived Ideas" section:

```markdown
### ✅ Kettlebell Exercise Integration (Implemented 2026-02-20)
- Added KB Goblet Squat as default-unlocked regression option for Hack Squat
- Added KB Swings with MODERATE complexity and DB RDL prerequisite
- Integrated with existing equipment-aware architecture
- Safety-focused unlock criteria (8 weeks training, strength milestone, pain-free requirement)
- **Files modified:** progression-pathways.js, equipment-profiles.js, complexity-tiers.js, unlock-criteria.js, form-cues.js, workouts.js
- **Commits:** [to be filled with commit hashes]
```

**Step 2: Commit documentation update**

```bash
git add docs/FUTURE-IMPROVEMENTS.md
git commit -m "docs: archive kettlebell integration as implemented feature"
```

---

## Task 13: Final Verification

**Files:**
- Test: Complete end-to-end user flow

**Step 1: Fresh browser test**

1. Clear browser cache and localStorage
2. Load the app fresh
3. Set up equipment profile with kettlebells enabled
4. Navigate through Browse Progressions
5. Verify both KB exercises appear in correct slots

**Step 2: Real workout simulation**

1. Add KB Goblet Squat to a LOWER_A workout
2. Log sets with 12kg starting weight
3. Verify progression tracking works correctly
4. Test weight increments (4kg jumps)

**Step 3: Verify service worker update**

1. Check browser DevTools → Application → Service Workers
2. Confirm new cache version (v68) is active
3. Verify all new module files are cached

**Step 4: Cross-browser testing**

1. Test on Chrome/Edge
2. Test on Firefox
3. Test on mobile Safari (if available)
4. Document any browser-specific issues

---

## Task 14: Final Commit and Summary

**Files:**
- All modified files

**Step 1: Verify all changes committed**

```bash
git status
# Should show clean working directory
git log --oneline -10
# Should show all commits from this implementation
```

**Step 2: Create implementation summary**

Update the design document with implementation notes:

```markdown
## Implementation Completed

**Date:** 2026-02-20
**Service Worker Version:** v68
**Commits:** [list commit hashes]

All tasks completed:
- ✅ Equipment profiles added
- ✅ Complexity tiers configured
- ✅ Form cues implemented with safety focus
- ✅ Unlock criteria for KB Swings
- ✅ Progression pathways updated
- ✅ Exercise definitions added
- ✅ Manual testing completed
- ✅ Integration test documentation created
- ✅ Service worker cache bumped

**Testing Status:** All test scenarios passed
**Known Issues:** None
**Browser Compatibility:** Chrome, Firefox, Safari verified
```

**Step 3: Final commit**

```bash
git add docs/plans/2026-02-20-kettlebell-integration-design.md
git commit -m "docs: mark kettlebell integration implementation as complete"
```

---

## Edge Cases and Safety Considerations

**Documented in design:**
- User without kettlebells → exercises hidden via equipment filtering
- KB Swings unlock with removed RDL → historical completion counts
- Different KB sizes → starting weight adjustable
- Lower back pain detection → unlock blocked until pain-free period met

**Additional runtime checks:**
- Verify unlock-evaluator handles missing localStorage gracefully
- Ensure form cues don't break UI if exercise name not found
- Guard against division by zero in weight increment calculations

---

## Rollback Plan

If critical issues are found:

1. Revert service worker version: `git revert <sw.js commit>`
2. Revert progression pathways: `git revert <progression commit>`
3. Users' localStorage remains intact (no data loss)
4. Equipment filtering will hide broken exercises

---

## Post-Implementation Monitoring

After deployment:
1. Monitor browser console for errors related to KB exercises
2. Check localStorage structure for corruption
3. Verify no performance regressions in Browse Progressions load time
4. Gather user feedback on form cues clarity
