# Exercise History Charts Design

**Date:** 2026-02-09
**Status:** Approved for implementation

## Overview

Add progress badges and per-exercise export to the existing Exercise History screen. Users can see workout quality at a glance and export individual exercise data.

## Problem Statement

**Current System:**
- Exercise history shows chart and session list
- No visual indication of session quality
- Cannot tell if progression is on track
- No way to export single exercise data
- Must review each entry to understand trends

**Consequences:**
- Hard to spot performance issues quickly
- Cannot identify deload or pain sessions
- Miss opportunities for progression
- Difficult to share or analyze specific exercises

## Solution: Enhanced History View

**New Features:**
1. Progress badges on history entries (6 badge types)
2. Per-exercise export button (JSON download)

**Existing (Already Implemented):**
- Canvas chart showing weight over time
- History list with dates and sets/reps/RIR
- Edit/Delete functionality
- ProgressChart component
- ExerciseDetailScreen

## Badge System Design

### Badge Types and Priority

Show max 2 badges per entry, sorted by priority:

| Priority | Badge | Meaning | Source |
|----------|-------|---------|--------|
| 1 | 🔴 Performance Alert | Weight/rep regression | PerformanceAnalyzer |
| 2 | 🟡 Form breakdown | Intra-set variance >50% | PerformanceAnalyzer |
| 3 | ⚡ Deload Session | Intentional recovery | DeloadManager state |
| 4 | 🩹 Pain Reported | Pain tracked for exercise | Pain localStorage |
| 5 | 🟢 Ready to progress | Hit target reps/RIR | getProgressionStatus() |
| 6 | 🔨 Building reps | Working toward targets | getProgressionStatus() |

### Badge Display Rules

**Priority logic:**
- Performance issues (🔴🟡) always shown if present
- Pain/deload suppress progression badges (issues > good news)
- Max 2 badges per entry prevents clutter
- If no issues, show progression status

**Visual design:**
- Inline with history entry
- 14px font size
- Compact spacing
- No tap interaction (display only)

### Badge Calculation Logic

```javascript
getSessionBadges(entry, exerciseKey) {
  const badges = [];

  // 1. Check performance (highest priority)
  const perf = performanceAnalyzer.analyzeExercisePerformance(exerciseKey, entry.sets);
  if (perf.status === 'alert') {
    badges.push({ icon: '🔴', text: perf.message, priority: 1 });
  }
  if (perf.status === 'warning') {
    badges.push({ icon: '🟡', text: perf.message, priority: 2 });
  }

  // 2. Check deload status
  if (wasDeloadActive(entry.date)) {
    badges.push({ icon: '⚡', text: 'Deload week', priority: 3 });
  }

  // 3. Check pain reports
  const painKey = `build_pain_${exerciseKey}`;
  const painData = JSON.parse(localStorage.getItem(painKey) || '[]');
  const hadPain = painData.some(p => p.date === entry.date);
  if (hadPain) {
    badges.push({ icon: '🩹', text: 'Pain reported', priority: 4 });
  }

  // 4. Progression status (only if no issues)
  if (badges.length === 0) {
    const status = getProgressionStatus(entry);
    if (status.readyToProgress) {
      badges.push({ icon: '🟢', text: 'Ready to progress', priority: 5 });
    } else {
      badges.push({ icon: '🔨', text: 'Building reps', priority: 6 });
    }
  }

  // Return top 2 badges by priority
  return badges.sort((a, b) => a.priority - b.priority).slice(0, 2);
}
```

### Data Source Details

**Performance Analysis:**
- Source: `PerformanceAnalyzer.analyzeExercisePerformance(exerciseKey, sets)`
- Returns: `{ status: 'good'|'warning'|'alert', message: string }`
- Alert: Weight regression, 25%+ rep drops
- Warning: Form breakdown (intra-set variance >50%)

**Deload Status:**
- Source: `DeloadManager` state on that date
- Check: `build_workout_rotation` localStorage for historical deload state
- Note: Current implementation only tracks active deload, may need historical flag

**Pain Reports:**
- Source: `build_pain_${exerciseKey}` localStorage
- Format: `[{ date, severity, location }]`
- Check: Any entry matching workout date

**Progression Status:**
- Source: `getProgressionStatus()` from progression.js
- Logic: Ready = hit target reps at RIR 2-3, Building = still working toward target
- Returns: `{ readyToProgress: boolean }`

## Per-Exercise Export Design

### Export Button Placement

Add to ExerciseDetailScreen below the chart:

```
┌─────────────────────────────────────┐
│ ← Goblet Squat History         ⚙️  │
├─────────────────────────────────────┤
│ [Progress Chart]                    │
│                                     │
│ Recent Workouts:                    │
│ [History entries with badges]       │
│                                     │
│ [📤 Export Data]                    │
└─────────────────────────────────────┘
```

### Export Data Format

