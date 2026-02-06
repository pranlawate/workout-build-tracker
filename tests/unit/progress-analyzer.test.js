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
});
