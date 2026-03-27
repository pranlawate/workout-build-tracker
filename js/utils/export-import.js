// Import KEYS constant from storage module
const KEYS = {
  ROTATION: 'build_workout_rotation',
  EXERCISE_HISTORY_PREFIX: 'build_exercise_',
  DELOAD: 'build_deload_state'
};

/** Supported top-level backup format versions */
export const SUPPORTED_EXPORT_VERSIONS = new Set(['1.0', '1.1']);

/**
 * Additional localStorage keys persisted in v1.1 backups (raw string values).
 * Rotation and deload are stored as structured `rotation` / `deloadState`; do not duplicate here.
 */
const LOCAL_STORAGE_EXTRA_KEYS = [
  'build_exercise_pain_history',
  'build_barbell_mobility_checks',
  'exercise_pain_history',
  'barbell_mobility_checks',
  'build_exercise_alternates',
  'build_achievements',
  'build_tempo_state',
  'build_equipment_profile',
  'build_exercise_selections',
  'build_unlocks',
  'build_training_phase',
  'build_body_weight',
  'build_recovery_metrics',
  'build_migration_version',
  'build_exercise_tenure',
  'build_unlock_progress'
];

const IMPORT_EXTRA_KEYS_SET = new Set(LOCAL_STORAGE_EXTRA_KEYS);

/**
 * Parse a workout backup JSON string with guarded JSON.parse
 * @param {string} jsonString
 * @returns {object}
 */
export function parseWorkoutBackupJson(jsonString) {
  if (typeof jsonString !== 'string') {
    throw new Error('Import data must be a string');
  }
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('[export-import] JSON parse failed:', err);
    throw new Error('Invalid JSON: could not parse backup file');
  }
}

/**
 * Validate rotation object shape before import (lenient for older backups)
 * @param {object|undefined|null} rotation
 */
export function validateRotationState(rotation) {
  if (rotation === undefined || rotation === null) {
    return;
  }
  if (typeof rotation !== 'object' || Array.isArray(rotation)) {
    throw new Error('Invalid data: rotation must be an object');
  }
  if (rotation.nextSuggested != null && typeof rotation.nextSuggested !== 'string') {
    throw new Error('Invalid rotation: nextSuggested must be a string when present');
  }
  if (rotation.sequence != null && !Array.isArray(rotation.sequence)) {
    throw new Error('Invalid rotation: sequence must be an array when present');
  }
  if (rotation.lastWorkout != null && typeof rotation.lastWorkout !== 'string') {
    throw new Error('Invalid rotation: lastWorkout must be a string when present');
  }
  if (rotation.lastDate != null && typeof rotation.lastDate !== 'string') {
    throw new Error('Invalid rotation: lastDate must be a string when present');
  }
  if (rotation.cycleCount != null && typeof rotation.cycleCount !== 'number') {
    throw new Error('Invalid rotation: cycleCount must be a number when present');
  }
  if (rotation.currentStreak != null && typeof rotation.currentStreak !== 'number') {
    throw new Error('Invalid rotation: currentStreak must be a number when present');
  }
}

/**
 * Validate deload state object shape before import
 * @param {object|undefined|null} deloadState
 */
export function validateDeloadStateImport(deloadState) {
  if (deloadState === undefined || deloadState === null) {
    return;
  }
  if (typeof deloadState !== 'object' || Array.isArray(deloadState)) {
    throw new Error('Invalid data: deloadState must be an object');
  }
  if (deloadState.active != null && typeof deloadState.active !== 'boolean') {
    throw new Error('Invalid deloadState: active must be a boolean when present');
  }
  if (deloadState.weeksSinceDeload != null && typeof deloadState.weeksSinceDeload !== 'number') {
    throw new Error('Invalid deloadState: weeksSinceDeload must be a number when present');
  }
  if (deloadState.dismissedCount != null && typeof deloadState.dismissedCount !== 'number') {
    throw new Error('Invalid deloadState: dismissedCount must be a number when present');
  }
}

/**
 * Validate optional localStorageExtras map (v1.1)
 * @param {object|undefined} extras
 */
