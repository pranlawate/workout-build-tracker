# Automated Performance & Form Quality Detection System

**Date:** 2026-02-05
**Status:** Design Validated
**Purpose:** Detect form breakdown and overtraining patterns automatically using objective performance data, without requiring beginner self-assessment

---

## Problem

The BUILD specification requires tracking form quality and fatigue metrics per exercise. However, beginners cannot accurately self-assess form quality. Asking "was your form good?" produces unreliable data.

**Solution:** Analyze exercise history to detect objective performance patterns that indicate form breakdown, overtraining, or progression issues.

---

## Architecture Overview

### 1. Performance Analyzer Module

**File:** `src/js/modules/performance-analyzer.js`

**Purpose:** Read-only analysis module that examines exercise history and returns warnings

**Interface:**
```javascript
analyzeExercisePerformance(exerciseKey, currentSessionData) {
  return {
    status: 'good' | 'warning' | 'alert',
    message: 'Description of issue' | null,
    pattern: 'regression' | 'form_breakdown' | 'fatigue' | null
  };
}
```

**Characteristics:**
- Read-only (never modifies localStorage)
- Conservative thresholds (requires 2+ workouts of history)
- Returns immediately if insufficient data
- No side effects

### 2. Integration Point

**File:** `src/js/app.js` → `renderExercises()` method

**Flow:**
1. Before rendering each exercise header during workout
2. Call `performanceAnalyzer.analyzeExercisePerformance(exerciseKey, currentData)`
3. If status = 'warning' or 'alert', add badge to exercise header
4. Badge appears in real-time as user logs sets

### 3. UI Component

**Badge Display:**
- 🔴 RED ALERT: Significant regression detected (weight/reps dropped)
- 🟡 YELLOW WARNING: Form may be breaking down (inconsistent reps, low RIR)
- No badge: Performance looks normal

**Placement:** Exercise header next to exercise name during active workout

---

## Conservative Detection Rules

### Minimum Data Requirements

**2+ Previous Workouts Required**
- Compare current session to 2 sessions ago (not just 1)
- Prevents false positives from normal fatigue cycles
- Accounts for weekly recovery variation

### Red Alert Triggers (Regression)

**Weight Decreased:**
- Current weight < weight from 2 sessions ago
- Example: Was using 20kg, now using 17.5kg
- **Message:** "⚠️ Weight regressed - check if recovering from illness/deload"

**Rep Drop (25%+ decline):**
- Average reps this session < 75% of average reps 2 sessions ago
- Example: Was hitting 10/10/10, now hitting 7/6/7
- **Message:** "⚠️ Rep performance dropped 25%+ - possible overtraining"

### Yellow Warning Triggers (Form Breakdown)

**Intra-Set Variance (50%+ difference):**
- Reps vary significantly within same session
- Example: 12 / 12 / 6 (last set dropped 50%)
- **Pattern:** Form broke down mid-session, user pushed too hard
- **Message:** "⚠️ Reps inconsistent within session - form may be breaking down"

**Low RIR Consistently (RIR 0-1 on all sets):**
- User logged RIR 0 or 1 on every set
- **Pattern:** Training too close to failure (violates RIR 2-3 guideline)
- **Message:** "⚠️ Training too close to failure - leave 2-3 reps in reserve"

### Ignored Patterns (False Positives)

**Do NOT flag:**
- First session after deload (expected to be lower)
- Slight rep variations (10/9/10 is normal fatigue)
- Single-session dips (could be bad sleep, check next session)
- Intentional form practice (user reduced weight to fix technique)

---

## UI Integration & Data Flow

### When Analysis Runs

**During Workout (Real-Time):**
- User logs sets in active workout
- After each set logged, re-analyze exercise
- Badge appears/updates immediately if pattern emerges

**Example Flow:**
1. User logs Set 1: 12 reps @ RIR 2 → No warning
2. User logs Set 2: 11 reps @ RIR 2 → No warning
3. User logs Set 3: 6 reps @ RIR 1 → 🟡 "Reps inconsistent, form may be breaking down"

### Badge Behavior

**Non-Intrusive:**
- Small badge next to exercise name
- Does not block workout flow
- User can ignore and continue (optional awareness)

**Persistent Until Session Ends:**
- Badge remains visible for rest of workout
- Does not save to history (analysis runs fresh each time)
- Next workout recalculates from scratch

### Data Storage

**No New Storage Required:**
- Reads existing `build_exercise_*` keys from localStorage
- Reads current rotation state for deload detection
- Analysis results are ephemeral (not saved)

**Existing Data Used:**
- Exercise history entries: `{ date, sets: [{ weight, reps, rir }] }`
- Rotation state: `{ lastDate, currentStreak }`
- No schema changes needed

---

## Implementation Scope

### In Scope (MVP)

- Detect regression (weight/rep drops)
- Detect form breakdown (intra-set variance, low RIR)
- Real-time badges during workout
- Conservative thresholds (2+ sessions)

### Out of Scope (Future Enhancements)

- Historical trend charts (requires UI work)
- Automatic deload suggestions (requires workflow changes)
- Cross-exercise fatigue analysis (complex logic)
- User customization of thresholds (keep it simple for now)

---

## Success Criteria

**Functional:**
- Detects 25%+ rep drops with red alert
- Detects 50%+ intra-set variance with yellow warning
- Requires 2+ sessions before flagging
- Runs without errors on exercises with 0-1 previous sessions

**User Experience:**
- Beginners see warnings when pushing too hard
- Warnings do not interrupt workout flow
- No false positives from normal fatigue or deload cycles

**Technical:**
- Read-only module (no localStorage writes)
- Performance: Analysis completes in <50ms per exercise
- No breaking changes to existing code

---

## Design Validation

This design was validated through interactive brainstorming:

1. **Trigger timing:** During workout (not post-workout summary)
2. **Detection sensitivity:** Conservative (2+ sessions, high thresholds)
3. **UI approach:** Non-intrusive badges, optional awareness
4. **Architecture:** Read-only analyzer module, integrated at render time

**Next Steps:** Create implementation plan, build performance-analyzer module, integrate into app.js
