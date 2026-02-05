# Missing UX Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Implement all 11 missing UX features from the original design specifications to transform the basic CRUD interface into the polished, gym-ready experience designed for this app.

**Architecture:** Build upon existing progressive disclosure foundation (Tasks 14-18) to add: sticky input areas, LOG SET button workflow, progressive unlocking, custom number inputs, post-set feedback, RIR dropdowns, cycle tracking, recovery confirmation, warm-up protocols, machine badges, and deload system.

**Tech Stack:** Vanilla JavaScript (ES6 modules), CSS Grid/Flexbox, localStorage, no external dependencies

---

## Implementation Status: COMPLETE

All 11 missing UX features implemented:
- ✅ Task 19: Warm-up protocol section
- ✅ Task 20: RIR dropdown with color coding
- ✅ Task 21: Machine usage info badges
- ✅ Task 22: Cycle progress tracking
- ✅ Task 23: Recovery warning confirmation
- ✅ Task 24: Progressive set unlocking
- ✅ Task 25: Sticky input with LOG SET button
- ✅ Task 26: Post-set feedback messages
- ✅ Task 27: Custom number input overlay
- ✅ Task 28-29: Automated deload system
- ✅ Task 30: Documentation and testing

Implementation date: 2026-02-05
Total commits: 12

---

## Context: What's Already Built

**Completed Features:**
- ✅ Tasks 1-6: Core backend (storage, workout manager, progression logic - 44 tests passing)
- ✅ Tasks 7-9: Basic UI (home screen, workout screen, set logging)
- ✅ Tasks 10-11: Service Worker and integration tests
- ✅ Tasks 12-13: Button fixes and favicon
- ✅ Tasks 14-18: Progressive disclosure (collapsible exercises, auto-advance, tap-to-expand)

**Current State:**
- Exercises expand/collapse based on currentExerciseIndex
- Set inputs render with weight/reps/RIR
- Default values from previous workout
- Auto-advance when all sets completed
- Tap to jump to exercises

**Missing Features (from design docs):**
1. Sticky input area with LOG SET button (60px tall, 1-tap logging)
2. Progressive set unlocking (Set 1 → Set 2/3 unlock with values)
3. Custom number input overlay (70x70px buttons, quick adjust)
4. Post-set feedback messages (confirmation + guidance)
5. Recovery warning confirmation (orange tap-to-confirm state)
6. Cycle progress tracking (current streak, deload countdown)
7. Warm-up protocol sections (workout-specific, collapsible)
8. RIR dropdown with color coding (Red 0-1, Green 2-3, Yellow 4+)
9. RIR helper tooltip ("RIR = Reps In Reserve...")
10. Machine usage info badges ("ℹ️ Machine OK when fatigued")
11. Automated deload system (triggers, types, flow)

---

## Task 19: Warm-Up Protocol Section

**Files:**
- Create: `src/css/warm-up.css`
- Modify: `src/js/app.js:198-260` (renderExercises)
- Modify: `src/js/modules/workouts.js:1-50` (add warmup definitions)
- Modify: `src/index.html:18` (add CSS link)

**Step 1: Add warm-up definitions to workouts.js**

Open `src/js/modules/workouts.js` and add warm-up data to each workout:

```javascript
// After existing imports, add warmup definitions
const WARMUPS = {
  UPPER_A: [
    'Cat-Cow: 10 reps',
    'Band Pull-Aparts: 15 reps',
    'Goblet Squat (bodyweight): 10 reps',
    'Hip Hinge Drill: 10 reps',
    'Ramp-up Set: 50% weight × 10 reps (Goblet Squat)'
  ],
  LOWER_A: [
    'Cat-Cow: 10 reps',
    'Band Pull-Aparts: 15 reps',
    'Bodyweight Squats: 10 reps',
    'Leg Swings: 10 per leg',
    'Ramp-up Set: 50% weight × 10 reps (first exercise)'
  ],
  UPPER_B: [
    'Dead Hang: 20-30 seconds',
    'Band Pull-Aparts: 15 reps',
    'Scapular Pull-Ups: 5 reps',
    'Arm Circles: 10 each direction',
    'Ramp-up Set: 50% weight × 10 reps (first exercise)'
  ],
  LOWER_B: [
    'Glute Bridges (bodyweight): 15 reps',
    'Leg Swings: 10 per leg',
    'Ankle Mobility: 10 reps per side',
    'Hip Flexor Stretch: 30s per side',
    'Ramp-up Set: 50% weight × 10 reps (first exercise)'
  ]
};

// Export warmups
export function getWarmup(workoutName) {
  return WARMUPS[workoutName] || [];
}
```

**Step 2: Create warm-up CSS**

Create `src/css/warm-up.css`:

```css
/* Warm-up Section Styles */
.warmup-section {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  margin-bottom: var(--spacing-md);
  overflow: hidden;
}

.warmup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  cursor: pointer;
  user-select: none;
}

.warmup-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--color-text);
}

.warmup-toggle {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.warmup-section.collapsed .warmup-toggle {
  transform: rotate(-90deg);
}

.warmup-checklist {
  padding: var(--spacing-sm);
  display: none;
}

.warmup-section:not(.collapsed) .warmup-checklist {
  display: block;
}

.warmup-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-xs) 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.warmup-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  margin-right: var(--spacing-xs);
  cursor: pointer;
}

.warmup-item.completed {
  opacity: 0.5;
  text-decoration: line-through;
}
```

**Step 3: Add warm-up rendering to app.js**

In `src/js/app.js`, modify `renderExercises()` to include warm-up section:

```javascript
import { getWarmup } from './modules/workouts.js';

// Inside renderExercises(), before exercise list rendering
renderExercises() {
  const exerciseList = document.getElementById('exercise-list');
  if (!exerciseList || !this.currentWorkout) return;

  // Initialize workout session data
  this.workoutSession = {
    workoutName: this.currentWorkout.name,
    startTime: new Date(),
    exercises: [],
    warmupCompleted: false
  };

  // Render warm-up section
  const warmupHtml = this.renderWarmupSection();

  // Render exercises
  const exercisesHtml = this.currentWorkout.exercises.map((exercise, index) => {
    // ... existing exercise rendering code
  }).join('');

  exerciseList.innerHTML = warmupHtml + exercisesHtml;

  // Attach listeners
  this.attachSetInputListeners();
  this.attachWarmupListeners();

  // ... rest of method
}

renderWarmupSection() {
  const warmupItems = getWarmup(this.currentWorkout.name);
  if (warmupItems.length === 0) return '';

  const itemsHtml = warmupItems.map((item, index) => `
    <div class="warmup-item" data-warmup-index="${index}">
      <input type="checkbox" id="warmup-${index}" />
      <label for="warmup-${index}">${this.escapeHtml(item)}</label>
    </div>
  `).join('');

  return `
    <div class="warmup-section collapsed">
      <div class="warmup-header">
        <h3>📋 Warm-Up Protocol</h3>
        <span class="warmup-toggle">▼</span>
      </div>
      <div class="warmup-checklist">
        ${itemsHtml}
      </div>
    </div>
  `;
}

attachWarmupListeners() {
  // Toggle warmup section
  const warmupHeader = document.querySelector('.warmup-header');
  if (warmupHeader) {
    warmupHeader.addEventListener('click', () => {
      const section = warmupHeader.closest('.warmup-section');
      section.classList.toggle('collapsed');
    });
  }

  // Track warmup completion
  const warmupChecks = document.querySelectorAll('.warmup-item input[type="checkbox"]');
  warmupChecks.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const item = e.target.closest('.warmup-item');
      item.classList.toggle('completed', e.target.checked);

      // Check if all warmups completed
      const allChecked = Array.from(warmupChecks).every(cb => cb.checked);
      if (allChecked && this.workoutSession) {
        this.workoutSession.warmupCompleted = true;
      }
    });
  });
}
```

**Step 4: Add CSS link to index.html**

```html
<link rel="stylesheet" href="css/warm-up.css">
```

**Step 5: Test warm-up section**

Run: `python3 -m http.server 8000`

Expected behavior:
- Warm-up section appears at top of exercise list
- Starts collapsed (only header visible)
- Click header expands to show checklist
- Checking items marks them complete (strikethrough + opacity)
- All items checked sets workoutSession.warmupCompleted = true

**Step 6: Commit**

