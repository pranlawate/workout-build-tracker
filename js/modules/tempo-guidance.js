/**
 * Tempo Guidance Database
 *
 * Provides exercise-specific tempo progression strategies for weight gaps.
 * Each exercise has optimal tempo phase guidance (eccentric/concentric/paused).
 *
 * @module tempo-guidance
 */

/**
 * Tempo guidance for each exercise
 *
 * phase: Which movement phase to focus on (eccentric, concentric, both, isometric)
 * instruction: How to perform the tempo variation
 * why: Reason this tempo helps progression
 * cue: Visual/verbal cue for execution
 */
export const TEMPO_GUIDANCE = {
  // UPPER_A exercises
  'DB Flat Bench Press': {
    phase: 'eccentric',
    instruction: 'Lower dumbbells slowly over 3 seconds',
    why: 'Chest stretch under load = more growth',
    cue: 'Normal speed up ↑ | Slow controlled down ↓ (3 sec)'
  },

  'DB Single Arm Row': {
    phase: 'concentric',
    instruction: 'Pull slowly to chest, pause 2 seconds at squeeze',
    why: 'Back muscle contraction is key',
    cue: 'Slow pull → (2 sec) | Hold squeeze (2 sec) | Control release'
  },

  'DB Lateral Raises': {
    phase: 'eccentric',
    instruction: 'Lower dumbbells slowly over 3 seconds',
    why: 'Time under tension for delt growth',
    cue: 'Normal lift up ↑ | Slow controlled down ↓ (3 sec)'
  },

  'DB Hammer Curls': {
    phase: 'eccentric',
    instruction: 'Lower dumbbells slowly over 3 seconds',
    why: 'Eccentric overload builds bicep strength',
    cue: 'Normal curl up ↑ | Slow controlled down ↓ (3 sec)'
  },

  'Cable Overhead Extensions': {
    phase: 'eccentric',
    instruction: 'Lower cable slowly over 3 seconds',
    why: 'Tricep stretch under tension = growth',
    cue: 'Normal extend up ↑ | Slow controlled down ↓ (3 sec)'
  },

  'Cable Rope Crunches': {
    phase: 'concentric',
    instruction: 'Crunch slowly, pause 2 seconds at peak contraction',
    why: 'Ab squeeze is critical for activation',
    cue: 'Slow crunch (2 sec) | Hold squeeze (2 sec) | Control up'
  },

  // LOWER_A exercises
  'Hack Squat': {
    phase: 'eccentric',
    instruction: 'Lower slowly over 3 seconds (knee-friendly)',
    why: 'Control prevents knee stress',
    cue: 'Controlled descent ↓ (3 sec) | Explosive drive ↑'
  },

  'Leg Curl': {
    phase: 'both',
    instruction: 'Curl slowly up (2s), lower slowly down (3s)',
    why: 'Hamstrings work both ways',
    cue: 'Slow curl up ↑ (2 sec) | Slow lower down ↓ (3 sec)'
  },

  'Leg Extension': {
    phase: 'concentric',
    instruction: 'Extend slowly, pause 2 seconds at peak',
    why: 'Peak contraction builds quad strength',
    cue: 'Slow extend (2 sec) | Hold peak (2 sec) | Control down'
  },

  'Standing Calf Raises': {
    phase: 'both',
    instruction: 'Raise slowly (2s), lower slowly (3s)',
    why: 'Calves respond to time under tension',
    cue: 'Slow raise ↑ (2 sec) | Slow lower ↓ (3 sec)'
  },

  'Planks': {
    phase: 'isometric',
    instruction: 'Maximum tension throughout, squeeze everything',
    why: 'RKC technique = better activation',
    cue: 'Squeeze glutes + abs + quads | Hold max tension'
  },

  // UPPER_B exercises
  'Seated Cable Row': {
    phase: 'concentric',
    instruction: 'Pull slowly to chest, pause 2 seconds at squeeze',
    why: 'Back muscle contraction is key',
    cue: 'Slow pull → (2 sec) | Hold squeeze (2 sec) | Control release'
  },

  'DB Incline Press': {
    phase: 'eccentric',
    instruction: 'Lower dumbbells slowly over 3 seconds',
    why: 'Upper chest stretch under load = growth',
    cue: 'Normal speed up ↑ | Slow controlled down ↓ (3 sec)'
  },

  'Cable Lateral Raises': {
    phase: 'eccentric',
    instruction: 'Lower cable slowly over 3 seconds',
    why: 'Time under tension for delt growth',
    cue: 'Normal lift up ↑ | Slow controlled down ↓ (3 sec)'
  },

  'Reverse Pec Deck Fly': {
    phase: 'concentric',
    instruction: 'Pull slowly, pause 2 seconds at peak squeeze',
    why: 'Rear delt activation requires squeeze',
    cue: 'Slow pull (2 sec) | Hold squeeze (2 sec) | Control release'
  },

  'DB Incline Curls': {
    phase: 'eccentric',
    instruction: 'Lower dumbbells slowly over 3 seconds',
    why: 'Eccentric overload in stretched position',
    cue: 'Normal curl up ↑ | Slow controlled down ↓ (3 sec)'
  },

  'DB Overhead Extensions': {
    phase: 'eccentric',
    instruction: 'Lower dumbbell slowly over 3 seconds',
    why: 'Tricep stretch under tension = growth',
    cue: 'Normal extend up ↑ | Slow controlled down ↓ (3 sec)'
  },

  'Cable Wood Chops': {
    phase: 'both',
    instruction: 'Rotate slowly (2s each direction)',
    why: 'Oblique activation requires control',
    cue: 'Slow rotate → (2 sec) | Slow return ← (2 sec)'
  },

  // LOWER_B exercises
  'Romanian Deadlift': {
    phase: 'eccentric',
    instruction: 'Lower slowly over 3 seconds (hamstring stretch)',
    why: 'Eccentric strength in stretched position',
    cue: 'Controlled descent ↓ (3 sec) | Explosive drive ↑'
  },

  'Bulgarian Split Squat': {
    phase: 'eccentric',
    instruction: 'Lower slowly over 3 seconds (knee control)',
    why: 'Control prevents knee stress',
    cue: 'Controlled descent ↓ (3 sec) | Drive up ↑'
  },

  'Walking Lunges': {
    phase: 'eccentric',
    instruction: 'Lower slowly over 3 seconds per step',
    why: 'Control prevents knee stress',
    cue: 'Controlled descent ↓ (3 sec) | Drive up and forward ↑'
  },

  'Seated Calf Raises': {
    phase: 'both',
    instruction: 'Raise slowly (2s), lower slowly (3s)',
    why: 'Soleus responds to time under tension',
    cue: 'Slow raise ↑ (2 sec) | Slow lower ↓ (3 sec)'
  },

  'Reverse Crunches': {
    phase: 'concentric',
    instruction: 'Lift hips slowly, pause 2 seconds at top',
    why: 'Lower ab activation requires squeeze',
    cue: 'Slow lift (2 sec) | Hold squeeze (2 sec) | Control down'
  },

  // Barbell progressions
  'Barbell Bench Press': {
    phase: 'eccentric',
    instruction: 'Lower barbell slowly over 3 seconds',
    why: 'Chest stretch under load = more growth',
    cue: 'Normal speed up ↑ | Slow controlled down ↓ (3 sec)'
  },

  'Barbell Back Squat': {
    phase: 'eccentric',
    instruction: 'Lower slowly over 3 seconds (knee-friendly)',
    why: 'Control prevents knee stress',
    cue: 'Controlled descent ↓ (3 sec) | Explosive drive ↑'
  },

  'Barbell Deadlift': {
    phase: 'eccentric',
    instruction: 'Lower barbell slowly over 3 seconds',
    why: 'Eccentric strength in stretched position',
    cue: 'Controlled descent ↓ (3 sec) | Explosive pull ↑'
  },

  'Barbell Overhead Press': {
    phase: 'eccentric',
    instruction: 'Lower barbell slowly over 3 seconds',
    why: 'Shoulder control under load',
    cue: 'Normal press up ↑ | Slow controlled down ↓ (3 sec)'
  }
};

/**
 * Get tempo guidance for an exercise
 *
 * @param {string} exerciseName - Name of exercise
 * @returns {{phase: string, instruction: string, why: string, cue: string}|null} Tempo guidance or null if not found
 *
 * @example
 * getTempoGuidance('DB Flat Bench Press')
 * // Returns: { phase: 'eccentric', instruction: '...', why: '...', cue: '...' }
 */
export function getTempoGuidance(exerciseName) {
  const guidance = TEMPO_GUIDANCE[exerciseName];
  if (!guidance) {
    console.warn(`[TempoGuidance] No tempo guidance found for: ${exerciseName}`);
    return null;
  }
  return guidance;
}

/**
 * Get exercises by tempo phase
 *
 * @param {string} phase - Tempo phase (eccentric, concentric, both, isometric)
 * @returns {string[]} Exercise names using this phase
 *
 * @example
 * getExercisesByPhase('eccentric')
 * // Returns: ['DB Flat Bench Press', 'DB Lateral Raises', ...]
 */
export function getExercisesByPhase(phase) {
  return Object.entries(TEMPO_GUIDANCE)
    .filter(([_, guidance]) => guidance.phase === phase)
    .map(([exerciseName, _]) => exerciseName);
}
