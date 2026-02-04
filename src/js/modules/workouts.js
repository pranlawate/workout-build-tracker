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
        notes: 'Primary: Chest, Secondary: Front delts, triceps'
      },
      {
        name: 'Seated Cable Row',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 22.5,
        weightIncrement: 2.5,
        tempo: '2 sec pull, 2 sec return',
        notes: 'Primary: Mid back (lats, rhomboids)'
      },
      {
        name: 'DB Chest Fly',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 5,
        weightIncrement: 1.25,
        tempo: '3 sec down (stretch), 1 sec up',
        notes: 'Primary: Chest (horizontal adduction)'
      },
      {
        name: 'T-Bar Row',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 5,
        weightIncrement: 2.5,
        tempo: '2 sec pull, 2 sec return',
        notes: 'Primary: Back thickness (lats, traps)'
      },
      {
        name: 'DB Lateral Raises',
        sets: 2,
        repRange: '12-15',
        rirTarget: '2-3',
        startingWeight: 3.5,
        weightIncrement: 1.25,
        tempo: '2 sec up, 3 sec down',
        notes: 'Primary: Side delts'
      },
      {
        name: 'Face Pulls',
        sets: 2,
        repRange: '15-20',
        rirTarget: '3',
        startingWeight: 12.5,
        weightIncrement: 2.5,
        tempo: 'Controlled, external rotation',
        notes: 'Rotator cuff health (stiff shoulders)'
      },
      {
        name: 'Band Pull-Aparts',
        sets: 2,
        repRange: '15-20',
        rirTarget: '3',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: '1 sec apart, 2 sec together',
        notes: 'Rotator cuff activation'
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
        notes: 'Quad development (weak legs)'
      },
      {
        name: 'Leg Curl',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 17.5,
        weightIncrement: 2.5,
        tempo: '2 sec curl, 3 sec return',
        notes: 'Primary: Hamstrings'
      },
      {
        name: 'Leg Extension',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 17.5,
        weightIncrement: 2.5,
        tempo: '2 sec extend, 3 sec return',
        notes: 'Do AFTER squats (pre-exhaustion safer)'
      },
      {
        name: '45° Hyperextension',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 0,
        weightIncrement: 2.5,
        tempo: '3-4 sec down, 2 sec up',
        notes: 'CRITICAL: Lower back weakness - NOT to failure'
      },
      {
        name: 'Standing Calf Raise',
        sets: 3,
        repRange: '15-20',
        rirTarget: '2-3',
        startingWeight: 20,
        weightIncrement: 5,
        tempo: 'Explosive up (1 sec), controlled down (2 sec)',
        notes: 'Gastrocnemius (fast-twitch)'
      },
      {
        name: 'Plank',
        sets: 3,
        repRange: '30-60s',
        rirTarget: '2-3',
        startingWeight: 0,
        weightIncrement: 2.5,
        tempo: 'Hold with proper breathing',
        notes: 'Core strength for lower back health'
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
        notes: 'Primary: Lats (back width)'
      },
      {
        name: 'DB Shoulder Press',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        startingWeight: 7.5,
        weightIncrement: 1.25,
        tempo: '2 sec press, 2 sec down',
        notes: 'Primary: Shoulders (anterior/lateral delts)'
      },
      {
        name: 'Chest-Supported Row',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 10,
        weightIncrement: 2.5,
        tempo: '2 sec pull, 2 sec return',
        notes: 'Primary: Back thickness'
      },
      {
        name: 'Incline DB Press',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 7.5,
        weightIncrement: 2.5,
        tempo: '2 sec down, 1 sec up',
        notes: 'Upper chest emphasis'
      },
      {
        name: 'Reverse Fly',
        sets: 2,
        repRange: '12-15',
        rirTarget: '2-3',
        startingWeight: 5,
        weightIncrement: 1.25,
        tempo: 'Controlled, focus on rear delts',
        notes: 'Rear delts, rotator cuff'
      },
      {
        name: 'Band Pull-Aparts',
        sets: 2,
        repRange: '15-20',
        rirTarget: '3',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: '1 sec apart, 2 sec together',
        notes: 'Rotator cuff activation'
      },
      {
        name: 'Dead Bug',
        sets: 3,
        repRange: '10-12/side',
        rirTarget: '2-3',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: 'Controlled alternating',
        notes: 'Core stability, lower back health'
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
        notes: 'Full leg compound'
      },
      {
        name: 'DB Romanian Deadlift',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 10,
        weightIncrement: 2.5,
        tempo: '3 sec down, 2 sec up',
        notes: 'Hamstrings, glutes, lower back'
      },
      {
        name: 'Leg Abduction',
        sets: 3,
        repRange: '12-15',
        rirTarget: '2-3',
        startingWeight: 15,
        weightIncrement: 2.5,
        tempo: '2 sec out, 2 sec in',
        notes: 'Hip abductors (glute medius)'
      },
      {
        name: 'Hip Thrust',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 20,
        weightIncrement: 5,
        tempo: '1 sec up, 2 sec down, 1 sec squeeze',
        notes: 'Primary: Glutes'
      },
      {
        name: 'Seated Calf Raise',
        sets: 3,
        repRange: '15-20',
        rirTarget: '2-3',
        startingWeight: 15,
        weightIncrement: 5,
        tempo: '3-5 sec (slow-twitch focus)',
        notes: 'Soleus (slow-twitch dominant)'
      },
      {
        name: 'Side Plank',
        sets: 3,
        repRange: '30s/side',
        rirTarget: '2-3',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: 'Hold stable',
        notes: 'Obliques, glute medius'
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
