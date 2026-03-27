/**
 * Rotation Manager Module
 *
 * Tracks exercise tenure (weeks on current variation) and provides
 * rotation suggestions when exercises reach 8-12 week mark.
 *
 * Integrates with unlock system to suppress rotation suggestions when
 * user is close to unlock milestone (80%+ progress).
 *
 * @module rotation-manager
 */

import { ROTATION_POOLS, getUnlockMilestone, hasRotationPool } from './exercise-metadata.js';

export class RotationManager {
  /**
   * @param {StorageManager} storage - Storage instance for reading exercise history
   * @param {UnlockEvaluator} unlockEvaluator - Unlock evaluator for milestone progress
   */
  constructor(storage, unlockEvaluator) {
    if (!storage) {
      throw new Error('RotationManager requires a StorageManager instance');
    }
    if (!unlockEvaluator) {
      throw new Error('RotationManager requires an UnlockEvaluator instance');
    }

    this.storage = storage;
    this.unlockEvaluator = unlockEvaluator;
    this.TENURE_KEY = 'build_exercise_tenure';
    this.UNLOCK_PROGRESS_KEY = 'build_unlock_progress';
  }

  /**
   * Check if rotation is due for an exercise
   *
   * @param {string} exerciseKey - Full exercise key (e.g., 'UPPER_A - Tricep Pushdowns')
   * @param {string} currentExerciseName - Current exercise name
   * @returns {Object|null} Rotation suggestion or null
   */
  checkRotationDue(exerciseKey, currentExerciseName) {
    try {
      // 1. Suppress rotation suggestions during deload (focus on recovery)
      const deloadState = this.storage.getDeloadState();
      if (deloadState && deloadState.active) {
        console.log('[RotationManager] Suppressing rotation - deload week active');
        return null;
      }

      // 2. Check if exercise has rotation pool
      if (!hasRotationPool(currentExerciseName)) {
        return null;
      }

      // 3. Get tenure
      const tenure = this.getTenure(exerciseKey);
      if (tenure.weeksOnExercise < 8) {
        return null; // Not due yet
      }

      // 4. Check unlock proximity (suppress if user close to unlock)
      const milestone = getUnlockMilestone(currentExerciseName);
      if (milestone) {
        const progress = this.getMilestoneProgress(currentExerciseName, exerciseKey);
        if (progress >= 0.8) {
          console.log(`[RotationManager] Suppressing rotation - user at ${(progress * 100).toFixed(0)}% toward unlock`);
          return null; // Don't disrupt unlock momentum
        }
      }

      // 5. Get next rotation variant (cycle through pool; avoid always using rotations[0])
      const pool = ROTATION_POOLS[currentExerciseName];
      const rotations = pool.rotations || [];
      const candidates = rotations.filter((r) => r !== currentExerciseName);
      const poolPick = candidates.length > 0 ? candidates : rotations.slice();
      const idx =
        poolPick.length > 0
          ? Math.abs(tenure.weeksOnExercise) % poolPick.length
          : 0;
      const nextVariation = poolPick[idx] || rotations[0];

      // 6. Return rotation suggestion
      return {
        type: 'ROTATION_DUE',
        suggestedExercise: nextVariation,
        reason: `Try ${nextVariation} for complete muscle coverage (${tenure.weeksOnExercise} weeks on current variation)`,
        currentExercise: currentExerciseName,
        weeksOnExercise: tenure.weeksOnExercise
      };
    } catch (e) {
      console.error('[RotationManager] Error checking rotation:', e);
      return null;
    }
  }

