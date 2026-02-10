/**
 * Smart Auto-Progression System
 *
 * Analyzes exercise history and suggests next progression step.
 * Pattern-based decision engine with zero extra user input.
 *
 * @module smart-progression
 */

import { EXERCISE_METADATA, PAIN_LEVELS, SWAP_REASONS, findAlternative } from './exercise-metadata.js';
import { TEMPO_PHASES, getTempoGuidance } from './tempo-guidance.js';
import { getFormCues } from './form-cues.js';

/**
 * Rep range configuration per exercise
 * (from BUILD workout specification)
 */
const REP_RANGES = {
  // Most exercises: 8-12 reps
  default: { min: 8, max: 12 },
  // Time-based exercises
  planks: { min: 30, max: 60 }, // seconds
  // Add more specific ranges as needed
};

/**
 * Get rep range for an exercise
 *
 * @param {string} exerciseName - Name of exercise
 * @returns {{min: number, max: number}} Rep range
 */
function getRepRange(exerciseName) {
  if (exerciseName.toLowerCase().includes('plank')) {
    return REP_RANGES.planks;
  }
  return REP_RANGES.default;
}

/**
 * Check if exercise hit top of rep range
 *
 * @param {number} reps - Reps completed
 * @param {string} exerciseName - Name of exercise
 * @returns {boolean} True if at or above top of range
 */
export function hitTopOfReps(reps, exerciseName) {
  // Null safety
  if (reps === null || reps === undefined || !exerciseName) {
    return false;
  }

  const range = getRepRange(exerciseName);
  return reps >= range.max;
}

/**
 * Detect plateau pattern (same weight for 3+ workouts)
 *
 * @param {Array} history - Exercise history (most recent first)
 *   Each entry is a workout session with structure:
 *   {
 *     date: '2026-02-10T...',
 *     sets: [
 *       { weight: 10, reps: 12, rir: 2 },
 *       { weight: 10, reps: 11, rir: 2 }
 *     ],
 *     startTime: '...',
 *     endTime: '...'
 *   }
 * @param {number} minWorkouts - Minimum workouts to consider plateau (default 3)
 * @returns {boolean} True if plateau detected
 *
 * @example
 * detectPlateau([
 *   {
 *     date: '2026-02-10T...',
 *     sets: [{ weight: 10, reps: 12, rir: 2 }]
 *   },
 *   {
 *     date: '2026-02-07T...',
 *     sets: [{ weight: 10, reps: 12, rir: 2 }]
 *   },
 *   {
 *     date: '2026-02-04T...',
 *     sets: [{ weight: 10, reps: 12, rir: 2 }]
 *   }
 * ])
 * // Returns: true
 */
export function detectPlateau(history, minWorkouts = 3) {
  // Null safety
  if (!history || !Array.isArray(history) || history.length < minWorkouts) {
    console.warn('[SmartProgression] detectPlateau: Insufficient history data', {
      historyLength: history?.length,
      minRequired: minWorkouts
    });
    return false;
  }

  const recentWorkouts = history.slice(0, minWorkouts);

  // Get best set from first workout (highest weight, then reps)
  const firstWorkout = recentWorkouts[0];
  if (!firstWorkout?.sets || firstWorkout.sets.length === 0) {
    console.warn('[SmartProgression] detectPlateau: First workout has no sets');
    return false;
  }

  const firstBestSet = getBestSet(firstWorkout.sets);
  const firstWeight = firstBestSet?.weight;

  if (firstWeight === undefined || firstWeight === null) {
    console.warn('[SmartProgression] detectPlateau: Could not determine first workout weight');
    return false;
  }

  // Check if all workouts used same weight (compare best sets)
  return recentWorkouts.every(workout => {
    if (!workout?.sets || workout.sets.length === 0) {
      return false;
    }
    const bestSet = getBestSet(workout.sets);
    return bestSet?.weight === firstWeight;
  });
}

/**
 * Get best set from a workout (highest weight, then highest reps)
 *
 * @param {Array} sets - Array of sets from a workout
 * @returns {Object|null} Best set or null
 */
