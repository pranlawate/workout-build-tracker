// Import KEYS constant from storage module
const KEYS = {
  ROTATION: 'build_workout_rotation',
  EXERCISE_HISTORY_PREFIX: 'build_exercise_'
};

/**
 * Export all workout data to JSON format
 * @param {StorageManager} storage - Storage manager instance
 * @returns {string} JSON string of all data
 */
export function exportWorkoutData(storage) {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    exerciseHistory: {},
    rotation: storage.getRotation(),
    deloadState: storage.getDeloadState()
  };

  // Get all exercise history keys
  const allKeys = Object.keys(localStorage);
  const historyKeys = allKeys.filter(key => key.startsWith(KEYS.EXERCISE_HISTORY_PREFIX));

  // Export each exercise history with error recovery
  historyKeys.forEach(key => {
    const exerciseKey = key.replace(KEYS.EXERCISE_HISTORY_PREFIX, '');
    try {
      data.exerciseHistory[exerciseKey] = storage.getExerciseHistory(exerciseKey);
    } catch (error) {
      console.error(`Failed to export history for ${exerciseKey}:`, error);
      // Skip corrupt data, continue with other exercises
    }
  });

  return JSON.stringify(data, null, 2);
}

/**
 * Validate imported data structure
 * @param {object} data - Parsed JSON data
 * @throws {Error} If data is invalid
 */
export function validateImportData(data) {
  // Check version
  if (!data.version) {
    throw new Error('Invalid data: missing version');
  }

  // Version check - only accept 1.0
  if (data.version !== '1.0') {
    throw new Error(`Unsupported data version: ${data.version}. Expected 1.0`);
  }

  if (!data.exerciseHistory || typeof data.exerciseHistory !== 'object') {
    throw new Error('Invalid data: missing or invalid exerciseHistory');
  }

  // Validate each exercise history
  for (const [key, history] of Object.entries(data.exerciseHistory)) {
    if (!Array.isArray(history)) {
      throw new Error(`Invalid history for ${key}: not an array`);
    }

    for (const entry of history) {
      // Validate date
      if (!entry.date) {
        throw new Error(`Invalid entry in ${key}: missing date`);
      }

      // Validate date format (ISO 8601)
      const date = new Date(entry.date);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid entry in ${key}: invalid date format "${entry.date}"`);
      }

      // Validate sets array
      if (!Array.isArray(entry.sets)) {
        throw new Error(`Invalid entry in ${key}: missing or invalid sets`);
      }

      // Validate each set structure
      for (let i = 0; i < entry.sets.length; i++) {
        const set = entry.sets[i];

        if (typeof set.weight !== 'number' || set.weight <= 0) {
          throw new Error(`Invalid set in ${key}: weight must be a positive number (set ${i + 1})`);
        }

        if (typeof set.reps !== 'number' || set.reps <= 0 || !Number.isInteger(set.reps)) {
          throw new Error(`Invalid set in ${key}: reps must be a positive integer (set ${i + 1})`);
        }

        if (typeof set.rir !== 'number' || set.rir < 0 || !Number.isInteger(set.rir)) {
          throw new Error(`Invalid set in ${key}: rir must be a non-negative integer (set ${i + 1})`);
        }
      }
    }
  }
}

/**
 * Import workout data from JSON
 * @param {string} jsonString - JSON string to import
 * @param {StorageManager} storage - Storage manager instance
 * @throws {Error} If data is invalid
 */
export function importWorkoutData(jsonString, storage) {
  const data = JSON.parse(jsonString);
  validateImportData(data);

  try {
    // Import exercise history
    for (const [exerciseKey, history] of Object.entries(data.exerciseHistory)) {
      storage.saveExerciseHistory(exerciseKey, history);
    }

    // Import rotation state using storage method
    if (data.rotation) {
      storage.saveRotation(data.rotation);
    }

    // Import deload state
    if (data.deloadState) {
      storage.saveDeloadState(data.deloadState);
    }
  } catch (error) {
    // Handle quota exceeded errors with user-friendly message
    if (error.name === 'QuotaExceededError' || error.message.includes('quota exceeded')) {
      throw new Error('Storage quota exceeded. Try clearing some browser data or use a smaller backup file.');
    }
    throw error;
  }
}

/**
 * Get data summary for preview
 * @param {object} data - Parsed JSON data
 * @returns {object} Summary statistics
 */
export function getDataSummary(data) {
  const exerciseCount = Object.keys(data.exerciseHistory).length;
  let totalWorkouts = 0;
  let earliestDate = null;
  let latestDate = null;

  for (const history of Object.values(data.exerciseHistory)) {
    totalWorkouts += history.length;

    for (const entry of history) {
      const date = new Date(entry.date);
      if (!earliestDate || date < earliestDate) earliestDate = date;
      if (!latestDate || date > latestDate) latestDate = date;
    }
  }

  return {
    exerciseCount,
    totalWorkouts,
    dateRange: earliestDate && latestDate
      ? `${earliestDate.toLocaleDateString()} - ${latestDate.toLocaleDateString()}`
      : 'No workouts',
    storageSize: new Blob([JSON.stringify(data)]).size
  };
}
