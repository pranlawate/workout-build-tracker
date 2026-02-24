Promise.all([
  import('./js/modules/workouts.js'),
  import('./js/modules/form-cues.js'),
  import('./js/modules/equipment-profiles.js'),
  import('./js/modules/complexity-tiers.js'),
  import('./js/modules/exercise-metadata.js')
]).then(([workouts, formCues, equipmentProfiles, complexityTiers, exerciseMetadata]) => {
  // Get all exercises
  const allWorkouts = workouts.getAllWorkouts();
  const allExercises = new Set();
  allWorkouts.forEach(w => w.exercises.forEach(e => allExercises.add(e.name)));

  // Add EXERCISE_DEFINITIONS
  Object.keys(workouts.EXERCISE_DEFINITIONS || {}).forEach(name => allExercises.add(name));

  const exerciseList = Array.from(allExercises).sort();

  console.log(`Checking ${exerciseList.length} exercises...\n`);

  const issues = {
    missingFormCues: [],
    missingEquipment: [],
    missingComplexity: [],
    missingMetadata: []
  };

  exerciseList.forEach(name => {
    if (!formCues.FORM_CUES[name]) {
      issues.missingFormCues.push(name);
    }
    if (!equipmentProfiles.EQUIPMENT_REQUIREMENTS[name]) {
      issues.missingEquipment.push(name);
    }
    if (!complexityTiers.EXERCISE_COMPLEXITY[name]) {
      issues.missingComplexity.push(name);
    }
    if (!exerciseMetadata.EXERCISE_METADATA[name]) {
      issues.missingMetadata.push(name);
    }
  });

  console.log('='.repeat(60));
  console.log('MISSING DATA REPORT');
  console.log('='.repeat(60));

  if (issues.missingFormCues.length > 0) {
    console.log(`\n❌ Missing Form Cues (${issues.missingFormCues.length}):`);
    issues.missingFormCues.forEach(name => console.log(`  - ${name}`));
  }

  if (issues.missingEquipment.length > 0) {
    console.log(`\n❌ Missing Equipment Profiles (${issues.missingEquipment.length}):`);
    issues.missingEquipment.forEach(name => console.log(`  - ${name}`));
  }

  if (issues.missingComplexity.length > 0) {
    console.log(`\n❌ Missing Complexity Tiers (${issues.missingComplexity.length}):`);
    issues.missingComplexity.forEach(name => console.log(`  - ${name}`));
  }

  if (issues.missingMetadata.length > 0) {
    console.log(`\n❌ Missing Exercise Metadata (${issues.missingMetadata.length}):`);
    issues.missingMetadata.forEach(name => console.log(`  - ${name}`));
  }

  const totalIssues = issues.missingFormCues.length + issues.missingEquipment.length +
                      issues.missingComplexity.length + issues.missingMetadata.length;

  console.log('\n' + '='.repeat(60));
  console.log(`Total missing entries: ${totalIssues}`);
  console.log('='.repeat(60));
});
