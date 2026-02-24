/**
 * Exercise Video Library
 *
 * Metadata-driven video organization with filtering and search.
 * Videos stored in /videos/{category}/{filename}.mp4
 *
 * @module exercise-videos
 */

/**
 * Video metadata for all exercises
 * Key = exercise name (matches workouts.js)
 * Value = { filename, category, muscleGroup, equipment, movementType, duration, fileSize }
 */
export const EXERCISE_VIDEOS = {
  // UPPER_A Exercises
  'DB Flat Bench Press': {
    filename: 'db-flat-bench-press.mp4',
    category: 'exercises',
    muscleGroup: 'chest',
    equipment: 'dumbbell',
    movementType: 'horizontal_press',
    duration: '0:45',
    fileSize: '9MB'
  },
  'Decline DB Press': {
    filename: 'decline-db-press.mp4',
    category: 'exercises',
    muscleGroup: 'chest',
    equipment: 'dumbbell',
    movementType: 'horizontal_press',
    duration: '0:40',
    fileSize: '8MB'
  },
  'Seated Cable Row': {
    filename: 'seated-cable-row.mp4',
    category: 'exercises',
    muscleGroup: 'back',
    equipment: 'cable',
    movementType: 'horizontal_pull',
    duration: '0:38',
    fileSize: '14MB'
  },
  'Cable Chest Fly': {
    filename: 'cable-chest-fly.mp4',
    category: 'exercises',
    muscleGroup: 'chest',
    equipment: 'cable',
    movementType: 'fly',
    duration: '0:35',
    fileSize: '9MB'
  },
  'T-Bar Row': {
    filename: 't-bar-row.mp4',
    category: 'exercises',
    muscleGroup: 'back',
    equipment: 'barbell',
    movementType: 'horizontal_pull',
    duration: '0:42',
    fileSize: '7MB'
  },
  'DB Lateral Raises': {
    filename: 'db-lateral-raises.mp4',
    category: 'exercises',
    muscleGroup: 'shoulders',
    equipment: 'dumbbell',
    movementType: 'lateral_raise',
    duration: '0:30',
    fileSize: '6MB'
  },
  'Face Pulls': {
    filename: 'face-pulls.mp4',
    category: 'exercises',
    muscleGroup: 'shoulders',
    equipment: 'cable',
    movementType: 'horizontal_pull',
    duration: '0:32',
    fileSize: '7MB'
  },
  'Band Pull-Aparts': {
    filename: 'band-pull-aparts.mp4',
    category: 'exercises',
    muscleGroup: 'shoulders',
    equipment: 'band',
    movementType: 'horizontal_pull',
    duration: '0:28',
    fileSize: '5MB'
  },
  'Tricep Pushdowns': {
    filename: 'tricep-pushdowns.mp4',
    category: 'exercises',
    muscleGroup: 'arms',
    equipment: 'cable',
    movementType: 'extension',
    duration: '0:30',
    fileSize: '6MB'
  },
  'Overhead Tricep Extension': {
    filename: 'overhead-tricep-extension.mp4',
    category: 'exercises',
    muscleGroup: 'arms',
    equipment: 'dumbbell',
    movementType: 'extension',
    duration: '0:35',
    fileSize: '7MB'
  },

  // LOWER_A Exercises
  'Hack Squat': {
    filename: 'hack-squat.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'machine',
    movementType: 'squat',
    duration: '0:45',
    fileSize: '10MB'
  },
  'Leg Curl': {
    filename: 'leg-curl.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'machine',
    movementType: 'curl',
    duration: '0:35',
    fileSize: '8MB'
  },
  'Leg Extension': {
    filename: 'leg-extension.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'machine',
    movementType: 'extension',
    duration: '0:35',
    fileSize: '8MB'
  },
  '45° Hyperextension': {
    filename: '45-hyperextension.mp4',
    category: 'exercises',
    muscleGroup: 'back',
    equipment: 'bodyweight',
    movementType: 'extension',
    duration: '0:40',
    fileSize: '7MB'
  },
  'Standing Calf Raise': {
    filename: 'standing-calf-raise.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'machine',
    movementType: 'raise',
    duration: '0:30',
    fileSize: '6MB'
  },
  'Plank': {
    filename: 'plank.mp4',
    category: 'exercises',
    muscleGroup: 'core',
    equipment: 'bodyweight',
    movementType: 'isometric',
    duration: '0:30',
    fileSize: '5MB'
  },
  'Leg Press': {
    filename: 'leg-press.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'machine',
    movementType: 'press',
    duration: '0:40',
    fileSize: '9MB'
  },
  'Leg Adduction': {
    filename: 'leg-adduction.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'machine',
    movementType: 'adduction',
    duration: '0:35',
    fileSize: '7MB'
  },

  // UPPER_B Exercises
  'Lat Pulldown': {
    filename: 'lat-pulldown.mp4',
    category: 'exercises',
    muscleGroup: 'back',
    equipment: 'cable',
    movementType: 'vertical_pull',
    duration: '0:42',
    fileSize: '13MB'
  },
  'DB Shoulder Press': {
    filename: 'db-shoulder-press.mp4',
    category: 'exercises',
    muscleGroup: 'shoulders',
    equipment: 'dumbbell',
    movementType: 'vertical_press',
    duration: '0:40',
    fileSize: '9MB'
  },
  'Chest-Supported Row': {
    filename: 'chest-supported-row.mp4',
    category: 'exercises',
    muscleGroup: 'back',
    equipment: 'dumbbell',
    movementType: 'horizontal_pull',
    duration: '0:38',
    fileSize: '5MB'
  },
  'Incline DB Press': {
    filename: 'incline-db-press.mp4',
    category: 'exercises',
    muscleGroup: 'chest',
    equipment: 'dumbbell',
    movementType: 'incline_press',
    duration: '0:42',
    fileSize: '6MB'
  },
  'Reverse Fly': {
    filename: 'reverse-fly.mp4',
    category: 'exercises',
    muscleGroup: 'shoulders',
    equipment: 'dumbbell',
    movementType: 'fly',
    duration: '0:35',
    fileSize: '7MB'
  },
  'Dead Bug': {
    filename: 'dead-bug.mp4',
    category: 'exercises',
    muscleGroup: 'core',
    equipment: 'bodyweight',
    movementType: 'anti_rotation',
    duration: '0:35',
    fileSize: '7MB'
  },
  'Standard DB Curls': {
    filename: 'standard-db-curls.mp4',
    category: 'exercises',
    muscleGroup: 'arms',
    equipment: 'dumbbell',
    movementType: 'curl',
    duration: '0:35',
    fileSize: '6MB'
  },
  'DB Hammer Curls': {
    filename: 'db-hammer-curls.mp4',
    category: 'exercises',
    muscleGroup: 'arms',
    equipment: 'dumbbell',
    movementType: 'curl',
    duration: '0:35',
    fileSize: '6MB'
  },

  // LOWER_B Exercises
  'DB Goblet Squat': {
    filename: 'db-goblet-squat.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'dumbbell',
    movementType: 'squat',
    duration: '0:40',
    fileSize: '8MB'
  },
  'DB Romanian Deadlift': {
    filename: 'db-romanian-deadlift.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'dumbbell',
    movementType: 'hinge',
    duration: '0:45',
    fileSize: '11MB'
  },
  'Leg Abduction': {
    filename: 'leg-abduction.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'machine',
    movementType: 'abduction',
    duration: '0:35',
    fileSize: '7MB'
  },
  'Hip Thrust': {
    filename: 'hip-thrust.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'dumbbell',
    movementType: 'thrust',
    duration: '0:40',
    fileSize: '7MB'
  },
  'Seated Calf Raise': {
    filename: 'seated-calf-raise.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'machine',
    movementType: 'raise',
    duration: '0:30',
    fileSize: '6MB'
  },
  'Side Plank': {
    filename: 'side-plank.mp4',
    category: 'exercises',
    muscleGroup: 'core',
    equipment: 'bodyweight',
    movementType: 'isometric',
    duration: '0:35',
    fileSize: '5MB'
  },

  // Barbell Progressions (Future Unlocks)
  'Barbell Bench Press': {
    filename: 'barbell-bench-press.mp4',
    category: 'exercises',
    muscleGroup: 'chest',
    equipment: 'barbell',
    movementType: 'horizontal_press',
    duration: '0:50',
    fileSize: '20MB'
  },
  'Barbell Back Squat': {
    filename: 'barbell-back-squat.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'barbell',
    movementType: 'squat',
    duration: '0:55',
    fileSize: '18MB'
  },
  'Barbell Deadlift': {
    filename: 'barbell-deadlift.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'barbell',
    movementType: 'hinge',
    duration: '0:50',
    fileSize: '16MB'
  },
  'Barbell Overhead Press': {
    filename: 'barbell-overhead-press.mp4',
    category: 'exercises',
    muscleGroup: 'shoulders',
    equipment: 'barbell',
    movementType: 'vertical_press',
    duration: '0:45',
    fileSize: '15MB'
  },

  // Alternate Exercises
  'Bulgarian Split Squat': {
    filename: 'bulgarian-split-squat.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'dumbbell',
    movementType: 'lunge',
    duration: '0:45',
    fileSize: '10MB'
  },

  // Kettlebell Progressions
  'KB Goblet Squat': {
    filename: 'kb-goblet-squat.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'kettlebell',
    movementType: 'squat',
    duration: '0:40',
    fileSize: '8MB'
  },
  'KB Swings': {
    filename: 'kb-swings.mp4',
    category: 'exercises',
    muscleGroup: 'legs',
    equipment: 'kettlebell',
    movementType: 'swing',
    duration: '0:45',
    fileSize: '9MB'
  },

  // Warmup Exercises
  'Wrist Circles': {
    filename: 'wrist-circles.mp4',
    category: 'warmups',
    muscleGroup: 'forearms',
    equipment: 'bodyweight',
    movementType: 'mobility',
    duration: '0:20',
    fileSize: '3MB'
  },
  'Arm Circles': {
    filename: 'arm-circles.mp4',
    category: 'warmups',
    muscleGroup: 'shoulders',
    equipment: 'bodyweight',
    movementType: 'mobility',
    duration: '0:25',
    fileSize: '4MB'
  },
  'Band Over-and-Backs': {
    filename: 'band-over-and-backs.mp4',
    category: 'warmups',
    muscleGroup: 'shoulders',
    equipment: 'band',
    movementType: 'mobility',
    duration: '0:25',
    fileSize: '5MB'
  },
  'Band External Rotation': {
    filename: 'band-external-rotation.mp4',
    category: 'warmups',
    muscleGroup: 'shoulders',
    equipment: 'band',
    movementType: 'mobility',
    duration: '0:30',
    fileSize: '5MB'
  },
  'DB Shoulder Extensions': {
    filename: 'db-shoulder-extensions.mp4',
    category: 'warmups',
    muscleGroup: 'shoulders',
    equipment: 'dumbbell',
    movementType: 'mobility',
    duration: '0:30',
    fileSize: '6MB'
  },
  'Light Cycling': {
    filename: 'light-cycling.mp4',
    category: 'warmups',
    muscleGroup: 'legs',
    equipment: 'machine',
    movementType: 'cardio',
    duration: '0:40',
    fileSize: '8MB'
  },
  'Forward & Back Leg Swings': {
    filename: 'leg-swings-forward.mp4',
    category: 'warmups',
    muscleGroup: 'legs',
    equipment: 'bodyweight',
    movementType: 'mobility',
    duration: '0:30',
    fileSize: '7MB'
  },
  'Side-to-Side Leg Swings': {
    filename: 'leg-swings-side.mp4',
    category: 'warmups',
    muscleGroup: 'legs',
    equipment: 'bodyweight',
    movementType: 'mobility',
    duration: '0:30',
    fileSize: '7MB'
  },
  'Spiderman Lunge w/ Thoracic Extension': {
    filename: 'spiderman-lunge.mp4',
    category: 'warmups',
    muscleGroup: 'legs',
    equipment: 'bodyweight',
    movementType: 'mobility',
    duration: '0:35',
    fileSize: '8MB'
  },
  'Wall Ankle Mobilization': {
    filename: 'wall-ankle-mobilization.mp4',
    category: 'warmups',
    muscleGroup: 'legs',
    equipment: 'bodyweight',
    movementType: 'mobility',
    duration: '0:30',
    fileSize: '6MB'
  }
};

