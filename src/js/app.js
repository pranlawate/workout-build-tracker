import { StorageManager } from './modules/storage.js';
import { WorkoutManager } from './modules/workout-manager.js';
import { DeloadManager } from './modules/deload.js';
import { getWorkout, getWarmup } from './modules/workouts.js';
import { getProgressionStatus, getNextWeight } from './modules/progression.js';

class App {
  constructor() {
    this.storage = new StorageManager();
    this.workoutManager = new WorkoutManager(this.storage);
    this.deloadManager = new DeloadManager(this.storage);
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
    this.initializeNumberOverlay();
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

    // Add cycle progress display
    const cycleProgressEl = document.getElementById('cycle-progress');
    if (cycleProgressEl) {
      const cycleCount = rotation.cycleCount || 0;
      const streak = rotation.currentStreak || 0;
      const nextDeload = 8 - (cycleCount % 8); // Deload every 8 cycles

      cycleProgressEl.innerHTML = `
        <div class="progress-item">
          <span class="progress-label">Current Streak:</span>
          <span class="progress-value">${streak} workouts</span>
        </div>
        <div class="progress-item">
          <span class="progress-label">Next Deload:</span>
          <span class="progress-value">${nextDeload} cycles away</span>
        </div>
      `;
    }

    // Check for deload trigger
    const deloadCheck = this.deloadManager.shouldTriggerDeload();
    if (deloadCheck.trigger) {
      // For now, just log - UI will be in Task 29
      console.log('Deload trigger detected:', deloadCheck);
      // this.showDeloadModal(deloadCheck); // Will implement in Task 29
    }

    // Show deload banner if active
    const deloadState = this.storage.getDeloadState();
    if (deloadState.active) {
      // For now, just log - UI will be in Task 29
      console.log('Deload active:', deloadState);
      // this.showDeloadBanner(deloadState); // Will implement in Task 29
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

    // Check muscle recovery
    const recoveryCheck = this.workoutManager.checkMuscleRecovery(nextWorkoutName);

    if (recoveryCheck.warn) {
      this.showRecoveryWarning(nextWorkoutName, recoveryCheck);
      return; // Don't start workout yet
    }

    // Proceed with workout start
    this.proceedWithWorkout(nextWorkoutName);
  }

  showRecoveryWarning(workoutName, recoveryCheck) {
    const modal = document.getElementById('recovery-modal');
    const body = document.getElementById('recovery-modal-body');

    const rotation = this.storage.getRotation();
    const lastDate = new Date(rotation.lastDate);
    const hoursAgo = Math.floor((new Date() - lastDate) / (1000 * 60 * 60));

    body.innerHTML = `
      <p class="recovery-time">Last workout: ${hoursAgo} hours ago</p>

      <div class="muscles-recovering">
        <p><strong>Muscles still recovering:</strong></p>
        <ul>
          ${recoveryCheck.muscles.map(m => `
            <li>• ${m.name}: Need ${m.hoursNeeded} more hours</li>
          `).join('')}
        </ul>
      </div>

      <div class="recovery-advice">
        <p>Training too soon may:</p>
        <ul>
          <li>• Compromise form quality</li>
          <li>• Limit performance gains</li>
          <li>• Increase injury risk</li>
        </ul>
      </div>

      <p class="recovery-recommendation">
        <strong>Recommended:</strong> Wait until tomorrow (48hr mark)
      </p>
    `;

    modal.style.display = 'flex';

    // Attach handlers
    document.getElementById('wait-recovery-btn').onclick = () => {
      modal.style.display = 'none';
    };

    document.getElementById('train-anyway-btn').onclick = () => {
      modal.style.display = 'none';
      this.proceedWithWorkout(workoutName);
    };
  }

  proceedWithWorkout(workoutName) {
    this.currentWorkout = getWorkout(workoutName);
    this.currentExerciseIndex = 0;

    if (!this.currentWorkout) {
      console.error(`Cannot start workout: ${workoutName} not found`);
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
            <div class="exercise-badges">
              ${this.renderProgressionBadge(exercise, history)}
              ${exercise.machineOk ? '<span class="machine-badge" title="Machine version OK when fatigued">ℹ️ Machine OK</span>' : ''}
            </div>
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
    let currentSetIndex = 0;

    // Determine which set is current (first incomplete)
    const sessionExercise = this.workoutSession?.exercises[exerciseIndex];
    if (sessionExercise) {
      currentSetIndex = sessionExercise.sets.findIndex(s =>
        !s || s.reps === 0 || !s.weight || s.rir === undefined
      );
      if (currentSetIndex === -1) currentSetIndex = exercise.sets - 1;
    }

    for (let setNum = 1; setNum <= exercise.sets; setNum++) {
      const setIndex = setNum - 1;
      const lastSet = lastWorkout?.sets?.[setIndex];
      const defaultWeight = lastSet?.weight || exercise.startingWeight;
      const defaultReps = lastSet?.reps || '';

      // Default RIR to minimum of target range (per design spec)
      const defaultRir = lastSet?.rir ?? (() => {
        const [min] = exercise.rirTarget.split('-').map(Number);
        return min;
      })();

      // Determine set state
      const isCurrent = setIndex === currentSetIndex;
      const isLocked = setIndex > currentSetIndex;
      const disabledAttr = isLocked ? 'disabled' : '';
      const lockedClass = isLocked ? 'locked' : '';
      const stickyClass = isCurrent ? 'sticky-set' : '';

      // LOG SET button only for current set
      const logButtonHtml = isCurrent ? `
        <button
          class="log-set-btn"
          data-exercise="${exerciseIndex}"
          data-set="${setIndex}"
        >
          LOG SET ${setNum}
        </button>
      ` : '';

      html += `
        <div class="set-row ${lockedClass} ${stickyClass}" data-set-number="${setNum}">
          <span class="set-label">
            Set ${setNum}
            ${isLocked ? '<span class="lock-icon">🔒</span>' : ''}
          </span>

          <div class="set-inputs">
            <label class="input-label">Weight (kg)</label>
            <div class="input-with-edit">
              <input
                type="number"
                class="set-input"
                data-exercise="${exerciseIndex}"
                data-set="${setIndex}"
                data-field="weight"
                value="${defaultWeight}"
                step="0.5"
                min="0"
                ${disabledAttr}
                readonly
              />
              <button
                class="edit-icon"
                data-exercise="${exerciseIndex}"
                data-set="${setIndex}"
                data-field="weight"
                data-current-value="${defaultWeight}"
                ${disabledAttr}
              >
                ✎
              </button>
            </div>
          </div>

          <div class="set-inputs">
            <label class="input-label">Reps</label>
            <div class="input-with-edit">
              <input
                type="number"
                class="set-input"
                data-exercise="${exerciseIndex}"
                data-set="${setIndex}"
                data-field="reps"
                value="${defaultReps}"
                min="0"
                placeholder="0"
                ${disabledAttr}
                readonly
              />
              <button
                class="edit-icon"
                data-exercise="${exerciseIndex}"
                data-set="${setIndex}"
                data-field="reps"
                data-current-value="${defaultReps}"
                ${disabledAttr}
              >
                ✎
              </button>
            </div>
          </div>

          <div class="set-inputs">
            <label class="input-label">
              RIR
              <span class="rir-help" title="Reps In Reserve - How many more reps you could do">ℹ️</span>
            </label>
            <select
              class="set-input rir-select"
              data-exercise="${exerciseIndex}"
              data-set="${setIndex}"
              data-field="rir"
              value="${defaultRir}"
              ${disabledAttr}
            >
              <option value="0" ${defaultRir === 0 ? 'selected' : ''}>0 (Failure)</option>
              <option value="1" ${defaultRir === 1 ? 'selected' : ''}>1</option>
              <option value="2" ${defaultRir === 2 ? 'selected' : ''}>2 (Target)</option>
              <option value="3" ${defaultRir === 3 ? 'selected' : ''}>3 (Target)</option>
              <option value="4" ${defaultRir === 4 ? 'selected' : ''}>4</option>
              <option value="5" ${defaultRir >= 5 ? 'selected' : ''}>5+</option>
            </select>
          </div>

          ${logButtonHtml}
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

    // Add LOG SET button handler
    exerciseList.addEventListener('click', (e) => {
      if (e.target.classList.contains('log-set-btn')) {
        this.handleLogSet(e);
      }
    });
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

      // Unlock next set
      this.unlockNextSet(exerciseIndex, setIndex);

      // Check if all sets completed for current exercise
      this.checkExerciseCompletion(exerciseIndex);
    }
  }

  handleLogSet(event) {
    const button = event.target;
    const exerciseIndex = parseInt(button.dataset.exercise);
    const setIndex = parseInt(button.dataset.set);

    const exercise = this.workoutSession.exercises[exerciseIndex];
    const set = exercise.sets[setIndex];

    // Validate set is complete
    if (!set || !set.weight || !set.reps || set.rir === undefined) {
      alert('Please fill in all fields (Weight, Reps, RIR) before logging set');
      return;
    }

    // Visual feedback
    button.textContent = '✓ LOGGED';
    button.disabled = true;
    button.style.background = 'var(--color-success)';

    // Trigger progression check and unlock
    this.checkSetProgression(exerciseIndex, setIndex);
    this.unlockNextSet(exerciseIndex, setIndex);
    this.checkExerciseCompletion(exerciseIndex);

    // Note: showPostSetFeedback will be implemented in Task 26
    // For now, just call it as a no-op if it doesn't exist
    if (this.showPostSetFeedback) {
      this.showPostSetFeedback(exerciseIndex, setIndex, set);
    }
  }

  showPostSetFeedback(exerciseIndex, setIndex, set) {
    const exerciseDef = this.currentWorkout.exercises[exerciseIndex];
    const sessionExercise = this.workoutSession.exercises[exerciseIndex];

    // Parse rep range
    const [minReps, maxReps] = exerciseDef.repRange.split('-').map(Number);
    const [minRir, maxRir] = exerciseDef.rirTarget.split('-').map(Number);

    // Determine feedback message and color
    let message = '';
    let colorClass = 'info';

    // Check if hitting progression criteria
    if (set.reps >= maxReps && set.rir >= minRir) {
      message = `🟢 Great set! Hitting max reps with good reserve.`;
      colorClass = 'success';

      // Check if this could trigger progression
      const allSetsMaxReps = sessionExercise.sets
        .filter(s => s && s.reps > 0)
        .every(s => s.reps >= maxReps && s.rir >= minRir);

      if (allSetsMaxReps && setIndex === exerciseDef.sets - 1) {
        message = `🟢 All sets hit ${maxReps} reps! Increase weight next workout.`;
      }
    }
    // Check if reps too low
    else if (set.reps < minReps) {
      message = `🔴 Below target range. Consider reducing weight next set.`;
      colorClass = 'danger';
    }
    // Check if RIR too low
    else if (set.rir < minRir) {
      message = `🟡 Too close to failure (RIR ${set.rir}). Aim for RIR ${minRir}-${maxRir}.`;
      colorClass = 'warning';
    }
    // Normal progress
    else {
      message = `🔵 Good progress - aim for ${maxReps} reps on next set.`;
      colorClass = 'info';
    }

    // Display feedback
    this.displayFeedbackToast(message, colorClass);
  }

  displayFeedbackToast(message, colorClass) {
    // Remove existing toast if present
    const existing = document.querySelector('.feedback-toast');
    if (existing) existing.remove();

    // Create toast
    const toast = document.createElement('div');
    toast.className = `feedback-toast ${colorClass}`;
    toast.textContent = message;

    // Add to DOM
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
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

  unlockNextSet(exerciseIndex, completedSetIndex) {
    const exerciseDef = this.currentWorkout.exercises[exerciseIndex];
    const nextSetIndex = completedSetIndex + 1;

    // Don't unlock beyond total sets
    if (nextSetIndex >= exerciseDef.sets) return;

    // Find next set row
    const exerciseItem = document.querySelector(
      `.exercise-item[data-exercise-index="${exerciseIndex}"]`
    );

    if (!exerciseItem) return;

    const nextSetRow = exerciseItem.querySelector(
      `.set-row[data-set-number="${nextSetIndex + 1}"]`
    );

    if (!nextSetRow) return;

    // Remove locked state
    nextSetRow.classList.remove('locked');

    // Enable inputs
    const inputs = nextSetRow.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.disabled = false;
    });

    // Remove lock icon
    const lockIcon = nextSetRow.querySelector('.lock-icon');
    if (lockIcon) lockIcon.remove();

    // Pre-fill with values from completed set
    const completedSet = this.workoutSession.exercises[exerciseIndex].sets[completedSetIndex];

    // Weight input
    const weightInput = nextSetRow.querySelector('[data-field="weight"]');
    if (weightInput && completedSet.weight) {
      weightInput.value = completedSet.weight;
    }

    // Reps input - leave empty for user to fill
    // RIR select - keep default
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

  initializeNumberOverlay() {
    const overlay = document.getElementById('number-overlay');
    const closeBtn = document.getElementById('overlay-close');
    const confirmBtn = document.getElementById('overlay-confirm');
    const numPad = document.querySelector('.number-pad');

    let currentValue = '0';
    let targetInput = null;

    // Close overlay
    const closeOverlay = () => {
      overlay.classList.remove('active');
      currentValue = '0';
      targetInput = null;
    };

    closeBtn.addEventListener('click', closeOverlay);

    // Number pad handlers
    numPad.addEventListener('click', (e) => {
      if (!e.target.classList.contains('num-btn') &&
          !e.target.classList.contains('quick-btn')) return;

      const value = e.target.dataset.value;

      if (value === 'clear') {
        currentValue = '0';
      } else if (value === 'back') {
        currentValue = currentValue.length > 1 ?
          currentValue.slice(0, -1) : '0';
      } else if (value.startsWith('+') || value.startsWith('-')) {
        // Quick adjust
        const adjustment = parseFloat(value);
        const current = parseFloat(currentValue) || 0;
        currentValue = Math.max(0, current + adjustment).toString();
      } else if (value === '.') {
        if (!currentValue.includes('.')) {
          currentValue += '.';
        }
      } else {
        // Number
        currentValue = currentValue === '0' ? value : currentValue + value;
      }

      document.getElementById('overlay-value').textContent = currentValue;
    });

    // Confirm button
    confirmBtn.addEventListener('click', () => {
      if (targetInput) {
        targetInput.value = currentValue;

        // Trigger change event
        const event = new Event('change', { bubbles: true });
        targetInput.dispatchEvent(event);
      }

      closeOverlay();
    });

    // Open overlay when edit icon clicked
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-icon')) {
        const field = e.target.dataset.field;
        const exerciseIndex = e.target.dataset.exercise;
        const setIndex = e.target.dataset.set;

        // Find corresponding input
        targetInput = document.querySelector(
          `.set-input[data-exercise="${exerciseIndex}"][data-set="${setIndex}"][data-field="${field}"]`
        );

        if (!targetInput) return;

        // Set initial value
        currentValue = targetInput.value || '0';
        document.getElementById('overlay-value').textContent = currentValue;

        // Set title
        const title = field === 'weight' ? 'Edit Weight' : 'Edit Reps';
        document.getElementById('overlay-title').textContent = title;

        // Set unit
        const unit = field === 'weight' ? 'kg' : 'reps';
        document.getElementById('overlay-unit').textContent = unit;

        // Show overlay
        overlay.classList.add('active');
      }
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

      // Update workflow rotation
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
