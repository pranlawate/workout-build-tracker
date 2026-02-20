const WARMUPS = {
  UPPER_A: [
    'Cat-Cow: 10 reps',
    'Band Pull-Aparts: 15 reps',
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
    'Dead Hang: 20-30 seconds',
    'Band Pull-Aparts: 15 reps',
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

export const WORKOUTS = {
  UPPER_A: {
    name: 'UPPER_A',
    displayName: 'Upper A - Horizontal',
    description: 'Horizontal push/pull emphasis',
    exercises: [
      {
        name: 'DB Flat Bench Press',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        startingWeight: 7.5,
        weightIncrement: 2.5,
        notes: 'Compound | Chest, Front Delts, Triceps',
        machineOk: true
      },
      {
        name: 'Seated Cable Row',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 22.5,
        weightIncrement: 2.5,
        notes: 'Compound | Mid Back (Lats, Rhomboids)',
        machineOk: true
      },
      {
        name: 'Cable Chest Fly',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 10,
        weightIncrement: 2.5,
        notes: 'Isolation | Chest | Safer for shoulders',
        machineOk: true
      },
      {
        name: 'T-Bar Row',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 5,
        weightIncrement: 2.5,
        notes: 'Compound | Back Thickness (Lats, Traps)',
        machineOk: true
      },
      {
        name: 'DB Lateral Raises',
        sets: 2,
        repRange: '12-15',
        rirTarget: '2-3',
        startingWeight: 3.5,
        weightIncrement: 1.25,
        notes: 'Isolation | Side Delts',
        machineOk: false
      },
      {
        name: 'Face Pulls',
        sets: 2,
        repRange: '15-20',
        rirTarget: '3-3',
        startingWeight: 12.5,
        weightIncrement: 2.5,
        notes: 'Isolation | Rear Delts, Rotator Cuff | External rotation focus',
        machineOk: true
      },
      {
        name: 'Band Pull-Aparts',
        sets: 2,
        repRange: '15-20',
        rirTarget: '3-3',
        startingWeight: 0,
        weightIncrement: 0,
        notes: 'Isolation | Rotator Cuff | Activation work',
        machineOk: false
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
        startingWeight: 20,
        weightIncrement: 5,
        notes: 'Isolation | Gastrocnemius',
        machineOk: true
      },
      {
        name: 'Plank',
        sets: 3,
        repRange: '30-60s',
        startingWeight: 0,
        weightIncrement: 0,
        notes: 'Core | Core Stability | Anti-extension hold',
        machineOk: false
      }
    ]
  },

  UPPER_B: {
    name: 'UPPER_B',
    displayName: 'Upper B - Vertical',
    description: 'Vertical push/pull emphasis',
    exercises: [
      {
        name: 'Lat Pulldown',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        startingWeight: 22.5,
        weightIncrement: 2.5,
        notes: 'Compound | Lats (Back Width)',
        machineOk: true
      },
      {
        name: 'DB Shoulder Press',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        startingWeight: 7.5,
        weightIncrement: 1.25,
        notes: 'Compound | Front & Side Delts',
        machineOk: true
      },
      {
        name: 'Chest-Supported Row',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 10,
        weightIncrement: 2.5,
        notes: 'Compound | Back Thickness',
        machineOk: true
      },
      {
        name: 'Incline DB Press',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 7.5,
        weightIncrement: 2.5,
        notes: 'Compound | Upper Chest',
        machineOk: true
      },
      {
        name: 'Reverse Fly',
        sets: 2,
        repRange: '12-15',
        rirTarget: '2-3',
        startingWeight: 5,
        weightIncrement: 1.25,
        notes: 'Isolation | Rear Delts, Rotator Cuff',
        machineOk: true
      },
      {
        name: 'Band Pull-Aparts',
        sets: 2,
        repRange: '15-20',
        rirTarget: '3-3',
        startingWeight: 0,
        weightIncrement: 0,
        notes: 'Isolation | Rotator Cuff | Activation work',
        machineOk: false
      },
      {
        name: 'Dead Bug',
        sets: 3,
        repRange: '10-12/side',
        rirTarget: '2-3',
        startingWeight: 0,
        weightIncrement: 0,
        notes: 'Core | Core Stability | Anti-rotation control',
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
        startingWeight: 15,
        weightIncrement: 2.5,
        notes: 'Isolation | Hip Abductors (Glute Medius)',
        machineOk: true
      },
      {
        name: 'Leg Curl',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
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
        startingWeight: 15,
        weightIncrement: 5,
        notes: 'Isolation | Soleus',
        machineOk: true
      },
      {
        name: 'Side Plank',
        sets: 3,
        repRange: '30s/side',
        startingWeight: 0,
        weightIncrement: 0,
        notes: 'Core | Obliques, Glute Medius | Anti-lateral flexion',
        machineOk: false
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
