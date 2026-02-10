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
 * @param {number} minWorkouts - Minimum workouts to consider plateau (default 3)
 * @returns {boolean} True if plateau detected
 *
 * @example
 * detectPlateau([
 *   { weight: 10, reps: 12, rir: 2, date: '2026-02-10' },
 *   { weight: 10, reps: 12, rir: 2, date: '2026-02-07' },
 *   { weight: 10, reps: 12, rir: 2, date: '2026-02-04' }
 * ])
 * // Returns: true
 */
export function detectPlateau(history, minWorkouts = 3) {
  // Null safety
  if (!history || !Array.isArray(history) || history.length < minWorkouts) {
    return false;
  }

  const recentWorkouts = history.slice(0, minWorkouts);
  const firstWeight = recentWorkouts[0]?.sets?.[0]?.weight;

  if (firstWeight === undefined || firstWeight === null) {
    return false;
  }

  // Check if all workouts used same weight
  return recentWorkouts.every(workout => {
    const workoutWeight = workout?.sets?.[0]?.weight;
    return workoutWeight === firstWeight;
  });
}

/**
 * Detect regression pattern (weight or reps decreased)
 *
 * @param {Array} history - Exercise history (most recent first)
 * @returns {boolean} True if regression detected
 *
 * @example
 * detectRegression([
 *   { weight: 10, reps: 8, rir: 3, date: '2026-02-10' }, // Current
 *   { weight: 12.5, reps: 10, rir: 2, date: '2026-02-07' } // Previous (better)
 * ])
 * // Returns: true
 */
export function detectRegression(history) {
  // Null safety
  if (!history || !Array.isArray(history) || history.length < 2) {
    return false;
  }

  const current = history[0]?.sets?.[0];
  const previous = history[1]?.sets?.[0];

  if (!current || !previous) {
    return false;
  }

  // Additional null safety for individual fields
  if (current.weight === undefined || current.weight === null ||
      previous.weight === undefined || previous.weight === null ||
      current.reps === undefined || current.reps === null ||
      previous.reps === undefined || previous.reps === null) {
    return false;
  }

  // Regression if weight dropped OR (same weight but reps dropped significantly)
  const weightDropped = current.weight < previous.weight;
  const repsDroppedSignificantly =
    current.weight === previous.weight && current.reps < previous.reps - 2;

  return weightDropped || repsDroppedSignificantly;
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
 * @param {string} exerciseName - Name of exercise
 * @returns {boolean} True if weight gap failure detected
 *
 * @example
 * detectWeightGapFailure([
 *   { weight: 12.5, reps: 6, rir: 0, date: '2026-02-10' }, // Failed
 *   { weight: 10, reps: 12, rir: 2, date: '2026-02-07' }    // Was successful
 * ], 'DB Lateral Raises')
 * // Returns: true
 */
export function detectWeightGapFailure(history, exerciseName) {
  // Null safety
  if (!history || !Array.isArray(history) || history.length < 2 || !exerciseName) {
    return false;
  }

  const current = history[0]?.sets?.[0];
  const previous = history[1]?.sets?.[0];

  if (!current || !previous) {
    return false;
  }

  // Additional null safety for individual fields
  if (current.weight === undefined || current.weight === null ||
      previous.weight === undefined || previous.weight === null ||
      current.reps === undefined || current.reps === null ||
      current.rir === undefined || current.rir === null) {
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

  return weightIncreased && failedMinReps && wentToFailure;
}

/**
 * Check if exercise history shows successful progression pattern
 *
 * @param {Array} history - Exercise history (most recent first)
 * @param {string} exerciseName - Name of exercise
 * @returns {boolean} True if successful progression
 */
export function detectSuccessfulProgression(history, exerciseName) {
  // Null safety
  if (!history || !Array.isArray(history) || history.length === 0 || !exerciseName) {
    return false;
  }

  const latest = history[0]?.sets?.[0];
  if (!latest) {
    return false;
  }

  // Additional null safety for individual fields
  if (latest.reps === undefined || latest.reps === null ||
      latest.rir === undefined || latest.rir === null) {
    return false;
  }

  const range = getRepRange(exerciseName);

  // Successful if hit top of range with good RIR (2-3)
  const hitTop = latest.reps >= range.max;
  const goodRIR = latest.rir >= 2 && latest.rir <= 3;

  return hitTop && goodRIR;
}
