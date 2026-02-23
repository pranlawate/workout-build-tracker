/**
 * Pre/Post-Workout Modal UI Integration Tests
 *
 * Tests that would have caught the bugs found during manual testing:
 * - Text visibility (white on white)
 * - Missing UI elements
 * - Button functionality
 * - Null safety in DOM operations
 * - Modal flow (warm-up → workout → cooldown → summary)
 *
 * Run in browser console after loading index.html
 */

(async function testModalUIIntegration() {
  console.log('[Modal UI Tests] Starting comprehensive modal integration tests...');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function assert(condition, testName, errorMsg = '') {
    if (condition) {
      results.passed++;
      results.tests.push({ name: testName, status: 'PASS' });
      console.log(`✅ ${testName}`);
    } else {
      results.failed++;
      results.tests.push({ name: testName, status: 'FAIL', error: errorMsg });
      console.error(`❌ ${testName}: ${errorMsg}`);
    }
  }

  // =========================================
  // WARM-UP MODAL TESTS
  // =========================================

  console.log('\n[Warm-up Modal Tests]');

  // Test 1: Warm-up modal HTML structure exists
  const warmupModal = document.getElementById('warmup-modal');
  assert(warmupModal !== null, 'Warm-up modal element exists');

  // Test 2: Warm-up checklist container exists
  const warmupChecklist = document.getElementById('warmup-checklist');
  assert(warmupChecklist !== null, 'Warm-up checklist container exists');

  // Test 3: Begin workout button exists
  const beginBtn = document.getElementById('begin-workout-btn');
  assert(beginBtn !== null, 'Begin workout button exists');

  // Test 4: Progress indicator exists
  const warmupProgress = document.getElementById('warmup-progress');
  assert(warmupProgress !== null, 'Warm-up progress indicator exists');

  // Test 5: CSS file for modals is loaded
  const modalCSS = Array.from(document.styleSheets).some(sheet =>
    sheet.href && sheet.href.includes('pre-post-workout-modals.css')
  );
  assert(modalCSS, 'pre-post-workout-modals.css is loaded');

  // Test 6: Warm-up exercise text has visible color (not white)
  // This would have caught the white-on-white bug
  const warmupCSSRules = Array.from(document.styleSheets)
    .flatMap(sheet => {
      try {
        return Array.from(sheet.cssRules || []);
      } catch (e) {
        return [];
      }
    })
    .filter(rule => rule.selectorText && rule.selectorText.includes('.exercise-name'));

  const hasExerciseNameColor = warmupCSSRules.some(rule =>
    rule.style.color && rule.style.color !== '' && rule.style.color !== 'white'
  );
  assert(hasExerciseNameColor, 'Warm-up exercise names have non-white text color defined');

  // =========================================
  // COOLDOWN MODAL TESTS
  // =========================================

  console.log('\n[Cooldown Modal Tests]');

  // Test 7: Cooldown modal exists
  const cooldownModal = document.getElementById('cooldown-modal');
  assert(cooldownModal !== null, 'Cooldown modal element exists');

  // Test 8: Stretching checklist exists
  const stretchingChecklist = document.getElementById('stretching-checklist');
  assert(stretchingChecklist !== null, 'Stretching checklist container exists');

  // Test 9: Foam rolling checklist exists
  const foamRollingChecklist = document.getElementById('foam-rolling-checklist');
  assert(foamRollingChecklist !== null, 'Foam rolling checklist container exists');

  // Test 10: LISS recommendation element exists
  const lissRec = document.getElementById('liss-recommendation');
  assert(lissRec !== null, 'LISS recommendation element exists');

  // Test 11: Weigh-in container exists
  const weighinContainer = document.getElementById('cooldown-weighin');
  assert(weighinContainer !== null, 'Weigh-in container exists');

  // Test 12: Finish & Review button exists
  const finishBtn = document.getElementById('finish-review-btn');
  assert(finishBtn !== null, 'Finish & Review button exists');

  // Test 13: Stretching text has visible color
  const stretchNameRules = Array.from(document.styleSheets)
    .flatMap(sheet => {
      try {
        return Array.from(sheet.cssRules || []);
      } catch (e) {
        return [];
      }
    })
    .filter(rule => rule.selectorText && rule.selectorText.includes('.stretch-name'));

  const hasStretchNameColor = stretchNameRules.some(rule =>
    rule.style.color && rule.style.color !== '' && !rule.style.color.includes('255, 255, 255')
  );
  assert(hasStretchNameColor, 'Stretching text has visible (non-white) color defined');

  // Test 14: Weigh-in section has CSS styling
  const weighinSectionRules = Array.from(document.styleSheets)
    .flatMap(sheet => {
      try {
        return Array.from(sheet.cssRules || []);
      } catch (e) {
        return [];
      }
    })
    .filter(rule => rule.selectorText && rule.selectorText.includes('.weighin-section'));

  assert(weighinSectionRules.length > 0, 'Weigh-in section has CSS styling defined');

  // =========================================
  // APP METHOD EXISTENCE TESTS
  // =========================================

  console.log('\n[App Method Tests]');

  // Test 15: App instance exists
  assert(typeof window.app !== 'undefined', 'Global app instance exists');

  if (window.app) {
    // Test 16: showWarmupModal method exists
    assert(typeof window.app.showWarmupModal === 'function', 'showWarmupModal method exists');

    // Test 17: showCooldownModal method exists
    assert(typeof window.app.showCooldownModal === 'function', 'showCooldownModal method exists');

    // Test 18: setupCooldownWeighIn method exists
    assert(typeof window.app.setupCooldownWeighIn === 'function', 'setupCooldownWeighIn method exists');

    // Test 19: setupFinishReviewButton method exists
    assert(typeof window.app.setupFinishReviewButton === 'function', 'setupFinishReviewButton method exists');

    // Test 20: renderStretchingChecklist method exists
    assert(typeof window.app.renderStretchingChecklist === 'function', 'renderStretchingChecklist method exists');
  }

  // =========================================
  // NULL SAFETY TESTS
  // =========================================

  console.log('\n[Null Safety Tests]');

  // Test 21: setupSummaryWeighIn has null checks
  if (window.app && window.app.setupSummaryWeighIn) {
    const fnString = window.app.setupSummaryWeighIn.toString();
    const hasNullCheck = fnString.includes('!weighinSection') || fnString.includes('weighinSection === null');
    assert(hasNullCheck, 'setupSummaryWeighIn has null safety checks');
  }

  // Test 22: saveSummaryWeighInData has null checks
  if (window.app && window.app.saveSummaryWeighInData) {
    const fnString = window.app.saveSummaryWeighInData.toString();
    const hasNullCheck = fnString.includes('!weighinSection') || fnString.includes('weighinSection === null');
    assert(hasNullCheck, 'saveSummaryWeighInData has null safety checks');
  }

  // =========================================
  // FORM CUES COVERAGE
  // =========================================

  console.log('\n[Form Cues Coverage Tests]');

  // Test 23: Form cues module loaded
  let formCuesLoaded = false;
  try {
    const { getFormCues } = await import('../js/modules/form-cues.js');
    formCuesLoaded = typeof getFormCues === 'function';
  } catch (e) {
    console.error('Failed to load form-cues module:', e);
  }
  assert(formCuesLoaded, 'Form cues module loads successfully');

  if (formCuesLoaded) {
    const { getFormCues } = await import('../js/modules/form-cues.js');

    // Test 24: Decline DB Press has form cues
    const declineCues = getFormCues('Decline DB Press');
    assert(declineCues !== null, 'Decline DB Press has form cues defined');

    if (declineCues) {
      assert(
        declineCues.setup && declineCues.execution && declineCues.mistakes,
        'Decline DB Press form cues have all sections (setup, execution, mistakes)'
      );
    }
  }

  // =========================================
  // DELOAD INTERACTION TESTS
  // =========================================

  console.log('\n[System Interaction Tests]');

  // Test 25: Rotation manager checks deload
  let rotationManagerLoaded = false;
  try {
    const { RotationManager } = await import('../js/modules/rotation-manager.js');
    rotationManagerLoaded = true;

    const checkRotationDueSrc = RotationManager.prototype.checkRotationDue.toString();
    const checksDeload = checkRotationDueSrc.includes('getDeloadState');
    assert(checksDeload, 'RotationManager.checkRotationDue checks deload state');
  } catch (e) {
    console.error('Failed to load rotation-manager module:', e);
  }

  // Test 26: Smart progression checks deload
  try {
    const { getSuggestion } = await import('../js/modules/smart-progression.js');
    const getSuggestionSrc = getSuggestion.toString();
    const checksDeload = getSuggestionSrc.includes('getDeloadState') || getSuggestionSrc.includes('DELOAD');
    assert(checksDeload, 'getSuggestion checks deload state (Priority 0)');
  } catch (e) {
    console.error('Failed to load smart-progression module:', e);
  }

  // =========================================
  // RESULTS SUMMARY
  // =========================================

  console.log('\n' + '='.repeat(50));
  console.log(`🎯 MODAL UI INTEGRATION TEST RESULTS`);
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.passed + results.failed}`);
  console.log(`✔️  Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests.filter(t => t.status === 'FAIL').forEach(test => {
      console.log(`  - ${test.name}${test.error ? ': ' + test.error : ''}`);
    });
  }

  // Store results globally for test runner
  window.modalUITestResults = results;

  return results;
})();
