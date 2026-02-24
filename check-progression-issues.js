Promise.all([
  import('./js/modules/progression-pathways.js'),
  import('./js/modules/workouts.js')
]).then(([progressionPathways, workouts]) => {
  // Get all exercise names from workouts
  const allWorkouts = workouts.getAllWorkouts();
  const allExerciseNames = new Set();
  allWorkouts.forEach(w => w.exercises.forEach(e => allExerciseNames.add(e.name)));
  Object.keys(workouts.EXERCISE_DEFINITIONS || {}).forEach(name => allExerciseNames.add(name));

  console.log(`Found ${allExerciseNames.size} exercises in workout system`);

  const PROGRESSION_PATHS = progressionPathways.PROGRESSION_PATHS;
  const slotKeys = Object.keys(PROGRESSION_PATHS);

  console.log(`Found ${slotKeys.length} progression slots\n`);

  const issues = {
    missingCurrent: [],
    missingEasier: [],
    missingHarder: [],
    missingAlternate: []
  };

  slotKeys.forEach(slotKey => {
    const pathway = PROGRESSION_PATHS[slotKey];

    // Check current
    if (pathway.current && !allExerciseNames.has(pathway.current)) {
      issues.missingCurrent.push({ slot: slotKey, exercise: pathway.current });
    }

    // Check easier
    if (pathway.easier) {
      pathway.easier.forEach(ex => {
        if (!allExerciseNames.has(ex)) {
          issues.missingEasier.push({ slot: slotKey, exercise: ex });
        }
      });
    }

    // Check harder
    if (pathway.harder) {
      pathway.harder.forEach(ex => {
        if (!allExerciseNames.has(ex)) {
          issues.missingHarder.push({ slot: slotKey, exercise: ex });
        }
      });
    }

    // Check alternate
    if (pathway.alternate) {
      pathway.alternate.forEach(ex => {
        if (!allExerciseNames.has(ex)) {
          issues.missingAlternate.push({ slot: slotKey, exercise: ex });
        }
      });
    }
  });

  console.log('='.repeat(70));
  console.log('PROGRESSION PATHWAY ISSUES');
  console.log('='.repeat(70));

  if (issues.missingCurrent.length > 0) {
    console.log(`\n❌ Missing Current Exercises (${issues.missingCurrent.length}):`);
    issues.missingCurrent.forEach(({ slot, exercise }) => {
      console.log(`  ${slot}: "${exercise}"`);
    });
  }

  if (issues.missingEasier.length > 0) {
    console.log(`\n❌ Missing Easier Progression Exercises (${issues.missingEasier.length}):`);
    issues.missingEasier.forEach(({ slot, exercise }) => {
      console.log(`  ${slot}: "${exercise}"`);
    });
  }

  if (issues.missingHarder.length > 0) {
    console.log(`\n❌ Missing Harder Progression Exercises (${issues.missingHarder.length}):`);
    issues.missingHarder.forEach(({ slot, exercise }) => {
      console.log(`  ${slot}: "${exercise}"`);
    });
  }

  if (issues.missingAlternate.length > 0) {
    console.log(`\n❌ Missing Alternate Progression Exercises (${issues.missingAlternate.length}):`);
    issues.missingAlternate.forEach(({ slot, exercise }) => {
      console.log(`  ${slot}: "${exercise}"`);
    });
  }

  const totalIssues = issues.missingCurrent.length + issues.missingEasier.length +
                      issues.missingHarder.length + issues.missingAlternate.length;

  console.log('\n' + '='.repeat(70));
  console.log(`Total missing exercise references: ${totalIssues}`);
  console.log('='.repeat(70));
});
