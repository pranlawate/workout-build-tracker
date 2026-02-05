# Barbell Progression Tracker - Design Document

**Date:** 2026-02-05
**Status:** Design Validated
**Purpose:** Track strength benchmarks, mobility criteria, and training weeks to determine when user is ready to transition from dumbbells to barbells for Bench Press, Back Squat, and Deadlift.

---

## Problem Statement

The BUILD specification (Section 9) requires tracking barbell readiness criteria to safely guide beginners from dumbbell exercises to barbell variations. This includes:
- Strength benchmarks (specific weight/rep targets)
- Mobility requirements (hip hinge, shoulder mobility, ankle mobility)
- Time requirements (minimum weeks of training)
- Pain-free movement verification

Currently, none of this is tracked or displayed to the user.

---

## Design Decisions

### 1. Display Location

**Decision:** Dual-location display (Options A + C)

**Progress Dashboard Screen:**
- Accessed from home screen via "📈 Progress" button
- Shows all three barbell progressions (Bench/Squat/Deadlift) with progress bars
- Overall readiness status at a glance
- Motivational overview ("Where am I overall?")

**Per-Exercise Detail View:**
- When viewing exercise history (e.g., "DB Bench Press History")
- Contextual guidance: "60% ready for Barbell Bench Press"
- Shows which specific criteria are blocking progression
- Actionable ("What do I need to work on for THIS exercise?")

**Rationale:**
- Progress Dashboard provides motivation and high-level view
- Exercise detail provides context-specific guidance when needed
- Aligns with existing UI/UX design document structure

---

### 2. Mobility Tracking Approach

**Decision:** Prompted assessments (Option B) with Yes/No/Not sure

**How it works:**
- Prompt ONCE per workout after key prerequisite exercises
- Ask simple, concrete, objective questions
- Track responses over time
- Require 5+ consecutive "Yes" responses to mark criteria as met
- "Not sure" option prevents forced guessing

**Example prompts:**

After **DB RDL** (for deadlift readiness):
```
✓ Set 3 logged

Mobility check: Could you touch your toes during warm-up today?
[Yes] [No] [Not sure]

ℹ️ Help: Stand with legs straight, bend forward - can fingertips reach toes without rounding back?
```

After **Goblet Squat** (for squat readiness):
```
✓ Exercise complete

Mobility check: Did you keep heels flat during squats today?
[Yes] [No] [Not sure]

ℹ️ Help: No heel lift off ground during descent
```

After **DB Shoulder Press** (for bench press readiness):
```
✓ Exercise complete

Mobility check: Could you press overhead without back arching?
[Yes] [No] [Not sure]

ℹ️ Help: Ribs should stay down, no excessive lower back arch
```

**Tracking history:**
- Store in localStorage: `{ date, exercise, question, response }`
- Display in Progress Dashboard: "Last 5 workouts: ✓✓✓✓✓ (Hip mobility confirmed)"
- Criteria marked as met when 5+ consecutive "Yes" responses

**Why Option B over Option A (simple checkboxes):**
- More conservative (requires consistency over time, not one good day)
- Prevents premature progression
- Builds confidence through repeated validation
- Safer for beginners

