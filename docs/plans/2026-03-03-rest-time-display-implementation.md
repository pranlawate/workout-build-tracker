# Rest Time Display Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace RIR display with exercise-specific rest time recommendations (1-3 minutes based on intensity).

**Architecture:** Add `restMinutes` field to exercise definitions, modify display formatting function to show rest time instead of RIR.

**Tech Stack:** Vanilla JavaScript, localStorage-based PWA

**Design Document:** `docs/plans/2026-03-03-rest-time-display-design.md`

---

## Task 1: Add restMinutes to UPPER_A Exercises

**Files:**
- Modify: `js/modules/workouts.js:86-161`

**Step 1: Add restMinutes to all 7 UPPER_A exercises**

Add `restMinutes` field after `rirTarget` for each exercise:

```javascript
// Exercise 1: DB Flat Bench Press (3 min - heavy compound)
{
  name: 'DB Flat Bench Press',
  sets: 3,
  repRange: '8-12',
  rirTarget: '2-3',
  restMinutes: 3,  // ADD THIS
  startingWeight: 7.5,
  weightIncrement: 2.5,
  notes: 'Compound | Chest, Front Delts, Triceps',
  machineOk: true
},

// Exercise 2: Seated Cable Row (3 min - heavy compound)
{
  name: 'Seated Cable Row',
  sets: 3,
  repRange: '10-12',
  rirTarget: '2-3',
  restMinutes: 3,  // ADD THIS
  startingWeight: 22.5,
  weightIncrement: 2.5,
  notes: 'Compound | Mid Back (Lats, Rhomboids)',
  machineOk: true
},

// Exercise 3: Decline DB Press (2 min - medium compound)
{
  name: 'Decline DB Press',
  sets: 3,
  repRange: '10-12',
  rirTarget: '2-3',
  restMinutes: 2,  // ADD THIS
  startingWeight: 7.5,
  weightIncrement: 2.5,
  notes: 'Compound | Lower Chest (Costal Head)',
  machineOk: true
},

// Exercise 4: T-Bar Row (3 min - heavy compound)
{
  name: 'T-Bar Row',
  sets: 3,
  repRange: '10-12',
  rirTarget: '2-3',
  restMinutes: 3,  // ADD THIS
  startingWeight: 5,
  weightIncrement: 2.5,
  notes: 'Compound | Back Thickness (Lats, Traps)',
  machineOk: true
},

// Exercise 5: DB Lateral Raises (1 min - light isolation)
{
  name: 'DB Lateral Raises',
  sets: 2,
  repRange: '12-15',
  rirTarget: '2-3',
  restMinutes: 1,  // ADD THIS
  startingWeight: 3.5,
  weightIncrement: 1.25,
  notes: 'Isolation | Side Delts',
  machineOk: false
},

// Exercise 6: Face Pulls (1 min - light isolation)
{
  name: 'Face Pulls',
  sets: 2,
  repRange: '15-20',
  rirTarget: '3-3',
  restMinutes: 1,  // ADD THIS
  startingWeight: 12.5,
  weightIncrement: 2.5,
  notes: 'Isolation | Rear Delts, Rotator Cuff | External rotation focus',
  machineOk: true
},

// Exercise 7: Tricep Pushdowns (1 min - light isolation)
{
  name: 'Tricep Pushdowns',
  sets: 2,
  repRange: '12-15',
  rirTarget: '2-3',
  restMinutes: 1,  // ADD THIS
  startingWeight: 10,
  weightIncrement: 2.5,
  notes: 'Isolation | Triceps (lateral + long head)',
  machineOk: true
}
```

**Step 2: Commit UPPER_A changes**

```bash
git add js/modules/workouts.js
git commit -m "feat: add rest times to UPPER_A exercises (3/2/1 min based on intensity)"
```

---

## Task 2: Add restMinutes to LOWER_A Exercises

**Files:**
- Modify: `js/modules/workouts.js:164-230`

**Step 1: Add restMinutes to all 6 LOWER_A exercises**

