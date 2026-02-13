# Exercise Progression Pathways Implementation Plan

> **For executing agent:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build comprehensive exercise progression system with Vedic integration, equipment profiles, complexity-based unlocking, and biomechanical progression paths for all 26 BUILD exercises.

**Architecture:** Modular design with read-only analyzers (complexity-tiers, equipment-profiles, progression-pathways) + localStorage persistence layer + UI integration for unlock notifications, auto-suggest flow, and manual browsing. Follows existing BUILD patterns (StorageManager dependency injection, ES6 modules, progressive enhancement).

**Tech Stack:** Vanilla JavaScript (ES6), localStorage, CSS Grid/Flexbox, existing BUILD module system

**Estimated Time:** 43 hours across 6 phases

---

## Phase 1: Core Data Modules (Foundation)

### Task 1.1: Complexity Tiers Module

**Files:**
- Create: `js/modules/complexity-tiers.js`
- Test: Manual testing via browser console

**Step 1: Write module structure**

Create `js/modules/complexity-tiers.js`:

```javascript
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
```

**Step 2: Test module in browser console**

1. Add to `index.html` temporarily:
```html
<script type="module">
  import { getComplexityTier, getUnlockCriteria } from './js/modules/complexity-tiers.js';
  window.testComplexity = { getComplexityTier, getUnlockCriteria };
</script>
```

2. Open browser console, run:
```javascript
testComplexity.getComplexityTier('DB Flat Bench Press')  // Should return 'moderate'
testComplexity.getComplexityTier('Barbell Bench Press')  // Should return 'complex'
testComplexity.getUnlockCriteria('Hindu Danda')  // Should return complex tier criteria
```

Expected: All return correct values

**Step 3: Commit**

```bash
git add js/modules/complexity-tiers.js
git commit -m "feat: add complexity tiers classification module

- Simple/Moderate/Complex tier classifications for all exercises
- Unlock criteria definitions per tier
- Helper functions for tier lookup
- Safe defaults for unknown exercises"
```

---

### Task 1.2: Equipment Profiles Module

**Files:**
- Create: `js/modules/equipment-profiles.js`
- Test: Manual testing via browser console

**Step 1: Write equipment profiles module**

Create `js/modules/equipment-profiles.js`:

```javascript
/**
 * Equipment Profiles Module
 *
 * Filters exercises by available equipment and provides bodyweight
 * substitution logic for scaling difficulty.
 *
 * @module equipment-profiles
 */

/**
 * Equipment requirements per exercise
 * Multiple equipment types = user needs ANY of them
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
 * @returns {string|null} Bodyweight substitute or null if none
 */
export function getBodyweightSubstitute(exerciseName, userWeight) {
  const regressionMap = BODYWEIGHT_REGRESSIONS[exerciseName];

  if (!regressionMap) {
    return null; // No bodyweight substitute for this exercise
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
```

**Step 2: Test equipment filtering**

Add to `index.html` temporarily:
```html
<script type="module">
  import { filterExercisesByProfile, getBodyweightSubstitute } from './js/modules/equipment-profiles.js';
  window.testEquipment = { filterExercisesByProfile, getBodyweightSubstitute };
</script>
```

Browser console test:
```javascript
const gymOnlyProfile = { gym: true, dumbbells: false, barbells: false, bodyweight: true };
const exercises = ['Seated Cable Row', 'DB Flat Bench Press', 'Hindu Danda'];
testEquipment.filterExercisesByProfile(exercises, gymOnlyProfile);
// Expected: ['Seated Cable Row', 'Hindu Danda'] (no DB Bench)

testEquipment.getBodyweightSubstitute('DB Flat Bench Press', 7.5);
// Expected: 'Incline Hindu Danda'

testEquipment.getBodyweightSubstitute('DB Flat Bench Press', 12);
// Expected: 'Hindu Danda'
```

**Step 3: Commit**

```bash
git add js/modules/equipment-profiles.js
git commit -m "feat: add equipment profiles and filtering

- Equipment requirements mapping for all exercises
- Bodyweight regression scaling logic
- Equipment profile filtering helpers
- Dynamic substitution based on user strength level"
```

---

### Task 1.3: Progression Pathways Module (Part 1 - Data Structure)

**Files:**
- Create: `js/modules/progression-pathways.js`

**Step 1: Write progression paths data (Upper A only first)**

Create `js/modules/progression-pathways.js`:

```javascript
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
```

**Step 2: Test progression lookup**

Browser console:
```javascript
import { getProgressionPath, getAllProgressions } from './js/modules/progression-pathways.js';

getProgressionPath('UPPER_A_SLOT_1');
// Expected: Object with easier, current, harder, alternate

getAllProgressions('UPPER_A_SLOT_1');
// Expected: Array with all 7 progression options
```

**Step 3: Commit initial structure**

```bash
git add js/modules/progression-pathways.js
git commit -m "feat: add progression pathways module (Upper A)

- Slot-based progression structure
- Easier/Harder/Alternate categorization
- Helper functions for path lookup
- Upper A slots complete (7/26 exercises)"
```

---

### Task 1.4: Progression Pathways Module (Part 2 - Complete All Slots)

**Step 1: Add remaining slots (Lower A, Upper B, Lower B)**

Edit `js/modules/progression-pathways.js`, add after UPPER_A slots:

```javascript
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
```

**Step 2: Add helper to map exercise name to slot**

Add to `js/modules/progression-pathways.js`:

```javascript
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
```

**Step 3: Test complete paths**

Browser console:
```javascript
import { getProgressionPath, getSlotForExercise } from './js/modules/progression-pathways.js';

getSlotForExercise('Hack Squat');  // Expected: 'LOWER_A_SLOT_1'
getSlotForExercise('Hindu Danda'); // Expected: null (it's in "harder", not "current")

getProgressionPath('LOWER_B_SLOT_1');  // Expected: Goblet Squat → Baithak progressions
```

**Step 4: Commit complete paths**

