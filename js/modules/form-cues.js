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
    setup: ['Retract shoulder blades', 'Feet flat on floor', 'Arch lower back'],
    execution: ['Elbows at 45° (not 90°)', 'Control descent (2-3 sec)', 'Press to lockout'],
    mistakes: ['Dumbbells drifting apart', 'Bouncing off chest', 'Shoulders rolling forward']
  },

  'DB Single Arm Row': {
    setup: ['Plant opposite hand/knee on bench', 'Back parallel to floor', 'Neutral spine'],
    execution: ['Pull elbow to hip (not up)', 'Squeeze back at top', 'Control descent'],
    mistakes: ['Rotating torso', 'Jerking with momentum', 'Rounded back']
  },

  'DB Lateral Raises': {
    setup: ['Slight forward lean', 'Slight elbow bend', 'Dumbbells in front of thighs'],
    execution: ['Lead with elbows', 'Raise to shoulder height', 'Control descent (3 sec)'],
    mistakes: ['Swinging/momentum', 'Raising too high (above shoulders)', 'Shrugging shoulders']
  },

  'DB Hammer Curls': {
    setup: ['Stand tall', 'Elbows at sides', 'Neutral grip (thumbs up)'],
    execution: ['Keep elbows stationary', 'Curl to shoulder height', 'Control descent (3 sec)'],
    mistakes: ['Swinging body', 'Moving elbows forward', 'Not fully extending']
  },

  'Cable Overhead Extensions': {
    setup: ['Face away from cable', 'Rope overhead', 'Elbows pointing forward'],
    execution: ['Extend elbows fully', 'Keep upper arms stationary', 'Control return'],
    mistakes: ['Flaring elbows out', 'Moving shoulders', 'Arching back']
  },

  'Cable Rope Crunches': {
    setup: ['Kneel facing cable', 'Rope at forehead height', 'Hips back'],
    execution: ['Crunch down (elbows to knees)', 'Squeeze abs', 'Control up'],
    mistakes: ['Pulling with arms', 'Moving hips', 'Not fully crunching']
  },

  // LOWER_A exercises
  'Hack Squat': {
    setup: ['Feet shoulder-width', 'Toes slightly out', 'Back against pad'],
    execution: ['Descend slowly (3 sec)', 'Knees track over toes', 'Drive through heels'],
    mistakes: ['Knees caving in', 'Heels lifting', 'Partial ROM']
  },

  'Leg Curl': {
    setup: ['Align knee with machine pivot', 'Pad at lower calf', 'Grip handles'],
    execution: ['Curl to full contraction', 'Squeeze hamstrings', 'Control descent'],
    mistakes: ['Lifting hips', 'Jerking with momentum', 'Partial ROM']
  },

  'Leg Extension': {
    setup: ['Align knee with machine pivot', 'Back against pad', 'Ankles under pad'],
    execution: ['Extend fully', 'Pause at top (2 sec)', 'Control descent'],
    mistakes: ['Jerking with momentum', 'Partial extension', 'Lifting off seat']
  },

  'Standing Calf Raises': {
    setup: ['Balls of feet on platform', 'Heels off edge', 'Shoulders under pads'],
    execution: ['Rise on toes fully', 'Pause at top', 'Lower below platform level'],
    mistakes: ['Bouncing at bottom', 'Bending knees', 'Partial ROM']
  },

  'Planks': {
    setup: ['Forearms on floor', 'Elbows under shoulders', 'Body in straight line'],
    execution: ['Squeeze glutes', 'Squeeze abs', 'Neutral neck'],
    mistakes: ['Hips sagging', 'Hips too high', 'Holding breath']
  },

  // UPPER_B exercises
  'Seated Cable Row': {
    setup: ['Feet on platform', 'Knees slightly bent', 'Chest up'],
    execution: ['Pull to lower chest', 'Squeeze shoulder blades', 'Control release'],
    mistakes: ['Rounding back', 'Using momentum', 'Pulling to stomach']
  },

  'DB Incline Press': {
    setup: ['Bench at 30-45°', 'Retract shoulder blades', 'Feet flat on floor'],
    execution: ['Elbows at 45°', 'Control descent (2-3 sec)', 'Press to lockout'],
    mistakes: ['Dumbbells drifting apart', 'Bench too steep', 'Shoulders rolling forward']
  },

  'Cable Lateral Raises': {
    setup: ['Stand beside cable', 'Slight forward lean', 'Slight elbow bend'],
    execution: ['Lead with elbow', 'Raise to shoulder height', 'Control descent (3 sec)'],
    mistakes: ['Swinging/momentum', 'Raising too high', 'Shrugging shoulders']
  },

  'Reverse Pec Deck Fly': {
    setup: ['Chest against pad', 'Arms straight ahead', 'Neutral grip'],
    execution: ['Pull arms back (squeeze)', 'Pause at peak (2 sec)', 'Control return'],
    mistakes: ['Using momentum', 'Moving torso', 'Partial ROM']
  },

  'DB Incline Curls': {
    setup: ['Bench at 45-60°', 'Arms hanging straight', 'Palms forward'],
    execution: ['Curl without moving shoulders', 'Full contraction', 'Control descent (3 sec)'],
    mistakes: ['Moving elbows forward', 'Shoulders rolling forward', 'Swinging']
  },

  'DB Overhead Extensions': {
    setup: ['Dumbbell overhead', 'Elbows pointing forward', 'Stand or sit'],
    execution: ['Lower behind head', 'Keep upper arms stationary', 'Extend fully'],
    mistakes: ['Flaring elbows out', 'Arching back', 'Moving shoulders']
  },

  'Cable Wood Chops': {
    setup: ['Side to cable', 'Feet shoulder-width', 'Slight knee bend'],
    execution: ['Rotate through core', 'Keep arms straight', 'Control both directions'],
    mistakes: ['Twisting with arms only', 'Moving feet', 'Rounded back']
  },

  // LOWER_B exercises
  'Romanian Deadlift': {
    setup: ['Feet hip-width', 'Dumbbells at thighs', 'Slight knee bend'],
    execution: ['Hinge at hips', 'Keep back flat', 'Lower to shin level'],
    mistakes: ['Rounding back', 'Squatting down', 'Knees too bent']
  },

  'Bulgarian Split Squat': {
    setup: ['Rear foot elevated', 'Front foot 2-3 feet forward', 'Torso upright'],
    execution: ['Descend straight down', 'Front knee tracks over toe', 'Drive through heel'],
    mistakes: ['Leaning forward', 'Front knee caving in', 'Heel lifting']
  },

  'Walking Lunges': {
    setup: ['Stand tall', 'Dumbbells at sides', 'Core braced'],
    execution: ['Step forward', 'Descend straight down', 'Drive through front heel'],
    mistakes: ['Step too short', 'Leaning forward', 'Knee caving in']
  },

  'Seated Calf Raises': {
    setup: ['Balls of feet on platform', 'Pad on thighs', 'Heels off edge'],
    execution: ['Rise on toes fully', 'Pause at top', 'Lower below platform level'],
    mistakes: ['Bouncing at bottom', 'Partial ROM', 'Lifting pad off thighs']
  },

  'Reverse Crunches': {
    setup: ['Lie flat', 'Hands by sides or overhead', 'Knees bent 90°'],
    execution: ['Lift hips off floor', 'Bring knees to chest', 'Control descent'],
    mistakes: ['Using momentum', 'Swinging legs', 'Not lifting hips']
  },

  // Barbell progressions
  'Barbell Bench Press': {
    setup: ['Retract shoulder blades', 'Feet flat on floor', 'Arch lower back'],
    execution: ['Lower to chest', 'Elbows at 45°', 'Press to lockout'],
    mistakes: ['Bouncing off chest', 'Flaring elbows 90°', 'Uneven bar path']
  },

  'Barbell Back Squat': {
    setup: ['Bar on upper traps', 'Feet shoulder-width', 'Toes slightly out'],
    execution: ['Descend to parallel', 'Knees track over toes', 'Drive through heels'],
    mistakes: ['Knees caving in', 'Heels lifting', 'Rounding back']
  },

  'Barbell Deadlift': {
    setup: ['Feet hip-width', 'Bar over mid-foot', 'Grip outside knees'],
    execution: ['Pull bar close to body', 'Keep back flat', 'Lock hips at top'],
    mistakes: ['Rounding back', 'Bar drifting forward', 'Hitching at top']
  },

  'Barbell Overhead Press': {
    setup: ['Bar at shoulders', 'Feet hip-width', 'Core braced'],
    execution: ['Press straight up', 'Tuck chin back', 'Lock arms overhead'],
    mistakes: ['Arching back', 'Pressing forward', 'Not locking out']
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
 * // Returns: ['DB Flat Bench Press', 'DB Single Arm Row', ...]
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
