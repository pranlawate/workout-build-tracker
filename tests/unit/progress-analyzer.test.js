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
      // Add workout history for 3 workouts in last 4 weeks (dates relative to now)
      const exercises = ['Exercise 1', 'Exercise 2'];
      const dayMs = 24 * 60 * 60 * 1000;
      const dates = [1, 3, 7].map(d => new Date(Date.now() - d * dayMs));

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
        { date: new Date().toISOString().split('T')[0], sets: [{ weight: 10, reps: 10, rir: 2 }] }
      ];
      storage.saveExerciseHistory('Exercise 1', history);

      const avgMinutes = analyzer.calculateAvgSessionTime();
      assert.strictEqual(avgMinutes, 0);
    });

    test('should calculate average session time from multiple exercises', () => {
      const dayMs = 24 * 60 * 60 * 1000;
      // Workout 1: 30 minutes (2 exercises with same start/end), within last 4 weeks
      const workout1Date = new Date(Date.now() - 2 * dayMs);
      workout1Date.setUTCHours(10, 0, 0, 0);
      const workout1End = new Date(workout1Date.getTime() + 30 * 60 * 1000);

      storage.saveExerciseHistory('Exercise 1', [{
        date: workout1Date.toISOString().split('T')[0],
        sets: [{ weight: 10, reps: 10, rir: 2 }],
        startTime: workout1Date.toISOString(),
        endTime: workout1End.toISOString()
      }]);

      storage.saveExerciseHistory('Exercise 2', [{
        date: workout1Date.toISOString().split('T')[0],
        sets: [{ weight: 20, reps: 8, rir: 3 }],
        startTime: workout1Date.toISOString(),
        endTime: workout1End.toISOString()
      }]);

      // Workout 2: 45 minutes (different date)
      const workout2Date = new Date(Date.now() - 5 * dayMs);
      workout2Date.setUTCHours(14, 0, 0, 0);
      const workout2End = new Date(workout2Date.getTime() + 45 * 60 * 1000);

      storage.saveExerciseHistory('Exercise 1', [
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
      const dayMs = 24 * 60 * 60 * 1000;
      const workout1Date = new Date(Date.now() - 2 * dayMs);
      workout1Date.setUTCHours(10, 0, 0, 0);
      const workout1End = new Date(workout1Date.getTime() + 30 * 60 * 1000);
      const workout2Date = new Date(Date.now() - 5 * dayMs);
      workout2Date.setUTCHours(14, 0, 0, 0);

      storage.saveExerciseHistory('Exercise 1', [
        {
          date: workout1Date.toISOString().split('T')[0],
          sets: [{ weight: 10, reps: 10, rir: 2 }],
          startTime: workout1Date.toISOString(),
          endTime: workout1End.toISOString()
        },
        {
          date: workout2Date.toISOString().split('T')[0],
          sets: [{ weight: 12, reps: 9, rir: 2 }],
          startTime: workout2Date.toISOString()
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
      storage.saveExerciseHistory('Bench Press', [
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
      storage.saveExerciseHistory('Squat', [
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
      storage.saveExerciseHistory('Row', [
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
      assert.strictEqual(result[0].name, 'Squat');
      assert.strictEqual(result[0].percentGain, 30);
      assert.strictEqual(result[1].name, 'Bench Press');
      assert.strictEqual(result[1].percentGain, 20);
      assert.strictEqual(result[2].name, 'Row');
      assert.strictEqual(result[2].percentGain, 10);

      // Should not include absoluteGain in output
      assert.strictEqual(result[0].absoluteGain, undefined);
    });

    test('should handle ties by sorting by absolute weight gain', () => {
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      const today = new Date();

      // Exercise 1: 100 lbs -> 120 lbs = 20% gain, +20 lbs
      storage.saveExerciseHistory('Bench Press', [
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
      storage.saveExerciseHistory('Squat', [
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
      assert.strictEqual(result[0].name, 'Bench Press'); // +20 lbs
      assert.strictEqual(result[0].percentGain, 20);
      assert.strictEqual(result[1].name, 'Squat'); // +10 lbs
      assert.strictEqual(result[1].percentGain, 20);
    });
  });
});