  /**
   * Get tenure info for an exercise
   *
   * @param {string} exerciseKey - Full exercise key
   * @returns {Object} Tenure info { exerciseName, startDate, weeksOnExercise, lastRotationDate }
   */
  getTenure(exerciseKey) {
    try {
      const allTenure = this.storage.getExerciseTenureMap();
      const tenure = allTenure[exerciseKey];

      if (!tenure || !tenure.startDate) {
        // No tenure data - check if exercise has history
        const history = this.storage.getExerciseHistory(exerciseKey);
        if (!history || history.length === 0) {
          return { exerciseName: '', startDate: null, weeksOnExercise: 0, lastRotationDate: null };
        }

        // Initialize tenure from first workout
        const firstWorkout = history[history.length - 1]; // Oldest entry
        const startDate = firstWorkout.date;
        const weeksOnExercise = this._calculateWeeks(startDate);

        return {
          exerciseName: this._extractExerciseName(exerciseKey),
          startDate,
          weeksOnExercise,
          lastRotationDate: null
        };
      }

      // Calculate current weeks from stored start date
      const weeksOnExercise = this._calculateWeeks(tenure.startDate);

      return {
        ...tenure,
        weeksOnExercise
      };
    } catch (e) {
      console.error('[RotationManager] Error getting tenure:', e);
      return { exerciseName: '', startDate: null, weeksOnExercise: 0, lastRotationDate: null };
    }
  }

  /**
   * Record rotation when user switches exercise
   *
   * @param {string} exerciseKey - Full exercise key
   * @param {string} newExerciseName - New exercise name after rotation
   */
  recordRotation(exerciseKey, newExerciseName) {
    try {
      const allTenure = this.storage.getExerciseTenureMap();

      // Reset tenure for new exercise
      allTenure[exerciseKey] = {
        exerciseName: newExerciseName,
        startDate: new Date().toISOString(),
        lastRotationDate: new Date().toISOString()
      };

      this.storage.saveExerciseTenureMap(allTenure);

      console.log(`[RotationManager] Recorded rotation: ${exerciseKey} → ${newExerciseName}`);
    } catch (e) {
      console.error('[RotationManager] Error recording rotation:', e);
    }
  }

  /**
   * Get milestone progress toward unlock
   *
   * @param {string} exerciseName - Exercise name
   * @param {string} exerciseKey - Exercise key for history lookup
   * @returns {number} Progress as decimal (0.0 to 1.0)
   */
  getMilestoneProgress(exerciseName, exerciseKey) {
    try {
      const milestone = getUnlockMilestone(exerciseName);
      if (!milestone) return 0;

      const history = this.storage.getExerciseHistory(exerciseKey);
      if (!history || history.length === 0) return 0;

      const latest = history[history.length - 1];
      if (!latest.sets || latest.sets.length === 0) return 0;

      // Check best set performance
      const bestSet = latest.sets.reduce((best, set) => {
        if (!set.weight || !set.reps) return best;
        if (set.weight > best.weight) return set;
        if (set.weight === best.weight && set.reps > best.reps) return set;
        return best;
      }, { weight: 0, reps: 0 });

      if (!milestone.weight) return 0;
      const progress = bestSet.weight / milestone.weight;
      return Math.min(progress, 1.0);
    } catch (e) {
      console.error('[RotationManager] Error calculating milestone progress:', e);
      return 0;
    }
  }

  /**
   * Calculate weeks elapsed from start date
   *
   * @param {string} startDate - ISO date string
   * @returns {number} Weeks elapsed
   * @private
   */
  _calculateWeeks(startDate) {
    if (!startDate) return 0;

    const start = new Date(startDate);
    const now = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeks = Math.floor((now - start) / msPerWeek);

    return weeks >= 0 ? weeks : 0;
  }

  /**
   * Extract exercise name from exercise key
   *
   * @param {string} exerciseKey - Full key like 'UPPER_A - Tricep Pushdowns'
   * @returns {string} Exercise name like 'Tricep Pushdowns'
   * @private
   */
  _extractExerciseName(exerciseKey) {
    const parts = exerciseKey.split(' - ');
    return parts.length > 1 ? parts.slice(1).join(' - ') : exerciseKey;
  }
}
