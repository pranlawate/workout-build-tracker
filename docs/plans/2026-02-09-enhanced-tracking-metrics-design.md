# Enhanced Tracking Metrics Design

**Date:** 2026-02-09
**Status:** Approved for implementation

## Overview

Track recovery metrics before each workout to prevent overtraining. Users enter sleep, stress, energy, and soreness data. The app calculates a fatigue score and warns when recovery is poor.

## Problem Statement

**Current System:**
- No pre-workout recovery assessment
- Cannot detect overtraining patterns
- Users train when inadequately recovered
- No data to identify recovery issues

**Consequences:**
- Increased injury risk
- Poor performance
- Accumulated fatigue
- No early warning system

## Solution: Pre-Workout Recovery Check

**New Flow:**
- User clicks "Start Workout"
- Recovery modal appears (once per day)
- User enters 4 recovery metrics
- App calculates fatigue score
- Warning appears if score ≥4
- User chooses: rest, deload, or continue

## Design Decisions

### Modal Timing and Frequency

**When:** Immediately after clicking "Start Workout" on home screen

**Frequency:** Once per day (first workout only)

**Logic:**
```javascript
if (isRecoveryCheckDue()) {
  showRecoveryModal();
} else {
  showWorkoutSelection();
}
```

### Pre-Workout Metrics Modal

**Layout:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💪 Recovery Check

😴 Sleep Last Night
[7] hours (0-12 range)

😰 Stress Level
○ Low   ○ Medium   ○ High

⚡ Energy Level
1 ─────○───── 5

💊 Muscle Soreness
○ None   ○ Mild   ○ Moderate   ○ Severe

[Continue to Workout]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Input Details:**

1. **Sleep Hours**
   - Type: Number input
   - Default: 7
   - Range: 0-12
   - Validation: Integer only

2. **Stress Level**
   - Type: Radio buttons (horizontal)
   - Options: Low | Medium | High
   - Default: Low
   - Layout: 3 buttons, equal width

3. **Energy Level**
   - Type: 5-button scale
   - Options: 1 (very low) to 5 (very high)
   - Default: 3
   - Layout: 5 buttons, grid or horizontal

4. **Muscle Soreness**
   - Type: Radio buttons (horizontal)
   - Options: None | Mild | Moderate | Severe
   - Default: None
   - Layout: 4 buttons, 2×2 grid on mobile

**Button Behavior:**
- All inputs required (enforced with defaults)
- "Continue to Workout" enabled immediately (defaults selected)
- No validation errors possible
- Quick submission: enter sleep → click Continue

### Fatigue Score Calculation

**Formula:**
```
Fatigue Score = Pre-Workout Points + Pain Points
Total Range: 0-9 points
Warning Threshold: ≥4 points
```

**Pre-Workout Metrics Scoring (max 6 points):**

| Metric | Condition | Points |
|--------|-----------|--------|
| Sleep | <6 hours | +2 |
| Sleep | 6-7 hours | +1 |
| Sleep | ≥7 hours | 0 |
| Stress | High | +1 |
| Stress | Medium/Low | 0 |
| Energy | 1-2 | +2 |
| Energy | 3 | +1 |
| Energy | 4-5 | 0 |
| Soreness | Severe | +2 |
| Soreness | Moderate | +1 |
| Soreness | Mild/None | 0 |

**Post-Workout Pain Data (max 3 points):**
- Retrieved from existing pain tracking (post-workout summary)
- If ANY exercise reported with severity ≥ "Moderate": +3 points
- Otherwise: 0 points

**Calculation Timing:**
1. Initial calculation after modal submission (pre-workout points only)
2. Show warning if ≥4 points
3. Recalculate after workout completion (add pain points)
4. Store final score with workout session

**Examples:**

*Low Score (No Warning):*
- Sleep: 8 hours (0 pts)
- Stress: Low (0 pts)
- Energy: 4 (0 pts)
- Soreness: Mild (0 pts)
- **Total: 0 points** → No warning

*Moderate Score (Warning):*
- Sleep: 6 hours (1 pt)
- Stress: High (1 pt)
- Energy: 3 (1 pt)
- Soreness: Moderate (1 pt)
- **Total: 4 points** → Warning appears

