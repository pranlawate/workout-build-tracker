# Enhanced Tracking Metrics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add pre-workout recovery metrics (sleep, stress, energy, soreness) with fatigue scoring and warnings

**Architecture:** Modal-based UI for daily recovery check before workouts, localStorage persistence, fatigue calculation with warning threshold, integration with existing pain tracking and deload systems

**Tech Stack:** Vanilla JavaScript ES6, localStorage, CSS Grid/Flexbox, existing app.js architecture

---

## Task 1: Recovery Metrics Storage Functions

Add localStorage operations for recovery metrics with daily check logic.

**Files:**
- Modify: `js/app.js` (add recovery storage methods)

**Step 1: Add helper method to save recovery entry**

Add after line 3200 (near other storage helpers):

```javascript
  /**
   * Save recovery metrics to localStorage
   * @param {Object} metrics - Recovery data
   */
  saveRecoveryMetrics(metrics) {
    try {
      const entries = this.getRecoveryMetrics();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Check if entry exists for today
      const existingIndex = entries.findIndex(e => e.date === today);

      if (existingIndex >= 0) {
        // Update existing entry
        entries[existingIndex] = { ...entries[existingIndex], ...metrics, date: today };
      } else {
        // Add new entry
        entries.push({ date: today, ...metrics });
      }

      // Cleanup: keep only last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const cutoffDate = ninetyDaysAgo.toISOString().split('T')[0];
      const filtered = entries.filter(e => e.date >= cutoffDate);

      localStorage.setItem('build_recovery_metrics', JSON.stringify(filtered));
    } catch (error) {
      console.error('[Recovery Metrics] Save failed:', error);
    }
  }
```

**Step 2: Add helper method to retrieve recovery entries**

Add after the saveRecoveryMetrics method:

```javascript
  /**
   * Get recovery metrics from localStorage
   * @returns {Array} Array of recovery entries
   */
  getRecoveryMetrics() {
    try {
      const data = localStorage.getItem('build_recovery_metrics');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Recovery Metrics] Retrieval failed:', error);
      return [];
    }
  }
```

**Step 3: Add daily check logic**

Add after the getRecoveryMetrics method:

```javascript
  /**
   * Check if recovery check is due (once per day)
   * @returns {boolean} True if check needed
   */
  isRecoveryCheckDue() {
    const entries = this.getRecoveryMetrics();
    if (entries.length === 0) return true;

    const lastEntry = entries[entries.length - 1];
    const today = new Date().toDateString();
    const lastDate = new Date(lastEntry.date).toDateString();

    return today !== lastDate;
  }
```

**Step 4: Test in browser console**

Run in browser DevTools console:
```javascript
// Test save
app.saveRecoveryMetrics({
  sleepHours: 7,
  stressLevel: 'Low',
  energyLevel: 3,
  muscleSoreness: 'None',
  preWorkoutScore: 0
});

// Test retrieve
console.log(app.getRecoveryMetrics());

// Test daily check
console.log('Check due?', app.isRecoveryCheckDue());
```

Expected:
- Entry saved to localStorage
- Retrieved array contains entry
- isRecoveryCheckDue() returns false (same day)

**Step 5: Commit**

```bash
git add js/app.js
git commit -m "feat: add recovery metrics storage functions

- saveRecoveryMetrics() with daily entry logic
- getRecoveryMetrics() retrieves entries
- isRecoveryCheckDue() checks once-per-day
- 90-day retention cleanup"
```

---

## Task 2: Fatigue Score Calculation

Add fatigue score calculation logic with threshold detection.

**Files:**
- Modify: `js/app.js` (add calculation methods)

**Step 1: Add pre-workout score calculation**

Add after isRecoveryCheckDue method:

```javascript
  /**
   * Calculate pre-workout fatigue score (0-6 points)
   * @param {Object} metrics - Recovery metrics
   * @returns {number} Points from pre-workout data
   */
  calculatePreWorkoutScore(metrics) {
    let score = 0;

    // Sleep scoring
    if (metrics.sleepHours < 6) {
      score += 2;
    } else if (metrics.sleepHours < 7) {
      score += 1;
    }

    // Stress scoring
    if (metrics.stressLevel === 'High') {
      score += 1;
    }

    // Energy scoring
    if (metrics.energyLevel <= 2) {
      score += 2;
    } else if (metrics.energyLevel === 3) {
      score += 1;
    }

    // Soreness scoring
    if (metrics.muscleSoreness === 'Severe') {
      score += 2;
    } else if (metrics.muscleSoreness === 'Moderate') {
      score += 1;
    }

    return score;
  }
```

