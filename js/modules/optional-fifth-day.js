/**
 * Optional 5th Day: Injury Prevention + GPP
 *
 * Supplemental workout for extra training days.
 * Focus: Core intensive, mobility, injury prevention.
 *
 * @module optional-fifth-day
 */

/**
 * Block 1: Core Intensive (12-15 min)
 */
export const CORE_INTENSIVE_BLOCK = {
  name: 'Core Intensive',
  duration: '12-15 min',
  exercises: [
    { name: 'RKC Plank', sets: 3, reps: '20-30 sec', rest: '45 sec' },
    { name: 'Side Plank', sets: 3, reps: '30 sec each side', rest: '45 sec' },
    { name: 'Dead Bug', sets: 3, reps: '10 reps', rest: '45 sec' },
    { name: 'Pallof Press', sets: 3, reps: '12 each side', rest: '45 sec' },
    { name: 'Bird Dog', sets: 3, reps: '10 each side', rest: '45 sec' }
  ],
  advancedOptions: [
    { name: 'L-Sit Holds', sets: 3, reps: 'max time', note: 'If unlocked' },
    { name: 'Ab Wheel Rollouts', sets: 3, reps: '8-10 reps', note: 'If unlocked' }
  ]
};

/**
 * Block 2: Mobility + Injury Prevention (10-12 min)
 */
export const MOBILITY_BLOCK = {
  name: 'Mobility + Injury Prevention',
  duration: '10-12 min',
  sections: [
    {
      name: 'Rotator Cuff Circuit',
      exercises: [
        { name: 'Band External Rotations', sets: 2, reps: '15 each side' },
        { name: 'YTWLs', sets: 2, reps: '10 each position' },
        { name: 'Face Pull Variations', sets: 2, reps: '15 reps' }
      ]
    },
    {
      name: 'Hip Mobility',
      exercises: [
        { name: '90/90 Hip Stretch', sets: 2, reps: '30 sec each side' },
        { name: 'Cossack Squats', sets: 2, reps: '8 each side' },
        { name: 'Hip Flexor Stretch', sets: 2, reps: '30 sec each side' }
      ]
    },
    {
      name: 'Ankle Mobility',
      exercises: [
        { name: 'Wall Ankle Mobilization', sets: 2, reps: '10 each side' },
        { name: 'Calf Stretch', sets: 2, reps: '30 sec each side' }
      ]
    }
  ]
};

/**
 * Block 3: User Choice (10-15 min)
 */
export const USER_CHOICE_BLOCKS = [
  {
    id: 'cardio-hiit',
    name: 'Cardio HIIT',
    duration: '10-15 min',
    options: [
      { name: 'Jump Rope Intervals', format: '8 rounds × 30 sec on / 30 sec off' },
      { name: 'Hill Sprints', format: '6 × 30 sec' },
      { name: 'Rowing Intervals', format: '10 × 1 min moderate pace' }
    ]
  },
  {
    id: 'mudgal-gada',
    name: 'Mudgal/Gada Flow',
    duration: '10-15 min',
    exercises: [
      { name: '10-to-2 Pendulum Swings', sets: 3, reps: '12 each side' },
      { name: '360° Swings', sets: 3, reps: '8 each side', note: 'When unlocked' },
      { name: 'Gada Flow Sequences', duration: '10 min continuous' }
    ]
  },
  {
    id: 'bodyweight-high-rep',
    name: 'High-Rep Bodyweight',
    duration: '10-15 min',
    exercises: [
      { name: 'Sadharan Dand', sets: 3, reps: '15 reps' },
      { name: 'Sadharan Baithak', sets: 3, reps: '20 reps' },
      { name: 'Surya Namaskar', sets: '5-8 rounds', reps: null }
    ]
  }
];

/**
 * Get fatigue warning based on last workout and upcoming workout
 *
 * @param {string} lastWorkout - Last completed workout
 * @param {string} nextWorkout - Next suggested workout
 * @returns {Object|null} Warning object or null
 */
export function getFatigueWarning(lastWorkout, nextWorkout) {
  // After Lower B, if Upper A is within 48 hours
  if (lastWorkout === 'LOWER_B' && nextWorkout === 'UPPER_A') {
    const hoursUntilNext = 48; // Simplified - would calculate from last workout date
    if (hoursUntilNext < 48) {
      return {
        level: 'warning',
        message: '⚠️ Consider skipping Block 2 (shoulders) and Block 3 (Mudgal) to prevent fatigue',
        recommendSkip: ['mobility', 'user-choice']
      };
    }
    return {
      level: 'info',
      message: '✅ Best day: Tomorrow (2 days until Upper A)',
      recommendSkip: []
    };
  }

  return null;
}

/**
 * Get optional 5th day workout structure
 *
 * @param {string} lastWorkout - Last completed workout
 * @param {string} nextWorkout - Next suggested workout
 * @returns {Object} Complete 5th day workout
 */
export function getOptionalFifthDay(lastWorkout, nextWorkout) {
  return {
    displayName: 'Injury Prevention + Core Day',
    duration: '30-40 minutes',
    blocks: [
      CORE_INTENSIVE_BLOCK,
      MOBILITY_BLOCK,
      USER_CHOICE_BLOCKS
    ],
    cooldown: {
      duration: '3-5 min',
      activities: ['Foam rolling', 'Static stretching', 'Breathing work']
    },
    fatigueWarning: getFatigueWarning(lastWorkout, nextWorkout)
  };
}