function getBestSet(sets) {
  if (!sets || !Array.isArray(sets) || sets.length === 0) {
    return null;
  }

  return sets.reduce((best, set) => {
    if (!set || set.weight === undefined || set.reps === undefined) {
      return best;
    }

    if (!best) {
      return set;
    }

    // Higher weight wins, or same weight with higher reps
    if (set.weight > best.weight ||
        (set.weight === best.weight && set.reps > best.reps)) {
      return set;
    }

    return best;
  }, null);
}

/**
 * Detect regression pattern (weight or reps decreased significantly)
 *
 * Aligned with PerformanceAnalyzer: 25%+ rep drop threshold
 *
 * @param {Array} history - Exercise history (most recent first)
 *   Each entry is a workout session with structure:
 *   {
 *     date: '2026-02-10T...',
 *     sets: [{ weight: 10, reps: 12, rir: 2 }, ...]
 *   }
 * @returns {boolean} True if regression detected
 *
 * @example
 * detectRegression([
 *   {
 *     date: '2026-02-10T...',
 *     sets: [{ weight: 10, reps: 8, rir: 3 }]
 *   },
 *   {
 *     date: '2026-02-07T...',
 *     sets: [{ weight: 12.5, reps: 10, rir: 2 }]
 *   }
 * ])
 * // Returns: true (weight dropped)
 */
export function detectRegression(history) {
  // Null safety
  if (!history || !Array.isArray(history) || history.length < 2) {
    console.warn('[SmartProgression] detectRegression: Insufficient history data', {
      historyLength: history?.length
    });
    return false;
  }

  const currentWorkout = history[0];
  const previousWorkout = history[1];

  if (!currentWorkout?.sets || currentWorkout.sets.length === 0) {
    console.warn('[SmartProgression] detectRegression: Current workout has no sets');
    return false;
  }

  if (!previousWorkout?.sets || previousWorkout.sets.length === 0) {
    console.warn('[SmartProgression] detectRegression: Previous workout has no sets');
    return false;
  }

  const current = getBestSet(currentWorkout.sets);
  const previous = getBestSet(previousWorkout.sets);

  if (!current || !previous) {
    console.warn('[SmartProgression] detectRegression: Could not determine best sets');
    return false;
  }

  // Additional null safety for individual fields
  if (current.weight === undefined || current.weight === null ||
      previous.weight === undefined || previous.weight === null ||
      current.reps === undefined || current.reps === null ||
      previous.reps === undefined || previous.reps === null) {
    console.warn('[SmartProgression] detectRegression: Missing weight or rep data');
    return false;
  }

  // Regression if weight dropped OR (same weight but reps dropped 25%+)
  const weightDropped = current.weight < previous.weight;

  // Align with PerformanceAnalyzer: 25% threshold
  const repDropPercent = previous.reps > 0 ? ((previous.reps - current.reps) / previous.reps) : 0;
  const significantRepDrop = current.weight === previous.weight && repDropPercent >= 0.25;

  if (weightDropped || significantRepDrop) {
    console.warn('[SmartProgression] detectRegression: Regression detected', {
      current: { weight: current.weight, reps: current.reps },
      previous: { weight: previous.weight, reps: previous.reps },
      weightDropped,
      repDropPercent: `${(repDropPercent * 100).toFixed(1)}%`
    });
  }

  return weightDropped || significantRepDrop;
}

/**
 * Check if can increase weight (next increment available)
 *
 * @param {number} currentWeight - Current weight used
 * @param {number} incrementSize - Standard increment (default 2.5kg)
 * @returns {boolean} True if weight increase is viable
 */
export function canIncreaseWeight(currentWeight, incrementSize = 2.5) {
  // Null safety
  if (currentWeight === null || currentWeight === undefined) {
    return false;
  }

  // Always allow weight increase (adaptive system learns from actual attempts)
  // The system will detect weight gap failures and suggest tempo progression
  return true;
}

