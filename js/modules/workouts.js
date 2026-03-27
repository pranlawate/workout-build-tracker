const WARMUPS = {
  UPPER_A: [
    'Chin Tucks: 10 reps (hold 5 sec each)',
    'Cat-Cow: 10 reps',
    'Band Pull-Aparts: 2 sets × 15-20 reps',
    'Arm Circles: 10 each direction',
    'Scapular Retractions: 10 reps',
    'Ramp-up Set: 50% weight × 10 reps (DB Flat Bench Press)'
  ],
  LOWER_A: [
    'Cat-Cow: 10 reps',
    'Band Pull-Aparts: 15 reps',
    'Bodyweight Squats: 10 reps',
    'Leg Swings: 10 per leg',
    'Ramp-up Set: 50% weight × 10 reps (first exercise)'
  ],
  UPPER_B: [
    'Chin Tucks: 10 reps (hold 5 sec each)',
    'Dead Hang: 30-60 seconds',
    'Band Pull-Aparts: 2 sets × 15-20 reps',
    'Scapular Pull-Ups: 5 reps',
    'Arm Circles: 10 each direction',
    'Ramp-up Set: 50% weight × 10 reps (first exercise)'
  ],
  LOWER_B: [
    'Glute Bridges (bodyweight): 15 reps',
    'Leg Swings: 10 per leg',
    'Ankle Mobility: 10 reps per side',
    'Hip Flexor Stretch: 30s per side',
    'Ramp-up Set: 50% weight × 10 reps (first exercise)'
  ]
};

export function getWarmup(workoutName) {
  return WARMUPS[workoutName] || [];
}

// Exercise definitions for progression pathway exercises
export const EXERCISE_DEFINITIONS = {
  'KB Goblet Squat': {
    sets: 3,
    repRange: '8-12',
    rirTarget: '2-3',
    restMinutes: 3,
    startingWeight: 12,  // 12kg KB
    weightIncrement: 4,   // KB increments (8, 12, 16, 20, 24, 28, 32kg)
    notes: 'Compound | Quads, Glutes',
    machineOk: false
  },
  'KB Swings': {
    sets: 3,
    repRange: '15-20',  // Higher reps for ballistic work
    rirTarget: '2-3',
    restMinutes: 2,
    startingWeight: 12,  // Start conservative
    weightIncrement: 4,
    notes: 'Compound | Glutes, Hamstrings | Ballistic hip power',
    machineOk: false
  },
  'Decline DB Press': {
    sets: 3,
    repRange: '10-12',
    rirTarget: '2-3',
    restMinutes: 2,
    startingWeight: 7.5,
    weightIncrement: 2.5,
    notes: 'Compound | Lower Chest (Costal Head)',
    machineOk: true
  },
  'Standard DB Curls': {
    sets: 2,
    repRange: '10-12',
    rirTarget: '2-3',
    restMinutes: 2,
    startingWeight: 7.5,
    weightIncrement: 1.25,
    notes: 'Isolation | Biceps (Long + Short Heads)',
    machineOk: false
  },
  'Overhead Tricep Extension': {
    sets: 2,
    repRange: '12-15',
    rirTarget: '2-3',
    restMinutes: 1,
    startingWeight: 10,
    weightIncrement: 2.5,
    notes: 'Isolation | Triceps (Long + Medial Heads)',
    machineOk: true
  }
};

