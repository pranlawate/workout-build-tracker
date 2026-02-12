/**
 * Form Cues Database
 *
 * Provides exercise-specific form guidance (setup, execution, common mistakes).
 * Used by workout screen to display collapsible form tips for injury prevention.
 *
 * @module form-cues
 */

/** Form cue categories */
export const FORM_CUE_CATEGORIES = {
  SETUP: 'setup',
  EXECUTION: 'execution',
  MISTAKES: 'mistakes'
};

/**
 * Form cues for each exercise
 *
 * setup: Pre-movement positioning and preparation
 * execution: Key points during the movement
 * mistakes: Common errors to avoid
 */
export const FORM_CUES = {
  // UPPER_A exercises
  'DB Flat Bench Press': {
    setup: ['Retract shoulder blades', 'Feet flat on floor', 'Arch lower back slightly'],
    execution: ['Elbows at 45° (not 90°)', 'Control descent (2 sec)', 'Press to lockout'],
    mistakes: ['Dumbbells drifting apart', 'Bouncing off chest', 'Shoulders rolling forward']
  },

  'Seated Cable Row': {
    setup: ['Feet on platform', 'Knees slightly bent', 'Chest up, shoulders back'],
    execution: ['Pull to lower chest', 'Squeeze shoulder blades together', 'Control release (2 sec)'],
    mistakes: ['Rounding back', 'Using momentum/rocking', 'Pulling to stomach instead of chest']
  },

  'Cable Chest Fly': {
    setup: ['Handles at shoulder height', 'Step forward for stability', 'Slight bend in elbows'],
    execution: ['Arc hands together in front', 'Squeeze chest at peak', 'Control return (2 sec)'],
    mistakes: ['Straightening arms fully', 'Using shoulder/arm instead of chest', 'Jerking with momentum']
  },

  'T-Bar Row': {
    setup: ['Feet shoulder-width', 'Hip hinge position', 'Neutral spine, chest up'],
    execution: ['Pull to lower chest', 'Squeeze shoulder blades', 'Keep elbows close to body'],
    mistakes: ['Rounding back', 'Using legs/momentum', 'Pulling too high (to neck)']
  },

  'DB Lateral Raises': {
    setup: ['Slight forward lean', 'Slight elbow bend', 'Dumbbells in front of thighs'],
    execution: ['Lead with elbows', 'Raise to shoulder height', 'Control descent (3 sec)'],
    mistakes: ['Swinging/momentum', 'Raising too high (above shoulders)', 'Shrugging shoulders']
  },

  'Face Pulls': {
    setup: ['Rope at face height', 'Step back for tension', 'Chest up, shoulders back'],
    execution: ['Pull rope to face level', 'External rotate (elbows back)', 'Squeeze rear delts'],
    mistakes: ['Pulling down instead of back', 'No external rotation', 'Using momentum']
  },

  'Band Pull-Aparts': {
    setup: ['Band at chest height', 'Arms straight', 'Shoulder-width grip'],
    execution: ['Pull band apart to sides', 'Squeeze shoulder blades (1 sec)', 'Control return (2 sec)'],
    mistakes: ['Bending elbows', 'Shrugging shoulders', 'Rushing the movement']
  },

  // LOWER_A exercises
  'Hack Squat': {
    setup: ['Feet shoulder-width', 'Toes slightly out', 'Back against pad'],
    execution: ['Descend slowly (3 sec)', 'Knees track over toes', 'Drive through heels'],
    mistakes: ['Knees caving in', 'Heels lifting off platform', 'Partial ROM (not to 90°)']
  },

  'Leg Curl': {
    setup: ['Align knee with machine pivot', 'Pad at lower calf', 'Grip handles for stability'],
    execution: ['Curl to full contraction', 'Squeeze hamstrings (1 sec)', 'Control descent (3 sec)'],
    mistakes: ['Lifting hips off pad', 'Jerking with momentum', 'Partial ROM']
  },

  'Leg Extension': {
    setup: ['Align knee with machine pivot', 'Back against pad', 'Ankles under pad'],
    execution: ['Extend fully to lockout', 'Pause at top (2 sec)', 'Control descent (3 sec)'],
    mistakes: ['Jerking with momentum', 'Partial extension', 'Lifting butt off seat']
  },

  '45° Hyperextension': {
    setup: ['Hips on pad', 'Feet secured', 'Arms crossed on chest'],
    execution: ['Lower controlled (3 sec)', 'Maintain neutral spine', 'Rise to parallel ONLY'],
    mistakes: ['Hyperextending back (going too high)', 'Rounding spine', 'Using momentum']
  },

  'Standing Calf Raise': {
    setup: ['Balls of feet on platform', 'Heels off edge', 'Shoulders under pads'],
    execution: ['Rise on toes fully (1 sec)', 'Pause at top', 'Lower below platform level (2 sec)'],
    mistakes: ['Bouncing at bottom', 'Bending knees', 'Partial ROM']
  },

  'Plank': {
    setup: ['Forearms on floor', 'Elbows under shoulders', 'Body in straight line'],
    execution: ['Squeeze glutes', 'Brace abs', 'Breathe normally, neutral neck'],
    mistakes: ['Hips sagging', 'Hips too high (pyramid)', 'Holding breath']
  },

  // UPPER_B exercises
  'Lat Pulldown': {
    setup: ['Wide grip on bar', 'Chest up, shoulders back', 'Slight lean back (15°)'],
    execution: ['Pull to upper chest', 'Lead with elbows', 'Squeeze lats at bottom (1 sec)'],
    mistakes: ['Pulling behind neck', 'Leaning back too far', 'Using momentum/swinging']
  },

  'DB Shoulder Press': {
    setup: ['Dumbbells at shoulders', 'Feet flat on floor', 'Core braced, ribs down'],
    execution: ['Press straight up', 'Avoid arching back', 'Control descent (2 sec)'],
    mistakes: ['Excessive back arch', 'Pressing forward instead of up', 'Dumbbells drifting apart']
  },

  'Chest-Supported Row': {
    setup: ['Chest on pad', 'Neutral spine', 'Dumbbells hanging'],
    execution: ['Pull to sides of ribs', 'Squeeze shoulder blades', 'Control descent (2 sec)'],
    mistakes: ['Lifting chest off pad', 'Using momentum', 'Partial ROM']
  },

  'Incline DB Press': {
    setup: ['Bench at 30-45°', 'Retract shoulder blades', 'Feet flat on floor'],
    execution: ['Elbows at 45°', 'Control descent (2 sec)', 'Press to lockout'],
    mistakes: ['Dumbbells drifting apart', 'Bench too steep (>45°)', 'Shoulders rolling forward']
  },

  'Reverse Fly': {
    setup: ['Bend at hips 45°', 'Slight knee bend', 'Dumbbells hanging, palms in'],
    execution: ['Raise arms to sides', 'Squeeze rear delts (1 sec)', 'Control descent (2 sec)'],
    mistakes: ['Using momentum', 'Raising too high', 'Bending elbows too much']
  },

  'Dead Bug': {
    setup: ['Lie on back', 'Arms straight up', 'Knees at 90°, shins parallel to floor'],
    execution: ['Extend opposite arm/leg', 'Keep lower back pressed down', 'Breathe normally'],
    mistakes: ['Back arching off floor', 'Moving too fast', 'Holding breath']
  },

  // LOWER_B exercises
  'DB Goblet Squat': {
    setup: ['Dumbbell at chest', 'Elbows pointing down', 'Feet shoulder-width'],
    execution: ['Descend slowly (3 sec)', 'Knees track over toes', 'Drive through heels'],
    mistakes: ['Heels lifting', 'Knees caving in', 'Rounding back']
  },

  'DB Romanian Deadlift': {
    setup: ['Feet hip-width', 'Dumbbells at thighs', 'Slight knee bend locked'],
    execution: ['Hinge at hips', 'Keep back flat', 'Lower to shin level (3 sec)'],
    mistakes: ['Rounding back', 'Squatting down', 'Bending knees more during descent']
  },

  'Leg Abduction': {
    setup: ['Sit upright', 'Back against pad', 'Pads on outer thighs'],
    execution: ['Push legs apart slowly', 'Pause at full abduction (2 sec)', 'Control return'],
    mistakes: ['Using momentum', 'Leaning forward', 'Partial ROM']
  },

  'Hip Thrust': {
    setup: ['Upper back on bench', 'Feet flat, knees at 90°', 'Weight on hips'],
    execution: ['Drive hips up', 'Squeeze glutes at top (1 sec)', 'Lower controlled (2 sec)'],
    mistakes: ['Hyperextending back', 'Pushing with lower back', 'Partial ROM']
  },

  'Seated Calf Raise': {
    setup: ['Balls of feet on platform', 'Pad on thighs', 'Heels off edge'],
    execution: ['Rise on toes fully', 'Pause at top (3 sec)', 'Lower below platform level'],
    mistakes: ['Bouncing at bottom', 'Partial ROM', 'Lifting pad off thighs with hands']
  },

  'Side Plank': {
    setup: ['Forearm on floor', 'Elbow under shoulder', 'Feet stacked or staggered'],
    execution: ['Body in straight line', 'Lift hips', 'Hold stable, breathe normally'],
    mistakes: ['Hips sagging', 'Rotating torso', 'Holding breath']
  },

  // Barbell progressions (for future unlocking)
  'Barbell Bench Press': {
    setup: ['Retract shoulder blades', 'Feet flat on floor', 'Arch lower back', 'Grip slightly wider than shoulders'],
    execution: ['Lower to chest (nipple level)', 'Elbows at 45°', 'Press straight up to lockout'],
    mistakes: ['Bouncing off chest', 'Flaring elbows to 90°', 'Uneven bar path', 'Feet lifting']
  },

  'Barbell Back Squat': {
    setup: ['Bar on upper traps (high bar)', 'Feet shoulder-width', 'Toes slightly out', 'Core braced'],
    execution: ['Descend to parallel or below (3 sec)', 'Knees track over toes', 'Drive through heels'],
    mistakes: ['Knees caving in', 'Heels lifting', 'Rounding back', 'Not hitting depth']
  },

  'Barbell Deadlift': {
    setup: ['Feet hip-width', 'Bar over mid-foot', 'Grip outside knees', 'Shoulders over bar'],
    execution: ['Pull bar close to body', 'Keep back flat', 'Lock hips at top', 'Control descent'],
    mistakes: ['Rounding back', 'Bar drifting forward', 'Hitching at top', 'Dropping bar']
  },

  'Barbell Overhead Press': {
    setup: ['Bar at shoulders', 'Feet hip-width', 'Core braced', 'Grip shoulder-width'],
    execution: ['Press straight up', 'Tuck chin back', 'Lock arms overhead', 'Ribs down'],
    mistakes: ['Arching back', 'Pressing forward (not vertical)', 'Not locking out', 'Elbows flaring']
  }
};

