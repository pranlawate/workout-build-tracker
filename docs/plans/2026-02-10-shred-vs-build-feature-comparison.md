# SHRED vs BUILD Tracker - Feature Comparison

**Date:** 2026-02-10
**Purpose:** Identify SHRED features that could enhance BUILD Tracker while maintaining BUILD's approach

## Executive Summary

**SHRED Tracker Focus:** BWS Phase 1/2 program, Google Sheets integration, exercise alternatives
**BUILD Tracker Focus:** Upper/Lower split, localStorage, progression automation, analytics

**Key Finding:** SHRED has 5 valuable features that would benefit BUILD while keeping BUILD's philosophy intact.

---

## Feature Comparison Matrix

| Feature Category | SHRED | BUILD | Should ADD to BUILD? |
|-----------------|-------|-------|---------------------|
| **Data Storage** | Google Sheets (cloud) | localStorage (local) | ❌ NO - Privacy-first |
| **Progression Tracking** | Manual + alerts | Automated double progression | ✅ BUILD better |
| **Exercise Alternatives** | ✅ Extensive database | ❌ None | ✅ **YES - Priority 1** |
| **Tempo Progression** | ✅ Guided workflow | ❌ Not tracked | ✅ **YES - Priority 2** |
| **RPE Guide** | ✅ In-app modal | ❌ None | ✅ **YES - Priority 3** |
| **Plate Calculator** | ✅ Interactive tool | ❌ None | ⚠️ Maybe - Low priority |
| **Weekly View** | ✅ 7-day navigation | ❌ Workout-by-workout | ❌ NO - Different approach |
| **Detailed Steps** | ✅ Collapsible per exercise | ❌ Only warmup | ⚠️ Maybe - Could add |
| **Plateau Detection** | ✅ Manual (3+ workouts) | ✅ Automated (performance analyzer) | ✅ BUILD better |
| **Deload System** | Manual suggestion | ✅ Automated trigger | ✅ BUILD better |
| **Pain Tracking** | ❌ None | ✅ Post-workout modal | ✅ BUILD better |
| **Body Weight Tracking** | ❌ None | ✅ Weekly weigh-in | ✅ BUILD better |
| **Analytics Dashboard** | ❌ None | ✅ Volume/performance/recovery | ✅ BUILD better |

---

## 🎯 TOP 5 FEATURES TO ADD TO BUILD

### 1. Exercise Alternatives System 🔴 HIGH VALUE

**What SHRED has:**
- Dropdown selector per exercise (Current/Easier/Harder/Alternate)
- Extensive alternatives database with explanations
- Saves user preferences in localStorage
- Video links for each alternative

**Why BUILD needs this:**
```
User scenario:
- Shoulder pain during DB Bench Press
- Currently: No alternative, skip exercise or do it anyway
- With alternatives: Switch to Floor Press (easier) or Cable Chest Fly (alternate)
```

**BUILD-specific implementation:**

**Storage structure:**
```javascript
// localStorage key: build_exercise_alternates
{
  "UPPER_A - DB Flat Bench Press": {
    "selected": "Floor Press",
    "category": "easier",
    "reason": "shoulder pain"
  }
}
```

**UI Integration:**
- Add dropdown next to exercise name in workout screen
- Options: Current | Easier | Harder | Alternate
- Modal shows alternatives with reasons to choose
- Preference saved and persists

**Alternatives Database (Example for BUILD exercises):**

**DB Flat Bench Press:**
- **Easier:** Floor Press (reduced ROM, safer shoulders), Incline Push-Ups (bodyweight progression)
- **Harder:** Paused Bench Press (2-sec pause), Slow Tempo (3-sec eccentric)
- **Alternate:** Cable Chest Press, DB Incline Press (different angle)

**DB Lateral Raises:**
- **Easier:** Seated Lateral Raises (more stable), Band Lateral Raises (constant tension)
- **Harder:** Lean-Away Cable Laterals (more ROM), Paused Raises (2-sec hold at top)
- **Alternate:** Upright Rows (compound alternative), Face Pulls (rear delt emphasis)

