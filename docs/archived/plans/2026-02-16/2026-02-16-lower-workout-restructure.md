# Lower Workout Restructure - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure LOWER_A and LOWER_B workouts by swapping exercises 1-4 to achieve better muscle balance across both days, utilizing both Leg Press and Hack Squat machines while eliminating redundant DB Goblet Squat.

**Architecture:** Exercise swap only - no new features. Update workout definitions, default selections, progression pathways, and documentation. Maintain existing progression logic and unlock system. Service worker cache bump required for deployment.

**Tech Stack:** Vanilla JavaScript (ES6 modules), localStorage, PWA with service worker

---

## Final Structure

| Slot | LOWER_A | LOWER_B |
|------|---------|---------|
| 1 | Hack Squat | Leg Press |
| 2 | 45° Hyperextension | DB Romanian Deadlift |
| 3 | Hip Thrust (glute isolation) | Leg Abduction (glute isolation) |
| 4 | Leg Extension (quad isolation) | Leg Curl (hamstring isolation) |
| 5 | Standing Calf Raise | Seated Calf Raise |
| 6 | Plank | Side Plank |

**Exercise Type Alignment:** Slots 3 and 4 now have analogous exercise types across both days - slot 3 = glute isolation, slot 4 = leg isolation.

## Muscle Balance Verification

**LOWER_A:**
- Quads: Hack Squat (compound) + Leg Extension (isolation)
- Hamstrings: 45° Hyper (compound)
- Glutes Max: Hip Thrust (isolation)
- Core: Plank

**LOWER_B:**
- Quads: Leg Press (compound)
- Hamstrings: DB RDL (compound) + Leg Curl (isolation)
- Glutes Medius: Leg Abduction (isolation)
- Core: Side Plank

**Note:** Leg Abduction and Leg Curl swapped in LOWER_B (slots 3-4) to maintain analogous exercise types across both days.

**Weekly totals:** 3 quad exercises, 3 hamstring exercises, 5 glute exercises (both max and medius), complete core and calf coverage.

---

## Task 1: Update LOWER_A Workout Definition

**Files:**
- Modify: `js/modules/workouts.js:122-192`

**Step 1: Replace LOWER_A exercises 1-4**

Find the LOWER_A workout object (starts at line 122) and replace the first 4 exercises:

```javascript
  LOWER_A: {
    name: 'LOWER_A',
    displayName: 'Lower A - Machine Focus',
    description: 'Machine squat + compound emphasis',
    exercises: [
      {
        name: 'Hack Squat',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        startingWeight: 20,
        weightIncrement: 5,
        tempo: '3 sec down, 2 sec up',
        notes: 'Quad compound (vertical squat pattern)',
        machineOk: true
      },
      {
        name: '45° Hyperextension',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: '3-4 sec down, 2 sec up',
        notes: 'CRITICAL: Lower back weakness - NOT to failure (bodyweight only)',
        machineOk: false
      },
      {
        name: 'Hip Thrust',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 20,
        weightIncrement: 5,
        tempo: '1 sec up, 2 sec down, 1 sec squeeze',
        notes: 'Primary: Glutes (heavy isolation)',
        machineOk: true
      },
      {
        name: 'Leg Extension',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 17.5,
        weightIncrement: 2.5,
        tempo: '2 sec extend, 3 sec return',
        notes: 'Quad isolation (pairs with Hack Squat)',
        machineOk: true
      },
      // Keep exercises 5-6 unchanged (Standing Calf Raise, Plank)
```

**Step 2: Verify syntax**

Run: `node -c js/modules/workouts.js`
Expected: No output (syntax valid)

**Step 3: Commit LOWER_A changes**

```bash
git add js/modules/workouts.js
git commit -m "refactor: update LOWER_A exercises 1-4 for balanced muscle distribution"
```

---

## Task 2: Update LOWER_B Workout Definition

**Files:**
- Modify: `js/modules/workouts.js:280-351`

**Step 1: Replace LOWER_B exercises 1-4**

Find the LOWER_B workout object (starts at line 280) and replace the first 4 exercises:

