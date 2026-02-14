/**
 * Unlock Evaluator Module
 *
 * Evaluates whether user meets criteria to unlock new exercises.
 * Checks strength milestones, mobility checks, pain-free status, and training weeks.
 *
 * Read-only analyzer pattern (like PerformanceAnalyzer).
 *
 * @module unlock-evaluator
 */

import { getComplexityTier, getUnlockCriteria, COMPLEXITY_TIERS } from './complexity-tiers.js';

export class UnlockEvaluator {
  /**
   * @param {Object} storageManager - Storage manager instance
   * @param {Object} phaseManager - Phase manager instance
   */
  constructor(storageManager, phaseManager) {
    if (!phaseManager) {
      throw new Error('UnlockEvaluator requires a PhaseManager instance');
    }
    this.storage = storageManager;
    this.phaseManager = phaseManager;
  }

  /**
   * Check if user meets unlock criteria for an exercise
   *
   * @param {string} targetExercise - Exercise to unlock
   * @param {string} prerequisiteExercise - Current exercise (progression source)
   * @returns {Object} { unlocked: boolean, criteria: {strength, mobility, painFree, weeks}, missing: string[] }
   */
  evaluateUnlock(targetExercise, prerequisiteExercise) {
    try {
      // SIMPLE tier always unlocked
      const tier = getComplexityTier(targetExercise);
      if (tier === COMPLEXITY_TIERS.SIMPLE) {
        return {
          unlocked: true,
          criteria: { strength: true, mobility: true, painFree: true, weeks: 0 },
          missing: []
        };
      }

      // Check if already unlocked
      if (this.storage.isExerciseUnlocked(targetExercise)) {
        return {
          unlocked: true,
          criteria: { strength: true, mobility: true, painFree: true, weeks: 999 },
          missing: []
        };
      }

      const requirements = getUnlockCriteria(targetExercise);
      const met = {
        strength: false,
        mobility: false,
        painFree: false,
        weeks: 0
      };
      const missing = [];

      // Check strength milestone
      if (requirements.strengthMilestone) {
        met.strength = this._checkStrengthMilestone(prerequisiteExercise, targetExercise);
        if (!met.strength) missing.push('strength milestone');
      } else {
        met.strength = true; // Not required
      }

      // Check mobility
      if (requirements.mobilityCheck) {
        met.mobility = this._checkMobilityRequirement(targetExercise);
        if (!met.mobility) missing.push('mobility check');
      } else {
        met.mobility = true; // Not required
      }

      // Check pain-free status
      if (requirements.painFreeWeeks > 0) {
        met.painFree = this._checkPainFree(prerequisiteExercise, requirements.painFreeWeeks);
        if (!met.painFree) missing.push(`${requirements.painFreeWeeks}+ pain-free workouts`);
      } else {
        met.painFree = true; // Not required
      }

      // Check training weeks
      met.weeks = this._calculateTrainingWeeks(prerequisiteExercise);
      if (met.weeks < requirements.trainingWeeks) {
        missing.push(`${requirements.trainingWeeks}+ weeks training`);
      }

      const unlocked = met.strength && met.mobility && met.painFree && (met.weeks >= requirements.trainingWeeks);

      return {
        unlocked,
        criteria: met,
        missing
      };

    } catch (error) {
      console.error('[UnlockEvaluator] Error evaluating unlock:', error);
      return {
        unlocked: false,
        criteria: { strength: false, mobility: false, painFree: false, weeks: 0 },
        missing: ['evaluation error']
      };
    }
  }

