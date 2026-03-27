/**
 * Comprehensive Smart Progression Testing Suite
 *
 * Tests the smart progression calculation system:
 * - Rep range checking
 * - Plateau detection (same weight 3+ workouts)
 * - Regression detection (weight/rep drops)
 * - Weight gap failure detection
 * - Successful progression detection
 * - Weight increase suggestions
 * - Adaptive pattern learning
 * - Main decision engine (getSuggestion)
 *
 * USAGE:
 * 1. Open app in browser
 * 2. Open DevTools Console (F12)
 * 3. Copy-paste this entire file
 * 4. Results displayed with ✅ PASS / ❌ FAIL
 */

(async function testSmartProgression() {
  console.log('📈 COMPREHENSIVE SMART PROGRESSION TEST SUITE\n');
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
  // SECTION 1: Load Module
  // ========================================
  console.log('\n📦 LOADING MODULE...\n');

  let SmartProgression;

  try {
    SmartProgression = await import('../js/modules/smart-progression.js');
    console.log('✅ Module loaded successfully\n');
  } catch (e) {
    console.error('❌ FATAL: Failed to load module', e);
    return;
  }

  // ========================================
  // SECTION 2: Rep Range Tests
  // ========================================
  console.log('\n🎯 TESTING REP RANGE CHECKING...\n');

  const category1 = 'Rep Range';

  try {
    // Test: Hit top of standard range (12 reps)
    const hit1 = SmartProgression.hitTopOfReps(12, 'DB Flat Bench Press');
    logTest(
      category1,
      'Returns true for 12 reps (top of standard range)',
      hit1 === true,
      `Reps: 12, Hit top: ${hit1}`
    );

    // Test: Above top of range
    const hit2 = SmartProgression.hitTopOfReps(15, 'DB Flat Bench Press');
    logTest(
      category1,
      'Returns true for reps above top of range',
      hit2 === true,
      `Reps: 15, Hit top: ${hit2}`
    );

    // Test: Below top of range
    const hit3 = SmartProgression.hitTopOfReps(10, 'DB Flat Bench Press');
    logTest(
      category1,
      'Returns false for reps below top of range',
      hit3 === false,
      `Reps: 10, Hit top: ${hit3}`
    );

    // Test: Null safety
    const hit4 = SmartProgression.hitTopOfReps(null, 'DB Flat Bench Press');
    logTest(
      category1,
      'Returns false for null reps',
      hit4 === false,
      `Hit top: ${hit4}`
    );

  } catch (e) {
    logTest(category1, 'Rep range tests', false, e.message);
  }

  // ========================================
  // SECTION 3: Plateau Detection Tests
  // ========================================
  console.log('\n📊 TESTING PLATEAU DETECTION...\n');

  const category2 = 'Plateau Detection';

  try {
    // Test: Plateau with same weight 3 workouts
    const plateauHistory = [
      { date: '2026-02-10', sets: [{ weight: 10, reps: 12 }] },
      { date: '2026-02-07', sets: [{ weight: 10, reps: 12 }] },
      { date: '2026-02-04', sets: [{ weight: 10, reps: 12 }] }
    ];
    const plateau1 = SmartProgression.detectPlateau(plateauHistory);
    logTest(
      category2,
      'Detects plateau with same weight for 3 workouts',
      plateau1 === true,
      `Weights: [10, 10, 10], Plateau: ${plateau1}`
    );

    // Test: No plateau with weight progression
    const noPlateauHistory = [
      { date: '2026-02-10', sets: [{ weight: 12.5, reps: 10 }] },
      { date: '2026-02-07', sets: [{ weight: 10, reps: 12 }] },
      { date: '2026-02-04', sets: [{ weight: 10, reps: 10 }] }
    ];
    const plateau2 = SmartProgression.detectPlateau(noPlateauHistory);
    logTest(
      category2,
      'No plateau with weight progression',
      plateau2 === false,
      `Weights: [12.5, 10, 10], Plateau: ${plateau2}`
    );

    // Test: Insufficient history
    const shortHistory = [
      { date: '2026-02-10', sets: [{ weight: 10, reps: 12 }] }
    ];
    const plateau3 = SmartProgression.detectPlateau(shortHistory);
    logTest(
      category2,
      'No plateau with insufficient history',
      plateau3 === false,
      `History length: ${shortHistory.length}, Plateau: ${plateau3}`
    );

  } catch (e) {
    logTest(category2, 'Plateau detection tests', false, e.message);
  }

  // ========================================
  // SECTION 4: Regression Detection Tests
  // ========================================
  console.log('\n📉 TESTING REGRESSION DETECTION...\n');

  const category3 = 'Regression Detection';

  try {
    // Test: Weight dropped (history is chronological: oldest first, newest last)
    const weightDropHistory = [
      { date: '2026-02-07', sets: [{ weight: 12.5, reps: 10, rir: 2 }] },
      { date: '2026-02-10', sets: [{ weight: 10, reps: 12, rir: 2 }] }
    ];
    const regression1 = SmartProgression.detectRegression(weightDropHistory);
    logTest(
      category3,
      'Detects regression with weight drop',
      regression1 === true,
      `Weights: 12.5kg → 10kg, Regression: ${regression1}`
    );

    // Test: Significant rep drop (25%+)
    const repDropHistory = [
      { date: '2026-02-07', sets: [{ weight: 10, reps: 12, rir: 2 }] },
      { date: '2026-02-10', sets: [{ weight: 10, reps: 8, rir: 2 }] }
    ];
    const regression2 = SmartProgression.detectRegression(repDropHistory);
    logTest(
      category3,
      'Detects regression with 25%+ rep drop at same weight',
      regression2 === true,
      `Reps: 12 → 8 (33% drop), Regression: ${regression2}`
    );

    // Test: No regression with progress
    const progressHistory = [
      { date: '2026-02-07', sets: [{ weight: 10, reps: 12, rir: 2 }] },
      { date: '2026-02-10', sets: [{ weight: 12.5, reps: 10, rir: 2 }] }
    ];
    const regression3 = SmartProgression.detectRegression(progressHistory);
    logTest(
      category3,
      'No regression with weight increase',
      regression3 === false,
      `Weights: 10kg → 12.5kg, Regression: ${regression3}`
    );

  } catch (e) {
    logTest(category3, 'Regression detection tests', false, e.message);
  }

  // ========================================
  // SECTION 5: Weight Gap Failure Tests
  // ========================================
  console.log('\n⚠️ TESTING WEIGHT GAP FAILURE DETECTION...\n');

  const category4 = 'Weight Gap Failure';

  try {
    // Test: Weight gap failure (increased weight, failed min reps, RIR 0)
    const failureHistory = [
      { date: '2026-02-07', sets: [{ weight: 10, reps: 12, rir: 2 }] },
      { date: '2026-02-10', sets: [{ weight: 12.5, reps: 6, rir: 0 }] }
    ];
    const failure1 = SmartProgression.detectWeightGapFailure(failureHistory, 'DB Lateral Raises');
    logTest(
      category4,
      'Detects weight gap failure (increased weight, < min reps, RIR 0)',
      failure1 === true,
      `10kg×12 → 12.5kg×6 (min: 12 for DB Lateral Raises), Failure: ${failure1}`
    );

    // Test: No failure with sufficient reps
    const successHistory = [
      { date: '2026-02-07', sets: [{ weight: 10, reps: 12, rir: 2 }] },
      { date: '2026-02-10', sets: [{ weight: 12.5, reps: 10, rir: 2 }] }
    ];
    const failure2 = SmartProgression.detectWeightGapFailure(successHistory, 'DB Lateral Raises');
    logTest(
      category4,
      'No failure when min reps are met',
      failure2 === false,
      `10kg×12 → 12.5kg×10 (min: 12), Failure: ${failure2}`
    );

    // Test: No failure with RIR > 0
    const rirHistory = [
      { date: '2026-02-07', sets: [{ weight: 10, reps: 12, rir: 2 }] },
      { date: '2026-02-10', sets: [{ weight: 12.5, reps: 6, rir: 2 }] }
    ];
    const failure3 = SmartProgression.detectWeightGapFailure(rirHistory, 'DB Lateral Raises');
    logTest(
      category4,
      'No failure when RIR > 0 (not at failure)',
      failure3 === false,
      `RIR: 2, Failure: ${failure3}`
    );

  } catch (e) {
    logTest(category4, 'Weight gap failure tests', false, e.message);
  }

  // ========================================
  // SECTION 6: Successful Progression Tests
  // ========================================
  console.log('\n✅ TESTING SUCCESSFUL PROGRESSION DETECTION...\n');

  const category5 = 'Successful Progression';

  try {
    // Test: Successful progression (top reps with good RIR)
    const successHistory = [
      { date: '2026-02-10', sets: [{ weight: 10, reps: 15, rir: 2 }] }
    ];
    const success1 = SmartProgression.detectSuccessfulProgression(successHistory, 'DB Lateral Raises');
    logTest(
      category5,
      'Detects success at top of workout rep range with RIR 2',
      success1 === true,
      `Reps: 15 (top of 12-15 range), RIR: 2, Success: ${success1}`
    );

    // Test: Not successful - below top reps
    const belowTopHistory = [
      { date: '2026-02-10', sets: [{ weight: 10, reps: 10, rir: 2 }] }
    ];
    const success2 = SmartProgression.detectSuccessfulProgression(belowTopHistory, 'DB Lateral Raises');
    logTest(
      category5,
      'Not successful with reps below top of range',
      success2 === false,
      `Reps: 10 (need 15), Success: ${success2}`
    );

    // Test: Not successful - poor RIR
    const poorRIRHistory = [
      { date: '2026-02-10', sets: [{ weight: 10, reps: 15, rir: 0 }] }
    ];
    const success3 = SmartProgression.detectSuccessfulProgression(poorRIRHistory, 'DB Lateral Raises');
    logTest(
      category5,
      'Not successful with RIR 0 (need RIR 2-3)',
      success3 === false,
      `Reps: 15, RIR: 0, Success: ${success3}`
    );

  } catch (e) {
    logTest(category5, 'Successful progression tests', false, e.message);
  }

  // ========================================
  // SECTION 7: Weight Increase Suggestions
  // ========================================
  console.log('\n➕ TESTING WEIGHT INCREASE SUGGESTIONS...\n');

  const category6 = 'Weight Increase';

  try {
    // Test: Suggest weight increase
    const history = [
      { date: '2026-02-10', sets: [{ weight: 10, reps: 15, rir: 2 }] }
    ];
    const suggestion = SmartProgression.suggestWeightIncrease(history, 'DB Lateral Raises');

    logTest(
      category6,
      'Suggests weight increase with correct type',
      suggestion?.type === 'INCREASE_WEIGHT',
      `Type: ${suggestion?.type}`
    );

    logTest(
      category6,
      'Suggests increment from exercise definition (1.25kg for DB Lateral Raises)',
      suggestion?.suggestedWeight === 11.25,
      `Current: 10kg, Suggested: ${suggestion?.suggestedWeight}kg`
    );

    logTest(
      category6,
      'Includes reason message',
      suggestion?.reason?.includes('top of rep range'),
      `Reason: ${suggestion?.reason}`
    );

    // Test: No suggestion with null history
    const nullSuggestion = SmartProgression.suggestWeightIncrease([], 'DB Lateral Raises');
    logTest(
      category6,
      'Returns null with empty history',
      nullSuggestion === null,
      `Suggestion: ${nullSuggestion}`
    );

  } catch (e) {
    logTest(category6, 'Weight increase suggestion tests', false, e.message);
  }

  // ========================================
  // SECTION 8: Adaptive Pattern Learning
  // ========================================
  console.log('\n🧠 TESTING ADAPTIVE PATTERN LEARNING...\n');

  const category7 = 'Adaptive Learning';

  try {
    // Test: Detect large jumps (5kg increments)
    const largeJumpHistory = [
      { date: '2026-02-04', sets: [{ weight: 15, reps: 10 }] },
      { date: '2026-02-07', sets: [{ weight: 20, reps: 10 }] },
      { date: '2026-02-10', sets: [{ weight: 25, reps: 10 }] }
    ];
    const pattern1 = SmartProgression.detectAdaptiveWeightPattern(largeJumpHistory);
    logTest(
      category7,
      'Detects large jumps pattern (5kg increments)',
      pattern1?.pattern === 'large_jumps' && pattern1.averageIncrement === 5,
      `Pattern: ${pattern1?.pattern}, Average: ${pattern1?.averageIncrement}kg`
    );

    // Test: Detect small steps (1kg increments)
    const smallStepHistory = [
      { date: '2026-02-04', sets: [{ weight: 10, reps: 10 }] },
      { date: '2026-02-07', sets: [{ weight: 11, reps: 10 }] },
      { date: '2026-02-10', sets: [{ weight: 12, reps: 10 }] }
    ];
    const pattern2 = SmartProgression.detectAdaptiveWeightPattern(smallStepHistory);
    logTest(
      category7,
      'Detects small steps pattern (1kg increments)',
      pattern2?.pattern === 'small_steps' && pattern2.averageIncrement === 1,
      `Pattern: ${pattern2?.pattern}, Average: ${pattern2?.averageIncrement}kg`
    );

    // Test: Insufficient history
    const shortHistory = [
      { date: '2026-02-10', sets: [{ weight: 10, reps: 10 }] }
    ];
    const pattern3 = SmartProgression.detectAdaptiveWeightPattern(shortHistory);
    logTest(
      category7,
      'Returns null with insufficient history',
      pattern3 === null,
      `Pattern: ${pattern3}`
    );

  } catch (e) {
    logTest(category7, 'Adaptive learning tests', false, e.message);
  }

  // ========================================
  // SECTION 9: Main Decision Engine Tests
  // ========================================
  console.log('\n🎛️ TESTING MAIN DECISION ENGINE (getSuggestion)...\n');

  const category8 = 'Decision Engine';

  try {
    // Test: Priority 1 - Pain takes precedence
    const painHistory = {
      latestPain: { intensity: 'moderate', location: 'shoulder', date: '2026-02-10' },
      count: 1
    };
    const workoutHistory = [
      { date: '2026-02-10', sets: [{ weight: 10, reps: 12, rir: 2 }] }
    ];
    const suggestion1 = SmartProgression.getSuggestion('UPPER_A - DB Lateral Raises', workoutHistory, painHistory);
    logTest(
      category8,
      'Priority 1: Pain handling takes precedence',
      suggestion1?.type === 'REDUCE_WEIGHT',
      `Type: ${suggestion1?.type}, Reason: ${suggestion1?.reason}`
    );

    // Test: Priority 2 - Weight increase after successful progression
    const successHistory = [
      { date: '2026-02-10', sets: [{ weight: 10, reps: 15, rir: 2 }] }
    ];
    const suggestion2 = SmartProgression.getSuggestion('UPPER_B - DB Lateral Raises', successHistory);
    logTest(
      category8,
      'Priority 2: Suggests weight increase after successful progression',
      suggestion2?.type === 'INCREASE_WEIGHT',
      `Type: ${suggestion2?.type}, Suggested: ${suggestion2?.suggestedWeight}kg`
    );

    // Test: Priority 5 - Plateau alternative
    const plateauHistory = [
      { date: '2026-02-04', sets: [{ weight: 10, reps: 10, rir: 2 }] },
      { date: '2026-02-07', sets: [{ weight: 10, reps: 10, rir: 2 }] },
      { date: '2026-02-10', sets: [{ weight: 10, reps: 10, rir: 2 }] }
    ];
    const suggestion3 = SmartProgression.getSuggestion('UPPER_A - DB Lateral Raises', plateauHistory);
    const isPlateauWarning = suggestion3?.type === 'TRY_ALTERNATIVE' || suggestion3?.type === 'PLATEAU_WARNING';
    logTest(
      category8,
      'Priority 5: Detects plateau and suggests action',
      isPlateauWarning,
      `Type: ${suggestion3?.type}`
    );

    // Test: Priority 6 - Regression warning
    const regressionHistory = [
      { date: '2026-02-07', sets: [{ weight: 10, reps: 12, rir: 2 }] },
      { date: '2026-02-10', sets: [{ weight: 10, reps: 8, rir: 2 }] }
    ];
    const suggestion4 = SmartProgression.getSuggestion('UPPER_A - DB Lateral Raises', regressionHistory);
    logTest(
      category8,
      'Priority 6: Warns about regression',
      suggestion4?.type === 'RECOVERY_WARNING',
      `Type: ${suggestion4?.type}`
    );

    // Test: Priority 7 - Continue with current weight
    const continueHistory = [
      { date: '2026-02-10', sets: [{ weight: 10, reps: 10, rir: 2 }] }
    ];
    const suggestion5 = SmartProgression.getSuggestion('UPPER_A - DB Lateral Raises', continueHistory);
    logTest(
      category8,
      'Priority 7: Suggests continue when in good range',
      suggestion5?.type === 'CONTINUE',
      `Type: ${suggestion5?.type}, Message: ${suggestion5?.message}`
    );

  } catch (e) {
    logTest(category8, 'Decision engine tests', false, e.message);
  }

  // ========================================
  // SECTION 10: Error Handling
  // ========================================
  console.log('\n🛡️ TESTING ERROR HANDLING...\n');

  const category9 = 'Error Handling';

  try {
    // Test: Null history handling
    const nullHistory = SmartProgression.detectPlateau(null);
    logTest(
      category9,
      'detectPlateau handles null history',
      nullHistory === false,
      `Result: ${nullHistory}`
    );

    // Test: Invalid exercise name
    const invalidEx = SmartProgression.hitTopOfReps(12, null);
    logTest(
      category9,
      'hitTopOfReps handles null exercise name',
      invalidEx === false,
      `Result: ${invalidEx}`
    );

    // Test: getSuggestion with no history
    const noHistory = SmartProgression.getSuggestion('UPPER_A - DB Lateral Raises', []);
    logTest(
      category9,
      'getSuggestion handles empty history gracefully',
      noHistory?.type === 'CONTINUE',
      `Type: ${noHistory?.type}`
    );

    // Test: detectRegression with insufficient history
    const singleWorkout = [{ date: '2026-02-10', sets: [{ weight: 10, reps: 12 }] }];
    const noRegression = SmartProgression.detectRegression(singleWorkout);
    logTest(
      category9,
      'detectRegression handles insufficient history',
      noRegression === false,
      `Result: ${noRegression}`
    );

  } catch (e) {
    logTest(category9, 'Error handling tests', false, e.message);
  }

  // ========================================
  // SECTION 11: Summary
  // ========================================
  // Suppress detailed summary when running under test orchestration (browser only)
  const g = globalThis;
  if (typeof g.window === 'undefined' || !g.window._TEST_ORCHESTRATED) {
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
      console.log('✨ ALL TESTS PASSED! Smart progression logic is working correctly.\n');
    } else {
      console.log(`⚠️ ${results.failed} tests failed. Review failures above.\n`);
    }
  } // End orchestration check

  if (typeof g.window !== 'undefined') {
    g.window._smartProgressionTestResults = results;
    if (!g.window._TEST_ORCHESTRATED) {
      console.log('💡 Results available at: window._smartProgressionTestResults\n');
    }
  }
})();