/**
 * Detect weight gap failure (attempted increase but failed to hit min reps)
 *
 * @param {Array} history - Exercise history (most recent first)
 *   Each entry is a workout session with structure:
 *   {
 *     date: '2026-02-10T...',
 *     sets: [{ weight: 12.5, reps: 6, rir: 0 }, ...]
 *   }
 * @param {string} exerciseName - Name of exercise
 * @returns {boolean} True if weight gap failure detected
 *
 * @example
 * detectWeightGapFailure([
 *   {
 *     date: '2026-02-10T...',
 *     sets: [{ weight: 12.5, reps: 6, rir: 0 }]
 *   },
 *   {
 *     date: '2026-02-07T...',
 *     sets: [{ weight: 10, reps: 12, rir: 2 }]
 *   }
 * ], 'DB Lateral Raises')
 * // Returns: true
 */
export function detectWeightGapFailure(history, exerciseName) {
  // Null safety
  if (!history || !Array.isArray(history) || history.length < 2) {
    console.warn('[SmartProgression] detectWeightGapFailure: Insufficient history data', {
      historyLength: history?.length
    });
    return false;
  }

  // Type checking for exerciseName
  if (!exerciseName || typeof exerciseName !== 'string') {
    console.warn('[SmartProgression] detectWeightGapFailure: Invalid exerciseName', {
      exerciseName
    });
    return false;
  }

  const currentWorkout = history[0];
  const previousWorkout = history[1];

  if (!currentWorkout?.sets || currentWorkout.sets.length === 0) {
    console.warn('[SmartProgression] detectWeightGapFailure: Current workout has no sets');
    return false;
  }

  if (!previousWorkout?.sets || previousWorkout.sets.length === 0) {
    console.warn('[SmartProgression] detectWeightGapFailure: Previous workout has no sets');
    return false;
  }

  const current = getBestSet(currentWorkout.sets);
  const previous = getBestSet(previousWorkout.sets);

  if (!current || !previous) {
    console.warn('[SmartProgression] detectWeightGapFailure: Could not determine best sets');
    return false;
  }

  // Additional null safety for individual fields
  if (current.weight === undefined || current.weight === null ||
      previous.weight === undefined || previous.weight === null ||
      current.reps === undefined || current.reps === null ||
      current.rir === undefined || current.rir === null) {
    console.warn('[SmartProgression] detectWeightGapFailure: Missing required data fields');
    return false;
  }

  const range = getRepRange(exerciseName);

  // Weight gap failure if:
  // 1. Weight increased from previous
  // 2. Failed to hit minimum reps (below range.min)
  // 3. RIR was 0 (went to failure)
  const weightIncreased = current.weight > previous.weight;
  const failedMinReps = current.reps < range.min;
  const wentToFailure = current.rir === 0;

  const isFailure = weightIncreased && failedMinReps && wentToFailure;

  if (isFailure) {
    console.warn('[SmartProgression] detectWeightGapFailure: Weight gap failure detected', {
      exerciseName,
      current: { weight: current.weight, reps: current.reps, rir: current.rir },
      previous: { weight: previous.weight, reps: previous.reps },
      range
    });
  }

  return isFailure;
}

/**
 * Check if exercise history shows successful progression pattern
 *
 * @param {Array} history - Exercise history (most recent first)
 *   Each entry is a workout session with structure:
 *   {
 *     date: '2026-02-10T...',
 *     sets: [{ weight: 10, reps: 12, rir: 2 }, ...]
 *   }
 * @param {string} exerciseName - Name of exercise
 * @returns {boolean} True if successful progression
 *
 * @example
 * detectSuccessfulProgression([
 *   {
 *     date: '2026-02-10T...',
 *     sets: [{ weight: 10, reps: 12, rir: 2 }]
 *   }
 * ], 'DB Lateral Raises')
 * // Returns: true (hit 12 reps with RIR 2)
 */
