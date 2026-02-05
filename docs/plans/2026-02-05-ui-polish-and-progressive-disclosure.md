# UI Polish & Progressive Disclosure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix missing button handlers, add favicon, and implement progressive disclosure (collapsible exercises) per UI/UX design spec

**Architecture:** Progressive disclosure shows only current exercise expanded, with completed exercises collapsed (checkmark) and upcoming exercises hidden. Auto-advance on set completion. Favicon integrated for PWA branding.

**Tech Stack:**
- Vanilla JavaScript (ES6+ modules)
- CSS transitions for collapse/expand animations
- SVG/PNG icons for PWA manifest

**Context:** Tasks 1-11 complete. User reported: settings button not working, icons missing, no progressive disclosure. Design spec (docs/design/2026-02-03-ui-ux-design.md:70) requires "Collapse completed, hide upcoming, expand current only".

---

## Task 12: Fix Missing Button Handlers

**Goal:** Add click handlers for workout-settings-btn and verify all placeholder buttons work

**Files:**
- Modify: `src/js/app.js:86-100` (attachEventListeners method)

**Step 1: Add workout settings button handler**

In `src/js/app.js`, modify `attachEventListeners()` method to include `#workout-settings-btn`:

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

  // Complete workout button
  const completeBtn = document.getElementById('complete-workout-btn');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => this.completeWorkout());
  }

  // Placeholder buttons (not yet implemented)
  const placeholderButtons = document.querySelectorAll('.action-btn, #settings-btn, #workout-settings-btn');
  placeholderButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      alert('⏳ This feature is coming soon!\n\nCurrently available:\n✅ Workout logging\n✅ Progression tracking\n✅ Offline mode');
    });
  });
}
```

**Step 2: Test in browser**

1. Navigate to http://localhost:8000
2. Click Settings button on home screen → should show alert
3. Click "START WORKOUT"
4. Click ⚙️ settings button on workout screen → should show alert
5. Go back, click History button → should show alert
6. Click Progress button → should show alert

Expected: All buttons show "This feature is coming soon!" alert

**Step 3: Commit**

```bash
git add src/js/app.js
git commit -m "fix: add missing workout settings button handler"
```

---

## Task 13: Add Favicon and PWA Icons

**Goal:** Add favicon link to HTML and verify PWA icons display correctly

**Files:**
- Modify: `src/index.html:1-15` (head section)

**Step 1: Add favicon links to HTML head**

In `src/index.html`, add after line 9 (theme-color meta):

```html
<meta name="theme-color" content="#667eea">
<link rel="icon" type="image/svg+xml" href="assets/icons/icon.svg">
<link rel="icon" type="image/png" sizes="192x192" href="assets/icons/icon-192.png">
<link rel="apple-touch-icon" sizes="192x192" href="assets/icons/icon-192.png">
<title>BUILD Workout Tracker</title>
```

**Step 2: Verify icons exist**

Run:
```bash
ls -lh src/assets/icons/
```

Expected output:
```
icon.svg
icon-192.png
icon-512.png
```

**Step 3: Test in browser**

1. Hard refresh http://localhost:8000 (Ctrl+Shift+R)
2. Check browser tab for favicon
3. Open DevTools → Application → Manifest → verify icons listed

Expected: Favicon visible in browser tab, manifest shows all icons

**Step 4: Commit**

```bash
git add src/index.html
git commit -m "feat: add favicon and apple-touch-icon links"
```

---

## Task 14: Progressive Disclosure - State Management

**Goal:** Add exercise state tracking (completed, current, upcoming) to App class

**Files:**
- Modify: `src/js/app.js:10-12` (constructor)
- Modify: `src/js/app.js:180-190` (renderExercises)

**Step 1: Add currentExerciseIndex to App state**

In `src/js/app.js` constructor, add:

```javascript
constructor() {
  this.storage = new StorageManager();
  this.workoutManager = new WorkoutManager(this.storage);
  this.currentWorkout = null;
  this.currentExerciseIndex = 0; // Track which exercise is active

  this.initializeApp();
}
```

**Step 2: Initialize currentExerciseIndex in startWorkout**

In `startWorkout()` method, after line 121 add:

```javascript
startWorkout() {
  const nextWorkoutName = this.workoutManager.getNextWorkout();
  this.currentWorkout = getWorkout(nextWorkoutName);

  if (!this.currentWorkout) {
    console.error(`Cannot start workout: ${nextWorkoutName} not found`);
    return;
  }

  // Initialize exercise tracking
  this.currentExerciseIndex = 0;

  // Switch to workout screen
  const homeScreen = document.getElementById('home-screen');
  // ... rest of method
```

**Step 3: Reset currentExerciseIndex in showHomeScreen**

In `showHomeScreen()` method, after line 168 add:

```javascript
showHomeScreen() {
  // Stop timer
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  // Clean up session data
  this.workoutSession = null;
  this.currentWorkout = null;
  this.currentExerciseIndex = 0;

  // ... rest of method
```

**Step 4: Test state initialization**

1. Add console.log to verify:
```javascript
startWorkout() {
  // ... existing code
  this.currentExerciseIndex = 0;
  console.log('Exercise index initialized:', this.currentExerciseIndex);
```

2. Reload page, start workout, check console
3. Expected: "Exercise index initialized: 0"

**Step 5: Remove test console.log and commit**

```bash
git add src/js/app.js
git commit -m "feat: add exercise state tracking for progressive disclosure"
```

---

## Task 15: Progressive Disclosure - Collapsed/Expanded CSS

**Goal:** Add CSS classes for collapsed/expanded/completed exercise states

**Files:**
- Create: `src/css/progressive-disclosure.css`
- Modify: `src/index.html:14` (add CSS link)

**Step 1: Create progressive-disclosure.css**

Create `src/css/progressive-disclosure.css`:

```css
/* Progressive Disclosure - Exercise Visibility States */

.exercise-item {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

/* Completed exercises - collapsed with checkmark */
.exercise-item.completed {
  max-height: 60px;
}

.exercise-item.completed .sets-container,
.exercise-item.completed .exercise-meta,
.exercise-item.completed .progression-hint,
.exercise-item.completed .exercise-notes {
  display: none;
}

.exercise-item.completed .exercise-header::before {
  content: '✓ ';
  color: var(--color-success);
  font-weight: bold;
}

/* Current exercise - fully expanded */
.exercise-item.current {
  max-height: none;
  border-left: 4px solid var(--color-primary);
  background: rgba(102, 126, 234, 0.05);
}

/* Upcoming exercises - collapsed, no details */
.exercise-item.upcoming {
  max-height: 60px;
  opacity: 0.6;
}

.exercise-item.upcoming .sets-container,
.exercise-item.upcoming .exercise-meta,
.exercise-item.upcoming .progression-hint,
.exercise-item.upcoming .exercise-notes {
  display: none;
}

.exercise-item.upcoming .exercise-header::after {
  content: ' ▼';
  color: var(--color-text-dim);
  font-size: var(--font-sm);
}

/* Tap to expand upcoming exercises */
.exercise-item.upcoming,
.exercise-item.completed {
  cursor: pointer;
}

.exercise-item.upcoming:hover,
.exercise-item.completed:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.02);
}
```

**Step 2: Add CSS link to index.html**

In `src/index.html`, after workout-screen.css link:

```html
<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/screens.css">
<link rel="stylesheet" href="css/workout-screen.css">
<link rel="stylesheet" href="css/progressive-disclosure.css">
</head>
```

**Step 3: Test CSS classes manually**

1. Open DevTools, select an exercise-item
2. Add class="completed" → should collapse to 60px with checkmark
3. Add class="current" → should expand with blue border
4. Add class="upcoming" → should collapse with down arrow
5. Remove test classes

Expected: Visual changes match CSS rules

**Step 4: Commit**

```bash
git add src/css/progressive-disclosure.css src/index.html
git commit -m "feat: add progressive disclosure CSS for exercise states"
```

---

## Task 16: Progressive Disclosure - Apply State Classes

**Goal:** Dynamically apply completed/current/upcoming classes based on currentExerciseIndex

**Files:**
- Modify: `src/js/app.js:191-222` (renderExercises method)

**Step 1: Add state class logic to renderExercises**

In `renderExercises()` method, modify the exercise mapping:

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

    // Determine exercise state
    let stateClass = '';
    if (index < this.currentExerciseIndex) {
      stateClass = 'completed';
    } else if (index === this.currentExerciseIndex) {
      stateClass = 'current';
    } else {
      stateClass = 'upcoming';
    }

    return `
      <div class="exercise-item ${stateClass}" data-exercise-index="${index}">
        <div class="exercise-header">
          <h3 class="exercise-name">${this.escapeHtml(exercise.name)}</h3>
          ${this.renderProgressionBadge(exercise, history)}
        </div>

        <p class="exercise-meta">
          ${exercise.sets} sets × ${exercise.repRange} reps @ RIR ${exercise.rirTarget}
        </p>

        ${this.renderProgressionHint(exercise, history, lastWorkout)}

        <div class="sets-container">
          ${this.renderSets(exercise, lastWorkout, index)}
        </div>

        ${exercise.notes ? `<p class="exercise-notes">💡 ${this.escapeHtml(exercise.notes)}</p>` : ''}
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
```

**Step 2: Test progressive disclosure display**

1. Reload page, start workout
2. First exercise should have class="current" (expanded, blue border)
3. All other exercises should have class="upcoming" (collapsed, down arrow)
4. No completed exercises yet (currentExerciseIndex = 0)

Expected: Only first exercise expanded, others collapsed

**Step 3: Commit**

```bash
git add src/js/app.js
git commit -m "feat: apply progressive disclosure state classes dynamically"
```

---

## Task 17: Progressive Disclosure - Auto-Advance on Set Completion

**Goal:** Move to next exercise when all sets completed for current exercise

**Files:**
- Modify: `src/js/app.js:361-386` (handleSetInput method)

**Step 1: Add auto-advance logic to handleSetInput**

After updating set data in `handleSetInput()`, add completion check:

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

    // Check if all sets completed for current exercise
    this.checkExerciseCompletion(exerciseIndex);
  }
}
```

**Step 2: Add checkExerciseCompletion method**

Add new method after `handleSetInput()`:

```javascript
checkExerciseCompletion(exerciseIndex) {
  // Only check current exercise
  if (exerciseIndex !== this.currentExerciseIndex) return;

  const exerciseDef = this.currentWorkout.exercises[exerciseIndex];
  const exerciseSession = this.workoutSession.exercises[exerciseIndex];

  // Count completed sets (sets with all three values)
  const completedSets = exerciseSession.sets.filter(set =>
    set && set.weight > 0 && set.reps > 0 && set.rir >= 0
  ).length;

  // If all sets completed, advance to next exercise
  if (completedSets >= exerciseDef.sets) {
    this.advanceToNextExercise();
  }
}

advanceToNextExercise() {
  // Don't advance past last exercise
  if (this.currentExerciseIndex >= this.currentWorkout.exercises.length - 1) {
    return;
  }

  // Increment index
  this.currentExerciseIndex++;

  // Re-render to update state classes
  this.renderExercises();

  // Scroll to current exercise
  const currentExercise = document.querySelector('.exercise-item.current');
  if (currentExercise) {
    currentExercise.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
```

**Step 3: Test auto-advance**

1. Start workout
2. Complete Set 1: enter weight, reps, RIR
3. Complete Set 2: enter weight, reps, RIR
4. Complete Set 3: enter weight, reps, RIR
5. After final set → should auto-advance to next exercise

Expected:
- First exercise collapses with checkmark
- Second exercise expands with blue border
- Smooth scroll to second exercise

**Step 4: Commit**

```bash
git add src/js/app.js
git commit -m "feat: auto-advance to next exercise when all sets completed"
```

---

## Task 18: Progressive Disclosure - Tap to Expand

**Goal:** Allow tapping collapsed exercises to jump to them

**Files:**
- Modify: `src/js/app.js:86-100` (attachEventListeners)

**Step 1: Add click handler for exercise headers**

In `attachEventListeners()`, add before placeholder buttons:

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

  // Complete workout button
  const completeBtn = document.getElementById('complete-workout-btn');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => this.completeWorkout());
  }

  // Exercise item click to expand (event delegation)
  const exerciseList = document.getElementById('exercise-list');
  if (exerciseList) {
    exerciseList.addEventListener('click', (e) => {
      const exerciseItem = e.target.closest('.exercise-item');
      if (!exerciseItem) return;

      // Only handle clicks on collapsed exercises
      if (exerciseItem.classList.contains('completed') || exerciseItem.classList.contains('upcoming')) {
        const exerciseIndex = parseInt(exerciseItem.dataset.exerciseIndex);
        this.jumpToExercise(exerciseIndex);
      }
    });
  }

  // Placeholder buttons (not yet implemented)
  const placeholderButtons = document.querySelectorAll('.action-btn, #settings-btn, #workout-settings-btn');
  placeholderButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      alert('⏳ This feature is coming soon!\n\nCurrently available:\n✅ Workout logging\n✅ Progression tracking\n✅ Offline mode');
    });
  });
}
```

**Step 2: Add jumpToExercise method**

Add new method after `advanceToNextExercise()`:

```javascript
jumpToExercise(exerciseIndex) {
  // Validate index
  if (exerciseIndex < 0 || exerciseIndex >= this.currentWorkout.exercises.length) {
    return;
  }

  // Update current exercise index
  this.currentExerciseIndex = exerciseIndex;

  // Re-render to update state classes
  this.renderExercises();

  // Scroll to current exercise
  const currentExercise = document.querySelector('.exercise-item.current');
  if (currentExercise) {
    currentExercise.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
```

**Step 3: Test tap to expand**

1. Start workout, complete first exercise (all 3 sets)
2. Auto-advances to second exercise (first is collapsed with checkmark)
3. Tap on first exercise header → should re-expand it
4. Tap on third exercise header → should jump ahead to it
5. Second exercise should now be collapsed

Expected: Can navigate between exercises by tapping headers

**Step 4: Commit**

```bash
git add src/js/app.js
git commit -m "feat: allow tapping collapsed exercises to jump to them"
```

---

## Task 19: Fix Input Overflow on Small Screens

**Goal:** Ensure input boxes don't overflow on small screens or long exercise names

**Files:**
- Modify: `src/css/workout-screen.css:34-39` (set-row grid)

**Step 1: Adjust set-row grid for tighter spacing**

In `src/css/workout-screen.css`, modify `.set-row`:

```css
.set-row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--spacing-xs); /* Reduced from var(--spacing-sm) */
  align-items: center;
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-xs);
}
```

**Step 2: Add max-width constraint to set-inputs**

After `.set-inputs` styles:

```css
.set-inputs {
  display: flex;
  flex-direction: column;
  min-width: 0; /* Allow shrinking below content size */
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
  width: 100%; /* Fill parent container */
  max-width: 100%; /* Don't overflow parent */
}
```

**Step 3: Test on small viewport**

1. Open DevTools → Device Toolbar
2. Set width to 320px (iPhone SE)
3. Start workout
4. Check all three input columns fit without horizontal scroll
5. Test with longest exercise name

Expected: All inputs visible, no horizontal overflow

**Step 4: Commit**

```bash
git add src/css/workout-screen.css
git commit -m "fix: prevent input overflow on small screens"
```

---

## Verification Checklist

After completing all tasks, verify:

**Task 12 (Button Handlers):**
- [ ] Settings button (home screen) shows alert
- [ ] Settings button (workout screen) shows alert
- [ ] History button shows alert
- [ ] Progress button shows alert

**Task 13 (Favicon):**
- [ ] Favicon visible in browser tab
- [ ] PWA manifest shows all icons
- [ ] Apple touch icon configured

**Task 14 (State Management):**
- [ ] currentExerciseIndex initializes to 0
- [ ] Resets to 0 when returning home
- [ ] Persists during workout session

**Task 15 (CSS States):**
- [ ] completed class: collapsed, checkmark, 60px height
- [ ] current class: expanded, blue border, highlight
- [ ] upcoming class: collapsed, down arrow, dimmed

**Task 16 (Apply Classes):**
- [ ] First exercise starts as "current"
- [ ] All other exercises start as "upcoming"
- [ ] Classes update when currentExerciseIndex changes

**Task 17 (Auto-Advance):**
- [ ] Completes Set 1 → stays on exercise
- [ ] Completes Set 2 → stays on exercise
- [ ] Completes Set 3 → auto-advances to next
- [ ] Previous exercise shows checkmark (completed)
- [ ] Smooth scroll to new current exercise
- [ ] Last exercise doesn't advance beyond

**Task 18 (Tap to Expand):**
- [ ] Tap completed exercise → re-expands it
- [ ] Tap upcoming exercise → jumps ahead to it
- [ ] Current exercise updates accordingly
- [ ] Smooth scroll on jump

**Task 19 (Input Overflow):**
- [ ] Inputs fit on 320px width screen
- [ ] No horizontal scroll on mobile
- [ ] Long exercise names don't break layout
- [ ] Touch targets remain 60px minimum

**Browser Test:**
1. Open http://localhost:8000
2. Test all buttons show alerts
3. Check favicon in browser tab
4. Start workout
5. Complete first exercise (3 sets)
6. Verify auto-advance to second exercise
7. Tap first exercise to go back
8. Complete entire workout
9. Verify rotation updates

---

## Next Steps

After Task 19 complete:
- Deploy PWA to production (Netlify/Vercel)
- Optional: Add export history feature
- Optional: Add custom workout creator

---

## Notes

- **No automated tests:** DOM testing complex, manual verification sufficient
- **Progressive disclosure is UX critical:** Design spec requirement from docs/design/2026-02-03-ui-ux-design.md
- **Mobile-first:** All CSS optimized for 320-430px screens
- **Zero dependencies:** Pure vanilla JS
- **Frequent commits:** One commit per task (6-9 total)
