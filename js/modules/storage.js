const KEYS = {
  ROTATION: 'build_workout_rotation',
  EXERCISE_HISTORY_PREFIX: 'build_exercise_',
  PAIN_HISTORY: 'build_exercise_pain_history',
  MOBILITY_CHECKS: 'build_barbell_mobility_checks',
  RECOVERY_METRICS: 'build_recovery_metrics'
};

/** Legacy keys (pre build_ prefix); migrated in _migratePainMobilityKeysV3 */
const LEGACY_PAIN_HISTORY = 'exercise_pain_history';
const LEGACY_MOBILITY_CHECKS = 'barbell_mobility_checks';

const MAX_HISTORY_LENGTH = 8;

function defaultRotationState() {
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

/**
 * Manages localStorage operations for workout rotation and exercise history
 */
export class StorageManager {
  constructor() {
    this.storage = globalThis.localStorage;
    this._runMigrations();
  }

  /**
   * One-time migrations keyed by build_migration_version
   */
  _runMigrations() {
    try {
      const version = parseInt(this.storage.getItem('build_migration_version') || '0', 10);
      if (version >= 3) return;

      if (version < 2) {
        this._migrateExerciseKeysV2();
      }
      if (version < 3) {
        this._migratePainMobilityKeysV3();
      }

      this.storage.setItem('build_migration_version', '3');
      console.log('[Storage] Migrations complete, now at version 3');
    } catch (error) {
      console.error('[Storage] Migration failed:', error);
    }
  }

  /**
   * Copy pain/mobility blobs from legacy keys to build_* keys and remove legacy.
   */
  _migratePainMobilityKeysV3() {
    const painNew = this.storage.getItem(KEYS.PAIN_HISTORY);
    const painOld = this.storage.getItem(LEGACY_PAIN_HISTORY);
    if (!painNew && painOld) {
      this.storage.setItem(KEYS.PAIN_HISTORY, painOld);
      this.storage.removeItem(LEGACY_PAIN_HISTORY);
    }

    const mobNew = this.storage.getItem(KEYS.MOBILITY_CHECKS);
    const mobOld = this.storage.getItem(LEGACY_MOBILITY_CHECKS);
    if (!mobNew && mobOld) {
      this.storage.setItem(KEYS.MOBILITY_CHECKS, mobOld);
      this.storage.removeItem(LEGACY_MOBILITY_CHECKS);
    }
  }

  _migrateExerciseKeysV2() {
    console.log('[Storage] Running migration v2: rekey exercise history');

    const historyFullKeys = [];
    if (this.storage.data) {
      for (const k of Object.keys(this.storage.data)) {
        if (k.startsWith(KEYS.EXERCISE_HISTORY_PREFIX)) historyFullKeys.push(k);
      }
    } else {
      for (let i = 0; i < this.storage.length; i++) {
        const k = this.storage.key(i);
        if (k && k.startsWith(KEYS.EXERCISE_HISTORY_PREFIX)) historyFullKeys.push(k);
      }
    }

    const migratedCount = { history: 0, pain: 0 };

    for (const fullKey of historyFullKeys) {
      const exerciseKey = fullKey.replace(KEYS.EXERCISE_HISTORY_PREFIX, '');
      if (!exerciseKey.includes(' - ')) continue;

      const parts = exerciseKey.split(' - ');
      const exerciseName = parts.slice(1).join(' - ');
      if (!exerciseName) continue;

      const oldData = this.getExerciseHistory(exerciseKey);
      const existingData = this.getExerciseHistory(exerciseName);

      const merged = [...existingData, ...oldData];
      const seen = new Set();
      const deduped = merged.filter(entry => {
        const dedupeKey = entry.date + JSON.stringify(entry.sets);
        if (seen.has(dedupeKey)) return false;
        seen.add(dedupeKey);
        return true;
      });
      deduped.sort((a, b) => new Date(a.date) - new Date(b.date));

      this.saveExerciseHistory(exerciseName, deduped);
      this.storage.removeItem(fullKey);
      migratedCount.history++;
    }

    const painData = this._getRawPainHistory();
    if (painData && typeof painData === 'object') {
      const newPainData = {};
      let painMigrated = false;

      for (const [key, entries] of Object.entries(painData)) {
        if (!Array.isArray(entries)) continue;

        if (key.includes(' - ')) {
          const parts = key.split(' - ');
          const exerciseName = parts.slice(1).join(' - ');
          if (!exerciseName) continue;

          if (newPainData[exerciseName]) {
            newPainData[exerciseName] = [...newPainData[exerciseName], ...entries];
          } else {
            newPainData[exerciseName] = entries.slice();
          }
          painMigrated = true;
          migratedCount.pain++;
        } else if (newPainData[key]) {
          newPainData[key] = [...newPainData[key], ...entries];
        } else {
          newPainData[key] = entries.slice();
        }
      }

      if (painMigrated) {
        this.storage.setItem(KEYS.PAIN_HISTORY, JSON.stringify(newPainData));
      }
    }

    console.log(
      `[Storage] Migration v2 complete: ${migratedCount.history} history keys, ${migratedCount.pain} pain keys migrated`
    );
  }

  _getRawPainHistory() {
    try {
      const data =
        this.storage.getItem(KEYS.PAIN_HISTORY) || this.storage.getItem(LEGACY_PAIN_HISTORY);
      if (!data) return {};
      const parsed = JSON.parse(data);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
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
    const defaults = defaultRotationState();
    const data = this.storage.getItem(KEYS.ROTATION);
    if (!data) {
      return { ...defaults };
    }

    try {
      const parsed = JSON.parse(data);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { ...defaults };
      }

      const nextSuggested =
        typeof parsed.nextSuggested === 'string' && parsed.nextSuggested
          ? parsed.nextSuggested
          : defaults.nextSuggested;
      const sequence = Array.isArray(parsed.sequence) ? parsed.sequence : defaults.sequence;
      const cycleCount =
        typeof parsed.cycleCount === 'number' && Number.isFinite(parsed.cycleCount)
          ? parsed.cycleCount
          : defaults.cycleCount;
      const currentStreak =
        typeof parsed.currentStreak === 'number' && Number.isFinite(parsed.currentStreak)
          ? parsed.currentStreak
          : defaults.currentStreak;

      return {
        lastWorkout: parsed.lastWorkout ?? defaults.lastWorkout,
        lastDate: parsed.lastDate ?? defaults.lastDate,
        nextSuggested,
        sequence,
        cycleCount,
        currentStreak,
        lastDeloadDate: parsed.lastDeloadDate ?? defaults.lastDeloadDate
      };
    } catch (error) {
      console.error('Failed to parse rotation data, returning default:', error);
      return { ...defaults };
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
      this.storage.setItem(KEYS.MOBILITY_CHECKS, serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to save mobility check: ${error.message}`);
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
    const data =
      this.storage.getItem(KEYS.MOBILITY_CHECKS) || this.storage.getItem(LEGACY_MOBILITY_CHECKS);
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
    const today = new Date().toISOString().split('T')[0];
    const list = allPain[exerciseKey];
    const existingIdx = list.findIndex(e => e && e.date === today);
    const entry = {
      date: today,
      hadPain: hadPain,
      location: location,
      severity: severity
    };
    if (existingIdx >= 0) {
      list[existingIdx] = entry;
    } else {
      list.push(entry);
    }

    // Limit to last 10 entries
    if (list.length > 10) {
      allPain[exerciseKey] = list.slice(-10);
    }

    try {
      const serialized = JSON.stringify(allPain);
      this.storage.setItem(KEYS.PAIN_HISTORY, serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to save pain report: ${error.message}`);
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
    const data =
      this.storage.getItem(KEYS.PAIN_HISTORY) || this.storage.getItem(LEGACY_PAIN_HISTORY);
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
   * @param {string[]|null} exerciseNames - Exercise names for this workout (required after v2 key migration)
   * @param {number} limit - Maximum number of workout sessions to return
   * @returns {Array} Array of workout session objects, sorted by date (most recent first)
   */
  getWorkoutHistory(workoutName, exerciseNames = null, limit = 10) {
    if (!workoutName || typeof workoutName !== 'string') {
      return [];
    }

    try {
      const allKeys = this.getAllExerciseKeys();
      let workoutExerciseKeys;
      if (exerciseNames && Array.isArray(exerciseNames) && exerciseNames.length > 0) {
        workoutExerciseKeys = exerciseNames;
      } else {
        workoutExerciseKeys = allKeys.filter(key => key.startsWith(workoutName + ' - '));
      }

      if (workoutExerciseKeys.length === 0) {
        return [];
      }

      const prefix = workoutName + ' - ';

      // Collect all workout sessions by date
      const sessionsByDate = new Map();

      workoutExerciseKeys.forEach(exerciseKey => {
        const history = this.getExerciseHistory(exerciseKey);
        const exerciseName = exerciseKey.startsWith(prefix)
          ? exerciseKey.slice(prefix.length)
          : exerciseKey;

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
   * Get exercise alternates storage
   * @returns {Object} Map of exercise keys to alternate info
   */
  getExerciseAlternates() {
    const stored = this.storage.getItem('build_exercise_alternates');
    if (!stored) {
      return {};
    }

    try {
      const parsed = JSON.parse(stored);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (error) {
      console.error('Failed to parse exercise alternates, returning empty object:', error);
      return {};
    }
  }

  /**
   * Set exercise alternate
   * @param {string} exerciseKey - Full exercise key
   * @param {Object} alternateInfo - {current, original, reason, dateChanged, painFreeWorkouts}
   */
  setExerciseAlternate(exerciseKey, alternateInfo) {
    if (!exerciseKey || typeof exerciseKey !== 'string') {
      throw new Error('Invalid exerciseKey: must be a non-empty string');
    }
    if (!alternateInfo || typeof alternateInfo !== 'object') {
      throw new Error('Invalid alternateInfo: must be an object');
    }

    try {
      const alternates = this.getExerciseAlternates();
      alternates[exerciseKey] = {
        ...alternateInfo,
        dateChanged: new Date().toISOString()
      };
      const serialized = JSON.stringify(alternates);
      this.storage.setItem('build_exercise_alternates', serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to set exercise alternate: ${error.message}`);
    }
  }

  /**
   * Remove exercise alternate (revert to original)
   * @param {string} exerciseKey - Full exercise key
   */
  removeExerciseAlternate(exerciseKey) {
    if (!exerciseKey || typeof exerciseKey !== 'string') {
      throw new Error('Invalid exerciseKey: must be a non-empty string');
    }

    try {
      const alternates = this.getExerciseAlternates();
      delete alternates[exerciseKey];
      const serialized = JSON.stringify(alternates);
      this.storage.setItem('build_exercise_alternates', serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to remove exercise alternate: ${error.message}`);
    }
  }

  /**
   * Get achievements
   * @returns {Object} {achievements: [], streaks: {}}
   */
  getAchievements() {
    const stored = this.storage.getItem('build_achievements');
    if (!stored) {
      return { achievements: [], streaks: {} };
    }

    try {
      const parsed = JSON.parse(stored);
      // Ensure structure is valid
      if (typeof parsed !== 'object' || parsed === null) {
        return { achievements: [], streaks: {} };
      }
      return {
        achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
        streaks: typeof parsed.streaks === 'object' && parsed.streaks !== null ? parsed.streaks : {}
      };
    } catch (error) {
      console.error('Failed to parse achievements, returning default:', error);
      return { achievements: [], streaks: {} };
    }
  }

  /**
   * Add achievement
   * @param {Object} achievement - Achievement data
   */
  addAchievement(achievement) {
    if (!achievement || typeof achievement !== 'object') {
      throw new Error('Invalid achievement: must be an object');
    }

    try {
      const data = this.getAchievements();
      data.achievements.push({
        ...achievement,
        dateAchieved: new Date().toISOString(),
        seen: false
      });
      const serialized = JSON.stringify(data);
      this.storage.setItem('build_achievements', serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to add achievement: ${error.message}`);
    }
  }

  /**
   * Mark achievements as seen
   * @param {string[]} achievementIds - IDs to mark as seen
   */
  markAchievementsSeen(achievementIds) {
    if (!Array.isArray(achievementIds)) {
      throw new Error('Invalid achievementIds: must be an array');
    }

    try {
      const data = this.getAchievements();
      data.achievements = data.achievements.map(a =>
        achievementIds.includes(a.id) ? { ...a, seen: true } : a
      );
      const serialized = JSON.stringify(data);
      this.storage.setItem('build_achievements', serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to mark achievements as seen: ${error.message}`);
    }
  }

  /**
   * Update achievement streak
   * @param {string} exerciseKey - Full exercise key
   * @param {Object} streakData - {current, best, pattern, lastDate}
   */
  updateAchievementStreak(exerciseKey, streakData) {
    if (!exerciseKey || typeof exerciseKey !== 'string') {
      throw new Error('Invalid exerciseKey: must be a non-empty string');
    }
    if (!streakData || typeof streakData !== 'object') {
      throw new Error('Invalid streakData: must be an object');
    }

    try {
      const data = this.getAchievements();
      data.streaks[exerciseKey] = streakData;
      const serialized = JSON.stringify(data);
      this.storage.setItem('build_achievements', serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to update achievement streak: ${error.message}`);
    }
  }

  /**
   * Get tempo state (optional tracking)
   * @returns {Object} Map of exercise keys to tempo state
   */
  getTempoState() {
    const stored = this.storage.getItem('build_tempo_state');
    if (!stored) {
      return {};
    }

    try {
      const parsed = JSON.parse(stored);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (error) {
      console.error('Failed to parse tempo state, returning empty object:', error);
      return {};
    }
  }

  /**
   * Set tempo state for exercise
   * @param {string} exerciseKey - Full exercise key
   * @param {Object} state - {weight, tempoStartDate, weekCount, status, targetWeight}
   */
  setTempoState(exerciseKey, state) {
    if (!exerciseKey || typeof exerciseKey !== 'string') {
      throw new Error('Invalid exerciseKey: must be a non-empty string');
    }
    if (!state || typeof state !== 'object') {
      throw new Error('Invalid state: must be an object');
    }

    try {
      const tempoState = this.getTempoState();
      tempoState[exerciseKey] = state;
      const serialized = JSON.stringify(tempoState);
      this.storage.setItem('build_tempo_state', serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to set tempo state: ${error.message}`);
    }
  }

  /**
   * Clear tempo state for exercise
   * @param {string} exerciseKey - Full exercise key
   */
  clearTempoState(exerciseKey) {
    if (!exerciseKey || typeof exerciseKey !== 'string') {
      throw new Error('Invalid exerciseKey: must be a non-empty string');
    }

    try {
      const tempoState = this.getTempoState();
      delete tempoState[exerciseKey];
      const serialized = JSON.stringify(tempoState);
      this.storage.setItem('build_tempo_state', serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to clear tempo state: ${error.message}`);
    }
  }

  /**
   * Get equipment profile
   *
   * @returns {Object} Equipment profile {gym, dumbbells, barbells, mudgal, bodyweight}
   */
  getEquipmentProfile() {
    try {
      const stored = this.storage.getItem('build_equipment_profile');
      if (!stored) {
        // Default: all equipment available
        return {
          gym: true,
          dumbbells: true,
          barbells: true,
          mudgal: true,
          bodyweight: true,
          bands: true,
          kettlebells: true,
          cables: true
        };
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('[Storage] Error getting equipment profile:', error);
      return {
        gym: true,
        dumbbells: true,
        barbells: true,
        mudgal: true,
        bodyweight: true,
        bands: true,
        kettlebells: true,
        cables: true
      };
    }
  }

  /**
   * Save equipment profile
   *
   * @param {Object} profile - Equipment profile object
   */
  saveEquipmentProfile(profile) {
    if (!profile || typeof profile !== 'object') {
      console.error('[Storage] Invalid equipment profile');
      return;
    }
    try {
      this.storage.setItem('build_equipment_profile', JSON.stringify(profile));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to save equipment profile: ${error.message}`);
    }
  }

  /**
   * Get exercise selections (current exercise per slot)
   *
   * @returns {Object} Slot → exercise name mapping
   */
  getExerciseSelections() {
    try {
      const stored = this.storage.getItem('build_exercise_selections');
      if (!stored) {
        // Default: all current exercises from progression paths
        return {
          'UPPER_A_SLOT_1': 'Incline DB Press',
          'UPPER_A_SLOT_2': 'Seated Cable Row',
          'UPPER_A_SLOT_3': 'Decline DB Press',
          'UPPER_A_SLOT_4': 'T-Bar Row',
          'UPPER_A_SLOT_5': 'Machine Fly',
          'UPPER_A_SLOT_6': 'Face Pulls',
          'UPPER_A_SLOT_7': 'Tricep Pushdowns',
          'LOWER_A_SLOT_1': 'Hack Squat',
          'LOWER_A_SLOT_2': '45° Hyperextension',
          'LOWER_A_SLOT_3': 'Hip Thrust',
          'LOWER_A_SLOT_4': 'Leg Extension',
          'LOWER_A_SLOT_5': 'Standing Calf Raise',
          'LOWER_A_SLOT_6': 'Dead Bug',
          'UPPER_B_SLOT_1': 'Lat Pulldown',
          'UPPER_B_SLOT_2': 'Landmine Press',
          'UPPER_B_SLOT_3': 'Chest-Supported Row',
          'UPPER_B_SLOT_4': 'DB Lateral Raises',
          'UPPER_B_SLOT_5': 'Reverse Fly',
          'UPPER_B_SLOT_6': 'DB Hammer Curls',
          'UPPER_B_SLOT_7': 'Reverse Crunch',
          'LOWER_B_SLOT_1': 'Leg Press',
          'LOWER_B_SLOT_2': 'DB Romanian Deadlift',
          'LOWER_B_SLOT_3': 'Leg Abduction',
          'LOWER_B_SLOT_4': 'Leg Adduction',
          'LOWER_B_SLOT_5': 'Leg Curl',
          'LOWER_B_SLOT_6': 'Seated Calf Raise',
          'LOWER_B_SLOT_7': 'Pallof Press'
        };
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('[Storage] Error getting exercise selections:', error);
      return {};
    }
  }

  /**
   * Save exercise selection for a slot
   *
   * @param {string} slotKey - Slot identifier
   * @param {string} exerciseName - Exercise name
   */
  saveExerciseSelection(slotKey, exerciseName) {
    try {
      const selections = this.getExerciseSelections();
      selections[slotKey] = exerciseName;
      this.storage.setItem('build_exercise_selections', JSON.stringify(selections));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to save exercise selection: ${error.message}`);
    }
  }

  /**
   * Get unlock achievements
   *
   * @returns {Object} Exercise name → unlock data mapping
   */
  getUnlocks() {
    try {
      const stored = this.storage.getItem('build_unlocks');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('[Storage] Error getting unlocks:', error);
      return {};
    }
  }

  /**
   * Save unlock achievement
   *
   * @param {string} exerciseName - Exercise that was unlocked
   * @param {Object} criteria - Unlock criteria met {strength, mobility, painFree, weeks}
   */
  saveUnlock(exerciseName, criteria) {
    try {
      const unlocks = this.getUnlocks();
      unlocks[exerciseName] = {
        unlockedDate: new Date().toISOString(),
        criteria: criteria
      };
      this.storage.setItem('build_unlocks', JSON.stringify(unlocks));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to save unlock: ${error.message}`);
    }
  }

  /**
   * Check if exercise is unlocked
   *
   * @param {string} exerciseName - Exercise name
   * @returns {boolean} True if unlocked
   */
  isExerciseUnlocked(exerciseName) {
    const unlocks = this.getUnlocks();
    return !!unlocks[exerciseName];
  }

  /**
   * Get training phase
   *
   * @returns {string} 'building' or 'maintenance'
   */
  getTrainingPhase() {
    try {
      const stored = this.storage.getItem('build_training_phase');
      return stored || 'building'; // Default to building phase
    } catch (error) {
      console.error('[Storage] Error getting training phase:', error);
      return 'building';
    }
  }

  /**
   * Save training phase
   *
   * @param {string} phase - 'building' or 'maintenance'
   */
  saveTrainingPhase(phase) {
    if (phase !== 'building' && phase !== 'maintenance') {
      console.error('[Storage] Invalid training phase:', phase);
      return;
    }
    try {
      this.storage.setItem('build_training_phase', phase);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to save training phase: ${error.message}`);
    }
  }

  /**
   * Exercise tenure map for rotation (weeks on variation).
   * @returns {Object<string, Object>}
   */
  getExerciseTenureMap() {
    try {
      const raw = this.storage.getItem('build_exercise_tenure');
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      console.error('[Storage] Error reading exercise tenure:', error);
      return {};
    }
  }

  /**
   * @param {Object<string, Object>} map
   */
  saveExerciseTenureMap(map) {
    if (!map || typeof map !== 'object' || Array.isArray(map)) {
      throw new Error('Invalid tenure map: must be a non-array object');
    }
    try {
      this.storage.setItem('build_exercise_tenure', JSON.stringify(map));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to save exercise tenure: ${error.message}`);
    }
  }

  /**
   * Recovery metrics (pre-workout / fatigue tracking)
   * @returns {Array<Object>}
   */
  getRecoveryMetrics() {
    try {
      const data = this.storage.getItem(KEYS.RECOVERY_METRICS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('[Storage] Error getting recovery metrics:', error);
      return [];
    }
  }

  /**
   * @param {Array<Object>} entries
   */
  saveRecoveryMetrics(entries) {
    if (!Array.isArray(entries)) {
      throw new Error('Invalid recovery metrics: must be an array');
    }
    try {
      this.storage.setItem(KEYS.RECOVERY_METRICS, JSON.stringify(entries));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw new Error(`Failed to save recovery metrics: ${error.message}`);
    }
  }

  /**
   * Removes all `build_exercise_*` history keys (rotation and other build_ keys preserved).
   */
  clearExerciseHistoryKeys() {
    const keys = this.getAllExerciseKeys();
    for (const k of keys) {
      this.storage.removeItem(`${KEYS.EXERCISE_HISTORY_PREFIX}${k}`);
    }
  }

  /**
   * Removes every localStorage key starting with `build_` plus legacy pain/mobility keys.
   */
  clearAllBuildKeys() {
    const s = this.storage;
    const toRemove = [];
    if (s.data) {
      for (const k of Object.keys(s.data)) {
        if (k.startsWith('build_')) toRemove.push(k);
      }
    } else {
      for (let i = 0; i < s.length; i++) {
        const k = s.key(i);
        if (k && k.startsWith('build_')) toRemove.push(k);
      }
    }
    for (const k of toRemove) {
      s.removeItem(k);
    }
    s.removeItem(LEGACY_PAIN_HISTORY);
    s.removeItem(LEGACY_MOBILITY_CHECKS);
  }

  /**
   * Clears all BUILD Tracker data from localStorage
   */
  clearAll() {
    this.storage.clear();
  }
}
