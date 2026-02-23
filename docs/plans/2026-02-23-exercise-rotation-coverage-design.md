# Exercise Rotation & Muscle Coverage System - Design Document

**Date:** 2026-02-23
**Status:** Approved for Implementation
**Author:** Design collaboration with user

---

## 1. Executive Summary

This system ensures complete muscle head coverage through intelligent exercise rotation. Instead of relying solely on pain/plateau reactions, the system proactively suggests exercise variations every 8-12 weeks to prevent adaptive plateau and ensure balanced muscle development.

**Core Innovation:** Rotation-based unlocks. Users prove mastery across movement variations (hit milestone twice on each variation) before progressing to more complex exercises.

---

## 2. Problem Statement

**Current limitations:**
- Smart progression system is reactive only (responds to plateaus/pain)
- No proactive variety mechanism
- Some muscle heads receive incomplete coverage
- Unlock system requires milestone on single exercise, not movement mastery

**User pain points:**
- Cable Chest Fly doesn't provide meaningful lower chest coverage
- No systematic rotation prompts for bicep/tricep variations
- Risk of adaptive plateau from prolonged single-variation training

---

## 3. Architecture Overview

**Hybrid architecture using three coordinated modules:**

1. **rotation-manager.js** (new)
   - Tracks exercise tenure (weeks on current variation)
   - Determines rotation eligibility
   - Provides rotation suggestions

2. **exercise-metadata.js** (enhanced)
   - Add muscle head coverage mappings
   - Add rotation pool definitions
   - Add per-exercise unlock milestones

3. **smart-progression.js** (extended)
   - Integrate rotation checks into existing 6-priority system
   - Add Priority 3: ROTATION_DUE (after weight increase, before plateau)

**Integration point:** Rotation manager consulted during `smart-progression.getSuggestion()` call. Unified suggestion output to user.

---

## 4. Data Structures

### 4.1 Exercise Tenure Tracking

**localStorage key:** `build_exercise_tenure`

```javascript
{
  "UPPER_A - Tricep Pushdowns": {
    exerciseName: "Tricep Pushdowns",
    startDate: "2026-02-23",          // ISO date string
    weeksOnExercise: 2,                // Calculated from startDate
    lastRotationDate: null             // ISO date of last rotation
  },
  "UPPER_B - DB Hammer Curls": {
    exerciseName: "DB Hammer Curls",
    startDate: "2026-02-10",
    weeksOnExercise: 4,
    lastRotationDate: null
  }
}
```

**Calculation:** `weeksOnExercise = Math.floor((today - startDate) / 7 days)`

### 4.2 Muscle Head Coverage

**Added to exercise-metadata.js:**

```javascript
export const MUSCLE_HEAD_COVERAGE = {
  'Tricep Pushdowns': {
    primary: ['triceps_lateral', 'triceps_long'],
    secondary: []
  },
  'Overhead Tricep Extension': {
    primary: ['triceps_long', 'triceps_medial'],
    secondary: ['triceps_lateral']
  },
  'DB Hammer Curls': {
    primary: ['brachialis', 'brachioradialis'],
    secondary: ['biceps_long']
  },
  'Standard DB Curls': {
    primary: ['biceps_long', 'biceps_short'],
    secondary: ['brachialis']
  }
  // ... other exercises
};
```

### 4.3 Rotation Pools

**Added to exercise-metadata.js:**

```javascript
export const ROTATION_POOLS = {
  'Tricep Pushdowns': {
    tier: 'simple',
    rotations: ['Overhead Tricep Extension']
  },
  'Overhead Tricep Extension': {
    tier: 'simple',
    rotations: ['Tricep Pushdowns']
  },
  'DB Hammer Curls': {
    tier: 'simple',
    rotations: ['Standard DB Curls']
  },
  'Standard DB Curls': {
    tier: 'simple',
    rotations: ['DB Hammer Curls']
  },
  // Post-unlock rotations
  'Barbell Curls': {
    tier: 'moderate',
    rotations: ['EZ Bar Curls']
  },
  'Barbell Bench Press': {
    tier: 'complex',
    rotations: ['Close-Grip Bench Press', 'Incline Bench Press']
  }
  // ... other barbell variations
};
```

