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

  describe('trimTo8Weeks', () => {
    test('should keep only last 8 weeks of entries', () => {
      // Add entries spanning 10 weeks, starting 10 weeks ago
      const now = new Date();
      const startDate = new Date(now.getTime() - 10 * 7 * 24 * 60 * 60 * 1000);

      for (let week = 0; week < 10; week++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + week * 7);
        const isoDate = date.toISOString();
        const data = bodyWeight.getData();
        data.entries.push({ date: isoDate, weight_kg: 55.0 + week });
        localStorage.setItem('build_body_weight', JSON.stringify(data));
      }

      bodyWeight.addEntry(65.0); // Triggers trim
      const data = bodyWeight.getData();

      // Should keep only entries from last 8 weeks
      assert.ok(data.entries.length <= 9); // 8 old + 1 new
      const oldestDate = new Date(data.entries[0].date);
      const newestDate = new Date(data.entries[data.entries.length - 1].date);
      const weeksDiff = (newestDate - oldestDate) / (7 * 24 * 60 * 60 * 1000);
      assert.ok(weeksDiff <= 8);
    });
  });

  describe('getWeightSummary', () => {
    test('should return null when no entries exist', () => {
      const summary = bodyWeight.getWeightSummary();
      assert.strictEqual(summary, null);
    });

    test('should calculate summary with single entry', () => {
      bodyWeight.addEntry(57.5);
      const summary = bodyWeight.getWeightSummary();

      assert.strictEqual(summary.currentWeight, 57.5);
      assert.strictEqual(summary.trend8Week, 0);
      assert.strictEqual(summary.monthlyRate, 0);
      assert.strictEqual(summary.status, 'maintenance');
    });

    test('should calculate 8-week trend and monthly rate', () => {
      // Add entries spanning 8 weeks: 56kg → 58kg
      const startDate = new Date('2025-12-10');
      for (let week = 0; week < 8; week++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + week * 7);
        const weight = 56.0 + (week * 0.25); // +0.25kg/week = +1kg/month
        const data = bodyWeight.getData();
        data.entries.push({ date: date.toISOString(), weight_kg: weight });
        localStorage.setItem('build_body_weight', JSON.stringify(data));
      }

      const summary = bodyWeight.getWeightSummary();

      assert.strictEqual(summary.currentWeight, 57.75);
      assert.strictEqual(summary.trend8Week, 1.75); // 8 weeks * 0.25kg
      assert.ok(Math.abs(summary.monthlyRate - 1.0) < 0.1); // ~1kg/month
      assert.strictEqual(summary.status, 'fast_bulk'); // >0.7kg/month
    });
  });
});
