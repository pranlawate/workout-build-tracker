import { StorageManager } from './modules/storage.js';
import { WorkoutManager } from './modules/workout-manager.js';
import { DeloadManager } from './modules/deload.js';
import { PerformanceAnalyzer } from './modules/performance-analyzer.js';
import { BarbellProgressionTracker } from './modules/barbell-progression-tracker.js';
import { BodyWeightManager } from './modules/body-weight.js';
import { ProgressAnalyzer } from './modules/progress-analyzer.js';
import { AnalyticsCalculator } from './modules/analytics-calculator.js';
import { WeightTrendChart } from './components/weight-trend-chart.js';
import { getWorkout, getWarmup } from './modules/workouts.js';
import { getProgressionStatus, getNextWeight } from './modules/progression.js';
import { getSuggestion } from './modules/smart-progression.js';
import { getFormCues } from './modules/form-cues.js';
import { HistoryListScreen } from './screens/history-list.js';
import { ExerciseDetailScreen } from './screens/exercise-detail.js';
import { EditEntryModal } from './modals/edit-entry-modal.js';
import { exportWorkoutData, importWorkoutData, getDataSummary } from './utils/export-import.js';
import { getAllWorkouts } from './modules/workouts.js';
import { detectAchievements, formatAchievementType, getAllAchievements } from './modules/achievements.js';
import { UnlockEvaluator } from './modules/unlock-evaluator.js';
import { PROGRESSION_PATHS, getProgressionPath, getSlotForExercise } from './modules/progression-pathways.js';
import { COMPLEXITY_TIERS, getComplexityTier } from './modules/complexity-tiers.js';
import { getWarmupProtocol } from './modules/warm-up-protocols.js';

class App {
  constructor() {
    this.storage = new StorageManager();
    this.workoutManager = new WorkoutManager(this.storage);
    this.deloadManager = new DeloadManager(this.storage);
    this.performanceAnalyzer = new PerformanceAnalyzer(this.storage);
    this.unlockEvaluator = new UnlockEvaluator(this.storage);
    this.analyticsCalculator = new AnalyticsCalculator(this.storage);
    this.currentWorkout = null;
    this.currentExerciseIndex = 0;

    // Workout reference expanded state (0-3 = workout index, null = none)
    const stored = sessionStorage.getItem('expandedWorkout');
    this.expandedWorkout = stored && !isNaN(parseInt(stored, 10))
      ? parseInt(stored, 10)
      : null;

    // History and detail screens
    this.historyListScreen = new HistoryListScreen(
      this.storage,
      (exerciseKey) => this.showExerciseDetail(exerciseKey)
    );

    this.exerciseDetailScreen = new ExerciseDetailScreen(
      this.storage,
      this.performanceAnalyzer,
      this.deloadManager,
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

  /**
   * Get performance badge HTML for an exercise during workout
   * @param {string} exerciseKey - Exercise identifier
   * @param {Array} currentSets - Current logged sets for this exercise
   * @returns {string} HTML string for badge, or empty string if no issues
   */
  getPerformanceBadge(exerciseKey, currentSets = []) {
    const analysis = this.performanceAnalyzer.analyzeExercisePerformance(exerciseKey, currentSets);

    if (analysis.status === 'good' || !analysis.message) {
      return '';
    }

    const badgeClass = analysis.status === 'alert' ? 'badge-alert' : 'badge-warning';
    const icon = analysis.status === 'alert' ? '🔴' : '🟡';

    return `
      <div class="performance-badge ${badgeClass}">
        ${icon} ${this.escapeHtml(analysis.message)}
      </div>
    `;
  }

  /**
   * Update the performance badge for a specific exercise during workout
   * @param {number} exerciseIndex - Index of exercise in current workout
   */
  updatePerformanceBadge(exerciseIndex) {
    if (!this.currentWorkout || !this.workoutSession) return;

    const exercise = this.currentWorkout.exercises[exerciseIndex];
    const exerciseKey = `${this.currentWorkout.name} - ${exercise.name}`;
    const exerciseSession = this.workoutSession.exercises[exerciseIndex];

    // Get fresh analysis
    const badgeHtml = this.getPerformanceBadge(exerciseKey, exerciseSession.sets);

    // Find badge container in DOM
    const exerciseCard = document.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
    if (!exerciseCard) return;

    // Find existing badge container
    let badgeContainer = exerciseCard.querySelector('.performance-badge-container');

    if (!badgeContainer) {
      // Create container if doesn't exist
      const exerciseMeta = exerciseCard.querySelector('.exercise-meta');
      if (exerciseMeta) {
        badgeContainer = document.createElement('div');
        badgeContainer.className = 'performance-badge-container';
        exerciseMeta.after(badgeContainer);
      }
    }

    if (badgeContainer) {
      badgeContainer.innerHTML = badgeHtml;
    }
  }

  initializeApp() {
    this.setupBrowserHistory();
    this.updateHomeScreen();
    this.attachEventListeners();
    this.initializeNumberOverlay();
    this.setupBandColorButtons();

    // Initialize recovery modal
    this.initRecoveryModalRadios();

    // Recovery modal submit
    const submitRecoveryBtn = document.getElementById('submit-recovery-btn');
    if (submitRecoveryBtn) {
      submitRecoveryBtn.addEventListener('click', () => this.handleRecoverySubmit());
    }

    // Fatigue warning buttons
    const dismissWarningBtn = document.getElementById('dismiss-warning-btn');
    if (dismissWarningBtn) {
      dismissWarningBtn.addEventListener('click', () => this.handleWarningDismiss());
    }

    const deloadWarningBtn = document.getElementById('deload-warning-btn');
    if (deloadWarningBtn) {
      deloadWarningBtn.addEventListener('click', () => this.handleWarningDeload());
    }

    const continueWarningBtn = document.getElementById('continue-warning-btn');
    if (continueWarningBtn) {
      continueWarningBtn.addEventListener('click', () => this.handleWarningContinue());
    }
  }

  setupBrowserHistory() {
    // Set initial state (home screen)
    if (!window.history.state) {
      window.history.replaceState({ screen: 'home' }, '', '');
    }

      // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
      if (!event.state) {
        // Trying to go back beyond app's initial state
        // Push home state to keep user in the app
        window.history.pushState({ screen: 'home' }, '', '');
        this.navigateToScreen('home');
        return;
      }

      // Navigate to the screen in history state
      this.navigateToScreen(event.state.screen, event.state.data);
    });
  }