*High Score (Strong Warning):*
- Sleep: 5 hours (2 pts)
- Stress: High (1 pt)
- Energy: 2 (2 pts)
- Soreness: Severe (2 pts)
- Pain from last workout: Moderate (3 pts)
- **Total: 10 points** → Warning appears

### Warning Display

**Trigger:** Fatigue score ≥4 immediately after recovery modal submission

**Banner Format:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Fatigue Warning

Your recovery score is 5/9. Consider:
• Take a rest day (recommended)
• Do a lighter deload workout
• Continue if you feel okay

[Dismiss] [Start Deload] [Continue Anyway]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Button Actions:**

1. **Dismiss**
   - Close warning banner
   - Return to home screen
   - No workout started
   - Recovery data saved

2. **Start Deload**
   - Enable deload mode (existing system)
   - Proceed to workout selection
   - Recovery data saved with `deloadChosen: true`

3. **Continue Anyway**
   - Dismiss warning
   - Proceed to normal workout selection
   - Recovery data saved with `warningDismissed: true`

**Styling:**
- Background: `rgba(245, 158, 11, 0.15)` (semi-transparent orange)
- Border: 2px solid `#f59e0b` (warning orange)
- Buttons: 60px height, full-width on mobile
- Text: 16px, clear hierarchy
- Icon: ⚠️ emoji, 24px size

**User Experience:**
- Non-blocking: user always has final decision
- No judgment: app provides information, not orders
- Clear options: three distinct paths forward
- Persistent: warning stays until user acts (no auto-dismiss)

### Data Storage and Persistence

**localStorage Key:** `build_recovery_metrics`

**Data Structure:**
```javascript
[
  {
    date: "2026-02-09",
    sleepHours: 7,
    stressLevel: "Low",        // "Low" | "Medium" | "High"
    energyLevel: 3,             // 1-5
    muscleSoreness: "None",     // "None" | "Mild" | "Moderate" | "Severe"
    fatigueScore: 1,            // 0-9
    preWorkoutScore: 1,         // Pre-workout points only (0-6)
    painScore: 0,               // Pain points only (0-3)
    warningShown: false,        // Was warning displayed?
    warningDismissed: false,    // User clicked "Continue Anyway"?
    deloadChosen: false,        // User clicked "Start Deload"?
    workoutCompleted: true      // Did workout happen?
  }
]
```

**Field Descriptions:**

- `date`: ISO date string (YYYY-MM-DD)
- `sleepHours`: Integer 0-12
- `stressLevel`: Enum string
- `energyLevel`: Integer 1-5
- `muscleSoreness`: Enum string
- `fatigueScore`: Sum of preWorkoutScore + painScore
- `preWorkoutScore`: Calculated from 4 metrics (0-6)
- `painScore`: Retrieved from pain tracking (0-3)
- `warningShown`: Boolean, true if score ≥4
- `warningDismissed`: Boolean, user action tracking
- `deloadChosen`: Boolean, user action tracking
- `workoutCompleted`: Boolean, updated after workout

**Storage Operations:**

1. **Save Initial Entry**
   - When: After recovery modal submission
   - Data: All 4 metrics + calculated preWorkoutScore
   - Fields: `workoutCompleted: false`, `painScore: 0`

2. **Update After Workout**
   - When: Workout completion
   - Update: `workoutCompleted: true`
   - Update: `painScore` from post-workout summary
   - Update: `fatigueScore` (recalculate with pain)

3. **Update After Warning Action**
   - When: User clicks warning button
   - Update: `warningDismissed` or `deloadChosen`
   - Preserve: All other fields unchanged

4. **Retrieve Last 30 Days**
   - When: Trend analysis (future feature)
   - Filter: Entries from last 30 days only
   - Sort: By date descending

5. **Cleanup Old Entries**
   - When: After save (automatic)
   - Delete: Entries older than 90 days
   - Reason: Storage management

**Daily Check Logic:**
```javascript
isRecoveryCheckDue() {
  const entries = getRecoveryMetrics();
  if (entries.length === 0) return true;

  const lastEntry = new Date(entries[entries.length - 1].date);
  const today = new Date().toDateString();
  const lastDate = lastEntry.toDateString();

  return today !== lastDate; // One check per day
}
```

**Integration with Existing Systems:**