function validateLocalStorageExtras(extras) {
  if (extras === undefined || extras === null) {
    return;
  }
  if (typeof extras !== 'object' || Array.isArray(extras)) {
    throw new Error('Invalid data: localStorageExtras must be an object');
  }
  for (const [key, value] of Object.entries(extras)) {
    if (!IMPORT_EXTRA_KEYS_SET.has(key)) {
      throw new Error(`Invalid backup: unknown localStorageExtras key "${key}"`);
    }
    if (typeof value !== 'string') {
      throw new Error(`Invalid backup: localStorageExtras["${key}"] must be a string`);
    }
  }
}

/**
 * Export all workout data to JSON format
 * @param {StorageManager} storage - Storage manager instance
 * @returns {string} JSON string of all data
 */
export function exportWorkoutData(storage) {
  const ls = storage.storage;

  const data = {
    version: '1.1',
    exportDate: new Date().toISOString(),
    exerciseHistory: {},
    rotation: storage.getRotation(),
    deloadState: storage.getDeloadState(),
    localStorageExtras: {}
  };

  const historyKeys = storage.getAllExerciseKeys();

  historyKeys.forEach(exerciseKey => {
    try {
      data.exerciseHistory[exerciseKey] = storage.getExerciseHistory(exerciseKey);
    } catch (error) {
      console.error(`Failed to export history for ${exerciseKey}:`, error);
    }
  });

  for (const key of LOCAL_STORAGE_EXTRA_KEYS) {
    const raw = ls.getItem(key);
    if (raw != null) {
      data.localStorageExtras[key] = raw;
    }
  }

  return JSON.stringify(data, null, 2);
}

/**
 * Validate imported data structure
 * @param {object} data - Parsed JSON data
 * @throws {Error} If data is invalid
 */
