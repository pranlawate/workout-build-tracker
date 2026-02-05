import { StorageManager } from './modules/storage.js';
import { WorkoutManager } from './modules/workout-manager.js';
import { DeloadManager } from './modules/deload.js';
import { getWorkout, getWarmup } from './modules/workouts.js';
import { getProgressionStatus, getNextWeight } from './modules/progression.js';
import { HistoryListScreen } from './screens/history-list.js';
import { ExerciseDetailScreen } from './screens/exercise-detail.js';
import { EditEntryModal } from './modals/edit-entry-modal.js';
import { exportWorkoutData, importWorkoutData, getDataSummary } from './utils/export-import.js';

class App {
  constructor() {
    this.storage = new StorageManager();
    this.workoutManager = new WorkoutManager(this.storage);
    this.deloadManager = new DeloadManager(this.storage);
    this.currentWorkout = null;
    this.currentExerciseIndex = 0;

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
      this.showDeloadModal(deloadCheck);
    }

    // Show deload banner if active
    const deloadState = this.storage.getDeloadState();
    if (deloadState.active) {
      this.showDeloadBanner(deloadState);
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

    // Placeholder buttons (only Progress now)
    const placeholderButtons = document.querySelectorAll('.action-btn:nth-child(2)'); // Only Progress button
    placeholderButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        alert('⏳ This feature is coming soon!\n\nCurrently available:\n✅ Workout logging\n✅ History viewing\n✅ Data export/import');
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
      if (currentSetIndex === -1) currentSetIndex = 0;
    }

