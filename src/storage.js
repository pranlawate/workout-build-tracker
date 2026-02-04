/**
 * Storage Module
 * Handles localStorage operations for workout data and history
 */

const WORKOUT_PREFIX = 'workout_';
const HISTORY_KEY = 'workout_history';
const MAX_HISTORY_ITEMS = 8;

/**
 * Save a workout to localStorage
 * @param {Object} workout - Workout object to save
 */
function saveWorkout(workout) {
  const key = `${WORKOUT_PREFIX}${workout.id}`;
  localStorage.setItem(key, JSON.stringify(workout));
}

/**
 * Retrieve a workout by id
 * @param {string} id - Workout id
 * @returns {Object|null} Workout object or null if not found
 */
function getWorkout(id) {
  const key = `${WORKOUT_PREFIX}${id}`;
  const data = localStorage.getItem(key);

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

/**
 * Delete a workout from localStorage
 * @param {string} id - Workout id to delete
 */
function deleteWorkout(id) {
  const key = `${WORKOUT_PREFIX}${id}`;
  localStorage.removeItem(key);
}

/**
 * Get all workouts from localStorage
 * @returns {Array} Array of workout objects
 */
function getAllWorkouts() {
  const workouts = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key && key.startsWith(WORKOUT_PREFIX)) {
      const data = localStorage.getItem(key);
      try {
        const workout = JSON.parse(data);
        workouts.push(workout);
      } catch (e) {
        // Skip invalid JSON entries
        continue;
      }
    }
  }

  return workouts;
}

/**
 * History management functions
 */
const history = {
  /**
   * Add a workout id to history
   * Maintains only the last 8 items
   * @param {string} workoutId - Workout id to add
   */
  addToHistory(workoutId) {
    let historyList = this.getHistory();
    historyList.push(workoutId);

    // Keep only last 8 items
    historyList = historyList.slice(-MAX_HISTORY_ITEMS);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(historyList));
  },

  /**
   * Get workout history
   * @returns {Array} Array of workout ids
   */
  getHistory() {
    const data = localStorage.getItem(HISTORY_KEY);

    if (!data) {
      return [];
    }

    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  /**
   * Clear all history
   */
  clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
  }
};

export const storage = {
  saveWorkout,
  getWorkout,
  deleteWorkout,
  getAllWorkouts,
  history
};
