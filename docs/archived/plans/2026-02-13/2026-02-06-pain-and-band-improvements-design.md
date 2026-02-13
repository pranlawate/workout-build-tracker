# Post-Workout Pain Tracking & Band Color Selection Design

**Date:** 2026-02-06
**Status:** Approved for implementation

## Overview

Two UX improvements to reduce friction during workouts:
1. **Pain tracking redesign**: Move from per-exercise prompts to single post-workout modal
2. **Band color selection**: Replace numeric weight input with visual color buttons for band exercises

## Problem Statement

**Current Issues:**
- Pain tracking prompts after every exercise are "getting annoying" and have small UI
- Band exercises (Band Pull-Aparts) show confusing "0 kg" weight input
- No way to track which resistance band is being used

## Design Decisions

### 1. Post-Workout Pain Tracking

**Workflow:**

```
Click "Complete Workout"
  ↓
Pain Check Modal
  "Did you experience any pain during this workout?"
  [No Pain ✓] [Yes, I had pain ⚠️]
  ↓
If "No Pain":
  - Save pain-free status for all exercises
  - Proceed to weigh-in modal
  ↓
If "Yes, I had pain":
  - Show exercise selection screen
  - List all exercises from today (checkboxes for multi-select)
  - User taps painful exercises
  - Click "Next"
  ↓
For each selected exercise:
  - Show exercise name as title
  - Severity buttons: [Minor] [Significant]
  - Location buttons: [Shoulder] [Elbow] [Wrist] [Lower back] [Knee] [Hip] [Other]
  - Auto-advance to next exercise after selecting location
  ↓
Weigh-in Modal (always shown - daily frequency)
```

**UI Components:**
- Modal title: "Workout Complete! 💪"
- Large touch-friendly buttons (minimum 60px height)
- Same location buttons for all exercises (keeps it simple)
- Progress indicator when multiple exercises have pain

**Data Storage:**
- Reuse existing `StorageManager.savePainReport(exerciseKey, hadPain, location, severity)`
- Pain-free exercises: `{ hadPain: false, location: null, severity: null }`
- Painful exercises: `{ hadPain: true, location: 'shoulder', severity: 'minor' }`

**Code Changes:**
- Remove per-exercise pain prompt calls from `handleNextExercise()`
- Add post-workout pain modal triggered by "Complete Workout" button
- New modal HTML in index.html
- New CSS for larger, cleaner modal design

### 2. Band Color Selection

**Detection:**
- Exercise is a "band exercise" if: `startingWeight === 0 && weightIncrement === 0`
- Currently only applies to: Band Pull-Aparts (appears in UPPER_A and UPPER_B)

**UI Changes:**

When logging sets for band exercises:
- **Replace** weight input field with band color buttons
- Label: "Band Resistance"
- Button layout (2 rows):
  ```
  🟡 Light (5kg)    🔴 Medium (10kg)    🔵 Heavy (15kg)
  ⚫ X-Heavy (25kg)  ⚪ Custom
  ```
- Clicking button selects it (visual highlight)
- Custom opens numeric input for non-standard bands

**Color-to-Weight Mapping:**

| Color | Symbol | Weight (kg) | Typical Rating |
|-------|--------|-------------|----------------|
| Yellow | 🟡 | 5 | ~11 lbs |
| Red | 🔴 | 10 | ~22 lbs |
| Blue | 🔵 | 15 | ~33 lbs |
| Black | ⚫ | 25 | ~55 lbs |
| White | ⚪ | 0 or custom | User enters value |

**Data Storage:**
- Reuse existing `weight` field in set data
- Example: `{ reps: 15, weight: 10, rir: 3 }` means "15 reps @ Red/Medium band"
- No new data fields needed

**Display Logic:**

For band exercises only:
- `weight: 5` → display "15 reps @ 🟡 Light"
- `weight: 10` → display "15 reps @ 🔴 Medium"
- `weight: 15` → display "15 reps @ 🔵 Heavy"
- `weight: 25` → display "15 reps @ ⚫ X-Heavy"
- `weight: 0 or other` → display "15 reps @ Custom" or "15 reps @ 8 kg"

For regular exercises:
- `weight: 20` → display "15 reps @ 20 kg" (unchanged)

**Smart Defaults:**
- Pre-fill with last used band color (from exercise history)
- First-time default: Medium (10kg)

**Code Changes:**
- Add band detection helper: `isBandExercise(exercise)`
- Conditional rendering in set logging form
- Color-to-weight and weight-to-color utility functions
- Update exercise history display to show colors for bands

## Non-Goals (Explicitly Decided Against)

- ❌ Smart pain location filtering by exercise type (keep it simple, show all 7 locations)
- ❌ Separate `bandColor` data field (use existing weight field)
- ❌ Pain tracking history in post-workout modal (keep focused on current session)

## Success Criteria

**Pain Tracking:**
- Pain-free workouts: 1 tap to dismiss (vs. N taps for N exercises)
- Pain modal uses full screen space (not tiny input)
- Users can report multiple painful exercises in one flow
- Data compatibility: Existing pain data still works

**Band Colors:**
- Band exercises never show "0 kg" or confusing weight input
- Visual color selection faster than typing numbers
- History shows meaningful band progression (Light → Medium → Heavy)
- Weight-based progression still works (using mapped values)

## Implementation Notes

**Migration:**
- No data migration needed (both features are additive/UI-only)
- Existing pain data and band sets remain valid
- Old "0 kg" band entries display as "Custom"

**Testing:**
- Test pain flow with 0, 1, and multiple painful exercises
- Test band color selection and history display
- Verify weight validation still works for non-band exercises
- Test weigh-in modal appears after pain tracking completes

## File Impact

**Modified:**
- `index.html` - Add post-workout pain modal, band color buttons
- `css/workout-screen.css` - Style new modals and buttons
- `js/app.js` - Remove per-exercise pain calls, add post-workout flow, band UI logic

**No changes:**
- `js/modules/storage.js` - Pain storage API unchanged
- `js/modules/workouts.js` - Exercise definitions unchanged
- Test files - Existing tests remain valid

## Future Enhancements (Out of Scope)

- Band progression recommendations (when to move up)
- Pain pattern analysis (correlate pain with band resistance)
- More band exercises beyond Pull-Aparts
