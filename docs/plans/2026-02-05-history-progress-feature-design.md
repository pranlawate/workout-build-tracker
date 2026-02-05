# History & Progress Feature Design

**Date:** 2026-02-05
**Status:** Approved
**Author:** Claude (with user approval)

## Overview

Complete workout history and progress tracking system with visualization, data management (edit/delete), and export/import functionality.

## Design Decisions

### Scope
**Complete Package** - All features in one implementation:
- History viewing (list and detail views)
- Progress charts (visual representation)
- Edit/Delete entries (data correction)
- Export/Import (data portability)

### Storage Architecture
**localStorage** - Maintaining zero-backend philosophy:
- ✅ Already proven in app (8 workouts × ~26 exercises = ~200 entries max)
- ✅ Offline-first PWA compatibility
- ✅ No server costs, instant access
- ✅ Export/import provides data portability
- ⚠️ Device-specific (solved by export/import)

### Visualization Technology
**Vanilla JS + Canvas** - Zero dependencies:
- ✅ Maintains project philosophy (no external libraries)
- ✅ Lightweight, fast rendering
- ✅ Full control over styling (matches cyan theme)
- 📊 Simple line chart showing weight progression over time

### Deployment
**GitHub Pages** - Free PWA hosting:
- ✅ HTTPS (required for PWA)
- ✅ Service Worker support
- ✅ Works on Android (add to home screen)
- ✅ Offline mode with localStorage persistence

## Architecture

### Screen Structure

```
Home Screen
├── [📊 History] → History List Screen
│   └── [Exercise Card] → Exercise Detail Screen
│       ├── Canvas Chart (weight over time)
│       ├── Workout History List
│       │   ├── [Edit] → Edit Modal
│       │   └── [Delete] → Confirm Dialog
│       └── [← Back] → History List
└── [⚙️ Settings] → Settings Modal
    └── [Export/Import] → Export/Import UI
```

### Three New Screens

#### 1. History List Screen
**Purpose:** Overview of all exercises with history data

**Layout:**
- Header: "📊 Workout History" + back button
- Search/filter bar (optional future enhancement)
- Exercise cards grouped by workout type
- Each card shows:
  - Exercise name
  - Last workout date (e.g., "3 days ago")
  - Last weight used (e.g., "20kg")
  - Tap → opens Exercise Detail Screen

**Data Loading:**
- Scan localStorage for all `exercise-history:*` keys
- Parse exercise names from keys
- Get last entry from each history array
- Sort by last workout date (recent first)

#### 2. Exercise Detail Screen
**Purpose:** Individual exercise history with chart and CRUD operations

**Layout:**
- Header: Exercise name + back button
- Canvas chart section (200px height):
  - X-axis: Workout dates (last 8 sessions)
  - Y-axis: Weight in kg
  - Line connecting data points
  - Dots at each data point
  - Grid lines for readability
- History list section:
  - Each workout entry shows:
    - Date (e.g., "Feb 5, 2026 - 3 days ago")
    - Sets summary (e.g., "3 sets: 20kg × 10,11,12 @ RIR 2,2,3")
    - Edit button (✏️)
    - Delete button (🗑️)

**Chart Implementation (Canvas):**
```javascript
// Pseudo-code structure
drawChart(history, canvas) {
  // 1. Calculate scales (min/max weight, date range)
  // 2. Draw grid lines and axes
  // 3. Draw line connecting points
  // 4. Draw dots at data points
  // 5. Add labels (dates on X, weights on Y)
}
```

#### 3. Export/Import Modal
**Purpose:** Data backup and restoration

**Export:**
- Button: "📤 Export All Data"
- Downloads `workout-data-YYYY-MM-DD.json`
- Contains:
  - All exercise history
  - Rotation state
  - Deload state
  - Metadata (export date, version)

**Import:**
- Button: "📥 Import Data"
- File picker (accepts .json)
- Validation:
  - Check JSON structure
  - Verify data integrity
  - Show summary before import
