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
   * Gets all exercise keys from localStorage
   * @returns {Array<string>} Array of exercise keys (without prefix)
   */
  getAllExerciseKeys() {
    try {
      const storage = this.storage;
      // Handle both browser localStorage and test mock (which has .data property)
      const allKeys = storage.data ? Object.keys(storage.data) : Object.keys(storage);
      return allKeys
        .filter(key => key.startsWith(KEYS.EXERCISE_HISTORY_PREFIX))
        .map(key => key.replace(KEYS.EXERCISE_HISTORY_PREFIX, ''));
    } catch (error) {
      console.error('Failed to get exercise keys, returning empty array:', error);
      return [];
    }
  }

  /**
   * Retrieves deload state from localStorage
   * @returns {Object} Deload state object
   */
  getDeloadState() {
    const data = this.storage.getItem('build_deload_state');
    if (!data) {
      return {
        active: false,
        deloadType: null,  // 'standard' | 'light' | 'active_recovery'
        startDate: null,
        endDate: null,
        lastDeloadDate: null,
        weeksSinceDeload: 0,
        dismissedCount: 0
      };
    }

    try {
      const parsed = JSON.parse(data);
      // Ensure all fields exist (backward compatibility)
      return {
        active: parsed.active || false,
        deloadType: parsed.deloadType || null,
        startDate: parsed.startDate || null,
        endDate: parsed.endDate || null,
        lastDeloadDate: parsed.lastDeloadDate || null,
        weeksSinceDeload: parsed.weeksSinceDeload || 0,
        dismissedCount: parsed.dismissedCount || 0
      };
    } catch (error) {
      console.error('Failed to parse deload state, returning default:', error);
      return {
        active: false,
        deloadType: null,
        startDate: null,
        endDate: null,
        lastDeloadDate: null,
        weeksSinceDeload: 0,
        dismissedCount: 0
      };
    }
  }

  /**
   * Saves deload state to localStorage
   * @param {Object} deloadState - Deload state object
   * @throws {Error} If deloadState is invalid or storage fails
   */
  saveDeloadState(deloadState) {
    if (!deloadState || typeof deloadState !== 'object') {
      throw new Error('Invalid deloadState: must be an object');
    }

    try {
      const serialized = JSON.stringify(deloadState);
      this.storage.setItem('build_deload_state', serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to save deload state: ${error.message}`);
    }
  }

  /**
   * Save a mobility check response
   * @param {string} criteriaKey - Mobility criteria identifier (e.g., 'bench_overhead_mobility')
   * @param {'yes'|'no'|'not_sure'} response - User's response
   */
  saveMobilityCheck(criteriaKey, response) {
    // Input validation
    if (!criteriaKey || typeof criteriaKey !== 'string') {
      throw new Error('Invalid criteria key: must be a non-empty string');
    }
    if (!['yes', 'no', 'not_sure'].includes(response)) {
      throw new Error('Invalid response: must be yes, no, or not_sure');
    }

    const allChecks = this.getMobilityChecksData();
    if (!allChecks[criteriaKey]) {
      allChecks[criteriaKey] = [];
    }
    allChecks[criteriaKey].push({
      date: new Date().toISOString().split('T')[0],
      response: response
    });

    // Limit to last 10 entries
    if (allChecks[criteriaKey].length > 10) {
      allChecks[criteriaKey] = allChecks[criteriaKey].slice(-10);
    }

    try {
      const serialized = JSON.stringify(allChecks);
      this.storage.setItem('barbell_mobility_checks', serialized);
    } catch (error) {
      console.error('Failed to save mobility check:', error);
    }
  }

  /**
   * Get mobility check history for a criteria
   * @param {string} criteriaKey - Mobility criteria identifier
   * @returns {Array<{date: string, response: string}>} Array of check records
   */
  getMobilityChecks(criteriaKey) {
    const allChecks = this.getMobilityChecksData();
    return allChecks[criteriaKey] || [];
  }

  /**
   * Helper method to get all mobility checks data with error handling
   * @private
   * @returns {Object} Parsed mobility checks data or empty object
   */
  getMobilityChecksData() {
    const data = this.storage.getItem('barbell_mobility_checks');
    if (!data) {
      return {};
    }

    try {
      const parsed = JSON.parse(data);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (error) {
      console.error('Failed to parse mobility checks data, returning empty object:', error);
      return {};
    }
  }

  /**
   * Save a pain report for an exercise
   * @param {string} exerciseKey - Full exercise key (e.g., 'UPPER_A - DB Bench Press')
   * @param {boolean} hadPain - Whether user experienced pain
   * @param {string|null} location - Pain location (e.g., 'shoulder', 'elbow')
   * @param {'minor'|'significant'|null} severity - Pain severity
   */
  savePainReport(exerciseKey, hadPain, location, severity) {
    // Input validation
    if (!exerciseKey || typeof exerciseKey !== 'string') {
      throw new Error('Invalid exercise key: must be a non-empty string');
    }
    if (typeof hadPain !== 'boolean') {
      throw new Error('hadPain must be boolean');
    }
    if (severity !== null && !['minor', 'significant'].includes(severity)) {
      throw new Error('Invalid severity: must be minor, significant, or null');
    }

    const allPain = this.getPainHistoryData();
    if (!allPain[exerciseKey]) {
      allPain[exerciseKey] = [];
    }
    allPain[exerciseKey].push({
      date: new Date().toISOString().split('T')[0],
      hadPain: hadPain,
      location: location,
      severity: severity
    });

    // Limit to last 10 entries
    if (allPain[exerciseKey].length > 10) {
      allPain[exerciseKey] = allPain[exerciseKey].slice(-10);
    }

    try {
      const serialized = JSON.stringify(allPain);
      this.storage.setItem('exercise_pain_history', serialized);
    } catch (error) {
      console.error('Failed to save pain report:', error);
    }
  }

  /**
   * Get pain history for an exercise
   * @param {string} exerciseKey - Full exercise key
   * @returns {Array<{date: string, hadPain: boolean, location: string|null, severity: string|null}>}
   */
  getPainHistory(exerciseKey) {
    const allPain = this.getPainHistoryData();
    return allPain[exerciseKey] || [];
  }

  /**
   * Helper method to get all pain history data with error handling
   * @private
   * @returns {Object} Parsed pain history data or empty object
   */
  getPainHistoryData() {
    const data = this.storage.getItem('exercise_pain_history');
    if (!data) {
      return {};
    }

    try {
      const parsed = JSON.parse(data);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (error) {
      console.error('Failed to parse pain history data, returning empty object:', error);
      return {};
    }
  }

  /**
   * Get workout history by reconstructing from exercise histories
   * @param {string} workoutName - Workout name (e.g., 'UPPER_A')
   * @param {number} limit - Maximum number of workout sessions to return
   * @returns {Array} Array of workout session objects, sorted by date (most recent first)
   */
  getWorkoutHistory(workoutName, limit = 10) {
    if (!workoutName || typeof workoutName !== 'string') {
      return [];
    }

    try {
      // Get all exercise keys that belong to this workout
      const allKeys = this.getAllExerciseKeys();
      const workoutExerciseKeys = allKeys.filter(key => key.startsWith(workoutName + ' - '));

      if (workoutExerciseKeys.length === 0) {
        return [];
      }

      // Collect all workout sessions by date
      const sessionsByDate = new Map();

      workoutExerciseKeys.forEach(exerciseKey => {
        const history = this.getExerciseHistory(exerciseKey);
        const exerciseName = exerciseKey.replace(workoutName + ' - ', '');

        history.forEach(entry => {
          const dateKey = new Date(entry.date).toISOString().split('T')[0];

          if (!sessionsByDate.has(dateKey)) {
            sessionsByDate.set(dateKey, {
              date: entry.date,
              workoutName: workoutName,
              exercises: []
            });
          }

          sessionsByDate.get(dateKey).exercises.push({
            name: exerciseName,
            sets: entry.sets,
            startTime: entry.startTime,
            endTime: entry.endTime
          });
        });
      });

      // Convert to array and sort by date (most recent first)
      const sessions = Array.from(sessionsByDate.values())
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);

      return sessions;
    } catch (error) {
      console.error('Failed to get workout history:', error);
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