```bash
git add src/css/warm-up.css src/js/app.js src/js/modules/workouts.js src/index.html
git commit -m "feat: add workout-specific warm-up protocol section

Implements collapsible warm-up checklist with workout-specific exercises.
Users can track completion before starting main workout.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 20: RIR Dropdown with Color Coding

**Files:**
- Modify: `src/css/workout-screen.css:100-150` (add RIR dropdown styles)
- Modify: `src/js/app.js:262-327` (renderSets method)

**Step 1: Update renderSets to use dropdown instead of number input**

In `src/js/app.js`, replace RIR input with dropdown:

```javascript
renderSets(exercise, lastWorkout, exerciseIndex) {
  let html = '';

  for (let setNum = 1; setNum <= exercise.sets; setNum++) {
    const lastSet = lastWorkout?.sets?.[setNum - 1];
    const defaultWeight = lastSet?.weight || exercise.startingWeight;
    const defaultReps = lastSet?.reps || '';

    // Default RIR to minimum of target range
    const defaultRir = lastSet?.rir ?? (() => {
      const [min] = exercise.rirTarget.split('-').map(Number);
      return min;
    })();

    html += `
      <div class="set-row">
        <span class="set-label">Set ${setNum}</span>

        <div class="set-inputs">
          <label class="input-label">Weight (kg)</label>
          <input
            type="number"
            class="set-input"
            data-exercise="${exerciseIndex}"
            data-set="${setNum - 1}"
            data-field="weight"
            value="${defaultWeight}"
            step="0.5"
            min="0"
          />
        </div>

        <div class="set-inputs">
          <label class="input-label">Reps</label>
          <input
            type="number"
            class="set-input"
            data-exercise="${exerciseIndex}"
            data-set="${setNum - 1}"
            data-field="reps"
            value="${defaultReps}"
            min="0"
            placeholder="0"
          />
        </div>

        <div class="set-inputs">
          <label class="input-label">
            RIR
            <span class="rir-help" title="Reps In Reserve - How many more reps you could do">ℹ️</span>
          </label>
          <select
            class="set-input rir-select"
            data-exercise="${exerciseIndex}"
            data-set="${setNum - 1}"
            data-field="rir"
          >
            <option value="0" ${defaultRir === 0 ? 'selected' : ''}>0 (Failure)</option>
            <option value="1" ${defaultRir === 1 ? 'selected' : ''}>1</option>
            <option value="2" ${defaultRir === 2 ? 'selected' : ''}>2 (Target)</option>
            <option value="3" ${defaultRir === 3 ? 'selected' : ''}>3 (Target)</option>
            <option value="4" ${defaultRir === 4 ? 'selected' : ''}>4</option>
            <option value="5" ${defaultRir >= 5 ? 'selected' : ''}>5+</option>
          </select>
        </div>
      </div>
    `;
  }

  return html;
}
```

**Step 2: Add RIR dropdown color coding CSS**

In `src/css/workout-screen.css`, add:

```css
/* RIR Dropdown Styling */
.rir-select {
  appearance: none;
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  color: var(--color-text);
  padding: var(--spacing-xs);
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Color coding based on selected value */
.rir-select[value="0"],
.rir-select[value="1"] {
  border-color: var(--color-danger);
  background: rgba(244, 67, 54, 0.1);
}

.rir-select[value="2"],
.rir-select[value="3"] {
  border-color: var(--color-success);
  background: rgba(76, 175, 80, 0.1);
}

.rir-select[value="4"],
.rir-select[value="5"] {
  border-color: var(--color-warning);
  background: rgba(255, 152, 0, 0.1);
}

/* RIR help icon */
.rir-help {
  display: inline-block;
  width: 16px;
  height: 16px;
  font-size: 12px;
  cursor: help;
  opacity: 0.7;
  margin-left: 4px;
}

.rir-help:hover {
  opacity: 1;
}
```

**Step 3: Update handleSetInput to update color on change**

In `src/js/app.js`, add color update logic:

```javascript
handleSetInput(event) {
  const input = event.target;
  const exerciseIndex = parseInt(input.dataset.exercise);
  const setIndex = parseInt(input.dataset.set);
  const field = input.dataset.field;
  const value = parseFloat(input.value);

  // Validate input
  if (isNaN(value) || value < 0) return;
  if (field === 'rir' && value > 10) return;

  // Update color for RIR dropdown
  if (field === 'rir' && input.tagName === 'SELECT') {
    input.setAttribute('value', value.toString());
  }

  // ... rest of existing handleSetInput logic
}
```

**Step 4: Test RIR dropdown**

Expected behavior:
- RIR shows as dropdown with 0, 1, 2, 3, 4, 5+ options
- Red background for 0-1 (too close to failure)
- Green background for 2-3 (target zone)
- Yellow background for 4-5+ (too easy)
- Hover ℹ️ shows tooltip "Reps In Reserve - How many more reps you could do"
- Default value is minimum of target range (e.g., 2 for "2-3")

**Step 5: Commit**

```bash
git add src/css/workout-screen.css src/js/app.js
git commit -m "feat: replace RIR number input with color-coded dropdown

Adds visual feedback for RIR values:
- Red: 0-1 (too close to failure)
- Green: 2-3 (target zone)
- Yellow: 4+ (too easy)

Includes helper tooltip explaining RIR concept.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 21: Machine Usage Info Badges

**Files:**
- Modify: `src/js/modules/workouts.js:50-200` (add machineOk flags)
- Modify: `src/js/app.js:230-250` (renderExercises - add badge)
- Modify: `src/css/workout-screen.css:50-80` (badge styles)

**Step 1: Add machineOk flags to exercises**

In `src/js/modules/workouts.js`, add `machineOk` property to relevant exercises:

```javascript
// Example for UPPER_A
export const UPPER_A = {
  name: 'UPPER_A',
  displayName: 'Upper Body A',
  exercises: [
    {
      name: 'Goblet Squat',
      sets: 3,
      repRange: '8-12',
      rirTarget: '2-3',
      startingWeight: 10,
      weightIncrement: 2.5,
      notes: 'Controlled descent, core braced. Forces proper bracing.',
      machineOk: false
    },
    {
      name: 'Dumbbell Bench Press',
      sets: 3,
      repRange: '8-12',
      rirTarget: '2-3',
      startingWeight: 7.5,
      weightIncrement: 2.5,
      notes: 'Neutral grip allowed for shoulder comfort.',
      machineOk: true  // Machine chest press OK when fatigued
    },
    {
      name: 'Seated Cable Row',
      sets: 3,
      repRange: '10-12',
      rirTarget: '2-3',
      startingWeight: 20,
      weightIncrement: 2.5,
      notes: '1-second pause at contraction.',
      machineOk: true  // Already a cable machine
    },
    // ... add machineOk to other exercises
  ]
};
```

**Step 2: Add machine badge rendering**

In `src/js/app.js`, update exercise header rendering:

```javascript
// Inside renderExercises() map function
return `
  <div class="exercise-item ${stateClass}" data-exercise-index="${index}">
    <div class="exercise-header">
      <h3 class="exercise-name">${this.escapeHtml(exercise.name)}</h3>
      <div class="exercise-badges">
        ${this.renderProgressionBadge(exercise, history)}
        ${exercise.machineOk ? '<span class="machine-badge" title="Machine version OK when fatigued">ℹ️ Machine OK</span>' : ''}
      </div>
    </div>

    <!-- rest of exercise card -->
  </div>
`;
```

**Step 3: Style machine badge**

In `src/css/workout-screen.css`:

```css
.exercise-badges {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.machine-badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  background: rgba(33, 150, 243, 0.2);
  border: 1px solid rgba(33, 150, 243, 0.5);
  border-radius: 4px;
  color: var(--color-info);
  cursor: help;
}

.machine-badge:hover {
  background: rgba(33, 150, 243, 0.3);
}
```

**Step 4: Test machine badges**

Expected behavior:
- "ℹ️ Machine OK" badge appears on exercises with machineOk: true
- Hover shows tooltip "Machine version OK when fatigued"
- Badge appears next to progression badge in header
- Doesn't appear on exercises where machineOk: false

**Step 5: Commit**

```bash
git add src/js/modules/workouts.js src/js/app.js src/css/workout-screen.css
git commit -m "feat: add machine usage info badges to exercises

Displays 'Machine OK' badge on exercises where machine variants
are acceptable when fatigued (per design spec).

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 22: Cycle Progress Tracking on Home Screen

**Files:**
- Modify: `src/js/modules/storage.js:50-100` (add cycle tracking)
- Modify: `src/js/modules/workout-manager.js:100-150` (update completeWorkout)
- Modify: `src/js/app.js:32-70` (updateHomeScreen - add cycle display)
- Modify: `src/css/home-screen.css:50-100` (cycle progress styles)

**Step 1: Add cycle tracking to storage schema**

In `src/js/modules/storage.js`, update rotation structure:

```javascript
getRotation() {
  const data = this.getData();
  return data.rotation || {
    lastWorkout: null,
    lastDate: null,
    sequence: [],
    cycleCount: 0,        // NEW: completed cycles
    currentStreak: 0,     // NEW: consecutive workouts
    lastDeloadDate: null  // NEW: last deload date
  };
}

saveRotation(rotation) {
  const data = this.getData();
  data.rotation = rotation;
  this.saveData(data);
}
```

**Step 2: Update workout completion to increment cycles**

In `src/js/modules/workout-manager.js`:

```javascript
completeWorkout(workoutName) {
  const rotation = this.storage.getRotation();
  const lastWorkout = rotation.lastWorkout;

  // Update rotation
  rotation.lastWorkout = workoutName;
  rotation.lastDate = new Date().toISOString();
  rotation.sequence = [...(rotation.sequence || []), workoutName].slice(-12); // Keep last 12
  rotation.currentStreak = (rotation.currentStreak || 0) + 1;

  // Increment cycle count when completing full rotation
  const fullCycle = this.detectFullCycle(rotation.sequence);
  if (fullCycle) {
    rotation.cycleCount = (rotation.cycleCount || 0) + 1;
  }

  // Update muscle recovery times
  this.updateMuscleRecoveryTimes(workoutName);

  this.storage.saveRotation(rotation);
}

detectFullCycle(sequence) {
  // Detect when user completes A→B→C→D (or any full rotation)
  if (sequence.length < 4) return false;

  const recent4 = sequence.slice(-4);
  const uniqueWorkouts = new Set(recent4);

  // Full cycle = all 4 workouts completed
  return uniqueWorkouts.size === 4;
}
```

**Step 3: Display cycle progress on home screen**

In `src/js/app.js`, add to `updateHomeScreen()`:

```javascript
updateHomeScreen() {
  // ... existing code for next workout and last trained ...

  // Add cycle progress display
  const rotation = this.storage.getRotation();
  const cycleProgressEl = document.getElementById('cycle-progress');

  if (cycleProgressEl) {
    const cycleCount = rotation.cycleCount || 0;
    const streak = rotation.currentStreak || 0;
    const nextDeload = 8 - (cycleCount % 8); // Deload every 8 cycles

    cycleProgressEl.innerHTML = `
      <div class="progress-item">
        <span class="progress-label">🎯 Current Streak:</span>
        <span class="progress-value">${streak} workouts</span>
      </div>
      <div class="progress-item">
        <span class="progress-label">Next Deload:</span>
        <span class="progress-value">${nextDeload} workouts away</span>
      </div>
    `;
  }

  // Update recovery status
  this.updateRecoveryStatus(nextWorkoutName);
}
```

**Step 4: Add cycle progress HTML to index.html**

In `src/index.html`, add to home screen:

```html
<div id="home-screen" class="screen active">
  <!-- existing content -->

  <div id="cycle-progress" class="cycle-progress">
    <!-- populated by JavaScript -->
  </div>

  <div id="recovery-status" class="recovery-status">
    <!-- existing recovery status -->
  </div>
</div>
```

**Step 5: Style cycle progress**

In `src/css/home-screen.css`:

```css
.cycle-progress {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.progress-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
  font-size: 16px;
}

.progress-label {
  color: var(--color-text-secondary);
}

.progress-value {
  font-weight: 600;
  color: var(--color-primary);
}
```

**Step 6: Test cycle tracking**

Expected behavior:
- After completing workout, cycleCount increments when full A→B→C→D rotation done
- currentStreak increments on every workout completion
- Home screen shows "🎯 Current Streak: N workouts"
- Home screen shows "Next Deload: N workouts away" (counting down from 8)

**Step 7: Commit**

```bash
git add src/js/modules/storage.js src/js/modules/workout-manager.js src/js/app.js src/index.html src/css/home-screen.css
git commit -m "feat: add cycle progress tracking to home screen

Tracks completed cycles and current workout streak.
Displays countdown to next deload (every 8 cycles).

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 23: Recovery Warning Confirmation Flow

**Files:**
- Modify: `src/js/app.js:130-158` (startWorkout - add recovery check)
- Create: `src/css/recovery-modal.css`
- Modify: `src/index.html:50` (add modal HTML)
- Modify: `src/index.html:18` (add CSS link)

**Step 1: Add recovery modal HTML**

In `src/index.html`, before closing `</body>`:

```html
<!-- Recovery Warning Modal -->
<div id="recovery-modal" class="modal" style="display: none;">
  <div class="modal-content recovery-warning">
    <h2>⚠️ Recovery Check</h2>
    <div id="recovery-modal-body">
      <!-- populated by JavaScript -->
    </div>
    <div class="modal-actions">
      <button id="wait-recovery-btn" class="btn btn-primary">Wait Until Tomorrow</button>
      <button id="train-anyway-btn" class="btn btn-secondary">Train Anyway - I Feel Great</button>
    </div>
  </div>
</div>
```

**Step 2: Check recovery before starting workout**

In `src/js/app.js`, modify `startWorkout()`:

```javascript
startWorkout() {
  const nextWorkoutName = this.workoutManager.getNextWorkout();

  // Check muscle recovery
  const recoveryCheck = this.workoutManager.checkMuscleRecovery(nextWorkoutName);

  if (recoveryCheck.warn) {
    this.showRecoveryWarning(nextWorkoutName, recoveryCheck);
    return; // Don't start workout yet
  }

  // Proceed with workout start
  this.proceedWithWorkout(nextWorkoutName);
}

showRecoveryWarning(workoutName, recoveryCheck) {
  const modal = document.getElementById('recovery-modal');
  const body = document.getElementById('recovery-modal-body');

  const rotation = this.storage.getRotation();
  const lastDate = new Date(rotation.lastDate);
  const hoursAgo = Math.floor((new Date() - lastDate) / (1000 * 60 * 60));

  body.innerHTML = `
    <p class="recovery-time">Last workout: ${hoursAgo} hours ago</p>

    <div class="muscles-recovering">
      <p><strong>Muscles still recovering:</strong></p>
      <ul>
        ${recoveryCheck.muscles.map(m => `
          <li>• ${m.name}: Need ${m.hoursNeeded} more hours</li>
        `).join('')}
      </ul>
    </div>

    <div class="recovery-advice">
      <p>Training too soon may:</p>
      <ul>
        <li>• Compromise form quality</li>
        <li>• Limit performance gains</li>
        <li>• Increase injury risk</li>
      </ul>
    </div>

    <p class="recovery-recommendation">
      <strong>Recommended:</strong> Wait until tomorrow (48hr mark)
    </p>
  `;

  modal.style.display = 'flex';

  // Attach handlers
  document.getElementById('wait-recovery-btn').onclick = () => {
    modal.style.display = 'none';
  };

  document.getElementById('train-anyway-btn').onclick = () => {
    modal.style.display = 'none';
    this.proceedWithWorkout(workoutName);
  };
}

proceedWithWorkout(workoutName) {
  this.currentWorkout = getWorkout(workoutName);
  this.currentExerciseIndex = 0;

  if (!this.currentWorkout) {
    console.error(`Cannot start workout: ${workoutName} not found`);
    return;
  }

  // Switch to workout screen
  const homeScreen = document.getElementById('home-screen');
  const workoutScreen = document.getElementById('workout-screen');
  if (homeScreen && workoutScreen) {
    homeScreen.classList.remove('active');
    workoutScreen.classList.add('active');
  }

  // Update workout screen title
  const titleEl = document.getElementById('workout-title');
  if (titleEl) {
    titleEl.textContent = this.currentWorkout.displayName;
  }

  // Start timer
  this.startTimer();

  // Render exercises
  this.renderExercises();
}
```

**Step 3: Create recovery modal styles**

Create `src/css/recovery-modal.css`:

```css
/* Recovery Warning Modal */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-md);
}

.modal-content {
  background: var(--color-bg-primary);
  border-radius: 12px;
  padding: var(--spacing-lg);
  max-width: 500px;
  width: 100%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.recovery-warning h2 {
  color: var(--color-warning);
  margin-top: 0;
  font-size: 24px;
}

.recovery-time {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.muscles-recovering,
.recovery-advice {
  background: rgba(255, 152, 0, 0.1);
  border-left: 4px solid var(--color-warning);
  padding: var(--spacing-sm);
  margin: var(--spacing-md) 0;
  border-radius: 4px;
}

.muscles-recovering ul,
.recovery-advice ul {
  margin: var(--spacing-xs) 0 0 0;
  padding-left: var(--spacing-md);
}

.muscles-recovering li,
.recovery-advice li {
  margin: var(--spacing-xs) 0;
  color: var(--color-text);
}

.recovery-recommendation {
  font-size: 16px;
  background: rgba(102, 126, 234, 0.1);
  padding: var(--spacing-sm);
  border-radius: 4px;
  border-left: 4px solid var(--color-primary);
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

.modal-actions .btn {
  width: 100%;
  padding: var(--spacing-sm);
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  font-weight: 600;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-secondary {
  background: transparent;
  color: var(--color-text);
  border: 2px solid var(--color-border);
}
```

**Step 4: Add CSS link**

In `src/index.html`:

```html
<link rel="stylesheet" href="css/recovery-modal.css">
```

**Step 5: Test recovery warning**

Expected behavior:
- When starting workout within 48 hours of last session
- Modal appears with orange warning styling
- Shows hours since last workout
- Lists muscles needing recovery with hours needed
- Two buttons:
  - "Wait Until Tomorrow" → closes modal, stays on home screen
  - "Train Anyway" → closes modal, proceeds to workout screen

**Step 6: Commit**

```bash
git add src/css/recovery-modal.css src/js/app.js src/index.html
git commit -m "feat: add recovery warning confirmation flow

Shows modal when starting workout within 48hr recovery window.
User must confirm to proceed with workout.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 24: Progressive Set Unlocking

**Files:**
- Modify: `src/js/app.js:262-327` (renderSets - disable inputs)
- Modify: `src/js/app.js:394-422` (handleSetInput - unlock next set)
- Modify: `src/css/workout-screen.css:150-200` (disabled state styles)

**Step 1: Disable sets beyond Set 1 initially**

In `src/js/app.js`, modify `renderSets()`:

```javascript
renderSets(exercise, lastWorkout, exerciseIndex) {
  let html = '';

  for (let setNum = 1; setNum <= exercise.sets; setNum++) {
    const lastSet = lastWorkout?.sets?.[setNum - 1];
    const defaultWeight = lastSet?.weight || exercise.startingWeight;
    const defaultReps = lastSet?.reps || '';

    const defaultRir = lastSet?.rir ?? (() => {
      const [min] = exercise.rirTarget.split('-').map(Number);
      return min;
    })();

    // Only Set 1 is enabled initially
    const isLocked = setNum > 1;
    const disabledAttr = isLocked ? 'disabled' : '';
    const lockedClass = isLocked ? 'locked' : '';

    html += `
      <div class="set-row ${lockedClass}" data-set-number="${setNum}">
        <span class="set-label">
          Set ${setNum}
          ${isLocked ? '<span class="lock-icon">🔒</span>' : ''}
        </span>

        <div class="set-inputs">
          <label class="input-label">Weight (kg)</label>
          <input
            type="number"
            class="set-input"
            data-exercise="${exerciseIndex}"
            data-set="${setNum - 1}"
            data-field="weight"
            value="${defaultWeight}"
            step="0.5"
            min="0"
            ${disabledAttr}
          />
        </div>

        <div class="set-inputs">
          <label class="input-label">Reps</label>
          <input
            type="number"
            class="set-input"
            data-exercise="${exerciseIndex}"
            data-set="${setNum - 1}"
            data-field="reps"
            value="${defaultReps}"
            min="0"
            placeholder="0"
            ${disabledAttr}
          />
        </div>

        <div class="set-inputs">
          <label class="input-label">
            RIR
            <span class="rir-help" title="Reps In Reserve">ℹ️</span>
          </label>
          <select
            class="set-input rir-select"
            data-exercise="${exerciseIndex}"
            data-set="${setNum - 1}"
            data-field="rir"
            ${disabledAttr}
          >
            <option value="0" ${defaultRir === 0 ? 'selected' : ''}>0 (Failure)</option>
            <option value="1" ${defaultRir === 1 ? 'selected' : ''}>1</option>
            <option value="2" ${defaultRir === 2 ? 'selected' : ''}>2 (Target)</option>
            <option value="3" ${defaultRir === 3 ? 'selected' : ''}>3 (Target)</option>
            <option value="4" ${defaultRir === 4 ? 'selected' : ''}>4</option>
            <option value="5" ${defaultRir >= 5 ? 'selected' : ''}>5+</option>
          </select>
        </div>
      </div>
    `;
  }

  return html;
}
```

**Step 2: Unlock next set when current set completed**

In `src/js/app.js`, add unlock logic to `handleSetInput()`:

```javascript
handleSetInput(event) {
  const input = event.target;
  const exerciseIndex = parseInt(input.dataset.exercise);
  const setIndex = parseInt(input.dataset.set);
  const field = input.dataset.field;
  const value = parseFloat(input.value);

  // Validate input
  if (isNaN(value) || value < 0) return;
  if (field === 'rir' && value > 10) return;

  // Update color for RIR dropdown
  if (field === 'rir' && input.tagName === 'SELECT') {
    input.setAttribute('value', value.toString());
  }

  // Ensure sets array exists for this exercise
  const exercise = this.workoutSession.exercises[exerciseIndex];
  if (!exercise.sets[setIndex]) {
    exercise.sets[setIndex] = { weight: 0, reps: 0, rir: 0 };
  }

  // Update the value
  exercise.sets[setIndex][field] = value;

  // Check if this set is complete
  const set = exercise.sets[setIndex];
  if (set.weight > 0 && set.reps > 0 && set.rir >= 0) {
    this.checkSetProgression(exerciseIndex, setIndex);

    // Unlock next set
    this.unlockNextSet(exerciseIndex, setIndex);

    // Check if all sets completed for current exercise
    this.checkExerciseCompletion(exerciseIndex);
  }
}

unlockNextSet(exerciseIndex, completedSetIndex) {
  const exerciseDef = this.currentWorkout.exercises[exerciseIndex];
  const nextSetIndex = completedSetIndex + 1;

  // Don't unlock beyond total sets
  if (nextSetIndex >= exerciseDef.sets) return;

  // Find next set row
  const exerciseItem = document.querySelector(
    `.exercise-item[data-exercise-index="${exerciseIndex}"]`
  );

  if (!exerciseItem) return;

  const nextSetRow = exerciseItem.querySelector(
    `.set-row[data-set-number="${nextSetIndex + 1}"]`
  );

  if (!nextSetRow) return;

  // Remove locked state
  nextSetRow.classList.remove('locked');

  // Enable inputs
  const inputs = nextSetRow.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.disabled = false;
  });

  // Remove lock icon
  const lockIcon = nextSetRow.querySelector('.lock-icon');
  if (lockIcon) lockIcon.remove();

  // Pre-fill with values from completed set
  const completedSet = this.workoutSession.exercises[exerciseIndex].sets[completedSetIndex];

  // Weight input
  const weightInput = nextSetRow.querySelector('[data-field="weight"]');
  if (weightInput && completedSet.weight) {
    weightInput.value = completedSet.weight;
  }

  // Reps input - leave empty for user to fill
  // RIR select - keep default
}
```

**Step 3: Style locked sets**

In `src/css/workout-screen.css`:

```css
/* Locked set styling */
.set-row.locked {
  opacity: 0.4;
  pointer-events: none;
}

