import { strict as assert } from 'assert';
import { test, describe } from 'node:test';
import { WORKOUTS, getWorkout, getAllWorkouts } from '../../src/js/modules/workouts.js';

describe('Workout Definitions', () => {
  test('should have 4 workout types', () => {
    const workouts = getAllWorkouts();
    assert.strictEqual(workouts.length, 4);
  });

  test('should get UPPER_A workout', () => {
    const workout = getWorkout('UPPER_A');

    assert.strictEqual(workout.name, 'UPPER_A');
    assert.strictEqual(workout.displayName, 'Upper A - Horizontal');
    assert.strictEqual(workout.exercises.length, 7);
    assert.strictEqual(workout.exercises[0].name, 'DB Flat Bench Press');
  });

  test('UPPER_A first exercise should have correct structure', () => {
    const workout = getWorkout('UPPER_A');
    const exercise = workout.exercises[0];

    assert.strictEqual(exercise.name, 'DB Flat Bench Press');
    assert.strictEqual(exercise.sets, 3);
    assert.strictEqual(exercise.repRange, '8-12');
    assert.strictEqual(exercise.rirTarget, '2-3');
    assert.strictEqual(exercise.startingWeight, 7.5);
    assert.strictEqual(exercise.weightIncrement, 2.5);
  });

  test('should validate all exercises have required fields', () => {
    const workouts = getAllWorkouts();

    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        assert.ok(exercise.name, 'Exercise must have name');
        assert.ok(exercise.sets > 0, 'Exercise must have sets');
        assert.ok(exercise.repRange, 'Exercise must have repRange');
        assert.ok(exercise.rirTarget, 'Exercise must have rirTarget');
        assert.ok(exercise.startingWeight >= 0, 'Exercise must have startingWeight');
      });
    });
  });

  test('should have correct workout rotation order', () => {
    const rotationOrder = ['UPPER_A', 'LOWER_A', 'UPPER_B', 'LOWER_B'];
    const workouts = getAllWorkouts();

    rotationOrder.forEach((expectedName, index) => {
      assert.strictEqual(workouts[index].name, expectedName);
    });
  });
});
