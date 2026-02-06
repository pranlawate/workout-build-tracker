# Progress Dashboard - Design Document

**Date:** 2026-02-06
**Status:** Design Complete - Ready for Implementation
**Priority:** HIGH - Key motivational feature

---

## Overview

Extend the existing Progress Dashboard screen with comprehensive training analytics and body composition tracking. This adds 6 new features to the current barbell progression display.

**Current State:** Progress screen shows only Barbell Progression Tracker (equipment readiness)
**New State:** Unified dashboard with barbell readiness + summary stats + strength gains + body weight tracking

---

## Architecture

### Component Structure

```
js/modules/progress-analyzer.js      NEW - Calculates training statistics
js/modules/body-weight.js            NEW - Manages body weight data
js/components/weight-trend-chart.js  NEW - Canvas chart rendering
css/progress-dashboard.css           NEW - Dashboard-specific styles
```

### Integration Points

- **`app.js`**: Extend `showProgressDashboard()` to render new sections
- **`app.js`**: Add `completeWorkout()` hook for weekly weigh-in prompt
- **`app.js`**: New render methods for each dashboard section
- **`index.html`**: Add weigh-in modal HTML

---

## Data Structures

### 1. Body Weight Storage

**localStorage key:** `build_body_weight`

```javascript
{
  entries: [
    { date: '2026-02-05T10:30:00Z', weight_kg: 57.2 },
    { date: '2026-01-29T09:15:00Z', weight_kg: 56.8 },
    // ... up to 8 weeks of data
  ]
}
```

**Management:**
- Add entry: `bodyWeight.addEntry(weight_kg)`
- Get summary: `bodyWeight.getWeightSummary()` → returns {current, trend8Week, monthlyRate, status}
- Check due: `bodyWeight.isWeighInDue()` → true if >7 days since last entry

### 2. Workout Session Timing

**Extend existing workout session data:**

```javascript
// When user clicks "Start Workout"
workoutSession = {
  workoutName: 'UPPER_A',
  startTime: new Date(),  // Already exists
  endTime: null,          // NEW: Set when "Complete Workout" clicked
  exercises: [...]
}
```

**Storage:** Save `startTime` and `endTime` to exercise history when workout completes
**Usage:** Calculate average session duration for last 4 weeks

### 3. Statistics Calculation (Computed On-Demand)

All stats calculated on dashboard load, not stored:

- **Last 4 weeks data:** Filter exercise history by dates in last 28 days
- **Workouts completed:** Count unique workout completion dates
- **Exercises progressed:** Compare most recent weight vs 4 weeks ago per exercise
- **Current streak:** Count consecutive workout dates with ≤3 day gaps
- **Avg session time:** Average of `(endTime - startTime)` for last 4 weeks

---

## UI Rendering

### Dashboard Layout

```
┌─────────────────────────────────────┐
│ [Existing] Barbell Progression      │
│   - Bench Press readiness card      │
│   - Back Squat readiness card       │
│   - Deadlift readiness card         │
├─────────────────────────────────────┤
│ [NEW] Last 4 Weeks Summary          │
│   ✅ Workouts: 11/12                │
│   ⏱️ Avg time: 36 min               │
│   📊 Progressed: 15/18               │
│   🔥 Streak: 3 workouts             │
├─────────────────────────────────────┤
│ [NEW] Strength Gains                │
│   Goblet Squat: 15→20kg (+33%)      │
│   DB Bench: 7.5→10kg (+33%)         │
│   Cable Row: 20→25kg (+25%)         │
├─────────────────────────────────────┤
│ [NEW] Body Composition              │
│   Current: 57.2 kg                  │
│   8-week: +0.9 kg                   │
│   Rate: +0.5 kg/month               │
│   Status: 🟢 Healthy lean bulk      │
├─────────────────────────────────────┤
│ [NEW] Body Weight Trend (Canvas)    │
│   [Line chart: 8 weeks smoothed]    │
└─────────────────────────────────────┘
```

### Render Methods (app.js)

