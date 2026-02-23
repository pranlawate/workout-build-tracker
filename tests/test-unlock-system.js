/**
 * Comprehensive Unlock System Testing Suite
 *
 * Tests the exercise unlock evaluation system:
 * - Simple tier exercises (always unlocked)
 * - Strength milestone checking
 * - Mobility requirement checking
 * - Pain-free status checking
 * - Training weeks calculation
 * - Phase-aware prioritization (bodyweight priority in Maintenance)
 * - Exercise type detection
 * - Priority calculation
 *
 * USAGE:
 * 1. Open app in browser
 * 2. Open DevTools Console (F12)
 * 3. Copy-paste this entire file
 * 4. Results displayed with ✅ PASS / ❌ FAIL
 */

(async function testUnlockSystem() {
  console.clear();
  console.log('🔓 COMPREHENSIVE UNLOCK SYSTEM TEST SUITE\n');
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

  let UnlockEvaluator, StorageManager, PhaseManager, COMPLEXITY_TIERS;

  try {
    const unlockModule = await import('../js/modules/unlock-evaluator.js');
    const storageModule = await import('../js/modules/storage.js');
    const phaseModule = await import('../js/modules/phase-manager.js');
    const tiersModule = await import('../js/modules/complexity-tiers.js');
    UnlockEvaluator = unlockModule.UnlockEvaluator;
    StorageManager = storageModule.StorageManager;
    PhaseManager = phaseModule.PhaseManager;
    COMPLEXITY_TIERS = tiersModule.COMPLEXITY_TIERS;
    console.log('✅ Modules loaded successfully\n');
  } catch (e) {
    console.error('❌ FATAL: Failed to load modules', e);
    return;
  }

  // ========================================
  // SECTION 2: Simple Tier Tests
  // ========================================
  console.log('\n⚪ TESTING SIMPLE TIER EXERCISES...\n');

  const category1 = 'Simple Tier';

  try {
    const storage = new StorageManager();
    const phaseManager = new PhaseManager(storage);
    const evaluator = new UnlockEvaluator(storage, phaseManager);

    // Test: Simple tier always unlocked
    const result1 = evaluator.evaluateUnlock('DB Flat Bench Press', null);
    logTest(
      category1,
      'Simple tier exercise is always unlocked',
      result1.unlocked === true,
      `Exercise: DB Flat Bench Press, Unlocked: ${result1.unlocked}`
    );

    logTest(
      category1,
      'Simple tier has no missing criteria',
      result1.missing.length === 0,
      `Missing: [${result1.missing.join(', ')}]`
    );

    logTest(
      category1,
      'Simple tier meets all criteria',
      result1.criteria.strength && result1.criteria.mobility && result1.criteria.painFree,
      `Criteria: ${JSON.stringify(result1.criteria)}`
    );

  } catch (e) {
    logTest(category1, 'Simple tier tests', false, e.message);
  }

  // ========================================
  // SECTION 3: Training Weeks Calculation
  // ========================================
  console.log('\n📅 TESTING TRAINING WEEKS CALCULATION...\n');

  const category2 = 'Training Weeks';

  try {
    const storage = new StorageManager();
    const phaseManager = new PhaseManager(storage);
    const evaluator = new UnlockEvaluator(storage, phaseManager);

    // Test: No history returns 0 weeks
    const weeks1 = evaluator._calculateTrainingWeeks('NonExistent Exercise');
    logTest(
      category2,
      'Returns 0 weeks for exercise with no history',
      weeks1 === 0,
      `Weeks: ${weeks1}`
    );

    // Test: Calculate weeks from first workout
    const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
    const mockHistory = [
      { date: fourWeeksAgo.toISOString(), sets: [] }
    ];

    // Save mock history
    localStorage.setItem('build_exercise_TestExercise', JSON.stringify(mockHistory));

    const weeks2 = evaluator._calculateTrainingWeeks('TestExercise');
    logTest(
      category2,
      'Calculates 4 weeks from first workout 28 days ago',
      weeks2 === 4,
      `Weeks: ${weeks2}, Expected: 4`
    );

    // Cleanup
    localStorage.removeItem('build_exercise_TestExercise');

  } catch (e) {
    logTest(category2, 'Training weeks tests', false, e.message);
  }

  // ========================================
  // SECTION 4: Phase-Aware Prioritization
  // ========================================
  console.log('\n🎯 TESTING PHASE-AWARE PRIORITIZATION...\n');

  const category3 = 'Phase-Aware Prioritization';

  try {
    // Test Building Phase (all exercises equal priority)
    const storage1 = new StorageManager();
    localStorage.setItem('build_phase', 'building');
    const phaseManager1 = new PhaseManager(storage1);
    const evaluator1 = new UnlockEvaluator(storage1, phaseManager1);

    const result1 = evaluator1.evaluateUnlockWithPhasePriority('Barbell Bench Press', 'DB Flat Bench Press');
    logTest(
      category3,
      'Building phase: All exercises have priority 1',
      result1.priority === 1,
      `Priority: ${result1.priority}`
    );

    logTest(
      category3,
      'Building phase: All exercises are phase-recommended',
      result1.phaseRecommended === true,
      `Recommended: ${result1.phaseRecommended}`
    );

    // Test Maintenance Phase (bodyweight priority)
    const storage2 = new StorageManager();
    localStorage.setItem('build_phase', 'maintenance');
    const phaseManager2 = new PhaseManager(storage2);
    const evaluator2 = new UnlockEvaluator(storage2, phaseManager2);

    const result2 = evaluator2.evaluateUnlockWithPhasePriority('Pull-ups', 'Lat Pulldown');
    logTest(
      category3,
      'Maintenance phase: Bodyweight exercise has priority 1',
      result2.priority === 1,
      `Exercise: Pull-ups, Priority: ${result2.priority}`
    );

    logTest(
      category3,
      'Maintenance phase: Bodyweight exercise is phase-recommended',
      result2.phaseRecommended === true,
      `Recommended: ${result2.phaseRecommended}`
    );

    const result3 = evaluator2.evaluateUnlockWithPhasePriority('Barbell Bench Press', 'DB Flat Bench Press');
    logTest(
      category3,
      'Maintenance phase: Barbell exercise has priority 2 (lower)',
      result3.priority === 2,
      `Exercise: Barbell Bench Press, Priority: ${result3.priority}`
    );

    logTest(
      category3,
      'Maintenance phase: Barbell exercise is NOT phase-recommended',
      result3.phaseRecommended === false,
      `Recommended: ${result3.phaseRecommended}`
    );

  } catch (e) {
    logTest(category3, 'Phase-aware prioritization tests', false, e.message);
  }

  // ========================================
  // SECTION 5: Exercise Type Detection
  // ========================================
  console.log('\n🏷️ TESTING EXERCISE TYPE DETECTION...\n');

  const category4 = 'Exercise Type Detection';

  try {
    const storage = new StorageManager();
    const phaseManager = new PhaseManager(storage);
    const evaluator = new UnlockEvaluator(storage, phaseManager);

    // Test: Barbell detection
    const type1 = evaluator._getExerciseType('Barbell Bench Press');
    logTest(
      category4,
      'Detects "Barbell" as barbell type',
      type1 === 'barbell',
      `Type: ${type1}`
    );

    // Test: Bodyweight detection (Pull-ups)
    const type2 = evaluator._getExerciseType('Pull-ups');
    logTest(
      category4,
      'Detects "Pull-ups" as bodyweight type',
      type2 === 'bodyweight',
      `Type: ${type2}`
    );

    // Test: Traditional Indian exercises (Sadharan)
    const type3 = evaluator._getExerciseType('Sadharan Dand');
    logTest(
      category4,
      'Detects "Sadharan Dand" as bodyweight type',
      type3 === 'bodyweight',
      `Type: ${type3}`
    );

    // Test: Traditional Indian exercises (Baithak)
    const type4 = evaluator._getExerciseType('Sadharan Baithak');
    logTest(
      category4,
      'Detects "Sadharan Baithak" as bodyweight type',
      type4 === 'bodyweight',
      `Type: ${type4}`
    );

    // Test: Traditional Indian exercises (Mudgal)
    const type5 = evaluator._getExerciseType('Mudgal Swings');
    logTest(
      category4,
      'Detects "Mudgal" as traditional type',
      type5 === 'traditional',
      `Type: ${type5}`
    );

    // Test: Equipment default
    const type6 = evaluator._getExerciseType('DB Flat Bench Press');
    logTest(
      category4,
      'Detects dumbbell exercise as equipment type',
      type6 === 'equipment',
      `Type: ${type6}`
    );

  } catch (e) {
    logTest(category4, 'Exercise type detection tests', false, e.message);
  }

  // ========================================
  // SECTION 6: Strength Milestone Tests
  // ========================================
  console.log('\n💪 TESTING STRENGTH MILESTONE CHECKING...\n');

  const category5 = 'Strength Milestones';

  try {
    const storage = new StorageManager();
    const phaseManager = new PhaseManager(storage);
    const evaluator = new UnlockEvaluator(storage, phaseManager);

    // Test: No history fails milestone
    const met1 = evaluator._checkStrengthMilestone('DB Flat Bench Press', 'Barbell Bench Press');
    logTest(
      category5,
      'Fails milestone with no exercise history',
      met1 === false,
      `Met: ${met1}`
    );

    // Test: Insufficient performance fails milestone
    const weakHistory = [
      {
        date: new Date().toISOString(),
        sets: [
          { weight: 10, reps: 8 },  // Below 15kg × 12 reps threshold
          { weight: 10, reps: 8 },
          { weight: 10, reps: 8 }
        ]
      }
    ];
    localStorage.setItem('build_exercise_DB Flat Bench Press', JSON.stringify(weakHistory));

    const met2 = evaluator._checkStrengthMilestone('DB Flat Bench Press', 'Barbell Bench Press');
    logTest(
      category5,
      'Fails milestone with insufficient performance',
      met2 === false,
      `Met: ${met2}, Performance: 10kg × 8 reps (need 15kg × 12 reps)`
    );

    // Test: Meeting milestone passes
    const strongHistory = [
      {
        date: new Date().toISOString(),
        sets: [
          { weight: 15, reps: 12 },  // Meets 15kg × 12 reps × 3 sets
          { weight: 15, reps: 12 },
          { weight: 15, reps: 12 }
        ]
      }
    ];
    localStorage.setItem('build_exercise_DB Flat Bench Press', JSON.stringify(strongHistory));

    const met3 = evaluator._checkStrengthMilestone('DB Flat Bench Press', 'Barbell Bench Press');
    logTest(
      category5,
      'Passes milestone with sufficient performance',
      met3 === true,
      `Met: ${met3}, Performance: 15kg × 12 reps × 3 sets`
    );

    // Cleanup
    localStorage.removeItem('build_exercise_DB Flat Bench Press');

  } catch (e) {
    logTest(category5, 'Strength milestone tests', false, e.message);
  }

  // ========================================
  // SECTION 7: Pain-Free Status Tests
  // ========================================
  console.log('\n🩹 TESTING PAIN-FREE STATUS CHECKING...\n');

  const category6 = 'Pain-Free Status';

  try {
    const storage = new StorageManager();
    const phaseManager = new PhaseManager(storage);
    const evaluator = new UnlockEvaluator(storage, phaseManager);

    // Test: Insufficient history fails
    const met1 = evaluator._checkPainFree('Test Exercise', 3);
    logTest(
      category6,
      'Fails with insufficient workout history',
      met1 === false,
      `Met: ${met1}, Required: 3 workouts`
    );

    // Test: Pain in recent workouts fails
    const painHistory = [
      { date: new Date().toISOString(), painLevel: 0, sets: [] },
      { date: new Date().toISOString(), painLevel: 2, sets: [] },  // Had pain
      { date: new Date().toISOString(), painLevel: 0, sets: [] }
    ];
    localStorage.setItem('build_exercise_Test Exercise', JSON.stringify(painHistory));

    const met2 = evaluator._checkPainFree('Test Exercise', 3);
    logTest(
      category6,
      'Fails with pain in recent workouts',
      met2 === false,
      `Met: ${met2}, Pain levels: [0, 2, 0]`
    );

    // Test: All pain-free passes
    const painFreeHistory = [
      { date: new Date().toISOString(), painLevel: 0, sets: [] },
      { date: new Date().toISOString(), painLevel: 0, sets: [] },
      { date: new Date().toISOString(), painLevel: 0, sets: [] }
    ];
    localStorage.setItem('build_exercise_Test Exercise', JSON.stringify(painFreeHistory));

    const met3 = evaluator._checkPainFree('Test Exercise', 3);
    logTest(
      category6,
      'Passes with all pain-free workouts',
      met3 === true,
      `Met: ${met3}, Pain levels: [0, 0, 0]`
    );

    // Cleanup
    localStorage.removeItem('build_exercise_Test Exercise');

  } catch (e) {
    logTest(category6, 'Pain-free status tests', false, e.message);
  }

  // ========================================
  // SECTION 8: Already Unlocked Tests
  // ========================================
  console.log('\n🔓 TESTING ALREADY UNLOCKED EXERCISES...\n');

  const category7 = 'Already Unlocked';

  try {
    const storage = new StorageManager();
    const phaseManager = new PhaseManager(storage);
    const evaluator = new UnlockEvaluator(storage, phaseManager);

    // Mark exercise as unlocked
    const unlockedExercises = ['Barbell Bench Press'];
    localStorage.setItem('build_unlocked_exercises', JSON.stringify(unlockedExercises));

    const result = evaluator.evaluateUnlock('Barbell Bench Press', 'DB Flat Bench Press');

    logTest(
      category7,
      'Already unlocked exercise returns unlocked: true',
      result.unlocked === true,
      `Unlocked: ${result.unlocked}`
    );

    logTest(
      category7,
      'Already unlocked exercise has no missing criteria',
      result.missing.length === 0,
      `Missing: [${result.missing.join(', ')}]`
    );

    logTest(
      category7,
      'Already unlocked exercise meets all criteria',
      result.criteria.strength && result.criteria.mobility && result.criteria.painFree,
      `Criteria: ${JSON.stringify(result.criteria)}`
    );

    // Cleanup
    localStorage.removeItem('build_unlocked_exercises');

  } catch (e) {
    logTest(category7, 'Already unlocked tests', false, e.message);
  }

  // ========================================
  // SECTION 9: Constructor Requirements
  // ========================================
  console.log('\n⚙️ TESTING CONSTRUCTOR REQUIREMENTS...\n');

  const category8 = 'Constructor';

  try {
    const storage = new StorageManager();

    // Test: Requires PhaseManager
    let errorThrown = false;
    try {
      new UnlockEvaluator(storage, null);
    } catch (e) {
      errorThrown = e.message.includes('requires a PhaseManager');
    }

    logTest(
      category8,
      'Constructor requires PhaseManager instance',
      errorThrown,
      errorThrown ? 'Correctly throws error' : 'No error thrown'
    );

    // Test: Valid construction
    const phaseManager = new PhaseManager(storage);
    const evaluator = new UnlockEvaluator(storage, phaseManager);
    const validConstruction = evaluator !== null && evaluator !== undefined;

    logTest(
      category8,
      'Constructor succeeds with valid PhaseManager',
      validConstruction,
      `Evaluator created: ${validConstruction}`
    );

  } catch (e) {
    logTest(category8, 'Constructor tests', false, e.message);
  }

  // ========================================
  // SECTION 10: Error Handling
  // ========================================
  console.log('\n🛡️ TESTING ERROR HANDLING...\n');

  const category9 = 'Error Handling';

  try {
    const storage = new StorageManager();
    const phaseManager = new PhaseManager(storage);
    const evaluator = new UnlockEvaluator(storage, phaseManager);

    // Test: Invalid exercise name doesn't crash
    const result1 = evaluator.evaluateUnlock(null, 'DB Flat Bench Press');
    const validResult1 = result1 !== null && typeof result1 === 'object';
    logTest(
      category9,
      'Handles null exercise name gracefully',
      validResult1,
      `Result type: ${typeof result1}`
    );

    // Test: Invalid prerequisite doesn't crash
    const result2 = evaluator.evaluateUnlock('Barbell Bench Press', null);
    const validResult2 = result2 !== null && typeof result2 === 'object';
    logTest(
      category9,
      'Handles null prerequisite gracefully',
      validResult2,
      `Result type: ${typeof result2}`
    );

    // Test: evaluateUnlockWithPhasePriority error handling
    const result3 = evaluator.evaluateUnlockWithPhasePriority('Test Exercise', 'Prerequisite');
    const validResult3 = result3 !== null && result3.hasOwnProperty('priority');
    logTest(
      category9,
      'evaluateUnlockWithPhasePriority handles errors safely',
      validResult3,
      `Has priority: ${result3.hasOwnProperty('priority')}`
    );

  } catch (e) {
    logTest(category9, 'Error handling tests', false, e.message);
  }

  // ========================================
  // SECTION 11: Summary
  // ========================================
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
    console.log('✨ ALL TESTS PASSED! Unlock system is working correctly.\n');
  } else {
    console.log(`⚠️ ${results.failed} tests failed. Review failures above.\n`);
  }

  // Export results
  window._unlockSystemTestResults = results;
  console.log('💡 Results available at: window._unlockSystemTestResults\n');
})();
