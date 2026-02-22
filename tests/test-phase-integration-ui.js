/**
 * Phase Integration - UI Testing Script
 *
 * Tests UI-specific features that require browser interaction:
 * - Phase toggle persistence in Settings
 * - Progression messages (weight vs tempo)
 * - Unlock priority UI (sorting and "★ Recommended" badges)
 * - Browse Progressions modal interactions
 *
 * USAGE:
 * 1. Start local server: python3 -m http.server 8000
 * 2. Open http://localhost:8000 in browser
 * 3. Open DevTools Console (F12)
 * 4. Copy-paste this entire file into console
 * 5. Follow the manual test prompts
 */

(async function runUITests() {
  console.clear();
  console.log('🎨 PHASE INTEGRATION - UI TESTING SUITE\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results = {
    passed: 0,
    failed: 0,
    manual: 0,
    tests: []
  };

  function logTest(name, passed, details = '') {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${icon} ${status}: ${name}`);
    if (details) console.log(`   ${details}`);

    results.tests.push({ name, passed, details });
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  function logManualTest(name, instructions) {
    console.log(`\n📋 MANUAL TEST: ${name}`);
    console.log(`   ${instructions}`);
    results.manual++;
  }

  // ========================================
  // SECTION 1: PHASE TOGGLE UI TESTS
  // ========================================
  console.log('\n⚙️  SECTION 1: PHASE TOGGLE UI TESTS\n');

  logManualTest('Phase Toggle - Building to Maintenance',
    '1. Click "⚙️ Settings" button\n' +
    '   2. Find "Training Phase" toggle\n' +
    '   3. Toggle to "Maintenance"\n' +
    '   4. Close settings\n' +
    '   5. Hard refresh page (Ctrl+Shift+R)\n' +
    '   6. Open Settings again\n' +
    '   EXPECTED: Toggle still shows "Maintenance"'
  );

  logManualTest('Phase Toggle - Maintenance to Building',
    '1. From Maintenance phase (previous test)\n' +
    '   2. Toggle back to "Building"\n' +
    '   3. Hard refresh page\n' +
    '   4. Open Settings again\n' +
    '   EXPECTED: Toggle still shows "Building"'
  );

  // Check localStorage directly
  try {
    const phase = localStorage.getItem('build_training_phase');
    logTest('localStorage stores phase correctly',
      phase === 'building' || phase === 'maintenance',
      `Stored value: "${phase}"`);
  } catch (error) {
    logTest('localStorage stores phase correctly', false, error.message);
  }

  // ========================================
  // SECTION 2: PROGRESSION MESSAGE TESTS
  // ========================================
  console.log('\n💪 SECTION 2: PROGRESSION MESSAGE TESTS\n');

  logManualTest('Building Phase - Weight Increase Message',
    '1. Set phase to "Building"\n' +
    '   2. Click any workout (e.g., "UPPER A")\n' +
    '   3. Log a set for any exercise\n' +
    '   4. Look for progression hint message\n' +
    '   EXPECTED: Message suggests "Add Xkg next session" or similar weight increase'
  );

  logManualTest('Maintenance Phase - Tempo Focus Message',
    '1. Set phase to "Maintenance"\n' +
    '   2. Click any workout\n' +
    '   3. Log a set for any exercise\n' +
    '   4. Look for progression hint message\n' +
    '   EXPECTED: Message mentions "tempo" or "form" (e.g., "Try 3-1-2 tempo")'
  );

  // ========================================
  // SECTION 3: UNLOCK PRIORITY UI TESTS (CRITICAL)
  // ========================================
  console.log('\n🎯 SECTION 3: UNLOCK PRIORITY UI TESTS (CRITICAL)\n');

  logManualTest('Building Phase - No Priority Sorting',
    '1. Set phase to "Building"\n' +
    '   2. Click any workout\n' +
    '   3. Click "Browse Progressions" button\n' +
    '   4. Select any slot (e.g., "Upper Push")\n' +
    '   5. Click "Progression" tab\n' +
    '   6. Check exercise ordering\n' +
    '   EXPECTED: All exercises in original order, NO "★ Recommended" badges visible'
  );

  logManualTest('Maintenance Phase - Bodyweight Exercises First',
    '1. Set phase to "Maintenance"\n' +
    '   2. Click any workout\n' +
    '   3. Click "Browse Progressions"\n' +
    '   4. Select a slot with both bodyweight and equipment exercises\n' +
    '      (e.g., "Upper Push" has both Sadharan Dand and Barbell Bench Press)\n' +
    '   5. Click "Progression" tab\n' +
    '   6. Check exercise ordering and badges\n' +
    '   EXPECTED:\n' +
    '   - Bodyweight exercises (Sadharan Dand, Baithak) appear FIRST\n' +
    '   - Equipment exercises (Barbell Bench, DB Bench) appear AFTER\n' +
    '   - Bodyweight exercises show "★ Recommended" badge\n' +
    '   - Equipment exercises have NO badge'
  );

  logManualTest('Locked Exercises Appear After Unlocked',
    '1. In Maintenance phase\n' +
    '   2. Open "Browse Progressions"\n' +
    '   3. Select a slot with locked progressions\n' +
    '   4. Verify sorting respects unlock status\n' +
    '   EXPECTED:\n' +
    '   - All unlocked exercises first (sorted: bodyweight → equipment)\n' +
    '   - All locked exercises after (with lock icon 🔒)\n' +
    '   - Locked exercises show no "Select" button'
  );

  // ========================================
  // SECTION 4: VISUAL BADGE TESTS
  // ========================================
  console.log('\n🎨 SECTION 4: VISUAL BADGE STYLING TESTS\n');

  logManualTest('Phase Badge Styling',
    '1. Set phase to "Maintenance"\n' +
    '   2. Open "Browse Progressions"\n' +
    '   3. Look for "★ Recommended" badges on bodyweight exercises\n' +
    '   EXPECTED:\n' +
    '   - Badge has purple gradient background\n' +
    '   - White text with star icon\n' +
    '   - Rounded corners\n' +
    '   - Appears next to "✓ Unlocked" badge'
  );

  // ========================================
  // SECTION 5: DELOAD TIMING UI TESTS
  // ========================================
  console.log('\n⏱️  SECTION 5: DELOAD TIMING UI TESTS\n');

  logManualTest('Building Phase - 6 Week Deload Timing',
    '1. Set phase to "Building"\n' +
    '   2. Open browser console\n' +
    '   3. Set last deload to 7 weeks ago:\n' +
    '      const deloadState = JSON.parse(localStorage.getItem("build_deload_state") || "{}");\n' +
    '      const sevenWeeksAgo = new Date();\n' +
    '      sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 49);\n' +
    '      deloadState.lastDeloadDate = sevenWeeksAgo.toISOString();\n' +
    '      deloadState.active = false;\n' +
    '      localStorage.setItem("build_deload_state", JSON.stringify(deloadState));\n' +
    '   4. Reload page\n' +
    '   5. Check for deload recommendation in UI\n' +
    '   EXPECTED: Deload badge or recommendation appears (7 weeks > 6 week threshold)'
  );

  logManualTest('Maintenance Phase - 4 Week Deload Timing',
    '1. Set phase to "Maintenance"\n' +
    '   2. Set last deload to 5 weeks ago (similar console commands)\n' +
    '   3. Reload page\n' +
    '   4. Check for deload recommendation\n' +
    '   EXPECTED: Deload badge appears (5 weeks > 4 week threshold)'
  );

  // ========================================
  // SECTION 6: EDGE CASE UI TESTS
  // ========================================
  console.log('\n🛡️  SECTION 6: EDGE CASE UI TESTS\n');

  logManualTest('Phase Switch While Modal Open',
    '1. Set phase to "Building"\n' +
    '   2. Open "Browse Progressions" modal (keep it open)\n' +
    '   3. In console: localStorage.setItem("build_training_phase", "maintenance")\n' +
    '   4. Close modal\n' +
    '   5. Reopen "Browse Progressions"\n' +
    '   EXPECTED: Exercise sorting updates to Maintenance (bodyweight first)'
  );

  logManualTest('Empty Exercise List',
    '1. Open "Browse Progressions" for a slot with no progressions\n' +
    '   EXPECTED: Empty state message, no JavaScript errors in console'
  );

  // ========================================
  // AUTOMATED DOM CHECKS
  // ========================================
  console.log('\n🔍 SECTION 7: AUTOMATED DOM CHECKS\n');

  // Test 7.1: Check if Settings button exists
  try {
    const settingsBtn = document.querySelector('[onclick*="showSettingsModal"]') ||
                        document.querySelector('.settings-btn');
    logTest('Settings button exists in DOM',
      settingsBtn !== null,
      settingsBtn ? 'Found' : 'Not found');
  } catch (error) {
    logTest('Settings button exists', false, error.message);
  }

  // Test 7.2: Check if phase badge CSS is loaded
  try {
    const testBadge = document.createElement('span');
    testBadge.className = 'phase-badge';
    testBadge.style.display = 'none';
    document.body.appendChild(testBadge);

    const computedStyle = window.getComputedStyle(testBadge);
    const hasGradient = computedStyle.background.includes('gradient') ||
                        computedStyle.backgroundImage.includes('gradient');

    document.body.removeChild(testBadge);

    logTest('phase-badge CSS is loaded',
      hasGradient,
      hasGradient ? 'Gradient detected' : 'No gradient found');
  } catch (error) {
    logTest('phase-badge CSS is loaded', false, error.message);
  }

  // Test 7.3: Check if app instance exists
  try {
    logTest('Global app instance exists',
      typeof window.app !== 'undefined',
      typeof window.app !== 'undefined' ? 'window.app available' : 'Not found');
  } catch (error) {
    logTest('Global app instance exists', false, error.message);
  }

  // Test 7.4: Check if phaseManager is initialized
  try {
    logTest('PhaseManager is initialized',
      window.app && window.app.phaseManager !== undefined,
      window.app?.phaseManager ? 'PhaseManager found' : 'Not initialized');
  } catch (error) {
    logTest('PhaseManager is initialized', false, error.message);
  }

  // ========================================
  // INTEGRATION TEST - CONSOLE COMMANDS
  // ========================================
  console.log('\n🧪 SECTION 8: INTEGRATION TEST COMMANDS\n');

  console.log('Run these commands to verify phase integration:\n');
  console.log('// Get current phase');
  console.log('window.app.phaseManager.getPhase();\n');

  console.log('// Get progression behavior');
  console.log('window.app.phaseManager.getProgressionBehavior();\n');

  console.log('// Get deload sensitivity');
  console.log('window.app.phaseManager.getDeloadSensitivity();\n');

  console.log('// Get unlock priority');
  console.log('window.app.phaseManager.getUnlockPriority();\n');

  console.log('// Test unlock evaluation with phase priority');
  console.log('window.app.unlockEvaluator.evaluateUnlockWithPhasePriority(');
  console.log('  "Sadharan Dand",  // target exercise');
  console.log('  "DB Flat Bench Press"  // current exercise');
  console.log(');\n');

  console.log('// Check deload trigger status');
  console.log('window.app.deloadManager.shouldTriggerDeload();\n');

  // ========================================
  // FINAL SUMMARY
  // ========================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('\n📊 UI TEST SUMMARY\n');

  console.log(`Automated Tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📋 Manual Tests: ${results.manual}\n`);

  if (results.failed > 0) {
    console.log('❌ FAILED AUTOMATED TESTS:');
    results.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`   ${t.name}: ${t.details}`));
  } else {
    console.log('✅ All automated DOM checks passed!');
  }

  console.log('\n📝 NEXT STEPS:');
  console.log('1. Follow the manual test instructions above');
  console.log('2. Verify all visual elements appear correctly');
  console.log('3. Test phase switching persistence');
  console.log('4. Verify "★ Recommended" badges in Maintenance phase');
  console.log('5. Run integration test commands to verify backend logic\n');

  console.log('═══════════════════════════════════════════════════════════════\n');

  return results;
})();