export function detectSuccessfulProgression(history, exerciseName) {
  // Null safety
  if (!history || !Array.isArray(history) || history.length === 0) {
    console.warn('[SmartProgression] detectSuccessfulProgression: No history data');
    return false;
  }

  // Type checking for exerciseName
  if (!exerciseName || typeof exerciseName !== 'string') {
    console.warn('[SmartProgression] detectSuccessfulProgression: Invalid exerciseName', {
      exerciseName
    });
    return false;
  }

  const latestWorkout = history[0];

  if (!latestWorkout?.sets || latestWorkout.sets.length === 0) {
    console.warn('[SmartProgression] detectSuccessfulProgression: Latest workout has no sets');
    return false;
  }

  const latest = getBestSet(latestWorkout.sets);

  if (!latest) {
    console.warn('[SmartProgression] detectSuccessfulProgression: Could not determine best set');
    return false;
  }

  // Additional null safety for individual fields
  if (latest.reps === undefined || latest.reps === null ||
      latest.rir === undefined || latest.rir === null) {
    console.warn('[SmartProgression] detectSuccessfulProgression: Missing reps or RIR data');
    return false;
  }

  const range = getRepRange(exerciseName);

  // Successful if hit top of range with good RIR (2-3)
  const hitTop = latest.reps >= range.max;
  const goodRIR = latest.rir >= 2 && latest.rir <= 3;

  return hitTop && goodRIR;
}

/**
 * Suggest next weight increase
 *
 * @param {Array} history - Exercise history
 * @param {string} exerciseName - Name of exercise
 * @returns {{type: string, suggestedWeight: number, message: string, reason: string}|null}
 *
 * @example
 * suggestWeightIncrease([{
 *   date: '2026-02-10',
 *   sets: [{weight: 10, reps: 12, rir: 2}]
 * }], 'DB Lateral Raises')
 * // Returns: {
 * //   type: 'INCREASE_WEIGHT',
 * //   suggestedWeight: 12.5,
 * //   message: 'Try 12.5kg today (+2.5kg)',
 * //   reason: 'You hit top of rep range with good RIR'
 * // }
 */
export function suggestWeightIncrease(history, exerciseName) {
  if (!history || history.length === 0) {
    console.warn('[SmartProgression] suggestWeightIncrease: No history data');
    return null;
  }

  const latestWorkout = history[0];
  if (!latestWorkout || !latestWorkout.sets || latestWorkout.sets.length === 0) {
    console.warn('[SmartProgression] suggestWeightIncrease: No sets in latest workout');
    return null;
  }

  const bestSet = getBestSet(latestWorkout.sets);
  if (!bestSet || bestSet.weight === null || bestSet.weight === undefined) {
    console.warn('[SmartProgression] suggestWeightIncrease: Could not determine weight');
    return null;
  }

  // Standard increment: 2.5kg for dumbbells
  const increment = 2.5;
  const suggestedWeight = bestSet.weight + increment;

  return {
    type: 'INCREASE_WEIGHT',
    suggestedWeight: suggestedWeight,
    message: `Try ${suggestedWeight}kg today (+${increment}kg)`,
    reason: 'You hit top of rep range with good RIR'
  };
}

/**
 * Detect adaptive weight pattern (user's actual weight progression)
 * Learns from what user actually logs vs what system suggested
 *
 * @param {Array} history - Exercise history (minimum 3 workouts)
 * @returns {{pattern: string, averageIncrement: number, description: string}|null}
 *
 * @example
 * detectAdaptiveWeightPattern([
 *   {date: '2026-02-10', sets: [{weight: 25}]},  // User jumped 5kg
 *   {date: '2026-02-07', sets: [{weight: 20}]},  // User jumped 5kg
 *   {date: '2026-02-04', sets: [{weight: 15}]}   // User's pattern: 5kg jumps
 * ])
 * // Returns: {
 * //   pattern: 'large_jumps',
 * //   averageIncrement: 5,
 * //   description: 'User typically increases by 5kg (stronger than standard)'
 * // }
 */
