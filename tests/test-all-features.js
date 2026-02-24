/**
 * Comprehensive Feature Modules Testing Suite
 *
 * Tests all 23 feature modules for:
 * - Module loads successfully
 * - Public API methods exist
 * - Methods don't crash on basic inputs
 * - Integration with app instance
 * - localStorage compatibility
 *
 * USAGE:
 * 1. Open app in browser
 * 2. Open DevTools Console (F12)
 * 3. Copy-paste this entire file
 * 4. Results displayed with ✅ PASS / ❌ FAIL
 */

(async function testAllFeatures() {
  console.log('⚙️ COMPREHENSIVE FEATURE MODULES TEST SUITE\n');
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
  // SECTION 1: Module Loading Tests
  // ========================================
  console.log('\n📦 TESTING MODULE LOADING...\n');

  const modules = [
    { path: './js/modules/achievements.js', name: 'Achievements' },
    { path: './js/modules/analytics-calculator.js', name: 'Analytics Calculator' },
    { path: './js/modules/barbell-progression-tracker.js', name: 'Barbell Progression Tracker' },
    { path: './js/modules/body-weight.js', name: 'Body Weight' },
    { path: './js/modules/complexity-tiers.js', name: 'Complexity Tiers' },
    { path: './js/modules/deload.js', name: 'Deload Manager' },
    { path: './js/modules/equipment-profiles.js', name: 'Equipment Profiles' },
    { path: './js/modules/exercise-metadata.js', name: 'Exercise Metadata' },
    { path: './js/modules/form-cues.js', name: 'Form Cues' },
    { path: './js/modules/optional-fifth-day.js', name: 'Optional Fifth Day' },
    { path: './js/modules/performance-analyzer.js', name: 'Performance Analyzer' },
    { path: './js/modules/phase-manager.js', name: 'Phase Manager' },
    { path: './js/modules/progress-analyzer.js', name: 'Progress Analyzer' },
    { path: './js/modules/progression.js', name: 'Progression' },
    { path: './js/modules/progression-pathways.js', name: 'Progression Pathways' },
    { path: './js/modules/smart-progression.js', name: 'Smart Progression' },
    { path: './js/modules/storage.js', name: 'Storage Manager' },
    { path: './js/modules/tempo-guidance.js', name: 'Tempo Guidance' },
    { path: './js/modules/unlock-criteria.js', name: 'Unlock Criteria' },
    { path: './js/modules/unlock-evaluator.js', name: 'Unlock Evaluator' },
    { path: './js/modules/warm-up-protocols.js', name: 'Warm-up Protocols' },
    { path: './js/modules/workout-manager.js', name: 'Workout Manager' },
    { path: './js/modules/workouts.js', name: 'Workouts' }
  ];

  const loadedModules = {};

  for (const mod of modules) {
    try {
      const module = await import(mod.path);
      loadedModules[mod.name] = module;
      logTest('Module Loading', `${mod.name} - Loads successfully`, true, `Path: ${mod.path}`);
    } catch (e) {
      logTest('Module Loading', `${mod.name} - Loads successfully`, false, `Error: ${e.message}`);
    }
  }

  // ========================================
  // SECTION 2: Storage Manager Tests
  // ========================================
  console.log('\n💾 TESTING STORAGE MANAGER...\n');

  const category = 'Storage Manager';
  const StorageModule = loadedModules['Storage Manager'];

  if (StorageModule) {
    try {
      const storage = new StorageModule.StorageManager();

      // Test: Can instantiate
      logTest(category, 'StorageManager instantiates', true);

      // Test: Has required methods
      const methods = [
        'getExerciseHistory',
        'saveExerciseHistory',
        'getWorkoutRotation',
        'saveWorkoutRotation',
        'getExerciseSelections',
        'saveExerciseSelection',
        'getTrainingWeeks'
      ];

      methods.forEach(method => {
        const hasMethod = typeof storage[method] === 'function';
        logTest(category, `Has method: ${method}`, hasMethod);
      });

      // Test: Can call getTrainingWeeks
      try {
        const weeks = storage.getTrainingWeeks();
        const validResult = typeof weeks === 'number' && weeks >= 0;
        logTest(category, 'getTrainingWeeks returns valid number', validResult, `Returned: ${weeks}`);
      } catch (e) {
        logTest(category, 'getTrainingWeeks returns valid number', false, e.message);
      }

    } catch (e) {
      logTest(category, 'StorageManager instantiates', false, e.message);
    }
  }

  // ========================================
  // SECTION 3: Phase Manager Tests
  // ========================================
  console.log('\n🎯 TESTING PHASE MANAGER...\n');

  const phaseCategory = 'Phase Manager';
  const PhaseModule = loadedModules['Phase Manager'];

  if (PhaseModule && StorageModule) {
    try {
      const storage = new StorageModule.StorageManager();
      const phaseManager = new PhaseModule.PhaseManager(storage);

      logTest(phaseCategory, 'PhaseManager instantiates', true);

      // Test: getPhase returns valid phase
      const phase = phaseManager.getPhase();
      const validPhase = phase === 'building' || phase === 'maintenance';
      logTest(phaseCategory, 'getPhase returns valid phase', validPhase, `Phase: ${phase}`);

      // Test: getProgressionBehavior returns object
      const behavior = phaseManager.getProgressionBehavior();
      const validBehavior = behavior && typeof behavior === 'object';
      logTest(phaseCategory, 'getProgressionBehavior returns object', validBehavior);

      // Test: getDeloadSensitivity returns valid value
      const sensitivity = phaseManager.getDeloadSensitivity();
      const validSensitivity = ['normal', 'high', 'very_high'].includes(sensitivity);
      logTest(phaseCategory, 'getDeloadSensitivity returns valid value', validSensitivity, `Sensitivity: ${sensitivity}`);

      // Test: getUnlockPriority returns valid value
      const priority = phaseManager.getUnlockPriority();
      const validPriority = ['all', 'bodyweight_priority'].includes(priority);
      logTest(phaseCategory, 'getUnlockPriority returns valid value', validPriority, `Priority: ${priority}`);

    } catch (e) {
      logTest(phaseCategory, 'PhaseManager instantiates', false, e.message);
    }
  }

  // ========================================
  // SECTION 4: Deload Manager Tests
  // ========================================
  console.log('\n⏸️ TESTING DELOAD MANAGER...\n');

  const deloadCategory = 'Deload Manager';
  const DeloadModule = loadedModules['Deload Manager'];

  if (DeloadModule && PhaseModule && StorageModule) {
    try {
      const storage = new StorageModule.StorageManager();
      const phaseManager = new PhaseModule.PhaseManager(storage);
      const deloadManager = new DeloadModule.DeloadManager(phaseManager, storage);

      logTest(deloadCategory, 'DeloadManager instantiates', true);

      // Test: calculateWeeksSinceDeload handles null
      const weeksNull = deloadManager.calculateWeeksSinceDeload(null);
      logTest(deloadCategory, 'calculateWeeksSinceDeload(null) returns 0', weeksNull === 0, `Returned: ${weeksNull}`);

      // Test: shouldTriggerDeload returns boolean
      const shouldDeload = deloadManager.shouldTriggerDeload();
      const validBool = typeof shouldDeload === 'boolean';
      logTest(deloadCategory, 'shouldTriggerDeload returns boolean', validBool, `Returned: ${shouldDeload}`);

    } catch (e) {
      logTest(deloadCategory, 'DeloadManager instantiates', false, e.message);
    }
  }

  // ========================================
  // SECTION 5: Performance Analyzer Tests
  // ========================================
  console.log('\n📊 TESTING PERFORMANCE ANALYZER...\n');

  const perfCategory = 'Performance Analyzer';
  const PerfModule = loadedModules['Performance Analyzer'];

  if (PerfModule && StorageModule) {
    try {
      const storage = new StorageModule.StorageManager();
      const analyzer = new PerfModule.PerformanceAnalyzer(storage);

      logTest(perfCategory, 'PerformanceAnalyzer instantiates', true);

      // Test: detectWeightRegression handles missing history
      const regression = analyzer.detectWeightRegression('NonExistentExercise', 20);
      const safeResult = regression === null || typeof regression === 'object';
      logTest(perfCategory, 'detectWeightRegression handles missing history', safeResult);

      // Test: detectRepDrop handles missing history
      const repDrop = analyzer.detectRepDrop('NonExistentExercise', []);
      const safeRepDrop = repDrop === null || typeof repDrop === 'object';
      logTest(perfCategory, 'detectRepDrop handles missing history', safeRepDrop);

    } catch (e) {
      logTest(perfCategory, 'PerformanceAnalyzer instantiates', false, e.message);
    }
  }

  // ========================================
  // SECTION 6: Unlock Evaluator Tests
  // ========================================
  console.log('\n🔓 TESTING UNLOCK EVALUATOR...\n');

  const unlockCategory = 'Unlock Evaluator';
  const UnlockModule = loadedModules['Unlock Evaluator'];

  if (UnlockModule && StorageModule && PhaseModule) {
    try {
      const storage = new StorageModule.StorageManager();
      const phaseManager = new PhaseModule.PhaseManager(storage);
      const evaluator = new UnlockModule.UnlockEvaluator(storage, phaseManager);

      logTest(unlockCategory, 'UnlockEvaluator instantiates', true);

      // Test: evaluateUnlock handles non-existent exercise
      const result = evaluator.evaluateUnlock('NonExistentExercise');
      const validResult = result !== null && typeof result === 'object';
      logTest(unlockCategory, 'evaluateUnlock handles non-existent exercise', validResult);

      // Test: evaluateUnlockWithPhasePriority handles valid inputs
      try {
        const priorityResult = evaluator.evaluateUnlockWithPhasePriority('DB Flat Bench Press', 'DB Flat Bench Press');
        const validPriority = priorityResult && typeof priorityResult.priority === 'number';
        logTest(unlockCategory, 'evaluateUnlockWithPhasePriority returns priority', validPriority);
      } catch (e) {
        logTest(unlockCategory, 'evaluateUnlockWithPhasePriority returns priority', false, e.message);
      }

    } catch (e) {
      logTest(unlockCategory, 'UnlockEvaluator instantiates', false, e.message);
    }
  }

  // ========================================
  // SECTION 7: Complexity Tiers Tests
  // ========================================
  console.log('\n🎚️ TESTING COMPLEXITY TIERS...\n');

  const tierCategory = 'Complexity Tiers';
  const TierModule = loadedModules['Complexity Tiers'];

  if (TierModule) {
    // Test: Has COMPLEXITY_TIERS object
    const hasTiers = TierModule.COMPLEXITY_TIERS !== undefined;
    logTest(tierCategory, 'Has COMPLEXITY_TIERS object', hasTiers);

    if (hasTiers) {
      // Test: Has required tier levels
      const levels = ['SIMPLE', 'MODERATE', 'COMPLEX'];
      levels.forEach(level => {
        const hasLevel = TierModule.COMPLEXITY_TIERS[level] !== undefined;
        logTest(tierCategory, `Has tier level: ${level}`, hasLevel);
      });
    }

    // Test: Has EXERCISE_COMPLEXITY mapping
    const hasMapping = TierModule.EXERCISE_COMPLEXITY !== undefined;
    logTest(tierCategory, 'Has EXERCISE_COMPLEXITY mapping', hasMapping);

    if (hasMapping) {
      const exerciseCount = Object.keys(TierModule.EXERCISE_COMPLEXITY).length;
      const reasonableCount = exerciseCount >= 20;
      logTest(tierCategory, 'Has reasonable number of exercises mapped', reasonableCount, `Count: ${exerciseCount}`);
    }
  }

  // ========================================
  // SECTION 8: Equipment Profiles Tests
  // ========================================
  console.log('\n🛠️ TESTING EQUIPMENT PROFILES...\n');

  const equipCategory = 'Equipment Profiles';
  const EquipModule = loadedModules['Equipment Profiles'];

  if (EquipModule) {
    // Test: Has EQUIPMENT_REQUIREMENTS
    const hasReqs = EquipModule.EQUIPMENT_REQUIREMENTS !== undefined;
    logTest(equipCategory, 'Has EQUIPMENT_REQUIREMENTS object', hasReqs);

    if (hasReqs) {
      const exerciseCount = Object.keys(EquipModule.EQUIPMENT_REQUIREMENTS).length;
      const reasonableCount = exerciseCount >= 20;
      logTest(equipCategory, 'Has reasonable number of exercises', reasonableCount, `Count: ${exerciseCount}`);

      // Test: All equipment requirements are arrays
      let invalidEntries = 0;
      Object.values(EquipModule.EQUIPMENT_REQUIREMENTS).forEach(reqs => {
        if (!Array.isArray(reqs)) invalidEntries++;
      });
      logTest(equipCategory, 'All equipment requirements are arrays', invalidEntries === 0, invalidEntries === 0 ? '' : `${invalidEntries} invalid entries`);
    }
  }

  // ========================================
  // SECTION 9: Form Cues Tests
  // ========================================
  console.log('\n📋 TESTING FORM CUES...\n');

  const formCategory = 'Form Cues';
  const FormModule = loadedModules['Form Cues'];

  if (FormModule) {
    // Test: Has FORM_CUES object
    const hasCues = FormModule.FORM_CUES !== undefined;
    logTest(formCategory, 'Has FORM_CUES object', hasCues);

    if (hasCues) {
      const exerciseCount = Object.keys(FormModule.FORM_CUES).length;
      const reasonableCount = exerciseCount >= 20;
      logTest(formCategory, 'Has reasonable number of exercises', reasonableCount, `Count: ${exerciseCount}`);

      // Test: All form cues have required sections
      let incomplete = 0;
      Object.entries(FormModule.FORM_CUES).forEach(([name, cues]) => {
        if (!cues.setup || !cues.execution || !cues.mistakes) {
          incomplete++;
        }
      });
      logTest(formCategory, 'All form cues have setup/execution/mistakes', incomplete === 0, incomplete === 0 ? '' : `${incomplete} incomplete cues`);
    }
  }

  // ========================================
  // SECTION 10: Workouts Module Tests
  // ========================================
  console.log('\n🏋️ TESTING WORKOUTS MODULE...\n');

  const workoutCategory = 'Workouts Module';
  const WorkoutModule = loadedModules['Workouts'];

  if (WorkoutModule) {
    // Test: Has getWorkout function
    const hasGetWorkout = typeof WorkoutModule.getWorkout === 'function';
    logTest(workoutCategory, 'Has getWorkout function', hasGetWorkout);

    // Test: Has getAllWorkouts function
    const hasGetAll = typeof WorkoutModule.getAllWorkouts === 'function';
    logTest(workoutCategory, 'Has getAllWorkouts function', hasGetAll);

    if (hasGetAll) {
      const allWorkouts = WorkoutModule.getAllWorkouts();
      const hasWorkouts = Array.isArray(allWorkouts) && allWorkouts.length > 0;
      logTest(workoutCategory, 'getAllWorkouts returns workouts', hasWorkouts, `Count: ${allWorkouts.length}`);

      // Test: All workouts have required properties
      let invalidWorkouts = 0;
      allWorkouts.forEach(workout => {
        if (!workout.name || !workout.displayName || !workout.exercises) {
          invalidWorkouts++;
        }
      });
      logTest(workoutCategory, 'All workouts have required properties', invalidWorkouts === 0, invalidWorkouts === 0 ? '' : `${invalidWorkouts} invalid workouts`);
    }

    // Test: Has getWorkoutWithSelections function
    const hasWithSelections = typeof WorkoutModule.getWorkoutWithSelections === 'function';
    logTest(workoutCategory, 'Has getWorkoutWithSelections function', hasWithSelections);
  }

  // ========================================
  // SECTION 11: App Integration Tests
  // ========================================
  console.log('\n🔗 TESTING APP INTEGRATION...\n');

  const appCategory = 'App Integration';

  // Test: window.app exists
  const hasApp = window.app !== undefined;
  logTest(appCategory, 'window.app instance exists', hasApp);

  if (hasApp) {
    // Test: app has storage
    const hasStorage = window.app.storage !== undefined;
    logTest(appCategory, 'app.storage exists', hasStorage);

    // Test: app has phaseManager
    const hasPhaseManager = window.app.phaseManager !== undefined;
    logTest(appCategory, 'app.phaseManager exists', hasPhaseManager);

    // Test: app has deloadManager
    const hasDeloadManager = window.app.deloadManager !== undefined;
    logTest(appCategory, 'app.deloadManager exists', hasDeloadManager);

    // Test: app has unlockEvaluator
    const hasUnlockEval = window.app.unlockEvaluator !== undefined;
    logTest(appCategory, 'app.unlockEvaluator exists', hasUnlockEval);
  }

  // ========================================
  // SECTION 12: Summary
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
      console.log('✨ ALL TESTS PASSED! All feature modules are working correctly.\n');
    } else {
      console.log(`⚠️ ${results.failed} tests failed. Review failures above.\n`);
    }
    console.log(`💡 Tested ${modules.length} modules\n`);
  } // End orchestration check

  // Export results
  window._featureTestResults = results;
  if (!window._TEST_ORCHESTRATED) {
      console.log('💡 Results available at: window._featureTestResults\n');
    }
    })();
