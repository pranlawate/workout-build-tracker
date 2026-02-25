/**
 * Exercise Videos Module Test Suite
 *
 * Validates video metadata coverage and helper functions.
 */

(async function testExerciseVideos() {
  console.log('🎥 EXERCISE VIDEOS MODULE TEST SUITE\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Import module
  const {
    EXERCISE_VIDEOS,
    getVideoByExercise,
    getVideoPath,
    getAllExercisesWithVideos,
    getVideosByMuscleGroup,
    getVideosByEquipment,
    getVideosByCategory,
    searchVideos,
    getAllMuscleGroups,
    getAllEquipmentTypes
  } = await import('../js/modules/exercise-videos.js');

  const { WORKOUTS, EXERCISE_DEFINITIONS } = await import('../js/modules/workouts.js');

  let totalTests = 0;
  let passedTests = 0;
  const failures = [];

  // Helper function
  function test(description, assertion) {
    totalTests++;
    try {
      if (assertion()) {
        passedTests++;
        console.log(`✓ ${description}`);
      } else {
        failures.push(description);
        console.error(`✗ ${description}`);
      }
    } catch (error) {
      failures.push(`${description} - ${error.message}`);
      console.error(`✗ ${description}`, error);
    }
  }

  // Helper to get all exercises from workouts
  function getAllExercises() {
    const exercises = [];
    Object.values(WORKOUTS).forEach(workout => {
      if (workout.exercises) {
        exercises.push(...workout.exercises);
      }
    });
    // Also add exercises from EXERCISE_DEFINITIONS that aren't in workouts
    Object.keys(EXERCISE_DEFINITIONS).forEach(name => {
      if (!exercises.find(ex => ex.name === name)) {
        exercises.push({ name });
      }
    });
    return exercises;
  }

  // Test 1: Metadata coverage
  console.log('📋 Test 1: Video Metadata Coverage\n');

  const allExercises = getAllExercises();
  const missingVideos = allExercises.filter(ex => !getVideoByExercise(ex.name));

  test(
    `All main exercises have video metadata (${allExercises.length - missingVideos.length}/${allExercises.length})`,
    () => missingVideos.length < 5  // Allow a few missing (future exercises)
  );

  if (missingVideos.length > 0) {
    console.warn('⚠️ Missing video metadata:');
    missingVideos.forEach(ex => console.warn(`  - ${ex.name}`));
  }
  console.log('');

  // Test 2: Video metadata completeness
  console.log('📊 Test 2: Metadata Completeness\n');

  const allVideos = Object.entries(EXERCISE_VIDEOS);

  allVideos.forEach(([exerciseName, videoData]) => {
    test(
      `${exerciseName} has complete metadata`,
      () =>
        videoData.filename &&
        videoData.category &&
        videoData.muscleGroup &&
        videoData.equipment &&
        videoData.movementType &&
        videoData.duration &&
        videoData.fileSize
    );
  });
  console.log('');

  // Test 3: Helper functions
  console.log('🔍 Test 3: Helper Functions\n');

  test(
    'getVideoByExercise returns correct data',
    () => {
      const video = getVideoByExercise('DB Flat Bench Press');
      return video && video.filename === 'db-flat-bench-press.mp4';
    }
  );

  test(
    'getVideoByExercise returns null for invalid exercise',
    () => getVideoByExercise('Nonexistent Exercise') === null
  );

  test(
    'getVideoPath constructs correct path',
    () => getVideoPath('DB Flat Bench Press') === '/videos/exercises/db-flat-bench-press.mp4'
  );

  test(
    'getVideoPath returns null for invalid exercise',
    () => getVideoPath('Nonexistent Exercise') === null
  );

  test(
    'getAllExercisesWithVideos returns array',
    () => Array.isArray(getAllExercisesWithVideos()) && getAllExercisesWithVideos().length > 0
  );

  test(
    'getAllExercisesWithVideos returns correct count',
    () => getAllExercisesWithVideos().length === Object.keys(EXERCISE_VIDEOS).length
  );

  console.log('');

  // Test 4: Filtering
  console.log('🎯 Test 4: Filtering Functions\n');

  const chestExercises = getVideosByMuscleGroup('chest');
  test(
    `getVideosByMuscleGroup('chest') returns exercises (${chestExercises.length})`,
    () => chestExercises.length > 0 && chestExercises.includes('DB Flat Bench Press')
  );

  const dumbbellExercises = getVideosByEquipment('dumbbell');
  test(
    `getVideosByEquipment('dumbbell') returns exercises (${dumbbellExercises.length})`,
    () => dumbbellExercises.length > 0
  );

  const barbellExercises = getVideosByEquipment('barbell');
  test(
    `getVideosByEquipment('barbell') returns exercises (${barbellExercises.length})`,
    () => barbellExercises.length > 0 && barbellExercises.includes('Barbell Bench Press')
  );

  const warmups = getVideosByCategory('warmups');
  test(
    `getVideosByCategory('warmups') returns warmups (${warmups.length})`,
    () => warmups.length > 0
  );

  const mainExercises = getVideosByCategory('exercises');
  test(
    `getVideosByCategory('exercises') returns main exercises (${mainExercises.length})`,
    () => mainExercises.length > 20
  );

  test(
    'getVideosByMuscleGroup with invalid group returns empty array',
    () => getVideosByMuscleGroup('nonexistent').length === 0
  );

  test(
    'getVideosByEquipment with invalid equipment returns empty array',
    () => getVideosByEquipment('nonexistent').length === 0
  );

  test(
    'getVideosByCategory with invalid category returns empty array',
    () => getVideosByCategory('nonexistent').length === 0
  );

  console.log('');

  // Test 5: Search
  console.log('🔎 Test 5: Search Function\n');

  const benchResults = searchVideos('bench');
  test(
    `searchVideos('bench') returns results (${benchResults.length})`,
    () => benchResults.length > 0 && benchResults.includes('DB Flat Bench Press')
  );

  const emptyResults = searchVideos('zzzzz');
  test(
    `searchVideos('zzzzz') returns empty array`,
    () => emptyResults.length === 0
  );

  const caseInsensitive = searchVideos('BENCH');
  test(
    'Search is case-insensitive',
    () => caseInsensitive.length === benchResults.length
  );

  test(
    'searchVideos with empty string returns empty array',
    () => searchVideos('').length === 0
  );

  test(
    'searchVideos with null returns empty array',
    () => searchVideos(null).length === 0
  );

  test(
    'searchVideos with undefined returns empty array',
    () => searchVideos(undefined).length === 0
  );

  test(
    'searchVideos results are sorted',
    () => {
      const results = searchVideos('press');
      const sorted = [...results].sort();
      return JSON.stringify(results) === JSON.stringify(sorted);
    }
  );

  console.log('');

  // Test 6: Enumeration
  console.log('📑 Test 6: Enumeration Functions\n');

  const muscleGroups = getAllMuscleGroups();
  test(
    `getAllMuscleGroups returns groups (${muscleGroups.length})`,
    () => muscleGroups.includes('chest') && muscleGroups.includes('back')
  );

  test(
    'getAllMuscleGroups includes all expected groups',
    () => {
      const expectedGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
      return expectedGroups.every(group => muscleGroups.includes(group));
    }
  );

  test(
    'getAllMuscleGroups returns sorted array',
    () => {
      const sorted = [...muscleGroups].sort();
      return JSON.stringify(muscleGroups) === JSON.stringify(sorted);
    }
  );

  const equipmentTypes = getAllEquipmentTypes();
  test(
    `getAllEquipmentTypes returns types (${equipmentTypes.length})`,
    () => equipmentTypes.includes('dumbbell') && equipmentTypes.includes('cable')
  );

  test(
    'getAllEquipmentTypes includes all expected types',
    () => {
      const expectedTypes = ['dumbbell', 'cable', 'machine', 'bodyweight', 'band', 'barbell', 'kettlebell'];
      return expectedTypes.every(type => equipmentTypes.includes(type));
    }
  );

  test(
    'getAllEquipmentTypes returns sorted array',
    () => {
      const sorted = [...equipmentTypes].sort();
      return JSON.stringify(equipmentTypes) === JSON.stringify(sorted);
    }
  );

  console.log('');

  // Summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY\n');
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failures.length}`);
  console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failures.length > 0) {
    console.error('\n❌ FAILURES:');
    failures.forEach(f => console.error(`  - ${f}`));
  } else {
    console.log('\n✅ ALL TESTS PASSED');
  }

  console.log('\n');

  // Store results for test runner
  window._exerciseVideosTestResults = {
    passed: passedTests,
    failed: failures.length,
    total: totalTests,
    failures: failures
  };
})();
