/**
 * Build/Maintenance Phase Integration - Automated Test Suite (FIXED)
 *
 * USAGE:
 * 1. Open the app in browser
 * 2. Open DevTools Console (F12)
 * 3. Copy-paste this entire file into console
 * 4. Results will be displayed with ✅ Pass / ❌ Fail
 */

(async function runPhaseIntegrationTests() {
  console.clear();
  console.log('🧪 BUILD/MAINTENANCE PHASE INTEGRATION - TEST SUITE\n');
  console.log('═══════════════════════════════════════════════════\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function logTest(name, passed, details = '') {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${icon} ${status}: ${name}`);
    if (details) console.log(`   ${details}`);

    results.tests.push({ name, passed, details });
    if (passed) results.passed++;
    else results.failed++;
  }

  // ========================================
  // TEST 1: Module Imports
  // ========================================
  console.log('\n📦 MODULE IMPORT TESTS\n');

  let StorageManager, PhaseManager, DeloadManager, UnlockEvaluator;
  let storage, phaseManager, deloadManager, unlockEvaluator;

  try {
    const storageModule = await import('./js/modules/storage.js');
    StorageManager = storageModule.StorageManager;
    logTest('Import StorageManager', true);
  } catch (error) {
    logTest('Import StorageManager', false, error.message);
  }

  try {
    const phaseModule = await import('./js/modules/phase-manager.js');
    PhaseManager = phaseModule.PhaseManager;
    logTest('Import PhaseManager', true);
  } catch (error) {
    logTest('Import PhaseManager', false, error.message);
  }

  try {
    const deloadModule = await import('./js/modules/deload.js');
    DeloadManager = deloadModule.DeloadManager;
    logTest('Import DeloadManager', true);
  } catch (error) {
    logTest('Import DeloadManager', false, error.message);
  }

  try {
    const unlockModule = await import('./js/modules/unlock-evaluator.js');
    UnlockEvaluator = unlockModule.UnlockEvaluator;
    logTest('Import UnlockEvaluator', true);
  } catch (error) {
    logTest('Import UnlockEvaluator', false, error.message);
  }

  // ========================================
  // TEST 2: Module Instantiation
  // ========================================
  console.log('\n🏗️  MODULE INSTANTIATION TESTS\n');

  try {
    storage = new StorageManager();
    logTest('Instantiate StorageManager', true);
  } catch (error) {
    logTest('Instantiate StorageManager', false, error.message);
  }

  try {
    phaseManager = new PhaseManager(storage);
    logTest('Instantiate PhaseManager', true);
  } catch (error) {
    logTest('Instantiate PhaseManager', false, error.message);
  }

  try {
    deloadManager = new DeloadManager(storage, phaseManager);
    logTest('Instantiate DeloadManager with PhaseManager', true);
  } catch (error) {
    logTest('Instantiate DeloadManager with PhaseManager', false, error.message);
  }

  try {
    unlockEvaluator = new UnlockEvaluator(storage, phaseManager);
    logTest('Instantiate UnlockEvaluator with PhaseManager', true);
  } catch (error) {
    logTest('Instantiate UnlockEvaluator with PhaseManager', false, error.message);
  }

  // ========================================
  // TEST 3: PhaseManager API
  // ========================================
  console.log('\n⚙️  PHASEMANAGER API TESTS\n');

  try {
    const phase = phaseManager.getPhase();
    const validPhases = ['building', 'maintenance'];
    const passed = validPhases.includes(phase);
    logTest('getPhase() returns valid phase', passed, `Phase: "${phase}"`);
  } catch (error) {
    logTest('getPhase() returns valid phase', false, error.message);
  }

  try {
    const behavior = phaseManager.getProgressionBehavior();
    const hasRequiredKeys =
      'allowWeightIncrease' in behavior &&
      'allowWeightDecrease' in behavior &&
      'tempoFocus' in behavior;
    logTest('getProgressionBehavior() returns valid object', hasRequiredKeys,
      JSON.stringify(behavior, null, 2));
  } catch (error) {
    logTest('getProgressionBehavior() returns valid object', false, error.message);
  }

  try {
    const sensitivity = phaseManager.getDeloadSensitivity();
    const validSensitivities = ['normal', 'high', 'very_high'];
    const passed = validSensitivities.includes(sensitivity);
    logTest('getDeloadSensitivity() returns valid value', passed, `Sensitivity: "${sensitivity}"`);
  } catch (error) {
    logTest('getDeloadSensitivity() returns valid value', false, error.message);
  }

  try {
    const priority = phaseManager.getUnlockPriority();
    const validPriorities = ['all', 'bodyweight_priority', 'safety_first'];
    const passed = validPriorities.includes(priority);
    logTest('getUnlockPriority() returns valid value', passed, `Priority: "${priority}"`);
  } catch (error) {
    logTest('getUnlockPriority() returns valid value', false, error.message);
  }

  // ========================================
  // TEST 4: Building Phase Behavior
  // ========================================
  console.log('\n💪 BUILDING PHASE BEHAVIOR TESTS\n');

  // Set to Building phase
  localStorage.setItem('build_training_phase', 'building');

  try {
    const phase = phaseManager.getPhase();
    logTest('Phase set to Building', phase === 'building');
  } catch (error) {
    logTest('Phase set to Building', false, error.message);
  }

  try {
    const behavior = phaseManager.getProgressionBehavior();
    const passed =
      behavior.allowWeightIncrease === true &&
      behavior.tempoFocus === false;
    logTest('Building: Weight increases allowed, no tempo focus', passed,
      `allowWeightIncrease: ${behavior.allowWeightIncrease}, tempoFocus: ${behavior.tempoFocus}`);
  } catch (error) {
    logTest('Building: Weight increases allowed, no tempo focus', false, error.message);
  }

  try {
    const sensitivity = phaseManager.getDeloadSensitivity();
    logTest('Building: Deload sensitivity is "normal"', sensitivity === 'normal',
      `Sensitivity: "${sensitivity}"`);
  } catch (error) {
    logTest('Building: Deload sensitivity is "normal"', false, error.message);
  }

  try {
    const priority = phaseManager.getUnlockPriority();
    logTest('Building: Unlock priority is "all"', priority === 'all',
      `Priority: "${priority}"`);
  } catch (error) {
    logTest('Building: Unlock priority is "all"', false, error.message);
  }

  // ========================================
  // TEST 5: Maintenance Phase Behavior
  // ========================================
  console.log('\n🔧 MAINTENANCE PHASE BEHAVIOR TESTS\n');

  // Set to Maintenance phase
  localStorage.setItem('build_training_phase', 'maintenance');

  try {
    const phase = phaseManager.getPhase();
    logTest('Phase set to Maintenance', phase === 'maintenance');
  } catch (error) {
    logTest('Phase set to Maintenance', false, error.message);
  }

  try {
    const behavior = phaseManager.getProgressionBehavior();
    const passed =
      behavior.allowWeightIncrease === false &&
      behavior.tempoFocus === true;
    logTest('Maintenance: Weight frozen, tempo focus enabled', passed,
      `allowWeightIncrease: ${behavior.allowWeightIncrease}, tempoFocus: ${behavior.tempoFocus}`);
  } catch (error) {
    logTest('Maintenance: Weight frozen, tempo focus enabled', false, error.message);
  }

  try {
    const sensitivity = phaseManager.getDeloadSensitivity();
    logTest('Maintenance: Deload sensitivity is "high"', sensitivity === 'high',
      `Sensitivity: "${sensitivity}"`);
  } catch (error) {
    logTest('Maintenance: Deload sensitivity is "high"', false, error.message);
  }

  try {
    const priority = phaseManager.getUnlockPriority();
    logTest('Maintenance: Unlock priority is "bodyweight_priority"', priority === 'bodyweight_priority',
      `Priority: "${priority}"`);
  } catch (error) {
    logTest('Maintenance: Unlock priority is "bodyweight_priority"', false, error.message);
  }

  // ========================================
  // TEST 6: Deload Timing - Building Phase
  // ========================================
  console.log('\n⏱️  DELOAD TIMING TESTS - BUILDING PHASE\n');

  // Set back to Building
  localStorage.setItem('build_training_phase', 'building');

  // Test: First-time user (null lastDeloadDate) should NOT trigger deload
  try {
    const deloadState = storage.getDeloadState();
    deloadState.lastDeloadDate = null;
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('Building: First-time user (null date) does NOT trigger deload',
      result.trigger === false,
      `BUG FIX TEST - trigger: ${result.trigger}`);
  } catch (error) {
    logTest('Building: First-time user (null date) does NOT trigger deload', false, error.message);
  }

  // Test: 5 weeks since deload should NOT trigger (< 6 week threshold)
  try {
    const deloadState = storage.getDeloadState();
    const fiveWeeksAgo = new Date();
    fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35); // 5 weeks = 35 days
    deloadState.lastDeloadDate = fiveWeeksAgo.toISOString();
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('Building: 5 weeks since deload does NOT trigger (< 6 week threshold)',
      result.trigger === false,
      `trigger: ${result.trigger}, weeks: ${result.weeks || 5}`);
  } catch (error) {
    logTest('Building: 5 weeks since deload does NOT trigger', false, error.message);
  }

  // Test: 7 weeks since deload SHOULD trigger (>= 6 week threshold)
  try {
    const deloadState = storage.getDeloadState();
    const sevenWeeksAgo = new Date();
    sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 49); // 7 weeks = 49 days
    deloadState.lastDeloadDate = sevenWeeksAgo.toISOString();
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('Building: 7 weeks since deload DOES trigger (>= 6 week threshold)',
      result.trigger === true && result.reason === 'time',
      `trigger: ${result.trigger}, reason: ${result.reason}, weeks: ${result.weeks}`);
  } catch (error) {
    logTest('Building: 7 weeks since deload DOES trigger', false, error.message);
  }

  // ========================================
  // TEST 7: Deload Timing - Maintenance Phase
  // ========================================
  console.log('\n⏱️  DELOAD TIMING TESTS - MAINTENANCE PHASE\n');

  // Set to Maintenance
  localStorage.setItem('build_training_phase', 'maintenance');

  // Test: 3 weeks since deload should NOT trigger (< 4 week threshold)
  try {
    const deloadState = storage.getDeloadState();
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21); // 3 weeks = 21 days
    deloadState.lastDeloadDate = threeWeeksAgo.toISOString();
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('Maintenance: 3 weeks since deload does NOT trigger (< 4 week threshold)',
      result.trigger === false,
      `trigger: ${result.trigger}, weeks: ${result.weeks || 3}`);
  } catch (error) {
    logTest('Maintenance: 3 weeks since deload does NOT trigger', false, error.message);
  }

  // Test: 5 weeks since deload SHOULD trigger (>= 4 week threshold)
  try {
    const deloadState = storage.getDeloadState();
    const fiveWeeksAgo = new Date();
    fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35); // 5 weeks = 35 days
    deloadState.lastDeloadDate = fiveWeeksAgo.toISOString();
    deloadState.active = false;
    storage.saveDeloadState(deloadState);

    const result = deloadManager.shouldTriggerDeload();
    logTest('Maintenance: 5 weeks since deload DOES trigger (>= 4 week threshold)',
      result.trigger === true && result.reason === 'time',
      `trigger: ${result.trigger}, reason: ${result.reason}, weeks: ${result.weeks}`);
  } catch (error) {
    logTest('Maintenance: 5 weeks since deload DOES trigger', false, error.message);
  }

  // ========================================
  // TEST 8: Error Handling
  // ========================================
  console.log('\n🛡️  ERROR HANDLING TESTS\n');

  // Test: Invalid phase defaults to Building
  try {
    localStorage.setItem('build_training_phase', 'invalid_phase');
    const phase = phaseManager.getPhase();
    logTest('Invalid phase defaults to "building"', phase === 'building',
      `Phase: "${phase}"`);
  } catch (error) {
    logTest('Invalid phase defaults to "building"', false, error.message);
  }

  // Test: Corrupted phase data doesn't crash
  try {
    localStorage.setItem('build_training_phase', '{invalid json}');
    const behavior = phaseManager.getProgressionBehavior();
    const passed = behavior !== null && typeof behavior === 'object';
    logTest('Corrupted phase data returns safe fallback', passed,
      `Returned: ${JSON.stringify(behavior)}`);
  } catch (error) {
    logTest('Corrupted phase data returns safe fallback', false, error.message);
  }

  // Restore valid phase
  localStorage.setItem('build_training_phase', 'building');

  // ========================================
  // TEST 9: Service Worker Cache
  // ========================================
  console.log('\n📦 SERVICE WORKER CACHE TESTS\n');

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const caches = await window.caches.keys();
      const hasV64 = caches.some(cache => cache.includes('v64'));
      logTest('Service Worker cache v64 exists', hasV64,
        `Caches: ${caches.join(', ')}`);

      if (hasV64) {
        const cache = await window.caches.open(caches.find(c => c.includes('v64')));
        const keys = await cache.keys();
        const hasPhaseManager = keys.some(req => req.url.includes('phase-manager.js'));
        logTest('phase-manager.js cached in v64', hasPhaseManager);
      }
    } else {
      logTest('Service Worker cache v64 exists', false, 'Service Worker not active - hard refresh (Ctrl+Shift+R) may be needed');
    }
  } catch (error) {
    logTest('Service Worker cache tests', false, error.message);
  }

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n═══════════════════════════════════════════════════');
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${Math.round(results.passed / (results.passed + results.failed) * 100)}%`);

  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`   - ${t.name}: ${t.details}`));
  } else {
    console.log('\n🎉 ALL TESTS PASSED!');
  }

  console.log('\n═══════════════════════════════════════════════════\n');

  // Clean up test data
  localStorage.setItem('build_training_phase', 'building');
  const cleanState = storage.getDeloadState();
  cleanState.lastDeloadDate = null;
  cleanState.active = false;
  storage.saveDeloadState(cleanState);

  return results;
})();
