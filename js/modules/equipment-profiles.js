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
  'DB Chest Fly': ['dumbbells'],
  'Machine Fly': ['gym'],
  'Landmine Press': ['barbells', 'gym'],
  'Reverse Fly': ['dumbbells'],
  'DB Goblet Squat': ['dumbbells'],
  'DB Romanian Deadlift': ['dumbbells'],

  // Barbell exercises
  'Barbell Bench Press': ['barbells'],
  'Barbell Back Squat': ['barbells'],
  'Barbell Deadlift': ['barbells'],
  'Barbell Overhead Press': ['barbells'],

  // Kettlebell exercises
  'KB Goblet Squat': ['kettlebells'],
  'KB Swings': ['kettlebells'],

  // Mudgal/Gada exercises
  'Mudgal 360 Swings': ['mudgal'],
  'Mudgal Pendulum': ['mudgal'],

  // Bodyweight (always available)
  'Sadharan Dand': ['bodyweight'],
  'Vrushchik Dand': ['bodyweight'],
  'Sadharan Baithak': ['bodyweight'],
  'Ardha Baithak': ['bodyweight'],
  'Plank': ['bodyweight'],
  'Dead Bug': ['bodyweight'],
  'Side Plank': ['bodyweight'],
  'Reverse Crunch': ['bodyweight'],
  'Pallof Press': ['cables', 'gym'],
  '45° Hyperextension': ['bodyweight', 'gym'],
  'Hip Thrust': ['bodyweight', 'dumbbells', 'barbells'],

  // Bands (warm-up equipment)
  'Band Pull-Aparts': ['bands'],
  'Band Over-and-Backs': ['bands'],
  'Band External Rotation': ['bands'],

  // UPPER_A - Triceps
  'Tricep Pushdowns': ['cables', 'gym'],
  'Overhead Tricep Extension': ['dumbbells'],
  'Decline DB Press': ['dumbbells', 'gym'],

  // UPPER_B - Biceps
  'Standard DB Curls': ['dumbbells'],
  'DB Hammer Curls': ['dumbbells'],

  // LOWER_A - Machines
  'Leg Press': ['gym'],
  'Leg Adduction': ['gym']
};

/**
 * Bodyweight regression scaling
 * Maps DB weight ranges to appropriate bodyweight variations
 * @type {Object.<string, Object.<string, string>>}
 */
export const BODYWEIGHT_REGRESSIONS = {
  'Incline DB Press': {
    '0-10kg': 'Incline Push-ups',     // Hands elevated on bench
    '10-15kg': 'Sadharan Dand',       // Basic traditional push-up
    '15kg+': 'Sadharan Dand'          // Standard (user ready)
  },
  'Hack Squat': {
    '0-45kg': 'Ardha Baithak',        // Light machine load, partial pattern
    '45-80kg': 'Sadharan Baithak',    // Building toward full pattern
    '80kg+': 'Sadharan Baithak'       // Standard (user ready)
  }
  // Add more as needed during implementation
};

/**
 * Map user load to bodyweight substitute using bracket keys (e.g. "0-10kg", "15kg+").
 * @param {Object.<string, string>} regressionMap
 * @param {number} userWeight
 * @returns {string|null}
 */
function pickSubstituteFromBrackets(regressionMap, userWeight) {
  const ranges = [];
  const pluses = [];
  for (const key of Object.keys(regressionMap)) {
    const rangeMatch = key.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)kg$/);
    if (rangeMatch) {
      ranges.push({
        lo: Number(rangeMatch[1]),
        hi: Number(rangeMatch[2]),
        sub: regressionMap[key]
      });
      continue;
    }
    const plusMatch = key.match(/^(\d+(?:\.\d+)?)kg\+$/);
    if (plusMatch) {
      pluses.push({ lo: Number(plusMatch[1]), sub: regressionMap[key] });
    }
  }
  if (ranges.length === 0 && pluses.length === 0) {
    return null;
  }
  ranges.sort((a, b) => a.lo - b.lo);
  for (const r of ranges) {
    if (userWeight >= r.lo && userWeight < r.hi) {
      return r.sub;
    }
  }
  pluses.sort((a, b) => b.lo - a.lo);
  for (const p of pluses) {
    if (userWeight >= p.lo) {
      return p.sub;
    }
  }
  return null;
}

/**
 * Get bodyweight substitute for dumbbell exercise
 *
 * @param {string} exerciseName - DB exercise name
 * @param {number} userWeight - Current DB weight user is using (kg)
 * @returns {string|null} Bodyweight substitute or null if none available
 * @example
 * getBodyweightSubstitute('Incline DB Press', 12) // Returns 'Sadharan Dand'
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

  const fromBrackets = pickSubstituteFromBrackets(regressionMap, userWeight);
  if (fromBrackets !== null) {
    return fromBrackets;
  }

  // Legacy fixed thresholds if map uses only classic dumbbell brackets
  if (regressionMap['0-10kg'] && regressionMap['10-15kg'] && regressionMap['15kg+']) {
    if (userWeight < 10) {
      return regressionMap['0-10kg'];
    }
    if (userWeight < 15) {
      return regressionMap['10-15kg'];
    }
    return regressionMap['15kg+'];
  }

  return null;
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