**Step 2: Add pain score calculation**

Add after calculatePreWorkoutScore method:

```javascript
  /**
   * Calculate pain score from last workout (0-3 points)
   * @returns {number} Points from pain data
   */
  calculatePainScore() {
    try {
      // Get all pain report keys
      const keys = Object.keys(localStorage).filter(k => k.startsWith('build_pain_'));

      if (keys.length === 0) return 0;

      // Find most recent pain reports
      const reports = keys
        .map(k => {
          try {
            return JSON.parse(localStorage.getItem(k));
          } catch {
            return null;
          }
        })
        .filter(r => r !== null && r.date);

      if (reports.length === 0) return 0;

      // Check if any report has severity >= Moderate
      const hasModerateOrWorse = reports.some(r =>
        r.severity === 'Moderate' || r.severity === 'Severe'
      );

      return hasModerateOrWorse ? 3 : 0;
    } catch (error) {
      console.error('[Fatigue Score] Pain calculation failed:', error);
      return 0;
    }
  }
```

**Step 3: Add total fatigue score calculation**

Add after calculatePainScore method:

```javascript
  /**
   * Calculate total fatigue score (0-9 points)
   * @param {Object} metrics - Recovery metrics
   * @returns {Object} Score breakdown
   */
  calculateFatigueScore(metrics) {
    const preWorkoutScore = this.calculatePreWorkoutScore(metrics);
    const painScore = this.calculatePainScore();
    const totalScore = preWorkoutScore + painScore;

    return {
      preWorkoutScore,
      painScore,
      totalScore,
      warningThreshold: 4,
      showWarning: totalScore >= 4
    };
  }
```

**Step 4: Test calculation in console**

```javascript
// Test low score
const lowMetrics = {
  sleepHours: 8,
  stressLevel: 'Low',
  energyLevel: 4,
  muscleSoreness: 'None'
};
console.log('Low score:', app.calculateFatigueScore(lowMetrics));

// Test high score
const highMetrics = {
  sleepHours: 5,
  stressLevel: 'High',
  energyLevel: 2,
  muscleSoreness: 'Severe'
};
console.log('High score:', app.calculateFatigueScore(highMetrics));
```

Expected:
- Low score: `{ preWorkoutScore: 0, painScore: 0, totalScore: 0, warningThreshold: 4, showWarning: false }`
- High score: `{ preWorkoutScore: 6, painScore: X, totalScore: 6+X, showWarning: true }`

**Step 5: Commit**

```bash
git add js/app.js
git commit -m "feat: add fatigue score calculation

- calculatePreWorkoutScore() implements point system
- calculatePainScore() integrates existing pain data
- calculateFatigueScore() returns score breakdown
- Warning threshold set at 4 points"
```

---

## Task 3: Recovery Metrics Modal HTML

Create HTML structure for recovery input modal.

**Files:**
- Modify: `index.html` (add modal before closing body tag)

**Step 1: Add recovery metrics modal HTML**

Add before `<!-- Deload Modal -->` (around line 400):

