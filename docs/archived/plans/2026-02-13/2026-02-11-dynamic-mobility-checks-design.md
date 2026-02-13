# Dynamic Mobility Checks Design

**Date:** 2026-02-11
**Feature:** Self-learning mobility assessment system
**Status:** Design Complete - Ready for Implementation

## Problem Statement

Current mobility checks are hardcoded for 3 exercises. The system cannot adapt as the user overcomes limitations or develops new weaknesses. This creates two problems:

1. Checks persist after the user has proven competent form
2. New mobility issues go undetected until manually added

## Solution Overview

Build a dynamic system that learns from performance and pain patterns. The system tracks active limitations, triggers mobility checks when regression + pain occur together, and removes exercises from limitation categories after proven recovery.

## Core Principles

**Conservative Detection:** Trigger checks only when both performance drops 25%+ AND pain appears 2+ times in 4 workouts. Avoid false alarms.

**Graduation via Evidence:** Stop checks when user achieves 3 consecutive "Yes" responses AND performance stabilizes for 2+ sessions. Require proof of recovery.

**No Dead Code:** Active limitations live in localStorage, not source code. Categories disappear when empty. The system adapts to the user.

## System Architecture

### Three New Components

**1. MobilityCheckAnalyzer** (`js/modules/mobility-check-analyzer.js`)
- Reads exercise history and pain data (read-only pattern)
- Determines which exercises need checks shown
- Manages graduation from limitation categories
- Returns check configuration or null

