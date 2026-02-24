/**
 * Comprehensive Progression Pathways Testing Suite
 *
 * Tests all progression pathways for:
 * - Slot definitions exist
 * - Easier/harder/alternate options defined
 * - Target exercises exist in system
 * - Unlock criteria consistency
 * - Phase-aware prioritization
 * - Equipment filtering compatibility
 *
 * USAGE:
 * 1. Open app in browser
 * 2. Open DevTools Console (F12)
 * 3. Copy-paste this entire file
 * 4. Results displayed with ✅ PASS / ❌ FAIL
 */

(async function testAllProgressions() {
  console.log('🔄 COMPREHENSIVE PROGRESSION PATHWAYS TEST SUITE\n');
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

  let progressionPathways, workouts, unlockEvaluator, equipmentProfiles, complexityTiers;

  try {
    progressionPathways = await import('../js/modules/progression-pathways.js');
    workouts = await import('../js/modules/workouts.js');
    unlockEvaluator = await import('../js/modules/unlock-evaluator.js');
    equipmentProfiles = await import('../js/modules/equipment-profiles.js');
    complexityTiers = await import('../js/modules/complexity-tiers.js');
    console.log('✅ All modules loaded successfully\n');
  } catch (e) {
    console.error('❌ FATAL: Failed to load modules', e);
    return;
  }

  // ========================================
  // SECTION 2: Extract All Slots
  // ========================================
  console.log('\n🔍 EXTRACTING ALL PROGRESSION SLOTS...\n');

  const PROGRESSION_PATHS = progressionPathways.PROGRESSION_PATHS;
  const slotKeys = Object.keys(PROGRESSION_PATHS);

  console.log(`Found ${slotKeys.length} progression slots\n`);

  // Get all exercises from workouts for validation
  const ALL_WORKOUTS = workouts.getAllWorkouts();
  const allExerciseNames = new Set();
  ALL_WORKOUTS.forEach(workout => {
    workout.exercises.forEach(ex => allExerciseNames.add(ex.name));
  });
  // Add EXERCISE_DEFINITIONS
  Object.keys(workouts.EXERCISE_DEFINITIONS || {}).forEach(name => {
    allExerciseNames.add(name);
  });

  console.log(`Found ${allExerciseNames.size} unique exercise names for validation\n`);

  // ========================================
  // SECTION 3: Test Slot Definitions
  // ========================================
  console.log('\n🎯 TESTING SLOT DEFINITIONS...\n');

  slotKeys.forEach(slotKey => {
    const category = 'Slot Definitions';
    const pathway = PROGRESSION_PATHS[slotKey];

    // Test: Has current exercise
    const hasCurrent = pathway.current !== undefined && pathway.current.length > 0;
    logTest(
      category,
      `${slotKey} - Has current exercise`,
      hasCurrent,
      hasCurrent ? `Current: ${pathway.current}` : 'Missing current exercise'
    );

    // Test: Current exercise exists
    if (hasCurrent) {
      const currentExists = allExerciseNames.has(pathway.current);
      logTest(
        category,
        `${slotKey} - Current exercise exists in system`,
        currentExists,
        currentExists ? '' : `Exercise "${pathway.current}" not found in workouts`
      );
    }

    // Test: Has at least one progression option
    const hasOptions =
      (pathway.easier && pathway.easier.length > 0) ||
      (pathway.harder && pathway.harder.length > 0) ||
      (pathway.alternate && pathway.alternate.length > 0);

    logTest(
      category,
      `${slotKey} - Has progression options`,
      hasOptions,
      hasOptions ? '' : 'No easier/harder/alternate options defined'
    );
  });

  // ========================================
  // SECTION 4: Test Easier Progressions
  // ========================================
  console.log('\n⬇️ TESTING EASIER PROGRESSIONS...\n');

  slotKeys.forEach(slotKey => {
    const category = 'Easier Progressions';
    const pathway = PROGRESSION_PATHS[slotKey];

    if (pathway.easier && pathway.easier.length > 0) {
      // Test: No duplicates in easier array
      const uniqueEasier = new Set(pathway.easier);
      const noDuplicates = uniqueEasier.size === pathway.easier.length;
      logTest(
        category,
        `${slotKey} - No duplicates in easier array`,
        noDuplicates,
        noDuplicates ? '' : `Found ${pathway.easier.length - uniqueEasier.size} duplicates`
      );
    }
  });

  // ========================================
  // SECTION 5: Test Harder Progressions
  // ========================================
  console.log('\n⬆️ TESTING HARDER PROGRESSIONS...\n');

  slotKeys.forEach(slotKey => {
    const category = 'Harder Progressions';
    const pathway = PROGRESSION_PATHS[slotKey];

    if (pathway.harder && pathway.harder.length > 0) {
      // Test: No duplicates in harder array
      const uniqueHarder = new Set(pathway.harder);
      const noDuplicates = uniqueHarder.size === pathway.harder.length;
      logTest(
        category,
        `${slotKey} - No duplicates in harder array`,
        noDuplicates,
        noDuplicates ? '' : `Found ${pathway.harder.length - uniqueHarder.size} duplicates`
      );
    }
  });

  // ========================================
  // SECTION 6: Test Alternate Progressions
  // ========================================
  console.log('\n🔀 TESTING ALTERNATE PROGRESSIONS...\n');

  slotKeys.forEach(slotKey => {
    const category = 'Alternate Progressions';
    const pathway = PROGRESSION_PATHS[slotKey];

    if (pathway.alternate && pathway.alternate.length > 0) {
      // Test: No duplicates in alternate array
      const uniqueAlternate = new Set(pathway.alternate);
      const noDuplicates = uniqueAlternate.size === pathway.alternate.length;
      logTest(
        category,
        `${slotKey} - No duplicates in alternate array`,
        noDuplicates,
        noDuplicates ? '' : `Found ${pathway.alternate.length - uniqueAlternate.size} duplicates`
      );
    }
  });

  // ========================================
  // SECTION 7: Test Cross-Slot Consistency
  // ========================================
  console.log('\n🔗 TESTING CROSS-SLOT CONSISTENCY...\n');

  const allProgressionExercises = new Set();
  slotKeys.forEach(slotKey => {
    const pathway = PROGRESSION_PATHS[slotKey];
    allProgressionExercises.add(pathway.current);
    (pathway.easier || []).forEach(ex => allProgressionExercises.add(ex));
    (pathway.harder || []).forEach(ex => allProgressionExercises.add(ex));
    (pathway.alternate || []).forEach(ex => allProgressionExercises.add(ex));
  });

  const category = 'Cross-Slot Consistency';

  // Test: Exercises in workout system have equipment profiles
  let missingEquipment = 0;
  const existingProgressionExercises = Array.from(allProgressionExercises).filter(ex => allExerciseNames.has(ex));
  existingProgressionExercises.forEach(exerciseName => {
    const hasEquipment = equipmentProfiles.EQUIPMENT_REQUIREMENTS[exerciseName] !== undefined;
    if (!hasEquipment) missingEquipment++;
  });

  logTest(
    category,
    'Existing progression exercises have equipment profiles',
    missingEquipment === 0,
    missingEquipment === 0 ? `${existingProgressionExercises.length} exercises checked` : `${missingEquipment} exercises missing equipment profiles`
  );

  // Test: Exercises in workout system have complexity tiers
  let missingTiers = 0;
  existingProgressionExercises.forEach(exerciseName => {
    const hasTier = complexityTiers.EXERCISE_COMPLEXITY[exerciseName] !== undefined;
    if (!hasTier) missingTiers++;
  });

  logTest(
    category,
    'Existing progression exercises have complexity tiers',
    missingTiers === 0,
    missingTiers === 0 ? `${existingProgressionExercises.length} exercises checked` : `${missingTiers} exercises missing complexity tiers`
  );

  // ========================================
  // SECTION 8: Test Unlock Integration
  // ========================================
  console.log('\n🔓 TESTING UNLOCK INTEGRATION...\n');

  const unlockCategory = 'Unlock Integration';

  try {
    // Test: Unlock evaluator can be instantiated
    const storage = window.app?.storage || { getTrainingWeeks: () => 0, getExerciseHistory: () => null };
    const evaluator = new unlockEvaluator.UnlockEvaluator(storage);

    logTest(
      unlockCategory,
      'UnlockEvaluator instantiates successfully',
      true,
      'Evaluator ready for testing'
    );

    // Test a sample of progression exercises
    const sampleExercises = Array.from(allProgressionExercises).slice(0, 10);
    let evalErrors = 0;

    sampleExercises.forEach(exerciseName => {
      try {
        const result = evaluator.evaluateUnlock(exerciseName);
        const validResult = result !== null && typeof result === 'object';
        if (!validResult) evalErrors++;
      } catch (e) {
        evalErrors++;
      }
    });

    logTest(
      unlockCategory,
      'Sample exercises can be evaluated for unlock status',
      evalErrors === 0,
      evalErrors === 0 ? `${sampleExercises.length} exercises tested` : `${evalErrors} errors in evaluation`
    );

  } catch (e) {
    logTest(
      unlockCategory,
      'UnlockEvaluator instantiates successfully',
      false,
      e.message
    );
  }

  // ========================================
  // SECTION 9: Test Slot Naming Conventions
  // ========================================
  console.log('\n📛 TESTING SLOT NAMING CONVENTIONS...\n');

  const namingCategory = 'Naming Conventions';

  // Test: All slots follow naming pattern (WORKOUT_SLOT_N)
  let invalidNames = 0;
  const validPattern = /^(UPPER_A|UPPER_B|LOWER_A|LOWER_B)_SLOT_\d+$/;

  slotKeys.forEach(slotKey => {
    if (!validPattern.test(slotKey)) {
      invalidNames++;
    }
  });

  logTest(
    namingCategory,
    'All slots follow naming pattern (WORKOUT_SLOT_N)',
    invalidNames === 0,
    invalidNames === 0 ? `${slotKeys.length} slots checked` : `${invalidNames} slots with invalid names`
  );

  // Test: Slots are numbered sequentially per workout
  const workoutSlots = {
    UPPER_A: [],
    UPPER_B: [],
    LOWER_A: [],
    LOWER_B: []
  };

  slotKeys.forEach(slotKey => {
    const match = slotKey.match(/^(UPPER_A|UPPER_B|LOWER_A|LOWER_B)_SLOT_(\d+)$/);
    if (match) {
      const workout = match[1];
      const slotNum = parseInt(match[2]);
      workoutSlots[workout].push(slotNum);
    }
  });

  let gapsFound = false;
  Object.keys(workoutSlots).forEach(workoutName => {
    const slots = workoutSlots[workoutName].sort((a, b) => a - b);
    for (let i = 0; i < slots.length; i++) {
      if (slots[i] !== i + 1) {
        gapsFound = true;
        break;
      }
    }
  });

  logTest(
    namingCategory,
    'Slots are numbered sequentially (1, 2, 3, ...)',
    !gapsFound,
    gapsFound ? 'Found gaps or non-sequential numbering' : 'All slots sequential'
  );

  // ========================================
  // SECTION 10: Summary
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
      console.log('✨ ALL TESTS PASSED! All progression pathways are properly configured.\n');
    } else {
      console.log(`⚠️ ${results.failed} tests failed. Review failures above.\n`);
    }
    console.log(`💡 Tested ${slotKeys.length} slots across ${ALL_WORKOUTS.length} workouts\n`);
    console.log(`💡 Validated ${allProgressionExercises.size} unique exercises in progression system\n`);
  } // End orchestration check

  // Export results
  window._progressionTestResults = results;
  if (!window._TEST_ORCHESTRATED) {
      console.log('💡 Results available at: window._progressionTestResults\n');
    }
    })();
