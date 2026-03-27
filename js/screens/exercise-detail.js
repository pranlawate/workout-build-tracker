// src/js/screens/exercise-detail.js

import { ProgressChart } from '../components/progress-chart.js';
import { getProgressionStatus } from '../modules/progression.js';
import { WORKOUTS } from '../modules/workouts.js';

export class ExerciseDetailScreen {
  constructor(storage, performanceAnalyzer, deloadManager, onBack, onEdit, onDelete) {
    this.storage = storage;
    this.performanceAnalyzer = performanceAnalyzer;
    this.deloadManager = deloadManager;
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
    const exerciseName = exerciseKey.includes(' - ')
      ? exerciseKey.split(' - ').slice(1).join(' - ')
      : exerciseKey;

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

    // Get badges for this session
    const badges = this.getSessionBadges(entry, this.currentExerciseKey);

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
        ${badges.length > 0 ? `
          <div class="history-badges">
            ${badges.map(b => `<span class="badge">${b.icon} ${this.escapeHtml(b.text)}</span>`).join(' ')}
          </div>
        ` : ''}
      </div>
    `;
  }

  formatSets(sets) {
    if (!sets || !Array.isArray(sets) || sets.length === 0) return 'No sets recorded';

    const isBandLike = sets.every(s => [0, 5, 10, 15, 25].includes(s.weight));

    if (isBandLike && sets.some(s => [5, 10, 15, 25].includes(s.weight))) {
      // Format as band exercise
      const formattedSets = sets.map(s => this.formatSetDisplay(s, true)).join(' | ');
      return formattedSets;
    } else {
      // Original format for regular exercises
      const weights = sets.map(s => `${s.weight}kg`).join(', ');
      const reps = sets.map(s => s.reps).join(',');
      const rirs = sets.map(s => s.rir).join(',');
      return `${sets.length} sets: ${weights} × ${reps} @ RIR ${rirs}`;
    }
  }

  /**
   * Format individual set display (band-aware)
   * @param {Object} set - Set object { reps, weight, rir }
   * @param {boolean} isBand - True if band exercise
   * @returns {string} Formatted string
   */
  formatSetDisplay(set, isBand) {
    const reps = set.reps;
    const weight = set.weight;
    const rir = set.rir;

    let weightDisplay;
    if (isBand) {
      const bandInfo = this.weightToBandColor(weight);
      if (bandInfo.color === 'custom' && weight > 0) {
        weightDisplay = `${weight}kg`;
      } else if (bandInfo.color === 'custom') {
        weightDisplay = 'Custom';
      } else {
        weightDisplay = `${bandInfo.symbol} ${bandInfo.label}`;
      }
    } else {
      weightDisplay = `${weight}kg`;
    }

    return `${reps}×${weightDisplay} (RIR ${rir})`;
  }

  /**
   * Convert weight to band color info
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

    // Export button (use onclick to prevent listener stacking across renders)
    const exportBtn = document.getElementById('export-exercise-btn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        this.exportExercise(this.currentExerciseKey);
      };
    }
  }

  handleDelete(index) {
    const history = this.storage.getExerciseHistory(this.currentExerciseKey);
    const entry = history[index];
    if (!entry) return;
    const date = new Date(entry.date).toLocaleDateString();

    if (!confirm(`Delete workout from ${date}?\n\nThis cannot be undone.`)) {
      return;
    }

    try {
      history.splice(index, 1);
      this.storage.saveExerciseHistory(this.currentExerciseKey, history);

      // Re-render
      this.render(this.currentExerciseKey);

      // Show success message
      this.showToast('✅ Workout deleted');
    } catch (error) {
      console.error('Failed to delete workout:', error);
      this.showToast('❌ Failed to delete workout');
    }
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

  /**
   * Calculate badges for a workout session
   * @param {Object} entry - Workout entry { date, sets }
   * @param {string} exerciseKey - Exercise key
   * @returns {Array} Array of badge objects { icon, text, priority }
   */
  getSessionBadges(entry, exerciseKey) {
    const badges = [];
    if (!entry || !entry.sets || !Array.isArray(entry.sets)) return badges;

    try {
      // 1. Check performance (highest priority)
      if (this.performanceAnalyzer) {
        const perf = this.performanceAnalyzer.analyzeExercisePerformance(exerciseKey, entry.sets);
        if (perf && perf.status === 'alert') {
          badges.push({ icon: '🔴', text: perf.message, priority: 1 });
        }
        if (perf && perf.status === 'warning') {
          badges.push({ icon: '🟡', text: perf.message, priority: 2 });
        }
      }

      // 2. Check deload status
      if (this.deloadManager && this.wasDeloadActive(entry.date)) {
        badges.push({ icon: '⚡', text: 'Deload week', priority: 3 });
      }

      // 3. Check pain reports
      const painHistory = this.storage.getPainHistory(exerciseKey);
      const entryDateStr = entry.date?.split('T')[0];
      const hadPain = painHistory.some(p => p.hadPain && p.date === entryDateStr);
      if (hadPain) {
        badges.push({ icon: '🩹', text: 'Pain reported', priority: 4 });
      }

      // 4. Progression status (only if no issues)
      if (badges.length === 0) {
        const history = this.storage.getExerciseHistory(exerciseKey);
        const exerciseName = exerciseKey.includes(' - ')
          ? exerciseKey.split(' - ').slice(1).join(' - ')
          : exerciseKey;

        // Find exercise definition from workout structure
        const exercise = this.findExerciseDefinition(null, exerciseName);

        if (exercise && history && history.length > 0) {
          const status = getProgressionStatus(history, exercise);
          if (status === 'ready') {
            badges.push({ icon: '🟢', text: 'Ready to progress', priority: 5 });
          } else {
            badges.push({ icon: '🔨', text: 'Building reps', priority: 6 });
          }
        }
      }

      // Return top 2 badges by priority
      return badges.sort((a, b) => a.priority - b.priority).slice(0, 2);
    } catch (error) {
      console.error('[ExerciseDetail] Badge calculation error:', error);
      return []; // Safe fallback: no badges on error
    }
  }

  /**
   * Check if deload was active on a specific date
   * @param {string} date - Date string (YYYY-MM-DD)
   * @returns {boolean} True if deload was active
   */
  wasDeloadActive(date) {
    try {
      if (!this.deloadManager) return false;

      // Check current deload status
      const currentDeload = this.deloadManager.isDeloadActive();
      const today = new Date().toISOString().split('T')[0];

      // Simple check: if date matches today and deload is active
      // Note: Historical deload tracking is limited in current implementation
      if (date === today && currentDeload) return true;

      return false;
    } catch (error) {
      console.error('[ExerciseDetail] Deload check error:', error);
      return false;
    }
  }

  /**
   * Find exercise definition from workout structure
   * @param {string} workoutType - Workout type (e.g., 'UPPER_A')
   * @param {string} exerciseName - Exercise name
   * @returns {Object|null} Exercise object or null
   */
  findExerciseDefinition(workoutType, exerciseName) {
    try {
      const workoutsToSearch = workoutType && WORKOUTS[workoutType]
        ? [WORKOUTS[workoutType]]
        : Object.values(WORKOUTS);

      let exercise = null;
      for (const workout of workoutsToSearch) {
        if (!workout || !workout.exercises) continue;
        exercise = workout.exercises.find(ex => ex.name === exerciseName);
        if (exercise) break;
      }
      if (!exercise) return null;

      // Map to expected format (workouts.js uses different property names)
      return {
        name: exercise.name,
        sets: exercise.sets,
        repRange: exercise.repRange,
        rirTarget: exercise.rirTarget,
        weight: exercise.startingWeight,
        increment: exercise.weightIncrement
      };
    } catch (error) {
      console.error('[ExerciseDetail] Exercise lookup error:', error);
      return null;
    }
  }

  /**
   * Export exercise history as JSON
   * @param {string} exerciseKey - Exercise key
   */
  exportExercise(exerciseKey) {
    try {
      const history = this.storage.getExerciseHistory(exerciseKey);
      const exerciseName = exerciseKey.includes(' - ')
        ? exerciseKey.split(' - ').slice(1).join(' - ')
        : exerciseKey;

      const exportData = {
        exercise: exerciseName,
        exportDate: new Date().toISOString(),
        totalSessions: history.length,
        dateRange: {
          first: history[0]?.date || null,
          last: history[history.length - 1]?.date || null
        },
        history: history
      };

      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)],
        { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Sanitize exercise name for filename
      const sanitizedName = exerciseName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `exercise-${sanitizedName}-${dateStr}.json`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showToast('✅ Exercise data exported');
    } catch (error) {
      console.error('[ExerciseDetail] Export error:', error);
      this.showToast('❌ Export failed');
    }
  }
}
