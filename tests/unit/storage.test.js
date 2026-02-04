import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import './setup.js';
import { storage } from '../../src/storage.js';

describe('Storage Module', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveWorkout', () => {
    test('saves workout to localStorage', () => {
      const workout = {
        id: '1',
        date: '2024-01-15',
        exercises: []
      };

      storage.saveWorkout(workout);
      const saved = JSON.parse(localStorage.getItem('workout_1'));
      assert.deepEqual(saved, workout);
    });

    test('overwrites existing workout with same id', () => {
      const workout1 = { id: '1', date: '2024-01-15', exercises: [] };
      const workout2 = { id: '1', date: '2024-01-16', exercises: [] };

      storage.saveWorkout(workout1);
      storage.saveWorkout(workout2);

      const saved = JSON.parse(localStorage.getItem('workout_1'));
      assert.deepEqual(saved, workout2);
      assert.equal(saved.date, '2024-01-16');
    });
  });

  describe('getWorkout', () => {
    test('retrieves workout by id', () => {
      const workout = { id: '1', date: '2024-01-15', exercises: [] };
      localStorage.setItem('workout_1', JSON.stringify(workout));

      const retrieved = storage.getWorkout('1');
      assert.deepEqual(retrieved, workout);
    });

    test('returns null for non-existent workout', () => {
      const retrieved = storage.getWorkout('999');
      assert.equal(retrieved, null);
    });

    test('returns null for invalid JSON', () => {
      localStorage.setItem('workout_1', 'invalid json');
      const retrieved = storage.getWorkout('1');
      assert.equal(retrieved, null);
    });
  });

  describe('deleteWorkout', () => {
    test('removes workout from localStorage', () => {
      const workout = { id: '1', date: '2024-01-15', exercises: [] };
      localStorage.setItem('workout_1', JSON.stringify(workout));

      storage.deleteWorkout('1');
      assert.equal(localStorage.getItem('workout_1'), null);
    });

    test('does nothing for non-existent workout', () => {
      assert.doesNotThrow(() => storage.deleteWorkout('999'));
    });
  });

  describe('getAllWorkouts', () => {
    test('returns all workouts', () => {
      const workout1 = { id: '1', date: '2024-01-15', exercises: [] };
      const workout2 = { id: '2', date: '2024-01-16', exercises: [] };

      localStorage.setItem('workout_1', JSON.stringify(workout1));
      localStorage.setItem('workout_2', JSON.stringify(workout2));
      localStorage.setItem('other_key', 'value');

      const workouts = storage.getAllWorkouts();
      assert.equal(workouts.length, 2);
      assert.ok(workouts.some(w => w.id === '1' && w.date === '2024-01-15'));
      assert.ok(workouts.some(w => w.id === '2' && w.date === '2024-01-16'));
    });

    test('returns empty array when no workouts exist', () => {
      const workouts = storage.getAllWorkouts();
      assert.deepEqual(workouts, []);
    });

    test('skips invalid JSON entries', () => {
      const workout1 = { id: '1', date: '2024-01-15', exercises: [] };
      localStorage.setItem('workout_1', JSON.stringify(workout1));
      localStorage.setItem('workout_2', 'invalid json');

      const workouts = storage.getAllWorkouts();
      assert.equal(workouts.length, 1);
      assert.deepEqual(workouts[0], workout1);
    });
  });

  describe('history', () => {
    describe('addToHistory', () => {
      test('adds workout id to history', () => {
        storage.history.addToHistory('1');
        const history = storage.history.getHistory();
        assert.deepEqual(history, ['1']);
      });

      test('maintains last 8 items only', () => {
        for (let i = 1; i <= 10; i++) {
          storage.history.addToHistory(String(i));
        }

        const history = storage.history.getHistory();
        assert.equal(history.length, 8);
        assert.deepEqual(history, ['3', '4', '5', '6', '7', '8', '9', '10']);
      });

      test('adds to end of history', () => {
        storage.history.addToHistory('1');
        storage.history.addToHistory('2');
        storage.history.addToHistory('3');

        const history = storage.history.getHistory();
        assert.deepEqual(history, ['1', '2', '3']);
      });
    });

    describe('getHistory', () => {
      test('returns empty array when no history exists', () => {
        const history = storage.history.getHistory();
        assert.deepEqual(history, []);
      });

      test('retrieves stored history', () => {
        localStorage.setItem('workout_history', JSON.stringify(['1', '2', '3']));
        const history = storage.history.getHistory();
        assert.deepEqual(history, ['1', '2', '3']);
      });

      test('returns empty array for invalid JSON', () => {
        localStorage.setItem('workout_history', 'invalid json');
        const history = storage.history.getHistory();
        assert.deepEqual(history, []);
      });
    });

    describe('clearHistory', () => {
      test('removes all history', () => {
        storage.history.addToHistory('1');
        storage.history.addToHistory('2');

        storage.history.clearHistory();
        const history = storage.history.getHistory();
        assert.deepEqual(history, []);
      });
    });
  });
});
