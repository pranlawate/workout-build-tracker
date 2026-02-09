# Post-Workout Summary Screen Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build a comprehensive post-workout summary screen that combines celebration, pain tracking, and weigh-in in one unified experience.

**Architecture:** Replace separate pain/weigh-in modals with single summary screen. Calculate workout stats (duration, volume, PRs) from session data. Inline pain tracking and weigh-in sections. Navigate Summary → Home after completion.

**Tech Stack:** Vanilla JavaScript, DOM manipulation, existing localStorage/StorageManager API, Canvas (no new dependencies)

---

## Task 1: Add Summary Screen HTML Structure

**Files:**
- Modify: `index.html` (add after workout screen, before modals)

**Step 1: Add summary screen container**

Add after `<!-- Workout Screen -->` section ends (around line 200):

```html
<!-- Post-Workout Summary Screen -->
<div id="summary-screen" class="screen" style="display: none;">
  <div class="summary-container">
    <h1 class="summary-title">✅ Workout Complete!</h1>

    <!-- Stats Section -->
    <div id="summary-stats" class="summary-section">
      <!-- Populated dynamically -->
    </div>

    <!-- Pain Tracking Section -->
    <div id="summary-pain" class="summary-section">
      <h2 class="section-title">💪 Pain Check</h2>

      <!-- Initial selection -->
      <div id="pain-initial-choice" class="pain-choice-buttons">
        <button id="pain-no-summary" class="btn btn-primary">No pain ✓</button>
        <button id="pain-yes-summary" class="btn btn-secondary">Yes, I had pain</button>
      </div>

      <!-- Exercise selection (hidden initially) -->
      <div id="pain-exercise-selection-summary" style="display: none;">
        <p>Which exercises had pain? (Select all that apply)</p>
        <div id="pain-exercise-list-summary" class="pain-exercise-checkboxes">
          <!-- Populated dynamically -->
        </div>
        <button id="pain-next-summary" class="btn btn-primary">Next →</button>
      </div>

      <!-- Pain details (hidden initially) -->
      <div id="pain-details-summary" style="display: none;">
        <h3 id="pain-current-exercise"></h3>
        <p id="pain-exercise-progress"></p>

        <p>How severe was the pain?</p>
        <div class="pain-severity-buttons-summary">
          <button class="pain-severity-btn btn btn-secondary" data-severity="minor">Minor</button>
          <button class="pain-severity-btn btn btn-secondary" data-severity="significant">Significant</button>
        </div>

        <p>Where was the pain?</p>
        <div class="pain-location-buttons-summary">
          <button class="pain-location-btn btn btn-secondary" data-location="shoulder">Shoulder</button>
          <button class="pain-location-btn btn btn-secondary" data-location="elbow">Elbow</button>
          <button class="pain-location-btn btn btn-secondary" data-location="wrist">Wrist</button>
          <button class="pain-location-btn btn btn-secondary" data-location="lower_back">Lower back</button>
          <button class="pain-location-btn btn btn-secondary" data-location="knee">Knee</button>
          <button class="pain-location-btn btn btn-secondary" data-location="hip">Hip</button>
          <button class="pain-location-btn btn btn-secondary" data-location="other">Other</button>
        </div>
      </div>
    </div>

    <!-- Weigh-in Section (conditional) -->
    <div id="summary-weighin" class="summary-section" style="display: none;">
      <h2 class="section-title">⚖️ Log Today's Weight</h2>
      <div class="weighin-input-group">
        <input type="number" id="weighin-input-summary" placeholder="75.5" step="0.1" min="30" max="200">
        <span class="unit-label">kg</span>
      </div>
    </div>

    <!-- Done Button -->
    <button id="summary-done-btn" class="btn btn-primary btn-large">Done ✓</button>
  </div>
</div>
```

**Step 2: Verify HTML structure**

Open index.html in browser, inspect elements for:
- `#summary-screen` exists
- All sections present (stats, pain, weighin, done button)
- Pain subsections (initial, selection, details) present

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add post-workout summary screen HTML structure

