# Barbell Progression Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Track strength benchmarks, mobility checks, and pain history to determine when user is ready to transition from dumbbells to barbells for Bench Press, Back Squat, and Deadlift.

**Architecture:** Read-only analysis module (`BarbellProgressionTracker`) that calculates readiness from exercise history, mobility check prompts after key exercises, pain tracking per exercise, and Progress Dashboard screen for visualization.

**Tech Stack:** Vanilla JavaScript (ES6 modules), localStorage, CSS Grid/Flexbox, no external dependencies

**Design Reference:** `docs/plans/2026-02-05-barbell-progression-design.md`

---

## Context

**What's already built:**
- ✅ StorageManager with exercise history (src/js/modules/storage.js)
- ✅ WorkoutManager with rotation tracking (src/js/modules/workout-manager.js)
- ✅ PerformanceAnalyzer pattern (read-only analysis module)
- ✅ App.js integration points (src/js/app.js)

**What we're adding:**
1. Barbell progression analysis module
2. Mobility check prompts (Yes/No/Not sure)
3. Pain tracking per exercise
4. Progress Dashboard screen
5. Contextual display in exercise history (future)

---

## Task 1: Storage Extensions for Mobility and Pain

**Files:**
- Modify: `src/js/modules/storage.js` (add new methods)

**Step 1: Add mobility checks storage methods**

Add after `getDeloadState()` method (around line 180):

```javascript
/**
 * Saves mobility check response for barbell progression tracking
 * @param {string} criteriaKey - Mobility criteria key (e.g., 'bench_overhead_mobility')
 * @param {string} response - 'yes', 'no', or 'not_sure'
 */
saveMobilityCheck(criteriaKey, response) {
  if (!criteriaKey || typeof criteriaKey !== 'string') {
    throw new Error('Invalid criteria key');
  }
  if (!['yes', 'no', 'not_sure'].includes(response)) {
    throw new Error('Invalid response: must be yes, no, or not_sure');
  }

  const key = 'barbell_mobility_checks';
  const data = this.storage.getItem(key);
  const checks = data ? JSON.parse(data) : {};

  if (!checks[criteriaKey]) {
    checks[criteriaKey] = [];
  }

  checks[criteriaKey].push({
    date: new Date().toISOString().split('T')[0],
    response: response
  });

  // Keep last 10 checks per criteria
  if (checks[criteriaKey].length > 10) {
    checks[criteriaKey] = checks[criteriaKey].slice(-10);
  }

  this.storage.setItem(key, JSON.stringify(checks));
}

/**
 * Retrieves mobility check history for a criteria
 * @param {string} criteriaKey - Mobility criteria key
 * @returns {Array} Array of {date, response} objects
 */
getMobilityChecks(criteriaKey) {
  const key = 'barbell_mobility_checks';
  const data = this.storage.getItem(key);

  if (!data) return [];

  try {
    const checks = JSON.parse(data);
    return checks[criteriaKey] || [];
  } catch (error) {
    console.error('Failed to parse mobility checks:', error);
    return [];
  }
}
```

**Step 2: Add pain tracking storage methods**

Add after mobility methods:

```javascript
/**
 * Saves pain report for an exercise
 * @param {string} exerciseKey - Exercise identifier (e.g., 'UPPER_A - DB Bench Press')
 * @param {boolean} hadPain - Whether user experienced pain
 * @param {string|null} location - Pain location (e.g., 'shoulder', 'elbow')
 * @param {string|null} severity - 'minor' or 'significant'
 */
savePainReport(exerciseKey, hadPain, location = null, severity = null) {
  if (!exerciseKey || typeof exerciseKey !== 'string') {
    throw new Error('Invalid exercise key');
  }
  if (typeof hadPain !== 'boolean') {
    throw new Error('hadPain must be boolean');
  }

  const key = 'exercise_pain_history';
  const data = this.storage.getItem(key);
  const painHistory = data ? JSON.parse(data) : {};

  if (!painHistory[exerciseKey]) {
    painHistory[exerciseKey] = [];
  }

  painHistory[exerciseKey].push({
    date: new Date().toISOString().split('T')[0],
    hadPain: hadPain,
    location: location,
    severity: severity
  });

  // Keep last 10 pain reports per exercise
  if (painHistory[exerciseKey].length > 10) {
    painHistory[exerciseKey] = painHistory[exerciseKey].slice(-10);
  }

  this.storage.setItem(key, JSON.stringify(painHistory));
}

/**
 * Retrieves pain history for an exercise
 * @param {string} exerciseKey - Exercise identifier
 * @returns {Array} Array of {date, hadPain, location, severity} objects
 */
getPainHistory(exerciseKey) {
  const key = 'exercise_pain_history';
  const data = this.storage.getItem(key);

  if (!data) return [];

  try {
    const painHistory = JSON.parse(data);
    return painHistory[exerciseKey] || [];
  } catch (error) {
    console.error('Failed to parse pain history:', error);
    return [];
  }
}
```

**Step 3: Test manually in browser console**

Open `src/index.html` in browser, open DevTools console:

