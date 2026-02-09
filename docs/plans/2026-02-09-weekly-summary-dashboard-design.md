# Weekly Summary Dashboard Design

**Date:** 2026-02-09
**Status:** Draft for approval

## Overview

Add analytics tab to existing Progress screen showing training trends, automatic pattern detection, and performance metrics. Users access insights anytime without waiting for weekly rituals.

## Problem Statement

**Current System:**
- Progress screen shows body weight and barbell milestones
- No visibility into training volume trends
- Cannot see compliance or progression patterns
- Sleep/fatigue data collected but never visualized
- Hard to identify what's working and what's not

**Consequences:**
- Miss correlations (e.g., "I regress when sleep <6hrs")
- Cannot spot volume creep or deload needs
- No feedback on training consistency
- Fatigue/recovery data underutilized

## Solution: Analytics Tab

**Integration Point:** Add "Analytics" tab to existing Progress screen
- Tab 1: Overview (existing - workouts, strength gains)
- Tab 2: Body Weight (existing - weight trends, chart)
- Tab 3: Barbell (existing - readiness progress)
- **Tab 4: Analytics (NEW)** - training insights

**Design Principle:** Always-available rolling insights, not weekly snapshots

## Analytics Dashboard Layout

### Section 1: Training Volume (7-day rolling)

**Metrics:**
- Total volume this week (sets × reps × weight in kg)
- Volume trend vs previous week (↑12% / ↓8% / ↔ stable)
- Volume by workout type (Upper A/B, Lower A/B breakdown)

**Visual:**
```
┌─────────────────────────────────────┐
│ 📊 Training Volume (Last 7 Days)    │
├─────────────────────────────────────┤
│ Total: 12,450 kg  ↑ 8% vs last week │
│                                     │
│ [Bar chart: 7 days of volume]       │
│  Mon Tue Wed Thu Fri Sat Sun       │
│   ▂   ▅   ▂   ▆   -   -   -       │
│                                     │
│ By Workout Type:                    │
│ Upper A: 3,200 kg (2 sessions)      │
│ Lower A: 4,100 kg (1 session)       │
│ Upper B: 5,150 kg (1 session)       │
└─────────────────────────────────────┘
```

**Calculation:**
```javascript
// Sum all sets from last 7 days
const last7Days = workouts.filter(w => isWithinDays(w.date, 7));
const totalVolume = last7Days.reduce((sum, workout) => {
  return sum + workout.exercises.reduce((exSum, ex) => {
    return exSum + ex.sets.reduce((setSum, set) => {
      return setSum + (set.weight * set.reps);
    }, 0);
  }, 0);
}, 0);
```

### Section 2: Performance Quality (4-week trends)

**Metrics:**
- Average RIR across all sets (lower = pushing harder)
- RIR trend chart (4 weeks)
- Compliance rate (workouts completed / planned)
- Exercises progressed this month (count)

**Visual:**
```
┌─────────────────────────────────────┐
│ 🎯 Performance Quality (4 Weeks)    │
├─────────────────────────────────────┤
│ Avg RIR: 2.3  ↓ (trending harder)   │
│ [Line chart: 4-week RIR trend]      │
│                                     │
│ Compliance: 92% (11/12 workouts)    │
│ Exercises Progressed: 8/24          │
│                                     │
│ Top Progressors:                    │
│ • Goblet Squat (+5kg)               │
│ • DB Bench Press (+2.5kg)           │
│ • DB Row (+2.5kg)                   │
└─────────────────────────────────────┘
```

**Calculation:**
```javascript
// Average RIR across all sets in period
const avgRIR = allSets.reduce((sum, s) => sum + s.rir, 0) / allSets.length;

// Compliance: actual workouts / (4 weeks × 3 workouts/week)
const expectedWorkouts = 4 * 3; // 12 workouts in 4 weeks
const actualWorkouts = workouts.filter(w => isWithinDays(w.date, 28)).length;
const compliance = (actualWorkouts / expectedWorkouts) * 100;

// Progression: exercises where weight increased in last 30 days
const progressedExercises = exercises.filter(ex => {
  const recent = ex.history.slice(-2);
  return recent.length === 2 && recent[1].weight > recent[0].weight;
});
```

### Section 3: Recovery & Fatigue (4-week trends)

**Metrics:**
- Sleep quality average (7-day rolling)
- Fatigue score trend (4-week chart)
- High fatigue days count
- Recovery red flags

**Visual:**
```
┌─────────────────────────────────────┐
│ 💤 Recovery Trends (4 Weeks)        │
├─────────────────────────────────────┤
│ Avg Sleep: 7.2 hrs  ↑ (improving)   │
│ Avg Fatigue: 2.1/9  ↓ (less fatigue)│
│                                     │
│ [Line chart: Sleep & Fatigue]       │
│  Week 1   Week 2   Week 3   Week 4  │
│   6.8hr   7.1hr   7.3hr   7.4hr    │
│                                     │
│ High Fatigue Days: 2 (≥4 points)    │
│ ⚠️  Feb 3 - Trained despite 6pts    │
│ ✅  Feb 7 - Skipped at 5pts         │
└─────────────────────────────────────┘
```

