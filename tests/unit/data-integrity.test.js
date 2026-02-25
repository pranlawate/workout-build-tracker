import { strict as assert } from 'assert';
import { test, describe, beforeEach } from 'node:test';
import './setup.js';
import { getWorkout, getAllWorkouts, getWorkoutWithSelections } from '../../js/modules/workouts.js';
import { StorageManager } from '../../js/modules/storage.js';

describe('Data Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Default Exercise Selections', () => {
    test('should match workout definitions exactly', () => {
      // Create a fresh storage instance to get defaults
      const storage = new StorageManager();
      const selections = storage.getExerciseSelections();

      const workouts = ['UPPER_A', 'LOWER_A', 'UPPER_B', 'LOWER_B'];

      workouts.forEach(workoutName => {
        const baseWorkout = getWorkout(workoutName);

        // Check each slot has a default
        baseWorkout.exercises.forEach((exercise, index) => {
          const slotKey = `${workoutName}_SLOT_${index + 1}`;
          const defaultSelection = selections[slotKey];

          assert.ok(
            defaultSelection,
            `Missing default selection for ${slotKey}`
          );

          assert.strictEqual(
            defaultSelection,
            exercise.name,
            `Default selection mismatch: ${slotKey} should be "${exercise.name}" but got "${defaultSelection}"`
          );
        });
      });
    });

    test('should not have duplicate exercises after applying selections', () => {
      const storage = new StorageManager();
      const workouts = ['UPPER_A', 'LOWER_A', 'UPPER_B', 'LOWER_B'];

      workouts.forEach(workoutName => {
        const workout = getWorkoutWithSelections(workoutName, storage);
        const exerciseNames = workout.exercises.map(e => e.name);
        const uniqueNames = new Set(exerciseNames);

        assert.strictEqual(
          exerciseNames.length,
          uniqueNames.size,
          `Duplicate exercises found in ${workoutName}: ${exerciseNames.join(', ')}`
        );
      });
    });

    test('should preserve exercise count after applying selections', () => {
      const storage = new StorageManager();
      const workouts = ['UPPER_A', 'LOWER_A', 'UPPER_B', 'LOWER_B'];

      workouts.forEach(workoutName => {
        const baseWorkout = getWorkout(workoutName);
        const withSelections = getWorkoutWithSelections(workoutName, storage);

        assert.strictEqual(
          withSelections.exercises.length,
          baseWorkout.exercises.length,
          `${workoutName}: Exercise count changed after applying selections (expected ${baseWorkout.exercises.length}, got ${withSelections.exercises.length})`
        );
      });
    });

    test('LOWER_B should have Leg Adduction at position 4', () => {
      const storage = new StorageManager();
      const workout = getWorkoutWithSelections('LOWER_B', storage);

      assert.strictEqual(
        workout.exercises[3].name, // 0-indexed
        'Leg Adduction',
        'LOWER_B slot 4 should be Leg Adduction'
      );
    });

    test('LOWER_B should have exactly one Side Plank', () => {
      const storage = new StorageManager();
      const workout = getWorkoutWithSelections('LOWER_B', storage);
      const exerciseNames = workout.exercises.map(e => e.name);
      const sidePlankCount = exerciseNames.filter(name => name === 'Side Plank').length;

      assert.strictEqual(
        sidePlankCount,
        1,
        `LOWER_B should have exactly 1 Side Plank, found ${sidePlankCount}`
      );
    });

    test('UPPER_B should have DB Hammer Curls at position 6', () => {
      const storage = new StorageManager();
      const workout = getWorkoutWithSelections('UPPER_B', storage);

      assert.strictEqual(
        workout.exercises[5].name, // 0-indexed
        'DB Hammer Curls',
        'UPPER_B slot 6 should be DB Hammer Curls'
      );
    });

    test('UPPER_A should have correct exercises at all positions', () => {
      const storage = new StorageManager();
      const workout = getWorkoutWithSelections('UPPER_A', storage);

      const expected = [
        'DB Flat Bench Press',
        'Seated Cable Row',
        'Decline DB Press',
        'T-Bar Row',
        'DB Lateral Raises',
        'Face Pulls',
        'Tricep Pushdowns'
      ];

      expected.forEach((expectedName, index) => {
        assert.strictEqual(
          workout.exercises[index].name,
          expectedName,
          `UPPER_A slot ${index + 1} should be ${expectedName}`
        );
      });
    });
  });

  describe('Exercise Definition Completeness', () => {
    test('all exercises should have positive sets', () => {
      const workouts = getAllWorkouts();

      workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          assert.ok(
            exercise.sets > 0,
            `${workout.name} - ${exercise.name}: sets must be positive (got ${exercise.sets})`
          );
        });
      });
    });

    test('all exercises should have valid repRange', () => {
      const workouts = getAllWorkouts();

      workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          assert.ok(
            exercise.repRange,
            `${workout.name} - ${exercise.name}: missing repRange`
          );

          // Should match patterns like: "8-12", "30s", "10-12/side", "30s/side"
          const validPattern = /^\d+(-\d+)?(s)?(\/side)?$/;
          assert.ok(
            validPattern.test(exercise.repRange),
            `${workout.name} - ${exercise.name}: invalid repRange format "${exercise.repRange}"`
          );
        });
      });
    });

    test('all exercises should have valid rirTarget', () => {
      const workouts = getAllWorkouts();

      workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          assert.ok(
            exercise.rirTarget,
            `${workout.name} - ${exercise.name}: missing rirTarget`
          );

          // Should match patterns like: "2-3" or "2"
          const validPattern = /^\d+(-\d+)?$/;
          assert.ok(
            validPattern.test(exercise.rirTarget),
            `${workout.name} - ${exercise.name}: invalid rirTarget format "${exercise.rirTarget}"`
          );
        });
      });
    });

    test('all exercises should have non-negative startingWeight', () => {
      const workouts = getAllWorkouts();

      workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          assert.ok(
            exercise.startingWeight >= 0,
            `${workout.name} - ${exercise.name}: startingWeight must be >= 0 (got ${exercise.startingWeight})`
          );
        });
      });
    });

    test('all exercises should have non-negative weightIncrement', () => {
      const workouts = getAllWorkouts();

      workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          assert.ok(
            exercise.weightIncrement >= 0,
            `${workout.name} - ${exercise.name}: weightIncrement must be >= 0 (got ${exercise.weightIncrement})`
          );
        });
      });
    });
  });
});