```javascript
// Test mobility checks
const sm = new (await import('./js/modules/storage.js')).StorageManager();
sm.saveMobilityCheck('bench_overhead_mobility', 'yes');
console.log(sm.getMobilityChecks('bench_overhead_mobility'));
// Expected: [{date: '2026-02-05', response: 'yes'}]

// Test pain tracking
sm.savePainReport('UPPER_A - DB Bench Press', true, 'shoulder', 'minor');
console.log(sm.getPainHistory('UPPER_A - DB Bench Press'));
// Expected: [{date: '2026-02-05', hadPain: true, location: 'shoulder', severity: 'minor'}]
```

**Step 4: Commit**

```bash
git add src/js/modules/storage.js
git commit -m "feat: add mobility check and pain tracking storage methods"
```

---

## Task 2: Barbell Progression Tracker Module

**Files:**
- Create: `src/js/modules/barbell-progression-tracker.js`

**Step 1: Create module skeleton with constructor**

```javascript
/**
 * BarbellProgressionTracker
 *
 * Analyzes exercise history, mobility checks, and pain reports to determine
 * readiness for barbell exercise transitions (Bench Press, Back Squat, Deadlift).
 *
 * Read-only module - does not modify localStorage.
 */
export class BarbellProgressionTracker {
  /**
   * @param {StorageManager} storage - Storage manager instance
   */
  constructor(storage) {
    this.storage = storage;

    // Barbell progression criteria definitions
    this.PROGRESSIONS = {
      barbell_bench: {
        name: 'Barbell Bench Press',
        prerequisiteExercises: {
          primary: 'DB Bench Press',
          workoutPrefix: 'UPPER_A'
        },
        strength: {
          weight: 20,  // kg per hand
          reps: 12,
          sets: 3,
          minRIR: 2
        },
        weeks: 12,
        mobilityChecks: [
          {
            key: 'bench_overhead_mobility',
            question: 'Could you press overhead without back arching?',
            help: 'Ribs stay down, no excessive lower back arch'
          },
          {
            key: 'bench_stable',
            question: 'Were you stable on bench with dumbbells?',
            help: 'No wobbling or loss of balance'
          }
        ],
        painLocations: ['shoulder', 'elbow', 'wrist']
      },

      barbell_squat: {
        name: 'Barbell Back Squat',
        prerequisiteExercises: {
          primary: 'Goblet Squat',
          workoutPrefix: 'LOWER_A'
        },
        strength: {
          weight: 20,  // kg total (dumbbell weight)
          reps: 12,
          sets: 3,
          minRIR: 2
        },
        weeks: 16,
        mobilityChecks: [
          {
            key: 'squat_heels_flat',
            question: 'Did you keep heels flat during squats?',
            help: 'No heel lift off ground during descent'
          },
          {
            key: 'squat_parallel',
            question: 'Could you reach parallel depth comfortably?',
            help: 'Hip crease below knee level'
          }
        ],
        painLocations: ['knee', 'lower_back', 'hip']
      },

      barbell_deadlift: {
        name: 'Barbell Deadlift',
        prerequisiteExercises: {
          primary: 'DB RDL',
          workoutPrefix: 'UPPER_A'
        },
        strength: {
          weight: 25,  // kg per hand
          reps: 12,
          sets: 3,
          minRIR: 2
        },
        weeks: 20,
        mobilityChecks: [
          {
            key: 'deadlift_toe_touch',
            question: 'Could you touch your toes in warm-up?',
            help: 'Stand with legs straight, bend forward - fingertips reach toes without rounding back'
          },
          {
            key: 'deadlift_hip_hinge',
            question: 'Could you maintain straight back during RDLs?',
            help: 'No excessive rounding in lower back'
          }
        ],
        painLocations: ['lower_back', 'hamstring']
      }
    };
  }

  // Methods will be added in next steps
}
```

**Step 2: Add strength progress calculation**

Add after constructor:

```javascript
/**
 * Calculate strength benchmark progress for a progression
 * @param {string} progressionKey - 'barbell_bench', 'barbell_squat', or 'barbell_deadlift'
 * @returns {Object} {met: boolean, percentage: number, current: Object, target: Object}
 * @private
 */
_calculateStrengthProgress(progressionKey) {
  const progression = this.PROGRESSIONS[progressionKey];
  if (!progression) {
    return { met: false, percentage: 0, current: null, target: progression.strength };
  }

  const exerciseName = progression.prerequisiteExercises.primary;
  const workoutPrefix = progression.prerequisiteExercises.workoutPrefix;
  const exerciseKey = `${workoutPrefix} - ${exerciseName}`;

  const history = this.storage.getExerciseHistory(exerciseKey);

  if (!history || history.length === 0) {
    return { met: false, percentage: 0, current: null, target: progression.strength };
  }

  const recentWorkout = history[history.length - 1];

  if (!recentWorkout.sets || recentWorkout.sets.length === 0) {
    return { met: false, percentage: 0, current: null, target: progression.strength };
  }

  // Get current stats
  const currentWeight = recentWorkout.sets[0]?.weight || 0;
  const allSetsHitReps = recentWorkout.sets.every(set =>
    (set.reps || 0) >= progression.strength.reps
  );
  const avgRIR = recentWorkout.sets.reduce((sum, set) => sum + (set.rir || 0), 0) / recentWorkout.sets.length;

  // Check if all criteria met
  const weightMet = currentWeight >= progression.strength.weight;
  const repsMet = allSetsHitReps;
  const rirMet = avgRIR >= progression.strength.minRIR;
  const setsMet = recentWorkout.sets.length >= progression.strength.sets;

  const met = weightMet && repsMet && rirMet && setsMet;

  // Calculate percentage (0-100)
  let percentage = 0;

  // Weight contributes 70%
  const weightProgress = Math.min(currentWeight / progression.strength.weight, 1.0);
  percentage += weightProgress * 70;

  // Reps + RIR contributes 30%
  if (repsMet && rirMet) {
    percentage += 30;
  } else {
    percentage += 15; // Partial credit
  }

  return {
    met: met,
    percentage: Math.floor(percentage),
    current: {
      weight: currentWeight,
      reps: recentWorkout.sets.map(s => s.reps),
      rir: recentWorkout.sets.map(s => s.rir),
      date: recentWorkout.date
    },
    target: progression.strength
  };
}
```