Four sections: celebration stats, pain tracking, weigh-in, done button
Inline pain tracking (not modal) with progressive disclosure"
```

---

## Task 2: Add Summary Screen CSS

**Files:**
- Create: `css/summary-screen.css`
- Modify: `index.html` (add CSS link in head)

**Step 1: Create CSS file**

Create `css/summary-screen.css`:

```css
/* Post-Workout Summary Screen */
.summary-container {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.summary-title {
  text-align: center;
  font-size: var(--font-2xl);
  margin-bottom: var(--spacing-xl);
  color: var(--color-accent);
}

.summary-section {
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-md);
}

/* Stats Display */
.stat-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  font-size: var(--font-md);
}

.stat-icon {
  font-size: var(--font-xl);
}

.stat-value {
  font-weight: 600;
  color: var(--color-accent);
}

.trend-indicator {
  font-size: var(--font-sm);
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.trend-indicator.down {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* New Records */
.records-list {
  margin-top: var(--spacing-sm);
  padding-left: var(--spacing-lg);
}

.record-item {
  padding: var(--spacing-xs) 0;
  font-size: var(--font-sm);
}

.empty-records {
  text-align: center;
  font-size: var(--font-md);
  color: var(--color-text-dim);
  padding: var(--spacing-md) 0;
}

/* Pain Tracking */
.pain-choice-buttons {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.pain-choice-buttons .btn {
  flex: 1;
  height: 50px;
  font-size: var(--font-md);
}

.pain-exercise-checkboxes {
  margin: var(--spacing-md) 0;
  max-height: 300px;
  overflow-y: auto;
}

.pain-severity-buttons-summary,
.pain-location-buttons-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.pain-severity-buttons-summary .btn,
.pain-location-buttons-summary .btn {
  height: 50px;
}

/* Weigh-in */
.weighin-input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

#weighin-input-summary {
  flex: 1;
  height: 50px;
  font-size: var(--font-lg);
  padding: var(--spacing-sm);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  background: var(--color-bg-primary);
  color: var(--color-text);
}

.unit-label {
  font-size: var(--font-md);
  color: var(--color-text-dim);
  font-weight: 500;
}

/* Done Button */
.btn-large {
  width: 100%;
  height: 60px;
  font-size: var(--font-lg);
  margin-top: var(--spacing-lg);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .summary-container {
    padding: var(--spacing-md);
  }

  .summary-title {
    font-size: var(--font-xl);
  }

  .pain-severity-buttons-summary,
  .pain-location-buttons-summary {
    grid-template-columns: 1fr 1fr;
  }
}
```

**Step 2: Link CSS in HTML**

Add in `<head>` section of index.html:

```html
<link rel="stylesheet" href="css/summary-screen.css">
```

**Step 3: Verify styling**

Open summary screen in browser (manually set `display: block` in DevTools)
Check:
- Sections have proper spacing
- Buttons are large (50-60px)
- Mobile responsive layout works

**Step 4: Commit**

```bash
git add css/summary-screen.css index.html
git commit -m "style: add post-workout summary screen CSS

Large touch targets, responsive grid, clean section spacing
Mobile-optimized layout for 320px+ screens"
```

---

## Task 3: Calculate Workout Stats (Duration, Volume)

**Files:**
- Modify: `js/app.js` (add helper methods)

**Step 1: Add calculateWorkoutStats method**

Add to `js/app.js` utility methods section (around line 1200):

```javascript
  /**
   * Calculate workout statistics
   * @param {Object} workoutData - Completed workout data
   * @returns {Object} Stats object with duration, volume, comparison
   */
  calculateWorkoutStats(workoutData) {
    const { workoutName, exercises, startTime, endTime } = workoutData;

    // Calculate duration
    const durationSeconds = Math.floor((endTime - startTime) / 1000);
    const durationFormatted = this.formatDuration(durationSeconds);

    // Calculate total volume
    let totalVolume = 0;
    exercises.forEach(exercise => {
      if (exercise.sessionData && exercise.sessionData.sets) {
        exercise.sessionData.sets.forEach(set => {
          if (set.reps && set.weight) {
            totalVolume += set.reps * set.weight;
          }
        });
      }
    });

    // Get volume comparison (compare to last time this workout was done)
    const volumeComparison = this.getVolumeComparison(workoutName, totalVolume);

    return {
      workoutName,
      displayName: workoutData.displayName || workoutName,
      duration: durationFormatted,
      durationSeconds,
      totalVolume: Math.round(totalVolume),
      volumeComparison
    };
  }

  /**
   * Format duration in seconds to friendly string
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  }

  /**
   * Get volume comparison to last workout
   * @param {string} workoutName - Name of workout
   * @param {number} currentVolume - Current total volume
   * @returns {Object|null} Comparison object or null
   */
  getVolumeComparison(workoutName, currentVolume) {
    const history = this.storage.getWorkoutHistory(workoutName, 2);
    if (history.length < 2) return null; // Need previous workout for comparison

    // Calculate previous volume (second most recent, since most recent is current)
    let previousVolume = 0;
    const previousWorkout = history[1];

    if (previousWorkout && previousWorkout.exercises) {
      previousWorkout.exercises.forEach(exercise => {
        if (exercise.sets) {
          exercise.sets.forEach(set => {
            if (set.reps && set.weight) {
              previousVolume += set.reps * set.weight;
            }
          });
        }
      });
    }

    if (previousVolume === 0) return null;

    const percentChange = ((currentVolume - previousVolume) / previousVolume) * 100;

    // Only show if >10% difference
    if (Math.abs(percentChange) < 10) return null;

    return {
      percent: Math.round(percentChange),
      direction: percentChange > 0 ? 'up' : 'down'
    };
  }
```

**Step 2: Self-review**

Check:
- Duration calculation uses workoutSession startTime/endTime
- Volume sums all (reps × weight) for all sets
- Comparison only shows if >10% difference
- Returns null for first-time workouts

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: add workout stats calculation helpers

Calculate duration, total volume, and volume comparison
Format duration as friendly string (32 minutes / 1h 5m)
Only show comparison if >10% difference from last workout"
```

---

## Task 4: Detect New Records (PRs)

**Files:**
- Modify: `js/app.js` (add PR detection method)

**Step 1: Add detectNewRecords method**

Add to `js/app.js`:

```javascript
  /**
   * Detect new personal records (weight PRs and rep PRs)
   * @param {Object} workoutData - Completed workout data
   * @returns {Array} Array of PR objects
   */
  detectNewRecords(workoutData) {
    const newRecords = [];

    workoutData.exercises.forEach(exercise => {
      if (!exercise.sessionData || !exercise.sessionData.sets) return;

      const exerciseKey = `${workoutData.workoutName} - ${exercise.name}`;
      const history = this.storage.getExerciseHistory(exerciseKey);

      // Get max weight used today
      const todayWeights = exercise.sessionData.sets
        .filter(set => set.weight && set.reps)
        .map(set => set.weight);

      if (todayWeights.length === 0) return;

      const todayMaxWeight = Math.max(...todayWeights);

      // Check for weight PR
      const weightPR = this.checkWeightPR(history, todayMaxWeight);
      if (weightPR) {
        newRecords.push({
          exercise: exercise.name,
          type: 'weight',
          from: weightPR.from,
          to: weightPR.to
        });
      }

      // Check for rep PRs at each weight used today
      const repPRs = this.checkRepPRs(exercise.sessionData.sets, history);
      repPRs.forEach(pr => {
        newRecords.push({
          exercise: exercise.name,
          type: 'reps',
          weight: pr.weight,
          from: pr.from,
          to: pr.to
        });
      });
    });

    return newRecords.slice(0, 5); // Max 5 records
  }

  /**
   * Check for weight PR
   * @param {Array} history - Exercise history
   * @param {number} todayMaxWeight - Max weight used today
   * @returns {Object|null} PR object or null
   */
  checkWeightPR(history, todayMaxWeight) {
    if (history.length === 0) return null; // No history = can't be a PR

    let maxWeightEver = 0;
    history.forEach(session => {
      if (session.sets) {
        session.sets.forEach(set => {
          if (set.weight && set.weight > maxWeightEver) {
            maxWeightEver = set.weight;
          }
        });
      }
    });

    if (todayMaxWeight > maxWeightEver) {
      return { from: maxWeightEver, to: todayMaxWeight };
    }

    return null;
  }

  /**
   * Check for rep PRs
   * @param {Array} todaySets - Today's sets
   * @param {Array} history - Exercise history
   * @returns {Array} Array of rep PR objects
   */
  checkRepPRs(todaySets, history) {
    const repPRs = [];

    // Get unique weights used today
    const weightsUsedToday = [...new Set(todaySets.map(set => set.weight))];

    weightsUsedToday.forEach(weight => {
      // Get max reps at this weight today
      const repsAtWeightToday = todaySets
        .filter(set => set.weight === weight && set.reps)
        .map(set => set.reps);

      if (repsAtWeightToday.length === 0) return;

      const maxRepsToday = Math.max(...repsAtWeightToday);

      // Get max reps at this weight historically
      let maxRepsEver = 0;
      history.forEach(session => {
        if (session.sets) {
          session.sets.forEach(set => {
            if (set.weight === weight && set.reps && set.reps > maxRepsEver) {
              maxRepsEver = set.reps;
            }
          });
        }
      });

      if (maxRepsToday > maxRepsEver) {
        repPRs.push({
          weight,
          from: maxRepsEver,
          to: maxRepsToday
        });
      }
    });

    return repPRs;
  }
```

**Step 2: Self-review**

Check:
- Weight PR: compares today's max weight to historical max
- Reps PR: compares reps at same weight to historical max at that weight
- Returns max 5 records
- Handles empty history gracefully

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: add new records (PR) detection

Detect weight PRs (heavier than ever) and rep PRs (more reps at same weight)
Compare current session to exercise history
Return max 5 records with before/after data"
```

---

## Task 5: Render Summary Screen with Stats

**Files:**
- Modify: `js/app.js` (add showWorkoutSummary method)

**Step 1: Add showWorkoutSummary method**

Add to `js/app.js`:

```javascript
  /**
   * Show post-workout summary screen
   * @param {Object} workoutData - Completed workout data
   */
  showWorkoutSummary(workoutData) {
    // Calculate stats
    const stats = this.calculateWorkoutStats(workoutData);
    const newRecords = this.detectNewRecords(workoutData);

    // Show summary screen
    this.hideAllScreens();
    document.getElementById('summary-screen').style.display = 'block';
    window.history.pushState({ screen: 'summary' }, '', '');

    // Render stats section
    this.renderSummaryStats(stats, newRecords);

    // Setup pain tracking (reuse logic, inline)
    this.setupSummaryPainTracking(workoutData);

    // Setup weigh-in (conditional)
    this.setupSummaryWeighIn();

    // Setup done button
    this.setupSummaryDoneButton(workoutData);
  }

  /**
   * Render summary stats section
   * @param {Object} stats - Workout stats
   * @param {Array} newRecords - Array of PRs
   */
  renderSummaryStats(stats, newRecords) {
    const container = document.getElementById('summary-stats');

    // Update title
    document.querySelector('.summary-title').textContent =
      `✅ ${stats.displayName} Complete!`;

    // Build stats HTML
    let html = '';

    // Duration
    html += `
      <div class="stat-row">
        <span class="stat-icon">⏱️</span>
        <span>${stats.duration}</span>
      </div>
    `;

    // Total volume
    html += `
      <div class="stat-row">
        <span class="stat-icon">📊</span>
        <span>${stats.totalVolume.toLocaleString()} kg total volume</span>
        ${stats.volumeComparison ? this.renderVolumeComparison(stats.volumeComparison) : ''}
      </div>
    `;

    // New records
    if (newRecords.length > 0) {
      html += `
        <div class="stat-row">
          <span class="stat-icon">🎉</span>
          <span class="stat-value">${newRecords.length} New Record${newRecords.length > 1 ? 's' : ''}!</span>
        </div>
        <ul class="records-list">
          ${newRecords.map(record => this.renderRecord(record)).join('')}
        </ul>
      `;
    } else {
      html += `
        <div class="empty-records">Keep pushing! 💪</div>
      `;
    }

    container.innerHTML = html;
  }

  /**
   * Render volume comparison indicator
   * @param {Object} comparison - Comparison object
   * @returns {string} HTML string
   */
  renderVolumeComparison(comparison) {
    const directionClass = comparison.direction === 'up' ? '' : 'down';
    const emoji = comparison.direction === 'up' ? '📈' : '📉';
    const sign = comparison.direction === 'up' ? '+' : '';

    return `
      <span class="trend-indicator ${directionClass}">
        ${emoji} ${sign}${comparison.percent}%
      </span>
    `;
  }

  /**
   * Render individual record
   * @param {Object} record - Record object
   * @returns {string} HTML string
   */
  renderRecord(record) {
    if (record.type === 'weight') {
      return `<li class="record-item">• ${record.exercise}: ${record.from}kg → ${record.to}kg</li>`;
    } else {
      return `<li class="record-item">• ${record.exercise} @ ${record.weight}kg: ${record.from} → ${record.to} reps</li>`;
    }
  }
```

**Step 2: Self-review**

Check:
- Stats render correctly (duration, volume, comparison)
- New records display with proper formatting
- Empty state shows when no records
- Screen navigation works

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: render summary screen with workout stats

Display workout name, duration, volume with comparison
Show new records with before/after values
Empty state for no records
Navigate to summary screen after workout completion"
```

---

## Task 6: Integrate Pain Tracking in Summary

**Files:**
- Modify: `js/app.js` (add summary pain tracking methods)

**Step 1: Add setupSummaryPainTracking method**

Add to `js/app.js`:

```javascript
  /**
   * Setup pain tracking section in summary
   * @param {Object} workoutData - Workout data with exercises
   */
  setupSummaryPainTracking(workoutData) {
    const painNoBtnconst = document.getElementById('pain-no-summary');
    const painYesBtn = document.getElementById('pain-yes-summary');
    const initialChoice = document.getElementById('pain-initial-choice');
    const exerciseSelection = document.getElementById('pain-exercise-selection-summary');
    const painDetails = document.getElementById('pain-details-summary');

    // State tracking
    let painfulExercises = [];
    let currentPainIndex = 0;
    let selectedSeverity = null;

    // Reset to initial state
    initialChoice.style.display = 'flex';
    exerciseSelection.style.display = 'none';
    painDetails.style.display = 'none';

    // Pre-select "No pain"
    painNoBtn.classList.remove('btn-secondary');
    painNoBtn.classList.add('btn-primary');
    painYesBtn.classList.remove('btn-primary');
    painYesBtn.classList.add('btn-secondary');

    // Store default: no pain
    this.summaryPainSelection = 'no';

    // "No pain" button
    painNoBtn.onclick = () => {
      this.summaryPainSelection = 'no';
      painNoBtn.classList.remove('btn-secondary');
      painNoBtn.classList.add('btn-primary');
      painYesBtn.classList.remove('btn-primary');
      painYesBtn.classList.add('btn-secondary');

      // Hide expanded sections
      exerciseSelection.style.display = 'none';
      painDetails.style.display = 'none';
    };

    // "Yes, I had pain" button
    painYesBtn.onclick = () => {
      this.summaryPainSelection = 'yes';
      painYesBtn.classList.remove('btn-secondary');
      painYesBtn.classList.add('btn-primary');
      painNoBtn.classList.remove('btn-primary');
      painNoBtn.classList.add('btn-secondary');

      // Show exercise selection
      initialChoice.style.display = 'flex'; // Keep visible
      exerciseSelection.style.display = 'block';

      // Populate exercise checkboxes
      const exerciseList = document.getElementById('pain-exercise-list-summary');
      exerciseList.innerHTML = '';

      workoutData.exercises.forEach((exercise, index) => {
        const exerciseKey = `${workoutData.workoutName} - ${exercise.name}`;
        const item = document.createElement('div');
        item.className = 'pain-exercise-checkbox-item';
        item.innerHTML = `
          <input type="checkbox" id="pain-ex-summary-${index}" value="${exerciseKey}">
          <label for="pain-ex-summary-${index}">${this.escapeHtml(exercise.name)}</label>
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
    document.getElementById('pain-next-summary').onclick = () => {
      // Collect checked exercises
      const checkboxes = document.querySelectorAll('#pain-exercise-list-summary input[type="checkbox"]:checked');
      painfulExercises = Array.from(checkboxes).map(cb => ({
        key: cb.value,
        name: cb.nextElementSibling.textContent
      }));

      if (painfulExercises.length === 0) {
        alert('Please select at least one exercise, or click "No Pain"');
        return;
      }

      // Show pain details for first exercise
      currentPainIndex = 0;
      this.showSummaryPainDetails(painfulExercises, currentPainIndex, workoutData);
    };

    // Store reference for later
    this.summaryPainfulExercises = [];
  }

  /**
   * Show pain details for selected exercise in summary
   * @param {Array} painfulExercises - Array of painful exercises
   * @param {number} index - Current exercise index
   * @param {Object} workoutData - Workout data
   */
  showSummaryPainDetails(painfulExercises, index, workoutData) {
    if (index >= painfulExercises.length) {
      // All done - store for saving later
      this.summaryPainfulExercises = painfulExercises;

      // Hide pain details, return to summary
      document.getElementById('pain-details-summary').style.display = 'none';
      return;
    }

    const painDetails = document.getElementById('pain-details-summary');
    const exerciseSelection = document.getElementById('pain-exercise-selection-summary');

    // Hide selection, show details
    exerciseSelection.style.display = 'none';
    painDetails.style.display = 'block';

    // Set exercise name and progress
    document.getElementById('pain-current-exercise').textContent = painfulExercises[index].name;
    document.getElementById('pain-exercise-progress').textContent =
      `Exercise ${index + 1} of ${painfulExercises.length}`;

    // Setup severity buttons
    const severityBtns = document.querySelectorAll('.pain-severity-btn');
    let selectedSeverity = null;

    severityBtns.forEach(btn => {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');

      btn.onclick = () => {
        selectedSeverity = btn.dataset.severity;
        severityBtns.forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
      };
    });

    // Setup location buttons
    const locationBtns = document.querySelectorAll('.pain-location-buttons-summary .pain-location-btn');
    locationBtns.forEach(btn => {
      btn.onclick = () => {
        if (!selectedSeverity) {
          alert('Please select pain severity first');
          return;
        }

        const location = btn.dataset.location;

        // Store pain data for this exercise
        painfulExercises[index].severity = selectedSeverity;
        painfulExercises[index].location = location;

        // Move to next exercise
        this.showSummaryPainDetails(painfulExercises, index + 1, workoutData);
      };
    });
  }
```

**Step 2: Self-review**

Check:
- Pain section defaults to "No pain" selected
- Expanding works (Yes → exercise list → details)
- Pain data stored for later saving
- Reuses existing checkbox/button logic

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: integrate pain tracking in summary screen

Inline pain tracking with progressive disclosure
Default: no pain pre-selected
Expand on 'Yes' to show exercise selection and details
Store pain data for saving on Done click"
```

---

## Task 7: Integrate Weigh-in in Summary

**Files:**
- Modify: `js/app.js` (add summary weigh-in method)

**Step 1: Add setupSummaryWeighIn method**

Add to `js/app.js`:

```javascript
  /**
   * Setup weigh-in section in summary (conditional)
   */
  setupSummaryWeighIn() {
    const weighinSection = document.getElementById('summary-weighin');
    const weighinInput = document.getElementById('weighin-input-summary');

    // Check if weigh-in is due
    const weighinDue = this.bodyWeight && this.bodyWeight.isWeighInDue();

    if (!weighinDue) {
      weighinSection.style.display = 'none';
      return;
    }

    // Show weigh-in section
    weighinSection.style.display = 'block';

    // Pre-fill with last weight or default
    const data = this.bodyWeight.getData();
    const lastWeight = data.entries.length > 0
      ? data.entries[data.entries.length - 1].weight_kg
      : 57.5;

    weighinInput.value = lastWeight;

    // Auto-select for quick entry
    setTimeout(() => weighinInput.select(), 100);
  }
```

**Step 2: Self-review**

Check:
- Only shows if isWeighInDue() returns true
- Pre-fills with last weight or 57.5kg
- Input auto-selected for quick entry

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: integrate weigh-in in summary screen

Conditional display based on isWeighInDue() check
Pre-fill with last weight or 57.5kg default
Auto-select input for quick data entry"
```

---

## Task 8: Handle Done Button and Data Saving

**Files:**
- Modify: `js/app.js` (add summary done button handler)

**Step 1: Add setupSummaryDoneButton method**

Add to `js/app.js`:

```javascript
  /**
   * Setup done button for summary screen
   * @param {Object} workoutData - Workout data
   */
  setupSummaryDoneButton(workoutData) {
    const doneBtn = document.getElementById('summary-done-btn');

    doneBtn.onclick = () => {
      // Validate and save pain data
      if (!this.saveSummaryPainData(workoutData)) {
        return; // Validation failed
      }

      // Save weigh-in data (if section visible)
      this.saveSummaryWeighInData();

      // Navigate to home screen
      this.showHomeScreen();
    };
  }

  /**
   * Save pain data from summary
   * @param {Object} workoutData - Workout data
   * @returns {boolean} True if successful, false if validation failed
   */
  saveSummaryPainData(workoutData) {
    if (this.summaryPainSelection === 'no') {
      // Save pain-free status for all exercises
      workoutData.exercises.forEach(exercise => {
        const exerciseKey = `${workoutData.workoutName} - ${exercise.name}`;
        this.storage.savePainReport(exerciseKey, false, null, null);
      });
      return true;
    }

    // User selected "Yes, I had pain"
    if (!this.summaryPainfulExercises || this.summaryPainfulExercises.length === 0) {
      // Check if they selected exercises
      const checkboxes = document.querySelectorAll('#pain-exercise-list-summary input[type="checkbox"]:checked');
      if (checkboxes.length === 0) {
        alert('Please select exercises with pain, or click "No Pain"');
        return false;
      }
    }

    // Validate pain details completed
    const incompletePain = this.summaryPainfulExercises.find(ex => !ex.severity || !ex.location);
    if (incompletePain) {
      alert('Please complete pain details for all selected exercises');
      return false;
    }

    // Save pain data for each exercise
    this.summaryPainfulExercises.forEach(painfulEx => {
      this.storage.savePainReport(
        painfulEx.key,
        true,
        painfulEx.location,
        painfulEx.severity
      );
    });

    // Save pain-free for non-painful exercises
    workoutData.exercises.forEach(exercise => {
      const exerciseKey = `${workoutData.workoutName} - ${exercise.name}`;
      const isPainful = this.summaryPainfulExercises.some(p => p.key === exerciseKey);
      if (!isPainful) {
        this.storage.savePainReport(exerciseKey, false, null, null);
      }
    });

    return true;
  }

  /**
   * Save weigh-in data from summary
   */
  saveSummaryWeighInData() {
    const weighinSection = document.getElementById('summary-weighin');

    // Only save if section is visible
    if (weighinSection.style.display === 'none') {
      return;
    }

    const weighinInput = document.getElementById('weighin-input-summary');
    const weight = parseFloat(weighinInput.value);

    // Validate weight
    if (isNaN(weight) || weight < 30 || weight > 200) {
      // Optional field - just skip if invalid
      return;
    }

    // Save weight
    const result = this.bodyWeight.addEntry(weight);

    if (result.replaced) {
      console.log(`[Summary] Updated today's weight to ${weight} kg`);
    } else {
      console.log(`[Summary] Logged weight: ${weight} kg`);
    }
  }
```

**Step 2: Self-review**

Check:
- Pain validation works (must select exercises if "Yes")
- Pain data saves correctly for painful and pain-free exercises
- Weigh-in saves only if section visible and valid
- Navigation to home screen works

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: handle done button and save summary data

Validate pain selection (exercises required if 'Yes')
Save pain reports for all exercises (painful + pain-free)
Save weigh-in data if section visible and valid
Navigate to home screen on completion"
```

---

## Task 9: Update completeWorkout to Show Summary

**Files:**
- Modify: `js/app.js` (update completeWorkout method)

**Step 1: Modify completeWorkout method**

Find `completeWorkout()` method (around line 2615) and update:

```javascript
  completeWorkout() {
    if (!this.workoutSession || !this.currentWorkout) return;

    // ... existing validation and partial workout logic ...

    try {
      // ... existing save workout logic ...

      // Show appropriate confirmation message
      if (isPartialWorkout) {
        alert(`💾 Partial workout saved!\n\n${completedCount} of ${totalExercises} exercises completed.\n\nNext time you'll continue with ${this.currentWorkout.displayName}.`);
        this.showHomeScreen();
      } else {
        alert(`✅ ${this.currentWorkout.displayName} completed!`);

        // NEW: Show summary screen instead of pain modal
        const workoutData = {
          workoutName: this.currentWorkout.name,
          displayName: this.currentWorkout.displayName,
          exercises: this.currentWorkout.exercises,
          startTime: this.workoutSession.startTime,
          endTime: Date.now()
        };

        this.showWorkoutSummary(workoutData);

        // REMOVE: Old pain modal call
        // this.showPostWorkoutPainModal();
      }
    } catch (error) {
      console.error('Failed to save workout:', error);
      alert('⚠️ Failed to save workout. Please try again or check storage.');
    }
  }
