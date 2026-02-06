import { strict as assert } from 'assert';
import { test, describe, beforeEach } from 'node:test';
import './setup.js';
import { ProgressAnalyzer } from '../../js/modules/progress-analyzer.js';
import { StorageManager } from '../../js/modules/storage.js';

describe('ProgressAnalyzer', () => {
  let storage;
  let analyzer;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageManager();
    analyzer = new ProgressAnalyzer(storage);
  });

  describe('Constructor', () => {
    test('should accept storage instance via dependency injection', () => {
      assert.ok(analyzer.storage);
      assert.strictEqual(analyzer.storage, storage);
    });
  });

  describe('getLast4WeeksStats', () => {
    test('should return zeros when no workout history exists', () => {
      const stats = analyzer.getLast4WeeksStats();

      assert.strictEqual(stats.workoutsCompleted, 0);
      assert.strictEqual(stats.workoutsPlanned, 0);
      assert.strictEqual(stats.avgSessionMinutes, 0);
      assert.strictEqual(stats.exercisesProgressed, 0);
      assert.strictEqual(stats.totalExercises, 0);
      assert.strictEqual(stats.currentStreak, 0);
    });

    test('should count workouts in last 4 weeks', () => {
      // Add workout history for 3 workouts in last 4 weeks
      const exercises = ['UPPER_A - Exercise 1', 'UPPER_A - Exercise 2'];
      const dates = [
        new Date('2026-02-05'),
        new Date('2026-02-03'),
        new Date('2026-01-30')
      ];

      exercises.forEach(exerciseKey => {
        const history = dates.map(date => ({
          date: date.toISOString().split('T')[0],
          sets: [{ weight: 10, reps: 10, rir: 2 }],
          startTime: date.toISOString(),
          endTime: new Date(date.getTime() + 30 * 60 * 1000).toISOString() // 30 min
        }));
        storage.saveExerciseHistory(exerciseKey, history);
      });

      const stats = analyzer.getLast4WeeksStats();

      assert.strictEqual(stats.workoutsCompleted, 3);
      assert.strictEqual(stats.workoutsPlanned, 12); // 3 per week × 4 weeks
    });
  });

  describe('calculateAvgSessionTime', () => {
    test('should return 0 when no sessions have time data', () => {
      const history = [
        { date: '2026-02-05', sets: [{ weight: 10, reps: 10, rir: 2 }] }
      ];
      storage.saveExerciseHistory('UPPER_A - Exercise 1', history);

      const avgMinutes = analyzer.calculateAvgSessionTime();
      assert.strictEqual(avgMinutes, 0);
    });

    test('should calculate average session time from multiple exercises', () => {
      // Workout 1: 30 minutes (2 exercises with same start/end)
      const workout1Date = new Date('2026-02-05T10:00:00Z');
      const workout1End = new Date('2026-02-05T10:30:00Z');

      storage.saveExerciseHistory('UPPER_A - Exercise 1', [{
        date: workout1Date.toISOString().split('T')[0],
        sets: [{ weight: 10, reps: 10, rir: 2 }],
        startTime: workout1Date.toISOString(),
        endTime: workout1End.toISOString()
      }]);

      storage.saveExerciseHistory('UPPER_A - Exercise 2', [{
        date: workout1Date.toISOString().split('T')[0],
        sets: [{ weight: 20, reps: 8, rir: 3 }],
        startTime: workout1Date.toISOString(),
        endTime: workout1End.toISOString()
      }]);

      // Workout 2: 45 minutes (different date)
      const workout2Date = new Date('2026-02-03T14:00:00Z');
      const workout2End = new Date('2026-02-03T14:45:00Z');

      storage.saveExerciseHistory('UPPER_A - Exercise 1', [
        {
          date: workout1Date.toISOString().split('T')[0],
          sets: [{ weight: 10, reps: 10, rir: 2 }],
          startTime: workout1Date.toISOString(),
          endTime: workout1End.toISOString()
        },
        {
          date: workout2Date.toISOString().split('T')[0],
          sets: [{ weight: 12, reps: 9, rir: 2 }],
          startTime: workout2Date.toISOString(),
          endTime: workout2End.toISOString()
        }
      ]);

      // Average should be (30 + 45) / 2 = 37.5 minutes
      const avgMinutes = analyzer.calculateAvgSessionTime();
      assert.strictEqual(avgMinutes, 37.5);
    });

    test('should handle sessions with missing endTime gracefully', () => {
      const workout1Date = new Date('2026-02-05T10:00:00Z');
      const workout1End = new Date('2026-02-05T10:30:00Z');

      storage.saveExerciseHistory('UPPER_A - Exercise 1', [
        {
          date: workout1Date.toISOString().split('T')[0],
          sets: [{ weight: 10, reps: 10, rir: 2 }],
          startTime: workout1Date.toISOString(),
          endTime: workout1End.toISOString()
        },
        {
          date: '2026-02-03',
          sets: [{ weight: 12, reps: 9, rir: 2 }],
          startTime: new Date('2026-02-03T14:00:00Z').toISOString()
          // No endTime
        }
      ]);

      // Should only count the session with complete time data
      const avgMinutes = analyzer.calculateAvgSessionTime();
      assert.strictEqual(avgMinutes, 30);
    });
  });

  describe('getTopProgressingExercises', () => {
    test('should return empty array when no progression detected', () => {
      // No exercise history
      const result = analyzer.getTopProgressingExercises(3);
      assert.ok(Array.isArray(result));
      assert.strictEqual(result.length, 0);
    });

    test('should identify top progressing exercises with percentage gains', () => {
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      const today = new Date();

      // Exercise 1: 100 lbs -> 120 lbs = 20% gain
      storage.saveExerciseHistory('UPPER_A - Bench Press', [
        {
          date: fourWeeksAgo.toISOString().split('T')[0],
          sets: [
            { weight: 100, reps: 10, rir: 2 },
            { weight: 100, reps: 9, rir: 3 }
          ]
        },
        {
          date: today.toISOString().split('T')[0],
          sets: [
            { weight: 120, reps: 10, rir: 2 },
            { weight: 120, reps: 9, rir: 3 }
          ]
        }
      ]);

      // Exercise 2: 50 lbs -> 65 lbs = 30% gain
      storage.saveExerciseHistory('LOWER_A - Squat', [
        {
          date: fourWeeksAgo.toISOString().split('T')[0],
          sets: [
            { weight: 50, reps: 8, rir: 2 }
          ]
        },
        {
          date: today.toISOString().split('T')[0],
          sets: [
            { weight: 65, reps: 8, rir: 2 }
          ]
        }
      ]);

      // Exercise 3: 80 lbs -> 88 lbs = 10% gain
      storage.saveExerciseHistory('UPPER_B - Row', [
        {
          date: fourWeeksAgo.toISOString().split('T')[0],
          sets: [
            { weight: 80, reps: 12, rir: 1 }
          ]
        },
        {
          date: today.toISOString().split('T')[0],
          sets: [
            { weight: 88, reps: 12, rir: 1 }
          ]
        }
      ]);

      const result = analyzer.getTopProgressingExercises(3);

      // Should be sorted by percentage gain: Squat (30%), Bench Press (20%), Row (10%)
      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].exerciseName, 'Squat');
      assert.strictEqual(result[0].percentGain, 30);
      assert.strictEqual(result[1].exerciseName, 'Bench Press');
      assert.strictEqual(result[1].percentGain, 20);
      assert.strictEqual(result[2].exerciseName, 'Row');
      assert.strictEqual(result[2].percentGain, 10);

      // Should not include absoluteGain in output
      assert.strictEqual(result[0].absoluteGain, undefined);
    });

    test('should handle ties by sorting by absolute weight gain', () => {
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      const today = new Date();

      // Exercise 1: 100 lbs -> 120 lbs = 20% gain, +20 lbs
      storage.saveExerciseHistory('UPPER_A - Bench Press', [
        {
          date: fourWeeksAgo.toISOString().split('T')[0],
          sets: [{ weight: 100, reps: 10, rir: 2 }]
        },
        {
          date: today.toISOString().split('T')[0],
          sets: [{ weight: 120, reps: 10, rir: 2 }]
        }
      ]);

      // Exercise 2: 50 lbs -> 60 lbs = 20% gain, +10 lbs (same % but lower absolute)
      storage.saveExerciseHistory('LOWER_A - Squat', [
        {
          date: fourWeeksAgo.toISOString().split('T')[0],
          sets: [{ weight: 50, reps: 8, rir: 2 }]
        },
        {
          date: today.toISOString().split('T')[0],
          sets: [{ weight: 60, reps: 8, rir: 2 }]
        }
      ]);

      const result = analyzer.getTopProgressingExercises(3);

      // Should be sorted by absolute gain when percentages are tied
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].exerciseName, 'Bench Press'); // +20 lbs
      assert.strictEqual(result[0].percentGain, 20);
      assert.strictEqual(result[1].exerciseName, 'Squat'); // +10 lbs
      assert.strictEqual(result[1].percentGain, 20);
    });
  });
});