export const WORKOUTS = {
  UPPER_A: {
    name: 'UPPER_A',
    displayName: 'Upper A',
    description: 'Push-biased: chest angles + back',
    exercises: [
      {
        name: 'Incline DB Press',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        restMinutes: 3,
        startingWeight: 7.5,
        weightIncrement: 2.5,
        notes: 'Compound | Upper Chest (Clavicular) | Keep bench at 30° or lower',
        machineOk: true
      },
      {
        name: 'Seated Cable Row',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        restMinutes: 3,
        startingWeight: 22.5,
        weightIncrement: 2.5,
        notes: 'Compound | Mid Back (Lats, Rhomboids)',
        machineOk: true
      },
      {
        name: 'Decline DB Press',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        restMinutes: 2,
        startingWeight: 7.5,
        weightIncrement: 2.5,
        notes: 'Compound | Lower Chest (Costal Head)',
        machineOk: true
      },
      {
        name: 'T-Bar Row',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        restMinutes: 3,
        startingWeight: 5,
        weightIncrement: 2.5,
        notes: 'Compound | Back Thickness (Lats, Traps)',
        machineOk: true
      },
      {
        name: 'Machine Fly',
        sets: 3,
        repRange: '10-15',
        rirTarget: '2-3',
        restMinutes: 2,
        startingWeight: 15,
        weightIncrement: 2.5,
        notes: 'Isolation | Mid Chest | Pec deck stretch & squeeze',
        machineOk: true
      },
      {
        name: 'Face Pulls',
        sets: 3,
        repRange: '15-20',
        rirTarget: '3-3',
        restMinutes: 1,
        startingWeight: 12.5,
        weightIncrement: 2.5,
        notes: 'Isolation | Rear Delts, Rotator Cuff | External rotation focus',
        machineOk: true
      },
      {
        name: 'Tricep Pushdowns',
        sets: 2,
        repRange: '12-15',
        rirTarget: '2-3',
        restMinutes: 1,
        startingWeight: 10,
        weightIncrement: 2.5,
        notes: 'Isolation | Triceps (lateral + long head)',
        machineOk: true
      }
    ]
  },

  LOWER_A: {
    name: 'LOWER_A',
    displayName: 'Lower A',
    description: 'Quad-focused lower body workout',
    exercises: [
      {
        name: 'Hack Squat',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        restMinutes: 3,
        startingWeight: 20,
        weightIncrement: 5,
        notes: 'Compound | Quads',
        machineOk: true
      },
      {
        name: '45° Hyperextension',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        restMinutes: 1,
        startingWeight: 0,
        weightIncrement: 0,
        notes: 'Isolation | Lower Back | Bodyweight only',
        machineOk: false
      },
      {
        name: 'Hip Thrust',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        restMinutes: 2,
        startingWeight: 20,
        weightIncrement: 5,
        notes: 'Isolation | Glutes',
        machineOk: true
      },
      {
        name: 'Leg Extension',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        restMinutes: 2,
        startingWeight: 17.5,
        weightIncrement: 2.5,
        notes: 'Isolation | Quads',
        machineOk: true
      },
      {
        name: 'Standing Calf Raise',
        sets: 3,
        repRange: '15-20',
        rirTarget: '2-3',
        restMinutes: 1,
        startingWeight: 20,
        weightIncrement: 5,
        notes: 'Isolation | Gastrocnemius',
        machineOk: true
      },
      {
        name: 'Dead Bug',
        sets: 3,
        repRange: '10-12/side',
        rirTarget: '2-3',
        restMinutes: 1,
        startingWeight: 0,
        weightIncrement: 0,
        notes: 'Core | Anti-extension | Shoulder-safe (supine)',
        machineOk: false
      }
    ]
  },

  UPPER_B: {
    name: 'UPPER_B',
    displayName: 'Upper B',
    description: 'Pull-biased: back, shoulders + arms',
    exercises: [
      {
        name: 'Lat Pulldown',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        restMinutes: 3,
        startingWeight: 22.5,
        weightIncrement: 2.5,
        notes: 'Compound | Lats (Back Width)',
        machineOk: true
      },
      {
        name: 'Landmine Press',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        restMinutes: 3,
        startingWeight: 10,
        weightIncrement: 2.5,
        notes: 'Compound | Front Delts, Upper Chest | Shoulder-safe angled press',
        machineOk: false
      },
      {
        name: 'Chest-Supported Row',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        restMinutes: 3,
        startingWeight: 10,
        weightIncrement: 2.5,
        notes: 'Compound | Back Thickness',
        machineOk: true
      },
      {
        name: 'DB Lateral Raises',
        sets: 2,
        repRange: '12-15',
        rirTarget: '2-3',
        restMinutes: 1,
        startingWeight: 3.5,
        weightIncrement: 1.25,
        notes: 'Isolation | Side Delts | Thumbs up, never above shoulder height',
        machineOk: false
      },
      {
        name: 'Reverse Fly',
        sets: 3,
        repRange: '12-15',
        rirTarget: '2-3',
        restMinutes: 2,
        startingWeight: 5,
        weightIncrement: 1.25,
        notes: 'Isolation | Rear Delts, Rotator Cuff',
        machineOk: true
      },
      {
        name: 'DB Hammer Curls',
        sets: 2,
        repRange: '10-12',
        rirTarget: '2-3',
        restMinutes: 2,
        startingWeight: 7.5,
        weightIncrement: 1.25,
        notes: 'Isolation | Biceps + Brachialis',
        machineOk: false
      },
      {
        name: 'Reverse Crunch',
        sets: 3,
        repRange: '12-15',
        rirTarget: '2-3',
        restMinutes: 1,
        startingWeight: 0,
        weightIncrement: 0,
        notes: 'Core | Lower abs | Shoulder & neck safe (supine)',
        machineOk: false
      }
    ]
  },

  LOWER_B: {
    name: 'LOWER_B',
    displayName: 'Lower B',
    description: 'Hamstring-focused lower body workout',
    exercises: [
      {
        name: 'Leg Press',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        restMinutes: 3,
        startingWeight: 20,
        weightIncrement: 5,
        notes: 'Compound | Quads, Glutes',
        machineOk: true
      },
      {
        name: 'DB Romanian Deadlift',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        restMinutes: 3,
        startingWeight: 10,
        weightIncrement: 2.5,
        notes: 'Compound | Hamstrings, Glutes, Lower Back',
        machineOk: false
      },
      {
        name: 'Leg Abduction',
        sets: 3,
        repRange: '12-15',
        rirTarget: '2-3',
        restMinutes: 2,
        startingWeight: 15,
        weightIncrement: 2.5,
        notes: 'Isolation | Hip Abductors (Glute Medius)',
        machineOk: true
      },
      {
        name: 'Leg Adduction',
        sets: 3,
        repRange: '12-15',
        rirTarget: '2-3',
        restMinutes: 2,
        startingWeight: 15,
        weightIncrement: 2.5,
        notes: 'Isolation | Hip Adductors | Pairs with abduction for balance',
        machineOk: true
      },
      {
        name: 'Leg Curl',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        restMinutes: 2,
        startingWeight: 17.5,
        weightIncrement: 2.5,
        notes: 'Isolation | Hamstrings',
        machineOk: true
      },
      {
        name: 'Seated Calf Raise',
        sets: 3,
        repRange: '15-20',
        rirTarget: '2-3',
        restMinutes: 1,
        startingWeight: 15,
        weightIncrement: 5,
        notes: 'Isolation | Soleus',
        machineOk: true
      },
      {
        name: 'Pallof Press',
        sets: 3,
        repRange: '10-12/side',
        rirTarget: '2-3',
        restMinutes: 1,
        startingWeight: 5,
        weightIncrement: 2.5,
        notes: 'Core | Obliques | Anti-rotation, shoulder-safe (standing cable)',
        machineOk: true
      }
    ]
  }
};