```

**Step 2: Test flow manually**

1. Complete a workout
2. Verify alert shows
3. Verify summary screen appears with stats
4. Check pain section, weigh-in section
5. Click Done, verify home screen

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: integrate summary screen into workout completion flow

Replace pain modal call with summary screen navigation
Pass workout data (name, exercises, times) to summary
Maintain partial workout flow (skip summary)"
```

---

## Task 10: Update Service Worker Cache

**Files:**
- Modify: `sw.js`

**Step 1: Bump cache version and add new file**

Update `sw.js`:

```javascript
const CACHE_NAME = 'build-tracker-v8'; // was v7

const CACHE_URLS = [
  // ... existing files ...
  '/css/summary-screen.css', // ADD THIS
  // ... rest of files ...
];
```

**Step 2: Test cache update**

Run: Reload app, check console for cache update
Expected: Old cache deleted, new cache with summary-screen.css

**Step 3: Commit**

```bash
git add sw.js
git commit -m "chore: bump service worker cache to v8

Add css/summary-screen.css to cache
Force refresh for summary screen feature"
```

---

## Task 11: Manual Integration Testing

**Files:**
- Update: `docs/testing/integration-test-master.md`

**Step 1: Add test cases for summary screen**

Add new section to integration test master:

```markdown
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
```