**Implementation Effort:** MEDIUM
**Impact:** HIGH - Injury prevention, program adherence
**Priority:** 1

---

### 2. Tempo Progression System 🟡 MEDIUM VALUE

**What SHRED has:**
- Tempo progression as bridging strategy for weight gaps
- Guided workflow: Normal → Eccentric focus → Pause reps
- Beginner-specific (2.5kg → 5kg dumbbell gap)

**Why BUILD needs this:**

BUILD users face the same dumbbell gap problem:
- 2.5kg → 5kg = 100% increase
- 7.5kg → 10kg = 33% increase
- 10kg → 12.5kg = 25% increase (if gym has 12.5kg)

**Current BUILD progression:**
- Reps: 8 → 9 → 10 → 11 → 12
- Weight: 10kg → 12.5kg (only option)
- **Gap:** If user hits 12 reps at 10kg but can't do 8 reps at 12.5kg, they're stuck

**SHRED's solution:**
```
Week 1-2: 10kg × 12 reps (normal tempo: 1-0-1)
Week 3-4: 10kg × 12 reps (slow eccentric: 1-0-3)
Week 5-6: 10kg × 12 reps (pause at bottom: 1-2-3)
Week 7: 12.5kg × 8 reps (normal tempo: 1-0-1)
```

**BUILD implementation:**

**Add tempo field to set logging:**
```javascript
{
  weight: 10,
  reps: 12,
  rir: 2,
  tempo: "normal" // or "eccentric" or "paused"
}
```

**Progression logic update:**
```javascript
// Current
if (reps >= topOfRange && canIncreaseWeight) {
  suggest: increaseWeight();
}

// Enhanced
if (reps >= topOfRange) {
  if (canIncreaseWeight) {
    suggest: increaseWeight();
  } else if (tempo === "normal") {
    suggest: tryEccentricTempo(); // 3-sec lowering
  } else if (tempo === "eccentric") {
    suggest: tryPausedReps(); // 2-sec pause
  } else {
    suggest: tryNextWeightUp(); // You're ready now!
  }
}
```

**UI changes:**
- Add tempo selector to set logging (optional, defaults to "normal")
- Show tempo progression suggestion in post-set feedback
- Track tempo in exercise history

**Implementation Effort:** MEDIUM
**Impact:** HIGH - Solves beginner progression plateau
**Priority:** 2

---

### 3. In-App RPE/RIR Guide 🟢 LOW EFFORT, HIGH VALUE

**What SHRED has:**
- "What is RPE?" button in settings
- Modal explaining RPE scale with examples
- Visual guide for beginners

**Why BUILD needs this:**

BUILD uses RIR (Reps In Reserve) = 10 - RPE
- RIR 2-3 = RPE 7-8 (target range)
- RIR 0-1 = RPE 9-10 (too close to failure)

**Current BUILD:** Users must already know RIR
**Problem:** New users don't understand the scale

**Implementation:**

**Add to settings screen:**
```html
<button class="action-btn" id="rir-guide-btn">
  📊 What is RIR?
</button>
```

**Modal content:**
```markdown
# Understanding RIR (Reps in Reserve)

RIR tells you how close to failure you are.

**RIR 0:** Complete failure, cannot do another rep
**RIR 1:** Could do 1 more rep if forced
**RIR 2-3:** Could do 2-3 more reps (TARGET ZONE ✅)
**RIR 4+:** Could do 4+ more reps (too easy)

## How to Estimate RIR

After your last rep, ask: "How many more could I do?"

Example:
- Bench Press: 10kg × 12 reps
- You finish rep 12 and think "I could do 2 more"
- Log as: RIR 2 ✅

## Why RIR 2-3?

- Stimulates muscle growth
- Avoids excessive fatigue
- Reduces injury risk
- Sustainable long-term

## Common Mistakes

❌ Training to failure (RIR 0) every set
❌ Leaving too much in the tank (RIR 5+)
✅ Consistent RIR 2-3 = optimal gains
```

**Implementation Effort:** LOW
**Impact:** MEDIUM - Better user education
**Priority:** 3

