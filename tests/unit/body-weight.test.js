import { strict as assert } from 'assert';
import { test, describe, beforeEach } from 'node:test';
import './setup.js';
import { BodyWeightManager } from '../../js/modules/body-weight.js';
import { StorageManager } from '../../js/modules/storage.js';

describe('BodyWeightManager', () => {
  let storage;
  let bodyWeight;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageManager();
    bodyWeight = new BodyWeightManager(storage);
  });

  describe('Constructor', () => {
    test('should accept storage instance via dependency injection', () => {
      assert.ok(bodyWeight.storage);
      assert.strictEqual(bodyWeight.storage, storage);
    });
  });

  describe('getData', () => {
    test('should return empty entries array when no data exists', () => {
      const data = bodyWeight.getData();
      assert.deepStrictEqual(data, { entries: [] });
    });

    test('should return stored data from localStorage', () => {
      localStorage.setItem('build_body_weight', JSON.stringify({
        entries: [{ date: '2026-02-01T10:00:00Z', weight_kg: 57.0 }]
      }));
      const data = bodyWeight.getData();
      assert.strictEqual(data.entries.length, 1);
      assert.strictEqual(data.entries[0].weight_kg, 57.0);
    });
  });

  describe('addEntry', () => {
    test('should add weight entry with ISO date', () => {
      bodyWeight.addEntry(57.5);
      const data = JSON.parse(localStorage.getItem('build_body_weight'));
      assert.strictEqual(data.entries.length, 1);
      assert.strictEqual(data.entries[0].weight_kg, 57.5);
      assert.ok(data.entries[0].date.includes('T')); // ISO format
    });

    test('should keep entries sorted by date', () => {
      bodyWeight.addEntry(57.0);
      bodyWeight.addEntry(57.5);
      bodyWeight.addEntry(58.0);
      const data = bodyWeight.getData();
      assert.strictEqual(data.entries.length, 3);
      assert.strictEqual(data.entries[0].weight_kg, 57.0);
      assert.strictEqual(data.entries[2].weight_kg, 58.0);
    });

    test('should sort entries by date when adding out of order', () => {
      // Manually add entries out of chronological order
      localStorage.setItem('build_body_weight', JSON.stringify({
        entries: [
          { date: '2026-02-05T10:00:00Z', weight_kg: 60.0 },
          { date: '2026-02-03T10:00:00Z', weight_kg: 58.0 }
        ]
      }));

      // Mock Date to return a date between the two existing entries
      const RealDate = Date;
      const middleDate = new RealDate('2026-02-04T10:00:00Z');
      global.Date = class extends RealDate {
        constructor(...args) {
          if (args.length === 0) {
            super(middleDate);
            return middleDate;
          }
          super(...args);
        }
      };

      bodyWeight.addEntry(59.0);

      // Restore real Date
      global.Date = RealDate;

      const data = bodyWeight.getData();
      assert.strictEqual(data.entries.length, 3);
      // Check sorting: 2/3, 2/4, 2/5
      assert.strictEqual(data.entries[0].weight_kg, 58.0); // 2026-02-03
      assert.strictEqual(data.entries[1].weight_kg, 59.0); // 2026-02-04
      assert.strictEqual(data.entries[2].weight_kg, 60.0); // 2026-02-05
    });

    test('should reject invalid weight values', () => {
      bodyWeight.addEntry('invalid');
      bodyWeight.addEntry(null);
      bodyWeight.addEntry(-5);
      bodyWeight.addEntry(0);

      const data = bodyWeight.getData();
      assert.strictEqual(data.entries.length, 0); // No entries added
    });

    test('should reject NaN weight', () => {
      bodyWeight.addEntry(NaN);
      const data = bodyWeight.getData();
      assert.strictEqual(data.entries.length, 0);
    });
  });
});