```bash
git add js/modules/progression-pathways.js
git commit -m "feat: complete all 26 exercise progression paths

- Lower A slots (6 exercises)
- Upper B slots (6 exercises)
- Lower B slots (6 exercises)
- Helper to find slot by exercise name
- Total: 26/26 exercises mapped to progression paths"
```

---

## Phase 2: Storage Layer (Persistence)

### Task 2.1: Storage Manager Additions

**Files:**
- Modify: `js/modules/storage.js`

**Step 1: Add equipment profile methods**

Edit `js/modules/storage.js`, add these methods to the StorageManager class:

```javascript
  /**
   * Get equipment profile
   *
   * @returns {Object} Equipment profile {gym, dumbbells, barbells, mudgal, bodyweight}
   */
  getEquipmentProfile() {
    try {
      const stored = localStorage.getItem('build_equipment_profile');
      if (!stored) {
        // Default: gym + dumbbells + bodyweight (most common setup)
        return {
          gym: true,
          dumbbells: true,
          barbells: false,
          mudgal: false,
          bodyweight: true,
          bands: false
        };
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('[Storage] Error getting equipment profile:', error);
      return {
        gym: true,
        dumbbells: true,
        barbells: false,
        mudgal: false,
        bodyweight: true,
        bands: false
      };
    }
  }

  /**
   * Save equipment profile
   *
   * @param {Object} profile - Equipment profile object
   */
  saveEquipmentProfile(profile) {
    try {
      if (!profile || typeof profile !== 'object') {
        console.error('[Storage] Invalid equipment profile');
        return;
      }
      localStorage.setItem('build_equipment_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('[Storage] Error saving equipment profile:', error);
    }
  }
```

**Step 2: Add exercise selections methods**

Continue in `js/modules/storage.js`:

```javascript
  /**
   * Get exercise selections (current exercise per slot)
   *
   * @returns {Object} Slot → exercise name mapping
   */
  getExerciseSelections() {
    try {
      const stored = localStorage.getItem('build_exercise_selections');
      if (!stored) {
        // Default: all current exercises from progression paths
        return {
          'UPPER_A_SLOT_1': 'DB Flat Bench Press',
          'UPPER_A_SLOT_2': 'Seated Cable Row',
          'UPPER_A_SLOT_3': 'Cable Chest Fly',
          'UPPER_A_SLOT_4': 'T-Bar Row',
          'UPPER_A_SLOT_5': 'DB Lateral Raises',
          'UPPER_A_SLOT_6': 'Face Pulls',
          'UPPER_A_SLOT_7': 'Reverse Fly',
          'LOWER_A_SLOT_1': 'Hack Squat',
          'LOWER_A_SLOT_2': 'Leg Curl',
          'LOWER_A_SLOT_3': 'Leg Extension',
          'LOWER_A_SLOT_4': '45° Hyperextension',
          'LOWER_A_SLOT_5': 'Standing Calf Raise',
          'LOWER_A_SLOT_6': 'Plank',
          'UPPER_B_SLOT_1': 'Lat Pulldown',
          'UPPER_B_SLOT_2': 'DB Shoulder Press',
          'UPPER_B_SLOT_3': 'Chest-Supported Row',
          'UPPER_B_SLOT_4': 'Incline DB Press',
          'UPPER_B_SLOT_5': 'Reverse Fly',
          'UPPER_B_SLOT_6': 'Dead Bug',
          'LOWER_B_SLOT_1': 'DB Goblet Squat',
          'LOWER_B_SLOT_2': 'DB Romanian Deadlift',
          'LOWER_B_SLOT_3': 'Leg Abduction',
          'LOWER_B_SLOT_4': 'Hip Thrust',
          'LOWER_B_SLOT_5': 'Seated Calf Raise',
          'LOWER_B_SLOT_6': 'Side Plank'
        };
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('[Storage] Error getting exercise selections:', error);
      return {};
    }
  }

  /**
   * Save exercise selection for a slot
   *
   * @param {string} slotKey - Slot identifier
   * @param {string} exerciseName - Exercise name
   */
  saveExerciseSelection(slotKey, exerciseName) {
    try {
      const selections = this.getExerciseSelections();
      selections[slotKey] = exerciseName;
      localStorage.setItem('build_exercise_selections', JSON.stringify(selections));
    } catch (error) {
      console.error('[Storage] Error saving exercise selection:', error);
    }
  }
```

**Step 3: Add unlock tracking methods**

Continue in `js/modules/storage.js`:

```javascript
  /**
   * Get unlock achievements
   *
   * @returns {Object} Exercise name → unlock data mapping
   */
  getUnlocks() {
    try {
      const stored = localStorage.getItem('build_unlocks');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('[Storage] Error getting unlocks:', error);
      return {};
    }
  }

  /**
   * Save unlock achievement
   *
   * @param {string} exerciseName - Exercise that was unlocked
   * @param {Object} criteria - Unlock criteria met {strength, mobility, painFree, weeks}
   */
  saveUnlock(exerciseName, criteria) {
    try {
      const unlocks = this.getUnlocks();
      unlocks[exerciseName] = {
        unlockedDate: new Date().toISOString(),
        criteria: criteria
      };
      localStorage.setItem('build_unlocks', JSON.stringify(unlocks));
    } catch (error) {
      console.error('[Storage] Error saving unlock:', error);
    }
  }

  /**
   * Check if exercise is unlocked
   *
   * @param {string} exerciseName - Exercise name
   * @returns {boolean} True if unlocked
   */
  isExerciseUnlocked(exerciseName) {
    const unlocks = this.getUnlocks();
    return !!unlocks[exerciseName];
  }
```

**Step 4: Add training phase methods**

Continue in `js/modules/storage.js`:

```javascript
  /**
   * Get training phase
   *
   * @returns {string} 'building' or 'maintenance'
   */
  getTrainingPhase() {
    try {
      const stored = localStorage.getItem('build_training_phase');
      return stored || 'building'; // Default to building phase
    } catch (error) {
      console.error('[Storage] Error getting training phase:', error);
      return 'building';
    }
  }

  /**
   * Save training phase
   *
   * @param {string} phase - 'building' or 'maintenance'
   */
  saveTrainingPhase(phase) {
    try {
      if (phase !== 'building' && phase !== 'maintenance') {
        console.error('[Storage] Invalid training phase:', phase);
        return;
      }
      localStorage.setItem('build_training_phase', phase);
    } catch (error) {
      console.error('[Storage] Error saving training phase:', error);
    }
  }
```

