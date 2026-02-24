// Set orchestration mode to suppress summaries
window._TEST_ORCHESTRATED = true;

Promise.all([
  import('./tests/test-all-exercises.js'),
  import('./tests/test-all-progressions.js'),
  import('./tests/test-workout-rotation.js'),
  import('./tests/test-unlock-system.js')
]).then(async () => {
  // Wait for tests to complete
  await new Promise(r => setTimeout(r, 500));

  console.log('\n' + '='.repeat(70));
  console.log('FAILED TESTS REPORT');
  console.log('='.repeat(70));

  const suites = [
    { name: 'Exercise Tests', results: window._exerciseTestResults },
    { name: 'Progression Tests', results: window._progressionTestResults },
    { name: 'Workout Rotation Tests', results: window._workoutRotationTestResults },
    { name: 'Unlock System Tests', results: window._unlockSystemTestResults }
  ];

  suites.forEach(suite => {
    if (!suite.results) {
      console.log(`\n❌ ${suite.name}: No results found`);
      return;
    }

    const failures = suite.results.tests.filter(t => !t.passed);
    if (failures.length === 0) {
      console.log(`\n✅ ${suite.name}: All tests passed`);
      return;
    }

    console.log(`\n❌ ${suite.name}: ${failures.length} failures`);
    console.log('-'.repeat(70));

    failures.forEach((test, i) => {
      console.log(`\n${i + 1}. [${test.category}] ${test.name}`);
      if (test.details) {
        console.log(`   Details: ${test.details}`);
      }
    });
  });

  console.log('\n' + '='.repeat(70));
});
