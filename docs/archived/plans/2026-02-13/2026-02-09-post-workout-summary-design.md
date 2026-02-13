# Post-Workout Summary Screen Design

**Date:** 2026-02-09
**Status:** Approved for implementation

## Overview

A single comprehensive screen that combines workout celebration, pain tracking, and weigh-in after workout completion. Replaces separate modals with one unified experience.

## Problem Statement

**Current Flow:**
- Alert → Pain modal → Weigh-in modal → Home
- Three separate interruptions
- Celebrates achievement only with basic alert

**Issues:**
- Too many modal transitions
- No workout statistics shown
- No celebration of progress (PRs, volume gains)
- Duplicate code between modals and summary needs

## Solution: All-in-One Summary Screen

**New Flow:**
- Alert → **Summary Screen** → Home
- One screen with all information and inputs
- Celebrates achievements while collecting data

## Design Decisions

### Screen Structure

The summary screen shows four sections vertically:

1. **Celebration Section** (always visible)
   - Workout name and duration
   - Total volume with comparison
   - New records achieved (weight PRs and rep PRs)

2. **Pain Tracking Section** (inline, expandable)
   - Default: "No pain" pre-selected
   - Expands if user selects "Yes, I had pain"
   - Reuses existing pain flow logic

3. **Weigh-in Section** (conditional)
   - Only appears if weigh-in is due (daily check)
   - Pre-filled input with last weight
   - Optional - can skip

4. **Done Button** (bottom)
   - Saves pain data and weight
   - Returns to home screen

### Statistics Display

**Format:**
```
✅ Upper A Complete!
⏱️ 32 minutes
📊 2,450 kg total volume 📈 +15%
🎉 2 New Records!
  • Goblet Squat: 25kg → 27.5kg
  • Bench Press @ 50kg: 11 → 12 reps
```

**Calculation Rules:**

**Duration:**
- Calculate from workoutSession startTime to endTime
- Display format: "32 minutes" or "1h 5m"

**Total Volume:**
- Sum of (sets × reps × weight) for all exercises
- Compare to last time this workout was done
- Show trend only if >10% difference: 📈 +15% or 📉 -8%

**New Records (PRs):**
- Weight PR: Current weight > max weight ever used for this exercise
- Reps PR: Current reps @ same weight > max reps ever at that weight
- Show max 5 records (if more, truncate with count)
- Display with clear before/after comparison

**Empty States:**
- No records: Show "Keep pushing! 💪"
- First-time workout: No comparison, show raw stats only
- No previous data: Skip comparison arrows

### Pain Tracking Integration

**Initial State (Collapsed):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💪 Pain Check
○ No pain ✓   ○ Yes, I had pain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Expanded State:**
- Exercise selection checkboxes (all exercises from workout)
- "Next" button to proceed
- For each selected exercise: severity + location selection
- Same logic as existing `showPostWorkoutPainModal()`

**Default Behavior:**
- "No pain" pre-selected
- User can leave as-is and click Done
- Saves pain-free status for all exercises

### Weigh-in Integration

**Display Condition:**
- Only show if `bodyWeight.isWeighInDue()` returns true
- Daily frequency (daysSince > 1)

**Format:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚖️ Log Today's Weight
[75.5] kg
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Behavior:**
- Pre-filled with last weight or 57.5kg default
- Input auto-selected for quick entry
- Optional - user can skip
- Validation: 30-200 kg range

### Completion & Validation

**Done Button Action:**
1. Validate pain data (if "Yes" selected, must complete details)
2. Save pain reports (all exercises)
3. Save weight (if weigh-in filled)
4. Navigate to home screen

**Validation Rules:**
- Pain "Yes" but no exercises selected → Alert: "Please select exercises"
- Pain exercises selected but details incomplete → Alert: "Complete pain details"
- Weight out of range → Alert: "Weight must be 30-200 kg"

## Technical Implementation

### Data Structure

