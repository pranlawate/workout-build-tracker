# Pain Tracking & Band Color Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move pain tracking to post-workout modal and add visual band color selection for resistance band exercises

**Architecture:** Remove per-exercise pain prompts from workout flow, add consolidated post-workout pain modal before weigh-in. For band exercises, replace weight input with color buttons mapped to realistic resistance values (5/10/15/25 kg).

**Tech Stack:** Vanilla JavaScript, DOM manipulation, existing localStorage/StorageManager API

---

## Task 1: Remove Per-Exercise Pain Prompts

**Files:**
- Modify: `js/app.js:1182-1184` (remove pain prompt call)
- Modify: `js/app.js:1948-2005` (comment out old modal functions for now)

**Step 1: Remove pain prompt from advanceToNextExercise**

In `js/app.js`, find the `advanceToNextExercise()` method around line 1182:

```javascript
// BEFORE (lines 1182-1184):
this.showMobilityCheckIfNeeded(exerciseKey);
this.showPainTrackingPrompt(exerciseKey, justCompletedExercise.name);

// AFTER:
this.showMobilityCheckIfNeeded(exerciseKey);
// Pain tracking moved to post-workout modal
```

**Step 2: Comment out old pain modal functions**

Find `showPainTrackingPrompt()` method around line 1948 and add comment block:

```javascript
/* DEPRECATED: Pain tracking now happens post-workout
  showPainTrackingPrompt(exerciseKey, exerciseName) {
    ...entire function...
  }

  setupLocationSelection(exerciseKey, severity, modal) {
    ...entire function...
  }
*/
```

**Step 3: Test that pain prompts no longer appear**

Run: Open app, start workout, complete an exercise
Expected: Mobility prompt still appears, but NO pain prompt after

**Step 4: Commit**

```bash
git add js/app.js
git commit -m "refactor: remove per-exercise pain prompts

Preparation for consolidated post-workout pain modal.
Old functions commented out (not deleted) for reference."
```

---

## Task 2: Add Post-Workout Pain Modal HTML

**Files:**
- Modify: `index.html:350-400` (after existing modals)

**Step 1: Add post-workout pain modal structure**

Add after the existing pain-tracking-modal in `index.html`:

```html
<!-- Post-Workout Pain Modal -->
<div id="post-workout-pain-modal" class="modal">
  <div class="modal-content">
    <h2 class="modal-title">Workout Complete! 💪</h2>

    <!-- Initial pain check -->
    <div id="pain-initial-check">
      <p style="font-size: 18px; margin-bottom: 24px;">Did you experience any pain during this workout?</p>
      <button id="pain-no-btn" class="btn btn-primary" style="height: 60px; font-size: 18px; margin-bottom: 12px;">No Pain ✓</button>
      <button id="pain-yes-btn" class="btn btn-secondary" style="height: 60px; font-size: 18px;">Yes, I had pain ⚠️</button>
    </div>

    <!-- Exercise selection (hidden initially) -->
    <div id="pain-exercise-selection" style="display: none;">
      <p style="font-size: 16px; margin-bottom: 16px;">Which exercises had pain? (Select all that apply)</p>
      <div id="pain-exercise-list" class="pain-exercise-checkboxes">
        <!-- Populated dynamically -->
      </div>
      <button id="pain-selection-next-btn" class="btn btn-primary" style="margin-top: 16px; height: 50px;">Next</button>
    </div>

    <!-- Pain details for selected exercise (hidden initially) -->
    <div id="pain-details" style="display: none;">
      <h3 id="pain-detail-exercise-name" style="margin-bottom: 16px;"></h3>
      <p id="pain-detail-progress" style="font-size: 14px; color: #888; margin-bottom: 16px;"></p>

      <p style="margin-bottom: 12px;">How severe was the pain?</p>
      <div style="display: flex; gap: 12px; margin-bottom: 24px;">
        <button class="pain-severity-btn btn-secondary" data-severity="minor" style="flex: 1; height: 50px;">Minor</button>
        <button class="pain-severity-btn btn-secondary" data-severity="significant" style="flex: 1; height: 50px;">Significant</button>
      </div>

      <p style="margin-bottom: 12px;">Where was the pain?</p>
      <div class="pain-location-buttons" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <button class="pain-location-btn btn-secondary" data-location="shoulder">Shoulder</button>
        <button class="pain-location-btn btn-secondary" data-location="elbow">Elbow</button>
        <button class="pain-location-btn btn-secondary" data-location="wrist">Wrist</button>
        <button class="pain-location-btn btn-secondary" data-location="lower_back">Lower back</button>
        <button class="pain-location-btn btn-secondary" data-location="knee">Knee</button>
        <button class="pain-location-btn btn-secondary" data-location="hip">Hip</button>
        <button class="pain-location-btn btn-secondary" data-location="other">Other</button>
      </div>
    </div>
  </div>
</div>
```