```javascript
// Exercise 1: Hack Squat (3 min - heavy compound)
{
  name: 'Hack Squat',
  sets: 3,
  repRange: '8-12',
  rirTarget: '2-3',
  restMinutes: 3,  // ADD THIS
  startingWeight: 20,
  weightIncrement: 5,
  notes: 'Compound | Quads',
  machineOk: true
},

// Exercise 2: 45° Hyperextension (1 min - light isolation)
{
  name: '45° Hyperextension',
  sets: 3,
  repRange: '10-12',
  rirTarget: '2-3',
  restMinutes: 1,  // ADD THIS
  startingWeight: 0,
  weightIncrement: 0,
  notes: 'Isolation | Lower Back | Bodyweight only',
  machineOk: false
},

// Exercise 3: Hip Thrust (2 min - medium intensity)
{
  name: 'Hip Thrust',
  sets: 3,
  repRange: '10-12',
  rirTarget: '2-3',
  restMinutes: 2,  // ADD THIS
  startingWeight: 20,
  weightIncrement: 5,
  notes: 'Isolation | Glutes',
  machineOk: true
},

// Exercise 4: Leg Extension (2 min - medium intensity)
{
  name: 'Leg Extension',
  sets: 3,
  repRange: '10-12',
  rirTarget: '2-3',
  restMinutes: 2,  // ADD THIS
  startingWeight: 17.5,
  weightIncrement: 2.5,
  notes: 'Isolation | Quads',
  machineOk: true
},

// Exercise 5: Standing Calf Raise (1 min - light isolation)
{
  name: 'Standing Calf Raise',
  sets: 3,
  repRange: '15-20',
  rirTarget: '2-3',
  restMinutes: 1,  // ADD THIS
  startingWeight: 20,
  weightIncrement: 5,
  notes: 'Isolation | Gastrocnemius',
  machineOk: true
},

// Exercise 6: Plank (1 min - core/bodyweight)
{
  name: 'Plank',
  sets: 3,
  repRange: '30-60s',
  rirTarget: '1-2',
  restMinutes: 1,  // ADD THIS
  startingWeight: 0,
  weightIncrement: 0,
  notes: 'Core | Core Stability | Anti-extension hold',
  machineOk: false
}
```

**Step 2: Commit LOWER_A changes**

```bash
git add js/modules/workouts.js
git commit -m "feat: add rest times to LOWER_A exercises"
```

---

## Task 3: Add restMinutes to UPPER_B Exercises

**Files:**
- Modify: `js/modules/workouts.js:232-308`

**Step 1: Add restMinutes to all 7 UPPER_B exercises**

```javascript
// Exercise 1: Lat Pulldown (3 min - heavy compound)
{
  name: 'Lat Pulldown',
  sets: 3,
  repRange: '8-12',
  rirTarget: '2-3',
  restMinutes: 3,  // ADD THIS
  startingWeight: 22.5,
  weightIncrement: 2.5,
  notes: 'Compound | Lats (Back Width)',
  machineOk: true
},

// Exercise 2: DB Shoulder Press (3 min - heavy compound)
{
  name: 'DB Shoulder Press',
  sets: 3,
  repRange: '8-12',
  rirTarget: '2-3',
  restMinutes: 3,  // ADD THIS
  startingWeight: 7.5,
  weightIncrement: 1.25,
  notes: 'Compound | Front & Side Delts',
  machineOk: true
},

// Exercise 3: Chest-Supported Row (3 min - heavy compound)
{
  name: 'Chest-Supported Row',
  sets: 3,
  repRange: '10-12',
  rirTarget: '2-3',
  restMinutes: 3,  // ADD THIS
  startingWeight: 10,
  weightIncrement: 2.5,
  notes: 'Compound | Back Thickness',
  machineOk: true
},

// Exercise 4: Incline DB Press (3 min - heavy compound)
{
  name: 'Incline DB Press',
  sets: 3,
  repRange: '10-12',
  rirTarget: '2-3',
  restMinutes: 3,  // ADD THIS
  startingWeight: 7.5,
  weightIncrement: 2.5,
  notes: 'Compound | Upper Chest',
  machineOk: true
},

// Exercise 5: Reverse Fly (2 min - medium intensity)
{
  name: 'Reverse Fly',
  sets: 2,
  repRange: '12-15',
  rirTarget: '2-3',
  restMinutes: 2,  // ADD THIS
  startingWeight: 5,
  weightIncrement: 1.25,
  notes: 'Isolation | Rear Delts, Rotator Cuff',
  machineOk: true
},

// Exercise 6: DB Hammer Curls (2 min - medium intensity)
{
  name: 'DB Hammer Curls',
  sets: 2,
  repRange: '10-12',
  rirTarget: '2-3',
  restMinutes: 2,  // ADD THIS
  startingWeight: 7.5,
  weightIncrement: 1.25,
  notes: 'Isolation | Biceps + Brachialis',
  machineOk: false
},

// Exercise 7: Dead Bug (1 min - core/bodyweight)
{
  name: 'Dead Bug',
  sets: 3,
  repRange: '10-12/side',
  rirTarget: '2-3',
  restMinutes: 1,  // ADD THIS
  startingWeight: 0,
  weightIncrement: 0,
  notes: 'Core | Core Stability | Anti-rotation control',
  machineOk: false
}
```

