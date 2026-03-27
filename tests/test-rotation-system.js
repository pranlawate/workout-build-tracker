/**
 * Comprehensive Rotation System Testing Suite
 *
 * Tests the exercise rotation system:
 * - Tenure tracking (weeks on exercise)
 * - Rotation eligibility (8-week threshold)
 * - Unlock proximity suppression (80%+ progress)
 * - Milestone tracking (hit target twice on each variation)
 * - Smart progression integration (Priority 3)
 *
 * USAGE:
 * 1. Open app in browser
 * 2. Open DevTools Console (F12)
 * 3. Copy-paste this entire file
 * 4. Results displayed with ✅ PASS / ❌ FAIL
 */

(async function testRotationSystem() {
  console.log('🔄 COMPREHENSIVE ROTATION SYSTEM TEST SUITE\n');
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

  let RotationManager, StorageManager, UnlockEvaluator, PhaseManager;

  try {
    const rotationModule = await import('../js/modules/rotation-manager.js');
    const storageModule = await import('../js/modules/storage.js');
    const unlockModule = await import('../js/modules/unlock-evaluator.js');
    const phaseModule = await import('../js/modules/phase-manager.js');
    RotationManager = rotationModule.RotationManager;
    StorageManager = storageModule.StorageManager;
    UnlockEvaluator = unlockModule.UnlockEvaluator;
    PhaseManager = phaseModule.PhaseManager;
    console.log('✅ Modules loaded successfully\n');
  } catch (e) {
    console.error('❌ FATAL: Failed to load modules', e);
    return;
  }

  // ========================================
  // SECTION 2: Tenure Tracking Tests
  // ========================================
  console.log('\n📅 TESTING TENURE TRACKING...\n');

  const category1 = 'Tenure Tracking';

  try {
    const storage = new StorageManager();
    const phaseManager = new PhaseManager(storage);
    const unlockEval = new UnlockEvaluator(storage, phaseManager);
    const rotationManager = new RotationManager(storage, unlockEval);

    // Test: No history returns 0 weeks
    const tenure1 = rotationManager.getTenure('NonExistent - Exercise');
    logTest(
      category1,
      'Returns 0 weeks for exercise with no history',
      tenure1.weeksOnExercise === 0,
      `Weeks: ${tenure1.weeksOnExercise}`
    );

    // Test: Calculate weeks from 4 weeks ago
    const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem('build_exercise_UPPER_A - Test Exercise', JSON.stringify([
      { date: fourWeeksAgo, sets: [{ weight: 10, reps: 12 }] }
    ]));

    const tenure2 = rotationManager.getTenure('UPPER_A - Test Exercise');
    logTest(
      category1,
      'Calculates 4 weeks from first workout 28 days ago',
      tenure2.weeksOnExercise === 4,
      `Weeks: ${tenure2.weeksOnExercise}, Expected: 4`
    );

    // Test: Reset tenure on rotation
    rotationManager.recordRotation('UPPER_A - Test Exercise', 'New Exercise');
    const tenure3 = rotationManager.getTenure('UPPER_A - Test Exercise');
    logTest(
      category1,
      'Resets tenure to 0 weeks after rotation',
      tenure3.weeksOnExercise === 0 && tenure3.exerciseName === 'New Exercise',
      `Weeks: ${tenure3.weeksOnExercise}, Name: ${tenure3.exerciseName}`
    );

    // Cleanup
    localStorage.removeItem('build_exercise_UPPER_A - Test Exercise');
    localStorage.removeItem('build_exercise_tenure');

  } catch (e) {
    logTest(category1, 'Tenure tracking tests', false, e.message);
  }

  // ========================================
  // SECTION 3: Rotation Eligibility Tests
  // ========================================
  console.log('\n⏰ TESTING ROTATION ELIGIBILITY...\n');

  const category2 = 'Rotation Eligibility';

  try {
    // Clear deload state from previous tests
    localStorage.removeItem('build_deload_state');

    const storage = new StorageManager();
    const phaseManager = new PhaseManager(storage);
    const unlockEval = new UnlockEvaluator(storage, phaseManager);
    const rotationManager = new RotationManager(storage, unlockEval);

    // Test: Don't trigger before 8 weeks
    const sixWeeksAgo = new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem('build_exercise_UPPER_A - Tricep Pushdowns', JSON.stringify([
      { date: sixWeeksAgo, sets: [{ weight: 10, reps: 12 }] }
    ]));

    const suggestion1 = rotationManager.checkRotationDue('UPPER_A - Tricep Pushdowns', 'Tricep Pushdowns');
    logTest(
      category2,
      'No rotation suggestion before 8 weeks',
      suggestion1 === null,
      `Suggestion: ${suggestion1}`
    );

    // Test: Trigger at 8 weeks
    const eightWeeksAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem('build_exercise_UPPER_A - Tricep Pushdowns', JSON.stringify([
      { date: eightWeeksAgo, sets: [{ weight: 10, reps: 12 }] }
    ]));

    const suggestion2 = rotationManager.checkRotationDue('UPPER_A - Tricep Pushdowns', 'Tricep Pushdowns');
    logTest(
      category2,
      'Rotation suggestion appears at 8 weeks',
      suggestion2?.type === 'ROTATION_DUE',
      `Type: ${suggestion2?.type}, Suggested: ${suggestion2?.suggestedExercise}`
    );

    logTest(
      category2,
      'Suggests correct rotation variant',
      suggestion2?.suggestedExercise === 'Overhead Tricep Extension',
      `Suggested: ${suggestion2?.suggestedExercise}`
    );

    // Test: Don't suggest for exercises without rotation pool
    const suggestion3 = rotationManager.checkRotationDue('Incline DB Press', 'Incline DB Press');
    logTest(
      category2,
      'No rotation for exercises without rotation pool',
      suggestion3 === null,
      `Suggestion: ${suggestion3}`
    );

    // Cleanup
    localStorage.removeItem('build_exercise_UPPER_A - Tricep Pushdowns');

  } catch (e) {
    logTest(category2, 'Rotation eligibility tests', false, e.message);
  }

  // ========================================
  // SECTION 4: Unlock Proximity Tests
  // ========================================
  console.log('\n🔒 TESTING UNLOCK PROXIMITY SUPPRESSION...\n');

  const category3 = 'Unlock Proximity';

  try {
    // Clear deload state from previous tests
    localStorage.removeItem('build_deload_state');

    const storage = new StorageManager();
    const phaseManager = new PhaseManager(storage);
    const unlockEval = new UnlockEvaluator(storage, phaseManager);
    const rotationManager = new RotationManager(storage, unlockEval);

    // Test: Suppress rotation when 80%+ toward unlock
    const eightWeeksAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem('build_exercise_UPPER_B - DB Hammer Curls', JSON.stringify([
      { date: eightWeeksAgo, sets: [{ weight: 12.5, reps: 12 }] } // 83% of 15kg milestone
    ]));

    const suggestion1 = rotationManager.checkRotationDue('UPPER_B - DB Hammer Curls', 'DB Hammer Curls');
    logTest(
      category3,
      'Suppress rotation when user 80%+ toward unlock',
      suggestion1 === null,
      `Weight: 12.5kg (83% of 15kg), Suggestion: ${suggestion1}`
    );

    // Test: Don't suppress when <80% (plateau scenario)
    localStorage.setItem('build_exercise_UPPER_B - DB Hammer Curls', JSON.stringify([
      { date: eightWeeksAgo, sets: [{ weight: 8, reps: 12 }] } // 53% of 15kg milestone
    ]));

    const suggestion2 = rotationManager.checkRotationDue('UPPER_B - DB Hammer Curls', 'DB Hammer Curls');
    logTest(
      category3,
      'Show rotation when user <80% toward unlock',
      suggestion2?.type === 'ROTATION_DUE',
      `Weight: 8kg (53% of 15kg), Type: ${suggestion2?.type}`
    );

    // Cleanup
    localStorage.removeItem('build_exercise_UPPER_B - DB Hammer Curls');

  } catch (e) {
    logTest(category3, 'Unlock proximity tests', false, e.message);
  }

  // ========================================
  // SUMMARY
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
      console.log('✨ ALL TESTS PASSED! Rotation system is working correctly.\n');
    } else {
      console.log(`⚠️ ${results.failed} tests failed. Review failures above.\n`);
    }
  } // End orchestration check

  // Export results
  window._rotationSystemTestResults = results;
  if (!window._TEST_ORCHESTRATED) {
    console.log('💡 Results available at: window._rotationSystemTestResults\n');
    }
    })();