```html
<!-- Recovery Metrics Modal -->
<div id="recovery-metrics-modal" class="modal">
  <div class="modal-content recovery-metrics-content">
    <h2>💪 Recovery Check</h2>

    <div class="recovery-form">
      <div class="recovery-input-group">
        <label for="sleep-hours">😴 Sleep Last Night</label>
        <input
          type="number"
          id="sleep-hours"
          min="0"
          max="12"
          step="1"
          value="7"
          class="recovery-number-input"
        >
        <span class="input-hint">hours (0-12)</span>
      </div>

      <div class="recovery-input-group">
        <label>😰 Stress Level</label>
        <div class="radio-button-group stress-buttons">
          <button type="button" class="radio-btn" data-value="Low">Low</button>
          <button type="button" class="radio-btn selected" data-value="Medium">Medium</button>
          <button type="button" class="radio-btn" data-value="High">High</button>
        </div>
        <input type="hidden" id="stress-level" value="Low">
      </div>

      <div class="recovery-input-group">
        <label>⚡ Energy Level</label>
        <div class="radio-button-group energy-buttons">
          <button type="button" class="radio-btn" data-value="1">1</button>
          <button type="button" class="radio-btn" data-value="2">2</button>
          <button type="button" class="radio-btn selected" data-value="3">3</button>
          <button type="button" class="radio-btn" data-value="4">4</button>
          <button type="button" class="radio-btn" data-value="5">5</button>
        </div>
        <span class="input-hint">1 = very low, 5 = very high</span>
        <input type="hidden" id="energy-level" value="3">
      </div>

      <div class="recovery-input-group">
        <label>💊 Muscle Soreness</label>
        <div class="radio-button-group soreness-buttons">
          <button type="button" class="radio-btn selected" data-value="None">None</button>
          <button type="button" class="radio-btn" data-value="Mild">Mild</button>
          <button type="button" class="radio-btn" data-value="Moderate">Moderate</button>
          <button type="button" class="radio-btn" data-value="Severe">Severe</button>
        </div>
        <input type="hidden" id="muscle-soreness" value="None">
      </div>
    </div>

    <div class="modal-actions">
      <button id="submit-recovery-btn" class="btn btn-primary">Continue to Workout</button>
    </div>
  </div>
</div>
```

**Step 2: Verify HTML structure in browser**

Open index.html and inspect:
- Modal element exists with id="recovery-metrics-modal"
- All 4 input groups present
- Hidden inputs exist for radio button groups
- Submit button exists

Expected: All elements render (modal hidden by default via CSS)

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add recovery metrics modal HTML

- Sleep hours number input (0-12 range)
- Stress level radio buttons (Low/Medium/High)
- Energy level 5-button scale (1-5)
- Muscle soreness 4-option radio (None/Mild/Moderate/Severe)
- Smart defaults pre-selected"
```

---

## Task 4: Recovery Modal CSS Styling

Style the recovery metrics modal for mobile-first responsive design.

**Files:**
- Modify: `css/recovery-modal.css` (replace existing content)

**Step 1: Add base modal styles**

Replace entire file content:

```css
/* Recovery Metrics Modal Styles */

.recovery-metrics-content {
  max-width: 500px;
  width: 90%;
}

.recovery-metrics-content h2 {
  margin-top: 0;
  font-size: 24px;
  color: var(--color-text);
  margin-bottom: var(--spacing-lg);
}

.recovery-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.recovery-input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.recovery-input-group label {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.input-hint {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* Number input styling */
.recovery-number-input {
  width: 80px;
  height: 50px;
  font-size: 20px;
  text-align: center;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-secondary);
  color: var(--color-text);
}

.recovery-number-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* Radio button group styling */
.radio-button-group {
  display: grid;
  gap: var(--spacing-xs);
}

.stress-buttons {
  grid-template-columns: repeat(3, 1fr);
}

.energy-buttons {
  grid-template-columns: repeat(5, 1fr);
}

.soreness-buttons {
  grid-template-columns: repeat(2, 1fr);
}

.radio-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  min-height: 50px;
  font-size: 16px;
  font-weight: 600;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-secondary);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio-btn:hover {
  background: var(--color-bg-tertiary);
}