**Step 2: Test manually**

Run through all test cases and document results

**Step 3: Commit**

```bash
git add docs/testing/integration-test-master.md
git commit -m "docs: add summary screen tests to integration test master

5 test cases covering stats, PRs, pain, weigh-in, navigation"
```

---

## Task 12: Update Documentation

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`

**Step 1: Update README**

Update features section in README.md:

```markdown
- ✅ Post-workout summary screen (stats, PRs, pain tracking, weigh-in)
```

**Step 2: Update CHANGELOG**

Add to CHANGELOG.md:

```markdown
## [1.3.0] - 2026-02-09

### Added - Post-Workout Summary Screen 🎉

**Comprehensive Post-Workout Experience:**
- Single summary screen replaces multiple modals
- Celebration section: workout duration, total volume, volume comparison
- New records detection: weight PRs and rep PRs
- Inline pain tracking (replaces pain modal)
- Inline weigh-in (conditional, only if due)
- One "Done" button to complete and return home

**Statistics Display:**
- Duration formatted as friendly string (32 minutes / 1h 5m)
- Total volume with comparison to last workout (>10% shows trend)
- New records with clear before/after (e.g., "25kg → 27.5kg")
- Empty state for no records: "Keep pushing! 💪"

**User Experience:**
- Quick completion: <10 seconds if no pain/weight needed
- Progressive disclosure: pain section expands only if selected
- Smart defaults: "No pain" pre-selected, weight pre-filled
- Mobile responsive: large touch targets, scrollable

### Changed
- Service worker cache updated to v8
- Pain tracking: inline in summary (not separate modal)
- Weigh-in: inline in summary (not separate modal)
- Workout completion flow: Alert → Summary → Home (simplified)

### Technical
- New CSS: `css/summary-screen.css`
- New methods: `showWorkoutSummary()`, `calculateWorkoutStats()`, `detectNewRecords()`
- PR detection: compares current to exercise history (weight + reps)
- Reuses existing pain/weigh-in logic (no duplication)

**Commits:** 12 clean commits following conventional format
```

**Step 3: Commit**

```bash
git add README.md CHANGELOG.md
git commit -m "docs: update README and CHANGELOG for summary screen

Document v1.3.0 release with summary screen feature
Update features list in README
Add comprehensive changelog entry"
```

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-02-09-post-workout-summary-implementation-plan.md`.

**Ready for subagent-driven development!**

I'll dispatch fresh subagents per task with two-stage review (spec compliance + code quality), just like we did for the pain tracking and band color features.
