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
  MISTAKES: 'mistakes',
  BREATHING: 'breathing',
  SAFETY_TIPS: 'safetyTips'
};

/**
 * Form cues for each exercise
 *
 * setup: Pre-movement positioning and preparation (string or string[])
 * execution: Key points during the movement (string or string[])
 * mistakes or commonMistakes: Common errors to avoid (string[])
 * breathing: Optional breathing pattern (string)
 * safetyTips: Optional safety notes (string[])
 */
export const FORM_CUES = {
  // UPPER_A exercises
  'DB Flat Bench Press': {
    setup: ['Retract shoulder blades', 'Feet flat on floor', 'Arch lower back slightly'],
    execution: ['Elbows at 45° (not 90°)', 'Slow eccentric - 2s down', 'Explosive concentric - 1s up'],
    mistakes: ['Dumbbells drifting apart', 'Bouncing off chest', 'Shoulders rolling forward']
  },

  'Decline DB Press': {
    setup: ['Lock ankles under pads', 'Retract shoulder blades', 'Head supported on bench'],
    execution: ['Press toward hips (not vertical)', 'Slow eccentric - 2s down to lower chest', 'Explosive concentric - 1s up'],
    mistakes: ['Pressing straight up instead of toward hips', 'Dumbbells drifting apart', 'Losing scapular retraction']
  },

  'Seated Cable Row': {
    setup: ['Feet on platform', 'Knees slightly bent', 'Chest up, shoulders back'],
    execution: ['Controlled concentric - 2s pull to lower chest', 'Squeeze shoulder blades together', 'Slow eccentric - 2s release'],
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
    setup: ['Slight forward lean', 'Slight elbow bend', 'Thumbs slightly up (not down)', 'Dumbbells in front of thighs'],
    execution: ['Lead with elbows', 'Raise to shoulder height ONLY — never higher', 'Control descent (3 sec)'],
    mistakes: ['Raising above shoulder height (impingement risk)', 'Thumbs pointing down', 'Swinging/momentum', 'Shrugging shoulders']
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
    execution: ['Slow eccentric - 3s down', 'Knees track over toes', 'Explosive concentric - 2s up through heels'],
    mistakes: ['Knees caving in', 'Heels lifting off platform', 'Partial ROM (not to 90°)']
  },

  'Leg Curl': {
    setup: ['Align knee with machine pivot', 'Pad at lower calf', 'Hips pressed into pad', 'Grip handles for stability'],
    execution: ['Curl to full contraction', 'Squeeze hamstrings (1 sec)', 'Control descent (3 sec)'],
    mistakes: ['Lifting hips off pad (most common cheat)', 'Jerking with momentum', 'Partial ROM']
  },

  'Leg Extension': {
    setup: ['Align knee with machine pivot', 'Back against pad', 'Ankles under pad'],
    execution: ['Extend fully to lockout', 'Pause at top (2 sec)', 'Control descent (3 sec)'],
    mistakes: ['Jerking with momentum', 'Partial extension', 'Lifting butt off seat']
  },

  '45° Hyperextension': {
    setup: ['Hips on pad', 'Feet secured', 'Arms crossed on chest', 'Chin tucked, neutral neck'],
    execution: ['Lower controlled (3 sec)', 'Maintain neutral spine', 'Rise to parallel ONLY'],
    mistakes: ['Hyperextending back (going too high)', 'Rounding spine', 'Looking up (neck strain)', 'Using momentum']
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

  'Reverse Crunch': {
    setup: ['Lie on bench or floor', 'Arms at sides gripping bench/floor', 'Knees bent at 90°'],
    execution: ['Curl hips off bench toward chest', 'Squeeze lower abs at top (1 sec)', 'Lower slowly (3 sec) — don\'t let feet touch floor'],
    mistakes: ['Using momentum/swinging legs', 'Straightening legs (turns into leg raise)', 'Arching lower back on the way down']
  },

  // UPPER_B exercises
  'Lat Pulldown': {
    setup: ['Wide grip on bar', 'Chest up, shoulders back', 'Slight lean back (15°)'],
    execution: ['Controlled concentric - 2s pull to upper chest', 'Lead with elbows, squeeze lats', 'Slow eccentric - 2s release'],
    mistakes: ['Pulling behind neck', 'Leaning back too far', 'Using momentum/swinging']
  },

  'DB Shoulder Press': {
    setup: ['Dumbbells at shoulders', 'Feet flat on floor', 'Core braced, ribs down'],
    execution: ['Controlled concentric - 2s press straight up', 'Avoid arching back', 'Slow eccentric - 2s descent'],
    mistakes: ['Excessive back arch', 'Pressing forward instead of up', 'Dumbbells drifting apart']
  },

  'Landmine Press': {
    setup: ['Barbell in landmine or corner', 'Stand with staggered stance', 'Hold bar end at shoulder with one hand', 'Core braced, slight forward lean'],
    execution: ['Press up and forward following the arc', 'Fully extend arm without locking', 'Control descent to shoulder (2 sec)', 'Alternate arms each set'],
    mistakes: ['Arching lower back', 'Pressing straight up (follow the bar\'s natural arc)', 'Rotating torso excessively', 'Using too wide a stance']
  },

  'DB Chest Fly': {
    setup: ['Flat bench', 'Dumbbells above chest, palms facing each other', 'Slight bend in elbows (locked throughout)', 'Retract shoulder blades'],
    execution: ['Open arms wide in arc (3 sec) — feel chest stretch', 'Stop when elbows reach shoulder level', 'Squeeze chest to bring DBs back together (2 sec)'],
    mistakes: ['Straightening arms (turns into press)', 'Going too deep (below shoulder level)', 'Losing scapular retraction', 'Bending/extending elbows during movement']
  },

  'Machine Fly': {
    setup: ['Adjust seat so handles align with mid-chest', 'Back flat against pad', 'Feet flat on floor', 'Grip handles with slight elbow bend'],
    execution: ['Bring handles together in front of chest (2 sec)', 'Squeeze chest at the center (1 sec)', 'Open slowly until gentle chest stretch (3 sec)'],
    mistakes: ['Letting weight slam back', 'Going too far back (overstretching shoulder)', 'Shrugging shoulders up', 'Using momentum']
  },

  'Chest-Supported Row': {
    setup: ['Chest on pad', 'Neutral spine', 'Dumbbells hanging'],
    execution: ['Controlled concentric - 2s pull to sides of ribs', 'Squeeze shoulder blades', 'Slow eccentric - 2s descent'],
    mistakes: ['Lifting chest off pad', 'Using momentum', 'Partial ROM']
  },

  'Incline DB Press': {
    setup: ['Bench at 30° MAX (lower is safer for rotator cuff)', 'Retract shoulder blades', 'Feet flat on floor'],
    execution: ['Elbows at 45°', 'Slow eccentric - 2s down', 'Explosive concentric - 1s up to lockout'],
    mistakes: ['Bench too steep (>30° increases shoulder strain)', 'Dumbbells drifting apart', 'Shoulders rolling forward']
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
    setup: ['Feet hip-width', 'Dumbbells at thighs', 'Slight knee bend locked', 'Neutral neck (don\'t look up in mirror)'],
    execution: ['Hinge at hips', 'Slow eccentric - 3s lower to shin level', 'Controlled concentric - 2s up, keep back flat'],
    mistakes: ['Rounding back', 'Squatting down', 'Bending knees more during descent', 'Craning neck up']
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

  'Pallof Press': {
    setup: ['Cable or band at chest height', 'Stand sideways to anchor', 'Feet shoulder-width, knees soft', 'Hold handle at chest with both hands'],
    execution: ['Press hands straight out from chest', 'Hold extended position (2 sec) — resist the pull', 'Return to chest slowly', 'Keep hips and shoulders square (don\'t rotate)'],
    mistakes: ['Rotating toward the cable', 'Leaning away to compensate', 'Locking knees', 'Rushing — this is about control, not speed']
  },

  // Kettlebell progressions
  'KB Goblet Squat': {
    setup: [
      'Hold KB at chest height',
      'Elbows pointing down',
      'Feet shoulder-width, toes slightly out'
    ],
    execution: [
      'Slow eccentric - 3s down to parallel',
      'Chest up, elbows between knees',
      'Explosive concentric - 2s up through heels'
    ],
    mistakes: [
      'Rounding back',
      'KB drifting away from chest',
      'Knees caving inward'
    ]
  },

  'KB Swings': {
    setup: [
      'KB on floor ahead',
      'Hip-width stance',
      'Hinge to grip KB with both hands'
    ],
    execution: [
      'Explosive hip snap drives KB up',
      'Arms stay straight - hips do the work',
      'Controlled eccentric - let KB swing back between legs'
    ],
    mistakes: [
      'Squatting instead of hinging',
      'Pulling with arms instead of hip snap',
      'Rounding lower back - STOP IMMEDIATELY if this occurs'
    ]
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
  },

  // UPPER_A - Triceps
  'Tricep Pushdowns': {
    setup: ['Cable at chest height', 'Elbows tucked at sides', 'Slight forward lean', 'Feet hip-width'],
    execution: ['Press down to full extension', 'Keep elbows stationary', 'Squeeze triceps at bottom', 'Control return (2 sec)'],
    mistakes: ['Elbows flaring out', 'Using momentum/swinging', 'Not achieving full extension', 'Shoulder involvement']
  },

  'Overhead Tricep Extension': {
    setup: ['DB overhead with both hands', 'Elbows pointing forward', 'Core braced', 'Feet shoulder-width'],
    execution: ['Lower behind head slowly (3 sec)', 'Keep elbows stationary', 'Extend to full lockout', 'Feel stretch in long head'],
    mistakes: ['Elbows flaring out', 'Arching back excessively', 'Partial range of motion', 'Dropping weight too fast']
  },

  // UPPER_B - Biceps
  'Standard DB Curls': {
    setup: ['DBs at sides', 'Palms forward', 'Elbows at sides', 'Feet shoulder-width'],
    execution: ['Curl to shoulder height', 'Keep elbows stationary', 'Squeeze biceps at top (1 sec)', 'Control descent (2 sec)'],
    mistakes: ['Swinging/momentum', 'Elbows moving forward', 'Not achieving full ROM', 'Rushing reps']
  },

  'DB Hammer Curls': {
    setup: ['DBs at sides', 'Palms facing each other', 'Elbows at sides', 'Feet shoulder-width'],
    execution: ['Curl to shoulder height', 'Keep palms neutral', 'Squeeze at top (1 sec)', 'Control descent (2 sec)'],
    mistakes: ['Swinging/momentum', 'Rotating wrists', 'Elbows moving forward', 'Partial ROM']
  },

  // LOWER_A - Leg Press and Adduction
  'Leg Press': {
    setup: ['Back flat against pad', 'Feet shoulder-width on platform', 'Knees aligned with toes', 'Grip handles for stability'],
    execution: ['Lower slowly to 90° (3 sec)', 'Knees track over toes', 'Push through heels', 'Don\'t lock knees at top'],
    mistakes: ['Knees caving in', 'Bouncing at bottom', 'Locking knees', 'Lifting hips off pad']
  },

  'Leg Adduction': {
    setup: ['Sit with back against pad', 'Pads on inner thighs', 'Adjust range of motion', 'Core engaged'],
    execution: ['Bring legs together smoothly', 'Squeeze inner thighs (1 sec)', 'Control opening (2 sec)', 'Maintain posture'],
    mistakes: ['Using momentum', 'Leaning forward', 'Rushing reps', 'Not achieving full contraction']
  }
};

/**
 * Breathing and safety for default-workout + EXERCISE_DEFINITIONS exercises (merged in getFormCues).
 */
export const FORM_CUE_SUPPLEMENT = {
  'Incline DB Press': {
    breathing: 'Exhale on the press, inhale on the lowering phase. Do not hold your breath through sticking points.',
    safetyTips: ['Keep bench at 30° or less to reduce shoulder stress', 'Stop if you feel sharp anterior shoulder pain']
  },
  'Seated Cable Row': {
    breathing: 'Inhale at the start of the release, exhale as you pull the handle to your torso.',
    safetyTips: ['Keep spine neutral; avoid max flexion under load', 'Reduce weight if you cannot finish without torso swing']
  },
  'Decline DB Press': {
    breathing: 'Exhale as you press away from the chest, inhale as the dumbbells come down under control.',
    safetyTips: ['Secure ankle pads before loading', 'Use a controlled path toward the lower chest, not the neck']
  },
  'T-Bar Row': {
    breathing: 'Exhale on the pull, inhale while lowering. Brace your core lightly before each pull.',
    safetyTips: ['Stop if lower-back rounding increases with fatigue', 'Keep neck neutral; avoid yanking with legs']
  },
  'Machine Fly': {
    breathing: 'Exhale as handles come together, inhale as they open with control.',
    safetyTips: ['Adjust seat so elbows track comfortably; avoid deep overstretch at the back', 'Do not let the stack slam between reps']
  },
  'Face Pulls': {
    breathing: 'Exhale as you pull and externally rotate, inhale as you return.',
    safetyTips: ['Use moderate weight to keep rear delts and rotator cuff in charge', 'Stop if you feel pinching at the front of the shoulder']
  },
  'Tricep Pushdowns': {
    breathing: 'Exhale on the push down, inhale on the controlled return.',
    safetyTips: ['Keep elbows fixed at your sides', 'Avoid leaning heavily over the bar to move more weight']
  },
  'Hack Squat': {
    breathing: 'Inhale on the descent, exhale through the hardest part of the ascent.',
    safetyTips: ['Keep full foot contact on the platform', 'Use a depth you can control without butt rounding off the pad']
  },
  '45° Hyperextension': {
    breathing: 'Exhale as you rise to neutral, inhale as you hinge forward under control.',
    safetyTips: ['Stop at parallel; avoid snapping into hyperextension', 'Chin tucked to reduce neck extension']
  },
  'Hip Thrust': {
    breathing: 'Exhale at the top glute squeeze, inhale as you lower the hips.',
    safetyTips: ['Drive the movement from glutes, not lumbar hyperextension', 'Secure the bar or load so it cannot slip']
  },
  'Leg Extension': {
    breathing: 'Exhale as you extend, inhale as you lower the weight smoothly.',
    safetyTips: ['Avoid violent lockouts that slam the knees', 'Reduce range if you feel patellar discomfort']
  },
  'Standing Calf Raise': {
    breathing: 'Exhale at the top pause, inhale on the controlled stretch at the bottom.',
    safetyTips: ['Use a full but pain-free range', 'Avoid bouncing out of the bottom']
  },
  'Dead Bug': {
    breathing: 'Match breath to movement: exhale as the limb extends, inhale as it returns.',
    safetyTips: ['Keep ribs down; stop if the low back arches off the floor', 'Move slowly when adding load or slower tempos']
  },
  'Lat Pulldown': {
    breathing: 'Exhale as you pull the bar down, inhale as it rises with control.',
    safetyTips: ['Pull to the upper chest, not behind the neck', 'Reduce weight if you must lean far back to complete reps']
  },
  'Landmine Press': {
    breathing: 'Exhale as you press along the arc, inhale as you return to the shoulder.',
    safetyTips: ['Brace the core to limit low-back arching', 'Use a weight you can control without twisting the torso']
  },
  'Chest-Supported Row': {
    breathing: 'Exhale on the pull, inhale on the release while keeping the chest on the pad.',
    safetyTips: ['Do not lift the chest to cheat the range', 'Stop if you feel sharp mid-back pain']
  },
  'DB Lateral Raises': {
    breathing: 'Exhale as you lift, inhale as you lower for a slow count.',
    safetyTips: ['Do not raise above shoulder height', 'Use light loads; momentum defeats the side delts']
  },
  'Reverse Fly': {
    breathing: 'Exhale as you raise the weights, inhale as you lower with control.',
    safetyTips: ['Keep neck neutral; avoid cranking the head up', 'Reduce weight if traps take over']
  },
  'DB Hammer Curls': {
    breathing: 'Exhale on the curl, inhale on the descent.',
    safetyTips: ['Keep elbows under shoulders; avoid swinging', 'Stop if elbow or forearm pain appears']
  },
  'Reverse Crunch': {
    breathing: 'Exhale as you curl the hips up, inhale as you lower slowly.',
    safetyTips: ['Press low back into the bench or floor', 'Avoid jerking with the hip flexors']
  },
  'Leg Press': {
    breathing: 'Inhale on the way down, exhale as you press without locking out aggressively.',
    safetyTips: ['Keep knees tracking over toes', 'Do not allow hips to round or lift from the pad']
  },
  'DB Romanian Deadlift': {
    breathing: 'Brace before you hinge; exhale as you return to standing, inhale during the controlled lowering phase.',
    safetyTips: ['Stop if back rounds; reduce range or load', 'Keep the bar or dumbbells close to the legs']
  },
  'Leg Abduction': {
    breathing: 'Exhale as legs press apart, inhale as they return.',
    safetyTips: ['Sit tall without collapsing the lower back', 'Use a controlled speed; avoid snapping into end range']
  },
  'Leg Adduction': {
    breathing: 'Exhale as legs squeeze together, inhale as they open.',
    safetyTips: ['Avoid bouncing the weight stack', 'Stop if you feel groin strain']
  },
  'Leg Curl': {
    breathing: 'Exhale as you curl, inhale on the extension.',
    safetyTips: ['Keep hips pressed into the pad', 'Do not lift the hips to shorten the range']
  },
  'Seated Calf Raise': {
    breathing: 'Exhale during the long pause on top, inhale on the controlled descent.',
    safetyTips: ['Emphasize soleus with bent knees; avoid cutting depth', 'Reduce load if Achilles irritation appears']
  },
  'Pallof Press': {
    breathing: 'Breathe steadily; exhale gently as you reach full extension, inhale as you return.',
    safetyTips: ['Anti-rotation is the goal; reduce cable tension if you twist off line', 'Keep knees soft, not locked']
  },
  'KB Goblet Squat': {
    breathing: 'Inhale on the way down, exhale as you drive up while keeping the kettlebell close.',
    safetyTips: ['Hold the bell tight to the chest', 'Stop if wrists or elbows complain under load']
  },
  'KB Swings': {
    breathing: 'Power breathe: sharp exhale at hip extension, inhale as the bell floats back down.',
    safetyTips: ['Hinge, do not squat the bell up', 'Stop immediately if the lower back rounds']
  },
  'Standard DB Curls': {
    breathing: 'Exhale on the curl, inhale on the lowering phase.',
    safetyTips: ['Keep elbows fixed; avoid leaning back', 'Use a full range without shoulder pain']
  },
  'Overhead Tricep Extension': {
    breathing: 'Exhale as you extend the elbows, inhale as you lower behind the head.',
    safetyTips: ['Keep elbows pointing forward, not flared wide', 'Reduce load if elbows or neck feel strained']
  }
};

function toCueLines(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    const t = value.trim();
    return t ? [t] : [];
  }
  return [];
}

/**
 * Merge raw cue object (from FORM_CUES + optional supplement) into a consistent shape for UI.
 *
 * @param {Object} raw
 * @returns {{ setup: string[], execution: string[], mistakes: string[], breathing: string, safetyTips: string[] }}
 */
export function normalizeFormCueData(raw) {
  const mistakes = toCueLines(raw.mistakes ?? raw.commonMistakes);
  const setup = toCueLines(raw.setup);
  const execution = toCueLines(raw.execution);
  const breathing = typeof raw.breathing === 'string' ? raw.breathing.trim() : '';
  const safetyTips = toCueLines(raw.safetyTips);
  return { setup, execution, mistakes, breathing, safetyTips };
}

/**
 * @typedef {Object} FormCueData
 * @property {string[]} setup - Pre-movement positioning and preparation cues
 * @property {string[]} execution - Key points during the movement
 * @property {string[]} mistakes - Common errors to avoid
 * @property {string} [breathing] - Breathing pattern (empty string if none)
 * @property {string[]} [safetyTips] - Safety notes
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

  const base = FORM_CUES[exerciseName];
  if (!base) {
    console.warn(`[FormCues] No form cues found for: ${exerciseName}`);
    return null;
  }
  const extra = FORM_CUE_SUPPLEMENT[exerciseName] || {};
  return normalizeFormCueData({ ...base, ...extra });
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

  const base = FORM_CUES[exerciseName];
  if (!base) {
    console.warn(`[FormCues] No form cues found for: ${exerciseName}`);
    return null;
  }
  const extra = FORM_CUE_SUPPLEMENT[exerciseName] || {};
  const normalized = normalizeFormCueData({ ...base, ...extra });

  if (category === FORM_CUE_CATEGORIES.BREATHING) {
    return normalized.breathing ? [normalized.breathing] : null;
  }
  if (category === FORM_CUE_CATEGORIES.SAFETY_TIPS) {
    return normalized.safetyTips.length ? normalized.safetyTips : null;
  }

  const categoryCues = normalized[category];
  if (!categoryCues || !categoryCues.length) {
    console.warn(`[FormCues] No cues found for category '${category}' in exercise: ${exerciseName}`);
    return null;
  }

  return categoryCues;
}