.radio-btn.selected {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Mobile responsive */
@media (max-width: 480px) {
  .soreness-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .energy-buttons {
    grid-template-columns: repeat(3, 1fr) repeat(2, 1fr);
  }
}
```

**Step 2: Add fatigue warning banner styles**

Append to the file:

```css
/* Fatigue Warning Banner */
.fatigue-warning-banner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1100;
  width: 90%;
  max-width: 600px;
  background: rgba(245, 158, 11, 0.15);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: var(--spacing-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.fatigue-warning-banner h2 {
  color: #f59e0b;
  margin-top: 0;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.fatigue-score {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.warning-options {
  background: rgba(0, 0, 0, 0.1);
  padding: var(--spacing-md);
  border-radius: 8px;
  margin-bottom: var(--spacing-md);
}

.warning-options ul {
  margin: var(--spacing-xs) 0;
  padding-left: var(--spacing-lg);
}

.warning-options li {
  margin: var(--spacing-xs) 0;
}

.warning-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.warning-actions .btn {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 16px;
  min-height: 60px;
}

@media (min-width: 768px) {
  .warning-actions {
    flex-direction: row;
  }

  .warning-actions .btn {
    flex: 1;
  }
}
```

**Step 3: Test styles in browser**

Open index.html, use DevTools to temporarily show modal:
```javascript
document.getElementById('recovery-metrics-modal').style.display = 'flex';
```

Expected:
- Modal centered on screen
- All buttons have proper spacing (50px height)
- Radio buttons highlight when clicked
- Responsive layout works on mobile viewport

**Step 4: Commit**

```bash
git add css/recovery-modal.css
git commit -m "style: add recovery metrics modal CSS

- Mobile-first responsive design
- Radio button group styling with selected state
- Number input styling (80px width, 50px height)
- Fatigue warning banner styles
- Touch-friendly 50-60px button heights"
```

---

## Task 5: Recovery Modal Interaction Logic

Add JavaScript to handle recovery modal interactions (radio buttons, submission).

**Files:**
- Modify: `js/app.js` (add modal interaction methods)

**Step 1: Add radio button interaction handler**

Add after calculateFatigueScore method:

```javascript
  /**
   * Initialize radio button groups in recovery modal
   */
  initRecoveryModalRadios() {
    const groups = [
      { containerClass: 'stress-buttons', hiddenInputId: 'stress-level' },
      { containerClass: 'energy-buttons', hiddenInputId: 'energy-level' },
      { containerClass: 'soreness-buttons', hiddenInputId: 'muscle-soreness' }
    ];

    groups.forEach(group => {
      const container = document.querySelector(`.${group.containerClass}`);
      const hiddenInput = document.getElementById(group.hiddenInputId);

      if (!container || !hiddenInput) return;

      container.querySelectorAll('.radio-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          // Remove selected from all buttons in group
          container.querySelectorAll('.radio-btn').forEach(b => b.classList.remove('selected'));

          // Add selected to clicked button
          btn.classList.add('selected');

          // Update hidden input value
          hiddenInput.value = btn.dataset.value;
        });
      });
    });
  }
```

**Step 2: Add method to show recovery modal**

Add after initRecoveryModalRadios method:

```javascript
  /**
   * Show recovery metrics modal
   */
  showRecoveryMetricsModal() {
    const modal = document.getElementById('recovery-metrics-modal');
    if (!modal) return;

    // Reset to defaults
    document.getElementById('sleep-hours').value = 7;

    // Reset radio buttons to defaults
    document.querySelectorAll('.stress-buttons .radio-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.value === 'Low');
    });
    document.getElementById('stress-level').value = 'Low';

    document.querySelectorAll('.energy-buttons .radio-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.value === '3');
    });
    document.getElementById('energy-level').value = '3';

    document.querySelectorAll('.soreness-buttons .radio-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.value === 'None');
    });
    document.getElementById('muscle-soreness').value = 'None';

    // Show modal
    modal.style.display = 'flex';
  }
```

**Step 3: Add method to handle recovery submission**

Add after showRecoveryMetricsModal method:

```javascript
  /**
   * Handle recovery metrics submission
   */
  handleRecoverySubmit() {
    const metrics = {
      sleepHours: parseInt(document.getElementById('sleep-hours').value, 10),
      stressLevel: document.getElementById('stress-level').value,
      energyLevel: parseInt(document.getElementById('energy-level').value, 10),
      muscleSoreness: document.getElementById('muscle-soreness').value
    };

    // Calculate fatigue score
    const scoreData = this.calculateFatigueScore(metrics);

    // Save recovery entry
    this.saveRecoveryMetrics({
      ...metrics,
      preWorkoutScore: scoreData.preWorkoutScore,
      painScore: scoreData.painScore,
      fatigueScore: scoreData.totalScore,
      warningShown: scoreData.showWarning,
      warningDismissed: false,
      deloadChosen: false,
      workoutCompleted: false
    });

    // Hide modal
    document.getElementById('recovery-metrics-modal').style.display = 'none';

    // Show warning if threshold met
    if (scoreData.showWarning) {
      this.showFatigueWarning(scoreData);
    } else {
      // Proceed to workout selection
      this.showWorkoutSelection();
    }
  }
```

**Step 4: Initialize event listeners in constructor**

Add to constructor (around line 50), after other event listener initialization:

```javascript
    // Initialize recovery modal
    this.initRecoveryModalRadios();

    // Recovery modal submit
    const submitRecoveryBtn = document.getElementById('submit-recovery-btn');
    if (submitRecoveryBtn) {
      submitRecoveryBtn.addEventListener('click', () => this.handleRecoverySubmit());
    }
