import { StorageManager } from './modules/storage.js';
import { WorkoutManager } from './modules/workout-manager.js';
import { getWorkout } from './modules/workouts.js';
import { getProgressionStatus, shouldIncreaseWeight } from './modules/progression.js';

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
  }

  startWorkout() {
    const nextWorkoutName = this.workoutManager.getNextWorkout();
    this.currentWorkout = getWorkout(nextWorkoutName);

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
