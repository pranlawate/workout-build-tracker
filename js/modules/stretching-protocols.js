/**
 * Stretching Protocols Module
 *
 * Built with Science research-backed static stretching sequences.
 * Workout-specific protocols for optimal recovery.
 *
 * @module stretching-protocols
 */

// Constants for LISS recommendations
const CARDIO_MACHINES = {
  BIKE: 'bike',
  ELLIPTICAL: 'elliptical',
  TREADMILL: 'treadmill',
  TREADMILL_CAUTION: 'treadmill_caution'
};

const DEFAULT_LISS_DURATION_MINUTES = 10;

const WORKOUT_TYPE_PREFIX = {
  LOWER: 'LOWER'
};

const WARNINGS = {
  EMOJI_CAUTION: '⚠️',
  LOWER_FATIGUE: 'Legs are fatigued - avoid high-impact',
  UPPER_FRESH: 'Legs are fresh - any low-impact cardio works',
  TREADMILL_LOWER: 'Walking only - legs need rest',
  TREADMILL_UPPER: 'Walking pace recommended'
};

/**
 * Upper body stretching protocol (4-5 min)
 * For Upper A and Upper B workouts
 *
 * @returns {Array<{name: string, duration: string, target: string, instructions: string}>} Static stretches with duration and targets
 */
export function getUpperBodyStretches() {
  return [
    {
      name: 'Doorway Chest Stretch',
      duration: '30-60s per side',
      target: 'chest, front delts',
      instructions: 'Place forearm on doorframe, gently lean forward'
    },
    {
      name: 'Cross-Body Shoulder Stretch',
      duration: '30s per side',
      target: 'rear delts, rotator cuff',
      instructions: 'Pull arm across chest, hold with opposite hand'
    },
    {
      name: 'Isometric Scapular Retraction Hold',
      duration: '2 × 20-30s',
      target: 'mid/lower traps, rhomboids (tendon)',
      instructions: '🦴 Stand tall, squeeze shoulder blades together hard, arms at sides. Hold max contraction. Strengthens scapular retractor tendons.'
    },
    {
      name: 'Behind-Back Lat Stretch',
      duration: '30-60s',
      target: 'lats, teres major',
      instructions: 'Clasp hands behind back, straighten arms, lift gently'
    },
    {
      name: 'Wrist Isometric Wall Press',
      duration: '20-30s each direction',
      target: 'forearm tendons (flexor/extensor)',
      instructions: '🦴 Palm flat on wall at waist height, lean in gently for flexor load. Then back of hand on wall for extensor load. Loaded stretch beats passive.'
    },
    {
      name: 'Upper Trap Stretch',
      duration: '30s per side',
      target: 'upper trapezius, neck',
      instructions: 'Tilt ear to shoulder, gently pull head with same-side hand. Keep opposite shoulder down.'
    },
    {
      name: 'Levator Scapulae Stretch',
      duration: '30s per side',
      target: 'levator scapulae, neck',
      instructions: 'Turn head 45° to one side, tuck chin down toward armpit. Gently pull with same-side hand.'
    }
  ];
}

/**
 * Lower body stretching protocol (6-8 min)
 * For Lower A and Lower B workouts
 *
 * @returns {Array<{name: string, duration: string, target: string, instructions: string}>} Static stretches with duration and targets
 */
export function getLowerBodyStretches() {
  return [
    {
      name: 'Wall Sit Isometric Hold',
      duration: '1 × 30-45s',
      target: 'quad/patellar tendons',
      instructions: '🦴 Back flat on wall, thighs parallel to floor. Loaded hold strengthens patellar and quad tendons more than passive stretching. Progress by adding 10s weekly.'
    },
    {
      name: 'Standing Hamstring Stretch',
      duration: '30-60s per side',
      target: 'hamstrings',
      instructions: 'Leg on bench, hinge at hips, keep back straight'
    },
    {
      name: 'Hip Flexor Stretch (lunge position)',
      duration: '30-60s per side',
      target: 'hip flexors, psoas',
      instructions: 'Low lunge position, push hips forward, keep back straight'
    },
    {
      name: 'Figure-4 Glute Stretch',
      duration: '30-60s per side',
      target: 'glutes, piriformis',
      instructions: 'Seated, cross ankle over opposite knee, lean forward'
    },
    {
      name: 'Single-Leg Calf Raise Bottom Hold',
      duration: '20-30s per side',
      target: 'Achilles tendon, soleus',
      instructions: '🦴 Stand on step edge, lower heel below platform on one leg. Hold the deep stretch under bodyweight. Loaded Achilles tendon strengthening.'
    },
    {
      name: 'Seated Spinal Twist',
      duration: '30s per side',
      target: 'lower back, obliques',
      instructions: 'Seated, cross leg over, twist torso, look behind shoulder'
    }
  ];
}

/**
 * Upper body foam rolling protocol (3-5 min)
 * For Upper A and Upper B workouts
 *
 * @returns {Array<{area: string, duration: string, note: string}>} Foam rolling areas with duration and notes
 */
export function getUpperBodyFoamRolling() {
  return [
    {
      area: 'Upper Back/Traps',
      duration: '30-60s',
      note: 'Roll side to side, pause on tender spots'
    },
    {
      area: 'Lats',
      duration: '30-60s per side',
      note: 'Arm overhead, roll along side body'
    },
    {
      area: 'Chest/Pec Minor',
      duration: '30-60s',
      note: 'Use lacrosse ball against wall, slow circles'
    }
  ];
}

/**
 * Lower body foam rolling protocol (5-8 min)
 * For Lower A and Lower B workouts
 *
 * @returns {Array<{area: string, duration: string, note: string}>} Foam rolling areas with duration and notes
 */
export function getLowerBodyFoamRolling() {
  return [
    {
      area: 'Quads',
      duration: '30-60s per leg',
      note: 'Roll from hip to knee, pause on tender spots'
    },
    {
      area: 'IT Band',
      duration: '30-60s per leg',
      note: 'Side of thigh, slow passes, very tender'
    },
    {
      area: 'Glutes',
      duration: '30-60s per side',
      note: 'Sit on roller, cross ankle over knee, roll glute'
    },
    {
      area: 'Calves',
      duration: '30-60s per leg',
      note: 'Roll from ankle to knee, point/flex foot'
    }
  ];
}

/**
 * Get LISS cardio recommendation based on workout type
 *
 * @param {string} workoutKey - Workout key (e.g., 'UPPER_A', 'LOWER_A')
 * @returns {{recommended: string, alternatives: string[], duration: number, warning: string, treadmillNote: string}} Recommendation with machine, warnings, duration
 */
export function getLISSRecommendation(workoutKey) {
  const isLower = workoutKey.startsWith(WORKOUT_TYPE_PREFIX.LOWER);

  return {
    recommended: CARDIO_MACHINES.BIKE,
    alternatives: isLower
      ? [CARDIO_MACHINES.ELLIPTICAL, CARDIO_MACHINES.TREADMILL_CAUTION]
      : [CARDIO_MACHINES.ELLIPTICAL, CARDIO_MACHINES.TREADMILL],
    duration: DEFAULT_LISS_DURATION_MINUTES,
    warning: isLower
      ? `${WARNINGS.EMOJI_CAUTION} ${WARNINGS.LOWER_FATIGUE}`
      : WARNINGS.UPPER_FRESH,
    treadmillNote: isLower
      ? `${WARNINGS.EMOJI_CAUTION} ${WARNINGS.TREADMILL_LOWER}`
      : WARNINGS.TREADMILL_UPPER
  };
}