```javascript
showProgressDashboard() {
  this.hideAllScreens();
  document.getElementById('progress-screen').classList.add('active');

  // Initialize modules
  const tracker = new BarbellProgressionTracker(this.storage);
  const progressAnalyzer = new ProgressAnalyzer(this.storage);
  const bodyWeight = new BodyWeightManager(this.storage);

  // Get data
  const barbellData = {
    bench: tracker.getBarbellBenchReadiness(),
    squat: tracker.getBarbellSquatReadiness(),
    deadlift: tracker.getBarbellDeadliftReadiness()
  };
  const stats = progressAnalyzer.getLast4WeeksStats();
  const strengthGains = progressAnalyzer.getTopProgressingExercises(3);
  const weightData = bodyWeight.getWeightSummary();

  // Render sections
  const html = `
    ${this.renderBarbellCards(barbellData)}      // Existing
    ${this.renderSummaryStats(stats)}             // NEW
    ${this.renderStrengthGains(strengthGains)}    // NEW
    ${this.renderBodyComposition(weightData)}     // NEW
    ${this.renderWeightChart(weightData)}         // NEW
  `;

  document.getElementById('progress-content').innerHTML = html;

  // Attach back button handler
  const backBtn = document.getElementById('progress-back-btn');
  if (backBtn) backBtn.onclick = () => this.showHomeScreen();
}
```

**New render methods:**
- `renderSummaryStats(stats)` → 4-week summary card
- `renderStrengthGains(exercises)` → Top 3 progressing exercises
- `renderBodyComposition(data)` → Current weight, trend, status indicator
- `renderWeightChart(data)` → Canvas chart integration

### Canvas Chart Component

`WeightTrendChart` class handles all Canvas drawing:

```javascript
export class WeightTrendChart {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  render(weightEntries) {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');

    // Draw axes, grid, data points, trend line
    this.drawAxes(ctx);
    this.drawDataPoints(ctx, weightEntries);
    this.drawTrendLine(ctx, this.smooth8Week(weightEntries));

    return canvas;
  }

  smooth8Week(entries) {
    // Simple moving average smoothing
  }
}
```

---

## User Interactions

### 1. Weekly Weigh-In Flow

After completing a workout:

```javascript
completeWorkout() {
  // ... existing workout completion logic ...

  // Check if weight entry needed (>7 days since last)
  const bodyWeight = new BodyWeightManager(this.storage);
  if (bodyWeight.isWeighInDue()) {
    this.showWeighInModal();
  }
}

showWeighInModal() {
  const modal = document.getElementById('weighin-modal');
  modal.style.display = 'flex';

  // Attach handlers
  document.getElementById('log-weight-btn').onclick = () => {
    const weight = parseFloat(document.getElementById('weight-input').value);
    if (weight > 0) {
      bodyWeight.addEntry(weight);
      modal.style.display = 'none';
    }
  };

  document.getElementById('skip-weighin-btn').onclick = () => {
    modal.style.display = 'none';
  };
}
```

**Modal contains:**
- Number input for weight (kg, 1 decimal place, 30-200kg range)
- "Log Weight" button
- "Skip This Week" button

### 2. Body Weight Status Indicators

Based on monthly rate calculation:

- 🟢 **Healthy lean bulk:** +0.3 to +0.7 kg/month
- 🟡 **Fast bulk:** >+0.7 kg/month
- 🔵 **Maintenance:** -0.2 to +0.2 kg/month
- 🟡 **Slow cut:** -0.3 to -0.5 kg/month
- 🔴 **Rapid cut:** <-0.5 kg/month

**Calculation:**
- Take last 8 weeks of weight entries
- Calculate difference between first and last entry
- Normalize to monthly rate: `(lastWeight - firstWeight) / weeks * 4.33`
- Ignore single-week fluctuations

---

## Edge Cases & Null Safety

### No Workout History Yet
- Summary stats: Show "0/0", "0 min", "0/0", "0 workouts"
- Strength gains: Hide section entirely
- Message: "Start training to see progress!"

### <4 Weeks of Data
- Show stats for available data
- Add note: "X weeks tracked (need 4 for full analysis)"
- Calculations work with partial data

### No Body Weight Entries
- Hide body composition section entirely
- Hide weight chart section
- No error, just clean omission

### No Progressing Exercises
- Show message: "No progression detected yet. Keep training!"
- Don't show empty list