.set-row.locked .set-input {
  background: var(--color-bg-secondary);
  cursor: not-allowed;
}

.lock-icon {
  font-size: 14px;
  margin-left: 4px;
  opacity: 0.6;
}

/* Unlock animation */
.set-row:not(.locked) {
  animation: unlock 0.3s ease;
}

@keyframes unlock {
  from {
    opacity: 0.4;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Step 4: Test progressive unlocking**

Expected behavior:
- On exercise expand, only Set 1 inputs are enabled
- Sets 2 and 3 show lock icon 🔒 and are grayed out
- When Set 1 completed (weight + reps + RIR entered):
  - Set 2 unlocks with animation
  - Set 2 weight pre-fills with Set 1 weight
  - Set 2 reps and RIR are empty/default
- When Set 2 completed, Set 3 unlocks similarly

**Step 5: Commit**

```bash
git add src/js/app.js src/css/workout-screen.css
git commit -m "feat: implement progressive set unlocking

Sets 2 and 3 start locked. Unlock when previous set completed.
Next set pre-fills weight from completed set.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 25: Sticky Input Area with LOG SET Button

**Files:**
- Modify: `src/js/app.js:262-327` (renderSets - add LOG SET button)
- Create: `src/css/sticky-input.css`
- Modify: `src/index.html:18` (add CSS link)
- Modify: `src/js/app.js:394-422` (handleSetInput - LOG SET handler)

**Step 1: Create sticky input area HTML in renderSets**

In `src/js/app.js`, modify `renderSets()` to add LOG SET button:

```javascript
renderSets(exercise, lastWorkout, exerciseIndex) {
  let html = '';

  for (let setNum = 1; setNum <= exercise.sets; setNum++) {
    // ... existing set rendering code ...

    // Add LOG SET button only for current (unlocked) set
    const isLocked = setNum > 1;
    const logButtonHtml = !isLocked ? `
      <button
        class="log-set-btn"
        data-exercise="${exerciseIndex}"
        data-set="${setNum - 1}"
      >
        LOG SET ${setNum}
      </button>
    ` : '';

    html += `
      <div class="set-row ${lockedClass}" data-set-number="${setNum}">
        <!-- existing set inputs -->

        ${logButtonHtml}
      </div>
    `;
  }

  return html;
}
```

**Step 2: Make current set input area sticky**

Update rendering to wrap current set in sticky container:

```javascript
// In renderExercises(), for current exercise only
if (index === this.currentExerciseIndex) {
  stateClass = 'current';

  // Wrap sets container to make current set sticky
  const setsHtml = this.renderSets(exercise, lastWorkout, index);

  return `
    <div class="exercise-item ${stateClass}" data-exercise-index="${index}">
      <!-- exercise header -->

      <div class="sets-container">
        <div class="sticky-input-area">
          <!-- Only current set shown here, updated dynamically -->
        </div>
        <div class="all-sets">
          ${setsHtml}
        </div>
      </div>
    </div>
  `;
}
```

Actually, simpler approach - make the current unlocked set sticky:

```javascript
renderSets(exercise, lastWorkout, exerciseIndex) {
  let html = '';
  let currentSetIndex = 0;

  // Determine which set is current (first incomplete)
  const sessionExercise = this.workoutSession?.exercises[exerciseIndex];
  if (sessionExercise) {
    currentSetIndex = sessionExercise.sets.findIndex(s =>
      !s || s.reps === 0 || !s.weight || s.rir === undefined
    );
    if (currentSetIndex === -1) currentSetIndex = exercise.sets - 1;
  }

  for (let setNum = 1; setNum <= exercise.sets; setNum++) {
    const setIndex = setNum - 1;
    const isCurrent = setIndex === currentSetIndex;
    const isLocked = setIndex > currentSetIndex;
    const stickyClass = isCurrent ? 'sticky-set' : '';

    // ... rest of rendering with stickyClass added
  }

  return html;
}
```

**Step 3: Create sticky input CSS**

Create `src/css/sticky-input.css`:

```css
/* Sticky Input Area */
.sticky-set {
  position: sticky;
  top: 60px; /* Below header */
  z-index: 10;
  background: var(--color-bg-primary);
  padding: var(--spacing-md);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  margin-bottom: var(--spacing-md);
}

.sticky-set::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
}

/* LOG SET Button */
.log-set-btn {
  width: 100%;
  height: 60px;
  margin-top: var(--spacing-sm);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.log-set-btn:hover {
  background: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.6);
}

.log-set-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.log-set-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

**Step 4: Add LOG SET button handler**

In `src/js/app.js`, add click handler:

```javascript
attachSetInputListeners() {
  const exerciseList = document.getElementById('exercise-list');
  if (!exerciseList) return;

  // Remove old listener if exists
  if (this.setInputHandler) {
    exerciseList.removeEventListener('change', this.setInputHandler);
  }

  // Use event delegation on parent
  this.setInputHandler = (e) => {
    if (e.target.classList.contains('set-input')) {
      this.handleSetInput(e);
    }
  };

  exerciseList.addEventListener('change', this.setInputHandler);

  // Add LOG SET button handler
  exerciseList.addEventListener('click', (e) => {
    if (e.target.classList.contains('log-set-btn')) {
      this.handleLogSet(e);
    }
  });
}

handleLogSet(event) {
  const button = event.target;
  const exerciseIndex = parseInt(button.dataset.exercise);
  const setIndex = parseInt(button.dataset.set);

  const exercise = this.workoutSession.exercises[exerciseIndex];
  const set = exercise.sets[setIndex];

  // Validate set is complete
  if (!set || !set.weight || !set.reps || set.rir === undefined) {
    alert('Please fill in all fields (Weight, Reps, RIR) before logging set');
    return;
  }

  // Visual feedback
  button.textContent = '✓ LOGGED';
  button.disabled = true;
  button.style.background = 'var(--color-success)';

  // Trigger progression check and unlock
  this.checkSetProgression(exerciseIndex, setIndex);
  this.unlockNextSet(exerciseIndex, setIndex);
  this.checkExerciseCompletion(exerciseIndex);

  // Show post-set feedback (Task 26)
  this.showPostSetFeedback(exerciseIndex, setIndex, set);
}
```

**Step 5: Test sticky LOG SET button**

Expected behavior:
- Current set row has sticky positioning (stays at top when scrolling)
- Large "LOG SET 1" button at bottom of current set (60px height)
- Button is primary color (purple gradient)
- Click validates all fields filled
- If incomplete, shows alert
- If complete:
  - Button changes to "✓ LOGGED" and turns green
  - Next set unlocks
  - Progression feedback shown
  - Exercise completion checked

**Step 6: Commit**

```bash
git add src/css/sticky-input.css src/js/app.js src/index.html
git commit -m "feat: add sticky input area with LOG SET button

Current set stays at top of screen when scrolling.
Large 60px LOG SET button for 1-tap logging workflow.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 26: Post-Set Feedback Messages

**Files:**
- Modify: `src/js/app.js:500-550` (add showPostSetFeedback method)
- Create: `src/css/post-set-feedback.css`
- Modify: `src/index.html:18` (add CSS link)

**Step 1: Create post-set feedback method**

In `src/js/app.js`, add method:

```javascript
showPostSetFeedback(exerciseIndex, setIndex, set) {
  const exerciseDef = this.currentWorkout.exercises[exerciseIndex];
  const sessionExercise = this.workoutSession.exercises[exerciseIndex];

  // Parse rep range
  const [minReps, maxReps] = exerciseDef.repRange.split('-').map(Number);
  const [minRir, maxRir] = exerciseDef.rirTarget.split('-').map(Number);

  // Determine feedback message and color
  let message = '';
  let colorClass = 'info';

  // Check if hitting progression criteria
  if (set.reps >= maxReps && set.rir >= minRir) {
    message = `🟢 Great set! Hitting max reps with good reserve.`;
    colorClass = 'success';

    // Check if this could trigger progression
    const allSetsMaxReps = sessionExercise.sets
      .filter(s => s && s.reps > 0)
      .every(s => s.reps >= maxReps && s.rir >= minRir);

    if (allSetsMaxReps && setIndex === exerciseDef.sets - 1) {
      message = `🟢 All sets hit ${maxReps} reps! Increase weight next workout.`;
    }
  }
  // Check if reps too low
  else if (set.reps < minReps) {
    message = `🔴 Below target range. Consider reducing weight next set.`;
    colorClass = 'danger';
  }
  // Check if RIR too low
  else if (set.rir < minRir) {
    message = `🟡 Too close to failure (RIR ${set.rir}). Aim for RIR ${minRir}-${maxRir}.`;
    colorClass = 'warning';
  }
  // Normal progress
  else {
    message = `🔵 Good progress - aim for ${maxReps} reps on next set.`;
    colorClass = 'info';
  }

  // Display feedback
  this.displayFeedbackToast(message, colorClass);
}

displayFeedbackToast(message, colorClass) {
  // Remove existing toast if present
  const existing = document.querySelector('.feedback-toast');
  if (existing) existing.remove();

  // Create toast
  const toast = document.createElement('div');
  toast.className = `feedback-toast ${colorClass}`;
  toast.textContent = message;

  // Add to DOM
  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
```

**Step 2: Create feedback toast CSS**

Create `src/css/post-set-feedback.css`:

```css
/* Post-Set Feedback Toast */
.feedback-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  padding: var(--spacing-md);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  max-width: 90%;
  z-index: 100;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: all 0.3s ease;
}

.feedback-toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.feedback-toast.success {
  background: var(--color-success);
  color: white;
}

.feedback-toast.info {
  background: var(--color-info);
  color: white;
}

.feedback-toast.warning {
  background: var(--color-warning);
  color: var(--color-bg-primary);
}

.feedback-toast.danger {
  background: var(--color-danger);
  color: white;
}
```

**Step 3: Add CSS link**

In `src/index.html`:

```html
<link rel="stylesheet" href="css/post-set-feedback.css">
```

**Step 4: Test post-set feedback**

Expected behavior:
- After clicking LOG SET button
- Toast appears from bottom with message
- Color based on performance:
  - Green: Hit max reps with good RIR (ready to progress)
  - Blue: Normal progress, guidance for next set
  - Yellow: RIR too low (too close to failure)
  - Red: Reps below minimum (weight too heavy)
- Toast auto-dismisses after 4 seconds
- Smooth slide-up animation

**Step 5: Commit**

```bash
git add src/css/post-set-feedback.css src/js/app.js src/index.html
git commit -m "feat: add post-set feedback messages

Shows color-coded toast after logging each set:
- Green: Ready to progress
- Blue: Normal progress
- Yellow: RIR warning
- Red: Reps too low

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 27: Custom Number Input Overlay

**Files:**
- Create: `src/css/number-overlay.css`
- Modify: `src/js/app.js:600-700` (add number overlay methods)
- Modify: `src/index.html:50` (add overlay HTML)
- Modify: `src/index.html:18` (add CSS link)

**Step 1: Add number overlay HTML**

In `src/index.html`, before closing `</body>`:

```html
<!-- Number Input Overlay -->
<div id="number-overlay" class="number-overlay" style="display: none;">
  <div class="overlay-content">
    <div class="overlay-header">
      <h3 id="overlay-title">Edit Weight</h3>
      <button id="overlay-close" class="overlay-close">✕</button>
    </div>

    <div class="overlay-display">
      <span id="overlay-value">0</span>
      <span id="overlay-unit">kg</span>
    </div>

    <div class="number-pad">
      <button class="num-btn" data-value="7">7</button>
      <button class="num-btn" data-value="8">8</button>
      <button class="num-btn" data-value="9">9</button>
      <button class="quick-btn" data-value="+2.5">+2.5</button>

      <button class="num-btn" data-value="4">4</button>
      <button class="num-btn" data-value="5">5</button>
      <button class="num-btn" data-value="6">6</button>
      <button class="quick-btn" data-value="+5.0">+5.0</button>

      <button class="num-btn" data-value="1">1</button>
      <button class="num-btn" data-value="2">2</button>
      <button class="num-btn" data-value="3">3</button>
      <button class="quick-btn" data-value="-2.5">-2.5</button>

      <button class="num-btn backspace" data-value="back">←</button>
      <button class="num-btn" data-value="0">0</button>
      <button class="num-btn" data-value=".">.</button>
      <button class="num-btn clear" data-value="clear">C</button>
    </div>

    <button id="overlay-confirm" class="overlay-confirm">CONFIRM</button>
  </div>
</div>
```

**Step 2: Create number overlay CSS**

Create `src/css/number-overlay.css`:

```css
/* Number Input Overlay */
.number-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 2000;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-md);
}

.number-overlay.active {
  display: flex;
}

.overlay-content {
  background: var(--color-bg-secondary);
  border-radius: 16px;
  padding: var(--spacing-lg);
  max-width: 400px;
  width: 100%;
}

.overlay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.overlay-header h3 {
  margin: 0;
  font-size: 20px;
  color: var(--color-text);
}

.overlay-close {
  background: transparent;
  border: none;
  font-size: 24px;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
}

.overlay-display {
  text-align: center;
  padding: var(--spacing-lg);
  background: var(--color-bg-primary);
  border-radius: 8px;
  margin-bottom: var(--spacing-md);
}

#overlay-value {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-primary);
}

#overlay-unit {
  font-size: 24px;
  color: var(--color-text-secondary);
  margin-left: var(--spacing-xs);
}

.number-pad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.num-btn,
.quick-btn {
  height: 70px;
  font-size: 24px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.1s ease;
}

.num-btn {
  background: var(--color-bg-primary);
  color: var(--color-text);
}

.num-btn:active {
  transform: scale(0.95);
  background: var(--color-primary);
  color: white;
}

.quick-btn {
  background: rgba(102, 126, 234, 0.2);
  color: var(--color-primary);
}

.quick-btn:active {
  background: var(--color-primary);
  color: white;
}

.num-btn.backspace,
.num-btn.clear {
  background: rgba(244, 67, 54, 0.2);
  color: var(--color-danger);
}

.overlay-confirm {
  width: 100%;
  height: 60px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.overlay-confirm:hover {
  background: var(--color-accent);
}
```

**Step 3: Add overlay trigger and handlers**

In `src/js/app.js`:

```javascript
// Modify renderSets to add edit icons
renderSets(exercise, lastWorkout, exerciseIndex) {
  // ... existing code ...

  // Add edit icon to weight input
  <div class="set-inputs">
    <label class="input-label">Weight (kg)</label>
    <div class="input-with-edit">
      <input
        type="number"
        class="set-input"
        data-exercise="${exerciseIndex}"
        data-set="${setNum - 1}"
        data-field="weight"
        value="${defaultWeight}"
        step="0.5"
        min="0"
        ${disabledAttr}
        readonly
      />
      <button
        class="edit-icon"
        data-exercise="${exerciseIndex}"
        data-set="${setNum - 1}"
        data-field="weight"
        data-current-value="${defaultWeight}"
        ${disabledAttr}
      >
        ✎
      </button>
    </div>
  </div>

  // Similar for reps
}

// Add overlay methods
initializeNumberOverlay() {
  const overlay = document.getElementById('number-overlay');
  const closeBtn = document.getElementById('overlay-close');
  const confirmBtn = document.getElementById('overlay-confirm');
  const numPad = document.querySelector('.number-pad');

  let currentValue = '0';
  let targetInput = null;

  // Close overlay
  const closeOverlay = () => {
    overlay.classList.remove('active');
    currentValue = '0';
    targetInput = null;
  };

  closeBtn.addEventListener('click', closeOverlay);

  // Number pad handlers
  numPad.addEventListener('click', (e) => {
    if (!e.target.classList.contains('num-btn') &&
        !e.target.classList.contains('quick-btn')) return;

    const value = e.target.dataset.value;

    if (value === 'clear') {
      currentValue = '0';
    } else if (value === 'back') {
      currentValue = currentValue.length > 1 ?
        currentValue.slice(0, -1) : '0';
    } else if (value.startsWith('+') || value.startsWith('-')) {
      // Quick adjust
      const adjustment = parseFloat(value);
      const current = parseFloat(currentValue) || 0;
      currentValue = Math.max(0, current + adjustment).toString();
    } else if (value === '.') {
      if (!currentValue.includes('.')) {
        currentValue += '.';
      }
    } else {
      // Number
      currentValue = currentValue === '0' ? value : currentValue + value;
    }

    document.getElementById('overlay-value').textContent = currentValue;
  });

  // Confirm button
  confirmBtn.addEventListener('click', () => {
    if (targetInput) {
      targetInput.value = currentValue;

      // Trigger change event
      const event = new Event('change', { bubbles: true });
      targetInput.dispatchEvent(event);
    }

    closeOverlay();
  });

  // Open overlay when edit icon clicked
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-icon')) {
      const field = e.target.dataset.field;
      const exerciseIndex = e.target.dataset.exercise;
      const setIndex = e.target.dataset.set;

      // Find corresponding input
      targetInput = document.querySelector(
        `.set-input[data-exercise="${exerciseIndex}"][data-set="${setIndex}"][data-field="${field}"]`
      );

      if (!targetInput) return;

      // Set initial value
      currentValue = targetInput.value || '0';
      document.getElementById('overlay-value').textContent = currentValue;

      // Set title
      const title = field === 'weight' ? 'Edit Weight' : 'Edit Reps';
      document.getElementById('overlay-title').textContent = title;

      // Set unit
      const unit = field === 'weight' ? 'kg' : 'reps';
      document.getElementById('overlay-unit').textContent = unit;

      // Show overlay
      overlay.classList.add('active');
    }
  });
}

// Call in initializeApp()
initializeApp() {
  this.updateHomeScreen();
  this.attachEventListeners();
  this.initializeNumberOverlay();
}
```

**Step 4: Add CSS link**

In `src/index.html`:

```html
<link rel="stylesheet" href="css/number-overlay.css">
```

**Step 5: Test number input overlay**

Expected behavior:
- Click ✎ icon next to weight or reps input
- Overlay appears with:
  - Current value displayed large
  - 4×4 grid of 70×70px buttons
  - Number pad (7-9, 4-6, 1-3, ←/0/./C)
  - Quick adjust buttons (+2.5, +5.0, -2.5)
  - CONFIRM button at bottom
- Tap numbers to build value
- Tap +2.5 to add 2.5 to current value
- Tap ← to delete last digit
- Tap C to clear to 0
- Tap CONFIRM to apply value to input
- Tap ✕ to close without saving

**Step 6: Commit**

```bash
git add src/css/number-overlay.css src/js/app.js src/index.html
git commit -m "feat: add custom number input overlay

70×70px button grid for thumb-friendly input.
Quick adjust buttons for common weight changes (+2.5kg, etc).

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 28: Automated Deload System - Triggers and State

**Files:**
- Modify: `src/js/modules/storage.js:100-150` (add deload state)
- Create: `src/js/modules/deload.js`
- Modify: `src/js/modules/workout-manager.js:150-200` (check deload triggers)
- Modify: `src/js/app.js:32-70` (check deload on home screen)

**Step 1: Add deload state to storage**

In `src/js/modules/storage.js`:

```javascript
getDeloadState() {
  const data = this.getData();
  return data.deloadState || {
    active: false,
    deloadType: null,  // 'standard' | 'light' | 'active_recovery'
    startDate: null,
    endDate: null,
    lastDeloadDate: null,
    weeksSinceDeload: 0,
    dismissedCount: 0
  };
}

saveDeloadState(deloadState) {
  const data = this.getData();
  data.deloadState = deloadState;
  this.saveData(data);
}
```

**Step 2: Create deload logic module**

Create `src/js/modules/deload.js`:

```javascript
export class DeloadManager {
  constructor(storage) {
    this.storage = storage;
  }

  shouldTriggerDeload() {
    const deloadState = this.storage.getDeloadState();
    const rotation = this.storage.getRotation();

    // Don't trigger if already in deload
    if (deloadState.active) return false;

    // Check time-based trigger (6-8 weeks)
    const weeksSinceDeload = this.calculateWeeksSinceDeload(deloadState.lastDeloadDate);
    if (weeksSinceDeload >= 6) {
      return { trigger: true, reason: 'time', weeks: weeksSinceDeload };
    }

    // Check performance-based trigger (regression on 2+ exercises)
    const regressionCount = this.detectRegressions();
    if (regressionCount >= 2) {
      return { trigger: true, reason: 'performance', regressions: regressionCount };
    }

    // Check fatigue-based trigger (score ≥8 for 2 consecutive workouts)
    const fatigueAlert = this.checkFatigueScore();
    if (fatigueAlert) {
      return { trigger: true, reason: 'fatigue', score: fatigueAlert.score };
    }

    return { trigger: false };
  }

  calculateWeeksSinceDeload(lastDeloadDate) {
    if (!lastDeloadDate) return 0;

    const lastDate = new Date(lastDeloadDate);
    const now = new Date();
    const diffMs = now - lastDate;
    const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

    return diffWeeks;
  }

  detectRegressions() {
    // Check last 2 workouts for weight/rep decreases
    // This would need access to exercise history
    // For now, return 0 (implement in next task)
    return 0;
  }

  checkFatigueScore() {
    // Check if last 2 workouts had fatigue score ≥8
    // This would need session metrics tracking
    // For now, return null (implement in next task)
    return null;
  }

  startDeload(deloadType = 'standard') {
    const deloadState = this.storage.getDeloadState();
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    deloadState.active = true;
    deloadState.deloadType = deloadType;
    deloadState.startDate = now.toISOString();
    deloadState.endDate = endDate.toISOString();

    this.storage.saveDeloadState(deloadState);
  }

  endDeload() {
    const deloadState = this.storage.getDeloadState();

    deloadState.active = false;
    deloadState.lastDeloadDate = deloadState.startDate;
    deloadState.deloadType = null;
    deloadState.startDate = null;
    deloadState.endDate = null;

    this.storage.saveDeloadState(deloadState);
  }

  postponeDeload() {
    const deloadState = this.storage.getDeloadState();
    deloadState.dismissedCount = (deloadState.dismissedCount || 0) + 1;
    this.storage.saveDeloadState(deloadState);
  }

  getDaysRemaining() {
    const deloadState = this.storage.getDeloadState();
    if (!deloadState.active || !deloadState.endDate) return 0;

    const endDate = new Date(deloadState.endDate);
    const now = new Date();
    const diffMs = endDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }
}
```

**Step 3: Check deload trigger on home screen**

In `src/js/app.js`:

```javascript
import { DeloadManager } from './modules/deload.js';

constructor() {
  this.storage = new StorageManager();
  this.workoutManager = new WorkoutManager(this.storage);
  this.deloadManager = new DeloadManager(this.storage);
  this.currentWorkout = null;
  this.currentExerciseIndex = 0;

  this.initializeApp();
}

updateHomeScreen() {
  // ... existing code ...

  // Check for deload trigger
  const deloadCheck = this.deloadManager.shouldTriggerDeload();
  if (deloadCheck.trigger) {
    this.showDeloadModal(deloadCheck);
  }

  // Show deload banner if active
  const deloadState = this.storage.getDeloadState();
  if (deloadState.active) {
    this.showDeloadBanner(deloadState);
  }
}
```

**Step 4: Test deload state tracking**

Run: `python3 -m http.server 8000`

Expected behavior:
- deloadState saved to localStorage
- shouldTriggerDeload() checks time-based condition
- weeksSinceDeload calculated correctly
- (Performance and fatigue triggers return false for now - implement in Task 29)

**Step 5: Commit**

```bash
git add src/js/modules/storage.js src/js/modules/deload.js src/js/app.js
git commit -m "feat: add deload system - state tracking and time trigger

Implements deload state management and time-based trigger (6+ weeks).
Performance and fatigue triggers to be implemented next.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 29: Automated Deload System - Modal and Flow

**Files:**
- Create: `src/css/deload-modal.css`
- Modify: `src/js/app.js:700-800` (showDeloadModal, showDeloadBanner)
- Modify: `src/index.html:50` (add deload modal HTML)
- Modify: `src/index.html:18` (add CSS link)

**Step 1: Add deload modal HTML**

In `src/index.html`:

```html
<!-- Deload Modal -->
<div id="deload-modal" class="modal" style="display: none;">
  <div class="modal-content deload-modal">
    <h2>⚠️ Deload Week Recommended</h2>
    <div id="deload-modal-body">
      <!-- populated by JavaScript -->
    </div>
    <div class="modal-actions">
      <button id="start-deload-btn" class="btn btn-primary">Start Deload Now</button>
      <button id="postpone-deload-btn" class="btn btn-secondary">Remind Me Next Workout</button>
      <button id="dismiss-deload-btn" class="btn btn-tertiary">Dismiss</button>
    </div>
  </div>
</div>

<!-- Deload Banner (shown during deload week) -->
<div id="deload-banner" class="deload-banner" style="display: none;">
  <div class="banner-content">
    <span class="banner-icon">🟡</span>
    <div class="banner-text">
      <strong>DELOAD WEEK</strong>
      <span id="banner-details"><!-- type and days remaining --></span>
    </div>
    <button id="end-deload-btn" class="banner-action">End Early</button>
  </div>
</div>
```

**Step 2: Create deload modal styles**

Create `src/css/deload-modal.css`:

```css
/* Deload Modal */
.deload-modal {
  max-width: 600px;
}

.deload-modal h2 {
  color: var(--color-warning);
  margin-top: 0;
}

.deload-trigger-reason {
  background: rgba(255, 152, 0, 0.1);
  border-left: 4px solid var(--color-warning);
  padding: var(--spacing-md);
  margin: var(--spacing-md) 0;
  border-radius: 4px;
}

.deload-explanation {
  margin: var(--spacing-md) 0;
}

.deload-explanation h3 {
  font-size: 18px;
  margin-bottom: var(--spacing-sm);
}

.deload-rules {
  background: var(--color-bg-secondary);
  padding: var(--spacing-md);
  border-radius: 8px;
  margin: var(--spacing-md) 0;
}

.deload-rules ul {
  margin: var(--spacing-sm) 0;
  padding-left: var(--spacing-md);
}

.deload-rules li {
  margin: var(--spacing-xs) 0;
}

.deload-type-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin: var(--spacing-md) 0;
}

.deload-type-option {
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border);
  padding: var(--spacing-sm);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.deload-type-option:hover {
  border-color: var(--color-primary);
}

.deload-type-option.selected {
  border-color: var(--color-primary);
  background: rgba(102, 126, 234, 0.1);
}

.deload-type-option strong {
  color: var(--color-primary);
  display: block;
  margin-bottom: 4px;
}

/* Deload Banner */
.deload-banner {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--color-warning);
  color: var(--color-bg-primary);
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.deload-banner.active {
  display: block;
}

.banner-content {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  gap: var(--spacing-sm);
}

.banner-icon {
  font-size: 24px;
}

.banner-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.banner-text strong {
  font-size: 16px;
}

.banner-text span {
  font-size: 14px;
  opacity: 0.9;
}

.banner-action {
  background: rgba(0, 0, 0, 0.2);
  color: white;
  border: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-tertiary {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}
```

**Step 3: Implement deload modal logic**

In `src/js/app.js`:

```javascript
showDeloadModal(deloadCheck) {
  const modal = document.getElementById('deload-modal');
  const body = document.getElementById('deload-modal-body');

  // Determine trigger message
  let triggerMsg = '';
  if (deloadCheck.reason === 'time') {
    triggerMsg = `You've completed ${deloadCheck.weeks} weeks of training!`;
  } else if (deloadCheck.reason === 'performance') {
    triggerMsg = `Performance decreased on ${deloadCheck.regressions} exercises.`;
  } else if (deloadCheck.reason === 'fatigue') {
    triggerMsg = `High fatigue detected (score: ${deloadCheck.score}).`;
  }

  body.innerHTML = `
    <div class="deload-trigger-reason">
      <strong>Trigger:</strong> ${triggerMsg}
    </div>

    <div class="deload-explanation">
      <h3>Why deload now?</h3>
      <ul>
        <li>Prevent fatigue accumulation</li>
        <li>Allow full recovery</li>
        <li>Come back stronger</li>
      </ul>
    </div>

    <div class="deload-type-selector">
      <div class="deload-type-option selected" data-type="standard">
        <strong>Standard Deload (Recommended)</strong>
        <p>Reduce sets by 40-50%. Keep weights. Focus on perfect form. Duration: 7 days.</p>
      </div>

      <div class="deload-type-option" data-type="light">
        <strong>Light Deload</strong>
        <p>Reduce weight by 20%. Keep sets. Focus on form and ROM. Duration: 7 days.</p>
      </div>

      <div class="deload-type-option" data-type="active_recovery">
        <strong>Active Recovery Week</strong>
        <p>No resistance training. Light stretching, walking, foam rolling. Duration: 7 days.</p>
      </div>
    </div>
  `;

  modal.style.display = 'flex';

  // Type selection
  let selectedType = 'standard';
  body.querySelectorAll('.deload-type-option').forEach(option => {
    option.addEventListener('click', () => {
      body.querySelectorAll('.deload-type-option').forEach(o =>
        o.classList.remove('selected')
      );
      option.classList.add('selected');
      selectedType = option.dataset.type;
    });
  });

  // Button handlers
  document.getElementById('start-deload-btn').onclick = () => {
    this.deloadManager.startDeload(selectedType);
    modal.style.display = 'none';
    this.updateHomeScreen();
  };

  document.getElementById('postpone-deload-btn').onclick = () => {
    this.deloadManager.postponeDeload();
    modal.style.display = 'none';
  };

  document.getElementById('dismiss-deload-btn').onclick = () => {
    const deloadState = this.storage.getDeloadState();
    deloadState.lastDeloadDate = new Date().toISOString();
    this.storage.saveDeloadState(deloadState);
    modal.style.display = 'none';
  };
}

