# Weekly Summary Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add analytics tab to Progress screen showing training volume, performance quality, recovery trends, and automatic pattern detection.

**Architecture:** Create AnalyticsCalculator module (read-only pattern) that processes workout history data. Add 4th tab to existing Progress screen with tab-based navigation. Reuse ProgressChart component for visualizations.

**Tech Stack:** Vanilla JavaScript (ES6 modules), Canvas API for charts, localStorage for data persistence, Node.js test runner

---

## Task 1: Create AnalyticsCalculator Module - Volume Calculation

**Files:**
- Create: `js/modules/analytics-calculator.js`
- Test: `tests/unit/analytics-calculator.test.js`

**Step 1: Write failing test for constructor**

Create `tests/unit/analytics-calculator.test.js`:

```javascript
import { strict as assert } from 'assert';
import { test, describe, beforeEach } from 'node:test';
import './setup.js';
import { AnalyticsCalculator } from '../../js/modules/analytics-calculator.js';
import { StorageManager } from '../../js/modules/storage.js';

describe('AnalyticsCalculator', () => {
  let storage;
  let calculator;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageManager();
    calculator = new AnalyticsCalculator(storage);
  });

  describe('Constructor', () => {
    test('should accept storage instance via dependency injection', () => {
      assert.ok(calculator.storage);
      assert.strictEqual(calculator.storage, storage);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/unit/analytics-calculator.test.js`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal module scaffold**

Create `js/modules/analytics-calculator.js`:

```javascript
export class AnalyticsCalculator {
  constructor(storage) {
    this.storage = storage;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/unit/analytics-calculator.test.js`
Expected: PASS (1 test)

**Step 5: Write failing test for calculateVolume with no data**

Add to test file:

```javascript
describe('calculateVolume', () => {
  test('should return zeros when no workout history exists', () => {
    const result = calculator.calculateVolume(7);

    assert.strictEqual(result.total, 0);
    assert.deepStrictEqual(result.byWorkoutType, {});
    assert.strictEqual(result.trend, 0);
    assert.deepStrictEqual(result.daily, []);
  });
});
```

**Step 6: Run test to verify it fails**

Run: `npm test tests/unit/analytics-calculator.test.js`
Expected: FAIL with "calculateVolume is not a function"

**Step 7: Implement calculateVolume method**

Add to `analytics-calculator.js`:

```javascript
calculateVolume(days = 7) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    // Get all exercise keys
    const allKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('build_exercise_'));

    let total = 0;
    const byWorkoutType = {};
    const dailyMap = new Map();

    // Process each exercise
    allKeys.forEach(key => {
      const history = this.storage.getExerciseHistory(key);
      const exerciseKey = key.replace('build_exercise_', '');
      const [workoutType] = exerciseKey.split(' - ');

      history.forEach(entry => {
        if (entry.date >= cutoffStr) {
          // Calculate volume for this entry
          const entryVolume = entry.sets.reduce((sum, set) => {
            return sum + (set.weight * set.reps);
          }, 0);

          total += entryVolume;

          // Track by workout type
          if (!byWorkoutType[workoutType]) {
            byWorkoutType[workoutType] = { volume: 0, sessions: 0 };
          }
          byWorkoutType[workoutType].volume += entryVolume;

          // Track daily volume
          if (!dailyMap.has(entry.date)) {
            dailyMap.set(entry.date, 0);
          }
          dailyMap.set(entry.date, dailyMap.get(entry.date) + entryVolume);
        }
      });
    });

    // Count sessions per workout type
    const rotation = this.storage.getRotation();
    if (rotation && rotation.sequence) {
      rotation.sequence.forEach(entry => {
        if (entry.date >= cutoffStr && entry.completed) {
          const workoutType = entry.workout;
          if (byWorkoutType[workoutType]) {
            byWorkoutType[workoutType].sessions++;
          }
        }
      });
    }

    // Convert daily map to array
    const daily = Array.from(dailyMap.entries())
      .map(([date, volume]) => ({ date, volume }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate trend (compare to previous period)
    const previousPeriodVolume = this.calculatePreviousPeriodVolume(days);
    const trend = previousPeriodVolume === 0
      ? 0
      : ((total - previousPeriodVolume) / previousPeriodVolume) * 100;

    return { total, byWorkoutType, trend, daily };
  } catch (error) {
    console.error('[AnalyticsCalculator] Volume calculation error:', error);
    return { total: 0, byWorkoutType: {}, trend: 0, daily: [] };
  }
}

calculatePreviousPeriodVolume(days) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days * 2));
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - days);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const allKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('build_exercise_'));

    let total = 0;

    allKeys.forEach(key => {
      const history = this.storage.getExerciseHistory(key);
      history.forEach(entry => {
        if (entry.date >= startStr && entry.date < endStr) {
          const entryVolume = entry.sets.reduce((sum, set) => {
            return sum + (set.weight * set.reps);
          }, 0);
          total += entryVolume;
        }
      });
    });

    return total;
  } catch (error) {
    console.error('[AnalyticsCalculator] Previous period calculation error:', error);
    return 0;
  }
}
```

**Step 8: Run test to verify it passes**

Run: `npm test tests/unit/analytics-calculator.test.js`
Expected: PASS (2 tests)

**Step 9: Write test for calculateVolume with data**

Add to test file:

```javascript
test('should calculate total volume from exercise history', () => {
  // Add workout data
  const exercises = ['UPPER_A - DB Bench Press', 'UPPER_A - DB Row'];
  const today = new Date().toISOString().split('T')[0];

  exercises.forEach(exerciseKey => {
    const history = [{
      date: today,
      sets: [
        { weight: 20, reps: 10, rir: 2 }, // 200kg
        { weight: 20, reps: 11, rir: 2 }, // 220kg
        { weight: 20, reps: 12, rir: 3 }  // 240kg
      ]
    }];
    storage.saveExerciseHistory(exerciseKey, history);
  });

  const result = calculator.calculateVolume(7);

  // 2 exercises × 660kg = 1320kg total
  assert.strictEqual(result.total, 1320);
  assert.ok(result.byWorkoutType['UPPER_A']);
  assert.strictEqual(result.byWorkoutType['UPPER_A'].volume, 1320);
  assert.strictEqual(result.daily.length, 1);
  assert.strictEqual(result.daily[0].volume, 1320);
});
```

