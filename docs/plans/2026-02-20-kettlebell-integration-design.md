# Kettlebell Exercise Integration Design

**Date:** 2026-02-20
**Status:** Approved
**Priority:** Low

## Overview

Add two kettlebell exercises to existing progression pathways: KB Goblet Squat (beginner-friendly squat alternative) and KB Swings (explosive glute power progression). Integration follows existing equipment-aware architecture.

## Goals

1. **Safety first**: Protect lower back with appropriate unlock requirements for KB Swings
2. **Seamless integration**: Use existing equipment type system (no new infrastructure)
3. **Practical progression**: KB Goblet Squat as regression option, KB Swings as power progression

## Non-Goals

- Not adding kettlebell variations for all exercises (just these 2)
- Not creating new equipment filtering UI (already exists)
- Not modifying unlock system architecture

## Success Criteria

- KB Goblet Squat appears as alternate to Hack Squat (default unlocked)
- KB Swings unlock after completing DB RDL progression safely
- Both exercises show in Browse Progressions with kettlebell equipment badge
- Form cues provide proper safety guidance

---

## Progression Pathway Structure

### KB Goblet Squat

**Location**: LOWER_A_SLOT_1 (Squat Compound)

**Current structure:**
```javascript
easier: ['Leg Press']
current: 'Hack Squat'
harder: ['Barbell Back Squat', 'Front Squat']
alternate: ['Bulgarian Split Squat']
```

**Updated structure:**
```javascript
easier: ['Leg Press']
current: 'Hack Squat'
harder: ['Barbell Back Squat', 'Front Squat']
alternate: ['Bulgarian Split Squat', 'KB Goblet Squat']  // Added
```

**Rationale**: KB Goblet Squat serves as equipment alternative (same difficulty tier as Hack Squat). Smart detection can suggest it when user shows fatigue or needs regression without dropping to Leg Press.

---

### KB Swings

**Location**: LOWER_A_SLOT_3 (Glute Isolation)

**Current structure:**
```javascript
slotName: 'Glute Isolation'
easier: ['Bodyweight Hip Thrust', 'Glute Bridges']
current: 'Hip Thrust'
harder: ['Weighted Hip Thrust', 'Single-leg Hip Thrust']
alternate: ['Cable Pull-Through']
```

**Updated structure:**
```javascript
slotName: 'Glute Isolation'
easier: ['Bodyweight Hip Thrust', 'Glute Bridges']
current: 'Hip Thrust'
harder: ['Weighted Hip Thrust', 'Single-leg Hip Thrust', 'KB Swings']  // Added
alternate: ['Cable Pull-Through']
```

**Rationale**: KB Swings progress beyond weighted hip thrust because they add ballistic/explosive component. Requires completing DB RDL first (proving hip hinge mastery) before unlocking explosive hip hinge variant.

---

## Unlock Requirements and Safety

### KB Goblet Squat

**Complexity Tier**: SIMPLE (default unlocked, no prerequisites)

**Reasoning**:
- Front-loaded squat pattern with kettlebell is beginner-friendly
- Lower complexity than barbell back squat
- Safe regression from Hack Squat
- User has successfully used 12.5kg KB for Hip Thrusts

**No unlock criteria needed** - available immediately when user browses progressions.

---

### KB Swings

**Complexity Tier**: MODERATE

**Unlock Requirements**:
```javascript
{
  strengthMilestone: {
    exercise: 'Hip Thrust',
    threshold: { weight: 40, reps: 12, sets: 3 }
  },
  mobilityCheck: 'Hip hinge pattern proficiency',
  painFree: true,  // No lower back pain in last 4 weeks
  trainingWeeks: 8,
  prerequisiteExercise: 'DB Romanian Deadlift'  // Must complete RDL progression first
}
```

**Safety Rationale**:
- **Strength milestone (40kg Hip Thrust)**: Ensures strong glute foundation before ballistic loading
- **DB RDL prerequisite**: Proves controlled hip hinge mastery before explosive variant
- **Pain-free requirement**: Critical for lower back weakness - no swings if any recent pain
- **8 weeks training**: Adequate time to build neuromuscular patterns on DB RDL
- **Total timeline**: ~16 weeks from starting Hip Thrust (8 weeks Hip Thrust → 8 weeks DB RDL → unlock KB Swings)