**Why Option B over previous form quality tracking:**
- These are objective, binary checks (can/can't touch toes)
- NOT subjective form quality assessment
- Beginner can accurately answer with Yes/No
- Clear helper text explains what to check

---

### 3. Pain Tracking Integration

**Decision:** Include basic pain tracking now (Option A)

**Why include in this feature:**
- Required for safe barbell progression (can't progress with recurring pain)
- Pain in prerequisite exercises blocks barbell transition
- BUILD spec mobility criteria include "no pain" requirements
- Simple yes/no + location is minimal scope addition

**How it works:**

After **each exercise** completion:
```
✓ DB Bench Press complete

Any pain or discomfort during this exercise?
[No] [Yes, minor] [Yes, significant]

If Yes → Where?
[Shoulder] [Elbow] [Wrist] [Lower back] [Knee] [Other]
```

**Key principle: Exercise-specific attribution**
- Pain tracked PER EXERCISE, not globally
- Example: Shoulder pain during "DB Bench Press" ≠ shoulder pain during "Goblet Squat"
- Each exercise has own pain history
- Prevents incorrect attribution to unrelated exercises

**Storage format:**
```javascript
// Per-exercise pain history
{
  'UPPER_A - DB Bench Press': [
    { date: '2026-02-05', hadPain: true, location: 'shoulder', severity: 'minor' },
    { date: '2026-02-03', hadPain: false, location: null, severity: null }
  ]
}
```

**How it affects barbell progression:**

**Barbell Bench Press readiness:**
- Check DB Bench Press pain history (last 5 workouts)
- If 2+ instances of shoulder/elbow pain → Block progression
- Message: "⚠️ Resolve recurring shoulder pain in DB Bench Press before attempting barbell"

**Barbell Squat readiness:**
- Check Goblet Squat pain history (last 5 workouts)
- If 2+ instances of knee/lower back pain → Block progression

**Barbell Deadlift readiness:**
- Check DB RDL + Hyperextension pain history
- If 2+ instances of lower back pain → Block progression

---

## Three Barbell Progressions Tracked

### 1. Barbell Bench Press Readiness

**Prerequisite Exercise:** DB Bench Press

**Strength Criteria (Auto-tracked):**
- ✅ DB Bench Press: 3×12 @ 20kg per hand with RIR 2-3
- ✅ 12+ weeks of DB pressing completed

**Mobility Criteria (Prompted checks):**
- ☐ Shoulder mobility: Can press overhead without back arch (5+ confirmations)
- ☐ Stable on bench: No wobbling with DBs (5+ confirmations)

**Pain Criteria (Auto-tracked):**
- ☐ No shoulder pain in last 5 DB Bench workouts
- ☐ No elbow pain in last 5 DB Bench workouts

**Starting Weight:** Empty barbell (20kg)

---

### 2. Barbell Back Squat Readiness

**Prerequisite Exercises:** Goblet Squat, Hack Squat

**Strength Criteria (Auto-tracked):**
- ✅ Goblet Squat: 3×12 @ 20kg+ with RIR 2-3
- ✅ Hack Squat: 3×12 @ 40kg+ with full ROM
- ✅ 16+ weeks of goblet/hack squats completed

**Mobility Criteria (Prompted checks):**
- ☐ Hip mobility: Bodyweight squat to parallel, heels flat (5+ confirmations)
- ☐ Ankle mobility: Can keep shins <45° in squat (5+ confirmations)

**Pain Criteria (Auto-tracked):**
- ☐ No knee pain in last 5 Goblet Squat workouts
- ☐ No lower back pain in last 5 squat workouts

**Starting Weight:** Empty barbell (20kg)

---

### 3. Barbell Deadlift Readiness

**Prerequisite Exercises:** DB Romanian Deadlift, 45° Hyperextension

**Strength Criteria (Auto-tracked):**
- ✅ DB RDL: 3×12 @ 25kg per hand with RIR 2-3
- ✅ 45° Hyperextension: 3×15 @ bodyweight + 10kg
- ✅ 20+ weeks of RDL/hyperextension work completed

**Mobility Criteria (Prompted checks):**
- ☐ Hip hinge: Can touch toes with straight back (5+ confirmations)
- ☐ Lower back strength: No pain during hyperextensions (5+ confirmations)

**Pain Criteria (Auto-tracked):**
- ☐ No lower back pain in last 5 RDL workouts
- ☐ No lower back pain in last 5 hyperextension workouts

**Starting Weight:** Empty barbell (20kg)

---

## Data Model

### Mobility Check Storage

```javascript
// localStorage key: 'barbell_mobility_checks'
{
  'bench_overhead_mobility': [
    { date: '2026-02-05', response: 'yes' },
    { date: '2026-02-03', response: 'yes' },
    { date: '2026-02-01', response: 'not_sure' }
  ],
  'squat_heel_flat': [
    { date: '2026-02-05', response: 'yes' },
    { date: '2026-02-03', response: 'yes' }
  ],
  'deadlift_toe_touch': [
    { date: '2026-02-05', response: 'yes' }
  ]
}
```

### Pain Tracking Storage

```javascript
// localStorage key: 'exercise_pain_history'
{
  'UPPER_A - DB Bench Press': [
    {
      date: '2026-02-05',
      hadPain: false,
      location: null,
      severity: null
    },
    {
      date: '2026-02-03',
      hadPain: true,
      location: 'shoulder',
      severity: 'minor'
    }
  ],
  'LOWER_A - Goblet Squat': [
    { date: '2026-02-05', hadPain: false, location: null, severity: null }
  ]
}
```

### Progression Status (Derived, not stored)

```javascript
// Calculated on-demand from exercise history + mobility checks + pain history
{
  'barbell_bench': {
    percentage: 65,
    strengthMet: true,
    weeksMet: true,
    mobilityMet: false,  // Need 2 more overhead press confirmations
    painFree: true,
    blockers: ['Overhead mobility: 3/5 confirmations']
  },
  'barbell_squat': {
    percentage: 30,
    strengthMet: false,  // At 17.5kg, need 20kg
    weeksMet: false,     // 8 weeks, need 16
    mobilityMet: false,
    painFree: true,
    blockers: ['Goblet Squat: Need 20kg (currently 17.5kg)', '8 more weeks of training']
  }
}
```

---

## Progress Calculation Logic

### Strength Benchmark Progress

```javascript
// Example: DB Bench Press for barbell bench readiness
function calculateStrengthProgress(exerciseKey, targetWeight, targetReps, targetSets) {
  const history = storage.getExerciseHistory(exerciseKey);
  const recentWorkout = history[history.length - 1];

  if (!recentWorkout) return 0;

  const currentWeight = recentWorkout.sets[0]?.weight || 0;
  const allSetsHitTarget = recentWorkout.sets.every(set => set.reps >= targetReps);
  const avgRIR = recentWorkout.sets.reduce((sum, set) => sum + set.rir, 0) / recentWorkout.sets.length;

  // Weight progress (0-80%)
  const weightProgress = Math.min(currentWeight / targetWeight, 1.0) * 0.8;

  // Rep/RIR progress (0-20%)
  const repProgress = (allSetsHitTarget && avgRIR >= 2) ? 0.2 : 0;

  return (weightProgress + repProgress) * 100;
}
```

### Weeks of Training Progress

```javascript
function calculateWeeksProgress(exerciseKey, targetWeeks) {
  const history = storage.getExerciseHistory(exerciseKey);

  if (history.length < 2) return 0;

  const firstDate = new Date(history[0].date);
  const latestDate = new Date(history[history.length - 1].date);
  const weeksTrained = Math.floor((latestDate - firstDate) / (7 * 24 * 60 * 60 * 1000));

  return Math.min(weeksTrained / targetWeeks, 1.0) * 100;
}
```

### Mobility Progress

```javascript
function calculateMobilityProgress(criteriaKey, requiredConsecutive = 5) {
  const checks = storage.getMobilityChecks(criteriaKey) || [];

  // Get last N checks
  const recentChecks = checks.slice(-requiredConsecutive);

  // Count consecutive "yes" from end
  let consecutiveYes = 0;
  for (let i = recentChecks.length - 1; i >= 0; i--) {
    if (recentChecks[i].response === 'yes') {
      consecutiveYes++;
    } else {
      break;
    }
  }

  return Math.min(consecutiveYes / requiredConsecutive, 1.0) * 100;
}
```

### Pain Check

```javascript
function isPainFree(exerciseKey, requiredPainFreeSessions = 5) {
  const painHistory = storage.getPainHistory(exerciseKey) || [];
  const recent = painHistory.slice(-requiredPainFreeSessions);

  if (recent.length < requiredPainFreeSessions) {
    return true;  // Not enough data, don't block
  }

  const painfulSessions = recent.filter(entry => entry.hadPain).length;

  // Allow max 1 painful session in last 5
  return painfulSessions <= 1;
}
```

### Overall Percentage

```javascript
function calculateOverallProgress(progression) {
  // All criteria must be met to reach 100%
  // But show partial progress for motivation

  const weights = {
    strength: 0.4,
    weeks: 0.2,
    mobility: 0.3,
    painFree: 0.1
  };

  let total = 0;

  if (progression.strengthMet) total += weights.strength * 100;
  else total += progression.strengthProgress * weights.strength;

  if (progression.weeksMet) total += weights.weeks * 100;
  else total += progression.weeksProgress * weights.weeks;

  if (progression.mobilityMet) total += weights.mobility * 100;
  else total += progression.mobilityProgress * weights.mobility;

  if (progression.painFree) total += weights.painFree * 100;

  return Math.floor(total);
}
```

---

## UI Components

### Progress Dashboard Screen

```
┌─────────────────────────────────────┐
│ ← Progress Dashboard            ⚙️  │
├─────────────────────────────────────┤
│ 🎯 Equipment Progression Milestones │
│                                     │
│ ─── Barbell Bench Press ───         │
│ Progress: 65%                       │
│ ████████░░░░░░░░░░░░ 65%            │
│                                     │
│ ✅ Strength: 20kg × 3×12            │
│ ✅ Training: 14 weeks completed     │
│ ⏳ Mobility: 3/5 confirmations      │
│ ✅ Pain-free: No recent issues      │
│                                     │
│ Next: Confirm overhead mobility     │
│ [VIEW DETAILS]                      │
│                                     │
│ ─── Barbell Back Squat ───          │
│ Progress: 30%                       │
│ ███░░░░░░░░░░░░░░░░░ 30%            │
│                                     │
│ ⏳ Strength: 17.5kg (need 20kg)     │
│ ⏳ Training: 8 weeks (need 16)      │
│ ❌ Mobility: Not checked            │
│ ✅ Pain-free: No recent issues      │
│                                     │
│ [VIEW DETAILS]                      │
│                                     │
│ ─── Barbell Deadlift ───            │
│ Progress: 15%                       │
│ ██░░░░░░░░░░░░░░░░░░ 15%            │
│                                     │
│ ⏳ Strength: 15kg (need 25kg)       │
│ ⏳ Training: 6 weeks (need 20)      │
│ ❌ Mobility: Not checked            │
│ ✅ Pain-free: No recent issues      │
│                                     │
│ [VIEW DETAILS]                      │
└─────────────────────────────────────┘
```

### Exercise History View (Contextual Display)

```
┌─────────────────────────────────────┐
│ ← DB Bench Press History       ⚙️  │
├─────────────────────────────────────┤
│ Progress Chart (Last 8 sessions)    │
│  25kg ┤                        ●    │
│  20kg ┤              ●    ●    ●    │
│  15kg ┤    ●    ●    ●             │
│                                     │
│ 🎯 Barbell Bench Progress: 65%      │
│ ████████░░░░░░░░░░░░                │
│                                     │
│ ✅ You've hit 20kg × 3×12!          │
│ ⏳ 2 more overhead mobility checks  │
│                                     │
│ [VIEW FULL PROGRESSION]             │
│                                     │
│ Recent Workouts:                    │
│ 📅 Feb 5 (today)                    │
│ 20kg × 12,12,12 @ RIR 2,2,3        │
│ ✅ No pain reported                 │
│ ...                                 │
└─────────────────────────────────────┘
```

### Mobility Check Prompt (In-Workout)

```
┌─────────────────────────────────────┐
│ ✓ DB Shoulder Press Complete        │
├─────────────────────────────────────┤
│ Mobility Check                      │
│                                     │
│ Could you press overhead without    │
│ back arching today?                 │
│                                     │
│ ℹ️ Ribs stay down, no excessive     │
│ lower back arch                     │
│                                     │
│ [Yes] [No] [Not sure]               │
│                                     │
│ Progress: 3/5 confirmations         │
│ Recent: ✓✓✓                         │
└─────────────────────────────────────┘
```

### Pain Tracking Prompt (In-Workout)

```
┌─────────────────────────────────────┐
│ ✓ DB Bench Press Complete           │
├─────────────────────────────────────┤
│ Any pain or discomfort during       │
│ this exercise?                      │
│                                     │
│ [No] [Yes, minor] [Yes, significant]│
│                                     │
│ If yes, where?                      │
│ [Shoulder] [Elbow] [Wrist]          │
│ [Lower back] [Other]                │
│                                     │
│ Recent history: ✓✓✓✓✓ (pain-free)  │
└─────────────────────────────────────┘
```

### Unlock Notification (When Ready)

```
┌─────────────────────────────────────┐
│ 🎉 Milestone Unlocked!              │
├─────────────────────────────────────┤
│ You're ready for Barbell Bench Press│
│                                     │
│ All criteria met:                   │
│ ✅ Strength: 20kg × 3×12            │
│ ✅ Training: 12+ weeks completed    │
│ ✅ Mobility: Overhead confirmed     │
│ ✅ Pain-free movement               │
│                                     │
│ Starting protocol:                  │
│ • Week 1-2: BOTH DB and barbell     │
│   (3 sets DB + 3 sets barbell)      │
│ • Week 3-4: Barbell only            │
│   (Start at 20kg × 3×8)             │
│                                     │
│ [VIEW TRANSITION GUIDE]             │
│ [DISMISS]                           │
└─────────────────────────────────────┘
```

---

## Implementation Scope

### In Scope (MVP)
- ✅ Three barbell progressions tracked (Bench/Squat/Deadlift)
- ✅ Strength benchmark auto-tracking from exercise history
- ✅ Weeks of training auto-calculation
- ✅ Prompted mobility checks (Yes/No/Not sure)
- ✅ Pain tracking per exercise
- ✅ Progress percentage calculation
- ✅ Progress Dashboard screen
- ✅ Contextual display in exercise history
- ✅ Unlock notification when all criteria met
- ✅ Transition protocol display

### Out of Scope (Future)
- ❌ Dip station progression (6-12 months away)
- ❌ Advanced progression tracking (beyond barbell introduction)
- ❌ Coach verification integration
- ❌ Video form analysis
- ❌ Custom progression criteria (user-defined milestones)

---

## Success Criteria

**Functional:**
- ✅ Automatically tracks strength benchmarks from workout data
- ✅ Prompts mobility checks without interrupting flow
- ✅ Tracks pain per exercise, not globally
- ✅ Calculates accurate progress percentages
- ✅ Shows unlock notification when ready

**User Experience:**
- ✅ Motivational (shows progress, not just "not ready")
- ✅ Non-intrusive (prompts are quick, optional)
- ✅ Safe (requires 5+ confirmations, blocks on recurring pain)
- ✅ Clear guidance (shows exactly what's needed next)

**Technical:**
- ✅ Uses existing exercise history (no schema changes)
- ✅ Read-only analysis module pattern (like Performance Analyzer)
- ✅ localStorage for mobility checks and pain history
- ✅ No breaking changes to existing code

---

## Design Validation

This design was validated through interactive discussion on 2026-02-05:

1. **Display location:** Progress Dashboard + per-exercise contextual view
2. **Mobility tracking:** Prompted checks with Yes/No/Not sure, 5+ consecutive confirmations required
3. **Pain tracking:** Included now, tracked per exercise to prevent misattribution
4. **Scope:** Basic pain tracking (yes/no + location), full Enhanced Tracking Metrics deferred to Phase 2

**Key insight:** Pain in prerequisite exercises (e.g., shoulder pain during DB Bench) is critical for safe barbell progression, so basic pain tracking must be included in this feature.

**Next Step:** Create implementation plan with task breakdown

---

**END OF DESIGN DOCUMENT**
