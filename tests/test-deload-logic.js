/**
 * Comprehensive Deload Logic Testing Suite
 *
 * Tests the deload management system:
 * - Weeks-since-deload calculation
 * - Phase-aware trigger thresholds (6 weeks Building, 4 weeks Maintenance)
 * - Deload state management (start, end, postpone)
 * - Days remaining calculation
 * - Phase integration with PhaseManager
 *
 * USAGE:
 * 1. Open app in browser
 * 2. Open DevTools Console (F12)
 * 3. Copy-paste this entire file
 * 4. Results displayed with ✅ PASS / ❌ FAIL
 */

(async function testDeloadLogic() {
  console.clear();
  console.log('⏸️ COMPREHENSIVE DELOAD LOGIC TEST SUITE\n');
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

  let DeloadManager, StorageManager, PhaseManager;

  try {
    const deloadModule = await import('../js/modules/deload.js');
    const storageModule = await import('../js/modules/storage.js');
    const phaseModule = await import('../js/modules/phase-manager.js');
    DeloadManager = deloadModule.DeloadManager;
    StorageManager = storageModule.StorageManager;
    PhaseManager = phaseModule.PhaseManager;
    console.log('✅ Modules loaded successfully\n');
  } catch (e) {
    console.error('❌ FATAL: Failed to load modules', e);
    return;
  }

  // ========================================
  // SECTION 2: Weeks Calculation Tests
  // ========================================
  console.log('\n📅 TESTING WEEKS CALCULATION...\n');

  const category1 = 'Weeks Calculation';

  try {
    const storage = new StorageManager();
    const phaseManager = new PhaseManager(storage);
    const manager = new DeloadManager(storage, phaseManager);

    // Test: null lastDeloadDate returns 0
    const weeksNull = manager.calculateWeeksSinceDeload(null);
    logTest(
      category1,
      'Returns 0 weeks for null lastDeloadDate',
      weeksNull === 0,
      `Weeks: ${weeksNull}`
    );

    // Test: undefined lastDeloadDate returns 0
    const weeksUndefined = manager.calculateWeeksSinceDeload(undefined);
    logTest(
      category1,
      'Returns 0 weeks for undefined lastDeloadDate',
      weeksUndefined === 0,
      `Weeks: ${weeksUndefined}`
    );

    // Test: Invalid date string returns 0
    const weeksInvalid = manager.calculateWeeksSinceDeload('invalid-date');
    logTest(
      category1,
      'Returns 0 weeks for invalid date string',
      weeksInvalid === 0,
      `Weeks: ${weeksInvalid}`
    );

    // Test: 7 days ago = 1 week
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeks1 = manager.calculateWeeksSinceDeload(sevenDaysAgo.toISOString());
    logTest(
      category1,
      'Calculates 1 week for date 7 days ago',
      weeks1 === 1,
      `Weeks: ${weeks1}, Expected: 1`
    );

    // Test: 14 days ago = 2 weeks
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const weeks2 = manager.calculateWeeksSinceDeload(fourteenDaysAgo.toISOString());
    logTest(
      category1,
      'Calculates 2 weeks for date 14 days ago',
      weeks2 === 2,
      `Weeks: ${weeks2}, Expected: 2`
    );

    // Test: 42 days ago = 6 weeks (Building phase threshold)
    const fortyTwoDaysAgo = new Date(Date.now() - 42 * 24 * 60 * 60 * 1000);
    const weeks6 = manager.calculateWeeksSinceDeload(fortyTwoDaysAgo.toISOString());
    logTest(
      category1,
      'Calculates 6 weeks for date 42 days ago (Building threshold)',
      weeks6 === 6,
      `Weeks: ${weeks6}, Expected: 6`
    );

    // Test: 28 days ago = 4 weeks (Maintenance phase threshold)
    const twentyEightDaysAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
    const weeks4 = manager.calculateWeeksSinceDeload(twentyEightDaysAgo.toISOString());
    logTest(
      category1,
      'Calculates 4 weeks for date 28 days ago (Maintenance threshold)',
      weeks4 === 4,
      `Weeks: ${weeks4}, Expected: 4`
    );

  } catch (e) {
    logTest(category1, 'Weeks calculation tests', false, e.message);
  }

  // ========================================
  // SECTION 3: Phase-Aware Trigger Tests
  // ========================================
  console.log('\n🎯 TESTING PHASE-AWARE TRIGGERS...\n');

  const category2 = 'Phase-Aware Triggers';

  try {
    // Test Building Phase (6 week threshold)
    const storage1 = new StorageManager();
    localStorage.setItem('build_phase', 'building');
    const phaseManager1 = new PhaseManager(storage1);
    const manager1 = new DeloadManager(storage1, phaseManager1);

    const sixWeeksAgo = new Date(Date.now() - 42 * 24 * 60 * 60 * 1000);
    const deloadState1 = storage1.getDeloadState();
    deloadState1.lastDeloadDate = sixWeeksAgo.toISOString();
    deloadState1.active = false;
    storage1.saveDeloadState(deloadState1);

    const trigger1 = manager1.shouldTriggerDeload();
    logTest(
      category2,
      'Building phase: Triggers after 6 weeks',
      trigger1.trigger === true && trigger1.reason === 'time',
      `Trigger: ${trigger1.trigger}, Reason: ${trigger1.reason}, Weeks: ${trigger1.weeks}`
    );

    // Test Building Phase - 5 weeks (should NOT trigger)
    const fiveWeeksAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
    deloadState1.lastDeloadDate = fiveWeeksAgo.toISOString();
    storage1.saveDeloadState(deloadState1);

    const trigger2 = manager1.shouldTriggerDeload();
    logTest(
      category2,
      'Building phase: No trigger at 5 weeks',
      trigger2.trigger === false,
      `Trigger: ${trigger2.trigger}, Weeks: ${manager1.calculateWeeksSinceDeload(fiveWeeksAgo.toISOString())}`
    );

    // Test Maintenance Phase (4 week threshold)
    const storage2 = new StorageManager();
    localStorage.setItem('build_phase', 'maintenance');
    const phaseManager2 = new PhaseManager(storage2);
    const manager2 = new DeloadManager(storage2, phaseManager2);

    const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
    const deloadState2 = storage2.getDeloadState();
    deloadState2.lastDeloadDate = fourWeeksAgo.toISOString();
    deloadState2.active = false;
    storage2.saveDeloadState(deloadState2);

    const trigger3 = manager2.shouldTriggerDeload();
    logTest(
      category2,
      'Maintenance phase: Triggers after 4 weeks',
      trigger3.trigger === true && trigger3.reason === 'time',
      `Trigger: ${trigger3.trigger}, Reason: ${trigger3.reason}, Weeks: ${trigger3.weeks}`
    );

    // Test Maintenance Phase - 3 weeks (should NOT trigger)
    const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);
    deloadState2.lastDeloadDate = threeWeeksAgo.toISOString();
    storage2.saveDeloadState(deloadState2);

    const trigger4 = manager2.shouldTriggerDeload();
    logTest(
      category2,
      'Maintenance phase: No trigger at 3 weeks',
      trigger4.trigger === false,
      `Trigger: ${trigger4.trigger}, Weeks: ${manager2.calculateWeeksSinceDeload(threeWeeksAgo.toISOString())}`
    );

  } catch (e) {
    logTest(category2, 'Phase-aware trigger tests', false, e.message);
  }

  // ========================================
  // SECTION 4: Deload State Management
  // ========================================
  console.log('\n🔄 TESTING DELOAD STATE MANAGEMENT...\n');

  const category3 = 'Deload State Management';

  try {
    const storage = new StorageManager();
    const phaseManager = new PhaseManager(storage);
    const manager = new DeloadManager(storage, phaseManager);

    // Test: Start deload
    manager.startDeload('standard');
    const state1 = storage.getDeloadState();

    logTest(
      category3,
      'startDeload() sets active to true',
      state1.active === true,
      `Active: ${state1.active}`
    );

    logTest(
      category3,
      'startDeload() sets deloadType',
      state1.deloadType === 'standard',
      `Type: ${state1.deloadType}`
    );

    logTest(
      category3,
      'startDeload() sets startDate',
      state1.startDate !== null && state1.startDate !== undefined,
      `StartDate: ${state1.startDate}`
    );

    logTest(
      category3,
      'startDeload() sets endDate (7 days later)',
      state1.endDate !== null && state1.endDate !== undefined,
      `EndDate: ${state1.endDate}`
    );

    // Test: Active deload prevents new trigger
    const trigger = manager.shouldTriggerDeload();
    logTest(
      category3,
      'Active deload prevents new trigger',
      trigger.trigger === false,
      `Trigger: ${trigger.trigger}`
    );

    // Test: End deload
    manager.endDeload();
    const state2 = storage.getDeloadState();

    logTest(
      category3,
      'endDeload() sets active to false',
      state2.active === false,
      `Active: ${state2.active}`
    );

    logTest(
      category3,
      'endDeload() sets lastDeloadDate from startDate',
      state2.lastDeloadDate === state1.startDate,
      `LastDeload: ${state2.lastDeloadDate}, Expected: ${state1.startDate}`
    );

    logTest(
      category3,
      'endDeload() clears deloadType',
      state2.deloadType === null,
      `Type: ${state2.deloadType}`
    );

  } catch (e) {
    logTest(category3, 'Deload state management tests', false, e.message);
  }

  // ========================================
  // SECTION 5: Postpone Deload Tests
  // ========================================
  console.log('\n⏭️ TESTING POSTPONE DELOAD...\n');

  const category4 = 'Postpone Deload';

  try {
    const storage = new StorageManager();
    const phaseManager = new PhaseManager(storage);
    const manager = new DeloadManager(storage, phaseManager);

    // Test: Initial dismiss count
    const state1 = storage.getDeloadState();
    const initialCount = state1.dismissedCount || 0;
    logTest(
      category4,
      'Initial dismissedCount is 0 or undefined',
      initialCount === 0 || initialCount === undefined,
      `Count: ${initialCount}`
    );

    // Test: Postpone increments count
    manager.postponeDeload();
    const state2 = storage.getDeloadState();
    logTest(
      category4,
      'postponeDeload() increments dismissedCount to 1',
      state2.dismissedCount === 1,
      `Count: ${state2.dismissedCount}`
    );

    // Test: Multiple postpones
    manager.postponeDeload();
    manager.postponeDeload();
    const state3 = storage.getDeloadState();
    logTest(
      category4,
      'Multiple postpones increment count correctly',
      state3.dismissedCount === 3,
      `Count: ${state3.dismissedCount}, Expected: 3`
    );

  } catch (e) {
    logTest(category4, 'Postpone deload tests', false, e.message);
  }

  // ========================================
  // SECTION 6: Days Remaining Tests
  // ========================================
  console.log('\n⏳ TESTING DAYS REMAINING...\n');

  const category5 = 'Days Remaining';

  try {
    const storage = new StorageManager();
    const phaseManager = new PhaseManager(storage);
    const manager = new DeloadManager(storage, phaseManager);

    // Test: No active deload returns 0
    const days1 = manager.getDaysRemaining();
    logTest(
      category5,
      'Returns 0 days when no active deload',
      days1 === 0,
      `Days: ${days1}`
    );

    // Test: Start deload and check days
    manager.startDeload('standard');
    const days2 = manager.getDaysRemaining();
    const validDays = days2 >= 6 && days2 <= 7; // Should be ~7 days
    logTest(
      category5,
      'Returns ~7 days for fresh deload',
      validDays,
      `Days: ${days2}, Expected: 6-7`
    );

    // Test: Past end date returns 0
    const state = storage.getDeloadState();
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
    state.endDate = pastDate.toISOString();
    storage.saveDeloadState(state);

    const days3 = manager.getDaysRemaining();
    logTest(
      category5,
      'Returns 0 days for past end date',
      days3 === 0,
      `Days: ${days3}`
    );

  } catch (e) {
    logTest(category5, 'Days remaining tests', false, e.message);
  }

  // ========================================
  // SECTION 7: Phase Integration Tests
  // ========================================
  console.log('\n🔗 TESTING PHASE INTEGRATION...\n');

  const category6 = 'Phase Integration';

  try {
    // Test: Building phase sensitivity
    const storage1 = new StorageManager();
    localStorage.setItem('build_phase', 'building');
    const phaseManager1 = new PhaseManager(storage1);
    const manager1 = new DeloadManager(storage1, phaseManager1);

    const sensitivity1 = phaseManager1.getDeloadSensitivity();
    logTest(
      category6,
      'Building phase has "normal" sensitivity',
      sensitivity1 === 'normal',
      `Sensitivity: ${sensitivity1}`
    );

    // Test: Maintenance phase sensitivity
    const storage2 = new StorageManager();
    localStorage.setItem('build_phase', 'maintenance');
    const phaseManager2 = new PhaseManager(storage2);
    const manager2 = new DeloadManager(storage2, phaseManager2);

    const sensitivity2 = phaseManager2.getDeloadSensitivity();
    logTest(
      category6,
      'Maintenance phase has "high" sensitivity',
      sensitivity2 === 'high',
      `Sensitivity: ${sensitivity2}`
    );

    // Test: DeloadManager requires PhaseManager
    let errorThrown = false;
    try {
      new DeloadManager(storage1, null);
    } catch (e) {
      errorThrown = e.message.includes('requires a PhaseManager');
    }
    logTest(
      category6,
      'DeloadManager constructor requires PhaseManager',
      errorThrown,
      errorThrown ? 'Correctly throws error' : 'No error thrown'
    );

  } catch (e) {
    logTest(category6, 'Phase integration tests', false, e.message);
  }

  // ========================================
  // SECTION 8: Edge Cases
  // ========================================
  console.log('\n🔍 TESTING EDGE CASES...\n');

  const category7 = 'Edge Cases';

  try {
    const storage = new StorageManager();
    const phaseManager = new PhaseManager(storage);
    const manager = new DeloadManager(storage, phaseManager);

    // Test: Exactly 6 weeks (Building phase boundary)
    const exactlySixWeeks = new Date(Date.now() - 42 * 24 * 60 * 60 * 1000);
    const weeks = manager.calculateWeeksSinceDeload(exactlySixWeeks.toISOString());
    logTest(
      category7,
      'Exactly 6 weeks calculates as 6',
      weeks === 6,
      `Weeks: ${weeks}`
    );

    // Test: Future date (should return negative or 0)
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const futureWeeks = manager.calculateWeeksSinceDeload(futureDate.toISOString());
    const validFuture = futureWeeks <= 0;
    logTest(
      category7,
      'Future date returns non-positive weeks',
      validFuture,
      `Weeks: ${futureWeeks}, Expected: ≤0`
    );

    // Test: Empty string date
    const emptyWeeks = manager.calculateWeeksSinceDeload('');
    logTest(
      category7,
      'Empty string returns 0 weeks',
      emptyWeeks === 0,
      `Weeks: ${emptyWeeks}`
    );

  } catch (e) {
    logTest(category7, 'Edge case tests', false, e.message);
  }

  // ========================================
  // SECTION 9: Summary
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
    console.log('✨ ALL TESTS PASSED! Deload logic is working correctly.\n');
  } else {
    console.log(`⚠️ ${results.failed} tests failed. Review failures above.\n`);
  }

  // Export results
  window._deloadTestResults = results;
  console.log('💡 Results available at: window._deloadTestResults\n');
})();