**Step 5: Test storage methods in console**

Browser console:
```javascript
// Assuming storage manager is accessible via app instance
const storage = new StorageManager(); // or however it's instantiated

storage.saveEquipmentProfile({ gym: true, dumbbells: true, barbells: true, mudgal: false, bodyweight: true });
storage.getEquipmentProfile(); // Should return saved profile

storage.saveExerciseSelection('UPPER_A_SLOT_1', 'Hindu Danda');
storage.getExerciseSelections(); // Should show Hindu Danda in slot 1

storage.saveUnlock('Hindu Danda', { strength: true, mobility: true, painFree: true, weeks: 12 });
storage.isExerciseUnlocked('Hindu Danda'); // Should return true
```

**Step 6: Commit storage additions**

```bash
git add js/modules/storage.js
git commit -m "feat: add progression system storage methods

- Equipment profile get/save
- Exercise selections get/save
- Unlock tracking get/save/check
- Training phase get/save
- Safe defaults for missing data"
```

---

## Phase 3: Unlock Logic (Business Logic)

### Task 3.1: Unlock Criteria Evaluator

**Files:**
- Create: `js/modules/unlock-evaluator.js`

**Step 1: Write unlock evaluator module**

Create `js/modules/unlock-evaluator.js`:

```javascript
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
   */
  constructor(storageManager) {
    this.storage = storageManager;
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
        'Hindu Danda': { weight: 15, reps: 12, sets: 3 }
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
    const MOBILITY_CHECKS = {
      'Barbell Bench Press': 'scapular_retraction',
      'Hindu Danda': 'thoracic_mobility',
      'Barbell Overhead Press': 'shoulder_overhead_mobility',
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
```

**Step 2: Test unlock evaluation (manual console test)**

Browser console:
```javascript
import { UnlockEvaluator } from './js/modules/unlock-evaluator.js';
import StorageManager from './js/modules/storage.js';

const storage = new StorageManager();
const evaluator = new UnlockEvaluator(storage);

// Test SIMPLE tier (always unlocked)
evaluator.evaluateUnlock('Cable Chest Fly', 'DB Flat Bench Press');
// Expected: { unlocked: true, missing: [] }

// Test COMPLEX tier without meeting criteria
evaluator.evaluateUnlock('Barbell Bench Press', 'DB Flat Bench Press');
// Expected: { unlocked: false, missing: ['strength milestone', 'mobility check', ...] }
```

**Step 3: Commit unlock evaluator**

```bash
git add js/modules/unlock-evaluator.js
git commit -m "feat: add unlock criteria evaluator

- Strength milestone checking (weight × reps × sets)
- Mobility requirement validation
- Pain-free status tracking
- Training weeks calculation
- Read-only analyzer pattern
- Comprehensive criteria reporting"
```

---

## Phase 4: UI Integration (User-Facing)

### Task 4.1: Unlock Notification System

**Files:**
- Modify: `js/app.js`
- Create: `css/unlock-notifications.css`

**Step 1: Add unlock notification modal HTML**

Edit `index.html`, add before closing `</body>`:

```html
<!-- Exercise Unlock Notification Modal -->
<div id="unlock-notification-modal" class="modal" style="display: none;">
  <div class="modal-content unlock-modal">
    <div class="unlock-header">
      <span class="unlock-icon">🎉</span>
      <h2 id="unlock-title">New Exercise Unlocked!</h2>
    </div>
    <div class="unlock-body">
      <h3 id="unlock-exercise-name">Hindu Danda</h3>
      <p id="unlock-description">You've met the criteria to unlock this exercise!</p>

      <div class="unlock-criteria">
        <h4>Requirements Met:</h4>
        <ul id="unlock-criteria-list">
          <li class="met">✓ Strength: 15kg × 3×12</li>
          <li class="met">✓ Mobility: Thoracic mobility confirmed</li>
          <li class="met">✓ Pain-free: 5+ workouts</li>
          <li class="met">✓ Training: 8+ weeks</li>
        </ul>
      </div>

      <div class="unlock-actions">
        <button id="unlock-try-btn" class="btn-primary">Switch to This Exercise</button>
        <button id="unlock-later-btn" class="btn-secondary">Maybe Later</button>
      </div>
    </div>
  </div>
</div>
```

**Step 2: Create unlock notification CSS**

Create `css/unlock-notifications.css`:

```css
/* Unlock Notification Modal */
.unlock-modal {
  max-width: 500px;
  text-align: center;
  padding: 2rem;
}

.unlock-header {
  margin-bottom: 1.5rem;
}

.unlock-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
  animation: celebrate 0.6s ease-in-out;
}

@keyframes celebrate {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2) rotate(10deg); }
}

#unlock-title {
  color: var(--color-success);
  margin: 0;
  font-size: 1.75rem;
}

#unlock-exercise-name {
  font-size: 1.5rem;
  color: var(--color-text);
  margin: 1rem 0 0.5rem;
}

#unlock-description {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.unlock-criteria {
  background: var(--color-background-secondary);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.unlock-criteria h4 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  color: var(--color-text-secondary);
}

#unlock-criteria-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

#unlock-criteria-list li {
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

#unlock-criteria-list li:last-child {
  border-bottom: none;
}

#unlock-criteria-list li.met {
  color: var(--color-success);
}

#unlock-criteria-list li.not-met {
  color: var(--color-text-secondary);
}

.unlock-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.unlock-actions button {
  flex: 1;
  max-width: 200px;
}
```

**Step 3: Add unlock notification JavaScript**

Edit `js/app.js`, add this method to the App class:

```javascript
  /**
   * Show unlock notification after completing a set
   *
   * @param {string} currentExercise - Current exercise
   * @param {string} slotKey - Workout slot
   */
  async checkAndShowUnlockNotification(currentExercise, slotKey) {
    try {
      // Get progression path for this slot
      const path = getProgressionPath(slotKey);
      if (!path || !path.harder || path.harder.length === 0) return;

      // Check each harder progression
      for (const targetExercise of path.harder) {
        // Skip if already unlocked
        if (this.storage.isExerciseUnlocked(targetExercise)) continue;

        // Evaluate unlock criteria
        const evaluation = this.unlockEvaluator.evaluateUnlock(targetExercise, currentExercise);

        if (evaluation.unlocked) {
          // Show unlock notification
          await this.showUnlockModal(targetExercise, currentExercise, slotKey, evaluation);

          // Only show one unlock per workout (priority system: Complex > Moderate > Simple)
          break;
        }
      }
    } catch (error) {
      console.error('[App] Error checking unlock notification:', error);
    }
  }

  /**
   * Show unlock modal
   *
   * @param {string} exerciseName - Unlocked exercise
   * @param {string} currentExercise - Current exercise
   * @param {string} slotKey - Slot key
   * @param {Object} evaluation - Evaluation results
   */
  showUnlockModal(exerciseName, currentExercise, slotKey, evaluation) {
    return new Promise((resolve) => {
      const modal = document.getElementById('unlock-notification-modal');
      const exerciseNameEl = document.getElementById('unlock-exercise-name');
      const criteriaList = document.getElementById('unlock-criteria-list');
      const tryBtn = document.getElementById('unlock-try-btn');
      const laterBtn = document.getElementById('unlock-later-btn');

      // Set exercise name
      exerciseNameEl.textContent = exerciseName;

      // Render criteria
      criteriaList.innerHTML = '';
      const { criteria } = evaluation;

      if (criteria.strength) {
        const li = document.createElement('li');
        li.className = 'met';
        li.textContent = '✓ Strength milestone achieved';
        criteriaList.appendChild(li);
      }

      if (criteria.mobility) {
        const li = document.createElement('li');
        li.className = 'met';
        li.textContent = '✓ Mobility confirmed';
        criteriaList.appendChild(li);
      }

      if (criteria.painFree) {
        const li = document.createElement('li');
        li.className = 'met';
        li.textContent = '✓ Pain-free status';
        criteriaList.appendChild(li);
      }

      if (criteria.weeks > 0) {
        const li = document.createElement('li');
        li.className = 'met';
        li.textContent = `✓ Training: ${criteria.weeks} weeks`;
        criteriaList.appendChild(li);
      }

      // Show modal
      modal.style.display = 'flex';

      // Handle "Switch to This Exercise"
      tryBtn.onclick = () => {
        // Save unlock achievement
        this.storage.saveUnlock(exerciseName, criteria);

        // Switch exercise in slot
        this.storage.saveExerciseSelection(slotKey, exerciseName);

        // Close modal
        modal.style.display = 'none';

        // Refresh workout screen
        this.showWorkoutScreen(slotKey.split('_')[0] + '_' + slotKey.split('_')[1]); // e.g., "UPPER_A"

        resolve('switched');
      };

      // Handle "Maybe Later"
      laterBtn.onclick = () => {
        // Save unlock achievement (but don't switch)
        this.storage.saveUnlock(exerciseName, criteria);

        // Close modal
        modal.style.display = 'none';

        resolve('later');
      };
    });
  }
```

**Step 4: Call unlock check after set logging**

Edit `js/app.js`, find the `handleLogSet` method and add unlock check:

```javascript
  handleLogSet(exerciseKey, setData) {
    // ... existing set logging code ...

    // Check for unlocks after logging set
    const slotKey = getSlotForExercise(exerciseKey);
    if (slotKey) {
      this.checkAndShowUnlockNotification(exerciseKey, slotKey);
    }
  }
```

**Step 5: Test unlock notification (manual)**

1. Modify localStorage to meet unlock criteria for Hindu Danda
2. Complete a set of DB Flat Bench Press
3. Verify unlock notification appears
4. Test both "Switch" and "Maybe Later" actions

**Step 6: Commit unlock notifications**

```bash
git add index.html css/unlock-notifications.css js/app.js
git commit -m "feat: add unlock notification system

- Modal UI for exercise unlocks
- Criteria display (strength, mobility, pain-free, weeks)
- Auto-suggest flow (Switch / Maybe Later)
- Priority system (one unlock per workout)
- CSS animations for celebration effect
- Integration with set logging flow"
```

---

### Task 4.2: Settings Menu for Exercise Progressions

**Files:**
- Modify: `index.html`
- Create: `css/exercise-progressions.css`
- Modify: `js/app.js`

**Step 1: Add Settings menu section**

Edit `index.html`, find the settings screen and add:

```html
<!-- Exercise Progressions Section -->
<div class="settings-section">
  <h3>Exercise Progressions</h3>
  <p class="settings-description">Browse and switch to unlocked exercise variations</p>
  <button id="browse-progressions-btn" class="action-btn">
    Browse Available Progressions
  </button>
</div>

<!-- Training Phase Toggle -->
<div class="settings-section">
  <h3>Training Phase</h3>
  <p class="settings-description">Switch between Building and Maintenance modes</p>
  <div class="phase-toggle">
    <button id="phase-building-btn" class="phase-btn active">Building</button>
    <button id="phase-maintenance-btn" class="phase-btn">Maintenance</button>
  </div>
  <p class="phase-info" id="phase-info-text">
    Building: Focus on progressive overload and strength gains
  </p>
</div>
```

**Step 2: Add progressions browse modal**

Edit `index.html`, add before closing `</body>`:

```html
<!-- Exercise Progressions Browse Modal -->
<div id="progressions-modal" class="modal" style="display: none;">
  <div class="modal-content progressions-modal-content">
    <div class="modal-header">
      <h2>Exercise Progressions</h2>
      <button class="close-modal" id="close-progressions-modal">&times;</button>
    </div>

    <div class="progressions-body">
      <div class="progressions-tabs">
        <button class="prog-tab active" data-workout="UPPER_A">Upper A</button>
        <button class="prog-tab" data-workout="LOWER_A">Lower A</button>
        <button class="prog-tab" data-workout="UPPER_B">Upper B</button>
        <button class="prog-tab" data-workout="LOWER_B">Lower B</button>
      </div>

      <div id="progressions-list" class="progressions-list">
        <!-- Populated dynamically -->
      </div>
    </div>
  </div>
</div>
```