**Step 2: Commit UPPER_B changes**

```bash
git add js/modules/workouts.js
git commit -m "feat: add rest times to UPPER_B exercises"
```

---

## Task 4: Add restMinutes to LOWER_B Exercises

**Files:**
- Modify: `js/modules/workouts.js:310-386`

**Step 1: Add restMinutes to all 7 LOWER_B exercises**

```javascript
// Exercise 1: Leg Press (3 min - heavy compound)
{
  name: 'Leg Press',
  sets: 3,
  repRange: '8-12',
  rirTarget: '2-3',
  restMinutes: 3,  // ADD THIS
  startingWeight: 20,
  weightIncrement: 5,
  notes: 'Compound | Quads, Glutes',
  machineOk: true
},

// Exercise 2: DB Romanian Deadlift (3 min - heavy compound)
{
  name: 'DB Romanian Deadlift',
  sets: 3,
  repRange: '10-12',
  rirTarget: '2-3',
  restMinutes: 3,  // ADD THIS
  startingWeight: 10,
  weightIncrement: 2.5,
  notes: 'Compound | Hamstrings, Glutes, Lower Back',
  machineOk: false
},

// Exercise 3: Leg Abduction (2 min - medium intensity)
{
  name: 'Leg Abduction',
  sets: 3,
  repRange: '12-15',
  rirTarget: '2-3',
  restMinutes: 2,  // ADD THIS
  startingWeight: 15,
  weightIncrement: 2.5,
  notes: 'Isolation | Hip Abductors (Glute Medius)',
  machineOk: true
},

// Exercise 4: Leg Adduction (2 min - medium intensity)
{
  name: 'Leg Adduction',
  sets: 3,
  repRange: '12-15',
  rirTarget: '2-3',
  restMinutes: 2,  // ADD THIS
  startingWeight: 15,
  weightIncrement: 2.5,
  notes: 'Isolation | Hip Adductors | Pairs with abduction for balance',
  machineOk: true
},

// Exercise 5: Leg Curl (2 min - medium intensity)
{
  name: 'Leg Curl',
  sets: 3,
  repRange: '10-12',
  rirTarget: '2-3',
  restMinutes: 2,  // ADD THIS
  startingWeight: 17.5,
  weightIncrement: 2.5,
  notes: 'Isolation | Hamstrings',
  machineOk: true
},

// Exercise 6: Seated Calf Raise (1 min - light isolation)
{
  name: 'Seated Calf Raise',
  sets: 3,
  repRange: '15-20',
  rirTarget: '2-3',
  restMinutes: 1,  // ADD THIS
  startingWeight: 15,
  weightIncrement: 5,
  notes: 'Isolation | Soleus',
  machineOk: true
},

// Exercise 7: Side Plank (1 min - core/bodyweight)
{
  name: 'Side Plank',
  sets: 3,
  repRange: '30s/side',
  rirTarget: '1-2',
  restMinutes: 1,  // ADD THIS
  startingWeight: 0,
  weightIncrement: 0,
  notes: 'Core | Obliques, Glute Medius | Anti-lateral flexion',
  machineOk: false
}
```

**Step 2: Commit LOWER_B changes**

```bash
git add js/modules/workouts.js
git commit -m "feat: add rest times to LOWER_B exercises"
```

---

## Task 5: Add restMinutes to Progression Pathway Exercises

**Files:**
- Modify: `js/modules/workouts.js:37-83`

**Step 1: Add restMinutes to EXERCISE_DEFINITIONS**

These exercises are used in rotation/progression system:

