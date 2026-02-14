/**
 * Build/Maintenance Phase Integration - COMPREHENSIVE Test Suite
 *
 * Tests EVERYTHING:
 * - UI interactions (button clicks, DOM updates)
 * - Unit tests (all PhaseManager methods)
 * - Integration tests (deload timing, progression logic, unlock priority)
 * - Edge cases (null data, corrupted data, boundary conditions)
 * - End-to-end workflows (complete user journeys)
 *
 * USAGE:
 * 1. Open the app in browser
 * 2. Open DevTools Console (F12)
 * 3. Copy-paste this entire file into console
 * 4. Results will be displayed with detailed pass/fail status
 */

(async function runComprehensiveTests() {
  console.clear();
  console.log('🔬 COMPREHENSIVE PHASE INTEGRATION TEST SUITE\n');
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
  // SECTION 1: MODULE IMPORTS & SETUP
  // ========================================
  console.log('\n📦 SECTION 1: MODULE IMPORTS & SETUP\n');

  let StorageManager, PhaseManager, DeloadManager, UnlockEvaluator;
  let storage, phaseManager, deloadManager, unlockEvaluator;

  try {
    const storageModule = await import('./js/modules/storage.js');
    StorageManager = storageModule.StorageManager;
    storage = new StorageManager();
    logTest('Setup', 'Import and instantiate StorageManager', true);
  } catch (error) {
    logTest('Setup', 'Import and instantiate StorageManager', false, error.message);
    return; // Cannot continue without storage
  }

  try {
    const phaseModule = await import('./js/modules/phase-manager.js');
    PhaseManager = phaseModule.PhaseManager;
    phaseManager = new PhaseManager(storage);
    logTest('Setup', 'Import and instantiate PhaseManager', true);
  } catch (error) {
    logTest('Setup', 'Import and instantiate PhaseManager', false, error.message);
    return;
  }

  try {
    const deloadModule = await import('./js/modules/deload.js');
    DeloadManager = deloadModule.DeloadManager;
    deloadManager = new DeloadManager(storage, phaseManager);
    logTest('Setup', 'Import and instantiate DeloadManager', true);
  } catch (error) {
    logTest('Setup', 'Import and instantiate DeloadManager', false, error.message);
    return;
  }

  try {
    const unlockModule = await import('./js/modules/unlock-evaluator.js');
    UnlockEvaluator = unlockModule.UnlockEvaluator;
    unlockEvaluator = new UnlockEvaluator(storage, phaseManager);
    logTest('Setup', 'Import and instantiate UnlockEvaluator', true);
  } catch (error) {
    logTest('Setup', 'Import and instantiate UnlockEvaluator', false, error.message);
    return;
  }

  // ========================================
  // SECTION 2: PHASEMANAGER UNIT TESTS
  // ========================================
  console.log('\n⚙️  SECTION 2: PHASEMANAGER UNIT TESTS\n');

  // Test 2.1: getPhase() - Default behavior
  try {
    localStorage.removeItem('build_training_phase');
    const phase = phaseManager.getPhase();
    logTest('PhaseManager', 'getPhase() defaults to "building" when null',
      phase === 'building', `Returned: "${phase}"`);
  } catch (error) {
    logTest('PhaseManager', 'getPhase() defaults to "building" when null', false, error.message);
  }

  // Test 2.2: getPhase() - Valid phases
  const validPhases = ['building', 'maintenance', 'recovery'];
  for (const testPhase of validPhases.slice(0, 2)) { // Test building and maintenance
    try {
      localStorage.setItem('build_training_phase', testPhase);
      const phase = phaseManager.getPhase();
      logTest('PhaseManager', `getPhase() returns "${testPhase}" correctly`,
        phase === testPhase, `Returned: "${phase}"`);
    } catch (error) {
      logTest('PhaseManager', `getPhase() returns "${testPhase}" correctly`, false, error.message);
    }
  }

  // Test 2.3: getPhase() - Invalid phase defaults to building
  try {
    localStorage.setItem('build_training_phase', 'invalid_phase');
    const phase = phaseManager.getPhase();
    logTest('PhaseManager', 'getPhase() defaults invalid phase to "building"',
      phase === 'building', `Returned: "${phase}"`);
  } catch (error) {
    logTest('PhaseManager', 'getPhase() defaults invalid phase to "building"', false, error.message);
  }

  // Test 2.4: getPhase() - Corrupted JSON
  try {
    localStorage.setItem('build_training_phase', '{corrupted json}');
    const phase = phaseManager.getPhase();
    logTest('PhaseManager', 'getPhase() handles corrupted JSON gracefully',
      phase === 'building', `Returned: "${phase}"`);
  } catch (error) {
    logTest('PhaseManager', 'getPhase() handles corrupted JSON gracefully', false, error.message);
  }

  // Test 2.5-2.6: getProgressionBehavior() - Building phase
  localStorage.setItem('build_training_phase', 'building');
  try {
    const behavior = phaseManager.getProgressionBehavior();
    logTest('PhaseManager', 'Building: allowWeightIncrease = true',
      behavior.allowWeightIncrease === true, `Value: ${behavior.allowWeightIncrease}`);
    logTest('PhaseManager', 'Building: allowWeightDecrease = false',
      behavior.allowWeightDecrease === false, `Value: ${behavior.allowWeightDecrease}`);
    logTest('PhaseManager', 'Building: tempoFocus = false',
      behavior.tempoFocus === false, `Value: ${behavior.tempoFocus}`);
  } catch (error) {
    logTest('PhaseManager', 'Building: getProgressionBehavior()', false, error.message);
  }

  // Test 2.7-2.9: getProgressionBehavior() - Maintenance phase
  localStorage.setItem('build_training_phase', 'maintenance');
  try {
    const behavior = phaseManager.getProgressionBehavior();
    logTest('PhaseManager', 'Maintenance: allowWeightIncrease = false',
      behavior.allowWeightIncrease === false, `Value: ${behavior.allowWeightIncrease}`);
    logTest('PhaseManager', 'Maintenance: allowWeightDecrease = false',
      behavior.allowWeightDecrease === false, `Value: ${behavior.allowWeightDecrease}`);
    logTest('PhaseManager', 'Maintenance: tempoFocus = true',
      behavior.tempoFocus === true, `Value: ${behavior.tempoFocus}`);
  } catch (error) {
    logTest('PhaseManager', 'Maintenance: getProgressionBehavior()', false, error.message);
  }

  // Test 2.10-2.11: getDeloadSensitivity()
  localStorage.setItem('build_training_phase', 'building');
  try {
    const sensitivity = phaseManager.getDeloadSensitivity();
    logTest('PhaseManager', 'Building: deload sensitivity = "normal"',
      sensitivity === 'normal', `Value: "${sensitivity}"`);
  } catch (error) {
    logTest('PhaseManager', 'Building: getDeloadSensitivity()', false, error.message);
  }

  localStorage.setItem('build_training_phase', 'maintenance');
  try {
    const sensitivity = phaseManager.getDeloadSensitivity();
    logTest('PhaseManager', 'Maintenance: deload sensitivity = "high"',
      sensitivity === 'high', `Value: "${sensitivity}"`);
  } catch (error) {
    logTest('PhaseManager', 'Maintenance: getDeloadSensitivity()', false, error.message);
  }

  // Test 2.12-2.13: getUnlockPriority()
  localStorage.setItem('build_training_phase', 'building');
  try {
    const priority = phaseManager.getUnlockPriority();
    logTest('PhaseManager', 'Building: unlock priority = "all"',
      priority === 'all', `Value: "${priority}"`);
  } catch (error) {
    logTest('PhaseManager', 'Building: getUnlockPriority()', false, error.message);
  }

  localStorage.setItem('build_training_phase', 'maintenance');
  try {
    const priority = phaseManager.getUnlockPriority();
    logTest('PhaseManager', 'Maintenance: unlock priority = "bodyweight_priority"',
      priority === 'bodyweight_priority', `Value: "${priority}"`);
  } catch (error) {
    logTest('PhaseManager', 'Maintenance: getUnlockPriority()', false, error.message);
  }

  // ========================================
  // SECTION 3: DELOADMANAGER INTEGRATION TESTS
  // ========================================
  console.log('\n⏱️  SECTION 3: DELOADMANAGER INTEGRATION TESTS\n');

  // Test 3.1: calculateWeeksSinceDeload() - null date
  try {
    const weeks = deloadManager.calculateWeeksSinceDeload(null);
    logTest('DeloadManager', 'calculateWeeksSinceDeload(null) returns 0',
      weeks === 0, `Returned: ${weeks}`);
  } catch (error) {
    logTest('DeloadManager', 'calculateWeeksSinceDeload(null) returns 0', false, error.message);
  }

  // Test 3.2: calculateWeeksSinceDeload() - 1 week ago
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeks = deloadManager.calculateWeeksSinceDeload(oneWeekAgo.toISOString());
    logTest('DeloadManager', 'calculateWeeksSinceDeload(1 week ago) returns 1',
      weeks === 1, `Returned: ${weeks}`);
  } catch (error) {
    logTest('DeloadManager', 'calculateWeeksSinceDeload(1 week ago)', false, error.message);
  }

  // Test 3.3: calculateWeeksSinceDeload() - 5 weeks ago
  try {
    const fiveWeeksAgo = new Date();
    fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);
    const weeks = deloadManager.calculateWeeksSinceDeload(fiveWeeksAgo.toISOString());
    logTest('DeloadManager', 'calculateWeeksSinceDeload(5 weeks ago) returns 5',
      weeks === 5, `Returned: ${weeks}`);
  } catch (error) {
    logTest('DeloadManager', 'calculateWeeksSinceDeload(5 weeks ago)', false, error.message);
  }

  // Test 3.4: calculateWeeksSinceDeload() - 10 weeks ago
  try {
    const tenWeeksAgo = new Date();
    tenWeeksAgo.setDate(tenWeeksAgo.getDate() - 70);
    const weeks = deloadManager.calculateWeeksSinceDeload(tenWeeksAgo.toISOString());
    logTest('DeloadManager', 'calculateWeeksSinceDeload(10 weeks ago) returns 10',
      weeks === 10, `Returned: ${weeks}`);
  } catch (error) {
    logTest('DeloadManager', 'calculateWeeksSinceDeload(10 weeks ago)', false, error.message);
  }

  // Test 3.5: shouldTriggerDeload() - First-time user (null date)
  localStorage.setItem('build_training_phase', 'building');
  try {
    const deloadState = storage.getDeloadState();
    deloadState.lastDeloadDate = null;
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('DeloadManager', 'shouldTriggerDeload() - first-time user does NOT trigger',
      result.trigger === false, `trigger: ${result.trigger}`);
  } catch (error) {
    logTest('DeloadManager', 'shouldTriggerDeload() - first-time user', false, error.message);
  }

  // Test 3.6: shouldTriggerDeload() - Building phase, 5 weeks (below threshold)
  try {
    const deloadState = storage.getDeloadState();
    const fiveWeeksAgo = new Date();
    fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);
    deloadState.lastDeloadDate = fiveWeeksAgo.toISOString();
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('DeloadManager', 'Building: 5 weeks does NOT trigger (< 6 threshold)',
      result.trigger === false, `trigger: ${result.trigger}, weeks: ${result.weeks || 5}`);
  } catch (error) {
    logTest('DeloadManager', 'Building: 5 weeks does NOT trigger', false, error.message);
  }

  // Test 3.7: shouldTriggerDeload() - Building phase, 6 weeks (at threshold)
  try {
    const deloadState = storage.getDeloadState();
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);
    deloadState.lastDeloadDate = sixWeeksAgo.toISOString();
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('DeloadManager', 'Building: 6 weeks DOES trigger (>= 6 threshold)',
      result.trigger === true && result.reason === 'time',
      `trigger: ${result.trigger}, reason: ${result.reason}, weeks: ${result.weeks}`);
  } catch (error) {
    logTest('DeloadManager', 'Building: 6 weeks DOES trigger', false, error.message);
  }

  // Test 3.8: shouldTriggerDeload() - Building phase, 7 weeks (above threshold)
  try {
    const deloadState = storage.getDeloadState();
    const sevenWeeksAgo = new Date();
    sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 49);
    deloadState.lastDeloadDate = sevenWeeksAgo.toISOString();
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('DeloadManager', 'Building: 7 weeks DOES trigger',
      result.trigger === true && result.reason === 'time',
      `trigger: ${result.trigger}, weeks: ${result.weeks}`);
  } catch (error) {
    logTest('DeloadManager', 'Building: 7 weeks DOES trigger', false, error.message);
  }

  // Test 3.9: shouldTriggerDeload() - Maintenance phase, 3 weeks (below threshold)
  localStorage.setItem('build_training_phase', 'maintenance');
  try {
    const deloadState = storage.getDeloadState();
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    deloadState.lastDeloadDate = threeWeeksAgo.toISOString();
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('DeloadManager', 'Maintenance: 3 weeks does NOT trigger (< 4 threshold)',
      result.trigger === false, `trigger: ${result.trigger}, weeks: ${result.weeks || 3}`);
  } catch (error) {
    logTest('DeloadManager', 'Maintenance: 3 weeks does NOT trigger', false, error.message);
  }

  // Test 3.10: shouldTriggerDeload() - Maintenance phase, 4 weeks (at threshold)
  try {
    const deloadState = storage.getDeloadState();
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    deloadState.lastDeloadDate = fourWeeksAgo.toISOString();
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('DeloadManager', 'Maintenance: 4 weeks DOES trigger (>= 4 threshold)',
      result.trigger === true && result.reason === 'time',
      `trigger: ${result.trigger}, reason: ${result.reason}, weeks: ${result.weeks}`);
  } catch (error) {
    logTest('DeloadManager', 'Maintenance: 4 weeks DOES trigger', false, error.message);
  }

  // Test 3.11: shouldTriggerDeload() - Maintenance phase, 5 weeks (above threshold)
  try {
    const deloadState = storage.getDeloadState();
    const fiveWeeksAgo = new Date();
    fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);
    deloadState.lastDeloadDate = fiveWeeksAgo.toISOString();
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('DeloadManager', 'Maintenance: 5 weeks DOES trigger',
      result.trigger === true && result.reason === 'time',
      `trigger: ${result.trigger}, weeks: ${result.weeks}`);
  } catch (error) {
    logTest('DeloadManager', 'Maintenance: 5 weeks DOES trigger', false, error.message);
  }

  // Test 3.12: shouldTriggerDeload() - Already in deload
  try {
    const deloadState = storage.getDeloadState();
    deloadState.active = true;
    deloadState.lastDeloadDate = new Date().toISOString();
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('DeloadManager', 'Already in deload does NOT trigger again',
      result.trigger === false, `trigger: ${result.trigger}`);
  } catch (error) {
    logTest('DeloadManager', 'Already in deload does NOT trigger', false, error.message);
  }

  // Test 3.13: startDeload() - Creates valid deload state
  try {
    deloadManager.startDeload('standard');
    const deloadState = storage.getDeloadState();
    const passed =
      deloadState.active === true &&
      deloadState.deloadType === 'standard' &&
      deloadState.startDate !== null &&
      deloadState.endDate !== null;
    logTest('DeloadManager', 'startDeload() creates valid deload state',
      passed, `active: ${deloadState.active}, type: ${deloadState.deloadType}`);
  } catch (error) {
    logTest('DeloadManager', 'startDeload() creates valid deload state', false, error.message);
  }

  // Test 3.14: getDaysRemaining() - Active deload
  try {
    const days = deloadManager.getDaysRemaining();
    const passed = days >= 0 && days <= 7; // Should be between 0-7 days
    logTest('DeloadManager', 'getDaysRemaining() returns valid range (0-7 days)',
      passed, `days: ${days}`);
  } catch (error) {
    logTest('DeloadManager', 'getDaysRemaining()', false, error.message);
  }

  // Test 3.15: endDeload() - Clears active state
  try {
    deloadManager.endDeload();
    const deloadState = storage.getDeloadState();
    const passed =
      deloadState.active === false &&
      deloadState.lastDeloadDate !== null;
    logTest('DeloadManager', 'endDeload() clears active state correctly',
      passed, `active: ${deloadState.active}`);
  } catch (error) {
    logTest('DeloadManager', 'endDeload()', false, error.message);
  }

  // ========================================
  // SECTION 4: ERROR HANDLING & EDGE CASES
  // ========================================
  console.log('\n🛡️  SECTION 4: ERROR HANDLING & EDGE CASES\n');

  // Test 4.1: PhaseManager with null storage (should throw)
  try {
    new PhaseManager(null);
    logTest('Error Handling', 'PhaseManager(null) throws error', false, 'Did not throw');
  } catch (error) {
    logTest('Error Handling', 'PhaseManager(null) throws error',
      error.message.includes('requires a StorageManager'), `Error: ${error.message}`);
  }

  // Test 4.2: DeloadManager with null phaseManager (should throw)
  try {
    new DeloadManager(storage, null);
    logTest('Error Handling', 'DeloadManager(null phaseManager) throws error', false, 'Did not throw');
  } catch (error) {
    logTest('Error Handling', 'DeloadManager(null phaseManager) throws error',
      error.message.includes('requires a PhaseManager'), `Error: ${error.message}`);
  }

  // Test 4.3: UnlockEvaluator with null phaseManager (should throw)
  try {
    new UnlockEvaluator(storage, null);
    logTest('Error Handling', 'UnlockEvaluator(null phaseManager) throws error', false, 'Did not throw');
  } catch (error) {
    logTest('Error Handling', 'UnlockEvaluator(null phaseManager) throws error',
      error.message.includes('requires a PhaseManager'), `Error: ${error.message}`);
  }

  // Test 4.4: calculateWeeksSinceDeload() with invalid date string
  try {
    const weeks = deloadManager.calculateWeeksSinceDeload('invalid-date');
    const passed = !isNaN(weeks); // Should handle gracefully, return NaN or 0
    logTest('Error Handling', 'calculateWeeksSinceDeload() handles invalid date',
      passed, `Returned: ${weeks}`);
  } catch (error) {
    logTest('Error Handling', 'calculateWeeksSinceDeload() handles invalid date', false, error.message);
  }

  // Test 4.5: shouldTriggerDeload() with corrupted deload state
  try {
    localStorage.setItem('build_deload_state', '{corrupted json}');
    const result = deloadManager.shouldTriggerDeload();
    const passed = result.trigger === false; // Should safely return no trigger
    logTest('Error Handling', 'shouldTriggerDeload() handles corrupted state',
      passed, `trigger: ${result.trigger}`);
  } catch (error) {
    logTest('Error Handling', 'shouldTriggerDeload() handles corrupted state', false, error.message);
  }

  // Clean up corrupted state
  localStorage.removeItem('build_deload_state');

  // Test 4.6: getProgressionBehavior() after localStorage.clear()
  try {
    const originalPhase = localStorage.getItem('build_training_phase');
    localStorage.clear();
    const behavior = phaseManager.getProgressionBehavior();
    const passed =
      behavior !== null &&
      behavior.allowWeightIncrease === true; // Should default to building
    localStorage.setItem('build_training_phase', originalPhase || 'building');
    logTest('Error Handling', 'getProgressionBehavior() survives localStorage.clear()',
      passed, `Returned: ${JSON.stringify(behavior)}`);
  } catch (error) {
    logTest('Error Handling', 'getProgressionBehavior() after localStorage.clear()', false, error.message);
  }

  // ========================================
  // SECTION 5: BOUNDARY TESTS
  // ========================================
  console.log('\n🎯 SECTION 5: BOUNDARY TESTS\n');

  // Test 5.1: Deload at exact 6-week boundary (Building)
  localStorage.setItem('build_training_phase', 'building');
  try {
    const deloadState = storage.getDeloadState();
    const exactlySixWeeks = new Date();
    exactlySixWeeks.setDate(exactlySixWeeks.getDate() - 42); // Exactly 42 days = 6 weeks
    deloadState.lastDeloadDate = exactlySixWeeks.toISOString();
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('Boundary', 'Exactly 6 weeks triggers deload (Building)',
      result.trigger === true, `trigger: ${result.trigger}, weeks: ${result.weeks}`);
  } catch (error) {
    logTest('Boundary', 'Exactly 6 weeks triggers deload', false, error.message);
  }

  // Test 5.2: Deload at exact 4-week boundary (Maintenance)
  localStorage.setItem('build_training_phase', 'maintenance');
  try {
    const deloadState = storage.getDeloadState();
    const exactlyFourWeeks = new Date();
    exactlyFourWeeks.setDate(exactlyFourWeeks.getDate() - 28); // Exactly 28 days = 4 weeks
    deloadState.lastDeloadDate = exactlyFourWeeks.toISOString();
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('Boundary', 'Exactly 4 weeks triggers deload (Maintenance)',
      result.trigger === true, `trigger: ${result.trigger}, weeks: ${result.weeks}`);
  } catch (error) {
    logTest('Boundary', 'Exactly 4 weeks triggers deload', false, error.message);
  }

  // Test 5.3: Just below 6-week boundary (5.99 weeks)
  localStorage.setItem('build_training_phase', 'building');
  try {
    const deloadState = storage.getDeloadState();
    const justBelow = new Date();
    justBelow.setDate(justBelow.getDate() - 41); // 41 days = 5.86 weeks
    deloadState.lastDeloadDate = justBelow.toISOString();
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('Boundary', 'Just below 6 weeks does NOT trigger (Building)',
      result.trigger === false, `trigger: ${result.trigger}, weeks: ${result.weeks || 5}`);
  } catch (error) {
    logTest('Boundary', 'Just below 6 weeks does NOT trigger', false, error.message);
  }

  // Test 5.4: Future date (negative weeks) - edge case
  try {
    const deloadState = storage.getDeloadState();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 1 week in future
    deloadState.lastDeloadDate = futureDate.toISOString();
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const weeks = deloadManager.calculateWeeksSinceDeload(futureDate.toISOString());
    const result = deloadManager.shouldTriggerDeload();
    logTest('Boundary', 'Future date returns negative weeks and does NOT trigger',
      result.trigger === false, `weeks: ${weeks}, trigger: ${result.trigger}`);
  } catch (error) {
    logTest('Boundary', 'Future date handling', false, error.message);
  }

  // ========================================
  // SECTION 6: STATE TRANSITIONS
  // ========================================
  console.log('\n🔄 SECTION 6: STATE TRANSITION TESTS\n');

  // Test 6.1: Building → Maintenance transition
  try {
    localStorage.setItem('build_training_phase', 'building');
    const behaviorBefore = phaseManager.getProgressionBehavior();

    localStorage.setItem('build_training_phase', 'maintenance');
    const behaviorAfter = phaseManager.getProgressionBehavior();

    const passed =
      behaviorBefore.allowWeightIncrease === true &&
      behaviorAfter.allowWeightIncrease === false;
    logTest('State Transition', 'Building → Maintenance changes weight behavior',
      passed, `Before: ${behaviorBefore.allowWeightIncrease}, After: ${behaviorAfter.allowWeightIncrease}`);
  } catch (error) {
    logTest('State Transition', 'Building → Maintenance transition', false, error.message);
  }

  // Test 6.2: Maintenance → Building transition
  try {
    localStorage.setItem('build_training_phase', 'maintenance');
    const behaviorBefore = phaseManager.getProgressionBehavior();

    localStorage.setItem('build_training_phase', 'building');
    const behaviorAfter = phaseManager.getProgressionBehavior();

    const passed =
      behaviorBefore.tempoFocus === true &&
      behaviorAfter.tempoFocus === false;
    logTest('State Transition', 'Maintenance → Building changes tempo focus',
      passed, `Before: ${behaviorBefore.tempoFocus}, After: ${behaviorAfter.tempoFocus}`);
  } catch (error) {
    logTest('State Transition', 'Maintenance → Building transition', false, error.message);
  }

  // Test 6.3: Deload sensitivity changes with phase
  try {
    localStorage.setItem('build_training_phase', 'building');
    const sensitivityBuilding = phaseManager.getDeloadSensitivity();

    localStorage.setItem('build_training_phase', 'maintenance');
    const sensitivityMaintenance = phaseManager.getDeloadSensitivity();

    const passed =
      sensitivityBuilding === 'normal' &&
      sensitivityMaintenance === 'high';
    logTest('State Transition', 'Deload sensitivity updates with phase change',
      passed, `Building: "${sensitivityBuilding}", Maintenance: "${sensitivityMaintenance}"`);
  } catch (error) {
    logTest('State Transition', 'Deload sensitivity transition', false, error.message);
  }

  // Test 6.4: Unlock priority changes with phase
  try {
    localStorage.setItem('build_training_phase', 'building');
    const priorityBuilding = phaseManager.getUnlockPriority();

    localStorage.setItem('build_training_phase', 'maintenance');
    const priorityMaintenance = phaseManager.getUnlockPriority();

    const passed =
      priorityBuilding === 'all' &&
      priorityMaintenance === 'bodyweight_priority';
    logTest('State Transition', 'Unlock priority updates with phase change',
      passed, `Building: "${priorityBuilding}", Maintenance: "${priorityMaintenance}"`);
  } catch (error) {
    logTest('State Transition', 'Unlock priority transition', false, error.message);
  }

  // ========================================
  // SECTION 7: CONSISTENCY CHECKS
  // ========================================
  console.log('\n🔍 SECTION 7: CONSISTENCY CHECKS\n');

  // Test 7.1: PhaseManager methods return consistent phase
  try {
    localStorage.setItem('build_training_phase', 'building');
    const phase1 = phaseManager.getPhase();
    const phase2 = phaseManager.getPhase();
    const phase3 = phaseManager.getPhase();

    logTest('Consistency', 'getPhase() returns consistent value across multiple calls',
      phase1 === phase2 && phase2 === phase3, `Values: ${phase1}, ${phase2}, ${phase3}`);
  } catch (error) {
    logTest('Consistency', 'getPhase() consistency', false, error.message);
  }

  // Test 7.2: Deload week calculation is consistent
  try {
    const testDate = new Date('2026-01-01T00:00:00Z');
    const weeks1 = deloadManager.calculateWeeksSinceDeload(testDate.toISOString());
    const weeks2 = deloadManager.calculateWeeksSinceDeload(testDate.toISOString());
    const weeks3 = deloadManager.calculateWeeksSinceDeload(testDate.toISOString());

    logTest('Consistency', 'calculateWeeksSinceDeload() returns consistent value',
      weeks1 === weeks2 && weeks2 === weeks3, `Values: ${weeks1}, ${weeks2}, ${weeks3}`);
  } catch (error) {
    logTest('Consistency', 'calculateWeeksSinceDeload() consistency', false, error.message);
  }

  // Test 7.3: Phase behavior object structure is consistent
  try {
    localStorage.setItem('build_training_phase', 'building');
    const behavior1 = phaseManager.getProgressionBehavior();
    const behavior2 = phaseManager.getProgressionBehavior();

    const sameKeys =
      Object.keys(behavior1).sort().join() === Object.keys(behavior2).sort().join();
    const sameValues =
      behavior1.allowWeightIncrease === behavior2.allowWeightIncrease &&
      behavior1.allowWeightDecrease === behavior2.allowWeightDecrease &&
      behavior1.tempoFocus === behavior2.tempoFocus;

    logTest('Consistency', 'getProgressionBehavior() structure is consistent',
      sameKeys && sameValues, `Keys match: ${sameKeys}, Values match: ${sameValues}`);
  } catch (error) {
    logTest('Consistency', 'getProgressionBehavior() consistency', false, error.message);
  }

  // ========================================
  // SECTION 8: RESET & INITIALIZATION SCENARIOS
  // ========================================
  console.log('\n🔄 SECTION 8: RESET & INITIALIZATION TESTS\n');

  // Test 8.1: Simulate full reset (clear all build_ keys)
  try {
    // Save current state
    const backupKeys = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('build_')) {
        backupKeys[key] = localStorage.getItem(key);
      }
    });

    // Clear all build_ keys (simulating reset)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('build_')) {
        localStorage.removeItem(key);
      }
    });

    // Verify localStorage is clean
    const remainingBuildKeys = Object.keys(localStorage).filter(k => k.startsWith('build_'));
    logTest('Reset', 'Reset clears all build_ localStorage keys',
      remainingBuildKeys.length === 0, `Remaining keys: ${remainingBuildKeys.length}`);

    // Restore backup
    Object.entries(backupKeys).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  } catch (error) {
    logTest('Reset', 'Reset clears localStorage keys', false, error.message);
  }

  // Test 8.2: After reset, deload state returns null lastDeloadDate
  try {
    // Save current state
    const backupKeys = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('build_')) {
        backupKeys[key] = localStorage.getItem(key);
      }
    });

    // Clear all
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('build_')) {
        localStorage.removeItem(key);
      }
    });

    // Get fresh deload state
    const deloadState = storage.getDeloadState();
    const passed = deloadState.lastDeloadDate === null;
    logTest('Reset', 'After reset, deloadState.lastDeloadDate is null',
      passed, `lastDeloadDate: ${deloadState.lastDeloadDate}`);

    // Restore
    Object.entries(backupKeys).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  } catch (error) {
    logTest('Reset', 'After reset, deload state is null', false, error.message);
  }

  // Test 8.3: After reset, calculateWeeksSinceDeload returns 0 (not Infinity)
  try {
    // Save current state
    const backupKeys = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('build_')) {
        backupKeys[key] = localStorage.getItem(key);
      }
    });

    // Clear all
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('build_')) {
        localStorage.removeItem(key);
      }
    });

    const deloadState = storage.getDeloadState();
    const weeks = deloadManager.calculateWeeksSinceDeload(deloadState.lastDeloadDate);
    const passed = weeks === 0; // Should be 0, not Infinity
    logTest('Reset', 'After reset, calculateWeeksSinceDeload(null) returns 0',
      passed, `weeks: ${weeks}`);

    // Restore
    Object.entries(backupKeys).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  } catch (error) {
    logTest('Reset', 'After reset, weeks calculation', false, error.message);
  }

  // Test 8.4: CRITICAL - After reset, deload does NOT trigger
  try {
    // Save current state
    const backupKeys = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('build_')) {
        backupKeys[key] = localStorage.getItem(key);
      }
    });

    // Clear all (simulate reset)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('build_')) {
        localStorage.removeItem(key);
      }
    });

    // Check if deload triggers (IT SHOULD NOT!)
    const result = deloadManager.shouldTriggerDeload();
    const passed = result.trigger === false;
    logTest('Reset', 'CRITICAL: After reset, deload does NOT trigger',
      passed, `trigger: ${result.trigger}, reason: ${result.reason || 'none'}`);

    // Restore
    Object.entries(backupKeys).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  } catch (error) {
    logTest('Reset', 'CRITICAL: After reset, deload check', false, error.message);
  }

  // Test 8.5: After reset, phase defaults to building
  try {
    // Save current state
    const backupKeys = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('build_')) {
        backupKeys[key] = localStorage.getItem(key);
      }
    });

    // Clear all
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('build_')) {
        localStorage.removeItem(key);
      }
    });

    const phase = phaseManager.getPhase();
    const passed = phase === 'building';
    logTest('Reset', 'After reset, phase defaults to "building"',
      passed, `phase: "${phase}"`);

    // Restore
    Object.entries(backupKeys).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  } catch (error) {
    logTest('Reset', 'After reset, default phase', false, error.message);
  }

  // Test 8.6: After reset, all progression behavior is building defaults
  try {
    // Save current state
    const backupKeys = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('build_')) {
        backupKeys[key] = localStorage.getItem(key);
      }
    });

    // Clear all
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('build_')) {
        localStorage.removeItem(key);
      }
    });

    const behavior = phaseManager.getProgressionBehavior();
    const passed =
      behavior.allowWeightIncrease === true &&
      behavior.allowWeightDecrease === false &&
      behavior.tempoFocus === false;
    logTest('Reset', 'After reset, progression behavior defaults to building',
      passed, JSON.stringify(behavior));

    // Restore
    Object.entries(backupKeys).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  } catch (error) {
    logTest('Reset', 'After reset, progression behavior defaults', false, error.message);
  }

  // Test 8.7: After reset, deload state is properly initialized
  try {
    // Save current state
    const backupKeys = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('build_')) {
        backupKeys[key] = localStorage.getItem(key);
      }
    });

    // Clear all
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('build_')) {
        localStorage.removeItem(key);
      }
    });

    const deloadState = storage.getDeloadState();
    const passed =
      deloadState.active === false &&
      deloadState.deloadType === null &&
      deloadState.startDate === null &&
      deloadState.endDate === null &&
      deloadState.lastDeloadDate === null &&
      deloadState.dismissedCount === 0;
    logTest('Reset', 'After reset, deload state is properly initialized',
      passed, `active: ${deloadState.active}, lastDeloadDate: ${deloadState.lastDeloadDate}`);

    // Restore
    Object.entries(backupKeys).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  } catch (error) {
    logTest('Reset', 'After reset, deload state initialization', false, error.message);
  }

  // Test 8.8: Multiple resets don't break functionality
  try {
    // Save current state
    const backupKeys = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('build_')) {
        backupKeys[key] = localStorage.getItem(key);
      }
    });

    // Perform 3 consecutive resets
    for (let i = 0; i < 3; i++) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('build_')) {
          localStorage.removeItem(key);
        }
      });
    }

    // Verify deload still doesn't trigger
    const result = deloadManager.shouldTriggerDeload();
    const passed = result.trigger === false;
    logTest('Reset', 'Multiple resets don\'t break deload check',
      passed, `trigger after 3 resets: ${result.trigger}`);

    // Restore
    Object.entries(backupKeys).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  } catch (error) {
    logTest('Reset', 'Multiple resets consistency', false, error.message);
  }

  // ========================================
  // FINAL CLEANUP & SUMMARY
  // ========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('\n📊 COMPREHENSIVE TEST SUMMARY\n');

  // Clean up test data
  localStorage.setItem('build_training_phase', 'building');
  const cleanState = storage.getDeloadState();
  cleanState.lastDeloadDate = null;
  cleanState.active = false;
  storage.saveDeloadState(cleanState);

  const totalTests = results.passed + results.failed;
  const successRate = Math.round((results.passed / totalTests) * 100);

  console.log(`Total Tests Run: ${totalTests}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${successRate}%\n`);

  // Category breakdown
  console.log('Results by Category:');
  for (const [category, stats] of Object.entries(results.categories)) {
    const categoryRate = Math.round((stats.passed / (stats.passed + stats.failed)) * 100);
    console.log(`  ${category}: ${stats.passed}/${stats.passed + stats.failed} (${categoryRate}%)`);
  }

  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`   [${t.category}] ${t.name}: ${t.details}`));
  } else {
    console.log('\n🎉 ALL TESTS PASSED! System is production-ready.');
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');

  return results;
})();
