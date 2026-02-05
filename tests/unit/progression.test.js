import { strict as assert } from 'assert';
import { test, describe } from 'node:test';
import {
  shouldIncreaseWeight,
  getProgressionStatus,
  getNextWeight
} from '../../js/modules/progression.js';

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

    // Special format tests
    describe('single RIR value', () => {
      test('should handle single RIR value (Face Pulls)', () => {
        const sets = [
          { weight: 12.5, reps: 20, rir: 3 },
          { weight: 12.5, reps: 20, rir: 3 }
        ];
        const exercise = { repRange: '15-20', rirTarget: '3' };

        const result = shouldIncreaseWeight(sets, exercise);
        assert.strictEqual(result, true);
      });

      test('should return false with single RIR when below target', () => {
        const sets = [
          { weight: 12.5, reps: 20, rir: 2 },
          { weight: 12.5, reps: 20, rir: 3 }
        ];
        const exercise = { repRange: '15-20', rirTarget: '3' };

        const result = shouldIncreaseWeight(sets, exercise);
        assert.strictEqual(result, false);
      });
    });

    describe('time-based rep ranges', () => {
      test('should handle time-based rep range (Plank)', () => {
        const sets = [
          { weight: 0, reps: 60, rir: 2 },
          { weight: 0, reps: 60, rir: 2 },
          { weight: 0, reps: 60, rir: 3 }
        ];
        const exercise = { repRange: '30-60s', rirTarget: '2-3' };

        const result = shouldIncreaseWeight(sets, exercise);
        assert.strictEqual(result, true);
      });

      test('should return false when time-based reps below max', () => {
        const sets = [
          { weight: 0, reps: 45, rir: 2 },
          { weight: 0, reps: 50, rir: 2 },
          { weight: 0, reps: 55, rir: 2 }
        ];
        const exercise = { repRange: '30-60s', rirTarget: '2-3' };

        const result = shouldIncreaseWeight(sets, exercise);
        assert.strictEqual(result, false);
      });
    });

    describe('unilateral rep ranges', () => {
      test('should handle unilateral rep range (Dead Bug)', () => {
        const sets = [
          { weight: 0, reps: 12, rir: 2 },
          { weight: 0, reps: 12, rir: 2 },
          { weight: 0, reps: 12, rir: 3 }
        ];
        const exercise = { repRange: '10-12/side', rirTarget: '2-3' };

        const result = shouldIncreaseWeight(sets, exercise);
        assert.strictEqual(result, true);
      });

      test('should return false when unilateral reps below max', () => {
        const sets = [
          { weight: 0, reps: 10, rir: 2 },
          { weight: 0, reps: 11, rir: 2 },
          { weight: 0, reps: 11, rir: 2 }
        ];
        const exercise = { repRange: '10-12/side', rirTarget: '2-3' };

        const result = shouldIncreaseWeight(sets, exercise);
        assert.strictEqual(result, false);
      });
    });

    describe('time-based unilateral rep ranges', () => {
      test('should handle time+unilateral rep range (Side Plank)', () => {
        const sets = [
          { weight: 0, reps: 30, rir: 2 },
          { weight: 0, reps: 30, rir: 2 },
          { weight: 0, reps: 30, rir: 3 }
        ];
        const exercise = { repRange: '30s/side', rirTarget: '2-3' };

        const result = shouldIncreaseWeight(sets, exercise);
        assert.strictEqual(result, true);
      });

      test('should return false when time+unilateral reps below max', () => {
        const sets = [
          { weight: 0, reps: 25, rir: 2 },
          { weight: 0, reps: 28, rir: 2 },
          { weight: 0, reps: 29, rir: 2 }
        ];
        const exercise = { repRange: '30s/side', rirTarget: '2-3' };

        const result = shouldIncreaseWeight(sets, exercise);
        assert.strictEqual(result, false);
      });
    });

    describe('input validation', () => {
      test('should return false for empty sets array', () => {
        const sets = [];
        const exercise = { repRange: '8-12', rirTarget: '2-3' };

        const result = shouldIncreaseWeight(sets, exercise);
        assert.strictEqual(result, false);
      });

      test('should return false for null sets', () => {
        const sets = null;
        const exercise = { repRange: '8-12', rirTarget: '2-3' };

        const result = shouldIncreaseWeight(sets, exercise);
        assert.strictEqual(result, false);
      });

      test('should throw error for invalid exercise object', () => {
        const sets = [{ weight: 20, reps: 12, rir: 2 }];

        assert.throws(
          () => shouldIncreaseWeight(sets, null),
          /Invalid exercise/
        );
      });

      test('should throw error for missing repRange', () => {
        const sets = [{ weight: 20, reps: 12, rir: 2 }];
        const exercise = { rirTarget: '2-3' };

        assert.throws(
          () => shouldIncreaseWeight(sets, exercise),
          /repRange and rirTarget/
        );
      });

      test('should throw error for missing rirTarget', () => {
        const sets = [{ weight: 20, reps: 12, rir: 2 }];
        const exercise = { repRange: '8-12' };

        assert.throws(
          () => shouldIncreaseWeight(sets, exercise),
          /repRange and rirTarget/
        );
      });

      test('should throw error for invalid repRange format', () => {
        const sets = [{ weight: 20, reps: 12, rir: 2 }];
        const exercise = { repRange: 'invalid', rirTarget: '2-3' };

        assert.throws(
          () => shouldIncreaseWeight(sets, exercise),
          /Invalid rep range format/
        );
      });

      test('should throw error for invalid rirTarget format', () => {
        const sets = [{ weight: 20, reps: 12, rir: 2 }];
        const exercise = { repRange: '8-12', rirTarget: 'invalid' };

        assert.throws(
          () => shouldIncreaseWeight(sets, exercise),
          /Invalid RIR target format/
        );
      });
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
