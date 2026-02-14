# Build/Maintenance Phase Integration Design

**Date:** 2026-02-14
**Feature:** Functional phase toggles with adaptive progression, deload, and unlock behavior
**Status:** Design Complete - Ready for Implementation

## Problem Statement

Build/Maintenance phase toggles exist in UI and storage but have no functional effect. Users can switch phases, but the app behaves identically regardless of selection. This defeats the purpose of having training phases.

The user's goal: Achieve a Bruce Lee/Jackie Chan physique - lean, flexible, and strong without excessive muscle mass that restricts movement. This requires two distinct training approaches:

**Building Phase:** Progressive overload to develop strength foundation
**Maintenance Phase:** Preserve strength while improving mobility, flexibility, and movement quality through tempo work and bodyweight exercises

**Future:** Recovery phase for injury rehabilitation (designed but not implemented in this iteration)

## Solution Overview

Create a PhaseManager module that coordinates phase-specific behavior across progression, deload, and unlock systems. The manager acts as a read-only coordinator (like PerformanceAnalyzer and BarbellProgressionTracker) that provides phase-aware recommendations without modifying state directly.

Key principle: Phases change HOW the app suggests progression, not WHAT data it stores. localStorage structure remains unchanged.

## Architecture Decision: Phase Strategy Pattern

**Chosen Approach:** Centralized PhaseManager class with dependency injection

**Why not direct phase checks?**
With 3 phases planned (Building/Maintenance/Recovery), scattering `if (phase === 'maintenance')` checks across multiple modules creates maintenance burden. Adding Recovery phase would require updating 3+ files.

**Why PhaseManager pattern?**
- Single source of truth for phase behavior
- Recovery phase requires complex logic (weight decreases, safety filtering) better centralized
- Other modules stay simple - they ask PhaseManager instead of checking phase themselves
- Easy to test phase behavior in isolation

## Phase Behaviors

### Building Phase (Current + Default)

**Goal:** Develop strength capacity and unlock new exercises

**Progression:**
- Weight increases when all sets hit max reps @ RIR 2-3
- Standard double progression logic (unchanged from current behavior)
- Example: 3×12 reps @ RIR 2+ → increase 1.25kg next session

**Deload:**
- Base threshold: 6-8 weeks since last deload
- Higher tolerance for training stress (progressive overload builds resilience)
- Performance/fatigue detection triggers still active

**Unlocks:**
- All exercise types shown when criteria met
- Equipment progressions (Barbell Bench, Barbell Squat) encouraged
- Traditional exercises (Sadharan Dand, Sadharan Baithak) available but not prioritized

**UI Message:** "Progressive overload: Build strength and capacity"

### Maintenance Phase (New Behavior)

**Goal:** Preserve current strength while improving mobility, flexibility, and movement quality

**User Intent:** Bruce Lee/Jackie Chan physique - strong but flexible, no restrictive muscle mass

**Progression:**
- **Weight frozen** - no load increases suggested
- When sets feel easy (max reps @ RIR 3+), suggest **tempo variations** instead:
  1. Normal (2-0-2): current default
  2. Paused (2-1-2): 1-second pause at bottom - builds stability
  3. Slow eccentric (3-0-2): 3-second lowering - increases time under tension
  4. Full control (3-1-3): slow + pause + controlled concentric - maximal control
- UI Message: "💪 Maintenance: Try 3-1-2 tempo (pause at bottom)"
- Focus: Movement quality over load progression

**Deload:**
- Base threshold: 4-6 weeks since last deload
- Higher sensitivity (tempo/pause work creates different neuromuscular fatigue)
- More frequent recovery needed despite lower absolute load
- Performance/fatigue detection same as Building

**Unlocks:**
- **Prioritize bodyweight/traditional exercises** in notifications
- Equipment progressions still available but shown second
- Example: When criteria met for both Barbell Bench AND Sadharan Dand:
  - Building: "Barbell Bench Press unlocked!"
  - Maintenance: "Sadharan Dand unlocked! (Barbell Bench also available)"
- Focus: Mobility and movement quality

**UI Message:** "Maintenance: Tempo & mobility focus - preserve strength without bulk"

### Recovery Phase (Future - Not Implemented)

**Goal:** Injury rehabilitation with safety-first approach

**Design Intent (for future implementation):**
- Weight decreases allowed (opposite of Building/Maintenance)
- Safety-first exercise filtering (avoid risky movements)
- Very frequent check-ins (2-3 week deload threshold)
- Mobility-focused unlocks with different criteria
- Block barbell/heavy equipment even if criteria met

**Status:** API designed in PhaseManager for forward compatibility, implementation deferred

## System Architecture

### 1. PhaseManager Module (NEW)

**File:** `js/modules/phase-manager.js`

