# BUILD Tracker UI Implementation Plan (Tasks 7-9)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task, OR use superpowers:subagent-driven-development for parallel execution with review checkpoints.

**Goal:** Connect backend modules to HTML UI, implement in-workout logging interface, and add progression feedback

**Architecture:** Event-driven UI controller pattern with module imports, DOM manipulation for dynamic content, mobile-first touch interactions

**Tech Stack:**
- Vanilla JavaScript (ES6+ modules)
- DOM Events API
- Existing modules: storage.js, workouts.js, progression.js, workout-manager.js
- Mobile-optimized CSS (already complete)

**Context:** Tasks 1-6 complete (44 tests passing). Backend modules work, HTML structure exists, CSS styled. Now wire them together.

## Implementation Status

- ✅ **Task 7: UI Controller (Home Screen)** - COMPLETED (commit 19219a6)
- ✅ **Task 8: In-Workout UI (Exercise List & Set Logging)** - COMPLETED (commit f8951e9, fixes in 11d6041, b374806, e240a9c)
- ✅ **Task 9: Progression UI (Visual Feedback)** - COMPLETED (commit d497994, security fixes in a18a761)

---

## Task 7: UI Controller (Home Screen) ✅ COMPLETED

**Goal:** Create main app controller that displays next workout, handles navigation, and shows recovery status

**Files:**
- Create: `src/js/app.js`
- Modify: None (HTML already has correct IDs)

### Step 1: Create app.js structure with imports

Create `src/js/app.js`:

```javascript
import { StorageManager } from './modules/storage.js';
import { WorkoutManager } from './modules/workout-manager.js';
import { getWorkout } from './modules/workouts.js';

class App {
  constructor() {
    this.storage = new StorageManager();
    this.workoutManager = new WorkoutManager(this.storage);
    this.currentWorkout = null;

    this.initializeApp();
  }

  initializeApp() {
    this.updateHomeScreen();
    this.attachEventListeners();
  }

  updateHomeScreen() {
    // Will implement in next step
  }

  attachEventListeners() {
    // Will implement in next step
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
```

### Step 2: Test in browser

**Action:** Open `src/index.html` in browser and check console

**Expected:** No errors in console, app initializes

**If errors:** Check that all module paths are correct

### Step 3: Implement updateHomeScreen method

Add to `src/js/app.js` in the `App` class:

```javascript
updateHomeScreen() {
  // Get next workout
  const nextWorkoutName = this.workoutManager.getNextWorkout();
  const nextWorkout = getWorkout(nextWorkoutName);

  // Update workout name
  const workoutNameEl = document.getElementById('next-workout-name');
  if (workoutNameEl) {
    workoutNameEl.textContent = nextWorkout.displayName;
  }

  // Update last trained date
  const rotation = this.storage.getRotation();
  const lastTrainedEl = document.getElementById('last-trained');
  if (lastTrainedEl) {
    if (rotation.lastDate) {
      const date = new Date(rotation.lastDate);
      const daysAgo = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));

      if (daysAgo === 0) {
        lastTrainedEl.textContent = 'Last trained: Today';
      } else if (daysAgo === 1) {
        lastTrainedEl.textContent = 'Last trained: Yesterday';
      } else {
        lastTrainedEl.textContent = `Last trained: ${daysAgo} days ago`;
      }
    } else {
      lastTrainedEl.textContent = 'Last trained: Never';
    }
  }

  // Update recovery status
  this.updateRecoveryStatus(nextWorkoutName);
}

updateRecoveryStatus(nextWorkoutName) {
  const recoveryCheck = this.workoutManager.checkMuscleRecovery(nextWorkoutName);
  const recoveryListEl = document.getElementById('recovery-list');

  if (!recoveryListEl) return;

  if (recoveryCheck.warn) {
    recoveryListEl.innerHTML = recoveryCheck.muscles
      .map(m => `<p class="recovery-warning">⚠️ ${m.name} needs ${m.hoursNeeded}h more recovery</p>`)
      .join('');
  } else {
    recoveryListEl.innerHTML = '<p class="recovery-ok">✓ All muscles recovered</p>';
  }
}
```

### Step 4: Test home screen updates

**Action:** Refresh browser

**Expected:**
- "Upper A - Horizontal" displays as next workout
- "Last trained: Never" shows
- "✓ All muscles recovered" shows

### Step 5: Implement event listeners

Add to `src/js/app.js` in the `App` class:

