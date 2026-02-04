import { strict as assert } from 'assert';
import { test, describe, beforeEach } from 'node:test';
import './setup.js';
import { WorkoutManager } from '../../src/js/modules/workout-manager.js';
import { StorageManager } from '../../src/js/modules/storage.js';

describe('WorkoutManager', () => {
  let manager;
  let storage;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageManager();
    manager = new WorkoutManager(storage);
  });

  test('should suggest UPPER_A as first workout', () => {
    const next = manager.getNextWorkout();
    assert.strictEqual(next, 'UPPER_A');
  });

  test('should rotate to LOWER_A after UPPER_A', () => {
    storage.saveRotation({
      lastWorkout: 'UPPER_A',
      lastDate: '2026-02-03',
      nextSuggested: 'LOWER_A'
    });

    const next = manager.getNextWorkout();
    assert.strictEqual(next, 'LOWER_A');
  });

  test('should follow Upper → Lower → Upper → Lower rotation', () => {
    const expected = ['UPPER_A', 'LOWER_A', 'UPPER_B', 'LOWER_B', 'UPPER_A'];

    let current = manager.getNextWorkout();
    assert.strictEqual(current, expected[0]);

    for (let i = 1; i < expected.length; i++) {
      manager.completeWorkout(current);
      current = manager.getNextWorkout();
      assert.strictEqual(current, expected[i]);
    }
  });

  test('should check if muscles need recovery', () => {
    // Last workout was UPPER_A (48 hours ago)
    const lastDate = new Date('2026-02-01T10:00:00Z');
    storage.saveRotation({
      lastWorkout: 'UPPER_A',
      lastDate: lastDate.toISOString(),
      nextSuggested: 'LOWER_A'
    });

    // Trying to do UPPER_B after only 24 hours
    const now = new Date('2026-02-02T10:00:00Z');
    const needsRecovery = manager.checkMuscleRecovery('UPPER_B', now);

    assert.strictEqual(needsRecovery.warn, true);
    assert.ok(needsRecovery.muscles.length > 0);
  });

  test('should allow consecutive Upper → Lower workouts', () => {
    // Last workout was UPPER_A (12 hours ago)
    const lastDate = new Date('2026-02-03T10:00:00Z');
    storage.saveRotation({
      lastWorkout: 'UPPER_A',
      lastDate: lastDate.toISOString(),
      nextSuggested: 'LOWER_A'
    });

    // Trying to do LOWER_A after 12 hours (should be fine)
    const now = new Date('2026-02-03T22:00:00Z');
    const needsRecovery = manager.checkMuscleRecovery('LOWER_A', now);

    assert.strictEqual(needsRecovery.warn, false);
  });
});
