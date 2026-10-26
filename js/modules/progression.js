/**
 * Double Progression Logic
 *
 * Weight increases ONLY when ALL sets hit the top of the rep range.
 */

import { daysBetween } from '../utils/date-utils.js';

// Plateau detection threshold (number of sessions at same weight)
const PLATEAU_THRESHOLD = 3;

/** Best set in a session for regression compare: highest weight, then highest reps */
function getBestSetFromSession(sets) {
  if (!sets || !Array.isArray(sets) || sets.length === 0) {
    return null;
  }
  return sets.reduce((best, set) => {
    if (!set || set.weight === undefined || set.weight === null || set.reps === undefined || set.reps === null) {
      return best;
    }
    if (!best) return set;
    if (set.weight > best.weight || (set.weight === best.weight && set.reps > best.reps)) {
      return set;
    }
    return best;
  }, null);
}

/**
 * Parse rep range to extract min and max values
 * Handles formats: '8-12', '30-60s', '10-12/side', '30s/side'
 */
function parseRepRange(repRange) {
  if (!repRange || typeof repRange !== 'string') {
    throw new Error('Invalid rep range: must be a non-empty string');
  }

  // Remove suffixes (/side, s) in the correct order
  let cleanRange = repRange.replace(/\/side/g, '').replace(/s/g, '');
  const parts = cleanRange.split('-');

  if (parts.length === 1) {
    // Single value like '30s/side'
    const value = Number(parts[0]);
    if (isNaN(value)) {
      throw new Error(`Invalid rep range format: ${repRange}`);
    }
    return { min: value, max: value };
  }

  const min = Number(parts[0]);
  const max = Number(parts[1]);

  if (isNaN(min) || isNaN(max)) {
    throw new Error(`Invalid rep range format: ${repRange}`);
  }

  if (min > max) {
    return { min: max, max: min };
  }

  return { min, max };
}

export function shouldIncreaseWeight(sets, exercise, phaseManager) {
  // Input validation
  if (!sets || !Array.isArray(sets) || sets.length === 0) {
    return false;
  }

  if (!exercise || typeof exercise !== 'object') {
    throw new Error('Invalid exercise: must be an object');
  }

  if (!exercise.repRange) {
    throw new Error('Exercise must have repRange');
  }

  // Check phase-aware progression behavior
  if (phaseManager) {
    try {
      const progressionBehavior = phaseManager.getProgressionBehavior();

      // Maintenance/Recovery blocks weight increases
      if (!progressionBehavior.allowWeightIncrease) {
        return false;
      }
    } catch (error) {
      console.error('[Progression] Error getting phase behavior:', error);
      // Continue with building phase logic (safe fallback)
    }
  }

  // Building phase - existing logic unchanged
  const { max } = parseRepRange(exercise.repRange);

  // All sets must hit max reps to trigger progression
  return sets.every(set => set.reps >= max);
}

export function getProgressionStatus(history, exercise, phaseManager) {
  if (!history || history.length === 0) return 'normal';

  const lastWorkout = history[history.length - 1];
  const readyToProgress = shouldIncreaseWeight(lastWorkout.sets, exercise, phaseManager);

  if (readyToProgress) return 'ready';

  // Regression vs previous session only (best set per session)
  if (history.length >= 2) {
    const currentWorkout = history[history.length - 1];
    const previousWorkout = history[history.length - 2];
    const current = getBestSetFromSession(currentWorkout?.sets);
    const previous = getBestSetFromSession(previousWorkout?.sets);
    if (current && previous) {
      const weightDropped = current.weight < previous.weight;
      const repDropPercent = previous.reps > 0 ? (previous.reps - current.reps) / previous.reps : 0;
      const significantRepDrop = current.weight === previous.weight && repDropPercent >= 0.25;
      if (weightDropped || significantRepDrop) {
        if (currentWorkout.date && previousWorkout.date &&
            daysBetween(currentWorkout.date, previousWorkout.date) >= 7) {
          return 'returning';
        }
        return 'regressed';
      }
    }
  }

  // Check for plateau (sessions at same weight)
  if (history.length >= PLATEAU_THRESHOLD) {
    const lastN = history.slice(-PLATEAU_THRESHOLD);
    // Add null safety check before accessing sets array
    const weights = lastN.map(w => {
      if (!w.sets || w.sets.length === 0) return null;
      const best = getBestSetFromSession(w.sets);
      return best?.weight ?? null;
    }).filter(w => w !== null);

    // Only check for plateau if we have valid weights
    if (weights.length === PLATEAU_THRESHOLD) {
      const allSameWeight = weights.every(w => w === weights[0]);
      if (allSameWeight) return 'plateau';
    }
  }

  return 'normal';
}

export function getNextWeight(currentWeight, increment, shouldProgress) {
  return shouldProgress ? currentWeight + increment : currentWeight;
}