**Data Source:** `build_recovery_metrics` localStorage (from Enhanced Tracking feature)

### Section 4: Pattern Detection (Automatic Insights)

**Insights:**
- Correlation between sleep and performance
- Volume overload warnings
- Pain pattern detection
- Optimal training frequency

**Visual:**
```
┌─────────────────────────────────────┐
│ 🔍 Discovered Patterns              │
├─────────────────────────────────────┤
│ 🟢 Strong pattern (confidence: 85%)  │
│ When sleep ≥7hrs, you progress 2.3× │
│ faster than when sleep <6hrs        │
│                                     │
│ 🟡 Moderate pattern (confidence: 62%)│
│ Shoulder pain appears when Upper    │
│ volume exceeds 16 sets/week         │
│                                     │
│ 📊 Sample size: 28 workouts         │
└─────────────────────────────────────┘
```

**Pattern Detection Algorithm:**
```javascript
// Example: Sleep vs Progression correlation
const sleepVsProgress = workouts.map(w => ({
  sleep: getRecoveryMetrics(w.date)?.sleep || 0,
  progressed: didProgressOnWorkout(w)
}));

const highSleep = sleepVsProgress.filter(d => d.sleep >= 7);
const lowSleep = sleepVsProgress.filter(d => d.sleep < 6);

const highSleepProgressRate = highSleep.filter(d => d.progressed).length / highSleep.length;
const lowSleepProgressRate = lowSleep.filter(d => d.progressed).length / lowSleep.length;

if (highSleepProgressRate > lowSleepProgressRate * 1.5 && highSleep.length >= 5) {
  return {
    type: 'sleep-progression',
    confidence: calculateConfidence(highSleep.length, lowSleep.length),
    message: `When sleep ≥7hrs, you progress ${(highSleepProgressRate / lowSleepProgressRate).toFixed(1)}× faster than when sleep <6hrs`
  };
}
```

## Tab Navigation Update

**Progress Screen Tabs:**
```html
<div class="progress-tabs">
  <button class="tab-btn active" data-tab="overview">Overview</button>
  <button class="tab-btn" data-tab="body-weight">Body Weight</button>
  <button class="tab-btn" data-tab="barbell">Barbell</button>
  <button class="tab-btn" data-tab="analytics">Analytics</button>
</div>
```

**CSS for 4 tabs:**
```css
.progress-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xs);
}

@media (max-width: 480px) {
  .progress-tabs {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## New Module: AnalyticsCalculator

**Location:** `js/modules/analytics-calculator.js`

**Responsibilities:**
- Calculate training volume (7-day, 28-day)
- Calculate average RIR trends
- Calculate compliance rate
- Identify progressed exercises
- Extract sleep/fatigue trends
- Detect patterns (correlations, anomalies)

**API:**
```javascript
class AnalyticsCalculator {
  constructor(storage) {
    this.storage = storage;
  }

  // Training volume
  calculateVolume(days = 7) {
    // Returns { total, byWorkoutType, trend }
  }

  // Performance quality
  calculatePerformanceMetrics(days = 28) {
    // Returns { avgRIR, rirTrend, compliance, progressedCount, topProgressors }
  }

  // Recovery trends
  calculateRecoveryTrends(days = 28) {
    // Returns { avgSleep, avgFatigue, highFatigueDays, trend }
  }

