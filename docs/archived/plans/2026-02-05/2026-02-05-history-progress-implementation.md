# History & Progress Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement complete workout history management with visualization, edit/delete capabilities, and data export/import.

**Architecture:** Three new screens (History List, Exercise Detail, Settings modal extension) with vanilla JS Canvas charts for visualization. All data operations use existing localStorage infrastructure. Zero external dependencies.

**Tech Stack:** Vanilla JavaScript (ES6 modules), Canvas API, localStorage, CSS Grid/Flexbox

---

## Task 1: Export/Import Utilities Module

**Files:**
- Create: `src/js/utils/export-import.js`

**Step 1: Create export utility**

```javascript
// src/js/utils/export-import.js

/**
 * Export all workout data to JSON format
 * @param {StorageManager} storage - Storage manager instance
 * @returns {string} JSON string of all data
 */
export function exportWorkoutData(storage) {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    exerciseHistory: {},
    rotation: storage.getRotation(),
    deloadState: storage.getDeloadState()
  };

  // Get all exercise history keys
  const allKeys = Object.keys(localStorage);
  const historyKeys = allKeys.filter(key => key.startsWith('exercise-history:'));

  // Export each exercise history
  historyKeys.forEach(key => {
    const exerciseKey = key.replace('exercise-history:', '');
    data.exerciseHistory[exerciseKey] = storage.getExerciseHistory(exerciseKey);
  });

  return JSON.stringify(data, null, 2);
}

/**
 * Validate imported data structure
 * @param {object} data - Parsed JSON data
 * @throws {Error} If data is invalid
 */
export function validateImportData(data) {
  if (!data.version) {
    throw new Error('Invalid data: missing version');
  }

  if (!data.exerciseHistory || typeof data.exerciseHistory !== 'object') {
    throw new Error('Invalid data: missing or invalid exerciseHistory');
  }

  // Validate each exercise history
  for (const [key, history] of Object.entries(data.exerciseHistory)) {
    if (!Array.isArray(history)) {
      throw new Error(`Invalid history for ${key}: not an array`);
    }

    for (const entry of history) {
      if (!entry.date) {
        throw new Error(`Invalid entry in ${key}: missing date`);
      }
      if (!Array.isArray(entry.sets)) {
        throw new Error(`Invalid entry in ${key}: missing or invalid sets`);
      }
    }
  }
}

/**
 * Import workout data from JSON
 * @param {string} jsonString - JSON string to import
 * @param {StorageManager} storage - Storage manager instance
 * @throws {Error} If data is invalid
 */
export function importWorkoutData(jsonString, storage) {
  const data = JSON.parse(jsonString);
  validateImportData(data);

  // Import exercise history
  for (const [exerciseKey, history] of Object.entries(data.exerciseHistory)) {
    storage.saveExerciseHistory(exerciseKey, history);
  }

  // Import rotation state
  if (data.rotation) {
    localStorage.setItem('workout-rotation', JSON.stringify(data.rotation));
  }

  // Import deload state
  if (data.deloadState) {
    storage.saveDeloadState(data.deloadState);
  }
}

/**
 * Get data summary for preview
 * @param {object} data - Parsed JSON data
 * @returns {object} Summary statistics
 */
export function getDataSummary(data) {
  const exerciseCount = Object.keys(data.exerciseHistory).length;
  let totalWorkouts = 0;
  let earliestDate = null;
  let latestDate = null;

  for (const history of Object.values(data.exerciseHistory)) {
    totalWorkouts += history.length;

    for (const entry of history) {
      const date = new Date(entry.date);
      if (!earliestDate || date < earliestDate) earliestDate = date;
      if (!latestDate || date > latestDate) latestDate = date;
    }
  }

  return {
    exerciseCount,
    totalWorkouts,
    dateRange: earliestDate && latestDate
      ? `${earliestDate.toLocaleDateString()} - ${latestDate.toLocaleDateString()}`
      : 'No workouts',
    storageSize: new Blob([JSON.stringify(data)]).size
  };
}
```

**Step 2: Commit**

```bash
git add src/js/utils/export-import.js
git commit -m "feat: add export/import utilities for workout data"
```

---

## Task 2: Progress Chart Component

**Files:**
- Create: `src/js/components/progress-chart.js`
- Create: `src/css/progress-chart.css`

**Step 1: Create chart component**

