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
  // SIMPLE tier (31 exercises: machine-guided, isolation, seated, stable base)
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
  'DB Chest Fly': COMPLEXITY_TIERS.SIMPLE,
  'Cable Lateral Raises': COMPLEXITY_TIERS.SIMPLE,
  'Lean-Away Cable Laterals': COMPLEXITY_TIERS.SIMPLE,
  'Machine Lateral Raises': COMPLEXITY_TIERS.SIMPLE,
  'Heavy Face Pulls with pause': COMPLEXITY_TIERS.SIMPLE,
  'Lat Pulldown (neutral grip)': COMPLEXITY_TIERS.SIMPLE,
  'Lat Pulldown (close grip)': COMPLEXITY_TIERS.SIMPLE,
  'Cable Pullover': COMPLEXITY_TIERS.SIMPLE,
  'Straight-Arm Lat Pulldown': COMPLEXITY_TIERS.SIMPLE,
  'Dumbbell Pullover': COMPLEXITY_TIERS.SIMPLE,
  'Reverse Pec Deck': COMPLEXITY_TIERS.SIMPLE,
  'Rear Delt Cable Fly': COMPLEXITY_TIERS.SIMPLE,
  'Cable Upright Row': COMPLEXITY_TIERS.SIMPLE,
  'Smith Machine Upright Row': COMPLEXITY_TIERS.SIMPLE,
  'Preacher Curl': COMPLEXITY_TIERS.SIMPLE,
  'Cable Curl': COMPLEXITY_TIERS.SIMPLE,
  'Concentration Curl': COMPLEXITY_TIERS.SIMPLE,
  'Overhead Cable Triceps Extension': COMPLEXITY_TIERS.SIMPLE,
  'Cable Triceps Pushdown': COMPLEXITY_TIERS.SIMPLE,

  // MODERATE tier (62 exercises: multi-joint OR unstable base OR multi-plane)
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
  'Barbell Bent-Over Row': COMPLEXITY_TIERS.MODERATE,
  'Pendlay Row': COMPLEXITY_TIERS.MODERATE,
  'DB Incline Bench Press': COMPLEXITY_TIERS.MODERATE,
  'Close-Grip Bench Press': COMPLEXITY_TIERS.MODERATE,
  'DB Flat Bench (neutral grip)': COMPLEXITY_TIERS.MODERATE,
  'DB Incline Bench (neutral grip)': COMPLEXITY_TIERS.MODERATE,
  'Machine Chest Press': COMPLEXITY_TIERS.MODERATE,
  'Smith Machine Bench Press': COMPLEXITY_TIERS.MODERATE,
  'Low-to-High Cable Fly': COMPLEXITY_TIERS.MODERATE,
  'High-to-Low Cable Fly': COMPLEXITY_TIERS.MODERATE,
  'Chest Dip': COMPLEXITY_TIERS.MODERATE,
  'Incline Push-Up': COMPLEXITY_TIERS.MODERATE,
  'Floor Press': COMPLEXITY_TIERS.MODERATE,
  'Paused Bench Press': COMPLEXITY_TIERS.MODERATE,
  'Spoto Press': COMPLEXITY_TIERS.MODERATE,
  'Cable Row (wide grip)': COMPLEXITY_TIERS.MODERATE,
  'Cable Row (close grip)': COMPLEXITY_TIERS.MODERATE,
  'Single-Arm Cable Row': COMPLEXITY_TIERS.MODERATE,
  'Inverted Row': COMPLEXITY_TIERS.MODERATE,
  'Assisted Pull-Up': COMPLEXITY_TIERS.MODERATE,
  'Lat Pulldown (underhand)': COMPLEXITY_TIERS.MODERATE,
  'DB Row (elbow out)': COMPLEXITY_TIERS.MODERATE,
  'DB Row (elbow in)': COMPLEXITY_TIERS.MODERATE,
  'Chest-Supported DB Row': COMPLEXITY_TIERS.MODERATE,
  'Meadows Row': COMPLEXITY_TIERS.MODERATE,
  'Single-Arm Landmine Row': COMPLEXITY_TIERS.MODERATE,
  'Paused Barbell Row': COMPLEXITY_TIERS.MODERATE,
  'Seated DB Shoulder Press': COMPLEXITY_TIERS.MODERATE,
  'Arnold Press': COMPLEXITY_TIERS.MODERATE,
  'Machine Shoulder Press': COMPLEXITY_TIERS.MODERATE,
  'DB Reverse Fly (standing)': COMPLEXITY_TIERS.MODERATE,
  'DB Reverse Fly (incline bench)': COMPLEXITY_TIERS.MODERATE,
  'DB Upright Row': COMPLEXITY_TIERS.MODERATE,
  'Barbell Upright Row': COMPLEXITY_TIERS.MODERATE,
  'DB Shrug': COMPLEXITY_TIERS.MODERATE,
  'Barbell Shrug': COMPLEXITY_TIERS.MODERATE,
  'Machine Shrug': COMPLEXITY_TIERS.MODERATE,
  'Leg Press': COMPLEXITY_TIERS.MODERATE,
  'Bulgarian Split Squat': COMPLEXITY_TIERS.MODERATE,
  'Walking Lunges': COMPLEXITY_TIERS.MODERATE,
  'Smith Machine Squat': COMPLEXITY_TIERS.MODERATE,
  'Front-Loaded Goblet Squat': COMPLEXITY_TIERS.MODERATE,
  'Sumo Squat': COMPLEXITY_TIERS.MODERATE,
  'Box Squat': COMPLEXITY_TIERS.MODERATE,
  'Pause Squat': COMPLEXITY_TIERS.MODERATE,
  'Single-Leg Romanian Deadlift': COMPLEXITY_TIERS.MODERATE,
  'Good Morning': COMPLEXITY_TIERS.MODERATE,
  'Nordic Curl': COMPLEXITY_TIERS.MODERATE,
  'Glute-Ham Raise': COMPLEXITY_TIERS.MODERATE,
  'Reverse Hyper': COMPLEXITY_TIERS.MODERATE,
  'Cable Pull-Through': COMPLEXITY_TIERS.MODERATE,

  // MODERATE tier additions
  'Ardha Baithak': COMPLEXITY_TIERS.MODERATE,          // Half squat - partial ROM, less demanding

  // COMPLEX tier (22 exercises: multi-joint + unstable base + multi-plane, or advanced barbell/bodyweight/traditional)
  // Barbell compound movements
  'Barbell Bench Press': COMPLEXITY_TIERS.COMPLEX,
  'Barbell Back Squat': COMPLEXITY_TIERS.COMPLEX,
  'Barbell Deadlift': COMPLEXITY_TIERS.COMPLEX,
  'Barbell Overhead Press': COMPLEXITY_TIERS.COMPLEX,

  // Traditional Indian Dand (push-up) variations
  'Sadharan Dand': COMPLEXITY_TIERS.COMPLEX,           // Basic traditional push-up with hip bridge
  'Rammurti Dand': COMPLEXITY_TIERS.COMPLEX,           // Flowing sweep - down-forward, reverse through hands, push up
  'Hanuman Dand': COMPLEXITY_TIERS.COMPLEX,            // Dips position with leg forward lunge
  'Vrushchik Dand': COMPLEXITY_TIERS.COMPLEX,          // Scorpion - leg crossing over in plank
  'Vrushchik Dand 2': COMPLEXITY_TIERS.COMPLEX,        // Scorpion - forearm stand with backbend
  'Parshava Dand': COMPLEXITY_TIERS.COMPLEX,           // Lateral - leg crossing under in plank
  'Chakra Dand': COMPLEXITY_TIERS.COMPLEX,             // Circular leg movements in plank
  'Advance Hanuman Dand': COMPLEXITY_TIERS.COMPLEX,    // Explosive variation with leg thrust
  'Vaksh vikasak Dand': COMPLEXITY_TIERS.COMPLEX,      // Chest expansion - elbows flared, palms inward
  'Palat Dand': COMPLEXITY_TIERS.COMPLEX,              // Rotation to side plank
  'Sher Dand': COMPLEXITY_TIERS.COMPLEX,               // Lion - handstand push-up
  'Sarp Dand': COMPLEXITY_TIERS.COMPLEX,               // Snake - pulsing torso or flowing dog↔cobra
  'Mishr Dand': COMPLEXITY_TIERS.COMPLEX,              // Mixed - plyometric jumping

  // Traditional Indian Baithak (squat) variations
  'Sadharan Baithak': COMPLEXITY_TIERS.COMPLEX,        // Regular full squat with arm swing (aka Purna Baithak)
  'Pehalwani Baithak': COMPLEXITY_TIERS.COMPLEX,       // Wrestler's squat with forward jump
  'Pehalwani Baithak 2': COMPLEXITY_TIERS.COMPLEX,     // Wrestler's squat with triple jump
  'Rammurti Baithak': COMPLEXITY_TIERS.COMPLEX,        // Named variant
  'Hanuman Baithak': COMPLEXITY_TIERS.COMPLEX          // Side lunge squat - lateral plane
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