    for (let setNum = 1; setNum <= exercise.sets; setNum++) {
      const setIndex = setNum - 1;

      // Check if we have session data for this set (from current workout)
      const sessionSet = sessionExercise?.sets?.[setIndex];
      const hasSessionData = sessionSet && sessionSet.weight > 0;

      // Use session data if available, otherwise use last workout data
      const lastSet = lastWorkout?.sets?.[setIndex];
      const defaultWeight = hasSessionData ? sessionSet.weight : (lastSet?.weight || exercise.startingWeight);
      const defaultReps = hasSessionData ? sessionSet.reps : (lastSet?.reps || '');

      // Default RIR to minimum of target range (per design spec)
      const defaultRir = hasSessionData ? sessionSet.rir : (lastSet?.rir ?? (() => {
        const [min] = exercise.rirTarget.split('-').map(Number);
        return min;
      })());

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
            />
          </div>

          <div class="set-inputs">
            <label class="input-label">Reps</label>
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

      // Note: We don't unlock next set or check exercise completion here
      // These should only happen when LOG SET button is clicked
      // This prevents premature advancement when user is just typing values
    }
  }

  handleLogSet(event) {
    const button = event.target;
    const exerciseIndex = parseInt(button.dataset.exercise);
    const setIndex = parseInt(button.dataset.set);

    // Read values directly from input fields
    const weightInput = document.querySelector(
      `.set-input[data-exercise="${exerciseIndex}"][data-set="${setIndex}"][data-field="weight"]`
    );
    const repsInput = document.querySelector(
      `.set-input[data-exercise="${exerciseIndex}"][data-set="${setIndex}"][data-field="reps"]`
    );
    const rirInput = document.querySelector(
      `.set-input[data-exercise="${exerciseIndex}"][data-set="${setIndex}"][data-field="rir"]`
    );

    const weight = parseFloat(weightInput?.value);
    const reps = parseInt(repsInput?.value);
    const rir = parseInt(rirInput?.value);

    // Validate all fields are filled with detailed error messages
    const missingFields = [];
    if (!weightInput) missingFields.push('Weight input not found');
    else if (!weight || weight <= 0) missingFields.push('Weight');

    if (!repsInput) missingFields.push('Reps input not found');
    else if (!reps || reps <= 0) missingFields.push('Reps');

    if (!rirInput) missingFields.push('RIR input not found');
    else if (rir === undefined || isNaN(rir)) missingFields.push('RIR');

    if (missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.join(', ')}`);
      console.log('Debug - Looking for inputs:', {
        exerciseIndex,
        setIndex,
        weightInput,
        repsInput,
        rirInput,
        weight,
        reps,
        rir
      });
      return;
    }

    // Ensure session data exists for this set
    const exercise = this.workoutSession.exercises[exerciseIndex];
    if (!exercise.sets[setIndex]) {
      exercise.sets[setIndex] = {};
    }

    // Update session data with values from inputs
    const set = exercise.sets[setIndex];
    set.weight = weight;
    set.reps = reps;
    set.rir = rir;

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

  showDeloadModal(deloadCheck) {
    const modal = document.getElementById('deload-modal');
    const body = document.getElementById('deload-modal-body');

    // Determine trigger message
    let triggerMsg = '';
    if (deloadCheck.reason === 'time') {
      triggerMsg = `You've completed ${deloadCheck.weeks} weeks of training!`;
    } else if (deloadCheck.reason === 'performance') {
      triggerMsg = `Performance decreased on ${deloadCheck.regressions} exercises.`;
    } else if (deloadCheck.reason === 'fatigue') {
      triggerMsg = `High fatigue detected (score: ${deloadCheck.score}).`;
    }

    body.innerHTML = `
      <div class="deload-trigger-reason">
        <strong>Trigger:</strong> ${triggerMsg}
      </div>

      <div class="deload-explanation">
        <h3>Why deload now?</h3>
        <ul>
          <li>Prevent fatigue accumulation</li>
          <li>Allow full recovery</li>
          <li>Come back stronger</li>
        </ul>
      </div>

      <div class="deload-type-selector">
        <div class="deload-type-option selected" data-type="standard">
          <strong>Standard Deload (Recommended)</strong>
          <p>Reduce sets by 40-50%. Keep weights. Focus on perfect form. Duration: 7 days.</p>
        </div>

        <div class="deload-type-option" data-type="light">
          <strong>Light Deload</strong>
          <p>Reduce weight by 20%. Keep sets. Focus on form and ROM. Duration: 7 days.</p>
        </div>

        <div class="deload-type-option" data-type="active_recovery">
          <strong>Active Recovery Week</strong>
          <p>No resistance training. Light stretching, walking, foam rolling. Duration: 7 days.</p>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    // Type selection
    let selectedType = 'standard';
    body.querySelectorAll('.deload-type-option').forEach(option => {
      option.addEventListener('click', () => {
        body.querySelectorAll('.deload-type-option').forEach(o =>
          o.classList.remove('selected')
        );
        option.classList.add('selected');
        selectedType = option.dataset.type;
      });
    });

    // Button handlers
    document.getElementById('start-deload-btn').onclick = () => {
      this.deloadManager.startDeload(selectedType);
      modal.style.display = 'none';
      this.updateHomeScreen();
    };

    document.getElementById('postpone-deload-btn').onclick = () => {
      this.deloadManager.postponeDeload();
      modal.style.display = 'none';
    };

    document.getElementById('dismiss-deload-btn').onclick = () => {
      const deloadState = this.storage.getDeloadState();
      deloadState.lastDeloadDate = new Date().toISOString();
      this.storage.saveDeloadState(deloadState);
      modal.style.display = 'none';
    };
  }

  showDeloadBanner(deloadState) {
    const banner = document.getElementById('deload-banner');
    const details = document.getElementById('banner-details');

    const daysRemaining = this.deloadManager.getDaysRemaining();
    const typeLabel = {
      standard: 'Standard',
      light: 'Light',
      active_recovery: 'Active Recovery'
    }[deloadState.deloadType] || 'Standard';

    details.textContent = `${typeLabel} - ${daysRemaining} days remaining`;
    banner.classList.add('active');

    // End early button
    document.getElementById('end-deload-btn').onclick = () => {
      if (confirm('Are you sure you want to end deload early?')) {
        this.deloadManager.endDeload();
        banner.classList.remove('active');
        this.updateHomeScreen();
      }
    };
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

    // Find current and next set rows
    const exerciseItem = document.querySelector(
      `.exercise-item[data-exercise-index="${exerciseIndex}"]`
    );

    if (!exerciseItem) return;

    const currentSetRow = exerciseItem.querySelector(
      `.set-row[data-set-number="${completedSetIndex + 1}"]`
    );

    const nextSetRow = exerciseItem.querySelector(
      `.set-row[data-set-number="${nextSetIndex + 1}"]`
    );

    if (!nextSetRow) return;

    // Remove sticky class and LOG SET button from current set
    if (currentSetRow) {
      currentSetRow.classList.remove('sticky-set');
      const currentLogBtn = currentSetRow.querySelector('.log-set-btn');
      if (currentLogBtn) currentLogBtn.remove();
    }

    // Remove locked state
    nextSetRow.classList.remove('locked');

    // Add sticky class to next set
    nextSetRow.classList.add('sticky-set');

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

    // Pre-fill weight and reps from completed set
    const weightInput = nextSetRow.querySelector('[data-field="weight"]');
    if (weightInput && completedSet.weight) {
      weightInput.value = completedSet.weight;
    }

    const repsInput = nextSetRow.querySelector('[data-field="reps"]');
    if (repsInput && completedSet.reps) {
      repsInput.value = completedSet.reps;
    }

    // RIR select keeps its default value from initial render

    // Remove any existing LOG SET button from next set (prevent duplicates)
    const existingBtn = nextSetRow.querySelector('.log-set-btn');
    if (existingBtn) existingBtn.remove();

    // Add LOG SET button to next set
    const logButton = document.createElement('button');
    logButton.className = 'log-set-btn';
    logButton.dataset.exercise = exerciseIndex;
    logButton.dataset.set = nextSetIndex;
    logButton.textContent = `LOG SET ${nextSetIndex + 1}`;

    // No need to add click handler - event delegation in attachSetInputListeners handles it

    nextSetRow.appendChild(logButton);
  }

  isExerciseCompleted(exerciseIndex) {
    // Check if an exercise has all its sets logged
    if (!this.workoutSession || !this.currentWorkout) return false;

    const exerciseDef = this.currentWorkout.exercises[exerciseIndex];
    const exerciseSession = this.workoutSession.exercises[exerciseIndex];

    if (!exerciseDef || !exerciseSession) return false;

    // Count completed sets (sets with all three values)
    const completedSets = exerciseSession.sets.filter(set =>
      set && set.weight > 0 && set.reps > 0 && set.rir >= 0
    ).length;

    // Exercise is completed if all required sets are logged
    return completedSets >= exerciseDef.sets;
  }

  checkExerciseCompletion(exerciseIndex) {
    // Only check current exercise
    if (exerciseIndex !== this.currentExerciseIndex) return;

    // If all sets completed, advance to next exercise
    if (this.isExerciseCompleted(exerciseIndex)) {
      this.advanceToNextExercise();
    }
  }

  advanceToNextExercise() {
    // Don't advance past last exercise
    if (this.currentExerciseIndex >= this.currentWorkout.exercises.length - 1) {
      return;
    }

    // Update state classes without re-rendering (preserves session data)
    const allExercises = document.querySelectorAll('.exercise-item');

    allExercises.forEach((exerciseEl, index) => {
      exerciseEl.classList.remove('current', 'completed', 'upcoming');

      // Only mark as completed if all sets are actually logged
      if (index < this.currentExerciseIndex + 1 && this.isExerciseCompleted(index)) {
        exerciseEl.classList.add('completed');
      } else if (index === this.currentExerciseIndex + 1) {
        exerciseEl.classList.add('current');
      } else {
        exerciseEl.classList.add('upcoming');
      }
    });

    // Increment index after updating classes
    this.currentExerciseIndex++;

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

    // Update state classes without re-rendering (preserves session data)
    const allExercises = document.querySelectorAll('.exercise-item');

    allExercises.forEach((exerciseEl, index) => {
      exerciseEl.classList.remove('current', 'completed', 'upcoming');

      // Only mark as completed if all sets are actually logged
      if (index < this.currentExerciseIndex && this.isExerciseCompleted(index)) {
        exerciseEl.classList.add('completed');
      } else if (index === this.currentExerciseIndex) {
        exerciseEl.classList.add('current');
      } else {
        exerciseEl.classList.add('upcoming');
      }
    });

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

  deleteEntry(exerciseKey, index) {
    const history = this.storage.getExerciseHistory(exerciseKey);

    // Calculate reversed index (index passed is display index, not array index)
    const reversedIndex = history.length - 1 - index;
    const entry = history[reversedIndex];
    const deletedDate = entry.date;
    const date = new Date(deletedDate).toLocaleDateString();

    if (confirm(`Delete workout from ${date}?\n\nThis cannot be undone.`)) {
      // Remove the entry
      history.splice(reversedIndex, 1);
      this.storage.saveExerciseHistory(exerciseKey, history);

      // Check if we need to roll back rotation state
      this.checkAndRollbackRotation(exerciseKey, deletedDate);

      // Re-render detail screen
      this.exerciseDetailScreen.render(exerciseKey);
    }
  }

  checkAndRollbackRotation(deletedExerciseKey, deletedDate) {
    const rotation = this.storage.getRotation();

    // Step 1: Check if deleted entry was from the most recent completed workout
    if (!rotation.lastDate) return;

    const deletedDateObj = new Date(deletedDate);
    const lastWorkoutDateObj = new Date(rotation.lastDate);

    // Compare dates (same day)
    if (deletedDateObj.toDateString() !== lastWorkoutDateObj.toDateString()) {
      return; // Deleted entry is from an older workout, don't roll back
    }

    // Step 2: Determine which workout this exercise belonged to
    const workoutName = deletedExerciseKey.split(' - ')[0]; // e.g., "UPPER_A"
    const workout = getWorkout(workoutName);

    if (!workout) return;

    // Step 3: Check if ANY exercises from that workout still have history for that date
    const hasRemainingExercises = workout.exercises.some(exercise => {
      const key = `${workoutName} - ${exercise.name}`;
      const history = this.storage.getExerciseHistory(key);
      return history.some(h =>
        new Date(h.date).toDateString() === deletedDateObj.toDateString()
      );
    });

    if (hasRemainingExercises) {
      return; // Other exercises from that session still exist, don't roll back
    }

    // Step 4: All exercises from that workout session are deleted - roll back rotation
    console.log('Rolling back rotation state - all exercises from last workout deleted');

    // Decrement streak
    rotation.currentStreak = Math.max(0, rotation.currentStreak - 1);

    // Remove last workout from sequence
    if (rotation.sequence && rotation.sequence.length > 0) {
      const removedWorkout = rotation.sequence[rotation.sequence.length - 1];
      rotation.sequence = rotation.sequence.slice(0, -1);

      // Check if removing this workout affects cycle count
      // (If the sequence no longer contains a full cycle)
      const hadFullCycle = this.workoutManager.detectFullCycle([...rotation.sequence, removedWorkout]);
      const hasFullCycleNow = this.workoutManager.detectFullCycle(rotation.sequence);

      if (hadFullCycle && !hasFullCycleNow && rotation.cycleCount > 0) {
        rotation.cycleCount--;
      }
    }

    // Reverse nextSuggested to the workout that was just deleted
    // (This becomes the "current" workout again)
    rotation.nextSuggested = workoutName;

    // Clear lastDate since we're rolling back to before this workout
    if (rotation.sequence && rotation.sequence.length > 0) {
      // Find the date of the previous workout if it exists
      // For now, just clear it - the next workout completion will set it
      rotation.lastDate = null;
    } else {
      rotation.lastDate = null;
    }

    this.storage.saveRotation(rotation);

    // Refresh home screen if it's visible to show updated state
    const homeScreen = document.getElementById('home-screen');
    if (homeScreen && homeScreen.classList.contains('active')) {
      this.updateHomeScreen();
    }
  }

  showSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const fileInput = document.getElementById('import-file-input');

    if (modal) {
      modal.style.display = 'flex';
    }

    // Attach handlers
    const closeBtn = document.getElementById('settings-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.style.display = 'none';
        // Reset file input when closing modal
        if (fileInput) {
          fileInput.value = '';
        }
      };
    }

    const exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) {
      exportBtn.onclick = () => this.handleExport();
    }

    const importBtn = document.getElementById('import-data-btn');
    if (importBtn) {
      importBtn.onclick = () => this.handleImportClick();
    }

    if (fileInput) {
      fileInput.onchange = (e) => this.handleImportFile(e);
    }
  }

  handleExport() {
    try {
      const jsonData = exportWorkoutData(this.storage);

      // Validate JSON before creating blob
      try {
        JSON.parse(jsonData);
      } catch (parseError) {
        throw new Error('Invalid JSON data generated');
      }

      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `workout-data-${new Date().toISOString().split('T')[0]}.json`;

      // Append to DOM to ensure click works in all browsers
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      alert('✅ Data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      alert(`❌ Export failed: ${error.message}\n\nPlease check the console for details.`);
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

  completeWorkout() {
    if (!this.workoutSession || !this.currentWorkout) return;

    // Check how many exercises are completed
    const totalExercises = this.currentWorkout.exercises.length;
    const completedCount = this.currentWorkout.exercises.filter((_, index) =>
      this.isExerciseCompleted(index)
    ).length;

    // If not all exercises are completed, show warning
    const isPartialWorkout = completedCount < totalExercises;

    if (isPartialWorkout) {
      const incompleteExercises = this.currentWorkout.exercises
        .map((ex, idx) => ({ name: ex.name, completed: this.isExerciseCompleted(idx) }))
        .filter(ex => !ex.completed)
        .map(ex => ex.name);

      const confirmMessage = `⚠️ Incomplete Workout\n\nYou've completed ${completedCount} of ${totalExercises} exercises.\n\nIncomplete exercises:\n${incompleteExercises.map(name => `• ${name}`).join('\n')}\n\nDo you want to save this partial workout?\n\nNote: This will save your progress but won't:\n• Advance to next workout\n• Update recovery tracking\n• Count toward your streak\n\n✅ YES - Save partial workout\n❌ NO - Continue training`;

      if (!confirm(confirmMessage)) {
        return; // User chose to continue training
      }
    }

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

      // Only update rotation and recovery if workout is complete
      if (!isPartialWorkout) {
        this.workoutManager.completeWorkout(this.currentWorkout.name);
      }

      // Show appropriate confirmation message
      if (isPartialWorkout) {
        alert(`💾 Partial workout saved!\n\n${completedCount} of ${totalExercises} exercises completed.\n\nNext time you'll continue with ${this.currentWorkout.displayName}.`);
      } else {
        alert(`✅ ${this.currentWorkout.displayName} completed!`);
      }

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
