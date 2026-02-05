# Performance Analyzer Usage Guide

## Overview

The Performance Analyzer automatically detects form breakdown and overtraining patterns using objective performance data. It runs during workouts and displays real-time badges when issues are detected.

## How It Works

**Conservative Detection:**
- Requires 2+ previous workouts before flagging regression
- Uses high thresholds (25% rep drops, 50% intra-set variance)
- Skips analysis during deload weeks
- Never modifies localStorage (read-only)

**Red Alerts (Regression):**
- Weight decreased compared to 2 sessions ago
- Average reps dropped 25%+ compared to 2 sessions ago
- Message: "Weight regressed - check recovery" or "Rep performance dropped"

**Yellow Warnings (Form Breakdown):**
- Reps vary 50%+ within same session (e.g., 12/12/6)
- All sets logged at RIR 0-1 (training too close to failure)
- Message: "Reps inconsistent" or "Training too close to failure"

## Integration Example

```javascript
import { PerformanceAnalyzer } from './modules/performance-analyzer.js';

// Initialize in App constructor
this.performanceAnalyzer = new PerformanceAnalyzer(this.storage);

// During workout rendering
const analysis = this.performanceAnalyzer.analyzeExercisePerformance(
  exerciseKey,
  currentSets
);

if (analysis.status !== 'good') {
  // Display badge with analysis.message
}
```

## Testing Checklist

- [ ] No badges appear on first workout (insufficient data)
- [ ] Red badge appears when weight decreases
- [ ] Red badge appears when reps drop 25%+
- [ ] Yellow badge appears when reps vary 50%+ (e.g., 12/12/6)
- [ ] Yellow badge appears when all sets RIR 0-1
- [ ] No badges during deload week
- [ ] Badges update in real-time as sets are logged
- [ ] No crashes with malformed data (null sets, empty arrays)

## Manual Testing Scenarios

### Scenario 1: Weight Regression
1. Complete a workout with 20kg bench press (3 sets)
2. Complete another workout with 20kg (3 sets)
3. Start third workout, log 17.5kg
4. Expected: 🔴 Red badge "Weight regressed from 20kg to 17.5kg"

### Scenario 2: Rep Drop
1. Complete a workout with average 10 reps per set
2. Complete another workout with average 10 reps per set
3. Start third workout, log average 7 reps per set
4. Expected: 🔴 Red badge "Rep performance dropped 30%"

### Scenario 3: Intra-Set Variance
1. Start workout, log Set 1: 12 reps
2. Log Set 2: 12 reps
3. Log Set 3: 6 reps
4. Expected: 🟡 Yellow badge "Reps inconsistent (12/12/6)"

### Scenario 4: Low RIR
1. Start workout, log Set 1: RIR 0
2. Log Set 2: RIR 1
3. Log Set 3: RIR 0
4. Expected: 🟡 Yellow badge "Training too close to failure"

### Scenario 5: Deload Mode
1. Activate deload in settings
2. Complete workout with reduced weights
3. Expected: No badges (analysis skipped during deload)

## API Reference

### PerformanceAnalyzer Constructor

```javascript
new PerformanceAnalyzer(storageManager)
```

**Parameters:**
- `storageManager` (StorageManager): Instance providing access to exercise history

### analyzeExercisePerformance(exerciseKey, currentSets)

```javascript
const result = analyzer.analyzeExercisePerformance(
  'UPPER_A - Dumbbell Bench Press',
  [{ weight: 20, reps: 12, rir: 2 }]
);
```

**Parameters:**
- `exerciseKey` (string): Exercise identifier matching storage format
- `currentSets` (Array): Optional array of current session sets for real-time analysis

**Returns:**
```javascript
{
  status: 'good' | 'warning' | 'alert',
  message: string | null,
  pattern: 'regression' | 'form_breakdown' | null
}
```

## Troubleshooting

### Badges not appearing
- Check if you have at least 2 previous workouts for the exercise
- Verify exercise key format matches: `"WORKOUT_NAME - Exercise Name"`
- Check browser console for `[PerformanceAnalyzer]` error messages

### False positives
- Check if deload mode is properly detected
- Verify thresholds are set correctly (25% for reps, 50% for variance)
- Ensure analysis is comparing against 2 sessions ago, not just 1

### Crashes or errors
- Verify null guards are in place for all detection methods
- Check that try-catch wrapper is present in `analyzeExercisePerformance`
- Test with malformed data (null sets, empty arrays)