```javascript
  LOWER_B: {
    name: 'LOWER_B',
    displayName: 'Lower B - Free Weight Focus',
    description: 'Free weight hinge + accessory emphasis',
    exercises: [
      {
        name: 'Leg Press',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        startingWeight: 20,
        weightIncrement: 5,
        tempo: '3 sec down, 2 sec up',
        notes: 'Quads + glutes compound (horizontal push pattern)',
        machineOk: true
      },
      {
        name: 'DB Romanian Deadlift',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 10,
        weightIncrement: 2.5,
        tempo: '3 sec down, 2 sec up',
        notes: 'Hamstrings, glutes, lower back (free weight - do when fresh)',
        machineOk: false
      },
      {
        name: 'Leg Abduction',
        sets: 3,
        repRange: '12-15',
        rirTarget: '2-3',
        startingWeight: 15,
        weightIncrement: 2.5,
        tempo: '2 sec out, 2 sec in',
        notes: 'Hip abductors (glute medius) - pairs with Hip Thrust (glute isolation)',
        machineOk: true
      },
      {
        name: 'Leg Curl',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 17.5,
        weightIncrement: 2.5,
        tempo: '2 sec curl, 3 sec return',
        notes: 'Hamstring isolation (pairs with DB RDL)',
        machineOk: true
      },
      // Keep exercises 5-6 unchanged (Seated Calf Raise, Side Plank)
```

**Step 2: Verify syntax**

Run: `node -c js/modules/workouts.js`
Expected: No output (syntax valid)

**Step 3: Commit LOWER_B changes**

```bash
git add js/modules/workouts.js
git commit -m "refactor: update LOWER_B exercises 1-4 for balanced muscle distribution"
```

---

## Task 3: Update Default Exercise Selections

**Files:**
- Modify: `js/modules/storage.js:740-747`

**Step 1: Update LOWER_A and LOWER_B default selections**

Find the `getExerciseSelections()` method default object and update LOWER slots:

```javascript
return {
  'UPPER_A_SLOT_1': 'DB Flat Bench Press',
  'UPPER_A_SLOT_2': 'Chest-Supported Row',
  'UPPER_A_SLOT_3': 'DB Shoulder Press',
  'UPPER_A_SLOT_4': 'Cable Fly',
  'UPPER_A_SLOT_5': 'Face Pull',
  'UPPER_A_SLOT_6': 'Plank',
  'LOWER_A_SLOT_1': 'Hack Squat',
  'LOWER_A_SLOT_2': '45° Hyperextension',
  'LOWER_A_SLOT_3': 'Hip Thrust',
  'LOWER_A_SLOT_4': 'Leg Extension',
  'LOWER_A_SLOT_5': 'Standing Calf Raise',
  'LOWER_A_SLOT_6': 'Plank',
  'UPPER_B_SLOT_1': 'Lat Pulldown',
  'UPPER_B_SLOT_2': 'DB Shoulder Press',
  'UPPER_B_SLOT_3': 'Chest-Supported Row',
  'UPPER_B_SLOT_4': 'Incline DB Press',
  'UPPER_B_SLOT_5': 'Reverse Fly',
  'UPPER_B_SLOT_6': 'Dead Bug',
  'LOWER_B_SLOT_1': 'Leg Press',
  'LOWER_B_SLOT_2': 'DB Romanian Deadlift',
  'LOWER_B_SLOT_3': 'Leg Abduction',
  'LOWER_B_SLOT_4': 'Leg Curl',
  'LOWER_B_SLOT_5': 'Seated Calf Raise',
  'LOWER_B_SLOT_6': 'Side Plank'
};
```

**Step 2: Verify syntax**

Run: `node -c js/modules/storage.js`
Expected: No output (syntax valid)

**Step 3: Commit default selections**

```bash
git add js/modules/storage.js
git commit -m "refactor: update default exercise selections for restructured lower workouts"
```

---

## Task 4: Update Progression Pathways

**Files:**
- Modify: `js/modules/progression-pathways.js` (LOWER_A slots)
- Modify: `js/modules/progression-pathways.js` (LOWER_B slots)

**Step 1: Find and update LOWER_A_SLOT_1 (Hack Squat)**

Search for `LOWER_A_SLOT_1` and verify/update:

```javascript
'LOWER_A_SLOT_1': {
  slotName: 'Squat Compound',
  easier: ['Leg Press'],
  current: 'Hack Squat',
  harder: ['Barbell Back Squat', 'Front Squat'],
  alternate: ['Bulgarian Split Squat']
},
```