```javascript
export const EXERCISE_DEFINITIONS = {
  'KB Goblet Squat': {
    sets: 3,
    repRange: '8-12',
    rirTarget: '2-3',
    restMinutes: 3,  // ADD THIS (heavy compound)
    startingWeight: 12,
    weightIncrement: 4,
    notes: 'Compound | Quads, Glutes',
    machineOk: false
  },
  'KB Swings': {
    sets: 3,
    repRange: '15-20',
    rirTarget: '2-3',
    restMinutes: 2,  // ADD THIS (ballistic, medium intensity)
    startingWeight: 12,
    weightIncrement: 4,
    notes: 'Compound | Glutes, Hamstrings | Ballistic hip power',
    machineOk: false
  },
  'Decline DB Press': {
    sets: 3,
    repRange: '10-12',
    rirTarget: '2-3',
    restMinutes: 2,  // ADD THIS (medium compound)
    startingWeight: 7.5,
    weightIncrement: 2.5,
    notes: 'Compound | Lower Chest (Costal Head)',
    machineOk: true
  },
  'Standard DB Curls': {
    sets: 2,
    repRange: '10-12',
    rirTarget: '2-3',
    restMinutes: 2,  // ADD THIS (medium isolation)
    startingWeight: 7.5,
    weightIncrement: 1.25,
    notes: 'Isolation | Biceps (Long + Short Heads)',
    machineOk: false
  },
  'Overhead Tricep Extension': {
    sets: 2,
    repRange: '12-15',
    rirTarget: '2-3',
    restMinutes: 1,  // ADD THIS (light isolation)
    startingWeight: 10,
    weightIncrement: 2.5,
    notes: 'Isolation | Triceps (Long + Medial Heads)',
    machineOk: true
  }
};
```

**Step 2: Commit progression pathway changes**

```bash
git add js/modules/workouts.js
git commit -m "feat: add rest times to progression pathway exercises"
```

---

## Task 6: Update Display Formatting Function

**Files:**
- Modify: `js/app.js:2055-2066`

**Step 1: Read current formatExerciseMeta function**

Current implementation (lines 2055-2066):

```javascript
formatExerciseMeta(exercise) {
  const isTimeBased = this.isTimeBasedExercise(exercise);

  if (isTimeBased) {
    // Time-based: "3 sets × 30-60s"
    return `${exercise.sets} sets × ${exercise.repRange}`;
  } else {
    // Rep-based: "3 sets × 8-12 reps @ RIR 2-3"
    const rirText = exercise.rirTarget ? ` @ RIR ${exercise.rirTarget}` : '';
    return `${exercise.sets} sets × ${exercise.repRange} reps${rirText}`;
  }
}
```

**Step 2: Replace with rest time display**

Replace function with:

```javascript
formatExerciseMeta(exercise) {
  const isTimeBased = this.isTimeBasedExercise(exercise);
  const restText = exercise.restMinutes ? ` • ${exercise.restMinutes} min rest` : '';

  if (isTimeBased) {
    // Time-based: "3 sets × 30-60s • 1 min rest"
    return `${exercise.sets} sets × ${exercise.repRange}${restText}`;
  } else {
    // Rep-based: "3 sets × 8-12 reps • 3 min rest"
    return `${exercise.sets} sets × ${exercise.repRange} reps${restText}`;
  }
}
```

**Step 3: Verify changes**

Check that:
- RIR display removed
- Rest time added with bullet separator (•)
- Works for both rep-based and time-based exercises

**Step 4: Commit display formatting changes**

```bash
git add js/app.js
git commit -m "feat: replace RIR display with rest time recommendations"
```

---

## Task 7: Bump Service Worker Cache Version

**Files:**
- Modify: `sw.js:1`

**Step 1: Update cache version**

Change:
```javascript
const CACHE_VERSION = 'build-tracker-v104';
```

To:
```javascript
const CACHE_VERSION = 'build-tracker-v105';
```

**Step 2: Commit cache version bump**

```bash
git add sw.js
git commit -m "chore: bump service worker cache to v105 for rest time display"
```

---

## Task 8: Visual Testing & Verification

**Files:**
- Test: All workout screens

**Step 1: Start development server**

```bash
# If using Python
python -m http.server 8000

# If using Node
npx http-server -p 8000
```

**Step 2: Test UPPER_A (7 exercises)**

Open `http://localhost:8000` and start UPPER_A workout.