export function validateImportData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data: root must be an object');
  }

  if (!data.version) {
    throw new Error('Invalid data: missing version');
  }

  if (!SUPPORTED_EXPORT_VERSIONS.has(data.version)) {
    throw new Error(`Unsupported data version: ${data.version}. Expected one of: ${[...SUPPORTED_EXPORT_VERSIONS].join(', ')}`);
  }

  if (!data.exerciseHistory || typeof data.exerciseHistory !== 'object') {
    throw new Error('Invalid data: missing or invalid exerciseHistory');
  }

  validateRotationState(data.rotation);
  validateDeloadStateImport(data.deloadState);

  if (data.version === '1.1') {
    validateLocalStorageExtras(data.localStorageExtras);
  }

  for (const [key, history] of Object.entries(data.exerciseHistory)) {
    if (!Array.isArray(history)) {
      throw new Error(`Invalid history for ${key}: not an array`);
    }

    for (const entry of history) {
      if (!entry.date) {
        throw new Error(`Invalid entry in ${key}: missing date`);
      }

      const date = new Date(entry.date);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid entry in ${key}: invalid date format "${entry.date}"`);
      }

      if (!Array.isArray(entry.sets)) {
        throw new Error(`Invalid entry in ${key}: missing or invalid sets`);
      }

      for (let i = 0; i < entry.sets.length; i++) {
        const set = entry.sets[i];

        if (typeof set.weight !== 'number' || set.weight < 0) {
          throw new Error(`Invalid set in ${key}: weight must be a non-negative number (set ${i + 1})`);
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
 * Apply validated import with rollback if any write fails partway through.
 * @param {object} data - Already validated backup object
 * @param {StorageManager} storage
 * @private
 */
function applyImportWithRollback(data, storage) {
  const ls = storage.storage;
  const keysToTouch = new Set();

  for (const exerciseKey of Object.keys(data.exerciseHistory)) {
    keysToTouch.add(`${KEYS.EXERCISE_HISTORY_PREFIX}${exerciseKey}`);
  }
  keysToTouch.add(KEYS.ROTATION);
  keysToTouch.add(KEYS.DELOAD);

  if (data.version === '1.1' && data.localStorageExtras && typeof data.localStorageExtras === 'object') {
    for (const k of Object.keys(data.localStorageExtras)) {
      keysToTouch.add(k);
    }
  }

  const backup = {};
  for (const key of keysToTouch) {
    try {
      backup[key] = ls.getItem(key);
    } catch (err) {
      console.error('[export-import] Failed to read key for rollback backup:', key, err);
      throw new Error(`Could not read existing data for key "${key}" before import`);
    }
  }

  const writeErrors = [];

  try {
    for (const [exerciseKey, history] of Object.entries(data.exerciseHistory)) {
      try {
        storage.saveExerciseHistory(exerciseKey, history);
      } catch (err) {
        writeErrors.push({ key: `${KEYS.EXERCISE_HISTORY_PREFIX}${exerciseKey}`, err });
        throw err;
      }
    }

    if (data.rotation) {
      try {
        storage.saveRotation(data.rotation);
      } catch (err) {
        writeErrors.push({ key: KEYS.ROTATION, err });
        throw err;
      }
    }

    if (data.deloadState) {
      try {
        storage.saveDeloadState(data.deloadState);
      } catch (err) {
        writeErrors.push({ key: KEYS.DELOAD, err });
        throw err;
      }
    }

    if (data.version === '1.1' && data.localStorageExtras && typeof data.localStorageExtras === 'object') {
      for (const [k, v] of Object.entries(data.localStorageExtras)) {
        try {
          if (typeof v === 'string') {
            ls.setItem(k, v);
          }
        } catch (err) {
          writeErrors.push({ key: k, err });
          throw err;
        }
      }
    }
  } catch (error) {
    for (const key of keysToTouch) {
      try {
        const prev = backup[key];
        if (prev === null || prev === undefined) {
          ls.removeItem(key);
        } else {
          ls.setItem(key, prev);
        }
      } catch (rollbackErr) {
        console.error('[export-import] Rollback failed for key:', key, rollbackErr);
      }
    }

    const detail = writeErrors.length
      ? writeErrors.map(e => `${e.key}: ${e.err?.message || e.err}`).join('; ')
      : (error?.message || String(error));

    if (error.name === 'QuotaExceededError' || (error.message && error.message.includes('quota exceeded'))) {
      throw new Error('Storage quota exceeded. Try clearing some browser data or use a smaller backup file.');
    }
    throw new Error(`Import failed and changes were rolled back. ${detail}`);
  }
}

/**
 * Import workout data from JSON
 * @param {string} jsonString - JSON string to import
 * @param {StorageManager} storage - Storage manager instance
 * @throws {Error} If data is invalid
 */
export function importWorkoutData(jsonString, storage) {
  const data = parseWorkoutBackupJson(jsonString);
  validateImportData(data);
  applyImportWithRollback(data, storage);
}

/**
 * Import from an already parsed and validated object (avoids double parse after preview)
 * @param {object} data
 * @param {StorageManager} storage
 */
export function importValidatedWorkoutData(data, storage) {
  validateImportData(data);
  applyImportWithRollback(data, storage);
}

/**
 * Get data summary for preview (call only after validateImportData)
 * @param {object} data - Parsed JSON data
 * @returns {object} Summary statistics
 */
export function getDataSummary(data) {
  const exerciseHistory = data.exerciseHistory && typeof data.exerciseHistory === 'object'
    ? data.exerciseHistory
    : {};

  const exerciseCount = Object.keys(exerciseHistory).length;
  let totalWorkouts = 0;
  let earliestDate = null;
  let latestDate = null;

  for (const history of Object.values(exerciseHistory)) {
    if (!Array.isArray(history)) continue;
    totalWorkouts += history.length;

    for (const entry of history) {
      if (!entry || !entry.date) continue;
      const date = new Date(entry.date);
      if (isNaN(date.getTime())) continue;
      if (!earliestDate || date < earliestDate) earliestDate = date;
      if (!latestDate || date > latestDate) latestDate = date;
    }
  }

  const extraCount = data.version === '1.1' && data.localStorageExtras && typeof data.localStorageExtras === 'object'
    ? Object.keys(data.localStorageExtras).length
    : 0;

  return {
    exerciseCount,
    totalWorkouts,
    dateRange: earliestDate && latestDate
      ? `${earliestDate.toLocaleDateString()} - ${latestDate.toLocaleDateString()}`
      : 'No workouts',
    storageSize: new Blob([JSON.stringify(data)]).size,
    extraStorageKeyCount: extraCount
  };
}
