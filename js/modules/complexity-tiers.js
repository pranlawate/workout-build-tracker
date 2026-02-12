/**
 * Complexity Tiers Module
 *
 * Classifies exercises by biomechanical complexity (Simple/Moderate/Complex)
 * based on joint involvement, stability requirements, and movement planes.
 *
 * @module complexity-tiers
 */

export const COMPLEXITY_TIERS = {
  SIMPLE: 'simple',
  MODERATE: 'moderate',
  COMPLEX: 'complex'
};

/**
 * Exercise complexity classifications
 *
 * Simple: Single-joint, stable base, single plane
 * Moderate: Multi-joint OR unstable base OR multi-plane
 * Complex: Multi-joint + unstable base + multi-plane
 */
export const EXERCISE_COMPLEXITY = {
  // SIMPLE tier (7 exercises)
  'Cable Chest Fly': COMPLEXITY_TIERS.SIMPLE,
  'DB Lateral Raises': COMPLEXITY_TIERS.SIMPLE,
  'Face Pulls': COMPLEXITY_TIERS.SIMPLE,
  'Leg Curl': COMPLEXITY_TIERS.SIMPLE,
  'Leg Extension': COMPLEXITY_TIERS.SIMPLE,
  'Standing Calf Raise': COMPLEXITY_TIERS.SIMPLE,
  'Reverse Fly': COMPLEXITY_TIERS.SIMPLE,
  'Leg Abduction': COMPLEXITY_TIERS.SIMPLE,
  'Seated Calf Raise': COMPLEXITY_TIERS.SIMPLE,
  'Plank': COMPLEXITY_TIERS.SIMPLE,
  'Dead Bug': COMPLEXITY_TIERS.SIMPLE,
  'Side Plank': COMPLEXITY_TIERS.SIMPLE,

  // MODERATE tier (10 exercises)
  'DB Flat Bench Press': COMPLEXITY_TIERS.MODERATE,
  'Seated Cable Row': COMPLEXITY_TIERS.MODERATE,
  'T-Bar Row': COMPLEXITY_TIERS.MODERATE,
  'Lat Pulldown': COMPLEXITY_TIERS.MODERATE,
  'DB Shoulder Press': COMPLEXITY_TIERS.MODERATE,
  'Chest-Supported Row': COMPLEXITY_TIERS.MODERATE,
  'Incline DB Press': COMPLEXITY_TIERS.MODERATE,
  'Hack Squat': COMPLEXITY_TIERS.MODERATE,
  '45° Hyperextension': COMPLEXITY_TIERS.MODERATE,
  'DB Goblet Squat': COMPLEXITY_TIERS.MODERATE,
  'DB Romanian Deadlift': COMPLEXITY_TIERS.MODERATE,
  'Hip Thrust': COMPLEXITY_TIERS.MODERATE,

  // COMPLEX tier (4 exercises + progressions)
  'Barbell Bench Press': COMPLEXITY_TIERS.COMPLEX,
  'Barbell Back Squat': COMPLEXITY_TIERS.COMPLEX,
  'Barbell Deadlift': COMPLEXITY_TIERS.COMPLEX,
  'Barbell Overhead Press': COMPLEXITY_TIERS.COMPLEX,
  'Hindu Danda': COMPLEXITY_TIERS.COMPLEX,
  'Vruschik Danda': COMPLEXITY_TIERS.COMPLEX,
  'Standard Baithak': COMPLEXITY_TIERS.COMPLEX,
  'Jumping Baithak': COMPLEXITY_TIERS.COMPLEX
};

/**
 * Unlock criteria per complexity tier
 */
export const UNLOCK_CRITERIA = {
  [COMPLEXITY_TIERS.SIMPLE]: {
    strengthMilestone: false,  // No requirement
    mobilityCheck: false,
    painFreeWeeks: 0,
    trainingWeeks: 0
  },
  [COMPLEXITY_TIERS.MODERATE]: {
    strengthMilestone: true,   // Must hit weight × reps target
    mobilityCheck: false,      // Optional
    painFreeWeeks: 0,
    trainingWeeks: 4           // 4+ weeks training prerequisite
  },
  [COMPLEXITY_TIERS.COMPLEX]: {
    strengthMilestone: true,   // Must hit weight × reps target
    mobilityCheck: true,       // Required
    painFreeWeeks: 5,          // 5+ workouts pain-free
    trainingWeeks: 8           // 8+ weeks training prerequisite
  }
};

/**
 * Get complexity tier for an exercise
 *
 * @param {string} exerciseName - Name of exercise
 * @returns {string} Complexity tier (simple|moderate|complex)
 */
export function getComplexityTier(exerciseName) {
  if (!exerciseName || typeof exerciseName !== 'string') {
    console.warn(`[ComplexityTiers] Invalid exercise name: ${exerciseName}`);
    return COMPLEXITY_TIERS.SIMPLE; // Safe default
  }

  const tier = EXERCISE_COMPLEXITY[exerciseName];
  if (!tier) {
    console.warn(`[ComplexityTiers] Unknown exercise: ${exerciseName}`);
    return COMPLEXITY_TIERS.SIMPLE; // Safe default
  }

  return tier;
}

/**
 * Get unlock criteria for an exercise
 *
 * @param {string} exerciseName - Name of exercise
 * @returns {Object} Unlock criteria requirements
 */
export function getUnlockCriteria(exerciseName) {
  const tier = getComplexityTier(exerciseName);
  return UNLOCK_CRITERIA[tier];
}

/**
 * Check if exercise is unlocked by default (SIMPLE tier)
 *
 * @param {string} exerciseName - Name of exercise
 * @returns {boolean} True if no unlock requirements
 */
export function isUnlockedByDefault(exerciseName) {
  return getComplexityTier(exerciseName) === COMPLEXITY_TIERS.SIMPLE;
}
