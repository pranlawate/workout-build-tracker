/**
 * Comprehensive Exercise Testing Suite
 *
 * Tests all 28 exercises in the app for:
 * - Proper workout definition
 * - Exercise metadata existence
 * - Form cues completeness
 * - Equipment profile accuracy
 * - Complexity tier classification
 * - Starting weights and increments
 *
 * USAGE:
 * 1. Open app in browser
 * 2. Open DevTools Console (F12)
 * 3. Copy-paste this entire file
 * 4. Results displayed with ✅ PASS / ❌ FAIL
 */

(async function testAllExercises() {
  console.log('🏋️ COMPREHENSIVE EXERCISE TEST SUITE\n');
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
  // SECTION 1: Load All Modules
  // ========================================
  console.log('\n📦 LOADING MODULES...\n');

  let workouts, equipmentProfiles, formCues, complexityTiers, exerciseMetadata;

  try {
    workouts = await import('../js/modules/workouts.js');
    equipmentProfiles = await import('../js/modules/equipment-profiles.js');
    formCues = await import('../js/modules/form-cues.js');
    complexityTiers = await import('../js/modules/complexity-tiers.js');
    exerciseMetadata = await import('../js/modules/exercise-metadata.js');
    console.log('✅ All modules loaded successfully\n');
  } catch (e) {
    console.error('❌ FATAL: Failed to load modules', e);
    return;
  }

  // ========================================
  // SECTION 2: Extract All Exercises
  // ========================================
  console.log('\n🔍 EXTRACTING ALL EXERCISES...\n');

  const ALL_WORKOUTS = workouts.getAllWorkouts();
  const allExercises = [];
  const exercisesByWorkout = {};

  ALL_WORKOUTS.forEach(workout => {
    exercisesByWorkout[workout.name] = workout.exercises;
    workout.exercises.forEach(ex => {
      if (!allExercises.find(e => e.name === ex.name)) {
        allExercises.push(ex);
      }
    });
  });

  // Add EXERCISE_DEFINITIONS exercises
  Object.keys(workouts.EXERCISE_DEFINITIONS || {}).forEach(name => {
    if (!allExercises.find(e => e.name === name)) {
      allExercises.push({
        name: name,
        ...workouts.EXERCISE_DEFINITIONS[name]
      });
    }
  });

  console.log(`Found ${allExercises.length} unique exercises across ${ALL_WORKOUTS.length} workouts\n`);

  // ========================================
  // SECTION 3: Test Exercise Definitions
  // ========================================
  console.log('\n🏋️ TESTING EXERCISE DEFINITIONS...\n');

  allExercises.forEach(exercise => {
    const category = 'Exercise Definitions';
    const name = exercise.name;

    // Test: Has required fields
    const hasRequiredFields =
      exercise.sets !== undefined &&
      exercise.repRange !== undefined &&
      exercise.rirTarget !== undefined &&
      exercise.startingWeight !== undefined;

    logTest(
      category,
      `${name} - Has required fields`,
      hasRequiredFields,
      hasRequiredFields ? '' : `Missing: ${!exercise.sets ? 'sets ' : ''}${!exercise.repRange ? 'repRange ' : ''}${!exercise.rirTarget ? 'rirTarget ' : ''}${!exercise.startingWeight ? 'startingWeight' : ''}`
    );

    // Test: Valid sets count
    const validSets = exercise.sets >= 1 && exercise.sets <= 5;
    logTest(
      category,
      `${name} - Valid sets count (1-5)`,
      validSets,
      validSets ? '' : `Sets: ${exercise.sets}`
    );

    // Test: Valid starting weight
    const validStartWeight = exercise.startingWeight > 0 && exercise.startingWeight < 200;
    logTest(
      category,
      `${name} - Valid starting weight`,
      validStartWeight,
      validStartWeight ? '' : `Starting weight: ${exercise.startingWeight}kg`
    );

    // Test: Has weight increment
    const hasIncrement = exercise.weightIncrement !== undefined && exercise.weightIncrement > 0;
    logTest(
      category,
      `${name} - Has weight increment`,
      hasIncrement,
      hasIncrement ? '' : `Weight increment: ${exercise.weightIncrement}`
    );

    // Test: Has notes
    const hasNotes = exercise.notes && exercise.notes.length > 0;
    logTest(
      category,
      `${name} - Has notes/description`,
      hasNotes,
      hasNotes ? '' : 'Missing notes'
    );
  });

  // ========================================
  // SECTION 4: Test Form Cues
  // ========================================
  console.log('\n📋 TESTING FORM CUES...\n');

  allExercises.forEach(exercise => {
    const category = 'Form Cues';
    const name = exercise.name;
    const cues = formCues.FORM_CUES[name];

    // Test: Has form cues
    const hasCues = cues !== undefined;
    logTest(
      category,
      `${name} - Has form cues defined`,
      hasCues,
      hasCues ? '' : 'Form cues not found'
    );

    if (hasCues) {
      // Test: Has setup cues
      const hasSetup = cues.setup && Array.isArray(cues.setup) && cues.setup.length > 0;
      logTest(
        category,
        `${name} - Has setup cues`,
        hasSetup,
        hasSetup ? `${cues.setup.length} cues` : 'Missing setup cues'
      );

      // Test: Has execution cues
      const hasExecution = cues.execution && Array.isArray(cues.execution) && cues.execution.length > 0;
      logTest(
        category,
        `${name} - Has execution cues`,
        hasExecution,
        hasExecution ? `${cues.execution.length} cues` : 'Missing execution cues'
      );

      // Test: Has mistakes cues
      const hasMistakes = cues.mistakes && Array.isArray(cues.mistakes) && cues.mistakes.length > 0;
      logTest(
        category,
        `${name} - Has mistakes cues`,
        hasMistakes,
        hasMistakes ? `${cues.mistakes.length} cues` : 'Missing mistakes cues'
      );
    }
  });

  // ========================================
  // SECTION 5: Test Equipment Profiles
  // ========================================
  console.log('\n🛠️ TESTING EQUIPMENT PROFILES...\n');

  allExercises.forEach(exercise => {
    const category = 'Equipment Profiles';
    const name = exercise.name;
    const equipment = equipmentProfiles.EQUIPMENT_REQUIREMENTS[name];

    // Test: Has equipment profile
    const hasEquipment = equipment !== undefined;
    logTest(
      category,
      `${name} - Has equipment profile`,
      hasEquipment,
      hasEquipment ? `Requires: ${equipment.join(', ')}` : 'Equipment profile not found'
    );

    if (hasEquipment) {
      // Test: Equipment is valid array
      const validEquipment = Array.isArray(equipment) && equipment.length > 0;
      logTest(
        category,
        `${name} - Valid equipment array`,
        validEquipment,
        validEquipment ? '' : 'Equipment is not a valid array'
      );
    }
  });

  // ========================================
  // SECTION 6: Test Complexity Tiers
  // ========================================
  console.log('\n🎯 TESTING COMPLEXITY TIERS...\n');

  allExercises.forEach(exercise => {
    const category = 'Complexity Tiers';
    const name = exercise.name;
    const tier = complexityTiers.EXERCISE_COMPLEXITY[name];

    // Test: Has complexity tier
    const hasTier = tier !== undefined;
    logTest(
      category,
      `${name} - Has complexity tier`,
      hasTier,
      hasTier ? `Tier: ${tier}` : 'Complexity tier not found'
    );

    if (hasTier) {
      // Test: Valid tier value
      const validTierValues = [
        complexityTiers.COMPLEXITY_TIERS.SIMPLE,
        complexityTiers.COMPLEXITY_TIERS.MODERATE,
        complexityTiers.COMPLEXITY_TIERS.COMPLEX
      ];
      const validTier = validTierValues.includes(tier);
      logTest(
        category,
        `${name} - Valid tier value`,
        validTier,
        validTier ? '' : `Invalid tier: ${tier}`
      );
    }
  });

  // ========================================
  // SECTION 7: Test Exercise Metadata
  // ========================================
  console.log('\n📊 TESTING EXERCISE METADATA...\n');

  allExercises.forEach(exercise => {
    const category = 'Exercise Metadata';
    const name = exercise.name;
    const metadata = exerciseMetadata.EXERCISE_METADATA[name];

    // Test: Has metadata
    const hasMetadata = metadata !== undefined;
    logTest(
      category,
      `${name} - Has exercise metadata`,
      hasMetadata,
      hasMetadata ? '' : 'Metadata not found (may be intentional for new exercises)'
    );

    if (hasMetadata) {
      // Test: Has movement type
      const hasMovementType = metadata.movementType !== undefined;
      logTest(
        category,
        `${name} - Has movement type`,
        hasMovementType,
        hasMovementType ? `Type: ${metadata.movementType}` : 'Missing movement type'
      );

      // Test: Has muscle group
      const hasMuscleGroup = metadata.muscleGroup !== undefined;
      logTest(
        category,
        `${name} - Has muscle group`,
        hasMuscleGroup,
        hasMuscleGroup ? `Group: ${metadata.muscleGroup}` : 'Missing muscle group'
      );
    }
  });

  // ========================================
  // SECTION 8: Test Workout Integration
  // ========================================
  console.log('\n🏃 TESTING WORKOUT INTEGRATION...\n');

  ALL_WORKOUTS.forEach(workout => {
    const category = 'Workout Integration';

    // Test: Workout has name
    const hasName = workout.name && workout.name.length > 0;
    logTest(
      category,
      `${workout.name} - Has name`,
      hasName,
      hasName ? '' : 'Missing name'
    );

    // Test: Workout has display name
    const hasDisplayName = workout.displayName && workout.displayName.length > 0;
    logTest(
      category,
      `${workout.name} - Has display name`,
      hasDisplayName,
      hasDisplayName ? workout.displayName : 'Missing display name'
    );

    // Test: Workout has exercises
    const hasExercises = workout.exercises && workout.exercises.length > 0;
    logTest(
      category,
      `${workout.name} - Has exercises`,
      hasExercises,
      hasExercises ? `${workout.exercises.length} exercises` : 'No exercises'
    );

    // Test: Workout exercise count is reasonable (4-7 exercises)
    const reasonableCount = workout.exercises.length >= 4 && workout.exercises.length <= 7;
    logTest(
      category,
      `${workout.name} - Reasonable exercise count (4-7)`,
      reasonableCount,
      reasonableCount ? '' : `Count: ${workout.exercises.length}`
    );
  });

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
      console.log('✨ ALL TESTS PASSED! All exercises are properly configured.\n');
    } else {
      console.log(`⚠️ ${results.failed} tests failed. Review failures above.\n`);
    }
  } // End orchestration check

  // Export results for programmatic access
  window._exerciseTestResults = results;
  if (!window._TEST_ORCHESTRATED) {
    console.log('💡 Results available at: window._exerciseTestResults\n');
    }
    })();
