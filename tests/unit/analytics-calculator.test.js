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

    test('should calculate trend comparing current to previous period', () => {
      const today = new Date();
      const currentPeriodDate = new Date(today);
      currentPeriodDate.setDate(currentPeriodDate.getDate() - 3);
      const previousPeriodDate = new Date(today);
      previousPeriodDate.setDate(previousPeriodDate.getDate() - 10);

      // Previous period: 1000kg
      storage.saveExerciseHistory('UPPER_A - DB Bench Press', [
        {
          date: previousPeriodDate.toISOString().split('T')[0],
          sets: [
            { weight: 20, reps: 10, rir: 2 }, // 200kg
            { weight: 20, reps: 10, rir: 2 }, // 200kg
            { weight: 20, reps: 10, rir: 2 }, // 200kg
            { weight: 20, reps: 10, rir: 2 }, // 200kg
            { weight: 20, reps: 10, rir: 2 }  // 200kg
          ]
        }
      ]);

      // Current period: 1500kg
      storage.saveExerciseHistory('UPPER_A - DB Row', [
        {
          date: currentPeriodDate.toISOString().split('T')[0],
          sets: [
            { weight: 30, reps: 10, rir: 2 }, // 300kg
            { weight: 30, reps: 10, rir: 2 }, // 300kg
            { weight: 30, reps: 10, rir: 2 }, // 300kg
            { weight: 30, reps: 10, rir: 2 }, // 300kg
            { weight: 30, reps: 10, rir: 2 }  // 300kg
          ]
        }
      ]);

      const result = calculator.calculateVolume(7);

      // Trend: (1500 - 1000) / 1000 * 100 = 50%
      assert.strictEqual(result.total, 1500);
      assert.strictEqual(result.trend, 50);
    });

    test('should count sessions correctly using exercise history dates', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Two UPPER_A workouts on different days
      storage.saveExerciseHistory('UPPER_A - DB Bench Press', [
        {
          date: today,
          sets: [{ weight: 20, reps: 10, rir: 2 }]
        },
        {
          date: yesterdayStr,
          sets: [{ weight: 20, reps: 10, rir: 2 }]
        }
      ]);

      storage.saveExerciseHistory('UPPER_A - DB Row', [
        {
          date: today,
          sets: [{ weight: 20, reps: 10, rir: 2 }]
        },
        {
          date: yesterdayStr,
          sets: [{ weight: 20, reps: 10, rir: 2 }]
        }
      ]);

      const result = calculator.calculateVolume(7);

      // Should count 2 sessions (one per day) not 4 (one per exercise)
      assert.strictEqual(result.byWorkoutType['UPPER_A'].sessions, 2);
      assert.strictEqual(result.byWorkoutType['UPPER_A'].volume, 800); // 4 × 200
    });

    test('should group daily volume correctly', () => {
      const day1 = new Date().toISOString().split('T')[0];
      const day2Date = new Date();
      day2Date.setDate(day2Date.getDate() - 2);
      const day2 = day2Date.toISOString().split('T')[0];

      storage.saveExerciseHistory('UPPER_A - DB Bench Press', [
        {
          date: day1,
          sets: [{ weight: 20, reps: 10, rir: 2 }] // 200kg
        },
        {
          date: day2,
          sets: [{ weight: 30, reps: 10, rir: 2 }] // 300kg
        }
      ]);

      storage.saveExerciseHistory('UPPER_A - DB Row', [
        {
          date: day1,
          sets: [{ weight: 15, reps: 10, rir: 2 }] // 150kg
        }
      ]);

      const result = calculator.calculateVolume(7);

      assert.strictEqual(result.daily.length, 2);
      // Results should be sorted by date
      assert.strictEqual(result.daily[0].date, day2);
      assert.strictEqual(result.daily[0].volume, 300);
      assert.strictEqual(result.daily[1].date, day1);
      assert.strictEqual(result.daily[1].volume, 350); // 200 + 150
    });

    test('should filter out old data beyond cutoff date', () => {
      const today = new Date();
      const recentDate = new Date(today);
      recentDate.setDate(recentDate.getDate() - 3);
      const oldDate = new Date(today);
      oldDate.setDate(oldDate.getDate() - 10);

      storage.saveExerciseHistory('UPPER_A - DB Bench Press', [
        {
          date: recentDate.toISOString().split('T')[0],
          sets: [{ weight: 20, reps: 10, rir: 2 }] // 200kg - should count
        },
        {
          date: oldDate.toISOString().split('T')[0],
          sets: [{ weight: 30, reps: 10, rir: 2 }] // 300kg - should NOT count
        }
      ]);

      const result = calculator.calculateVolume(7);

      assert.strictEqual(result.total, 200);
      assert.strictEqual(result.daily.length, 1);
    });

    test('should handle multiple workout types separately', () => {
      const today = new Date().toISOString().split('T')[0];

      storage.saveExerciseHistory('UPPER_A - DB Bench Press', [
        {
          date: today,
          sets: [{ weight: 20, reps: 10, rir: 2 }] // 200kg
        }
      ]);

      storage.saveExerciseHistory('LOWER_A - Squat', [
        {
          date: today,
          sets: [{ weight: 40, reps: 10, rir: 2 }] // 400kg
        }
      ]);

      const result = calculator.calculateVolume(7);

      assert.strictEqual(result.total, 600);
      assert.strictEqual(result.byWorkoutType['UPPER_A'].volume, 200);
      assert.strictEqual(result.byWorkoutType['UPPER_A'].sessions, 1);
      assert.strictEqual(result.byWorkoutType['LOWER_A'].volume, 400);
      assert.strictEqual(result.byWorkoutType['LOWER_A'].sessions, 1);
    });

    test('should handle malformed data gracefully', () => {
      const today = new Date().toISOString().split('T')[0];

      storage.saveExerciseHistory('UPPER_A - DB Bench Press', [
        {
          date: today,
          sets: [
            { weight: 20, reps: 10, rir: 2 }, // 200kg - valid
            { weight: null, reps: 10, rir: 2 }, // invalid
            { weight: 20, reps: null, rir: 2 }, // invalid
            { weight: 20, reps: 10, rir: 2 }  // 200kg - valid
          ]
        },
        null, // malformed entry
        {
          date: today,
          sets: null // malformed sets
        },
        {
          // missing date
          sets: [{ weight: 20, reps: 10, rir: 2 }]
        }
      ]);

      const result = calculator.calculateVolume(7);

      // Should only count the 2 valid sets
      assert.strictEqual(result.total, 400);
    });
  });

  describe('calculatePerformanceMetrics', () => {
    test('should return zeros when no workout history exists', () => {
      const result = calculator.calculatePerformanceMetrics(28);

      assert.strictEqual(result.avgRIR, 0);
      assert.deepStrictEqual(result.rirTrend, []);
      assert.strictEqual(result.compliance, 0);
      assert.strictEqual(result.progressedCount, 0);
      assert.deepStrictEqual(result.topProgressors, []);
    });

    test('should calculate compliance rate correctly', () => {
      // Add rotation data
      const today = new Date().toISOString().split('T')[0];
      const day2 = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const day3 = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const rotation = {
        sequence: [
          { workout: 'UPPER_A', date: today, completed: true },
          { workout: 'LOWER_A', date: day2, completed: true },
          { workout: 'UPPER_B', date: day3, completed: true }
        ]
      };
      localStorage.setItem('build_workout_rotation', JSON.stringify(rotation));

      // Add exercise history for these dates
      storage.saveExerciseHistory('UPPER_A - DB Bench Press', [
        { date: today, sets: [{ weight: 20, reps: 10, rir: 2 }] }
      ]);
      storage.saveExerciseHistory('LOWER_A - Squat', [
        { date: day2, sets: [{ weight: 40, reps: 10, rir: 2 }] }
      ]);
      storage.saveExerciseHistory('UPPER_B - DB Incline Press', [
        { date: day3, sets: [{ weight: 20, reps: 10, rir: 2 }] }
      ]);

      const result = calculator.calculatePerformanceMetrics(7);

      // 3 workouts in 7 days, expected 3 = 100%
      assert.strictEqual(result.compliance, 100);
    });
  });
});
