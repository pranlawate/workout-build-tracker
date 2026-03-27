/**
 * Exercise Metadata Database
 *
 * Provides metadata and alternative exercises for all 26 BUILD exercises.
 * Used by smart progression system to suggest exercise swaps for pain/plateau.
 *
 * @module exercise-metadata
 */

/** Pain intensity levels */
export const PAIN_LEVELS = {
  MILD: 'mild',
  MODERATE: 'moderate',
  SEVERE: 'severe'
};

/** Reasons for suggesting exercise alternatives */
export const SWAP_REASONS = {
  PAIN: 'pain',
  PLATEAU: 'plateau',
  ROTATION_VARIETY: 'rotation_variety'
};

/**
 * Muscle head coverage for exercises with rotation variants
 * Maps which specific muscle heads each exercise emphasizes
 */
export const MUSCLE_HEAD_COVERAGE = {
  // Tricep variations (UPPER_A)
  'Tricep Pushdowns': {
    primary: ['triceps_lateral', 'triceps_long'],
    secondary: []
  },
  'Overhead Tricep Extension': {
    primary: ['triceps_long', 'triceps_medial'],
    secondary: ['triceps_lateral']
  },

  // Bicep variations (UPPER_B)
  'DB Hammer Curls': {
    primary: ['brachialis', 'brachioradialis'],
    secondary: ['biceps_long']
  },
  'Standard DB Curls': {
    primary: ['biceps_long', 'biceps_short'],
    secondary: ['brachialis']
  },

  // Chest variations (UPPER_A)
  'Decline DB Press': {
    primary: ['pectoralis_costal'], // Lower chest
    secondary: ['pectoralis_sternal']
  },

  // Barbell variations (post-unlock)
  'Barbell Curls': {
    primary: ['biceps_long', 'biceps_short'],
    secondary: ['brachialis']
  },
  'EZ Bar Curls': {
    primary: ['biceps_long', 'biceps_short'],
    secondary: ['brachialis', 'brachioradialis']
  },
  'Barbell Bench Press': {
    primary: ['pectoralis_sternal'],
    secondary: ['triceps_lateral', 'anterior_deltoid']
  },
  'Close-Grip Bench Press': {
    primary: ['triceps_lateral', 'triceps_long', 'triceps_medial'],
    secondary: ['pectoralis_sternal']
  },
  'Barbell Back Squat': {
    primary: ['quadriceps', 'gluteus_maximus'],
    secondary: ['hamstrings']
  },
  'Front Squat': {
    primary: ['quadriceps'],
    secondary: ['gluteus_maximus', 'core']
  },
  'Barbell Deadlift': {
    primary: ['hamstrings', 'gluteus_maximus', 'erectors'],
    secondary: ['quadriceps', 'lats']
  },
  'Sumo Deadlift': {
    primary: ['gluteus_medius', 'adductors', 'gluteus_maximus'],
    secondary: ['hamstrings', 'quadriceps']
  }
};

/**
 * Exercise rotation pools - defines which exercises can rotate
 * Rotation stays within same complexity tier
 */
export const ROTATION_POOLS = {
  // Simple tier - mandatory rotations for muscle head coverage
  'Tricep Pushdowns': {
    tier: 'simple',
    rotations: ['Overhead Tricep Extension']
  },
  'Overhead Tricep Extension': {
    tier: 'simple',
    rotations: ['Tricep Pushdowns']
  },
  'DB Hammer Curls': {
    tier: 'simple',
    rotations: ['Standard DB Curls']
  },
  'Standard DB Curls': {
    tier: 'simple',
    rotations: ['DB Hammer Curls']
  },

  // Moderate tier - post-unlock rotations
  'Barbell Curls': {
    tier: 'moderate',
    rotations: ['EZ Bar Curls']
  },
  'EZ Bar Curls': {
    tier: 'moderate',
    rotations: ['Barbell Curls']
  },

  // Complex tier - barbell compound variations
  'Barbell Bench Press': {
    tier: 'complex',
    rotations: ['Close-Grip Bench Press', 'Incline Bench Press']
  },
  'Close-Grip Bench Press': {
    tier: 'complex',
    rotations: ['Barbell Bench Press']
  },
  'Incline Bench Press': {
    tier: 'complex',
    rotations: ['Barbell Bench Press']
  },
  'Barbell Back Squat': {
    tier: 'complex',
    rotations: ['Front Squat']
  },
  'Front Squat': {
    tier: 'complex',
    rotations: ['Barbell Back Squat']
  },
  'Barbell Deadlift': {
    tier: 'complex',
    rotations: ['Sumo Deadlift']
  },
  'Sumo Deadlift': {
    tier: 'complex',
    rotations: ['Barbell Deadlift']
  }
};