/**
 * Get video metadata by exercise name
 *
 * @param {string} exerciseName - Exercise name (matches workouts.js)
 * @returns {Object|null} Video metadata or null if not found
 */
export function getVideoByExercise(exerciseName) {
  const video = EXERCISE_VIDEOS[exerciseName];

  if (!video) {
    console.warn(`[ExerciseVideos] No video metadata for: ${exerciseName}`);
    return null;
  }

  return video;
}

/**
 * Get video file path
 *
 * @param {string} exerciseName - Exercise name
 * @returns {string|null} Video path or null if not found
 */
export function getVideoPath(exerciseName) {
  const video = getVideoByExercise(exerciseName);
  if (!video) return null;

  return `/videos/${video.category}/${video.filename}`;
}

/**
 * Get all exercise names that have videos
 *
 * @returns {string[]} Array of exercise names
 */
export function getAllExercisesWithVideos() {
  return Object.keys(EXERCISE_VIDEOS);
}

/**
 * Get videos by muscle group
 *
 * @param {string} muscleGroup - Muscle group (chest, back, legs, shoulders, arms, core)
 * @returns {string[]} Array of exercise names
 */
export function getVideosByMuscleGroup(muscleGroup) {
  return Object.entries(EXERCISE_VIDEOS)
    .filter(([_, video]) => video.muscleGroup === muscleGroup)
    .map(([name, _]) => name);
}

