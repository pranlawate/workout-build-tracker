import { strict as assert } from 'assert';
import { test, describe, beforeEach } from 'node:test';
import './setup.js';

// Import will fail - we haven't created the file yet
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
    assert.strictEqual(retrieved[0].date, '2026-02-03'); // Newest first
  });
});
