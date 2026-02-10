/**
 * Achievement Detection System
 * Analyzes workout data to detect achievements
 */

/**
 * Detect achievements from workout data
 * @param {object} workoutData - Workout completion data
 * @param {object} storage - StorageManager instance
 * @returns {array} Array of newly earned achievements
 */
export function detectAchievements(workoutData, storage) {
  const newAchievements = [];

  try {
    // Get exercise keys from workout data
    const exerciseKeys = (workoutData.exerciseDefinitions || []).map((exerciseDef) => {
      return `${workoutData.workoutName} - ${exerciseDef.name}`;
    });

    // Detect Personal Records (PR)
    for (const exerciseKey of exerciseKeys) {
      const pr = detectPersonalRecord(exerciseKey, storage);
      if (pr) newAchievements.push(pr);
    }

    // Detect Tempo Mastery
    const tempoMastery = detectTempoMastery(storage);
    if (tempoMastery) newAchievements.push(tempoMastery);

    // Detect Progression Streaks
    const streaks = detectProgressionStreak(storage);
    newAchievements.push(...streaks);

    // Detect Smart Recovery
    const recovery = detectSmartRecovery(storage);
    if (recovery) newAchievements.push(recovery);

    // Save to storage
    for (const achievement of newAchievements) {
      storage.addAchievement(achievement);
    }

    return newAchievements;
  } catch (error) {
    console.error('[Achievements] Error detecting achievements:', error);
    return [];
  }
}

/**
 * Detect personal record for an exercise
 * @param {string} exerciseKey - Full exercise key
 * @param {object} storage - StorageManager instance
 * @returns {object|null} Achievement object or null
 */
function detectPersonalRecord(exerciseKey, storage) {
  try {
    const history = storage.getExerciseHistory(exerciseKey);
    if (!history || history.length < 2) return null;

    const latest = history[history.length - 1];
    const previous = history[history.length - 2];

    const latestBest = getBestSet(latest?.sets);
    const previousBest = getBestSet(previous?.sets);

    if (!latestBest || !previousBest) return null;

    // PR if weight increased OR (same weight + reps increased)
    const weightPR = latestBest.weight > previousBest.weight;
    const repPR = latestBest.weight === previousBest.weight && latestBest.reps > previousBest.reps;

    if (weightPR || repPR) {
      // Extract exercise name without workout prefix
      const exerciseName = exerciseKey.includes(' - ')
        ? exerciseKey.split(' - ').slice(1).join(' - ')
        : exerciseKey;

      return {
        id: `pr_${exerciseKey}_${Date.now()}`,
        type: 'PERSONAL_RECORD',
        exerciseKey,
        badge: '🔥',
        description: `${exerciseName}: ${latestBest.weight}kg × ${latestBest.reps} reps`
      };
    }

    return null;
  } catch (error) {
    console.error(`[Achievements] Error detecting PR for ${exerciseKey}:`, error);
    return null;
  }
}

/**
 * Detect tempo mastery achievement
 * @param {object} storage - StorageManager instance
 * @returns {object|null} Achievement object or null
 */
function detectTempoMastery(storage) {
  try {
    const tempoState = storage.getTempoState();

    for (const [exerciseKey, state] of Object.entries(tempoState)) {
      if (state.status === 'completed' && state.weekCount >= 3) {
        const exerciseName = exerciseKey.includes(' - ')
          ? exerciseKey.split(' - ').slice(1).join(' - ')
          : exerciseKey;

        return {
          id: `tempo_${exerciseKey}_${Date.now()}`,
          type: 'TEMPO_MASTERY',
          exerciseKey,
          badge: '🏆',
          description: `Conquered ${state.weight}kg→${state.targetWeight}kg gap with tempo progression`
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[Achievements] Error detecting tempo mastery:', error);
    return null;
  }
}

/**
 * Detect progression streak achievements
 * @param {object} storage - StorageManager instance
 * @returns {array} Array of streak achievements
 */
function detectProgressionStreak(storage) {
  // Simplified for MVP - return empty array
  // Future enhancement: detect 3+ consecutive PRs
  return [];
}

/**
 * Detect smart recovery achievement
 * @param {object} storage - StorageManager instance
 * @returns {object|null} Achievement object or null
 */
function detectSmartRecovery(storage) {
  try {
    const alternates = storage.getExerciseAlternates();

    for (const [exerciseKey, info] of Object.entries(alternates)) {
      if (info.painFreeWorkouts >= 3 && info.reason && info.reason.includes('pain')) {
        const exerciseName = exerciseKey.includes(' - ')
          ? exerciseKey.split(' - ').slice(1).join(' - ')
          : exerciseKey;

        return {
          id: `recovery_${exerciseKey}_${Date.now()}`,
          type: 'SMART_RECOVERY',
          exerciseKey,
          badge: '🧠',
          description: `Prevented injury by switching to ${info.current}`
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[Achievements] Error detecting smart recovery:', error);
    return null;
  }
}

/**
 * Get best set from array of sets
 * @param {array} sets - Array of set objects
 * @returns {object|null} Best set or null
 */
function getBestSet(sets) {
  if (!sets || !Array.isArray(sets) || sets.length === 0) return null;

  return sets.reduce((best, set) => {
    if (!set) return best;
    if (!best) return set;

    if (set.weight > best.weight ||
      (set.weight === best.weight && set.reps > best.reps)) {
      return set;
    }
    return best;
  }, null);
}

/**
 * Format achievement type to human-readable label
 * @param {string} type - Achievement type
 * @returns {string} Formatted label
 */
export function formatAchievementType(type) {
  const labels = {
    'PERSONAL_RECORD': 'New PR',
    'TEMPO_MASTERY': 'Tempo Master',
    'PROGRESSION_STREAK': 'Progression Streak',
    'SMART_RECOVERY': 'Smart Recovery'
  };
  return labels[type] || type;
}

/**
 * Get all achievements from storage
 * @param {object} storage - StorageManager instance
 * @returns {array} Array of all achievements
 */
export function getAllAchievements(storage) {
  try {
    const data = storage.getAchievements();
    return data.achievements || [];
  } catch (error) {
    console.error('[Achievements] Error getting achievements:', error);
    return [];
  }
}

/**
 * Get unseen achievements count
 * @param {object} storage - StorageManager instance
 * @returns {number} Count of unseen achievements
 */
export function getUnseenCount(storage) {
  try {
    const achievements = getAllAchievements(storage);
    return achievements.filter(a => !a.seen).length;
  } catch (error) {
    console.error('[Achievements] Error getting unseen count:', error);
    return 0;
  }
}