**Form cues emphasize**:
- Explosive hip snap (not arm pull)
- Neutral spine maintenance
- Immediate stop if lower back discomfort

---

## Exercise Definitions

### KB Goblet Squat

```javascript
{
  name: 'KB Goblet Squat',
  sets: 3,
  repRange: '8-12',
  rirTarget: '2-3',
  startingWeight: 12,  // 12kg KB (based on user's Hip Thrust experience)
  weightIncrement: 4,   // KB increments (8, 12, 16, 20, 24, 28, 32kg)
  notes: 'Compound | Quads, Glutes',
  machineOk: false
}
```

**Form Cues**:
```javascript
'KB Goblet Squat': {
  setup: [
    'Hold KB at chest height',
    'Elbows pointing down',
    'Feet shoulder-width, toes slightly out'
  ],
  execution: [
    'Slow eccentric - 3s down to parallel',
    'Chest up, elbows between knees',
    'Explosive concentric - 2s up through heels'
  ],
  mistakes: [
    'Rounding back',
    'KB drifting away from chest',
    'Knees caving inward'
  ]
}
```

---

### KB Swings

```javascript
{
  name: 'KB Swings',
  sets: 3,
  repRange: '15-20',  // Higher reps for ballistic work
  rirTarget: '2-3',
  startingWeight: 12,  // Start conservative
  weightIncrement: 4,
  notes: 'Compound | Glutes, Hamstrings | Ballistic hip power',
  machineOk: false
}
```

**Form Cues**:
```javascript
'KB Swings': {
  setup: [
    'KB on floor ahead',
    'Hip-width stance',
    'Hinge to grip KB with both hands'
  ],
  execution: [
    'Explosive hip snap drives KB up',
    'Arms stay straight - hips do the work',
    'Controlled eccentric - let KB swing back between legs'
  ],
  mistakes: [
    'Squatting instead of hinging',
    'Pulling with arms instead of hip snap',
    'Rounding lower back - STOP IMMEDIATELY if this occurs'
  ]
}
```

---

## Implementation Summary

### Files to Modify

1. **progression-pathways.js**
   - Add 'KB Goblet Squat' to LOWER_A_SLOT_1 alternate array
   - Add 'KB Swings' to LOWER_A_SLOT_3 harder array

2. **equipment-profiles.js**
   - Add equipment requirements:
     ```javascript
     'KB Goblet Squat': ['kettlebells'],
     'KB Swings': ['kettlebells']
     ```

3. **complexity-tiers.js**
   - Add 'KB Goblet Squat': COMPLEXITY_TIERS.SIMPLE
   - Add 'KB Swings': COMPLEXITY_TIERS.MODERATE

4. **unlock-criteria.js**
   - Add KB Swings unlock requirements (strength milestone, prerequisite exercise, pain-free, 8 weeks)

5. **form-cues.js**
   - Add form cues for both exercises (setup, execution, mistakes)

6. **workouts.js** (conditional)
   - Exercise definitions available when user unlocks/selects them
   - Not in default workouts, only via progressions

### Edge Cases

**User doesn't have kettlebells:**
- Equipment filtering in Browse Progressions will hide these exercises
- No impact on existing workouts

**User unlocks KB Swings but RDL removed from workouts:**
- Unlock based on historical completion, not current workout presence
- Once unlocked, stays unlocked (stored in localStorage)

**Different KB sizes at gym:**
- 12kg starting weight works for most gym KB sets (8, 12, 16, 20, 24, 28, 32kg)
- Users can adjust if gym has different increments

---

## Testing Considerations

1. **Unlock flow**: Verify KB Swings unlock after meeting all criteria (strength, RDL completion, pain-free, 8 weeks)
2. **Equipment filtering**: Confirm kettlebell exercises hidden when "kettlebells" not selected in equipment profile
3. **Progression UI**: Check both exercises appear in Browse Progressions with kettlebell badge
4. **Form cues**: Verify form guidance displays correctly for both exercises
5. **Safety warnings**: Ensure KB Swings show critical lower back safety notes

---

## Future Considerations

If adding more kettlebell exercises later:
- Turkish Get-Up (full body, complex tier)
- KB Clean & Press (explosive compound)
- Single-arm KB variations

Current architecture supports adding these without structural changes.
