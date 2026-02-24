import('./js/modules/workouts.js').then(m => {
  const workouts = m.getAllWorkouts();
  const allEx = new Set();
  workouts.forEach(w => w.exercises.forEach(e => allEx.add(e.name)));
  console.log('Workout exercises:', allEx.size);

  const defs = Object.keys(m.EXERCISE_DEFINITIONS || {});
  console.log('EXERCISE_DEFINITIONS:', defs.length);

  // Count unique
  const defsNotInWorkouts = defs.filter(d => !allEx.has(d));
  console.log('Total unique:', allEx.size + defsNotInWorkouts.length);

  // List all exercise names
  const all = Array.from(allEx).concat(defsNotInWorkouts);
  console.log('\nAll exercises:');
  all.sort().forEach((name, i) => console.log(`${i + 1}. ${name}`));
});