showDeloadBanner(deloadState) {
  const banner = document.getElementById('deload-banner');
  const details = document.getElementById('banner-details');

  const daysRemaining = this.deloadManager.getDaysRemaining();
  const typeLabel = {
    standard: 'Standard',
    light: 'Light',
    active_recovery: 'Active Recovery'
  }[deloadState.deloadType] || 'Standard';

  details.textContent = `${typeLabel} - ${daysRemaining} days remaining`;
  banner.classList.add('active');

  // End early button
  document.getElementById('end-deload-btn').onclick = () => {
    if (confirm('Are you sure you want to end deload early?')) {
      this.deloadManager.endDeload();
      banner.classList.remove('active');
      this.updateHomeScreen();
    }
  };
}
```

**Step 4: Add CSS link**

In `src/index.html`:

```html
<link rel="stylesheet" href="css/deload-modal.css">
```

**Step 5: Test deload modal**

Expected behavior:
- When 6+ weeks since last deload:
  - Modal appears with trigger reason
  - 3 deload type options shown
  - Click to select type (highlights with blue border)
  - "Start Deload Now" → starts deload, shows banner
  - "Remind Me Next Workout" → dismisses modal, shows again next time
  - "Dismiss" → resets 6-week timer
- During deload:
  - Yellow banner at top of screen
  - Shows deload type and days remaining
  - "End Early" button → confirms, then ends deload

**Step 6: Commit**

```bash
git add src/css/deload-modal.css src/js/app.js src/index.html
git commit -m "feat: add deload modal and banner UI

