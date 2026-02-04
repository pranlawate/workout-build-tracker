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
  }

  startWorkout() {
    const nextWorkoutName = this.workoutManager.getNextWorkout();
    this.currentWorkout = getWorkout(nextWorkoutName);

    // Switch to workout screen
    document.getElementById('home-screen').classList.remove('active');
    document.getElementById('workout-screen').classList.add('active');

    // Update workout screen title
    const titleEl = document.getElementById('workout-title');
    if (titleEl) {
      titleEl.textContent = this.currentWorkout.displayName;
    }

    // Render exercises (will implement in Task 8)
    this.renderExercises();
  }

  showHomeScreen() {
    document.getElementById('workout-screen').classList.remove('active');
    document.getElementById('home-screen').classList.add('active');

    this.updateHomeScreen();
  }

  renderExercises() {
    // Placeholder for Task 8
    const exerciseList = document.getElementById('exercise-list');
    if (exerciseList) {
      exerciseList.innerHTML = '<p style="color: #a0a0a0; padding: 20px;">Exercise list will render here (Task 8)</p>';
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