/**
 * Unlock milestones per exercise variation
 * User must hit milestone TWICE consecutively on EACH rotation variant
 */
export const UNLOCK_MILESTONES = {
  // Simple tier variations - unlock to Moderate tier
  'DB Hammer Curls': { weight: 15, reps: 12, sets: 3 },
  'Standard DB Curls': { weight: 15, reps: 12, sets: 3 },
  'Tricep Pushdowns': { weight: 17.5, reps: 12, sets: 3 },
  'Overhead Tricep Extension': { weight: 15, reps: 12, sets: 3 },

  // Moderate tier - unlock to Complex tier
  'Barbell Curls': { weight: 20, reps: 10, sets: 3 },
  'EZ Bar Curls': { weight: 20, reps: 10, sets: 3 },
  'DB Flat Bench Press': { weight: 20, reps: 10, sets: 3 },
  'Incline DB Press': { weight: 17.5, reps: 10, sets: 3 },

  // Exercises without rotations - use old unlock logic
  'Hack Squat': { weight: 40, reps: 10, sets: 3 },
  'DB Romanian Deadlift': { weight: 20, reps: 10, sets: 3 },
  'Leg Press': { weight: 60, reps: 10, sets: 3 }
};

/**
 * Exercise difficulty scale
 * 1 = beginner-friendly exercises (e.g., planks, bodyweight movements)
 * 2 = intermediate exercises (most dumbbell/cable/machine work)
 * 3 = advanced exercises (barbells, split squats, technical lifts)
 */
export const DIFFICULTY_SCALE = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3
};