- Confirmation dialog with data preview
- Merge strategy: Replace existing data

**Data Summary Display:**
```
Total Exercises: 26
Total Workouts: 45
Date Range: Jan 15 - Feb 5
Storage Size: 12KB
```

### Navigation Flow

```
Home → [📊 History] → History List
                      └→ [Exercise Card] → Exercise Detail
                                          ├→ [Edit] → Edit Modal → Save → Detail
                                          ├→ [Delete] → Confirm → Detail (refreshed)
                                          └→ [← Back] → History List

Home → [⚙️ Settings] → Settings Modal
                       └→ Export/Import Section
                          ├→ [📤 Export] → Download JSON
                          └→ [📥 Import] → File Picker → Confirm → Home (data imported)
```

### Data Structures

#### Exercise History (unchanged)
```javascript
// localStorage key: exercise-history:WORKOUT_NAME - EXERCISE_NAME
[
  {
    date: "2026-02-05T10:30:00.000Z",
    sets: [
      { weight: 20, reps: 10, rir: 2 },
      { weight: 20, reps: 11, rir: 2 },
      { weight: 20, reps: 12, rir: 3 }
    ]
  },
  // ... up to 8 entries
]
```

#### Export Format
```javascript
{
  version: "1.0",
  exportDate: "2026-02-05T15:30:00.000Z",
  exerciseHistory: {
    "UPPER_A - Goblet Squat": [...],
    "UPPER_A - Dumbbell Bench Press": [...],
    // ... all exercises
  },
  rotation: {
    currentWorkout: "UPPER_B",
    lastDate: "2026-02-04T10:00:00.000Z",
    cycleCount: 5,
    currentStreak: 5
  },
  deloadState: {
    active: false,
    lastDeloadDate: null,
    deloadType: null
  }
}
```

## Implementation Components

### New Files

**JavaScript:**
- `src/js/screens/history-list.js` - History List Screen logic
- `src/js/screens/exercise-detail.js` - Exercise Detail Screen logic
- `src/js/components/progress-chart.js` - Canvas chart component
- `src/js/utils/export-import.js` - Data export/import utilities

**CSS:**
- `src/css/history-screen.css` - History List styles
- `src/css/exercise-detail.css` - Exercise Detail styles
- `src/css/progress-chart.css` - Chart container styles

**HTML:**
- Add screens to `src/index.html`:
  - `#history-screen`
  - `#exercise-detail-screen`
  - Update settings modal with export/import UI

### Modified Files

**app.js:**
- Add screen navigation methods:
  - `showHistoryScreen()`
  - `showExerciseDetailScreen(exerciseKey)`
- Wire up History and Settings buttons

**index.html:**
- Add new screen containers
- Update settings modal

## User Experience

### History Viewing
1. Tap "📊 History" on home screen
2. See list of all exercises with last workout info
3. Tap exercise to see detailed history
4. View chart showing progression over time
5. Scroll through workout entries

### Editing Entry
1. From Exercise Detail, tap ✏️ on a workout entry
2. Modal opens with editable fields (weight, reps, RIR for each set)
3. Modify values
4. Tap "Save" → updates localStorage
5. Chart and list refresh automatically

### Deleting Entry
1. From Exercise Detail, tap 🗑️ on a workout entry
2. Confirmation dialog: "Delete workout from Feb 5? This cannot be undone."
3. Tap "Delete" → removes from localStorage
4. Chart and list refresh automatically

### Export Data
1. Tap ⚙️ Settings on home screen
2. Tap "📤 Export All Data"
3. File downloads: `workout-data-2026-02-05.json`
4. Success toast: "✅ Data exported successfully"

### Import Data
1. Tap ⚙️ Settings on home screen
2. Tap "📥 Import Data"
3. File picker opens
4. Select JSON file
5. Preview modal shows:
   - Data summary (exercises, workouts, date range)
   - Warning: "This will replace all existing data"