Modal appears when deload trigger conditions met.
User selects deload type (standard, light, active recovery).
Banner shows during active deload week.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Final Task 30: Update Documentation and Manual Test

**Files:**
- Modify: `docs/plans/2026-02-05-missing-ux-features-implementation.md` (mark complete)
- Modify: `CHANGELOG.md` (document new features)
- Modify: `tests/integration/MANUAL_TEST_CHECKLIST.md` (add new feature tests)

**Step 1: Mark plan as complete**

Add to top of this file:

```markdown
## Implementation Status: COMPLETE

All 11 missing UX features implemented:
- ✅ Task 19: Warm-up protocol section
- ✅ Task 20: RIR dropdown with color coding
- ✅ Task 21: Machine usage info badges
- ✅ Task 22: Cycle progress tracking
- ✅ Task 23: Recovery warning confirmation
- ✅ Task 24: Progressive set unlocking
- ✅ Task 25: Sticky input with LOG SET button
- ✅ Task 26: Post-set feedback messages
- ✅ Task 27: Custom number input overlay
- ✅ Task 28-29: Automated deload system
- ✅ Task 30: Documentation and testing

Implementation date: 2026-02-05
Total commits: 12
```

**Step 2: Update CHANGELOG.md**

```markdown
## [Unreleased]

### Added - Complete UX Polish (Tasks 19-30)

**Missing Features Implementation:**
- Workout-specific warm-up protocol sections with checklist tracking ✅
- RIR dropdown with color coding (Red: 0-1, Green: 2-3, Yellow: 4+) and helper tooltip ✅
- Machine usage info badges ("ℹ️ Machine OK when fatigued") ✅
- Cycle progress tracking on home screen (current streak, deload countdown) ✅
- Recovery warning confirmation flow (orange modal, tap to confirm) ✅
- Progressive set unlocking (Set 1 → Set 2/3 unlock with pre-filled values) ✅
- Sticky input area with 60px LOG SET button (1-tap logging workflow) ✅
- Post-set feedback messages (color-coded toast: green/blue/yellow/red) ✅
- Custom number input overlay (70×70px buttons, quick adjust +2.5/-2.5) ✅
- Automated deload system:
  - Time-based trigger (6-8 weeks) ✅
  - Three deload types (standard, light, active recovery) ✅
  - Modal with type selection ✅
  - Yellow banner during active deload ✅
  - Manual override (start early, end early, postpone, dismiss) ✅

**User Experience:**
- Zero-friction set logging (1 tap when using defaults)
- Gym-ready number inputs (large touch targets)
- Smart feedback system (immediate guidance after each set)
- Complete recovery management (warnings + deload automation)
- Progressive disclosure maintained throughout

**Technical:**
- 12 new commits
- 7 new CSS files
- 1 new JS module (deload.js)
- Updated storage schema for deload state
- All features follow zero-dependency philosophy
```