**Step 2: Test HTML renders correctly**

Run: Open index.html in browser, inspect element for `#post-workout-pain-modal`
Expected: Modal exists in DOM, all sections present

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add post-workout pain modal HTML structure

Three-step flow: initial check → exercise selection → pain details"
```

---

## Task 3: Add Post-Workout Pain Modal CSS

**Files:**
- Modify: `css/workout-screen.css` (end of file)

**Step 1: Add modal and button styles**

Add to end of `css/workout-screen.css`:

```css
/* Post-Workout Pain Modal */
#post-workout-pain-modal .modal-content {
  max-width: 500px;
  padding: 24px;
}

#post-workout-pain-modal .modal-title {
  text-align: center;
  margin-bottom: 24px;
  font-size: 24px;
}

.pain-exercise-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.pain-exercise-checkbox-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.pain-exercise-checkbox-item:hover {
  background-color: rgba(124, 58, 237, 0.1);
}

.pain-exercise-checkbox-item.selected {
  border-color: var(--color-accent);
  background-color: rgba(124, 58, 237, 0.15);
}

.pain-exercise-checkbox-item input[type="checkbox"] {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  cursor: pointer;
}

.pain-exercise-checkbox-item label {
  flex: 1;
  font-size: 16px;
  cursor: pointer;
  margin: 0;
}

.pain-severity-btn,
.pain-location-btn {
  min-height: 50px;
  font-size: 16px;
}

.pain-location-buttons .pain-location-btn {
  height: 50px;
}

@media (max-width: 768px) {
  #post-workout-pain-modal .modal-content {
    max-width: 95%;
    padding: 16px;
  }
}
```

**Step 2: Test styles render correctly**

Run: Open app, inspect post-workout pain modal with dev tools
Expected: Buttons are large (60px height), spacing looks clean

**Step 3: Commit**

```bash
git add css/workout-screen.css
git commit -m "style: add post-workout pain modal CSS

Large touch targets (50-60px), clean spacing, mobile responsive"
```

---

## Task 4: Implement Post-Workout Pain Flow Logic

**Files:**
- Modify: `js/app.js` (add new method around line 2100)

**Step 1: Add showPostWorkoutPainModal method**

Add new method in `js/app.js`:

```javascript
  showPostWorkoutPainModal() {
    const modal = document.getElementById('post-workout-pain-modal');
    const initialCheck = document.getElementById('pain-initial-check');
    const exerciseSelection = document.getElementById('pain-exercise-selection');
    const painDetails = document.getElementById('pain-details');

    // Reset to initial state
    initialCheck.style.display = 'block';
    exerciseSelection.style.display = 'none';
    painDetails.style.display = 'none';

    // Show modal
    modal.style.display = 'flex';

    // State tracking
    let painfulExercises = [];
    let currentPainIndex = 0;

    // "No Pain" button
    document.getElementById('pain-no-btn').onclick = () => {
      // Save pain-free status for all exercises
      this.currentWorkout.exercises.forEach((exercise) => {
        const exerciseKey = `${this.currentWorkout.name} - ${exercise.name}`;
        this.storage.savePainReport(exerciseKey, false, null, null);
      });

      modal.style.display = 'none';

      // Proceed to weigh-in
      this.checkWeighInPrompt();
    };

    // "Yes, I had pain" button
    document.getElementById('pain-yes-btn').onclick = () => {
      initialCheck.style.display = 'none';
      exerciseSelection.style.display = 'block';

      // Populate exercise checkboxes
      const exerciseList = document.getElementById('pain-exercise-list');
      exerciseList.innerHTML = '';

      this.currentWorkout.exercises.forEach((exercise, index) => {
        const exerciseKey = `${this.currentWorkout.name} - ${exercise.name}`;
        const item = document.createElement('div');
        item.className = 'pain-exercise-checkbox-item';
        item.innerHTML = `
          <input type="checkbox" id="pain-ex-${index}" value="${exerciseKey}">
          <label for="pain-ex-${index}">${this.escapeHtml(exercise.name)}</label>
        `;

        // Toggle selected class on click
        item.onclick = (e) => {
          if (e.target.tagName !== 'INPUT') {
            const checkbox = item.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
          }
          item.classList.toggle('selected', item.querySelector('input').checked);
        };

        exerciseList.appendChild(item);
      });
    };

    // "Next" button (after selecting exercises)
    document.getElementById('pain-selection-next-btn').onclick = () => {
      // Collect checked exercises
      const checkboxes = document.querySelectorAll('#pain-exercise-list input[type="checkbox"]:checked');
      painfulExercises = Array.from(checkboxes).map(cb => ({
        key: cb.value,
        name: cb.nextElementSibling.textContent
      }));

      if (painfulExercises.length === 0) {
        alert('Please select at least one exercise, or click "No Pain" if you had no pain.');
        return;
      }

      // Start pain details flow
      currentPainIndex = 0;
      this.showPainDetailsForExercise(painfulExercises, currentPainIndex, modal);
    };
  }
