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
  const historyKeys = allKeys.filter(key => key.startsWith('build_exercise_'));

  // Export each exercise history
  historyKeys.forEach(key => {
    const exerciseKey = key.replace('build_exercise_', '');
    data.exerciseHistory[exerciseKey] = storage.getExerciseHistory(exerciseKey);
  });

  return JSON.stringify(data, null, 2);
}

/**
 * Validate imported data structure
 * @param {object} data - Parsed JSON data
 * @throws {Error} If data is invalid
 */
export function validateImportData(data) {
  if (!data.version) {
    throw new Error('Invalid data: missing version');
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
      if (!entry.date) {
        throw new Error(`Invalid entry in ${key}: missing date`);
      }
      if (!Array.isArray(entry.sets)) {
        throw new Error(`Invalid entry in ${key}: missing or invalid sets`);
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

  // Import exercise history
  for (const [exerciseKey, history] of Object.entries(data.exerciseHistory)) {
    storage.saveExerciseHistory(exerciseKey, history);
  }

  // Import rotation state
  if (data.rotation) {
    localStorage.setItem('build_workout_rotation', JSON.stringify(data.rotation));
  }

  // Import deload state
  if (data.deloadState) {
    storage.saveDeloadState(data.deloadState);
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
