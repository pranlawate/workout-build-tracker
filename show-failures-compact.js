// Compact failure reporter - only shows failing tests
window._TEST_ORCHESTRATED = true;

Promise.all([
  import('./tests/test-all-exercises.js'),
  import('./tests/test-all-progressions.js'),
  import('./tests/test-workout-rotation.js'),
  import('./tests/test-unlock-system.js')
]).then(async () => {
  await new Promise(r => setTimeout(r, 500));

  const suites = [
    { name: 'Exercise', key: '_exerciseTestResults' },
    { name: 'Progression', key: '_progressionTestResults' },
    { name: 'Rotation', key: '_workoutRotationTestResults' },
    { name: 'Unlock', key: '_unlockSystemTestResults' }
  ];

  const allFailures = [];

  suites.forEach(suite => {
    const results = window[suite.key];
    if (results) {
      results.tests.filter(t => !t.passed).forEach(t => {
        allFailures.push(`${suite.name}: ${t.name} | ${t.details || 'No details'}`);
      });
    }
  });

  console.log(`\n📋 ${allFailures.length} FAILURES:\n`);
  allFailures.forEach((f, i) => console.log(`${i + 1}. ${f}`));
});