Verify each exercise shows correct rest time:
- DB Flat Bench Press → "3 sets × 8-12 reps • 3 min rest" ✓
- Seated Cable Row → "3 sets × 10-12 reps • 3 min rest" ✓
- Decline DB Press → "3 sets × 10-12 reps • 2 min rest" ✓
- T-Bar Row → "3 sets × 10-12 reps • 3 min rest" ✓
- DB Lateral Raises → "2 sets × 12-15 reps • 1 min rest" ✓
- Face Pulls → "2 sets × 15-20 reps • 1 min rest" ✓
- Tricep Pushdowns → "2 sets × 12-15 reps • 1 min rest" ✓

**Step 3: Test LOWER_A (6 exercises)**

Cancel current workout, start LOWER_A.

Verify:
- Hack Squat → "3 sets × 8-12 reps • 3 min rest" ✓
- 45° Hyperextension → "3 sets × 10-12 reps • 1 min rest" ✓
- Hip Thrust → "3 sets × 10-12 reps • 2 min rest" ✓
- Leg Extension → "3 sets × 10-12 reps • 2 min rest" ✓
- Standing Calf Raise → "3 sets × 15-20 reps • 1 min rest" ✓
- Plank → "3 sets × 30-60s • 1 min rest" ✓

**Step 4: Test UPPER_B (7 exercises)**

Cancel current workout, start UPPER_B.

Verify:
- Lat Pulldown → "3 sets × 8-12 reps • 3 min rest" ✓
- DB Shoulder Press → "3 sets × 8-12 reps • 3 min rest" ✓
- Chest-Supported Row → "3 sets × 10-12 reps • 3 min rest" ✓
- Incline DB Press → "3 sets × 10-12 reps • 3 min rest" ✓
- Reverse Fly → "2 sets × 12-15 reps • 2 min rest" ✓
- DB Hammer Curls → "2 sets × 10-12 reps • 2 min rest" ✓
- Dead Bug → "3 sets × 10-12/side • 1 min rest" ✓

**Step 5: Test LOWER_B (7 exercises)**

Cancel current workout, start LOWER_B.

Verify:
- Leg Press → "3 sets × 8-12 reps • 3 min rest" ✓
- DB Romanian Deadlift → "3 sets × 10-12 reps • 3 min rest" ✓
- Leg Abduction → "3 sets × 12-15 reps • 2 min rest" ✓
- Leg Adduction → "3 sets × 12-15 reps • 2 min rest" ✓
- Leg Curl → "3 sets × 10-12 reps • 2 min rest" ✓
- Seated Calf Raise → "3 sets × 15-20 reps • 1 min rest" ✓
- Side Plank → "3 sets × 30s/side • 1 min rest" ✓

**Step 6: Verify no RIR display**

Confirm that "@ RIR 2-3" no longer appears anywhere on the workout screen.

**Step 7: Check mobile responsiveness**

Test on mobile viewport (or use browser DevTools mobile emulation):
- Rest time text doesn't wrap awkwardly
- Bullet separator displays correctly
- Text remains readable

---

## Task 9: Push to GitHub

**Step 1: Review all commits**

```bash
git log --oneline -7
```

Expected output:
```
<hash> chore: bump service worker cache to v105 for rest time display
<hash> feat: replace RIR display with rest time recommendations
<hash> feat: add rest times to progression pathway exercises
<hash> feat: add rest times to LOWER_B exercises
<hash> feat: add rest times to UPPER_B exercises
<hash> feat: add rest times to LOWER_A exercises
<hash> feat: add rest times to UPPER_A exercises (3/2/1 min based on intensity)
```

**Step 2: Push to remote**

```bash
git push origin main
```

**Step 3: Verify on GitHub Pages**

Wait ~1 minute for GitHub Pages deployment, then visit deployed site and spot-check one workout to confirm changes are live.

---

## Success Criteria

✅ All 27 exercises have `restMinutes` field
✅ Display shows "• X min rest" instead of "@ RIR 2-3"
✅ Rest times match intensity categories (3/2/1 min)
✅ Time-based exercises (Plank, Side Plank, Dead Bug) show rest time
✅ No visual regressions on mobile
✅ Service worker cache bumped to v105
✅ All changes committed and pushed to GitHub

---

## Rollback Plan

If issues arise:

```bash
# Revert all changes
git revert HEAD~7..HEAD

# Or reset to before changes
git reset --hard <commit-before-first-change>
git push origin main --force
```

---

## Notes

- Rest times are static (not user-configurable in this version)
- Future enhancement: Allow users to adjust rest times per exercise
- No localStorage schema changes required
- No test suite changes needed (visual testing only)