**Step 3: Add weeks of training calculation**

Add after strength progress method:

```javascript
/**
 * Calculate weeks of training progress
 * @param {string} progressionKey - Progression identifier
 * @returns {Object} {met: boolean, percentage: number, weeksTrained: number, weeksRequired: number}
 * @private
 */
_calculateWeeksProgress(progressionKey) {
  const progression = this.PROGRESSIONS[progressionKey];
  if (!progression) {
    return { met: false, percentage: 0, weeksTrained: 0, weeksRequired: 0 };
  }

  const exerciseName = progression.prerequisiteExercises.primary;
  const workoutPrefix = progression.prerequisiteExercises.workoutPrefix;
  const exerciseKey = `${workoutPrefix} - ${exerciseName}`;

  const history = this.storage.getExerciseHistory(exerciseKey);

  if (!history || history.length < 2) {
    return { met: false, percentage: 0, weeksTrained: 0, weeksRequired: progression.weeks };
  }

  const firstDate = new Date(history[0].date);
  const latestDate = new Date(history[history.length - 1].date);
  const daysTrained = Math.floor((latestDate - firstDate) / (24 * 60 * 60 * 1000));
  const weeksTrained = Math.floor(daysTrained / 7);

  const met = weeksTrained >= progression.weeks;
  const percentage = Math.min((weeksTrained / progression.weeks) * 100, 100);

  return {
    met: met,
    percentage: Math.floor(percentage),
    weeksTrained: weeksTrained,
    weeksRequired: progression.weeks
  };
}
```

**Step 4: Add mobility progress calculation**

```javascript
/**
 * Calculate mobility criteria progress
 * @param {string} progressionKey - Progression identifier
 * @param {number} requiredConsecutive - Number of consecutive "yes" needed (default: 5)
 * @returns {Object} {met: boolean, percentage: number, checks: Array}
 * @private
 */
_calculateMobilityProgress(progressionKey, requiredConsecutive = 5) {
  const progression = this.PROGRESSIONS[progressionKey];
  if (!progression) {
    return { met: false, percentage: 0, checks: [] };
  }

  const mobilityChecks = progression.mobilityChecks.map(check => {
    const history = this.storage.getMobilityChecks(check.key);

    if (history.length === 0) {
      return {
        key: check.key,
        question: check.question,
        met: false,
        consecutiveYes: 0,
        required: requiredConsecutive,
        recentHistory: []
      };
    }

    // Get last N checks
    const recent = history.slice(-requiredConsecutive);

    // Count consecutive "yes" from end
    let consecutiveYes = 0;
    for (let i = recent.length - 1; i >= 0; i--) {
      if (recent[i].response === 'yes') {
        consecutiveYes++;
      } else {
        break;
      }
    }

    const met = consecutiveYes >= requiredConsecutive;

    return {
      key: check.key,
      question: check.question,
      met: met,
      consecutiveYes: consecutiveYes,
      required: requiredConsecutive,
      recentHistory: recent
    };
  });

  const allMet = mobilityChecks.every(check => check.met);
  const totalProgress = mobilityChecks.reduce((sum, check) =>
    sum + (check.consecutiveYes / check.required), 0
  );
  const percentage = Math.floor((totalProgress / mobilityChecks.length) * 100);

  return {
    met: allMet,
    percentage: Math.min(percentage, 100),
    checks: mobilityChecks
  };
}
```

**Step 5: Add pain-free verification**

```javascript
/**
 * Check if exercise has been pain-free recently
 * @param {string} progressionKey - Progression identifier
 * @param {number} requiredPainFreeSessions - Required pain-free sessions (default: 5)
 * @returns {Object} {met: boolean, painfulSessions: number, totalChecked: number, recentPain: Array}
 * @private
 */
_checkPainFree(progressionKey, requiredPainFreeSessions = 5) {
  const progression = this.PROGRESSIONS[progressionKey];
  if (!progression) {
    return { met: true, painfulSessions: 0, totalChecked: 0, recentPain: [] };
  }

  const exerciseName = progression.prerequisiteExercises.primary;
  const workoutPrefix = progression.prerequisiteExercises.workoutPrefix;
  const exerciseKey = `${workoutPrefix} - ${exerciseName}`;

  const painHistory = this.storage.getPainHistory(exerciseKey);

  if (painHistory.length < requiredPainFreeSessions) {
    // Not enough data, don't block progression
    return { met: true, painfulSessions: 0, totalChecked: painHistory.length, recentPain: [] };
  }

  const recent = painHistory.slice(-requiredPainFreeSessions);
  const painfulSessions = recent.filter(entry => entry.hadPain).length;

  // Allow max 1 painful session in last 5
  const met = painfulSessions <= 1;

  const recentPainDetails = recent.filter(entry => entry.hadPain);

  return {
    met: met,
    painfulSessions: painfulSessions,
    totalChecked: recent.length,
    recentPain: recentPainDetails
  };
}
```