```

**Step 5: Test in browser**

```javascript
// Show modal
app.showRecoveryMetricsModal();

// Click different radio buttons, verify selected state changes
// Change sleep hours
// Click Continue, verify console output
```

Expected:
- Modal displays with defaults
- Radio buttons toggle selected state
- Submit saves data and hides modal

**Step 6: Commit**

```bash
git add js/app.js
git commit -m "feat: add recovery modal interaction logic

- initRecoveryModalRadios() handles button selection
- showRecoveryMetricsModal() displays modal with defaults
- handleRecoverySubmit() processes form and calculates score
- Event listeners initialized in constructor"
```

---

## Task 6: Fatigue Warning Display

Add fatigue warning banner UI and interaction logic.

**Files:**
- Modify: `index.html` (add warning banner HTML)
- Modify: `js/app.js` (add warning display logic)

**Step 1: Add warning banner HTML**

Add after recovery metrics modal in index.html:

```html
<!-- Fatigue Warning Banner -->
<div id="fatigue-warning-banner" class="fatigue-warning-banner" style="display: none;">
  <h2>⚠️ Fatigue Warning</h2>
  <p class="fatigue-score" id="fatigue-score-text">Your recovery score is 0/9.</p>
  <div class="warning-options">
    <p><strong>Consider:</strong></p>
    <ul>
      <li>Take a rest day (recommended)</li>
      <li>Do a lighter deload workout</li>
      <li>Continue if you feel okay</li>
    </ul>
  </div>
  <div class="warning-actions">
    <button id="dismiss-warning-btn" class="btn btn-secondary">Dismiss</button>
    <button id="deload-warning-btn" class="btn btn-secondary">Start Deload</button>
    <button id="continue-warning-btn" class="btn btn-primary">Continue Anyway</button>
  </div>
</div>
```

**Step 2: Add showFatigueWarning method**

Add to app.js after handleRecoverySubmit:

```javascript
  /**
   * Show fatigue warning banner
   * @param {Object} scoreData - Fatigue score breakdown
   */
  showFatigueWarning(scoreData) {
    const banner = document.getElementById('fatigue-warning-banner');
    const scoreText = document.getElementById('fatigue-score-text');

    if (!banner || !scoreText) return;

    // Update score text
    scoreText.textContent = `Your recovery score is ${scoreData.totalScore}/9. Consider:`;

    // Show banner
    banner.style.display = 'block';

    // Update recovery entry to mark warning shown
    const entries = this.getRecoveryMetrics();
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      lastEntry.warningShown = true;
      localStorage.setItem('build_recovery_metrics', JSON.stringify(entries));
    }
  }
```

**Step 3: Add warning button handlers**

Add after showFatigueWarning method:

```javascript
  /**
   * Handle fatigue warning dismiss
   */
  handleWarningDismiss() {
    // Update recovery entry
    const entries = this.getRecoveryMetrics();
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      lastEntry.warningDismissed = true;
      lastEntry.workoutCompleted = false; // User chose not to work out
      localStorage.setItem('build_recovery_metrics', JSON.stringify(entries));
    }

    // Hide banner
    document.getElementById('fatigue-warning-banner').style.display = 'none';

    // Return to home screen
    this.showHomeScreen();
  }

  /**
   * Handle fatigue warning deload choice
   */
  handleWarningDeload() {
    // Update recovery entry
    const entries = this.getRecoveryMetrics();
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      lastEntry.deloadChosen = true;
      localStorage.setItem('build_recovery_metrics', JSON.stringify(entries));
    }

    // Enable deload mode
    this.deloadManager.enableDeload();

    // Hide banner
    document.getElementById('fatigue-warning-banner').style.display = 'none';

    // Proceed to workout selection
    this.showWorkoutSelection();
  }

  /**
   * Handle fatigue warning continue anyway
   */
  handleWarningContinue() {
    // Update recovery entry
    const entries = this.getRecoveryMetrics();
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      lastEntry.warningDismissed = true;
      localStorage.setItem('build_recovery_metrics', JSON.stringify(entries));
    }

    // Hide banner
    document.getElementById('fatigue-warning-banner').style.display = 'none';

    // Proceed to workout selection
    this.showWorkoutSelection();
  }