### 4.4 Unlock Milestones

**Added to exercise-metadata.js:**

```javascript
export const UNLOCK_MILESTONES = {
  // Simple tier variations
  'DB Hammer Curls': { weight: 15, reps: 12, sets: 3 },
  'Standard DB Curls': { weight: 15, reps: 12, sets: 3 },
  'Tricep Pushdowns': { weight: 17.5, reps: 12, sets: 3 },
  'Overhead Tricep Extension': { weight: 15, reps: 12, sets: 3 },

  // Moderate tier (barbell unlocks)
  'Barbell Curls': { weight: 20, reps: 10, sets: 3 },
  'EZ Bar Curls': { weight: 20, reps: 10, sets: 3 }
  // ... etc
};
```

---

## 5. Rotation Pools - Final List

### 5.1 Mandatory Rotations (Missing Muscle Heads)

**1. DB Hammer Curls ↔ Standard DB Curls (UPPER_B)**
- Hammer: brachialis + brachioradialis emphasis
- Standard: biceps long + short heads
- Unlock requirement: Hit 15kg × 12 twice on BOTH

**2. Tricep Pushdowns ↔ Overhead Tricep Extension (UPPER_A)**
- Pushdowns: lateral + long heads
- Overhead: long + medial heads
- Unlock requirement: Hit milestone twice on BOTH

### 5.2 Exercise Replacement (UPPER_A)

**Replace:** Cable Chest Fly
**With:** Decline DB Press

**Rationale:**
- UPPER_A has Flat Press (mid-chest)
- UPPER_B has Incline Press (upper chest)
- Adding Decline Press (lower chest) = complete pec coverage
- No rotation needed - 3 pressing angles across A/B split

### 5.3 Post-Unlock Rotations (Optional Variety)

**After unlocking barbell exercises:**
- Barbell Bench ↔ Close-Grip Bench
- Barbell Deadlift ↔ Sumo Deadlift
- Barbell Back Squat ↔ Front Squat
- Barbell Curls ↔ EZ Bar Curls

### 5.4 No Rotation Needed (Complete Coverage)

**Single movement coverage:**
- Hack Squat (all quad + glute heads)
- Leg Press (full lower body)
- DB Romanian Deadlift (all hamstring muscles)
- 45° Hyperextension (entire posterior chain)
- Leg Extension, Leg Curl

**Workout composition coverage (A/B split):**
- Deltoids: Lateral Raises + Face Pulls + Presses = all 3 heads
- Calves: Standing (gastrocnemius) + Seated (soleus)
- Glutes: Leg Abduction (medius/minimus) + Hip Thrust (maximus)
- Back: Complete lat/rhomboid/trap coverage across 4 exercises

**Core exercises (complete as-is):**
- Plank, Dead Bug, Side Plank

---

## 6. Rotation Logic Flow

### 6.1 Rotation Eligibility Check

```javascript
// rotation-manager.js
checkRotationDue(exerciseKey, currentExercise) {
  // 1. Calculate weeks on exercise
  const tenure = this.getTenure(exerciseKey);
  if (tenure.weeksOnExercise < 8) return null;

  // 2. Check if exercise has rotation pool
  const pool = ROTATION_POOLS[currentExercise];
  if (!pool) return null;

  // 3. Check unlock proximity (suppress if close to unlock)
  const unlockPath = this.getUnlockPath(currentExercise);
  if (unlockPath) {
    const progress = this.unlockEvaluator.getMilestoneProgress(
      currentExercise,
      unlockPath
    );
    if (progress >= 0.8) return null; // 80%+ toward unlock
  }

  // 4. Return rotation suggestion
  const nextVariation = pool.rotations[0]; // Simplest: alternate between 2
  return {
    type: 'ROTATION_DUE',
    suggestedExercise: nextVariation,
    reason: `Try ${nextVariation} for complete muscle coverage (${tenure.weeksOnExercise} weeks on current variation)`,
    currentExercise,
    weeksOnExercise: tenure.weeksOnExercise
  };
}
```

### 6.2 Smart Progression Integration

**New priority order in `smart-progression.js`:**

