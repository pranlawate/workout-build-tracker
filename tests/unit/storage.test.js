import { strict as assert } from 'assert';
import { test, describe, beforeEach } from 'node:test';
import './setup.js';
import { StorageManager } from '../../src/js/modules/storage.js';

describe('StorageManager', () => {
  let storage;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageManager();
  });

  test('should save and retrieve workout rotation', () => {
    const rotation = {
      lastWorkout: 'UPPER_A',
      lastDate: '2026-02-03',
      nextSuggested: 'LOWER_A'
    };

    storage.saveRotation(rotation);
    const retrieved = storage.getRotation();

    assert.deepStrictEqual(retrieved, rotation);
  });

  test('should return default rotation if none exists', () => {
    const rotation = storage.getRotation();

    assert.strictEqual(rotation.lastWorkout, null);
    assert.strictEqual(rotation.nextSuggested, 'UPPER_A');
  });

  test('should save exercise history', () => {
    const exerciseKey = 'UPPER_A - DB Bench Press';
    const history = [{
      date: '2026-02-03',
      sets: [
        { weight: 7.5, reps: 10, rir: 2 },
        { weight: 7.5, reps: 11, rir: 2 },
        { weight: 7.5, reps: 12, rir: 2 }
      ],
      progressionStatus: 'ready'
    }];

    storage.saveExerciseHistory(exerciseKey, history);
    const retrieved = storage.getExerciseHistory(exerciseKey);

    assert.deepStrictEqual(retrieved, history);
  });

  test('should limit exercise history to 8 most recent workouts', () => {
    const exerciseKey = 'UPPER_A - DB Bench Press';
    const history = Array(10).fill(null).map((_, i) => ({
      date: `2026-02-${String(i + 1).padStart(2, '0')}`,
      sets: [{ weight: 10, reps: 10, rir: 2 }],
      progressionStatus: 'normal'
    }));

    storage.saveExerciseHistory(exerciseKey, history);
    const retrieved = storage.getExerciseHistory(exerciseKey);

    assert.strictEqual(retrieved.length, 8);
    // slice(-8) keeps last 8 items, so oldest kept is index 2 (2026-02-03)
    assert.strictEqual(retrieved[0].date, '2026-02-03');
  });

  // Error handling tests
  describe('error handling', () => {
    test('should handle corrupt rotation JSON data gracefully', () => {
      localStorage.setItem('build_workout_rotation', 'invalid{json}');
      const rotation = storage.getRotation();

      // Should return default instead of crashing
      assert.strictEqual(rotation.lastWorkout, null);
      assert.strictEqual(rotation.nextSuggested, 'UPPER_A');
    });

    test('should handle corrupt exercise history JSON data gracefully', () => {
      const exerciseKey = 'UPPER_A - DB Bench Press';
      localStorage.setItem('build_exercise_' + exerciseKey, 'not{valid]json');
      const history = storage.getExerciseHistory(exerciseKey);

      // Should return empty array instead of crashing
      assert.deepStrictEqual(history, []);
    });

    test('should handle non-array exercise history data gracefully', () => {
      const exerciseKey = 'UPPER_A - DB Bench Press';
      localStorage.setItem('build_exercise_' + exerciseKey, '{"not":"an array"}');
      const history = storage.getExerciseHistory(exerciseKey);

      // Should return empty array for invalid data structure
      assert.deepStrictEqual(history, []);
    });

    test('should throw error for invalid rotation input', () => {
      assert.throws(() => {
        storage.saveRotation(null);
      }, /Invalid rotation data/);

      assert.throws(() => {
        storage.saveRotation('not an object');
      }, /Invalid rotation data/);
    });

    test('should throw error for invalid exercise key', () => {
      assert.throws(() => {
        storage.saveExerciseHistory('', []);
      }, /Invalid exerciseKey/);

      assert.throws(() => {
        storage.saveExerciseHistory(null, []);
      }, /Invalid exerciseKey/);

      assert.throws(() => {
        storage.getExerciseHistory('');
      }, /Invalid exerciseKey/);
    });

    test('should throw error for invalid history input', () => {
      assert.throws(() => {
        storage.saveExerciseHistory('valid-key', 'not an array');
      }, /Invalid history/);

      assert.throws(() => {
        storage.saveExerciseHistory('valid-key', null);
      }, /Invalid history/);
    });
  });
});
