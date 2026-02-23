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
    // TODO: Implement in next task
    return null;
  }

  /**
   * Get tenure info for an exercise
   *
   * @param {string} exerciseKey - Full exercise key
   * @returns {Object} Tenure info { exerciseName, startDate, weeksOnExercise, lastRotationDate }
   */
  getTenure(exerciseKey) {
    // TODO: Implement in next task
    return { exerciseName: '', startDate: null, weeksOnExercise: 0, lastRotationDate: null };
  }

  /**
   * Record rotation when user switches exercise
   *
   * @param {string} exerciseKey - Full exercise key
   * @param {string} newExerciseName - New exercise name after rotation
   */
  recordRotation(exerciseKey, newExerciseName) {
    // TODO: Implement in next task
  }

  /**
   * Get milestone progress toward unlock
   *
   * @param {string} exerciseName - Exercise name
   * @returns {number} Progress as decimal (0.0 to 1.0)
   */
  getMilestoneProgress(exerciseName) {
    // TODO: Implement in next task
    return 0;
  }
}