```javascript
getSuggestion(exerciseKey, history, painHistory) {
  // Priority 1: Pain handling (safety first)
  if (painHistory && painHistory.latestPain) {
    return this.handlePainBasedSuggestion(...);
  }

  // Priority 2: Successful progression (weight increase)
  if (this.detectSuccessfulProgression(history, exerciseKey)) {
    return this.suggestWeightIncrease(...);
  }

  // Priority 3: Rotation due (NEW)
  const rotationSuggestion = this.rotationManager?.checkRotationDue(
    exerciseKey,
    currentExerciseName
  );
  if (rotationSuggestion) {
    return rotationSuggestion;
  }

  // Priority 4: Plateau warning (was 3)
  if (this.detectPlateau(history)) {
    return this.suggestPlateauAlternative(...);
  }

  // Priority 5: Regression warning (was 4)
  if (this.detectRegression(history)) {
    return { type: 'RECOVERY_WARNING', ... };
  }

  // Priority 6: Continue (was 5)
  return { type: 'CONTINUE', ... };
}
```

---

## 7. Rotation-Based Unlock System

### 7.1 Philosophy Change

**Old system:** Hit milestone once on single exercise → unlock next tier
**New system:** Hit milestone twice consecutively on EACH rotation variation → unlock next tier

### 7.2 Example - Bicep Progression

**Rotation pool:** DB Hammer Curls ↔ Standard DB Curls
**Unlock target:** Barbell Curls (Moderate tier)

**Requirements:**
1. DB Hammer Curls: 15kg × 12 reps × 3 sets **twice in a row**
2. Standard DB Curls: 15kg × 12 reps × 3 sets **twice in a row**

**Timeline example:**
- Week 0-8: DB Hammer Curls, reach 15kg × 12 first time
- Week 10: DB Hammer Curls, hit 15kg × 12 again → ✓ Variation A complete
- Week 10: Rotation suggests Standard DB Curls
- Week 10-16: Standard DB Curls, working up to milestone
- Week 16: Standard DB Curls, hit 15kg × 12 first time
- Week 17: Standard DB Curls, hit 15kg × 12 again → ✓ Variation B complete
- Week 17: **Barbell Curls unlocked!**

### 7.3 Unlock Proximity Suppression

**Problem:** User at week 8, DB Hammer Curls 12.5kg × 12 (83% toward 15kg milestone)
**Solution:** Suppress rotation suggestion when progress ≥ 80%
**Rationale:** Let user reach unlock, avoid disrupting momentum

**Counter-example:** User at week 10, DB Hammer Curls 8kg × 12 (53% toward milestone)
**Action:** Show rotation suggestion - unlock unlikely, variety helps break plateau

### 7.4 Milestone Tracking

**localStorage key:** `build_unlock_progress` (new)

```javascript
{
  "UPPER_B - DB Hammer Curls": {
    milestoneHits: 2,           // Consecutive hits at target
    lastMilestoneDate: "2026-02-20",
    variationComplete: true
  },
  "UPPER_B - Standard DB Curls": {
    milestoneHits: 1,
    lastMilestoneDate: "2026-02-23",
    variationComplete: false    // Need 1 more hit
  }
}
```

**Reset logic:**
- If user fails to hit milestone in next workout → reset `milestoneHits` to 0
- Milestone must be hit **twice consecutively** (not cumulative)

---

## 8. Data Flow & Integration

### 8.1 On Workout Display

```
User opens workout (App.js → showWorkoutDetail)
  ↓
For each exercise:
  ↓
smart-progression.getSuggestion(exerciseKey, history, painHistory)
  ↓
getSuggestion() checks rotation-manager.checkRotationDue(exerciseKey)
  ↓
rotation-manager returns:
  - null (not due yet)
  - { type: 'ROTATION_DUE', suggestedExercise, reason }
  ↓
getSuggestion() returns unified suggestion (Priority 1-6)
  ↓
UI renders performance badge
```

### 8.2 On Rotation Acceptance