/**
 * @typedef {Object} FormCueData
 * @property {string[]} setup - Pre-movement positioning and preparation cues
 * @property {string[]} execution - Key points during the movement
 * @property {string[]} mistakes - Common errors to avoid
 */

/**
 * Get form cues for an exercise
 *
 * @param {string} exerciseName - Name of exercise
 * @returns {FormCueData|null} Form cues or null if not found
 *
 * @example
 * getFormCues('DB Flat Bench Press')
 * // Returns: { setup: [...], execution: [...], mistakes: [...] }
 */
export function getFormCues(exerciseName) {
  // Validate input
  if (!exerciseName || typeof exerciseName !== 'string') {
    console.warn(`[FormCues] Invalid exercise name: ${exerciseName}`);
    return null;
  }

  const cues = FORM_CUES[exerciseName];
  if (!cues) {
    console.warn(`[FormCues] No form cues found for: ${exerciseName}`);
    return null;
  }
  return cues;
}

/**
 * Get all exercises that have form cues
 *
 * @returns {string[]} Exercise names with form cues
 *
 * @example
 * getAllExercisesWithCues()
 * // Returns: ['DB Flat Bench Press', 'Seated Cable Row', ...]
 */
export function getAllExercisesWithCues() {
  return Object.keys(FORM_CUES);
}

/**
 * Get form cues for a specific category
 *
 * @param {string} exerciseName - Name of exercise
 * @param {string} category - Cue category (use FORM_CUE_CATEGORIES constants)
 * @returns {string[]|null} Array of cues for category or null if not found
 *
 * @example
 * getFormCuesByCategory('DB Flat Bench Press', FORM_CUE_CATEGORIES.SETUP)
 * // Returns: ['Retract shoulder blades', 'Feet flat on floor', 'Arch lower back']
 */
export function getFormCuesByCategory(exerciseName, category) {
  // Validate inputs
  if (!exerciseName || typeof exerciseName !== 'string') {
    console.warn(`[FormCues] Invalid exercise name: ${exerciseName}`);
    return null;
  }

  if (!category || typeof category !== 'string') {
    console.warn(`[FormCues] Invalid category: ${category}`);
    return null;
  }

  const cues = FORM_CUES[exerciseName];
  if (!cues) {
    console.warn(`[FormCues] No form cues found for: ${exerciseName}`);
    return null;
  }

  const categoryCues = cues[category];
  if (!categoryCues) {
    console.warn(`[FormCues] No cues found for category '${category}' in exercise: ${exerciseName}`);
    return null;
  }

  return categoryCues;
}