6. Tap "Import" → data loads into localStorage
7. Success message → returns to home screen

## Technical Details

### Canvas Chart Rendering
```javascript
class ProgressChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
  }

  draw(history) {
    // Extract weights and dates
    const data = history.map(entry => ({
      date: new Date(entry.date),
      weight: entry.sets[0]?.weight || 0 // Use first set weight
    }));

    // Calculate scales
    const { minWeight, maxWeight } = this.getWeightRange(data);
    const padding = 40;
    const width = this.canvas.width - 2 * padding;
    const height = this.canvas.height - 2 * padding;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid and axes
    this.drawGrid(padding, width, height, minWeight, maxWeight);

    // Draw line chart
    this.drawLine(data, padding, width, height, minWeight, maxWeight);

    // Draw data points
    this.drawPoints(data, padding, width, height, minWeight, maxWeight);
  }

  // ... helper methods
}
```

### Export/Import Validation
```javascript
function validateImportData(jsonData) {
  // Check structure
  if (!jsonData.version || !jsonData.exerciseHistory) {
    throw new Error('Invalid data format');
  }

  // Validate exercise history
  for (const [key, history] of Object.entries(jsonData.exerciseHistory)) {
    if (!Array.isArray(history)) {
      throw new Error(`Invalid history for ${key}`);
    }
    for (const entry of history) {
      if (!entry.date || !Array.isArray(entry.sets)) {
        throw new Error(`Invalid entry in ${key}`);
      }
    }
  }

  return true;
}
```

## Error Handling

**Edit/Delete Operations:**
- Validate input before saving
- Show error toasts for invalid data
- Refresh UI only on successful save

**Export:**
- Catch JSON stringify errors
- Show error if storage quota exceeded during prep
- Fallback: Export partial data

**Import:**
- Validate JSON structure before import
- Show detailed error messages
- Never overwrite data on validation failure
- Backup current data before import (in memory)

**Chart Rendering:**
- Handle empty history (show "No data" message)
- Handle single data point (show dot, no line)
- Handle canvas context errors gracefully

## Testing Strategy

**Manual Testing Checklist:**
1. View history with 0 exercises
2. View history with 1 exercise
3. View history with all 26 exercises
4. Edit entry with valid data
5. Edit entry with invalid data (negative weight, etc.)
6. Delete entry from middle of history
7. Delete only entry (empty history)
8. Export data with full history
9. Export data with empty history
10. Import valid JSON file
11. Import invalid JSON file
12. Chart renders with 1 data point
13. Chart renders with 8 data points
14. Chart handles weight fluctuations correctly

## Performance Considerations

**History List:**
- Load on demand (don't parse all history upfront)
- Lazy load exercise cards as user scrolls
- Cache parsed data in memory during session

**Chart Rendering:**
- Canvas size: 400×200px (retina: 800×400)
- Limit to last 8 workouts (already enforced by storage)
- Debounce resize events

**Export/Import:**
- Stream large JSON files (not applicable, data is small)
- Show progress indicator for import validation
- Async file reading with web workers (future enhancement)

## Future Enhancements (Out of Scope)

- Progress photos
- Body weight tracking
- Volume calculations (sets × reps × weight)
- Personal records (PRs)
- Advanced charts (volume over time, strength ratios)
- Cloud sync (requires backend)
- Social sharing

## Success Criteria

✅ Users can view complete workout history
✅ Users can see visual progress via charts
✅ Users can edit incorrect entries
✅ Users can delete bad data
✅ Users can backup data via export
✅ Users can restore data via import
✅ Zero external dependencies maintained
✅ Works offline (PWA)
✅ Works on Android via GitHub Pages

---

**Next Steps:**
1. Create implementation plan with task breakdown
2. Implement using subagent-driven development
3. Manual testing with checklist
4. Documentation updates (CHANGELOG, README)
5. Deployment to GitHub Pages