```javascript
attachEventListeners() {
  // Start workout button
  const startBtn = document.getElementById('start-workout-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => this.startWorkout());
  }

  // Back button (from workout screen)
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => this.showHomeScreen());
  }
}

startWorkout() {
  const nextWorkoutName = this.workoutManager.getNextWorkout();
  this.currentWorkout = getWorkout(nextWorkoutName);

  // Switch to workout screen
  document.getElementById('home-screen').classList.remove('active');
  document.getElementById('workout-screen').classList.add('active');

  // Update workout screen title
  const titleEl = document.getElementById('workout-title');
  if (titleEl) {
    titleEl.textContent = this.currentWorkout.displayName;
  }

  // Render exercises (will implement in Task 8)
  this.renderExercises();
}

showHomeScreen() {
  document.getElementById('workout-screen').classList.remove('active');
  document.getElementById('home-screen').classList.add('active');

  this.updateHomeScreen();
}

renderExercises() {
  // Placeholder for Task 8
  const exerciseList = document.getElementById('exercise-list');
  if (exerciseList) {
    exerciseList.innerHTML = '<p style="color: #a0a0a0; padding: 20px;">Exercise list will render here (Task 8)</p>';
  }
}
```

### Step 6: Test navigation

**Action:** Click "START WORKOUT" button

**Expected:**
- Home screen hides
- Workout screen shows
- Title shows "Upper A - Horizontal"
- Placeholder text appears

**Action:** Click back button (←)

**Expected:**
- Returns to home screen
- Home screen updates correctly

### Step 7: Commit

```bash
git add src/js/app.js
git commit -m "feat: add UI controller with home screen logic

- Create main App class with module imports
- Implement updateHomeScreen (next workout, last trained, recovery)
- Add navigation between home and workout screens
- Wire up Start Workout and Back buttons
- Display dynamic workout name and recovery status

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: In-Workout UI (Exercise List & Set Logging) ✅ COMPLETED

**Goal:** Render exercise list, implement set logging with smart defaults, and complete workout flow

**Files:**
- Modify: `src/js/app.js`
- Create: `src/css/workout-screen.css`
- Modify: `src/index.html` (add CSS link)

### Step 1: Add workout-screen.css link to HTML

Modify `src/index.html` - add after line 13 (after screens.css):

```html
  <link rel="stylesheet" href="css/workout-screen.css">
```

### Step 2: Create workout screen styles

Create `src/css/workout-screen.css`:

```css
/* In-Workout Screen Styles */

.exercise-item {
  background: var(--color-surface);
  border-radius: 12px;
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.exercise-name {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--color-text);
}

.exercise-meta {
  font-size: var(--font-sm);
  color: var(--color-text-dim);
  margin-bottom: var(--spacing-sm);
}

.sets-container {
  margin-top: var(--spacing-md);
}

.set-row {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 1fr;
  gap: var(--spacing-sm);
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.set-label {
  font-size: var(--font-sm);
  color: var(--color-text-dim);
  font-weight: 600;
}

.set-input {
  background: var(--color-surface-light);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text);
  font-size: var(--font-md);
  font-weight: 600;
  padding: var(--spacing-sm);
  text-align: center;
  min-height: var(--tap-target-min);
}

.set-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.set-input::placeholder {
  color: var(--color-text-dim);
}

.input-label {
  font-size: var(--font-xs);
  color: var(--color-text-dim);
  text-align: center;
  margin-bottom: 2px;
}

.set-inputs {
  display: flex;
  flex-direction: column;
}

#timer {
  font-family: 'Courier New', monospace;
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--color-text);
}

.exercise-notes {
  font-size: var(--font-sm);
  color: var(--color-info);
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: rgba(66, 153, 225, 0.1);
  border-radius: 6px;
}
```

### Step 3: Implement renderExercises method

Replace the placeholder `renderExercises()` method in `src/js/app.js`:

```javascript
renderExercises() {
  const exerciseList = document.getElementById('exercise-list');
  if (!exerciseList || !this.currentWorkout) return;

  // Initialize workout session data
  this.workoutSession = {
    workoutName: this.currentWorkout.name,
    startTime: new Date(),
    exercises: []
  };

  exerciseList.innerHTML = this.currentWorkout.exercises.map((exercise, index) => {
    const exerciseKey = `${this.currentWorkout.name} - ${exercise.name}`;
    const history = this.storage.getExerciseHistory(exerciseKey);
    const lastWorkout = history.length > 0 ? history[history.length - 1] : null;

    // Initialize session data for this exercise
    this.workoutSession.exercises.push({
      name: exercise.name,
      sets: []
    });

    return `
      <div class="exercise-item" data-exercise-index="${index}">
        <div class="exercise-header">
          <h3 class="exercise-name">${exercise.name}</h3>
        </div>

        <p class="exercise-meta">
          ${exercise.sets} sets × ${exercise.repRange} reps @ RIR ${exercise.rirTarget}
        </p>

        <div class="sets-container">
          ${this.renderSets(exercise, lastWorkout, index)}
        </div>

        ${exercise.notes ? `<p class="exercise-notes">💡 ${exercise.notes}</p>` : ''}
      </div>
    `;
  }).join('');

  // Attach input listeners
  this.attachSetInputListeners();

  // Show complete workout button
  const completeBtn = document.getElementById('complete-workout-btn');
  if (completeBtn) {
    completeBtn.style.display = 'block';
  }
}