### Tie in Top 3 Exercises
- Sort by percentage gain (descending)
- Break ties by absolute weight gain
- Break further ties alphabetically

### Performance Optimization
- Stats calculation happens on dashboard load only
- Canvas chart redraws only when weight data changes
- Cache 4-week date range (start/end dates)
- Limit display to top 3 exercises (not all 26)

---

## Module APIs

### ProgressAnalyzer

```javascript
export class ProgressAnalyzer {
  constructor(storage) {
    this.storage = storage;
  }

  getLast4WeeksStats() {
    return {
      workoutsCompleted: 11,
      workoutsPlanned: 12,
      avgSessionMinutes: 36,
      exercisesProgressed: 15,
      totalExercises: 18,
      currentStreak: 3
    };
  }

  getTopProgressingExercises(count = 3) {
    return [
      { name: 'Goblet Squat', oldWeight: 15, newWeight: 20, percentGain: 33 },
      { name: 'DB Bench Press', oldWeight: 7.5, newWeight: 10, percentGain: 33 },
      { name: 'Cable Row', oldWeight: 20, newWeight: 25, percentGain: 25 }
    ];
  }
}
```

### BodyWeightManager

```javascript
export class BodyWeightManager {
  constructor(storage) {
    this.storage = storage;
  }

  addEntry(weight_kg) {
    const data = this.getData();
    data.entries.push({
      date: new Date().toISOString(),
      weight_kg: weight_kg
    });
    // Keep last 8 weeks only
    this.trimTo8Weeks(data.entries);
    localStorage.setItem('build_body_weight', JSON.stringify(data));
  }

  getWeightSummary() {
    const entries = this.getData().entries;
    if (entries.length === 0) return null;

    return {
      currentWeight: entries[entries.length - 1].weight_kg,
      trend8Week: this.calculate8WeekTrend(entries),
      monthlyRate: this.calculateMonthlyRate(entries),
      status: this.determineStatus(monthlyRate)
    };
  }

  isWeighInDue() {
    const entries = this.getData().entries;
    if (entries.length === 0) return true;

    const lastEntry = new Date(entries[entries.length - 1].date);
    const daysSince = (new Date() - lastEntry) / (1000 * 60 * 60 * 24);
    return daysSince > 7;
  }
}
```

---

## Implementation Checklist

### Backend Modules
- [ ] Create `ProgressAnalyzer` module with stats calculation
- [ ] Create `BodyWeightManager` module with storage methods
- [ ] Extend `StorageManager` with body weight get/set (optional)
- [ ] Add `startTime`/`endTime` tracking to workout session data

### UI Components
- [ ] Create `WeightTrendChart` Canvas component
- [ ] Add render methods to `app.js` for each section
- [ ] Extend `showProgressDashboard()` to include new sections
- [ ] Create weigh-in modal HTML in `index.html`

### Styling
- [ ] Create `css/progress-dashboard.css` for new sections
- [ ] Style summary stats cards
- [ ] Style strength gains list
- [ ] Style body composition display
- [ ] Style Canvas chart container

### Integration
- [ ] Hook weigh-in prompt into `completeWorkout()`
- [ ] Add weigh-in modal handlers
- [ ] Test with empty data states
- [ ] Test with partial data (<4 weeks)
- [ ] Test weight status indicators

### Testing
- [ ] Unit tests for `ProgressAnalyzer` stats calculations
- [ ] Unit tests for `BodyWeightManager` data management
- [ ] Unit tests for 8-week smoothing algorithm
- [ ] Edge case tests (no data, ties, negative trends)
- [ ] Integration test for complete dashboard rendering

---

## Success Criteria

1. Dashboard displays barbell progression + new sections without layout issues
2. Summary stats accurately reflect last 4 weeks of training
3. Strength gains show top 3 most improved exercises
4. Body weight chart renders smoothly with 8-week trend line
5. Weigh-in prompt appears weekly after workout completion
6. All empty states display cleanly without errors
7. Performance remains smooth (dashboard loads <500ms)

---

## Future Enhancements (Out of Scope)

- Body fat percentage tracking
- Photo progress tracking
- Detailed weekly summary dashboard
- Exercise-specific progress charts (currently only body weight)
- Export progress report as PDF
- Historical milestone tracking beyond barbell readiness