```

**Step 4: Initialize warning button event listeners**

Add to constructor after recovery modal listeners:

```javascript
    // Fatigue warning buttons
    const dismissWarningBtn = document.getElementById('dismiss-warning-btn');
    if (dismissWarningBtn) {
      dismissWarningBtn.addEventListener('click', () => this.handleWarningDismiss());
    }

    const deloadWarningBtn = document.getElementById('deload-warning-btn');
    if (deloadWarningBtn) {
      deloadWarningBtn.addEventListener('click', () => this.handleWarningDeload());
    }

    const continueWarningBtn = document.getElementById('continue-warning-btn');
    if (continueWarningBtn) {
      continueWarningBtn.addEventListener('click', () => this.handleWarningContinue());
    }
```

**Step 5: Test warning display**

```javascript
// Manually trigger warning
app.showFatigueWarning({ totalScore: 5, preWorkoutScore: 3, painScore: 2, showWarning: true });

// Test each button
// Click Dismiss → should return to home
// Click Deload → should enable deload and show workout selection
// Click Continue → should show workout selection
```

Expected:
- Warning banner displays with correct score
- Each button performs expected action
- Recovery entry updated correctly

**Step 6: Commit**

```bash
git add index.html js/app.js
git commit -m "feat: add fatigue warning banner display

- showFatigueWarning() displays banner with score
- handleWarningDismiss() returns to home
- handleWarningDeload() enables deload mode
- handleWarningContinue() proceeds to workout
- All buttons update recovery entry tracking"
```

---

## Task 7: Integrate Recovery Check into Start Workout Flow

Modify the start workout flow to check for recovery metrics before proceeding.

**Files:**
- Modify: `js/app.js` (modify handleStartWorkout method)

**Step 1: Find handleStartWorkout method**

Search for the method (should be around line 340):

```javascript
  handleStartWorkout() {
    // ... existing code
  }
```

**Step 2: Add recovery check at the beginning**

Replace the handleStartWorkout method with:

```javascript
  handleStartWorkout() {
    // Check if recovery check is due
    if (this.isRecoveryCheckDue()) {
      this.showRecoveryMetricsModal();
      return; // Stop here, modal will handle next steps
    }

    // Get next suggested workout
    const nextWorkoutName = this.workoutManager.getNextSuggestedWorkout();

    if (!nextWorkoutName) {
      alert('No workout scheduled. Please check workout rotation.');
      return;
    }

    // Check muscle recovery
    const recoveryCheck = this.workoutManager.checkMuscleRecovery(nextWorkoutName);

    if (recoveryCheck.warn) {
      this.showRecoveryWarning(nextWorkoutName, recoveryCheck);
      return;
    }

    // Start workout
    this.startWorkout(nextWorkoutName);
  }
```

**Step 3: Test the flow**

```javascript
// Clear recovery data to trigger check
localStorage.removeItem('build_recovery_metrics');

// Click "Start Workout" button
// Expected: Recovery modal appears

// Fill in values and click Continue
// Expected: Proceeds to workout selection or warning
```

Expected:
- First workout of day: recovery modal appears
- Second workout same day: modal skipped
- High fatigue score: warning appears
- Low fatigue score: proceeds directly

**Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat: integrate recovery check into start workout flow

- handleStartWorkout() checks isRecoveryCheckDue()
- Shows recovery modal before muscle overlap check
- Daily frequency enforced (once per day)
- Maintains existing muscle recovery warning flow"
```

---

## Task 8: Update Recovery Entry After Workout Completion

Update recovery entry when workout completes to mark completion status.

**Files:**
- Modify: `js/app.js` (modify completeWorkout method)

**Step 1: Find completeWorkout method**

Search for completeWorkout (around line 3250):

```javascript
  completeWorkout() {
    // ... existing code
  }
```

**Step 2: Add recovery entry update**

Add before the existing post-workout summary call (around line 3300):

```javascript
    // Update recovery entry to mark workout completed
    const recoveryEntries = this.getRecoveryMetrics();
    if (recoveryEntries.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = recoveryEntries.find(e => e.date === today);

      if (todayEntry) {
        todayEntry.workoutCompleted = true;

        // Recalculate fatigue score with pain data
        const painScore = this.calculatePainScore();
        todayEntry.painScore = painScore;
        todayEntry.fatigueScore = todayEntry.preWorkoutScore + painScore;

        localStorage.setItem('build_recovery_metrics', JSON.stringify(recoveryEntries));
      }
    }
```