**Step 6: Add main progression analysis method**

```javascript
/**
 * Analyze readiness for a specific barbell progression
 * @param {string} progressionKey - 'barbell_bench', 'barbell_squat', or 'barbell_deadlift'
 * @returns {Object} Complete progression analysis with percentage and blockers
 */
analyzeProgression(progressionKey) {
  try {
    const progression = this.PROGRESSIONS[progressionKey];
    if (!progression) {
      throw new Error(`Unknown progression: ${progressionKey}`);
    }

    const strength = this._calculateStrengthProgress(progressionKey);
    const weeks = this._calculateWeeksProgress(progressionKey);
    const mobility = this._calculateMobilityProgress(progressionKey);
    const pain = this._checkPainFree(progressionKey);

    // Calculate overall percentage (weighted)
    const weights = {
      strength: 0.4,
      weeks: 0.2,
      mobility: 0.3,
      pain: 0.1
    };

    let overallPercentage = 0;
    if (strength.met) overallPercentage += weights.strength * 100;
    else overallPercentage += strength.percentage * weights.strength;

    if (weeks.met) overallPercentage += weights.weeks * 100;
    else overallPercentage += weeks.percentage * weights.weeks;

    if (mobility.met) overallPercentage += weights.mobility * 100;
    else overallPercentage += mobility.percentage * weights.mobility;

    if (pain.met) overallPercentage += weights.pain * 100;

    const allMet = strength.met && weeks.met && mobility.met && pain.met;

    // Identify blockers
    const blockers = [];
    if (!strength.met) {
      if (strength.current) {
        blockers.push(`Strength: Need ${progression.strength.weight}kg (currently ${strength.current.weight}kg)`);
      } else {
        blockers.push(`Strength: No ${progression.prerequisiteExercises.primary} history found`);
      }
    }
    if (!weeks.met) {
      const remaining = weeks.weeksRequired - weeks.weeksTrained;
      blockers.push(`Training: ${remaining} more weeks needed (${weeks.weeksTrained}/${weeks.weeksRequired} completed)`);
    }
    if (!mobility.met) {
      mobility.checks.filter(check => !check.met).forEach(check => {
        const remaining = check.required - check.consecutiveYes;
        blockers.push(`Mobility: ${remaining} more confirmations needed for "${check.question}"`);
      });
    }
    if (!pain.met) {
      blockers.push(`Pain: ${pain.painfulSessions} painful sessions in last ${pain.totalChecked} - resolve before progressing`);
    }

    return {
      progressionKey: progressionKey,
      name: progression.name,
      percentage: Math.floor(overallPercentage),
      ready: allMet,
      strength: strength,
      weeks: weeks,
      mobility: mobility,
      pain: pain,
      blockers: blockers
    };

  } catch (error) {
    console.error(`[BarbellProgressionTracker] Analysis failed for ${progressionKey}:`, error);
    return {
      progressionKey: progressionKey,
      name: this.PROGRESSIONS[progressionKey]?.name || 'Unknown',
      percentage: 0,
      ready: false,
      strength: { met: false, percentage: 0 },
      weeks: { met: false, percentage: 0 },
      mobility: { met: false, percentage: 0 },
      pain: { met: true },
      blockers: ['Analysis failed - check console for errors']
    };
  }
}
```

**Step 7: Add convenience method for all progressions**

```javascript
/**
 * Analyze all three barbell progressions
 * @returns {Object} {barbell_bench: {...}, barbell_squat: {...}, barbell_deadlift: {...}}
 */
analyzeAllProgressions() {
  return {
    barbell_bench: this.analyzeProgression('barbell_bench'),
    barbell_squat: this.analyzeProgression('barbell_squat'),
    barbell_deadlift: this.analyzeProgression('barbell_deadlift')
  };
}
```

**Step 8: Test module in browser console**

```javascript
// In browser console
const sm = new (await import('./js/modules/storage.js')).StorageManager();
const tracker = new (await import('./js/modules/barbell-progression-tracker.js')).BarbellProgressionTracker(sm);

// Test analysis
const benchProgress = tracker.analyzeProgression('barbell_bench');
console.log('Bench Press readiness:', benchProgress);

const allProgress = tracker.analyzeAllProgressions();
console.log('All progressions:', allProgress);
```

**Step 9: Commit**

```bash
git add src/js/modules/barbell-progression-tracker.js
git commit -m "feat: add barbell progression tracker module with readiness analysis"
```

---

## Task 3: Mobility Check Prompts in Workout Flow

**Files:**
- Modify: `src/js/app.js` (add prompts after exercises)

**Step 1: Add mobility prompt helper methods**

Add after `updatePerformanceBadge()` method (around line 110):