**Step 3: Create progressions CSS**

Create `css/exercise-progressions.css`:

```css
/* Exercise Progressions Modal */
.progressions-modal-content {
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.progressions-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 2px solid var(--color-border);
}

.prog-tab {
  padding: 0.75rem 1.5rem;
  border: none;
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s;
}

.prog-tab.active {
  background: var(--color-primary);
  color: white;
}

.progressions-list {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.progression-slot {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--color-background-secondary);
  border-radius: var(--border-radius);
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--color-border);
}

.slot-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.current-badge {
  padding: 0.25rem 0.75rem;
  background: var(--color-success);
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
}

.progression-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progression-category {
  margin-bottom: 1rem;
}

.category-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.exercise-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-background);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
}

.exercise-option.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.exercise-name {
  font-weight: 500;
  color: var(--color-text);
}

.exercise-status {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-badge.unlocked {
  background: var(--color-success-background);
  color: var(--color-success);
}

.status-badge.locked {
  background: var(--color-warning-background);
  color: var(--color-warning);
}

.select-exercise-btn {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background 0.2s;
}

.select-exercise-btn:hover {
  background: var(--color-primary-dark);
}

.select-exercise-btn:disabled {
  background: var(--color-border);
  cursor: not-allowed;
}

/* Training Phase Toggle */
.phase-toggle {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.phase-btn {
  flex: 1;
  padding: 1rem;
  border: 2px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-secondary);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.phase-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary-background);
  color: var(--color-primary);
}

.phase-info {
  padding: 1rem;
  background: var(--color-background-secondary);
  border-radius: var(--border-radius);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-top: 1rem;
}
```

**Step 4: Add progressions browse JavaScript**

Edit `js/app.js`, add method to App class:

```javascript
  /**
   * Show exercise progressions browser
   */
  showProgressionsBrowser() {
    const modal = document.getElementById('progressions-modal');
    const closeBtn = document.getElementById('close-progressions-modal');
    const tabs = document.querySelectorAll('.prog-tab');
    const listContainer = document.getElementById('progressions-list');

    // Show modal
    modal.style.display = 'flex';

    // Close handler
    closeBtn.onclick = () => {
      modal.style.display = 'none';
    };

    // Tab click handlers
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Render progression list for selected workout
        const workout = tab.dataset.workout;
        this.renderProgressionsList(workout, listContainer);
      });
    });

    // Render initial list (Upper A)
    this.renderProgressionsList('UPPER_A', listContainer);
  }

  /**
   * Render progressions list for a workout
   *
   * @param {string} workoutKey - Workout key (e.g., 'UPPER_A')
   * @param {HTMLElement} container - Container element
   */
  renderProgressionsList(workoutKey, container) {
    container.innerHTML = '';

    // Get all slots for this workout
    const slots = Object.keys(PROGRESSION_PATHS).filter(key => key.startsWith(workoutKey));
    const currentSelections = this.storage.getExerciseSelections();

    slots.forEach(slotKey => {
      const path = getProgressionPath(slotKey);
      if (!path) return;

      // Create slot container
      const slotDiv = document.createElement('div');
      slotDiv.className = 'progression-slot';

      // Slot header
      const headerDiv = document.createElement('div');
      headerDiv.className = 'slot-header';
      headerDiv.innerHTML = `
        <span class="slot-name">${path.slotName}</span>
        <span class="current-badge">Current: ${currentSelections[slotKey] || path.current}</span>
      `;
      slotDiv.appendChild(headerDiv);

      // Progression options
      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'progression-options';

      // Easier options
      if (path.easier && path.easier.length > 0) {
        const category = this.renderProgressionCategory('Easier', path.easier, slotKey);
        optionsDiv.appendChild(category);
      }

      // Harder options
      if (path.harder && path.harder.length > 0) {
        const category = this.renderProgressionCategory('Harder', path.harder, slotKey);
        optionsDiv.appendChild(category);
      }

      // Alternate options
      if (path.alternate && path.alternate.length > 0) {
        const category = this.renderProgressionCategory('Alternate', path.alternate, slotKey);
        optionsDiv.appendChild(category);
      }

      slotDiv.appendChild(optionsDiv);
      container.appendChild(slotDiv);
    });
  }

  /**
   * Render progression category
   *
   * @param {string} categoryName - Category name (Easier/Harder/Alternate)
   * @param {string[]} exercises - Exercise names
   * @param {string} slotKey - Slot key
   * @returns {HTMLElement} Category element
   */
  renderProgressionCategory(categoryName, exercises, slotKey) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'progression-category';

    const label = document.createElement('div');
    label.className = 'category-label';
    label.textContent = categoryName;
    categoryDiv.appendChild(label);

    exercises.forEach(exerciseName => {
      const optionDiv = document.createElement('div');
      const unlocked = this.storage.isExerciseUnlocked(exerciseName) ||
                       getComplexityTier(exerciseName) === COMPLEXITY_TIERS.SIMPLE;

      optionDiv.className = `exercise-option ${unlocked ? '' : 'locked'}`;
      optionDiv.innerHTML = `
        <span class="exercise-name">${exerciseName}</span>
        <div class="exercise-status">
          <span class="status-badge ${unlocked ? 'unlocked' : 'locked'}">
            ${unlocked ? '✓ Unlocked' : '🔒 Locked'}
          </span>
          <button class="select-exercise-btn" ${unlocked ? '' : 'disabled'}>
            Select
          </button>
        </div>
      `;

      // Select button handler
      const selectBtn = optionDiv.querySelector('.select-exercise-btn');
      if (selectBtn && unlocked) {
        selectBtn.onclick = () => {
          this.storage.saveExerciseSelection(slotKey, exerciseName);
          document.getElementById('progressions-modal').style.display = 'none';
          this.showHomeScreen(); // Refresh
        };
      }

      categoryDiv.appendChild(optionDiv);
    });

    return categoryDiv;
  }
```

