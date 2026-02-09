import { strict as assert } from 'assert';
import { test, describe, beforeEach } from 'node:test';
import './setup.js';
import { AnalyticsCalculator } from '../../js/modules/analytics-calculator.js';
import { StorageManager } from '../../js/modules/storage.js';

describe('AnalyticsCalculator', () => {
  let storage;
  let calculator;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageManager();
    calculator = new AnalyticsCalculator(storage);
  });

  describe('Constructor', () => {
    test('should accept storage instance via dependency injection', () => {
      assert.ok(calculator.storage);
      assert.strictEqual(calculator.storage, storage);
    });
  });

  describe('calculateVolume', () => {
    test('should return zeros when no workout history exists', () => {
      const result = calculator.calculateVolume(7);

      assert.strictEqual(result.total, 0);
      assert.deepStrictEqual(result.byWorkoutType, {});
      assert.strictEqual(result.trend, 0);
      assert.deepStrictEqual(result.daily, []);
    });

    test('should calculate total volume from exercise history', () => {
      // Add workout data
      const exercises = ['UPPER_A - DB Bench Press', 'UPPER_A - DB Row'];
      const today = new Date().toISOString().split('T')[0];

      exercises.forEach(exerciseKey => {
        const history = [{
          date: today,
          sets: [
            { weight: 20, reps: 10, rir: 2 }, // 200kg
            { weight: 20, reps: 11, rir: 2 }, // 220kg
            { weight: 20, reps: 12, rir: 3 }  // 240kg
          ]
        }];
        storage.saveExerciseHistory(exerciseKey, history);
      });

      const result = calculator.calculateVolume(7);

      // 2 exercises × 660kg = 1320kg total
      assert.strictEqual(result.total, 1320);
      assert.ok(result.byWorkoutType['UPPER_A']);
      assert.strictEqual(result.byWorkoutType['UPPER_A'].volume, 1320);
      assert.strictEqual(result.daily.length, 1);
      assert.strictEqual(result.daily[0].volume, 1320);
    });
  });
});
