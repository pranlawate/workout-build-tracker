/**
 * Double Progression Logic
 *
 * Weight increases ONLY when:
 * 1. ALL sets hit the top of the rep range
 * 2. ALL sets maintained RIR >= minimum target
 */

export function shouldIncreaseWeight(sets, exercise) {
  if (!sets || sets.length === 0) return false;

  const [min, max] = exercise.repRange.split('-').map(Number);
  const [rirMin, rirMax] = exercise.rirTarget.split('-').map(Number);

  // All sets must hit max reps
  const allSetsMaxReps = sets.every(set => set.reps >= max);

  // All sets must have RIR >= minimum target
  const allSetsGoodRIR = sets.every(set => set.rir >= rirMin);

  return allSetsMaxReps && allSetsGoodRIR;
}

export function getProgressionStatus(history, exercise) {
  if (!history || history.length === 0) return 'normal';

  const lastWorkout = history[history.length - 1];
  const readyToProgress = shouldIncreaseWeight(lastWorkout.sets, exercise);

  if (readyToProgress) return 'ready';

  // Check for plateau (3+ sessions at same weight)
  if (history.length >= 3) {
    const last3 = history.slice(-3);
    const weights = last3.map(w => w.sets[0].weight);
    const allSameWeight = weights.every(w => w === weights[0]);

    if (allSameWeight) return 'plateau';
  }

  return 'normal';
}

export function getNextWeight(currentWeight, increment, shouldProgress) {
  return shouldProgress ? currentWeight + increment : currentWeight;
}
