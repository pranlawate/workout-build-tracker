/**
 * Double Progression Logic
 *
 * Weight increases ONLY when:
 * 1. ALL sets hit the top of the rep range
 * 2. ALL sets maintained RIR >= minimum target
 */

// Plateau detection threshold (number of sessions at same weight)
const PLATEAU_THRESHOLD = 3;

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

  return { min, max };
}

/**
 * Parse RIR target to extract min and max values
 * Handles formats: '2-3', '3'
 */
function parseRIRTarget(rirTarget) {
  if (!rirTarget || typeof rirTarget !== 'string') {
    throw new Error('Invalid RIR target: must be a non-empty string');
  }

  const parts = rirTarget.split('-');

  if (parts.length === 1) {
    // Single value like '3'
    const value = Number(parts[0]);
    if (isNaN(value)) {
      throw new Error(`Invalid RIR target format: ${rirTarget}`);
    }
    return { min: value, max: value };
  }

  const min = Number(parts[0]);
  const max = Number(parts[1]);

  if (isNaN(min) || isNaN(max)) {
    throw new Error(`Invalid RIR target format: ${rirTarget}`);
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
    throw new Error('Exercise must have repRange property');
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

  // Time-based exercises (no rirTarget): just check if all sets hit max duration
  const isTimeBased = /\d+s\b/.test(exercise.repRange);
  if (isTimeBased || !exercise.rirTarget) {
    return sets.every(set => set.reps >= max);
  }

  // Rep-based exercises: check reps AND RIR
  const { min: rirMin } = parseRIRTarget(exercise.rirTarget);

  // All sets must hit max reps
  const allSetsMaxReps = sets.every(set => set.reps >= max);

  // All sets must have RIR >= minimum target
  const allSetsGoodRIR = sets.every(set => set.rir >= rirMin);

  return allSetsMaxReps && allSetsGoodRIR;
}

export function getProgressionStatus(history, exercise, phaseManager) {
  if (!history || history.length === 0) return 'normal';

  const lastWorkout = history[history.length - 1];
  const readyToProgress = shouldIncreaseWeight(lastWorkout.sets, exercise, phaseManager);

  if (readyToProgress) return 'ready';

  // Check for plateau (sessions at same weight)
  if (history.length >= PLATEAU_THRESHOLD) {
    const lastN = history.slice(-PLATEAU_THRESHOLD);
    // Add null safety check before accessing sets array
    const weights = lastN.map(w => {
      if (!w.sets || w.sets.length === 0) return null;
      return w.sets[0].weight;
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
