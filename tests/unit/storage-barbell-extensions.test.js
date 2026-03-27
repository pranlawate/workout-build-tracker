import { strict as assert } from 'assert';
import { test, describe, beforeEach } from 'node:test';
import './setup.js';
import { StorageManager } from '../../js/modules/storage.js';

/** Advance calendar day between saves (savePainReport uses `new Date()` for the entry date). */
function runWithSyntheticCalendar(apply) {
  const RealDate = global.Date;
  let dayOffset = 0;
  function FakeDate(...args) {
    if (args.length === 0) {
      return new RealDate(RealDate.UTC(2025, 0, 1 + dayOffset, 12, 0, 0));
    }
    return new RealDate(...args);
  }
  FakeDate.now = () => new RealDate(RealDate.UTC(2025, 0, 1 + dayOffset, 12, 0, 0)).getTime();
  FakeDate.parse = RealDate.parse;
  FakeDate.UTC = RealDate.UTC;
  global.Date = FakeDate;

  try {
    apply(() => {
      dayOffset++;
    });
  } finally {
    global.Date = RealDate;
  }
}

describe('StorageManager - Barbell Progression Extensions', () => {
  let storage;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageManager();
  });

  describe('Mobility Check Storage', () => {
    test('should save mobility check response', () => {
      storage.saveMobilityCheck('bench_overhead_mobility', 'yes');

      const allChecks = JSON.parse(localStorage.getItem('build_barbell_mobility_checks'));
      assert.ok(allChecks['bench_overhead_mobility']);
      assert.strictEqual(allChecks['bench_overhead_mobility'].length, 1);
      assert.strictEqual(allChecks['bench_overhead_mobility'][0].response, 'yes');
      assert.ok(allChecks['bench_overhead_mobility'][0].date);
    });

    test('should append multiple mobility checks for same criteria', () => {
      storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
      storage.saveMobilityCheck('bench_overhead_mobility', 'no');

      const checks = storage.getMobilityChecks('bench_overhead_mobility');
      assert.strictEqual(checks.length, 2);
      assert.strictEqual(checks[0].response, 'yes');
      assert.strictEqual(checks[1].response, 'no');
    });

    test('should retrieve mobility checks for a criteria', () => {
      storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
      storage.saveMobilityCheck('bench_overhead_mobility', 'not_sure');

      const checks = storage.getMobilityChecks('bench_overhead_mobility');
      assert.strictEqual(checks.length, 2);
      assert.strictEqual(checks[0].response, 'yes');
      assert.strictEqual(checks[1].response, 'not_sure');
    });

    test('should return empty array when no mobility checks exist', () => {
      const checks = storage.getMobilityChecks('nonexistent_criteria');
      assert.deepStrictEqual(checks, []);
    });

    test('should store checks for different criteria separately', () => {
      storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
      storage.saveMobilityCheck('squat_ankle_mobility', 'no');

      const benchChecks = storage.getMobilityChecks('bench_overhead_mobility');
      const squatChecks = storage.getMobilityChecks('squat_ankle_mobility');

      assert.strictEqual(benchChecks.length, 1);
      assert.strictEqual(squatChecks.length, 1);
      assert.strictEqual(benchChecks[0].response, 'yes');
      assert.strictEqual(squatChecks[0].response, 'no');
    });

    test('should store date in YYYY-MM-DD format', () => {
      storage.saveMobilityCheck('bench_overhead_mobility', 'yes');

      const checks = storage.getMobilityChecks('bench_overhead_mobility');
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      assert.ok(dateRegex.test(checks[0].date), 'Date should be in YYYY-MM-DD format');
    });

    test('should handle corrupt mobility checks data gracefully', () => {
      localStorage.setItem('build_barbell_mobility_checks', 'invalid{json}');
      const checks = storage.getMobilityChecks('bench_overhead_mobility');

      // Should return empty array instead of crashing
      assert.deepStrictEqual(checks, []);
    });

    describe('Input Validation', () => {
      test('should throw error for invalid criteriaKey (null)', () => {
        assert.throws(
          () => storage.saveMobilityCheck(null, 'yes'),
          { message: 'Invalid criteria key: must be a non-empty string' }
        );
      });

      test('should throw error for invalid criteriaKey (empty string)', () => {
        assert.throws(
          () => storage.saveMobilityCheck('', 'yes'),
          { message: 'Invalid criteria key: must be a non-empty string' }
        );
      });

      test('should throw error for invalid criteriaKey (number)', () => {
        assert.throws(
          () => storage.saveMobilityCheck(123, 'yes'),
          { message: 'Invalid criteria key: must be a non-empty string' }
        );
      });

      test('should throw error for invalid response value', () => {
        assert.throws(
          () => storage.saveMobilityCheck('bench_overhead_mobility', 'invalid'),
          { message: 'Invalid response: must be yes, no, or not_sure' }
        );
      });

      test('should throw error for invalid response type', () => {
        assert.throws(
          () => storage.saveMobilityCheck('bench_overhead_mobility', null),
          { message: 'Invalid response: must be yes, no, or not_sure' }
        );
      });

      test('should accept all valid response values', () => {
        assert.doesNotThrow(() => storage.saveMobilityCheck('test_criteria', 'yes'));
        assert.doesNotThrow(() => storage.saveMobilityCheck('test_criteria', 'no'));
        assert.doesNotThrow(() => storage.saveMobilityCheck('test_criteria', 'not_sure'));
      });
    });

    describe('History Size Limiting', () => {
      test('should limit mobility checks to 10 entries per criteria', () => {
        // Add 11 entries
        for (let i = 0; i < 11; i++) {
          storage.saveMobilityCheck('bench_overhead_mobility', i % 2 === 0 ? 'yes' : 'no');
        }

        const checks = storage.getMobilityChecks('bench_overhead_mobility');
        assert.strictEqual(checks.length, 10, 'Should only keep last 10 entries');

        // First entry should be the second one we added (index 1, which is odd)
        assert.strictEqual(checks[0].response, 'no');
        // Last entry should be the 11th one we added (index 10, which is even)
        assert.strictEqual(checks[9].response, 'yes');
      });

      test('should not affect other criteria when limiting one', () => {
        // Add 11 entries to first criteria
        for (let i = 0; i < 11; i++) {
          storage.saveMobilityCheck('bench_overhead_mobility', 'yes');
        }

        // Add 5 entries to second criteria
        for (let i = 0; i < 5; i++) {
          storage.saveMobilityCheck('squat_ankle_mobility', 'no');
        }

        const benchChecks = storage.getMobilityChecks('bench_overhead_mobility');
        const squatChecks = storage.getMobilityChecks('squat_ankle_mobility');

        assert.strictEqual(benchChecks.length, 10);
        assert.strictEqual(squatChecks.length, 5);
      });
    });
  });

  describe('Pain Report Storage', () => {
    test('should save pain report with all details', () => {
      storage.savePainReport('UPPER_A - DB Bench Press', true, 'shoulder', 'minor');

      const allPain = JSON.parse(localStorage.getItem('build_exercise_pain_history'));
      assert.ok(allPain['UPPER_A - DB Bench Press']);
      assert.strictEqual(allPain['UPPER_A - DB Bench Press'].length, 1);

      const report = allPain['UPPER_A - DB Bench Press'][0];
      assert.strictEqual(report.hadPain, true);
      assert.strictEqual(report.location, 'shoulder');
      assert.strictEqual(report.severity, 'minor');
      assert.ok(report.date);
    });

    test('should save pain report with no pain', () => {
      storage.savePainReport('UPPER_A - DB Bench Press', false, null, null);

      const history = storage.getPainHistory('UPPER_A - DB Bench Press');
      assert.strictEqual(history.length, 1);
      assert.strictEqual(history[0].hadPain, false);
      assert.strictEqual(history[0].location, null);
      assert.strictEqual(history[0].severity, null);
    });

    test('should replace same-day pain report for same exercise', () => {
      storage.savePainReport('UPPER_A - DB Bench Press', false, null, null);
      storage.savePainReport('UPPER_A - DB Bench Press', true, 'elbow', 'significant');

      const history = storage.getPainHistory('UPPER_A - DB Bench Press');
      assert.strictEqual(history.length, 1);
      assert.strictEqual(history[0].hadPain, true);
      assert.strictEqual(history[0].location, 'elbow');
      assert.strictEqual(history[0].severity, 'significant');
    });

    test('should retrieve pain history for an exercise across distinct days', () => {
      runWithSyntheticCalendar(bump => {
        storage.savePainReport('UPPER_A - DB Bench Press', true, 'shoulder', 'minor');
        bump();
        storage.savePainReport('UPPER_A - DB Bench Press', false, null, null);
      });

      const history = storage.getPainHistory('UPPER_A - DB Bench Press');
      assert.strictEqual(history.length, 2);
    });

    test('should return empty array when no pain history exists', () => {
      const history = storage.getPainHistory('NONEXISTENT - Exercise');
      assert.deepStrictEqual(history, []);
    });

    test('should store pain reports per-exercise separately', () => {
      storage.savePainReport('UPPER_A - DB Bench Press', true, 'shoulder', 'minor');
      storage.savePainReport('LOWER_A - Squat', true, 'knee', 'significant');

      const benchHistory = storage.getPainHistory('UPPER_A - DB Bench Press');
      const squatHistory = storage.getPainHistory('LOWER_A - Squat');

      assert.strictEqual(benchHistory.length, 1);
      assert.strictEqual(squatHistory.length, 1);
      assert.strictEqual(benchHistory[0].location, 'shoulder');
      assert.strictEqual(squatHistory[0].location, 'knee');
    });

    test('should store date in YYYY-MM-DD format', () => {
      storage.savePainReport('UPPER_A - DB Bench Press', false, null, null);

      const history = storage.getPainHistory('UPPER_A - DB Bench Press');
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      assert.ok(dateRegex.test(history[0].date), 'Date should be in YYYY-MM-DD format');
    });

    test('should handle corrupt pain history data gracefully', () => {
      localStorage.setItem('build_exercise_pain_history', 'not{valid]json');
      const history = storage.getPainHistory('UPPER_A - DB Bench Press');

      // Should return empty array instead of crashing
      assert.deepStrictEqual(history, []);
    });

    describe('Input Validation', () => {
      test('should throw error for invalid exerciseKey (null)', () => {
        assert.throws(
          () => storage.savePainReport(null, false, null, null),
          { message: 'Invalid exercise key: must be a non-empty string' }
        );
      });

      test('should throw error for invalid exerciseKey (empty string)', () => {
        assert.throws(
          () => storage.savePainReport('', false, null, null),
          { message: 'Invalid exercise key: must be a non-empty string' }
        );
      });

      test('should throw error for invalid exerciseKey (number)', () => {
        assert.throws(
          () => storage.savePainReport(123, false, null, null),
          { message: 'Invalid exercise key: must be a non-empty string' }
        );
      });

      test('should throw error for invalid hadPain type (string)', () => {
        assert.throws(
          () => storage.savePainReport('UPPER_A - DB Bench Press', 'yes', null, null),
          { message: 'hadPain must be boolean' }
        );
      });

      test('should throw error for invalid hadPain type (null)', () => {
        assert.throws(
          () => storage.savePainReport('UPPER_A - DB Bench Press', null, null, null),
          { message: 'hadPain must be boolean' }
        );
      });

      test('should throw error for invalid severity value', () => {
        assert.throws(
          () => storage.savePainReport('UPPER_A - DB Bench Press', true, 'shoulder', 'extreme'),
          { message: 'Invalid severity: must be minor, significant, or null' }
        );
      });

      test('should accept null severity', () => {
        assert.doesNotThrow(() =>
          storage.savePainReport('UPPER_A - DB Bench Press', false, null, null)
        );
      });

      test('should accept valid severity values', () => {
        assert.doesNotThrow(() =>
          storage.savePainReport('UPPER_A - DB Bench Press', true, 'shoulder', 'minor')
        );
        assert.doesNotThrow(() =>
          storage.savePainReport('UPPER_A - DB Bench Press', true, 'elbow', 'significant')
        );
      });
    });

    describe('History Size Limiting', () => {
      test('should limit pain reports to 10 entries per exercise', () => {
        runWithSyntheticCalendar(bump => {
          for (let i = 0; i < 11; i++) {
            const severity = i % 2 === 0 ? 'minor' : 'significant';
            storage.savePainReport('UPPER_A - DB Bench Press', true, 'shoulder', severity);
            bump();
          }
        });

        const history = storage.getPainHistory('UPPER_A - DB Bench Press');
        assert.strictEqual(history.length, 10, 'Should only keep last 10 entries');

        assert.strictEqual(history[0].severity, 'significant');
        assert.strictEqual(history[9].severity, 'minor');
      });

      test('should not affect other exercises when limiting one', () => {
        runWithSyntheticCalendar(bump => {
          for (let i = 0; i < 11; i++) {
            storage.savePainReport('UPPER_A - DB Bench Press', true, 'shoulder', 'minor');
            bump();
          }
          for (let i = 0; i < 5; i++) {
            storage.savePainReport('LOWER_A - Squat', true, 'knee', 'significant');
            bump();
          }
        });

        const benchHistory = storage.getPainHistory('UPPER_A - DB Bench Press');
        const squatHistory = storage.getPainHistory('LOWER_A - Squat');

        assert.strictEqual(benchHistory.length, 10);
        assert.strictEqual(squatHistory.length, 5);
      });
    });
  });
});