```javascript
{
  workoutName: 'Upper A',
  displayName: 'Upper A',
  duration: 1920, // seconds
  totalVolume: 2450, // kg
  volumeComparison: { percent: 15, direction: 'up' } | null,
  newRecords: [
    { exercise: 'Goblet Squat', type: 'weight', from: 25, to: 27.5 },
    { exercise: 'Bench Press', type: 'reps', weight: 50, from: 11, to: 12 }
  ],
  exercises: [...], // for pain tracking
  weighInDue: boolean
}
```

### PR Detection Algorithm

For each exercise in today's workout:

1. Retrieve exercise history (last 8 workouts)
2. **Weight PR Detection:**
   - Find max weight ever used: `maxWeightEver`
   - If `currentMaxWeight > maxWeightEver` → Weight PR
3. **Reps PR Detection:**
   - For each weight used today
   - Find max reps at that weight: `maxRepsAtWeight`
   - If `currentReps > maxRepsAtWeight` → Reps PR
4. Store PRs with comparison data for display

### Code Changes

**New Files:**
- `css/summary-screen.css` - Summary screen styling

**Modified Files:**
- `js/app.js`:
  - Remove `showPostWorkoutPainModal()` call from `completeWorkout()`
  - Add `showWorkoutSummary(workoutData)` method
  - Add `calculateWorkoutStats()` helper
  - Add `detectNewRecords()` helper
  - Inline pain logic (reuse existing functions)
  - Inline weigh-in logic (reuse existing validation)

**Unchanged:**
- `js/modules/body-weight.js` - Use existing `isWeighInDue()` API
- `js/modules/storage.js` - Use existing `savePainReport()` API
- `js/modules/workouts.js` - No changes needed

### State Management

**No Persistence Required:**
- Summary data is transient (calculated on-the-fly)
- Pain and weight data persist via existing methods
- No new localStorage keys needed

**Runtime State:**
- Track pain selection state (yes/no, selected exercises)
- Track pain details completion per exercise
- Track weigh-in input value

## User Experience Flow

**Step-by-Step:**

1. User clicks "Complete Workout"
2. Workout saves (existing logic)
3. App navigates to summary screen
4. User sees celebration stats at top
5. User reviews pain section (default: no pain)
6. If pain: expands section, selects exercises, fills details
7. User sees weigh-in input (if due)
8. User fills weight or skips
9. User clicks "Done"
10. App saves pain/weight data
11. App navigates to home screen

**Time Estimate:**
- No pain, no weigh-in: 5-10 seconds (quick read and Done)
- With pain tracking: 30-60 seconds (select + details)
- With weigh-in: +5 seconds (enter weight)

## Mobile Considerations

**Responsive Layout:**
- Stats: Large text, emoji icons, clear spacing
- Pain buttons: 50px minimum height
- Weigh-in input: Large, easy to tap
- Done button: 60px height, full width
- Scrollable if content exceeds viewport

**Touch Targets:**
- All buttons: minimum 44x44px
- Radio buttons: 24x24px with label padding
- Checkboxes: 24x24px with full-row tap area

## Success Criteria

**User Experience:**
- See workout achievements immediately
- One screen instead of multiple modals
- Quick completion (<10 seconds if no pain/weight)
- Clear visualization of progress (PRs, volume)

**Technical:**
- Reuse existing pain and weigh-in logic
- No new localStorage keys
- PR detection accurate for weight and reps
- Mobile responsive (320px+ width)
- No performance issues with stats calculation

## Future Enhancements (Out of Scope)

- Exercise-by-exercise volume breakdown
- Weekly/monthly progress trends
- Share workout summary (screenshot/export)
- Next workout preview/recommendation
- Rest day calculator

## Non-Goals

- ❌ Editing workout data from summary (use History screen)
- ❌ Social sharing features
- ❌ Advanced analytics (keep summary simple)
- ❌ Persistent summary history (transient only)