**Purpose:** Read-only coordinator for phase-specific behavior

**Public API:**
```javascript
class PhaseManager {
  constructor(storageManager) {
    this.storage = storageManager;
  }

  // Core methods
  getPhase() {
    // Returns: 'building' | 'maintenance' | 'recovery'
  }

  getProgressionBehavior() {
    // Returns: {
    //   allowWeightIncrease: boolean,
    //   allowWeightDecrease: boolean,
    //   tempoFocus: boolean
    // }
  }

  getDeloadSensitivity() {
    // Returns: 'normal' | 'high' | 'very_high'
  }

  getUnlockPriority() {
    // Returns: 'all' | 'bodyweight_priority' | 'safety_first'
  }
}
```

**Implementation Details:**
- Read-only module (never calls storage.save* methods)
- Dependency injection pattern (receives storageManager in constructor)
- Uses switch statements for phase-specific logic (clean, maintainable)
- Returns structured data objects, not primitive booleans (future-proof)

### 2. Progression Module (MODIFY)

**File:** `js/modules/progression.js`

**Current State:** Single progression logic for all phases

**Changes Required:**

```javascript
// Before
export function shouldIncreaseWeight(sets, exercise) {
  // ... existing logic
}

// After
export function shouldIncreaseWeight(sets, exercise, phaseManager) {
  const progressionBehavior = phaseManager.getProgressionBehavior();

  // Maintenance/Recovery blocks weight increases
  if (!progressionBehavior.allowWeightIncrease) {
    return false;
  }

  // Building phase - existing logic unchanged
  const { max } = parseRepRange(exercise.repRange);
  const isTimeBased = /\d+s\b/.test(exercise.repRange);

  if (isTimeBased || !exercise.rirTarget) {
    return sets.every(set => set.reps >= max);
  }

  const { min: rirMin } = parseRIRTarget(exercise.rirTarget);
  const allSetsMaxReps = sets.every(set => set.reps >= max);
  const allSetsGoodRIR = sets.every(set => set.rir >= rirMin);

  return allSetsMaxReps && allSetsGoodRIR;
}
```

**Tempo Suggestion (New):**
Will be added in app.js where progression messages are generated. When Maintenance phase + ready to progress → suggest tempo variation instead of weight increase.

### 3. Deload Module (MODIFY)

**File:** `js/modules/deload.js`

**Current State:** Hardcoded 6-week threshold (line 21)

**Changes Required:**

```javascript
// Before
shouldTriggerDeload() {
  const deloadState = this.storage.getDeloadState();
  if (deloadState.active) return { trigger: false };

  const weeksSinceDeload = this.calculateWeeksSinceDeload(deloadState.lastDeloadDate);
  if (weeksSinceDeload >= 6) {  // Hardcoded
    return { trigger: true, reason: 'time', weeks: weeksSinceDeload };
  }
  // ... performance/fatigue checks
}

// After
shouldTriggerDeload() {
  const deloadState = this.storage.getDeloadState();
  if (deloadState.active) return { trigger: false };

  // Get phase-aware sensitivity
  const sensitivity = this.phaseManager.getDeloadSensitivity();
  const baseWeeks = {
    normal: 6,      // Building: 6-8 weeks
    high: 4,        // Maintenance: 4-6 weeks
    very_high: 2    // Recovery: 2-3 weeks (future)
  }[sensitivity];

  // Dynamic threshold based on phase
  const weeksSinceDeload = this.calculateWeeksSinceDeload(deloadState.lastDeloadDate);
  if (weeksSinceDeload >= baseWeeks) {
    return { trigger: true, reason: 'time', weeks: weeksSinceDeload };
  }

  // Performance/fatigue checks (same for all phases)
  const regressionCount = this.detectRegressions();
  if (regressionCount >= 2) {
    return { trigger: true, reason: 'performance', regressions: regressionCount };
  }

  const fatigueAlert = this.checkFatigueScore();
  if (fatigueAlert) {
    return { trigger: true, reason: 'fatigue', score: fatigueAlert.score };
  }

  return { trigger: false };
}
```

**Constructor Change:**
```javascript
class DeloadManager {
  constructor(storage, phaseManager) {
    this.storage = storage;
    this.phaseManager = phaseManager;
  }
}
```

### 4. Unlock Evaluator (MODIFY)

**File:** `js/modules/unlock-evaluator.js`

**Current State:** Returns unlock status without phase awareness

**Changes Required:**

Add new method for phase-aware unlock prioritization:

```javascript
evaluateUnlockWithPhasePriority(targetExercise, prerequisiteExercise) {
  // Get base unlock evaluation (criteria met?)
  const baseEvaluation = this.evaluateUnlock(targetExercise, prerequisiteExercise);

  if (!baseEvaluation.unlocked) return baseEvaluation;

  // Add phase-aware priority
  const unlockPriority = this.phaseManager.getUnlockPriority();
  const exerciseType = this._getExerciseType(targetExercise);

  return {
    ...baseEvaluation,
    priority: this._calculatePriority(exerciseType, unlockPriority),
    phaseRecommended: this._isPhaseRecommended(exerciseType, unlockPriority)
  };
}

_getExerciseType(exerciseName) {
  if (exerciseName.includes('Barbell')) return 'barbell';
  if (exerciseName.includes('Sadharan') || exerciseName.includes('Baithak')) return 'bodyweight';
  if (exerciseName.includes('Mudgal')) return 'traditional';
  if (exerciseName.includes('Pull-up')) return 'bodyweight';
  return 'equipment';
}

_calculatePriority(exerciseType, unlockPriority) {
  if (unlockPriority === 'all') return 1; // Building: all equal
  if (unlockPriority === 'bodyweight_priority') {
    // Maintenance: bodyweight first
    return exerciseType === 'bodyweight' || exerciseType === 'traditional' ? 1 : 2;
  }
  if (unlockPriority === 'safety_first') {
    // Recovery: only bodyweight allowed (future)
    return exerciseType === 'bodyweight' ? 1 : 999;
  }
  return 1;
}
```

**Constructor Change:**
```javascript
class UnlockEvaluator {
  constructor(storageManager, phaseManager) {
    this.storage = storageManager;
    this.phaseManager = phaseManager;
  }
}
```

### 5. App.js Integration (MODIFY)

**File:** `js/app.js`

**Changes Required:**

1. **Instantiate PhaseManager:**
```javascript
constructor() {
  this.storage = new StorageManager();
  this.phaseManager = new PhaseManager(this.storage); // NEW
  this.workoutManager = new WorkoutManager(this.storage);
  this.deloadManager = new DeloadManager(this.storage, this.phaseManager); // UPDATED
  // ... other managers
}
```

2. **Pass phaseManager to modules that need it:**
- progression.js functions (pass as parameter)
- deload.js constructor (dependency injection)
- unlock-evaluator.js constructor (dependency injection)

3. **Update progression message generation:**
```javascript
// In workout screen where suggestions are shown
const phase = this.phaseManager.getPhase();
const progressionBehavior = this.phaseManager.getProgressionBehavior();

if (progressionBehavior.tempoFocus && readyToProgress) {
  // Maintenance: Suggest tempo instead of weight
  message = "💪 Maintenance: Try 3-1-2 tempo (pause at bottom)";
} else if (readyToProgress) {
  // Building: Suggest weight increase
  message = "Add 1.25kg next session";
} else {
  message = "Keep going!";
}
```

## Data Flow

```
User switches phase in Settings
  ↓
storage.saveTrainingPhase('maintenance') called
  ↓
Phase persists to localStorage
  ↓
Next workout loads
  ↓
phaseManager.getPhase() → 'maintenance'
  ↓
Modules query PhaseManager for behavior:
  - progression.js: getProgressionBehavior() → { allowWeightIncrease: false, tempoFocus: true }
  - deload.js: getDeloadSensitivity() → 'high'
  - unlock-evaluator.js: getUnlockPriority() → 'bodyweight_priority'
  ↓
App adapts automatically:
  - Progression: "Try 3-1-2 tempo" instead of "Add weight"
  - Deload: Earlier suggestion (4-6 weeks vs 6-8 weeks)
  - Unlocks: Sadharan Dand shown first, Barbell Bench second
```

## Implementation Scope

### Included in This Iteration:
- ✅ PhaseManager module with Building/Maintenance/Recovery API
- ✅ Building phase behavior (identical to current - no breaking changes)
- ✅ Maintenance phase behavior (tempo focus, frozen weights, bodyweight priority)
- ✅ Dynamic deload timing based on phase
- ✅ Phase-aware unlock prioritization
- ✅ UI messages adapt to phase

### Explicitly Excluded:
- ❌ Recovery phase implementation (API designed, behavior not implemented)
- ❌ Maintenance phase exercise rotation (separate feature, already documented)
- ❌ Goal Quiz integration (separate feature, already documented)
- ❌ Equipment filtering logic (separate feature, already documented)

### Forward Compatibility:
- PhaseManager API includes Recovery phase methods
- Modules check `allowWeightDecrease` and `safety_first` priority
- Future Recovery implementation adds switch cases, no refactoring needed

## Testing Strategy

### Manual Testing Checklist:

**Phase Switching:**
1. Switch to Maintenance in Settings
2. Verify phase info text updates
3. Complete a workout where ready to progress
4. Verify message shows tempo suggestion, NOT weight increase

