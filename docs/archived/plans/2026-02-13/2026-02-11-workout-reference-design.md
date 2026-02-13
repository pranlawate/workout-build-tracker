# Workout Reference Feature Design

**Date:** 2026-02-11
**Status:** Ready for Implementation
**Complexity:** Low (~50 lines JS, ~30 lines CSS)

## Problem Statement

Users cannot preview workout definitions without completing workouts to reach them in the rotation. To check what exercises are in "Upper B," users must either:
1. Manually log fake workouts until Upper B appears
2. Clear all data and start over

This is impractical for the production app where users have real workout history.

## Solution

Add a "Workout Reference" section to the Progress screen's Overview tab showing all 4 workouts with expandable exercise lists.

## Design

### UI Location

**Progress Screen → Overview Tab (bottom of existing content)**

```
┌─────────────────────────────────────────┐
│ 🎉 Achievements Gallery                 │  ← Existing
├─────────────────────────────────────────┤
│ 📊 Last 4 Weeks Stats                   │  ← Existing
├─────────────────────────────────────────┤
│ 💪 Top 3 Strength Gains                 │  ← Existing
├─────────────────────────────────────────┤
│ 📋 Workout Reference (NEW)              │
│                                         │
│  [Upper A - Horizontal] ▼               │
│  ├─ 1. DB Flat Bench Press              │
│  │     3 sets × 8-12 reps                │
│  │     💡 Primary: Chest, ...           │
│  ├─ 2. Seated Cable Row                 │
│  │     3 sets × 10-12 reps               │
│  │     💡 Primary: Mid back             │
│  └─ ... (7 total)                       │
│                                         │
│  [Lower A - Bilateral] ▶                │  (collapsed)
│  [Upper B - Vertical] ▶                 │
│  [Lower B - Unilateral] ▶               │
└─────────────────────────────────────────┘
```

### Display Format

**Collapsed state:**
- Workout name with displayName (e.g., "Upper A - Horizontal")
- Expand icon (▶)

**Expanded state:**
- All exercises numbered (1-7)
- Per exercise:
  - Exercise name
  - Sets × Reps/Duration
  - Notes (safety warnings, muscle targets)

**Example:**
```
1. DB Flat Bench Press
   3 sets × 8-12 reps
   💡 Primary: Chest, Secondary: Front delts, triceps

2. Plank
   3 sets × 30-60s
   💡 Core strength for lower back health
```

### Interaction Behavior

- **Accordion pattern:** Only one workout expanded at a time
- **Tap to toggle:** Tap workout header to expand/collapse
- **Session memory:** Remember last expanded workout (sessionStorage)
- **Touch feedback:** Visual highlight on tap

### Data Flow

```
getAllWorkouts() → renderWorkoutReference() → renderWorkoutCard() → renderExerciseList()
    ↓                      ↓                        ↓                       ↓
workouts.js           app.js                  app.js                  app.js
(source of           (section HTML)      (accordion logic)      (exercise items)
 truth)
```

**Key:** Always live data - no caching, reads directly from `workouts.js`

## Implementation

### JavaScript (~50 lines)

**File:** `js/app.js`

**New methods:**

1. `renderWorkoutReference()` - Main section container
2. `renderWorkoutCard(workout, index)` - Individual workout accordion
3. `renderExerciseList(workout)` - Exercise items when expanded
4. `toggleWorkout(index)` - Toggle expand/collapse state

**State:**
- `this.expandedWorkout` - Index of currently expanded workout (0-3, or null)
- Persisted to `sessionStorage.getItem('expandedWorkout')`

**Integration point:**
```javascript
// In showProgressDashboard()
progressContent.innerHTML = `
  ${this.renderAchievementsGallery()}
  ${this.renderSummaryStats(stats)}
  ${this.renderStrengthGains(strengthGains)}
  ${this.renderWorkoutReference()}  // ← Add here
`;
```

### CSS (~30 lines)

**File:** `css/progress-dashboard.css` (or new `workout-reference.css`)

**Key classes:**
- `.workout-reference` - Section container
- `.workout-ref-card` - Individual workout card
- `.workout-ref-header` - Clickable header (with expand icon)
- `.exercise-list` - Exercise list container (when expanded)
- `.exercise-item` - Individual exercise row
- `.exercise-name`, `.exercise-meta`, `.exercise-note` - Exercise details

**Design tokens:**
- Uses existing CSS variables (`--card-bg`, `--border-color`, etc.)
- Touch-friendly tap targets (min 12px padding)
- Mobile-first responsive design

### Error Handling

1. **Import failure:** Graceful fallback if `getAllWorkouts()` fails
2. **Empty data:** Show message "No workouts defined"
3. **Malformed data:** Console warning, skip invalid workouts
4. **Missing fields:** Skip exercises with missing required fields

## Benefits

1. **No test data pollution:** Check workouts without logging fake data
2. **Always current:** Reads live from `workouts.js` - changes reflect immediately
3. **Minimal code:** ~80 lines total (50 JS, 30 CSS)
4. **Reuses infrastructure:** Uses existing Progress screen and tab system
5. **Mobile-optimized:** Touch-friendly accordion, no horizontal scroll

## Testing Checklist

- [ ] All 4 workouts display correctly
- [ ] Accordion toggle works (tap to expand/collapse)
- [ ] Only one workout expanded at a time
- [ ] Session memory persists expanded state
- [ ] Time-based exercises show correct format (no "reps")
- [ ] Exercise notes display properly
- [ ] Mobile responsive (no overflow on small screens)
- [ ] Touch feedback on tap
- [ ] Graceful handling of missing data

## Success Criteria

- User can view all 4 workout definitions without logging fake data
- Exercise details match actual workout screen format
- Smooth, responsive accordion interaction
- Works on mobile devices (primary use case)

## Future Enhancements (Not in scope)

- Search/filter exercises
- Link to Exercise Detail screen
- Show warmups
- Export workout as PDF
