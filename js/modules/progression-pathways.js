/**
 * Progression Pathways Module
 *
 * Defines progression paths (Easier/Harder/Alternate) for all 26 exercises.
 * Each exercise occupies a slot with biomechanically appropriate progressions.
 *
 * @module progression-pathways
 */

/**
 * Progression path structure per exercise slot
 *
 * easier: Array of regression options (lower complexity/load)
 * current: Default exercise in this slot
 * harder: Array of progression options (higher complexity/load)
 * alternate: Array of same-tier alternatives (different equipment/angle)
 */
export const PROGRESSION_PATHS = {
  // ==================== UPPER A - HORIZONTAL ====================

  'UPPER_A_SLOT_1': {
    slotName: 'Compound Horizontal Push',
    easier: [
      'Machine Chest Press',
      'Incline Hindu Danda'  // Hands elevated on bench
    ],
    current: 'DB Flat Bench Press',
    harder: [
      'Barbell Bench Press',  // Load progression
      'Hindu Danda',          // Movement progression
      'Vruschik Danda'        // Advanced (requires Hindu Danda mastery)
    ],
    alternate: ['Cable Chest Press']
  },

  'UPPER_A_SLOT_2': {
    slotName: 'Mid-back Horizontal Pull',
    easier: ['Machine Row'],
    current: 'Seated Cable Row',
    harder: [
      'Barbell Bent-Over Row',
      'Inverted Row'
    ],
    alternate: ['Chest-Supported Row']
  },

  'UPPER_A_SLOT_3': {
    slotName: 'Isolation Horizontal Push',
    easier: ['Machine Chest Fly'],
    current: 'Cable Chest Fly',
    harder: ['DB Chest Fly'],  // Requires more stability
    alternate: ['Push-up variations']
  },

  'UPPER_A_SLOT_4': {
    slotName: 'Lat-emphasis Horizontal Pull',
    easier: ['Single-Arm Cable Row'],
    current: 'T-Bar Row',
    harder: ['Pendlay Row'],
    alternate: []  // No equipment alternative for T-Bar
  },

  'UPPER_A_SLOT_5': {
    slotName: 'Lateral Deltoids',
    easier: [
      'Cable Lateral Raises',
      'Seated DB Lateral Raises'
    ],
    current: 'DB Lateral Raises',
    harder: [
      'Lean-Away Cable Laterals',
      'Single-arm variations'
    ],
    alternate: ['Upright Rows']
  },

  'UPPER_A_SLOT_6': {
    slotName: 'Rear Delts/Rotator Cuff',
    easier: ['Band Face Pulls'],
    current: 'Face Pulls',
    harder: ['Heavy Face Pulls with pause'],
    alternate: ['Reverse Fly']
  },

  'UPPER_A_SLOT_7': {
    slotName: 'Scapular Retraction/Rear Delts',
    easier: [
      'Cable Reverse Fly',
      'Machine Reverse Fly'
    ],
    current: 'Reverse Fly',
    harder: [
      'Y-Raises',        // MODERATE tier - requires shoulder mobility
      'Prone Y-Raises'
    ],
    alternate: ['Cable Face Pulls variant'],
    notes: 'Intentional duplication with UPPER_B_SLOT_5 for shoulder stability (2×/week)'
  },

  // ==================== LOWER A - BILATERAL ====================

  'LOWER_A_SLOT_1': {
    slotName: 'Quad-dominant Bilateral',
    easier: ['Leg Press'],
    current: 'Hack Squat',
    harder: ['Barbell Back Squat'],
    alternate: ['Standard Baithak']
  },

  'LOWER_A_SLOT_2': {
    slotName: 'Hamstring Isolation',
    easier: ['Lighter weight, slow tempo'],
    current: 'Leg Curl',
    harder: ['Nordic Curls'],
    alternate: []
  },

  'LOWER_A_SLOT_3': {
    slotName: 'Quad Isolation',
    easier: ['Lighter weight'],
    current: 'Leg Extension',
    harder: [
      'Single-leg Leg Extension',
      'Sissy Squats'
    ],
    alternate: []
  },

  'LOWER_A_SLOT_4': {
    slotName: 'Hip Hinge/Posterior Chain',
    easier: ['Back Extension'],
    current: '45° Hyperextension',
    harder: [
      'Weighted Hyperextension',
      'Barbell RDL',
      'Barbell Deadlift'
    ],
    alternate: ['Good Mornings']
  },

  'LOWER_A_SLOT_5': {
    slotName: 'Gastrocnemius (Calf)',
    easier: ['Machine calf raise'],
    current: 'Standing Calf Raise',
    harder: [
      'Single-leg Calf Raise',
      'Weighted Single-leg'
    ],
    alternate: []
  },

  'LOWER_A_SLOT_6': {
    slotName: 'Core Anti-extension',
    easier: ['Partial ROM'],
    current: 'Plank',
    harder: [
      'RKC Plank',
      'Weighted Plank'
    ],
    alternate: ['Ab Wheel Rollouts']
  },

  // ==================== UPPER B - VERTICAL ====================

  'UPPER_B_SLOT_1': {
    slotName: 'Vertical Pull',
    easier: ['Assisted Lat Pulldown'],
    current: 'Lat Pulldown',
    harder: [
      'Band-Assisted Pull-ups',
      'Pull-ups',
      'Weighted Pull-ups',
      'Archer Pull-ups'
    ],
    alternate: []
  },

  'UPPER_B_SLOT_2': {
    slotName: 'Vertical Push',
    easier: ['Machine Shoulder Press'],
    current: 'DB Shoulder Press',
    harder: [
      'Barbell Overhead Press',
      'Pike Push-ups',
      'Handstand Push-ups',
      'Half-moon Push-up'
    ],
    alternate: []
  },

  'UPPER_B_SLOT_3': {
    slotName: 'Upper Back/Stability',
    easier: ['Machine Row'],
    current: 'Chest-Supported Row',
    harder: ['DB Single-Arm Row'],
    alternate: ['Seal Row']
  },

  'UPPER_B_SLOT_4': {
    slotName: 'Upper Chest/Incline',
    easier: ['Machine Incline Press'],
    current: 'Incline DB Press',
    harder: [
      'Barbell Incline Press',
      'Vruschik Danda'
    ],
    alternate: ['Incline Push-ups']
  },

  'UPPER_B_SLOT_5': {
    slotName: 'Rear Delts/Posture',
    easier: ['Cable Reverse Fly'],
    current: 'Reverse Fly',
    harder: ['Bent-Over Reverse Fly'],
    alternate: []
  },

  'UPPER_B_SLOT_6': {
    slotName: 'Core Anti-rotation',
    easier: ['Partial Dead Bug'],
    current: 'Dead Bug',
    harder: [
      'Weighted Dead Bug',
      'Bird Dog'
    ],
    alternate: ['Pallof Press']
  },

  // ==================== LOWER B - UNILATERAL ====================

  'LOWER_B_SLOT_1': {
    slotName: 'Squat/Mobility Foundation',
    easier: ['Bodyweight Squat'],
    current: 'DB Goblet Squat',
    harder: [
      'Standard Baithak',
      'Full-sole Baithak',
      'Jumping Baithak',
      'Bulgarian Split Squat',
      'Pistol Squat'
    ],
    alternate: []
  },

  'LOWER_B_SLOT_2': {
    slotName: 'Hip Hinge',
    easier: [
      'Light DB RDL',
      'Glute-Ham Developer'
    ],
    current: 'DB Romanian Deadlift',
    harder: [
      'Barbell RDL',
      'Single-leg RDL',
      'Deficit RDL'
    ],
    alternate: []
  },

  'LOWER_B_SLOT_3': {
    slotName: 'Hip Abduction',
    easier: ['Banded Hip Abduction'],
    current: 'Leg Abduction',
    harder: [
      'Cable Hip Abduction',
      'Copenhagen Plank'
    ],
    alternate: []
  },

  'LOWER_B_SLOT_4': {
    slotName: 'Hip Extension/Glutes',
    easier: ['Bodyweight Hip Thrust'],
    current: 'Hip Thrust',
    harder: [
      'Weighted Hip Thrust',
      'Single-leg Hip Thrust'
    ],
    alternate: ['Glute Bridges']
  },

  'LOWER_B_SLOT_5': {
    slotName: 'Soleus (Calf)',
    easier: ['Lighter weight'],
    current: 'Seated Calf Raise',
    harder: ['Single-leg Seated Calf'],
    alternate: []
  },

  'LOWER_B_SLOT_6': {
    slotName: 'Core Lateral Stability',
    easier: ['Forearm plank'],
    current: 'Side Plank',
    harder: [
      'Leg Raise Side Plank',
      'Star Side Plank'
    ],
    alternate: []
  }
};