  /**
   * Evaluate unlock with phase-aware priority
   *
   * @param {string} targetExercise - Exercise to unlock
   * @param {string} prerequisiteExercise - Current exercise (progression source)
   * @returns {Object} { unlocked, criteria, missing, priority, phaseRecommended }
   */
  evaluateUnlockWithPhasePriority(targetExercise, prerequisiteExercise) {
    try {
      // Get base unlock evaluation (criteria met?)
      const baseEvaluation = this.evaluateUnlock(targetExercise, prerequisiteExercise);

      if (!baseEvaluation.unlocked) {
        return { ...baseEvaluation, priority: 999, phaseRecommended: false };
      }

      // Add phase-aware priority
      const unlockPriority = this.phaseManager.getUnlockPriority();
      const exerciseType = this._getExerciseType(targetExercise);

      return {
        ...baseEvaluation,
        priority: this._calculatePriority(exerciseType, unlockPriority),
        phaseRecommended: this._isPhaseRecommended(exerciseType, unlockPriority)
      };
    } catch (error) {
      console.error('[UnlockEvaluator] Error evaluating unlock with phase priority:', error);
      // Safe fallback: return base evaluation without priority
      const baseEvaluation = this.evaluateUnlock(targetExercise, prerequisiteExercise);
      return { ...baseEvaluation, priority: 1, phaseRecommended: true };
    }
  }

  /**
   * Determine exercise type for prioritization
   * @private
   */
  _getExerciseType(exerciseName) {
    if (exerciseName.includes('Barbell')) return 'barbell';
    if (exerciseName.includes('Sadharan') || exerciseName.includes('Baithak')) return 'bodyweight';
    if (exerciseName.includes('Mudgal')) return 'traditional';
    if (exerciseName.includes('Pull-up')) return 'bodyweight';
    return 'equipment';
  }

  /**
   * Calculate priority based on phase and exercise type
   * Lower number = higher priority (shown first)
   * @private
   */
  _calculatePriority(exerciseType, unlockPriority) {
    if (unlockPriority === 'all') {
      return 1; // Building: all exercises equal priority
    }

    if (unlockPriority === 'bodyweight_priority') {
      // Maintenance: bodyweight/traditional first, equipment second
      return (exerciseType === 'bodyweight' || exerciseType === 'traditional') ? 1 : 2;
    }

    if (unlockPriority === 'safety_first') {
      // Recovery: only bodyweight allowed (future)
      return exerciseType === 'bodyweight' ? 1 : 999;
    }

    return 1;
  }

  /**
   * Check if exercise is recommended for current phase
   * @private
   */
  _isPhaseRecommended(exerciseType, unlockPriority) {
    if (unlockPriority === 'all') return true;
    if (unlockPriority === 'bodyweight_priority') {
      return exerciseType === 'bodyweight' || exerciseType === 'traditional';
    }
    if (unlockPriority === 'safety_first') {
      return exerciseType === 'bodyweight';
    }
    return true;
  }

  /**
   * Check strength milestone (internal)
   *
   * @param {string} exerciseName - Current exercise
   * @param {string} targetExercise - Target exercise
   * @returns {boolean} True if milestone met
   * @private
   */
  _checkStrengthMilestone(exerciseName, targetExercise) {
    // Define milestones per progression
    const MILESTONES = {
      'DB Flat Bench Press': {
        'Barbell Bench Press': { weight: 15, reps: 12, sets: 3 },
        'Sadharan Dand': { weight: 15, reps: 12, sets: 3 }
      },
      'Hack Squat': {
        'Barbell Back Squat': { weight: 60, reps: 10, sets: 3 } // Total machine weight
      },
      'Lat Pulldown': {
        'Pull-ups': { weight: 50, reps: 10, sets: 3 } // Pulldown weight
      }
      // Add more as needed
    };

    const exerciseMilestones = MILESTONES[exerciseName];
    if (!exerciseMilestones) return false;

    const milestone = exerciseMilestones[targetExercise];
    if (!milestone) return false;

    // Get exercise history
    const history = this.storage.getExerciseHistory(exerciseName);
    if (!history || history.length === 0) return false;

    // Check recent sessions (last 3) for milestone achievement
    const recentSessions = history.slice(-3);

    return recentSessions.some(session => {
      if (!session.sets || session.sets.length === 0) return false;

      // Check if achieved target weight × reps for required sets
      const qualifyingSets = session.sets.filter(set =>
        set.weight >= milestone.weight && set.reps >= milestone.reps
      );

      return qualifyingSets.length >= milestone.sets;
    });
  }