```

**Step 2: Add showPainDetailsForExercise helper method**

Add helper method after `showPostWorkoutPainModal`:

```javascript
  showPainDetailsForExercise(painfulExercises, index, modal) {
    if (index >= painfulExercises.length) {
      // All done, save pain-free status for non-painful exercises
      this.currentWorkout.exercises.forEach((exercise) => {
        const exerciseKey = `${this.currentWorkout.name} - ${exercise.name}`;
        const isPainful = painfulExercises.some(p => p.key === exerciseKey);
        if (!isPainful) {
          this.storage.savePainReport(exerciseKey, false, null, null);
        }
      });

      modal.style.display = 'none';
      this.checkWeighInPrompt();
      return;
    }

    const exerciseSelection = document.getElementById('pain-exercise-selection');
    const painDetails = document.getElementById('pain-details');
    const exerciseName = document.getElementById('pain-detail-exercise-name');
    const progress = document.getElementById('pain-detail-progress');

    // Hide selection, show details
    exerciseSelection.style.display = 'none';
    painDetails.style.display = 'block';

    // Set exercise name and progress
    exerciseName.textContent = painfulExercises[index].name;
    progress.textContent = `Exercise ${index + 1} of ${painfulExercises.length}`;

    // Severity buttons
    const severityBtns = document.querySelectorAll('.pain-severity-btn');
    let selectedSeverity = null;

    severityBtns.forEach(btn => {
      btn.onclick = () => {
        selectedSeverity = btn.dataset.severity;
        severityBtns.forEach(b => b.classList.remove('btn-primary'));
        severityBtns.forEach(b => b.classList.add('btn-secondary'));
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
      };
    });

    // Location buttons
    const locationBtns = document.querySelectorAll('.pain-location-btn');
    locationBtns.forEach(btn => {
      btn.onclick = () => {
        if (!selectedSeverity) {
          alert('Please select pain severity first');
          return;
        }

        const location = btn.dataset.location;
        const exerciseKey = painfulExercises[index].key;

        // Save pain report
        this.storage.savePainReport(exerciseKey, true, location, selectedSeverity);

        // Reset severity selection for next exercise
        severityBtns.forEach(b => b.classList.remove('btn-primary'));
        severityBtns.forEach(b => b.classList.add('btn-secondary'));

        // Move to next exercise
        this.showPainDetailsForExercise(painfulExercises, index + 1, modal);
      };
    });
  }
```

**Step 3: Add checkWeighInPrompt helper method**

Add helper method:

```javascript
  checkWeighInPrompt() {
    // Check if weigh-in is due
    if (this.bodyWeight && this.bodyWeight.isWeighInDue()) {
      this.showWeighInModal();
    } else {
      // Go back to home screen
      this.showHomeScreen();
    }
  }
```

**Step 4: Hook into Complete Workout button**

Find `handleCompleteWorkout` method and add pain modal:

```javascript
  handleCompleteWorkout() {
    // ... existing workout completion logic ...

    // Show post-workout pain modal
    this.showPostWorkoutPainModal();
  }
```

**Step 5: Test pain flow manually**

Run: Complete workout, test all three flows:
1. No pain → should save pain-free for all exercises
2. Yes pain, select 1 exercise → should show details, save, then weigh-in
3. Yes pain, select multiple → should loop through all

Expected: All flows work, data saved correctly

**Step 6: Commit**

```bash
git add js/app.js
git commit -m "feat: implement post-workout pain modal logic