export const EXERCISE_METADATA = {
  // UPPER_A exercises
  'DB Flat Bench Press': {
    muscleGroup: 'chest',
    movementType: 'horizontal_press',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Floor Press', 'Incline Push-Ups'],
      harder: ['Paused Bench Press', 'Slow Tempo Press'],
      different: ['Cable Chest Press', 'DB Incline Press']
    }
  },

  'DB Single Arm Row': {
    muscleGroup: 'back',
    movementType: 'horizontal_pull',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Seal Row (lower weight)', 'Inverted Row'],
      harder: ['Paused Row', 'Slow Tempo Row'],
      different: ['Cable Row', 'Chest-Supported Row']
    }
  },

  'DB Lateral Raises': {
    muscleGroup: 'shoulders',
    movementType: 'isolation',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Seated Lateral Raises', 'Band Lateral Raises'],
      harder: ['Lean-Away Cable Laterals', 'Paused Lateral Raises'],
      different: ['Upright Rows', 'Face Pulls']
    }
  },

  'DB Hammer Curls': {
    muscleGroup: 'biceps',
    movementType: 'curl',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Resistance Band Curls', 'Incline Curls'],
      harder: ['Slow Tempo Curls', 'Paused Curls'],
      different: ['Cable Curls', 'Barbell Curls']
    }
  },

  'Cable Overhead Extensions': {
    muscleGroup: 'triceps',
    movementType: 'extension',
    equipment: 'cable',
    difficulty: 2,
    alternatives: {
      easier: ['Band Overhead Extensions', 'Bench Dips'],
      harder: ['DB Overhead Extension', 'Slow Tempo Extensions'],
      different: ['Skull Crushers', 'Close-Grip Bench']
    }
  },

  'Cable Rope Crunches': {
    muscleGroup: 'abs',
    movementType: 'flexion',
    equipment: 'cable',
    difficulty: 2,
    alternatives: {
      easier: ['Floor Crunches', 'Dead Bug'],
      harder: ['Weighted Decline Crunches', 'Hanging Knee Raises'],
      different: ['Ab Wheel', 'Plank Variations']
    }
  },

  // LOWER_A exercises
  'Hack Squat': {
    muscleGroup: 'quads',
    movementType: 'squat',
    equipment: 'machine',
    difficulty: 2,
    alternatives: {
      easier: ['Goblet Squat', 'Leg Press'],
      harder: ['Paused Squat', 'Slow Tempo Squat'],
      different: ['Front Squat', 'Bulgarian Split Squat']
    }
  },

  'Leg Curl': {
    muscleGroup: 'hamstrings',
    movementType: 'curl',
    equipment: 'machine',
    difficulty: 2,
    alternatives: {
      easier: ['Stability Ball Curls', 'Nordic Curls (eccentric)'],
      harder: ['Slow Tempo Curls', 'Paused Curls'],
      different: ['Romanian Deadlift', 'Good Mornings']
    }
  },

  'Leg Extension': {
    muscleGroup: 'quads',
    movementType: 'extension',
    equipment: 'machine',
    difficulty: 2,
    alternatives: {
      easier: ['Bodyweight Sissy Squat', 'Step-Ups'],
      harder: ['Slow Tempo Extensions', 'Paused Extensions'],
      different: ['Lunges', 'Bulgarian Split Squats']
    }
  },

  'Standing Calf Raises': {
    muscleGroup: 'calves',
    movementType: 'raise',
    equipment: 'machine',
    difficulty: 2,
    alternatives: {
      easier: ['Seated Calf Raises', 'Single-Leg Calf Raises (bodyweight)'],
      harder: ['Paused Calf Raises', 'Slow Tempo Raises'],
      different: ['Donkey Calf Raises', 'Leg Press Calf Raises']
    }
  },

  'Planks': {
    muscleGroup: 'core',
    movementType: 'isometric',
    equipment: 'bodyweight',
    difficulty: 1,
    alternatives: {
      easier: ['Knee Plank', 'Incline Plank'],
      harder: ['RKC Plank', 'Weighted Plank'],
      different: ['Side Plank', 'Ab Wheel']
    }
  },

  // UPPER_B exercises
  'Seated Cable Row': {
    muscleGroup: 'back',
    movementType: 'horizontal_pull',
    equipment: 'cable',
    difficulty: 2,
    alternatives: {
      easier: ['Band Rows', 'Inverted Row'],
      harder: ['Paused Rows', 'Slow Tempo Rows'],
      different: ['DB Row', 'Barbell Row']
    }
  },

  'DB Incline Press': {
    muscleGroup: 'chest',
    movementType: 'incline_press',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Incline Push-Ups', 'Low Incline Press'],
      harder: ['Paused Incline Press', 'Slow Tempo Press'],
      different: ['Cable Incline Press', 'Barbell Incline Press']
    }
  },

  'Cable Lateral Raises': {
    muscleGroup: 'shoulders',
    movementType: 'isolation',
    equipment: 'cable',
    difficulty: 2,
    alternatives: {
      easier: ['DB Lateral Raises', 'Band Lateral Raises'],
      harder: ['Lean-Away Lateral Raises', 'Paused Raises'],
      different: ['Face Pulls', 'Upright Rows']
    }
  },

  'Reverse Pec Deck Fly': {
    muscleGroup: 'rear_delts',
    movementType: 'fly',
    equipment: 'machine',
    difficulty: 2,
    alternatives: {
      easier: ['Face Pulls', 'Band Pull-Aparts'],
      harder: ['Slow Tempo Flys', 'Paused Flys'],
      different: ['DB Rear Delt Fly', 'Cable Reverse Fly']
    }
  },

  'DB Incline Curls': {
    muscleGroup: 'biceps',
    movementType: 'curl',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Standing Curls', 'Band Curls'],
      harder: ['Slow Tempo Curls', 'Paused Curls'],
      different: ['Cable Curls', 'Hammer Curls']
    }
  },

  'DB Overhead Extensions': {
    muscleGroup: 'triceps',
    movementType: 'extension',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Cable Extensions', 'Band Extensions'],
      harder: ['Slow Tempo Extensions', 'Paused Extensions'],
      different: ['Skull Crushers', 'Close-Grip Bench']
    }
  },

  'Cable Wood Chops': {
    muscleGroup: 'obliques',
    movementType: 'rotation',
    equipment: 'cable',
    difficulty: 2,
    alternatives: {
      easier: ['Band Wood Chops', 'Russian Twists'],
      harder: ['Slow Tempo Chops', 'Pallof Press'],
      different: ['Landmine Rotations', 'Medicine Ball Slams']
    }
  },

  // LOWER_B exercises
  'Romanian Deadlift': {
    muscleGroup: 'hamstrings',
    movementType: 'hinge',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Good Mornings', 'Single-Leg RDL (lighter)'],
      harder: ['Slow Tempo RDL', 'Paused RDL'],
      different: ['Leg Curls', 'Nordic Curls']
    }
  },

  'Bulgarian Split Squat': {
    muscleGroup: 'quads',
    movementType: 'lunge',
    equipment: 'dumbbell',
    difficulty: 3,
    alternatives: {
      easier: ['Split Squat', 'Reverse Lunges'],
      harder: ['Paused Split Squat', 'Slow Tempo Split Squat'],
      different: ['Leg Press', 'Goblet Squat']
    }
  },

  'Walking Lunges': {
    muscleGroup: 'quads',
    movementType: 'lunge',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Stationary Lunges', 'Step-Ups'],
      harder: ['Paused Lunges', 'Slow Tempo Lunges'],
      different: ['Bulgarian Split Squats', 'Goblet Squats']
    }
  },

  'Seated Calf Raises': {
    muscleGroup: 'calves',
    movementType: 'raise',
    equipment: 'machine',
    difficulty: 2,
    alternatives: {
      easier: ['Single-Leg Calf Raises (bodyweight)', 'Standing Calf Raises (lighter)'],
      harder: ['Paused Calf Raises', 'Slow Tempo Raises'],
      different: ['Standing Calf Raises', 'Leg Press Calf Raises']
    }
  },

  'Reverse Crunches': {
    muscleGroup: 'abs',
    movementType: 'flexion',
    equipment: 'bodyweight',
    difficulty: 2,
    alternatives: {
      easier: ['Dead Bug', 'Floor Crunches'],
      harder: ['Hanging Knee Raises', 'Decline Reverse Crunches'],
      different: ['Cable Crunches', 'Ab Wheel']
    }
  },

  // Barbell progressions (unlockable)
  'Barbell Bench Press': {
    muscleGroup: 'chest',
    movementType: 'horizontal_press',
    equipment: 'barbell',
    difficulty: 3,
    alternatives: {
      easier: ['DB Bench Press', 'Floor Press'],
      harder: ['Paused Bench Press', 'Slow Tempo Bench'],
      different: ['Incline Bench Press', 'Close-Grip Bench']
    }
  },

  'Barbell Back Squat': {
    muscleGroup: 'quads',
    movementType: 'squat',
    equipment: 'barbell',
    difficulty: 3,
    alternatives: {
      easier: ['Goblet Squat', 'Hack Squat'],
      harder: ['Paused Squat', 'Slow Tempo Squat'],
      different: ['Front Squat', 'Bulgarian Split Squat']
    }
  },

  'Barbell Deadlift': {
    muscleGroup: 'hamstrings',
    movementType: 'hinge',
    equipment: 'barbell',
    difficulty: 3,
    alternatives: {
      easier: ['Trap Bar Deadlift', 'Romanian Deadlift'],
      harder: ['Deficit Deadlift', 'Paused Deadlift'],
      different: ['Sumo Deadlift', 'Good Mornings']
    }
  },

  'Barbell Overhead Press': {
    muscleGroup: 'shoulders',
    movementType: 'vertical_press',
    equipment: 'barbell',
    difficulty: 3,
    alternatives: {
      easier: ['DB Shoulder Press', 'Push Press'],
      harder: ['Paused OHP', 'Slow Tempo OHP'],
      different: ['Arnold Press', 'Landmine Press']
    }
  },

  // UPPER_A - Additional Exercises
  'Decline DB Press': {
    muscleGroup: 'chest',
    movementType: 'horizontal_press',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Flat DB Press', 'Push-Ups'],
      harder: ['Paused Decline Press', 'Slow Tempo Decline Press'],
      different: ['Cable Chest Press', 'Chest Dips']
    }
  },

  'Incline DB Press': {
    muscleGroup: 'chest',
    movementType: 'horizontal_press',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Incline Push-Ups', 'Flat DB Press'],
      harder: ['Paused Incline Press', 'Slow Tempo Incline Press'],
      different: ['Incline Barbell Press', 'Low-to-High Cable Fly']
    }
  },

  'DB Shoulder Press': {
    muscleGroup: 'shoulders',
    movementType: 'vertical_press',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Seated DB Press', 'Push Press'],
      harder: ['Arnold Press', 'Paused DB Press'],
      different: ['Barbell OHP', 'Landmine Press']
    }
  },

  'Lat Pulldown': {
    muscleGroup: 'back',
    movementType: 'vertical_pull',
    equipment: 'cable',
    difficulty: 2,
    alternatives: {
      easier: ['Assisted Pull-Ups', 'Band-Assisted Lat Pulldown'],
      harder: ['Pull-Ups', 'Weighted Pull-Ups'],
      different: ['Neutral Grip Pulldown', 'Wide Grip Pulldown']
    }
  },

  'Seated Cable Row': {
    muscleGroup: 'back',
    movementType: 'horizontal_pull',
    equipment: 'cable',
    difficulty: 2,
    alternatives: {
      easier: ['Band Rows', 'Light Cable Row'],
      harder: ['Heavy Cable Row with Pause', 'Slow Tempo Row'],
      different: ['DB Row', 'T-Bar Row']
    }
  },

  'T-Bar Row': {
    muscleGroup: 'back',
    movementType: 'horizontal_pull',
    equipment: 'barbell',
    difficulty: 3,
    alternatives: {
      easier: ['Chest-Supported Row', 'Cable Row'],
      harder: ['Paused T-Bar Row', 'Slow Tempo T-Bar Row'],
      different: ['Barbell Row', 'Pendlay Row']
    }
  },

  'Chest-Supported Row': {
    muscleGroup: 'back',
    movementType: 'horizontal_pull',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Cable Row', 'Light DB Row'],
      harder: ['Heavy DB Row', 'Paused Row'],
      different: ['T-Bar Row', 'Seal Row']
    }
  },

  'Face Pulls': {
    muscleGroup: 'shoulders',
    movementType: 'isolation',
    equipment: 'cable',
    difficulty: 1,
    alternatives: {
      easier: ['Band Face Pulls', 'Light Cable Face Pulls'],
      harder: ['Heavy Face Pulls with Pause', 'Slow Tempo Face Pulls'],
      different: ['Reverse Fly', 'Rear Delt Fly']
    }
  },

  'Reverse Fly': {
    muscleGroup: 'shoulders',
    movementType: 'isolation',
    equipment: 'dumbbell',
    difficulty: 1,
    alternatives: {
      easier: ['Band Reverse Fly', 'Cable Reverse Fly'],
      harder: ['Paused Reverse Fly', 'Slow Tempo Reverse Fly'],
      different: ['Face Pulls', 'Reverse Pec Deck']
    }
  },

  'Tricep Pushdowns': {
    muscleGroup: 'triceps',
    movementType: 'extension',
    equipment: 'cable',
    difficulty: 1,
    alternatives: {
      easier: ['Band Pushdowns', 'Light Cable Pushdowns'],
      harder: ['Heavy Pushdowns with Pause', 'Slow Tempo Pushdowns'],
      different: ['Overhead Extension', 'Close-Grip Bench']
    }
  },

  'Overhead Tricep Extension': {
    muscleGroup: 'triceps',
    movementType: 'extension',
    equipment: 'dumbbell',
    difficulty: 2,
    alternatives: {
      easier: ['Band Overhead Extension', 'Light DB Extension'],
      harder: ['Heavy DB Extension', 'Slow Tempo Extension'],
      different: ['Tricep Pushdowns', 'Skull Crushers']
    }
  },

  // UPPER_B - Additional Exercises
  'Standard DB Curls': {
    muscleGroup: 'biceps',
    movementType: 'curl',
    equipment: 'dumbbell',
    difficulty: 1,
    alternatives: {
      easier: ['Band Curls', 'Light DB Curls'],
      harder: ['Paused Curls', 'Slow Tempo Curls'],
      different: ['Cable Curls', 'Barbell Curls']
    }
  },

  // LOWER_A - Additional Exercises
  'Leg Press': {
    muscleGroup: 'quads',
    movementType: 'squat',
    equipment: 'machine',
    difficulty: 2,
    alternatives: {
      easier: ['Goblet Squat', 'Bodyweight Squat'],
      harder: ['Single-Leg Press', 'Paused Leg Press'],
      different: ['Hack Squat', 'Front Squat']
    }
  },

  'KB Goblet Squat': {
    muscleGroup: 'quads',
    movementType: 'squat',
    equipment: 'kettlebell',
    difficulty: 2,
    alternatives: {
      easier: ['Bodyweight Squat', 'Box Squat'],
      harder: ['Pause Goblet Squat', 'Heavy Goblet Squat'],
      different: ['Leg Press', 'Front Squat']
    }
  },

  'Hack Squat': {
    muscleGroup: 'quads',
    movementType: 'squat',
    equipment: 'machine',
    difficulty: 2,
    alternatives: {
      easier: ['Leg Press', 'Goblet Squat'],
      harder: ['Single-Leg Hack Squat', 'Paused Hack Squat'],
      different: ['Front Squat', 'Belt Squat']
    }
  },

  'Leg Curl': {
    muscleGroup: 'hamstrings',
    movementType: 'isolation',
    equipment: 'machine',
    difficulty: 1,
    alternatives: {
      easier: ['Stability Ball Curl', 'Light Leg Curl'],
      harder: ['Single-Leg Curl', 'Paused Leg Curl'],
      different: ['Romanian Deadlift', 'Nordic Curl']
    }
  },

  'DB Romanian Deadlift': {
    muscleGroup: 'hamstrings',
    movementType: 'hinge',
    equipment: 'dumbbell',
    difficulty: 3,
    alternatives: {
      easier: ['Bodyweight Hip Hinge', 'Light DB RDL'],
      harder: ['Barbell RDL', 'Single-Leg RDL'],
      different: ['Leg Curl', 'Good Mornings']
    }
  },

  '45° Hyperextension': {
    muscleGroup: 'lower_back',
    movementType: 'hinge',
    equipment: 'bodyweight',
    difficulty: 2,
    alternatives: {
      easier: ['Back Extension', 'Bodyweight Good Mornings'],
      harder: ['Weighted Hyperextension', 'GHD Hyperextension'],
      different: ['Romanian Deadlift', 'Good Mornings']
    }
  },

  'Leg Adduction': {
    muscleGroup: 'adductors',
    movementType: 'isolation',
    equipment: 'machine',
    difficulty: 1,
    alternatives: {
      easier: ['Band Adduction', 'Light Machine Adduction'],
      harder: ['Paused Adduction', 'Slow Tempo Adduction'],
      different: ['Copenhagen Plank', 'Side Lunges']
    }
  },

  'Leg Extension': {
    muscleGroup: 'quads',
    movementType: 'isolation',
    equipment: 'machine',
    difficulty: 1,
    alternatives: {
      easier: ['Light Leg Extension', 'Bodyweight Leg Extension'],
      harder: ['Single-Leg Extension', 'Paused Extension'],
      different: ['Leg Press', 'Goblet Squat']
    }
  },

  // LOWER_B - Additional Exercises
  'Leg Abduction': {
    muscleGroup: 'glutes',
    movementType: 'isolation',
    equipment: 'machine',
    difficulty: 1,
    alternatives: {
      easier: ['Band Abduction', 'Light Machine Abduction'],
      harder: ['Paused Abduction', 'Slow Tempo Abduction'],
      different: ['Hip Thrust', 'Glute Bridge']
    }
  },

  'Hip Thrust': {
    muscleGroup: 'glutes',
    movementType: 'hip_extension',
    equipment: 'barbell',
    difficulty: 3,
    alternatives: {
      easier: ['Glute Bridge', 'Bodyweight Hip Thrust'],
      harder: ['Single-Leg Hip Thrust', 'Paused Hip Thrust'],
      different: ['Romanian Deadlift', 'KB Swings']
    }
  },

  'KB Swings': {
    muscleGroup: 'posterior_chain',
    movementType: 'hinge',
    equipment: 'kettlebell',
    difficulty: 3,
    alternatives: {
      easier: ['Light KB Swings', 'DB Swings'],
      harder: ['Heavy KB Swings', 'Single-Arm Swings'],
      different: ['Romanian Deadlift', 'Good Mornings']
    }
  },

  'Standing Calf Raise': {
    muscleGroup: 'calves',
    movementType: 'isolation',
    equipment: 'machine',
    difficulty: 1,
    alternatives: {
      easier: ['Bodyweight Calf Raise', 'Light Machine Raise'],
      harder: ['Single-Leg Calf Raise', 'Paused Calf Raise'],
      different: ['Seated Calf Raise', 'Calf Press']
    }
  },

  'Seated Calf Raise': {
    muscleGroup: 'calves',
    movementType: 'isolation',
    equipment: 'machine',
    difficulty: 1,
    alternatives: {
      easier: ['Bodyweight Calf Raise', 'Light Machine Raise'],
      harder: ['Heavy Seated Raise', 'Paused Calf Raise'],
      different: ['Standing Calf Raise', 'Calf Press']
    }
  },

  // Core Exercises
  'Plank': {
    muscleGroup: 'core',
    movementType: 'isometric',
    equipment: 'bodyweight',
    difficulty: 1,
    alternatives: {
      easier: ['Knee Plank', 'Incline Plank'],
      harder: ['Weighted Plank', 'Extended Plank'],
      different: ['Dead Bug', 'Hollow Hold']
    }
  },

  'Side Plank': {
    muscleGroup: 'core',
    movementType: 'isometric',
    equipment: 'bodyweight',
    difficulty: 2,
    alternatives: {
      easier: ['Knee Side Plank', 'Short Hold Side Plank'],
      harder: ['Weighted Side Plank', 'Side Plank with Leg Raise'],
      different: ['Copenhagen Plank', 'Russian Twist']
    }
  },

  'Dead Bug': {
    muscleGroup: 'core',
    movementType: 'anti-extension',
    equipment: 'bodyweight',
    difficulty: 2,
    alternatives: {
      easier: ['Single-Leg Dead Bug', 'Slow Dead Bug'],
      harder: ['Weighted Dead Bug', 'Extended Dead Bug'],
      different: ['Reverse Crunch', 'Hollow Hold']
    }
  },

  'Reverse Crunch': {
    muscleGroup: 'core',
    movementType: 'spinal-flexion',
    equipment: 'bodyweight',
    difficulty: 1,
    alternatives: {
      easier: ['Knee Tucks', 'Lying Knee Raise'],
      harder: ['Decline Reverse Crunch', 'Hanging Knee Raise'],
      different: ['Dead Bug', 'Cable Crunch']
    }
  },

  'Landmine Press': {
    muscleGroup: 'shoulders',
    movementType: 'compound',
    equipment: 'barbell',
    difficulty: 2,
    alternatives: {
      easier: ['Light Landmine Press', 'Single-Arm Cable Press'],
      harder: ['Heavy Landmine Press', 'Standing Landmine Press'],
      different: ['DB Shoulder Press', 'Arnold Press']
    }
  },

  'DB Chest Fly': {
    muscleGroup: 'chest',
    movementType: 'isolation',
    equipment: 'dumbbells',
    difficulty: 1,
    alternatives: {
      easier: ['Light DB Fly', 'Machine Fly'],
      harder: ['Incline DB Fly', 'Cable Fly'],
      different: ['Cable Chest Fly', 'Pec Deck']
    }
  },

  'Machine Fly': {
    muscleGroup: 'chest',
    movementType: 'isolation',
    equipment: 'machine',
    difficulty: 1,
    alternatives: {
      easier: ['Light Machine Fly'],
      harder: ['Cable Fly', 'DB Chest Fly'],
      different: ['Pec Deck', 'Cable Chest Fly']
    }
  },

  'Pallof Press': {
    muscleGroup: 'core',
    movementType: 'anti-rotation',
    equipment: 'cable',
    difficulty: 2,
    alternatives: {
      easier: ['Band Pallof Press', 'Light Cable Pallof Press'],
      harder: ['Tall-Kneeling Pallof Press', 'Pallof Press with Hold'],
      different: ['Cable Woodchop', 'Dead Bug']
    }
  }
};

