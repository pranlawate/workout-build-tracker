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
});