  // Pattern detection
  detectPatterns() {
    // Returns [{ type, confidence, message }]
  }
}
```

**Read-only pattern:** Same as PerformanceAnalyzer - never modifies storage, only reads

## Data Sources

**localStorage keys:**
- `build_exercise_*` - workout history (volume, RIR, progression)
- `build_workout_rotation` - workout sequence, compliance
- `build_recovery_metrics` - sleep, fatigue, stress, energy
- `build_pain_*` - pain reports (for pattern detection)

**Existing modules:**
- `StorageManager` - data access
- `ProgressAnalyzer` - workout stats (reuse existing logic)
- `BodyWeightAnalyzer` - sleep data (if available)

## Mobile Responsive Design

**Layout:**
- Full-width sections on mobile
- Collapsible sections for long content
- Touch-friendly tap targets (50px min)
- Charts scale to viewport width

**Progressive disclosure:**
- Show summary metrics by default
- "View details" expands charts/lists
- Pattern cards expandable for evidence

## Performance Considerations

**Caching strategy:**
- Cache analytics results per render
- Recalculate only when new workout logged
- Lazy-load pattern detection (expensive computation)

**Data limits:**
- Volume: last 28 days max
- RIR trends: last 28 days max
- Pattern detection: last 90 days (or all available if less)
- Top progressors: max 5 exercises

## Empty State Handling

**New user (no data):**
```
┌─────────────────────────────────────┐
│ 📊 Analytics                        │
├─────────────────────────────────────┤
│ Complete 4+ workouts to unlock      │
│ analytics and pattern detection.    │
│                                     │
│ Current progress: 1/4 workouts      │
└─────────────────────────────────────┘
```

**Insufficient data for patterns:**
```
Pattern Detection: Not enough data yet
(Need 10+ workouts for correlations)
```

## Technical Implementation

### Files to Create

1. **js/modules/analytics-calculator.js** - Core calculation logic
2. **js/components/analytics-chart.js** - Volume/RIR/Sleep charts (reuse ProgressChart pattern)
3. **css/analytics.css** - Dashboard styling

### Files to Modify

1. **js/screens/progress-screen.js** - Add analytics tab, render logic
2. **index.html** - Add analytics tab content container
3. **js/app.js** - Initialize AnalyticsCalculator
4. **service-worker.js** - Cache bump

### Integration Points

**Tab switching:**
```javascript
// In ProgressScreen
showAnalyticsTab() {
  const analytics = this.analyticsCalculator.calculateAll();
  this.renderAnalytics(analytics);
}
```

**Data refresh:**
- Recalculate on tab switch (cheap, <50ms)
- Cache results until next workout logged
- Pattern detection debounced (run once per session max)

## Success Criteria

**User Experience:**
- Quickly understand training trends at a glance
- Identify patterns (sleep/volume/pain correlations)
- See compliance and progression metrics
- No loading delays (instant tab switch)

**Technical:**
- Calculation time <100ms for 90 days of data
- Reuse existing chart components
- No new localStorage keys needed
- Mobile responsive (320px+ width)
- Read-only pattern (no state mutations)

**Data Quality:**
- Accurate volume calculations (verified against manual calc)
- RIR trends match raw data
- Pattern confidence scores meaningful (≥60% = moderate, ≥80% = strong)
- Graceful handling of missing recovery data

## Edge Cases

**Sparse data:**
- Handle weeks with 0-1 workouts (show "N/A" for trends)
- Pattern detection requires minimum sample size (10+ workouts)
- Compliance assumes 3 workouts/week (may need user config later)

**Missing recovery data:**
- Calculate sleep/fatigue trends only for available dates
- Show "No recovery data" if none exists
- Partial data OK (e.g., sleep but no fatigue)

**Deload weeks:**
- Volume should drop during deload (expected)
- Flag deload weeks in volume chart (⚡ icon)
- Exclude deload from progression calculations

## Future Enhancements (Out of Scope)

- Export analytics report (PDF/JSON)
- Compare analytics across date ranges
- User-configurable expected workout frequency
- Custom pattern thresholds
- Time-of-day performance correlations

## Non-Goals

- ❌ Weekly email summaries (always-available, not push notifications)
- ❌ Social sharing of analytics
- ❌ Coach/trainer integration
- ❌ Predictive modeling ("You'll hit 100kg bench in 8 weeks")
- ❌ Nutrition tracking integration

---

## Design Decisions

### 1. Pattern Detection Threshold
**Decision:** Require 10 workouts minimum for pattern display

**Rationale:**
- Statistical significance requires adequate sample size
- Showing partial insights with <10 workouts risks misleading correlations
- Progress indicator shows "Not enough data yet (N/10 workouts)" before threshold

**Implementation:**
```javascript
if (workouts.length < 10) {
  return {
    type: 'insufficient-data',
    message: `Not enough data yet (${workouts.length}/10 workouts)`
  };
}
```

### 2. Volume Chart Granularity
**Decision:**
- 7-day view: Daily bars (7 bars)
- 28-day view: Weekly bars (4 bars)

**Rationale:**
- Daily bars for 28 days = 28 bars (too cluttered on mobile)
- Weekly aggregation shows trends clearly
- 7-day view benefits from daily granularity to spot rest days

### 3. RIR Trend Calculation
**Decision:** 7-day rolling average

**Rationale:**
- Per-workout average is noisy (spiky chart)
- Rolling average smooths variance, shows actual trend
- Matches body weight chart pattern (also uses rolling average)

**Implementation:**
```javascript
const rirTrend = workouts.map((w, i) => {
  const last7 = workouts.slice(Math.max(0, i - 6), i + 1);
  const avgRIR = last7.reduce((sum, workout) => {
    const sets = workout.exercises.flatMap(ex => ex.sets);
    return sum + sets.reduce((s, set) => s + set.rir, 0) / sets.length;
  }, 0) / last7.length;
  return { date: w.date, rir: avgRIR };
});
```

### 4. Compliance Baseline
**Decision:** 3 workouts per week (fixed)

**Rationale:**
- BUILD spec defines 3-4 workouts/week program
- Actual program design is 3/week (Upper A, Lower A, Upper B rotation)
- Making configurable adds complexity with minimal user benefit
- Users training 4/week will see >100% compliance (acceptable)

---

**Next Steps:**
1. ✅ Design finalized
2. Create implementation plan (12-15 tasks estimated)
3. Execute via Subagent-Driven Development