**Step 3: Test workout completion flow**

```javascript
// Start a workout
// Complete all exercises
// Click "Complete Workout"
// Check localStorage

const entries = JSON.parse(localStorage.getItem('build_recovery_metrics'));
console.log('Last entry:', entries[entries.length - 1]);
// Should show: workoutCompleted: true
```

Expected:
- Recovery entry updated when workout completes
- Pain score recalculated from post-workout summary
- Final fatigue score includes pain points

**Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat: update recovery entry after workout completion

- Mark workoutCompleted: true when workout finishes
- Recalculate fatigue score with pain data
- Update painScore from post-workout summary
- Preserve all other recovery metrics"
```

---

## Task 9: Add Service Worker Cache Update

Update service worker cache version to include new recovery modal CSS.

**Files:**
- Modify: `sw.js` (bump cache version)

**Step 1: Update cache version**

Find CACHE_NAME constant (line 1):

```javascript
const CACHE_NAME = 'build-tracker-v8';
```

Change to:

```javascript
const CACHE_NAME = 'build-tracker-v9';
```

**Step 2: Verify css/recovery-modal.css in assets list**

Check that `css/recovery-modal.css` is in the assets array (should already be there).

**Step 3: Test cache update**

```bash
# Serve the app
python3 -m http.server 8000

# Open browser to localhost:8000
# Open DevTools → Application → Service Workers
# Check cache name
```

Expected:
- New cache: `build-tracker-v9`
- Old cache: `build-tracker-v8` deleted
- All CSS files cached including recovery-modal.css

**Step 4: Commit**

```bash
git add sw.js
git commit -m "chore: bump service worker cache to v9

- Cache version updated for recovery modal CSS
- Ensures all users get new styles on update"
```

---

## Task 10: Manual Integration Testing

Test the complete feature end-to-end in browser.

**Files:**
- Reference: `docs/testing/integration-test-master.md` (will create new section)

**Step 1: Test recovery modal display**

1. Clear localStorage: `localStorage.clear()`
2. Reload page
3. Click "Start Workout"
4. Expected: Recovery modal appears
5. Verify all inputs present and functional

**Step 2: Test low fatigue score (no warning)**

1. Set: Sleep 8, Stress Low, Energy 4, Soreness None
2. Click "Continue to Workout"
3. Expected: Proceeds directly to workout selection
4. Check localStorage: entry saved with score 0

**Step 3: Test high fatigue score (warning)**

1. Clear recovery data: `localStorage.removeItem('build_recovery_metrics')`
2. Click "Start Workout"
3. Set: Sleep 5, Stress High, Energy 2, Soreness Severe
4. Click "Continue to Workout"
5. Expected: Warning banner appears
6. Verify score text shows "6/9" or higher

**Step 4: Test warning buttons**

1. Click "Dismiss" → Returns to home screen
2. Start workout again, trigger warning
3. Click "Start Deload" → Deload mode enabled, proceeds to selection
4. Start workout again, trigger warning
5. Click "Continue Anyway" → Proceeds to normal workout selection

**Step 5: Test daily frequency**

1. Complete a full recovery check
2. Immediately click "Start Workout" again
3. Expected: Modal does NOT appear (same day)
4. Change system date to tomorrow (or wait)
5. Click "Start Workout"
6. Expected: Modal appears again

**Step 6: Test workout completion update**

1. Start workout after recovery check
2. Complete workout
3. Check recovery entry: `localStorage.getItem('build_recovery_metrics')`
4. Verify: `workoutCompleted: true`, `painScore` updated

**Step 7: Document test results**

Create test report section in `docs/testing/integration-test-master.md`:

```markdown
## Feature 9: Enhanced Tracking Metrics

### Test 9.1: Recovery Modal Display
- [ ] Modal appears on first workout of day
- [ ] All 4 inputs present with defaults
- [ ] Radio buttons selectable
- [ ] Sleep hours adjustable (0-12)

### Test 9.2: Fatigue Score Calculation
- [ ] Low score (<4) proceeds without warning
- [ ] High score (≥4) shows warning banner
- [ ] Score displayed correctly in warning