**2. Mobility Patterns Registry** (`js/modules/mobility-patterns.js`)
- Maps exercises to movement patterns (vertical_push, hip_hinge, etc.)
- Defines mobility questions for each pattern
- Specifies default limitations (user's starting weaknesses)
- Provides pattern lookup by exercise name

**3. Enhanced showMobilityCheckIfNeeded()** (modify `js/app.js`)
- Calls analyzer instead of using hardcoded checks
- Shows modal only when analyzer returns check config
- Tracks progress toward graduation
- Removes "Not Sure" button (binary Yes/No only)

### Data Flow

```
User completes exercise
  ↓
Analyzer checks triggers:
  - Performance dropped 25%+? (weight OR reps)
  - Pain reported 2+ times in last 4 workouts?
  - Exercise has mobility check mapped?
  ↓
All YES → Show check
Any NO → Skip check
```

## Movement Pattern Mapping

Exercises group by biomechanical similarity, not muscle groups. Movement patterns predict mobility needs accurately.

### Pattern Categories

**Upper Body:**
- `vertical_push`: DB Shoulder Press
- `vertical_pull`: Lat Pulldown, Face Pulls
- `horizontal_push`: DB Flat Bench Press, Cable Chest Fly, Incline DB Press
- `horizontal_pull`: Seated Cable Row, T-Bar Row, Chest-Supported Row

**Lower Body:**
- `squat_pattern`: Hack Squat, DB Goblet Squat, Leg Extension
- `hip_hinge`: DB Romanian Deadlift, 45° Hyperextension
- `single_leg`: Leg Abduction, Hip Thrust

**Specialized (User's Noted Limitations):**
- `lower_back_sensitive`: 45° Hyperextension, DB Romanian Deadlift, Hack Squat
- `shoulder_stability`: DB Shoulder Press, Face Pulls, Reverse Fly, Band Pull-Aparts

**Accessories:**
- `calf_work`: Standing Calf Raise, Seated Calf Raise
- `core_stability`: Plank, Dead Bug, Side Plank

### Multiple Pattern Handling

Some exercises appear in multiple patterns (45° Hyperextension is both `hip_hinge` AND `lower_back_sensitive`). This is intentional.

**Priority order:**
1. Active limitation categories (highest priority)
2. Primary movement pattern
3. Never show multiple checks per exercise per workout

## Mobility Check Definitions

Each pattern specifies:
- **question:** What to ask the user
- **help:** Explanation of correct form
- **criteriaKey:** localStorage tracking identifier

### Example Checks

**vertical_push:**
- Question: "Could you press overhead without back arching today?"
- Help: "Ribs should stay down, no excessive lower back arch. If arching, work on thoracic mobility."

**lower_back_sensitive:**
- Question: "Did you maintain neutral spine throughout the movement?"
- Help: "No arching or rounding. Any deviation with your back history = stop and deload."

**squat_pattern:**
- Question: "Did you keep heels flat during squats today?"
- Help: "No heel lift off ground. Lifting means tight calves/ankles - limits quad development."

See `js/modules/mobility-patterns.js` for complete definitions.

## Dynamic Limitation System

### Initial Setup

On first app load, copy defaults to localStorage:

```javascript
build_active_limitations = {
  lower_back_sensitive: ['45° Hyperextension', 'DB Romanian Deadlift', 'Hack Squat'],
  shoulder_stability: ['Face Pulls', 'Reverse Fly', 'Band Pull-Aparts', 'DB Shoulder Press']
}
```

### Graduation Process

After user proves recovery, remove exercise from limitation category:

```javascript
// After graduating 45° Hyperextension
build_active_limitations = {
  lower_back_sensitive: ['DB Romanian Deadlift', 'Hack Squat'],  // removed
  shoulder_stability: [...] // unchanged
}

// After all exercises graduate from category
build_active_limitations = {
  shoulder_stability: [...]
}
// lower_back_sensitive deleted entirely

// After overcoming all limitations
build_active_limitations = {}  // Empty - no limitations!
```

### New Limitations Emerge Dynamically

If new weakness patterns appear, the system creates categories on demand:

```javascript
// User develops elbow pain + regression in curls
build_active_limitations = {
  elbow_stability: ['DB Hammer Curls']  // Created automatically
}
```

## Trigger Conditions

Show mobility check when BOTH conditions met:

### Performance Regression (25%+ drop)

```javascript
const twoSessionsAgo = history[history.length - 2];
const lastSession = history[history.length - 1];

const weightDropped = lastSession.avgWeight < twoSessionsAgo.avgWeight;
const repDropped = (lastSession.avgReps / twoSessionsAgo.avgReps) < 0.75;

performanceRegression = weightDropped || repDropped;
```

**Requires:** 2+ workout sessions in history

### Pain Pattern (2+ reports in last 4 workouts)

```javascript
const painHistory = getPainHistory(exerciseKey);
const recentPain = painHistory.slice(-4);
const painCount = recentPain.filter(p => p.level > 0).length;

painPattern = painCount >= 2;
```

**Trigger check:** `performanceRegression && painPattern`

## Exit Conditions

Stop showing mobility check when BOTH conditions met:

### Condition 1: 3+ Consecutive "Yes" Responses

```javascript
const responses = getMobilityChecks(criteriaKey);
const recentYes = responses.slice(-3).every(r => r.response === 'yes');
```

### Condition 2: Performance Stabilized (2+ sessions)

```javascript
const lastTwo = history.slice(-2);
const stable = lastTwo[1].avgWeight >= lastTwo[0].avgWeight ||
               lastTwo[1].avgReps >= lastTwo[0].avgReps;
```

**Stop showing:** `recentYes && stable`

## Graduation from Limitation Categories

Exercises graduate from default limitation categories after proving full recovery.

### Graduation Criteria

Remove exercise from limitation when BOTH met:

1. **No pain in last 8 workouts** (2 complete rotation cycles)
2. **Weight increased 2+ times** in those 8 sessions (shows progress trend)

### Graduation Tracking

```javascript
build_limitation_graduations = [
  {
    exercise: '45° Hyperextension',
    category: 'lower_back_sensitive',
    graduatedDate: '2026-03-15',
    sessionsToGraduate: 8,
    finalWeight: 0
  }
]
```

**Purpose:** Analytics and motivation. User can see conquered weaknesses.

**Effect:** Exercise removed from active limitation category permanently. Future issues treated as acute (injury/fatigue), not chronic weakness.

## Edge Cases

### First Workout (No History)

**Problem:** Cannot detect regression with 0-1 sessions
**Solution:** Default limitations show checks immediately (form self-assessment). Dynamic limitations need 2+ sessions to trigger.

### Deload Week

**Problem:** Performance drops intentionally
**Solution:** Mobility checks still run. They assess form quality, not performance. "Can you keep heels flat?" doesn't change whether using 20kg or 15kg.

### Exercise Removed from Workouts

**Problem:** User stops doing Face Pulls after graduating
**Solution:** Limitation data stays in localStorage but has no effect. If user restarts Face Pulls later, system remembers graduation.

### Data Corruption

**Problem:** localStorage cleared or corrupted
**Solution:** All analyzer methods return safe defaults (null/false) on missing data. App doesn't crash, just skips checks.

### Multiple Patterns Match

**Problem:** 45° Hyperextension is both `hip_hinge` AND `lower_back_sensitive`
**Solution:** Show check for highest priority pattern only (active limitations > movement patterns). One check per exercise per workout.

## Implementation Checklist

### Files to Create

**1. `js/modules/mobility-patterns.js`** (~150 lines)
- Export MOVEMENT_PATTERNS object
- Export MOBILITY_CHECKS object
- Export DEFAULT_LIMITATIONS object
- Helper: `getPatternForExercise(exerciseName)`

**2. `js/modules/mobility-check-analyzer.js`** (~250 lines)
- Class MobilityCheckAnalyzer
- shouldShowMobilityCheck(exerciseKey)
- checkGraduation(exerciseKey, category)
- detectRegressionPattern(history, painHistory)
- updateActiveLimitations(exerciseKey, category)

### Files to Modify

**3. `js/app.js`**
- Import MobilityCheckAnalyzer and mobility-patterns
- Modify showMobilityCheckIfNeeded() to use analyzer (line 2610)
- Initialize active limitations on first run
- Remove hardcoded mobility checks object (lines 2612-2628)

**4. `js/utils/storage-manager.js`**
- Add getActiveLimitations()
- Add saveActiveLimitations()
- Add getGraduations()
- Add saveGraduation()

**5. `index.html`**
- Remove "Not Sure" button from mobility modal
- Keep only Yes/No buttons

## Testing Strategy

### Unit Tests (Manual)

- Test regression detection with mock history data
- Test graduation criteria with mock responses
- Test pattern matching for all 26 exercises
- Verify priority ordering for multiple patterns

### Integration Tests

- Fresh install: defaults populate correctly
- Graduation flow: exercise removed from limitation
- Multiple patterns: correct priority shown
- Empty limitations: no checks shown
- Deload: checks still appear (don't skip)

### User Acceptance

- Perform 8 workouts for one limitation exercise
- Verify check appears when triggered (regression + pain)
- Verify check stops after graduation (3 yes + stable)
- Verify category deleted when all exercises graduate

## Data Structures

### localStorage Keys

```javascript
// Active limitations (evolves over time)
build_active_limitations = {
  lower_back_sensitive: ['45° Hyperextension', 'DB Romanian Deadlift'],
  shoulder_stability: ['Face Pulls', 'Reverse Fly']
}

// Graduation history (for analytics)
build_limitation_graduations = [
  {
    exercise: '45° Hyperextension',
    category: 'lower_back_sensitive',
    graduatedDate: '2026-03-15',
    sessionsToGraduate: 8,
    finalWeight: 0
  }
]

// Mobility check responses (existing)
build_mobility_checks_{criteriaKey} = [
  { date: '2026-02-11', response: 'yes' },
  { date: '2026-02-13', response: 'no' }
]
```

## MobilityCheckAnalyzer API

```javascript
class MobilityCheckAnalyzer {
  constructor(storageManager) {
    this.storage = storageManager;
  }

  /**
   * Should this exercise show a mobility check?
   * @param {string} exerciseKey - Full exercise key (e.g., "UPPER_A - Bench Press")
   * @returns {Object} { show: boolean, pattern: string, criteriaKey: string, question: string, help: string }
   */
  shouldShowMobilityCheck(exerciseKey) {
    // Check if exercise in active limitations
    // OR check if triggers met (regression + pain)
    // Return check config or null
  }

  /**
   * Check if exercise has graduated from a limitation
   * @param {string} exerciseKey
   * @param {string} category - Limitation category
   * @returns {boolean} True if graduated
   */
  checkGraduation(exerciseKey, category) {
    // Check 8 pain-free sessions + 2+ weight increases
    // Return true/false
  }

  /**
   * Get the mobility check config for an exercise
   * @param {string} exerciseKey
   * @returns {Object|null} Check config or null
   */
  getMobilityCheckConfig(exerciseKey) {
    // Look up pattern for exercise
    // Return { question, help, criteriaKey }
  }
}
```

## Integration Points

### In renderExercises() (line ~589)

```javascript
// After getting exercise history and pain data
const mobilityAnalyzer = new MobilityCheckAnalyzer(this.storage);
const mobilityCheckConfig = mobilityAnalyzer.getMobilityCheckConfig(exerciseKey);
```

### In handleLogSet() (after logging set)

```javascript
// After set is logged
const shouldShow = mobilityAnalyzer.shouldShowMobilityCheck(exerciseKey);
if (shouldShow.show) {
  this.showMobilityCheckIfNeeded(exerciseKey, shouldShow);
}
```

## Future Work

### Exercise Progression Pathways

Graduation data enables exercise progression unlocking:
- Graduating from `lower_back_sensitive` → unlock barbell deadlift progression
- Graduating from `shoulder_stability` → unlock overhead barbell press
- Track progression trees: DB → Barbell → Advanced variations

**Note:** This is a separate feature. Design after completing dynamic mobility checks.

### Analytics Dashboard

Show limitation history:
- Timeline of graduations
- Sessions to overcome each weakness
- Current active limitations
- Motivation metric: "Conquered 2 of 2 initial weaknesses"

## Success Metrics

**User benefits:**
- Checks appear only when needed (no spam)
- System adapts to user's development
- Permanent record of overcome weaknesses
- No manual configuration required

**Technical benefits:**
- No hardcoded exercise lists
- Active limitations stored in user data, not code
- Read-only analyzer pattern (like PerformanceAnalyzer)
- Graceful degradation on errors

## Design Validation

All design decisions validated through user Q&A:
- Trigger sensitivity: Conservative (Option A - both regression + pain)
- Exit criteria: Stable performance (Option B - 2+ sessions not dropping)
- Pattern mapping: Movement directions (Option C - hybrid specialized + patterns)
- Graduation threshold: Evidence-based (Option C - 8 sessions + 2 increases)
- Limitation tracking: Dynamic (fully adaptive, no dead code)
- UI simplification: Binary choice (removed "Not Sure" button)

## Dependencies

- Existing PerformanceAnalyzer (for regression detection logic)
- Existing storage-manager.js (for pain and history data)
- Existing mobility modal UI (modify to remove one button)

## Timeline Estimate

- mobility-patterns.js: 2 hours
- mobility-check-analyzer.js: 4 hours
- app.js modifications: 2 hours
- storage-manager.js additions: 1 hour
- Testing: 2 hours
- **Total: ~11 hours**

## Next Steps

1. Write implementation plan (superpowers:writing-plans)
2. Create isolated workspace (superpowers:using-git-worktrees)
3. Execute implementation (superpowers:executing-plans)
4. Manual testing with real workout data
5. Commit and push

---

**Design Status:** ✅ Complete and Validated
**Ready for Implementation:** Yes
**Approved by:** User (2026-02-11)
