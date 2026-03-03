# Rest Time Display Design

**Date:** 2026-03-03
**Status:** Approved
**Author:** User & Claude Code

## Problem Statement

The workout screen displays RIR (Reps in Reserve) target for every exercise. Since RIR remains constant at 2-3 across all exercises, this display provides no actionable information. Users need rest time recommendations to optimize recovery between sets.

## Solution

Replace RIR display with rest time recommendations based on exercise intensity and muscle groups involved.

## Design

### Display Format

**Current:**
```
3 sets × 8-12 reps @ RIR 2-3
```

**New:**
```
3 sets × 8-12 reps • 3 min rest
```

The bullet separator (•) maintains clean, readable formatting.

### Rest Time Categories

Rest times derive from three factors: muscle groups involved, movement complexity, and loading potential.

**3 Minutes - Heavy Compounds**
Multi-joint movements with large muscle groups and heavy loading:
- Upper: DB Flat Bench Press, Seated Cable Row, T-Bar Row, Lat Pulldown, DB Shoulder Press, Chest-Supported Row, Incline DB Press
- Lower: Hack Squat, Leg Press, DB Romanian Deadlift

**2 Minutes - Medium Intensity**
Single muscle group focus or lighter compounds:
- Upper: Decline DB Press, Reverse Fly, DB Hammer Curls
- Lower: Hip Thrust, Leg Extension, Leg Curl, Leg Abduction, Leg Adduction

**1-2 Minutes - Light Isolations**
Small muscle groups with higher rep ranges:
- DB Lateral Raises, Face Pulls, Tricep Pushdowns, Standing Calf Raise, Seated Calf Raise, 45° Hyperextension

**1 Minute - Core/Bodyweight**
Bodyweight movements with quick recovery:
- Plank, Side Plank, Dead Bug

### Data Structure

Add `restMinutes` field to each exercise definition in `workouts.js`:

```javascript
{
  name: 'DB Flat Bench Press',
  sets: 3,
  repRange: '8-12',
  rirTarget: '2-3',
  restMinutes: 3,  // NEW
  startingWeight: 7.5,
  weightIncrement: 2.5,
  notes: 'Compound | Chest, Front Delts, Triceps',
  machineOk: true
}
```

This approach:
- Makes rest time explicit and adjustable per exercise
- Follows existing patterns in the codebase
- Requires no new modules or lookup logic

### Implementation

**Files Modified:**

1. **`js/modules/workouts.js`**
   - Add `restMinutes` field to all 27 exercises across 4 workouts

2. **`js/app.js`**
   - Modify `formatExerciseMeta()` function:
     - Remove RIR from display string
     - Add rest time: `• ${exercise.restMinutes} min rest`

3. **`sw.js`**
   - Bump cache version: v104 → v105

**No database changes. No breaking changes. No new files.**

## Benefits

1. **Actionable guidance** - Users see recommended rest between sets
2. **Optimized recovery** - Adequate rest for heavy compounds, efficient rest for isolations
3. **Cleaner UI** - Removes redundant RIR display
4. **Science-based** - Rest times match exercise intensity and muscle group involvement

## Testing

Verify on all 4 workouts:
- UPPER_A: 7 exercises display correct rest times
- UPPER_B: 7 exercises display correct rest times
- LOWER_A: 6 exercises display correct rest times
- LOWER_B: 7 exercises display correct rest times

## Future Considerations

Rest times remain fixed. If users need adjustable rest (e.g., during deload), this could become user-configurable in a future update.