/**
 * Find an alternative exercise based on reason and pain intensity
 *
 * @param {string} exerciseName - Name of current exercise
 * @param {string} reason - Reason for alternative (SWAP_REASONS.PAIN or SWAP_REASONS.PLATEAU)
 * @param {string|null} painIntensity - Pain level (PAIN_LEVELS.MILD/MODERATE/SEVERE)
 * @returns {string|null} Alternative exercise name, or null if none suitable
 *
 * @example
 * findAlternative('DB Flat Bench Press', SWAP_REASONS.PAIN, PAIN_LEVELS.MODERATE)
 * // Returns: 'Floor Press'
 */
export function findAlternative(exerciseName, reason, painIntensity = null) {
  const metadata = EXERCISE_METADATA[exerciseName];
  if (!metadata) {
    console.warn(`[ExerciseMetadata] No metadata found for: ${exerciseName}`);
    return null;
  }

  if (reason === SWAP_REASONS.PAIN) {
    if (painIntensity === PAIN_LEVELS.SEVERE || painIntensity === PAIN_LEVELS.MODERATE) {
      // Check array has alternatives before accessing [0]
      return metadata.alternatives.easier?.length ? metadata.alternatives.easier[0] : null;
    }
    // Mild pain - return null (just warning, no alternative yet)
    return null;
  }

  if (reason === SWAP_REASONS.PLATEAU) {
    // Check array has alternatives before accessing [0]
    return metadata.alternatives.different?.length ? metadata.alternatives.different[0] : null;
  }

  return null;
}