**Step 3: Update manual test checklist**

In `tests/integration/MANUAL_TEST_CHECKLIST.md`, add:

```markdown
## 13. UX Polish Features (Tasks 19-30)

### 13.1 Warm-Up Protocol
- [ ] Start workout A
- [ ] Warm-up section appears at top, collapsed
- [ ] Click header expands checklist
- [ ] Check items marks them complete (strikethrough)
- [ ] All items checked sets workoutSession.warmupCompleted = true

### 13.2 RIR Dropdown
- [ ] RIR shows as dropdown (not number input)
- [ ] Options: 0, 1, 2, 3, 4, 5+
- [ ] Red background for 0-1
- [ ] Green background for 2-3
- [ ] Yellow background for 4-5+
- [ ] Hover ℹ️ shows tooltip
- [ ] Default is minimum of target range

### 13.3 Machine Badges
- [ ] Exercises with machineOk: true show "ℹ️ Machine OK" badge
- [ ] Badge appears in exercise header
- [ ] Hover shows tooltip "Machine version OK when fatigued"

### 13.4 Cycle Progress
- [ ] Home screen shows "🎯 Current Streak: N workouts"
- [ ] Shows "Next Deload: N workouts away"
- [ ] Streak increments on workout completion
- [ ] Deload countdown decreases (from 8)

### 13.5 Recovery Warning
- [ ] Start workout within 48 hours of last session
- [ ] Orange modal appears
- [ ] Shows hours since last workout
- [ ] Lists muscles needing recovery
- [ ] "Wait Until Tomorrow" closes modal
- [ ] "Train Anyway" proceeds to workout

### 13.6 Progressive Set Unlocking
- [ ] Only Set 1 inputs enabled initially
- [ ] Sets 2-3 show lock icon 🔒 and grayed out
- [ ] Complete Set 1 (all fields filled)
- [ ] Set 2 unlocks with animation
- [ ] Set 2 weight pre-fills from Set 1
- [ ] Complete Set 2 unlocks Set 3

### 13.7 Sticky LOG SET Button
- [ ] Current set has sticky positioning (stays at top when scrolling)
- [ ] Large "LOG SET 1" button appears (60px height)
- [ ] Button is purple gradient
- [ ] Click with incomplete fields shows alert
- [ ] Click with complete fields:
  - [ ] Button changes to "✓ LOGGED" and turns green
  - [ ] Next set unlocks
  - [ ] Post-set feedback shown

### 13.8 Post-Set Feedback
- [ ] After logging set, toast appears from bottom
- [ ] Green: Hit max reps with good RIR
- [ ] Blue: Normal progress
- [ ] Yellow: RIR too low
- [ ] Red: Reps below minimum
- [ ] Toast auto-dismisses after 4 seconds

### 13.9 Number Input Overlay
- [ ] Click ✎ icon next to weight input
- [ ] Overlay appears with number pad
- [ ] 4×4 grid of 70×70px buttons
- [ ] Tap numbers to build value
- [ ] Tap +2.5 to add 2.5
- [ ] Tap ← to delete digit
- [ ] Tap C to clear to 0
- [ ] Tap CONFIRM applies value
- [ ] Tap ✕ closes without saving

### 13.10 Deload System
- [ ] Manually set lastDeloadDate to 6+ weeks ago
- [ ] Open home screen
- [ ] Deload modal appears
- [ ] Shows trigger reason
- [ ] 3 deload type options
- [ ] Click to select type (blue border)
- [ ] "Start Deload Now" → yellow banner appears
- [ ] Banner shows type and days remaining
- [ ] "End Early" → confirms, then ends deload
- [ ] "Postpone" → dismisses modal
- [ ] "Dismiss" → resets timer
```