**Step 5: Wire up settings buttons**

Edit `js/app.js`, add in initialization:

```javascript
  initializeEventListeners() {
    // ... existing listeners ...

    // Exercise progressions browser
    const browseBtn = document.getElementById('browse-progressions-btn');
    if (browseBtn) {
      browseBtn.addEventListener('click', () => this.showProgressionsBrowser());
    }

    // Training phase toggle
    const buildingBtn = document.getElementById('phase-building-btn');
    const maintenanceBtn = document.getElementById('phase-maintenance-btn');
    const phaseInfo = document.getElementById('phase-info-text');

    if (buildingBtn && maintenanceBtn) {
      buildingBtn.addEventListener('click', () => {
        this.storage.saveTrainingPhase('building');
        buildingBtn.classList.add('active');
        maintenanceBtn.classList.remove('active');
        phaseInfo.textContent = 'Building: Focus on progressive overload and strength gains';
      });

      maintenanceBtn.addEventListener('click', () => {
        this.storage.saveTrainingPhase('maintenance');
        maintenanceBtn.classList.add('active');
        buildingBtn.classList.remove('active');
        phaseInfo.textContent = 'Maintenance: Sustain strength with varied accessories';
      });

      // Set initial state
      const currentPhase = this.storage.getTrainingPhase();
      if (currentPhase === 'maintenance') {
        maintenanceBtn.classList.add('active');
        buildingBtn.classList.remove('active');
        phaseInfo.textContent = 'Maintenance: Sustain strength with varied accessories';
      }
    }
  }
```

**Step 6: Test settings integration (manual)**

1. Open Settings screen
2. Click "Browse Available Progressions"
3. Verify modal shows all workouts with correct progressions
4. Test unlocked/locked states
5. Test exercise selection
6. Test training phase toggle

**Step 7: Commit settings UI**

```bash
git add index.html css/exercise-progressions.css js/app.js
git commit -m "feat: add exercise progressions settings UI

- Browse modal with workout tabs (Upper A/B, Lower A/B)
- Progression display (Easier/Harder/Alternate)
- Unlock status badges
- Exercise selection interface
- Training phase toggle (Building/Maintenance)
- Phase info display
- Settings integration"
```

---

## Phase 5: Warm-ups & Optional Day (Features)

### Task 5.1: Warm-Up Protocols Module

**Files:**
- Create: `js/modules/warm-up-protocols.js`
- Modify: `js/app.js` (display warm-up before workout)
- Modify: `index.html` (warm-up UI container)

**Step 1: Create warm-up protocols module**

Create `js/modules/warm-up-protocols.js`:

```javascript
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
```

**Step 2: Add warm-up display to workout screen**

In `js/app.js`, add method to render warm-up section:

