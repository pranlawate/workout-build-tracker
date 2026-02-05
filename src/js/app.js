import { StorageManager } from './modules/storage.js';
import { WorkoutManager } from './modules/workout-manager.js';
import { getWorkout, getWarmup } from './modules/workouts.js';
import { getProgressionStatus, getNextWeight } from './modules/progression.js';

class App {
  constructor() {
    this.storage = new StorageManager();
    this.workoutManager = new WorkoutManager(this.storage);
    this.currentWorkout = null;
    this.currentExerciseIndex = 0;

    this.initializeApp();
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

  initializeApp() {
    this.updateHomeScreen();
    this.attachEventListeners();
  }

  updateHomeScreen() {
    // Get next workout
    const nextWorkoutName = this.workoutManager.getNextWorkout();
    const nextWorkout = getWorkout(nextWorkoutName);

    if (!nextWorkout) {
      console.error(`Unknown workout: ${nextWorkoutName}`);
      return;
    }

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

  startWorkout() {
    const nextWorkoutName = this.workoutManager.getNextWorkout();
    this.currentWorkout = getWorkout(nextWorkoutName);
    this.currentExerciseIndex = 0;

    if (!this.currentWorkout) {
      console.error(`Cannot start workout: ${nextWorkoutName} not found`);
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

  showHomeScreen() {
    // Stop timer (Task 9)
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // Clean up session data
    this.workoutSession = null;
    this.currentWorkout = null;
    this.currentExerciseIndex = 0;

    const workoutScreen = document.getElementById('workout-screen');
    const homeScreen = document.getElementById('home-screen');
    if (workoutScreen && homeScreen) {
      workoutScreen.classList.remove('active');
      homeScreen.classList.add('active');
    }

    this.updateHomeScreen();
  }

  renderExercises() {
    const exerciseList = document.getElementById('exercise-list');
    if (!exerciseList || !this.currentWorkout) return;

    // Initialize workout session data
    this.workoutSession = {
      workoutName: this.currentWorkout.name,
      startTime: new Date(),
      warmupCompleted: false,
      exercises: []
    };

    // Render warm-up section
    const warmupHtml = this.renderWarmupSection();

    const exercisesHtml = this.currentWorkout.exercises.map((exercise, index) => {
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

    // Combine warm-up and exercises
    exerciseList.innerHTML = warmupHtml + exercisesHtml;

    // Attach input listeners
    this.attachSetInputListeners();
    this.attachWarmupListeners();

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

      // Default RIR to minimum of target range (per design spec)
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
              value="${defaultRir}"
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

    if (status === 'ready' && lastWorkout?.sets?.length > 0) {
      const lastWeight = lastWorkout.sets[0].weight;
      const nextWeight = getNextWeight(lastWeight, exercise.weightIncrement, true);
      return `<p class="progression-hint success">✨ Increase to ${nextWeight}kg this session!</p>`;
    }

    if (status === 'plateau') {
      return `<p class="progression-hint warning">⚠️ Same weight for 3+ sessions. Consider deload or form check.</p>`;
    }

    if (status === 'normal' && lastWorkout?.sets?.length > 0) {
      const lastSet = lastWorkout.sets[lastWorkout.sets.length - 1];
      const [, max] = exercise.repRange.split('-').map(Number);

      if (lastSet.reps < max) {
        return `<p class="progression-hint">Keep weight, aim for ${max} reps on all sets</p>`;
      }
    }

    return '';
  }

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
  }

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

    // Update color for RIR dropdown
    if (field === 'rir' && input.tagName === 'SELECT') {
      input.setAttribute('value', value.toString());
    }

    // Check if this set is complete (has weight, reps, and RIR)
    const set = exercise.sets[setIndex];
    if (set.weight > 0 && set.reps > 0 && set.rir >= 0) {
      this.checkSetProgression(exerciseIndex, setIndex);

      // Check if all sets completed for current exercise
      this.checkExerciseCompletion(exerciseIndex);
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

  renderWarmupSection() {
    const warmupExercises = getWarmup(this.currentWorkout.name);

    if (warmupExercises.length === 0) {
      return '';
    }

    const checklistItems = warmupExercises.map((exercise, index) => `
      <div class="warmup-item" data-warmup-index="${index}">
        <div class="warmup-checkbox"></div>
        <span class="warmup-text">${this.escapeHtml(exercise)}</span>
      </div>
    `).join('');

    return `
      <div class="warmup-section" id="warmup-section">
        <div class="warmup-header" id="warmup-header">
          <h3 class="warmup-title">
            <span>🔥</span>
            <span>Warm-Up Protocol</span>
          </h3>
          <span class="warmup-chevron">▼</span>
        </div>
        <div class="warmup-content">
          <div class="warmup-checklist">
            ${checklistItems}
          </div>
        </div>
      </div>
    `;
  }

  attachWarmupListeners() {
    const warmupSection = document.getElementById('warmup-section');
    if (!warmupSection) return;

    // Toggle expand/collapse
    const warmupHeader = document.getElementById('warmup-header');
    if (warmupHeader) {
      warmupHeader.addEventListener('click', () => {
        warmupSection.classList.toggle('expanded');
      });
    }

    // Handle checkbox clicks
    const warmupItems = warmupSection.querySelectorAll('.warmup-item');
    warmupItems.forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('completed');

        // Check if all items are completed
        const allCompleted = Array.from(warmupItems).every(i =>
          i.classList.contains('completed')
        );

        if (allCompleted && this.workoutSession) {
          this.workoutSession.warmupCompleted = true;
        }
      });
    });
  }

  completeWorkout() {
    if (!this.workoutSession || !this.currentWorkout) return;

    try {
      // Save each exercise's history
      this.workoutSession.exercises.forEach((exerciseSession, index) => {
        const exerciseDef = this.currentWorkout.exercises[index];
        const exerciseKey = `${this.currentWorkout.name} - ${exerciseDef.name}`;

        // Get existing history
        const history = this.storage.getExerciseHistory(exerciseKey);

        // Add new workout entry
        const newEntry = {
          date: this.workoutSession.startTime.toISOString(),
          sets: exerciseSession.sets.filter(set => set.reps > 0)
        };

        // Only save if there are completed sets
        if (newEntry.sets.length > 0) {
          history.push(newEntry);
          this.storage.saveExerciseHistory(exerciseKey, history);
        }
      });

      // Update workout rotation
      this.workoutManager.completeWorkout(this.currentWorkout.name);

      // Show confirmation and return home
      alert(`✅ ${this.currentWorkout.displayName} completed!`);

      this.showHomeScreen();
    } catch (error) {
      console.error('Failed to save workout:', error);
      alert('⚠️ Failed to save workout. Please try again or check storage.');
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