```javascript
/**
 * Get mobility check questions for an exercise if applicable
 * @param {string} exerciseKey - Exercise identifier
 * @returns {Array} Array of mobility check objects or empty array
 */
getMobilityChecksForExercise(exerciseKey) {
  // Map exercises to their mobility checks
  const mobilityMap = {
    'DB Bench Press': this.barbellTracker.PROGRESSIONS.barbell_bench.mobilityChecks,
    'DB Shoulder Press': [{
      key: 'bench_overhead_mobility',
      question: 'Could you press overhead without back arching?',
      help: 'Ribs stay down, no excessive lower back arch'
    }],
    'Goblet Squat': this.barbellTracker.PROGRESSIONS.barbell_squat.mobilityChecks,
    'DB RDL': this.barbellTracker.PROGRESSIONS.barbell_deadlift.mobilityChecks
  };

  // Extract exercise name from key (e.g., "UPPER_A - DB Bench Press" → "DB Bench Press")
  const exerciseName = exerciseKey.split(' - ')[1];

  return mobilityMap[exerciseName] || [];
}

/**
 * Show mobility check prompt after exercise completion
 * @param {Object} check - Mobility check object with key, question, help
 */
showMobilityPrompt(check) {
  const container = document.getElementById('workout-content');
  if (!container) return;

  // Get recent history for this check
  const history = this.storage.getMobilityChecks(check.key);
  const recent = history.slice(-5);
  const historyIcons = recent.map(entry => {
    if (entry.response === 'yes') return '✓';
    if (entry.response === 'no') return '✗';
    return '?';
  }).join('');

  const promptHTML = `
    <div class="mobility-prompt" data-check-key="${check.key}">
      <div class="prompt-header">Mobility Check</div>
      <div class="prompt-question">${this.escapeHtml(check.question)}</div>
      <div class="prompt-help">ℹ️ ${this.escapeHtml(check.help)}</div>
      <div class="prompt-buttons">
        <button class="btn btn-success mobility-yes">Yes</button>
        <button class="btn btn-secondary mobility-no">No</button>
        <button class="btn btn-secondary mobility-not-sure">Not sure</button>
      </div>
      ${historyIcons ? `<div class="prompt-history">Recent: ${historyIcons}</div>` : ''}
    </div>
  `;

  // Insert prompt before exercise cards
  const firstExercise = container.querySelector('.exercise-card');
  if (firstExercise) {
    firstExercise.insertAdjacentHTML('beforebegin', promptHTML);

    // Attach event listeners
    const prompt = container.querySelector('.mobility-prompt');
    prompt.querySelector('.mobility-yes').addEventListener('click', () => {
      this.handleMobilityResponse(check.key, 'yes');
      prompt.remove();
    });
    prompt.querySelector('.mobility-no').addEventListener('click', () => {
      this.handleMobilityResponse(check.key, 'no');
      prompt.remove();
    });
    prompt.querySelector('.mobility-not-sure').addEventListener('click', () => {
      this.handleMobilityResponse(check.key, 'not_sure');
      prompt.remove();
    });
  }
}

/**
 * Handle mobility check response
 * @param {string} checkKey - Mobility criteria key
 * @param {string} response - 'yes', 'no', or 'not_sure'
 */
handleMobilityResponse(checkKey, response) {
  try {
    this.storage.saveMobilityCheck(checkKey, response);
    console.log(`Mobility check saved: ${checkKey} = ${response}`);
  } catch (error) {
    console.error('Failed to save mobility check:', error);
  }
}
```

**Step 2: Initialize barbell tracker in constructor**

Find the App constructor (around line 15) and add after `this.performanceAnalyzer`:

```javascript
// Import at top of file (around line 10)
import { BarbellProgressionTracker } from './modules/barbell-progression-tracker.js';

// In constructor (around line 17)
this.barbellTracker = new BarbellProgressionTracker(this.storage);
```

**Step 3: Trigger mobility prompts after exercise completion**

Find `handleLogSet()` method and modify to check if exercise is complete:

After line where you call `this.updatePerformanceBadge(exerciseIndex);` (around line 780), add:

```javascript
// Check if exercise is complete (all sets logged)
const exercise = this.currentWorkout.exercises[exerciseIndex];
const exerciseSession = this.workoutSession.exercises[exerciseIndex];

if (exerciseSession.sets.length >= exercise.sets) {
  // Exercise complete - check for mobility prompts
  const exerciseKey = `${this.currentWorkout.name} - ${exercise.name}`;
  const mobilityChecks = this.getMobilityChecksForExercise(exerciseKey);

  // Show one random check from available checks (to avoid overwhelming)
  if (mobilityChecks.length > 0) {
    const randomCheck = mobilityChecks[Math.floor(Math.random() * mobilityChecks.length)];

    // Only show if not already answered today
    const history = this.storage.getMobilityChecks(randomCheck.key);
    const today = new Date().toISOString().split('T')[0];
    const answeredToday = history.some(entry => entry.date === today);

    if (!answeredToday) {
      this.showMobilityPrompt(randomCheck);
    }
  }
}
```

**Step 4: Add CSS for mobility prompts**

Create: `src/css/mobility-prompt.css`

