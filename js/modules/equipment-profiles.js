/**
 * Equipment Profiles Module
 *
 * Filters exercises by available equipment and provides bodyweight
 * substitution logic for scaling difficulty.
 *
 * @module equipment-profiles
 */

/**
 * Equipment requirements mapping
 * Maps exercise names to required equipment types
 * Multiple equipment types = user needs ANY of them
 * @type {Object.<string, string[]>}
 */
export const EQUIPMENT_REQUIREMENTS = {
  // Gym equipment (cables, machines)
  'Seated Cable Row': ['gym'],
  'Cable Chest Fly': ['gym'],
  'T-Bar Row': ['gym'],
  'Face Pulls': ['gym'],
  'Lat Pulldown': ['gym'],
  'Hack Squat': ['gym'],
  'Leg Curl': ['gym'],
  'Leg Extension': ['gym'],
  'Leg Abduction': ['gym'],
  'Standing Calf Raise': ['gym'],
  'Seated Calf Raise': ['gym'],
  'Chest-Supported Row': ['gym'],

  // Dumbbell exercises
  'DB Flat Bench Press': ['dumbbells'],
  'DB Lateral Raises': ['dumbbells'],
  'DB Shoulder Press': ['dumbbells'],
  'Incline DB Press': ['dumbbells'],
  'Reverse Fly': ['dumbbells'],
  'DB Goblet Squat': ['dumbbells'],
  'DB Romanian Deadlift': ['dumbbells'],

  // Barbell exercises
  'Barbell Bench Press': ['barbells'],
  'Barbell Back Squat': ['barbells'],
  'Barbell Deadlift': ['barbells'],
  'Barbell Overhead Press': ['barbells'],

  // Mudgal/Gada exercises
  'Mudgal 360 Swings': ['mudgal'],
  'Mudgal Pendulum': ['mudgal'],

  // Bodyweight (always available)
  'Hindu Danda': ['bodyweight'],
  'Vruschik Danda': ['bodyweight'],
  'Standard Baithak': ['bodyweight'],
  'Full-sole Baithak': ['bodyweight'],
  'Jumping Baithak': ['bodyweight'],
  'Plank': ['bodyweight'],
  'Dead Bug': ['bodyweight'],
  'Side Plank': ['bodyweight'],
  '45° Hyperextension': ['bodyweight', 'gym'],
  'Hip Thrust': ['bodyweight', 'dumbbells', 'barbells'],

  // Bands (warm-up equipment)
  'Band Pull-Aparts': ['bands'],
  'Band Over-and-Backs': ['bands'],
  'Band External Rotation': ['bands']
};

/**
 * Bodyweight regression scaling
 * Maps DB weight ranges to appropriate bodyweight variations
 * @type {Object.<string, Object.<string, string>>}
 */
export const BODYWEIGHT_REGRESSIONS = {
  'DB Flat Bench Press': {
    '0-10kg': 'Incline Hindu Danda',  // Hands elevated on bench
    '10-15kg': 'Hindu Danda',         // Standard
    '15kg+': 'Hindu Danda'            // Standard (user ready)
  },
  'DB Goblet Squat': {
    '0-10kg': 'Standard Baithak',
    '10-15kg': 'Full-sole Baithak',
    '15kg+': 'Full-sole Baithak'
  }
  // Add more as needed during implementation
};

/**
 * Filter exercises by equipment profile
 *
 * @param {string[]} exercises - Array of exercise names
 * @param {Object} profile - Equipment profile {gym: bool, dumbbells: bool, ...}
 * @returns {string[]} Filtered exercise array
 */
export function filterExercisesByProfile(exercises, profile) {
  if (!exercises || !Array.isArray(exercises)) {
    console.warn('[EquipmentProfiles] Invalid exercises array');
    return [];
  }

  if (!profile || typeof profile !== 'object') {
    console.warn('[EquipmentProfiles] Invalid equipment profile');
    return exercises; // Return all if no profile (safe default)
  }

  return exercises.filter(exercise => {
    const requirements = EQUIPMENT_REQUIREMENTS[exercise];

    // If no requirements defined, assume bodyweight (always available)
    if (!requirements) {
      return true;
    }

    // Exercise available if user has ANY of the required equipment
    return requirements.some(equipmentType => profile[equipmentType] === true);
  });
}

/**
 * Get bodyweight substitute for dumbbell exercise
 *
 * @param {string} exerciseName - DB exercise name
 * @param {number} userWeight - Current DB weight user is using (kg)
 * @returns {string|null} Bodyweight substitute or null if none available
 * @example
 * getBodyweightSubstitute('DB Flat Bench Press', 12) // Returns 'Hindu Danda'
 * getBodyweightSubstitute('Seated Cable Row', 20) // Returns null (no bodyweight substitute)
 */
export function getBodyweightSubstitute(exerciseName, userWeight) {
  const regressionMap = BODYWEIGHT_REGRESSIONS[exerciseName];

  if (!regressionMap) {
    return null; // No bodyweight substitute for this exercise
  }

  // Validate userWeight input
  if (typeof userWeight !== 'number' || isNaN(userWeight) || userWeight < 0) {
    console.warn('[EquipmentProfiles] Invalid userWeight:', userWeight);
    return null;
  }

  // Determine weight bracket
  if (userWeight < 10) {
    return regressionMap['0-10kg'];
  } else if (userWeight < 15) {
    return regressionMap['10-15kg'];
  } else {
    return regressionMap['15kg+'];
  }
}

/**
 * Check if exercise requires specific equipment
 *
 * @param {string} exerciseName - Name of exercise
 * @param {string} equipmentType - Equipment type to check
 * @returns {boolean} True if exercise requires this equipment
 */
export function requiresEquipment(exerciseName, equipmentType) {
  const requirements = EQUIPMENT_REQUIREMENTS[exerciseName];
  if (!requirements) return false;
  return requirements.includes(equipmentType);
}
