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

    // Save to storage (per-item try/catch so one failure does not drop the rest)
    for (const achievement of newAchievements) {
      try {
        storage.addAchievement(achievement);
      } catch (err) {
        console.error('[Achievements] Failed to save achievement:', achievement?.type, err);
      }
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

    // PR if weight increased OR (same weight + reps increased) — numeric compare for string/number storage
    const lw = Number(latestBest.weight);
    const pw = Number(previousBest.weight);
    const lr = Number(latestBest.reps);
    const pr = Number(previousBest.reps);
    const weightPR = !isNaN(lw) && !isNaN(pw) && lw > pw;
    const repPR = lw === pw && !isNaN(lr) && !isNaN(pr) && lr > pr;

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
function hasAchievementForExercise(storage, type, exerciseKey) {
  try {
    const data = storage.getAchievements();
    const list = data.achievements || [];
    return list.some((a) => a.type === type && a.exerciseKey === exerciseKey);
  } catch {
    return false;
  }
}

function detectTempoMastery(storage) {
  try {
    const tempoState = storage.getTempoState();

    for (const [exerciseKey, state] of Object.entries(tempoState)) {
      if (!state) continue;
      if (state.status === 'completed' && state.weekCount >= 3) {
        if (hasAchievementForExercise(storage, 'TEMPO_MASTERY', exerciseKey)) {
          continue;
        }
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
function maxWeightFromSession(session) {
  if (!session?.sets || !Array.isArray(session.sets) || session.sets.length === 0) return null;
  let best = null;
  for (const set of session.sets) {
    if (!set) continue;
    const w = Number(set.weight);
    if (isNaN(w)) continue;
    if (best === null || w > best) best = w;
  }
  return best;
}

function longestConsecutiveWeightIncreaseRun(history) {
  if (!history || history.length < 2) return 0;
  let bestRun = 0;
  let run = 0;
  for (let i = 1; i < history.length; i++) {
    const prev = maxWeightFromSession(history[i - 1]);
    const cur = maxWeightFromSession(history[i]);
    if (prev === null || cur === null) {
      run = 0;
      continue;
    }
    if (cur > prev) {
      run += 1;
      if (run > bestRun) bestRun = run;
    } else {
      run = 0;
    }
  }
  return bestRun;
}

function detectProgressionStreak(storage) {
  const out = [];
  try {
    const ls = storage.storage;
    const prefix = 'build_exercise_';
    for (let i = 0; i < ls.length; i++) {
      const fullKey = ls.key(i);
      if (!fullKey || !fullKey.startsWith(prefix)) continue;
      const exerciseKey = fullKey.slice(prefix.length);
      if (!exerciseKey.includes(' - ')) continue;

      if (hasAchievementForExercise(storage, 'PROGRESSION_STREAK', exerciseKey)) continue;

      const history = storage.getExerciseHistory(exerciseKey);
      const streak = longestConsecutiveWeightIncreaseRun(history);
      // streak = count of consecutive "session N heavier than N-1" edges; 2 edges = 3 rising sessions
      if (streak < 2) continue;

      const exerciseName = exerciseKey.includes(' - ')
        ? exerciseKey.split(' - ').slice(1).join(' - ')
        : exerciseKey;

      out.push({
        id: `streak_${exerciseKey}_${Date.now()}`,
        type: 'PROGRESSION_STREAK',
        exerciseKey,
        badge: '⚡',
        description: `${exerciseName}: ${streak + 1} sessions, each heavier than the last`
      });
    }
  } catch (error) {
    console.error('[Achievements] Error detecting progression streak:', error);
  }
  return out;
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
      if (!info) continue;
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

    const sw = Number(set.weight);
    const bw = Number(best.weight);
    const sr = Number(set.reps);
    const br = Number(best.reps);

    if (!isNaN(sw) && !isNaN(bw) && (sw > bw || (sw === bw && !isNaN(sr) && !isNaN(br) && sr > br))) {
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
