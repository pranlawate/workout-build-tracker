/**
 * Warm-Up Protocols Module
 *
 * Built with Science research-backed warm-up sequences.
 * Equipment-aware with smart substitutions.
 *
 * @module warm-up-protocols
 */

/**
 * Upper body warm-up protocol (5-7 min)
 * For Upper A and Upper B workouts
 *
 * @param {Object} equipmentProfile - User's equipment profile
 * @returns {Array} Warm-up exercises with reps/duration
 */
export function getUpperBodyWarmup(equipmentProfile) {
  const hasBands = equipmentProfile?.bands !== false;

  return [
    { name: 'Wrist Circles', reps: '10 each direction', duration: null },
    { name: 'Arm Circles', reps: '10 forward, 10 back', duration: null },
    {
      name: hasBands ? 'Band Over-and-Backs' : 'Arm Circles Extended',
      reps: hasBands ? '5 reps' : '15 reps',
      duration: null,
      note: hasBands ? null : 'Equipment substitution: no bands available'
    },
    {
      name: hasBands ? 'Band Pull-Aparts' : 'Scapular Wall Slides',
      reps: hasBands ? '10 reps' : '10 reps',
      duration: null,
      note: hasBands ? null : 'Equipment substitution: no bands available'
    },
    {
      name: hasBands ? 'Band External Rotation' : 'Floor Angels',
      reps: hasBands ? '10-15 per side' : '10 reps',
      duration: null,
      note: hasBands ? null : 'Equipment substitution: no bands available'
    },
    { name: 'DB Shoulder Extensions', reps: '10-15 per side', duration: null }
  ];
}

/**
 * Lower body warm-up protocol (5-8 min)
 * For Lower A and Lower B workouts
 *
 * @returns {Array} Warm-up exercises with reps/duration
 */
export function getLowerBodyWarmup() {
  return [
    { name: 'Light Cycling', reps: null, duration: '3-5 minutes' },
    { name: 'Forward & Back Leg Swings', reps: '10-15 per side', duration: null },
    { name: 'Side-to-Side Leg Swings', reps: '10-15 per side', duration: null },
    { name: 'Spiderman Lunge w/ Thoracic Extension', reps: '5 per side', duration: null },
    { name: 'Wall Ankle Mobilization', reps: '5 per side w/ 2 sec hold', duration: null }
  ];
}

/**
 * Get warm-up sets for first exercise
 *
 * @param {number} workingWeight - Working weight for first exercise
 * @returns {Array} Warm-up set protocol
 */
export function getWarmupSets(workingWeight) {
  return [
    { weight: Math.round(workingWeight * 0.5), reps: 8, rest: '45-60 sec' },
    { weight: Math.round(workingWeight * 0.7), reps: '3-4', rest: '45-60 sec' },
    { weight: Math.round(workingWeight * 0.9), reps: 1, rest: '2 min' }
  ];
}

/**
 * Get warm-up protocol for workout type
 *
 * @param {string} workoutKey - Workout key (e.g., 'UPPER_A')
 * @param {Object} equipmentProfile - User's equipment profile
 * @returns {Object} Warm-up protocol
 */
export function getWarmupProtocol(workoutKey, equipmentProfile) {
  const isUpper = workoutKey.startsWith('UPPER');

  return {
    exercises: isUpper
      ? getUpperBodyWarmup(equipmentProfile)
      : getLowerBodyWarmup(),
    warmupSets: true, // Always include warm-up sets for first exercise
    estimatedDuration: isUpper ? '5-7 min' : '5-8 min'
  };
}