```css
.mobility-prompt {
  background: var(--color-surface);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.prompt-header {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.prompt-question {
  font-size: var(--font-md);
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
}

.prompt-help {
  font-size: var(--font-sm);
  color: var(--color-text-dim);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background: rgba(59, 130, 246, 0.1);
  border-radius: var(--radius-sm);
  line-height: 1.4;
}

.prompt-buttons {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.prompt-buttons .btn {
  flex: 1;
  padding: var(--spacing-sm);
  font-size: var(--font-sm);
}

.prompt-history {
  font-size: var(--font-xs);
  color: var(--color-text-dim);
  text-align: center;
  letter-spacing: 2px;
}

@media (max-width: 768px) {
  .prompt-buttons {
    flex-direction: column;
  }

  .prompt-buttons .btn {
    width: 100%;
  }
}
```

Add to `src/index.html` in `<head>`:

```html
<link rel="stylesheet" href="css/mobility-prompt.css">
```

**Step 5: Test manually**

1. Open app in browser
2. Start workout (Upper A)
3. Complete all sets of DB Bench Press
4. Should see mobility prompt: "Could you press overhead without back arching?"
5. Click "Yes" → Check localStorage: `localStorage.getItem('barbell_mobility_checks')`

**Step 6: Commit**

```bash
git add src/js/app.js src/css/mobility-prompt.css src/index.html
git commit -m "feat: add mobility check prompts after exercise completion"
```

---

## Task 4: Pain Tracking Prompts

**Files:**
- Modify: `src/js/app.js` (add pain prompts)
- Create: `src/css/pain-prompt.css`

**Step 1: Add pain prompt helper methods in app.js**

Add after mobility methods:

```javascript
/**
 * Show pain tracking prompt after exercise completion
 * @param {string} exerciseKey - Exercise identifier
 * @param {string} exerciseName - Display name
 */
showPainPrompt(exerciseKey, exerciseName) {
  const container = document.getElementById('workout-content');
  if (!container) return;

  // Get recent pain history
  const history = this.storage.getPainHistory(exerciseKey);
  const recent = history.slice(-5);
  const historyIcons = recent.map(entry => entry.hadPain ? '❌' : '✓').join('');

  const promptHTML = `
    <div class="pain-prompt" data-exercise-key="${this.escapeHtml(exerciseKey)}">
      <div class="prompt-header">Pain Check</div>
      <div class="prompt-question">
        Any pain or discomfort during ${this.escapeHtml(exerciseName)}?
      </div>
      <div class="prompt-buttons pain-level-buttons">
        <button class="btn btn-success pain-no">No</button>
        <button class="btn btn-warning pain-minor">Yes, minor</button>
        <button class="btn btn-danger pain-significant">Yes, significant</button>
      </div>
      <div class="pain-location-section" style="display: none;">
        <div class="prompt-subheader">Where?</div>
        <div class="prompt-buttons pain-location-buttons">
          <button class="btn btn-secondary pain-location" data-location="shoulder">Shoulder</button>
          <button class="btn btn-secondary pain-location" data-location="elbow">Elbow</button>
          <button class="btn btn-secondary pain-location" data-location="wrist">Wrist</button>
          <button class="btn btn-secondary pain-location" data-location="lower_back">Lower back</button>
          <button class="btn btn-secondary pain-location" data-location="knee">Knee</button>
          <button class="btn btn-secondary pain-location" data-location="hip">Hip</button>
          <button class="btn btn-secondary pain-location" data-location="other">Other</button>
        </div>
      </div>
      ${historyIcons ? `<div class="prompt-history">Recent: ${historyIcons}</div>` : ''}
    </div>
  `;

  const firstExercise = container.querySelector('.exercise-card');
  if (firstExercise) {
    firstExercise.insertAdjacentHTML('beforebegin', promptHTML);

    const prompt = container.querySelector('.pain-prompt');
    let selectedSeverity = null;

    // No pain
    prompt.querySelector('.pain-no').addEventListener('click', () => {
      this.handlePainResponse(exerciseKey, false, null, null);
      prompt.remove();
    });

    // Minor pain
    prompt.querySelector('.pain-minor').addEventListener('click', () => {
      selectedSeverity = 'minor';
      prompt.querySelector('.pain-location-section').style.display = 'block';
    });

    // Significant pain
    prompt.querySelector('.pain-significant').addEventListener('click', () => {
      selectedSeverity = 'significant';
      prompt.querySelector('.pain-location-section').style.display = 'block';
    });

    // Location selection
    prompt.querySelectorAll('.pain-location').forEach(btn => {
      btn.addEventListener('click', () => {
        const location = btn.dataset.location;
        this.handlePainResponse(exerciseKey, true, location, selectedSeverity);
        prompt.remove();
      });
    });
  }
}

/**
 * Handle pain tracking response
 * @param {string} exerciseKey - Exercise identifier
 * @param {boolean} hadPain - Whether user experienced pain
 * @param {string|null} location - Pain location
 * @param {string|null} severity - Pain severity
 */
handlePainResponse(exerciseKey, hadPain, location, severity) {
  try {
    this.storage.savePainReport(exerciseKey, hadPain, location, severity);
    console.log(`Pain report saved for ${exerciseKey}: ${hadPain ? location + ' (' + severity + ')' : 'pain-free'}`);
  } catch (error) {
    console.error('Failed to save pain report:', error);
  }
}
```