renderSets(exercise, lastWorkout, exerciseIndex) {
  let html = '';

  for (let setNum = 1; setNum <= exercise.sets; setNum++) {
    const lastSet = lastWorkout?.sets?.[setNum - 1];
    const defaultWeight = lastSet?.weight || exercise.startingWeight;
    const defaultReps = lastSet?.reps || '';
    const defaultRir = lastSet?.rir || '';

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
          <label class="input-label">RIR</label>
          <input
            type="number"
            class="set-input"
            data-exercise="${exerciseIndex}"
            data-set="${setNum - 1}"
            data-field="rir"
            value="${defaultRir}"
            min="0"
            max="10"
            placeholder="0"
          />
        </div>
      </div>
    `;
  }

  return html;
}
```

### Step 4: Implement input tracking

Add to `src/js/app.js` in the `App` class:

```javascript
attachSetInputListeners() {
  const inputs = document.querySelectorAll('.set-input');

  inputs.forEach(input => {
    input.addEventListener('change', (e) => this.handleSetInput(e));
  });
}

handleSetInput(event) {
  const input = event.target;
  const exerciseIndex = parseInt(input.dataset.exercise);
  const setIndex = parseInt(input.dataset.set);
  const field = input.dataset.field;
  const value = parseFloat(input.value);

  // Ensure sets array exists for this exercise
  const exercise = this.workoutSession.exercises[exerciseIndex];
  if (!exercise.sets[setIndex]) {
    exercise.sets[setIndex] = { weight: 0, reps: 0, rir: 0 };
  }

  // Update the value
  exercise.sets[setIndex][field] = value;
}
```

### Step 5: Test exercise rendering

**Action:** Refresh browser, click "START WORKOUT"

**Expected:**
- 7 exercise cards render for Upper A
- Each exercise shows correct number of set rows
- Weight inputs pre-filled with starting weights
- Reps and RIR inputs are empty (first workout)
- Exercise notes display at bottom of each card

**Action:** Type values into weight/reps/RIR inputs

**Expected:** Inputs accept numbers correctly

### Step 6: Implement complete workout flow

Add to `src/js/app.js` in the `attachEventListeners` method:

```javascript
// Complete workout button
const completeBtn = document.getElementById('complete-workout-btn');
if (completeBtn) {
  completeBtn.addEventListener('click', () => this.completeWorkout());
}
```

Add new method to `App` class:

```javascript
completeWorkout() {
  if (!this.workoutSession || !this.currentWorkout) return;

  // Save each exercise's history
  this.workoutSession.exercises.forEach((exerciseSession, index) => {
    const exerciseDef = this.currentWorkout.exercises[index];
    const exerciseKey = `${this.currentWorkout.name} - ${exerciseDef.name}`;

    // Get existing history
    const history = this.storage.getExerciseHistory(exerciseKey);

    // Add new workout entry
    const newEntry = {
      date: this.workoutSession.startTime.toISOString(),
      sets: exerciseSession.sets.filter(set => set.reps > 0) // Only save completed sets
    };

    history.push(newEntry);

    // Save updated history (storage.js limits to 8 workouts)
    this.storage.saveExerciseHistory(exerciseKey, history);
  });

  // Update workout rotation
  this.workoutManager.completeWorkout(this.currentWorkout.name);

  // Show confirmation and return home
  alert(`✅ ${this.currentWorkout.displayName} completed!`);

  this.showHomeScreen();
}
```

### Step 7: Test complete workflow

**Action:**
1. Click "START WORKOUT"
2. Enter values for at least one exercise (e.g., Set 1: 7.5kg, 10 reps, RIR 2)
3. Click "COMPLETE WORKOUT"

**Expected:**
- Alert shows "✅ Upper A - Horizontal completed!"
- Returns to home screen
- Next workout changes to "Lower A - Bilateral"
- Last trained shows "Today"

**Action:** Click "START WORKOUT" again

**Expected:**
- Now shows "Lower A - Bilateral" with its exercises
- Rotation working correctly

### Step 8: Test data persistence

**Action:**
1. Complete a workout with some sets logged
2. Refresh the browser
3. Click "START WORKOUT" for the same workout that rotated back

**Expected:**
- Last workout's weight/reps/RIR values pre-fill correctly
- Data persisted in localStorage

### Step 9: Commit

```bash
git add src/js/app.js src/css/workout-screen.css src/index.html
git commit -m "feat: implement in-workout UI with set logging

- Render exercise list with set input grids
- Smart defaults: pre-fill weight from last workout
- Track set data (weight, reps, RIR) in session
- Save workout history to localStorage on completion
- Update workout rotation after completion
- Add workout-screen.css for exercise card styling
- Test: Full workout flow with data persistence

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Progression UI (Visual Feedback) ✅ COMPLETED

**Goal:** Add color-coded progression badges and visual feedback for progression status

**Files:**
- Modify: `src/js/app.js`
- Modify: `src/css/workout-screen.css`

### Step 1: Add progression badge styles

Add to `src/css/workout-screen.css`:

```css
/* Progression Badges */
.progression-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: var(--font-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-normal {
  background: rgba(66, 153, 225, 0.2);
  color: var(--color-info);
}

.badge-ready {
  background: rgba(72, 187, 120, 0.2);
  color: var(--color-success);
}

.badge-plateau {
  background: rgba(246, 173, 85, 0.2);
  color: var(--color-warning);
}

.badge-regressed {
  background: rgba(252, 129, 129, 0.2);
  color: var(--color-danger);
}

.progression-hint {
  font-size: var(--font-xs);
  color: var(--color-text-dim);
  margin-top: var(--spacing-xs);
  font-style: italic;
}

.progression-hint.success {
  color: var(--color-success);
}

.progression-hint.warning {
  color: var(--color-warning);
}
```

### Step 2: Import progression module in app.js

Add to imports at top of `src/js/app.js`:

```javascript
import { getProgressionStatus, shouldIncreaseWeight } from './modules/progression.js';
```

### Step 3: Add progression badges to exercise rendering

Modify the `renderExercises` method in `src/js/app.js` to include progression status.

Replace the exercise-header div with:

```javascript
return `
  <div class="exercise-item" data-exercise-index="${index}">
    <div class="exercise-header">
      <h3 class="exercise-name">${exercise.name}</h3>
      ${this.renderProgressionBadge(exercise, history)}
    </div>

    <p class="exercise-meta">
      ${exercise.sets} sets × ${exercise.repRange} reps @ RIR ${exercise.rirTarget}
    </p>

    ${this.renderProgressionHint(exercise, history, lastWorkout)}

    <div class="sets-container">
      ${this.renderSets(exercise, lastWorkout, index)}
    </div>

    ${exercise.notes ? `<p class="exercise-notes">💡 ${exercise.notes}</p>` : ''}
  </div>
`;
```

### Step 4: Implement progression badge rendering

Add to `src/js/app.js` in the `App` class:

```javascript
renderProgressionBadge(exercise, history) {
  if (history.length === 0) {
    return '<span class="progression-badge badge-normal">🔵 First Time</span>';
  }

  const status = getProgressionStatus(history, exercise);

  const badges = {
    normal: '<span class="progression-badge badge-normal">🔵 In Progress</span>',
    ready: '<span class="progression-badge badge-ready">🟢 Ready to Progress</span>',
    plateau: '<span class="progression-badge badge-plateau">🟡 Plateau</span>',
    regressed: '<span class="progression-badge badge-regressed">🔴 Regressed</span>'
  };

  return badges[status] || badges.normal;
}

renderProgressionHint(exercise, history, lastWorkout) {
  if (history.length === 0) {
    return `<p class="progression-hint">Start with ${exercise.startingWeight}kg and focus on form</p>`;
  }

  const status = getProgressionStatus(history, exercise);

  if (status === 'ready' && lastWorkout) {
    const lastWeight = lastWorkout.sets[0].weight;
    const nextWeight = lastWeight + exercise.weightIncrement;
    return `<p class="progression-hint success">✨ Increase to ${nextWeight}kg this session!</p>`;
  }

  if (status === 'plateau') {
    return `<p class="progression-hint warning">⚠️ Same weight for 3+ sessions. Consider deload or form check.</p>`;
  }

  if (status === 'normal' && lastWorkout) {
    const lastSet = lastWorkout.sets[lastWorkout.sets.length - 1];
    const [min, max] = exercise.repRange.split('-').map(Number);

    if (lastSet.reps < max) {
      return `<p class="progression-hint">Keep weight, aim for ${max} reps on all sets</p>`;
    }
  }

  return '';
}
```

### Step 5: Test progression badges

**Action:** Start a fresh workout (first time for an exercise)

**Expected:**
- Shows "🔵 First Time" badge
- Hint: "Start with [weight]kg and focus on form"

**Action:** Complete workout with all sets hitting max reps at good RIR
- Example: 3 sets of 12 reps at RIR 2-3 for DB Bench Press (8-12 rep range)

**Action:** Start the same workout after rotation completes

**Expected:**
- Shows "🟢 Ready to Progress" badge
- Hint: "✨ Increase to [new weight]kg this session!"
- Weight input pre-filled with new suggested weight

### Step 6: Add real-time set completion feedback

Add to `src/js/app.js` in the `handleSetInput` method:

```javascript
handleSetInput(event) {
  const input = event.target;
  const exerciseIndex = parseInt(input.dataset.exercise);
  const setIndex = parseInt(input.dataset.set);
  const field = input.dataset.field;
  const value = parseFloat(input.value);

  // Ensure sets array exists for this exercise
  const exercise = this.workoutSession.exercises[exerciseIndex];
  if (!exercise.sets[setIndex]) {
    exercise.sets[setIndex] = { weight: 0, reps: 0, rir: 0 };
  }

  // Update the value
  exercise.sets[setIndex][field] = value;

  // Check if this set is complete (has weight, reps, and RIR)
  const set = exercise.sets[setIndex];
  if (set.weight > 0 && set.reps > 0 && set.rir >= 0) {
    this.checkSetProgression(exerciseIndex, setIndex);
  }
}

checkSetProgression(exerciseIndex, setIndex) {
  const exerciseDef = this.currentWorkout.exercises[exerciseIndex];
  const set = this.workoutSession.exercises[exerciseIndex].sets[setIndex];

  const [min, max] = exerciseDef.repRange.split('-').map(Number);
  const [rirMin] = exerciseDef.rirTarget.split('-').map(Number);

  // Visual feedback on the input row
  const setRow = document.querySelector(
    `.set-input[data-exercise="${exerciseIndex}"][data-set="${setIndex}"][data-field="reps"]`
  )?.closest('.set-row');

  if (!setRow) return;

  // Remove any existing feedback
  setRow.style.borderLeft = 'none';

  // Check if set meets progression criteria
  if (set.reps >= max && set.rir >= rirMin) {
    setRow.style.borderLeft = '4px solid var(--color-success)';
  } else if (set.reps < min) {
    setRow.style.borderLeft = '4px solid var(--color-danger)';
  } else {
    setRow.style.borderLeft = '4px solid var(--color-info)';
  }
}
```

### Step 7: Add timer functionality

Add to `src/js/app.js` in the `startWorkout` method:

```javascript
startWorkout() {
  const nextWorkoutName = this.workoutManager.getNextWorkout();
  this.currentWorkout = getWorkout(nextWorkoutName);

  // Switch to workout screen
  document.getElementById('home-screen').classList.remove('active');
  document.getElementById('workout-screen').classList.add('active');

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

startTimer() {
  const timerEl = document.getElementById('timer');
  if (!timerEl) return;

  const startTime = Date.now();

  this.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, 1000);
}
```

Add to `showHomeScreen` method to stop timer:

```javascript
showHomeScreen() {
  // Stop timer
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  document.getElementById('workout-screen').classList.remove('active');
  document.getElementById('home-screen').classList.add('active');

  this.updateHomeScreen();
}
```

### Step 8: Test complete progression flow

**Test Scenario 1: First workout**
1. Start Upper A
2. Complete all sets of DB Bench Press with 10-12 reps at RIR 2-3
3. Expected: Green border on completed sets, "Ready to Progress" badge next time

**Test Scenario 2: Progression ready**
1. Rotate back to Upper A
2. Expected: "🟢 Ready to Progress" badge, increased weight suggested
3. Complete with new weight
4. Expected: Badge updates to "🔵 In Progress" (cycling continues)

**Test Scenario 3: Plateau detection**
1. Complete same exercise with same weight 3 times without progressing
2. Expected: "🟡 Plateau" badge with warning hint

**Test Scenario 4: Real-time feedback**
1. Enter reps below min range (e.g., 6 reps for 8-12 range)
2. Expected: Red border on set row
3. Enter reps in range with good RIR
4. Expected: Green border on set row

**Test Scenario 5: Timer**
1. Start workout
2. Expected: Timer starts at 00:00 and increments every second
3. Go back to home
4. Expected: Timer stops

### Step 9: Commit

```bash
git add src/js/app.js src/css/workout-screen.css
git commit -m "feat: add progression UI with visual feedback

- Color-coded badges: 🔵 In Progress, 🟢 Ready, 🟡 Plateau, 🔴 Regressed
- Progression hints with weight suggestions
- Real-time set feedback (green/red/blue borders)
- Workout timer with MM:SS format
- Import progression.js module for status checks
- Test: Full progression flow with visual feedback

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Verification Checklist

After completing all three tasks, verify the following:

**Task 7 (UI Controller):** ✅ COMPLETED
- [x] Home screen shows next workout name
- [x] Last trained date displays correctly
- [x] Recovery status shows muscle warnings when applicable
- [x] Start Workout button navigates to workout screen
- [x] Back button returns to home screen

**Task 8 (In-Workout UI):** ✅ COMPLETED
- [x] Exercise list renders with correct number of cards
- [x] Set inputs pre-fill with last workout values
- [x] New workouts default to starting weights
- [x] Complete Workout saves data to localStorage
- [x] Workout rotation updates after completion
- [x] Data persists across browser refresh

**Task 9 (Progression UI):** ✅ COMPLETED
- [x] Badges show correct status (First Time, In Progress, Ready, Plateau)
- [x] Progression hints appear with weight suggestions
- [x] Real-time set borders change color (red/blue/green)
- [x] Timer starts and increments during workout
- [x] Timer stops when returning home
- [x] "Ready to Progress" increases suggested weight
- [x] HTML sanitization for XSS prevention
- [x] Null safety guards for runtime errors

**Browser Test:**
- [x] Open `src/index.html` in browser
- [x] Complete 2-3 workout sessions
- [x] Verify rotation: Upper A → Lower A → Upper B → Lower B → Upper A
- [x] Verify progression detection after hitting max reps
- [x] Verify data persistence after refresh

---

## Next Steps (Tasks 10-11)

After UI is complete and tested:
- Task 10: Service Worker for offline caching
- Task 11: Integration tests for workout flow

Use `superpowers:writing-plans` to create detailed steps for Tasks 10-11, or implement directly if comfortable with the patterns established here.

---

## Completion Summary

### What's Been Completed

**Task 7: UI Controller** (commit 19219a6)
- ✅ Main App class with module imports
- ✅ Home screen with next workout display
- ✅ Last trained date calculation
- ✅ Recovery status warnings
- ✅ Navigation between home and workout screens

**Task 8: In-Workout UI** (commits f8951e9, 11d6041, b374806, e240a9c)
- ✅ Exercise list rendering with dynamic cards
- ✅ Set input grids (weight, reps, RIR)
- ✅ Smart defaults from last workout
- ✅ Session tracking and localStorage persistence
- ✅ Workout completion flow
- ✅ Input validation and error handling
- ✅ Null checks for robustness

**Task 9: Progression UI** (commits d497994, a18a761)
- ✅ Import progression.js module
- ✅ Color-coded progression badges (🔵 🟢 🟡 🔴)
- ✅ Progression hints with weight suggestions
- ✅ Real-time set feedback (colored borders)
- ✅ Workout timer (MM:SS format)
- ✅ Integration with progression.js status checks
- ✅ HTML sanitization for XSS prevention
- ✅ Null safety guards

### What's Remaining

**Tasks 10-11** (PLANNED)
- ⏳ Service Worker for offline caching
- ⏳ Integration tests for workout flow

---

## Notes

- **TDD Approach:** While these tasks don't include unit tests (DOM testing is complex), they include thorough manual verification steps
- **Mobile-First:** All CSS uses existing variables from `main.css`
- **Zero Dependencies:** Pure vanilla JS, no frameworks
- **Frequent Commits:** Commit after each major task (7, 8, 9)
- **Smart Defaults:** Weight pre-fills from last workout, improving UX
- **Progressive Enhancement:** Basic functionality works, visual feedback enhances experience