export function detectAdaptiveWeightPattern(history) {
  if (!history || history.length < 3) {
    return null;
  }

  const increments = [];

  for (let i = 0; i < history.length - 1 && i < 5; i++) {
    const currentWeight = getBestSet(history[i]?.sets)?.weight;
    const previousWeight = getBestSet(history[i + 1]?.sets)?.weight;

    if (currentWeight && previousWeight && currentWeight > previousWeight) {
      increments.push(currentWeight - previousWeight);
    }
  }

  if (increments.length === 0) {
    return null;
  }

  const averageIncrement = increments.reduce((a, b) => a + b, 0) / increments.length;

  let pattern = 'standard';
  let description = 'User follows standard progression';

  if (averageIncrement > 3.5) {
    pattern = 'large_jumps';
    description = `User typically increases by ${averageIncrement.toFixed(1)}kg (stronger than standard)`;
  } else if (averageIncrement < 1.5) {
    pattern = 'small_steps';
    description = `User prefers ${averageIncrement.toFixed(1)}kg increments (conservative)`;
  }

  return {
    pattern,
    averageIncrement: parseFloat(averageIncrement.toFixed(1)),
    description
  };
}

/**
 * Suggest tempo progression for weight gap
 *
 * @param {string} exerciseKey - Full exercise key (e.g., 'UPPER_A - DB Lateral Raises')
 * @param {Array} history - Exercise history
 * @returns {{type: string, weight: number, tempoGuidance: object, message: string, reason: string}|null}
 *
 * @example
 * suggestTempoProgression('UPPER_A - DB Lateral Raises', [{
 *   date: '2026-02-10',
 *   sets: [{weight: 12.5, reps: 6, rir: 0}]  // Failed weight increase
 * }, {
 *   date: '2026-02-07',
 *   sets: [{weight: 10, reps: 12, rir: 2}]   // Was successful
 * }])
 * // Returns: {
 * //   type: 'TRY_TEMPO',
 * //   weight: 10,
 * //   tempoGuidance: { phase: 'eccentric', instruction: '...', why: '...', cue: '...' },
 * //   message: 'Try slow tempo at 10kg today',
 * //   reason: 'Build strength for 12.5kg - weight gap detected'
 * // }
 */
export function suggestTempoProgression(exerciseKey, history) {
  if (!exerciseKey || typeof exerciseKey !== 'string') {
    console.warn('[SmartProgression] suggestTempoProgression: Invalid exercise key');
    return null;
  }

  if (!history || history.length < 2) {
    console.warn('[SmartProgression] suggestTempoProgression: Insufficient history');
    return null;
  }

  // Extract exercise name from key (remove workout prefix)
  const exerciseName = exerciseKey.includes(' - ')
    ? exerciseKey.split(' - ')[1]
    : exerciseKey;

  // Detect weight gap failure
  const failed = detectWeightGapFailure(history, exerciseName);
  if (!failed) {
    return null;  // No weight gap issue
  }

  // Get the weight before the failed attempt
  const previousWorkout = history[1];
  const previousBestSet = getBestSet(previousWorkout?.sets);

  if (!previousBestSet) {
    console.warn('[SmartProgression] suggestTempoProgression: Could not determine previous weight');
    return null;
  }

  // Get tempo guidance for this exercise
  const tempoGuidance = getTempoGuidance(exerciseName);

  if (!tempoGuidance) {
    console.warn(`[SmartProgression] suggestTempoProgression: No tempo guidance for ${exerciseName}`);
    return null;
  }

  const currentWorkout = history[0];
  const currentBestSet = getBestSet(currentWorkout?.sets);
  const weightGap = currentBestSet?.weight - previousBestSet.weight;

  return {
    type: 'TRY_TEMPO',
    weight: previousBestSet.weight,
    tempoGuidance: tempoGuidance,
    message: `Try slow tempo at ${previousBestSet.weight}kg today`,
    reason: `Build strength for ${currentBestSet?.weight}kg - weight gap of ${weightGap}kg detected`
  };
}