**Step 2: Find and update LOWER_A_SLOT_2 (45° Hyperextension)**

Search for `LOWER_A_SLOT_2` and update:

```javascript
'LOWER_A_SLOT_2': {
  slotName: 'Posterior Chain/Hinge',
  easier: ['Glute Bridges'],
  current: '45° Hyperextension',
  harder: ['DB Romanian Deadlift', 'Barbell RDL'],
  alternate: ['Good Mornings']
},
```

**Step 3: Find and update LOWER_A_SLOT_3 (Hip Thrust)**

Search for `LOWER_A_SLOT_3` and update:

```javascript
'LOWER_A_SLOT_3': {
  slotName: 'Glute Isolation',
  easier: ['Bodyweight Hip Thrust', 'Glute Bridges'],
  current: 'Hip Thrust',
  harder: ['Weighted Hip Thrust', 'Single-leg Hip Thrust'],
  alternate: ['Cable Pull-Through']
},
```

**Step 4: Find and update LOWER_A_SLOT_4 (Leg Extension)**

Search for `LOWER_A_SLOT_4` and update:

```javascript
'LOWER_A_SLOT_4': {
  slotName: 'Quad Isolation',
  easier: ['Bodyweight Squats'],
  current: 'Leg Extension',
  harder: ['Weighted Leg Extension'],
  alternate: ['Sissy Squats']
},
```

**Step 5: Find and update LOWER_B_SLOT_1 (Leg Press)**

Search for `LOWER_B_SLOT_1` and update:

```javascript
'LOWER_B_SLOT_1': {
  slotName: 'Squat Compound',
  easier: ['Bodyweight Squats', 'Goblet Squat'],
  current: 'Leg Press',
  harder: ['Hack Squat', 'Barbell Back Squat'],
  alternate: ['Bulgarian Split Squat']
},
```

**Step 6: Find and update LOWER_B_SLOT_2 (DB Romanian Deadlift)**

Search for `LOWER_B_SLOT_2` and update:

```javascript
'LOWER_B_SLOT_2': {
  slotName: 'Hinge Compound',
  easier: ['45° Hyperextension', 'Glute Bridges'],
  current: 'DB Romanian Deadlift',
  harder: ['Barbell RDL', 'Conventional Deadlift'],
  alternate: ['Single-leg RDL']
},
```

**Step 7: Find and update LOWER_B_SLOT_3 (Leg Abduction)**

Search for `LOWER_B_SLOT_3` and update:

```javascript
'LOWER_B_SLOT_3': {
  slotName: 'Hip Abduction',
  easier: ['Bodyweight Side-lying Abduction'],
  current: 'Leg Abduction',
  harder: ['Weighted Cable Abduction', 'Single-leg Press'],
  alternate: ['Clamshells', 'Fire Hydrants']
},
```

**Step 8: Find and update LOWER_B_SLOT_4 (Leg Curl)**

Search for `LOWER_B_SLOT_4` and update:

```javascript
'LOWER_B_SLOT_4': {
  slotName: 'Hamstring Isolation',
  easier: ['Nordic Curls (assisted)'],
  current: 'Leg Curl',
  harder: ['Nordic Curls', 'Single-leg Curl'],
  alternate: ['Sliding Leg Curl']
},
```

**Step 9: Verify syntax**

Run: `node -c js/modules/progression-pathways.js`
Expected: No output (syntax valid)

**Step 10: Commit progression pathway updates**

```bash
git add js/modules/progression-pathways.js
git commit -m "refactor: update progression pathways for restructured lower workouts"
```

---

## Task 5: Update BUILD-SPECIFICATION.md Documentation

**Files:**
- Modify: `BUILD-SPECIFICATION.md:150-170`

**Step 1: Update LOWER_A exercise list**

Find the LOWER_A section (around line 150) and update:

```markdown
### LOWER_A – Machine Squat + Compound Emphasis

1. **Hack Squat** - 3 sets × 8-12 reps @ RIR 2-3
   * Tempo: 3 sec down, 2 sec up
   * Notes: Quad compound (vertical squat pattern)

2. **45° Hyperextension** - 3 sets × 10-12 reps @ RIR 2-3
   * Tempo: 3-4 sec down, 2 sec up
   * Notes: CRITICAL for weak lower back - bodyweight only, NOT to failure

3. **Hip Thrust** - 3 sets × 10-12 reps @ RIR 2-3
   * Tempo: 1 sec up, 2 sec down, 1 sec squeeze
   * Notes: Primary glute isolation

4. **Leg Extension** - 3 sets × 10-12 reps @ RIR 2-3
   * Tempo: 2 sec extend, 3 sec return
   * Notes: Quad isolation (pairs with Hack Squat)

5. **Standing Calf Raise** - 3 sets × 15-20 reps @ RIR 2-3
   * Tempo: Explosive up (1 sec), controlled down (2 sec)
   * Notes: Gastrocnemius (fast-twitch)

6. **Plank** - 3 sets × 30-60s
   * Notes: Core strength for lower back health
```

**Step 2: Update LOWER_B exercise list**

Find the LOWER_B section and update:

```markdown
### LOWER_B – Free Weight Hinge + Accessory Emphasis

1. **Leg Press** - 3 sets × 8-12 reps @ RIR 2-3
   * Tempo: 3 sec down, 2 sec up
   * Notes: Quads + glutes compound (horizontal push pattern)

2. **DB Romanian Deadlift** - 3 sets × 10-12 reps @ RIR 2-3
   * Tempo: 3 sec down, 2 sec up
   * Notes: Hamstrings, glutes, lower back - free weight (do when fresh)

3. **Leg Abduction** - 3 sets × 12-15 reps @ RIR 2-3
   * Tempo: 2 sec out, 2 sec in
   * Notes: Hip abductors (glute medius) - pairs with Hip Thrust (glute isolation in slot 3)

4. **Leg Curl** - 3 sets × 10-12 reps @ RIR 2-3
   * Tempo: 2 sec curl, 3 sec return
   * Notes: Hamstring isolation (pairs with DB RDL, analogous to Leg Extension in slot 4)

5. **Seated Calf Raise** - 3 sets × 15-20 reps @ RIR 2-3
   * Tempo: 3-5 sec (slow-twitch focus)
   * Notes: Soleus (slow-twitch dominant)

6. **Side Plank** - 3 sets × 30s/side
   * Notes: Obliques, glute medius
```

**Step 3: Add rationale section**

Add a new section explaining the restructure:

```markdown
### Lower Workout Restructure Rationale (2026-02-16)

**Balance achieved:**
- Each day: 1 squat compound + 1 hinge compound + matched isolation
- LOWER_A: Machine squat (Hack) + bodyweight hinge (Hyper) + quad/glute isolation
- LOWER_B: Machine squat (Leg Press) + free weight hinge (DB RDL) + hamstring/glute medius isolation

**Equipment utilization:**
- Uses BOTH Leg Press and Hack Squat (different movement patterns)
- Balances free weight fatigue (only 1 free weight compound per day)
- Removed redundant DB Goblet Squat (limited by grip/weight ceiling)

**Muscle coverage per week:**
- Quads: 2 compounds + 1 isolation = 3 exercises
- Hamstrings: 2 compounds + 1 isolation = 3 exercises
- Glutes (max + medius): 5 exercises total
- Complete core and calf coverage
```

**Step 4: Commit documentation**

```bash
git add BUILD-SPECIFICATION.md
git commit -m "docs: update BUILD-SPECIFICATION for restructured lower workouts"
```

---

## Task 6: Bump Service Worker Cache Version

**Files:**
- Modify: `sw.js:1`

**Step 1: Update cache version**

Change line 1 from:

```javascript
const CACHE_NAME = 'build-tracker-v66';
```

To:

```javascript
const CACHE_NAME = 'build-tracker-v67';
```

**Step 2: Commit service worker update**

```bash
git add sw.js
git commit -m "chore: bump service worker cache to v67 for lower workout restructure"
```

---

## Task 7: Browser Testing

**Step 1: Start local server**

```bash
python3 -m http.server 8000
```

**Step 2: Open browser and hard refresh**

1. Navigate to `http://localhost:8000`
2. Hard refresh: Ctrl+Shift+R (to get v67 service worker)
3. Open DevTools Console (F12)

**Step 3: Verify workout definitions**