/**
 * Get all alternative exercises for a given exercise
 *
 * @param {string} exerciseName - Name of current exercise
 * @returns {{easier: string[], harder: string[], different: string[]}} Alternative exercises by category
 *
 * @example
 * getAllAlternatives('DB Flat Bench Press')
 * // Returns: { easier: ['Floor Press', 'Incline Push-Ups'], harder: [...], different: [...] }
 */
export function getAllAlternatives(exerciseName) {
  const metadata = EXERCISE_METADATA[exerciseName];
  if (!metadata) {
    console.warn(`[ExerciseMetadata] No metadata found for: ${exerciseName}`);
    return { easier: [], harder: [], different: [] };
  }
  return metadata.alternatives;
}

/**
 * Get unlock milestone for an exercise
 *
 * @param {string} exerciseName - Name of exercise
 * @returns {Object|null} Milestone { weight, reps, sets } or null if no milestone
 */
export function getUnlockMilestone(exerciseName) {
  return UNLOCK_MILESTONES[exerciseName] || null;
}

/**
 * Check if exercise has rotation pool
 *
 * @param {string} exerciseName - Name of exercise
 * @returns {boolean} True if exercise has rotation variants
 */
export function hasRotationPool(exerciseName) {
  return !!ROTATION_POOLS[exerciseName];
}

/**
 * Get rotation variants for an exercise
 *
 * @param {string} exerciseName - Name of exercise
 * @returns {string[]|null} Array of rotation variant names, or null
 */
export function getRotationVariants(exerciseName) {
  const pool = ROTATION_POOLS[exerciseName];
  return pool ? pool.rotations : null;
}
