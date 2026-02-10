// Exercise Metadata Database
// Provides exercise information and alternatives for the progression system

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
  }
};

// Helper function to find alternatives by reason
export function findAlternative(exerciseName, reason, painIntensity = null) {
  const metadata = EXERCISE_METADATA[exerciseName];
  if (!metadata) {
    console.warn(`[ExerciseMetadata] No metadata found for: ${exerciseName}`);
    return null;
  }

  if (reason === 'pain') {
    if (painIntensity === 'severe' || painIntensity === 'moderate') {
      return metadata.alternatives.easier[0];
    }
    // Mild pain - return null (just warning, no alternative yet)
    return null;
  }

  if (reason === 'plateau') {
    // Different equipment for new stimulus
    return metadata.alternatives.different[0];
  }

  return null;
}

// Helper function to get all alternatives for an exercise
export function getAllAlternatives(exerciseName) {
  const metadata = EXERCISE_METADATA[exerciseName];
  if (!metadata) {
    return { easier: [], harder: [], different: [] };
  }
  return metadata.alternatives;
}