```javascript
  /**
   * Render warm-up protocol section
   *
   * @param {string} workoutKey - Workout key
   * @returns {string} HTML for warm-up section
   */
  renderWarmupProtocol(workoutKey) {
    const equipmentProfile = this.storage.getEquipmentProfile();
    const protocol = getWarmupProtocol(workoutKey, equipmentProfile);

    return `
      <div class="warmup-section">
        <h3>🔥 Warm-Up (${protocol.estimatedDuration})</h3>
        <div class="warmup-exercises">
          ${protocol.exercises.map((ex, index) => `
            <div class="warmup-exercise">
              <span class="warmup-number">${index + 1}.</span>
              <div class="warmup-details">
                <div class="warmup-name">${ex.name}</div>
                <div class="warmup-meta">
                  ${ex.duration || ex.reps}
                  ${ex.note ? `<span class="warmup-note">(${ex.note})</span>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="warmup-sets-info">
          <h4>Warm-up Sets (First Exercise Only)</h4>
          <p>Complete 3 progressive sets before working sets:</p>
          <ul>
            <li>Set 1: 50% weight × 8 reps (45-60s rest)</li>
            <li>Set 2: 70% weight × 3-4 reps (45-60s rest)</li>
            <li>Set 3: 90% weight × 1 rep (2 min rest)</li>
          </ul>
        </div>
      </div>
    `;
  }
```

**Step 3: Integrate warm-up into showWorkoutScreen**

In `showWorkoutScreen()`, add warm-up section before exercise list:

```javascript
  showWorkoutScreen(workoutKey) {
    // ... existing code ...

    workoutContent.innerHTML = `
      ${this.renderWarmupProtocol(workoutKey)}
      ${this.renderExerciseList(workout)}
    `;
  }
```

**Step 4: Add CSS for warm-up styling**

Create `css/warm-up-protocols.css`:

```css
/* Warm-up Section */
.warmup-section {
  background: var(--color-background-secondary);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  border-left: 4px solid var(--color-warning);
}

.warmup-section h3 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-warning);
}

.warmup-exercises {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.warmup-exercise {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs);
  background: var(--color-background);
  border-radius: var(--border-radius-sm);
}

.warmup-number {
  font-weight: 600;
  color: var(--color-text-secondary);
  min-width: 24px;
}

.warmup-details {
  flex: 1;
}

.warmup-name {
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 2px;
}

.warmup-meta {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.warmup-note {
  font-size: 0.85rem;
  color: var(--color-warning);
  font-style: italic;
}

.warmup-sets-info {
  background: var(--color-primary-background);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.warmup-sets-info h4 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 0.95rem;
  color: var(--color-primary);
}

.warmup-sets-info p {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.warmup-sets-info ul {
  margin: 0;
  padding-left: var(--spacing-md);
  font-size: 0.9rem;
  color: var(--color-text);
}
```

**Step 5: Commit**

```bash
git add js/modules/warm-up-protocols.js css/warm-up-protocols.css js/app.js index.html
git commit -m "feat: add warm-up protocols system

- BWS research-backed warm-up sequences
- Upper body (5-7 min) and lower body (5-8 min) protocols
- Equipment-aware substitutions (bands → bodyweight alternatives)
- Warm-up sets guidance for first exercise
- Integrated into workout screen"
```

---

### Task 5.2: Optional 5th Day Workout

**Files:**
- Create: `js/modules/optional-fifth-day.js`
- Modify: `js/app.js` (Home screen integration)
- Create: `css/optional-fifth-day.css`

**Step 1: Create optional 5th day module**

Create `js/modules/optional-fifth-day.js`:

```javascript
/**
 * Optional 5th Day: Injury Prevention + GPP
 *
 * Supplemental workout for extra training days.
 * Focus: Core intensive, mobility, injury prevention.
 *
 * @module optional-fifth-day
 */

/**
 * Block 1: Core Intensive (12-15 min)
 */
export const CORE_INTENSIVE_BLOCK = {
  name: 'Core Intensive',
  duration: '12-15 min',
  exercises: [
    { name: 'RKC Plank', sets: 3, reps: '20-30 sec', rest: '45 sec' },
    { name: 'Side Plank', sets: 3, reps: '30 sec each side', rest: '45 sec' },
    { name: 'Dead Bug', sets: 3, reps: '10 reps', rest: '45 sec' },
    { name: 'Pallof Press', sets: 3, reps: '12 each side', rest: '45 sec' },
    { name: 'Bird Dog', sets: 3, reps: '10 each side', rest: '45 sec' }
  ],
  advancedOptions: [
    { name: 'L-Sit Holds', sets: 3, reps: 'max time', note: 'If unlocked' },
    { name: 'Ab Wheel Rollouts', sets: 3, reps: '8-10 reps', note: 'If unlocked' }
  ]
};

/**
 * Block 2: Mobility + Injury Prevention (10-12 min)
 */
export const MOBILITY_BLOCK = {
  name: 'Mobility + Injury Prevention',
  duration: '10-12 min',
  sections: [
    {
      name: 'Rotator Cuff Circuit',
      exercises: [
        { name: 'Band External Rotations', sets: 2, reps: '15 each side' },
        { name: 'YTWLs', sets: 2, reps: '10 each position' },
        { name: 'Face Pull Variations', sets: 2, reps: '15 reps' }
      ]
    },
    {
      name: 'Hip Mobility',
      exercises: [
        { name: '90/90 Hip Stretch', sets: 2, reps: '30 sec each side' },
        { name: 'Cossack Squats', sets: 2, reps: '8 each side' },
        { name: 'Hip Flexor Stretch', sets: 2, reps: '30 sec each side' }
      ]
    },
    {
      name: 'Ankle Mobility',
      exercises: [
        { name: 'Wall Ankle Mobilization', sets: 2, reps: '10 each side' },
        { name: 'Calf Stretch', sets: 2, reps: '30 sec each side' }
      ]
    }
  ]
};

/**
 * Block 3: User Choice (10-15 min)
 */
export const USER_CHOICE_BLOCKS = [
  {
    id: 'cardio-hiit',
    name: 'Cardio HIIT',
    duration: '10-15 min',
    options: [
      { name: 'Jump Rope Intervals', format: '8 rounds × 30 sec on / 30 sec off' },
      { name: 'Hill Sprints', format: '6 × 30 sec' },
      { name: 'Rowing Intervals', format: '10 × 1 min moderate pace' }
    ]
  },
  {
    id: 'mudgal-gada',
    name: 'Mudgal/Gada Flow',
    duration: '10-15 min',
    exercises: [
      { name: '10-to-2 Pendulum Swings', sets: 3, reps: '12 each side' },
      { name: '360° Swings', sets: 3, reps: '8 each side', note: 'When unlocked' },
      { name: 'Gada Flow Sequences', duration: '10 min continuous' }
    ]
  },
  {
    id: 'bodyweight-high-rep',
    name: 'High-Rep Bodyweight',
    duration: '10-15 min',
    exercises: [
      { name: 'Hindu Danda', sets: 3, reps: '15 reps' },
      { name: 'Baithak', sets: 3, reps: '20 reps' },
      { name: 'Surya Namaskar', sets: '5-8 rounds', reps: null }
    ]
  }
];

/**
 * Get fatigue warning based on last workout and upcoming workout
 *
 * @param {string} lastWorkout - Last completed workout
 * @param {string} nextWorkout - Next suggested workout
 * @returns {Object|null} Warning object or null
 */
export function getFatigueWarning(lastWorkout, nextWorkout) {
  // After Lower B, if Upper A is within 48 hours
  if (lastWorkout === 'LOWER_B' && nextWorkout === 'UPPER_A') {
    const hoursUntilNext = 48; // Simplified - would calculate from last workout date
    if (hoursUntilNext < 48) {
      return {
        level: 'warning',
        message: '⚠️ Consider skipping Block 2 (shoulders) and Block 3 (Mudgal) to prevent fatigue',
        recommendSkip: ['mobility', 'user-choice']
      };
    }
    return {
      level: 'info',
      message: '✅ Best day: Tomorrow (2 days until Upper A)',
      recommendSkip: []
    };
  }

  return null;
}

/**
 * Get optional 5th day workout structure
 *
 * @param {string} lastWorkout - Last completed workout
 * @param {string} nextWorkout - Next suggested workout
 * @returns {Object} Complete 5th day workout
 */
export function getOptionalFifthDay(lastWorkout, nextWorkout) {
  return {
    displayName: 'Injury Prevention + Core Day',
    duration: '30-40 minutes',
    blocks: [
      CORE_INTENSIVE_BLOCK,
      MOBILITY_BLOCK,
      USER_CHOICE_BLOCKS
    ],
    cooldown: {
      duration: '3-5 min',
      activities: ['Foam rolling', 'Static stretching', 'Breathing work']
    },
    fatigueWarning: getFatigueWarning(lastWorkout, nextWorkout)
  };
}
```

**Step 2: Add optional 5th day button to Home screen**

In `js/app.js`, modify `showHomeScreen()`:

```javascript
  showHomeScreen(pushHistory = true) {
    // ... existing code ...

    homeContent.innerHTML = `
      <div class="next-workout-card">
        <h2>Next Workout: ${nextWorkout.displayName}</h2>
        <button id="start-workout-btn" class="btn-primary">
          START WORKOUT
        </button>
      </div>

      <div class="optional-training-card">
        <h3>Optional Training</h3>
        <button id="optional-fifth-day-btn" class="btn-secondary">
          💪 Injury Prevention + Core Day
        </button>
      </div>

      ${this.renderCurrentStreak()}
      ${this.renderLastWorkoutSummary()}
    `;

    // Event listener for optional 5th day
    document.getElementById('optional-fifth-day-btn')?.addEventListener('click', () => {
      this.showOptionalFifthDay();
    });
  }
```

**Step 3: Add showOptionalFifthDay method**

```javascript
  /**
   * Show optional 5th day workout screen
   */
  showOptionalFifthDay() {
    const rotation = this.storage.getRotationState();
    const lastWorkout = rotation.sequence[rotation.sequence.length - 1];
    const nextWorkout = rotation.nextSuggested;

    const fifthDay = getOptionalFifthDay(lastWorkout, nextWorkout);

    const fifthDayContent = document.getElementById('fifth-day-content');
    if (!fifthDayContent) return;

    fifthDayContent.innerHTML = `
      <h2>${fifthDay.displayName}</h2>
      <p class="duration">Total Duration: ${fifthDay.duration}</p>

      ${fifthDay.fatigueWarning ? `
        <div class="fatigue-warning ${fifthDay.fatigueWarning.level}">
          ${fifthDay.fatigueWarning.message}
        </div>
      ` : ''}

      ${this.renderFifthDayBlocks(fifthDay.blocks)}

      <div class="cooldown-section">
        <h3>Cool-down (${fifthDay.cooldown.duration})</h3>
        <ul>
          ${fifthDay.cooldown.activities.map(a => `<li>${a}</li>`).join('')}
        </ul>
      </div>

      <button id="complete-fifth-day-btn" class="btn-primary">
        Complete Workout
      </button>
    `;

    // Switch to fifth day screen
    this.switchScreen('fifth-day-screen');
  }
```

**Step 4: Commit**

```bash
git add js/modules/optional-fifth-day.js css/optional-fifth-day.css js/app.js index.html
git commit -m "feat: add optional 5th day workout

- 3-block structure: Core, Mobility, User Choice
- Fatigue management warnings
- Always accessible from Home screen
- Does not affect rotation or streak
- 30-40 min supplemental training"
```

---

## Phase 6: Integration Testing & Documentation

### Task 6.1: Comprehensive Integration Testing

**Files:**
- Create: `docs/testing/progression-pathways-integration-test.md`

**Test Scenarios:**

**1. Unlock Flow End-to-End**
- Start with clean localStorage
- Complete sets until unlock criteria met
- Verify unlock notification appears
- Test "Switch" and "Maybe Later" actions
- Verify unlock persists in Settings → Browse Progressions

**2. Equipment Profile Filtering**
- Toggle equipment profiles in Settings
- Verify progression paths update correctly
- Test bodyweight substitutions

**3. Training Phase Toggle**
- Switch Building → Maintenance
- Verify phase info updates
- Switch back to Building
- Verify persistence

**4. Warm-Up Display**
- Start workout
- Verify warm-up section appears
- Test equipment substitutions (disable bands)
- Verify substitution notes display

**5. Optional 5th Day**
- Complete 4-workout cycle
- Verify optional day button appears
- Test fatigue warnings
- Complete optional day
- Verify rotation not affected

**Step 1: Create test report template**

Create `docs/testing/progression-pathways-integration-test.md`:

```markdown
# Progression Pathways Integration Test Report

**Date:** [Test Date]
**Tester:** [Name]
**Build:** [Cache Version]

## Test 1: Unlock Flow
- [ ] Clean localStorage start
- [ ] Met unlock criteria for Hindu Danda
- [ ] Unlock notification appeared
- [ ] "Switch to This Exercise" works
- [ ] Exercise selection persisted
- [ ] Visible in Browse Progressions modal

## Test 2: Equipment Profiles
- [ ] Disabled Barbells profile
- [ ] Barbell exercises hidden in progressions
- [ ] Enabled Bodyweight profile
- [ ] Hindu Danda/Baithak variations visible

## Test 3: Training Phase
- [ ] Toggled to Maintenance mode
- [ ] Phase info updated correctly
- [ ] Toggled back to Building
- [ ] State persisted on page reload

## Test 4: Warm-Up Protocols
- [ ] Started Upper A workout
- [ ] Upper body warm-up displayed
- [ ] Disabled Bands in equipment
- [ ] Substitutions shown with notes
- [ ] Warm-up sets guidance displayed

## Test 5: Optional 5th Day
- [ ] Button visible on Home screen
- [ ] Clicked optional 5th day
- [ ] All 3 blocks displayed
- [ ] Fatigue warning appeared (if applicable)
- [ ] Completed workout
- [ ] Rotation unchanged

## Issues Found
[List any bugs or unexpected behavior]

## Performance Notes
[Loading times, responsiveness, etc.]

## Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browser

## Status
[ ] PASS - Ready for production
[ ] FAIL - Issues found (see above)
```

**Step 2: Execute manual tests**

Follow test report checklist systematically.

**Step 3: Fix any issues found**

Create bug fix commits as needed.

**Step 4: Update CLAUDE.md with learnings**

Document any patterns learned during implementation.

**Step 5: Commit test report**

```bash
git add docs/testing/progression-pathways-integration-test.md
git commit -m "docs: add progression pathways integration test report"
```

---

## Execution Strategy

This implementation plan follows TDD principles with bite-sized steps. Each task is 2-5 minutes with test → fail → code → pass → commit cycles.

**Total Phases:**
- Phase 1: Core Data Modules ✅ (4 tasks)
- Phase 2: Storage Layer ✅ (1 task)
- Phase 3: Unlock Logic ✅ (1 task)
- Phase 4: UI Integration ✅ (2 tasks)
- Phase 5: Warm-ups & Optional Day (2 tasks)
- Phase 6: Testing & Polish (1 task)

**Estimated Completion:** 50 hours across 6 phases

**Next:** Phase 5-6 implementation using subagent-driven development.