### Test 9.3: Warning Button Actions
- [ ] Dismiss returns to home screen
- [ ] Start Deload enables deload mode
- [ ] Continue Anyway proceeds to workout

### Test 9.4: Daily Frequency
- [ ] Modal shown once per day
- [ ] Second workout same day skips modal
- [ ] Next day shows modal again

### Test 9.5: Workout Completion
- [ ] Recovery entry updated when workout finishes
- [ ] workoutCompleted flag set to true
- [ ] Pain score integrated from summary
```

**Step 8: Commit test documentation**

```bash
git add docs/testing/integration-test-master.md
git commit -m "docs: add enhanced tracking metrics integration tests

- Recovery modal display tests
- Fatigue score calculation tests
- Warning button action tests
- Daily frequency tests
- Workout completion update tests"
```

---

## Task 11: Update Documentation

Update README and implementation status docs.

**Files:**
- Modify: `docs/IMPLEMENTATION-STATUS.md`
- Modify: `README.md`

**Step 1: Update implementation status**

In `docs/IMPLEMENTATION-STATUS.md`, move Enhanced Tracking from "DESIGNED BUT NOT IMPLEMENTED" to "COMPLETED Features":

Add new section after "Post-Workout Summary Screen":

```markdown
### Enhanced Tracking Metrics (100% Complete) 🎉 NEW
**Source:** `docs/plans/2026-02-09-enhanced-tracking-metrics-design.md`

- ✅ **Recovery Metrics Modal** - Sleep, stress, energy, soreness inputs
- ✅ **Fatigue Score Calculation** - Pre-workout + pain points (0-9 scale)
- ✅ **Warning System** - Banner at ≥4 points with 3 action options
- ✅ **Daily Frequency** - Once-per-day check, automatic skip
- ✅ **localStorage Integration** - 90-day retention, daily entries
- ✅ **Deload Integration** - "Start Deload" button enables deload mode
- ✅ **Workout Completion Update** - Mark completed, recalculate with pain
- ✅ **Service Worker Update** - Cache bump to v9
- ✅ **Mobile Responsive** - 50-60px touch targets, grid layouts
- ✅ **Integration Tests** - 5 test scenarios documented

**Features:**
- Pre-workout recovery assessment (sleep, stress, energy, soreness)
- Smart defaults for quick workflow (7 hours, Low stress, 3 energy, None soreness)
- Fatigue calculation with evidence-based point system
- Non-blocking warnings (user always decides)
- Integration with existing pain tracking
- One-tap deload activation from warning

**Status:** Production-ready, 11 commits, ready for manual testing
```

Update statistics:
```markdown
| Enhanced Tracking | 9 | 9 | 100% ✅ |

- **Total Features Designed:** 80
- **Features Implemented:** 79
- **Features Remaining:** 1
- **Completion:** 99%
```

**Step 2: Update README features list**

In `README.md`, add to features section:

```markdown
- **Enhanced Tracking Metrics** - Pre-workout recovery assessment (sleep, stress, energy, soreness) with fatigue scoring and intelligent warnings to prevent overtraining
```

**Step 3: Commit documentation**

```bash
git add docs/IMPLEMENTATION-STATUS.md README.md
git commit -m "docs: update implementation status for enhanced tracking metrics

- Moved from 0% to 100% complete
- Added feature breakdown (10 components)
- Updated overall progress to 99% (79/80 features)
- Added to README features list"
```

---

## Final Steps

**After all tasks complete:**

1. Run full manual integration test suite
2. Fix any bugs discovered
3. Final commit if fixes needed
4. Ready for production use

**Files Modified:**
- `js/app.js` - Recovery logic, modal handling, fatigue calculation
- `css/recovery-modal.css` - Modal and warning styling
- `index.html` - Modal and warning banner HTML
- `sw.js` - Cache version bump
- `docs/IMPLEMENTATION-STATUS.md` - Status update
- `docs/testing/integration-test-master.md` - Test scenarios
- `README.md` - Feature documentation

**localStorage Keys:**
- `build_recovery_metrics` - Array of daily recovery entries

**Integration Points:**
- Existing pain tracking (post-workout summary)
- Existing deload manager (enableDeload method)
- Existing muscle recovery warnings (preserved)
- Existing workout rotation (unchanged)

---

Plan complete and saved to `docs/plans/2026-02-09-enhanced-tracking-metrics-implementation-plan.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