**Step 10: Run test to verify it passes**

Run: `npm test tests/unit/analytics-calculator.test.js`
Expected: PASS (3 tests)

**Step 11: Commit**

```bash
git add js/modules/analytics-calculator.js tests/unit/analytics-calculator.test.js
git commit -m "feat: add AnalyticsCalculator module with volume calculation"
```

---

## Task 2: Add Performance Metrics Calculation

**Files:**
- Modify: `js/modules/analytics-calculator.js`
- Modify: `tests/unit/analytics-calculator.test.js`

**Step 1: Write failing test for calculatePerformanceMetrics**

Add to test file:

```javascript
describe('calculatePerformanceMetrics', () => {
  test('should return zeros when no workout history exists', () => {
    const result = calculator.calculatePerformanceMetrics(28);

    assert.strictEqual(result.avgRIR, 0);
    assert.deepStrictEqual(result.rirTrend, []);
    assert.strictEqual(result.compliance, 0);
    assert.strictEqual(result.progressedCount, 0);
    assert.deepStrictEqual(result.topProgressors, []);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/unit/analytics-calculator.test.js`
Expected: FAIL with "calculatePerformanceMetrics is not a function"

**Step 3: Implement calculatePerformanceMetrics method**

Add to `analytics-calculator.js`:

```javascript
calculatePerformanceMetrics(days = 28) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    // Get all sets from period
    const allSets = [];
    const workoutDates = new Set();

    const allKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('build_exercise_'));

    allKeys.forEach(key => {
      const history = this.storage.getExerciseHistory(key);
      history.forEach(entry => {
        if (entry.date >= cutoffStr) {
          workoutDates.add(entry.date);
          entry.sets.forEach(set => {
            allSets.push({ ...set, date: entry.date });
          });
        }
      });
    });

    // Calculate average RIR
    const avgRIR = allSets.length > 0
      ? allSets.reduce((sum, set) => sum + set.rir, 0) / allSets.length
      : 0;

    // Calculate RIR trend (7-day rolling average)
    const rirTrend = this.calculateRIRTrend(days);

    // Calculate compliance (3 workouts/week expected)
    const expectedWorkouts = Math.floor(days / 7) * 3;
    const actualWorkouts = workoutDates.size;
    const compliance = expectedWorkouts > 0
      ? (actualWorkouts / expectedWorkouts) * 100
      : 0;

    // Find progressed exercises
    const { progressedCount, topProgressors } = this.findProgressedExercises();

    return { avgRIR, rirTrend, compliance, progressedCount, topProgressors };
  } catch (error) {
    console.error('[AnalyticsCalculator] Performance metrics error:', error);
    return { avgRIR: 0, rirTrend: [], compliance: 0, progressedCount: 0, topProgressors: [] };
  }
}

calculateRIRTrend(days) {
  try {
    const rotation = this.storage.getRotation();
    if (!rotation || !rotation.sequence) return [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    // Get workout dates
    const workoutDates = rotation.sequence
      .filter(entry => entry.completed && entry.date >= cutoffStr)
      .map(entry => entry.date)
      .sort();

    // Calculate RIR for each workout date
    const rirByDate = workoutDates.map(date => {
      const allKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('build_exercise_'));

      let totalRIR = 0;
      let setCount = 0;

      allKeys.forEach(key => {
        const history = this.storage.getExerciseHistory(key);
        const entry = history.find(e => e.date === date);
        if (entry) {
          entry.sets.forEach(set => {
            totalRIR += set.rir;
            setCount++;
          });
        }
      });

      const avgRIR = setCount > 0 ? totalRIR / setCount : 0;
      return { date, rir: avgRIR };
    });

    // Apply 7-day rolling average
    return rirByDate.map((point, i) => {
      const start = Math.max(0, i - 6);
      const window = rirByDate.slice(start, i + 1);
      const rollingAvg = window.reduce((sum, p) => sum + p.rir, 0) / window.length;
      return { date: point.date, rir: rollingAvg };
    });
  } catch (error) {
    console.error('[AnalyticsCalculator] RIR trend error:', error);
    return [];
  }
}

findProgressedExercises() {
  try {
    const allKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('build_exercise_'));

    const progressed = [];

    allKeys.forEach(key => {
      const history = this.storage.getExerciseHistory(key);
      if (history.length < 2) return;

      const recent = history.slice(-2);
      const oldEntry = recent[0];
      const newEntry = recent[1];

      // Check if weight increased
      const oldWeight = oldEntry.sets[0]?.weight || 0;
      const newWeight = newEntry.sets[0]?.weight || 0;

      if (newWeight > oldWeight) {
        const exerciseName = key.replace('build_exercise_', '').split(' - ')[1];
        const gain = newWeight - oldWeight;
        progressed.push({ name: exerciseName, gain });
      }
    });

    // Sort by gain descending
    progressed.sort((a, b) => b.gain - a.gain);

    return {
      progressedCount: progressed.length,
      topProgressors: progressed.slice(0, 5)
    };
  } catch (error) {
    console.error('[AnalyticsCalculator] Exercise progression error:', error);
    return { progressedCount: 0, topProgressors: [] };
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/unit/analytics-calculator.test.js`
Expected: PASS (4 tests)

**Step 5: Write test for performance metrics with data**

Add to test file:

```javascript
test('should calculate compliance rate correctly', () => {
  // Add rotation data
  const rotation = {
    sequence: [
      { workout: 'UPPER_A', date: new Date().toISOString().split('T')[0], completed: true },
      { workout: 'LOWER_A', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true },
      { workout: 'UPPER_B', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true }
    ]
  };
  localStorage.setItem('build_workout_rotation', JSON.stringify(rotation));

  const result = calculator.calculatePerformanceMetrics(7);

  // 3 workouts in 7 days, expected 3 = 100%
  assert.strictEqual(result.compliance, 100);
});
```

**Step 6: Run test to verify it passes**

Run: `npm test tests/unit/analytics-calculator.test.js`
Expected: PASS (5 tests)

**Step 7: Commit**