```
User clicks "Switch Exercise" button
  ↓
storage.saveExerciseSelection(slotKey, newExercise)
  ↓
rotation-manager.recordRotation(oldExercise, newExercise)
  ↓
Update tenure: { startDate: today, weeksOnExercise: 0 }
  ↓
Unlock system starts tracking new variation milestone
  ↓
UI refreshes via showHomeScreen()
```

### 8.3 On Manual Exercise Change

```
User selects different exercise from dropdown
  ↓
storage.saveExerciseSelection(slotKey, newExercise)
  ↓
rotation-manager detects change (observes tenure update)
  ↓
Reset tenure for new exercise
  ↓
Milestone tracking continues independently
```

### 8.4 Storage Interactions

**Reads:**
- `build_exercise_*` - exercise history for milestone checks
- `build_exercise_selections` - current exercise per slot
- `build_unlocked_exercises` - unlocked exercises list

**Writes:**
- `build_exercise_tenure` - rotation tenure tracking
- `build_unlock_progress` - milestone hit tracking
- `build_exercise_selections` - when user accepts rotation

**No conflicts:** Rotation system reads performance data but doesn't modify it. Unlock/deload/progression systems unaffected.

---

## 9. UI/UX Design

### 9.1 Rotation Suggestion Badge

**Visual style:** Orange warning badge (not red danger)

```html
<div class="performance-badge-container">
  <div class="performance-badge warning">
    ⟳ Try Standard DB Curls for complete bicep coverage (8 weeks on current variation)
    <button onclick="acceptRotation('UPPER_B_SLOT_6', 'Standard DB Curls')">
      Switch Exercise
    </button>
  </div>
</div>
```

**Badge properties:**
- Icon: ⟳ (circular arrows)
- Color: Orange (#f59e0b) with rgba(245, 158, 11, 0.15) background
- Action: One-click "Switch Exercise" button
- Clear reason: "for complete bicep coverage"

### 9.2 Manual Rotation (Existing UI)

**No new UI needed:**
- Exercise selection dropdown already exists
- User clicks exercise name → sees rotation alternatives
- Manual selection triggers same backend flow

### 9.3 Milestone Progress Display

**Show unlock progress in exercise details:**

```
DB Hammer Curls: 15kg × 12 twice ✓
Standard DB Curls: 12kg × 12 (need 15kg × 12 twice)

→ Unlock Barbell Curls: 50% complete
```

### 9.4 Suggestion Frequency

**Timeline:**
- Week 8: First suggestion appears
- User dismisses → suggestion reappears at week 10
- User dismisses again → suggestion reappears at week 12
- After week 12: Stop suggesting (user preference clear)

**Dismissal:** Click × on badge, stores `rotationDismissed: true` in tenure data

---

## 10. Error Handling & Edge Cases

### 10.1 Exercise Removed from Workout

**Problem:** Tenure data becomes stale
**Solution:** Clean up tenure on exercise removal (App.js hook)

### 10.2 Rapid Exercise Switching

**Problem:** User switches A → B → A within 2 weeks
**Solution:** Reset tenure on ANY change. Each switch = new adaptation period

### 10.3 Incomplete Milestone Progress

**Problem:** User on rotation A (milestone incomplete), switches to B
**Solution:**
- Keep A's milestone progress saved (don't reset)
- User can return to A later and complete remaining hits
- Both variations track independently

### 10.4 Unlock While on Rotation B

**Problem:** User completes both milestones while on Standard DB Curls
**Solution:**
- Show unlock achievement notification
- Suggest Barbell Curls as new tier option
- User can accept unlock or stay on current exercise

### 10.5 Rotation During Recovery

**Problem:** Week 8 rotation due, but user has recent pain
**Solution:**
- Pain takes priority (Priority 1 beats Priority 3)
- Rotation suggestion hidden until pain resolved

### 10.6 Null Safety

**Handle gracefully:**
- Missing tenure data → default to 0 weeks
- Exercise not in rotation pools → skip rotation checks
- Corrupted localStorage → fallback to safe defaults
- Missing milestone data → start fresh tracking

---

## 11. Testing Strategy

### 11.1 New Test File

**File:** `tests/test-rotation-system.js`

**Test categories (44 total tests):**