  /**
   * Check mobility requirement (internal)
   *
   * @param {string} exerciseName - Exercise requiring mobility
   * @returns {boolean} True if mobility confirmed
   * @private
   */
  _checkMobilityRequirement(exerciseName) {
    // Map exercises to mobility check criteria
    // All COMPLEX tier exercises require mobility validation
    const MOBILITY_CHECKS = {
      // Upper body pressing (barbell)
      'Barbell Bench Press': 'scapular_retraction',
      'Barbell Overhead Press': 'shoulder_overhead_mobility',

      // Traditional Indian Dand (push-up) variations - all require thoracic mobility
      'Sadharan Dand': 'thoracic_mobility',           // Basic push-up with hip bridge
      'Rammurti Dand': 'thoracic_mobility',           // Flowing sweep movement
      'Hanuman Dand': 'thoracic_mobility',            // Dips with leg lunge
      'Vrushchik Dand': 'thoracic_mobility',          // Scorpion leg crossing
      'Vrushchik Dand 2': 'thoracic_mobility',        // Forearm stand scorpion
      'Parshava Dand': 'thoracic_mobility',           // Lateral leg crossing
      'Chakra Dand': 'thoracic_mobility',             // Circular leg movements
      'Advance Hanuman Dand': 'thoracic_mobility',    // Explosive leg thrust
      'Vaksh vikasak Dand': 'thoracic_mobility',      // Chest expansion with inward palms
      'Palat Dand': 'thoracic_mobility',              // Rotation to side plank
      'Sher Dand': 'thoracic_mobility',               // Handstand push-up
      'Sarp Dand': 'thoracic_mobility',               // Snake pulsing or dog↔cobra
      'Mishr Dand': 'thoracic_mobility',              // Plyometric jumping

      // Squatting movements (traditional Indian)
      'Barbell Back Squat': 'hip_ankle_squat_mobility',
      'Sadharan Baithak': 'hip_ankle_squat_mobility',
      'Pehalwani Baithak': 'hip_ankle_squat_mobility',
      'Pehalwani Baithak 2': 'hip_ankle_squat_mobility',
      'Rammurti Baithak': 'hip_ankle_squat_mobility',
      'Hanuman Baithak': 'hip_ankle_squat_mobility',  // Side lunge - lateral plane

      // Hip hinge / Deadlift
      'Barbell Deadlift': 'hip_hinge_mobility'
    };

    const criteriaKey = MOBILITY_CHECKS[exerciseName];
    if (!criteriaKey) return true; // No specific check required

    // Check if user has 3+ "yes" responses for this mobility check
    const checkHistory = this._getMobilityCheckHistory(criteriaKey);
    if (!checkHistory || checkHistory.length < 3) return false;

    const recentChecks = checkHistory.slice(-3);
    return recentChecks.every(check => check.response === 'yes');
  }

  /**
   * Get mobility check history (internal)
   *
   * @param {string} criteriaKey - Mobility check criteria key
   * @returns {Array} Check history
   * @private
   */
  _getMobilityCheckHistory(criteriaKey) {
    try {
      const stored = localStorage.getItem(`build_mobility_checks_${criteriaKey}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[UnlockEvaluator] Error getting mobility checks:', error);
      return [];
    }
  }

  /**
   * Check pain-free status (internal)
   *
   * @param {string} exerciseName - Exercise to check
   * @param {number} requiredWorkouts - Number of pain-free workouts needed
   * @returns {boolean} True if pain-free requirement met
   * @private
   */
  _checkPainFree(exerciseName, requiredWorkouts) {
    const history = this.storage.getExerciseHistory(exerciseName);
    if (!history || history.length < requiredWorkouts) return false;

    // Get last N workouts
    const recentWorkouts = history.slice(-requiredWorkouts);

    // Check pain tracking for each workout
    return recentWorkouts.every(workout => {
      // Pain is tracked in workout object or post-workout modal
      // Assuming pain level 0 = no pain
      return !workout.painLevel || workout.painLevel === 0;
    });
  }

  /**
   * Calculate training weeks for exercise (internal)
   *
   * @param {string} exerciseName - Exercise name
   * @returns {number} Weeks since first workout
   * @private
   */
  _calculateTrainingWeeks(exerciseName) {
    const history = this.storage.getExerciseHistory(exerciseName);
    if (!history || history.length === 0) return 0;

    const firstDate = new Date(history[0].date);
    const now = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;

    return Math.floor((now - firstDate) / msPerWeek);
  }
}
