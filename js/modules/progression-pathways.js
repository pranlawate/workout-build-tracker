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
  }

  // TODO: Add LOWER_A, UPPER_B, LOWER_B slots in next step
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
