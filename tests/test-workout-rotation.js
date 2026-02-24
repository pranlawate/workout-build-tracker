/**
 * Comprehensive Workout Rotation Logic Testing Suite
 *
 * Tests the workout rotation algorithm:
 * - Next workout suggestion
 * - Rotation sequence tracking
 * - Streak counting
 * - Cycle detection (full 4-workout rotations)
 * - Muscle recovery warnings
 * - State persistence
 *
 * USAGE:
 * 1. Open app in browser
 * 2. Open DevTools Console (F12)
 * 3. Copy-paste this entire file
 * 4. Results displayed with ✅ PASS / ❌ FAIL
 */

(async function testWorkoutRotation() {
  console.log('🔄 COMPREHENSIVE WORKOUT ROTATION LOGIC TEST SUITE\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results = {
    passed: 0,
    failed: 0,
    categories: {},
    tests: []
  };

  function logTest(category, name, passed, details = '') {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${icon} ${status}: ${name}`);
    if (details) console.log(`   ${details}`);

    if (!results.categories[category]) {
      results.categories[category] = { passed: 0, failed: 0 };
    }

    results.tests.push({ category, name, passed, details });
    if (passed) {
      results.passed++;
      results.categories[category].passed++;
    } else {
      results.failed++;
      results.categories[category].failed++;
    }
  }

  // ========================================
  // SECTION 1: Load Modules
  // ========================================
  console.log('\n📦 LOADING MODULES...\n');

  let WorkoutManager, StorageManager;

  try {
    const workoutManagerModule = await import('../js/modules/workout-manager.js');
    const storageModule = await import('../js/modules/storage.js');
    WorkoutManager = workoutManagerModule.WorkoutManager;
    StorageManager = storageModule.StorageManager;
    console.log('✅ Modules loaded successfully\n');
  } catch (e) {
    console.error('❌ FATAL: Failed to load modules', e);
    return;
  }

  // ========================================
  // SECTION 2: Initial State Tests
  // ========================================
  console.log('\n🆕 TESTING INITIAL STATE...\n');

  const category1 = 'Initial State';

  try {
    // Create fresh storage and manager
    const storage = new StorageManager();
    const manager = new WorkoutManager(storage);

    // Test: Fresh rotation returns UPPER_A
    const nextWorkout = manager.getNextWorkout();
    const validInitial = nextWorkout === 'UPPER_A';
    logTest(
      category1,
      'Fresh rotation suggests UPPER_A',
      validInitial,
      `Next: ${nextWorkout}`
    );

    // Test: Initial rotation state
    const rotation = storage.getRotation();
    const hasNextSuggested = rotation.nextSuggested !== undefined;
    logTest(
      category1,
      'Initial rotation has nextSuggested',
      hasNextSuggested,
      `Value: ${rotation.nextSuggested}`
    );

    const initialStreak = rotation.currentStreak === 0;
    logTest(
      category1,
      'Initial streak is 0',
      initialStreak,
      `Streak: ${rotation.currentStreak}`
    );

    const initialCycle = rotation.cycleCount === 0;
    logTest(
      category1,
      'Initial cycle count is 0',
      initialCycle,
      `Cycles: ${rotation.cycleCount}`
    );

  } catch (e) {
    logTest(category1, 'Initial state tests', false, e.message);
  }

  // ========================================
  // SECTION 3: Rotation Sequence Tests
  // ========================================
  console.log('\n🔄 TESTING ROTATION SEQUENCE...\n');

  const category2 = 'Rotation Sequence';
  const EXPECTED_ORDER = ['UPPER_A', 'LOWER_A', 'UPPER_B', 'LOWER_B'];

  try {
    const storage = new StorageManager();
    const manager = new WorkoutManager(storage);

    // Complete full rotation cycle
    for (let i = 0; i < EXPECTED_ORDER.length; i++) {
      const currentWorkout = EXPECTED_ORDER[i];
      const expectedNext = EXPECTED_ORDER[(i + 1) % EXPECTED_ORDER.length];

      // Complete current workout
      manager.completeWorkout(currentWorkout);

      // Check next suggestion
      const actualNext = manager.getNextWorkout();
      const correctNext = actualNext === expectedNext;

      logTest(
        category2,
        `After ${currentWorkout}, suggests ${expectedNext}`,
        correctNext,
        correctNext ? '' : `Got: ${actualNext}`
      );
    }

    // Test: Wraps back to UPPER_A after LOWER_B
    const rotation = storage.getRotation();
    const wrapsCorrectly = rotation.nextSuggested === 'UPPER_A';
    logTest(
      category2,
      'Rotation wraps back to UPPER_A after full cycle',
      wrapsCorrectly,
      `Next: ${rotation.nextSuggested}`
    );

  } catch (e) {
    logTest(category2, 'Rotation sequence tests', false, e.message);
  }

  // ========================================
  // SECTION 4: Streak Tracking Tests
  // ========================================
  console.log('\n🔥 TESTING STREAK TRACKING...\n');

  const category3 = 'Streak Tracking';

  try {
    const storage = new StorageManager();
    const manager = new WorkoutManager(storage);

    // Complete 5 workouts
    for (let i = 0; i < 5; i++) {
      const workoutIndex = i % EXPECTED_ORDER.length;
      manager.completeWorkout(EXPECTED_ORDER[workoutIndex]);

      const rotation = storage.getRotation();
      const expectedStreak = i + 1;
      const correctStreak = rotation.currentStreak === expectedStreak;

      logTest(
        category3,
        `Streak increments correctly (workout ${i + 1})`,
        correctStreak,
        `Streak: ${rotation.currentStreak}, Expected: ${expectedStreak}`
      );
    }

  } catch (e) {
    logTest(category3, 'Streak tracking tests', false, e.message);
  }

  // ========================================
  // SECTION 5: Sequence History Tests
  // ========================================
  console.log('\n📜 TESTING SEQUENCE HISTORY...\n');

  const category4 = 'Sequence History';

  try {
    const storage = new StorageManager();
    const manager = new WorkoutManager(storage);

    // Complete 3 workouts
    const completedWorkouts = ['UPPER_A', 'LOWER_A', 'UPPER_B'];
    completedWorkouts.forEach(workout => manager.completeWorkout(workout));

    const rotation = storage.getRotation();
    const sequence = rotation.sequence || [];

    // Test: Sequence records all workouts
    const correctLength = sequence.length === 3;
    logTest(
      category4,
      'Sequence records correct number of workouts',
      correctLength,
      `Length: ${sequence.length}, Expected: 3`
    );

    // Test: Sequence preserves order
    const correctOrder = JSON.stringify(sequence) === JSON.stringify(completedWorkouts);
    logTest(
      category4,
      'Sequence preserves workout order',
      correctOrder,
      `Sequence: [${sequence.join(', ')}]`
    );

    // Test: Sequence maintains last 12 workouts
    const storage2 = new StorageManager();
    const manager2 = new WorkoutManager(storage2);

    // Complete 15 workouts
    for (let i = 0; i < 15; i++) {
      const workout = EXPECTED_ORDER[i % EXPECTED_ORDER.length];
      manager2.completeWorkout(workout);
    }

    const rotation2 = storage2.getRotation();
    const maxLength = rotation2.sequence.length <= 12;
    logTest(
      category4,
      'Sequence limits to last 12 workouts',
      maxLength,
      `Length: ${rotation2.sequence.length}, Max: 12`
    );

  } catch (e) {
    logTest(category4, 'Sequence history tests', false, e.message);
  }

  // ========================================
  // SECTION 6: Cycle Detection Tests
  // ========================================
  console.log('\n🔁 TESTING CYCLE DETECTION...\n');

  const category5 = 'Cycle Detection';

  try {
    const storage = new StorageManager();
    const manager = new WorkoutManager(storage);

    // Complete partial rotation (3 workouts)
    manager.completeWorkout('UPPER_A');
    manager.completeWorkout('LOWER_A');
    manager.completeWorkout('UPPER_B');

    const rotation1 = storage.getRotation();
    const noCycleYet = rotation1.cycleCount === 0;
    logTest(
      category5,
      'No cycle detected before completing all 4 workouts',
      noCycleYet,
      `Cycles: ${rotation1.cycleCount}, Sequence: [${rotation1.sequence.join(', ')}]`
    );

    // Complete 4th workout (full cycle)
    manager.completeWorkout('LOWER_B');

    const rotation2 = storage.getRotation();
    const cycleDetected = rotation2.cycleCount === 1;
    logTest(
      category5,
      'Cycle detected after completing all 4 workouts',
      cycleDetected,
      `Cycles: ${rotation2.cycleCount}, Sequence: [${rotation2.sequence.join(', ')}]`
    );

    // Complete another full cycle
    EXPECTED_ORDER.forEach(workout => manager.completeWorkout(workout));

    const rotation3 = storage.getRotation();
    const secondCycle = rotation3.cycleCount === 2;
    logTest(
      category5,
      'Cycle count increments for second full rotation',
      secondCycle,
      `Cycles: ${rotation3.cycleCount}`
    );

  } catch (e) {
    logTest(category5, 'Cycle detection tests', false, e.message);
  }

  // ========================================
  // SECTION 7: Muscle Recovery Tests
  // ========================================
  console.log('\n💪 TESTING MUSCLE RECOVERY WARNINGS...\n');

  const category6 = 'Muscle Recovery';

  try {
    const storage = new StorageManager();
    const manager = new WorkoutManager(storage);

    // Complete UPPER_A
    manager.completeWorkout('UPPER_A');

    // Test: Immediate UPPER_B triggers warning (same muscles)
    const currentTime = new Date();
    const recovery1 = manager.checkMuscleRecovery('UPPER_B', currentTime);
    const warnsUpper = recovery1.warn === true;
    logTest(
      category6,
      'Warns when doing UPPER_B immediately after UPPER_A',
      warnsUpper,
      `Warning: ${recovery1.warn}, Muscles: ${recovery1.muscles.map(m => m.name).join(', ')}`
    );

    // Test: LOWER_A does NOT trigger warning (different muscles)
    const recovery2 = manager.checkMuscleRecovery('LOWER_A', currentTime);
    const noWarnLower = recovery2.warn === false;
    logTest(
      category6,
      'No warning for LOWER_A after UPPER_A (different muscles)',
      noWarnLower,
      `Warning: ${recovery2.warn}`
    );

    // Test: Recovery after 48+ hours
    const futureTime = new Date(currentTime.getTime() + 49 * 60 * 60 * 1000); // 49 hours
    const recovery3 = manager.checkMuscleRecovery('UPPER_B', futureTime);
    const recoveredAfter48h = recovery3.warn === false;
    logTest(
      category6,
      'No warning after 48+ hours recovery',
      recoveredAfter48h,
      `Warning: ${recovery3.warn}, Hours elapsed: 49`
    );

    // Test: Still warns at 47 hours (under 48h threshold)
    const almostRecovered = new Date(currentTime.getTime() + 47 * 60 * 60 * 1000);
    const recovery4 = manager.checkMuscleRecovery('UPPER_B', almostRecovered);
    const stillWarns = recovery4.warn === true;
    logTest(
      category6,
      'Still warns at 47 hours (under 48h threshold)',
      stillWarns,
      `Warning: ${recovery4.warn}, Hours remaining: ${recovery4.muscles[0]?.hoursNeeded || 'N/A'}`
    );

  } catch (e) {
    logTest(category6, 'Muscle recovery tests', false, e.message);
  }

  // ========================================
  // SECTION 8: State Persistence Tests
  // ========================================
  console.log('\n💾 TESTING STATE PERSISTENCE...\n');

  const category7 = 'State Persistence';

  try {
    const storage1 = new StorageManager();
    const manager1 = new WorkoutManager(storage1);

    // Complete 2 workouts
    manager1.completeWorkout('UPPER_A');
    manager1.completeWorkout('LOWER_A');

    const rotation1 = storage1.getRotation();
    const savedState = {
      nextSuggested: rotation1.nextSuggested,
      currentStreak: rotation1.currentStreak,
      lastWorkout: rotation1.lastWorkout,
      sequenceLength: rotation1.sequence?.length || 0
    };

    // Create new manager instance (simulates page reload)
    const storage2 = new StorageManager();
    const manager2 = new WorkoutManager(storage2);

    const rotation2 = storage2.getRotation();
    const restoredState = {
      nextSuggested: rotation2.nextSuggested,
      currentStreak: rotation2.currentStreak,
      lastWorkout: rotation2.lastWorkout,
      sequenceLength: rotation2.sequence?.length || 0
    };

    // Test: State persists across instances
    const stateMatches = JSON.stringify(savedState) === JSON.stringify(restoredState);
    logTest(
      category7,
      'State persists across manager instances',
      stateMatches,
      `Saved: ${JSON.stringify(savedState)}, Restored: ${JSON.stringify(restoredState)}`
    );

    // Test: Next workout suggestion persists
    const nextPersists = manager2.getNextWorkout() === 'UPPER_B';
    logTest(
      category7,
      'Next workout suggestion persists',
      nextPersists,
      `Next: ${manager2.getNextWorkout()}, Expected: UPPER_B`
    );

  } catch (e) {
    logTest(category7, 'State persistence tests', false, e.message);
  }

  // ========================================
  // SECTION 9: Summary
  // ========================================
  // Suppress detailed summary when running under test orchestration
  if (!window._TEST_ORCHESTRATED) {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('\n📊 TEST SUMMARY\n');
    console.log('═══════════════════════════════════════════════════════════════\n');
    Object.keys(results.categories).forEach(category => {
      const cat = results.categories[category];
      const total = cat.passed + cat.failed;
      const percentage = ((cat.passed / total) * 100).toFixed(1);
      const icon = cat.failed === 0 ? '✅' : '⚠️';
      console.log(`${icon} ${category}: ${cat.passed}/${total} passed (${percentage}%)`);
    });
    const totalTests = results.passed + results.failed;
    const totalPercentage = ((results.passed / totalTests) * 100).toFixed(1);
    console.log('\n───────────────────────────────────────────────────────────────');
    console.log(`\n🎯 OVERALL: ${results.passed}/${totalTests} tests passed (${totalPercentage}%)\n`);
    console.log('═══════════════════════════════════════════════════════════════\n');
    if (results.failed === 0) {
      console.log('✨ ALL TESTS PASSED! Workout rotation logic is working correctly.\n');
    } else {
      console.log(`⚠️ ${results.failed} tests failed. Review failures above.\n`);
    }
  } // End orchestration check

  // Export results
  window._workoutRotationTestResults = results;
  if (!window._TEST_ORCHESTRATED) {
      console.log('💡 Results available at: window._workoutRotationTestResults\n');
    }
    })();
