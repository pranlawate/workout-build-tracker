const WARMUPS = {
  UPPER_A: [
    'Cat-Cow: 10 reps',
    'Band Pull-Aparts: 15 reps',
    'Goblet Squat (bodyweight): 10 reps',
    'Hip Hinge Drill: 10 reps',
    'Ramp-up Set: 50% weight × 10 reps (Goblet Squat)'
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
        tempo: '2 sec down, 1 sec up',
        notes: 'Primary: Chest, Secondary: Front delts, triceps',
        machineOk: true
      },
      {
        name: 'Seated Cable Row',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 22.5,
        weightIncrement: 2.5,
        tempo: '2 sec pull, 2 sec return',
        notes: 'Primary: Mid back (lats, rhomboids)',
        machineOk: true
      },
      {
        name: 'Cable Chest Fly',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 10,
        weightIncrement: 2.5,
        tempo: '2 sec down, 1 sec up',
        notes: 'Primary: Chest (horizontal adduction). Safer shoulder position than DB fly.',
        machineOk: true
      },
      {
        name: 'T-Bar Row',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 5,
        weightIncrement: 2.5,
        tempo: '2 sec pull, 2 sec return',
        notes: 'Primary: Back thickness (lats, traps)',
        machineOk: true
      },
      {
        name: 'DB Lateral Raises',
        sets: 2,
        repRange: '12-15',
        rirTarget: '2-3',
        startingWeight: 3.5,
        weightIncrement: 1.25,
        tempo: '2 sec up, 3 sec down',
        notes: 'Primary: Side delts',
        machineOk: false
      },
      {
        name: 'Face Pulls',
        sets: 2,
        repRange: '15-20',
        rirTarget: '3-3',
        startingWeight: 12.5,
        weightIncrement: 2.5,
        tempo: 'Controlled, external rotation',
        notes: 'Rotator cuff health (stiff shoulders)',
        machineOk: true
      },
      {
        name: 'Band Pull-Aparts',
        sets: 2,
        repRange: '15-20',
        rirTarget: '3-3',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: '1 sec apart, 2 sec together',
        notes: 'Rotator cuff activation',
        machineOk: false
      }
    ]
  },

  LOWER_A: {
    name: 'LOWER_A',
    displayName: 'Lower A - Bilateral',
    description: 'Bilateral/compound emphasis',
    exercises: [
      {
        name: 'Hack Squat',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        startingWeight: 20,
        weightIncrement: 5,
        tempo: '3 sec down, 2 sec up',
        notes: 'Quad development (weak legs)',
        machineOk: true
      },
      {
        name: 'Leg Curl',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 17.5,
        weightIncrement: 2.5,
        tempo: '2 sec curl, 3 sec return',
        notes: 'Primary: Hamstrings',
        machineOk: true
      },
      {
        name: 'Leg Extension',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 17.5,
        weightIncrement: 2.5,
        tempo: '2 sec extend, 3 sec return',
        notes: 'Do AFTER squats (pre-exhaustion safer)',
        machineOk: true
      },
      {
        name: '45° Hyperextension',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: '3-4 sec down, 2 sec up',
        notes: 'CRITICAL: Lower back weakness - NOT to failure (bodyweight only)',
        machineOk: false
      },
      {
        name: 'Standing Calf Raise',
        sets: 3,
        repRange: '15-20',
        rirTarget: '2-3',
        startingWeight: 20,
        weightIncrement: 5,
        tempo: 'Explosive up (1 sec), controlled down (2 sec)',
        notes: 'Gastrocnemius (fast-twitch)',
        machineOk: true
      },
      {
        name: 'Plank',
        sets: 3,
        repRange: '30-60s',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: 'Hold with proper breathing',
        notes: 'Core strength for lower back health',
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
        tempo: '2 sec pull, 2 sec return',
        notes: 'Primary: Lats (back width)',
        machineOk: true
      },
      {
        name: 'DB Shoulder Press',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        startingWeight: 7.5,
        weightIncrement: 1.25,
        tempo: '2 sec press, 2 sec down',
        notes: 'Primary: Shoulders (anterior/lateral delts)',
        machineOk: true
      },
      {
        name: 'Chest-Supported Row',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 10,
        weightIncrement: 2.5,
        tempo: '2 sec pull, 2 sec return',
        notes: 'Primary: Back thickness',
        machineOk: true
      },
      {
        name: 'Incline DB Press',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 7.5,
        weightIncrement: 2.5,
        tempo: '2 sec down, 1 sec up',
        notes: 'Upper chest emphasis',
        machineOk: true
      },
      {
        name: 'Reverse Fly',
        sets: 2,
        repRange: '12-15',
        rirTarget: '2-3',
        startingWeight: 5,
        weightIncrement: 1.25,
        tempo: 'Controlled, focus on rear delts',
        notes: 'Rear delts, rotator cuff',
        machineOk: true
      },
      {
        name: 'Band Pull-Aparts',
        sets: 2,
        repRange: '15-20',
        rirTarget: '3-3',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: '1 sec apart, 2 sec together',
        notes: 'Rotator cuff activation',
        machineOk: false
      },
      {
        name: 'Dead Bug',
        sets: 3,
        repRange: '10-12/side',
        rirTarget: '2-3',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: 'Controlled alternating',
        notes: 'Core stability, lower back health',
        machineOk: false
      }
    ]
  },

  LOWER_B: {
    name: 'LOWER_B',
    displayName: 'Lower B - Unilateral',
    description: 'Unilateral/accessory emphasis',
    exercises: [
      {
        name: 'DB Goblet Squat',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        startingWeight: 10,
        weightIncrement: 2.5,
        tempo: '3 sec down, 2 sec up',
        notes: 'Full leg compound',
        machineOk: false
      },
      {
        name: 'DB Romanian Deadlift',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 10,
        weightIncrement: 2.5,
        tempo: '3 sec down, 2 sec up',
        notes: 'Hamstrings, glutes, lower back',
        machineOk: false
      },
      {
        name: 'Leg Abduction',
        sets: 3,
        repRange: '12-15',
        rirTarget: '2-3',
        startingWeight: 15,
        weightIncrement: 2.5,
        tempo: '2 sec out, 2 sec in',
        notes: 'Hip abductors (glute medius)',
        machineOk: true
      },
      {
        name: 'Hip Thrust',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 20,
        weightIncrement: 5,
        tempo: '1 sec up, 2 sec down, 1 sec squeeze',
        notes: 'Primary: Glutes',
        machineOk: true
      },
      {
        name: 'Seated Calf Raise',
        sets: 3,
        repRange: '15-20',
        rirTarget: '2-3',
        startingWeight: 15,
        weightIncrement: 5,
        tempo: '3-5 sec (slow-twitch focus)',
        notes: 'Soleus (slow-twitch dominant)',
        machineOk: true
      },
      {
        name: 'Side Plank',
        sets: 3,
        repRange: '30s/side',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: 'Hold stable',
        notes: 'Obliques, glute medius',
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
