const ROTATION_ORDER = ['UPPER_A', 'LOWER_A', 'UPPER_B', 'LOWER_B'];

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

  getNextWorkout() {
    const rotation = this.storage.getRotation();
    return rotation.nextSuggested;
  }

  completeWorkout(workoutName) {
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
    const fullCycle = this.detectFullCycle(rotation.sequence);
    if (fullCycle) {
      rotation.cycleCount = (rotation.cycleCount || 0) + 1;
    }

    this.storage.saveRotation(rotation);
  }

  detectFullCycle(sequence) {
    // Detect when user completes full A→B→C→D rotation
    if (sequence.length < 4) return false;

    const recent4 = sequence.slice(-4);
    const uniqueWorkouts = new Set(recent4);

    // Full cycle = all 4 workouts completed
    return uniqueWorkouts.size === 4;
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
