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
        tempo: '2 sec down, 1 sec up',
        notes: 'Compound | Chest, Front Delts, Triceps | 2s eccentric, 1s concentric',
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
        notes: 'Compound | Mid Back (Lats, Rhomboids) | 2s concentric, 2s eccentric',
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
        tempo: '2 sec pull, 2 sec return',
        notes: 'Compound | Back Thickness (Lats, Traps) | 2s concentric, 2s eccentric',
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
        notes: 'Isolation | Side Delts | 2s up, 3s down',
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
        tempo: '1 sec apart, 2 sec together',
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
        tempo: '3 sec down, 2 sec up',
        notes: 'Compound | Quads | 3s eccentric, 2s concentric',
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
        tempo: '1 sec up, 2 sec down, 1 sec squeeze',
        notes: 'Isolation | Glutes | 1s concentric, 1s squeeze, 2s eccentric',
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
        notes: 'Isolation | Quads | 2s extend, 3s return',
        machineOk: true
      },
      {
        name: 'Standing Calf Raise',
        sets: 3,
        repRange: '15-20',
        rirTarget: '2-3',
        startingWeight: 20,
        weightIncrement: 5,
        tempo: 'Explosive up (1 sec), controlled down (2 sec)',
        notes: 'Isolation | Gastrocnemius | Explosive up, 2s down',
        machineOk: true
      },
      {
        name: 'Plank',
        sets: 3,
        repRange: '30-60s',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: 'Hold with proper breathing',
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
        tempo: '2 sec pull, 2 sec return',
        notes: 'Compound | Lats (Back Width) | 2s concentric, 2s eccentric',
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
        notes: 'Compound | Front & Side Delts | 2s concentric, 2s eccentric',
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
        notes: 'Compound | Back Thickness | 2s concentric, 2s eccentric',
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
        notes: 'Compound | Upper Chest | 2s eccentric, 1s concentric',
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
        notes: 'Isolation | Rear Delts, Rotator Cuff | Controlled, rear delt focus',
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
        tempo: 'Controlled alternating',
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
        tempo: '3 sec down, 2 sec up',
        notes: 'Compound | Quads, Glutes | 3s eccentric, 2s concentric',
        machineOk: true
      },
      {
        name: 'DB Romanian Deadlift',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 10,
        weightIncrement: 2.5,
        tempo: '3 sec down, 2 sec up',
        notes: 'Compound | Hamstrings, Glutes, Lower Back | 3s eccentric, 2s concentric',
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
        notes: 'Isolation | Hip Abductors (Glute Medius) | 2s out, 2s in',
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
        notes: 'Isolation | Hamstrings | 2s curl, 3s return',
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
        notes: 'Isolation | Soleus | Slow controlled tempo',
        machineOk: true
      },
      {
        name: 'Side Plank',
        sets: 3,
        repRange: '30s/side',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: 'Hold stable',
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