1. **Tenure Tracking (8 tests)**
   - Calculate weeks from first workout
   - Handle exercises with no history (0 weeks)
   - Reset tenure when rotation accepted
   - Date edge cases (same-day workouts, timezone)

2. **Rotation Eligibility (10 tests)**
   - Trigger at 8 weeks minimum
   - Don't trigger before 8 weeks
   - Suppress when user 80%+ toward unlock
   - Don't suppress when user <80% (plateau scenario)
   - Handle exercises without rotation pools
   - Return null for non-rotatable exercises

3. **Unlock Milestone Tracking (12 tests)**
   - Track milestones independently per variation
   - Hit target twice consecutively = complete
   - Reset counter if user misses target
   - Unlock when BOTH variations complete
   - Exercises without rotations use old unlock logic
   - Milestone progress persists across rotations

4. **Smart Progression Integration (8 tests)**
   - Priority 3 placement correct
   - Pain overrides rotation
   - Rotation includes correct exercise + reason
   - No conflicts with weight increase suggestions

5. **Exercise Replacement (6 tests)**
   - Cable Chest Fly → Decline DB Press in UPPER_A
   - EXERCISE_DEFINITIONS has Decline DB Press
   - workouts.js updated correctly
   - No broken references

### 11.2 Test Runner Integration

**Add to test-runner.js:**

```javascript
async runRotationSystem() {
  console.log('\n🔄 RUNNING ROTATION SYSTEM TESTS...\n');
  const loaded = await this.loadScript('./tests/test-rotation-system.js');
  if (loaded) {
    this.results.rotationSystem = window._rotationSystemTestResults;
  }
}
```

### 11.3 Manual Testing Scenarios

**Browser console tests:**

1. Set exercise to 7 weeks ago → verify no rotation
2. Set exercise to 8 weeks ago → verify rotation suggestion appears
3. Accept rotation → verify tenure resets
4. Manually change exercise → verify tenure resets
5. Hit milestone twice → verify variation marked complete
6. Complete both variations → verify unlock triggered
7. Close to unlock (80%+) → verify rotation suppressed
8. Plateau scenario (<80%) → verify rotation shown

---

## 12. Implementation Checklist

### 12.1 Module Creation

- [ ] Create `js/modules/rotation-manager.js`
  - [ ] Tenure tracking methods
  - [ ] Rotation eligibility checks
  - [ ] Unlock proximity detection
  - [ ] Milestone progress tracking

### 12.2 Module Enhancements

- [ ] Enhance `js/modules/exercise-metadata.js`
  - [ ] Add MUSCLE_HEAD_COVERAGE
  - [ ] Add ROTATION_POOLS
  - [ ] Add UNLOCK_MILESTONES
  - [ ] Add SWAP_REASONS.ROTATION_VARIETY

- [ ] Extend `js/modules/smart-progression.js`
  - [ ] Add rotation-manager dependency injection
  - [ ] Insert Priority 3 rotation check
  - [ ] Shift existing priorities down by 1

### 12.3 Workout Changes

- [ ] Update `js/modules/workouts.js`
  - [ ] Replace Cable Chest Fly → Decline DB Press in UPPER_A
  - [ ] Add Decline DB Press to EXERCISE_DEFINITIONS
  - [ ] Verify exercise slot indices

### 12.4 App Integration

- [ ] Update `js/app.js`
  - [ ] Initialize rotation-manager in constructor
  - [ ] Pass rotation-manager to smart-progression
  - [ ] Add cleanup hook for removed exercises

### 12.5 UI Updates

- [ ] Add rotation badge styling to `css/styles.css`
  - [ ] Orange warning badge variant
  - [ ] Rotation icon (⟳) styling
  - [ ] Mobile responsive

- [ ] Add acceptRotation() handler in `js/app.js`
  - [ ] Call storage.saveExerciseSelection()
  - [ ] Call rotation-manager.recordRotation()
  - [ ] Refresh UI via showHomeScreen()

### 12.6 Testing

- [ ] Create `tests/test-rotation-system.js`
  - [ ] Write 44 automated tests
  - [ ] Export results to window._rotationSystemTestResults

- [ ] Update `tests/test-runner.js`
  - [ ] Add runRotationSystem() method
  - [ ] Add to runAll() execution
  - [ ] Add to summary report