/**
 * Get videos by equipment
 *
 * @param {string} equipment - Equipment type (dumbbell, cable, machine, bodyweight, band, etc.)
 * @returns {string[]} Array of exercise names
 */
export function getVideosByEquipment(equipment) {
  return Object.entries(EXERCISE_VIDEOS)
    .filter(([_, video]) => video.equipment === equipment)
    .map(([name, _]) => name);
}

/**
 * Get videos by category
 *
 * @param {string} category - Category (exercises, warmups, stretches)
 * @returns {string[]} Array of exercise names
 */
export function getVideosByCategory(category) {
  return Object.entries(EXERCISE_VIDEOS)
    .filter(([_, video]) => video.category === category)
    .map(([name, _]) => name);
}

/**
 * Search videos by name (fuzzy match)
 *
 * @param {string} query - Search query
 * @returns {string[]} Array of matching exercise names
 */
export function searchVideos(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  return Object.keys(EXERCISE_VIDEOS)
    .filter(name => name.toLowerCase().includes(lowerQuery))
    .sort();
}

/**
 * Get all unique muscle groups
 *
 * @returns {string[]} Array of muscle group names
 */
export function getAllMuscleGroups() {
  const groups = new Set();
  Object.values(EXERCISE_VIDEOS).forEach(video => {
    groups.add(video.muscleGroup);
  });
  return Array.from(groups).sort();
}

/**
 * Get all unique equipment types
 *
 * @returns {string[]} Array of equipment names
 */
export function getAllEquipmentTypes() {
  const equipment = new Set();
  Object.values(EXERCISE_VIDEOS).forEach(video => {
    equipment.add(video.equipment);
  });
  return Array.from(equipment).sort();
}