```javascript
// src/js/components/progress-chart.js

export class ProgressChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }
    this.ctx = this.canvas.getContext('2d');

    // Set canvas size for retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.width = rect.width;
    this.height = rect.height;
  }

  /**
   * Draw weight progression chart
   * @param {Array} history - Exercise history array
   */
  draw(history) {
    if (!history || history.length === 0) {
      this.drawEmptyState();
      return;
    }

    // Extract data points (use first set weight)
    const data = history.map(entry => ({
      date: new Date(entry.date),
      weight: entry.sets[0]?.weight || 0
    }));

    if (data.length === 1) {
      this.drawSinglePoint(data[0]);
      return;
    }

    const padding = 40;
    const chartWidth = this.width - 2 * padding;
    const chartHeight = this.height - 2 * padding;

    // Get weight range
    const weights = data.map(d => d.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const weightRange = maxWeight - minWeight || 10; // Fallback if all same

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw grid
    this.drawGrid(padding, chartWidth, chartHeight, minWeight, maxWeight);

    // Draw line
    this.drawLine(data, padding, chartWidth, chartHeight, minWeight, weightRange);

    // Draw points
    this.drawPoints(data, padding, chartWidth, chartHeight, minWeight, weightRange);

    // Draw labels
    this.drawLabels(data, padding, chartWidth, chartHeight, minWeight, maxWeight);
  }

  drawGrid(padding, width, height, minWeight, maxWeight) {
    this.ctx.strokeStyle = '#334155'; // --color-surface-light
    this.ctx.lineWidth = 1;

    // Horizontal grid lines (5 lines)
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height / 4) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(padding, y);
      this.ctx.lineTo(padding + width, y);
      this.ctx.stroke();
    }

    // Vertical grid lines (4 lines)
    for (let i = 0; i <= 3; i++) {
      const x = padding + (width / 3) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(x, padding);
      this.ctx.lineTo(x, padding + height);
      this.ctx.stroke();
    }
  }

  drawLine(data, padding, width, height, minWeight, weightRange) {
    this.ctx.strokeStyle = '#06b6d4'; // --color-primary
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();

    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * width;
      const y = padding + height - ((point.weight - minWeight) / weightRange) * height;

      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });

    this.ctx.stroke();
  }

  drawPoints(data, padding, width, height, minWeight, weightRange) {
    this.ctx.fillStyle = '#06b6d4'; // --color-primary

    data.forEach((point, index) => {
      const x = padding + (index / (data.length - 1)) * width;
      const y = padding + height - ((point.weight - minWeight) / weightRange) * height;

      this.ctx.beginPath();
      this.ctx.arc(x, y, 4, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawLabels(data, padding, width, height, minWeight, maxWeight) {
    this.ctx.fillStyle = '#94a3b8'; // --color-text-dim
    this.ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    this.ctx.textAlign = 'center';

    // X-axis labels (dates) - show first, middle, last
    const indices = [0, Math.floor(data.length / 2), data.length - 1];
    indices.forEach(i => {
      if (i < data.length) {
        const x = padding + (i / (data.length - 1)) * width;
        const label = data[i].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        this.ctx.fillText(label, x, this.height - 10);
      }
    });

    // Y-axis labels (weights)
    this.ctx.textAlign = 'right';
    const weightLabels = [minWeight, (minWeight + maxWeight) / 2, maxWeight];
    weightLabels.forEach((weight, i) => {
      const y = padding + height - (i / 2) * height;
      this.ctx.fillText(`${weight.toFixed(1)}kg`, padding - 10, y + 4);
    });
  }

  drawEmptyState() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#94a3b8'; // --color-text-dim
    this.ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('No workout data yet', this.width / 2, this.height / 2);
  }

  drawSinglePoint(point) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const padding = 40;
    const x = this.width / 2;
    const y = this.height / 2;

    // Draw point
    this.ctx.fillStyle = '#06b6d4';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw label
    this.ctx.fillStyle = '#f1f5f9'; // --color-text
    this.ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      `${point.weight}kg - ${point.date.toLocaleDateString()}`,
      x,
      y + 30
    );
  }
}
```

**Step 2: Create chart styles**

```css
/* src/css/progress-chart.css */

.chart-container {
  background: var(--color-surface);
  border-radius: 12px;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.chart-title {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

#progress-chart {
  width: 100%;
  height: 200px;
  display: block;
  border-radius: 8px;
}
```

**Step 3: Commit**

```bash
git add src/js/components/progress-chart.js src/css/progress-chart.css
git commit -m "feat: add canvas-based progress chart component"
```

---

## Task 3: History List Screen

**Files:**
- Create: `src/js/screens/history-list.js`
- Create: `src/css/history-screen.css`
- Modify: `src/index.html`

**Step 1: Create History List screen logic**