**File naming:** `exercise-[exercise-name]-[date].json`
Example: `exercise-goblet-squat-2026-02-09.json`

**JSON structure:**
```json
{
  "exercise": "Upper A - Goblet Squat",
  "exportDate": "2026-02-09T14:30:00Z",
  "totalSessions": 8,
  "dateRange": {
    "first": "2026-01-15",
    "last": "2026-02-05"
  },
  "history": [
    {
      "date": "2026-02-05",
      "sets": [
        { "weight": 20, "reps": 10, "rir": 2 },
        { "weight": 20, "reps": 11, "rir": 2 },
        { "weight": 20, "reps": 12, "rir": 3 }
      ]
    }
  ]
}
```

### Implementation Approach

**New method in ExerciseDetailScreen:**
```javascript
exportExercise(exerciseKey) {
  const history = this.storage.getExerciseHistory(exerciseKey);
  const [, exerciseName] = exerciseKey.split(' - ');

  const exportData = {
    exercise: exerciseKey,
    exportDate: new Date().toISOString(),
    totalSessions: history.length,
    dateRange: {
      first: history[0]?.date || null,
      last: history[history.length - 1]?.date || null
    },
    history: history
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)],
    { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `exercise-${exerciseName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
```

**HTML addition:**
```html
<button id="export-exercise-btn" class="btn btn-secondary">
  📤 Export Data
</button>
```

**Event listener:**
```javascript
document.getElementById('export-exercise-btn')
  .addEventListener('click', () => this.exportExercise(this.currentExerciseKey));
```

## Technical Implementation

### Files Modified

**js/screens/exercise-detail.js:**
- Add `getSessionBadges(entry, exerciseKey)` method
- Update `renderHistoryEntry(entry, index)` to include badge HTML
- Add `exportExercise(exerciseKey)` method
- Add export button to render method
- Add event listener for export button

**No new files needed.**

### Integration Points

**Existing modules used:**
- PerformanceAnalyzer (already injected)
- progression.js (import `getProgressionStatus`)
- StorageManager (already available)
- DeloadManager (access via app.js if needed)

**localStorage keys accessed:**
- `build_pain_${exerciseKey}` - pain reports
- `build_workout_rotation` - deload state (historical check needed)

### HTML Structure Changes

**Badge display in history entry:**
```html
<div class="history-entry" data-index="${index}">
  <div class="history-entry-header">
    <span class="history-date">📅 ${dateText}</span>
    <div class="history-actions">
      <button class="icon-btn edit-entry-btn">✏️</button>
      <button class="icon-btn delete-entry-btn">🗑️</button>
    </div>
  </div>
  <div class="history-sets">${setsText}</div>
  ${badges.length > 0 ? `
    <div class="history-badges">
      ${badges.map(b => `<span class="badge">${b.icon} ${b.text}</span>`).join(' ')}
    </div>
  ` : ''}
</div>
```

**CSS additions needed:**
```css
.history-badges {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.history-badges .badge {
  font-size: 14px;
  padding: 4px 8px;
  background: var(--color-surface);
  border-radius: 4px;
}
```

## Mobile Considerations

**Badge display:**
- Wrap to new line if needed (flex-wrap)
- 14px font readable on small screens
- No touch targets (display only)
- Compact padding (4px vertical)

**Export button:**
- Full width on mobile
- 50px min height (touch-friendly)
- Clear icon (📤) for recognition
- Placed after history list (logical flow)

## Success Criteria

**User Experience:**
- Quickly identify problem sessions (🔴🟡)
- See deload/pain context (⚡🩹)
- Understand progression status (🟢🔨)
- Export individual exercise data
- No performance degradation

**Technical:**
- Reuse existing modules (no new dependencies)
- Badge calculation <10ms per entry
- Export works offline (no network needed)
- Mobile responsive (320px+ width)
- No console errors

**Data Quality:**
- Badge logic matches existing analyzer rules
- Export JSON valid and complete
- Historical deload state retrievable
- Pain data lookup accurate

## Edge Cases and Error Handling

**Badge calculation:**
- Handle missing history gracefully
- Null-safe for performance analyzer
- Default to "Building reps" if no data
- Max 2 badges enforced

**Export:**
- Handle empty history (valid JSON, empty array)
- Sanitize exercise names for filenames
- Browser download permission handling
- Works in all modern browsers

**Performance:**
- Badge calculation cached per render
- No unnecessary re-calculations
- Minimal DOM updates

## Future Enhancements (Out of Scope)

- Historical deload state tracking (currently only tracks active deload)
- Badge filtering (show only sessions with issues)
- CSV export option
- Import exercise data
- Share via URL/clipboard

## Non-Goals

- ❌ Change existing chart or history list
- ❌ Add new localStorage keys
- ❌ Modify PerformanceAnalyzer logic
- ❌ Add badge explanations modal
- ❌ Make badges interactive/clickable
