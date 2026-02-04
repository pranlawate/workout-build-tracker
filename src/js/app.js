import { StorageManager } from './modules/storage.js';
import { WorkoutManager } from './modules/workout-manager.js';
import { getWorkout } from './modules/workouts.js';

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

    // Render exercises (will implement in Task 8)
    this.renderExercises();
  }

  showHomeScreen() {
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
          </div>

          <p class="exercise-meta">
            ${exercise.sets} sets × ${exercise.repRange} reps @ RIR ${exercise.rirTarget}
          </p>

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

  attachSetInputListeners() {
    const inputs = document.querySelectorAll('.set-input');

    inputs.forEach(input => {
      input.addEventListener('change', (e) => this.handleSetInput(e));
    });
  }

  handleSetInput(event) {
    const input = event.target;
    const exerciseIndex = parseInt(input.dataset.exercise);
    const setIndex = parseInt(input.dataset.set);
    const field = input.dataset.field;
    const value = parseFloat(input.value);

    // Ensure sets array exists for this exercise
    const exercise = this.workoutSession.exercises[exerciseIndex];
    if (!exercise.sets[setIndex]) {
      exercise.sets[setIndex] = { weight: 0, reps: 0, rir: 0 };
    }

    // Update the value
    exercise.sets[setIndex][field] = value;
  }

  completeWorkout() {
    if (!this.workoutSession || !this.currentWorkout) return;

    // Save each exercise's history
    this.workoutSession.exercises.forEach((exerciseSession, index) => {
      const exerciseDef = this.currentWorkout.exercises[index];
      const exerciseKey = `${this.currentWorkout.name} - ${exerciseDef.name}`;

      // Get existing history
      const history = this.storage.getExerciseHistory(exerciseKey);

      // Add new workout entry
      const newEntry = {
        date: this.workoutSession.startTime.toISOString(),
        sets: exerciseSession.sets.filter(set => set.reps > 0) // Only save completed sets
      };

      history.push(newEntry);

      // Save updated history (storage.js limits to 8 workouts)
      this.storage.saveExerciseHistory(exerciseKey, history);
    });

    // Update workout rotation
    this.workoutManager.completeWorkout(this.currentWorkout.name);

    // Show confirmation and return home
    alert(`✅ ${this.currentWorkout.displayName} completed!`);

    this.showHomeScreen();
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