```javascript
// src/js/screens/history-list.js

export class HistoryListScreen {
  constructor(storage, onExerciseSelect) {
    this.storage = storage;
    this.onExerciseSelect = onExerciseSelect;
  }

  /**
   * Get all exercises with history data
   * @returns {Array} Array of exercise summaries
   */
  getAllExercisesWithHistory() {
    const allKeys = Object.keys(localStorage);
    const historyKeys = allKeys.filter(key => key.startsWith('exercise-history:'));

    const exercises = historyKeys.map(key => {
      const exerciseKey = key.replace('exercise-history:', '');
      const history = this.storage.getExerciseHistory(exerciseKey);

      if (history.length === 0) return null;

      const lastEntry = history[history.length - 1];
      const lastDate = new Date(lastEntry.date);
      const lastWeight = lastEntry.sets[0]?.weight || 0;

      // Parse workout name and exercise name
      const [workoutName, exerciseName] = exerciseKey.split(' - ');

      return {
        exerciseKey,
        workoutName,
        exerciseName,
        lastDate,
        lastWeight,
        totalWorkouts: history.length
      };
    }).filter(Boolean); // Remove nulls

    // Sort by last workout date (most recent first)
    exercises.sort((a, b) => b.lastDate - a.lastDate);

    return exercises;
  }

  /**
   * Render the history list screen
   */
  render() {
    const container = document.getElementById('history-list');
    if (!container) return;

    const exercises = this.getAllExercisesWithHistory();

    if (exercises.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-icon">📊</p>
          <p class="empty-state-text">No workout history yet</p>
          <p class="empty-state-hint">Complete your first workout to see progress here</p>
        </div>
      `;
      return;
    }

    // Group by workout
    const grouped = exercises.reduce((acc, ex) => {
      if (!acc[ex.workoutName]) acc[ex.workoutName] = [];
      acc[ex.workoutName].push(ex);
      return acc;
    }, {});

    let html = '';
    for (const [workoutName, exList] of Object.entries(grouped)) {
      html += `
        <div class="workout-group">
          <h3 class="workout-group-title">${this.escapeHtml(workoutName)}</h3>
          ${exList.map(ex => this.renderExerciseCard(ex)).join('')}
        </div>
      `;
    }

    container.innerHTML = html;

    // Attach click handlers
    this.attachClickHandlers();
  }

  renderExerciseCard(exercise) {
    const daysAgo = Math.floor((new Date() - exercise.lastDate) / (1000 * 60 * 60 * 24));
    let lastWorkoutText = '';
    if (daysAgo === 0) lastWorkoutText = 'Today';
    else if (daysAgo === 1) lastWorkoutText = 'Yesterday';
    else lastWorkoutText = `${daysAgo} days ago`;

    return `
      <div class="exercise-card" data-exercise-key="${exercise.exerciseKey}">
        <div class="exercise-card-header">
          <h4 class="exercise-card-title">${this.escapeHtml(exercise.exerciseName)}</h4>
          <span class="exercise-card-arrow">→</span>
        </div>
        <div class="exercise-card-meta">
          <span class="meta-item">📅 ${lastWorkoutText}</span>
          <span class="meta-item">⚖️ ${exercise.lastWeight}kg</span>
          <span class="meta-item">📊 ${exercise.totalWorkouts} workouts</span>
        </div>
      </div>
    `;
  }

  attachClickHandlers() {
    const cards = document.querySelectorAll('.exercise-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const exerciseKey = card.dataset.exerciseKey;
        if (this.onExerciseSelect) {
          this.onExerciseSelect(exerciseKey);
        }
      });
    });
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
```

**Step 2: Create History screen styles**

```css
/* src/css/history-screen.css */

/* History List Screen */
.workout-group {
  margin-bottom: var(--spacing-lg);
}

.workout-group-title {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.exercise-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
  transition: background 0.2s;
}

.exercise-card:active {
  background: var(--color-surface-light);
}