Three-step flow with state management:
- Initial check (yes/no)
- Exercise selection (multi-select checkboxes)
- Pain details (severity + location per exercise)

Integrates with existing storage.savePainReport() API"
```

---

## Task 5: Add Band Exercise Detection Utilities

**Files:**
- Modify: `js/app.js` (add utility methods)

**Step 1: Add band detection helper**

Add to `js/app.js` utility methods section:

```javascript
  /**
   * Check if exercise is a band/bodyweight exercise (no weight progression)
   * @param {Object} exercise - Exercise definition from workout
   * @returns {boolean} True if band exercise
   */
  isBandExercise(exercise) {
    return exercise.startingWeight === 0 && exercise.weightIncrement === 0;
  }

  /**
   * Convert band color to weight value
   * @param {string} color - 'light', 'medium', 'heavy', 'x-heavy'
   * @returns {number} Weight in kg
   */
  bandColorToWeight(color) {
    const mapping = {
      'light': 5,
      'medium': 10,
      'heavy': 15,
      'x-heavy': 25
    };
    return mapping[color] || 0; // 0 = custom
  }

  /**
   * Convert weight to band color
   * @param {number} weight - Weight in kg
   * @returns {Object} { color: string, symbol: string, label: string }
   */
  weightToBandColor(weight) {
    const mapping = {
      5: { color: 'light', symbol: '🟡', label: 'Light' },
      10: { color: 'medium', symbol: '🔴', label: 'Medium' },
      15: { color: 'heavy', symbol: '🔵', label: 'Heavy' },
      25: { color: 'x-heavy', symbol: '⚫', label: 'X-Heavy' }
    };
    return mapping[weight] || { color: 'custom', symbol: '⚪', label: 'Custom' };
  }
```

**Step 2: Test utilities manually**

Run: Open browser console, test:
```javascript
app.isBandExercise({ startingWeight: 0, weightIncrement: 0 }) // true
app.bandColorToWeight('medium') // 10
app.weightToBandColor(15) // { color: 'heavy', symbol: '🔵', label: 'Heavy' }
```

Expected: All return correct values

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: add band exercise detection utilities

Helpers for:
- isBandExercise: detect band exercises
- bandColorToWeight: map color names to kg values
- weightToBandColor: map kg values to color objects with symbols"
```

---

## Task 6: Replace Weight Input with Band Color Buttons

**Files:**
- Modify: `js/app.js` (modify renderExerciseSetInputs method)

**Step 1: Find renderExerciseSetInputs method**

Locate the method that renders weight input field (search for "Weight (kg)" or similar).

**Step 2: Add conditional rendering for band exercises**

Modify the weight input section to check for band exercises:

```javascript
  renderExerciseSetInputs(exercise, exerciseIndex, setIndex) {
    const isBand = this.isBandExercise(exercise);

    // Get default weight (from last set or previous workout)
    const defaultWeight = this.getDefaultWeight(exerciseIndex, setIndex);

    // ... existing reps and RIR inputs ...

    // Weight input OR band color buttons
    let weightInputHtml;
    if (isBand) {
      const bandInfo = this.weightToBandColor(defaultWeight || 10); // Default to medium
      weightInputHtml = `
        <div class="form-group">
          <label>Band Resistance</label>
          <div class="band-color-buttons">
            <button type="button" class="band-color-btn ${defaultWeight === 5 ? 'selected' : ''}" data-weight="5">
              🟡 Light (5kg)
            </button>
            <button type="button" class="band-color-btn ${defaultWeight === 10 ? 'selected' : ''}" data-weight="10">
              🔴 Medium (10kg)
            </button>
            <button type="button" class="band-color-btn ${defaultWeight === 15 ? 'selected' : ''}" data-weight="15">
              🔵 Heavy (15kg)
            </button>
            <button type="button" class="band-color-btn ${defaultWeight === 25 ? 'selected' : ''}" data-weight="25">
              ⚫ X-Heavy (25kg)
            </button>
            <button type="button" class="band-color-btn ${![5,10,15,25].includes(defaultWeight) ? 'selected' : ''}" data-weight="custom">
              ⚪ Custom
            </button>
          </div>
          <input type="number"
                 class="band-custom-input"
                 id="weight-input-${exerciseIndex}-${setIndex}"
                 placeholder="Enter weight (kg)"
                 step="0.5"
                 style="display: ${![5,10,15,25].includes(defaultWeight) ? 'block' : 'none'}; margin-top: 12px;"
                 value="${![5,10,15,25].includes(defaultWeight) ? defaultWeight : ''}">
        </div>
      `;
    } else {
      // Regular weight input
      weightInputHtml = `
        <div class="form-group">
          <label for="weight-input-${exerciseIndex}-${setIndex}">Weight (kg)</label>
          <input type="number"
                 id="weight-input-${exerciseIndex}-${setIndex}"
                 value="${defaultWeight}"
                 step="0.5"
                 min="0">
        </div>
      `;
    }

    return `${repsInputHtml}${weightInputHtml}${rirInputHtml}`;
  }
```