1. **Pain Tracking**
   - Source: `build_pain_*` localStorage keys
   - Query: Find pain reports from last workout
   - Logic: If any exercise has severity ≥ "Moderate" → +3 points
   - Timing: After workout completion, before final score save

2. **Deload Manager**
   - Trigger: User clicks "Start Deload" button
   - Action: Call `deloadManager.enableDeload()`
   - Effect: Next workout uses reduced weights
   - Integration: Existing deload system, no changes needed

3. **Workout Session**
   - Update: Set `workoutCompleted: true` when workout ends
   - Link: Store workout ID reference (optional, for future queries)
   - Export: Include recovery data in workout export

### Technical Implementation

**New Files:**
- `css/recovery-modal.css` - Modal and warning styling

**Modified Files:**
- `js/app.js`:
  - Add `showRecoveryModal()` method
  - Add `calculateFatigueScore()` helper
  - Add `showFatigueWarning()` method
  - Modify `handleStartWorkout()` to check `isRecoveryCheckDue()`

**Unchanged Files:**
- `js/modules/storage.js` - Use existing save/retrieve methods
- `js/modules/deload.js` - Use existing deload API
- `js/modules/workouts.js` - No changes needed

**No New Modules Required:**
- Simple enough for app.js
- No complex business logic
- Minimal state management

### User Experience Flow

**Step-by-Step:**

1. User clicks "Start Workout" on home screen
2. App checks `isRecoveryCheckDue()`
3. If due: Recovery modal appears
4. User sees 4 inputs with smart defaults
5. User adjusts values (optional, defaults are pre-selected)
6. User clicks "Continue to Workout"
7. App calculates fatigue score
8. **If score <4:** Proceed to workout selection
9. **If score ≥4:** Warning banner appears
10. User reviews options, chooses action
11. **Dismiss:** Return to home, no workout
12. **Deload:** Enable deload mode, proceed
13. **Continue:** Proceed to normal workout
14. User completes workout
15. Post-workout summary includes pain tracking
16. App updates recovery entry with pain score
17. Final fatigue score saved with workout

**Time Estimates:**

- Recovery check (using defaults): 5 seconds
- Recovery check (adjusting values): 15-30 seconds
- Warning review and decision: 5-10 seconds
- Total overhead: 10-40 seconds per workout

### Mobile Considerations

**Responsive Layout:**

- **Modal width:** 90% on mobile, max 500px on desktop
- **Input sizing:**
  - Number input: 80px width, 50px height
  - Radio buttons: 24x24px, 50px tap target
  - Energy scale buttons: 50x50px each
  - All buttons: 60px height minimum

- **Grid layouts:**
  - Stress: 3 columns (1×3)
  - Energy: 5 columns or 3+2 on narrow screens
  - Soreness: 2×2 grid on mobile, 1×4 on desktop

- **Warning banner:**
  - Full-width on mobile (<768px)
  - Max 600px on desktop
  - Buttons stack vertically on mobile
  - Buttons horizontal on desktop

**Touch Targets:**
- All interactive elements: min 44x44px
- Buttons: 50-60px height
- Radio labels: full-row tap area
- Input labels: clear, 14px minimum

**Accessibility:**
- Labels: Clear association with inputs
- Tab order: Logical top-to-bottom flow
- Focus states: Visible outlines
- Error prevention: No validation needed (defaults valid)

## Success Criteria

**User Experience:**
- Quick completion (<30 seconds average)
- One modal per day (not intrusive)
- Clear warning when fatigued
- Non-blocking (user always decides)
- Smart defaults minimize input

**Technical:**
- Reuse existing deload and pain systems
- No new localStorage keys except recovery data
- Fatigue calculation accurate and consistent
- Mobile responsive (320px+ width)
- No performance issues

**Data Quality:**
- All 4 metrics captured daily
- Pain data integrated from existing system
- Historical data available for trends (future)
- Storage managed (90-day retention)

## Future Enhancements (Out of Scope)

- Fatigue trend charts (7-day, 30-day)
- Correlation analysis (sleep vs. performance)
- Auto-suggest rest based on consecutive high scores
- Weekly summary of recovery patterns
- Smart defaults based on historical patterns

## Non-Goals

- ❌ Replace professional medical advice
- ❌ Mandatory recovery checks (always optional)
- ❌ Complex scoring algorithms (keep simple)
- ❌ Social comparison features
- ❌ Notifications or reminders outside app