```javascript
// Check LOWER_A exercises
const lowerA = window.app.workoutManager.getWorkout('LOWER_A');
console.log(lowerA.exercises.map(e => e.name));
// Expected: ['Hack Squat', '45° Hyperextension', 'Hip Thrust', 'Leg Extension', 'Standing Calf Raise', 'Plank']

// Check LOWER_B exercises
const lowerB = window.app.workoutManager.getWorkout('LOWER_B');
console.log(lowerB.exercises.map(e => e.name));
// Expected: ['Leg Press', 'DB Romanian Deadlift', 'Leg Abduction', 'Leg Curl', 'Seated Calf Raise', 'Side Plank']
```

**Step 4: Verify default selections**

```javascript
// Check default exercise selections
const defaults = window.app.storage.getExerciseSelections();
console.log('LOWER_A_SLOT_1:', defaults['LOWER_A_SLOT_1']); // Expected: 'Hack Squat'
console.log('LOWER_A_SLOT_2:', defaults['LOWER_A_SLOT_2']); // Expected: '45° Hyperextension'
console.log('LOWER_A_SLOT_3:', defaults['LOWER_A_SLOT_3']); // Expected: 'Hip Thrust'
console.log('LOWER_A_SLOT_4:', defaults['LOWER_A_SLOT_4']); // Expected: 'Leg Extension'
console.log('LOWER_B_SLOT_1:', defaults['LOWER_B_SLOT_1']); // Expected: 'Leg Press'
console.log('LOWER_B_SLOT_2:', defaults['LOWER_B_SLOT_2']); // Expected: 'DB Romanian Deadlift'
console.log('LOWER_B_SLOT_3:', defaults['LOWER_B_SLOT_3']); // Expected: 'Leg Abduction'
console.log('LOWER_B_SLOT_4:', defaults['LOWER_B_SLOT_4']); // Expected: 'Leg Curl'
```

**Step 5: Test UI rendering**

1. Click "LOWER A" workout from home screen
2. Verify exercises display in correct order:
   - Hack Squat
   - 45° Hyperextension
   - Hip Thrust
   - Leg Extension
   - Standing Calf Raise
   - Plank

3. Go back to home, click "LOWER B" workout
4. Verify exercises display in correct order:
   - Leg Press
   - DB Romanian Deadlift
   - Leg Abduction
   - Leg Curl
   - Seated Calf Raise
   - Side Plank

**Step 6: Test Browse Progressions**

1. From any workout, click "Browse Progressions"
2. Select each LOWER slot
3. Verify progression pathways show correct exercises

**Expected results:**
- No JavaScript errors in console
- All exercises render correctly
- Workout flow works (log sets, complete workout)
- Service worker updated to v67

---

## Task 8: Final Commit and Push

**Step 1: Verify all changes committed**

```bash
git log --oneline -8
```

Expected: 7 commits
1. Update LOWER_A exercises
2. Update LOWER_B exercises
3. Update default selections
4. Update progression pathways
5. Update BUILD-SPECIFICATION
6. Bump service worker
7. (Any fixes from testing)

**Step 2: Push to remote**

```bash
git push origin main
```

**Step 3: Verify GitHub shows all commits**

Visit repository on GitHub and confirm all commits are visible.

---

## Success Criteria

✅ LOWER_A has: Hack Squat, 45° Hyper, Hip Thrust, Leg Extension, Standing Calf, Plank
✅ LOWER_B has: Leg Press, DB RDL, Leg Abduction, Leg Curl, Seated Calf, Side Plank
✅ Default selections match new structure
✅ Progression pathways updated for all 8 swapped slots
✅ Documentation updated in BUILD-SPECIFICATION.md
✅ Service worker bumped to v67
✅ Browser testing shows no errors
✅ All 7 commits pushed to remote

---

## Rollback Plan (If Issues Found)

If critical bugs discovered after deployment:

```bash
# Revert to previous commit
git revert HEAD~7..HEAD

# Or hard reset (if not pushed to shared branch)
git reset --hard HEAD~7

# Update service worker to v68
# Change sw.js line 1: const CACHE_NAME = 'build-tracker-v68';

# Commit and push
git add sw.js
git commit -m "revert: rollback lower workout restructure"
git push origin main
```

Users will need hard refresh (Ctrl+Shift+R) to get rollback.