  navigateToScreen(screen, data = {}) {
    // Always close modal when navigating (modals are overlays, not screens)
    this.closeSettingsModal();

    switch (screen) {
      case 'home':
        this.showHomeScreen(false); // false = don't push to history
        break;
      case 'workout':
        // Navigating TO workout screen (e.g., back from modal)
        // Workout screen is already visible, modal already closed above
        // Do nothing - just stay on workout screen
        break;
      case 'history':
        this.showHistoryScreen(false);
        break;
      case 'exercise-detail':
        if (data.exerciseKey) {
          this.showExerciseDetail(data.exerciseKey, false);
        }
        break;
      case 'progress':
        this.showProgressDashboard(false);
        break;
      case 'weighin':
        // Do nothing - modal already closed by closeSettingsModal
        break;
      default:
        this.showHomeScreen(false);
    }
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

    // Summary back button
    const summaryBackBtn = document.getElementById('summary-back-btn');
    if (summaryBackBtn) {
      summaryBackBtn.addEventListener('click', () => this.showHomeScreen());
    }

    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.showSettingsModal());
    }

    // Progress button
    const progressBtn = document.getElementById('progress-btn');
    if (progressBtn) {
      progressBtn.addEventListener('click', () => this.showProgressDashboard());
    }

    // Workout settings button
    const workoutSettingsBtn = document.getElementById('workout-settings-btn');
    if (workoutSettingsBtn) {
      workoutSettingsBtn.addEventListener('click', () => this.showSettingsModal());
    }

    // Exercise progressions browser
    const browseBtn = document.getElementById('browse-progressions-btn');
    if (browseBtn) {
      browseBtn.addEventListener('click', () => this.showProgressionsBrowser());
    }

    // Training phase toggle
    const buildingBtn = document.getElementById('phase-building-btn');
    const maintenanceBtn = document.getElementById('phase-maintenance-btn');
    const phaseInfo = document.getElementById('phase-info-text');

    if (buildingBtn && maintenanceBtn) {
      buildingBtn.addEventListener('click', () => {
        this.storage.saveTrainingPhase('building');
        buildingBtn.classList.add('active');
        maintenanceBtn.classList.remove('active');
        phaseInfo.textContent = 'Building: Focus on progressive overload and strength gains';
      });

      maintenanceBtn.addEventListener('click', () => {
        this.storage.saveTrainingPhase('maintenance');
        maintenanceBtn.classList.add('active');
        buildingBtn.classList.remove('active');
        phaseInfo.textContent = 'Maintenance: Sustain strength with varied accessories';
      });

      // Set initial state
      const currentPhase = this.storage.getTrainingPhase();
      if (currentPhase === 'maintenance') {
        maintenanceBtn.classList.add('active');
        buildingBtn.classList.remove('active');
        phaseInfo.textContent = 'Maintenance: Sustain strength with varied accessories';
      }
    }
  }

  startWorkout() {
    // Check if recovery check is due
    if (this.isRecoveryCheckDue()) {
      this.showRecoveryMetricsModal();
      return; // Stop here, modal will handle next steps
    }

    // Get next workout
    const nextWorkoutName = this.workoutManager.getNextWorkout();

    if (!nextWorkoutName) {
      alert('No workout scheduled. Please check workout rotation.');
      return;
    }

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

    // Hide all screens first, then show workout screen
    this.hideAllScreens();
    const workoutScreen = document.getElementById('workout-screen');
    if (workoutScreen) {
      workoutScreen.classList.add('active');
    }

    // Update workout screen title
    const titleEl = document.getElementById('workout-title');
    if (titleEl) {
      titleEl.textContent = this.currentWorkout.displayName;
    }

    // Push workout state to history
    window.history.pushState({ screen: 'workout' }, '', '');

    // Start timer
    this.startTimer();

    // Render exercises
    this.renderExercises();
  }

  /**
   * Show workout selection after recovery check
   * This continues the workout start flow after recovery modal is dismissed
   */
  showWorkoutSelection() {
    // Get next workout
    const nextWorkoutName = this.workoutManager.getNextWorkout();

    if (!nextWorkoutName) {
      alert('No workout scheduled. Please check workout rotation.');
      return;
    }

    // Check muscle recovery
    const recoveryCheck = this.workoutManager.checkMuscleRecovery(nextWorkoutName);

    if (recoveryCheck.warn) {
      this.showRecoveryWarning(nextWorkoutName, recoveryCheck);
      return; // Don't start workout yet
    }

    // Proceed with workout start
    this.proceedWithWorkout(nextWorkoutName);
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

  showHomeScreen(pushHistory = true) {
    // Stop timer (Task 9)
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // Clean up session data
    this.workoutSession = null;
    this.currentWorkout = null;
    this.currentExerciseIndex = 0;

    // Hide all screens first (consistent with other navigation methods)
    this.hideAllScreens();

    // Show home screen
    const homeScreen = document.getElementById('home-screen');
    if (homeScreen) {
      homeScreen.classList.add('active');
    }

    this.updateHomeScreen();

    // Push to browser history
    if (pushHistory && window.history.state?.screen !== 'home') {
      window.history.pushState({ screen: 'home' }, '', '');
    }
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
    const warmupHtml = this.renderWarmupProtocol(this.currentWorkout.name);

    const exercisesHtml = this.currentWorkout.exercises.map((exercise, index) => {
      const exerciseKey = `${this.currentWorkout.name} - ${exercise.name}`;
      const history = this.storage.getExerciseHistory(exerciseKey);
      const painHistory = this.storage.getPainHistory(exerciseKey);
      const lastWorkout = history.length > 0 ? history[history.length - 1] : null;

      // Initialize session data for this exercise
      this.workoutSession.exercises.push({
        name: exercise.name,
        sets: []
      });

      // Get performance badge for this exercise
      const exerciseSession = this.workoutSession.exercises[index];
      const performanceBadge = this.getPerformanceBadge(exerciseKey, exerciseSession.sets);

      // Get smart progression suggestion
      const suggestion = getSuggestion(exerciseKey, history, painHistory);
      const suggestionBanner = this.generateSuggestionBanner(suggestion);

      // Get form cues
      const formCues = getFormCues(exercise.name);
      let formCuesHTML = '';

      if (formCues) {
        formCuesHTML = `
          <div class="form-guide-section">
            <button class="form-guide-toggle" onclick="app.toggleFormGuide(${index})" id="form-toggle-${index}">
              📋 Form Guide ▼
            </button>
            <div class="form-guide-content" id="form-guide-${index}" style="display: none;">
              <div class="form-cue-category">
                <strong>Setup:</strong>
                <ul>
                  ${formCues.setup.map(cue => `<li>${this.escapeHtml(cue)}</li>`).join('')}
                </ul>
              </div>
              <div class="form-cue-category">
                <strong>Execution:</strong>
                <ul>
                  ${formCues.execution.map(cue => `<li>${this.escapeHtml(cue)}</li>`).join('')}
                </ul>
              </div>
              <div class="form-cue-category">
                <strong>⚠️ Avoid:</strong>
                <ul>
                  ${formCues.mistakes.map(cue => `<li>${this.escapeHtml(cue)}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        `;
      }

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
            ${this.formatExerciseMeta(exercise)}
          </p>

          <div class="performance-badge-container">
            ${performanceBadge}
          </div>

          ${suggestionBanner}

          ${formCuesHTML}

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

      // Use session data if available, otherwise check previous set in current session, then last workout data
      const prevSessionSet = sessionExercise?.sets?.[setIndex - 1]; // Previous set in current workout
      const lastSet = lastWorkout?.sets?.[setIndex];
      const defaultWeight = hasSessionData
        ? sessionSet.weight
        : (prevSessionSet?.weight || lastSet?.weight || exercise.startingWeight);
      const defaultReps = hasSessionData ? sessionSet.reps : (lastSet?.reps || '');

      // Default RIR to minimum of target range (per design spec)
      // Time-based exercises don't have RIR
      const defaultRir = hasSessionData ? sessionSet.rir : (lastSet?.rir ?? (() => {
        if (!exercise.rirTarget) return 0; // Time-based exercises
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

      // Render weight input: band buttons OR regular input
      const isBand = this.isBandExercise(exercise);
      let weightInputHtml;
      if (isBand) {
        // Band resistance dropdown
        const isCustomWeight = ![5,10,15,25].includes(defaultWeight);
        weightInputHtml = `
          <div class="set-inputs">
            <label class="input-label">Band Resistance</label>
            <select class="set-input band-select"
                    data-exercise="${exerciseIndex}"
                    data-set="${setIndex}"
                    data-field="weight"
                    ${disabledAttr}>
              <option value="5" ${defaultWeight === 5 ? 'selected' : ''}>🟡 Light (5kg)</option>
              <option value="10" ${defaultWeight === 10 ? 'selected' : ''}>🔴 Medium (10kg)</option>
              <option value="15" ${defaultWeight === 15 ? 'selected' : ''}>🔵 Heavy (15kg)</option>
              <option value="25" ${defaultWeight === 25 ? 'selected' : ''}>⚫ X-Heavy (25kg)</option>
              <option value="custom" ${isCustomWeight ? 'selected' : ''}>⚪ Custom</option>
            </select>
            <input type="number"
                   class="band-custom-input set-input"
                   data-exercise="${exerciseIndex}"
                   data-set="${setIndex}"
                   data-field="weight-custom"
                   placeholder="Enter weight (kg)"
                   step="0.5"
                   min="0"
                   style="display: ${isCustomWeight ? 'block' : 'none'}; margin-top: 8px;"
                   value="${isCustomWeight ? defaultWeight : ''}"
                   ${disabledAttr}>
          </div>
        `;
      } else {
        // Regular weight input
        weightInputHtml = `
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
        `;
      }

      // Detect time-based exercises (e.g., "30-60s" holds vs "10-12/side" reps)
      const isTimeBased = this.isTimeBasedExercise(exercise);
      const repsLabel = isTimeBased ? 'Duration (s)' : 'Reps';

      html += `
        <div class="set-row ${lockedClass} ${stickyClass}" data-set-number="${setNum}">
          <span class="set-label">
            Set ${setNum}
            ${isLocked ? '<span class="lock-icon">🔒</span>' : ''}
          </span>

          ${weightInputHtml}

          <div class="set-inputs">
            <label class="input-label">${repsLabel}</label>
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

          ${!isTimeBased ? `
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
          ` : ''}

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

  /**
   * Generate smart suggestion banner HTML
   *
   * @param {object|null} suggestion - Suggestion from getSuggestion()
   * @returns {string} HTML for suggestion banner
   */
  generateSuggestionBanner(suggestion) {
    if (!suggestion) return '';

    const urgencyClass = this.getSuggestionUrgencyClass(suggestion.urgency || 'normal');
    const icon = this.getSuggestionIcon(suggestion.type);
    const typeLabel = this.getSuggestionTypeLabel(suggestion.type);

    let bannerHTML = `
      <div class="smart-suggestion ${urgencyClass}">
        <div class="suggestion-icon">${icon}</div>
        <div class="suggestion-content">
          <strong class="suggestion-type">${typeLabel}</strong>
          <p class="suggestion-message">${this.escapeHtml(suggestion.message)}</p>
          <small class="suggestion-reason">${this.escapeHtml(suggestion.reason)}</small>
        </div>
      </div>
    `;

    // Add tempo guidance if present
    if (suggestion.type === 'TRY_TEMPO' && suggestion.tempoGuidance) {
      const tempo = suggestion.tempoGuidance;
      bannerHTML += `
      <div class="tempo-guidance">
        <strong>📖 How to do it:</strong>
        <p>${this.escapeHtml(tempo.instruction)}</p>
        <div class="tempo-visual">${this.escapeHtml(tempo.cue)}</div>
        <small>Why? ${this.escapeHtml(tempo.why)}</small>
      </div>
    `;
    }

    return bannerHTML;
  }

  /**
   * Get CSS urgency class for suggestion
   *
   * @param {string} urgency - Urgency level
   * @returns {string} CSS class
   */
  getSuggestionUrgencyClass(urgency) {
    const urgencyMap = {
      'critical': 'urgent',
      'high': 'warning',
      'medium': 'warning',
      'low': 'info',
      'normal': ''
    };
    return urgencyMap[urgency] || '';
  }

  /**
   * Get icon for suggestion type
   *
   * @param {string} type - Suggestion type
   * @returns {string} Icon emoji
   */
  getSuggestionIcon(type) {
    const iconMap = {
      'INCREASE_WEIGHT': '💪',
      'TRY_TEMPO': '⏱️',
      'TRY_ALTERNATIVE': '🔄',
      'IMMEDIATE_ALTERNATIVE': '⚠️',
      'REDUCE_WEIGHT': '⬇️',
      'PAIN_WARNING': '🚨',
      'PLATEAU_WARNING': '📊',
      'RECOVERY_WARNING': '💤',
      'CONTINUE': '✅'
    };
    return iconMap[type] || '💡';
  }

  /**
   * Get label for suggestion type
   *
   * @param {string} type - Suggestion type
   * @returns {string} Type label
   */
  getSuggestionTypeLabel(type) {
    const labelMap = {
      'INCREASE_WEIGHT': 'SMART SUGGESTION',
      'TRY_TEMPO': 'TEMPO PROGRESSION',
      'TRY_ALTERNATIVE': 'TRY ALTERNATIVE',
      'IMMEDIATE_ALTERNATIVE': 'SAFETY ALERT',
      'REDUCE_WEIGHT': 'WEIGHT ADJUSTMENT',
      'PAIN_WARNING': 'PAIN DETECTED',
      'PLATEAU_WARNING': 'PLATEAU DETECTED',
      'RECOVERY_WARNING': 'RECOVERY CHECK',
      'CONTINUE': 'ON TRACK'
    };
    return labelMap[type] || 'SUGGESTION';
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
    const exerciseDef = this.currentWorkout?.exercises[exerciseIndex];
    const isTimeBased = this.isTimeBasedExercise(exerciseDef);
    // For bodyweight exercises, weight can be 0
    const hasValidWeight = typeof set.weight === 'number' && set.weight >= 0;
    // Time-based exercises don't have RIR
    const hasValidRir = isTimeBased || (set.rir >= 0);
    if (hasValidWeight && set.reps > 0 && hasValidRir) {
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

    // Get exercise definition to check exercise type
    const exerciseDef = this.currentWorkout?.exercises[exerciseIndex];
    const isBodyweightExercise = this.isBodyweightExercise(exerciseDef);
    const isBand = this.isBandExercise(exerciseDef);
    const isTimeBased = this.isTimeBasedExercise(exerciseDef);

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

    // Get weight value (from band dropdown OR regular input)
    let weight;
    if (isBand) {
      const bandSelect = document.querySelector(`.band-select[data-exercise="${exerciseIndex}"][data-set="${setIndex}"]`);
      if (bandSelect && bandSelect.value !== 'custom') {
        weight = parseFloat(bandSelect.value);
      } else {
        const customInput = document.querySelector(`.band-custom-input[data-exercise="${exerciseIndex}"][data-set="${setIndex}"]`);
        weight = parseFloat(customInput?.value);
      }
    } else {
      weight = parseFloat(weightInput?.value);
    }

    const reps = parseInt(repsInput?.value);
    const rir = parseInt(rirInput?.value);

    // Validate all fields are filled with detailed error messages
    const missingFields = [];
    if (!weightInput) missingFields.push('Weight input not found');
    else if (isBodyweightExercise) {
      // Bodyweight/band exercises: weight can be 0, but must be a number
      if (isNaN(weight) || weight < 0) missingFields.push('Weight');
    } else {
      // Weighted exercises: weight must be > 0
      if (!weight || weight <= 0) missingFields.push('Weight');
    }

    if (!repsInput) missingFields.push('Reps input not found');
    else if (!reps || reps <= 0) missingFields.push('Reps');

    // Skip RIR validation for time-based exercises (Plank, Side Plank)
    if (!isTimeBased) {
      if (!rirInput) missingFields.push('RIR input not found');
      else if (rir === undefined || isNaN(rir)) missingFields.push('RIR');
    }

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
    // Only store RIR for rep-based exercises (time-based exercises don't have RIR)
    if (!isTimeBased) {
      set.rir = rir;
    }

    // Visual feedback
    button.textContent = '✓ LOGGED';
    button.disabled = true;
    button.style.background = 'var(--color-success)';

    // Trigger progression check and unlock
    this.checkSetProgression(exerciseIndex, setIndex);
    this.unlockNextSet(exerciseIndex, setIndex);
    this.checkExerciseCompletion(exerciseIndex);

    // Update performance badge in real-time
    this.updatePerformanceBadge(exerciseIndex);

    // Note: showPostSetFeedback will be implemented in Task 26
    // For now, just call it as a no-op if it doesn't exist
    if (this.showPostSetFeedback) {
      this.showPostSetFeedback(exerciseIndex, setIndex, set);
    }

    // Check for unlocks after logging set
    const exerciseName = exerciseDef?.name;
    if (exerciseName) {
      const slotKey = getSlotForExercise(exerciseName);
      if (slotKey) {
        this.checkAndShowUnlockNotification(exerciseName, slotKey);
      }
    }
  }

  showPostSetFeedback(exerciseIndex, setIndex, set) {
    const exerciseDef = this.currentWorkout.exercises[exerciseIndex];
    const sessionExercise = this.workoutSession.exercises[exerciseIndex];
    const isTimeBased = this.isTimeBasedExercise(exerciseDef);

    // Time-based exercises: Simple duration feedback
    if (isTimeBased) {
      const cleanRepRange = exerciseDef.repRange.replace(/[^\d-]/g, '');
      const [minDuration, maxDuration] = cleanRepRange.split('-').map(Number);

      let message = '';
      let colorClass = 'info';

      if (set.reps >= maxDuration) {
        message = `🟢 Great hold! ${set.reps}s completed.`;
        colorClass = 'success';
      } else if (set.reps < minDuration) {
        message = `🔴 Hold longer - aim for ${minDuration}-${maxDuration}s.`;
        colorClass = 'danger';
      } else {
        message = `🔵 Good hold - ${set.reps}s completed.`;
        colorClass = 'info';
      }

      this.displayFeedbackToast(message, colorClass);
      return;
    }

    // Rep-based exercises: Full RIR feedback
    const cleanRepRange = exerciseDef.repRange.replace(/[^\d-]/g, '');
    const [minReps, maxReps] = cleanRepRange.split('-').map(Number);

    // Defensive: should always have rirTarget for rep-based exercises
    if (!exerciseDef.rirTarget) {
      console.error('[showPostSetFeedback] Rep-based exercise missing rirTarget:', exerciseDef.name);
      return;
    }
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
    const isTimeBased = exerciseDef.repRange.toLowerCase().includes('s');

    // Parse rep/duration range
    const cleanRepRange = exerciseDef.repRange.replace(/[^\d-]/g, '');
    const [min, max] = cleanRepRange.split('-').map(Number);

    // Visual feedback on the input row
    const setRow = document.querySelector(
      `.set-input[data-exercise="${exerciseIndex}"][data-set="${setIndex}"][data-field="reps"]`
    )?.closest('.set-row');

    if (!setRow) return;

    // Remove any existing feedback
    setRow.style.borderLeft = 'none';

    // Check if set meets progression criteria
    if (isTimeBased) {
      // Time-based: just check duration
      if (set.reps >= max) {
        setRow.style.borderLeft = '4px solid var(--color-success)';
      } else if (set.reps < min) {
        setRow.style.borderLeft = '4px solid var(--color-danger)';
      } else {
        setRow.style.borderLeft = '4px solid var(--color-info)';
      }
    } else {
      // Rep-based: check reps AND RIR
      // Defensive: should always have rirTarget for rep-based exercises
      if (!exerciseDef.rirTarget) {
        console.error('[checkSetProgression] Rep-based exercise missing rirTarget:', exerciseDef.name);
        return;
      }
      const [rirMin] = exerciseDef.rirTarget.split('-').map(Number);
      if (set.reps >= max && set.rir >= rirMin) {
        setRow.style.borderLeft = '4px solid var(--color-success)';
      } else if (set.reps < min) {
        setRow.style.borderLeft = '4px solid var(--color-danger)';
      } else {
        setRow.style.borderLeft = '4px solid var(--color-info)';
      }
    }
  }

  unlockNextSet(exerciseIndex, completedSetIndex) {
    const exercise = this.currentWorkout.exercises[exerciseIndex];
    const nextSetIndex = completedSetIndex + 1;

    // Don't unlock beyond total sets
    if (nextSetIndex >= exercise.sets) return;

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

    // Enable inputs and buttons
    const inputs = nextSetRow.querySelectorAll('input, select, button');
    inputs.forEach(input => {
      input.disabled = false;
    });

    // Remove lock icon
    const lockIcon = nextSetRow.querySelector('.lock-icon');
    if (lockIcon) lockIcon.remove();

    // Pre-fill with values from completed set
    const completedSet = this.workoutSession.exercises[exerciseIndex].sets[completedSetIndex];
    const isBand = this.isBandExercise(exercise);

    // Pre-fill weight from completed set
    if (isBand) {
      // For band exercises, set dropdown value
      const bandSelect = nextSetRow.querySelector('.band-select');
      const customInput = nextSetRow.querySelector('.band-custom-input');

      if (bandSelect && customInput) {
        const isCustomWeight = ![5, 10, 15, 25].includes(completedSet.weight);

        if (isCustomWeight) {
          bandSelect.value = 'custom';
          customInput.style.display = 'block';
          customInput.value = completedSet.weight;
        } else {
          bandSelect.value = completedSet.weight.toString();
          customInput.style.display = 'none';
        }
      }
    } else {
      // For regular exercises, set input value
      const weightInput = nextSetRow.querySelector('[data-field="weight"]');
      if (weightInput && completedSet.weight) {
        weightInput.value = completedSet.weight;
      }
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

    const isTimeBased = exerciseDef.repRange.toLowerCase().includes('s');

    // Count completed sets
    // For bodyweight exercises, weight can be 0
    // For time-based exercises, RIR is optional
    const completedSets = exerciseSession.sets.filter(set => {
      const hasValidWeight = set && typeof set.weight === 'number' && set.weight >= 0;
      const hasValidReps = set.reps > 0;
      const hasValidRir = isTimeBased || (set.rir >= 0);
      return hasValidWeight && hasValidReps && hasValidRir;
    }).length;

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

  /**
   * Format exercise metadata for card header
   * @param {Object} exercise - Exercise definition
   * @returns {string} Formatted string like "3 sets × 8-12 reps @ RIR 2-3" or "3 sets × 30-60s"
   */
  formatExerciseMeta(exercise) {
    const isTimeBased = this.isTimeBasedExercise(exercise);

    if (isTimeBased) {
      // Time-based: "3 sets × 30-60s"
      return `${exercise.sets} sets × ${exercise.repRange}`;
    } else {
      // Rep-based: "3 sets × 8-12 reps @ RIR 2-3"
      const rirText = exercise.rirTarget ? ` @ RIR ${exercise.rirTarget}` : '';
      return `${exercise.sets} sets × ${exercise.repRange} reps${rirText}`;
    }
  }

  /**
   * Check if exercise uses resistance bands (for band color selector)
   * @param {Object} exercise - Exercise definition from workout
   * @returns {boolean} True if band exercise
   */
  isBandExercise(exercise) {
    return exercise?.name?.includes('Band');
  }

  /**
   * Check if exercise is bodyweight/no weight progression (Plank, Hyperextension, Dead Bug, etc.)
   * @param {Object} exercise - Exercise definition from workout
   * @returns {boolean} True if bodyweight exercise
   */
  isBodyweightExercise(exercise) {
    return exercise?.startingWeight === 0 && exercise?.weightIncrement === 0;
  }

  /**
   * Check if exercise is time-based (holds) vs rep-based (counted reps)
   * @param {Object} exercise - Exercise definition from workout
   * @returns {boolean} True if time-based (e.g., "30-60s", "30s/side")
   */
  isTimeBasedExercise(exercise) {
    if (!exercise?.repRange) return false;
    // Match patterns like "30-60s" or "30s/side" (number followed by 's')
    // Avoid matching "10-12/side" (reps per side, not time-based)
    return /\d+s\b/.test(exercise.repRange);
  }

  /**
   * Convert band color to weight value
   * @param {string} color - 'light', 'medium', 'heavy', 'x-heavy'
   * @returns {number} Weight in kg
   */
  bandColorToWeight(color) {
    const mapping = {
      'light': 5,
      'medium': 10,
      'heavy': 15,
      'x-heavy': 25
    };
    return mapping[color] || 0; // 0 = custom
  }

  /**
   * Convert weight to band color
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

  /**
   * Format set display for history (band-aware, time-aware)
   * @param {Object} set - Set object { reps, weight, rir }
   * @param {Object} exercise - Exercise definition
   * @returns {string} Formatted string like "15 reps @ 🔴 Medium", "15 reps @ 20 kg", or "45s"
   */
  formatSetDisplay(set, exercise) {
    const reps = set.reps;
    const weight = set.weight;
    const rir = set.rir;

    // Time-based exercises: just show duration
    if (this.isTimeBasedExercise(exercise)) {
      return `${reps}s`;
    }

    // Rep-based exercises: show reps, weight, and RIR
    let weightDisplay;
    if (this.isBandExercise(exercise)) {
      const bandInfo = this.weightToBandColor(weight);
      if (bandInfo.color === 'custom' && weight > 0) {
        weightDisplay = `${weight} kg`;
      } else if (bandInfo.color === 'custom') {
        weightDisplay = 'Custom';
      } else {
        weightDisplay = `${bandInfo.symbol} ${bandInfo.label}`;
      }
    } else {
      weightDisplay = `${weight} kg`;
    }

    return `${reps} reps @ ${weightDisplay}${rir !== undefined ? ` (RIR ${rir})` : ''}`;
  }

  /**
   * Set up event delegation for band color button clicks
   */
  setupBandColorButtons() {
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('band-select')) {
        const select = e.target;
        const container = select.parentElement;
        const customInput = container.querySelector('.band-custom-input');

        // Show/hide custom input based on selection
        if (select.value === 'custom') {
          customInput.style.display = 'block';
          customInput.focus();
        } else {
          customInput.style.display = 'none';
        }
      }
    });
  }

  /**
   * Calculate workout statistics
   * @param {Object} workoutData - Completed workout data
   * @returns {Object} Stats object with duration, volume, comparison
   */
  calculateWorkoutStats(workoutData) {
    const { workoutName, exercises, startTime, endTime } = workoutData;

    // Calculate duration
    const durationSeconds = Math.floor((endTime - startTime) / 1000);
    const durationFormatted = this.formatDuration(durationSeconds);

    // Calculate total volume
    let totalVolume = 0;
    exercises.forEach(exercise => {
      if (exercise.sets && Array.isArray(exercise.sets)) {
        exercise.sets.forEach(set => {
          if (set.reps && set.weight) {
            totalVolume += set.reps * set.weight;
          }
        });
      }
    });

    // Get volume comparison (compare to last time this workout was done)
    const volumeComparison = this.getVolumeComparison(workoutName, totalVolume);

    return {
      workoutName,
      displayName: workoutData.displayName || workoutName,
      duration: durationFormatted,
      durationSeconds,
      totalVolume: Math.round(totalVolume),
      volumeComparison
    };
  }

  /**
   * Format duration in seconds to friendly string
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  }

  /**
   * Get volume comparison to last workout
   * @param {string} workoutName - Name of workout
   * @param {number} currentVolume - Current total volume
   * @returns {Object|null} Comparison object or null
   */
  getVolumeComparison(workoutName, currentVolume) {
    const history = this.storage.getWorkoutHistory(workoutName, 2);
    if (history.length < 2) return null; // Need previous workout for comparison

    // Calculate previous volume (second most recent, since most recent is current)
    let previousVolume = 0;
    const previousWorkout = history[1];

    if (previousWorkout && previousWorkout.exercises) {
      previousWorkout.exercises.forEach(exercise => {
        if (exercise.sets) {
          exercise.sets.forEach(set => {
            if (set.reps && set.weight) {
              previousVolume += set.reps * set.weight;
            }
          });
        }
      });
    }

    if (previousVolume === 0) return null;

    const percentChange = ((currentVolume - previousVolume) / previousVolume) * 100;

    // Only show if >10% difference
    if (Math.abs(percentChange) < 10) return null;

    return {
      percent: Math.round(percentChange),
      direction: percentChange > 0 ? 'up' : 'down'
    };
  }

  /**
   * Detect new personal records (weight PRs and rep PRs)
   * @param {Object} workoutData - Completed workout data
   * @returns {Array} Array of PR objects
   */
  detectNewRecords(workoutData) {
    const newRecords = [];

    workoutData.exercises.forEach(exercise => {
      if (!exercise.sets || !Array.isArray(exercise.sets)) return;

      const exerciseKey = `${workoutData.workoutName} - ${exercise.name}`;
      const history = this.storage.getExerciseHistory(exerciseKey);

      // Get max weight used today
      const todayWeights = exercise.sets
        .filter(set => set.weight && set.reps)
        .map(set => set.weight);

      if (todayWeights.length === 0) return;

      const todayMaxWeight = Math.max(...todayWeights);

      // Check for weight PR
      const weightPR = this.checkWeightPR(history, todayMaxWeight);
      if (weightPR) {
        newRecords.push({
          exercise: exercise.name,
          type: 'weight',
          from: weightPR.from,
          to: weightPR.to
        });
      }

      // Check for rep PRs at each weight used today
      const repPRs = this.checkRepPRs(exercise.sets, history);
      repPRs.forEach(pr => {
        newRecords.push({
          exercise: exercise.name,
          type: 'reps',
          weight: pr.weight,
          from: pr.from,
          to: pr.to
        });
      });
    });

    return newRecords.slice(0, 5); // Max 5 records
  }

  /**
   * Check for weight PR
   * @param {Array} history - Exercise history
   * @param {number} todayMaxWeight - Max weight used today
   * @returns {Object|null} PR object or null
   */
  checkWeightPR(history, todayMaxWeight) {
    if (history.length === 0) return null; // No history = can't be a PR

    let maxWeightEver = 0;
    history.forEach(session => {
      if (session.sets) {
        session.sets.forEach(set => {
          if (set.weight && set.weight > maxWeightEver) {
            maxWeightEver = set.weight;
          }
        });
      }
    });

    if (todayMaxWeight > maxWeightEver) {
      return { from: maxWeightEver, to: todayMaxWeight };
    }

    return null;
  }

  /**
   * Check for rep PRs
   * @param {Array} todaySets - Today's sets
   * @param {Array} history - Exercise history
   * @returns {Array} Array of rep PR objects
   */
  checkRepPRs(todaySets, history) {
    const repPRs = [];

    // Get unique weights used today
    const weightsUsedToday = [...new Set(todaySets.map(set => set.weight))];

    weightsUsedToday.forEach(weight => {
      // Get max reps at this weight today
      const repsAtWeightToday = todaySets
        .filter(set => set.weight === weight && set.reps)
        .map(set => set.reps);

      if (repsAtWeightToday.length === 0) return;

      const maxRepsToday = Math.max(...repsAtWeightToday);

      // Get max reps at this weight historically
      let maxRepsEver = 0;
      history.forEach(session => {
        if (session.sets) {
          session.sets.forEach(set => {
            if (set.weight === weight && set.reps && set.reps > maxRepsEver) {
              maxRepsEver = set.reps;
            }
          });
        }
      });

      if (maxRepsToday > maxRepsEver) {
        repPRs.push({
          weight,
          from: maxRepsEver,
          to: maxRepsToday
        });
      }
    });

    return repPRs;
  }

  advanceToNextExercise() {
    // Get completed exercise info FIRST (before early return)
    const justCompletedIndex = this.currentExerciseIndex;
    const justCompletedExercise = this.currentWorkout.exercises[justCompletedIndex];
    const exerciseKey = `${this.currentWorkout.name} - ${justCompletedExercise.name}`;

    // ALWAYS show mobility check for completed exercises
    this.showMobilityCheckIfNeeded(exerciseKey);
    // Pain tracking moved to post-workout modal

    // Don't advance past last exercise (but prompts still shown above)
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

  toggleFormGuide(exerciseIndex) {
    const content = document.getElementById(`form-guide-${exerciseIndex}`);
    const toggle = document.getElementById(`form-toggle-${exerciseIndex}`);

    if (content && toggle) {
      if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '📋 Form Guide ▲';
      } else {
        content.style.display = 'none';
        toggle.textContent = '📋 Form Guide ▼';
      }
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

  showHistoryScreen(pushHistory = true) {
    this.hideAllScreens();
    const historyScreen = document.getElementById('history-screen');
    if (historyScreen) {
      historyScreen.classList.add('active');
      this.historyListScreen.render();
    }

    // Push to browser history
    if (pushHistory) {
      window.history.pushState({ screen: 'history' }, '', '');
    }
  }

  showExerciseDetail(exerciseKey, pushHistory = true) {
    this.hideAllScreens();
    const detailScreen = document.getElementById('exercise-detail-screen');
    if (detailScreen) {
      detailScreen.classList.add('active');
      this.exerciseDetailScreen.render(exerciseKey);
    }

    // Push to browser history
    if (pushHistory) {
      window.history.pushState(
        { screen: 'exercise-detail', data: { exerciseKey } },
        '',
        ''
      );
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
    console.log('[ROLLBACK DEBUG] Starting rollback check for:', deletedExerciseKey);
    const rotation = this.storage.getRotation();

    // Step 1: Check if deleted entry was from the most recent completed workout
    if (!rotation.lastDate) {
      console.log('[ROLLBACK DEBUG] Early exit: No lastDate in rotation');
      return;
    }

    const deletedDateObj = new Date(deletedDate);
    const lastWorkoutDateObj = new Date(rotation.lastDate);
    console.log('[ROLLBACK DEBUG] Deleted date:', deletedDateObj.toDateString());
    console.log('[ROLLBACK DEBUG] Last workout date:', lastWorkoutDateObj.toDateString());

    // Compare dates (same day)
    if (deletedDateObj.toDateString() !== lastWorkoutDateObj.toDateString()) {
      console.log('[ROLLBACK DEBUG] Early exit: Date mismatch (deleted from older workout)');
      return; // Deleted entry is from an older workout, don't roll back
    }

    // Step 2: Determine which workout this exercise belonged to
    const workoutName = deletedExerciseKey.split(' - ')[0]; // e.g., "UPPER_A"
    console.log('[ROLLBACK DEBUG] Workout name:', workoutName);
    const workout = getWorkout(workoutName);

    if (!workout) {
      console.log('[ROLLBACK DEBUG] Early exit: Workout not found');
      return;
    }

    // Step 3: Check if ANY exercises from that workout still have history for that date
    console.log('[ROLLBACK DEBUG] Checking for remaining exercises from this workout...');
    const hasRemainingExercises = workout.exercises.some(exercise => {
      const key = `${workoutName} - ${exercise.name}`;
      const history = this.storage.getExerciseHistory(key);
      const hasMatch = history.some(h =>
        new Date(h.date).toDateString() === deletedDateObj.toDateString()
      );
      if (hasMatch) {
        console.log('[ROLLBACK DEBUG] Found remaining exercise:', exercise.name);
      }
      return hasMatch;
    });

    if (hasRemainingExercises) {
      console.log('[ROLLBACK DEBUG] Early exit: Other exercises from this session still exist');
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
      this.showHomeScreen();
    }
  }

  showSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const fileInput = document.getElementById('import-file-input');

    if (modal) {
      modal.style.display = 'flex';
    }

    // Push modal state to history
    window.history.pushState({ screen: 'modal' }, '', '');

    // Attach handlers
    const closeBtn = document.getElementById('settings-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        this.closeSettingsModal();
        window.history.back(); // Go back in history when closing via button
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

    // Reset buttons
    const resetRotationBtn = document.getElementById('reset-rotation-btn');
    if (resetRotationBtn) {
      resetRotationBtn.onclick = () => this.handleResetRotation();
    }

    const resetHistoryBtn = document.getElementById('reset-history-btn');
    if (resetHistoryBtn) {
      resetHistoryBtn.onclick = () => this.handleResetHistory();
    }

    const resetAllBtn = document.getElementById('reset-all-btn');
    if (resetAllBtn) {
      resetAllBtn.onclick = () => this.handleResetAll();
    }
  }

  closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const fileInput = document.getElementById('import-file-input');

    if (modal) {
      modal.style.display = 'none';
    }

    // Reset file input when closing modal
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Show exercise progressions browser
   */
  showProgressionsBrowser() {
    const modal = document.getElementById('progressions-modal');
    const closeBtn = document.getElementById('close-progressions-modal');
    const tabs = document.querySelectorAll('.prog-tab');
    const listContainer = document.getElementById('progressions-list');

    // Show modal
    modal.style.display = 'flex';

    // Close handler
    closeBtn.onclick = () => {
      modal.style.display = 'none';
    };

    // Tab click handlers
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Render progression list for selected workout
        const workout = tab.dataset.workout;
        this.renderProgressionsList(workout, listContainer);
      });
    });

    // Render initial list (Upper A)
    this.renderProgressionsList('UPPER_A', listContainer);
  }

  /**
   * Render progressions list for a workout
   *
   * @param {string} workoutKey - Workout key (e.g., 'UPPER_A')
   * @param {HTMLElement} container - Container element
   */
  renderProgressionsList(workoutKey, container) {
    container.innerHTML = '';

    // Get all slots for this workout
    const slots = Object.keys(PROGRESSION_PATHS).filter(key => key.startsWith(workoutKey));
    const currentSelections = this.storage.getExerciseSelections();

    slots.forEach(slotKey => {
      const path = getProgressionPath(slotKey);
      if (!path) return;

      // Create slot container
      const slotDiv = document.createElement('div');
      slotDiv.className = 'progression-slot';

      // Slot header
      const headerDiv = document.createElement('div');
      headerDiv.className = 'slot-header';
      headerDiv.innerHTML = `
        <span class="slot-name">${path.slotName}</span>
        <span class="current-badge">Current: ${currentSelections[slotKey] || path.current}</span>
      `;
      slotDiv.appendChild(headerDiv);

      // Progression options
      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'progression-options';

      // Easier options
      if (path.easier && path.easier.length > 0) {
        const category = this.renderProgressionCategory('Easier', path.easier, slotKey);
        optionsDiv.appendChild(category);
      }

      // Harder options
      if (path.harder && path.harder.length > 0) {
        const category = this.renderProgressionCategory('Harder', path.harder, slotKey);
        optionsDiv.appendChild(category);
      }

      // Alternate options
      if (path.alternate && path.alternate.length > 0) {
        const category = this.renderProgressionCategory('Alternate', path.alternate, slotKey);
        optionsDiv.appendChild(category);
      }

      slotDiv.appendChild(optionsDiv);
      container.appendChild(slotDiv);
    });
  }

  /**
   * Render progression category
   *
   * @param {string} categoryName - Category name (Easier/Harder/Alternate)
   * @param {string[]} exercises - Exercise names
   * @param {string} slotKey - Slot key
   * @returns {HTMLElement} Category element
   */
  renderProgressionCategory(categoryName, exercises, slotKey) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'progression-category';

    const label = document.createElement('div');
    label.className = 'category-label';
    label.textContent = categoryName;
    categoryDiv.appendChild(label);

    exercises.forEach(exerciseName => {
      const optionDiv = document.createElement('div');
      const unlocked = this.storage.isExerciseUnlocked(exerciseName) ||
                       getComplexityTier(exerciseName) === COMPLEXITY_TIERS.SIMPLE;

      optionDiv.className = `exercise-option ${unlocked ? '' : 'locked'}`;
      optionDiv.innerHTML = `
        <span class="exercise-name">${exerciseName}</span>
        <div class="exercise-status">
          <span class="status-badge ${unlocked ? 'unlocked' : 'locked'}">
            ${unlocked ? '✓ Unlocked' : '🔒 Locked'}
          </span>
          <button class="select-exercise-btn" ${unlocked ? '' : 'disabled'}>
            Select
          </button>
        </div>
      `;

      // Select button handler
      const selectBtn = optionDiv.querySelector('.select-exercise-btn');
      if (selectBtn && unlocked) {
        selectBtn.onclick = () => {
          this.storage.saveExerciseSelection(slotKey, exerciseName);
          document.getElementById('progressions-modal').style.display = 'none';
          this.showHomeScreen(); // Refresh
        };
      }

      categoryDiv.appendChild(optionDiv);
    });

    return categoryDiv;
  }

  /**
   * Show weigh-in modal
   */
  showWeighInModal() {
    const modal = document.getElementById('weighin-modal');
    if (!modal) return;

    modal.style.display = 'flex';

    // Initialize BodyWeightManager
    const bodyWeight = new BodyWeightManager(this.storage);

    // Set smart default value (last entry or reasonable default)
    const input = document.getElementById('weight-input');
    if (input) {
      const data = bodyWeight.getData();
      const lastWeight = data.entries.length > 0
        ? data.entries[data.entries.length - 1].weight_kg
        : 57.5;
      input.value = lastWeight;
      input.select(); // Select text so user can type to replace
    }

    // Log weight button
    const logBtn = document.getElementById('log-weight-btn');
    if (logBtn) {
      logBtn.onclick = () => {
        const weight = parseFloat(input.value);
        console.log('[WeighIn] Attempting to log weight:', weight);

        if (!weight || weight < 30 || weight > 200) {
          alert('Please enter a valid weight between 30-200 kg');
          return;
        }

        const result = bodyWeight.addEntry(weight);
        console.log('[WeighIn] Weight saved, data:', bodyWeight.getData());
        modal.style.display = 'none';

        // Show feedback message
        if (result.replaced) {
          alert(`✅ Updated today's weight to ${weight} kg\n\n(Only one entry per day is kept)`);
        } else {
          alert(`✅ Weight logged: ${weight} kg`);
        }

        // Refresh dashboard to show new data
        this.showProgressDashboard(false);
      };
    }

    // Skip button
    const skipBtn = document.getElementById('skip-weighin-btn');
    if (skipBtn) {
      skipBtn.onclick = () => {
        modal.style.display = 'none';
      };
    }

    // Add history state for browser back button
    if (window.history.state?.screen !== 'weighin') {
      window.history.pushState({ screen: 'weighin' }, '', '');
    }
  }

  handleResetRotation() {
    const confirmed = confirm(
      '🔄 Reset Rotation State?\n\n' +
      'This will:\n' +
      '• Reset workout progression to Upper A\n' +
      '• Clear your current streak\n' +
      '• Reset cycle count\n\n' +
      '✅ Keep all exercise history\n\n' +
      'Continue?'
    );

    if (!confirmed) return;

    // Reset rotation to initial state
    this.storage.saveRotation({
      nextSuggested: 'UPPER_A',
      currentStreak: 0,
      lastDate: null,
      sequence: [],
      cycleCount: 0
    });

    alert('✅ Rotation reset successfully!\n\nYour workout history is preserved.');

    // Close modal and refresh home screen
    this.closeSettingsModal();
    window.history.back(); // Go back in history
    this.showHomeScreen();
  }

  handleResetHistory() {
    const confirmed = confirm(
      '🗑️ Clear All Exercise History?\n\n' +
      'This will:\n' +
      '• Delete all workout logs\n' +
      '• Remove all exercise history\n\n' +
      '✅ Keep current rotation state\n\n' +
      '⚠️ THIS CANNOT BE UNDONE!\n\n' +
      'Continue?'
    );

    if (!confirmed) return;

    // Double confirmation for destructive action
    const doubleConfirm = confirm(
      'Are you absolutely sure?\n\n' +
      'All your workout history will be permanently deleted.'
    );

    if (!doubleConfirm) return;

    // Clear all exercise history
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith('build_exercise_'));
    allKeys.forEach(key => localStorage.removeItem(key));

    alert('✅ Exercise history cleared!\n\nYour rotation state is preserved.');

    // Close modal and refresh home screen
    this.closeSettingsModal();
    window.history.back(); // Go back in history
    this.showHomeScreen();
  }

  handleResetAll() {
    const confirmed = confirm(
      '⚠️ Reset Everything?\n\n' +
      'This will:\n' +
      '• Delete all workout logs\n' +
      '• Reset all progression\n' +
      '• Clear deload state\n' +
      '• Reset to factory defaults\n\n' +
      '⚠️ THIS CANNOT BE UNDONE!\n\n' +
      'Continue?'
    );

    if (!confirmed) return;

    // Double confirmation for destructive action
    const doubleConfirm = confirm(
      'Are you absolutely sure?\n\n' +
      'The entire app will be reset to initial state.'
    );

    if (!doubleConfirm) return;

    // Clear all app data
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith('build_'));
    allKeys.forEach(key => localStorage.removeItem(key));

    alert('✅ App reset complete!\n\nReloading...');

    // Reload the page to reinitialize everything
    location.reload();
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
      this.closeSettingsModal();
      window.history.back(); // Go back in history

      this.showHomeScreen();

    } catch (error) {
      console.error('Import failed:', error);
      alert(`❌ Import failed: ${error.message}`);
    } finally {
      // Reset file input
      event.target.value = '';
    }
  }

  showMobilityCheckIfNeeded(exerciseKey) {
    // Configuration for mobility checks
    const mobilityChecks = {
      'UPPER_B - DB Shoulder Press': {
        criteriaKey: 'bench_overhead_mobility',
        question: 'Could you press overhead without back arching today?',
        help: 'Ribs should stay down, no excessive lower back arch'
      },
      'LOWER_B - DB Goblet Squat': {
        criteriaKey: 'squat_heel_flat',
        question: 'Did you keep heels flat during squats today?',
        help: 'No heel lift off ground during descent'
      },
      'LOWER_B - DB Romanian Deadlift': {
        criteriaKey: 'deadlift_toe_touch',
        question: 'Could you touch your toes during warm-up today?',
        help: 'Stand with legs straight, bend forward - can fingertips reach toes?'
      }
    };

    const checkConfig = mobilityChecks[exerciseKey];
    if (!checkConfig) return; // No mobility check for this exercise

    // Check if already prompted today
    const checks = this.storage.getMobilityChecks(checkConfig.criteriaKey);
    const today = new Date().toISOString().split('T')[0];
    if (checks.some(c => c.date === today)) {
      return; // Already checked today
    }

    // Show prompt UI
    this.showMobilityPrompt(checkConfig);
  }

  showMobilityPrompt(checkConfig) {
    const modal = document.getElementById('mobility-check-modal');
    const questionEl = document.getElementById('mobility-question');
    const helpEl = document.getElementById('mobility-help');
    const progressEl = document.getElementById('mobility-progress');
    const recentEl = document.getElementById('mobility-recent');

    // Set content
    questionEl.textContent = checkConfig.question;
    helpEl.textContent = checkConfig.help;

    // Show progress
    const checks = this.storage.getMobilityChecks(checkConfig.criteriaKey);
    let consecutiveYes = 0;
    for (let i = checks.length - 1; i >= 0 && i >= checks.length - 5; i--) {
      if (checks[i].response === 'yes') consecutiveYes++;
      else break;
    }
    progressEl.textContent = `Progress: ${consecutiveYes}/5 confirmations`;

    // Show recent checks
    const recent = checks.slice(-5);
    const icons = recent.map(c =>
      c.response === 'yes' ? '✓' : c.response === 'no' ? '✗' : '?'
    );
    recentEl.textContent = `Recent: ${icons.join('')}`;

    // Show modal
    modal.style.display = 'flex';

    // Button handlers
    document.getElementById('mobility-yes').onclick = () => {
      this.storage.saveMobilityCheck(checkConfig.criteriaKey, 'yes');
      modal.style.display = 'none';
    };
    document.getElementById('mobility-no').onclick = () => {
      this.storage.saveMobilityCheck(checkConfig.criteriaKey, 'no');
      modal.style.display = 'none';
    };
    document.getElementById('mobility-not-sure').onclick = () => {
      this.storage.saveMobilityCheck(checkConfig.criteriaKey, 'not_sure');
      modal.style.display = 'none';
    };
  }

  /* DEPRECATED: Pain tracking now happens post-workout
  showPainTrackingPrompt(exerciseKey, exerciseName) {
    const modal = document.getElementById('pain-tracking-modal');
    const titleEl = document.getElementById('pain-exercise-title');
    const locationSection = document.getElementById('pain-location-section');
    const historyEl = document.getElementById('pain-history');

    // Set title
    titleEl.textContent = `${exerciseName} Complete`;

    // Show recent pain history
    const history = this.storage.getPainHistory(exerciseKey);
    const recent = history.slice(-5);
    const icons = recent.map(p => p.hadPain ? '⚠️' : '✓');
    const painCount = recent.filter(p => p.hadPain).length;

    if (painCount === 0) {
      historyEl.textContent = `Recent history: ${icons.join('')} (pain-free)`;
      historyEl.style.color = '#4caf50';
    } else {
      historyEl.textContent = `Recent history: ${icons.join('')} (${painCount} painful sessions)`;
      historyEl.style.color = '#ff9800';
    }

    // Initially hide location section
    locationSection.style.display = 'none';

    // Show modal
    modal.style.display = 'flex';

    // "No pain" button
    document.getElementById('pain-no').onclick = () => {
      this.storage.savePainReport(exerciseKey, false, null, null);
      modal.style.display = 'none';
    };

    // "Yes, minor" button
    document.getElementById('pain-minor').onclick = () => {
      locationSection.style.display = 'block';
      this.setupLocationSelection(exerciseKey, 'minor', modal);
    };

    // "Yes, significant" button
    document.getElementById('pain-significant').onclick = () => {
      locationSection.style.display = 'block';
      this.setupLocationSelection(exerciseKey, 'significant', modal);
    };
  }

  setupLocationSelection(exerciseKey, severity, modal) {
    const locationButtons = document.querySelectorAll('.pain-location-btn');

    locationButtons.forEach(btn => {
      btn.onclick = () => {
        const location = btn.dataset.location;
        this.storage.savePainReport(exerciseKey, true, location, severity);
        modal.style.display = 'none';
      };
    });
  }
  */

  /**
   * Render warm-up protocol section
   *
   * @param {string} workoutKey - Workout key
   * @returns {string} HTML for warm-up section
   */
  renderWarmupProtocol(workoutKey) {
    const equipmentProfile = this.storage.getEquipmentProfile();
    const protocol = getWarmupProtocol(workoutKey, equipmentProfile);

    return `
      <div class="warmup-section">
        <h3>🔥 Warm-Up (${protocol.estimatedDuration})</h3>
        <div class="warmup-exercises">
          ${protocol.exercises.map((ex, index) => `
            <div class="warmup-exercise">
              <span class="warmup-number">${index + 1}.</span>
              <div class="warmup-details">
                <div class="warmup-name">${this.escapeHtml(ex.name)}</div>
                <div class="warmup-meta">
                  ${this.escapeHtml(ex.duration || ex.reps)}
                  ${ex.note ? `<span class="warmup-note">(${this.escapeHtml(ex.note)})</span>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="warmup-sets-info">
          <h4>Warm-up Sets (First Exercise Only)</h4>
          <p>Complete 3 progressive sets before working sets:</p>
          <ul>
            <li>Set 1: 50% weight × 8 reps (45-60s rest)</li>
            <li>Set 2: 70% weight × 3-4 reps (45-60s rest)</li>
            <li>Set 3: 90% weight × 1 rep (2 min rest)</li>
          </ul>
        </div>
      </div>
    `;
  }

  showProgressDashboard(pushHistory = true) {
    console.log('[Dashboard] showProgressDashboard called');
    try {
      this.hideAllScreens();
      const progressScreen = document.getElementById('progress-screen');
      if (progressScreen) {
        progressScreen.classList.add('active');
      }

      // Initialize modules
      const progressAnalyzer = new ProgressAnalyzer(this.storage);

      // Get data for overview
      const stats = progressAnalyzer.getLast4WeeksStats();
      const strengthGains = progressAnalyzer.getTopProgressingExercises(3);

    // Render overview tab (summary stats and strength gains only)
    const progressContent = document.getElementById('progress-content');
    if (progressContent) {
      progressContent.innerHTML = `
        ${this.renderAchievementsGallery()}
        ${this.renderSummaryStats(stats)}
        ${this.renderStrengthGains(strengthGains)}
        ${this.renderWorkoutReference()}
      `;
    }

    // Attach back button
    const progressBackBtn = document.getElementById('progress-back-btn');
    if (progressBackBtn) {
      progressBackBtn.onclick = () => this.showHomeScreen();
    }

    // Attach settings button
    const progressSettingsBtn = document.getElementById('progress-settings-btn');
    if (progressSettingsBtn) {
      progressSettingsBtn.onclick = () => this.showSettingsModal();
    }

    // Attach Log Weigh-In button (if shown in empty state)
    const logWeighinBtn = document.getElementById('log-weighin-btn');
    if (logWeighinBtn) {
      logWeighinBtn.onclick = () => this.showWeighInModal();
    }

    // Add to browser history
    if (pushHistory && window.history.state?.screen !== 'progress') {
      window.history.pushState({ screen: 'progress' }, '', '');
    }

    // Setup tab navigation
    this.setupProgressTabs();
    } catch (error) {
      console.error('[Dashboard] Error rendering progress dashboard:', error);
      const progressContent = document.getElementById('progress-content');
      if (progressContent) {
        progressContent.innerHTML = `
          <div style="padding: 20px; text-align: center; color: var(--color-danger);">
            <h3>Error Loading Dashboard</h3>
            <p>There was an error loading the progress dashboard. Please check the console for details.</p>
            <p style="font-size: 14px; margin-top: 10px;">Error: ${error.message}</p>
          </div>
        `;
      }
    }
  }

  renderProgressionCard(name, readiness) {
    const { percentage, strengthMet, weeksMet, mobilityMet, painFree, blockers, strengthProgress, weeksProgress, mobilityProgress } = readiness;

    // Calculate progress bar width
    const barWidth = percentage;

    // Determine next step or blocker
    const nextStep = blockers.length > 0
      ? `Next: ${blockers[0]}`
      : '🎉 Ready for barbell transition!';

    return `
      <div class="progression-card">
        <h4 class="progression-title">─── ${this.escapeHtml(name)} ───</h4>
        <div class="progression-percentage">Progress: ${percentage}%</div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${barWidth}%"></div>
        </div>

        <div class="criteria-list">
          ${this.renderCriterion('Strength', strengthMet, strengthProgress)}
          ${this.renderCriterion('Training weeks', weeksMet, weeksProgress)}
          ${this.renderCriterion('Mobility', mobilityMet, mobilityProgress)}
          ${this.renderCriterion('Pain-free', painFree, 100)}
        </div>

        <div class="next-step">${this.escapeHtml(nextStep)}</div>
      </div>
    `;
  }

  setupProgressTabs() {
    const tabContainer = document.querySelector('.progress-tabs');
    if (!tabContainer) return;

    // Remove old listener if it exists (cleanup)
    if (this.progressTabHandler) {
      tabContainer.removeEventListener('click', this.progressTabHandler);
    }

    // Store handler for cleanup
    this.progressTabHandler = (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;

      const tab = btn.dataset.tab;
      const tabBtns = document.querySelectorAll('.progress-tabs .tab-btn');
      const tabContents = document.querySelectorAll('.tab-content');

      // Update active button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show correct content
      tabContents.forEach(content => {
        content.style.display = 'none';
      });

      if (tab === 'analytics') {
        this.showAnalyticsTab();
      } else if (tab === 'overview') {
        const overviewTab = document.querySelector('.overview-tab');
        if (overviewTab) overviewTab.style.display = 'block';
      } else if (tab === 'body-weight') {
        this.showBodyWeightTab();
      } else if (tab === 'barbell') {
        this.showBarbellTab();
      }
    };

    tabContainer.addEventListener('click', this.progressTabHandler);
  }

  showAnalyticsTab() {
    const analyticsTab = document.getElementById('analytics-tab');
    if (analyticsTab) {
      analyticsTab.style.display = 'block';
    }

    const analyticsContent = document.getElementById('analytics-content');
    if (!analyticsContent) return;

    // Check for minimum data requirement
    const rotation = this.storage.getRotation();
    const workoutCount = rotation?.sequence?.filter(w => w.completed).length || 0;

    if (workoutCount < 4) {
      analyticsContent.innerHTML = `
        <div class="empty-state">
          <h3>📊 Analytics</h3>
          <p>Complete 4+ workouts to unlock analytics and pattern detection.</p>
          <p><strong>Current progress:</strong> ${workoutCount}/4 workouts</p>
        </div>
      `;
      return;
    }

    // Calculate analytics
    const volume = this.analyticsCalculator.calculateVolume(7);
    const performance = this.analyticsCalculator.calculatePerformanceMetrics(28);
    const recovery = this.analyticsCalculator.calculateRecoveryTrends(28);
    const patterns = this.analyticsCalculator.detectPatterns();

    // Render sections
    analyticsContent.innerHTML = `
      ${this.renderVolumeSection(volume)}
      ${this.renderPerformanceSection(performance)}
      ${this.renderRecoverySection(recovery)}
      ${this.renderPatternsSection(patterns)}
    `;
  }

  renderVolumeSection(volume) {
    const trendIcon = volume.trend > 10 ? '↑' :
                      volume.trend < -10 ? '↓' : '↔';
    const trendClass = volume.trend > 10 ? 'trend-up' :
                       volume.trend < -10 ? 'trend-down' : 'trend-stable';

    const workoutTypeRows = Object.entries(volume.byWorkoutType)
      .map(([type, data]) => `
        <div class="volume-row">
          <span>${this.escapeHtml(type)}:</span>
          <span>${data.volume.toLocaleString()} kg (${data.sessions} sessions)</span>
        </div>
      `).join('');

    return `
      <div class="analytics-section">
        <h3>📊 Training Volume (Last 7 Days)</h3>
        <div class="analytics-card">
          <div class="metric-primary">
            <span class="metric-label">Total:</span>
            <span class="metric-value">${volume.total.toLocaleString()} kg</span>
            <span class="metric-trend ${trendClass}">
              ${trendIcon} ${Math.abs(volume.trend).toFixed(0)}% vs last week
            </span>
          </div>
          ${workoutTypeRows.length > 0 ? `
            <div class="volume-breakdown">
              <strong>By Workout Type:</strong>
              ${workoutTypeRows}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderPerformanceSection(performance) {
    const rirTrend = performance.avgRIR > 2.5 ? '(easier)' :
                     performance.avgRIR < 2 ? '(harder)' : '(stable)';

    const topProgressorsList = performance.topProgressors
      .map(p => `<li>${this.escapeHtml(p.name)} (+${p.gain}kg)</li>`)
      .join('');

    return `
      <div class="analytics-section">
        <h3>🎯 Performance Quality (4 Weeks)</h3>
        <div class="analytics-card">
          <div class="metrics-grid">
            <div class="metric">
              <span class="metric-label">Avg RIR:</span>
              <span class="metric-value">${performance.avgRIR.toFixed(1)} ${rirTrend}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Compliance:</span>
              <span class="metric-value">${performance.compliance.toFixed(0)}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Exercises Progressed:</span>
              <span class="metric-value">${performance.progressedCount}</span>
            </div>
          </div>
          ${performance.topProgressors.length > 0 ? `
            <div class="top-progressors">
              <strong>Top Progressors:</strong>
              <ul>${topProgressorsList}</ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderRecoverySection(recovery) {
    if (recovery.avgSleep === 0 && recovery.avgFatigue === 0) {
      return `
        <div class="analytics-section">
          <h3>💤 Recovery Trends (4 Weeks)</h3>
          <div class="analytics-card">
            <p class="empty-state-text">No recovery data available. Start tracking sleep and fatigue before workouts.</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="analytics-section">
        <h3>💤 Recovery Trends (4 Weeks)</h3>
        <div class="analytics-card">
          <div class="metrics-grid">
            <div class="metric">
              <span class="metric-label">Avg Sleep:</span>
              <span class="metric-value">${recovery.avgSleep.toFixed(1)} hrs</span>
            </div>
            <div class="metric">
              <span class="metric-label">Avg Fatigue:</span>
              <span class="metric-value">${recovery.avgFatigue.toFixed(1)}/9</span>
            </div>
            <div class="metric">
              <span class="metric-label">High Fatigue Days:</span>
              <span class="metric-value">${recovery.highFatigueDays} (≥4 points)</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderPatternsSection(patterns) {
    if (patterns.length === 0) {
      return `
        <div class="analytics-section">
          <h3>🔍 Discovered Patterns</h3>
          <div class="analytics-card">
            <p class="empty-state-text">Not enough data to detect patterns yet. Keep training!</p>
          </div>
        </div>
      `;
    }

    if (patterns[0].type === 'insufficient-data') {
      return `
        <div class="analytics-section">
          <h3>🔍 Discovered Patterns</h3>
          <div class="analytics-card">
            <p class="empty-state-text">${this.escapeHtml(patterns[0].message)}</p>
          </div>
        </div>
      `;
    }

    const patternCards = patterns.map(pattern => {
      const confidenceIcon = pattern.confidence >= 80 ? '🟢' :
                            pattern.confidence >= 60 ? '🟡' : '🔵';
      const confidenceLabel = pattern.confidence >= 80 ? 'Strong' :
                             pattern.confidence >= 60 ? 'Moderate' : 'Weak';

      return `
        <div class="pattern-card">
          <div class="pattern-header">
            ${confidenceIcon} <strong>${confidenceLabel} pattern</strong>
            <span class="confidence-score">(confidence: ${pattern.confidence}%)</span>
          </div>
          <p class="pattern-message">${this.escapeHtml(pattern.message)}</p>
        </div>
      `;
    }).join('');

    return `
      <div class="analytics-section">
        <h3>🔍 Discovered Patterns</h3>
        <div class="analytics-card">
          ${patternCards}
        </div>
      </div>
    `;
  }

  showBodyWeightTab() {
    const bodyWeightTab = document.querySelector('.body-weight-tab');
    if (bodyWeightTab) {
      bodyWeightTab.style.display = 'block';
    }

    // Get body weight data
    const bodyWeight = new BodyWeightManager(this.storage);
    const weightData = bodyWeight.getWeightSummary();

    // Render body weight content
    bodyWeightTab.innerHTML = `
      ${this.renderBodyComposition(weightData)}
      ${this.renderWeightChart(weightData)}
    `;

    // Render Canvas chart if weight data exists
    if (weightData && weightData.entries) {
      const chartContainer = document.getElementById('weight-chart-container');
      if (chartContainer) {
        const chart = new WeightTrendChart(350, 200);
        const canvas = chart.render(weightData.entries);
        if (canvas) {
          chartContainer.innerHTML = '';
          chartContainer.appendChild(canvas);
        }
      }
    }

    // Attach Log Weigh-In button (if shown in empty state)
    const logWeighinBtn = document.getElementById('log-weighin-btn');
    if (logWeighinBtn) {
      logWeighinBtn.onclick = () => this.showWeighInModal();
    }
  }

  showBarbellTab() {
    const barbellTab = document.querySelector('.barbell-tab');
    if (barbellTab) {
      barbellTab.style.display = 'block';
    }

    // Get barbell progression data
    const tracker = new BarbellProgressionTracker(this.storage);
    const benchReadiness = tracker.getBarbellBenchReadiness();
    const squatReadiness = tracker.getBarbellSquatReadiness();
    const deadliftReadiness = tracker.getBarbellDeadliftReadiness();

    // Render barbell progression content
    barbellTab.innerHTML = `
      <div class="progress-dashboard">
        <h3 class="dashboard-title">🎯 Equipment Progression Milestones</h3>
        ${this.renderProgressionCard('Barbell Bench Press', benchReadiness)}
        ${this.renderProgressionCard('Barbell Back Squat', squatReadiness)}
        ${this.renderProgressionCard('Barbell Deadlift', deadliftReadiness)}
      </div>
    `;
  }

  showPostWorkoutPainModal() {
    const modal = document.getElementById('post-workout-pain-modal');
    const initialCheck = document.getElementById('pain-initial-check');
    const exerciseSelection = document.getElementById('pain-exercise-selection');
    const painDetails = document.getElementById('pain-details');

    // Reset to initial state
    initialCheck.style.display = 'block';
    exerciseSelection.style.display = 'none';
    painDetails.style.display = 'none';

    // Show modal
    modal.style.display = 'flex';

    // State tracking
    let painfulExercises = [];
    let currentPainIndex = 0;

    // "No Pain" button
    document.getElementById('pain-no-btn').onclick = () => {
      // Save pain-free status for all exercises
      this.currentWorkout.exercises.forEach((exercise) => {
        const exerciseKey = `${this.currentWorkout.name} - ${exercise.name}`;
        this.storage.savePainReport(exerciseKey, false, null, null);
      });

      modal.style.display = 'none';

      // Proceed to weigh-in
      this.checkWeighInPrompt();
    };

    // "Yes, I had pain" button
    document.getElementById('pain-yes-btn').onclick = () => {
      initialCheck.style.display = 'none';
      exerciseSelection.style.display = 'block';

      // Populate exercise checkboxes
      const exerciseList = document.getElementById('pain-exercise-list');
      exerciseList.innerHTML = '';

      this.currentWorkout.exercises.forEach((exercise, index) => {
        const exerciseKey = `${this.currentWorkout.name} - ${exercise.name}`;
        const item = document.createElement('div');
        item.className = 'pain-exercise-checkbox-item';
        item.innerHTML = `
          <input type="checkbox" id="pain-ex-${index}" value="${exerciseKey}">
          <label for="pain-ex-${index}">${this.escapeHtml(exercise.name)}</label>
        `;

        // Toggle selected class on click
        item.onclick = (e) => {
          if (e.target.tagName !== 'INPUT') {
            const checkbox = item.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
          }
          item.classList.toggle('selected', item.querySelector('input').checked);
        };

        exerciseList.appendChild(item);
      });
    };

    // "Next" button (after selecting exercises)
    document.getElementById('pain-selection-next-btn').onclick = () => {
      // Collect checked exercises
      const checkboxes = document.querySelectorAll('#pain-exercise-list input[type="checkbox"]:checked');
      painfulExercises = Array.from(checkboxes).map(cb => ({
        key: cb.value,
        name: cb.nextElementSibling.textContent
      }));

      if (painfulExercises.length === 0) {
        alert('Please select at least one exercise, or click "No Pain" if you had no pain.');
        return;
      }

      // Start pain details flow
      currentPainIndex = 0;
      this.showPainDetailsForExercise(painfulExercises, currentPainIndex, modal);
    };
  }

  showPainDetailsForExercise(painfulExercises, index, modal) {
    if (index >= painfulExercises.length) {
      // All done, save pain-free status for non-painful exercises
      this.currentWorkout.exercises.forEach((exercise) => {
        const exerciseKey = `${this.currentWorkout.name} - ${exercise.name}`;
        const isPainful = painfulExercises.some(p => p.key === exerciseKey);
        if (!isPainful) {
          this.storage.savePainReport(exerciseKey, false, null, null);
        }
      });

      modal.style.display = 'none';
      this.checkWeighInPrompt();
      return;
    }

    const exerciseSelection = document.getElementById('pain-exercise-selection');
    const painDetails = document.getElementById('pain-details');
    const exerciseName = document.getElementById('pain-detail-exercise-name');
    const progress = document.getElementById('pain-detail-progress');

    // Hide selection, show details
    exerciseSelection.style.display = 'none';
    painDetails.style.display = 'block';

    // Set exercise name and progress
    exerciseName.textContent = painfulExercises[index].name;
    progress.textContent = `Exercise ${index + 1} of ${painfulExercises.length}`;

    // Severity buttons
    const severityBtns = document.querySelectorAll('.pain-severity-btn');
    let selectedSeverity = null;

    severityBtns.forEach(btn => {
      btn.onclick = () => {
        selectedSeverity = btn.dataset.severity;
        severityBtns.forEach(b => b.classList.remove('btn-primary'));
        severityBtns.forEach(b => b.classList.add('btn-secondary'));
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
      };
    });

    // Location buttons
    const locationBtns = document.querySelectorAll('.pain-location-btn');
    locationBtns.forEach(btn => {
      btn.onclick = () => {
        if (!selectedSeverity) {
          alert('Please select pain severity first');
          return;
        }

        const location = btn.dataset.location;
        const exerciseKey = painfulExercises[index].key;

        // Save pain report
        this.storage.savePainReport(exerciseKey, true, location, selectedSeverity);

        // Reset severity selection for next exercise
        severityBtns.forEach(b => b.classList.remove('btn-primary'));
        severityBtns.forEach(b => b.classList.add('btn-secondary'));

        // Move to next exercise
        this.showPainDetailsForExercise(painfulExercises, index + 1, modal);
      };
    });
  }

  checkWeighInPrompt() {
    // Initialize BodyWeightManager if not already done
    if (!this.bodyWeight) {
      this.bodyWeight = new BodyWeightManager(this.storage);
    }

    // Check if weigh-in is due
    if (this.bodyWeight.isWeighInDue()) {
      this.showWeighInModal();
    } else {
      // Go back to home screen
      this.showHomeScreen();
    }
  }

  renderCriterion(name, met, progress) {
    const icon = met ? '✅' : progress > 0 ? '⏳' : '❌';
    const status = met ? 'met' : progress > 0 ? 'progress' : 'not-started';

    return `
      <div class="criterion criterion-${status}">
        <span class="criterion-icon">${icon}</span>
        <span class="criterion-text">${this.escapeHtml(name)}</span>
      </div>
    `;
  }

  /**
   * Render 4-week summary statistics card
   * @param {Object} stats - Stats from ProgressAnalyzer
   * @returns {string} HTML string
   */
  renderAchievementsGallery() {
    const achievements = getAllAchievements(this.storage);

    if (!achievements || achievements.length === 0) {
      return '';
    }

    // Sort by date (most recent first)
    const sorted = [...achievements].sort((a, b) => {
      const dateA = new Date(a.dateAchieved || 0);
      const dateB = new Date(b.dateAchieved || 0);
      return dateB - dateA;
    });

    // Group by type
    const grouped = {};
    for (const achievement of sorted) {
      const type = achievement.type;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(achievement);
    }

    return `
      <div class="achievements-gallery">
        <h3 class="dashboard-title">🏆 Achievements</h3>
        <div class="achievements-summary">
          <div class="achievement-count">
            <span class="count-number">${achievements.length}</span>
            <span class="count-label">Total Achievements</span>
          </div>
        </div>
        <div class="achievements-list-gallery">
          ${Object.entries(grouped).map(([type, items]) => `
            <div class="achievement-type-group">
              <h4 class="achievement-type-title">${this.escapeHtml(formatAchievementType(type))} (${items.length})</h4>
              ${items.slice(0, 5).map(a => `
                <div class="achievement-item">
                  <span class="achievement-icon">${this.escapeHtml(a.badge)}</span>
                  <div class="achievement-info">
                    <p class="achievement-desc">${this.escapeHtml(a.description)}</p>
                    <span class="achievement-date">${this.formatAchievementDate(a.dateAchieved)}</span>
                  </div>
                </div>
              `).join('')}
              ${items.length > 5 ? `<p class="more-achievements">+ ${items.length - 5} more</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  formatAchievementDate(dateStr) {
    if (!dateStr) return '';

    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (error) {
      return '';
    }
  }

  renderSummaryStats(stats) {
    if (!stats || stats.workoutsCompleted === 0) {
      return `
        <div class="progress-section">
          <h3 class="section-title">📅 Last 4 Weeks Summary</h3>
          <p class="empty-state">Start training to see progress!</p>
        </div>
      `;
    }

    const weeksTracked = Math.min(4, Math.ceil(stats.workoutsCompleted / 3));
    const needsMore = weeksTracked < 4
      ? `<p class="note">${weeksTracked} weeks tracked (need 4 for full analysis)</p>`
      : '';

    return `
      <div class="progress-section">
        <h3 class="section-title">📅 Last 4 Weeks Summary</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-icon">✅</span>
            <span class="stat-label">Workouts</span>
            <span class="stat-value">${stats.workoutsCompleted}/${stats.workoutsPlanned}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">⏱️</span>
            <span class="stat-label">Avg time</span>
            <span class="stat-value">${stats.avgSessionMinutes} min</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📊</span>
            <span class="stat-label">Progressed</span>
            <span class="stat-value">${stats.exercisesProgressed}/${stats.totalExercises}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🔥</span>
            <span class="stat-label">Streak</span>
            <span class="stat-value">${stats.currentStreak} workouts</span>
          </div>
        </div>
        ${needsMore}
      </div>
    `;
  }

  /**
   * Render strength gains section
   * @param {Array} exercises - Top progressing exercises
   * @returns {string} HTML string
   */
  renderStrengthGains(exercises) {
    if (!exercises || exercises.length === 0) {
      return `
        <div class="progress-section">
          <h3 class="section-title">💪 Strength Gains</h3>
          <p class="empty-state">No progression detected yet. Keep training!</p>
        </div>
      `;
    }

    const exerciseRows = exercises.map(ex => `
      <div class="gain-row">
        <span class="exercise-name">${this.escapeHtml(ex.name)}</span>
        <span class="gain-value">
          ${ex.oldWeight}→${ex.newWeight}kg
          <span class="gain-percent">(+${ex.percentGain}%)</span>
        </span>
      </div>
    `).join('');

    return `
      <div class="progress-section">
        <h3 class="section-title">💪 Strength Gains</h3>
        <div class="gains-list">
          ${exerciseRows}
        </div>
      </div>
    `;
  }

  /**
   * Render workout reference section with all workouts
   * @returns {string} HTML string
   */
  renderWorkoutReference() {
    try {
      const workouts = getAllWorkouts();

      if (!workouts || workouts.length === 0) {
        return `
          <section class="workout-reference">
            <h3>📋 Workout Reference</h3>
            <p style="color: var(--color-text-muted); text-align: center; padding: 20px;">
              No workouts defined.
            </p>
          </section>
        `;
      }

      return `
        <section class="workout-reference">
          <h3>📋 Workout Reference</h3>
          ${workouts.map((workout, index) =>
            this.renderWorkoutCard(workout, index)
          ).join('')}
        </section>
      `;
    } catch (error) {
      console.error('[renderWorkoutReference] Error:', error);
      return `
        <section class="workout-reference">
          <h3>📋 Workout Reference</h3>
          <p style="color: var(--color-danger); text-align: center; padding: 20px;">
            Error loading workouts. Check console for details.
          </p>
        </section>
      `;
    }
  }

  /**
   * Render individual workout card (accordion item)
   * @param {Object} workout - Workout definition
   * @param {number} index - Workout index (0-3)
   * @returns {string} HTML string
   */
  renderWorkoutCard(workout, index) {
    const isExpanded = this.expandedWorkout === index;

    return `
      <div class="workout-ref-card ${isExpanded ? 'expanded' : ''}" data-workout-index="${index}">
        <div class="workout-ref-header" onclick="app.toggleWorkout(${index})">
          <h4>${this.escapeHtml(workout.displayName)}</h4>
          <span class="expand-icon">▶</span>
        </div>
        ${isExpanded ? this.renderExerciseList(workout) : ''}
      </div>
    `;
  }

  /**
   * Render exercise list for expanded workout
   * @param {Object} workout - Workout definition
   * @returns {string} HTML string
   */
  renderExerciseList(workout) {
    if (!workout.exercises || workout.exercises.length === 0) {
      return `
        <div class="exercise-list">
          <p style="color: var(--color-text-muted); text-align: center;">
            No exercises defined.
          </p>
        </div>
      `;
    }

    return `
      <div class="exercise-list">
        ${workout.exercises.map((exercise, index) => {
          const isTimeBased = this.isTimeBasedExercise(exercise);
          const repsUnit = isTimeBased ? '' : ' reps';

          return `
            <div class="exercise-item">
              <div class="exercise-name">${index + 1}. ${this.escapeHtml(exercise.name)}</div>
              <div class="exercise-meta">${exercise.sets} sets × ${exercise.repRange}${repsUnit}</div>
              ${exercise.notes ? `<div class="exercise-note">${this.escapeHtml(exercise.notes)}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * Toggle workout accordion expand/collapse
   * @param {number} index - Workout index (0-3)
   */
  toggleWorkout(index) {
    // Toggle: if already expanded, collapse; otherwise expand
    this.expandedWorkout = this.expandedWorkout === index ? null : index;

    // Persist to session storage
    if (this.expandedWorkout !== null) {
      sessionStorage.setItem('expandedWorkout', this.expandedWorkout.toString());
    } else {
      sessionStorage.removeItem('expandedWorkout');
    }

    // TODO: Performance optimization - consider surgical DOM updates instead of full re-render
    // Current approach re-renders entire Overview tab (simple but creates DOM churn).
    // For only 4 workout cards, impact is minimal. If UX issues arise, refactor to:
    // - Toggle .expanded class on specific card
    // - Insert/remove exercise list HTML only for changed card
    // Re-render Overview tab
    const progressContent = document.getElementById('progress-content');
    if (!progressContent) return;

    // Re-fetch data (lightweight, no API calls)
    const progressAnalyzer = new ProgressAnalyzer(this.storage);
    const stats = progressAnalyzer.getLast4WeeksStats();
    const strengthGains = progressAnalyzer.getTopProgressingExercises(3);

    progressContent.innerHTML = `
      ${this.renderAchievementsGallery()}
      ${this.renderSummaryStats(stats)}
      ${this.renderStrengthGains(strengthGains)}
      ${this.renderWorkoutReference()}
    `;
  }

  /**
   * Render body composition section
   * @param {Object} weightData - Summary from BodyWeightManager
   * @returns {string} HTML string
   */
  renderBodyComposition(weightData) {
    if (!weightData) {
      return ''; // Hide section if no data
    }

    const statusLabels = {
      'fast_bulk': '🟡 Fast bulk',
      'healthy_bulk': '🟢 Healthy lean bulk',
      'maintenance': '🔵 Maintenance',
      'slow_cut': '🟡 Slow cut',
      'rapid_cut': '🔴 Rapid cut'
    };

    const statusLabel = statusLabels[weightData.status] || weightData.status;
    const trendSign = weightData.trend8Week >= 0 ? '+' : '';
    const rateSign = weightData.monthlyRate >= 0 ? '+' : '';

    return `
      <div class="progress-section">
        <h3 class="section-title">⚖️ Body Composition</h3>
        <div class="composition-grid">
          <div class="comp-item">
            <span class="comp-label">Current</span>
            <span class="comp-value">${weightData.currentWeight.toFixed(1)} kg</span>
          </div>
          <div class="comp-item">
            <span class="comp-label">8-week</span>
            <span class="comp-value">${trendSign}${weightData.trend8Week.toFixed(1)} kg</span>
          </div>
          <div class="comp-item">
            <span class="comp-label">Rate</span>
            <span class="comp-value">${rateSign}${weightData.monthlyRate.toFixed(1)} kg/month</span>
          </div>
          <div class="comp-item comp-status">
            <span class="comp-label">Status</span>
            <span class="comp-value">${statusLabel}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render weight trend chart section
   * @param {Object} weightData - Summary from BodyWeightManager
   * @returns {string} HTML string
   */
  renderWeightChart(weightData) {
    if (!weightData || !weightData.entries || weightData.entries.length === 0) {
      return `
        <div class="progress-section">
          <h3 class="section-title">📈 Body Weight Trend</h3>
          <div class="empty-state">
            <p class="empty-state-icon">⚖️</p>
            <p class="empty-state-text">No weight data yet</p>
            <p class="empty-state-hint">Click 'Log Weigh-In' to start tracking your body weight.</p>
            <button id="log-weighin-btn" class="btn btn-primary" style="margin-top: 16px;">Log Weigh-In</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="progress-section">
        <h3 class="section-title">📈 Body Weight Trend</h3>
        <div id="weight-chart-container" class="chart-container">
          <!-- Chart will be inserted here -->
        </div>
        <button id="log-weighin-btn" class="btn btn-primary" style="margin-top: 16px; width: 100%;">Log Weigh-In</button>
      </div>
    `;
  }

  /**
   * Show post-workout summary screen
   * @param {Object} workoutData - Completed workout data
   */
  showWorkoutSummary(workoutData) {
    // Calculate stats
    const stats = this.calculateWorkoutStats(workoutData);
    const newRecords = this.detectNewRecords(workoutData);

    // Detect achievements
    const achievements = detectAchievements(workoutData, this.storage);

    // Show summary screen
    this.hideAllScreens();
    const summaryScreen = document.getElementById('summary-screen');
    if (summaryScreen) {
      summaryScreen.classList.add('active');
    }
    window.history.pushState({ screen: 'summary' }, '', '');

    // Render stats section
    this.renderPostWorkoutSummaryStats(stats, newRecords, achievements);

    // Setup pain tracking (reuse logic, inline)
    this.setupSummaryPainTracking(workoutData);

    // Setup weigh-in (conditional)
    this.setupSummaryWeighIn();

    // Setup done button
    this.setupSummaryDoneButton(workoutData);
  }

  /**
   * Render post-workout summary stats section
   * @param {Object} stats - Workout stats
   * @param {Array} newRecords - Array of PRs
   * @param {Array} achievements - Array of newly earned achievements
   */
  renderPostWorkoutSummaryStats(stats, newRecords, achievements = []) {
    const container = document.getElementById('summary-stats');

    // Update title
    document.querySelector('.summary-title').textContent =
      `✅ ${stats.displayName} Complete!`;

    // Build stats HTML
    let html = '';

    // Duration
    html += `
      <div class="stat-row">
        <span class="stat-icon">⏱️</span>
        <span>${stats.duration}</span>
      </div>
    `;

    // Total volume
    html += `
      <div class="stat-row">
        <span class="stat-icon">📊</span>
        <span>${stats.totalVolume.toLocaleString()} kg total volume</span>
        ${stats.volumeComparison ? this.renderVolumeComparison(stats.volumeComparison) : ''}
      </div>
    `;

    // New records
    if (newRecords.length > 0) {
      html += `
        <div class="stat-row">
          <span class="stat-icon">🎉</span>
          <span class="stat-value">${newRecords.length} New Record${newRecords.length > 1 ? 's' : ''}!</span>
        </div>
        <ul class="records-list">
          ${newRecords.map(record => this.renderRecord(record)).join('')}
        </ul>
      `;
    } else {
      html += `
        <div class="empty-records">Keep pushing! 💪</div>
      `;
    }

    // Achievements
    if (achievements && achievements.length > 0) {
      html += this.renderAchievementsEarned(achievements);
    }

    container.innerHTML = html;
  }

  /**
   * Render volume comparison indicator
   * @param {Object} comparison - Comparison object
   * @returns {string} HTML string
   */
  renderVolumeComparison(comparison) {
    const directionClass = comparison.direction === 'up' ? '' : 'down';
    const emoji = comparison.direction === 'up' ? '📈' : '📉';
    const sign = comparison.direction === 'up' ? '+' : '';

    return `
      <span class="trend-indicator ${directionClass}">
        ${emoji} ${sign}${comparison.percent}%
      </span>
    `;
  }

  /**
   * Render individual record
   * @param {Object} record - Record object
   * @returns {string} HTML string
   */
  renderRecord(record) {
    if (record.type === 'weight') {
      return `<li class="record-item">• ${record.exercise}: ${record.from}kg → ${record.to}kg</li>`;
    } else {
      return `<li class="record-item">• ${record.exercise} @ ${record.weight}kg: ${record.from} → ${record.to} reps</li>`;
    }
  }

  /**
   * Render achievements earned display
   * @param {Array} achievements - Array of achievement objects
   * @returns {string} HTML string
   */
  renderAchievementsEarned(achievements) {
    if (!achievements || achievements.length === 0) return '';

    return `
      <div class="achievements-earned">
        <h3 class="achievements-title">🎉 Achievements Earned Today</h3>
        <div class="achievements-list">
          ${achievements.map(a => `
            <div class="achievement-badge">
              <span class="badge-icon">${this.escapeHtml(a.badge)}</span>
              <div class="badge-details">
                <strong class="badge-type">${this.escapeHtml(formatAchievementType(a.type))}</strong>
                <p class="badge-description">${this.escapeHtml(a.description)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Setup pain tracking section in summary
   * @param {Object} workoutData - Workout data with exercises
   */
  setupSummaryPainTracking(workoutData) {
    const painNoBtn = document.getElementById('pain-no-summary');
    const painYesBtn = document.getElementById('pain-yes-summary');
    const initialChoice = document.getElementById('pain-initial-choice');
    const exerciseSelection = document.getElementById('pain-exercise-selection-summary');
    const painDetails = document.getElementById('pain-details-summary');

    // State tracking
    let painfulExercises = [];
    let currentPainIndex = 0;

    // Reset to initial state
    initialChoice.style.display = 'flex';
    exerciseSelection.style.display = 'none';
    painDetails.style.display = 'none';

    // Pre-select "No pain"
    painNoBtn.classList.remove('btn-secondary');
    painNoBtn.classList.add('btn-primary');
    painYesBtn.classList.remove('btn-primary');
    painYesBtn.classList.add('btn-secondary');

    // Store default: no pain
    this.summaryPainSelection = 'no';

    // "No pain" button
    painNoBtn.onclick = () => {
      this.summaryPainSelection = 'no';
      painNoBtn.classList.remove('btn-secondary');
      painNoBtn.classList.add('btn-primary');
      painYesBtn.classList.remove('btn-primary');
      painYesBtn.classList.add('btn-secondary');

      // Hide expanded sections
      exerciseSelection.style.display = 'none';
      painDetails.style.display = 'none';
    };

    // "Yes, I had pain" button
    painYesBtn.onclick = () => {
      this.summaryPainSelection = 'yes';
      painYesBtn.classList.remove('btn-secondary');
      painYesBtn.classList.add('btn-primary');
      painNoBtn.classList.remove('btn-primary');
      painNoBtn.classList.add('btn-secondary');

      // Show exercise selection
      initialChoice.style.display = 'flex'; // Keep visible
      exerciseSelection.style.display = 'block';

      // Populate exercise checkboxes
      const exerciseList = document.getElementById('pain-exercise-list-summary');
      exerciseList.innerHTML = '';

      workoutData.exercises.forEach((exercise, index) => {
        const exerciseKey = `${workoutData.workoutName} - ${exercise.name}`;
        const item = document.createElement('div');
        item.className = 'pain-exercise-checkbox-item';
        item.innerHTML = `
          <input type="checkbox" id="pain-ex-summary-${index}" value="${exerciseKey}">
          <label for="pain-ex-summary-${index}">${this.escapeHtml(exercise.name)}</label>
        `;

        // Toggle selected class on click
        item.onclick = (e) => {
          if (e.target.tagName !== 'INPUT') {
            const checkbox = item.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
          }
          item.classList.toggle('selected', item.querySelector('input').checked);
        };

        exerciseList.appendChild(item);
      });
    };

    // "Next" button (after selecting exercises)
    document.getElementById('pain-next-summary').onclick = () => {
      // Collect checked exercises
      const checkboxes = document.querySelectorAll('#pain-exercise-list-summary input[type="checkbox"]:checked');
      painfulExercises = Array.from(checkboxes).map(cb => ({
        key: cb.value,
        name: cb.nextElementSibling.textContent
      }));

      if (painfulExercises.length === 0) {
        alert('Please select at least one exercise, or click "No Pain"');
        return;
      }

      // Show pain details for first exercise
      currentPainIndex = 0;
      this.showSummaryPainDetails(painfulExercises, currentPainIndex, workoutData);
    };

    // Store reference for later
    this.summaryPainfulExercises = [];
  }

  /**
   * Show pain details for selected exercise in summary
   * @param {Array} painfulExercises - Array of painful exercises
   * @param {number} index - Current exercise index
   * @param {Object} workoutData - Workout data
   */
  showSummaryPainDetails(painfulExercises, index, workoutData) {
    if (index >= painfulExercises.length) {
      // All done - store for saving later
      this.summaryPainfulExercises = painfulExercises;

      // Hide pain details, return to summary
      document.getElementById('pain-details-summary').style.display = 'none';
      return;
    }

    const painDetails = document.getElementById('pain-details-summary');
    const exerciseSelection = document.getElementById('pain-exercise-selection-summary');

    // Hide selection, show details
    exerciseSelection.style.display = 'none';
    painDetails.style.display = 'block';

    // Set exercise name and progress
    document.getElementById('pain-current-exercise').textContent = painfulExercises[index].name;
    document.getElementById('pain-exercise-progress').textContent =
      `Exercise ${index + 1} of ${painfulExercises.length}`;

    // Setup severity buttons
    const severityBtns = document.querySelectorAll('.pain-severity-btn');
    let selectedSeverity = null;

    severityBtns.forEach(btn => {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');

      btn.onclick = () => {
        selectedSeverity = btn.dataset.severity;
        severityBtns.forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
      };
    });

    // Setup location buttons
    const locationBtns = document.querySelectorAll('.pain-location-buttons-summary .pain-location-btn');
    locationBtns.forEach(btn => {
      btn.onclick = () => {
        if (!selectedSeverity) {
          alert('Please select pain severity first');
          return;
        }

        const location = btn.dataset.location;

        // Store pain data for this exercise
        painfulExercises[index].severity = selectedSeverity;
        painfulExercises[index].location = location;

        // Move to next exercise
        this.showSummaryPainDetails(painfulExercises, index + 1, workoutData);
      };
    });
  }

  /**
   * Setup weigh-in section in summary (conditional)
   */
  setupSummaryWeighIn() {
    const weighinSection = document.getElementById('summary-weighin');
    const weighinInput = document.getElementById('weighin-input-summary');

    // Initialize BodyWeightManager if not already done
    if (!this.bodyWeight) {
      this.bodyWeight = new BodyWeightManager(this.storage);
    }

    // Check if weigh-in is due
    const weighinDue = this.bodyWeight.isWeighInDue();

    if (!weighinDue) {
      weighinSection.style.display = 'none';
      return;
    }

    // Show weigh-in section
    weighinSection.style.display = 'block';

    // Pre-fill with last weight or default
    const data = this.bodyWeight.getData();
    const lastWeight = data.entries.length > 0
      ? data.entries[data.entries.length - 1].weight_kg
      : 57.5;

    weighinInput.value = lastWeight;

    // Auto-select for quick entry
    setTimeout(() => weighinInput.select(), 100);
  }

  /**
   * Setup done button for summary screen
   * @param {Object} workoutData - Workout data
   */
  setupSummaryDoneButton(workoutData) {
    const doneBtn = document.getElementById('summary-done-btn');

    doneBtn.onclick = () => {
      // Validate and save pain data
      if (!this.saveSummaryPainData(workoutData)) {
        return; // Validation failed
      }

      // Save weigh-in data (if section visible)
      this.saveSummaryWeighInData();

      // Navigate to home screen
      this.showHomeScreen();
    };
  }

  /**
   * Save pain data from summary
   * @param {Object} workoutData - Workout data
   * @returns {boolean} True if successful, false if validation failed
   */
  saveSummaryPainData(workoutData) {
    if (this.summaryPainSelection === 'no') {
      // Save pain-free status for all exercises
      workoutData.exercises.forEach(exercise => {
        const exerciseKey = `${workoutData.workoutName} - ${exercise.name}`;
        this.storage.savePainReport(exerciseKey, false, null, null);
      });
      return true;
    }

    // User selected "Yes, I had pain"
    if (!this.summaryPainfulExercises || this.summaryPainfulExercises.length === 0) {
      // Check if they selected exercises
      const checkboxes = document.querySelectorAll('#pain-exercise-list-summary input[type="checkbox"]:checked');
      if (checkboxes.length === 0) {
        alert('Please select exercises with pain, or click "No Pain"');
        return false;
      }
    }

    // Validate pain details completed
    const incompletePain = this.summaryPainfulExercises.find(ex => !ex.severity || !ex.location);
    if (incompletePain) {
      alert('Please complete pain details for all selected exercises');
      return false;
    }

    // Save pain data for each exercise
    this.summaryPainfulExercises.forEach(painfulEx => {
      this.storage.savePainReport(
        painfulEx.key,
        true,
        painfulEx.location,
        painfulEx.severity
      );
    });

    // Save pain-free for non-painful exercises
    workoutData.exercises.forEach(exercise => {
      const exerciseKey = `${workoutData.workoutName} - ${exercise.name}`;
      const isPainful = this.summaryPainfulExercises.some(p => p.key === exerciseKey);
      if (!isPainful) {
        this.storage.savePainReport(exerciseKey, false, null, null);
      }
    });

    return true;
  }

  /**
   * Save weigh-in data from summary
   */
  saveSummaryWeighInData() {
    const weighinSection = document.getElementById('summary-weighin');

    // Only save if section is visible
    if (weighinSection.style.display === 'none') {
      return;
    }

    const weighinInput = document.getElementById('weighin-input-summary');
    const weight = parseFloat(weighinInput.value);

    // Validate weight
    if (isNaN(weight) || weight < 30 || weight > 200) {
      // Optional field - just skip if invalid
      return;
    }

    // Save weight
    const result = this.bodyWeight.addEntry(weight);

    if (result.replaced) {
      console.log(`[Summary] Updated today's weight to ${weight} kg`);
    } else {
      console.log(`[Summary] Logged weight: ${weight} kg`);
    }
  }

  /**
   * Save recovery metrics to localStorage
   * @param {Object} metrics - Recovery data
   */
  saveRecoveryMetrics(metrics) {
    try {
      const entries = this.getRecoveryMetrics();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Check if entry exists for today
      const existingIndex = entries.findIndex(e => e.date === today);

      if (existingIndex >= 0) {
        // Update existing entry
        entries[existingIndex] = { ...entries[existingIndex], ...metrics, date: today };
      } else {
        // Add new entry
        entries.push({ date: today, ...metrics });
      }

      // Cleanup: keep only last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const cutoffDate = ninetyDaysAgo.toISOString().split('T')[0];
      const filtered = entries.filter(e => e.date >= cutoffDate);

      localStorage.setItem('build_recovery_metrics', JSON.stringify(filtered));
    } catch (error) {
      console.error('[Recovery Metrics] Save failed:', error);
    }
  }

  /**
   * Get recovery metrics from localStorage
   * @returns {Array} Array of recovery entries
   */
  getRecoveryMetrics() {
    try {
      const data = localStorage.getItem('build_recovery_metrics');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Recovery Metrics] Retrieval failed:', error);
      return [];
    }
  }

  /**
   * Check if recovery check is due (once per day)
   * @returns {boolean} True if check needed
   */
  isRecoveryCheckDue() {
    const entries = this.getRecoveryMetrics();
    if (entries.length === 0) return true;

    const lastEntry = entries[entries.length - 1];
    const today = new Date().toDateString();
    const lastDate = new Date(lastEntry.date).toDateString();

    return today !== lastDate;
  }

  /**
   * Calculate pre-workout fatigue score (0-6 points)
   * @param {Object} metrics - Recovery metrics
   * @returns {number} Points from pre-workout data
   */
  calculatePreWorkoutScore(metrics) {
    let score = 0;

    // Sleep scoring
    if (metrics.sleepHours < 6) {
      score += 2;
    } else if (metrics.sleepHours < 7) {
      score += 1;
    }

    // Stress scoring
    if (metrics.stressLevel === 'High') {
      score += 1;
    }

    // Energy scoring
    if (metrics.energyLevel <= 2) {
      score += 2;
    } else if (metrics.energyLevel === 3) {
      score += 1;
    }

    // Soreness scoring
    if (metrics.muscleSoreness === 'Severe') {
      score += 2;
    } else if (metrics.muscleSoreness === 'Moderate') {
      score += 1;
    }

    return score;
  }

  /**
   * Calculate pain score from last workout (0-3 points)
   * @returns {number} Points from pain data
   */
  calculatePainScore() {
    try {
      // Get all pain report keys
      const keys = Object.keys(localStorage).filter(k => k.startsWith('build_pain_'));

      if (keys.length === 0) return 0;

      // Find most recent pain reports
      const reports = keys
        .map(k => {
          try {
            return JSON.parse(localStorage.getItem(k));
          } catch {
            return null;
          }
        })
        .filter(r => r !== null && r.date);

      if (reports.length === 0) return 0;

      // Check if any report has severity >= Moderate
      const hasModerateOrWorse = reports.some(r =>
        r.severity === 'Moderate' || r.severity === 'Severe'
      );

      return hasModerateOrWorse ? 3 : 0;
    } catch (error) {
      console.error('[Fatigue Score] Pain calculation failed:', error);
      return 0;
    }
  }

  /**
   * Calculate total fatigue score (0-9 points)
   * @param {Object} metrics - Recovery metrics
   * @returns {Object} Score breakdown
   */
  calculateFatigueScore(metrics) {
    const preWorkoutScore = this.calculatePreWorkoutScore(metrics);
    const painScore = this.calculatePainScore();
    const totalScore = preWorkoutScore + painScore;

    return {
      preWorkoutScore,
      painScore,
      totalScore,
      warningThreshold: 4,
      showWarning: totalScore >= 4
    };
  }

  /**
   * Initialize radio button groups in recovery modal
   */
  initRecoveryModalRadios() {
    const groups = [
      { containerClass: 'stress-buttons', hiddenInputId: 'stress-level' },
      { containerClass: 'energy-buttons', hiddenInputId: 'energy-level' },
      { containerClass: 'soreness-buttons', hiddenInputId: 'muscle-soreness' }
    ];

    groups.forEach(group => {
      const container = document.querySelector(`.${group.containerClass}`);
      const hiddenInput = document.getElementById(group.hiddenInputId);

      if (!container || !hiddenInput) return;

      container.querySelectorAll('.radio-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          // Remove selected from all buttons in group
          container.querySelectorAll('.radio-btn').forEach(b => b.classList.remove('selected'));

          // Add selected to clicked button
          btn.classList.add('selected');

          // Update hidden input value
          hiddenInput.value = btn.dataset.value;
        });
      });
    });
  }

  /**
   * Show recovery metrics modal
   */
  showRecoveryMetricsModal() {
    const modal = document.getElementById('recovery-metrics-modal');
    if (!modal) return;

    // Reset to defaults
    document.getElementById('sleep-hours').value = 7;

    // Reset radio buttons to defaults
    document.querySelectorAll('.stress-buttons .radio-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.value === 'Low');
    });
    document.getElementById('stress-level').value = 'Low';

    document.querySelectorAll('.energy-buttons .radio-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.value === '3');
    });
    document.getElementById('energy-level').value = '3';

    document.querySelectorAll('.soreness-buttons .radio-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.value === 'None');
    });
    document.getElementById('muscle-soreness').value = 'None';

    // Show modal
    modal.style.display = 'flex';
  }

  /**
   * Handle recovery metrics submission
   */
  handleRecoverySubmit() {
    const metrics = {
      sleepHours: parseInt(document.getElementById('sleep-hours').value, 10),
      stressLevel: document.getElementById('stress-level').value,
      energyLevel: parseInt(document.getElementById('energy-level').value, 10),
      muscleSoreness: document.getElementById('muscle-soreness').value
    };

    // Calculate fatigue score
    const scoreData = this.calculateFatigueScore(metrics);

    // Save recovery entry
    this.saveRecoveryMetrics({
      ...metrics,
      preWorkoutScore: scoreData.preWorkoutScore,
      painScore: scoreData.painScore,
      fatigueScore: scoreData.totalScore,
      warningShown: scoreData.showWarning,
      warningDismissed: false,
      deloadChosen: false,
      workoutCompleted: false
    });

    // Hide modal
    document.getElementById('recovery-metrics-modal').style.display = 'none';

    // Show warning if threshold met
    if (scoreData.showWarning) {
      this.showFatigueWarning(scoreData);
    } else {
      // Proceed to workout selection
      this.showWorkoutSelection();
    }
  }

  /**
   * Show fatigue warning banner
   * @param {Object} scoreData - Fatigue score breakdown
   */
  showFatigueWarning(scoreData) {
    const banner = document.getElementById('fatigue-warning-banner');
    const scoreText = document.getElementById('fatigue-score-text');

    if (!banner || !scoreText) return;

    // Update score text
    scoreText.textContent = `Your recovery score is ${scoreData.totalScore}/9. Consider:`;

    // Show banner
    banner.style.display = 'block';

    // Update recovery entry to mark warning shown
    const entries = this.getRecoveryMetrics();
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      lastEntry.warningShown = true;
      localStorage.setItem('build_recovery_metrics', JSON.stringify(entries));
    }
  }

  /**
   * Handle fatigue warning dismiss
   */
  handleWarningDismiss() {
    // Update recovery entry
    const entries = this.getRecoveryMetrics();
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      lastEntry.warningDismissed = true;
      lastEntry.workoutCompleted = false; // User chose not to work out
      localStorage.setItem('build_recovery_metrics', JSON.stringify(entries));
    }

    // Hide banner
    document.getElementById('fatigue-warning-banner').style.display = 'none';

    // Return to home screen
    this.showHomeScreen();
  }

  /**
   * Handle fatigue warning deload choice
   */
  handleWarningDeload() {
    // Update recovery entry
    const entries = this.getRecoveryMetrics();
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      lastEntry.deloadChosen = true;
      localStorage.setItem('build_recovery_metrics', JSON.stringify(entries));
    }

    // Enable deload mode
    this.deloadManager.enableDeload();

    // Hide banner
    document.getElementById('fatigue-warning-banner').style.display = 'none';

    // Proceed to workout selection
    this.showWorkoutSelection();
  }

  /**
   * Handle fatigue warning continue anyway
   */
  handleWarningContinue() {
    // Update recovery entry
    const entries = this.getRecoveryMetrics();
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      lastEntry.warningDismissed = true;
      localStorage.setItem('build_recovery_metrics', JSON.stringify(entries));
    }

    // Hide banner
    document.getElementById('fatigue-warning-banner').style.display = 'none';

    // Proceed to workout selection
    this.showWorkoutSelection();
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
          sets: exerciseSession.sets.filter(set => set.reps > 0),
          startTime: this.workoutSession.startTime.toISOString(),
          endTime: new Date().toISOString()
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
        this.showHomeScreen();
      } else {
        alert(`✅ ${this.currentWorkout.displayName} completed!`);

        // Update recovery entry to mark workout completed
        const recoveryEntries = this.getRecoveryMetrics();
        if (recoveryEntries.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const todayEntry = recoveryEntries.find(e => e.date === today);

          if (todayEntry) {
            todayEntry.workoutCompleted = true;

            // Recalculate fatigue score with pain data
            const painScore = this.calculatePainScore();
            todayEntry.painScore = painScore;
            todayEntry.fatigueScore = todayEntry.preWorkoutScore + painScore;

            localStorage.setItem('build_recovery_metrics', JSON.stringify(recoveryEntries));
          }
        }

        // Show summary screen instead of pain modal
        const workoutData = {
          workoutName: this.currentWorkout.name,
          displayName: this.currentWorkout.displayName,
          exercises: this.workoutSession.exercises,
          exerciseDefinitions: this.currentWorkout.exercises,
          startTime: this.workoutSession.startTime.getTime(),
          endTime: Date.now()
        };

        this.showWorkoutSummary(workoutData);
      }
    } catch (error) {
      console.error('Failed to save workout:', error);
      alert('⚠️ Failed to save workout. Please try again or check storage.');
    }
  }

  /**
   * Show unlock notification after completing a set
   *
   * @param {string} currentExercise - Current exercise
   * @param {string} slotKey - Workout slot
   */
  async checkAndShowUnlockNotification(currentExercise, slotKey) {
    try {
      // Get progression path for this slot
      const path = getProgressionPath(slotKey);
      if (!path || !path.harder || path.harder.length === 0) return;

      // Check each harder progression
      for (const targetExercise of path.harder) {
        // Skip if already unlocked
        if (this.storage.isExerciseUnlocked(targetExercise)) continue;

        // Evaluate unlock criteria
        const evaluation = this.unlockEvaluator.evaluateUnlock(targetExercise, currentExercise);

        if (evaluation.unlocked) {
          // Show unlock notification
          await this.showUnlockModal(targetExercise, currentExercise, slotKey, evaluation);

          // Only show one unlock per workout (priority system: Complex > Moderate > Simple)
          break;
        }
      }
    } catch (error) {
      console.error('[App] Error checking unlock notification:', error);
    }
  }

  /**
   * Show unlock modal
   *
   * @param {string} exerciseName - Unlocked exercise
   * @param {string} currentExercise - Current exercise
   * @param {string} slotKey - Slot key
   * @param {Object} evaluation - Evaluation results
   */
  showUnlockModal(exerciseName, currentExercise, slotKey, evaluation) {
    return new Promise((resolve) => {
      const modal = document.getElementById('unlock-notification-modal');
      const exerciseNameEl = document.getElementById('unlock-exercise-name');
      const criteriaList = document.getElementById('unlock-criteria-list');
      const tryBtn = document.getElementById('unlock-try-btn');
      const laterBtn = document.getElementById('unlock-later-btn');

      // Set exercise name
      exerciseNameEl.textContent = exerciseName;

      // Render criteria
      criteriaList.innerHTML = '';
      const { criteria } = evaluation;

      if (criteria.strength) {
        const li = document.createElement('li');
        li.className = 'met';
        li.textContent = '✓ Strength milestone achieved';
        criteriaList.appendChild(li);
      }

      if (criteria.mobility) {
        const li = document.createElement('li');
        li.className = 'met';
        li.textContent = '✓ Mobility confirmed';
        criteriaList.appendChild(li);
      }

      if (criteria.painFree) {
        const li = document.createElement('li');
        li.className = 'met';
        li.textContent = '✓ Pain-free status';
        criteriaList.appendChild(li);
      }

      if (criteria.weeks > 0) {
        const li = document.createElement('li');
        li.className = 'met';
        li.textContent = `✓ Training: ${criteria.weeks} weeks`;
        criteriaList.appendChild(li);
      }

      // Show modal
      modal.style.display = 'flex';

      // Handle "Switch to This Exercise"
      tryBtn.onclick = () => {
        // Save unlock achievement
        this.storage.saveUnlock(exerciseName, criteria);

        // Switch exercise in slot
        this.storage.saveExerciseSelection(slotKey, exerciseName);

        // Close modal
        modal.style.display = 'none';

        // Refresh workout screen
        const workoutKey = slotKey.split('_')[0] + '_' + slotKey.split('_')[1]; // e.g., "UPPER_A"
        if (this.currentWorkout) {
          // Re-render current workout to show new exercise
          this.renderExerciseList();
        }

        resolve('switched');
      };

      // Handle "Maybe Later"
      laterBtn.onclick = () => {
        // Save unlock achievement (but don't switch)
        this.storage.saveUnlock(exerciseName, criteria);

        // Close modal
        modal.style.display = 'none';

        resolve('later');
      };
    });
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.app = new App());
} else {
  window.app = new App();
}