---

### 4. Plate Calculator (Optional) ⚪ LOW PRIORITY

**What SHRED has:**
- Interactive plate calculator
- User inputs target weight, sees plate configuration
- Useful for barbell exercises

**Why BUILD might need this:**

BUILD has Barbell Progression Tracker for:
- Barbell Bench Press
- Barbell Back Squat
- Barbell Deadlift

**Use case:**
- User wants to load 60kg on barbell
- Barbell = 20kg empty
- Needs: 60kg - 20kg = 40kg total → 20kg per side
- Plates: 10kg + 5kg + 2.5kg + 2.5kg = 20kg per side ✅

**Implementation:**
```html
<div id="plate-calculator-modal">
  <h2>Plate Calculator</h2>

  <label>Target Weight (kg):</label>
  <input type="number" id="target-weight" value="60">

  <label>Barbell Weight (kg):</label>
  <input type="number" id="barbell-weight" value="20">

  <div id="plate-result">
    <h3>Load per side: 20kg</h3>
    <div class="plates">
      <div class="plate red">10kg × 1</div>
      <div class="plate blue">5kg × 1</div>
      <div class="plate green">2.5kg × 2</div>
    </div>
  </div>
</div>
```

**Implementation Effort:** LOW
**Impact:** LOW - Nice to have, not essential
**Priority:** 5

---

### 5. Collapsible Detailed Steps (Optional) ⚪ LOW PRIORITY

**What SHRED has:**
- "📋 Steps" button per exercise
- Expands to show detailed form cues
- Collapsible to reduce screen clutter

**BUILD current state:**
- Form notes shown always (e.g., "Primary: Chest, Secondary: Front delts, triceps")
- Built with Science safety cues will make notes longer
- Risk of screen clutter

**Example (BUILD after safety updates):**

**Before:**
```
DB Flat Bench Press
Primary: Chest, Secondary: Front delts, triceps
```

**After (with safety cues):**
```
DB Flat Bench Press
Primary: Chest, Secondary: Front delts, triceps
FORM: Retract shoulder blades, elbows at 45°, controlled eccentric, avoid wide flare at bottom
```

**With collapsible steps:**
```
DB Flat Bench Press
Primary: Chest, Secondary: Front delts, triceps
[📋 Form Guide] ← Click to expand

[Expanded:]
FORM CUES:
• Retract shoulder blades before starting
• Keep elbows at 45° (not 90° flared)
• Control descent (2-3 seconds)
• Avoid dumbbells drifting too far apart
```

**Implementation Effort:** LOW
**Impact:** MEDIUM - Cleaner UI, better UX
**Priority:** 4

---

## Features NOT to Add (Keep BUILD's Philosophy)

### ❌ Google Sheets Integration

**SHRED approach:** Cloud sync, data in Google Sheets
**BUILD approach:** localStorage only, JSON export

**Why NOT:**
- Privacy-first philosophy (no external services)
- Zero dependencies (no API integrations)
- Offline-first (no internet required)
- GDPR compliance (data never leaves device)

**BUILD's solution is better:**
- JSON export for backup
- Import validation
- Full data portability
- No vendor lock-in

---

### ❌ Weekly Calendar View

**SHRED approach:** 7-day navigation (MON/TUE/WED/etc.)
**BUILD approach:** Next workout suggestion (rotation-based)

