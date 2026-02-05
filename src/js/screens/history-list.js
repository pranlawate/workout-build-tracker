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
    const historyKeys = allKeys.filter(key => key.startsWith('build_exercise_'));

    const exercises = historyKeys.map(key => {
      const exerciseKey = key.replace('build_exercise_', '');
      const history = this.storage.getExerciseHistory(exerciseKey);

      if (history.length === 0) return null;

      const lastEntry = history[history.length - 1];

      // Add null check for lastEntry.date
      if (!lastEntry.date) return null;

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

    try {
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
    } catch (error) {
      console.error('Failed to render history list:', error);
      container.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-icon">⚠️</p>
          <p class="empty-state-text">Unable to load history</p>
          <p class="empty-state-hint">There was a problem loading your workout data. Please try again later.</p>
        </div>
      `;
    }
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