```bash
git add js/modules/analytics-calculator.js tests/unit/analytics-calculator.test.js
git commit -m "feat: add performance metrics calculation to AnalyticsCalculator"
```

---

## Task 3: Add Recovery Trends Calculation

**Files:**
- Modify: `js/modules/analytics-calculator.js`
- Modify: `tests/unit/analytics-calculator.test.js`

**Step 1: Write failing test for calculateRecoveryTrends**

Add to test file:

```javascript
describe('calculateRecoveryTrends', () => {
  test('should return zeros when no recovery data exists', () => {
    const result = calculator.calculateRecoveryTrends(28);

    assert.strictEqual(result.avgSleep, 0);
    assert.strictEqual(result.avgFatigue, 0);
    assert.strictEqual(result.highFatigueDays, 0);
    assert.deepStrictEqual(result.weeklyTrend, []);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/unit/analytics-calculator.test.js`
Expected: FAIL with "calculateRecoveryTrends is not a function"

**Step 3: Implement calculateRecoveryTrends method**

Add to `analytics-calculator.js`:

```javascript
calculateRecoveryTrends(days = 28) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    // Get recovery metrics from localStorage
    const metricsData = localStorage.getItem('build_recovery_metrics');
    if (!metricsData) {
      return { avgSleep: 0, avgFatigue: 0, highFatigueDays: 0, weeklyTrend: [] };
    }

    const allMetrics = JSON.parse(metricsData);
    const recentMetrics = allMetrics.filter(m => m.date >= cutoffStr);

    if (recentMetrics.length === 0) {
      return { avgSleep: 0, avgFatigue: 0, highFatigueDays: 0, weeklyTrend: [] };
    }

    // Calculate averages
    const avgSleep = recentMetrics.reduce((sum, m) => sum + (m.sleep || 0), 0) / recentMetrics.length;
    const avgFatigue = recentMetrics.reduce((sum, m) => sum + (m.fatigueScore || 0), 0) / recentMetrics.length;

    // Count high fatigue days (≥4 points)
    const highFatigueDays = recentMetrics.filter(m => (m.fatigueScore || 0) >= 4).length;

    // Calculate weekly trend (4 weeks)
    const weeklyTrend = this.calculateWeeklyRecoveryTrend(recentMetrics);

    return { avgSleep, avgFatigue, highFatigueDays, weeklyTrend };
  } catch (error) {
    console.error('[AnalyticsCalculator] Recovery trends error:', error);
    return { avgSleep: 0, avgFatigue: 0, highFatigueDays: 0, weeklyTrend: [] };
  }
}

calculateWeeklyRecoveryTrend(metrics) {
  try {
    // Group by week
    const weekMap = new Map();

    metrics.forEach(m => {
      const date = new Date(m.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Sunday
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { sleep: [], fatigue: [] });
      }

      weekMap.get(weekKey).sleep.push(m.sleep || 0);
      weekMap.get(weekKey).fatigue.push(m.fatigueScore || 0);
    });

    // Calculate weekly averages
    const trend = Array.from(weekMap.entries())
      .map(([week, data]) => ({
        week,
        avgSleep: data.sleep.reduce((a, b) => a + b, 0) / data.sleep.length,
        avgFatigue: data.fatigue.reduce((a, b) => a + b, 0) / data.fatigue.length
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    return trend;
  } catch (error) {
    console.error('[AnalyticsCalculator] Weekly trend error:', error);
    return [];
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/unit/analytics-calculator.test.js`
Expected: PASS (6 tests)

**Step 5: Write test for recovery trends with data**

Add to test file:

```javascript
test('should calculate recovery averages from metrics data', () => {
  // Add recovery metrics
  const metrics = [
    { date: new Date().toISOString().split('T')[0], sleep: 7, fatigueScore: 2 },
    { date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], sleep: 8, fatigueScore: 1 },
    { date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0], sleep: 6, fatigueScore: 5 }
  ];
  localStorage.setItem('build_recovery_metrics', JSON.stringify(metrics));

  const result = calculator.calculateRecoveryTrends(7);

  assert.strictEqual(result.avgSleep, 7); // (7+8+6)/3
  assert.strictEqual(Math.round(result.avgFatigue * 10) / 10, 2.7); // (2+1+5)/3
  assert.strictEqual(result.highFatigueDays, 1); // Only 5 ≥ 4
});
```

**Step 6: Run test to verify it passes**

Run: `npm test tests/unit/analytics-calculator.test.js`
Expected: PASS (7 tests)

**Step 7: Commit**

```bash
git add js/modules/analytics-calculator.js tests/unit/analytics-calculator.test.js
git commit -m "feat: add recovery trends calculation to AnalyticsCalculator"
```

---

## Task 4: Add Pattern Detection Logic

**Files:**
- Modify: `js/modules/analytics-calculator.js`
- Modify: `tests/unit/analytics-calculator.test.js`

**Step 1: Write failing test for detectPatterns**

Add to test file:

```javascript
describe('detectPatterns', () => {
  test('should return insufficient data message when <10 workouts', () => {
    const result = calculator.detectPatterns();

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].type, 'insufficient-data');
    assert.ok(result[0].message.includes('Not enough data'));
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/unit/analytics-calculator.test.js`
Expected: FAIL with "detectPatterns is not a function"

**Step 3: Implement detectPatterns method**

Add to `analytics-calculator.js`:

```javascript
detectPatterns() {
  try {
    const patterns = [];

    // Get all workout dates
    const rotation = this.storage.getRotation();
    if (!rotation || !rotation.sequence) {
      return [{ type: 'insufficient-data', confidence: 0, message: 'Not enough data yet (0/10 workouts)' }];
    }

    const completedWorkouts = rotation.sequence.filter(w => w.completed);
    if (completedWorkouts.length < 10) {
      return [{ type: 'insufficient-data', confidence: 0, message: `Not enough data yet (${completedWorkouts.length}/10 workouts)` }];
    }

    // Pattern 1: Sleep vs Progression
    const sleepPattern = this.detectSleepProgressionPattern();
    if (sleepPattern) patterns.push(sleepPattern);

    // Pattern 2: Volume vs Pain
    const volumePainPattern = this.detectVolumePainPattern();
    if (volumePainPattern) patterns.push(volumePainPattern);

    // Sort by confidence
    return patterns.sort((a, b) => b.confidence - a.confidence);
  } catch (error) {
    console.error('[AnalyticsCalculator] Pattern detection error:', error);
    return [];
  }
}

detectSleepProgressionPattern() {
  try {
    const metricsData = localStorage.getItem('build_recovery_metrics');
    if (!metricsData) return null;

    const allMetrics = JSON.parse(metricsData);
    const rotation = this.storage.getRotation();
    if (!rotation || !rotation.sequence) return null;

    // Map workouts to sleep data
    const workoutSleepData = rotation.sequence
      .filter(w => w.completed)
      .map(w => {
        const metrics = allMetrics.find(m => m.date === w.date);
        const progressed = this.didProgressOnDate(w.date);
        return {
          date: w.date,
          sleep: metrics?.sleep || 0,
          progressed
        };
      })
      .filter(d => d.sleep > 0); // Only include days with sleep data

    if (workoutSleepData.length < 10) return null;

    // Split by sleep quality
    const highSleep = workoutSleepData.filter(d => d.sleep >= 7);
    const lowSleep = workoutSleepData.filter(d => d.sleep < 6);

    if (highSleep.length < 5 || lowSleep.length < 5) return null;

    // Calculate progression rates
    const highSleepProgressRate = highSleep.filter(d => d.progressed).length / highSleep.length;
    const lowSleepProgressRate = lowSleep.filter(d => d.progressed).length / lowSleep.length;

    // Check for significant difference (1.5x threshold)
    if (highSleepProgressRate > lowSleepProgressRate * 1.5) {
      const confidence = this.calculateConfidence(highSleep.length, lowSleep.length);
      const multiplier = (highSleepProgressRate / Math.max(lowSleepProgressRate, 0.01)).toFixed(1);

      return {
        type: 'sleep-progression',
        confidence,
        message: `When sleep ≥7hrs, you progress ${multiplier}× faster than when sleep <6hrs`
      };
    }

    return null;
  } catch (error) {
    console.error('[AnalyticsCalculator] Sleep pattern error:', error);
    return null;
  }
}

detectVolumePainPattern() {
  try {
    // Get all pain reports
    const painKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('build_pain_'));

    if (painKeys.length === 0) return null;

    // Analyze volume when pain occurred
    const painDates = new Set();
    painKeys.forEach(key => {
      const painData = JSON.parse(localStorage.getItem(key) || '[]');
      painData.forEach(p => {
        if (p.severity && p.severity !== 'none') {
          painDates.add(p.date);
        }
      });
    });

    if (painDates.size < 3) return null;

    // Calculate average volume on pain days vs pain-free days
    const rotation = this.storage.getRotation();
    if (!rotation || !rotation.sequence) return null;

    const volumeOnPainDays = [];
    const volumeOnNormalDays = [];

    rotation.sequence.filter(w => w.completed).forEach(w => {
      const volume = this.getVolumeForDate(w.date);
      if (painDates.has(w.date)) {
        volumeOnPainDays.push(volume);
      } else {
        volumeOnNormalDays.push(volume);
      }
    });

    if (volumeOnPainDays.length < 3 || volumeOnNormalDays.length < 5) return null;

    const avgPainVolume = volumeOnPainDays.reduce((a, b) => a + b, 0) / volumeOnPainDays.length;
    const avgNormalVolume = volumeOnNormalDays.reduce((a, b) => a + b, 0) / volumeOnNormalDays.length;

    // Check if pain days have significantly higher volume (20% threshold)
    if (avgPainVolume > avgNormalVolume * 1.2) {
      const confidence = this.calculateConfidence(volumeOnPainDays.length, volumeOnNormalDays.length);
      const threshold = Math.round(avgPainVolume / 100) * 100; // Round to nearest 100

      return {
        type: 'volume-pain',
        confidence,
        message: `Pain appears when weekly volume exceeds ${threshold}kg`
      };
    }

    return null;
  } catch (error) {
    console.error('[AnalyticsCalculator] Volume-pain pattern error:', error);
    return null;
  }
}

didProgressOnDate(date) {
  try {
    const allKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('build_exercise_'));

    let progressed = false;

    allKeys.forEach(key => {
      const history = this.storage.getExerciseHistory(key);
      const entryIndex = history.findIndex(e => e.date === date);
      if (entryIndex > 0) {
        const currentEntry = history[entryIndex];
        const previousEntry = history[entryIndex - 1];

        const currentWeight = currentEntry.sets[0]?.weight || 0;
        const previousWeight = previousEntry.sets[0]?.weight || 0;

        if (currentWeight > previousWeight) {
          progressed = true;
        }
      }
    });

    return progressed;
  } catch (error) {
    console.error('[AnalyticsCalculator] Progression check error:', error);
    return false;
  }
}

getVolumeForDate(date) {
  try {
    const allKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('build_exercise_'));

    let totalVolume = 0;

    allKeys.forEach(key => {
      const history = this.storage.getExerciseHistory(key);
      const entry = history.find(e => e.date === date);
      if (entry) {
        const volume = entry.sets.reduce((sum, set) => {
          return sum + (set.weight * set.reps);
        }, 0);
        totalVolume += volume;
      }
    });

    return totalVolume;
  } catch (error) {
    console.error('[AnalyticsCalculator] Volume for date error:', error);
    return 0;
  }
}

calculateConfidence(sampleSize1, sampleSize2) {
  // Confidence based on sample sizes
  const totalSamples = sampleSize1 + sampleSize2;
  if (totalSamples >= 30) return 85;
  if (totalSamples >= 20) return 75;
  if (totalSamples >= 15) return 65;
  return 55;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test tests/unit/analytics-calculator.test.js`
Expected: PASS (8 tests)

**Step 5: Write test for pattern detection with sufficient data**

Add to test file:

```javascript
test('should detect sleep-progression pattern with sufficient data', () => {
  // Create 12 workouts with sleep data
  const rotation = { sequence: [] };
  const metrics = [];

  for (let i = 0; i < 12; i++) {
    const date = new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    rotation.sequence.push({ workout: 'UPPER_A', date, completed: true });

    // Alternate high/low sleep
    const sleep = i % 2 === 0 ? 8 : 5;
    metrics.push({ date, sleep, fatigueScore: 2 });

    // Add exercise history with progression on high sleep days
    const exerciseKey = 'UPPER_A - DB Bench Press';
    const weight = i % 2 === 0 ? 20 + i : 20; // Progress on high sleep days
    const history = [{ date, sets: [{ weight, reps: 10, rir: 2 }] }];
    storage.saveExerciseHistory(exerciseKey, history);
  }

  localStorage.setItem('build_workout_rotation', JSON.stringify(rotation));
  localStorage.setItem('build_recovery_metrics', JSON.stringify(metrics));

  const result = calculator.detectPatterns();

  assert.ok(result.length > 0);
  assert.notStrictEqual(result[0].type, 'insufficient-data');
});
```

**Step 6: Run test to verify it passes**

Run: `npm test tests/unit/analytics-calculator.test.js`
Expected: PASS (9 tests)

**Step 7: Commit**

```bash
git add js/modules/analytics-calculator.js tests/unit/analytics-calculator.test.js
git commit -m "feat: add pattern detection to AnalyticsCalculator"
```

---

## Task 5: Add Analytics Tab to Progress Screen HTML

**Files:**
- Modify: `index.html`

**Step 1: Find progress screen section**

Run: `grep -n "progress-screen" index.html | head -5`
Expected: Line numbers for progress screen

**Step 2: Add analytics tab button**

In `index.html`, find the progress screen section and add analytics tab:

```html
<!-- Inside progress-screen section, after existing tabs -->
<div class="progress-tabs">
  <button class="tab-btn active" data-tab="overview">Overview</button>
  <button class="tab-btn" data-tab="body-weight">Body Weight</button>
  <button class="tab-btn" data-tab="barbell">Barbell</button>
  <button class="tab-btn" data-tab="analytics">Analytics</button>
</div>
```

**Step 3: Add analytics tab content container**

After tab buttons, add:

```html
<div class="tab-content analytics-tab" id="analytics-tab" style="display: none;">
  <div id="analytics-content">
    <!-- Analytics will be rendered here -->
  </div>
</div>
```

**Step 4: Verify HTML structure**

Run: `grep -A 5 "analytics-tab" index.html`
Expected: Show new analytics tab HTML

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add analytics tab to progress screen HTML"
```

---

## Task 6: Add Tab Navigation Logic to Progress Screen

**Files:**
- Modify: `js/app.js`

**Step 1: Find showProgressDashboard method**

Run: `grep -n "showProgressDashboard" js/app.js`
Expected: Line number of method

**Step 2: Add tab switching logic**

In `js/app.js`, modify `showProgressDashboard` method to add tab listeners:

```javascript
// After existing dashboard rendering code
this.setupProgressTabs();
```

**Step 3: Add setupProgressTabs method**

Add new method to App class:

```javascript
setupProgressTabs() {
  const tabBtns = document.querySelectorAll('.progress-tabs .tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;

      // Update active button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show correct content
      tabContents.forEach(content => {
        content.style.display = 'none';
      });

      if (tab === 'analytics') {
        this.showAnalyticsTab();
      } else if (tab === 'overview') {
        document.querySelector('.overview-tab')?.style.display = 'block';
      } else if (tab === 'body-weight') {
        document.querySelector('.body-weight-tab')?.style.display = 'block';
      } else if (tab === 'barbell') {
        document.querySelector('.barbell-tab')?.style.display = 'block';
      }
    });
  });
}
```

**Step 4: Add showAnalyticsTab stub**

Add method to App class:

```javascript
showAnalyticsTab() {
  const analyticsTab = document.getElementById('analytics-tab');
  if (analyticsTab) {
    analyticsTab.style.display = 'block';
  }

  const analyticsContent = document.getElementById('analytics-content');
  if (!analyticsContent) return;

  // TODO: Render analytics (Task 7)
  analyticsContent.innerHTML = '<p>Analytics coming soon...</p>';
}
```

**Step 5: Test tab switching manually**

Run: Open index.html in browser, navigate to Progress screen, click tabs
Expected: Tabs switch correctly

**Step 6: Commit**

```bash
git add js/app.js
git commit -m "feat: add tab navigation logic to progress screen"
```

---

## Task 7: Render Analytics Dashboard Content

**Files:**
- Modify: `js/app.js`

**Step 1: Initialize AnalyticsCalculator in App constructor**

In `js/app.js` constructor, add after other managers:

```javascript
import { AnalyticsCalculator } from './modules/analytics-calculator.js';