- [ ] Manual testing
  - [ ] Test rotation suggestions at 8 weeks
  - [ ] Test unlock proximity suppression
  - [ ] Test milestone tracking across rotations
  - [ ] Test manual exercise changes

### 12.7 Documentation

- [ ] Update docs/smart-progression-quick-reference.md
  - [ ] Document new Priority 3 (rotation)
  - [ ] Document rotation-based unlocks

- [ ] Create docs/rotation-system-usage.md
  - [ ] User guide for rotation system
  - [ ] Milestone tracking explanation
  - [ ] Troubleshooting guide

---

## 13. Success Metrics

**System is successful when:**

1. Users see rotation suggestions at 8-week mark
2. Rotation suggestions disappear when user 80%+ toward unlock
3. Both rotation variations track milestones independently
4. Unlock triggers only after BOTH variations complete
5. Manual exercise changes reset tenure correctly
6. All 44 automated tests pass
7. No conflicts with existing unlock/deload/progression systems
8. Decline DB Press provides lower chest coverage in UPPER_A

---

## 14. Future Enhancements

**Not in scope for v1, consider later:**

1. **Adaptive rotation frequency** - adjust 8-12 weeks based on user response rate
2. **Multi-variation pools** - more than 2 rotations per exercise (e.g., 3-4 curl variations)
3. **Exercise history analytics** - show user which muscle heads they've emphasized over time
4. **Auto-rotation mode** - automatically rotate at 8 weeks (no user confirmation)
5. **Rotation reminders** - notifications when rotation due (if app supports notifications)

---

## 15. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Rotation suggestions confuse users | Medium | Clear messaging: "for complete muscle coverage" + optional dismissal |
| Users rotate too frequently (manual) | Low | Track rotation frequency, no guardrails needed (user autonomy) |
| Unlock system complexity increases | Medium | Comprehensive testing (44 tests), clear documentation |
| localStorage conflicts | High | Use separate keys, defensive null checks, no mutation of existing data |
| Migration issues for existing users | Medium | Graceful degradation - missing tenure = 0 weeks, start fresh |

---

## Appendix A: Muscle Head Reference

**Triceps (3 heads):**
- Lateral head - outer arm
- Long head - inner arm, crosses shoulder joint
- Medial head - deep, under long head

**Biceps brachii (2 heads):**
- Long head - outer arm
- Short head - inner arm

**Additional arm flexors:**
- Brachialis - under biceps, elbow flexion
- Brachioradialis - forearm, thumb-up grip emphasis

**Pectoralis major (3 regions):**
- Clavicular head - upper chest (incline press)
- Sternal head - mid chest (flat press)
- Costal head - lower chest (decline press)

**Deltoids (3 heads):**
- Anterior - front (presses)
- Lateral - side (lateral raises)
- Posterior - rear (face pulls, reverse fly)

**Glutes (3 muscles):**
- Gluteus maximus - hip extension (hip thrust)
- Gluteus medius - hip abduction (leg abduction machine)
- Gluteus minimus - hip abduction (works with medius)

---

## Appendix B: Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-23 | Use Hybrid Architecture (Approach C) | Clean separation, shared metadata, unified UX |
| 2026-02-23 | 8-12 week rotation frequency | Research-backed adaptation period |
| 2026-02-23 | Automatic/proactive suggestions | Better UX than on-demand |
| 2026-02-23 | Rotation-based unlocks (hit milestone twice on each variation) | Proves movement mastery, not just single exercise proficiency |
| 2026-02-23 | Only 2 rotation pools (biceps, triceps) | Keep scope minimal, A/B split handles most coverage |
| 2026-02-23 | Replace Cable Chest Fly → Decline DB Press | Completes chest coverage without rotation complexity |
| 2026-02-23 | Allow manual rotation anytime (Option B) | User autonomy, leverage existing exercise selection UI |
| 2026-02-23 | Suppress rotation when 80%+ toward unlock | Avoid disrupting unlock momentum |
| 2026-02-23 | Reset tenure on ANY exercise change | Switching = new adaptation period |

---

**End of Design Document**
