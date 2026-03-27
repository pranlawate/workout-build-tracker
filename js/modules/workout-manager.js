import { getWorkoutWithSelections } from './workouts.js';

const ROTATION_ORDER = ['UPPER_A', 'LOWER_A', 'UPPER_B', 'LOWER_B'];
const VALID_WORKOUT_NAMES = new Set(ROTATION_ORDER);

const MUSCLE_GROUPS = {
  UPPER_A: ['chest', 'back', 'shoulders'],
  UPPER_B: ['chest', 'back', 'shoulders'],
  LOWER_A: ['quads', 'hamstrings', 'glutes'],
  LOWER_B: ['quads', 'hamstrings', 'glutes']
};

const RECOVERY_HOURS = {
  chest: 48,
  back: 48,
  shoulders: 48,
  quads: 48,
  hamstrings: 48,
  glutes: 48
};

export class WorkoutManager {
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Resolved workout with user slot selections (for rotation UI and slot lookups).
   * @param {string} workoutName - e.g. UPPER_A
   * @returns {object|null} Workout object or null if unknown
   */
  getWorkout(workoutName) {
    if (!workoutName || !VALID_WORKOUT_NAMES.has(workoutName)) {
      console.warn('[WorkoutManager] Unknown or invalid workout name:', workoutName);
      return null;
    }
    return getWorkoutWithSelections(workoutName, this.storage);
  }

  getNextWorkout() {
    const rotation = this.storage.getRotation();
    return rotation.nextSuggested;
  }

  completeWorkout(workoutName) {
    if (!workoutName || !VALID_WORKOUT_NAMES.has(workoutName)) {
      console.warn('[WorkoutManager] completeWorkout ignored: invalid workout name:', workoutName);
      return;
    }
    const rotation = this.storage.getRotation();
    const currentIndex = ROTATION_ORDER.indexOf(workoutName);
    const nextIndex = (currentIndex + 1) % ROTATION_ORDER.length;
    const nextWorkout = ROTATION_ORDER[nextIndex];

    // Update rotation sequence
    rotation.lastWorkout = workoutName;
    rotation.lastDate = new Date().toISOString();
    rotation.nextSuggested = nextWorkout;
    rotation.sequence = [...(rotation.sequence || []), workoutName].slice(-12);
    rotation.currentStreak = (rotation.currentStreak || 0) + 1;

    // Increment cycle count when completing full rotation
    // Only increment when we COMPLETE a cycle (just finished LOWER_B) AND all 4 workouts present
    const fullCycle = this.detectFullCycle(rotation.sequence, workoutName);
    if (fullCycle) {
      rotation.cycleCount = (rotation.cycleCount || 0) + 1;
    }

    this.storage.saveRotation(rotation);
  }

  detectFullCycle(sequence, justCompletedWorkout) {
    // Detect when user completes full A→B→C→D rotation
    // Only count as cycle when we COMPLETE the last workout (LOWER_B)
    if (sequence.length < 4) return false;

    const recent4 = sequence.slice(-4);
    const uniqueWorkouts = new Set(recent4);

    // Full cycle = all 4 workouts completed AND just finished LOWER_B (end of rotation)
    const completedCycle = uniqueWorkouts.size === 4 && justCompletedWorkout === 'LOWER_B';
    return completedCycle;
  }

  checkMuscleRecovery(proposedWorkout, currentTime = new Date()) {
    const rotation = this.storage.getRotation();
    if (!rotation.lastWorkout || !rotation.lastDate) {
      return { warn: false, muscles: [] };
    }

    const lastDate = new Date(rotation.lastDate);
    const hoursSince = (currentTime - lastDate) / (1000 * 60 * 60);

    const lastMuscles = MUSCLE_GROUPS[rotation.lastWorkout];
    const proposedMuscles = MUSCLE_GROUPS[proposedWorkout];

    if (!lastMuscles || !Array.isArray(lastMuscles)) {
      console.warn('[WorkoutManager] Invalid rotation.lastWorkout, skipping recovery check:', rotation.lastWorkout);
      return { warn: false, muscles: [] };
    }
    if (!proposedMuscles || !Array.isArray(proposedMuscles)) {
      console.warn('[WorkoutManager] Unknown proposed workout for recovery check:', proposedWorkout);
      return { warn: false, muscles: [] };
    }

    const problematic = [];

    for (const muscle of proposedMuscles) {
      if (lastMuscles.includes(muscle)) {
        const hoursNeeded = RECOVERY_HOURS[muscle];
        if (hoursSince < hoursNeeded) {
          problematic.push({
            name: muscle,
            hoursNeeded: Math.round(hoursNeeded - hoursSince)
          });
        }
      }
    }

    return {
      warn: problematic.length > 0,
      muscles: problematic
    };
  }
}