// In constructor
this.analyticsCalculator = new AnalyticsCalculator(this.storage);
```

**Step 2: Implement showAnalyticsTab rendering**

Replace the stub `showAnalyticsTab` method:

```javascript
showAnalyticsTab() {
  const analyticsTab = document.getElementById('analytics-tab');
  if (analyticsTab) {
    analyticsTab.style.display = 'block';
  }

  const analyticsContent = document.getElementById('analytics-content');
  if (!analyticsContent) return;

  // Check for minimum data requirement
  const rotation = this.storage.getRotation();
  const workoutCount = rotation?.sequence?.filter(w => w.completed).length || 0;

  if (workoutCount < 4) {
    analyticsContent.innerHTML = `
      <div class="empty-state">
        <h3>📊 Analytics</h3>
        <p>Complete 4+ workouts to unlock analytics and pattern detection.</p>
        <p><strong>Current progress:</strong> ${workoutCount}/4 workouts</p>
      </div>
    `;
    return;
  }

  // Calculate analytics
  const volume = this.analyticsCalculator.calculateVolume(7);
  const performance = this.analyticsCalculator.calculatePerformanceMetrics(28);
  const recovery = this.analyticsCalculator.calculateRecoveryTrends(28);
  const patterns = this.analyticsCalculator.detectPatterns();

  // Render sections
  analyticsContent.innerHTML = `
    ${this.renderVolumeSection(volume)}
    ${this.renderPerformanceSection(performance)}
    ${this.renderRecoverySection(recovery)}
    ${this.renderPatternsSection(patterns)}
  `;
}
```

**Step 3: Add renderVolumeSection method**

```javascript
renderVolumeSection(volume) {
  const trendIcon = volume.trend > 10 ? '↑' :
                    volume.trend < -10 ? '↓' : '↔';
  const trendClass = volume.trend > 10 ? 'trend-up' :
                     volume.trend < -10 ? 'trend-down' : 'trend-stable';

  const workoutTypeRows = Object.entries(volume.byWorkoutType)
    .map(([type, data]) => `
      <div class="volume-row">
        <span>${this.escapeHtml(type)}:</span>
        <span>${data.volume.toLocaleString()} kg (${data.sessions} sessions)</span>
      </div>
    `).join('');

  return `
    <div class="analytics-section">
      <h3>📊 Training Volume (Last 7 Days)</h3>
      <div class="analytics-card">
        <div class="metric-primary">
          <span class="metric-label">Total:</span>
          <span class="metric-value">${volume.total.toLocaleString()} kg</span>
          <span class="metric-trend ${trendClass}">
            ${trendIcon} ${Math.abs(volume.trend).toFixed(0)}% vs last week
          </span>
        </div>
        ${workoutTypeRows.length > 0 ? `
          <div class="volume-breakdown">
            <strong>By Workout Type:</strong>
            ${workoutTypeRows}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
```

**Step 4: Add renderPerformanceSection method**

```javascript
renderPerformanceSection(performance) {
  const rirTrend = performance.avgRIR > 2.5 ? '(easier)' :
                   performance.avgRIR < 2 ? '(harder)' : '(stable)';

  const topProgressorsList = performance.topProgressors
    .map(p => `<li>${this.escapeHtml(p.name)} (+${p.gain}kg)</li>`)
    .join('');

  return `
    <div class="analytics-section">
      <h3>🎯 Performance Quality (4 Weeks)</h3>
      <div class="analytics-card">
        <div class="metrics-grid">
          <div class="metric">
            <span class="metric-label">Avg RIR:</span>
            <span class="metric-value">${performance.avgRIR.toFixed(1)} ${rirTrend}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Compliance:</span>
            <span class="metric-value">${performance.compliance.toFixed(0)}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">Exercises Progressed:</span>
            <span class="metric-value">${performance.progressedCount}</span>
          </div>
        </div>
        ${performance.topProgressors.length > 0 ? `
          <div class="top-progressors">
            <strong>Top Progressors:</strong>
            <ul>${topProgressorsList}</ul>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
```

**Step 5: Add renderRecoverySection method**

```javascript
renderRecoverySection(recovery) {
  if (recovery.avgSleep === 0 && recovery.avgFatigue === 0) {
    return `
      <div class="analytics-section">
        <h3>💤 Recovery Trends (4 Weeks)</h3>
        <div class="analytics-card">
          <p class="empty-state-text">No recovery data available. Start tracking sleep and fatigue before workouts.</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="analytics-section">
      <h3>💤 Recovery Trends (4 Weeks)</h3>
      <div class="analytics-card">
        <div class="metrics-grid">
          <div class="metric">
            <span class="metric-label">Avg Sleep:</span>
            <span class="metric-value">${recovery.avgSleep.toFixed(1)} hrs</span>
          </div>
          <div class="metric">
            <span class="metric-label">Avg Fatigue:</span>
            <span class="metric-value">${recovery.avgFatigue.toFixed(1)}/9</span>
          </div>
          <div class="metric">
            <span class="metric-label">High Fatigue Days:</span>
            <span class="metric-value">${recovery.highFatigueDays} (≥4 points)</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
```

**Step 6: Add renderPatternsSection method**

```javascript
renderPatternsSection(patterns) {
  if (patterns.length === 0) {
    return `
      <div class="analytics-section">
        <h3>🔍 Discovered Patterns</h3>
        <div class="analytics-card">
          <p class="empty-state-text">Not enough data to detect patterns yet. Keep training!</p>
        </div>
      </div>
    `;
  }

  if (patterns[0].type === 'insufficient-data') {
    return `
      <div class="analytics-section">
        <h3>🔍 Discovered Patterns</h3>
        <div class="analytics-card">
          <p class="empty-state-text">${this.escapeHtml(patterns[0].message)}</p>
        </div>
      </div>
    `;
  }

  const patternCards = patterns.map(pattern => {
    const confidenceIcon = pattern.confidence >= 80 ? '🟢' :
                          pattern.confidence >= 60 ? '🟡' : '🔵';
    const confidenceLabel = pattern.confidence >= 80 ? 'Strong' :
                           pattern.confidence >= 60 ? 'Moderate' : 'Weak';

    return `
      <div class="pattern-card">
        <div class="pattern-header">
          ${confidenceIcon} <strong>${confidenceLabel} pattern</strong>
          <span class="confidence-score">(confidence: ${pattern.confidence}%)</span>
        </div>
        <p class="pattern-message">${this.escapeHtml(pattern.message)}</p>
      </div>
    `;
  }).join('');

  return `
    <div class="analytics-section">
      <h3>🔍 Discovered Patterns</h3>
      <div class="analytics-card">
        ${patternCards}
      </div>
    </div>
  `;
}
```

**Step 7: Test analytics rendering manually**

Run: Open app, complete 4+ workouts, navigate to Progress > Analytics
Expected: All 4 sections render with data

**Step 8: Commit**

```bash
git add js/app.js
git commit -m "feat: render analytics dashboard content with 4 sections"
```

---

## Task 8: Add Analytics CSS Styling

**Files:**
- Create: `css/analytics.css`

**Step 1: Create analytics CSS file**

Create `css/analytics.css`:

```css
/* Analytics Tab Styles */

.analytics-tab {
  padding: var(--spacing-lg);
}

.analytics-section {
  margin-bottom: var(--spacing-xl);
}

.analytics-section h3 {
  font-size: 20px;
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
}

.analytics-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

/* Metrics display */
.metric-primary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.metric-label {
  font-size: var(--font-sm);
  color: var(--color-text-dim);
  font-weight: 600;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
}

.metric-trend {
  font-size: var(--font-sm);
  font-weight: 600;
}

.trend-up {
  color: #10b981; /* Green */
}

.trend-down {
  color: #ef4444; /* Red */
}

.trend-stable {
  color: var(--color-text-dim);
}

/* Metrics grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.metric {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.metric .metric-value {
  font-size: 24px;
}

/* Volume breakdown */
.volume-breakdown {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.volume-row {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
  font-size: var(--font-sm);
}

/* Top progressors list */
.top-progressors {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.top-progressors ul {
  margin: var(--spacing-xs) 0;
  padding-left: var(--spacing-lg);
}

.top-progressors li {
  margin: var(--spacing-xs) 0;
  font-size: var(--font-sm);
}

/* Pattern cards */
.pattern-card {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.pattern-card:last-child {
  margin-bottom: 0;
}

.pattern-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-sm);
}

.confidence-score {
  color: var(--color-text-dim);
  font-weight: normal;
}

.pattern-message {
  margin: 0;
  font-size: var(--font-sm);
  line-height: 1.5;
}

/* Progress tabs styling */
.progress-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

.tab-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  min-height: 44px;
  font-size: var(--font-sm);
  font-weight: 600;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-secondary);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: var(--color-bg-tertiary);
}

.tab-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Mobile responsive */
@media (max-width: 480px) {
  .progress-tabs {
    grid-template-columns: repeat(2, 1fr);
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .metric-value {
    font-size: 24px;
  }
}

/* Empty state */
.empty-state-text {
  text-align: center;
  color: var(--color-text-dim);
  font-size: var(--font-sm);
  padding: var(--spacing-lg);
}
```

**Step 2: Link CSS in index.html**

In `index.html` `<head>`, add:

```html
<link rel="stylesheet" href="css/analytics.css">
```

**Step 3: Test styling manually**

Run: Open app, navigate to Analytics tab
Expected: Styled sections with proper spacing and colors

**Step 4: Commit**

```bash
git add css/analytics.css index.html
git commit -m "feat: add analytics dashboard CSS styling"
```

---

## Task 9: Update Service Worker Cache

**Files:**
- Modify: `service-worker.js`

**Step 1: Find CACHE_NAME**

Run: `grep -n "CACHE_NAME" service-worker.js`
Expected: Current cache version

**Step 2: Bump cache version**

Change `CACHE_NAME` from current version to next version:

```javascript
const CACHE_NAME = 'build-tracker-v11'; // Increment from v10
```

**Step 3: Add analytics.css to cache list**

In `urlsToCache` array, add:

```javascript
'css/analytics.css',
'js/modules/analytics-calculator.js'
```

**Step 4: Test cache update**

Run: Open app in browser, check Application > Service Workers
Expected: New cache version created

**Step 5: Commit**

```bash
git add service-worker.js
git commit -m "chore: update service worker cache for analytics"
```

---

## Task 10: Create Integration Test Document

**Files:**
- Create: `docs/testing/weekly-summary-dashboard-integration-test.md`

**Step 1: Create test document**

Create `docs/testing/weekly-summary-dashboard-integration-test.md`:

```markdown
# Weekly Summary Dashboard - Integration Test Checklist

**Feature:** Analytics tab with training volume, performance quality, recovery trends, and pattern detection

**Version:** 1.5.0

---

## Test Scenario 1: Empty State (New User)

**Setup:**
1. Clear all localStorage
2. Open app

**Steps:**
1. Navigate to Progress screen
2. Click Analytics tab

**Expected:**
- ✅ Shows "Complete 4+ workouts to unlock analytics"
- ✅ Shows current progress: 0/4 workouts
- ✅ No analytics sections visible

---

## Test Scenario 2: Insufficient Data (3 Workouts)

**Setup:**
1. Complete 3 workouts
2. Navigate to Analytics tab

**Expected:**
- ✅ Shows "Complete 4+ workouts" message
- ✅ Shows current progress: 3/4 workouts

---

## Test Scenario 3: Volume Section Display

**Setup:**
1. Complete 6 workouts over 10 days
2. Navigate to Analytics tab

**Steps:**
1. View Training Volume section

**Expected:**
- ✅ Shows total volume in kg
- ✅ Shows trend vs previous week (↑/↓/↔)
- ✅ Shows breakdown by workout type (Upper A/B, Lower A/B)
- ✅ Shows session count per workout type

---

## Test Scenario 4: Performance Quality Display

**Setup:**
1. Complete 12 workouts over 28 days
2. Navigate to Analytics tab

**Steps:**
1. View Performance Quality section

**Expected:**
- ✅ Shows average RIR with trend indicator
- ✅ Shows compliance percentage
- ✅ Shows number of exercises progressed
- ✅ Shows top 3-5 progressing exercises with gains

---

## Test Scenario 5: Recovery Trends (No Data)

**Setup:**
1. Complete workouts without recovery tracking
2. Navigate to Analytics tab

**Steps:**
1. View Recovery Trends section

**Expected:**
- ✅ Shows "No recovery data available" message
- ✅ Prompts to start tracking sleep and fatigue

---

## Test Scenario 6: Recovery Trends (With Data)

**Setup:**
1. Complete workouts with recovery metrics
2. Navigate to Analytics tab

**Steps:**
1. View Recovery Trends section

**Expected:**
- ✅ Shows average sleep in hours
- ✅ Shows average fatigue score
- ✅ Shows high fatigue days count (≥4 points)

---

## Test Scenario 7: Pattern Detection (Insufficient Data)

**Setup:**
1. Complete 8 workouts (below 10 threshold)
2. Navigate to Analytics tab

**Steps:**
1. View Discovered Patterns section

**Expected:**
- ✅ Shows "Not enough data yet (8/10 workouts)"

---

## Test Scenario 8: Pattern Detection (Sleep-Progression)

**Setup:**
1. Complete 12+ workouts
2. Track sleep for all workouts
3. Progress more on high sleep days (≥7hrs)

**Steps:**
1. View Discovered Patterns section

**Expected:**
- ✅ Shows pattern card with confidence level
- ✅ Shows message: "When sleep ≥7hrs, you progress X× faster than when sleep <6hrs"
- ✅ Confidence score displayed (55-85%)

---

## Test Scenario 9: Tab Navigation

**Setup:**
1. Navigate to Progress screen

**Steps:**
1. Click Overview tab
2. Click Body Weight tab
3. Click Barbell tab
4. Click Analytics tab

**Expected:**
- ✅ Tab buttons highlight correctly
- ✅ Tab content switches instantly
- ✅ No layout shifts or flashing
- ✅ Analytics recalculates on tab switch

---

## Test Scenario 10: Mobile Responsive

**Setup:**
1. Open app on mobile device (or DevTools mobile view)
2. Navigate to Analytics tab

**Expected:**
- ✅ Tabs stack in 2×2 grid on mobile
- ✅ Metrics grid stacks vertically
- ✅ All text readable (no truncation)
- ✅ Touch targets ≥44px

---

## Performance Tests

**Test 11: Calculation Speed**
1. Add 90 days of workout data (27+ workouts)
2. Switch to Analytics tab
3. Measure time to render

**Expected:**
- ✅ Renders in <100ms
- ✅ No console errors
- ✅ No UI freezing

**Test 12: Error Handling**
1. Corrupt localStorage data (invalid JSON)
2. Navigate to Analytics tab

**Expected:**
- ✅ Shows empty state gracefully
- ✅ Console error logged but no crash
- ✅ User can navigate away

---

## Test Results

**Date Tested:** _________

**Tester:** _________

**Scenarios Passed:** ____ / 12

**Issues Found:**

---

**Notes:**
- All tests assume PWA is installed and offline-capable
- Recovery data requires Enhanced Tracking Metrics feature
- Pattern detection requires 10+ completed workouts
```

**Step 2: Commit**

```bash
git add docs/testing/weekly-summary-dashboard-integration-test.md
git commit -m "docs: add integration test checklist for analytics dashboard"
```

---

## Task 11: Update IMPLEMENTATION-STATUS.md

**Files:**
- Modify: `docs/IMPLEMENTATION-STATUS.md`

**Step 1: Mark Weekly Summary Dashboard as complete**

Update the "Weekly Summary Dashboard" section:

```markdown
### Weekly Summary Dashboard (100% Complete) 🎉 NEW
**Source:** `docs/plans/2026-02-09-weekly-summary-dashboard-design.md`

- ✅ **AnalyticsCalculator Module** - Training volume, RIR trends, compliance, progression tracking
- ✅ **Volume Section** - 7-day total with trend vs previous week, workout type breakdown
- ✅ **Performance Section** - Average RIR, compliance rate, exercises progressed, top progressors
- ✅ **Recovery Section** - Sleep/fatigue averages, high fatigue days, weekly trends
- ✅ **Pattern Detection** - Sleep-progression and volume-pain correlations with confidence scores
- ✅ **Analytics Tab** - 4th tab in Progress screen with tab navigation
- ✅ **CSS Styling** - Mobile responsive, touch-friendly, empty states
- ✅ **Service Worker Update** - Cache bump to v11
- ✅ **Integration Tests** - 12 test scenarios documented

**Features:**
- Training volume calculation with daily/weekly granularity
- Performance quality metrics with 7-day rolling RIR average
- Recovery trend analysis from sleep/fatigue data
- Automatic pattern detection (requires 10+ workouts)
- Always-available rolling insights (7-day and 4-week windows)
- Mobile-optimized with 44px touch targets
- Read-only module pattern (no state mutations)

**Status:** Production-ready, ready for manual testing
```

**Step 2: Update overall statistics**

```markdown
### Overall Progress:
- **Total Features Designed:** 80
- **Features Implemented:** 80
- **Features Remaining:** 0
- **Completion:** 100% ✅
```

**Step 3: Update feature category table**

```markdown
| **Weekly Dashboard** | **6** | **6** | **100% ✅** |
```

**Step 4: Commit**

```bash
git add docs/IMPLEMENTATION-STATUS.md
git commit -m "docs: mark weekly summary dashboard as complete (100%)"
```

---

## Task 12: Update README and CHANGELOG

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`

**Step 1: Update README.md**

Add to features section:

```markdown
### 📊 Analytics Dashboard

**Always-Available Insights:**
- **Training Volume** - 7-day total with trend comparison
- **Performance Quality** - RIR trends, compliance, progression tracking
- **Recovery Trends** - Sleep/fatigue analysis with weekly charts
- **Pattern Detection** - Automatic correlation discovery (sleep vs progression, volume vs pain)

Access via Progress screen > Analytics tab
```

**Step 2: Update CHANGELOG.md**

Add new version entry:

```markdown
## [1.5.0] - 2026-02-09

### Added
- Analytics dashboard with 4 insight sections
- Training volume calculation (7-day rolling with trend)
- Performance quality metrics (RIR trends, compliance, progression)
- Recovery trends visualization (sleep/fatigue averages)
- Automatic pattern detection (sleep-progression, volume-pain correlations)
- Tab-based navigation in Progress screen (Overview, Body Weight, Barbell, Analytics)
- Minimum 10 workouts required for pattern detection
- Empty states for new users and insufficient data
- Mobile-responsive analytics with 44px touch targets

### Changed
- Progress screen now has 4 tabs instead of single scrolling view
- Service worker cache updated to v11

### Technical
- New AnalyticsCalculator module with read-only pattern
- 9 new unit tests for analytics calculations (137 total tests)
- Pattern detection with confidence scoring (55-85% range)
- 12 integration test scenarios documented
```

**Step 3: Update version number in package.json**

```json
{
  "version": "1.5.0"
}
```

**Step 4: Commit**

```bash
git add README.md CHANGELOG.md package.json
git commit -m "docs: update README and CHANGELOG for v1.5.0 analytics release"
```

---

## Final Verification

**Run all tests:**
```bash
npm test
```

**Expected:** 137 tests passing (128 previous + 9 new)

**Manual test:**
1. Open app in browser
2. Complete 4+ workouts with recovery tracking
3. Navigate to Progress > Analytics
4. Verify all 4 sections render correctly
5. Test pattern detection with 10+ workouts

**Success criteria:**
- ✅ All unit tests pass
- ✅ Analytics tab renders without errors
- ✅ Volume section shows accurate totals
- ✅ Performance metrics calculate correctly
- ✅ Recovery trends display (if data exists)
- ✅ Pattern detection works (if ≥10 workouts)
- ✅ Mobile responsive (320px+ width)
- ✅ Tab navigation smooth and instant

---

**Plan complete and saved to `docs/plans/2026-02-09-weekly-summary-dashboard-implementation-plan.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
