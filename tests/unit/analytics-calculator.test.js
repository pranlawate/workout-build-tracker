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

    test('should calculate avgRIR from all sets in period', () => {
      // Add exercise data with known RIR values
      const today = new Date().toISOString().split('T')[0];

      storage.saveExerciseHistory('UPPER_A - DB Bench Press', [{
        date: today,
        sets: [
          { weight: 20, reps: 10, rir: 2 },
          { weight: 20, reps: 11, rir: 3 },
          { weight: 20, reps: 12, rir: 4 }
        ]
      }]);

      const result = calculator.calculatePerformanceMetrics(7);

      // avgRIR should be (2+3+4)/3 = 3
      assert.strictEqual(result.avgRIR, 3);
    });

    test('should calculate avgRIR across multiple exercises', () => {
      const today = new Date().toISOString().split('T')[0];

      storage.saveExerciseHistory('UPPER_A - DB Bench Press', [{
        date: today,
        sets: [
          { weight: 20, reps: 10, rir: 2 },
          { weight: 20, reps: 10, rir: 2 }
        ]
      }]);

      storage.saveExerciseHistory('UPPER_A - DB Row', [{
        date: today,
        sets: [
          { weight: 20, reps: 10, rir: 4 },
          { weight: 20, reps: 10, rir: 4 }
        ]
      }]);

      const result = calculator.calculatePerformanceMetrics(7);

      // avgRIR should be (2+2+4+4)/4 = 3
      assert.strictEqual(result.avgRIR, 3);
    });

    test('should return correct rirTrend data structure', () => {
      const today = new Date().toISOString().split('T')[0];
      const day2 = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Add rotation data
      const rotation = {
        sequence: [
          { workout: 'UPPER_A', date: today, completed: true },
          { workout: 'LOWER_A', date: day2, completed: true }
        ]
      };
      localStorage.setItem('build_workout_rotation', JSON.stringify(rotation));

      // Add exercise history for these dates
      storage.saveExerciseHistory('UPPER_A - DB Bench Press', [
        { date: today, sets: [{ weight: 20, reps: 10, rir: 2 }] },
        { date: day2, sets: [{ weight: 20, reps: 10, rir: 3 }] }
      ]);

      const result = calculator.calculatePerformanceMetrics(7);

      // rirTrend should be an array with date and rir properties
      assert.ok(Array.isArray(result.rirTrend));
      assert.strictEqual(result.rirTrend.length, 2);
      result.rirTrend.forEach(point => {
        assert.ok(point.hasOwnProperty('date'));
        assert.ok(point.hasOwnProperty('rir'));
        assert.strictEqual(typeof point.date, 'string');
        assert.strictEqual(typeof point.rir, 'number');
      });
    });

    test('should track exercises that progressed in weight', () => {
      // Add progression data (2 workouts, weight increased)
      const date1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const date2 = new Date().toISOString().split('T')[0];

      storage.saveExerciseHistory('UPPER_A - DB Bench Press', [
        { date: date1, sets: [{ weight: 20, reps: 10, rir: 2 }] },
        { date: date2, sets: [{ weight: 22.5, reps: 10, rir: 2 }] }
      ]);

      const result = calculator.calculatePerformanceMetrics(28);

      assert.strictEqual(result.progressedCount, 1);
      assert.strictEqual(result.topProgressors.length, 1);
      assert.strictEqual(result.topProgressors[0].name, 'DB Bench Press');
      assert.strictEqual(result.topProgressors[0].gain, 2.5);
    });

    test('should track multiple progressed exercises', () => {
      const date1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const date2 = new Date().toISOString().split('T')[0];

      // Exercise 1: progressed 5kg
      storage.saveExerciseHistory('UPPER_A - DB Bench Press', [
        { date: date1, sets: [{ weight: 20, reps: 10, rir: 2 }] },
        { date: date2, sets: [{ weight: 25, reps: 10, rir: 2 }] }
      ]);

      // Exercise 2: progressed 2.5kg
      storage.saveExerciseHistory('UPPER_A - DB Row', [
        { date: date1, sets: [{ weight: 15, reps: 10, rir: 2 }] },
        { date: date2, sets: [{ weight: 17.5, reps: 10, rir: 2 }] }
      ]);

      // Exercise 3: no progression
      storage.saveExerciseHistory('LOWER_A - Squat', [
        { date: date1, sets: [{ weight: 40, reps: 10, rir: 2 }] },
        { date: date2, sets: [{ weight: 40, reps: 10, rir: 2 }] }
      ]);

      const result = calculator.calculatePerformanceMetrics(28);

      assert.strictEqual(result.progressedCount, 2);
      assert.strictEqual(result.topProgressors.length, 2);
    });

    test('should sort topProgressors by gain descending', () => {
      const date1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const date2 = new Date().toISOString().split('T')[0];

      // Exercise 1: gained 2.5kg
      storage.saveExerciseHistory('UPPER_A - DB Bench Press', [
        { date: date1, sets: [{ weight: 20, reps: 10, rir: 2 }] },
        { date: date2, sets: [{ weight: 22.5, reps: 10, rir: 2 }] }
      ]);

      // Exercise 2: gained 5kg (should be first)
      storage.saveExerciseHistory('UPPER_A - DB Row', [
        { date: date1, sets: [{ weight: 15, reps: 10, rir: 2 }] },
        { date: date2, sets: [{ weight: 20, reps: 10, rir: 2 }] }
      ]);

      // Exercise 3: gained 1kg
      storage.saveExerciseHistory('LOWER_A - Squat', [
        { date: date1, sets: [{ weight: 40, reps: 10, rir: 2 }] },
        { date: date2, sets: [{ weight: 41, reps: 10, rir: 2 }] }
      ]);

      const result = calculator.calculatePerformanceMetrics(28);

      assert.strictEqual(result.topProgressors.length, 3);
      // Should be sorted by gain descending: 5kg, 2.5kg, 1kg
      assert.strictEqual(result.topProgressors[0].name, 'DB Row');
      assert.strictEqual(result.topProgressors[0].gain, 5);
      assert.strictEqual(result.topProgressors[1].name, 'DB Bench Press');
      assert.strictEqual(result.topProgressors[1].gain, 2.5);
      assert.strictEqual(result.topProgressors[2].name, 'Squat');
      assert.strictEqual(result.topProgressors[2].gain, 1);
    });

    test('should limit topProgressors to 5 exercises', () => {
      const date1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const date2 = new Date().toISOString().split('T')[0];

      // Add 7 exercises that progressed
      const exercises = [
        { name: 'Exercise 1', oldWeight: 10, newWeight: 17 }, // 7kg
        { name: 'Exercise 2', oldWeight: 10, newWeight: 16 }, // 6kg
        { name: 'Exercise 3', oldWeight: 10, newWeight: 15 }, // 5kg
        { name: 'Exercise 4', oldWeight: 10, newWeight: 14 }, // 4kg
        { name: 'Exercise 5', oldWeight: 10, newWeight: 13 }, // 3kg
        { name: 'Exercise 6', oldWeight: 10, newWeight: 12 }, // 2kg (should be excluded)
        { name: 'Exercise 7', oldWeight: 10, newWeight: 11 }  // 1kg (should be excluded)
      ];

      exercises.forEach(ex => {
        storage.saveExerciseHistory(`UPPER_A - ${ex.name}`, [
          { date: date1, sets: [{ weight: ex.oldWeight, reps: 10, rir: 2 }] },
          { date: date2, sets: [{ weight: ex.newWeight, reps: 10, rir: 2 }] }
        ]);
      });

      const result = calculator.calculatePerformanceMetrics(28);

      assert.strictEqual(result.progressedCount, 7);
      assert.strictEqual(result.topProgressors.length, 5);
      // Verify the top 5 are the highest gainers
      assert.strictEqual(result.topProgressors[0].gain, 7);
      assert.strictEqual(result.topProgressors[4].gain, 3);
    });

    test('should handle exercises with no progression', () => {
      const date1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const date2 = new Date().toISOString().split('T')[0];

      // Exercise stayed at same weight
      storage.saveExerciseHistory('UPPER_A - DB Bench Press', [
        { date: date1, sets: [{ weight: 20, reps: 10, rir: 2 }] },
        { date: date2, sets: [{ weight: 20, reps: 10, rir: 2 }] }
      ]);

      const result = calculator.calculatePerformanceMetrics(28);

      assert.strictEqual(result.progressedCount, 0);
      assert.deepStrictEqual(result.topProgressors, []);
    });

    test('should ignore exercises with less than 2 workouts', () => {
      const today = new Date().toISOString().split('T')[0];

      storage.saveExerciseHistory('UPPER_A - DB Bench Press', [
        { date: today, sets: [{ weight: 20, reps: 10, rir: 2 }] }
      ]);

      const result = calculator.calculatePerformanceMetrics(28);

      assert.strictEqual(result.progressedCount, 0);
      assert.deepStrictEqual(result.topProgressors, []);
    });
  });

  describe('calculateRecoveryTrends', () => {
    test('should return zeros when no recovery data exists', () => {
      const result = calculator.calculateRecoveryTrends(28);

      assert.strictEqual(result.avgSleep, 0);
      assert.strictEqual(result.avgFatigue, 0);
      assert.strictEqual(result.highFatigueDays, 0);
      assert.deepStrictEqual(result.weeklyTrend, []);
    });

    test('should calculate recovery averages from metrics data', () => {
      // Add recovery metrics
      const metrics = [
        { date: new Date().toISOString().split('T')[0], sleep: 7, fatigueScore: 2 },
        { date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], sleep: 8, fatigueScore: 1 },
        { date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0], sleep: 6, fatigueScore: 5 }
      ];
      localStorage.setItem('build_recovery_metrics', JSON.stringify(metrics));

      const result = calculator.calculateRecoveryTrends(7);

      assert.strictEqual(result.avgSleep, 7); // (7+8+6)/3
      assert.strictEqual(Math.round(result.avgFatigue * 10) / 10, 2.7); // (2+1+5)/3
      assert.strictEqual(result.highFatigueDays, 1); // Only 5 ≥ 4
    });

    test('should return correct weeklyTrend structure', () => {
      // Add data for 2 weeks (same week, 2 days each)
      // Week 1: 10 and 9 days ago (Sunday-based week grouping)
      const week1Day1 = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const week1Day2 = new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      // Week 2: 3 and 2 days ago
      const week2Day1 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const week2Day2 = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const metrics = [
        { date: week1Day1, sleep: 7, fatigueScore: 2 },
        { date: week1Day2, sleep: 8, fatigueScore: 3 },
        { date: week2Day1, sleep: 6, fatigueScore: 4 },
        { date: week2Day2, sleep: 7, fatigueScore: 5 }
      ];
      localStorage.setItem('build_recovery_metrics', JSON.stringify(metrics));

      const result = calculator.calculateRecoveryTrends(28);

      // Should have at least 2 weeks of data
      assert.ok(result.weeklyTrend.length >= 2);

      // Each week should have correct structure
      result.weeklyTrend.forEach(week => {
        assert.ok(week.week);
        assert.ok(typeof week.avgSleep === 'number');
        assert.ok(typeof week.avgFatigue === 'number');
      });
    });

    test('should filter metrics by date cutoff', () => {
      const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const recentDate = new Date().toISOString().split('T')[0];

      const metrics = [
        { date: oldDate, sleep: 9, fatigueScore: 1 },  // Should be excluded
        { date: recentDate, sleep: 6, fatigueScore: 5 }  // Should be included
      ];
      localStorage.setItem('build_recovery_metrics', JSON.stringify(metrics));

      const result = calculator.calculateRecoveryTrends(28);

      // Should only include recent data
      assert.strictEqual(result.avgSleep, 6);
      assert.strictEqual(result.avgFatigue, 5);
      assert.strictEqual(result.highFatigueDays, 1);
    });

    test('should handle null sleep and fatigue values', () => {
      const metrics = [
        { date: new Date().toISOString().split('T')[0], sleep: null, fatigueScore: null },
        { date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], sleep: 7, fatigueScore: 2 }
      ];
      localStorage.setItem('build_recovery_metrics', JSON.stringify(metrics));

      const result = calculator.calculateRecoveryTrends(7);

      // Null values should be treated as 0
      assert.strictEqual(result.avgSleep, 3.5); // (0+7)/2
      assert.strictEqual(result.avgFatigue, 1); // (0+2)/2
    });
  });

  describe('detectPatterns', () => {
    test('should return insufficient data message when <10 workouts', () => {
      const result = calculator.detectPatterns();

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].type, 'insufficient-data');
      assert.ok(result[0].message.includes('Not enough data'));
    });

    test('should detect sleep-progression pattern with sufficient data', () => {
      // Create 12 workouts where progression happens mostly on high sleep days
      const rotation = { sequence: [] };
      const metrics = [];
      const exerciseHistory = [];

      // Pattern: Progress on 5 out of 6 high-sleep days, but only 1 out of 6 low-sleep days
      const progressionPattern = [
        { sleep: 8, progress: true },  // 0
        { sleep: 5, progress: false }, // 1
        { sleep: 8, progress: true },  // 2
        { sleep: 5, progress: false }, // 3
        { sleep: 8, progress: true },  // 4
        { sleep: 5, progress: true },  // 5 - only low sleep progression
        { sleep: 8, progress: true },  // 6
        { sleep: 5, progress: false }, // 7
        { sleep: 8, progress: true },  // 8
        { sleep: 5, progress: false }, // 9
        { sleep: 8, progress: false }, // 10 - one high sleep without progression
        { sleep: 5, progress: false }  // 11
      ];

      let currentWeight = 20;
      for (let i = 11; i >= 0; i--) {
        const date = new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const pattern = progressionPattern[11 - i];

        rotation.sequence.push({ workout: 'UPPER_A', date, completed: true });
        metrics.push({ date, sleep: pattern.sleep, fatigueScore: 2 });

        // Increase weight if this is a progression day
        if (pattern.progress) {
          currentWeight += 2.5;
        }
        exerciseHistory.push({ date, sets: [{ weight: currentWeight, reps: 10, rir: 2 }] });
      }

      storage.saveExerciseHistory('UPPER_A - DB Bench Press', exerciseHistory);
      localStorage.setItem('build_workout_rotation', JSON.stringify(rotation));
      localStorage.setItem('build_recovery_metrics', JSON.stringify(metrics));

      const result = calculator.detectPatterns();

      assert.ok(result.length > 0);
      assert.notStrictEqual(result[0].type, 'insufficient-data');
    });
  });
});