/**
 * Suggest exercise alternative for pain
 *
 * @param {string} exerciseKey - Full exercise key
 * @param {object} painHistory - Pain history for exercise
 * @param {Array} workoutHistory - Exercise workout history
 * @returns {{type: string, alternative: string, originalWeight: number, suggestedWeight: number, message: string, reason: string, autoApply: boolean, urgency: string}|null}
 *
 * @example
 * handlePainBasedSuggestion('UPPER_A - DB Flat Bench Press', {
 *   latestPain: {intensity: 'moderate', date: '2026-02-10'},
 *   count: 2
 * }, workoutHistory)
 * // Returns: {
 * //   type: 'TRY_ALTERNATIVE',
 * //   alternative: 'Floor Press',
 * //   originalWeight: 20,
 * //   suggestedWeight: 16,
 * //   message: 'Switch to Floor Press at 16kg (was 20kg)',
 * //   reason: 'Moderate pain persists - safer variation',
 * //   autoApply: true,
 * //   urgency: 'high'
 * // }
 */
export function handlePainBasedSuggestion(exerciseKey, painHistory, workoutHistory) {
  if (!exerciseKey || !painHistory) {
    console.warn('[SmartProgression] handlePainBasedSuggestion: Missing required data');
    return null;
  }

  const exerciseName = exerciseKey.includes(' - ')
    ? exerciseKey.split(' - ')[1]
    : exerciseKey;

  const latestPain = painHistory.latestPain;
  if (!latestPain || !latestPain.intensity) {
    return null;
  }

  const intensity = latestPain.intensity;

  // Get current weight
  let currentWeight = null;
  if (workoutHistory && workoutHistory.length > 0) {
    const latestWorkout = workoutHistory[0];
    const bestSet = getBestSet(latestWorkout?.sets);
    currentWeight = bestSet?.weight || null;
  }

  // Mild pain: Warning only
  if (intensity === PAIN_LEVELS.MILD || intensity === 'mild') {
    return {
      type: 'PAIN_WARNING',
      message: `Mild ${latestPain.location || 'discomfort'} reported last workout`,
      reason: 'Monitor form, reduce weight if pain increases',
      urgency: 'low',
      autoApply: false
    };
  }

  // Moderate pain (first occurrence): Reduce weight
  const painCount = painHistory.count || 1;
  if ((intensity === PAIN_LEVELS.MODERATE || intensity === 'moderate') && painCount === 1) {
    const reducedWeight = currentWeight ? currentWeight * 0.8 : null;
    return {
      type: 'REDUCE_WEIGHT',
      suggestedWeight: reducedWeight,
      originalWeight: currentWeight,
      message: reducedWeight
        ? `Try ${reducedWeight}kg (was ${currentWeight}kg) - moderate pain detected`
        : 'Reduce weight by 20% - moderate pain detected',
      reason: 'Lighter weight may resolve issue',
      urgency: 'medium',
      autoApply: false
    };
  }

  // Moderate pain (persistent) OR Severe pain: Switch to alternative
  const alternative = findAlternative(exerciseName, SWAP_REASONS.PAIN, intensity);

  if (!alternative) {
    console.warn(`[SmartProgression] handlePainBasedSuggestion: No alternative found for ${exerciseName}`);
    return {
      type: 'PAIN_WARNING',
      message: `${intensity} pain detected - consider consulting trainer`,
      reason: 'No suitable alternative exercise available',
      urgency: intensity === PAIN_LEVELS.SEVERE || intensity === 'severe' ? 'critical' : 'high',
      autoApply: false
    };
  }

  const suggestedWeight = currentWeight ? currentWeight * 0.8 : null;
  const isSevere = intensity === PAIN_LEVELS.SEVERE || intensity === 'severe';

  return {
    type: isSevere ? 'IMMEDIATE_ALTERNATIVE' : 'TRY_ALTERNATIVE',
    alternative: alternative,
    originalWeight: currentWeight,
    suggestedWeight: suggestedWeight,
    message: isSevere
      ? `Severe pain - switching to ${alternative} immediately`
      : `Moderate pain persists - switch to ${alternative}`,
    reason: isSevere
      ? 'Consider rest day or medical consultation'
      : 'Safer variation for recovery',
    autoApply: true,
    urgency: isSevere ? 'critical' : 'high'
  };
}