**Step 3: Add band button click handlers**

Add event delegation for band color buttons (in initialization or event setup):

```javascript
  setupBandColorButtons() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('band-color-btn')) {
        const btn = e.target;
        const container = btn.closest('.band-color-buttons');
        const customInput = container.parentElement.querySelector('.band-custom-input');

        // Remove selected from all buttons
        container.querySelectorAll('.band-color-btn').forEach(b => b.classList.remove('selected'));

        // Add selected to clicked button
        btn.classList.add('selected');

        // Show/hide custom input
        if (btn.dataset.weight === 'custom') {
          customInput.style.display = 'block';
          customInput.focus();
        } else {
          customInput.style.display = 'none';
          customInput.value = btn.dataset.weight;
        }
      }
    });
  }
```

Call `this.setupBandColorButtons()` in constructor or init method.

**Step 4: Update handleLogSet to read band selection**

Modify `handleLogSet` to get weight from band buttons:

```javascript
  handleLogSet(event) {
    // ... existing code ...

    const exercise = this.currentWorkout.exercises[exerciseIndex];
    const isBand = this.isBandExercise(exercise);

    let weight;
    if (isBand) {
      const selectedBtn = document.querySelector('.band-color-btn.selected');
      if (selectedBtn && selectedBtn.dataset.weight !== 'custom') {
        weight = parseFloat(selectedBtn.dataset.weight);
      } else {
        weight = parseFloat(weightInput.value);
      }
    } else {
      weight = parseFloat(weightInput.value);
    }

    // ... rest of validation and logging ...
  }
```

**Step 5: Test band color selection**

Run: Start workout with Band Pull-Aparts, check:
1. Buttons render instead of weight input
2. Clicking button selects it
3. Custom shows input field
4. Logging set saves correct weight

Expected: All band UI works, weight saved correctly

**Step 6: Commit**

```bash
git add js/app.js
git commit -m "feat: replace weight input with band color buttons

For exercises with startingWeight=0 and weightIncrement=0:
- Show 5 color buttons (Light, Medium, Heavy, X-Heavy, Custom)
- Map to realistic values (5/10/15/25 kg)
- Custom option shows numeric input
- Pre-select last used color or default to Medium"
```

---

## Task 7: Add Band Color Button Styles

**Files:**
- Modify: `css/workout-screen.css`

**Step 1: Add band button grid layout**

Add to `css/workout-screen.css`:

```css
/* Band Color Selection */
.band-color-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}

.band-color-btn {
  height: 50px;
  padding: 8px 12px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.band-color-btn:hover {
  background-color: rgba(124, 58, 237, 0.1);
  border-color: var(--color-accent);
}

.band-color-btn.selected {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}

.band-custom-input {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
  font-size: 16px;
}

@media (max-width: 768px) {
  .band-color-buttons {
    grid-template-columns: 1fr 1fr;
  }

  .band-color-btn {
    font-size: 13px;
    padding: 6px 8px;
  }
}
```

**Step 2: Test styles**

Run: Open Band Pull-Aparts exercise, verify:
- Buttons are large and tappable
- Grid layout responsive
- Selected state clearly visible

Expected: Clean, mobile-friendly button grid

**Step 3: Commit**

```bash
git add css/workout-screen.css
git commit -m "style: add band color button CSS

2-column grid layout, large touch targets (50px height),
clear selected state with accent color"
```

---

## Task 8: Update Exercise History Display for Bands

**Files:**
- Modify: `js/app.js` (modify set display rendering)

**Step 1: Find set display rendering**

Locate where sets are rendered in exercise history (search for "@ ${weight} kg" or similar).

**Step 2: Add band color display logic**

Modify the display to check for band exercises:

```javascript
  formatSetDisplay(set, exercise) {
    const reps = set.reps;
    const weight = set.weight;
    const rir = set.rir;

    let weightDisplay;
    if (this.isBandExercise(exercise)) {
      const bandInfo = this.weightToBandColor(weight);
      if (bandInfo.color === 'custom' && weight > 0) {
        weightDisplay = `${weight} kg`;
      } else if (bandInfo.color === 'custom') {
        weightDisplay = 'Custom';
      } else {
        weightDisplay = `${bandInfo.symbol} ${bandInfo.label}`;
      }
    } else {
      weightDisplay = `${weight} kg`;
    }

    return `${reps} reps @ ${weightDisplay}${rir !== undefined ? ` (RIR ${rir})` : ''}`;
  }
```

Use this helper everywhere sets are displayed.

**Step 3: Test band history display**

Run: Log Band Pull-Apart sets with different colors, check history shows:
- "15 reps @ 🔴 Medium"
- "18 reps @ 🔵 Heavy"

Expected: Emoji and color name shown instead of kg values

**Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat: display band colors in exercise history

Band exercises show emoji + color name (e.g., '15 reps @ 🔴 Medium')
Regular exercises still show '15 reps @ 20 kg'"
```

---

## Task 9: Update Service Worker Cache

**Files:**
- Modify: `sw.js:1`

**Step 1: Bump cache version**

```javascript
const CACHE_NAME = 'build-tracker-v7'; // was v6
```

**Step 2: Test cache update**

Run: Reload app, check console for "Service Worker: Deleting old cache: build-tracker-v6"
Expected: Old cache deleted, new cache created

**Step 3: Commit**

```bash
git add sw.js
git commit -m "chore: bump service worker cache to v7

Force refresh for pain tracking and band color changes"
```

---

## Task 10: Manual Integration Testing

**Files:**
- None (testing only)

**Step 1: Test post-workout pain flow**

Test scenarios:
1. Complete workout with no pain → verify all exercises marked pain-free
2. Complete workout with 1 painful exercise → verify details flow, data saved
3. Complete workout with 3 painful exercises → verify loop through all 3

**Step 2: Test band color selection**

Test scenarios:
1. Log Band Pull-Apart set with each color → verify correct weight saved
2. Use Custom option with manual weight → verify saved correctly
3. Check history shows color symbols and names
4. Verify default to last used color

**Step 3: Test weigh-in integration**

Test scenario:
- Complete workout → pain modal → weigh-in modal
- Verify flow is smooth, no double-modals

**Step 4: Test regular exercises unchanged**

Verify:
- Non-band exercises still show weight input
- Weight validation still works
- History display unchanged for regular exercises

**Step 5: Document test results**

Create `docs/testing/pain-and-band-integration-test-report.md`:

```markdown
# Pain Tracking & Band Color Integration Test Report

**Date:** 2026-02-06
**Tester:** [Name]

## Pain Tracking Tests

- [ ] No pain flow: Works, all exercises marked pain-free
- [ ] Single painful exercise: Works, details saved correctly
- [ ] Multiple painful exercises: Works, loops through all
- [ ] Weigh-in after pain modal: Works, no double-modals

## Band Color Tests

- [ ] Band buttons render for Band Pull-Aparts: Works
- [ ] Color selection saves correct weight: Works (5/10/15/25)
- [ ] Custom weight input: Works
- [ ] History shows color symbols: Works (🟡🔴🔵⚫)
- [ ] Default to last used color: Works

## Regression Tests

- [ ] Regular exercises show weight input: Works
- [ ] Weight validation unchanged: Works
- [ ] Mobility prompts still appear: Works
- [ ] Existing pain data loads: Works

## Issues Found

[List any bugs or issues]

## Sign-off

All tests passing: [Yes/No]
Ready for deployment: [Yes/No]
```

**Step 6: Commit**

```bash
git add docs/testing/pain-and-band-integration-test-report.md
git commit -m "docs: add integration test report template"
```

---

## Task 11: Update README

**Files:**
- Modify: `README.md`

**Step 1: Update cache version in docs**

Find "Cache Management" section:

```markdown
**Cache Management:**
- Service Worker caches all assets for offline use
- Version: `build-tracker-v7` (auto-updates on new deployments)
- Clear cache: Browser settings → Site storage → Clear & reset
```

**Step 2: Add new features to feature list**

Update feature list to mention improvements:

```markdown
- ✅ Post-workout pain tracking (consolidated modal, less friction)
- ✅ Band exercise color selection (visual resistance tracking)
```

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README for pain and band features

Update cache version to v7, document new UX improvements"
```

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-02-06-pain-and-band-implementation-plan.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