.exercise-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.exercise-card-title {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.exercise-card-arrow {
  font-size: var(--font-lg);
  color: var(--color-text-dim);
}

.exercise-card-meta {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.meta-item {
  font-size: var(--font-sm);
  color: var(--color-text-dim);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.empty-state-text {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.empty-state-hint {
  font-size: var(--font-sm);
  color: var(--color-text-dim);
}
```

**Step 3: Add History screen HTML**

Add to `src/index.html` before closing `</div>` of `#app`:

```html
<!-- History Screen -->
<div id="history-screen" class="screen">
  <header class="app-header">
    <button id="history-back-btn" class="icon-btn">←</button>
    <h1>Workout History</h1>
    <span></span>
  </header>

  <main class="screen-content">
    <div id="history-list">
      <!-- Populated by HistoryListScreen -->
    </div>
  </main>
</div>
```

**Step 4: Update HTML head to include new CSS**

Add to `<head>` section in `src/index.html`:

```html
<link rel="stylesheet" href="css/history-screen.css">
<link rel="stylesheet" href="css/progress-chart.css">
```

**Step 5: Commit**

```bash
git add src/js/screens/history-list.js src/css/history-screen.css src/index.html
git commit -m "feat: add history list screen with exercise summaries"
```

---

## Task 4: Exercise Detail Screen

**Files:**
- Create: `src/js/screens/exercise-detail.js`
- Create: `src/css/exercise-detail.css`
- Modify: `src/index.html`

**Step 1: Create Exercise Detail screen logic**

```javascript
// src/js/screens/exercise-detail.js

import { ProgressChart } from '../components/progress-chart.js';

export class ExerciseDetailScreen {
  constructor(storage, onBack, onEdit, onDelete) {
    this.storage = storage;
    this.onBack = onBack;
    this.onEdit = onEdit;
    this.onDelete = onDelete;
    this.chart = null;
    this.currentExerciseKey = null;
  }

  /**
   * Render exercise detail screen
   * @param {string} exerciseKey - Exercise key (e.g., "UPPER_A - Goblet Squat")
   */
  render(exerciseKey) {
    this.currentExerciseKey = exerciseKey;
    const history = this.storage.getExerciseHistory(exerciseKey);
    const [workoutName, exerciseName] = exerciseKey.split(' - ');

    // Update header
    const titleEl = document.getElementById('exercise-detail-title');
    if (titleEl) {
      titleEl.textContent = exerciseName;
    }

    // Render chart
    this.renderChart(history);

    // Render history list
    this.renderHistoryList(history);

    // Attach event listeners
    this.attachEventListeners();
  }

  renderChart(history) {
    if (!this.chart) {
      try {
        this.chart = new ProgressChart('progress-chart');
      } catch (error) {
        console.error('Failed to initialize chart:', error);
        return;
      }
    }

    this.chart.draw(history);
  }

  renderHistoryList(history) {
    const container = document.getElementById('workout-history-list');
    if (!container) return;

    if (history.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-text">No workout history</p>
        </div>
      `;
      return;
    }

    // Reverse to show most recent first
    const sortedHistory = [...history].reverse();

    container.innerHTML = sortedHistory.map((entry, index) => {
      const originalIndex = history.length - 1 - index; // Map back to original index
      return this.renderHistoryEntry(entry, originalIndex);
    }).join('');
  }

  renderHistoryEntry(entry, index) {
    const date = new Date(entry.date);
    const daysAgo = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
    let dateText = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (daysAgo === 0) dateText += ' - Today';
    else if (daysAgo === 1) dateText += ' - Yesterday';
    else if (daysAgo < 7) dateText += ` - ${daysAgo} days ago`;

    // Format sets
    const setsText = this.formatSets(entry.sets);

    return `
      <div class="history-entry" data-index="${index}">
        <div class="history-entry-header">
          <span class="history-date">📅 ${this.escapeHtml(dateText)}</span>
          <div class="history-actions">
            <button class="icon-btn edit-entry-btn" data-index="${index}" title="Edit">✏️</button>
            <button class="icon-btn delete-entry-btn" data-index="${index}" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="history-sets">${this.escapeHtml(setsText)}</div>
      </div>
    `;
  }

  formatSets(sets) {
    const weights = sets.map(s => `${s.weight}kg`).join(', ');
    const reps = sets.map(s => s.reps).join(',');
    const rirs = sets.map(s => s.rir).join(',');

    return `${sets.length} sets: ${weights} × ${reps} @ RIR ${rirs}`;
  }

  attachEventListeners() {
    // Edit buttons
    const editBtns = document.querySelectorAll('.edit-entry-btn');
    editBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        if (this.onEdit) {
          this.onEdit(this.currentExerciseKey, index);
        }
      });
    });

    // Delete buttons
    const deleteBtns = document.querySelectorAll('.delete-entry-btn');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        this.handleDelete(index);
      });
    });
  }

  handleDelete(index) {
    const history = this.storage.getExerciseHistory(this.currentExerciseKey);
    const reversedIndex = history.length - 1 - index;
    const entry = history[reversedIndex];
    const date = new Date(entry.date).toLocaleDateString();

    if (!confirm(`Delete workout from ${date}?\n\nThis cannot be undone.`)) {
      return;
    }

    // Remove entry
    history.splice(reversedIndex, 1);
    this.storage.saveExerciseHistory(this.currentExerciseKey, history);

    // Re-render
    this.render(this.currentExerciseKey);

    // Show success message
    this.showToast('✅ Workout deleted');
  }

  showToast(message) {
    // Reuse existing toast system from post-set-feedback
    const existing = document.querySelector('.feedback-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'feedback-toast success';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
```

**Step 2: Create Exercise Detail styles**

```css
/* src/css/exercise-detail.css */

/* Exercise Detail Screen */
.history-entry {
  background: var(--color-surface);
  border-radius: 12px;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.history-entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.history-date {
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-text);
}

.history-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.edit-entry-btn,
.delete-entry-btn {
  min-width: var(--tap-target-min);
  min-height: var(--tap-target-min);
}

.history-sets {
  font-size: var(--font-sm);
  color: var(--color-text-dim);
  font-family: 'Courier New', monospace;
}
```

**Step 3: Add Exercise Detail screen HTML**

Add to `src/index.html` before closing `</div>` of `#app`:

```html
<!-- Exercise Detail Screen -->
<div id="exercise-detail-screen" class="screen">
  <header class="app-header">
    <button id="exercise-detail-back-btn" class="icon-btn">←</button>
    <h1 id="exercise-detail-title">Exercise</h1>
    <span></span>
  </header>

  <main class="screen-content">
    <div class="chart-container">
      <h3 class="chart-title">Weight Progression</h3>
      <canvas id="progress-chart"></canvas>
    </div>

    <div id="workout-history-list">
      <!-- Populated by ExerciseDetailScreen -->
    </div>
  </main>
</div>
```

**Step 4: Update HTML head to include new CSS**

Add to `<head>` section in `src/index.html`:

```html
<link rel="stylesheet" href="css/exercise-detail.css">
```

**Step 5: Commit**

```bash
git add src/js/screens/exercise-detail.js src/css/exercise-detail.css src/index.html
git commit -m "feat: add exercise detail screen with chart and delete"
```

---

## Task 5: Edit Entry Modal

**Files:**
- Create: `src/js/modals/edit-entry-modal.js`
- Create: `src/css/edit-entry-modal.css`
- Modify: `src/index.html`

**Step 1: Create edit modal logic**

```javascript
// src/js/modals/edit-entry-modal.js

export class EditEntryModal {
  constructor(storage, onSave) {
    this.storage = storage;
    this.onSave = onSave;
    this.currentExerciseKey = null;
    this.currentIndex = null;
  }

  /**
   * Show edit modal for a workout entry
   * @param {string} exerciseKey - Exercise key
   * @param {number} index - Entry index in history array
   */
  show(exerciseKey, index) {
    this.currentExerciseKey = exerciseKey;
    this.currentIndex = index;

    const history = this.storage.getExerciseHistory(exerciseKey);
    const reversedIndex = history.length - 1 - index;
    const entry = history[reversedIndex];

    if (!entry) {
      console.error('Entry not found');
      return;
    }

    // Populate modal
    this.renderModal(entry);

    // Show modal
    const modal = document.getElementById('edit-entry-modal');
    if (modal) {
      modal.style.display = 'flex';
    }

    // Attach handlers
    this.attachHandlers();
  }

  renderModal(entry) {
    const date = new Date(entry.date).toISOString().split('T')[0]; // YYYY-MM-DD
    const setsContainer = document.getElementById('edit-sets-container');

    if (!setsContainer) return;

    // Render sets
    const setsHtml = entry.sets.map((set, i) => `
      <div class="edit-set-row">
        <span class="edit-set-label">Set ${i + 1}</span>
        <div class="edit-inputs">
          <div class="edit-input-group">
            <label class="edit-label">Weight (kg)</label>
            <input
              type="number"
              class="edit-input"
              data-set="${i}"
              data-field="weight"
              value="${set.weight}"
              step="0.5"
              min="0"
            />
          </div>
          <div class="edit-input-group">
            <label class="edit-label">Reps</label>
            <input
              type="number"
              class="edit-input"
              data-set="${i}"
              data-field="reps"
              value="${set.reps}"
              min="1"
            />
          </div>
          <div class="edit-input-group">
            <label class="edit-label">RIR</label>
            <select
              class="edit-input"
              data-set="${i}"
              data-field="rir"
            >
              <option value="0" ${set.rir === 0 ? 'selected' : ''}>0 (Failure)</option>
              <option value="1" ${set.rir === 1 ? 'selected' : ''}>1</option>
              <option value="2" ${set.rir === 2 ? 'selected' : ''}>2</option>
              <option value="3" ${set.rir === 3 ? 'selected' : ''}>3</option>
              <option value="4" ${set.rir === 4 ? 'selected' : ''}>4</option>
              <option value="5" ${set.rir === 5 ? 'selected' : ''}>5+</option>
            </select>
          </div>
        </div>
      </div>
    `).join('');

    setsContainer.innerHTML = setsHtml;

    // Set date
    const dateInput = document.getElementById('edit-entry-date');
    if (dateInput) {
      dateInput.value = date;
    }
  }

  attachHandlers() {
    const cancelBtn = document.getElementById('edit-entry-cancel');
    const saveBtn = document.getElementById('edit-entry-save');

    if (cancelBtn) {
      cancelBtn.onclick = () => this.hide();
    }

    if (saveBtn) {
      saveBtn.onclick = () => this.save();
    }
  }

  save() {
    const history = this.storage.getExerciseHistory(this.currentExerciseKey);
    const reversedIndex = history.length - 1 - this.currentIndex;
    const entry = history[reversedIndex];

    // Read updated values
    const dateInput = document.getElementById('edit-entry-date');
    if (dateInput) {
      entry.date = new Date(dateInput.value).toISOString();
    }

    // Update sets
    entry.sets.forEach((set, i) => {
      const weightInput = document.querySelector(`.edit-input[data-set="${i}"][data-field="weight"]`);
      const repsInput = document.querySelector(`.edit-input[data-set="${i}"][data-field="reps"]`);
      const rirInput = document.querySelector(`.edit-input[data-set="${i}"][data-field="rir"]`);

      if (weightInput) set.weight = parseFloat(weightInput.value);
      if (repsInput) set.reps = parseInt(repsInput.value);
      if (rirInput) set.rir = parseInt(rirInput.value);

      // Validate
      if (set.weight <= 0 || set.reps <= 0 || set.rir < 0) {
        alert('Invalid values. Please check your inputs.');
        throw new Error('Invalid set values');
      }
    });

    // Save
    this.storage.saveExerciseHistory(this.currentExerciseKey, history);

    // Callback
    if (this.onSave) {
      this.onSave(this.currentExerciseKey);
    }

    this.hide();
  }

  hide() {
    const modal = document.getElementById('edit-entry-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
}
```

**Step 2: Create edit modal styles**

```css
/* src/css/edit-entry-modal.css */

#edit-entry-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-md);
}

.edit-modal-content {
  background: var(--color-bg);
  border-radius: 16px;
  padding: var(--spacing-lg);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.edit-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.edit-modal-header h2 {
  margin: 0;
  font-size: var(--font-lg);
  color: var(--color-text);
}

.edit-date-section {
  margin-bottom: var(--spacing-md);
}

.edit-date-section label {
  display: block;
  font-size: var(--font-sm);
  color: var(--color-text-dim);
  margin-bottom: var(--spacing-xs);
}

#edit-entry-date {
  width: 100%;
  padding: var(--spacing-sm);
  font-size: var(--font-md);
  background: var(--color-surface);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text);
}

.edit-set-row {
  margin-bottom: var(--spacing-md);
}

.edit-set-label {
  display: block;
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-text-dim);
  margin-bottom: var(--spacing-xs);
}

.edit-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--spacing-sm);
}

.edit-input-group {
  display: flex;
  flex-direction: column;
}

.edit-label {
  font-size: var(--font-xs);
  color: var(--color-text-dim);
  margin-bottom: 2px;
}

.edit-input {
  padding: var(--spacing-xs);
  font-size: var(--font-sm);
  background: var(--color-surface);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text);
  text-align: center;
  min-height: var(--tap-target-min);
}

.edit-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.edit-modal-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

.edit-modal-actions button {
  flex: 1;
  height: 50px;
  font-size: var(--font-md);
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

#edit-entry-cancel {
  background: var(--color-surface);
  color: var(--color-text);
}

#edit-entry-cancel:active {
  background: var(--color-surface-light);
}

#edit-entry-save {
  background: var(--color-primary);
  color: white;
}

#edit-entry-save:active {
  background: var(--color-accent);
}
```

**Step 3: Add edit modal HTML**

Add to `src/index.html` after the number overlay modal:

```html
<!-- Edit Entry Modal -->
<div id="edit-entry-modal">
  <div class="edit-modal-content">
    <div class="edit-modal-header">
      <h2>Edit Workout</h2>
    </div>

    <div class="edit-date-section">
      <label for="edit-entry-date">Date</label>
      <input type="date" id="edit-entry-date" />
    </div>

    <div id="edit-sets-container">
      <!-- Populated by EditEntryModal -->
    </div>

    <div class="edit-modal-actions">
      <button id="edit-entry-cancel">Cancel</button>
      <button id="edit-entry-save">Save Changes</button>
    </div>
  </div>
</div>
```

**Step 4: Update HTML head to include new CSS**

Add to `<head>` section in `src/index.html`:

```html
<link rel="stylesheet" href="css/edit-entry-modal.css">
```

**Step 5: Commit**

```bash
git add src/js/modals/edit-entry-modal.js src/css/edit-entry-modal.css src/index.html
git commit -m "feat: add edit entry modal for workout corrections"
```

---

## Task 6: Export/Import UI in Settings

**Files:**
- Modify: `src/index.html`
- Create: `src/css/export-import.css`

**Step 1: Add export/import section to settings modal**

Update the settings button handler area in `src/index.html` to include a modal:

```html
<!-- Settings Modal -->
<div id="settings-modal" class="modal" style="display: none;">
  <div class="modal-content">
    <div class="modal-header">
      <h2>⚙️ Settings</h2>
      <button id="settings-close-btn" class="icon-btn">✕</button>
    </div>

    <div class="modal-body">
      <section class="settings-section">
        <h3>Data Management</h3>

        <div class="export-import-container">
          <p class="section-description">
            Backup your workout data or restore from a previous backup.
          </p>

          <button id="export-data-btn" class="btn-secondary btn-large">
            📤 Export All Data
          </button>

          <button id="import-data-btn" class="btn-secondary btn-large">
            📥 Import Data
          </button>

          <input type="file" id="import-file-input" accept=".json" style="display: none;" />
        </div>

        <div id="data-summary" class="data-summary" style="display: none;">
          <!-- Populated when showing import preview -->
        </div>
      </section>

      <section class="settings-section">
        <h3>About</h3>
        <p class="about-text">
          BUILD Workout Tracker v1.0<br>
          Zero-dependency PWA for progressive overload tracking
        </p>
      </section>
    </div>
  </div>
</div>
```

**Step 2: Create export/import styles**

```css
/* src/css/export-import.css */

.settings-section {
  margin-bottom: var(--spacing-xl);
}

.settings-section h3 {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.section-description {
  font-size: var(--font-sm);
  color: var(--color-text-dim);
  margin-bottom: var(--spacing-md);
}

.export-import-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:active {
  background: var(--color-surface-light);
}

.data-summary {
  background: var(--color-surface);
  border-radius: 8px;
  padding: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.data-summary h4 {
  font-size: var(--font-md);
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.data-summary-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
  font-size: var(--font-sm);
}

.data-summary-label {
  color: var(--color-text-dim);
}

.data-summary-value {
  color: var(--color-text);
  font-weight: 600;
}

.import-warning {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-danger);
  border-radius: 8px;
  padding: var(--spacing-sm);
  margin-top: var(--spacing-md);
  color: var(--color-danger);
  font-size: var(--font-sm);
}

.about-text {
  font-size: var(--font-sm);
  color: var(--color-text-dim);
  line-height: 1.6;
}
```

**Step 3: Update HTML head to include new CSS**

Add to `<head>` section in `src/index.html`:

```html
<link rel="stylesheet" href="css/export-import.css">
```

**Step 4: Commit**

```bash
git add src/index.html src/css/export-import.css
git commit -m "feat: add export/import UI to settings modal"
```

---

## Task 7: Wire Everything Together in app.js

**Files:**
- Modify: `src/js/app.js`

**Step 1: Import new modules**

Add to top of `src/js/app.js`:

```javascript
import { HistoryListScreen } from './screens/history-list.js';
import { ExerciseDetailScreen } from './screens/exercise-detail.js';
import { EditEntryModal } from './modals/edit-entry-modal.js';
import { exportWorkoutData, importWorkoutData, getDataSummary } from './utils/export-import.js';
```

**Step 2: Initialize new screens in constructor**

Add to `App` constructor:

```javascript
// History and detail screens
this.historyListScreen = new HistoryListScreen(
  this.storage,
  (exerciseKey) => this.showExerciseDetail(exerciseKey)
);

this.exerciseDetailScreen = new ExerciseDetailScreen(
  this.storage,
  () => this.showHistoryScreen(),
  (exerciseKey, index) => this.editEntry(exerciseKey, index),
  (exerciseKey, index) => this.deleteEntry(exerciseKey, index)
);

this.editEntryModal = new EditEntryModal(
  this.storage,
  (exerciseKey) => this.exerciseDetailScreen.render(exerciseKey)
);
```

**Step 3: Add navigation methods**

Add these methods to `App` class:

```javascript
showHistoryScreen() {
  this.hideAllScreens();
  const historyScreen = document.getElementById('history-screen');
  if (historyScreen) {
    historyScreen.classList.add('active');
    this.historyListScreen.render();
  }
}

showExerciseDetail(exerciseKey) {
  this.hideAllScreens();
  const detailScreen = document.getElementById('exercise-detail-screen');
  if (detailScreen) {
    detailScreen.classList.add('active');
    this.exerciseDetailScreen.render(exerciseKey);
  }
}

hideAllScreens() {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.remove('active'));
}

editEntry(exerciseKey, index) {
  this.editEntryModal.show(exerciseKey, index);
}
```

**Step 4: Wire up History button**

Update `attachEventListeners()` to include:

```javascript
// History button
const historyBtn = document.querySelector('.action-btn:nth-child(1)'); // First action button
if (historyBtn) {
  historyBtn.addEventListener('click', () => this.showHistoryScreen());
}

// History back button
const historyBackBtn = document.getElementById('history-back-btn');
if (historyBackBtn) {
  historyBackBtn.addEventListener('click', () => this.showHomeScreen());
}

// Exercise detail back button
const detailBackBtn = document.getElementById('exercise-detail-back-btn');
if (detailBackBtn) {
  detailBackBtn.addEventListener('click', () => this.showHistoryScreen());
}

// Settings button
const settingsBtn = document.getElementById('settings-btn');
if (settingsBtn) {
  settingsBtn.addEventListener('click', () => this.showSettingsModal());
}
```

**Step 5: Add export/import handlers**

Add these methods to `App` class:

```javascript
showSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.style.display = 'flex';
  }

  // Attach handlers
  const closeBtn = document.getElementById('settings-close-btn');
  if (closeBtn) {
    closeBtn.onclick = () => modal.style.display = 'none';
  }

  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.onclick = () => this.handleExport();
  }

  const importBtn = document.getElementById('import-data-btn');
  if (importBtn) {
    importBtn.onclick = () => this.handleImportClick();
  }

  const fileInput = document.getElementById('import-file-input');
  if (fileInput) {
    fileInput.onchange = (e) => this.handleImportFile(e);
  }
}

handleExport() {
  try {
    const jsonData = exportWorkoutData(this.storage);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);

    alert('✅ Data exported successfully');
  } catch (error) {
    console.error('Export failed:', error);
    alert('❌ Export failed. Please try again.');
  }
}

handleImportClick() {
  const fileInput = document.getElementById('import-file-input');
  if (fileInput) {
    fileInput.click();
  }
}

async handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Show preview
    const summary = getDataSummary(data);
    const confirmed = confirm(
      `Import Data Preview:\n\n` +
      `Exercises: ${summary.exerciseCount}\n` +
      `Total Workouts: ${summary.totalWorkouts}\n` +
      `Date Range: ${summary.dateRange}\n` +
      `Size: ${(summary.storageSize / 1024).toFixed(1)} KB\n\n` +
      `⚠️ This will replace all existing data.\n\n` +
      `Continue with import?`
    );

    if (!confirmed) {
      // Reset file input
      event.target.value = '';
      return;
    }

    // Import
    importWorkoutData(text, this.storage);

    alert('✅ Data imported successfully');

    // Close modal and refresh home screen
    const modal = document.getElementById('settings-modal');
    if (modal) modal.style.display = 'none';

    this.showHomeScreen();

  } catch (error) {
    console.error('Import failed:', error);
    alert(`❌ Import failed: ${error.message}`);
  } finally {
    // Reset file input
    event.target.value = '';
  }
}
```

**Step 6: Remove placeholder functionality**

Update the placeholder button listener to exclude History and Settings:

```javascript
// Placeholder buttons (only Progress now)
const placeholderButtons = document.querySelectorAll('.action-btn:nth-child(2)'); // Only Progress button
placeholderButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    alert('⏳ This feature is coming soon!\n\nCurrently available:\n✅ Workout logging\n✅ History viewing\n✅ Data export/import');
  });
});
```

**Step 7: Commit**

```bash
git add src/js/app.js
git commit -m "feat: wire up history screens and export/import in app.js"
```

---

## Task 8: Testing and Documentation

**Step 1: Manual testing checklist**

Test the following scenarios:

1. ✅ View history with no data (empty state)
2. ✅ View history with 1 exercise
3. ✅ View history with multiple exercises
4. ✅ Open exercise detail screen
5. ✅ Chart renders with 1 data point
6. ✅ Chart renders with 8 data points
7. ✅ Edit entry with valid data
8. ✅ Edit entry with invalid data (should show error)
9. ✅ Delete entry (confirm dialog works)
10. ✅ Export data (file downloads)
11. ✅ Import valid JSON (data loads correctly)
12. ✅ Import invalid JSON (shows error)
13. ✅ Navigation: Home → History → Detail → History → Home
14. ✅ Navigation: Home → Settings → Export/Import

**Step 2: Update CHANGELOG**

Add to `CHANGELOG.md` under `## [Unreleased]`:

```markdown
### Added - History & Progress Feature (2026-02-05)

**Complete Workout History Management:**
- History List screen showing all exercises with summary data
- Exercise Detail screen with visual progress chart
- Canvas-based weight progression charts (last 8 workouts)
- Edit workout entries (fix typos, correct data)
- Delete workout entries (remove bad data)
- Export all data to JSON (backup)
- Import data from JSON (restore)
- Data validation on import
- Empty states and error handling

**User Experience:**
- Grouped exercises by workout type
- "Days ago" relative dates
- Visual chart showing weight progression
- Confirmation dialogs for destructive actions
- Toast notifications for success/error
- Settings modal with data management

**Technical:**
- Zero external dependencies (vanilla JS + Canvas)
- 7 new files (3 screens, 1 modal, 1 chart component, 1 utility module)
- 3 new CSS files
- localStorage architecture maintained
- Export format: versioned JSON with metadata
- Retina display support for charts
```

**Step 3: Update README (if needed)**

If `README.md` has a features list, add:

```markdown
- 📊 **History & Progress Tracking**
  - View complete workout history
  - Visual charts showing weight progression
  - Edit/delete entries for data corrections
  - Export/import for data backup and portability
```

**Step 4: Commit**

```bash
git add CHANGELOG.md README.md
git commit -m "docs: document history & progress feature completion"
```

---

## Task 9: Final Review and Cleanup

**Step 1: Check for console errors**

Open browser DevTools and verify:
- No console errors
- No broken imports
- Canvas renders correctly
- All event handlers work

**Step 2: Check responsive design**

Test on mobile viewport (400px width):
- History list cards stack properly
- Chart is readable
- Edit modal fits on screen
- Touch targets are adequate (44px min)

**Step 3: Performance check**

- Chart renders in < 100ms
- History list loads in < 200ms
- Export completes instantly
- Import validates and loads in < 500ms

**Step 4: Final commit**

```bash
git status
git add .
git commit -m "feat: complete history & progress feature

All components implemented and tested:
- History List screen
- Exercise Detail screen with charts
- Edit/Delete functionality
- Export/Import utilities
- Settings modal integration

Manual testing complete. Ready for deployment.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Step 5: Push to remote**

```bash
git push origin main
```

---

## Summary

**Files Created:**
- `src/js/utils/export-import.js` - Data export/import utilities
- `src/js/components/progress-chart.js` - Canvas chart component
- `src/js/screens/history-list.js` - History List screen
- `src/js/screens/exercise-detail.js` - Exercise Detail screen
- `src/js/modals/edit-entry-modal.js` - Edit entry modal
- `src/css/progress-chart.css` - Chart styles
- `src/css/history-screen.css` - History List styles
- `src/css/exercise-detail.css` - Exercise Detail styles
- `src/css/edit-entry-modal.css` - Edit modal styles
- `src/css/export-import.css` - Settings section styles

**Files Modified:**
- `src/index.html` - Added new screens and modals
- `src/js/app.js` - Wired up navigation and features

**Total Tasks:** 9
**Estimated Time:** 3-4 hours
**Dependencies:** None (vanilla JS + Canvas)

---

Plan complete and saved to `docs/plans/2026-02-05-history-progress-implementation.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
