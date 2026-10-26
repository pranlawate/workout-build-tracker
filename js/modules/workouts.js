const WARMUPS = {
  UPPER_A: [
    'Chin Tucks: 10 reps (hold 5 sec each)',
    'Cat-Cow: 10 reps',
    'Band Pull-Aparts: 2 sets × 15-20 reps',
    'Arm Circles: 10 each direction',
    'Scapular Retractions: 10 reps',
    'Ramp-up Set: 50% weight × 10 reps (first exercise)'
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

/**
 * Tendon Hold Protocol
 *
 * After the last working set of key exercises, reduce to ~70% working weight
 * and hold at the stretched position for the prescribed duration.
 * Progressive overload: start at startSeconds, add 5s/week until reaching targetSeconds.
 * Then increase load slightly and reset duration.
 *
 * exerciseName: which exercise triggers the tendon hold
 * position: joint angle / body position for the hold
 * tendon: primary tendon being loaded
 * startSeconds: initial hold duration (week 1)
 * targetSeconds: goal duration before increasing load
 * loadPercent: percentage of working weight to use
 * cue: short coaching cue shown during the hold
 */
const TENDON_HOLDS = {
  UPPER_A: [
    {
      exerciseName: 'Face Pulls',
      position: 'Peak external rotation (elbows back, hands apart)',
      tendon: 'Rotator cuff (supraspinatus, infraspinatus)',
      startSeconds: 20,
      targetSeconds: 45,
      loadPercent: 70,
      cue: 'Hold rope at face height, elbows back, externally rotated. Breathe steadily.'
    }
  ],
  LOWER_A: [
    {
      exerciseName: 'Hack Squat',
      position: 'Bottom of squat (thighs at or below parallel)',
      tendon: 'Patellar tendon',
      startSeconds: 20,
      targetSeconds: 45,
      loadPercent: 70,
      cue: 'Settle into bottom position, knees tracking over toes. Breathe steadily, stay tight.'
    },
    {
      exerciseName: 'Seated Calf Raise',
      position: 'Heels fully below platform (max dorsiflexion)',
      tendon: 'Soleus / Achilles tendon',
      startSeconds: 20,
      targetSeconds: 45,
      loadPercent: 70,
      cue: 'Let heels sink as far as comfortable. Maintain contact with pad. Breathe.'
    }
  ],
  UPPER_B: [
    {
      exerciseName: 'Lat Pulldown',
      position: 'Arms fully extended overhead (dead hang position)',
      tendon: 'Lat / bicep tendon at shoulder',
      startSeconds: 20,
      targetSeconds: 45,
      loadPercent: 70,
      cue: 'Let the weight stretch you. Shoulders by ears, relax into the stretch. Breathe.'
    }
  ],
  LOWER_B: [
    {
      exerciseName: 'DB Romanian Deadlift',
      position: 'Bottom stretch (DBs at shin level, hips back)',
      tendon: 'Proximal hamstring tendon',
      startSeconds: 20,
      targetSeconds: 45,
      loadPercent: 70,
      cue: 'Maintain flat back, feel hamstring stretch. Do not round. Breathe steadily.'
    },
    {
      exerciseName: 'Standing Calf Raise',
      position: 'Heels fully below platform (max dorsiflexion)',
      tendon: 'Gastrocnemius / Achilles tendon',
      startSeconds: 20,
      targetSeconds: 45,
      loadPercent: 70,
      cue: 'Straight knees, heels as low as possible. Breathe and hold.'
    }
  ]
};

export function getTendonHolds(workoutName) {
  return TENDON_HOLDS[workoutName] || [];
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
  },
  'KB Swings': {
    sets: 3,
    repRange: '15-20',
    rirTarget: '2-3',
    restMinutes: 2,
    startingWeight: 12,
    weightIncrement: 4,
    notes: 'Compound | Glutes, Hamstrings | Ballistic hip power',
  },
  'Walking Lunges': {
    sets: 3,
    repRange: '10-12/leg',
    rirTarget: '2-3',
    restMinutes: 2,
    startingWeight: 0,
    weightIncrement: 2.5,
    notes: 'Compound | Quads, Glutes | DB in each hand',
  },
  'Decline DB Press': {
    sets: 3,
    repRange: '10-12',
    rirTarget: '2-3',
    restMinutes: 2,
    startingWeight: 7.5,
    weightIncrement: 2.5,
    notes: 'Compound | Lower Chest (Costal Head)',
  },
  'Standard DB Curls': {
    sets: 2,
    repRange: '10-12',
    rirTarget: '2-3',
    restMinutes: 2,
    startingWeight: 7.5,
    weightIncrement: 1.25,
    notes: 'Isolation | Biceps (Long + Short Heads)',
  },
  'Overhead Tricep Extension': {
    sets: 2,
    repRange: '12-15',
    rirTarget: '2-3',
    restMinutes: 1,
    startingWeight: 10,
    weightIncrement: 2.5,
    notes: 'Isolation | Triceps (Long + Medial Heads)',
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
        optional: true,
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
      },
      {
        name: 'DB Lateral Raises',
        sets: 3,
        repRange: '12-15',
        rirTarget: '2-3',
        restMinutes: 1,
        startingWeight: 3.5,
        weightIncrement: 1.25,
        notes: 'Isolation | Side Delts | Thumbs up, never above shoulder height',
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
        optional: true,
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
        optional: true,
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
      const rawSelection = selections[slotKey];
      const selectedName = typeof rawSelection === 'string' ? rawSelection.trim() : '';

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

        // Unknown selection: keep default slot exercise (avoid incomplete / bogus entries)
        console.warn('[workouts] Unknown exercise selection for slot:', slotKey, rawSelection);
      }

      // Return original exercise if no selection or selection not found
      return { ...exercise };
    })
  };

  return customWorkout;
}
