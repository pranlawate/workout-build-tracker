/**
 * Unlock Criteria Module
 *
 * Defines exercise-specific unlock requirements beyond tier-based defaults.
 * Includes strength milestones, mobility checks, pain-free requirements,
 * training weeks, and prerequisite exercises.
 *
 * @module unlock-criteria
 */

/**
 * Exercise-specific unlock criteria
 *
 * Each entry can override tier defaults with specific requirements:
 * - strengthMilestone: { exercise, threshold: { weight, reps, sets } }
 * - mobilityCheck: Description of required mobility validation
 * - painFree: Boolean or number of pain-free workouts required
 * - trainingWeeks: Minimum weeks training prerequisite exercise
 * - prerequisiteExercise: Specific exercise that must be trained first
 */
export const EXERCISE_UNLOCK_CRITERIA = {
  // Barbell Bench Press (from DB Flat Bench Press)
  'Barbell Bench Press': {
    strengthMilestone: {
      exercise: 'DB Flat Bench Press',
      threshold: { weight: 15, reps: 12, sets: 3 }
    },
    mobilityCheck: 'Scapular retraction proficiency',
    painFreeWeeks: 5,
    trainingWeeks: 8
  },

  // Sadharan Dand (from DB Flat Bench Press)
  'Sadharan Dand': {
    strengthMilestone: {
      exercise: 'DB Flat Bench Press',
      threshold: { weight: 15, reps: 12, sets: 3 }
    },
    mobilityCheck: 'Thoracic mobility proficiency',
    painFreeWeeks: 5,
    trainingWeeks: 8
  },

  // Barbell Back Squat (from Hack Squat)
  'Barbell Back Squat': {
    strengthMilestone: {
      exercise: 'Hack Squat',
      threshold: { weight: 60, reps: 10, sets: 3 }
    },
    mobilityCheck: 'Hip and ankle squat mobility',
    painFreeWeeks: 5,
    trainingWeeks: 8
  },

  // Pull-ups (from Lat Pulldown)
  'Pull-ups': {
    strengthMilestone: {
      exercise: 'Lat Pulldown',
      threshold: { weight: 50, reps: 10, sets: 3 }
    },
    mobilityCheck: 'Shoulder overhead mobility',
    painFreeWeeks: 5,
    trainingWeeks: 8
  },

  // KB Swings (MODERATE tier with specific safety requirements)
  'KB Swings': {
    strengthMilestone: {
      exercise: 'Hip Thrust',
      threshold: { weight: 40, reps: 12, sets: 3 }
    },
    mobilityCheck: 'Hip hinge pattern proficiency',
    painFree: true,  // No lower back pain in last 4 weeks
    trainingWeeks: 8,
    prerequisiteExercise: 'DB Romanian Deadlift'
  }
};

/**
 * Get exercise-specific unlock criteria
 *
 * @param {string} exerciseName - Name of exercise
 * @returns {Object|null} Specific criteria or null if using tier defaults
 */
export function getExerciseUnlockCriteria(exerciseName) {
  if (!exerciseName || typeof exerciseName !== 'string') {
    console.warn(`[UnlockCriteria] Invalid exercise name: ${exerciseName}`);
    return null;
  }

  return EXERCISE_UNLOCK_CRITERIA[exerciseName] || null;
}

/**
 * Get strength milestone for a progression
 *
 * @param {string} currentExercise - Current exercise being performed
 * @param {string} targetExercise - Exercise to unlock
 * @returns {Object|null} Milestone threshold or null
 */
export function getStrengthMilestone(currentExercise, targetExercise) {
  const criteria = EXERCISE_UNLOCK_CRITERIA[targetExercise];
  if (!criteria || !criteria.strengthMilestone) {
    return null;
  }

  // Check if currentExercise matches the prerequisite
  if (criteria.strengthMilestone.exercise !== currentExercise) {
    return null;
  }

  return criteria.strengthMilestone.threshold;
}

/**
 * Check if exercise has prerequisite requirement
 *
 * @param {string} exerciseName - Name of exercise
 * @returns {string|null} Prerequisite exercise name or null
 */
export function getPrerequisiteExercise(exerciseName) {
  const criteria = EXERCISE_UNLOCK_CRITERIA[exerciseName];
  return criteria?.prerequisiteExercise || null;
}