/**
 * Get progression path for a slot
 *
 * @param {string} slotKey - Slot identifier (e.g., 'UPPER_A_SLOT_1')
 * @returns {Object|null} Progression path object or null if not found
 */
export function getProgressionPath(slotKey) {
  if (!slotKey || typeof slotKey !== 'string') {
    console.warn(`[ProgressionPathways] Invalid slot key: ${slotKey}`);
    return null;
  }

  const path = PROGRESSION_PATHS[slotKey];
  if (!path) {
    console.warn(`[ProgressionPathways] No progression path for: ${slotKey}`);
    return null;
  }

  return path;
}

/**
 * Get all progressions for an exercise (easier + current + harder + alternate)
 *
 * @param {string} slotKey - Slot identifier
 * @returns {string[]} Array of all exercise options for this slot
 */
export function getAllProgressions(slotKey) {
  const path = getProgressionPath(slotKey);
  if (!path) return [];

  return [
    ...(path.easier || []),
    path.current,
    ...(path.harder || []),
    ...(path.alternate || [])
  ].filter(Boolean); // Remove any nulls/undefineds
}

/**
 * Find slot key for a current exercise
 *
 * @param {string} exerciseName - Name of exercise
 * @returns {string|null} Slot key or null if not found
 */
export function getSlotForExercise(exerciseName) {
  for (const [slotKey, path] of Object.entries(PROGRESSION_PATHS)) {
    if (path.current === exerciseName) {
      return slotKey;
    }
  }

  console.warn(`[ProgressionPathways] Exercise not found in any slot: ${exerciseName}`);
  return null;
}
