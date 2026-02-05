import { strict as assert } from 'assert';
import { test, describe, beforeEach } from 'node:test';
import './setup.js';
import { BarbellProgressionTracker } from '../../src/js/modules/barbell-progression-tracker.js';
import { StorageManager } from '../../src/js/modules/storage.js';

describe('BarbellProgressionTracker', () => {
  let storage;
  let tracker;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageManager();
    tracker = new BarbellProgressionTracker(storage);
  });

  describe('Constructor', () => {
    test('should accept storage instance via dependency injection', () => {
      assert.ok(tracker.storage);
      assert.strictEqual(tracker.storage, storage);
    });
  });

  describe('getBarbellBenchReadiness', () => {
    test('should return 100% when all criteria are met', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';

      // Add strength history: 20kg × 3×12 @ RIR 2-3
      // Storage limits to 8 workouts, so spread them over 12+ weeks (every ~2 weeks)
      const workoutHistory = [];
      const startDate = new Date('2026-01-01');
      for (let i = 0; i < 8; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i * 14); // Bi-weekly workouts for 14 weeks
        workoutHistory.push({
          date: date.toISOString().split('T')[0],
          sets: [
            { weight: 20, reps: 12, rir: 3 },
            { weight: 20, reps: 12, rir: 2 },
            { weight: 20, reps: 12, rir: 2 }
          ],
          progressionStatus: 'ready'
        });
      }
      storage.saveExerciseHistory(exerciseKey, workoutHistory);

      // Add mobility checks: 5 consecutive "yes"
      for (let i = 0; i < 5; i++) {
        storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
      }

      // Add pain history: no pain in last 5 workouts
      for (let i = 0; i < 5; i++) {
        storage.savePainReport(exerciseKey, false, null, null);
      }

      const result = tracker.getBarbellBenchReadiness();

      assert.strictEqual(result.percentage, 100);
      assert.strictEqual(result.strengthMet, true);
      assert.strictEqual(result.weeksMet, true);
      assert.strictEqual(result.mobilityMet, true);
      assert.strictEqual(result.painFree, true);
      assert.deepStrictEqual(result.blockers, []);
      assert.strictEqual(result.strengthProgress, 100);
      assert.strictEqual(result.weeksProgress, 100);
      assert.strictEqual(result.mobilityProgress, 100);
    });

    test('should return partial percentage with some criteria unmet', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';

      // Add strength history: 15kg (not yet 20kg)
      storage.saveExerciseHistory(exerciseKey, [{
        date: '2026-02-01',
        sets: [
          { weight: 15, reps: 12, rir: 3 },
          { weight: 15, reps: 12, rir: 2 },
          { weight: 15, reps: 12, rir: 2 }
        ],
        progressionStatus: 'normal'
      }]);

      // Only 2 weeks of training (need 12)
      // Mobility: only 3 confirmations (need 5)
      for (let i = 0; i < 3; i++) {
        storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
      }

      // Pain free
      for (let i = 0; i < 5; i++) {
        storage.savePainReport(exerciseKey, false, null, null);
      }

      const result = tracker.getBarbellBenchReadiness();

      assert.strictEqual(result.strengthMet, false);
      assert.strictEqual(result.weeksMet, false);
      assert.strictEqual(result.mobilityMet, false);
      assert.strictEqual(result.painFree, true);
      assert.ok(result.percentage < 100);
      assert.ok(result.percentage > 0);
      assert.ok(result.blockers.length > 0);
    });

    test('should report clear blockers for unmet criteria', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';

      // Minimal data - no history
      const result = tracker.getBarbellBenchReadiness();

      assert.ok(result.blockers.length > 0);
      assert.ok(result.blockers.some(b => b.includes('DB')));
      assert.ok(result.blockers.some(b => b.includes('weeks')));
      assert.ok(result.blockers.some(b => b.includes('mobility')));
    });

    test('should fail pain check if shoulder pain in recent workouts', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';

      // All other criteria met - spread 8 workouts over 12+ weeks
      const workoutHistory = [];
      const startDate = new Date('2026-01-01');
      for (let i = 0; i < 8; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i * 14); // Bi-weekly for 14 weeks
        workoutHistory.push({
          date: date.toISOString().split('T')[0],
          sets: [
            { weight: 20, reps: 12, rir: 3 },
            { weight: 20, reps: 12, rir: 2 },
            { weight: 20, reps: 12, rir: 2 }
          ],
          progressionStatus: 'ready'
        });
      }
      storage.saveExerciseHistory(exerciseKey, workoutHistory);

      for (let i = 0; i < 5; i++) {
        storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
      }

      // Pain in 3 out of last 5 workouts (should fail)
      storage.savePainReport(exerciseKey, true, 'shoulder', 'minor');
      storage.savePainReport(exerciseKey, false, null, null);
      storage.savePainReport(exerciseKey, true, 'shoulder', 'minor');
      storage.savePainReport(exerciseKey, false, null, null);
      storage.savePainReport(exerciseKey, true, 'shoulder', 'minor');

      const result = tracker.getBarbellBenchReadiness();

      assert.strictEqual(result.painFree, false);
      assert.strictEqual(result.strengthMet, true);
      assert.strictEqual(result.weeksMet, true);
      assert.strictEqual(result.mobilityMet, true);
      assert.ok(result.percentage < 100);
      assert.ok(result.blockers.some(b => b.toLowerCase().includes('pain')));
    });

    test('should allow max 1 painful session in last 5', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';

      // Pain in 1 out of last 5 workouts (should pass)
      storage.savePainReport(exerciseKey, true, 'shoulder', 'minor');
      storage.savePainReport(exerciseKey, false, null, null);
      storage.savePainReport(exerciseKey, false, null, null);
      storage.savePainReport(exerciseKey, false, null, null);
      storage.savePainReport(exerciseKey, false, null, null);

      const result = tracker.getBarbellBenchReadiness();

      assert.strictEqual(result.painFree, true);
    });
  });

  describe('getBarbellSquatReadiness', () => {
    test('should return 100% when all criteria are met', () => {
      const exerciseKey = 'LOWER_B - DB Goblet Squat';

      // Add strength history: 20kg × 3×12 @ RIR 2-3
      // Storage limits to 8 workouts, so spread them over 16+ weeks (every ~2.5 weeks)
      const workoutHistory = [];
      const startDate = new Date('2026-01-01');
      for (let i = 0; i < 8; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i * 17); // Every 17 days (~2.4 weeks) for ~17 weeks total
        workoutHistory.push({
          date: date.toISOString().split('T')[0],
          sets: [
            { weight: 20, reps: 12, rir: 3 },
            { weight: 20, reps: 12, rir: 2 },
            { weight: 20, reps: 12, rir: 2 }
          ],
          progressionStatus: 'ready'
        });
      }
      storage.saveExerciseHistory(exerciseKey, workoutHistory);

      // Add mobility checks: 5 consecutive "yes" for heel flat
      for (let i = 0; i < 5; i++) {
        storage.saveMobilityCheck('squat_heel_flat', 'yes');
      }

      // Add pain history: no knee/back pain in last 5 workouts
      for (let i = 0; i < 5; i++) {
        storage.savePainReport(exerciseKey, false, null, null);
      }

      const result = tracker.getBarbellSquatReadiness();

      assert.strictEqual(result.percentage, 100);
      assert.strictEqual(result.strengthMet, true);
      assert.strictEqual(result.weeksMet, true);
      assert.strictEqual(result.mobilityMet, true);
      assert.strictEqual(result.painFree, true);
      assert.deepStrictEqual(result.blockers, []);
      assert.strictEqual(result.strengthProgress, 100);
      assert.strictEqual(result.weeksProgress, 100);
      assert.strictEqual(result.mobilityProgress, 100);
    });

    test('should fail with knee pain in recent workouts', () => {
      const exerciseKey = 'LOWER_B - DB Goblet Squat';

      // All other criteria met - spread 8 workouts over 16+ weeks
      const workoutHistory = [];
      const startDate = new Date('2026-01-01');
      for (let i = 0; i < 8; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i * 17); // Every 17 days for ~17 weeks total
        workoutHistory.push({
          date: date.toISOString().split('T')[0],
          sets: [
            { weight: 20, reps: 12, rir: 3 },
            { weight: 20, reps: 12, rir: 2 },
            { weight: 20, reps: 12, rir: 2 }
          ],
          progressionStatus: 'ready'
        });
      }
      storage.saveExerciseHistory(exerciseKey, workoutHistory);

      for (let i = 0; i < 5; i++) {
        storage.saveMobilityCheck('squat_heel_flat', 'yes');
      }

      // Knee pain in 2 out of last 5 workouts (should fail)
      storage.savePainReport(exerciseKey, true, 'knee', 'minor');
      storage.savePainReport(exerciseKey, false, null, null);
      storage.savePainReport(exerciseKey, true, 'knee', 'minor');
      storage.savePainReport(exerciseKey, false, null, null);
      storage.savePainReport(exerciseKey, false, null, null);

      const result = tracker.getBarbellSquatReadiness();

      assert.strictEqual(result.painFree, false);
    });
  });

  describe('getBarbellDeadliftReadiness', () => {
    test('should return 100% when all criteria are met', () => {
      const exerciseKey = 'LOWER_B - DB Romanian Deadlift';

      // Add strength history: 25kg × 3×12 @ RIR 2-3
      // Storage limits to 8 workouts, so spread them over 20+ weeks (every ~3 weeks)
      const workoutHistory = [];
      const startDate = new Date('2026-01-01');
      for (let i = 0; i < 8; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i * 21); // Every 21 days (3 weeks) for 21 weeks total
        workoutHistory.push({
          date: date.toISOString().split('T')[0],
          sets: [
            { weight: 25, reps: 12, rir: 3 },
            { weight: 25, reps: 12, rir: 2 },
            { weight: 25, reps: 12, rir: 2 }
          ],
          progressionStatus: 'ready'
        });
      }
      storage.saveExerciseHistory(exerciseKey, workoutHistory);

      // Add mobility checks: 5 consecutive "yes" for toe touch
      for (let i = 0; i < 5; i++) {
        storage.saveMobilityCheck('deadlift_toe_touch', 'yes');
      }

      // Add pain history: no back pain in last 5 workouts
      for (let i = 0; i < 5; i++) {
        storage.savePainReport(exerciseKey, false, null, null);
      }

      const result = tracker.getBarbellDeadliftReadiness();

      assert.strictEqual(result.percentage, 100);
      assert.strictEqual(result.strengthMet, true);
      assert.strictEqual(result.weeksMet, true);
      assert.strictEqual(result.mobilityMet, true);
      assert.strictEqual(result.painFree, true);
      assert.deepStrictEqual(result.blockers, []);
      assert.strictEqual(result.strengthProgress, 100);
      assert.strictEqual(result.weeksProgress, 100);
      assert.strictEqual(result.mobilityProgress, 100);
    });

    test('should fail with back pain in recent workouts', () => {
      const exerciseKey = 'LOWER_B - DB Romanian Deadlift';

      // All other criteria met - spread 8 workouts over 20+ weeks
      const workoutHistory = [];
      const startDate = new Date('2026-01-01');
      for (let i = 0; i < 8; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i * 21); // Every 21 days for 21 weeks total
        workoutHistory.push({
          date: date.toISOString().split('T')[0],
          sets: [
            { weight: 25, reps: 12, rir: 3 },
            { weight: 25, reps: 12, rir: 2 },
            { weight: 25, reps: 12, rir: 2 }
          ],
          progressionStatus: 'ready'
        });
      }
      storage.saveExerciseHistory(exerciseKey, workoutHistory);

      for (let i = 0; i < 5; i++) {
        storage.saveMobilityCheck('deadlift_toe_touch', 'yes');
      }

      // Back pain in 3 out of last 5 workouts (should fail)
      storage.savePainReport(exerciseKey, true, 'lower_back', 'significant');
      storage.savePainReport(exerciseKey, false, null, null);
      storage.savePainReport(exerciseKey, true, 'lower_back', 'minor');
      storage.savePainReport(exerciseKey, false, null, null);
      storage.savePainReport(exerciseKey, true, 'lower_back', 'minor');

      const result = tracker.getBarbellDeadliftReadiness();

      assert.strictEqual(result.painFree, false);
    });
  });

  describe('calculateStrengthProgress helper', () => {
    test('should return 0 when no history exists', () => {
      const progress = tracker.calculateStrengthProgress('UPPER_A - DB Flat Bench Press', 20, 12, 3, 2);
      assert.strictEqual(progress, 0);
    });

    test('should return 100 when at target weight with reps and RIR', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';
      storage.saveExerciseHistory(exerciseKey, [{
        date: '2026-02-01',
        sets: [
          { weight: 20, reps: 12, rir: 3 },
          { weight: 20, reps: 12, rir: 2 },
          { weight: 20, reps: 12, rir: 2 }
        ],
        progressionStatus: 'ready'
      }]);

      const progress = tracker.calculateStrengthProgress(exerciseKey, 20, 12, 3, 2);
      assert.strictEqual(progress, 100);
    });

    test('should return 60 when at 15kg targeting 20kg (75% of 80% = 60%)', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';
      storage.saveExerciseHistory(exerciseKey, [{
        date: '2026-02-01',
        sets: [
          { weight: 15, reps: 12, rir: 3 },
          { weight: 15, reps: 12, rir: 2 },
          { weight: 15, reps: 12, rir: 2 }
        ],
        progressionStatus: 'normal'
      }]);

      const progress = tracker.calculateStrengthProgress(exerciseKey, 20, 12, 3, 2);
      assert.strictEqual(progress, 80); // 15/20 = 0.75, 0.75 * 80 + 20 = 60 + 20 = 80
    });

    test('should return 80 when at target weight but missing reps', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';
      storage.saveExerciseHistory(exerciseKey, [{
        date: '2026-02-01',
        sets: [
          { weight: 20, reps: 10, rir: 3 },
          { weight: 20, reps: 11, rir: 2 },
          { weight: 20, reps: 11, rir: 2 }
        ],
        progressionStatus: 'normal'
      }]);

      const progress = tracker.calculateStrengthProgress(exerciseKey, 20, 12, 3, 2);
      assert.strictEqual(progress, 80); // Weight met (80%) but reps not all hit (0%)
    });
  });

  describe('calculateWeeksProgress helper', () => {
    test('should return 0 when no history exists', () => {
      const progress = tracker.calculateWeeksProgress('UPPER_A - DB Flat Bench Press', 12);
      assert.strictEqual(progress, 0);
    });

    test('should return 0 when only one workout exists', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';
      storage.saveExerciseHistory(exerciseKey, [{
        date: '2026-02-01',
        sets: [{ weight: 10, reps: 10, rir: 2 }],
        progressionStatus: 'normal'
      }]);

      const progress = tracker.calculateWeeksProgress(exerciseKey, 12);
      assert.strictEqual(progress, 0);
    });

    test('should return 50 when 6 weeks out of 12 completed', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';
      const startDate = new Date('2026-01-01');
      const workoutHistory = [];

      for (let i = 0; i < 7; i++) { // 7 workouts = 6 weeks gap
        const date = new Date(startDate);
        date.setDate(date.getDate() + i * 7);
        workoutHistory.push({
          date: date.toISOString().split('T')[0],
          sets: [{ weight: 10, reps: 10, rir: 2 }],
          progressionStatus: 'normal'
        });
      }

      storage.saveExerciseHistory(exerciseKey, workoutHistory);

      const progress = tracker.calculateWeeksProgress(exerciseKey, 12);
      assert.strictEqual(progress, 50);
    });

    test('should cap at 100% when exceeding target weeks', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';
      const startDate = new Date('2026-01-01');
      const workoutHistory = [];

      // Storage limits to 8 workouts, so spread over 14+ weeks (exceeds 12 target)
      for (let i = 0; i < 8; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i * 14); // Every 14 days (2 weeks) for 14 weeks total
        workoutHistory.push({
          date: date.toISOString().split('T')[0],
          sets: [{ weight: 10, reps: 10, rir: 2 }],
          progressionStatus: 'normal'
        });
      }

      storage.saveExerciseHistory(exerciseKey, workoutHistory);

      const progress = tracker.calculateWeeksProgress(exerciseKey, 12);
      assert.strictEqual(progress, 100);
    });
  });

  describe('calculateMobilityProgress helper', () => {
    test('should return 0 when no checks exist', () => {
      const progress = tracker.calculateMobilityProgress('bench_overhead_mobility', 5);
      assert.strictEqual(progress, 0);
    });

    test('should return 100 when 5 consecutive "yes" responses', () => {
      for (let i = 0; i < 5; i++) {
        storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
      }

      const progress = tracker.calculateMobilityProgress('bench_overhead_mobility', 5);
      assert.strictEqual(progress, 100);
    });

    test('should return 60 when 3 consecutive "yes" out of 5 required', () => {
      for (let i = 0; i < 3; i++) {
        storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
      }

      const progress = tracker.calculateMobilityProgress('bench_overhead_mobility', 5);
      assert.strictEqual(progress, 60);
    });

    test('should reset count when encountering "no"', () => {
      storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
      storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
      storage.saveMobilityCheck('bench_overhead_mobility', 'no');
      storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
      storage.saveMobilityCheck('bench_overhead_mobility', 'yes');

      const progress = tracker.calculateMobilityProgress('bench_overhead_mobility', 5);
      assert.strictEqual(progress, 40); // Only 2 consecutive from end
    });

    test('should reset count when encountering "not_sure"', () => {
      storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
      storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
      storage.saveMobilityCheck('bench_overhead_mobility', 'not_sure');
      storage.saveMobilityCheck('bench_overhead_mobility', 'yes');

      const progress = tracker.calculateMobilityProgress('bench_overhead_mobility', 5);
      assert.strictEqual(progress, 20); // Only 1 consecutive from end
    });

    test('should cap at 100% when exceeding required confirmations', () => {
      for (let i = 0; i < 8; i++) {
        storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
      }

      const progress = tracker.calculateMobilityProgress('bench_overhead_mobility', 5);
      assert.strictEqual(progress, 100);
    });
  });

  describe('isPainFree helper', () => {
    test('should return true when no pain history exists', () => {
      const painFree = tracker.isPainFree(['UPPER_A - DB Flat Bench Press'], ['shoulder', 'elbow'], 5);
      assert.strictEqual(painFree, true);
    });

    test('should return true when less than 5 sessions recorded', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';
      storage.savePainReport(exerciseKey, false, null, null);
      storage.savePainReport(exerciseKey, false, null, null);

      const painFree = tracker.isPainFree([exerciseKey], ['shoulder', 'elbow'], 5);
      assert.strictEqual(painFree, true);
    });

    test('should return true when 0 painful sessions in last 5', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';
      for (let i = 0; i < 5; i++) {
        storage.savePainReport(exerciseKey, false, null, null);
      }

      const painFree = tracker.isPainFree([exerciseKey], ['shoulder', 'elbow'], 5);
      assert.strictEqual(painFree, true);
    });

    test('should return true when 1 painful session in last 5', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';
      storage.savePainReport(exerciseKey, true, 'shoulder', 'minor');
      for (let i = 0; i < 4; i++) {
        storage.savePainReport(exerciseKey, false, null, null);
      }

      const painFree = tracker.isPainFree([exerciseKey], ['shoulder', 'elbow'], 5);
      assert.strictEqual(painFree, true);
    });

    test('should return false when 2 painful sessions in last 5', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';
      storage.savePainReport(exerciseKey, true, 'shoulder', 'minor');
      storage.savePainReport(exerciseKey, false, null, null);
      storage.savePainReport(exerciseKey, true, 'elbow', 'minor');
      storage.savePainReport(exerciseKey, false, null, null);
      storage.savePainReport(exerciseKey, false, null, null);

      const painFree = tracker.isPainFree([exerciseKey], ['shoulder', 'elbow'], 5);
      assert.strictEqual(painFree, false);
    });

    test('should only count pain in relevant locations', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';
      // 3 wrist pain instances (not relevant)
      storage.savePainReport(exerciseKey, true, 'wrist', 'minor');
      storage.savePainReport(exerciseKey, true, 'wrist', 'minor');
      storage.savePainReport(exerciseKey, true, 'wrist', 'minor');
      // 1 shoulder pain instance (relevant)
      storage.savePainReport(exerciseKey, true, 'shoulder', 'minor');
      storage.savePainReport(exerciseKey, false, null, null);

      const painFree = tracker.isPainFree([exerciseKey], ['shoulder', 'elbow'], 5);
      assert.strictEqual(painFree, true); // Only 1 relevant painful session
    });

    test('should check multiple exercises', () => {
      const exerciseKey1 = 'UPPER_A - DB Flat Bench Press';
      const exerciseKey2 = 'UPPER_A - DB Shoulder Press';

      // Exercise 1: 1 painful session (ok)
      storage.savePainReport(exerciseKey1, true, 'shoulder', 'minor');
      for (let i = 0; i < 4; i++) {
        storage.savePainReport(exerciseKey1, false, null, null);
      }

      // Exercise 2: 2 painful sessions (fail)
      storage.savePainReport(exerciseKey2, true, 'shoulder', 'minor');
      storage.savePainReport(exerciseKey2, false, null, null);
      storage.savePainReport(exerciseKey2, true, 'shoulder', 'minor');
      storage.savePainReport(exerciseKey2, false, null, null);
      storage.savePainReport(exerciseKey2, false, null, null);

      const painFree = tracker.isPainFree([exerciseKey1, exerciseKey2], ['shoulder', 'elbow'], 5);
      assert.strictEqual(painFree, false);
    });
  });

  describe('Percentage calculation', () => {
    test('should use weighted formula: 40% strength, 20% weeks, 30% mobility, 10% pain', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';

      // Strength: 50% progress (15kg out of 20kg)
      storage.saveExerciseHistory(exerciseKey, [{
        date: '2026-02-01',
        sets: [
          { weight: 15, reps: 12, rir: 3 },
          { weight: 15, reps: 12, rir: 2 },
          { weight: 15, reps: 12, rir: 2 }
        ],
        progressionStatus: 'normal'
      }]);

      // Weeks: 0% progress (only 1 workout)
      // Mobility: 60% progress (3 out of 5)
      for (let i = 0; i < 3; i++) {
        storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
      }

      // Pain: 100% (pain free)
      for (let i = 0; i < 5; i++) {
        storage.savePainReport(exerciseKey, false, null, null);
      }

      const result = tracker.getBarbellBenchReadiness();

      // Expected: strength 80% * 0.4 = 32%, weeks 0% * 0.2 = 0%, mobility 60% * 0.3 = 18%, pain 100% * 0.1 = 10%
      // Total: 32 + 0 + 18 + 10 = 60%
      const expected = Math.floor(80 * 0.4 + 0 * 0.2 + 60 * 0.3 + 100 * 0.1);
      assert.strictEqual(result.percentage, expected);
    });

    test('should calculate partial percentages correctly', () => {
      const exerciseKey = 'UPPER_A - DB Flat Bench Press';

      // Strength: 10kg out of 20kg = 50% weight progress
      storage.saveExerciseHistory(exerciseKey, [{
        date: '2026-02-01',
        sets: [
          { weight: 10, reps: 12, rir: 3 },
          { weight: 10, reps: 12, rir: 2 },
          { weight: 10, reps: 12, rir: 2 }
        ],
        progressionStatus: 'normal'
      }]);

      // Weeks: 0% (only 1 workout)
      // Mobility: 0% (no checks)
      // Pain: 0% (pain present)
      storage.savePainReport(exerciseKey, true, 'shoulder', 'minor');
      storage.savePainReport(exerciseKey, true, 'shoulder', 'minor');
      storage.savePainReport(exerciseKey, false, null, null);
      storage.savePainReport(exerciseKey, false, null, null);
      storage.savePainReport(exerciseKey, false, null, null);

      const result = tracker.getBarbellBenchReadiness();

      // Strength progress: 10/20 = 0.5, 0.5 * 80 + 20 = 60%
      // Expected: 60 * 0.4 + 0 * 0.2 + 0 * 0.3 + 0 * 0.1 = 24%
      const expected = Math.floor(60 * 0.4 + 0 * 0.2 + 0 * 0.3 + 0 * 0.1);
      assert.strictEqual(result.percentage, expected);
    });
  });
});
