/**
 * Master Test Runner
 *
 * Runs all automated test suites and provides comprehensive reporting.
 *
 * USAGE:
 * 1. Open app in browser
 * 2. Open DevTools Console (F12)
 * 3. Copy-paste this entire file
 * 4. Or run specific suites:
 *    - testRunner.runExercises()
 *    - testRunner.runProgressions()
 *    - testRunner.runFeatures()
 *    - testRunner.runPhaseIntegration()
 *    - testRunner.runWorkoutRotation()
 *    - testRunner.runDeloadLogic()
 *    - testRunner.runUnlockSystem()
 *    - testRunner.runSmartProgression()
 *    - testRunner.runAll()
 */

const testRunner = {
  results: {
    exercises: null,
    progressions: null,
    features: null,
    phaseIntegration: null,
    workoutRotation: null,
    deloadLogic: null,
    unlockSystem: null,
    smartProgression: null
  },

  async loadScript(path) {
    try {
      const response = await fetch(path);
      const code = await response.text();
      eval(code);
      return true;
    } catch (e) {
      console.error(`❌ Failed to load ${path}:`, e);
      return false;
    }
  },

  async runExercises() {
    console.log('\n🏋️ RUNNING EXERCISE TESTS...\n');
    const loaded = await this.loadScript('./tests/test-all-exercises.js');
    if (loaded) {
      this.results.exercises = window._exerciseTestResults;
    }
  },

  async runProgressions() {
    console.log('\n🔄 RUNNING PROGRESSION TESTS...\n');
    const loaded = await this.loadScript('./tests/test-all-progressions.js');
    if (loaded) {
      this.results.progressions = window._progressionTestResults;
    }
  },

  async runFeatures() {
    console.log('\n⚙️ RUNNING FEATURE TESTS...\n');
    const loaded = await this.loadScript('./tests/test-all-features.js');
    if (loaded) {
      this.results.features = window._featureTestResults;
    }
  },

  async runPhaseIntegration() {
    console.log('\n🎯 RUNNING PHASE INTEGRATION TESTS...\n');
    const loaded = await this.loadScript('./tests/test-comprehensive-phase-integration.js');
    if (loaded) {
      this.results.phaseIntegration = window._phaseTestResults;
    }
  },

  async runWorkoutRotation() {
    console.log('\n🔄 RUNNING WORKOUT ROTATION TESTS...\n');
    const loaded = await this.loadScript('./tests/test-workout-rotation.js');
    if (loaded) {
      this.results.workoutRotation = window._workoutRotationTestResults;
    }
  },

  async runDeloadLogic() {
    console.log('\n⏸️ RUNNING DELOAD LOGIC TESTS...\n');
    const loaded = await this.loadScript('./tests/test-deload-logic.js');
    if (loaded) {
      this.results.deloadLogic = window._deloadTestResults;
    }
  },

  async runUnlockSystem() {
    console.log('\n🔓 RUNNING UNLOCK SYSTEM TESTS...\n');
    const loaded = await this.loadScript('./tests/test-unlock-system.js');
    if (loaded) {
      this.results.unlockSystem = window._unlockSystemTestResults;
    }
  },

  async runSmartProgression() {
    console.log('\n📈 RUNNING SMART PROGRESSION TESTS...\n');
    const loaded = await this.loadScript('./tests/test-smart-progression.js');
    if (loaded) {
      this.results.smartProgression = window._smartProgressionTestResults;
    }
  },

  async runAll() {
    console.clear();
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🧪 MASTER TEST RUNNER - COMPREHENSIVE TEST SUITE');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`⏰ Started at: ${new Date().toLocaleTimeString()}\n`);

    const startTime = Date.now();

    // Run all test suites
    await this.runExercises();
    await this.runProgressions();
    await this.runFeatures();
    await this.runPhaseIntegration();
    await this.runWorkoutRotation();
    await this.runDeloadLogic();
    await this.runUnlockSystem();
    await this.runSmartProgression();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Generate comprehensive report
    this.generateReport(duration);
  },

  generateReport(duration) {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 COMPREHENSIVE TEST REPORT');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const suites = [
      { name: 'Exercise Tests', key: 'exercises', icon: '🏋️' },
      { name: 'Progression Tests', key: 'progressions', icon: '🔄' },
      { name: 'Feature Tests', key: 'features', icon: '⚙️' },
      { name: 'Phase Integration Tests', key: 'phaseIntegration', icon: '🎯' },
      { name: 'Workout Rotation Tests', key: 'workoutRotation', icon: '🔄' },
      { name: 'Deload Logic Tests', key: 'deloadLogic', icon: '⏸️' },
      { name: 'Unlock System Tests', key: 'unlockSystem', icon: '🔓' },
      { name: 'Smart Progression Tests', key: 'smartProgression', icon: '📈' }
    ];

    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;

    suites.forEach(suite => {
      const result = this.results[suite.key];
      if (result) {
        const passed = result.passed || 0;
        const failed = result.failed || 0;
        const total = passed + failed;
        const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
        const icon = failed === 0 ? '✅' : '⚠️';

        console.log(`${suite.icon} ${icon} ${suite.name}`);
        console.log(`   ${passed}/${total} passed (${percentage}%)`);
        console.log('');

        totalPassed += passed;
        totalFailed += failed;
        totalTests += total;
      } else {
        console.log(`${suite.icon} ❓ ${suite.name}`);
        console.log(`   Not run or failed to load`);
        console.log('');
      }
    });

    console.log('───────────────────────────────────────────────────────────────');
    const overallPercentage = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';
    const overallIcon = totalFailed === 0 && totalTests > 0 ? '✅' : '⚠️';

    console.log(`\n${overallIcon} OVERALL RESULTS:`);
    console.log(`   ${totalPassed}/${totalTests} tests passed (${overallPercentage}%)`);
    console.log(`   ${totalFailed} tests failed`);
    console.log(`   ⏱️ Duration: ${duration}s`);
    console.log(`   ⏰ Completed at: ${new Date().toLocaleTimeString()}`);
    console.log('\n═══════════════════════════════════════════════════════════════\n');

    if (totalFailed === 0 && totalTests > 0) {
      console.log('✨ ALL TESTS PASSED! Your app is in excellent shape.\n');
    } else if (totalTests === 0) {
      console.log('⚠️ NO TESTS RUN. Check that test files loaded correctly.\n');
    } else {
      console.log(`⚠️ ${totalFailed} TESTS FAILED. Review failures in individual test outputs above.\n`);
    }

    // Save combined results
    window._allTestResults = {
      summary: {
        totalPassed,
        totalFailed,
        totalTests,
        percentage: overallPercentage,
        duration,
        timestamp: new Date().toISOString()
      },
      suites: this.results
    };

    console.log('💡 Full results available at: window._allTestResults\n');
    console.log('💡 To re-run:');
    console.log('   - testRunner.runAll() - Run all tests');
    console.log('   - testRunner.runExercises() - Run exercise tests only');
    console.log('   - testRunner.runProgressions() - Run progression tests only');
    console.log('   - testRunner.runFeatures() - Run feature tests only');
    console.log('   - testRunner.runPhaseIntegration() - Run phase tests only');
    console.log('   - testRunner.runWorkoutRotation() - Run rotation tests only');
    console.log('   - testRunner.runDeloadLogic() - Run deload tests only');
    console.log('   - testRunner.runUnlockSystem() - Run unlock tests only');
    console.log('   - testRunner.runSmartProgression() - Run progression tests only\n');

    return window._allTestResults;
  },

  // Quick stats method
  stats() {
    const all = window._allTestResults;
    if (!all) {
      console.log('❌ No test results available. Run testRunner.runAll() first.');
      return;
    }

    console.log('\n📊 QUICK STATS\n');
    console.log(`✅ Passed: ${all.summary.totalPassed}`);
    console.log(`❌ Failed: ${all.summary.totalFailed}`);
    console.log(`📈 Success Rate: ${all.summary.percentage}%`);
    console.log(`⏱️ Duration: ${all.summary.duration}s`);
    console.log(`⏰ Timestamp: ${new Date(all.summary.timestamp).toLocaleString()}\n`);
  },

  // Export results to JSON
  exportResults() {
    const all = window._allTestResults;
    if (!all) {
      console.log('❌ No test results available. Run testRunner.runAll() first.');
      return;
    }

    const json = JSON.stringify(all, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('✅ Test results exported to downloads folder');
  }
};

// Auto-run all tests on load
console.log('🧪 Test Runner loaded. Running all tests...\n');
testRunner.runAll();

// Make available globally
window.testRunner = testRunner;