**Why NOT:**
- Different program philosophy
- SHRED: Fixed schedule (Monday = Upper, Tuesday = Lower)
- BUILD: Flexible rotation (next workout based on last completed)
- BUILD supports rest days better (doesn't assume schedule)

**BUILD's approach is better for:**
- Beginners with inconsistent schedules
- Users who can't train Mon/Wed/Fri/Sat
- Recovery-focused programming

---

### ❌ Exercise Video Hosting

**SHRED approach:** 69 exercise videos in repo
**BUILD approach:** External links to Built with Science

**Why NOT:**
- Repo size (SHRED = ~500MB+, BUILD = ~1MB)
- Copyright concerns (embedding videos)
- Maintenance burden (updating videos)
- Bandwidth costs

**BUILD's approach is better:**
- Lightweight repo
- Always up-to-date (links to official sources)
- No copyright issues
- Faster page loads

---

## Implementation Roadmap

### Phase 1: Exercise Alternatives (Week 1-2)
**Priority:** 1 - HIGH
**Effort:** MEDIUM

**Tasks:**
1. Create alternatives database for all 26 BUILD exercises
2. Add dropdown selector to exercise cards
3. Implement modal UI for alternatives
4. Add localStorage persistence
5. Update exercise display to show selected alternative
6. Test alternative switching workflow

**Deliverables:**
- `js/modules/exercise-alternatives.js` (database + logic)
- `css/exercise-alternatives.css` (modal styling)
- Updated `js/app.js` (integration)
- Documentation: User guide for alternatives

---

### Phase 2: Tempo Progression (Week 3)
**Priority:** 2 - MEDIUM
**Effort:** MEDIUM

**Tasks:**
1. Add tempo field to set data structure
2. Update progression logic to suggest tempo changes
3. Add tempo selector to set logging UI
4. Track tempo in exercise history
5. Show tempo in history charts
6. Update post-set feedback to mention tempo

**Deliverables:**
- Updated `js/modules/progression.js` (tempo logic)
- Updated `js/app.js` (tempo UI)
- Updated storage schema (backward compatible)

---

### Phase 3: RIR Guide + Plate Calculator (Week 4)
**Priority:** 3 - LOW
**Effort:** LOW

**Tasks:**
1. Create RIR guide modal content
2. Add "What is RIR?" button to settings
3. Implement plate calculator logic
4. Add plate calculator to settings
5. Style both modals

**Deliverables:**
- `js/modals/rir-guide-modal.js`
- `js/modals/plate-calculator-modal.js`
- CSS for modals

---

### Phase 4: Collapsible Form Cues (Optional)
**Priority:** 4 - LOW
**Effort:** LOW

**Tasks:**
1. Update exercise card UI with collapsible sections
2. Move form cues to expandable area
3. Add "📋 Form Guide" button
4. Implement expand/collapse animation
5. Save expanded state in localStorage

**Deliverables:**
- Updated `css/workout-screen.css`
- Updated `js/app.js` (collapse logic)

---

## Data Structure Changes

### Exercise Alternatives Storage

```javascript
// New localStorage key: build_exercise_alternates
{
  "UPPER_A - DB Flat Bench Press": {
    "selected": "Floor Press",
    "category": "easier",  // "easier" | "harder" | "alternate"
    "timestamp": "2026-02-10T10:30:00Z"
  },
  "UPPER_A - DB Lateral Raises": {
    "selected": "Lean-Away Cable Lateral Raises",
    "category": "alternate",
    "timestamp": "2026-02-10T11:00:00Z"
  }
}
```

### Tempo Tracking (Backward Compatible)

```javascript
// Current set structure
{
  weight: 10,
  reps: 12,
  rir: 2
}

// Enhanced (optional tempo field)
{
  weight: 10,
  reps: 12,
  rir: 2,
  tempo: "eccentric"  // "normal" | "eccentric" | "paused" | undefined
}

// Backward compatible: If tempo is undefined, assume "normal"
```

---

## Alternatives Database Structure

```javascript
// js/modules/exercise-alternatives.js

export const EXERCISE_ALTERNATIVES = {
  "DB Flat Bench Press": {
    easier: [
      {
        name: "Floor Press",
        reason: "Reduced ROM, safer for shoulders, easier to bail",
        equipment: "Dumbbells + floor mat",
        video: "https://builtwithscience.com/floor-press"
      },
      {
        name: "Incline Push-Ups",
        reason: "Bodyweight regression, builds pressing strength",
        equipment: "Bench or elevated surface",
        video: "https://builtwithscience.com/incline-pushup"
      }
    ],
    harder: [
      {
        name: "Paused Bench Press",
        reason: "2-sec pause at bottom, builds strength off chest",
        equipment: "Dumbbells",
        video: "https://builtwithscience.com/paused-press"
      },
      {
        name: "Slow Tempo Press",
        reason: "3-sec eccentric, increases time under tension",
        equipment: "Dumbbells",
        video: "https://builtwithscience.com/tempo-press"
      }
    ],
    alternate: [
      {
        name: "Cable Chest Press",
        reason: "Constant tension, different resistance curve",
        equipment: "Cable machine",
        video: "https://builtwithscience.com/cable-chest-press"
      },
      {
        name: "DB Incline Press",
        reason: "Upper chest emphasis, different angle",
        equipment: "Dumbbells + incline bench",
        video: "https://builtwithscience.com/incline-press"
      }
    ]
  }
  // ... repeat for all 26 BUILD exercises
};
```

---

## UI Mockups

### Exercise Alternative Selector

```
┌─────────────────────────────────────────┐
│ E1: DB Flat Bench Press    [▼ Current] │
│ 3 sets × 8-12 reps                     │
│ RIR: 2-3                               │
│                                        │
│ [Dropdown menu:]                       │
│ ✓ Current - DB Flat Bench Press       │
│   Easier - Beginner/Injury Options    │
│   Harder - Advanced Progressions      │
│   Alternate - Different Exercises     │
└─────────────────────────────────────────┘

[User selects "Easier":]

┌─────────────────────────────────────────┐
│         Choose Easier Variation         │
├─────────────────────────────────────────┤
│                                        │
│ ○ Floor Press                          │
│   Reduced ROM, safer for shoulders     │
│   Equipment: Dumbbells + floor mat     │
│   [🎥 Watch Video]                     │
│                                        │
│ ○ Incline Push-Ups                     │
│   Bodyweight progression               │
│   Equipment: Bench or elevated surface│
│   [🎥 Watch Video]                     │
│                                        │
│ [CANCEL]              [SELECT]         │
└─────────────────────────────────────────┘
```

### Tempo Selector (Set Logging)

```
┌─────────────────────────────────────────┐
│ Set 1: DB Flat Bench Press             │
├─────────────────────────────────────────┤
│ Weight: [10▲▼] kg                      │
│ Reps:   [12▲▼]                         │
│ RIR:    [2▼]                           │
│                                        │
│ Tempo:  [○ Normal  ○ Slow  ○ Paused]  │
│                                        │
│         [LOG SET]                      │
└─────────────────────────────────────────┘
```

---

## Testing Plan

### Exercise Alternatives
- [ ] Select easier alternative, verify persistence
- [ ] Switch back to original, verify exercise restored
- [ ] Complete workout with alternate, verify history
- [ ] Export/import data with alternates, verify integrity

### Tempo Progression
- [ ] Log set with "normal" tempo
- [ ] Log set with "eccentric" tempo
- [ ] Log set with "paused" tempo
- [ ] Verify progression suggestions based on tempo
- [ ] Check history display shows tempo correctly

### RIR Guide
- [ ] Open guide modal from settings
- [ ] Verify content displays correctly
- [ ] Close modal, verify clean dismissal

### Plate Calculator
- [ ] Input 60kg target, 20kg bar
- [ ] Verify correct plate configuration shown
- [ ] Try various weights (40kg, 80kg, 100kg)
- [ ] Verify edge cases (odd weights, fractional plates)

---

## Summary

**Worth Adding to BUILD:**
1. ✅ Exercise Alternatives System (Priority 1)
2. ✅ Tempo Progression Tracking (Priority 2)
3. ✅ RIR/RPE Guide Modal (Priority 3)
4. ⚠️ Plate Calculator (Priority 5 - optional)
5. ⚠️ Collapsible Form Cues (Priority 4 - optional)

**Keep BUILD's Approach:**
- ❌ No Google Sheets integration (privacy-first)
- ❌ No weekly calendar (rotation-based is better)
- ❌ No exercise videos in repo (lightweight)

**Total Effort:** 3-4 weeks for all features
**Total Impact:** HIGH - Addresses injury prevention, progression plateaus, user education

**Next Step:** Decide which features to implement first based on user needs.