export function getWorkout(workoutName) {
  return WORKOUTS[workoutName];
}

export function getAllWorkouts() {
  return [
    WORKOUTS.UPPER_A,
    WORKOUTS.LOWER_A,
    WORKOUTS.UPPER_B,
    WORKOUTS.LOWER_B
  ];
}

/**
 * Get workout with user exercise selections applied
 *
 * @param {string} workoutName - Workout key (e.g., 'UPPER_A')
 * @param {Object} storage - Storage instance to get exercise selections
 * @returns {Object} Workout with user selections applied
 */
export function getWorkoutWithSelections(workoutName, storage) {
  const baseWorkout = getWorkout(workoutName);
  if (!baseWorkout || !storage) return baseWorkout;

  const selections = storage.getExerciseSelections();

  // Deep clone the workout to avoid mutating the original
  const customWorkout = {
    ...baseWorkout,
    exercises: baseWorkout.exercises.map((exercise, index) => {
      const slotKey = `${workoutName}_SLOT_${index + 1}`;
      const selectedName = selections[slotKey];

      // If user selected a different exercise for this slot
      if (selectedName && selectedName !== exercise.name) {
        // Try to get definition from EXERCISE_DEFINITIONS
        const altDefinition = EXERCISE_DEFINITIONS[selectedName];
        if (altDefinition) {
          return { ...altDefinition, name: selectedName };
        }

        // If not in EXERCISE_DEFINITIONS, search in other workout slots
        // (for exercises that exist in default workouts)
        for (const workout of getAllWorkouts()) {
          const found = workout.exercises.find(ex => ex.name === selectedName);
          if (found) return { ...found };
        }
      }

      // Return original exercise if no selection or selection not found
      return { ...exercise };
    })
  };

  return customWorkout;
}
