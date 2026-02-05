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
    const [, exerciseName] = exerciseKey.split(' - ');

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

    try {
      // Remove entry
      history.splice(reversedIndex, 1);
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
}