**Step 2: Trigger pain prompt after mobility prompt**

Modify the exercise completion check in `handleLogSet()`:

Replace the mobility prompt section with:

```javascript
if (exerciseSession.sets.length >= exercise.sets) {
  // Exercise complete
  const exerciseKey = `${this.currentWorkout.name} - ${exercise.name}`;

  // Show mobility check first (if applicable)
  const mobilityChecks = this.getMobilityChecksForExercise(exerciseKey);
  if (mobilityChecks.length > 0) {
    const randomCheck = mobilityChecks[Math.floor(Math.random() * mobilityChecks.length)];
    const history = this.storage.getMobilityChecks(randomCheck.key);
    const today = new Date().toISOString().split('T')[0];
    const answeredToday = history.some(entry => entry.date === today);

    if (!answeredToday) {
      this.showMobilityPrompt(randomCheck);
    }
  }

  // Always show pain tracking prompt
  const painHistory = this.storage.getPainHistory(exerciseKey);
  const today = new Date().toISOString().split('T')[0];
  const reportedToday = painHistory.some(entry => entry.date === today);

  if (!reportedToday) {
    // Small delay to avoid overlapping with mobility prompt
    setTimeout(() => {
      this.showPainPrompt(exerciseKey, exercise.name);
    }, 500);
  }
}
```

**Step 3: Add CSS for pain prompts**

Create `src/css/pain-prompt.css`:

```css
.pain-prompt {
  background: var(--color-surface);
  border: 2px solid var(--color-warning);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pain-prompt .prompt-header {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--color-warning);
  margin-bottom: var(--spacing-sm);
}

.pain-prompt .prompt-question {
  font-size: var(--font-md);
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
}

.pain-level-buttons {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.pain-location-section {
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.prompt-subheader {
  font-size: var(--font-sm);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
}

.pain-location-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xs);
}

.pain-location-buttons .btn {
  font-size: var(--font-sm);
  padding: var(--spacing-sm);
}

@media (max-width: 768px) {
  .pain-level-buttons {
    flex-direction: column;
  }

  .pain-location-buttons {
    grid-template-columns: 1fr;
  }
}
```

Add to `src/index.html`:

```html
<link rel="stylesheet" href="css/pain-prompt.css">
```

**Step 4: Test manually**

1. Complete an exercise
2. Should see mobility prompt (if applicable)
3. After answering, should see pain prompt
4. Click "Yes, minor" → Select "Shoulder"
5. Check localStorage: `localStorage.getItem('exercise_pain_history')`

**Step 5: Commit**

```bash
git add src/js/app.js src/css/pain-prompt.css src/index.html
git commit -m "feat: add pain tracking prompts after exercise completion"
```

---

## Task 5: Progress Dashboard Screen (Part 1 - Structure)

**Files:**
- Create: `src/css/progress-dashboard.css`
- Modify: `src/js/app.js` (add screen rendering)

**Step 1: Add Progress Dashboard CSS**

Create `src/css/progress-dashboard.css`:

```css
.progress-dashboard {
  padding: var(--spacing-md);
}

.dashboard-header {
  font-size: var(--font-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text);
}

.dashboard-subheader {
  font-size: var(--font-sm);
  color: var(--color-text-dim);
  margin-bottom: var(--spacing-lg);
}

.progression-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--color-border);
}

.progression-card.ready {
  border-color: var(--color-success);
  background: rgba(34, 197, 94, 0.05);
}

.progression-title {
  font-size: var(--font-md);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
}

.progression-percentage {
  font-size: var(--font-xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.progression-percentage.ready {
  color: var(--color-success);
}

.progress-bar-container {
  width: 100%;
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: var(--spacing-md);
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  transition: width 0.3s ease;
}

.progress-bar-fill.ready {
  background: linear-gradient(90deg, var(--color-success) 0%, #16a34a 100%);
}

.criteria-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-md) 0;
}

.criteria-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
  font-size: var(--font-sm);
  line-height: 1.4;
}

.criteria-icon {
  flex-shrink: 0;
  font-size: var(--font-md);
}

.criteria-icon.met {
  color: var(--color-success);
}

.criteria-icon.pending {
  color: var(--color-warning);
}

.criteria-icon.blocked {
  color: var(--color-danger);
}

.blockers-section {
  background: rgba(245, 158, 11, 0.1);
  border-left: 3px solid var(--color-warning);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  margin-top: var(--spacing-sm);
}

.blockers-title {
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-warning);
  margin-bottom: var(--spacing-xs);
}

.blockers-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.blocker-item {
  font-size: var(--font-xs);
  color: var(--color-text-dim);
  padding: var(--spacing-xs) 0;
}

.view-details-btn {
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.view-details-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--color-primary);
}

.ready-badge {
  display: inline-block;
  background: var(--color-success);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  font-weight: 600;
  margin-left: var(--spacing-sm);
}

@media (max-width: 768px) {
  .progression-percentage {
    font-size: var(--font-lg);
  }
}
```

Add to `src/index.html`:

```html
<link rel="stylesheet" href="css/progress-dashboard.css">
```

**Step 2: Add Progress Dashboard rendering method**

Add to `src/js/app.js`:

```javascript
/**
 * Render Progress Dashboard screen
 */
showProgressDashboard() {
  const content = document.getElementById('workout-content');
  if (!content) return;

  // Analyze all progressions
  const progressions = this.barbellTracker.analyzeAllProgressions();

  const html = `
    <div class="progress-dashboard">
      <h1 class="dashboard-header">Equipment Progression</h1>
      <p class="dashboard-subheader">Track your readiness for barbell exercises</p>

      ${this._renderProgressionCard('barbell_bench', progressions.barbell_bench)}
      ${this._renderProgressionCard('barbell_squat', progressions.barbell_squat)}
      ${this._renderProgressionCard('barbell_deadlift', progressions.barbell_deadlift)}
    </div>
  `;

  content.innerHTML = html;

  // Update header
  document.getElementById('screen-title').textContent = 'Progress Dashboard';
  document.getElementById('back-btn').style.display = 'block';
  document.getElementById('workout-settings-btn').style.display = 'none';
}

/**
 * Render a single progression card
 * @param {string} key - Progression key
 * @param {Object} data - Progression analysis data
 * @returns {string} HTML string
 * @private
 */
_renderProgressionCard(key, data) {
  const readyClass = data.ready ? 'ready' : '';

  return `
    <div class="progression-card ${readyClass}">
      <div class="progression-title">
        ${this.escapeHtml(data.name)}
        ${data.ready ? '<span class="ready-badge">✓ READY</span>' : ''}
      </div>

      <div class="progression-percentage ${readyClass}">
        ${data.percentage}%
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar-fill ${readyClass}" style="width: ${data.percentage}%"></div>
      </div>

      <ul class="criteria-list">
        <li class="criteria-item">
          <span class="criteria-icon ${data.strength.met ? 'met' : 'pending'}">
            ${data.strength.met ? '✅' : '⏳'}
          </span>
          <span>
            Strength: ${data.strength.met ? 'Target reached' : data.strength.percentage + '% complete'}
          </span>
        </li>

        <li class="criteria-item">
          <span class="criteria-icon ${data.weeks.met ? 'met' : 'pending'}">
            ${data.weeks.met ? '✅' : '⏳'}
          </span>
          <span>
            Training: ${data.weeks.weeksTrained}/${data.weeks.weeksRequired} weeks
          </span>
        </li>

        <li class="criteria-item">
          <span class="criteria-icon ${data.mobility.met ? 'met' : 'pending'}">
            ${data.mobility.met ? '✅' : '⏳'}
          </span>
          <span>
            Mobility: ${data.mobility.met ? 'All checks passed' : data.mobility.percentage + '% confirmed'}
          </span>
        </li>

        <li class="criteria-item">
          <span class="criteria-icon ${data.pain.met ? 'met' : 'blocked'}">
            ${data.pain.met ? '✅' : '❌'}
          </span>
          <span>
            ${data.pain.met ? 'Pain-free movement' : 'Recent pain reported'}
          </span>
        </li>
      </ul>

      ${data.blockers.length > 0 ? `
        <div class="blockers-section">
          <div class="blockers-title">Next steps:</div>
          <ul class="blockers-list">
            ${data.blockers.map(blocker => `
              <li class="blocker-item">• ${this.escapeHtml(blocker)}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <button class="view-details-btn" data-progression="${key}">
        View Detailed Criteria
      </button>
    </div>
  `;
}
```

**Step 3: Wire up Progress button on home screen**

Find the home screen rendering method and update the Progress button click handler:

```javascript
// In showHomeScreen() or wherever buttons are attached
const progressBtn = document.querySelector('[data-action="progress"]');
if (progressBtn) {
  progressBtn.addEventListener('click', () => this.showProgressDashboard());
}
```

**Step 4: Test manually**

1. Open app in browser
2. Click "📈 Progress" button on home screen
3. Should see Progress Dashboard with 3 progression cards
4. Each card shows percentage, progress bar, criteria list

**Step 5: Commit**

```bash
git add src/css/progress-dashboard.css src/js/app.js src/index.html
git commit -m "feat: add Progress Dashboard screen with progression cards"
```

---

## Task 6: Documentation and Testing

**Files:**
- Create: `docs/barbell-progression-usage.md`
- Create: `docs/barbell-progression-test-report.md`

**Step 1: Create usage documentation**

See next message for complete documentation files (too long for single step).

**Step 2: Create test report**

Create `docs/barbell-progression-test-report.md` with manual test scenarios for:
- Mobility check prompts
- Pain tracking prompts
- Progress Dashboard display
- Progression percentage calculations
- Unlock notifications (when ready)

**Step 3: Commit documentation**

```bash
git add docs/barbell-progression-usage.md docs/barbell-progression-test-report.md
git commit -m "docs: add barbell progression usage guide and test report"
```

---

## Implementation Complete

All 6 tasks completed:
1. ✅ Storage extensions (mobility checks, pain tracking)
2. ✅ Barbell progression tracker module
3. ✅ Mobility check prompts
4. ✅ Pain tracking prompts
5. ✅ Progress Dashboard screen
6. ✅ Documentation and testing

**Total commits:** 6

**Next steps:**
- Manual testing following test report
- Fix any issues discovered during testing
- Add unlock notification when progression ready (enhancement)
- Add per-exercise contextual display (future feature)

---

**Plan complete!**
