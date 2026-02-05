# BUILD Tracker MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-first PWA for tracking Upper/Lower Split workouts with smart defaults and progression tracking

**Architecture:** Modular vanilla JavaScript with localStorage persistence, test-driven development, mobile-first responsive design (400-430px width)

**Tech Stack:**
- Vanilla JavaScript (ES6+ modules)
- localStorage for data persistence
- PWA (Service Worker + manifest.json)
- CSS Grid/Flexbox for responsive layout
- Zero external dependencies

**Target:** Moto Edge 60 Pro (6.7" display, ~480px viewport height)

---

## Project Structure

```
workout-build-tracker/
├── src/
│   ├── index.html              # PWA entry point
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   ├── js/
│   │   ├── app.js              # Main application entry
│   │   ├── modules/
│   │   │   ├── workouts.js         # Workout definitions (Upper A/B, Lower A/B)
│   │   │   ├── storage.js          # localStorage wrapper
│   │   │   ├── progression.js      # Double progression logic
│   │   │   ├── workout-manager.js  # Workout rotation logic
│   │   │   └── ui-controller.js    # DOM manipulation
│   │   └── utils/
│   │       ├── date-helpers.js
│   │       └── validators.js
│   ├── css/
│   │   ├── main.css            # Base styles, variables
│   │   ├── components.css      # Reusable components
│   │   └── screens.css         # Screen-specific styles
│   └── assets/
│       └── icons/              # PWA icons (192×192, 512×512)
├── tests/
│   ├── unit/
│   │   ├── storage.test.js
│   │   ├── progression.test.js
│   │   ├── workout-manager.test.js
│   │   └── validators.test.js
│   └── integration/
│       └── workout-flow.test.js
└── docs/
    └── plans/                  # This file
```

---

## Task 1: Project Foundation & Test Infrastructure

**Files:**
- Create: `tests/unit/setup.js`
- Create: `package.json` (for test runner only)
- Create: `.gitignore`

**Step 1: Initialize test infrastructure**

Create `package.json`:
```json
{
  "name": "build-tracker",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "node --test tests/unit/**/*.test.js",
    "test:watch": "node --test --watch tests/unit/**/*.test.js"
  },
  "devDependencies": {}
}
```

**Step 2: Create test setup**

Create `tests/unit/setup.js`:
```javascript
// Mock localStorage for Node.js test environment
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value.toString();
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  }
};
```

**Step 3: Update .gitignore**

Add to `.gitignore`:
```
node_modules/
.DS_Store
*.log
coverage/
dist/
```

**Step 4: Verify test setup**

Run: `npm test`
Expected: "no test files were found"

**Step 5: Commit**

```bash
git add package.json tests/unit/setup.js .gitignore
git commit -m "chore: initialize test infrastructure

- Add package.json with test scripts
- Configure localStorage mock for tests
- Update .gitignore

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Storage Module (localStorage Wrapper)

**Files:**
- Create: `src/js/modules/storage.js`
- Create: `tests/unit/storage.test.js`

**Step 1: Write failing tests for storage module**

Create `tests/unit/storage.test.js`:
```javascript
import { strict as assert } from 'assert';
import { test, describe, beforeEach } from 'node:test';
import '../setup.js';

// Import will fail - we haven't created the file yet
import { StorageManager } from '../../src/js/modules/storage.js';

describe('StorageManager', () => {
  let storage;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageManager();
  });

  test('should save and retrieve workout rotation', () => {
    const rotation = {
      lastWorkout: 'UPPER_A',
      lastDate: '2026-02-03',
      nextSuggested: 'LOWER_A'
    };

    storage.saveRotation(rotation);
    const retrieved = storage.getRotation();

    assert.deepStrictEqual(retrieved, rotation);
  });

  test('should return default rotation if none exists', () => {
    const rotation = storage.getRotation();

    assert.strictEqual(rotation.lastWorkout, null);
    assert.strictEqual(rotation.nextSuggested, 'UPPER_A');
  });

  test('should save exercise history', () => {
    const exerciseKey = 'UPPER_A - DB Bench Press';
    const history = [{
      date: '2026-02-03',
      sets: [
        { weight: 7.5, reps: 10, rir: 2 },
        { weight: 7.5, reps: 11, rir: 2 },
        { weight: 7.5, reps: 12, rir: 2 }
      ],
      progressionStatus: 'ready'
    }];

    storage.saveExerciseHistory(exerciseKey, history);
    const retrieved = storage.getExerciseHistory(exerciseKey);

    assert.deepStrictEqual(retrieved, history);
  });

  test('should limit exercise history to 8 most recent workouts', () => {
    const exerciseKey = 'UPPER_A - DB Bench Press';
    const history = Array(10).fill(null).map((_, i) => ({
      date: `2026-02-${String(i + 1).padStart(2, '0')}`,
      sets: [{ weight: 10, reps: 10, rir: 2 }],
      progressionStatus: 'normal'
    }));

    storage.saveExerciseHistory(exerciseKey, history);
    const retrieved = storage.getExerciseHistory(exerciseKey);

    assert.strictEqual(retrieved.length, 8);
    assert.strictEqual(retrieved[0].date, '2026-02-03'); // Newest first
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL with "Cannot find module '../../src/js/modules/storage.js'"

**Step 3: Write minimal implementation**

Create `src/js/modules/storage.js`:
```javascript
const KEYS = {
  ROTATION: 'build_workout_rotation',
  EXERCISE_HISTORY_PREFIX: 'build_exercise_'
};

export class StorageManager {
  constructor() {
    this.storage = window.localStorage || localStorage;
  }

  // Workout Rotation
  saveRotation(rotation) {
    this.storage.setItem(KEYS.ROTATION, JSON.stringify(rotation));
  }

  getRotation() {
    const data = this.storage.getItem(KEYS.ROTATION);
    if (!data) {
      return {
        lastWorkout: null,
        lastDate: null,
        nextSuggested: 'UPPER_A'
      };
    }
    return JSON.parse(data);
  }

  // Exercise History
  saveExerciseHistory(exerciseKey, history) {
    // Limit to 8 most recent workouts
    const limited = history.slice(-8);
    const key = `${KEYS.EXERCISE_HISTORY_PREFIX}${exerciseKey}`;
    this.storage.setItem(key, JSON.stringify(limited));
  }

  getExerciseHistory(exerciseKey) {
    const key = `${KEYS.EXERCISE_HISTORY_PREFIX}${exerciseKey}`;
    const data = this.storage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // Clear all data (for testing)
  clearAll() {
    this.storage.clear();
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/js/modules/storage.js tests/unit/storage.test.js
git commit -m "feat: add storage module with localStorage wrapper

- Implements workout rotation save/retrieve
- Implements exercise history with 8-workout limit
- Includes comprehensive unit tests
- TDD approach: tests written first

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Workout Definitions Module

**Files:**
- Create: `src/js/modules/workouts.js`
- Create: `tests/unit/workouts.test.js`

**Step 1: Write failing tests for workout definitions**

Create `tests/unit/workouts.test.js`:
```javascript
import { strict as assert } from 'assert';
import { test, describe } from 'node:test';
import { WORKOUTS, getWorkout, getAllWorkouts } from '../../src/js/modules/workouts.js';

describe('Workout Definitions', () => {
  test('should have 4 workout types', () => {
    const workouts = getAllWorkouts();
    assert.strictEqual(workouts.length, 4);
  });

  test('should get UPPER_A workout', () => {
    const workout = getWorkout('UPPER_A');

    assert.strictEqual(workout.name, 'UPPER_A');
    assert.strictEqual(workout.displayName, 'Upper A - Horizontal');
    assert.strictEqual(workout.exercises.length, 7);
    assert.strictEqual(workout.exercises[0].name, 'DB Flat Bench Press');
  });

  test('UPPER_A first exercise should have correct structure', () => {
    const workout = getWorkout('UPPER_A');
    const exercise = workout.exercises[0];

    assert.strictEqual(exercise.name, 'DB Flat Bench Press');
    assert.strictEqual(exercise.sets, 3);
    assert.strictEqual(exercise.repRange, '8-12');
    assert.strictEqual(exercise.rirTarget, '2-3');
    assert.strictEqual(exercise.startingWeight, 7.5);
    assert.strictEqual(exercise.weightIncrement, 2.5);
  });

  test('should validate all exercises have required fields', () => {
    const workouts = getAllWorkouts();

    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        assert.ok(exercise.name, 'Exercise must have name');
        assert.ok(exercise.sets > 0, 'Exercise must have sets');
        assert.ok(exercise.repRange, 'Exercise must have repRange');
        assert.ok(exercise.rirTarget, 'Exercise must have rirTarget');
        assert.ok(exercise.startingWeight >= 0, 'Exercise must have startingWeight');
      });
    });
  });

  test('should have correct workout rotation order', () => {
    const rotationOrder = ['UPPER_A', 'LOWER_A', 'UPPER_B', 'LOWER_B'];
    const workouts = getAllWorkouts();

    rotationOrder.forEach((expectedName, index) => {
      assert.strictEqual(workouts[index].name, expectedName);
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

Create `src/js/modules/workouts.js`:
```javascript
export const WORKOUTS = {
  UPPER_A: {
    name: 'UPPER_A',
    displayName: 'Upper A - Horizontal',
    description: 'Horizontal push/pull emphasis',
    exercises: [
      {
        name: 'DB Flat Bench Press',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        startingWeight: 7.5,
        weightIncrement: 2.5,
        tempo: '2 sec down, 1 sec up',
        notes: 'Primary: Chest, Secondary: Front delts, triceps'
      },
      {
        name: 'Seated Cable Row',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 22.5,
        weightIncrement: 2.5,
        tempo: '2 sec pull, 2 sec return',
        notes: 'Primary: Mid back (lats, rhomboids)'
      },
      {
        name: 'DB Chest Fly',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 5,
        weightIncrement: 1.25,
        tempo: '3 sec down (stretch), 1 sec up',
        notes: 'Primary: Chest (horizontal adduction)'
      },
      {
        name: 'T-Bar Row',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 5,
        weightIncrement: 2.5,
        tempo: '2 sec pull, 2 sec return',
        notes: 'Primary: Back thickness (lats, traps)'
      },
      {
        name: 'DB Lateral Raises',
        sets: 2,
        repRange: '12-15',
        rirTarget: '2-3',
        startingWeight: 3.5,
        weightIncrement: 1.25,
        tempo: '2 sec up, 3 sec down',
        notes: 'Primary: Side delts'
      },
      {
        name: 'Face Pulls',
        sets: 2,
        repRange: '15-20',
        rirTarget: '3',
        startingWeight: 12.5,
        weightIncrement: 2.5,
        tempo: 'Controlled, external rotation',
        notes: 'Rotator cuff health (stiff shoulders)'
      },
      {
        name: 'Band Pull-Aparts',
        sets: 2,
        repRange: '15-20',
        rirTarget: '3',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: '1 sec apart, 2 sec together',
        notes: 'Rotator cuff activation'
      }
    ]
  },

  LOWER_A: {
    name: 'LOWER_A',
    displayName: 'Lower A - Bilateral',
    description: 'Bilateral/compound emphasis',
    exercises: [
      {
        name: 'Hack Squat',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        startingWeight: 20,
        weightIncrement: 5,
        tempo: '3 sec down, 2 sec up',
        notes: 'Quad development (weak legs)'
      },
      {
        name: 'Leg Curl',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 17.5,
        weightIncrement: 2.5,
        tempo: '2 sec curl, 3 sec return',
        notes: 'Primary: Hamstrings'
      },
      {
        name: 'Leg Extension',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 17.5,
        weightIncrement: 2.5,
        tempo: '2 sec extend, 3 sec return',
        notes: 'Do AFTER squats (pre-exhaustion safer)'
      },
      {
        name: '45° Hyperextension',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 0,
        weightIncrement: 2.5,
        tempo: '3-4 sec down, 2 sec up',
        notes: 'CRITICAL: Lower back weakness - NOT to failure'
      },
      {
        name: 'Standing Calf Raise',
        sets: 3,
        repRange: '15-20',
        rirTarget: '2-3',
        startingWeight: 20,
        weightIncrement: 5,
        tempo: 'Explosive up (1 sec), controlled down (2 sec)',
        notes: 'Gastrocnemius (fast-twitch)'
      },
      {
        name: 'Plank',
        sets: 3,
        repRange: '30-60s',
        rirTarget: '2-3',
        startingWeight: 0,
        weightIncrement: 2.5,
        tempo: 'Hold with proper breathing',
        notes: 'Core strength for lower back health'
      }
    ]
  },

  UPPER_B: {
    name: 'UPPER_B',
    displayName: 'Upper B - Vertical',
    description: 'Vertical push/pull emphasis',
    exercises: [
      {
        name: 'Lat Pulldown',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        startingWeight: 22.5,
        weightIncrement: 2.5,
        tempo: '2 sec pull, 2 sec return',
        notes: 'Primary: Lats (back width)'
      },
      {
        name: 'DB Shoulder Press',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        startingWeight: 7.5,
        weightIncrement: 1.25,
        tempo: '2 sec press, 2 sec down',
        notes: 'Primary: Shoulders (anterior/lateral delts)'
      },
      {
        name: 'Chest-Supported Row',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 10,
        weightIncrement: 2.5,
        tempo: '2 sec pull, 2 sec return',
        notes: 'Primary: Back thickness'
      },
      {
        name: 'Incline DB Press',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 7.5,
        weightIncrement: 2.5,
        tempo: '2 sec down, 1 sec up',
        notes: 'Upper chest emphasis'
      },
      {
        name: 'Reverse Fly',
        sets: 2,
        repRange: '12-15',
        rirTarget: '2-3',
        startingWeight: 5,
        weightIncrement: 1.25,
        tempo: 'Controlled, focus on rear delts',
        notes: 'Rear delts, rotator cuff'
      },
      {
        name: 'Band Pull-Aparts',
        sets: 2,
        repRange: '15-20',
        rirTarget: '3',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: '1 sec apart, 2 sec together',
        notes: 'Rotator cuff activation'
      },
      {
        name: 'Dead Bug',
        sets: 3,
        repRange: '10-12/side',
        rirTarget: '2-3',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: 'Controlled alternating',
        notes: 'Core stability, lower back health'
      }
    ]
  },

  LOWER_B: {
    name: 'LOWER_B',
    displayName: 'Lower B - Unilateral',
    description: 'Unilateral/accessory emphasis',
    exercises: [
      {
        name: 'DB Goblet Squat',
        sets: 3,
        repRange: '8-12',
        rirTarget: '2-3',
        startingWeight: 10,
        weightIncrement: 2.5,
        tempo: '3 sec down, 2 sec up',
        notes: 'Full leg compound'
      },
      {
        name: 'DB Romanian Deadlift',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 10,
        weightIncrement: 2.5,
        tempo: '3 sec down, 2 sec up',
        notes: 'Hamstrings, glutes, lower back'
      },
      {
        name: 'Leg Abduction',
        sets: 3,
        repRange: '12-15',
        rirTarget: '2-3',
        startingWeight: 15,
        weightIncrement: 2.5,
        tempo: '2 sec out, 2 sec in',
        notes: 'Hip abductors (glute medius)'
      },
      {
        name: 'Hip Thrust',
        sets: 3,
        repRange: '10-12',
        rirTarget: '2-3',
        startingWeight: 20,
        weightIncrement: 5,
        tempo: '1 sec up, 2 sec down, 1 sec squeeze',
        notes: 'Primary: Glutes'
      },
      {
        name: 'Seated Calf Raise',
        sets: 3,
        repRange: '15-20',
        rirTarget: '2-3',
        startingWeight: 15,
        weightIncrement: 5,
        tempo: '3-5 sec (slow-twitch focus)',
        notes: 'Soleus (slow-twitch dominant)'
      },
      {
        name: 'Side Plank',
        sets: 3,
        repRange: '30s/side',
        rirTarget: '2-3',
        startingWeight: 0,
        weightIncrement: 0,
        tempo: 'Hold stable',
        notes: 'Obliques, glute medius'
      }
    ]
  }
};

export function getWorkout(workoutName) {
  return WORKOUTS[workoutName];
}

export function getAllWorkouts() {
  return [
    WORKOUTS.UPPER_A,
    WORKOUTS.LOWER_A,
    WORKOUTS.UPPER_B,
    WORKOUTS.LOWER_B
  ];
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/js/modules/workouts.js tests/unit/workouts.test.js
git commit -m "feat: add workout definitions for Upper/Lower split

- Defines 4 workouts: Upper A/B, Lower A/B
- 24 total exercises with complete metadata
- Includes starting weights, rep ranges, RIR targets
- Includes tempo and exercise notes
- Comprehensive tests for data structure

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Progression Engine (Double Progression Logic)

**Files:**
- Create: `src/js/modules/progression.js`
- Create: `tests/unit/progression.test.js`

**Step 1: Write failing tests for progression logic**

Create `tests/unit/progression.test.js`:
```javascript
import { strict as assert } from 'assert';
import { test, describe } from 'node:test';
import {
  shouldIncreaseWeight,
  getProgressionStatus,
  getNextWeight
} from '../../src/js/modules/progression.js';

describe('Progression Engine', () => {
  describe('shouldIncreaseWeight', () => {
    test('should return true when all sets hit max reps at RIR 2-3', () => {
      const sets = [
        { weight: 20, reps: 12, rir: 2 },
        { weight: 20, reps: 12, rir: 2 },
        { weight: 20, reps: 12, rir: 3 }
      ];
      const exercise = { repRange: '8-12', rirTarget: '2-3' };

      const result = shouldIncreaseWeight(sets, exercise);
      assert.strictEqual(result, true);
    });

    test('should return false when reps below max range', () => {
      const sets = [
        { weight: 20, reps: 10, rir: 2 },
        { weight: 20, reps: 11, rir: 2 },
        { weight: 20, reps: 11, rir: 2 }
      ];
      const exercise = { repRange: '8-12', rirTarget: '2-3' };

      const result = shouldIncreaseWeight(sets, exercise);
      assert.strictEqual(result, false);
    });

    test('should return false when RIR too low', () => {
      const sets = [
        { weight: 20, reps: 12, rir: 1 },
        { weight: 20, reps: 12, rir: 0 },
        { weight: 20, reps: 12, rir: 1 }
      ];
      const exercise = { repRange: '8-12', rirTarget: '2-3' };

      const result = shouldIncreaseWeight(sets, exercise);
      assert.strictEqual(result, false);
    });

    test('should return false when not all sets hit max', () => {
      const sets = [
        { weight: 20, reps: 12, rir: 2 },
        { weight: 20, reps: 11, rir: 2 },
        { weight: 20, reps: 12, rir: 2 }
      ];
      const exercise = { repRange: '8-12', rirTarget: '2-3' };

      const result = shouldIncreaseWeight(sets, exercise);
      assert.strictEqual(result, false);
    });
  });

  describe('getProgressionStatus', () => {
    test('should return "ready" when criteria met', () => {
      const history = [{
        date: '2026-02-03',
        sets: [
          { weight: 20, reps: 12, rir: 2 },
          { weight: 20, reps: 12, rir: 2 },
          { weight: 20, reps: 12, rir: 2 }
        ]
      }];
      const exercise = { repRange: '8-12', rirTarget: '2-3' };

      const status = getProgressionStatus(history, exercise);
      assert.strictEqual(status, 'ready');
    });

    test('should return "normal" for in-progress sets', () => {
      const history = [{
        date: '2026-02-03',
        sets: [
          { weight: 20, reps: 10, rir: 2 },
          { weight: 20, reps: 11, rir: 2 },
          { weight: 20, reps: 11, rir: 2 }
        ]
      }];
      const exercise = { repRange: '8-12', rirTarget: '2-3' };

      const status = getProgressionStatus(history, exercise);
      assert.strictEqual(status, 'normal');
    });

    test('should return "plateau" after 3 sessions same weight', () => {
      const history = [
        {
          date: '2026-01-30',
          sets: [{ weight: 20, reps: 10, rir: 2 }]
        },
        {
          date: '2026-02-01',
          sets: [{ weight: 20, reps: 10, rir: 2 }]
        },
        {
          date: '2026-02-03',
          sets: [{ weight: 20, reps: 10, rir: 2 }]
        }
      ];
      const exercise = { repRange: '8-12', rirTarget: '2-3' };

      const status = getProgressionStatus(history, exercise);
      assert.strictEqual(status, 'plateau');
    });
  });

  describe('getNextWeight', () => {
    test('should add increment when ready to progress', () => {
      const currentWeight = 20;
      const increment = 2.5;
      const shouldProgress = true;

      const nextWeight = getNextWeight(currentWeight, increment, shouldProgress);
      assert.strictEqual(nextWeight, 22.5);
    });

    test('should keep weight when not ready', () => {
      const currentWeight = 20;
      const increment = 2.5;
      const shouldProgress = false;

      const nextWeight = getNextWeight(currentWeight, increment, shouldProgress);
      assert.strictEqual(nextWeight, 20);
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

Create `src/js/modules/progression.js`:
```javascript
/**
 * Double Progression Logic
 *
 * Weight increases ONLY when:
 * 1. ALL sets hit the top of the rep range
 * 2. ALL sets maintained RIR >= minimum target
 */

export function shouldIncreaseWeight(sets, exercise) {
  if (!sets || sets.length === 0) return false;

  const [min, max] = exercise.repRange.split('-').map(Number);
  const [rirMin, rirMax] = exercise.rirTarget.split('-').map(Number);

  // All sets must hit max reps
  const allSetsMaxReps = sets.every(set => set.reps >= max);

  // All sets must have RIR >= minimum target
  const allSetsGoodRIR = sets.every(set => set.rir >= rirMin);

  return allSetsMaxReps && allSetsGoodRIR;
}

export function getProgressionStatus(history, exercise) {
  if (!history || history.length === 0) return 'normal';

  const lastWorkout = history[history.length - 1];
  const readyToProgress = shouldIncreaseWeight(lastWorkout.sets, exercise);

  if (readyToProgress) return 'ready';

  // Check for plateau (3+ sessions at same weight)
  if (history.length >= 3) {
    const last3 = history.slice(-3);
    const weights = last3.map(w => w.sets[0].weight);
    const allSameWeight = weights.every(w => w === weights[0]);

    if (allSameWeight) return 'plateau';
  }

  return 'normal';
}

export function getNextWeight(currentWeight, increment, shouldProgress) {
  return shouldProgress ? currentWeight + increment : currentWeight;
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/js/modules/progression.js tests/unit/progression.test.js
git commit -m "feat: add progression engine with double progression logic

- Implements shouldIncreaseWeight (all sets max reps + RIR check)
- Detects plateau after 3 sessions at same weight
- Calculates next weight based on progression status
- Comprehensive unit tests
- Follows design spec: strict progression criteria

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Workout Manager (Rotation Logic)

**Files:**
- Create: `src/js/modules/workout-manager.js`
- Create: `tests/unit/workout-manager.test.js`

**Step 1: Write failing tests**

Create `tests/unit/workout-manager.test.js`:
```javascript
import { strict as assert } from 'assert';
import { test, describe, beforeEach } from 'node:test';
import '../setup.js';
import { WorkoutManager } from '../../src/js/modules/workout-manager.js';
import { StorageManager } from '../../src/js/modules/storage.js';

describe('WorkoutManager', () => {
  let manager;
  let storage;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageManager();
    manager = new WorkoutManager(storage);
  });

  test('should suggest UPPER_A as first workout', () => {
    const next = manager.getNextWorkout();
    assert.strictEqual(next, 'UPPER_A');
  });

  test('should rotate to LOWER_A after UPPER_A', () => {
    storage.saveRotation({
      lastWorkout: 'UPPER_A',
      lastDate: '2026-02-03',
      nextSuggested: 'LOWER_A'
    });

    const next = manager.getNextWorkout();
    assert.strictEqual(next, 'LOWER_A');
  });

  test('should follow Upper → Lower → Upper → Lower rotation', () => {
    const expected = ['UPPER_A', 'LOWER_A', 'UPPER_B', 'LOWER_B', 'UPPER_A'];

    let current = manager.getNextWorkout();
    assert.strictEqual(current, expected[0]);

    for (let i = 1; i < expected.length; i++) {
      manager.completeWorkout(current);
      current = manager.getNextWorkout();
      assert.strictEqual(current, expected[i]);
    }
  });

  test('should check if muscles need recovery', () => {
    // Last workout was UPPER_A (48 hours ago)
    const lastDate = new Date('2026-02-01T10:00:00Z');
    storage.saveRotation({
      lastWorkout: 'UPPER_A',
      lastDate: lastDate.toISOString(),
      nextSuggested: 'LOWER_A'
    });

    // Trying to do UPPER_B after only 24 hours
    const now = new Date('2026-02-02T10:00:00Z');
    const needsRecovery = manager.checkMuscleRecovery('UPPER_B', now);

    assert.strictEqual(needsRecovery.warn, true);
    assert.ok(needsRecovery.muscles.length > 0);
  });

  test('should allow consecutive Upper → Lower workouts', () => {
    // Last workout was UPPER_A (12 hours ago)
    const lastDate = new Date('2026-02-03T10:00:00Z');
    storage.saveRotation({
      lastWorkout: 'UPPER_A',
      lastDate: lastDate.toISOString(),
      nextSuggested: 'LOWER_A'
    });

    // Trying to do LOWER_A after 12 hours (should be fine)
    const now = new Date('2026-02-03T22:00:00Z');
    const needsRecovery = manager.checkMuscleRecovery('LOWER_A', now);

    assert.strictEqual(needsRecovery.warn, false);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

Create `src/js/modules/workout-manager.js`:
```javascript
const ROTATION_ORDER = ['UPPER_A', 'LOWER_A', 'UPPER_B', 'LOWER_B'];

const MUSCLE_GROUPS = {
  UPPER_A: ['chest', 'back', 'shoulders'],
  UPPER_B: ['chest', 'back', 'shoulders'],
  LOWER_A: ['quads', 'hamstrings', 'glutes'],
  LOWER_B: ['quads', 'hamstrings', 'glutes']
};

const RECOVERY_HOURS = {
  chest: 48,
  back: 48,
  shoulders: 48,
  quads: 48,
  hamstrings: 48,
  glutes: 48
};

export class WorkoutManager {
  constructor(storage) {
    this.storage = storage;
  }

  getNextWorkout() {
    const rotation = this.storage.getRotation();
    return rotation.nextSuggested;
  }

  completeWorkout(workoutName) {
    const currentIndex = ROTATION_ORDER.indexOf(workoutName);
    const nextIndex = (currentIndex + 1) % ROTATION_ORDER.length;
    const nextWorkout = ROTATION_ORDER[nextIndex];

    this.storage.saveRotation({
      lastWorkout: workoutName,
      lastDate: new Date().toISOString(),
      nextSuggested: nextWorkout
    });
  }

  checkMuscleRecovery(proposedWorkout, currentTime = new Date()) {
    const rotation = this.storage.getRotation();
    if (!rotation.lastWorkout || !rotation.lastDate) {
      return { warn: false, muscles: [] };
    }

    const lastDate = new Date(rotation.lastDate);
    const hoursSince = (currentTime - lastDate) / (1000 * 60 * 60);

    const lastMuscles = MUSCLE_GROUPS[rotation.lastWorkout];
    const proposedMuscles = MUSCLE_GROUPS[proposedWorkout];

    const problematic = [];

    for (const muscle of proposedMuscles) {
      if (lastMuscles.includes(muscle)) {
        const hoursNeeded = RECOVERY_HOURS[muscle];
        if (hoursSince < hoursNeeded) {
          problematic.push({
            name: muscle,
            hoursNeeded: Math.round(hoursNeeded - hoursSince)
          });
        }
      }
    }

    return {
      warn: problematic.length > 0,
      muscles: problematic
    };
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/js/modules/workout-manager.js tests/unit/workout-manager.test.js
git commit -m "feat: add workout manager with rotation logic

- Implements Upper/Lower rotation (UPPER_A → LOWER_A → UPPER_B → LOWER_B)
- Muscle-specific recovery tracking (48hr major muscles)
- Allows consecutive Upper → Lower workouts (no muscle overlap)
- Warns on Upper → Upper or Lower → Lower (muscle overlap)
- Comprehensive unit tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Basic HTML Structure & PWA Setup

**Files:**
- Create: `src/index.html`
- Create: `src/manifest.json`
- Create: `src/css/main.css`

**Step 1: Create PWA manifest**

Create `src/manifest.json`:
```json
{
  "name": "BUILD Workout Tracker",
  "short_name": "BUILD",
  "description": "Upper/Lower Split workout tracker for beginners",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#667eea",
  "orientation": "portrait",
  "icons": [
    {
      "src": "assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Step 2: Create base HTML**

Create `src/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#667eea">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>BUILD Workout Tracker</title>
  <link rel="manifest" href="manifest.json">
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/screens.css">
</head>
<body>
  <div id="app">
    <!-- Home Screen -->
    <div id="home-screen" class="screen active">
      <header class="app-header">
        <h1>BUILD Tracker</h1>
        <button id="settings-btn" class="icon-btn" aria-label="Settings">⚙️</button>
      </header>

      <main class="screen-content">
        <section class="workout-card">
          <h2>Next Workout</h2>
          <p id="next-workout-name" class="workout-name">Upper A - Horizontal</p>
          <p id="last-trained" class="meta">Last trained: Never</p>

          <button id="start-workout-btn" class="btn-primary btn-large">
            START WORKOUT
          </button>
        </section>

        <section class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="action-grid">
            <button class="action-btn">📊 History</button>
            <button class="action-btn">📈 Progress</button>
          </div>
        </section>

        <section id="recovery-status" class="recovery-card">
          <h3>Recovery Status</h3>
          <div id="recovery-list">
            <p class="recovery-ok">✓ All muscles recovered</p>
          </div>
        </section>
      </main>
    </div>

    <!-- In-Workout Screen (hidden by default) -->
    <div id="workout-screen" class="screen">
      <header class="app-header">
        <button id="back-btn" class="icon-btn">←</button>
        <h1 id="workout-title">Upper A</h1>
        <span id="timer">00:00</span>
        <button id="workout-settings-btn" class="icon-btn">⚙️</button>
      </header>

      <main class="screen-content">
        <div id="exercise-list">
          <!-- Dynamically populated -->
        </div>

        <button id="complete-workout-btn" class="btn-primary btn-large" style="display: none;">
          COMPLETE WORKOUT
        </button>
      </main>
    </div>
  </div>

  <script type="module" src="js/app.js"></script>
</body>
</html>
```

**Step 3: Create base CSS**

Create `src/css/main.css`:
```css
:root {
  --color-bg: #0a0a0a;
  --color-surface: #1a1a1a;
  --color-surface-light: #2a2a2a;
  --color-text: #e0e0e0;
  --color-text-dim: #a0a0a0;
  --color-primary: #667eea;
  --color-success: #48bb78;
  --color-warning: #f6ad55;
  --color-danger: #fc8181;
  --color-info: #4299e1;

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  --tap-target-min: 44px;
  --tap-target-large: 60px;
  --tap-target-huge: 70px;

  --font-xs: 12px;
  --font-sm: 14px;
  --font-md: 16px;
  --font-lg: 18px;
  --font-xl: 24px;
  --font-xxl: 32px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--color-bg);
}

/* Screen Management */
.screen {
  display: none;
}

.screen.active {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: 60px;
}

.app-header h1 {
  font-size: var(--font-xl);
  font-weight: 600;
}

.icon-btn {
  min-width: var(--tap-target-min);
  min-height: var(--tap-target-min);
  background: transparent;
  border: none;
  color: var(--color-text);
  font-size: var(--font-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
}

.icon-btn:active {
  background: rgba(255, 255, 255, 0.1);
}

/* Screen Content */
.screen-content {
  flex: 1;
  padding: var(--spacing-md);
}

/* Buttons */
.btn-primary {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: var(--font-lg);
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.2s;
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-large {
  min-height: var(--tap-target-large);
  padding: var(--spacing-md);
}

/* Cards */
.workout-card,
.recovery-card,
.quick-actions {
  background: var(--color-surface);
  border-radius: 12px;
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.workout-card h2,
.recovery-card h3,
.quick-actions h3 {
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}

.workout-name {
  font-size: var(--font-xxl);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.meta {
  font-size: var(--font-sm);
  color: var(--color-text-dim);
  margin-bottom: var(--spacing-lg);
}

/* Quick Actions */
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.action-btn {
  min-height: var(--tap-target-large);
  background: var(--color-surface-light);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--color-text);
  font-size: var(--font-md);
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:active {
  background: var(--color-surface);
}

/* Recovery Status */
.recovery-ok {
  color: var(--color-success);
  font-size: var(--font-md);
}

.recovery-warning {
  color: var(--color-warning);
  font-size: var(--font-md);
}

/* Mobile optimizations */
@media (max-width: 400px) {
  .screen-content {
    padding: var(--spacing-sm);
  }

  .workout-card,
  .recovery-card,
  .quick-actions {
    padding: var(--spacing-md);
  }
}
```

**Step 4: Create placeholder component styles**

Create `src/css/components.css`:
```css
/* Component styles will be added as we build UI components */

/* Number Input Overlay (for later) */
.number-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: none;
  align-items: center;
  justify-content: center;
}

.number-overlay.active {
  display: flex;
}
```

**Step 5: Create screen-specific styles**

Create `src/css/screens.css`:
```css
/* Screen-specific styles */

/* Home Screen */
#home-screen .screen-content {
  padding-bottom: var(--spacing-xl);
}

/* Workout Screen */
#workout-screen {
  /* Will be populated as we build workout UI */
}
```

**Step 6: Test HTML loads**

Open `src/index.html` in browser
Expected: Basic layout visible, styled correctly

**Step 7: Commit**

```bash
git add src/index.html src/manifest.json src/css/
git commit -m "feat: add basic HTML structure and PWA setup

- Create PWA manifest with standalone display
- Add home screen with workout selector
- Add in-workout screen structure
- Create base CSS with mobile-first design
- Implement color scheme and spacing system
- Large tap targets (60px minimum)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Remaining Tasks (Summary)

**Task 7: UI Controller (Connect UI to modules)**
- Wire up home screen to workout manager
- Implement workout start flow
- Display next workout and recovery status

**Task 8: In-Workout UI**
- Render exercise list
- Implement set logging form
- Smart defaults (auto-fill from last workout)

**Task 9: Progression UI**
- Color-coded badges (🔵🟢🟡🔴)
- Progress feedback after each set
- Exercise history modal

**Task 10: Service Worker**
- Implement offline caching
- Cache-first strategy

**Task 11: Integration Testing**
- Full workout flow test
- Recovery warning test
- Progression detection test

---

## Notes

- All tasks follow TDD: tests first, then implementation
- Each task is small (2-5 minutes per step)
- Frequent commits after each feature
- Mobile-first design enforced (400-430px width)
- Zero dependencies maintained
- PWA offline-capable from start

