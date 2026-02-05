const KEYS = {
  ROTATION: 'build_workout_rotation',
  EXERCISE_HISTORY_PREFIX: 'build_exercise_'
};

const MAX_HISTORY_LENGTH = 8;

/**
 * Manages localStorage operations for workout rotation and exercise history
 */
export class StorageManager {
  constructor() {
    this.storage = globalThis.localStorage;
  }

  /**
   * Saves workout rotation state to localStorage
   * @param {Object} rotation - Rotation object containing lastWorkout, lastDate, nextSuggested
   * @throws {Error} If rotation is invalid or storage fails
   */
  saveRotation(rotation) {
    if (!rotation || typeof rotation !== 'object') {
      throw new Error('Invalid rotation data: must be an object');
    }

    try {
      const serialized = JSON.stringify(rotation);
      this.storage.setItem(KEYS.ROTATION, serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to save rotation: ${error.message}`);
    }
  }

  /**
   * Retrieves workout rotation state from localStorage
   * @returns {Object} Rotation object with lastWorkout, lastDate, nextSuggested
   */
  getRotation() {
    const data = this.storage.getItem(KEYS.ROTATION);
    if (!data) {
      return {
        lastWorkout: null,
        lastDate: null,
        nextSuggested: 'UPPER_A',
        sequence: [],
        cycleCount: 0,
        currentStreak: 0,
        lastDeloadDate: null
      };
    }

    try {
      const parsed = JSON.parse(data);
      // Add new fields only if they don't exist (backward compatibility)
      if (parsed.sequence === undefined) {
        parsed.sequence = [];
      }
      if (parsed.cycleCount === undefined) {
        parsed.cycleCount = 0;
      }
      if (parsed.currentStreak === undefined) {
        parsed.currentStreak = 0;
      }
      if (parsed.lastDeloadDate === undefined) {
        parsed.lastDeloadDate = null;
      }
      return parsed;
    } catch (error) {
      console.error('Failed to parse rotation data, returning default:', error);
      return {
        lastWorkout: null,
        lastDate: null,
        nextSuggested: 'UPPER_A',
        sequence: [],
        cycleCount: 0,
        currentStreak: 0,
        lastDeloadDate: null
      };
    }
  }

  /**
   * Saves exercise history to localStorage, limiting to most recent workouts
   * @param {string} exerciseKey - Unique key for the exercise
   * @param {Array} history - Array of workout history objects
   * @throws {Error} If exerciseKey is invalid or storage fails
   */
  saveExerciseHistory(exerciseKey, history) {
    if (!exerciseKey || typeof exerciseKey !== 'string') {
      throw new Error('Invalid exerciseKey: must be a non-empty string');
    }

    if (!Array.isArray(history)) {
      throw new Error('Invalid history: must be an array');
    }

    // Limit to most recent workouts
    const limited = history.slice(-MAX_HISTORY_LENGTH);
    const key = `${KEYS.EXERCISE_HISTORY_PREFIX}${exerciseKey}`;

    try {
      const serialized = JSON.stringify(limited);
      this.storage.setItem(key, serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to save exercise history: ${error.message}`);
    }
  }

  /**
   * Retrieves exercise history from localStorage
   * @param {string} exerciseKey - Unique key for the exercise
   * @returns {Array} Array of workout history objects, or empty array if none exists
   * @throws {Error} If exerciseKey is invalid
   */
  getExerciseHistory(exerciseKey) {
    if (!exerciseKey || typeof exerciseKey !== 'string') {
      throw new Error('Invalid exerciseKey: must be a non-empty string');
    }

    const key = `${KEYS.EXERCISE_HISTORY_PREFIX}${exerciseKey}`;
    const data = this.storage.getItem(key);

    if (!data) {
      return [];
    }

    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(`Failed to parse exercise history for ${exerciseKey}, returning empty array:`, error);
      return [];
    }
  }

  /**
   * Clears all BUILD Tracker data from localStorage
   */
  clearAll() {
    this.storage.clear();
  }
}
