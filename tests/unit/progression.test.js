import { strict as assert } from 'assert';
import { test, describe } from 'node:test';
import {
  shouldIncreaseWeight,
  getProgressionStatus,
  getNextWeight
} from '../../src/js/modules/progression.js';

describe('Progression Engine', () => {
  describe('shouldIncreaseWeight', () => {
    test('should return true when all sets hit max reps at RIR 2-3', () => {
      const sets = [
        { weight: 20, reps: 12, rir: 2 },
        { weight: 20, reps: 12, rir: 2 },
        { weight: 20, reps: 12, rir: 3 }
      ];
      const exercise = { repRange: '8-12', rirTarget: '2-3' };

      const result = shouldIncreaseWeight(sets, exercise);
      assert.strictEqual(result, true);
    });

    test('should return false when reps below max range', () => {
      const sets = [
        { weight: 20, reps: 10, rir: 2 },
        { weight: 20, reps: 11, rir: 2 },
        { weight: 20, reps: 11, rir: 2 }
      ];
      const exercise = { repRange: '8-12', rirTarget: '2-3' };

      const result = shouldIncreaseWeight(sets, exercise);
      assert.strictEqual(result, false);
    });

    test('should return false when RIR too low', () => {
      const sets = [
        { weight: 20, reps: 12, rir: 1 },
        { weight: 20, reps: 12, rir: 0 },
        { weight: 20, reps: 12, rir: 1 }
      ];
      const exercise = { repRange: '8-12', rirTarget: '2-3' };

      const result = shouldIncreaseWeight(sets, exercise);
      assert.strictEqual(result, false);
    });

    test('should return false when not all sets hit max', () => {
      const sets = [
        { weight: 20, reps: 12, rir: 2 },
        { weight: 20, reps: 11, rir: 2 },
        { weight: 20, reps: 12, rir: 2 }
      ];
      const exercise = { repRange: '8-12', rirTarget: '2-3' };

      const result = shouldIncreaseWeight(sets, exercise);
      assert.strictEqual(result, false);
    });
  });

  describe('getProgressionStatus', () => {
    test('should return "ready" when criteria met', () => {
      const history = [{
        date: '2026-02-03',
        sets: [
          { weight: 20, reps: 12, rir: 2 },
          { weight: 20, reps: 12, rir: 2 },
          { weight: 20, reps: 12, rir: 2 }
        ]
      }];
      const exercise = { repRange: '8-12', rirTarget: '2-3' };

      const status = getProgressionStatus(history, exercise);
      assert.strictEqual(status, 'ready');
    });

    test('should return "normal" for in-progress sets', () => {
      const history = [{
        date: '2026-02-03',
        sets: [
          { weight: 20, reps: 10, rir: 2 },
          { weight: 20, reps: 11, rir: 2 },
          { weight: 20, reps: 11, rir: 2 }
        ]
      }];
      const exercise = { repRange: '8-12', rirTarget: '2-3' };

      const status = getProgressionStatus(history, exercise);
      assert.strictEqual(status, 'normal');
    });

    test('should return "plateau" after 3 sessions same weight', () => {
      const history = [
        {
          date: '2026-01-30',
          sets: [{ weight: 20, reps: 10, rir: 2 }]
        },
        {
          date: '2026-02-01',
          sets: [{ weight: 20, reps: 10, rir: 2 }]
        },
        {
          date: '2026-02-03',
          sets: [{ weight: 20, reps: 10, rir: 2 }]
        }
      ];
      const exercise = { repRange: '8-12', rirTarget: '2-3' };

      const status = getProgressionStatus(history, exercise);
      assert.strictEqual(status, 'plateau');
    });
  });

  describe('getNextWeight', () => {
    test('should add increment when ready to progress', () => {
      const currentWeight = 20;
      const increment = 2.5;
      const shouldProgress = true;

      const nextWeight = getNextWeight(currentWeight, increment, shouldProgress);
      assert.strictEqual(nextWeight, 22.5);
    });

    test('should keep weight when not ready', () => {
      const currentWeight = 20;
      const increment = 2.5;
      const shouldProgress = false;

      const nextWeight = getNextWeight(currentWeight, increment, shouldProgress);
      assert.strictEqual(nextWeight, 20);
    });
  });
});