**Step 4: Run full manual test**

Run: `python3 -m http.server 8000`

Go through entire checklist in `tests/integration/MANUAL_TEST_CHECKLIST.md`

**Step 5: Commit documentation**

```bash
git add docs/plans/2026-02-05-missing-ux-features-implementation.md CHANGELOG.md tests/integration/MANUAL_TEST_CHECKLIST.md
git commit -m "docs: mark missing UX features as complete

All 11 missing features from original design specs implemented.
Updated CHANGELOG and manual test checklist.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Execution Notes

**Task Order Rationale:**
1. Tasks 19-21: Foundation (warm-ups, RIR, badges) - independent, no dependencies
2. Task 22: Cycle tracking - required for deload countdown
3. Task 23: Recovery confirmation - uses existing recovery check logic
4. Task 24: Progressive unlocking - prerequisite for LOG SET button
5. Task 25: LOG SET button - depends on unlocking workflow
6. Task 26: Post-set feedback - triggered by LOG SET
7. Task 27: Number overlay - enhances existing inputs
8. Tasks 28-29: Deload system - complex, built last
9. Task 30: Documentation - final wrap-up

**Testing Strategy:**
- Test each task immediately after implementation
- Use Python HTTP server for live testing
- Verify localStorage persistence after each feature
- Run full manual test checklist after all tasks complete

**Estimated Time:**
- Tasks 19-27: ~30-40 minutes each (6-7 hours total)
- Tasks 28-29: ~60 minutes combined (deload system)
- Task 30: ~20 minutes (documentation)
- Total: ~8-9 hours implementation time

---

**End of Implementation Plan**