**Deload Timing:**
1. Building phase: Verify 6-week threshold
2. Switch to Maintenance
3. Verify 4-week threshold applies

**Unlock Priority:**
1. Meet criteria for both Barbell Bench AND Sadharan Dand
2. Building phase: Verify Barbell shown first
3. Maintenance phase: Verify Sadharan Dand shown first

**No Breaking Changes:**
1. Building phase behavior identical to current
2. Existing workouts continue unchanged
3. localStorage structure unchanged

## User Experience Examples

### Building Phase Flow:
```
User completes 3×12 @ RIR 2 on DB Bench Press
  ↓
App: "🎯 Ready to progress! Add 1.25kg next session"
  ↓
User adds weight next workout
  ↓
Continues progressive overload
```

### Maintenance Phase Flow:
```
User completes 3×12 @ RIR 3 on DB Bench Press (sets feel easy)
  ↓
App: "💪 Maintenance: Try 3-1-2 tempo (pause at bottom)"
  ↓
User keeps same weight, adds 1-second pause
  ↓
Improved movement control without load increase
```

### Deload Example:
```
Building Phase:
- Week 7: No regression/fatigue signals → No deload suggested
- Week 8: Performance drop detected → Deload suggested

Maintenance Phase:
- Week 5: No regression/fatigue signals → No deload suggested
- Week 6: Fatigue score high → Deload suggested (earlier due to tempo work stress)
```

## Benefits

**User Benefits:**
- Maintenance phase supports Bruce Lee/Jackie Chan physique goal (flexible + strong)
- Tempo progressions improve movement quality without bulk
- Bodyweight exercise priority aligns with mobility goals
- Frequent deloads prevent overtraining in Maintenance
- Clear guidance on HOW to train in each phase

**Technical Benefits:**
- Centralized phase logic (single file to update for Recovery)
- No breaking changes (Building identical to current)
- Read-only pattern (no state modification complexity)
- Dependency injection (testable in isolation)
- Forward-compatible API (Recovery slots ready)

## Risks & Mitigations

**Risk:** Users confused by tempo suggestions
**Mitigation:** Clear UI messages with specific instructions ("Try 3-1-2 tempo (pause at bottom)")

**Risk:** Maintenance phase feels stagnant (no weight increases)
**Mitigation:** Tempo progression provides clear advancement path without load

**Risk:** Deload timing too aggressive in Maintenance
**Mitigation:** Uses base threshold (4 weeks) but still checks performance/fatigue before suggesting

**Risk:** Breaking changes to existing workouts
**Mitigation:** Building phase behavior identical to current, only Maintenance changes

## Success Criteria

**Functional:**
- ✅ Phase toggle in Settings changes app behavior
- ✅ Building phase: Weight suggestions work (current behavior)
- ✅ Maintenance phase: Tempo suggestions shown instead of weight increases
- ✅ Deload timing adapts to phase (6 weeks Building, 4 weeks Maintenance)
- ✅ Unlock notifications prioritize bodyweight in Maintenance

**User Experience:**
- ✅ User can achieve maintenance physique without excessive bulk
- ✅ Clear guidance on tempo variations in Maintenance
- ✅ Bodyweight exercises suggested when mobility is the goal
- ✅ No confusion about why weights aren't increasing (clear messaging)

**Technical:**
- ✅ No localStorage schema changes
- ✅ No breaking changes to existing workouts
- ✅ PhaseManager module under 200 lines
- ✅ All modules pass existing tests
- ✅ Recovery phase slots ready (no refactoring needed later)

## Future Enhancements

**Recovery Phase (Next Iteration):**
- Weight decrease suggestions when pain detected
- Safety-first exercise filtering (block risky movements)
- Very frequent deload checks (2-3 weeks)
- Different mobility criteria for unlocks

**Maintenance Exercise Rotation:**
- Primary exercises fixed (DB Bench, Goblet Squat)
- Accessory exercises rotate every 4-6 weeks
- Automatic rotation logic or manual selection
- Prevents overuse injuries and maintains engagement

**Tempo Tracking:**
- Log tempo used per set (optional field)
- Track progression through tempo variations
- Achievements for mastering full control (3-1-3)
- Tempo history in exercise detail screen

## Related Documents

**Design Evolution:** See [IMPLEMENTATION-STATUS.md](../IMPLEMENTATION-STATUS.md) Section "What's PENDING"

**Original Phase Design:** See [exercise-progression-pathways-design.md](../archived/plans/2026-02-13/2026-02-12-exercise-progression-pathways-design.md) lines 237-280

**Storage Schema:** No changes required - phase stored in `build_training_phase` localStorage key

**Module Pattern:** Follows PerformanceAnalyzer and BarbellProgressionTracker read-only analyzer pattern
