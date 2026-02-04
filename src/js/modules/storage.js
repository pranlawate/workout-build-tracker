const KEYS = {
  ROTATION: 'build_workout_rotation',
  EXERCISE_HISTORY_PREFIX: 'build_exercise_'
};

export class StorageManager {
  constructor() {
    this.storage = (typeof window !== 'undefined' ? window.localStorage : null) || localStorage;
  }

  // Workout Rotation
  saveRotation(rotation) {
    this.storage.setItem(KEYS.ROTATION, JSON.stringify(rotation));
  }

  getRotation() {
    const data = this.storage.getItem(KEYS.ROTATION);
    if (!data) {
      return {
        lastWorkout: null,
        lastDate: null,
        nextSuggested: 'UPPER_A'
      };
    }
    return JSON.parse(data);
  }

  // Exercise History
  saveExerciseHistory(exerciseKey, history) {
    // Limit to 8 most recent workouts
    const limited = history.slice(-8);
    const key = `${KEYS.EXERCISE_HISTORY_PREFIX}${exerciseKey}`;
    this.storage.setItem(key, JSON.stringify(limited));
  }

  getExerciseHistory(exerciseKey) {
    const key = `${KEYS.EXERCISE_HISTORY_PREFIX}${exerciseKey}`;
    const data = this.storage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // Clear all data (for testing)
  clearAll() {
    this.storage.clear();
  }
}
